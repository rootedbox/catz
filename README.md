# 🐾 Catz 🐾

Catz is a command-line tool for displaying text files with syntax highlighting, pagination, and optional line numbers. It is easy to use and provides a convenient way to view source code files on the terminal. 😺

## Features

- 📄 Display text files in the terminal
- 🎨 Syntax highlighting for supported languages
- 📑 Paginated view for long files
- 🔢 Line numbers
- 🔚 Show end of line character `$`
- 💨 Squeeze blank lines
- 🐈 Replace tabs with tabby cat emoji
- 🌟 Git integration: show uncommitted lines with a `+` symbol in a colored column
- 🎛️ Command line options for easy configuration


## 📦 Installation

1. Clone the repository to your local machine: `git clone https://github.com/rootedbox/catz.git`
2. Change directory into the project folder:
3. Install the necessary dependencies: `npm install`



## 🐱 Usage

To use Catz, simply run the command followed by the file path and any desired command-line options:

`node catz.js [options] <file_path>`


### 📝 Command-line options

- `-p, --paginate`: Paginate the output
- `-n, --line-numbers`: Show line numbers
- `-N, --no-highlighting`: Disable syntax highlighting
- `-e, --show-ends`: Display `$` at the end of each line
- `-s, --squeeze-blank`: Remove blank lines from the output
- `-t, --show-tabs`: Replace tabs with the tabby cat emoji 🐈
- `-g, --git`: Show uncommitted lines with a `+` symbol in a colored column

Use `--help` to see a list of available options and their descriptions.


### 🐈 Examples

1. Display a file with syntax highlighting: `node catz.js path/to/your/code.js`
2. Display a file with pagination and line numbers: `node catz.js -p -n path/to/your/code.js`
3. Display a file without syntax highlighting and with line ends: `node catz.js --no-highlighting --show-ends path/to/your/code.js`



Enjoy using Catz! 🐾😸

