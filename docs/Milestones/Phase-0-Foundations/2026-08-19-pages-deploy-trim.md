# Pages deploy trimmed to app files only

**Date:** 2026-08-19 · **PR:** [#14](https://github.com/221twoseven/Project-Scheduler/pull/14) · **App REV:** none (infrastructure only)

## What changed

The GitHub Pages deploy used to publish the **entire repository** at each of the three
site paths (`/`, `/preview/`, `/sandbox/`) — including `docs/`, `tests/`, the frozen
reference build, and `CLAUDE.md`. Anyone on the internet could read the internal docs
as web pages, even though they were never meant to be part of the app.

Now the deploy publishes exactly two files per path: `index.html` and
`msal-browser.min.js` (the only local asset the app loads). Everything else stays in
the repo — versioned and editable as before — but off the public website.

## Why it mattered

- The docs contain internal details (names, infrastructure notes, this backlog) that
  had no business being on a public site.
- It also decouples the "sensitive info" question from repo visibility: whether or not
  the repo goes private, the website no longer republishes the repo.

## The safety net

The published files are now an allowlist in `.github/workflows/deploy-pages.yml`. If a
future change makes `index.html` reference a new local file (an image, a CSS file), a
**guard step fails the deploy loudly** instead of silently shipping a site with the
file missing — the error message says which file to add to the list.

## Verified

- App loads at all three paths (HTTP 200), `docs/…`, `tests/…`, `CLAUDE.md` return 404.
- Guard tested both ways (passes when complete, fails when a referenced file is absent).
- Workflow byte-identical on `main`, `development`, `sandbox` (required — each push
  rebuilds the whole site with its own branch's workflow).

## Known ceiling / follow-up

- New local assets must be added to all three sparse-checkout lists in the workflow
  (the guard turns forgetting into a failed deploy, not a broken site).
- Rollback: revert the workflow commit — the next deploy republishes everything.
