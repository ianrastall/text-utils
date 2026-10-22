import { describe, expect, it } from 'vitest';
import { accentForeground, readableAccent, contrast } from './appearance';
describe('appearance contrast', () => {
  for (const accent of ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#c8a96b', '#777777']) {
    it(`keeps ${accent} text legible in both themes`, () => {
      expect(contrast(accent, accentForeground(accent))).toBeGreaterThanOrEqual(4.5);
      for (const background of ['#2b2824', '#eae6de']) expect(contrast(readableAccent(accent, background), background)).toBeGreaterThanOrEqual(4.5);
    });
  }
});
