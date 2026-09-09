---
id: 524
type: task
title: "Put the Tabs selected-to-focused copy back on a commit effect"
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

`vp run test:hydrate` is red: `Test Files 1 failed | 19 passed (20)`, `Tests 1 failed | 38 passed (39)`.

```
FAIL |hydrate| packages/viviana-ui/test/Collections.hydrate.test.tsx > collection components hydrate over SSR markup > Tabs settles focus order after hydrating a panel with a tabbable child
AssertionError: expected <textarea …(2)></textarea> to be <div …(9)>…(2)</div> // Object.is equality

- <div
-   aria-controls="solidaria-…-tabpanel-draft"
-   aria-selected="true"
-   data-selected="true"
-   id="solidaria-…-tab-draft"
-   role="tab"
-   tabindex="-1"
- >
```

`packages/viviana-ui/test/Collections.hydrate.test.tsx:75` tabs forward from the control before the tablist and expects to land on `tabs[0]`; focus goes straight to the panel's `textarea` instead. The expected node in the diff tells the story: the selected tab is sitting at `tabindex="-1"`, so the whole tablist is out of sequential focus order and Tab skips it.

## Root cause

Every tab reads `tabIndex: isKeyFocused() ? 0 : -1` (`packages/solidaria/src/tabs/createTabs.ts:527-532`), which mirrors `useSelectableItem`. With `focusedKey` still `null` after hydration, no tab is tabbable at all.

`focusedKey` is supposed to be seeded from the selected key. #507's commit `d91b34a6` moved that seeding off a `createComputed` and onto `requestAnimationFrame`: `packages/solid-stately/src/tabs/createTabListState.ts:232-262` subscribes to `selectedKey`/`focusedKey`/`isFocused` and defers `copySelectedToFocusedKey` to the next animation frame. That was done to keep D4's capture-phase read of `pointerup`/`click` at `tabindex="-1"` for a mouse press. Over hydrated SSR markup the frame has not run by the time focus order is exercised, so the seed never lands and the tablist is unreachable.

Upstream does this in a plain commit effect with no frame deferral — `react-spectrum/packages/react-stately/src/tabs/useTabListState.ts:79-100`, the `useEffect` whose body ends at `:92-99`. React's commit runs before any user event can be dispatched, so the roving index is always seeded. The `requestAnimationFrame` is a local invention with no upstream counterpart (Rule #2), and it is what breaks here.

Pre-existence, by direct run in a worktree: at `d91b34a6^` (`d13ac370`) `vp run test:ssr` then `vp run test:hydrate` gives `Test Files 20 passed (20)`, `Tests 39 passed (39)`. At `ca9205bc`, the port's base, and at `117a2886` the same single test fails with the same message. #483's merge note recorded hydrate 39 green when it created this test; #507 turned it red a day before the Terminal Glass port started.

## Scope

`packages/solid-stately/src/tabs/createTabListState.ts` only. Find a seeding schedule that mirrors `useEffect` commit timing — a Solid `createEffect` writes after the render pass and before the browser dispatches the next event, which is the upstream ordering — and keep D4's mouse-click `tabindex` expectation green without a frame hop. `packages/solidaria/src/tabs/createTabs.ts` does not change; the roving rule there already matches upstream.

## Done when

`test:hydrate` is 39/39 and `test:ssr` stays 43/43, `createTabListState.test.ts` and `createTabs.test.tsx` stay green, and the Tabs D4 certified journey that #507 fixed does not regress.

## Proof

```
vp run test:ssr
vp run test:hydrate
vp test run packages/solid-stately/test/createTabListState.test.ts packages/solidaria/test/createTabs.test.tsx packages/solid-spectrum/test/Tabs.test.tsx packages/viviana-ui/test/Tabs.test.tsx
COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer \
  vp exec --filter @proyecto-viviana/comparison -- \
  playwright test e2e/certified/tabs.certified.spec.ts --grep 'D4'
```

`test:hydrate` reads fixtures written by `test:ssr`; run them in that order.

## Relationship

Regression from #507 (merged). Re-opens the behavior #483 (merged) landed. Not part of the #525 unit remainder — that one is a different commit and a different mechanism. Sibling under #136.
