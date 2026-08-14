# Toast docking (finding D3)

**Date:** 2026-08-14 · **Branch:** development · **Design-Language §6**

## What changed

Toasts moved from bottom-center to a bottom-right stack, per the §6 feedback
rules ("error toasts dock bottom-right, collapse duplicates, and cap at 3
visible with a counter"):

- **Bottom-right dock.** The `#toasts` container sits 18px from the right and
  bottom edges, stack right-aligned, newest at the bottom.
- **Cap of 3 + counter.** At most 3 toasts are visible; older ones hide behind
  a "+N more" chip at the top of the stack. Hidden toasts keep their dismiss
  timers, so the counter drains by itself as they expire.
- **Duplicate collapse.** An identical message arriving right behind the last
  one bumps a ×N badge on it (and refreshes its timer) instead of stacking a
  copy. Undo toasts never collapse — each one carries its own reverser, and
  collapsing them would eat undos.
- **Width cap.** Toasts cap at `min(380px, 100vw − 36px)`, so a long SharePoint
  error wraps into a card instead of spanning the whole canvas.
- **Never covers the dock.** When a project page's bottom inspector dock is
  open, the stack positions itself just above the dock's top edge (recomputed
  each time a toast fires — toasts live ~5s, so a mid-toast dock resize
  self-corrects on the next one). On the timeline the sort bar lives bottom-left,
  well clear of the right-docked stack.
- **Untouched:** the T7 "Details" collapse for technical errors and the Undo
  button, including hover-pauses-dismissal.

## Why it mattered

Ten rapid errors (one failed save retried across records) used to paint a
full-width tower of toasts over the middle of the canvas — covering bars, the
new-project button, and each other. Now the same burst is a tidy three-card
stack in the corner with a "+N more" chip, duplicates fold into one card with
a ×N badge, and nothing underneath becomes unreachable.

## Evidence

Screenshots from the harness-style preview stub, firing 10 rapid errors plus
an undoable move (the D3 acceptance scenario):

- Before — bottom-center tower covering the canvas:
  ![before](Phase%202/screenshots/before-toasts.png)
- After — right-docked stack of 3 + counter, duplicates collapsed:
  ![after](Phase%202/screenshots/after-toasts.png)
- After, project page — the stack rides above the bottom inspector dock:
  ![after dock](Phase%202/screenshots/after-toasts-dock.png)

- All 14 suites pass (488 assertions), including test49's Undo-toast clicks.
- Real-browser check: with the dock open, the stack's bottom edge sits 10px
  above the dock's top; `document.elementFromPoint` at the Undo button's
  center returns the button (clickable); 4 identical errors render as one
  card ×4; details toast still opens.
- Z-index unchanged at 1000 — above the overlay (200), project page (9), and
  dock-resize handle (30).

## Known ceiling / follow-up

- The stack's dock offset is computed when a toast fires, not on dock
  drag-resize; a toast already on screen during a resize can overlap for the
  few seconds it lives. Add a resize listener only if someone notices.
- Commit: `4402c5c` (code) on `development`.
