// Checks reference records for books that need a profile and saves them to
// catalog/profile-sources.json:
//  - the Open Library work record (title and author must match; omnibus and
//    "and other stories" editions are rejected) and its author record;
//  - the English Wikipedia articles named in catalog/profile-source-titles.json,
//    accepted only if they exist, are not disambiguation pages, and mention the
//    author's surname (for the work) or the book (for the author).
// Pass --only id1,id2 to re-check particular books.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'catalog/profile-sources.json');
const UA = { 'User-Agent': 'BrosiasLibraryBuild/1.0 (personal reading app build script)' };
const args = process.argv.slice(2);
const only = args.includes('--only') ? new Set(args[args.indexOf('--only') + 1].split(',')) : null;
const today = new Date().toISOString().slice(0, 10);
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));

const { titles, ol_skip: olSkip = [] } = read('catalog/profile-source-titles.json');
const catalog = read('catalog/curated-200-plus-2.json');
const books = new Map([...catalog.curated_books, ...catalog.daily_slow_reads].map(b => [b.id, b]));
const saved = fs.existsSync(OUT) ? read('catalog/profile-sources.json') : { format: 'brosia-profile-sources-v1', books: {} };
if (!only) saved.books = {};

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function json(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(25000) });
      if (r.status === 404) return null;
      if (r.ok) return await r.json();
    } catch {}
    await sleep(1500 * (attempt + 1));
  }
  return null;
}
const norm = s => String(s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim();
const ALIAS = { tolstoy: ['tolstoi', 'tolstoj', 'толстой'], gogol: ['gogolʹ', 'гоголь'], chekhov: ['чехов', 'tchekhov'], pushkin: ['пушкин'], lermontov: ['лермонтов'], bulgakov: ['булгаков'], goncharov: ['гончаров'], zamyatin: ['замятин', 'zamiatin'], solzhenitsyn: ['солженицын'], spinoza: ['spinoza'], addison: ['addison', 'monette'], plato: ['plato', 'πλάτων', 'platon'] };
const surname = a => norm(a.replace(/\(.*\)/, '')).split(' ').pop();
const nameOk = (have, author) => { const s = surname(author); const h = norm(have) + ' ' + String(have || '').toLowerCase(); return [s, ...(ALIAS[s] || [])].some(x => h.includes(x)); };
const BAD_EDITION = /\b(and other|stories and|plays|collected|omnibus|trilogy|selected|works|phaedo|crito)\b|[,;\/]/i;

async function openLibrary(b) {
  const want = norm(b.title.replace(/:.*$/, ''));
  const q = new URLSearchParams({ q: `${b.title.replace(/:.*$/, '')} ${surname(b.author)}`, fields: 'key,title,author_name,author_key,first_publish_year,edition_count', limit: '20' });
  const d = await json('https://openlibrary.org/search.json?' + q);
  const q2 = new URLSearchParams({ title: b.title.replace(/:.*$/, ''), author: surname(b.author), fields: 'key,title,author_name,author_key,first_publish_year,edition_count', limit: '20' });
  const d2 = await json('https://openlibrary.org/search.json?' + q2);
  const ok = [...(d?.docs || []), ...(d2?.docs || [])].filter(x => {
    const t = norm(x.title);
    const titleOk = t === want || t === 'the ' + want || 'the ' + t === want || (t.startsWith(want + ' ') && !BAD_EDITION.test(x.title.slice(want.length)));
    return titleOk && (x.author_name || []).some(n => nameOk(n, b.author));
  }).sort((a, z) => (z.edition_count || 0) - (a.edition_count || 0));
  const doc = ok[0];
  if (!doc) return null;
  const i = (doc.author_name || []).findIndex(n => nameOk(n, b.author));
  return { url: 'https://openlibrary.org' + doc.key, title: doc.title, author: doc.author_name[i], author_url: doc.author_key?.[i] ? `https://openlibrary.org/authors/${doc.author_key[i]}` : null, first_publish_year: doc.first_publish_year ?? null, edition_count: doc.edition_count ?? null };
}
async function wiki(title, test) {
  if (!title) return null;
  const s = await json('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title.replace(/ /g, '_')));
  if (!s || s.type !== 'standard' || !test(s)) return null;
  return { url: s.content_urls.desktop.page, title: s.title, description: s.description || '' };
}

let n = 0;
for (const [id, [workTitle, authorTitle]] of Object.entries(titles)) {
  if (only && !only.has(id)) continue;
  const b = books.get(id);
  if (!b) throw Error('unknown id ' + id);
  const rec = { title: b.title, author: b.author, checked_on: today };
  rec.openlibrary = olSkip.includes(id) ? null : await openLibrary(b);
  rec.work = await wiki(workTitle, s => nameOk(s.extract + ' ' + s.description, b.author));
  rec.author = await wiki(authorTitle, s => nameOk(s.title + ' ' + s.extract, b.author));
  saved.books[id] = rec;
  console.log(`[${++n}] ${b.title} — OL:${rec.openlibrary ? rec.openlibrary.title : '-'} | WP:${rec.work?.title || '-'} | A:${rec.author?.title || '-'}`);
  fs.writeFileSync(OUT, JSON.stringify(saved, null, 1) + '\n');
  await sleep(200);
}
const count = r => (r.openlibrary ? 1 : 0) + (r.openlibrary?.author_url && !r.author ? 1 : 0) + (r.work ? 1 : 0) + (r.author ? 1 : 0);
const weak = Object.entries(saved.books).filter(([, r]) => count(r) < 2);
console.log(`${Object.keys(saved.books).length} checked; ${weak.length} with fewer than two sources`);
for (const [id, r] of weak) console.log('  weak', id, r.title);
