# design/

The visual system for Shop Timeline and the sibling apps that will share it.

| File | What it is |
|---|---|
| `Design-Language.md` | The rules and owner rulings — *why* things look and behave as they do |
| `Style-Guide.md` | The tokens, colours, type, spacing and component CSS *as shipped* — what a new surface or sibling app copies |
| `fonts/` | The one committed font file, `BrNStdBd.otf` (Brauer Neue Std Bold, the wordmark). Other licensed weights stay local and are git-ignored. `index.html` loads it from `design/fonts/`, and the Pages deploy allowlist publishes it. |

New design documents (a component inventory, an icon sheet, the `common.css` brief when
D4 is ruled) go here, not in `docs/`. `docs/` keeps the backlog, architecture, setup and
milestone records.
