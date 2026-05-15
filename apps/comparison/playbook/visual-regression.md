# Visual Regression

Visual tests are evidence, not discovery. Source review and behavior tests come
first.

## State Matrix

Every live styled component should track:

- documented official S2 examples or interactive viewer states that affect
  rendering;
- default;
- disabled;
- invalid or error;
- each supported size;
- selected/open/expanded state where applicable;
- hover, pressed, and focus-visible;
- keyboard-open or keyboard navigation;
- overlay open and dismiss where applicable;
- loading, empty, or async state where applicable;
- light and dark theme when the component renders portal content.

Do not treat this list as a Cartesian product. Use source and docs to identify
which axes interact. Broad matrices are reserved for branches that actually nest
those axes.

## Subpart Contracts

Screenshots should not be the only proof for small or nested visuals. Use
computed contracts for subparts whose relevant output is a CSS property,
attribute, slot visibility, geometry value, or CSS variable.

Good targets include spinner `stroke`, icon `fill`, hidden text/icon visibility,
badge offsets, focus-ring geometry, portal placement, `dir`, and static-color
container variables.

The preferred shape is a delta check:

- read the baseline React and Solid subpart contracts;
- toggle the source input that upstream wires into the subpart;
- compare the React delta to the Solid delta.

The source-to-computed path must be recorded when a visual branch matters:
upstream S2 declaration, Solid owner code, route/viewer condition, and
observable computed proof. Comparison-app CSS may frame the route, but it must
not patch component behavior, state, token output, or geometry.

## Transition Matrix

Every visual state that changes over time should also identify its transition:

- initial state;
- trigger event;
- transient frame to screenshot or assert;
- settled state;
- cleanup or reverse transition.

For example, `button.pressed` is not just a pressed screenshot. It is
`default -> pointerdown -> pressed transform -> pointerup -> transform cleared`.
`datepicker.open` is not just an open calendar screenshot. It is
`closed -> trigger press -> portal mounted -> entering frame -> settled open`.

## Screenshot Rules

- Use current React-vs-Solid pair diffs as the visual evidence gate after the
  official docs/viewer, upstream source, and Solid idiom gates have established
  what the route is supposed to prove.
- Remove per-side committed screenshot assertions from focused acceptance
  suites. Do not gate on current React vs old React PNGs or current Solid vs old
  Solid PNGs.
- After removing those gates, clean up or explicitly defer stale per-side PNG
  baselines and any report wording that still treats committed screenshot
  coverage as a requirement.
- Pair-diff stable states with strict tolerance when practical.
- Use asserted thresholds only with a written reason.
- Screenshot the full focus ring and portal content.
- Do not trust a screenshot unless the test first asserts the Solid fixture is
  live and not a missing fallback.
- Wait for fonts, pin theme/viewport, freeze animations, and isolate React/Solid
  screenshot captures before treating a visual failure as a component bug.
- Classify failures as `port bug`, `upstream drift`, `harness bug`,
  `threshold debt`, or `unrelated family failure`.

## Commands

```bash
vp run comparison:test:default
vp run comparison:test:pair
vp exec --filter @proyecto-viviana/comparison playwright test e2e/<slug>-visual.spec.ts --reporter=line
```
