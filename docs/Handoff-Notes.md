# Timeline (Shop Dashboard) — Handoff Notes

> **Consolidated handoff, lightly trimmed.** This merges the original developer's
> plain-English handoff (converted from the original PDF) with the detailed developer
> notes. It explains *what* the app is and *why* it's built and hosted the way it is.
>
> Some specifics in the original (live URL, GitHub account, repo, "current build") described
> the earlier personal-account setup and **have since moved**. For current live values —
> URL, redirect URI, client/tenant IDs, auth config — always use **[SETUP.md](SETUP.md)**.
> For the current ship/branch workflow, see **[../CONTRIBUTING.md](../CONTRIBUTING.md)**.
> Actionable open items and operational-security follow-ups live in **[TODO.md](TODO.md)**.
> For the current architecture from a fresh inspection, see **[ARCHITECTURE.md](ARCHITECTURE.md)**.
>
> The live app is `index.html` (REV50); `reference/Timeline_50.html` is the frozen REV50
> baseline it began as.

---

## 1. What this thing actually is

A Gantt-style production scheduling tool for the shop. Three facts explain the whole
architecture:

1. **It is one HTML file.** No server, no build step, no framework. All the code — layout,
   styling, logic — lives in a single `index.html`. You edit that file, you deploy that
   file, you're done.
2. **GitHub Pages serves it.** GitHub hosts the file at a public web address for free.
3. **SharePoint stores the data.** Projects, tasks, and staff live in SharePoint lists;
   the app reads and writes them through Microsoft Graph.

Staff open it in a browser (originally pinned as a tab in Microsoft Teams). They sign in
with their normal Microsoft account — no new passwords.

## 2. The IDs are public by design

The Application (client) ID and Directory (tenant) ID sit in plain sight in the HTML.
**They are not secrets** — they're meant to be public. There is no client secret and no API
key anywhere in this project, by design: the security comes from Microsoft login, not from
hiding a string. (Current values: see [SETUP.md](SETUP.md).)

## 3. How the login plumbing works (plain English)

The chain is four links long:

1. A user opens the page. A Microsoft library called **MSAL** pops up a Microsoft sign-in
   window.
2. Microsoft checks the user against Twoseven's Entra directory and checks that our app is
   allowed to ask.
3. Microsoft hands back a temporary **access token** — a signed permission slip, good for
   about an hour.
4. The app attaches that token to every request it makes to SharePoint. SharePoint sees a
   valid token and answers.

The app can only do what the token permits. We asked for exactly two permissions
(`User.Read` and `Sites.ReadWrite.All`) and nothing more.

## 4. Why the Entra setup is the way it is

Rationale kept for context; current config lives in [SETUP.md](SETUP.md):

- **Single tenant ("My organization only").** Internal staff only, no outside accounts.
- **Delegated permissions**, not application permissions. "Delegated" is the important
  word — the app acts as the signed-in person, with *their* access, never as an
  all-powerful service account.
- **`Sites.ReadWrite.All` requires one-time admin consent** for the whole company (an Entra
  tenant admin action). *If the app ever stops authenticating for everyone at once, suspect
  this first.*
- **Redirect URI registered as Single-page application (SPA), not "Web."** SPA uses the
  modern auth-code-with-PKCE flow, which is why no client secret exists. The "Access
  tokens" / "ID tokens" implicit-flow checkboxes are deliberately left unchecked — they're
  a legacy flow, trigger security warnings, and buy nothing.

## 5. Data model & SharePoint conventions

Four SharePoint lists:

| List | Holds | Status |
|---|---|---|
| `ShopTimeline_Projects` | Projects | live |
| `ShopTimeline_Tasks` | Phases — the Gantt bars | live, `label` column present |
| `ShopTimeline_Staff` | Roster | live |
| `ShopTimeline_Tasks2` | Tasks — Planner-style to-dos | optional (may not exist yet) |

Schema status:

- **`label` on `ShopTimeline_Tasks` EXISTS** and has for a while. Verified by
  `test-label.js`, which asserts the outgoing PATCH body actually carries the name. Subtask
  names persist. **Do not re-flag this as missing.**
- **`ShopTimeline_Tasks2` — confirm before treating it as a gap** (check Site Contents, or
  add a task and reload). If absent, the app degrades gracefully, warns once on save, and
  needs no code change when it appears; if present, `TODOS_OK` flips true on its own and
  tasks start persisting.

**Lesson: check the round-trip in code before reporting a schema gap.** The mapping
functions `taskToFields` / `fieldsToTask` (and the `*ToFields` / `fieldsTo*` pairs) are the
ground truth for what the app reads and writes.

Conventions locked in early — keep them:

- **Column names contain no spaces** (`jobCode`, not `Job Code`). SharePoint mangles spaces
  into `_x0020_` in the internal name, which breaks the API calls.
- **Arrays are stored as JSON text.** SharePoint columns are flat, so `activeDepartments`,
  `ticketNodes`, etc. are packed into a text column as JSON and unpacked by the code.
- **Every list has an `appId` column.** SharePoint assigns its own row IDs, but the app has
  its own IDs and links records by them; `appId` preserves those links.
- **The `ShopTimeline_` prefix** keeps our data separate from the site's pre-existing
  company lists. Do not touch or reuse those.

In code the entities are `ST.projects`, `ST.tasks` (phases), `ST.todos` (tasks), and
`PEOPLE` / `STAFF`.

**Vocabulary trap:** a "task" in `ShopTimeline_Tasks` is a Gantt *bar* (a phase); a "task"
in the UI is a *to-do*. Phases are bars; tasks are to-dos; events are dated markers stored
as `ticketNodes` on a phase.

### Departments and groups

8 groups: Project Management, Technical Design, Digital Fabrication, Main Shop Fab, Metal
Shop, **Unit 7**, Finishing, Installation.

Unit 7 holds Soft Goods, Vinyl Application, Electrical, Other (Unit 7). It runs parallel to
Main Shop Fab and Metal Shop in the scheduler chain. Soft Goods and Electrical kept their
original ids when they moved into it, so existing rows carried over.

### Statuses

`forecast, estimating, in-design, in-fabrication, on-hold, complete`

Retired statuses fold in on load via `STATUS_MIGRATE`: approved / in-production / installing
→ in-fabrication; invoiced / called-off → complete. `projectStatus()` maps on read too, so a
stale value from an unrefreshed browser still renders. Forecast renders grey.

## 6. Architecture

One file, no build step. Roughly: constants and state → SharePoint layer → scheduler → row
building → Gantt render → sidebar → project page → modals → keyboard → init.

- **Scheduler.** `generateSchedule()` runs backward from the install date through a phase
  chain, skipping weekends and holidays. It is **pure** — takes a draft project, returns
  tasks, touches no state — which is what makes the live create-page preview possible.
- **Routing** is hash-based: `#/` timeline, `#/project/<id>` a project, `#/project/new` a
  new one. Each project has its own paste-able URL.
- **The project page** is the dashboard (rebuilt in REV49): a meta strip of numbers, then
  chart and inspector side by side, full height. **Selection drives the inspector** —
  nothing selected shows the project (Setup / Team / Departments / Agenda as folding
  sections); a bar selected shows that phase. No tabs, no bar popover. Existing projects
  autosave; only new ones have a Create button. Escape unwinds one layer at a time.
- **Right-click is the primary verb.** Bar, summary bar, row gutter, empty canvas, and empty
  space below the rows each have their own menu, each item showing its keyboard shortcut.
- **Undo is visible.** Every mutating action toasts with an Undo button (`toastU`).
- **Draft vs live is the recurring seam.** `#/project/new` draws scheduler output; nothing
  is in `ST` until Create. A saved project draws `ST`. Every surface — click, menus, agenda,
  keyboard, markers — must branch on `NPV_LIVE`. Test both, always.
