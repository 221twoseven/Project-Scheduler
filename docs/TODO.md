# To-Do / Backlog

Working backlog for Project Scheduler (Timeline). Grouped by area, roughly prioritized
within each. Checkboxes are for tracking; anything touching **SharePoint schema** or
**Entra/auth** is marked ⚠ and needs explicit approval first (it's shared with a
separately maintained colleague app — see `CLAUDE.md`).

Last reviewed: 2026-08-10.

---

## 1. Infrastructure & security (get to "real-deal development")

- [ ] **Decide repo visibility.** The repo is currently **public** but holds an internal
      business app. Either make it private, or consciously accept public (LICENSE now
      asserts proprietary rights either way).
- [ ] **Enable 2FA** on the GitHub account(s) with access. (Open item carried over from
      the handoff.)
- [x] **Repo under the Twoseven org.** Now at `github.com/221twoseven/Project-Scheduler`
      (no longer a personal account). If it's ever renamed/moved again, re-register the
      MSAL redirect URI to match the new Pages URL. ⚠ (redirect URI) — see `docs/SETUP.md`.
- [ ] **Protect `main`.** Require PRs and passing CI before merge; no direct pushes to
      production. (Not yet enabled — this is why the last merge could land before CI went
      green.)
- [x] **GitHub Pages deploys from `main`** and the live app works at
      https://221twoseven.github.io/Project-Scheduler/ (verified after the reorg).
- [x] **Redirect URI registered and sign-in working** — the exact SPA redirect URI is
      live and auth completes. Remaining checks below.
- [ ] **Confirm tenant-wide admin consent for `Sites.ReadWrite.All`** shows "Granted for
      <tenant>" (not just self-consented by an admin), and do one **non-admin** sign-in
      test so ordinary shop users aren't blocked. ⚠ — see `docs/SETUP.md`.

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
- [ ] **Retire the phase modal?** It's bypassed on the project page but still reachable
      from the main timeline. Decide whether it goes.
- [ ] **Department overlap.** The scheduler chains strictly, so overlap only happens via
      hand-pinning (and a pinned bar stops tracking). Open question: should overlap be a
      per-department setting the scheduler honours?

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
- Items in §3–4 are distilled from `docs/Timeline-Handoff.md` ("Open items"); see that
  file for the original developer's full context, traps, and REV34–50 history.
