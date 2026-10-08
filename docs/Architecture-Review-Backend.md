# Architecture review — the data platform and a Systems backend

**Date:** 2026-10-08 · **Build reviewed:** `development` at `38a709b` (v1.41.1, `index.html`
11,941 lines) · **Predecessor:** [`Architecture-Review-Storage.md`](Architecture-Review-Storage.md)
(2026-09-29). Its findings stand as written; this review builds on them and does not replace
them. · **Decision it informs:** `docs/TODO.md` §4 **D15**, reassessed in the same PR.

**Scope:** documentation only. No Azure resource, Entra setting, SharePoint list, production
row or line of app code was created or changed. Microsoft and Prisma documentation was read
to check the facts the 2026-10-01 D15 text marked *verify*. Anything still unconfirmed is
marked *verify* again, and the proof of concept in §E16 is where it gets settled.

**Status: a proposal, not a ruling.** `docs/ARCHITECTURE.md` describes the system that runs
today (SharePoint, no server of our own) and stays that way until something else is built.
`docs/TODO.md` D15 holds the living decision. This file is the dated analysis behind it.

**Why it was written.** Two facts weren't weighed when D15 was raised on 2026-10-01:

1. **Office is far more relational and rule-bound than Timeline.** Estimating, revisions,
   cost-code allocation, budgets and, later, estimate-versus-actual all depend on
   relationships, transactions and exact money.
2. **Development here is led by AI agents and run by non-programmers.** Claude writes most
   of the code under the repository's rules, the automated tests and human approval. So
   "it's code we would have to maintain" is a different cost from the one D15 assumed.

## Summary

- **What holds.** Every ruling that isn't about storage is untouched: the four peer products
  over one dataset, the ownership rule, Office next in project-cycle order, D4's static
  frontends, no platform change during the pilot, and the storage seam first. **The seam
  matters more now:** it is what lets Timeline move from `sharePointStore` to `apiStore`
  without rewriting the Gantt. It hasn't started yet: `index.html` has no `store` object.
- **What moves.** Office's needs push SharePoint lists from "the default" to "the weakest
  candidate for Office's core". Lists can't enforce a locked revision, run a multi-record
  operation as one transaction, hold exact decimal money, or protect a single column, and
  D3's list-splitting workaround becomes the "sprawl of lists" D3 itself ruled out.
  **Azure SQL + API rises from fallback to co-equal candidate with Dataverse.** Most of its
  extra cost was writing and testing conventional code, which is the work agents here do
  well. The parts that don't shrink are the human roles. Those must be named before a
  ruling.
- **Dataverse narrows but stays a real option.** It is still the only candidate that
  enforces per-column security with each user's own token and no code of ours. But once
  Office needs authoritative operations ("approve this estimate", "create a job from it"),
  Dataverse needs server-side plug-ins in C#: a second codebase anyway, and one with no
  local runtime for agents to test against.
- **Lean, not ruling:** C, Azure SQL + API, *if* the read-only proof of concept confirms
  cost, deployability and recoverability, and *if* item 44's discovery confirms that Office
  will hold line-item estimating rather than only an estimate reference. If Office turns out
  thin, SharePoint can carry it, and the case for moving weakens a lot.
- **Proposed D15 wording** (applied in `TODO.md` this PR): no platform change in Phase 7.
  Before Phase 8 provisions its registries, Dataverse and Azure SQL + API are co-equal
  candidates. SharePoint stays the platform for files and M365-native content, and for
  Timeline until the cutover. The seam and a backend-neutral schema go ahead whatever the
  ruling. D15 is ruled after four inputs: the Dataverse licence quote and spike, a small
  read-only Azure staging spike, item 44's scope answer, and named owners for whichever
  platform wins.

---

## A. Reconciliation report

### A1. What still holds, unchanged by storage technology

| Ruling or recommendation | Where | Why it survives |
|---|---|---|
| Four peer products, one portal, one shared dataset | TODO §1 | A dataset is a set of records with owners. It can live in lists, in Dataverse tables or in SQL tables |
| The ownership rule: create and delete only in the owning product | TODO §1 | Under an API it gets *stronger*: the API can refuse a create from the wrong product, which no list can |
| Office next, in project-cycle order (45 → 44 → 42/43 … 11) | TODO §1, §2 | Untouched. D15 changes what Office stands on, not when it comes |
| D4: one repo, one Pages site, a folder per product, static frontends, vendored `common.*` | TODO D4 | A backend is a separate deployable. The products stay static pages that call it. **No framework rewrite of Timeline:** that would be a second, unrelated architectural change |
| No platform change during the Phase 7 pilot | D15 (2026-10-01) | Still right: the pilot measures the workflow, not the storage |
| The data model is the expensive part, paid once | D15 | Still right, and it's why the gate is "rule before the Phase 8 schema is provisioned" |
| The storage seam goes first | Storage review idea 1 | Stronger: it is the migration path to an `apiStore` |
| D1's business rule: exactly one authoritative Project, never a permanent two-master sync | D1 | Platform-neutral (see the D1 rewrite) |
| D3's principle: hiding in the UI isn't security; one fact in one place; enforce at the data or service layer | D3 | Platform-neutral. Only the *mechanism* is SharePoint-specific |
| D10: names are display values, never join keys | D10 | Stronger under SQL (foreign keys) |
| D12's principle: an open browser must not re-download the whole company dataset | D12 | Platform-neutral |
| D13: CSV first; no secrets in a browser; every integration has a named owner | D13 | All three stay. Only "APIs *only* through Power Automate" was a consequence of having no backend |
| `docs/Automations.md`'s inventory rule | Automations.md, CLAUDE.md | A backend job is exactly the kind of process the rule exists for. No change needed |

### A2. The new information, and how it moves D15

**1. Office is relational.** The shape implied by the estimator (§F) and by items 42–45 and
11 is:

```
Client ─< Lead ─< Estimate ─< Estimate revision ─< Location ─< Item ─< Line (labor | material | install | …)
                                     │                                   └── priced from Catalog item @ Rate (dated)
                                     └── Approval (who, when, which revision)
Approved revision ──► Project ──► Cost code (unique, allocated once) ──► Budget ──► Actuals ──► Closeout
```

Timeline's data is mostly flat: projects, phases and events, joined by text IDs in the
browser. Office's data has six to ten levels, history that must not change after the fact
(a locked revision, the price a line was quoted at), and operations that must succeed or
fail as a whole (create the job, allocate its code, open its budget). The 2026-10-01
comparison gave transactions, unique keys and relations one row each. For Office they are
most of the design.

**2. Development is AI-agent-led.** The 2026-10-01 recommendation rested on "C turns security
into code we maintain". That was framed as a team without programmers taking on a server. In
practice:

- Claude already writes most changes, under `CLAUDE.md`'s rules.
- 108 test files gate every PR in CI, and the deploy guard is replayed in CI too.
- Git gives every change a history and a revert.
- Schema and infrastructure can be code (migrations, Bicep), and staging can isolate
  generated work from production.

The question becomes whether a small company can safely run a deliberately boring,
strongly tested API with AI agents, documented invariants and managed Azure services. §E14
answers it: **yes, on conditions**, and the conditions are about people, not code.

**3. Corrections to the 2026-10-01 table** found while checking it:

