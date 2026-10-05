# Shop Timeline — release notes

The single source for **Help ▸ Release notes** in the app. Plain language, shop-facing,
newest first. `npm run notes` generates the in-app list from this file (never edit the
`RELEASE_NOTES` block in `index.html` by hand); CI fails if a version ships without an
entry here.

Format: `## <label> — <date>` then one `- ` line per change. Keep lines concrete — say
what changed *for the team*, not how. Developer-only tooling doesn't need a line.
Collect lines for the next version under `## Unreleased` and rename it when you ship.

## v1.39.0 — Oct 5, 2026
- Open Issues: every open report now carries a status tag — PENDING until the team has looked at it, IN REVIEW once someone has replied on its ticket. Resolved reports keep their own column.

## v1.34.0 — Oct 5, 2026
- Open Issues: the Resolved column now shows the date a report was resolved, not the date it was sent, and lists the most recently resolved first.
- Open Issues: the team can post a note under a report (a `/comment` on its ticket) that shows as a developer comment in the app without emailing the person who filed it; `/reply` still does both.

## v1.33.1 — Oct 5, 2026
- Project Schedule: each department's day count now sits beside its own date range, next to the dates it counts — the same spot every extra work period already uses.

## v1.33.0 — Oct 5, 2026
- The app now notices when a newer version has been published — it checks twice a day and whenever you come back to the tab — and shows "vX is available" with a Reload button, so a tab left open no longer runs an old build for days. After the reload, a one-time "Updated to vX" toast opens the release notes.
- A developer can ask every open tab to reload onto the current build from Help ▸ App settings; a tab on an older build shows "This version has been retired" and reloads within 30 seconds — but never while you're creating a project, editing, dragging or saving, so nobody loses work; an unsaved New Project draft is kept across the reload.
## v1.32.0 — Oct 2, 2026
- Project Schedule: a department can now have several separate work periods on one project. Press + beside a department (or right-click its row on the chart) to add another range after the last one; each range has its own dates and day count, draws as its own bar with the gap left empty, and an extra range is removed with ×.
## v1.31.1 — Oct 2, 2026
- Drafter is now called Technical Designer on the project page and in the Help legend.
- On the project page, the Team section is now Project Team and the Departments section is now Project Schedule.
- The hint under Project Schedule now says how a phase is actually added (tick a department, or double-click the calendar); right-click has offered only milestones and notes since v1.2.1.
## v1.31.0 — Oct 2, 2026
- Dashboard: each project now shows its client — under the name in the Projects view (client · cost code · date) and in front of the project name on the Departments view's person lines; hover a line to read the full text. Project names are shown as typed.

## v1.30.0 — Oct 2, 2026
- Project setup: the Team section's Lead fabricator is now Project lead — pick one person from any department (grouped by department), or leave it blank; the chart chip, the bar tooltip and the legend show L for the lead. Existing projects keep their lead.

## v1.29.0 — Oct 2, 2026
- Project setup: the Team lists are now alphabetical, each has a Search box that narrows the names as you type, people already checked stay at the top of their list, and the lists show about nine names before scrolling.

## v1.28.0 — Oct 2, 2026
- Report a bug or idea: the form now asks for a one-line Subject, which is what the Open Issues page shows, and clicking a report there unfolds its full text. Nothing is cut off at 80 characters any more.

## v1.27.0 — Oct 2, 2026
- Today (and the T key) now puts Monday of the current week at the left edge of the timeline, in every zoom, and the timeline opens that way too; the other jumps still centre their date.
- Days before today wear a light grey wash on the timeline, so the eye lands on today and the work ahead.

## v1.26.3 — Oct 2, 2026
- People page: each column keeps its own width when you resize another, long text is cut off with … (hover for the full value), and a wide table scrolls sideways inside the list instead of running under the record panel. Double-click a column edge to fit it; right-click the header for Reset widths.

## v1.26.2 — Oct 2, 2026
- Undo notifications no longer cover the chart: they sit below the bars (or at the top right of the date header), each one has a × to close it, several quick edits share one notification, and dragging a bar that is under one goes straight through.

## v1.26.1 — Oct 2, 2026
- Project page: clicking any empty part of the chart, including below the last row, now closes the phase panel, and anything you were typing in it is saved first. The panel's close control now reads Close × and is big enough to hit.

## v1.26.0 — Oct 1, 2026
- A project's install date now comes from its Installation block under Departments (or its Shipping block when Installation is not scheduled). The LATE tag, the Installs / Ships date and Days out in the project header, the date line on the chart, the PM late prompt, the Meeting Sheet and the Due date sort all follow it, so moving the install moves them too.
- Project setup: on a saved project the editable Install date is replaced by a read-only Created on (when the project was first saved). A new project asks for one Target install / ship date, which lays out the schedule and becomes the Installation (or Shipping) block.
- A project with neither Installation nor Shipping scheduled shows no install date and is never marked late.

## v1.25.2 — Oct 1, 2026
- Project setup: Installation and Shipping dates now stay exactly as you type them, weekends and holidays included, and their day count is calendar days.
- Project setup: when a shop department date lands on a weekend or holiday it still moves to a workday, but a note under the field now says why, and the start can no longer end up after the end.

## v1.25.1 — Sep 30, 2026
- Open Issues: the reply toggle under a report now reads "developer comments".

## v1.25.0 — Sep 30, 2026
- Open Issues: replies from the team now show under a report. Click "1 reply from the team" to read them, and the person who filed the report gets the reply by email with a link straight to it.

## v1.24.0 — Sep 27, 2026
- Easier to read: the grey helper text across the app (hints, section labels, empty-state notes, dates and codes in panels) is darker, and the boxes around form fields are clearer. Colours on the schedule itself are unchanged.

## v1.23.0 — Sep 15, 2026
- People page: a Freelance checkbox in the editor marks people with no set weekly schedule. It greys out the day and hour controls, and the Schedule column reads "Freelance".

## v1.22.0 — Sep 15, 2026
- People page: each person can carry a weekly schedule. Tick the days and pick or type the hours (half-hour steps) in the editor; it reads as "M-F 9-6" or "T-W-Th 11-4" in a new Schedule column after Status and on the record.

## v1.21.2 — Sep 9, 2026
- The Changelog no longer prints the full text of a phase's notes. A notes change now reads as added, edited or cleared; older entries fold the same way.

## v1.21.1 — Sep 9, 2026
- The project-page tour has a new step on the calendar legend: how a phase steps from a slim strip to its title to its subtasks, and how to show milestone and note text.

## v1.21.0 — Sep 9, 2026
- Project calendar: phases start as slim colour strips and milestones as bare diamonds, so a fully stacked job fits its weeks again. Click a phase in the legend to step it up to a titled bar, then to its subtasks; click Milestone or Note to show their text. Collapse all resets.

## v1.20.9 — Sep 8, 2026
- My Dashboard: subtasks show their own name on the bar, in the sidebar list and in the hover card, not just the project.
- Project page crew picker shows nicknames like everywhere else.

## v1.20.8 — Sep 8, 2026

- A project cannot be created without a Project Manager. Create now asks for one under Team, the same way it asks for a name and an install date.
- My Dashboard lists every milestone, working-on bar, time-off entry and note. Long lists scroll inside their column instead of stopping at "+N more".
- Leaving a New Project page you have not touched no longer asks whether to discard it.

## v1.20.7 — Sep 4, 2026

- The Report a bug or idea page has a third column: resolved reports, newest first, so you can see what has already been dealt with.

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

- The undo/redo arrows are now custom-designed arrows.
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
