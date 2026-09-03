# 2026-08-31 — v1.6.2: the second /preview/ polish round

**What:** the owner re-reviewed v1.6.1 at `/preview/` (calendar markers approved, step
zoom approved) and sent one follow-up plus three new items. All four shipped as v1.6.2
on `development`.

## The items

0. **Drag-zoom judder fixed (follow-up to v1.6.1 item 9).** The date header lives in
   its own scroll container (`#hdr-wrap`) that followed the canvas via the `scroll`
   event — which browsers fire a tick late, so during a zoom the month/day bars lagged
   the (smooth) canvas by a frame. Both zoom paths now push
   `hdrWrap.scrollLeft = gScroll.scrollLeft` in the same frame as the canvas move.
1. **The project-page date strip drives the global header's gestures.** Drag
   left/right pans; drag up/down zooms continuously between Week and 3-Month (the
   same 45° axis pick), anchored on the date under the pointer. This fires the v1.5.0
   §7 ledger gate ("no drag-zoom on the project date strip — gate: someone reaching
   for it" — the owner did). `NPV_FIT` goes float for drag-set fits (persisted; the
   loader accepts any 7–91 value, old integer steps unchanged); a between-steps fit
   lights no button, Fit restores whole-job. The axis and rows share one scroller, so
   the pan needs no header sync.
2. **Another person's workload is a Summary, not My Dashboard.** Dept lens + a person
   filter for someone who is not the signed-in identity keeps the identical view
   mechanics but presents as `Summary · name` in the trail, leaves the My Dashboard
   toolbar button dark, and swaps the sidebar label to "Summary" (`dashSelf()` next to
   `dashOn()`). Your own dashboard is unchanged.
3. **The phase dock gains a full-height Notes column.** The notes textarea left its
   two cramped rows under Start/End in the first column; the dock is now
   *This phase (half) | agenda (quarter) | Notes (quarter)* — the agenda's old half
   split in two, the textarea filling its section. Same `data-f="notes"` commit path.

## Tests

New suite `tests/test-v162.js` (22 checks: same-frame header sync, Summary-vs-My
Dashboard naming and button state, the three-column dock + notes commit, and the
strip's pan/zoom/persist/Fit-restore). All verified live in a real browser as well
(stubbed preview): pan +120 px with fit untouched, Fit→21.7-day drag-set float
persisted, dock columns at the intended halves/quarters.

## Ceilings / notes

- The strip gesture starts from Fit at the *live* days-on-screen, so zoom rate feels
  identical leaving Fit or a named step.
- `Summary` presentation triggers whenever the person isn't resolvable as "me"
  (unknown identity included) — conservative on shared terminals.
- The global timeline still has no Fit step (the other half of the v1.5.0 ledger
  entry — still gated on someone reaching for it).
