// Shared fixtures: repository root, source slices and pure-engine loading.
// The app is a single ES module; marked blocks are extracted so they can run in
// Node without a DOM or a WebGL context.

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const read = (file) => readFileSync(join(ROOT, file), 'utf8');

const slice = (source, start, end) => {
  const from = source.indexOf(start);
  const to = source.indexOf(end);
  if (from < 0 || to < 0) throw new Error(`markers ${start} / ${end} not found`);
  return source.slice(from + start.length, to);
};

const engineBlock = () => slice(read('script.js'), '/* ENGINE:START */', '/* ENGINE:END */');
const tracksBlock = () => slice(read('script.js'), '/* TRACKS:START */', '/* TRACKS:END */');

export const loadEngine = () => {
  const block = engineBlock();
  return new Function(`${block}; return {
    NOTE_INDEX, clamp, noteToMidi, midiToFreq, parseSequence, sequenceBeats,
    sequenceSeconds, noteAtBeat, fadeGain, formatClock, SLOT_ORDER, slotOf,
    slotParts, slotOrder, buildRack, DEFAULT_SETTINGS, normalizeSettings,
    validateManifest, nextTrackId, exportPayload
  };`)();
};

export const loadTracks = () => {
  const block = `${engineBlock()}\n${tracksBlock()}`;
  return new Function(`${block}; return BUILTIN_TRACKS;`)();
};

export const loadCollections = () => {
  const block = `${engineBlock()}\n${tracksBlock()}`;
  return new Function(`${block}; return COLLECTIONS;`)();
};

export const loadI18n = () => {
  const block = slice(read('script.js'), '/* I18N:START */', '/* I18N:END */');
  return new Function(`${block}; return I18N;`)();
};

export const loadManifest = () => JSON.parse(read('data/playlist.json'));
