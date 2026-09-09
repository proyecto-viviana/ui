---
id: 525
type: task
title: "Clear the 43 unit failures in test:run"
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

`vp run test:run` is red, and has been for a day before the Terminal Glass port started.

```
  Snapshots  2 failed
 Test Files  18 failed | 304 passed (322)
      Tests  43 failed | 6275 passed | 1 expected fail | 6 skipped (6325)
```

Per file: `solidaria-components` Menu 13, Table 5, GridList 1, RadioGroup 1, FocusManagement 1; `solid-spectrum` ActionMenu 6, Checkbox 4, regression 2, Breadcrumbs 1, DatePicker 1, Image 1, Link 1, Meter 1, Radio 1, SearchField 1, TagGroup 1, Table 1; `solidaria` createMenu 1.

Pre-existence, by direct run in worktrees, not by blame dating: at `ca9205bc` (the port's base) the failure set is byte-identical to `117a2886` — same 18 files, same 43 titles, `6111 passed / 6161`. The port added tests, not failures. Going back further, at `0e2b70ff^` (`d13ac370`) the same suite is `Test Files 7 failed | 296 passed (303)`, `Tests 8 failed | 6132 passed`. So this splits cleanly in two.

## The 35 introduced by #506

`0e2b70ff` ("Keep enabled Link href clicks from preventDefaulting…") moved `createPress`'s click handler from a delegated `onClick` to a host-native `on:click` (`packages/solidaria/src/interactions/createPress.ts:886`, `:907`) and made it non-enumerable on the returned props (`:924-931`). A host-native listener runs during real DOM bubbling and defaults to `shouldStopPropagation = true`, then calls `e.stopPropagation()` (`createPress.ts:826`, `:856-858`) — so it fires _before_ the event reaches `document`, and Solid's document-level delegated walk never runs for anything below it.

The failures read as that one mechanism:

```
FAIL packages/solidaria-components/test/Menu.test.tsx > Menu > actions > should support onAction on items
AssertionError: expected "vi.fn()" to be called 1 times, but got 0 times
 ❯ packages/solidaria-components/test/Menu.test.tsx:661:24
    660|       await user.click(screen.getByRole("menuitem", { name: "Cat" }));
    661|       expect(onAction).toHaveBeenCalledTimes(1);
```

Menu/ActionMenu action dispatch (~22 titles), Table/GridList/RadioGroup/TagGroup pointer selection and removal (~9), Checkbox label-click and controlled sync (3), DatePicker segment focus on group click, Breadcrumbs overflow-menu collapse. Confirmed by run: `Menu.test.tsx` and `GridList.test.tsx` are fully green at `0e2b70ff^`, and `Checkbox.test.tsx` has 1 failure there instead of 4.

Upstream `usePress` publishes `onClick` in `pressProps` as an ordinary React synthetic handler (`react-spectrum/packages/react-aria/src/interactions/usePress.ts:449`), delegated at the React root, so an inner handler always runs before an outer one and `stopPropagation` on the outer never starves the inner. The host-native `on:click` has no upstream counterpart and inverts that ordering (Rule #2).

## The 8 that predate it

- 2 snapshots in `packages/solid-spectrum/test/regression.test.tsx:412` (Menu, ActionMenu). The only difference is attribute **order** on the popover dialog: recorded `lang="en-US" dir="ltr"`, emitted `dir="ltr" lang="en-US"`. Nothing behavioral.
- 6 context/Form inheritance titles: `Image.test.tsx:205`, `Link.test.tsx`, `Meter.test.tsx`, `Radio.test.tsx`, `SearchField.test.tsx`, `Checkbox.test.tsx`. Shape is the same in each — a local prop is meant to displace the context prop and does not: `expect(element).not.toHaveClass("context-image")`, received `context-image local-image …`.

## Scope

Fix the ordering in the lowest layer, in `packages/solidaria`. The 35 want `createPress` to stop starving descendant handlers: either publish the click through a channel that preserves inner-before-outer ordering the way React delegation does, or stop the default `stopPropagation` from reaching descendants that have their own press. Whatever the shape, `packages/solidaria/test/createPress.test.tsx` and `createLink.test.tsx` must stay green and #506's Link D4 titles must not regress — do not simply revert `on:click`.

The 8 are separate work in `solid-spectrum` and can land independently: fix context-vs-local prop precedence in the styled layer, and re-record the two snapshots only after confirming the attribute-order change is real and harmless.

Do not paper over any of this by relaxing a test.

## Done when

`vp run test:run` is green — 0 failed, 0 failed snapshots — with no test deleted, skipped, or weakened, and the pointer paths that the 35 cover are still proved by the same assertions.

## Proof

```
vp run test:run
vp test run packages/solidaria/test/createPress.test.tsx packages/solidaria/test/createLink.test.tsx
COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer \
  vp exec --filter @proyecto-viviana/comparison -- \
  playwright test e2e/certified/link.certified.spec.ts --grep 'D4'
```

## Relationship

Regression from #506 (merged) plus an older `solid-spectrum` residual. Distinct from #493 and its #497–#514 children, which own certified **Playwright** cells from run 34155176389, not unit tests. #523 is the same `createPress` mechanism reaching the browser through the Tree chevron; fixing this ticket's 35 may close it, and it is filed apart because it also carries a Rule #2 divergence of its own. Sibling under #136.
