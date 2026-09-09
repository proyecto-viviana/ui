---
kind: reference
status: current
---

# WCAG 2.5.8 target-size classification

Status: live reference.
Update when: axe `target-size` exemptions, census, or 2.5.8 classification changes.

Ticket #492. Executable selectors live next to the smoke specs:
`apps/comparison/e2e/target-size-exemptions.ts` and
`apps/web/e2e/helpers/target-size-exemptions.ts`. Each `why` points here.
Axe green on an excluded node is not 2.5.8 met; this record carries the truth.

Census (2026-09-07, WSL, `COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer`):
every live styled comparison route plus TimeField deterministic, body then React
panel then Solid panel; playground WCAG 2.2 AA dark and light
(`vp run a11y:axe:aa`). Installed axe-core 4.13.0 implements Spacing (size or
24px-offset geometry) and an Inline matcher heuristic (`isInTextBlock`), not
Equivalent / User Agent Control / Essential.

D8 pair-diff remains the certified target-size gate. `assert24` is unused.

## Remaining axe fails (exemptions)

| Control class                       | Selector(s)                                                                                         | Surfaces                                            | Measured box | Axe check                                   | Bucket | Clause or no-clause | React same?                    | Notes                                                                                                                                                                                                                  |
| ----------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------ | ------------------------------------------- | ------ | ------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ActionGroup React hooks-oracle item | `.s2-framework-panel[data-framework="react"] [data-comparison-control-root="actiongroup"] > button` | comparison-react, comparison-body                   | 40×21        | size fail and offset fail (diameter 21px)   | clause | User Agent Control  | Solid styled items do not fail | Classless native `<button>` from `useActionGroupItem`. Author does not set min-size (slice 1 must not floor these hosts). Solid `solidaria-ActionGroup` items wrap S2-token spans and pass axe. Not a Solid-only miss. |
| Toolbar fixture item                | `[data-comparison-control-root="toolbar"] button`                                                   | comparison-react, comparison-solid, comparison-body | 40×21        | size fail and offset fail (diameter 21px)   | clause | User Agent Control  | yes                            | Native `<button>` children inside RAC `react-aria-Toolbar` / `solidaria-Toolbar`. Author does not set min-size. First item (Bold) is the reported node; same control class on both stacks.                             |
| Autocomplete unstyled search input  | `[data-comparison-control-root="autocomplete"] input`                                               | comparison-react, comparison-solid, comparison-body | 107×21       | size fail and offset fail (diameter 21.6px) | clause | User Agent Control  | yes                            | RAC `Input` (`react-aria-Input`) and solidaria `SearchFieldInput` (`solidaria-SearchField-input`) with no authored height. Styled S2 SearchField on its own route passes.                                              |

## Harness chrome (floored, not exempted)

Fixture trampolines (`Before` / `After`) are marked
`.comparison-harness-ua-target` and floored at 24×24 in
`apps/comparison/src/styles/global.css`. Keyboard-shortcut island buttons use
the same floor. User Agent Control does not apply once we set min-size.
ActionGroup item hosts are not matched.

## Classes that did not fail (no exemption)

DateField, TimeField, DatePicker, DateRangePicker segments (`role="spinbutton"`)
did not fail comparison or playground axe. The TR Inline sentence (“in a
sentence or … constrained by the line-height of non-target text”) does not
hold; they sit in a field group, not a sentence. Axe either passed Spacing or
treated the node as inapplicable via `widget-not-inline-matches`. A pass is not
an exemption.

Button, ActionButton (default M), ColorSwatch (default M), ColorSwatchPicker
swatches, Checkbox, ComboBox, Calendar, Link, and the rest of the live styled
set produced no `target-size` nodes. Compact tokens that are not on the default
route (ActionButton `XS=20`, ColorSwatch `XS=16`) are still
`no clause; upstream compact; both stacks` if a later scan hits them — they are
not 2.5.8 exceptions. This census did not see those sizes.

Playground WCAG 2.2 AA (`PLAYGROUND_TARGET_SIZE_EXEMPTIONS`): empty. Zero
`target-size` nodes in dark and light with all sections shown.

## What this is not

RAC / S2 do not claim WCAG 2.2 AA or 2.5.8. D8 pair-match is not a clause.
Do not invent S2 sizes to clear axe (Rule #2 / ADR 0001).
