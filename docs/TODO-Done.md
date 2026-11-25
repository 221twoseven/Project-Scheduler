# Done — finished items and the audit log

Everything finished from [`TODO.md`](TODO.md), and the log of each promotion audit. Items
keep the numbers pull requests and records cite. The newest finished items are at the top;
older ones sit under the headings they were filed under in Phase 7. `CHANGELOG.md` is the
release-by-release record.

## Finished since 2026-11-18

- [x] **102. Rule on the Office wireframe reconciliation** (owner's handoff, 2026-11-25).
      Done 2026-11-25, docs only (PR #235). The owner's Office wireframe (Concept 01)
      checked against the plan in [`Office-Reconciliation.md`](Office-Reconciliation.md);
      ruled the same day (owner: "Approve all").
      - *Rulings* (Decisions.md, "What we're building", Office's shape): Office centres on
        the project record, reached from a Projects register or the client's record; the
        register's stages are worked out, never stored; money is never kept in a SharePoint
        list; leads and estimates are built once, on the chosen platform.
      - *New items:* 103 (the Projects register and project record), 104 (project
        financials and portfolio reports), 105 (client contacts and details).
      - *Extended:* items 95, 45, 44, 42, 43, 5, 11, 26, 30 and 51; the report's questions
        joined "Material to gather".

- [x] **52. The style track: suite style guide §13 steps 3–5.** Shipped v1.62.8 (PR #232,
      2026-11-20). The migration sequence in
      `design/TwoSeven-Application-Style-Guide.md` §13. Step 1 (baseline) and step 2 (tokens
      and readable chrome text, v1.24.0) are done.
      - [x] *Step 3:* restyle one chrome surface per PR, project inspector first: type
        hierarchy, spacing, radii, fields, focus, buttons, and modal focus trapping where
        it's missing. Done 2026-11-20 in four PRs (v1.62.1 to v1.62.4):
        - [x] *The project inspector* (the panel under a project's chart, saved and draft):
          14px header, 13px/600 Title Case headings (owner, 2026-11-19: "No sentence case"),
          12px labels, 36px fields (owner: OK), 32px buttons, 28px compact rows, 6px corners,
          a 2px focus ring; every dialog keeps Tab inside it and gives focus back to its
          opener. Shipped v1.62.1 (PR #220, 2026-11-19). Suite `tests/test-v1621.js`; record
          `docs/Milestones/Phase-7-Pilot-Readiness/2026-11-19-inspector-restyle.md`.
        - [x] *My Dashboard's panel*: the inspector's header, Title Case headings (Working
          On, Time Off, Your Stale Projects; owner OK 2026-11-19), 13px rows of at least
          28px, sans dates with aligned numerals, the NOW tag in the success tokens, the
          inspector's notes box and focus ring. Shipped v1.62.2 (PR #221, 2026-11-19). Suite
          `tests/test-v1622.js`; record
          `docs/Milestones/Phase-7-Pilot-Readiness/2026-11-19-dashboard-panel-restyle.md`.
        - [x] *The dialogs* (Edit Phase, Print Preview, Meeting Sheet, the late-project
          prompt, sign-in expired, the demo slides): 10px corners, a 1px edge, the shared
          floating shadow, no blur behind, 17px titles (wording unchanged), 12px plain labels,
          36px white fields, 32px buttons with a white secondary (so the project page's footer
          and the Open Issues form match), the 2px focus ring; the crew list's names out of
          capitals, and Meeting Sheet's Orientation in a row. Owner OK on the mock 2026-11-20.
          Shipped v1.62.3 (PR #226, 2026-11-20). Suite `tests/test-v1623.js`; record
          `docs/Milestones/Phase-7-Pilot-Readiness/2026-11-20-dialogs-restyle.md`.
        - [x] *The menus and popovers* (the toolbar menus, the chart's right-click menu, the
          edit-in-place and thought popovers): one floating frame (1px edge, 8px corners, the
          shared shadow), 13px rows of at least 32px (owner picked these over 28px), 16px tick
          boxes, section labels as written, "Show everything" a white secondary button, the
          2px ring inset. Owner OK on the mock 2026-11-20. Shipped v1.62.4 (PR #227, 2026-11-20). Suite
          `tests/test-v1624.js`; record
          `docs/Milestones/Phase-7-Pilot-Readiness/2026-11-20-menus-restyle.md`.
        - Step 3 is done (2026-11-20).
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
      - [x] *Step 5:* business pages and routing: read-first records, sorting, empty states,
        per-record routes. Done 2026-11-20. Order (2026-11-20, each with a mock first): Open Issues;
        Release Notes and My settings; the developer pages (App Settings, Changelog, Reports);
        the project page. Projects and reports already have their own links
        (`#/project/…`, `#/issues/…`).
        - [x] *Open Issues*: each column's heading above its line, in Title Case ("Report a
          Bug or Request a Feature", "Open Issues"), the wireframes' soft table header as
          written with a ↓ on the date for the order, 13px rows, and the chips as written
          (Bug, Idea, Pending, In review) in the page's type. Owner: "Yes, with wording"
          (2026-11-20). Shipped v1.62.5 (PR #228, 2026-11-20). Suite `tests/test-v1625.js`; record
          `docs/Milestones/Phase-7-Pilot-Readiness/2026-11-20-open-issues-restyle.md`.
        - [x] *Release Notes and My Settings*: a 22px page title over its line (every
          full-width Help and Company Data page), Release Notes' 15px versions and 13px notes at
          a reading width, My Settings' 15px section heading and 13px choices with the chosen one
          in the action blue (the developer App settings shares it). Title Case: "My Settings",
          "Project Page"; the Help menu row stays "My settings". Owner: "Yes, with wording"
          (2026-11-20). Shipped v1.62.6 (PR #230, 2026-11-20). Suite `tests/test-v1626.js`; record
          `docs/Milestones/Phase-7-Pilot-Readiness/2026-11-20-help-pages-restyle.md`.
        - [x] *The developer pages*: the Changelog and Bug Reports lists share Open Issues' 13px
          rows, the Changelog filter is a real field, and App Settings' Config note and "Stale
          after" field use the tokens. Title Case: "App Settings", "Viewer Permissions"; the Help
          menu row stays "App settings". Owner: "Yes, with wording" (2026-11-20). Shipped v1.62.7
          (PR #231, 2026-11-20). Suite `tests/test-v1627.js`; record
          `docs/Milestones/Phase-7-Pilot-Readiness/2026-11-20-developer-pages-restyle.md`.
        - [x] *The project page*: the summary line's labels as written (Client, Cost code,
          Installs…) with 13px values, the Schedule heading as written, the chart's Milestones
          and Notes rows upright, and a 12px Kickoff line; the page keeps its height. Owner:
          "Yes, build it" (2026-11-20). Shipped v1.62.8 (PR #232, 2026-11-20). Suite
          `tests/test-v1628.js`; record
          `docs/Milestones/Phase-7-Pilot-Readiness/2026-11-20-project-page-restyle.md`.
        - Left in place (dated 2026-11-20): the chart's own capitals (month names, the status
          tag such as FABRICATION or DRAFT, the bars' phase tags) match the bars on the main
          timeline, so they would change together, as one step of their own. Step 5's agreed
          order is done.
      - *Closed (owner, 2026-11-20):* "Close item 52". The chart's own capitals stay as they
        are; restyling them with the main timeline's bars would be a new item.
      - *Done when, per PR:* before/after `/preview/` screenshots, the Design-Language §9
        checklist, and the §13 verification list. A visible change follows the version and
        changelog rules. Steps 6–7 are rules for how the steps are done, not work of their
        own.
      [style guide §13; `design/Style-Transition-Review.md`]

- [x] **101. The version in Office's and People's headers** (owner, 2026-11-19: "Office and
      People also need the version number listed in the header the way Timeline does").
      Shipped v1.62.0 (PR #219, 2026-11-19). Each shows "v1.62.0" (the running build) just before the
      sync pill, in Timeline's style; the rule (`#tb-rev`) moved into `common/common.css`.

- [x] **87. The People app** (the launch; the owner, 2026-11-19: "Wording OK, go with option
      (a)"). Shipped v1.62.0 (PR #219, 2026-11-19). ⚠ Architecture, on item 85. Timeline's People page
      became its own product at `people/`, on the Office shell, and left Timeline.
      - *It keeps everything the page did:* the directory (its nine columns, search, filters,
        ↑↓, resizable columns and the Reset widths menu), the record and its editor, time off,
        the Employee Contacts import (only the mapped fields, item 9), the Team-membership
        suggestions, the phone tidy and the merge. Everyone signed in reads it; admins edit.
      - *Wording (owner-approved):* the tab "People — TWOSEVEN INC.", the header PEOPLE, the
        heading and its line unchanged, the sign-in-expired words as Office's; no left rail
        while the directory is the only section; the Systems card and the Apps menu open it.
      - *The merge (option a):* People also rewrites the duplicate's names, and refs, on
        Timeline's projects, phases and to-dos: name fields and `refs` only, one record at a
        time, after the roster save lands (a failed one holds them for the retry). The ruling
        is in Decisions.md under the ownership rule.
      - *Timeline:* Company Data ▸ People and `#/people` went (an old link goes on to
        `../people/`), with the page's code and styles; Company Data lists the Changelog. Its
        empty name lists say "add them in People". Pickers, lanes and availability still read
        Staff, and a person's own row (notes, saved views) is still written from Timeline.
      - *Shared:* the Staff record's reader and writer, the phone format, the holidays, the
        department groups and the people departments moved into `common/common.js`.
      - *The owner* added the `/people/` and `/preview/people/` SPA redirect URIs (2026-11-19) before the
        merge. `main`'s deploy list is item 100.
      - Record: `docs/Milestones/Phase-7-Pilot-Readiness/2026-11-19-people-app.md`. Suite
        `tests/test-v1620.js`; the People-page checks in older suites now boot the app.
      - *Rollback:* revert. The Staff list is untouched.

- [x] **99. Office before People on the Systems page** (owner, 2026-11-19, on the Systems
      page: "Let's swap the order of these", and: change the word "crews" to "teams"). Shipped v1.61.1 (PR #218, 2026-11-19). The cards
      read Timeline, Office, People, and the Apps menu follows them (`SYSTEMS_APPS` in
      `common/common.js`). The Timeline card reads "Project schedules, phases and teams".

- [x] **94. Rename the Clients app to Office** (owner, 2026-11-19; the launch; the plan: "Go ahead"; the
      wording: "Wording OK"). Shipped v1.61.0 (PR #214, 2026-11-19). ⚠ Architecture. Clients is Office's first part (Decisions.md, "What we're building"),
      so the app ships under its lasting name rather than being renamed after people learn
      it.
      - *The change:* `clients/` becomes `office/` — the app's name in its header, page
        title and sign-in screen, the Systems page tile, the Apps menu (`common/common.js`),
        Timeline's links to a client's record, the deploy workflow's lists, and the tests
        and docs that name the folder. `clients/index.html` stays as a page that forwards to
        `../office/`, keeping old links and bookmarks working, until the tidy-up (item 91).
      - *Data:* none changes. The lists keep their names (`ShopTimeline_Clients`,
        `ShopTimeline_PastProjects`), and the app keeps no browser settings under its name.
      - *The owner:* add the `/office/` and `/preview/office/` SPA sign-in (redirect)
        addresses to the Entra app before the merge; without them sign-in fails on the new
        address. The `/clients/` ones go with the tidy-up (item 91).
      - *Risks:* a link left pointing at `clients/` lands on the forwarder, not a dead page;
        a missing redirect address stops sign-in on `/office/` only, and the merge waits on it.
      - *Rollback:* revert the pull request; the old address never stops working.

- [x] **98. A subtask's milestone on the project chart** (owner, 2026-11-19, testing item 97:
      "Dragging doesn't drag to subtasks, but it does drag to milestone row, and reassigning
      in edit panel below works, but doesn't reflect on gaant"). Shipped v1.55.3 (PR #217,
      2026-11-19), a hotfix from `main` carried into `development`. The chart placed every
      diamond on the first row of its department whose bar covered the date, so a subtask's
      milestone sat on the department's row; now a milestone riding on a bar draws on that
      bar's row. Dragging a diamond onto a subtask's row gives the milestone to that subtask;
      onto the department's row, back to the department.
      - *Left in place (2026-11-19):* with the department collapsed there is no subtask row,
        so its milestones draw on the department's row; expand it to see or drag them.

- [x] **97. Milestones on subtasks** (owner, 2026-11-19: "milestones should be assignable
      to subtasks"). Shipped v1.55.2 (PR #215, 2026-11-19), with item 96, as a hotfix from
      `main` carried into `development`. On a saved project, a milestone's phase list also
      names the bars of any department that has more than one; picking a bar moves the
      milestone onto that bar's own row (`ticketNodes` on `ShopTimeline_Tasks`, where the
      task editor already keeps a bar's milestones), so the timeline draws it on that bar
      alone; picking the department moves it back to `ShopTimeline_Events`. No new column.
      My Dashboard's Milestones list now reads a bar's milestones too.
      - *Left in place (2026-11-19):* a new-project draft still picks a department only;
        subtasks are offered once the job is saved. Deleting a subtask moves its milestones
        to the Events list on its department, as before.

- [x] **96. Two Timeline fixes: the Pin checkbox and the milestone hover** (owner,
      2026-11-19: the phase details' checkbox "should be connected to its text description";
      on the timeline, hovering a milestone "I want to just know what the milestone is, but
      I'm given too much information", and asked why the cursor showed a "?"). Shipped
      v1.55.2 (PR #215, 2026-11-19), a hotfix built from `main` and carried into
      `development` without a version of its own, because `development` holds the Office work. The Pin checkbox sits beside its label; a milestone
      diamond's hover shows only its name, date, project and note, and the "?" help cursor
      is gone. The phase bar's own hover still lists every milestone.

- [x] **93. Projects from before Timeline in a client's history** (owner, 2026-11-18:
      "Management will add pre-timeline projects if necessary"; where: "Yes, in Clients"; the
      wording: "Wording OK"; the list created the same day). Shipped v1.60.0 (PR #212, 2026-11-18).
      "+ Add a past project" on a client's Project history: name, cost code, started, finished,
      team. They sit in the history by finish date, tagged "Before Timeline"; a click changes or
      removes one. Clients owns `ShopTimeline_PastProjects` (`Title`, `clientId`, `jobCode`,
      `startDate`, `endDate`, `team`). No list, no add button.
      - *Left in place (2026-11-18):* removing a client leaves its past projects in the list,
        unseen; adding the client again doesn't bring them back (a new client has a new ID).

- [x] **92. Clients: the list scrolls on its own; a client's record shows its current projects
      at a glance and its project history** (the owner's design review of 2026-11-18, item 90: "This
      menu should scroll independently. Client info should have current projects with
      at-a-glance info for each, project history (with names, cost codes and dates, team
      assignments)."). Shipped v1.59.0 (PR #211, 2026-11-18). Each current project shows its
      cost code, start and due dates, the phases running now and the next one, its status and
      its PM, lead and designer. The history lists every finished project, newest first, with
      its cost code, dates and whole team (the crew read from its fabricators and phases).
      Projects from before Timeline: item 93.

- [x] **89. Make the TODO readable** (owner, 2026-11-18: "a nightmare to look at, and I can't
      say with confidence what still needs to be done"). Done 2026-11-18 (PR #210), docs and
      the TODO check only. `TODO.md` became a one-screen summary — where we stand, the launch
      in order, who each open item waits on, what's next, later and on hold — with each open
      item's notes below in the same order. Finished items and the audit log moved here; the
      plan, the decisions (with plain names instead of D-codes) and the data schema to
      `docs/Decisions.md`; the deferred-ideas ledger, the batches table and the old
      dependency lists to `docs/Archive/TODO-Retired-2026-11-18.md`. `tests/test-todo.js`
      checks the new layout.

## Finished in Phase 7, as filed

### P0 — in the app, before the pilot [brief §9 row 1; §7]

What the pilot can't start without.

- [x] **1. Terminology pass.** Rename two terms on screen: "Job code" becomes **Cost
      Code**, and "Drafter" becomes **Technical Designer**. *The Drafter half shipped in
      v1.31.1 (tracker #17, with #22's Project Team / Project Schedule headings). The Cost
      Code half shipped v1.44.1 (PR #118, 2026-10-09; tracker #21, approved 2026-10-09):
      the Setup label (placeholder AB123), the header strip, tour steps 1 and 9 and the
      Clients directory say "Cost code"; Changelog rows read `jobCode` as "Cost code" and
      `drafter` as "Technical Designer". Suite `tests/test-v1441.js`. The owner renamed the
      SharePoint column's display name to `costCode` on 2026-10-09 (internal name stays
      `jobCode`). The archived ledger holds the one "Drafter" echo that remains (the D chip).*
      - *Where:* sidebar, bar labels, tooltip, Meeting Sheet, late prompt, New Project.
        (Drafter had labels only on the project page and in the legend; the Cost Code
        list is #21's.)
      - *Labels only.* The stored field names (`jobCode`, `drafter`) stay, because the
        schema is shared.
      - *How:* round two of `docs/Copy-Coach-and-Helpers.md` (round one shipped in
        v1.15.1).
      - *Not in this item:* "flexible roles instead of fixed buckets" changes the data
        model. Today there are four fixed role columns (PM, Drafter, Project lead — Lead
        fabricator until v1.30.0, tracker #18 — and Fabricators). The legacy `metalFab` was
        deleted 2026-11-17 (item 29).
        That's Phase 8, the stable-IDs ruling.
      [brief §7 Terminology]
- [x] **2. Lock dates: give it one meaning, then explain it.** Confirmed P0 by user
      feedback (owner, 2026-09-24). *(a), (b) and (d) shipped v1.45.0 (PR #123,
      2026-10-09).* The owner chose option 1 on 2026-10-09: drags never change dates, on the
      timeline and the project page (Gantt and calendar); lane moves and typed dates still
      work. Renamed **Protect dates**; its tooltip says what it stops and that it is always on
      for view-only users. Suite `tests/test-v1450.js`. (c) Shipped v1.46.1 (PR #133, 2026-10-12): Protect
      dates follows the person, in the same `savedViews` value as item 25's views. Suite
      `tests/test-v1461.js`.
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
      - *Waits on:* nothing.
      [brief §5.1, §7 "Tour and Lock dates"]
- [x] **3. The tour keeps looping: reproduce it, then fix or gate it.** Shipped v1.49.0
      (PR #166, 2026-10-16). *Cause, reproduced in headless Chrome with real clicks:*
      step 7 (the + New Project hand-off) hid Next, so Back sat in the card's forward
      corner; a user clicking onward went 7 → 6 → 7 → 6. Not browser-specific. Next now
      stays there and presses + New Project; a step whose target is gone is skipped in
      the direction of travel; the auto-run can't restart a tour already up. **Don't show
      again** on the card writes a per-person `ShopTimeline_Config` row
      (`tour.off.<account>`, no schema change) so the tour never auto-starts again on any
      computer; Help still runs it. Suite `tests/test-v1490.js`. Safari wasn't tested
      (no Mac here); the cause is in the tour's own logic, so it applies there too.
      - *Report (tracker #7, 2026-09-24):* the walkthrough loops between steps 6 and 7 of
        14. The browser wasn't recorded, so test Safari, Chrome, Edge and Firefox.
      - *Best guess:* a browser that forgets local storage every session (a private
        window, or a policy that clears site data on exit) loses the "tour seen" flag
        (`shopTimelineCoachSeen`) and replays the first-visit tour every time. Ask the
        reporting user about their browser and setup. No loop bug is on record.
      - *Fix options:* a "tour seen" flag per person (⚠ one Staff column), or a "don't
        show again" button on the tour card.
      - *History:* the owner ruled "leave it" on 2026-09-02; the brief is the complaint
        that ruling said would reopen it (the archived ledger, L1001). Related: the chained tour's step
        count assumes its second half opens on a draft (the archived ledger, L1233).
      - *On hold (owner, 2026-10-01 on the ticket):* "Hold pending dev testing."
      [brief §5.1, §9 P0 "tour fix"; tracker #7]
- [x] **4. Keep time-off notes private.** Shipped v1.44.0 (PR #116, 2026-10-08): only an
      admin sees the note typed on an out-of-office range (`oooNote`); everyone else sees the
      dates, and the person panel reads "Out of office". Four places: the People record, the
      people lanes, a phase's hover tip and the person panel. Suite `tests/test-v1440.js`.
      Display only: the note still loads in every browser (the archived ledger).
      Notes typed on an out-of-office range showed to every signed-in user. Hide them from
      non-admins, or leave the field out of non-admin views.
      This is the brief's suggested P0 addition. [brief §7.2, §9 Response]
- [x] **6. Show the last update; flag stale projects.** Shipped v1.48.0 (PR #142,
      2026-10-13), owner wording 2026-10-13: "Last edited by Sam · Oct 12, 2:14 PM" on the
      project page header and under each project on the Meeting Sheet; a grey "Stale" chip
      in the sidebar ("No edits in 14 days"). The last edit is the newest stamp on the
      project or any of its phases and notes. N = Config key `stale.days`, default 14, set
      on App settings (owner, 2026-10-13: change it there without a release; the Project
      Director can still pick the number). A completed or On Hold project is never stale. The legend
      got no entry (item 8's lesson). *The call to action* (owner, 2026-10-13, asked before
      merging: what is the user supposed to do?): a "Schedule still accurate" button on a
      stale project's header writes `confirmedAt` / `confirmedBy` (owner added them 2026-10-13) on its Projects row and
      clears the tag without a fake edit; the header then adds "· confirmed Oct 13 by Sam";
      the PM's own My Dashboard lists "Your stale projects"; the chip's tooltip says what to
      do. Before the columns exist the button explains they're missing. Suite `tests/test-v1480.js`.
      *Checked live* 2026-10-15 on production v1.48.5 (owner): with `stale.days` set to 1
      on App settings, "Schedule still accurate" cleared a project's Stale tag, the first
      live write to `confirmedAt` / `confirmedBy`; `stale.days` is back to 14. To check it
      again, lower `stale.days` the same way rather than waiting for a project to go stale.
      Who last edited a project and when
      (`updatedBy` / `updatedAt`) already comes from Graph, but shows only in hover cards
      (and, for admins, the change log). Put the last editor and time on the project page
      header and the Meeting Sheet. Add a "stale" chip in the sidebar and legend for a
      project with no edit in N days (N set with the Project Director). [brief §5.1, §7
      Reliability, §9 P1 "stale-data warnings"]
- [x] **7. Make repeat department work easy to find.** Shipped v1.47.0 (PR #134,
      2026-10-12). Duplicate on a bar's right-click menu (an add, so N11 holds) and its edit
      popover; ⋯ on project-page bars; the divider's grip always shows; the draft footer
      counts the three required fields and links each missing one. "Section progress" was
      read as that count. Suite `tests/test-v1470.js`. The feature exists — each block is
      its own record, and Duplicate and New subtask work even before the first save —
      but users don't find it.
      - Put Duplicate on the bar's popover and right-click menu, not only in the
        inspector (the archived ledger, L1044).
      - Add the ⋯ hover cue to project-page bars (the archived ledger, L1011).
      - On New Project's divider: a grip that shows before hover (the cursor, tooltip,
        remembered height and collapse already exist), section progress, and links to
        the missing fields that Create already names.
      [brief §1, §7 Repeat work + New Project layout, §9 P0 "before shop-wide use", P1
      "small fix"]
- [x] **8. Department rollup: label the band or drop it.** Closed 2026-10-12 with no
      change to the band. A legend label ("Overall span (gaps aren't work)", PR #135) reached
      `/preview/` only as v1.47.1. The owner ruled the same day that the track is
      self-explanatory and the label redundant and unclear, so it was removed in v1.47.2
      before reaching production (PR #138). The two whole-project numbers below became item
      59. The faint band behind each
      department row runs from its first start to its last finish, gaps included, so it
      can read as continuous work. Label it "Overall span" or remove it.
      - *Fact-check correction:* two whole-project numbers also span gaps: the Meeting
        Sheet progress % (first start → last end) and the project page's "Lead time N
        workdays". Neither counts a gap as department work or load. If the rule is "gaps
        never read as work", the progress bar is the one to relabel or compute from the
        blocks.
      - Double-booking checks already use the actual blocks.
      [brief §7 Rollup, §8.2, §14]
- [x] **25. Saved views follow the person, not the browser** (owner ruling 2026-09-24).
      Shipped v1.46.0 (PR #132, 2026-10-12). The owner added the `savedViews` column on
      2026-10-12. Suite `tests/test-v1460.js`.
      Today a saved view lives in one browser's local storage (`shopTimelineViews_v1`).
      - *Change:* store views on the signed-in user's own Staff row: ⚠ `savedViews` on
        `ShopTimeline_Staff`, multi-line text holding a JSON list, written only to the
        user's own row (as `personalNotes` already is).
      - *Migration:* on the first load after the release, copy the browser's views into
        the row, then keep the local copy as a cache.
      - *Result:* a view saved on any machine follows the person. The same row then holds
        other per-user settings that are session-only today: Lock dates (item 2c),
        density, and sidebar width if wanted.
      - *Later:* shared and role-based views (item 30, the permissions decision) reuse the same JSON format in
        Phase 9.
      - *Waits on:* nothing. Additive column; the spec comes with the batch.
      [brief §2 "plan saved views and permissions now", §7 Audience views]
- [x] **32. Shipping bar missing; Shipping milestones don't attach.** Shipped v1.50.0
      (PR #165, 2026-10-16): Help ▸ My settings chooses where the project Gantt draws
      milestones (On their phase, the default · Both · Milestones row only). Suite
      `tests/test-v1500.js`. A user added
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
      - *Approved (2026-10-16):* "Proceed", with changes: a toggle, not a move, so current
        users aren't surprised.
      - *2026-10-16:* Owner ruling: Phase is the default; the choice lives in Help ▸ My
        settings and follows the person.
      - *2026-10-16:* Owner ruling 2026-10-16: drag a milestone up or down to change its
        phase; the Milestones row means Project Management.
      - Possible follow-ups, unapproved copy so not built: a "Shipping (not scheduled)" label
        in the Phase dropdown, and a one-click "Add Shipping" offer.
      [tracker #1]
- [x] **53. A role change must move the project to the new holder** (P0 bug, tracker #34).
      Shipped v1.42.0 (PR #111, 2026-10-08). On the saved page, a role change hands that
      department's bars over from today in one save (`roleHandover`). Under Project Schedule, a
      bar still held by a former holder shows a note with "Hand over from today". Suite
      `tests/test-v1420.js`. One reading beyond the spec's letter: an *umbrella* bar that
      already ended is pinned to the old holder by name. Left untouched, it would silently
      follow the new holder and rewrite the days worked (R4).
      When a project's PM, Technical Designer or Project lead changes after creation, the
      project stays under the old holder: a bar that carries its own crew ignores the
      project team.
      - *Owner's rule (2026-10-05):* every current view shows who holds the role now: the
        sidebar summaries, lanes, My Dashboard, the Meeting Sheet, chips and tooltips. The
        Gantt keeps the old holder on the days up to the change.
      - *Revised spec:* split a role-owned bar on the day of the change. The past part keeps
        the old holder, the part from today goes to the new one. Fabricators owns no bar.
      - *Approved:* "proceed with fix", 2026-10-06.
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

- [x] **31. Each feedback report becomes a GitHub issue, screenshots included. Running
      since 2026-09-25** (no app release). Priority (owner, 2026-09-24: "whatever is easiest to implement
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
        can't be private on GitHub Free, because Pages needs it public (item 71).
      - *Status follows GitHub* (rule set 2026-09-25): closing a ticket marks the row
        `resolved` (it moves to the Resolved column of the Open Issues page), and
        reopening clears it. The poller runs on every close or reopen (about a minute),
        hourly on a best-effort schedule (GitHub doesn't always fire it on time), and on
        demand (`gh workflow run`). The first day's two-way rule — resolving in the app
        closed the ticket — was dropped, because it re-closed reopened tickets. Side
        effect: once a report has a ticket, the developer page's Mark resolved / Reopen
        buttons are overridden by the next run. Ledgered in the archived ledger; remove them with the
        next change to `renderReports` (item 39 shipped without touching that page).
      - *Day one:* the first run filed tracker #1–#12 from 13 rows, carried in as items
        32–40. Open rows were back-filled; resolved history stays on the list. Commits
        in this repository close tickets with
        `Fixes 221twoseven/Project-Scheduler-issues#N`.
      - *The backup maintainer* has no GitHub account (owner, 2026-09-25), so tracker access for him is
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

These need someone to own them in SharePoint, Power Automate or the business, not an app
release. Where the app has a part, it's listed.

### P1 — checks and small fixes [brief §9 P1]

- [x] **20. Write down the change log's limits** (the brief's verification row). Done
      (PR #154, 2026-10-15), docs only: retention and recovery paragraphs added to
      `docs/Milestones/Phase-6-v1.x-Release-Train/2026-09-02-changelog.md`. They found one open
      check, whether versioning is on for the nine lists, which joins item 15.
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
- [x] **21. Refresh the reference docs before reviewers see the repository.** Done
      2026-10-15, docs only (no release): `docs/ARCHITECTURE.md` (all lists, the `store`
      seam, every route, departments, a "Formulas and rollups" section, hosting),
      `docs/SETUP.md` (four scopes, all lists, the Feedback Bot and its secret expiry,
      `/preview/`), `CLAUDE.md` (no line or list counts). The living docs had drifted
      from the code:
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
- [x] **23. Milestone records owed** (the `CLAUDE.md` rule). Done 2026-10-15, docs only:
      five records (`Phase-6-v1.x-Release-Train/` v1.20.6, v1.20.8, v1.20.9;
      `Phase-7-Pilot-Readiness/` v1.40.1, v1.41.1) and the two ladder rows in
      `docs/Archive/TODO-v1.x-Archive.md` §4. What was owed: v1.20.6 Shipping phase (it
      changed the phase chain and the department vocabulary, but is documented only as a
      footnote), v1.20.8 (PM required at Create; dashboard columns scroll), v1.20.9. The
      v1.x version ladder also has no rows for v1.20.0–v1.20.9 and v1.21.x: add one
      combined row each to the archive's Decisions.md, the way `CHANGELOG.md` combines v1.14–1.15.
      Also owed from Phase 7 (found 2026-10-08):
      - **v1.40.1**: Open Issues column labels;
      - **v1.41.1**: the narrow-sidebar lens switch. Its before/after screenshots are
        already in `Phase-7-Pilot-Readiness/screenshots/`.

      Docs only.
- [x] **72. A `/test/` site for one feature on trial** (owner, 2026-10-16: item 32 goes
      "on its own branch for testing", before `/preview/`). Built in PR #164 (2026-10-16):
      Pages published a third subpath, `/test/`, from a `test` branch. Item 32 was tried
      there and merged (PR #165).
      - *Retired 2026-10-19* (owner: "managing too many branches is going to get sloppy").
        The deploy is back to `/` and `/preview/`, and the `test` branch and its Pages
        deploy permission are deleted. The owner may remove the `/test/` redirect URI from
        Entra. A future trial goes straight to `/preview/`.
- [x] **75. A Today button on the project page** (owner, 2026-10-16). Shipped v1.51.0
      (PR #169, 2026-10-19): Gantt puts this week's Monday at the left edge (the timeline's
      rule, item 33); Calendar puts the current week's row at the top, or the job's first or
      last week when the job lies wholly after or before today. Suite `tests/test-v1510.js`.
      The project chart
      opens fitted to the whole job, but once you zoom in, the only way back to today is
      scrolling. Add a "Today" button to the chart's header row, beside the zoom buttons
      and Reset, with the hover text "Scroll to today".
      - *Gantt:* it brings today into view.
      - *Calendar:* it jumps to the current week.
      - *Applies to:* both the draft and the saved page.
      - *No shortcut:* T already means New note on the project page.
      - *Order:* build after item 32 (PR #165), which changes the same header row.
- [x] **76. Stop the stacked login windows** (owner, 2026-11-09: a tab left open overnight
      greeted him with up to fifteen Microsoft login prompts). Shipped v1.51.3 (PR #180,
      2026-11-09). Root cause: `spToken()` fell back to an interactive token popup whenever
      silent renewal failed, and the 90-second poll calls it with no concurrency guard —
      one window per tick. Now: token renewal is silent-only; an expiry first retries
      `ssoSilent` (a still-alive Microsoft session heals invisibly), and only then shows
      one in-page "Your sign-in expired" overlay. The one real login window opens only
      from that overlay's button (single-flighted), a save parked by the expiry replays
      after re-sign-in, and a signed-out tab stops polling entirely. Suite
      `tests/test-v1513.js`.
- [x] **77. Fix the date rot failing CI on every PR** (2026-11-09). Test-only, no release.
      `tests/test-v1400.js` seeds demo projects with fixed dates (Jul 2026 – Jan 2027) but
      opens the print preview on its real-clock prefill (today + one paper width), so from
      early Nov 2026 the prefilled window held no bars and the suite crashed on a null
      `pvBar` — on unmodified `development` too, failing the `CI / test` check on every PR.
      It last passed in CI on Oct 19. Fixed on `development` (PR #181, 2026-11-09): a new harness
      option (`opts.now`) pins the jsdom window's clock, and the suite uses it to sit at
      2026-10-01, inside its data; the demo dates and per-page row-count assertions are
      untouched.
- [x] **78. Make the suites CRLF-proof for Windows checkouts** (2026-11-09, the follow-up
      named on PR #181). Test-only, no release. On a Windows clone, git's `core.autocrlf`
      writes `index.html` to disk with Windows line endings, and three suites' source-regex
      assertions match `\{\n` — so `test-v1100` (visible-first coachEl) and
      `test-v1180`/`test-v1181` (applyPerms at the door) failed locally while CI (Linux, LF)
      stayed green. Fixed on `development` (PR #182, 2026-11-09): `suite()` in `tests/harness.js`
      normalizes the source's line endings before any assertion sees it, the same trick
      `tests/test-todo.js` already uses on TODO.md. Local `npm test` now matches CI.
- [x] **79. Pin `test-v1360`'s clock** (2026-11-10, CI red on the promotion PR). Test-only,
      no release. The dashboard chart starts on the 1st of the month 40 days back, and the
      suite's demo bar starts exactly 40 days back. On a day where that is a 1st (Nov 10:
      Oct 1), the bar sat at x=0, couldn't scroll into view, and "label back at its natural
      inset" read 14px vs 8. The app behaves correctly. Fixed in the promotion branch
      (PR #183, 2026-11-10): the suite pins its clock to 2026-10-20 with the harness's
      `opts.now` (item 77).
- [x] **80. One test date for every suite, and the edge day on purpose** (owner,
      2026-11-10: pinning one suite "feels hacky"; items 77 and 79 were two date failures
      in two days). Test-only, no release. Most suites built their data from the real
      date or checked fixed dates against it, so any of them could break on some day.
      Now `tests/harness.js` starts every suite's clock, in the test process and in the
      app's window, on one shared day (2026-11-10). The clock still ticks from there. A
      suite whose demo data needs another day passes `opts.now`. `TEST_TODAY=YYYY-MM-DD npm test`
      runs the whole set on another day, to look for date bugs; suites with fixed demo
      dates fail far from their data, which is the test's limit, not the app's.
      `test-v1360` also checks the day that failed by accident (2026-11-10, a bar on the
      chart's first day keeps its label 14px in). Done in PR #185 (2026-11-10).
- [x] **48. The storage seam.** One `store` object owns every conversation with
      SharePoint, instead of 37 call sites in 16 functions. It is idea 1 of
      `docs/Architecture-Review-Storage.md`, needed whatever the data-platform decision decides, and the path to an
      `apiStore` if the data-platform decision picks an API.
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
      - *Progress:* owner go for PRs 1–2 on 2026-10-12. PR 1 (the `store` object, no
        callers) done 2026-10-12 (PR #130); the `LIST_*` constants stay until their last caller
        moves. PR 2 (Projects, Tasks, To-dos, Events on `store`) done 2026-10-12 (PR #131).
        Owner go for PR 3 on 2026-10-12. PR 3 (Staff on `store`: load, save, the phone tidy,
        the import's column probe) done 2026-10-12 (PR #137). Of its audit findings below: the field
        table moved to item 61 (three suites assert the mappers' source text, and a seam PR
        allows no test edits); the shared `plan()`, the save/retry merge and `setPeople()`
        were not done. Staff saves collect every row's error and delete in a different order,
        and the two save paths differ in their pill, toast and continuation, so sharing them
        needs option switches: more code, not less. `setPeople()` would cover two sites.
        PR 4 (Clients and Config on `store`) done 2026-10-13 (PR #139; owner go 2026-10-12), with both
        of its audit findings: one `runClientSync` behind `saveClients` and
        `retryClientSync` (the two differ only in their message and in how a failure parks
        the diff base), and one `readConfig()` for `loadConfig` and the update check.
        PR 5 (Changelog and Feedback on `store`) done 2026-10-13 (PR #141; owner go 2026-10-13); the
        screenshot upload now goes through `gfetch` (same request, no `store.upload`); the
        feedback mail stays for PR 7.
        PR 6 (the Employee Contacts import on `store`: its column read and its item read) done
        2026-10-14 (owner go 2026-10-13); the requests are unchanged.
        PR 7 (identity and the Microsoft extras) done 2026-10-14 (owner go 2026-10-14):
        `store.signIn` / `store.who()` (no `ACCOUNT` read outside sign-in and `who`); the Team
        members read and the feedback mail go through `gpageAll` / `gfetch` with a silent
        `scopes` argument (no `store.people` / `store.mail`, per the audit); a 202 reads as no body.
        PR 8 (one error rule) Shipped v1.48.2 (PR #149, 2026-10-14; owner go and wording
        2026-10-14): `store.explain(err)` gives every SharePoint failure message one "why"
        sentence (offline / no access / list missing / column missing / busy / other), the raw
        error under Details; panels drop the Details pointer. Suite `tests/test-v1482.js`. The
        planned `store.available(kind)` swap for the five `*_OK` flags was dropped (the archived ledger, the
        owner agreed 2026-10-14). The one-page-size follow-up is item 68. Milestone record
        `docs/Milestones/Phase-7-Pilot-Readiness/2026-10-14-storage-seam.md`. The sequence is closed.
      - *Folded in from the 2026-10-12 ponytail audit* (owner accepted the placements):
        - PR 3 (Staff): one `PERSON_COLS` table for the 13 optional Staff fields that
          `personToFields`, `fieldsToPerson`, `cdSavePerson` and `cdMergePerson` each list
          by hand (keep the "not set yet" state that lets a missing column never 400);
          `spSyncStaff` reuses the diff `plan()` from `spSync` instead of a copy (staff keeps
          collecting per-row errors); one function for `savePeople` and `retryStaffSync`;
          one `setPeople()` for the three "assign, rebuild, cache" sites; the phone tidy writes
          through `store`.
        - PR 4 (Clients and Config): one function for `saveClients` and `retryClientSync`;
          `loadConfig` and `updCheck` share one Config read.
        - PRs 5 and 7: the Team-members read, the feedback mail and the screenshot upload go
          through `gfetch` / `gpageAll` with an optional silent `scopes` argument, instead of
          building their own token headers. This replaces the planned `store.people()`,
          `store.mail()` and `store.upload()` wrappers.
        - After PR 8: one page size for every list (it changes request URLs, so not during
          the sequence): item 68.
      [`docs/Architecture-Review-Storage.md` §1, "Proposed PR sequence"; the one-folder-per-product ruling; the data-platform decision]
- [x] **70. No scrapable email addresses in the public repository** (owner, 2026-10-15:
      spam and phishing about "full stack engineers" reached the team; "until the repo is
      private, we cannot have scrapable info"). Done 2026-10-15, tests only, no release:
      every fixture address moves to the reserved `example.com` / `example.org` domains.
      Some `firstname@twoseven.net` fixtures were real addresses, because that is the
      company's real format; others used live domains (`x.co`, `gmail.com`).
      **Real names too** (owner, same day: "scrub the real names from tests and docs"),
      because a real first name plus the public domain is an address. In tests, the
      app's sample roster and code comments, each real or likely-real name has a fixed
      fictional stand-in, kept to the same initial and length so sort-order and search
      assertions still hold (the owner named the others known to be real). In docs, the
      owner is "the owner", the backup maintainer "the backup maintainer", and the
      estimator's author "a colleague"; local paths read `users\<user>\`.
      `reference/Timeline_50.html` is **deleted** (owner, same day): it held the original
      sample roster's names. `test-quiet` keeps the one REV50 line it compared against.
      **Not covered:**
      - every commit's author address (`github@twoseven.net`) and the names in older
        commits, PR text and the history of every file stay public. The owner's GitHub
        email-privacy settings stop the address for new commits; rewriting history
        isn't worth it;
      - names inside the screenshots and PDFs under `docs/` (images, not text); the owner
        ruled a check not needed (2026-10-15).
      [owner ask 2026-10-15]
- [x] **69. Stop testing against the REV50 reference** (owner, 2026-10-14). Done (PR #153,
      2026-10-14), tooling only, no release. CI and the release checklist no longer run the
      suites against `reference/Timeline_50.html`; the file stayed as history
      (deleted 2026-10-15, item 70).
      `npm run test:ref` is gone, and new suites need no skip guard. `test47` and
      `test-b3-zoom` were deleted (they only ever exercised REV50; `test56` and
      `test-v150` own their features). `test-v1208`'s feature sniff stopped matching at
      v1.47.0, so it skipped silently; it was fixed and runs again (16/16). `CLAUDE.md`,
      `README.md`, `tests/README.md` and the `ship-release` skill follow. Item 60 removes
      the remaining guards. [owner ask 2026-10-14]
- [x] **68. One page size for every list.** Done 2026-10-15, no release (internal, like
      seam PRs 6–7): `STORE_LISTS` maps kind → list name, and every read uses
      `STORE_PAGE` = 2000 — the size the big lists already ran with live, so they still
      read in one request. Staff, Clients, Config and Employee Contacts change from 500 /
      500 / 200 / 999 (all far smaller lists, so the same single request). Was: `STORE_LISTS` kept each list's old `$top` (2000,
      500, 200, 999) so the seam PRs sent byte-identical requests. One value (paging already
      follows `@odata.nextLink`) is simpler. It changes request URLs, so tests that match them
      may need edits. Follow-up from item 48. [item 48; 2026-10-12 ponytail audit]
- [x] **59. Whole-project numbers that span gaps: decide whether they change.** Owner picked
      (c) for progress and (a) for lead time, 2026-10-14. Shipped v1.48.4 (PR #151, 2026-10-14):
      the Meeting Sheet bar is each block's workdays before today over all blocks' workdays;
      "Lead time" stays a calendar span (how long the client waits). Suite `tests/test-v1484.js`. Split
      out of item 8 (2026-10-12). Two numbers run from the project's first start to its last
      end, gaps included: the Meeting Sheet progress % and the project page's "Lead time N
      workdays". Neither counts a gap as department work or load.
      - *Options:* (a) leave both as they are; (b) relabel them so the span is explicit;
        (c) compute progress from the blocks themselves.
      - *Waits on:* the owner's pick. If the rule is "gaps never read as work", the
        progress bar is the one to change.
      [brief §7 Rollup, §8.2, §14; item 8]
- [x] **60. Test-suite tidy: one shared setup, suites found automatically.** From the
      2026-10-12 ponytail audit (owner accepted the placement). Test-only, no release.
      Done 2026-10-15: `run.js` finds `tests/test*.js`; `suite()` in `harness.js` replaces
      the copied setup and summary in all 123 suites; 117 top-of-suite skip guards
      removed. The exit-code-2 skip protocol wasn't needed: no suite skips itself any
      more, so `run.js` no longer looks for skips at all, and any non-zero exit fails.
      Full run: same per-suite counts as before. A few suites still skip one *section*
      on a feature sniff (`test46`, `test-contrast`, `test-v1341`); left as they are.
      - `tests/run.js` finds `tests/test*.js` itself instead of the hand-kept `SUITES` list.
        The list already lost one suite: `test-v1210.js` never ran in CI from v1.21.0 until
        it was re-listed on 2026-10-12. Update `.claude/skills/ship-release/SKILL.md` step 2
        to match.
      - A `suite()` helper in `tests/harness.js` replaces the setup and summary lines copied
        into about 118 suites (about 650 lines).
      - A skipping suite exits with code 2, so `run.js` stops reading its printed text to
        count skips.
      - The "skip on a pre-vX build" guards at the top of most suites go: with no reference
        run (item 69), they only hide a suite whose feature sniff stops matching, as
        `test-v1208`'s did from v1.47.0 until 2026-10-14.
      - *Done when:* the full run reports the same counts as before.
      - *Waits on:* nothing. After the 2026-10-12 promotion.
      [ponytail audit 2026-10-12; 2026-09-03 audit]
- [x] **61. Small simplifications from the 2026-10-12 audit.** Owner accepted the
      placement; each needs its own check. Shipped v1.48.3 (PR #150, 2026-10-14; owner OK
      for the poll change 2026-10-14), all four parts. Suite `tests/test-v1483.js`; the source-text
      checks in `test-v1170`, `test-v1180`, `test-v1220`, `test-v1230` and `test-v190` became behaviour checks.
      - `canonName` remembers its results until `PEOPLE` is replaced (a speed fix: it runs
        inside sorts and every render).
      - `spLoad`'s four repeated row loops become one helper.
      - One `PERSON_COLS` table drives `personToFields` and `fieldsToPerson` (moved here
        from seam PR 3). `test-v1170`, `test-v1220` and `test-v1230` check those mappers by
        their source text; they become round-trip checks (a row in, the same fields out) in
        the same PR. `cdSavePerson` and `cdMergePerson` keep their own lists, because each
        field there has its own clean-up.
      - ⚠ The background poll's pause check reuses `updBusy()` instead of its own shorter
        list. This pauses polling in slightly more cases (a focused toolbar field, an open
        New Project, a parked client or settings save), so the owner OKs it first.
      - *Waits on:* the owner's OK for the poll change only.
      [ponytail audit 2026-10-12]
- [x] **62. Fixes from the whole-release review, main v1.45.1 → v1.47.2.** Done in
      v1.47.3 (PR #140, 2026-10-13), before the promotion; neither bug reached production,
      so the release notes fold it into the v1.47.0 entry.
      - On a shared computer, the last person's Protect dates now resets even when the next
        person's staff list lands on a New Project page; only a drag in flight waits.
      - A New Project draft opened before the roster arrives repaints its footer when the
        staff list loads, so it counts and lists the Project Manager rule.
      - `test-v1360` compares a parked label within 1px: on some dates (2026-10-13) the fit
        zoom puts bars at fractional pixels, and exact float equality failed by a hair.
      Suite `tests/test-v1473.js`.
      [code review 2026-10-13]
- [x] **63. Fixes from the review of #141 and #142 (seam PR 5, item 6).** Done in v1.48.1
      (PR #143, 2026-10-13), before the promotion; nothing reached production, so the
      release notes fold it into the v1.48.0 entry.
      - A colleague's "Schedule still accurate" no longer clears your undo history: the
        poll's change test (`stripStamps`) and the change log (`CLOG_SKIP`) treat
        `confirmedAt` / `confirmedBy` as stamps, like `updatedAt`.
      - The button no longer flips the sync pill to "synced" over a parked failed save; the
        pill keeps its "not saved — click to retry" text until that save goes through.
      - Accepted, not changed: a real Setup edit within two minutes after confirming is read
        as the confirmation's own stamp, so "Last edited" shows the edit before it.
        Staleness is unaffected.
      Suite `tests/test-v1481.js`.
      [code review 2026-10-13]
- [x] **64. New reports reach the tracker within minutes.** Done 2026-10-13, no app
      release. GitHub ran the poller's "hourly" schedule only 3 to 4 times a day (gaps of
      3½ to 8 hours), so a new report waited up to a working day for its issue. The owner
      built *Shop Timeline — new report out* (Power Automate: on a new `ShopTimeline_Feedback`
      row, send the `feedback` repository dispatch the poller already listened for) and
      tested it (tracker #42). Exported to the tracker's `flows/` with README step 12 (tracker
      `03a8935`); `docs/Automations.md` entry *New report out*.
      [owner question 2026-10-13]

### Not yet placed — reported by users, in filing order [tracker]

Each report filed in the app becomes an issue in the private tracker
(`221twoseven/Project-Scheduler-issues`, item 31). **[tracker #N]** cites it; reporter
names stay there. These haven't been placed in a band yet. Already placed or closed: #1
is item 32 (P0), #7 is part of item 3, and #11 and #14 were done by the bridge itself.

- [x] **33. Today button: put the current week at the left edge.** Shipped v1.27.0 (PR #82,
      2026-10-02): Today, `T`, the popover's Today pick and the default view all put Monday
      of the current week at the left edge (`weekLeftX`); the other jumps still centre. The
      owner's Proceed added a light grey wash over past days (`.past-col`). The archived ledger
      ceiling was rewritten in place. [tracker #2]
- [x] **34. Name a repeat block (e.g. "possible mock-up days").** Shipped v1.38.0 (PR #99,
      2026-10-05): double-click a bar or calendar band (or right-click → Rename)
      renames it in place on the project page and the draft; the dashboard's Edit Phase
      dialog gained a Name field and opens with it focused (a bar double-click can no
      longer close it); calendar milestone bands and the Meeting Sheet's "Phase now" read
      the block's name. The archived ledger L1092 entry is struck. [tracker #3, screenshot in the
      issue]
- [x] **35. Keep phase labels visible while scrolling.** The text inside a bar ("Technical
      Design", "Main Shop Fab") scrolls off with the bar. Keep it pinned at the left edge
      of the canvas, next to the sidebar, like a sticky caption. A design item
      (`Design-Language.md`, bar labels): `position: sticky` inside the bar, or repaint
      the label on scroll. [tracker #4, screenshot in the issue] — v1.36.0 (PR #98): the label
      (and the project row's status pill) parks at the visible left edge on the dashboard
      and the project page, ellipsised at its bar's end.
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
      their text too. The developer page was not touched, so the archived ledger entry on its
      buttons now waits for the next change to `renderReports`. [tracker #10]
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
      place of Mark resolved / Reopen (the archived ledger entry ticked). Nothing is set by hand and
      a status change sends no email. [tracker #29]
- [x] **54. A project's bar starts at its first phase, not the hidden PM bar** (P1 bug).
      Shipped v1.44.2 (PR #119, 2026-10-09; approved 2026-10-09): `projSpan` gives the
      dashboard bar, the printed Gantt and Shop starts the earliest non-PM start, and a draft's
      PM bar follows its first phase (`npvRebuild`). Saved PM bars are not rewritten (Q2).
      Suite `tests/test-v1442.js`.
      A Forecast project whose first phase starts Nov 30 shows its dashboard bar and the
      header's Shop starts from Aug 12. *Root cause:* the hidden Project Management bar
      keeps the start the scheduler first gave it; a phase moved by hand on the draft
      doesn't refit it. The dashboard bar (`renderGantt`), the printed Gantt and Shop
      starts include that bar; Kickoff on the project page already skips it.
      - *Plan:* one helper takes the start from the earliest non-PM bar for all three. A
        new project's PM bar starts with its first phase. Saved PM bars aren't rewritten.
      [tracker #36]
- [x] **55. Hide the automatic Project Management row from Project Schedule** (P1).
      Shipped v1.44.3 (PR #120, 2026-10-09; approved 2026-10-09). Suite `tests/test-v1443.js`.
      The row is checked, disabled and labelled "spans job"; the PM is already chosen under
      Project Team. Its "must not set the start date" half is item 54.
      - *Built:* the group stays in the page but hidden (`.idg-pm`), because saves rebuild the
        department list from its checkboxes. The visible groups number from 1. The group shows,
        unnumbered, only when its "Hand over from today" note applies (item 53).
      [tracker #37]
- [x] **56. Tell reporters when their report is resolved** (P1, automation). Done
      2026-10-09 (no app release): the owner built the *Resolved* branch of the *Reply email*
      flow, tested it on #31 (reopen sent nothing, close sent one email) and re-exported the
      flow (tracker f48073e); tracker #38 closed. When a
      ticket closes, the poller already sets the row's `status` to `resolved`; nothing
      emails the reporter.
      - *Plan:* the owner adds a second branch to the *Reply email* Power Automate flow:
        when `status` changes to `resolved`, email the reporter ("…#<ID> was resolved",
        with the `#/issues/<ID>` link). Claude writes the build steps (tracker README step
        11) and the `docs/Automations.md` update; the owner exports the flow to the
        tracker's `flows/`. No app release.
      - *Approved 2026-10-09.* The steps are in the tracker README (step 11) and
        `docs/Automations.md` is updated (PR #123; the condition is named `Resolved`, PR #124).
      [tracker #38]
- [x] **58. Replies work like comments on both trackers** (owner, 2026-10-09). Shipped v1.45.1
      (PR #126, 2026-10-09); the owner rebuilt *Email reply in* and tested it on #31 the same day
      (flow exported to the tracker's `flows/`). A reporter's
      answer to a reply email becomes a comment on the GitHub ticket *and* in the app's Open
      Issues thread, beside the team's `/reply` and `/comment` notes.
      - *Built (v1.45.1, PR #126, 2026-10-09):* the app labels each comment *Team* or
        *Reporter* and counts "N comments" (`fbRepliesHtml`; suite `tests/test-v1451.js`).
        The poller (tracker 2d6ff74) copies **Reply from the reporter** comments to the row
        as `kind:'reporter'`, never mailed back, and an email-reply run starts the sync itself.
      - *Live test findings, fixed in the poller (tracker 29883d0):* the flow also saw the
        team's own outgoing emails when the reporter's mailbox is the sending one, so only a
        reply subject (`RE:`) posts now; an Outlook signature under a dash rule is cut.
      [owner ask 2026-10-09]
- [x] **57. CI runs on pull requests only** (owner, 2026-10-09). Done (PR #123,
      2026-10-09): `.github/workflows/ci.yml` no longer runs on the push after a merge,
      because the PR run already tests the merged result. Both branches take changes only
      by PR, and `main`'s required `test` check is the PR run. `CONTRIBUTING.md` and
      `docs/Stats-for-Nerds.md` follow. [owner ask 2026-10-09]
- [x] **65. Dragging a bar: show its dates as it snaps.** Closed with no build: the owner
      closed tracker #39 on 2026-10-15 ("Click+Drag to edit already exists, make sure to
      leave 'lock dates' unchecked"). The date chip below was not taken up; reopening the
      ticket brings it back. Was: Dragging bars already changes dates
      for editors unless Protect dates is on (likely why the reporter missed it; the owner
      checks her toggle). New: a date chip above the dragged bar (`Oct 5 – Oct 30 · 20 days`)
      that pulses each day crossed, more strongly at each new week; no sound; reduced motion
      turns the pulse off. Spec 2026-10-14; waits on Proceed. [tracker #39]
- [x] **66. Ticking crew names keeps your place.** Shipped v1.51.1 (PR #172, 2026-10-19):
      a repaint gives the crew list back its scroll and focus, and the panel section's
      scroll (`crewHold`, popover and phase panel). A poll repaint that lands while a name
      is pressed waits until the click is over. Suite `tests/test-v1511.js`; the archived ledger notes
      the press hold covers crew lists only. Each tick rebuilt the popover and the
      phase panel (`ppCommitCrew` → `innerHTML`), so the crew list jumped to the top and a
      quick second tick could be lost. Keep the scroll, and don't rebuild the box being
      clicked. Worst on install subtasks (whole staff list). Spec 2026-10-14; Proceed
      2026-10-19. [tracker #40]

**Shipped or closed with no item** (before the 2026-10-08 every-task rule; the full
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
| #30 | Phone layout for every page | Declined, 2026-10-01 (the archived ledger) |
| #31 | A test ticket | Closed |
| #42 | The owner's test of the *new report out* flow (item 64) | Closed, 2026-10-13 |
| — | Owner asks with no ticket: issue replies (v1.25.0–1.25.1), days beside dates (v1.33.1), resolved dates and `/comment` (v1.34.0), Open Issues column labels (v1.40.1), print formatting (v1.41.0), the narrow-sidebar lens switch (v1.41.1) | Shipped |

### Queued for Phase 8 — waiting on other work (see "What waits on what", Decisions.md, "The roadmap")

- [x] **28. Stable IDs.** Names are the join key today, which is why `canonName` and the
      legacy-name scrub exist. Link records by ID instead (the stable-IDs ruling).
      - `clientId` on Projects: additive, with a one-time backfill from client name to ID
        in the same milestone. `spId` (the SharePoint item ID) is the key until Clients
        get an `appId`.
      - `personId` on assignments (Tasks and the project role fields), so the
        name-matching helpers (`canonName` and the legacy-name scrub) can retire.
      - The colleague app no longer constrains the lists, so Tasks can change. ⚠
      - *Plan, 2026-10-19 (PR #177; the owner merged it as the go, 2026-10-19):* the names stay. Each record
        also stores which person or client every name means.
        - ⚠ *Columns:* `refs`, multiple lines of text (plain), on `ShopTimeline_Projects`,
          `ShopTimeline_Tasks` and `ShopTimeline_Tasks2`. It holds JSON mapping each stored
          name to its ID: `{"people":{"<name>":"<Staff appId>"},"client":{"<name>":"<Clients spId>"}}`.
        - *Read:* after people and clients load, and on every poll, a name with a ref
          reads as that person's or client's current name; one without works as today.
        - *Write:* every save writes the names as now, plus `refs`. The column is probed
          once per session (`store.columns`), so a list without it never 400s.
        - *Match:* only unambiguous matches get an ID: the `canonName` rule for people, the
          exact name (ignoring case) for clients. Free-text departments are skipped.
        - *Backfill:* `backfillRefs()` in the console runs a dry run that lists every name
          it can't match; `backfillRefs(true)` writes the refs.
        - [x] *(a) v1.52.0:* refs read, written and backfilled. A rename on People or Clients
          then carries its projects, phases and notes with it; today it doesn't.
          Shipped v1.52.0 (PR #186, 2026-11-11); the owner created the three columns
          2026-11-11. Suite `tests/test-v1520.js`; record
          `docs/Milestones/Phase-7-Pilot-Readiness/2026-11-11-stable-ids.md`. A rename
          carries only records that have refs, so the backfill comes next.
        - [x] *(a), the owner, once v1.52.0 is on `/preview/`:* run `backfillRefs()` in the
          browser console, signed in, and send Claude the unmatched list; fix those names on
          People or Clients; then `backfillRefs(true)`, after hours.
          2026-11-17: the first dry run listed 96 names. Most were a department's own name
          in a crew slot ("CNC", "Painting", the old "Finishing") or a "—", which mean the
          department or nobody. The matcher now skips those (PR #187, no release: only the
          dry run's list changes). The rest go to the owner by name.
          2026-11-17: the owner identified four people names; a console `scrubNames` run
          renames them. A bare "Daniel" (two Daniels on People; 4 fields on the Harlequin
          Design – Ralph Lauren and Demo Booths projects) stays unlinked for now, because
          the person who knows is away. It keeps working by name, and (b) treats it as a
          known leftover until someone names him.
          Done 2026-11-17: the owner added the missing clients (Van Cleef & Arpels, Amplify,
          Whitney Museum; Timeline Development's client is now TWOSEVEN), and
          `backfillRefs(true)` wrote 99 records. Only the four "Daniel" fields remain.
          Production (v1.51.3) doesn't write refs, so records created there stay unlinked
          until v1.52.0+ is promoted; a later dry run picks them up.
        - [x] *(b) Once the dry run shows nothing unmatched:* `canonName`'s matching and
          `scrubLegacyNames` retire, and the People merge repoints IDs.
          Shipped v1.55.0 (PR #198, 2026-11-17); the owner chose to start it with only the four
          "Daniel" fields unmatched. Names now compare as stored, and refs resolve the old
          abbreviations. New refs link only an exact name, ignoring case. The merge moves every
          name linked to the duplicate, even an older spelling, and the save links it to the
          kept person. Suite `tests/test-v1550.js`; `test-v165` now proves its legacy forms
          through refs. Record
          `docs/Milestones/Phase-7-Pilot-Readiness/2026-11-17-name-matching-retired.md`.
          *Ceiling:* a name with no ref and no exact match (the four "Daniel" fields) stays its
          own name, its own lane in the Departments view. Naming him on People and running
          `backfillRefs(true)` fixes it. *Checked 2026-11-17 after the merge:* the owner's
          `backfillRefs()` dry run on `/preview/` lists only those four.
        - *Not in it:* the stamps (`createdBy`, `completedBy`, `updatedBy`, `confirmedBy`,
          Changelog `who`) stay names, as a record of who it was at the time.
        - *Ceiling:* `refs` is JSON, so SharePoint can't filter by it. At the data-platform decision cutover it
          becomes the migration key (the stable-IDs ruling's target identity).
      [brief §8]
- [x] **29. Drop the dead columns** `metalFab`, `labels` and `checklist` (the archived ledger, L1040). Done
      2026-11-17: the owner deleted all three columns. A
      deliberate cleanup now that the colleague app no longer constrains the lists. The app stops writing them one release
      before the columns are deleted; milestone record. ⚠
      - [x] *Step 1:* the app no longer reads, writes or searches them. Shipped v1.51.2
        (PR #176, 2026-10-19). Suite `tests/test-v1512.js`.
      - [x] *Step 2, the owner (once v1.51.2 is on `main`):* done 2026-11-17. "Ask everyone
        to reload" was pressed 2026-11-11 (v1.51.3) and again 2026-11-17 (v1.53.0). Both
        lists were exported to CSV and kept by the owner. No project held a `metalFab`
        value (checked from the console), and `labels` / `checklist` held only `[]`. The
        steps as written: set the Config key
        `update.minVersion` to `1.51.2` (Help ▸ App settings ▸ "Ask everyone to reload") so
        open tabs on an older build reload. **Wait a working day**, so laptops that were
        asleep wake, check and reload: a tab still on v1.51.1 can't save once the columns
        are gone, and its unsaved change is lost when it reloads. Then export
        `ShopTimeline_Projects` and `ShopTimeline_Tasks2` to CSV (a deleted column can't be
        restored, and there are no backups yet, item 15). Sort by `metalFab`: any value is
        legacy crew text, so copy it into that project's Fabricators first, or tell Claude.
        Then delete `metalFab` from `ShopTimeline_Projects` and `labels` and `checklist`
        from `ShopTimeline_Tasks2`.
- [x] **81. A project's client must come from the Clients list** (owner, 2026-11-17).
      Shipped v1.53.0 (PR #189, 2026-11-17): a native dropdown of every client, A–Z with its
      alias, "Pick a client" first. A dropdown can't take typed text, so the error became the
      note under the field for a stored client that isn't on the list (owner's wording,
      2026-11-17). With no client list at all it stays a typed field. Suite
      `tests/test-v1530.js`; record `docs/Milestones/Phase-7-Pilot-Readiness/2026-11-17-client-from-list.md`. The
      Client field on the project page and the New Project draft is a text box with
      suggestions, so anything typed is saved. That's how client names with no Clients entry
      reached projects (item 28's first backfill dry run, 2026-11-17).
      - The field accepts only a name on `ShopTimeline_Clients`, matched ignoring case and
        saved in the list's spelling. Anything else shows an error and doesn't save.
      - It opens as a real list of every client. Today's suggestions only show names that
        contain what's already typed, so on a project whose client isn't on the list the
        arrow shows nothing (owner, 2026-11-17, reassigning VCA Spring 2027).
      - New clients are added on the Clients page: the product that owns the data creates
        it (Decisions.md, "What we're building", the one-folder-per-product ruling).
      - The error wording, and any "add it on Clients" link, go to the owner before building.
      - A project whose client isn't on the list keeps showing it until someone picks one;
        `backfillRefs()` lists them.
      - *Waits on:* nothing. Goes with item 28.
- [x] **82. Department phases stop storing the department's name as their crew** (owner,
      2026-11-17). Done 2026-11-17: shipped v1.54.0, and the owner's tidy cleared 73 phases.
      Shop departments with no people roster (CNC, Painting, Printing and the
      rest) are scheduled as the department. When the app creates their phases it writes the
      department's name into the crew field (`assigneeFor`), so one field holds either people
      or a label. The stored name also goes stale when a department is renamed ("Finishing",
      Painting's old name), and some old rows hold a "—".
      - New phases for those departments leave the crew empty, and screens show the
        department's name wherever they showed the stored one.
      - The build first lists everything that reads those crews (the Departments lens, the
        person filter, print, search) so nothing loses its label.
      - A one-time console tidy clears the department names and dashes from existing rows,
        dry run first, like `scrubLegacyNames`.
      - Until then the backfill skips them (PR #187).
      - *Waits on:* nothing. Goes with item 28.
      - [x] *The build:* Shipped v1.54.0 (PR #193, 2026-11-17). `assigneeFor` returns an
        empty crew for those departments, as the edit dialog already saved. The readers were
        already safe: Departments lanes, phase labels and search read the department; the
        person filter, the People counts and the overbooking check skip non-people. The hover
        card drops its empty crew line. Suite `tests/test-v1540.js`; record
        `docs/Milestones/Phase-7-Pilot-Readiness/2026-11-17-dept-crews.md`.
      - [x] *The owner, once v1.54.0 is on `/preview/`:* run `tidyDeptCrews()` in the
        console (a dry run that lists every phase it would change), then
        `tidyDeptCrews(true)`. A dash on a Project Management or Main Shop Fab phase means
        "nobody"; cleared, that phase follows the project's team like any other unowned
        phase. Done 2026-11-17. The dry run listed 73 phases: department names, the old
        "Finishing", and three dashes (Art Lab's PM and Main Shop Fab, Timeline
        Development's PM). One crew kept its person ("Jed Marshall, Electrical" became
        "Jed Marshall"). All 73 saved as one step. The owner confirmed that shop
        departments are assigned as a department and the team divides the queue, so an
        empty crew is the intended state.
- [x] **83. The project page's name column stays on top** (P1 bug, owner's screenshot,
      2026-11-17). Shipped v1.54.1 (PR #194, 2026-11-17). Scrolled sideways, a selected
      phase bar ran over the names on the left of the project-page Gantt, and so did
      milestones, notes, holiday pills and the Today and deadline lines. Each row was its own
      layer, so the name cell lost to anything drawn above it. Now the chart body is one
      layer and the name column sits on top of everything in it. CSS only. Suite
      `tests/test-v1541.js`; record
      `docs/Milestones/Phase-7-Pilot-Readiness/2026-11-17-name-column-on-top.md`.
- [x] **84. A long Changelog entry folds** (P1, owner's screenshot, 2026-11-17). Shipped
      v1.55.1 (PR #199, 2026-11-17). The owner's 73-phase tidy wrote one "Bulk change" row
      that listed all 73 records and filled the page. Any entry longer than six lines now
      shows its first four and folds the rest under "N more" (a native disclosure, the same
      fold as a feedback report's comments), on the Changelog page and the project page's
      Changelog panel. The filter still searches the folded lines. Suite
      `tests/test-v1551.js`; record
      `docs/Milestones/Phase-7-Pilot-Readiness/2026-11-17-changelog-fold.md`.
- [x] **49. The Systems portal and the Timeline move (the one-folder-per-product ruling's reshape PR).** Shipped v1.56.0
      (PR #201, 2026-11-17); the owner's go came the same day, with item 5 (the last pilot
      P0 batch) still waiting on the Project Director. The root is the Systems page, built to
      the owner's Portal Option 1 wireframe (the wireframes now live in `design/wireframes/`):
      "Your workspace" and four app cards in the owner's wording (all four, Office greyed).
      Timeline, People and Clients link to Timeline's pages; Office reads "Not built yet"
      and isn't a link. The wireframe's Apps menu, avatar and recent work wait for a page
      that signs in. Timeline moved to `timeline/` with its MSAL file, and reads the
      font one folder up. Old `#/…` and `#view=` links forward to `timeline/`; a sign-in
      reply stays put. A tab opened before the move still checks the root for updates, so
      the Systems page names v1.56.0 in a comment: those tabs are offered the reload, and
      `update.minVersion` still retires them. The deploy workflow publishes either layout,
      and its guard checks every page from its own folder; PR #200 put that workflow on
      `main` first, so the two branches stay identical. Suite `tests/test-v1560.js`;
      `test-deploy-guard` reads both pages. Record
      `docs/Milestones/Phase-7-Pilot-Readiness/2026-11-17-systems-portal.md`.
      - *The owner:* add the `/timeline/` and `/preview/timeline/` redirect URIs *before*
        merging (`SETUP.md`). Keep the old `/` and `/preview/` ones until v1.56.0 has been
        on production for a working day, then they can go.
      - *Held from production (owner, 2026-11-17):* "hold this back from production until
        we're ready to push out a larger, more complete update, rather than a piece-meal
        half-baked version." v1.55.1 was promoted just before it (release/2026-11-17c). It
        goes out as launch 1 (owner, 2026-11-17): the Systems page with the shell (item 52
        step 4), the shared module (item 85) and the Clients app (item 86), so no card
        points at a page Timeline already has. Launch 2 is the People app (item 87).
        *2026-11-18 (owner):* the two launches are one, with the People app ("Where we stand", Decisions.md, "The roadmap").
      - *Clean-up, a working day after the launch reaches production:* moved to item 91.
      - *Not in it:* the wordmark still goes to Timeline's home; pointing it at the
        Systems page is style §13 step 4, the shell.
      The original spec: Timeline moves
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
      [the one-folder-per-product ruling]

### Queued — the Clients and People apps, before Office (owner, 2026-11-17)

The owner's rulings of 2026-11-17: the Systems page goes to production only when its cards
lead somewhere new, so it ships with the shell and a real Clients app (launch 1), then the
People app (launch 2); each app takes its page out of Timeline. Both go ahead of Office,
which waits on the project-list decision and item 14 meanwhile. The People app keeps today's fields and who sees
them. Items 85 to 87 are architecture, so each needs the owner's go before code.
*2026-11-18 (owner):* launches 1 and 2 are one promotion — a completed People app, Clients
app and Systems page — with the rename (item 88) just before it. Nothing goes to `main`
until all three are complete.

- [x] **85. The shared module, `common/`** (the launch). Shipped v1.58.0 (PR #208, 2026-11-18):
      (a) in v1.56.1, (b) in v1.58.0. ⚠ Architecture. A second product
      needs the sign-in and data code Timeline has, so that code moves into one shared folder
      that every product loads. The one-folder-per-product ruling planned this for when product #2 starts.
      - *What moves:*
        - sign-in: MSAL, the token calls, the expired-sign-in prompt;
        - the SharePoint data layer: `store`, paging, the site lookup, the one error rule;
        - toasts and the sync pill;
        - the admin and viewer-grant checks;
        - the update check;
        - the `--ts-*` tokens and the shell's CSS.

        `msal-browser.min.js` moves to `common/`. Timeline loads `../common/common.js` and
        `../common/common.css`, and so does each app.
      - *Files:*
        - new `common/common.js`, `common/common.css`, `common/msal-browser.min.js`;
        - `timeline/index.html`: the moved code goes, two tags come in;
        - `tests/harness.js`: loads the shared file into jsdom;
        - `deploy-pages.yml`'s lists: to `main` first, the way PR #200 did.
      - *Risks:*
        - A bug in the shared file breaks every product at once.
        - Timeline stops being a single file: it becomes one file plus `common/`.
        - Pages caches each file for up to 10 minutes, so a new page could meet an old shared
          file. The tags carry the version (`common.js?v=…`), so the two always load as a pair.
        - SharePoint and Entra don't change.
      - *Safety net:* all of Timeline's suites run through the shared file from the first PR.
      - *Rollback:* revert the PR. No list or Entra setting changes.
      - *Not chosen:* a copy of the code inside each app. Two copies of sign-in and saving
        would drift apart.
      - [x] *(a) The core* (owner's go, 2026-11-17). Shipped v1.56.1 (PR #205, 2026-11-17);
        the workflow went to `main` first (PR #204). Moved word for word into
        `common/common.js`: the constants, sign-in, the Graph calls, `store`, toasts, the sync
        pill and the expired-sign-in prompt. Into `common/common.css`: `--sans`, `--mono`, the
        `--ts-*` tokens, toasts and the sync pill. MSAL moved to `common/`. Timeline keeps its
        hooks: where the toast stack sits, the sign-in button (it replays Timeline's saves),
        the save queue. The tags carry `?v=APP_VER`, stamped by `npm run notes`. The harness
        inlines `common/`, so every suite runs through it. Nothing changes for users: the
        project page looks the same pixel for pixel, bar the version. Suite
        `tests/test-v1561.js`; record
        `docs/Milestones/Phase-7-Pilot-Readiness/2026-11-17-common-module.md`.
      - [x] *(b) With the Clients app (item 86):* the admin and viewer-grant checks and the
        update check. They lean on Timeline's staff roster and on its editing state (drags,
        drafts, open editors), so they move once a second product loads the roster, with
        hooks for each product's own "busy" rules. Shipped v1.58.0 (PR #208, 2026-11-18).
        Moved word for word into `common/common.js`: the update check (each product supplies
        `updWhyNot`, `updBusy`, `updGo` and its `APP_VER`; `updWatch()` starts it), the
        Config reader, the admin rule (`rosterAdmin`, `staffMe`, `adminFlag`), and the data
        rules the Clients app reads by: dates, the departments, a project's status
        (`statusOf`) and due date, the project and phase readers. The viewer grants stay in
        Timeline: they open Timeline's own doors, and Clients is admin-only.
- [x] **86. The Clients app** (the launch). Shipped v1.58.0 (PR #208, 2026-11-18); its deploy
      lines reach `main` with the launch (PR #207, which sent them ahead, was closed unmerged
      2026-11-18, owner). Owner's go and wording picks 2026-11-18: no left
      rail while Clients is its only section; "The company's clients and their cost-code
      aliases."; a client's record lists its current projects (code · due date, status · PM,
      a link into Timeline, "N in all"); People greyed "In Timeline for now". Timeline
      re-reads the list on the poll and when its tab comes back into view, so a client added
      in the app is in a project's dropdown straight away. Suite `tests/test-v1580.js`;
      record `docs/Milestones/Phase-7-Pilot-Readiness/2026-11-18-clients-app.md`.
      *Held 2026-11-18 (owner):* the Clients app and the Systems page are not ready for `main`;
      they wait for the owner's design and feature review on `/preview/`. The Entra redirect
      URIs for `/clients/` and `/preview/clients/` are added (owner, 2026-11-18).
      ⚠ Architecture, on item 85. Timeline's Clients
      page becomes its own product at `clients/`, built to the Clients wireframe
      (`design/wireframes/`), and leaves Timeline.
      - *It keeps what the page does today:*
        - the client list with aliases;
        - add, edit and remove;
        - how many projects carry each client, read from Projects (by stable ID where a
          project has one);
        - admin-only, as today.
      - *From the wireframe, only what exists:* the header, the list and the record; no left
        rail while Clients is its only section (owner, 2026-11-18; Contacts, Reports and
        Settings wait until they're built). Its wording went to the owner before building.
      - *Timeline:* Company Data ▸ Clients and `#/clients` go; an old `#/clients` link
        forwards to `../clients/`. The client dropdown (item 81) keeps reading the list, and
        its "not on the list" note links to the app.
      - *Systems page and the Apps menu:* the Clients card points at `clients/`. The People
        card is greyed until the People app (item 87), so no card points into Timeline. The Apps menu's list
        (`SYSTEMS_APPS` in `common/common.js`, v1.57.0) changes with it; `test-v1570` checks
        the two agree.
      - *The owner:* add the `/clients/` and `/preview/clients/` SPA redirect URIs before the
        merge.
      - *Data:* no schema change. A rename already reaches projects through their stable IDs
        (item 28).
      - *Rollback:* revert. The Clients list is untouched.

### Queued — Office, the next product, in project-cycle order (owner, 2026-09-29) [brief §6, §8.4–8.6; vision]

Office is the first new product to be built, in the order a job moves through the shop
(Decisions.md, "What we're building"): lead, estimate, creation. Items 13 and 14, in the P0 outside-the-app band, are its
inputs. Closeout is the last step of the cycle and comes last.

### Owner confirmations — answered 2026-09-24

- [x] `ShopTimeline_Config` **exists** (owner). The developer App Settings switches are
      shared through the list; "Listening to" (the archived ledger) now only needs the owner's call to
      promote or drop it.
- [x] The People page **is up to date** (owner): the `status` import has run.
- [x] The condensed brief **is in the repository**:
      `reference/2026-09-22-Shop-Timeline-Brief-Condensed.md` (dated title; the mailbox
      name, headcount and a location generalized, because the repository is public).

## Promotion audit log

History, kept as written (old section numbers and D-codes included).

Last reviewed: 2026-11-17 — the promotion audits for v1.51.3 → v1.53.0, v1.53.0 → v1.54.1 and
v1.54.1 → v1.55.1 reaching `main` (log in §8). Before that, 2026-11-10 — the promotion audit for v1.51.1 → v1.51.3. Before that, 2026-10-19 — the promotion audits for v1.48.5 → v1.51.0 and
v1.51.0 → v1.51.1. Before that, 2026-10-15 — the promotion audit for v1.48.1 → v1.48.5, after a full audit the
same day. Before that, 2026-10-13 — the promotion audit for v1.45.1 → v1.48.1 reaching `main`. Before that, 2026-10-09 — the promotion audits for v1.43.0 → v1.44.3 and v1.44.3 →
v1.45.1. Before that, 2026-10-08 — D15 (data platform) reassessed: Dataverse and Azure SQL + API
are now co-equal candidates (`docs/Architecture-Review-Backend.md`); D1, D3, D10–D13 and
items 14, 17 and 44 given storage-neutral readings. The same day: the opening, §0 and §3's
intro brought up to date, then a full audit against the tracker, `CHANGELOG.md` and the
branches; then the promotion audit for v1.41.0 → v1.43.0 reaching `main`. The full history
is the log in §8.

**Log, newest first:**

- 2026-11-17: **v1.54.1 → v1.55.1 promoted to `main`** (release/2026-11-17c), cut from
  `development` just before PR #201 (item 49, the Systems page). The owner holds item 49
  back from production until a larger, more complete update, so this promotion takes the
  two releases ahead of it.
  - v1.55.0 is item 28 (b), name matching retired (PR #198), ticked. The owner's
    `backfillRefs()` dry run after it lists only the four "Daniel" fields.
  - v1.55.1 is item 84, the folding Changelog entry (PR #199), ticked.
  - *Workflows:* `deploy-pages.yml` on `main` changed by PR #200 (no release): it publishes
    both the current layout and item 49's. The same file reaches `development` with #201.
  - *Tracker:* no change. #41 (item 67) and #12 (item 40) stay on hold.
  - *Schema:* no change. The owner added the `/timeline/` and `/preview/timeline/` redirect
    URIs for item 49 (Entra, not schema).
  - *Branches:* `main`, `development`, this release branch, and `feat/49-systems-portal`
    (PR #201, open into `development`).

- 2026-11-17: **v1.53.0 → v1.54.1 promoted to `main`** (release/2026-11-17b). This is the
  day's second promotion, held until v1.54.1 was in so that production moved once more
  (owner).
  - v1.54.0 is item 82 (PR #193), ticked with the owner's tidy (73 phases). Its docs PR
    #195 was closed, because it clashed with #194 in this file; its text rides here.
  - v1.54.1 is item 83, the project page's name column (PR #194), ticked.
  - *Docs with no release:* item 29 done, with the TODO check reading folded changelog
    headings (PR #192).
  - *Tracker:* no change. #41 (item 67) and #12 (item 40) stay on hold.
  - *Schema:* no change. The dead columns are deleted (item 29). The `refs` columns are in
    use.
  - *Workflows:* unchanged.
  - *Branches:* only `main`, `development` and this release branch. No other PR is open.

- 2026-11-17: **v1.51.3 → v1.53.0 promoted to `main`** (release/2026-11-17), so production
  saves keep the new stable IDs (the owner asked, right after the backfill linked 99 records).
  - v1.52.0 is item 28 (a), stable IDs (PR #186). Its sub-item is ticked, and so is the
    owner's backfill (99 records, 2026-11-17). Part (b) stays open.
  - v1.53.0 is item 81, the client dropdown (PR #189), ticked.
  - *Docs and tests with no release:*
    - item 80, one test date for every suite (PR #185), ticked;
    - the backfill skips department names in crew slots (PR #187, item 28);
    - items 81 and 82 added (PR #188).
  - *Tracker:* no change. #41 (item 67) and #12 (item 40) stay on hold.
  - *Schema:* the three `refs` columns were created by the owner 2026-11-11 and are listed in
    §6. Item 29's three dead columns still wait on the owner's delete.
  - *Workflows:* unchanged.
  - *Branches:* only `main`, `development` and this release branch. No other PR is open.

- 2026-11-10: **v1.51.1 → v1.51.3 promoted to `main`** (release/2026-11-10), so the owner
  can delete the dead columns (item 29, step 2) and the login fix reaches everyone.
  - It replaces the unmerged v1.51.2 promotion (PRs #178 and #179, release/2026-10-19c,
    closed): `development` had moved on, and its audit commits are carried here.
  - v1.51.2 is item 29's step 1 (PR #176), ticked. Step 2 is the owner's and listed.
  - v1.51.3 is item 76 (PR #180), ticked.
  - *Docs and tests with no release:*
    - items 73 and 74 deferred by the owner (PR #175, §7.4);
    - item 28's stable-IDs plan (PR #177). The owner merged it as the go;
    - items 77 (PR #181) and 78 (PR #182), test-only, ticked;
    - item 79, test-only, done in this release branch: CI went red on the promotion PR
      the day `test-v1360`'s demo dates hit a month boundary.
  - *Tracker:* no change. #41 (item 67) and #12 (item 40) stay on hold.
  - *Schema:* neither release needs a column. ⚠ Item 28's three `refs` columns are listed
    in §6 as not yet created. Item 29's three columns are deleted after this promotion.
  - *Workflows:* unchanged.
  - *Branches:* only `main`, `development` and this release branch.

- 2026-10-19: **v1.51.0 → v1.51.1 promoted to `main`** (release/2026-10-19b; the owner
  asked for item 66 to go out as soon as it was ready).
  - v1.51.1 is item 66 (PR #172, tracker #40), ticked.
  - The same PR recorded the owner's holds on item 67 (#41) and item 40 (#12).
  - #40 closes with this promotion.
  - No new SharePoint columns, and the workflows are unchanged.
  - Branches: only `main`, `development` and this release branch.

- 2026-10-19: **v1.48.5 → v1.51.0 promoted to `main`** (release/2026-10-19).
  - *Releases since the last promotion:*
    - v1.49.0 is item 3 (PR #166, tracker #7);
    - v1.50.0 is item 32 (PR #165, tracker #1);
    - v1.51.0 is item 75 (PR #169).

    All three are ticked.
  - *Docs and tooling with no release:*
    - item 72, the `/test/` site: built in PR #164, retired in PR #168;
    - items 73–75 added (PR #167).
  - *Tracker:*
    - #1 and #7 close with this promotion ("Fix shipped" posted after the merge);
    - #40 is approved and in build as item 66 (v1.51.1, not in this promotion);
    - #41 (item 67) is on hold and #12 (item 40) stays on hold. The owner ruled both on
      2026-10-19, and the dated lines land with item 66's PR.
  - *Schema:* no new SharePoint columns. Item 32's setting rides in the Staff row's
    existing `savedViews` value. Item 3's "Don't show again" writes one
    `ShopTimeline_Config` row per person (`tour.off.<account>`).
  - *Workflows:* `deploy-pages.yml` is identical on both branches again (two sites, `/` and
    `/preview/`), and the `test` branch and its Pages permission are deleted.
  - *Branches:* only `main`, `development`, this release branch and item 66's
    `fix/crew-list-scroll` exist.

- 2026-10-15: **v1.48.1 → v1.48.5 promoted to `main`** (release/2026-10-15). The promotion
  audit follows the full audit logged below, the same day (#160); since then nothing has
  changed but this promotion. §0 now reads production v1.48.5. No new SharePoint columns
  in this release. Workflows: `deploy-pages.yml` is identical on both branches; `ci.yml`
  drops the REV50 run (item 69) and keeps the required `test` job.

- 2026-10-15: **full audit before the v1.48.1 → v1.48.5 promotion** (owner: "fix the rest
  of the TODO").
  - *Releases since the last promotion (v1.48.1):* v1.48.2 is item 48 (PR 8), v1.48.3 item
    61, v1.48.4 item 59, v1.48.5 item 19's code part; all noted. Non-release work, all
    ticked: items 20, 21, 23, 60, 68, 69, 70.
  - *Tracker:* open #1 → 32, #7 → 3, #12 → 40, #40 → 66, #41 → 67 match their items. The
    owner closed #39 with no build, so item 65 is closed (the date chip not taken up).
  - *⚠ specs:* none new.
  - *Branches and PRs:* nothing open; only `main` and `development` on the remote.
  - *Fixed:* two sentences item 70's name scrub broke (item 16 and the 2026-09-24 log
    line); §0 and "Last reviewed" brought up to date; §8's item-21 pointer.
  - *Added:* item 71, make the repository private (owner ask).

- 2026-10-09 (second promotion): **v1.44.3 → v1.45.1 promoted to `main`** (release/2026-10-09b).
  The promotion audit (`CLAUDE.md`, "Keeping `docs/TODO.md` true"):
  - *Releases since the last promotion (v1.44.3):* v1.45.0 is item 2 ((a), (b) and (d) noted
    shipped; (c) waits on item 25) and v1.45.1 is item 58, ticked.
  - *Non-release work since then, all ticked:* item 56 (the resolved email, live, tracker #38
    closed) and item 57 (CI on pull requests only).
  - *Tracker:* no new tickets. #38 and the #31 test are closed. The three open ones match their
    items: #1 → 32 (needs Proceed), #7 → 3 (on hold), #12 → 40.
  - *⚠ specs:* none new.
  - *Branches and PRs:* nothing open besides this promotion; only `main` and `development` on
    the remote.
  - *Fixed in this audit:* §0 now says production runs v1.45.1.

- 2026-10-13 (promotion): **v1.45.1 → v1.48.1 promoted to `main`** (release/2026-10-13). The
  promotion audit (`CLAUDE.md`, "Keeping `docs/TODO.md` true"):
  - *Releases since the last promotion (v1.45.1):* v1.46.0 is item 25, v1.46.1 item 2 (c)
    (item 2 now complete), v1.47.0 item 7, v1.48.0 item 6. All ticked. v1.47.1–v1.47.2 are
    item 8: labelled, then removed at the owner's ruling, closed with no change to the band
    (item 59 holds its open question). v1.47.3 and v1.48.1 are the release-review fixes,
    items 62 and 63. CHANGELOG folds them into the v1.47.0 and v1.48.0 entries.
  - *Other work, ticked or recorded:* the storage seam, PRs 1–5 (item 48: #130, #131, #137,
    #139, #141; the PR numbers for 3–5 were added in this audit); the ponytail audit's
    placements (#136: items 60, 61 and item 48's notes; `test-v1210` re-listed after a month
    out of CI); item 64 (the *new report out* flow, added in this audit).
  - *Tracker:* four new tickets, all filed 2026-10-13. #39, #40 and #41 (one reporter:
    drag the timeline, the crew list jumping to the top, an All Projects button) got
    specs on 2026-10-14 and are items 65, 66 and 67. #42, the owner's test of the new
    flow, is closed. The older ones match their items: #1 → 32 (needs Proceed),
    #7 → 3 (on hold), #12 → 40.
  - *⚠ specs:* none awaiting creation. The owner added `savedViews` on Staff (2026-10-12)
    and `confirmedAt` / `confirmedBy` on Projects (2026-10-13); both are in §6's created
    list. `dateCertainty` (item 5) is still a candidate.
  - *Branches and PRs:* nothing open besides this promotion and its companion.
    `fix/confirm-review` (#143, merged) was still on the remote. A local-only
    `docs/d15-backend-reconciliation` holds a commit already in `development` as `c6b258c`.
  - *Fixed in this audit:* §0 now says production runs v1.48.1; the seam PR numbers; item 64
    and its Automations entry.

- 2026-10-09 (promotion): **v1.43.0 → v1.44.3 promoted to `main`** (release/2026-10-09). The
  promotion audit (`CLAUDE.md`, "Keeping `docs/TODO.md` true"):
  - *Releases since the last promotion (v1.43.0):* v1.44.0 is item 4, v1.44.1 is item 1
    (its Cost Code half, plus the §7.4 Changelog echo), v1.44.2 is item 54 and v1.44.3 is
    item 55. All ticked.
  - *Tracker:* three new tickets. #36 → 54 and #37 → 55 are built; they close when this
    reaches `main`, with #21 → 1. #38 → new item 56, spec posted, needs Proceed. The rest
    match their items: #1 → 32 (needs Proceed), #7 → 3 (on hold), #12 → 40.
  - *⚠ specs:* none new. The owner renamed the Projects column's display name to
    `costCode` on 2026-10-09 (internal name unchanged).
  - *Branches and PRs:* nothing open besides this promotion; only `main` and `development`
    on the remote.
  - *Fixed in this audit:* §0 now says production runs v1.44.3; item 56 added for #38.

- 2026-10-08 (promotion): **v1.41.1 → v1.43.0 promoted to `main`** (release/2026-10-08). The
  promotion audit (`CLAUDE.md`, "Keeping `docs/TODO.md` true"):
  - *Releases since the last promotion (v1.41.0):*
    - v1.41.1 (the narrow-sidebar lens switch) is in §3's "Shipped or closed with no §3
      item" table;
    - v1.42.0 is item 53, ticked;
    - v1.43.0 is item 9: (a), (c) and the Office Extension column ticked, (b) deferred in
      §7.4, (e) still waiting on item 26.
  - *Tracker:* no new tickets. The five open ones match their items: #1 → 32 (needs
    Proceed), #7 → 3 (on hold), #12 → 40 (leaning to hold), #21 → 1 (owner question owed an
    answer), #34 → 53 (closes when this reaches `main`).
  - *⚠ specs:* §6's `range`, `resolvedAt` and `ext` are all confirmed created.
  - *Branches and PRs:* nothing open. The one leftover remote branch,
    `docs/d15-backend-reconciliation`, is wholly contained in `development`.
  - *Fixed in this audit:* §0 now says production runs v1.43.0.

- 2026-10-08 (late): the owner confirmed that §6's `range` (on `ShopTimeline_Tasks`) and
  `resolvedAt` (on `ShopTimeline_Feedback`) exist; both are marked confirmed.

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

- 2026-10-08: **D15 reassessed** (owner and the backup maintainer). Office's relational, rule-bound data
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
  - Item 17 is tied to backend staging, item 44 gains a colleague's estimator as discovery
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
  PR #52 merged (the backup maintainer has no GitHub account). The bridge's dev-page buttons ledgered
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
  a backup maintainer named, Config exists, People page current); items 25–30 added and
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
