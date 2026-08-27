# Calendar collapses phases + the breadcrumb gets its own bar (REV84) — 2026-08-27

Two Phase 3.5 punch-list items (`docs/TODO.md` §6), both code-ready with no owner
decision pending. PR: _added on open_.

**The calendar collapses each phase by default.** Subtask bands used to always
paint, so a job with chunked departments turned the month view into a wall of
bands. Now the calendar shows one band per phase (the department's parent bar,
with the N16 "+N" roster merge intact), and **left-clicking a phase band opens
the Phase Edit form at the bottom of the screen and brings that phase's subtasks
into view** — deselecting (Esc, empty canvas, the breadcrumb) collapses them
again. The click already did the selection half since REV53/REV82; the new part
is the collapse and the repaint-on-select. The Gantt's own expand state
(`NPV_OPEN`, the ▸ toggle) is untouched — the calendar's expansion follows the
selection, per the owner's wording.

![Collapsed: one band per phase](Phase%203.5/screenshots/after-3-5-cal-collapse.png)
![Clicked: the editor opens and the subtasks come into view](Phase%203.5/screenshots/after-3-5-cal-expand.png)

**The nav breadcrumb sits on its own bar.** On the project pages the breadcrumb
trail (All Projects › project › phase) and the summary strip (client, job,
installs…) rendered as one unseparated blob. The trail now has its own bar with
a hairline below it, and the summary strip reads as its own band beneath —
two CSS declarations, no markup change.

![Breadcrumb bar above, summary strip below](Phase%203.5/screenshots/after-3-5-crumb-bar.png)

**Tests.** New suite `tests/test84.js` (14 assertions, both pages per the REV49
lesson): default collapse, the +N roster merge surviving it, click → selection +
phase editor + subtasks in view + ring, deselect → collapse, and the same cycle
on a draft with a freshly created subtask. Skips on pre-REV84 builds.
`test71`/`test72` updated for the new contract (they grabbed subtask bands
while deselected — and their moves flipped the positional parent, which the
collapse now makes visible). `test82` de-flaked in passing: its I9 assertion
compared a duplicated draft bar against `rel(2)`, a constant that lands on a
weekend some days and gets workday-snapped; it failed on the unchanged
development build too and now compares against the source bar's actual date.
Full `npm test` and `npm run test:ref` green.

**Known ceilings / follow-ups** (ledgered in TODO §7): while collapsed, a phase's
band spans only the parent bar's window — a draft subtask deliberately scheduled
outside its parent's window (the chunk-pipeline case) is invisible until the
phase is clicked. If that misleads in practice, stretch the collapsed band to the
department's min/max extent the way the Gantt's collapsed row does.
