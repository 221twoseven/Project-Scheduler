# Milestone records — map

One folder per **development phase**, numbered in the order the phases ran. Every
record sits flat inside its phase folder, named `YYYY-MM-DD-short-slug.md`, so a
folder listing reads in date order. Screenshots live in that phase's `screenshots/`.
The story in prose lives in the retired backlogs under `docs/Archive/` (v1, v1.x) and
the current one in `docs/TODO.md`; these are the per-change records.

| Phase folder | Dates | REV / version | What happened |
|---|---|---|---|
| `Phase-0-Foundations/` | 08-12 → 08-19 | — | Infrastructure: Pages preview/sandbox deploys, render & bandwidth pass, two-tier toolbar, deploy trim |
| `Phase-1-UX-Overhaul/` | 08-12 → 08-13 | REV~51 | Language, edge indicators, stable colors, click hierarchy, sidebar rows |
| `Phase-2-Visual-System/` | 08-13 → 08-14 | — | Type scale, bottom dock, markers, legend, quiet canvas, SVG icons, toasts |
| `Phase-2.5-Feature-Interlude/` | 08-19 → 08-26 | REV53–74 | Feature work between the design phases: calendar create parity, standalone events, subtask hierarchy, breadcrumbs, checkpoints (REV53–64); the identity track — person filter, signed-in chain, person panel, dashboard button, client list, Teams picker (REV65–70); calendar parity + polish and coach marks (REV71–74) |
| `Phase-3-Navigation-at-Scale/` | 08-25 → 08-26 | REV75–79 | Zoom steps, jump-to-date, density, saved views |
| `Phase-3.5-Parity-Audit/` | 08-26 → 08-27 | REV80–88 | Parity audit dispositioned: inspector convergence, completion flow, × exit, toolbar regroup, project-page tour |
| `Phase-4-Learnability/` | 08-27 | REV89 | `?` sheet, sample project, hover cues |
| `Phase-5-V1-Close-out/` | 08-27 → 08-28 | REV90–101 | Closing out v1: pre-merge audit (REV90/91), native menu-bar toolbar in four steps (REV92–95), edit-in-place popover (REV98), collapsible dock (REV99), footer action bar (REV100), today-parking (REV101), the semver switch, the docs reorg / v2 kickoff |
| `Phase-6-v1.x-Release-Train/` | 08-28 → 09-18 | v1.0.2 → v1.23.0 | The v1.x release train: one record per version — quick wins, permissions, Company Data, People-page rounds, demo prep, calendar detail levels, weekly schedule. The version ladder in `docs/Archive/TODO-v1.x-Archive.md` §4 is the master list |
| `Phase-7-Pilot-Readiness/` | 09-24 → | v1.24 → | Planning and pilot readiness against the Project Director's Sept 2026 brief: the shared-registry north star, closeout, terminology, date certainty, verification of what exists. Backlog: `docs/TODO.md` |

Phases overlap by a day or two where one wrapped while the next began; the date
prefix on each record is the tiebreaker.

**Going forward:** every record — releases included — goes in the folder of the phase
that is running (`Phase-7-Pilot-Readiness/` today). When a new phase starts, add the
next numbered folder (`Phase-8-Short-Name/`) and a row here; close the previous row
with its end date and last version. Never a folder that isn't a phase.
