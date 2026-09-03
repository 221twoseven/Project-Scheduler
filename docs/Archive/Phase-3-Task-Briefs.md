# Phase 3 — Claude Code Handoff Pack (Navigation at Scale)

**August 26, 2026 · for `development` (post-REV74, `index.html` ~7,151 lines) · run briefs in order, one session + one PR each.**
Specs: `docs/Design-Language.md` (by §) · findings: `docs/Archive/UX-Audit-and-Strategy.md` · this pack answers `docs/TODO.md` §6's "needs task briefs from the owner."

---

## Part A — State of the code (verified against `development` head, 2026-08-26)

Phase 2.5 and the interposed tracks consumed or changed a lot of the original Phase 3 assumptions. What's true now:

- **The "Dash view" is gone from scope** — superseded by the shipped person filter (REV65), identity chain (REV66), person panel (REV67), and dashboard button + breadcrumb (REV68). Phase 3 is now exactly: **B3 zoom + jump-to-date, B5 compact density, B6 saved views.**
- **Hallway round 2 was skipped (owner, 2026-08-25)**, so the B3/B5-vs-B6 data gate never happened. These briefs therefore ship **all three**, ordered so the cheapest wins land first and B6 captures the others' state.
- **Grouping already exists**: REV44 sort-group headers (`grp-head` ~786, ~2549) group by Client/PM/Status via the sort bar, and `GROUP_BY` persists (`shopTimelineGroup`). What's missing from the old B6 sketch is only **collapse** on those headers — folded into V3 below. B6's real remaining work is **named saved views**.
- **Zoom raw material**: `const DW={days:40,weeks:14}` (~1306), `dw()`/`d2x()`/`x2d()` helpers (~1431), `VIEW` state + `btn-days`/`btn-weeks` (~1091, handlers ~6676) and `D`/`W` keys (~6653). Everything reads through `dw()`, which is why zoom steps are cheap.
- **Density raw material**: `--row-h:44px` token shipped in U1 (~line 22) with the CSS/JS drift test.
- **Persistence is mature**: `UI_KEY` already snapshots collapsedDepts, colorMode, sideW, npvGut, showStatus, **person, lens** (~2035), plus separate keys for tint, group, dock height. Saved views = named snapshots of exactly this state — the plumbing exists.
- **`G` is free on the main timeline** (only bound inside the project page, for Gantt mode ~6612).
- Test convention unchanged: new suites skip on the reference build; both draft/saved paths where applicable.

Standing rules per brief (once): *read `CLAUDE.md` + `docs/Design-Language.md` + the finding; smallest diff; no schema/auth changes — everything in this phase is per-browser localStorage; full suite green + new suite with skip-guard; before/after screenshots from `/preview/`; accessibility checklist §9; milestone record per the repo convention.*

---

## Part B — Task briefs (dependency order)

### V1 — Zoom steps (B3a)

> Implement finding B3's zoom half per Design-Language §7. Replace the binary Days/Weeks with **four zoom steps: Day 40 / 2-Day 20 / Week 14 / Month 5** px-per-day — Day and Week keep today's exact values (`DW` ~1306) so two of the four steps are pixel-identical to current renders and existing tests stay meaningful. Update Design-Language §7's illustrative values (34/20/9/3) to these in the same PR (doc-vs-code divergence rule).
> UI: the Days/Weeks toggle becomes a 4-step control (segmented buttons or − / + stepper with a label — pick the one that fits the toolbar rhythm from U6); `D`/`W` keys still jump to Day/Week, and add `+`/`-` for step in/out. All rendering already flows through `dw()`/`VIEW` — extend `DW`, `VIEW` names, and every `VIEW==='days'` branch (grep carefully: axis labeling, header bands, edge indicators, marker widths). Enforce the §7 bar-anatomy rules at the two new densities: chips drop first, then code; below min renderable width, pill only; below that, the 4px identity tick. Weekends/holidays compress but never disappear (§7).
> Persist the chosen step in `UI_KEY`. Axis header at Month step shows month names only (no day numbers); at 2-Day, day numbers on Mondays.
> **Acceptance:** a 6-month season fits one screen at Month step with every project identifiable; Day/Week steps render exactly as before; keyboard `+`/`-` walks the steps; edge indicators (T6) still point correctly at every step.

### V2 — Jump-to-date + center-on-today (B3b)

