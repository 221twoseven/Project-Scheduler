# SVG icon set & toolbar rhythm (findings C6, C7)

**Date:** 2026-08-14 · **Branch:** development · **Design-Language §5, §4**

## What changed

Every unicode glyph icon in the interactive chrome is now an inline SVG in one
drafting-instrument style — 16×16 viewBox, 1.5px stroke, `currentColor`, pasted
literally into the file (no icon font, no external files, no build step):

- **Toolbar:** print ⎙ → printer, settings ⚙ → sliders, reset ⟲ → counter-
  clockwise arrow, meeting ☰ → list lines, and every menu caret ▾ → small
  chevron (including the JS-rebuilt Status button label).
- **Sidebar:** expand-all ⇕ → unfold chevrons, row chevrons ▶ (the open-state
  rotate still works), eye toggles 👁, edit pencils ✎, and the drag grip ⠿ →
  six-dot grip. JS-built icons live in one `ICO` constant next to the existing
  `edgeChevron()` helper, which already set the style.
- **Overlay Print buttons** on the project page and meeting sheet match.
- Prose that referenced glyphs ("Click ⟲ Clear filters", "add in ⚙ Staff")
  now reads without them.

Then the toolbar rhythm pass (C7): all gaps and paddings in both toolbar rows
are 4px multiples, every control (buttons, toggle groups, search field) is
exactly 28px tall on one shared baseline per row, the sync pill (24px) and
Protect-dates switch center against them, and menus open at a consistent 4px
offset below their buttons. The brand block was left untouched, per the brief.

## Why it mattered

The old icons were unicode dingbats, so their weight and even their presence
depended on which font the OS substituted — the same button could render
differently in Chrome and Edge, and some glyphs (⎙, ⠿) fall back to tofu boxes
on lean Windows installs. Inline SVGs render from the same paths everywhere by
construction. The rhythm pass removes the half-pixel paddings (5.5px) and odd
gaps that made the toolbar look hand-placed.

## Evidence

- Glyph grep of `index.html` finds zero of the replaced set (the ▸ deadline
  pennant and the sync pill's ● status dot remain by design — §7 markers and a
  status dot, not chrome icons).
- All 14 suites pass against `index.html` (488 assertions).
- Real-browser check via the harness-style preview stub: `getBoundingClientRect`
  confirms every toolbar control at h28 on one shared top per row; screenshots
  confirm the icon set renders crisply, menus align, chevrons rotate, and the
  hover pencil appears.

## Known ceiling / follow-up

- The 📌 on the "Pin dates" modal label was left as-is: it is inside an
  overlay, not the chrome the brief scoped, and that surface has no SVGs to
  mix with. Sweep it in U8's print/overlay pass if it grates.
- Edge-vs-Chrome parity is by construction (both Chromium, same SVG paths);
  no separate Edge run was made.
- PR link: [#15](https://github.com/221twoseven/Project-Scheduler/pull/15) (promotion PR).
