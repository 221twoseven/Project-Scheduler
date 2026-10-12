# Automations

Everything that runs **outside the app** and touches its data: Power Automate flows,
GitHub Actions jobs, and service accounts. The app itself is `index.html`; this page covers
the rest, so none of it becomes a black box. Everything the app itself does is in
`ARCHITECTURE.md`.

**Rule:** a new automation gets an entry here in the same PR or change that introduces it,
and its definition gets exported to the tracker repo (below). If a flow is changed, update
its entry. If it's turned off, mark it *retired* and keep the entry.

## Inventory

| Automation | Kind | What it does | Owner | Status |
|---|---|---|---|---|
| [Feedback poller](#feedback-poller) | GitHub Actions | Files each feedback report as a tracker issue; syncs status, the resolved date and `/reply` / `/comment` comments back to the list | Robert | live since 2026-09-25 |
| [Reply email](#reply-email) | Power Automate | Emails a new `/reply` to the person who filed the report, and tells them they can answer; emails them when their report is resolved | Robert | live since 2026-09-30; resolved branch live since 2026-10-09 (tracker README step 11) |
| [Email reply in](#email-reply-in) | Power Automate | Sends the reporter's email answer to the tracker, where it becomes a comment on the ticket and in the app | Robert | live since 2026-10-09 (rebuilt; tracker README step 10) |
| 27 Events → Outlook | Power Automate | Syncs the company calendar list to Outlook | unknown | **undocumented**: TODO §5, item 12 |
| 27 Employees (PTO) | Power Automate | PTO / availability automation | operations manager | **undocumented**: TODO §5 |

The last two rows existed before this page. They stay marked undocumented until their
owner fills in an entry.

## Entries

Each entry answers the same questions: what starts it, what it reads and writes, which
account it runs as, where its definition lives, who hears about failures, and how to turn
it off.

### Feedback poller

- **Does:** reads `ShopTimeline_Feedback` and opens one issue per new report in the private
  tracker `221twoseven/Project-Scheduler-issues`, with the screenshot. Keeps the row's `status`
  in step with the ticket, in three values (v1.39.0, tracker #29): `resolved` when the ticket is
  closed, `review` when it is open and carries a team comment (a `**Triage spec**`,
  `**Revised spec**` or `**Fix shipped**` note, or a `/reply` or `/comment` with text), empty
  (pending) when it is open and untouched; a row is written only when its value differs, and a
  status change sends no email. Closing also stamps `resolvedAt` with the ticket's close time
  (cleared on reopen; rows closed before the column existed are back-filled). Comments starting
  with `/reply` or `/comment` are copied to the row's `comments` column, and a new `/reply` also
  goes to `lastComment` (a `/comment` shows in the app but is never emailed). An `email-reply` dispatch
  from *Email reply in* is posted on the report's ticket as a **Reply from the reporter**
  comment. That happens only when the sender is the reporter (`reporterUpn` or the form's
  `email`), and the quoted original is cut off. That run then starts a sync (`workflow_dispatch`;
  a comment posted with the job's own token starts no run), and the sync copies the answer to the
  row's `comments` as `kind:'reporter'`, header dropped, never to `lastComment` (2026-10-09, TODO
  item 58). The app shows it in the report's thread labelled *Reporter* (v1.45.1).
- **Trigger:** issue closed or reopened, any issue comment, hourly (best-effort), manual
  run (also started by an email-reply run; `actions: write`), `repository_dispatch` (`email-reply`).
- **Reads / writes:** `ShopTimeline_Feedback` columns `ghIssue`, `status` (empty = pending,
  `review`, `resolved`), `resolvedAt` (optional), `comments` and `lastComment`, plus the
  `/ShopTimeline Feedback/` screenshot folder (read only).
- **Runs as:** the Entra app **ShopTimeline Feedback Bot**. It has `Sites.Selected`,
  write access on TWOSEVENINC only, and a client secret stored in the tracker's Actions
  secrets. The secret expires 24 months after it was created; the date is in the owner's
  calendar.
- **Definition:** `poll.mjs` and `.github/workflows/poll.yml` in the tracker repo. That
  repo's README has the full setup.
- **Failures:** GitHub emails the repo owner when a run fails. The run log shows each step.
- **Turn off:** tracker ▸ Actions ▸ *File feedback as issues* ▸ ⋯ ▸ Disable workflow.
- **Record:** `Milestones/Phase-7-Pilot-Readiness/2026-09-25-feedback-github-bridge.md`,
  `…/2026-09-30-issue-replies.md`.

### Reply email

- **Does:** when a report's `lastComment` changes, emails that reply to the reporter,
  with a link to `#/issues/<ID>`. From 2026-10-01 the subject is
  `Timeline: your bug or idea #<ID> has a reply!`, and the body opens by telling the reporter they
  can reply to the email, followed by a `--- Reply above this line ---` marker. *Email
  reply in* depends on both.
  - **Resolved branch** (TODO item 56, tracker #38; live since 2026-10-09, tested on
    #31): when a row's `status` changes to `resolved` (its ticket closed), it emails
    the reporter `Timeline: your bug or idea #<ID> was resolved`, with the same link.
    Reopening sends nothing; closing again sends one more. Rows resolved before the branch
    existed get nothing.
- **Trigger:** SharePoint *When an item or a file is modified* on
  `ShopTimeline_Feedback`. It runs on every change to a row; *Get changes* plus a
  Condition send only when `lastComment` changed, and a second Condition (`Resolved`; Power Automate rejects `?` in action names) only
  when `status` changed to `resolved`.
- **Reads / writes:** reads `Title`, `ID`, `lastComment`, `status`, `reporterUpn` and `email`.
  Writes nothing, so it can't trigger itself.
- **Depends on:** version history being on for the list. Without it, the trigger's token
  is blank and *Get changes* fails with "Invalid format for version input value".
- **Runs as:** Robert's SharePoint and Outlook connections. The mail comes from his
  mailbox, so replies to it reach him.
- **Definition:** Power Automate ▸ My flows ▸ *Shop Timeline — reply email*. The
  step-by-step build is in the tracker README, step 9, and the resolved branch is step 11.
  Exported package: tracker `flows/shop-timeline-reply-email.zip`, with a readable
  `.definition.json` beside it (re-exported 2026-10-09 with the resolved branch). The SharePoint trigger checks for changes every minute.
- **Failures:** Power Automate emails the flow owner a weekly failure digest. The flow's
  28-day run history shows the failing step and its error.
- **Turn off:** My flows ▸ the flow ▸ **Turn off**.
- **Record:** `Milestones/Phase-7-Pilot-Readiness/2026-09-30-issue-replies.md`.

### Email reply in

- **Does:** when the reporter answers a reply email, sends the answer to the tracker. The
  feedback poller then posts it on the ticket and copies it to the app's Open Issues thread
  (TODO item 58).
- **Trigger:** Outlook *When a new email arrives (V3)* on the Inbox of the mailbox the reply
  email is sent from, with no Subject Filter; a `From a report` Condition passes only subjects
  containing `Timeline: your bug or idea` (rebuilt 2026-10-09: the 2026-10-01 build, which
  filtered in the trigger, never fired).
- **Reads / writes:** reads the email's subject, sender, received time and body (converted
  to plain text). Sends a GitHub `repository_dispatch` (`email-reply`) to
  `221twoseven/Project-Scheduler-issues`. Writes nothing to SharePoint.
- **Runs as:** Robert's Outlook connection, plus a GitHub connection signed in as
  `221twoseven`. The GitHub connector is standard, not premium.
- **Safeguards:** the poller posts only a reply (subject starting `RE:`, `AW:` or `SV:`; the
  flow also sees the team's own outgoing emails) and only when the sender is the report's
  reporter. It cuts a signature (a `-- ` line or a rule of dashes) as well. It cuts the
  quoted original, and it fixes the comment's first line, so an email can't pass for a
  maintainer command. Anything else is dropped, and the reason is in the run log.
- **Definition:** Power Automate ▸ My flows ▸ *Shop Timeline — email reply in*. The
  step-by-step build is in the tracker README, step 10 (rewritten 2026-10-09). Exported package:
  tracker `flows/shop-timeline-email-reply-in.zip`, with a readable `.definition.json` beside it
  (2026-10-09).
- **Failures:** the Power Automate failure digest, and the tracker's Actions log for the run
  it starts.
- **Turn off:** My flows ▸ the flow ▸ **Turn off**. Reporters' answers then just stay in the
  inbox.

## Keeping flows out of the black box

- **Export every flow's definition.** Power Automate ▸ My flows ▸ ⋯ ▸ **Export** ▸
  **Package (.zip)**, then commit it to the private tracker repo under `flows/`. That keeps
  a readable, restorable copy outside one person's account. Re-export after each change.
  It goes in the private repo, not here: packages name the connections and accounts they
  run as.
- **Give every flow a co-owner.** A flow runs on its creator's connections and stops if
  that account is disabled. Add a second owner (the flow ▸ **Share**), which is the backup
  maintainer from TODO item 16.
- **Name flows after the product** (`Shop Timeline — …`, later `People — …` for ADP), so
  a search on My flows finds all of them.
- **Keep secrets out of flows.** API keys (ADP and others) go in the connector's
  connection or in Azure Key Vault, never typed into an action. Keep them out of this
  repo too.
