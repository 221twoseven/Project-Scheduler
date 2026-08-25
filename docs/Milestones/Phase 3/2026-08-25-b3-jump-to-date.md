# Jump to date + center on Today (finding B3, navigation half) — REV76

**Date:** 2026-08-25 · **App REV:** 76 · **Finding:** B3 (UX audit, "no zoom/jump") ·
**Brief:** Phase 3 pack, V2 · **PR:** v2-jump-to-date → development

## What changed

On a nine-month timeline, getting to a specific date used to mean holding the scrollbar
and watching months fly by. Now any date is at most three interactions away:

- **Go to date popover** — a small panel with a real date field plus four quick picks:
  **Today · +1 mo · +3 mo · Next install** (the next upcoming installation on the
  visible timeline). Picking a date glides the timeline until that date sits in the
  middle of the screen (the glide is instant for people who turn off animations,
  same rule as the off-screen row chips).
- **Three ways in**, per the design language's three-path rule: press **G**, click any
  **month name** in the header (they underline on hover now), or use the new
  **"Go to date…"** entry in the `?` legend. Only one popover/menu is ever open at a
  time; Escape or clicking elsewhere closes it.
- **Today button now centers.** It used to park today at the left edge; now it and the
  `T` key put today mid-screen. The app still *starts up* with today near the left edge
  so the first look reads forward into upcoming work — that was deliberate and stays.

## Evidence

Stubbed-data captures (headless Chrome, reduced-motion so jumps are instant):

- [Go to date popover (G path)](screenshots/after-b3b-goto-popover.png) — date field, G hint, four quick picks
- [Opened from a month-name click](screenshots/after-b3b-goto-from-month.png) — popover drops under the clicked month, prefilled with it
- [Today before: parked at the left edge](screenshots/before-b3b-today-parked-left.png) (REV75)
- [Today after: centered](screenshots/after-b3b-today-centered.png) (REV76 — off-screen rows grow their edge chips, as designed)

## Why it mattered

The audit's B3 finding: with only scroll to move through time, PMs lose their place on
long seasons. The zoom half shipped as REV75; this is the other half — direct travel.
With both, "show me late October" is one keypress and one click from anywhere.

## Notes

- No SharePoint, auth, or schema involvement — this is all in-browser navigation.
- New suite `tests/test-goto.js` (18 checks: all three entry paths, Enter-to-jump,
  centering math, one-menu-at-a-time, Escape, Today centering). Skips on the frozen
  REV50 reference like the other post-REV50 suites.
- Follow-up ceiling: the month-name click drops the popover under the pointer,
  clamped on-screen; on very narrow windows it may sit left of the click. Cosmetic.
