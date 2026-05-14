# Runtime Semantics And Lifecycle

This gate proves the browser-observable contract after the layer fixes are in
place and before visual evidence is accepted. It catches defects that source
comparison and screenshots cannot prove.

## Source Authority

Use [Source Index](./source-index.md) when a runtime claim depends on outside
authority. In short:

1. Upstream React Aria, React Stately, React Aria Components, and S2 source for
   the exact installed version.
2. React Aria and S2 component docs, testing docs, blog posts, and release notes
   explaining intended behavior.
3. W3C and WHATWG technical specifications.
4. APG patterns and examples for the relevant role or property.
5. ARIA-AT, WCAG, evaluation guidance, and testing-tool docs.

Record each discrepancy. Do not replace upstream behavior with APG behavior
unless the upstream source is clearly incomplete or the deviation is explicitly
chosen and documented.

## Native Semantics

- The primary interactive element matches upstream unless there is a documented
  Solid-specific reason.
- Native elements are preferred where upstream uses them; do not re-create a
  native control with ARIA roles.
- HTML `disabled`, `readonly`, `required`, `name`, `value`, `type`, and form
  ownership are used only where upstream uses native semantics.
- `aria-disabled`, `aria-readonly`, `aria-required`, and `aria-invalid` are used
  only where upstream uses ARIA semantics or a non-native element requires them.
- Links navigate, buttons trigger actions, inputs edit values, and composite
  widgets delegate focus exactly as upstream does.

## Accessible Computation

- Accessible name and description are computed, not inferred from attributes.
- `aria-labelledby` and `aria-describedby` reference existing IDs in the same
  open/closed state as upstream.
- ID order in description chains matches upstream where order affects
  announcements.
- `aria-controls`, `aria-expanded`, `aria-activedescendant`, `aria-owns`,
  `aria-busy`, and `aria-live` appear and disappear under the same conditions
  as upstream.
- Generated IDs are stable across rerenders and unique across multiple
  instances on the same page.
- SSR or hydration-sensitive ID behavior is tested where the package supports
  SSR; otherwise record `SSR: not applicable`.

## Modality Matrix

Validate each relevant input path separately:

| Modality                    | What to prove                                                                  |
| --------------------------- | ------------------------------------------------------------------------------ |
| Mouse                       | Hover, press, release, cancel, focus normalization, text-selection suppression |
| Keyboard                    | Focus-visible, activation keys, navigation, prevented defaults, focus return   |
| Touch                       | No emulated hover, press delay/cancel, scroll cancellation, mobile overlay     |
| Screen-reader virtual click | Activation path matches upstream without requiring pointer or keyboard state   |
| Reduced motion              | Animation branches respect upstream reduced-motion behavior                    |
| Forced colors               | Semantic colors, outlines, icons, and hidden text remain perceivable           |

If a modality is not applicable, record why.

## Event Pipeline

- Consumer event handlers fire in upstream order relative to internal handlers.
- `mergeProps`-style behavior is preserved: event handlers chain, class names
  combine, IDs dedupe, refs merge, and later scalar props override earlier ones.
- Solid dynamic props, context values, render props, and custom root props stay
  live through runtime transitions; no getter is accidentally converted into a
  one-time snapshot.
- `preventDefault`, `stopPropagation`, and event cancellation match upstream.
- Disabled and read-only states suppress events in the same places upstream
  suppresses them.
- Callback values, callback timing, and callback count match upstream for
  controlled and uncontrolled use.
- User-provided refs and imperative methods still work after internal refs are
  composed.

## Announcements

- Live-region text matches upstream for focus movement, selected item, option
  count, loading, validation, drag/drop, calendar paging, and completion states
  where applicable.
- Announcement timing matches upstream: no duplicate announcements, no stale
  messages after cleanup, and no missing message after async resolution.
- Locale, direction, number/date/calendar formatting, and translated strings
  come from the same provider or message family as upstream.

## Lifecycle Cleanup

After close, cancel, unmount, route change, disabled transition, or async
completion:

- no stale portal nodes remain;
- no stale `aria-hidden`, inert, scroll-lock, or body style state remains;
- no stale pressed, hovered, focused, dragged, loading, entering, or exiting
  data state remains;
- global listeners, observers, timers, animation frames, and subscriptions are
  removed;
- focus is restored or cleared exactly as upstream does;
- multiple instances do not share IDs, state, listeners, or portal cleanup.

## Solid Idiom Regression Checks

- Static JSX children and render-function children are both tested when upstream
  supports both.
- Child components that consume parent-provided context are created under the
  intended provider boundary.
- Provider, slot, and form context updates propagate after initial render.
- Custom render functions see state changes after hover, press, focus, pending,
  selected, open, invalid, disabled, or value transitions.

## Tests

Use Playwright or focused browser tests for runtime lifecycle checks. Unit tests
can cover utility-level behavior, but they cannot prove browser focus,
accessible-name computation, pointer/touch behavior, portal cleanup, or
screen-reader virtual-click paths.

Record the evidence as:

- source authority notes and discrepancies;
- native element/role decision;
- accessible-name and description assertions;
- modality rows tested or marked not applicable;
- event pipeline assertions;
- live-announcement assertions;
- lifecycle cleanup assertions.
