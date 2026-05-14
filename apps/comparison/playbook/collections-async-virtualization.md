# Collections, Async, And Virtualization

Collection parity covers items, sections, disabled keys, filtering, loading,
empty states, and virtualized layout.

## Checks

- Static children and `items` render paths both work.
- `textValue`, keys, section headers, separators, and item order match upstream.
- Filtering preserves sections and removes empty sections only when upstream
  does.
- Disabled items are skipped or focusable according to upstream behavior.
- Empty state text and loading text are localized and state-dependent.
- Async states such as `loading`, `filtering`, `loadingMore`, and `idle` render
  the same field spinner, list spinner, and empty state.
- Loading spinners use upstream delay behavior when present.
- Virtualizer layout options match upstream row heights, heading heights,
  padding, loader heights, and scroll behavior.
- `onLoadMore` fires from the correct sentinel row and does not fire when
  loading is inactive.

## Tests

Cover at least one static list, one item-renderer list, one empty/filtering
state, one disabled item, and one async/loading state for collection widgets.
