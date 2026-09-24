# E1 — The inspector docks to the bottom

**Date:** 2026-08-13 · **REV:** 50 (company build) · **Spec:** Design-Language §7.5, UX brief U2 (E1)

## What changed

The project page's right-hand inspector rail (330px) is gone. The chart now takes the
full window width, and the Setup / Team / Departments / Agenda inspector sits below it
as a bottom dock — the title block of the drawing sheet.

- The dock defaults to 280px tall; drag the divider above it to resize. The height is
  remembered per browser (`shopTimelineDockH` in localStorage), the same way the old
  sidebar width was.
- Inside the dock the four sections run side by side as columns, all open at once —
  no more accordion clicking. When the window is too narrow for the columns' minimum
  widths, the panel scrolls sideways instead of re-collapsing.
- Selection is unchanged: nothing selected shows the project sections; clicking a bar
  swaps the panel to that phase's fields, with the × in the header going back.
- The footer buttons (Shortcuts, Delete/Cancel, Done/Create) moved onto the dock's
  bottom edge, keeping destructive actions physically far from the chart.
- The dead right-rail CSS (`.pg-cols`, `.pg-right`, the 1080px stacked fallback) was
  removed; the section fold state (`PP_FOLD`) went with it.

## Why it mattered

Every edit used to be a trip into a narrow 330px rail with three of four sections
folded shut. The chart also gave up a quarter of the window to that rail. Now the
schedule gets the whole width and everything editable is visible at once.

## Evidence

All 11 jsdom suites pass (364 assertions), including the updated `test49.js`
(sections open by default, headings no longer fold, dock + handle + footer present).
Verified in-browser at 1280px (four columns side by side, chart full width) and at
1000px (panel scrolls sideways); divider drag persisted a 360px height across reload.

## Known ceilings

- Column minimum widths are fixed (Setup/Agenda 240px, Team 340px, Departments 300px);
  if section content grows, revisit the minimums rather than re-adding folding.
