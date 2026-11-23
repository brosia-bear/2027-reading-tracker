// One-time cover acquisition: find a real published cover for every catalog book
// and bundle it locally (public/assets/covers/<id>.jpg) so the app never needs
// live lookups. Sources: Open Library search, then Google Books. A cover is only
// accepted when the matched record's title AND author agree with the catalog.
// Provenance for each file is written to catalog/cover-sources.json.
//
// usage: node tools/fetch-covers.mjs [--only id1,id2] [--force]
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const OUT_DIR = path.join(ROOT, 'public', 'assets', 'covers');
const SOURCES = path.join(ROOT, 'catalog', 'cover-sources.json');
const UA = 'BrosiasLibraryCoverFetcher/1.0 (personal non-commercial reading app)';
const args = process.argv.slice(2);
const only = args.includes('--only') ? new Set(args[args.indexOf('--only') + 1].split(',')) : null;
const force = args.includes('--force');

const sleep = ms => new Promise(r => setTimeout(r, ms));
// Open Library often lists Russian authors in Cyrillic; transliterate first.
const CYR = { а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'kh',ц:'ts',ч:'ch',ш:'sh',щ:'shch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya' };
const translit = s => String(s || '').toLowerCase().replace(/[а-яё]/g, ch => CYR[ch] ?? ch);
const norm = s => translit(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/&/g, ' and ').replace(/[^a-z0-9 ]+/g, ' ').replace(/\b(the|a|an)\b/g, ' ').replace(/\s+/g, ' ').trim();
const mainTitle = t => norm(String(t).split(/[:(]/)[0]);
// Transliteration variants so "Dostoyevsky" and "Dostoevsky" match.
const ALIASES = [[/dostoyevsk(iy|y|ii|i)|dostoevsk(iy|ii|i)/g, 'dostoevsky'], [/tolstoi/g, 'tolstoy'], [/chekov/g, 'chekhov'], [/turgeniev/g, 'turgenev'], [/gogol'/g, 'gogol']];
const alias = s => ALIASES.reduce((v, [re, to]) => v.replace(re, to), s);
const firstAuthor = a => String(a).split(/,| and | & /)[0].trim();
const surname = a => alias(norm(firstAuthor(a))).split(' ').filter(Boolean).pop() || '';
const shortTitle = t => String(t).split(/[:(]/)[0].trim();

// Editions that are not the book itself: adaptations, study guides, graphic
// novels, and omnibus volumes that bundle several works.
const NOT_THE_BOOK = /graphic novel|adapt(ed|ation)|young (adult|reader)|coles notes|cliffs ?notes|sparknotes|study guide|summary|analysis of|workbook|\/|;| and other| & other|trilogy|collection|boxed set|omnibus|volume \d/i;
function titleMatches(candidate, wanted) {
  const wantedRaw = String(wanted).toLowerCase();
  if (NOT_THE_BOOK.test(String(candidate)) && !NOT_THE_BOOK.test(wantedRaw)) return false;
  const c = mainTitle(candidate), w = mainTitle(wanted);
  return c === w || (w.length > 6 && (c.startsWith(w) || w.startsWith(c) && c.length > w.length * 0.6));
}
function authorMatches(candidates, wanted) {
  const s = surname(wanted);
  return (candidates || []).some(a => alias(norm(a)).split(' ').includes(s));
}

async function getJson(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    let res; try { res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) }); } catch { await sleep(3000 * (attempt + 1)); continue; }
    if (res.status === 429 || res.status >= 500) { await sleep(3000 * (attempt + 1)); continue; }
    if (!res.ok) return null;
    try { return await res.json(); } catch { await sleep(3000 * (attempt + 1)); continue; }
  }
  return null;
}
async function getImage(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    let res; try { res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(20000) }); } catch { await sleep(3000 * (attempt + 1)); continue; }
    if (res.status === 429 || res.status >= 500) { await sleep(3000 * (attempt + 1)); continue; }
    if (!res.ok) return null;
    const type = res.headers.get('content-type') || '';
    if (!/image\/(jpeg|png|webp)/.test(type)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const dims = imageSize(buf);
    // Reject blank placeholders and tiny thumbnails.
    if (buf.length < 6000 || !dims || dims.w < 120 || dims.h < 170 || dims.h < dims.w * 1.1) return null;
    return { buf, type, ...dims };
  }
  return null;
}
function imageSize(buf) {
  if (buf[0] === 0x89 && buf[1] === 0x50) return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker))
        return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  return null;
}

