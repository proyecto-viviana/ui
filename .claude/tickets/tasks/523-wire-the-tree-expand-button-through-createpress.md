---
id: 523
type: task
title: "Wire the Tree expand button through createPress"
created: 2026-09-09
parent: 136
status: open
history:
  - {
      state: open,
      at: 2026-09-09,
      note: "filed from the Terminal Glass port gate sweep on 117a2886",
    }
---

Second `a11y:smoke` red in `playground-components.spec.ts` (2 failed / 29 passed).

```
2) [chromium] › e2e/playground-components.spec.ts:378:3 › Playground Page › tree section expands and collapses nested branches from expand buttons

  Error: expect(locator).toBeVisible() failed

  Locator: locator('section[data-testid="section-tree"]').first().getByText('helpers.ts')
  Expected: visible
  Timeout: 5000ms
  Error: element(s) not found

    388 |
    389 |     await getUtilsRow().getByRole("button").click();
  > 390 |     await expect(section.getByText("helpers.ts")).toBeVisible();
        |                                                   ^
    391 |     await expect(getUtilsRow().getByRole("button")).toHaveAttribute("aria-label", "Collapse");
```

Clicking a tree chevron does nothing. Not a controlled-state bug: the same row expands from the keyboard. A live probe against `vp preview --port 4100` gives `ArrowRight -> aria-expanded: true`, `helpers.ts` count 1, so `createTreeState`'s controlled path (`packages/solid-stately/src/tree/createTreeState.ts:302-330`) and the demo's `expandedKeys`/`onExpandedChange` wiring (`apps/web/src/components/playground/advanced-data-color-sections.tsx:356-420`) are both fine. Only the pointer path is dead — a real click and a synthetic `el.click()` both leave `aria-expanded` unchanged.

## Root cause

The click never reaches Solid's delegated dispatcher. Instrumenting the propagation chain in the browser gives:

```
CAPTURE #document … CAPTURE div[row] … CAPTURE button.hd-tree__expand
button.hd-tree__expand bubble
div.hd-tree__row bubble
div[gridcell] bubble
div[row].solidaria-Tree-item bubble (cancelBubble=true)
```

Bubbling stops at the row. Patching `Event.prototype.stopPropagation` names the caller: a single frame, `HTMLDivElement.<handler> (createPress chunk)` — a real DOM listener on the row, not a delegated one.

That listener is `createPress`'s click handler. #506 changed it from a delegated `onClick` to a host-native `on:click` (`packages/solidaria/src/interactions/createPress.ts:886` and `:907`), and that handler defaults to `shouldStopPropagation = true` and calls `e.stopPropagation()` (`createPress.ts:826`, `:856-858`). A host-native listener on the row runs during real bubbling, _before_ the event ever reaches `document`, so Solid's document-level delegated walk never runs and no `$$click` fires anywhere in the subtree.

The expand button is exactly such a subtree handler: `createTreeItem` gives it a plain `onClick: onExpandClick` (`packages/solidaria/src/tree/createTreeItem.ts:281`, handler at `:259-266`), which Solid delegates. Its own `onPointerDown`/`onPointerUp`/`onMouseDown`/`onMouseUp` stops (`createTreeItem.ts:271-274`, `:282-285`) are delegated too, so they stop the row's _delegated_ pointer handlers but do nothing about the row's native click listener. The button's `stopPropagation` at `createTreeItem.ts:261` never even runs.

This is an invented divergence. Upstream returns the chevron as `AriaButtonProps` with `onPress`, and the chevron is a real RAC `Button` that runs it through `usePress` — `react-spectrum/packages/react-aria/src/tree/useTreeItem.ts:67-79`, consumed at `react-spectrum/packages/react-aria-components/src/Tree.tsx:1030-1031`. Upstream `usePress` publishes `onClick` in `pressProps` (`react-spectrum/packages/react-aria/src/interactions/usePress.ts:449`), a React synthetic handler, so the inner button's handler runs before the row's and ordering is preserved. Our chevron is a hand-rolled raw `onClick` with pointer-event stops instead.

## Scope

`packages/solidaria` `createTreeItem`, plus the `TreeExpandButton` host in `packages/solidaria-components/src/Tree.tsx:1738-1791` if it needs to spread press props. Replace the hand-rolled `onExpandClick` + four `stopPointerPropagation` handlers with an `onPress`-shaped `expandButtonProps` mirroring `useTreeItem.ts:67-79`, so the chevron carries its own host-native `on:click` from `createPress` and wins on the way up. Keep `excludeFromTabOrder`/`tabIndex: -1`, `data-react-aria-prevent-focus`, and the existing `aria-label`/`aria-labelledby` wiring exactly as they are.

Do not fix this in `solidaria-components` or in the playground demo (Rule #4). Do not revert #506's `on:click`; other components depend on it now.

`packages/solidaria-components/test/Tree.test.tsx:840-863` covers the chevron only in uncontrolled mode with `fireEvent.click` dispatched straight at the button, which is why jsdom stayed green through this. Rule #7: add a controlled-mode pointer case there, and keep the browser-level case in the spec.

## Done when

`playground-components.spec.ts:378` passes — chevron click expands, `helpers.ts` appears, `aria-label` flips to `Collapse`, second click collapses — and the keyboard path still expands. `Tree.test.tsx` gains a controlled-mode press case that fails against today's `onClick` wiring.

## Proof

```
vp test run packages/solidaria-components/test/Tree.test.tsx
vp exec --filter @proyecto-viviana/web -- playwright test e2e/playground-components.spec.ts --reporter=line
vp run a11y:smoke
```

## Relationship

Fallout of #506 (merged), same commit as #522 but a different mechanism and a different layer. Same class as the delegated-click failures owned by #525. Sibling under #136.
