# Compact density + group collapse (finding B5, B6-part) — REV77

**Date:** 2026-08-26 · **App REV:** 77 · **Finding:** B5 (UX audit, "one density for
every screen") + the missing collapse on REV44's group headers ·
**Brief:** Phase 3 pack, V3 · **PR:** v3-compact-density → development

## What changed

- **A density toggle** in the Settings menu: **Density: Comfortable / Compact**. One
  click switches the whole timeline between 56px and 44px rows, and the choice is
  remembered per browser like every other view preference. Comfortable is exactly the
  layout everyone already knows; Compact fits about a quarter more schedule on the
  same screen.
- **The densities are 56/44, not the design language's original 44/32.** The first cut
  of this change shipped §4's written numbers; the owner reviewed it and ruled them too
  tight — Comfortable keeps the pre-B5 default (56px) and Compact takes the old 44px
  value. §4 was amended in the same PR (the "follow the doc or update the doc" rule).
  Bars stay 32px tall at both densities — only the breathing room around them tightens —
  so every hit target keeps the ≥24px floor without shrinking anything grabbable.
- The `--row-h` token now drives real geometry: the JavaScript lane math mirrors it at
  both values, and the geometry drift test asserts they stay in agreement at each
  density. Sidebar grips, eyes and pencils also gained an explicit 24px minimum.
- **Group headers now collapse.** When the sidebar is grouped (by PM, client, or
  status), clicking a header — "Caroline · 8", say — folds her projects away behind
  the header; the chevron and count stay. Collapsed groups persist per grouping mode
  (folding a PM doesn't hide anything in the client grouping) and survive a reload.
  Same pattern the Departments lens has always had.

## Evidence

Stubbed-data captures (headless Chrome), 30 projects at Month zoom, 1600×1000:

- [Comfortable — 56px rows, unchanged from REV76](screenshots/before-b5-rows.png)
- [Compact — 44px rows](screenshots/after-b5-compact.png) (sidebar still two-line)
- [Grouped by PM, "Caroline · 8" collapsed](screenshots/after-b5-collapsed.png)

## Why it mattered

The audit's Theme B: PMs run the Monday meeting off this screen, and at one fixed
density a busy season means scrolling mid-conversation. Zoom (REV75) compressed time;
this compresses rows a notch, and group collapse folds whole books of work out of the
way — that's the big lever for large seasons.

## Notes

- No SharePoint, auth, or schema involvement — density and collapsed groups live in
  the browser's `UI_KEY` bundle alongside zoom and lens.
- New suite `tests/test-b5.js` (25 checks: both densities' geometry, the ≥24px hit
  floor, persistence, collapse/expand, per-mode keying, reload survival).
  `tests/test46.js` gained the two-density drift assertions. Both skip on the frozen
  REV50 reference.
- Known ceilings / follow-ups (mirrored in `docs/TODO.md` §7):
  - The brief's acceptance line "30 projects fit one screen at Compact" was written
    against the 44/32 tokens and is superseded by the owner's 56/44 ruling — 30
    uncollapsed Compact rows are 1320px. Group collapse and filters carry that load.
  - The sidebar's ⇕ All button still only expands/collapses project phase rows and
    department sections — it doesn't fold group headers. Add if PMs ask for
    "collapse all groups".
