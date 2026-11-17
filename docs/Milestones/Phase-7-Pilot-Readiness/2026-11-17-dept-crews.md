# Department phases stop storing the department's name as their crew — v1.54.0 (2026-11-17)

**TODO item 82** (owner, 2026-11-17). PR #193.

## What changed and why

Shop departments with no people roster (CNC, Beamsaw, Printing, Metal Shop, Painting and the
rest) are scheduled as the department itself. When the app built their phases, it wrote the
department's own name into the phase's crew field. So one field held either people or a label:

- the first `backfillRefs()` dry run listed about 80 of these as names it couldn't match to a
  person;
- the stored label went stale when a department was renamed: Painting phases still said
  "Finishing" in the dashboard;
- the hover card showed the department's name a second time, as if it were the crew.

The edit dialog already saved an empty crew for an unassigned shop phase. v1.54.0 makes the
automatic schedule do the same.

Everything that reads those crews was checked first, and none of it needed the stored name:

- the Departments view's lanes, the phase labels and search read the department;
- the person filter, the People-page job counts and the overbooking check already skip
  anything that isn't a person;
- print shows a crew only for departments with a roster.

The hover card now skips its crew line when there's no crew.

**Before:** `screenshots/before-dept-crews.png`, the Painting row says "Finishing".
**After:** `screenshots/after-dept-crews.png`, after the tidy. Rita Moreno still shows on Main
Shop Fab.

## The tidy (the owner, next)

Rows saved before v1.54.0 keep their old crews until they're tidied. From `/preview/`'s
console, signed in:

1. `tidyDeptCrews()` is a dry run. It lists every phase it would change, before and after.
2. `tidyDeptCrews(true)` saves them through the normal path, as one undoable step.

It clears a department's or group's name and any dash from a crew, keeps any people beside
them, and leaves "Other" rows alone (there the label is the bar's name). A dash on a Project
Management or Main Shop Fab phase meant "nobody". Cleared, the phase follows the project's team
like every other unowned phase.

## Checks

`tests/test-v1540.js`: a new project's CNC phase starts empty on the draft's Create; the
saved project and the Departments view still name the department; search still finds it;
the tidy's dry run and its save (people kept, "Other" labels and people-only crews left alone,
one undo step, nothing left on a second run).
