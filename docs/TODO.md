# To-Do / Backlog

Working backlog for Project Scheduler (Timeline). Grouped by area, roughly prioritized
within each. Checkboxes are for tracking; anything touching **SharePoint schema** or
**Entra/auth** is marked ⚠ and needs explicit approval first (it's shared with a
separately maintained colleague app — see `CLAUDE.md`).

Last reviewed: 2026-08-14 (Phase 2 close-out audit).

---

## 1. Infrastructure & security (get to "real-deal development")

- [ ] **Decide repo visibility.** The repo is currently **public** but holds an internal
      business app. Either make it private, or consciously accept public (LICENSE now
      asserts proprietary rights either way).
- [ ] **Enable 2FA** on the GitHub account(s) with access. (Open item carried over from
      the handoff.)
- [ ] **Deal with sensitive info in a public repo.** The repo is public, and the docs +
      git history contain internal details: employee names, the tenant/client IDs (public
      by design, but still internal-facing), and — most sensitive — explicit notes that
      2FA was not enabled on a personal account hosting production. Decide the policy and
      act on it:
      - Settle repo visibility first (public vs private — see the item above); going
        private is the cleanest fix and moots most of the rest.
      - If staying public: scrub the live docs of security-gap advertisements and personal
        names (the current handoff was trimmed; do a consistency pass over all of `docs/`).
      - Remember that **deleting a file does not remove it from git history** — anything
        already pushed is still retrievable. If any of it must truly be unpublished, that
        needs history rewrite (e.g. `git filter-repo`) + a force-push, coordinated so no
        one loses work, plus rotating anything that was actually a secret (there are no
        real secrets here — IDs are non-secret by design).
- [x] **Repo under the Twoseven org.** Now at `github.com/221twoseven/Project-Scheduler`
      (no longer a personal account). If it's ever renamed/moved again, re-register the
      MSAL redirect URI to match the new Pages URL. ⚠ (redirect URI) — see `docs/SETUP.md`.
- [x] **Protect `main`.** Ruleset active: PR required + `test` (CI) required + empty
      bypass list (applies to everyone, admins included). No direct pushes and no merging
      a red build. Recipe in `docs/SETUP.md` → "Repository settings".
- [x] **GitHub Pages deploys from `main`** and the live app works at
      https://221twoseven.github.io/Project-Scheduler/ (verified after the reorg).
- [x] **Redirect URI registered and sign-in working** — the exact SPA redirect URI is
      live and auth completes. Remaining checks below.
- [x] **Tenant-wide admin consent for `Sites.ReadWrite.All`** granted, and non-admin
      sign-in confirmed working — ordinary shop users can sign in and sync. ⚠ (auth) — see
      `docs/SETUP.md`.

## 2. Testing & CI

- [ ] **Confirm CI is green** on GitHub after first push (`.github/workflows/ci.yml` runs
      the 276 tests against both builds on push/PR to `development` and `main`).
- [ ] **Adopt the branch model in practice:** daily work on `development`, promote to
      `main` via PR.
- [ ] **Keep the "test both draft and saved paths" rule** for every new feature (the REV49
      lesson — see `tests/README.md`).
- [ ] Consider a lightweight lint/format pass for the single HTML file (optional; don't
      let it cause churn on working code).

## 3. Product / feature backlog (from the handoff open items)

- [ ] **Calendar create menu + parity.** The Gantt has a create menu, selection, and
      keyboard as of REV48–50; the Calendar has none of it. Needs its own hit-testing
      against week bands (not a linear day axis).
- [ ] **Standalone events, properly.** An event still *saves* on a host phase, so deleting
      the phase deletes its events. Real fix: a nullable phase reference or an events List
      of its own. ⚠ (may imply schema)
- [ ] **Dependencies between bars.** Nothing links a bar to its predecessor except the
      scheduler chain. Decide whether to have real dependencies at all rather than
      half-having them.
- [ ] **Converge draft vs saved phase-splitting.** `NPV_LINES` still drives phase
      splitting on the new-project draft; the saved path creates subtasks directly. The
      two should converge.
- [ ] **Dash view** — the per-person dashboard (third lens beside Projects and
      Departments). Designed, not built. Needs the identity chain: signed-in email →
      `Staff.email`, fallback to display-name match, fallback to a remembered person
      picker.
- [x] **Retire the phase modal?** Decided (E2, 2026-08-13): it stays. A plain click on a
      main-timeline bar opens it — that surface's edit-details path per Design-Language
      §6. The project page keeps click-selects-into-inspector instead.
- [ ] **Department overlap.** The scheduler chains strictly, so overlap only happens via
      hand-pinning (and a pinned bar stops tracking). Open question: should overlap be a
      per-department setting the scheduler honours?

## 3.5 Phase 1 deferred items (ceilings from `docs/Milestones/Phase 1/`)

