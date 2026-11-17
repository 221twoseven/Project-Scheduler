# The Systems page and Timeline's move — v1.56.0 (2026-11-17)

**TODO item 49** (D4's reshape). PR #201, with the deploy workflow put on `main` first by PR #200.
The owner gave the go on 2026-11-17 and chose the cards and their wording the same day.

## What changed and why

Systems is the name for all of Twoseven's products over the one shared dataset: People,
Clients, Office and Timeline (`docs/TODO.md` §1). D4 (ruled 2026-09-28) gives each product a
folder of its own under one Pages site, with a portal at the root. This release builds that
portal and moves Timeline into its folder. Nothing inside Timeline changes.

- **The site's root is now the Systems page,** built to the owner's Portal Option 1
  wireframe (now kept in `design/wireframes/`, with the People and Clients ones). It has:
  - a 56px dark header with the TWOSEVEN INC. wordmark, a divider and "Systems";
  - the title "Your workspace" and the line "Open an app to get started.";
  - four app cards, three to a row, each with an icon, a → and an "Open …" line, in the
    owner's wording:
    - **Timeline**: "Project schedules, phases and crews" / "Open Timeline";
    - **People**: "Staff, contact details and time off" / "Open People";
    - **Clients**: "The client list" / "Open Clients · admins only";
    - **Office**: "Leads, estimates and job setup." / "Not built yet".

  People and Clients open Timeline's own pages until they become products of their own
  (D8). Office is greyed (a dashed edge, no fill, no arrow) and isn't a link. The page has
  no sign-in and loads no script file. So the wireframe's Apps menu, account avatar,
  "Recently opened" list and signed-in footer are left out until a page that signs in.
  *A first version followed Timeline's as-built style guide instead of the wireframe; the
  owner caught it before the PR opened, and it was rebuilt the same day.*
- **Timeline moved to `/timeline/`** (and `/preview/timeline/`), along with its MSAL file. It
  reads the wordmark font from one folder up. Sign-in now returns to `/timeline/`, so the
  owner registered that address in Entra before the merge.
- **Old links still work.** A link to a project or page (`…/#/project/…`, `…/#/people`) or a
  shared saved view (`…/#view=…`) that lands on the root goes straight on to Timeline, route
  intact. A plain visit to the root shows the Systems page. A Microsoft sign-in reply landing
  there stays put, so a tab from before the move can still sign in.
- **Tabs left open from before the move still hear about it.** Timeline's update check reads
  its own page for a newer version. A tab opened before the move reads the root, which is now
  the Systems page. So that page names v1.56.0 in a hidden comment: those tabs show
  "v1.56.0 is available — Reload", and "Ask everyone to reload" still retires them.
- **The deploy workflow publishes either layout.** It lists both the old and the new files,
  so a branch from before the move and one from after it deploy alike. Its guard now checks
  every page, each from its own folder. The workflow has to be identical on `main` and
  `development`, so PR #200 put it on `main` before this release reached `development`.

**Before:** `screenshots/before-systems-portal.png` (the root opened Timeline)
**After:** `screenshots/after-systems-portal.png` (the root is the Systems page; Timeline
looks the same at `/timeline/`)

## For the owner

1. Before merging: add `https://221twoseven.github.io/Project-Scheduler/timeline/` and
   `https://221twoseven.github.io/Project-Scheduler/preview/timeline/` as SPA redirect URIs
   on the Entra registration (`docs/SETUP.md`).
2. After merging: open `/preview/` (the Systems page), click Timeline, and sign in.
3. After promotion: press "Ask everyone to reload" from production Timeline. Keep the old
   `/` and `/preview/` redirect URIs for a working day, then remove them.

## Known limits and follow-ups

- Timeline's wordmark still goes to Timeline's home, not the Systems page. Pointing it there
  is style §13 step 4, the shell (item 52), which this release unblocks.
- A bookmark to the bare root now opens the Systems page, one click from Timeline. People can
  bookmark `/timeline/` instead.
- The hidden v1.56.0 on the Systems page is fixed. Only tabs opened before the move read it,
  so it never needs bumping.
- The repository's name is still in the address. A rename waits on item 40's custom domain.

## Checks

`tests/test-v1560.js` (39 checks):
- the header, the title, the four cards' wording, icons, arrows and links, and that Office
  isn't a link;
- that old `#/…` and `#view=` links forward and a sign-in reply doesn't;
- a v1.55.1 build at the root being offered the reload, and then retired;
- Timeline booting from `/timeline/`, on a saved project and on the New Project draft, with
  sign-in returning to `/timeline/`;
- the tools (`npm test`, the runner, `npm run notes`) pointing at `timeline/index.html`.

`tests/test-deploy-guard.js` now reads both pages. The guard step itself was run against a
copy of today's production next to the new preview, then against a deliberately broken link,
which it caught.

Accessibility (`design/Design-Language.md` §9):
- the cards are plain links, reachable by Tab, with the `:focus-visible` outline;
- text is 11px or larger and the muted text keeps 4.5:1 on the page;
- each card is at least 125px tall (150px on a desktop);
- the greyed card says "Not built yet" in words, not only in grey;
- the "Open …" line keeps 5.2:1 on the hover tint, and the header's "Systems" 6.9:1.
