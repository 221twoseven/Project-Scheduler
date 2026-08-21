# Project Scheduler (Shop Timeline) — UX Audit & Strategy

**Prepared:** August 12, 2026 · **Build reviewed:** REV52 (`development` branch = `/preview/`)
**Focus areas (per the owner):** first-run & learnability · timeline density & navigation · color & styles
**Primary audiences:** PMs / schedulers · management & leadership

---

## 1. Executive summary

The app is in better shape than most internal tools of its kind. The bones are strong: backward scheduling from the install date is a genuinely good mental model, undo is visible on every mutating action, autosave works, the Meeting Sheet is close to leadership-ready today, and the codebase already has accessibility fundamentals (`:focus-visible`, `prefers-reduced-motion`) that most internal tools skip.

The UX problems cluster in three places, and they match your instincts:

1. **The app doesn't teach itself.** Its most powerful interactions — right-click menus, keyboard shortcuts, drag-to-reschedule — are invisible. A new PM or a manager glancing at it gets no guidance, and the error/status language is developer-speak.
2. **The timeline doesn't scale visually.** With a real project load, most rows in the viewport are empty space because bars live off-screen; the sidebar truncates project names into uselessness; and there is no way to zoom, jump, or get an overview between "Days" and "Weeks."
3. **Color is doing too many jobs at once, and none reliably.** Month tints, project identity, status coding, and department coding all compete in the same channel. Worst: **project colors are index-based, so a project's color changes when the list changes** — color cannot be trusted as identity, which is the one job it must do.

The strategy: fix trust and legibility first (cheap, high-visibility, low-risk), then do one deliberate visual-system pass driven by the companion Design Language doc, then invest in navigation for scale. Everything proposed here respects the hard constraints: single-file vanilla JS, no build step, no SharePoint schema changes without approval, non-programmer contributors, 276-assertion test suite stays green.

---

## 2. How this audit was done

- Cloned the repo; confirmed `/preview/` = `development` branch via the Pages deploy workflow.
- Rendered the actual build headlessly and exercised it with a **12-project seeded dataset** (the built-in `seed()` generator, extended) to evaluate realistic density — plus the true first-run/offline state.
- Captured and reviewed: timeline Days/Weeks, Project/Team color modes, Departments lens, status filter, Settings/Print menus, Meeting Sheet, New Project draft page, Staff overlay, project page Gantt + Calendar, 1280px viewport, and offline error states.
- Read `CLAUDE.md`, `docs/ARCHITECTURE.md`, `docs/TODO.md`, `docs/Handoff-Notes.md`, and the relevant source (design tokens, palettes, render paths, keyboard handling).

Not covered: live SharePoint sync behavior under multi-user editing, real print output on 11×17 paper, and actual user observation. All three are called out in the validation plan (§6).

---

## 3. What's already good (protect these)

- **Backward scheduling** ("set the install date, the schedule builds itself") is the app's core insight. Every UX change should reinforce it, never bury it.
- **Visible undo on every mutation** and optimistic writes with a sync pill. This is the right trust model.
- **The Meeting Sheet** is the best artifact in the app: one row per project, grouped by PM, deadline-sorted, a Notes column for handwriting. Leadership-facing polish should start from here, not from scratch.
- **Escape unwinds one layer at a time**; keyboard shortcuts on the project page are mirrored in menus ("nothing lives only on the keyboard") — an excellent principle worth extending to the main timeline.
- **Graceful degradation** when optional SharePoint lists are missing.
- **Red reserved for installations** — one color rule already enforced in code (`INSTALL_RED`). The design language doc builds on exactly this kind of rule.
- `:focus-visible` outlines and `prefers-reduced-motion` support already in the stylesheet.

---

## 4. Findings

Severity scale: **P1** = actively costs trust or blocks understanding · **P2** = real friction, workaround exists · **P3** = polish.

### Theme A — First-run & learnability

**A1 (P1) — Failure states speak developer, not user.**
Offline/misconfigured sign-in shows: *"Sign-in or SharePoint load failed: endpoints_resolution_error … ClientConfigurationError: untrusted_authority … knownAuthorities config parameter."* And: *"ShopTimeline_Staff list not found — staff is local to this browser until it's created."* A shop user cannot act on any of that. Each failure needs a plain-language sentence ("Couldn't reach SharePoint — check your connection, then click here to retry"), with the technical detail collapsed behind a "details" affordance for whoever maintains the app.

