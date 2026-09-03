# Phase 2 visual system pass (U1–U8) — 2026-08-14

**What this is.** The complete second phase of the UX plan in
`docs/Archive/UX-Audit-and-Strategy.md`, delivered as eight task briefs
(`docs/Archive/Phase-2-Task-Briefs.md`, U1–U8) over 2026-08-13/14, REV 50→52 on
`development`. One-file records for each task live in [`Phase 2/`]().
Phase 1 fixed what things *do*; Phase 2 fixed what they *say at a glance*.

**What changed, in one pass each:**

- **U1 — Type & layout tokens (C5).** One shared type scale; nothing
  informational renders under 11px. Every later diff writes token references
  instead of literals.
- **U2 — Inspector docks to the bottom (E1).** The project inspector left its
  squeezed right rail; the schedule gets the full width.
- **U3 — Quiet canvas (C2).** Month-tint backgrounds no longer shout over the
  data; quiet is the default, "Vivid months" is the opt-in.
- **U4 — Today & deadline markers (B4).** Markers re-tuned against the new
  quiet canvas so they read instead of vanish.
- **U5 — Status = pattern + pill (C3).** Status never steals the project's
  hue: pattern + pill word carry it, with a `?` legend documenting every
  encoding.
- **U6 — SVG icon set + toolbar rhythm (C6, C7).** One icon language, every
  toolbar control on a shared two-tier rhythm; dark chrome kept.
- **U7 — Toast docking (D3).** Toasts dock bottom-right, cap at 3, and
  collapse repeats instead of stacking over the sort bar.
- **U8 — Print alignment + color-blind verification (D2) + phase close.**
  The meeting sheet prints from the same tokens as the screen (and a
  wrong-status-fill bug died on the way); a new deuteranopia-simulation suite
  (`tests/test-cb.js`, 37 assertions) makes hue-independence a permanent
  regression guard, not a hope.

**Why it mattered.** The audit's C-series findings all reduced to one problem:
color and type were carrying more meaning than a glance could decode. The app
now has one type scale, one quiet canvas, one honest color system, one icon
language — and prints that way too.

**Tests.** All 15 suites pass on `index.html` and the frozen REV50 reference;
the color-blind suite runs in `npm test`, so D2 stays enforced.

**Follow-ups.** Per-task ceilings are in each record in `Phase 2/`. Notables:
hallway test round 2 before promoting `development` to `main`; In-Design vs
In-Fabrication bars stay same-strength on purpose (pill word separates them);
Phase 3 scope is B3/B5 density-and-zoom if PMs still report navigation pain,
B6 saved views if they don't.
