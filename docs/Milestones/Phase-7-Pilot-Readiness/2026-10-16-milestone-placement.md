# Milestones sit on their phase; Help ▸ My settings — v1.50.0 (2026-10-16)

**TODO item 32**, tracker #1. PR #165. Tested on /test/ first.

## What changed and why

A user set a milestone, "ALL CNC DONE", to Phase: CNC, dated inside the CNC bar. On the project
Gantt it sat in the top Milestones row and the CNC bar carried nothing. That was by design: a
2026-09-03 ruling put every milestone in that row, so nothing could vanish.

The first build of this PR put a Top · Both · Phase switch on the project page. The owner's
ruling (2026-10-16): **Phase is the default**, and the choice moves off the project page to a new
personal page, **Help ▸ My settings**, for every signed-in user (viewers too). App settings stays
developer-only and app-wide.

| Option on My settings | What the Gantt does |
|---|---|
| **On their phase** (default) | A phased milestone sits on its phase's row. The rest stay in the Milestones row. |
| **Both** | The Milestones row, plus a copy on the phase's row. |
| **Milestones row only** | The 09-03 behaviour: every milestone in the Milestones row. |

- **Which row:** the phase's row whose bar covers the milestone's date, else that phase's first
  row. The diamond stays centred on its date.
- **Nothing vanishes:** a milestone with no phase, or whose phase isn't on this job (for example
  Shipping not ticked), stays in the Milestones row in every mode.
- **Same diamond everywhere:** both copies share the popover, hover title, drag and right-click
  delete; in Both, the twin moves with a drag. Dragging changes only the date. A phase change
  (popover or Milestones & Notes) moves the diamond on the next paint.
- **Unchanged:** notes stay on the Notes row; Calendar mode, the dashboard and print are untouched.
- **It follows the person.** The choice rides the signed-in user's Staff row, in the same
  `savedViews` value as saved views and Protect dates (`{…,"milestones":"phase"}`), with a browser
  cache (`shopTimelineMsPlace`). Each key is written only once this browser holds it, so the row
  never loses the other keys. No Staff row, or the column missing: this browser only, quietly.
  No new SharePoint column.
- **The page** copies App settings' layout (trail, ×, Esc back) at `#/mysettings`. All copy is
  owner-approved and listed in `docs/Copy-Coach-and-Helpers.md` §9.

## Screenshots

Seed: the fictional "Q4 Frozen In Time 2026", with "ALL CNC DONE" on CNC, "Drawings approved" on
Technical Design and "Kickoff" with no phase.

- Before (v1.48.5): [before-milestone-placement.png](screenshots/before-milestone-placement.png)
- After, the default (On their phase): [after-milestone-placement-phase.png](screenshots/after-milestone-placement-phase.png)
- Help ▸ My settings: [after-my-settings.png](screenshots/after-my-settings.png)

## Tests

`tests/test-v1500.js`: all three options on the draft and a saved project (the saved page driven
through the My settings page), the no-phase and no-Shipping milestones, a popover phase change, drag
changing only the date, the page and its exact copy for an admin and a viewer, the Staff-row write
and adoption, and the no-row fallback. `test56`'s collapsed-parent check now adds the two marker
rows (the marker is back on its phase row). `test48` and `test-v1320` are unchanged and pass.

## Known limits

- In Both and On their phase, a milestone dated on a bar's first or last day sits over that bar's
  resize edge, so grabbing there drags the milestone. Grab the bar a little further in.
- When no bar of the phase covers the date, the milestone sits on the phase's first row, off the
  bar. For a department with subtasks, a collapsed row only knows the main bar, so the milestone
  can move between the parent and a subtask row as the department opens and closes.

## Follow-ups (not built: unapproved copy)

- A "Shipping (not scheduled)" label in the Phase dropdown when Shipping isn't ticked.
- A one-click "Add Shipping" offer.
