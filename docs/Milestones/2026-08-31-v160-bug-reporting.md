# v1.6.0 — Bug report / feature request form (v2 brief, obj 2)

**Date:** 2026-08-31 · **Version:** v1.6.0 (minor) · **Branch:** `development` → `/preview/`
**Objective:** 2026-08-28 v2 brief obj 2 (TODO §3 item 11); list approved + created by the owner 2026-08-31

## What changed

Help ▾ gained **"Report a bug or idea."** The form prefills Name and Email from the
signed-in account, offers Bug vs Feature request, takes a multiline description and
an optional screenshot, and files everything into the owner-created
`ShopTimeline_Feedback` list (all-text columns: Title, kind, name, email,
description, appVersion, appId — the build stamps its own version so reports date
themselves).

**Screenshot design change from the straw proposal:** Graph v1.0 exposes no
list-item-attachment API, so instead of attaching, the screenshot uploads to the
site's default document library under `/ShopTimeline Feedback/` and the report's
description links to it. No new columns, no schema impact, nothing for the
colleague app to notice.

If the list can't be reached, the error toast says exactly what to check — that
the list lives on the TWOSEVENINC site's Site contents, not in personal "My Lists"
(where the app cannot see it).

## Evidence & tests

- New suite `tests/test-v160.js` (17 checks): menu entry, prefill from the account,
  empty-description validation (no request leaves the app), the full POST body
  asserted on the recorded outgoing request (Title/kind/name/email/description/
  appVersion/appId), success close, Esc close, and the drive-upload code path.
- Full suite green on both builds before push.

## Ceilings / follow-ups

- The screenshot flow is untestable end-to-end without the tenant — first real
  upload on `/preview/` verifies the drive folder creation and link.
- One report per submit; no draft persistence if the tab closes mid-write.
