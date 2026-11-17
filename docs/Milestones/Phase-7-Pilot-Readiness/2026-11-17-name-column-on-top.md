# The project page's name column stays on top — v1.53.1 (2026-11-17)

**TODO item 83** (owner's screenshot, 2026-11-17). PR #194.

## What changed and why

On a project's schedule, the names on the left (the phase, Milestones and Notes rows) are a
column that stays put while the chart scrolls sideways. Once the chart was scrolled, a
selected phase bar slid over that column and hid the phase's name. So did milestone
diamonds, notes, holiday pills ("Labor Day") and the Today and deadline lines.

The cause: each row was drawn as its own layer. Inside a row the selected bar outranked the
name cell, and everything drawn across the rows (markers, Today, holidays) outranked every
row, names included.

v1.53.1 draws the chart body as one layer and puts the name column at the top of it. Bars,
markers and lines now slide under the names. Nothing else moved: the Vivid months tint still
sits under the rows, Today still washes over bars, and the reorder drop line still crosses the
name column. CSS only, no data or behaviour change.

**Before:** `screenshots/before-name-column.png` (the selected bar and a milestone over the names)
**After:** `screenshots/after-name-column.png` (the names on top)

## Known limits

- A row being dragged to a new place (it fades while you drag) is its own layer for that
  moment, so markers can show over its name until you drop it.

## Checks

`tests/test-v1531.js` reads the stylesheet (the test browser has no layout): the name column
outranks every layer the chart draws, no rule makes a row its own layer again, the chart body
is one layer, the tint stays under the rows, and bars stay under the markers as before. It
fails 18 of its 21 checks on v1.53.0.
Checked by hand in a browser: a selected bar, a milestone and a holiday pill scrolled under
the names, with and without Vivid months.

Accessibility (`design/Design-Language.md` §9): no new controls, colours or text; the names
are now always readable, which is the point of the fix.