- **Two task arrays.** `NPV_ALL` is everything the scheduler produced; `NPV_TASKS` is what
  gets drawn. Project Management is in the first, not the second (saved but never drawn).
  Create must file `NPV_ALL`, not `NPV_TASKS`.
- **Draft state.** While creating, `PP_FORM` holds every field and `ppProject()` returns it.
  Only one tab is mounted at a time, so anything reading the DOM for a field on another tab
  gets null.

## 7. Hosting — the detour worth knowing about

Hosting the file directly on SharePoint was tried first and **failed**: on a modern
Teams-connected site, SharePoint insisted on downloading the HTML rather than displaying it,
even with Custom Scripts enabled. That's platform behavior, not a fixable bug — don't spend a
day re-litigating it. **GitHub Pages was the fix and has worked reliably since.**

`msal-browser.min.js` — the Microsoft login library — is stored locally next to `index.html`
rather than loaded from a CDN. **It must never be deleted from the repo;** remove it and
login dies instantly.

## 8. Shipping an update

The original process was a manual file upload straight to `main`. **That has been
superseded** — the current workflow (work on `development`, Pull Request into a protected
`main`, CI must pass) is in [../CONTRIBUTING.md](../CONTRIBUTING.md). Two durable facts still
hold:

- GitHub keeps every previous version, so **rollback is a couple of clicks.**
- A deploy needs **no Entra changes** — swapping the file never touches the auth panel. Only
  a change of *hosting address* would (then the redirect URI must be re-registered — see
  [SETUP.md](SETUP.md)).

## 9. Traps that have already cost time

- **The redirect-URI bug.** Using `window.location.origin` for `redirectUri` makes the
  browser download a file after login instead of returning to the app. The correct form,
  already in the code, is `window.location.href.split('#')[0].split('?')[0]`. If post-login
  downloads reappear, look here first.
- **Stale versions after deploy.** If an old REV shows after a successful deploy, open the
  raw Pages URL in a private window and check the REV in the top-left. Old REV there too →
  the deploy didn't land (wrong branch, or the file didn't overwrite `index.html` at root).
  New REV there but old in an embedded tab → webview cache; remove and re-add the tab.
- **Verify schema in the code before declaring a column missing.** The `label` column was
  repeatedly reported as missing when it had existed the whole time. Search the HTML for the
  field name first.
- **Test both pages, always.** The new-project draft (`#/project/new`) and the saved-project
  page behave differently; a fix that works on one frequently doesn't work on the other.
- **Splicing between two anchors swallows what's in between.** Replacing a region from
  function A to function B has twice removed unrelated helpers living between them. Prefer
  narrow anchors.
- **Version-bump `sed` across test files is dangerous.** The pattern `=== 40` also rewrote
  `=== 406` into `=== 416` inside unrelated assertions. Bump only the specific lines.
- **JS constants that mirror CSS values drift.** `NPV_GUT` / `NPV_ROWH` must match `.npv-gut`
  width and `.npv-row` height; a test now reads both and fails if they diverge.
- **`ev.target` isn't always an element.** Programmatic events target the document, which has
  no `.matches()` / `.closest()`.
- **`grid-row: 1 / -1` collapses when rows are implicit.** `-1` counts from the end of the
  *explicit* grid; calendar columns silently shrank to one row.
- **`render()` on the project page re-enters `renderProjectPage`**, which resets an unsaved
  draft. Guard any `render()` call made while that page is open.
- **Writers and readers can drift apart silently.** Add buttons wrote to `NPV_EVENTS` /
  `NPV_TODOS` while the saved-project path read `ST`; nothing errored, the row just vanished.
- **`JSON.stringify` comparisons break when key sets differ.** The poll compared a three-key
  object against a two-key one, never matched, and clobbered state every 45 seconds.
- **Row index is not task index once rows can nest.** Markers, the reorder drop indicator,
  and hit-testing read `NPV_PLAN` now.
- **A stale handoff doc is worse than no handoff doc.** Anything in this file asserting a
  state of the world *outside the code* should be re-verified, not quoted.

