# The dead columns, step 1: the app stops using them — v1.51.2 (2026-10-19)

**TODO item 29** (owner, 2026-10-19: "let's continue to clean up as we go"). PR #176.

## What changed and why

Three SharePoint columns held nothing the app used. They were kept only for the colleague app,
which no longer constrains the schema (D2, lifted 2026-09-24):

- `metalFab` on `ShopTimeline_Projects`, a legacy crew field from before the four role columns;
- `labels` and `checklist` on `ShopTimeline_Tasks2` (the to-dos), always written as `[]`.

v1.51.2 no longer reads, writes or searches them. Nothing changes on screen.

A column can't be deleted while a running build still sends it: SharePoint rejects the whole
save (a 400). So the app stops first, and the columns go a release later.

## Step 2 (the owner)

Once v1.51.2 is on `main`:

1. Set `update.minVersion` to `1.51.2` (Help ▸ App settings ▸ "Ask everyone to reload"), so
   tabs still open on an older build reload.
2. Wait a working day. A tab on a laptop that was asleep reloads when it wakes. A tab still
   on v1.51.1 when the columns go can't save: SharePoint rejects the save, the app won't
   reload over the failed save, and the change is lost when the person reloads.
3. Export `ShopTimeline_Projects` and `ShopTimeline_Tasks2` to CSV. A deleted column can't be
   restored, and nothing backs the lists up yet (item 15).
4. On `ShopTimeline_Projects`, sort by `metalFab`. A row with a value holds old crew text:
   copy it into that project's Fabricators first, or tell Claude.
5. Delete `metalFab` from `ShopTimeline_Projects`, and `labels` and `checklist` from
   `ShopTimeline_Tasks2`.

**What it breaks:** nothing in Timeline. The colleague app, unused, would lose those fields
(accepted, D2). **Rollback:** before step 2, ship v1.51.1 again. After it, re-create the
columns; their old values are gone, but nothing read them.

## Checks

`tests/test-v1512.js`: a loaded project carries no `metalFab`; real project and to-do saves send
none of the three; search and the name scrub no longer read `metalFab`.