Collated 2026-08-13 after the Phase 1 merge (PR #13). Each task record names its own
ceilings; this is the roll-up so nothing rots. None are bugs; none block users.

**Already covered by a Phase 2 brief — track there, not here:**

- [x] Unicode glyph icons → inline SVGs (T8 ceiling, finding C6) → **U6** (shipped 2026-08-14).
- [x] Toast stacking/docking (T7 context, finding D3) → **U7** (shipped 2026-08-14).
      The conditional follow-up (persistent error banner if ~5s auto-dismiss still proves
      too fleeting) carries forward in §3.6.

**Deliberate design ceilings — no action planned, revisit only on real complaints:**

- 12-slot palette must repeat with 13+ projects visible at once (T2 — math, not a bug;
  each project's own color still never moves).
- Quiet re-selection after a committed project-page resize/move (T4 — intentional
  selection-ring feedback).
- Sidebar names >~26 chars truncate at default width (T5 — drag wider, up to 480px).
- Off-screen edge chips don't dim with the search filter (T6 — a dimmed bar is still a
  real bar worth navigating to).

**Genuine deferred work — small items for a later polish pass:**

- [ ] Resize handle zones widen to 12px on bars narrower than 60px (Design-Language §6
      refinement; shipped fixed 8px — T3).
- [ ] Draft-page *moves* show no undo toast (pre-existing; resizes have one — T3).
- [ ] Two-chip rows (bars straddling both viewport edges) untested against dense real
      data (T6).
- [ ] The "all hidden" empty-state card only knows the status filter, not search/
      spotlight (T7; the sidebar's own "Nothing to show" covers those meanwhile).
- [ ] Tooltips are native `title` attributes — unstyled, fixed delay, invisible on touch
      (T8). Reconsider alongside U6's icon work if touch use materializes.

## 3.6 Phase 2 deferred items (ceilings from `docs/Milestones/Phase 2/`)

Collated 2026-08-14 after the U1–U8 close-out audit. None are bugs; none block users.
The "do now" items from the same audit (test50 skip guard on the reference build,
hallway test round 2, the development→main promotion PR + backfilling the "PR link:
pending" lines in the Phase 2 records) are tracked in §2 territory / the U8 record,
not here — this section is deferrals only.

**Deliberate design ceilings — no action planned, revisit only on real complaints:**

- Bottom-dock column minimum widths are fixed (Setup/Agenda 240px, Team 340px,
  Departments 300px). If section content grows, widen the minimums — do not re-add
  folding (U2/E1).
- In-Design and In-Fabrication bars are both full-strength on purpose (both are
  "active work"); the pill word separates them. A bar-level cue is a Phase 3 decision,
  only if shop feedback asks for it (U8).

**Genuine deferred work — small items for a later polish pass:**

- [ ] Toast stack's dock offset is computed when a toast fires, not on dock
      drag-resize; a live toast can overlap the dock for the seconds it lives.
      Add a resize listener only if someone notices (U7).
- [ ] The 📌 glyph on the "Pin dates" modal label is still unicode — U6 scoped it out
      (overlay, not chrome) and U8's overlay pass didn't sweep it. Swap to the SVG set
      whenever that modal is next touched (U6).
- [ ] Persistent error banner with explicit close, if the ~5s toast auto-dismiss still
      proves too fleeting now that U7's docking/collapse has landed (carried from
      Phase 1 §3.5 / T7).

**Phase 3 scope (per the brief and U8):** B3 zoom / B5 compact density if PMs still
report navigation pain after the hallway test; B6 saved views if they don't.

## 4. Data / schema (⚠ all need approval — shared Lists)

- [ ] **Confirm `ShopTimeline_Tasks2` (to-dos) exists.** Previously recorded as missing;
      verify in Site Contents or by adding a task and reloading before treating it as a
      gap. If absent the app degrades gracefully and needs no code change when it appears.
      **Do not** re-flag `label` on `ShopTimeline_Tasks` — it exists and is verified by
      `test-label.js`.
- [ ] **Add `email` and `role` columns to `ShopTimeline_Staff`** (needed for Dash view's
      identity chain). ⚠
- [ ] Any schema change must be checked against the colleague app before shipping.

## 5. Documentation upkeep

- [ ] **Re-verify the handoff doc's world-state claims** before quoting them — some are
      stale (old personal Pages URL, "embedded as a Teams tab"; there is no Teams code in
      the app). `docs/ARCHITECTURE.md` is the current reference.
- [ ] Keep `docs/ARCHITECTURE.md` and `CLAUDE.md` in sync as the app evolves.
- [ ] Confirm whether the manager-facing PDF in `docs/` should stay, be regenerated from
      the markdown, or be retired (kept as-is for now).

## 6. Housekeeping (optional, cosmetic)

- [ ] Decide the fate of the remote `benchmarks---DO-NOT-MERGE` branch (holds old builds
      Timeline 34–44). Keep as an archive, or remove.
- [ ] Commit history is noisy (`test`, `Add files via upload`). Leave it, or clean
      deliberately (history rewrite — only on agreement, and not on shared branches
      others have pulled).
- [ ] `tests/harness.js` hardcodes an old personal Pages URL and `peter@twoseven.net` in
      its jsdom stub — cosmetic, safe to leave, tidy when convenient.
- [ ] Shared shop-terminal account — decide whether it needs a paid licence.

---

### Legend

- ⚠ Needs explicit approval — touches shared SharePoint schema or Entra/auth config.
- Items in §3–4 are distilled from `docs/Handoff-Notes.md` ("Open items"); see that file
  for the full context, conventions, traps, and REV34–50 history.
