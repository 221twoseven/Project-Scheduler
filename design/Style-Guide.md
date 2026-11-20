# Shop Timeline — Style Guide

**Version 1.0 · September 27, 2026 · describes `index.html` as shipped at v1.23.0**

> **Status (2026-09-27, later the same day):** this is the **as-built inventory**, not the
> direction. The direction is [`TwoSeven-Application-Style-Guide.md`](TwoSeven-Application-Style-Guide.md);
> the gap between the two is in [`Style-Transition-Review.md`](Style-Transition-Review.md).
> §1.1's proposed token names are superseded by the `--ts-*` set, and §10.3's per-product hue
> is **withdrawn** (the target guide assigns no identity colour per app). Use this file to
> find every value that has to migrate.

The **values and recipes** of the Timeline visual system, taken from the stylesheet and
the script constants as they run today — not as any earlier plan described them. Where
the code and `Design-Language.md` disagree, this file reports the code and says so.

**Two documents, two jobs:**

| | `Design-Language.md` | `Style-Guide.md` (this file) |
|---|---|---|
| Answers | *Why* — rules, owner rulings, interaction law | *What* — tokens, hex values, sizes, component CSS |
| Changes when | a decision is made | the stylesheet changes |
| Read by | anyone changing appearance or behaviour | anyone building a surface — in Timeline or another Systems product |

**Why it exists now.** Systems (owner, 2026-09-29, `TODO.md` §1) makes Timeline one of
four peer products — People, Clients, Office, Timeline — behind one portal, sharing one
visual language with per-product colour/icon identity (Phase 9). `TODO.md` §4 D4 (ruled
2026-09-28, refined 2026-09-29) is separate single-file products, one folder each under
one Pages site, sharing a vendored `common.css`. This file is the spec that `common.css`
will be cut from when the second product starts; until then a new surface **copies the
blocks in §1 and §7 verbatim** and follows the rules in §10.

---

## 0. Grep-able rules

Six checks a reviewer can run on any diff, in Timeline or another product:

1. **No new hex.** New CSS references a token (`var(--…)`) or a value already in §2. A
   reviewer greps the diff for `#[0-9A-Fa-f]{6}`.
2. **Bar text is white.** Every identity/department colour sits below the ink-flip
   luminance; `tests/test-contrast.js` asserts it. A new palette entry runs that test.
3. **Red is the end of a job.** `#CE4242` paints Installation and Shipping bars. The
   Today line uses `--late`. Nothing else is red unless it is an error or a destructive
   control (§2.5).
4. **Nothing informational under 11px.** `--fs-micro` (9px) is decorative eyebrows only.
5. **Hit targets ≥ 24px** in every density. (One recorded exception: the calendar's
   level-0 phase strip — Design-Language §6.)
6. **Mono for anything that would appear on a work order** — codes, dates, day counts,
   REV/version, keyboard keys.

---

## 1. Tokens — the `:root` block, verbatim

This is the whole token layer as it ships. Since v1.56.1 (item 85) it is split: `--sans`,
`--mono`, `color-scheme` and the `--ts-*` tokens live in `common/common.css`, which every
product loads; Timeline's own `:root` keeps the rest. A new product loads `common.css`
rather than copying them.

```css
:root{
  --sans:Bahnschrift,'Segoe UI',-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;
  --mono:ui-monospace,'Cascadia Mono','Segoe UI Mono',Consolas,'Roboto Mono',monospace;
  --ink:#0D131D; --ink-2:#141C29; --chrome-line:#3A4A66;
  /* v1.24.0: the suite tokens (TwoSeven-Application-Style-Guide.md §10) — light only */
  color-scheme:light;
  --ts-paper:#F5F7FA; --ts-panel:#FFFFFF; --ts-sidebar:#EDF1F7; --ts-soft:#F8FAFD;
  --ts-text:#1B2537; --ts-muted:#596B81; --ts-line:#C9D4E3; --ts-control-line:#7C8BA0;
  --ts-link:#245FC9; --ts-selected:#EAF2FF;
  --ts-action:#2F6FE4; --ts-action-hover:#1D5AC9; --ts-on-action:#FFFFFF;
  --ts-success-text:#236847; --ts-success-bg:#EAF4EE;
  --ts-warning-text:#895B11; --ts-warning-bg:#FFF4DB;
  --ts-danger-text:#B42318; --ts-danger-bg:#FFF0EE;
  --ts-header-start:#2A3850; --ts-header-end:#202C41; --ts-header-text:#EDF3FC; --ts-header-line:#576882;
  --ts-font:var(--sans); --ts-mono:var(--mono);
  --ts-space-1:4px; --ts-space-2:8px; --ts-space-3:12px; --ts-space-4:16px; --ts-space-5:20px;
  --ts-space-6:24px; --ts-space-8:32px; --ts-space-10:40px; --ts-space-12:48px;
  --ts-radius-chip:4px; --ts-radius-control:6px; --ts-radius-panel:8px; --ts-radius-dialog:10px;
  --ts-shadow-floating:0 4px 18px rgba(13,19,29,.18);
  --paper:var(--ts-paper); --side:var(--ts-sidebar); --side-line:var(--ts-line);
  --txt:var(--ts-text); --txt-dim:#8B99AD; --txt-micro:#93A2B8;
  --acc:var(--ts-action); --acc-deep:var(--ts-action-hover); --warn:#F0A814; --late:#DC2626;
  --r-s:5px; --r-m:8px; --r-l:14px;
  --fs-title:15px; --fs-body:13px; --fs-label:11.5px; --fs-fine:11px; --fs-micro:9px;
  --row-h:56px;
}
body.snug{--row-h:44px}
body.compact{--row-h:32px}

/* reset + the three global rules that ship with the tokens */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;overflow:hidden;font-family:var(--sans);font-size:var(--fs-body);color:var(--txt);background:var(--paper)}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{transition:none!important;animation:none!important}}
:focus-visible{outline:2px solid var(--acc);outline-offset:1px}
```

| Token | Value | Role |
|---|---|---|
| `--sans` | Bahnschrift → Segoe UI stack | Prose, labels, controls |
| `--mono` | Cascadia stack | Codes, dates, numbers, keys, version |
| `--ink` | `#0D131D` | Darkest text; the `labelColor()` ink candidate; print title rule |
| `--ink-2` | `#141C29` | Reserved dark (the toolbar no longer uses it — §2.1) |
| `--chrome-line` | `#3A4A66` | Hairlines and separators **on the dark toolbar** |
| `--ts-*` | see block | **v1.24.0** — the suite tokens from `TwoSeven-Application-Style-Guide.md` §10, verbatim (light only; `--ts-font`/`--ts-mono` alias the local stacks). Chrome migrates to these one surface at a time (§13) |
| `--ts-muted` | `#596B81` | Secondary chrome text: hints, section heads, eyebrows, empty states, close glyphs, panel dates/codes (5.1:1 on white) |
| `--ts-control-line` | `#7C8BA0` | Input boundaries (3.5:1 on white) — never a divider |
| `--paper` | `= --ts-paper #F5F7FA` | Page background, docks, footers |
| `--side` | `= --ts-sidebar #EDF1F7` | Sidebar fill, `kbd` fill, print sidebar |
| `--side-line` | `= --ts-line #C9D4E3` | Hairlines **on light surfaces**: sidebar edge, month lines, chips |
| `--txt` | `= --ts-text #1B2537` | Default body text |
| `--txt-dim` | `#8B99AD` | **Canvas only** since v1.24.0: sidebar-row sub-line. Chrome uses `--ts-muted` |
| `--txt-micro` | `#93A2B8` | **No consumers** since v1.24.0 (chrome eyebrows moved to `--ts-muted`); retire when the sidebar migrates |
| `--acc` | `= --ts-action #2F6FE4` | The one accent: primary button, selection ring, focus, active state |
| `--acc-deep` | `= --ts-action-hover #1D5AC9` | Accent hover/pressed |
| `--warn` | `#F0A814` | Toggle-on colour (Protect dates, Pin), busy state |
| `--late` | `#DC2626` | The Today line and TODAY pill |
| `--r-s / -m / -l` | 5 / 8 / 14px | Chips · buttons, inputs, bars · overlays, cards |
| `--fs-*` | 15 / 13 / 11.5 / 11 / 9px | Type scale (§3) |
| `--row-h` | 56 / 44 / 32px | Timeline row height per density (§5.4) |

### 1.1 Values that behave like tokens but are still literals

These recur across the sheet as raw hex. Another product should treat them as tokens; the
names below are **proposed** (not in `:root` today — promoting them is a one-line PR each).

| Proposed name | Value | Used for today |
|---|---|---|
| `--bar-top / --bar-bot` | `#2A3850` → `#202C41` | Toolbar gradient (top → bottom) |
| `--bar-edge` | `#141D2C` | Toolbar bottom edge |
| `--bar-txt-2` | `#8CA0BF` | Secondary toolbar text: app eyebrow, version, search placeholder |
| `--hair` | `#E2E8F0` | The most common light hairline (docks, trail bars, cards, inputs) |
| `--hair-2` | `#EDF2F7` | Lighter hairline inside panels (section heads, row dividers) |
| `--hair-3` | `#F1F5F9` | Faintest divider (modal footer rule, table rows); also ghost-button fill |
| `--edge` | `#CBD6E4` | Control borders on light (secondary buttons, menus, inputs, `kbd`) |
| `--field-line` | `#DDE5EF` | Inspector/popover input borders |
| `--card` | `#F7FAFD` | Boxed lists, preview headers, disabled field fill |
| `--field-bg` | `#FAFBFC` | Modal input fill at rest |
| `--dark` | `#101A29` | Tooltip and toast fill; modal heading ink |
| `--ink-3` | `#16202E` | Calendar month bar, marker outlines, strong headings |
| `--txt-2` | `#33415A` | Second-strongest text (values, pills, sidebar rows) |
| `--txt-3` | `#475569` | Buttons on light, menu items, list text |
| `--txt-4` | `#7488A3` | Section labels, sub-lines, breadcrumb links |
| `--txt-5` | `#94A3B8` | Placeholders, hints, empty states, muted headers |
| `--txt-6` | `#B4C0D0` | Disabled glyphs, close ×, separators |
| `--red` | `#CE4242` | Install/Shipping (`INSTALL_RED`), form errors, destructive hover |
| `--mark-ev` | `#F7C948` | Milestone diamond fill |
| `--mark-tk` | `#3B7FD6` | Note circle ring; `accent-color` on some checkboxes |
| `--ok` | `#1AA59C` | Positive glyphs (✓ driver, auto-schedule, available) |
| `--forecast` | `#6B7484` | `FORECAST_GREY` — penciled-in projects |

