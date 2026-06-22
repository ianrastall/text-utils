import DOMPurify from 'dompurify';
import { marked } from 'marked';

export function renderMarkdownPreview(markdown: string): string {
  const rendered = marked.parse(markdown, { async: false }) as string;
  return DOMPurify.sanitize(rendered, { USE_PROFILES: { html: true } });
}
