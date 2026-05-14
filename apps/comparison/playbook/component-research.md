# Component Research

Complete this before baseline, source mapping, or implementation. The goal is
to understand the component's intended behavior well enough that later tasks
can validate against sources instead of memory or file names.

## Source Search

Use [Source Index](./source-index.md) to pick sources, and use only sources for
the target component and directly related patterns.

| Need                                       | Source                                                                  |
| ------------------------------------------ | ----------------------------------------------------------------------- |
| React Aria component behavior and props    | `get_react_aria_page "<Component>"`                                     |
| React Aria examples and testing guidance   | `list_react_aria_pages`, then matching example or testing pages         |
| React Aria blog or release context         | `list_react_aria_pages`, then matching blog/release pages               |
| Spectrum S2 page sections                  | `get_s2_page_info "<Component>"`                                        |
| Spectrum S2 props, slots, examples, viewer | `get_s2_page "<Component>"`                                             |
| APG pattern requirements                   | <https://www.w3.org/WAI/ARIA/apg/patterns/>                             |
| APG role/property/example cross-reference  | <https://www.w3.org/WAI/ARIA/apg/example-index/>                        |
| Browser or platform behavior               | MDN or specs only when React Aria/APG depends on native element details |

Not every component has a React Aria blog post or APG example. Record `none
found` instead of widening the search until it becomes generic.

## Source Authority

Use the source hierarchy in [Source Index](./source-index.md). In short:

1. installed upstream source for the exact version;
2. React Aria and S2 docs, testing docs, blog posts, and release notes.
3. W3C and WHATWG technical specifications.
4. APG patterns and examples.
5. ARIA-AT, WCAG, evaluation guidance, and testing-tool docs.

APG explains accessibility patterns; it is not automatically the implementation
contract for this port. Record any place where upstream intentionally differs
from APG.

## Research Notes

Create short validation notes for the component with:

- component or component-family name;
- React Aria docs page names used;
- React Aria blog, release, example, or testing pages used;
- S2 docs page names used;
- S2 docs section inventory and interactive viewer controls;
- APG pattern and example URLs used;
- one-sentence purpose of the component;
- primary native element, role, or composite pattern;
- required subpatterns, such as `button`, `dialog`, `grid`, `listbox`,
  `menu`, `slider`, `spinbutton`, `tablist`, or `tree`;
- known source disagreements and chosen authority;
- source-backed validation obligations.

Also fill in
[Official Docs And Viewer Parity](./official-docs-viewer-parity.md). Record
every official docs example and interactive viewer control as `covered`,
`route-gap`, `port-gap`, `docs-drift`, or `not-applicable`.

## Validation Obligations

Extract obligations into the later playbook categories:

- public props, slots, contexts, refs, aliases, and defaults;
- official docs page examples, interactive viewer settings, and documented
  option/default values;
- native element choice, generated IDs, provider requirements, and SSR/hydration
  notes;
- roles, names, descriptions, ARIA states, and DOM relationships;
- keyboard interaction and focus movement;
- pointer, touch, virtual-click, and screen-reader interaction notes;
- event handler ordering, cancellation, `mergeProps` behavior, and user refs;
- controlled/uncontrolled state, commit timing, reset behavior, and callback
  ordering;
- open, close, hover, press, focus-visible, selection, loading, animation, and
  cleanup transitions;
- form submission, validation, hidden inputs, and provider context;
- internationalization, RTL, locale, calendar, number, or color behavior;
- high contrast, forced colors, reduced motion, geometry, and overlay
  positioning requirements;
- documented limitations, caveats, or places where React Aria intentionally
  differs from APG examples.

## Validation

- Every later validation claim must point to these notes, upstream source, or a
  newly recorded reason that the behavior is not applicable.
- Every APG pattern used by the component is named, or `APG: not applicable` is
  recorded.
- Every source disagreement records the authority used for this pass.
- Every S2 docs example and interactive viewer setting is mapped to the route,
  source branch ledger, or an explicit gap.
- Every missing React Aria blog/example/testing page is recorded as `none
found`, not silently skipped.
- No implementation code changes in this task.
