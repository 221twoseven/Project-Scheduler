# Demo preamble slides — developer-only (v1.16.0)

**Date:** 2026-09-02 · **For:** the 2026-09-03 live demo

## What changed

The owner presents the app tomorrow without a slide deck, but the spoken preamble
benefits from on-screen text. Now, when a **developer** opens Help ▸ Take a tour,
four modal "slides" appear before the tour: a title, a short body, a step counter
(1 / 4), and Skip / Back / Next at the bottom. The final button reads **Start the
tour** and runs the normal chained 13-step tour. Keyboard: ← → and Enter advance,
Esc closes.

The four slides distill the preamble script:

1. **From planning tool to hub** — alpha Gantt tool → company-wide shared source
   of truth.
2. **Enter it once** — replaces the duplicated spreadsheets/lists/calendars;
   connected to Microsoft 365; one date, everywhere.
3. **Who it's for** — Management / PMs / Technical Design / Shop & production;
   different views of the same information.
4. **What it isn't** — not an ERP; the four questions it answers; segue into the
   walk-through.

## What didn't change

- Help ▸ Take a tour for everyone who isn't a developer: straight to the tour.
- The first-visit auto-run tour (still the plain tour, even for developers).
- A developer already on a project page gets the project tour without slides
  (mid-demo restarts shouldn't replay the preamble).

## How

Standard `.overlay`/`.modal` chrome (`#demo-overlay`), Brauer Neue titles, copy in
`docs/Copy-Coach-and-Helpers.md` §0 (the editing channel). Gate is one line in the
`mi-tour` handler: `isDeveloper() && ROUTE.view!=='project'` → slides first.

## Evidence & tests

Verified in a real browser via the stubbed preview (slides → Start the tour →
STEP 1 OF 13). Suite `tests/test-v1160.js` (23 checks, registered in run.js).

## Ceilings

- Slides are hard-coded app copy, not CFG-driven — right for a one-off preamble;
  revisit only if the owner wants editable slides.
