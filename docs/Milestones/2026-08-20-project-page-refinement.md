# 2026-08-20 — Project-page refinement batch (REV57)

**What changed:** the nine ungated items from Robert's recovered 2026-08-17 field notes
(TODO §3a), shipped as one REV so hallway test round 2 lands on a finished page.

- **N5 — status labels lose the "In".** Pills now read "Design" / "Fabrication"
  everywhere (pills, filters, group headers, Meeting Sheet, legend). Display-only:
  the stored keys (`in-design`, `in-fabrication`) are untouched, so zero schema risk.
- **N8 — the orphan agenda row is titled "Events"** (was "Not on a phase"); the
  standalone-event semantics behind it landed in REV54.
- **N15 — the main-timeline toolbar mutes on the project page.** Days/Weeks, Color,
  search, the status filter and Clear filters act on a chart that isn't visible there,
  so they hide entirely (nothing greyed pretends to be a control), and their shortcut
  keys (/, D, W) gate off the project view too. Today, Vivid months, Protect dates and
  the legend stay — they still do something.
- **N4 — the status pill has an anchor.** It used to float in the title row,
  absolutely positioned against the page. It now sits right-justified in the schedule
  footer with Kickoff / Lead time / Starts-in.
- **N1 — a visible breadcrumb.** The title row reads Timeline ‹ project name ‹ selected
  phase; the phase tail appears on selection and clicking it unwinds one layer —
  exactly what Escape does invisibly.
- **N2 — an unsaved draft asks before it is discarded.** Every exit funnels through the
  URL hash (Esc, Cancel, the back button, browser Back), so one confirm in the router
  covers them all; refresh/close gets the browser's native guard. Dirty = the form
  moved off its snapshot or anything was drawn on the chart. The phase modal got the
  same treatment via a serialized snapshot at open. Saved pages autosave — draft-only,
  as the note specified.
- **N13 — department Start/End date fields.** Each department row in the inspector
  checklist grows a date pair: edit a date and the day count recounts; edit days and
  the end moves. Dates snap forward to workdays and commit through the same paths a
  drag uses, so draft and saved behave identically (the REV49 lesson). The "Other"
  process-name field moved onto its own line under the choice.
- **N11 — left-click edits, right-click adds.** Left-click only selects (or opens the
  draft popover); every right-click menu on the chart is add-only — subtask, event,
  task — seeded with the clicked day and carrying an **inline name field** (type the
  name, Enter creates; no second dialog). Rename, duplicate and delete moved to the
  inspector (Duplicate gained a button there — the menu was its only home). Right-click
  no longer changes the selection, the two surfaces close each other, and the calendar
  follows the same rule — this supersedes REV53's left-click create menu on empty
  cells. Design-Language §6 records the new hierarchy.
- **N16 — calendar density.** Roster fan-out (one bar per assigned person) collapses to
  one band per phase with a "+N" chip, render-side only; a "Selected only" toggle in
  calendar mode filters the bands to the selected phase, keeping events for context.

**Why it mattered:** testers in hallway round 2 will live on this page. The batch
removes the traps round 1 flagged — dead-looking-but-live toolbar controls, silent
draft loss, the floating status word — and makes creation one gesture instead of three.

**Suite:** `tests/test57.js` (35 assertions, skips on the reference).
`test48`/`test49`/`test50` gate their old menu-shape assertions behind an N11 feature
sniff so they keep guarding the frozen REV50 reference unchanged; `test53`'s calendar
assertions updated in place (it never runs on the reference).

**App REV:** 57. **PR link:** pending (ships with the `development` → `main` promotion).

**Ceilings (deliberate, revisit on complaint):**

- A merged calendar band carries the first bar's index — clicking it selects that bar,
  not a picker of the merged people (`ponytail:` comment at the merge site).
- The department date fields move the department's **primary** bar; subtasks and
  parallel roster bars stay put, consistent with the REV56 parent-row model.
- The days→end recompute applies to the checklist's days field; the selected-phase
  inspector's Days field keeps its old meaning (estimate only, end untouched).
- "Selected only" filters phases; event/task markers always stay for context.
- The dept-menu "Remove from job" went with the other destructive actions — untick the
  department in the inspector instead.
