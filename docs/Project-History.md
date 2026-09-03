# Project Scheduler — Development Provenance Record

**Prepared:** 2026-09-03 · **Build at time of writing:** v1.19.0 (`APP_VER` in
`index.html` is always current) · **Status:** internal project documentation

This document reconstructs how the Project Scheduler (Shop Timeline) came to exist
in its current form: what preceded it, what was inherited, what changed, what
informed those changes, and which work belongs to which stage. It is written from
the repository's contemporaneous evidence — commit history, the frozen reference
build, milestone records, planning documents, and the backlog's decision ledger —
rather than from memory. Where the record is silent or ambiguous, that is stated
rather than filled in. Compact evidence pointers appear in [brackets]; the appendix
explains how to follow them.

The question this document answers is not *"who had the idea?"* It is: **how did
this system actually come to exist in its current form, and what work transformed
each stage into the next?**

---

## 1. The lineage in one paragraph

TwoSeven's project-scheduling and capacity-forecasting need long predates this
application, and the shop answered it for years with independently maintained
spreadsheets, calendars, and SharePoint lists. The application itself began as an
**experimental prototype written by a TwoSeven colleague** — the original
developer — who established the concept, the core scheduling model, the
single-file architecture, the SharePoint/Microsoft-Graph persistence design, and
the app's initial look and interaction language across an alpha numbered REV1–50.
In August 2026 that prototype was handed off, and the current development effort
began: placing it under version control, building a regression-test and deployment
infrastructure around it, redesigning its UX in documented phases, expanding it
into identity, permissions, and company-data management, and steering it toward
becoming a shared source of truth for the operational records the company already
kept. The prototype made the idea real; the current effort has been making it a
product an organization can adopt, trust, and maintain.

---

## 2. Stage 0 — The organizational need (predates everything here)

The problem — knowing what the shop is building, who is on it, when it installs,
and what capacity remains — was recognized at TwoSeven before any code existed.
The evidence for this is structural: when the current effort inventoried the
company's operational records in August 2026, it found **roughly fourteen
independently maintained stores** already answering pieces of that question —
project lists, event lists, archives, an installations workbook, an install log, a
master calendar, staffing and PTO records, a material-deliveries list
[TODO §3 item 13]. Several overlap without referencing one another. No one built
those fourteen stores for fun; they are fourteen answers to the same standing
need.

**Credit: the organization.** Neither the prototype author nor the current
developer originated the problem, and this document claims otherwise for no one.

## 3. Stage 1 — The prototype (REV1–50, before 2026-08-10)

The original application was written by the original developer as an experimental
build, iterated through fifty numbered revisions, and handed off as a working
single file. The repository preserves this stage in three first-class artifacts:

- **`reference/Timeline_50.html`** — the untouched REV50 build, kept immutable as
  a diff baseline and as the control build for the test suite (`npm run
  test:ref`). The production `index.html` began as a **byte-for-byte copy** of
  this file [reference/README.md; CLAUDE.md].
- **`docs/Handoff-Notes.md`** — the original developer's plain-English handoff
  (converted from the original PDF) merged with detailed developer notes,
  including a REV34–50 version-history table in the author's own framing.
- The handoff's design rationale, preserved verbatim in spirit: one HTML file, no
  server, GitHub Pages hosting, SharePoint lists as the database, delegated
  Entra/MSAL sign-in with deliberately minimal permissions [Handoff §§1–4].

What the prototype established — inherited by everything after it:

- **The concept and core mental model.** A Gantt-style shop timeline with
  *backward scheduling from the install date* — later called "the app's core
  insight" by the current effort's own UX audit, which listed it first among
  things to protect, not change [UX-Audit §3].
- **The architecture.** Single-file vanilla-JS SPA; SharePoint lists as the
  database via Microsoft Graph; MSAL/Entra delegated auth (single-tenant, PKCE,
  no secrets); GitHub Pages hosting; distribution as a pinned Teams tab. All of
  these are original-developer decisions the current effort kept.
- **The data model and its conventions.** The `ShopTimeline_*` lists, the
  `appId` linking convention, JSON-in-text-columns, no-spaces column names
  [Handoff §5].
- **The initial UI and interaction language.** The timeline/calendar surfaces,
  right-click as the primary creation verb, visible Undo on every mutation,
  default dates on created items, the yellow-diamond event markers [Handoff §11].
