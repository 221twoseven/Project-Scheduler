# 2026-08-20 — Left-click editor cleanup (REV61)

Robert's project-edit notes, applied to both left-click editing surfaces: the popover
that opens on a draft bar, and the inspector pane on a saved project. Right-click
menus are untouched.

**What changed:**

- **The +Subtask / +Event / +Task buttons are gone from both surfaces.** They
  duplicated the right-click menus (and the S/E/T keys, which still work). Left-click
  now only edits; right-click creates — the split N11 established, finished.
- **"Who" moved to its own line above Start / End / Days**, in the popover and the
  inspector both.
- **"Who" is always a picker fed by the people list** — no more free-typing names.
  The draft popover uses the department roster when one exists, the full people list
  otherwise. Install keeps a crew (multi-select checkboxes, reusing the staff modal's
  crew-list styling); everyone else picks one name.
- **Draft popover Start/End are editable.** They used to be read-only ("drag the bar
  instead"); now they commit exactly like a drag — snapped forward to a workday, days
  recounted, stored in the draft's manual overlay so the scheduler doesn't undo them
  (N13's rule, per-bar).

**The bug that prompted the "character limit?" question:** there is no character
limit. The popover closed itself when typing (or drag-selecting) past the Who field's
visible edge because a capture-phase "close on scroll" listener heard the *input
scrolling its own text* and treated it as a page scroll. The listener now ignores
scrolls that originate inside the popover; the right-click menu's inline name field
had the same trap and got the same fix.

- Suite: `tests/test61.js` (21 assertions, draft and saved paths; skips pre-REV61).
  `test50`'s read-only-dates assertion is feature-gated to pre-REV61 builds.
- PR: rides the open promotion PR
  ([#15](https://github.com/221twoseven/Project-Scheduler/pull/15)).

**Ceilings:** the agenda section keeps its own +Event/+Task buttons (its empty-state
text points at them); remove those too if the shop finds them redundant. The crew
picker lists everyone in the people list, not just installers — filtering by
department roster there means deciding what happens to cross-department helpers, so
it deliberately doesn't.
