# To-Do / Backlog

**The single working to-do list for Project Scheduler (Timeline).** Ranked by priority,
with the quick wins pulled to the top. Anything touching **SharePoint schema** or
**Entra/auth** is marked ⚠ and needs explicit approval first (shared with a separately
maintained colleague app — see `CLAUDE.md`).

Sequencing decisions (2026-08-19):

- **Feature work comes before hallway test round 2.** Calendar functionality is a crucial
  feature; the hallway test is more useful once it exists. (This supersedes the U8 record's
  "hallway test before promotion" ordering.)
- **UX Phases 3 and 4 are ON HOLD** until the higher-priority items in §3 ship (see §6).
- `docs/UX-Audit-and-Strategy.md` is a **strategy summary, not a to-do list** — it stays
  as-is; this file is where actionable state lives.

Last reviewed: 2026-08-21 — the REV53–64 run between UX Phases 2 and 3 is now
categorized as **Phase 2.5** (index:
`docs/Milestones/2026-08-21-phase-2-5-feature-interlude.md`; records:
`docs/Milestones/Phase 2.5/`). This review reconciled every open item below against
what Phase 2.5 actually shipped — N6/N7 closed by REV64, N8 re-renamed, N9 downgraded
to a data-model decision, PR #15 now carries through REV64. The moves themselves are
logged in §10.

---

## 1. Quick checks & low-hanging fruit (minutes each — do first)

