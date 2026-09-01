# To-Do / Backlog — the v2.0.0 track

**The single working to-do list for Project Scheduler (Timeline).** Started 2026-08-28,
when the v1 backlog was retired to
[`docs/Archive/TODO-v1-Archive.md`](Archive/TODO-v1-Archive.md) with everything closed
except the entries carried into §2 and §7 below. Anything touching **SharePoint schema**
or **Entra/auth** is marked ⚠ (shared with a separately maintained colleague app — see
`CLAUDE.md`). **Process change (owner, 2026-09-01): ⚠ items are not gates.** Schema
changes don't wait for a formal approval cycle — deliver Robert the exact spec (list,
column name, type) and he applies the list edit himself; the app never writes schema.
Additive-only and the colleague-app awareness rule still stand. Same spirit for missing
info generally: prompt for what's needed instead of parking the item.

**Workflow (standing):** all work batches land on the `development` branch and are
viewable at `/preview/` before a manual, deliberate merge to `main` (production).

**Versioning (standing):** semantic versions from v1.0.1 (the REV101 build — see
`docs/Milestones/2026-08-28-semver-switch.md`). Bump the **patch** for fixes, copy, and
styling; the **minor** for feature drops; **v2.0.0 is reserved for the
single-source-of-truth milestone** (§3 item 13) — the app becoming the company's one
database is the breaking change the major number exists for. `APP_VER` in `index.html`
is the source of truth; keep `package.json` aligned.

Last reviewed: 2026-09-01 — folded the **Master Data UX Refactor handoff** (2026-09-01)
into §3 item 27 (Company Data: People and Clients become first-class pages) and refolded
the ladder: item 27 proposed as v1.7.0 (pure UI/routing, no gates), permissions →
v1.8.0, changelog → v1.9.0. Previous review 2026-08-31 — appended the owner's second
objective list (the 2026-08-31 brief, §3 items 14–26) and refolded the version ladder. Same day: v1.2.1–v1.6.0 all
shipped to `development`; **owner called a PAUSE after v1.6.0 — hone the shipped
batches before any new rung (permissions v1.7.0 is NOT started).** The owner's first
`/preview/` review of those batches came back the same day as a ten-item punch list —
all ten shipped as **v1.6.1** (calendar-marker redraw, Saved Views rename + anchor,
past projects sink, sidebar bottom-crop, Today-anchored smooth step zoom, lane
summaries drop past work, shortcuts as a Help popover muted against the Legend,
legend navigation entries removed, drag-zoom smoothing, bug-form radio fix).
Record: `docs/Milestones/2026-08-31-v161-preview-polish.md`. The second review round
(markers ✓, step zoom ✓, drag-zoom still juddery + three new asks) shipped as
**v1.6.2**: same-frame header sync, project date-strip gesture parity, Summary·name
for other people's plates, and the full-height Notes dock column. Record:
`docs/Milestones/2026-08-31-v162-preview-polish-2.md`. The third round (2026-09-01:
drag-zoom ✓, strip gesture ✓) shipped as **v1.6.4**: the Summary/Dashboard place
follows the person into the Projects lens — the lens toggle hides whenever a person
is on; only the dept reading stays flat (`dash-flat`). Record:
`docs/Milestones/2026-09-01-v164-preview-polish-3.md`. Same day, the owner's live-data
report ("legacy person IDs assigned, authenticated IDs not") shipped as **v1.6.5**:
`canonName()` resolves legacy abbreviated crew/role strings ("Davis S.", bare first
names) to roster people inside `barCrew()` — lanes merge, dashboards/filters find
legacy work, overbooking stops skipping them; stored values untouched. Record:
`docs/Milestones/2026-09-01-v165-legacy-person-ids.md`. The owner's follow-up on the
Filters dropdown shipped as **v1.6.6**: the Person radios stay in the menu inside a
Summary (switch or clear the person right there — the v1.2.2 hide reversed), and the
status-scoped Show all / Clear all pair became one menu-wide **Show everything**
reset. Record: `docs/Milestones/2026-09-01-v166-filter-dropdown.md`.

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
      same day (owner) as v1.0.3, EXTENDED same day (owner) as v1.0.4:** on the
      calendar, blank space never deselects — a blank click only dismisses an open
      popover/menu. **Phases multi-expand (v1.0.4):** expansion is its own per-phase
      state (`NPV_CAL_OPEN`) — clicking another phase expands it without collapsing
      the first, any number open at once, deselect collapses nothing; a phase
      collapses only via a second click on its **parent band**, or the new
      **Collapse all** button in the legend bar (right margin, calendar only).
      A re-clicked subtask band reopens its editor; create/duplicate expands its
      phase. Esc/breadcrumb/× still exit; the Gantt keeps empty-canvas deselect.
      Design-Language §6 amended twice. Suite: `tests/test-v102.js`.
