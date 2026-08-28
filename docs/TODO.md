# To-Do / Backlog — the v2.0.0 track

**The single working to-do list for Project Scheduler (Timeline).** Started 2026-08-28,
when the v1 backlog was retired to
[`docs/Archive/TODO-v1-Archive.md`](Archive/TODO-v1-Archive.md) with everything closed
except the entries carried into §2 and §7 below. Anything touching **SharePoint schema**
or **Entra/auth** is marked ⚠ and needs explicit approval first (shared with a separately
maintained colleague app — see `CLAUDE.md`).

**Workflow (standing):** all work batches land on the `development` branch and are
viewable at `/preview/` before a manual, deliberate merge to `main` (production).

**Versioning (standing):** semantic versions from v1.0.1 (the REV101 build — see
`docs/Milestones/2026-08-28-semver-switch.md`). Bump the **patch** for fixes, copy, and
styling; the **minor** for feature drops; **v2.0.0 is reserved for the
single-source-of-truth milestone** (§3 item 13) — the app becoming the company's one
database is the breaking change the major number exists for. `APP_VER` in `index.html`
is the source of truth; keep `package.json` aligned.

Last reviewed: 2026-08-28 — created from the v1 archive + the owner's v2 objective list.

---

## 1. Where v1 came from (REV50 → v1.0.1, condensed)

The full story lives in the archive, `docs/Milestones/`, and `docs/Handoff-Notes.md`
(REV34–50). The short version:

- **REV1–50 — alpha** (colleague build; REV50 frozen forever at
  `reference/Timeline_50.html`, the diff baseline and `test:ref` control).
- **REV50–100 — beta**, the company build:
  - **Phases 1–2** (08-13/14): UX overhaul + visual system — the design language,
    tokens, sidebar, dock, spotlight, palettes (`docs/Design-Language.md` was born here).
  - **Phase 2.5** (REV53–64): calendar create/click parity, standalone events
    (`ShopTimeline_Events` ⚠ approved), draft/saved convergence, the subtask
    parent-hierarchy remodel, checkpoint editors everywhere.
  - **Identity track** (REV65–70): person filter, signed-in identity chain, person
    panel, the My Dashboard button, client list (`ShopTimeline_Clients` ⚠), Teams
    staff picker (`TeamMember.Read.All` ⚠).
  - **Calendar parity** (REV71–72) + deferred-polish pass (REV73) + coach marks (REV74).
  - **Phase 3** (REV75–79): navigation at scale — zoom steps, jump-to-date, three
    density levels, group collapse, named saved views.
  - **Phase 3.5** (REV80–88): the ~30-item parity audit dispositioned, inspector
    convergence (draft = saved), completion flow + PM late prompt, × exit, toolbar
    regroup. **Phase 4** (REV89): learnability — `?` sheet, sample project, hover cues.
  - **Pre-merge audit** (REV90–91): sync serialization, poll race, undo safety,
    −320 lines dead code. **PR #23 carried REV74–91 to `main`.**
  - **Native toolbar** (REV92–95): menu-bar redesign — View / Filters / Resources /
    Help menus, Settings menu retired. Legend folded into Help (REV96), coach-step
    fix (REV97), edit-in-place popover (REV98), collapsible edit dock (REV99), footer
    action bar (REV100), today-parking on return (REV101).
- **REV101 shipped as v1.0.1** — the live production build.

## 2. Loose ends carried from v1 (actionable now)

- [x] **Stale "Settings" strings in the app — DONE 2026-08-28 (v1.0.2):** all five
      strings and the comment now say Resources (the Settings menu retired in
      REV95). Rode the quick-wins batch
      (`docs/Milestones/Quick-Wins-v102/2026-08-28-v102-quick-wins.md`).
- [ ] **Shared shop-terminal account — paid licence?** A business call, not a code
      task. Owner decides. (Carried from v1 §9.)
- [ ] **Coach-mark copy revision — ON HOLD (owner, 2026-08-28):** "leave coach mark
      copy alone for now." The extraction list was delivered 2026-08-28 (chat); the
      swap happens whenever the owner sends revised copy. This is §3 item 5.
