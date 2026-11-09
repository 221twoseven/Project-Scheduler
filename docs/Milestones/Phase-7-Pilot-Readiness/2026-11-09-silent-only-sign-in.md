# Silent-only sign-in renewal — one prompt, never a stack of windows

**Date:** 2026-11-09 · **Version:** v1.51.3 · **Item:** §3 item 76 · **PR:** #180

## What happened

The owner left a Timeline tab open overnight and came back to as many as fifteen
stacked Microsoft login windows. The cause: when the sign-in token expired,
`spToken()` fell back to an interactive token popup every time silent renewal
failed — and the 90-second background poll calls it on every tick, with nothing
stopping two ticks (or a tick and a save) from each opening their own window.

## What changed

Token renewal never opens a window any more. The chain, in order:

1. **Silent renewal** (`acquireTokenSilent`), as before. When it fails, it now
   *throws* a tagged error instead of opening anything.
2. **Silent heal** (`ssoSilent`): an expired token over a still-alive Microsoft
   session re-establishes itself invisibly — most expiries end here and nobody
   sees a thing.
3. **The in-page overlay**: only when both fail does a "Your sign-in expired"
   message cover the page. Microsoft's login page refuses to be shown inside
   another page, so the overlay holds a **Sign in with Microsoft** button, and
   the one real login window opens only from that click. The sign-in is
   single-flighted — however many parts of the app hit the expiry at once, there
   is exactly one window.

While the overlay is up the background poll and update check pause (they already
sit out any open overlay), so an expired tab sits quietly. A save that was caught
by the expiry is parked exactly like any other failed save and replays
automatically after re-sign-in — nothing typed before the expiry is lost. A tab
that never signed in at all (boot failed or was dismissed) no longer polls in
the background either.

The extra-permission tokens (Team membership, feedback mail) were already
silent-only with their own degrade paths; those are unchanged.

## Verified

`tests/test-v1513.js` covers the heal, the overlay, the parked-save replay and
the single-flight guard against the real `index.html` in the jsdom harness. The
overlay rendered locally:
[screenshot](screenshots/2026-11-09-signin-expired-overlay.jpg). The true
overnight expiry needs a real expired session to exercise end to end.

## Known ceiling

After re-sign-in the schedule may be up to one poll interval (90 s) stale until
the next tick refreshes it; parked saves go out immediately.

Same fix, same day, in the sibling print-farm-scheduler repo
(221twoseven/print-farm-scheduler#86) — the bug was inherited by both apps.
