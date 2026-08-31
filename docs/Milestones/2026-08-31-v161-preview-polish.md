# 2026-08-31 — v1.6.1: the /preview/ polish batch

**What:** the owner reviewed v1.2.1–v1.6.0 live at `/preview/` and sent back ten
findings. All ten shipped in one patch as v1.6.1 on `development`.

## The ten items

1. **Project-page calendar markers redrawn.** Milestones and notes no longer render
   as filled bands with white text. A milestone is now ink text behind a small yellow
   diamond; a note is grey text behind a white circle (the same glyphs the Gantt
   uses). A milestone on a phase leads with the phase name (`Fabrication: Client
   sign-off`), long text wraps instead of clipping, and markers sit at the **bottom**
   of each week row — phases keep the top, a flexible spacer track pushes marker rows
   down. Known ceiling: the prefix is the *department* name; a phase renamed via its
   label still prefixes with the department (markers only carry the department id).
2. **"Views" renamed "Saved Views",** and the popover now anchors to the right edge
   of its button so it can no longer run off-screen.
3. **Projects with no current work sink to the bottom** of the Projects lens — a
   project whose every phase ended before today (or, with no phases, whose deadline
   passed) renders after the live board, stably, inside its sort group too.
4. **Sidebar bottom-crop fixed.** The sidebar viewport is shorter than the Gantt's by
   the footer bar, so at max scroll the last row stayed cropped (worst with the
   client/PM/status group headers). The Gantt scroller now pads its bottom by the
   footer's measured height; the shared scrollTop keeps both panes aligned.
5. **Step zooms anchor on Today.** Week/Month/3-Mo (buttons, W/M keys, +/−) used to
   re-render at the new scale and then visibly scroll back — it read as a glitch.
   They now hold Today's pixel in place (or the date mid-viewport when today is
   off-screen) while the scale animates over ~180 ms. `zoomSettle()` lands a pending
   animation instantly (used on header-drag start and by the test suites).
6. **Department-lens lane summaries drop past work.** Assignments that ended before
   today no longer list; current + upcoming only, in start order. An 8 px right pad
   separates the text from the sidebar edge.
7. **Keyboard shortcuts became a Help popover** (`#kbd-menu`), route-aware (timeline
   keys vs project-page keys), replacing both modal sheets (`tl-ks`, `pp-ks`). It
   shares the toolbar-menu machinery with the Legend, so the two mutually mute and
   outside-click/Esc close either.
8. **Legend is just a legend again** — the Navigate section (Go to date, Keyboard
   shortcuts) removed; both remain reachable via G / Help ▾.
9. **Drag-zoom smoothed.** Zoom frames (gesture and animated steps) go through
   `zoomRender()` — geometry only (header + canvas), skipping the sidebar/dock/dash
   repaints that made frames stutter. One full render settles on release.
10. **Bug-report form alignment fixed.** The generic `.fg label` / `.fg input` rules
    were stretching the Kind radios full-width; `#fb-kind` now has its own flex
    layout and the radios sit beside their captions.

## Tests

- New suite `tests/test-v161.js` (20 checks) covers items 1, 3, 5, 6 in jsdom plus
  source-level checks for 2, 4, 10.
- `test89` re-covers item 7 (popover + mutual muting), `test-goto` item 8,
  `test49` the project-page `?` popover.
- `test-v150` and `test-v4-views` gained `zoomSettle()` calls — step zooms animate
  now, and the settle hook keeps the assertions synchronous.

## Ceilings / notes

- Marker prefix = department name (see item 1 above).
- The zoom animation is 180 ms fixed; `prefers-reduced-motion` gets an instant jump.
- Item 6 keeps *upcoming* assignments visible (the complaint was past ones); if the
  owner truly wants in-progress only, it's a one-line filter change.
- Item 3 treats a phase-less project as "past" only when its deadline has passed.
