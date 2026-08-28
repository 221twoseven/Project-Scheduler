# To-Do / Backlog — v1 (ARCHIVE)

> **Retired 2026-08-28.** This is the completed v1 backlog (REV50 → v1.0.1), kept as
> history and rationale. **The working backlog is [`docs/TODO.md`](../TODO.md)** — its
> §7 ledger carries forward every entry here that was still open at archive time.

**The single working to-do list for Project Scheduler (Timeline).** Ranked by priority,
with the quick wins pulled to the top. Anything touching **SharePoint schema** or
**Entra/auth** is marked ⚠ and needs explicit approval first (shared with a separately
maintained colleague app — see `CLAUDE.md`).

Sequencing decisions (2026-08-19):

- **Feature work comes before hallway test round 2.** Calendar functionality is a crucial
  feature; the hallway test is more useful once it exists. (This supersedes the U8 record's
  "hallway test before promotion" ordering.)
- **UX Phases 3 and 4 are ON HOLD** until the higher-priority items in §3 ship (see §6).
  *(Hold lifted: Phase 3 shipped 2026-08-25/26 as REV75–79; Phase 4 rescoped in §6.)*
- `docs/Archive/UX-Audit-and-Strategy.md` is a **strategy summary, not a to-do list** — it stays
  as-is; this file is where actionable state lives.

