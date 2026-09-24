# reference/

Frozen baselines. **Nothing here is the live app** — the app is `index.html` at the repo
root.

## `Timeline_50.html`

The untouched REV50 build handed off by the colleague who wrote the original app.
`index.html` began as a byte-for-byte copy of this file.

**Do not edit it.** It exists to:

- **diff against** — the source of truth for "was this behaviour always like this, or did
  we change it?" as the company `index.html` diverges from REV50; and
- **serve as a test control** — `npm run test:ref` runs the full suite against it, so you
  can tell "our change broke a test" from "the test was already wrong."

> Note: opened directly in a browser from this folder, it won't sign in — its
> `<script src="msal-browser.min.js">` expects that file as a sibling, and the vendored
> copy lives at the repo root (next to the live `index.html`). This doesn't affect the
> tests, which stub MSAL. If you ever need to run the reference build live, copy
> `msal-browser.min.js` into this folder.

## `Handoff-Notes.md`

The original developer's plain-English handoff, consolidated with their developer notes.
It explains *why* the app is built and hosted the way it is (single file, Pages, Entra
choices, SharePoint conventions). History and rationale only — its world-state claims
(URLs, accounts, "current build") are stale. Current truth lives in `docs/SETUP.md`,
`docs/ARCHITECTURE.md`, and `CONTRIBUTING.md`.

## `Project-History.md` / `Project-History_TLDR.md`

A dated narrative (and one-page summary) of how the prototype became company
infrastructure, prepared 2026-09-03. Not kept current.
