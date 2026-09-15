# 2026-09-15 — Weekly schedule on the People page

**Date:** 2026-09-15 · **Version:** 1.22.0 · **Branch:** development (/preview/ only for now)

Owner ask: each person should carry their working schedule — which days they are in and
what hours — visible at a glance on the People index and editable in the person editor.

## What changed

- **Editor:** a Schedule block under Departments — seven day checkboxes (M T W Th F Sa Su)
  and two time boxes, *from* and *to*. The boxes suggest every half hour from 5:00 AM to
  10:00 PM but also take typing; whatever is typed snaps to the nearest half hour
  (5:17 becomes 5:30 PM). A bare 1–6 reads as afternoon, since no shift here starts at
  3 AM — type "am" to override.
- **Index:** a **Schedule** column after Status, formatted the way the shop says it:
  `M-F 9-6`, `T-W-Th 11-4`, `M 5:30-1`. The full weekday week collapses to M-F; any other
  set lists the days. Hours drop the :00 and the am/pm. The column resizes with the
  header grip like the others.
- **Record page:** the same line as a Schedule row, shown only when a schedule is set.
- **Storage:** JSON in a new `schedule` column on `ShopTimeline_Staff`
  (`{"days":[1,2,3,4,5],"start":"09:00","end":"18:00"}`). Tristate like driver and
  availability: an editor that never touches the schedule controls does not send the
  field, so a site without the column never fails on other saves. Column created by
  Robert 2026-09-15 (spec in `docs/TODO.md` §5) — saves land directly.

Known ceiling: one range per person — no split shifts or per-day hours. Add a per-day
`hours` map when someone actually has one.

Guarded by `test-v1220` (25 checks); `test-v1100` and `test-v1170` learned the eighth
column.