Last reviewed: 2026-08-27 — wrap-up pass: Phase 3.5 closed (toolbar Option A shipped
as REV88), Phase 4 shipped whole (REV89), and every §8/§9 loose end decided or done
(the shop-terminal licence question is the one item left open — a business call, not
a code task). Earlier review note (2026-08-21): the REV53–64 run between UX Phases 2 and 3 is
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
      facilitator script (`docs/Archive/Hallway-Test-Round-2.md`) stays ready — it becomes the
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
- [x] **Promote `development` → `main` — MERGED 2026-08-27:**
      [#23](https://github.com/221twoseven/Project-Scheduler/pull/23) carried
      **REV74–91** (Phase 3, all of Phase 3.5, Phase 4, and the 2026-08-27
      pre-merge audit pass — REV90 fixes + REV91 dead-code cleanup, see
      `docs/Milestones/2026-08-27-pre-merge-audit-pass.md`) to production.

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
- **Standing rule (not a task):** any schema change must be checked against the
  colleague app before shipping.
- (`ShopTimeline_Tasks2` existence check lives in §1.)

## 6. UX Phase 3.5 & Phase 4

**Phase 3 is COMPLETE** (2026-08-25/26, REV75–79, briefs V1–V4 of the owner's
`Phase-3-Task-Briefs.md`): B3 zoom steps + jump-to-date, B5 three density levels +
group collapse, B6 named saved views. Record:
`docs/Milestones/2026-08-26-phase-3-navigation-at-scale.md`; deferrals in §7.
**Phase 3.5 is COMPLETE** (2026-08-27, REV80–88) and **Phase 4 is COMPLETE**
(2026-08-27, REV89) — the promotion hold is lifted; everything rides
[PR #23](https://github.com/221twoseven/Project-Scheduler/pull/23) (see §4).

### Phase 3.5 — owner review adjustments (2026-08-26, before the PR #23 merge)

The owner's review of the REV79 build (2026-08-26) produced this punch list. It
lands on `development` ahead of the promotion merge — new commits ride the same
PR, so [#23](https://github.com/221twoseven/Project-Scheduler/pull/23) waits
until this list is done (or the owner trims it). Grouped by surface;
`[decision]` items need the owner's call before code.

**New Project ↔ Project Edit parity:**

- [x] **Audit: the New Project window and Project Edit window should match.**
      Find and list every difference in display/render, layout, interactivity,
      and click behavior — the diff list is the first deliverable, convergence
      fixes follow from it. Confirmed keeper (the "keep pile"): the hover
      tooltip showing Phase + Subtask info — **add the team member name** to it.
      **Diff list DELIVERED 2026-08-26: `docs/Archive/Phase-3.5-Parity-Audit.md`** —
      ~30 differences in four categories, one confirmed bug (draft "Add a
      phase" is a silent no-op), deliberate differences flagged, convergence
      order recommended. **Owner decided rows 1–3 the same day** (decisions
      recorded in that doc); the quick wins shipped as **REV81**
      (`docs/Milestones/2026-08-26-parity-quick-wins.md`): I8 bug fixed, I13
      leak hygiene, I14 working Pin + refusal toasts, D7 Draft pill, D8
      Automatic-status option, D9 edit-debounced stash, tooltip crew name.
      **The inspector convergence shipped as REV82** the same day
      (`docs/Milestones/2026-08-26-inspector-convergence.md`): draft selection
      is real, the popover is retired, the shared bottom inspector serves both
      pages, all selection verbs + Link + ⌘Z work on drafts, saved reorder
      persists, and the saved page's silently-broken Notes field now saves.
      **§4 click-behavior rows CLOSED 2026-08-26 (verified, REV83):** every row
      was already converged by REV81/82 — the crumb/× handlers were only no-ops
      because `ppSelect` was, and the calendar band click routes through the
      same selection path. The one survivor is the **double-click** row:
      unbound on both pages, `[decision]` candidate for "open editor" (see the
      audit doc). **DECIDED 2026-08-27: stays unbound** — single-click already
      opens the editor, and Design-Language §6 reserves unspent verbs. The
      audit is fully dispositioned; row closed in the audit doc.

**Global project view (main timeline):**

- [x] **Scroll wheel over the project sidebar** — DONE 2026-08-26 (REV80): the
      sidebar forwards the wheel (both axes) to the Gantt scroller. Suite:
      `tests/test80.js`. Record: `docs/Milestones/2026-08-26-global-view-polish.md`.
- [x] **Date bar drag-to-pan** — DONE 2026-08-26 (REV80): the timeline header
      drags to pan; a 4px threshold keeps month-name clicks (goto popover)
      working. Suite/record: as above.
- [x] **Today button padding** — DONE 2026-08-26 (REV80): the timeline toolbar
      row gained left padding. Suite/record: as above.
- [x] **White text on Gantt header bars** — DONE 2026-08-26 (REV80): the light
      identity/department palette slots were darkened (same hues) so every bar
      fill takes a white label at ≥4.5:1; `labelColor()` unchanged, the palette
      now sits below its ink flip point everywhere. Design-Language
      §2.2/§2.3/§2.5 updated. Suite/record: as above (+`test-contrast`,
      `test-cb` still green).
- [x] **Toolbar clarity** — two toolbars with competing/mixed function
      categories: view styles (color: Project/Team · vertical scale:
      Comfortable/Snug/Compact · horizontal scale: Day/2-Day/Week/Month), data
      filters (search, status, person), and actions (Dashboard, Print, New
      Project, Help, Today, and now saved Views). "There has to be a better way
      of organizing and grouping these buttons and controls" — a grouping
      design pass first, then implement.
      **Design pass DELIVERED 2026-08-27:** `docs/Archive/Toolbar-Grouping-Proposal.md`
      — three options (recluster-in-place / one View menu / single row) with a
      recommendation (A: recluster row 2 into Where / How-drawn / What-shown,
      surface Density out of Settings, Views to the row's edge).
      **DECIDED 2026-08-27: the owner picked Option A — shipped the same day as
      REV88** (`docs/Milestones/2026-08-27-toolbar-regroup.md`): Where / Style /
      Filter clusters with eyebrow labels, Density surfaced as a one-click cycle
      button (the Settings item stays as an alias for a release, ledgered in
      §7), Views · Protect dates · ? at the right edge. The grouping rule is
      codified in Design-Language §2.6. Suite: `tests/test88.js`.
      **Phase 3.5 is COMPLETE** — this was its last open row.

**Calendar view:**

- [x] **Default view collapses each phase** (subtasks hidden); left-click opens
      the Phase Edit form at the bottom of the screen and brings the subtasks
      into view. DONE 2026-08-27 (REV84): the calendar paints one band per phase
      (the +N roster merge intact); selection expands the phase's subtasks, and
      the click already opened the bottom editor (REV53/82). Suite:
      `tests/test84.js`. Record:
      `docs/Milestones/2026-08-27-calendar-collapse-breadcrumb-bar.md`.
- [x] **Drag-resize live feedback — DONE 2026-08-26 (REV83).** While an edge
      handle drags, the day columns the band will span after the workday snap
      tint live and clear on release; the snap itself is unchanged. Suite:
      `tests/test83.js`. Record:
      `docs/Milestones/2026-08-26-calendar-live-resize.md`.

**Project Edit / New Project pages:**

- [x] **Coach marks / help tour on Project Edit and New Project** — extend the
      REV74 tour to these views. `[decision]` are they one view or two for
      tour purposes? (Feeds the parity audit above.)
      **DECIDED 2026-08-27: ONE shared tour** — the REV82 convergence made the
      pages near-identical; a one-step branch covers the draft's Create
      button. **Shipped same day as REV86:** Help starts the project tour in
      place (no more bounce to the timeline); the existing missing-target
      filter supplies the branch (draft → Create step, saved → autosave step).
      Help-only, no first-visit auto-run (ledgered in §7). Suite:
      `tests/test86.js`. Record:
      `docs/Milestones/2026-08-27-project-page-tour.md`.
- [x] **Coach-mark copy: remove "Nothing else is red." — DONE 2026-08-26
      (REV83).** The tour step now ends at "Red bars are installs."; the legend
      screen's matching line was scoped to bars ("no other bar is ever red") —
      the rule stays, the site-wide claim is gone.
- [x] **Move the nav breadcrumb to its own bar**, separated from the project
      summary bar (client, job, install, etc.). DONE 2026-08-27 (REV84): the
      trail bar gained a hairline below it, the summary strip sits beneath as
      its own band — CSS only. Record: as above.
- [x] `[decision]` **Fourth exit?** Current exits from project views: Esc,
      Done, breadcrumb. Add an × in the top-right corner?
      **DECIDED 2026-08-27: add it — shipped as REV85** the same day: an × at
      the right edge of the breadcrumb bar (both pages), same action as
      Done/Esc. Suite: `tests/test85.js`. Record:
      `docs/Milestones/2026-08-27-decisions-and-x-exit.md`.

**Completion flow:**

- [x] **Manual "complete" button in project edit** — clears the "late"
      messages, greys out everything under that event, but leaves it on the
      timeline. ⚠ check: a completed flag/status must persist — verify the
      storage shape against the colleague app before shipping.
      **Storage shape VERIFIED 2026-08-27:** both apps share the stored
      `status` column on `ShopTimeline_Projects`, and `complete` is already a
      first-class value in the colleague app (its own status dropdown offers
      it, its `STATUS_MIGRATE` maps legacy values onto it, and it renders it
      dimmed with a grey pill). The button writes `status='complete'` — an
      existing column, an existing value, **no schema change and no cross-app
      risk**. Both apps' deadline/"late" logic already skips
      `projectStatus(p)==='complete'`, so the late messages clear for free.
      Code can start whenever the owner green-lights the flow.
      **GREEN-LIT 2026-08-27: build both** (the button and the PM prompt).
      **SHIPPED same day as REV87:** footer Mark complete (undoable; disabled
      "✓ Complete" after; reopen via the Setup status dropdown) + the meta
      strip's overdue cell and late warning now respect a complete status.
      Suite: `tests/test87.js`. Record:
      `docs/Milestones/2026-08-27-completion-flow.md`.
- [x] **PM late-project prompt** — when a PM opens the app (identity
      authenticated), projects whose install dates have passed (reading
      "late") with a Project Manager assignment matching the signed-in user
      prompt that PM to confirm each project has ended or been extended.
      **SHIPPED 2026-08-27 (REV87):** once-a-day overlay after load (never over
      the tour or another overlay); rows carry Open and Mark complete, Later
      dismisses until tomorrow. Suite/record: as above.

### Phase 4 — learnability layer (rescoped 2026-08-26)

**Phase 4 is what remains after 3.5**, rescoped at the phase-3 close against the fact that
**coach marks (N14) shipped early as REV74**. **Owner go-ahead 2026-08-27 — all
four SHIPPED the same day as REV89**
(`docs/Milestones/2026-08-27-phase-4-learnability.md`, suite `tests/test89.js`).
**Phase 4 is COMPLETE**; only the strategy doc's optional 60-second explainer
remains unbuilt, and stays optional.

- [x] **Drop the first-run hint bar** — DECIDED 2026-08-27 (owner): dropped, as
      recommended. It was never built; the REV74 tour does its whole job. No code.
- [x] **`?` shortcuts sheet on the main timeline** (A2) — REV89: same overlay as
      the project page's, with the timeline's own keys; opens on `?` or the new
      "Keyboard shortcuts…" legend entry, closes on Esc or any click.
- [x] **Sample-project onboarding** (A5) — REV89: "Add a sample project" on the
      empty-state card runs `seed()` through the normal create path; the records
      are flagged + name-marked "Sample · " and live in this browser only
      (`spSync` strips them, the slice stashes to localStorage, load/poll
      re-attach it, delete clears it; the shared staff roster is snapshotted
      around `seed()`). The card's "always renders" half shipped earlier
      (REV73/T7). Also fixed in passing: `undo()` dropped `ST.events` — a latent
      delete-all-events data-loss bug since REV54.
- [x] **Hover affordances** — REV89: a faint ⋯ at a hovered bar's right end
      advertises the context menu; label-colored, `pointer-events:none`.

## 7. Deferred & skipped ledger (moves not made — rationale, blocker, later decision)

The running record of moves deliberately skipped or deferred. Each entry keeps its
**rationale** (why not now), its **blocker or gate** (what would change the answer),
and — once one lands — the **later decision**, updated in place with a date/REV, never
deleted (the `[x] … — REV73` entries below are the pattern). Per-change context lives
in each `docs/Milestones/` record's "Known ceilings / follow-ups" section; this
section is the aggregate. Process-level skips (e.g. hallway round 2) are recorded
where they were decided (§4/§6). None of these are bugs; none block users.

**Phases 1–2** — the four unconditional items shipped 2026-08-25 as **REV73**
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

**Phase 3:**

- [ ] Jump memory — persisting the last-jumped date or a recent-dates list in the Go
      to date popover. Skipped in REV76 (B3b): not in the brief, no observed need;
      the quick picks cover the known destinations. Gate: PMs asking the timeline to
      remember where they jump. (2026-08-25)
- [ ] On very narrow windows the go-to-date popover, opened from a month-name click,
      can sit left of the pointer (it clamps on-screen). Cosmetic; refine the anchor
      math only if someone trips on it. (REV76)
- [ ] Very short projects (< ~2 weeks) render pill-only at Week zoom — intended per
      Design-Language §7 anatomy thresholds (px constants `BAR_W_*`). Gate: real
      complaints about lost labels. (REV75)
- [x] The V3 density tokens — settled by owner ruling, 2026-08-26: the first cut
      shipped §4's written two-level 44/32 (REV77, PR #19); the owner ruled Comfortable
      too tight, briefly reset to 56/44, then settled on **three levels — Comfortable 56
      (the pre-B5 default) / Snug 44 / Compact 32** (REV78, PR #20), amending §4. The
      brief's "30 projects fit one screen" acceptance holds at Compact (30×32 = 960px,
      borderline on a 1080p laptop; a collapsed group or filter gives slack). (REV78)
- [ ] The sidebar ⇕ All button doesn't fold the sort-group headers (PM/client/status) —
      it still only toggles project phase rows and department sections. Add "collapse
      all groups" if PMs ask for it. (REV77)
- [ ] Saved views (V4) deliberately don't capture sidebar width, panel gutter, scroll
      position, or the linked-subtasks toggle — workspace ergonomics, not "a view".
      Gate: someone saves a view and misses one of them. (REV79)
- [ ] A saved view recalls the grouping but not a per-person *ordering* — sort order is
      the shared `sortIndex` in project data, one truth for every browser. Changing that
      is a data-model decision, not a view feature. (REV79)

**Phase 3.5:**

- [ ] The white-bar-text rule (REV80) covers the bar palettes only; the project
      page's light subtask shades (`kidShade()`) still use the computed label and
      can pick ink. Extending white there means darkening the child shades and
      losing the light-tint hierarchy. Gate: owner extending the rule. (2026-08-26)
- [ ] Drag-to-pan (REV80) lives on the date header only — canvas drag still belongs
      to bar move/resize. Gate: PMs asking to grab the canvas itself (needs a
      modifier-key design). (2026-08-26)
- [ ] The draft's "Add a phase" (REV81, I8) ignores the menu's optional name field —
      the new bar is the department's primary and takes the department's name (the
      saved path names the bar). Gate: someone typing a name there and missing it.
      (2026-08-26)
- [ ] The phase-inspector Pin checkbox (REV81, I14) uses the unicode 📌 — same U6
      ceiling as the Pin-dates modal; swap together when that modal is next
      touched. (2026-08-26)
- [ ] The Department dropdown is disabled on drafts (REV82) — moving a phase
      between departments is a saved-page concept; on a draft, departments are the
      checklist. Gate: someone actually wanting to re-department a draft subtask.
      (2026-08-26)
- [ ] A draft's selection key for an unsplit bar ("d:dept") falls back to the
      department's first bar if an edit splits the department mid-selection —
      benign today (it IS the same bar); revisit only if re-parenting ever lands.
      (REV82)
- [ ] The calendar's live resize tint (REV83) covers edge-resize only —
      drag-to-move keeps its tooltip-only feedback; the owner's note named
      resize specifically. Gate: the same complaint about moves. (2026-08-26)
- [ ] A collapsed calendar phase (REV84) spans only the parent bar's window — a
      subtask deliberately scheduled outside it (the chunk-pipeline case, legal
      per Design-Language §6) is invisible until the phase is clicked. Fix, if
      needed: stretch the collapsed band to the department's min/max extent the
      way the Gantt's collapsed row does. Gate: a PM missing an out-of-window
      subtask. (2026-08-27)
- [ ] The calendar's collapse follows the selection only — it deliberately
      ignores the Gantt's ▸ expand state (`NPV_OPEN`), matching the owner's
      wording ("default view collapses each phase"). Gate: someone expecting
      the two surfaces to share expansion. (REV84)
- [ ] The positional parent model shows through the collapse: resize/move a
      phase so it starts after one of its subtasks and the subtask becomes the
      department's first bar — the collapsed calendar then shows *its* band as
      the phase (the Gantt's parent row flips identically, so the surfaces
      agree). No stored parent flag exists by design (REV56 ponytail note).
      Gate: a PM confused by the swap. (REV84)
- [ ] The PM prompt's once-a-day key (REV87) is per-browser, not per-user — on
      a shared machine one PM's "Later" swallows another PM's daily ask until
      the next day. Fix if shared stations complain: key it by account
      username. (2026-08-27)
- [ ] The project-page tour (REV86) is Help-only — no first-visit auto-run.
      The REV74 timeline tour auto-runs once on a fresh browser; auto-running
      the project tour too would surprise every existing user on their next
      project open (and needs a second seen-key the preview/test stubs would
      have to seed). Gate: owner wanting auto-run for new hires. (2026-08-27)
- [ ] The Settings → Density menu item stays as an alias of the new toolbar
      density button for one release (REV88), then retires. Gate: the next
      release after REV88 ships to `main`. **Gate FIRED 2026-08-27 — REV88–91
      merged to main via PR #23; retire the alias in the next REV that touches
      the toolbar/menus.** (2026-08-27)
- [ ] The toolbar's Where/Style/Filter eyebrow labels hide below 1400px width
      (the existing `t-mini` media rule) — separators still mark the clusters.
      Gate: small-screen users missing the grouping. (REV88)

**Phase 4:**

- [ ] The ⋯ hover cue (REV89) covers main-timeline bars only — the project
      page keeps its richer hover tooltip and the REV86 tour instead. Gate:
      the same discoverability complaint there. (2026-08-27)
- [ ] A stashed sample project re-attaches only after a successful load — a
      browser that boots offline shows the sign-in card, not the sample, until
      sign-in works. Gate: someone using the sample as an offline demo. (REV89)
- [ ] If `ShopTimeline_Tasks2` were missing AND the sample carried to-dos, the
      poll's local-todos guard would skip and other session-local todos could
      drop — Tasks2 exists in production; noted in the code. (REV89)
- [ ] The optional 60-second explainer video/page (strategy doc Phase 4) —
      never scoped, stays optional. Gate: an owner brief. (2026-08-27)

**Pre-merge audit pass (2026-08-27, REV90/91):**

- [ ] The Staff and Clients modals still discard in-progress edits on Escape /
      backdrop-click with no confirm (the task modal snapshot-compares; these
      don't). Escape now at least closes Clients like every other overlay (REV90).
      Gate: someone losing edits to a stray Escape. (2026-08-27)
- [ ] The calendar marker drag/click/delete block is still a near-clone of the
      Gantt marker handlers — the audit's dedup pass deliberately skipped it as
      too risky right before a promotion. Gate: the next time either handler is
      touched, merge them. (2026-08-27)
- [ ] `ROSTER_DEPTS` and `SM_DEPTS` carry the same three roster dept ids as two
      lists (one maps SharePoint keys, one labels) — a rename touches both.
      Gate: the next roster-department change. (2026-08-27)
- [ ] The `#tm-dl` datalist serves the STAFF modal but keeps its task-modal
      `tm-` prefix. Cosmetic naming drift. Gate: next staff-modal edit. (2026-08-27)
- [ ] `tests/run.js` counts a suite that skips itself (feature-sniff, exit 0) as
      "passed" — a typo'd sniff would silently disable a suite forever. All
      current sniffs verified correct 2026-08-27. Gate: next runner change adds
      a SKIP line to the summary. (2026-08-27)
- [ ] `metalFab` stays a write-only legacy field and `todoToFields` still writes
      `labels`/`checklist` nothing reads back — both are shared-List schema, so
      the serialization is deliberate; dropping them is a schema decision (§5
      approval rule). (2026-08-27)

**Edit-in-place popover (REV98,** `docs/Milestones/Edit-Popover/2026-08-27-edit-in-place-popover.md`**):**

- [ ] The popover carries the data fields + Delete only; **Duplicate and Pin stay
      inspector-only** to keep it compact. Gate: shop use asking for them on the
      popover. (2026-08-27)
- [ ] A background poll that lands while the popover (or an add menu) is open is
      **deferred until it closes** — same as the pre-existing menu case — so a very
      long edit session won't see a teammate's change until dismissed; the dock still
      shows it on the next interaction. Gate: a real "why didn't I see their edit"
      report. (2026-08-27)

**Deliberate design ceilings — no action planned, revisit only on real complaints:**
12-slot palette repeats at 13+ visible projects (T2); quiet re-selection after a committed
project-page resize/move (T4); sidebar names >~26 chars truncate at default width (T5);
off-screen edge chips don't dim with the search filter (T6); bottom-dock column minimum
widths are fixed (U2/E1); In-Design and In-Fabrication bars both full-strength on purpose,
the pill word separates them (U8); the default view parks today left-of-center so the look
reads forward into upcoming work — on first load and on every arrival at the timeline via
routing (Done/breadcrumb/Back, REV101) — while only the Today button and `T` center (B3b, REV76).

## 8. Documentation upkeep

- **Standing rule (not a task):** keep `docs/ARCHITECTURE.md` and `CLAUDE.md` in
  sync as the app evolves. (Last checked 2026-08-27: CLAUDE.md's suite range
  updated to test89; REV88/89 changed no architecture.)
- [x] **Manager-facing PDF — resolved 2026-08-27: it no longer exists.** No .pdf
      file anywhere in the repo (removed by the earlier doc scrub / deploy trim);
      nothing to retire or regenerate.
- Standing rule: **re-verify the handoff doc's world-state claims before quoting them** —
  it's history + rationale; `docs/ARCHITECTURE.md` and `docs/SETUP.md` are current state.

## 9. Housekeeping (optional, cosmetic)

- [x] **Benchmarks branch — archived 2026-08-27 (owner call):** its tip is kept as
      tag `archive/benchmarks-timeline-34-44` (old builds Timeline 34–44 stay
      reachable), and the remote `benchmarks---DO-NOT-MERGE` branch is deleted.
- [x] **Commit history — decided 2026-08-27 (owner): leave as-is.** The noisy early
      messages stay; no history rewrite, ever, on shared branches.
- [x] **Lint/format pass — decided 2026-08-27 (owner): won't do.** No churn on the
      single working HTML file; reviewers read diffs, not formatters.
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
