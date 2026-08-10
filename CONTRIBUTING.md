# Contributing

Read `CLAUDE.md` first — it holds the hard rules. This document is the how-to.

## Prerequisites

- Node.js 18+ (for the test suites).
- Access to the Twoseven Entra tenant and the `TWOSEVENINC` SharePoint site (to run the
  app against real data).

## Getting set up

```bash
git clone https://github.com/221twoseven/Project-Scheduler.git
cd Project-Scheduler
git checkout development
npm install        # installs jsdom
npm test           # 276 assertions against index.html — should be all green
```

To view the app: open `index.html` in a browser, or `npx serve .` and browse to it.
Sign-in uses your Twoseven Microsoft account.

## Branch model

- **`main`** — production. GitHub Pages deploys it live on every push. Do not commit here
  directly.
- **`development`** — default working branch. Do all work here.
- Promote `development → main` deliberately when a change is tested and ready — via a Pull
  Request (preferred for anything non-trivial, so the diff gets a review) or a merge in
  GitHub Desktop for small changes.

Typical loop with GitHub Desktop: edit locally on `development` → review the changeset →
commit with a clear summary → **Push origin**. When ready to ship, open a PR from
`development` to `main` (or merge).

## Making a change

1. **Keep it small and reviewable.** Don't refactor unrelated working code unless asked.
2. **Edit `index.html`** — the company app. Never touch `Timeline_50.html` (immutable
   reference) or `msal-browser.min.js`.
3. **`APP_REV`** is bumped in one place and shows everywhere the version appears — bump it
   when you ship a build.
4. **Run `npm test`** and get to green before committing. Tests assert behaviour, not
   implementation; when you intentionally change a behaviour, update the assertion to the
   new surface rather than deleting it.
5. **Test both draft and saved paths.** Every feature should be asserted on both the
   new-project draft (`#/project/new`) and a saved project — this is the REV49 lesson
   (see `tests/README.md`).

## Things that need explicit approval first

These are shared with a separately maintained colleague app and/or an external Entra
registration; changing them can break the other application:

- **SharePoint List schema** — renaming/deleting Lists or columns, changing column types.
- **Entra / auth** — client IDs, tenant IDs, Graph scopes, redirect URIs, or the auth
  flow.

Before any substantial architectural change, write up the proposed change, the files it
touches, the risks, and the rollback path, and get sign-off (see `CLAUDE.md`).

## Security

- **Never commit secrets, tokens, passwords, client secrets, or credentials.** This is a
  public repo. Auth tokens are acquired at runtime and live only in `sessionStorage`.
- The `.gitignore` blocks common secret files (`.env`, `*.key`, `*.pem`, …) — don't work
  around it.

## CI

`.github/workflows/ci.yml` runs the full suite on every push and PR to `development` and
`main`. A red build blocks the change from being considered ready.
