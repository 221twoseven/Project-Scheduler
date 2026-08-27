# 2026-08-27 — Pre-merge audit pass (REV90 fixes + REV91 cleanup)

Before promoting REV74–89 to `main`, the whole `development` codebase got a full
audit — bugs, edge cases, dead code, redundancy, docs, and test infrastructure —
and everything actionable was fixed on the spot. Rides the same promotion PR
([#23](https://github.com/221twoseven/Project-Scheduler/pull/23)).

## REV90 — the fixes (what could actually bite someone)

**The sync layer** (these existed since the early REVs — not new in Phase 3/4):

- **Saves are now serialized on one queue.** Two quick edits used to run two Graph
  flights in parallel; a throttled older PATCH could land after a newer one and
  quietly persist stale dates. The queue also guarantees a created record's id
  resolves before a follow-up edit PATCHes it.
- **Consecutive failed saves merge into one pending diff.** The retry pill used to
  replay only the *latest* failure — an earlier failed change was silently dropped
  (and the next poll visibly reverted it while the pill said "synced"). A later
  success also no longer masks an earlier failure.
- **The poll re-checks its guards after the fetch returns**, and aborts if any
  local edit landed mid-fetch — an edit made during the seconds-long read used to
  vanish from screen for up to 90 s.
- **A poll refresh clears the undo stack.** ⌘Z across a refresh used to diff
  against teammates' new rows and physically DELETE them from SharePoint.
- **Closing the tab warns while a save is in flight or failed** (it used to warn
  only for dirty drafts).
- **List reads follow `@odata.nextLink`** — `$top` is a page size, not a limit;
  rows past the first page used to vanish from every load and poll.

**Visible behaviour fixes:**

- Multi-PM projects now prompt every listed PM about late deadlines (the REV87
  prompt matched the raw comma string, so "Stan, Caroline" prompted nobody).
- The Delete-project button gets its danger styling back (`.btn-danger` never
  existed in the stylesheet; it now uses the real `.btn-del`).
- Unit 7's departments (Soft Goods, Vinyl, Other) appear in the Departments lens —
  they previously had no lane at all.
- One inspector change commits once (a listener stacked on every repaint, so one
  checkbox click could commit N times and flood the undo stack).
- The observed New Year holiday lands in the right year (Fri Dec 31 2027 used to
  schedule as a workday), clicking a row creates on the day the hover tag shows,
  same-day bars no longer overlap in a lane, grouped sidebars show one header per
  group with an honest count, Escape closes the Clients modal, saved views can
  restore an all-hidden status filter, the week zebra survives 53-week years, a
  malformed URL hash no longer throws, and draft keyboard nudges are undoable.

## REV91 — the cleanup (net −320 lines, zero behaviour change)

Deleted every verified-dead subsystem: the retired bar-pop popover, the pre-REV41
preview calendar CSS, the REV35/42 project-page CSS superseded by the dashboard
layout, the draft row-editor CSS, retired-status render branches, and a dozen
never-called functions/constants. Deduplicated the drift-risk copies: one shared
schedule-phase list, one `snap()`, one Tasks2-unavailable message, one default
department set, `npvEndAfter` delegates to `fwdN`. What was deliberately NOT
touched is recorded in TODO §7 (marker-handler clone, `PP_INSP` — tests read it,
shared-schema fields).

## Tests & infra

- `test90.js` — 27 assertions covering the REV90 fixes (skips on pre-REV90 builds).
- The 18 suites without a watchdog timeout got the house 20-second one — a stalled
  suite now fails CI instead of hanging it.
- `package-lock.json` is committed and CI runs `npm ci` — test runs pin the exact
  jsdom version instead of floating `^24`.
- Stale docs corrected: README/CLAUDE/ARCHITECTURE line counts and REV, six Lists
  (not four/five), the 90-second poll (not 45), the Teams-membership read, the
  leftover `+` diff markers in CLAUDE.md.

## Known ceilings / follow-ups

See the six new 2026-08-27 entries in TODO §7 (Staff/Clients discard-confirm,
marker-handler dedup, roster dept lists, `#tm-dl` naming, run.js skip counting,
write-only shared-schema fields). Also repaired repo corruption: the
`archive/benchmarks-timeline-34-44` tag pointed at a missing object (GitHub
Desktop's recurring "bad ref" error) — re-fetched from origin, commit-graph
rebuilt, `git fsck` clean.
