# A Today button on the project page — v1.51.0 (2026-10-19)

**TODO item 75** (owner, 2026-10-16). PR #NNN.

## What changed and why

The project chart opens fitted to the whole job. Once you zoom in (Week, Month, 3 Mo), the only
way back to today was scrolling. The chart's header row now has a **Today** button (hover: "Scroll
to today") right after the zoom buttons, styled like Reset.

- **Gantt:** this week's Monday lands at the left edge, just right of the name column. That is
  the same rule as the timeline's Today (item 33), so both behave alike. The chart's range always
  includes today, so only the left end can clamp (when Monday falls before the chart's first day).
- **Calendar:** the current week's row scrolls to the top. The calendar's range is not stretched to
  today, so a job wholly in the future lands on its first week, and one wholly in the past on its
  last week.
- Works on the New Project draft and saved projects, and for viewers: it only changes the view.
- **No shortcut:** T stays New note on the project page.

## Screenshots

Same fictional seed ("Q4 Frozen In Time 2026"), Week zoom:

- Before (v1.50.0): the chart opens at the job's start; today is off to the right.
  [before-project-today.png](screenshots/before-project-today.png)
- After pressing Today: Monday Oct 19 at the left edge.
  [after-project-today.png](screenshots/after-project-today.png)

## Tests

`tests/test-v1510.js`: the button and its copy on draft and saved pages; the Gantt from a
far-scrolled start (Fit and Week zoom); a job wholly ahead of today and one long done; Calendar's
current week, first week and last week; a viewer; T still makes a note.