- [x] **`/sandbox/` and `/preview/` redirect URIs are registered in Entra.** ⚠ Verified
      2026-08-19 via credential-free authorize-endpoint probes (`prompt=none`: both URIs
      redirect back to the app; an unregistered control URI errors at Microsoft's page).
      Onboarding-Fork Part B is done — the collaborator's sandbox is unblocked.
- [x] **CI is green** — verified 2026-08-19: latest `development` push ("Docs Cleanup")
      passed both CI and Deploy Pages.
- [x] **2FA confirmed** on the GitHub account(s) with access (owner, 2026-08-19).
- [x] **`ShopTimeline_Tasks2` exists** — confirmed in Site Contents 2026-08-19 (empty,
      which is fine; to-dos persist there instead of browser-local storage). No code
      change needed. **Do not** re-flag `label` on `ShopTimeline_Tasks` — it exists
      (verified by `test-label.js`).
- [x] **test50 skip guard on the reference build** — dropped 2026-08-19: the guard
      already exists (`tests/test49.js` detects E1 builds via `pp-dock` and gates the
      dock assertions; the B4 record misattributed it to test50). `npm run test:ref`
      passes 15/15.

## 2. Security & governance decisions (high priority, owner's call)

- [x] **Repo visibility decided (2026-08-19): staying PUBLIC**, org staying on the free
      plan. Rationale: private Pages needs a paid plan (Free = the site goes dark), the
      `main` ruleset stops being enforced on private+Free, and the deploy trim below
      already keeps repo internals off the public website. Revisit only if the org
      upgrades. Consequence: the doc-scrub item below is now active.
- [x] **Pages deploy trimmed to app files only** (2026-08-19, PR #14): the public site
      now serves just `index.html` + `msal-browser.min.js` per subpath — `docs/`,
      `tests/`, `reference/` are no longer published as web pages. A guard step fails
      the deploy if the app references a file missing from the allowlist. See
      `docs/Milestones/2026-08-19-pages-deploy-trim.md`.
- [x] **Sensitive info scrubbed from live docs** (2026-08-19): personal names → role
      wording, stale security-gap notes dropped, harness.js stub neutralized. Generic
      fixture first names in test data deliberately left (sample data; suites assert on
      them). Old versions remain in **git history** — truly unpublishing them would need
      a history rewrite (`git filter-repo`) + force-push, coordinated; not planned, as
      there are no real secrets in the repo (IDs are public by design).
- [x] **Repo under the Twoseven org** — `github.com/221twoseven/Project-Scheduler`.
      If ever renamed/moved again, re-register the MSAL redirect URI. ⚠ See `docs/SETUP.md`.
- [x] **`main` protected** — PR + green CI required, empty bypass list. Recipe in
      `docs/SETUP.md`.
- [x] **Pages deploys work** — `main` → `/`, `development` → `/preview/`, `sandbox` →
      `/sandbox/`; live app verified at https://221twoseven.github.io/Project-Scheduler/.
- [x] **Root redirect URI registered, sign-in working**, tenant-wide admin consent for
      `Sites.ReadWrite.All` granted, non-admin sign-in confirmed. ⚠ See `docs/SETUP.md`.

## 3. Feature work (the current focus — before hallway test round 2)

Roughly in build order:

- [x] **1. Calendar create menu + parity — DONE 2026-08-19 (REV53).** Create menu on
      empty cells, bar menu + selection on phase bands, keyboard carries over; both
      draft and saved paths. Hit-testing is target-based (`data-d` on cells), not
      coordinate math. Suite: `tests/test53.js` (38 assertions, skips on the reference).
      Record: `docs/Milestones/Phase 2.5/2026-08-19-calendar-create-parity.md`. Ceilings noted
      there: marker bands stay inert; 16px band hit-targets; no menu on the empty state.
- [x] **2. Standalone events — DONE 2026-08-19 (REV54).** Events are rows in a new
      `ShopTimeline_Events` list (⚠ approved by the owner 2026-08-19 — additive only,
      colleague app unaffected). Hostless create, in-place edit/delete, phase-delete
      rescues hosted events, project-delete cleans up, draft path files rows; without
      the list the app falls back to the legacy phase-hosted save. Suite:
      `tests/test54.js`. Record: `docs/Milestones/Phase 2.5/2026-08-19-standalone-events.md`.
      ~~Owner to-do: create the list~~ — **done 2026-08-21**; the real
      `ShopTimeline_Events` path is now live.
- [x] **3. Converge draft vs saved phase-splitting — DONE 2026-08-19 (REV55).** The real
      divergence was behavioural: a dragged draft subtask snapped back on the next
      rebuild (its manual-placement key could never match pre-split bars) and line
      lookups guessed by name. Now the placement overlay reapplies after the split,
      lines resolve by the id a split bar already carries, and a rename moves the
      placement with it — draft subtasks behave like saved rows, and Save files exactly
      what the preview shows. `NPV_LINES` stays as the draft's durable store (rows can't
      survive the per-keystroke scheduler regeneration). Suite: `tests/test55.js`.
      Record: `docs/Milestones/Phase 2.5/2026-08-19-draft-saved-subtask-convergence.md`.
- [x] **4. Person filter + per-user identity — DONE 2026-08-21 (REV65–68)** —
      supersedes "Dash view" (owner direction, 2026-08-21). Correction: the old
      "per-person dashboard" was never actually designed, only named — earlier
      "designed, not built" claims were wrong. Not a separate dashboard; delivered
      as four slices on existing surfaces:
      - [x] **Person filter on the home page** — DONE 2026-08-21 (REV65), beside the
        Status filter: limits the existing Gantt to one person in both lenses;
        the pick persists per browser. Suite: `tests/test65.js`. Record:
        `docs/Milestones/2026-08-21-person-filter.md`.
      - [x] **User identity** — DONE 2026-08-21 (REV66): signed-in email →
        `Staff.email`, fallback display-name match ("me" floats to the top of the
        person filter); People & Availability gained Email + Role fields; lens,
        person pick and status filter all persist per browser. The remembered-picker
        fallback is deferred to the dashboard button (that's where the explicit ask
        lives). Per-user *row order* deliberately not done — sortIndex is shared
        shop data; a private shadow order needs its own decision. Suite:
        `tests/test66.js`. Record: `docs/Milestones/2026-08-21-identity-chain.md`.
      - [x] **Person panel in Department view** — DONE 2026-08-21 (REV67): with the
        person filter active, a bottom dock (project-page inspector style) shows
        Working on / Checkpoints / Tasks / Time off plus role, departments and
        email, synced with People & Availability. Suite: `tests/test67.js`.
        Record: `docs/Milestones/2026-08-21-person-panel.md` (ceilings: fixed
        height, events-only checkpoints, rows not clickable).
      - [x] **The "dashboard" IS that composition** — DONE 2026-08-21 (REV68):
        "My Dashboard" toolbar button enters it in one click ("me" via the identity
        chain, with a remembered ask-once picker as the last fallback); the panel
        header is a Timeline › name breadcrumb that unwinds to the home view in
        whichever lens was most recent. Suite: `tests/test68.js`. Record:
        `docs/Milestones/2026-08-21-dashboard-button.md`.
      **Item 4 complete (REV65–68).**
- [x] **5b. People & Availability fed from MS Teams — DONE 2026-08-25 (REV70).**
      The Name field suggests from the company Team (group
      `e434fc35-f2be-4dde-a258-2c23d94b5f9e`); picking a member auto-fills their
      email, and opening the editor backfills unambiguous matches for the existing
      roster. Membership is a menu, not a sync — only saved people join the app.
      `TeamMember.Read.All` consented 2026-08-25; it rides its own token request so
      failures degrade to free text. Suite: `tests/test70.js`. Record:
      `docs/Milestones/2026-08-25-teams-picker.md`. **[decision, still open]** keep
      People & Availability as a modal, or promote it to its own page — revisit if
      the roster outgrows the modal.
- [x] **5. Project edit page — subtask/phase-bar behavior — DONE 2026-08-20 (REV56).**
      All four owner notes, delivered as one remodel: the synthetic summary bar is
      retired and the **department's primary bar is the parent row** (never re-listed
      as its own subtask); subtasks render in a lighter shade of the parent's hue;
      everything resizes by edge drag; a nested subtask treats the parent's start/end
      as min/max (subtasks outside the parent window stay free — parallel subtasks
      are real data); new subtasks are born named, half the parent, never a clone.
      Suite: `tests/test56.js` (44 assertions; `test47` now guards pre-REV56 builds).
      Record: `docs/Milestones/Phase 2.5/2026-08-20-subtask-parent-hierarchy.md` — parent-role
      heuristic and clamp ceilings noted there.
