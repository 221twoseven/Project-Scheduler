# TwoSeven Application Style Guide

**Version 1.1 · September 27, 2026 · Convention-aligned target**  
**Scope:** the TwoSeven portal and applications, starting with People and Clients and extending to Timeline, Project Office, Tools, and Accounting.

## 1. Design intent

TwoSeven software should present a familiar enterprise interface: a dark navy header, quiet work surfaces, clear hierarchy, and information that can be scanned quickly. The portal, People, and Clients wireframes remain the aesthetic target. Preserve useful continuity with Timeline without requiring every screen to imitate a shop drawing. The original drafting metaphor is retired as a suite-wide styling requirement; its useful outcomes—alignment, legibility, restrained surfaces—remain.

The portal, People, and Clients wireframes establish the shared visual language. This guide consolidates their small differences into one proposed implementation standard. Values marked as extensions complete behaviors that the wireframes did not fully specify; they are design decisions, not claims about production behavior.

**Five rules govern every application:**

1. **Keep orientation stable.** The same header, app switcher, navigation placement, and action hierarchy appear throughout the suite.
2. **Make the next action obvious.** Use a descriptive title, a short explanation only when needed, and one dominant action per task area.
3. **Show useful detail before decoration.** Prefer compact tables, labeled properties, and clear tabs to large metric cards.
4. **Reveal complexity when relevant.** Keep administration, sensitive records, and advanced settings out of ordinary lookup tasks.
5. **Present one shared record consistently.** Names, codes, statuses, and links must mean the same thing across applications. A visual design system supports consistency; shared data and authorization must enforce it.

### What this guide draws from

| Reference | Contribution |
|---|---|
| Portal wireframes, including the three launcher alternatives | Shared header, app cards, recent work, navigation between applications |
| Expanded People wireframe | Directory, person records, availability, administration, settings |
| Expanded Clients wireframe | Client index, contacts, project history, financial access |
| Timeline repository, `docs/Design-Language.md` | Shop-drawing character, established typography, scheduling semantics, continuity with existing work |

This revision reconciles the supplied `Design-Language.md` and `Style-Transition-Review.md`. The latter is a review of differences, not an overriding specification. Its references to the separate as-built `Style-Guide.md` have not been independently verified against that file or the running application in this revision.

**Precedence:** this guide defines the target appearance of shared chrome and business screens. `Design-Language.md` retains authority over Timeline's scheduling semantics, established interaction rulings, data behavior, and print conventions. Its later explicit amendments take precedence over earlier general descriptions. The decision register in §12 identifies intentional visual replacements and specific functional proposals; a visual replacement does not silently repeal an owner interaction ruling. Before a change ships, amend the affected local specification in the same PR so developers never have to choose between contradictory documents.

| Surface | Target treatment | Protected conventions |
|---|---|---|
| Global header, contextual toolbar, menus, dialogs, toasts, tooltips, coach marks | New shared chrome tokens, accessible text, sentence case, consistent controls | Toolbar grouping, one open transient surface, shortcuts, undo and dismissal order |
| Project inspector and edit popover | Restyle fields and labels in place | Bottom dock, selection behavior, shared commit path, autosave, persisted dock settings |
| People and Clients | Read-first records, compact tables, explicit editing; new tabs as features are built | Existing role gates and real record relationships until a separate access migration |
| Gantt rows and their sidebar gutter, bars, markers, date header, project calendar, legend swatches | Preserve data encoding and geometric alignment; separately remedy demonstrated accessibility defects | Project/department identities, state patterns, row/bar sizes, zoom, dates, marker semantics |
| Meeting Sheet and print output | Existing print system | Mono values, report header, quiet canvas, generous Notes column |

The Gantt's project list is a canvas gutter, not an app-navigation sidebar. Calendar controls that also act as a legend remain functional controls; the global legend remains explanatory. “Preserve canvas” means preserve its meaning and behavior, not exempt its text from readability checks.

## 2. Suite geography and navigation

| Layer | Purpose | Pattern |
|---|---|---|
| Portal | Choose a place to work; resume a recent record | Stable app cards and a compact recent-work list |
| Global header | Know which app is open; move between apps | TwoSeven wordmark, app name, app switcher, account control |
| App navigation | Move between this app's major sections | Narrow left sidebar on desktop |
| Record navigation | Explore one person, client, or project | Record title and horizontal tabs |
| Contextual action | Work on the current page or record | Page action area, record actions, or a short overflow menu |

Do not put every app's internal pages into one universal sidebar. Apps are separate destinations with a familiar shell. Use real links for new destinations so open-in-new-tab, history, and deep links work normally. Converting existing hash-assignment buttons is a routing change, not a CSS replacement. Preserve draft-discard protection and existing exit behavior during that migration. The wordmark continues to mean Timeline home until a real portal is deployed; then give the portal link an accessible “TwoSeven home” name and retain an explicit route to Timeline.

**Portal default:** the stable launcher layout. Keep app positions predictable; show a one-sentence purpose beneath each name. Recent work helps returning users without displacing the primary destinations. A task-led work desk is optional when task ownership and freshness are dependable. A search-led directory becomes useful only as the ecosystem grows; it should not make users search for six familiar apps.

**Single-section applications omit the app-navigation rail.** Timeline keeps its existing project gutter and exposes My Dashboard through its contextual navigation; it does not acquire a second 168px rail. Multi-section applications such as People and Clients use the rail.

**App switcher:** a compact anchored menu, not a full-screen destination. Display text names and the current app. The People/Clients prototype's modal switcher is an interaction shortcut, not the production standard.

**Navigation examples:**

