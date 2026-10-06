# 2026-10-05 — Open Issues: resolved date, aligned rows, /comment notes (v1.34.0)

**Date:** 2026-10-05 · **App version:** v1.34.0 · **Where:** `index.html`, `docs/Automations.md`,
`docs/TODO.md` §6, `.claude/skills/triage-issues/SKILL.md`, tracker repo `poll.mjs` + README
(commit 12878d0) · **PR:** #93

## What changed

1. **The Resolved column dates a report by when it was resolved**, not when it was sent, and
   lists the most recently resolved first. The date comes from a new `resolvedAt` column on
   `ShopTimeline_Feedback`: the tracker's poller writes the ticket's close time there when a
   ticket closes, back-fills every ticket already closed, and clears it when a ticket reopens.
   Until the column exists the app shows the row's last change (the status flip) instead.
2. **Rows line up.** The BUG and IDEA chips share one width, so every subject starts on the
   same line — Open Issues, Resolved, and the developer page.
3. **A fourth owner response on a ticket: `/comment`.** It shows in the app as a developer
   comment, exactly like a `/reply`, but the person who filed the report gets no email. The
   poller marks it `kind:'comment'` in the row's `comments` JSON and leaves `lastComment`
   alone (that is what the reply-email flow watches). `/reply` still does both.

## Owner action — ⚠ column spec

On `ShopTimeline_Feedback`, add **`resolvedAt`** — Single line of text. Nothing else. The
poller's next run back-fills it for every closed ticket; the app picks it up on its next read.
Optional: without it, the poller skips the stamps and the app shows the last-changed time.

## Why it mattered

Owner asks, 2026-10-05 (two screenshots): the Resolved column repeated the submitted date; the
chips of different widths pushed subjects out of line; and there was no way to leave a note the
shop could see without mailing the reporter.

## Evidence

`screenshots/before-issues-resolved-date.png` · `screenshots/after-issues-resolved-date.png`

## Follow-up

`tests/test-v1340.js` (app). The poller's `--selftest` covers `/comment`, `lastComment` and the
`resolvedAt` stamping/back-fill/clear. The triage skill lists `/comment` as a note, not a command.
