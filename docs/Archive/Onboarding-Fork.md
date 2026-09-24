# Onboarding: run and develop your own copy with live data

This is for the **collaborator** who wants to run and develop the lean build against
**live SharePoint data** — without being able to change what everyone else runs.

**The model: you work on your own branch, `sandbox`, in the main repo.** It publishes to
its own web address, and a branch protection rule stops anything on `sandbox` from reaching
production unless the owner deliberately promotes it. Your copy is always live at:

**`https://221twoseven.github.io/Project-Scheduler/sandbox/`** (note the trailing slash)

> This replaces the older "fork your own repo" approach. It became possible once Pages
> started deploying via GitHub Actions, so a branch can now host a running app. If you'd
> rather have a fully separate repo instead, the fork approach still works — see the bottom.

---

## Part A — what you do (once)

1. **Accept the collaborator invite** to `221twoseven/Project-Scheduler` (check your email
   or <https://github.com/221twoseven/Project-Scheduler/invitations>).
2. That's it for setup — the `sandbox` branch and its web address already exist.

## Part B — what the Azure admin does (once)

The app only allows Microsoft sign-in from web addresses **registered** in the Entra app.
Your sandbox address has to be added, or sign-in fails.

- **Azure portal → Entra ID → App registrations →** app with Client ID
  `5ba3aabe-81f7-41c9-92a4-83a45d5407ab` **→ Authentication**.
- Under the **Single-page application** platform, **Add URI**:
  **`https://221twoseven.github.io/Project-Scheduler/sandbox/`** (exact, trailing slash). Save.
- Purely additive — no new permissions, no effect on production or anyone else's copy.

## Part C — sign in and confirm live data

1. Open `https://221twoseven.github.io/Project-Scheduler/sandbox/`.
2. Sign in with **your twoseven Microsoft account** (single-tenant — outside accounts won't work).
3. You should see the same projects and tasks as production. That confirms live data.

If sign-in throws an `AADSTS...redirect` error, Part B isn't done (or the URL doesn't match
exactly — check the trailing slash).

---

## ⚠️ Your copy writes to the REAL shared data

Your sandbox uses the **same SharePoint Lists** as production, so **anything you create,
edit, or delete while testing changes the live shared data** that everyone (and the
colleague's app) sees.

While developing, please:

- Make test projects **obviously named** (e.g. `ZZ-TEST — ignore`) and delete them when done.
- **Don't edit or delete records you didn't create.**
- Treat destructive actions (delete) as real.

If safe isolation matters, the clean fix is a **separate set of test Lists** the sandbox
points at — ask the owner; it's a small config change, not done by default.

## How you develop

- Edit `index.html` on the **`sandbox` branch** (directly on GitHub in the browser, or with
  Claude Code on your machine after `git checkout sandbox`).
- **Push to `sandbox`.** Your web address redeploys automatically in ~1 minute.
- Run the tests before trusting a change: `npm test` (needs Node + `npm install`).

## What you can and can't do

- ✅ Run, use, and develop your own copy freely at the sandbox address.
- ✅ See and interact with live SharePoint data.
- ❌ You **cannot change production.** The `main` branch is protected — merging there needs
  the owner's approval, which a `sandbox` push can't get on its own.
- 💡 If a change of yours is worth adopting, tell the owner. They'll review it and, if good,
  bring it onto `development` and promote it to production the normal way.

---

## Alternative: the fork model

If you'd prefer a completely separate repo under your own account instead of a branch here:
fork <https://github.com/221twoseven/Project-Scheduler>, turn on Pages (Settings → Pages →
Deploy from a branch → `main` / root), and register **your** fork's Pages URL in Entra
(Part B, with your fork address). A fork can never merge upstream, so production is safe by
construction — but you won't automatically receive updates made here. The sandbox-branch
model above is preferred because your work stays visible alongside everyone else's.
