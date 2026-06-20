export type ToolCategory = 'write' | 'convert' | 'inspect' | 'design';

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
    href: '/clock-face',
    category: 'design',
    description: 'Generate an SVG of an analog clock. Interactively drag hands to set the time.',
    status: 'ready'
  },
  {
    id: 'color-chooser',
    name: 'Color Chooser',
    href: '/color-chooser',
    category: 'design',
    description: 'Pick named HTML colors by family, use the eyedropper or color picker, get CSS/HTML/hex output, find the closest named color, and generate solid-color PNGs.',
    status: 'ready'
  },
  {
    id: 'css-gradient-generator',
    name: 'CSS Gradient Generator',
    href: '/css-gradient-generator',
    category: 'design',
    description: 'Visually create linear, radial, and conic CSS gradients. Drag color stops, copy code, or download PNG.',
    status: 'ready'
  },
  {
    id: 'dictation',
    name: 'Dictation',
    href: '/dictation.html',
    category: 'write',
    description: 'Speak into the microphone and copy the editable transcript anywhere.',
    status: 'ready'
  },
  {
    id: 'font-awesome-chooser',
    name: 'Font Awesome Chooser',
    href: '/font-awesome-chooser',
    category: 'design',
    description: 'Browse Font Awesome 6 icons by category and style. Click any icon to get usage code for HTML, CSS, React, Vue, Angular, C#, Python, PHP, and more.',
    status: 'ready'
  },
  {
    id: 'google-icons-chooser',
    name: 'Google Icons Chooser',
    href: '/google-icons-chooser',
    category: 'design',
    description: 'Browse Google Material Symbols. Customize styles, fill, weight, and optical size. Click any icon to get usage code for HTML, CSS, React, Vue, Angular, and more.',
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
    href: '/unicode-chooser',
    category: 'design',
    description: 'Browse all available Unicode characters by block. Get usage code for HTML, CSS, React, Python, C#, and more.',
    status: 'ready'
  }
];