| People | Clients |
|---|---|
| Directory | Clients |
| Availability | Contacts |
| Organization | Reports |
| Administration, when authorized | Settings, when authorized |
| Settings, when authorized | — |

These labels describe the wireframes, not a mandatory feature backlog. Show only implemented, authorized destinations. Never ship a link that silently does nothing.

## 3. Color system

Use semantic tokens rather than copying hex values into individual components. The People/Clients palette is the visual baseline. Retain the existing `#C9D4E3` structural hairline: changing it to the prototype’s nearly identical `#CBD5E3` provides no meaningful benefit. Consolidate other chrome neutrals by role without replacing canvas colors mechanically.

| Token | Light | Dark | Use |
|---|---|---|---|
| `paper` | `#F5F7FA` | `#172131` | Page canvas |
| `panel` | `#FFFFFF` | `#202D40` | Records, tables, cards, dialogs |
| `sidebar` | `#EDF1F7` | `#26364D` | Local navigation surface |
| `soft` | `#F8FAFD` | `#243247` | Table headers, restrained callouts |
| `text` | `#1B2537` | `#EEF2F8` | Primary text |
| `muted` | `#596B81` | `#ACBBCE` | Secondary text and labels |
| `line` | `#C9D4E3` | `#43536B` | Decorative dividers and panel edges |
| `control-line`¹ | `#7C8BA0` | `#8A9BB3` | Input boundaries that must remain identifiable |
| `link` | `#245FC9` | `#98BFFF` | Links and active text |
| `selected` | `#EAF2FF` | `#2B4163` | Selected rows, tabs' context, navigation |
| `action` | `#2F6FE4` | `#2F6FE4` | Primary button, with white text |
| `action-hover`¹ | `#1D5AC9` | `#1D5AC9` | Primary button hover |
| `success-text` | `#236847` | `#93D9B3` | Positive status text |
| `success-bg` | `#EAF4EE` | `#213D33` | Positive status background |
| `warning-text` | `#895B11` | `#EDC67A` | Attention-needed status text |
| `warning-bg` | `#FFF4DB` | `#433723` | Attention-needed status background |
| `danger-text`¹ | `#B42318` | `#FFB4AB` | Errors and destructive actions |
| `danger-bg`¹ | `#FFF0EE` | `#442A2D` | Error message background |

¹ Extension beyond the displayed wireframes. The stronger control border avoids relying on very pale dividers to identify form inputs.

The header stays dark in both themes: gradient `#2A3850` → `#202C41`, text `#EDF3FC`, separator `#576882`. Use gradients only in this established shell treatment. Resting panels have no drop shadow. Retain the established toolbar elevation as a shell exception and canvas bar/edge-indicator shadows where they communicate position. Do not remove functional scroll separation merely because an element is not floating.

**Color meaning:** blue is ordinary interaction or selection; green and amber supplement written statuses; neutral surfaces carry ordinary information. Preserve amber for existing Lock dates / Pin protection states: those controls communicate an editing safeguard, not merely a selected preference. Ordinary new switches use blue. Do not globally alias `--warn` to a blue or a status-text token. Do not assign decorative identity colors to each app or client. Timeline project and department colors are data encodings: preserve their established mappings, patterns, opacity, and exceptions. A red schedule bar is not a generic error message.

**Timeline remains light-only during this transition.** Dark tokens are a candidate for new applications, not a supported suite-wide theme or a token-flip migration for Timeline. Do not expose a theme switch in an app until its actual components, canvas if any, and all states are validated. A portal theme does not imply that every destination supports it.

## 4. Typography and brand

Retain the established Bahnschrift-led `--sans` and `--mono` declarations, including local font lookup and platform fallbacks. For a new app, use `Bahnschrift, "Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif` and `ui-monospace, "Cascadia Mono", "Segoe UI Mono", Consolas, "Roboto Mono", monospace`. Use mono for codes, compact dates, day counts, keyboard shortcuts, and other work-order values across the suite. Use sans for names, prose, and long dates embedded in sentences. This deliberately retains more of Timeline’s useful mono convention than v1.0. Use tabular numerals for aligned amounts; verify the actual fallback fonts rather than assuming the CSS request is honored.

| Role | Size / line-height | Weight | Example |
|---|---|---|---|
| Page title | 22px / 1.25 | 600 | People; Clients |
| Record title | 17px / 1.3 | 600 | Jordan Reyes; Acme Studio |
| App-card title | 15px / 1.35 | 600 | Timeline |
| Header app name | 14px / 1.4 | 600 | People |
| Section heading | 13px / 1.4 | 600 | Contact information |
| Body | 13px / 1.45 | 400 | Descriptions and form content |
| Control / table body | 12px / 1.45 | 400–600 | Buttons, rows, tabs |
| Secondary text | 12px / 1.45 | 400 | Supporting context |
| Metadata / table heading | 11px / 1.4 | 400–500 | Cost code; status detail |

Use sentence case. Reserve spaced uppercase for the wordmark or very short grouping labels. Keep essential information at least 11px. Existing 9px decorative REV/eyebrow treatments may remain only when the same information is not required for the task; do not introduce new microtext. New business screens use the scale above, while canvas axis labels, compact pills, and print retain their existing 15/13/11.5/11px working scale. Let prose wrap; keep synchronized canvas rows governed by density tokens.

Retain `TWOSEVEN INC.` in the established Brauer Neue Std Bold treatment. The supplied Design Language records owner-confirmed licensing on September 1, 2026; the transition review raises web-serving scope as an unresolved verification item, not evidence that the font must be replaced. Before distributing it from additional app origins, verify the recorded coverage. If needed, use an approved wordmark asset with appropriate usage rights; converting to SVG does not itself resolve licensing. The prototype wordmark is not a logo redesign.

