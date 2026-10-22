/// <reference lib="webworker" />
import { runOperation, type Operation } from '../lib/workspace-operations';
import { formatJsonText } from '../lib/workspace-json';
async function format(text: string, language: string): Promise<string> {
  if (language === 'json') return formatJsonText(text) + '\n';
  const { format } = await import('prettier/standalone');
  const parser = ({ markdown:'markdown', json:'json', html:'html', css:'css', javascript:'babel', typescript:'babel-ts' } as Record<string,string>)[language];
  if (!parser) throw new Error('Choose Markdown, JSON, HTML, CSS, JavaScript or TypeScript in the status bar before formatting.');
  const plugins = language === 'markdown' ? [await import('prettier/plugins/markdown')]
    : language === 'html' ? [await import('prettier/plugins/html')]
    : language === 'css' ? [await import('prettier/plugins/postcss')]
    : await Promise.all([import('prettier/plugins/babel'),import('prettier/plugins/estree')]);
  return format(text,{ parser,plugins });
}
self.onmessage = async event => {
  try {
    let result: string = event.data.text;
    const steps: Operation[] = event.data.steps;
    if (!steps.length) throw new Error('Add at least one operation.');
    for (const step of steps) {
      result = step.id === 'format-markdown' ? await format(result,'markdown') : step.id === 'format-code' ? await format(result,step.options?.language || 'text') : runOperation(result,step);
      if (result.length > 10_000_000) throw new Error('The result exceeds the 10 million character limit.');
    }
    self.postMessage({ result });
  }
  catch (error) { self.postMessage({ error:error instanceof Error ? error.message : 'Operation failed.' }); }
};
