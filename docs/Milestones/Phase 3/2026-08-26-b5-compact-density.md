# Density levels + group collapse (finding B5, B6-part) — REV77–78

**Date:** 2026-08-26 · **App REV:** 77 (PR #19) + 78 (PR #20) · **Finding:** B5 (UX
audit, "one density for every screen") + the missing collapse on REV44's group headers ·
**Brief:** Phase 3 pack, V3 · **PRs:** v3-compact-density → development (#19),
v3b-density-levels → development (#20)

## What changed

- **A density control** in the Settings menu, cycling **Comfortable → Snug → Compact**:
  56px, 44px and 32px rows (token `--row-h`), remembered per browser like every other
  view preference. Comfortable is exactly the layout everyone already knows; Snug
  tightens the breathing room around unchanged 32px bars; Compact also drops the bars
  to 24px — never below the design language's **24px minimum hit target**, so
  edge-resize zones, grip dots, eyes and pencils all stay grabbable.
- **The levels took two rulings to land** (both 2026-08-26): the first cut shipped
  §4's written two-level 44/32 spec (REV77) — which also tightened Comfortable from
  the de-facto 56px; the owner ruled that too tight and settled on three levels with
  Comfortable keeping the pre-B5 default and the old spec values becoming Snug and
  Compact (REV78). §4 was amended in the same PR (the "follow the doc or update the
  doc" rule).
- The `--row-h` token now drives real geometry: the JavaScript lane math mirrors it at
  every level, and the geometry drift test asserts they stay in agreement at all three.
- At Compact the sidebar's two-line rows keep both lines — project name over
  code · date — with tighter leading; nothing informational drops below 11px.
- **Group headers now collapse.** When the sidebar is grouped (by PM, client, or
  status), clicking a header — "Caroline · 8", say — folds her projects away behind
  the header; the chevron and count stay. Collapsed groups persist per grouping mode
  (folding a PM doesn't hide anything in the client grouping) and survive a reload.
  Same pattern the Departments lens has always had.

## Evidence

Stubbed-data captures (headless Chrome), 30 projects at Month zoom, 1600×1000:

- [Comfortable — 56px rows, unchanged from REV76](screenshots/before-b5-rows.png)
- [Snug — 44px rows](screenshots/after-b5-snug.png)
- [Compact — 32px rows](screenshots/after-b5-compact.png) (sidebar still two-line; ~26 rows on screen)
- [Grouped by PM, "Caroline · 8" collapsed](screenshots/after-b5-collapsed.png) — all 30 projects accounted for on one screen

## Why it mattered

The audit's Theme B: PMs run the Monday meeting off this screen, and at one fixed
density a busy season means scrolling mid-conversation. Zoom (REV75) compressed time;
density compresses rows — 30 projects come within one screen at Compact + Month — and
group collapse folds whole books of work out of the way.

## Notes

- No SharePoint, auth, or schema involvement — density and collapsed groups live in
  the browser's `UI_KEY` bundle alongside zoom and lens.
- New suite `tests/test-b5.js` (density cycle across all three levels, the ≥24px hit
  floor, one-screen acceptance, persistence, collapse/expand, per-mode keying, reload
  survival). `tests/test46.js` gained the three-density drift assertions. Both skip
  on the frozen REV50 reference.
- Known ceilings / follow-ups (mirrored in `docs/Archive/TODO-v1-Archive.md` §7):
  - 30 *uncollapsed* Compact rows are 960px — borderline one screen on a 1080p laptop
    with the toolbar; a collapsed group or a filter gives the slack. §4's 32px row and
    24px hit floor win over squeezing further.
  - The sidebar's ⇕ All button still only expands/collapses project phase rows and
    department sections — it doesn't fold group headers. Add if PMs ask for
    "collapse all groups".