**A2 (P1) — The invisible interaction model.**
Right-click is documented (in `ARCHITECTURE.md`!) as "the primary verb," and the REV49 keyboard layer is excellent — but nothing in the UI advertises either. The Shortcuts sheet exists only on the project page. New users see a static chart and have no path to discover drag, right-click menus, or keys. Minimum fix: a subtle, dismissible hint bar on first visit ("Right-click anywhere on the chart · drag bars to reschedule · press ? for shortcuts"), a `?` shortcut + Shortcuts button on the **main timeline** too, and hover affordances (a faint "⋯" or context-menu cursor on bars).

**A3 (P2) — Signed-out/offline state has no call to action.**
The only signal is a small `● offline` pill in the far corner. There's no prominent "Sign in with Microsoft" action on the canvas when unauthenticated. First-run success = sign in; make that path unmissable (an empty-state card with a Sign In button when `!signedIn`, rather than a mono-font pill).

**A4 (P2) — Jargon and unlabeled glyphs in the chrome.**
"Tint," "Protect dates," "COLOR: Project | Team," "⇕ All," "⟲," "⎙," eye icons, drag-dots. Some have `title` tooltips; several don't explain *consequences* (what does Protect dates protect, from whom?). Every control needs a tooltip that states its effect in a sentence, and the odd text-glyph icons should be replaced with consistent inline SVGs (they render differently across Windows/Mac and read as unfinished).

**A5 (P2) — The empty state exists but undersells the product.**
There is a "Nothing scheduled yet" card (good copy — it teaches the backward-scheduling model and the `N` key). But in the offline-error path it can fail to appear, leaving a pure blank grid under two error toasts — the worst possible first impression. Ensure the empty state always renders when there are no visible projects, and consider a one-click **"Add a sample project"** that runs the already-existing `seed()` through the normal create path (localStorage-only, clearly marked, deletable) so a new user can safely poke at a populated timeline.

**A6 (P3) — Vocabulary trap leaks into the UI.**
"Tasks" (Gantt phases) vs "Tasks" (to-dos) confuses even the docs. The UI mostly says "phases" and "tasks" correctly now, but audit every label, menu, and toast for one consistent triple: **Phase / Task / Event**.

### Theme B — Timeline density & navigation

**B1 (P1) — Rows with off-screen bars read as empty.**
With deadlines spread over months (the normal case), the default viewport shows several project rows as pure background — the bar lives to the right. Nothing says so. A PM scanning vertically can't tell "not yet started" from "nothing there." Fix: edge indicators per row (a small chevron/label at the row's edge: "→ starts Oct 8", clickable to scroll the bar into view). This is the single highest-leverage density fix.

**B2 (P1) — The sidebar wastes its one job.**
In Projects mode at default width, rows show a color dot, one letter of the name, the job code, and a truncated date ("H HER-2510 · Aug …"). The project *name* — the thing humans scan by — is the first casualty. Options: two-line rows (name on top, code · date below, PM initials chip), name-first truncation, and a remembered wider default (the width is already draggable and persisted; the default is just too narrow for real names).

**B3 (P2) — Two zoom levels, no in-between, no overview.**
Days is too tight for a quarter; Weeks is workable but bars compress. There's no zoom control, no minimap, no "fit visible projects" action. Recommend: a zoom slider or 3–4 steps (Day / 2-Day / Week / Month) driving `DAY_W` continuously, plus **jump-to-date** (click the month header → date picker; or `G` for "go to date"). A minimap is a Phase-3 nice-to-have; edge indicators (B1) + zoom + Today cover 90% of the need.

**B4 (P2) — Today and deadline markers lose the fight against the background.**
The red Today line is 1–2px against saturated month tints; per-project deadline flags (dashed red) compete with the same red family as `INSTALL_RED` bars. Give Today a stronger treatment (wider line + shaded "today" column + always-visible pill) and restyle deadline markers to a distinct shape/weight rather than another red dash.

**B5 (P2) — Vertical scale has no compact mode.**
12 projects ≈ one screen. A busy season (20–30) means scrolling past tall rows. A density toggle (Comfortable / Compact row height) is cheap since row height is already a constant, and helps the leadership "whole shop on one screen" use case — which is exactly what the print view already solves with collapse controls; bring that thinking on-screen.

**B6 (P3) — Group/collapse and saved views.**
Sort exists (Due date / Client / PM / Status); grouping does not (except the Departments lens). "Group by PM" with collapsible headers on the main timeline would mirror the Meeting Sheet's mental model. Persist the full filter+sort+zoom state per user (localStorage — no schema change) as named views: "My projects," "This month," "Install crunch."

