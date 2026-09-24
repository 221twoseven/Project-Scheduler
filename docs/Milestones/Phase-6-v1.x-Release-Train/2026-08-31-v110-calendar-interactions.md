# 2026-08-31 — v1.1.0: calendar interactions (objectives 7 and 9)

The first minor release of the v2.0.0 track (`docs/TODO.md` §3): two owner
objectives that make the project calendar feel direct. App version bumped
**v1.0.4 → v1.1.0** (minor: a feature drop).

## What changed

- **(Obj 7) Double-click on blank calendar space creates a new phase.** The
  double-click opens the "Add a phase" department picker right at the pointer —
  a phase needs a department, so the picker is the one unavoidable question; it's
  the same list the right-click menu offers, one step shorter — seeded with the
  day that was double-clicked. Picking a department files the phase starting that
  day, selects it, and opens its **edit popover at the pointer with the name field
  focused** (an unnamed bar is the thing people forget). Works on the saved page
  and the New Project draft alike (the draft path ticks the department checklist
  and the scheduler emits the bar). Calendar only — the Gantt's blank double-click
  stays a reserved verb per Design-Language §6.
- **(Obj 9) Duration drag-to-edit follows the mouse.** Grabbing a phase or subtask
  band's edge handle now stretches the band live, px-for-px with the pointer
  (clamped to its week row), while the REV83 day tint and the tooltip keep showing
  the *snapped* span; on release the existing full-day snap files the result
  exactly as before. The Gantt already behaved this way — the calendar was the odd
  one out.

## Evidence

`screenshots/v110-dblclick-picker.png` — the department picker open at the
double-clicked day on the calendar (also showing the v1.0.4 Collapse all button
and the v1.0.2 mellowed bar).

## Tests

`tests/test-v102.js` grew to 48 assertions: the department picker on double-click,
the created phase's date/selection/popover on both pages, and the live width during
an edge drag plus its cleanup on release. Full run: 52/52 suites against
`index.html`; the calendar-adjacent suites (test53/71/72/84, e2-click, e3-resize)
all green.

## Known ceilings / follow-ups (ledgered in TODO §7)

- The live follow stretches only the **grabbed segment** — a multi-week phase's
  other week rows redraw on release, not live.
- The pixel follow can briefly overshoot the nesting/pin clamp mid-drag; the tint,
  tooltip and the release snap always show and file the clamped truth.
- Drag-to-**move** keeps its tooltip-only feedback (the standing REV83 ledger
  entry; its gate is unchanged).
- The double-click create needs a spare department — when every department is
  already on the job, the picker says so and creates nothing (the same message the
  right-click path shows).
- Correction to an earlier TODO note: this work did **not** touch the calendar
  marker drag/click/delete block, so the audit-pass dedup gate on it did not fire.
