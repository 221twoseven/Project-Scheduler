# 2026-09-27 — Suite tokens and readable chrome text (style guide §13 step 2)

**Date:** 2026-09-27 · **App version:** v1.24.0 · **Branch:** `development` (PR to follow)
· **Standard:** `design/TwoSeven-Application-Style-Guide.md` v1.1, §10 tokens, §13 step 2

## What changed

The first implementation step of the v1.1 suite guide. CSS only — no layout, geometry,
routing, header or interaction change.

1. **The `--ts-*` token set is in `index.html`'s `:root`** (light only; Timeline has no
   dark theme). Six legacy tokens now alias their identical suite value — `--paper`,
   `--side`, `--side-line`, `--txt`, `--acc`, `--acc-deep`. `--ink`, `--ink-2`, `--warn`,
   `--late`, `--row-h` and the legacy radii are untouched, as the guide requires
   (`--ink` is also the contrast calculator's dark candidate). `--ts-font`/`--ts-mono`
   point at the existing `--sans`/`--mono` stacks rather than duplicating them.
2. **Secondary chrome text is `--ts-muted #596B81`.** Seventy-two rules moved off the six
   greys the transition review measured under 4.5:1 on white (`#7488A3`, `#94A3B8`,
   `#A3B1C4`, `#B4C0D0`, `--txt-dim #8B99AD`, `--txt-micro #93A2B8`) plus one stray
   (`#8194AB`, the sort-menu note). That covers hints, section heads, eyebrows, empty
   states, close glyphs, `kbd` hints, placeholders, the meta strip keys, the inspector and
   dock sub-lines, the People and Clients directories, the About page and the coach/demo
   step counters.
3. **Input boundaries are `--ts-control-line #7C8BA0`** (3.5:1) on the nine input rules
   that used the pale dividers `#E2E8F0`/`#DDE5EF` (1.2–1.3:1): modal fields, to-do
   rows, inspector fields and notes, department days/dates/other, agenda inputs, the menu
   search. Border widths are unchanged. The same greys stay where they are dividers.
4. **Canvas untouched.** Six selectors keep their grey on purpose — sidebar-row sub-line
   and assignment dates (`.sb-sub`, `.sb-asn .d`), the project-page month axis and day
   numbers (`.npv-mon`, `.npv-dnum`), the extra-row gutter and the legend off-state. The
   quiet calendar ramp is Design-Language §2.4's job and migrates in its own step.
5. **`tests/test-contrast.js` now covers chrome.** `--ts-muted` must hold 4.5:1 on paper,
   panel, sidebar, soft and selected; `--ts-control-line` 3:1 on panel and soft; the
   success/warning/danger/header pairs 4.5:1; no rule outside the six canvas selectors may
   use a retired grey; no input border may be a pale divider. Skips on the REV50 reference
   build (no `--ts-muted`).

Docs: `Design-Language.md` §2.6 amended (the chrome text/boundary rule and the canvas
carve-out); `Style-Guide.md` §1 token block and table, §2.3 text ramp and §7.4 field
recipe updated to as-built. `CHANGELOG.md` has the v1.24.0 line; `npm run notes` run.

## Why it mattered

Every "quiet" label in the app was under the readability floor the guide sets, some at
under 2:1. Frictionless adoption starts with being able to read the hint under a field.
Doing tokens and greys first, with nothing else, keeps the diff reviewable and gives step
3 (one chrome surface at a time) a token layer to build on.

## Evidence

Before/after from the stubbed `/preview/` build (same seed, 1600×1000):

| Surface | Before | After |
|---|---|---|
| Timeline (sidebar head, legend, dock) | `screenshots/before-timeline.png` | `screenshots/after-timeline.png` |
| Project page with the inspector open | `screenshots/before-project.png` | `screenshots/after-project.png` |
| People directory | `screenshots/before-people.png` | `screenshots/after-people.png` |

Accessibility checklist (Design-Language §9) for the touched surfaces: text on fills —
palette test passes (75 checks); no new actions, focus, sizes or hit targets changed;
status still carries pattern/pill; informational text sizes unchanged.

## Known ceilings / follow-ups

- `--txt-micro` has no consumers now and `--txt-dim` only one (`.sb-sub`). Retire both
  when the sidebar rows migrate (step 3 or the canvas step); left declared so this PR
  adds no token removals.
- Section eyebrows are darker but still 9–11px caps; step 3 revisits the type hierarchy.
- The greys that remain on the canvas (`#94A3B8` day/month axis at 2.6:1, `#B4C0D0` day
  numbers at 1.8:1) are decorative calendar furniture per Design-Language §2.4; if the
  owner wants them readable, that is a canvas ruling, not a chrome one.
- Timeline stays light-only; the guide's dark block was not added.
