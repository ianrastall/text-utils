export type ToolCategory = 'write' | 'convert' | 'inspect';

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
    id: 'dictation',
    name: 'Dictation',
    href: '/dictation.html',
    category: 'write',
    description: 'Speak into the microphone and copy the editable transcript anywhere.',
    status: 'ready'
  },
  {
    id: 'case-converter',
    name: 'Case Converter',
    href: '/case-converter.html',
    category: 'convert',
    description: 'Convert text between uppercase, lowercase, title case, sentence case, and slug formats.',
    status: 'ready'
  },
  {
    id: 'text-info',
    name: 'Text Info',
    href: '/text-info.html',
    category: 'inspect',
    description: 'Count words, characters, lines, sentences, and estimated reading time.',
    status: 'ready'
  }
];