- [x] **Retire the Settings → Density alias** (v1 gate fired at PR #23) — resolved by
      REV95: the whole Settings menu was retired; density lives on the toolbar.

Everything else still open from v1 lives in the ledger (§7), each with its gate.

## 3. New objectives — sorted by ease of implementation

Owner's objective numbers in parentheses. Each batch: build on `development`, verify at
`/preview/`, tests green, milestone record, then the version bump that matches its size.

### Quick wins — styling, copy, small fixes (patch bumps, batchable)

- [x] **1. (Obj 13) Vivid Months: grey weekend strips removed — DONE 2026-08-28
      (v1.0.2).** In Vivid, no weekend/holiday overlays anywhere (timeline, project
      Gantt, project calendar — weekend cells take the month tint); Quiet keeps its
      full weekend treatment; the Day/2-Day header still marks weekends in both
      modes. Design-Language §2.4 updated; ceiling ledgered in §7. Record:
      `docs/Milestones/Quick-Wins-v102/2026-08-28-v102-quick-wins.md`.
- [x] **2. (Obj 12) Black bar mellowed — DONE 2026-08-28 (v1.0.2),** read as the app
      toolbar (it hosts the TWOSEVEN title obj 10 targets): ink-black gradient →
      slate navy `#2A3850→#202C41`, secondary text lifted to ≥4.5:1, chrome-line
      lightened. Design-Language §2 updated. **Owner eyes on `/preview/` wanted** —
      and if "Black Bar" meant the calendar's black month header (`.cal-mon`),
      that's a one-line follow-up. Record: as above.
- [x] **3. (Obj 8) Calendar blank-space click — DONE 2026-08-28 (v1.0.2), REVISED
      same day (owner) as v1.0.3:** on the calendar, blank space never deselects —
      the expanded phase persists until its **parent band is clicked a second time**
      (the toggle that collapses); a re-clicked subtask band reopens its editor; a
      blank click only dismisses an open popover/menu. Esc/breadcrumb/× still exit;
      the Gantt keeps empty-canvas deselect. Design-Language §6 amended. Suite:
      `tests/test-v102.js`.
- [x] **4. (Obj 5) Window-resize closed the subtask form — FIXED 2026-08-28
      (v1.0.2):** a PP_KEEP repaint (resize, poll, autosave) now carries the
      selection through — form, breadcrumb and ring survive; a poll that deleted the
      selected task drops the dock to the project pane instead of a stale form.
      Root cause: `renderProjectPage` reset `PP_SEL` unconditionally. Suite: as above.
- [ ] **5. (Obj 6) Coach-marks language revision — ON HOLD (owner, 2026-08-28).**
      Extraction list delivered 2026-08-28; owner deferred ("leave coach mark copy
      alone for now"). When revised copy arrives it's a copy-swap patch across
      `COACH_STEPS` / `COACH_PP_STEPS`.

### Fonts (patch/minor — one licensing check first)

- [ ] **6. (Obj 10) Brauer Neue for the app title (TWOSEVEN).** TTF/OTF on hand;
      `@font-face` + one `font-family` rule on the title. **Gate before commit: the
      repo is PUBLIC — committing a licensed font file publishes it for download.
      Confirm the licence permits web embedding/self-hosting first** (or subset the
      file to the title glyphs, which most licences treat kindly). The font file must
      also join the deploy allowlist in `.github/workflows/deploy-pages.yml`.
- [ ] **7. (Obj 11) Bahnschrift app-wide, if practical.** Regular weight TTF only, no
      italics. Same public-repo licence gate — but Bahnschrift ships with Windows 10+,
      so the lazy first rung is `font-family: Bahnschrift, <current stack>` via
      `local()` with **no committed file** (covers every shop Windows machine free);
      commit the TTF only if Mac/mobile coverage proves needed and the licence allows.
      Verify weight/spacing at the app's small sizes before going global.

### Calendar interaction features (minor bumps)

- [ ] **8. (Obj 7) Double-click on calendar blank space creates a new phase and opens
      the phase edit popover.** Reuses the existing create path (the right-click
      menu's "Add a phase") + the REV98 popover. Mind the ledger's calendar-marker
      dedup entry (§7 audit group) — this touches those handlers, so its gate fires.
- [ ] **9. (Obj 9) Live drag dynamics for duration drag-to-edit.** While an edge
      handle drags, the bar edge follows the pointer continuously (left/right), then
      snaps to the full-day grid (existing snap) on release. Extends the REV83 live
      day-tint; applies to phase and subtask bars. Gantt and calendar should feel the
      same — scope to wherever the drag affordance exists.

### My Dashboard as a real view (minor bump)

- [ ] **10. (Obj 1) My Dashboard becomes its own place.** Still *mechanically* the
      view filters underneath, but *presented* as a distinct view, not a filtered
      timeline:
      - Header styled like the project edit view: breadcrumb trail + × to exit
        (no more "clear filters to leave").
      - Not reachable-looking as Projects/Department lenses — those toggles hidden
        inside the dashboard.
      - The Gantt shows **all assigned phases flat** — no expand/collapse needed.
      - The Summary dock is always available here (today it's Department-view-only)
        with the same collapse control/behavior as docks elsewhere (REV99 pattern).

### Bug reporting (minor bump — one storage decision ⚠)

- [ ] **11. (Obj 2) Bug report / feature request form in the Help menu.**
      Fields: Name + Email (autofilled from the signed-in account), Bug vs Feature
      request (checkbox), screenshot upload, multiline description.
      **Decision needed before code ⚠:** where reports land. Straw proposal: a new
      app-side `ShopTimeline_Feedback` list (additive, colleague app unaffected — the
      REV54 Events pattern) with the screenshot as a list-item attachment via Graph.
      Needs owner approval for the new list.

### Permissions (minor bump, v2-gating)

- [ ] **12. (Obj 3) Admin vs regular user permissions.**
      - Admin roster: a checkbox per person, populated from the same staff list
        People & Availability uses; admins can grant/revoke admin (checkbox inside
        People & Availability). **⚠ needs an `admin` column on the staff list** —
        approval + colleague-app check first.
      - Admins: full access as the app is today.
      - Non-admins: no client list, no people edits, no department/phase edits;
        **Lock Dates on by default and the button hidden**; Project Edit fields
        render as plain text (not inputs/checkboxes) — visible, locked.
      - Owner's brief cut off at "This form is its own page with its own toolbar (" —
        **confirm which form** (People & Availability promoted to its own page? —
        that matches the v1 open decision on the modal outgrowing itself).
      - **Design constraint to record honestly:** this is a client-side SPA; every
        signed-in user's token carries `Sites.ReadWrite.All`, so UI gating is
        workflow protection, not security — a determined user could still write via
        Graph. Real enforcement would need SharePoint-side permissions. State this
        in the milestone record; decide if it's acceptable (it likely is, same trust
        model as the shared Lists today).

### The heavy lift — single source of truth (the v2.0.0 milestone)

- [ ] **13. (Obj 4) Reconcile and absorb the 14 disparate data stores.** The app
      becomes the company's singular source of truth (the v1 "north star", now
      scoped). **Strategy before code:** the first deliverable is
      `docs/Data-Consolidation-Strategy.md` — a granular, per-document audit:
      what each store holds, who writes it, what reads it, overlap with app data,
      and a no-disruption cutover plan (the proven pattern: the client-list
      divergence rule — list-side copy runs in parallel until it earns mastership).
      Inventory to audit:
      - Installations (Excel on SharePoint)
      - Install Log (Excel on SharePoint)
      - TwoSeven Master Calendar (Excel on SharePoint)
      - Current 2-7 Projects (SharePoint list)
      - 27 Events (SharePoint list)
      - 27 Projects (Archive) (SharePoint list)
      - 27 Events (Archive) (SharePoint list)
      - PTO Contract Approvals (SharePoint list) — **fed by a Teams PowerApps plugin
        with an approvals automation the owner can't see ⚠ — must connect to People
        & Availability; needs discovery of that flow before anything moves**
      - Material Deliveries (SharePoint list)
      - 27 Employees (SharePoint list)
      - All `ShopTimeline_*` lists this app already owns
      Known redundancies going in: client + staffing lists, project history,
      department/logistics calendars. Everything here is ⚠ by definition — per-store
      approval, colleague-app check, and dual-run before any store is retired.
      **v2.0.0 ships when the app is the declared master and the manual stores are
      frozen or retired.**

## 4. Version ladder (proposed — adjust as batches actually land)

| Release | Contents (§3 items) |
|---|---|
| v1.0.2 | ✅ Shipped 2026-08-28 — quick wins 1–4 + stale-Settings strings (§2) + runner SKIP line |
| v1.0.3 | ✅ Shipped 2026-08-28 — obj 8 revision: calendar blank space never collapses; the parent band click toggles |
| v1.0.3 | 5 (coach copy, once revised) · 6–7 (fonts, once licence-checked) |
| v1.1.0 | 8–9 (calendar interactions) |
| v1.2.0 | 10 (My Dashboard view) |
| v1.3.0 | 11 (bug reporting) ⚠ |
| v1.4.0 | 12 (permissions) ⚠ |
| v2.0.0 | 13 (single source of truth) ⚠ — likely several v1.5+ minors along the way (one per absorbed store), with v2.0.0 as the cutover declaration |

## 5. Data / schema (⚠ all need approval — shared Lists)

- Candidate new list: `ShopTimeline_Feedback` (§3 item 11).
- Candidate new column: `admin` on the staff list (§3 item 12).
- Everything in §3 item 13's inventory.
- **Standing rule:** any schema change must be checked against the colleague app
  before shipping; additive-only unless explicitly approved otherwise.

## 6. Documentation upkeep

- **Standing rule:** keep `docs/ARCHITECTURE.md` and `CLAUDE.md` in sync as the app
  evolves; every milestone gets a `docs/Milestones/` record.
- **Standing rule:** re-verify `docs/Handoff-Notes.md` world-state claims before
  quoting them — it's history + rationale; `ARCHITECTURE.md`/`SETUP.md` are current.
- 2026-08-28: docs reorganized — retired planning docs and the v1 backlog moved to
  `docs/Archive/`; all cross-references repointed.

## 7. Deferred & skipped ledger (carried from v1 + new entries)

The running record of moves deliberately skipped or deferred: **rationale** (why not
now), **gate** (what would change the answer), and — once one lands — the **later
decision**, updated in place, never deleted. Closed v1 entries stay in the archive;
these are the ones still open, plus new deferrals as they happen.

**Phases 1–2:**
- [ ] Native `title` tooltips — unstyled, invisible on touch. Gate: touch use
      materializes (T8).
- [ ] Toast dock offset computed at fire time; a live toast can briefly overlap the
      dock on drag-resize. Gate: someone notices (U7).
- [ ] Unicode 📌 on the Pin-dates modal and the phase-inspector Pin checkbox — swap
      both to the SVG set when that modal is next touched (U6 + REV81/I14).
- [ ] Persistent error banner with explicit close, if the ~5s toast auto-dismiss
      still proves too fleeting (carried from T7).

**Phase 3:**
- [ ] Jump memory in the Go-to-date popover. Gate: PMs asking for it (REV76).
- [ ] Go-to popover can sit left of the pointer on very narrow windows. Cosmetic.
      Gate: someone trips on it (REV76).
- [ ] Very short projects render pill-only at Week zoom — intended per
      Design-Language §7. Gate: real complaints about lost labels (REV75).
- [ ] Sidebar ⇕ All doesn't fold sort-group headers. Gate: PMs ask (REV77).
- [ ] Saved views don't capture sidebar width / gutter / scroll / linked-subtasks —
      workspace ergonomics, not "a view". Gate: someone misses one (REV79).
- [ ] Saved views recall grouping, not per-person ordering — `sortIndex` is shared
      data; a private order is a data-model decision (REV79).

**Phase 3.5:**
- [ ] White-bar-text rule covers bar palettes only; `kidShade()` subtask tints still
      pick ink. Gate: owner extending the rule (REV80).
- [ ] Drag-to-pan is date-header-only; canvas drag stays bar move/resize. Gate: PMs
      asking to grab the canvas (needs a modifier-key design) (REV80).
- [ ] Draft "Add a phase" ignores the optional name field (the department names the
      primary). Gate: someone missing their typed name (REV81/I8).
- [ ] Department dropdown disabled on drafts — re-departmenting is a saved-page
      concept. Gate: real demand (REV82).
- [ ] Draft selection key for an unsplit bar falls back to the department's first
      bar if a mid-selection split lands — benign today. Gate: re-parenting ever
      landing (REV82).
- [ ] Calendar live-resize tint is edge-resize-only; moves keep tooltip feedback.
      Gate: the same complaint about moves (REV83). *(§3 item 9 may close this.)*
- [ ] Collapsed calendar phase spans only the parent bar's window — an out-of-window
      subtask is invisible until expanded. Gate: a PM missing one (REV84).
- [ ] Calendar collapse follows selection, not the Gantt's ▸ state — per the owner's
      wording. Gate: someone expecting shared expansion (REV84).
- [ ] The positional parent model shows through the collapse (resize a phase past
      its subtask and the calendar band flips with the Gantt parent row — the
      surfaces agree). Gate: a PM confused by the swap (REV84).
- [ ] PM late-prompt's once-a-day key is per-browser, not per-user — shared
      machines can swallow a second PM's ask. Gate: shared stations complain; fix by
      keying on account username (REV87).
- [ ] Project-page tour is Help-only, no first-visit auto-run. Gate: owner wanting
      auto-run for new hires (REV86).
- [x] Settings → Density alias retirement — **closed by REV95** (Settings menu
      retired entirely).
- [x] Where/Style/Filter eyebrow labels hidden below 1400px — **moot since REV92**
      (the native toolbar dropped the taxonomy eyebrows by design).

**Phase 4:**
- [ ] The ⋯ hover cue covers main-timeline bars only. Gate: the same
      discoverability complaint on the project page (REV89).
- [ ] A stashed sample project re-attaches only after a successful load — offline
      boots show the sign-in card. Gate: someone demos offline (REV89).
- [ ] If `ShopTimeline_Tasks2` were missing AND the sample carried to-dos, the
      poll's local-todos guard could drop session-local todos — Tasks2 exists in
      production; noted in code (REV89).
- [ ] Optional 60-second explainer video/page — never scoped. Gate: an owner brief.

**Pre-merge audit (REV90/91):**
- [ ] Staff and Clients modals discard in-progress edits on Escape/backdrop with no
      confirm (the task modal snapshot-compares). Gate: someone loses edits.
- [ ] Calendar marker drag/click/delete block is a near-clone of the Gantt's —
      **gate fires with §3 item 8** (next touch of either handler: merge them).
- [ ] `ROSTER_DEPTS` / `SM_DEPTS` duplicate the roster dept ids. Gate: next
      roster-department change.
- [ ] `#tm-dl` datalist keeps its task-modal prefix while serving the staff modal.
      Gate: next staff-modal edit.
- [x] `tests/run.js` counts a self-skipped suite as "passed" — **closed 2026-08-28
      (v1.0.2):** the runner now prints a SKIP summary line naming self-skipped
      suites (gate fired when the batch registered `test-v102.js`).
- [ ] `metalFab` and `todoToFields`' `labels`/`checklist` are write-only shared-List
      schema — dropping them is a §5-approval decision.

**Edit-in-place popover (REV98):**
- [ ] Popover carries data fields + Delete only; Duplicate and Pin stay
      inspector-only. Gate: shop use asking for them.
- [ ] A background poll landing while the popover/add-menu is open defers until it
      closes. Gate: a real "why didn't I see their edit" report.

**New (v2 track):**
- [ ] Font files & licences (§3 items 6–7): nothing committed until the licence
      check passes; Bahnschrift starts as `local()`-only. Gate: licence confirmed /
      non-Windows coverage demanded. (2026-08-28)
- [ ] Vivid shows no non-working-day marker on the canvas at all (holidays
      included) — the obj-13 ruling makes the month colour king; weekends stay
      visible in the Day/2-Day header and everywhere in Quiet. Gate: someone
      scheduling into a weekend because Vivid hid it. (v1.0.2, 2026-08-28)

**Deliberate design ceilings — no action planned, revisit only on real complaints:**
12-slot palette repeats at 13+ visible projects (T2); quiet re-selection after a
committed project-page resize/move (T4); sidebar names >~26 chars truncate at default
width (T5); off-screen edge chips don't dim with the search filter (T6); bottom-dock
column minimum widths are fixed (U2/E1); In-Design and In-Fabrication bars both
full-strength on purpose, the pill word separates them (U8); the default view parks
today left-of-center — on first load and on every arrival at the timeline via routing
(REV101) — while only the Today button and `T` center it (B3b/REV76).

---

### Legend

- ⚠ Needs explicit approval — touches shared SharePoint schema or Entra/auth config.
- (Obj N) = the owner's objective numbering from the 2026-08-28 v2 brief.
