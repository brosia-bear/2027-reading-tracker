// Assemble src/ into dist/: inlines css/js/json blocks into index.html and
// copies static files from public/. No dependencies.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const SRC = path.join(root, 'src');
const PUB = path.join(root, 'public');
const DIST = path.join(root, 'dist');

export function assemble() {
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
  console.log('built dist/');
}