## 5. Spacing, geometry, and density

Use the spacing scale **4, 8, 12, 16, 20, 24, 32, 40, 48px**. Align page titles, toolbar content, and panel edges. Avoid many subtly different gaps.

| Element | Standard |
|---|---|
| Global header | Target minimum 56px high; 16–20px horizontal padding; existing 46px rows remain until shell migration |
| Desktop sidebar | 168px wide; 8–12px internal padding |
| Main content | 24px padding desktop; 16px narrow screens |
| Portal content | Centered, maximum 1100px; 24–32px padding |
| Page title to content | 24px |
| Related blocks | 12–16px gap |
| Separate sections | 24–32px gap |
| Panel padding | 20px; 16px on narrow screens |
| Button | Minimum 32px height; 12px horizontal padding |
| Text input / select | Minimum 36px height; 10–12px horizontal padding |
| Table row | 44px default; 56px for two-line content; optional 32px compact |
| Table cell | 12px horizontal padding |
| Status chip | 3px vertical / 6px horizontal padding |
| Portal app card | 20px padding; minimum 150px high; content can grow |

These values normalize the prototypes: for example, their 58px header becomes a 56px minimum and their 18px app-card padding becomes 20px. They are deliberate standards rather than exact measurements of every mockup.

**Chrome target radii:** chips 4px; controls 6px; cards and records 8px; dialogs 10px. These intentionally replace the older generic 5/8/14px convention only on migrated chrome. Keep legacy `--r-s`, `--r-m`, `--r-l` values for unmigrated surfaces and canvas bars; do not globally remap them. Bars retain their 8px ends. The smaller, differentiated chrome radii reproduce the wireframes without changing schedule geometry. Avatars may be circular in the account control; record initials use a restrained rounded square. Do not add oversized pill buttons or heavily rounded dashboard cards.

**Borders:** 1px. **Elevation:** none for ordinary resting panels; the toolbar and canvas exceptions above remain. Retain the existing shared floating shadow `0 4px 18px rgba(13,19,29,.18)` for menus, popovers, and dialogs. It is sufficiently restrained and avoids a cosmetic-only shadow migration.

Density is task-specific. Do not expand Timeline's established 32/44/56px row modes or Gantt bar dimensions through generic table CSS. Scope conventional table styles to their components.

## 6. Core component contracts

### Page header and buttons

Place the title and optional one-line description on the left, primary action on the right. Timeline retains its contextual control groups in reading order: position → view → filters, with saved Views, Lock dates, and help at the edge. Keep the scale segmented, lower-frequency view choices in menus, removable filter chips and count, and outcome-phrased “Show everything.” Do not add category eyebrows. A global header does not eliminate the contextual row; the target places that row beneath it and derives offsets from measured layout. Put filters directly above the content they affect. Keep primary actions specific: **Add person**, **Add client**, **Save changes**.

| Variant | Appearance | Use |
|---|---|---|
| Primary | Blue fill, white text | Main forward action in the current task |
| Secondary | Panel fill, visible border, ink text | Export, cancel, secondary workflow |
| Quiet | No filled background; clear text or icon label | Low-priority actions and header controls |
| Destructive | Red text or a clearly labeled destructive confirmation | Delete, revoke, irreversible removal |

Avoid competing primary buttons in the same action group. Keep safe actions to the left of the primary action at bottom-right, following Timeline’s convention. Destructive actions are not the rightmost action and name the object, such as “Delete project.” Preserve confirmations and relationship counts before removal. With autosave, an exit need not save: retain Timeline’s established “Done” label in this style pass; “Close” is an optional wording change, not a correctness requirement. A navigation link must be an anchor; a state-changing action must be a button.

### Tables and directories

Use a soft header, thin horizontal rules, left-aligned names, and right-aligned amounts. Show the most useful identifier beside or under a name. Sorting is explicit and indicates direction. Preserve the user's filters and position when returning from a record.

Selected rows use the selected surface plus a non-color cue, such as a leading rule or visible selection control. Hover must not be mistaken for selection. If a row opens a detail pane, expose an accessible named link or button; do not depend solely on clicking an unlabelled row.

Search states read **No people match “…”**, with a clear-filter action. Empty datasets read **No clients yet**, with an authorized creation action. They are different situations.

### Record panels and tabs

Use a bordered panel with an identity header, relevant summary properties, a tab strip, and a padded body. Active tabs use a 2px blue underline and semibold text. Tabs contain short nouns: Overview, Contacts, Projects, Activity. Make the tab strip scrollable on narrow screens without shrinking labels.

Keep the record name visible while changing tabs. Do not make the user reopen a client to move from Contacts to Projects. Use proper keyboard tab behavior when switching panels in place; use ordinary navigation links when each destination is a separate route.

### Forms and settings

Labels sit above fields. Helper text appears beneath the relevant field. Placeholder text illustrates format, never replaces a label. Mark required fields consistently and explain the convention once. Show validation beside the field and preserve entered values after a failure.

Use explicit Save/Cancel for multi-field record editing. Existing, well-established autosave flows may remain; they need visible saving, saved, and failed states. Never introduce silent autosave merely to remove a button.

Group settings by the user's purpose, with a heading, short explanation, and controls. Separate personal preferences from organization administration. Avoid a long undifferentiated settings form.

### Dialogs, menus, and icons

Use a dialog for a short focused task, approximately 440–470px wide, within the viewport, with a scrollable body when necessary. Existing wider specialized dialogs may remain where their content requires it; do not shrink every modal to a prototype width. Retain the existing dark scrim; decorative background blur may be removed. Use a full page for lengthy onboarding or a complex record editor. Trap focus within a modal and restore it to the invoking control on close. Warn before dismissing unsaved work.

