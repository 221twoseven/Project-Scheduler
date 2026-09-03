# Stats for Nerds

Performance, traffic, and scale numbers for the Shop Timeline app — everything you
need when someone asks "will this fall over?" Compiled 2026-09-02 (v1.18.3); the
measurements are from the code and milestone records cited inline, so re-verify the
line numbers against the current build before quoting them somewhere permanent.

**The short answer:** there is no server of ours to overload. The app is a static
page; every user's browser does its own rendering and talks directly to Microsoft's
SharePoint via the Graph API, at about **three small requests per minute** — roughly
the traffic of one person idly clicking around any SharePoint site. Five, ten, or
fifty simultaneous users won't register.

---

## 1. What the app is, mechanically

- **One static HTML file** — 580 KB, ~9,800 lines, no framework, no build step —
  plus a locally vendored MSAL auth library (366 KB) and one font file (52 KB).
  Served by **GitHub Pages** (a static CDN; no backend of ours exists).
- **The "database" is SharePoint**: six `ShopTimeline_*` lists on the TWOSEVENINC
  site, read and written through Microsoft Graph v1.0 with each user's own
  signed-in token.
- First load: download the page (~1 MB total, then cached), sign in, one read of
  every list. After that, everything below.

## 2. Network traffic per user

Two things generate requests, and nothing else:

**The background poll** (`POLL_MS=90000`, `index.html` ~9832): every 90 seconds a
*visible* tab re-reads Projects, Tasks, Tasks2, and Events (**4 GETs**), plus Staff
every *other* tick — **~4.5 requests / 90 s ≈ 3 requests per minute**. At current
shop scale each response is tens of KB, so an idle open app consumes a few KB/s —
less than a mail client syncing. The poll also opts out aggressively:

- **Hidden/minimized tab: zero requests** (`document.hidden` guard — the single
  biggest idle-traffic cut).
- Skips while dragging, mid-save, mid-edit (open popover, Company Data edit,
  typing in User Notes), or under the tour — both before *and* after the fetch
  (the REV90 re-check, so a snapshot fetched mid-edit is discarded, not applied).

**Writes**: only on user action, and only the changed rows — dragging one phase is
a single PATCH. Saves are serialized on one promise chain per client (REV90), so
even rapid-fire edits queue politely instead of racing.

### The multiplication table

| Concurrent users (visible tabs) | Requests/minute tenant-wide |
|---|---|
| 1 | ~3 |
| 10 | ~30 (one every 2 s) |
| 50 | ~150 (2.5/s) |

Graph/SharePoint throttling is per-user-per-app and aimed at scripts hammering
hundreds of requests per minute *per user*; we sit at three. Each person signs in
with their own token, so users don't even share a throttle bucket.

## 3. What happens if Microsoft pushes back anyway

Layered, all already shipped:

1. `gfetch` honors a 429/503 **Retry-After** header once (capped at 60 s) instead
   of re-hammering (`index.html` ~2113).
2. A failed save gets **one automatic retry**, then parks behind the sync pill as
   one merged, click-to-retry pending diff (REV90); a parked *staff* save also
   pauses the staff poll so the server can't overwrite the user's unsaved edits
   (v1.15.2), and closing the tab warns.
3. A failed poll tick is silently dropped — the next tick 90 s later tries again.
4. Deletes run **children-first, project last** (v1.18.3), so even a request queue
   killed mid-flight can't strand orphan rows behind a deleted project.

## 4. Rendering cost is local, not server traffic

Drawing the timeline happens entirely inside the viewer's browser — **a render
makes zero network requests**; it's pure local DOM work in that one browser.
Browser profilers report very large per-paint tallies (function calls, style
recalcs, node reads) for any canvas-dense UI; those numbers describe normal local
CPU work, don't touch M365, and don't grow with user count.

The measured reality: **~14–21 ms per frame during the heaviest gesture**
(continuous drag-zoom) at 14 projects in a real browser — comfortable 60 fps
territory (v1.5.0 milestone). Rendering is throttled to animation frames, the
px-per-day scale is computed once per render and cached, and the poll repaints only
when the server state actually differs (whole-state comparison, so an unchanged
tick costs no DOM work at all).

## 5. Data size — the real ceiling, and it's gradual

Every load and poll reads **every row** of the four lists (no filters, by design —
it's what makes deletions and every kind of edit propagate reliably). Reads are
properly paginated (`gpageAll` follows `@odata.nextLink`), so nothing hard-fails at
any row count; it just gets slower in stages:

- **Today** (a few dozen projects, a few hundred phase rows): payloads in the tens
  of KB, instant.
- **~2,000–5,000 phase rows**: megabyte-ish payloads, loads take a couple of
  seconds, the per-tick comparison and re-render cost noticeable CPU. Annoying,
  not broken. At shop pace (~100 projects/year × ~8 phases ≈ <1,000 rows/year)
  this is **several years away**.
- **5,000 items in one list**: SharePoint's own "large list" threshold. Paginated
  reads keep working past it; it's the platform's signal that a list wants
  splitting.
- **What users would feel first is the browser, not SharePoint**: several hundred
  bars *visible at once* makes zoom/drag sluggish (the hover-conflict scan has a
  documented memoization upgrade gated on "projects in the thousands" — v1.2.1
  ceiling). Density levels, group collapse, the past-projects sink, and filters
  keep the visible count low regardless of list size.

**The escape valve is cheap and already anticipated**: archive completed projects
to a separate list — the company already does this by hand ("27 Projects
(Archive)"), and the planned lifecycle column (TODO §3 items 27/13) is the hook.
The working set stays "active jobs," which will never be more than a few dozen.

## 6. Multi-user behavior (consistency, not just capacity)

- Someone else's edit appears within **one poll tick (≤ 90 s)**; your own edits
  appear instantly (optimistic UI, then synced in the background).
- Two people editing **different** records never conflict — writes are per-record
  diffs. Editing the **same** record concurrently is last-writer-wins, the same
  trust model as the shared Lists always had.
- A remote refresh clears the local undo stack (REV90) — undo can never diff
  against a teammate's rows and delete their work.
- Viewer/admin permission gating is enforced at the one choke point every shared
  write funnels through (v1.8.0), noting honestly: it's workflow protection, not
  security — every signed-in token carries the same Graph scopes.

## 7. Client-side storage footprint

- **Tokens**: `sessionStorage` only (gone when the tab closes; nothing persistent,
  nothing shared).
- **Preferences** (density, dock sizes, saved views, tour-seen flag): `localStorage`,
  a few KB, per browser.
- Missing optional lists degrade to browser-local storage with a visible warning —
  never a crash.

## 8. Verification

74 jsdom test suites (as of v1.18.3) boot the real `index.html` with `fetch`
stubbed and **assert on the actual outgoing Graph request bodies and order** — so
the traffic behavior above (diffed writes, serialized saves, child-first deletes,
tristate columns that never 400 other saves) is regression-tested, not aspirational.
GitHub Actions runs the full suite on every push; the Pages deploy is gated behind
a referenced-assets guard.

---

*Soundbites: "Each open app makes about three small read requests a minute — about
what one person clicking around SharePoint generates. All ten of us at once is one
request every two seconds, against infrastructure Microsoft sizes for millions."
And on data: "It reads the whole list every refresh, so it slows gradually as
history piles up — we're years from noticing, and the day we do, we archive
finished jobs to a second list and it's instant again."*
