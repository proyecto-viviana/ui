---
"@proyecto-viviana/solid-spectrum": patch
---

TreeView: dim disabled rows with the high-contrast-aware color from the latest S2 designs

Our S2 `TreeView` already applied `disabledBehavior` and a disabled content
color, but it diverged from upstream `@react-spectrum/s2` in Windows High
Contrast Mode: the disabled color had no `forcedColors` fallback, and the
expand/collapse chevron set its own `neutral-subdued` color instead of
inheriting the row's. This ports upstream's `treeCellGrid` / `expandButton`
colors faithfully:

- the merged row/cell color now carries `isDisabled: { default: 'disabled',
  forcedColors: 'GrayText' }` (so disabled labels dim too, not only the
  description — previously a disabled label kept the enabled `neutral-subdued`
  color because the label `inherit`s a row color that had no disabled branch),
  plus the `forcedColors: 'ButtonText'` base and the `selectionStyle.highlight`
  `forcedColors: 'HighlightText'` that upstream sets on `treeCellGrid`;
- the disabled description color gains the matching `forcedColors: 'GrayText'`;
- the chevron defaults to `inherit` (tracking the row's text color) and its
  disabled color gains `forcedColors: 'GrayText'`.

Behavior outside High Contrast Mode is unchanged apart from disabled labels now
dimming to the same `disabled` color as disabled descriptions.