- **Substantial iteration of its own** — REV34–50 alone record the project page,
  hash routing, the split create page, subtasks with linked movement, the
  selection-driven inspector, the keyboard layer, sort groupings, five statuses,
  and a calendar mode rendered "in the in-house format" [Handoff §12].
- **A feedback loop of its own.** REV50 is described in the handoff as "REV49's
  field reports, all reproduced and fixed" — colleagues were already using and
  reporting on the alpha before the current effort began.

On what the prototype was built against: per the developer's account
(2026-09-03), what preceded it was the **absence** of any shared project
calendar, Gantt view, or single source of truth — only the disparate documents
inventoried in §4 — and the prototype was conceived against that gap rather than
derived from any one existing record. The repository's Stage-0 evidence (fourteen
overlapping stores that never reference one another) is consistent with this
account.

**Credit: the original developer** — for the concept, the prototype, the core
architecture, the inherited design language, and the alpha-era iteration. Nothing
in the current effort's record disputes any of this; the repository is built
around preserving it (an immutable reference build is an unusual honor to pay a
predecessor's work, and it is also simply useful).

## 4. Stage 2 — Existing operational systems (independent of the app)

Separate from the prototype, TwoSeven employees built and maintain operational
records that the application now interacts with. The repository's inventory
[TODO §3 item 13] lists, among others:

Excel on SharePoint: **Installations**, **Install Log**, **TwoSeven Master
Calendar**. SharePoint lists: **Current 2-7 Projects**, **27 Events** (+ both
archives), **PTO Contract Approvals** (fed by a Teams PowerApps flow built by the
operations manager), **Material Deliveries**, **27 Employees** (carries an
unidentified nightly automation), **Employee Contacts** (the HR manager's
manually maintained, current staffing record — "the richest employee record").

These systems are treated throughout the repository's planning record as
**operational precedents, data sources, compatibility targets, and adoption
requirements** — the existing state a replacement system must respect so that
employees can transition without disruption. The concrete accommodations the
record shows:

- The alpha itself rendered its calendar "in the in-house format" (REV41) — the
  original developer accommodating an existing company convention [Handoff §12].
- The client list was imported from the company's existing **Excel client
  master** (REV69), with an explicit divergence rule: the list-side copy runs in
  parallel until the app's copy earns mastership [CLAUDE.md; TODO item 13].
- The staffing consolidation runs the same doctrine: `ShopTimeline_Staff` stays
  the app's operational roster, **work email is the join key** across staffing
  stores, Employee Contacts is the likely identity/lifecycle master, its
  HR-sensitive fields are never read, and the app's future lifecycle vocabulary
  is required to match Employee Contacts' exactly so a future sync is 1:1 —
  "don't invent a third vocabulary" [TODO item 13, ruling 2026-09-01].
- Stores with automations or owners that are not yet fully understood (**PTO
  Contract Approvals**, **27 Employees**) are explicitly frozen: nothing moves
  before a discovery session with the operations manager [TODO item 13 ⚠ notes].

On chronology, the record is specific about when these systems enter this
project's history: they appear in the repository as an **inventory of existing
state to be consolidated**, first documented 2026-08-31 → 09-01 when the
source-of-truth objective was scoped. The repository contains no evidence of the
employee-maintained workbooks serving as design inputs to the production
application's features; where they shape the work, it is as **data to migrate,
conventions to stay compatible with, and workflows to transition gently** — which
is itself a form of influence this document records without embarrassment.
Whether and how any existing workbook informed the *pre-repository prototype* is
outside what this repository can evidence either way; that stage's inputs are the
original developer's to describe. (The one in-repo data point — the REV41
"in-house format" calendar — shows the alpha deliberately meeting an existing
company convention, which is consistent with these systems' role here:
precedents to accommodate.)

**Credit: the employees who built and maintain these systems** — as authors of
valuable operational records and of the conventions the application must honor,
and in the HR and operations managers' cases as owners of upstream systems the
application reads or defers to.

## 5. Stage 3 — Productization (2026-08-10 → present)

This is the current development effort. The repository evidences it directly:
**250 commits, 32+ pull requests, 62 milestone records, 74 regression suites, and
a versioned release train from REV51 through v1.19.0** in roughly three and a half
weeks, all under the `221twoseven` account with implementation substantially
executed through AI coding assistance working under the developer's direction,
specification, review, and testing — a method the repository documents openly
(`CLAUDE.md` addresses "anyone (human or AI) making changes").

