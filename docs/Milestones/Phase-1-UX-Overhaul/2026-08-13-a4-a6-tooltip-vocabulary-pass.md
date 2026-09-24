# Tooltip & vocabulary pass (A4, A6) — 2026-08-13

**What changed.** Every control in the toolbar, sidebar, sort bar, and project page now
has a hover tooltip that states its effect in one plain sentence (Design-Language §1 and
§6 hover rules). Before, jargon controls like "Tint," "Protect dates," "⇕ All," and the
COLOR toggle either had no tooltip or one that named the feature without explaining the
consequence. Now hovering anything answers "what happens if I click this" — e.g. Tint:
"Tint the calendar background by month"; Protect dates: "Lock all bars so drags can't
change dates"; sync pill: "Shows whether your changes are saved to SharePoint — click to
retry after an error."

**Vocabulary fix.** The app's word triple is **Phase** (a Gantt bar), **Task** (a to-do),
**Event** (a dated marker). The one place that still broke it was the bar editor on the
main timeline, which called the bar it edits a "Task": *Edit Task / New Task / Delete
Task / "Delete this task?"* all now say **Phase**. Every other visible string, menu item,
and toast was audited and already used the triple correctly.

**Deliberately kept.** "Subtask" (a named extra bar under a department) stays as-is: it's
the established term across the docs, Handoff-Notes, six test assertions, and the saved
default label `Subtask N` on real SharePoint rows — renaming it would be a data change,
not copy. If we ever want "Sub-phase," that's its own pass.

**Scope.** Pure copy/attribute diff in `index.html` — only `title="…"` insertions and
four Task→Phase string swaps. No behavior, layout, or schema changes. Grep-reviewable:
`git diff` shows nothing but strings.

**Rev/refs.** UX audit findings A4 (P2) and A6 (P3), Phase-2 item 5. App REV 52,
`development` branch. All six legacy suites pass (276 assertions).

**Ceiling.** Tooltips are native `title` attributes — no styling, no 400ms-delay control,
and invisible on touch. A4's other half (replacing the odd text glyphs ⟲ ⎙ ⇕ with
consistent inline SVGs) is tracked separately as C6.
