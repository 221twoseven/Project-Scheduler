# Onboarding: run your own copy of the lean app with live data

This is for the **owner of the original app** who wants to run and develop the lean
build against **live SharePoint data** — without being able to change production.

The model: **you work in a fork** (your own copy of the repo, under your GitHub account).
A fork can never merge into the main project, so production is safe by design.

---

## Part A — what you do (once)

1. **Fork the repo.** Go to <https://github.com/221twoseven/Project-Scheduler> and click
   **Fork** (top right). This creates `https://github.com/YOUR-USERNAME/Project-Scheduler`.
2. **Turn on GitHub Pages for your fork.** In *your* fork: **Settings → Pages →** set
   **Source = Deploy from a branch**, **Branch = `main`**, **Folder = `/ (root)`**, Save.
3. After a minute your live app is at:
   **`https://YOUR-USERNAME.github.io/Project-Scheduler/`** (note the trailing slash).

You now have the app running — but sign-in won't work yet until Part B is done.

## Part B — what the repo owner / Azure admin does (once)

The app only allows Microsoft sign-in from web addresses that are **registered** in the
Entra app. Your fork's address has to be added, or sign-in fails.

- In the **Azure portal → Entra ID → App registrations →** the app with Client ID
  `5ba3aabe-81f7-41c9-92a4-83a45d5407ab` **→ Authentication**.
- Under the **Single-page application** platform, **Add URI**:
  **`https://YOUR-USERNAME.github.io/Project-Scheduler/`** (exact, with trailing slash). Save.
- Nothing else changes — no new permissions, no effect on the production app or the
  colleague's app. This is purely additive.

## Part C — sign in and confirm live data

1. Open `https://YOUR-USERNAME.github.io/Project-Scheduler/`.
2. Sign in with **your twoseven Microsoft account** (the app is single-tenant — a personal
   or outside account won't work).
3. You should see the same projects and tasks as production. That confirms live data.

If sign-in throws an `AADSTS...redirect` error, Part B isn't done (or the URL doesn't match
exactly — check the trailing slash).

---

## ⚠️ Your copy writes to the REAL shared data

Because your fork uses the same lists as production, **anything you create, edit, or delete
while testing changes the live shared data** that everyone (and the colleague's app) sees.

While developing, please:

- Make test projects **obviously named** (e.g. `ZZ-TEST — ignore`) and delete them when done.
- **Don't edit or delete records you didn't create.**
- Treat destructive actions (delete) as real.

If safe isolation becomes important, the clean fix is a **separate set of test Lists** in
SharePoint that your fork points at — ask the owner; it's a small config change, not done
by default.

## How you develop

- Edit `index.html` in your fork (directly on GitHub, or with Claude Code on your machine).
- Push to your fork's `main` — GitHub Pages redeploys automatically in ~1 minute.
- Run the test suite before trusting a change: `npm test` (needs Node + `npm install`).

## What you can and can't do

- ✅ Run, use, and develop your own copy freely.
- ✅ See and interact with live SharePoint data.
- ❌ You **cannot merge** anything into the main project — a fork can't, by design.
- ⚠️ You *can* technically open a pull request from your fork, but **please don't** — it
  won't be merged. If a change of yours is worth adopting, tell the owner and they'll
  re-create it on the real `development` branch.
