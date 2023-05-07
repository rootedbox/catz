// Console color constants
export const RESET = '\x1b[0m';
export const BOLD = '\x1b[1m';
export const ITALIC = '\x1b[3m';
export const DIM = '\x1b[2m';
export const RED = '\x1b[31m';
export const GREEN = '\x1b[32m';
export const YELLOW = '\x1b[33m';
export const BLUE = '\x1b[34m';
export const MAGENTA = '\x1b[35m';
export const CYAN = '\x1b[36m';

// Highlight.js class constants
const KEYWORD = 'hljs-keyword';
const BUILT_IN = 'hljs-built_in';
const TYPE = 'hljs-type';
const LITERAL = 'hljs-literal';
const NUMBER = 'hljs-number';
const STRING = 'hljs-string';
const REGEXP = 'hljs-regexp';
const SYMBOL = 'hljs-symbol';
const VARIABLE = 'hljs-variable';
const TEMPLATE_VARIABLE = 'hljs-template-variable';
const ATTR = 'hljs-attr';
const ATTRIBUTE = 'hljs-attribute';
const FUNCTION = 'hljs-function';
const TITLE = 'hljs-title';
const STRONG = 'hljs-strong';
const EMPHASIS = 'hljs-emphasis';
const LINK_LABEL = 'hljs-link_label';
const LINK_URL = 'hljs-link_url';
const LIST = 'hljs-list';
const QUOTE = 'hljs-quote';
const CODE = 'hljs-code';
const CODE_BLOCK = 'hljs-code-block';

// Color Mapping object
export const colorMapping = {
    [KEYWORD]: BLUE,
    [BUILT_IN]: CYAN,
    [TYPE]: YELLOW,
    [LITERAL]: YELLOW,
    [NUMBER]: YELLOW,
    [STRING]: GREEN,
    [REGEXP]: GREEN,
    [SYMBOL]: GREEN,
    [VARIABLE]: RED,
    [TEMPLATE_VARIABLE]: RED,
    [ATTR]: MAGENTA,
    [ATTRIBUTE]: MAGENTA,
    [FUNCTION]: BLUE,

    // Markdown-specific styles
    [TITLE]: BOLD,
    [STRONG]: BOLD,
    [EMPHASIS]: ITALIC,
    [LINK_LABEL]: BLUE,
    [LINK_URL]: CYAN,
    [LIST]: YELLOW,
    [QUOTE]: DIM,
    [CODE]: GREEN,
    [CODE_BLOCK]: GREEN,
};
