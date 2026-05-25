# Tooltip Validation Notes

Updated: 2026-05-24

## Status

Accepted under the current gate model for the React Spectrum S2 styled Tooltip
slice.

## Acceptance Gate Checklist

| Gate                     | Status  | Evidence                                                                                                                                                                                                                  | Notes                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Source/API audit         | passing | React Spectrum S2 Tooltip source, React Aria overlay source, `mcp__react_spectrum_s2__get_s2_page`, `mcp__react_aria__get_react_aria_page`                                                                                | S2 `TooltipTrigger` exposes `containerPadding`, `crossOffset`, `defaultOpen`, `delay`, `isDisabled`, `isOpen`, `onOpenChange`, `placement`, `shouldCloseOnPress`, `shouldFlip`, and `trigger`. S2 Tooltip passes RAC Tooltip `offset={9}` and an arrow boundary offset based on the token radius. React Aria clamps cross-axis geometry but lets the main axis overflow when `shouldFlip=false`. |
| Props/controls           | passing | `apps/comparison/src/data/component-controls.ts`, `apps/comparison/src/data/tooltip-demo.ts`, `apps/comparison/e2e/modeled-controls-contract.spec.ts`                                                                     | The viewer routes and serializes content, action label, placement, trigger mode, delay, `containerPadding`, `crossOffset`, `defaultOpen`, `isOpen` undefined/true/false, `isDisabled`, `shouldFlip`, and `shouldCloseOnPress`.                                                                                                                                                                   |
| React reference          | passing | `apps/comparison/src/components/react/fixtures/styled.jsx`                                                                                                                                                                | The React stack mounts `@react-spectrum/s2` `TooltipTrigger`, icon-only `ActionButton`, and S2 `Tooltip`, receives the same normalized controls, avoids controlled/uncontrolled warnings, and coerces disabled controlled-open routes closed.                                                                                                                                                    |
| Solid implementation     | passing | `packages/solidaria/src/tooltip/createTooltipTrigger.ts`, `packages/solidaria-components/src/Tooltip.tsx`, `packages/solid-spectrum/src/tooltip/index.tsx`                                                                | Solid now supports explicit tooltip ids, trigger-level geometry controls, S2 offset and arrow-boundary defaults, absolute document positioning, close-on-scroll, disabled suppression, cross-axis viewport padding, React Aria style arrow-boundary clamp, and main-axis no-flip overflow parity.                                                                                                |
| Component/headless/state | passing | `packages/solid-stately/test/createTooltipTriggerState.test.ts`, `packages/solidaria/test/createTooltip.test.tsx`, `packages/solidaria-components/test/Tooltip.test.tsx`, `packages/solid-spectrum/test/Tooltip.test.tsx` | Focused package coverage includes state warmup, controlled open, id/ARIA merge, trigger cleanup, scroll close, close-on-press, styled id merge, and S2 arrow rendering.                                                                                                                                                                                                                          |
| Behavior state machine   | passing | `apps/comparison/e2e/tooltip-visual.spec.ts`, package tests                                                                                                                                                               | Hover, focus, Escape, close-on-press, disabled suppression, default open, controlled open, scroll close, placement, flip, touch no-display, and cleanup are covered.                                                                                                                                                                                                                             |
| Accessibility/i18n       | passing | `apps/comparison/e2e/tooltip-visual.spec.ts`, package tests                                                                                                                                                               | Assertions cover `role="tooltip"`, trigger `aria-describedby`, explicit id preservation, disabled removal, Escape cleanup, `dir`, `lang`, and start/end placement resolution.                                                                                                                                                                                                                    |
| Styling/visual           | passing | `apps/comparison/e2e/tooltip-visual.spec.ts`, `packages/solid-spectrum/src/tooltip/index.tsx`, `macro-emitted package CSS`                                                                                                | Browser coverage asserts S2 surface tokens, radius, typography, max width, min height, arrow path/viewBox, open-surface screenshot parity, cross-axis offset, flip geometry, viewport padding clamp, arrow-boundary clamp, and no-flip main-axis overflow.                                                                                                                                       |
| Reports/docs             | passing | `apps/comparison/src/data/comparison-manifest.ts`, this note, `apps/comparison/playbook/components/README.md`                                                                                                             | The manifest and playbook now record Tooltip as current-gate accepted with remaining caveats listed below.                                                                                                                                                                                                                                                                                       |
| Known defects/regression | passing | This note and focused regression tests                                                                                                                                                                                    | No in-scope blocking defects remain for the S2 styled Tooltip slice. Remaining gaps are non-blocking and tracked below.                                                                                                                                                                                                                                                                          |

