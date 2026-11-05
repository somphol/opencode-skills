import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export function read(relative) {
  return readFileSync(join(ROOT, relative), 'utf8');
}

/** Slice the self-contained engine factory out of script.js and evaluate it. */
export function loadEngine() {
  const source = read('script.js');
  const start = source.indexOf('/* ENGINE:START */');
  const end = source.indexOf('/* ENGINE:END */');
  if (start < 0 || end < 0) throw new Error('engine markers missing from script.js');
  const slice = source.slice(start, end);
  // eslint-disable-next-line no-new-func
  return new Function(`${slice}\nreturn createPuzzle15Engine();`)();
}

/** Evaluate the bilingual dictionary without importing the Three.js module. */
export function loadI18n() {
  const source = read('script.js');
  const start = source.indexOf('const I18N = {');
  const end = source.indexOf('\n};\n\nconst TIPS');
  if (start < 0 || end < 0) throw new Error('I18N block not found');
  const literal = source.slice(start + 'const I18N = '.length, end + 2);
  // eslint-disable-next-line no-new-func
  return new Function(`return (${literal});`)();
}
