# Calendar full parity (REV72)

**Date:** 2026-08-25 · **PR:** [#15](https://github.com/221twoseven/Project-Scheduler/pull/15) (the `development` → `main`
promotion) · **App REV:** 72

## What changed

REV71 gave calendar phase bands drag-to-move; REV72 closes the remaining capability
gaps against the Gantt (owner direction, 2026-08-25 — "full calendar parity is
priority"):

- **Checkpoint and task bands are live.** They now carry their identity
  (`data-mk-id`), so they get the Gantt diamonds' verbs: **drag** moves them to a new
  day (with a date tooltip), a **plain click** opens the agenda editor with the name
  focused, and **right-click deletes** (confirm first) — on both the saved page and
  the draft. Before this, calendar markers were a picture: create-only via menus.
- **Phase bands resize from edge handles.** Each band segment grows an 8px grab zone
  on an edge that is the phase's *true* start or end — a week-clipped edge continues
  into the next row and is deliberately not grabbable. Same rules as the Gantt's
  resize: the start snaps forward to a workday and the end back, Protect dates or a
  pin swallows the drag (a click still selects), the REV56 nesting clamp holds, and
  N16-merged roster twins resize together. Hover shows the §6 2px inset rule; a live
  tooltip tracks the edge date. Drafts file manual placements (with the recomputed
  day count) and get an undo toast.
- **Hit targets reach the 24px line.** Every band's hit area is padded ±4px via a
  pseudo-element (§9 was 16px); the visual stays the dense shop-schedule look.

## Tested

- New suite `tests/test72.js` — 26 assertions, saved page and draft (the REV49
  lesson): marker drag/click/delete, resize + snap + clamp + lock, the
  true-edge handle rule, twins resizing together. Skips on the REV50 reference.
- `test53`, `test57`, `test71` re-run green alongside; full matrix green on both
  builds.
- Evidence: `screenshots/after-cal-resize.png` (edge resize mid-drag, date tooltip)
  and `screenshots/after-cal-marker-drag.png` (a checkpoint band mid-drag).

## What parity deliberately does NOT include

- **The empty state stays dead in both modes** — a project with zero bars has no
  create menu on the Gantt either; the departments panel is the starting point.
  Not a calendar-vs-Gantt gap, so out of scope here.
- **A merged "+N" band still selects its first bar on click** — that's the N16
  density decision, not a Gantt capability (the Gantt draws each bar separately).
  Drag and resize act on all twins, so edits are safe either way.

## Known ceiling / follow-up

- The ±4px hit padding can bleed into a stacked neighbour band's row; the later band
  wins the sliver (`ponytail:` comment at the rule). Shrink the pad if stacked bands
  misfire in hallway testing.
- Markers still move by whole days with no workday snap — same as the Gantt's
  diamonds; parity preserved, not a bug.
- No live band repaint during drags — the dim + tooltip carries the feedback
  (REV71's ceiling, unchanged).
