# Shop Timeline — Design Language

**Version 1.0 · August 12, 2026 · applies to `index.html` (REV52+)**

A lightweight design system for the Project Scheduler. Written to be implementable in a single-file, no-build vanilla app: everything here is a CSS custom property, a constant, or a rule of thumb — no tooling required. It extends what the app already does right (the drawing-title-block toolbar, red-means-install, visible undo) rather than replacing it.

How to use it: when a change touches appearance or interaction, check the relevant section. If the change contradicts this doc, either follow the doc or update the doc in the same PR — never silently diverge.

---

## 1. Voice & feel

**The metaphor is a shop drawing, not a SaaS dashboard.** Dark title block up top, precise light drawing area below, mono type for codes and numbers, sans for prose. Everything on the canvas should feel drafted — aligned, hairlined, deliberate — not decorated.

Copy rules: plain sentences, no developer vocabulary in anything a user can see ("Couldn't reach SharePoint," never `endpoints_resolution_error`). Buttons are verbs ("Print timeline"), toggles state their effect on hover. The app teaches the backward-scheduling model at every opportunity ("the schedule builds itself backward from the deadline").

---

## 2. Color

### 2.1 Roles — the one-job rule

Each visual channel encodes exactly one thing:

| Channel | Encodes | Never encodes |
|---|---|---|
| **Bar hue** | Identity (project; department in Team/project-page modes) | Status, urgency |
| **Bar pattern & opacity** | Status | Identity |
| **Status pill** | Status (text + tint) | — |
| **Red `#CE4242`** | Installation only (existing rule — keep absolute) | Anything else; late-ness uses the marker system, not bar color |
| **Canvas background** | Calendar time (workday/weekend/month), *quietly* | Data of any kind |

Consequences: on-hold bars keep their **project's hue** and signal status by treatment — on-hold = 55% desaturation + diagonal hatch; estimating keeps its current stripe (it already follows the rule). The gray/gold hue-theft overrides are retired.

**The one exception (v1.2.1, owner rule 2026-08-31): forecast projects are uncolored.** A penciled-in job renders `FORECAST_GREY #6B7484` everywhere it draws — bars (summary and task, in both color modes, install bars included), sidebar dot, dashed outline — on top of its existing 40% opacity + dashed-edge treatment. Its palette slot stays reserved, so no other project's color moves when the status firms up and the hue returns.

### 2.2 Identity palette (projects)

12 slots, assigned by **stable hash of project id** (never array index). Hues spaced ≥25° apart, and — **owner rule, Phase 3.5 (2026-08-26): bar text is always white.** Every slot sits below the luminance where `labelColor()` (§2.5) would flip to ink, so white passes 4.5:1 on all of them. The light slots of the original palette were darkened to comply — same hues, lower lightness (the pre-3.5 values are in git history).

```
--p01:#2B73CF  --p02:#BE531B  --p03:#268449  --p04:#9050C3
--p05:#148079  --p06:#936E12  --p07:#C04485  --p08:#567693
--p09:#7A5AE0  --p10:#357C92  --p11:#A8642C  --p12:#5E7D34
```

(01–07 keep the hues of the original `PCOLS` for continuity; 08–12 extend the cycle. None approach `#CE4242` red. `--p08` is the darkened pm blue from §2.3 — the original `#5B7C99` sits in the mid-luminance dead zone and fails 4.5:1 both ways.) Collision rule: if two *currently visible* projects hash to the same slot, the later-created one shifts to the nearest free slot for that render — identity stability beats palette purity only when both are on screen.

