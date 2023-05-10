import fs from 'fs/promises';
import hljs from 'highlight.js';
import { decodeHTML } from 'entities';
import { colorMapping } from './colors.js';
import readline from 'readline';
import process from 'process';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import git from 'simple-git';
import rc from 'rc';

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
        let data = await fs.readFile(filePath, 'utf-8');

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


const defaults = rc('catz', {
    paginate: false,
    'show-ends': false,
    'line-numbers': false,
    'squeeze-blank': false,
    git: false,
    'show-tabs': false,
    highlighting: true
});

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
