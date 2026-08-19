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

- [ ] **Verify the `/sandbox/` and `/preview/` redirect URIs are registered in Entra.** ⚠
      Reported in progress 2026-08-12 (`docs/Onboarding-Fork.md` Part B); never confirmed.
      Check: open https://221twoseven.github.io/Project-Scheduler/sandbox/ and
      /preview/ and sign in. An `AADSTS...redirect` error means Part B isn't done.
      This blocks the collaborator's sandbox — highest-value quick check.
- [ ] **Confirm CI is green** on GitHub (`.github/workflows/ci.yml` runs all 15 suites on
      push/PR to `development` and `main`).
- [ ] **Enable 2FA** on the GitHub account(s) with access. Quick, and it's the standing
      security gap the docs used to advertise. (Carried from the handoff.)
- [ ] **Confirm `ShopTimeline_Tasks2` (to-dos) exists.** Check Site Contents, or add a
      task and reload. If absent the app degrades gracefully and needs no code change
      when it appears. **Do not** re-flag `label` on `ShopTimeline_Tasks` — it exists
      (verified by `test-label.js`).
- [ ] **test50 skip guard on the reference build** — the U8 close-out flagged this as a
      "do now"; verify whether it's still needed (`npm run test:ref` currently reports
      15/15) and add the guard or drop the item.

## 2. Security & governance decisions (high priority, owner's call)

- [ ] **Decide repo visibility.** The repo is **public** but holds an internal business
      app. Going private is the cleanest fix and moots most of the item below. (Note:
      branch rulesets are free on public repos; private on a free org plan may need a
      paid plan to keep protection — see `docs/SETUP.md`.)
- [ ] **Deal with sensitive info in a public repo** (only if staying public): scrub live
      docs of personal names and security-gap notes (consistency pass over `docs/`).
      Remember **deleting a file does not remove it from git history** — truly
      unpublishing anything needs a history rewrite (`git filter-repo`) + force-push,
      coordinated; there are no real secrets in the repo (IDs are public by design).
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
- [ ] `tests/harness.js` hardcodes an old personal Pages URL and `peter@twoseven.net` in
      its jsdom stub — cosmetic, tidy when convenient.
- [ ] Shared shop-terminal account — decide whether it needs a paid licence.

---

### Legend

- ⚠ Needs explicit approval — touches shared SharePoint schema or Entra/auth config.
- Feature items in §3 are distilled from `docs/Handoff-Notes.md` ("Open items"); see that
  file for conventions, traps, and REV34–50 history.
