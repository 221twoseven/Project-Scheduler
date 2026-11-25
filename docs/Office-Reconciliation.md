# Office reconciliation — the Office wireframe against the plan

**2026-11-25.** Future-state planning, not current-state documentation. **Ruled the same
day (owner: "Approve all", item 102):** refinements 1–4 are recorded in `Decisions.md`
("What we're building", Office's shape); new items A, B and C are items 103, 104 and 105;
the extensions in §3 and the fixes in §9 are applied in `TODO.md`. The rest of this
report is the reasoning as proposed, kept as written. The wireframe
reviewed is `TwoSeven-Office-Wireframe.html` (Concept 01, the owner's desktop; not in the
repository). Its records, sums, JavaScript state and permissions are illustrative and are
not read as a specification, schema or implementation reference.

Read with: [`TODO.md`](TODO.md), [`Decisions.md`](Decisions.md),
[`Architecture-Review-Backend.md`](Architecture-Review-Backend.md),
[`TwoSeven-Application-Style-Guide.md`](../design/TwoSeven-Application-Style-Guide.md).

## Summary

- **Most of the wireframe is already planned.** Leads (item 45), estimates (item 44), cost
  codes (items 13, 42), job creation (item 43), closeout and billing (items 10, 11, 22),
  past projects (item 95) and role views (items 26, 30) cover it. They are extended below,
  not duplicated.
- **Three things are genuinely new:** a project register with one project record
  (project-centred navigation), active-project financials and portfolio reports, and
  client contacts and details. Each is proposed as a new item.
- **One earlier ruling would change.** On 2026-11-19 setup and closeout were placed "on the
  client's record". The wireframe puts them on a *project* record that the client's record
  links to. This report recommends that, as a refinement for the owner to approve.
- **The register's stages should be worked out, not stored.** Leads → Closed is a view over
  independent facts (lead outcome, estimate state, job opened, production status,
  closeout status, billing status). No single `stage` field.
- **Anything with money waits for the Systems API.** SharePoint can't protect a column, and
  every site member can read every list, so estimate prices, budgets and actuals can't live
  in a list. Leads and estimates also shouldn't be built on lists and migrated later (the
  data-platform gate: rows move at most once). Stages D and E below wait on item 51 and the
  platform ruling.
- **The launch is untouched.** The one thing buildable before the backend, a read-only
  project register over data Office already reads, comes after the launch.

## 1. Current state

