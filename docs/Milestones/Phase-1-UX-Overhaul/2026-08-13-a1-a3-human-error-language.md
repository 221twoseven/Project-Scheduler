# Human error language + sign-in card (A1, A3) — 2026-08-13

**What changed.** Every error and status message a user can see now reads as a plain
sentence — what happened, and what to do about it — instead of developer-speak. The raw
technical error (the MSAL/Graph message a maintainer needs) still exists, but it's tucked
behind a collapsible **Details** inside the toast rather than printed in the user's face.
Example: *"Sign-in or SharePoint load failed: endpoints_resolution_error…"* is now
*"Couldn't sign in or reach SharePoint. Check your connection, then use 'Sign in with
Microsoft' to try again."*

**Sign-in is now unmissable.** A signed-out visitor used to see only a tiny mono
`● offline` pill in the corner and a blank grid. Now the canvas shows a card: what the
app is ("The shared shop schedule — every project, phase and deadline in one place"),
one **Sign in with Microsoft** button, and nothing else. The button re-runs the normal
sign-in and load path; the auth flow, scopes, and Entra configuration are untouched. The
pill stays as pure status.

**The canvas never goes silently blank.** The empty-state card now always appears when
no projects are visible, with copy matched to the reason: signed out → the sign-in card;
signed in with no projects → the existing "Nothing scheduled yet" teach card; projects
all hidden by the status filter → "Click ⟲ Clear filters in the toolbar to see them
again." A failed sign-in also no longer fires a second staff-list error toast — one
problem, one toast.

**Bonus fix.** Toasts were unclickable (`#toasts` had `pointer-events:none`), which
silently broke the Undo button inside undo toasts. Fixed, and toasts now pause their
auto-dismiss while hovered so Undo and Details are actually reachable.

**Rev/refs.** UX audit findings A1 (P1) and A3 (P2), Phase 1 item 2; copy per
Design-Language §1. REV 52, `index.html` only. All 276 legacy assertions pass.

**Ceiling.** Error toasts still auto-dismiss after ~5s (hover to hold them); a persistent
error banner with an explicit close is the upgrade if that proves too fleeting. The
"all hidden" card only knows about the status filter, not search/spotlight — the sidebar's
own "Nothing to show" message still covers those.
