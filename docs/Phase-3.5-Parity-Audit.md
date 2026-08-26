# New Project ↔ Project Edit — parity audit (Phase 3.5)

**Date:** 2026-08-26 · **Build audited:** REV79/80, `development`
**The ask (owner):** "New Project Window and Project Edit Window should match. Find and
list differences in display/render, layout, interactivity, click behavior."

This is the **diff list** — the first deliverable of the Phase 3.5 parity item
(`docs/TODO.md` §6). Convergence fixes follow from it once the owner picks what to keep.
"Better side" says which behavior should win if we converge.

## How the two pages are wired (why some things can't drift)

Both pages are rendered by **one function**, `renderProjectPage()`, switched by a
"creating" flag. Most of the page — the Gantt paint, the calendar, the axis, markers,
footer, legend, right-click menus, the agenda editor, gutter reorder, dock resize,
Esc layering, the shortcut sheet — is a **single shared code path**: parity by
construction. The drift lives in ~30 places that branch on the draft/saved flag
(`NPV_LIVE` / `ROUTE.creating`).

**The confirmed keeper (owner "keep pile"):** the hover tooltip on bars —
`name · Mar 3 → Mar 7 · 5d` — is identical on both pages today. The owner's ask to
**add the team member name** lands in one place (the bar `title` at `index.html`
≈ line 5280); the gutter rows already show `name · who`, which is the model to copy.

## 1. Display / render

| # | Difference | Better side |
|---|---|---|
| D1 | **The phase inspector ("This phase" panel) doesn't exist on the draft.** Selecting a bar on a saved project swaps the bottom dock to the phase's own editor (name, department, crew, dates, notes, Duplicate/Delete). A draft always shows the Project pane. | **Saved** |
| D2 | **Draft phase editing is a floating popover instead** — different field set (no Department select, no Notes, no Duplicate), different labels ("Who" vs "Crew"), different visual language than the dock. | **Saved** |
| D3 | **The breadcrumb's phase segment never appears on the draft**, even with a bar selected. | **Saved** |
| D4 | **The dept-filtered "On this phase" agenda** view is saved-only; the draft always shows the full "Checkpoints & Tasks". | **Saved** |
| D5 | "New project" mono chip in the top bar — draft only. | Deliberate |
| D6 | "✓ Changes save automatically" pill — saved only (drafts don't autosave to SharePoint; that's N2). | Deliberate |
| D7 | **Status pill in the chart footer** — suppressed on the draft, leaving the footer's right edge empty. Correct (drafts have no status) but visibly asymmetric. | Deliberate, cosmetic gap |
| D8 | The Status select shows the **stored** value on a draft but the **computed** status on a saved project — same control, different semantics. | Flag for owner |
| D9 | **Dead render paths on both pages** (`renderSideList`, `renderDraftLines`, `ppRefreshMetrics` target elements that no longer exist). Consequence: the draft has **no visible UI** for its subtask name/crew list (`NPV_LINES`), its only durable subtask store. | Delete the dead code; loss is draft-side |
| D10 | The `.manual` "hand-placed" inset-outline treatment only ever renders on **draft** bars; saved bars have no equivalent affordance. | Draft |

## 2. Layout

| # | Difference | Better side |
|---|---|---|
| L1 | **The bottom dock's information architecture forks**: saved selection swaps Setup/Team/Departments for "This phase" + "On this phase"; the draft dock is structurally frozen. | **Saved** |
| L2 | Footer buttons: draft = Shortcuts · Cancel · **Create project**; saved = autosave pill · Shortcuts · Delete project · **Done**. | Deliberate |
| L3 | **Phase editing lives in two different places** — saved: docked bottom panel (non-occluding); draft: absolute popover floated over the chart. Two spatial models for the same job. | **Saved** |
| L4 | The toolbar row is identical on both — but two of its controls (Link, and effectively Reset) are **inert on the draft** (see I5, I13), so the draft advertises more than it can do. | Saved |

## 3. Interactivity

