# Upstream Source Map

Every component audit starts by locating the upstream and Solid files. Missing
files are real gaps; guessed equivalence is not enough.

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

## Documentation Pull

Task 0 owns broad research. In this task, use MCP docs only to confirm exact
public API or accessibility details that are unclear from the source map:

| Need                                         | Tool                                                   |
| -------------------------------------------- | ------------------------------------------------------ |
| React Aria component props and accessibility | `get_react_aria_page`                                  |
| React Aria keyboard table                    | `get_react_aria_page "<Name>" "Keyboard Interactions"` |
| React Spectrum S2 props, slots, and examples | `get_s2_page`                                          |
| Related component pages                      | `list_react_aria_pages`, `list_s2_pages`               |
| S2 token/property values                     | `get_style_macro_property_values`                      |
| S2 icon choice                               | `search_s2_icons`                                      |

Source wins when docs and source disagree. Record the discrepancy.
