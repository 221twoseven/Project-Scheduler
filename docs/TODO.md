# To-Do / Backlog — Phase 7: pilot readiness, on the road to v2.0.0

**The single working to-do list for Project Scheduler (Timeline).** Started 2026-09-24,
when the v1.x backlog was retired to
[`docs/Archive/TODO-v1.x-Archive.md`](Archive/TODO-v1.x-Archive.md). Every entry still
open there was checked against the code before it was carried; the carried entries are in
§7 with their gates, the stale ones are closed in §7.0.

Two documents set this phase and are the source for most lines below:

- **The Project Director's brief** — *Shop Timeline App: Current Processes and Development
  Priorities* (September 2026), read here in Robert's condensed, annotated version,
  [`reference/2026-09-22-Shop-Timeline-Brief-Condensed.md`](../reference/2026-09-22-Shop-Timeline-Brief-Condensed.md).
  Cited as **[brief §N]**. Its "Response" annotations were fact-checked
  against the app on 2026-09-24; where a claim was partly wrong, the corrected fact is what
  appears below.
- **The owner's vision (2026-09-24), defined as Systems (2026-09-29)** — Timeline stays a
  project-management and scheduling app with its features intact, and becomes one product
  of **Systems**: a data-management ecosystem of peer products (People, Clients, Office,
  Timeline) over one shared dataset (on SharePoint today; the platform is D15), one
  permission model and one visual
  language, reached from one portal. The definition is §1. Cited as **[vision]**.

**How to read it.** §3 is the work queue in priority order, and §4 holds the decisions it
depends on.
- **Shipped work** is ticked `[x]` where it sits. A partly done item says so in its own text
  (item 1, for example).
- **Item 31**, the feedback → GitHub ticket bridge, has been running since 2026-09-25,
  outside the app, in a private tracker repository. User reports arrive there and are
  carried into §3 by hand.
- **Every unticked item is not started** unless its text says otherwise.

Milestones and this plan are presented to Hubert, the Project Director and the key users
as the phase runs.

**Standing rules:**

- ⚠ marks a SharePoint column/list or Entra change. **Not a gate** (owner, 2026-09-01):
  deliver Robert the exact spec (list, column, type, values) and he applies the list edit;
  the app never writes schema. The colleague app no longer constrains the schema (D2,
  ruled 2026-09-24); a destructive change still gets a milestone record naming what it
  breaks and how rows migrate. Entra changes still need explicit instruction (`CLAUDE.md`).
- Work lands on `development`, is viewable at `/preview/`, and is promoted to `main` by a
  deliberate manual merge. `/preview/` writes the **live** lists (§3 item 17). The
  `sandbox` branch and `/sandbox/` were retired on 2026-10-01.
- Semantic versions; `APP_VER` in `index.html` is the source of truth, `package.json` and
  `CHANGELOG.md` follow it (`npm run notes`; CI fails without a release-notes line).
  **v2.0.0 is re-reserved** for the Phase 8 cutover defined in §1, not for "the app
  becomes the one database".
- Every milestone gets a record in `docs/Milestones/Phase-7-Pilot-Readiness/`; every
  deliberate skip gets a §7 line with its gate.

Last reviewed: 2026-10-08 — D15 (data platform) reassessed: Dataverse and Azure SQL + API
are now co-equal candidates (`docs/Architecture-Review-Backend.md`); D1, D3, D10–D13 and
items 14, 17 and 44 given storage-neutral readings. The same day: the opening, §0 and §3's
intro brought up to date, then a full audit against the tracker, `CHANGELOG.md` and the
branches. The full history is the log in §8.

---

## 0. Where we stand

