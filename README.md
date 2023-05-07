# 🐾 Catz 🐾

Catz is a command-line tool for displaying text files with syntax highlighting, pagination, and optional line numbers. It is easy to use and provides a convenient way to view source code files on the terminal. 😺

## 🌟 Features

- Syntax highlighting with support for multiple programming languages 🌈
- Pagination with navigation using arrow keys, spacebar, and return 🔼🔽
- Optional line numbers 🔢
- Customizable display options through command-line arguments ⚙️

## 📦 Installation

1. Clone the repository to your local machine: `git clone https://github.com/rootedbox/catz.git`
2. Change directory into the project folder:
3. Install the necessary dependencies: `npm install`



## 🐱 Usage

To use Catz, simply run the command followed by the file path and any desired command-line options:

`node catz.js [options] <file_path>`


### 📝 Command-line options

- `--paginate` or `-p`: Enable pagination
- `--line-numbers` or `-n`: Show line numbers
- `--no-highlighting`: Disable syntax highlighting
- `--show-ends`: Show `$` at the end of each line

### 🐈 Examples

1. Display a file with syntax highlighting: `node catz.js path/to/your/code.js`
2. Display a file with pagination and line numbers: `node catz.js -p -n path/to/your/code.js`
3. Display a file without syntax highlighting and with line ends: `node catz.js --no-highlighting --show-ends path/to/your/code.js`



Enjoy using Catz! 🐾😸