## Agent Workflow

- Source audit came first. The S2 Tooltip and React Aria overlay behavior were
  checked before code changes, including the React Aria cross-axis clamp and
  no-flip main-axis overflow behavior.
- Package tests and component builds ran before browser comparison assertions.
- Browser routes were checked through focused Playwright specs, and the dev
  server log was checked for React controlledness/key warnings.
- Generated S2 CSS churn is not part of this component pass and is restored
  before commit.

## Behavior State Machine

- Open paths: hover trigger, focus trigger, `defaultOpen`, and controlled
  `isOpen=true`.
- Close paths: pointer leave, blur, Escape, close-on-press, scroll close, and
  controlled `isOpen=false`.
- Suppression paths: disabled trigger stays closed and touch hover does not
  show a tooltip or attach `aria-describedby`.
- Geometry paths: top/bottom/left/right/start/end placement, flip near the
  viewport edge, no-flip main-axis overflow, cross-axis offset, viewport
  padding clamp, and arrow-boundary clamp.

## Accessibility And I18n

- `createTooltipTrigger` now forwards stable or explicit tooltip ids through
  `aria-describedby` and `tooltipProps.id`.
- The displayed tooltip carries `role="tooltip"` and preserves explicit ids
  supplied by styled/component callers.
- Start/end placement resolution follows document direction, and viewer routes
  cover `lang` and `dir` propagation.
- Live screen-reader transcript evidence is still a broader tooling gap; DOM
  ARIA and lifecycle assertions are in place for this pass.

## Style Source-To-Computed

- Styled Tooltip uses the S2 neutral surface, radius, typography, minimum
  height, max width, and SVG arrow contract.
- The Solid styled wrapper passes S2 defaults equivalent to React S2:
  `offset=9`, `arrowSize=10`, and `arrowBoundaryOffset=8`.
- Positioning follows React Aria's split behavior: cross-axis geometry is
  clamped to keep the overlay/arrow associated with the trigger and inside
  viewport padding, while the main axis can overflow when flipping is disabled.

## Known Defects And Regression Protection

- No blocking defects remain in the current S2 styled Tooltip slice.
- Standalone RAC-only rendering escape hatches such as custom `triggerRef`,
  render override functions, className/style render props, and custom portal
  containers are tracked outside this styled comparison route.
- Live screen-reader transcript evidence remains tracked beyond the current DOM
  ARIA assertions.

## Commands

- `vp test run packages/solidaria/test/createTooltip.test.tsx packages/solidaria-components/test/Tooltip.test.tsx packages/solid-spectrum/test/Tooltip.test.tsx packages/solid-stately/test/createTooltipTriggerState.test.ts`
- `vp run build:components`
- `vp run build:solid-spectrum`
- `COMPARISON_BASE_URL=http://127.0.0.1:4321 vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/tooltip-visual.spec.ts e2e/modeled-controls-contract.spec.ts --grep "Tooltip" --reporter=line --workers=1`
- `vp run comparison:typecheck`
- `vp run comparison:report:gaps`
- `vp run comparison:report:exports`
- `vp run check`
- `git diff --check`

## Remaining Gaps

- Standalone RAC-only rendering escape hatches are not routed in the S2 styled
  viewer.
- Live screen-reader transcript evidence is still tracked as a cross-component
  evidence gap beyond DOM ARIA assertions.
