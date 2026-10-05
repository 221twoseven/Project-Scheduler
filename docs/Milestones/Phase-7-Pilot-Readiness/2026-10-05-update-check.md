# 2026-10-05 — The app notices a new version (v1.33.0)

**Version:** v1.33.0 · **PR:** #90 (`feat/update-check` → `development`) · **Source:** owner ask,
2026-10-05 · **TODO:** §3 item 46

## What changed

A tab left open on the timeline kept running whatever build it had loaded, for days. GitHub
Pages serves `index.html` with `Cache-Control: max-age=600`; the page's own no-cache meta
tags do not override that header; and the 90-second poll only fetches list data, never the
page. A plain reload always got the new build, and a fresh visit got it within ten minutes,
but nothing told an open tab to do either.

Now:

- **The app checks for a newer build itself.** Every 12 hours, and whenever the tab comes
  back into view (at most once every 30 minutes), it fetches its own `index.html` with
  `cache:'no-store'` and a cache-busting query, reads the version inside, and compares it
  with the one running. A newer build shows **"vX is available — Reload"** at the usual toast
  spot. The toast stays until it is used or dismissed; nothing reloads by itself.
- **A developer can make it mandatory.** Help ▸ App settings has a new **Updates** section
  with **Ask everyone to reload**. It writes `update.minVersion` (the running version) to the
  `ShopTimeline_Config` list; the key can also be edited on the list. Every open tab reads
  that key on its next check. A tab on an older build shows **"This version has been retired
  — reloading in 30 s"** and reloads on its own.
- **Owner rule, same day: an update never costs anyone work.** Three layers. No check runs
  and no countdown ticks while the person is on New Project (dirty or not), editing a
  project, dragging a bar on any surface, inside an overlay or menu, on the tour, typing in
  any field or a bug report, or while a save is in flight or parked; a busy tab retries a
  minute later. Even a deliberate click on Reload is refused, with the reason, while a save
  hasn't reached SharePoint or a Company Data record is mid-edit (those can't be stashed).
  And an unsaved New Project draft is stashed before the reload and restored after it, the
  same way it survives a tab switch.
- **After the reload, a one-time "Updated to vX — What's new" toast** opens Help ▸ Release
  notes, which are generated from `CHANGELOG.md`. The browser remembers the last version it
  showed; a first-ever visit gets no toast.

## Why these choices

- Twice a day was the owner's proposal and is plenty for releases that land at most daily.
  The focus check is what catches "left it open over the weekend": the 12-hour timer alone
  could miss a Monday-morning release by hours.
- The check is deliberately not tied to the 90-second poll. The poll is a Graph call budget;
  this is one small GET of a static file.
- A `minVersion` the served build cannot satisfy (for example, set from `/preview/`, which
  runs ahead of production) never starts a reload: the tab would only reload back onto the
  same old build. Press the button from production.

## Evidence

- Before / after, App settings:
  `screenshots/before-update-check-app-settings.png`,
  `screenshots/after-update-check-app-settings.png`
- The three toasts: `screenshots/after-update-check-offer.png` (dashboard),
  `screenshots/after-update-check-retired.png` (project page),
  `screenshots/after-update-check-whatsnew.png`

## Tests

`tests/test-v1330.js` — 40 assertions: the throttled focus probe and its request shape; the
offer toast stays, reloads only on click, and is offered once per version; the retired
countdown on a saved project (held by a live drag) and on the New Project draft (held by
unsaved typing); no reload loop when the served build is older than `minVersion`; the
"Updated to" toast after a version change and none on a first visit. The suite skips itself on
the REV50 reference build.

## Known limits

- The retired notice reloads the page; an edit popover that was open is closed by the reload
  like any other. Saves already queued are flushed first because the countdown holds while a
  save is in flight.
- Local-only configuration (no `ShopTimeline_Config` list) cannot carry `update.minVersion`;
  the button is disabled in that case.
