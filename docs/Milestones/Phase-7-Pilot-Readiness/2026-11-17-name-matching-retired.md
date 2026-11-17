# Names stop being guessed; the People merge moves records by ID — v1.55.0 (2026-11-17)

**TODO item 28 (b)**, the second half of stable IDs. PR #198. The first half is
`2026-11-11-stable-ids.md` (v1.52.0).

## What changed and why

Before stable IDs, the app matched people by name. Old records stored short forms ("Sam S.",
a bare first name) while the pickers wrote full names. So since v1.6.5 a helper,
`canonName`, guessed which person a short form meant every time the app compared two names.
A console tool, `scrubLegacyNames`, rewrote the stored short forms using the same guesses.

v1.52.0 gave every project, phase and note a `refs` column, and the owner's backfill
(2026-11-17) linked 99 records. Each name now says which person it means, and the app reads
it as that person's current name when it loads. That makes the guessing redundant, so v1.55.0
removes it:

- **`canonName` is gone.** Names compare as they're stored. A linked short form still
  reads as the full name, through its ref. Departments view lanes, the person filter, the
  overbooking check and the project editor's boxes all behave as before (`test-v165` now
  proves this through refs).
- **`scrubLegacyNames` is gone.** Its job is done by refs. `scrubNames` stays, as a
  console tool for one-off renames.
- **New refs link only an exact name**, ignoring case. A short form is never guessed. The
  `backfillRefs()` dry run lists it, so someone can name it on People.
- **The People merge moves records by ID.** It used to rewrite only names spelled exactly
  like the duplicate. Now it also moves every name linked to the duplicate, under any
  spelling, and the save links each one to the kept person. That matters when a page loaded
  while the duplicate was already off the roster: those records showed their stored
  spelling, and the old merge missed them.

Nothing on screen changes for anyone. The one team-facing line is the merge.

## Known ceiling

A name with no ref and no exact match stays its own name, with its own lane in the
Departments view. Today that's the four bare "Daniel" fields (two Daniels on People; the
person who knows is away). `canonName` couldn't resolve those either, because the name is
ambiguous. Once someone says which Daniel it is, merge or rename on People, then run
`backfillRefs(true)`.

## Checks

`tests/test-v1550.js`:

- the two helpers are gone;
- an unlinked short form stays as it is;
- the backfill links "sam jones" to Sam Jones and lists the short form;
- on the draft page, a new project's PM saves with a ref;
- the merge moves a record linked under an older spelling and saves the kept person's ID;
  an unlinked name that isn't the duplicate's stays put;
- on the saved project page, Project lead shows the kept person.

`test-v165`, `test-v172`, `test-v1100`, `test-v1181` and `test-v1483` drop or rewrite
their `canonName` checks.
