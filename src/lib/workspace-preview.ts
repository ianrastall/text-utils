import { diffLines } from 'diff';
export function buildChangePreview(before: string, after: string) {
  const changed = before !== after;
  if (!changed) return { changed, changes: [], added:0, removed:0, note:'No text changes.' };
  if (before.length + after.length > 200_000) return { changed, changes:null, added:0, removed:0, note:'Line comparison is limited to 200,000 combined characters. Review the result preview before applying.' };
  const changes = diffLines(before,after,{timeout:500});
  if (!changes) return { changed, changes:null, added:0, removed:0, note:'Line comparison timed out. Review the result preview before applying.' };
  let added = 0, removed = 0;
  for (const part of changes) { if (part.added) added += part.count || 0; if (part.removed) removed += part.count || 0; }
  return { changed, changes:changes.slice(0,1000), added, removed, note:changes.length > 1000 ? 'First 1,000 difference sections shown.' : '' };
}
