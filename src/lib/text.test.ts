import { describe, expect, it } from 'vitest';
import { getTextStats } from './text';

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
