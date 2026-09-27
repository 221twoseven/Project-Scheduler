# design/

The visual system for Shop Timeline and the sibling apps that will share it.

| File | What it is |
|---|---|
| `TwoSeven-Application-Style-Guide.md` | **The target.** The suite-wide style guide (v1.0, 2026-09-27) for the portal and every app. Enterprise application styling; governs all shared chrome and conventional screens |
| `Style-Transition-Review.md` | Where Timeline's established styling differs from the target, the issues, the decisions needed, and the implementation order (2026-09-27, review only) |
| `Design-Language.md` | Timeline's rules and owner rulings — *why* things look and behave as they do. Still governs the schedule canvas and its colour semantics; its chrome sections are being superseded by the target guide |
| `Style-Guide.md` | Timeline's tokens, colours, type, spacing and component CSS **as shipped at v1.23.0** — the as-built inventory and migration checklist, not the direction |
| `fonts/` | The one committed font file, `BrNStdBd.otf` (Brauer Neue Std Bold, the wordmark). Other licensed weights stay local and are git-ignored. `index.html` loads it from `design/fonts/`, and the Pages deploy allowlist publishes it. |

New design documents (a component inventory, an icon sheet, the `common.css` brief when
D4 is ruled) go here, not in `docs/`. `docs/` keeps the backlog, architecture, setup and
milestone records.
