# Status = pattern + pill, never hue theft, plus the legend (finding C3)

**Date:** 2026-08-14 · **Branch:** development · **Design-Language §2.1, §7**

## What changed

A project's colour now survives every status change — status is carried by
pattern, opacity and the pill, never by repainting the bar.

- **Forecast bars keep their project's colour.** The old treatment turned
  them gray (`grayscale(1)` filter plus gray pill overrides). Now a forecast
  bar is the project's own hue at 40% opacity with a 1.5px dashed outline in
  that same hue — clearly "penciled in", still clearly *that* project.
- **Complete bars dim to 60% opacity and the pill gains a ✓** — no colour
  or saturation change (the old `saturate(.25)` filter is gone).
- **On-hold keeps its opacity + white diagonal hatch** — and the hatch now
  actually renders. Verification found a long-standing bug: the bars set the
  inline `background` shorthand, which silently resets `background-image`, so
  the hatch CSS never won. Bars now set `background-color`, and the hatch
  shows. Estimating's stripe is unchanged.
- **A `?` legend button** sits at the right end of the toolbar. Its popover
  explains all five encodings on one screen: the six status treatments,
  red = installation, the PM/D/F chip letters, and the Today and deadline
  markers. The swatches are real `.job-bar`/`.sum-pill`/`.dl-flag` elements
  styled by the live CSS, so the legend can never drift from the app. It
  behaves like the other toolbar menus: one open at a time, Escape or an
  outside click closes it.

## Why it mattered

"Hermès is the blue one" is the most basic visual contract the timeline
offers, and forecast/complete both broke it — a project changed colour when
its status changed, and gray forecast bars were indistinguishable from each
other. With hue freed up to mean only identity, status is readable from
pattern alone (which is also what makes the view work for colour-blind
users, finding D2), and the legend gives new users the decoder ring.

## Evidence

- New suite `tests/test-c3-status.js` (24 assertions): forecast bar's
  computed background and outline equal its project's palette slot, no
  grayscale filter or gray pill overrides remain, complete = opacity .6 + ✓
  with no filter, on-hold hatch is a white overlay that actually renders
  (background-color regression guard), legend opens/closes correctly and
  documents all five encodings.
- All 14 suites pass against `index.html`; the new suite skips on the frozen
  REV50 reference per the Phase-1 convention, and `test:ref` stays green.
- Verified in a real browser against a six-project seed (one per status):
  computed styles confirm every treatment renders, including the previously
  dead on-hold hatch, on bars and in the legend swatches.
- Before/after screenshots in [`screenshots/`](screenshots/):
  `before-status-bars.png` (gray forecast, hatchless on-hold, no legend button)
  vs `after-status-bars.png` (identity hues kept, hatch renders) and
  `after-legend.png` (the `?` popover, all five encodings on one screen).

## Known ceiling / follow-up

- The status pills keep their hand-tinted backgrounds (they are labels, not
  bars); `tests/test-contrast.js` already asserts every pill pair passes
  4.5:1 and that `labelColor()` agrees, so they remain inside the §2.5 rule.
- The meeting sheet's mini progress bars (`MEET_FILL`) still colour by
  status, mostly in retired status keys — U8's print pass is the natural
  place to reconcile them.
- PR link: _pending — changes are on `development`, not yet committed._
