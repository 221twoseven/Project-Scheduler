# v1.4.0 — Milestones & Notes (08-31 brief, objs 3, 6, 4)

**Date:** 2026-08-31 · **Version:** v1.4.0 (minor) · **Branch:** `development` → `/preview/`
**Objectives:** 08-31 brief objs 3, 6 and 4 (TODO §3 items 21–23)

## What changed

1. **Checkpoint → Milestone** (obj 3). Renamed everywhere the shop reads it — menus,
   agenda, popovers, dashboard sections, toasts, legend, tour, keyboard sheet. A
   milestone now edits as **date + plain-text name + phase**: the type dropdown
   (`TN_TARGETS` "Client Approval / Shop Drawings / …") and the notes field are gone
   from all three editors (agenda row, edit popover, phase-modal list).
2. **Task → Note** (obj 6). The dated to-do is a Note, and its editors are
   **date + single-line text only** — the phase picker and the who field left the
   note's agenda row and popover, per the owner's "only".
3. **Gantt marker labels hidden** (obj 4). The project Gantt no longer draws the
   inline label chip next to milestone/note markers (adjacent labels were
   unreadable). The hover title carries "name · date"; a click opens the edit
   popover, as before. Calendar bands keep their in-cell names — they don't
   overlap the same way.

## What did NOT change

- **SharePoint fields are untouched** (shared-schema rule §5): `ticketNodes.target`
  still stores the milestone name, notes/who/dept values already saved stay in the
  data — they're just no longer editable. Old notes still show in main-timeline
  tooltips.
- Keyboard keys stay E (milestone) and T (note) — muscle memory and the shortcut
  sheets kept, labels updated.

## Evidence & tests

- New suite `tests/test-v140.js` (13 checks): field-level assertions on all three
  milestone editors and both note editors, no label chip + title carries the name,
  copy sweep source checks.
- `test46`/`test50` re-keyed their new-agenda detector (the removed `ag-dl`
  datalist was their build marker); `test50` branches on the retired label chip;
  `test57` accepts the Milestones gutter title.
- Full suite green before push.

## Ceilings / follow-ups (ledgered in TODO §7)

- Old milestone notes/types and note who/phase data have no editor — surface a
  read-only line if anyone needs to read/clear them.
- Marker hover is the native `title` tooltip (unstyled, invisible on touch) —
  shares the long-standing T8 gate.