- [x] **6. Calendar drag-to-move + "Add a phase" wording — DONE 2026-08-25 (REV71).**
      Phase bands drag to a new day on the calendar (saved and draft pages), with the
      Gantt's move rules: merged "+N" bands move all roster twins, nested subtasks
      clamp to the parent window, Link carries subtasks. The right-click menu's "Add a
      department" is renamed "Add a phase" (owner direction — the action creates a
      phase bar). Suite: `tests/test71.js`. Record:
      `docs/Milestones/2026-08-25-calendar-drag-and-phase-wording.md`. Its ceilings
      (no edge-resize, inert marker bands) were closed the same day by item 7.
- [x] **7. Calendar FULL parity — DONE 2026-08-25 (REV72).** Checkpoint/task bands
      got the Gantt diamonds' verbs (drag moves, click opens the agenda editor,
      right-click deletes); phase bands resize from edge handles (true-edge only,
      workday snap, Protect-dates/pin lock, nesting clamp, twins together); band hit
      areas padded to the 24px line. Suite: `tests/test72.js`. Record:
      `docs/Milestones/2026-08-25-calendar-full-parity.md` — also records what parity
      deliberately excludes (empty-state menu = a both-modes gap; "+N" click-picks
      first bar = the N16 density decision).
- [x] **Decide: dependencies between bars — decided (owner, 2026-08-25): consciously
      don't.** Half the jobs are multi-site rollouts where design/fab/finishing run in
      tandem for months, handing off chunk by chunk; the overlap and dependency amount
      is unpredictable and differs per job, so a rippling Gantt would fight the real
      workflow. Bars stay free after birth; the scheduler is a one-time layout
      assistant. Recorded in Design-Language §6. (Cheap future rung if hallway data
      shows people getting burned: a passive out-of-order flag, display-only — same
      pattern as the overbooking warning. Not planned.)
