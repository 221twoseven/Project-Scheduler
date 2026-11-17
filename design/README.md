# design/

The visual system for Timeline and the other Systems products that will share it
(`docs/TODO.md` §1).

| File | What it is |
|---|---|
| `wireframes/` | **The owner's wireframes (2026-09-28), the aesthetic target**: `TwoSeven-Portal-Option-1-Wireframe.html`, `TwoSeven-People-Wireframe.html`, `TwoSeven-Clients-Wireframe.html`. Open one in a browser; they're self-contained, with example data only (the owner's name replaced by "Sam Jones"). Not published on the site. The Systems page (`index.html`, v1.56.0) is built to the portal one |
| `TwoSeven-Application-Style-Guide.md` | **The target.** The suite-wide style guide, **v1.1 "convention-aligned"** (2026-09-27): the wireframe aesthetic reconciled with Timeline's existing conventions. Governs shared chrome and business screens; its §12 register says what is retained, revised and retired, and §13 gives the migration sequence |
| `Style-Transition-Review.md` | The v1.0 gap analysis: where Timeline's styling differed from the wireframe target, with measured facts. Still the migration inventory; where it and v1.1 §12 D disagree, **v1.1 governs** |
| `Design-Language.md` | Timeline's rules and owner rulings — *why* things look and behave as they do. Still governs the schedule canvas and its colour semantics; its chrome sections are being superseded by the target guide |
| `Style-Guide.md` | Timeline's tokens, colours, type, spacing and component CSS **as shipped at v1.23.0** — the as-built inventory and migration checklist, not the direction |
| `fonts/` | The one committed font file, `BrNStdBd.otf` (Brauer Neue Std Bold, the wordmark). Other licensed weights stay local and are git-ignored. The Systems page (`index.html`) loads it from `design/fonts/` and Timeline (`timeline/index.html`) from `../design/fonts/`; the Pages deploy allowlist publishes it. |

New design documents (a component inventory, an icon sheet, the `common.css` brief when
the second product starts — D4 was ruled 2026-09-28, refined for Systems 2026-09-29) go here, not in `docs/`. `docs/` keeps the backlog, architecture, setup and
milestone records.
