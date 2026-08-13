# Phase 2 — Claude Code Handoff Pack (The Visual System Pass)

**August 26, 2026 · for `development` branch (post-Phase 1, `index.html` ~5,885 lines) · run briefs in order, one session + one PR each.**
Specs live in `docs/Design-Language.md` (cited by §); finding IDs from `docs/UX-Audit-and-Strategy.md`.

---

## Part A — State of the code after Phase 1 (read before briefing sessions)

Verified against `development` head (`c03206a`):

- `labelColor()` exists (~line 1802) with the contrast test suite — Phase 2 reuses it everywhere.
- `projColor()` is id-hash stable (~1829); `barColor()` (~1844) still routes install→red, entity/project modes.
- **Inspector** is still a 330px right rail (`.dash-insp`, ~722), but the `max-width:1080px` media query already stacks it *below* the chart — E1 promotes and properly designs that arrangement as the default.
- **Status treatments are half-migrated already:** on-hold is opacity .55 + white hatch on the project's own hue (~337) — close to spec; **forecast still steals hue** via `grayscale(1)` filter (~672) plus gray pill overrides (~673–674). Estimating stripe conforms (~197, applied ~2484).
- **Canvas:** Tint ON = vivid `MONTH_HSL` bands (`cellBg` ~1852, applied ~2336 main / ~4338 project page); Tint OFF = flat `#fff`. Neither is the Quiet spec.
- **Toasts** are bottom-center (`#toasts` ~229); `toast()` (~1612) already supports a `details` param from T7.
- Unicode glyph icons remain throughout (⎙ ⚙ ⟲ ⇕ ☰, eye, drag dots).
- ~95 declarations at 8–10px font-size remain — the C5 sweep is real work.
- Test convention established in Phase 1: new feature suites **skip on pre-feature builds** so `npm run test:ref` stays green — follow it for every new suite.

Standing rules for every brief (state once): *read `CLAUDE.md`, `docs/Design-Language.md`, and the referenced finding; smallest reviewable diff; no schema/auth changes; full suite green plus new assertions with the skip-on-ref convention; draft AND saved project-page paths where applicable; before/after screenshots from `/preview/` in the PR; accessibility checklist §9 for touched surfaces.*

**Ship-cut note:** U1–U5 are the ship-critical core (matches the strategy doc's 2-week cut). U6–U8 are polish that can land after a ship if the calendar demands.

---

## Part B — Task briefs (dependency order)

### U1 — Type & layout tokens (C5) — *foundation, do first*

> Implement finding C5 per Design-Language §3 and §4. Extend `:root` (~line 12) with the type scale — `--fs-title:15px, --fs-body:13px, --fs-label:11.5px, --fs-fine:11px, --fs-micro:9px` — plus `--row-h` (Comfortable 44px) and confirm radius tokens. Then sweep the ~95 sub-11px `font-size` declarations: everything informational moves to `--fs-fine` or larger; `--fs-micro` remains ONLY for decorative eyebrows (SORT, COLOR, SCHEDULE section labels, REV chip, `.dash-meta .k`). Toolbar `.t-btn`/`.t-mini`, sidebar codes, bar labels, axis day numbers, meta strips are the hot spots. Convert, don't redesign — spacing and weight stay unless a size bump forces a one-line padding fix.
> Add `--row-h` (and any other JS-mirrored value you tokenize) to the existing CSS/JS drift test.
> **Acceptance:** grep finds no informational text below 11px; a diff reviewer sees token references, not new hex/px literals; all views render without clipping at 1280px.

### U2 — Inspector docks to the bottom (E1) — *the structural anchor*

> Implement directed change E1 per Design-Language §7.5. Restructure `.dash-body` (~720) from row to column: chart full-width on top, `.dash-insp` becomes a bottom dock (~260–300px default height, user-draggable divider like the old `#sb-resize` pattern, height persisted in localStorage). Inside the dock, the `.ins-sec` accordions (~741) become **side-by-side columns** — Setup | Team | Departments | Agenda — all open by default; below ~1200px the panel scrolls horizontally with sticky section headers rather than re-collapsing. Selection behavior unchanged: nothing selected → project sections; bar selected → phase fields with a breadcrumb back. Meta strip stays at page top; footer actions (Shortcuts, Delete/Cancel, Done/Create) move into the dock's bottom edge.
> The existing `max-width:1080px` stacked fallback (~724) is your seed — the work is making that arrangement the only layout and designing the column grid properly. Remove the dead right-rail CSS when done. Test draft (`#/project/new`) and saved pages, selection-driven swaps, and the `render()` re-entry guard (`ARCHITECTURE.md` seams).
> **Acceptance:** no right rail at any width; all four sections visible without accordion-clicking at 1680px; chart gets full window width; divider drag persists; draft page creates correctly.

### U3 — Quiet canvas (C2)

> Implement finding C2 per Design-Language §2.4. Build the Quiet canvas as the new default: workdays `#FCFDFE`; weekends/holidays `#EEF1F5` with existing hatch at 40% of current opacity; month boundary = 1px `--side-line` hairline + label; alternating-month wash capped at `hsl(h, 6%, 97%)`. Month **header** bands cap at `hsl(h,30%,88%)` fill / `hsl(h,35%,30%)` text. The vivid `MONTH_HSL` look moves behind the existing toggle, relabeled **"Vivid months"** (`#t-tint` ~959, `npv-tint` ~3193; keep the localStorage key for continuity). Apply consistently to all three calendar surfaces: main timeline (`cellBg` use ~2336), project-page Gantt axis (~4338), and project-page Calendar mode. `TINT` default flips to Quiet for users with no stored preference.
> **Acceptance:** default view has visibly less background chroma than any bar; weekends/holidays remain distinguishable at every zoom; Vivid months toggle restores today's look exactly; print never emits vivid tints (verify with the print stylesheet ~905).

### U4 — Today & deadline markers (B4) — *after U3, tuned against the new canvas*

> Implement finding B4 per Design-Language §7. Today becomes the strongest line on the canvas: full-height `rgba(47,111,228,.06)` column wash + 2px `--late` line + the TODAY pill, on both the main timeline and project page (`.npv-today` ~433). Deadline markers stop being red dashes that collide with Today and `INSTALL_RED`: per-project pennant (▸) at the header plus a dotted drop-line at 60% opacity in a neutral ink (`.npv-dl` ~434 and the main-timeline flag markers). Distinct at a glance from each other and from install bars.
> **Acceptance:** in a dense seeded view, Today is findable in under a second; no marker reads as "another red bar"; markers hold up on both Quiet and Vivid canvases.

### U5 — Status = pattern + pill, never hue theft (C3) + legend

> Implement finding C3 per Design-Language §2.1. Forecast: delete the `grayscale(1)` filter and gray pill overrides (~672–674); replace with the project's own hue at 40% opacity + 1.5px dashed outline. On-hold: keep the current opacity+hatch approach but verify it desaturates rather than recolors, and remove any remaining gold/gray override in pills, meeting sheet (`mr-pill`), or sidebar. Estimating stripe stays as-is. Complete: muted (60% opacity) + ✓ in the pill — no hue change. Status pills themselves keep their tints (they're labels, not bars) but run through `labelColor()`.
> Then add the **legend popover**: a `?` button on the toolbar's right side opening a single-screen popover documenting status treatments (drawn live from the same CSS, not screenshots), red = installation, PM/D/F chip letters, and marker shapes (Today, deadline). Escape closes it; one overlay at a time per §6.
> Add a test asserting a forecast bar's computed background derives from its project's palette slot (not gray).
> **Acceptance:** every status is identifiable with hue removed (pattern/pill carries it); "Hermès is blue" survives every status change; the legend explains all five encodings on one screen.

