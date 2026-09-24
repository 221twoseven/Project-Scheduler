# To-Do / Backlog — Phase 7: pilot readiness, on the road to v2.0.0

**The single working to-do list for Project Scheduler (Timeline).** Started 2026-09-24,
when the v1.x backlog was retired to
[`docs/Archive/TODO-v1.x-Archive.md`](Archive/TODO-v1.x-Archive.md). Every entry still
open there was checked against the code before it was carried; the carried entries are in
§7 with their gates, the stale ones are closed in §7.0.

Two documents set this phase and are the source for most lines below:

- **The Project Director's brief** — *Shop Timeline App: Current Processes and Development
  Priorities* (September 2026), read here in Robert's condensed, annotated version
  (2026-09-22). Cited as **[brief §N]**. Its "Response" annotations were fact-checked
  against the app on 2026-09-24; where a claim was partly wrong, the corrected fact is what
  appears below.
- **The owner's vision (2026-09-24)** — Timeline stays a project-management and scheduling
  app with its features intact, and moves into a portal of sibling apps (Client Manager,
  Personnel Manager, Design Resources Manager) that share the same SharePoint lists, one
  permission model, and one visual language. Cited as **[vision]**.

**Nothing in this file is started.** §3 is a proposed build list, §4 the decisions it
depends on. Both are to be agreed with Hubert, the Project Director and the key users who
administer specific views before any code lands. Development is no longer solitary:
milestones and this plan are presented as the phase runs.

**Standing rules (unchanged from v1.x):**

- ⚠ marks a SharePoint column/list or Entra change. **Not a gate** (owner, 2026-09-01):
  deliver Robert the exact spec (list, column, type, values) and he applies the list edit;
  the app never writes schema. Additive-only while the colleague app shares the lists
  (§4 D2). Entra changes still need explicit instruction (`CLAUDE.md`).
- Work lands on `development`, is viewable at `/preview/`, and is promoted to `main` by a
  deliberate manual merge. `/preview/` and `/sandbox/` write the **live** lists (§3 item 17).
- Semantic versions; `APP_VER` in `index.html` is the source of truth, `package.json` and
  `CHANGELOG.md` follow it (`npm run notes`; CI fails without a release-notes line).
  **v2.0.0 is re-reserved** for the Phase 8 cutover defined in §1, not for "the app
  becomes the one database".
- Every milestone gets a record in `docs/Milestones/Phase-7-Pilot-Readiness/`; every
  deliberate skip gets a §7 line with its gate.

Last reviewed: 2026-09-24 — file created (see §8 for the log).

---

## 0. Where we stand

