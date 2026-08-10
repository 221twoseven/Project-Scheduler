# Timeline — Handoff

Current build: **Timeline_50.html**, 5,881 lines, 276 passing tests across 6 suites.

## Start a new chat with these three things

1. **`Timeline_45.html`** — the build. Upload it, or put it in project knowledge.
2. **`Timeline-Tests.zip`** — the jsdom test suites. See the warning below.
3. **This document.**

### The tests will be lost unless you carry them over

The suites live on the sandbox disk, which is wiped between conversations. They are not in
project knowledge and they are not in the HTML. If you start a new chat without uploading the
zip, the regression tests disappear and the next session is flying blind on a 4,800-line file.

**The original 11 suites (630 tests) were lost in the move to the REV46 chat** — the zip
wasn't uploaded. What's in the current zip is a rebuild, smaller but written against the same
behaviours:

| Suite | Tests | Covers |
|---|---|---|
| `test46.js` | 35 | REV46 fixes + the old invariants: geometry constants vs stylesheet, status migration, scheduler purity, PM in `NPV_ALL` not `NPV_TASKS`, tint not wiping a draft |
| `test47.js` | 38 | Subtask hierarchy: row plan, expand/collapse, summary span, linked drag, Link toggle, marker placement |
| `test-label.js` | 12 | Named subtasks round-tripping through Graph, asserted on the actual request body |
| `test48.js` | 57 | Canvas create menu: hit-testing, both triggers, each create action, dept-less events, drag-vs-click, Escape, single binding |
| `test49.js` | 78 | The dashboard: inspector, meta strip, selection, right-click on bars/summaries/gutters, undo toasts, keyboard, Escape layering, agenda |
| `test50.js` | 51 | Every issue reported against REV49, verified on the new-project draft where they occurred |

`harness.js` boots any Timeline HTML in jsdom with MSAL and `fetch` stubbed, and records every
Graph call on `window.__spCalls` so persistence can be asserted rather than assumed.

To restore: upload the zip and ask for it to be unpacked. Each suite runs with
`node testNN.js ../Timeline_47.html`.

Also worth doing: the spec in project knowledge (`Timeline-Shop-Dashboard-Spec.md`) describes a
much older version and the project files there stop at Timeline_27. Both are stale enough to
mislead.

---

## What it is

Single-file HTML/JS Gantt and scheduling tool for Twoseven. Runs from GitHub Pages, embedded as a Teams tab. Talks to SharePoint through Microsoft Graph with MSAL auth.

- Pages: `https://peterskvarla-sys.github.io/shop-timeline/`
- Site: `https://twosevennet.sharepoint.com/sites/TWOSEVENINC`
- Azure app `shop-timeline-app`, App ID `5ba3aabe-81f7-41c9-92a4-83a45d5407ab`, Tenant `70aa5330-416f-48cb-a64f-1a89f0196577`
- Auth: local `msal-browser.min.js`, not a CDN

---

## Data model

Four SharePoint lists:

| List | Holds | Status |
|---|---|---|
| `ShopTimeline_Projects` | Projects | live |
| `ShopTimeline_Tasks` | Phases — the Gantt bars | live, `label` column present |
| `ShopTimeline_Staff` | Roster | live |
| `ShopTimeline_Tasks2` | Tasks — Planner-style to-dos | **not created yet** |

Schema status:

- **`label` on `ShopTimeline_Tasks` EXISTS** and has for a while. An earlier version of this
  document listed it as outstanding; that was wrong and got repeated. Verified by
  `test-label.js`, which asserts the outgoing PATCH body actually carries the name. Subtask
  names persist. **Do not re-flag this.**
- **`ShopTimeline_Tasks2` — status unverified.** Previously recorded as missing. Given the
  `label` mistake, confirm before repeating it: check Site Contents, or add a task and reload.
  If it's absent the app degrades gracefully, warns once on save, and needs no code change when
  it appears. If it's present, `TODOS_OK` flips true on its own and tasks start persisting.

**Lesson: check the round-trip in code before reporting a schema gap.** The mapping functions
`taskToFields` / `fieldsToTask` are the ground truth for what the app reads and writes.

In code the entities are `ST.projects`, `ST.tasks` (phases), `ST.todos` (tasks), and `PEOPLE`/`STAFF`.

**Vocabulary trap:** a "task" in `ShopTimeline_Tasks` is a Gantt bar. A "task" in the UI is a to-do. They're different things sharing a word. Phases are bars; tasks are to-dos; events are dated markers stored as `ticketNodes` on a phase.

### Departments and groups

8 groups: Project Management, Technical Design, Digital Fabrication, Main Shop Fab, Metal Shop, **Unit 7**, Finishing, Installation.

