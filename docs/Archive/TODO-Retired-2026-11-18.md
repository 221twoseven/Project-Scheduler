# Retired from TODO.md, 2026-11-18 (frozen)

**Frozen. Not maintained.** These sections left `docs/TODO.md` when it became a one-screen
summary (item 89). Nothing here is planned work: an entry comes back only as a new item in
`TODO.md`, when someone asks for it. Old section numbers (§0–§8) and decision codes (D1–D15)
are as they were; `docs/Decisions.md` gives each decision's plain name with its old code.

## The deferred and skipped ledger (was §7)

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
      The owner when decided). [L965]
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
- [x] **Dead columns kept alive.** `metalFab` and the to-do fields `labels` / `checklist`
      (`todoToFields`) are unused schema, kept for the colleague app (`metalFab` still
      round-trips and is searchable). D2 lifted 2026-09-24, so dropping them is item 29, a
      deliberate Phase 8 cleanup. [L1040] Closed 2026-11-17: item 29 is done, and the
      columns are deleted.
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
- [x] **The name clean-up needs re-runs.** `scrubLegacyNames` fixes only names the
      current roster can resolve, so roster *additions* need the owner to re-run it from
      the console on `/preview/`. (Merges don't, since v1.15.0 rewrites names at merge
      time.) Gate: each staffing reconciliation; closes for good with D10 (v1.7.2).
      [L1148; v1.x item 29] Closed 2026-11-17: `scrubLegacyNames` retired in v1.55.0
      (item 28 (b)). Refs resolve names, and `backfillRefs()` links new ones.
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
- [x] **Merge matches exact names.** Abbreviations `canonName` can't resolve stay behind;
      run `scrubLegacyNames(true)` after merging. The real fix is D10 (v1.15.0). [L1263]
      Closed 2026-11-17: since v1.55.0 (item 28 (b)) the merge also moves every name linked
      to the duplicate by its ref, whatever its spelling.
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
- [x] **Docs out of date** (ARCHITECTURE: 5 lists vs 9; SETUP: 2 scopes vs 4; the
      `CLAUDE.md` line count; the tests/README suite count). Item 21, done 2026-10-15.
