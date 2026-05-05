# Component Playbook

Read
[`docs/adr/0001-s2-styling-source-of-truth.md`](../../docs/adr/0001-s2-styling-source-of-truth.md)
first.

## Checklist

1. Start from the real React Spectrum S2 component as the source of truth.
2. If the Solid side does not have that component yet, port it into
   `@proyecto-viviana/solid-spectrum` across the full stack before comparing.
3. If the Solid side already has the component, compare it against the React
   reference and close the gap.
4. Implement styling through the S2-compatible style system.
5. Review the S2 source before implementing. Port real S2 wrapper structure,
   slots, state logic, derived render-state, overlay behavior, and temporal
   behavior when it exists; do not assume the component is only a headless
   reskin. Trace helper hooks and delayed state transitions into the final style
   call.
6. Do not add or tune app-local Spectrum component CSS.
7. If the Solid component is not migrated, mark it missing/gap.
8. Match S2 props and TypeScript names in controls and fixtures.
9. Add modeled interactive comparison controls for the component and verify the
   controls drive both React and Solid. URL query states can seed fixtures, but
   they do not replace the interactive control surface.
10. Cover light and dark themes.
11. Cover component-specific states before screenshots. For time-based states,
    verify the delayed visible phase and any derived disabled-like styling the
    source uses to normalize variants.
12. Compare DOM slots, state attributes, computed styles, geometry, behavior, and
    screenshots.
13. Commit snapshots only after the React and Solid implementations are both the
    intended references.

## Validation Plan First

Before touching component code, write the component-specific validation plan.
This can live in the issue, PR notes, or the visual state matrix, but it must be
specific enough that implementation assumptions are testable.

Include:

- React S2 component and source files reviewed.
- Props, slots, wrapper structure, provider/context behavior, and generated style
  declarations to port.
- Static states to compare: default, variants, sizes, disabled/read-only,
  validation, density, static color, and slot/content permutations.
- Interaction states to compare: hover, focus-visible, pressed, selected/open,
  keyboard navigation, dismissal, and focus return.
- Temporal states to compare: pending/loading delays, spinner visibility,
  press-scale transforms, overlay animation frames, and delayed state
  normalization.
- Geometry checks to run before screenshots: root box, slot boxes, icon box,
  text box, centerline delta, baseline-sensitive text/icon alignment, and
  overlay placement.
- Which checks are behavior assertions, computed-style assertions,
  Playwright CLI inspection artifacts, and committed Playwright test snapshots.

Use this matrix shape before implementation. Expand rows until every risky prop,
slot, state, or layout assumption has an explicit validation target:

| Assumption        | React S2 reference to inspect                       | Solid surface to inspect   | Browser check                             | Committed guard                                |
| ----------------- | --------------------------------------------------- | -------------------------- | ----------------------------------------- | ---------------------------------------------- |
| Default geometry  | root/slot/icon/text boxes                           | root/slot/icon/text boxes  | Playwright snapshot plus box measurements | visual or computed Playwright spec             |
| Interaction state | selected/pressed/open/focused attributes and styles | same attributes and styles | click/keyboard/hover flow in browser      | behavior assertion and screenshot where visual |
| Temporal state    | delayed pending/loading/animation frame             | same delayed phase         | video/trace or timed snapshot             | Playwright assertion after delay               |

Do not start coding from a generic component checklist alone. Name the actual
React S2 source files, expected state attributes, target accessible roles, and
the exact query/state URLs to open in Playwright. If a row cannot be tested yet,
record why and mark it as a tracked gap in the visual state matrix.

If the component contains icons, the plan must include explicit React-vs-Solid
icon alignment checks. Do not rely on visual memory. Inspect the React Spectrum
reference and the Solid implementation in the browser, capture both sides, and
record the box/centerline/baseline measurements before accepting the state. The
minimum icon matrix is start, end, icon-only, pending-with-icon, and each
supported size that changes button height.

## Interactive Controls Requirement

