# Project Scheduler — Timeline (Shop Dashboard)

A single-file Gantt and scheduling dashboard for Twoseven's shop. It shows projects,
phases, staff, and to-dos on a timeline and calendar, and persists everything to
SharePoint through Microsoft Graph. It runs as a static page on GitHub Pages with
Microsoft Entra (MSAL) sign-in — there is no server of our own.

Timeline is one product of **Systems**, Twoseven's data-management ecosystem: peer
products (People, Clients, Office, Timeline) over one shared SharePoint dataset, behind
one portal: the Systems page at the site's root. Only Timeline is built today; the
definition is in `docs/Decisions.md` ("What we're building").

- **Live app:** the Systems page (`index.html`) and Timeline (`timeline/index.html`), served
  via GitHub Pages from the `main` branch.
- **Current build:** v1.0.1 (one HTML file — the `APP_VER` constant in `timeline/index.html` is
  the source of truth; this line goes stale, that number doesn't). Versions before
  v1.0.1 were numbered REV1–101: REV1–50 alpha, REV50–100 beta.

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
| `timeline/index.html` | **Timeline, the company application — the primary implementation file.** |
| `common/` | What every Systems product shares: `common.js` (sign-in, the SharePoint data layer, toasts, the sync pill), `common.css` (the colour tokens, toasts, the sync pill) and `msal-browser.min.js`, the MSAL auth library vendored locally (not a CDN). Timeline loads them as `../common/`. |
| `clients/index.html` | Clients, the second Systems product: the client list, its own app (item 86). It owns the Clients list and reads the rest. |
| `index.html` | The Systems page: a static page of product tiles at the site's root. It forwards old Timeline links to `timeline/`. |
| `tests/` | jsdom regression suites (every `tests/test*.js`, run by `tests/run.js`) and the `harness.js` that boots a build with MSAL and `fetch` stubbed. See `tests/README.md`. |
| `docs/` | Architecture reference, hosting/auth setup (`SETUP.md`), design language, and the backlog (`TODO.md`). Retired planning docs and the completed v1 backlog live in `docs/Archive/`; milestone records, one folder per development phase, in `docs/Milestones/`. |
| `reference/` | Frozen, not-actively-maintained material: the REV50 baseline, the original developer's handoff notes, and the project history. |
| `CLAUDE.md` | Working rules and guardrails for anyone (human or AI) making changes. **Read this first.** |
| `CONTRIBUTING.md` | How to run, test, branch, and ship. |
| `LICENSE` | Proprietary — Twoseven, all rights reserved. |

## Quick start

```bash
# 1. Install the one dev dependency (jsdom, for the tests)
npm install

# 2. Run the full regression suite against the company app
npm test
```

To view the app locally, serve the folder (`npx serve .`) and browse to `/timeline/`, or
open `timeline/index.html` in a browser. Sign-in requires the Twoseven Entra tenant.

## How it fits together (one paragraph)

`timeline/index.html` is a vanilla-JS single-page app. On load it signs the user in with MSAL,
resolves the SharePoint site, and reads six Lists via Microsoft Graph into in-memory
state. A 90-second poll picks up other people's edits; local edits are written back as
optimistic, serialized, diffed Graph `POST`/`PATCH`/`DELETE` calls with a sync-status
pill, one retry, and visible Undo. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full
picture, [docs/SETUP.md](docs/SETUP.md) for the hosting and Entra/auth configuration, and
[reference/Handoff-Notes.md](reference/Handoff-Notes.md) for the consolidated developer/maintainer
handoff (setup rationale, conventions, traps, version history).

## Ground rules (see `CLAUDE.md` for the full set)

- Work on the `development` branch; `main` is production / GitHub Pages.
- The SharePoint Lists are shared infrastructure (hand edits, flows, a retired colleague
  app). Schema changes are owner-applied and deliberate — see `CLAUDE.md`; never change
  the auth configuration without explicit instruction.
- Never commit secrets, tokens, or credentials. This is a public repo.
- Run `npm test` after any change to `timeline/index.html` or the Systems page.
