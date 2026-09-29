# 2026-09-27 — Style Guide: the visual system written down as shipped

**Date:** 2026-09-27 · **App version:** unchanged (v1.23.0 — docs only) · **File:**
`design/Style-Guide.md`

## What changed

The owner asked for a style guide of the Timeline app "as it currently stands" — tokens,
fonts, colours, spacing and everything else a sibling app would need — to start the
app ecosystem the 2026-09-24 vision describes (portal + Client Manager, Personnel
Manager, Design Resources Manager; `TODO.md` §1–2, Phase 9).

`design/Design-Language.md` already held the *rules* and owner rulings, but several of its
values were written before the code moved on (the toolbar's near-black bar, the
pre-3.5 palette slots) and it never listed the recurring literals, shadows, z-index
ladder, breakpoints or component CSS. The new file is the **values-and-recipes**
companion, read from the stylesheet and script constants rather than from any plan:

- §1 the `:root` block verbatim plus 24 recurring literals proposed as tokens;
- §2 every colour system: dark chrome, light surfaces, the text ramp, semantic colours,
  the three reds and their jobs, `PCOLS`, `DEPT_COLORS` by group, status treatments and
  pills, the quiet/Vivid canvas formulas with `MONTH_HSL`, `labelColor()`/`kidShade()`;
- §3–6 type (families, scale, off-scale sizes in use, tracking ladder), brand assets,
  spacing, radii, shadows, density, z-index ladder, breakpoints, motion, icon rules;
- §7 thirteen component recipes as shipped (toolbar button, search, light buttons,
  fields, toggles, chips, menus/popovers, tooltip/toast, modal, page chrome,
  master/detail, sidebar row/empty state/coach, scrollbar);
- §10 the ecosystem brief: what a sibling app copies verbatim (the future `common.css`),
  what it never changes, and a **proposed** three-slot per-app identity — the eyebrow
  text, the mark, and one `--app` hue used only on those two and the portal's active nav,
  never on data or in place of `--acc`. Labelled a proposal until D4 is ruled.

Pointers added in `CLAUDE.md` (core files), `Design-Language.md` (companion line) and
`TODO.md` §8.

## Why it mattered

The D4 recommendation (separate single-file apps sharing a vendored `common.css`) needs a
spec to cut that file from; this is it. It also gives reviewers a grep-able checklist
(§0) and names the drift between the design doc and the code instead of leaving it to be
rediscovered.

## Ceilings / follow-ups

- §1.1's proposed tokens are not in `:root`; promoting them is one small PR each.
- §10 is a proposal — the owner rules on D4 and on the per-app hues before any second
  app starts.
- The doc is hand-maintained; a test that diffs `:root` against §1 would stop the drift
  the Design-Language suffered. Not built (YAGNI until the second app exists).
