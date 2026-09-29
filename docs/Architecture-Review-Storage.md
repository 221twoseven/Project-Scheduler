# Architecture review — storage, schema, permissions

**Date:** 2026-09-29 · **Build reviewed:** `development` at `8ef2e52` (v1.24.0, `index.html`
10,627 lines) · **Scope:** read-only; no code, test, workflow or existing doc was changed;
no call was made to SharePoint or Graph. The one outside read was the private tracker
repository (`gh api`, read-only) to confirm how the bot runs.

**Secrets check (Step 0):** no client secret, certificate or token is committed. The repo and
its full history were searched for `client_secret`, `GRAPH_CLIENT_SECRET`, `thumbprint`,
`certificate`; the only hits are the string inside the vendored `msal-browser.min.js`
(commit `fdd213e`) and the *name* of the Actions secret in the 2026-09-25 milestone record.
`.gitignore:5-11` blocks secret files. Nothing to flag.

## Summary

The single highest-leverage change is **the storage seam (idea 1)**, and it should go first.
Ninety percent of the plumbing already exists — every SharePoint call funnels through
`gfetch` / `gpageAll` / `listUrl` (`index.html:2198-2225`) and the field mappers already
separate app shapes from column shapes — so a thin `store` object can be introduced with no
callers in one PR, then one list moved per PR with `npm test` proving neutrality (the
harness records at the `fetch` layer, so no assertion changes). Every later idea gets
cheaper once it exists: provisioning reads its column spec from the same table, the suite's
shared `common.js` (D4b) *is* the seam plus the mappers, and a local-only mode becomes a
second adapter instead of ~37 branched call sites. The permission churn (idea 3) turns out
not to be a setup problem — three Entra changes in six weeks, each for a genuinely new
resource type, none for a list — so there is nothing to "fix first"; the only permission
move worth making is swapping `Sites.ReadWrite.All` for a site-scoped grant, and it should
ride the one shared suite registration (idea 4) so it is done once.

## Inputs (Step 0)

| Item | Where the repo records it | Found? |
| --- | --- | --- |
| SPA registration: client/tenant IDs, delegated scopes, admin consent | `CLAUDE.md:75-82`; `docs/SETUP.md:19-66`; `docs/ARCHITECTURE.md:30-38`; `index.html:2139-2140, 2176` | Yes. `SETUP.md` lists 2 of the 4 scopes (TODO item 21 already tracks the drift). |
| Bot registration ("ShopTimeline Feedback Bot"): permission, type, consent, site and role | `docs/TODO.md:389-393` (item 31); `docs/Milestones/Phase-7-Pilot-Readiness/2026-09-25-feedback-github-bridge.md:15-17, 43-46`; tracker `README.md` steps 1-4 | Yes: Application `Sites.Selected`, admin-consented 2026-09-25, `write` on TWOSEVENINC only. **The bot's client ID is not recorded anywhere in this repo** (only in the tracker's Actions secret `GRAPH_CLIENT_ID`). |
| Bot auth method and expiry | milestone above `:57-58`; tracker `README.md` step 2 | Method: client secret (24-month lifetime, created on or before 2026-09-25). **Exact expiry date missing** — not in this repo or the tracker README; the run will fail with `token: 401` on that day. |
| SharePoint site URL(s) | `CLAUDE.md:68`; `docs/SETUP.md:70`; `index.html:2141-2142` | Yes — one site. |
| List / column inventory | names: `CLAUDE.md:69-74`, `index.html:2143-2175`; columns: the mappers `index.html:2256-2340` and the constants' comments `2154-2170`; `docs/SETUP.md:71-79` (5 lists, Events columns with types); `docs/TODO.md` §6 (Staff/Feedback/Changelog/Config additions); `reference/Handoff-Notes.md` §5 (conventions) | Names: yes. **Types: partial** — recorded for Events, Config and the v1.x additions; the original Projects/Tasks/Staff/Tasks2 column types are not written down anywhere (the code implies them — see idea 2). No dump of what the *site* actually has exists in the repo. |
| Permission-change history and why | `docs/Archive/TODO-v1-Archive.md:77, 306-310`; `docs/Archive/TODO-v1.x-Archive.md:294-301, 873-877`; `docs/Milestones/Phase-2.5-Feature-Interlude/2026-08-25-teams-picker.md:21-24`; `docs/Milestones/Phase-6-v1.x-Release-Train/2026-09-01-v180-permissions.md:37-41, 52-56`; `docs/Milestones/Phase-0-Foundations/2026-08-12-pages-preview-and-sandbox.md:27-31` (redirect URIs); commits `ac1ae92` (2026-08-25), `98cd369` (2026-09-01) | Yes. |
| Bot code and how it runs | **Not in this repository.** Lives in the private tracker `221twoseven/Project-Scheduler-issues` (`poll.mjs`, `.github/workflows/poll.yml`, `README.md`); described in `docs/TODO.md:370-418` and the 2026-09-25 milestone. Verified this session by reading the tracker (read-only): triggers are cron `17 * * * *` (hourly, best-effort), `issues: [closed, reopened]`, `repository_dispatch: feedback`, `workflow_dispatch` (dry-run input); token by client-credentials against `login.microsoftonline.com/<tenant>/oauth2/v2.0/token`, scope `https://graph.microsoft.com/.default`; workflow permissions `contents: write`, `issues: write`; concurrency group `poll`. | Found, elsewhere. |

## Scorecard

Gap levels per the handoff: **None** (already true), **Small** (a few PRs, no schema),
**Large** (structural, or needs ⚠ approval).

