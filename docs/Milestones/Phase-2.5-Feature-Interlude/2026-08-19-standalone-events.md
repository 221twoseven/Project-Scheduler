# Standalone events (TODO §3 item 2) — REV54

**What changed.** Events used to be stored *on* a Gantt phase (a `ticketNodes` entry on
the phase's SharePoint row). That meant an event couldn't exist without a phase, and
deleting a phase silently deleted its events. Events are now rows of their own in a new
`ShopTimeline_Events` list:

- Creating an event no longer needs a host phase — the "Add a department first" wall is
  gone (when the list exists).
- Renames, date changes, and deletes edit the event's own row.
- **Deleting a phase rescues its old-style hosted events** into the Events list instead
  of losing them.
- Deleting a project removes its events with it.
- The new-project draft files its events as rows on save.

**Graceful fallback.** The list is optional, like `ShopTimeline_Tasks2`: until it exists
on the site the app behaves exactly as before (events save on a host phase). Nothing is
ever browser-local for events. Creating the list is a one-time owner action — column
recipe in `docs/SETUP.md`.

**Why the new list is safe.** It is purely additive shared-infrastructure: no existing
List or column changed, and the colleague app never reads `ShopTimeline_Events`.
Owner approved 2026-08-19. One consequence to know: events created after the list exists
are **not visible in the colleague app** (which only knows phase-hosted `ticketNodes`).
Old events stay where they are — both stores render side by side — so nothing vanishes
from either app.

**Known ceilings.**

- Legacy phase-hosted events are not bulk-migrated (that would remove them from the
  colleague app's view). They move to the new list only at the moment their phase is
  deleted — the exact moment they'd otherwise die.
- The main-timeline task modal edits only a bar's own `ticketNodes`; standalone events
  are edited on the project page (Gantt markers, calendar, agenda).
- A department with several bars can draw the same standalone event diamond on each bar
  spanning its date (`barNodes`, marked with a `ponytail:` comment).

**Tests.** New `tests/test54.js` (27 assertions), asserted on the actual outgoing Graph
bodies: standalone create/rename/delete, phase-delete rescue, project-delete cleanup,
the draft path, and the no-list fallback. Harness gained `eventsList` /`data.events`
(defaults keep every older suite on the legacy behaviour). Full matrix 17/17 on
`index.html`; reference build suites all green (test54 skips there).

**App REV:** 54. **PR link:** [#15](https://github.com/221twoseven/Project-Scheduler/pull/15).
