# Plan and decisions — Systems

What Systems is, the phases it is built in, every decision it forces (open ones first), and
the data schema. The work itself is in [`TODO.md`](TODO.md). Each decision reads: the question,
the facts that shape it, the options, then the recommendation or the dated ruling. "(was D…)"
is the code older records use.

## What we're building

**Systems** (owner, 2026-09-29) is a data-management ecosystem: several **products**, each
a touchpoint for one kind of information, over **one shared dataset**, reached from one
**portal**. "Systems" is the name in the title block of the portal, and the portal sits at
the root `/`. The products are peers — none is the parent of another. Timeline is one of
them.

**Clients is part of Office** (owner, 2026-11-19): "let's use what we have now as Office,
since it is a more comprehensive name. Clients is more narrow and fits inside office."
Setting projects up and closing them out happens on the client's record, beside the
client's project history, so the Clients app becomes Office rather than Office being built
beside it. Three products now: People, Office, Timeline. This replaces the 2026-09-29
table's separate Clients product; the client list (`ShopTimeline_Clients`) and past
projects (`ShopTimeline_PastProjects`) are Office's data.

| Product | What it holds and does | Who uses it | Gated? | Where it stands |
|---|---|---|---|---|
| **People** | Staff names, contact information, status (FTE vs Freelance), logged hours, and whatever else the HR / ADP administrator manages. The place to connect to ADP — CSV first; the ADP API only through Power Automate with a named owner, never from the browser (the integrations decision) | The HR / ADP administrator; everyone reads the public roster | HR-only fields restricted (the permissions decision, items 26–27) | Its own app at `people/` since v1.62.0 (item 87), built from Timeline's People page; HR-only fields and new sections wait for items 26–27 |
| **Office** | Clients and their projects, from lead to closeout: the client list and contacts, each client's projects (past ones included), billing and revenue, current and past teams; job lead, estimate, cost-code generation, job creation, budget views, closeout | Management, project management, purchasing, accounting | Yes | Today's Clients app (`clients/`, item 86) is Office's first part and is renamed Office (item 94). Then, in project-cycle order: job lead / forecast (45), estimate (44), job creation with cost codes and the QuickBooks / TCP hand-off (42, 43); closeout (11) last |
| **Timeline** | Project production: the schedule, phases, assignments, milestones, notes — the app that exists today | Everyone; existing permissions mostly stay | Mostly no (admin / viewer as today) | In production ("Where we stand"); moves to `/timeline/`, behind the Systems page at `/`, with v1.56.0 (item 49); New Project stays here until Office takes setup (item 43) |

**The ownership rule.** Each product has sole ownership of the data it holds: records are
**created and deleted only inside their own product**. Every product **reads** the shared
dataset, so information from People and Office is selectable, assignable and
interactive wherever it is needed — a Timeline phase picks a person from People, a project
references a client from Office — but Timeline never creates or deletes a person, a client
or a cost code, and once Office exists it no longer sets projects up either (item 43):
Office creates the project, Timeline schedules it. Timeline manages production data only.
- *Merging two people (owner, 2026-11-19, item 87: "go with option (a)").* The People app's
  merge also rewrites the duplicate's name, and its stable ID, on Timeline's projects, phases
  and to-dos. That changes names on existing records and creates or deletes nothing there, so
  the rule holds. It writes only those name fields and `refs`, one record at a time, never a
  whole record. The alternative (People only retires the duplicate, and Timeline repoints on
  its next load) needed a "merged into" column on Staff and left records pointing at someone
  who was gone until Timeline next opened.

**The build order is the project cycle** (owner, 2026-09-29). Systems is developed in the
order a job moves through the shop, so each product exists before the step that needs it:

| Step | Product | Backlog |
|---|---|---|
| 1. Job lead / forecast | Office | item 45 |
| 2. Estimate | Office | item 44 |
| 3. Job creation — cost codes, QuickBooks, TCP | Office | items 42, 43 (13 and 14 are its inputs; the integrations decision the hand-off) |
| 4. People management | People | items 26, 27, 9, 19; the employee-directory decision, the worker-types decision |
| 5. PM schedule, workback | Timeline (exists) | the pilot items, TODO.md P0 / P1 |
| 6. Design, production, finishing, packing / install / shipping | Timeline (exists) | the pilot items |
| 7. Project closeout, final invoice | Office | item 11 — last, not planned further until the steps before it exist |

The client list is not a step: a lead names a client at step 1, so it is read from the
start. It already exists, as Office's first part (item 86, renamed by item 94).

**What this means for the data** (the 2026-09-24 framing, unchanged; the what-v2.0.0-means decision):

