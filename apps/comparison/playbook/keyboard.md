# Keyboard

Keyboard parity covers keys, prevented defaults, focus strategy, selection
semantics, wrapping, and text entry.

## Checks

- Every documented key from React Aria and S2 docs has an assertion.
- `Enter`, `Space`, `Escape`, `Tab`, arrow keys, `Home`, `End`, `PageUp`, and
  `PageDown` match upstream where applicable.
- Prevented defaults and propagation match upstream for composite widgets.
- Consumer `onKeyDown`/`onKeyUp` handlers are chained or suppressed in the same
  order as upstream.
- Collection navigation skips disabled items.
- Focus wrapping follows the component prop contract.
- Typeahead, filter text, segmented input typing, or text selection behavior is
  covered where applicable.
- Link-like collection items activate navigation rather than selection when
  upstream does.
- Multi-select keyboard behavior differs from single-select only where
  upstream differs.

## Tests

Use user-like keyboard events against focused elements. Assert role, selected
state, focused key, active descendant, open state, committed value, and focus
return after dismissal. Include `defaultPrevented` or propagation checks where
upstream uses them to protect text editing, composite navigation, or overlay
dismissal.