| Idea | Today (with line refs) | Gap | Effort to close | Pays off when | Recommend |
| --- | --- | --- | --- | --- | --- |
| 1. Storage seam | All Graph traffic already goes through `gfetch`/`gpageAll`/`listUrl` (`index.html:2198-2225`), but 16 functions build Graph URLs and item shapes themselves (37 sites), 3 raw `fetch` calls bypass `gfetch` (`2242`, `10353`, `10373`), five per-list flags carry four different fallback behaviours, and ~24 user-visible strings name SharePoint or a list. | Small | ~9 behaviour-neutral PRs, 20-120 lines each, one list per PR; 0 test assertions change | Every list added after it (closeout columns, Clients registry, Phase 8 registries), the suite's shared module (idea 4), local mode (idea 5) | **Do now** |
| 2. Provisioning as code | No script. Lists and columns are created by hand from a delivered spec (`CLAUDE.md:57-62`); the app probes columns live (`index.html:4840, 4847`). Column names are in the code; types only partly in the docs. | Small (the script) — the grant it runs under is ⚠ | ~120-line Node/Graph script + one site-grant change (`write` → `manage` on the bot) | Item 17 (a test site with the nine lists), every sibling app site, and it closes the "types not recorded" gap | **Do before the next suite app** |
| 3. Site-scoped permissions | SPA: `User.Read` + `Sites.ReadWrite.All` (`index.html:2176`) plus `TeamMember.Read.All` (`2239`) and `Mail.Send` (`10372`) on their own tokens — all delegated, admin-consented. Bot: `Sites.Selected` app-only, `write` on one site — already the target. Adding a list has never needed an Entra change (nine lists, one scope). | Large by the template (⚠ Entra) — the code change is one string | One Entra edit: add delegated `Sites.Selected`, grant the SPA on TWOSEVENINC, remove `Sites.ReadWrite.All` | When the suite registration is created — do it once | **Do before the next suite app** |
| 4. Suite readiness | Everything is one app: client/tenant/site/list constants (`2139-2175`), `TEAM_GROUP_ID` (`2233`), ~25 `shopTimeline*` browser-storage keys that sibling apps on the same Pages origin would share, three deploy allowlists, the repo link (`10401`). Shareable for free: same origin + same client ID ⇒ MSAL's `sessionStorage` cache gives silent SSO between sibling apps. | Large (D4 undecided) | A decision (D4 + Q1/Q4 below) first; then the seam's `store` + mappers become the shared module | Before the second app is built — unwinding later means migrating lists and re-consenting | **Do before the next suite app** (decide now) |
| 5. Portability | Signed-out today (jsdom run): sign-in card, pill "offline", zero network; the draft page, People/Clients (from browser cache) and every toolbar control work; `isAdmin()` is true; an edit is accepted into memory, parked as "not saved", and lost on reload. Roster/clients/config/sample/views persist locally; projects/tasks/todos/events do not. | Small with the seam, Large without | With the seam ≈ 300 lines in 2 PRs (local adapter, export/import, ~8 identity guards). Without: the same plus a branch at each of ~37 call sites, or a fake-Graph `fetch` shim | When a second team wants the scheduler without Microsoft 365 | **Do when a second team asks** (after idea 1) |

## 1. Storage seam

### 1a. Every call site that touches MSAL, Graph or SharePoint — by list

Counts: 17 `gfetch` sites, 12 `gpageAll` sites, 3 raw `fetch` sites outside `gfetch`,
5 MSAL sites — 37 in 16 functions.

**Auth and site (no list)**

| Function | Lines | Does |
| --- | --- | --- |
| `spInit` | `2184-2193` | `new msal.PublicClientApplication` (client ID, authority, `redirectUri` = page URL, `sessionStorage` cache); cached account or `loginPopup({scopes:SCOPES})` |
| `spToken` | `2194-2197` | `acquireTokenSilent`, fallback `acquireTokenPopup`, both with `SCOPES` |
| `gfetch` | `2198-2213` | bearer header, one Retry-After wait on 429/503, throws `SharePoint <status>: <text>` on non-2xx, returns JSON or null on 204 |
| `gpageAll` | `2215-2219` | follows `@odata.nextLink` |
| `spSite` | `2220-2224` | `GET /sites/{host}:{path}` once → `SITE_ID` |
| `listUrl` | `2225` | `/sites/{SITE_ID}/lists/{name}` |

**`ShopTimeline_Projects` and `ShopTimeline_Tasks`**

| Function | Lines | Reads / writes |
| --- | --- | --- |
| `spLoad` | `2379-2391` | GET both lists `?expand=fields&$top=2000` in parallel; keeps `it.id` in `SP_IDS`; reads Graph's `lastModifiedBy` / `lastModifiedDateTime` (`2388-2389`) |
| `spSync` → `plan()` | `2450-2478` | POST `/items`, PATCH `/items/{id}/fields`, DELETE `/items/{id}`; upserts then deletes, children before projects (`2464-2470`); sample projects stripped first (`2453`) |

**`ShopTimeline_Tasks2` (to-dos)** — `spLoad:2393-2399` (try/catch → `TODOS_OK`), `spSync:2474`.

**`ShopTimeline_Events`** — `spLoad:2401-2407` (→ `EVENTS_OK`), `spSync:2475`.

**`ShopTimeline_Staff`**

| Function | Lines | Reads / writes |
| --- | --- | --- |
| `spLoadStaff` | `2348-2354` | GET `?expand=fields&$top=500` |
| `spSyncStaff` | `2356-2377` | per-row POST/PATCH/DELETE, every row attempted, errors aggregated |
| `boot` | `10537-10546` | first-run push of a browser-local roster to an empty list (`10541`) |
| poll | `10611-10619` | re-read every other tick |
| `cdImportEC` | `4840` | GET `/columns` to probe for `status` |

