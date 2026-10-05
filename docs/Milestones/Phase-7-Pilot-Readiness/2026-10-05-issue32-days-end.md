# 2026-10-05 — Departments: changing the days moves the end date (v1.34.1)

**Date:** 2026-10-05 · **App version:** v1.34.1 · **Where:** `index.html` · **Tracker:** #32 ·
**PR:** `fix/issue32-days-end`

## What changed

Under Project Setup → Departments, a PM typed Technical Design's start as Oct 5 and then set
its days to 5, and the end date stayed Oct 5: a five-day count over a one-day range, and
Create saved the one-day bar. On the New Project page the days edit only queued a redraw,
and the redraw put the typed one-day placement back.

Now every days field follows one rule, on the draft and on a saved project: the start
stays where it was typed, the end becomes the start plus N days (workdays for shop
departments, calendar days for Installation and Shipping, as #26 set), and the count and
the date range always agree. That rule now sits in one helper (`ppDeptDays`) behind all
three doors — the Departments row, the bottom panel's Days field and the bar's edit popover.
On a saved project the panel and the popover used to change the number without moving the
end; they move it now (spec Q2, default taken).

A draft bar nobody has typed or dragged still follows the scheduler: a days edit there
changes the estimate and the scheduler lays the job out backward from the target date, as
before (spec Q1, default taken). Undo for a days edit on the draft stays out of scope (Q3);
the chart's Reset still clears every manual placement.

## Why it mattered

The mismatch was visible on the page before Create, and Create saved the wrong bar — the
PM believed a five-day Technical Design was scheduled when a one-day one was.

## Evidence

`screenshots/before-issue32-days-end.png` (New project, target 10/26/2026, Technical Design
start 10/05/2026 then 5 days: the end still reads 10/05 and the bar is one day) ·
`screenshots/after-issue32-days-end.png` (same steps: the end reads 10/09, the bar spans five
days, Main Shop Fab untouched) · `screenshots/after-issue32-days-end-saved.png` (the same
edit on the saved page).

## Tests

`tests/test-v1341.js` — R1–R3 on the saved page and the draft (Departments row, bottom panel,
popover), the Q1 default (no manual placement for an untouched draft bar), the Q2 default
(saved-page panel and popover move the end), Installation calendar days with the header
following (#26, #15/#20), and Create sending Oct 5, Oct 9 and 5 to SharePoint.

## Follow-up

None.
