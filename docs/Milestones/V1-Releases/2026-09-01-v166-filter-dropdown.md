# 2026-09-01 — v1.6.6: the Filters dropdown revision

**What:** two owner asks from the same review round as v1.6.4/v1.6.5, both about the
Filters ▾ dropdown.

## 1. The Person section stays inside a Summary

Since v1.2.2 the Person section was CSS-hidden while the Summary/Dashboard place was
on — the only ways out were the × or the All Projects crumb. The owner's ruling: the
person list (radio buttons, already single-pick with an **Everyone** option) must stay
in the dropdown, so the person can be **switched in place** (radio another name — the
trail bar renames, the place stays) or **cleared** (Everyone — exits exactly like the
×, restoring the lens the dashboard button left, via `exitDash`).

What did NOT change: the person still never renders a filter chip, never counts in
the `Filters (n)` badge, and the toolbar **Clear filters** still keeps it — the
v1.2.2 "resets never exit the dashboard" ruling stands.

## 2. One menu-wide reset, phrased by outcome

The status section carried a **Show all / Clear all** pair that (a) only touched
statuses and (b) misled: "Clear all" sounded like clear-the-filters but actually
unchecked every status and hid every project. Both owner complaints, verbatim.

Replaced with a single **Show everything** button at the top of the dropdown:
statuses all restored, client picks cleared, person to Everyone (leaving a summary
the way the × does). The menu stays open so the reset reads back as every checkbox
re-ticked. `defaultShowStatus()` is all statuses, so the result is genuinely
zero-filters — the badge goes dark.

## Tests

New suite `tests/test-v166.js` (17 checks): the CSS hide gone, radios present inside
the summary, switch-in-place renames the trail, Everyone restores `PREV_LENS`, the
old pair absent, and Show everything clearing all three sections while nothing counts
as a filter afterwards. `tests/test-v121.js` branched on the `fm-showall` marker (the
v1.2.2 hidden-section assertion flips).

## Ceilings / notes (TODO §7)

- Deliberate asymmetry: **Show everything** clears the person; toolbar **Clear
  filters** keeps it (v1.2.2). Gate: owner wants them aligned.
- One-status isolation (the old Clear-all-then-tick-one flow) now means unchecking
  the rest by hand; a per-item "only" affordance is the clean fix if missed.
