# 2026-10-05 — Bar labels stick to the visible left edge (v1.36.0)

**Date:** 2026-10-05 · **App version:** v1.36.0 · **Where:** `index.html`,
`design/Design-Language.md` · **Tracker:** issue #4 (TODO item 35) · **PR:** see the
`feat/issue4-sticky-labels` pull request

## What changed

The name inside a bar — "Technical Design", "Main Shop Fab", and on the project row the
status pill plus the project name — used to park just right of the Today line (REV36). With
the view scrolled a few days before today, the labels sat mid-canvas while the bars' starts
were already off-screen; the reporter circled exactly that.

Now a bar that starts off-screen to the left keeps its label at the left edge of the visible
chart, next to the sidebar, and the label rides along with the bar again once the bar's
start scrolls into view. It never leaves its own bar: it stops 40px short of the bar's end
and is trimmed with "…" when the visible part is too short. The same rule applies on the
dashboard (Projects and Departments lenses) and on the project page's phase chart, where the
label parks just right of the name column.

Mechanics: the dashboard already recomputed label positions on every scroll
(`labelLeftFor` / `queueLabelReposition`); the Today anchor was dropped in favour of the
viewport edge, and the "short bar never parks" and minimum-width rules went with it (the
ellipsis covers those cases). The project page gained the same small routine
(`npvStickLabels`), run after every paint and on scroll.

## Why it mattered

Hubert's report (2026-09-24): "Keep phase/status labels pinned to the left side of the Gantt
chart, directly next to the project ribbon, so they remain visible when scrolling
horizontally."

## Evidence

`screenshots/before-issue4-sticky-labels.png` · `screenshots/after-issue4-sticky-labels.png`
(dashboard, project row opened, view three days before today) ·
`screenshots/before-issue4-sticky-labels-project.png` ·
`screenshots/after-issue4-sticky-labels-project.png` (project page at Month zoom, same scroll)

## Known limit

A bar whose visible part is shorter than the 40px ellipsis zone shows only "…" (the spec's
"cut off with …"); the full name is one scroll-step away or in the bar's tooltip.

`tests/test-v1360.js` asserts the offset from a simulated scroll on the dashboard (both
lenses, project row pill included) and on the saved and draft project pages, the bar-end
clamp, and the ellipsis styles.
