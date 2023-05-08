import fs from 'fs/promises';
import hljs from 'highlight.js';
import { decodeHTML } from 'entities';
import { colorMapping } from './colors.js';
import readline from 'readline';
import process from 'process';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

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

async function displayFileWithSyntaxHighlighting(options) {
    let {filePath, pagination, lineNumbers, noHighlighting, showEnds, squeezeBlank} = options;

    try {
        let data = await fs.readFile(filePath, 'utf-8');

        const lines = data.split('\n');
        const totalLines = lines.length;

        data = lines
            .map((line, index) => {
                if (squeezeBlank && /^\s*$/.test(line)) {
                    return null;
                }

                const lineNumberWidth = totalLines.toString().length;
                const paddedLineNumber = String(index + 1).padStart(lineNumberWidth, ' ');

                return lineNumbers ? `${paddedLineNumber}: ${line}` : line;
            })
            .filter(Boolean)
            .join('\n');

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

        if (pagination) {
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
        } else {
            console.log(terminalHighlightedCode);
        }
    } catch (err) {
        console.error('Error reading file:', err.message);
    }
}


const argv = yargs(hideBin(process.argv))
    .option('paginate', {
        alias: 'p',
        type: 'boolean',
        description: 'Paginate the output',
    })
    .option('show-ends', {
        alias: 'e',
        type: 'boolean',
        description: 'Display $ at the end of each line',
    })
    .option('line-numbers', {
        alias: 'n',
        type: 'boolean',
        description: 'Show line numbers',
    })
    .option('squeeze-blank', {
        alias: 's',
        type: 'boolean',
        description: 'Remove blank lines from the output',
    })
    .option('highlighting', {
        type: 'boolean',
        default: true,
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
});


