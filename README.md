# Brosia's Library

A private 2027 reading library: 200 curated books in a chosen reading order, two
daily classics (*War and Peace* mornings, *Les Misérables* evenings), notes, pacing,
awards, a mood-based Discover page, and sync across iPhone, iPad and Windows.

It is an installable web app (PWA):

- **iPhone / iPad:** open the site in Safari → Share → **Add to Home Screen**.
- **Windows:** open the site in Edge → **⋯ → Apps → Install this site as an app**.

Live site: https://brosia-bear.github.io/2027-reading-tracker/

## What's inside

| Path | What |
|---|---|
| `src/index.html` | Page shell; `<!--@include …-->` markers are filled in by the build |
| `src/css/` | Original design system + `02-theme.css` (the current look) |
| `src/js/` | App modules (see below) |
| `src/data/` | Bundled data: slow-read calendars, literary profiles, awards, seed catalog |
| `catalog/curated-200-plus-2.json` | The 200 + 2 catalog, in order, with substitution notes |
| `catalog/facets.txt` | Discover tags (moods, genres, themes, length, effort) for every book |
| `catalog/cover-sources.json` | Where each bundled cover came from |
| `public/` | Static files: covers, award art, fonts, icons, service worker |
| `supabase/library_records.sql` | Sync table and row-level security (run once in Supabase) |
| `tools/` | `build.mjs`, `serve.mjs`, `fetch-covers.mjs`, `split-legacy.mjs` |
| `tests/` | Catalog, Discover, ladders and sync tests (`node --test tests/`) |
| `docs/SOURCE_BASELINE.md` | Source checksums and the decisions behind this build |

Key modules: `31-storage-engine.js` (on-device storage), `32b-sync.js` (cloud sync),
`49b-catalog-v2.js` (200 + 2 catalog), `49c-discover.js` (Discover engine),
`49d-ladders.js` (shelf milestones), `50-app-ui.js` (the interface).

## Develop

```sh
node tools/build.mjs      # build into dist/
node tools/serve.mjs      # http://localhost:4173
node --test tests/        # run tests
node tools/fetch-covers.mjs   # fetch any missing covers (records sources)
```

Pushing to `main` runs the tests and deploys `dist/` to GitHub Pages.

## Sync

Sign in under **Settings → Sync across your devices**. The library is saved on the
device first and uploads in small records, so offline edits are kept and merge
cleanly. Only the signed-in account can read its rows (Supabase row-level security).
