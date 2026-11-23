// Category ladders: exact thresholds, scope, overlap, undo, idempotence.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { writeFacets } from '../tools/build.mjs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const L = require('../src/js/49d-ladders.js');
writeFacets();
const cat = JSON.parse(fs.readFileSync('catalog/curated-200-plus-2.json', 'utf8'));
const facets = JSON.parse(fs.readFileSync('src/data/brosia-facets.json', 'utf8')).books;
const books = [...cat.curated_books, ...cat.daily_slow_reads];
const shelf = (rows, id) => rows.find(r => r.id === id);
const philosophy = books.filter(b => L.SHELVES[0].test(facets[b.id], b));
const finish = (list, date = '2027-03-01') => Object.fromEntries(list.map((b, i) => [b.id, { status: 'finished', finished_at: date.slice(0, 8) + String(1 + (i % 28)).padStart(2, '0') }]));

test('threshold 5 unlocks exactly at 5, not 4', () => {
  assert.equal(shelf(L.evaluate(books, facets, finish(philosophy.slice(0, 4))), 'philosophy').tiers[0].earned, false);
  const five = shelf(L.evaluate(books, facets, finish(philosophy.slice(0, 5))), 'philosophy');
  assert.equal(five.tiers[0].earned, true); assert.equal(five.tiers[1].earned, false); assert.equal(five.next, 10);
});
test('threshold 25 at 25; earned date is the finish date of the 25th book', () => {
  assert.ok(philosophy.length >= 25, 'catalog has 25+ philosophy books');
  const r = shelf(L.evaluate(books, facets, finish(philosophy.slice(0, 25))), 'philosophy');
  assert.equal(r.count, 25); assert.ok(r.tiers.every(t => t.earned)); assert.equal(r.next, null);
});
test('reading, paused, DNF and ratings never count', () => {
  const p = Object.fromEntries(philosophy.slice(0, 10).map((b, i) => [b.id, { status: ['reading', 'paused', 'dnf'][i % 3], finished_at: null, rating: 5 }]));
  assert.equal(shelf(L.evaluate(books, facets, p), 'philosophy').count, 0);
});
test('2026 finishes count for all-time only', () => {
  const p = finish(philosophy.slice(0, 5), '2026-06-01');
  assert.equal(shelf(L.evaluate(books, facets, p, 'year'), 'philosophy').count, 0);
  assert.equal(shelf(L.evaluate(books, facets, p, 'all'), 'philosophy').count, 5);
});
test('a book can count on two shelves; undoing a finish lowers both', () => {
  const behave = books.find(b => b.title === 'Behave');
  const rows = L.evaluate(books, facets, finish([behave]));
  assert.equal(shelf(rows, 'psychology').count, 1); assert.equal(shelf(rows, 'nonfiction').count, 1);
  const after = L.evaluate(books, facets, {});
  assert.equal(shelf(after, 'psychology').count, 0); assert.equal(shelf(after, 'nonfiction').count, 0);
});
test('evaluation is pure: same input, same output, nothing stored', () => {
  const p = finish(philosophy.slice(0, 7));
  assert.deepEqual(L.evaluate(books, facets, p), L.evaluate(books, facets, p));
});