Production (`main`) runs **v1.23.0** plus the 2026-09-18 view-as fix (PR #49); `development`
is level with it apart from the docs reorg. Since the v1.x backlog opened on 2026-08-28 the
app gained My Dashboard, calendar interactions and detail levels, the Department view,
Milestones & Notes, saved views and viewport zoom, bug reporting, admin/viewer/developer
permissions with per-door grants, the Company Data pages (People, Clients), the Employee
Contacts import, the change log, generated release notes, the weekly schedule and the
Freelance flag — 44 numbered objectives, all shipped. What did **not** ship is the one
strategic item: the data-consolidation strategy (v1.x §3 item 13) was never written, and
the brief is, in effect, its first draft.

The brief's verdict on the app: ready for user testing; verify what exists before calling
anything an integration; the three foundational business controls (cost-code registry,
closeout queue, one rule for 27 Events vs Outlook) are SharePoint and Power Automate work
beside the app, not app features. Its one P0 that needs new app code is **closeout**.

## 1. North star, restated

**Retired framing (v1.x):** "the app becomes the company's singular source of truth";
each of the 14 stores is absorbed into Timeline's Company Data pages; v2.0.0 declares the
cutover.

**Proposed framing (needs sign-off — §4 D7):**

1. **The shared SharePoint registries are the source of truth, not any app.** One record
   per fact, keyed by a stable internal ID, with one owner per field and its freshness
   visible. Projects, Clients, People, Cost Codes, Events, Departments, Shop Closures,
   Closeouts are registries; Timeline, the portal and its sibling apps are *views* of them
   [brief §5, §8; vision "no duplicate entries"].
2. **Timeline stays the schedule.** It keeps every feature as designed and reads/writes the
   operational fields of those registries — dates, work blocks, assignments, status. It stops
   being a candidate master for people, clients or cost codes [vision; brief §7].
3. **Duplicate entry is removed before features are added.** After the pilot, the first
   retirement of a manual re-typing step is the measure of success, not a new view
   [brief §1, §10].
4. **Sensitive data is protected by SharePoint permissions, not by hiding it in a UI.** The
   app runs in the browser with each user's own token; anything a user must not see lives in
   a list or library they cannot read (§4 D3).
5. **v2.0.0 = Timeline running on the shared registries** — the first `ShopTimeline_*`
   master retired in favour of a shared one. That is the breaking change the major number
   exists for. The portal and sibling apps arrive as v2.x/v3, each app its own client of
   the same registries.

What this changes in the app's own vocabulary: the Company Data pages stop being "the shell
every store lands in" (v1.x item 27) and become the seeds of Client Manager and Personnel
Manager (§4 D8); the v1.x "app as declared master" gate on v2.0.0 is dropped.

## 2. Roadmap

| Phase | Versions | Goal | Done when |
|---|---|---|---|
| **7 — Pilot readiness** (now) | v1.24 → v1.3x | The brief's P0 app items, closeout as the one new feature, verification of what exists, the outside-the-app controls handed to their owners, the design decisions in §4 taken | Pilot users create and update jobs without missing workers, lost edits or misleading dates; a finished job can't fall through before the balance invoice; at least one duplicate-entry step is named for removal [brief §9, §10.1] |
| **8 — Shared registries** | v2.0.0 (+ minors per registry) | Linked Client, Project and Cost Code lists with stable IDs; Timeline re-pointed to them; assignments by person ID; departments and shop closures as lists, not code | A `ShopTimeline_*` master is retired for a shared registry with no loss; two cost-code requests at once can't collide; the workbook is frozen read-only [brief §6, §8, §9 P1] |
| **9 — The portal and the suite** | v2.x → v3 | Homepage portal; Client Manager, Personnel Manager, Design Resources Manager; permission sets per audience; shared design system with per-app colour/icon identity | Each audience (PM, HR, Accounting, Purchasing, Operations, Management) has its own entry point over the same records; nothing is entered twice [vision; brief §9 P2–P3] |

**Version ladder (proposed — adjust as batches land):**

| Release | Contents (§3 items) |
|---|---|
| v1.24.0 | 1–2 (terminology + Lock dates copy), 4 (time-off notes private), 9 (import `$select`, phone fallback) — the pilot's copy-and-privacy batch |
| v1.25.0 | 7 (repeat work discoverable: Duplicate on the bar, ⋯ cue, New Project grip + section progress), 8 (rollup band label) |
| v1.26.0 | 5 (date certainty ⚠ `dateCertainty`), 6 (visible last update + stale flag) |
| v1.27.0 | 11 (closeout & billing states ⚠, PM checklist, verification, Bookkeeper queue, aging) — may split into two minors |
| v1.2x.y | 3 (tour repro/fix), 10 (auto-Complete vs closeout), 19–24 as they resolve |
| v2.0.0 | Phase 8 cutover (§1 point 5) |

## 3. Phase 7 work — proposed, not started

Numbering restarts at 1 for this file; v1.x item numbers are cited as "v1.x item N".

### P0 — before the pilot, in the app [brief §9 row 1; §7]

- [ ] **1. Terminology pass.** "Job code" → **Cost Code** everywhere it shows (sidebar,
      bar labels, tooltip, Meeting Sheet, late prompt, New Project); "Drafter" → **Technical
      Designer**. Screen labels only — stored field names (`jobCode`, `drafter`) stay, the
      schema is shared. Copy channel: round two of `docs/Copy-Coach-and-Helpers.md`
      (round one shipped v1.15.1). "Flexible roles instead of fixed buckets" is a data-model
      change (four fixed role columns today: PM, Drafter, Lead fabricator, Fabricators, plus
      a legacy `metalFab`) — Phase 8, §4 D10. [brief §7 Terminology]
- [ ] **2. Lock dates explained — and made to mean one thing.** Today it means two: on the
      timeline it stops moves (a resize grab downgrades to a move, a move applies no date
      change — but a drag can still change the department/assignee lane); on the project
      page it blocks *resize only* and a move still shifts dates. Decide the single meaning,
      then relabel + tooltip. Always on for viewers except under the `viewer.phases` grant;
      not remembered between visits. [brief §5.1, §7 "Tour and Lock dates"]
- [ ] **3. Tour "looped" — repro, then fix or gate.** No loop bug on record. Working
      hypothesis: a browser whose `localStorage` returns null every session (private window,
      or a policy that clears site data on exit) replays the first-visit tour on every boot
      (`shopTimelineCoachSeen`). Get the reporting user's browser/setup. Fix options: a
      per-person seen flag (⚠ one Staff column) or a "don't show again" on the card. The
      owner ruled "leave it" on 2026-09-02; the brief is the complaint that ruling's gate
      named (§7 L1001). Also: the chained tour's step count assumes the second half lands on
      a draft (§7 L1233). [brief §5.1, §9 P0 "tour fix"]
- [ ] **4. Time-off notes private.** Notes typed on an Out-of-office range render to every
      signed-in user at three sites (People record, dashboard, person panel). Hide them from
      non-admins, or drop the field from non-admin views. The brief's suggested P0 addition.
      [brief §7.2, §9 Response]
- [ ] **5. Date certainty: Tentative / Confirmed / TBD.** ⚠ one Projects column,
      `dateCertainty` (single-line text, `tentative` / `confirmed` / empty = confirmed;
      tristate so other saves never 400). Surfaces: sidebar chip, bar label, project page
      header, Meeting Sheet. **Start with the default:** New Project pre-fills the install
      date at today + 42 days, so the "required" date is never actually chosen — either mark
      the default Tentative or remove it and ask. Forecast status stays as the *project*
      state; certainty is about the *date*. [brief §7 Early dates; §9 P0]
- [ ] **6. Last update visible, stale flag.** `updatedBy`/`updatedAt` already come from
      Graph but show only in hover cards (and, for admins, the change log). Put last editor +
      time on the project page header and the Meeting Sheet; add a stale chip (no edit in
      N days — N set with the Project Director) in the sidebar and legend. [brief §5.1, §7
      Reliability, §9 P1 "stale-data warnings"]
- [ ] **7. Repeat department work discoverable.** The capability exists (each block is its
      own record; Duplicate and New subtask work before the first save); the gap is finding
      it. Duplicate on the bar's popover/right-click, not only the inspector (§7 L1044); the
      ⋯ hover cue on project-page bars (§7 L1011); New Project divider: a grip visible before
      hover (cursor, tooltip, remembered height and collapse already exist), section progress,
      links to the missing fields Create already names. [brief §1, §7 Repeat work + New
      Project layout, §9 P0 "before shop-wide use", P1 "small fix"]
- [ ] **8. Department rollup: label or drop the envelope.** The faint band behind each
      department row spans first start → last finish. Label it "Overall span" or remove it.
      Fact-check correction: the app *does* have two whole-project calculations that span
      gaps — the Meeting Sheet progress % (first start → last end) and the project-page "Lead
      time N workdays" — neither counts a gap as department work or load, but if the rule is
      "gaps never read as work", the progress bar is the one surface to relabel or compute
      from blocks. Double-booking checks already use the actual blocks. [brief §7 Rollup,
      §8.2, §14]
- [ ] **9. Employee source hardening.** (a) The Employee Contacts import fetches
      `items?expand=fields` with no `$select`, so Pay Type and PersonalEmail cross the wire
      into an admin's browser even though they are never stored or shown — add
      `expand=fields($select=…)` or import from a trimmed SharePoint view. (b) A blank
      Primary Phone silently falls back to Phone, then Mobile Phone (more likely personal) —
      drop the fallback or flag the row. (c) Decide which People-page fields non-admins see:
      today name, nickname, title, phone, email, departments, time off, schedule, driver,
      **employment Status and the ADMIN/DEV/FB permission badges** are visible to every
      signed-in user. (d) Confirm with HR whether Primary Phone is ever personal. [brief §7
      Employee source, §8.1, §13]
- [ ] **10. Automatic status vs closeout.** A project on Automatic marks itself Complete
      once its last install *or shipping* bar ends (v1.20.6). Under item 11, "work finished"
      and "closed out" are different states: keep the automatic flip as the trigger that
      starts closeout aging, never as the thing that hides a job from the closeout queue.
      [brief §7 Closeout Response, §8.4]

### P0 — the business control: closeout [brief §8.4–8.5, §9 "Business control"]

- [ ] **11. Closeout and billing states — the one new feature.** Keep project status,
      closeout status and billing status as three fields. ⚠ two Projects columns:
      `closeoutStatus` (`submitted` / `returned` / `ready` / `hold` / empty) and
      `billingStatus` (`invoiced` / `exception` / empty), plus `closeoutBy`/`closeoutAt`
      if the change log's who/when isn't enough. Flow: PM submits a one-minute checklist
      (no budget or line items) → Project Director verifies (Returned / Ready for balance
      invoice / Hold for revision) → Bookkeeper marks Invoice sent or Accounting exception.
      Surfaces: a **Needs closeout** queue (a filtered page under the existing router, or a
      Meeting Sheet section for the AMPM handout) with aging from the last scheduled work
      date; overdue items stay visible until resolved; reminders via the already-consented
      `Mail.Send` path the feedback form uses. Estimate reference (number, revision, sent /
      approved dates; a client revision creates a new revision; unbilled scope blocks Ready)
      is P1 and can ride the same columns family later [brief §8.6]. Open sub-decisions: the
      Bookkeeper's sign-in (remote, another state — a viewer with a `closeout` grant?), and
      whether the Project Director's verification is a role or a named person (§4 D3).

### P0 — outside the app: owners, not releases [brief §1, §6, §7.1, §9, §11]

These need an owner in SharePoint / Power Automate / the business, not an app version. The
app's part, where any, is listed.

- [ ] **12. Calendar drift rule.** Leadership declares **27 Events** the event record; each
      Outlook event gets an "Edit source" link; 27 Events stores Outlook IDs and sync state.
      Owners: Project Director + whoever owns the 27 Events → Outlook flows (unknown — §5).
      App: none until §4 D1/D11 decide whether Timeline's own `ShopTimeline_Events` merges
      into 27 Events. [brief §7.1, §9 P0 "Calendar drift", §15]
- [ ] **13. Cost-code workbook guardrail inventory.** Every formula, validation message,
      abbreviation and sequence rule, and an example of every warning; reconcile against
      QuickBooks and TCP exports. Owners: Project Director + Bookkeeper. App today: `jobCode`
      is free text with no format, duplicate or lifecycle check; the Clients list already
      carries the 2–3 letter alias (`field_2`, imported from the Excel client master) — the
      registry design must adopt or supersede it so there aren't two abbreviation masters.
      App later (Phase 8): pick confirmed codes from the registry instead of typing.
      [brief §6, §9 P0 "Before integrations"]
- [ ] **14. Core project registry decision** — §4 D1. Deliverable before deciding: a
      side-by-side schema comparison of Current 2-7 Projects / 27 Projects (Archive) vs
      `ShopTimeline_Projects`, including 27 Events' and Teams' dependencies on Current
      Projects. Robert can do this from read access alone. [brief §6.7, §14]
- [ ] **15. Backups.** No scheduled backup of the nine lists exists. Quick answer: a weekly
      SharePoint Export to Excel until something better; ask the tenant admin what retention
      already covers. Caveat for any export: several columns hold JSON strings (departments,
      time off, schedule, assignee arrays, ticketNodes), so a raw export is not readable by
      Accounting or HR without a flatten step — budget a small in-app CSV export or a script
      if the fallback must be human-readable. Confirm list versioning is on for all nine
      (recovery for deletes is the Recycle Bin, for edits version history). [brief §10.2,
      §12, §7.2]
- [ ] **16. Backup maintainer + rollback procedure.** Name the second maintainer (Hubert?)
      with access to the repository, Pages, the app registration and the recovery docs.
      Write the one-paragraph rollback (git revert on `main` → Actions redeploys) and start
      tagging releases (`v1.23.0` etc.) — there are no release tags today. [brief §5.1, §11]
- [ ] **17. Separate development data from production.** `/preview/` and `/sandbox/` write
      the live lists, so every pilot test edit is a real edit — the brief's technical-test
      stage would otherwise put test jobs in production data. Options: a test SharePoint site
      with the nine lists cloned (⚠ owner creates; the app resolves lists by site + name), or
      a list-name suffix switch on the preview build. Decide before the pilot's stage 3.
      [brief §10, §11.1]
- [ ] **18. Pilot projects preloaded.** Project Director + Robert load the pilot jobs so PMs
      verify instead of re-entering; set the parallel-entry end date up front; limit the
      pilot project count. [brief §10, §10.2]

### P1 — verification and small fixes [brief §9 P1]

- [ ] **19. Verify the PTO source and edge cases.** Availability today comes from
      Out-of-office ranges typed on the People page, whole days only, back-to-back ranges not
      merged for "Away until". The PTO Contract Approvals list (fed by the operations
      manager's Teams PowerApps plugin) is not connected; the discovery session planned for
      mid-September is not on record as held — schedule it, and the same session identifies
      the nightly 10pm automation on 27 Employees. Test: multiple, adjacent, overlapping
      requests; partial days; cancellations; people without company email. [brief §7.2, §13]
- [ ] **20. Document the change log's limits** (the brief's verification row): covers
      projects, phases, milestones, notes — not people, clients or settings; admins only;
      history starts 2026-09-02; **no retention limit and no export** — every cache miss reads
      the whole list (it pages), the pages show the latest 500 / 300 per project; recovery is
      in-session undo (projects only, 20 steps, lost on reload) or SharePoint (Recycle Bin for
      deletes, version history for edits) — the log is evidence, not a restore tool. Most of
      this is in the 2026-09-02 milestone record; retention and recovery are the missing
      paragraphs. [brief §7.2]
- [ ] **21. Refresh the reference docs before handing the repo to reviewers.**
      `docs/ARCHITECTURE.md` documents 5 lists (9 in use + Employee Contacts), omits the
      client/config/changelog/feedback mappers and the `#/people`, `#/clients`,
      `#/changelog`, `#/settings`, `#/reports` routes, and predates Logistics, Shipping and
      the `othoffice` retirement; `SETUP.md` lists 2 Graph scopes (4 in use: `User.Read`,
      `Sites.ReadWrite.All`, `TeamMember.Read.All`, `Mail.Send`); `CLAUDE.md` says ~7,000
      lines (10,600); `tests/README.md` says 48 suites (79). Add a short "formulas and
      rollup" section (`generateSchedule` backward from the install date skipping weekends
      and the coded holidays; `estimatedDays`; Meeting Sheet %; Lead time). [brief §13 "The
      app" row; §8 standing rule]
- [ ] **22. Meeting Sheet as the AMPM handout.** It already prints per PM with status,
      current phase, dates, install date and workdays left. Get the Master Project Tracker's
      AMPM columns from the Project Director and diff; add the closeout/aging column when
      item 11 lands. [brief §3 step 9, §9 P1 "AMPM output"]
- [ ] **23. Milestone records owed** (CLAUDE.md rule): v1.20.6 Shipping phase (a
      phase-chain and department-vocabulary change documented only as a footnote), v1.20.8
      (PM required at Create; dashboard columns scroll), v1.20.9; the v1.x ladder has no
      rows for v1.20.0–v1.20.9 and v1.21.x (add one folded row each to the archive's §4, the
      way `CHANGELOG.md` folds v1.14–1.15). Docs only.
- [ ] **24. Repository ownership.** `github.com/221twoseven` is a GitHub *user* account
      named for the company, not an Organization — no org owners, SSO or team roles;
      continuity rests on one login. If leadership's "company-owned code" gate matters, plan
      an Organization transfer (the Pages URL and the Entra redirect URIs must then be
      re-registered — `SETUP.md`). The repository is public (Pages hosting); safe because
      access depends on Microsoft sign-in, but leadership should know. [brief §11]

### Owner confirmations (one click each — ask, don't park)

- [ ] `ShopTimeline_Config` exists? The v1.x spec was delivered 2026-09-02 and never
      marked created; the brief counts "settings" among the nine lists, which suggests it
      does. Check Help ▸ App settings on `/preview/`: the source line reads "shared via the
      ShopTimeline_Config list" when it exists, "browser-local" when not. If not: Title
      (= setting key) + one single-line text column `value`. ⚠
- [ ] Was the People-page **Import from Employee Contacts** re-run after the `status`
      column landed (2026-09-02 late)? Idempotent — re-run it if unsure.
- [ ] Should the condensed brief live in the repository (`docs/Briefs/`)? The repo is
      public; it names internal processes and a mailbox. Owner's call.

## 4. Decisions the suite forces (open — record rulings here, dated)

Each has a recommendation. None is taken.

- **D1 — Core project registry.** Current 2-7 Projects extended into the registry (brief
  §6.7) vs `ShopTimeline_Projects` promoted to it. *Recommend:* run item 14's schema
  comparison first; whichever wins, the other becomes a read-only mirror for one parallel
  period, then is retired — never a permanent two-way sync between two editable masters.
  Moving off `ShopTimeline_Projects` touches the colleague app (D2). [brief §6.7, §14]
- **D2 — The colleague app and schema parity.** Projects, Tasks, Staff and Tasks2 are
  shared with a separately maintained colleague app; Events, Clients, Feedback, Changelog
  and Config are app-only and can be reshaped freely. Nothing records whether the colleague
  app still runs or who maintains it. The owner said on 2026-09-24 that parity may be
  dropped if it holds development back. *Recommend:* confirm its status; if retired, lift
  the additive-only rule in `CLAUDE.md` and unblock D10 (person IDs), the `metalFab` /
  `labels` / `checklist` write-only columns (§7 L1040) and D1. Until then, additive-only.
- **D3 — Permission model and enforcement.** Today: Admin / Viewer / Developer, with
  per-door viewer grants in Config; PMs are admins. The vision needs sets per audience (PM,
  Accounting, HR, Operations Director, Purchasing/SysAdmin, Viewer, later `terminal`). Hard
  constraint: **UI gating is workflow protection, not security** — every signed-in token
  carries `Sites.ReadWrite.All`, and anyone with site edit rights can read or change any
  list directly. *Recommend:* roles in the app for workflow; **SharePoint permissions on
  separate lists/libraries for anything sensitive** (pay, personal contacts, billing notes,
  licence keys). Saved views are browser-local (`localStorage`) and cannot be the audience
  mechanism; role-based views need shared storage (Config or a per-user record). Design
  the role vocabulary once, for all apps. [brief §2, §9, §11; vision]
- **D4 — Architecture for more than one app.** One 10,600-line `index.html`, no build step,
  no shared module; Pages deploys three branches to `/`, `/preview/`, `/sandbox/` with a
  guard that greps the file as markup. A portal plus three sibling apps sharing theme, auth
  and data code needs a decision: (a) one file, more routes (the Company Data pages already
  are proto-apps at `#/people`, `#/clients`); (b) separate single-file apps under one Pages
  site (`/timeline/`, `/clients/`, `/people/`, `/resources/`) sharing a vendored
  `common.css`/`common.js` — each subpath needs its own Entra redirect URI; (c) a build
  step. *Recommend:* (b) — keeps the no-build, one-file-per-app discipline that made this
  app maintainable, and the portal is then a static page. Consequence: Timeline moves off
  `/` (a URL change for users) or the portal lives at `/portal/`. Decide before the second
  app starts. [vision; brief §11.1]
- **D5 — Employee Directory identity.** Which list is "the Employee Directory": HR's
  Employee Contacts (manual, current, has Pay Type / PersonalEmail), 27 Employees (nightly
  automation, unidentified), or a new consolidated list? Join key today: work email, else
  exact name (a namesake without work email can join the wrong row). *Recommend:* Employee
  Contacts as identity master, read through a trimmed view or `$select` (item 9), until D3's
  separate-list rule lets Personnel Manager hold HR-only fields on their own list. Employee
  Contacts stays READ-ONLY for the app. [brief §4 open question, §8.1]
- **D6 — Design Resources Manager and secrets.** Licence keys and shared logins in a
  SharePoint list readable by the app are readable by every user with site access,
  whatever the UI hides (D3), and this repository is public. *Recommend:* the Manager
  stores *pointers and ownership* (what the tool is, who owns the licence, where the
  credential lives) and links to a proper vault (a password manager or a restricted
  document library with its own permissions); never the secret itself in a list the app
  reads. The plug-in/script store is a document library with a Manager page over it.
  [vision]
- **D7 — What v2.0.0 means.** §1 point 5 (Timeline on shared registries) vs the retired
  "app as master" vs "the pilot release". *Recommend:* §1 point 5.
- **D8 — Company Data pages' future.** Stay in Timeline as its People/Clients views, or
  graduate into Personnel Manager / Client Manager with Timeline keeping read-only pickers.
  *Recommend:* graduate in Phase 9; until then they are where the shared-registry work
  lands (Phase 8). The Client Manager's "project history (names, cost codes, job details,
  billings)" needs client IDs on projects (D10) and the closeout/billing states (item 11)
  before it can be built without name-joins.
