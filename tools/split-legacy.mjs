// One-time tool: split the legacy single-file app (handoff source B) into
// readable source files under src/. tools/build.mjs reassembles them.
import fs from 'node:fs';
import path from 'node:path';

const [,, legacyHtml, outDir = 'src'] = process.argv;
if (!legacyHtml) { console.error('usage: node tools/split-legacy.mjs <index.html> [outDir]'); process.exit(1); }

const JS_NAMES = {
  23: 'catalog-reader', 24: 'input-validation', 26: 'override-validator', 27: 'goodreads-import',
  28: 'research-notes', 29: 'awards-original', 30: 'reading-milestones', 31: 'storage-engine',
  32: 'completion-tally', 33: 'suggestions', 34: 'arcs-engine', 35: 'pacing',
  36: 'profiles-16', 37: 'profiles-17', 38: 'profiles-18', 39: 'profiles-19', 40: 'profiles-20',
  41: 'profiles-21', 42: 'profiles-22', 43: 'profiles-23', 44: 'profiles-24', 45: 'profiles-25',
  46: 'profiles-26', 47: 'plan-revision', 48: 'slowread-timeline', 49: 'reader-queue', 50: 'app-ui',
};

const src = fs.readFileSync(legacyHtml, 'utf8');
const re = /<(script|style)([^>]*)>([\s\S]*?)<\/\1>/g;
let i = 0;
const shell = src.replace(re, (whole, tag, attrs, body) => {
  const n = i++;
  const id = (attrs.match(/id="([^"]+)"/) || [])[1];
  const isJson = /application\/json/.test(attrs);
  const isExternal = /\ssrc=/.test(attrs);
  if (isExternal) return whole;
  let rel;
  if (tag === 'style') rel = `css/${String(n).padStart(2, '0')}-${n === 0 ? 'design-system' : 'overrides'}.css`;
  else if (isJson) rel = `data/${id}.json`;
  else rel = `js/${String(n).padStart(2, '0')}-${JS_NAMES[n] || 'script'}.js`;
  fs.mkdirSync(path.join(outDir, path.dirname(rel)), { recursive: true });
  fs.writeFileSync(path.join(outDir, rel), body);
  return `<${tag}${attrs}><!--@include ${rel}--></${tag}>`;
});
fs.writeFileSync(path.join(outDir, 'index.html'), shell);
console.log(`split ${i} blocks into ${outDir}/`);
