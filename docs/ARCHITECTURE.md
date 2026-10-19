# Architecture

> **Who this is for:** this is a technical reference for developers. If you're a systems
> designer, manager, or shop staffer who just wants to read, review, or make edits, you
> don't need this document — start with the root `README.md` and `CONTRIBUTING.md`, which
> cover the browser-based workflow with no coding required. Read on only if you want to
> understand how the app works under the hood.

> **Where it sits:** Timeline is one product of **Systems** (owner, 2026-09-29) — peer
> products (People, Clients, Office, Timeline) over one shared SharePoint dataset, behind
> a portal at `/`. Timeline owns production data only and reads people and clients from
> their own products. Only Timeline exists today. Definition and rulings: `docs/TODO.md`
> §1 and §4 D4/D8. The future data platform (SharePoint, Dataverse, or Azure SQL behind
> an API) is open as D15, analysed in `docs/Architecture-Review-Backend.md`. This page
> describes what runs today and changes only when something else is built.

Timeline is a **single-file, client-only single-page app**. `index.html` contains all
HTML, CSS, and vanilla JavaScript (thousands of lines, one file) — no framework, no
build step. The only
runtime dependency is `msal-browser.min.js`, vendored beside it. There is no server we
own; the backend is SharePoint, reached through Microsoft Graph.

```
Browser (index.html + msal-browser.min.js on GitHub Pages)
   │  MSAL sign-in (Entra, delegated PKCE)
   │  Bearer token
   ▼
Microsoft Graph  v1.0  ──►  SharePoint site  /sites/TWOSEVENINC
                              ├─ ShopTimeline_Projects
                              ├─ ShopTimeline_Tasks      (Gantt phases)
                              ├─ ShopTimeline_Tasks2     (to-dos; optional)
                              ├─ ShopTimeline_Events     (standalone events; optional)
                              ├─ ShopTimeline_Staff      (roster; optional)
                              ├─ ShopTimeline_Clients    (client names + cost-code alias)
                              ├─ ShopTimeline_Config     (app-wide settings, key/value)
                              ├─ ShopTimeline_Changelog  (one row per changed record)
                              ├─ ShopTimeline_Feedback   (bug reports and ideas)
                              └─ Employee Contacts       (HR's list; read-only, import only)
```

## Authentication (index.html, "SHAREPOINT DATA LAYER" section)

- **MSAL browser**, delegated **PKCE**, single-tenant. No client secret (correct for a
  browser SPA).
- Config lives in a handful of constants: `CLIENT_ID`, `TENANT_ID`, authority
  `https://login.microsoftonline.com/<tenant>`, `redirectUri` computed from the current
  URL (hash/query stripped), scopes `['User.Read','Sites.ReadWrite.All']`. Two
  side-scopes ride their own `acquireTokenSilent` requests so missing consent degrades
  instead of blocking sign-in: `TeamMember.Read.All` (staff-picker suggestions) and
  `Mail.Send` (v1.8.0 feedback mail).
- Flow: `store.signIn()` (`spInit`) → `loginPopup` (or a cached account); `spToken()` →
  `acquireTokenSilent`, falling back to `acquireTokenPopup`. Token cache is
  `sessionStorage`. `store.who()` is the one reader of the signed-in account.
- Every Graph call goes through `gfetch()`, which attaches `Authorization: Bearer <token>`,
  waits out one 429/503 `Retry-After`, and throws on a non-2xx response. `gpageAll()`
  follows `@odata.nextLink`. A third argument (`scopes`) asks for a side-scope on its own
  silent token — never a popup, so a missing consent just fails that one feature.

> These values are tied to the company's Entra app registration. Do not change
> client/tenant IDs, scopes, redirect URIs, or the auth flow without explicit instruction
> (see `CLAUDE.md`).

## Data layer

- **The `store` object** (item 48, the storage seam) owns every conversation with the
  lists: `store.list(kind)`, `columns`, `create`, `update`, `remove`, plus `signIn`,
  `who` and `explain`. `STORE_LISTS` maps each kind (`proj`, `task`, `todo`, `event`,
  `staff`, `client`, `config`, `changelog`, `feedback`, `employeeContacts`) to its list
  name; every list reads in pages of `STORE_PAGE` (item 68). Nothing outside `store`
  builds a list URL.
- `spSite()` resolves the SharePoint site id once (`GET /sites/{host}:{path}`). Lists are
  then addressed by **name** under that site id — no List GUIDs are stored.
- `spLoad()` reads Projects and Tasks in parallel, then Tasks2 (to-dos) and Events each
  inside a try/catch. Staff, Clients and Config load separately, so a missing one never
  blocks the schedule. Changelog and Feedback load when their page opens.
