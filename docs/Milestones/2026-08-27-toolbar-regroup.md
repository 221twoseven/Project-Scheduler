# Toolbar regroup — Option A (REV88)

**Date:** 2026-08-27 · **REV:** 88 · **Phase:** 3.5 · **PR:** #29

## What changed

The timeline toolbar row (row 2) had view styles, data filters, and actions
interleaved — the owner's note: "there has to be a better way of organizing and
grouping these buttons and controls." The design pass
(`docs/Archive/Toolbar-Grouping-Proposal.md`) offered three options; the owner picked
**Option A** (2026-08-27): recluster in place, nothing goes behind a menu.

The row now reads in four groups, each answering one question:

- **Where** — Today + Go to date.
- **Style** — zoom scale (Day/2-Day/Week/Month) · color lens (Project/Team) ·
  **Density** (surfaced out of Settings as a cycle button: Comfortable → Snug →
  Compact) · Vivid months.
- **Filter** — search · Status · Person · Clear filters.
- **Right edge** — Views ▾ (the named bundle of the whole row — the row's
  summary, not a member of one cluster) · Protect dates · ? legend.

Micro-eyebrow labels (`t-mini`, the old "Color" treatment) name the first three
clusters; separators sit between clusters only. The Settings → Density item
stays as an alias for a release, then retires.

## Why it mattered

Density was two clicks from its siblings; Views read like another filter;
Vivid months and Protect dates floated unexplained at the right. Now every
control sits with the question it answers, and Density — a style — costs one
click like the rest of its cluster.

## Evidence

![before](Phase%203.5/screenshots/before-3-5-toolbar-regroup.png)
![after](Phase%203.5/screenshots/after-3-5-toolbar-regroup.png)

## Tests

`tests/test88.js` (12 assertions): cluster reading order, Views past the
spacer, eyebrow labels, the density button cycling all three levels with the
Settings alias following. The behavior guards (`test-b3-zoom`, `test-b5`,
`test-v4-views`, `test-quiet`) pass unchanged — controls moved, none changed
behavior.

## Known ceilings / follow-ups

- The Settings → Density alias is deliberate transition redundancy — retire it
  after a release once muscle memory moves (ledgered in TODO §7).
- The eyebrow labels hide below 1400px width (existing `t-mini` media rule) —
  the clusters keep their separators, so grouping survives without the words.
