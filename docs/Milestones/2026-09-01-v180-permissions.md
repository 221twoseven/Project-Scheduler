# 2026-09-01 — v1.8.0: permissions — admin vs regular users + feedback recipients

**Version:** v1.8.0 (minor) · **Branch:** `development` · **Suite:** `tests/test-v180.js`
· **Objective:** §3 item 12 (2026-08-28 brief, obj 3; feedback recipients added by the
owner 2026-09-01)

## What shipped

Two per-person flags on `ShopTimeline_Staff` (columns created by Robert 2026-09-01,
`1` on his row) now drive who can change shared data and who receives feedback mail:

- **Admins** — full access, exactly the app as it was.
- **Regular users (viewers)** — everything is visible, nothing shared is editable:
  - No **client list** (menu entry hidden, `#/clients` bounces home), no people
    edits (People page reads fine; Add/Edit/Remove don't render), no project
    creation (`+ New Project`, the `N` key and `#/project/new` all bounce), no
    department/phase edits (create menus, right-click, double-click create,
    marker drags, bar drags and edit keys are inert).
  - **Lock Dates is forced on and the toggle hidden.**
  - **Project Edit fields render as plain text** — fields are disabled and
    CSS-flattened ("visible, locked"), checkbox groups show only their checked
    names, the footer loses Delete/Mark-complete and reads "View only".
  - The dashboards, filters, saved views, zoom, print, tour, and the feedback
    form all work unchanged.

- **The switch:** while **no** roster row carries an `admin` value, everyone is
  admin (the pre-v1.8.0 world — also what keeps the 90-odd older test suites
  meaningful, since their fixtures predate the column). Once any row carries a
  value, only truthy rows (`1`/`Yes`/`true`) are admins. Unset flags stay `null`
  and are **omitted** from PATCH bodies, so a site without the columns never 400s.

- **Admin management UI:** the People page's editor gains two checkboxes for
  admins — *Admin* and *Receives bug reports & ideas* — and the read mode shows a
  Permissions row. **The last admin cannot be demoted** (guard + toast), so the
  app can't be locked out from the inside.

- **Feedback recipients:** "Report a bug or idea" now also emails everyone flagged
  `feedbackRecipient` — Graph `/me/sendMail` **as the signed-in submitter**, on its
  own `Mail.Send` delegated token (the `TeamMember.Read.All` pattern: consent was
  admin-granted 2026-09-01; if a token can't be had, the mail is skipped and the
  report is already filed on the list — the toast says which happened).

## Enforcement layers (how it's wired)

1. **Choke points:** `saveState`, `savePeople`, `saveClients` refuse for viewers
   with a toast — every missed door is caught here, including future ones.
2. **Doors:** route guards (`#/clients`, `#/project/new`), drag/menu/keyboard
   guards, conditional rendering of edit affordances.
3. **Presentation:** `body.viewer` CSS hides admin-only chrome; `viewerLock()`
   disables fields so they read as information.

## The honest security note (recorded per the owner's brief)

This is a client-side SPA: **every signed-in user's token still carries
`Sites.ReadWrite.All`**, so this gating is *workflow protection, not security* —
a determined user could write to the Lists through Graph directly. Real
enforcement would need SharePoint-side permissions. This is the same trust model
the shared Lists have had all along; accepted as such in the brief.

## Rollout note

At ship time only Robert's row is flagged — **every other user becomes a viewer
the moment this build reaches them.** That's the intended starting point (flip
`admin` per person on the People page as roles firm up), but worth remembering
when reading `/preview/` feedback: "I can't edit anymore" is the feature.
Sign-ins that don't match a roster row (email, then name) are viewers too — the
identity chain is the same one My Dashboard uses.

## Known ceilings / follow-ups

- Viewer gating assumes the `admin`/`feedbackRecipient` columns are **single-line
  text** holding `1` (what was created); the reader also accepts Yes/No booleans,
  but the writer sends `'1'`/`''` — if the columns were created as Yes/No, saves
  from the permissions checkboxes would need the writer switched to booleans.
  Confirm on first `/preview/` save.
- A viewer can't seed the sample project (the empty-state teach card's seed rides
  `saveState`) — only visible on a zero-project site, where a fresh org would have
  admins anyway.
- The PM late prompt is skipped for viewers (they couldn't act on it).
- Viewers keep read access to People (shop roster including phones) — deliberate;
  the page is the company directory.
- v1.9.0's personal dashboard fields will need a **self-row exception** in the
  `savePeople` viewer guard (everyone may edit their own row's personal fields —
  already noted in TODO §3 item 30).
