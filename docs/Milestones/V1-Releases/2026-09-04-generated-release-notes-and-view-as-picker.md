# 2026-09-04 — Release notes are generated; the developer's view-as picker

**Date:** 2026-09-04 · **Version:** 1.20.6 · **Branch:** development

Two owner asks from one session. The first changes how the app is *released*; the
second is a developer-only tool nobody else will see.

## What changed

- **Help ▸ Release notes is now generated, and reaches back to the alpha.** The
  hand-curated `RELEASE_NOTES` const (which the owner was never going to keep updating)
  is replaced by a single source, `CHANGELOG.md` at the repo root — plain language,
  shop-facing, newest first, editable in the GitHub web UI. `npm run notes`
  (`tools/gen-release-notes.js`) splices it into `index.html` between
  `RELEASE_NOTES:BEGIN/END` markers; the page code is untouched apart from letting each
  entry carry its own label (so pre-v1 eras can read "Beta · Identity (REV65–70)"
  instead of a forced `v`). Seeded with the whole history: every v1.x entry verbatim,
  the beta (REV50–101) as one entry per era from the Milestones map, and one honest
  line for the alpha (REV1–50 — the original Timeline, which predates this repo).
- **The notes can't go stale.** `test-v160` — which CI runs on every push — now fails
  if the newest entry doesn't name the running `APP_VER`, *or* if the in-app block
  differs from what the generator would emit from `CHANGELOG.md` ("edited the
  changelog, forgot to run notes"). The generator itself refuses to write over missing
  markers or a version with no entry. A `## Unreleased` section collects lines while
  work is in progress and is never emitted; rename it to the version when shipping.
- **Who writes the line.** Shop-facing prose can't be generated from nothing, and
  commit messages are developer-speak. The rule (now in `CLAUDE.md`): every change that
  bumps `APP_VER` adds its lines to `CHANGELOG.md` and runs `npm run notes` in the same
  commit — Claude does this as part of the work; the owner never touches release notes.
  Developer-only tooling doesn't earn a line, and there are no vague "bug fixes" lines
  — a version with nothing team-facing folds into the next entry's range, as the notes
  already did (`v1.14–1.15`).
- **One view-as picker replaces the two developer toggles.** "Admin/Non-admin" and
  "Not me" collapsed into a native `<select>` on the toolbar (developers only, per tab)
  with three views: **Developer** (your real view), **Admin** (a non-developer admin),
  **Non-admin** (a viewer). Two overlapping booleans became one enum (`VIEW_AS`) — the
  impossible fourth combination is gone. In either preview you are *someone else*:
  dev-only Help options and the developer demo-tour hide, and your own page reads as a
  Summary the way colleagues see it. Real non-admins are unaffected (their own page is
  still My Dashboard with editable User Notes).

## Why it mattered

The release-notes page was the one thing in the app that depended on someone
remembering a chore, and the owner said plainly they would not. Making the notes a
by-product of shipping — with CI as the memory — is the only version of "automated"
that stays shop-facing. The picker is smaller: the owner wanted the developer's
preview to show the *whole* app as others see it, and once that was true there were
three states worth naming, not two switches.

## Ceilings / follow-ups

- The alpha (REV1–50) has no records in this repository; it is one line by design.
  The beta is per **era**, not per REV number — the Milestones map is the source.
- The `DEV` badge next to the signed-in name still shows *real* access in every view
  (deliberate, matching the earlier Non-admin toggle); direct-hash to `#/settings` or
  `#/reports` while previewing isn't bounced (matching the earlier behaviour).
- Grouping small dev-only bumps into the next range is a convention, not enforced —
  the test only requires that the *newest* entry name `APP_VER`.

## Tests

Full suite green (75 suites). `test-v160` +3 (sync guard, history present, Unreleased
held back); `test-v190`/`v1100`/`v1160`/`v1180` rewritten to the picker; the real
viewer self-notes exception now asserted at its mechanism (`savePeople(…, true)`)
rather than through a developer preview that no longer renders it. Guards proven to
trip in a side-effect-free negative check.

## Also in this release — Shipping phase

Owner ask at ship time: **Shipping** is a second end-of-job phase (`id:'shipping'`, group `install`), listed right after Installation on the project checklist. Not mutually exclusive with Install — one or both. It rides every install rule via `isEndDept()`/`isInstall()`: red bars, crew picked from the whole staff, JSON crew array in SharePoint, no cross-lane drag, and a project reads Complete once the *last* install-or-shipping bar has ended. Scheduling: `SCHED_PHASES` now takes the whole `install` group, so both chain to the deadline in parallel. People page folds it into Installation (`PD_ALIAS`). Departments lens: the Installation section became a two-lane group. Department is a plain text column, so no SharePoint change.
