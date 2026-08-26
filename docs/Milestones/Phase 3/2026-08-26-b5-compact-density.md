# Compact density + group collapse (finding B5, B6-part) — REV77

**Date:** 2026-08-26 · **App REV:** 77 · **Finding:** B5 (UX audit, "one density for
every screen") + the missing collapse on REV44's group headers ·
**Brief:** Phase 3 pack, V3 · **PR:** v3-compact-density → development

## What changed

- **A density toggle** in the Settings menu: **Density: Comfortable / Compact**. One
  click switches the whole timeline between 44px and 32px rows, and the choice is
  remembered per browser like every other view preference. Compact fits roughly a
  third more schedule on the same screen — 30 projects come within one screen at
  Month zoom, and collapsing any group closes the rest of the gap.
- **Comfortable itself tightened from 56px to 44px rows** — that's not a side effect,
  it's the design language's own number (§4: "Comfortable 44px / Compact 32px, token
  `--row-h`"). The token shipped in the C5 pass claiming 44 while real rows were 56;
  this change makes the stylesheet token and the JavaScript lane math agree, and the
  geometry drift test now asserts they stay in agreement **at both densities**.
- At Compact the sidebar's two-line rows keep both lines — project name over
  code · date — with tighter leading; nothing informational drops below 11px. Bars
  shrink from 32px to 24px tall, never below the design language's **24px minimum hit
  target**: edge-resize zones, grip dots, eyes and pencils all stay grabbable.
- **Group headers now collapse.** When the sidebar is grouped (by PM, client, or
  status), clicking a header — "Caroline · 8", say — folds her projects away behind
  the header; the chevron and count stay. Collapsed groups persist per grouping mode
  (folding a PM doesn't hide anything in the client grouping) and survive a reload.
  Same pattern the Departments lens has always had.

## Evidence

Stubbed-data captures (headless Chrome), 30 projects at Month zoom, 1600×1000:

- [Before: Comfortable was 56px rows](screenshots/before-b5-rows.png) (REV76 — ~14 rows on screen)
- [After: Comfortable at the §4 44px](screenshots/after-b5-comfortable.png) (~18 rows)
- [After: Compact 32px rows](screenshots/after-b5-compact.png) (~26 rows, sidebar still two-line)
- [After: grouped by PM, "Caroline · 8" collapsed](screenshots/after-b5-collapsed.png) — all 30 projects accounted for on one screen

## Why it mattered

The audit's Theme B: PMs run the Monday meeting off this screen, and at one fixed
density a busy season means scrolling mid-conversation. Zoom (REV75) compressed time;
this compresses rows, and group collapse folds whole books of work out of the way.
Together a 30-project shop fits a laptop.

## Notes

- No SharePoint, auth, or schema involvement — density and collapsed groups live in
  the browser's `UI_KEY` bundle alongside zoom and lens.
- New suite `tests/test-b5.js` (25 checks: both densities' geometry, the ≥24px hit
  floor, one-screen acceptance, persistence, collapse/expand, per-mode keying,
  reload survival). `tests/test46.js` gained the two-density drift assertions.
  Both skip on the frozen REV50 reference.
- Known ceilings / follow-ups (mirrored in `docs/TODO.md` §7):
  - Strictly, 30 *uncollapsed* rows at Compact are 960px of rows — a 1080p laptop
    with the toolbar shows ~28; §4's 32px row and 24px hit floor win over squeezing
    further, and one collapsed group (or a status filter) closes the gap.
  - The sidebar's ⇕ All button still only expands/collapses project phase rows and
    department sections — it doesn't fold group headers. Add if PMs ask for
    "collapse all groups".
