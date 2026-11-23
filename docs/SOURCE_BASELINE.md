# Source baseline

Recorded 2026-11-23T05:17Z.

| Artifact | SHA-256 |
|---|---|
| `/c/Users/brosi/Downloads/Brosias_Library_ALL_CODE_COMPLETE_CLAUDE_HANDOFF.zip` | `9a3c1bd7bf9d3383b6bdbdc1427161c01bbad2aeaf6fa7102835d7f85b159074` |
| `01_SOURCE_CODE/A_ORIGINAL_USER_SUPPLIED_APPLICATION_104_ERA/index.html` | `b858ada7e31171e816fdc196750270e7b5dc8fc03210ed4341773f39175474d2` |
| `01_SOURCE_CODE/B_LAST_106_BOOK_NETLIFY_APPLICATION_HISTORICAL/index.html` | `c5f529c58abca14df832fff76a104003182e018dbfa93697abbcb55f394cbdfd` |
| `01_SOURCE_CODE/C_INTERACTIVE_202_BOOK_CODED_PROTOTYPE/Brosias_Library_202_Coded_Prototype/index.html` | `8ee17f45f6129f51fc79e98bfa4e28a57252f3b5aa4b8c96cc2559912ba8ce43` |
| `03_CATALOGS_REPORTS/PROPOSED_200_PLUS_2_CATALOG.json` | `73b422b27cae69d95f6215d1f9046f800811bc8c3bbdc5f5e3feb128576edaf5` |
| `02_PROMPTS/CURRENT_MASTER_PROMPT_200_PLUS_2.md` | `31addbcaa69377d8197c7e7178102ca390399668d2936a299b2ff71398adf7d8` |

## Choice of base

- **Base: source B** (`B_LAST_106_BOOK_NETLIFY_APPLICATION_HISTORICAL/index.html`). It is a strict superset of
  source A: identical modules plus the Piranesi / Left Hand of Darkness supplements, a cover-candidates
  manifest and later UI fixes. The handoff notes B had counting/menu bugs; those are tracked and fixed
  here rather than reverting to A.
- No existing user data: the owner confirmed (2026-11-22) the app was never deployed or used, so no
  legacy browser-storage migration from a live origin is required. Legacy-format backup import is still kept.
- `tools/split-legacy.mjs` split B's 52 inline blocks into `src/`; `tools/build.mjs` reassembles them.
  The initial build output was verified **byte-identical** to B's `index.html` (`cmp`).

## Hosting / sync decisions (owner-approved)

- Hosting: GitHub Pages (`https://brosia-bear.github.io/2027-reading-tracker/`), not Netlify (no existing site).
- Sync: Supabase free tier (project `ldxnwwctiwkfzzvxleun`), instead of Firebase. The spec permits an
  equivalent free provider.
- iPhone/iPad/Windows: installable PWA (Safari Add to Home Screen; Edge "Install app" on Windows).
