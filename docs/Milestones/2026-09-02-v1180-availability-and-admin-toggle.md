# Availability tri-state + Admin/Non-admin toggle (v1.18.0)

**Date:** 2026-09-02 (late, after v1.17.1)

## What changed

1. **Availability is now explicit.** Many roster names are freelancers who aren't
   active year-round, so the People editor gained an Availability radio group:
   - **Available** and **Not available** — manual, stored in a new `availability`
     staff column (⚠ Robert creates: single-line text, `available`/`unavailable`,
     empty = available).
   - **Out of office** — automatic: checked (and never hand-selectable) while a
     time-off date range covers today, and it always outranks the manual flag.
   The Status column follows: grey "Not available", amber "Away until …", green
   "Available".
2. **The developer toggle reads as the view you're in.** The old "Viewer" button
   is now labeled **Admin** (default) / **Non-admin** (previewing) — same
   mechanics, honest label. The preview now also hides **Help ▸ App settings**
   and the demo preamble slides, so every menu reads exactly as a non-developer
   sees it.
3. **Rode along:**
   - `renderCompanyPage` runs `applyPerms` at the door — a direct `#/people` load
     used to leave the dev cluster and Help entries stale until the next repaint.
   - The Driver ✓ centers under its header.
   - Time-off entry stays the editor's **"Out of office"** date ranges (owner
     ruling: keep the name). Entry stays manual for now; tying it to the company
     time-off calendar is part of the item-13 consolidation.

## Tests

Suite `tests/test-v1180.js` (19 checks): tri-state precedence on the Status
column, radio states incl. the automatic OOO case, the Graph PATCH carrying
`availability`, and the toggle relabel + menu accuracy round trip.

## Known ceilings

- The manual flag affects the People page's Status column only — scheduling
  logic (conflicts, dashboards' Time off) still reads the date ranges, which is
  what it means: "not on the roster right now", not "booked".