- [x] **4. (Obj 5) Window-resize closed the subtask form — FIXED 2026-08-28
      (v1.0.2):** a PP_KEEP repaint (resize, poll, autosave) now carries the
      selection through — form, breadcrumb and ring survive; a poll that deleted the
      selected task drops the dock to the project pane instead of a stale form.
      Root cause: `renderProjectPage` reset `PP_SEL` unconditionally. Suite: as above.
- [ ] **5. (Obj 6) Coach-marks language revision — TABLED INDEFINITELY (owner,
      2026-08-31).** Extraction list delivered 2026-08-28. If copy ever arrives it's
      a copy-swap patch across `COACH_STEPS` / `COACH_PP_STEPS`. (New steps are not
      covered by the hold — the 08-31 obj 1 step shipped in v1.2.1.)

### Fonts (patch/minor — one licensing check first)

- [ ] **6. (Obj 10) Brauer Neue for the app title (TWOSEVEN).** TTF/OTF on hand;
      `@font-face` + one `font-family` rule on the title. **Licence CONFIRMED
      2026-09-01 (owner): permits use — gate cleared.** Waiting only on the file:
      Robert drops the TTF/OTF into a repo `fonts/` folder (or hands it over), then
      it's a wire-up patch. The font file must also join the deploy allowlist in
      `.github/workflows/deploy-pages.yml`.
- [ ] **7. (Obj 11) Bahnschrift app-wide, if practical.** Regular weight TTF only, no
      italics. **Licence CONFIRMED 2026-09-01 (owner).** Bahnschrift ships with
      Windows 10+, so the first rung needs NO file at all: `font-family: Bahnschrift,
      <current stack>` via `local()` (covers every shop Windows machine free); commit
      the TTF only if Mac/mobile coverage proves needed. Verify weight/spacing at the
      app's small sizes before going global. Fully unblocked — ride the next patch.

### Calendar interaction features (minor bumps)

- [x] **8. (Obj 7) Double-click calendar blank space creates a phase — DONE
      2026-08-31 (v1.1.0).** The double-click opens the "Add a phase" department
      picker at the pointer (a phase needs a department — same list as right-click,
      one step shorter), seeded with the clicked day; the fresh phase arrives
      selected with its edit popover open on the name field. Both pages (REV49
      lesson). Calendar only — the Gantt's blank double-click stays reserved.
      Design-Language §6 amended. Suite: `tests/test-v102.js`. *(Correction to the
      earlier note here: this did not touch the marker drag/click/delete block, so
      the marker-dedup ledger gate did NOT fire — that entry stays open.)*
- [x] **9. (Obj 9) Live drag dynamics for duration drag-to-edit — DONE 2026-08-31
      (v1.1.0).** On the calendar, the grabbed edge handle follows the pointer
      px-for-px (clamped to its week row) while the REV83 day tint and tooltip show
      the snapped result; the existing full-day snap owns the outcome on release.
      Phase and subtask bands alike. The Gantt already live-follows — the calendar
      was the odd one out; ceilings ledgered in §7. Suite: as above.

### My Dashboard as a real view (minor bump)

- [x] **10a. My Dashboard never presents as a filtered view — DONE 2026-08-31
      (v1.2.2, owner revision to obj 1):** the person that mechanically powers the
      dashboard stops counting as a filter while it's on — no "Person: name" chip
      (the trail bar already names them), no Filters badge for it, the Person
      section hidden from the Filters menu (status + client only), Clear filters
      hidden until a status/client filter is set and never exits the dashboard,
      and the empty-state card stops explaining a "person filter". Off the
      dashboard, the person filter behaves exactly as before.