As of 2026-10-08: production (`main`) runs **v1.41.0**, and `development` carries
**v1.41.1** (the narrow-sidebar fix for the Projects / Departments switch, PR #106).
Phase 7 has shipped v1.24.0 → v1.41.1 so far. `CHANGELOG.md` is the release-by-release
record.

## 1. North star — Systems

**Systems** (owner, 2026-09-29) is a data-management ecosystem: several **products**, each
a touchpoint for one kind of information, over **one shared dataset**, reached from one
**portal**. "Systems" is the name in the title block of the portal, and the portal sits at
the root `/`. The products are peers — none is the parent of another. Timeline is one of
them.

| Product | What it holds and does | Who uses it | Gated? | Where it stands |
|---|---|---|---|---|
| **People** | Staff names, contact information, status (FTE vs Freelance), logged hours, and whatever else the HR / ADP administrator manages. The place to connect to ADP — CSV first; the ADP API only through Power Automate with a named owner, never from the browser (D13) | The HR / ADP administrator; everyone reads the public roster | HR-only fields restricted (D3, items 26–27) | Timeline's People page today (`#/people`); its own product in Phase 9 (D8) |
| **Clients** | Client names, past projects, billing and revenue, current and past teams, client contacts and their details — whatever management needs to track | Management, project management, accounting | Yes | Timeline's Clients page today (`#/clients`); its own product in Phase 9 (D8) |
| **Office** | Where projects are set up and closed out: estimating, cost-code generation, budget views, project closeout | Management, project management, purchasing, accounting | Yes | Does not exist. **The next new product, built in Phase 8** (owner, 2026-09-29), in project-cycle order: job lead / forecast (45), estimate (44), job creation with cost codes and the QuickBooks / TCP hand-off (42, 43); closeout (11) is the last step of the cycle and comes last |
| **Timeline** | Project production: the schedule, phases, assignments, milestones, notes — the app that exists today | Everyone; existing permissions mostly stay | Mostly no (admin / viewer as today) | In production (§0); moves from `/` to `/timeline/` when the portal lands (D4); New Project stays here until Office takes setup (item 43) |

**The ownership rule.** Each product has sole ownership of the data it holds: records are
**created and deleted only inside their own product**. Every product **reads** the shared
dataset, so information from People, Clients and Office is selectable, assignable and
interactive wherever it is needed — a Timeline phase picks a person from People, a project
references a client from Clients — but Timeline never creates or deletes a person, a client
or a cost code, and once Office exists it no longer sets projects up either (item 43):
Office creates the project, Timeline schedules it. Timeline manages production data only.

**The build order is the project cycle** (owner, 2026-09-29). Systems is developed in the
order a job moves through the shop, so each product exists before the step that needs it:

| Step | Product | Backlog |
|---|---|---|
| 1. Job lead / forecast | Office | item 45 |
| 2. Estimate | Office | item 44 |
| 3. Job creation — cost codes, QuickBooks, TCP | Office | items 42, 43 (13 and 14 are its inputs; D13 the hand-off) |
| 4. People management | People | items 26, 27, 9, 19; D5, D9 |
| 5. PM schedule, workback | Timeline (exists) | the pilot items, §3 P0 / P1 |
| 6. Design, production, finishing, packing / install / shipping | Timeline (exists) | the pilot items |
| 7. Project closeout, final invoice | Office | item 11 — last, not planned further until the steps before it exist |

Clients is not a step: a lead names a client at step 1, so the Clients registry is read
from the start; the Clients product's place is Phase 9 (§2).

**What this means for the data** (the 2026-09-24 framing, unchanged; D7):

1. **The shared SharePoint registries are the source of truth, not any product.** One
   record per fact, keyed by a stable internal ID, one owner per field, freshness visible.
   Projects, Clients, People, Cost Codes, Events, Departments, Shop Closures, Closeouts are
   registries; every product is a *view* of them [brief §5, §8; vision "no duplicate
   entries"]. (The rule holds on any platform. Whether the registries stay SharePoint
   lists or become Dataverse or SQL tables is D15.)
2. **Timeline stays the schedule.** It keeps every feature as designed and reads/writes the
   operational fields of those registries — dates, work blocks, assignments, status. It is
   not a master for people, clients or cost codes [vision; brief §7].
3. **Duplicate entry is removed before features are added.** After the pilot, the first
   retirement of a manual re-typing step is the measure of success, not a new view
   [brief §1, §10].
4. **Sensitive data is protected by SharePoint permissions, not by hiding it in a UI.**
   Every product runs in the browser with each user's own token; anything a user must not
   see lives in a list or site they cannot read (§4 D3). "Gated" in the table means exactly
   that. (The principle holds on any platform: protection is enforced below the UI. If
   D15 moves the registries behind an API, the enforcement is the API's server-side
   authorization instead of each user's token; see D3.)
5. **v2.0.0 = Timeline running on the shared registries** — the first `ShopTimeline_*`
   master retired in favour of a shared one. That is the breaking change the major number
   exists for. The portal and the other products arrive as v2.x/v3, each its own client of
   the same registries, each with its own version.

**Where the open work lands** (product → §3 items and §4 decisions):

- **People** — items 4, 9, 19, 26, 27; D5, D9, D13 (the ADP connection).
- **Clients** — item 28 (client IDs; person IDs with People); D10; the billing states of
  item 11 once Office exists.
- **Office** — items 45, 44, 42, 43 in that order, with 13 and 14 as inputs, then 11 last;
  D1, D11, D13. The next new product, built in Phase 8 (owner, 2026-09-29).
- **Timeline** — items 1–3, 5–8, 10, 12, 18, 20, 22, 23, 25, 29, 32–41; D12, D14.
- **Systems as a whole** (portal, shared module, sign-in, hosting) — items 15–17, 21, 24,
  30, 31, 48–52; D3, D4, D7, D8, D13, D15. D6 is tabled.

Retired framings, for the record: v1.x "the app becomes the company's singular source of
truth, absorbing the 14 stores into Timeline's Company Data pages" (retired 2026-09-24);
the 2026-09-24 wording "a portal of sibling apps — Client Manager, Personnel Manager,
Design Resources Manager" (names superseded 2026-09-29; Design Resources is not one of the
four products and is tabled — owner, 2026-09-29, D6).

## 2. Roadmap

Three phases. Phase 7 is the one running now.

| Phase | Versions | Goal | Done when |
|---|---|---|---|
| **7 — Pilot readiness** (now) | v1.24 → v1.3x | Get Timeline ready for the pilot: the brief's P0 app fixes, checks of what already exists, the outside-the-app controls handed to their owners, and the §4 design decisions taken. Closeout moved to Office in Phase 9 (owner, 2026-09-29) | Pilot users create and update jobs without missing workers, lost edits or misleading dates, and at least one duplicate-entry step is named for removal [brief §9, §10.1] |
| **8 — Shared registries and Office** | v2.0.0, then a minor version per registry (Office and People have versions of their own) | Move the data onto shared registries (lists or tables, D15) with stable IDs: Clients, Projects, Cost Codes. Point Timeline at them, store assignments by person ID, and turn departments and shop closures into lists instead of code. Build **Office**, the next new product (owner, 2026-09-29), in project-cycle order (§1): job lead / forecast, estimate, job creation with cost codes and the QuickBooks / TCP hand-off (items 45, 44, 42, 43). Then **People** (cycle step 4: items 26, 27) | A `ShopTimeline_*` list is retired in favour of a shared registry with no data lost; two people asking for a cost code at the same moment can't get the same one; the cost-code workbook is frozen read-only; a job exists in Office before Timeline schedules it [brief §6, §8, §9 P1] |
| **9 — Systems: the portal and the products** | v2.x → v3 | The Systems portal at `/`; Clients as its own product (Office and People arrived in Phase 8); Office's closeout screen (item 11), the last step of the cycle; Timeline moved to `/timeline/`; one shared code module and design language, with each product keeping its own identity; permission sets per audience | Each audience (PM, HR, Accounting, Purchasing, Operations, Management) has its own product over the same records; records are created and deleted only in the product that owns them; nothing is typed in twice; a finished job can't slip through without its balance invoice [vision; brief §8.4–8.5, §9 P2–P3] |

**Batches.** A batch is a group of §3 items that ship together as one release; its version
number is given when it ships. Proposed:

| Batch | Contents (§3 items) |
|---|---|
| 1 — privacy and copy | 9a–9b first (the import fetches only the fields it uses; no fallback to a possibly personal phone — the owner's "cache is cache" ruling), then 4 (time-off notes private) and 1–2 (terminology; one meaning for Lock dates, with copy that explains it) |
| 2 | 25 (saved views follow the person ⚠ `savedViews`; Lock dates remembered per user), 7 (repeat work easier to find), 8 (label the department rollup band) |
| Seam (no release) | 48 (the storage seam), eight behaviour-neutral PRs interleaved after batch 1; PRs 1–2 first, since item 51's Azure spike waits on them |
| 3 | 5 (date certainty ⚠ `dateCertainty`), 6 (last update shown, stale flag) |
| Office (Phase 8) | Office's own releases, in project-cycle order: 45 (job lead / forecast), 44 (estimate), 42 (cost-code generation), 43 (job creation with the QuickBooks / TCP hand-off) |
| Office (Phase 9) | 11 (closeout and billing states ⚠), the last step of the cycle; moved out of the pilot 2026-09-29 |
| As they resolve | 3 (tour loop: reproduce, then fix), 10 (automatic Complete vs closeout), 19–24 |
| Style track | 52 (style guide §13 steps), slotted between the batches above. Step 2 shipped as v1.24.0. Step 3 is next, one chrome surface per PR, project inspector first. The D4 reshape (item 49) comes after the pilot P0 batches, and step 4 after the reshape |
| v2.0.0 | The Phase 8 cutover (§1 point 5) |

**What waits on what.** "Waits on" means the work can't start until the named item is done
or the named decision is taken.

*Ruled, and what each ruling unblocked:*

- **D2, ruled 2026-09-24: the colleague app is no constraint.** This unblocked D1 (moving
  to a shared registry), D10 / item 28 (person and client IDs), item 27 (splitting Staff)
  and item 29 (dropping dead columns). Nothing else was waiting on it.
- **D4, ruled 2026-09-28: one folder per product, the portal at the root** (option b;
  refined 2026-09-29 by the Systems definition, four peer products). **D8, ruled
  2026-09-29: the Company Data pages graduate into products of their own.** Together they
  unblock the shared module (the storage seam, item 48; `docs/Architecture-Review-Storage.md`,
  PR #56), the portal, and the People and Clients products. Still waiting on:
  - the reshape PR (item 49), which comes after the pilot P0 batches (⚠ the owner adds
    the new redirect URIs first, then `SETUP.md` is updated);
  - item 40's custom domain, before any repository rename (D4).
- **D3, the permission model, ruled in principle 2026-09-24** (tiered lists, one fact in
  one place; §4). The work by phase:
  - Phase 7, no dependencies: item 26 (define the tiers with HR and the Project
    Director), item 4 (time-off notes), item 9a (the import fetches only what it needs),
    item 25 (saved views per user).
  - Phase 8: item 27 (split Staff into a public roster and a restricted record). Waits on
    item 26, D5 (which list is the identity master) and the owner breaking permission
    inheritance on the new list.
  - Phase 9: role-based shared views (item 30, reusing item 25's format); People and
    Clients as products over the tiered lists; Office (items 11, 13). D6 Design Resources
    is tabled (owner, 2026-09-29).
- **Office is the next new product, built in project-cycle order — ruled 2026-09-29**
  (§1). Each step waits on the ones before it:
  - Item 45 job lead waits on D1 (the registry) and the Clients registry.
  - Item 44 estimate waits on item 45 and the Master Project Tracker material (§5).
  - Item 42 cost codes waits on item 13's inventory, D1 and item 28.
  - Item 43 job creation waits on items 42, 44, 45, D1 and item 28, and on D13 for the
    QuickBooks / TCP hand-off.
  - Item 11 closeout (Phase 9) waits on every step before it. Its columns are additive.
    The Bookkeeper's sign-in and the verifier role wait on D3's role vocabulary.

*Open, and what they wait on:*

- **D1, the core registry,** waits on item 14 (the schema comparison), which waits on the
  Current Projects and 27 Events schemas from the Project Director (§5). **v2.0.0** then
  waits on D1, item 28 and item 13's cost-code registry (which waits on the workbook
  inventory).
- **D15, the data platform** (reassessed 2026-10-08: Dataverse and Azure SQL + API are
  co-equal candidates), waits on four inputs:
  - the Dataverse licence quote and the half-day Web API spike;
  - a read-only Azure staging spike, which needs explicit approval to create Azure and
    Entra resources, and which waits on the first storage-seam PRs;
  - item 44's scope answer: line-item estimating in Office, or only an estimate reference;
  - named owners for whichever platform wins.

  Rule before the Phase 8 schema is provisioned (D1, D10). The storage seam and a
  backend-neutral schema go ahead whatever the ruling.
- **Item 5, date certainty,** waits on the Project Director's default-date decision (5a).
  **Item 2, Lock dates,** waits on the owner choosing one meaning; remembering the
  setting per user waits on item 25.
- **Item 12, calendar drift,** waits on finding who owns the flow (§5). **Item 19, PTO,**
  waits on the session with the operations manager. **D13, integrations,** waits on D3
  and D5 being settled (D2 is done) and on the CSV formats (§5).

## 3. Phase 7 work

Shipped items are ticked `[x]` where they sit, and item 31 is running. An unticked item is
not started unless its text says otherwise. Items are numbered from 1 in this file; items
from the retired backlog are cited as "v1.x item N". **Numbers are labels, not ranks**: an
item keeps its number when it moves, so read each band top to bottom for its order.

Each item reads the same way: what and why, then the steps, then what it waits on and who
decides, then its source in brackets.

### P0 — in the app, before the pilot [brief §9 row 1; §7]

What the pilot can't start without.

- [ ] **1. Terminology pass.** Rename two terms on screen: "Job code" becomes **Cost
      Code**, and "Drafter" becomes **Technical Designer**. *The Drafter half shipped in
      v1.31.1 (tracker #17, with #22's Project Team / Project Schedule headings). The Cost
      Code half is on tracker #21: the 2026-10-05 revised spec, then the owner's question of
      2026-10-06 ("should I use: costCode?" for the column name), which still needs an
      answer on the ticket. The §7.4 ledger holds the two
      "Drafter" echoes that remain (the Changelog key and the D chip).*
      - *Where:* sidebar, bar labels, tooltip, Meeting Sheet, late prompt, New Project.
        (Drafter had labels only on the project page and in the legend; the Cost Code
        list is #21's.)
      - *Labels only.* The stored field names (`jobCode`, `drafter`) stay, because the
        schema is shared.
      - *How:* round two of `docs/Copy-Coach-and-Helpers.md` (round one shipped in
        v1.15.1).
      - *Not in this item:* "flexible roles instead of fixed buckets" changes the data
        model. Today there are four fixed role columns (PM, Drafter, Project lead — Lead
        fabricator until v1.30.0, tracker #18 — and Fabricators) plus a legacy `metalFab`.
        That's Phase 8, §4 D10.
      [brief §7 Terminology]
- [ ] **2. Lock dates: give it one meaning, then explain it.** Confirmed P0 by user
      feedback (owner, 2026-09-24).
      - *Today it means two different things.* On the timeline it stops date changes:
        grabbing a bar's edge to resize turns into a move, and a move changes no dates.
        A drag can still move the bar into another department's or person's lane. On the
        project page it blocks *resizing only*, and a move still shifts dates.
      - *Steps:*
        - (a) The owner picks one meaning. Recommended: drag, move and resize never change
          dates, on both surfaces; lane changes stay allowed.
        - (b) Rename it (e.g. "Protect dates") and add a tooltip that says exactly what it
          stops.
        - (c) Remember the setting per user, not per browser session. Rides on item 25.
        - (d) Keep the viewer rule — always on for viewers, unless they have the
          `viewer.phases` grant — and say so in the tooltip.
      - *Waits on:* nothing for (a)–(b); item 25 for (c).
      [brief §5.1, §7 "Tour and Lock dates"]
- [ ] **3. The tour keeps looping: reproduce it, then fix or gate it.**
      - *Report (tracker #7, 2026-09-24):* the walkthrough loops between steps 6 and 7 of
        14. The browser wasn't recorded, so test Safari, Chrome, Edge and Firefox.
      - *Best guess:* a browser that forgets local storage every session (a private
        window, or a policy that clears site data on exit) loses the "tour seen" flag
        (`shopTimelineCoachSeen`) and replays the first-visit tour every time. Ask the
        reporting user about their browser and setup. No loop bug is on record.
      - *Fix options:* a "tour seen" flag per person (⚠ one Staff column), or a "don't
        show again" button on the tour card.
      - *History:* the owner ruled "leave it" on 2026-09-02; the brief is the complaint
        that ruling said would reopen it (§7.1, L1001). Related: the chained tour's step
        count assumes its second half opens on a draft (§7.3, L1233).
      - *On hold (owner, 2026-10-01 on the ticket):* "Hold pending dev testing."
      [brief §5.1, §9 P0 "tour fix"; tracker #7]
- [ ] **4. Keep time-off notes private.** Notes typed on an out-of-office range show to
      every signed-in user, in three places: the People record, the dashboard and the
      person panel. Hide them from non-admins, or leave the field out of non-admin views.
      This is the brief's suggested P0 addition. [brief §7.2, §9 Response]
- [ ] **5. Date certainty: Tentative / Confirmed / TBD.** Show whether a date is a
      commitment or a guess: an install date entered early reads as a commitment even when
      nobody has committed to it. Forecast status stays the *project's* state; certainty is
      about the *date*.
      - *Schema:* ⚠ one Projects column, `dateCertainty` (single line of text:
        `tentative`, `confirmed`, or empty = confirmed; `tbd` per step b). The app
        writes it only once the column exists, so other saves never fail (the tristate
        pattern, §6).
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
- [ ] **6. Show the last update; flag stale projects.** Who last edited a project and when
      (`updatedBy` / `updatedAt`) already comes from Graph, but shows only in hover cards
      (and, for admins, the change log). Put the last editor and time on the project page
      header and the Meeting Sheet. Add a "stale" chip in the sidebar and legend for a
      project with no edit in N days (N set with the Project Director). [brief §5.1, §7
      Reliability, §9 P1 "stale-data warnings"]
- [ ] **7. Make repeat department work easy to find.** The feature exists — each block is
      its own record, and Duplicate and New subtask work even before the first save —
      but users don't find it.
      - Put Duplicate on the bar's popover and right-click menu, not only in the
        inspector (§7.2, L1044).
      - Add the ⋯ hover cue to project-page bars (§7.1, L1011).
      - On New Project's divider: a grip that shows before hover (the cursor, tooltip,
        remembered height and collapse already exist), section progress, and links to
        the missing fields that Create already names.
      [brief §1, §7 Repeat work + New Project layout, §9 P0 "before shop-wide use", P1
      "small fix"]
- [ ] **8. Department rollup: label the band or drop it.** The faint band behind each
      department row runs from its first start to its last finish, gaps included, so it
      can read as continuous work. Label it "Overall span" or remove it.
      - *Fact-check correction:* two whole-project numbers also span gaps: the Meeting
        Sheet progress % (first start → last end) and the project page's "Lead time N
        workdays". Neither counts a gap as department work or load. If the rule is "gaps
        never read as work", the progress bar is the one to relabel or compute from the
        blocks.
      - Double-booking checks already use the actual blocks.
      [brief §7 Rollup, §8.2, §14]
- [ ] **9. Harden the employee import.** 9a goes first in the first batch (owner,
      2026-09-24: "browser cache but invisible is still browser cache").
      - (a) **Fetch only what's used.** The Employee Contacts import asks for every field
        (`items?expand=fields` with no `$select`), so Pay Type and PersonalEmail reach the
        importing admin's browser even though they're never stored or shown. Fix:
        `expand=fields($select=Title,Status,Email,…)`, naming only the six fields the
        import maps. Honest limit: this is the app behaving well, not a guarantee — an
        admin with site rights could still read the HR list directly. The real protection
        is SharePoint permissions on Employee Contacts itself: HR's list, HR's call (item
        26, D3).
      - (b) **No silent phone fallback.** A blank Primary Phone falls back to Phone, then to
        Mobile Phone (more likely personal). Drop the fallback and report the row as "no
        work phone".
      - (c) **What non-admins see** on the People page is now part of item 26's field map.
        Today every signed-in user sees name, nickname, title, phone, email, departments,
        time off, schedule, driver, **employment status and the ADMIN / DEV / FB permission
        badges**.
      - (d) Ask HR whether Primary Phone is ever a personal number.
      - *Waits on:* nothing for (a), (b), (d); item 26 for (c).
      [brief §7 Employee source, §8.1, §13]
- [ ] **10. Automatic status vs closeout.** A project set to Automatic marks itself
      Complete when its last install *or shipping* bar ends (v1.20.6). Under item 11,
      "work finished" and "closed out" are different states. Keep the automatic switch to
      Complete as the trigger that starts the closeout clock, never as something that
      hides a job from the closeout queue. [brief §7 Closeout Response, §8.4]
- [ ] **25. Saved views follow the person, not the browser** (owner ruling 2026-09-24).
      Today a saved view lives in one browser's local storage (`shopTimelineViews_v1`).
      - *Change:* store views on the signed-in user's own Staff row: ⚠ `savedViews` on
        `ShopTimeline_Staff`, multi-line text holding a JSON list, written only to the
        user's own row (as `personalNotes` already is).
      - *Migration:* on the first load after the release, copy the browser's views into
        the row, then keep the local copy as a cache.
      - *Result:* a view saved on any machine follows the person. The same row then holds
        other per-user settings that are session-only today: Lock dates (item 2c),
        density, and sidebar width if wanted.
      - *Later:* shared and role-based views (item 30, D3) reuse the same JSON format in
        Phase 9.
      - *Waits on:* nothing. Additive column; the spec comes with the batch.
      [brief §2 "plan saved views and permissions now", §7 Audience views]
- [ ] **32. Shipping bar missing; Shipping milestones don't attach.** A user added
      Shipping milestones, saw no Shipping bar, and the milestones didn't attach to the
      shipping phase. `shipping` has been an end department since v1.20.6 (`DEPTS`,
      `grp:'install'`). First, reproduce it on the real project: is Shipping ticked in the
      project's departments? Does the block exist without dates? Where does a milestone go
      when its phase has no bar? A bug; P0 for the pilot.
      - *Re-scoped on the ticket (2026-10-05):* the owner's clarification narrows it to the
        project page's Gantt. A milestone assigned to a phase (e.g. "ALL CNC DONE", Phase:
        CNC) sits in the top Milestones row instead of on that phase's bar.
        - *Root cause:* `npvRender` draws every milestone in the top row on purpose, per a
          2026-09-03 ask. The fix reverses that ruling for phased milestones.
        - The Shipping-bar half is met by the same placement rule once Shipping is ticked.
      - *Waits on:* the owner's "Proceed with fix" on the revised spec.
      [tracker #1]
- [ ] **53. A role change must move the project to the new holder** (P0 bug, tracker #34).
      When a project's PM, Technical Designer or Project lead changes after creation, the
      project stays under the old holder: a bar that carries its own crew ignores the
      project team.
      - *Owner's rule (2026-10-05):* every current view shows who holds the role now: the
        sidebar summaries, lanes, My Dashboard, the Meeting Sheet, chips and tooltips. The
        Gantt keeps the old holder on the days up to the change.
      - *Revised spec:* split a role-owned bar on the day of the change. The past part keeps
        the old holder, the part from today goes to the new one. Fabricators owns no bar.
      - *Approved:* "proceed with fix", 2026-10-06. Not built yet.
      [tracker #34]
- [x] **46. Update check.** Shipped v1.33.0 (PR #90, 2026-10-05). GitHub Pages serves
      `index.html` with `Cache-Control: max-age=600`, which the page's no-cache meta tags
      don't override, and the 90 s poll fetches data only — so a tab left open ran the old
      build for days. Now the app notices a newer build (a 12 h timer, plus a check when
      the tab comes back into view, throttled to once per 30 min: one GET of its own
      `index.html` with `cache:'no-store'`, compare the `APP_VER` inside), shows "vX is
      available — Reload" and keeps it until acted on; nothing reloads by itself. Honours
      a `ShopTimeline_Config` key `update.minVersion`: a running build older than it shows
      "This version has been retired" and reloads after 30 s. **Owner rule (2026-10-05): an
      update never costs anyone work** — no check runs and no countdown ticks while someone
      is on New Project (dirty or not), editing, dragging, in an overlay or menu, on the
      tour, typing, or saving; even a deliberate Reload is refused while a save hasn't
      landed or a record is mid-edit; a dirty draft is stashed and restored across the
      reload. The lever is **Help ▸ App settings ▸ Ask
      everyone to reload** (writes the key; pressed from production, never from
      `/preview/` — a minVersion the served build can't satisfy never starts a reload
      loop) or a plain list edit. After a reload onto a new build, a one-time "Updated to
      vX — What's new" toast opens Help ▸ Release notes; first-ever visitors get none.
      [owner ask 2026-10-05]

### P0 — outside the app: owners, not releases [brief §1, §6, §7.1, §9, §11]

These need someone to own them in SharePoint, Power Automate or the business, not an app
release. Where the app has a part, it's listed.

- [ ] **12. Stop the calendar drifting.** Shop calendars drift because nobody has
      declared which record is the event of record. Leadership declares **27 Events** the master
      record for events. Each Outlook event gets an "Edit source" link back to it, and 27
      Events stores the Outlook IDs and sync state.
      - *Owners:* the Project Director, and whoever owns the 27 Events → Outlook flows
        (unknown, §5).
      - *App:* nothing until §4 D1 / D11 decide whether Timeline's own
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
        them. The owning product is Office (§1); Timeline only ever picks.
      [brief §6, §9 P0 "Before integrations"]
- [ ] **14. Decide the core project registry** (§4 D1). Before deciding, produce a
      side-by-side schema comparison of Current 2-7 Projects / 27 Projects (Archive) and
      `ShopTimeline_Projects`, including what 27 Events and Teams depend on in Current
      Projects. Robert can do this with read access alone. The comparison is needed
      whatever D15 decides: the two lists hold the business knowledge that has to migrate,
      and their dependents are what a cutover re-points (2026-10-08). [brief §6.7, §14]
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
- [ ] **16. Backup maintainer and rollback procedure.** The backup maintainer is Hubert
      (owner, 2026-09-24, "for now"). Still to do:
      - Give Hubert access to the repository (as a collaborator working through ordinary
        branches and pull requests; the `sandbox` branch flow in
        `docs/Archive/Onboarding-Fork.md` was retired 2026-10-01), Pages, the Entra app
        registration (at least the right to edit redirect URIs) and the recovery docs
        (`SETUP.md`, `CONTRIBUTING.md`, `reference/Handoff-Notes.md`). He has no GitHub
        account yet (owner, 2026-09-25); creating one is the first step, and it also
        opens item 31's private tracker to him.
      - Write the one-paragraph rollback: `git revert` on `main`, and Actions redeploys.
      - Start tagging releases (`v1.23.0` and so on); there are no release tags today.
      [brief §5.1, §11]
- [ ] **17. Keep test data out of production.** `/preview/` writes to the
      live lists, so every pilot test edit is a real edit, and the brief's technical-test
      stage would put test jobs into production data. Options: a test SharePoint site
      with the nine lists cloned (⚠ the owner creates it; the app finds lists by site and
      name), or a switch on the preview build that adds a suffix to list names. Decide
      before the pilot's stage 3.
      - *If D15 picks Dataverse or Azure SQL + API (2026-10-08):* staging becomes a
        separate environment: `/preview/` → staging API → staging database, `/` →
        production. It is mandatory before any write path is built, so no agent needs
        production data for ordinary work, and migrations, authorization and concurrency
        tests run against a database that can be wiped. This item and that staging are one
        piece of work, not two (`docs/Architecture-Review-Backend.md` §E8).
      [brief §10, §11.1]
- [ ] **18. Preload the pilot projects.** The Project Director and Robert enter the pilot
      jobs, so PMs check them instead of re-entering them. Set the end date for parallel
      entry up front, and limit how many projects the pilot covers. [brief §10, §10.2]
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
      - *Feeds:* item 27 and D5. Until item 27 ships, items 4 and 9a are the only
        protection, and the pilot's stated limits should say so.
      [brief §7 Employee source, §8.1, §11.1; vision]
- [ ] **31. Each feedback report becomes a GitHub issue, screenshots included. RUNNING
      since 2026-09-25.** Priority (owner, 2026-09-24: "whatever is easiest to implement
      that is automated").
      - *How it works:* a GitHub Actions job (the "poller") in the private tracker
        repository `221twoseven/Project-Scheduler-issues` reads `ShopTimeline_Feedback`,
        opens one issue per new report, and writes the issue link back to the row (⚠
        `ghIssue`, single line of text). The screenshot is copied from the site's
        `/ShopTimeline Feedback/` upload folder into the tracker's `screenshots/` and
        shown in the issue; issues are labelled `bug` or `feature`. The poller signs in
        as its own app-only Entra registration (application permission
        `Sites.Selected`, granted `write` on the TWOSEVENINC site only); its secret
        lives in the tracker, never in the app or this repository. The owner's one-time
        setup is done. Full entry: `docs/Automations.md` (Feedback poller). Record:
        `docs/Milestones/Phase-7-Pilot-Readiness/2026-09-25-feedback-github-bridge.md`.
      - *What it had to do:* a user submits a report; it's mailed to the
        `feedbackRecipient`s (as before); a GitHub issue that Claude can read and act on
        is opened, screenshots included; and it's folded into this file on request
        (`gh issue list`).
      - *Why this route:* the app can't file issues itself, because no token can live in
        a public web page. Power Automate's standard GitHub connector can create issues
        but can't move a screenshot into GitHub (the premium HTTP action could, but only
        with a Premium licence). The tracker is private because reporter names,
        descriptions and shop screenshots would otherwise be public; this code repository
        can't be private on GitHub Free, because Pages needs it public.
      - *Status follows GitHub* (rule set 2026-09-25): closing a ticket marks the row
        `resolved` (it moves to the Resolved column of the Open Issues page), and
        reopening clears it. The poller runs on every close or reopen (about a minute),
        hourly on a best-effort schedule (GitHub doesn't always fire it on time), and on
        demand (`gh workflow run`). The first day's two-way rule — resolving in the app
        closed the ticket — was dropped, because it re-closed reopened tickets. Side
        effect: once a report has a ticket, the developer page's Mark resolved / Reopen
        buttons are overridden by the next run. Ledgered in §7.4; remove them with the
        next change to `renderReports` (item 39 shipped without touching that page).
      - *Day one:* the first run filed tracker #1–#12 from 13 rows, carried in as items
        32–40. Open rows were back-filled; resolved history stays on the list. Commits
        in this repository close tickets with
        `Fixes 221twoseven/Project-Scheduler-issues#N`.
      - *Hubert* has no GitHub account (owner, 2026-09-25), so tracker access for him is
        skipped; he sees reports in the app and in the feedback mail.
      - *Still to do* (from `docs/Automations.md`, 2026-10-08):
        - build the **Email reply in** flow (tracker README step 10) and export it to the
          tracker's `flows/`;
        - confirm the **Reply email** subject and body change, marked pending since
          2026-10-01, and re-export the flow;
        - add a co-owner to each flow (the backup maintainer, item 16).
      - *Later, optional:* the developer Bug Reports page could print the `ghIssue` link
        (two lines).
      - *Rollback:* disable the workflow and delete the secret. The app and the list are
        untouched apart from the added column.
      [owner ask 2026-09-24; brief §11 maintenance]

### P1 — checks and small fixes [brief §9 P1]

- [ ] **19. Check the PTO source and its edge cases.** Availability today comes from
      out-of-office ranges typed on the People page: whole days only, and back-to-back
      ranges aren't merged for "Away until". The PTO Contract Approvals list (fed by the
      operations manager's Teams PowerApps plugin) isn't connected. The discovery session
      planned for mid-September isn't on record as held: schedule it, and use the same
      session to identify the nightly 10 pm automation on 27 Employees. Test: multiple,
      adjacent and overlapping requests; partial days; cancellations; people without a
      company email. [brief §7.2, §13]
- [ ] **20. Write down the change log's limits** (the brief's verification row).
      - *What it covers:* projects, phases, milestones and notes — not people, clients or
        settings. Admins only. History starts 2026-09-02.
      - *No retention limit and no export.* Each time its cache is empty it reads the
        whole list (in pages); the screens show the latest 500 entries, or 300 per
        project.
      - *It isn't a restore tool:* recovery is in-session undo (projects only, 20 steps,
        lost on reload) or SharePoint (Recycle Bin for deletes, version history for
        edits). The log is evidence.
      - Most of this is in the 2026-09-02 milestone record; retention and recovery are
        the missing paragraphs.
      [brief §7.2]
- [ ] **21. Refresh the reference docs before reviewers see the repository.** The
      living docs have drifted from the code:
      - `docs/ARCHITECTURE.md` documents 5 lists (9 are in use, plus Employee Contacts);
        leaves out the client, config, changelog and feedback mappers and the
        `#/people`, `#/clients`, `#/changelog`, `#/settings`, `#/reports` routes; and
        predates Logistics, Shipping and the `othoffice` retirement.
      - `SETUP.md` lists 2 Graph scopes; 4 are in use (`User.Read`,
        `Sites.ReadWrite.All`, `TeamMember.Read.All`, `Mail.Send`).
      - A count gone stale: `CLAUDE.md` says "roughly seven thousand lines" (it also says
        to trust `wc -l`); the file is 11,941 lines at v1.41.1. (`tests/README.md` no longer
        states a suite count and points to `tests/run.js`: that half is done.)
      - Record the Feedback Bot registration: its client ID is in no file this repository
        controls (only the tracker's Actions secret), and its secret expires on
        **2028-09-23**, after which the poller fails with `token: 401`. Both go in
        `SETUP.md` (`docs/Architecture-Review-Storage.md`, open question 4).
      - Add a short "formulas and rollup" section: `generateSchedule` (works backward
        from the install date, skipping weekends and the coded holidays),
        `estimatedDays`, the Meeting Sheet %, Lead time.
      [brief §13 "The app" row; §8 standing rule]
- [ ] **22. Meeting Sheet as the AMPM handout.** It already prints per PM: status,
      current phase, dates, install date and workdays left. Get the AMPM columns of the
      Master Project Tracker from the Project Director and compare; add the closeout /
      aging column when item 11 lands. [brief §3 step 9, §9 P1 "AMPM output"]
- [ ] **23. Milestone records owed** (the `CLAUDE.md` rule): v1.20.6 Shipping phase (it
      changed the phase chain and the department vocabulary, but is documented only as a
      footnote), v1.20.8 (PM required at Create; dashboard columns scroll), v1.20.9. The
      v1.x version ladder also has no rows for v1.20.0–v1.20.9 and v1.21.x: add one
      combined row each to the archive's §4, the way `CHANGELOG.md` combines v1.14–1.15.
      Also owed from Phase 7 (found 2026-10-08):
      - **v1.40.1**: Open Issues column labels;
      - **v1.41.1**: the narrow-sidebar lens switch. Its before/after screenshots are
        already in `Phase-7-Pilot-Readiness/screenshots/`.

      Docs only.
- [ ] **24. Repository ownership.** `github.com/221twoseven` is a personal GitHub account
      named after the company, not an Organization: there are no org owners, single
      sign-on or team roles, so continuity rests on one login. If leadership's
      "company-owned code" requirement matters, plan a transfer to an Organization (the
      Pages URL and the Entra redirect URIs then have to be re-registered — `SETUP.md`).
      The repository is public, because Pages hosting needs it. That's safe, since access
      depends on Microsoft sign-in, but leadership should know. [brief §11]
- [ ] **48. The storage seam.** One `store` object owns every conversation with
      SharePoint, instead of 37 call sites in 16 functions. It is idea 1 of
      `docs/Architecture-Review-Storage.md`, needed whatever D15 decides, and the path to an
      `apiStore` if D15 picks an API.
      - *The eight PRs*, in order, each on its own branch off `development`:
        1. the `store` object with no callers;
        2. Projects, Tasks, To-dos and Events;
        3. Staff;
        4. Clients and Config;
        5. Changelog and Feedback (adds `store.upload`);
        6. the Employee Contacts import;
        7. identity and the Microsoft extras (`signIn` / `who`, Team members, mail);
        8. one error rule.
      - *Done when, for each PR:* no `APP_VER` bump and no `CHANGELOG.md` line, and
        `npm test` is green **with no assertion edits** (the neutrality proof). The one
        exception is PR 8, the only one that changes user-visible strings. One milestone
        record when the sequence closes.
      - *Placement (2026-10-08):* after batch 1, interleaved with the batches that follow.
        PRs 1–2 are also what item 51's Azure spike waits on.
      - *Waits on:* nothing.
      [`docs/Architecture-Review-Storage.md` §1, "Proposed PR sequence"; D4; D15]
- [ ] **51. D15's inputs: the platform spikes and the facts a ruling needs.** D15 is
      ruled before the Phase 8 schema is provisioned, on these:
      - *Dataverse:* a licence quote (headcount × $20, $22 from 2027-01-01, plus any
        licences the tenant already holds; §5) and a half-day spike: one read and one write
        to the Dataverse Web API from a Pages-hosted page with an MSAL delegated token.
      - *Azure (read-only, isolated staging):*
        - Bicep staging resources and a TypeScript API (App Service, Fastify);
        - Entra-authenticated access, and managed identity to a staging Azure SQL
          database;
        - three `GET` endpoints, and an `apiStore` behind a developer switch in preview;
        - no production writes.

        The plan, the questions it must answer and the rollback are in
        `docs/Architecture-Review-Backend.md` §E16.
      - *People:* item 44's scope answer, and the named platform owners (§5).
      - ⚠ The Azure spike needs explicit approval to create Azure resources and Entra
        registrations before any of it starts (`CLAUDE.md`).
      - *Waits on:* item 48 PRs 1–2 (the Azure spike only); the approvals above.
      [D15; `docs/Architecture-Review-Backend.md`]
- [ ] **52. The style track: suite style guide §13 steps 3–5.** The migration sequence in
      `design/TwoSeven-Application-Style-Guide.md` §13. Step 1 (baseline) and step 2 (tokens
      and readable chrome text, v1.24.0) are done.
      - *Step 3:* restyle one chrome surface per PR, project inspector first: type
        hierarchy, spacing, radii, fields, focus, buttons, and modal focus trapping where
        it's missing. Next.
      - *Step 4:* the shell as one change: the global header and a real app switcher.
        Waits on item 49 (the portal must exist to switch to).
      - *Step 5:* business pages and routing: read-first records, sorting, empty states,
        per-record routes.
      - *Done when, per PR:* before/after `/preview/` screenshots, the Design-Language §9
        checklist, and the §13 verification list. A visible change follows the version and
        changelog rules. Steps 6–7 are rules for how the steps are done, not work of their
        own.
      [style guide §13; `design/Style-Transition-Review.md`]

### Not yet placed — reported by users, in filing order [tracker]

Each report filed in the app becomes an issue in the private tracker
(`221twoseven/Project-Scheduler-issues`, item 31). **[tracker #N]** cites it; reporter
names stay there. These haven't been placed in a band yet. Already placed or closed: #1
is item 32 (P0), #7 is part of item 3, and #11 and #14 were done by the bridge itself.

- [x] **33. Today button: put the current week at the left edge.** Shipped v1.27.0 (PR #82,
      2026-10-02): Today, `T`, the popover's Today pick and the default view all put Monday
      of the current week at the left edge (`weekLeftX`); the other jumps still centre. The
      owner's Proceed added a light grey wash over past days (`.past-col`). The §7.5
      ceiling was rewritten in place. [tracker #2]
- [x] **34. Name a repeat block (e.g. "possible mock-up days").** Shipped v1.38.0 (PR #99,
      2026-10-05): double-click a bar or calendar band (or right-click → Rename)
      renames it in place on the project page and the draft; the dashboard's Edit Phase
      dialog gained a Name field and opens with it focused (a bar double-click can no
      longer close it); calendar milestone bands and the Meeting Sheet's "Phase now" read
      the block's name. The §7.3 L1092 entry is struck. [tracker #3, screenshot in the
      issue]
- [x] **35. Keep phase labels visible while scrolling.** The text inside a bar ("Technical
      Design", "Main Shop Fab") scrolls off with the bar. Keep it pinned at the left edge
      of the canvas, next to the sidebar, like a sticky caption. A design item
      (`Design-Language.md`, bar labels): `position: sticky` inside the bar, or repaint
      the label on scroll. [tracker #4, screenshot in the issue] — v1.36.0 (PR #98): the label
      (and the project row's status pill) parks at the visible left edge on the dashboard
      and the project page, ellipsised at its bar's end.
- [ ] **36. Create projects from the calendar.** Drag across dates on the calendar to
      create a phase or milestone, then fill in the details in the bottom panel — simpler
      than building in the Gantt. The calendar can already resize and move existing bars
      by drag (v1.9.0–v1.11.0), but not create them. A larger feature; after the pilot,
      unless the owner ranks it higher.
      - *Ticket closed 2026-10-05:* the reply to the reporter pointed out that
        double-clicking the calendar already opens "add a phase". The owner asked for the
        drag-to-create request to stay here, so it does.
      [tracker #5]
- [x] **37. Completed projects: a filter and a marker.** Shipped v1.37.0 (PR #97,
      2026-10-05): an Active / Completed / All switch in the sidebar header (three presets
      of the existing status filter; opens on Active, remembered per browser), completed
      rows muted with a grey Completed tag. Original ask: completed jobs stay in the main
      view with no clear sign in the sidebar. The ask: take them off the active view, or
      add an Active / Completed filter (they must stay reachable for revisions, closeout
      and billing). If they stay listed, mark them clearly as Completed — a label under
      the name, a muted row or strike-through, not red. The status checklist can already
      hide Complete; what's missing is the default and the marker. Linked to items 10–11
      (Complete isn't the same as closed out). [tracker #6]
- [x] **38. Export every view to PDF, Letter or Tabloid.** Shipped v1.40.0 (2026-10-05):
      Letter or Tabloid picked in the Print menu and remembered per browser; the app lays
      out its own page boxes (header, legend, Page X of Y) for the Gantt (whole-week
      slices, Compact rows, a project never split from its phases), a project's Gantt or
      Calendar (one month per page, from its page, drafts included) and the Meeting Sheet
      (landscape or portrait; honours Status, Client and Person; search and spotlight
      fade as on screen); "Timeline + Meeting Sheet" is one PDF; the export is the
      browser's Save as PDF, no library. Seven sample PDFs on the PR. [tracker #8, #9]
- [x] **39. Open Issues page cuts titles at 80 characters — add a Subject.** Shipped
      v1.28.0 (PR #83, 2026-10-02): the report form asks for a required one-line Subject
      (up to 120 characters) stored as `Title` (no new column) and shown on Open Issues;
      the full description folds under the subject for every signed-in person (the
      owner's default for "public"); old reports keep their stored titles and unfold
      their text too. The developer page was not touched, so the §7.4 ledger entry on its
      buttons now waits for the next change to `renderReports`. [tracker #10]
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
      [tracker #12]
- [x] **41. People page: column widths.** Shipped v1.26.3 (PR #81, 2026-10-02), with tracker
      #27's header spill-over in the same PR. The columns are hard to line up. Make each fit
      its text without spilling over, keep the table inside the page column instead of
      the full width, and make a width change affect only that column (today resizing one
      shifts its neighbours). Company Data table CSS (`table-layout`, per-column widths).
      [tracker #13]
- [x] **Departments: changing the days did not move the end date.** Shipped v1.34.1
      (PR #96, 2026-10-05): one rule for every days field (the Departments row, the bottom panel,
      the bar's popover), on the draft and the saved page — the start stays, the end is the
      start plus N days (workdays for shop departments, calendar days for Installation and
      Shipping). A draft bar nobody has typed or dragged still follows the scheduler.
      [tracker #32]
- [x] **47. Departments view: a project's line reads its Cost Code, not its name.** (Filed as a
      second "42"; relabelled 47 on 2026-10-08, so 42 is Office's cost-code generation
      only.) Shipped
      v1.35.0 (PR #95, 2026-10-05): the line under a person shows the Cost Code in the
      dates' mono type so it fits whole at the default sidebar width; the hover tip reads
      "Client · Project name · Cost code". A project with no code keeps its name (and item
      24's muted client in front). Print follows the screen, so a coded line prints as code
      and dates. [tracker #33]
- [x] **A status on every open report: pending, in review, resolved.** Shipped v1.39.0
      (PR #94, 2026-10-05): the tracker's poller reads the status off the ticket — closed →
      `resolved`, open with a team comment (a spec, a Fix shipped note, a `/reply` or
      `/comment`) → `review`, open and untouched → empty — and writes the row only when it
      differs. Open Issues tags each open row PENDING or IN REVIEW; the developer page shows
      all three and, on rows with a ticket, "Status follows the ticket" with the link in
      place of Mark resolved / Reopen (§7.4 ledger entry ticked). Nothing is set by hand and
      a status change sends no email. [tracker #29]

**Shipped or closed with no §3 item** (before the 2026-10-08 every-task rule; the full
record is each ticket's "Fix shipped" note and `CHANGELOG.md`):

| Tracker | What | Outcome |
|---|---|---|
| #14 | Ticket status shows in the app | Item 31's poller, 2026-09-25 (no app release) |
| #15, #20 | The install date comes from the Installation / Shipping block; Created on is separate | v1.26.0 (PR #78) |
| #16 | Several work periods per department | v1.32.0 (PR #88) |
| #17, #22 | Technical Designer; Project Team / Project Schedule headings | v1.31.1 (PR #87), half of item 1 |
| #18 | Project lead from any department | v1.30.0 (PR #85) |
| #19 | Team lists alphabetical, with search | v1.29.0 (PR #84) |
| #23 | Undo notifications no longer cover the chart | v1.26.2 (PR #80) |
| #24 | The client on the dashboard | v1.31.0 (PR #86) |
| #25 | A click on blank chart closes the phase panel | v1.26.1 (PR #79) |
| #26 | Installation and Shipping dates stay as typed | v1.25.2 (PR #77) |
| #27 | People page header no longer spills into the panel | v1.26.3 (PR #81), with item 41 |
| #28 | "Past projects show up" | Closed, no change: the table was misread (2026-10-01) |
| #30 | Phone layout for every page | Declined, 2026-10-01 (§7.5) |
| #31 | A test ticket | Closed |
| — | Owner asks with no ticket: issue replies (v1.25.0–1.25.1), days beside dates (v1.33.1), resolved dates and `/comment` (v1.34.0), Open Issues column labels (v1.40.1), print formatting (v1.41.0), the narrow-sidebar lens switch (v1.41.1) | Shipped |

### Queued for Phase 8 — waiting on other work (see "What waits on what", §2)

- [ ] **27. Split `ShopTimeline_Staff` into a public roster and a restricted personnel
      record.** Every site member can read the whole Staff list today (item 26).
      - A new list holds only the restricted fields plus each person's stable ID. It
        lives on this site with its own permissions (inheritance broken), or on a
        separate HR site, and HR controls who can read it. The restricted columns move
        off Staff.
      - The app reads the restricted list only if the user's token is allowed to (a 403
        "forbidden" falls back quietly, the way `STAFF_OK` does today) and joins rows by
        ID. Each fact lives in one place; nothing is copied.
      - People (§1) becomes its editor; Timeline shows what the roster holds.
      - *Owner action:* break inheritance or create the site (site admin).
      - ⚠ Destructive on Staff (columns move): a milestone record plus a migration of
        existing rows.
      - *Waits on:* item 26, D5, D3. (D2 is lifted.)
      [brief §8.1, §11.1; vision]
- [ ] **28. Stable IDs.** Names are the join key today, which is why `canonName` and the
      legacy-name scrub exist. Link records by ID instead (D10).
      - `clientId` on Projects: additive, with a one-time backfill from client name to ID
        in the same milestone. `spId` (the SharePoint item ID) is the key until Clients
        get an `appId`.
      - `personId` on assignments (Tasks and the project role fields), so the
        name-matching helpers (`canonName` and the legacy-name scrub) can retire.
      - D2 is lifted, so Tasks can change. ⚠
      [brief §8]
- [ ] **29. Drop the dead columns** `metalFab`, `labels` and `checklist` (§7.2, L1040). A
      deliberate cleanup now that D2 is lifted. The app stops writing them one release
      before the columns are deleted; milestone record. ⚠
- [ ] **49. The Systems portal and the Timeline move (D4's reshape PR).** Timeline moves
      from `/` to `/timeline/`, and a static portal page of product tiles takes `/`. One
      release, one `CHANGELOG.md` line, no behaviour change.
      - The PR touches:
        - the Pages workflow's sparse-checkout paths and markup guard;
        - one portal line that forwards old `#/…` links to `timeline/`;
        - `tests/run.js`'s default target.
      - ⚠ The owner adds the `/timeline/` and `/preview/timeline/` redirect URIs *before*
        the merge, then `SETUP.md` is updated.
      - *Placement:* after the pilot P0 batches, before style guide §13 step 4.
      - *Waits on:* the pilot P0 batches; the redirect URIs. A repository rename waits on
        item 40, never before it.
      [D4]
- [ ] **50. The storage review's other follow-ups** (`docs/Architecture-Review-Storage.md`
      ideas 2–4, open questions 1–3):
      - *Provisioning as code:* `provision.mjs` in the private tracker creates lists and
        columns from one spec, which also records the column types the repo lacks. ⚠ It
        runs under the Feedback Bot, whose site grant rises from `write` to `manage`.
        Under D15 B or C this shrinks to files and test sites (item 17).
      - *Scope swap:* the SPA's `Sites.ReadWrite.All` is replaced by a delegated
        `Sites.Selected` grant on TWOSEVENINC. ⚠ Entra. Timed with the shared
        registration.
      - *One shared registration for the browser products*, a separate one for bots, and
        a product prefix on browser-storage keys from the first shared-module PR.
      - *Waits on:* item 48; the owner's answers to the review's questions 1–3; D15 (it
        decides how much of the provisioning work is needed).
      [`docs/Architecture-Review-Storage.md` §2–§4]

### Queued — Office, the next product, in project-cycle order (owner, 2026-09-29) [brief §6, §8.4–8.6; vision]

Office is the first new product to be built, in the order a job moves through the shop
(§1): lead, estimate, creation. Items 13 and 14, in the P0 outside-the-app band, are its
inputs. Closeout is the last step of the cycle and comes last.

- [ ] **45. Job lead and forecast in Office.** Cycle step 1 (Phase 8).
      - *Today:* a forecast is a Timeline project with the `forecast` status — a real
        project record, pencilled in grey, created on New Project.
      - *In Office:* a lead is a record that exists *before* the job: the client (from
        Clients), the scope, the expected install window, and who is chasing it. It
        becomes a job at creation (item 43). Timeline shows a lead as a forecast bar only
        once it has dates worth scheduling.
      - Existing Forecast-status projects become leads when Office ships.
      - *Waits on:* D1 (the registry), the Clients registry.
      [vision; brief §7 Early dates]
- [ ] **44. Estimate in Office.** Cycle step 2 (Phase 8). An estimate reference on the
      lead from item 45 — number, revision, sent and approved dates; a client revision
      creates a new revision; unbilled scope later blocks Ready at closeout — plus budget
      views per project. Nothing beyond that is specified: scope it with the Project
      Director and the Bookkeeper before design.
      - *Reference material (2026-10-08):* Davis's estimator, a working Next.js /
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
        (duplicate masters, D1).
      - *Discovery before any schema is canonized:*
        - several PMs each re-enter two or three recent estimates of different shapes in
          its model, so the question answered is whether it models TwoSeven's estimating,
          not one estimator's practice;
        - ask, don't assume, whether the cost taxonomy needs subcontracting, freight,
          rentals, travel, engineering, specialty vendors, contingency, PM / design time,
          rush / overtime, client-supplied items or allowances;
        - ask whether internal cost → contingency → markup / margin → client price are
          separate layers per line (the basis for estimate vs actual, variance and margin
          later, and for D3's tiers);
        - pin down revision and lock semantics, catalog ownership, and the hand-off to
          items 42 / 43.
      - *Its scope answer is a D15 input:* line-item estimating in Office, or only an
        estimate reference. Also open: adopt the estimator's concepts, absorb a hardened
        estimator, or keep it external (`docs/Architecture-Review-Backend.md` §F).
      - *Waits on:* item 45; the Master Project Tracker material (§5); the estimator
        walkthrough and PM samples (§5).
      [brief §8.6; vision]
- [ ] **42. Cost-code generation in Office.** Cycle step 3 (Phase 8), together with item
      43.
      - *Today:* `jobCode` is free text typed on New Project, with no format, duplicate or
        lifecycle check (item 13).
      - *In Office:* generate the next code from the cost-code registry — the client's
        alias from Clients plus the next sequence number — enforcing the workbook's format
        and duplicate rules (item 13's inventory) at creation. Timeline and every other
        product only pick from the registry; nobody types a code.
      - *Waits on:* item 13's inventory (the rules), D1 (the registry), item 28 (client
        IDs).
      [brief §6, §9 P0 "Before integrations"; vision]
- [ ] **43. Job creation in Office, with the cost code and the QuickBooks / TCP
      hand-off.** Cycle step 3 (Phase 8).
      - *Today:* a project is created on Timeline's New Project page: name, client, cost
        code, install date, team, departments.
      - *In Office* (the ownership rule, §1): Office creates the job from the lead and the
        estimate (items 45, 44) — name, client from Clients, cost code from item 42,
        install date and its certainty (item 5), the PM. It hands the code to QuickBooks
        and TCP (D13: CSV first, APIs through Power Automate). Then Timeline schedules it.
      - Office gets a create screen over the Projects registry.
      - Timeline's New Project becomes "schedule this job": it loses the setup fields and
        gains a picker of unscheduled jobs. The draft page's scheduler
        (`generateSchedule`) doesn't change.
      - Until Office exists, New Project stays in Timeline unchanged.
      - *Waits on:* D1, item 28 (client IDs), items 42, 44, 45; D13 for the hand-off.
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
        belongs to a role or a named person (§4 D3).
      - Moved out of the pilot 2026-09-29 (owner).
      [brief §8.4–8.5, §9 "Business control"]

### Queued for Phase 9

- [ ] **30. Role-based shared views, and the products.** Shared views (leadership,
      department, PM, later `terminal`) using item 25's JSON format and stored in `ShopTimeline_Config` or a views list.
      Also Phase 9: **People** and **Clients** as their own products over the tiered
      lists (items 27–28), and **Office** (items 11, 13). Design Resources is tabled (D6,
      owner 2026-09-29).
      - *Waits on:* D3's role vocabulary. (D4 was ruled 2026-09-28.)

### Owner confirmations — answered 2026-09-24

- [x] `ShopTimeline_Config` **exists** (owner). The developer App Settings switches are
      shared through the list; "Listening to" (§7.3) now only needs the owner's call to
      promote or drop it.
- [x] The People page **is up to date** (owner): the `status` import has run.
- [x] The condensed brief **is in the repository**:
      `reference/2026-09-22-Shop-Timeline-Brief-Condensed.md` (dated title; the mailbox
      name, headcount and a location generalized, because the repository is public).

## 4. Decisions Systems forces (record rulings here, dated)

Each decision reads the same way: the question, the facts that shape it, the options,
then the recommendation or the dated ruling.

| | Decision | Status |
|---|---|---|
| D1 | Core project registry | Open — waits on item 14 |
| D2 | The colleague app and schema parity | **Ruled** 2026-09-24 |
| D3 | Permission model and enforcement | **Ruled in principle** 2026-09-24 |
| D4 | Architecture for more than one product | **Ruled** 2026-09-28, refined 2026-09-29 |
| D5 | Employee Directory identity | Open |
| D6 | Design Resources and secrets | Tabled 2026-09-29 |
| D7 | What v2.0.0 means | Open — recommendation stands |
| D8 | The Company Data pages' future | **Ruled** 2026-09-29 |
| D9 | Worker type vocabulary | Open |
| D10 | Stable IDs | Open |
| D11 | Departments and shop closures as data | Open |
| D12 | Polling budget | Open |
| D13 | Integrations: ADP, TimeClock+, QuickBooks | Open |
| D14 | Shop terminal / TV mode | Parked |
| D15 | Data platform: SharePoint lists, Dataverse or Azure | Open — raised 2026-10-01, reassessed 2026-10-08 |

- **D1 — Core project registry.** *Open.* Which list becomes the company's one project
  registry: Current 2-7 Projects, extended (brief §6.7), or `ShopTimeline_Projects`,
  promoted?
  *Recommend:* run item 14's schema comparison first. Whichever wins, the other becomes a
  read-only mirror for one parallel period, then is retired — never a permanent two-way
  sync between two editable masters. Moving off `ShopTimeline_Projects` is no longer
  blocked by the colleague app (D2), but the migration record still names what changes.
  Whichever list wins, Office (Phase 8) edits its setup fields and Timeline its
  operational ones (owner, 2026-09-29).
  *The business rule and the storage, separated (2026-10-08):* the ruling D1 needs is
  **exactly one authoritative Project record per job, and no permanent two-master sync**.
  That holds on any platform. *Which store holds it* follows D15: on SharePoint, one of
  the two lists above; on Dataverse or Azure SQL, possibly a new `Projects` table that
  neither list becomes. Item 14's comparison is needed either way, because both lists hold
  business knowledge that has to migrate and dependents that have to be re-pointed.
  [brief §6.7, §14]
- **D2 — The colleague app and schema parity.** *Ruled 2026-09-24 (owner).* The colleague
  app still runs but isn't used and won't be again. Breaking it through a schema or
  data-store change is accepted collateral, so **the additive-only rule is lifted**
  (`CLAUDE.md` updated).
  What stays: the lists are still shared in the plainer sense — people hand-edit them on
  the site, and flows may use them — so a destructive change (rename, delete, type
  change, moving a store) gets a milestone record naming what it breaks and how existing
  rows migrate. Unblocked: D1, D10 / item 28, item 27, item 29.
- **D3 — Permission model and enforcement.** *Ruled in principle 2026-09-24 (owner):*
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
  - *The mechanism depends on D15 (2026-10-08); the principle doesn't.* Hiding in the UI
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
- **D4 — Architecture for more than one product.** *Ruled 2026-09-28 (owner): option (b).
  Refined 2026-09-29 with the Systems definition (§1).* One repository, one Pages site,
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
  - *The reshape PR* (item 49). Moving Timeline is its own PR that changes no behaviour: one
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
    never before.
  - *Refinement for Systems (2026-09-29):* the products are peers — Timeline isn't the
    parent — each with its own owner, version, release notes and test suites. The portal
    shows tiles only for the products whose lists the signed-in user's token can read.
    The wordmark in every product links to the portal. The shared module is the storage
    seam plus the design tokens (`design/Style-Guide.md` §10;
    `docs/Architecture-Review-Storage.md`). Browser-storage keys get a product prefix from
    the first shared-module PR, because products on one site share `localStorage`.
  [vision; brief §11.1; review 2026-09-29]
- **D5 — Employee Directory identity.** *Open.* Which list is "the Employee Directory"?
  - HR's Employee Contacts: kept by hand, current, and holds Pay Type and PersonalEmail;
  - 27 Employees: updated by a nightly automation nobody has identified;
  - or a new combined list.

  People are matched today by work email, or else by exact name, so a namesake without a
  work email can be matched to the wrong row.
  *Recommend:* Employee Contacts as the identity master, read through a trimmed view or
  `$select` (item 9), until D3's separate-list rule lets People keep HR-only fields on a
  list of their own. The app never writes to Employee Contacts. [brief §4 open question,
  §8.1]
- **D6 — Design Resources and secrets.** *Tabled 2026-09-29 (owner).* Not one of the four
  Systems products, and not needed for the system as a whole: no product, no list and no
  work until the owner reopens it. Kept for that day:
  - Licence keys and shared logins in a SharePoint list that a product reads are readable
    by every user with site access, whatever the UI hides (D3), and this repository is
    public.
  - *Recommend, if reopened:* the product stores *pointers and ownership* — what the tool
    is, who owns the licence, where the credential lives — and links to a proper vault (a
    password manager, or a document library with its own restricted permissions). Never
    the secret itself in a list the app reads. The plug-in / script store is a document
    library with a Manager page over it.
  [vision]
- **D7 — What v2.0.0 means.** *Open.* The options: §1 point 5 (Timeline running on the
  shared registries), the retired "app as master", or "the pilot release". *Recommend:*
  §1 point 5.
- **D8 — The Company Data pages' future.** *Ruled 2026-09-29 (owner, with the Systems
  definition): they graduate.* Timeline's People and Clients pages become the **People**
  and **Clients** products in Phase 9. From then on Timeline keeps read-only pickers and
  never creates or deletes a person or a client (§1 ownership rule). Until then the pages
  are where the shared-registry work lands (Phase 8). Clients' "project history (names,
  cost codes, job details, billings)" needs client IDs on projects (D10) and the closeout
  and billing states (item 11, an Office screen) before it can be built without matching
  on names.
- **D9 — Worker type vocabulary.** *Open.* The app has a Freelance flag (`1` or empty).
  The brief wants Regular / Seasonal / Freelance / Contractor. Employee Contacts already
  has a Category (Full/Part Time / Seasonal / Archived). *Recommend:* one vocabulary,
  taken from Employee Contacts if HR agrees, mapped onto the flag until Phase 8. A related
  limit: the weekly schedule is one time range per person (no split shifts, no per-day
  hours), the first ceiling a TimeClock+ hours integration will hit (§7.4). [brief §8.1]
- **D10 — Stable IDs.** *Open.* Assignments store people's *names*, matched up through
  `canonName`; projects store the client as a *name*. Clients have no `appId` but do have
  a stable `spId` (the SharePoint item ID). *Recommend:* in Phase 8, add `clientId` on
  Projects (additive, with a one-time backfill from name to ID in the same milestone) and
  person IDs on assignments (Tasks can change now that D2 is lifted). The flexible-roles
  model (item 1) rides the same change.
  *The target identity (2026-10-08):* every Systems entity gets a durable application ID
  (a UUID): people, clients, projects, leads, estimates, estimate revisions, cost codes,
  phases, to-dos, events. Store-specific IDs, the SharePoint item ID (`spId`) and today's
  `appId` (`genId()`: a timestamp plus six random characters, not a UUID), are kept as
  legacy columns for the migration, then rewritten into references once. Names stay
  display values and never join. On SQL this becomes foreign keys; on any platform it is
  the step that makes moving rows a script. [brief §8]
- **D11 — Departments and shop closures as data.** *Open.* Departments and the six
  holidays are fixed in code; the brief wants configurable departments and a Shop Closure
  list. *Recommend:* Phase 8, after D1. The department list just changed (Logistics and
  Shipping added, `othoffice` retired) and should settle first. Whether Timeline's own
  `ShopTimeline_Events` merges into 27 Events is decided with item 12.
  *Relational form (2026-10-08):* on Dataverse or SQL these are normalized entities, not
  JSON in text columns: Departments, Shop Closures, and a join between people and
  departments (today the `depts` JSON on Staff and `activeDepartments` on Projects). The
  decision this needs is unchanged: which departments, who edits them, and how a retired
  one folds in. [brief §8, §8.2]
- **D12 — Polling budget.** *Open.* To pick up other people's edits, every open tab
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
- **D13 — Integrations: ADP, TimeClock+, QuickBooks.** *Open.* The brief ranks them P3,
  after ownership, security and maintenance are settled; the vision says "if possible". A
  browser app can't hold API secrets, so any integration that writes needs a flow or a
  small service with its own owner. *Recommend:* CSV export and import first (the
  QuickBooks and TCP formats are still to be confirmed, §5); APIs only through Power
  Automate, with a named owner. The project cycle (§1, 2026-09-29) puts the QuickBooks
  and TCP hand-off at job creation (item 43), so the CSV formats are Office's input. The
  ADP connection belongs to People (owner, 2026-09-29): CSV first, the API through Power
  Automate.
  *If Systems gains a backend (D15, 2026-10-08):* "APIs only through Power Automate" was a
  consequence of having no server, not a rule in itself. CSV first stays. After that there
  are two homes:
  - Power Automate, for Microsoft-centric workflow a non-programmer can maintain;
  - a Systems API job, for transactional or tightly coupled integrations, such as a
    QuickBooks hand-off that must succeed or fail together with job creation (item 43).

  Browser-held secrets stay prohibited. Every integration, in either home, keeps a named
  owner and documented failure and recovery behaviour (`docs/Automations.md`).
  [brief §1.2, §9 P3, §15]
- **D14 — Shop terminal / TV mode.** *Parked.* A fourth account type (`terminal`) with
  its own read-only dashboard; the company already runs M365 accounts that aren't people.
  Owner ruling 2026-09-02: after rollout, once real use proves the need. The brief: P2,
  and no TV redesign in the pilot.
- **D15 — Data platform: SharePoint lists, Dataverse, or Azure.** *Open.* Reassessed
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
  | Who enforces access | SharePoint, per site / list / item, with each user's own token (§1 point 4, D3) | Dataverse security roles, with each user's own token | Code we write in the API; Entra signs users in, but the rules are ours |
  | Per-field protection | No; D3 splits lists instead | Yes, column-level security | Yes, built by us (or SQL row-level security) |
  | Transactions, unique keys | No transactions; unique indexed column + retry | Batch transactions, alternate keys, autonumber columns (cost codes, item 42) | Full SQL |
  | Relations | Text IDs joined in the app (D3, D10); lookups same-site only | Real relationships | Full SQL |
  | Browser app calls it directly | Yes (Graph, as today) | Yes, Web API with MSAL delegated tokens (*verify* CORS from the Pages origin) | No; needs a hosted API (e.g. Static Web Apps + Functions), a second codebase with a deploy step |
  | Power Automate | Standard connector (today's flows) | Native; premium connector | SQL connector is premium; or HTTP to our API |
  | Company data already there | Current 2-7 Projects, 27 Events, Employee Contacts, the Outlook and PTO flows (Automations.md) | Migrated or mirrored | Migrated or synced |
  | Cost | Included in M365 | Power Apps premium per user, every user including viewers, plus capacity (*verify* price and any existing licences) | Pay-as-you-go, likely small at this scale; plus a subscription to administer |
  | Running it | Lowest; hand edits in the list UI | Medium: an environment, solutions, licence assignment; model-driven admin screens come with it | Highest: infrastructure, secrets, backups, monitoring, API releases; no admin UI unless built |
  | Migration cost | Phase 8 schema work only | Storage seam + rows + flows rewired + licences | Storage seam + API + authorization layer + rows + flows |
  | Ceilings | List view threshold on unindexed filters; whole-list polling (D12) | Comfortable at this scale | Comfortable at this scale |

  *Recommended 2026-10-01 (superseded 2026-10-08, kept for the record):* **A for v2.0.0,
  with B as the named upgrade path; C only if B proves insufficient.** The reasons: A keeps the no-backend model, so permissions stay the user's
  own token and D3's design holds. The company's other data and flows are already on
  SharePoint, and Systems is defined as one shared dataset (§1). Moving Timeline alone would
  recreate the two-masters problem D1 forbids. B beats C for this team because it keeps
  per-user tokens and native flows, while C turns security into code we maintain.
  **The platform is not changed during the pilot.** The expensive part of any migration is
  the data model (stable IDs, normalization), and that is paid once whatever the target. If
  the model is right, moving rows later is a script.

  Prepare regardless of the ruling. All three steps are already planned or are cheap:
  1. the storage seam (`docs/Architecture-Review-Storage.md` idea 1, eight
     behaviour-neutral PRs), after which a backend swap rewrites one `store` object, not 37
     call sites;
  2. a backend-neutral Phase 8 schema: text IDs (D10), typed columns, JSON-in-text columns
     (`ticketNodes`, `activeDepartments`, `schedule`) split out where they must be
     queried, all recorded in the provisioning spec (review idea 2), which ports to
     Dataverse or SQL nearly 1:1;
  3. D12's polling budget, which matters on every platform.

  *Reopen if any of these become true:* (1) item 42 cost-code allocation can't be made
  collision-safe with a unique column + retry; (2) item 27 / D3 needs per-field protection
  that list splits can't express cleanly; (3) a registry nears the list threshold or D12's
  budget can't be met with delta or `$filter` reads; (4) D13 integrations need server-side
  logic beyond what flows can do; (5) people outside the tenant need access.

  *Before ruling:* a Dataverse licence quote (headcount × per-user premium, and whether the
  tenant already holds any), and a half-day spike: one read and one write to the Dataverse
  Web API from a Pages-hosted page with an MSAL delegated token. *Gate:* rule before the
  Phase 8 schema is provisioned, so rows move at most once. Related: D1, D10, D12; item 42.
  [owner 2026-10-01; `docs/Architecture-Review-Storage.md`]

  **Reassessment, 2026-10-08** (owner and Hubert, after research;
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
    identity, and D4 keeps the frontends on Pages anyway, so the shape is a standalone API
    with CORS.
  - **B's migration cost missed plug-ins.** Authoritative multi-record operations in
    Dataverse need C# plug-ins or Custom APIs; otherwise the rules live in the browser.
  - **The two-masters argument isn't a platform argument.** It applies to B as much as C;
    it is D1's migration cost.
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

  Also wanted, not blocking: D3's permission boundaries for cost, markup and margin, and
  the answer on whether Office's pricing logic may live in a public repository.

  *Would settle it toward A:* item 44 finds Office holds only an estimate reference, and
  cost codes can be made collision-safe on a list. *Toward B:* the human roles for C can't
  be named, or the licence cost is acceptable and the plug-in surface stays small. *Toward
  C:* the spike passes and the roles are named. Local SQL Server is ranked below Azure SQL
  (the review, §E13).

  *Gate (unchanged):* rule before the Phase 8 schema is provisioned, so rows move at most
  once. Backend guardrails enter `CLAUDE.md` only when backend work is authorized (§7.4).
  [owner and Hubert 2026-10-08; `docs/Architecture-Review-Backend.md`]

## 5. Reference material to gather [brief §13]

What we still need from people: schemas, rules and examples, not screenshots. Status as of
2026-09-24.

| Material | Owner | Status |
|---|---|---|
| Employee Directory: the exact list, field names, types, permissions, a sanitized export | HR manager | not requested |
| Master Cost Code List: headers, formulas, validation messages, abbreviation and sequence rules, an example of every warning; QuickBooks and TCP exports to compare | Project Director, Bookkeeper | not requested (item 13) |
| Current Projects and 27 Events: schemas, lookups, status fields, Teams and shop-screen dependencies, where Outlook IDs are stored, an example of an Outlook-only edit and of a deletion | Project Director; flow owner (unknown) | not requested (item 14) |
| Power Automate: every trigger, action, calendar connection, recipient, error owner, retry policy | flow owner (unknown) | owner not identified |
| Master Project Tracker and closeout: columns, restricted fields, AMPM fields, closeout email examples, what the Bookkeeper minimally needs | Project Director, Bookkeeper | not requested (items 11, 22) |
| PTO, holidays, change log: the availability source, how identities are matched, cancellation examples, how holidays are set | operations manager (PTO, the 27 Employees automation); Robert (change log, item 20) | discovery session not held |
| QuickBooks / TimeClock+ CSV formats | Bookkeeper | not requested (D13) |
| Who administers which view (the key users), and which permission set each needs | owner, Hubert | in progress (D3) |
| Davis's estimator: a walkthrough of its model, pricing rules, catalog and rate data, and test estimates; where its database runs | Davis, Robert | not requested (item 44) |
| Estimate samples: two or three recent estimates per PM, of different shapes, to re-enter in the estimator's model | several PMs, the Project Director | not requested (item 44) |
| Platform ownership: who would hold an Azure subscription and its billing, a second administrator, alert recipient, production-migration approver; or who administers a Power Platform environment | owner, Hubert | not requested (D15) |
| Licence inventory and headcount: Power Apps / Power Automate premium licences already held, and how many people would use Systems (viewers included) | tenant admin, owner | not requested (D15) |
| Colleague app: is it running, who maintains it, which lists it reads and writes | owner | answered 2026-09-24: running, unused, will not return; breakage accepted (D2) |
| The app itself: lists, registration, scopes, deployment, data model, formulas | Robert | mostly in the repository; item 21 closes the gaps (backups and rollup formulas undocumented) |

## 6. Data / schema (⚠ shared lists — Robert applies each spec)

The app never changes the schema itself: Robert receives the exact spec and applies it.
Adding a column is routine, because the app checks for new columns when it runs and copes
if one is missing (the "tristate" pattern: a missing column never makes other saves fail).
A destructive change gets a milestone record with its migration. The colleague app is no
constraint (D2, lifted 2026-09-24).

**Created and in use (v1.x):**

- Lists: `ShopTimeline_Feedback`, `ShopTimeline_Changelog`, `ShopTimeline_Clients`, and
  `ShopTimeline_Config` (Title + `value`; confirmed created by the owner 2026-09-24 — the
  developer App Settings switches are shared through it).
- On `ShopTimeline_Staff`: `admin` (`1` / `dev` / empty), `feedbackRecipient`, `phone`,
  `personalNotes`, `listeningTo` / `listeningLink` / `listeningVerb` / `listeningShow`,
  `status` (Employee Contacts' vocabulary), `nickname`, `driver`, `availability`,
  `schedule` (JSON), `freelance`.
- On `ShopTimeline_Feedback`: `ghIssue` — single line of text, the GitHub issue URL,
  written by the tracker repository's poller, never by the app (item 31).
- On `ShopTimeline_Feedback`: `resolvedAt` — single line of text, the ticket's close time (ISO),
  written by the poller, never by the app (v1.34.0, owner ask 2026-10-05). The app shows it as
  the Resolved column's date and falls back to the row's last change until it exists. ⚠ Spec
  delivered for Robert to apply, after which the poller back-fills every closed ticket on its
  next run. *Not yet confirmed as created* (2026-10-08 check): tick here once confirmed.
- On `ShopTimeline_Tasks`: `range` — Yes/No, default No (v1.32.0, tracker #16). The app
  writes it only on rows that are extra work periods (tristate), so ordinary saves never
  touch it; the first + on a saved project needs it. ⚠ It was to be created before PR #88
  merged; v1.32.0 shipped 2026-10-02. *Not yet confirmed as created* (2026-10-08 check):
  tick here once confirmed.
- Entra: `Mail.Send` delegated, consented.
- Employee Contacts: read only. The app never writes to it or touches its schema.

**Candidates this phase** (the spec is delivered with the item's batch):

- `dateCertainty` on `ShopTimeline_Projects` — item 5.
- `closeoutStatus` and `billingStatus` (plus `closeoutBy` and `closeoutAt` if needed) on
  `ShopTimeline_Projects` — item 11.
- `savedViews` on `ShopTimeline_Staff` — multi-line text holding a JSON list, written only
  to the signed-in user's own row (as `personalNotes` is) — item 25.
- A tour "seen" flag on `ShopTimeline_Staff` — only if item 3 is fixed that way.
- A test site, or a suffixed set of lists, for development data — item 17.

**Phase 8 candidates** (design first):

- `clientId` on Projects (D10).
- Person IDs on assignments (D10, D2).
- A client lifecycle column on `ShopTimeline_Clients`. The Staff side reuses `status`
  rather than a third vocabulary (v1.x ruling 2026-09-01).
- Departments and Shop Closures lists (D11).
- The Cost Codes registry (item 13).

If D15 picks Dataverse or Azure SQL, these are designed as tables in a versioned schema,
not as list columns, and the ⚠ rule takes its future form. Under SQL: a migration in Git,
tested against a throwaway database, applied to staging, then to production after the
owner's explicit approval. A destructive migration still gets its milestone record
(`docs/Architecture-Review-Backend.md` §E9).

**Not changes:** item 1's renames are labels only; stored field names stay the same.

## 7. Deferred & skipped ledger

The record of things deliberately not done. Each entry says what was skipped, why not
now, and the **gate**: what would change the answer. When a later decision lands, the
entry is updated in place, never deleted. The entries were carried over from the v1.x
backlog on 2026-09-24, each checked against the code first; wording was corrected where
the check found a limit described wrongly.

How to read the tags at the end of an entry:

- **[L1234]** — the entry's line in `docs/Archive/TODO-v1.x-Archive.md`.
- **REV76**, **v1.6.1** — the build where the limit came in. REV numbers are the
  numbered builds before v1.0; semantic versions came after.
- **T8**, **U6**, **B3b** and similar — finding codes from the Phase 1–4 task briefs and
  the UX audit (`docs/Archive/`).

### 7.0 Closed at retirement (audit 2026-09-24) — not carried

- Coach-mark copy revision marked "ON HOLD" / "TABLED INDEFINITELY" (v1.x §2, §3 item 5,
  ladder v1.2.x row): **shipped in v1.15.1**. `docs/Copy-Coach-and-Helpers.md` is where
  copy is edited. Round two (Cost Code, Technical Designer, Lock dates) is items 1–2.
- "Black bar mellowed — owner eyes wanted; possible `.cal-mon` follow-up" (v1.x §3 item
  2): 27 releases and a live demo later, nobody raised it again. Closed; `.cal-mon` is
  unchanged.
- Calendar detail levels "development-only until promoted" (v1.x §3 item 10): on `main`
  since PR #47.
- Admin rollout note "flag the admins on the People page" (v1.x item 12): done in practice
  (PMs are admins); replaced by D3.
- "UI gating is workflow protection — decide if acceptable" (v1.x item 12): recorded and
  accepted for v1.x; **reopened as D3** for Systems rather than carried as-is.
- Weekly schedule and Freelance flag "(development)" labels (v1.x items 43–44): on `main`
  through PR #48.
- Draft "Add a phase" ignores the optional name field [L973]: the field was removed in
  v1.2.1, so there's nothing to drop.
- `scrubLegacyNames()` to run on `/preview/` [L1110]: shipped in v1.7.2. Its re-run
  limit has its own entry (§7.3, L1148).
- `canonName` doesn't cover to-do assignees [L1117]: the fix its own gate named shipped in
  v1.18.1 (`test-v1181`).
- Drag-zoom's 45° split vs ±15° bands [L1061; v1.x item 24]: the owner accepted the split
  in practice across three `/preview/` rounds (2026-08-31 → 09-01). Closed unless the
  owner says otherwise.

### 7.1 Carried — Phases 1–4 (REV51–89)

- [ ] **Plain browser tooltips.** Hover tips (marker hover included) use the browser's
      built-in `title` tooltips: unstyled, and invisible on touch screens. Gate: real
      touch use (T8; v1.4.0's marker hover shares it). [L945, L1059]
- [ ] **A toast can overlap the dock.** A toast's offset above the bottom dock is worked
      out when it appears, so drag-resizing the dock while a toast shows can overlap them.
      Gate: someone notices (U7). [L947]
- [ ] **📌 emoji outside the icon set.** Pins use the Unicode 📌 instead of an SVG icon,
      in **five places**, not two: the Pin-dates modal, the phase inspector's Pin
      checkbox, the `.bar-pin` glyph on pinned Gantt bars, and the two drag-refusal hints.
      Swap each the next time it's touched (U6). [L949]
- [ ] **A persistent error banner** with a close button, if the ~5-second error toast
      proves too fleeting (T7). Mitigation already shipped: the sync pill's error state
      (`err`) stays as a clickable "not saved — click to retry" until the retry succeeds. The gate
      to watch is brief §7 Reliability / §10.1, "failed saves show a clear error". [L951]
- [ ] **Go-to-date doesn't remember recent jumps.** Gate: PMs asking (REV76). [L955]
- [ ] **Go-to popover position.** On very narrow windows it can sit to the left of the
      pointer. Cosmetic. [L956]
- [ ] **Very short projects show as a pill only at Week zoom.** Intended
      (Design-Language §7). Gate: real complaints about lost labels (REV75). [L958]
- [ ] **Saved views don't capture everything.** Not saved: sidebar width, gutter, scroll
      position, linked subtasks. Gate: someone misses one (REV79). Input to D3: decide
      what a view captures when role-based views are designed, not before. [L963]
- [ ] **Saved views recall grouping, not each person's own order.** The order
      (`sortIndex`) is shared data; a private order needs a per-user record (spec to
      Robert when decided). [L965]
- [ ] **The white-bar-text rule covers bar colours only.** Subtask tints (`kidShade()`)
      pick their own text colour. Owner's call (REV80). [L969]
- [ ] **Drag-to-pan works only on the date header.** Gate: PMs asking to grab the canvas
      itself, which needs a modifier-key design (REV80). [L971]
- [ ] **The department dropdown is disabled on drafts.** Changing a phase's department is
      a saved-page action. Gate: real demand (REV82). [L975]
- [ ] **Selection after a split, on drafts.** If an unsplit bar is split while selected,
      the selection falls back to the department's first bar. Harmless. Gate: re-parenting
      ever being built (REV82). [L977]
- [ ] **Calendar drag-to-move shows only a tooltip.** Gate: the same complaint about
      moves. Reworded: the cross-week follow shipped in v1.9.0. What remains is that the
      live stretch is drawn on one row and can briefly overshoot the nesting / pin limits
      (the tint and the snap on release always show the true, limited result). [L980]
- [ ] **A collapsed calendar phase hides out-of-range subtasks.** It spans only its
      parent bar's dates, so a subtask outside them is invisible until expanded. Gate: a
      PM missing one (REV84). [L986]
- [ ] **The calendar and the Gantt expand separately.** The calendar's collapse state is
      independent of the Gantt's ▸ state. (The selection half was replaced by v1.0.4's
      `NPV_CAL_OPEN`; sharing would now need a mapping between the two.) Gate: someone
      expecting them to match. [L988]
- [ ] **The parent / subtask swap shows through the collapse.** Parents are decided by
      position: resize a phase past its subtask, and the calendar band swaps along with
      the Gantt's parent row (only when both bars have labels). Gate: a PM confused by it
      (REV84). [L993]
- [ ] **The PM late prompt is once a day per browser, not per user.** On a shared machine
      a second PM may never see it. Fix: key it on the account username (one line plus a
      test87 case). Gate: complaints from shared stations (REV87). Relevant to item 11's
      reminders. [L996]
- [ ] **The project-page tour doesn't auto-run on a direct landing.** A first-time user
      who finishes the home tour and clicks + New Project is chained into it (since
      v1.10.0), but landing straight on a project doesn't start it. Gate: the owner
      wanting it for new hires (REV86). [L999]
- [ ] **The home tour's "seen" flag is per browser, not per person.** Owner ruling
      2026-09-02: leave it. Gate possibly fired: brief §5.1, "the tour has looped" —
      handled as item 3. [L1001]
- [ ] **The ⋯ hover cue is on main-timeline bars only.** One CSS rule adds it to
      `.npv-bar` when item 7 lands. [L1011]
- [ ] **The sample project needs a successful load.** The stashed sample project comes
      back only after a load succeeds, so starting offline shows the sign-in card. Gate:
      someone demoing offline (REV89) — closer now that brief §2 says the shop's internet
      is unreliable. A real offline mode is a separate scoping decision. [L1013]
- [ ] **A rare to-do loss on poll.** The poll's guard for local to-dos could drop
      session-only to-dos if `ShopTimeline_Tasks2` were missing AND the sample project had
      to-dos. Accepted risk: Tasks2 exists. [L1015]
- [ ] **An optional 60-second explainer video or page.** Never scoped. Gate: a brief from
      the owner. [L1018]

### 7.2 Carried — v1 close-out (REV90–101)

- [ ] **The calendar's and the Gantt's marker code are near-copies.** The drag / click /
      delete handling for markers is duplicated. Gate (reworded): the next change to
      either one merges them. (The v1.x "fires with item 8" wording was stale: v1.1.0
      didn't touch it, and the v1.8.0 / v1.11.0 permission checks touched both without
      merging.) [L1026]
- [ ] **Dead columns kept alive.** `metalFab` and the to-do fields `labels` / `checklist`
      (`todoToFields`) are unused schema, kept for the colleague app (`metalFab` still
      round-trips and is searchable). D2 lifted 2026-09-24, so dropping them is item 29, a
      deliberate Phase 8 cleanup. [L1040]
- [ ] **The quick-edit popover lacks Duplicate and Pin.** It has the data fields and
      Delete; Duplicate and Pin are only in the inspector. Gate: shop use asking —
      **fired by brief §1 / §7** (make Duplicate visible); handled as item 7. [L1044]
- [ ] **A poll waits while a popover is open.** A background refresh that arrives while
      the popover or add-menu is open waits until it closes (the Company Data edit hold,
      L1143, shares this gate). Gate: a real "why didn't I see their edit" report. [L1046]

### 7.3 Carried — the v1.x track (v1.0.2 → v1.23.0)

- [ ] **A click in the department view doesn't preselect the phase.** Clicking a phase in
      the department lens opens the project page without selecting it; that needs a
      hand-off between routes. Gate: PMs asking why they have to find the phase again
      (v1.3.0). [L1050]
- [ ] **Department-view lanes clip.** Assignment lines are cut to the row height with
      "+N more". (My Dashboard dropped its "+N more" in v1.20.8; the lanes didn't change.)
      Gate: real complaints (v1.3.0). [L1053]
- [ ] **Old milestone fields have no editor.** Old milestone notes and types, and notes'
      who / phase data, survive in storage with no way to edit them (the notes show in
      tooltips; the who doesn't show at all). Fix: a read-only line in the popover. Gate:
      someone needing to read or clear them (v1.4.0). [L1055]
- [ ] **No Fit step on the global page.** (The project-page strip gesture half shipped in
      v1.6.2.) Gate: someone reaching for it (v1.5.0). [L1064]
- [ ] **A custom fit can't be re-entered exactly.** A fit set by dragging survives
      reloads, but there's no control to set it again precisely. Cosmetic (v1.5.0).
      [L1069]
- [ ] **Fonts on non-Windows machines.** The Brauer Neue title font shipped in v1.7.1
      (five other weights deliberately left out). A committed Bahnschrift font file for
      Macs and phones waits on demand and on a check of its redistribution licence;
      meanwhile they fall back to system fonts. Owner's call. [L1071; v1.x item 7]
- [ ] **Vivid shows no weekend marker.** In Vivid mode the canvas doesn't mark weekends.
      (Holidays got name pills in v1.20.0, so the v1.x "(holidays included)" note is
      stale.) Gate: someone scheduling into a weekend that Vivid hid (v1.0.2). [L1088]
- [x] ~~**Calendar milestones show the department name,** not a phase's custom label. Gate:
      someone renaming a phase and expecting to see the new name (v1.6.1).~~ Done v1.38.0
      (item 34, tracker #3): a milestone on a named block leads with that name. [L1092]
- [ ] **Lane summaries include upcoming work.** Department-lane summaries list upcoming
      assignments too; "in progress only" would be a one-line filter. Owner's call
      (v1.6.1). [L1095]
- [ ] **Sidebar / canvas scroll alignment.** The sidebar pads by the footer height, not by
      the Gantt's ~10 px horizontal scrollbar. Cosmetic (v1.6.1). [L1098]
- [ ] **The today line and deadline flag at extreme scroll.** On the project Gantt they
      can draw over the sticky row gutters. The axis is masked (v1.6.3); a full fix means
      restructuring how the gutters stack. Gate: someone noticing on a real job. [L1101]
- [ ] **The Summary / Dashboard locks its lens.** To regroup the same person you exit and
      re-enter (the same trade-off as v1.2.0). Gate: someone asking (v1.6.4). [L1106]
- [ ] **Look-alike names aren't merged.** Two roster people who share a first name and
      surname initial keep their legacy name strings separate, because the app never
      guesses identity. The fix is a manual data correction or the People-page Merge, not
      code (v1.6.5). [L1121]
- [ ] **Two "clear" buttons behave differently.** "Show everything" clears the selected
      person; the toolbar's Clear filters keeps it. Deliberate; the owner's call whether to
      align them (v1.6.6). [L1124]
- [ ] **No "Clear all" in the status section.** To isolate one status you uncheck the
      rest by hand. Fix: an "only" button per status. Gate: someone missing it (v1.6.6).
      [L1129]
- [ ] **No links to single records** on the Company Data pages (`#/people/:id` opens
      without selecting anyone). Gate: someone wanting a link to a record. The client
      half can key on `spId` today, with no new column (v1.7.0). [L1133]
- [ ] **Remove is a real delete.** On People and Clients, Remove deletes the record
      (behind a confirm that names the consequences); there's no archive or deactivate.
      Gate (reworded): the Staff `status` column has existed since 2026-09-02 (Active /
      Off Payroll / Terminated / Archived, synced by the import) but drives nothing yet,
      and Clients has no equivalent. The lifecycle work — hide from pickers, guards on
      deactivation, archive instead of delete (brief §10.2) — is Phase 8 design (v1.7.0,
      v1.13.0). [L1136, L1226]
- [ ] **Client selection is keyed by name.** If someone else renames the client at the
      same moment, the selection drops until the next click. Corrected: clients already
      have a stable `spId`, and keying the selection (`CD_SEL`) on it fixes this without a
      schema change (v1.7.0). [L1140]
- [ ] **A poll waits during a Company Data edit.** A background refresh is held entirely
      while a Company Data record is being edited (`CD_EDIT`). Shares L1046's gate
      (v1.7.0). [L1143]
- [ ] **The year view is drag-only.** The step buttons stop at 3 months. Gate: someone
      asking for a Year button (small: one more `FIT_STEPS` entry and a button) (v1.7.2).
      [L1146; v1.x item 28]
- [ ] **The name clean-up needs re-runs.** `scrubLegacyNames` fixes only names the
      current roster can resolve, so roster *additions* need the owner to re-run it from
      the console on `/preview/`. (Merges don't, since v1.15.0 rewrites names at merge
      time.) Gate: each staffing reconciliation; closes for good with D10 (v1.7.2).
      [L1148; v1.x item 29]
- [ ] **"Name presentation on project-edit / subtask-edit pages."** Parked by the owner
      and never specified; probably covered by the v1.15.0 / v1.19.2 display-name sweep
      (`dispName`). Needs a yes or no from the owner, not code. [v1.x item 29]
- [ ] **"Listening to" stays behind a developer switch** (`exp.listening`). Promote or
      drop is the owner's call. The switch is shared through `ShopTimeline_Config`
      (confirmed 2026-09-24) (v1.12.0). [v1.x item 30]
- [ ] **Staff flags are text, not Yes/No.** `admin`, `feedbackRecipient`, `driver`,
      `freelance` and `listeningShow` store `1` or empty; a Yes/No column would need the
      app's writer changed. Corrected: the `viewer.*` grants are rows on
      `ShopTimeline_Config`, not Staff columns (v1.8.0 / v1.11.0). Gate: a save failing
      with a 400 error. [L1151]
- [ ] **A fully read-only viewer can't load the sample project** (any `viewer.*` grant
      can, since v1.11.0). Only matters on a site with no projects (v1.8.0). [L1154]
- [ ] **Hidden viewer checkboxes rely on CSS `:has()`.** Very old browsers would show
      them disabled instead. Cosmetic (v1.8.0). [L1157]
- [ ] **Viewers don't get the PM late prompt** (they couldn't act on it). Gate: the owner
      wanting a read-only nudge (v1.8.0). Revisit with item 11. [L1160]
- [ ] **Feedback mail can be skipped silently.** It uses the silent token, so a missing
      `Mail.Send` consent skips the mail without a pop-up (the report is still filed, and a
      toast says so). Gate: recipients reporting gaps (v1.8.0). [L1163]
- [ ] **A calendar resize can't go past the last week shown,** because there are no cells
      below to hover. Long extensions belong in the Gantt or the inspector. Gate: someone
      reaching for it (v1.9.0). [L1166; v1.x item 32]
- [ ] **Cross-week resize feedback moves a day at a time.** Cosmetic (v1.9.0). [L1171]
- [ ] **Unchecking a developer's admin box loses `dev`.** Re-checking writes `1`, and the
      owner re-types `dev` on the list. Gate: it happening often enough to annoy; letting
      the People editor assign `dev` needs an owner ruling (v1.9.0). [L1175; v1.x item
      32]
- [ ] **View-as keeps your own dashboard.** Owner ruling 2026-09-18: User Notes stays
      editable, so no preview shows your page as others see it. Side finding: the
      picker's toasts still say "your Summary reads as others see it" — fix on the next
      touch. [L1178]
- [ ] **A viewer's saves open fully once any grant is on.** `saveState` lets a viewer
      save everything once ANY `viewer.*` grant is on; only the UI enforces the per-kind
      limits. Gate: a partly-granted viewer reaching a feature they weren't granted. The
      fix is changes tagged by kind (v1.11.0). Part of D3. [L1193]
- [ ] **The right-click create menu needs the PHASES grant.** Gate: the first narrow grant
      switched on for real users (v1.11.0). [L1199]
- [ ] **Config is read once, at sign-in** (the polling-cost rule), so a changed grant
      reaches users on their next reload. Gate: the delay biting someone (v1.11.0).
      [L1203]
- [ ] **Developer pages open by direct link.** While previewing as Non-admin, `#/settings`
      (its menu entry hidden since v1.18.0, the page not) and **`#/reports`** (full
      reporter names and emails — personal data) still open if you type the address.
      Whether that's deliberate is unrecorded; one `isDeveloper()` check on the route
      closes both. [L1206 + new]
- [ ] **The thought-cloud popover can lose an entry.** It saves when it closes, and a
      redraw from another save path mid-edit can close it without saving. (The 90-second
      poll already skips while a dock field has focus.) Rare. Gate: someone losing an
      entry; the fix is saving per field (v1.12.0). [L1210]
- [ ] **The import's department matching is exact.** The Employee Contacts import maps
      departments by exact name or group, plus a small alias table; unrecognized names are
      reported and left blank. Gate: real HR names that should map — one alias line each
      (v1.13.0). [L1218]
- [ ] **The import adds instead of guessing.** It matches by email first, then by exact
      name; a mismatch ADDS a duplicate rather than merging, because the app never guesses
      identity. Remedy: the People-page Merge, then re-run. Feeds D5 (v1.13.0). [L1222]
- [ ] **The deploy check trips on built `src` / `href` strings.** Any `src="` / `href="`
      string literal built in JavaScript in `index.html` trips the Pages deploy's
      referenced-files check; set such attributes as DOM properties instead (v1.13.1).
      Gate: the next time it bites, teach the check to skip concatenations. [L1229]
- [ ] **The chained tour's step count** assumes its second half opens on a draft.
      Cosmetic (v1.14.0). See item 3. [L1233]
- [ ] **The department consolidation is surface-only.** It changed how people's
      departments display and are stored; phase departments, the department lens and
      task rows keep the old machine IDs, and a legacy ID is fixed on the person's next
      save. Gate: legacy IDs breaking a filter (v1.14.0). [L1242]
- [ ] **The people index has no Departments column,** so it fits at a glance. (It now
      fits seven to eight columns, so the reason is weaker.) Gate: someone missing it
      (v1.14.0). [L1247]
- [ ] **A merge can't be undone automatically.** Parked changes live only in memory, so a
      reload mid-park drops the clean-up. Gate: a real mistaken merge (v1.15.0). [L1260]
- [ ] **Merge matches exact names.** Abbreviations `canonName` can't resolve stay behind;
      run `scrubLegacyNames(true)` after merging. The real fix is D10 (v1.15.0). [L1263]
- [ ] **A held staff save retries only from the pill** (`PENDING_STAFF`). Gate: the manual
      retry proving annoying (v1.15.2). [L1266]
- [ ] **Orphan records from other writers.** Deleting children before parents closes the
      orphan gap for THIS app's writes only. The lists have other writers, so an orphan
      can still appear, showing up as an odd department-lens lane. Gate: a second real
      orphan; the fix is an admin warning at load (v1.18.3). [L1270]
- [ ] **The client sync stops at the first failure.** `spSyncClients` keeps that shape
      (clients have no tristate columns). Gate: a real report of stranded clients
      (v1.15.2). [L1278]
- [ ] **The change log covers project saves only.** Staff, client and config edits aren't
      logged. Gate: the owner asking who changed the roster (v1.19.0). Documented in item
      20. [L1282]
- [ ] **The change log reads the whole list.** It's read on demand, with a 60-second
      cache. Reworded: the read already pages (`gpageAll`); the real limit is that every
      cache miss reads the *entire* list (so the cost grows with it), and the screens cut
      off at 500 / 300 with no server-side filter. Fix: `$filter` on `projectId` / `at`,
      or a date window. Gate: the list growing big enough to slow opening (v1.19.0).
      Feeds D12. [L1287]
- [ ] **Change-log rows can be lost silently.** If a save succeeds but its change-log write
      fails, those rows are lost (logged to the console only), because history must never
      block a save. Gate: real gaps mattering (v1.19.0). [L1292]
- [ ] **The change-log dock can't be drag-resized,** and its collapse lasts one visit.
      Gate: someone trying to drag it (v1.19.0). [L1296]
- [ ] **`othoffice` is retired, not deleted.** (Other · Technical Design.) It's hidden
      from pickers but still shows on old rows. Close it by reassigning any remaining rows,
      then deleting the `DEPTS` entry (v1.20.1). [L1309]
- [ ] **Undo covers projects only.** People, Clients and Settings edits sit outside undo /
      redo (they have their own Save-with-confirm). Project undo is in memory, 20 steps,
      lost on reload. Gate: someone pressing ⌘Z on the People page (v1.20.0). Documented
      in item 20. [L1315]
- [ ] **The month calendar has no holiday names** (the days are greyed, with no name
      pill); about 3 lines in the day loop. Gate: someone missing it (v1.20.0). [L1318]
- [ ] **Draft redo quirks.** Draft redo snapshots the whole editable draft, and Undo from
      a toast button doesn't feed the redo stack (⌘Z does). Gate: someone noticing
      (v1.20.0). [L1321]
- [ ] **Right-clicking the Milestones / Notes rows** gives the date menu, never a
      department menu (v1.20.0; not ledgered until 2026-09-24). Gate: someone expecting
      one. [new]

### 7.4 New entries from the 2026-09-24 audit

- [ ] **The weekly schedule is one time range per person** — no split shifts, no per-day
      hours. The upgrade path is a per-day `hours` map (v1.22.0 record). It's the first
      limit a TimeClock+ hours integration will hit (D9, D13).
- [ ] **Two whole-project numbers span gaps.** The Meeting Sheet progress % and the
      project page's "Lead time" run from first start to last end, gaps included. Neither
      counts a gap as work; relabel them or compute from the blocks if the brief's "gaps
      never read as work" rule is applied literally (item 8).
- [ ] **The Employee Contacts import fetches every column** (no `$select`), and the phone
      falls back Primary → Phone → Mobile. Item 9.
- [ ] **Excel exports of the lists aren't readable on their own.** They contain JSON-text
      columns (departments, time off, schedule, assignee lists, `ticketNodes`) and `appId`
      cross-references, so they need flattening before they're a usable fallback (item
      15).
- [ ] **Quiet fallback to the browser.** If `ShopTimeline_Staff` or `Tasks2` is missing
      or unreachable, edits stay in the browser and saving to the list resumes silently
      later. Fine for an optional roster; a data-integrity risk once Staff is the
      personnel master (Phase 9 design).
- [ ] **Polling:** every open tab re-reads every list every 90 seconds. D12.
- [ ] **Saved views live in one browser.** Item 25 (per user, Phase 7); shared and
      role-based views are item 30 / D3 (Phase 9).
- [ ] **No release tags, no written rollback procedure, and the repository is under a
      personal account.** Items 16 and 24.
- [ ] **Shop-terminal account type.** D14. [v1.x §2]
- [ ] **Docs out of date** (ARCHITECTURE: 5 lists vs 9; SETUP: 2 scopes vs 4; the
      `CLAUDE.md` line count; the tests/README suite count). Item 21.
- [x] **Developer Bug Reports page buttons.** Once a report has a `ghIssue`, the tracker
      poller overrides its Mark resolved / Reopen buttons (GitHub is the source of truth
      for status, 2026-09-25). Done in v1.39.0 (tracker #29): a row with a ticket shows
      "Status follows the ticket" and the ticket link instead of the button; the
      `fbSetStatus` path stays for rows without a ticket. [item 31]
- [ ] **Two "Drafter" echoes stay after the v1.31.1 rename (tracker #17).** (1) Changelog
      rows (admin/PM) still read the stored key `drafter:` — `clogField` writes the key into
      the Changelog list's `detail` column at save time, so a label map there would make new
      rows differ from every old row; the fix is a read-side stored-name → plain-word map,
      which the #21 spec (Q5) plans for `jobCode` and `drafter` together. Gate: #21
      approved. (2) The "D" people chip (sidebar, project tooltip, Help legend swatch;
      test-c3-status pins `PM,D,L`) still abbreviates the old word; "TD" widens every sidebar
      row. Gate: owner ruling — asked in the v1.31.1 PR body. [item 1]
- [ ] **Backend guardrails are proposed, not in `CLAUDE.md`** (2026-10-08). The 20
      candidate rules (no browser-to-database access, server-side authorization, fixed
      decimal money, versioned migrations, deny-tests, …) are in
      `docs/Architecture-Review-Backend.md` §E15, each marked hard invariant or needing a
      ruling. Writing them into the hard rules before a backend exists would describe
      infrastructure that doesn't run. Gate: backend work authorized (D15 ruled C, or the
      spike approved). [D15]
- [ ] **No setup doc for an Azure backend** (2026-10-08). `docs/SETUP.md` stays accurate
      to production. Azure setup (resource groups, the API registration, managed identity,
      the deploy credential, recovery) is written as its own proposed doc when the spike is
      approved, and folded into `SETUP.md` only once the infrastructure exists. Gate: spike
      approved. [D15]

### 7.5 Deliberate design limits — no action planned; revisit only on real complaints

- No phone layout. The owner closed the request with "We're not doing this" on 2026-10-01
  (tracker #30).

- The 12-colour project palette repeats once 13 or more projects are visible (T2).
- Re-selection after a committed resize or move on the project page is quiet (T4).
- Sidebar names longer than ~26 characters are cut off at the default width; dragging the
  sidebar between 180 and 480 px is the way out (T5).
- Off-screen edge chips don't dim with the search filter (T6).
- The bottom dock's minimum column widths are fixed (U2 / E1).
- In-Design and In-Fabrication bars are both full strength on purpose; the pill word tells
  them apart (U8).
- The default view, the Today button, `T` and the popover's Today pick all put Monday of
  the current week at the left edge (v1.27.0, tracker #2, item 33; it replaced B3b /
  REV101's "centre today"). The other jumps (G, month click, +1 / +3 mo, Next install,
  edge chips) keep centring their date. At a drag-set fit beyond ~250 days the canvas ends
  before Monday can reach the edge; the three zoom buttons stop at 91 days, where it is
  exact.
- Calendar level-0 strips are ~9 px click targets, under the 24 px guideline; one click
  expands them (v1.21.0).
- Calendar detail levels and marker-text state reset on each project visit. They'd
  persist per browser, like `NPV_OPEN`, only if asked (v1.21.0).

## 8. Documentation upkeep

**Standing rules:**

- This file is kept true by the three layers in `CLAUDE.md` ("Keeping `docs/TODO.md`
  true"): every PR updates it, `tests/test-todo.js` checks it in CI, and every promotion
  to `main` audits it and logs the audit here.
- Keep `docs/ARCHITECTURE.md`, `docs/SETUP.md` and `CLAUDE.md` in step with the app (item
  21 is the catch-up). Every milestone gets a record in
  `docs/Milestones/Phase-7-Pilot-Readiness/`; every `APP_VER` bump gets a `CHANGELOG.md`
  line.
- `reference/Handoff-Notes.md` and `reference/Project-History.md` are history: re-check
  what they say about the current state before quoting them.
- The retired backlogs (`docs/Archive/TODO-v1-Archive.md`, `TODO-v1.x-Archive.md`) are
  frozen. A ledger entry's later decision is recorded here, in §7, with the archive line
  number.

**Log, newest first:**

- 2026-10-08 (night): **full audit against the tracker, `CHANGELOG.md` and the branches;
  upkeep rules added.**
  - *Drift found and fixed:*
    - item 41 had shipped in v1.26.3 but was unticked;
    - tracker #34, a P0 bug approved on 2026-10-06, had no item: now item 53;
    - items 1, 3, 32, 36 and 40 were behind their tickets (a re-scope, two holds, a close,
      an unanswered owner question);
    - the #30 decline went unrecorded: now in §7.5;
    - v1.40.1 and v1.41.1 have no milestone records: added to item 23;
    - item 21's counts were stale;
    - §6's `range` and `resolvedAt` read as future actions for releases that had shipped:
      now "not yet confirmed as created".
  - *Added:* a table of the 16 tickets and six owner asks that shipped or closed with no
    §3 item.
  - *Checked, no drift:* every remote branch is merged or open as a PR; every other ticket
    matches its item.
  - *Rules:* `CLAUDE.md` gains "Keeping `docs/TODO.md` true" (same-PR updates, a CI check,
    and an audit at every promotion to `main`). The new `tests/test-todo.js` is in
    `tests/run.js`. The `triage-issues` skill gains Step 3 (reconcile the tracker with §3
    every run), and `ship-release` makes the TODO tick a release step.

- 2026-10-08 (evening): **the opening and §0 brought up to date.**
  - "Nothing in this file is started except item 31" was no longer true: items 33–35, 37–39,
    46, 47, two unnumbered tracker fixes and half of item 1 have shipped. The opening, §3's
    intro and the §3 heading now say how to read the ticks, instead of naming items.
  - The line saying everything must be agreed "before any code lands" is gone: since
    2026-09-27, §3's order is the owner's approval (`CLAUDE.md`).
  - §0 named v1.23.0 / v1.24.0; it now names v1.41.0 / v1.41.1, and §1's Timeline row
    points to §0.
  - `/sandbox/` (retired 2026-10-01) is dropped from the standing rules and from items 16,
    17 and 40 and D4.
  - The opening's "one shared SharePoint dataset" now notes that the platform is D15.
  - Under the new every-task-is-an-item rule, the style track's remaining steps become
    item 52; the batches table points to it.
  - No ruling or gate changed.

- 2026-10-08 (later): **every planned task is now a §3 item** (owner: "we can't have tasks
  done without them being recorded as tasks").
  - Work that lived only in reviews and decisions became items:
    - 48, the storage seam (eight PRs), placed after batch 1;
    - 49, the portal and Timeline move (D4's reshape PR);
    - 50, the storage review's other follow-ups (provisioning, the scope swap, the
      shared registration);
    - 51, D15's inputs (the Dataverse quote and spike, the read-only Azure spike).
  - Item 21 gains the Feedback Bot's client ID and secret expiry. Item 31 gains its
    unfinished flow work from `docs/Automations.md`.
  - The duplicate "42" (tracker #33's shipped Departments line) is relabelled 47.
  - The rule itself is in `CLAUDE.md`, not here.

- 2026-10-08: **D15 reassessed** (owner and Hubert). Office's relational, rule-bound data
  and the AI-agent development model move Azure SQL + API from fallback to co-equal
  candidate with Dataverse. SharePoint stays for files and for Timeline until the cutover.
  - The 2026-10-01 analysis is kept and labelled superseded; five corrections to its table
    are listed.
  - D15 now waits on four inputs: the Dataverse quote and spike, a read-only Azure staging
    spike, item 44's scope, and named platform owners.
  - Storage-neutral readings added to §1 points 1 and 4, §2's Phase 8 row, D1 (one
    authoritative Project, whatever the store), D3 (the mechanism under each platform; the
    permission boundaries people decide first), D10 (UUIDs; store IDs become legacy), D11
    (the relational form), D12 (a read and sync budget on any platform) and D13 (a backend
    job as a second home after CSV).
  - Item 17 is tied to backend staging, item 44 gains Davis's estimator as discovery
    material, §5 gains four rows, and §7.4 gains two ledger entries.
  - New dated review: `docs/Architecture-Review-Backend.md`. No ruling changed, and
    nothing was provisioned. Noted, not fixed: two §3 items share the number 42 (tracker
    #33's shipped Departments line and Office's cost-code generation).

- 2026-10-01 (later): **readability pass on §2–§8 and the legend.** It continues the
  2026-09-29 pass on §3 and §4 (PR #58), which merged into a stacked branch and never
  reached `development`; that pass's framing is folded in here. Plain sentences;
  "waits on" in place of arrows; a status table at the top of §4; short titles on the
  ledger entries and a key to their tags; §7.5 as a list. No item, ruling or gate
  changed. Two errors fixed on
  the way: §2's Phase 7 row put closeout in Phase 8 (it's Phase 9, as item 11 and the
  2026-09-29 log say), and §6's heading still said "additive-only" (lifted by D2). D12
  now explains the polling trap itself instead of pointing to a developer note.
- 2026-10-01: **D15 raised: data platform** (owner). The question is whether to move off
  SharePoint lists while Phase 8 changes the schema anyway. §4 D15 compares SharePoint,
  Dataverse and Azure. The recommendation is SharePoint for v2.0.0 with Dataverse as the
  upgrade path, the reopen triggers are listed, and no platform change happens during the
  pilot. §2 gains the gate; the legend now reads D1–D15.
- 2026-09-29 (evening): **People is where Systems connects to ADP** (owner, from the
  Systems overview handout). §1's People row says so, with D13's limit — CSV first, the
  API only through Power Automate — and the People bullet lists D13.
- 2026-09-29 (later): **Office is the next new product, and the build order is the
  project cycle** (owner). Lead / forecast → estimate → job creation with cost codes,
  QuickBooks and TCP (Office) → people management (People) → schedule and production
  (Timeline, exists) → closeout and final invoice (Office, last). §1 gains the table;
  Office gets its own band in that order (new items 45 lead, 44 estimate, 42 cost codes,
  43 job creation; 11 closeout leaves the pilot and sits last, Phase 9, not planned
  further until then); People follows Office in Phase 8; the pilot's "done when" loses
  the balance-invoice clause; D1 names Office as the registry's editor; D13 notes the
  hand-off at job creation; items 13 and 14 stay in the P0 outside-the-app band as
  Office's inputs.
- 2026-09-29: **Systems defined** (owner) — the ecosystem has a name, four peer products
  (People, Clients, Office, Timeline), a portal at `/`, and the ownership rule (create and
  delete only inside the owning product; read everywhere). §1 rewritten around it; D4
  (ruled 2026-09-28) refined for Systems, D8 ruled, D6 (Design Resources) tabled as not
  necessary to the whole system; item 11's home flagged (Office); the
  old names (Client Manager, Personnel Manager, Design Resources Manager, "sibling apps",
  "the suite") replaced in the living docs — `CLAUDE.md`, `README.md`,
  `docs/ARCHITECTURE.md`, `design/Design-Language.md`, `design/Style-Guide.md` §10,
  `design/README.md`. Milestone records and archives keep the old wording as
  history. The same day's architecture review (`docs/Architecture-Review-Storage.md`,
  PR #56) predates the names; its "suite" and "sibling app" read as Systems and product.
- 2026-09-27 (later): design files get their own root folder `design/` (owner ask) —
  `Design-Language.md`, `Style-Guide.md` and `fonts/` moved there; `index.html` loads the
  wordmark font from `design/fonts/`, the Pages allowlist lists the new path (legacy line
  kept until main and sandbox carry the move), `test-v171` follows. Future design docs
  land in `design/`, not `docs/`.
- 2026-09-27: `design/Style-Guide.md` written (owner ask) — the tokens, colours, type,
  spacing and component recipes as shipped at v1.23.0, read from the stylesheet and script
  constants, plus §10: the sibling-app / `common.css` brief for Phase 9 with a proposed
  three-slot per-app identity (eyebrow, mark, `--app` hue). §10 is a proposal pending D4;
  no app code changed. `CLAUDE.md` core files and `Design-Language.md` point to it. Record:
  `docs/Milestones/Phase-7-Pilot-Readiness/2026-09-27-style-guide.md`.
- 2026-09-25 (later): status rule set — GitHub is the truth once a report has a ticket;
  the poller runs on close/reopen events; tracker #13 → item 41, #14 closed as done;
  PR #52 merged (Hubert has no GitHub account). The bridge's dev-page buttons ledgered
  in §7.4.
- 2026-09-25: the bridge ran (item 31 RUNNING) — tracker #1–#12 filed from the 13 rows
  on `ShopTimeline_Feedback`; items 32–40 carried in, #7 folded into item 3, #11 closed
  as done; the §7.5 Today-centres ceiling marked as challenged. Record:
  `docs/Milestones/Phase-7-Pilot-Readiness/2026-09-25-feedback-github-bridge.md`.
- 2026-09-24 (evening, later): item 31 added — one GitHub issue per feedback report,
  screenshots included, through a poller in a private tracker repository (owner ask,
  priority). The reports open on `ShopTimeline_Feedback` are carried in once the poller
  files them (the list is behind Microsoft sign-in; no session has ever read it — GitHub
  Issues holds nothing today). Owner go-ahead the same evening: the private tracker
  repository was created and the poller, workflow and setup README pushed; the owner's
  Entra / secrets / column setup is the next step.
- 2026-09-24 (evening): the owner's rulings folded in (D2 lifted, D3 ruled in principle,
  Hubert backup maintainer, Config exists, People page current); items 25–30 added and
  the contingency map written into §2; the condensed brief added as
  `reference/2026-09-22-Shop-Timeline-Brief-Condensed.md`; `CLAUDE.md`, `README.md`,
  `CONTRIBUTING.md`, `SETUP.md`, `ARCHITECTURE.md` colleague-app rule wording updated.
- 2026-09-24: v1.x backlog retired and audited; this file created; Milestones Phase 6
  closed at v1.23.0, Phase 7 opened
  (`docs/Milestones/Phase-7-Pilot-Readiness/2026-09-24-backlog-retired-phase-7-kickoff.md`).
  Same day, earlier: Milestones regrouped into numbered phase folders; Handoff-Notes and
  Project-History moved to `reference/`; the Master Data brief and Onboarding-Fork to
  `docs/Archive/`.

---

### Legend

- **⚠** — touches shared SharePoint schema or Entra (sign-in) configuration. Not a gate:
  Robert gets the exact spec and applies the list edit himself. Destructive changes get a
  milestone record (D2 lifted 2026-09-24). Entra changes need explicit instruction
  (`CLAUDE.md`).
- **Waits on** — the work can't start until the named item is done or the named decision
  is taken. An arrow (←) in the log means the same.
- **[brief §N]** — the Project Director's September 2026 brief, condensed and annotated by
  Robert (2026-09-22); section numbers match the original 21-page document.
- **[vision]** — the owner's 2026-09-24 statement of the portal direction, defined as
  Systems on 2026-09-29 (§1).
- **[tracker #N]** — an issue in the private tracker `221twoseven/Project-Scheduler-issues`
  (item 31).
- **[LNNNN]** — the line in `docs/Archive/TODO-v1.x-Archive.md` a carried ledger entry
  came from; **v1.x item N** — its §3 item number there. REV numbers and finding codes
  (T8, U6, B3b) are explained at the top of §7.
- **D1–D15** — §4 decisions; **item N** — §3 work items in this file.
