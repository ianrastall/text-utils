import DOMPurify from 'dompurify';
import { marked } from 'marked';

export function renderMarkdownPreview(markdown: string): string {
  const rendered = marked.parse(markdown, { async: false }) as string;
  return DOMPurify.sanitize(rendered, { USE_PROFILES: { html: true } });
}

export function renderWorkspaceMarkdown(markdown: string): string {
  const rendered = marked.parse(markdown, { async: false }) as string;
  return DOMPurify.sanitize(rendered, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['img', 'video', 'audio', 'source', 'iframe', 'form', 'input', 'style', 'link'],
    FORBID_ATTR: ['style', 'background', 'srcset', 'poster']
  });
}
