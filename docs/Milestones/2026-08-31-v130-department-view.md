# v1.3.0 — Department view (08-31 brief, objs 5 & 9)

**Date:** 2026-08-31 · **Version:** v1.3.0 (minor) · **Branch:** `development` → `/preview/`
**Objectives:** 08-31 brief objs 5 and 9 (TODO §3 items 19–20)

## What changed

1. **Phase click routes to the project page** (obj 5). In the Departments lens,
   clicking a phase bar now takes you to that project's edit page instead of
   opening the edit-details modal — the page's inspector is the richer edit
   surface. The Projects lens keeps the modal exactly as before (the §6 click
   hierarchy in Design-Language records the exception).
2. **Lane rows carry more** (obj 9). Each person's row in the Departments lens
   now reads name over department (the same two-line pattern project rows use),
   and the right side — where the department name used to sit — lists that
   lane's assignments: project name + dates, current work first, capped to what
   the row height fits with a "+N more" tail.

## Why it mattered

Both were owner asks from the 2026-08-31 brief: the modal was a dead end compared
to the project page, and the sidebar's right side was spending its space repeating
the section heading instead of answering "what is this person on, and when."

## Evidence & tests

- New suite `tests/test-v130.js` (12 checks): two-line lane identity, assignment
  lines with project + dates, current-first ordering, dept-lens click routes to
  `#/project/<id>` with no modal, Projects-lens click still opens the modal on
  the timeline route.
- Full suite green before push (`npm test` + `npm run test:ref`).

## Ceilings / follow-ups (ledgered in TODO §7)

- The clicked phase is not preselected on arrival at the project page — that
  needs a cross-route handoff; add if PMs miss it.
- Assignment lines clip to the row height ("+N more") — the tail is only
  reachable by switching density.
