# Focus

Focus parity covers focus target, focus-visible modality, focus scopes, virtual
focus, focus restoration, and blur/commit behavior.

## Checks

- Initial focus and `autoFocus` match upstream.
- Keyboard focus-visible state appears only after keyboard modality.
- Mouse focus does not show keyboard focus ring unless upstream does.
- Composite widgets focus the same internal target on click, label click, and
  trigger press.
- Virtual focus uses `aria-activedescendant` when upstream does.
- Blur commits or reverts values in the same situations as upstream.
- Overlay dismissal returns focus to the same trigger element.
- Nested focus scopes contain and restore focus correctly.
- Ref or imperative focus APIs expose the same consumer-facing methods.
- Focus event order matches upstream for pointer down, press, click, keyboard
  activation, overlay open, overlay close, disabled transitions, and unmount.
- Focus cleanup leaves no inactive focused element, stale focus-visible state,
  or duplicate tabbable target.

## Tests

Playwright is better than static screenshots for focus timelines. Assert
`document.activeElement`, `data-focus-visible`, `aria-activedescendant`, and
focus after `Escape`, outside click, selection, and tab navigation.
