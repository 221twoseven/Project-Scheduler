# A long Changelog entry folds — v1.54.2 (2026-11-17)

**TODO item 84** (owner's screenshot, 2026-11-17). PR #TBD.

## What changed and why

When more than 20 records change in one step (an import, a big undo, a console tidy), the
Changelog writes one "Bulk change" row that lists every record. The owner's 73-phase crew
tidy (item 82) wrote one such row, and it filled the Changelog page from top to bottom.

Now any entry longer than six lines shows its first four and folds the rest under a line
reading "N more" with a ▸ caret. Click it and the rest opens (▾). This is the browser's own
disclosure control, the same fold a feedback report uses for its comments, so it works with
the keyboard and needs no new script. It applies on the Changelog page and in the project
page's Changelog panel. The filter still searches the folded lines.

**Before:** `screenshots/before-changelog-fold.png` (the bulk row's full list)
**After:** `screenshots/after-changelog-fold.png` (four lines and "69 more")

## Known limits

- When the filter matches a line inside a fold, the row shows but its fold stays closed;
  open it to see the match.
- In the project page's Changelog panel, a fold you opened closes again when the page
  redraws (someone else's edit arriving, an autosave). The Changelog page doesn't redraw on
  its own, so it keeps folds open.

## Checks

`tests/test-v1542.js` makes 25 phase edits in one step, checks the one "Bulk change" row it
writes, and draws it on the Changelog page: four lines, a closed fold reading "21 more", and
every line still there. A seven-line edit folds the same way on the page and in the project
page's panel; a six-line edit doesn't fold. The filter still finds a folded line.

Accessibility (`design/Design-Language.md` §9): the fold is a native `<details>`, so it takes
focus and opens with Enter or Space; its summary keeps the 24px hit box the report fold uses,
in the same muted text colour.