- **D9 — Worker type vocabulary.** The app has a `1`/empty Freelance flag; the brief wants
  Regular / Seasonal / Freelance / Contractor; Employee Contacts already carries Category
  (Full/Part Time / Seasonal / Archived). *Recommend:* one vocabulary, taken from Employee
  Contacts if HR agrees, mapped onto the flag until Phase 8. Weekly schedule is one range
  per person (no split shifts, no per-day hours) — the first ceiling a TimeClock+ hours
  integration hits (§7 new entries). [brief §8.1]
- **D10 — Stable IDs.** Assignments store *names*, resolved through `canonName`; projects
  store the client as a *name*; Clients have no `appId` but do have a stable `spId`.
  *Recommend:* Phase 8 adds `clientId` on Projects (additive, one-time name → id backfill
  in the same milestone) and person IDs on assignments (touches shared Tasks — D2); the
  flexible-roles model (item 1) rides the same change. [brief §8]
- **D11 — Departments and closures as data.** Departments and the six holidays are fixed
  in code; the brief wants configurable departments and a Shop Closure list. *Recommend:*
  Phase 8, after D1 — the department vocabulary just changed (Logistics, Shipping,
  `othoffice` retired) and should settle first. Timeline's own `ShopTimeline_Events` vs
  27 Events is decided with item 12. [brief §8, §8.2]
