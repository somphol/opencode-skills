// Shared test fixtures: repository root and the two browser-independent data files.
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const read = (file) => readFileSync(join(ROOT, file), 'utf8');
export const loadData = () => JSON.parse(JSON.stringify(new Function(`${read('js/data.js')}; return ALGO_DATA;`)()));
export const loadEngine = () => new Function(`${read('js/algorithms.js')}; return ALGO_ENGINE;`)();
