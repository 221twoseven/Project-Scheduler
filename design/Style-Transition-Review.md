# Style transition review — Timeline vs. the TwoSeven Application Style Guide

**2026-09-27 · review only, nothing implemented · target: `TwoSeven-Application-Style-Guide.md` v1.0 · baseline: `Design-Language.md` v1.0 + `Style-Guide.md` (as shipped, v1.23.0)**

The owner's direction (2026-09-27): retire the "not a SaaS dashboard / everything feels
drafted" mentality and move the UI toward conventional enterprise application styling,
decidedly away from a bespoke feel. Frictionless adoption is the goal. The new guide is
the design foundation for the portal and every app, set **before** more apps are built.

This file lists every place the established styling differs from the new guide, the
issues the transition raises, and the decisions the owner has to make before code lands
on `development`.

---

## 1. First, the boundary the new guide draws

The new guide governs **shared chrome and conventional business screens** and explicitly
leaves **Timeline's specialized schedule and colour rules** to `Design-Language.md`
(guide §1, §3, §5, checklist). Everything below sorts each difference into one of two
zones, so "enterprise styling app-wide" has a concrete meaning:

| Zone | What it covers in Timeline today | Governed by |
|---|---|---|
| **Chrome** — adopts the new guide | Toolbar (both rows), menus/popovers, modals, toasts, tooltips, coach marks, the project-page dock and its forms, the edit popover, the Company Data pages (People, Clients, Settings, Open Issues, Release notes), My Dashboard trail bar and dock, the sidebar **header and footer** (lens toggle, sort controls) | New guide |
| **Canvas** — preserved as data encoding | Gantt rows, bars, pills on bars, markers, Today/deadline/holiday, weekend hatch, quiet/Vivid month tints, the date header, the sidebar **rows** (they are the Gantt's row gutter and share `--row-h`), the project-page preview/calendar, legend swatches, print sheets | `Design-Language.md` §2, §7 |

Where the guide's rule and the canvas conflict (mono dates, uppercase month names,
fixed row heights, per-status pill hues), the canvas keeps its rule and the chrome adopts
the new one. This boundary needs the owner's sign-off — it is the single decision most
of the rest depends on.

---

## 2. What already agrees (no change)

- Page canvas `#F5F7FA`, sidebar `#EDF1F7`, text `#1B2537`, action `#2F6FE4` / hover
  `#1D5AC9` — identical to `--paper`, `--side`, `--txt`, `--acc`, `--acc-deep`.
- The dark header gradient `#2A3850 → #202C41` — the v1.0.2 mellowed bar, unchanged.
- Bahnschrift → Segoe UI sans; Cascadia Mono; the Brauer Neue wordmark.
- 4px spacing unit; 6px control radius; 1.5px-stroke 16px outline icons.
- Table rows 44 / 56 / 32px — the guide adopted Timeline's density trio.
- "No dashboard cards, no metric tiles" — matches Design-Language §7.6.
- Clients carry no colour; project/department colours, install red, forecast grey, status
  patterns and opacity preserved (guide §3, §7).
- Read-first record + explicit **Edit**; empty state carries the permitted action; hide
  restricted chrome rather than disable it; every mutation confirms briefly (toast).
- "Never ship a link that silently does nothing" = the affordance rule.
- `prefers-reduced-motion` honoured; blue = interaction/selection.

---

## 3. Where the established styling differs

Format: **Established → Target**, then the note. Zone in brackets.

### 3.1 Voice and intent

- **Design-Language §1 "shop drawing, not a SaaS dashboard; everything should feel
  drafted" → the guide's five rules (stable orientation, obvious next action, detail
  before decoration, reveal complexity when relevant, one shared record).** The guide
  *keeps* the shop-drawing feel (dark title block, quiet surface, scannable) but drops
  the bespoke framing. §1 is rewritten to the five rules; "mono is a brand asset" and
  "hairlined, deliberate, not decorated" go.