- **D12 — Polling budget.** Every open tab re-reads every list every 90 s; the change log
  is deliberately never polled. Each sibling app and each new registry adds a full poll per
  user per tab. *Recommend:* before Phase 8 adds registries, set a budget (lists per tick,
  delta or `$filter` reads for large lists) — see `memory` note on the change-probe trap.
- **D13 — Integrations: ADP, TimeClock+, QuickBooks.** Brief: P3, after ownership, security
  and maintenance are settled; vision: "if possible". A browser SPA cannot hold API secrets,
  so any write integration needs a flow or a small service with its own owner. *Recommend:*
  CSV export/import first (QuickBooks and TCP formats to be confirmed — §5), APIs only via
  Power Automate with a named owner. [brief §1.2, §9 P3, §15]
- **D14 — Shop terminal / TV mode.** A fourth account type (`terminal`) with its own
  read-only dashboard; the company already runs non-person M365 accounts. Owner ruling
  2026-09-02: after rollout, once real use proves the need; brief: P2, and no TV redesign in
  the pilot. Stays parked.

## 5. Reference material to gather [brief §13]

Schemas, rules and examples — not screenshots. Status as of 2026-09-24.

| Material | Owner | Status |
|---|---|---|
| Employee Directory: exact list, field names, types, permissions, sanitized export | HR manager | not requested |
| Master Cost Code List: headers, formulas, validation messages, abbreviation + sequence rules, an example of every warning; QuickBooks and TCP exports to compare | Project Director, Bookkeeper | not requested (item 13) |
| Current Projects and 27 Events: schemas, lookups, status fields, Teams and shop-screen dependencies, Outlook ID storage, an Outlook-only edit and a deletion example | Project Director; flow owner (unknown) | not requested (item 14) |
| Power Automate: every trigger, action, calendar connection, recipient, error owner, retry policy | flow owner (unknown) | owner not identified |
| Master Project Tracker and closeout: columns, restricted fields, AMPM fields, closeout email examples, what the Bookkeeper minimally needs | Project Director, Bookkeeper | not requested (items 11, 22) |
| PTO, holidays, changelog: availability source, identity matching, cancellation examples, how holidays are set | operations manager (PTO, 27 Employees automation); Robert (changelog — item 20) | discovery session not held |
| QuickBooks / TimeClock+ CSV formats | Bookkeeper | not requested (D13) |
| Who administers which view (the key users) and which permission set each needs | owner, Hubert | in progress (D3) |
| Colleague app: is it running, who maintains it, which lists it reads/writes | owner | unknown (D2) |
| The app itself: lists, registration, scopes, deployment, data model, formulas | Robert | mostly in the repo; item 21 closes the gaps (backups and rollup formulas undocumented) |

