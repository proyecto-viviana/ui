# Cross-Layer Source Audit

File existence is not parity. A component pass must validate the relevant code
across all four layers before implementation is accepted.

This gate proves upstream React source parity. It must be paired with the full
[Acceptance Gates](./acceptance-gates.md) checklist before acceptance; source
parity does not replace docs/viewer parity, external authority, Solid idioms,
accessibility/i18n, behavior, style, harness parity, or evidence/handoff.

## Layers

| Layer               | Upstream source             | Solid source                        | What to prove                                                                                                 |
| ------------------- | --------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| State               | `@react-stately/*`          | `packages/solid-stately/src`        | State shape, defaults, derived state, callbacks, commit/revert behavior.                                      |
| ARIA hooks          | `@react-aria/*`             | `packages/solidaria/src`            | Native semantics, roles, ARIA attributes, keyboard, focus, touch, virtual clicks, live announcements, hiding. |
| Headless components | `react-aria-components/src` | `packages/solidaria-components/src` | JSX structure, slots, contexts, render props, data attributes, event merging, refs, form/portal wiring.       |
| Styled S2           | `@react-spectrum/s2/src`    | `packages/solid-spectrum/src`       | Public S2 API, wrapper structure, provider contexts, style declarations, icons, geometry, motion.             |

## Procedure

For each upstream file in scope:

1. Identify the Solid file or files responsible for the same behavior.
2. Read both files, not just their exports.
3. Create a responsibility map: state, props, events, effects, DOM, styles, and
   tests.
4. Create the required
   [Source Branch Coverage](./source-branch-coverage.md) ledger. This is the
   line-by-line branch map that prevents source review from collapsing into a
   vague summary.
5. Run the [Solid Idioms And Reactivity](./solid-idioms.md) check for every
   React source pattern that crosses a context, child, render-prop, ref, or
   dynamic-prop boundary.
6. If the upstream branch affects another component through context, slots,
   child composition, refs, or shared state, create or update that affected
   component's validation notes under `Incoming Cross-Component Findings`.
   This is required even when the affected component is not in scope for the
   current implementation pass.
7. Mark every upstream branch as one of:
   - `matched`: equivalent behavior exists and is tested;
   - `ported-differently`: Solid uses a different structure with equivalent
     behavior and tests;
   - `not-applicable`: upstream branch does not apply, with a reason;
   - `gap`: missing or unproven behavior.
8. Do not mark the component accepted while any relevant branch is `gap`.

## What To Compare

- Interfaces, prop omission lists, default values, and context merging.
- Cross-component contracts where this component provides contexts, slots,
  refs, or state to children that will have their own validation pass later.
- Solid idiom risks: eager child reads, context provider boundaries, getter
  snapshots, render-prop object snapshots, ref timing, and cleanup ownership.
- Signal/state ownership and controlled vs uncontrolled paths.
- Derived render props such as `isHovered`, `isPressed`, `isOpen`,
  `isFocusVisible`, `isSelected`, `isInvalid`, `isPending`, and `isDisabled`.
- Event handlers, `mergeProps` semantics, user refs, cancellation, propagation,
  and callback ordering.
- Effects, timers, resize observers, media queries, and cleanup.
- Native element choice, DOM tree, role tree, generated IDs, labeling,
  descriptions, hidden inputs, and portals.
- Keyboard handling, focus management, virtual focus, and focus return.
- Collection behavior: keys, sections, disabled items, filtering, loading,
  virtualizer layout, and empty states.
- Style declarations, runtime style conditions, generated classes, icons, and
  forced-colors branches.
- Visual states and state-transition timelines.

## Evidence Template

Add this to the component validation notes or PR body. The detailed branch
ledger lives under `## Source Branch Coverage`; this section summarizes the
layer outcome.

```md
## Cross-Layer Source Audit

### State

- Upstream:
- Solid:
- Matched:
- Ported differently:
- Not applicable:
- Gaps:
- Tests:

### ARIA hooks

- Upstream:
- Solid:
- Matched:
- Ported differently:
- Not applicable:
- Gaps:
- Tests:

### Headless components

- Upstream:
- Solid:
- Matched:
- Ported differently:
- Not applicable:
- Gaps:
- Tests:

### Styled S2

- Upstream:
- Solid:
- Matched:
- Ported differently:
- Not applicable:
- Gaps:
- Tests:
```

## Branch Ledger

Use [Source Branch Coverage](./source-branch-coverage.md) for the detailed
ledger. Every `matched` or `ported-differently` branch that affects behavior,
style, accessibility, timing, or cleanup must link to direct evidence.

## Commands

```bash
COMPONENT="<Component>"
SLUG="<slug>"

rg --files apps/comparison/node_modules/@react-spectrum/s2/src | rg "$COMPONENT|$SLUG"
rg --files apps/comparison/node_modules/react-aria-components/src | rg "$COMPONENT|$SLUG"
rg --files apps/comparison/node_modules/@react-aria | rg "$COMPONENT|use$COMPONENT|$SLUG"
rg --files apps/comparison/node_modules/@react-stately | rg "$COMPONENT|use${COMPONENT}State|$SLUG"

rg --files packages/solid-stately/src | rg "$COMPONENT|$SLUG"
rg --files packages/solidaria/src | rg "$COMPONENT|$SLUG"
rg --files packages/solidaria-components/src | rg "$COMPONENT|$SLUG"
rg --files packages/solid-spectrum/src | rg "$COMPONENT|$SLUG"
```

Use `git diff --word-diff` or side-by-side editor comparison when a file is a
direct port. Use the responsibility map rather than textual similarity when
Solid structure differs from React.