| # | Difference | Better side |
|---|---|---|
| I1 | **Selection is half-implemented on the draft**: ↑/↓ and clicks paint the selection ring and gutter highlight, but nothing else reacts (no inspector, no breadcrumb, no keys). Visible selection with no consequence — the single biggest drift. | **Saved** |
| I2 | `Del`/`Backspace` deletes the selected phase on saved; does nothing on the draft. | **Saved** |
| I3 | `R` (rename) does nothing on the draft unless the popover is already open. | **Saved** |
| I4 | `Shift+←/→` (nudge a day) is saved-only, but the shortcut sheet advertises it on both. | **Saved** (or fix the sheet) |
| I5 | **The Link toggle is inert on the draft** — it still toggles, persists, and toasts "Subtasks move with their department," which is false there. | **Saved** |
| I6 | `S` (new subtask) ignores the highlighted bar on a draft and always targets the first department; `E`/`T` lose the selected phase's start date. | **Saved** |
| I7 | Creating a subtask: saved = real row, selected, name focused, "Added" toast; draft = list entry + placement, nothing focused, "Split" toast. | **Saved** |
| I8 | **Bug, not just drift:** the empty-canvas right-click **"Add a phase" is a silent no-op on the draft** — the department is never added, no bar appears, no error. The saved path works. | **Saved — fix** |
| I9 | Duplicate phase is saved-only (its only entry point is the saved-only inspector). | **Saved** |
| I10 | **Undo forks**: saved actions ride the global undo stack (⌘Z works); draft move/resize use per-toast undo only — ⌘Z on a draft does nothing, though the sheet advertises it. | **Saved** for consistency |
| I11 | Department checklist commits differ: saved confirms before deleting phases and toasts; draft silently rebuilds the preview. | Deliberate (a draft has nothing to destroy) |
| I12 | **Row reorder persists only on the draft.** On a saved project the drag-reorder is session-only, lost on reload — and the leftover order can leak into the next project opened. | **Draft** (saved needs a write-through) |
| I13 | **Stale draft state leaks into saved pages** (manual placements, order, subtask lines are only cleared when a *fresh draft* starts). Symptoms: a Reset button that does nothing meaningful; a leftover draft subtask name can reorder saved subtasks. | Neither — clear on entry to both |
| I14 | **Pin/Unpin has no working UI on either page** (the popover's Pin button is unreachable dead code), yet a bar pinned from the main timeline silently refuses to resize here with no explanation. | Neither — missing affordance |
| I15 | Exit guards — `beforeunload`, hash-exit confirm, session draft stash — draft only. | **Deliberate (N2)** |

## 4. Click behavior (same target, different verb)

| Target | Draft | Saved | Better |
|---|---|---|---|
| Left-click a Gantt bar | Opens the floating popover | Selects → bottom inspector | **Saved** |
| Left-click a calendar band | Same popover fork | Same inspector | **Saved** |
| Left-click empty canvas | Deselect / close overlays | Identical | Parity |
| Left-click a checkpoint/task | Focuses its agenda row — but the row may live in a different pane on each side | Scoped pane | Saved |
| Breadcrumb project crumb | No-op | Unwinds phase → project | Saved |
| Inspector header × | Never rendered | Deselects | Saved |
| Right-click bar / gutter / marker | Menus and confirms | Identical | Parity |
| Right-click empty canvas → Add a phase | **Silent no-op (I8)** | Adds dept + bar | **Saved** |
| Drag a parent with Link on | Moves parent alone (Link inert) | Carries subtasks | **Saved** |
| Double-click | Unbound | Unbound | Parity (candidate for "open editor"?) |

## Deliberate differences — do not "converge" these

Draft Create/Cancel vs saved Done/Delete + autosave pill; the N2 exit guards
(draft-only confirm + stash, saved pages autosave); draft writes go to the form model
while saved writes commit per field; the per-keystroke schedule regeneration on drafts.
That set is the *point* of having a draft page.

## Found in passing (not parity, worth tickets)

- The saved-project branch of `savePageProject()` and its `#pp-regen` checkbox are
  **unreachable** — the Save button only renders on drafts. Dead code.
- `npvRemoveDept()` has no callers. Dead code.
- A saved page's deadline marker is read out of the **draft form object** — works
  today by coincidence of ordering; fragile.
- `ppSec()` is called with five arguments in three places but takes four — the
  trailing `true` is silently ignored.

## Recommended convergence order (when the owner green-lights fixes)

1. **I8** — the Add-a-phase no-op is a straight bug; fix first.
2. **I1 + D1/D2/L3** — make draft selection real and retire the popover in favor of
   the shared bottom inspector; most of the other key gaps (I2–I7, I9, D3, D4) fall
   out of that one convergence.
3. **I13 + I12** — clear draft globals on entry to both pages; persist saved reorder.
4. **Keep-pile enhancement** — add the team-member name to the shared bar tooltip
   (one line, benefits both pages equally).
5. Delete the dead code (D9, savePageProject saved branch, npvRemoveDept).
