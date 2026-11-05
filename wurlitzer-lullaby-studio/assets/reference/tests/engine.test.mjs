import assert from 'node:assert/strict';
import test from 'node:test';
import { loadCollections, loadEngine, loadManifest, loadTracks } from './lib/fixtures.mjs';

const engine = loadEngine();
const tracks = loadTracks();
const collections = loadCollections();

test('note names convert to MIDI and frequency', () => {
  assert.equal(engine.noteToMidi('C4'), 60);
  assert.equal(engine.noteToMidi('A4'), 69);
  assert.equal(engine.noteToMidi('Bb3'), 58);
  assert.equal(engine.noteToMidi('C#5'), 73);
  assert.equal(Math.round(engine.midiToFreq(69)), 440);
  assert.equal(Math.round(engine.midiToFreq(57)), 220);
  assert.throws(() => engine.noteToMidi('H2'));
  assert.throws(() => engine.noteToMidi('C'));
});

test('sequences parse into timed, positive notes', () => {
  const seq = engine.parseSequence('C4:1 D4:2 E4:1');
  assert.equal(seq.length, 3);
  assert.equal(seq[1].midi, 62);
  assert.equal(seq[1].beats, 2);
  assert.equal(engine.sequenceBeats(seq), 4);
  assert.equal(engine.sequenceSeconds(seq, 60), 4);
  assert.equal(engine.noteAtBeat(seq, 0), 0);
  assert.equal(engine.noteAtBeat(seq, 1.1), 1);
  assert.equal(engine.noteAtBeat(seq, 99), 2);
  assert.throws(() => engine.parseSequence('C4:0'));
});

