# The shared module, `common/` — v1.56.1 (2026-11-17)

**TODO item 85 (a)** (launch 1). PR #205; the deploy workflow went to `main` first in PR #204.
The owner approved the plan and gave the go on 2026-11-17.

## What changed and why

Launch 1 adds a second product, the Clients app (item 86). It needs the same sign-in and the
same way of reading and saving SharePoint lists that Timeline has. Two copies of that code
would drift apart, so it now lives in one folder every product loads. D4 planned this for when
product #2 starts.

- **`common/common.js`** holds what every product needs, moved word for word out of
  `timeline/index.html`:
  - the Systems constants (the Entra IDs, the site, every list's name);
  - sign-in and the expired-sign-in prompt;
  - the Graph calls and the storage seam, `store` (item 48);
  - toasts and the sync pill.
- **`common/common.css`** holds the colour and font tokens (`--ts-*`, `--sans`, `--mono`), the
  toast strip and the sync pill.
- **`common/msal-browser.min.js`**: the Microsoft sign-in library moved here from `timeline/`.
- **Timeline loads them as `../common/`.** It keeps the parts that are its own: where toasts
  sit on its pages, the sign-in button (it replays Timeline's unsaved changes), and its save
  queue.
- **The tags carry the version** (`common.js?v=1.56.1`). GitHub Pages lets browsers keep each
  file for 10 minutes, so without it a new Timeline page could run against an old shared file.
  `npm run notes`, which every release already runs, stamps the version.

**Nothing changes for users.** The project page renders identically before and after; the only
difference is the version label, v1.56.0 to v1.56.1. No SharePoint list, column or Entra
setting changed.

## Known limits and follow-ups

- **Item 85 (b):** the admin checks and the update check stay in Timeline for now. They depend
  on Timeline's staff roster and on its editing state (drags, drafts, open editors), so they
  move with the Clients app (item 86), which will load the roster too.
- **A risk that comes with sharing:** a mistake in `common/` breaks every product at once.
  Every Timeline suite runs through the shared file, so CI catches it for Timeline. Each new
  product brings its own suites.
- **A small caching window remains:** an old Timeline page still open right after a release
  can fetch the new shared file. Keep `common/` changes compatible with the previous release
  for one release. For the same reason, MSAL keeps an identical copy at its two old paths
  (the root and `timeline/`) so a page cached from before the move still signs in; item 49's
  clean-up step deletes them.
- The Systems page keeps its own small copy of the tokens for now; it moves onto
  `common.css` with the shell (style §13 step 4).
- Timeline is no longer a single file: it's one file plus `common/`. Still no build step.

## Checks

`tests/test-v1561.js` (28 checks):
- `common/` holds the three files, and Timeline loads them in the right order;
- both tags carry the running version, and `npm run notes` stamps it;
- every moved name lives only in `common/`, and Timeline keeps its own hooks;
- the shared file works alone on a bare page: toasts, the sync pill and the sign-in prompt;
- Timeline boots on it, on a saved project and on the New Project draft, and a save goes out
  through the shared `store`;
- the Entra client ID, tenant ID and scopes are unchanged.

Also:
- The harness now inlines `common/` for every suite. `test-deploy-guard` reads the page as
  served, and the publish check was run against a copy of production next to the new preview.
- In real Chrome, Timeline loaded `common/` as separate files, signed in, saved, and drew the
  project page.
