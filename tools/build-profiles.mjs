// Turns the hand-written profile drafts in catalog/profiles-v2/*.json plus the
// checked reference records in catalog/profile-sources.json into the app's
// profile dataset (src/data/brosia-literary-profiles-v2.json).
// `node tools/build-profiles.mjs --lint` lists drafts with thin sections.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const words = s => String(s || '').trim().split(/\s+/).filter(Boolean).length;
export const MIN_WORDS = { sum: 45, bg: 38, br: 28, la: 28, cx: 26, fit: 13, mis: 13 };

export function loadDrafts() {
  const dir = path.join(root, 'catalog/profiles-v2');
  const out = [];
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()) out.push(...read('catalog/profiles-v2/' + f));
  return out;
}

export function lint(drafts) {
  const problems = [];
  for (const d of drafts) {
    const thin = Object.entries(MIN_WORDS).filter(([k, n]) => words(d[k]) < n).map(([k]) => `${k}(${words(d[k])})`);
    if ((d.th || []).length < 3 || d.th.some(t => words(t[1]) < 8)) thin.push('themes');
    if ((d.rq || []).length < 3 || (d.dq || []).length < 2) thin.push('questions');
    if (thin.length) problems.push(`${d.id}: ${thin.join(' ')}`);
  }
  return problems;
}