- **"The app teaches the backward-scheduling model at every opportunity" → no
  equivalent.** Keep as Timeline copy guidance, not a suite rule.

### 3.2 Suite geography (the biggest structural gap) [chrome]

| Established | Target |
|---|---|
| No portal; the wordmark button goes to the Timeline home | Portal with stable app cards + recent work; wordmark → portal (already proposed in `Style-Guide.md` §10.4) |
| Two-row dark toolbar, 46px each (92px), menu-bar model: Color by ▾ · View ▾ · Filters ▾ · Help ▾ · New Project | Global header, **one row, ≥56px**: wordmark · app name (14px/600) · app switcher · account control. App-specific controls move to a **page action area** under the header ("filters directly above the content they affect") |
| App eyebrow `.tb-app`: 11px uppercase `.2em` `#8CA0BF` | Header app name: 14px/600 sentence case, `#EDF3FC` |
| No app switcher; Company Data, Open Issues, Settings live under Help ▾ / the timeline row | Anchored compact **app switcher** menu; People and Clients are separate apps (D8) |
| No app-nav sidebar; the 300px sidebar is the project list (canvas) | **168px left app-nav** on desktop for the app's sections. Timeline has one section (+ My Dashboard) — see issue 5 |
| Breadcrumb trail bar + **×** exit + Esc walks home (§7.5–7.6) | Record title + horizontal **tabs**; "Back to clients" **link**; ordinary history |
| Routes are `location.hash=` assignments from buttons (16 sites, 0 `href="#/…"` anchors); no per-record URLs | "Use real links for destinations so open-in-new-tab, history and deep links work"; a navigation link must be an `<a>` |
| Project page: bottom dock, four side-by-side columns, autosave, footer `Delete · Mark complete · Done` | Record panel: identity header · summary properties · tab strip · body; explicit Save/Cancel for multi-field editing (established autosave may stay **with visible saving/saved/failed states**) |
| Company Data: 56% list · detail `dl`, no tabs, Edit swaps the pane | People: compact directory table + detail panel with tabs (Overview, Assignments, Administration, Activity). Clients: ~215px index · record pane with tabs (Overview, Contacts, Projects, Financials, Activity), 3px leading rule on the selected client |
| Trail bar reads `N records · SharePoint` | "Keep list names, endpoint details and integration mechanics out of ordinary flows" — `N records` plus a freshness message only where it matters |

### 3.3 Colour tokens [chrome; canvas keeps its own]

| Token | Established | Target | Note |
|---|---|---|---|
| line | `--side-line #C9D4E3`, `#E2E8F0`, `#EDF2F7`, `#F1F5F9`, `#CBD6E4`, `#D8E2EF`, `#DAE2ED`, `#DDE5EF` | `line #CBD5E3` | Eight hairlines collapse to one |
| control-line | inputs `#E2E8F0` / `#DDE5EF` (1.2–1.3:1 on white) | `#7C8BA0` (3.5:1) | Every input border darkens — the guide's explicit rule that pale dividers are not input boundaries |
| muted | `--txt-dim #8B99AD` (2.7:1), `--txt-micro #93A2B8` (2.3:1), `#94A3B8` (2.6:1), `#7488A3` (3.6:1), `#A3B1C4` (2.2:1), `#B4C0D0` (1.8:1) | `muted #596B81` (5.1–5.5:1) | The 16-step grey ramp (Style-Guide §2.3) collapses to `text` + `muted`; six greys fail the guide's 4.5:1 |
| soft | `#F7FAFD`, `#FAFBFC`, `#FBFDFF` | `soft #F8FAFD` | Consolidates |
| selected | `#EDF3FA` + `inset 2px var(--acc)` | `selected #EAF2FF` + 3px leading rule | Near match |
| link | none (inherit + underline, or `--acc`) | `link #245FC9`; focus ring uses **link**, not action | New token |
| success | `#1A7F4E/#DCF3E6`, `#1AA59C`, `#0F6E56/#E1F5EE`, sync `#7BD8A0` | `#236847 / #EAF4EE` | One pair |
| warning | `#8F5E08/#FCEEC8`, `#B7791F`, `--warn #F0A814` | `#895B11 / #FFF4DB` | One pair. **`--warn` is also the toggle-on colour** (Lock dates, Pin) — an "on" state is interaction, so it becomes blue |
| danger | `#CE4242`, `#EF4444/#FECACA/#FEF2F2`, `#B91C1C/#FDE2E2`, `--late #DC2626` | `#B42318 / #FFF0EE` | Chrome errors and destructive controls take the new pair; `#CE4242` stays **on install/shipping bars only**; `--late` stays on Today; `#EF4444` retires |
| header text / separator | `rgba(255,255,255,.9)` / `#8CA0BF` / `--chrome-line #3A4A66` | `#EDF3FC` / `#576882` | Note `#8CA0BF` is 4.4:1 on the bar's top colour — just under |
| dark theme | none — `:root` is light only | full paired palette, `color-scheme` | See issue 2 |

