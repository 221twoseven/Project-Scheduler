# 2026-08-31 — v1.6.3: project-Gantt scroll fallout fixes

**What:** v1.6.2 made scrolling and zooming a normal state on the Project Edit Gantt
(the date-strip gesture). That exposed three defects the panel had carried invisibly
since scrolling there was rare — the owner hit all three within minutes at `/preview/`.

## The three fixes

1. **Step buttons anchor on today.** Clicking Fit/Week/Month/3-Mo changed the scale
   and re-rendered but left `scrollLeft` at its old pixel value — which now pointed at
   whatever date happened to live there in the new scale, so the view "snapped to an
   unpredictable position". The buttons now hold today's on-screen pixel through the
   change (panel-center date when today is off-screen), same policy as the global
   toolbar's steps. When the whole job fits the panel (short job at 3-Mo), scroll
   clamps to zero — nothing to anchor, correctly.
2. **The axis got a sticky gutter mask.** Every chart row masks scrolled content with
   its sticky white name cell — but the date axis never had one, so day numbers, month
   names and day shading slid under the name column the moment the panel scrolled.
   A `.npv-axgut` sticky cell (sized live to `NPV_GUT`) now masks the strip.
3. **Weekend webs stopped painting over the bars.** The `.npv-web` weekend columns
   were emitted *after* the rows at the same z-index — above the row stacking
   contexts, i.e. **on top of every bar** — as a translucent grey slab. Invisible at
   sliver widths; at the px-per-day the new zoom reaches it visibly washed each phase
   crossing a weekend ("stripe contrast completely lost"). The webs moved into the
   z0 tint layer *under* the rows, wearing the Design-Language §2.4 quiet weekend
   treatment (opaque `#EEF1F5` + 45° hatch — the same as the global timeline's
   `.wknd-col`, which the owner had already approved at Week zoom). The quiet row
   zebra went translucent (`rgba(255,255,255,.35)`, visually identical to the old
   near-white `#FCFDFE`) so the layer reads through evenly — the same mechanism
   Vivid months has always used.

## Tests

`tests/test-v162.js` extended with a v1.6.3 section (29 checks total): today-anchored
step changes, the axis mask (present, first child, `NPV_GUT`-sized), webs inside the
tint layer with none loose above the rows. Adjacent suites re-verified: test-quiet,
test46 (tint layers), test-v150 (zoom steps), test-v102 (vivid CSS strings).

## Ceilings / notes

- The today column and deadline pennant (`z-index:4`) can still slide over the sticky
  row gutters at extreme scroll — they out-stack the gutters' capped row contexts.
  Translucent and narrow, unreported; ledgered in TODO §7 rather than restructured.
- Weekend hatch now covers the row zebra inside weekend columns — exactly how the
  global timeline treats them (§2.4).
