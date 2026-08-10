# Contributing

Read `CLAUDE.md` first — it holds the hard rules. This document is the how-to.

**You don't have to be a programmer to contribute.** This app is worked on by systems
designers, shop staff, and managers as well as developers. If you're not a coder, the
browser workflow below is all you need — no installs, no terminal. The developer setup
(running tests locally) is optional and only matters if you're changing the app's logic.

## Two ways to work

- **In the browser (recommended if you're not a developer).** Everything — reading,
  editing, reviewing, and shipping — can be done on github.com. See the next section.
- **On your computer (for developers).** Clone the repo and run the tests locally before
  shipping. See "Developer setup" further down.

## Editing in the browser (no installation)

This is the simplest path and works entirely on github.com.

1. Go to the repo: **https://github.com/221twoseven/Project-Scheduler**
2. **Switch to the `development` branch** using the branch dropdown (top-left, usually
   says `main`). Never edit `main` directly — it's the live production site.
3. Click the file you want to change (for the app itself, that's **`index.html`**).
4. Click the **pencil icon** (✏️ "Edit this file") in the top-right of the file view.
5. Make your change in the editor.
6. Scroll down to **Commit changes**. Write a short summary of what you did, make sure
   **"Commit directly to the `development` branch"** is selected, and click
   **Commit changes**.
7. When the change is ready to go live, open a **Pull Request** from `development` into
   `main` (GitHub shows a "Compare & pull request" button, or use the Pull requests tab).
   This is the review step; once merged, GitHub Pages publishes it automatically.

> Tip: for anything bigger than a tiny edit, it's safer to commit to a *new* branch off
> `development` (GitHub offers this on the commit screen) and open a Pull Request, so the
> change can be looked at before it lands.

If you prefer **GitHub Desktop**, the equivalent loop is: make sure you're on
`development` → edit files locally → review the changeset → commit with a clear summary →
**Push origin** → open a Pull Request into `main` when ready.

## Branch model

- **`main`** — production. GitHub Pages deploys it live automatically. Do not edit or
  commit here directly.
- **`development`** — the working branch. Do all work here.
- Promote `development → main` through a **Pull Request** when a change is tested and
  ready. The Pull Request is the review-and-ship step.

## Developer setup (optional — for running tests locally)

Only needed if you're changing the app's behaviour and want to run the automated tests.

```bash
git clone https://github.com/221twoseven/Project-Scheduler.git
cd Project-Scheduler
git checkout development
npm install        # installs jsdom
npm test           # 276 assertions against index.html — should be all green
```

To view the app: open `index.html` in a browser, or `npx serve .` and browse to it.
Sign-in uses your Twoseven Microsoft account. (Requires access to the Twoseven Entra
tenant and the `TWOSEVENINC` SharePoint site to load real data.) The hosting and
Entra/auth configuration — live URL, redirect URI, scopes, admin consent — is documented
in [docs/SETUP.md](docs/SETUP.md).

Even if you edit in the browser, the automated tests still run for you: CI checks every
change on GitHub (see the CI section below), so a broken edit gets flagged on the Pull
Request.

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
