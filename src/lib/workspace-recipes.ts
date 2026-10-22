import { parseRecipe, type Operation } from './workspace-operations';
export function encodeRecipe(name: string, steps: Operation[]): string {
  return JSON.stringify(validate({version:1,name,steps}),null,2);
}
function validate(value: unknown): { version:1; name:string; steps:Operation[] } {
  const recipe = value as { version?:unknown; name?:unknown; steps?:unknown } | null;
  if (!recipe || recipe.version !== 1 || typeof recipe.name !== 'string' || !recipe.name.trim() || recipe.name.length > 80) throw new Error('Choose a version 1 recipe with a name of 1–80 characters.');
  const steps = parseRecipe(recipe.steps);
  if (!steps.length) throw new Error('A recipe needs at least one step.');
  return {version:1,name:recipe.name.trim(),steps};
}
export function decodeRecipe(text: string) {
  if (text.length > 2_000_000) throw new Error('Recipe files are limited to 2 MB.');
  return validate(JSON.parse(text));
}
