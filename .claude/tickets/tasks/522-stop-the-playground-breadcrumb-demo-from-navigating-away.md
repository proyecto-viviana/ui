---
id: 522
type: task
title: "Stop the playground breadcrumb demo from navigating away"
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

`vp run a11y:smoke` is red. `playground-components.spec.ts` runs 2 failed / 29 passed; this is the first of the two.

```
1) [chromium] › e2e/playground-components.spec.ts:160:3 › Playground Page › styled breadcrumbs expose current item semantics

  Error: expect(locator).toBeVisible() failed

  Locator: locator('section[data-testid="section-styled-breadcrumbs"]').first()
    .getByRole('list', { name: /default breadcrumbs demo/i }).first()
    .locator('[aria-current="page"]').first()
  Expected: visible
  Timeout: 5000ms
  Error: element(s) not found

    174 |     await products.click();
    175 |
  > 176 |     await expect(list.locator('[aria-current="page"]').first()).toBeVisible();
        |                                                                 ^
    177 |     expect(page.url()).toBe(beforeUrl);
```

The current item is not missing — the whole page is. A live probe against `vp preview --port 4100` shows the URL after `products.click()` is `http://localhost:4100/products`. The breadcrumb list, and with it `[aria-current="page"]`, is gone because the browser followed the link.

The demo hands every crumb a real `href`: `apps/web/src/components/playground/advanced-sections.tsx:1946-1951` (`{ id: "products", label: "Products", href: "/products" }`) and `:1966-1974` spreads that `href` onto `StyledBreadcrumbItem` next to an `onPress`. The spec at `apps/web/e2e/playground-components.spec.ts:172-177` asserts the opposite: click a crumb, current-item semantics survive, `page.url()` is unchanged.

## Root cause

The spec was written when the port swallowed link activation. #506 removed that: `createLink` no longer `preventDefault`s when `onPress` is set, and `createPress` moved its click handler to a host-native `on:click` (`packages/solidaria/src/interactions/createPress.ts:886`, `:907`). An enabled `<a href>` inside `Breadcrumbs` now does what upstream RAC does — it navigates. `packages/solid-spectrum/src/breadcrumbs/index.tsx:660-720` only chooses `elementType` per `isCurrent`; it has no business cancelling navigation.

So the component is right and the fixture is stale. `/products` is not a route in `apps/web`, so the click lands on a 404 and takes the section with it.

## Scope

`apps/web` only. Drop the `href` from the playground breadcrumb data at `advanced-sections.tsx:1946-1951` and keep `onPress` as the demo's navigation channel, so the demo stays in-page and the spec proves what it names — current-item semantics after activation. Do not re-introduce a `preventDefault` in `solidaria` or `solid-spectrum`; do not weaken the spec's `page.url()` assertion into a no-op.

If a crumb with a real `href` deserves coverage, that is a separate case with its own route and its own expectation that the URL _does_ change. Not this one.

## Done when

`playground-components.spec.ts:160` passes, `page.url()` is still asserted unchanged, and no crumb in the default or subtle demo carries a dead `href`.

## Proof

```
vp exec --filter @proyecto-viviana/web -- playwright test e2e/playground-components.spec.ts --reporter=line
vp run a11y:smoke
```

A preview on :4000 that is already running serves stale `dist` — let Playwright start its own web server, or use a free port.

## Relationship

Consequence of #506 (merged). Sibling of #523, the other `a11y:smoke` red from the same sweep — different component, different cause, filed apart. Sibling under #136.
