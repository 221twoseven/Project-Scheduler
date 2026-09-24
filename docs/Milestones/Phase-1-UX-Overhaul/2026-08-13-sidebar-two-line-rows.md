# Sidebar two-line project rows (audit finding B2)

**Date:** 2026-08-13 · **App REV:** 52 · **PR:** _(add link when opened)_

## What changed

In Projects mode, each project row in the left sidebar now uses two lines
instead of one:

- **Line 1:** the project name, full width. It only truncates with "…" once a
  name passes roughly 26 characters.
- **Line 2:** job code · deadline in the small monospace style, plus the
  LATE / due-soon chip, which moved down from line 1.

The sidebar's default width also went up from 232px to 300px so typical names
fit. Everything else stayed the same: the drag-to-reorder grip, the expand
chevron, the color dot, the spotlight eye, the edit pencil, and the draggable
width (still remembered between visits). No row got taller — the two lines fit
in the existing row height.

## Why it mattered

This was finding **B2** in `docs/Archive/UX-Audit-and-Strategy.md`: at the old default
width the row showed a color dot, one letter of the name, the job code, and a
cut-off date. The project *name* — the thing people actually scan for — was
the first thing to disappear. Now every project is identifiable by name at the
default width.

## Proof

Checked in the running app at a 1280×800 window with 12 realistic project
names: all names readable, nothing overflowing or clipped. All automated test
suites pass (407 assertions).

## Follow-ups / ceilings

- Names longer than ~26 characters still truncate; dragging the sidebar wider
  (up to 480px) shows more.
- Before/after screenshots from `/preview/` still need to go in the PR
  description per the change-discipline rule.
