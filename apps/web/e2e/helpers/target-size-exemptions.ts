/**
 * Selector-scoped axe `target-size` exemptions for playground WCAG 2.2 AA.
 * Classification lives in `.claude/current/wcag-258-target-size.md` (ticket #492).
 * Playground is Solid-only; "React same?" is filled from the comparison pair.
 *
 * Census 2026-09-07 (`vp run a11y:axe:aa` with the rule on): zero `target-size`
 * nodes. Date/time segments did not fail axe (Spacing or `widget-not-inline`).
 * The TR Inline sentence does not hold; no exemption is recorded for a pass.
 */
export const PLAYGROUND_TARGET_SIZE_EXEMPTIONS: ReadonlyArray<{ selector: string; why: string }> =
  [];
