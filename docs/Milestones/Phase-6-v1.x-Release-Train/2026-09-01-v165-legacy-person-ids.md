# 2026-09-01 — v1.6.5: legacy person strings resolve to roster people

**What:** reviewing live data at `/preview/`, the owner found the Project Management
department splitting every person in two — an empty lane under their full roster name
("Davis Smith", "Caroline Bondi") and a working lane under a legacy abbreviation
("Davis S.", "Caroline B."). Older project records store abbreviated names in the
`projectManager`/`drafter`/`leadFab` fields and in some bar crews, while the staff
picker and the signed-in identity chain write full display names — and every consumer
compared the strings raw.

## The fix

One resolver, `canonName(s)`: resolve a crew/role string to its roster person when the
match is unambiguous — exact (case-insensitive), the `First L.` initial form, or a
bare first name. Ambiguous (two Davises matching "Davis S.") or unknown strings pass
through untouched and keep their own lane; the resolver never guesses.

It is applied inside `barCrew()` — the single "who works this bar" authority — and at
every remaining raw reader of the role fields. Everything heals at once:

- **Dept-lens lanes merge:** one lane per human, legacy-named work included.
- **Person filter / Summary / My Dashboard** (`personHit`) finds legacy-named work —
  authenticated people's plates were missing it entirely.
- **Overbooking** (`computeConflicts`/`conflictCount`) no longer skips crews it
  couldn't resolve on the staff list; previously invisible cross-project overlaps now
  flag, and the OOO hatch/warnings reach legacy-named bars.
- **Team colors** key on the resolved name, so a person's color is stable across old
  and new records.
- **Displays** follow the roster name: bar team chips (PM/D/F), the project tooltip,
  `assigneeText`, and the project-page row gutter/bar titles.
- **PM grouping, PM sort, and the meeting sheet** file legacy and canonical records
  under one heading.
- **The PM late prompt** reaches a PM whose projects store the legacy form.
- **Editors resolve, phantom boxes gone:** the project page's Team checkboxes check
  the roster person instead of rendering a checked "Davis S." next to an unchecked
  "Davis Smith" (this was the owner's report, verbatim), and the task-modal crew list
  pre-checks resolved names instead of dropping them.

**The app never rewrites stored values on its own.** Values heal only when a person
edits that surface (a Team-box or crew save writes the resolved names). A one-time
scrub of the shared-list values is possible but is shared-data territory (⚠);
ledgered in TODO §7 as an owner decision.

## Tests

New suite `tests/test-v165.js` (19 checks): the resolver's forms (exact/initial/bare/
ambiguous/unknown), lane merging with the ambiguous lane preserved, the person filter
finding legacy work, conflicts flagging a legacy-vs-canonical overlap, display showing
the roster name while storage keeps the original strings.

## Ceilings / follow-ups (TODO §7)

- Stored values stay legacy until the owner orders a scrub.
- To-do assignees aren't canonicalized (dashboard Notes section).
- Same-first-name + same-initial people never merge — by design.
