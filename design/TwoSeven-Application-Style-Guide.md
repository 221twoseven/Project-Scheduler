# TwoSeven Application Style Guide

**Version 1.0 · September 27, 2026**  
**Scope:** the TwoSeven portal and applications, starting with People and Clients and extending to Timeline, Project Office, Tools, and Accounting.

## 1. Design intent

TwoSeven software should feel like a well-organized shop drawing: a dark title block, a quiet work surface, precise alignment, and information that can be scanned quickly. The interface supports real work without turning every page into a dashboard.

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

This guide governs new shared chrome and conventional business screens. Timeline's specialized schedule and color rules remain governed by its existing design language. Applying this guide is not authorization to change scheduling behavior, data ownership, or access policies.

## 2. Suite geography and navigation

| Layer | Purpose | Pattern |
|---|---|---|
| Portal | Choose a place to work; resume a recent record | Stable app cards and a compact recent-work list |
| Global header | Know which app is open; move between apps | TwoSeven wordmark, app name, app switcher, account control |
| App navigation | Move between this app's major sections | Narrow left sidebar on desktop |
| Record navigation | Explore one person, client, or project | Record title and horizontal tabs |
| Contextual action | Work on the current page or record | Page action area, record actions, or a short overflow menu |

Do not put every app's internal pages into one universal sidebar. Apps are separate destinations with a familiar shell. Use real links for destinations so open-in-new-tab, history, and deep links work normally.

**Portal default:** the stable launcher layout. Keep app positions predictable; show a one-sentence purpose beneath each name. Recent work helps returning users without displacing the primary destinations. A task-led work desk is optional when task ownership and freshness are dependable. A search-led directory becomes useful only as the ecosystem grows; it should not make users search for six familiar apps.

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

Use semantic tokens rather than copying hex values into individual components. The latest People/Clients palette is the common baseline; it replaces the small neutral-color variations between the prototypes.

| Token | Light | Dark | Use |
|---|---|---|---|
| `paper` | `#F5F7FA` | `#172131` | Page canvas |
| `panel` | `#FFFFFF` | `#202D40` | Records, tables, cards, dialogs |
| `sidebar` | `#EDF1F7` | `#26364D` | Local navigation surface |
| `soft` | `#F8FAFD` | `#243247` | Table headers, restrained callouts |
| `text` | `#1B2537` | `#EEF2F8` | Primary text |
| `muted` | `#596B81` | `#ACBBCE` | Secondary text and labels |
| `line` | `#CBD5E3` | `#43536B` | Decorative dividers and panel edges |
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

The header stays dark in both themes: gradient `#2A3850` → `#202C41`, text `#EDF3FC`, separator `#576882`. Use gradients only in this established shell treatment. Resting panels have no drop shadow.

**Color meaning:** blue is interaction or selection; green and amber supplement written statuses; neutral surfaces carry ordinary information. Do not assign decorative identity colors to each app or client. Timeline project and department colors are data encodings: preserve their established mappings, patterns, opacity, and exceptions. A red schedule bar is not a generic error message.

Dark tokens reflect the prototype's paired palette. They are a starting standard, not a claim that every existing Timeline screen has been audited in dark mode. Validate complete components before releasing either theme.

## 4. Typography and brand

Use `Bahnschrift, "Segoe UI", Arial, sans-serif` for UI text. Use `"Cascadia Mono", Consolas, monospace` for cost codes, identifiers, and compact technical values. Use tabular numerals for aligned amounts and numeric columns. Names, descriptions, and long dates stay in the sans-serif face.

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

Use sentence case. Reserve spaced uppercase for the wordmark or very short grouping labels. Avoid shrinking essential information below 11px. Let text wrap rather than forcing fixed-height containers.

Use the existing licensed TwoSeven wordmark asset or its established Brauer Neue treatment when available. The prototypes' tracked system-font wordmark is a stand-in, not a new logo specification. Do not distribute licensed font files without the appropriate rights.

## 5. Spacing, geometry, and density

Use the spacing scale **4, 8, 12, 16, 20, 24, 32, 40, 48px**. Align page titles, toolbar content, and panel edges. Avoid many subtly different gaps.

| Element | Standard |
|---|---|
| Global header | Minimum 56px high; 16–20px horizontal padding |
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

