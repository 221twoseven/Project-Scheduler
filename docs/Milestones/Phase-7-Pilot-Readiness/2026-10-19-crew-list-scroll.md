# Ticking crew names keeps your place — v1.51.1 (2026-10-19)

**TODO item 66**, tracker #40 (Proceed 2026-10-19). PR #172.

## What changed and why

A user reported that ticking people onto a subtask or install was cumbersome. The list jumped
back to the top after every tick, and a tick sometimes didn't register. It was worst on install
subtasks, whose list is the whole staff.

Cause, measured in real Chrome with real mouse events:

- **The jump is the lost tick.** Every tick repaints the bar's popover and the panel below the
  chart with `innerHTML`. That builds a new crew list at scroll 0, and in the panel it also
  resets the section the list sits in (on a short dock you scroll that section to reach the
  list). Click two names one after the other and the second click lands where the list *was*.
  In the measurement it hit the panel's Phase dropdown, so the name never got ticked.
- **A poll during the press.** A background repaint of the page (poll, autosave) rebuilds the
  panel. If it lands while a name is held down, Chrome drops the click, even if the same node is
  put back.
- A click right after a tick is *not* lost on its own: the repaint runs inside the tick's change
  event, before the next press.

The fix:

- `crewHold`: the three painters (the popover, the panel, the page repaint) record the crew
  list's scroll before their `innerHTML` rewrite. They record the scroll of each box above it too,
  plus which name had focus. After the rewrite, the same phase's fresh list gets all of it back.
  It's the same save/restore pattern Company Data uses for its rows. Another phase's list opens
  at the top.
- A page repaint that arrives while a crew name is pressed (or Space is held on one) waits until
  just after the release. A right-click, a cancelled touch or leaving the window lets it through.
- The box stays 120px tall. The plan said 180px, but both lists carry `.ins-crew`, which sets
  120px. Size is unchanged.
- Plan step 2 (don't rebuild the box being clicked) is met by timing rather than by skipping the
  rebuild. The rebuild happens only after the click has fully landed, or waits. Skipping it
  would have left the panel's other fields bound to the phase as it was before the tick: on a
  draft, the manual-placement key includes the crew.

## Evidence

Headless Chrome via CDP, real mouse events, a fictional staff of 60, the install subtask, panel
list:

| | before (v1.51.0) | after (v1.51.1) |
|---|---|---|
| list scrollTop after ticking Crew 50 (was 122) | **0** | **122** |
| press Crew 51, page repaint, release | no click fired, not saved | saved; the repaint ran after |
| click Crew 41 then Crew 42, both aimed first | Crew 42 lost (2nd click hit the Phase dropdown) | both saved |

- [before-crew-list-scroll.png](screenshots/before-crew-list-scroll.png): the list is back at the
  top. Crew 41 and Crew 50 are ticked but out of sight; Crew 42 and Crew 51 were lost.
- [after-crew-list-scroll.png](screenshots/after-crew-list-scroll.png): the list stays where it
  was, with Crew 41, 42, 50 and 51 ticked.

## Tests

`tests/test-v1511.js` (84 checks; 37 of them fail on v1.51.0). It covers the draft and saved
pages, the popover and the panel, and an install subtask with the whole staff list:

- scroll, then tick: scrollTop unchanged (and the panel section's), name saved, focus kept;
- three quick ticks in a row: all saved;
- a poll-style repaint mid-sequence: scroll kept, the next tick lands;
- a press, then a repaint: the repaint waits for the release (also for a scrollbar drag and for
  Space). A right-click lets it through, and so does a press outside a crew list;
- the popover and the panel agree; the crew reaches SharePoint;
- another phase opens at the top.

## Known limits

- jsdom can't reproduce Chrome's dropped click, so the suite checks that the repaint waits.
  The Chrome measurement above shows the click itself landing.
- Only a press on a crew name holds a repaint (TODO §7.5 has the gate for widening it).
