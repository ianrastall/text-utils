import { describe, expect, it } from 'vitest';
import { convertCase, getTextStats } from './text';

describe('convertCase', () => {
  it('converts text to snake case', () => {
    expect(convertCase('Text utilities rebuild', 'snake')).toBe('text_utilities_rebuild');
  });

  it('converts text to pascal case', () => {
    expect(convertCase('text-utils rebuild', 'pascal')).toBe('TextUtilsRebuild');
  });
});

describe('getTextStats', () => {
  it('counts basic text structure', () => {
    expect(getTextStats('Hello world.\n\nSecond paragraph.')).toMatchObject({
      characters: 31,
      words: 4,
      lines: 3,
      sentences: 2,
      paragraphs: 2,
      readingMinutes: 1
    });
  });
});