### U6 — SVG icon set + toolbar rhythm (C6, C7)

> Implement findings C6 and C7 per Design-Language §5 and §4. Replace all unicode glyph icons — print ⎙, settings ⚙, reset ⟲, expand ⇕, meeting ☰, eye toggles, drag dots, chevrons — with inline SVGs: 16×16 viewBox, 1.5px stroke, `currentColor`, pasted literally (no external files). One drafting-instrument style; never mix glyph and SVG in one surface. Then the toolbar rhythm pass: 4px-multiple gaps/paddings across both toolbar rows, aligned control heights, brand block untouched.
> **Acceptance:** zero unicode icons remain in interactive chrome (grep for each glyph); icons render identically in Chrome and Edge on Windows (the shop's platforms); toolbar controls share one baseline and height.

### U7 — Toast docking (D3)

> Implement finding D3 per Design-Language §6 feedback rules. Move `#toasts` (~229) from bottom-center to bottom-right; cap visible toasts at 3 with a "+N more" counter; identical consecutive messages collapse into one with a count badge; cap width so long errors wrap instead of spanning the canvas; keep the T7 details-collapse and Undo affordances untouched. Toasts must never cover the sort bar or the new bottom inspector dock (U2) — verify z-index and placement against both.
> **Acceptance:** ten rapid errors produce a tidy right-docked stack of 3 + counter; Undo remains clickable throughout; nothing under the toasts becomes unreachable.

### U8 — Print alignment + color-blind verification + phase close (D2)

> Close Phase 2. (1) Print: the print stylesheet and both overlays (`#print-overlay` ~1056, `#meet-overlay` ~1078) inherit the Quiet canvas and U1 tokens; Meeting Sheet header block (TWOSEVEN — title · REV · printed date · count) stays the template for any report. (2) Color-blind check: add a small script (or extend the contrast suite) that recomputes the U5 status treatments and the 12-slot palette under a deuteranopia simulation matrix and asserts statuses remain distinguishable by pattern/opacity alone — codifying D2 as a regression guard. (3) Produce the phase evidence: before/after screenshot set (dense timeline, project page, meeting sheet, print preview) and the `docs/Milestones/` record naming every finding shipped (C2, C3, C5, C6, C7, B4, D2, D3, E1).
> **Acceptance:** printed output matches on-screen tokens; the CB assertion is in `npm test`; the milestone record reads as the report you hand management.

---

## Part C — Order rationale & phase-exit checklist

U1 first because every later diff writes token references instead of literals — reversing that order doubles the sweep. U2 before any styling so U3–U6 style the final layout, not the rail you're about to delete. U3 before U4/U5 because markers and status treatments are tuned against the canvas they'll live on. U6/U7 are independent polish, late so they don't conflict with the big diffs. U8 closes the phase with verification and evidence.

Same session hygiene as Phase 1: one brief, one fresh session, one merged PR before the next; restart stalled sessions rather than steering them; single file means no parallel code branches.

**Exit checklist before calling Phase 2 done:** hallway test round 2 (the five tasks from the strategy doc §6: find a project, read its status, reschedule a phase, find who's out next week, print the meeting sheet — count assists, compare to round 1) · dense-timeline screenshot into a leadership deck without apology · all suites green on both `index.html` and `test:ref` · milestone record committed. Then decide Phase 3 scope with fresh eyes — B3 zoom and B5 compact density first if PMs still report navigation pain, B6 saved views if they don't.
