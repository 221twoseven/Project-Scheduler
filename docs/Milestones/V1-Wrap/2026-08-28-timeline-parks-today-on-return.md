# Returning to the timeline parks today (REV101)

**Date:** 2026-08-28 · **REV:** 101 · **Branch:** development (pending promotion to
main) · **PR:** _pending_

## What changed

Leaving a project page — **Done**, the **breadcrumb**, or browser **Back** (all route
through `goTimeline()` → `#/`) — dropped the timeline at its far-left **earliest date**,
so users landed on old history and had to scroll right to find today.

Now every arrival at the timeline via routing **parks today left-of-center**, the same
default view as first load. `scrollTodayLeft()` was previously called only once at startup;
it now runs in `applyRoute()`'s timeline branch, so first load and every Done/breadcrumb/Back
share one behaviour (the redundant startup call was removed). The **Today button and `T`**
still *center* today — only the default arrival view *parks* it.

## Tests

- `test-goto.js`: a new stage navigates into a project and back and asserts the timeline
  lands at the today-park offset (`d2x(today) − 1.5·dw`), proven `> 0` for the seed, not
  `scrollLeft 0`.
- `npm test` and `npm run test:ref` green.

Design-Language §7 and the TODO §7 ceiling note updated to say the park is the default
view on first load *and* on routing arrival, not startup-only.
