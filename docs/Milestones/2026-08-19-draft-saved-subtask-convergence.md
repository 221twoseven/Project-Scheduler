# Draft vs saved phase-splitting converged (TODO §3 item 3) — REV55

**What changed.** Subtasks on the two project pages were built from different material:
a **saved** project's subtask is a real row (edits persist), but a **draft** subtask was
a named "line" (`NPV_LINES`) used to split the department bar on every preview rebuild —
and the rebuild applied manual drag placements *before* that split, under a key the
split bars could never match. In practice: **dragging or resizing a subtask on the
new-project page silently snapped back** to the department window on the next rebuild
(any keystroke), while the identical gesture on a saved project stuck.

Three fixes, all on the draft side — the saved path is untouched:

- The manual-placement overlay runs **again after the split**, so each draft subtask
  keeps its own dragged dates and duration through rebuilds — the same independence a
  saved subtask row has. A whole-department drag done before splitting still carries in.
- Line lookups stopped guessing by name. A split bar already carries its line's id
  (`baseId::lineId`); rename, delete, and sort now resolve through it, so two subtasks
  with the same name stay distinct.
- **Renaming a dragged subtask no longer loses its placement** — the manual key contains
  the label, so the rename moves the entry with it.

**Why it mattered beyond the bug.** Save files exactly what the preview shows
(`NPV_ALL`), so a snapped-back preview also meant the *saved* project got the scheduler
dates instead of what the PM had laid out. And item 5 (subtask resize/duration
independence, the owner's notes) now only needs building once — the draft side already
behaves like the saved side.

**Known ceilings.**

- Renaming a line from the departments panel (not from its bar) still drops the bar's
  manual placement — that path has no bar at hand to rebuild the key from. Noted in the
  code; migrate there too if anyone notices.
- Changing a subtask's assignee still changes its manual key (pre-existing, same as
  unsplit bars).

**Tests.** New `tests/test55.js` (17 assertions): split → drag survives rebuilds while
the sibling keeps scheduler dates → rename keeps the placement → same-named lines stay
distinct → save files the exact previewed rows → saved-path parity guard. Full matrix
18/18 on `index.html`; reference build green (test55 skips there).

**App REV:** 55. **PR link:** pending (next `development` → `main` promotion).
