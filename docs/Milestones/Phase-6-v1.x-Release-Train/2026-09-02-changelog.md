# 2026-09-02 — The change log (v1.19.0, §3 item 26)

**What changed:** the app now keeps a history of project edits. Every save that
actually lands on SharePoint also writes one row per changed record to the
`ShopTimeline_Changelog` list (created by the owner 2026-08-31): who made the change,
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

**Retention (added 2026-10-15, TODO item 20):** nothing is ever trimmed or archived; the
list grows for as long as the app runs, and there's no export button (an admin can
export `ShopTimeline_Changelog` to Excel from SharePoint). Opening either view reads the
**whole list**, in pages, then caches it for one minute. The screens show the latest
**500** entries (Company Data) or **300** for one project; older rows stay on the list,
but only SharePoint shows them. Since v1.48.1 a "Schedule still accurate" confirmation
isn't logged either: it's a stamp, not an edit. If the list grows large enough that
opening the log slows down, the fix is a date-bounded read; nothing needs it yet.

**Recovery: the log is evidence, not a restore tool.** Nothing in the app rebuilds a
record from the log. To get something back:

- **Within the session:** Undo (Ctrl+Z) steps back through your own last **20** project
  edits. It covers projects, phases, milestones and notes, not people, clients or
  settings. It's lost on reload, and it clears when a teammate's edit arrives by poll.
- **A deleted row:** SharePoint's **Recycle Bin** on the TWOSEVENINC site, then the
  site-collection Recycle Bin (93 days in total by default).
- **An edited row:** the list item's **Version history** in SharePoint, which can
  restore an earlier version. This works if versioning is on for that list; it's on by
  default for new lists, but nobody has confirmed it for the nine `ShopTimeline_*` lists
  (List settings ▸ Versioning settings). That check belongs with backups, item 15.
- **The log tells you what to restore:** who changed what, when, and the old value of
  each field.

**Evidence:** suite `tests/test-v1190.js` (16 assertions on the outgoing Graph
rows and both surfaces, jsdom); verified live in a browser against a stubbed
preview — dock swap, per-project filtering, global filter, and the exact row an
edit produces.

**App version:** v1.19.0, on `development`.