## 6. Data / schema (⚠ shared Lists — spec to Robert, additive-only)

Standing: any column or list change is checked against the colleague app while D2 is
open; additive-only; Robert applies the delivered spec; the app probes new columns live
(tristate pattern — a missing column never 400s other saves).

Created and in use (v1.x): `ShopTimeline_Feedback`, `ShopTimeline_Changelog`,
`ShopTimeline_Clients`; on `ShopTimeline_Staff`: `admin` (`1` / `dev` / empty),
`feedbackRecipient`, `phone`, `personalNotes`, `listeningTo` / `listeningLink` /
`listeningVerb` / `listeningShow`, `status` (Employee Contacts' vocabulary), `nickname`,
`driver`, `availability`, `schedule` (JSON), `freelance`. Entra: `Mail.Send` delegated,
consented. Employee Contacts: READ-ONLY, never written, schema never touched.

To confirm: `ShopTimeline_Config` (Title + `value`) — see §3 owner confirmations.

Candidates this phase (spec delivered with the item's batch):

- `dateCertainty` on `ShopTimeline_Projects` — item 5.
- `closeoutStatus`, `billingStatus` (+ `closeoutBy`, `closeoutAt` if needed) on
  `ShopTimeline_Projects` — item 11.
- Tour seen flag on `ShopTimeline_Staff` — only if item 3 lands that way.
- A test site or suffixed list set for development data — item 17.

Phase 8 candidates (design first): `clientId` on Projects (D10); person IDs on
assignments (D10, D2); a client lifecycle column on `ShopTimeline_Clients` (the Staff side
reuses `status`, not a third vocabulary — v1.x ruling 2026-09-01); Departments and Shop
Closures lists (D11); Cost Codes registry (item 13).

Non-changes to note: item 1's renames are labels only; stored field names do not change.

## 7. Deferred & skipped ledger

The running record of moves deliberately skipped or deferred: **rationale** (why not now),
**gate** (what would change the answer), and — once one lands — the **later decision**,
updated in place, never deleted. Carried from v1.x on 2026-09-24 after each entry was
checked against the code; wording corrected where the audit found the ceiling misdescribed.
Line numbers in brackets are the entry's place in `docs/Archive/TODO-v1.x-Archive.md`.

### 7.0 Closed at retirement (audit 2026-09-24) — not carried

- Coach-mark copy revision "ON HOLD" / "TABLED INDEFINITELY" (v1.x §2, §3 item 5, ladder
  v1.2.x row) — **shipped v1.15.1**; `docs/Copy-Coach-and-Helpers.md` is the editing
  channel. Round two (Cost Code, Technical Designer, Lock dates) is item 1–2 above.
- "Black bar mellowed — owner eyes wanted; possible `.cal-mon` follow-up" (v1.x §3 item 2)
  — 27 releases and a live demo later with no re-raise; closed. `.cal-mon` unchanged.
- Calendar detail levels "development-only until promoted" (v1.x §3 item 10) — on `main`
  since PR #47.
- Admin rollout note "flag the admins on the People page" (v1.x item 12) — done in
  practice (PMs are admins); superseded by D3.
- "UI gating is workflow protection — decide if acceptable" (v1.x item 12) — recorded and
  accepted for v1.x; **re-opened as D3** for the suite, not carried as-is.
- Weekly schedule and Freelance flag "(development)" qualifiers (v1.x items 43–44) — on
  `main` via PR #48.
- Draft "Add a phase" ignores the optional name field [L973] — the field was removed in
  v1.2.1; nothing to drop.
- `scrubLegacyNames()` run on `/preview/` [L1110] — shipped v1.7.2; the re-run ceiling
  lives at its own entry (7.1, L1148).
- `canonName` doesn't cover to-do assignees [L1117] — the fix named in its own gate
  shipped in v1.18.1 (`test-v1181`).
- Drag-zoom 45° split vs ±15° bands [L1061; v1.x item 24] — owner accepted the split in
  practice across three `/preview/` rounds (2026-08-31 → 09-01); closed unless the owner
  says otherwise.

### 7.1 Carried — Phases 1–4 (REV51–89)

- [ ] Native `title` tooltips (incl. marker hover) — unstyled, invisible on touch. Gate:
      touch use materializes (T8; v1.4.0 marker hover shares it). [L945, L1059]
- [ ] Toast dock offset computed at fire time; a live toast can overlap the dock on
      drag-resize. Gate: someone notices (U7). [L947]
- [ ] Unicode 📌 outside the SVG icon set — **five sites**, not two: Pin-dates modal,
      phase-inspector Pin checkbox, the `.bar-pin` glyph on pinned Gantt bars, and the two
      drag-refusal hints. Swap when any is next touched (U6). [L949]
- [ ] Persistent error banner with explicit close, if the ~5 s toast proves too fleeting
      (T7). Mitigation already shipped: the sync pill's `err` state persists as a clickable
      "not saved — click to retry" until the retry succeeds. Brief §7 Reliability /
      §10.1 "failed saves show a clear error" is the gate to watch. [L951]
- [ ] Jump memory in the Go-to-date popover. Gate: PMs asking (REV76). [L955]
- [ ] Go-to popover can sit left of the pointer on very narrow windows. Cosmetic. [L956]
- [ ] Very short projects render pill-only at Week zoom — intended (Design-Language §7).
      Gate: real complaints about lost labels (REV75). [L958]
- [ ] Saved views don't capture sidebar width / gutter / scroll / linked-subtasks. Gate:
      someone misses one (REV79). **Input to D3:** decide the snapshot shape when
      role-based views are designed, not before. [L963]
- [ ] Saved views recall grouping, not per-person ordering — `sortIndex` is shared data;
      a private order needs a per-user record (spec to Robert when decided). [L965]
- [ ] White-bar-text rule covers bar palettes only; `kidShade()` subtask tints pick ink.
      Owner's call (REV80). [L969]
- [ ] Drag-to-pan is date-header-only. Gate: PMs asking to grab the canvas (needs a
      modifier-key design) (REV80). [L971]
- [ ] Department dropdown disabled on drafts — re-departmenting is a saved-page concept.
      Gate: real demand (REV82). [L975]
- [ ] Draft selection key for an unsplit bar falls back to the department's first bar after
      a mid-selection split — benign. Gate: re-parenting ever landing (REV82). [L977]
- [ ] Calendar live feedback: drag-to-MOVE keeps tooltip-only feedback. Gate: the same
      complaint about moves. **Reworded:** the cross-week follow landed in v1.9.0; what
      remains is that the px stretch is single-row and can briefly overshoot the nesting/pin
      clamp (tint and release snap always show the clamped truth). [L980]
- [ ] Collapsed calendar phase spans only the parent bar's window — an out-of-window
      subtask is invisible until expanded. Gate: a PM missing one (REV84). [L986]
- [ ] Calendar collapse state is independent of the Gantt's ▸ state (the selection half
      was superseded by v1.0.4's `NPV_CAL_OPEN`; sharing would now need a Set ↔ level map).
      Gate: someone expecting the two surfaces to share expansion. [L988]
- [ ] Positional parent model shows through the collapse — resize a phase past its subtask
      and the calendar band flips with the Gantt parent row (only when both bars carry
      labels). Gate: a PM confused by the swap (REV84). [L993]
- [ ] PM late-prompt once-a-day key is per-browser, not per-user — shared machines can
      swallow a second PM's ask. Fix: key on the account username (one line + a test87
      case). Gate: shared stations complain (REV87). Relevant to item 11's reminders. [L996]
- [ ] Project-page tour has no first-visit auto-run on a direct project landing (a
      first-visit user who finishes the home tour and clicks + New Project is chained in
      since v1.10.0). Gate: owner wanting auto-run for new hires (REV86). [L999]
- [ ] Home-tour seen flag is per-browser `localStorage`, not per-person. Owner ruling
      2026-09-02: leave it. **Gate fired?** brief §5.1 "the tour has looped" — handled as
      item 3. [L1001]
- [ ] The ⋯ hover cue covers main-timeline bars only — one CSS rule for `.npv-bar` when
      item 7 lands. [L1011]
- [ ] Stashed sample project re-attaches only after a successful load — offline boots
      show the sign-in card. Gate: someone demos offline (REV89) — closer now: brief §2
      says shop internet is inconsistent. An offline mode proper is a separate scoping
      decision. [L1013]
- [ ] Poll's local-todos guard could drop session-local to-dos if `ShopTimeline_Tasks2`
      were missing AND the sample carried to-dos — accepted risk, Tasks2 exists. [L1015]
- [ ] Optional 60-second explainer video/page — never scoped. Gate: an owner brief. [L1018]

### 7.2 Carried — v1 close-out (REV90–101)

- [ ] Calendar marker drag/click/delete block is a near-clone of the Gantt's. **Gate
      reworded:** the next touch of either handler merges them (the v1.x "fires with item
      8" wording was stale — v1.1.0 didn't touch the block, and the v1.8.0/v1.11.0 permission
      guards touched both without merging). [L1026]
- [ ] `metalFab` and `todoToFields`' `labels` / `checklist` are dead schema kept alive for
      cross-app compatibility (`metalFab` still round-trips and is searchable). Dropping
      them waits on D2. [L1040]
- [ ] Edit-in-place popover carries data fields + Delete only; Duplicate and Pin stay
      inspector-only. Gate: shop use asking — **fired by brief §1/§7** (make Duplicate
      visible); handled as item 7. [L1044]
- [ ] A background poll landing while the popover/add-menu is open defers until it closes
      (the CD_EDIT deferral, L1143, shares the gate). Gate: a real "why didn't I see their
      edit" report. [L1046]

### 7.3 Carried — the v1.x track (v1.0.2 → v1.23.0)

- [ ] Dept-lens phase click lands on the project page without preselecting the clicked
      phase — needs a cross-route handoff. Gate: PMs asking "why do I have to find the
      phase again" (v1.3.0). [L1050]
- [ ] Dept-lens lane assignment lines clip to row height with "+N more" (My Dashboard's
      "+N more" was removed in v1.20.8; the lanes are unchanged). Gate: real complaints
      (v1.3.0). [L1053]
- [ ] Old milestone notes/types and note who/phase data survive in storage with no editor
      (notes visible in tooltips, who not at all). Fix: a read-only popover line. Gate:
      someone needing to read or clear old values (v1.4.0). [L1055]
- [ ] Global page has no Fit step (the project-page strip gesture half shipped v1.6.2).
      Gate: someone reaching for it (v1.5.0). [L1064]
- [ ] A drag-set custom FIT survives reloads but has no UI to re-enter it exactly.
      Cosmetic (v1.5.0). [L1069]
- [ ] Fonts: Brauer Neue title file shipped v1.7.1 (five weights left uncommitted by
      design); a committed Bahnschrift TTF for non-Windows waits on coverage demand and a
      redistribution-licence check — Macs/phones fall through to system faces meanwhile.
      Owner's call. [L1071; v1.x item 7]
- [ ] Vivid shows no **weekend** marker on the canvas (holidays got name pills in v1.20.0
      — the v1.x "(holidays included)" clause is stale). Gate: someone scheduling into a
      weekend Vivid hid (v1.0.2). [L1088]
- [ ] Calendar milestone prefix is the department name, not a phase's custom label. Gate:
      someone renaming a phase and expecting the name (v1.6.1). [L1092]
- [ ] Dept-lane summaries keep upcoming assignments; a strict "in progress only" read is a
      one-line filter. Owner's call (v1.6.1). [L1095]
- [ ] Sidebar/canvas scroll parity pads by footer height, not the Gantt's ~10 px horizontal
      scrollbar. Cosmetic (v1.6.1). [L1098]
- [ ] Project-Gantt today column and deadline pennant out-stack the sticky row gutters at
      extreme scroll; axis masked (v1.6.3), full fix restructures gutter stacking. Gate:
      someone notices on a real job. [L1101]
- [ ] The Summary/Dashboard locks its lens — regrouping the same person means exiting and
      re-entering (same trade as v1.2.0). Gate: someone asking (v1.6.4). [L1106]
- [ ] Two roster people sharing a first name + surname initial keep legacy strings unmerged
      — never guess identity. Fix is a manual data correction or the People-page Merge, not
      code (v1.6.5). [L1121]
- [ ] "Show everything" clears the person while toolbar Clear filters keeps it —
      deliberate asymmetry. Owner's call to align (v1.6.6). [L1124]
- [ ] The status section lost its "Clear all" — isolating one status means unchecking the
      rest by hand. Fix: a per-status "only" affordance. Gate: someone missing it (v1.6.6).
      [L1129]
- [ ] Company Data pages have no per-record URLs (`#/people/:id` lands without selecting).
      Gate: someone wanting a linkable record. The client half can key on `spId` today — no
      column needed (v1.7.0). [L1133]
- [ ] Remove on People/Clients is a real delete behind a consequence-naming confirm — no
      archive/deactivate lifecycle. **Gate reworded:** the Staff `status` column exists since
      2026-09-02 (Active / Off Payroll / Terminated / Archived, synced by the import) but
      drives no behaviour yet; Clients has no equivalent. The lifecycle pass (hide from
      pickers, deactivation guards, archive-not-delete per brief §10.2) is Phase 8 design
      work (v1.7.0, v1.13.0). [L1136, L1226]
- [ ] Client selection is keyed by name — a concurrent remote rename drops the selection
      until the next click. **Corrected:** clients already carry a stable `spId`; keying
      `CD_SEL` on it closes this without a schema change (v1.7.0). [L1140]
- [ ] A background poll defers entirely while a Company Data record is mid-edit
      (CD_EDIT) — shares L1046's gate (v1.7.0). [L1143]
- [ ] Reaching the year-wide view is drag-only — the step buttons stop at 3-Mo. Gate:
      someone asking for a Year button (small: one more `FIT_STEPS` entry + a button)
      (v1.7.2). [L1146; v1.x item 28]
- [ ] `scrubLegacyNames` heals only what the current roster resolves — roster *additions*
      need an owner console re-run on `/preview/` (merges no longer do, since the v1.15.0
      merge-time rewrite). Gate: each staffing-reconciliation pass; closes for good with
      D10 (v1.7.2). [L1148; v1.x item 29]
- [ ] "Name presentation on project-edit / subtask-edit pages" — owner-parked, never
      specified; likely covered by the v1.15.0/v1.19.2 `dispName` sweep. Needs an owner
      yes/no, not code. [v1.x item 29]
- [ ] "Listening to" stays behind the `exp.listening` dev switch — promote or drop is the
      owner's call; shared toggling needs `ShopTimeline_Config` to exist (v1.12.0). [v1.x
      item 30]