test('fifty lullabies across eight collections are tuned and complete', () => {
  assert.equal(tracks.length, 50);
  assert.equal(collections.length, 11);
  assert.deepEqual(collections.map((c) => c.letter), ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']);
  assert.equal(new Set(tracks.map((t) => t.id)).size, 50);
  assert.equal(new Set(tracks.map((t) => t.slot)).size, 50);
  for (const track of tracks) {
    assert.ok(track.sequence.length >= 12, `${track.id} sequence too short`);
    assert.ok(track.duration > 15 && track.duration < 200, `${track.id} odd duration`);
    assert.ok(track.title.en && track.title.th);
    assert.ok(track.artist.en && track.artist.th);
    assert.match(track.accent, /^#[0-9a-f]{6}$/i);
    assert.equal(track.collection, track.slot[0]);
    assert.ok(['public-domain', 'original'].includes(track.rights), `${track.id} rights`);
    assert.ok(['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(track.collection));
  }
});

test('every collection holds at least one record', () => {
  for (const collection of collections) {
    if (['H', 'I', 'J', 'K'].includes(collection.letter)) continue;
    const inCollection = tracks.filter((track) => track.collection === collection.letter);
    assert.ok(inCollection.length >= 1, `${collection.letter} is empty`);
  }
});

test('fade curve is smooth, monotonic and exactly half at one minute', () => {
  assert.equal(engine.fadeGain(120), 1);
  assert.equal(engine.fadeGain(121), 1);
  assert.equal(engine.fadeGain(0), 0);
  assert.equal(engine.fadeGain(-4), 0);
  assert.equal(engine.fadeGain(60), 0.5);
  let previous = 1.1;
  for (let t = 120; t >= 0; t -= 5) {
    const value = engine.fadeGain(t);
    assert.ok(value <= previous + 1e-9, 'fade must not rise');
    previous = value;
  }
  assert.ok(engine.fadeGain(119.9) < 1);
});

test('clock formatting is exact', () => {
  assert.equal(engine.formatClock(0), '0:00');
  assert.equal(engine.formatClock(9), '0:09');
  assert.equal(engine.formatClock(65), '1:05');
  assert.equal(engine.formatClock(372), '6:12');
  assert.equal(engine.formatClock(-9), '0:00');
});

test('slots, rack and keypad codes agree across A-H', () => {
  assert.equal(engine.slotOf('A', 1), 'A-1');
  assert.equal(engine.slotOf('k', 8), 'K-8');
  assert.equal(engine.slotOf('L', 1), null);
  assert.equal(engine.slotOf('A', 9), null);
  assert.deepEqual(engine.slotParts('K-8'), { letter: 'K', number: 8 });
  assert.equal(engine.slotOrder('A-1'), 0);
  assert.equal(engine.slotOrder('B-4'), 11);
  assert.equal(engine.slotOrder('D-4'), 27);
  assert.equal(engine.slotOrder('H-8'), 63);
  assert.equal(engine.slotOrder('K-8'), 87);
  const rack = engine.buildRack(tracks, [{ id: 'x', slot: 'H-1', title: { en: 'X' } }]);
  assert.equal(rack.length, 88);
  assert.equal(rack[0].track.id, 'brahms');
  assert.equal(rack.find((row) => row.slot === 'H-1').track.id, 'x');
  assert.equal(rack.find((row) => row.slot === 'G-8').track, null);
});

test('manifest validation accepts public-domain H slots and rejects bad entries', () => {
  const manifest = loadManifest();
  const good = engine.validateManifest(manifest);
  assert.equal(good.ok, true);
  assert.equal(good.tracks.length, 32);
  assert.equal(good.tracks[0].slot, 'H-1');
  assert.equal(good.tracks[good.tracks.length - 1].slot, 'K-8');
  assert.ok(good.tracks.every((t) => t.engine === 'stream' && t.url.startsWith('https://')));
  assert.ok(good.tracks.every((t) => t.license === 'Public domain'));
  assert.ok(good.tracks.every((t) => ['H', 'I', 'J', 'K'].includes(t.collection)));

  const bad = engine.validateManifest({ tracks: [
    { slot: 'H-1', title: 'A', url: 'http://insecure.example/a.mp3' },
    { slot: 'H-1', title: 'B', url: 'https://example.com/b.mp3' },
    { slot: 'H-1', title: 'B2', url: 'https://example.com/b2.mp3' },
    { slot: 'Z-9', title: 'C', url: 'https://example.com/c.mp3' },
    { slot: 'H-2', title: '', url: 'https://example.com/d.mp3' },
  ] });
  assert.equal(bad.tracks.length, 1);
  assert.ok(bad.errors.length >= 4, JSON.stringify(bad.errors));
  const allBad = engine.validateManifest({ tracks: [
    { slot: 'H-1', title: 'A', url: 'http://insecure.example/a.mp3' },
  ] });
  assert.equal(allBad.ok, false);
  assert.equal(engine.validateManifest(null).ok, false);
});

test('settings normalisation is defensive and keeps display preferences', () => {
  const defaults = engine.normalizeSettings(null);
  assert.equal(defaults.master, 82);
  assert.equal(defaults.freePlay, true);
  assert.equal(defaults.theme, 'midnight');
  assert.equal(defaults.fontSize, 'normal');
  assert.deepEqual(defaults.favorites, []);
  const wild = engine.normalizeSettings({
    lang: 'xx', master: 900, bass: -99, treble: 99, mix: -4, credits: 400,
    ambient: { rain: 200, ocean: -3 }, timer: 17, favorites: ['a', 'a', 7, 'b'],
    theme: 'neon', fontSize: 'huge',
  });
  assert.equal(wild.lang, 'en');
  assert.equal(wild.master, 100);
  assert.equal(wild.bass, -10);
  assert.equal(wild.treble, 10);
  assert.equal(wild.mix, 0);
  assert.equal(wild.credits, 99);
  assert.equal(wild.ambient.rain, 100);
  assert.equal(wild.ambient.ocean, 0);
  assert.equal(wild.timer, 0);
  assert.equal(wild.theme, 'midnight');
  assert.equal(wild.fontSize, 'normal');
  assert.deepEqual(wild.favorites, ['a', 'b']);
});

test('track stepping wraps in both directions', () => {
  const first = tracks[0].id;
  const last = tracks[tracks.length - 1].id;
  assert.equal(engine.nextTrackId(tracks, first, 1), tracks[1].id);
  assert.equal(engine.nextTrackId(tracks, first, -1), last);
  assert.equal(engine.nextTrackId(tracks, 'nope', 1), first);
  assert.equal(engine.nextTrackId([], 'x', 1), null);
});

test('export payload is schema-stable and includes all fifty', () => {
  const payload = engine.exportPayload(engine.normalizeSettings(null), tracks, '2026-11-05T00:00:00.000Z');
  assert.equal(payload.schema, 1);
  assert.equal(payload.exportedAt, '2026-11-05T00:00:00.000Z');
  assert.equal(payload.tracks.length, 50);
  assert.equal(payload.tracks[0].id, 'brahms');
  assert.equal(payload.tracks[0].slot, 'A-1');
  assert.equal(payload.tracks[0].rights, 'public-domain');
  assert.equal(payload.tracks[0].engine, 'synth');
});