**Radii:** chips 4px; controls 6px; cards and records 8px; dialogs 10px. Avatars may be circular in the account control; record initials use a restrained rounded square. Do not add oversized pill buttons or heavily rounded dashboard cards.

**Borders:** 1px. **Elevation:** none for resting content; a subtle shadow only for menus, popovers, and dialogs. Suggested floating shadow: `0 8px 28px #101B2C40`.

Density is task-specific. Do not expand Timeline's established 32/44/56px row modes or Gantt bar dimensions through generic table CSS. Scope conventional table styles to their components.

## 6. Core component contracts

### Page header and buttons

Place the title and optional one-line description on the left, primary action on the right. Put filters directly above the content they affect. Keep primary actions specific: **Add person**, **Add client**, **Save changes**.

| Variant | Appearance | Use |
|---|---|---|
| Primary | Blue fill, white text | Main forward action in the current task |
| Secondary | Panel fill, visible border, ink text | Export, cancel, secondary workflow |
| Quiet | No filled background; clear text or icon label | Low-priority actions and header controls |
| Destructive | Red text or a clearly labeled destructive confirmation | Delete, revoke, irreversible removal |

Avoid competing primary buttons in the same action group. Keep Save and Cancel in a predictable order throughout the suite. A navigation link must be an anchor; a state-changing action must be a button.

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

Use a dialog for a short focused task, approximately 440px wide, within the viewport, with a scrollable body when necessary. Use a full page for lengthy onboarding or a complex record editor. Trap focus within a modal and restore it to the invoking control on close. Warn before dismissing unsaved work.

Use one consistent outline icon family, normally 16px with a consistent stroke. Pair icons with words for unfamiliar actions. Icon-only controls need accessible names and tooltips; a 16px glyph still needs a usable hit area.

## 7. Application patterns

### People: find a person, then understand their role

The default directory is a compact table: name, role or department, contact details, and availability where useful. The selected person's detail panel presents Overview, Assignments, authorized Administration, and Activity.

Use an ordinary directory view for most staff. Office administration adds relevant actions and sections without replacing the familiar shell. Employment administration must not compete visually with everyday contact lookup.

Availability uses both a readable status and a color treatment. Distinguish a person's availability from project assignment and employment status. Keep ADP-owned information read-only or link to the owning system; do not create a second editable version of the same fact.

### Clients: keep relationship context beside project history

Use an approximately 215px client index beside a flexible record pane on wide screens. The selected client has a pale blue surface and a 3px leading blue rule. The record contains Overview, Contacts, Projects, authorized Financials, and Activity.

Prioritize primary contacts and relevant project history. Project rows expose dates, cost code, and team, with a clear link into Timeline when the user needs the delivery view. Financial columns appear only for authorized users and use right-aligned amounts with explicit currency context.

Do not add a unique client color. Client identity is its name and context; project colors retain their scheduling meaning.

### Future apps

Reuse the shell, type, controls, tables, record panels, and feedback patterns. Choose content structures by task: an accounting review table need not resemble a People profile, and a Tools catalog need not resemble a schedule. Consistency means familiar interaction, not identical pages.

## 8. Interaction, permissions, and truthful feedback

| State | Required presentation |
|---|---|
| Loading | Keep the shell stable; indicate the region being loaded |
| Saving | Keep the action's label or context; prevent duplicate submission |
| Saved | Brief local confirmation; do not interrupt with a modal |
| Error | Plain-language problem, retained work, and a useful retry or next action |
| Stale / unavailable data | Show an accurate freshness or connection message when it matters |
| No results | Repeat the search/filter context and offer to clear it |
| No records | Explain what belongs here and offer the permitted next action |
| Access denied | Explain unavailability without exposing the restricted record |
| Unsaved edits | Indicate pending changes and protect them when leaving |

Do not claim “Synced” or show a last-updated timestamp unless it reflects real system state. Avoid decorative totals that do not help a decision. Explain data ownership where it affects editing; keep list names, endpoint details, and integration mechanics out of ordinary product flows.

**Permission presentation:** omit irrelevant restricted navigation for ordinary users. If discovery and an access request are useful, show a concise locked state without confidential detail. This is a product decision per workflow, not a universal rule to display every locked tab.

