# Project Scheduler — Timeline (Shop Dashboard)

A single-file Gantt and scheduling dashboard for Twoseven's shop. It shows projects,
phases, staff, and to-dos on a timeline and calendar, and persists everything to
SharePoint through Microsoft Graph. It runs as a static page on GitHub Pages with
Microsoft Entra (MSAL) sign-in — there is no server of our own.

- **Live app:** `index.html`, served via GitHub Pages from the `main` branch.
- **Current build:** REV50 (~5,900 lines in one HTML file).

## Who this is for

Not everyone who works on this app is a programmer — and that's expected. It's edited by
systems designers, shop staff, and managers as well as developers. You don't need to
install anything or use a terminal to read, review, or make small edits: you can do all
of it through **GitHub in your web browser**. `CONTRIBUTING.md` walks through the
browser-based workflow step by step. When something in the docs assumes coding knowledge,
treat it as optional background, not a prerequisite.

## Repository layout

| Path | What it is |
|---|---|
| `index.html` | **The company application — the primary implementation file.** |
| `msal-browser.min.js` | MSAL auth library, vendored locally (not a CDN). Loaded by `index.html` as a sibling — must stay at repo root. |
| `reference/Timeline_50.html` | **Immutable reference** — frozen copy of the colleague's working REV50 build. Never modified; used as a diff baseline and the `npm run test:ref` control. |
| `tests/` | jsdom regression suites (276 assertions) and the `harness.js` that boots a build with MSAL and `fetch` stubbed. See `tests/README.md`. |
| `docs/` | Architecture reference, hosting/auth setup (`SETUP.md`), handoff notes, and the backlog (`TODO.md`). |
| `CLAUDE.md` | Working rules and guardrails for anyone (human or AI) making changes. **Read this first.** |
| `CONTRIBUTING.md` | How to run, test, branch, and ship. |
| `LICENSE` | Proprietary — Twoseven, all rights reserved. |

## Quick start

```bash
# 1. Install the one dev dependency (jsdom, for the tests)
npm install

# 2. Run the full regression suite against the company app
npm test

# 3. Run it against the immutable reference build instead
npm run test:ref
```

To view the app locally, open `index.html` in a browser, or serve the folder
(`npx serve .`) and browse to it. Sign-in requires the Twoseven Entra tenant.

## How it fits together (one paragraph)

`index.html` is a vanilla-JS single-page app. On load it signs the user in with MSAL,
resolves the SharePoint site, and reads four Lists via Microsoft Graph into in-memory
state. A 45-second poll picks up other people's edits; local edits are written back as
optimistic, diffed Graph `POST`/`PATCH`/`DELETE` calls with a sync-status pill, one
retry, and visible Undo. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full
picture, [docs/SETUP.md](docs/SETUP.md) for the hosting and Entra/auth configuration, and
[docs/Timeline-Handoff.md](docs/Timeline-Handoff.md) for the original developer's detailed
handoff.

## Ground rules (see `CLAUDE.md` for the full set)

- `reference/Timeline_50.html` is a read-only reference — never edit it.
- Work on the `development` branch; `main` is production / GitHub Pages.
- The SharePoint Lists and Entra app are **shared** with a separately maintained
  colleague app. Do not change the List schema or the auth configuration without
  explicit approval — it can break the other application.
- Never commit secrets, tokens, or credentials. This is a public repo.
- Run `npm test` after any change to `index.html`.
