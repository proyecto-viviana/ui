---
id: 240
type: task
title: "Absorb S2 1.7.0 spectrum-tokens 14.15.0 and icon 1lh sizing"
created: 2026-09-02
parent: 34
status: open
history:
  - { state: open, at: 2026-09-02, note: "opened from the 2026-09 upstream train source diff" }
---

## Cause

S2 1.7.0 pins `@adobe/spectrum-tokens` 14.15.0 (was 14.0.0) and sizes
workflow icons with the CSS `lh` unit so they match text line height.
Release note: "Size icons to match the text line height using the lh unit"
and "If you rely on visual regression tests, expect diffs around icon
sizing". Source on `f56660b`: ActionButton `--iconWidth` and icon/avatar/
progress sizes become `'1lh'`
(`packages/@react-spectrum/s2/src/ActionButton.tsx`); same pattern on
ComboBox, Menu, ListView, TreeView, Badge, Button, CloseButton, Field,
SearchField, TagGroup, ToggleButton, NotificationBadge, DragPreview. Avatar
accepts `` `${number}lh` `` (`Avatar.tsx`). ActionButtonGroup vertical
items get `width: '100%'`. `style-utils` color-scheme `light dark` uses a
prefers-color-scheme media query. ActionBar close-button contrast, Menu
`staticColor: 'auto'` for inner buttons, and TableView empty `:has()` are
the other 1.7.0 styled-source deltas. Local still uses `fontRelative(20)`
and tokens 14.15.0 are pinned but styles have not been regenerated through
the macro. ADR 0001: S2 styling is generated from tokens in solid-spectrum;
never hand-tune to make a screenshot pass.

## Work

Regenerate solid-spectrum (and viviana-ui token consumption) from 14.15.0.
Copy the 1lh icon/avatar/progress source from pinned S2. Absorb ActionBar,
Menu staticColor, TableView `:has()`, ActionButtonGroup width, and
color-scheme media-query source. Do not loosen visual thresholds.

## Done when

Styled components match S2 1.7.0 icon metrics and token paint under the
comparison pair/certified gates; any remaining visual miss is a new ticket
with source evidence, not a threshold change.

## Relationship

Child of #220. ADR 0001. Token pin policy is #143 (already verified).
Distinct from #207 (size union alphabet).
