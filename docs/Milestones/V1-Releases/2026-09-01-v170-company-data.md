# 2026-09-01 — v1.7.0: Company Data — People & Clients become pages

**The 2026-09-01 "Master Data UX Refactor" handoff, delivered whole**
(`docs/2026-09-01-Master-Data-UX-Refactor-Handoff.md`; TODO §3 item 27). The People &
Availability and Clients management modals are gone; in their place, two first-class
application pages under a renamed **Company Data** menu (was Resources).

## What changed

- **Routes.** `#/people` and `#/clients` render into `#page` on the project-page
  precedent: breadcrumb trail (`All Projects › People`) with an × exit, the timeline
  toolbar row hidden (`body.cd-route`), Esc walks back to the timeline. A sub-path
  (`#/people/xyz`) lands on the page rather than 404ing.
- **Read-first master/detail.** Left: a searchable index (people: name / role /
  departments / availability, with a department filter; clients: name / alias),
  sorted alphabetically, with a `N records · SharePoint` source cue in the trail bar.
  Right: the selected record rendered as **information** — no form controls until the
  explicit **Edit** action. People records show email, departments, current +
  upcoming OOO, and derived schedule context ("On 3 phases across 2 projects · 1
  running today", via the v1.6.5 `canonName` machinery). Client records show alias
  and derived project counts.
- **Record-level actions.** Edit and + Add swap the detail pane to an edit state
  (person: name with Teams datalist suggestions + email backfill, email, role,
  department checkboxes, OOO ranges; client: name + alias). **Remove** lives inside
  the edit state behind a confirm that names consequences ("X is on 6 phases across
  4 projects…"). Switching records, Esc, or Cancel with unsaved changes asks before
  discarding — the old modals silently discarded (a REV90 ledger entry, now closed).
- **Persistence unchanged.** A save clones the shared list, swaps one record, and
  rides the existing `savePeople()`/`saveClients()` paths — the same Graph
  POST/PATCH/DELETE diffs the modals produced, verified request-for-request in
  `tests/test-v170.js`.
- **Rename sweep.** Resources → Company Data; "People & Availability" → People; the
  "add people under Resources" empty-state strings follow. The `#tm-dl` datalist
  became a global `#cd-dl` (its only consumer was the staff editor — ledger gate
  fired). The shortcuts popover gained a Company Data list; the tour heads home
  before running (there is no Company Data tour); a background poll defers while a
  record is mid-edit, like the REV98 popover rule.
- **Design language.** New §7.6 records this as the reusable master-data pattern for
  future Company Data sections. New `.cd-*` styles; the orphaned `.st-*` modal styles
  deleted.

## Why it mattered

The datasets the app treats as canonical company records presented as throwaway
settings dialogs. The handoff's core move — **modal → batch form** becomes
**location → index → record → explicit edit** — makes People and Clients read as
authoritative shared data, and establishes the UX shell the v2.0.0 data-store
consolidation (TODO §3 item 13) will absorb stores into.

## Verification

- `tests/test-v170.js` — 39 checks: routing/chrome, read-first, edit state, add /
  remove, search/filter, Esc unwind, persistence assertions on the outgoing Graph
  bodies, dashOn suspension, nav renames.
- test66 / test69 / test70 / test90 branched on the `renderCompanyPage` src marker —
  their modal-path assertions now run the page-equivalent flow on v1.7.0 builds and
  the original flow on older builds.
- Verified live in a real browser against the stubbed preview (both pages, read and
  edit states, exit back to a fully-restored timeline); screenshots in the session
  record.

## Known ceilings / follow-ups (ledgered in TODO §7)

- **No per-record URLs** — selection is page state; `#/people/:id` is tolerated but
  doesn't select. Gate: someone wants a linkable person/client record.
- **No Active/Inactive/Archived lifecycle** — Remove is a real delete (with a
  consequence-naming confirm). Gate: the §5 status column (Robert applies it when
  that pass is designed).
- **Client selection is keyed by name** (clients carry no appId) — a concurrent
  remote rename while a record is selected drops the selection to the empty state on
  the next repaint. Benign; self-heals on the next click.
- The v1.6.5 ledger entries (to-do assignees not canonicalized; one-time data scrub)
  are unchanged by this work — the People page reads through the same `canonName`
  lens the rest of the app uses.
