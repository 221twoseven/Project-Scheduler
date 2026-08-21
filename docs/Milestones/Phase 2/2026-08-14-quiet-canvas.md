# Quiet canvas becomes the default (finding C2)

**Date:** 2026-08-14 · **Branch:** development · **Design-Language §2.4**

## What changed

The calendar background no longer competes with the work. By default the
timeline, the project-page Gantt, and the project-page Calendar all use the
new "Quiet" canvas:

- Workdays are near-white (`#FCFDFE`); alternating months get a wash so faint
  it only reads side by side (`hsl(h, 6%, 97%)`).
- Weekends and holidays are `#EEF1F5`, with the calendar hatch dimmed to 40%
  of its old opacity.
- Months separate with a 1px hairline and their label instead of a colour band.
- Month header bands are capped at `hsl(h, 30%, 88%)` fill with dark
  `hsl(h, 35%, 30%)` text.

The old saturated month-band look is still one click away: the **Tint** button
is now **Vivid months** (same place, same saved preference — anyone who had
tint on keeps it). Printing always uses the quiet canvas, whatever is on
screen.

## Why it mattered

Background chroma was louder than the bars carrying actual data. On the quiet
canvas every project bar is the most colourful thing on screen (measured: max
canvas chroma 2 vs. 168 for a bar), while weekends and month boundaries stay
readable.

## Evidence

- New suite `tests/test-quiet.js` (27 assertions): quiet default, vivid
  restore, all three surfaces, localStorage continuity, print overrides.
  `cellBg` is asserted byte-identical to the REV50 reference so "Vivid months"
  is exactly the old look.
- All 12 suites pass against `index.html`.

## Known ceiling / follow-up

- The main timeline's weekend column never had a hatch (it was a translucent
  grey wash); quiet gives it the same faint hatch as the calendars.
- PR link: [#15](https://github.com/221twoseven/Project-Scheduler/pull/15) (promotion PR).