**Status pills.** Established: a hue per status (design purple, fabrication teal, on-hold
orange, estimating violet). Target: green and amber *supplement written statuses*,
neutral carries the rest. Proposal: canvas pills (on bars, meeting sheet) are preserved
as data encoding; **tables and records** use neutral chips with words, `success` for
Complete, `warning` for On Hold. Owner to confirm.

**Shadows.** Established resting shadows on the toolbar, the timeline header
(`0 3px 8px`), edge indicators, the empty state, and bars. Target: none at rest; one
floating shadow `0 8px 28px #101B2C40` for menus, popovers, dialogs (replaces six
variants). The bar shadow is canvas; the rest go.

**Gradients.** Only the header — already true.

**`Style-Guide.md` §10.3 per-app hue `--app` — withdrawn.** The guide says "do not assign
decorative identity colours to each app or client". App identity is the header app name
and the switcher.

### 3.4 Typography [chrome]

| Established | Target |
|---|---|
| Scale 15 / 13 / 11.5 / 11 / **9** | 22 (page title) / 17 (record) / 15 (app card) / 14 (header app name) / 13 (section, body) / 12 (controls, table body, secondary) / 11 (metadata) — **nothing below 11; `--fs-micro` 9px retires** |
| The micro-caps label — 11px (or 9px) **700 uppercase `.07–.16em`** on every section head, form label, column header, eyebrow, meta key, `dt` | **Sentence case**; section heading 13px/600; metadata 11px/400–500. Spaced uppercase reserved for the wordmark and "very short grouping labels" |
| Weights 700 for headings/pills/chips, 800 role tag and print title | 600 maximum for headings; 400–600 for controls |
| Line-height 1.4 prose, 1 chips | 1.45 body, 1.4 metadata; "let text wrap rather than fixed heights" |
| **Mono for anything on a work order — job codes, dates, day counts, version, keys** | Mono for cost codes, identifiers, compact technical values; **names, descriptions and long dates in sans**; **tabular numerals** for aligned amounts and numeric columns |
| Sans stack includes `-apple-system, BlinkMacSystemFont, 'Helvetica Neue'`; mono leads with `ui-monospace` | `Bahnschrift, "Segoe UI", Arial, sans-serif` · `"Cascadia Mono", Consolas, monospace` |

The canvas keeps mono dates and uppercase month names. Chrome tables (Company Data,
agenda, changelog, meeting sheet dates?) move to sans + `font-variant-numeric:
tabular-nums`. The meeting sheet is a print artifact — owner call.

### 3.5 Spacing, geometry, density [chrome]

