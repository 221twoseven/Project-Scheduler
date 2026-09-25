# 2026-09-25 — Feedback reports become GitHub issues (item 31)

**Date:** 2026-09-25 · **App version:** unchanged (v1.23.0 — no app code) · **Where:** the
private repository `221twoseven/Project-Scheduler-issues` · **Docs PR:** #51

## What changed

Every report filed through **Help ▸ Report a bug or idea** now becomes a GitHub issue,
screenshot included, that Claude Code can read and act on — the owner's ask of
2026-09-24 ("whatever is easiest to implement that is automated"). The app is untouched:
the form still writes `ShopTimeline_Feedback` and mails the FB-flagged people. The bridge
is an hourly GitHub Actions job (`poll.mjs`, ~130 lines, no dependencies) in a private
tracker repository that:

1. reads the list through Microsoft Graph as an app-only Entra registration
   (**ShopTimeline Feedback Bot**, application permission `Sites.Selected`, granted
   `write` on the TWOSEVENINC site only — a new registration, the app's is untouched);
2. downloads each new report's screenshot from `/ShopTimeline Feedback/`, commits it under
   `screenshots/`, opens the issue (label `bug` / `feature`; reporter, version,
   description, screenshot inline, link to the list item) and writes the issue URL back
   to the new **`ghIssue`** column (⚠ single line of text, created by the owner
   2026-09-25 — additive);
3. keeps status in step both ways: an issue closed on GitHub marks the row `resolved`
   (it leaves the Open Issues page); a row marked resolved in the app closes its issue.

Private on purpose: reports carry names, descriptions and shop screenshots. GitHub Free
personal accounts get unlimited private repositories, so no plan change. Power Automate
was the alternative and lost on one point — its Standard tier cannot move a screenshot
into GitHub.

## Evidence

- Dry run 36151343154: "13 rows · file 12 · resolve 0 · close 0".
- Real run 36151585598: 12 issues filed (#1–#12), two screenshots committed, every row's
  `ghIssue` written. Issue #11 ("Connect/sync Open Issues list to Github issues") closed
  the same day as done by the bridge itself — the next hourly run marks its row resolved.
- The 12 reports are carried into `docs/TODO.md` §3 (items 32–40, 2026-09-25).

## Setup gotchas (for whoever does this again — README in the tracker has the steps)

- The Actions secret must hold the client secret's **Value**, not its Secret ID
  (`AADSTS7000215` otherwise).
- Granting `Sites.Selected` on a site (`POST /sites/{id}/permissions` in Graph Explorer)
  needs the caller to be a **site collection administrator** of that site — global admin
  is not enough (403 `accessDenied`). Fix: SharePoint admin center ▸ Active sites ▸ the
  site ▸ Membership ▸ Site admins.
- A repository created through `gh repo create` had no default labels; `bug` had to be
  created (`gh label create`). The poller now surfaces `gh`'s own stderr so this reads as
  "could not add label" instead of a bare exit code.
- A rerun after a failure re-downloads the same screenshots; the poller commits only when
  `git status` shows a change.

## Ceilings / follow-ups

- Latency is up to an hour (cron); `gh workflow run poll.yml` runs it now. An
  event-driven trigger (Power Automate → `repository_dispatch`) is possible later.
- The client secret expires in 24 months; the run then fails with `token: 401`. Rotate
  it in Entra and update the `GRAPH_CLIENT_SECRET` secret.
- Hourly runs use ~720 of the plan's 2,000 Actions minutes a month for private repos.
- Hubert still needs collaborator access to the tracker (GitHub username pending).
- The app does not show the ticket link yet — two lines on the developer Bug Reports page
  when wanted (`fbFetch` maps `ghIssue`, `renderReports` prints it).
- Reports resolved before the bridge existed stay on the list only (one row on
  2026-09-25).