### Theme C — Color & styles

**C1 (P1) — Project colors are not stable identities.**
`projColor()` assigns from a 7-color cycle by the project's *index in the array*. Add, delete, or re-sort projects and colors silently reshuffle across the whole timeline. For a tool whose users learn "Hermès is the blue one," this quietly breaks the most basic visual contract. Fix: hash the project **id** to a palette slot (stable forever, no storage needed, no schema change), and expand the palette to ~12 hues with a collision-avoidance pass over currently-visible projects.

**C2 (P1) — The month-tint canvas competes with the data.**
Every month gets its own saturated hue band (salmon → pink → olive → …), darkened per alternating week, *behind* the bars. The background frequently has more chroma than the foreground; hatched weekend/holiday overlays sit on top of that. This is the #1 reason screenshots read "busy" to leadership. The Tint toggle exists, but the loud version is the default and the quiet version is nearly white. Recommendation (detailed in the Design Language doc): a neutral canvas by default — near-white workdays, cool gray weekends, a *hairline* month boundary plus month label, with at most a whisper of alternating-month tint (~3–4% chroma). Let the bars own all the color. Keep the current look behind the existing toggle if the shop is attached to it.

**C3 (P2) — Color encodes four things at once with no legend.**
On one screen, color means: project identity (bars), status (stripe patterns + pill + gray/gold overrides for forecast/on-hold), department (project-page bars and Team mode), and calendar time (month tints). Some statuses *override* project identity (forecast = gray, on-hold = gold), so "Hermès is blue" fails exactly when status matters most. Rules to adopt: **hue = identity** (project, or department in those modes); **status = pill + pattern only, never hue theft** (the striped-estimating treatment is good precisely because the hue stays); on-hold/forecast become desaturation/opacity + pattern of the *project's own* color. Add a small always-available legend (a "?" popover listing status treatments and the red-means-install rule).

**C4 (P2) — Text contrast on bars is uneven.**
White text sits on light golds/teals; dark text appears on some bars; tiny mono labels sit on saturated pills. Adopt a computed label color (relative-luminance threshold — a 6-line function) so every bar label passes ~4.5:1, and audit the status pill palette once, in code.

**C5 (P2) — Typographic scale bottoms out below legibility.**
Base is 13px, but working text runs 8.5–11.5px (toolbar labels 8.5–9.5px, mono micro-labels at 9px, sidebar codes ~10px). Shop-floor screens and leadership eyes both deserve better. Define a 4-step scale (see Design Language doc) with a floor of 11px for anything a user must read, and reserve the micro sizes for pure ornament.

**C6 (P3) — Icon inconsistency.**
Unicode glyphs (⎙ ⚙ ⟲ ⇕ ●) render with different metrics and weights per platform and read as placeholders. One pass to inline ~10 small SVG icons (no build step needed — literal `<svg>` in the HTML) makes the chrome look intentional.

**C7 (P3) — The dark toolbar is a strong brand move — commit to it.**
The "drawing title block" concept (TWOSEVEN · SHOP TIMELINE, mono REV chip) is distinctive and fits a fabrication shop. Keep it; tighten spacing, align the two toolbar rows to a consistent rhythm, and let the Design Language doc's chrome palette formalize it.

### Theme E — Directed changes (owner, Aug 12, 2026)

These are decisions, not findings — requirements to build into the plan.

