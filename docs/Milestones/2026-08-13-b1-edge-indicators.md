# Off-screen bar edge indicators (B1) — 2026-08-13

**What changed.** On the main timeline, a row whose bar sits entirely outside the
visible date range used to look empty — with deadlines spread across months, a PM
scanning vertically couldn't tell "not scheduled" from "scheduled in December." Each
such row now shows a small chip hugging the viewport edge nearest its bar: a chevron
pointing toward the bar plus the date of the bar's near edge ("› Dec 1" when the bar is
off to the right, "Jul 5 ‹" when it's off to the left). Clicking the chip scrolls the
bar into view, centered — smoothly, unless the user prefers reduced motion.

**How it reads.** The chip is a neutral white pill (mono date, ink text via the §2.5
label function); only the chevron carries the row's identity color, so the indicators
don't compete with the bars. Rows apply it uniformly: collapsed project rows use the
project's summary span, expanded phase rows and department lanes use their own bars,
and a chip only appears when *nothing* in the row is visible.

**Kept cheap.** Bar geometry is recorded during the normal render pass — the scroll
handler never measures the DOM. Position updates ride the same requestAnimationFrame
throttle the bar labels already use, and chip DOM is rebuilt only when the set of
off-screen rows actually changes, not on every scroll frame.

**Regression guard.** New `tests/test-b1.js` (14 assertions): right-edge and left-edge
chips with the correct near-edge dates, no chip when a bar is visible, viewport-edge
pinning, click-to-center, chip removal once the bar is in view, and the throttled
scroll path.

**Rev/refs.** UX audit finding B1 (Theme B, P1), Design-Language §6/§7. All 11 suites
pass against `index.html`.

**Ceiling.** A row whose bars straddle the viewport on both sides gets two chips (left
and right) — correct but untested against real data at that density. Chips reflect
geometry only; they don't dim with the search filter the way bars do (the filter dims
in place without re-rendering, and a dimmed bar is still a real bar worth navigating to).