1. **The shared SharePoint registries are the source of truth, not any product.** One
   record per fact, keyed by a stable internal ID, one owner per field, freshness visible.
   Projects, Clients, People, Cost Codes, Events, Departments, Shop Closures, Closeouts are
   registries; every product is a *view* of them [brief §5, §8; vision "no duplicate
   entries"]. (The rule holds on any platform. Whether the registries stay SharePoint
   lists or become Dataverse or SQL tables is the data-platform decision.)
2. **Timeline stays the schedule.** It keeps every feature as designed and reads/writes the
   operational fields of those registries — dates, work blocks, assignments, status. It is
   not a master for people, clients or cost codes [vision; brief §7].
3. **Duplicate entry is removed before features are added.** After the pilot, the first
   retirement of a manual re-typing step is the measure of success, not a new view
   [brief §1, §10].
4. **Sensitive data is protected by SharePoint permissions, not by hiding it in a UI.**
   Every product runs in the browser with each user's own token; anything a user must not
   see lives in a list or site they cannot read (the permissions decision). "Gated" in the table means exactly
   that. (The principle holds on any platform: protection is enforced below the UI. If
   the data-platform decision moves the registries behind an API, the enforcement is the API's server-side
   authorization instead of each user's token; see the permissions decision.)
5. **v2.0.0 = Timeline running on the shared registries** — the first `ShopTimeline_*`
   master retired in favour of a shared one. That is the breaking change the major number
   exists for. The portal and the other products arrive as v2.x/v3, each its own client of
   the same registries, each with its own version.

**Where the open work lands** (product → items and this file decisions):

- **People** — items 4, 9, 19, 26, 27; the employee-directory decision, the worker-types decision, the integrations decision (the ADP connection).
- **Office** (the client list included, 2026-11-19) — items 94 (the rename) and 95 (a
  client's projects by stage); then 45, 44, 42, 43 in that order, with 13 and 14 as inputs,
  then 11 last; item 28 (client IDs; person IDs with People); the stable-IDs ruling;
  the project-list decision, the departments-as-data decision, the integrations decision.
- **Timeline** — items 1–3, 5–8, 10, 12, 18, 20, 22, 23, 25, 29, 32–41; the polling-budget decision, the shop-terminal idea.
- **Systems as a whole** (portal, shared module, sign-in, hosting) — items 15–17, 21, 24,
  30, 31, 48–52; the permissions decision, the one-folder-per-product ruling, the what-v2.0.0-means decision, the Company Data ruling, the integrations decision, the data-platform decision. The design-resources question is tabled.

Retired framings, for the record: v1.x "the app becomes the company's singular source of
truth, absorbing the 14 stores into Timeline's Company Data pages" (retired 2026-09-24);
the 2026-09-24 wording "a portal of sibling apps — Client Manager, Personnel Manager,
Design Resources Manager" (names superseded 2026-09-29; Design Resources is not one of the
four products and is tabled — owner, 2026-09-29, the design-resources question).

## The roadmap

Three phases. Phase 7 is the one running now.

| Phase | Versions | Goal | Done when |
|---|---|---|---|
| **7 — Pilot readiness** (now) | v1.24 → v1.3x | Get Timeline ready for the pilot: the brief's P0 app fixes, checks of what already exists, the outside-the-app controls handed to their owners, and the this file design decisions taken. Closeout moved to Office in Phase 9 (owner, 2026-09-29) | Pilot users create and update jobs without missing workers, lost edits or misleading dates, and at least one duplicate-entry step is named for removal [brief §9, §10.1] |
| **8 — Shared registries and Office** | v2.0.0, then a minor version per registry (Office and People have versions of their own) | Move the data onto shared registries (lists or tables, the data-platform decision) with stable IDs: Clients, Projects, Cost Codes. Point Timeline at them, store assignments by person ID, and turn departments and shop closures into lists instead of code. Build **Office**, the next new product (owner, 2026-09-29), in project-cycle order ("What we're building"): job lead / forecast, estimate, job creation with cost codes and the QuickBooks / TCP hand-off (items 45, 44, 42, 43). Then **People** (cycle step 4: items 26, 27) | A `ShopTimeline_*` list is retired in favour of a shared registry with no data lost; two people asking for a cost code at the same moment can't get the same one; the cost-code workbook is frozen read-only; a job exists in Office before Timeline schedules it [brief §6, §8, §9 P1] |
| **9 — Systems: the portal and the products** | v2.x → v3 | The Systems portal at `/` (shipped early: v1.56.0, item 49); Clients as its own product (Office and People arrived in Phase 8); Office's closeout screen (item 11), the last step of the cycle; Timeline moved to `/timeline/` (also v1.56.0); one shared code module and design language, with each product keeping its own identity; permission sets per audience | Each audience (PM, HR, Accounting, Purchasing, Operations, Management) has its own product over the same records; records are created and deleted only in the product that owns them; nothing is typed in twice; a finished job can't slip through without its balance invoice [vision; brief §8.4–8.5, §9 P2–P3] |

## Open questions

### Which list becomes the company's one project list (was D1)

*Open.* Which list becomes the company's one project
registry: Current 2-7 Projects, extended (brief §6.7), or `ShopTimeline_Projects`,
promoted?
*Recommend:* run item 14's schema comparison first. Whichever wins, the other becomes a
read-only mirror for one parallel period, then is retired — never a permanent two-way
sync between two editable masters. Moving off `ShopTimeline_Projects` is no longer
blocked by the colleague app (the colleague-app ruling), but the migration record still names what changes.
Whichever list wins, Office (Phase 8) edits its setup fields and Timeline its
operational ones (owner, 2026-09-29).
*The business rule and the storage, separated (2026-10-08):* the ruling the project-list decision needs is
**exactly one authoritative Project record per job, and no permanent two-master sync**.
That holds on any platform. *Which store holds it* follows the data-platform decision: on SharePoint, one of
the two lists above; on Dataverse or Azure SQL, possibly a new `Projects` table that
neither list becomes. Item 14's comparison is needed either way, because both lists hold
business knowledge that has to migrate and dependents that have to be re-pointed.
[brief §6.7, §14]

### Which list is the employee directory (was D5)

*Open.* Which list is "the Employee Directory"?
- HR's Employee Contacts: kept by hand, current, and holds Pay Type and PersonalEmail;
- 27 Employees: updated by a nightly automation nobody has identified;
- or a new combined list.

People are matched today by work email, or else by exact name, so a namesake without a
work email can be matched to the wrong row.
*Recommend:* Employee Contacts as the identity master, read through a trimmed view or
`$select` (item 9), until the permissions decision's separate-list rule lets People keep HR-only fields on a
list of their own. The app never writes to Employee Contacts. [brief §4 open question,
§8.1]

### The data platform: SharePoint lists, Dataverse or Azure (was D15)

*Open.* Reassessed
2026-10-08: see "Reassessment" at the end of this entry, which supersedes the
recommendation below. Raised
2026-10-01 (owner): with the Phase 8 registries forcing a schema change anyway, should the data
move off SharePoint lists now and be migrated once? Three options, compared on what this
team runs and what Phase 8 needs. Power Automate works with all three, so it isn't one of
the options. The Power Platform option is Dataverse, the database Power Apps and Power
Automate are built on. Facts marked *verify* (licensing, CORS) must be checked against
current Microsoft docs and the tenant's licences before a ruling.

| | **A. SharePoint lists** (today) | **B. Dataverse** (Power Platform) | **C. Azure** (Azure SQL + an API) |
| --- | --- | --- | --- |
| Who enforces access | SharePoint, per site / list / item, with each user's own token ("What we're building" point 4, the permissions decision) | Dataverse security roles, with each user's own token | Code we write in the API; Entra signs users in, but the rules are ours |
| Per-field protection | No; the permissions decision splits lists instead | Yes, column-level security | Yes, built by us (or SQL row-level security) |
| Transactions, unique keys | No transactions; unique indexed column + retry | Batch transactions, alternate keys, autonumber columns (cost codes, item 42) | Full SQL |
| Relations | Text IDs joined in the app (the permissions decision, the stable-IDs ruling); lookups same-site only | Real relationships | Full SQL |
| Browser app calls it directly | Yes (Graph, as today) | Yes, Web API with MSAL delegated tokens (*verify* CORS from the Pages origin) | No; needs a hosted API (e.g. Static Web Apps + Functions), a second codebase with a deploy step |
| Power Automate | Standard connector (today's flows) | Native; premium connector | SQL connector is premium; or HTTP to our API |
| Company data already there | Current 2-7 Projects, 27 Events, Employee Contacts, the Outlook and PTO flows (Automations.md) | Migrated or mirrored | Migrated or synced |
| Cost | Included in M365 | Power Apps premium per user, every user including viewers, plus capacity (*verify* price and any existing licences) | Pay-as-you-go, likely small at this scale; plus a subscription to administer |
| Running it | Lowest; hand edits in the list UI | Medium: an environment, solutions, licence assignment; model-driven admin screens come with it | Highest: infrastructure, secrets, backups, monitoring, API releases; no admin UI unless built |
| Migration cost | Phase 8 schema work only | Storage seam + rows + flows rewired + licences | Storage seam + API + authorization layer + rows + flows |
| Ceilings | List view threshold on unindexed filters; whole-list polling (the polling-budget decision) | Comfortable at this scale | Comfortable at this scale |

*Recommended 2026-10-01 (superseded 2026-10-08, kept for the record):* **A for v2.0.0,
with B as the named upgrade path; C only if B proves insufficient.** The reasons: A keeps the no-backend model, so permissions stay the user's
own token and the permissions decision's design holds. The company's other data and flows are already on
SharePoint, and Systems is defined as one shared dataset ("What we're building"). Moving Timeline alone would
recreate the two-masters problem the project-list decision forbids. B beats C for this team because it keeps
per-user tokens and native flows, while C turns security into code we maintain.
**The platform is not changed during the pilot.** The expensive part of any migration is
the data model (stable IDs, normalization), and that is paid once whatever the target. If
the model is right, moving rows later is a script.

Prepare regardless of the ruling. All three steps are already planned or are cheap:
1. the storage seam (`docs/Architecture-Review-Storage.md` idea 1, eight
   behaviour-neutral PRs), after which a backend swap rewrites one `store` object, not 37
   call sites;
2. a backend-neutral Phase 8 schema: text IDs (the stable-IDs ruling), typed columns, JSON-in-text columns
   (`ticketNodes`, `activeDepartments`, `schedule`) split out where they must be
   queried, all recorded in the provisioning spec (review idea 2), which ports to
   Dataverse or SQL nearly 1:1;
3. The polling-budget decision's polling budget, which matters on every platform.

*Reopen if any of these become true:* (1) item 42 cost-code allocation can't be made
collision-safe with a unique column + retry; (2) item 27 / the permissions decision needs per-field protection
that list splits can't express cleanly; (3) a registry nears the list threshold or the polling-budget decision's
budget can't be met with delta or `$filter` reads; (4) the integrations decision integrations need server-side
logic beyond what flows can do; (5) people outside the tenant need access.

*Before ruling:* a Dataverse licence quote (headcount × per-user premium, and whether the
tenant already holds any), and a half-day spike: one read and one write to the Dataverse
Web API from a Pages-hosted page with an MSAL delegated token. *Gate:* rule before the
Phase 8 schema is provisioned, so rows move at most once. Related: The project-list decision, the stable-IDs ruling, the polling-budget decision; item 42.
[owner 2026-10-01; `docs/Architecture-Review-Storage.md`]

**Reassessment, 2026-10-08** (owner and the backup maintainer, after research;
`docs/Architecture-Review-Backend.md`). Two facts weren't weighed on 2026-10-01:
1. *Office is strongly relational and rule-bound:* lead → estimate → revision →
   location → item → lines, priced from dated catalog rates, then approval → project →
   cost code → budget → closeout. Transactions, unique keys, locked history, exact money
   and per-field protection are most of its design, not one row of a table.
2. *Development is AI-agent-led:* Claude writes most of the code under `CLAUDE.md`,
   CI-gated tests and human approval. Writing and testing a conventional API is the part
   of C that got cheap. The human roles around it did not.

*Corrections to the table above* (detail in the review, §A2):
- **C's "Running it" was overstated.** Azure SQL is platform-managed (patching, high
  availability, automatic point-in-time backups), and managed identity removes database
  passwords. We still own code, authorization, migrations, releases, alerts, restore
  drills and cost.
- **The Static Web Apps example doesn't fit.** Its managed functions can't use managed
  identity, and the one-folder-per-product ruling keeps the frontends on Pages anyway, so the shape is a standalone API
  with CORS.
- **B's migration cost missed plug-ins.** Authoritative multi-record operations in
  Dataverse need C# plug-ins or Custom APIs; otherwise the rules live in the browser.
- **The two-masters argument isn't a platform argument.** It applies to B as much as C;
  it is the project-list decision's migration cost.
- **B's price is now checked:** $20 per user per month, $22 from 2027-01-01, every user
  including viewers (confirm with the reseller).

*Recommend (replaces the 2026-10-01 recommendation):*
- No platform change during the Phase 7 pilot.
- Before Phase 8 provisions its registries, treat **Dataverse (B) and Azure SQL + a
  Systems API (C) as co-equal candidates**, not Azure as a Dataverse fallback.
- SharePoint (A) stays the home of files, documents and M365-native content, and of
  Timeline's data until the cutover. It remains the Phase 8 answer only if item 44 finds
  Office holds no more than an estimate reference.
- The storage seam and the backend-neutral schema (IDs, typed columns, normalized
  departments) go ahead regardless.
- Under B or C, staging separation (item 17) is mandatory before any write path.

*Current lean, not a ruling:* C, if the spike confirms cost, reproducible deploys and a
recovery path a non-programmer can follow, and if the owners in input 4 below can be
named. B is the safer choice if they can't.

*Before ruling — four inputs* (tracked as item 51; the seam is item 48):
1. The Dataverse licence quote and the half-day Web API spike (as above).
2. A deliberately small, read-only Azure spike on isolated staging. It waits on storage
   seam PRs 1–2 and on explicit approval to create Azure and Entra resources (⚠). Three
   endpoints, an `apiStore` behind a developer switch in preview, no production writes
   (the review, §E16).
3. Item 44's scope answer: line-item estimating in Office, or only an estimate
   reference.
4. Named people:
   - under C: the Azure subscription and billing owner, a second administrator, the
     alert recipient and the production-migration approver;
   - under B: the environment and licence administrator.

Also wanted, not blocking: The permissions decision's permission boundaries for cost, markup and margin, and
the answer on whether Office's pricing logic may live in a public repository.

*Would settle it toward A:* item 44 finds Office holds only an estimate reference, and
cost codes can be made collision-safe on a list. *Toward B:* the human roles for C can't
be named, or the licence cost is acceptable and the plug-in surface stays small. *Toward
C:* the spike passes and the roles are named. Local SQL Server is ranked below Azure SQL
(the review, §E13).

*Gate (unchanged):* rule before the Phase 8 schema is provisioned, so rows move at most
once. Backend guardrails enter `CLAUDE.md` only when backend work is authorized (the archived ledger).
[owner and the backup maintainer 2026-10-08; `docs/Architecture-Review-Backend.md`]

### What v2.0.0 means (was D7)

*Open.* The options: "What we're building" point 5 (Timeline running on the
shared registries), the retired "app as master", or "the pilot release". *Recommend:*
"What we're building" point 5.

### Worker types (employee, freelance and so on) (was D9)

*Open.* The app has a Freelance flag (`1` or empty).
The brief wants Regular / Seasonal / Freelance / Contractor. Employee Contacts already
has a Category (Full/Part Time / Seasonal / Archived). *Recommend:* one vocabulary,
taken from Employee Contacts if HR agrees, mapped onto the flag until Phase 8. A related
limit: the weekly schedule is one time range per person (no split shifts, no per-day
hours), the first ceiling a TimeClock+ hours integration will hit (the archived ledger). [brief §8.1]

### Departments and shop closures as data (was D11)

*Open.* Departments and the six
holidays are fixed in code; the brief wants configurable departments and a Shop Closure
list. *Recommend:* Phase 8, after the project-list decision. The department list just changed (Logistics and
Shipping added, `othoffice` retired) and should settle first. Whether Timeline's own
`ShopTimeline_Events` merges into 27 Events is decided with item 12.
*Relational form (2026-10-08):* on Dataverse or SQL these are normalized entities, not
JSON in text columns: Departments, Shop Closures, and a join between people and
departments (today the `depts` JSON on Staff and `activeDepartments` on Projects). The
decision this needs is unchanged: which departments, who edits them, and how a retired
one folds in. [brief §8, §8.2]

### How often the apps check for other people's edits (was D12)

*Open.* To pick up other people's edits, every open tab
re-reads every list every 90 seconds (the change log is deliberately never polled).
Each new product and each new registry adds another full read per user per tab.
*Recommend:* before Phase 8 adds registries, set a budget: how many lists per tick, and
delta or `$filter` reads (fetch only what changed) for large lists. Avoid the obvious
shortcut of checking only the newest "last modified" time: SharePoint rejects sorting on
an unindexed column (the test harness wouldn't catch that), and a timestamp can't show
a deletion. Graph's `/items/delta` query is the safe route.
*Reframed for any platform (2026-10-08):* this is a read and sync budget, not a
SharePoint quirk. The principle holds everywhere: an open browser must not re-download
the company dataset on a timer. Behind an API, the conventional answer is filtered reads
plus an `updatedSince` cursor (a `rowversion`), with soft-deleted rows returned as
tombstones, which also solves the deletion problem above. Real-time push (WebSockets) is
not assumed. Polling also has a cost on Azure: it keeps a serverless database awake, so
the budget sets part of the bill.

### Connecting ADP, TimeClock+ and QuickBooks (was D13)

*Open.* The brief ranks them P3,
after ownership, security and maintenance are settled; the vision says "if possible". A
browser app can't hold API secrets, so any integration that writes needs a flow or a
small service with its own owner. *Recommend:* CSV export and import first (the
QuickBooks and TCP formats are still to be confirmed, "Material to gather" in TODO.md); APIs only through Power
Automate, with a named owner. The project cycle ("What we're building", 2026-09-29) puts the QuickBooks
and TCP hand-off at job creation (item 43), so the CSV formats are Office's input. The
ADP connection belongs to People (owner, 2026-09-29): CSV first, the API through Power
Automate.
*If Systems gains a backend (the data-platform decision, 2026-10-08):* "APIs only through Power Automate" was a
consequence of having no server, not a rule in itself. CSV first stays. After that there
are two homes:
- Power Automate, for Microsoft-centric workflow a non-programmer can maintain;
- a Systems API job, for transactional or tightly coupled integrations, such as a
  QuickBooks hand-off that must succeed or fail together with job creation (item 43).

Browser-held secrets stay prohibited. Every integration, in either home, keeps a named
owner and documented failure and recovery behaviour (`docs/Automations.md`).
[brief §1.2, §9 P3, §15]

## Set aside

### Design resources and secrets (was D6)

*Tabled 2026-09-29 (owner).* Not one of the four
Systems products, and not needed for the system as a whole: no product, no list and no
work until the owner reopens it. Kept for that day:
- Licence keys and shared logins in a SharePoint list that a product reads are readable
  by every user with site access, whatever the UI hides (the permissions decision), and this repository is
  public.
- *Recommend, if reopened:* the product stores *pointers and ownership* — what the tool
  is, who owns the licence, where the credential lives — and links to a proper vault (a
  password manager, or a document library with its own restricted permissions). Never
  the secret itself in a list the app reads. The plug-in / script store is a document
  library with a Manager page over it.
[vision]

### A shop terminal / TV mode (was D14)

*Parked.* A fourth account type (`terminal`) with
its own read-only dashboard; the company already runs M365 accounts that aren't people.
Owner ruling 2026-09-02: after rollout, once real use proves the need. The brief: P2,
and no TV redesign in the pilot.

## Decided

### Who can see what: the permission model (was D3)

*Ruled in principle 2026-09-24 (owner):*
"this must be solved" — give specific stakeholders select access without duplicating
information, and without a sprawl of lists.
- *Today:* three roles — Admin, Viewer, Developer — with per-feature viewer grants in
  Config. PMs are admins.
- *Hiding things in the UI is workflow protection, not security.* Every signed-in
  user's token carries `Sites.ReadWrite.All`. It's delegated, so it can do exactly what
  that person can do on the site, and every site member can read `ShopTimeline_Staff`
  directly.
- *SharePoint protects a site, a list or an item — never a column.* So the answer is
  **normalize, don't duplicate: each fact lives in one list, and the list is the unit
  of protection.** A public roster list holds what everyone needs. A restricted list
  holds *only* the sensitive fields, plus the stable ID of the person (or project) they
  belong to. Nothing is copied: the restricted record *is* the extra information that
  stakeholder needs, and only their token can read it.
- *Can a list reference another list?* Yes (the owner's question), in two ways:
  1. SharePoint **lookup columns** — a column pointing at an item in another list,
     optionally showing its columns (Graph reads them as `<col>LookupId` plus the
     value). Same site only, and awkward to write through Graph.
  2. The app's existing pattern — a stable ID stored as text (`appId`, `personId`) and
     joined in the app. It works across sites, so the restricted list can live on an
     HR-only site.

  *Recommend (2).*
- *Enforcement* is then the user's own token: Graph returns 403 for a list they can't
  read, and the app already copes with missing optional lists (`STAFF_OK`,
  `EVENTS_OK`). App roles stay for *workflow* — which features and views someone gets
  — and the role vocabulary is designed once, for every product.
- *Work:* item 26 (the tiers, Phase 7), then item 27 (the split, Phase 8), then item 30
  (Phase 9). Saved views: per user in item 25 (Phase 7); shared and role-based in
  Phase 9.
- *The mechanism depends on the data-platform decision (2026-10-08); the principle doesn't.* Hiding in the UI
  stays workflow only, facts are never duplicated to make views, and access is enforced
  below the UI. Splitting lists and relying on each user's token is the SharePoint form.
  Office's costed records would need every line split into a public and a restricted
  list: the list sprawl this ruling rejects.
  - *Under Dataverse:* security roles and column-level security, still with each
    user's own token.
  - *Under Azure SQL + API:* Entra identity → the API maps the token's `oid` to a
    person → a server-side check per operation → SQL. Responses carry only the fields
    the caller may see, and every rule has an allowed and a denied test. The frontend
    never decides authorization.
- *Decisions people make before code exists, whatever the platform:* who may see
  internal cost, markup and margin; who sees an estimate before it's sent and who
  approves one; who sees budgets and actuals; who sees HR fields; who sees accounting and
  closeout data; and whether roles are assigned in Entra or in Systems' own data. The
  boundaries are needed now. The role vocabulary is not invented here.
[brief §2, §9, §11; vision]

### One folder per product, the Systems page at the root (was D4)

*Ruled 2026-09-28 (owner): option (b).
Refined 2026-09-29 with the Systems definition ("What we're building").* One repository, one Pages site,
one folder per product, and the Systems portal at the root.
- *Options weighed:* (a) one file with more routes — the Company Data pages at
  `#/people` and `#/clients` are already early products; (b) separate single-file
  products under one Pages site, sharing a vendored `common.css` / `common.js`; (c) a
  build step. (b) keeps the no-build, one-file-per-product discipline that made this app
  maintainable, and the portal is then a static page. (a) was rejected because every
  product's features would ship to every PM on Timeline's release schedule; (c) was
  rejected too.
- *Layout* — the same hierarchy in the folders, the URLs and the docs:

  ```
  /                         Systems
    index.html              portal: a static page of tiles, one per product
    timeline/index.html     today's index.html, moved
    people/  clients/  office/    one folder each, created only when built
    common/                 common.css, common.js, msal — extracted only when product #2 starts
    design/                 Systems-level (already is)
    docs/                   Systems-level: TODO, ARCHITECTURE, Milestones by phase
    tests/                  Timeline's today; tests/timeline/ when product #2 arrives
    reference/              Timeline's frozen baseline, stays put
  ```

  Phase folders under `docs/Milestones/` stay as they are: phases belong to Systems,
  and a record names its product in its file name.
- *The reshape PR* (item 49, shipped v1.56.0 2026-11-17). Moving Timeline is its own PR that changes no behaviour: one
  release, one CHANGELOG line (the front page is now the portal; Timeline lives at
  `/timeline/`). It touches:
  - the Pages workflow (sparse-checkout paths; the markup guard loops over every
    `index.html`; a missing path is harmless, so it can land on `development` first);
  - ⚠ **the Entra redirect URIs**, which must match exactly: the owner adds `/timeline/`
    and `/preview/timeline/` *before* the merge (`/sandbox/` was retired 2026-10-01);
  - one line on the portal that forwards any `#/…` link to `timeline/`, so old
    bookmarks keep working;
  - `tests/run.js`'s default target (one string; the other test files that mention
    `index.html` need checking, not assuming).
- *When:* after the pilot P0 batch (it changes the URL users have), and before style
  guide §13 step 4 (the shell's app switcher needs a real portal to point at).
- *Repository name:* `Project-Scheduler` is part of the Pages address, so it appears in
  every user's URL, and GitHub doesn't promise to redirect Pages after a rename. Item
  40's custom domain hides the name from users, so: custom domain first, rename after,
  never before. *Overruled 2026-11-18 (owner):* the custom domain may not come soon, so
  the rename goes first, just before the launch's promotion (item 88); a custom domain
  can still follow.
- *Refinement for Systems (2026-09-29):* the products are peers — Timeline isn't the
  parent — each with its own owner, version, release notes and test suites. The portal
  shows tiles only for the products whose lists the signed-in user's token can read.
  The wordmark in every product links to the portal. The shared module is the storage
  seam plus the design tokens (`design/Style-Guide.md` §10;
  `docs/Architecture-Review-Storage.md`). Browser-storage keys get a product prefix from
  the first shared-module PR, because products on one site share `localStorage`.
[vision; brief §11.1; review 2026-09-29]

### Timeline's Company Data pages become products of their own (was D8)

*Ruled 2026-09-29 (owner, with the Systems
definition): they graduate.* Timeline's People and Clients pages become the **People**
and **Clients** products in Phase 9 (Clients went first, item 86, and became part of Office
on 2026-11-19, "What we're building"). From then on Timeline keeps read-only pickers and
never creates or deletes a person or a client ("What we're building" ownership rule). Until then the pages
are where the shared-registry work lands (Phase 8). Clients' "project history (names,
cost codes, job details, billings)" needs client IDs on projects (the stable-IDs ruling) and the closeout
and billing states (item 11, an Office screen) before it can be built without matching
on names.

### Stable IDs for people, clients and projects (was D10)

*Ruled for the SharePoint phase 2026-10-19 (item 28's plan); the target identity below stays the Phase 8 goal.* Assignments store people's *names*, matched up through
`canonName`; projects store the client as a *name*. (Since 2026-11-17 each name also carries
its ID in `refs`, and `canonName` is retired: item 28.) Clients have no `appId` but do have
a stable `spId` (the SharePoint item ID). *Recommend:* in Phase 8, add `clientId` on
Projects (additive, with a one-time backfill from name to ID in the same milestone) and
person IDs on assignments (Tasks can change now that the colleague app no longer constrains the lists). The flexible-roles
model (item 1) rides the same change.
*The target identity (2026-10-08):* every Systems entity gets a durable application ID
(a UUID): people, clients, projects, leads, estimates, estimate revisions, cost codes,
phases, to-dos, events. Store-specific IDs, the SharePoint item ID (`spId`) and today's
`appId` (`genId()`: a timestamp plus six random characters, not a UUID), are kept as
legacy columns for the migration, then rewritten into references once. Names stay
display values and never join. On SQL this becomes foreign keys; on any platform it is
the step that makes moving rows a script. [brief §8]
*For the SharePoint phase (2026-10-19):* item 28's plan (PR #177) stores the IDs beside
the names. The owner merged it as the go on 2026-10-19, ruling the stable-IDs ruling for this phase.

### The colleague app no longer constrains the lists (was D2)

*Ruled 2026-09-24 (owner).* The colleague
app still runs but isn't used and won't be again. Breaking it through a schema or
data-store change is accepted collateral, so **the additive-only rule is lifted**
(`CLAUDE.md` updated).
What stays: the lists are still shared in the plainer sense — people hand-edit them on
the site, and flows may use them — so a destructive change (rename, delete, type
change, moving a store) gets a milestone record naming what it breaks and how existing
rows migrate. Unblocked: The project-list decision, the stable-IDs ruling / item 28, item 27, item 29.

## Data and schema

The app never changes the schema itself: The owner receives the exact spec and applies it.
Adding a column is routine, because the app checks for new columns when it runs and copes
if one is missing (the "tristate" pattern: a missing column never makes other saves fail).
A destructive change gets a milestone record with its migration. The colleague app is no
constraint (the colleague-app ruling, lifted 2026-09-24).

**Created and in use (v1.x):**

- `ShopTimeline_PastProjects` (item 93, created by the owner 2026-11-18; the Clients app owns
  it): `Title`, `clientId` (number: the client's item ID), `jobCode`, `startDate` and `endDate`
  (date only), `team` (multiple lines). Projects from before Timeline, in a client's history.
- Lists: `ShopTimeline_Feedback`, `ShopTimeline_Changelog`, `ShopTimeline_Clients`, and
  `ShopTimeline_Config` (Title + `value`; confirmed created by the owner 2026-09-24 — the
  developer App Settings switches are shared through it).
- On `ShopTimeline_Staff`: `admin` (`1` / `dev` / empty), `feedbackRecipient`, `phone`,
  `personalNotes`, `listeningTo` / `listeningLink` / `listeningVerb` / `listeningShow`,
  `status` (Employee Contacts' vocabulary), `nickname`, `driver`, `availability`,
  `schedule` (JSON), `freelance`, `savedViews` (multi-line plain text, JSON
  `{views:[…]}`, written only to the signed-in user's own row; added by the owner
  2026-10-12, item 25).
- On `ShopTimeline_Projects`: `confirmedAt` and `confirmedBy`, single line of text each
  (an ISO time; a display name). Written only by "Schedule still accurate", never by a save.
  Added by the owner 2026-10-13 (item 6).
- On `ShopTimeline_Feedback`: `ghIssue` — single line of text, the GitHub issue URL,
  written by the tracker repository's poller, never by the app (item 31).
- On `ShopTimeline_Feedback`: `resolvedAt` — single line of text, the ticket's close time (ISO),
  written by the poller, never by the app (v1.34.0, owner ask 2026-10-05). The app shows it as
  the Resolved column's date (falling back to the row's last change on any row the poller
  hasn't stamped). **Confirmed created by the owner, 2026-10-08.**
- On `ShopTimeline_Tasks`: `range` — Yes/No, default No (v1.32.0, tracker #16). The app
  writes it only on rows that are extra work periods (tristate), so ordinary saves never
  touch it; the first + on a saved project needs it. **Confirmed created by the owner,
  2026-10-08.**
- On `ShopTimeline_Staff`: `ext` — single line of text, the Office Extension (office-to-office calls), typed on the
  People page (v1.43.0, item 9; the HR list has none). Tristate: a row without the column
  never sends it, and a save that sets one fails with the named-field message until it
  exists. **Confirmed created by the owner, 2026-10-08.**
- `refs` (multiple lines of text, plain) on `ShopTimeline_Projects`, `ShopTimeline_Tasks`
  and `ShopTimeline_Tasks2` — item 28's stable IDs (v1.52.0). The app probes each list
  once per session and writes the column only where it exists. **Confirmed created by
  the owner, 2026-11-11.**
- Entra: `Mail.Send` delegated, consented.
- Employee Contacts: read only. The app never writes to it or touches its schema.

**Candidates this phase** (the spec is delivered with the item's batch):

- `dateCertainty` on `ShopTimeline_Projects` — item 5.
- `closeoutStatus` and `billingStatus` (plus `closeoutBy` and `closeoutAt` if needed) on
  `ShopTimeline_Projects` — item 11.
- A tour "seen" flag on `ShopTimeline_Staff` — only if item 3 is fixed that way.
- A test site, or a suffixed set of lists, for development data — item 17.

**Phase 8 candidates** (design first):

- `clientId` on Projects (the stable-IDs ruling).
- Person IDs on assignments (the stable-IDs ruling, the colleague-app ruling).
- A client lifecycle column on `ShopTimeline_Clients`. The Staff side reuses `status`
  rather than a third vocabulary (v1.x ruling 2026-09-01).
- Departments and Shop Closures lists (the departments-as-data decision).
- The Cost Codes registry (item 13).

If the data-platform decision picks Dataverse or Azure SQL, these are designed as tables in a versioned schema,
not as list columns, and the ⚠ rule takes its future form. Under SQL: a migration in Git,
tested against a throwaway database, applied to staging, then to production after the
owner's explicit approval. A destructive migration still gets its milestone record
(`docs/Architecture-Review-Backend.md` §E9).

**Not changes:** item 1's renames are labels only; stored field names stay the same.
