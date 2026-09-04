# Shop Timeline — release notes

The single source for **Help ▸ Release notes** in the app. Plain language, shop-facing,
newest first. `npm run notes` generates the in-app list from this file (never edit the
`RELEASE_NOTES` block in `index.html` by hand); CI fails if a version ships without an
entry here.

Format: `## <label> — <date>` then one `- ` line per change. Keep lines concrete — say
what changed *for the team*, not how. Developer-only tooling doesn't need a line.
Collect lines for the next version under `## Unreleased` and rename it when you ship.

## v1.20.6 — Sep 4, 2026

- Shipping is a new phase on the project page, right after Installation. Tick it instead of (or as well as) Install when a job ships out; its bars are red like installs, and the project counts as complete once the last install or shipping day has passed.

- Release notes now go all the way back to the beginning — every version since the first alpha, in one place.

## v1.20.5 — Sep 3, 2026

- Added a Repository link to the Help menu — opens the source code on GitHub.

## v1.20.4 — Sep 3, 2026

- Tidied the Help menu — “Report a bug or idea” already shows the open issues, so the duplicate “Open issues” entry is gone.

## v1.20.3 — Sep 3, 2026

- Undo/redo moved to the end of the top row, next to Help, and made a little smaller.
- Refreshed the browser-tab favicon.

## v1.20.2 — Sep 3, 2026

- The undo/redo arrows are now the TWOSEVEN brand swoosh.
- The browser tab got the company favicon.

## v1.20.1 — Sep 3, 2026

- Resolved reports leave the Open Issues list (they stay on the developer page, marked).
- Technical Design no longer carries an “Other” bucket — it’s standalone, like Project Management.
- The undo/redo arrows got their proper curved shape.

## v1.20.0 — Sep 3, 2026

- Crew pickers only offer people from that phase’s department.
- Holidays are named on the calendar with a small pill, and the schedule already plans around them.
- Undo and redo everywhere: the ↩ ↪ toolbar buttons, Ctrl+Z / Ctrl+Y (⌘ on Mac).
- Milestones and Notes moved to the top rows of the project chart.
- New Help pages: Release notes and Open issues (with the report form built in).

## v1.19 — Sep 2, 2026

- A changelog: every recorded change to every project — who, when, what.
- Nicknames show everywhere a name is displayed (set them on the People page).

## v1.18 — Sep 2, 2026

- Availability on the People page (freelancers can be marked Not available).
- Admins can preview the app exactly as non-admins see it.

## v1.17 — Sep 2, 2026

- People page: at-a-glance columns, filters by department and permission, resizable panes.

## v1.16 — Sep 2, 2026

- A short intro before the guided tour: what the Shop Timeline is and who it’s for.

## v1.14–1.15 — Sep 2, 2026

- Nicknames on people records; duplicate people can be merged.
- A person’s department list is simpler — machine-level splits folded into DFAB and Finishing.

## v1.10–1.13 — Sep 2, 2026

- Logistics is its own department.
- Dashboard layout refinements and a round of owner-requested fixes.

## v1.9 — Sep 1, 2026

- My Dashboard: personal notes, milestones and time off in one place.

## v1.8 — Sep 1, 2026

- Accounts: view-only by default, with admin roles managed on the People page.
- Bug reports email the team as well as landing on SharePoint.

## v1.7 — Sep 1, 2026

- Company Data pages: People and Clients, imported from the HR contact list and the client master.

## v1.5–1.6 — Aug 31, 2026

- Smooth zoom from a week to a full year (drag the date bar).
- The bug report / feature request form.

## v1.0–1.4 — Aug 31, 2026

- First company release: the shared timeline, project pages, calendar view, milestones and notes.

## Beta · Wrap-up (REV101) — Aug 28, 2026

- A full audit pass before the first release (REV90–91).
- The timeline opens parked on today when you come back to it.
- Version numbers switched from REV counts to v1.0.1-style numbers.

## Beta · Footer action bar (REV100) — Aug 28, 2026

- Project-page actions moved into a footer bar.

## Beta · Collapsible edit dock (REV99) — Aug 28, 2026

- The edit panel can collapse out of the way.

## Beta · Edit-in-place popover (REV98) — Aug 27, 2026

- Edit names and dates right where they are, in a small popover.

## Beta · Menu-bar redesign (REV92–95) — Aug 27, 2026

- The toolbar became a proper menu bar — Print, Company Data and Help — in four steps.

## Beta · Learnability (REV89) — Aug 27, 2026

- A ? shortcuts sheet, a sample project, and hover cues to help you find your way.

## Beta · Parity audit (REV80–88) — Aug 26–27, 2026

- The inspector converged into one, a completion flow, the × exit, a toolbar regroup, and a project-page tour.

## Beta · Navigation at scale (REV75–79) — Aug 25–26, 2026

- Zoom steps, jump-to-date, a compact density, and saved views.

## Beta · Calendar parity (REV71–74) — Aug 25–26, 2026

- Calendar drag and wording, full parity with the timeline, live resize, and coach marks.

## Beta · Identity (REV65–70) — Aug 21–25, 2026

- Sign in as yourself: a person filter, a person panel, the My Dashboard button, the client list, and a Teams-backed staff picker.

## Beta · Feature interlude (REV53–64) — Aug 19–21, 2026

- Create from the calendar, standalone events, subtask hierarchy, breadcrumbs, and checkpoints everywhere.

## Beta · Visual system (REV52) — Aug 13–14, 2026

- A consistent type scale, the bottom dock, today and deadline markers, a status legend, a quieter canvas, SVG icons, and docked toasts.

## Beta · UX overhaul (REV~51) — Aug 13, 2026

- Readable labels and stable project colors, clean click-vs-drag, resize from both ends, two-line sidebar names, off-screen bar indicators, plain-language errors, and tooltips everywhere.

## Beta · Foundations (REV50) — Aug 12–19, 2026

- The company copy begins: preview and sandbox deploys, a render and bandwidth performance pass, and the two-tier toolbar.

## Alpha · The original Timeline (REV1–50) — before Aug 12, 2026

- The original Timeline app, built before this project — its REV 50 is the frozen baseline everything here grew from.
