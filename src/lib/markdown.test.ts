// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { renderMarkdownPreview } from './markdown';

describe('renderMarkdownPreview', () => {
  it('removes executable HTML attributes from markdown preview output', () => {
    const html = renderMarkdownPreview('<img src=x onerror="window.__xss = 1">');

    expect(html).toContain('<img');
    expect(html).not.toContain('onerror');
    expect(html).not.toContain('window.__xss');
  });

  it('keeps ordinary markdown rendering intact', () => {
    expect(renderMarkdownPreview('**Hello**')).toContain('<strong>Hello</strong>');
  });
});
