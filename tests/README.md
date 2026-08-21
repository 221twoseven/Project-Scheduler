# Timeline regression tests

jsdom suites that boot a Timeline HTML build with MSAL and `fetch` stubbed, and assert
behaviour on the actual outgoing Microsoft Graph requests rather than on internal state.
**20 suites — `npm test` prints the live per-suite totals.**

## Run

```bash
npm install                 # installs jsdom (from the repo root)
npm test                    # runs every suite against ../index.html
npm run test:ref            # runs every suite against ../reference/Timeline_50.html

# a single suite against any build (path relative to repo root):
node tests/run.js index.html
node tests/test50.js reference/Timeline_50.html
```

`tests/run.js` runs all suites and exits non-zero if any fail. Each `testNN.js` is also
a standalone process that takes the target HTML path as its first argument and exits
non-zero on failure.

## What's here

- `harness.js` — boots a Timeline HTML file in jsdom with MSAL and `fetch` stubbed.
  `boot(file, {data:{projects,tasks,staff,todos,events}, todosList:false, eventsList:false})`.
  Set `todosList:true` / `eventsList:true` to simulate the `ShopTimeline_Tasks2` /
  `ShopTimeline_Events` Lists existing. Records every Graph request on
  `window.__spCalls`, so persistence is asserted on the actual outgoing body rather
  than on internal state.
- `run.js` — runs all suites against one build and aggregates pass/fail.
- `test57.js` — 35 assertions. The project-page refinement batch (REV57, field notes
  N1–N16): status labels lose the "In", the orphan row reads "Events", the toolbar
  mutes on the project page, the status pill anchors in the schedule footer, the
  breadcrumb tail follows selection and unwinds it, department Start/End date fields
  commit bidirectionally with workday snap, right-click menus are add-only with an
  inline name field (Enter creates), the calendar collapses roster fan-out and filters
  to the selection, and a dirty unsaved draft asks before it is discarded.
  Skips on builds without the add-menu name field (the frozen reference).
- `test56.js` — 44 assertions. Project-page subtask hierarchy (REV56): the department's
  primary bar is the parent row (no synthetic summary bar, primary never re-listed as a
  subtask), subtasks in a lighter shade of the parent hue, linked/unlinked parent drag,
  parent resize independence, new subtasks born named/nested/half-length, the nested
  min/max clamp on drag and resize, parallel-subtask freedom, marker rows, draft parity.
  Skips on builds without the envelope track (the frozen reference).
- `test49.js` — 78 assertions. The dashboard: inspector replacing the tabs, the meta
  strip, selection driving the pane, right-click on bars / summaries / gutters, undo
  toasts, the keyboard, Escape layering, the agenda.
- `test48.js` — 57 assertions. The canvas create menu: hit-testing, both triggers, each
  create action, dept-less events, drag-vs-click, calendar-mode suppression.
- `test53.js` — 38 assertions. Calendar create menu + parity (REV53): cells resolve to
  dates without layout, the create menu on empty cells, the bar menu and selection on
  phase bands, keyboard in calendar mode, and the draft/saved split on band clicks.
  Skips on builds without `npvCalHit` (the frozen reference).
- `test54.js` — 27 assertions. Standalone events (REV54): with the Events list present,
  events are rows (create needs no host phase, rename/delete in place, asserted on the
  outgoing Graph bodies); deleting a phase rescues its hosted events; deleting a project
  removes its events; the draft page files events as rows; without the list, the legacy
  phase-hosted behaviour is untouched. Skips on builds without `ShopTimeline_Events`.
- `test55.js` — 17 assertions. Draft/saved subtask convergence (REV55): a draft
  subtask's manual placement survives rebuilds (it used to snap back), a rename carries
  the placement, same-named lines stay distinct via the split bar's embedded line id,
  Save files exactly the previewed rows, and the saved path still makes real rows.
  Skips on builds without the post-split overlay (the frozen reference).
- `test50.js` — 51 assertions. One per issue reported against REV49, each verified on the
  page it was reported on (the new-project draft): meta entities, the departments panel,
  the hotkey focus rule, event default dates, yellow diamonds, marker drag and
  click-to-rename, draft subtasks, draft menus, menu overflow, and the end-to-end create.
- `test47.js` — 38 assertions. The pre-REV56 subtask hierarchy: row plan,
  expand/collapse, summary span, linked parent drag, the Link toggle. Skips on REV56+
  builds (the summary-bar model it asserts is retired there — see `test56.js`); it
  keeps guarding the frozen reference.
- `test46.js` — 38 assertions. The REV46 bug fixes plus the invariants the original
  suites guarded: geometry constants vs stylesheet, status migration, scheduler purity,
  PM in `NPV_ALL` not `NPV_TASKS`.
- `test-label.js` — 14 assertions. Named subtasks round-tripping through Graph.

## The REV49 lesson

REV49 shipped with 225 passing tests and was broken on arrival, because every suite
exercised the SAVED-project page and dispatched keys from the document. The new-project
draft — the first page anyone sees — was untested, and jsdom's document-dispatched keys
have no target, which hid the focus bug that killed every hotkey in a real browser.
Rules going forward: every feature gets asserted on BOTH the draft and the saved page,
and keyboard tests dispatch from the focused element (`keyOn` in test50.js), not the
document.

## When a suite fails after an intentional change

These assert behaviour, not implementation. If a surface is retired on purpose — as the
bar popover and the four bottom tabs were in REV49 — update the assertion to the new
surface rather than keeping the old one alive. Do not delete the assertion; the
behaviour it guards usually still exists somewhere else.
