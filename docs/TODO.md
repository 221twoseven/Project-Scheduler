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
      **Owner to-do: create the list** (column recipe in `docs/SETUP.md`) — until then
      the app keeps the old behaviour.
- [x] **3. Converge draft vs saved phase-splitting — DONE 2026-08-19 (REV55).** The real
      divergence was behavioural: a dragged draft subtask snapped back on the next
      rebuild (its manual-placement key could never match pre-split bars) and line
      lookups guessed by name. Now the placement overlay reapplies after the split,
      lines resolve by the id a split bar already carries, and a rename moves the
      placement with it — draft subtasks behave like saved rows, and Save files exactly
      what the preview shows. `NPV_LINES` stays as the draft's durable store (rows can't
      survive the per-keystroke scheduler regeneration). Suite: `tests/test55.js`.
      Record: `docs/Milestones/Phase 2.5/2026-08-19-draft-saved-subtask-convergence.md`.
- [ ] **4. Person filter + per-user identity** — supersedes "Dash view" (owner
      direction, 2026-08-21). Correction: the old "per-person dashboard" was never
      actually designed, only named — earlier "designed, not built" claims were wrong.
      Not a separate dashboard; three smaller pieces on existing surfaces:
      - **Person filter on the home page**, beside the Status filter: limits the
        existing Gantt to one person, in both Projects and Departments views.
      - **User identity** — the chain stands: signed-in email → `Staff.email`,
        fallback display-name match, fallback a remembered person picker. Used to
        float "me" to the top of the person filter and to make views sticky per
        user (project-row sort/order, filter state) so each login lands where it
        left off.
      - **Person panel in Department view**: with the person filter active, the
        real estate the project-edit form uses shows the person's info under the
        Gantt — relevant dates, tasks, milestones, time off, department, title —
        in sync with People & Availability (Settings).
      - **The "dashboard" IS that composition** (owner, 2026-08-21): Department view
        + person filter set to the logged-in user + person panel below. Reached by a
        **single button**; a title bar / breadcrumb in the project-edit-page style
        says where you are and links back to the home view (the unfiltered Gantt, in
        whichever lens — Projects or Departments — was most recent).
      Still gated on the ⚠ `Staff.email`/`role` columns (§5).
- [ ] **5b. People & Availability fed from MS Teams. ⚠** The name field becomes a
      dropdown of members of the existing Team in MS Teams; the Team has more members
      than the scheduler needs, so people are selected into the app from that larger
      list inside People & Availability. Reading team membership needs a **new Graph
      scope** (e.g. `TeamMember.Read.All`) + admin consent — an Entra change, bundle
      into the §5 conversation. **[decision]** keep People & Availability as a modal,
      or promote it to its own page.
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
- [ ] **Decide: dependencies between bars.** Nothing links a bar to its predecessor
      except the scheduler chain. Have real dependencies, or consciously don't —
      avoid half-having them.
- [ ] **Decide: department overlap.** The scheduler chains strictly; overlap only happens
      via hand-pinning (and a pinned bar stops tracking). Should overlap be a
      per-department scheduler setting?
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
- **N14 — coach marks + help button** → already tracked as Phase 4 (§6). Pull forward
  only if hallway round 2 shows testers stuck.

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

- [ ] **N3 — Client list. ⚠** Client assignment becomes a dropdown fed by a shared
      list, with "Add new…" opening an edit modal (Name, Color, Notes); manageable
      from a home-page Settings entry like Staff; degrade to browser-local with one
      warning if the List is absent. Needs a new `ShopTimeline_Clients` List —
      additive only, but ⚠ approval + colleague-app check first (bundle into the §5
      conversation). **[decision]** Client Color's job first: (a) becomes the
      project's hue (one identity system — recommended), (b) accent only, or
      (c) drop the field. Record the choice in Design-Language §2.

**Decisions gating this track (owner):**

- [ ] **N9 — Tasks vs events (now "checkpoints vs tasks").** Still open, but REV64
      shrank the stakes: both already share one editor shape and one panel, and tasks
      have their own chart row. What's left is purely data-model — keep two stores
      (`ShopTimeline_Events` + `ShopTimeline_Tasks2`) or merge them. Decide with
      hallway round 2 data; no UI work is gated on it anymore.
- [ ] **N3 schema + color** — see above; same sitting as the §5 ⚠ conversation.

Keep the **"test both draft and saved paths"** rule for every feature here (the REV49
lesson — `tests/README.md`).

## 4. Validation & promotion (after §3 features land)

In order:

- [ ] **Hallway test round 2** — the five tasks from `docs/UX-Audit-and-Strategy.md` §6,
      with real people; compare assist counts to round 1. Deliberately deferred until the
      §3 features exist so the test covers them. The refinement batch (REV57) is live on
      `/preview/` — the page is ready for testers.
- [ ] **Promote `development` → `main`** — the PR is open:
      [#15](https://github.com/221twoseven/Project-Scheduler/pull/15). It tracks the
      branch head, so it now carries **all of Phase 2.5 (REV53–64)**; its title still
      says "REV53-62" and should be refreshed before merging. **Merge is the owner's
      call** — after hallway round 2, or sooner if production wants the fixes now; the
      ruleset and CI gate it either way.
- [x] **Backfill the "PR link: pending" lines** — done 2026-08-20: all five Phase 2
      records and the five REV53–57 records now link PR #15.

## 5. Data / schema (⚠ all need approval — shared Lists)

- [ ] **Add `email` and `role` columns to `ShopTimeline_Staff`** (needed for the
      person filter's identity chain, §3 item 4). ⚠
- [ ] **New Graph scope to read Team membership** (e.g. `TeamMember.Read.All`, for the
      People & Availability dropdown, §3 item 5b). ⚠ **Approved 2026-08-21** — owner
      is now an Entra admin and OK'd the scope. Still to do at build time: add the
      scope to the app registration + grant admin consent.
- [ ] **New `ShopTimeline_Clients` List** (for §3a N3 — client dropdown + Settings
      management). Additive only, colleague app never reads it — same shape as the
      Events-list approval. ⚠ Bundle into one conversation with the Staff columns above.
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
  sample-project onboarding. Deliberately last.

## 7. Deferred polish (ceilings from Phases 1–2 — batch into a later polish pass)

None are bugs; none block users. Full context in `docs/Milestones/Phase 1/` and
`Phase 2/` records.

- [ ] Resize handle zones widen to 12px on bars narrower than 60px (T3).
- [ ] Draft-page *moves* show no undo toast (resizes have one — T3).
- [ ] Two-chip rows (bars straddling both viewport edges) untested against dense real
      data (T6).
- [ ] The "all hidden" empty-state card only knows the status filter, not search/
      spotlight (T7).
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
  `docs/Handoff-2026-08-20.md` ×1).
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