---

## 2. Colour

### 2.1 The dark chrome (toolbar)

The toolbar is the drawing's title block: the one dark surface, two rows of 46px.

| Element | Value |
|---|---|
| Fill | `linear-gradient(180deg,#2A3850,#202C41)` |
| Bottom edge · shadow | `1px solid #141D2C` · `0 2px 10px rgba(15,23,42,.3)` |
| Row separator (global/timeline rows) | `1px solid var(--chrome-line)` |
| Vertical separator `.t-sep` | 1 × 24px, `var(--chrome-line)` |
| Wordmark `TWOSEVEN INC.` | `#fff` |
| App eyebrow `.tb-app`, version `#tb-rev`, search placeholder | `#8CA0BF` |
| Button text at rest · hover | `rgba(255,255,255,.9)` · `#fff` |
| Button fill (framed) rest · hover | `rgba(255,255,255,.06)` border `rgba(255,255,255,.13)` · `rgba(255,255,255,.14)` |
| Standalone toolbar button (flat rule) | transparent at rest; hover `rgba(255,255,255,.12)` |
| Active state | `rgba(47,111,228,.32)`, border `rgba(96,150,240,.65)` |
| Search field | fill `rgba(255,255,255,.07)`; focus border `rgba(96,150,240,.7)`, fill `rgba(255,255,255,.1)` |
| Filter chip `.f-chip` | fill `rgba(47,111,228,.2)`, border `rgba(96,150,240,.45)`, text `#DCE8FF`; × `#AFC6EF` |
| Signed-in text | `rgba(255,255,255,.75)` |
| ADMIN chip · DEV chip `.tb-acc` | `#9DC1F2` / border `rgba(157,193,242,.4)` · `#D8B4F0` / `rgba(216,180,240,.45)` |
| Lock toggle track · thumb · on | `rgba(255,255,255,.12)` · `rgba(255,255,255,.45)` · track `rgba(240,168,20,.35)`, thumb `var(--warn)` |

**Sync pill** (`#sync-pill`, mono 11px, 24px tall, radius 20px):

| State | Text | Border | Fill |
|---|---|---|---|
| ok | `#7BD8A0` | `rgba(123,216,160,.3)` | `rgba(50,160,95,.12)` |
| busy | `#F7CE68` | `rgba(247,206,104,.3)` | `rgba(240,168,20,.1)` |
| err | `#FF9E9E` | `rgba(255,120,120,.35)` | `rgba(220,60,60,.14)` |

*Design-Language §2.6 lists the pre-v1.0.2 near-black bar; the values above are the
mellowed bar that ships.*

### 2.2 Light surfaces

| Surface | Fill | Edge |
|---|---|---|
| Page / dock / footer | `var(--paper)` | `#E2E8F0` |
| Sidebar | `var(--side)` | `1.5px var(--side-line)` right |
| Sidebar project row · hover | `#E3E9F2` · `#DBE3EF` | `#DAE2ED` |
| Sidebar phase row (child) | `#F2F5FA` | — |
| Sidebar group/department head · hover | `#D6DFEB` · `#CCD8E7` | `#C2CFDF` |
| Card / boxed list | `#F7FAFD` | `#D8E2EF` |
| Panel (white) | `#fff` | `#E2E8F0` |
| Canvas workday | `#FCFDFE` | row line `rgba(0,0,0,.05)` |
| Canvas weekend / holiday | `#EEF1F5` + 45° hatch `rgba(100,116,139,.044)` 4px/8px | — |
| Canvas past days (`.past-col`) | `rgba(148,163,184,.06)` over the day columns, under rows and bars | — |
| Department band (dept lens) | `rgba(87,104,127,.13)` | `rgba(0,0,0,.08)` |
| Trail bar (`#dash-bar`) | `#fff` | `#E2E8F0` |
| Selected list row `.cd-row.sel` | `#EDF3FA` + `inset 2px 0 0 var(--acc)` | hover `#F6F9FC` |
| Drop target | `rgba(47,111,228,.1–.12)` + `2px rgba(47,111,228,.35–.4)` outline, inset | — |
| Resize grip hover | `rgba(47,111,228,.3)` | — |

### 2.3 Text ramp on light

Strongest → faintest. Pick the nearest step; do not invent a new grey.

```
#0D131D  --ink          overlay/coach titles, print title rule
#101A29                 modal headings, modal input text
#16202E                 calendar month bar, page h2/h3, current breadcrumb
#1E293B                 dock/inspector text, menu items (strong)
#1B2537  --txt          default body
#33415A                 values, pills, sidebar rows, secondary buttons
#475569                 light buttons, menu rows, list labels
#5B6B84 / #5B6B85       breadcrumb links, preview footer, legend chips
#64748B                 form labels (modal), day numbers, chevrons
#596B81  --ts-muted     v1.24.0: ALL secondary chrome text — section heads, sub-lines,
                        dock subtitles, eyebrows, hints, placeholders, empty states,
                        meta-strip keys, dt labels, close ×, separators, kbd glyphs
#8B99AD  --txt-dim      canvas only: sidebar-row sub-line (codes, dates)
#93A2B8                 canvas only: sidebar-row assignment dates (--txt-micro is unused)
#94A3B8                 canvas only: project-page month axis, extra-row gutter, legend off-state
#B4C0D0                 canvas only: project-page day numbers
#CBD6E4                 disabled icons, grips
```

Retired from chrome in v1.24.0 (do not reintroduce — `tests/test-contrast.js` fails on
them outside the canvas selectors above): `#7488A3`, `#94A3B8`, `#A3B1C4`, `#B4C0D0`,
`#8194AB`, `var(--txt-dim)`, `var(--txt-micro)`. All were under 4.5:1 on white.

### 2.4 Semantic colours

| Meaning | Values |
|---|---|
| **Accent** (one job: "this is the action / the selection") | `--acc #2F6FE4`, hover `--acc-deep #1D5AC9`; focus ring `2px var(--acc)` offset 2px (the inspector v1.62.1, the dialogs v1.62.3); the faint field focus halo is retired everywhere; checkbox `accent-color` is `var(--acc)` in modals and `#3B7FD6` in the inspector/People page |
| **Warn / toggle-on** | `--warn #F0A814`; `.sb-chip.soon` `#FCEEC8` on `#8F5E08`; away `#B7791F`; pinned view `#B45309` |
| **Today** | `--late #DC2626` — the 2px line and TODAY pill only; header date `#C42B2B`; calendar today cell `#FFF3F3` with `inset 0 0 0 1.5px #CE4242` |
| **Late** (sidebar chip) | `.sb-chip.late` `#FDE2E2` on `#B91C1C` |
| **Stale** (sidebar chip, v1.48.0) | `.sb-chip.stale` `#EEF2F7` on `#475569`: a quiet nudge, not an alarm (no edits in `stale.days`, default 14) |
| **Completed** (sidebar tag, v1.37.0) | `.cd-perm.done` `#E6E9EE` on `#5B6472` (4.9:1); the row's name drops to `--ts-muted`, never red, no strike-through |
| **Positive** | `#1AA59C` (✓ glyphs, availability); `.md-tag` `#DCF3E6` on `#1A7F4E`; sync ok `#7BD8A0` |
| **Error text / invalid field** | `#CE4242` (text, `.ins-f input.err` border) |
| **Destructive control** | `.btn-del` text `--ts-danger-text`, border `--ts-line`, hover fill `--ts-danger-bg` (v1.62.3); `.ins-btn.dngr` text `--ts-danger-text`, border `--ts-line`, hover fill `--ts-danger-bg` (v1.62.1); row × hover `#CE4242` or `#EF4444` |
| **Forecast** | `#6B7484` everywhere a forecast project draws |

### 2.5 The reds — read this before using one

Three reds ship. Keep them to their jobs:

| Red | Job | Never |
|---|---|---|
| `#CE4242` `INSTALL_RED` | Installation and Shipping bars; form errors; destructive hover | a status, lateness, emphasis |
| `--late #DC2626` | The Today marker | anything else on the canvas |
| `#EF4444` | row-delete × on unmigrated surfaces (Tailwind red, pre-design-system; `.btn-del` left it in v1.62.3) | new surfaces — use `#CE4242` |

Another product needs at most two: `#CE4242` for errors and destructive actions, `--late`
only if it draws a Today marker.

### 2.6 Identity palette (projects) — `PCOLS`

12 slots, assigned by **stable hash of the record id** (`hashSlot()`), never by array
index. If two *visible* records collide, the later-created one shifts to the nearest
free slot for that render. Bar text on every slot is white at ≥ 4.5:1.

```
01 #2B73CF   02 #BE531B   03 #268449   04 #9050C3   05 #148079   06 #936E12
07 #C04485   08 #567693   09 #7A5AE0   10 #357C92   11 #A8642C   12 #5E7D34
```

`FORECAST_GREY #6B7484` replaces the slot colour while a project is a forecast; the slot
stays reserved. Clients carry no colour (Design-Language §2.2, N3).

