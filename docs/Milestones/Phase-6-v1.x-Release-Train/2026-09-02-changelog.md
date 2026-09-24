# 2026-09-02 — The change log (v1.19.0, §3 item 26)

**What changed:** the app now keeps a history of project edits. Every save that
actually lands on SharePoint also writes one row per changed record to the
`ShopTimeline_Changelog` list (created by Robert 2026-08-31): who made the change,
when, which fields, and each field's old → new value. Two admin-only places to read
it:

- **Company Data ▸ Changelog** — every change to every project, newest first, with
  a text filter (person, project, field, anything in the row).
- **The project edit page** — a new **Changelog** button in the footer swaps the
  edit panel for a second dock showing that project's changes only. Only one dock
  is on screen at a time (owner ruling 2026-08-31); **Back to editing** or Esc
  swaps back, and the dock collapses like the edit panel does.

**How the writing works:** the save queue's success path diffs the old and new
state and posts the rows fire-and-forget — a failed save logs nothing (its retry
logs the whole span once), and a failed log write never blocks or fails the save.
Save-stamp churn (`updatedBy`/`updatedAt`) and row reordering (`sortIndex`) are
not logged. Creating or deleting a whole project logs one row, not one per phase;
a bulk sweep past 20 rows collapses into a single summary row.

**What it doesn't cover (deliberate, ledgered in TODO §7):** staff, client and
app-settings edits ride other save paths and are not logged; reads are on-demand
with a short cache, never added to the 90-second poll; and nothing backfills edits
made before today — **history starts 2026-09-02**.

**Evidence:** suite `tests/test-v1190.js` (16 assertions on the outgoing Graph
rows and both surfaces, jsdom); verified live in a browser against a stubbed
preview — dock swap, per-project filtering, global filter, and the exact row an
edit produces.

**App version:** v1.19.0, on `development`.
