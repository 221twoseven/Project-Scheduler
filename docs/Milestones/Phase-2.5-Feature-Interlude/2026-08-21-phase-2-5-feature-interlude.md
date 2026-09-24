# Phase 2.5 — feature interlude between UX Phases 2 and 3 (REV53–64) — 2026-08-19 → 21

**What this is.** After UX Phase 2 closed (2026-08-14) and before Phase 3 has its task
briefs, a run of higher-priority feature work and field-note fixes shipped on
`development` — REV53 through REV64. None of it was in the Phase 1/2 briefs, so it's
categorized here as **Phase 2.5**. One-file records for each REV live in
[`Phase 2.5/`](); this page is the index. Carried by PR
[#15](https://github.com/221twoseven/Project-Scheduler/pull/15) (open, `development → main`).

**The REVs, one line each:**

- **REV53 — Calendar create menu + parity.** The calendar creates and edits like the
  gantt: menu on empty cells, bar menu + selection on phase bands, keyboard carries over.
- **REV54 — Standalone events.** Events became their own rows in a new
  `ShopTimeline_Events` list (approved, additive-only); no host phase needed, with a
  legacy fallback when the list is absent.
- **REV55 — Draft vs saved subtask convergence.** Dragged draft subtasks stopped
  snapping back; Save files exactly what the preview shows.
- **REV56 — Subtask hierarchy.** The department's primary bar *is* the parent row;
  subtasks render in a lighter shade, clamp to the parent window, resize from both edges.
- **REV57 — Project-page refinement batch.** The ungated items from Robert's N1–N16
  field notes (status labels, muted toolbar, anchored status pill, breadcrumb, unsaved
  warning, manual department dates, calendar density, left/right-click discipline).
- **REV58 — Draft autosave.** A slept or discarded tab no longer wipes an unsaved draft.
- **REV59 — Title row uncovered.** The dock stopped covering the project title row.
- **REV61 — Left-click editor cleanup.** One selection/editor path on the project page.
- **REV62 — Roster fan-out vs named lines.** One bar per department; named lines are
  the split mechanism, not per-person fan-out.
- **REV63 — Work priority over people priority + breadcrumb trail.** Crews of any size
  on subtasks (ownership implicit through the project team), and the visible
  Timeline ‹ project ‹ phase trail.
- **REV64 — One checkpoint language.** The project page adopted the Home modal's
  checkpoint editor (date | name | notes | phase, in place) in the bottom dock;
  "+ Event" became "+ Checkpoint" everywhere on the page; tasks got their own gantt
  row; delete works from every surface.

**Also in this window, infrastructure (not app REVs, records at the Milestones root):**
the Pages deploy trimmed to app files only (PR #14), and the repo-visibility decision
(staying public).

**Decisions this interlude made or moved** (reconciled in `docs/Archive/TODO-v1-Archive.md`):
calendar parity done (§3 item 1); standalone events built (§3 item 2 — the app falls
back to legacy phase-hosted saves until the list exists on the site); subtask model
settled (§3 items 3/5); N6/N7 agenda editors delivered by REV64 without waiting on the
N9 tasks-vs-events decision — N9 remains open but now only as a data-model question,
the editor no longer forks on it.

**Tests.** The feature REVs shipped with their own suites (`test53`–`test57`,
`test61`–`test63`) and REV64 updated the earlier ones in place; the full run is green
on `index.html` and the frozen REV50 reference (24/24 suites each).