export function buildProfiles({ strict = true } = {}) {
  const catalog = read('catalog/curated-200-plus-2.json');
  const supplements = read('src/data/brosia-regular-supplements.json').new_regular_books;
  const sources = fs.existsSync(path.join(root, 'catalog/profile-sources.json')) ? read('catalog/profile-sources.json').books : {};
  const books = new Map();
  [...catalog.curated_books, ...catalog.daily_slow_reads].forEach(b => books.set(b.id, { id: b.id, title: b.title, author: b.author, order: b.display_order }));
  supplements.forEach(b => books.set(b.id, { ...books.get(b.id), id: b.id, title: b.title, author: b.author }));
  const resolve = ref => {
    const hits = [...books.keys()].filter(id => id === ref || id.endsWith('-' + ref) || id.endsWith(ref));
    if (hits.length !== 1) throw Error(`related book "${ref}" matches ${hits.length} books`);
    return hits[0];
  };
  const drafts = loadDrafts();
  const seen = new Set();
  const bySeries = new Map();
  for (const d of drafts) if (d.s?.[1] != null) {
    const list = bySeries.get(d.s[0]) || [];
    list.push(d); bySeries.set(d.s[0], list);
  }
  const profiles = drafts.map(d => {
    const b = books.get(d.id);
    if (!b) throw Error('unknown book ' + d.id);
    if (seen.has(d.id)) throw Error('duplicate draft ' + d.id);
    seen.add(d.id);
    const src = sources[d.id] || {};
    const checked = src.checked_on || null;
    const list = [];
    if (src.openlibrary) list.push({ id: d.id + '-ol', title: `${src.openlibrary.title} — work record`, organization: 'Open Library (Internet Archive)', url: src.openlibrary.url, checked_on: checked, source_type: 'catalogue_record', scope: 'Work identity, author attribution and edition history', confidence: 'high', supports: ['Title and author attribution', 'Existence of published English editions'], notes: 'Open Library work record located by title and author search.' });
    if (src.work) list.push({ id: d.id + '-wp', title: src.work.title, organization: 'Wikipedia', url: src.work.url, checked_on: checked, source_type: 'reference_article', scope: 'Work overview: premise, publication history and reception', confidence: 'medium', supports: [src.work.description || 'Work overview', 'First publication and context'], notes: 'Community-edited reference article; used for bibliographic orientation, not for interpretation.' });
    if (src.author) list.push({ id: d.id + '-wpa', title: src.author.title, organization: 'Wikipedia', url: src.author.url, checked_on: checked, source_type: 'reference_article', scope: 'Author biography and other works', confidence: 'medium', supports: [src.author.description || 'Author biography'], notes: 'Community-edited reference article for author background.' });
    else if (src.openlibrary?.author_url) list.push({ id: d.id + '-ola', title: `${src.openlibrary.author} — author record`, organization: 'Open Library (Internet Archive)', url: src.openlibrary.author_url, checked_on: checked, source_type: 'catalogue_record', scope: 'Author identity and bibliography', confidence: 'high', supports: ['Author attribution', 'Other works by the author'], notes: 'Open Library author record linked from the work record.' });
    for (const [i, x] of (d.src || []).entries()) list.push({ id: `${d.id}-x${i}`, checked_on: checked, source_type: 'reference_page', confidence: 'high', notes: 'Publisher or official page.', ...x });
    const siblings = d.s && d.s[1] != null ? (bySeries.get(d.s[0]) || []).slice().sort((a, z) => a.s[1] - z.s[1]) : [];
    const related = [
      ...siblings.filter(x => x.id !== d.id).map(x => ({ book_id: x.id, label: books.get(x.id).title, note: `Book ${x.s[1]} of ${d.s[0]}${x.s[1] < d.s[1] ? '; read this first.' : '.'}` })),
      ...(d.rel || []).map(([ref, note]) => { const id = resolve(ref); return { book_id: id, label: books.get(id).title, note }; })
    ];
    return {
      book_id: d.id, plan_order: b.order ?? null, title: b.title, author: b.author,
      profile_status: list.length >= 2 ? 'sources_checked' : 'editorial_draft',
      verified_at: checked,
      verification_scope: `Title, author and publication facts checked on ${checked || 'an unrecorded date'} against the reference records listed below. Summary, themes, reading guidance and questions are original editorial writing, spoiler-light, and not a claim of authorial intent. The edition you own has not been identified.`,
      publication: d.p ? { first_publication_year: null, first_publication_period: d.p, basis: 'Approximate date of composition for an ancient text; individual translations differ.' }
        : { first_publication_year: d.y, basis: 'First publication of the original work, not the date of any particular edition or translation.' },
      genre_and_form: d.g,
      series: d.s ? { name: d.s[0], position: d.s[1], sequence: siblings.map(x => x.id), sequence_status: d.s[1] == null ? 'Loosely connected setting; reads as a standalone.' : `Book ${d.s[1]} of ${siblings.length || '?'} in your plan; later books assume earlier ones.` }
        : { name: 'Standalone', position: null, sequence: [], sequence_status: 'Not part of a numbered series.' },
      summary: d.sum, author_and_work_background: d.bg, before_reading: d.br, literary_approach: d.la, context: d.cx,
      themes: d.th.map(([label, discussion]) => ({ label, discussion, basis: 'editorial_interpretation' })),
      personal_fit: d.fit, possible_mismatch: d.mis,
      content_guidance: { status: 'limited_non_exhaustive', notes: d.cw?.length ? d.cw : ['No particular concerns noted; this list is not exhaustive.'] },
      reading_questions: d.rq, discussion_questions: d.dq,
      related_connections: related,
      edition_information: { planned_edition: null, pages: null, audio_minutes_1x: null, examples: [], note: 'Your edition has not been identified; page counts and audio length vary by edition.' },
      spoiler_policy: 'spoiler_light', spoiler_sections: [],
      sources: list
    };
  });
  if (strict) {
    const weak = profiles.filter(p => p.sources.length < 2).map(p => p.title);
    if (weak.length) throw Error('profiles with fewer than two checked sources: ' + weak.join(', '));
  }
  return { schema_version: '1.0', dataset_id: 'brosia-literary-profiles-v2', checked_on: profiles.map(p => p.verified_at).filter(Boolean).sort().pop() || null, count: profiles.length, profiles };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const drafts = loadDrafts();
  if (process.argv.includes('--lint')) {
    const p = lint(drafts);
    console.log(`${drafts.length} drafts; ${p.length} with thin sections`);
    p.forEach(x => console.log('  ' + x));
  } else {
    const data = buildProfiles({ strict: !process.argv.includes('--loose') });
    fs.writeFileSync(path.join(root, 'src/data/brosia-literary-profiles-v2.json'), JSON.stringify(data));
    console.log(`wrote ${data.count} profiles`);
  }
}
