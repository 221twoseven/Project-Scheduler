# Phase 1 — Claude Code Handoff Pack

**August 12, 2026 · for `development` branch · run briefs in order, one session + one PR each.**
Companion docs (commit these first — see the CLAUDE.md diff below): `docs/UX-Audit-and-Strategy.md`, `docs/Design-Language.md`.

---

## Part A — Exact CLAUDE.md diff

Apply to `CLAUDE.md` on `development`:

```diff
 ## Core files

 - **`reference/Timeline_50.html` — immutable reference. NEVER modify it.** ...
 - **`index.html` — the company-developed application. This is the primary
   implementation file.** All company feature work happens here. It began as a
   byte-for-byte copy of the REV50 reference; divergence is expected over time.
+- **`docs/Design-Language.md` — the design system. Read it before any change that
+  touches appearance or interaction.** If a change contradicts it, either follow the
+  doc or update the doc in the same PR — never silently diverge.
+- **`docs/UX-Audit-and-Strategy.md` — the current UX plan.** Findings, phases, and
+  the finding→fix index. Task briefs reference its IDs (C1, B2, E3, …).

 ## Branches
```

```diff
 ## Change discipline

 - **Prefer small, reviewable changes.** Do not refactor unrelated working code unless
   explicitly requested.
+- **UI changes ship with evidence:** before/after screenshots from `/preview/` in the
+  PR description, and the accessibility checklist from `docs/Design-Language.md` §9
+  confirmed for any surface you touched.
 - **Before any substantial architectural change, first explain:** the proposed change,
```

---

## Part B — Task briefs (dependency order)

Paste each brief as the opening prompt of a fresh Claude Code session on `development`. Every brief inherits these standing rules, so they're stated once: *read `CLAUDE.md`, `docs/Design-Language.md`, and the referenced audit finding first; smallest reviewable diff; no SharePoint schema/auth changes; run the full suite (`npm test`) plus your new assertions; assert new behavior on BOTH the new-project draft page and the saved project page where the surface exists on both (the REV49 lesson); finish with before/after screenshots and a one-paragraph PR description naming the finding ID.*

---

### T1 — Label-contrast utility + palette regression test (C4) — *foundation, do first*

> Implement finding C4 from `docs/UX-Audit-and-Strategy.md` per `docs/Design-Language.md` §2.5.
> Add a `labelColor(bg)` function (WCAG relative luminance; returns `var(--ink)` or `#FFFFFF`) near the COLORS section (~line 1763). Apply it everywhere a label sits on a colored fill: timeline `.job-bar` text, project-page `.npv-bar` text, status pills, sidebar color chips if any carry text. Remove hand-picked per-bar text colors.
> Add `tests/test-contrast.js`: iterate `PCOLS`, `DEPT_COLORS`, `INSTALL_RED`, and the status-pill palette; assert every (fill, labelColor(fill)) pair ≥ 4.5:1. Wire it into the `npm test` script.
> **Acceptance:** no bar or pill anywhere renders white-on-light or dark-on-dark; the new test fails if a future palette edit regresses contrast.

### T2 — Stable project colors (C1)

