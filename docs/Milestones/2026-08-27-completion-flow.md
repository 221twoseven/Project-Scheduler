# The completion flow (REV87) — 2026-08-27

The last build item on the Phase 3.5 punch list (`docs/TODO.md` §6; green-lit
by the owner 2026-08-27, both halves). PR:
[#28](https://github.com/221twoseven/Project-Scheduler/pull/28) (rides the
REV84–86 branch).

**The storage shape, checked first (the ⚠ on the punch item):** both apps share
the stored `status` column on `ShopTimeline_Projects`, and `complete` is
already a first-class value in the colleague app — its own status dropdown
offers it, its migration map targets it, and it renders complete projects
dimmed with a grey pill. So the whole feature writes an existing value to an
existing shared column: **no schema change, no cross-app risk.**

**Mark complete (the button).** The saved project page's footer gains
**Mark complete** next to Delete project. One click writes
`status='complete'` (undoable, like every mutation): the timeline greys the
project's bars (the existing complete treatment), the meta strip's "Overdue by"
cell and "Work runs past the install date" warning clear, and the button
flips to a disabled "✓ Complete". Reopening is the Setup status dropdown's
job — set it back to Automatic or any live status. Drafts have no button;
nothing exists to complete.

![The footer button on a late project](Phase%203.5/screenshots/after-3-5-complete-button.png)

**The PM late-project prompt.** When the signed-in user (the REV66 identity
chain: login email against the staff list, name second) is the Project Manager
of projects whose install dates have passed without being complete, the app
asks — once a day, after load, never on top of the tour or another overlay.
Each row shows the job, its install date and how late it reads, with two
verbs: **Open** (jump to the project to extend its schedule) and
**Mark complete** (files right there, undo toast, row leaves the list — an
empty list closes the prompt). **Later** dismisses until tomorrow.

![The prompt over the timeline](Phase%203.5/screenshots/after-3-5-pm-late-prompt.png)

**Tests.** New suite `tests/test87.js` (15 assertions): identity resolution,
the prompt's rows/actions/dismissal and the once-a-day key, the button's
write + late-shout clearing + disabled state, and the draft's deliberate lack
of a button. Full `npm test` green.

**Known ceilings / follow-ups** (ledgered in TODO §7): the once-a-day key is
per-browser, not per-user — a shared machine could swallow another PM's daily
ask; revisit if shared stations complain.
