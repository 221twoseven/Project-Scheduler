# 2026-10-05 — Day count beside its dates (v1.33.1)

**Date:** 2026-10-05 · **App version:** v1.33.1 · **Where:** `index.html`,
`design/Design-Language.md` · **PR:** (fill in on merge)

## What changed

Under Project Schedule, a department's day count ("34 d") sat on the header row beside the
**+** button, while each extra work period's count sat on its own date line. The primary's
count now sits on its date line too, after the dates it counts — every line of a department
reads `start → end · N d`, however many periods it has. The header row keeps the checkbox,
the name and the **+**.

An unticked department no longer shows a greyed day count on its header row: the whole date
line hides when a row is off, which is the rule the panel already followed for dates.

## Why it mattered

Owner request (2026-10-05, screenshot): the count belonged next to the range it describes,
regardless of how many ranges a department has.

## Evidence

`screenshots/before-days-beside-dates.png` · `screenshots/after-days-beside-dates.png`

## Follow-up

None. `tests/test-v1331.js` asserts the placement on the saved page and the draft and that the
readers (commit, draft, change delegate) still find the field under the row.
