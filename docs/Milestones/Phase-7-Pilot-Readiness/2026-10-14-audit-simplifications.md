# Small simplifications from the audit — v1.48.3 (2026-10-14)

**TODO item 61** (the 2026-10-12 ponytail audit). PR #150.

## What changed and why

Four small code clean-ups. Only the last one shows up for anyone using the app.

- **Name lookups are remembered.** `canonName` turns "sam" into "Sam Smith". It runs inside
  every sort and render, and now remembers its answers until the staff list changes.
- **One loop loads the four lists.** Projects, phases, to-dos and events each had their
  own copy of the same row loop; now one helper does it.
- **One table for the optional Staff columns.** The 14 optional columns (extension, admin,
  nickname, schedule, …) are listed once in `PERSON_COLS`, instead of by hand in both the
  save and the load code. A column the list doesn't have yet is still never written, so
  the save never fails with a 400.
- **The background check for teammates' edits now pauses on the same rule as the update
  check** (owner OK, 2026-10-14). That adds three cases: a New Project page is open, the
  cursor is in a toolbar box, or a client or settings save is waiting to retry. Teammates'
  changes show up a little later in those moments, and nothing redraws under you.

## Tests

Five old checks read the code's text, which blocked exactly this kind of refactor
(`test-v1170`, `test-v1180`, `test-v1220`, `test-v1230`, `test-v190`). They now test what the code does: a
person goes in and comes back out with the same fields, and a cursor in User Notes counts as
busy. New suite `tests/test-v1483.js`.