**`ShopTimeline_Clients`** — `loadClients:2654-2665` (GET; keys on the SharePoint item id as
`spId`; columns `Title`, `field_2`), `spSyncClients:2692-2701` (POST/PATCH/DELETE by `spId`).

**`ShopTimeline_Config`** — `loadConfig:2867-2878` (GET; `Title` = key, `value`),
`saveConfigKey:2879-2896` (PATCH existing row or POST).

**`ShopTimeline_Changelog`** — `clogWrite:4695-4704` (one POST per row, fire-and-forget),
`clogFetch:4707-4716` (GET all, 60 s cache).

**`ShopTimeline_Feedback`** — `fbFetch:10118-10130` (GET; reads `createdDateTime`),
`fbSetStatus:10247-10259` (PATCH `status`), `sendFeedback:10338-10395` (POST item; raw
`fetch` PUT of the screenshot to `/drive/root:/ShopTimeline Feedback/…:/content`,
`10349-10356`).

**`Employee Contacts` (HR list, read-only)** — `cdImportEC:4836` (GET items, no `$select` —
TODO item 9a), `4847` (GET `/columns` for internal→display names).

**Graph, not SharePoint** — `loadTeamMembers:2235-2255` (raw `fetch` to
`/teams/{TEAM_GROUP_ID}/members`, own `TeamMember.Read.All` token at `2239`);
`sendFeedback:10370-10388` (raw `fetch` to `/me/sendMail`, own `Mail.Send` token at `10372`).

### 1b. List names, field names and SharePoint item shapes outside the call sites

- **Constants** `index.html:2143-2175` — the right place; nine names plus `Employee Contacts`.
- **Mappers** `2256-2340` (`todoToFields`/`fieldsToTodo`, `eventToFields`/`fieldsToEvent`,
  `projToFields`/`fieldsToProj`, `taskToFields`/`fieldsToTask`, `personToFields`/
  `fieldsToPerson`) — these are the shape boundary and stay: any tabular backend needs them.
- **Leaks of the SharePoint item shape into app state:**
  - `spId` (the SharePoint item id) is an app-level key on clients (`2657`, `2693-2700`; the
    People/Clients page keys selection on it — TODO §7.3 L1140) and on feedback rows
    (`10123`, `10233` `data-spid`, `10247`).
  - `SP_IDS` (`2178`) — app id → item id, used by both sync paths.
  - `field_2` (`2155`, `2657`, `2695`), `it.fields.Title` / `.value` in `loadConfig`
    (`2871-2872`), `createdDateTime` / `f.Created` (`10123`), `lastModifiedBy` (`2388`).
  - The Employee Contacts import reads raw `it.fields` and normalises SharePoint internal
    names (`4849-4858`) — inherently SharePoint-shaped by purpose.
- **User-visible strings that name SharePoint or a list, outside the data layer** (≈24):
  HTML titles `1359`, `1382`; toasts `2615`, `2670`, `2679`, `2714`, `2729`, `2743`, `2891`,
  `2893`, `4837`, `10257`, `10393`, `10532`, `10542`, `10550`; page text `4600-4601`,
  `4776`, `4798`, `10157`, `10163`, `10243`; the People/Clients source cue "· SharePoint /
  · this browser only" `4951-4953`; `TODOS_MSG_DETAIL` `2181`.
- **Tests:** list names or item shapes appear 63 times across 19 suites; `__spCalls`
  (recorded Graph requests) 35 times across 21 suites; URL shapes (`/items`, `/lists/`) 22
  times across 9 suites. `tests/harness.js:53-55` mirrors the list-name table and
  `:84-85` the item shape. Two suites assert the "· SharePoint" cue (`test-v170.js:65`,
  `test69.js:69-70`); one asserts `spId` on clients (`test69.js:44`).

### 1c. Fallback logic and error translation — one rule or many?

Five flags, **four behaviours**, plus two lists with none:

1. **Projects/Tasks — no fallback.** A failed load shows the "offline" pill and a toast with
   Details (`10529-10533`); a failed save parks `PENDING_SYNC` and the pill replays it
   (`2596-2630`).
2. **Staff, Clients, Config — browser-local.** `STAFF_OK` (`1780`, `10536-10551`),
   `CLIENTS_OK` (`2652-2665`), `CFG_OK` (`2867-2878`): read from `localStorage` when the
   list is unreachable; saves warn "saved in this browser only" (`2714`, `2670`, `2893`).
   Staff alone also *migrates up*: the first successful load of an empty list pushes the
   local roster (`10539-10542`).
3. **To-dos — session-only.** `TODOS_OK` (`2179`): no local copy; one warning per session
   (`8013-8014`, `8938-8939`); the poll keeps session to-dos alive (`10599`).
4. **Events — a different store, not a different medium.** `EVENTS_OK` (`2182`): without
   the list an event saves as a `ticketNodes` entry on a host phase (`7977-7989`,
   `8905-8920`); deleting a phase rescues them into rows when the list exists
   (`6523-6527`).
5. **Changelog, Feedback — no flag.** Each read paints its own "couldn't reach" message
   (`4776`, `4798`, `10157`, `10243`); changelog writes are fire-and-forget (`4704`), a
   feedback write toasts (`10393`).

Error translation is **one rule for the detail, many for the sentence**: `gfetch` produces
the only technical string (`SharePoint <status>: <first 180 chars>`, `2210`) and every
error toast passes `e.message` as the collapsible Details (`toast()` from `2485`, the
Details block at `2505-2510` — the T7 pattern) — but the user-facing sentence is hand-written at each site (≈14 distinct
sentences).

### 1d. The smallest adapter that covers every call site (draft — not implemented)

Shaped around what the app does, not around Graph. `kind` is the app's word for a table;
the adapter owns the kind → list-name table that lines `2143-2175` hold today.

