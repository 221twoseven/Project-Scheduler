# Calendar create menu + parity (REV53)

**Date:** 2026-08-19 · **PR:** pending (ships with the next `development` → `main`
promotion) · **App REV:** 53

## What changed

The Gantt view grew a create menu, selection, and keyboard control over REV48–50; the
calendar view had none of it — it was a picture you could look at but not touch. REV53
makes the calendar a live surface with the same verbs:

- **Right-click (or left-click) an empty day cell** opens the same create menu the
  Gantt has, seeded with that cell's date: New event, New task, Add a department.
- **Right-click a phase band** opens the bar menu (Rename / Add subtask / Add event /
  Add task, plus Duplicate / Delete on a saved project) and selects the phase.
- **Click a phase band** selects it into the inspector on a saved project, or opens the
  draft popover on the new-project page — the same split the Gantt bars have.
- **Selection ring and keyboard** carry over: the selected phase is ringed on its
  calendar bands (one ring per week the phase crosses), and the existing keys
  (E / T / S, arrows to walk the selection, Del, Esc) work in calendar mode.

## How it hits-tests

The calendar has no linear day axis to do arithmetic against — weeks stack and month
headers interleave. Instead of coordinate math, every day cell now carries its own
date (`data-d`) and phase bands carry their task index (`data-i`); a click resolves to
whatever cell or band it landed on (`npvCalHit`). This also means the behaviour is
testable in jsdom, which has no layout.

## Tested

- New suite `tests/test53.js` — 38 assertions, both the saved-project page and the
  new-project draft (the REV49 lesson). Skips cleanly on the frozen REV50 reference.
- Full matrix green: 16/16 suites on `index.html`, 16/16 on the reference.
- Not yet eyeballed in a real signed-in browser — needs the usual `/preview/` pass
  after this lands on `development`.

## Known ceiling / follow-up

- Calendar **event/task bands stay inert** (no drag, no click-to-rename). The Gantt
  remains the surface that edits markers; the calendar's create menu can make them.
- Phase bands are ~16px tall — under the 24px hit-target line in Design-Language §9.
  Same class of ceiling as the deferred 12px resize handles; widen if people miss.
- The calendar's empty state ("Nothing scheduled yet.") offers no create menu — a
  project with zero bars must start from the Gantt or the departments panel.