Use inline SVG with a 16×16 viewBox, 1.5px stroke, and `currentColor`, matching the existing convention without requiring an icon package or build step. Replace inconsistent Unicode control glyphs as surfaces migrate; do not replace semantic canvas marker shapes with generic action icons. Pair icons with words for unfamiliar actions. Icon-only controls need accessible names and tooltips; a 16px glyph still needs a usable hit area.

## 7. Application patterns

### People: find a person, then understand their role

The default directory is a compact table: name, role or department, contact details, and availability where useful. The selected person's detail panel presents Overview, Assignments, authorized Administration, and Activity.

Use an ordinary directory view for most staff. Office administration adds relevant actions and sections without replacing the familiar shell. Employment administration must not compete visually with everyday contact lookup.

Availability uses both a readable status and a color treatment. Distinguish a person's availability from project assignment and employment status. Keep ADP-owned information read-only or link to the owning system; do not create a second editable version of the same fact. Preserve canonical People departments separately from machine-level phase departments; do not flatten these different taxonomies to make their labels look uniform.

### Clients: keep relationship context beside project history

Use an approximately 215px client index beside a flexible record pane on wide screens. The selected client has a pale blue surface and a 3px leading blue rule. The record contains Overview, Contacts, Projects, authorized Financials, and Activity.

Prioritize primary contacts and relevant project history. Project rows expose dates, cost code, and team, with a clear link into Timeline when the user needs the delivery view. Financial columns appear only for authorized users and use right-aligned amounts with explicit currency context. The existing Clients page remains admin-only until an explicit access-policy migration: a more approachable screen does not authorize broader access.

Do not add a unique client color. Client identity is its name and context; project colors retain their scheduling meaning.

### Future apps

Reuse the shell, type, controls, tables, record panels, and feedback patterns. Choose content structures by task: an accounting review table need not resemble a People profile, and a Tools catalog need not resemble a schedule. Consistency means familiar interaction, not identical pages.

## 8. Interaction, permissions, and truthful feedback

| State | Required presentation |
|---|---|
| Loading | Keep the shell stable; indicate the region being loaded |
| Saving | Keep the action's label or context; prevent duplicate submission |
| Saved | Preserve Timeline’s optimistic update + Undo toast for mutations; keep record-local save state and the global sync pill |
| Error | Plain-language problem, retained work, and a useful retry or next action |
| Stale / unavailable data | Show an accurate freshness or connection message when it matters |
| No results | Repeat the search/filter context and offer to clear it |
| No records | Explain what belongs here and offer the permitted next action |
| Access denied | Explain unavailability without exposing the restricted record |
| Unsaved edits | Indicate pending changes and protect them when leaving |

**Feedback and dismissal:** preserve Timeline’s Undo contract, duplicate error collapse, maximum three visible error toasts plus a counter, and placement clear of controls. Keep the global sync pill and the dock’s existing “Changes saved” area; wire saving/failure states to that area rather than adding duplicate permanent indicators. Where future external actions cannot be undone, describe the consequence before committing and never offer a false Undo.

Keep one menu/popover open at a time and Escape unwinding exactly one layer. Preserve keyboard shortcuts, 400ms effect tooltips, 120–180ms hover/menu motion, 240ms overlays, and reduced-motion behavior. Tooltips must also be available on focus where relevant.

Do not claim “Synced” or show a last-updated timestamp unless it reflects real system state. Avoid decorative totals that do not help a decision. Explain data ownership where it affects editing; keep list names, endpoint details, and integration mechanics out of ordinary product flows.

**Permission presentation:** omit irrelevant restricted navigation for ordinary users. If discovery and an access request are useful, show a concise locked state without confidential detail. This is a product decision per workflow, not a universal rule to display every locked tab.

Hiding a tab is not authorization. Restricted values must not be sent to an unauthorized browser, hidden in the DOM, embedded in exports, or exposed through search results. Where sensitive and common fields share a source, the data architecture must provide enforceable access boundaries. The wireframes do not prove that the current SharePoint lists provide those boundaries. Existing view-as and viewer grants provide workflow presentation, not a security boundary. Keep the real account identity distinct from the previewed role. Do not place HR data or confidential notes into the broadly loaded Staff records; sensitive tabs and exports wait for enforceable restricted data access. This does not block a restyle of existing nonsensitive screens.

## 9. Responsive and accessible behavior

For new business screens, use the prototype’s 900px and 650px breakpoints as starting points. Preserve existing Timeline breakpoints (including 1400/1250/1100/900/820/560 where used) until each affected layout is migrated and checked. Do not replace all media queries or force the Gantt into a phone-card layout.

| Width | Behavior |
|---|---|
| Above 900px | Full sidebar; multi-column record content when useful |
| 651–900px | Narrower sidebar around 144px; stack record-body columns; reduce secondary gaps |
| 650px and below | Local navigation becomes an accessible compact menu or short horizontal list; records become a single column; actions wrap |

For Clients on narrow screens, prefer an index view followed by a record view with a clear Back to clients link. The prototype's two-column client tile index is optional, not required. Retain selection and filters when returning.

Use horizontal scrolling for genuinely tabular comparisons; otherwise prioritize columns and make omitted details available in the record. Never silently remove the only route to an action or essential fact. Portal cards move from three columns to two to one as content requires.

**Acceptance targets:** readable text contrast of at least 4.5:1 for normal text; meaningful control boundaries and focus indicators at least 3:1 against adjacent surfaces. Pale panel dividers are decorative and are not sufficient input boundaries. Confirm actual combinations, including hover, selected, disabled, and dark states.