| Area | What exists (as of 2026-11-25, `development` v1.62.8) |
|---|---|
| Office (`office/`) | Admins only (`rosterAdmin`). A client list (name, cost-code alias — the only two fields `ShopTimeline_Clients` holds) and a client's record: Details, Current projects (status, dates, phases now and next, team, a link into Timeline), Project history (Timeline's finished projects plus `ShopTimeline_PastProjects` rows, tagged "Before Timeline"). Office creates, changes and removes clients and past projects; it reads Projects, phases, Staff and Config. No leads, estimates, cost codes, money, closeout or tabs. |
| Timeline (`timeline/`) | Creates projects on New Project (name, client, free-text `jobCode`, install date, team). Project `status`: auto / forecast / active / on-hold / complete; Automatic turns Complete when the last install or shipping bar ends (item 10). A forecast is a Timeline project, not a lead. |
| People (`people/`) | The roster. No HR-restricted fields yet (items 26, 27). |
| Shared (`common/`) | Sign-in, the `store` data layer over SharePoint, the shell, the Apps menu, shared data rules (status, due date, readers). Stable IDs ride beside names in `refs` (item 28). |
| Backend (`api/`, `infra/`) | Item 51 steps 1–3 merged: staging Bicep (`what-if` only), a Fastify API with Entra token validation, `GET /api/me`, `GET /api/projects`, `GET /api/projects/{id}`, one migration (`dbo.Project`, shaped from Timeline's fields, `rowVersion`, legacy IDs). Nothing deployed. No Office entities, no writes. |
| Permissions | Admin / viewer / developer, per-feature viewer grants in Config. UI hiding only; every signed-in user can read every list. |

## 2. Feature reconciliation

Categories: **Built** · **Planned** (in an item as is) · **Elaborates** (an item, with more
detail) · **New** · **Conflicts** (with a decision or an item) · **Waits** (on discovery or a
ruling).

### Navigation and pages

| Wireframe feature | Category | Where it lands | Notes |
|---|---|---|---|
| Left rail: Overview, Projects, Clients, Reports, Administration | New / Elaborates | New item A (register); style guide §2 | The style guide already gives multi-section apps the rail. Show only built, authorized destinations: Reports and Administration don't appear until they have content. |
| Clients section: client index beside a record | Built | item 86, 92 | Exists. Sector, primary contact and email are **New** (item C): today a client is a name and an alias. |
| Client record → its projects | Built | item 92, 93 | Rows would link to the new project record instead of only to Timeline. |
| Projects register: all projects, stage filter, search, client and PM filters | New | item A | Includes past projects (item 95) and, once they exist, leads (item 45). |
| Project record with tabs (Overview, Estimate, Project Open, Schedule, Financials, Closeout, Documents, Activity) | New, each tab Planned in its item | item A (the shell); 44, 43, 11, new item B | The shell is new; each tab arrives with the item that owns its data, and only when it has data (a past project shows no Estimate or Closeout tab). |
| Overview: metric tiles, Needs Attention, Current Projects, Project Open and Project Close panels | Elaborates | 45, 44, 43, 11 | Each workflow item adds its queue. Before any of them ships, an Overview would only repeat Timeline's My Dashboard, so it is created with the first queue (item 45), not before. |
| Reports | New, Waits | item B | Needs field definitions, sources and permissions first. |
| Administration: cost-code registry, integrations, access | Elaborates, Waits | 13, 42; the integrations decision; item 30 | Content depends on those rulings; no page before then. |
| "Review as" role selector | Not a feature | — | A design-review device. Production roles come from the signed-in identity, and a person can hold several grants. |
| `+ New lead` | Planned | item 45 | Who may create leads is open (decision register, H). |
| `Open in Timeline ↗` | Built | item 92 | Office already links projects into Timeline by stable ID. |

### Lifecycle and workflows

| Wireframe feature | Category | Where it lands | Notes |
|---|---|---|---|
| Stages Leads / Estimates / Ready to open / Active / Closing out / Closed | Conflicts as built in the wireframe; fine as a view | items 45, 44, 43, 10, 11 | The wireframe stores one mutable `stage` and folds billing into closeout (`close: 'Invoiced'`). Item 11 keeps project status, closeout status and billing status separate. See §5. |
| Leads and jobs in one list | Fine as a view | item 45 | One interface, separate records: a lead exists before the job, and one lead may yield zero, one or (open question A) several jobs. |
| Estimate record, revision history, approval | Planned / Elaborates | item 44 | Adds visible states (draft, sent, approved, superseded). The wireframe's "Create revision" marks the revision Sent at once, skipping draft; send and create are separate events. The Estimate Structure panel's work packages are not a cost taxonomy. |
| Record client approval | Elaborates | item 44 | Evidence of approval (email, signed estimate, PO) and who records it are open (B). |
| Opening checklist (5 checks) and Open project | Elaborates | items 43, 42, 5 | Two checks are out of order: "TimeClock+ handoff prepared" and "Accounting setup reviewed" can't be done before the cost code exists, and the code is allocated *at* opening. They belong after allocation, as handoff tracking (§5). |
| Cost code allocated at opening (`ALD-DEMO-1`) | Planned | items 13, 42 | Format is illustrative; the real rules are item 13's inventory. Alias + sequence matches item 42's working assumption. |
| Opening sets actual, committed and billed to $0 | Conflicts | item B | Contradicts the wireframe's own rule that missing isn't zero. A new job has *no* imported actuals, not zero actuals. |
| Edit details can change an active project's client | Conflicts | items 42, 28 | The cost code carries the client's alias. Changing the client after a code exists needs a rule (block, or re-code under control). |
| Date certainty shown from the stage | Conflicts | item 5 | Certainty belongs to the date and follows the Project Director's rules, not the project's stage. |
| PM closeout checklist (4 confirmations) | Elaborates | item 11 | Compatible with "one minute, no budget or line items" if each line is a confirmation, not data entry. Wording is the Project Director's. |
| Director verify / return / hold | Planned | item 11 | The wireframe has no Hold for the Director (item 11 has one) and uses "Leadership" for a Project Director action. |
| Bookkeeper: invoice sent, accounting exception, resolve | Planned / Elaborates | item 11 | "Resolve exception" is new. |
| "Confirm reconciliation & close" | New, Waits | item 11 | An extra step and approval beyond item 11. Needs the business ruling in F. |
| Closeout aging, overdue, reminders | Planned; missing in the wireframe | items 11, 10 | The wireframe shows no age or overdue mark. Item 11 ages from the last scheduled work date. |
| AMPM Meeting Sheet reads closeout | Planned | item 22 | Not shown; unaffected. |
| Historical projects in the same register, no fake estimate or closeout | Planned / Elaborates | item 95 | The wireframe gets this right (`legacy` hides the tabs). Provenance stays in the data even when the "Before Timeline" tag goes. |

### Money, documents, activity

| Wireframe feature | Category | Where it lands | Notes |
|---|---|---|---|
| Commercial summary: approved value, cost budget, actual cost | Elaborates / New | item 44 ("budget views"), item B | Approved value and budget come from the locked estimate (item 44). Actuals are new (item B). |
| Financials tab: commitments, cost to finish, forecast cost, variance, margin, billing | New, Waits | item B | Every measure needs a source, a freshness and a definition (§5). |
| Purchasing role sees full Financials | Conflicts | items 26, 30 | The wireframe hides estimates from Purchasing but shows it budget and margin. Who sees cost and margin is the permissions decision's question. |
| Documents (SharePoint references) | Elaborates | item 95 | The "link to the project folder" field offered in item 95. Files stay in SharePoint. |
| Activity history | Waits | the backend guardrails | A real audit row is written by the server with the change. On SharePoint, Timeline projects already have `ShopTimeline_Changelog`; Office records have none. |

## 3. Proposed backlog amendments

Nothing below is applied to `TODO.md` until the owner says go on item 102. New items get
their numbers then; they are lettered here.

### Refinements to existing rulings (owner approval)

1. **Project-centred Office** (refines "What we're building", 2026-11-19). Today: "Setting
   projects up and closing them out happens on the client's record." Proposed: "Office's
   main object is the project. Setup and closeout happen on the project's record, reached
   from Office's Projects register or from the client's record; the client's record keeps
   its relationship context and project history." Clients stays inside Office; nothing about
   the client list changes.
2. **The register's stages are derived** (adds to items 45 and 11). No stored lifecycle
   field. The register's grouping is a rule over the facts each owning item records (§5).
3. **Money waits for the API** (adds to the data-platform decision's facts and item 26).
   Estimate prices, budgets, actuals and margin are never stored in a SharePoint list.
   Those features start after item 51 and the platform ruling, on the API.
4. **Leads and estimates are built once, on the chosen platform** (follows from the
   data-platform decision's gate). Items 45 and 44 aren't started on SharePoint lists.

### Existing items, extended

| Item | Add |
|---|---|
| 95 (launch) | No scope change. Build "a click opens a past project's details" as a project-record panel (heading, fields), so it becomes the record's Overview later without rework. Note: its offered field "the client's contact for the job (from the client's contacts)" needs client contacts, which don't exist (item C). |
| 45 Lead and forecast | A lead's outcome (open, won, lost, cancelled, postponed) and who owns the follow-up. Office's Overview page is created with this item, holding its first queue (leads needing follow-up). Today's forecast projects show in the register under Leads until they migrate. |
| 44 Estimate | Visible revision states (draft, sent, approved, superseded); evidence of client approval; the approved revision is the locked commercial baseline, never overwritten. Open: whether a change order is a new revision or its own record (C). Its queue joins Overview. |
| 13, 42 Cost codes | A rule for changing a project's client after a code exists. |
| 43 Job creation | Opening is one transaction (code, project, baseline, PM, client, dates, audit). External handoffs are tracked separately: per handoff, its system, state (pending, sent, confirmed, failed), the external ID once known, attempts, last error and an owner who resolves failures. Retry is idempotent. The pre-opening checklist holds only what can be true before a code exists. Its queue ("approved, awaiting opening") joins Overview. Timeline's New Project stays as it is until then. |
| 5 Date certainty | Office's opening shows and records certainty; the register and record never infer it from a stage. |
| 10, 11 Closeout | Overview's closeout queues (PM to submit, Director to verify, ready to invoice, exceptions), aged from the last scheduled work date. Open: whether administrative closure is a step after "invoice sent" (F). Keep payment received separate from closure. Reconcile the wireframe's extra words ("Needs submission", "Invoiced", "Closed") with item 11's `closeoutStatus` / `billingStatus` before any column or table exists. |
| 26, 30 Permissions and views | Office's boundaries: who sees cost, markup, budget, actuals, margin, billing; who opens a job; who verifies closeout. Grants are per person and combine; the wireframe's single-role switch can't express that. |
| 51 Azure test | No change to its steps. Its domain-operation list (Backend review §E2) gains the candidates in §5, as candidates. |

### New items (proposed)

- **A. Office's Projects register and project record** (after the launch). A read-only
  register of every project Office can read today — Timeline's projects and past projects —
  with search, client and PM filters, and groups derived from today's facts (forecast,
  current, finished, before Timeline). Each row opens a project record with only the tabs
  that have data (Overview, Schedule read from Timeline, Documents once item 95's folder
  link exists). No new writes, no money, no new columns. Office's rail gets Projects and
  Clients. *Why new:* no item covers project-centred navigation. *Waits on:* refinement 1,
  the launch.
- **B. Project financials and portfolio reports** (Phase 9, after item 11's predecessors).
  Per project: the approved baseline (from item 44), imported actuals, commitments and
  billing with source and freshness; then portfolio reports that keep quoted pipeline,
  approved contract value, invoiced and collected apart. Office never becomes a ledger.
  *Why new:* only "budget views" exist (item 44); actuals, commitments and reports aren't
  specified anywhere. *Waits on:* the integrations decision (formats), item 26's
  boundaries, the API, and the definitions in E.
- **C. Client contacts and details in Office.** A client's contacts (name, role, email,
  phone) and sector, so a lead, an estimate and a past project can name "the client's
  contact for the job". ⚠ new list or table. *Why new:* clients hold a name and alias only;
  item 95 already assumes contacts exist. *Waits on:* whether it's built on a list now or
  waits for the platform (contacts aren't financial, so a list is allowed).

Purchasing gets **no item**: whether Office administers purchasing or only shows
commitments is unknown (D). It goes to "Material to gather".

## 4. Decision register

Existing questions are named with their item; new ones are lettered to match the brief's
groups (A–J). "Blocks" is the first work that can't start without the answer.

### Project Director

| Question | Existing or new | Blocks |
|---|---|---|
| The company's one project list; the Current Projects and 27 Events schemas | item 14 | Everything in Stages C–E |
| The cost-code workbook's rules (with the Bookkeeper) | items 13, 42 | Opening (item 43) |
| Rules for tentative, confirmed and TBD dates | item 5 | Opening's date fields |
| Who approves estimates; what counts as client approval (B) | item 44; new | Approval operation |
| Who may open a job; the minimum Timeline needs to schedule (B) | new | Opening (item 43) |
| Can a job open without an approved estimate (emergency, internal, T&M, allowance) (A) | new | Opening's rules |
| One lead → several jobs? Several estimates → one job? A multi-location rollout: one job, several, or parent and locations? (A) | new | Lead and job schema (items 45, 43) |
| Cancelling, postponing, reopening an opened job; what happens to its code (A) | new | Lead outcomes; job lifecycle |
| Who verifies closeout: a role or a named person | item 11 | Closeout |
| The PM checklist's wording; the AMPM columns | items 11, 22 | Closeout; Meeting Sheet |
| What makes an item overdue; who sets deadlines; reassignment (J) | new | Overview queues |

### Bookkeeper / Accounting

| Question | Existing or new | Blocks |
|---|---|---|
| QuickBooks and TimeClock+ formats | the integrations decision | Handoffs (item 43), item B |
| How the Bookkeeper signs in | item 11 | Closeout |
| Is "invoice sent" administrative closure, or is reconciliation a further step? Can a job close with unpaid invoices or unposted supplier bills? Retainage, bad debt, warranty, late charges? Who may reopen a reconciled job? (F) | new | Closeout's last step |
| Who resolves a job that opened in Office but failed in QuickBooks or TCP; how external IDs are captured; duplicate prevention on retry; renames across systems; import frequency; read-only imports or Office-initiated writes (G) | new (the integrations decision's detail) | Handoffs (item 43), item B |
| Labor cost: hours only from TCP, or cost? Payroll, standard or burdened rates? Overtime, freelancers, salaried staff, overhead, non-billable time? Which margin? When are actuals complete? (E) | new | item B |
| Reporting periods: calendar, accounting period or completion date (I) | new | item B's reports |

### Project managers and estimating

| Question | Existing or new | Blocks |
|---|---|---|
| Estimate walkthroughs; cost taxonomy; cost / contingency / markup / price layers; revision and lock semantics; catalog ownership | item 44 | Estimate schema |
| Native, absorbed or external estimating | item 44 | Estimate scope, the platform ruling |
| Is Estimating its own role or spread across PMs (H) | new | Permissions; Overview's queues |
| Change orders: new revision or own record? Who approves budget changes and contingency? Original and current budget both kept? Unapproved extra work, disputed charges? Spend before client approval? (C) | new | item 44's revision model; item B |
| Who keeps the estimated cost to finish (D) | new | item B's forecast |

### Purchasing

| Question | Existing or new | Blocks |
|---|---|---|
| Where purchase orders and open commitments live; administer or only show; allocation across projects; returns, credits, partial receipts, cancellations (D) | new | item B's commitments; any purchasing scope |

### Owner, leadership, HR

| Question | Existing or new | Blocks |
|---|---|---|
| Refinements 1–4 above | new (item 102) | items A–C, the order of 45 and 44 |
| Azure billing owner, second administrator, alert recipient, production-migration approver; free or paid staging | item 51 | Azure steps 4–6 |
| Staging isolation | items 17, 51 | Any write path |
| Who sees cost, markup, budget, actuals, margin, closeout data; roles in Entra or in Systems; department, individual grant or project assignment (H) | the permissions decision, item 26; new detail | Every Office tab with money |
| Which Project Director actions are distinct from leadership (H) | new | Authorization rules |
| Who owns a project's information after closeout; are closed projects editable for later enrichment (H, I) | new | Record editing after close |
| Office's pricing logic and schema in a public repository? | Backend review §A7 | Where `api/` lives |
| Past projects: which fields; how far back; incomplete records in reports; a useful project-type classification (I) | item 95; new | item 95; item B's reports |
| Dashboard default: personal, departmental or company-wide (J) | new | Overview |

## 5. Architecture implications

**Data ownership.** One owner per fact:

| Fact | Owner | Office's role |
|---|---|---|
| Client, contacts, past projects | Office | Creates and edits |
| Lead and its outcome | Office (item 45) | Creates and edits |
| Estimate, revisions, approval, commercial baseline | Office (item 44), or an external estimator Office references | Creates, locks; never overwrites a locked revision |
| Cost code | Office (items 13, 42) | Allocates; nobody types one |
| Project setup fields (name, client, PM, dates and certainty, code) | Office from item 43; Timeline until then | Creates the job |
| Production: phases, assignments, milestones, production status | Timeline | Reads |
| Closeout status, billing status | Office (item 11) | Records the workflow |
| Invoices, payments, posted costs | QuickBooks | Imports a reference and an amount with its source and time |
| Recorded labor hours | TimeClock+ (to be confirmed) | Imports, same way |
| Files | SharePoint | Stores a link |
| People, roles | People | Reads |

**Lifecycle.** Independent facts, each with its own owner: lead outcome; estimate revision
state; job opened (a code exists); production status (Timeline's `status`, as today and as
in `api/migrations/0001_project.sql`); closeout status; billing status; and, if ruled,
administrative closure. The register's group is a function of them, for example: Leads = a
lead with no estimate; Estimates = an estimate not yet approved; Ready to open = approved,
no job; Active = a job whose production isn't complete; Closing out = production complete
(item 10's trigger) and not yet closed; Closed = closure recorded. A lost or postponed lead
drops out by its outcome, not by a stage. The rule lives in one place (the API, or
`common/` before it), so Timeline's AMPM sheet and Office group alike.

**Domain operations** (candidates, beside the Backend review §E2 list, not contracts):
`recordLeadOutcome`, `sendEstimateRevision`, `recordClientApproval`, `verifyCloseout`,
`returnCloseout`, `holdCloseout`, `recordInvoiceSent`, `recordAccountingException`,
`resolveAccountingException`, `recordHandoffResult`, `retryHandoff`, and, only if ruled,
`confirmAdministrativeClosure` and `reopenProject`. Office's setup edits go through an
operation with an allow-list of fields and its rules (no client change once a code exists
without the rule above), never a general row update.

**Authorization.** Office is admin-only today, and the style guide keeps it so until an
explicit access-policy change. Opening it to Estimating, Accounting or Purchasing is that
change, and on SharePoint it would expose every list to them anyway. Per-field projection
(estimators see cost and markup, others don't) exists only behind the API. Grants combine
per person and may be scoped by project assignment (open, H). Every rule gets an allowed
and a denied test.

**Integrations.** Outbound handoffs (QuickBooks job, TCP job) are their own records,
outside the opening transaction: state, external ID, attempts, last error, owner,
idempotency key. Inbound imports (actuals, invoices, payments, hours) are batches with a
source, a file or run, and an as-of time shown beside every figure. CSV first. Each one gets
its `docs/Automations.md` entry when it's built.

**Schema.** None proposed. The wireframe's domains (clients and contacts, leads, estimates
and revisions, projects, cost codes, change orders, budgets, commitments and actuals
references, closeout, billing references, handoffs, document links, audit) are for
discussion. Tables follow the discovery in Stage B.

## 6. Recommended sequence

Each step is one or more small pull requests to `development`. Nothing here moves the
launch or item 51's order.

| # | Step | Accept when |
|---|---|---|
| 0 | **The owner rules refinements 1–4** (item 102); the decision register's questions go to their people (added to "Material to gather"). | Rulings dated in `Decisions.md`; items A–C numbered or declined. |
| 1 | **The launch**, item 95 included, as planned. | As planned. |
| 2 | **Read-only Projects register** (item A, part 1), after the launch. | Every Timeline and past project listed once; groups derived; filters and search; the harness records **no** write from the register; a client's record and the register agree on counts. |
| 3 | **Project record shell** (item A, part 2): Overview, Schedule (Timeline read), Documents if item 95's link exists; past projects open here. | A past project shows no Estimate, Open or Closeout tab; a Timeline project links back to its schedule; accessibility checklist (Design-Language §9) passed. |
| 4 | **Discovery** (items 14, 13, 44, the integrations formats; questions A–J): documents, no code. | A field-ownership and permissions matrix the owner signs off; item 14's comparison; item 13's inventory. |
| 5 | **Backend readiness**: item 51 steps 4–6, the platform ruling, staging isolation (item 17), the first write slice (Backend review §E16). | §E16's questions answered; real cost known; one write path with version check, audit row, allow and deny tests. |
| 6 | **Leads** (item 45) on the API; Overview with its first queue; forecasts migrate. | `createLead` and outcomes with audit; register's Leads group from real leads; Timeline forecasts mapped once. |
| 7 | **Estimates** (item 44), scoped by discovery. | Locked revisions immutable; approval by authorized roles only (deny test); a real estimate reproduces its numbers if pricing is in scope. |
| 8 | **Cost codes and opening** (items 42, 43); Timeline's New Project becomes "schedule this job". | Two concurrent allocations never share a code; opening all-or-nothing; handoffs tracked with retries. |
| 9 | **Closeout and billing** (items 10, 11, 22). | Queue aged from the last scheduled work date; overdue never hidden; AMPM sheet reads the same states. |
| 10 | **Financials, then reports** (item B). | Every figure shows source and freshness; missing is never zero; quoted, approved, invoiced and collected kept apart. |

## 7. Immediate next action

**The owner rules refinements 1–4 and says go or no to items A–C** (item 102). That single
step unblocks everything Claude can do next without guessing a business rule, and it
doesn't touch the launch. Alongside it, the decision register's Project Director and
Bookkeeper questions can go out now: most of them are already wanted by items 13, 14, 44
and 11, so it's one conversation, not several.

## 8. The wireframe's own inconsistencies

1. One `stage` field holds the lifecycle and `close` mixes closeout with billing
   (`Invoiced`, `Closed`): the flattening item 11 forbids.
2. Opening writes $0 actuals, commitments and billing: "missing isn't zero", broken by the
   wireframe itself.
3. Pre-opening checks name handoffs that need a cost code that doesn't exist yet.
4. Purchasing can't see estimates but sees budget, forecast and margin.
5. The Project Director has no role; verification is "Leadership". The Bookkeeper is
   "Accounting".
6. The opening checklist can be ticked by Accounting, but only PMs can open.
7. Date certainty is inferred from the stage (item 5 makes it a fact about the date).
8. An active job's client can be changed though its code carries the client's alias.
9. Reports: "Pipeline value" sums Ready to open (already approved) with leads; "Closed known
   revenue" sums contract values, not invoiced or collected amounts; the bar scale is
   value ÷ 1,000 capped at 100%.
10. No age, overdue mark or responsible person on queue items beyond the PM column.
11. "Create revision" marks the estimate Sent immediately; there is no draft.
12. The Director can't Hold a submission (item 11 has Hold); the Bookkeeper can't record a
    partial invoice.
13. A multi-location rollout ("5 locations") is one record; whether it should be is open (A).
14. Tabs are `role="tab"` without tab panels or arrow-key movement; the shipped apps need
    both (Design-Language §9).
15. Headings are Title Case (Needs Attention, Project Details), as the owner ruled; tab
    labels are sentence case ("Project open"). Pick one for tabs when item A is built.

## 9. Inconsistencies found in the repository's own docs

- `Decisions.md` ("Where the open work lands") calls item 95 "a client's projects by
  stage"; `TODO.md` item 95 is "more detail on past ones, no tag" and moves the by-stage
  grouping to items 45–11.
- Item 95 offers "the client's contact for the job (from the client's contacts)"; clients
  have no contacts (item C).
- Item 30 still lists Office under Phase 9 with items 11 and 13; the roadmap builds Office
  in Phase 8.
- Item 90 names `/preview/clients/`, which now forwards to `/preview/office/`.

These are fixed in the same change that applies the owner's rulings, not here.
