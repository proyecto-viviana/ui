---
id: 266
type: task
title: "Do not render a Load more row when Picker loadingState is loading"
created: 2026-09-03
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 picker functional pass: loadingState=loading adds a Solid-only Load more option and a taller overlay",
    }
  - {
      state: merged,
      at: 2026-09-03,
      note: "ListBoxLoadMoreItem only renders the loader option while isLoading, matching RAC. loadingState=loading no longer inserts Load more.",
    }
---

S2 `loadingState="loading"` paints a progress circle on the field
(`role="progressbar"` name `Loading…`) and does **not** add a list row when
the collection already has items. Solid matches the field spinner, then on
open inserts a disabled `Load more` option and grows the overlay.

## Evidence

`http://127.0.0.1:4341/components/picker/?loadingState=loading` — closed:
both panels expose `progressbar` `Loading…`. Open:

- React overlay: 3 options, height 112, opacity 1 (same as idle).
- Solid overlay: 4 options, last named `Load more` `aria-disabled="true"`,
  height 149. `data-comparison-load-more-count` is `1` (React `26` — React
  `onLoadMore` also fires, but without a visible extra row).

`?loadingState=loadingMore`: both stacks add a trailing nameless loader
row (React height 144, Solid 148). That path is the S2 `loadingMore`
sentinel. The `loading` case is the miss.

Solid Picker already gates list loading with
`isLoading={isLoadingMore()}` (`packages/solid-spectrum/src/picker/index.tsx`).
The extra row still appears when the fixture passes `onLoadMore` for any
non-idle `loadingState` (both fixtures do). S2 does not show that row for
`loading`.

## Done when

`loadingState=loading` on the comparison Picker opens a 3-option list whose
height matches React; the field spinner remains. `loadingMore` still shows
the trailing loader. A regression test fails if a `Load more` option appears
under `loading`.

## Relationship

Child of #24. Found by #260. Adjacent to #252 (virtualizer / loader height)
but this is the `loading` vs `loadingMore` branch, not virtualization itself.