- [ ] Staff flag columns are text `1`/empty (`admin`, `feedbackRecipient`, `driver`,
      `freelance`, `listeningShow`); a Yes/No column would need the writer switched.
      **Corrected:** the `viewer.*` grants are rows on `ShopTimeline_Config`, not Staff
      columns (v1.8.0/v1.11.0). Gate: a save 400ing. [L1151]
- [ ] A fully read-only viewer can't seed the sample project (any `viewer.*` grant can,
      since v1.11.0); only reachable on a zero-project site (v1.8.0). [L1154]
- [ ] Viewer checkbox surfaces hide unchecked entries via CSS `:has()` — very old browsers
      would show disabled boxes. Cosmetic (v1.8.0). [L1157]
- [ ] The PM late prompt skips viewers (they couldn't act on it). Gate: owner wanting a
      read-only nudge (v1.8.0). Revisit with item 11. [L1160]
- [ ] Feedback mail rides the silent token — a missing `Mail.Send` consent skips the mail
      without a popup (report still filed, toast says so). Gate: recipients report gaps
      (v1.8.0). [L1163]
- [ ] Calendar resize-follow can't extend past the last painted week (no cells below to
      hover); long extensions belong to the Gantt or the inspector. Gate: someone reaching
      for it (v1.9.0). [L1166; v1.x item 32]
