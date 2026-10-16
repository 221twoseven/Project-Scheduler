# Milestones can sit on their phase's bar — v1.50.0 (2026-10-16)

**TODO item 32**, tracker #1. PR #165. On test at /test/ first; the owner picks the default
before it reaches /preview/.

## What changed and why

A user set a milestone, "ALL CNC DONE", to Phase: CNC, dated inside the CNC bar. On the project
Gantt it sat in the top Milestones row and the CNC bar carried nothing. That was by design: a
2026-09-03 ruling put every milestone in that row, so nothing could vanish.

Moving milestones might confuse current users, so the owner asked for a switch instead of a move
(2026-10-16). The project Gantt's header now ends with **Top · Both · Phase**, styled like the
Gantt/Calendar switch:

| Button | What it does | Hover title |
|---|---|---|
| **Top** (default) | Today's behaviour: every milestone in the Milestones row. | All milestones in the Milestones row |
| **Both** | The Milestones row, plus a copy on the milestone's phase row. | Milestones row, plus a copy on each milestone's phase bar |
| **Phase** | A phased milestone sits only on its phase row. | Milestones with a phase sit on that phase's bar; the rest stay in the Milestones row |

- **Which row:** the phase's row whose bar covers the milestone's date, else that phase's first
  row. The diamond stays centred on its date.
- **Nothing vanishes:** a milestone with no phase, or whose phase isn't on this job (for example
  Shipping not ticked), stays in the Milestones row in every mode.
- **Same diamond everywhere:** both copies share the popover, hover title, drag and right-click
  delete. Dragging changes only the date. A phase change (popover or Milestones & Notes) moves the
  diamond on the next paint.
- **Unchanged:** notes stay on the Notes row; Calendar mode (the switch hides there), the
  dashboard and print are untouched.
- **Remembered per browser** (`shopTimelineMsPlace` in localStorage). Works on a saved project and
  the New Project draft.

## Screenshots

Seed: the fictional "Q4 Frozen In Time 2026", with "ALL CNC DONE" on CNC, "Drawings approved" on
Technical Design and "Kickoff" with no phase.

- Before (v1.48.5): [before-milestone-placement.png](screenshots/before-milestone-placement.png)
- Top: [after-milestone-placement-top.png](screenshots/after-milestone-placement-top.png)
- Both: [after-milestone-placement-both.png](screenshots/after-milestone-placement-both.png)
- Phase: [after-milestone-placement-phase.png](screenshots/after-milestone-placement-phase.png)

## Tests

`tests/test-v1500.js`: all three modes on the draft and a saved project, the no-phase and
no-Shipping milestones, a popover phase change in Phase mode, drag changing only the date, the
default and the stored choice. `test48` and `test-v1320` are unchanged and pass.

## Known limits

- In Both and Phase, a milestone dated on a bar's first or last day sits over that bar's resize
  edge, so grabbing there drags the milestone. Grab the bar a little further in, or switch to Top.
- When no bar of the phase covers the date, the milestone sits on the phase's first row, off
  the bar. For a department with subtasks, a collapsed row only knows the main bar, so the
  milestone can move between the parent and a subtask row as the department opens and closes.

## Follow-ups (not built: unapproved copy)

- A "Shipping (not scheduled)" label in the Phase dropdown when Shipping isn't ticked.
- A one-click "Add Shipping" offer.
- The owner picks the default (Top today) after trying it on /test/.
