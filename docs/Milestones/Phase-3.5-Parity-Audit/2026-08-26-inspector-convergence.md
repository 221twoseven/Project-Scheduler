# The inspector convergence (REV82) — 2026-08-26

**What this is.** The big slice of the Phase 3.5 parity work: the audit rows the owner
accepted that all hung on one root cause — **selection was half-implemented on the New
Project draft** (audit I1). This REV makes draft selection real and retires the draft's
floating popover; the saved page's bottom **"This phase" inspector now serves both
pages**, and every verb that keyed off selection starts working on drafts. Audit:
`docs/Archive/Phase-3.5-Parity-Audit.md` (rows D1–D4, L1/L3/L4, I1–I7, I9–I12). PR:
[#26](https://github.com/221twoseven/Project-Scheduler/pull/26).

**The mechanism (why this was the hard one).** A draft regenerates its schedule on
every keystroke, and every regenerated bar gets a fresh id — so "the selected bar"
had nothing stable to point at. Selection now keys on what *does* survive the
rebuild: the **department** for an unsplit primary bar, the **subtask line id** for a
split bar (it already rides inside the bar id). Draft edits commit to the draft's
durable stores — subtask lines and manual placements — exactly the way the retired
popover did, so Save still files exactly what the preview shows.

**What a PM gets on the New Project page now:**

- **Click a bar → the bottom inspector opens on it** (same as a saved project); the
  floating popover is gone. The breadcrumb shows the selected phase (D3), and the
  agenda scopes to "On this phase" (D4).
- **The full field set**: Name, Crew (checkboxes), Start/End/Days, Notes — all
  committing to the draft. Renaming or re-crewing a hand-placed bar keeps its
  placement (the placement key moves with it — re-crewing used to snap the bar back).
  Notes now live on the subtask line and survive into the created project.
- **Every selection verb**: `Del` deletes, `R` renames, `Shift+←/→` nudges a day,
  `S`/`E`/`T` target the selected bar's department and date, **Duplicate** copies the
  bar with its dates and crew.
- **Link works**: dragging a parent bar carries its subtasks on the draft, Gantt and
  calendar both.
- **⌘Z works**: drafts keep their own undo stack (mutations never touch SharePoint
  state, so they bring their own reversers — the same ones the undo toasts run).
- The Department dropdown renders but is **disabled with an explanation** on drafts
  ("departments are chosen in the checklist until the project is created") — moving a
  phase between departments is a saved-page concept (ledgered in TODO §7).

**Also in this REV:**

- **I12 — saved-page row reorder persists.** Dragging rows into an order used to last
  until reload; the order now writes through to the project's `activeDepartments`
  (order only — membership untouched; the colleague app reads it as a set) and reseeds
  on the next visit, in any browser.
- **Notes actually save.** The saved page's Notes field silently never persisted —
  `commitPhase` had no branch for the field and dropped it. Found converging the
  binding layer; fixed with a test.
- **Two regressions caught and fixed before the PR:** (1) a pre-existing Link
  fast-path in the drag handler sat before the draft/saved fork — un-gating Link for
  drafts routed draft link-drags into the SharePoint commit path (caught by the new
  suite, re-gated to saved). (2) Re-selecting after a rebuild read the live selection
  global, which the repaint nulls when the selected bar is a collapsed child — the
  old code re-selected by a captured id; every re-select now captures the key first
  (caught by test49's nudge-a-hidden-child case).
- **Dead code removed** (audit D9 + found-in-passing): four functions that painted
  panels removed from the page shell long ago (`renderDraftLines`, `renderSideList`,
  `ppSideRow`, `ppRefreshMetrics`) and the popover machinery.

**Tests.** Four popover-era suites (test50/53/61/62) were updated to the new
contract behind a build guard, so they still assert the popover on the frozen REV50
reference — the drift is deliberate and owner-decided (audit D1/D2/L3), not silent.
New suite `tests/test82.js` (23 assertions across both pages: selection
via real mouse events, popover absence, rebuild survival, placement-preserving
rename, draft Duplicate/Del/nudge/⌘Z, Link carrying a subtask through a simulated
drag, the notes fix, order seeding from `activeDepartments`, the honest disabled
Department select). Full `npm test` + the frozen-reference run green before the PR.

**Known ceilings / follow-ups** (ledgered in TODO §7): the Department select stays
disabled on drafts; a draft's "d:" selection key falls back to the department's
first bar if an edit splits the department mid-selection (benign — the same bar).
The audit's §4 click-behavior rows (breadcrumb no-op targets, double-click) remain
deferred by the owner.
