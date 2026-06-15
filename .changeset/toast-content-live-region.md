---
"@proyecto-viviana/solidaria-components": patch
---

Announce toast content in an assertive live region.

`createToast` has always returned `contentProps` (`role="alert"` /
`aria-live="assertive"` / `aria-atomic="true"`) for the toast message area, but
the `Toast` component never applied them — the rendered toast carried only the
`role="alertdialog"` container, which is not a live region, so a newly shown
toast was not announced to screen readers. `DefaultToast` now wraps the message
column in a `ToastContent` element (kept as a sibling of the close button, per
React Aria guidance), and `Toast` applies the `contentProps` live-region
attributes to it via the same effect that wires the title/description IDs onto
pre-composed children. The toast's text is now announced when it appears.
