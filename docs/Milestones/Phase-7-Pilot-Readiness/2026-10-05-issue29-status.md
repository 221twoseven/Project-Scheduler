# 2026-10-05 — A status on every open report: Pending, In review, Resolved (v1.39.0)

**Date:** 2026-10-05 · **App version:** v1.39.0 · **Where:** `index.html`, `docs/Automations.md`,
`docs/TODO.md` (user band + §7.4 ledger), tracker repo `poll.mjs` + README (branch
`feat/status-review`) · **Tracker:** #29 (revised spec of 2026-10-02, owner "Proceed with fix")

## What changed

1. **Three states, read off the ticket.** The tracker's poller now writes the row's `status`
   from the ticket on every run: `resolved` when the ticket is closed, `review` when it is
   open and a team member has replied on it (a `**Triage spec**`, `**Revised spec**` or
   `**Fix shipped**` note, or a `/reply` or `/comment` with text), and empty (pending) when
   it is open and nobody has. A row is written only when its value differs, so a quiet run
   writes nothing, deleting the last team comment puts a report back to Pending, and a
   hand-set value is put back in step. "Review" and "in progress" are one state (the owner's
   clarification). The marker is the signal, not the author: Claude and the owner post as one
   account. A **Reply from the reporter** never counts.
2. **Open Issues shows the state.** Every row in the Open column carries a tag after
   BUG / IDEA: **PENDING** (muted, "Not looked at yet") or **IN REVIEW** ("The team is looking
   at this report"). The Resolved column is its own state and gets no tag. Any other value
   still reads as open and shows PENDING.
3. **Developer page (Help ▸ Bug reports (dev)).** The same tags, plus RESOLVED. A row that
   has a ticket (`ghIssue`, now read by `fbFetch`) shows "Status follows the ticket · #N"
   with a link to the ticket instead of the Mark resolved / Reopen button, because the poller
   would undo the button on its next run. Rows without a ticket (resolved by hand before
   the bridge) keep the button and `fbSetStatus`. This closes the §7.4 ledger entry
   "Developer Bug Reports page buttons" (2026-09-25).

Nothing is set by hand (Q4 default), a status change sends no email (`lastComment` is
untouched), and no new SharePoint column is needed: `status` and `ghIssue` already exist.

## Defaults taken (from the revised spec)

- Q1 yes: a `/reply` on its own counts as seen. Added since the spec: a `/comment` (the
  2026-10-05 note-for-the-shop command) counts too, since it shows in the app as a developer
  comment and a PENDING tag above it would contradict itself.
- Q2 no: Fix shipped keeps IN REVIEW until the merge closes the ticket.
- Q3 both: PENDING and IN REVIEW are shown.
- Q4 no: no manual Pending / In review control.

## Owner action

Tracker ▸ Actions ▸ *File feedback as issues* ▸ Run workflow with **dry run** ticked, read the
"would mark in review" lines, run again unticked (README step 7b). The order of the two merges
does not matter: an older app reads `review` as open and shows no tag.

## Evidence

Open Issues: `screenshots/before-issue29-status.png` · `screenshots/after-issue29-status.png`
Developer page: `screenshots/before-issue29-status-dev.png` · `screenshots/after-issue29-status-dev.png`

## Follow-up

`tests/test-v1390.js` (app, R1–R4). The poller's `--selftest` covers `seen()` and every
Done-when case for `plan()`. `tests/test-v1340.js` R2 now ignores the status tag when it counts
the kind chips.
