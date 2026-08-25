# Calendar drag-to-move + "Add a phase" (REV71)

**Date:** 2026-08-25 · **PR:** [#15](https://github.com/221twoseven/Project-Scheduler/pull/15) (the `development` → `main`
promotion) · **App REV:** 71

## What changed

Two steps toward full calendar parity (owner direction, 2026-08-25):

- **Phase bands drag to move.** REV53 made the calendar clickable; the bars still
  couldn't be dragged — moving one meant switching back to the Gantt. Now a phase band
  drags to a new day on both the saved page and the draft, with the same rules as the
  Gantt's move: an N16-merged "+N" band moves all its roster twins together, a nested
  subtask stays inside its parent's window, Link carries a parent's subtasks along, and
  a live tooltip shows the prospective dates while dragging. A plain click still only
  selects (N11 untouched — the 3px travel rule disambiguates).
- **"Add a department" is now "Add a phase"** in the right-click create menu (both the
  item and its submenu header, both view modes). The action is unchanged — pick a
  department to add its phase bar — the old name just described the mechanism instead
  of the thing created. The legacy no-Events-list toast was reworded to match
  ("Add a phase first — a checkpoint still needs one to save on"), which also retired
  its last user-facing "event".

## How the drag works

The calendar has no linear day axis, so the drag does no coordinate math: once the
pointer travels 3px, bands stop catching the pointer and every mousemove lands on a day
cell, which carries its own date (`data-d`, the REV53 hit-testing). The first cell seen
anchors the drag; days moved = current cell − anchor. Commits reuse the Gantt's paths
untouched — `commitPhaseDates`/`commitPhaseShift` on a saved project, a manual
placement (`NPV_MANUAL`) on a draft. Target-based events mean the whole behaviour runs
in jsdom.

## Tested

- New suite `tests/test71.js` — 21 assertions, both the saved page and the draft
  (the REV49 lesson). Skips cleanly on the frozen REV50 reference.
- `test53` (calendar surface) and `test57` (N11/N16) re-run green alongside.
- Real-browser evidence (headless capture off a stubbed build):
  `screenshots/after-cal-phase-menu.png` (the renamed create menu) and
  `screenshots/after-cal-drag.png` (a band mid-drag with the date tooltip).

## Known ceiling / follow-up

- **No edge-resize on calendar bands** — moving is drag; resizing stays on the Gantt,
  the inspector's date fields, or N13's department Start/End fields. The bands are
  16px tall and wrap across week rows; edge grab zones there would be guesswork.
- **Checkpoint/task bands are still inert** on the calendar (create and delete via
  menus only; drag them on the Gantt). The next parity slice if testers reach for it.
- **No live band preview during the drag** — the band dims and a date tooltip tracks
  the pointer; the band itself repaints on release. A full live preview means
  repainting the month grid every mousemove; add it only if the tooltip proves
  insufficient in hallway round 2.
- The other REV53 ceilings stand: 16px band hit-targets, no create menu on the empty
  state, and a merged "+N" band still *selects* its first bar on click (drag now moves
  all twins, which removes the sting of that ceiling for edits).
