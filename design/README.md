# design/

The visual system for Shop Timeline and the sibling apps that will share it.

| File | What it is |
|---|---|
| `TwoSeven-Application-Style-Guide.md` | **The target.** The suite-wide style guide, **v1.1 "convention-aligned"** (2026-09-27): the wireframe aesthetic reconciled with Timeline's existing conventions. Governs shared chrome and business screens; its §12 register says what is retained, revised and retired, and §13 gives the migration sequence |
| `Style-Transition-Review.md` | The v1.0 gap analysis: where Timeline's styling differed from the wireframe target, with measured facts. Still the migration inventory; where it and v1.1 §12 D disagree, **v1.1 governs** |
| `Design-Language.md` | Timeline's rules and owner rulings — *why* things look and behave as they do. Still governs the schedule canvas and its colour semantics; its chrome sections are being superseded by the target guide |
| `Style-Guide.md` | Timeline's tokens, colours, type, spacing and component CSS **as shipped at v1.23.0** — the as-built inventory and migration checklist, not the direction |
| `fonts/` | The one committed font file, `BrNStdBd.otf` (Brauer Neue Std Bold, the wordmark). Other licensed weights stay local and are git-ignored. `index.html` loads it from `design/fonts/`, and the Pages deploy allowlist publishes it. |

New design documents (a component inventory, an icon sheet, the `common.css` brief when
the second app starts — D4 was ruled 2026-09-28) go here, not in `docs/`. `docs/` keeps the backlog, architecture, setup and
milestone records.