All controls need visible keyboard focus. Use at least a 2px focus outline with separation from the component; on a blue button use a contrasting ring. For new chrome, keep desktop interactive targets at least 32px where feasible and use at least 44px for coarse-pointer layouts. Retain the canvas’s established 24px baseline and narrowly scoped exceptions: the calendar’s level-0 strip and resize-edge handles cannot simply grow without stealing neighboring hits. Preserve them pending a dedicated interaction improvement; expose usable legend controls and date-field equivalents. A documented exception is not a claim of accessibility conformance. Support zoom and text growth; never encode status by color alone. Honor reduced-motion preferences. These are implementation targets, not a completed accessibility certification.

## 10. Copyable token foundation

This is a framework-independent starting point. **In Timeline, declare tokens in its existing `:root` block**, then scope migrated component selectors to the relevant chrome. New apps can use the same token declarations in `:root` and `.twoseven-app` for component styles. The dark block is for validated new applications only. Do not paste it over Timeline’s entire stylesheet.

```css
:root {
  color-scheme: light;
  --ts-paper: #f5f7fa;
  --ts-panel: #ffffff;
  --ts-sidebar: #edf1f7;
  --ts-soft: #f8fafd;
  --ts-text: #1b2537;
  --ts-muted: #596b81;
  --ts-line: #c9d4e3;
  --ts-control-line: #7c8ba0;
  --ts-link: #245fc9;
  --ts-selected: #eaf2ff;
  --ts-action: #2f6fe4;
  --ts-action-hover: #1d5ac9;
  --ts-on-action: #ffffff;
  --ts-success-text: #236847;
  --ts-success-bg: #eaf4ee;
  --ts-warning-text: #895b11;
  --ts-warning-bg: #fff4db;
  --ts-danger-text: #b42318;
  --ts-danger-bg: #fff0ee;
  --ts-header-start: #2a3850;
  --ts-header-end: #202c41;
  --ts-header-text: #edf3fc;
  --ts-header-line: #576882;
  --ts-font: Bahnschrift, "Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
  --ts-mono: ui-monospace, "Cascadia Mono", "Segoe UI Mono", Consolas, "Roboto Mono", monospace;
  --ts-space-1: 4px;
  --ts-space-2: 8px;
  --ts-space-3: 12px;
  --ts-space-4: 16px;
  --ts-space-5: 20px;
  --ts-space-6: 24px;
  --ts-space-8: 32px;
  --ts-space-10: 40px;
  --ts-space-12: 48px;
  --ts-radius-chip: 4px;
  --ts-radius-control: 6px;
  --ts-radius-panel: 8px;
  --ts-radius-dialog: 10px;
  --ts-shadow-floating: 0 4px 18px rgba(13,19,29,.18);
}

.twoseven-app {
  color: var(--ts-text);
  background: var(--ts-paper);
  font: 13px/1.45 var(--ts-font);
}

:root[data-theme="dark"] {
  color-scheme: dark;
  --ts-paper: #172131;
  --ts-panel: #202d40;
  --ts-sidebar: #26364d;
  --ts-soft: #243247;
  --ts-text: #eef2f8;
  --ts-muted: #acbbce;
  --ts-line: #43536b;
  --ts-control-line: #8a9bb3;
  --ts-link: #98bfff;
  --ts-selected: #2b4163;
  --ts-success-text: #93d9b3;
  --ts-success-bg: #213d33;
  --ts-warning-text: #edc67a;
  --ts-warning-bg: #433723;
  --ts-danger-text: #ffb4ab;
  --ts-danger-bg: #442a2d;
}

.twoseven-app *, .twoseven-app *::before,
.twoseven-app *::after { box-sizing: border-box; }

.twoseven-app :is(button, input, select, textarea) { font: inherit; }
.twoseven-app :focus-visible {
  outline: 2px solid var(--ts-link);
  outline-offset: 2px;
}
.twoseven-app .ts-primary:focus-visible {
  outline: 2px solid var(--ts-text);
  outline-offset: 3px;
}
.twoseven-app .ts-primary {
  min-height: 32px;
  padding: 6px 12px;
  border: 1px solid transparent;
  border-radius: var(--ts-radius-control);
  color: var(--ts-on-action);
  background: var(--ts-action);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}
.twoseven-app .ts-primary:hover:not(:disabled) {
  background: var(--ts-action-hover);
}
.twoseven-app .ts-primary:disabled {
  color: var(--ts-muted);
  background: var(--ts-soft);
  border-color: var(--ts-line);
  cursor: not-allowed;
}
.twoseven-app .ts-panel {
  background: var(--ts-panel);
  border: 1px solid var(--ts-line);
  border-radius: var(--ts-radius-panel);
}
.twoseven-app .ts-input {
  min-height: 36px;
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--ts-control-line);
  border-radius: var(--ts-radius-control);
  color: var(--ts-text);
  background: var(--ts-panel);
}
@media (pointer: coarse) {
  .twoseven-app :is(.ts-primary, .ts-input, .ts-icon-button) {
    min-height: 44px;
  }
  .twoseven-app .ts-icon-button { min-width: 44px; }
}
```

**Legacy mapping is selective:** identical base tokens may alias `--paper` → `--ts-paper`, `--side` → `--ts-sidebar`, `--side-line` → `--ts-line`, `--txt` → `--ts-text`, `--acc` → `--ts-action`, and `--acc-deep` → `--ts-action-hover`. Retain existing `--sans`/`--mono` declarations and local font-face behavior; connect new aliases without rewriting the fallback implementation. Do **not** globally alias `--ink` to `--ts-text`: `--ink` is also the contrast calculator’s dark candidate. Keep `--ink-2`, `--warn`, `--late`, project/department constants, `--row-h`, and legacy radii unchanged until their specific consumers are reviewed. Replace low-contrast chrome text usages with `--ts-muted`, rather than blindly recoloring every use of a legacy variable.

