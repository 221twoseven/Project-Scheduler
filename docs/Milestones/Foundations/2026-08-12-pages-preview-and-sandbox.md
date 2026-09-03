# 2026-08-12 — Shareable preview + collaborator sandbox on GitHub Pages

**What changed.** GitHub Pages now deploys through a GitHub Actions workflow
(`.github/workflows/deploy-pages.yml`) instead of the old "serve one branch" mode. One
Pages site now hosts three live versions of the app, each at its own web address:

| Web address | Branch | Purpose |
|---|---|---|
| `…/Project-Scheduler/` | `main` | Production — what users run |
| `…/Project-Scheduler/preview/` | `development` | Shareable preview for testing before release |
| `…/Project-Scheduler/sandbox/` | `sandbox` | A collaborator's own copy to develop against live data |

**Why it mattered.** Previously only `main` could be hosted, so previewing unreleased work
or giving a collaborator a live copy meant a separate fork. Now any tracked branch gets its
own URL, so testers can be handed a stable link and the collaborator works inside the main
repo instead of a disconnected fork.

**How it works.** Every deploy rebuilds the *whole* site from all three branches, because
the Pages artifact fully replaces the live site each run. The workflow therefore lives —
identical — on `main`, `development`, and `sandbox`; a push to any of them redeploys all
three subpaths.

**Safety.** The `sandbox` branch (and the collaborator's write access) can't reach
production: `main` is protected and merging there needs the owner's approval. See
[Onboarding-Fork.md](../../Onboarding-Fork.md) for the collaborator flow.

**Auth ceiling / follow-up.** Each subpath is a new origin to Entra, so sign-in on `/preview/`
and `/sandbox/` only works after each URL is registered as a **SPA redirect URI** in the
Entra app (`5ba3aabe-81f7-41c9-92a4-83a45d5407ab`). Production is unaffected. All three copies
share the same SharePoint Lists, so sandbox/preview test writes hit real shared data until a
separate set of test Lists is created (not done by default).

**App REV:** unchanged (infra only). **PR:** promotes with the `development → main` deploy PR.
