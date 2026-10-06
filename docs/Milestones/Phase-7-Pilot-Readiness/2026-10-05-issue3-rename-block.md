# 2026-10-05 — Name a block (v1.38.0)

**Version:** v1.38.0 · **PR:** `feat/issue3-rename-block` → `development` · **Source:** tracker
#3 (Hubert Li, 2026-09-24; revised spec 2026-10-02, "Proceed with fix" 2026-10-05) · **TODO:**
§3 item 34, §7.3 L1092

## What changed

Hubert wanted a second Main Shop Fab block to read "Possible mock up days", the way the shop's
Excel calendar names a sub-range, instead of parking that in the block's notes. The name field
already existed (`label`, the inspector's Name field on the project page), but it could not be
reached from the dashboard at all, and nobody found it.

- **Double-click a bar renames it.** On the project page and the New Project draft, a
  double-click on the bar's own body (Gantt bar or Calendar band) opens the same in-place box
  the row title already had: Enter saves, Esc cancels, blank goes back to the department name.
  The first click of a double-click parks the edit popover under the pointer, so the popover
  hands a double-click on within half a second of opening — unless it lands in one of its own
  fields, where a word-select is left alone.
- **Dashboard: Edit Phase has a Name field.** It is the first field, the placeholder is the
  department name, Save writes it. An existing phase opens with Name focused and selected, and
  for 400 ms the dialog swallows presses and clicks (backdrop and buttons alike, so the second
  click neither closes it nor takes focus off Name): a double-click on a dashboard bar ends with
  the dialog open and the name ready to type over (owner default Q1: the reserved dashboard
  double-click is spent on rename). No in-place box on the dashboard: its bar labels are
  clipped or hidden on narrow bars.
- **Right-click → Rename** on a project-page bar or band opens the same box (owner default Q3:
  the one edit on the otherwise add-only menu). The dashboard has no right-click menu and gets
  none.
- **New subtask stays a plain quick-add** (owner default Q2, the 2026-08-28 ruling): right-click
  New subtask and the S key add the bar selected with no editor open; name it afterwards.
- **The name shows everywhere the block shows.** Two gaps closed: a milestone sitting on a named
  block leads with that name on the Calendar ("Possible mock up days: Client sign-off"), and the
  Meeting Sheet's "Phase now" reads the block's name, both in the active list and the "Next:"
  line (owner default Q4). The department keeps the hover card ("name · department") and the
  colour. Install and Shipping bars on the dashboard keep their crew label on purpose.

## Evidence

- `screenshots/before-issue3-rename-block.png` — Hubert's scenario on v1.34.0: Edit Phase on the
  second Main Shop Fab bar has no Name field.
- `screenshots/after-issue3-rename-block.png` — v1.38.0: the same dialog with Name first, focused
  and selected; the sidebar row behind it already reads the name.
- `screenshots/after-issue3-rename-block-project.png` — the project page: the second bar and its
  row title read "Possible mock up days".

## Tests

`tests/test-v1380.js` (59 checks, saved page + draft + dashboard): double-click rename on the bar,
Esc cancel, the popover hand-off on the Gantt and the Calendar, the half-second and own-field
guards, a hidden subtask band and a too-narrow bar (renames on its row title), right-click
Rename, quick-add unchanged, the Name field with focus/selection and the press/click guard,
Save writing `label`, bar/sidebar/hover card/Meeting Sheet reading the name.
Six older "the bar menu is add-only" assertions (test48/49/50/53/57/91) now expect Rename on
v1.38.0+ builds and still assert add-only on the reference build.

## Known limits

- A draft milestone has no host block (draft events carry only a department), so the milestone
  prefix on a draft still reads the department; it picks up the block's name once saved.
- A milestone moved to another department (REV48) keeps that department's name as its prefix.
- The R key still jumps to the inspector's Name field (unchanged); the menu's Rename opens the
  in-place box. Both rename the same block.
- Design-Language lines 236/238/244 amended: the dashboard bar double-click and the project-page
  "right-click only adds" rule are both spent, on the record.
