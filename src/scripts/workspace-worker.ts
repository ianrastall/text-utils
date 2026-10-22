/// <reference lib="webworker" />
import { runOperation, operationName, type Operation } from '../lib/workspace-operations';
import { formatJsonText } from '../lib/workspace-json';
import { buildChangePreview } from '../lib/workspace-preview';
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
    const reports: {name:string;before:number;after:number;changed:boolean}[] = [];
    if (typeof event.data.replacement === 'string') {
      result = event.data.replacement;
      if (result.length > 10_000_000) throw new Error('The result exceeds the 10 million character limit.');
      reports.push({name:'Use tool result',before:event.data.text.length,after:result.length,changed:result !== event.data.text});
    } else if (!steps.length) throw new Error('Add at least one operation.');
    for (const [index,step] of steps.entries()) {
      const before = result;
      self.postMessage({progress:{step:index + 1,total:steps.length,name:operationName(step.id)}});
      result = step.id === 'format-markdown' ? await format(result,'markdown') : step.id === 'format-code' ? await format(result,event.data.language || 'text') : runOperation(result,step);
      if (result.length > 10_000_000) throw new Error('The result exceeds the 10 million character limit.');
      reports.push({name:operationName(step.id),before:before.length,after:result.length,changed:before !== result});
    }
    self.postMessage({ result, reports, preview:buildChangePreview(event.data.text,result) });
  }
  catch (error) { self.postMessage({ error:error instanceof Error ? error.message : 'Operation failed.' }); }
};