The component sample is intentionally limited. Navigation, tables, dialogs, validation, and permission handling require semantic markup and application behavior, not CSS alone. Resolve a system-theme preference into the explicit theme attribute if the app supports it; persist a user's explicit choice.

## 11. Implementation and review

Build a small shared set of primitives before duplicating pages: AppShell, AppSwitcher, PageHeader, Button, Field, DataTable, StatusChip, RecordPanel, Tabs, Dialog, and FeedbackState. These are conceptual components; no new framework is required. The existing vanilla-JavaScript Timeline can use shared styles and functions. Keep a single token source in the current `:root`; extract a versioned `common.css` when sibling apps consume it. Vendored copies are acceptable only as generated, pinned artifacts with a single upstream source and a drift check. Do not alter Entra redirect URIs or deployment configuration as an incidental styling edit.

Keep one versioned token source and component specification for the suite. Independent deployments can consume a shared package or a controlled versioned stylesheet. Do not maintain five diverging copies of a file called “shared.” Application data has its own source-of-truth contracts; sharing CSS does not establish data parity.

### Review checklist

- [ ] Header, title, navigation, and primary action are immediately identifiable.
- [ ] Spacing, colors, typography, and radii use the shared tokens.
- [ ] Portal positions and app navigation remain stable for returning users.
- [ ] Buttons perform actions; links navigate; keyboard focus is visible.
- [ ] Empty, loading, error, saved, and restricted states are designed and connected to real behavior.
- [ ] Inputs have labels; statuses have words; icon-only controls have names.
- [ ] Key workflows work at 1366px, 1024px, 768px, and 390px widths and with enlarged text.
- [ ] Text, input boundaries, and focus indicators meet their contrast targets in the themes being shipped.
- [ ] Sensitive fields are protected at the data boundary, including exports and search.
- [ ] Existing Timeline color meanings, density modes, and scheduling interactions are preserved.
- [ ] No prototype-only fixed heights, fictional totals, fake sync indicators, or inert controls remain.

### Implementation brief for Claude Code or another development agent

> Use the TwoSeven Application Style Guide v1.1 as the visual and interaction standard for the requested change. First inspect the existing application and its local instructions. Reuse established structures and introduce shared semantic tokens rather than new per-page styling. Preserve the dark TwoSeven header, compact information density, pale work surfaces, restrained blue actions, and clear record tabs. Follow the guide's component dimensions and state behavior. Preserve Timeline’s scheduling semantics, owner interaction rulings, specialized canvas geometry, bottom inspector, Undo, autosave, print output, and existing role gates. Read §12 before resolving a conflict. New visual specifications apply to migrated chrome; do not globally replace legacy canvas tokens. Separate routing or workflow changes from a CSS restyle. Implement only the requested feature scope; navigation examples in the guide are not instructions to build additional features. Use real shared records and enforce permissions outside the UI. Verify the affected workflow, keyboard access, narrow-screen behavior, and relevant visual states. Explain any necessary departure from the guide and propose a shared rule before creating a one-off exception.

### Maintaining the guide

When a new requirement cannot fit an existing pattern, document the need, add or revise a shared pattern, and record the version change. Keep product-specific exceptions explicit. Evaluate consistency by how quickly a person can recognize a page and complete a task. Retain `Style-Guide.md` as an as-built inventory and this document as the target. Update `Design-Language.md` alongside implementations that change its chrome rules; retain its owner decisions and historical exceptions until deliberately superseded.

## 12. Retain, revise, retire: decisions and rationale

These decisions adapt the target guide; they do not assert that changes are implemented. **Retain** protects the existing convention. **Revise** specifies the new visual target for the named surface. **Proposal** identifies a separate functional improvement, not a restyle requirement.

### A. Data meaning and accessibility

| Detail | Decision | Rationale and implementation constraint |
|---|---|---|
| Stable project colors and existing department palette | **Retain** | Familiar identity colors help users follow work between views. Preserve ID-based allocation, collision handling, reserved slots, and department mappings. Do not recolor for fashion or add client/app identity palettes. |
| White labels on solid project/department bars | **Retain** | The palette was deliberately darkened to support consistent white text. Preserve the palette contrast test and `labelColor()` for other colored surfaces. Do not replace it with a luminance shortcut. |
| On-hold hatch/desaturation, estimating stripe, forecast gray/dash/opacity | **Retain semantics; verify composited legibility** | Redundant treatments communicate status when hue cannot be distinguished. Forecast remains the explicit exception to project hue, including install bars. Preserve its reserved project color. Test final rendered labels, not only source hex values. |
| Install/shipping red, Today line, deadline pennants, milestone diamonds, note circles | **Retain** | Position and shape distinguish different meanings. Do not collapse them into generic red warnings or replace them with indistinguishable dots. Preserve `#CE4242` and the separate `--late` role. |
| Quiet/Vivid months, holiday/weekend treatments, zoom degradation ladder | **Retain** | These support temporal orientation and learned reading patterns. Follow the later Vivid exception: do not reintroduce the Quiet hatch into Vivid months. Print remains Quiet. |
| Low-contrast labels and pale field borders | **Revise** | Muted information must still be readable, and inputs must be identifiable. Use the new muted and control-border tokens on chrome. Separately correct proven canvas label failures without changing project identity or calendar meaning. |
| Non-color status cues | **Retain and extend** | Pattern, text, shape, and accessible names are more dependable than increasing the number of hues. Hue spacing alone is not a color-vision-accessibility guarantee. Check grayscale and representative color-vision simulations alongside contrast. |
| Canvas status pills versus business-record statuses | **Scope by meaning** | Preserve existing project-status text and colors wherever the same project status is represented, including cross-app project history. Do not show a neutral “Fabrication” chip in Clients and a colored version in Timeline solely because the container differs. Generic availability, save, and validation states use neutral/success/warning pairs. Any eventual project-status palette simplification must be coordinated across all its views. |
| `labelColor()`, shaded children, and forecast opacity | **Retain calculator; expand validation** | `kidShade()` and other pale fills still need contrast-selected labels. The source's “always white bars” and light child-fill exception must be interpreted together: do not force white onto a shaded child that requires dark text. Compositing is also part of the calculation. |

