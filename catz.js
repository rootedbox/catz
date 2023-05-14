import fs from 'fs';
import os from 'os';
import hljs from 'highlight.js';
import { decodeHTML } from 'entities';
import { colorMapping } from './colors.js';
import readline from 'readline';
import process from 'process';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import git from 'simple-git';
import rc from 'rc';
import path from 'path';
import ini from 'ini';
import inquirer from 'inquirer';

async function getUncommittedLines(filePath) {
    const simpleGit = git();
    const fileStatus = await simpleGit.diff(['--unified=0', filePath]);

    const lineRegex = /^@@ -(\d+)(?:,\d+)? \+(\d+),(\d+)/gm;
    const uncommittedLines = [];
    let match;

    while ((match = lineRegex.exec(fileStatus)) !== null) {
        const startLine = parseInt(match[2], 10);
        const numLines = parseInt(match[3], 10);

        for (let i = 0; i < numLines; i++) {
            uncommittedLines.push(startLine + i);
        }
    }

    return uncommittedLines;
}

function readArrowKeys() {
    return new Promise((resolve) => {
        readline.emitKeypressEvents(process.stdin);
        if (process.stdin.isTTY) {
            process.stdin.setRawMode(true);
        }

        process.stdin.on('keypress', function onKeypress(_, key) {
            if (key && (key.name === 'up' || key.name === 'down' || key.name === 'return' || key.name === 'q' || key.name === 'escape' || key.name === 'space')) {
                process.stdin.removeListener('keypress', onKeypress);
                if (process.stdin.isTTY) {
                    process.stdin.setRawMode(false);
                }
                resolve(key.name);
            }
        });
    });
}

async function processLines(lines, options) {
    let { lineNumbers, showTabs, squeezeBlank } = options;
    const totalLines = lines.length;

    lines = lines
        .map((line, index) => {
            if (squeezeBlank && /^\s*$/.test(line)) {
                return null;
            }

            const lineNumberWidth = totalLines.toString().length;
            const paddedLineNumber = String(index + 1).padStart(lineNumberWidth, ' ');

            if (showTabs) {
                line = line.replace(/\t/g, '🐈');
            }

            return lineNumbers ? `${paddedLineNumber}: ${line}` : line;
        });

    if(squeezeBlank) {
        lines = lines.filter(Boolean);
    }

    return lines.join('\n');
}

async function paginateOutput(terminalHighlightedCode) {
    const terminalLines = terminalHighlightedCode.split('\n');
    let currentIndex = 0;

    const pageSize = process.stdout.rows - 1;

    while (currentIndex < terminalLines.length) {
        console.clear();
        const page = terminalLines.slice(currentIndex, currentIndex + pageSize).join('\n');
        console.log(page);

        if (currentIndex + pageSize >= terminalLines.length) {
            process.exit(0);
        }

        const statusBarText = `Line: ${currentIndex + 1}/${terminalLines.length}`;
        process.stdout.write(`\x1b[7m${statusBarText.padEnd(process.stdout.columns)}\x1b[0m`);

        const userInput = await readArrowKeys();

        if (userInput === 'up' && currentIndex > 0) {
            currentIndex -= 1;
        } else if (userInput === 'down' || userInput === 'return') {
            currentIndex += 1;
        } else if (userInput === 'space') {
            currentIndex += pageSize;
        } else if (userInput === 'q' || userInput === 'escape') {
            process.exit(0);
        }
    }
}

function applyGitChanges(terminalHighlightedCode, uncommittedLines, noHighlighting) {
    return terminalHighlightedCode.split('\n').map((line, index) => {
        if (noHighlighting) {
            const gitColumnBgColor = '\x1b[48;5;238m'; // Grey background
            const gitPlusColor = '\x1b[31m'; // Red color
            const resetColor = '\x1b[0m'; // Reset color

            if (uncommittedLines.includes(index + 1)) {
                line = `${gitColumnBgColor}${gitPlusColor}+${resetColor}${gitColumnBgColor}${resetColor} ${line}`;
            } else {
                line = `  ${line}`;
            }
        } else {
            if (uncommittedLines.includes(index + 1)) {
                line = `+ ${line}`;
            } else {
                line = `  ${line}`;
            }
        }
        return line;
    }).join('\n');
}

