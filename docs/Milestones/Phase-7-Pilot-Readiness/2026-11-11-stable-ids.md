# Stable IDs, part (a): every record remembers who its names mean — v1.52.0 (2026-11-11)

**TODO item 28 (a)**, decision D10 (ruled for the SharePoint phase 2026-10-19, PR #177).
PR #186.

## What changed and why

Projects, phases and to-dos link to people and clients by **name only**. A phase assigned
to "Sam Smith" stores the text "Sam Smith". When someone is renamed on People, or a client
on Clients, every older record keeps the old name and loses the link. This is also why the
app carries name-matching helpers (`canonName`, the legacy-name scrub).

v1.52.0 keeps the names exactly as they are. It also stores, beside them, which person or
client each name means, in a new `refs` column on `ShopTimeline_Projects`,
`ShopTimeline_Tasks` and `ShopTimeline_Tasks2` (created by the owner 2026-11-11):

```
{"people":{"Sam Smith":"<Staff appId>"},"client":{"Acme":"<Clients item id>"}}
```

- **Reading:** on every load and poll, a name with a ref shows as that person's or
  client's *current* name. A rename on People or Clients reaches every linked project,
  phase and to-do right away, without writing to those records.
- **Saving:** every save writes the names as before, plus `refs`. The app checks once per
  session which lists have the column, so a list without it never sees the field.
- **Matching:** only an unambiguous match gets an ID. For people that's the existing
  `canonName` rule; for clients it's the exact name, ignoring case. A bare "Alex" with two
  Alexes on the roster gets no ID. Free-text departments (the "Other" rows) are labels, not
  people, and are skipped. The stamps (`createdBy`, `completedBy`, `updatedBy`,
  `confirmedBy`) stay plain names, as a record of who it was at the time.
- **Undo:** a rename that changes names on screen clears undo. An undo would otherwise
  write the old names back without their IDs.

## The backfill (the owner, next)

Records saved before v1.52.0 have no refs until they're saved again, so a rename doesn't
reach them yet. A one-time console tool links them all:

1. Once v1.52.0 is on `/preview/` (which uses the same lists), open it signed in and run
   `backfillRefs()` in the browser console. It's a dry run that writes nothing: it lists
   every name it can't match, and counts the records it would link.
2. Fix the unmatched names on People or Clients (add the person, or merge a duplicate), and
   run the dry run again.
3. Run `backfillRefs(true)` after hours. It writes the `refs` column only, never the rest
   of a record, so it can't overwrite an edit someone makes at the same moment. A record
   still stored under someone's old name keeps that name's ref beside the new ones.

## Known limits

- `refs` is JSON in a text column, so SharePoint can't filter or sort by it. At the D15
  database cutover it becomes the migration key (D10's target identity).
- A name with no match keeps working the old way, by name, until it's fixed and the
  backfill runs again.
- Part (b), once the dry run lists nothing: `canonName`'s matching and `scrubLegacyNames`
  retire, and the People merge repoints IDs instead of rewriting names.

**Rollback:** ship v1.51.3 again. The names were never changed, so the older build reads
everything as before; the `refs` column is simply ignored.

## Checks

`tests/test-v1520.js`: the probe, a renamed person and client read through refs, a gone
person keeps their name (and their ref gives way to a fresh match, so the dry run lists
them), refs stay out of the on-screen state, a poll reads exactly like the screen, the save body
on Projects, Tasks and the column-less Tasks2, an in-session rename on People and Clients
(no record writes, undo cleared), the backfill dry run and write (refs only), and both the
saved project page and the New Project draft.