| Element | Established | Target |
|---|---|---|
| Spacing scale | 4 / 8 / 12 / 16 / 24 | 4 / 8 / 12 / 16 / **20** / 24 / **32 / 40 / 48** |
| Header | 46px rows | ≥56px, 16–20px side padding |
| Main content padding | 22×26, 18×26, 12×22 (varies) | 24px (16 narrow) |
| Panel padding | 8–15px | 20px (16 narrow) |
| Button height | `.t-btn` 28 · segmented 26 · `.ins-btn` ~27 · `.npv-btn` ~22 · `.sbf-btn` ~25 · `.btn` ~32 | **min 32px**, 12px side padding, 12px/500 text |
| Input height | `.fg` ~33 · `.ins-f` ~31 · `.cd-tools` ~28 | **min 36px**, 10–12px side padding |
| Table row / cell | Company Data rows ~34px, 14px cells | 44px default, 12px cells |
| Status chip | `2px 8px`, radius 9 | `3px 6px`, radius **4** |
| Radii | `--r-s 5 · --r-m 8 · --r-l 14`; working 6/7/9/10/11; pills 9–20 | chips 4 · controls 6 · cards/records 8 · dialogs 10; "no oversized pill buttons" |
| Borders | 1px, but 1.5px on the sidebar edge, modal inputs, `.tb-menu`, coach card, empty state | 1px |
| Hit targets | ≥24px (Design-Language §4) | ≥32px desktop where feasible, 44px coarse pointer |
| Dialog width | 470 default; 560 / 680 / 720 / 880 / 1150 | ~440 for a focused task; full page for lengthy editors |

### 3.6 Components [chrome]

- **Buttons.** Established: primary / ghost (`#F1F5F9` fill, no border) / del (red text +
  pink border) / flat toolbar / outlined small. Target: Primary / **Secondary = panel fill
  + visible border + ink text** / Quiet / Destructive = red text. `.btn-ghost` becomes a
  bordered secondary; disabled = muted text on `soft` with `line` border, not opacity.
- **Focus ring.** `2px var(--acc)` offset 1 → `2px link` offset 2; on a blue button a
  ring in the text colour, offset 3.
- **Fields.** Two variants (`.fg` modal, `.ins-f` inspector) → one Field: label above
  (sentence case), helper below, `control-line` border, 36px. **Required-field
  convention** — none today; add and explain once. Validation beside the field
  (today: red border + toast).
- **Tabs** — no component today (`.tog-grp`, `.npv-modes` are toggles). New primitive:
  2px blue underline, semibold, scrollable strip.
- **Tables.** Soft header, thin rules, explicit sort with direction (none today),
  right-aligned amounts, preserve filters/position on return (`#/people/:id` lands
  without selecting — already ledgered), rows expose a named link/button (today: a
  clickable `div`).
- **Feedback states.** Empty vs no-results are one `.cd-empty` today → two: **No people
  match "…"** + clear, **No clients yet** + add. Loading / access-denied / unsaved-edits
  states are not designed.
- **Toggle switches** (`.lock-tog`, `.pin-row`, custom track + amber thumb) → standard
  switch or checkbox, blue when on.
- **Dialogs.** Trap focus and restore it on close — **not implemented** (no trap in the
  source). Scrim `rgba(8,15,26,.5)` + `blur(3px)`: blur is decorative; drop.
- **Icons.** Unicode remnants (`▸ ▾ ⋯ ✓ × ›`) → the outline SVG family; icon-only
  controls need names + tooltips and a ≥32px hit area (sidebar eye/edit/grip are 24).
- **Print header block, meeting sheet** — unchanged (report artifacts).

### 3.7 Interaction [mixed]

- **The three-path rule** (pointer · right-click · keyboard) and **"right-click only
  adds"** on the project page (REV61: editors carry no add buttons) vs. the guide's
  "make the next action obvious; one dominant action per task area" and "a state-changing
  action must be a button". Right-click-only creation is the most bespoke pattern in the
  app and the one most at odds with frictionless adoption. The guide preserves
  "scheduling interactions", so this is an **owner decision** (issue 6), not a rule
  violation.
- Esc walks home from Company Data; × exits — bespoke; replaced by Back links and tabs.
- Double-click rename, drag/edge-resize, date-bar drag-zoom — canvas accelerators; the
  guide's requirement is only that a visible equivalent exists (Design-Language §6
  already demands click-editable equivalents).
