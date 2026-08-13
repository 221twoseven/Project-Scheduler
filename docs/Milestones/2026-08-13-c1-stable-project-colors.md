# Stable project colors (C1) — 2026-08-13

**What changed.** A project now keeps the same color for its whole life. Colors used to
be assigned by a project's position in the list, so adding, deleting, or re-sorting
projects silently recolored everyone below — "the blue job" could turn green overnight.
`projColor()` in `index.html` now derives the color from a stable hash of the project's
id, so nothing another project does can move it.

**Bigger palette.** The identity palette grew from 7 to 12 slots (Design-Language §2.2),
so collisions are rarer. Slot 08 ships as `#567693`, not the doc's original `#5B7C99` —
that hex fails the 4.5:1 text-contrast rule both ways (the same dead-zone color §2.3
already corrects for the PM department); the doc was updated to match. All 12 slots pass
the contrast suite, and none sit near the reserved install red.

**Collision rule.** If two projects visible at the same time happen to hash to the same
slot, the later-created one shifts to the nearest free slot for that render; the older
project never moves. Person colors in Team mode also cycle over the 12-slot palette now,
so rosters with 8+ people get distinct colors where they previously wrapped.

**Regression guard.** New `tests/test-c1-color.js` (22 assertions): delete-the-first-
project and re-sort stability, the collision shift, and a hue-distance floor keeping
every palette slot at least 20° away from `INSTALL_RED`.

**Rev/refs.** UX audit finding C1, task brief T2. Commit `3927b45` on `development`.
All suites pass (276 legacy + 63 contrast + 22 new).

**Ceiling.** With 13+ projects visible at once the 12 slots must repeat — duplicates are
possible but each project's own color still never moves. Also of note from this session:
the push to GitHub failed twice with a server-side `Internal Server Error` (no incident,
no ruleset involved) and succeeded unchanged on the third try — transient GitHub fault,
nothing in the repo.