Unit 7 holds Soft Goods, Vinyl Application, Electrical, Other (Unit 7). It runs parallel to Main Shop Fab and Metal Shop in the scheduler chain. Soft Goods and Electrical kept their original ids when they moved into it, so existing rows carried over.

### Statuses

`forecast, estimating, in-design, in-fabrication, on-hold, complete`

Retired statuses fold in on load via `STATUS_MIGRATE`: approved / in-production / installing → in-fabrication; invoiced / called-off → complete. `projectStatus()` maps on read too, so a stale value from an unrefreshed browser still renders.

Forecast renders grey.

---

## Architecture

One file, no build step. Roughly:

- Constants and state → SharePoint layer → scheduler → row building → Gantt render → sidebar → project page → modals → keyboard → init

**Scheduler** runs backward from the install date through a phase chain, skipping weekends and holidays. `generateSchedule()` is pure — it takes a draft project and returns tasks without touching state, which is what makes the live preview possible.

**Routing** is hash-based. `#/` is the timeline, `#/project/<id>` a project, `#/project/new` a new one. So a project has its own URL you can paste into Teams.

**The project page** is the dashboard, rebuilt in REV49. Title, then a meta strip of
numbers, then chart and inspector side by side and full height. **Selection drives the
inspector**: nothing selected shows the project (Setup / Team / Departments / Agenda as
folding sections); a bar selected shows that phase. There are no tabs and no bar popover —
both said the same thing as the inspector, one of them on top of the chart you were reading.
Existing projects autosave; only new ones have a Create button. Escape unwinds one layer at
a time: shortcut sheet, menu, popover, selection, page.

**Right-click is the primary verb.** Bar, summary bar, row gutter, empty canvas, empty space
below the rows — each has its own menu, each item shows its keyboard shortcut. Left-click on
empty canvas opens the same menu, but only when nothing else is open.

**Undo is visible.** Every mutating action toasts with an Undo button (`toastU`). The
loudest complaint about every Gantt tool in the research was the accidental drag or delete,
and an undo you have to know a shortcut for is not one.

**Draft vs live is the recurring seam.** A new project (`#/project/new`) draws scheduler
output; nothing is in `ST` until Create. A saved project draws `ST`. Every surface — click,
menus, agenda, keyboard, markers — must branch on `NPV_LIVE`, and every REV49 field report
traced to a surface that only handled one side. Test both, always.

**Two task arrays.** `NPV_ALL` is everything the scheduler produced. `NPV_TASKS` is what gets drawn. Project Management is in the first and not the second — it's saved but never drawn, because a bar spanning the whole job says nothing the summary row doesn't. Create must file `NPV_ALL`, not `NPV_TASKS`.

**Draft state.** While creating, `PP_FORM` holds every field, and `ppProject()` returns it. Only one tab is mounted at a time, so anything reading the DOM for a field on another tab will get null. This bit repeatedly.

---

## How work has been done

- Changes go in as **Python patch scripts** using string replacement with `assert s.count(a)==1` guards, so a moved anchor fails loudly instead of silently patching the wrong place.
- Every build is syntax-checked with Node, then run against every suite.
- Output is a versioned single file. `APP_REV` is bumped in one place and appears everywhere the version shows.
- Tests are jsdom, stubbing MSAL and `fetch`. They assert behaviour, not implementation, and get updated deliberately when behaviour changes on purpose.

---

## Traps worth knowing

**Splicing between two anchors swallows what's in between.** Replacing a region from function A to function B twice removed unrelated helpers that happened to live between them. Both times the tests caught it immediately. Prefer narrow anchors.

**Version-bump `sed` across test files is dangerous.** The pattern `=== 40` also rewrote `=== 406` into `=== 416` inside unrelated assertions, and three suites started failing on arithmetic that couldn't fail. Bump only the specific lines.

**JS constants that mirror CSS values drift.** `NPV_GUT` and `NPV_ROWH` must match `.npv-gut` width and `.npv-row` height. A mismatch put every bar underneath the sticky gutter. There's now a test that reads both values and fails if they diverge.

**`ev.target` isn't always an element.** Programmatic events target the document, which has no `.matches()` or `.closest()`. This surfaced twice.

**`grid-row: 1 / -1` collapses when rows are implicit.** `-1` counts from the end of the explicit grid. Calendar columns silently shrank to one row.

**`render()` on the project page re-enters `renderProjectPage`**, which resets an unsaved draft. Anything calling `render()` while that page is open needs a guard.

**Writers and readers can drift apart silently.** The Add buttons wrote to `NPV_EVENTS` /
`NPV_TODOS` while the saved-project code path read `ST`. Nothing errored; the row simply
vanished. When a surface has a draft mode and a live mode, test both.

**`JSON.stringify` comparisons break when the two objects have different key sets.** The poll
compared a three-key object against a two-key one, so it never matched and clobbered state
every 45 seconds.

