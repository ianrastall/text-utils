export type CaseMode = 'upper' | 'lower' | 'title' | 'sentence' | 'camel' | 'pascal' | 'snake' | 'kebab';

export interface TextStats {
  characters: number;
  words: number;
  lines: number;
  sentences: number;
  paragraphs: number;
  readingMinutes: number;
}

export function splitWords(text: string): string[] {
  return text
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .match(/[A-Za-z0-9]+(?:'[A-Za-z0-9]+)?/g) ?? [];
}

export function convertCase(text: string, mode: CaseMode): string {
  const words = splitWords(text);

  switch (mode) {
    case 'upper':
      return text.toUpperCase();
    case 'lower':
      return text.toLowerCase();
    case 'title':
      return text.toLowerCase().replace(/\b[A-Za-z0-9]+(?:'[A-Za-z0-9]+)?/g, (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
      );
    case 'sentence':
      return text
        .toLowerCase()
        .replace(/(^\s*[a-z])|([.!?]\s+[a-z])/gm, (match) => match.toUpperCase());
    case 'camel':
      return words
        .map((word, index) => index === 0 ? word.toLowerCase() : capitalize(word))
        .join('');
    case 'pascal':
      return words.map(capitalize).join('');
    case 'snake':
      return words.map((word) => word.toLowerCase()).join('_');
    case 'kebab':
      return words.map((word) => word.toLowerCase()).join('-');
  }
}

export function getTextStats(text: string): TextStats {
  const trimmed = text.trim();
  const words = trimmed ? (trimmed.match(/\S+/g) ?? []).length : 0;
  const sentenceMatches = trimmed.match(/[.!?]+(?:\s|$)/g) ?? [];
  const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(Boolean).length : 0;

  return {
    characters: text.length,
    words,
    lines: text.length ? text.split(/\r?\n/).length : 0,
    sentences: sentenceMatches.length,
    paragraphs,
    readingMinutes: words === 0 ? 0 : Math.max(1, Math.ceil(words / 225))
  };
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}
