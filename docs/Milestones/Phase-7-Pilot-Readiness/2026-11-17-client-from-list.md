# A project's client comes from the Clients list — v1.53.0 (2026-11-17)

**TODO item 81** (owner, 2026-11-17). PR #189.

## What changed and why

The project's Client field was a text box with suggestions from the Clients list, so anything
typed was saved. Item 28's first backfill dry run found projects whose client wasn't on Clients
at all, or was spelled differently from it ("Van Cleef and Arpels", "VCA", "Grillo's").

The suggestions also only showed names containing what was already typed. On a project whose
client wasn't on the list, the arrow showed nothing (owner, reassigning VCA Spring 2027).

v1.53.0 makes the field a dropdown on both the saved project page and the New Project draft:

- every client on the Clients list, A–Z, with its cost-code alias beside the name
  ("Van Cleef & Arpels · VCA"), and "Pick a client" first;
- no typing, so a client can't be misspelled or entered twice under two names;
- a new client is added on the Clients page first. The product that owns the data creates
  it (Systems, TODO §1).

A project whose stored client isn't on the list keeps it selected, with a note underneath in
the owner's wording: "“Van Cleef and Arpels” isn’t on the Clients list. Pick one from the
list, or add it on the Clients page first." Picking a client replaces it. A stored name that
differs only in case selects the list's entry.

**Before:** `screenshots/before-client-from-list.png` (the typed box)
**After:** `screenshots/after-client-from-list.png` (the dropdown and the note)

## Known limits

- A long client list scrolls in the browser's own dropdown. Typing a letter jumps to it
  rather than filtering. That's the native control; a search-as-you-type picker would be
  new UI.
- With no client list at all (the Clients list unreachable and nothing cached in the
  browser), the field stays typed, since there's nothing to pick from.
- Clearing a client means picking "Pick a client".

## Checks

`tests/test-v1530.js`: the dropdown and its order, the stored off-list client and its note,
picking saves the list's spelling, a case-only difference, the draft's Create, and the no-list
fallback. `tests/test69.js`'s type-ahead assertions now assert the dropdown.