- **Field mappers are the ground truth** for what the app reads and writes:
  `projToFields`/`fieldsToProj`, `taskToFields`/`fieldsToTask`,
  `personToFields`/`fieldsToPerson` (columns listed in `PERSON_COLS`),
  `todoToFields`/`fieldsToTodo`, `eventToFields`/`fieldsToEvent`. The smaller lists map
  inline where they load: `loadClients` (`Title`, `field_2` = cost-code alias),
  `readConfig` (`Title` = key, `value`), `renderChangelog`, `fbFetch`.
- **Employee Contacts** is HR's list: read-only, never written, never schema-touched. The
  People page's import copies its non-sensitive columns into Staff; the HR-sensitive
  ones are never even requested.
- `updatedBy`/`updatedAt` come from Graph's built-in `lastModifiedBy` /
  `lastModifiedDateTime` — no custom columns.
- **Errors read one way:** `store.explain(err)` turns any SharePoint failure into
  "<what failed>: <why> <next step>"; the raw error sits under the toast's Details.

### Reads / writes

- **Reads (GET):** on startup and again on every 90-second poll (`POLL_MS`, in the init
  block). The poll skips a hidden tab and anything `updBusy()` reports (a drag, a save in
  flight, an open overlay, editor or menu, a record mid-edit, a cursor in a field), and
  re-checks after the fetch returns (REV90) — so it never clobbers an in-progress edit.
- **Writes:** `spSync(old, new)` diffs old vs new state per record and issues
  `POST /items` (create), `PATCH /items/{id}/fields` (update), or `DELETE /items/{id}`
  (delete). `spSyncStaff` does the same for the roster. Writes are **optimistic**: the UI
  updates immediately, a status pill shows saving/synced/failed, there's one automatic
  retry, and every mutating action offers a visible **Undo** toast.

### Graceful degradation

- `ShopTimeline_Tasks2` (to-dos), `ShopTimeline_Staff`, `ShopTimeline_Clients` and
  `ShopTimeline_Config` are optional. If one is absent, the app keeps that data local to
  the browser; when the List appears, persistence resumes with no code change.
  `TODOS_OK` / `STAFF_OK` / `CLIENTS_OK` / `CFG_OK` track this at runtime.
- `ShopTimeline_Events` is optional the same way (`EVENTS_OK`), with a different fallback:
  without it, an event saves the legacy way — as a `ticketNodes` entry on a host phase —
  so nothing is ever browser-local.

## Data model and vocabulary

| In code | List | Meaning |
|---|---|---|
| `ST.projects` | `ShopTimeline_Projects` | Projects (jobs) |
| `ST.tasks` | `ShopTimeline_Tasks` | **Phases** — the Gantt bars |
| `ST.todos` | `ShopTimeline_Tasks2` | **Tasks** — Planner-style to-dos |
| `ST.events` | `ShopTimeline_Events` | **Events** — dated diamond markers |
| `PEOPLE` / `STAFF` | `ShopTimeline_Staff` | Roster |
| `CLIENTS` | `ShopTimeline_Clients` | Client names; `field_2` is the cost-code alias |
| `CFG` / `CFG_RAW` | `ShopTimeline_Config` | App-wide settings (`Title` = key, `value`) |
| — | `ShopTimeline_Changelog` | Who changed what, one row per changed record per save |
| — | `ShopTimeline_Feedback` | Bug reports and ideas; a tracker poller files each as a GitHub issue (`docs/Automations.md`) |

- **Vocabulary trap:** a "task" in `ShopTimeline_Tasks` is a Gantt *bar* (a phase); a
  "task" in the UI is a *to-do*. Events are rows in `ShopTimeline_Events` (REV54);
  older events may still live as `ticketNodes` on a phase — both stores render, and a
  phase deletion moves its hosted events into the Events list rather than losing them.
- **Departments** (`DEPTS`, grouped by `GROUPS`): Project Management, Technical Design,
  Digital Fabrication, Main Shop Fab, Metal Shop, Unit 7 (Soft Goods / Vinyl / Electrical
  / Other), Finishing, Installation / Shipping (a job ends with one or both, v1.20.6),
  Logistics (v1.10.0). `othoffice` ("Other (Office)") is retired (v1.20.1): old rows
  still render, but no picker offers it.
- **Statuses:** `forecast, estimating, in-design, in-fabrication, on-hold, complete`.
  Retired statuses fold in on load via `STATUS_MIGRATE`; `projectStatus()` also maps on
  read, so a stale value still renders.

## App structure and behaviour

