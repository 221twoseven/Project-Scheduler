# 2026-09-01 — v1.6.4: the third /preview/ polish round

**What:** the owner's third review round signed off the drag-zoom feel (post
same-frame sync) and the project-strip gesture, and sent one Summary-view change.
Shipped as v1.6.4 on `development`.

## The item

**The Summary/Dashboard place follows the person into the Projects lens.** Before:
`dashOn()` required the Departments lens, so picking a person filter while grouped by
project left an ordinary filtered view — lens toggle visible, person counted as a
filter chip. The owner's ruling: "the summary view is an analogue of my dashboard" —
a person filter should present as the summary place in either grouping, and the
Projects/Departments toggle should go away while it's on.

- `dashOn()` drops its `LENS==='dept'` requirement — any person filter (off the
  project page) is now the Summary / My Dashboard place: trail bar with × exit,
  sidebar label swap, person panel dock, person hidden from the Filters menu and
  never counted as a filter chip, resets/Clear-filters never exiting.
- Only the Departments reading is **flat** — a new `dash-flat` body class (set when
  `dashOn() && LENS==='dept'`) now carries the `#sb-all`-hide and caret-hide CSS, so
  project-lens rows keep their carets and expand/collapse as normal.
- The lens is locked while inside (the toggle is the only lens door and it hides);
  the My Dashboard button still forces the dept reading, and × restores the lens you
  came from (`PREV_LENS`).

## Tests

`tests/test-v162.js` (the running suite for this polish series) gains a v1.6.4
section: project lens + person presents as the summary place, trail/label intact,
`activeFilterCount()` stays 0, `dash-flat` off in the project reading and on in the
dept reading. `tests/test67.js` branched (V164 marker `dash-flat`): the person panel
now *follows* into the project lens instead of hiding. `tests/test-v120.js` CSS
regexes updated for the dash-flat split.

## Ceilings / notes

- Regrouping while inside the summary means exiting (×) and re-entering from the
  other lens — same trade My Dashboard has always made. Ledgered in TODO §7.
- Entering via the Filters menu from the Projects lens keeps the project grouping;
  the My Dashboard toolbar button always lands on the dept (flat) reading.
