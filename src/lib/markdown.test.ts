// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { renderMarkdownPreview, renderWorkspaceMarkdown } from './markdown';

describe('renderMarkdownPreview', () => {
  it('removes resource-loading tags and attributes from workspace previews', () => {
    const html = renderWorkspaceMarkdown('<div style="background-image:url(https://example.invalid/css)">Hello</div><table background="https://example.invalid/table"><tr><td>Cell</td></tr></table><img src="https://example.invalid/image"><video poster="https://example.invalid/poster"></video>');
    expect(html).toContain('Hello');
    expect(html).toContain('<td>Cell</td>');
    expect(html).not.toMatch(/style=|background=|srcset=|poster=|<img|<video|example\.invalid/);
  });
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