```js
/* store — the one object index.html talks to about "wherever the data lives" */
const store = {
  signIn(),                 // → {name, email} or null (spInit; null = signed out)
  who(),                    // → {name, email} or null (replaces reads of ACCOUNT)
  list(kind),               // → [{id, fields, modifiedBy, modifiedAt, createdAt}]
  create(kind, fields),     // → {id}
  update(kind, id, fields),
  remove(kind, id),
  columns(kind),            // → [{name, displayName}]  (the live-probe pattern, 4840/4847)
  upload(folder, file),     // → {url} or null           (feedback screenshot, 10349-10356)
  available(kind),          // replaces STAFF_OK / TODOS_OK / EVENTS_OK / CLIENTS_OK / CFG_OK
  explain(err),             // one place that turns "SharePoint 404: …" into a sentence
  /* Microsoft-only extras — a non-Microsoft store returns [] / false and the existing
     degrade paths (2250-2253, 10387) already handle that */
  people(),                 // Team members (2235-2255)
  mail(to, subject, text),  // /me/sendMail (10370-10388)
};
```

`kind` ∈ `projects | tasks | todos | events | staff | clients | config | changelog |
feedback | employeeContacts`. The mappers stay exactly where they are. `SP_IDS` stays
app-side as `Row.id` (the app needs store ids for update/remove anyway) — ponytail: no
second id map inside the adapter.

Call sites that do not fit cleanly, and why:

- **Employee Contacts import** (`4841-4858`) needs display names as well as internal names
  → `columns()` returns pairs, not strings. Fits with that one extension.
- **Clients keyed by store id** (`2649-2650`): fits via `Row.id`, but the app-level name
  `spId` is a leak; rename in the same PR or leave (cosmetic, `test69.js:44` pins it).
- **Throttling** (`2203-2209`) and **paging** (`2215-2219`) are adapter-internal; a local
  store has neither.
- **The Staff first-run push** (`10539-10542`) is app logic on top of the adapter; unchanged.
- **Screenshot upload**: a store without a drive returns null and the report goes without
  its screenshot — already the failure path (`10356`).
- **`sendMail` and Team membership** are identity features, not storage. They sit on the
  same object only so a local adapter can no-op them in one place; nothing else in the
  app needs to know they are Microsoft.

### 1e. Refactor estimate

- **Call sites that move:** 37 (in 16 functions). Reads of `ACCOUNT` outside the data
  layer (`2557`, `2808-2812`, `2933`, `4665`, `8927`, `10106`, `10205`, `10536-10568`)
  become `store.who()` in one later PR.
- **Tests that change:** **0** for the list-by-list PRs, because the harness stubs and
  records at the `fetch` layer (`tests/harness.js:16-18`) and the adapter keeps the Graph
  URLs and bodies byte-identical — `npm test` green *with no assertion edits* is the proof
  of "no behaviour change" for each PR. The only PR that touches user-visible strings (the
  one-rule error PR) may touch `test-v170.js:65` and `test69.js:69-70`. A harness option
  for a local store is ~10 lines and comes last.
- **Sequence:** yes — the adapter lands with no callers, then one list (or one pair) per PR,
  each independently revertible. Nine PRs; see the sequence at the end.

## 2. Provisioning as code

### 2a. Is there a script?

No. `tools/` holds only `gen-release-notes.js`; there is no PowerShell, no PnP, no Graph
provisioning anywhere in the repo. Lists and columns are created by the owner in the
SharePoint UI from a spec delivered in chat and in TODO §6 (`CLAUDE.md:57-62`;
`docs/TODO.md` §6). The app never writes schema; it *probes* for optional columns
(`index.html:4840`) and omits null flags from PATCH bodies so a missing column never 400s
(`2305-2323`, the tristate pattern).

### 2b. Columns the code references vs what the docs record

Read from the mappers and the constants' comments. "Type (code)" is what the round-trip
implies; "Type (recorded)" is where the repo writes it down.

| List | Columns the code reads/writes | Type (code) | Type (recorded) |
| --- | --- | --- | --- |
| `ShopTimeline_Projects` (`2293-2294`) | `Title`, `client`, `jobCode`, `deadline`, `status`, `projectManager`, `drafter`, `leadFab`, `fabricators`, `metalFab`, `activeDepartments`, `appId`, `createdAt`, `sortIndex` | text; `deadline`/`createdAt` date (`isoDay` slice); `sortIndex` number; `activeDepartments` JSON text | **not recorded** (names only, `Handoff-Notes.md` §5) |
| `ShopTimeline_Tasks` (`2295-2296`) | `Title`, `projectId`, `department`, `assignee`, `startDate`, `endDate`, `estimatedDays`, `ticketNodes`, `notes`, `pinned`, `label`, `appId` | dates; `estimatedDays` number; `pinned` Yes/No (`!!f.pinned` — a text column would read `"false"` as true); `ticketNodes`/`assignee` JSON text | **not recorded**; `label` confirmed present (`Handoff-Notes.md` §5, `test-label.js`) |
| `ShopTimeline_Staff` (`2305-2340`) | `Title`, `depts`, `ooo`, `email`, `phone`, `role`, `appId`, `admin`, `feedbackRecipient`, `personalNotes`, `status`, `nickname`, `driver`, `availability`, `schedule`, `freelance`, `listeningTo`, `listeningLink`, `listeningVerb`, `listeningShow` | text; flags as `1`/empty; `depts`/`ooo`/`schedule` JSON text | original five: **not recorded**; every v1.x addition recorded as single-line text (`personalNotes` multi-line) in `docs/TODO.md` §6 and `docs/Archive/TODO-v1.x-Archive.md:874-895` |
| `ShopTimeline_Tasks2` (`2256-2265`) | `Title`, `appId`, `projectId`, `department`, `assignees`, `dueDate`, `startDate`, `progress`, `priority`, `notes`, `labels`, `checklist`, `createdBy`, `completedOn`, `completedBy`, `sortIndex` | dates; `sortIndex` number; JSON text | **not recorded** |
| `ShopTimeline_Events` (`2266-2269`) | `Title`, `appId`, `projectId`, `department`, `date`, `notes` | `date` date, `notes` multi-line | recorded with types, `docs/SETUP.md:76-80` |
| `ShopTimeline_Clients` (`2657`, `2695`) | `Title`, `field_2` (alias); no `appId` | text | recorded by display name (Client Name, Alias), `docs/Archive/TODO-v1-Archive.md`; internal name `field_2` only in code |
| `ShopTimeline_Feedback` (`10122-10127`, `10358-10363`, `10250`) | `Title`, `kind`, `name`, `email`, `description`, `appVersion`, `appId`, `status`; `ghIssue` (written by the bot only — the app never reads it) | text | all-text, `index.html:2157-2160`, v1.6.0 milestone; `ghIssue` in `docs/TODO.md` §6 |
| `ShopTimeline_Changelog` (`4677-4690`, `4711-4713`) | `Title`, `projectId`, `who`, `at`, `field`, `detail`, `appId` | text, `detail` multi-line | `index.html:2162-2165` |
| `ShopTimeline_Config` (`2871-2872`, `2885-2886`) | `Title` (key), `value` | text | `index.html:2167-2169`, `docs/TODO.md` §6 |
| `Employee Contacts` (`4836-4858`) | read-only; matches by normalised display name on `Status`, `Email`, `Primary Phone`, `Current Title`, `Department`, name | HR-owned | never provisioned by this app (by rule) |

