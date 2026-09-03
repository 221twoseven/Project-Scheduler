# 2026-08-12 — Two-tier toolbar: global chrome vs. timeline controls

**What changed.** The single mixed toolbar was split into two stacked rows so that
app-wide actions and view-specific controls no longer sit side by side.

- **Row 1 — global:** `TWOSEVEN · Shop Timeline` · `+ New Project` · `Print ▾`
  (Print Timeline / Meeting Sheet) · `Settings ▾` (People & Availability; a static
  `REV nn` line) · sync-status pill.
- **Row 2 — timeline controls:** Today · Days/Weeks · Search · `Status ▾` ·
  Clear filters · `View ▾` (Color by Project/Team, Calendar tint) · Protect Dates.

Renames: Staff → **People & Availability** (now under Settings), Meeting →
**Meeting Sheet** (grouped with Print), Print → **Print Timeline**, Reset →
**Clear filters**, Lock dates → **Protect dates**. The REV number left the brand block
and now shows only inside the Settings menu. Tint moved from a standalone button into
`View ▾` as "Calendar tint".

**Why it mattered.** The old bar gave equal weight to "what the app does" and "how this
view looks", so nothing signalled hierarchy. Grouping global actions above the
view controls makes the distinction legible and clears room for the upcoming Project
editor to swap in its own row-2 controls.

**How it works.** `#toolbar` became a `flex-direction:column` of two `.tb-row`
flex rows; the existing ResizeObserver that offsets `#main` still reads the toolbar's
height, so no layout math changed. The three new dropdowns reuse the existing Status
menu pattern — a `.tb-menu` inside a `.sf-wrap`, opened one-at-a-time via a shared
`wireMenu()`/`closeMenus()` helper, closed on outside-click or Esc. Every original
button ID and its handler was preserved; only DOM position and three wrappers changed.

**Scope.** Phase 1 of the UX pass (Navigation & Menu Bars). Next: the New Project /
Project editor workspace, then Calendar functionality. No SharePoint/Entra/schema
touched. All 276 jsdom assertions (test46–50, test-label) pass. App REV unchanged (52).

**Ceiling / follow-up.** Row 2 is still the Timeline's controls even when a project is
open — making the editor replace them is the next milestone's job.
