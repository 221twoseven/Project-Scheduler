# 2026-08-20 — Draft autosave (REV58)

**What happened:** a PM filled in a whole new project, switched tabs for a while, came
back, and everything they'd entered was gone — the page showed factory defaults.

**Why:** there is no timeout in the app. The unsaved draft (form fields plus everything
drawn on the chart) lived only in JavaScript memory. Modern browsers put background tabs
to sleep to save memory (Edge and Chrome both do this by default); coming back to a
slept tab silently reloads the page. The web address survives that reload, the memory
does not — so the app dutifully started a brand-new blank draft. The "discard this
unsaved project?" warning never fires on that path, because the browser doesn't count
putting a tab to sleep as leaving the page.

**The fix (REV58):** the draft now autosaves to the browser's per-tab storage
(`sessionStorage`) whenever the tab goes to the background, and is picked back up when
the draft page loads fresh. Filing the project with Create, or answering yes to the
discard warning, deletes the autosave — so the next new project always starts clean.
Per-tab storage was chosen deliberately: it survives the sleep/reload cycle but dies
with the tab, so no half-finished draft lingers on a shared shop terminal.

- Suite: `tests/test58.js` (13 assertions — stash, restore, clean-exit cleanup, and the
  saved-project page asserted to never stash; skips on pre-REV58 builds).
- PR: follows on `development` after REV57 (PR #15 carries REV53–57; this rides the
  next promotion).

**Ceilings:** the stash is written when the tab is hidden or unloaded, not on every
keystroke — a browser *crash* while the draft tab is in the foreground still loses it.
Autosave covers the sleep/discard case that was actually reported; move the stash into
the input handlers only if a crash report ever comes in.