**Checks performed for this revision:** calculated white-text contrast against the 12 listed solid project colors; the minimum is approximately **4.64:1** (`#A8642C`). The proposed muted text is approximately **5.46:1** on white; the stronger control border is **3.47:1**. Existing header secondary text `#8CA0BF` on the top of the header gradient `#2A3850` is approximately **4.44:1**, so it should be replaced for normal-sized informational text.

**Important limitation:** solid palette contrast does not establish rendered accessibility. As an illustration, `#6B7484` at 40% opacity over white becomes approximately `#C4C7CE`; white text on that composite is only **1.69:1**. This is a calculation of a possible rendering, not a live-app finding. Inspect whether the actual opacity affects the fill, the text, or the whole bar and test all underlying surfaces. If it fails, retain the gray/dashed forecast language but propose full-opacity readable labels or a contrasting label backing; do not silently remove the status treatment. The complete department palette and interactive states were not supplied as executable components and have not been certified here.

### B. Appearance and existing working conventions

| Detail | Decision | Why |
|---|---|---|
| Dark navy header, light paper, sidebar gray, blue action | **Retain** | Already close to the desired wireframes; provides continuity with little migration cost. |
| Structural line `#C9D4E3` | **Retain** | Its difference from the prototype is negligible. Standardize usage rather than churn the value. |
| Sentence case, stronger title hierarchy, restrained 600-weight chrome headings | **Revise** | Makes general business screens easier to scan and less bespoke. Do not globally cap logo, print, or canvas weights. |
| Mono dates/codes/day counts and complete platform font stacks | **Retain with contextual use** | Supports aligned work-order reading and consistent rendering. Long narrative dates may use sans. Removing fallbacks has no aesthetic payoff. |
| 9px decorative labels | **Retain only as a narrow legacy exception** | Existing specification already forbids essential microtext. New screens need no new 9px role; meaningful labels move to at least 11px. |
| 4/6/8/10px chrome radii, consistent padding, bordered secondary buttons | **Revise migrated chrome** | These are substantive parts of the wireframes' cleaner appearance. Preserve 5/8/14px legacy tokens for canvas and unmigrated consumers rather than changing their meanings globally. |
| Floating shadow, toolbar elevation, scrim | **Retain shared existing values** | The existing restrained treatment works. Remove accidental resting card/empty-state shadows and decorative blur; preserve canvas depth and useful toolbar separation. |
| Lock dates / Pin amber state | **Retain exception** | Amber already identifies a protective editing condition. Converting it to generic blue reduces learned meaning without solving a user problem. Label the state explicitly. |
| Inline outline SVG, consistent hit areas and focus | **Retain and improve** | Existing icon convention already fits the target. Strengthen focus and input contrast; keep canvas semantic glyphs distinct. |
| Larger new chrome controls | **Revise** | 32px buttons and 36px inputs improve use without making screens oversized. Coarse-pointer controls grow to 44px; canvas dimensions are not global button dimensions. |
| Read-first master/detail, explicit Edit, relationship-aware removal | **Retain** | Reduces accidental edits and communicates consequences. Tabs add organization as records gain content; they do not make every property an always-editable field. |
| “Shop drawing” as a universal design requirement | **Retire** | It can force decorative conventions onto unfamiliar business tasks. Preserve the practical qualities, not a metaphor users must learn. |

### C. Interaction and architecture boundaries

