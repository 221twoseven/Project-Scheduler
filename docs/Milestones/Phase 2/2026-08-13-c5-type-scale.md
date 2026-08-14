# C5 — Type scale tokens, nothing readable below 11px

**Date:** 2026-08-13 · **App:** index.html (REV52+) · **Finding:** C5 (Design-Language §3, §4)

## What changed

The smallest text in the app used to go down to 7.5px — sidebar role tags, bar
labels on the project page, calendar day numbers. Anything a person actually has
to read is now at least 11px.

- `:root` gained the five-step type scale from the design language
  (`--fs-title` 15px, `--fs-body` 13px, `--fs-label` 11.5px, `--fs-fine` 11px,
  `--fs-micro` 9px) plus `--row-h` 44px (the "Comfortable" row height for the
  upcoming density work). The radius tokens (`--r-s/m/l`) already matched §4.
- All ~91 font sizes below 11px were converted to tokens: informational text
  (sidebar codes, bar labels, axis day numbers, tooltips, form labels, meeting
  sheet, counts, pills) moved up to `--fs-fine`; only the five decorative
  eyebrows kept `--fs-micro` — the SORT, COLOR and SCHEDULE section labels, the
  REV chip, and the project-page meta-strip keys (`.dash-meta .k`).
- No spacing, weight, or layout was redesigned — sizes only.

## Guardrails

`tests/test46.js` now asserts (on C5+ builds) that `--row-h` stays 44px and that
no `font-size` literal below 11px ever comes back. All 11 suites pass on both
`index.html` and the frozen REV50 reference.

Verified in a real browser at 1280px: timeline, project page, and calendar views
show no text clipping and no horizontal overflow.
