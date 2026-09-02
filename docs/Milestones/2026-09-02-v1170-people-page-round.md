# People page round — six owner asks (v1.17.0)

**Date:** 2026-09-02 (evening, after v1.16.0)

## What changed

1. **Job-code prefixes hidden in titles.** HR titles arrive as
   "SFAB1 - Seasonal Fabricator"; the People page now displays "Seasonal
   Fabricator" (index and record pane). The stored value keeps the prefix — the
   editor shows it raw, and nothing else in the app changes. Legitimate
   hyphenated titles ("Co-Director of Finishing") are left alone: only a leading
   all-caps/digits code followed by a hyphen is stripped.
2. **Driver column.** New ✓ column on the index, a Yes/— row on the record, and a
   "Drives for the company" checkbox in the editor. Backed by a new `driver`
   staff column (single-line text, `1`/empty — ⚠ Robert creates it; until then a
   save that touches the checkbox parks with the named-field toast, v1.15.2
   style). Tristate like the other flags; merges fold it.
3. **Permission filter.** A second dropdown beside the department filter:
   Everyone / Admins / Developers / Feedback recipients / Viewers. Admins include
   developers; Viewers = anyone without the admin flag. Appears only once the
   permission columns carry values (same `permsLive()` gate as the chips).
4. **Resizable layout.** Drag grips on the column headers pin any index column's
   width, and a drag bar between the list and the record pane moves the split.
   Both remembered per browser, re-applied across repaints.
5. **Idle "table jump" fixed at the root.** Any background data poll (someone
   else's project edit included) repaints the whole Company Data page, and the
   repaint reset both panes' scroll to the top — that was the jump. The repaint
   now carries the index and record scroll positions across. Selection was
   already kept.
6. **↑↓ keyboard selection.** Arrow keys walk the index selection on both People
   and Clients (clamped at the ends, row kept in view). Taught in Help ▸
   keyboard shortcuts.

## Tests

Suite `tests/test-v1170.js` (27 checks) — includes a Graph round-trip assert that
a save writes `driver:'1'` on the outgoing PATCH. `test-v1100`'s index check now
branches on the `cd-drv` marker (7 columns on v1.17.0+, 6 before).

## v1.17.1 (same evening — owner: "columns are not resizeable")

They weren't: the v1.17.0 grips were `<span>`s inside the header cells, and the
`.cd-cols span` rule out-specified `.cd-grip` — `position:relative` beat
`absolute` and every grip collapsed to 0px wide, so there was nothing to grab.
The original check called `cdColDrag()` programmatically and never exercised the
real hit target — lesson recorded. Grips are now `<i>` elements on the header row
itself (full header height, always-visible divider line, darker on hover), seated
at each column edge by `cdGripSync()` and tracking live during the drag. Verified
this time with real mouse drags in a browser (column 243px, split 866px, both
persisted). Regression check added to test-v1170 (28).

## Known ceilings

- Column resize pins ONE column to px while the untouched columns share the rest
  (no full colgroup model) — noted at the CSS rule; upgrade only if it fights.
- `cdTitle` strips only `CAPS/digits + hyphen` prefixes; a lowercase code prefix
  would pass through untouched (deliberate — protects real hyphenated titles).
