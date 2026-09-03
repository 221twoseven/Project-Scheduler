# v1.18.3 — Child-first deletes (no more orphaned phases)

**Date:** 2026-09-02 (late evening) · **Version:** v1.18.3 · **Suite:** `tests/test-v1183.js` (6)

## What happened

The owner found a phantom "TBD" lane in the Departments lens the night before the
live demo: a green bar labeled "?" that answered every click with "That project no
longer exists." It was an orphaned row in `ShopTimeline_Tasks` — a phase whose
parent project had been deleted, whose stored crew string was literally "TBD"
(the dept lens builds a lane for any crew name it finds, so the orphan invented
one). Cleaned up live with a one-line console `saveState` filter.

## Root cause

`spSync` planned its per-record jobs projects-first, so deleting a project queued
the **project-row DELETE before its task-row DELETEs**. Any death mid-queue — a
closed tab, a network drop, throttling past the single retry — deleted the project
and stranded its children. Orphans only render in the Departments lens (it iterates
tasks; the Projects lens iterates projects), which is exactly where it surfaced.

## The fix

DELETEs now run **after every upsert, children before the project** (task/todo/event
rows first, project row last). A mid-queue death now leaves a visibly incomplete
project the user simply re-deletes — never an invisible orphan. Upsert order is
unchanged (projects still POST before their tasks, so other pollers never see a
task without its project on create).

## Known ceiling

The shared Lists have other writers (the colleague app, hand edits in SharePoint),
so an orphan can still arrive from outside this app. That is why the visibility
filter deliberately **keeps** rendering tasks whose project is missing
(`visTasks`' `!p||` branch): an orphan shows up as an odd lane instead of silently
rotting in the list. Ledgered in TODO §7.