- [x] **10. (Obj 1) My Dashboard becomes its own place — DONE 2026-08-31 (v1.2.0).**
      Mechanics unchanged (Departments lens + person filter); presentation is a
      distinct view: a project-page-style trail bar (`All Projects › My Dashboard ·
      name` + × exit) fixed under the toolbar, lens toggles/⇕ All hidden behind a
      "My Dashboard" sidebar label, every assigned phase flat (collapsed sections
      ignored, carets hidden), and the summary dock trades its old breadcrumb/✕ for
      the REV99 collapse chevron persisted under its own key. Record:
      `docs/Milestones/2026-08-31-v120-dashboard-view.md`. Suite:
      `tests/test-v120.js` (+ test67/68 branched).

### Bug reporting (minor bump — one storage decision ⚠)

- [x] **11. (Obj 2) Bug report / feature request form — DONE 2026-08-31 (v1.6.0).**
      Help ▾ → "Report a bug or idea": Name + Email prefilled from the signed-in
      account, Bug vs Feature, multiline description, optional screenshot. Posts to
      the owner-created `ShopTimeline_Feedback` list. **One design change from the
      straw proposal ⚠→resolved:** Graph v1.0 has no list-item-attachment API, so
      the screenshot uploads to the site's default document library
      (`/ShopTimeline Feedback/` folder, created on first upload) and the report
      links to it in the description — no new columns needed. Failure toast points
      at the Site-contents-vs-My-Lists check. Suite: `tests/test-v160.js`.

### Permissions (minor bump, v2-gating)

- [ ] **12. (Obj 3) Admin vs regular user permissions.**
      - Admin roster: a checkbox per person, populated from the same staff list
        People & Availability uses; admins can grant/revoke admin (checkbox inside
        People & Availability — after §3 item 27 lands, this surface is the People
        page's edit state). **⚠ needs an `admin` column on the staff list — spec
        delivered 2026-09-01 (single line of text named exactly `admin`, lowercase,
        on `ShopTimeline_Staff`, TWOSEVENINC site); Robert creates it.** Additive,
        so the colleague app is unaffected (it ignores unknown columns).
      - Admins: full access as the app is today.
      - Non-admins: no client list, no people edits, no department/phase edits;
        **Lock Dates on by default and the button hidden**; Project Edit fields
        render as plain text (not inputs/checkboxes) — visible, locked.
      - ~~Owner's brief cut off at "This form is its own page with its own toolbar ("~~
        — **RESOLVED 2026-08-31: owner said disregard the incomplete sentence.** No
        own-page form requirement; scope is the roster checkbox + gating above.
      - **Design constraint to record honestly:** this is a client-side SPA; every
        signed-in user's token carries `Sites.ReadWrite.All`, so UI gating is
        workflow protection, not security — a determined user could still write via
        Graph. Real enforcement would need SharePoint-side permissions. State this
        in the milestone record; decide if it's acceptable (it likely is, same trust
        model as the shared Lists today).

### 2026-08-31 brief — quick wins (patch bumps, batchable)

Objective numbers below are from the **2026-08-31 brief** (a separate numbering from
the 08-28 brief above — see the legend).

- [x] **14. (08-31 obj 12) "Add a phase" removed from the right-click menu — DONE
      2026-08-31 (v1.2.1).** Both pages (the menu builder is shared). New checkpoint /
      New task stay (items 21–22 will rename those labels); phase creation keeps its
      other doors (calendar double-click picker untouched, Departments checklist).
- [x] **15. (08-31 obj 2) Past projects' date pill removed — DONE 2026-08-31
      (v1.2.1), CORRECTED same day (owner screenshot) as v1.2.2:** the pill is the
      **B1 off-screen edge chip** on the Gantt canvas, not the sidebar LATE chip.
      v1.2.2 reverts the LATE-chip gating (it shows again exactly as before) and
      instead suppresses the **left** edge chip on rows whose every bar wrapped
      before today; current rows keep their chips, and right chips (always pointing
      at upcoming bars) are untouched.