> Implement finding B3's navigation half. Add **Go to date**: `G` on the main timeline (free there — the project page's `G` binding at ~6612 is scoped and untouched) and a click on any month name in the header band both open a small popover with a native `<input type="date">` plus quick picks (Today, +1 month, +3 months, next install). Choosing a date smooth-scrolls it to viewport center (instant under `prefers-reduced-motion`, same rule as T6). The Today button gains the same centering behavior (currently it scrolls Today into view — make it center).
> One overlay at a time per §6; Escape closes; the popover is also reachable from the legend/`?` area so it's discoverable without the keyboard (three-path rule).
> **Acceptance:** from anywhere on a 9-month timeline, any date is ≤3 interactions away; `G` → type date → Enter lands centered; month-name click affordance is visible on hover.

### V3 — Compact density + group collapse (B5, B6-part)

> Implement finding B5 per Design-Language §4, plus the missing collapse on REV44's group headers. Density: a Comfortable/Compact toggle (Settings menu, persisted in `UI_KEY`) switching `--row-h` 44px ↔ 32px. Sweep every consumer of row height: sidebar rows (two-line layout from T5 must degrade gracefully — at Compact, name and code·date go single-line each with tighter leading), gantt row geometry, bar padding, edge indicators, lane math where the JS mirrors CSS — add the Compact value to the drift test. All hit targets stay ≥24px (§4): at Compact, bar edge-resize zones and grip dots must not shrink below that.
> Group collapse: clicking a `grp-head` row (~2549) collapses/expands its group (chevron + count already present in the header pattern); collapsed sets persist in `UI_KEY` keyed by group mode, mirroring the existing `COLLAPSED` depts pattern.
> **Acceptance:** 30 seeded projects fit one screen at Compact + Month step; nothing becomes unclickable; collapsing "Caroline · 8 projects" hides her rows and survives reload.

### V4 — Named saved views (B6)

> Implement finding B6 per the audit's Theme B. A **Views** control on the toolbar (right of the person filter): save the current state under a name, apply, rename, delete, and mark one as "open at launch." A view snapshots exactly: lens, sort/group, status filter, person, search text, color mode, zoom step (V1), density (V3), tint, collapsed groups — i.e., a named copy of the `UI_KEY` bundle plus the loose keys; implement by refactoring those into one `viewState()` getter/applier used by both the live session and view apply (single source of truth, no behavior change when no view is used).
> Storage: localStorage only (`shopTimelineViews_v1`) — views are per-browser by design; no schema. Seed two starter views on first run: "Everything" (defaults) and "My work" (person = me from the REV66 identity chain, if resolved). Stretch (only if the diff stays small): "Copy link to view" encoding the snapshot into the URL hash so a view can be sent to a teammate — read-on-load, never auto-saved.
> **Acceptance:** save "Install crunch" (status=In Fabrication+Design, group=PM, Month step, Compact), switch away, reapply — identical render; launch view honored on reload; deleting a view never touches live state.

### V5 — Phase 3 close + Phase 4 rescope

> Close the phase. (1) Evidence: before/after screenshot set — dense timeline at each zoom step, Compact vs Comfortable, a saved view applying — and the `docs/Milestones/` record naming B3, B5, B6 shipped. (2) Update `docs/Archive/UX-Audit-and-Strategy.md`: mark Phase 3 complete; rewrite the Phase 4 section against reality — **coach marks shipped early (REV74)**, so reassess: the first-run hint bar is likely redundant (recommend: drop), the `?` shortcuts sheet on the main timeline and the sample-project onboarding (A5, using `seed()` through the normal create path) remain, and A2's remaining sliver is hover affordances only. (3) Update `docs/TODO.md` §6 accordingly and pull anything Phase 3 deferred into the §7 polish-pass convention.
> **Acceptance:** the strategy doc reads true start to finish; TODO §6 contains only the rescoped Phase 4; the milestone record is management-readable.

---

## Part C — Order rationale & exit

V1 before V2 (jump-to-date centers against final step geometry) and before V3 (density interacts with bar anatomy at small steps — settle horizontal first, then vertical). V4 after V1+V3 because a view snapshots their state — building it earlier means migrating its schema twice (the `_v1` key suffix is there regardless: version the shape, don't mutate it). V5 last, as always.

All five briefs are localStorage-only — this is the first phase with **zero ⚠ exposure**, so sessions can run back-to-back without approval gates. Same hygiene: one brief, one fresh session, one merged PR; single file, no parallel branches.

**Exit:** suites green on both builds · promote to `main` when V5 merges (the §4 promotion pattern from PR #15) · then decide Phase 4 from the rescoped section — it's small enough that it may be one session's work.
