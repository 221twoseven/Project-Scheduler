# New Project ↔ Project Edit — parity audit (Phase 3.5)

**Date:** 2026-08-26 · **Build audited:** REV79/80, `development`
**The ask (owner):** "New Project Window and Project Edit Window should match. Find and
list differences in display/render, layout, interactivity, click behavior."

This is the **diff list** — the first deliverable of the Phase 3.5 parity item
(`docs/TODO.md` §6). No code has been changed yet; convergence fixes follow once the
owner picks from this list.

## Owner decisions — 2026-08-26 (final for rounds 1–3)

- **Accepted as recommended:** D1–D6, L1–L4, I1–I7, I9–I12. **I8: fix the bug.**
- **D7 — new direction:** the empty footer status slot on drafts shows a **"Draft"**
  pill; its tooltip carries D9's feedback ask ("kept in this tab…").
- **D8 — accepted** ("Automatic is the failsafe from a human forgetting to update
  status, with a manual override" — owner). First dropdown option is now
  "Automatic (currently: …)" and the control shows the stored truth.
- **D9 — aligned:** the store exists and is stashed; the gap was feedback (→ D7)
  plus a debounced stash after edits so a crash-restored tab recovers the draft.
- **D10 — keep, draft-only (recommendation updated).** The marker means "this bar
  is hand-placed; the draft's layout assistant will no longer move it." The
  scheduler only exists while composing a draft — it never moves a saved bar, so
  the app never overrides a PM's dates and the marker has nothing to mean on saved
  pages. The saved-page affordance that *was* missing is the pin (I14).
- **I13 — approved** ("pre-approved hygiene"): draft state clears on entry to any
  project page.
- **I14 — approved:** Pin checkbox in the phase inspector + refusal toasts.
- **I15 — keep as is** (N2 design).
- **Click behavior (§4): deferred** — to be addressed after the above.

**Shipped so far:** I8, I13, I14, D7+D9, D8, and the keep-pile tooltip crew name
landed 2026-08-26 as **REV81** (`docs/Milestones/2026-08-26-parity-quick-wins.md`).
**The inspector convergence (D1–D4, L1/L3/L4, I1–I7, I9–I12) shipped the same day as
REV82** (`docs/Milestones/2026-08-26-inspector-convergence.md`) — draft selection is
real, the popover is retired, the shared inspector serves both pages.

**§4 closeout (verified 2026-08-26, REV83):** every §4 row turned out to be already
converged by REV81/82 — the rows were symptoms of the same roots the earlier fixes
hit. Bar click and calendar-band click both route through `ppSelect` into the shared
inspector (the band goes via the retired popover's shim); the breadcrumb crumb and
the inspector × were always bound to `ppSelect(null)` and became real when draft
selection did; the marker click's pane mismatch dissolved when D4 gave drafts the
scoped "On this phase" pane; Add-a-phase was I8, the Link drag was I5. **The one
open row is double-click** — unbound on both pages, still the audit's open question
(candidate: "open editor"), an owner `[decision]`. This closes the audit: everything
else is shipped, deliberate, or that one decision.
**Double-click DECIDED 2026-08-27: stays unbound** — single-click already opens the
editor (REV82/84), so binding it would spend a reserved verb on a duplicate
(Design-Language §6). The audit is now fully dispositioned with nothing open.

## How to read these tables

Each row is one difference. The **Recommendation** column says what should happen to
that difference, in one of five forms:

| Recommendation | Meaning |
|---|---|
| **Match the saved page** | The Project Edit page's behavior is the right one — give the New Project draft the same behavior. |
| **Match the draft page** | The New Project draft does it right — bring the saved page up to it. |
| **Keep — deliberate** | The difference is intentional (drafts and saved projects genuinely differ here). Don't converge; listed so it isn't mistaken for drift. |
| **Fix (bug)** | Not drift — broken outright. Fix regardless of parity decisions. |
| **New design needed** | Both pages are wrong or the affordance is missing on both; converging to either side wouldn't help. |

Rows marked *(already identical)* were verified as shared code — included only to show
they were checked.

**Where the two pages come from:** both are rendered by **one function**
(`renderProjectPage()`), switched by a "creating" flag. The chart, calendar, markers,
menus, agenda editor, and shortcut sheet are one shared code path — those can't drift.
The differences below live in the ~30 places that branch on the draft/saved flag
(`NPV_LIVE` / `ROUTE.creating`).

**The confirmed keeper (owner "keep pile"):** the hover tooltip on bars —
`name · Mar 3 → Mar 7 · 5d` — is already identical on both pages. The owner's ask to
**add the team member name** is one change in one shared place (the bar `title`,
`index.html` ≈ line 5280); the gutter rows already show `name · who`, the model to copy.

## 1. Display / render

| # | What differs | Recommendation |
|---|---|---|
| D1 | Selecting a bar on the **saved** page swaps the bottom dock to a full phase editor ("This phase": name, department, crew, dates, notes, Duplicate/Delete). The **draft** has no phase inspector at all — its dock always shows the Project pane. | **Match the saved page** |
| D2 | The draft edits phases in a **floating popover** instead — fewer fields (no Department, no Notes, no Duplicate), different labels ("Who" vs "Crew"), different look. | **Match the saved page** (retire the popover) |
| D3 | The breadcrumb's third segment (the phase name) never appears on the draft, even with a bar selected. | **Match the saved page** |
| D4 | The dept-filtered "On this phase" agenda view exists only on the saved page; the draft always shows the full "Checkpoints & Tasks". | **Match the saved page** |
| D5 | "New project" mono chip in the top bar — draft only. | **Keep — deliberate** |
| D6 | "✓ Changes save automatically" pill — saved only (drafts don't autosave to SharePoint; that's the N2 design). | **Keep — deliberate** |
| D7 | The status pill in the chart footer is suppressed on the draft (drafts have no status), leaving that corner empty. | **Keep — deliberate** (cosmetic asymmetry; a placeholder could fill it) |
| D8 | The Status dropdown shows the **stored** value on a draft but the **computed** status on a saved project — same control, two meanings. | Owner's call — flagging it |
| D9 | Dead render code on both pages targets elements that no longer exist. Consequence: the draft has **no visible list** of its subtask names/crew (its only durable subtask store). | **Fix (bug)** — delete the dead code, decide if the draft needs that list back |
| D10 | The "hand-placed" inset-outline treatment on manually dragged bars renders only on **draft** bars; saved bars never show it. | **Match the draft page** |

## 2. Layout

| # | What differs | Recommendation |
|---|---|---|
| L1 | The bottom dock's structure forks: saved selection swaps Setup/Team/Departments for the phase editor; the draft dock never changes shape. | **Match the saved page** (falls out of D1) |
| L2 | Footer buttons: draft = Shortcuts · Cancel · **Create project**; saved = autosave pill · Shortcuts · Delete project · **Done**. | **Keep — deliberate** |
| L3 | Phase editing lives in two different places: saved = docked bottom panel (never covers the chart); draft = popover floating over the chart. | **Match the saved page** (same fix as D2) |
| L4 | The toolbar row is identical on both pages, but two controls (Link; effectively Reset) **do nothing on the draft** — the draft advertises more than it can do. | **Match the saved page** (make them work — see I5) |

## 3. Interactivity

| # | What differs | Recommendation |
|---|---|---|
| I1 | **Selection is half-implemented on the draft**: clicking or ↑/↓ shows the selection ring, but nothing reacts to it — no inspector, no breadcrumb, no keyboard verbs. Selection that visibly does nothing. This is the root of most rows below. | **Match the saved page** — the single biggest fix |
| I2 | `Del`/`Backspace` deletes the selected phase on saved; does nothing on the draft. | **Match the saved page** (falls out of I1) |
| I3 | `R` (rename) does nothing on the draft unless the popover happens to be open. | **Match the saved page** (falls out of I1) |
| I4 | `Shift+←/→` (nudge a day) works only on saved — but the shortcut sheet advertises it on both. | **Match the saved page** (or correct the sheet) |
| I5 | The **Link** toggle is inert on the draft — it still toggles and toasts "Subtasks move with their department," which is false there. | **Match the saved page** |
| I6 | `S` (new subtask) ignores the highlighted bar on a draft and always targets the first department; `E`/`T` lose the selected phase's start date. | **Match the saved page** (falls out of I1) |
| I7 | Creating a subtask: saved = real row, auto-selected, name field focused; draft = background list entry, nothing focused, different toast. | **Match the saved page** |
| I8 | Right-click empty canvas → **"Add a phase" silently does nothing on the draft** — no department added, no bar, no error. Works on saved. | **Fix (bug)** |
| I9 | Duplicate phase exists only on the saved page (its button lives in the saved-only inspector). | **Match the saved page** (falls out of D1) |
| I10 | Undo forks: saved actions ride the global undo stack (⌘Z works); draft move/resize have per-toast undo only, and ⌘Z does nothing there — though the sheet advertises it. | **Match the saved page** |
| I11 | Department checklist commits differ: saved confirms before deleting phases and toasts; the draft silently rebuilds its preview. | **Keep — deliberate** (a draft has nothing to destroy) |
| I12 | **Drag-reordering rows persists only on the draft.** On a saved project the order is lost on reload — and can leak into the next project opened. | **Match the draft page** (persist it) + fix the leak |
| I13 | Stale draft state (manual placements, row order, subtask names) is cleared only when a *fresh draft* starts — it can leak into saved pages: a Reset button that does nothing meaningful, a leftover draft name reordering saved subtasks. | **New design needed** — clear on entry to *both* pages |
| I14 | Pin/Unpin has no working UI on either page (the only Pin button is unreachable dead code) — yet a bar pinned from the main timeline silently refuses to move/resize here, with no explanation. | **New design needed** |
| I15 | Exit guards — the unsaved-changes confirm, the browser-close warning, the session draft stash — exist on the draft only. | **Keep — deliberate (N2)** — saved pages autosave instead |

## 4. Click behavior (same target, different response)

| Target | On the draft | On the saved page | Recommendation |
|---|---|---|---|
| Left-click a Gantt bar | Opens the floating popover | Selects it → bottom inspector | **Match the saved page** |
| Left-click a calendar phase band | Same popover | Same inspector | **Match the saved page** |
| Left-click empty canvas | Deselect / close overlays | *(already identical)* | — |
| Left-click a checkpoint/task marker | Focuses its agenda row — but the row can live in a different pane on each page | Focuses it in the scoped pane | **Match the saved page** |
| Breadcrumb project crumb | Does nothing | Unwinds phase → project | **Match the saved page** |
| × in the inspector header | Never rendered | Deselects | **Match the saved page** |
| Right-click a bar / gutter row / marker | Menus and confirms | *(already identical)* | — |
| Right-click empty canvas → Add a phase | **Silently does nothing** | Adds the department + bar | **Fix (bug)** — same as I8 |
| Drag a parent bar with Link on | Moves the parent alone | Carries its subtasks | **Match the saved page** — same as I5 |
| Double-click | Unbound | Unbound | **Decided 2026-08-27: stays unbound** — single-click already opens the editor; the verb stays reserved (§6) |

## Deliberate differences — do not converge

Draft Create/Cancel vs saved Done/Delete + the autosave pill; the N2 exit guards
(draft-only confirm + stash — saved pages autosave); draft edits go to the form model
while saved edits commit per field; the per-keystroke schedule regeneration on drafts.
That set is the *point* of having a draft page.

## Found in passing (not parity — worth their own tickets)

- The saved-project branch of the Save handler and its "regenerate" checkbox are
  **unreachable** (the Save button only renders on drafts). Dead code.
- `npvRemoveDept()` has no callers. Dead code.
- A saved page's deadline marker is read out of the **draft form object** — works
  today by coincidence of ordering; fragile.
- `ppSec()` is called with five arguments in three places but accepts four — the
  extra argument is silently ignored.

## Recommended order of work (when the owner green-lights fixes)

1. **I8** — the Add-a-phase silent no-op is a straight bug; fix first.
2. **I1 (+ D1/D2/L3)** — make draft selection real and retire the popover in favor
   of the shared bottom inspector. Most other rows (I2–I7, I9, D3, D4) fall out of
   this one convergence.
3. **I13 + I12** — clear draft state on entry to both pages; persist saved reorder.
4. **Keep-pile enhancement** — add the team-member name to the shared bar tooltip
   (one line, benefits both pages equally).
5. Delete the dead code (D9 and the "found in passing" items).