Every component page must have a modeled interactive comparison control surface
before it is considered complete. The controls should mirror the public S2 docs
props that can change visible behavior, semantics, or interaction state. A route
query fixture is useful for focused snapshots, but it is only a seed state; the
side-panel controls must also be able to update the mounted React and Solid
examples without a reload.

For each component:

- Add a `ComponentControlGroup` entry with `coverage: "modeled"` and the S2
  docs prop names.
- Add component defaults to the comparison page control script.
- Wire both React and Solid fixtures to `comparison:controls-change`.
- Expose a stable `data-comparison-control-root` and serialized
  `data-comparison-control-props` on both stacks.
- Add a Playwright test that changes the side-panel controls and asserts both
  stacks received the same props and rendered state.
- Add a visual-state-matrix entry for `styled.props.controls`.

If a component cannot meet this yet, leave the controls as a tracked gap and
record why in the visual state matrix. Do not mark the component complete while
the interactive control surface is missing.

## Button-Family Batch Plan

Process button-family components in small batches, but sign off each component
individually. Batch 1 covers single button-derived controls:
`ActionButton`, `ToggleButton`, and `LinkButton`.

| Assumption                                                                                                           | React S2 reference to inspect                                                                                                            | Solid surface to inspect                                                                                                                                      | Browser check                                                                                                                                                    | Committed guard                                                                                           |
| -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| ActionButton text, icon-leading, icon-only, size, quiet, staticColor, disabled, and pending states match S2 geometry | `@react-spectrum/s2/src/ActionButton.tsx`, especially `btnStyles`, `IconContext`, `TextContext`, `usePendingState`, and `ProgressCircle` | `packages/solid-spectrum/src/button/ActionButton.tsx`, `s2-action-button-styles.ts`, comparison route `/components/actionbutton/?iconPlacement=start&size=XL` | Compare React/Solid root, icon, text, gap, progress, and centerline boxes in Playwright; inspect delayed pending with icon content after spinner becomes visible | `e2e/actionbutton-visual.spec.ts` computed, screenshot, icon geometry, and pending-with-icon tests        |
| ToggleButton icon content and selected state use the same baseline and accessible pressed state                      | `@react-spectrum/s2/src/ToggleButton.tsx`, `btnStyles`, `ToggleButtonGroupContext`, `IconContext`, `TextContext`                         | `packages/solid-spectrum/src/button/ToggleButton.tsx`, route `/components/togglebutton/?iconPlacement=start&isSelected=true`                                  | Compare root/icon/text boxes, aria-pressed, and selected-state rendering for text+icon and icon-only                                                             | `e2e/single-button-controls-visual.spec.ts` screenshots, geometry assertions, and selected-state contract |
| LinkButton preserves link semantics while using Button visual/icon treatment                                         | `@react-spectrum/s2/src/Button.tsx` `LinkButton`, `button`, `IconContext`, `TextContext`                                                 | `packages/solid-spectrum/src/button/LinkButton.tsx`, route `/components/linkbutton/?iconPlacement=only`                                                       | Compare anchor role/name/href, root/icon/text boxes, and icon-only accessible name                                                                               | `e2e/single-button-controls-visual.spec.ts` screenshots, geometry assertions, and href contract           |

Batch 1 intentionally leaves group context and collection selection details to
Batch 2 and Batch 3. Do not mix group fixes into single-control work unless a
shared button primitive regression blocks the single-control matrix.

Batch 2 covers grouped button-derived controls with button-context propagation
and layout behavior: `ActionButtonGroup`, `ButtonGroup`, and
`ToggleButtonGroup`.

