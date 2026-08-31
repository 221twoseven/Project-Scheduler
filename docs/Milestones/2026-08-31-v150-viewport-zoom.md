# v1.5.0 — Viewport-fitting zoom (08-31 brief, objs 7 & 8)

**Date:** 2026-08-31 · **Version:** v1.5.0 (minor) · **Branch:** `development` → `/preview/`
**Objectives:** 08-31 brief objs 7 and 8 (TODO §3 items 24–25)

## What changed

1. **The global Gantt's zoom is Week / Month / 3-Month** (obj 7) — and the steps fit
   the viewport: Week puts one week across the screen, Month one month, 3-Month a
   quarter, whatever the window size. This replaces the four fixed px-per-day steps
   (Day/2-Day/Week/Month) that confused everyone. `W`/`M` jump, `+`/`−` walk, the
   fit persists, and old saved steps migrate (Day/2-Day→Month, Week→3-Month — Month
   at a typical window is the same ~40px/day the old Day step was).
2. **The date bar zooms as well as pans** (obj 7 stretch — shipped, not skipped).
   A drag that starts more vertical than horizontal slides the zoom *continuously*
   between Week and 3-Month, anchored on the date under the pointer; drag up to
   come closer. The axis locks per drag on a 45° split — the suggested ±15° bands
   would leave dead diagonal zones where a drag does nothing, which reads as broken
   (ledgered; easy to change if the owner prefers bands after feeling it).
   Measured in a real browser at 14 seeded projects: 14–21ms per re-render frame,
   rAF-throttled — smooth.
3. **The project page gets the same steps plus Fit** (obj 8) — Fit keeps the
   historical whole-job-across-the-panel scale and stays the default; Week/Month/
   3-Mo pin the panel like the global view. Gantt mode only; per-browser pref.
4. The axis header now degrades by px-per-day rather than step name (numbers every
   day → Mondays only → labeled weeks → month row alone), so the continuous zoom
   always has a sensible header.

## Evidence & tests

- New suite `tests/test-v150.js` (26 checks): step fitting, keyboard, header
  degradation, persistence + migration, the pan/zoom gesture split (both axes),
  save-once-on-release, and the project-page control including Fit round-trip.
- Real-browser verification via a stubbed preview (MSAL/fetch faked): gesture
  exercised end-to-end with synthetic events, per-frame render timed, screenshots
  of Month/3-Month and the project-page control taken.
- `test-b3-zoom` self-skips on v1.5.0+ (its model no longer exists — superseded by
  test-v150); `test-v4-views` and `test88` updated to the new step names/defaults.
- Full suite green on both builds before push.

## Ceilings / follow-ups (ledgered in TODO §7)

- 45° split vs ±15° bands (owner's call after `/preview/`).
- No drag-zoom on the project page's strip; no Fit step on the global view.
- A custom drag-set FIT persists but can't be re-entered exactly via UI.