## 10. When you need the IT / SharePoint admin

An Entra/tenant admin (the IT/SharePoint admin) is required for:

- Any new SharePoint column or list
- Anything tenant-level in Entra (admin consent, role grants)
- The GitHub org transfer

Everything else — code, deploys, UI — needs no one.

## 11. Development workflow & conventions

The app carries a regression suite — **276 assertions across 6 jsdom suites** — run before
every release (see [../tests/README.md](../tests/README.md)). The suites stub MSAL and
`fetch` and record every Graph call on `window.__spCalls`, so persistence is asserted on the
actual outgoing request body rather than assumed. They assert **behaviour, not
implementation**, and are updated deliberately when behaviour changes on purpose.

Standing conventions in the code:

- Subtasks move with their department bar by default; a **Link** toggle disables it.
- **Right-click is the primary creation verb** throughout the chart.
- Events render as **yellow diamonds with black outlines**.
- Every created item gets a **default date**.
- Every mutating action shows an **Undo** button in its toast.
- `APP_REV` is bumped in one place and appears everywhere the version shows.

Historically, patches to this large file were made with Python string-replacement scripts
guarded by `assert s.count(anchor) == 1`, so an ambiguous anchor fails loudly instead of
patching the wrong function; output was syntax-checked with Node before shipping.

## 12. Version history (REV34–REV50)

| Rev | What landed |
|---|---|
| 35 | Project page replacing the modal; hash routing; inline phase editing |
| 36 | Project labels park at the today line |
| 37 | Split create page with a live draggable schedule preview |
| 38 | Row order fixed top-to-bottom; departments reorderable and the order saved |
| 39 | Clear all; opens collapsed; today at left; events and tasks; calendar mode; drag headroom |
| 40 | Label parking extended to phase bars and the Departments lens; diamond dodging |
| 41 | Five statuses; Unit 7; `label` column and named phases; calendar in the in-house format; legends |
| 42 | Configurator rebuild — tabs, full-width chart, autosave, bar popover, Esc |
| 43 | Forecast status; PM out of the charts; tint toggle; square calendar cells |
| 44 | Sort group headers by client, PM, status |
| 45 | Calendar column collapse fixed; tint no longer wipes drafts |
| 46 | Four bug fixes: project-page drags commit instead of snapping back; events/tasks on a saved project write through to `ST`; tint painted on the project-page Gantt; the 45s poll no longer replaces state every tick. `redirectUri` restored to the full-path form |
| 47 | Subtasks. A department with more than one bar draws a parent summary row with a disclosure triangle and count; the summary spans earliest start to latest end; dragging it shifts every subtask by the same days in one save; Link toggle turns that off. Subtasks sort by start date |
| 48 | Subtask/summary bars back to full row height; right-/left-click create menu on the Gantt canvas seeded with the clicked date and department; right-click a bar to edit; add a department from the menu; events carry their own department; chart listeners bound once |
| 49 | The dashboard. Tabs and bar popover retired for a selection-driven inspector beside the chart; meta strip; right-click menus on bars/summaries/gutters; visible Undo on every mutating action; keyboard (S/E/T/R/G/C/?/arrows/shift-arrows/Del); inline rename in the agenda; one agenda replacing two disagreeing lists |
| 50 | REV49's field reports, all reproduced and fixed. Hotkeys: touching the canvas releases input focus. Events: always created dated, yellow diamond with black outline, name chip beside it, draggable, click to rename in place. Draft mode: subtasks split the bar immediately, clicking a draft bar opens the legacy popover, agenda edit/delete work on drafts. Departments panel rebuilt compact for the 330px pane. Menus cap height/width and scroll |

---

**Open items** (calendar create-menu/parity, standalone events, dependencies, the Dash view,
`ShopTimeline_Tasks2`, staff `email`/`role` columns, 2FA, org transfer, and the rest) are
tracked and kept current in **[TODO.md](TODO.md)** — not duplicated here, so there's one
source of truth.
