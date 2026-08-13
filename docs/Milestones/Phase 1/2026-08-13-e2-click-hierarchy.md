# Click hierarchy on the timeline (E2)

**Date:** 2026-08-13 · **App REV:** 52 · **Branch:** development (E2 of the Phase 1 briefs)

## What changed

Design-Language §6 says: a plain left-click on a bar opens its details; any drag never
does. The disambiguation is now explicit on both surfaces — the modal/selection fires on
mouse-up only if the pointer travelled **less than 3px**.

- **Main timeline:** a plain click on a task bar opens the task modal (the phase modal
  stays — this reverses the backlog's "retire the phase modal?" item). Any drag — a move,
  a resize on either handle, or even an *attempted* drag released before the 200ms hold —
  suppresses the click, so a flick can no longer land you in the editor.
- A clean click on a resize handle now opens the modal too (the handles used to swallow
  clicks dead).
- Pinned / date-protected bars: an edge-grab used to be ignored outright, which let a
  drag on a pinned bar fire the modal on release. The grab now registers as a (date-inert)
  move, so click-vs-drag disambiguation works identically on pinned bars.
- **Project page:** a plain click selects the bar, and the bottom inspector — driven by
  selection — is that surface's edit-details; there is no phase modal there. A drag of any
  kind (including one that rounds back to zero days, or one blocked by a pin / Protect
  dates) no longer selects. The per-surface rule is documented in comments at both click
  sites.

## Why it mattered

The old click test was "did a drag engage", not "did the pointer move". A quick 10px flick
released inside the 200ms hold counted as a click and popped the editor mid-schedule-shuffle;
on the project page the same flick force-selected a bar. Clicks and drags now mean what
they look like.

## Tests

New suite `tests/test-e2-click.js` (20 assertions), wired into `tests/run.js`: clean click
opens the modal, 10px flick and engaged drags (move + resize) don't, handle clicks bubble,
pinned bars click-but-don't-drag — and on the project page, click selects while sub-day
and locked drags select nothing. Skips on the frozen REV50 reference (pre-E2). Full run:
10/10 suites.

## Known ceilings

- After a *committed* resize/move on the project page the bar is re-selected (quietly) to
  keep the selection ring — deliberate, pre-existing feedback, not a click.
