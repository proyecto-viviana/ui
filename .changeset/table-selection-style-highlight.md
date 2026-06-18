---
"@proyecto-viviana/solid-spectrum": patch
---

TableView: add `selectionStyle="highlight"` (port of upstream S2 highlight selection)

Upstream S2's `TableView` exposes `selectionStyle?: 'checkbox' | 'highlight'`
(default `'checkbox'`). Highlight selection swaps the underlying selection
behavior from `toggle` to `replace` and drops the selection checkboxes, so a
plain click selects a whole row (and replaces the prior selection) instead of
toggling a checkbox. Our `TableView` only exposed the raw `selectionBehavior`,
so the styled highlight mode was missing.

`TableView` now accepts `selectionStyle`, mirroring the same prop we already
ship on `TreeView`:

- `selectionStyle="highlight"` derives `selectionBehavior="replace"` for the
  underlying headless table (an explicit `selectionBehavior` still overrides),
  matching upstream's `selectionStyle === 'highlight' ? 'replace' : 'toggle'`.
- Both the select-all column header and the per-row selection checkboxes are
  gated on `selectionStyle === 'checkbox'` with `toggle` behavior, exactly like
  upstream — highlight mode renders neither.
- Selected rows pick up the blue-tinted highlight background
  (`color-mix(gray-25, blue-900, 10%)`, `15%` on hover/press) instead of the
  gray checkbox-mode fill, with `Highlight`/`HighlightText` forced-colors
  fallbacks. The style change is scoped to the highlight path, so the default
  checkbox style is byte-for-byte unchanged.
- The grid carries `data-selection-style` for styling/testing parity with
  `TreeView`.

The default remains `'checkbox'`, so existing tables are unaffected. The
virtualized-grid polish from upstream's `TableView` — contiguous-selection-block
rounded corners and box-shadow row dividers driven by `isNextSelected` /
`isPrevSelected` — is tied to the S2 virtualizer's sticky-cell z-index layering
and is **not** part of this change for our real-DOM `<table>`; it remains a
tracked follow-up, matching the fidelity bar of the shipped `TreeView` highlight
port.
