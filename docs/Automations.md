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
| [Feedback poller](#feedback-poller) | GitHub Actions | Files each feedback report as a tracker issue; syncs status and `/reply` comments back to the list | Robert | live since 2026-09-25 |
| [Reply email](#reply-email) | Power Automate | Emails a new `/reply` to the person who filed the report | Robert | live since 2026-09-30 |
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
  tracker `221twoseven/Project-Scheduler-issues`, with the screenshot. Closing or reopening
  an issue sets the row's `status`. Comments starting with `/reply` are copied to the row's
  `comments` column, and a new one also goes to `lastComment`.
- **Trigger:** issue closed or reopened, any issue comment, hourly (best-effort), manual
  run.
- **Reads / writes:** `ShopTimeline_Feedback` columns `ghIssue`, `status`, `comments` and
  `lastComment`, plus the `/ShopTimeline Feedback/` screenshot folder (read only).
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
  with a link to `#/issues/<ID>`.
- **Trigger:** SharePoint *When an item or a file is modified* on
  `ShopTimeline_Feedback`. It runs on every change to a row; *Get changes* plus a
  Condition send only when `lastComment` changed.
- **Reads / writes:** reads `Title`, `ID`, `lastComment`, `reporterUpn` and `email`.
  Writes nothing, so it can't trigger itself.
- **Depends on:** version history being on for the list. Without it, the trigger's token
  is blank and *Get changes* fails with "Invalid format for version input value".
- **Runs as:** Robert's SharePoint and Outlook connections. The mail comes from his
  mailbox, so replies to it reach him.
- **Definition:** Power Automate ▸ My flows ▸ *Shop Timeline — reply email*. The
  step-by-step build is in the tracker README, step 9. Exported package: *not yet*
  (see below).
- **Failures:** Power Automate emails the flow owner a weekly failure digest. The flow's
  28-day run history shows the failing step and its error.
- **Turn off:** My flows ▸ the flow ▸ **Turn off**.
- **Record:** `Milestones/Phase-7-Pilot-Readiness/2026-09-30-issue-replies.md`.

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
