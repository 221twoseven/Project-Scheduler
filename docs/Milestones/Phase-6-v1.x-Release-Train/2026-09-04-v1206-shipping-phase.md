# 2026-09-04 — Shipping, the second way a job ends

**Date:** 2026-09-04 · **Version:** 1.20.6 · **Branch:** development → main (PR #41) ·
**Commit:** `1095747` · Record written 2026-10-15 (item 23); until then this lived as a
footnote in [the release-notes record](2026-09-04-generated-release-notes-and-view-as-picker.md).

Owner ask: some jobs ship out instead of being installed. **Shipping** is a new phase on
the project checklist, listed right after Installation. A job can have one or both.

## What changed

- **A new department, `shipping`,** in the `install` group. Department is a plain text
  column in `ShopTimeline_Tasks`, so no SharePoint change.
- **It follows every install rule** through `isEndDept()` / `isInstall()`: red bars
  (`#CE4242`, Design-Language), a crew picked from the whole staff, the crew saved as a
  JSON array, no dragging into another lane.
- **The phase chain changed.** `SCHED_PHASES` takes the whole `install` group as its last
  phase, so Installation and Shipping both end on the install date and run side by side;
  everything earlier chains back from the earlier of the two starts.
- **Complete means the last end day has passed** — whichever of the install or shipping
  bars ends last.
- **Vocabulary:** the Departments lens section and the group are now "Installation /
  Shipping". The People page folds Shipping into Installation (`PD_ALIAS`), so nobody
  needs a separate Shipping department.

## Ceiling

The shipping date is the same install date: there is no separate "ship by" date. If
shipping ever needs its own deadline, that's a new project column (⚠ schema).

Guarded by `test46` ("shipping is a second end phase"): both bars end on the deadline.