async function displayFileWithSyntaxHighlighting(options) {
    let { filePath, pagination, lineNumbers, noHighlighting, showEnds, squeezeBlank, showTabs, git } = options;

    try {
        let data = await fs.promises.readFile(filePath, 'utf-8');

        let uncommittedLines = [];
        if (git) {
            uncommittedLines = await getUncommittedLines(filePath);
        }

        const lines = data.split('\n');

        const highlightedCode = noHighlighting ? hljs.highlightAuto(data).value : data;

        let terminalHighlightedCode = noHighlighting
            ? highlightedCode
                .replace(/<span class="([^"]+)">/g, (_, className) => {
                    const colorCode = colorMapping[className];
                    return colorCode || '';
                })
                .replace(/<\/span>/g, () => '\x1b[0m') // reset color
                .replace(/&[^;]+;/g, (entity) => decodeHTML(entity))
            : data;

        if (showEnds) {
            terminalHighlightedCode = terminalHighlightedCode.split('\n').map((line) => {
                const endSymbol = noHighlighting ? '\x1b[48;5;238m\x1b[31m$\x1b[0m' : '$';
                line = `${line}${endSymbol}`;
                return line;
            }).join('\n');
        }

        if (git) {
            terminalHighlightedCode = applyGitChanges(terminalHighlightedCode, uncommittedLines, noHighlighting);
        }

        terminalHighlightedCode = await processLines(terminalHighlightedCode.split('\n'), { lineNumbers, showTabs, squeezeBlank });

        if (pagination) {
            await paginateOutput(terminalHighlightedCode);
        } else {
            console.log(terminalHighlightedCode);
        }
    } catch (err) {
        console.error('Error reading file:', err.message);
    }
}

const configFilePath = path.join(os.homedir(), '.catzrc');

const defaultConfig = {
    paginate: false,
    'show-ends': false,
    'line-numbers': false,
    'squeeze-blank': false,
    git: false,
    'show-tabs': false,
    highlighting: true
};

async function runWizard() {
    console.log("🎉 Welcome to catz! 🐈\n");
    console.log("🧙‍♂️ This wizard will help you purrfectly set up your default configuration. 🧙‍♂️\n");

    const questions = [
        {
            type: 'confirm',
            name: 'paginate',
            message: 'Would you like to paginate the output by default? 📄➡️📄',
            default: false
        },
        {
            type: 'confirm',
            name: 'show-ends',
            message: 'Would you like to display $ at the end of each line by default? 🐾',
            default: false
        },
        {
            type: 'confirm',
            name: 'line-numbers',
            message: 'Would you like to show line numbers by default? 🐈🔢',
            default: false
        },
        {
            type: 'confirm',
            name: 'squeeze-blank',
            message: 'Would you like to remove extra blank lines from the output by default? 🙀',
            default: false
        },
        {
            type: 'confirm',
            name: 'git',
            message: 'Would you like to enable Git integration by default? 🐈‍⬛⚙️',
            default: false
        },
        {
            type: 'confirm',
            name: 'show-tabs',
            message: 'Would you like to display 🐈 for each tab character by default? 😸',
            default: false
        },
        {
            type: 'confirm',
            name: 'highlighting',
            message: 'Would you like to enable syntax highlighting by default? 🌈',
            default: true
        },
    ];

    const answers = await inquirer.prompt(questions);

    fs.writeFileSync(configFilePath, ini.stringify(answers));

    console.log("✨ Your default configuration has been saved! Enjoy using catz! 😺✨\n");
}

if (!fs.existsSync(configFilePath)) {
    await runWizard();
}

const defaults = rc('catz', defaultConfig);

const argv = yargs(hideBin(process.argv))
    .option('paginate', {
        alias: 'p',
        type: 'boolean',
        description: 'Paginate the output',
        default: defaults.paginate,
    })
    .option('show-ends', {
        alias: 'e',
        type: 'boolean',
        description: 'Display $ at the end of each line',
        default: defaults['show-ends'],
    })
    .option('line-numbers', {
        alias: 'n',
        type: 'boolean',
        description: 'Show line numbers',
        default: defaults['line-numbers'],
    })
    .option('squeeze-blank', {
        alias: 's',
        type: 'boolean',
        description: 'Remove blank lines from the output',
        default: defaults['squeeze-blank'],
    })
    .option('git', {
        type: 'boolean',
        description: 'Enable Git integration',
        default: defaults.git,
    })
    .option('wizard', {
        alias: 'w',
        type: 'boolean',
        description: 'Run the configuration wizard',
    })
    .option('show-tabs', {
        alias: 't',
        type: 'boolean',
        description: 'Display 🐈 for each tab character',
        default: defaults['show-tabs'],
    })
    .option('highlighting', {
        type: 'boolean',
        default: defaults.highlighting,
        description: 'Enable syntax highlighting',
    })
    .boolean('highlighting')
    .help()
    .argv;

if (argv.wizard) {
    await runWizard().then(() => process.exit(0));
}

const filePath = argv._[0];
if (!filePath) {
    console.error('Please provide a file path as a command line argument.');
    process.exit(1);
}

displayFileWithSyntaxHighlighting({
    filePath,
    pagination: argv.paginate,
    lineNumbers: argv['line-numbers'],
    noHighlighting: argv.highlighting,
    showEnds: argv['show-ends'],
    squeezeBlank: argv['squeeze-blank'],
    git: argv['git'],
});
