/// <reference lib="webworker" />
self.onmessage = event => {
  const { id, revision, text } = event.data;
  let words = 0;
  for (const _match of (text as string).matchAll(/\S+/g)) words++;
  self.postMessage({ id, revision, words });
};
