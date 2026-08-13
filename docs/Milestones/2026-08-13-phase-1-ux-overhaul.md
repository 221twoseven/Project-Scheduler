# Phase 1 UX overhaul (T1–T8) — 2026-08-13

**What this is.** The complete first phase of the UX plan in
`docs/UX-Audit-and-Strategy.md`, delivered as eight task briefs
(`docs/Phase-1-Task-Briefs.md`, T1–T8) over 2026-08-12/13, REV 50→52 on
`development`. One-file records for each task live in [`Phase 1/`](Phase%201/).

**What changed, in one pass each:**

- **T1 — Label contrast (C4).** Text on colored bars and pills now always meets WCAG
  4.5:1 via a new `labelColor()` picker; four palette colors nudged; contrast test in CI.
- **T2 — Stable project colors (C1).** A project keeps its color for life (hash of its
  id, not list position); palette grew 7→12 slots; visible-collision shift rule.
- **T3 — Both-edge resize (E3).** Project-page bars resize from either end with workday
  snap, cursor date tooltip, pin/Protect-dates blocking, and undo — matching the main
  timeline.
- **T4 — Click hierarchy (E2).** A clean click (<3px travel) opens details; any drag
  never does — on both the main timeline and the project page, including pinned bars
  and resize handles.
- **T5 — Sidebar readable names (B2).** Project rows went two-line so the name is the
  first thing you see, not the first thing cut off; default width 232→300px.
- **T6 — Off-screen bar indicators (B1).** Rows whose bars are outside the visible dates
  show an edge chip with a chevron and date; clicking scrolls the bar into view.
- **T7 — Human error language + sign-in card (A1, A3).** Errors read as plain sentences
  with technical detail behind "Details"; signed-out users get a real sign-in card
  instead of a blank grid; the canvas never goes silently blank.
- **T8 — Tooltip & vocabulary pass (A4, A6).** Every control has a plain-sentence
  tooltip, and the Phase/Task/Event vocabulary is used consistently everywhere.

**Why it mattered.** Phase 1 targeted the audit's highest-priority findings: the app is
now legible (contrast, names, colors that don't shuffle), predictable (clicks and drags
mean what they look like, resize works from both ends), and humane (plain-language
errors, an obvious way in, tooltips that explain consequences).

**Tests.** Each task shipped its own regression suite; the full run grew from 276 legacy
assertions to 400+ across 11 suites, all passing against `index.html` and the frozen
REV50 reference.

**Follow-ups.** Per-task ceilings are listed in each record in `Phase 1/`. Notables:
tooltips are native `title` attributes (invisible on touch — icon glyph replacement is
tracked as C6); 13+ simultaneous visible projects must repeat palette slots; error
toasts still auto-dismiss after ~5s.