- **Columns the code expects that the site may lack:** none known. Every optional column is
  recorded as created (TODO §6); the tristate pattern tolerates absence anyway.
- **Columns the site has that no code uses:** **cannot be determined from the repo** — there
  is no dump of the live lists. The nearest evidence: the one-off `/columns` probes
  (`4840`, `4847`) and the console dump of Employee Contacts' columns (`4849-4850`). Known
  dead-in-practice columns: `metalFab` on Projects (round-trips, retired — TODO item 29);
  `labels` and `checklist` on Tasks2 (always written `'[]'` at `2257`, never read at
  `2262-2265` — item 29).
- **Gap this closes:** the provisioning spec doubles as the missing column-type record.

### 2c. What an idempotent provisioning script contains, and which tool

Sketch (Node, Microsoft Graph, ~120 lines, `--dry-run` first, never renames or deletes):

```
SPEC = { ShopTimeline_Projects: { Title:'text', client:'text', deadline:'dateTime', sortIndex:'number', … },
         ShopTimeline_Tasks: { …, pinned:'boolean', notes:'text:multi' }, … }   // one entry per list above
for each list in SPEC:
  GET  /sites/{id}/lists?$filter=displayName eq '<name>'
  if missing: POST /sites/{id}/lists { displayName, list:{ template:'genericList' } }
  GET  /sites/{id}/lists/{listId}/columns
  for each column in SPEC[list] not present: POST …/columns { name, text:{} | dateTime:{} | number:{} | boolean:{} | text:{allowMultipleLines:true} }
print: created / already present / present-on-site-but-not-in-SPEC   ← the inventory the repo lacks
```

Recommendation: **a small Graph script in Node, not PnP PowerShell.** The team's stack is
Node end to end — jsdom tests, `tools/gen-release-notes.js`, and a 130-line `poll.mjs` that
already talks to Graph with raw `fetch` and client-credentials. PnP PowerShell would add a
PowerShell 7 install, a module, its own Entra registration (the shared PnP app was
retired) and usually a certificate — three new moving parts for one job. Put the script in
the private tracker next to `poll.mjs`, run it as a second `workflow_dispatch` there with a
`--site` argument, so the only app-only credential stays in the one place it already lives.

⚠ **What the runner needs:** creating lists and columns is not covered by the bot's `write`
grant (items only). Raise the bot's grant on TWOSEVENINC from `write` to `manage` (one
`PATCH /sites/{id}/permissions/{permId}` in Graph Explorer, no Entra change) — verify the
exact role against the current Graph docs before relying on it. A test site (item 17) gets
its own grant the same way. Alternative: a delegated run as Robert would need
`Sites.Manage.All` on some registration — a bigger ⚠ than the grant bump.

## 3. Site-scoped permissions

### 3a. Delegated scopes the SPA requests (`index.html`)

| Scope | Where | Right-sized? |
| --- | --- | --- |
| `User.Read` | `SCOPES` `2176`, login `2191`, every token `2195-2196` | Nothing calls `/me` except `/me/sendMail`; the account name/email come from MSAL's ID token (`2809-2812`). `openid profile email` would suffice, but `User.Read` is the conventional floor — not worth touching. |
| `Sites.ReadWrite.All` | same | **Broader than needed in reach**: any site the signed-in user can open, not just TWOSEVENINC. Never broader in rights — delegated means bounded by the user's own SharePoint permissions (recorded honestly at `2821-2823` and in the v1.8.0 milestone `:52-56`). The narrower delegated option is `Sites.Selected` (delegated flavour) with a `write` grant for the SPA's app id on TWOSEVENINC; covers items, `/columns` reads and the drive upload on that site. Verify availability in the tenant before switching. |
| `TeamMember.Read.All` | own silent token `2239` | Right-sized: there is no per-team delegated scope; a consent gap degrades to free text (`2250-2253`). |
| `Mail.Send` | own silent token `10372` | Right-sized for `/me/sendMail`; a strong scope consented tenant-wide for a feature that mails a couple of people, but the app-only alternative (bot sends from a shared mailbox) is *broader* unless fenced with an application access policy. Keep. |