**Sibling apps:** anything that lists Timeline projects paints them with this palette by
the same hash of the same id, so a job is the same colour in every app.

### 2.7 Department palette — `DEPT_COLORS`

Used in Team/department colour mode and on the project page. Text is always white.

| Group | Department (id) | Hex |
|---|---|---|
| Office | Project Management (`pm`) | `#567693` |
| | Technical Design (`td`) | `#9050C3` |
| | Other (Office) (`othoffice`, retired) | `#637590` |
| Digital Fab | CNC (`cnc`) | `#BE531B` |
| | Beamsaw (`beamsaw`) | `#936E12` |
| | 3D Printing (`3dprint`) | `#268449` |
| | Lasercutting (`laser`) | `#CE4242` |
| | Printing (`print`) | `#C04485` |
| | Other (Digital Fab) (`other`) | `#63758F` |
| Main Shop | Main Shop Fab (`fab`) | `#2B73CF` |
| | Other (Shop) (`othshop`) | `#6A7866` |
| Metal | Metal Shop (`metal`) | `#8B5E3C` |
| Unit 7 | Soft Goods (`softgoods`) | `#C0487B` |
| | Vinyl Application (`vinyl`) | `#D92871` |
| | Electrical (`electrical`) | `#876511` |
| | Other (Unit 7) (`othunit7`) | `#647590` |
| Finishing | Pre-Finishing (`prefinish`) | `#2F7E8C` |
| | Painting (`finish`) | `#148079` |
| | Other (Finishing) (`othfinish`) | `#657589` |
| Installation | Installation (`install`) | `#5A5DEC` |
| | Shipping (`shipping`) | `#5A5DEC` |
| Logistics | Logistics (`logistics`) | `#4E7D5B` |

(`laser` is the one department that shares the reserved red — a pre-existing choice the
Design-Language notes; Install/Shipping *bars* are painted `INSTALL_RED` regardless of
colour mode.)

**Subtask shade:** a child bar is its parent's hue moved 45% toward white —
`kidShade()`, below.

### 2.8 Status — pattern and opacity on the identity hue

| Status | Bar treatment | Pill (`.sum-pill` / `.mr-pill`) |
|---|---|---|
| Forecast | `opacity:.4`, `1.5px dashed` outline in the hue, colour → `#6B7484` | default pill |
| Estimating | `opacity:.74` + `.bar-stripe` (45° white `.22`, 5px/10px) | `#EEEDFE` on `#534AB7` |
| Design | — | `#EDE9FE` on `#5B21B6` |
| Fabrication | — | `#E1F5EE` on `#0F6E56` |
| On Hold | `opacity:.55` + hatch `rgba(255,255,255,.45)` 5px/11px | `#FFEDD5` on `#9A3412` |
| Complete | `opacity:.6`; pill text prefixed `✓ ` | `#F1F5F9` on `#475569` |
| Draft (unsaved) | — | `#EEF2F7` on `#33415A`, `1.5px dashed #94A3B8` outline |
| Default pill | — | `rgba(255,255,255,.9)` on `#33415A` |

Pill anatomy: mono, `--fs-fine`, 700, uppercase, `.06em`, `2px 8px`, radius 9px. Clients' `.st-pill` (v1.59.0) uses the same pills on a client's current projects.

### 2.9 Canvas — the quiet calendar and Vivid

`MONTH_HSL` (Jan → Dec, `[h,s,l]`):
`[214,40,57] [265,36,59] [145,40,46] [177,43,44] [25,66,54] [44,68,49] [11,60,57] [338,50,57] [79,36,43] [34,60,47] [208,26,51] [240,40,53]`

| Layer | Quiet (default) | Vivid (`body.vivid`) |
|---|---|---|
| Day cell | even month `#FCFDFE`, odd `hsl(h,6%,97%)` | `hsl(h, max(8,s/2)%, l+15%)`; alternate `hsl(h, max(6,s/2−5)%, l+21%)` |
| Weekend/holiday | `#EEF1F5` + hatch | hidden (month colour uninterrupted) |
| Month header | `hsl(h,30%,88%)` fill, `hsl(h,35%,30%)` text, right edge `rgba(13,19,29,.10)` | `hsl(h, .7s%, l−4%)` fill, white text with `0 1px 2px rgba(0,0,0,.15)` shadow |
| Month boundary | `1px var(--side-line)` | same |
| Header day text | `rgba(10,25,50,.45)` mono; weekend `rgba(0,0,0,.25)`; today `#C42B2B` 700 | same |
| Today | wash `rgba(47,111,228,.06)` + `2px solid var(--late)` + pill (mono 11/700/.1em, white on `--late`, radius 3) | same |
| Hover guide | `1px rgba(20,40,70,.35)`; tag `#28374E` fill, radius 4 | same |
| Deadline | `2px dotted rgba(13,19,29,.6)` + `▸` pennant in the project hue | same |
| Holiday pill | white on `#94A3B8`, TODAY-pill anatomy | same |
| Out-of-office | `repeating-linear-gradient(-45deg,#C3CBD7 0 5px,#DDE2EA 5px 10px)`, inset ring `rgba(90,105,125,.4)`, label `#5A6980` | same |
| Print | quiet forced: cells `#FCFDFE`, header `var(--side)` / `#33415A`, weekends `#EEF1F5` | never prints |

### 2.10 Text on colour — the two functions

```js
function relLum(hex){const n=parseInt(hex.slice(1),16),f=v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);};return .2126*f(n>>16&255)+.7152*f(n>>8&255)+.0722*f(n&255);}
function labelColor(bg){const L=relLum(bg)+.05;return L*L>=1.05*(relLum('#0D131D')+.05)?'var(--ink)':'#FFFFFF';}
function kidShade(hex){const n=parseInt(hex.slice(1),16),m=c=>Math.round(c+(255-c)*.45);
  return '#'+[(n>>16)&255,(n>>8)&255,n&255].map(c=>m(c).toString(16).padStart(2,'0')).join('');}
```

`labelColor()` is the single adjudicator for text on any coloured fill. Copy both
functions; do not hand-pick a text colour for a fill.

---

## 3. Typography

### 3.1 Families

| Token / face | Stack | Use |
|---|---|---|
| `--sans` | **Bahnschrift** (Windows, via `local()`), then Segoe UI → system sans | Everything prose: labels, controls, menus, body |
| `--mono` | ui-monospace → **Cascadia Mono** → Segoe UI Mono → Consolas → Roboto Mono | Codes, dates, numbers, day counts, keys, version, pills, sync pill |
| **Brauer Neue Std Bold** | `design/fonts/BrNStdBd.otf`, weight 800, `font-display:swap` — the one committed font file | **The wordmark only** (`TWOSEVEN INC.`) |

```css
/* the URL is relative to the page: the Systems page reads design/fonts/…, Timeline (in timeline/ since v1.56.0) ../design/fonts/… */
@font-face{font-family:'Brauer Neue';src:url('design/fonts/BrNStdBd.otf') format('opentype');font-weight:800;font-style:normal;font-display:swap}
.tb-co{font-family:'Brauer Neue',var(--sans);font-size:13px;font-weight:800;letter-spacing:.24em;color:#fff}
```

### 3.2 Scale

| Token | Size | Weight | Where |
|---|---|---|---|
| `--fs-title` | 15px | 700 | Modal `h3`, coach title, empty-state headline, print title |
| `--fs-body` | 13px | 400–600 | Body, modal inputs, buttons on light, coach body, menu text |
| `--fs-label` | 11.5px | 500–600 | Toolbar buttons, bar labels, legend rows, sub-lines |
| `--fs-fine` | 11px | 500–700 | Dates in bars, axis numbers, pills, chips, section heads, hints |
| `--fs-micro` | 9px | 700 caps, tracked | **Decorative only**: SORT/COLOR eyebrows, meta-strip keys, `dt` labels, preview title |

**Off-scale sizes in use** (inherited, not to be added to): `12px` and `12.5px` are the
de-facto "body-small" of menus, list rows, tooltips and toasts; `14px` breadcrumb links;
`14.5px` empty-state; `16–17px` page/record `h2`/`h3`; `18px` the × exit; `21px` the demo
preamble title only. Another product rounds these to `--fs-body` or `--fs-label` unless
copying a recipe verbatim.

### 3.3 Weight, leading, tracking

- **Weights in use:** 400 body · 450 phase/lane rows · 500 buttons · 600 labels, names,
  menu items · 700 headings, pills, chips, eyebrows · 800 wordmark, `role-tag`, print title.
- **Line-height:** 1.4 prose (coach, hints) · 1.55 tooltip/demo · 1 chips, pills, ×.
- **Letter-spacing ladder:** `.02–.04em` mono meta (version, dates) · `.05–.1em` small-caps
  labels, pills, section heads · `.13–.16em` eyebrows (`.npv-ttl`, `.lg-sec`, sidebar head)
  · `.2em` the app eyebrow · `.24em` the wordmark. Tracking is for caps only.

### 3.4 The micro-caps label (the most reused text style)

```css
/* section head / form label / column header — 11px unless noted */
font-size:var(--fs-fine);font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#7488A3
/* variants: #64748B (modal labels) · 9px + #A3B1C4 (meta keys, dt) */
```

**Retired on both docks (v1.62.1 project inspector, v1.62.2 My Dashboard; item 52 step 3):**
their column headings (`.ins-sec>h4`), field labels, Team role labels and department group
headings are no longer micro-caps — see 7.4. **And on the dialogs' field labels** (`.fg label`,
v1.62.3), which reach the Open Issues form too, **and on the menus' section labels** (`.sm-sec`,
the right-click header `.npv-menu .mh`, the Legend's `.lg-sec`; v1.62.4), **and on Open Issues'
column labels** (`.fb-colhd`, v1.62.5; item 52 step 5), **and on the settings pages' section
headings** (`.as-body h3`, v1.62.6).

---

## 4. Brand