async function fromOpenLibrary(book) {
  const fields = 'key,title,author_name,cover_i,edition_count,first_publish_year';
  const queries = [
    new URLSearchParams({ title: shortTitle(book.title), author: firstAuthor(book.author), limit: '20', fields }),
    new URLSearchParams({ q: `${shortTitle(book.title)} ${surname(book.author)}`, limit: '25', fields }),
  ];
  for (const q of queries) {
    const data = await getJson(`https://openlibrary.org/search.json?${q}`);
    const docs = (data?.docs || []).filter(d => d.cover_i && titleMatches(d.title, book.title) && authorMatches(d.author_name, book.author));
    docs.sort((a, b) => (b.edition_count || 0) - (a.edition_count || 0));
    for (const d of docs.slice(0, 3)) {
      const url = `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg?default=false`;
      const img = await getImage(url);
      if (img) return { img, source: 'Open Library', record: `https://openlibrary.org${d.key}`, matched_title: d.title,
        matched_author: (d.author_name || []).join(', '), image_url: url };
      await sleep(400);
    }
    await sleep(600);
  }
  return null;
}

async function fromGoogleBooks(book) {
  const q = `intitle:${mainTitle(book.title)} inauthor:${surname(book.author)}`;
  const data = await getJson(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=20&printType=books`);
  const items = (data?.items || []).filter(it => it.volumeInfo?.imageLinks && titleMatches(it.volumeInfo.title, book.title)
    && authorMatches(it.volumeInfo.authors, book.author));
  for (const it of items.slice(0, 5)) {
    const links = it.volumeInfo.imageLinks;
    const base = (links.thumbnail || links.smallThumbnail).replace('http://', 'https://').replace('&edge=curl', '');
    for (const zoom of ['zoom=2', 'zoom=1']) {
      const url = base.replace(/zoom=\d/, zoom);
      const img = await getImage(url);
      if (img) return { img, source: 'Google Books', record: it.volumeInfo.infoLink || `https://books.google.com/books?id=${it.id}`,
        matched_title: it.volumeInfo.title, matched_author: (it.volumeInfo.authors || []).join(', '), image_url: url };
    }
  }
  return null;
}

function catalogBooks() {
  const c = JSON.parse(fs.readFileSync(path.join(ROOT, 'catalog', 'curated-200-plus-2.json'), 'utf8'));
  return [...c.curated_books, ...c.daily_slow_reads].map(b => ({ id: b.id, title: b.title, author: b.author }));
}

const books = catalogBooks().filter(b => !only || only.has(b.id));
fs.mkdirSync(OUT_DIR, { recursive: true });
const sources = fs.existsSync(SOURCES) ? JSON.parse(fs.readFileSync(SOURCES, 'utf8')) : { format: 'brosia-cover-sources-v1', covers: {} };
let found = 0, missing = [];
for (const [i, book] of books.entries()) {
  const existing = sources.covers[book.id];
  if (!force && existing?.file && fs.existsSync(path.join(ROOT, 'public', existing.file))) { found++; continue; }
  let hit = await fromOpenLibrary(book);
  if (!hit) { await sleep(700); hit = await fromGoogleBooks(book); }
  if (hit) {
    const ext = hit.img.type.includes('png') ? 'png' : hit.img.type.includes('webp') ? 'webp' : 'jpg';
    const rel = `assets/covers/${book.id}.${ext}`;
    fs.writeFileSync(path.join(ROOT, 'public', rel), hit.img.buf);
    sources.covers[book.id] = { title: book.title, author: book.author, file: rel, width: hit.img.w, height: hit.img.h,
      source: hit.source, record: hit.record, matched_title: hit.matched_title, matched_author: hit.matched_author,
      image_url: hit.image_url, fetched: new Date().toISOString().slice(0, 10) };
    found++;
    console.log(`[${i + 1}/${books.length}] ok   ${book.title} — ${hit.source} (${hit.img.w}x${hit.img.h})`);
  } else {
    sources.covers[book.id] = { title: book.title, author: book.author, file: null, source: null };
    missing.push(book);
    console.log(`[${i + 1}/${books.length}] MISS ${book.title} — ${book.author}`);
  }
  fs.writeFileSync(SOURCES, JSON.stringify(sources, null, 1));
  await sleep(900);
}
console.log(`\n${found}/${books.length} covers found. Missing: ${missing.length}`);
for (const m of missing) console.log(`  - ${m.id}  ${m.title} — ${m.author}`);