**Clients carry no color (decided 2026-08-21, N3).** Identity color belongs to the
*project*, full stop. The shop runs 3–4 big clients with many simultaneous job codes
each — coloring by client would make concurrent same-client projects
indistinguishable, and a client accent beside the project hue would add a second
color language (against §2.1's one-job rule). `ShopTimeline_Clients` stores name and
alias only; revisit only if the client mix changes fundamentally.

### 2.3 Department palette

Keep the `DEPT_COLORS` hues as-is (staff know them), but the Phase 3.5 white-text rule (§2.2) applies here too: every department color sits below the ink-flip luminance so labels are always white at 4.5:1. The light entries (the golds, pinks, teals and the grey "other" family) were darkened to comply, hues kept — `beamsaw` `#936E12` and `electrical` `#876511` stay a distinct pair; `pm` `#5B7C99` → `#567693` and `install` `#6366F1` → `#5A5DEC` (the originals sit in the mid-luminance dead zone where *neither* ink nor white reaches 4.5:1). No department except `install`/`laser` sits within 15° of the reserved red.

**Subtask shading (REV56):** on the project page, subtasks render as a **light shade of
their parent bar's hue** — same hue, ~45% toward white (`kidShade()`); only lightness
separates child from parent, on the Gantt and the calendar bands alike. Labels on shaded
fills still route through `labelColor()` (§2.5).

### 2.4 Canvas (the quiet calendar)

Default ("Quiet" — new): workdays `#FCFDFE`; weekends/holidays `#EEF1F5` with the existing hatch at 40% of current opacity; month boundary = 1px `#C9D4E3` hairline + month label; alternating months get at most `hsl(h, 6%, 97%)` — perceptible side by side, invisible behind bars. Today column: `rgba(47,111,228,.06)` full-height wash + 2px `--late` line + the TODAY pill.

The current saturated month-band look remains available behind the existing **Tint** toggle (relabel: "Vivid months"), preserving continuity for users who navigate by it.

**Vivid shows the month colour uninterrupted (v1.0.2, owner objective 13):** weekend/holiday
columns paint no grey strips or hatch in Vivid — on the main timeline and project Gantt the
overlays are hidden, and on the project calendar weekend cells take the month tint like
weekdays. Quiet mode keeps the grey weekend treatment above; at Day/2-Day zoom the date
header still marks weekends in both modes.

Month **header** bands may keep a stronger version of their hue (they're outside the data area), but capped at the header: `hsl(h, 30%, 88%)` fill with `hsl(h, 35%, 30%)` text rather than today's mid-saturation fills.

### 2.5 Text on color — the label function

One function, used everywhere a label sits on a colored fill:

```js
function labelColor(bg){ /* relative luminance per WCAG */
  const L = relLum(bg) + 0.05;
  /* whichever of ink/white contrasts more against the fill */
  return L * L >= 1.05 * (relLum(INK) + 0.05) ? 'var(--ink)' : '#FFFFFF';
}
```

(An earlier draft used a fixed `L > 0.44` threshold; that maps mid-luminance fills like `#D9A21B` to white at ~2.3:1, contradicting the 4.5:1 rule below, so the shipped function compares the two candidates' actual contrast instead. `L*L ≥ 1.05·(L_ink+0.05)` is the algebraic form of "ink's contrast ≥ white's contrast".)

Since Phase 3.5 the identity and department palettes are constrained below the ink-flip
luminance (§2.2), so on **bars** this function always lands on white — the function
stays as the single adjudicator for everything else it already covers (white edge
chips, pills, the project page's light subtask shades).

No hand-picked per-bar text colors. Pills use the same rule. A jsdom test (`tests/test-contrast.js`) iterates every palette constant and asserts ≥4.5:1 — the palette can't regress.

### 2.6 Chrome (toolbar & sidebar)

Existing tokens are good — codify them as the only chrome colors:
`--ink #0D131D`, `--ink-2 #141C29`, `--chrome-line #3A4A66`, accent `--acc #2F6FE4` / `--acc-deep #1D5AC9`, warn `--warn #F0A814`, danger `--late #DC2626`, sidebar `--side #EDF1F7` / `--side-line #C9D4E3`, paper `--paper #F5F7FA`. New UI must draw from these; no ad-hoc hex in new code (a grep-able rule a reviewer can enforce).

**My Dashboard is its own place (v1.2.0, owner objective 1):** mechanically it stays
the Departments lens + person filter, but it presents like a page — a project-style
trail bar (`All Projects › My Dashboard · name`, × exit) fixed under the toolbar, the
sidebar lens toggles replaced by a "My Dashboard" label, no collapse affordances (all
assigned phases paint flat), and the summary dock carrying the same collapse chevron
as the project page's dock (its own persisted key). Exits: the crumb, the ×, or
anything that clears the person filter.

**The mellowed bar (v1.0.2, owner objective 12):** the toolbar no longer paints the
near-black ink gradient — it owns a soft slate-navy pair, `#2A3850 → #202C41`, with a
`#141D2C` bottom edge and a lighter shadow. `--ink`/`--ink-2` keep their original values
(they also serve text and the `labelColor()` ink candidate); `--chrome-line` was lifted
to `#3A4A66` to stay visible on the lighter bar. Secondary bar text (`.tb-app`, the
version pill, the search placeholder) sits at `#8CA0BF`, button text at
`rgba(255,255,255,.9)` — all ≥4.5:1 on the new fills.

**Toolbar grouping rule (native direction — supersedes the REV88 eyebrow model;
see `Toolbar-Native-Direction.md`):** every row-2 control sits with the question
it answers, in reading order — position (Today / go to date) · view (zoom scale ·
**Color by ▾** · **View ▾**) · filter (search · **Filters ▾** · active chips · Clear).
Status, client and person share one **Filters ▾** menu; each active constraint
shows as a removable chip beside the button, the button carries a count
(`Filters (2)`), and **Clear** appears only while a filter is on. The client
picker lists only clients that have a project on the board, never the whole
Clients master.
**Separators and spacing carry the grouping — no eyebrow labels** (the category
names are for maintainers, not printed in the UI; the shell relies on familiar
controls rather than teaching users the app's taxonomy). **Views** is the named
bundle of the whole row, so it sits at the right edge, beside **Lock dates** (an
editing guard, not a view) and the `?` legend. Weight is reserved: **New
Project** is the one accent; standalone toolbar buttons sit flat (transparent at
rest, lit on hover); the segmented scale group keeps a frame; an active view/nav
state stays lit. A new control joins the cluster whose question it answers; a
control that answers none goes to the edge. Single-choice and low-frequency view
controls belong in menus, not standing buttons: **row height** (density) and
**month shading** (Vivid) live in the **View ▾** menu, and the colour lens is a
**Color by: X ▾** dropdown — only the mutually-exclusive zoom scale stays a
visible segmented control (it is the most-touched, with D/W/+/− keys).

---

## 3. Typography

Families stay: `--sans` (Segoe UI stack) for prose/labels, `--mono` (Cascadia stack) for codes, dates, numbers, REV chips. Mono is a brand asset here — anything that would appear on a work order (job codes, dates, day counts) is mono.

**Scale — four working sizes + one micro:**

| Token | Size / weight | Use |
|---|---|---|
| `--fs-title` | 15px / 700 | Overlay titles, project page name |
| `--fs-body` | 13px / 400–600 | Default text, inputs, menus |
| `--fs-label` | 11.5px / 500 | Buttons, sidebar rows, pills |
| `--fs-fine` | 11px / 500 | Dates in bars, axis day numbers, meta strips |
| `--fs-micro` | 9px / 700 caps, tracked | **Decorative only** — section eyebrows (SORT, COLOR, SCHEDULE), REV chip. Never information a user must read. |

Rule: nothing informational below 11px. The current 8.5–10px toolbar/mini labels move up to `--fs-fine` or become tooltips. Line-height 1.4 for prose, 1 for chips/pills. Letter-spacing (.14–.24em) is reserved for the micro eyebrow style and the brand block.

---

## 4. Space, shape, elevation

- **Spacing unit 4px.** Gaps and paddings are multiples: 4/8/12/16/24. (Most of the app is already close; drift no further.)
- **Radii:** keep tokens `--r-s 5px` (chips, pills), `--r-m 8px` (buttons, inputs, bars), `--r-l 14px` (overlays, cards). Bars use `--r-m` ends.
- **Hairlines** for structure (1px, `--side-line` on light / `--chrome-line` on dark); **shadows only for things that float** (menus, overlays, drag ghosts): `0 4px 18px rgba(13,19,29,.18)`. Nothing at rest casts a shadow except the toolbar.
- **Row heights:** three densities — **Comfortable 56px / Snug 44px / Compact 32px** (token `--row-h`). Bars stay 32px tall at Comfortable and Snug (only the gutter tightens, 24px → 12px); Compact drops the bar to 24px (gutter 8px). *Owner ruling 2026-08-26 (REV78, superseding both the original 44/32 spec and the interim 56/44): Comfortable keeps the pre-B5 default, the old spec values become Snug and Compact.* All hit targets ≥ 24px even in Compact.

---

## 5. Iconography

Inline SVG, 16×16 viewBox, 1.5px stroke, `currentColor` — pasted literally into the HTML (no build step, no font, no external file). Replace the unicode set: print ⎙, settings ⚙, reset ⟲, expand ⇕, eye, drag-dots, plus chevrons and the row-edge indicators from the audit. One style: outlined, geometric, drafting-instrument feel. Never mix emoji/unicode glyphs with SVG in the same surface.

---

## 6. Interaction patterns

**The three-path rule.** Every action is reachable three ways: pointer (visible button/menu), context menu (right-click), keyboard (shortcut shown in the menu). The project page already lives by this; it becomes app-wide law. Anything drag-only (bar move/resize, OOO ranges) gets a click-editable equivalent (inspector fields or popover with date inputs).

**Click hierarchy on the timeline.** Single **left-click on a bar opens its edit-details modal** — the primary read/edit path. **Departments-lens exception (v1.3.0, owner objective 08-31/5): there a phase click navigates to the project edit page instead** — the inspector is the edit surface; the modal stays the Projects-lens path. Drag moves; edge-drag resizes; right-click opens the context menu. Disambiguation: the modal opens on mouse-up only if total pointer travel is under ~3px; any real drag suppresses it. Click on empty canvas deselects; double-click on empty canvas is reserved (no action yet — don't spend it casually; the **project calendar** spent its own in v1.1.0 — see the calendar rules under N11 below). Double-click on a phase bar on the **main timeline** stays unbound (single-click already opens the modal, and the verb stays reserved). On the **project pages**, double-click a phase/subtask **title** to rename it in place (owner request 2026-08-27 — this binds the project-page double-click the earlier ruling had reserved; see the edit-popover amendment under N11 below).

**Click hierarchy on the project page (N11).** The two buttons never overlap in meaning: **left-click only selects and edits** (a bar selects into the inspector — on a draft, opens its popover; empty canvas deselects), and **right-click only adds** — every context menu on the chart offers add-new actions (subtask, event, task) seeded with the clicked day. *(The inline name field this originally described is retired — see the edit-popover amendment below; a New action now opens the popover on the fresh item.)* Opening either surface closes the other, and right-click no longer changes the selection. Rename, duplicate and delete live in the inspector (with R and Del as the keyboard paths) — destructive and edit actions deliberately have **no context-menu path on this chart**; the right-click is reserved for creation. The calendar follows the same rule (this supersedes REV53's left-click create menu on empty cells). Calendar phase bands also **drag to move and resize from edge handles** (REV71/72) — same 3px click/drag disambiguation, workday snap and Protect-dates lock as the Gantt; merged "+N" bands move and resize as one, and a handle only exists on a band segment holding the phase's true start/end (a week-clipped edge is not grabbable). **A resize follows the pointer live (v1.1.0, owner objective 9):** the grabbed edge tracks the mouse px-for-px (clamped to its week row) while the REV83 day tint and tooltip show the snapped result, and the full-day snap still owns the outcome on release. Only the grabbed segment stretches live — a multi-week phase's other rows redraw on release. **Double-click on blank calendar space creates a phase (v1.1.0, owner objective 7):** it opens the "Add a phase" department picker at the pointer (a phase needs a department — the same list the right-click menu offers), seeded with that day; the fresh phase arrives selected with its edit popover open on the name field. This spends the reserved blank-space double-click on the calendar only — the Gantt's stays reserved. Checkpoint/task bands carry the Gantt diamonds' verbs: drag moves, click opens the edit popover (see amendment below), right-click deletes. **The calendar collapses each phase by default (REV84):** one band per phase (the +N roster merge intact); left-clicking a phase band selects it — opening the bottom phase editor — and brings that phase's subtask bands into view; deselecting collapses them again. This expansion follows the selection only and is independent of the Gantt's ▸ expand state. **On the calendar, blank space never deselects (v1.0.3, owner revision of obj 8):** the expanded phase persists — a blank click only dismisses an open popover/menu — and the phase collapses when its **parent band** is clicked a second time (the department's first bar, the REV56 positional parent). Re-clicking a selected *subtask* band just reopens its editor. Esc, the breadcrumb and the × still peel the selection as before; the Gantt keeps its empty-canvas deselect. **Phases multi-expand (v1.0.4, second owner revision):** expansion is its own per-phase state (`NPV_CAL_OPEN`), not a shadow of the selection — clicking another phase expands it *without* collapsing the first, any number can be open at once, deselecting collapses nothing, and creating/duplicating a subtask expands its phase on both surfaces. The reset is a **Collapse all** button in the legend bar against the right margin (calendar mode only). The calendar's expansion stays independent of the Gantt's ▸ state.

**Edit-in-place popover (owner request, 2026-08-27).** The N11 split above is refined, not replaced — right-click still only adds, left-click still selects — and **editing** now happens in **one edit-in-place popover** shared by all four item types (phase, subtask, checkpoint, task) on both the Gantt and the calendar. Right-click keeps its limited add menu and does *not* open the popover; the popover is the left-click / double-click editor.

- **Left-click** an item opens the popover anchored to it (the primary edit path) *and* keeps driving the bottom inspector. The two carry the same fields and the same data and share one commit path, so an edit made in either surface reads back in both — the popover is the timeline's portable copy of the dock (§7.5), now on the saved page too, not only on drafts.
- **Right-click → New subtask/checkpoint/task** stays a plain quick-add through the same limited menu as before (undo toast intact) — a subtask selects into the inspector, a checkpoint/task lands in the agenda. The old inline name field is retired (it was overwritten by the next menu press); name the new item afterward with a left-click (popover) or a double-click. Right-click does **not** open the editor. *(An interim build opened the popover on New-X — "create, then edit"; the owner asked for the plain limited menu back, 2026-08-28.)*
- **Double-click a phase or subtask title** (Gantt gutter or calendar band) renames it in place, Explorer-style — Enter or blur commits, Esc cancels. This binds the project-page double-click the 2026-08-27 ruling had reserved.
- Opening the add menu closes the popover and vice-versa (the N11 "either surface closes the other" rule, now covering the popover). The popover dismisses on Esc (one layer, ahead of the selection in the unwind order), outside-click, or scroll, and layers above the toolbar so a top-clamped tall popover keeps its own header and close control. It carries **no add buttons** (REV61 below still holds) and a Delete; Duplicate and Pin stay inspector-only to keep it compact.

**REV61 amendment (owner decision, 2026-08-20):** the left-click editors carry **no add buttons** — the +Subtask/+Event/+Task buttons were removed from the phase inspector and the draft popover as duplicates of the context menu. Creation on the chart is context-menu + keyboard (S/E/T); the agenda section's own +Event/+Task buttons remain as the visible-pointer path for dated items. This is a deliberate exception to §6's three-path rule for subtask creation: two paths, not three. "Who" sits on its own line above Start/End/Days on both surfaces and is always a picker fed by the people list — never free text.

**Bar resize works from both edges.** Each bar has a grab zone at its start *and* end: minimum 8px hit width (grows to 12px below 60px bar width, at which point the zones are the bar's outer thirds), `ew-resize` cursor, and a visible handle affordance on hover (2px inset rule at each edge in the label color at 40% opacity). Left edge edits the start date, right edge the end date; both snap to workdays, respect Protect dates, and show a live date tooltip while dragging. Undo toast on release, like every mutation.

**Bars are free after birth (owner decision, 2026-08-25).** The scheduler chain exists only at project creation: `generateSchedule` lays phases back-to-back from the deadline, and from then on bars are independent — no stored dependencies, no ripple, no warning when phases overlap or invert. This is deliberate. Half the shop's jobs are multi-site rollouts where design, fabrication and finishing run in tandem for months on rolling chunk handoffs; the overlap amount is unpredictable and differs per job, so a dependency model would be wrong the day after it was drawn. Overlap therefore has **no scheduler setting**: the strict chain is a starting layout that PMs sculpt into tandem by hand (drag, both-edge resize, inspector date fields). Chunk/site pipelines are drawn with the subtask model — parallel subtasks outside the parent window are real data, not errors. Do not add rippling, dependency links, or overlap knobs without a new owner decision.

**Feedback.** Every mutation: optimistic apply + toast with **Undo** (existing pattern — never ship a mutation without it). Sync state stays in the pill; error toasts dock bottom-right, collapse duplicates, and cap at 3 visible with a counter.

**Menus.** Right-click menus list shortcut keys right-aligned in mono. Escape unwinds exactly one layer (existing behavior — protect it in tests).

**Overlays.** One overlay at a time; dark scrim `rgba(13,19,29,.55)`; title at `--fs-title`; primary action bottom-right (accent), safe action to its left (neutral). Destructive actions are never the rightmost button and always name their object ("Delete project" not "Delete").

**Hover.** Bars: brightness lift + cursor hint; row-edge indicators appear on rows whose bars are off-viewport; controls show their one-sentence effect tooltip after 400ms.

**Motion.** 120–180ms ease-out for hover/menus, 240ms for overlays; `prefers-reduced-motion` already zeroes it — keep that.

---

## 7. The timeline, specifically

- **Bar anatomy:** [status pill][name · code][chips PM/D/F] left-aligned, ellipsis in that reverse order (chips drop first, then code, pill and name survive longest). Min renderable width shows pill only; below that, a 4px identity-colored tick.
- **Today** is the strongest line on the canvas. Deadline markers are per-project flags (▸ pennant at header + dotted drop-line at 60% opacity), visually distinct from Today and from install red.
- **Weekends/holidays** never disappear at any zoom; they compress.
- **Zoom** steps (shipped REV75, B3): **Day 40 / 2-Day 20 / Week 14 / Month 5 px per day** — Day and Week are the original Days/Weeks scales, unchanged, so those two steps render pixel-identical to pre-B3 builds. `D`/`W` jump straight to Day/Week, `+`/`−` step in and out, and the chosen step persists per user (in `UI_KEY`). All densities keep the bar-anatomy rules above; the axis header shows month names only at Month step, and day numbers on Mondays only at 2-Day.
- **Go to date** (shipped REV76, B3 navigation half): one small popover — a native date input plus quick picks (Today, +1 mo, +3 mo, Next install) — reached three ways per §6: the `G` key, a click on any month name in the axis header (pointer cursor + underline on hover), or the "Go to date…" entry in the `?` legend. Choosing a date centers it in the viewport, smooth unless `prefers-reduced-motion` (the T6 rule). The **Today button and `T` center today** the same way; the **default view parks today left-of-center to read forward** — on first load *and* whenever the app arrives at the timeline via routing (Done, the breadcrumb, Back), rather than the far-left earliest date a fresh render otherwise lands on (owner request, 2026-08-28). The popover rides the toolbar-menu machinery: one open at a time, Escape or outside click closes.
- **Legend:** a `?` popover (toolbar, right side) documents: status treatments, red = install, chip letters, marker shapes — plus the Go to date entry above. One screen, no scrolling.

---

## 7.5 The project page — inspector docks to the bottom

The Setup / Team / Departments / Agenda inspector is **not a sidebar**. It renders as a horizontal panel across the bottom of the window, underneath the project timeline — the title block of a shop drawing, in exactly the drawing-sheet spirit of the toolbar.

- **Layout:** chart takes the full window width and the majority of the height; the inspector panel sits below it as a fixed-height dock (target ~260–300px Comfortable, user-draggable divider, height persisted in localStorage like the old sidebar width was).
- **Inside the panel,** sections run **side by side as columns** — Setup | Team | Departments | Agenda — instead of stacked accordions. At full width all four are open at once; below ~1200px, Agenda wraps or the panel becomes horizontally scrollable with sticky section headers. No accordion collapse in the default state: the narrow rail forced that; the dock doesn't have to.
- **Selection still drives content:** nothing selected → project sections; a bar selected → that phase's fields occupy the panel (with a breadcrumb back to the project). Same rule as before, better stage for it.
- **The meta strip** (client · job · installs · days out · phases · agenda count) stays at the top of the page; the panel is for editing, the strip is for glancing. The breadcrumb trail sits on **its own bar above the strip**, separated by a hairline (owner request, REV84) — navigation and glance-numbers never share a bar. The bar's right edge carries an **× exit** (owner decision 2026-08-27, REV85), the fourth exit alongside Esc, Done, and the breadcrumb — same action as Done.
- **Footer = a project action bar** (owner handoff, 2026-08-28). The footer holds actions on the *current project*, grouped and separated by role: **left** carries passive status only — `✓ Changes saved`, muted text that reads as state, not a control; **right** carries the project actions, weakest→strongest — **Delete project** (subdued destructive: transparent, red only on hover, always confirms), **Mark complete** (neutral secondary workflow step), **Done** (the primary/accent control — it's the exit from editing and the most frequent action, so it outranks Mark complete). New-project drafts show Cancel (neutral) + Create project (primary) in the same right cluster. **Shortcuts left the footer** — keyboard help is application-level, so it lives in Help ▾ → Keyboard shortcuts (route-aware: the project page opens its own `pp-ks` sheet) and the `?` overlay. Governing rule: controls acting on the *application shell* do not sit in the project action bar.
- **Collapse toggle** (owner request, 2026-08-28): a chevron button collapses the form so the chart takes the whole window; the footer bar stays, so nothing is stranded. Because it acts on the interface container, not the project, it is **not a footer button** — it sits in its own fixed bordered area at the dock's bottom-right corner, outside the footer's button row, present in both states (chevron flips down→up). The state is persisted per user in `localStorage` (`shopTimelineDockCollapsed`, alongside the dock height) and restored on the next load, holding across login sessions. Applies to the Gantt and Calendar alike (the dock is shared). Edits still happen in the edit-in-place popover (§6) while collapsed.
- The edit-details modal (§6) and this panel share field components and layout rules — the modal is the timeline's portable version of the same inspector.

## 8. Print & Meeting Sheet

Print inherits the same tokens (the Quiet canvas is already print-friendly; vivid tints never print). Meeting Sheet stays the reference artifact: mono numerals, hairline rules, generous Notes column. Any new report copies its header block (TWOSEVEN — title · REV · printed date · count) verbatim.

---

## 9. Accessibility checklist (per PR that touches UI)

- [ ] Text on fills passes 4.5:1 (run the palette test)
- [ ] New action reachable by pointer, context menu, and keyboard
- [ ] Focus visible on every interactive element (`:focus-visible` token outline)
- [ ] Status readable with hue removed (pattern/pill carries it)
- [ ] Informational text ≥ 11px
- [ ] Hit targets ≥ 24px
- [ ] Toasts don't cover controls; errors offer an action

---

## 10. Implementation notes for a single-file app

- All tokens live in the existing `:root` block — extend it; components reference tokens only. A reviewer can `grep '#[0-9A-Fa-f]\{6\}'` new diffs for stray hex.
- JS constants that mirror CSS (`NPV_ROWH` etc.) already have a drift test — add `--row-h` and any new mirrored values to it.
- Ship the system as **CSS-first PRs** (tokens + one surface at a time), each with before/after screenshots on `/preview/`, each with a `docs/Milestones/` record. No big-bang restyle commit.
- Nothing in this doc requires SharePoint schema, auth, or dependency changes.