Hiding a tab is not authorization. Restricted values must not be sent to an unauthorized browser, hidden in the DOM, embedded in exports, or exposed through search results. Where sensitive and common fields share a source, the data architecture must provide enforceable access boundaries. The wireframes do not prove that the current SharePoint lists provide those boundaries.

## 9. Responsive and accessible behavior

Use the prototype's 900px and 650px breakpoints as starting points, then adjust based on content rather than device names.

| Width | Behavior |
|---|---|
| Above 900px | Full sidebar; multi-column record content when useful |
| 651–900px | Narrower sidebar around 144px; stack record-body columns; reduce secondary gaps |
| 650px and below | Local navigation becomes an accessible compact menu or short horizontal list; records become a single column; actions wrap |

For Clients on narrow screens, prefer an index view followed by a record view with a clear Back to clients link. The prototype's two-column client tile index is optional, not required. Retain selection and filters when returning.

Use horizontal scrolling for genuinely tabular comparisons; otherwise prioritize columns and make omitted details available in the record. Never silently remove the only route to an action or essential fact. Portal cards move from three columns to two to one as content requires.

**Acceptance targets:** readable text contrast of at least 4.5:1 for normal text; meaningful control boundaries and focus indicators at least 3:1 against adjacent surfaces. Pale panel dividers are decorative and are not sufficient input boundaries. Confirm actual combinations, including hover, selected, disabled, and dark states.

All controls need visible keyboard focus. Use at least a 2px focus outline with separation from the component; on a blue button use a contrasting ring. Keep desktop interactive targets at least 32px where feasible and use at least 44px for coarse-pointer layouts. Support zoom and text growth; never encode status by color alone. Honor reduced-motion preferences. These are implementation targets, not a completed accessibility certification.

## 10. Copyable token foundation

This is a framework-independent starting point. Merge into the project's established styling structure, scope selectors to the relevant shell, and map existing tokens deliberately. Do not paste it over Timeline's entire stylesheet.

```css
.twoseven-app {
  color-scheme: light;
  --ts-paper: #f5f7fa;
  --ts-panel: #ffffff;
  --ts-sidebar: #edf1f7;
  --ts-soft: #f8fafd;
  --ts-text: #1b2537;
  --ts-muted: #596b81;
  --ts-line: #cbd5e3;
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
  --ts-font: Bahnschrift, "Segoe UI", Arial, sans-serif;
  --ts-mono: "Cascadia Mono", Consolas, monospace;
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
  --ts-shadow-floating: 0 8px 28px #101b2c40;
  color: var(--ts-text);
  background: var(--ts-paper);
  font: 13px/1.45 var(--ts-font);
}

.twoseven-app[data-theme="dark"] {
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

The component sample is intentionally limited. Navigation, tables, dialogs, validation, and permission handling require semantic markup and application behavior, not CSS alone. Resolve a system-theme preference into the explicit theme attribute if the app supports it; persist a user's explicit choice.

## 11. Implementation and review

Build a small shared set of primitives before duplicating pages: AppShell, AppSwitcher, PageHeader, Button, Field, DataTable, StatusChip, RecordPanel, Tabs, Dialog, and FeedbackState. These are conceptual components; no new framework is required. The existing vanilla-JavaScript Timeline can use shared styles and functions.

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

> Use the TwoSeven Application Style Guide v1.0 as the visual and interaction standard for the requested change. First inspect the existing application and its local instructions. Reuse established structures and introduce shared semantic tokens rather than new per-page styling. Preserve the dark TwoSeven header, compact information density, pale work surfaces, restrained blue actions, and clear record tabs. Follow the guide's component dimensions and state behavior. Preserve Timeline's existing scheduling color semantics and specialized canvas styles. Implement only the requested feature scope; navigation examples in the guide are not instructions to build additional features. Use real shared records and enforce permissions outside the UI. Verify the affected workflow, keyboard access, narrow-screen behavior, and relevant visual states. Explain any necessary departure from the guide and propose a shared rule before creating a one-off exception.

### Maintaining the guide

When a new requirement cannot fit an existing pattern, document the need, add or revise a shared pattern, and record the version change. Keep product-specific exceptions explicit. Evaluate consistency by how quickly a person can recognize a page and complete a task—not by whether every screen has the same number of cards.