- [ ] Cross-week resize feedback is day-granular (repaint per day crossed). Cosmetic
      (v1.9.0). [L1171]
- [ ] Demoting a developer's admin checkbox drops the `dev` value; re-checking writes `1`;
      the owner re-types `dev` on the list. Gate: often enough to annoy; the People editor
      assigning `dev` needs an owner ruling (v1.9.0). [L1175; v1.x item 32]
- [ ] The view-as preview keeps your **own** dashboard (owner ruling 2026-09-18 — User
      Notes stays editable); no preview shows your page as others see it. Side finding: the
      picker toasts still say "your Summary reads as others see it" — fix on next touch.
      [L1178]
- [ ] `saveState` opens wholesale for a viewer once ANY `viewer.*` grant is on; the UI
      doors carry the per-kind granularity. Gate: a partially-granted viewer reaching an
      ungranted door; fix is kind-tagged diffs (v1.11.0). Folds into D3. [L1193]
- [ ] Right-click create menu opens on the PHASES grant only. Gate: the first narrow grant
      flipped on for real users (v1.11.0). [L1199]
- [ ] Config is read at sign-in, never re-polled (polling-cost rule) — a flipped grant
      reaches users on next reload. Gate: the lag biting someone (v1.11.0). [L1203]
- [ ] Developer pages reachable by direct hash while previewing as Non-admin: `#/settings`
      (menu entry hidden since v1.18.0, page not) and **`#/reports`** (full reporter
      name/email — personal data). Whether the remainder is deliberate is unrecorded;
      one `isDeveloper()` check at the route closes both. [L1206 + new]
- [ ] The thought-cloud popover commits on close; a render from another save path mid-edit
      can close it uncommitted (the 90 s poll already skips while a dock field has focus).
      Rare. Gate: someone loses an entry; fix is commit-per-field (v1.12.0). [L1210]
- [ ] Employee Contacts import maps departments by exact name/group + a small alias table;
      unrecognized strings are reported and left unset. Gate: real HR strings that should
      map — one alias line each (v1.13.0). [L1218]
- [ ] Import matching is email-first, exact-name fallback — a mismatch ADDS a duplicate
      rather than merging (never guess identity); remedy is the People-page Merge then
      re-run (v1.13.0). Feeds D5. [L1222]
- [ ] Any JS-built `src="`/`href="` string literal in `index.html` trips the Pages deploy's
      referenced-assets guard — build such attributes as DOM properties (v1.13.1). Gate:
      next time it bites, teach the guard to skip concatenations. [L1229]
- [ ] Chained tour's combined step count assumes the second half lands on a draft.
      Cosmetic (v1.14.0). See item 3. [L1233]
- [ ] People-dept consolidation is presentation + people-data canon only; phase
      departments, dept lens and task rows keep machine ids; a legacy id heals on the
      person's next save. Gate: legacy ids bothering a filter (v1.14.0). [L1242]
- [ ] The people index drops the Departments column to fit at a glance (the fit is
      seven-to-eight columns now, so the rationale is weaker). Gate: someone missing it
      (v1.14.0). [L1247]
- [ ] Merge duplicate can't be un-merged automatically; parks live in memory only, so a
      reload mid-park drops the scrub. Gate: a real mis-merge (v1.15.0). [L1260]