What the evidence shows this stage actually contributed, category by category:

### 5.1 Development infrastructure (new in this stage)

- **Version control and migration.** Repository created 2026-08-10; the app moved
  off the original developer's personal-account hosting to the company account
  ("the org transfer is done") [Handoff §10, closing note; first commits].
- **The reference-build discipline.** REV50 frozen as an immutable diff baseline
  and test control — the mechanism that makes "was this inherited or changed?"
  answerable at all [reference/README.md].
- **Regression testing.** A jsdom harness that boots the real single file with
  MSAL and `fetch` stubbed and records every outgoing Graph call, so persistence
  is asserted on actual request bodies. Grown from 6 suites / 276 assertions to
  **74 suites** run against both the app and the frozen reference
  [tests/README.md; Handoff §11].
- **CI and deployment.** GitHub Actions runs the full suite on every push; a
  Pages workflow deploys three branches to three subpaths (`main` → production,
  `development` → `/preview/`, `sandbox` → a collaborator copy for the original
  developer) with a referenced-assets guard; `main` is ruleset-protected, and
  rollback is a git revert of a single file [.github/workflows; CONTRIBUTING.md].
- **Documentation as a system.** Architecture reference, setup/auth runbook,
  contributor guide written for non-programmers, a design-language document, a
  living backlog with a versioning ladder and a **deferred-decisions ledger**
  (every skipped or deferred move recorded with rationale and the condition that
  would reopen it), and one milestone record per shipped batch — 62 records,
  organized by era [docs/; docs/TODO.md §7; docs/Milestones/README.md].

### 5.2 UX and product development (documented redesign of the inherited UI)

A written **UX audit of the inherited build** (2026-08-12, REV52) assessed what
was strong (backward scheduling, visible undo, the meeting sheet, graceful
degradation — "protect these") and where the product fell short of organizational
use: it didn't teach itself, the timeline didn't scale visually, and color did
too many jobs [UX-Audit §§1–4]. A companion **Design Language** document was
written so visual decisions were made once, on paper. Four planned phases plus
review-driven interludes then executed against it (REV51–101): plain-language
error states, edge indicators, stable project colors, the visual system pass,
calendar/create parity and the subtask model, zoom/jump/density/saved views
("navigation at scale"), learnability (tour, sample project, shortcut sheet), and
a native menu-bar toolbar. Where the redesign contradicted inherited behavior,
the doc or the code was changed deliberately, never silently [CLAUDE.md rule;
Design-Language.md].

### 5.3 Functional expansion (capabilities the prototype did not have)

The identity track (person filter, signed-in identity chain, My Dashboard);
admin/viewer/developer **permissions** with granular viewer grants; the
**feedback form** posting to a SharePoint list with screenshot upload; **Graph
sendMail** feedback routing; **Company Data pages** (People and Clients as
read-first master/detail pages replacing batch modals); the **Employee Contacts
import** (read-only HR mirror with tolerant column resolution); nicknames,
availability tri-state, merge-duplicate tooling; the project **change log**;
chained onboarding tours and the demo preamble; viewport-fitting zoom with a
drag-zoom gesture. Each carries a milestone record and, for behavior-bearing
changes, a test suite [docs/Milestones/V1-Releases/; tests/].

### 5.4 Data architecture and the source-of-truth direction