| Assumption                                                                                                               | React S2 reference to inspect                                                                                                 | Solid surface to inspect                                                                                                                                                                                 | Browser check                                                                                                                                                                                  | Committed guard                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| ActionButtonGroup propagates size, density, quiet, disabled, justified, staticColor, orientation, and icon slot geometry | `@react-spectrum/s2/src/ActionButtonGroup.tsx`, `ActionButton.tsx`, `actionGroupStyle`, `ActionButtonGroupContext`, `Toolbar` | `packages/solid-spectrum/src/actionbuttongroup/index.tsx`, `button/group-context.ts`, comparison route `/components/actionbuttongroup/?density=compact&orientation=vertical&size=XL&iconPlacement=start` | Compare React/Solid toolbar role, vertical aria-orientation, data/style geometry, child button size/quiet/disabled state, icon/text boxes, gap, and centerline measurements before screenshots | `e2e/grouped-button-controls-visual.spec.ts` screenshot, role/orientation, group-prop, and icon geometry checks            |
| ButtonGroup propagates size/disabled and flips to vertical when horizontal content overflows                             | `@react-spectrum/s2/src/ButtonGroup.tsx`, especially `ResizeObserver`, `checkForOverflow`, and `ButtonGroupContext`           | `packages/solid-spectrum/src/buttongroup/index.tsx`, comparison route `/components/buttongroup/?wrapWidth=96&size=XL&iconPlacement=start`                                                                | Compare React/Solid wrapper semantics, effective flex direction, wrapped width, child disabled/size state, and icon/text centerline geometry at the constrained width                          | `e2e/grouped-button-controls-visual.spec.ts` overflow-direction, screenshot, and icon geometry checks                      |
| ToggleButtonGroup propagates group context while preserving radio selection semantics and selected icon geometry         | `@react-spectrum/s2/src/ToggleButtonGroup.tsx`, `ToggleButton.tsx`, `ToggleButtonGroupContext`, `actionGroupStyle`            | `packages/solid-spectrum/src/togglebuttongroup/index.tsx`, comparison route `/components/togglebuttongroup/?density=compact&orientation=vertical&isEmphasized=true&size=XL&iconPlacement=start`          | Compare React/Solid radiogroup role/orientation, selected radio state, group density/justification/disabled props, and selected text+icon centerline measurements before screenshots           | `e2e/grouped-button-controls-visual.spec.ts` screenshot, role/orientation, selection, group-prop, and icon geometry checks |

Batch 2 intentionally leaves collection-specific selection visuals for Batch 3:
`SegmentedControl` still needs the S2 selection indicator/press-scale matrix,
and `SelectBoxGroup` still needs multi-select indicator, slot provider, and
disabled item coverage.

Batch 3 covers the collection-style controls that complete the current
button-family surface: `SegmentedControl` and `SelectBoxGroup`.

| Assumption                                                                                                                         | React S2 reference to inspect                                                                                                                    | Solid surface to inspect                                                                                                                                                      | Browser check                                                                                                                                                                                                      | Committed guard                                                                                                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SegmentedControl uses the S2 sliding selection indicator, root background, justified layout, disabled state, and selected geometry | `@react-spectrum/s2/src/SegmentedControl.tsx`, especially `SelectionIndicator`, `ToggleGroupStateContext`, `control({icon: true})`, `pressScale` | `packages/solid-spectrum/src/segmentedcontrol/index.tsx`, comparison route `/components/segmentedcontrol/?selectedKey=grid&isJustified=true`                                  | Compare React/Solid radiogroup role, selected radio state, root background, root/item geometry, selection indicator box, justified item widths, prop controls, and pressed transform behavior before screenshots   | `e2e/collection-button-controls-visual.spec.ts` screenshot, selected indicator geometry, justified layout, prop controls, and behavior checks           |
| SelectBoxGroup uses S2 grid sizing, label/description hover color, slots, horizontal layout, and multi-select checkbox indicator   | `@react-spectrum/s2/src/SelectBoxGroup.tsx`, `Checkbox.tsx` `box`/`iconStyles`, `TextContext`, `IllustrationContext`, `pressScale`               | `packages/solid-spectrum/src/selectboxgroup/index.tsx`, comparison route `/components/selectboxgroup/?selectionMode=multiple&selectedKeys=starter,pro&orientation=horizontal` | Compare React/Solid listbox role, multi-selected option state, checkbox indicator visibility, label/description slot boxes, hover text color, option grid dimensions, prop controls, and horizontal text alignment | `e2e/collection-button-controls-visual.spec.ts` screenshot, slot geometry, hover text color, multi-select indicator, prop controls, and behavior checks |

