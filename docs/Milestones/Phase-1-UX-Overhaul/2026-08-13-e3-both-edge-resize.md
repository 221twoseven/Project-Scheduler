# Both-edge bar resize on the project page (E3)

**Date:** 2026-08-13 · **App REV:** 52 · **Branch:** development (T3 of the Phase 1 briefs)

## What changed

Bars on the project page could only be resized from their **left** edge. They now have a
grab zone at **both** ends, matching the main timeline and Design-Language §6:

- Left edge changes the phase's start date; right edge changes its end date.
- Either edge snaps to workdays — a start dropped on a weekend rolls forward to Monday,
  an end rolls back to Friday. Holidays count as non-working too.
- A small date tooltip follows the cursor while you drag, so you can see where the edge
  will land before letting go.
- Pinned bars and the "Protect dates" toggle block edge-dragging, exactly like the main
  timeline. A click on the bar still selects it.
- Every resize shows an **Undo** toast — on saved projects it reverses the saved change;
  on a new-project draft it reverses the preview placement.
- Handles are invisible until you hover the bar, then show a thin rule at each edge
  (8px grab width, resize cursor).

## Why it mattered

Dragging the wrong edge did nothing (or moved the whole bar), which read as "resize is
broken". PMs adjusting a phase's end date had to open the editor instead.

## Draft vs saved behavior

On a **saved** project the resize writes straight to the schedule (and SharePoint), with
undo. On a **new-project draft** the resize only adjusts the live preview — nothing is
filed until Save — and Save keeps exactly the bars shown, drags included. This replaces
the old draft behavior where a left-edge drag rewrote the department's estimated-days
field; the dragged dates are now kept as a manual placement, same as moving a bar.

## Tests

New suite `tests/test-e3-resize.js` (26 assertions), wired into `tests/run.js`: both
handles present, right-edge writes end date, workday snap in both directions, pinned +
Protect dates blocking, and the draft path staying out of `ST` with working undo — on
both the saved page and the draft page.

## Known ceilings

- Handle width is a fixed 8px; the §6 refinement (12px zones on bars narrower than 60px)
  is not implemented yet.
- Draft-page *moves* (not resizes) still show no undo toast — pre-existing, untouched.
