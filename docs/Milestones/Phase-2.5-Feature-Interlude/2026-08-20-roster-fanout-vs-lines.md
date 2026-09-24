# 2026-08-20 — Roster fan-out vs. named lines (REV62)

Robert's field report from the draft page: "2 designers adds one as a subtask and one
overlaid on the main bar; 3 drafters = 2 subtasks; renaming a subtask removes all
subtasks and renames the main bar — can't parse the logic."

## The logic, decoded

Two behaviors were colliding, one deliberate and one broken:

1. **Deliberate: one parallel bar per person.** PM, Technical Design, and Lead Fab are
   roster roles. Checking N people in the Team panel schedules N parallel bars in that
   department — that has been the scheduler's design from the start. The chart draws
   the first bar as the department's parent row and nests the rest as subtask rows —
   so 3 drafters = 1 parent + 2 subtasks, and a 2nd lead fab "adds a subtask". The
   "overlaid on the main bar" look is just a **collapsed** parent: until the disclosure
   triangle is opened, every bar draws on the parent's row, and parallel same-dates
   bars stack invisibly.

2. **Broken: editing one bar deleted the others.** On a draft, bars regenerate on
   every keystroke; only "lines" (`NPV_LINES`) survive. The per-person fan-out bars
   had no lines behind them — and the moment any line existed for a department (a
   rename, a who-edit, a +Subtask), the department was rebuilt **from lines only**,
   silently dropping everyone who hadn't been touched. Deleting one person's bar fell
   through to unchecking the entire department.

## The fix

Before a department's first line is created, every bar it currently draws is
line-backed (`ppSeedLines` — name and person preserved), unnamed-but-assigned lines
now render, and deleting one bar of several removes only that bar. Renaming Chris's
bar now renames exactly Chris's bar; Peter and Kate stay.

- Suite: `tests/test62.js` (13 assertions — fan-out, rename, who-edit, delete,
  +Subtask, and the collapsed-parent rendering note; skips pre-REV62).
- Saved pages are untouched: they draw real ST rows and never run the lines system.
- PR: rides [PR #15](https://github.com/221twoseven/Project-Scheduler/pull/15).

**Ceiling:** the collapsed parent still stacks same-dates bars invisibly (a +N count
chip like the calendar's N16 treatment would fix the ambiguity) — flag it if the
hallway test shows people missing the disclosure triangle.
