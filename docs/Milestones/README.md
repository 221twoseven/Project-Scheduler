# Milestone records — map

One folder per era of the app's development, in chronological order. Every record
is named `YYYY-MM-DD-short-slug.md`; screenshots live in a `screenshots/` folder
next to the records that cite them (plus a shared one at this level for the
Identity/Calendar-era shots). The story in prose lives in `docs/TODO.md` §1 and
`docs/Archive/`; these are the per-change records.

| Folder | Era | What happened there |
|---|---|---|
| `Foundations/` | 2026-08-12 → 08-19 | Pre-feature infrastructure: Pages preview/sandbox deploys, the render & bandwidth performance pass, the two-tier toolbar, deploy trim |
| `Phase 1/` | 2026-08-13 | UX overhaul (REV~51): language, edge indicators, stable colors, click hierarchy, sidebar rows |
| `Phase 2/` | 2026-08-13 → 08-14 | Visual system: type scale, bottom dock, markers, legend, quiet canvas, SVG icons, toasts |
| `Phase 2.5/` | 2026-08-19 → 08-21 | Feature interlude (REV53–64): calendar create parity, standalone events, subtask hierarchy, breadcrumbs, checkpoints everywhere |
| `Identity/` | 2026-08-21 → 08-25 | The identity track (REV65–70): person filter, signed-in chain, person panel, dashboard button, client list, Teams picker |
| `Calendar-Parity/` | 2026-08-25 → 08-26 | Calendar parity + polish (REV71–74): drag/wording, full parity, live resize, deferred polish, coach marks |
| `Phase 3/` | 2026-08-25 → 08-26 | Navigation at scale (REV75–79): zoom steps, jump-to-date, density, saved views |
| `Phase 3.5/` | 2026-08-26 → 08-27 | Parity audit dispositioned (REV80–88): inspector convergence, completion flow, × exit, toolbar regroup, project-page tour |
| `Phase 4/` | 2026-08-27 | Learnability (REV89): `?` sheet, sample project, hover cues |
| `Native-Toolbar/` | 2026-08-27 | The menu-bar redesign (REV92–95), four phases |
| `Edit-Popover/` | 2026-08-27 | Edit-in-place popover (REV98) |
| `Dock-Collapse/` | 2026-08-28 | Collapsible edit dock (REV99) |
| `Footer-Action-Bar/` | 2026-08-28 | Footer action bar (REV100) |
| `V1-Wrap/` | 2026-08-27 → 08-28 | Closing out v1: the pre-merge audit (REV90/91), today-parking (REV101), the semver switch, the docs reorg / v2 kickoff |
| `V1-Releases/` | 2026-08-28 → today | The v2-track release train: one record per version from v1.0.2 quick wins through permissions (v1.8.0), Company Data (v1.7.0), the People-page rounds, the demo prep, and onward. The version ladder in `docs/TODO.md` §4 is the master list |

Convention going forward: new records for versioned releases go in `V1-Releases/`
(rename the folder at the v2.0.0 cutover); a genuinely new era gets its own folder
and a row here.
