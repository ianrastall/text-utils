/// <reference lib="webworker" />
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import ruby from 'highlight.js/lib/languages/ruby';
import php from 'highlight.js/lib/languages/php';
import sql from 'highlight.js/lib/languages/sql';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import java from 'highlight.js/lib/languages/java';
import csharp from 'highlight.js/lib/languages/csharp';
import cpp from 'highlight.js/lib/languages/cpp';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import bash from 'highlight.js/lib/languages/bash';
import yaml from 'highlight.js/lib/languages/yaml';
import { strongLanguageHint } from '../lib/detect-language';
for (const [id,grammar] of Object.entries({javascript,typescript,python,ruby,php,sql,css,xml,json,java,csharp,cpp,go,rust,bash,yaml})) hljs.registerLanguage(id,grammar);
self.onmessage = event => {
  const sample = String(event.data.text).slice(0,16000);
  const hint = strongLanguageHint(sample);
  if (hint) { self.postMessage(hint); return; }
  const result = hljs.highlightAuto(sample);
  const margin = result.relevance - (result.secondBest?.relevance || 0);
  const confident = result.relevance >= 6 && margin >= 2;
  const language = confident ? result.language === 'bash' ? 'shell' : result.language || 'text' : 'text';
  self.postMessage({language,reason:language === 'text' ? 'ambiguous text' : 'content detection'});
};
