# To-do — Systems

What is left to do, who it waits on, and in what order. **The summary down to "Details" is
the whole picture**; each open item's full notes follow in the same order. Every line leads
with a plain name. The "(item N)" at the end is only a label that pull requests and records
point at; it isn't a rank.

Kept elsewhere so this file stays short:
- **Finished work** and the log of promotion audits: [`TODO-Done.md`](TODO-Done.md).
- **The plan** (what Systems is, the phases), **the decisions** and **the data schema**:
  [`Decisions.md`](Decisions.md).
- **Retired sections** (the old deferred-ideas ledger, batches and dependency lists), frozen:
  [`Archive/TODO-Retired-2026-11-18.md`](Archive/TODO-Retired-2026-11-18.md).

## Where we stand

As of 2026-11-18:
- **Live** (`main`, what users run): **v1.55.1**, Timeline only.
- **Preview** (`development`, at `/preview/`): **v1.60.0**. The Systems page sits at the
  root; Timeline moves to `/timeline/` with the Systems header and Apps menu; Clients is its
  own app at `/clients/`, and a client's record shows its current projects at a glance and
  its project history, projects from before Timeline included; the code every product shares lives in `common/`.
- **The next release is the launch:** the People app, the Clients app and the Systems page
  go live together, complete and polished (owner, 2026-11-18). Nothing goes to `main` until
  then, however long the polish takes. The repository is renamed to `Systems` just before.
- **A production fix meanwhile** is built from `main`, adds `clients/index.html` to the
  deploy workflow's lists (or `/preview/clients/` drops out until the next push to
  `development`), and is merged back into `development`.

What each release changed: [`CHANGELOG.md`](../CHANGELOG.md).

## Now — the launch, in order

1. **Your design and feature review of Clients and the Systems page** on `/preview/`. What
   it asks for becomes items here, then gets built. (item 90)
