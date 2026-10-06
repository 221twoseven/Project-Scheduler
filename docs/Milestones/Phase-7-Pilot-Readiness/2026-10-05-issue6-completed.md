# 2026-10-05 — Completed projects: Active / Completed / All, and a Completed tag (v1.37.0)

**Date:** 2026-10-05 · **App version:** v1.37.0 · **Where:** `index.html`, `design/Style-Guide.md`,
`docs/TODO.md` item 37 · **PR:** feat/issue6-completed (tracker #6)

## What changed

1. **The dashboard opens on Active.** A three-way switch — **Active / Completed / All** — sits on
   the second row of the sidebar header. Active hides Complete projects (everything else shows),
   Completed shows only them, All shows everything. It is not a new mechanism: the three buttons
   are presets of the Status filter that already lived in the Filters menu, so the Meeting Sheet,
   print, both lenses, grouping and My Dashboard follow it for free. A hand-picked status set in
   the Filters menu still works and still shows as a filter chip; the switch reads back whichever
   preset the set matches (Active when Complete is unticked).
2. **The choice is remembered per person** in the browser's saved UI state. Everyone opens on
   Active once after this version (older saved states are dropped the first time), then their
   own choice sticks.
3. **A completed row is marked.** In Completed or All, the row's name turns muted and a small grey
   **Completed** tag sits on the line under the name, in front of the job code and date. Not red,
   no strike-through (the reporter's own advice). The tag takes the client's place on that line
   — the 300 px sidebar cannot hold tag + client + code + date — so a completed row reads
   `Completed P3 · Sep 18`; the client is still on the project page and in the Client sort.
4. **Reopening a job** is just changing its status on the project page; it is back under Active
   on the next render.
5. **Clear filters** (toolbar, chip ×) keeps the switch where it is; **Show everything** in the
   Filters menu means the All preset. When Active hides every project the empty state now says
   so and points at the switch instead of at Clear filters.

## Why it mattered

Tracker #6 (Hubert, 2026-09-24): completed jobs stayed in the main view with no sign they were
done, cluttering the board; they must still be reachable for revisions, closeout, storage and
billing.

## Evidence

`screenshots/before-issue6-completed.png` (v1.34.0: two completed jobs in the list, unmarked) ·
`screenshots/after-issue6-completed-active.png` (opens on Active) ·
`screenshots/after-issue6-completed.png` (All: muted rows with the tag) ·
`screenshots/after-issue6-completed-completed.png` (Completed only).

## Follow-up

`tests/test-v1370.js`. `test-v4-views` and `test-c3-status` were updated for the new boot default
(gated on the feature, so the reference build still runs the old assertion). Items 10–11 (closeout
is not the same as Complete) are unchanged.
