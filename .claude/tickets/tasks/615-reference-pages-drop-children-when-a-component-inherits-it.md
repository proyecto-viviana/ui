---
id: 615
type: task
title: "Reference pages drop `children` when the component inherits it"
created: 2026-09-22
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-22,
      note: "opened from the review of #549's `f4feeae2`. `declaringPackage()` (`scripts/extract-api-reference.ts:191-196`) keeps a member only when its first declaration file sits under this workspace's `packages/` and outside `node_modules`, so a prop a component inherits from `solid-js` is dropped with the DOM attributes. Measured at `767ceae6`: `ProviderProps extends ParentProps, ProviderInheritedProps` (`packages/viviana-ui/src/provider/index.tsx:63`), `apps/web/src/data/api-reference/pages/provider.json` lists 13 props and `children` is not one of them - `node -e` over the committed page: `provider primary has children? false`. `<Provider>` without children renders nothing, so this is the one omitted prop a reader cannot guess. It is not general: a component that declares `children` itself, like `Table` or `CenterBaseline`, lists it. Two candidate fixes: keep a member named `children` whatever declares it, or let `declaringPackage()` fall through for a small allowlist. Why this is its own ticket and not a same-commit fix: the pages that already list `children` render it two ways - measured over the committed data, `JSX.Element` 15 times and the expanded `number | boolean | RenderedElement | ArrayElement | (string & {}) | Node | JSX.ArrayElement` union 64 times - so an inherited `children` has to land on one of those renderings rather than a third, and that is a rendering decision, not a filter tweak.",
    }
---

## Scope

`scripts/extract-api-reference.ts` and the data it writes. Make the reference
pages list `children` for a component whose props interface inherits it, on the
same rendering the pages that declare it already use, then
`vp run api:extract` in the same commit.

Non-goals: listing anything else from outside the workspace. DOM attributes
stay out — that is the filter's point, and the page says so.

## Done when

`apps/web/src/data/api-reference/pages/provider.json` lists `children`,
`vp run guard:api-reference` exits 0, and `scripts/extract-api-reference.test.ts`
covers the inherited case.

## Proof

The extractor test, the guard exit code, and the `children` row in
`provider.json` with its rendered type.

## Relationship

Child of #544. Found by the review of #549. Same generator as #559.
