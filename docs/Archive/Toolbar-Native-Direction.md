# Header & toolbar — native-software direction

*2026-08-27 · the working strategy for the header/toolbar refactor. Owner
handoff: "make the shell feel like established desktop/web software, not a
bespoke dashboard." Decisions below are locked; phases are the agreed steps.*

**This supersedes the eyebrow-label approach.** The current toolbar is
**Option A** of `Toolbar-Grouping-Proposal.md`, shipped the same day as REV88
(`Milestones/Phase 3.5/2026-08-27-toolbar-regroup.md`) and codified in
`Design-Language.md` §2.6. Option A's thesis was *expose the taxonomy with
`Where`/`Style`/`Filter` eyebrow labels, keep everything visible*. This pass
reverses that thesis: **hide the taxonomy, lean on familiar patterns.** So
§2.6 and `test88` change as part of the work (see §6).

## 1. The problem, precisely

Two leaks make the shell feel custom:

- **Row 1 mixes categories under one "Settings" label** — People/Clients are
  navigation, Density is a view state, yet all sit inside a menu called
  *Settings* (a preferences category).
- **Row 2 makes ~11 equal-weight pills, then labels its internal buckets out
  loud** (`Where` / `Style` / `Filter`). Users are asked to learn the app's
  conceptual model instead of recognising standard controls.

## 2. Classification — every header control

Typed against the five-category rule (+ Status, kept separate from navigation).

**Application bar (row 1, dark)**

| Control | Type | Target |
|---|---|---|
| `TWOSEVEN · Shop Timeline` | Identity | keep |
| **+ New Project** (accent) | Command (primary) | the lone accent — keep prominent (already true) |
| My Dashboard ▾ | **Navigation** | already toggles `.active` — treat as a view switch |
| Print ▾ (Timeline / Meeting Sheet) | Command (menu) | keep |
| Settings ▾ (People, Clients, Density) | **Mixed** — nav + view-state under a Setting label | **split** (biggest row-1 leak) |
| Help | Navigation/utility | → Help ▾ (shortcuts, legend, about) |
| REV · sync pill | **Status** | keep — "sync is status, not navigation" (already true) |

**Timeline toolbar (row 2)**

| Control | Type | Target |
|---|---|---|
| Today (+ go-to-date menu) | **Navigation** (position) | keep; no `‹ ›` arrows exist today (scroll/drag + go-to only) |
| Day / 2-Day / Week / Month | **View state** (exclusive) | true segmented control; drop eyebrow |
| Project / Team | **View state** | → `Color by: Project ▾` |
| Comfortable (density cycle) | View state (infrequent) | → **View ▾** menu |
| Vivid months (toggle) | View state (infrequent) | → **View ▾** menu |
| Search | **Filter** | keep visible |
| Status ▾ | **Filter** | → merge into `Filters ▾` |
| Person ▾ | **Filter** | → merge into `Filters ▾` |
| Clear filters | Command | show **only when a filter is active** |
| Views ▾ | Setting / saved-state bundle | keep at right edge |
| Protect dates (toggle) | View/interaction state | rename **Lock dates**; keep visible |
| ? legend | Setting / reference | → Help ▾ menu |

## 3. Target information architecture

Adjusted for one reality: the app is **one timeline view + overlays**
(Dashboard, People, Clients, project page). Timeline and Dashboard are real
views; People/Clients are editor overlays, not persistent areas — so the shell
should be honest about that, not present overlays as peer "areas."

```
APPLICATION BAR (global nav · utilities · status)
TWOSEVEN │ Timeline ⇄ Dashboard │ Resources ▾ · Print ▾ · Help ▾ · Settings ▾ ── + New Project · REV · sync

TIMELINE TOOLBAR (frequent actions on the current timeline)
Today │ [Day 2-Day Week Month] · Color by: Project ▾ · View ▾ │ Search · Filters ▾ │ Lock dates · Views ▾
```