Batch 3 does not make these controls complete. Remaining follow-up work after
the first guard pass is keyboard navigation detail, strict pair-diff tightening,
SegmentedControl icon-slot permutations, and SelectBoxGroup illustration-slot
coverage.

## Button-Family Interactive-Control Retrofit

Some button-family components already have URL-driven fixtures, screenshots, and
geometry contracts, but that is not the same as a modeled interactive comparison
surface. Retrofit them before moving to the next component family.

| Component         | Current state                                                                 | Required follow-up                                                                               |
| ----------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Button            | Modeled controls, React/Solid fixture wiring, and side-panel Playwright guard | Keep as the reference implementation pattern for the rest of the family                          |
| ActionButton      | Modeled controls and fixture wiring exist                                     | Add the same explicit side-panel Playwright guard shape used by Button                           |
| LinkButton        | URL-driven icon fixtures and semantic/geometry guards exist                   | Add modeled controls, React/Solid event wiring, root prop serialization, and side-panel guard    |
| ToggleButton      | URL-driven icon/selected fixtures and semantic/geometry guards exist          | Add modeled controls, selected-state event wiring, root prop serialization, and side-panel guard |
| ButtonGroup       | URL-driven group fixture and geometry/overflow guards exist                   | Add modeled controls, React/Solid event wiring, group prop serialization, and side-panel guard   |
| ActionButtonGroup | URL-driven group fixture and geometry/role guards exist                       | Add modeled controls, React/Solid event wiring, group prop serialization, and side-panel guard   |
| ToggleButtonGroup | URL-driven group fixture and geometry/selection guards exist                  | Add modeled controls, selection event wiring, group prop serialization, and side-panel guard     |
| SegmentedControl  | Modeled controls, React/Solid fixture wiring, and side-panel guard exist      | Continue with remaining visual gaps only after the interactive-control baseline stays green      |
| SelectBoxGroup    | Modeled controls, React/Solid fixture wiring, and side-panel guard exist      | Continue with remaining visual gaps only after the interactive-control baseline stays green      |

Work in this order:

1. Normalize `ActionButton` to the `Button` side-panel guard pattern.
2. Retrofit `LinkButton` and `ToggleButton` as the single-control slice.
3. Retrofit `ButtonGroup`, `ActionButtonGroup`, and `ToggleButtonGroup` as the
   grouped-control slice.
4. Run the focused Playwright suites after each slice and update the visual
   state matrix before committing.

## Playwright CLI Inspection

Use Playwright CLI for exploratory browser validation before accepting a visual
fix. The test suite is the committed guard; CLI inspection is how we catch
layout details before the user has to point them out.

Required loop for visual fixes:

1. Start the comparison app.
2. Open the component route with the intended query state.
3. Take an accessibility/DOM snapshot.
4. Capture React and Solid screenshots into `output/playwright/`.
5. For alignment-sensitive states, capture geometry from both sides and compare
   root, icon, text, and slot rectangles.
6. Use video or tracing when the state is temporal, such as pressed, pending, or
   overlay animation.
7. Promote the useful assertion into `apps/comparison/e2e` before calling the
   component fixed.

Example artifacts:

```bash
export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
export PWCLI="$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh"
"$PWCLI" open http://127.0.0.1:4321/components/button/?iconPlacement=start --headed
"$PWCLI" snapshot
"$PWCLI" screenshot --output output/playwright/button-icon-start.png
```

## Screenshot Rule

Screenshots validate implementation. They do not define implementation.

If a screenshot fails, inspect the S2 style declaration and Solid style-system
output before changing CSS.