| Asset | Spec |
|---|---|
| **Wordmark** `.ts-brand` | `TWOSEVEN INC.` — Brauer Neue Std Bold 13px, `.24em`, white on the chrome, a hairline divider (`--ts-header-line`) after it. Since v1.57.0 a link to the Systems page (`common/common.css`). |
| **Product name** `.ts-app` | 12px, uppercase, `.12em`, `#B7C7DF`, right of the wordmark. **This is where an app says its name** (`Timeline`). In Timeline it is the `<button>` home to the full timeline; shown at every width. Was the 11px `.tb-app` eyebrow, `Shop Timeline`, hidden ≤ 1400px, until v1.57.0. |
| **Mark** | `icons/favicon.svg` — the "2-7" monogram, one filled path, 500×323 viewBox, currentColor-able. |
| **Undo / redo marks** | `icons/undo-rm.svg`, `icons/redo-rm.svg` — the monogram with a curved arrow, used in the toolbar. |
| **Version pill** `#tb-rev` | mono 11px, `.04em`, `#8CA0BF` — reads `v1.23.0`; every app shows its own `APP_VER` here. |
| **Print header block** | `TWOSEVEN INC. — title · REV · printed date · count`, `2px solid var(--ink)` rule beneath; copied verbatim onto every report. |

---

## 5. Space, shape, elevation, layers

### 5.1 Spacing

Unit **4px**: 4 / 8 / 12 / 16 / 24. Fixed structural heights:

| Element | Height |
|---|---|
| Toolbar row | 46px min (two rows → `#main{top:92px}`; project/Company Data pages sit at `top:50px` under the global row alone) |
| Toolbar button · segmented button | 28px · 26px |
| Sidebar head · timeline header (two 32px rows) | 64px |
| Sidebar width (default) | 300px, drag-resizable |
| Project-page preview row (`NPV_ROWH`) | 34px; preview bar 24px |
| Bottom dock | user-dragged, persisted; collapsed 45px |
| Menu item · list row padding | `6px 8px` · `7px 14px` |
| Modal heading · body · footer padding | `22px 24px 12px` · `3px 24px 4px` · `14px 24px` |

### 5.2 Radii