The prototype assumed manual entry of clients, staff, and projects. The current
architecture points somewhere else, and says so in writing: the app becomes **the
company's shared source of truth**, absorbing or retiring the parallel stores —
"v2.0.0 ships when the app is the declared master and the manual stores are
frozen or retired" [TODO §4 ladder; item 13]. The method on record is
deliberately conservative: strategy document before code; per-store audit (what
it holds, who writes it, what reads it); the proven **parallel-run** pattern
(nothing is retired until the app's copy has earned mastership in live use);
additive-only schema changes checked against the colleague application that
shares the lists; read-only integration for HR data; and hard stops where a
store's automation or owner is not yet understood. Progress so far: clients
imported and parallel-running since REV69; staffing joined read-only via the
Employee Contacts import (v1.13.0); everything else inventoried and awaiting the
strategy pass — honestly, **the consolidation is direction and doctrine plus two
integrations, not an accomplished fact** [TODO item 13].

### 5.5 Release management and organizational rollout

Semantic versioning from v1.0.1 (2026-08-28) with a documented ladder mapping
every version to its contents; deliberate promotion from `/preview/` to
production; a live-demo program (developer-only preamble slides, chained tours,
owner-revised copy through dedicated copy documents); and rollout sequencing
(permissions flagged before the build reached general users) [TODO §4;
V1-Releases records].

**Credit: the current developer (Robert), as product owner and design
director** — for the productization listed above, directing AI assistants as the
implementation team under his specification, review, and live verification, and
with the substantial qualification that **what** to build was frequently set or
corrected by others, as the next section documents.

## 6. User testing, feedback, and participatory development

The production application was not developed by one person's unilateral
judgment, and the record shows the actual mechanisms — including, honestly,
which planned mechanisms did *not* run.

### 6.1 What the record shows ran

- **Alpha-era field reports.** Colleagues used the prototype and reported;
  REV50 is the original developer's round of "field reports, all reproduced and
  fixed" [Handoff §12]. The participatory pattern predates the current effort.
- **A structured testing protocol was designed** — three testers matching the
  app's audiences (a PM, a fabricator, a manager), five scripted tasks, an
  assist-counting scoring sheet, verbatim-confusion capture, and explicit
  decision gates ("if testers still fight navigation → build zoom and density;
  if not → build saved views") [UX-Audit §6; Archive/Hallway-Test-Round-2.md].
- **Owner-administered review rounds on `/preview/`** are the most heavily
  documented feedback engine in the repository: the REV79 review produced the
  punch list that became all of Phase 3.5; a ten-item punch list shipped as
  v1.6.1 the same day; second and third rounds (v1.6.2, v1.6.4) re-tested the
  fixes and reported what was now good ("markers ✓, step zoom ✓, drag-zoom still
  juddery") [TODO Last-reviewed notes; V1-Releases records].
- **Live-data and live-use bug reports with same-day root-cause fixes**, e.g.:
  legacy person IDs not matching authenticated identities (→ v1.6.5
  `canonName`); "my merges reverted minutes later" (→ v1.15.2 staff-sync
  resilience); the import reporting "roster already mirrors" while doing nothing
  (→ v1.14.0 internal-column-name resolution); a phantom "TBD" lane from an
  orphaned row (→ v1.18.3 child-first deletes).
- **A standing feedback channel was built into the product** — the in-app bug
  report / feature request form posting to `ShopTimeline_Feedback` with
  screenshot upload and recipient routing (v1.6.0/v1.8.0) — so shop-wide
  feedback outlives the development period.

### 6.2 How testing actually ran — attested account plus its residue in the record

A scripted usability protocol was designed but never executed as written: the
**hallway-test round 2 was skipped, not deferred** (owner decision 2026-08-25:
management's product-viability deadline outranked formal UX validation; no team
availability). Its decision gates were resolved by judgment instead — the
coach-marks tour approved outright, Phase 3 shipping all three navigation
candidates cheapest-first [Archive/TODO-v1-Archive §4; UX-Audit §6 note;
Phase-3-Task-Briefs].

What ran instead, per the developer's account (2026-09-03): **four rounds of
informal exploratory testing.** Colleagues walked through the app self-directed,
deliberately trying to break it; findings were captured on paper — by the tester,
or by the developer as the tester demonstrated the problem — and folded into the
working to-do list, where each item was tracked to a fix and checked off. The
sessions themselves were not separately documented, so this paragraph is attested
rather than evidenced; but their **residue is visible throughout the record** as
the dated punch lists and briefs whose items track one-to-one to fix batches: the
REV79 review that became all of Phase 3.5, the ten-item list shipped same-day as
v1.6.1, the follow-up rounds re-testing those fixes (v1.6.2, v1.6.4), and the
2026-08-31 thirteen-item and 2026-09-02 nine-item briefs. A careful reader should
treat the *session format* as attested and the *findings-to-fixes pipeline* as
documented.

### 6.3 Lineage examples (initial state → observation/feedback → decision → implementation)

- **Sidebar edge indicators.** Inherited state: rows with off-screen bars read
  as empty (audit finding B1). → Audit + owner priorities → per-row edge chips
  (Phase 1). → Later owner review: past projects shouldn't carry them → the
  wrong element was changed first (v1.2.1), the owner's *screenshot* corrected
  the diagnosis, and v1.2.2 fixed the actual chip — a documented
  misunderstanding-and-correction loop [V1-Releases/v121; TODO item 15].
- **Drag-zoom gesture.** Owner requested a vertical date-bar drag zoom and
  suggested ±15° gesture bands. → Implemented instead with a 45° axis split,
  with the rationale written down (bands leave dead diagonal zones that read as
  broken) and **the decision left open in the ledger for the owner to overturn
  after feeling it live** [TODO §7]. → Owner testing reported judder → same-frame
  header/canvas sync (v1.6.2) → subsequent round: "drag-zoom ✓". A
  developer-originated alternative, user-validated, with the disagreement
  preserved rather than erased.
- **Vocabulary.** Inherited: "checkpoints" and "tasks" as separate concepts with
  a known confusion trap. → The planned testing question (do users treat them as
  one?) was answered by owner adjudication when testing was skipped: keep both
  stores (2026-08-25). → Live use then produced the better answer: the 08-31
  owner brief renamed Checkpoint → **Milestone** and Task → **Note** with
  simplified editors (v1.4.0) — **UI copy only, stored schema untouched** so
  existing data and the colleague app keep working. Existing-workflow
  compatibility constraining a rename.
- **Viewer permissions as a testing tool.** Developer-originated: a dev-only
  Viewer toggle to preview the app exactly as a non-admin sees it (v1.9.0). →
  First use of that tool by the owner immediately exposed a latent v1.8.0 crash
  (viewer + project + milestone rows) → guarded at the shared binding site
  (v1.9.1). Built-for-testing functionality doing its job.
- **The People page.** Inherited: staff managed in a batch modal. → Owner
  handoff (2026-09-01) specified the read-first master/detail model and the
  "entity gets a page, the action may get a modal" rule → implemented as v1.7.0
  → owner's live tests then drove four successive refinement rounds (columns,
  editor grid, resizable panes, scroll preservation, keyboard walking;
  v1.14.0–v1.18.0). Collaboratively specified, iteratively user-corrected.
- **Feedback intentionally not implemented, with rationale on file:** the
  per-browser tour seen-flag stays (owner: most people don't switch machines;
  gate: repeat-tour complaints); Vivid mode hides weekend markers by owner
  ruling with the risk documented; the deliberate "Show everything" vs "Clear
  filters" asymmetry — all in the §7 ledger with their reopening conditions
  [TODO §7].

The division of labor the record supports: **colleagues and the owner set
direction, priorities, vocabulary, and acceptance through briefs, punch lists,
live reports, and rulings; the developer proposed, implemented, tested,
counter-proposed with written rationale, and maintained the ledger that keeps
every unresolved disagreement reopenable.** Neither "the users designed it" nor
"the developer decided everything" survives contact with the milestone records.

## 7. Legacy-system inventory

From the repository's own inventory and rulings [TODO §3 item 13; §5]. *Unknowns
are marked; nothing below is guessed.*

| Existing source | Purpose | Data/workflow overlap | Role in new system | Transition status |
|---|---|---|---|---|
| Installations (Excel/SP) | Installation tracking | Projects, install dates | Consolidation candidate | Inventoried; awaiting per-store audit |
| Install Log (Excel/SP) | Installation history | Project history | Consolidation candidate | Inventoried; awaiting audit |
| TwoSeven Master Calendar (Excel/SP) | Company calendar | Scheduling | Compatibility reference + consolidation candidate | Inventoried; awaiting audit |
| Current 2-7 Projects (SP list) | Project tracking | Projects (direct overlap) | Redundancy candidate for eventual retirement | Inventoried; parallel until proven |
| 27 Events / both Archives (SP lists) | Events, history | Events, project history | Consolidation candidates | Inventoried; awaiting audit |
| PTO Contract Approvals (SP list + PowerApps flow) | Time-off approvals | People/availability | **Must connect to People page; upstream flow owned by ops manager** | **Frozen** until discovery session (~2026-09-08) |
| Material Deliveries (SP list) | Deliveries | Project logistics | Unresolved | Inventoried only |
| 27 Employees (SP list) | Staff directory (old, sparse) | Staffing | **Must remain independent** — unidentified nightly automation (likely a directory sync) | **Frozen** until the automation is identified |
| Employee Contacts (SP list, HR-maintained) | Authoritative staffing record | Staffing, contacts, lifecycle | **Authoritative upstream** — identity/lifecycle master; read-only import live; HR-sensitive fields never read | Integrated read-only (v1.13.0); parallel-run |
| Excel client master | Client list | Clients | Source of the imported client list | Imported REV69; list-side copy parallel-runs until app copy earns mastership |
| `ShopTimeline_*` lists (6+) | The app's own storage | — | The app's database; shared with the colleague app | Live; additive-only schema changes, colleague-app checked |

## 8. Provenance ambiguities and discrepancies (stated, not resolved)

1. **The prototype's own inputs are outside this record.** REV1–33 predate both
   the repository and the handoff's version table; what informed the original
   developer's design (including any existing employee workflows) is not
   evidenced here in either direction. This document deliberately does not
   adjudicate it. The repository's earliest relevant datum is REV41's calendar
   "in the in-house format" — an alpha-era accommodation of an existing company
   convention.
2. **Testing sessions are attested, not separately documented.** Four informal
   "try to break it" walkthroughs with colleagues ran, with findings captured on
   paper and folded into the to-do list (developer's account, 2026-09-03). The
   repository's dated punch lists and briefs are consistent with this account
   but do not independently record the sessions; the scripted round-2 protocol
   was designed and then skipped. See §6.2 for the attested/documented split.
3. **"Owner" and "Robert" are the same person** — confirmed by the developer
   (2026-09-03): the planning documents' "owner" (briefs, rulings) and "Robert"
   (schema changes, live testing) are one person acting as product owner and
   design director; the single committer account is `221twoseven`. Stated here
   because the documents themselves never say it in one place.
4. **The consolidation is early — and full integration is the stated goal.**
   The source-of-truth architecture is documented intent with two live
   integrations and a written doctrine, not a completed migration; eleven of
   the fourteen stores are inventoried only. v2.0.0 is explicitly reserved for
   the cutover declaration [TODO §4].
5. **Commit attribution is coarse.** All 250 commits sit under one account. The
   working method — confirmed by the developer — is that of a design director
   with AI assistants as the implementation team, documented in-repo as method
   (CLAUDE.md) but not per-commit. This document therefore attributes stages by
   the documentary record (handoff, briefs, rulings, milestone records), not by
   commit author lines.

## 9. Evidence appendix

How to verify this document's claims, by pointer type:

- **[Handoff §N]** — `docs/Handoff-Notes.md`, the original developer's handoff:
  prototype rationale (§§1–4), data conventions (§5), alpha version history
  REV34–50 (§12), org-transfer note (§10/closing).
- **[reference/README.md]** and `reference/Timeline_50.html` — the frozen REV50
  prototype and the rules around it; `git log --follow index.html` shows the
  byte-for-byte start.
- **[UX-Audit §N]** — `docs/Archive/UX-Audit-and-Strategy.md` (2026-08-12): the
  inherited build's assessment, the "protect these" list crediting the
  prototype's strengths, the phased plan, and the §6 validation plan.
- **[TODO §N / item N]** — `docs/TODO.md`: the versioning ladder (§4), schema
  ledger (§5), deferred-decisions ledger (§7), and the 14-store inventory with
  its rulings (§3 item 13). The completed v1 backlog: `docs/Archive/TODO-v1-Archive.md`.
- **[V1-Releases/...]** and era folders — `docs/Milestones/` (62 records, mapped
  in `docs/Milestones/README.md`): one record per milestone with what changed,
  why, and known ceilings; screenshots alongside.
- **[Archive/Hallway-Test-Round-2.md]** — the testing protocol as designed;
  its skip is recorded in `docs/Archive/TODO-v1-Archive.md` §4 and the
  Phase-3 task briefs.
- **Git history** — repository created 2026-08-10 (`git log --reverse`); 250
  commits; PRs #1–#32+; branch structure including the original developer's
  `sandbox`; the three-subpath Pages deploy in `.github/workflows/deploy-pages.yml`.
- **Tests** — `tests/` (74 suites) and `tests/README.md`; `npm test` vs
  `npm run test:ref` demonstrates the inherited-vs-current discipline directly.