Nothing is narrower than needed.

### 3b. Each registration's permissions and grant type (from the repo)

| Registration | Permission | Type | Consent | Reach |
| --- | --- | --- | --- | --- |
| SPA `5ba3aabe-…` (single tenant, SPA platform, PKCE, no secret — `SETUP.md:19-26`) | `User.Read` | Delegated | tenant admin consent granted (`SETUP.md:57-63`) | — |
| | `Sites.ReadWrite.All` | Delegated | admin, tenant-wide; re-confirmed after the 2026-08-19 repo move (`TODO-v1-Archive.md:77`) | every site the user can reach |
| | `TeamMember.Read.All` | Delegated | admin, 2026-08-25 (`teams-picker.md:21`) | every team the user can reach |
| | `Mail.Send` | Delegated | admin, 2026-09-01 (`v180-permissions.md:37-41`) | the user's own mailbox |
| | Redirect URIs (SPA platform) | — | `/Project-Scheduler/`, `/preview/`, `/sandbox/` (`SETUP.md:37`, Phase-0 record `:27-31`, `Onboarding-Fork.md:29-33`) | — |
| Bot "ShopTimeline Feedback Bot" (client ID not in this repo) | `Sites.Selected` | **Application** | admin, 2026-09-25 (`2026-09-25-feedback-github-bridge.md:15-17`) | `write` on TWOSEVENINC only, via `POST /sites/{id}/permissions` |

### 3c. The churn, explained

| When | Change | Why | Required by a new resource type? |
| --- | --- | --- | --- |
| 2026-08-12 → 19 | two redirect URIs (`/preview/`, `/sandbox/`) | Pages moved to three subpaths; each is a new origin to Entra | Hosting, not a permission. Required. |
| 2026-08-25 | + `TeamMember.Read.All` (delegated, admin consent) | REV70 staff picker reads one Team's members | Yes — Teams membership is not a SharePoint resource. One wasted step is on record: a licence-gated "scoped-role path" was tried first and "hit the Premium wall" before the plain app-Owner + admin-consent route (`TODO-v1-Archive.md:309`). |
| 2026-09-01 | + `Mail.Send` (delegated, admin consent) | v1.8.0 feedback mail as the submitter | Yes — mail. |
| 2026-09-25 | new app-only registration, `Sites.Selected` application permission, site grant `write` | the unattended poller; a browser page cannot hold a secret | Yes — a new *caller type*. Setup friction was one-time and recorded: the grant needs a site-collection admin, not a global admin (403 otherwise), and the Actions secret must hold the secret's Value, not its ID (`2026-09-25-feedback-github-bridge.md:41-46`). |

None of the four was caused by a **list-level grant** (SharePoint list permissions are not
Entra permissions, and none were changed — nine lists arrived under one scope), by
**missing consent** (each was admin-consented at creation, and the two side-scopes ride
separate tokens so a consent gap degrades instead of blocking — `2227-2232`,
`10364-10367`), or by **scope drift**. Answer to Part D: the churn is *not* a setup problem;
it is one change per new capability, and there is nothing cheaper to fix first. What will
churn next: one redirect URI per new Pages subpath (D4b), zero Entra changes per new list.

### 3d. Minimal steady-state set

- **(a) SPA / suite SPA:** `User.Read`; `Sites.Selected` (delegated) with a `write` grant on
  TWOSEVENINC replacing `Sites.ReadWrite.All`; `TeamMember.Read.All` and `Mail.Send` only
  while those two features exist; all admin-consented. ⚠ Entra: one addition, one
  removal, one site grant. Code: the string at `index.html:2176`; no suite pins it (the
  harness's MSAL stub ignores scopes, `tests/harness.js:39-45`).
- **(b) Bot:** exactly what it has — `Sites.Selected` application, `write` on TWOSEVENINC;
  `manage` only if provisioning (idea 2) rides it. Optional upgrade, ⚠ Entra: a
  **federated credential** (GitHub Actions OIDC → Entra workload identity) removes the
  secret and its 24-month cliff for ~15 lines in `poll.mjs`; a certificate would only move
  the expiry, not remove it.

## 4. Suite readiness

### 4a. What is hardcoded to this one app, and where

| Thing | Where |
| --- | --- |
| Client ID, tenant ID | `index.html:2139-2140`; `docs/SETUP.md:21-22`; `CLAUDE.md:75-76` |
| Scopes | `2176` |
| Redirect URI | derived from the page URL at `2186` — self-adapting per subpath (no per-app constant), but each subpath must be registered |
| Site host/path | `2141-2142` |
| List names with the `ShopTimeline_` prefix | `2143-2175` (nine) — mirrored in `tests/harness.js:53-55` and 63 test occurrences |
| Drive folder | `/ShopTimeline Feedback/` at `10352` (and in the bot, `poll.mjs`) |
| Team group id | `TEAM_GROUP_ID` `2233` |
| Browser-storage keys `shopTimeline*` | `PEOPLE_KEY` `1634`, `SAMPLE_KEY` `2417`, `CLIENTS_KEY` `2651`, `CFG_KEY` `2866`, `PP_STASH` `6746`, `VIEWS_KEY` `9655`, `ME_KEY` `9724`, `PMLATE_KEY` `9805`, `COACH_KEY` `9864`, `UI_KEY`, ~14 literal keys (`2783-2787`, `3491`, `4532-4533`, `5848`, `6603`, `6660-6674`, `9433-9459`), `sessionStorage` `shopTimelineViewAs` `2830` |
| Hosting | three sparse-checkout allowlists in `.github/workflows/deploy-pages.yml`; the Pages URL in `docs/SETUP.md`; the repo link at `10401`; `APP_VER` `1628` and the generated `RELEASE_NOTES` block |
| Role model | `isAdmin`/`isViewer`/`vcan` (`2838-2844`, `2904-2905`) read Staff flags and Config rows — app-specific logic over shared lists (D3 wants one vocabulary for the suite) |

**A finding for D4(b):** sibling apps served from one Pages origin
(`221twoseven.github.io/…/timeline/`, `/clients/`) **share `localStorage` and
`sessionStorage`**. Today that cuts both ways: `shopTimelinePeople_v1` written by a Client
Manager would be read by Timeline (`2119-2123`) — so keys need a per-app prefix, or the
caches (roster, clients, config) are declared deliberately shared; and MSAL's
`sessionStorage` cache is per origin, so a second app using the same client ID finds
Timeline's account in `getAllAccounts()` (`2189`) — silent single sign-on for free.

### 4b. Second suite app: duplicate vs share

| Share (one copy for the suite) | Duplicate today (would be copied per app) |
| --- | --- |
| Entra registration: client ID, tenant, consent, one redirect URI per subpath | the data-layer block `2138-2229` (~90 lines) |
| The SharePoint site and the registries (Staff, Clients, Config, later Projects) | `toast`/`setSync` and the `*_OK` fallback patterns (`1780`, `2179-2182`, `2652`, `2866`) |
| `msal-browser.min.js`, the MSAL cache (SSO on one origin) | the identity chain and role checks `2807-2844` |
| `.github/workflows/deploy-pages.yml`, the design tokens (`design/Style-Guide.md` §10) | the config loader `2856-2896`, the mappers for shared lists |

After idea 1, the right-hand column collapses to **the `store` object + the mappers +
`toast`/`setSync`** — which is exactly the vendored `common.js` that D4(b) proposes. The
seam is the suite module.

**Recommendation: one shared registration and one site for the browser apps; keep a
separate registration for unattended bots (the existing one).** The tradeoff: one
registration means one consent, one redirect-URI list and free single sign-on between apps
on the same origin, at the cost that every app carries every app's scopes (a `Mail.Send`
consented for Timeline is exercisable by Client Manager). One per app isolates scopes but
multiplies consents, redirect-URI lists and expiry tracking, and gives up silent SSO
across the suite. Decide before the second app is built — unwinding later means
re-consenting users and migrating lists.

