export type ToolCategory = 'write' | 'convert' | 'inspect' | 'design';

export const toolCategories: ToolCategory[] = ['write', 'convert', 'inspect', 'design'];

export const categoryLabels: Record<ToolCategory, string> = {
  write: 'Write',
  convert: 'Convert',
  inspect: 'Inspect',
  design: 'Design'
};

export const categoryDescriptions: Record<ToolCategory, string> = {
  write: 'Draft, format, generate, and reshape writing and code snippets.',
  convert: 'Transform text, markup, hashes, data formats, and encoded values.',
  inspect: 'Validate, compare, count, search, and understand text or data.',
  design: 'Pick colors, fonts, icons, gradients, symbols, and visual assets.'
};

export function categoryHref(category: ToolCategory): string {
  return `/categories/${category}.html`;
}

export interface ToolMeta {
  id: string;
  name: string;
  href: string;
  category: ToolCategory;
  description: string;
  status: 'ready' | 'planned';
}

export const tools: ToolMeta[] = [
  {
    id: 'case-converter',
    name: 'Case Converter',
    href: '/case-converter.html',
    category: 'convert',
    description: 'Convert text between uppercase, lowercase, title case, sentence case, and slug formats.',
    status: 'ready'
  },
  {
    id: 'clock-face',
    name: 'Clock Face Generator',
    href: '/clock-face.html',
    category: 'design',
    description: 'Generate an SVG of an analog clock. Interactively drag hands to set the time.',
    status: 'ready'
  },
  {
    id: 'code-snippets',
    name: 'Code Snippets & Templates',
    href: '/code-snippets.html',
    category: 'write',
    description: 'Pick from reusable code snippets for common programming tasks.',
    status: 'ready'
  },
  {
    id: 'color-chooser',
    name: 'Color Chooser',
    href: '/color-chooser.html',
    category: 'design',
    description: 'Pick named HTML colors by family, use the eyedropper or color picker, get CSS/HTML/hex output, find the closest named color, and generate solid-color PNGs.',
    status: 'ready'
  },
  {
    id: 'color-combinations',
    name: 'Color Combinations Tool',
    href: '/color-combinations.html',
    category: 'design',
    description: 'Generate harmonious color palettes — monochromatic, analogous, triadic, complementary, and split-complementary — from any base color.',
    status: 'ready'
  },
  {
    id: 'css-gradient-generator',
    name: 'CSS Gradient Generator',
    href: '/css-gradient-generator.html',
    category: 'design',
    description: 'Visually create linear, radial, and conic CSS gradients. Drag color stops, copy code, or download PNG.',
    status: 'ready'
  },
  {
    id: 'css-unit-converter',
    name: 'CSS Unit Converter',
    href: '/css-unit-converter.html',
    category: 'design',
    description: 'Convert between various CSS units based on context values like root font size and viewport dimensions.',
    status: 'ready'
  },
  {
    id: 'curly-quoter',
    name: 'Curly Quoter',
    href: '/curly-quoter.html',
    category: 'convert',
    description: 'Convert straight quotes to curly quotes and back for various languages.',
    status: 'ready'
  },
  {
    id: 'font-awesome-chooser',
    name: 'Font Awesome Chooser',
    href: '/font-awesome-chooser.html',
    category: 'design',
    description: 'Browse Font Awesome 6 icons by category and style. Click any icon to get usage code for HTML, CSS, React, Vue, Angular, C#, Python, PHP, and more.',
    status: 'ready'
  },
  {
    id: 'font-chooser',
    name: 'Font Chooser',
    href: '/font-chooser.html',
    category: 'design',
    description: 'Preview and select fonts with Google Fonts integration, accessibility checking, and production-ready CSS generation.',
    status: 'ready'
  },
  {
    id: 'google-icons-chooser',
    name: 'Google Icons Chooser',
    href: '/google-icons-chooser.html',
    category: 'design',
    description: 'Browse Google Material Symbols. Customize styles, fill, weight, and optical size. Click any icon to get usage code for HTML, CSS, React, Vue, Angular, and more.',
    status: 'ready'
  },
  {
    id: 'grateful-dead-archive',
    name: 'Grateful Dead Archive Search',
    href: '/grateful-dead-archive.html',
    category: 'inspect',
    description: 'Advanced search tool for Grateful Dead recordings on Archive.org',
    status: 'ready'
  },
  {
    id: 'hashing-tool',
    name: 'Hashing & Encoding Tool',
    href: '/hashing-tool.html',
    category: 'convert',
    description: 'A comprehensive suite for text transformations including Base64, Hex, URL, Binary, MD5, SHA hashes, ROT13, Morse Code, and more.',
    status: 'ready'
  },
  {
    id: 'html-entities',
    name: 'HTML Entity Encoder / Decoder',
    href: '/html-entities.html',
    category: 'convert',
    description: 'Encode text to HTML entities (hex, decimal, or named) and decode them back. Choose your scope: HTML-unsafe characters, non-ASCII, or all printable.',
    status: 'ready'
  },
  {
    id: 'html-tag-remover',
    name: 'HTML Tag Remover',
    href: '/html-tag-remover.html',
    category: 'convert',
    description: 'Removes HTML/XML tags from text content and trims extra blank lines.',
    status: 'ready'
  },
  {
    id: 'gutenberg-cleaner',
    name: 'Project Gutenberg Cleaner',
    href: '/gutenberg-cleaner.html',
    category: 'convert',
    description: 'Clean Project Gutenberg HTML or plain text for ebook prep and corpus work.',
    status: 'ready'
  },
  {
    id: 'ip-info',
    name: 'IP Info & System Details',
    href: '/ip-info.html',
    category: 'inspect',
    description: 'Displays your current IP address, estimated location, and browser environment details.',
    status: 'ready'
  },
  {
    id: 'json-tools',
    name: 'JSON Tools',
    href: '/json-tools.html',
    category: 'convert',
    description: 'Format, validate, sort, extract, and convert JSON, JSONL, and CSV data.',
    status: 'ready'
  },
  {
    id: 'line-operations',
    name: 'Line Operations',
    href: '/line-operations.html',
    category: 'write',
    description: 'Sort, filter, reverse, shuffle, number, and modify lines of text. Undo/redo support.',
    status: 'ready'
  },
  {
    id: 'lorem-ipsum',
    name: 'Lorem Ipsum Generator',
    href: '/lorem-ipsum.html',
    category: 'write',
    description: 'Generate placeholder text by words, sentences, or paragraphs.',
    status: 'ready'
  },
  {
    id: 'markdown-formatter',
    name: 'Markdown Formatter',
    href: '/markdown-formatter.html',
    category: 'write',
    description: 'Format Markdown text and normalize headers automatically using Prettier.',
    status: 'ready'
  },
  {
    id: 'markdown-previewer',
    name: 'Markdown Previewer',
    href: '/markdown-previewer.html',
    category: 'write',
    description: 'Edit and preview Markdown in real-time with an interactive two-pane layout.',
    status: 'ready'
  },
  {
    id: 'pretty-printer',
    name: 'Pretty Printer',
    href: '/pretty-printer.html',
    category: 'write',
    description: 'Formats code snippets for various programming languages using Prettier.',
    status: 'ready'
  },
  {
    id: 'random-numbers',
    name: 'Random Number Generator',
    href: '/random-numbers.html',
    category: 'write',
    description: 'Generate random numbers with options for range, quantity, decimals, uniqueness, and sorting.',
    status: 'ready'
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    href: '/regex-tester.html',
    category: 'inspect',
    description: 'Test regular expressions, explore matches and groups in real-time.',
    status: 'ready'
  },
  {
    id: 'sequence-generator',
    name: 'Sequence Generator',
    href: '/sequence-generator.html',
    category: 'write',
    description: 'Creates sequences of numbers with or without additional text.',
    status: 'ready'
  },
  {
    id: 'text-diff',
    name: 'Text Diff Tool',
    href: '/text-diff.html',
    category: 'inspect',
    description: 'Compare two texts to find and highlight added, removed, or changed words and lines.',
    status: 'ready'
  },
  {
    id: 'text-info',
    name: 'Text Info',
    href: '/text-info.html',
    category: 'inspect',
    description: 'Count words, characters, lines, sentences, and estimated reading time.',
    status: 'ready'
  },
  {
    id: 'unicode-chooser',
    name: 'Unicode Chooser',
    href: '/unicode-chooser.html',
    category: 'design',
    description: 'Browse all available Unicode characters by block. Get usage code for HTML, CSS, React, Python, C#, and more.',
    status: 'ready'
  },
  {
    id: 'xml-sitemap-generator',
    name: 'XML Sitemap Generator',
    href: '/xml-sitemap-generator.html',
    category: 'inspect',
    description: 'Generate sitemap.xml files from pasted URL lists, with best-effort browser crawling when CORS allows it.',
    status: 'ready'
  }
];