- [x] **Developer Bug Reports page buttons.** Once a report has a `ghIssue`, the tracker
      poller overrides its Mark resolved / Reopen buttons (GitHub is the source of truth
      for status, 2026-09-25). Done in v1.39.0 (tracker #29): a row with a ticket shows
      "Status follows the ticket" and the ticket link instead of the button; the
      `fbSetStatus` path stays for rows without a ticket. [item 31]
- [ ] **Two "Drafter" echoes stay after the v1.31.1 rename (tracker #17).** (1) Changelog
      rows read the stored key `drafter:`. *Done v1.44.1 (PR #118): a read-side map
      (`clogLbl`) shows it as "Technical Designer", and `jobCode` as "Cost code"; stored rows
      keep their keys.* (2) The "D" people chip (sidebar, project tooltip, Help legend swatch;
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
- [ ] **A role hand-over always takes effect today** (v1.42.0, tracker #34 Q1). There's no
      way to back-date a change ("Sam took over last Monday"). The Changelog keeps the real
      date. Gate: the shop asks to back-date changes; the upgrade is a date field beside
      the Project Team picker, passed to `roleHandover` in place of today. [item 53]
- [ ] **The import still falls back to Mobile Phone** (item 9b, deferred by the owner
      2026-10-08). A blank Primary Phone falls back to Phone, then Mobile Phone. Personal
      numbers are posted in the breakroom and are used on purpose, so this stays. Gate: HR
      or the owner rules that the roster must hold work numbers only; the fix is dropping
      `mobilephone` from `EC_MAP.phone` and reporting the row as "no work phone". [item 9]

- [ ] **`store.available(kind)` instead of the five `*_OK` flags** (2026-10-14, dropped
      from seam PR 8 with the owner's OK). It renames flags, changes nothing on screen, and
      would need four test files edited. Gate: D15 picks a non-SharePoint store (an
      `apiStore` would need it). [item 48]
- [ ] **The project page keeps its fixed 34 px rows** (item 74, deferred by the owner
      2026-10-19: "For now we won't be doing this"). View ▸ Row height still sets the
      timeline only. Gate: the owner picks item 74 back up; the spec in §3 stands as written.
      [item 74]
- [ ] **View settings stay per browser** (item 73, deferred by the owner 2026-10-19:
      quality-of-life work waits while the north star moves). Vivid months, Link subtasks,
      Group by, the lens and print paper/bars are still remembered by the browser only.
      Gate: the owner picks item 73 back up; the draft wording is on PR #175. [item 73]
- [ ] **The Clients app has no Help menu** (item 86, v1.58.0, 2026-11-18). Release notes,
      "Report a bug or idea" and the tour live in Timeline's Help menu; the Clients app shows
      none of them yet. Gate: the People app (item 87) makes a second app that needs them —
      then they move into the shell, once, for both. [item 86]
- [ ] **Toolbar menus don't announce open or closed, and focus rings are faint on the
      header** (code review of the shell, v1.57.0, 2026-11-18). Every toolbar menu button,
      Apps included, lacks `aria-expanded`, and the blue focus outline is 2.5:1 on the navy
      header (3:1 is the minimum). Both predate the shell. Gate: style §13 step 3 restyles
      the chrome's focus and menus (item 52). [item 52]

### 7.5 Deliberate design limits — no action planned; revisit only on real complaints

- No phone layout. The owner closed the request with "We're not doing this" on 2026-10-01
  (tracker #30).
- Time-off notes are hidden from non-admins on screen only (item 4, v1.44.0). The note
  still sits in the Staff list's `ooo` column and loads in every signed-in browser, so
  anyone who opens the list on SharePoint or the browser's developer tools can read it.
  Real privacy comes with item 27, which moves time-off notes into the restricted record.

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
- A background page repaint (poll, autosave) waits for the click only when a **crew name**
  is pressed (item 66, v1.51.1). A repaint that lands mid-press on any other control on the
  project page (a zoom button, a department checkbox) still drops that click in Chrome. It
  needs a poll to land inside a ~100 ms press, so it is rare. Gate: a report of a lost click
  elsewhere on the page; then widen the `CREW_PRESS` hold to any press inside `#page`.

## Batches and "what waits on what" (was part of §2)

**Batches.** A batch is a group of §3 items that ship together as one release; its version
number is given when it ships. Proposed:

| Batch | Contents (§3 items) |
|---|---|
| 1 — privacy and copy | 9a first (the import fetches only the fields it uses — the owner's "cache is cache" ruling), with 9c (one phone format) and the Office Extension column: shipped v1.43.0; 9b deferred (owner, 2026-10-08). Then 4 (time-off notes private) and 1–2 (terminology; one meaning for Lock dates, with copy that explains it). **Batch 1 is done** (2026-10-09): 4 shipped v1.44.0, 1 v1.44.1, 2 v1.45.0; 2 (c) moves with 25 in batch 2 |
| 2 | 25 (saved views follow the person ⚠ `savedViews`; Lock dates remembered per user), 7 (repeat work easier to find), 8 (label the department rollup band) |
| Seam (no release) | 48 (the storage seam), eight behaviour-neutral PRs interleaved after batch 1; PRs 1–2 first, since item 51's Azure spike waits on them |
| 3 | 5 (date certainty ⚠ `dateCertainty`), 6 (last update shown, stale flag) |
| The launch (owner, 2026-11-18; launches 1 and 2 of 2026-11-17 made one) | 49 (the Systems page), 85 (the shared `common/` module), 52 step 4 (the shell), 86 (the Clients app), 87 (the People app), the items from the owner's design and feature review, then 88 (rename the repository) just before the promotion. One promotion, when all three are complete |
| Office (Phase 8) | Office's own releases, in project-cycle order: 45 (job lead / forecast), 44 (estimate), 42 (cost-code generation), 43 (job creation with the QuickBooks / TCP hand-off) |
| Office (Phase 9) | 11 (closeout and billing states ⚠), the last step of the cycle; moved out of the pilot 2026-09-29 |
| As they resolve | 3 (tour loop: reproduce, then fix), 10 (automatic Complete vs closeout), 19–24 |
| Style track | 52 (style guide §13 steps), slotted between the batches above. Step 2 shipped as v1.24.0. Step 3 is next, one chrome surface per PR, project inspector first. The D4 reshape (item 49) shipped v1.56.0, so step 4 (the shell) can follow step 3 |
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
  - the reshape PR (item 49): shipped v1.56.0, 2026-11-17 (⚠ the owner adds the new
    redirect URIs before it merges; `SETUP.md` lists them);
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
  (§1). *Reordered 2026-11-17 (owner):* the Clients and People apps (items 86, 87) go
  first, while Office waits on D1 and item 14. Each step waits on the ones before it:
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

## Production releases, as listed in "Where we stand" until 2026-11-18

The newest work on production:
- v1.55.1: a long Changelog entry folds after its first four lines (item 84);
- v1.55.0: the name-matching helpers retire, and the People merge moves records by ID
  (item 28 (b));
- v1.54.1: a selected bar, milestones and holiday pills no longer slide over the project
  page's name column (item 83);
- v1.54.0: department phases stop storing the department's name as their crew (item 82);
- v1.53.0: a project's client is picked from a dropdown of the Clients list (item 81);
- v1.52.0: stable IDs, so a rename on People or Clients carries its projects, phases and
  to-dos (item 28 (a));
- v1.51.3: an expired Microsoft sign-in shows one in-page prompt instead of stacking login
  windows (item 76);
- v1.51.2: the app stops using the dead columns, so the owner can delete them (item 29's
  first step);
- v1.51.1: ticking crew names keeps your place, and no tick is lost (item 66);
- v1.51.0: a Today button on the project page (item 75);
- v1.50.0: milestones sit on their phase, chosen in the new Help ▸ My settings, and can be
  dragged up or down to change phase (item 32);
- v1.49.0: the tour's 6↔7 loop is fixed, and the tour has "Don't show again" (item 3).

The `/test/` trial site ran for item 32 and was retired (item 72). Making the repository
private is item 71.

Before that:
- v1.48.5: error messages say why (item 48, the storage seam's last PR), item 61's
  simplifications, item 59's work-based progress bar and item 19's "Away until" fix;
- saved views (item 25) and Protect dates (item 2 (c)) follow the person;
- repeat work is easier to find (item 7);
- projects show their last edit, a Stale flag and "Schedule still accurate" (item 6).

Earlier: reporter answers show in Open Issues (item 58); Protect dates (item 2: drags
never change dates).

Phase 7 has shipped v1.24.0 → v1.55.1 so far.
`CHANGELOG.md` is the release-by-release record.

## The legend (was the end of §8)

### Legend

- **⚠** — touches shared SharePoint schema or Entra (sign-in) configuration. Not a gate:
  The owner gets the exact spec and applies the list edit himself. Destructive changes get a
  milestone record (D2 lifted 2026-09-24). Entra changes need explicit instruction
  (`CLAUDE.md`).
- **Waits on** — the work can't start until the named item is done or the named decision
  is taken. An arrow (←) in the log means the same.
- **[brief §N]** — the Project Director's September 2026 brief, condensed and annotated by
  The owner (2026-09-22); section numbers match the original 21-page document.
- **[vision]** — the owner's 2026-09-24 statement of the portal direction, defined as
  Systems on 2026-09-29 (§1).
- **[tracker #N]** — an issue in the private tracker `221twoseven/Project-Scheduler-issues`
  (item 31).
- **[LNNNN]** — the line in `docs/Archive/TODO-v1.x-Archive.md` a carried ledger entry
  came from; **v1.x item N** — its §3 item number there. REV numbers and finding codes
  (T8, U6, B3b) are explained at the top of §7.
- **D1–D15** — §4 decisions; **item N** — §3 work items in this file.

## The opening of the old file

# To-Do / Backlog — Phase 7: pilot readiness, on the road to v2.0.0

**The single working to-do list for Project Scheduler (Timeline).** Started 2026-09-24,
when the v1.x backlog was retired to
[`docs/Archive/TODO-v1.x-Archive.md`](Archive/TODO-v1.x-Archive.md). Every entry still
open there was checked against the code before it was carried; the carried entries are in
§7 with their gates, the stale ones are closed in §7.0.

Two documents set this phase and are the source for most lines below:

- **The Project Director's brief** — *Shop Timeline App: Current Processes and Development
  Priorities* (September 2026), read here in the owner's condensed, annotated version,
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

Milestones and this plan are presented to the backup maintainer, the Project Director and the key users
as the phase runs.

**Standing rules:**

- ⚠ marks a SharePoint column/list or Entra change. **Not a gate** (owner, 2026-09-01):
  deliver the owner the exact spec (list, column, type, values) and he applies the list edit;
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

---