Rough top-to-bottom order in the file: constants and state → SharePoint layer →
scheduler → row building → Gantt render → sidebar → project page → modals → keyboard →
init.

- **Scheduler.** `generateSchedule()` runs backward from the install date through a phase
  chain, skipping weekends and holidays. It is **pure** — takes a draft project, returns
  tasks, touches no state — which is what makes the live create-page preview possible.
- **Routing** is hash-based: `#/` timeline, `#/project/<id>` a project, `#/project/new` a
  new one. Each project has a paste-able URL. The Company Data pages share one chrome
  (`cd-route`): `#/people`, `#/clients`, `#/changelog`, `#/releases`, `#/issues`
  (`#/issues/<spId>` deep-links one report); `#/settings` and `#/reports` are
  developer-only. `#view=` opens a saved view.
- **Project page** is the dashboard: a meta strip of numbers, then chart and inspector
  side by side. Selection drives the inspector (nothing selected → project; a bar
  selected → that phase). No tabs, no bar popover. Saved projects autosave; only new ones
  have a Create button. Escape unwinds one layer at a time.
- **Right-click is the primary verb** — bars, summaries, gutters, and empty canvas each
  have their own menu with keyboard shortcuts shown.
- **Undo is visible** on every mutating action (`toastU`).

## Formulas and rollups

- **Workdays.** `isWorking(d)`: Monday–Friday, minus the coded US holidays
  (`holidaysFor`: New Year's Day, Memorial Day, Independence Day, Labor Day,
  Thanksgiving, Christmas — a weekend holiday is observed on the Friday or Monday). No
  company shutdowns or per-person time off enter the scheduler.
- **`generateSchedule(p, est)`** works backward from the install date (`p.deadline`)
  through `SCHED_PHASES`: Installation / Shipping → Finishing → (Main Shop Fab, Metal
  Shop, Unit 7 together) → Digital Fabrication → Technical Design. Departments in one
  phase share an end date and run in parallel; each bar is `est` workdays long, ending on
  that date (`backN`). The next phase ends on the last workday before the earliest start.
  Project Management spans from the earliest bar to the deadline. Checking a department
  on later uses `scheduleNewDepts`, which anchors to bars already placed instead of
  moving them.
- **`estimatedDays`** is a bar's length in workdays. It starts at the department default
  (`DEPTS[].est`) or the value typed on the create page, and is rewritten when a bar is
  dragged, resized or split (`wdCount(start, end)`).
- **Meeting Sheet %** (v1.48.4): work done, not time passed — the workdays of every bar
  before today over the workdays of all the project's bars, so a gap between bars never
  fills it.
- **Lead time** (project footer): workdays from the earliest bar's start to the
  deadline, inclusive (`wdCount`). **Kickoff** is that earliest start.

## Recurring seams (where bugs have clustered)

- **Draft vs live.** `#/project/new` draws scheduler output; nothing is in `ST` until
  Create. A saved project draws `ST`. Every surface — clicks, menus, agenda, keyboard,
  markers — must branch on `NPV_LIVE`. Test both.
- **Two task arrays.** `NPV_ALL` is everything the scheduler produced; `NPV_TASKS` is
  what's drawn (Project Management is saved but not drawn). Create must file `NPV_ALL`.
- **JS constants mirroring CSS** (`NPV_GUT`, `NPV_ROWH` vs `.npv-gut` / `.npv-row`) drift;
  a test reads both and fails on divergence.
- **`render()` on the project page re-enters `renderProjectPage()`**, which resets an
  unsaved draft — guard any `render()` call made while that page is open.
- **`JSON.stringify` state comparisons** break when key sets differ; the poll once
  compared a three-key object to a two-key one and clobbered state every tick.

See [Handoff-Notes.md](../reference/Handoff-Notes.md) for the consolidated handoff — setup rationale,
conventions, traps, and version history (REV34–REV50).

## Hosting

A GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) publishes `main` at `/`
and `development` at `/preview/` on every push to either. GitHub Pages serves the static
`index.html` with `Cache-Control: max-age=600`
(the page's `no-cache` meta tags don't override that header), so a fresh visit picks up a
new build within ten minutes and a plain reload at once. An open tab finds out by itself
(v1.33.0): every 12 h and when the tab comes back into view it re-fetches its own
`index.html` with `cache:'no-store'`, compares the `APP_VER` inside and offers Reload; the
`ShopTimeline_Config` key `update.minVersion` (Help ▸ App settings ▸ "Ask everyone to
reload") retires older builds, which reload on their own once nothing is mid-edit. There is **no Teams-specific code** in the app — it is a standalone web app (it can
be linked from Teams, but nothing in the code depends on Teams).