> Implement finding C1 per Design-Language §2.2. In `projColor()` (~line 1764), replace the `findIndex`-based assignment with a stable hash of the project **id** into palette slots. Extend `PCOLS` (~line 1156) with slots 08–12 from Design-Language §2.2 (verify each against T1's contrast test). Implement the collision rule: if two currently *visible* projects share a slot, shift the later-created one to the nearest free slot for that render.
> Check every `projColor` call site (sidebar dots ~2014, bars ~2332, `ppColor` ~2982) still renders. Add a test: create three projects, delete the first, assert the remaining two projects' colors are unchanged.
> **Acceptance:** adding, deleting, or re-sorting projects never changes any other project's color; no project color visually approaches `INSTALL_RED`.

### T3 — Both-edge resize on project-page bars (E3)

> Implement directed change E3 per Design-Language §6 ("Bar resize works from both edges"). The **main timeline already conforms** (`bh-l`/`bh-r` handles, `resize-l`/`resize-r` in `startDrag` ~line 2418) — do not rework it beyond visual handle affordance. The gap is the **project page**: `.npv-bar` has a single left-edge `.npv-hdl` (~line 431, markup ~4202, hit test ~5128).
> Add a right-edge handle mirroring the left; left edge edits `startDate`, right edge edits `endDate`; snap to workdays; respect pinned bars and Protect dates (`DATE_LOCK`) exactly as the main timeline does; live date tooltip while dragging; Undo toast on release. Handle affordance per §6: visible on hover, ≥8px hit width, `ew-resize` cursor.
> This surface exists on both draft (`#/project/new`, NPV_LIVE false) and saved projects — test both paths explicitly, including that draft resize updates the scheduler preview without filing into `ST`.
> **Acceptance:** on both draft and saved project pages, either end of any unpinned bar can be dragged; dates land on workdays; Undo reverses it.

### T4 — Click-to-edit, disambiguated (E2)

> Implement directed change E2 per Design-Language §6 ("Click hierarchy on the timeline"). Main timeline: `bar` click already calls `openTaskModal(t.id)` (~line 2408) — keep the modal (this reverses the backlog's "retire the phase modal?" item) and harden disambiguation: the modal opens on mouse-up only if pointer travel < 3px; any drag (move or resize, including T3's new handles) suppresses it; verify the 200ms `holdTimer` + `SUPPRESS_CLICK` interplay can't eat a clean click or fire a modal after a drag.
> Project page: left-click on a bar selects it (drives the inspector) — that IS its edit-details surface; confirm selection is reliable under the same <3px rule and document the per-surface behavior in a comment.
> Add tests: simulated click (no movement) on a timeline bar opens the modal; simulated 10px drag does not; resize drag does not.
> **Acceptance:** a plain click always opens details; a drag never does; behavior identical for pinned bars (click works, drag doesn't).

### T5 — Sidebar readable names (B2)

> Implement finding B2 per audit Theme B. In `renderSidebar()` (~line 1994) Projects mode, replace the one-line truncated row with a two-line layout: line 1 = project **name** (ellipsis only after ~24 chars), line 2 = job code · deadline in `--mono` at 11px, plus the existing color dot and eye toggle. Row height may grow; keep the grip/collapse affordances. Respect the existing draggable width (`#sb-resize`) and persist as today; raise the default `SIDE_W` enough that typical names fit.
> **Acceptance:** with 12 seeded projects, every project is identifiable by name at default width; nothing overflows or clips at 1280px viewport.

### T6 — Off-screen bar edge indicators (B1)

> Implement finding B1 per audit Theme B and Design-Language §7. For each visible row on the main timeline whose bar (or collapsed project span) lies fully outside the current horizontal viewport, render a small indicator hugging that row's viewport edge: chevron + short date ("→ Oct 8" / "Sep 2 ←"), colored with the row's `projColor` at full opacity on a neutral chip, using T1's `labelColor`. Clicking it scrolls the bar into view (centered), smooth-scroll unless `prefers-reduced-motion`. Recompute on scroll/zoom/filter/render; keep it cheap (reuse the render pass's row geometry — no per-frame layout thrash; throttle scroll handling).
> **Acceptance:** with deadlines spread across months, no row in the viewport reads as empty when it has a bar; the indicator's date matches the bar's near edge; click brings the bar into view.

### T7 — Human failure states + sign-in call to action (A1, A3)

> Implement findings A1 and A3 per audit Theme A and Design-Language §1 copy rules. Rewrite every user-facing error/status string (the sign-in/SharePoint failure toast, the missing-list warnings, sync pill states ~line 1604): one plain sentence stating what happened and what to do, with the raw technical detail behind a collapsible "Details" in the toast. When unauthenticated, render a canvas empty-state card with a prominent **"Sign in with Microsoft"** button (wired to the existing `spInit`/`loginPopup` path ~line 1473) — the mono `● offline` pill is status, not the CTA. Ensure `renderEmptyState()` (~line 1982) always renders when no projects are visible, including the offline-error path.
> Do not change auth flow, scopes, or MSAL config — copy and affordances only.
> **Acceptance:** a signed-out first-run shows exactly: what this app is, one button to sign in, and no jargon; every remaining toast reads as instruction, not stack trace.

### T8 — Tooltip & vocabulary pass (A4, A6) — *last; touches everything*

> Implement findings A4 and A6. Sweep every control in the toolbar, sidebar, sort bar, and project page: each gets a `title` tooltip stating its **effect in one sentence** (per Design-Language §1 and §6 hover rules) — including Tint ("Tint the calendar background by month"), Protect dates ("Lock all bars so drags can't change dates"), COLOR Project/Team, ⇕ All, ⟲ Clear filters, the eye toggles, and the sync pill. Then audit every visible string, menu item, and toast for the vocabulary triple: **Phase** (Gantt bar) / **Task** (to-do) / **Event** (dated marker) — fix any "task" that means a phase.
> Pure copy/attribute diff — no behavior changes; keep it grep-reviewable.
> **Acceptance:** hovering any control explains it; the words phase/task/event are used consistently everywhere a user can read.

---

## Part C — Order rationale & session hygiene

T1 before T2/T6 (both consume `labelColor` and the contrast test). T3 before T4 (T4's disambiguation must account for T3's new handles — same pointer code). T5–T7 are independent of each other but touch disjoint regions, so they merge cleanly in sequence. T8 last because it sweeps every surface the earlier tasks may have added controls to.

One brief = one session = one PR, merged before the next starts (single-file app — parallel branches will conflict). If a session stalls or wanders, close it and restart fresh with the same brief; the docs carry all context. After T8, cut the Phase 1 milestone record in `docs/Milestones/` and take the before/after screenshot set for management.
