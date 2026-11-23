// Catalog v2 invariants, built exactly as the app builds it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const read = p => JSON.parse(fs.readFileSync(new URL('../' + p, import.meta.url), 'utf8'));

const Catalog = require('../src/js/23-catalog-reader.js');
const Revision = require('../src/js/47-plan-revision.js');
const Queue = require('../src/js/49-reader-queue.js');
const V2 = require('../src/js/49b-catalog-v2.js');

function buildIndex() {
  const index = Catalog.create(read('src/data/rosewood-seed.json'), read('src/data/rosewood-arcs.json'),
    read('src/data/rosewood-cover-manifest.json'), read('src/data/rosewood-baseline.json'));
  Revision.apply(index, read('src/data/rosewood-revision.json'));
  for (const b of read('src/data/brosia-regular-supplements.json').new_regular_books) { index.books.push(b); index.byId.set(b.id, b); }
  const legacy = index.books.map(b => b.id);
  const summary = V2.extend(index, read('catalog/curated-200-plus-2.json'));
  return { index, legacy, summary };
}

test('exactly 200 curated + 2 daily classics, all unique', () => {
  const { summary } = buildIndex();
  assert.deepEqual({ ...summary }, { curated: 200, daily: 2, total: 202, unique: 202 });
});

test('fixed positions: Knightley #31/#37, Piranesi #105, Left Hand #106, classics #201/#202', () => {
  const { index } = buildIndex();
  const at = n => index.books[n - 1];
  assert.equal(at(31).title, 'The Irresistible Urge to Fall for Your Enemy');
  assert.equal(at(37).title, 'The Exquisite Torment of Loving Your Enemy');
  assert.equal(at(105).id, 'rosewood-2027-105'); assert.equal(at(105).title, 'Piranesi');
  assert.equal(at(106).id, 'rosewood-2027-106'); assert.equal(at(106).title, 'The Left Hand of Darkness');
  assert.equal(at(201).id, 'rosewood-revised-2027-031'); assert.equal(at(201).title, 'War and Peace');
  assert.equal(at(202).id, 'rosewood-revised-2027-037'); assert.equal(at(202).title, 'Les Misérables');
  index.books.forEach((b, i) => assert.equal(b.plan_order, i + 1, `plan_order at ${i + 1}`));
});

test('original relative order and IDs preserved; no ID reused', () => {
  const { index, legacy } = buildIndex();
  const slow = new Set(V2.SLOW_IDS);
  const kept = index.books.map(b => b.id).filter(id => legacy.includes(id) && !slow.has(id));
  assert.deepEqual(kept, legacy.filter(id => !slow.has(id)));
  assert.ok(!index.books.some(b => b.title === 'War and Peace' && b.plan_order === 31));
});

test('required set unchanged by the 94 additions', () => {
  const { index } = buildIndex();
  const required = index.books.filter(Queue.committed);
  assert.equal(required.length, 33);
  assert.ok(index.books.filter(b => b.curated_extension).every(b => !Queue.committed(b)));
});

test('next-read queue includes #200 and excludes the daily classics', () => {
  const { index } = buildIndex();
  const q = Queue.getQueue(index.books, [], [], {});
  assert.equal(q.length, 200);
  assert.ok(q.some(b => b.plan_order === 200));
  assert.ok(!q.some(b => V2.SLOW_IDS.includes(b.id)));
});
