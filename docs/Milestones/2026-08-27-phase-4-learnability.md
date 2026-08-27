# Phase 4 — the learnability layer (REV89)

**Date:** 2026-08-27 · **REV:** 89 · **Phase:** 4 (complete) · **PR:** #29

## What changed

Phase 4 as rescoped 2026-08-26 (UX audit themes A2 + A5), approved by the owner
2026-08-27 — all four items in one pass:

1. **First-run hint bar — dropped** (owner, 2026-08-27, as recommended). It was
   never built; the REV74 coach-mark tour does its whole job better. Two
   competing first-run treatments would teach less than either. No code.
2. **`?` shortcuts sheet on the main timeline** (A2). The project page had one;
   now the timeline does too — same overlay style, its own keys (N, /, T, G,
   D, W, +/−, ⌘Z, Esc, ?). Opens on `?`, from the new "Keyboard shortcuts…"
   entry in the `?` legend, closes on Esc or any click.
3. **Sample-project onboarding** (A5). The "Nothing scheduled yet" card gains
   **Add a sample project**: one click runs the existing `seed()` through the
   normal create path. The two seeded projects are flagged `sample`,
   name-prefixed "Sample · ", and **live in this browser only** — `spSync`
   strips anything belonging to a sample project (by projectId, so subtasks and
   events added to them later stay local too), the slice stashes to
   localStorage on every save, and load/poll re-attach it. Deleting them
   through the normal delete flow clears the stash. `seed()`'s staff-roster
   write is snapshotted around, so the shared People list is never touched.
   (The card's "always renders" half shipped earlier — REV73/T7.)
4. **Hover affordance** (A2's last sliver). Hovering any timeline bar shows a
   faint ⋯ at its right end — a hint that a context menu exists — in the bar's
   label color, `pointer-events:none`, so drag/resize/click are untouched.

**Drive-by data-loss fix:** `undo()` rebuilt `ST` without the `events` field,
so with `ShopTimeline_Events` live, any undo diffed events → undefined and
**deleted every event row from SharePoint**. Latent since REV54 (the harness
runs with the Events list 404ing, which skipped the delete plan). Fixed:
events restores from the undo snapshot; `tests/test89.js` §6 guards it.

## Evidence

![empty state with the sample button](Phase%204/screenshots/after-4-empty-sample.png)
![the timeline shortcut sheet](Phase%204/screenshots/after-4-shortcut-sheet.png)

## Tests

`tests/test89.js` (23 assertions): sheet open/close via ?, Esc, legend entry
and click; the sample seeding locally with zero SharePoint POSTs, the stash
surviving a reload (mergeSample), delete clearing it, and the staff roster
untouched; the undo/events fix; the hover-cue rule present.

## Known ceilings / follow-ups

- The hover cue covers main-timeline bars only — the project page's bars keep
  their richer hover tooltip and the REV86 tour instead. Gate: the same
  discoverability complaint there.
- A stashed sample is only re-attached after a successful load — a browser
  that boots offline shows the sign-in card, not the sample, until sign-in
  works. Gate: someone actually using the sample as an offline demo.
- If `ShopTimeline_Tasks2` were missing AND the sample carried to-dos, the
  poll's local-todos guard would skip and drop other session-local todos —
  Tasks2 exists in production; noted in the code.
