# Timeline tests

Carry this folder into every new chat. The sandbox disk is wiped between conversations.

## Run

    npm install jsdom
    for t in test46 test47 test48 test49 test-label; do node $t.js ../Timeline_49.html; done

## What's here

- `harness.js` — boots a Timeline HTML file in jsdom with MSAL and `fetch` stubbed.
  `boot(file, {data:{projects,tasks,staff,todos}, todosList:false})`.
  Set `todosList:true` to simulate ShopTimeline_Tasks2 existing.
  Records every Graph request on `window.__spCalls`, so persistence can be asserted on
  the actual outgoing body rather than on internal state.
- `test49.js` — 78 assertions. The dashboard: inspector replacing the tabs, the meta
  strip, selection driving the pane, right-click on bars / summaries / gutters, undo
  toasts, the keyboard, Escape layering, the agenda.
- `test48.js` — 57 assertions. The canvas create menu: hit-testing, both triggers,
  each create action, dept-less events, drag-vs-click, calendar-mode suppression.
- `test47.js` — 38 assertions. Subtask hierarchy: row plan, expand/collapse, summary
  span, linked parent drag, the Link toggle.
- `test46.js` — 38 assertions. The REV46 bug fixes plus the invariants the original
  suites guarded: geometry constants vs stylesheet, status migration, scheduler purity,
  PM in `NPV_ALL` not `NPV_TASKS`.
- `test-label.js` — 14 assertions. Named subtasks round-tripping through Graph.

- `test50.js` — 51 assertions. One per issue reported against REV49, each verified on the
  page it was reported on (the new-project draft): meta entities, the departments panel,
  the hotkey focus rule, event default dates, yellow diamonds, marker drag and
  click-to-rename, draft subtasks, draft menus, menu overflow, and the end-to-end create.

276 assertions total.

## The REV49 lesson

REV49 shipped with 225 passing tests and was broken on arrival, because every suite
exercised the SAVED-project page and dispatched keys from the document. The new-project
draft — the first page anyone sees — was untested, and jsdom's document-dispatched keys
have no target, which hid the focus bug that killed every hotkey in a real browser.
Rules going forward: every feature gets asserted on BOTH the draft and the saved page,
and keyboard tests dispatch from the focused element (`keyOn` in test50.js), not the
document.

## Expected

    node test46.js ../Timeline_45.html   ->  10 failures (the originally reported bugs)
    everything against ../Timeline_49.html -> 0 failures

## When a suite fails after an intentional change

These assert behaviour, not implementation. If a surface is retired on purpose — as the
bar popover and the four bottom tabs were in REV49 — update the assertion to the new
surface rather than keeping the old one alive. Do not delete the assertion; the
behaviour it guards usually still exists somewhere else.