- [x] **Decide: department overlap — decided (owner, 2026-08-25): no scheduler
      setting.** Overlap is normal but not predictable upfront, so no per-department
      or per-project knob; the strict chain is just the starting layout and PMs
      sculpt bars into tandem by hand (drag, both-edge resize, N13 date fields —
      placements survive rebuilds on both paths since REV55). Chunk/site pipelines
      map onto the REV56 subtask model: parallel subtasks outside the parent window
      are deliberately legal. Recorded in Design-Language §6.
- [x] **Retire the phase modal?** Decided (E2, 2026-08-13): it stays — plain click on a
      main-timeline bar opens it (Design-Language §6); the project page keeps
      click-selects-into-inspector.

### 3a. Project Page Refinement — recovered field notes (Robert, 2026-08-17)

Robert's project-page review notes (N1–N16) travelled in a handoff that went missing;
it surfaced 2026-08-20 and is reconciled here. Four of the sixteen were built in the
meantime without the doc (the notes reached the team through the owner directly):

- **N10 — subtask behaviour, all four points** → shipped as §3 item 5 (REV56).
  Born-distinct subtasks, both-edge resize, parent start/end as min/max clamp,
  light-shade rendering (`kidShade()`); the draft/saved seam it warned about was
  converged first (REV55).
- **N12 — calendar click parity** → shipped as §3 item 1 (REV53).
- **N6, storage half** — "Phase: None" needed standalone events ⚠ → shipped as §3
  item 2 (REV54); the schema conversation the notes flagged happened 2026-08-19.
- **N14 — coach marks + help button** → **DONE 2026-08-25 (REV74),** pulled forward by
  owner decision when hallway round 2 was skipped: a Help button in the toolbar's top
  row runs a six-step spotlight tour, auto-running once for first-time users. Suite:
  `tests/test74.js`. Record: `docs/Milestones/2026-08-25-coach-marks.md`.

The ungated items shipped 2026-08-20 as **REV57** — one batch so hallway round 2 lands
on a finished page. Suite: `tests/test57.js`; record:
`docs/Milestones/Phase 2.5/2026-08-20-project-page-refinement.md` (ceilings listed there).

- [x] **N5 — Drop "In" from status labels** — display-only, stored keys untouched;
      every surface renders through `STATUS_LBL`.
- [x] **N15 — Mute the timeline toolbar on the project page** — the five main-timeline
      controls (and their /, D, W keys) hide while `ROUTE.view==='project'`; hidden,
      not greyed, per the affordance rule.
- [x] **N4 — Anchor the status label** — the pill docks right-justified in the
      schedule footer with Kickoff / Lead time / Starts-in.
- [x] **N1 — Visible breadcrumb** — Timeline ‹ name ‹ phase; the tail appears on
      selection and clicking it unwinds one layer (what Escape does).
- [x] **N2 — Unsaved-changes warning** — one confirm in the router covers every exit
      (all funnel through the hash) + `beforeunload`; the phase modal snapshots at
      open. Draft-only, saved pages autosave.
- [x] **N13 — Department manual Start/End date fields** — bidirectional,
      workday-snapped, committing through the same paths a drag uses on both the
      draft and saved pages; process-name moved under "Other".
- [x] **N6/N7 — Agenda inline editors — DONE 2026-08-21 (REV64), without waiting on
      N9.** The panel (now "Checkpoints & Tasks") is the Home modal's checkpoint editor:
      every row edits Name, Date, Notes and a Phase dropdown (incl. "No phase") in
      place; task rows the same shape with due date and who. Time-of-day was dropped —
      events never stored one. Deletes work from the row (always-visible ×) and by
      right-click on the chart marker. Record:
      `docs/Milestones/Phase 2.5/2026-08-21-checkpoints-everywhere.md`.
