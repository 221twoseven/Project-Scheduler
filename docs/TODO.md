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

Last reviewed: 2026-08-19 (doc tidy & re-prioritization).

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

- [ ] **1. Calendar create menu + parity — crucial.** The Gantt has a create menu,
      selection, and keyboard as of REV48–50; the Calendar has none of it. Needs its own
      hit-testing against week bands (not a linear day axis).
- [ ] **2. Standalone events, properly.** An event still *saves* on a host phase, so
      deleting the phase deletes its events. Real fix: a nullable phase reference or an
      events List of its own. ⚠ (may imply schema — schedule the approval conversation
      early)
- [ ] **3. Converge draft vs saved phase-splitting.** `NPV_LINES` still drives phase
      splitting on the new-project draft; the saved path creates subtasks directly.
- [ ] **4. Dash view** — the per-person dashboard (third lens beside Projects and
      Departments). Designed, not built. Needs the identity chain: signed-in email →
      `Staff.email`, fallback to display-name match, fallback to a remembered person
      picker. Depends on the ⚠ schema item in §5 — start that approval early.
- [ ] **Decide: dependencies between bars.** Nothing links a bar to its predecessor
      except the scheduler chain. Have real dependencies, or consciously don't —
      avoid half-having them.
- [ ] **Decide: department overlap.** The scheduler chains strictly; overlap only happens
      via hand-pinning (and a pinned bar stops tracking). Should overlap be a
      per-department scheduler setting?
- [x] **Retire the phase modal?** Decided (E2, 2026-08-13): it stays — plain click on a
      main-timeline bar opens it (Design-Language §6); the project page keeps
      click-selects-into-inspector.

Keep the **"test both draft and saved paths"** rule for every feature here (the REV49
lesson — `tests/README.md`).

## 4. Validation & promotion (after §3 features land)

In order:

- [ ] **Hallway test round 2** — the five tasks from `docs/UX-Audit-and-Strategy.md` §6,
      with real people; compare assist counts to round 1. Deliberately deferred until the
      §3 features exist so the test covers them.
- [ ] **Promote `development` → `main` via PR** (the branch-model working in practice:
      daily work on `development`, deliberate promotion). If production needs Phase 2's
      fixes sooner, promoting before §3 completes is the owner's call — the ruleset and
      CI gate it either way.
- [ ] **Backfill the "PR link: pending" lines** in the Phase 2 milestone records once the
      promotion PR exists.

## 5. Data / schema (⚠ all need approval — shared Lists)

- [ ] **Add `email` and `role` columns to `ShopTimeline_Staff`** (needed for Dash view's
      identity chain, §3 item 4). ⚠
- [ ] Any schema change must be checked against the colleague app before shipping.
- (`ShopTimeline_Tasks2` existence check lives in §1.)

## 6. ON HOLD — UX Phases 3 & 4

On hold until the higher-priority edits in §3 ship. Scope lives in
`docs/UX-Audit-and-Strategy.md` (kept as the strategy reference — not a to-do doc):

- **Phase 3 — navigation at scale:** B3 zoom + jump-to-date, B5 compact density,
  B6 saved views. Per the Phase 2 brief: B3/B5 if PMs still report navigation pain
  after the hallway test; B6 if they don't. (Dash view overlaps Phase 3 but is pulled
  forward into §3 as feature work.)
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

---

### Legend

- ⚠ Needs explicit approval — touches shared SharePoint schema or Entra/auth config.
- Feature items in §3 are distilled from `docs/Handoff-Notes.md` ("Open items"); see that
  file for conventions, traps, and REV34–50 history.
