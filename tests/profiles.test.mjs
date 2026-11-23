import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { buildProfiles, loadDrafts, lint } from '../tools/build-profiles.mjs';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ProfilesV2 = require('../src/js/46b-profiles-v2.js');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));

const catalog = read('catalog/curated-200-plus-2.json');
const supplements = read('src/data/brosia-regular-supplements.json').new_regular_books;
const books = [...catalog.curated_books, ...catalog.daily_slow_reads].map(b => {
  const s = supplements.find(x => x.id === b.id);
  return { id: b.id, title: s?.title || b.title, author: s?.author || b.author };
});
const legacy = new Map();
for (const f of fs.readdirSync(path.join(root, 'src/data')).filter(f => /^rosewood-literary-profiles\d*\.json$/.test(f)))
  for (const p of read('src/data/' + f).profiles) legacy.set(p.book_id, p);
const prev = { ids: [...legacy.keys()], get: id => legacy.get(id) || null, has: id => legacy.has(id) };

test('every draft meets the length standard of the original profiles', () => {
  assert.deepEqual(lint(loadDrafts()), []);
});

test('the new profiles cover exactly the books the original 104 do not', () => {
  const data = buildProfiles({ strict: false });
  assert.equal(data.count, 98);
  const reg = ProfilesV2.extend(prev, data, books);
  assert.equal(reg.count, 202);
  for (const b of books) assert.ok(reg.get(b.id), 'no profile for ' + b.title);
});

test('every profile has at least two checked reference sources', () => {
  const data = buildProfiles({ strict: false });
  const weak = data.profiles.filter(p => p.sources.length < 2).map(p => p.title);
  assert.deepEqual(weak, []);
  for (const p of data.profiles) for (const s of p.sources) assert.match(s.url, /^https:\/\/(openlibrary\.org|en\.wikipedia\.org)\//);
});

test('series books link to their siblings in order', () => {
  const data = buildProfiles({ strict: false });
  const finalEmpire = data.profiles.find(p => p.title === 'The Final Empire');
  assert.deepEqual(finalEmpire.series.sequence.length, 3);
  const hero = data.profiles.find(p => p.title === 'The Hero of Ages');
  assert.ok(hero.related_connections.some(r => r.label === 'The Final Empire' && /read this first/.test(r.note)));
});

test('the validator rejects a profile whose identity does not match the catalog', () => {
  const data = buildProfiles({ strict: false });
  const bad = structuredClone(data);
  bad.profiles[0].title = 'Something Else';
  assert.throws(() => ProfilesV2.extend(prev, bad, books), /identity mismatch/);
  const missing = structuredClone(data);
  missing.profiles.pop();
  assert.throws(() => ProfilesV2.extend(prev, missing, books), /books without a profile/);
});