- Undo toasts, one-menu-at-a-time, Escape-one-layer, hover tooltips after 400ms — keep.
- Autosave on the project page — allowed, but its saving/saved/failed state must be
  visible **at the record**, not only in the toolbar sync pill.

### 3.8 Responsive [chrome]

Established breakpoints 1400 / 1250 / 1100 / 900 / 820 / 560 and a fixed, non-scrolling
desktop layout (`overflow:hidden`, fixed px offsets, no coarse-pointer support). Target:
900 / 650 breakpoints, test at 1366 / 1024 / 768 / 390, 44px targets on coarse pointers,
"support zoom and text growth". The Gantt is desktop-only by nature; the chrome and the
Company Data pages are not, and today they are not usable at 390px.

---

## 4. Issues with the transition

1. **Contrast is the first casualty.** Adopting the 4.5:1 text rule retires six greys in
   daily use (§3.3) and the pale input borders. Mechanical but touches every form, label
   and hint. Canvas text on quiet backgrounds (header day numbers at
   `rgba(10,25,50,.45)`) also fails; that is canvas and needs a separate ruling.
2. **Dark mode is not a token flip for Timeline.** The stylesheet holds ~24 recurring
   literals and hundreds of one-off hex values and `#fff` panels (Style-Guide §1.1, §2);
   bars, pills and tints assume a light canvas. Recommendation: Timeline ships
   **light-only**; new apps may ship dark once each primitive is validated (the guide
   itself says so). Do not promise dark in the portal until then.
3. **Fixed geometry is wired to the toolbar.** `#main{top:92px}`, `#page{top:50px}`,
   `#dash-bar`, `.tb-menu{top:32px}`, header 64px, all in px; a 56px header plus a page
   action row changes every offset, and several suites assert them. Budget test updates
   with each shell PR (see 4).
4. **Source-regex tests break on restyle.** `test-v171` (font stack), `test46` (density
   drift), `test-quiet`, `test-c3-status` (pill colours), `test-b4` (markers),
   `test-contrast` (palette), `test-b5`, `test-cb` and others read the CSS as text. Each
   restyle PR carries its test edits; the full run is 10–15 min and also runs the
   reference build (new checks need the SKIP guard).
5. **Two sidebars.** The guide's 168px app-nav rail plus Timeline's 300px project list is
   two rails. Timeline has one section (+ My Dashboard); People/Clients become separate
   apps (D8). Recommendation: a single-section app omits the rail and uses the header
   switcher — record it as a shared exception in the guide, not a Timeline one-off.
6. **Right-click-only creation vs. obvious next action (owner decision).** Reversing
   REV61 (visible **+ Add** buttons in the phase editor and agenda, right-click kept as
   the accelerator) is the change with the highest adoption payoff and the most history.
7. **Font licence and public serving.** `design/fonts/BrNStdBd.otf` is served from a
   public repository and a public Pages site; the guide says "do not distribute licensed
   font files without the appropriate rights". The 2026-09-01 record says "licence
   confirmed by the owner" — confirm that covers **web embedding from a public origin**,
   or move the wordmark to an SVG asset.
8. **Tabular numerals.** Verify Bahnschrift honours `font-variant-numeric: tabular-nums`
   (and what Segoe UI / Arial do on the fallback path) before relying on aligned amounts.
9. **Permissions are a data problem the guide makes explicit.** §8: hiding a tab is not
   authorization; restricted values must not reach an unauthorized browser. Today every
   signed-in browser loads the whole Staff list (phones, e-mails, personal notes) and the
   viewer role is "workflow protection, not security" (Design-Language §7.6). A People
   app with Administration/HR content **cannot be built to this guide** until D3 / item 27
   (tiered lists, restricted record) land. The restyle is not blocked; the People app's
   sensitive tabs are.
