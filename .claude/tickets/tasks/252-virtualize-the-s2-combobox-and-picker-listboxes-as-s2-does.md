---
id: 252
type: task
title: "Virtualize the S2 ComboBox and Picker listboxes as S2 does"
created: 2026-09-02
parent: 136
status: open
history:
  - {
      state: open,
      at: 2026-09-02,
      note: "found by the #248 step-0 lane: posinset/setsize cannot appear because the Solid listbox is never virtualized",
    }
---

## Cause

Pinned S2 wraps both popover listboxes in a `Virtualizer` with `ListLayout`:

- `@react-spectrum/s2/src/ComboBox.tsx:796-817` — `layout={ListLayout}`,
  `estimatedRowHeight: 32`, `padding: 8`, `estimatedHeadingHeight: 50`,
  `loaderHeight: LOADER_ROW_HEIGHTS[size][scale]`.
- `@react-spectrum/s2/src/Picker.tsx:457-521` — same options, same
  `LOADER_ROW_HEIGHTS` imported from `ComboBox.tsx:71`.

`solid-spectrum/src/combobox/index.tsx` and `picker/index.tsx` render the
`solidaria-components` ListBox unwrapped, so `isVirtualized` is always false
and every option lacks `aria-posinset` / `aria-setsize` (RAC
`useOption.ts:130-131` publishes them only under virtualization). The D13
seed journeys (#244) diff this at step 0 on both components, and the list
observations (`scrollTop`, `focusedOptionInView`, loader row) can never match
because the Solid list is a plain flow layout while React's is absolutely
positioned by `ListLayout`.

`solidaria-components` already exports `Virtualizer`, `ListLayout`,
`VirtualizerContext` (`src/index.ts:199-209`) and the virtualizer keyboard
guard (#205) already pins the walk, so this is a styled-layer wiring gap, not
a missing primitive.

## Work

- Wrap the ComboBox and Picker listboxes in `Virtualizer` with the exact S2
  layout options; port `LOADER_ROW_HEIGHTS` from `ComboBox.tsx` and share it
  with Picker the same way.
- Mirror into the `@proyecto-viviana/ui` twins (layer-boundary: identical
  copy or baselined divergence, never a new fork).
- Confirm the heading (`estimatedHeadingHeight`) and loader row heights
  against the S2 `listboxHeader` / loader styles; do not tune to a screenshot
  (ADR 0001).

## Done when

- Under `solid-spectrum` ComboBox and Picker, every rendered option carries
  `aria-posinset` / `aria-setsize` equal to React's, and the D13 seed journeys
  no longer diff `posinset` / `setsize` at step 0.
- Unit tests: options publish posinset/setsize; the loader row height
  matches `LOADER_ROW_HEIGHTS[size][scale]` for each size/scale.
- Certified ComboBox/Picker D3/D5/D6 counts unchanged or better; the list
  `scrollTop` observation in the D13 `many` preset (#245/#246) matches.

## Relationship

Child of #136. Found in #248; blocks the ComboBox/Picker D13 journeys #245
and #246 on every `list` observation. Independent of #251 (animation) and
#250 (harness code-splitting).