No eyebrow labels — grouping is carried by separators + spacing (the native
way). Menus and toolbar deliberately overlap: **menu = discoverability,
toolbar = speed, keyboard = experts** (this is Design-Language §6's existing
three-path rule, so menu items keep their shortcut keys shown).

Menus introduced:

- **View ▾** — Density →, Color by → *(also inline)*, Vivid months.
- **Resources ▾** — People & Availability, Clients.
- **Help ▾** — Keyboard shortcuts, Legend (folds in `?`), About / version.

Net shape: **Option A's visible clusters, minus the eyebrows, plus Option B's
menus for the low-frequency controls, plus a real application bar.**

## 4. Decisions (locked 2026-08-27)

- **Scale stays visible.** Day/2-Day/Week/Month remain a visible segmented
  control (keeps the D/W/+/− keys and one-click speed from the B3 zoom brief).
  Only Density, Vivid, and Color-by relocate to menus/dropdown. *(Rejected: a
  single `View ▾` swallowing the scale — taxes the most-touched control, the
  cost Option B was flagged for.)*
- **Light navigation.** Timeline ⇄ Dashboard read as the two primary views
  (Dashboard already carries an `.active` state). People & Availability +
  Clients group under **Resources ▾**. *(Rejected: full `Timeline | Dashboard
  | People | Clients` peer tabs — dishonest, since People/Clients are editor
  overlays, not standalone areas.)*

## 5. Phases (agreed steps)

Each phase is one REV in the single `index.html` (+ its doc/test), shipped to
`/preview/` on `development` with before/after screenshots for the owner before
promotion to `main`. Hold each phase until the previous is seen live.

1. **De-taxonomize (pure win, backs out what was flagged).** Remove the
   `Where`/`Style`/`Filter` eyebrows (keep separators). Rename **Protect dates
   → Lock dates**. Visual-weight pass: New Project the only accent, scale a
   true segmented control, secondary controls neutral. Behavior unchanged.
2. **View ▾ menu.** Move Density + Vivid into `View ▾`; add `Color by: Project
   ▾`. Scale stays visible. Retire the Settings→Density alias (its gate has
   already fired — TODO §7).
3. **Filters ▾.** Merge Status + Person into one `Filters ▾` with a
   `Filters (2)` count and removable chips (`Status: Active ×`); Clear appears
   only when a filter is active. Search stays out, visible.
4. **Application-bar cleanup.** Split Settings (People/Clients → Resources ▾;
   true settings stay). Timeline ⇄ Dashboard as the two views. Fold `?` legend
   into Help ▾.
5. *(optional)* `‹ Today ›` prev/next stepping — net-new controls, only if
   wanted.

## 6. Artifacts to update alongside the code

- **`Design-Language.md` §2.6** — rewrite the REV88 Where/Style/Filter rule to
  the no-eyebrow, menu-assisted model above. (§3 keeps the `--fs-micro` eyebrow
  token; it's just no longer used on the timeline toolbar.)
- **`test88`** — currently asserts the eyebrow labels + cluster reading order;
  rewrite to the new layout. Behavior guards (`test-b3-zoom`, `test-b5`,
  `test-c1-color`, `test-c3-status`, `test-goto`, `test-v4-views`,
  `test-quiet`) must keep passing — controls move, behavior does not.
- Preserve the **three-path rule** (§6) and **Escape unwinds one layer**
  (already test-guarded) as controls move into menus.
- A **milestone note** per phase in `docs/Milestones/`.

## 7. Risk & rollback

- **Zero shared-infrastructure risk.** This is client-only chrome — no
  SharePoint List schema, Entra, Graph scope, or colleague-app surface is
  touched. The CLAUDE.md danger zone is not in play.
- Each phase is a self-contained REV; `git revert` per phase.
- The single-file app means all changes land in `index.html`; the test suite
  and `/preview/` on `development` are the safety net before `main`.
