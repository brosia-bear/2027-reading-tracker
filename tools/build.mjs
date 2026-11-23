// Assemble src/ into dist/: inlines css/js/json blocks into index.html and
// copies static files from public/. No dependencies.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { buildProfiles } from './build-profiles.mjs';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const SRC = path.join(root, 'src');
const PUB = path.join(root, 'public');
const DIST = path.join(root, 'dist');

// Bundled real covers: { bookId: "assets/covers/<id>.jpg" } from the provenance file.
export function writeCoverIndex() {
  const srcFile = path.join(root, 'catalog', 'cover-sources.json');
  const covers = {};
  if (fs.existsSync(srcFile)) {
    for (const [id, c] of Object.entries(JSON.parse(fs.readFileSync(srcFile, 'utf8')).covers || {}))
      if (c.file && fs.existsSync(path.join(PUB, c.file))) covers[id] = c.file;
  }
  fs.writeFileSync(path.join(SRC, 'data', 'brosia-covers.json'), JSON.stringify({ format: 'brosia-bundled-covers-v1', covers }));
  return Object.keys(covers).length;
}

// Discover tags: catalog/facets.txt -> src/data/brosia-facets.json keyed by book ID.
export function writeFacets() {
  const cat = JSON.parse(fs.readFileSync(path.join(root, 'catalog', 'curated-200-plus-2.json'), 'utf8'));
  const byTitle = new Map([...cat.curated_books, ...cat.daily_slow_reads].map(b => [b.title, b.id]));
  const out = {};
  const lines = fs.readFileSync(path.join(root, 'catalog', 'facets.txt'), 'utf8').split(/\r?\n/).filter(l => l.trim() && !l.startsWith('#'));
  for (const line of lines) {
    const [title, form, genres, moods, themes, length, effort] = line.split('|').map(s => s.trim());
    const id = byTitle.get(title);
    if (!id) throw Error('facets.txt: unknown title ' + title);
    if (out[id]) throw Error('facets.txt: duplicate ' + title);
    const list = s => s.split(',').map(x => x.trim()).filter(Boolean);
    if (!['short', 'medium', 'long', 'epic'].includes(length) || !['light', 'moderate', 'demanding'].includes(effort)) throw Error('facets.txt: bad length/effort for ' + title);
    out[id] = { form, genres: list(genres), moods: list(moods), themes: list(themes), length, effort };
  }
  const missing = [...byTitle].filter(([, id]) => !out[id]).map(([t]) => t);
  if (missing.length) throw Error('facets.txt missing: ' + missing.join('; '));
  fs.writeFileSync(path.join(SRC, 'data', 'brosia-facets.json'), JSON.stringify({ format: 'brosia-facets-v1', books: out }));
}

// Profiles for the books the original research cohorts do not cover.
export function writeProfiles() {
  fs.writeFileSync(path.join(SRC, 'data', 'brosia-literary-profiles-v2.json'), JSON.stringify(buildProfiles()));
}

export function assemble() {
  writeFacets();
  writeCoverIndex();
  writeProfiles();
  fs.copyFileSync(path.join(root, 'catalog', 'curated-200-plus-2.json'), path.join(SRC, 'data', 'brosia-catalog-v2.json'));
  const shell = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
  return shell.replace(/<!--@include ([^>]+?)-->/g, (_, rel) => fs.readFileSync(path.join(SRC, rel), 'utf8'));
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    e.isDirectory() ? copyDir(a, b) : fs.copyFileSync(a, b);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(root, 'tools', 'build.mjs')) {
  fs.rmSync(DIST, { recursive: true, force: true });
  copyDir(PUB, DIST);
  fs.writeFileSync(path.join(DIST, 'index.html'), assemble());
  // Service worker: precache every shipped file; version = content hash.
  const files = [];
  const walk = dir => { for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name); if (e.isDirectory()) walk(p); else files.push(path.relative(DIST, p).split(path.sep).join('/')); } };
  walk(DIST);
  const shipped = files.filter(f => f !== 'sw.js').sort();
  const h = crypto.createHash('sha256');
  for (const f of shipped) h.update(f).update(fs.readFileSync(path.join(DIST, f)));
  const version = 'brosia-' + h.digest('hex').slice(0, 12);
  let sw = fs.readFileSync(path.join(DIST, 'sw.js'), 'utf8');
  sw = sw.replace(/const VERSION='[^']*';/, `const VERSION='${version}';`)
         .replace(/const PRECACHE=\[[^\]]*\];/, 'const PRECACHE=' + JSON.stringify(['./', ...shipped.map(f => './' + f)]) + ';');
  if (!sw.includes('"./index.html"') || /book-covers\//.test(sw) || !sw.includes(version)) throw Error('service worker precache list was not generated');
  fs.writeFileSync(path.join(DIST, 'sw.js'), sw);
  console.log(`built dist/ (${shipped.length} files, sw ${version})`);
}
