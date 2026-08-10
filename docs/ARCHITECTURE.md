# Architecture

> **Who this is for:** this is a technical reference for developers. If you're a systems
> designer, manager, or shop staffer who just wants to read, review, or make edits, you
> don't need this document — start with the root `README.md` and `CONTRIBUTING.md`, which
> cover the browser-based workflow with no coding required. Read on only if you want to
> understand how the app works under the hood.

Timeline is a **single-file, client-only single-page app**. `index.html` contains all
HTML, CSS, and vanilla JavaScript (~5,900 lines) — no framework, no build step. The only
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
                              ├─ ShopTimeline_Staff
                              └─ ShopTimeline_Tasks2      (to-dos; optional)
```

## Authentication (index.html, "SHAREPOINT DATA LAYER" section)

- **MSAL browser**, delegated **PKCE**, single-tenant. No client secret (correct for a
  browser SPA).
- Config lives in a handful of constants: `CLIENT_ID`, `TENANT_ID`, authority
  `https://login.microsoftonline.com/<tenant>`, `redirectUri` computed from the current
  URL (hash/query stripped), scopes `['User.Read','Sites.ReadWrite.All']`.
- Flow: `spInit()` → `loginPopup` (or a cached account); `spToken()` →
  `acquireTokenSilent`, falling back to `acquireTokenPopup`. Token cache is
  `sessionStorage`.
- Every Graph call goes through `gfetch()`, which attaches `Authorization: Bearer <token>`
  and throws on a non-2xx response.

> These values are tied to an external Entra app registration and are **shared** with a
> colleague app. Do not change client/tenant IDs, scopes, redirect URIs, or the auth flow
> without explicit instruction (see `CLAUDE.md`).

## Data layer

- `spSite()` resolves the SharePoint site id once (`GET /sites/{host}:{path}`). Lists are
  then addressed by **name** under that site id — no List GUIDs are stored.
- `spLoad()` reads Projects and Tasks (`?expand=fields&$top=2000`) in parallel, then
  Tasks2 (to-dos) inside a try/catch. `spLoadStaff()` reads Staff separately so a missing
  Staff List doesn't block the schedule.
- **Field mappers are the ground truth** for what the app reads and writes:
  `projToFields`/`fieldsToProj`, `taskToFields`/`fieldsToTask`,
  `personToFields`/`fieldsToPerson`, `todoToFields`/`fieldsToTodo`.
- `updatedBy`/`updatedAt` come from Graph's built-in `lastModifiedBy` /
  `lastModifiedDateTime` — no custom columns.

### Reads / writes

- **Reads (GET):** on startup and again on every 45-second poll (`setInterval` in the
  init block). The poll is skipped while dragging, while a sync is pending, while an
  overlay is open, or while a field inside `#page` has focus — so it never clobbers an
  in-progress edit.
- **Writes:** `spSync(old, new)` diffs old vs new state per record and issues
  `POST /items` (create), `PATCH /items/{id}/fields` (update), or `DELETE /items/{id}`
  (delete). `spSyncStaff` does the same for the roster. Writes are **optimistic**: the UI
  updates immediately, a status pill shows saving/synced/failed, there's one automatic
  retry, and every mutating action offers a visible **Undo** toast.

### Graceful degradation

- `ShopTimeline_Tasks2` (to-dos) and `ShopTimeline_Staff` are optional. If absent, the app
  warns once and keeps that data local to the browser; when the List appears, persistence
  resumes with no code change. `TODOS_OK` / `STAFF_OK` track this at runtime.

## Data model and vocabulary

| In code | List | Meaning |
|---|---|---|
| `ST.projects` | `ShopTimeline_Projects` | Projects (jobs) |
| `ST.tasks` | `ShopTimeline_Tasks` | **Phases** — the Gantt bars |
| `ST.todos` | `ShopTimeline_Tasks2` | **Tasks** — Planner-style to-dos |
| `PEOPLE` / `STAFF` | `ShopTimeline_Staff` | Roster |

- **Vocabulary trap:** a "task" in `ShopTimeline_Tasks` is a Gantt *bar* (a phase); a
  "task" in the UI is a *to-do*. Events are dated markers stored as `ticketNodes` on a
  phase.
- **Departments (8 groups):** Project Management, Technical Design, Digital Fabrication,
  Main Shop Fab, Metal Shop, Unit 7 (Soft Goods / Vinyl / Electrical / Other), Finishing,
  Installation.
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
  new one. Each project has a paste-able URL.
- **Project page** is the dashboard: a meta strip of numbers, then chart and inspector
  side by side. Selection drives the inspector (nothing selected → project; a bar
  selected → that phase). No tabs, no bar popover. Saved projects autosave; only new ones
  have a Create button. Escape unwinds one layer at a time.
- **Right-click is the primary verb** — bars, summaries, gutters, and empty canvas each
  have their own menu with keyboard shortcuts shown.
- **Undo is visible** on every mutating action (`toastU`).

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

See `docs/Timeline-Handoff.md` for the original developer's full handoff, traps, version
history (REV34–REV50), and open items.

## Hosting

GitHub Pages serves the static `index.html` from `main`. `no-cache` meta tags force fresh
loads. There is **no Teams-specific code** in the app — it is a standalone web app (it can
be linked from Teams, but nothing in the code depends on Teams).
