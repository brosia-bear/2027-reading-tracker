// Discover engine: search normalization, AND/OR semantics, guided picks, surprise bag.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { writeFacets } from '../tools/build.mjs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const D = require('../src/js/49c-discover.js');
writeFacets();
const cat = JSON.parse(fs.readFileSync('catalog/curated-200-plus-2.json', 'utf8'));
const facets = JSON.parse(fs.readFileSync('src/data/brosia-facets.json', 'utf8')).books;
const books = [...cat.curated_books, ...cat.daily_slow_reads].map((b, i) => ({ ...b, plan_order: i + 1 }));
const daily = new Set(cat.daily_slow_reads.map(b => b.id));
const entries = D.build(books, facets, b => daily.has(b.id));
const titles = list => list.map(x => (x.entry || x).book.title);

test('every one of the 202 books is findable by its exact title', () => {
  for (const b of books) assert.ok(titles(D.search(entries, b.title)).includes(b.title), b.title);
});
test('search tolerates spelling variants, accents, punctuation and quotes', () => {
  assert.equal(D.search(entries, 'Dostoyevsky').length, D.search(entries, 'Dostoevsky').length);
  assert.ok(titles(D.search(entries, 'Les Miserables')).includes('Les Misérables'));
  assert.ok(titles(D.search(entries, 'de beauvoir')).includes('The Second Sex'));
  assert.ok(titles(D.search(entries, 'mans search for meaning')).includes("Man's Search for Meaning"));
  assert.deepEqual(titles(D.search(entries, '"jade"')).sort(), ['Jade City', 'Jade Legacy', 'Jade War']);
});
test('moods: OR within the facet, AND when chosen; AND ⊆ OR', () => {
  const any = D.filter(entries, { moods: ['funny', 'lyrical'], moodMode: 'any' });
  const all = D.filter(entries, { moods: ['funny', 'lyrical'], moodMode: 'all' });
  const funny = D.filter(entries, { moods: ['funny'] }), lyrical = D.filter(entries, { moods: ['lyrical'] });
  const ids = l => new Set(l.map(x => x.entry.book.id));
  assert.equal(any.length, new Set([...ids(funny), ...ids(lyrical)]).size);
  for (const id of ids(all)) assert.ok(ids(funny).has(id) && ids(lyrical).has(id));
});
test('different facets combine with AND, and results explain why', () => {
  const r = D.filter(entries, { moods: ['romantic'], forms: ['fiction'], lengths: ['medium'] });
  assert.ok(r.length > 0);
  for (const x of r) { assert.equal(x.entry.f.form, 'fiction'); assert.equal(x.entry.f.length, 'medium'); assert.ok(x.reasons[0].includes('romantic')); }
});
test('daily classics are excluded unless asked for; finished books hidden when unread-only', () => {
  const epic = D.filter(entries, { moods: ['epic'] });
  assert.ok(!epic.some(x => daily.has(x.entry.book.id)));
  assert.ok(D.filter(entries, { moods: ['epic'], includeDaily: true }).some(x => daily.has(x.entry.book.id)));
  const progress = { 'rosewood-2027-001': { status: 'finished' } };
  assert.ok(!D.filter(entries, { moods: ['funny'], unreadOnly: true }, progress).some(x => x.entry.book.id === 'rosewood-2027-001'));
});
test('additions #107–200 are reachable by mood, not just the first 104', () => {
  const r = D.filter(entries, { moods: ['thought-provoking'] });
  assert.ok(r.some(x => x.entry.book.plan_order > 106));
});
test('surprise bag never repeats until the pool is exhausted', () => {
  const pool = D.filter(entries, { moods: ['cozy'] });
  const next = D.makeBag(() => 0.42), seen = new Set();
  for (let i = 0; i < pool.length; i++) seen.add(next(pool).entry.book.id);
  assert.equal(seen.size, pool.length);
});
test('guided answers map to filters and every question can be skipped', () => {
  assert.deepEqual(D.guided({}).moods, []);
  const q = D.guided({ kind: 'fiction', energy: 'light', appetite: 'comfort', time: 'short' });
  assert.deepEqual(q.forms, ['fiction']); assert.deepEqual(q.efforts, ['light']); assert.deepEqual(q.lengths, ['short']);
  assert.ok(D.filter(entries, q).length > 0);
});
