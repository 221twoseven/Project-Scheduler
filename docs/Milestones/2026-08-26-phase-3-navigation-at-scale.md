# Phase 3 — Navigation at scale (B3, B5, B6) — 2026-08-25/26

**What this is.** The complete third phase of the UX plan in
`docs/Archive/UX-Audit-and-Strategy.md`, delivered from the owner's five task briefs
(`Phase-3-Task-Briefs.md`, V1–V5) over 2026-08-25/26, REV 74→79 on `development`.
One-file records for each task live in [`Phase 3/`](Phase%203/). Phase 1 fixed what
things *do*, Phase 2 fixed what they *say at a glance* — Phase 3 makes the timeline
navigable when the shop is actually busy: more projects, longer seasons, one screen.

**What shipped — the audit's three Theme B findings, all of them:**

- **B3 — Zoom steps (REV75, [PR #16](https://github.com/221twoseven/Project-Scheduler/pull/16)).**
  The two-position Days/Weeks toggle became four zoom steps — **Day · 2-Day · Week ·
  Month** — with `+`/`−` keys to walk them. A six-month season now fits one screen at
  Month with every project still identifiable; Day and Week render exactly as before.
- **B3 — Jump to date (REV76, [PR #17](https://github.com/221twoseven/Project-Scheduler/pull/17)).**
  Direct travel to any date: press **G**, click a **month name** in the header, or use
  the `?` legend — pick a date (or Today / +1 mo / +3 mo / next install) and the
  timeline centers on it. The Today button now centers too.
- **B5 — Density levels + group collapse (REV77–78, PRs
  [#19](https://github.com/221twoseven/Project-Scheduler/pull/19) /
  [#20](https://github.com/221twoseven/Project-Scheduler/pull/20)).**
  A Settings control cycles **Comfortable 56 / Snug 44 / Compact 32** px rows (the
  three-level split is an owner ruling; every hit target keeps the 24px floor), and
  the sidebar's group headers — by PM, client, or status — now **collapse** with a
  click and stay collapsed per grouping mode. Thirty projects come within one screen
  at Compact + Month.
- **B6 — Named saved views (REV79, [PR #21](https://github.com/221twoseven/Project-Scheduler/pull/21)).**
  A **Views** menu on the toolbar saves the whole arrangement — lens, grouping, status
  filter, person, search, color mode, zoom, density, tint, collapsed groups — under a
  name: one click brings it back, a ★ makes it the launch view, a 🔗 copies a link
  that opens the app already in that view. Two starters seed on first open
  (*Everything*, *My work*). All of it per-browser localStorage — the whole phase
  involved **zero SharePoint schema or auth changes**.

**Why it mattered.** The audit's Theme B was one complaint in three forms: the
timeline had a single fixed scale in both directions and no way to keep a working
arrangement. A PM running the Monday meeting can now see the season (Month zoom),
the crunch week (Day), the whole shop on one screen (Compact + collapse) — and get
back to that exact setup in one click, or zero on launch.

**Evidence** (stubbed-data captures, headless Chrome — full sets in each task record):

| What | Screenshot |
|---|---|
| Zoom — Day | [after-b3-days.png](Phase%203/screenshots/after-b3-days.png) |
| Zoom — 2-Day | [after-b3-day2.png](Phase%203/screenshots/after-b3-day2.png) |
| Zoom — Week | [after-b3-week.png](Phase%203/screenshots/after-b3-week.png) |
| Zoom — Month (a season, one screen) | [after-b3-month.png](Phase%203/screenshots/after-b3-month.png) |
| Density — Comfortable (before) | [before-b5-rows.png](Phase%203/screenshots/before-b5-rows.png) |
| Density — Compact (after) | [after-b5-compact.png](Phase%203/screenshots/after-b5-compact.png) |
| Group "Caroline · 8" collapsed | [after-b5-collapsed.png](Phase%203/screenshots/after-b5-collapsed.png) |
| Views menu open | [after-b6-views-menu.png](Phase%203/screenshots/after-b6-views-menu.png) |
| A saved view applied, one click | [after-b6-view-applied.png](Phase%203/screenshots/after-b6-view-applied.png) |

**Tests.** Each task landed with its own suite (`test-b3-zoom`, `test-goto`,
`test-b5`, `test-v4-views`) plus drift assertions in `test46`; the full `npm test`
run was green on both `index.html` and the frozen REV50 reference before every merge.

**Process.** One brief, one fresh session, one PR into `development` — five PRs total,
each merged by the owner. Promotion of the whole phase to `main` happens once, when
this close-out (V5) merges, per the PR #15 pattern.

**Follow-ups.** Per-task ceilings live in each `Phase 3/` record and are mirrored in
the deferred ledger, `docs/Archive/TODO-v1-Archive.md` §7 (jump memory, popover anchor math, the ⇕ All
button vs group headers, what a view deliberately doesn't capture). Phase 4 was
**rescoped at this close** — coach marks (REV74) shipped ahead of it, so the first-run
hint bar is recommended dropped; see the strategy doc §5 and `docs/Archive/TODO-v1-Archive.md` §6.

**Post-close review (2026-08-26).** The owner's review of the REV79 build added a
**Phase 3.5** punch list (window parity, timeline navigation polish, toolbar
regrouping, calendar feedback, coach-mark fixes, a completion flow) — see
`docs/Archive/TODO-v1-Archive.md` §6. It lands on `development` before the promotion PR
([#23](https://github.com/221twoseven/Project-Scheduler/pull/23), REV74–79)
merges, riding the same PR.