10. **Routing.** Real anchors, per-record URLs, browser history and open-in-new-tab
    contradict the hash-assignment-from-buttons model. Not a CSS change; a routing
    pass on the Company Data pages first (they graduate to apps).
11. **One versioned token source (guide §11) = D4.** The guide rules out "five diverging
    copies of shared" — so D4 option (a) one file / (b) vendored `common.css` per app
    needs a version number and a single origin. The deploy guard already checks
    `href`, so a missing `common.css` fails the build. Each app subpath still needs its
    own Entra redirect URI (owner action; never changed without instruction).
12. **Naming.** `Style-Guide.md` (Timeline as shipped) now sits beside
    `TwoSeven-Application-Style-Guide.md` (the target). Keep the first as the **as-built
    inventory / migration checklist** with a status banner (added), and treat its §1.1
    proposed names as superseded by `--ts-*`.
13. **Chip and pill radii change the look of the most visible small elements** (sync
    pill 20 → 4, status pills 9 → 4, sidebar chips 8 → 4). Cheap, but it is the change
    people will notice first — ship it with the header, not alone.
14. **"Done" as the project page's primary** is an exit, not a verb the guide would
    accept ("Save changes", "Close"). With autosave, the honest label is **Close**.

---

## 5. Decisions needed before implementation

| # | Decision | Recommendation |
|---|---|---|
| D-A | The chrome/canvas boundary in §1 | Adopt as written |
| D-B | Timeline: single-section app, no left rail; app switcher in the header | Yes; record as a suite exception |
| D-C | Reverse REV61 — visible add buttons on the project page | Yes; right-click stays as accelerator |
| D-D | Status chips in tables: neutral + words, success = Complete, warning = On Hold; canvas pills unchanged | Adopt |
| D-E | Timeline light-only; dark deferred | Adopt |
| D-F | Mono scope: identifiers and compact values; dates in sans in chrome tables; canvas keeps mono dates | Adopt; meeting sheet stays as is |
| D-G | Toggle-on colour amber → blue | Adopt |
| D-H | Font licence covers public web serving | Owner confirms, or wordmark → SVG |
| D-I | D4 (shared stylesheet mechanism) and where `--ts-*` tokens live | `:root` in Timeline now (aliasing `--acc: var(--ts-action)` etc.), extracted to a versioned `common.css` when the second app starts |

---

## 6. Suggested implementation order (for `development`)

Each step is one PR with screenshots on `/preview/` and its test edits; each gets a
milestone record. No `APP_VER` bump until a step changes something the team sees (all of
them do — one line each in `CHANGELOG.md`).

1. **Tokens.** Add the `--ts-*` set to `:root`; alias the legacy tokens to them; retire
   the six failing greys and the pale input borders by pointing them at `muted` and
   `control-line`. Contrast test extended to chrome text. *(Largest diff, least visible.)*
2. **Type.** Sentence-case the micro-caps labels; drop `--fs-micro`; section heads
   13/600, metadata 11/500; weights 700 → 600 in chrome. Mono scope per D-F.
3. **Controls.** Button and Field primitives at 32/36px, 4px chips, 1px borders, one
   floating shadow, new focus ring, switches per D-G. Modal focus trap.
4. **Header.** One 56px global header (wordmark · app name · switcher · account); the
   timeline row becomes the page action area under it; fixed offsets re-derived from
   one CSS variable. *(Highest test churn.)*
5. **Company Data → guide §7 pages.** Directory table (44px rows, sort, empty vs
   no-results), record panel with tabs, Back links, real anchors and per-record URLs.
   This is also the graduation path for People and Clients (D8).
6. **Project page.** Add buttons (D-C), saving state at the record, "Close", tabs in the
   dock if the owner wants them (the dock itself is a Timeline-specific editor and may
   stay).
7. **Design-Language.md rewrite** — §1 to the five rules, §2.6 / §3 / §4 / §5 / §6
   / §7.5–7.6 amended to reference the guide; `Style-Guide.md` re-cut as the as-built
   inventory of what remains canvas-only.
