# Saved views follow the person — v1.46.0 (2026-10-12)

**TODO item 25** (owner ruling 2026-09-24). PR #132.

## What changed

Saved views (Views menu: save, rename, delete, the ★ launch view) used to live in one
browser. They now live on the signed-in person's own row of `ShopTimeline_Staff`, in the
new `savedViews` column the owner added on 2026-10-12. Sign in on another computer and the
same views are there; the starred one opens on the first visit.

- **The move-up:** the first time someone opens the app after the release, the views in
  their browser are copied to their row. After that the row wins, and the browser copy is
  only a cache.
- **Writes touch one column of one row:** a PATCH of `savedViews` on the user's own row.
  It never goes through the People-page save, so an admin editing someone's row can't put
  back an old copy of their views.
- **No column, no change:** if the column is missing, the first write fails (400) and views
  stay in the browser, exactly as before. The menu note says which applies ("Your views
  follow you…" or "Views live in this browser only").
- **Shared shop computers:** the browser remembers whose views it holds. When someone else
  signs in, the last person's views are never copied to their row, and never shown to them.
  A browser copy from before this release has no owner, so it goes to the first person who
  signs in after the release.
- **The format** is JSON `{views:[…]}`, so other per-user settings (Protect dates, item 2
  (c); density) can join it without a new column.

## Limits and follow-ups

- Views reach another open computer on the staff poll (every other 90-second tick). The
  menu picks them up the next time it opens.
- Two computers saving views in the same minute: the last save wins (whole-list write).
- Item 2 (c), remembering Protect dates per user, no longer waits on this.
- Tests: `tests/test-v1460.js`.