- [x] **N8 — "Not on a phase" row renamed to "Events"** — renamed again to
      "Checkpoints" in REV64's language pass; tasks left it for their own "Tasks" row.
- [x] **N11 — Left/right click muted on the project-page Gantt** — left selects/edits,
      right-click menus are add-only with an inline name field (Enter creates);
      rename/duplicate/delete moved to the inspector; the calendar aligned (supersedes
      REV53's left-click create) and Design-Language §6 updated.
- [x] **N16 — Calendar density** — roster fan-out collapses to one band per phase
      (+N chip); a "Selected only" toggle filters bands to the selection.
Still open in this track (gated on decisions or schema):

- [x] **N3 — Client list — DONE 2026-08-25 (REV69).** The Client field is a native
      type-ahead fed by `ShopTimeline_Clients` (columns `Title`/`field_2`, confirmed
      by the owner) on both draft and saved pages — free text still works, so legacy
      and one-off clients never break; the list is managed under **Settings →
      Clients** (add/edit/remove, aliases uppercased, dupes rejected), and an absent
      list degrades to browser-local with one warning on save. Suite:
      `tests/test69.js`. Record: `docs/Milestones/2026-08-25-client-list.md`. **Unblocked 2026-08-21 — the list
      exists:** owner imported the Excel client master (see provenance below) with
      only the real data columns, **Client Name** + **Alias** (job-code suffix); the
      derived counter columns were culled at import (project counts get solved from
      the master list later). **Color: decided (c) — no client color** (owner,
      2026-08-21): 3–4 big clients run many simultaneous job codes, so client-hued
      projects would be indistinguishable; recorded in Design-Language §2.2.
      **Provenance** (traced 2026-08-21): the canonical roster was an untethered
      Excel workbook; an adjacent SharePoint list re-enters clients manually to feed
      the native Teams calendar (one-way, clunky, disliked). **Divergence rule until
      cutover:** Excel stays master for job codes; the list is master for what the
      scheduler shows; new clients get entered in both.

**Decisions gating this track (owner):**

- [x] **N9 — Tasks vs events — DECIDED (owner, 2026-08-25): checkpoints wins, keep
      both.** The two stores stay (`ShopTimeline_Events` + `ShopTimeline_Tasks2`) and
      both surfaces remain — an unused feature is acceptable. No migration, no merge,
      no code change. Decided directly when hallway round 2 was skipped (§4).
- [x] **N3 schema + color** — resolved 2026-08-21: list created, color dropped
      (see N3 above).

Keep the **"test both draft and saved paths"** rule for every feature here (the REV49
lesson — `tests/README.md`).

## 4. Validation & promotion (after §3 features land)

In order:

- [x] **Hallway test round 2 — SKIPPED (owner, 2026-08-25),** not deferred: management
      pushed toward a viable product and no team availability existed to run it. The
      facilitator script (`docs/Hallway-Test-Round-2.md`) stays ready — it becomes the
      round-3 baseline if a round ever runs. The three decisions it was meant to feed
      were made directly by the owner instead: **N14 coach marks approved outright**
      (shipped as REV74), **N9 decided** (checkpoints wins; keep both stores — an
      unused feature is acceptable), and **promotion approved** (below). Phase 3's
      zoom-vs-saved-views scope question is now undecided by data — it waits for the
      owner's task briefs (§6).
- [x] **Promote `development` → `main` — MERGED 2026-08-25:**
      [#15](https://github.com/221twoseven/Project-Scheduler/pull/15) carried
      **REV53–73** (Phase 2.5, the dashboard track, client list, Teams picker, full
      calendar parity, deferred polish) to production. Owner merged via ruleset bypass.
- [x] **Backfill the "PR link: pending" lines** — done 2026-08-20: all five Phase 2
      records and the five REV53–57 records now link PR #15.

## 5. Data / schema (⚠ all need approval — shared Lists)

- [x] **Add `email` and `role` columns to `ShopTimeline_Staff`** — done 2026-08-21
      (owner; both single-line text). Unblocks the person filter's identity chain
      (§3 item 4).
- [x] **New Graph scope to read Team membership** — done 2026-08-25:
      `TeamMember.Read.All` (delegated) added to the app registration and
      admin-consented (via the app-Owner + admin-consent route after the scoped-role
      path hit the Premium wall). Used by §3 item 5b (REV70).
- [x] **New `ShopTimeline_Clients` List** — created 2026-08-21 (owner) by importing
      the Excel client master; columns **Client Name** + **Alias** only, derived
      counters culled at import. See N3 for provenance and the
      Excel-stays-master-for-job-codes divergence rule.
- **North star (owner, 2026-08-21): SharePoint Lists become the database, period.**
  The Excel client master, the adjacent manual calendar-feeder list, and the native
  Teams calendar workflow all eventually collapse into this app's Lists. Sequenced
  deliberately — nothing live gets replaced until the list-side copy has proven
  itself. (Job codes could then auto-assign: Alias + computed next number.)
- [ ] Any schema change must be checked against the colleague app before shipping.
- (`ShopTimeline_Tasks2` existence check lives in §1.)

## 6. ON HOLD — UX Phases 3 & 4

On hold until the higher-priority edits in §3 ship. The gap between Phases 2 and 3 is
now recorded as **Phase 2.5** (see §10). Phase 3 has only the strategy-doc summary so
far — **it still needs task briefs from the owner** (the Phase 1/2 pattern:
`docs/Phase-N-Task-Briefs.md`). Scope lives in `docs/UX-Audit-and-Strategy.md` (kept
as the strategy reference — not a to-do doc):

- **Phase 3 — navigation at scale:** B3 zoom + jump-to-date, B5 compact density,
  B6 saved views. Per the Phase 2 brief: B3/B5 if PMs still report navigation pain
  after the hallway test; B6 if they don't. (The person filter — ex-"Dash view" —
  overlaps Phase 3 but is pulled forward into §3 as feature work.)
- **Phase 4 — learnability layer:** first-run hint bar, `?` shortcuts sheet,
  sample-project onboarding. Deliberately last. **Coach marks (N14) pulled forward
  and shipped 2026-08-25 as REV74** — the first-run hint bar is likely redundant now;
  reassess the rest of Phase 4 against the tour before briefing it.

## 7. Deferred polish (ceilings from Phases 1–2 — batch into a later polish pass)

None are bugs; none block users. Full context in `docs/Milestones/Phase 1/` and
`Phase 2/` records. The four unconditional items shipped 2026-08-25 as **REV73**
(`docs/Milestones/2026-08-25-deferred-polish-pass.md`); the rest keep their
own "only if it proves needed" gates.

- [x] Resize handle zones widen to 12px on bars narrower than 60px (T3) — REV73.
- [x] Draft-page *moves* show no undo toast (resizes have one — T3) — REV73.
- [x] Two-chip rows (bars straddling both viewport edges) untested against dense real
      data (T6) — covered in `test-b1.js`, REV73.
- [x] The "all hidden" empty-state card only knows the status filter, not search/
      spotlight (T7) — REV73.
- [ ] Native `title` tooltips — unstyled, invisible on touch; reconsider if touch use
      materializes (T8).
- [ ] Toast dock offset computed at fire time, not on dock drag-resize; a live toast can
      briefly overlap the dock (U7). Add a resize listener only if someone notices.
- [ ] The 📌 glyph on the "Pin dates" modal is still unicode; swap to the SVG set when
      that modal is next touched (U6).
- [ ] Persistent error banner with explicit close, if the ~5s toast auto-dismiss still
      proves too fleeting after U7's docking (carried from T7).

**Deliberate design ceilings — no action planned, revisit only on real complaints:**
12-slot palette repeats at 13+ visible projects (T2); quiet re-selection after a committed
project-page resize/move (T4); sidebar names >~26 chars truncate at default width (T5);
off-screen edge chips don't dim with the search filter (T6); bottom-dock column minimum
widths are fixed (U2/E1); In-Design and In-Fabrication bars both full-strength on purpose,
the pill word separates them (U8).

## 8. Documentation upkeep

- [ ] Keep `docs/ARCHITECTURE.md` and `CLAUDE.md` in sync as the app evolves.
- [ ] Confirm whether the manager-facing PDF in `docs/` should stay, be regenerated from
      the markdown, or be retired (kept as-is for now).
- Standing rule: **re-verify the handoff doc's world-state claims before quoting them** —
  it's history + rationale; `docs/ARCHITECTURE.md` and `docs/SETUP.md` are current state.

## 9. Housekeeping (optional, cosmetic)

- [ ] Decide the fate of the remote `benchmarks---DO-NOT-MERGE` branch (old builds
      Timeline 34–44). Archive or remove.
- [ ] Commit history is noisy (`test`, `Add files via upload`). Leave it, or clean
      deliberately (history rewrite — only on agreement, never on shared branches).
- [ ] Consider a lightweight lint/format pass for the single HTML file (optional; don't
      let it cause churn on working code).
- [x] `tests/harness.js` jsdom stub tidied (2026-08-19): neutral example.com URL and
      account replace the old personal Pages URL and email.
- [ ] Shared shop-terminal account — decide whether it needs a paid licence.

## 10. Docs reorganization — Phase 2.5 (2026-08-21)

The REVs shipped between UX Phase 2's close (2026-08-14) and the not-yet-briefed
Phase 3 are categorized as **Phase 2.5**. Moves made:

- **Created `docs/Milestones/Phase 2.5/`** and moved the twelve REV53–64 records into
  it: calendar-create-parity, standalone-events, draft-saved-subtask-convergence
  (08-19); breadcrumb-trail, draft-autosave, left-click-editor-cleanup,
  project-page-refinement, roster-fanout-vs-lines, subtask-parent-hierarchy,
  title-row-uncovered, work-priority-crews (08-20); checkpoints-everywhere (08-21).
- **Consolidated screenshots into `Phase 2.5/screenshots/`** (matching the Phase 1/2
  layout): the Milestones-root `screenshots/` folder (rev57-*, rev59-*,
  subtask-hierarchy, checkpoints-editor PNGs) plus the two stray per-record folders
  (`2026-08-20-breadcrumb-trail/`, `2026-08-20-work-priority-crews/`) — which also
  fixed those two records' image links, broken since they referenced a `screenshots/`
  folder that wasn't next to them.
- **Added the index record** `docs/Milestones/2026-08-21-phase-2-5-feature-interlude.md`
  (same pattern as the Phase 1/2 summary records).
- **Left at the Milestones root:** the 08-12 infra/perf records, the Phase 1/2 summary
  records, and `2026-08-19-pages-deploy-trim.md` (infrastructure, no app REV).
- **Repointed every stale path** to the moved records (this file ×6,
  `docs/Handoff-2026-08-20.md` ×1). (That handoff was retired 2026-08-25 — its
  critical path completed as REV65–70 and its "traps" section moved to
  `tests/README.md`; `git log` keeps the full text.)
- **Reconciled open items against Phase 2.5 decisions:** §3a N6/N7 closed (REV64
  delivered the agenda editors), N8 annotated (row says "Checkpoints" now), N9
  downgraded to a data-model-only decision, §4's PR #15 scope corrected to REV53–64.
  Calendar parity, standalone events, and the subtask items were already ticked.
- **Noted in §6:** Phase 3 still needs owner task briefs before work starts.

---

### Legend

- ⚠ Needs explicit approval — touches shared SharePoint schema or Entra/auth config.
- Feature items in §3 are distilled from `docs/Handoff-Notes.md` ("Open items"); see that
  file for conventions, traps, and REV34–50 history.