**E1 — Project page inspector moves from right sidebar to a bottom panel.**
The Setup / Team / Departments / Agenda inspector currently lives in a ~330px right rail that is too narrow for its content (cramped fields, collapsed sections, orphaned whitespace below) while stealing horizontal room from the phase chart. It moves to a **horizontal block across the bottom of the window, underneath the project timeline** — full-width form real estate, sections side by side instead of stacked, and the chart gets the full window width. This also lands the "drawing sheet" metaphor exactly: the title block belongs at the bottom of a drawing. Design details in `Design-Language.md` §7.5. *(Phase 2 — it's the anchor of the project-page layout pass.)*

**E2 — Left-click on a timeline bar opens the edit-details modal.**
Click becomes the primary read/edit path: single left-click on any bar opens its details for editing. This resolves the backlog's open "retire the phase modal?" question in the opposite direction — the modal is kept and *promoted* to the default interaction, satisfying D1's demand for a visible non-drag path. Right-click menus and drag remain as the power-user layer. Click-vs-drag must disambiguate cleanly (open on mouse-up with no movement; a drag past ~3px threshold never opens the modal). *(Phase 1.)*

**E3 — Bars resize from both edges.**
Click-drag resize must work on **both the start and end of a bar**, with visible grab handles on hover and generous hit zones at each edge. Left-edge resize adjusts the start date, right-edge the end date, both snapping to workdays and respecting Protect dates. *(Phase 1.)*

### Cross-cutting — accessibility & trust

**D1 (P2) — Right-click/drag-only paths need visible equivalents everywhere.** The project page honors "everything on the keyboard is also a menu item or button"; the main timeline doesn't fully. Every drag (move bar, resize, OOO ranges) and every context-menu action needs a clickable path (bar → inspector or popover with date fields — partially exists via the phase modal, which the backlog is considering retiring; decide with this requirement in mind).

**D2 (P2) — Color-blind safety.** Status currently depends partly on hue (gold vs gray vs green pills). The pattern-plus-pill direction in C3 solves most of it; verify the final palette with a deuteranopia simulation (part of the validation plan).

**D3 (P3) — Toast lifetime & stacking.** Error toasts stack over the canvas bottom-center and can obscure the sort bar; long messages persist. Cap width, auto-collapse repeats, and dock them bottom-right.

---

## 5. Strategy — the plan of attack

Principles for all phases: small reviewable PRs on `development` (visible at `/preview/` immediately — use that as your stakeholder demo channel); no SharePoint schema changes (per-user prefs live in localStorage); tests stay green and new UI behavior gets asserted on both draft and saved paths; every phase ends with a `docs/Milestones/` record; non-programmers can read every diff's intent.

### Phase 1 — Trust & legibility (quick wins, ~1–2 weeks of Claude Code sessions)

Goal: nothing on screen confuses or misleads. All P1s that don't require design decisions.

1. **Stable project colors** (C1) — id-hash palette. *Small diff, huge payoff.*
2. **Human error/status language** (A1, A3) — rewrite all user-facing failure copy; add signed-out empty-state card with Sign In button; technical details collapsible.
3. **Off-screen bar indicators** (B1) — row-edge chevrons with date, click to scroll.
4. **Sidebar readable names** (B2) — two-line rows, name-first.
5. **Tooltip & label pass** (A4, A6) — every control states its effect; consistent Phase/Task/Event vocabulary.
6. **Bar label contrast function** (C4).
7. **Left-click opens edit-details modal** (E2) — with clean click/drag disambiguation.
8. **Two-sided bar resize** (E3) — edge handles, hover affordance, workday snapping.

Acceptance: a new user, signed out, knows what to do; a PM can identify every project from the sidebar, knows where every bar is, and can open or resize anything with the mouse alone; colors never reshuffle.

### Phase 2 — The visual system pass (one deliberate redesign PR series, ~2–3 weeks)

Goal: leadership-ready look. Driven by the **Design Language doc** (companion file) so decisions are made once, on paper, before code.

1. **Neutral canvas** (C2) — quiet workday/weekend/month treatment; loud tints demoted to the existing toggle.
2. **Color role separation** (C3) — status = pill + pattern of the project's own hue; legend popover.
3. **Type scale + spacing rhythm** (C5) — tokenized in `:root`, applied mechanically.
4. **Today/deadline marker redesign** (B4).
5. **SVG icon set** (C6) and toolbar tightening (C7).
6. **Project-page layout pass: inspector docks to the bottom** (E1) — the structural anchor of this phase; do it first so the rest of the visual pass styles the final layout, not the old one.
7. **Print/Meeting Sheet alignment** — same tokens, so the printout and the screen agree.

Acceptance: a screenshot of the dense timeline can go in a client-facing deck without apology; deuteranopia simulation passes; all text ≥ 11px or decorative.

### Phase 2.5 — feature interlude (happened 2026-08-19 → 21, REV53–64)

Not part of this plan's briefs: between Phase 2's close and Phase 3's start, a run of
higher-priority feature work and field-note fixes shipped (calendar parity, standalone
events, the subtask/crew model, the checkpoint editor). Records:
`docs/Milestones/Phase 2.5/`, index
`docs/Milestones/2026-08-21-phase-2-5-feature-interlude.md`; actionable state stays in
`docs/TODO.md`.

### Phase 3 — Navigation at scale (~2 weeks, after real feedback on 1–2)

1. **Zoom steps + jump-to-date** (B3).
2. **Compact density toggle** (B5).
3. **Group-by-PM with collapse + named saved views** (B6, localStorage).
4. Revisit **Dash view** from the existing backlog — it's the per-person answer to density and pairs naturally with saved views. (Needs the ⚠ Staff email/role columns — schedule the approval conversation early.)

### Phase 4 — Learnability layer (~1 week, deliberately last)

First-run hint bar + `?` shortcuts sheet on the timeline (A2); sample-project onboarding (A5); optional 60-second "how scheduling works" explainer linked from the empty state. Last because Phases 1–3 remove most of what currently *needs* explaining.

### The 2-week ship cut

The phase ranges above are paced for review-gated, part-time work. If the commitment is **a shippable app in 2 calendar weeks**, ship this cut: **Week 1 = all of Phase 1** (including E2/E3). **Week 2 = Phase 2's visible core** — E1 inspector relocation, quiet canvas (C2), status treatment (C3), type tokens (C5), marker redesign (B4) — and a hallway test on Thursday. Ship Friday from `main`. Phases 3–4 become post-ship iterations on `/preview/`; nothing in them blocks "shippable." The long pole in each week is human review and decision latency, not build time — see the working-agreement notes accompanying this doc.

### Sequencing rationale

Fix what erodes trust before what teaches (a tour of a confusing UI teaches confusion); make the visual system decision once with a doc, not per-PR; defer nav investments until stable colors and edge indicators show how much pain remains; keep every ⚠ schema item (Dash view columns) out of the critical path.

---

## 6. Measurement & validation

No analytics backend exists and none should be added casually (privacy + shared infra). Use:

- **Three-user hallway tests** (one PM, one fabricator, one manager) before and after Phase 2: five tasks — find a project, tell me its status, reschedule a phase, find who's out next week, print the meeting sheet. Count assists needed. This is a half-day per round and beats any dashboard.
- **Screenshot diffs** posted with each PR (the repo culture already supports this via `/preview/`).
- **Contrast + color-blind checks** as a repeatable script in `tests/` (jsdom can compute the luminance function against the palette constants — cheap regression guard).
- **The Meeting Sheet test**: hand leadership the printout monthly and ask what they crossed out or wrote in. The Notes column is your feedback form.

---

## 7. Finding → fix index

| ID | Severity | Finding | Fix | Phase |
|----|----------|---------|-----|-------|
| E2 | Directed | Click should edit | Left-click bar → edit-details modal | 1 |
| E3 | Directed | One-sided resize | Grab handles on both bar edges | 1 |
| E1 | Directed | Inspector rail too narrow | Dock inspector as bottom panel | 2 |
| C1 | P1 | Index-based colors reshuffle | id-hash palette slots | 1 |
| A1 | P1 | Developer-speak errors | Plain-language + details | 1 |
| B1 | P1 | Off-screen bars = fake-empty rows | Row-edge indicators | 1 |
| A2 | P1 | Invisible right-click/keys | Hint bar, `?` sheet on timeline, hover affordance | 4 |
| B2 | P1→P2 | Sidebar truncates names | Two-line name-first rows | 1 |
| C2 | P1→P2 | Loud month-tint canvas | Neutral canvas default | 2 |
| C3 | P2 | Color role collision | Status = pill+pattern, legend | 2 |
| A3 | P2 | No sign-in CTA | Signed-out empty-state card | 1 |
| B3 | P2 | No zoom/jump | Zoom steps + go-to-date | 3 |
| B4 | P2 | Weak Today/deadline marks | Marker redesign | 2 |
| C4 | P2 | Bar text contrast | Luminance-based label color | 1 |
| C5 | P2 | Sub-11px working text | Token type scale | 2 |
| B5 | P2 | No compact density | Row-height toggle | 3 |
| A4 | P2 | Jargon/glyph chrome | Tooltip + label pass | 1 |
| D1 | P2 | Drag/right-click-only paths | Visible equivalents | 2–3 |
| D2 | P2 | Hue-dependent status | Pattern redundancy + CB check | 2 |
| A5 | P2 | Empty state gaps | Always-render + sample project | 4 |
| B6 | P3 | No grouping/saved views | Group-by-PM, named views | 3 |
| C6 | P3 | Glyph icons | Inline SVG set | 2 |
| A6 | P3 | Task/phase vocabulary | Consistency audit | 1 |
| D3 | P3 | Toast stacking | Dock + collapse repeats | 2 |
| C7 | P3 | Toolbar polish | Chrome rhythm pass | 2 |

---

*Companion document: `Design-Language.md` — the token-level design system that Phase 2 implements.*
