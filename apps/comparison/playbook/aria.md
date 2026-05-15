# ARIA

ARIA parity is checked against React Aria source, React Aria docs, and the live
DOM. Do not infer ARIA from screenshots.

## Common Misses

| Attribute               | Check                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------- |
| `aria-haspopup`         | Correct token such as `dialog`, `listbox`, or `menu`, not a generic boolean unless upstream uses it.          |
| `aria-controls`         | Presence condition matches upstream. Some widgets only set it while open.                                     |
| `aria-expanded`         | Toggles on trigger and input elements where upstream does.                                                    |
| `aria-activedescendant` | Updates during virtual-focus collection navigation.                                                           |
| `aria-required`         | Includes explicit prop and form/field context effects.                                                        |
| `aria-invalid`          | Includes explicit prop and constraint-derived invalid state.                                                  |
| `aria-disabled`         | Used on non-form elements instead of HTML `disabled` where upstream does.                                     |
| `aria-describedby`      | Chains external describedby, description, error, value description, and loading indicators in upstream order. |
| `aria-labelledby`       | Includes every label/trigger/header ID required for composite widgets.                                        |
| `aria-label`            | Is absent when visible label chains already cover the element.                                                |
| `aria-modal`            | Present on modal dialog overlays.                                                                             |
| `aria-multiselectable`  | Present for multi-select listbox/grid/tree patterns.                                                          |

## Native And Computed Semantics

- Prefer the same native element upstream uses; do not replace native behavior
  with ARIA roles unless upstream does.
- Validate the computed accessible name and description, not only the presence
  of `aria-label`, `aria-labelledby`, or `aria-describedby`.
- Validate the computed role and value, especially for meters, progress,
  sliders, switches, tabs, listboxes, trees, grids, menu items, and composite
  widgets.
- Assert every ID reference exists in the relevant state and is removed when
  upstream removes it.
- Check that multiple component instances do not collide generated IDs.
- Check that ARIA attributes appear and disappear under the same open, closed,
  disabled, invalid, loading, selected, and focused conditions as upstream.
- Record APG differences instead of treating APG examples as the implementation
  contract when upstream differs.

## Commands

```bash
rg -n "aria-[a-z-]+|role=|role:" \
  apps/comparison/node_modules/react-aria-components/src \
  apps/comparison/node_modules/@react-aria \
  packages/solidaria/src packages/solidaria-components/src
```

## Tests

Use `getByRole`, `getByLabelText`, and accessibility snapshots. Avoid tests that
only assert internal `data-*` markers. Prefer browser-level accessible-name
assertions for composite widgets, overlays, and controls with description or
error text.

## Blockers

Mark the component `partial` with `a11y-blocker` when any of these remain
unproven:

- role/name/description/value computation;
- keyboard model or focus-visible/focus-return behavior;
- ID reference lifetime or multiple-instance collision behavior;
- disabled, read-only, required, invalid, hidden, or inert semantics;
- live-region announcement content, timing, or cleanup;
- form label/help/error/reset/submit behavior;
- forced-colors, reduced-motion, or screen-reader-only affordance behavior.