Tokens `--r-s 5` (chips, pills, date inputs) · `--r-m 8` (cards, `.job-bar.summary`) ·
`--r-l 14` (coach card, empty state). In practice: 6px is the working radius for
toolbar buttons, inspector and modal inputs, `.btn`, secondary buttons and `.job-bar`; 10px the
dialogs (`.modal`, v1.62.3, the wireframes' dialog radius); 9–10px menus, popovers, tooltip, toast; 20px the sync pill; 50% dots. New work
uses the three tokens for cards, chips and overlays, and **6px for controls** — the
shipped norm for buttons, inputs and bars.

### 5.3 Elevation — shadows only for things that float

| Layer | Shadow |
|---|---|
| Toolbar (the one resting shadow) | `0 2px 10px rgba(15,23,42,.3)` |
| Timeline header | `0 3px 8px rgba(15,30,55,.12)` |
| Bar at rest · hover | `inset 0 1px 0 rgba(255,255,255,.28), 0 1px 4px rgba(10,25,50,.18), 0 0 0 1px rgba(0,0,0,.07)` · `… 0 4px 12px rgba(10,25,50,.26) …` |
| Drag ghost | `0 8px 24px rgba(0,0,0,.28)` + `2px rgba(255,255,255,.5)` outline |
| Menu (`.tb-menu`) | `0 10px 30px rgba(15,23,42,.18)` |
| Context menu (`.npv-menu`) | `0 10px 30px -8px rgba(15,23,42,.3)` |
| Popover (`.npv-pop`) | `0 12px 34px -8px rgba(15,23,42,.34)` |
| Tooltip | `0 10px 32px rgba(0,0,0,.32)` |
| Toast | `0 8px 28px rgba(0,0,0,.35)` |
| Modal | `0 28px 90px rgba(5,15,30,.3)` |
| Coach card | `0 10px 30px rgba(15,23,42,.25)` |
| Empty state | `0 6px 24px rgba(20,40,70,.08)` |
| Selection ring (bar/band) | `0 0 0 2px #fff, 0 0 0 4px var(--acc)` |

Scrims: modal overlay `rgba(8,15,26,.5)`, no blur since v1.62.3 (the style guide lets the decorative blur go); coach spotlight
`rgba(13,19,29,.55)` (a 9999px box-shadow around the hole).

### 5.4 Density

| Density | `--row-h` | Bar | Pad (each side) | Lane gap |
|---|---|---|---|---|
| Comfortable (default) | 56px | 32 | 12 | 6 |
| Snug (`body.snug`) | 44px | 32 | 6 | 6 |
| Compact (`body.compact`) | 32px | 24 | 4 | 4 |

`DENSITIES` in the script mirrors the CSS; `tests/test46.js` asserts they stay in step.
Compact tightens leading (`line-height:1.1`) but nothing informational drops below 11px.

### 5.5 z-index ladder

```
0      canvas backgrounds (.bg-col, tints)      1   weekend cols, month lines, past wash (.past-col)
2      rows                                     5   deadline flags, holiday pills
6      today line                               7-8 hover guide + tag
9      #page (project / Company Data pages)     10  bars · #sidebar
11     hovered bar                              12  bar handles, edge indicators
13     tick nodes                               20  #me-dock
30     resize grips                             45  .npv-menu (context menu)
50     drag ghost                               60  #dash-bar (trail bar)
100    #toolbar                                 120 .npv-pop (edit popover)
200    .overlay (modals)                        900 .tb-menu (toolbar menus)
950    #coach                                   999 #tooltip
1000   #toasts
```

The project-page Gantt (`#npv-body`) is its own stacking context (`isolation:isolate`), with
its own ladder: tint −1 · rows auto (never their own layer) · envelope 1 · bars 2 ·
selected and dragged bar 3, hover crosshair 3 (later in the page, so on top) · Today,
deadline 4 · notes, holiday pills 5 · milestones 6 · **name column 8** · reorder drop line 9. Nothing the chart draws outranks the name
column (item 83, `tests/test-v1541.js`).

### 5.6 Breakpoints

| ≤ width | Change |
|---|---|
| 1400px | Toolbar buttons tighten (`0 8px`, 11px), app eyebrow hides, brand padding 12px |
| 1250px | Department checklist 3 columns |
| 1100px | Toolbar separators hide |
| 900px | Company Data master/detail stacks; department checklist 2 columns |
| 820px | Role grid 2 columns |
| 560px | Two/three-column form grids collapse to one |

### 5.7 Motion

- Hover, colour, chevron, menu: **120–180ms** (`.12s` buttons, `.14s` inputs, `.15–.18s`
  bars and rows, `.16–.18s` toggles).
- Toast in: `.22s ease-out` rise 8px; toast out `.3s` fade + 6px drop.
- Modal in: `.18s ease-out` (8px rise, `scale(.985)`). Coach hole/card: `.18s ease-out`.
- Zoom step about Today: ~180ms.
- `prefers-reduced-motion: reduce` zeroes every transition and animation (global rule in §1).

---

## 6. Iconography

- **Inline SVG**, `viewBox="0 0 16 16"`, `fill="none"`, `stroke="currentColor"`,
  `stroke-width="1.5"`, round caps and joins. Pasted literally — no icon font, no build.
- Sizes: `.ico` 16×16 (`vertical-align:-3px`) · `.ico-s` 12×12 · `.ico.arw` 17.6×8 (the
  custom wide arrow).
- The view-as `<select>` chevron is the same 16-grid path as a data-URI background:
  `M4.5 6 8 9.5 11.5 6`.
- **Committed files:** `icons/favicon.svg`, `icons/undo-rm.svg`, `icons/redo-rm.svg`.
- **Unicode still in service** (inherited, keep consistent, don't add): `▸` deadline
  pennant and legend caret, `▾` menu/level caret, `⋯` right-click hint on hovered bars,
  `✓` complete/driver, `×` close, `›` breadcrumb separator. Never mix emoji with SVG on
  one surface.
- **Marker glyphs:** milestone = 12px square rotated 45°, `#F7C948` fill, `2px #16202E`
  border; note = 10px circle, white fill, `2px #3B7FD6` ring (a highlighted note rings
  `#CE4242`). Legend/menu swatches reuse the same rules at 9–11px.

---

## 7. Component recipes

CSS as shipped, trimmed to the essentials. Class names are Timeline's; another product may
rename but must keep the values.

### 7.1 Toolbar button (dark)

```css
.t-btn{display:inline-flex;align-items:center;justify-content:center;gap:4px;height:28px;
  background:rgba(255,255,255,.06);color:rgba(255,255,255,.9);border:1px solid rgba(255,255,255,.13);
  border-radius:6px;padding:0 12px;font-size:var(--fs-label);font-weight:500;cursor:pointer;
  font-family:inherit;transition:background .12s,color .12s;white-space:nowrap}
.t-btn:hover{background:rgba(255,255,255,.14);color:#fff}
.t-btn.active{background:rgba(47,111,228,.32);border-color:rgba(96,150,240,.65);color:#fff}
.t-btn.accent{background:var(--acc);border-color:var(--acc);color:#fff;font-weight:600}
.t-btn.accent:hover{background:var(--acc-deep)}
/* flat rule: standalone toolbar buttons are transparent at rest */
.tb-row>.t-btn:not(.accent):not(.active){background:transparent;border-color:transparent}
.tb-row>.t-btn:not(.accent):not(.active):hover{background:rgba(255,255,255,.12);color:#fff}
/* segmented group */
.tog-grp{display:flex;border:1px solid rgba(255,255,255,.13);border-radius:6px;overflow:hidden}
.tog-grp .t-btn{border:none;border-right:1px solid rgba(255,255,255,.1);border-radius:0;height:26px;padding:0 12px}
.tog-grp .t-btn:last-child{border-right:none}
.t-sep{width:1px;height:24px;background:var(--chrome-line)}
```

Weight rule: one accent button per bar (New Project); active view/nav states lit; every
other standalone button flat.

### 7.2 Toolbar search (dark input)

```css
#t-search{flex:1 1 90px;min-width:70px;max-width:230px;height:28px;background:rgba(255,255,255,.07);
  border:1px solid rgba(255,255,255,.13);border-radius:6px;color:#fff;font:inherit;font-size:12px;padding:0 8px;outline:none}
#t-search::placeholder{color:#8CA0BF}
#t-search:focus{border-color:rgba(96,150,240,.7);background:rgba(255,255,255,.1)}
```

### 7.3 Buttons on light

```css
/* v1.62.3 (item 52 step 3): a plain .btn and .btn-ghost are the white secondary button; .btn-primary
   the blue fill; .btn-del red text. Hovers skip :disabled. Dialogs, the project page footer, Open Issues. */
.btn{min-height:32px;padding:0 12px;font-size:12px;font-weight:600;border-radius:var(--ts-radius-control);border:1px solid var(--ts-line);
  background:#fff;color:var(--ts-text);cursor:pointer;font-family:inherit}
.btn:hover:not(:disabled){border-color:var(--acc);color:var(--acc)}
.btn-primary{background:var(--ts-action);border-color:var(--ts-action);color:var(--ts-on-action)}   /* hover --ts-action-hover */
.btn-del{color:var(--ts-danger-text)}   .btn-del:hover:not(:disabled){background:var(--ts-danger-bg);border-color:var(--ts-danger-text)}
.btn:disabled{opacity:.5;cursor:default}
/* secondary button (inspector, preview, sidebar footer) — v1.62.1: 32px, the wireframes' recipe */
.ins-btn{background:#fff;border:1px solid var(--ts-line);border-radius:var(--ts-radius-control);padding:0 12px;min-height:32px;font-size:12px;font-weight:600;
  color:var(--ts-text);cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:6px}
.ins-btn:hover{border-color:var(--acc);color:var(--acc)}
.ins-btn.dngr{color:var(--ts-danger-text);border-color:var(--ts-line)}  .ins-btn.dngr:hover{background:var(--ts-danger-bg);border-color:var(--ts-danger-text)}
/* icon toggles that wear .ins-btn (#pp-dock-toggle, #pp-clog-toggle, #md-collapse) set min-height:0 and keep their 27px */
.ins-hd .x{/* the inspector's Close: the same recipe */min-height:32px;padding:0 12px;font-size:12px;border:1px solid var(--ts-line)}
```

Footer order (weakest → strongest, left → right): passive status text · Delete (subdued)
· neutral step · **primary**. Destructive is never rightmost and always names its object.

**Note with one action** (v1.42.0, Project Schedule's "Bar is held by … — Hand over from today"):
a muted `.ins-note` sentence that states the mismatch and names both sides, followed by one
small `.ins-btn` that fixes it. Nothing changes until the click. The button is at least 24px
high (Design-Language §9).

```css
.ins-depts .idr .dhand{flex-basis:100%;margin:2px 0 4px 22px;display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px}
.ins-depts .idr .dhand .ins-btn{padding:4px 8px;min-height:24px}
```

### 7.4 Form field

```css
/* modal field — v1.62.3 (item 52 step 3): the inspector's field below, with 17px dialog titles */
.modal{border:1px solid var(--ts-line);border-radius:10px;box-shadow:0 4px 18px rgba(13,19,29,.18)}
.modal h3{font-size:17px;line-height:1.3;font-weight:600;color:var(--ts-text);padding:20px 24px 12px}
.fg{margin-bottom:12px}
.fg label{display:block;font-size:12px;line-height:1.45;font-weight:500;color:var(--ts-muted);margin-bottom:4px}
.fg input,.fg select,.fg textarea{width:100%;min-height:36px;border:1px solid var(--ts-control-line);border-radius:var(--ts-radius-control);
  padding:8px 10px;font-size:13px;color:var(--ts-text);background:#fff;font-family:inherit}
.fg input[type=checkbox],.fg input[type=radio]{min-height:0}
.fg input[type=date],.fg input[type=number]{font-family:var(--mono)}
.hint{font-size:12px;line-height:1.45;color:var(--ts-muted);margin:0 0 12px}
/* Edit Phase's milestone rows: 28px fields, a muted × in a 28px box; the crew list's labels
   (.crew-list label,.fg .crew-list label) outrank .fg label — 13px, ≥ 28px, 16px tick boxes */
.tn-row input{min-height:28px;font-size:12px;border-radius:var(--ts-radius-control)}   .tn-x{width:28px;height:28px;color:var(--ts-muted)}
/* inspector / popover field — v1.62.1 (item 52 step 3): the wireframes' field */
.ins-f{margin-bottom:12px}
.ins-f>label{display:block;font-size:12px;line-height:1.45;font-weight:500;color:var(--ts-muted);margin-bottom:4px}
.ins-f input,.ins-f select,.ins-f textarea{width:100%;min-height:36px;border:1px solid var(--ts-control-line);border-radius:var(--ts-radius-control);
  padding:8px 10px;font-size:13px;font-family:inherit;background:#fff;color:var(--ts-text)}
.ins-f input[type=checkbox],.ins-f input[type=radio]{min-height:0}
.ins-f input.err{border-color:#CE4242}
/* focus: one ring, never the faint halo — the inspector and its phase popover */
#pp-insp :focus-visible,.npv-pop :focus-visible,#me-dock :focus-visible,.fg :focus-visible,.modal :focus-visible{outline:2px solid var(--ts-action);outline-offset:2px}
/* both docks' columns (inspector, My Dashboard): Title Case headings as written (owner, 2026-11-19: no sentence case) */
.ins-sec>h4{padding:12px 16px;font-size:13px;line-height:1.4;font-weight:600;color:var(--ts-text)}
.ins-sec .in{padding:12px 16px 16px}
/* My Dashboard's rows (v1.62.2): 13px, ≥ 28px; dates sans 12px with tabular numerals (mono cut the names short);
   NOW in the success tokens; the header .md-hd .t is the inspector's 14px/600 */
.md-row{gap:8px;padding:5px 0;min-height:28px;font-size:13px;color:var(--ts-text)}
.md-when{font-size:12px;font-variant-numeric:tabular-nums;color:var(--ts-muted)}
.md-tag{font-size:11px;font-weight:600;color:var(--ts-success-text);background:var(--ts-success-bg);border-radius:var(--ts-radius-chip);padding:1px 6px}
.ins-hd .t{font-size:14px;font-weight:600}
/* compact rows inside a column (department dates and days, milestone and note rows): 28px,
   6px corners, 12px; the row × and + are 28px boxes; checkboxes 16px */
.ins-depts .idr .ddates input,.ag-i input,.ag-i select{min-height:28px;padding:4px 6px;font-size:12px;border-radius:var(--ts-radius-control)}
/* Team list search (v1.29.0) — the same grammar as .ins-f input, sized to its 12px list; hidden only
   when viewerLock disabled it, so a viewer.project grant keeps the live search with the live checkboxes */
.pg-rq{width:100%;box-sizing:border-box;min-height:24px;font-family:inherit;font-size:12px;padding:4px 8px;border:1px solid var(--ts-control-line);border-radius:6px;background:#fff;color:var(--ts-text)}
.pg-rq:focus{border-color:var(--acc)}
body.viewer .pg-rq:disabled{display:none}
/* grids */
.fg-2{display:grid;grid-template-columns:1fr 1fr;gap:12px}   .fg-3{grid-template-columns:1fr 1fr 1fr}
.ins-row{display:grid;grid-template-columns:1fr 1fr;gap:9px}  .ins-row3{grid-template-columns:1fr 1fr 64px}
```

Checkbox sets are grids, never free wraps: `repeat(auto-fill,minmax(176px,1fr))`, 14px
boxes, `accent-color:#3B7FD6`, one line per label with ellipsis. Locked fields for
viewers flatten to text (transparent border and background, `opacity:1`).

### 7.5 Toggle switch

```css
/* light (Pin) */
.pin-track{width:26px;height:14px;background:#E2E8F0;border-radius:7px;position:relative;transition:background .16s}
.pin-thumb{position:absolute;top:2px;left:2px;width:10px;height:10px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2);transition:transform .15s}
input:checked ~ .pin-track{background:var(--warn)}   input:checked ~ .pin-track .pin-thumb{transform:translateX(12px)}
/* dark (Protect dates): 28×15 track rgba(255,255,255,.12); on = track rgba(240,168,20,.35), thumb var(--warn), label var(--warn) */
```

### 7.6 Chips and pills

```css
.sb-chip{font-family:var(--mono);font-size:var(--fs-fine);font-weight:600;letter-spacing:.03em;padding:1.5px 6px;border-radius:8px;line-height:1.5}
.sb-chip.late{background:#FDE2E2;color:#B91C1C}   .sb-chip.soon{background:#FCEEC8;color:#8F5E08}
.sb-chip.stale{background:#EEF2F7;color:#475569}
.sb-count{font-family:var(--mono);font-size:var(--fs-fine);font-weight:600;background:rgba(87,104,127,.16);border-radius:8px;padding:1px 7px;color:#57687F}
.cd-perm{font-family:var(--mono);font-size:var(--fs-fine);font-weight:700;letter-spacing:.06em;color:#3B6FB5;background:#EAF1FB;border-radius:5px;padding:0 4px}
.cd-perm.dev{color:#7C4FB0;background:#F2EBFA}
.fb-st{flex:0 0 76px;text-align:center;box-sizing:border-box;white-space:nowrap}   /* v1.39.0: the report status tag (Pending / In review / Resolved) — a .cd-perm of one width, like .fb-kind (48px) */
.cd-perm.fb-kind,.cd-perm.fb-st{font-family:inherit;font-size:11px;font-weight:500;letter-spacing:0;line-height:1.4;border-radius:var(--ts-radius-chip);padding:2px 6px}   /* v1.62.5: the report chips as written (Bug, Idea, Pending, In review) in the page's type */
.fb-st.fb-pend{color:var(--ts-muted);background:#F1F5F9}                              /* pending: the one muted variant */
.fb-colhd{position:sticky;top:0;padding:8px 16px;border-bottom:1px solid var(--ts-line);background:#F6F8FB;font-size:11px;font-weight:500;color:var(--ts-muted)}   /* v1.40.1: Open Issues column labels — same cell widths as the rows, pinned while the list scrolls. v1.62.5: the wireframes' soft table header, as written; the date label carries an aria-hidden ↓ for the order (its column's line says it in words) */
/* v1.62.5 Open Issues rows (.fb-3col): 13px, padding 10px 16px; the subject 600; dates 12px tabular; the folded text 12px muted; each column's .cd-head stacks its 17px/600 heading above its line */
/* v1.62.7 the full-page lists (.pg.dash>.clog-list: Changelog, Bug Reports) share those rows at padding 10px 22px; the date 110px wide; the Changelog's who 600 --ts-text */
.clog-tools{padding:12px 22px;border-bottom:1px solid var(--ts-line);background:#fff}   .clog-tools input{width:320px;min-height:32px;padding:6px 10px;border:1px solid var(--ts-control-line);border-radius:var(--ts-radius-control);font-size:13px}   /* v1.62.7: the Changelog filter, the field recipe */
.cd-perm.done{color:#5B6472;background:#E6E9EE}   /* v1.37.0: the sidebar's Completed tag */
.md-tag{font-size:11px;font-weight:700;letter-spacing:.06em;color:#1A7F4E;background:#DCF3E6;border-radius:6px;padding:0 5px}
kbd{font-family:var(--mono);font-size:var(--fs-fine);background:#EDF1F7;border:1px solid #CBD6E4;border-bottom-width:2px;border-radius:4px;padding:1px 5px;color:#44536C}
```

Status pills: §2.8. Removable filter chips (dark): §2.1.

### 7.7 Menu and popover

```css
/* v1.62.4 (item 52 step 3): one floating frame for .tb-menu, .npv-menu, .npv-pop and #md-tpop —
   a 1px edge, 8px corners (the wireframes' switcher), the shared floating shadow (§5.3) */
border:1px solid var(--ts-line);border-radius:8px;box-shadow:0 4px 18px rgba(13,19,29,.18)
/* toolbar dropdown */
.tb-menu{position:absolute;top:32px;left:0;z-index:900;background:#fff;/* the frame */padding:6px;display:flex;flex-direction:column;gap:0;min-width:180px}
.sm-item{display:flex;align-items:center;gap:8px;min-height:32px;font-size:13px;padding:4px 8px;border-radius:6px;cursor:pointer;white-space:nowrap;color:var(--ts-text)}
.sm-item:hover{background:#EFF5FC}   .sm-item input[type=checkbox],.sm-item input[type=radio]{width:16px;height:16px}
.sm-sec{font-size:11px;font-weight:600;color:var(--ts-muted);padding:8px 8px 4px}   /* as written: Status, Client, Person */
.sm-all{min-height:28px;border:1px solid var(--ts-line);background:#fff;border-radius:6px;font-size:12px;font-weight:600;color:var(--ts-text)}   /* Show everything */
.sm-note{font-family:var(--mono);font-size:var(--fs-fine);color:var(--ts-muted);padding:6px 8px 2px;border-top:1px solid #E2E8F0;margin-top:4px}
/* context menu: shortcut right-aligned in the row */
.npv-menu{position:fixed;z-index:45;min-width:212px;max-width:280px;background:#fff;/* the frame */padding:4px}
.npv-menu .mh{padding:6px 8px 8px;font-size:12px;font-weight:600;color:var(--ts-muted);border-bottom:1px solid #EDF2F7}   /* as written */
.npv-menu button{display:flex;align-items:center;gap:9px;width:100%;min-height:32px;background:none;border:none;border-radius:6px;padding:4px 8px;
  font-size:13px;font-weight:500;color:var(--ts-text);cursor:pointer;font-family:inherit;text-align:left}
.npv-menu button:hover{background:#EFF5FC}
.npv-menu button .k{font-family:var(--mono);font-size:11px;font-weight:600;color:var(--ts-muted);margin-left:auto}
.npv-menu .sep{height:1px;background:#EDF2F7;margin:4px 6px}
/* focus inside a menu: the 2px ring, inset because a menu clips its overflow */
.tb-menu :focus-visible,.npv-menu :focus-visible{outline:2px solid var(--ts-action);outline-offset:-2px}
/* edit-in-place popover */
.npv-pop{position:fixed;z-index:120;width:274px;max-height:82vh;overflow-y:auto;background:#fff;/* the frame */}
```

One menu open at a time; Escape unwinds exactly one layer; every row is a real `<button>`
so the menu walks on Tab.

### 7.8 Tooltip and toast

```css
#tooltip{position:fixed;background:#101A29;color:#fff;padding:10px 13px;border-radius:9px;font-size:12px;line-height:1.55;
  max-width:260px;z-index:999;pointer-events:none;box-shadow:0 10px 32px rgba(0,0,0,.32);border:1px solid rgba(255,255,255,.08)}
.tt-title{font-size:13px;font-weight:700;margin-bottom:3px}   .tt-dim{color:rgba(255,255,255,.5);font-size:11px}
.tt-warn{color:#FFCE6B;font-size:11px;margin-top:5px}
#toasts{position:fixed;bottom:18px;right:18px;z-index:1000;display:flex;flex-direction:column;gap:8px;align-items:flex-end;pointer-events:none}
/* top/bottom are set per toast by toastPlace(): under the project rows, the legend band, or the dashboard header */
.toast{background:#101A29;color:rgba(255,255,255,.92);font-size:12.5px;padding:9px 16px;border-radius:9px;
  box-shadow:0 8px 28px rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.1);animation:toast-in .22s ease-out;max-width:min(380px,calc(100vw - 36px));pointer-events:none}
.toast .undo,.toast .toast-x,.toast details{pointer-events:auto}
.toast.err{border-color:rgba(255,110,110,.5);color:#FFC9C9}
.toast .undo{background:none;border:1px solid rgba(255,255,255,.42);border-radius:5px;color:#fff;font-size:11px;font-weight:700;padding:2px 8px;margin-left:11px;cursor:pointer}
.toast .toast-x{background:none;border:none;color:rgba(255,255,255,.65);font-size:16px;line-height:1;width:24px;height:24px;margin:-6px -10px -6px 6px;border-radius:6px;cursor:pointer}
```

Every mutation gets a toast with **Undo**. Toasts never sit over bars: on the project page
they sit in the blank strip under the rows (or at the top right of the legend/date band when
that strip is too small), on the dashboard at the top right of the date header, elsewhere
bottom-right (v1.26.2, tracker #23). Each carries a × (24px hit target); duplicates collapse
into a ×N badge; quick undoable edits collapse into one "N changes · Undo"; the stack caps at
3 with a `+N more` counter in the strip and the corner, and at 1 on the band and the header
(where it would hang down into the rows); a toast may carry a `<details>` with mono technical
text. The
toast body is `pointer-events:none`, so a drag starts on whatever is under it; only Undo, ×
and Details take the pointer.

### 7.9 Modal

```css
/* v1.62.3 (item 52 step 3): the wireframes' dialog — a 1px edge, 10px corners, the shared floating
   shadow, no blur behind, 17px/600 titles; fields and buttons are 7.3 and 7.4 */
.overlay{position:fixed;inset:0;background:rgba(8,15,26,.5);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px 0}
.modal{background:#fff;border:1px solid var(--ts-line);border-radius:10px;width:470px;max-width:94vw;box-shadow:0 4px 18px rgba(13,19,29,.18);max-height:90vh;
  animation:modal-in .18s ease-out;display:flex;flex-direction:column;overflow:hidden}
.modal h3{font-size:17px;line-height:1.3;font-weight:600;color:var(--ts-text);padding:20px 24px 12px}
.modal-body{flex:1 1 auto;overflow-y:auto;padding:4px 24px 8px}
.m-actions{display:flex;justify-content:space-between;align-items:center;padding:16px 24px;border-top:1px solid #EDF2F7}
```

**Focus (v1.62.1):** every `.overlay` keeps Tab and Shift+Tab inside it, moves focus in when
it opens (unless the opener already placed it) and hands it back to the opener when the last one
closes — one watcher, `modalWatch`, beside `closeTaskModal`.

Widths in use: 470 default · 560 (staff, demo) · 680 (late prompt) · 720 (`.modal-lg`) ·
880 (print preview) · 1150 (meeting sheet).

### 7.10 Page chrome: trail bar, meta strip, dock

```css
/* breadcrumb trail — its own bar, hairline below, × exit at the right */
.dash-top{display:flex;align-items:center;gap:11px;padding:8px 22px;border-bottom:1px solid #E2E8F0}
.pg-cr{background:none;border:none;font:inherit;font-size:14px;font-weight:600;color:#5B6B84;cursor:pointer;padding:3px 2px}
.pg-cr:hover{color:var(--acc)}   .pg-cr.cur{color:#16202E;font-weight:700;cursor:default}
.pg-sep{color:#B4C0D0;font-size:14px;font-weight:700}
.pg-x{margin-left:auto;background:none;border:none;color:#94A3B8;font-size:18px;line-height:1;cursor:pointer;padding:4px 8px}
.pg-x:hover{color:#CE4242}
/* meta strip — glance numbers, never controls */
.dash-meta .m{display:flex;align-items:baseline;gap:6px;padding:0 14px;border-right:1px solid #E2E8F0}
.dash-meta .k{font-size:var(--fs-micro);font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#A3B1C4}
.dash-meta .v{font-size:12px;font-weight:700;color:#33415A}   .dash-meta .v.warn{color:#CE4242}
/* bottom dock — the drawing's title block */
.dash-insp{position:relative;max-height:70vh;border-top:1px solid #E2E8F0;background:var(--paper);display:flex;flex-direction:column}
.ins-sec{flex:1 1 0;min-width:240px;display:flex;flex-direction:column;border-right:1px solid #E2E8F0}
.ins-sec>h4{display:flex;align-items:center;gap:7px;padding:10px 15px;font-size:var(--fs-fine);font-weight:700;letter-spacing:.1em;
  text-transform:uppercase;color:#7488A3;border-bottom:1px solid #EDF2F7}
.ins-sec>h4 .n{margin-left:auto;font-weight:700;color:#94A3B8;background:#EDF2F8;border-radius:8px;padding:1px 6px}
.dash-foot{display:flex;align-items:center;gap:9px;padding:9px 22px;border-top:1px solid #E2E8F0;background:var(--paper)}
#pp-dock-toggle{position:absolute;right:12px;bottom:8px;padding:5px 7px;border:1px solid #E2E8F0;border-radius:6px;background:#fff}
```

### 7.11 Master/detail (Company Data pattern)

The reusable page shape for every registry view — Timeline's People and Clients pages
today; the People, Clients and Office products tomorrow.

```css
.cd-head{display:flex;align-items:center;gap:10px;padding:12px 22px 10px;border-bottom:1px solid #E2E8F0}
.cd-head h2{font-size:17px;color:#16202E}   .cd-sub{font-size:12px;color:#7488A3}   .cd-head .btn{margin-left:auto}
/* v1.62.6 (item 52 step 5): a full-width page's head is the wireframes' page title — 22px/600 over a 13px line */
.pg.dash>.cd-head{flex-direction:column;align-items:flex-start;gap:4px;padding:20px 22px 16px;border-bottom:1px solid var(--ts-line)}
.pg.dash>.cd-head h2{font-size:22px;line-height:1.25;font-weight:600;color:var(--ts-text)}   .pg.dash>.cd-head .cd-sub{font-size:13px}
/* Release Notes: .rn-ver padding 16px 22px · .rn-hd b 15px/600 · .rn-notes 13px/1.55, max-width 760px
   Settings (My Settings, App settings): .as-body h3 15px/600 as written · .as-row 12px 14px, 1px --ts-line, r8,
   the chosen one (:has(input:checked)) --ts-action edge on #F5F9FF · .as-txt b 13px · span 12px muted
   App Settings (v1.62.7): .as-src 13px muted on #F6F8FB, 1px --ts-line, r6 (its .warn keeps amber) · #as-stale the field recipe, 32px, its row centred */
.cd-body{flex:1;display:flex;min-height:0}
.cd-list{width:56%;min-width:320px;max-width:820px;border-right:1px solid #E2E8F0;display:flex;flex-direction:column}
.cd-cols{display:grid;gap:4px 12px;padding:6px 14px 4px;font-size:var(--fs-fine);font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#94A3B8;border-bottom:1px solid #EDF1F7}
.cd-tools{display:flex;gap:8px;padding:10px 14px;border-bottom:1px solid #EDF2F7}
.cd-tools input,.cd-tools select{font:inherit;font-size:12px;padding:5px 8px;border:1px solid #CBD6E4;border-radius:6px;color:#33415A}
.cd-row{display:grid;gap:4px 12px;align-items:center;padding:7px 14px;border-bottom:1px solid #F1F5F9;cursor:pointer}
.cd-row:hover{background:#F6F9FC}   .cd-row.sel{background:#EDF3FA;box-shadow:inset 2px 0 0 var(--acc)}
.cd-row b{font-size:12.5px;color:#16202E;font-weight:700}   .cd-row .cd-mut{font-size:11.5px;color:#7488A3}
.cd-detail{flex:1;overflow-y:auto;padding:18px 26px}
.cdd-hd h3{font-size:16px;color:#16202E}   .cdd-role{font-size:12px;color:#7488A3;margin-top:2px}
.cdd-f{margin-top:14px}
.cdd-f dt{font-size:var(--fs-micro);font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#A3B1C4;margin-bottom:3px}
.cdd-f dd{font-size:12.5px;color:#33415A}
.cdd-foot{display:flex;gap:8px;align-items:center;margin-top:20px;padding-top:12px;border-top:1px solid #EDF2F7}
.cd-del{color:#94A3B8;margin-right:auto}   .cd-del:hover{color:#CE4242;border-color:#CE4242}
#cd-split{flex:0 0 6px;margin-left:-3px;cursor:col-resize}   #cd-split:hover{background:#E2E8F0}
@media(max-width:900px){.cd-body{flex-direction:column}.cd-list{width:auto;max-width:none;border-right:none;border-bottom:1px solid #E2E8F0;max-height:45vh}}
```

Behavioural half (Design-Language §7.6): read-first record, one explicit **Edit**, Remove
inside the edit state with consequences counted, trail bar reads `N records · SharePoint`.

### 7.12 Sidebar row, empty state, coach card

```css
.sb-row{display:flex;align-items:center;gap:7px;padding:0 8px 0 12px;border-bottom:1px solid #DAE2ED;color:#33415A;height:var(--row-h)}
.sb-name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12.5px;font-weight:600}
.sb-sub{font-family:var(--mono);font-size:var(--fs-fine);color:var(--txt-dim)}
.c-dot{width:9px;height:9px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(0,0,0,.12)}
.empty-state{background:#fff;border:1.5px dashed #C4D0E0;border-radius:var(--r-l);padding:28px 36px;text-align:center;color:#5E7292;box-shadow:0 6px 24px rgba(20,40,70,.08)}
.empty-state .es-big{font-size:15px;font-weight:700;color:#33415A;margin-bottom:6px}   .empty-state .es-sub{font-size:12px;line-height:1.6}
#coach-hole{position:absolute;border-radius:10px;box-shadow:0 0 0 9999px rgba(13,19,29,.55);outline:2px solid var(--acc);outline-offset:2px}
#coach-card{position:absolute;width:360px;background:#fff;border:1.5px solid #CBD5E1;border-radius:var(--r-l);box-shadow:0 10px 30px rgba(15,23,42,.25);padding:14px 16px}
#coach-step{font-family:var(--mono);font-size:var(--fs-fine);font-weight:600;letter-spacing:.1em;color:#7488A3}
#coach-title{font-size:var(--fs-title);font-weight:700;color:var(--ink);margin:4px 0 6px}
#coach-body{font-size:var(--fs-body);line-height:1.4;color:#33415A}
```

### 7.13 Scrollbar

```css
scrollbar-width:thin;scrollbar-color:#B9C7D9 transparent
::-webkit-scrollbar{width:10px;height:10px}   ::-webkit-scrollbar-thumb{background:#B9C7D9;border-radius:6px;border:2px solid var(--paper)}
```

### 7.14 Header and app cards (the Systems page, v1.56.0; the shared shell, v1.57.0)

The root `index.html`, built to the owner's Portal Option 1 wireframe
(`design/wireframes/`) in the target guide's values, not this file's: it is the first
surface on the new chrome. A 56px header (wordmark, divider, the page's name), a page title
with one line under it, and a three-up grid of app cards, two-up under 760px and one-up under
500px. A built product's card is a link with an icon tile, a → and an "Open …" line; one not
built yet is greyed (no fill, a dashed edge, muted text) and has no link and no arrow. The
wireframe's avatar, recent work and signed-in footer wait for a page that signs in.

**The shell (v1.57.0, item 52 step 4).** The header pieces moved into `common/common.css`
as `.ts-top`, `.ts-brand` and `.ts-app`, with the Brauer Neue `@font-face`; the Systems page
loads that file and keeps no token copy. Timeline puts the same wordmark and name at the left
of its first toolbar row (now 56px) and an **Apps ▾** menu at the right, filled by
`appsMenu()` from `SYSTEMS_APPS` in `common/common.js`: rows `.ts-apps-item` (12px, 6px
radius, `--ts-selected` on hover), the current product ticked (`.cur`, 600, `aria-current`),
unbuilt ones greyed (`.off`, `aria-disabled`), a note (`.ts-apps-note`, 11px muted) at the
right. The list and the Systems page's cards say the same (`test-v1570`).

```css
.ts-top{display:flex;align-items:center;gap:16px;min-height:56px;padding:0 20px;background:linear-gradient(var(--ts-header-start),var(--ts-header-end));color:var(--ts-header-text)}
.ts-brand{font-family:'Brauer Neue',var(--sans);font-size:13px;font-weight:800;letter-spacing:.24em;color:#fff;text-decoration:none;padding:10px 18px 10px 0;border-right:1px solid var(--ts-header-line)}
.ts-app{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#B7C7DF}
main{max-width:1100px;margin:0 auto;padding:28px 32px 32px}   h1{font-size:22px;line-height:1.25;font-weight:600}
.app-grid{list-style:none;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.app-link{display:flex;flex-direction:column;gap:9px;min-height:150px;padding:20px;background:var(--ts-panel);border:1px solid var(--ts-line);border-radius:8px}
a.app-link:hover{border-color:var(--ts-action);background:var(--ts-selected)}
.app-head{display:flex;align-items:center;gap:10px;font-size:15px;font-weight:600}   .go{margin-left:auto;color:var(--ts-muted);font-weight:400}
.icon{width:30px;height:30px;border-radius:6px;background:var(--ts-sidebar)}   /* 16px line icon, stroke 1.5 */
.app-description{min-height:35px;font-size:12px;color:var(--ts-muted)}   .app-foot{margin-top:auto;font-size:11px;color:var(--ts-link)}
.app-link.off{background:transparent;border-style:dashed}   /* head, icon and foot in --ts-muted */
```

New literal: `#B7C7DF`, the header's page name, from the wireframe (6.9:1 or better across the header gradient). The
"Open …" line uses `--ts-link`, not `--ts-action`, so it keeps 4.5:1 on the hover tint.

---

## 8. Print

v1.40.0 (tracker #8/#9): the app lays out its own pages. **Paper:** Letter or Tabloid,
landscape, `.5in` margins, picked in the Print menu and remembered (`shopTimelinePaper`);
the Meeting Sheet may also print portrait (`shopTimelineSheetPortrait`). The size is
written into `<style id="print-page-size">` when picked — inches, not paper names:

```css
@page{size:11in 8.5in;margin:.5in}   /* Letter landscape  */
@page{size:17in 11in;margin:.5in}    /* Tabloid landscape */
@page{size:8.5in 11in;margin:.5in}   /* Letter portrait, sheet only  */
@page{size:11in 17in;margin:.5in}    /* Tabloid portrait, sheet only */
```

**Page box** `.pr-page`: 960 × 720 px on Letter, 1536 × 960 on Tabloid (96 px to the inch,
margins already off), `break-after:page`, white, ink text, 11px base. Header 53px: line
one `TWOSEVEN INC.` + the title (`--fs-title` 800, `.02em`) with the date range on the
right (mono `--fs-fine`); line two mono `--fs-fine` `#64748B` (version · printed date ·
project count · filters in use · Color by; a project's page: cost code · client · PM ·
due date, a draft says "Draft, not yet created" and carries no code); `2px solid var(--ink)`
under it. Footer 44px over a `#CBD5E1` hairline: the legend left (tinted swatches with
their colour edge, the status marks, "red edge = install or shipping (Laser shares the
red)"), `Page X of Y` right in mono.

```css
@media print{
  *,*::before,*::after{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  html,body{overflow:visible!important;background:#fff!important}
  ::-webkit-scrollbar{display:none!important}
  #toolbar,#main,#page,#tooltip,.overlay,#toasts,#coach{display:none!important}
  #print-root{display:block!important}
  .pr-page .sb-eye,.pr-page .sb-edit,.pr-page .sb-grip,.pr-page .bar-handle,.pr-page .hover-guide,.pr-page .hover-tag,.pr-page .cal-hdl,.pr-page .npv-hdl{display:none!important}
  /* quiet canvas forced whatever is on screen */
  .bg-col,.hdr-d-cell{background-color:#FCFDFE!important}
  .hdr-m-cell{background-color:var(--side)!important;color:#33415A!important;text-shadow:none!important}
  .wknd-col{background:#EEF1F5!important}
}
```

**Gantt on paper:** sidebar 2.25 in (Letter) / 2.75 in (Tabloid), the rest is time in whole
weeks, 13 / 22 weeks a page (a longer range continues across, "weeks 14 to 26 of 26" in
line one); rows at the Compact height (32px, bar 24px) whatever the screen density; the
axis is the screen's own header builder, so it degrades the same way. Sidebar: name
11.5px 600, client · code · date 11px mono grey, group and department headings 11px
caps with letter spacing. **Bars:** the on-screen colour on `--c`, printed as
`color-mix(in srgb,var(--c) 22%,#fff)` with a `3px solid var(--c)` left edge and ink
labels (11px 600); Forecast dashed edge and outline, Estimating stripes and On hold
hatch in the bar's colour (an opacity layer), Complete at `.55` with the check; chips (`.sum-pill`,
`.mr-pill`) white with a 1px border in the status colour, mono 11px caps; the today line
1px. Paper patterns are a plain `linear-gradient` tile sized with `background-size`, never
`repeating-linear-gradient`: Chrome prints a repeating gradient as a function-based shading
that pdf.js viewers (Firefox and others) paint as a flat pink fill. All slices of one range
share one time scale; a month that only grazes a slice edge shortens or drops its label.
**Calendar:** one month per page, the month strip ink on white over a 2px rule,
headers static, seven columns sharing the width, the month's weeks sharing the height
(never shorter than on screen), titled bands tinted the same way, slim strips (no text) at
full colour; the footer names the job's departments with their swatches. **Meeting Sheet:** the 11px table as it is (`#F8FAFC` column
heads repeated on every page, PM group rows `#E6F1FB` on `#185FA5`, mono numerals,
Notes blank — 26% of the width on Letter, 37% on Tabloid); the progress bar a white
track with a `#CBD5E1` hairline, the fill in the status tint outlined 1px in the status
colour; rows faded by search or spotlight print at `.35`; its footer carries "Shop
Timeline v…" instead of a legend. Nothing informational below 11px. Export is the
browser's Save as PDF.

---

## 9. Copy on surfaces

Plain sentences; no developer vocabulary a user can read; buttons are verbs; destructive
buttons name their object. Vocabulary is fixed: **Milestone** (not checkpoint), **Note**
(not task), **phase** for a department bar, **Company Data** for the master-data group.
Full inventory: `docs/Copy-Coach-and-Helpers.md`; rules: Design-Language §1.

---

## 10. Systems — what a product takes, and where its identity goes

Status: **Phase 9 is planned, not started.** D4 was ruled 2026-09-28 and refined for
Systems on 2026-09-29: separate single-file products, one folder each under one Pages
site, the Systems portal at the root, sharing a vendored `common.css`/`common.js`
extracted when the second product starts. This section is the extraction brief for that
outcome; the layout and the Timeline reshape PR are in `TODO.md` §4 D4 — nothing here
changes Timeline today.

### 10.1 Shared, verbatim (`common/common.css`, started v1.56.1)

`common/common.css` holds so far the tokens, the toast strip and the sync pill (item 85),
and the shell's header, wordmark font and Apps menu rows (v1.57.0, item 52 step 4); the
rest of this list moves into it as the second product needs it.

1. The `:root` block, reset, reduced-motion and `:focus-visible` rules (§1).
2. The toolbar: fill, edges, wordmark, eyebrow, version pill, `.t-btn` family, segmented
   group, dark search, sync pill, signed-in chip (§2.1, §7.1–7.2). Every app has the same
   title block; only the eyebrow text and the mark change.
3. Buttons, fields, toggles, chips, menus, popovers, tooltip, toast, modal (§7.3–7.9).
4. The page chrome and master/detail pattern (§7.10–7.11) — the portal and every product
   is a set of these pages.
5. `labelColor()`, `kidShade()`, `hashSlot()`, `PCOLS`, `DEPT_COLORS`, `INSTALL_RED`,
   `FORECAST_GREY` (§2.6–2.10) — so a project or department is one colour everywhere.
6. Print header block (§8).

### 10.2 Never changed by an app

`--ink`, `--acc`, the type scale, the 4px unit, the red rule, white-on-bar, the
three-path interaction rule, toast-with-Undo, one-menu-at-a-time, Escape-one-layer.

### 10.3 Per-product identity — three slots, nothing more (proposal)

| Slot | Timeline today | Another product |
|---|---|---|
| **Product name** `.ts-app` | `Timeline` (markup; CSS uppercases it; v1.57.0, was `Shop Timeline`) | `People` · `Clients` · `Office` · `Systems` (the portal) |
| **Mark** | `icons/favicon.svg` (2-7 monogram) | The same monogram; a product may add a small glyph after the eyebrow, 16-grid SVG, 1.5px stroke |
| **App hue** `--app` (new token) | unset → falls back to `#8CA0BF` | One hue per product, used **only** on: the eyebrow text, the product glyph, the favicon tint, and the active-nav underline in the portal. Never on data, never on buttons, never replacing `--acc`. |

Suggested `--app` hues, chosen from the identity palette so they already pass the
contrast test and never approach red: Timeline `#2B73CF` (slot 01) · Clients `#148079`
(05) · People `#9050C3` (04) · Office `#5E7D34` (12) · Systems (the portal) none (neutral
`#8CA0BF`). A user tells the products apart by the eyebrow and a tint on one word;
everything else is the same shop drawing.

### 10.4 Routing and shell

Each product is one file at its own subpath (`/timeline/`, `/people/`,
`/office/`), each with its own Entra redirect URI (D4 consequence); the Systems portal is
at `/` (built v1.56.0, item 49; Timeline moved to `/timeline/` then). The wordmark button
goes to the **portal** in every product, not to that product's
home; the product's own home is the first breadcrumb (`All Projects`, `All People`,
`All Clients`; Office's is to be named). The trail bar, × exit and Esc behave as in
Design-Language §7.5–7.6. *Since v1.57.0 (style §13 step 4, item 52) Timeline's wordmark
goes to the portal, and its product name, "Timeline", is the button to its own home.*

### 10.5 Where the seeds already are

`#/people` inside Timeline is a proto-product built on §7.10–7.11 (D8, ruled 2026-09-29).
Clients graduated first (v1.58.0, item 86; renamed Office at `office/`, v1.61.0, item 94), the first product after Timeline,
built to the Clients wireframe — the shell, a page title with its line and one primary
action, a search box, a list panel beside a record panel (Details, then the related records),
no left rail while it has one section. A new product starts by copying `office/index.html`:
its page shape, its hooks for `common/` (the update check's `updWhyNot`/`updBusy`/`updGo`)
and its optimistic save with a parked retry.

---

## 11. Upkeep

- This file describes the stylesheet. A PR that adds or changes a token, a recurring
  literal, or a component recipe updates the matching table here in the same PR.
- Promoting a §1.1 literal to a real token is welcome: add it to `:root`, replace the
  literals, update §1 and delete the row from §1.1.
- D4 was ruled 2026-09-29, so §10 is the `common.css` extraction brief; the "proposal"
  label on §10.3 comes off when the first product copies it.
- Checklist for any new surface: Design-Language §9 (contrast, three paths, focus, ≥11px,
  ≥24px, toasts don't cover controls) plus §0 above.
