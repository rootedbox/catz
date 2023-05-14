# 🐾 Catz 🐾

Catz is a command-line tool for displaying text files with syntax highlighting, pagination, and optional line numbers. It's easy to use, purrfect for viewing source code files on the terminal, and comes with a friendly wizard to guide you through the setup process. 😺

## Features

- 📄 Display text files in the terminal
- 🎨 Syntax highlighting for supported languages
- 📑 Paginated view for long files
- 🔢 Line numbers
- 🔚 Show end of line character `$`
- 💨 Squeeze blank lines
- 🐈 Replace tabs with a cute tabby cat emoji
- 🌟 Git integration: show uncommitted lines with a `+` symbol in a colored column
- 🎛️ Command line options for easy configuration
- 🧙‍♂️ Friendly setup wizard: personalizes Catz to your liking!

## 📦 Installation

1. Clone the repository to your local machine: `git clone https://github.com/rootedbox/catz.git`
2. Change directory into the project folder: `cd catz`
3. Install the necessary dependencies: `npm install`

## 🐱 Usage

To use Catz, simply run the command followed by the file path and any desired command-line options:

`node catz.js [options] <file_path>`

If you're using Catz for the first time or want to change your default configuration, run the friendly setup wizard with the `-w` or `--wizard` option. The wizard will guide you through the setup process and help you personalize Catz to your liking:

`node catz.js --wizard`

### 📝 Command-line options

- `-p, --paginate`: Paginate the output
- `-n, --line-numbers`: Show line numbers
- `-N, --no-highlighting`: Disable syntax highlighting
- `-e, --show-ends`: Display `$` at the end of each line
- `-s, --squeeze-blank`: Remove blank lines from the output
- `-t, --show-tabs`: Replace tabs with the tabby cat emoji 🐈
- `-g, --git`: Show uncommitted lines with a `+` symbol in a colored column
- `-w, --wizard`: Run the setup wizard to personalize your Catz configuration

Use `--help` to see a list of available options and their descriptions.

### 🐈 Examples

1. Display a file with syntax highlighting: `node catz.js path/to/your/code.js`
2. Display a file with pagination and line numbers: `node catz.js -p -n path/to/your/code.js`
3. Display a file without syntax highlighting and with line ends: `node catz.js --no-highlighting --show-ends path/to/your/code.js`

## 📖 Configuration File

Catz uses a configuration file named `.catzrc` located in your home directory to save your default configuration. This file is created and updated by the setup wizard. If you want to manually change your default configuration, you can edit this file directly.

Enjoy using Catz! 🐾😸
