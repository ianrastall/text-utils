export interface TextStats {
  characters: number;
  words: number;
  lines: number;
  sentences: number;
  paragraphs: number;
  readingMinutes: number;
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
