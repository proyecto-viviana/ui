---
id: 252
type: task
title: "Virtualize the S2 ComboBox and Picker listboxes as S2 does"
created: 2026-09-02
parent: 136
status: in-progress
history:
  - {
      state: open,
      at: 2026-09-02,
      note: "found by the #248 step-0 lane: posinset/setsize cannot appear because the Solid listbox is never virtualized",
    }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "wrapping solid-spectrum/viviana-ui ComboBox and Picker listboxes in Virtualizer+ListLayout with S2 LOADER_ROW_HEIGHTS",
    }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "wrappers + LOADER_ROW_HEIGHTS landed in both styled packages; ComboBox/Picker unit tests green; D13 seeds timed out in comparison:page fonts.ready (#250 lane)",
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

## Landed

Did not commit or stage. Changeset: `.changeset/s2-combobox-picker-virtualizer.md`.

- `react-spectrum/packages/@react-spectrum/s2/src/ComboBox.tsx:796-817` → `packages/solid-spectrum/src/combobox/index.tsx:1031-1055` (and viviana-ui twin). `layout={ListLayout}`, `estimatedRowHeight: 32`, `padding: 8`, `estimatedHeadingHeight: 50`, `loaderHeight: LOADER_ROW_HEIGHTS[size][scale]`.
- `react-spectrum/packages/@react-spectrum/s2/src/Picker.tsx:457-521` → `packages/solid-spectrum/src/picker/index.tsx:1112-1137` (and viviana-ui twin). Same options. RAC `Virtualizer` is context-only so S2 wraps outside the Popover; Solid `Virtualizer` renders a DOM wrapper, so the wrap sits inside the popover around the ListBox (wrapping outside shifted field hydration keys).
- `LOADER_ROW_HEIGHTS` table: `ComboBox.tsx:360-377` → `packages/solid-spectrum/src/combobox/index.tsx:402-420`. Picker import: `Picker.tsx:71` → `picker/index.tsx:90`.
- Scale: S2 `useScale()` (`utils.ts:21-28`, coarse-pointer media query → `large`, else `medium`) → `createMediaQuery("not ((hover: hover) and (pointer: fine))")` at `combobox/index.tsx:866-867` and `picker/index.tsx:857-858`. Not Provider `scale`.
- `estimatedHeadingHeight: 50` copied as S2's constant. S2 `listboxHeader` is `minHeight: controlSize()` (S/M/L/XL = 24/32/40/48) + `paddingY: centerPadding()`; not tuned.
- Loader: S2 `loadingWrapperStyles` is flex/center/`marginY: 8` with no height; row height is `LOADER_ROW_HEIGHTS` via layout. Table copied verbatim (S2 comment: "following the sizing of the existing rows").
- Picker options: `SelectListBox`/`SelectOption` each allocate a fresh list-state adapter, so `createOption` cannot read `isVirtualized` from `listBoxData`. `PickerItem` publishes `aria-posinset`/`aria-setsize` when a parent Virtualizer is present (`picker/index.tsx:1162-1188`). ComboBox shares `listState` and gets the attributes from `createOption`.
- Tests (append): `publishes aria-posinset and aria-setsize on every option when virtualized`; `sizes the virtualizer loader from LOADER_ROW_HEIGHTS for S and XL` (ComboBox); `sizes the loader row from LOADER_ROW_HEIGHTS for S and XL` (Picker). Red-then-green: ComboBox wrap removed → both new tests failed (`aria-posinset` null; probe empty); wrap restored → 23/23 green.
- `vp test run packages/solid-spectrum packages/viviana-ui`: 85 passed, 1082 passed, 1 expected fail.
- `vp run typecheck`: pass (no concurrent-lane failures).
- `vp run guard:layer-boundary`: NEW forks: 0 (combobox/picker already diverged; same hunk on both twins). `vp run guard:attribution-headers`: PASS.
- `vp run test:ssr`: 12 files, 26 passed. `vp run test:hydrate`: 12 files, 28 passed, 1 expected fail (Picker wrap-inside-popover required; wrap-outside failed Form+Picker and Picker.hydrate).
- D13 seeds: `comparison:build` succeeded. Playwright D13 timed out in `waitForComparisonRouteReady` on `document.fonts.ready` (`apps/comparison/e2e/comparison-page.ts:33`) for all four seeds — concurrent `#250` comparison refactor, no step-0 DOM diff captured.

Orchestrator follow-up (2026-09-02): the `PickerItem` `createEffect` that set `aria-posinset` / `aria-setsize` imperatively in the styled layer was removed from both twins. The attributes now come from the headless option as in RAC: `solidaria-components/src/Select.tsx` `SelectOption` passes `isVirtualized` from the parent `CollectionRenderer` into `createOption` (`createOption.ts:109` reads the prop before the listbox data), which is the same source `SelectListBox` already used. Red-then-green: `publishes aria-posinset and aria-setsize on every option when virtualized` fails with the prop returning `undefined`, passes with it wired. The wrap-inside-the-popover order and the DOM-rendering Virtualizer are tracked as #256.

Test-parity ratchet: the new `combobox|aria|aria-setsize` fact has no oracle in the pinned RAC/S2 ComboBox suites; the behavior is `react-aria/src/listbox/useOption.ts:130-133` under `isVirtualized`. Absorbed with `--write-baseline --allow-growth 252` (baseline `growthLog`).
