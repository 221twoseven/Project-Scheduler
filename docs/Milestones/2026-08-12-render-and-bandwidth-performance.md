# Render & bandwidth performance pass (REV51–52)

**Date:** 2026-08-12
**App revisions:** REV51 (bandwidth), REV52 (render)
**PRs:** [#7](https://github.com/221twoseven/Project-Scheduler/pull/7) (merged), [#8](https://github.com/221twoseven/Project-Scheduler/pull/8)
**Shareable explainer:** [Performance & Bandwidth Review](https://claude.ai/code/artifact/d7262e68-5990-4ff8-80d4-8ac8ef9060ef) — plain-language, for non-technical stakeholders.

## What changed

Two separate kinds of efficiency, in two passes:

- **Server traffic (REV51):** cut how often the app calls Microsoft Graph. Poll interval
  45s → 90s (`POLL_MS`), hidden/background tabs stop polling, the Staff list is read every
  other tick, and the app now honors Graph's `Retry-After` on 429/503 instead of retrying
  at the same rate. Correctness: a `SYNCING` flag so the poll can't clobber an in-flight
  save, and sync retries no longer re-POST an already-created row (which could duplicate
  records in the shared lists).
- **Screen speed (REV52):** the render was O(n²)+ — `visTasks()` and `projectStatus()` were
  recomputed dozens of times per redraw, each doing a full `ST.tasks.filter` /
  `ST.projects.find`. Added `projById`/`taskById` lookup maps, a `projectStatus` memo, and a
  `visTasks` cache, all keyed on `ST` object identity (which is replaced wholesale on every
  write). Fine with a handful of projects; the difference shows at ~200.

## Why it mattered

Microsoft Graph enforces one shared rate limit for the whole tenant. Overshooting it
surfaces to users as errors and lag. REV51 reduces our share of that traffic; REV52 is
browser-side only and does **not** affect server load.

## Known ceiling / follow-up

- **The original build is still live** against the same shared Lists and quota, and it runs
  heavy (45s polling, all tabs, no backoff). Our backoff protects our copy's behavior but
  can't stop the original from spending the shared budget. **The biggest remaining win is
  retiring the original / migrating its users onto this build** — see the explainer above.
- `projectStatus` memo also depends on `today()`; across a midnight rollover with no data
  change the "complete" flip lags until the next state write. Cosmetic, self-heals.
- Not started: Priority 5 — collapse the ~30-site `NPV_LIVE` draft/saved fork into one
  dispatcher.
