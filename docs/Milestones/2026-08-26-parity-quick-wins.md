# Parity quick wins — audit decisions round 1 (REV81) — 2026-08-26

**What this is.** The owner went through the parity audit
(`docs/Phase-3.5-Parity-Audit.md`) row by row; this REV ships everything decided
that didn't need the big inspector convergence. PR: pending.

**What changed (REV81):**

- **I8 — bug fix.** Right-click → "Add a phase" on a New Project draft now actually
  adds the department: the checklist row ticks itself and the scheduler emits the
  new phase bar. It used to do nothing, silently. (Ceiling: a name typed in the
  menu's optional name field is ignored on this path — the new bar is the
  department's primary and takes the department's name; the saved page names the
  bar. Noted in TODO §7.)
- **I13 — leak hygiene.** Draft working state (hand placements, row order, subtask
  lines) is now cleared on entry to **any** project page, not just a fresh draft —
  a cancelled draft could previously leave a Reset button armed with nothing real
  behind it, or silently reorder a saved project's subtasks by a name coincidence.
  Same-page repaints (autosave, the 45s poll) keep session state.
- **I14 — Pin has a UI.** The phase inspector gained a "📌 Pin dates" checkbox
  (bars could only be pinned from the main timeline before, then refused to resize
  here with no visible reason). A refused resize now says why — "Pinned — untick
  Pin in the phase panel" or "Protect dates is on" — on both the Gantt and the
  calendar, instead of silently snapping back.
- **D7 + D9 — drafts announce themselves.** The footer status slot (empty on
  drafts) now shows a dashed **Draft** pill; its tooltip explains the tab-local
  autosave ("kept in this tab — survives a refresh; Create project files it to
  SharePoint"). And the draft now stashes itself ~1.5s after edits settle, not
  only when the tab hides — a crash-restored tab gets its sessionStorage back, so
  the draft comes back with it.
- **D8 — the Status dropdown tells the whole truth.** First option is now
  **"Automatic (currently: Fabrication)"** — status derives from the schedule as a
  failsafe until a human pins an explicit one, and the dropdown now shows the
  *stored* choice rather than silently displaying the computed result (which made
  it impossible to tell a pinned status from a derived one, or to return to
  Automatic at all).
- **Keep-pile.** The bar hover tooltip now carries the crew name:
  `Fabrication · Nick · Mar 3 → Mar 7 · 5d` — one shared line, both pages.
- Two stray light-grey bar fallbacks (`#8A98AE`) joined the REV80 white-text rule
  (`#6B7484`).

**Also decided, no code:** I15 exit guards stay draft-only (deliberate, N2); D10's
hand-placed marker stays a draft-only affordance (the scheduler only exists as a
layout assistant while composing a draft — it never moves a saved bar, so there is
nothing for the marker to mean there).

**Evidence.** [after-3-5-draft-pill.png](Phase%203.5/screenshots/after-3-5-draft-pill.png)
— a draft with the dashed **DRAFT** pill in the footer status slot (D7) and the
"New project" chip up top. The Pin checkbox and refusal toasts are asserted in the
suite below (headless captures don't hold a selection, so no screenshot).

**Tests.** New suite `tests/test81.js` (24 assertions, both pages: the Automatic
option and stored-truth selection; tooltip crew; Draft pill + tooltip; Pin
checkbox round-trip; the refusal toast; add-a-phase on the draft; the edit-debounce
stash; state cleared on entry / kept on same-page repaint).

**Known ceilings / follow-ups** (ledgered in TODO §7): the draft add-a-phase name
field (above); the Pin checkbox uses the unicode 📌 (same U6 ceiling as the modal).
