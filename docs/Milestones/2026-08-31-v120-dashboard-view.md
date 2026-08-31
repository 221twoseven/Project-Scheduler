# 2026-08-31 — v1.2.0: My Dashboard becomes its own place (objective 1)

App version **v1.1.0 → v1.2.0** (minor: a feature drop). The dashboard keeps its
REV65–68 mechanics — it *is* still the Departments lens plus the person filter —
but it no longer reads as a filtered copy of the global timeline.

## What changed

- **A project-page-style trail bar** (`#dash-bar`) sits fixed under the toolbar
  while the dashboard is on: `All Projects › My Dashboard · name`, with the same
  × exit the project pages carry (REV85). The crumb and the × both unwind to the
  full timeline in whichever lens you came from — exactly what the old dock
  breadcrumb did, now where the project pages taught people to look.
- **No Projects/Department views inside the dashboard.** The sidebar's lens
  toggle and ⇕ All button hide; a quiet "My Dashboard" label takes their place.
- **Every assigned phase paints flat.** Collapsed department sections still show
  their lanes while the dashboard is on (the sidebar hides the collapse carets to
  match) — nothing needs expanding to see your plate.
- **The summary dock behaves like every other dock.** The person panel keeps its
  Working on / Checkpoints / Tasks / Time off content, but its header traded the
  old breadcrumb + ✕ for the REV99 collapse chevron — one click folds it to a
  slim header bar, persisted per browser under its own key
  (`shopTimelineMeDockCollapsed`), independent of the project page's dock.

## Evidence

`screenshots/v120-dashboard.png` — the trail bar, the sidebar label, flat phases,
and the collapsible summary dock in one frame.

## Tests

New suite `tests/test-v120.js` (19 assertions: bar shows/names/exits, flat rows
despite collapsed sections, dock collapse + persistence + re-render, CSS gates
for the project route and the hidden lens toggles). `test67`/`test68` branched to
the new exits (the old `md-home`/`md-close` assertions guard pre-v1.2.0 builds).

## Known ceilings / follow-ups

- The dashboard's flat view ignores `COLLAPSED` but doesn't clear it — leaving
  the dashboard restores exactly the sections you had collapsed before.
- The toolbar's search/status/zoom controls still work inside the dashboard (it
  is the filter mechanics, after all) — deliberately kept; only the lens choice
  is taken away.
- Esc doesn't exit the dashboard (not requested; the project pages' Esc has
  layered meanings this view doesn't). Gate: someone reaching for it.
