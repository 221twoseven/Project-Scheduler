# 2026-09-01 — v1.7.2: handoff quick wins + the legacy-name data scrub

**Version:** v1.7.2 (patch) · **Branch:** `development` · **Suite:** `tests/test-v172.js` (31 checks)

The 2026-09-01 owner handoff carried four small asks and one big GO. All five shipped
together as one patch.

## The quick wins (handoff items 6–9)

- **Wordmark (item 6):** the toolbar title — the company logo/wordmark, set in Brauer
  Neue since v1.7.1 — now reads **TWOSEVEN INC.** The print-sheet title and the Meeting
  Sheet header carry the same full name (one brand string everywhere it prints).
  Design-Language §3 and §8 updated.
- **Sort controls hide in the Departments lens (item 7):** the sidebar footer's
  Due date / Client / PM / Status buttons order *projects*; Department-lens rows are
  people lanes, so the whole footer hides there (`body.lens-dept`, toggled in
  `render()`). The v1.6.1 scroll-parity pad reads the live footer height, so the
  bottom overscroll adapts.
- **Coach copy (item 8):** step 1 now says "the Department lens regroups everything by
  department." — the owner's wording; "crew" is not how the company talks. (The
  standing coach-copy hold covers wholesale revisions; this was an owner-supplied
  line edit.)
- **Drag-zoom out to a year (item 9):** `FIT_MAX` 91 → 365. The date-bar drag (global
  header and project date strip both — they share the clamp) now slides from a week
  on screen out to a full year; the W/M/3-Mo buttons still land on their named steps.
  No new rendering work: the v1.5.0 header degradation ladder already handles <8px/day
  (month row alone labels time), and canvas cost scales with the data range, not the
  fit. A stored fit up to 365 restores (the project page's hardcoded 91 restore clamp
  now reads the shared consts).

## The scrub (handoff item 5 — the v1.6.5 ledger gate FIRED)

`scrubLegacyNames()` — a console-run, one-time pass that makes the v1.6.5 healing
permanent. Since v1.6.5, `canonName()` resolves legacy abbreviated person strings
("Davis S.", bare first names) to roster people at compare/display time, but the
**stored** values kept their abbreviations until someone happened to re-save the
record. The scrub rewrites the stored values themselves:

- **What it touches:** projects' `projectManager`/`drafter`/`leadFab`/`fabricators`/
  `metalFab`, phase crews (`assignee` — comma strings, arrays, and legacy JSON-string
  install rows; the `Installation` placeholder is preserved), and note/to-do
  assignees (`who`).
- **What it never touches:** ambiguous or unknown strings (the v1.6.5 rule — never
  guess identity), free-text departments (their `assignee` is the bar's label, not a
  person), and anything already canonical (unchanged records produce no Graph write).
- **How it runs:** from the browser DevTools console, signed in.
  `scrubLegacyNames()` is a **dry run** — it prints (console.table) and returns the
  change report, writing nothing. `scrubLegacyNames(true)` applies the same changes
  through `saveState` — the normal optimistic path: per-record diff sync, sync pill,
  one retry, undo toast.
- **Operator note (Robert):** run the dry pass on `/preview/`, read the table, then
  re-run with `true`. The owner expects further passes as the staff lists reconcile
  and new users are added — the function stays in the app and reports "0 fields to
  heal" when there's nothing left.

## Known ceilings / follow-ups

- The scrub heals to whatever the roster holds **today** — people not yet on
  `ShopTimeline_Staff` stay abbreviated until they're added and the scrub reruns
  (by design: parallel-run staffing reconciliation, TODO §3 item 13).
- Name presentation on the project-edit/subtask-edit pages is a known, separate
  problem the owner has parked for later (handoff note).
- The zoom buttons offer no step past 3-Mo — reaching the year view is drag-only.
  Gate: someone asking for a "Year" button.