- [ ] Merge matches stored strings by exact name — abbreviations `canonName` can't resolve
      stay behind; run `scrubLegacyNames(true)` after merging. Root fix is D10 (v1.15.0).
      [L1263]
- [ ] A parked staff save (`PENDING_STAFF`) retries only via the pill click. Gate: the
      manual retry proving annoying (v1.15.2). [L1266]
- [ ] Child-first deletes close the orphan window for THIS app's writes only; the shared
      lists have other writers, so an orphan can still arrive and surfaces as an odd
      dept-lens lane. Gate: a second real orphan; fix is a load-time admin warning
      (v1.18.3). [L1270]
- [ ] `spSyncClients` keeps the stop-at-first-failure shape (clients have no tristate
      columns). Gate: a real stranded-clients report (v1.15.2). [L1278]
- [ ] The change log logs the project save path only — staff, client and config edits are
      not logged. Gate: the owner asking who changed the roster (v1.19.0). Documented in
      item 20. [L1282]
- [ ] Change log reads: on-demand with a 60 s cache, **reworded** — the fetch already pages
      (`gpageAll`); the real ceiling is that every cache miss reads the *entire* list (cost
      grows with it) and the surfaces truncate at 500 / 300 with no server-side filter. Fix:
      `$filter` on `projectId` / `at`, or a date window. Gate: the list's size making opens
      slow (v1.19.0). Feeds D12. [L1287]
- [ ] A save that lands but whose changelog POST fails loses those rows silently (console
      only) — history must never block a save. Gate: real gaps mattering (v1.19.0). [L1292]
- [ ] The change log dock has no drag-resize handle; collapse is per-visit. Gate: someone
      dragging for it (v1.19.0). [L1296]
- [ ] `othoffice` (Other · Technical Design) is RETIRED, not deleted — hidden from pickers,
      still renders on legacy rows. Close by reassigning any surviving row, then deleting
      the `DEPTS` entry (v1.20.1). [L1309]
- [ ] People/Clients/Settings edits stay outside undo/redo (own Save-with-confirm paths);
      project undo is in-memory, 20 steps, lost on reload. Gate: someone reaching for ⌘Z on
      the People page (v1.20.0). Documented in item 20. [L1315]
- [ ] Holiday name pills are absent from the month-calendar view (greys, no name); ~3
      lines in the day loop. Gate: someone missing it (v1.20.0). [L1318]
- [ ] Draft redo snapshots the whole draft-mutable state; a toast-button Undo doesn't feed
      the redo stack (⌘Z does). Gate: someone noticing (v1.20.0). [L1321]
- [ ] Right-clicking the Milestones/Notes gutter rows gives the date-scoped menu, never a
      department menu (v1.20.0 — unledgered until now). Gate: someone expecting one. [new]

### 7.4 New entries from the 2026-09-24 audit

- [ ] Weekly schedule is one range per person — no split shifts, no per-day hours; upgrade
      path is a per-day `hours` map (v1.22.0 record). First ceiling a TimeClock+ hours
      integration hits (D9, D13).
- [ ] Meeting Sheet progress % and the project-page "Lead time" span first start → last
      end, gaps included. Neither counts a gap as work; relabel or compute from blocks if
      the brief's "gaps never read as work" rule is applied literally (item 8).
- [ ] Employee Contacts import transports every column (no `$select`); phone fallback
      chain Primary → Phone → Mobile — item 9.
- [ ] Export to Excel of the lists yields JSON-string columns (departments, time off,
      schedule, assignee arrays, ticketNodes) and `appId` cross-references — not a readable
      fallback dataset without a flatten step (item 15).
- [ ] Graceful degradation: a missing or unreachable `ShopTimeline_Staff`/`Tasks2` keeps
      edits browser-local and resumes persistence silently later — fine for an optional
      roster, a data-integrity risk once Staff is the personnel master (Phase 9 design).
- [ ] Polling: every open tab re-reads every list every 90 s — D12.
- [ ] Saved views are browser-local — D3.
- [ ] No release tags, no written rollback procedure, repo under a user account — items
      16, 24.
- [ ] Shop-terminal account type — D14. [v1.x §2]
- [ ] Docs drift (ARCHITECTURE 5 vs 9 lists; SETUP 2 vs 4 scopes; CLAUDE.md line count;
      tests/README suite count) — item 21.

### 7.5 Deliberate design ceilings — no action planned, revisit only on real complaints

12-slot palette repeats at 13+ visible projects (T2) · quiet re-selection after a committed
project-page resize/move (T4) · sidebar names >~26 chars truncate at default width, the
180–480 px drag is the escape hatch (T5) · off-screen edge chips don't dim with the search
filter (T6) · bottom-dock column minimum widths are fixed (U2/E1) · In-Design and
In-Fabrication bars both full-strength on purpose, the pill word separates them (U8) · the
default view parks today left-of-center on first load and every routed arrival, only the
Today button and `T` center it (B3b/REV101) · calendar level-0 strips are ~9 px hit targets
under the 24 px line, one click expands (v1.21.0) · calendar detail levels and marker-text
state reset per project visit, persist per browser like `NPV_OPEN` only if asked (v1.21.0).

## 8. Documentation upkeep

- **Standing rule:** keep `docs/ARCHITECTURE.md`, `docs/SETUP.md` and `CLAUDE.md` in sync
  as the app evolves (item 21 is the catch-up); every milestone gets a record in
  `docs/Milestones/Phase-7-Pilot-Readiness/`; every `APP_VER` bump gets a `CHANGELOG.md`
  line.
- **Standing rule:** `reference/Handoff-Notes.md` and `reference/Project-History.md` are
  history — re-verify their world-state claims before quoting them.
- **Standing rule:** the retired backlogs (`docs/Archive/TODO-v1-Archive.md`,
  `TODO-v1.x-Archive.md`) are frozen; a ledger entry's later decision is recorded here, in
  §7, with the archive line number.
- 2026-09-24: v1.x backlog retired and audited; this file created; Milestones Phase 6
  closed at v1.23.0, Phase 7 opened
  (`docs/Milestones/Phase-7-Pilot-Readiness/2026-09-24-backlog-retired-phase-7-kickoff.md`).
  Same day, earlier: Milestones regrouped into numbered phase folders; Handoff-Notes and
  Project-History moved to `reference/`; the Master Data brief and Onboarding-Fork to
  `docs/Archive/`.

---

### Legend

- ⚠ Touches shared SharePoint schema or Entra/auth config. Not a gate: deliver Robert the
  exact spec and he applies the list edit; additive-only while D2 is open; Entra changes
  need explicit instruction (`CLAUDE.md`).
- **[brief §N]** — the Project Director's September 2026 brief, condensed and annotated by
  Robert (2026-09-22); section numbers match the original 21-page document.
- **[vision]** — the owner's 2026-09-24 statement of the portal/suite direction.
- **[LNNNN]** — line in `docs/Archive/TODO-v1.x-Archive.md` where a carried ledger entry
  came from; **v1.x item N** — its §3 item number there.
- **D1–D14** — §4 decisions; **item N** — §3 work items in this file.
