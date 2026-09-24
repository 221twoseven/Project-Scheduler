# Named saved views (finding B6) — REV79

**Date:** 2026-08-26 · **App REV:** 79 · **Finding:** B6 (UX audit Theme B, "the state
you build every Monday should be one click") · **Brief:** Phase 3 pack, V4 ·
**PR:** v4-saved-views → development

## What changed

- **A Views control on the toolbar**, right of the Person filter. It saves the current
  timeline state under a name and brings it back with one click. Each view row also
  offers: **★ open at launch** (exactly one, click again to unmark), **🔗 copy link**
  (the stretch goal — a URL that opens the app already in that view, for sending to a
  teammate; applied read-on-load, never auto-saved), **✎ rename**, and **✕ delete**.
- **What a view snapshots** — exactly the audit's list: lens, grouping, status filter,
  person, search text, color mode, zoom step (B3), density (B5), vivid-months tint,
  and collapsed groups/sections. Nothing else; applying or deleting a view never
  touches project data.
- **Two starter views seed on first open:** *Everything* (the defaults) and *My work*
  (person = you, when the REV66 identity chain knows who you are).
- **Under the hood, one honest refactor:** all of that state now round-trips through a
  single `viewState()` / `applyViewState()` pair. The live session's own remembering
  (`UI_KEY` + loose keys — formats unchanged) goes through the same pair, so a saved
  view can never drift from what the session itself would restore. No behavior change
  when no view is used.

## Evidence

Stubbed-data captures (headless Chrome), 18 projects, 1600×1000:

- [Before — the toolbar ends at Clear filters](screenshots/before-b6-toolbar.png)
- [After — the Views menu open: starters + "Install crunch", launch star, link/rename/delete](screenshots/after-b6-views-menu.png)
- [After — "Install crunch" applied: Month + Compact + grouped by PM + 2 of 6 statuses, one click](screenshots/after-b6-view-applied.png)

## Why it mattered

Theme B's closing move: zoom (REV75), density and group collapse (REV77–78) each added
a knob, which means the Monday-meeting setup is now six knobs deep. A saved view makes
that whole arrangement one click — and the launch star makes it zero.

## Notes

- **Views are per-browser by design** (`shopTimelineViews_v1` in localStorage, no
  SharePoint, no schema — the menu says so in a footnote). The 🔗 link is the escape
  hatch when a view needs to travel.
- New suite `tests/test-v4-views.js` (24 assertions: refactor neutrality, the
  brief's save/switch/reapply acceptance asserted down to byte-equal sidebar markup,
  seeding, delete-never-touches-live-state, launch-on-reload, the #view= link).
  Skips on the frozen REV50 reference. `tests/harness.js` gained two additive opts
  (`localStorage` preseed, `url`) so suites can test what a cold reload picks up.
- Known ceilings / follow-ups (mirrored in `docs/Archive/TODO-v1-Archive.md` §7):
  - A view deliberately does **not** capture sidebar width, panel gutter, scroll
    position, or the linked-subtasks toggle — those read as workspace ergonomics, not
    "a view". Revisit only if someone saves a view and misses one.
  - Sort order lives in the shared `sortIndex` project data (all browsers see it), so
    a view recalls the *grouping* but can't recall a different *ordering* per person.
    That's a data-model boundary, not a bug.