| 2026-10-01 row | Correction |
|---|---|
| C, "Running it: Highest: infrastructure, secrets, backups, monitoring, API releases" | Overstated for platform-as-a-service. Azure SQL Database is patched, highly available and backed up by Azure: automatic point-in-time restore, 7 days by default and configurable (*verify* the retention options). With managed identity there is no database password to hold. **We still own** application code, authorization, releases, schema migrations, the observability policy, restore drills, and cost and governance (§E14). That's real, but it is not running a SQL Server |
| C, "needs a hosted API (e.g. Static Web Apps + Functions)" | Static Web Apps' *managed* functions **don't support managed identity** (Microsoft's Static Web Apps docs). The frontends stay on GitHub Pages under D4 anyway, so Static Web Apps isn't needed: a standalone API (App Service or a Functions app) with CORS for the Pages origin is the shape |
| C, "Who enforces access: code we write" | True. But Entra still authenticates and signs every token. The code we'd write is the *authorization* decision, which is small, centralised and testable both ways (allowed and denied). Today, under A, no server enforces any workflow rule: every user has contribute rights on the site (`SETUP.md`), so a viewer's restrictions are UI-only |
| B, "Migration cost: storage seam + rows + flows rewired + licences" | Missing: authoritative domain operations. Dataverse covers simple validation and per-column security without code. Multi-record operations with rules (approve, lock, create a job from an estimate) need Custom APIs or plug-ins, written in C# and registered into the environment. Without them, the rules live in the browser, and any user with write rights on a table can bypass them through the Web API |
| A/B/C, "Company data already there … moving Timeline alone would recreate the two-masters problem" | The argument applies to B as much as C, and it is really D1's cost: whichever store wins D1, the dependents of the losing store (27 Events flows, Teams, the shop screen) are re-pointed or mirrored read-only for a period. Item 14 is what sizes that. It doesn't argue for a platform |
| B, "Cost: Power Apps premium per user … *verify*" | Checked against current pricing articles: Power Apps Premium is **$20 per user per month, rising to $22 on 2027-01-01**. Every user who reads Dataverse data through our page needs one, viewers included (Microsoft's multiplexing rules; *verify* with the tenant's reseller). Example: 10 users ≈ $2,600/year from 2027; 30 users ≈ $7,900/year |
| B, "Web API with MSAL delegated tokens (*verify* CORS from the Pages origin)" | Confirmed in principle: Microsoft documents a single-page app calling the Dataverse Web API with MSAL.js and CORS. The half-day spike still has to prove it from our origin |
| C, "Power Automate: SQL connector is premium; or HTTP to our API" | The HTTP action is premium too (*verify*). Either way, a flow that touches C needs a premium licence for the account it runs as, the same as one that touches B. The cheaper alternative under C: the API itself writes the few things flows need (an Outlook event, a Teams post, a SharePoint mirror row) |
| Rows missing from the table | Exact money; a test environment that runs locally; who enforces operation-level rules; reporting; where business logic is published (the repo and the Pages site are public). Added in §B |

### A3. SharePoint-specific assumptions in the current docs

Each line is correct today. It only needs a platform-neutral reading if D15 moves the
registries. The TODO edits in §D add that reading where a decision depends on it.

| Where | Assumption | Platform-neutral reading |
|---|---|---|
| TODO §1 point 1 | "The shared SharePoint registries are the source of truth" | Shared registries are the truth; the platform under them is D15 |
| TODO §1 point 4; D3 | Sensitive data is protected by SharePoint permissions with each user's token; "the list is the unit of protection" | Protection is enforced below the UI: by list or table permissions under A/B, or by server-side authorization under C |
| D4 refinement | "The portal shows tiles only for the products whose lists the user's token can read" | The portal shows the products the user is entitled to (under C, the API's `/me` says so) |
| D1 | "Which *list* becomes the registry" | Which record is authoritative, and which store holds it |
| D10, item 28 | "`spId` is the key until Clients get an `appId`" | Every entity gets a durable application ID. Store IDs become legacy columns |
| D11 | "lists instead of code" | Data instead of code: tables or lists |
| D12 | Graph `/items/delta` is the safe route | An incremental read is the route: Graph delta under A, change tracking under B, an `updatedSince` cursor plus tombstones under C |
| D13; §1 People row | "APIs only through Power Automate" | No secrets in a browser. A flow *or* a backend job, each with a named owner |
| item 15 | Weekly Export to Excel; version history | Under C: point-in-time restore plus a tested restore drill; the export becomes a report |
| item 17 | A cloned test site, or suffixed list names | Under B/C: a separate environment or database |
| item 42 | Collision-safe codes by "unique column + retry" | A unique constraint in a transaction |
| §6; the ⚠ convention; the tristate pattern | Robert applies list specs by hand; the app probes for columns live | Under C, schema is versioned migrations in Git, applied by the pipeline after approval. The tristate probing goes |
| Storage review ideas 2–4 | Provisioning script; site-scoped `Sites.Selected`; one shared registration | Idea 2 shrinks to files and test sites under B/C. Ideas 3–4 still apply to whatever Graph use remains |
| `CLAUDE.md`, `ARCHITECTURE.md`, `SETUP.md` | "Backend is SharePoint — no server of our own" | Current state, and correct. They change only when a backend is built |

Two small findings on the way, not fixed here: the `ARCHITECTURE.md` diagram lists 5 of the
nine lists (item 21's drift). And **two §3 items both carry the number 42**: the shipped
"Departments view: a project's line reads its Cost Code" (tracker #33) and Office's
"Cost-code generation". This review means the Office one whenever it says item 42. (Fixed
later the same day: the shipped one is now item 47.)

### A4. Where Azure SQL + API makes current recommendations stronger or weaker

**Stronger:** the ownership rule (the API refuses wrong-product writes); the seam (a store
swap); D10 (keys and foreign keys); item 42 (a unique constraint in a transaction is the
textbook answer); item 11 (the closeout states as an enforced state machine); D12 (a cursor
plus tombstones solves the deletion problem D12 calls out); D3 (per-field protection with no
list sprawl); item 17 (a real staging database); exact money; reporting (estimate vs actual
is a SQL query, and Power BI reads Azure SQL directly).

**Weaker, or new costs:**

- Per-user-token enforcement (D3's mechanism) is replaced by authorization code we own.
- Hand edits in the list UI go away unless admin screens are built.
- Flows lose their standard connector.
- Azure becomes something to administer: a subscription, billing, two environments.
- Entra gains an API registration (⚠).
- A second deploy pipeline appears.
- The public repository question (§A7, Q7) becomes sharper, because Office's pricing rules
  would live in public code.

### A5. Where Dataverse is still stronger than Azure

- **Security with each user's own token and no code of ours**, including column-level
  security profiles for cost, markup and HR fields.
- **Admin screens for free:** model-driven apps give hand-edit screens like the list UI has
  today.
- **Auditing built in:** who changed what, and when.
- **Native Power Automate.**
- **No infrastructure, and Microsoft-supported packaging** (solutions).
- **Fewer human roles to staff on day one:** no deploy pipeline, no restore drill of our own
  design.

Where it's weaker for *this* team:

- Licences for every user.
- Authoritative multi-record operations need C# plug-ins.
- Nothing runs locally, so agents test against a live environment.
- Schema and configuration live mostly in the environment, exported as solution files rather
  than written as code.
- A Dataverse-shaped schema is harder to leave later.

### A6. Where SharePoint stays right

- Documents and files: feedback screenshots, drawings, closeout paperwork.
- Teams and Outlook-adjacent content.
- Existing flows during a migration.
- Timeline through the pilot and until the Phase 8 cutover.
- Office, if item 44's discovery shows Office holds only an estimate *reference* (number,
  revision, dates), as item 44 is written today.

Moving off SharePoint *for structured business data* doesn't mean eliminating SharePoint.

### A7. Questions only people can answer (needed before D15 is ruled)

1. **How much is Office?** Does Office hold line-item estimating (Davis's estimator, §F, as
   the reference), or only an estimate reference with the estimate made elsewhere? This
   single answer moves D15 more than any technical fact. *Robert, Hubert, the Project
   Director, several PMs.*
2. **Who owns the platform?**
   - For C: who holds the Azure subscription and billing, who is the second administrator
     (continuity), who receives alerts, and who approves production migrations?
   - For B: who administers the Power Platform environment and licence assignment?
3. **Headcount and licences.** How many people would use Systems, viewers included, and does
   the tenant already hold any Power Apps or Power Automate premium licences? (Prices the
   Dataverse quote.)
4. **The permission tiers for Office**, before code exists (D3): who may see internal cost,
   markup and margin; who sees an estimate before it's sent; who approves an estimate; who
   sees budgets and actuals; who sees HR fields; who sees accounting and closeout data.
   Names of roles are not needed yet; the *boundaries* are.
5. **Roles: Entra or Systems?** Are roles assigned in Entra (app roles on groups, managed by
   the tenant admin) or in Systems' own data (managed in People or Office by an app admin)?
6. **Recovery acceptance.** How much data may be lost (an hour? a day?), and how long may
   Systems be down? This sets backup retention and the restore drill's pass mark.
7. **Public code.** The repository and the Pages site are public. Is it acceptable for
   Office's pricing logic and schema to be public, given secrets never are? If not:
   - under C, the `api/` code lives in a private repository;
   - under A/B, pricing logic in the browser is public whatever we do.
8. **The estimator's future** (§F): adopt its concepts, harden and absorb it, or keep it
   separate as an external tool that Office references?

---

## B. Decision comparison, for this repository and Phase 8

A = SharePoint lists (today) · B = Dataverse · C = Azure SQL Database + a TypeScript API.
"Backlog need" ties each row to an item or decision. Rows marked *verify* are settled by the
spikes.

| Need (backlog) | A. SharePoint lists | B. Dataverse | C. Azure SQL + API |
|---|---|---|---|
| Two people can't get the same cost code (item 42, Phase 8 "done when") | Unique indexed column + retry; no transaction around "allocate code + create job" | Alternate key or autonumber; a `$batch` changeset is atomic | Unique constraint inside one transaction with the job insert |
| Create a job from an approved estimate as one step (item 43) | Several independent writes; a half-done job is possible | Atomic via a changeset, but the *rule* ("only approved revisions") needs a plug-in or lives in the browser | One domain operation, one transaction, rule on the server |
| Locked estimate revisions stay unchanged (item 44) | Anyone with list edit rights can PATCH a locked row through Graph; item-level permissions don't scale (*verify* the limits) | Partly: column security plus a plug-in to refuse edits after lock | Enforced by the operation: locked revisions are read-only; a change makes a new revision |
| Price history: a quote keeps the rate it was quoted at (item 44) | Possible as copied values; no constraint stops edits | Copied values plus audit history | Snapshot rows plus a dated rate table; immutable by rule |
| Exact money | Number and Currency columns are floating point (*verify*); exact means integer cents or text | Decimal and Currency types | `DECIMAL(p,s)`; money travels as strings in JSON |
| Internal cost and markup hidden from some roles (D3, item 44) | Only by splitting every costed record into a public and a restricted list, joined by ID: the "sprawl of lists" D3 rejected | Column-level security, no code | Server-side projection per role, with tests that deny |
| HR fields restricted (items 26–27) | List split, as planned | Column security | Server-side projection, or a separate table with its own rule |
| Stable person and client assignments (D10, item 28) | Text IDs joined in the browser | Real lookups (relationships) | Foreign keys |
| Edit collisions (today the later save wins: `spSync` sends no `If-Match`) | `eTag` + `If-Match` available but unused | `If-Match` supported | `rowversion` → HTTP 409, a named error |
| Who changed what (audit; item 11's `closeoutBy` / `closeoutAt`) | Version history per item | Built-in auditing | Audit table written in the same transaction |
| Pick up others' edits without downloading everything (D12) | Graph delta (not built); the poll re-reads four lists every 90 s and Staff every 180 s | Change tracking (*verify* for the SPA) | `GET …?updatedSince=` cursor; soft deletes return as tombstones |
| Estimate vs actual, margin, reporting (Office later) | Power BI over lists; JSON columns must be flattened | Power BI connector; a read-only SQL endpoint (*verify*) | Plain SQL; Power BI reads Azure SQL directly |
| Staging separate from production (item 17) | A cloned site + the provisioning script (not built) | Separate environments; capacity costs | A separate resource group and database; free-tier staging is plausible |
| Agents can run real tests locally (§E12) | No: permissions and list behaviour only exist live; the harness stubs `fetch` | No local runtime; tests hit a live environment | Yes: a disposable SQL Server container in CI and on a laptop, plus API tests with no network |
| Browser calls it (D4) | Graph, as today | Web API + MSAL; CORS documented | Our API + MSAL token for its scope; CORS for the Pages origin |
| Power Automate | Standard connector | Premium connector | Premium (SQL or HTTP), or the API does the job itself |
| Hand edits without building screens | List UI | Model-driven app | None until admin screens are built |
| Files, documents | Native | Possible; SharePoint is still better | Stay in SharePoint (Graph) |
| Entra changes (⚠) | None new | Dataverse delegated permission on the SPA registration | An API registration (expose a scope); the SPA gets that permission; a deploy identity (federated, no secret) |
| Cost at this scale | Included in M365 | $20/user/month, $22 from 2027-01-01, every user, plus capacity | Tens of dollars a month for API + database + logs (*verify* in the POC). A serverless database kept awake by polling costs more, so D12 matters for cost too |
| Running it: what we still own | Lists, flows, the provisioning spec | Environment, solutions, licences, plug-ins if any | Code, authorization, migrations, releases, alerts, restore drills, cost (§E14) |
| Where business logic lives | Public browser code | Plug-ins in the environment, or public browser code | Server code: private if Q7 says so |
| Leaving later | Easy: plain rows | Harder: Dataverse-shaped schema, solutions | Easy: SQL is portable |

**What decides it.** Not the number of technologies. On the criteria this company actually
weighs (data integrity, security, maintainability by agents under human approval, custom
workflow freedom, recoverability, reasonable cost), A falls behind for Office's core.
Between B and C:

- **C leads** on integrity, custom operations, local testability and cost.
- **B leads** on security without code, ready-made admin screens, and fewer human roles on
  day one.

The spikes and the §A7 answers turn that into a ruling.

**A split platform is possible only as a transition.** Office creates projects and Timeline
schedules them (§1), so the Projects registry has one home, and D15 is effectively decided
by where Projects lives. With the seam, Timeline could read Projects from one store and its
phases from another for one release, but joining two stores in the browser is not a
destination.

---

## C. Recommended D15 wording

Applied in `docs/TODO.md` §4 D15 in this PR, as a dated reassessment *below* the
2026-10-01 text. The original analysis is kept and labelled superseded, not deleted. The
review supports the hypothesis it was asked to test, with two additions: item 44's scope
answer is an input, and named human owners are a precondition.

## D. Related TODO changes made in this PR

| Section | Change | Why |
|---|---|---|
| Header "Last reviewed" | 2026-10-08 | Convention |
| §1 points 1 and 4 | A parenthesis: the registry rule and the enforcement rule hold on any platform; the platform is D15 | They read as SharePoint-only today |
| §2 Phase 8 row | "shared lists" → "shared registries (lists or tables, D15)" | Storage-neutral |
| §2 "Open, and what they wait on" | D15's inputs rewritten (four inputs; the gate unchanged) | The reassessment |
| item 14 | Notes that the comparison is needed on any platform: it's the business knowledge that migrates | D1 rewrite |
| item 17 | Under B/C staging is a separate environment, mandatory before any write path; preview → staging; agents never need production data | Ties staging to D15 instead of a separate initiative |
| item 44 | Davis's estimator as reference material; the discovery questions; "validate before canonizing" | §F |
| D1 | Business ruling separated from storage; under B/C the answer may be a new `Projects` table | The new framing |
| D3 | The principle kept; a conditional mechanism for C; the permission decisions people must make first | §A7 Q4–5 |
| D10 | Durable UUIDs as the target identity; store IDs become legacy columns | The new framing |
| D11 | The relational form (Departments, Closures, a join to people) | The new framing |
| D12 | Reframed as a read and sync budget on any platform | The new framing |
| D13 | Adds the backend-job option; CSV first unchanged | The new framing |
| D15 | Status → "reassessed 2026-10-08"; reassessment text, corrections, inputs, reopen and close triggers | The decision |
| §5 | Four new rows: estimator walkthrough, PM estimate samples, platform ownership, licence inventory | §A7 |
| §6 | One note: under B/C a schema change is a migration | The ⚠ convention's future form |
| §7.4 | Two ledger entries: backend guardrails not yet in `CLAUDE.md`; no Azure setup doc yet | The deferred-ledger rule |
| §8 log | The 2026-10-08 entry | Convention |

Not changed: `CLAUDE.md`, `SETUP.md` and `Automations.md` (they describe what runs, and no
backend runs). `ARCHITECTURE.md` gets one pointer sentence. The 2026-09-29 storage review
gets a successor pointer under its header.

---

## E. The candidate architecture: Azure SQL + a Systems API

Nothing below is built, approved or provisioned. It is what the spike would test.

### E1. Target shape

```
GitHub Pages: static Systems products (portal, Timeline, Office, People, Clients)
        │  MSAL sign-in (Entra, delegated PKCE, as today)
        │  Bearer token for the Systems API's own scope
        ▼
TwoSeven Systems API  (TypeScript, Node LTS)
        │  validate token → identify person → authorize → rule → transaction → audit
        │  managed identity, no password
        ▼
Azure SQL Database                         Microsoft Graph (unchanged where it fits)
                                           ├─ SharePoint files and documents
                                           ├─ Teams membership (picker)
                                           └─ Mail.Send (feedback mail)
```

The division of labour:

- **Azure SQL** holds structured operational and business data.
- **SharePoint** holds files, documents and M365-native content.
- **The API** owns business rules, authorization and controlled data access.
- **The browser products** own interaction and presentation.

The browser keeps calling Graph directly for what Graph is good at. The storage review's
`store.people()`, `store.mail()` and `store.upload()` stay Microsoft calls.

### E2. Two kinds of API, deliberately different

1. **The migration compatibility layer (Timeline).** Timeline → `apiStore` → `/api/<kind>`
   → SQL. It is CRUD-shaped on purpose: `list`, `create`, `update`, `remove` mirror the
   seam's `store` (storage review §1d), so the Gantt, the scheduler and the project page
   don't change. Even here the API checks the caller's role (a viewer can't write) and the
   version (no silent overwrite). That is already more than today, where a viewer's limits
   are UI-only.
2. **The domain API (Office, and new work generally).** Explicit operations, never "update
   any row":

   ```
   createLead · createEstimate · createEstimateRevision · lockEstimateRevision ·
   approveEstimate · allocateCostCode · createJobFromApprovedEstimate · (later) submitCloseout
   ```

   Each operation validates, authorizes, applies its rule and writes in one transaction with
   an audit row. A browser can't reproduce the rule by writing rows, because there is no
   endpoint that writes arbitrary rows.

The seam's CRUD interface must not become the pattern for new products. Over time, Timeline
endpoints can grow domain operations too (for example "move phase" with its own checks),
but only when a rule needs it.

### E3. The security boundary

- **Authentication.** Entra, as today.
  - The SPA asks MSAL for a token whose audience is the Systems API (a scope such as
    `Systems.Access`; the name is a decision).
  - The API validates every token itself: signature against Entra's published keys, issuer,
    tenant, audience and scope. This uses a standard library such as `jose`. It is small,
    and testable locally with signed test tokens.
  - App Service's built-in authentication can sit in front as an outer gate, but the
    in-code check is the one tests prove.
- **Identity.** The token's `oid` (the Entra object ID) maps to a person in People. The API
  never trusts a name or email sent by the browser.
- **Authorization.** One function per operation decides "may this person do this to this
  record". Roles come from Entra app roles or a Systems table (§A7 Q5). The browser hides
  what a person can't use, as a workflow aid only.
- **Field protection.** Responses are projected per role on the server. The estimate an
  estimator sees includes cost and markup; the one a viewer sees doesn't. Tests assert both.
- **Database access.** Through the API's managed identity only. Microsoft Entra-only
  authentication on the server, with SQL logins off (*verify* in the spike). No browser ever
  reaches the database.
- **Deploys.** GitHub Actions signs in to Azure with a federated credential (OIDC): no
  stored secret, nothing that expires in two years (the bot's 2028-09-23 secret is the
  counter-example).
- ⚠ **Entra changes this needs:**
  - an API app registration exposing the scope;
  - a delegated permission on the SPA registration, admin-consented;
  - federated credentials for the deploy identity;
  - a separate staging registration, so a staging token can never open production
    (recommended; a decision).

  Each needs explicit instruction under `CLAUDE.md`.

### E4. Hosting: App Service or Functions

| | **A. App Service (Linux) + Fastify** | **B. Azure Functions (Flex Consumption)** |
|---|---|---|
| Mental model | One ordinary Node server: routes, services, repositories | A set of triggered functions, or one HTTP function wrapping a router, plus `host.json` and a required storage account |
| Local development | `npm start`, the same process as production | Functions Core Tools plus a storage emulator |
| Tests | Fastify's `inject()` runs requests in-process, no network | Possible, but each trigger's binding layer is extra surface |
| Entra token validation | In code (both plans); built-in auth optional | Same |
| Managed identity → SQL | Supported | Supported |
| Deployment | `zip deploy` or `azure/webapps-deploy` from Actions | `func` or Actions deploy; Flex is the current recommended serverless plan (Linux Consumption retires 2028-09-30) |
| Cold starts | None on a paid always-on tier | Possible; Flex reduces them |
| Logging | Application Insights via OpenTelemetry | Same, plus the Functions host's own logs |
| Cost at this scale | One small basic-tier plan, roughly $13/month (*verify*); staging possibly on a free tier (*verify* managed identity there) | Near zero when idle, plus storage and logs |
| For agents and non-programmers | Highest: the most conventional shape there is | Good, with more platform concepts to keep right |

**Recommend App Service + Fastify** for the POC and beyond. The idle-cost saving of
Functions is a few dollars a month, and every other row favours the plain server. Not
considered, on purpose, because nothing requires them: containers or Kubernetes, queues,
Redis, event buses, microservices. A background job (D13) runs in the same app until volume
says otherwise.

### E5. Data access: Prisma or a plain driver

The criterion is passwordless production access with reproducible migrations, not a brand.

- **Prisma.** Davis has used it successfully, and its schema file is a machine-readable
  contract that suits agents. Current Prisma connects to SQL Server through the
  `@prisma/adapter-mssql` driver adapter. Its README shows Entra authentication through the
  `mssql`/tedious config object, `authentication: { type: 'azure-active-directory-default' }`,
  which resolves to the managed identity in Azure and to `az login` on a laptop.
  *Verify in the spike:* token refresh on long-lived pools, and whether `prisma migrate
  deploy` can authenticate the same way. If it can't, the generated `migration.sql` files
  are applied by a pipeline step with `go-sqlcmd`, which supports Entra authentication,
  under the deploy identity.
- **A plain driver** (`mssql`) with SQL migration files and a ~50-line runner, if Prisma
  fights the identity pattern.

Either way, the contract is the migrations plus the tests, not the library.

### E6. Backend structure (illustrative, not a ruling)

```
api/
  src/
    auth/        token validation, oid → person, role lookup
    projects/    routes · validation (JSON Schema) · service (rules) · repository (SQL)
    clients/  people/  estimates/  costCodes/
    audit/       one writer, called inside each transaction
    db/          connection (managed identity), transactions, migrations/
  test/          unit · integration (real SQL) · authz allow/deny · contract
infra/           Bicep: main.bicep + staging/production parameter files
```

Every request follows one path: route → validate → identify → authorize → rule →
transaction → audit → response. Fastify validates with JSON Schema natively, so the same
schemas become the frontend/API contract (§E12).

### E7. Database rules

- **IDs (D10):**
  - `UNIQUEIDENTIFIER` primary keys, never reused. The browser may generate them, which
    keeps today's optimistic creates working.
  - Today's `appId` values (`genId()`: a time stamp plus six random characters, not a UUID)
    and SharePoint item IDs (`spId`) are kept as `legacyAppId` / `legacySpId` columns for
    the migration, and rewritten into references once by the import script.
  - Names never join anything.
- **Money:** `DECIMAL` with a precision chosen per field, never `float`. Strings in JSON.
  Rounding rules written down with item 44.
- **Concurrency:** a `rowversion` on every mutable table. An update without the current
  version fails with `409 <ENTITY>_VERSION_CONFLICT`. The UI already has a Details pattern
  for errors (`toast()`).
- **Deletes:** archive, void or supersede, never hard-delete, for business and financial
  records. A soft delete also gives D12 its deletions.
- **History:** a locked estimate revision is immutable, and a change creates a new revision.
  Quoted lines snapshot the catalog rate and its date. Rates themselves are dated rows.
- **Audit:** actor (person ID), time, operation and record, written in the same transaction
  as the change.
- **Relations:** foreign keys everywhere; join tables for many-to-many (people ↔ departments,
  phase ↔ crew).

### E8. Staging and environments (item 17)

| | Development / preview | Production |
|---|---|---|
| Frontend | `/preview/` (from `development`) | `/` (from `main`) |
| API | staging API app | production API app |
| Database | staging Azure SQL (synthetic or sanitized data) | production Azure SQL |
| Entra | staging API registration (recommended) | production API registration |
| Resource group | `rg-systems-staging` (name illustrative) | `rg-systems-prod` |

- The frontend picks its API by its own path: `/preview/` → staging. The Pages workflow
  stays identical on both branches (the D4 / deploy-workflow rule).
- No agent needs production data to build ordinary features.
- Staging gives backend work a safe, closed loop: migrations, integration tests,
  authorization tests, destructive fixtures, concurrency tests.
- Production data reaches staging only sanitized, with HR and financial fields dropped or
  synthesized.
- **Under C, a separate staging database is mandatory before any write path exists.**
- It also fixes today's problem, where `/preview/` writes live lists.

### E9. Schema change and migrations

The ⚠ convention survives in a new form. Today Robert applies a list spec by hand. Under C:

1. Claude writes a migration in Git.
2. CI applies it to a throwaway database and runs the tests.
3. The pipeline applies it to staging.
4. Production waits on an explicit approval: a GitHub environment with a required reviewer,
   which the owner's account can approve.

Destructive migrations (drop, rename, type change, moving data) still get a milestone record
naming what breaks and how rows migrate, and need the owner's explicit go.

### E10. Observability

- Application Insights through the Azure Monitor OpenTelemetry distribution for Node.
- **Every request logs:** request ID, the caller's `oid`, route or operation, status, a
  non-sensitive error code, and duration.
- **Never logged:** tokens, secrets, request bodies with money or HR data, names or emails.
- The request ID goes back in a response header and appears in the toast's Details, so a
  report reads `PATCH /api/projects/… → 409 PROJECT_VERSION_CONFLICT (req 7f3a…)` and an
  agent investigates evidence instead of guessing why Save "didn't work".
- Alerts on error rate and on failed deploys go to a *named* person (§A7 Q2).

### E11. Infrastructure as code

**Bicep** (Microsoft's Azure-native language) in `infra/` defines everything: resource
groups, the App Service plan and app, the SQL server and database, Entra-only
authentication, the managed identity and its database role, Application Insights and the
alert rules.

- A PR shows `what-if` output.
- Deploys run from Actions.
- Staging and production differ only in parameter files.
- Portal clicks are for looking, not for changing. Anything clicked in an emergency is
  written back into Bicep the same day.

### E12. Testing model

The Timeline harness (jsdom, `fetch` stubbed, Graph bodies recorded) stays. Every seam PR
must keep it green **with no assertion edits**, the storage review's neutrality proof.
Backend work adds four layers:

1. **API and unit tests:** validation, service rules, permissions; in-process, no network.
2. **SQL integration tests:** a disposable SQL Server container in CI. It is test
   infrastructure, not runtime architecture, and its password is generated per run, never
   committed. Tests create, read, update and archive records; check relations, transaction
   rollback and uniqueness under concurrency.
3. **Contract tests:** the API's JSON Schemas are exported, and `apiStore`'s tests assert its
   requests and its handling of responses against them.
4. **Domain tests (as Office grows):**
   - a known real estimate reproduces its numbers;
   - a locked revision doesn't change when catalog prices do;
   - a role without approval rights gets 403 from `approveEstimate`;
   - two concurrent `allocateCostCode` calls never return the same code;
   - an approval records the right actor;
   - `createJobFromApprovedEstimate` either completes or leaves nothing behind.

The safety mechanism is that CI mechanically rejects bad work, not that Claude reviewed its
own code. Every authorization rule has an allowed *and* a denied test.

### E13. Local SQL Server: ranked below Azure SQL

Technically viable, and not a Phase 8 candidate without new evidence:

- TwoSeven would own patching, hardware, power and network failures, and an offsite backup
  strategy.
- Remote access and an on-premises data gateway would be needed for cloud flows and Power
  BI.
- High availability and disaster recovery would be ours to design.
- Key-person dependency rises.

Azure SQL's price at this scale is lower than any one of those risks.

### E14. The AI-agent development model, assessed

**The rule:** humans define the business system and its invariants. AI agents implement and
test them. Not: the AI decides the architecture as it goes.

**Claude can be expected to write:**

- TypeScript API code; SQL schema and migrations; repositories;
- request validation;
- unit, integration, authorization and contract tests;
- the migration and import tools; `apiStore`;
- CI/CD workflows and Bicep;
- logging instrumentation and documentation.

**Humans define and approve:**

- what each entity means;
- financial rules; permission boundaries and role definitions;
- who sees financial and HR data;
- destructive schema changes and production migrations;
- Entra and authentication changes;
- the backup and recovery acceptance criteria.

**Why C becomes more viable under this model.** The dominant cost of a custom API is
writing, testing and keeping consistent a lot of conventional code. That's where agents are
strongest, and where this repository already has the habits:

- tests on every PR;
- one short branch per change;
- milestone records;
- rules in `CLAUDE.md`;
- CI that has caught real mistakes, such as the deploy guard reading comments, which was
  caught in CI from PR #101 on.

A typed TypeScript and SQL stack gives agents machine-checkable constraints: the compiler,
the schema, the migrations, the tests. A local database gives them a closed feedback loop.
Neither SharePoint nor Dataverse offers that loop: their behaviour, permissions above all,
only exists live.

**What doesn't get cheaper** (so it must be staffed, not assumed):

- Someone decides the invariants, and someone reviews every security-relevant diff for
  *intent*, not syntax.
- Someone receives the alert at 8 a.m. and can follow the runbook. Agents investigate; a
  person decides to roll back.
- Someone holds the Azure subscription, the bill and the Entra admin rights, and a second
  person can do the same (item 16's backup maintainer, extended).
- Restore drills happen on a calendar, and are recorded.
- The stakes rise. A Timeline bug mis-draws a bar; an Office bug can expose margin or approve
  the wrong revision. Deny-tests and server-side projection are the mitigations, and they're
  mandatory, not optional.

**Verdict.** A deliberately boring, strongly tested TypeScript API on managed Azure is
maintainable by this company *with* agents, *if* the human roles in §A7 Q2 are named and the
guardrails in §E15 are in force before the first backend line is merged. If they can't be
named, B is the safer choice despite its costs.

### E15. Proposed backend guardrails (not in force)

To be added to `CLAUDE.md`, or a linked hard-rules file, **when backend work is
authorized**, not before (ledger entry in TODO §7.4). The classification is this review's
proposal.

| # | Rule | Proposed status |
|---|---|---|
| 1 | Browsers never connect directly to the database | Hard invariant |
| 2 | No database credentials in browser code or Git (a CI container's per-run password is generated, never committed) | Hard invariant |
| 3 | Services authenticate with managed identity or federated credentials; a stored secret needs a written reason and an expiry entry | Hard invariant |
| 4 | Every non-public API request is authenticated | Hard invariant |
| 5 | Authorization is enforced on the server; UI hiding is workflow only | Hard invariant |
| 6 | Input is validated at the API boundary (JSON Schema) | Hard invariant |
| 7 | Money is fixed decimal: `DECIMAL` in SQL, strings in JSON, never floating point | Hard invariant |
| 8 | IDs are stable, never reused, never names | Hard invariant |
| 9 | Business and financial records are archived, voided or superseded, never hard-deleted | **Needs a ruling:** which records count, and what each state means |
| 10 | Schema changes are versioned migrations in Git | Hard invariant |
| 11 | Destructive migrations need explicit human approval and a milestone record | Hard invariant (the approver is named under 14) |
| 12 | Important mutations record actor and time | **Needs a ruling:** the list of "important", and how long audit is kept |
| 13 | Multi-record business operations run in one transaction | Hard invariant |
| 14 | Production migrations and deploys pass an explicit approval gate | **Needs a ruling:** who approves; a GitHub environment with a required reviewer is the mechanism |
| 15 | Entra permissions are never broadened to make an error go away | Hard invariant (extends `CLAUDE.md`'s Entra rule) |
| 16 | Secrets never enter prompts, commits or logs | Hard invariant |
| 17 | Staging and production data are separate; production data enters staging only sanitized | Hard invariant |
| 18 | Every authorization rule has an allowed and a denied test | Hard invariant |
| 19 | Responses carry only the fields the caller may see (server-side projection) | Hard invariant (added by this review) |
| 20 | Queries are parameterized; no SQL built by string concatenation | Hard invariant (added by this review) |

### E16. Proof of concept, if C survives this review

**Prerequisite (useful whatever D15 says):** the storage seam's first PRs. At least PR 1 (the
`store` object) and PR 2 (Projects, Tasks, To-dos, Events) from the storage review's
sequence, with `npm test` green and no assertion edits.

**Then, only after explicit approval to create Azure and Entra resources:**

1. Isolated staging infrastructure from Bicep (one resource group).
2. A TypeScript API scaffold (App Service, Fastify).
3. Entra-authenticated access to the API (⚠ the registrations in §E3).
4. API → staging Azure SQL through managed identity, passwordless if the stack supports it
   (the §E5 checks).
5. A minimal Project schema, from the canonical shape the mappers define today
   (`projToFields` / `fieldsToProj`).
6. A sanitized or synthetic subset of Project rows.
7. Only three endpoints: `GET /api/me`, `GET /api/projects` and `GET /api/projects/{id}`.
8. An `apiStore` in Timeline *preview*, behind a developer-only switch. With it on, preview
   reads projects from the API and refuses saves; a check compares the records both stores
   produce.
9. A comparison of the rendered and read behaviour against SharePoint.
10. Structured logging and the four test layers, at POC size.
11. **No production writes, and no production data beyond the sanitized subset.**

**It must answer:**

- Can Claude build and keep the API clean under this repo's process?
- Is the Entra and API authentication understandable, and recoverable when it breaks?
- Is a deploy and redeploy reproducible from Git alone?
- Does Timeline behave the same through `apiStore`?
- Can a non-programmer follow the docs and the recovery path?
- What is the real monthly cost, with polling switched on?
- What operating burden actually appeared?

**Exit and rollback:** switch the developer flag off, and delete the resource group and the
staging registration. Nothing in production changed, so nothing needs restoring.

**Only after this: one write path, as a vertical slice.** Project update, with validation,
authorization, the version check, the write, the audit row, and integration tests for each.
Once one complete slice works, the remaining CRUD is repetition, not the main uncertainty.

---

## F. Office item 44: Davis's estimator as discovery material

Davis has built a working estimator. Per the description given for this review (its code
isn't in this repository and wasn't read), it is:

- a Next.js / TypeScript server application on a relational database, with Prisma;
- pricing logic kept apart from the database;
- money in exact decimals.

Item 44 should treat it as a **reference implementation and domain-discovery artifact for
Office estimating**, not as an unrelated side tool, and not as a schema to port wholesale.

**Concepts worth carrying into Office's design (to validate, not to assume):**

- **Pricing:** labor, material and install pricing; flat-rate versus per-item rules; shared
  or common costs allocated across locations; catalog and rate data.
- **History:** locked historical estimate versions; comparing estimates, with changes
  highlighted.
- **Structure:** one estimate-section model feeding several outputs; duplication and
  templates; saved line bundles.
- **Speed:** fuzzy catalog search; spreadsheet-speed keyboard work; bulk markup changes.
- **Output and checks:** client-facing print output; pricing tests against real estimates.

The last is the most transferable asset. A database-independent pricing engine *with its
tests* can move into any of A, B or C, and fits C's language directly.

**Prototype limits that Office must not inherit:**

- one shared team password instead of individual identities;
- an incomplete actor and audit trail;
- hard deletes;
- backups not fully automated;
- its own client and project records, which become duplicate masters (D1) if the tool is
  bolted beside Systems.

Under the ownership rule, an estimator inside Systems *reads* Clients and Projects; it never
keeps its own.

**Before any schema is canonized, item 44 runs discovery.** The question is whether the model
fits *TwoSeven's* estimating, not only one estimator's practice:

1. **Walk-throughs with several PMs.** Each brings two or three recent estimates of
   different shapes: single-location versus multi-location, install-heavy versus
   fabrication-heavy, a job with heavy outside services. Each estimate is re-entered in the
   estimator's model, and every place it doesn't fit is noted.
2. **A cost-taxonomy check.** Ask, don't assume, whether estimates need to carry:
   - subcontracting, freight or trucking, rentals, travel, engineering, specialty vendors;
   - contingency, PM and design time, rush or overtime;
   - client-supplied items, allowances.
3. **The layers of an estimate.** Does Office separate internal estimated cost → risk or
   contingency → markup or margin logic → client price, explicitly and per line? That
   separation is what estimate-versus-actual, labor and material variance, project margin
   and profitability analysis are later computed from. It also defines the permission tiers
   (§A7 Q4).
4. **Revision semantics.** What makes a new revision versus an edit? What locks, and when?
   Who approves? What does the client see?
5. **Catalog ownership.** Who maintains rates, how often, and with what history?
6. **The hand-off.** How an approved estimate becomes a job, its cost code and budget (items
   42, 43) and the QuickBooks / TCP export (D13).
7. **The tool's future** (§A7 Q8): adopt the concepts in Office; harden the estimator and
   absorb it as Office's estimating module (individual sign-in, audit, soft deletes,
   backups, the registries); or keep it external and have Office reference its estimates.

None of this is ruled. Item 44 stays intentionally under-specified until the discovery is
done, and its answer to Q1 is an input to D15.

---

## Sources checked (2026-10-08)

- Microsoft Learn: Dataverse, "Use OAuth with Cross-Origin Resource Sharing to connect a
  Single Page Application", and the SPA quick start with MSAL.js.
- Microsoft Learn: Azure SQL Database free offer (100,000 vCore-seconds and 32 GB per
  database per month, up to 10 databases per subscription; auto-pause or continue-billing
  when used up).
- Microsoft Learn: Static Web Apps, "API support with Azure Functions" (managed functions
  don't support managed identity; bring-your-own Functions apps do).
- Microsoft Learn: Azure Functions hosting (Flex Consumption recommended; Linux Consumption
  retires 2028-09-30).
- Microsoft Learn: Functions access to Azure SQL with managed identity.
- Prisma `@prisma/adapter-mssql` README and npm page (Entra authentication through the
  `mssql`/tedious config object), and prisma/prisma PR #28156 (Entra parameters in the
  adapter).
- Power Apps Premium pricing: third-party licensing summaries quoting Microsoft's $20 per
  user per month and message-center notice MC1470566 ($22 from 2027-01-01). Confirm with the
  tenant's reseller before the ruling.
