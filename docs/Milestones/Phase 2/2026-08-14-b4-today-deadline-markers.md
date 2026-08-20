# Today & deadline markers redesigned (finding B4)

**Date:** 2026-08-14 · **Branch:** development · **Design-Language §7**

## What changed

Today and deadlines no longer fight each other — or the red install bars —
for the same red.

- **Today is the strongest line on the canvas.** The whole "today" column gets
  a faint blue wash (`rgba(47,111,228,.06)` — visible as a column, invisible
  on the bars), with a solid 2px red line at the day's start and the TODAY
  pill riding it. Same treatment on the main timeline and the project-page
  Gantt (which previously had a bare red line and no pill).
- **Deadlines are pennants, not red dashes.** Each project with a deadline
  gets a small ▸ pennant at its header row, in that project's own identity
  colour, with a dotted drop-line in neutral ink at 60% opacity falling
  through the project's rows (it lengthens when you expand the project's
  tasks). No red anywhere in the marker — red stays reserved for installation.

## Why it mattered

The old markers were three variations of the same red: a thin Today line,
dashed deadline flags, and the install bars themselves. On a dense view a PM
couldn't find "now" at a glance, and a deadline flag next to an install bar
read as more install. Each marker now has its own shape *and* colour channel:
blue column = now, identity-coloured pennant + ink dots = that project's
deadline, red fill = install. They hold up on both Quiet and Vivid canvases.

## Evidence

- New suite `tests/test-b4.js` (15 assertions): wash + 2px `--late` line +
  pill on both surfaces, dotted neutral-ink drop-line, ▸ pennant in the
  project's identity colour, no red family left in any marker rule, drop-line
  spans the expanded project block.
- All 13 suites pass against `index.html`; the new suite skips on the frozen
  REV50 reference per the Phase-1 convention.
- Verified in a real browser against an 8-project seed with deadlines
  clustered around today (computed styles confirmed on both canvases and the
  project page).

## Known ceiling / follow-up

- `npm run test:ref` has a pre-existing failure unrelated to B4: `test50.js`
  gained E1 dock assertions without a skip guard, so it fails on the
  reference build. Flagged as a separate task.
- PR link: [#15](https://github.com/221twoseven/Project-Scheduler/pull/15) (promotion PR).
