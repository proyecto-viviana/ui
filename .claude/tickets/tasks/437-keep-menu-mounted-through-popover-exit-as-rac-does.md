---
id: 437
type: task
title: "Keep Menu mounted through popover exit as RAC MenuInner does"
created: 2026-09-03
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the Wave-3 CI follow-through: menu-focus.spec.ts:20 red after b790e84e; #257 hypothesis was incomplete",
    }
  - {
      state: merged,
      at: 2026-09-03,
      note: "Inside Popover, Menu stays mounted (no isOpen Show) and uses a plain FocusScope; Popover/Overlay restore trigger focus. Hung-animation jsdom in solid-spectrum Menu.test.tsx. menu-focus.spec.ts:20 green against vp preview with COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer.",
    }
---

Certification Gates `a11y:full` → `apps/web/e2e/menu-focus.spec.ts:20` fails:
ArrowDown opens and focuses `"New file"`, Escape closes, ArrowUp reopens —
`"Save"` is never focused (`Received: inactive`). Green on `b0460ae8`; red on
`b790e84e` (Popover `renderChildrenStable`) and later.

`renderChildrenStable` is the correct React-reconciliation port. It exposed a
Menu lifecycle divergence. Do not remount PopoverInner, do not re-apply
`autoFocus` on the surviving instance, and do not weaken the e2e.

## Cause

RAC `MenuInner` (`react-aria-components/src/Menu.tsx:364-404`) wraps the menu
in a plain `<FocusScope>` (no `restoreFocus`) and does not gate on `isOpen`.
Popover/`useExitAnimation` keeps Inner mounted until exit finishes, then
Overlay restores the trigger, then ArrowUp mounts a **fresh** menu and
`autoFocus="last"` fires. `await expect(menu).toHaveCount(0)` waits that
~200 ms unmount on RAC.

The port:

- hides Menu as soon as `isOpen` is false
  (`packages/solidaria-components/src/Menu.tsx` `shouldRender` +
  `<Show when={shouldRender()}>`)
- restores focus immediately via nested `<FocusScope restoreFocus>`
- keeps the `createMenu` instance alive (`autoFocusDone` never resets)

Playwright therefore proceeds at once while PopoverInner is still exiting.
ArrowUp is reopen-during-exit on the same instance, so `"last"` never runs.
RAC would also not re-apply autofocus on that path; the e2e does not
exercise it on RAC because count `0` means full unmount.

## Work

- Drop the `isOpen` `Show` gate. Popover's `isOpen || isExiting` owns
  lifetime.
- Drop `restoreFocus` on Menu's FocusScope. Match RAC MenuInner.
- Keep `renderChildrenStable`.
- jsdom in `packages/solid-spectrum/test/Menu.test.tsx` next to the enter
  animation test: hang `getAnimations().finished` through Escape → ArrowUp
  (no mock = false green). After the fix, last item is focused. Also assert
  the RAC lifecycle: after Escape the overlay is still `data-exiting` with
  `role="menu"` present and the trigger not yet restored; resolve exit;
  menu gone; trigger focused; ArrowUp focuses last.
- Reproduce `menu-focus.spec.ts:20` against `vp preview` with
  `COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer` on this host.

## Done when

`menu-focus.spec.ts:20` is green on CI and locally. The hung-animation jsdom
cases are green. Menu DOM stays in the tree while the popover is exiting.

## Relationship

Child of #24. Discovered on #257 (compose S2 Popover); not a Popover
enter/exit bug (#251). Related overlay contain is #267; DialogTrigger restore
is #274. MenuTrigger + S2 `Button` / `PressResponder` is #439, not this ticket.