## 5. Portability

### 5a. What already works with no SharePoint and no sign-in

Recorded from a jsdom run of `index.html` with MSAL stubbed to *fail* sign-in (no cached
account, `loginPopup` rejected) and `fetch` rejecting — the same boot a user gets when
they close the Microsoft popup or have no network:

- **Renders:** the timeline shell with the sign-in card ("Shop Timeline … Sign in with
  Microsoft", `3543-3546`; the button re-runs `boot()`, `3577-3582`); the sync pill reads
  "offline" (`10531`); one toast with Details (`10532`). **Zero network calls leave the
  page.** Every toolbar control is enabled; the sidebar renders its lens/sort controls.
- **Works:** `#/project/new` — the whole draft page and scheduler (`generateSchedule` is
  pure); `#/people` — "0 people · this browser only" with Add and Import buttons; with a
  cached roster (`shopTimelinePeople_v1`, read at `2119-2123`) the People page and every
  picker work from cache; Clients (`2662`) and Config (`2876`) likewise; `#/issues` renders
  the form (Help ▸ Report is blocked with "Sign in first" at `10106`, the direct route is
  not).
- **`isAdmin()` is true** signed-out (`2840`: empty roster ⇒ legacy everyone-admin), so
  every edit door is open.
- **An edit is accepted and then lost:** `saveState` updates the screen, the pill reads
  "not saved — click to retry", `PENDING_SYNC` is parked, still zero network (`spToken`
  throws before any `fetch`) — and the change is gone on reload, because `ST` is
  memory-only; only sample projects stash to `localStorage` (`2417-2432`).
- **Breaks:** nothing throws. **Disabled:** nothing — and that is the gap: signed-out is
  indistinguishable from "an admin with a network problem". The sample project is
  unreachable signed-out (`3547-3550` needs an account — ledger §7.1 L1013).
- **Persists locally today:** roster, clients, config, sample projects, saved views, UI
  prefs, the draft (`sessionStorage`). **Does not:** projects, phases, to-dos, events.

### 5b. Features tied to Microsoft identity, and how each should degrade in a local mode

| Feature | Where | Depends on | Local-mode degrade |
| --- | --- | --- | --- |
| Identity chain (REV66) | `meName()` `2807-2814` | `ACCOUNT.username`/`name` ↔ Staff email/name | a chosen local persona; `rememberedMe()`/`ME_KEY` (`9724-9725`) is already the no-account fallback for the dashboard button (`9760-9761`) — promote it to the identity source |
| Person filter, My Dashboard, person panel | `3378`, `9665`, `9726-9761` | `meName` ∥ `rememberedMe` | already works from `rememberedMe`; keep |
| Admin / viewer / developer | `2824-2844` | Staff `admin` flags | single user = admin; `permsLive()` false already yields admin; view-as picker hides |
| PM late prompt | `9830`, `10568` | account + `meName` | gated on the account today; gate on the persona |
| Feedback form, mail, screenshot | `10104-10395` | account, list, drive, `Mail.Send` | hide the menu entry (or export to the local file); mail already skips (`10387`) |
| Teams picker | `2235-2255` | `TeamMember.Read.All` | already degrades to free text (`2250-2253`) |
| Employee Contacts import | `4832-4905`, button `4964` | HR list on the site | hide when the store has no `employeeContacts` kind |
| Changelog | `4695-4716`, page `4738` | list + account name (`4665`) | a local kind, or the page hidden |
| `updatedBy` / `updatedAt` | `2388-2389`, `2555-2565` | Graph audit fields | persona + `Date.now()` — `stampUpdated` already falls back to "You" (`2557`) |
| `createdBy` on to-dos | `8927` | account | persona |
| Viewer grants (Config) | `2867-2896` | Config list | irrelevant for one admin |
| Sign-in card, pill | `3543`, `10529-10533` | MSAL | card becomes "Open a schedule file / Start empty"; pill reads "local" |
| 90-second poll | `10569-10622` | Graph | no-op for a local store; a `storage` event if a shared-file backend ever comes |

### 5c. Cost of a local-only mode with JSON export/import

**With the seam (idea 1):** ≈ 300 lines in 2 PRs. (1) A `localStore` adapter, 120-150
lines: `list/create/update/remove` over one `localStorage` key per kind (IndexedDB only if
the ~5 MB per-origin ceiling is ever reached — 2,000 rows is far below it), `columns()`
returns the mapper keys, `upload()` null, `people()` `[]`, `mail()` false, `signIn()` the
persona. (2) Export/import, ~40 lines: `JSON.stringify` of every kind → download; import →
replace + reload. (3) The mode switch: a `?local` query or one constant beside `2138`,
plus a five-line branch in `boot()` (`10522-10556`). (4) The ~8 one-line guards from the
table above. (5) A harness option and one suite round-tripping each kind.

**Without the seam:** the adapter has nowhere to plug in. Either each of the ~37 call sites
gains a branch (and every future list adds two), or — the ponytail shortcut — a runtime
`fetch` shim answers the Graph URL shapes from `localStorage`, which is what
`tests/harness.js:50-87` already does in 40 lines. The shim ships fastest (~100 lines,
zero call-site changes) but bakes Graph URLs into local mode, must fake `@odata.nextLink`,
`/columns`, `/drive/root:` and item ids, and becomes a second, hidden copy of the data
layer that every new call site has to mirror. Roughly 200 lines now, growing with every
list. Recommend the seam first; the shim only if a second team needs it before the seam
lands.

**Who it is for (Part D):** one scheduler owning another team's schedule = local-only +
JSON hand-off is enough. Two people editing is a shared-file or backend decision, not
scoped here; the seam keeps that door open without designing for it.

## Proposed PR sequence

Each PR: one short-lived branch off `development`, no `APP_VER` bump and no `CHANGELOG.md`
line (nothing changes for the team), `npm test` green **with no assertion edits** as the
neutrality proof, one milestone record for the whole sequence when it closes. In
dependency order:

1. **`store` object, no callers.** ~60 lines below `listUrl` (`2225`), implemented over
   `gfetch`/`gpageAll`; the kind → list-name table moves in from `2143-2175`. Tests: 0.
2. **Projects, Tasks, To-dos, Events.** `spLoad` (`2379-2409`) and `plan()` in `spSync`
   (`2456-2471`) call `store.list/create/update/remove`. Graph bodies unchanged ⇒
   `test46-92`, `test54`, `test-label` untouched.
3. **Staff.** `spLoadStaff`/`spSyncStaff` (`2348-2377`), the boot first-run push
   (`10539-10542`), the `/columns` probe (`4840`).
4. **Clients + Config.** `2654-2701`, `2867-2896`.
5. **Changelog + Feedback.** `4695-4716`, `10118-10130`, `10247-10259`, `10338-10395`
   (adds `store.upload`).
6. **Employee Contacts import.** `4832-4858` (`store.list('employeeContacts')`,
   `store.columns` with display names).
7. **Identity and the Microsoft extras.** `spInit`/`spToken` → `store.signIn()`/`who()`;
   `loadTeamMembers` → `store.people()`; `sendMail` → `store.mail()`; the `ACCOUNT` reads
   listed in 1e → `store.who()`. The harness's MSAL stub still satisfies it.
8. **One error rule.** `store.explain(err)` replaces the ~24 hand-written SharePoint
   sentences with one sentence + Details; the "this browser only" cues (`4951-4953`,
   `2670`, `2714`, `2893`) read `store.available(kind)`; the five `*_OK` flags go. The one
   PR that changes user-visible strings — expect to touch `test-v170.js:65` and
   `test69.js:69-70`.
9. **Harness at the seam.** `tests/harness.js` gains `store:'local'` (keeps `fetch`
   recording for every existing suite); one new suite round-trips each kind. Prepares
   idea 5.

After the sequence, and not "do now": local mode + export/import (idea 5, 2 PRs);
`provision.mjs` in the tracker repo (idea 2, ⚠ grant bump); the scope swap at `2176`
(idea 3, ⚠ Entra) — timed with the suite registration.

## Open questions for Robert

1. **Scope swap.** When the suite registration is set up, is it acceptable to add delegated
   `Sites.Selected` with a site grant for the SPA and remove `Sites.ReadWrite.All`? ⚠
   Entra; the code change is the one string at `index.html:2176`.
2. **Local mode audience.** One scheduler, one browser, JSON hand-off — or two people on a
   shared file? The first is two PRs after the seam; the second is a backend decision this
   review deliberately does not make.
3. **Provisioning runner.** Raise the Feedback Bot's site grant from `write` to `manage`
   and run `provision.mjs` from the private tracker, or a script you run signed in as
   yourself (which needs a new delegated scope somewhere)?
4. **D4.** Is (b) — separate single-file apps under one Pages site with a vendored
   `common.js` — ready to be ruled? The seam's `store` + mappers + `toast`/`setSync` is that
   module, and the browser-storage key prefix has to be decided in the same breath.
5. **Record what is missing.** The bot registration's client ID and the secret's exact
   expiry date are in no file the repo controls; add both to `docs/SETUP.md` (item 21)?
