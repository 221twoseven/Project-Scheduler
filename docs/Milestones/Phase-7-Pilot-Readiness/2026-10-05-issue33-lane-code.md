# 2026-10-05 — Departments lines read the Cost Code (v1.35.0)

**Date:** 2026-10-05 · **App version:** v1.35.0 · **Where:** `index.html` (`renderSidebar`
lane lines, one CSS rule) · **PR:** #95 · **Tracker:** #33

## What changed

In the Departments view, each line under a person used to read the project's name (with
the muted client in front since v1.31.0, #24) and then its dates. At the default sidebar
width the name was cut off almost every time ("VCA · Q4 Fro… Oct 2–Nov 1"), so the line
identified nothing.

Now a project with a Cost Code shows the code instead — "HE276 Oct 2–Nov 1" — in the same
mono type as the dates beside it (Design-Language §3: anything that would appear on a work
order is mono). The code fits whole at the default 300 px sidebar. Hovering the line shows
the plain browser tip "Client · Project name · Cost code" (plus the phase's custom label
when it has one), so nothing is lost. A phase with a custom label reads "HE276 · mock-up
days".

A project with no Cost Code keeps its name on the line, with #24's muted client in front
("Dior · Holiday"), and its tip is that same line. Nobody is asked to go add codes, and
the fix does not pull a code out of a name typed as "Name - HE276": that project keeps its
long name until the code is typed into Setup.

The Projects view is unchanged (name on line 1, client · code · install date on line 2).
Bars, both tooltips, the Meeting Sheet, the late-projects prompt and the project picker
are unchanged. Print clones the sidebar, so a coded line prints as code and dates — paper
has no hover, so the name and client are not on the printout for coded projects (spec Q4
default).

## Why it mattered

Tracker #33 (Robert, 2026-10-01): the code is the identifier the shop recognises in a
narrow space; the long name is cut off anyway. Approved "Proceed with fix" 2026-10-05.
Rides on #24 (v1.31.0), which put the client on this line: under the spec's Q2 default the
code wins the line and the client moves into the hover tip; #24's Departments assertions in
`tests/test-v1310.js` were reworded to match (its Projects-view client line stands).

## Evidence

`screenshots/before-issue33-lane-code.png` · `screenshots/after-issue33-lane-code.png`
(the reporter's scenario: long names with codes, default sidebar, Month view).

## Follow-up

- Print loses the project name for coded lines (Q4 default). If the name matters on paper,
  the print sheet gets it back on its copy of the lines.
- R2 (nothing cut off) is proved by the screenshot, not the suite: jsdom cannot measure text
  width. `tests/test-v1350.js` covers R1, Q1–Q4 and the custom label.