| Detail | Decision | Why / boundary |
|---|---|---|
| Bottom inspector, four columns, resizable/collapsible dock | **Retain** | Keeps schedule and editing context together. Restyle its fields in place; do not replace it with a generic record card or impose tabs without a task-specific reason. Preserve per-user height/collapse state. |
| Shared popover/dock fields and commit path | **Retain** | Both edit surfaces must read and write the same record. The visual refresh must not create a second draft or divergent save path. |
| Autosave, record-local “Changes saved,” global sync pill | **Retain; complete failure states** | The Design Language already specifies local feedback. Check the implementation before adding another indicator. A global sync state and a record-save result answer different questions. |
| Undo toasts, escape order, one menu at a time, reduced motion | **Retain** | Supports recovery and predictable interaction, including experienced keyboard users. Keep the existing 400ms tooltip timing and established motion durations. |
| Single-click, drag, resize, double-click and keyboard meanings | **Retain** | These are deliberate owner rulings, not visual styling. Preserve ~3px click/drag discrimination, workday snapping, protection locks, both-edge resizing, and named keyboard paths. |
| Calendar detail levels and small strips | **Retain as a documented exception** | Preserve 0→1→2 cycling, marker-text toggles, multi-expansion, and Collapse all. Do not infer behavior from the earlier superseded selection-only expansion description. Improve alternate access instead of overlapping hit zones. |
| REV61 subtask creation and “right-click adds” | **Retain in a style-only migration; optional improvement proposed** | Agenda creation already has visible buttons. Subtask creation deliberately lacks an editor add button. A future visible **Add subtask** action outside the compact edit popover could improve discovery while keeping right-click/S as accelerators; implementing it must explicitly amend REV61 rather than claim it is already required by this guide. Do not add destructive items to the chart's add menu. Preserve the separately documented marker-delete exception. |
| Universal three-path rule | **Retain Timeline's documented paths and exceptions; do not export literally** | New business apps require visible pointer and keyboard access. Context-menu duplication is useful for repeated canvas operations, not every form action. Keyboard operability does not require a dedicated shortcut for every button. |
| “Done,” ×, breadcrumb, Esc | **Retain existing Timeline exits** | “Done” is legitimate for finishing an autosaved editing session. Add ordinary Back links to new apps and route migration; preserve draft-discard handling and Escape's layer order. |
| Scheduling model | **Retain without expansion** | Backward scheduling seeds creation; phases are independent afterward. No new dependencies, ripple, overlap warnings, or overlap settings. Preserve Milestone/Note terminology and existing stored field names. |
| Dashboard versus another person's Summary | **Retain** | Preserve self/other identity, personal-note presentation, locked lens behavior, and person/filter reset semantics. Do not normalize these into a generic dashboard that loses scope. |
| Single-section rail omission and anchored app switcher | **Adopt** | Prevents two sidebars on Timeline while retaining common suite navigation. Only expose actual deployed destinations. |
| New header geometry, deep links, new record tabs | **Separate implementation work** | These require layout/routing behavior, not hex substitutions. Keep the existing contextual control grouping, rederive offsets, preserve history, and test real record selection on direct entry. |
| Theme rollout | **Defer Timeline dark mode** | Literal colors and canvas assumptions need a complete migration. New app dark mode is optional and must be validated separately. |
| Permissions and sensitive records | **Retain gates; require real access controls for expansion** | Viewer/view-as presentation is not authorization. Keep Clients' current gate; sensitive People/Financials features need protected data before they are exposed. No role or schema changes are implied by this document. |
| Print and Meeting Sheet | **Retain** | These are working report artifacts, not app chrome. Preserve the header block, mono values, print hierarchy, Quiet output, and Notes space. |

### D. Differences from the transition review

The review is useful as a migration inventory, but this revision deliberately narrows several recommendations:

- The Design Language lists **5/8/14px** radius tokens; the review's “6px already agrees” describes some shipped controls, not the governing token set. Keep that distinction during mapping.
- Save feedback and agenda creation buttons are **already specified**. Audit their actual behavior rather than assume they are missing.
- Do not automatically turn protective amber toggles blue, neutralize project-status chips in only some views, delete every resting shadow, retire useful mono values, or replace “Done.” These changes have weak benefit relative to continuity or semantic consistency.
- Do not impose the 168px app rail on Timeline, force every dialog to 440px, remove all legacy breakpoints, or force the four-column dock into tabs.
- The attached Design Language contains historical rulings and later amendments. Later calendar detail levels, edit-popover behavior, and marker exceptions govern; the most general earlier sentence is not always the current rule.

## 13. Migration sequence and acceptance gates

1. **Establish a baseline.** Capture affected surfaces and states; record applicable owner rulings, routes, role behavior, and current tests. Keep this guide as target and the as-built inventory as evidence of progress.
2. **Introduce tokens and fix readability.** Add tokens to existing `:root`; alias only equivalent base values. Migrate chrome muted text and input borders. Extend contrast coverage to actual rendered/composited cases where opacity or shading matters.
3. **Restyle one chrome surface at a time.** Apply type hierarchy, spacing, radii, consistent fields, focus, and buttons. Preserve event semantics. Add modal focus trapping/restoration where absent. Do not simulate unavailable future features.
4. **Migrate the shell as a coherent change.** Add the global header and real app switcher when destinations exist. Keep Timeline's contextual row and single-section rail exception. Replace scattered offsets such as `top:92px` with one measured layout or shared height source that also handles wrapping; update coupled geometry tests.
5. **Migrate business pages and routing.** Introduce read-first tabbed records where useful, sorting, separate no-results/empty states, anchors, and per-record routes. Test direct entry, browser Back, new tabs, retained filters/selection, and unsaved forms. Do not broaden permissions incidentally.
6. **Handle functional proposals separately.** A visible subtask action, new mobile canvas interaction, or phase-label compositing change gets its own documented rationale and behavior verification. Keep HR/financial expansion separate from the restyle until access boundaries exist.
7. **Update documentation with each implemented surface.** Amend superseded chrome clauses in `Design-Language.md`, update the as-built inventory, and preserve remaining owner rulings. Use CSS-first PRs, before/after `/preview/` screenshots, and `docs/Milestones/` records. Follow existing version/changelog policy for visible changes.

**Verification:** run the affected behavior and geometry checks, palette/contrast checks, keyboard and focus flows, reduced-motion behavior, and responsive review. Preserve mirrored CSS/JavaScript row-height tests. The review reports source-regex tests (`test-v171`, `test46`, `test-quiet`, `test-c3-status`, `test-b4`, `test-contrast`, `test-b5`, `test-cb`) and reference-build guards: inspect those tests before editing, update assertions only for intentional specification changes, and retain their behavioral coverage. Do not delete a test simply because new formatting no longer matches its regex. Run the repository's required full gate before merge.

**Not performed by this revision:** application code changes, live visual verification, role/schema migration, a complete accessibility audit, or deployment. This is the revised implementation standard and rationale.
