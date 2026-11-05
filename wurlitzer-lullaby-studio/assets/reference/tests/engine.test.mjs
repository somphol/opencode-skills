import assert from 'node:assert/strict';
import test from 'node:test';
import { loadEngine, loadTracks, loadManifest } from './lib/fixtures.mjs';

const engine = loadEngine();
const tracks = loadTracks();

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

test('eight lullabies are tuned, ordered and long enough to sleep', () => {
  assert.equal(tracks.length, 8);
  assert.deepEqual(tracks.map((t) => t.slot), ['A-1', 'A-2', 'A-3', 'A-4', 'B-1', 'B-2', 'B-3', 'B-4']);
  assert.equal(new Set(tracks.map((t) => t.id)).size, 8);
  for (const track of tracks) {
    assert.ok(track.sequence.length >= 12, `${track.id} sequence too short`);
    assert.ok(track.duration > 15 && track.duration < 200, `${track.id} odd duration`);
    assert.ok(track.title.en && track.title.th);
    assert.ok(track.artist.en && track.artist.th);
    assert.match(track.accent, /^#[0-9a-f]{6}$/i);
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

test('slots, rack and keypad codes agree', () => {
  assert.equal(engine.slotOf('A', 1), 'A-1');
  assert.equal(engine.slotOf('d', 8), 'D-8');
  assert.equal(engine.slotOf('E', 1), null);
  assert.equal(engine.slotOf('A', 9), null);
  assert.deepEqual(engine.slotParts('B-3'), { letter: 'B', number: 3 });
  assert.equal(engine.slotOrder('A-1'), 0);
  assert.equal(engine.slotOrder('B-4'), 7);
  assert.equal(engine.slotOrder('D-4'), 15);
  const rack = engine.buildRack(tracks, [{ id: 'x', slot: 'C-1', title: { en: 'X' } }]);
  assert.equal(rack.length, 16);
  assert.equal(rack[0].track.id, 'brahms');
  assert.equal(rack.find((row) => row.slot === 'C-1').track.id, 'x');
  assert.equal(rack.find((row) => row.slot === 'D-8'), undefined);
});

test('manifest validation accepts good tracks and rejects bad ones', () => {
  const good = engine.validateManifest(loadManifest());
  assert.equal(good.ok, true);
  assert.equal(good.tracks.length, 4);
  assert.deepEqual(good.tracks.map((t) => t.slot), ['C-1', 'C-2', 'C-3', 'C-4']);
  assert.ok(good.tracks.every((t) => t.engine === 'stream' && t.url.startsWith('https://')));

  const bad = engine.validateManifest({ tracks: [
    { slot: 'C-1', title: 'A', url: 'http://insecure.example/a.mp3' },
    { slot: 'C-1', title: 'B', url: 'https://example.com/b.mp3' },
    { slot: 'C-1', title: 'B2', url: 'https://example.com/b2.mp3' },
    { slot: 'Z-9', title: 'C', url: 'https://example.com/c.mp3' },
    { slot: 'D-2', title: '', url: 'https://example.com/d.mp3' },
  ] });
  assert.equal(bad.tracks.length, 1);
  assert.ok(bad.errors.length >= 4, JSON.stringify(bad.errors));
  const allBad = engine.validateManifest({ tracks: [
    { slot: 'C-1', title: 'A', url: 'http://insecure.example/a.mp3' },
  ] });
  assert.equal(allBad.ok, false);
  assert.equal(engine.validateManifest(null).ok, false);
});

test('settings normalisation is defensive', () => {
  const defaults = engine.normalizeSettings(null);
  assert.equal(defaults.master, 82);
  assert.equal(defaults.freePlay, true);
  assert.deepEqual(defaults.favorites, []);
  const wild = engine.normalizeSettings({
    lang: 'xx', master: 900, bass: -99, treble: 99, mix: -4, credits: 400,
    ambient: { rain: 200, ocean: -3 }, timer: 17, favorites: ['a', 'a', 7, 'b'],
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
  assert.deepEqual(wild.favorites, ['a', 'b']);
});

test('track stepping wraps in both directions', () => {
  const ids = tracks.map((t) => t.id);
  assert.equal(engine.nextTrackId(tracks, 'brahms', 1), 'twinkle');
  assert.equal(engine.nextTrackId(tracks, 'brahms', -1), 'golden');
  assert.equal(engine.nextTrackId(tracks, 'nope', 1), 'brahms');
  assert.equal(engine.nextTrackId([], 'x', 1), null);
});

test('export payload is schema-stable', () => {
  const payload = engine.exportPayload(engine.normalizeSettings(null), tracks, '2026-11-05T00:00:00.000Z');
  assert.equal(payload.schema, 1);
  assert.equal(payload.exportedAt, '2026-11-05T00:00:00.000Z');
  assert.equal(payload.tracks.length, 8);
  assert.deepEqual(payload.tracks[0], { id: 'brahms', slot: 'A-1', engine: 'synth', title: "Brahms' Lullaby" });
});