- [x] **16. (08-31 obj 10) Concurrency warning counts — DONE 2026-08-31 (v1.2.1):**
      "… is on **X other jobs** during this window", X = distinct other *projects*
      sharing this bar's crew in the window (singular/plural handled).
- [x] **17. (08-31 obj 11) Forecast renders uncolored — DONE 2026-08-31 (v1.2.1):**
      `FORECAST_GREY` everywhere a forecast project draws (bars in both color modes,
      install bars included, sidebar dot, outline); palette slot stays reserved so
      colors don't shuffle when the status firms up. Legend + Design-Language §2.1
      updated (the one exception to hue-is-identity).

### 2026-08-31 brief — tour addition (patch)

- [x] **18. (08-31 obj 1) Date-bar drag tour step — DONE 2026-08-31 (v1.2.1),**
      owner-approved same day (new steps aren't covered by the copy hold): "Slide
      through time" step on `#gantt-hdr`, after the timeline step.

### 2026-08-31 brief — Department view (minor bump)

- [x] **19. (08-31 obj 5) Dept-view phase click navigates to the project edit
      page — DONE 2026-08-31 (v1.3.0).** The task modal stays the Projects-lens
      edit surface (§6 exception recorded in Design-Language). The clicked phase
      is not preselected on arrival — ledgered in §7.
- [x] **20. (08-31 obj 9) Department-view sidebar restructure — DONE 2026-08-31
      (v1.3.0):** lane rows read name-over-department (the `.sb-2l` two-line
      pattern), and the freed right side lists that lane's assignments —
      project + dates, current work first, capped to what the row height fits
      with a "+N more" tail.

### 2026-08-31 brief — Milestones & Notes (minor bump — rename + simplify)

UI copy and editors only — **stored SharePoint field names stay as-is** (shared-schema
rule §5); old data keeps reading fine.

- [x] **21. (08-31 obj 3) Checkpoint → Milestone — DONE 2026-08-31 (v1.4.0).** Every
      editor (agenda row, edit popover, phase-modal list) is date + plain-text name +
      phase; the type dropdown/datalist (`TN_TARGETS`) and the notes field are gone.
      Old stored notes/types still read (tooltips show them); they're just no longer
      editable. Copy sweep across menus, toasts, dashboard, legend, tour, shortcuts.
- [x] **22. (08-31 obj 6) Task → Note — DONE 2026-08-31 (v1.4.0).** Note editors are
      date + single-line text only — the phase picker and who field left the note's
      agenda row and popover (per the spec's "only"; stored fields untouched, so old
      who/phase data persists invisibly). Ledgered in §7.
- [x] **23. (08-31 obj 4) Gantt marker labels hidden — DONE 2026-08-31 (v1.4.0):**
      the project Gantt draws no inline milestone/note label (`.npv-evlbl` retired);
      the hover title carries name · date, click opens the edit popover (as before).
      Calendar bands keep their in-cell names — they don't overlap the same way.

### 2026-08-31 brief — zoom revision (minor bump)

- [x] **24. (08-31 obj 7) Viewport-fitting zoom — DONE 2026-08-31 (v1.5.0),
      GESTURE INCLUDED.** Week/Month/3-Month fit 7/30/91 days across the live
      viewport (old stored steps migrate: Day/2-Day→Month, Week→3-Month; W/M keys,
      +/− walk). The vertical date-bar drag shipped: it slides the fit continuously
      between Week and 3-Month, anchored on the date under the pointer, rAF-throttled
      (~14–21ms/frame measured at 14 projects in a real browser — usable). Built with
      a **45° axis split instead of the suggested ±15° bands** — bands leave dead
      diagonal zones where a drag does nothing, which reads as broken; ledgered in §7.
      Header degrades by px-per-day, not step name. Design-Language §7 rewritten.
- [x] **25. (08-31 obj 8) Project Gantt zoom — DONE 2026-08-31 (v1.5.0):** the same
      Week/Month/3-Mo steps plus **Fit** (whole job — the historical scale, still the
      default), Gantt mode only, persisted per browser. No drag-zoom gesture on the
      project date strip — ledgered in §7.

### 2026-08-31 brief — change log (minor bump, after permissions ⚠)

- [ ] **26. (08-31 obj 13) Project Edit change log.** Admin-viewable (needs §3
      item 12 permissions first). Two surfaces: a **global changelog** in the
      Resources dropdown (→ the Company Data group once §3 item 27 renames it), and
      a **project-specific changelog** on the project edit page (that project's
      changes only). **Owner rulings 2026-08-31:** the list is
      approved — app-side `ShopTimeline_Changelog` (additive; field spec delivered
      2026-08-31, chat + §5); and "replaces the dock" means a SECOND collapsible
      edit dock with the changelog as contents, footer toggle, **only one dock
      viewable at a time** (not the REV99 dock's removal).

### 2026-09-01 handoff — Company Data: People & Clients as pages (minor bump)

- [ ] **27. (09-01 handoff) People and Clients become first-class application pages.**
      The core move:
      **modal → batch form → save/cancel** becomes **persistent location → record
      index → selected record → explicit edit state**. This is a presentation /
      interaction / routing refactor — **no schema changes**, all SharePoint
      persistence and current behavior preserved. **Full handoff committed 2026-09-01:
      `docs/2026-09-01-Master-Data-UX-Refactor-Handoff.md`** (staff names in its
      examples are fake — owner confirmed).
      - **Routing:** extend the REV35 hash router (`ROUTE`/`parseRoute`,
        `index.html` ~4011) with `#/people` and `#/clients` views on the
        project-page precedent: trail bar (`All Projects › People`), timeline-only
        toolbar controls hidden, obvious route back to `#/`. Per-record URLs
        (`#/people/:id`) only if they fall out cleanly — a master/detail selection
        state inside the page is acceptable; don't over-engineer the router.
      - **Naming:** Resources menu group → **Company Data**; "People &
        Availability" → **People** (availability becomes information belonging to
        a person, not a peer nav concept). Future master-data sections
        (Departments, Project Types, Holidays…) join this group — it is the UX
        shell the §3 item 13 consolidation absorbs stores into.
      - **Read mode vs edit mode (critical):** default record presentation is
        read-oriented — fields render as information ("the company record for X"),
        NOT as always-editable form controls moved onto a page. An explicit Edit
        action enters edit state (inline in the detail pane or a scoped modal —
        implementer's choice); Cancel/Save exit it. Add Person / Add Client may
        stay modals: **the entity gets a page, the action may get a modal.**
      - **Index views:** searchable/filterable list-tables (columns from the
        existing data model — name/role/departments/availability for people,
        client/alias for clients), record count + the existing sync indicator as
        system-of-record cues ("18 people · SharePoint · Synced 11:48"). Desktop:
        master/detail side by side; narrow viewport: selection transitions to the
        detail view (no cramped two-column squeeze).
      - **Record-level actions,** not batch-list editing: Add / Edit per record.
        Archive/Deactivate lifecycle (Active/Inactive/Archived) **needs a status
        column on the shared staff/clients lists ⚠ — NOT in this pass.** First
        pass: no casual per-row × delete buttons in the new UI; keep existing
        delete paths where they exist, behind intent + confirm. Ledger the
        lifecycle gap in §7 when the batch ships.
      - **Relationship context** only where derivable reliably from data already
        in memory (client → project counts via the existing client/project link;
        person → assignment counts via the v1.6.5 `canonName` machinery). Don't
        fabricate; leave the layout room for richer relational panels later.
        Deactivation guards ("assigned to 6 active projects — reassign first")
        ride the lifecycle column, not this pass.
      - **Before refactoring:** inventory the People/Client modals' state,
        SharePoint read/write paths, temp/copy state before Save, and every
        consumer of these datasets elsewhere in the app (staff picker, filters,
        dashboards, crew chips…). Nothing regresses — availability management
        included.
      - **Visual:** existing design system only — compact, information-dense; no
        dashboard cards, oversized headings, or a separate Company Data look.
        Authority comes from structure and interaction, not visual weight.
      - **Interactions with other items:** §3 item 12's admin checkbox lands on
        the People page (refactor first = permissions gate pages, not modals);
        item 26's "global changelog in the Resources dropdown" surface becomes
        the Company Data group. Acceptance criteria in the handoff; the short
        version: both pages feel like persistent company directories, editing is
        intentional, everything that worked still works.

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
      frozen or retired.** The §3 item 27 Company Data pages are the UX shell this
      work lands in — each absorbed store becomes a section under Company Data,
      using the People/Clients page pattern.

## 4. Version ladder (proposed — adjust as batches actually land)

| Release | Contents (§3 items) |
|---|---|
| v1.0.2 | ✅ Shipped 2026-08-28 — quick wins 1–4 + stale-Settings strings (§2) + runner SKIP line |
| v1.0.3 | ✅ Shipped 2026-08-28 — obj 8 revision: calendar blank space never collapses; the parent band click toggles |
| v1.0.4 | ✅ Shipped 2026-08-28 — obj 8 extension: phases multi-expand on the calendar; Collapse all in the legend bar |
| v1.1.0 | ✅ Shipped 2026-08-31 — calendar interactions: obj 7 double-click create + obj 9 live drag-follow |
| v1.2.0 | ✅ Shipped 2026-08-31 — obj 1: My Dashboard as its own view (trail bar, no lens toggles, flat phases, collapsible dock) |
| v1.2.1 | ✅ Shipped 2026-08-31 — 08-31 quick wins 14–17 + tour step 18 |
| v1.2.2 | ✅ Shipped 2026-08-31 — item 15 correction (the "date pill" is the B1 edge chip; LATE chip restored, past rows lose their left edge chip) + item 10a (the dashboard never presents as filtered) |
| v1.2.x | 5 (coach copy — tabled indefinitely) · 6–7 (fonts, once licence-checked) — patches whenever unblocked |
| v1.3.0 | ✅ Shipped 2026-08-31 — Department view: phase click routes to the project page; lane rows get name-over-dept + assignment dates |
| v1.4.0 | ✅ Shipped 2026-08-31 — Milestones & Notes: renames + simplified editors + Gantt labels hidden |
| v1.5.0 | ✅ Shipped 2026-08-31 — viewport-fitting zoom (Week/Month/3-Mo + drag-zoom gesture) on both Gantts |
| v1.6.0 | ✅ Shipped 2026-08-31 — bug report / feature request form (list created by owner same day) |
| v1.6.1 | ✅ Shipped 2026-08-31 — the owner's ten-item `/preview/` punch list (see Last-reviewed note + milestone record) |
| v1.6.2 | ✅ Shipped 2026-08-31 — second review round: header/canvas same-frame sync (drag-zoom judder), project date-strip pan/zoom parity (§7 gate half-fired), Summary·name for other people's plates, full-height Notes dock column |
| v1.6.3 | ✅ Shipped 2026-08-31 — project-Gantt scroll fallout: step buttons anchor today, sticky axis gutter mask, weekend webs moved under the rows with the §2.4 hatch (they painted OVER the bars) |
| v1.6.4 | ✅ Shipped 2026-09-01 — third review round: the Summary/Dashboard place follows the person into the Projects lens (toggle hidden while a person is on; flat treatment stays dept-only) |
| v1.6.5 | ✅ Shipped 2026-09-01 — legacy person strings resolve to roster people (`canonName` in `barCrew`): dept lanes merge, person filter/dashboards find legacy-named work, overbooking sees through old strings; stored values never rewritten |
| v1.6.6 | ✅ Shipped 2026-09-01 — Filters dropdown revision: Person radios stay in the menu inside a Summary (switch/clear in place; Everyone = the × exit), one menu-wide "Show everything" reset replaces the status-scoped Show all / Clear all pair |
| v1.7.0 | 27 (Company Data: People & Clients pages) — no gates; proposed to run before permissions so item 12 gates pages, not modals |
| v1.8.0 | 12 (permissions) ⚠ |
| v1.9.0 | 26 (change log) ⚠ — after permissions |
| v2.0.0 | 13 (single source of truth) ⚠ — likely several minors along the way (one per absorbed store), with v2.0.0 as the cutover declaration |

## 5. Data / schema (⚠ all need approval — shared Lists)

- `ShopTimeline_Feedback` (§3 item 11) — **APPROVED + CREATED 2026-08-31** from the
  delivered field spec. All columns single-line text except `description`
  (multi-line, plain text): Title, kind, name, email, description (multi-line),
  appVersion, appId. `appId` is app-written; the built-in SharePoint ID is
  unrelated. **Screenshot handling changed at build time (v1.6.0):** Graph v1.0 has
  no list-item-attachment API, so screenshots upload to the site's default document
  library (`/ShopTimeline Feedback/`) and the report links to them — no extra
  columns, no schema impact.
- `ShopTimeline_Changelog` (§3 item 26) — **APPROVED + CREATED 2026-08-31**, same
  arrangement. All single-line text except `detail` (multi-line, plain text):
  Title, projectId, who, at, field, detail (multi-line), appId.
- **Verify before first use:** both new lists must live on the TWOSEVENINC site
  (Site contents), not "My Lists" — the app resolves lists by name on the site and
  cannot see personal lists. (Owner had strays in My Lists, 2026-08-31.)
- Candidate new column: `admin` on the staff list (§3 item 12) — **spec delivered
  2026-09-01; Robert creates it** (single line of text, exact name `admin`).
- Candidate new column: a lifecycle/`status` column (Active/Inactive/Archived) on
  `ShopTimeline_Staff` and `ShopTimeline_Clients` (§3 item 27's archive-not-delete
  model) — additive; Robert applies it when item 27's lifecycle pass is designed
  (exact spec to be delivered with that batch). Item 27's first pass ships without it.
- **Non-change to note:** the Checkpoint→Milestone / Task→Note renames (§3 items
  21–22) are UI copy only — stored field names do not change.
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
- [ ] Calendar live feedback covers resize only (REV83 tint; v1.1.0 added px-level
      edge-follow) — drag-to-MOVE still keeps tooltip-only feedback. Gate: the same
      complaint about moves. New v1.1.0 ceilings: the live follow stretches only the
      grabbed week-row segment (a multi-week phase's other rows redraw on release),
      and the pixel follow can briefly overshoot the nesting/pin clamp — the tint
      and the release snap always show and file the clamped truth. (2026-08-31)
- [ ] Collapsed calendar phase spans only the parent bar's window — an out-of-window
      subtask is invisible until expanded. Gate: a PM missing one (REV84).
- [x] Calendar collapse follows selection, not the Gantt's ▸ state (REV84) —
      **superseded 2026-08-28 (v1.0.4):** the calendar now has its own multi-expand
      state (`NPV_CAL_OPEN`), decoupled from selection. Still independent of the
      Gantt's ▸ state — that half of the gate stands: someone expecting the two
      surfaces to share expansion.
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
- [ ] Dept-lens phase click lands on the project page without preselecting the
      clicked phase — arriving selected needs a cross-route handoff. Gate: PMs
      asking "why do I have to find the phase again". (v1.3.0, 2026-08-31)
- [ ] Lane assignment lines clip to row height with "+N more" — no way to see the
      tail without expanding density. Gate: real complaints. (v1.3.0, 2026-08-31)
- [ ] Old milestone notes/types and note who/phase data survive in storage but have
      no editor — visible only in main-timeline tooltips (notes) or not at all
      (who). Gate: someone needing to read or clear old values; fix is a read-only
      line in the popover. (v1.4.0, 2026-08-31)
- [ ] Marker hover uses the native `title` (unstyled, invisible on touch) — same
      ceiling as the Phase 1 T8 entry above; the two share a gate. (v1.4.0)
- [ ] Drag-zoom uses a 45° axis split, not the owner's suggested ±15° bands — bands
      leave dead diagonal zones where a drag does nothing. Gate: owner preferring
      the bands after feeling the split on `/preview/`. (v1.5.0, 2026-08-31)
- [ ] The project page's date strip has no drag-zoom gesture (buttons only) and the
      global page has no Fit step. Gate: someone reaching for either. (v1.5.0)
      **Half-fired 2026-08-31 (v1.6.2):** the owner reached for the strip gesture —
      shipped, full parity with the global header (pan + continuous zoom, float
      NPV_FIT). The global-Fit half stays open on the same gate.
- [ ] A drag-set custom FIT survives reloads but has no UI to re-enter it exactly —
      the buttons snap to named steps. Cosmetic. Gate: someone caring. (v1.5.0)
- [ ] Font files & licences (§3 items 6–7): nothing committed until the licence
      check passes; Bahnschrift starts as `local()`-only. Gate: licence confirmed /
      non-Windows coverage demanded. (2026-08-28) **Gate half-fired 2026-09-01:
      licences CONFIRMED (owner) — Brauer Neue awaits the file upload; the
      `local()`-only start for Bahnschrift stands until non-Windows coverage is
      demanded (that half stays open).**
- [ ] Vivid shows no non-working-day marker on the canvas at all (holidays
      included) — the obj-13 ruling makes the month colour king; weekends stay
      visible in the Day/2-Day header and everywhere in Quiet. Gate: someone
      scheduling into a weekend because Vivid hid it. (v1.0.2, 2026-08-28)
- [ ] Calendar milestone prefix is the **department** name, not a phase's custom
      label — markers only carry the department id. Gate: someone renames a phase
      and expects the custom name in the prefix. (v1.6.1, 2026-08-31)
- [ ] Dept-lane summaries keep **upcoming** assignments (the complaint was past
      ones); a strict "in progress only" read is a one-line filter. Gate: the owner
      asking for future work gone too. (v1.6.1)
- [ ] The sidebar/canvas scroll parity fix pads by the footer height but not the
      Gantt's ~10px horizontal scrollbar — the last few px of sync can clamp at the
      very bottom. Cosmetic. Gate: someone notices. (v1.6.1)
- [ ] Project-Gantt today column and deadline pennant (z4) out-stack the sticky row
      gutters (their z3 lives inside z1 row contexts) — at extreme scroll the
      translucent today wash can slide over the name column. The axis is masked
      (v1.6.3); a full fix means restructuring the gutter stacking. Gate: someone
      notices it on a real job. (v1.6.3, 2026-08-31)
- [ ] The Summary/Dashboard locks its lens — the Projects/Departments toggle hides
      while a person is on, so regrouping the same person means exiting (×) and
      re-entering from the other lens. Same trade My Dashboard made in v1.2.0.
      Gate: someone asking to regroup in place. (v1.6.4, 2026-09-01)
- [ ] Legacy person strings are healed at compare/display time only — the stored
      `projectManager`/`drafter`/`leadFab`/assignee values keep their old
      abbreviations until someone next edits that project's Team boxes or that
      task's crew (the editors resolve to roster names, so a save writes canonical).
      A one-time data scrub of the shared-list values would finish the job at once
      but is shared-data territory ⚠. Gate: the owner ordering the scrub.
      (v1.6.5, 2026-09-01)
- [ ] `canonName` covers bar crews and role fields, not to-do assignees — a to-do
      stored with a legacy name still misses its person's dashboard Notes section.
      Gate: someone missing a to-do; fix is the same map in the me-dock/todo
      filters. (v1.6.5)
- [ ] Two roster people sharing a first name + surname initial keep legacy strings
      unmerged (deliberate ambiguity rule — never guess identity). Gate: it happens
      on the real roster; fix is a manual data correction, not code. (v1.6.5)
- [ ] "Show everything" clears the person (exits the summary like the ×) while the
      toolbar Clear filters still keeps it (the v1.2.2 ruling) — a deliberate
      asymmetry: the menu button is the owner-specified full-list reset, the toolbar
      button keeps the dashboard-safe behavior. Gate: the owner asking for the two
      to align either way. (v1.6.6, 2026-09-01)
- [ ] The status section lost its "Clear all" (hide everything, then tick one) —
      isolating one status now means unchecking the rest by hand. Gate: someone
      missing it; fix is a per-item "only" affordance, not the confusing pair.
      (v1.6.6)

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

- ⚠ Touches shared SharePoint schema or Entra/auth config. **Not a gate (owner,
  2026-09-01):** deliver Robert the exact spec and he applies the list edit;
  additive-only and colleague-app awareness still apply. Entra/auth changes still
  need explicit instruction (CLAUDE.md).
- (Obj N) = the owner's objective numbering from the 2026-08-28 v2 brief.
- (08-31 obj N) = the owner's numbering from the 2026-08-31 brief (a separate list —
  the two briefs' numbers do not correspond).
- (09-01 handoff) = the 2026-09-01 "Master Data UX Refactor" handoff (unnumbered —
  a single scoped objective, §3 item 27).