2. **The People app.** Claude drafts its wording and a recommendation on the one open
   question (whether merging two people should rewrite Timeline's records); you pick, give
   the go and add its two sign-in addresses; then it's built. (item 87)
3. **Choose the GitHub plan before the rename.** Paying for GitHub Pro lets the repository
   go private and keeps the address. Moving to a company Organization changes the address
   again, so it should happen at the same moment as the rename. (items 71, 24)
4. **Rename the repository to `Systems`**, just before the release: you add the new
   sign-in addresses, then rename; Claude updates every reference. (item 88)
5. **Release the launch** to `main`.
6. **A working day later, tidy up:** remove the old sign-in addresses and leftover files.
   (item 91)

## Waiting on someone

| Who | What they need to do | What it holds up |
|---|---|---|
| You | The design review above (item 90) | The launch |
| You | People app: wording picks, the merge question, the go (item 87) | The launch |
| You (leadership, for an Organization) | Pick the GitHub plan (items 71, 24) | A private repository; the rename |
| You | Create a test SharePoint site, or approve a list-name suffix on preview (item 17) | Testing without touching real data, before the pilot |
| You, the tenant admin | Check what retention covers and that version history is on for every list; start a weekly export (item 15) | A safety net for the lists |
| You, leadership | A licence quote, and who would own an Azure account (item 51) | Choosing the data platform: SharePoint lists, Dataverse or Azure |
| Project Director | Rules for tentative, confirmed and TBD dates (item 5) | Showing how firm a date is |
| Project Director, you | Enter the pilot projects; set the pilot's size and end date (item 18) | The pilot |
| Project Director | The AMPM columns of the Master Project Tracker (item 22) | The Meeting Sheet as the AMPM handout |
| Project Director, the Outlook flows' owner | Name the master record for events; find who owns the flows (item 12) | Shop calendars that stop drifting |
| Project Director, Bookkeeper | Write down the cost-code workbook's rules (item 13) | Cost codes in Office |
| Project Director | The Current Projects and 27 Events schemas (item 14) | Choosing the company's one project list, and with it all of Office |
| HR, Project Director | Which employee details are private (item 26) | HR fields in People; splitting the staff list |
| HR, you | Which list is the employee directory (see Decisions.md) | Splitting the staff list |
| Operations manager | A session on the PTO approvals list and the nightly 27 Employees automation (item 19) | Part-day time off |
| Backup maintainer | A GitHub account (item 16) | Code access for a second maintainer |

The rest of what's still to be gathered from people is under "Material to gather" in the
details. Open questions with no deadline are in [`Decisions.md`](Decisions.md).

## Next — Claude can do these without waiting

- **Restyle the project inspector** to the wireframes, the next style step. (item 52)
- **Write the one-paragraph rollback procedure**, and start tagging releases once you OK it.
  (item 16)

## Later — waits on other work

- **Office, the product after the launch**, built in the order a job moves: job lead
  (item 45), estimate (item 44), cost-code generation (item 42), job creation with the
  QuickBooks / TCP hand-off (item 43), and closeout and billing last (item 11). Waits on
  the company's project list being chosen and the cost-code rules.
- **Split the staff list** into a public roster and a restricted HR record (item 27).
  Waits on which details are private and which list is the employee directory.
- **The employee import's last steps** (item 9). Waits on which details are private.
- **Shared views by role** — leadership, department, PM (item 30). Waits on the
  permission roles.
- **"Automatic" status vs closeout** (item 10). Waits on closeout existing (item 11).
- **The storage review's follow-ups** (item 50). Waits on the data platform being chosen.

## On hold — you paused these

- A custom domain, such as `systems.twoseven.net` (item 40).
- An All Projects button on the toolbar (item 67).
- View settings follow the person (item 73).
- Row height on the project page (item 74).
- Create projects by dragging on the calendar (item 36).

---

# Details

Same order as the summary. Each item reads: what and why, the steps, what it waits on, then
its source. Marks: **⚠** = a SharePoint list or sign-in (Entra) change that the owner
applies from an exact spec; **[brief §N]** = the Project Director's September 2026 brief
([`reference/2026-09-22-Shop-Timeline-Brief-Condensed.md`](../reference/2026-09-22-Shop-Timeline-Brief-Condensed.md));
**[tracker #N]** = a ticket in the private feedback tracker; **[vision]** = the owner's
2026-09-24 direction for Systems.

## The launch

- [ ] **90. Your design and feature review of the Clients app and the Systems page** (owner,
      2026-11-18: not ready for `main`; "needs a design/feature review by me before we push to
      main"). On `/preview/clients/` and `/preview/`. What the review asks for becomes items
      here before any of it is built. The launch waits on it.
      - *First notes, on Clients (2026-11-18):* the list scrolls on its own, and a client's
        record shows current projects at a glance and a project history: item 92, built in
        v1.59.0. Projects from before Timeline, added in Clients: item 93, built in v1.60.0.

- [ ] **87. The People app** (the launch). ⚠ Architecture, on item 85. Timeline's People page
      becomes its own product at `people/`, built to the People wireframe, and leaves Timeline.
      - *Today's fields, and who sees them, exactly* (owner, 2026-11-17). HR-only fields and
        new tabs wait for item 26's tiers and item 27's split.
      - *It keeps:* the directory, the record and its editor, time off, the Employee Contacts
        import (only the mapped fields, item 9), the Team-membership suggestions, the phone
        tidy, and the merge.
      - *From the wireframe, only what exists:* the header, a left rail listing only built
        sections, the directory and the record. Its wording goes to the owner first.
      - *Timeline:* Company Data ▸ People and `#/people` go, forwarding to `../people/`.
        Crew pickers, people lanes and availability keep reading Staff.
      - *A decision before building:* the merge rewrites Timeline's projects, phases and
        to-dos (their names and refs). Under the ownership rule (Decisions.md, "What we're building") each product changes only its own
        data. Either the People app keeps doing it (it repoints references; it creates and
        deletes nothing), or the merge only retires the duplicate and Timeline repoints on
        its next load.
      - *The owner:* add the `/people/` and `/preview/people/` SPA redirect URIs before the
        merge.
      - *Rollback:* revert. The Staff list is untouched.

- [ ] **88. Rename the repository to `Systems`** (owner, 2026-11-18). Done immediately
      before the launch's promotion to `main`, so users get the new address with the new
      apps, once. The Pages address carries the repository's name: today Timeline is at
      `221twoseven.github.io/Project-Scheduler/timeline/`, after the rename
      `221twoseven.github.io/Systems/timeline/`. The custom domain (item 40) may not come
      soon; the rename doesn't wait for it. The app needs no change: it loads its shared
      files by relative paths, and its sign-in return address is the page's own. Saved
      browser settings survive (the site stays `221twoseven.github.io`).
      - *The owner, before the rename:* add the SPA redirect URIs for the new paths:
        `/Systems/`, `/Systems/timeline/`, `/Systems/clients/`, `/Systems/people/`, and the
        same four under `/Systems/preview/`. Keep the `/Project-Scheduler/…` ones until the
        new address has run on production for a working day.
      - *The owner:* rename it (Settings ▸ General ▸ Repository name). The tracker
        `Project-Scheduler-issues` keeps its name unless the owner says otherwise.
      - *Old addresses:* GitHub forwards the repository's web and git links after a
        rename, but not its Pages site, so every `…/Project-Scheduler/…` bookmark stops
        working, and a tab left open there finds out only when it reloads. *Owner decides:*
        a stub repository named `Project-Scheduler` holding only a `404.html` that sends
        any old link to the same page under `/Systems/` (it ends GitHub's forwarding of the
        old repository links, so the docs' links to old PRs are rewritten in the same
        change), or a message to everyone with the new address.
      - *Claude, one PR to `development` right after the rename, before the promotion:*
        every reference to the repository — `docs/SETUP.md` (the address and the redirect
        URI list), `CONTRIBUTING.md`, Help's repository link in `timeline/index.html`, the
        `ship-release` and `triage-issues` skills, links in the docs — and each automation
        in `docs/Automations.md` that links to the app's address. Local clones run
        `git remote set-url origin https://github.com/221twoseven/Systems.git`.
      - *Rollback:* rename it back; the old redirect URIs are still registered.

- [ ] **91. Tidy up a working day after the launch reaches `main`.** Moved out of item 49
      (2026-11-18), with item 88's old addresses.
      - *The owner:* remove the redirect URIs nothing uses any more: every one under
        `/Project-Scheduler/` once the rename (item 88) is live, including the root `/` and
        `/preview/` ones Timeline used before v1.56.0.
      - *Claude:* delete the two MSAL copies kept at the old paths for cached pages
        (`msal-browser.min.js` and `timeline/msal-browser.min.js`, v1.56.1) and drop their
        lines and `fonts/BrNStdBd.otf` from the deploy workflow's lists (on both branches).

## Waiting on someone

- [ ] **71. Make the repository private** (owner, 2026-10-15, after scraper spam reached
      the team: "until the repo is private, we cannot have scrapable info"; item 70 is the
      stopgap). Today it is public only because GitHub Pages on a free personal account
      needs a public repository.
      - *The blocker:* on GitHub Free, making it private takes the live app and
        `/preview/` offline. Pages from a private repository needs a paid plan: GitHub Pro
        on this account (the URL and the Entra redirect URIs stay the same), or an
        Organization on GitHub Team (item 24; the Pages URL changes, so the redirect URIs
        are re-registered, `SETUP.md`). Check current prices before deciding.
      - *What private does not hide:* the published site. `index.html` (code, comments, the
        sample roster) stays readable at the Pages URL to anyone who has it; sign-in
        guards the data, not the page. Tests, docs, history and PR text become private.
      - *Then:* Actions minutes become metered for private repositories (each PR runs the
        full suite, about 15 minutes), and the `main` ruleset needs the paid plan to stay
        enforced (`SETUP.md`, "Branch protection"). Confirm both on the chosen plan.
      - *Waits on:* the owner's choice of plan (and leadership, if it's item 24's
        Organization). [owner ask 2026-10-15]

- [ ] **24. Repository ownership.** `github.com/221twoseven` is a personal GitHub account
      named after the company, not an Organization: there are no org owners, single
      sign-on or team roles, so continuity rests on one login. If leadership's
      "company-owned code" requirement matters, plan a transfer to an Organization (the
      Pages URL and the Entra redirect URIs then have to be re-registered — `SETUP.md`).
      The repository is public, because Pages hosting needs it; the owner wants it private
      (item 71). [brief §11]

- [ ] **17. Keep test data out of production.** `/preview/` writes to the
      live lists, so every pilot test edit is a real edit, and the brief's technical-test
      stage would put test jobs into production data. Options: a test SharePoint site
      with the nine lists cloned (⚠ the owner creates it; the app finds lists by site and
      name), or a switch on the preview build that adds a suffix to list names. Decide
      before the pilot's stage 3.
      - *If the data-platform decision picks Dataverse or Azure SQL + API (2026-10-08):* staging becomes a
        separate environment: `/preview/` → staging API → staging database, `/` →
        production. It is mandatory before any write path is built, so no agent needs
        production data for ordinary work, and migrations, authorization and concurrency
        tests run against a database that can be wiped. This item and that staging are one
        piece of work, not two (`docs/Architecture-Review-Backend.md` §E8).
      [brief §10, §11.1]

- [ ] **15. Backups.** Nothing backs up the nine lists on a schedule.
      - *Quick answer:* a weekly SharePoint Export to Excel until something better
        exists. Ask the tenant admin what retention already covers.
      - *Catch:* several columns hold JSON text (departments, time off, schedule,
        assignee lists, `ticketNodes`), so a raw export isn't readable by Accounting or HR
        without flattening. Budget a small in-app CSV export or a script if the fallback
        must be readable by people.
      - Confirm list versioning is on for all nine. Deletes are recovered from the Recycle
        Bin, edits from version history.
      [brief §10.2, §12, §7.2]

- [ ] **51. The data-platform decision's inputs: the platform spikes and the facts a ruling needs.** The data-platform decision is
      ruled before the Phase 8 schema is provisioned, on these:
      - *Dataverse:* a licence quote (headcount × $20, $22 from 2027-01-01, plus any
        licences the tenant already holds; "Material to gather" in TODO.md) and a half-day spike: one read and one write
        to the Dataverse Web API from a Pages-hosted page with an MSAL delegated token.
      - *Azure (read-only, isolated staging):*
        - Bicep staging resources and a TypeScript API (App Service, Fastify);
        - Entra-authenticated access, and managed identity to a staging Azure SQL
          database;
        - three `GET` endpoints, and an `apiStore` behind a developer switch in preview;
        - no production writes.

        The plan, the questions it must answer and the rollback are in
        `docs/Architecture-Review-Backend.md` §E16.
      - *People:* item 44's scope answer, and the named platform owners ("Material to gather" in TODO.md).
      - ⚠ The Azure spike needs explicit approval to create Azure resources and Entra
        registrations before any of it starts (`CLAUDE.md`).
      - *Waits on:* item 48 PRs 1–2 (the Azure spike only); the approvals above.
      [the data-platform decision; `docs/Architecture-Review-Backend.md`]

- [ ] **5. Date certainty: Tentative / Confirmed / TBD.** Show whether a date is a
      commitment or a guess: an install date entered early reads as a commitment even when
      nobody has committed to it. Forecast status stays the *project's* state; certainty is
      about the *date*.
      - *Schema:* ⚠ one Projects column, `dateCertainty` (single line of text:
        `tentative`, `confirmed`, or empty = confirmed; `tbd` per step b). The app
        writes it only once the column exists, so other saves never fail (the tristate
        pattern, Decisions.md, "Data and schema").
      - *Shows on:* sidebar chip, bar label, project page header, Meeting Sheet.
      - *Steps and decisions* (owner, 2026-09-24: "noted — add the steps"):
        - (a) **The default date.** New Project pre-fills the install date as today + 42
          days, so the "required" date is never actually chosen. The Project Director
          decides: remove the pre-fill and require a choice (recommended — the whole
          schedule is built backward from this date), or keep it and mark it Tentative.
        - (b) **TBD still needs a working date,** because the schedule is built backward
          from it. Store `tbd`, schedule from the placeholder, and show a TBD pill instead
          of the date everywhere it prints.
        - (c) **Existing projects.** A default date can't be told apart from a chosen one.
          Proposed rule for the Project Director: every existing project reads Confirmed,
          except Forecast-status projects, which read Tentative; PMs correct from there.
        - (d) **Downstream.** A Tentative or TBD date must never look like a commitment: no
          LATE chip, no PM late prompt, no automatic Complete (item 10), and the Meeting
          Sheet prints the certainty.
      - *Waits on:* (a) and (c) are Project Director decisions. The column is additive.
      [brief §7 Early dates; §9 P0]

- [ ] **18. Preload the pilot projects.** The Project Director and the owner enter the pilot
      jobs, so PMs check them instead of re-entering them. Set the end date for parallel
      entry up front, and limit how many projects the pilot covers. [brief §10, §10.2]

- [ ] **22. Meeting Sheet as the AMPM handout.** It already prints per PM: status,
      current phase, dates, install date and workdays left. Get the AMPM columns of the
      Master Project Tracker from the Project Director and compare; add the closeout /
      aging column when item 11 lands. [brief §3 step 9, §9 P1 "AMPM output"]

- [ ] **12. Stop the calendar drifting.** Shop calendars drift because nobody has
      declared which record is the event of record. Leadership declares **27 Events** the master
      record for events. Each Outlook event gets an "Edit source" link back to it, and 27
      Events stores the Outlook IDs and sync state.
      - *Owners:* the Project Director, and whoever owns the 27 Events → Outlook flows
        (unknown, "Material to gather" in TODO.md).
      - *App:* nothing until the project-list decision / the departments-as-data decision decide whether Timeline's own
        `ShopTimeline_Events` merges into 27 Events.
      [brief §7.1, §9 P0 "Calendar drift", §15]

- [ ] **13. Inventory the cost-code workbook's guardrails.** Before the workbook can be
      replaced, its rules have to be written down. List every formula,
      validation message, abbreviation and numbering rule, with an example of every
      warning, and reconcile them against QuickBooks and TCP exports.
      - *Owners:* the Project Director and the Bookkeeper.
      - *App today:* `jobCode` is free text, with no format, duplicate or lifecycle check.
        The Clients list already holds a 2–3 letter alias per client (`field_2`, imported
        from the Excel client master). The registry design must adopt or replace it, so
        there aren't two masters for abbreviations.
      - *App later (Phase 8):* pick confirmed codes from the registry instead of typing
        them. The owning product is Office (Decisions.md, "What we're building"); Timeline only ever picks.
      [brief §6, §9 P0 "Before integrations"]

- [ ] **14. Decide the core project registry** (the project-list decision). Before deciding, produce a
      side-by-side schema comparison of Current 2-7 Projects / 27 Projects (Archive) and
      `ShopTimeline_Projects`, including what 27 Events and Teams depend on in Current
      Projects. The owner can do this with read access alone. The comparison is needed
      whatever the data-platform decision decides: the two lists hold the business knowledge that has to migrate,
      and their dependents are what a cutover re-points (2026-10-08). [brief §6.7, §14]

- [ ] **26. Define the information tiers** — a decision with HR and the Project Director.
      - *The problem (owner's finding):* employee information is protected only by people
        not looking. Every signed-in user can read all of `ShopTimeline_Staff`.
        SharePoint protects whole lists (or single items), never single columns, so the
        fields have to be sorted into tiers before anything can be protected.
      - *Output:* a field map, with one owner per field.
      - *Proposed tiers:* **public roster** — what pickers, lanes and dashboards need:
        name, nickname, departments, title, availability, weekly schedule, driver.
        **Restricted personnel record** — work phone and email (?), employment status,
        time-off notes, personal contacts, pay basis, and anything ADP or TimeClock+ adds
        later.
      - *Question for HR:* is a work phone or email public inside the company?
      - *Feeds:* item 27 and the employee-directory decision. Until item 27 ships, items 4 and 9a are the only
        protection, and the pilot's stated limits should say so.
      [brief §7 Employee source, §8.1, §11.1; vision]

- [ ] **19. Check the PTO source and its edge cases.** Availability today comes from
      out-of-office ranges typed on the People page: whole days only, and back-to-back
      ranges aren't merged for "Away until". The PTO Contract Approvals list (fed by the
      operations manager's Teams PowerApps plugin) isn't connected. The discovery session
      planned for mid-September isn't on record as held: schedule it, and use the same
      session to identify the nightly 10 pm automation on 27 Employees. Test: multiple,
      adjacent and overlapping requests; partial days; cancellations; people without a
      company email. [brief §7.2, §13]
      - *Done (v1.48.5, PR #152, 2026-10-14):* "Away until" merges back-to-back and
        overlapping ranges, including across a weekend or holiday (`cdAvail`; suite
        `tests/test-v1485.js`). Still open: the discovery session (PTO Contract Approvals,
        the nightly 10 pm automation on 27 Employees) and partial days, which need it.

- [ ] **16. Backup maintainer and rollback procedure.** A backup maintainer is named
      (owner, 2026-09-24, "for now"). Still to do:
      - Give the backup maintainer access to the repository (as a collaborator working through ordinary
        branches and pull requests; the `sandbox` branch flow in
        `docs/Archive/Onboarding-Fork.md` was retired 2026-10-01), Pages, the Entra app
        registration (at least the right to edit redirect URIs) and the recovery docs
        (`SETUP.md`, `CONTRIBUTING.md`, `reference/Handoff-Notes.md`). He has no GitHub
        account yet (owner, 2026-09-25); creating one is the first step, and it also
        opens item 31's private tracker to him.
      - Write the one-paragraph rollback: `git revert` on `main`, and Actions redeploys.
      - Start tagging releases (`v1.23.0` and so on); there are no release tags today.
      [brief §5.1, §11]

### Material to gather

What we still need from people: schemas, rules and examples, not screenshots. Status as of
2026-09-24.

| Material | Owner | Status |
|---|---|---|
| Employee Directory: the exact list, field names, types, permissions, a sanitized export | HR manager | not requested |
| Master Cost Code List: headers, formulas, validation messages, abbreviation and sequence rules, an example of every warning; QuickBooks and TCP exports to compare | Project Director, Bookkeeper | not requested (item 13) |
| Current Projects and 27 Events: schemas, lookups, status fields, Teams and shop-screen dependencies, where Outlook IDs are stored, an example of an Outlook-only edit and of a deletion | Project Director; flow owner (unknown) | not requested (item 14) |
| Power Automate: every trigger, action, calendar connection, recipient, error owner, retry policy | flow owner (unknown) | owner not identified |
| Master Project Tracker and closeout: columns, restricted fields, AMPM fields, closeout email examples, what the Bookkeeper minimally needs | Project Director, Bookkeeper | not requested (items 11, 22) |
| PTO, holidays, change log: the availability source, how identities are matched, cancellation examples, how holidays are set | operations manager (PTO, the 27 Employees automation); the owner (change log, item 20) | discovery session not held |
| QuickBooks / TimeClock+ CSV formats | Bookkeeper | not requested (the integrations decision) |
| Who administers which view (the key users), and which permission set each needs | owner, the backup maintainer | in progress (the permissions decision) |
| a colleague's estimator: a walkthrough of its model, pricing rules, catalog and rate data, and test estimates; where its database runs | the colleague, the owner | not requested (item 44) |
| Estimate samples: two or three recent estimates per PM, of different shapes, to re-enter in the estimator's model | several PMs, the Project Director | not requested (item 44) |
| Platform ownership: who would hold an Azure subscription and its billing, a second administrator, alert recipient, production-migration approver; or who administers a Power Platform environment | owner, the backup maintainer | not requested (the data-platform decision) |
| Licence inventory and headcount: Power Apps / Power Automate premium licences already held, and how many people would use Systems (viewers included) | tenant admin, owner | not requested (the data-platform decision) |
| Colleague app: is it running, who maintains it, which lists it reads and writes | owner | answered 2026-09-24: running, unused, will not return; breakage accepted (the colleague-app ruling) |
| The app itself: lists, registration, scopes, deployment, data model, formulas | the owner | mostly in the repository; item 21 closes the gaps (backups and rollup formulas undocumented) |

## Next

- [ ] **52. The style track: suite style guide §13 steps 3–5.** The migration sequence in
      `design/TwoSeven-Application-Style-Guide.md` §13. Step 1 (baseline) and step 2 (tokens
      and readable chrome text, v1.24.0) are done.
      - *Step 3:* restyle one chrome surface per PR, project inspector first: type
        hierarchy, spacing, radii, fields, focus, buttons, and modal focus trapping where
        it's missing. Next.
      - [x] *Step 4:* the shell as one change: the global header and a real app switcher.
        Item 49 shipped v1.56.0 (2026-11-17), so the portal exists to switch to.
        Shipped v1.57.0 (PR #206, 2026-11-18). Owner's picks (2026-11-18): TWOSEVEN INC.
        opens the Systems page; the name beside it reads "Timeline" and goes home to the
        full timeline; Timeline's own buttons stay in the header row (now 56px); Apps ▾
        lists all four products, unbuilt ones greyed, Clients hidden from non-admins. The
        header pieces, the font and the menu live in `common/` (`.ts-top`, `.ts-brand`,
        `.ts-app`, `appsMenu()`); the Systems page loads `common.css` and drops its token
        copy. The project page sits under the toolbar's measured height, not a fixed 50px.
        Item 86 points the menu's Clients at `clients/` and greys People, with the Systems
        page's cards. Suite `tests/test-v1570.js`; record
        `docs/Milestones/Phase-7-Pilot-Readiness/2026-11-18-shell.md`.
      - *Step 5:* business pages and routing: read-first records, sorting, empty states,
        per-record routes.
      - *Done when, per PR:* before/after `/preview/` screenshots, the Design-Language §9
        checklist, and the §13 verification list. A visible change follows the version and
        changelog rules. Steps 6–7 are rules for how the steps are done, not work of their
        own.
      [style guide §13; `design/Style-Transition-Review.md`]

## Later

- [ ] **45. Job lead and forecast in Office.** Cycle step 1 (Phase 8).
      - *Today:* a forecast is a Timeline project with the `forecast` status — a real
        project record, pencilled in grey, created on New Project.
      - *In Office:* a lead is a record that exists *before* the job: the client (from
        Clients), the scope, the expected install window, and who is chasing it. It
        becomes a job at creation (item 43). Timeline shows a lead as a forecast bar only
        once it has dates worth scheduling.
      - Existing Forecast-status projects become leads when Office ships.
      - *Waits on:* the project-list decision (the registry), the Clients registry.
      [vision; brief §7 Early dates]

- [ ] **44. Estimate in Office.** Cycle step 2 (Phase 8). An estimate reference on the
      lead from item 45 — number, revision, sent and approved dates; a client revision
      creates a new revision; unbilled scope later blocks Ready at closeout — plus budget
      views per project. Nothing beyond that is specified: scope it with the Project
      Director and the Bookkeeper before design.
      - *Reference material (2026-10-08):* a colleague's estimator, a working Next.js /
        TypeScript tool on a relational database, is item 44's domain-discovery artifact.
        It is not a schema to port. Concepts to validate:
        - labor / material / install pricing, flat-rate vs per-item rules, and shared
          costs allocated across locations;
        - catalog and rate data, exact decimal money, and pricing tested against real
          estimates;
        - locked historical versions with change highlighting, one section model feeding
          several outputs, templates and saved line bundles;
        - fuzzy catalog search, keyboard speed, bulk markup changes, and client-facing
          print.

        Limits Office must not inherit: a shared team password, an incomplete audit
        trail, hard deletes, manual backups, and its own client and project records
        (duplicate masters, the project-list decision).
      - *Discovery before any schema is canonized:*
        - several PMs each re-enter two or three recent estimates of different shapes in
          its model, so the question answered is whether it models TwoSeven's estimating,
          not one estimator's practice;
        - ask, don't assume, whether the cost taxonomy needs subcontracting, freight,
          rentals, travel, engineering, specialty vendors, contingency, PM / design time,
          rush / overtime, client-supplied items or allowances;
        - ask whether internal cost → contingency → markup / margin → client price are
          separate layers per line (the basis for estimate vs actual, variance and margin
          later, and for the permissions decision's tiers);
        - pin down revision and lock semantics, catalog ownership, and the hand-off to
          items 42 / 43.
      - *Its scope answer is an input to the data-platform decision:* line-item estimating in Office, or only an
        estimate reference. Also open: adopt the estimator's concepts, absorb a hardened
        estimator, or keep it external (`docs/Architecture-Review-Backend.md` §F).
      - *Waits on:* item 45; the Master Project Tracker material ("Material to gather" in TODO.md); the estimator
        walkthrough and PM samples ("Material to gather" in TODO.md).
      [brief §8.6; vision]

- [ ] **42. Cost-code generation in Office.** Cycle step 3 (Phase 8), together with item
      43.
      - *Today:* `jobCode` is free text typed on New Project, with no format, duplicate or
        lifecycle check (item 13).
      - *In Office:* generate the next code from the cost-code registry — the client's
        alias from Clients plus the next sequence number — enforcing the workbook's format
        and duplicate rules (item 13's inventory) at creation. Timeline and every other
        product only pick from the registry; nobody types a code.
      - *Waits on:* item 13's inventory (the rules), the project-list decision (the registry), item 28 (client
        IDs).
      [brief §6, §9 P0 "Before integrations"; vision]

- [ ] **43. Job creation in Office, with the cost code and the QuickBooks / TCP
      hand-off.** Cycle step 3 (Phase 8).
      - *Today:* a project is created on Timeline's New Project page: name, client, cost
        code, install date, team, departments.
      - *In Office* (the ownership rule, Decisions.md, "What we're building"): Office creates the job from the lead and the
        estimate (items 45, 44) — name, client from Clients, cost code from item 42,
        install date and its certainty (item 5), the PM. It hands the code to QuickBooks
        and TCP (the integrations decision: CSV first, APIs through Power Automate). Then Timeline schedules it.
      - Office gets a create screen over the Projects registry.
      - Timeline's New Project becomes "schedule this job": it loses the setup fields and
        gains a picker of unscheduled jobs. The draft page's scheduler
        (`generateSchedule`) doesn't change.
      - Until Office exists, New Project stays in Timeline unchanged.
      - *Waits on:* the project-list decision, item 28 (client IDs), items 42, 44, 45; the integrations decision for the hand-off.
      [vision; brief §6, §7 New Project layout]

- [ ] **11. Closeout and billing states.** Cycle step 7, the last (Phase 9). Not planned
      further until the steps before it exist. What's known so far: project status,
      closeout status and billing status stay three separate fields.
      - ⚠ Two Projects columns: `closeoutStatus` (`submitted` / `returned` / `ready` /
        `hold` / empty) and `billingStatus` (`invoiced` / `exception` / empty), plus
        `closeoutBy` / `closeoutAt` if the change log's who and when isn't enough.
      - *The flow:* the PM submits a one-minute checklist (no budget or line items). The
        Project Director verifies it: Returned, Ready for balance invoice, or Hold for
        revision. The Bookkeeper marks Invoice sent or Accounting exception.
      - *Screens:* a **Needs closeout** queue in Office, aged from the last scheduled work
        date. Overdue items stay visible until resolved. Reminders go by email through
        the already-approved `Mail.Send` permission. The Meeting Sheet's AMPM section
        stays in Timeline and reads the same columns.
      - *Open questions:* how the Bookkeeper signs in (remote, in another state — a
        viewer with a `closeout` grant?), and whether the Project Director's verification
        belongs to a role or a named person (the permissions decision).
      - Moved out of the pilot 2026-09-29 (owner).
      [brief §8.4–8.5, §9 "Business control"]

- [ ] **27. Split `ShopTimeline_Staff` into a public roster and a restricted personnel
      record.** Every site member can read the whole Staff list today (item 26).
      - A new list holds only the restricted fields plus each person's stable ID. It
        lives on this site with its own permissions (inheritance broken), or on a
        separate HR site, and HR controls who can read it. The restricted columns move
        off Staff.
      - The app reads the restricted list only if the user's token is allowed to (a 403
        "forbidden" falls back quietly, the way `STAFF_OK` does today) and joins rows by
        ID. Each fact lives in one place; nothing is copied.
      - People (Decisions.md, "What we're building") becomes its editor; Timeline shows what the roster holds.
      - *Owner action:* break inheritance or create the site (site admin).
      - ⚠ Destructive on Staff (columns move): a milestone record plus a migration of
        existing rows.
      - *Waits on:* item 26, the employee-directory decision, the permissions decision. (The colleague app no longer constrains this.)
      [brief §8.1, §11.1; vision]

- [ ] **9. Harden the employee import.** 9a goes first in the first batch (owner,
      2026-09-24: "browser cache but invisible is still browser cache"). (a), (c) and the
      extension shipped in v1.43.0 (PR #112, 2026-10-08); (b) is deferred; (e) waits on item 26.
      - [x] (a) **Fetch only what's used.** Shipped v1.43.0. The import used to ask for every
        field (`items?expand=fields` with no select), so Pay Type and PersonalEmail reached the
        importing admin's browser. It now reads the HR list's column definitions first and
        requests only the internal names of the fields it maps (`EC_MAP`). If it can't read
        the definitions, it imports nothing rather than fall back to every field. Honest
        limit: this is the app behaving well, not a guarantee. An admin with site rights
        could still read the HR list directly. The real protection is SharePoint permissions
        on Employee Contacts itself: HR's list, HR's call (item 26, the permissions decision).
      - [ ] (b) **No silent phone fallback.** *Deferred (owner, 2026-10-08):* employee
        contact numbers are posted in the breakroom and personal numbers are used, so the
        Primary Phone → Phone → Mobile Phone fallback stays (the archived ledger).
      - [x] (c) **One phone format: 555-555-5555** (owner, 2026-10-08). Shipped v1.43.0.
        - Ten digits, or eleven with a leading 1, written with spaces, dots, dashes or
          brackets, become the hyphenated form (`fmtPhone`).
        - This applies on load, on import and on save, so stored numbers read the one way at
          once.
        - **The list itself is tidied once** (owner, 2026-10-08). While any
          `ShopTimeline_Staff` row still holds another format, an admin sees **Tidy N phone
          numbers** on the People page. One confirm rewrites the phone column on just those
          rows (`cdTidyPhones`), and the button then disappears.
        - Anything else (a foreign number, text with the number) stays as typed.
        - A search by the bare digits finds a hyphenated number.
      - [x] **Office Extension**, typed by hand on the People page (owner, 2026-10-08). It is
        dialled office to office from office phones. It is its own field, never part of the
        phone number, since mobile numbers have no extensions. Employee Contacts doesn't
        carry one. Shipped v1.43.0. It has its own column after Phone and its own line on
        the record, and the import never touches it. The People table's saved column
        widths moved to a new key (`shopTimelineCdColW2`), so they fit afresh once instead
        of landing a column off. It uses the `ext` column on `ShopTimeline_Staff` (Decisions.md, "Data and schema", created by the owner
        2026-10-08).
      - [x] (d) *Answered (owner, 2026-10-08):* Primary Phone can be a personal number, and
        that's accepted (see (b)).
      - [ ] (e) **What non-admins see** on the People page (was (c) until 2026-10-08) is now
        part of item 26's field map. Today every signed-in user sees name, nickname, title,
        phone, email, departments, time off, schedule, driver, **employment status and the
        ADMIN / DEV / FB permission badges**.
      - *Waits on:* item 26 for (e).
      [brief §7 Employee source, §8.1, §13]

- [ ] **30. Role-based shared views, and the products.** Shared views (leadership,
      department, PM, later `terminal`) using item 25's JSON format and stored in `ShopTimeline_Config` or a views list.
      Also Phase 9: **People** and **Clients** as their own products over the tiered
      lists (items 27–28), and **Office** (items 11, 13). Design Resources is tabled (the design-resources question,
      owner 2026-09-29).
      - *Waits on:* the permissions decision's role vocabulary. (The one-folder-per-product ruling was made 2026-09-28.)

- [ ] **10. Automatic status vs closeout.** A project set to Automatic marks itself
      Complete when its last install *or shipping* bar ends (v1.20.6). Under item 11,
      "work finished" and "closed out" are different states. Keep the automatic switch to
      Complete as the trigger that starts the closeout clock, never as something that
      hides a job from the closeout queue. [brief §7 Closeout Response, §8.4]

- [ ] **50. The storage review's other follow-ups** (`docs/Architecture-Review-Storage.md`
      ideas 2–4, open questions 1–3):
      - *Provisioning as code:* `provision.mjs` in the private tracker creates lists and
        columns from one spec, which also records the column types the repo lacks. ⚠ It
        runs under the Feedback Bot, whose site grant rises from `write` to `manage`.
        Under the data-platform decision B or C this shrinks to files and test sites (item 17).
      - *Scope swap:* the SPA's `Sites.ReadWrite.All` is replaced by a delegated
        `Sites.Selected` grant on TWOSEVENINC. ⚠ Entra. Timed with the shared
        registration.
      - *One shared registration for the browser products*, a separate one for bots, and
        a product prefix on browser-storage keys from the first shared-module PR.
      - *Waits on:* item 48; the owner's answers to the review's questions 1–3; the data-platform decision (it
        decides how much of the provisioning work is needed).
      [`docs/Architecture-Review-Storage.md` §2–§4]

## On hold

- [ ] **40. A custom domain for the app.** The ask: `twoseven.net/timeline`, password
      protected.
      - GitHub Pages custom domains work per host name: `timeline.twoseven.net` (a CNAME
        record pointing to `221twoseven.github.io`) works, but Pages can't serve a *path*
        under `twoseven.net`. Whatever hosts twoseven.net could only redirect or proxy
        it.
      - "Password protected" is already true in the way that matters: Microsoft sign-in
        guards every page. Pages adds no password layer.
      - A new address needs its redirect URIs registered in Entra for `/` and `/preview/`
        (explicit instruction required, `CLAUDE.md`), and `SETUP.md`
        updated.
      - *Owner decides:* a subdomain, or a redirect from the path.
      - *Leaning to hold (owner, 2026-10-05 on the ticket):* wait until the other Systems
        products (portal, People, Clients, Office) have content. The owner asked whether the
        DNS and Entra setup can be done ahead of them; the revised spec of the same day
        answers that.
      - *Hold continued 2026-10-19* (owner).
      - *2026-11-18 (owner):* the repository rename (item 88) comes first and takes
        `Project-Scheduler` out of the address; the custom domain can follow whenever.
      [tracker #12]

- [ ] **67. An All Projects button on the toolbar,** between + New Project and My Dashboard:
      goes to the full timeline and clears filters and the saved view (the wordmark and the
      crumb only navigate). Copy in the spec. Spec 2026-10-14; waits on Proceed. [tracker #41]
      - *On hold 2026-10-19* (owner).

- [ ] **73. View settings follow the person** (owner, 2026-10-16). Today these live only in
      the browser: Vivid months (`shopTimelineTint`), Link subtasks, Group by / the
      Department lens, and print paper and printed bars. Move them into the signed-in
      person's Staff row, in the `savedViews` value that already carries saved views,
      Protect dates and item 32's "Milestones on the Gantt" (item 25, item 2 (c), v1.50.0).
      The browser copy stays as the cache, as it does for those, and no column is added.
      Each one also gets a row on Help ▸ My settings (v1.50.0), with its wording shown
      to the owner first.
      - *Stays per browser:* panel heights, collapsed panels, list width, the Gantt zoom
        and which departments are open. These depend on the screen, or change minute to
        minute.
      - *Then:* item 3's "Don't show again" lives in a `ShopTimeline_Config` row
        (`tour.off.<account>`), because it must work for people with no Staff row. Decide
        whether it moves into the Staff row with the rest.
      - *No new on-screen copy.*
      - *Deferred 2026-10-19* (owner: quality-of-life work waits while the north star moves).
        The draft My settings wording is on PR #175. The archived ledger has the entry.

- [ ] **74. Row height on the project page** (owner, 2026-10-16: the edit page "gets
      more direct use"). View ▸ Row height (Comfortable / Snug / Compact) sets the
      timeline only; the project page's rows are fixed at 34 px (`NPV_ROWH`).
      - *Ruling:* the project page gets **its own** row-height setting, separate from the
        timeline's, under View ▸ Row height while a project is open. It defaults to
        Compact at today's 34 px rows, so nothing changes until someone picks another.
        The Snug and Comfortable heights for this page are set when it's built.
      - *Applies to:* both the draft and the saved page.
      - *Collision:* item 32's placement maths reads `NPV_ROWH`, so build this after
        item 32's default is settled (PR #165).
      - *Personal:* once item 73 lands, it joins that value.
      - *Deferred 2026-10-19* (owner: "For now we won't be doing this"). The archived ledger has the entry.

- [ ] **36. Create projects from the calendar.** Drag across dates on the calendar to
      create a phase or milestone, then fill in the details in the bottom panel — simpler
      than building in the Gantt. The calendar can already resize and move existing bars
      by drag (v1.9.0–v1.11.0), but not create them. A larger feature; after the pilot,
      unless the owner ranks it higher.
      - *Ticket closed 2026-10-05:* the reply to the reporter pointed out that
        double-clicking the calendar already opens "add a phase". The owner asked for the
        drag-to-create request to stay here, so it does.
      [tracker #5]