**Row index is not task index once rows can nest.** Markers, the reorder drop indicator and
hit-testing all assumed one row per task. They read `NPV_PLAN` now.

**A stale handoff doc is worse than no handoff doc.** The `label` column was listed as missing
long after it existed, and that claim got repeated across sessions. Anything in this file that
asserts a state of the world outside the code should be re-verified, not quoted.

---

## Open items

- `ShopTimeline_Tasks2` list — confirm whether it exists before treating it as a gap
- **Calendar create menu.** The Gantt has one as of REV48; the Calendar doesn't. It needs its
  own hit-testing — week bands, not a linear day axis.
- **Standalone events, properly.** REV48 gave a `ticketNode` its own `dept` field, so an event
  renders where it was put and a dept-less one lands on the "Not on a phase" row. It still
  *saves* on a host phase. Deleting that phase takes its events with it. A real fix is either a
  nullable phase reference or an events list of its own.
- **Calendar parity.** The Gantt has the create menu, selection, and the keyboard. The
  Calendar has none of it — it needs its own hit-testing against week bands.
- **`NPV_LINES` still drives phase splitting on the new-project draft.** The saved-project
  path now creates subtasks directly. Those two want to converge.
- **Dependencies.** Nothing links a bar to the one before it except the scheduler chain.
  Research says this is where Gantt tools lose people; worth deciding whether to have them
  at all rather than half-having them.
- Dash view — the per-person dashboard, third lens beside Projects and Departments. Designed, not built. Needs the identity chain: signed-in email → `Staff.email`, falling back to display-name match, falling back to a person picker remembered in that browser.
- `email` and `role` columns on `ShopTimeline_Staff`
- Shared shop-terminal account, and whether it needs a paid licence
- Whether the phase modal retires — it's bypassed on the project page but still reachable from the main timeline
- Department overlap: resizing can't create it because the scheduler chains strictly. Only hand-pinning can, and a pinned bar stops tracking. Open question whether overlap should be a per-department setting the scheduler honours.
- Calendar shows no today marker when a job hasn't started, deliberately — stretching back to today added a dozen blank week rows
- 2FA still not enabled on the GitHub account
- Repo transfer from personal account to a Twoseven org
- Teams/GitHub Pages caching — check `REV` in a private window at the raw Pages URL

---

## Version history, 34 to 45

| Rev | What landed |
|---|---|
| 35 | Project page replacing the modal; hash routing; inline phase editing |
| 36 | Project labels park at the today line |
| 37 | Split create page with a live draggable schedule preview |
| 38 | Row order fixed top-to-bottom; departments reorderable and the order saved |
| 39 | Clear all; opens collapsed; today at left; events and tasks; calendar mode; drag headroom |
| 40 | Label parking extended to phase bars and the Departments lens; diamond dodging |
| 41 | Five statuses; Unit 7; `label` column and named phases; calendar in the in-house format; legends |
| 42 | Configurator rebuild — tabs, full-width chart, autosave, bar popover, Esc |
| 43 | Forecast status; PM out of the charts; tint toggle; square calendar cells |
| 44 | Sort group headers by client, PM, status |
| 45 | Calendar column collapse fixed; tint no longer wipes drafts |
| 46 | Four bug fixes: project-page drags commit instead of snapping back; events and tasks on a saved project write through to `ST` instead of the draft arrays; tint painted on the project-page Gantt, not just the calendar; the 45s poll no longer replaces state every tick. `redirectUri` restored to the full-path form |
| 50 | REV49's field reports, all reproduced and fixed. Hotkeys: touching the canvas releases input focus (focus lived in a field constantly, so the typing guard ate every key). Events: always created dated, yellow diamond with black outline, name chip beside it, draggable to a new date, click to rename in place. Draft mode: subtasks split the bar immediately, clicking a draft bar opens the legacy popover (its bars aren't in ST for the inspector), agenda edit/delete work on drafts. Departments panel rebuilt compact for the 330px pane. Menus cap height/width and scroll. Meta strip em-dash fixed |
| 49 | The dashboard. Tabs and bar popover retired in favour of a selection-driven inspector beside the chart; meta strip of project numbers; right-click menus on bars, summaries and gutters; visible Undo on every mutating action; keyboard (S/E/T/R/G/C/?/arrows/shift-arrows/Del); inline rename in the agenda; one agenda replacing two disagreeing lists |
| 48 | Subtask and summary bars back to full row height; right-click and left-click create menu on the Gantt canvas seeded with the clicked date and department; right-click a bar to edit it; add a department from the menu; events carry their own department; chart listeners bound once instead of once per render |
| 47 | Subtasks. A department with more than one bar draws a parent summary row with a disclosure triangle and count; the summary spans earliest start to latest end; dragging it shifts every subtask by the same days in one save; Link toggle turns that off. Subtasks inside a department now sort by start date rather than assignee name |
