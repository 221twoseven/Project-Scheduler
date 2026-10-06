# Print designed for paper, Letter or Tabloid, with Save as PDF (v1.40.0)

**Tracker:** #8 and #9 (one piece of work; the plan lives in #8's Revised spec of 2026-10-02).
**TODO:** item 38. **Branch:** `feat/issue8-print-pdf`.

## What changed

- **Paper.** The Print menu has a Paper choice, Letter or Tabloid, used by every print
  and remembered in the browser (`shopTimelinePaper`, Letter on first use). The app writes
  the page size into the print dialog in inches with half-inch margins, so the dialog opens
  on the chosen paper. The Meeting Sheet can also print portrait (`shopTimelineSheetPortrait`,
  landscape on first use).
- **The app lays out its own pages.** Every print is a set of page boxes at the paper's
  size, each with the house header (`TWOSEVEN INC.`, the title, the date range, then the
  version, printed date, project count, the filters in use and Color by), a legend and
  "Page X of Y". The old print shrank a copy of the screen; this one draws each view again
  at the paper's own scale.
- **Gantt.** Rows print at the Compact height whatever the screen density. A long range is
  cut into whole-week slices (13 weeks on Letter, 22 on Tabloid), each a page across,
  labelled "weeks 14 to 26 of 26", all at one time scale. A project never splits from its
  open phases, and a group heading repeats when its group runs onto the next page. Bars
  print as a light tint with a solid edge in their colour and ink labels. Status chips are
  outlined, and the stripes and hatch are drawn in the bar's own colour. The legend names
  the projects on the page (Color by: Project) or the departments present (Team), with
  Laser named beside "red edge = install or shipping".
- **A project's page.** "Print this project…" prints its Gantt or its Calendar, whichever
  is showing. The Calendar prints one month per page. A draft prints too: line two reads
  "Draft, not yet created" and carries no cost code.
- **Meeting Sheet (the List).** The same table, cut between rows; a PM group starts a new
  page only when it would otherwise split. It now drops the rows the screen drops (Status,
  Client and Person). Search and spotlight fade rows on paper as they do on screen, and the
  header names them. Notes get the extra width on Tabloid.
- **Timeline + Meeting Sheet** prints both in one PDF.
- **Export** is the browser's own Save as PDF; there is no PDF library.
- Housekeeping: the print preview's Close button is now `pp-close` (it used to share
  `pp-cancel` with the project page).

## Evidence

- Sample PDFs (checked page by page): `pdf/issue8-gantt-letter.pdf` (Color by: Project),
  `pdf/issue8-gantt-tabloid.pdf` (Color by: Team, Laser in the legend),
  `pdf/issue8-calendar-letter.pdf`, `pdf/issue8-calendar-tabloid.pdf`,
  `pdf/issue8-sheet-letter.pdf`, `pdf/issue8-sheet-tabloid.pdf`,
  `pdf/issue8-sheet-letter-portrait.pdf`. Every page is the stated paper size, there are no
  blank pages, and the smallest text is 8.25pt (11px).
- Print preview, before and after: `screenshots/before-issue8-print-pdf.png`,
  `screenshots/after-issue8-print-pdf.png`.
- Tests: `tests/test-v1400.js`.

## Found while checking the PDFs

- `repeating-linear-gradient` prints from Chrome as a function-based shading (PDF shading
  type 1). Chrome, Edge and Acrobat draw it, but pdf.js-based viewers (Firefox, and some
  in-browser previews) paint it hot pink. The paper stripes and hatches are therefore plain
  gradient tiles. The rule is in Style-Guide §8.

## Known limits

- A calendar week is never shorter than it is on screen. A month whose weeks then outgrow
  the page is cut at the page foot (marked `ponytail:` in `prCalendarPages`).
- The browser cannot count pages for us, so the page boxes are built from fixed Gantt row
  heights and from Meeting Sheet rows measured in the browser. A font that renders much
  taller than the shipped one could overfill a sheet page.
- The Calendar exists only on a project's page, so there is no whole-shop calendar print
  (#8 Q3; that would be a new view).
