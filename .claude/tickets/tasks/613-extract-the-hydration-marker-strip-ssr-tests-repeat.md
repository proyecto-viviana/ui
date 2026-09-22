---
id: 613
type: task
title: "Extract the hydration-marker strip three SSR tests repeat"
created: 2026-09-22
parent: 531
status: open
history:
  - {
      state: open,
      at: 2026-09-22,
      note: "opened from the review of #545's commit `358e509c`, which had to assert on server markup and found three copies of the same idiom already in the tree: `html.replace(/<!--[\\s\\S]*?-->/g, \"\")`, at `packages/solidaria-components/test/utils.ssr.test.tsx:30` and `:41` and `packages/solidaria-components/test/utilsStreaming.ssr.test.tsx:66`. `renderToString` interleaves hydration markers between a label and the text behind it (`wrapped: <!--!$-->0`), so every SSR test that asserts on rendered text needs this. #545 added no fourth copy - it anchors on the markers instead (`serves()` in `packages/viviana-ui/test/TextField.ssr.test.tsx`) - but that is a second idiom for the same fact, not a fix. Why it was not extracted there: the obvious home is `packages/solidaria/test-utils`, whose barrel `index.ts` re-exports `hydrate.ts` and the `@solidjs/testing-library` helpers, and no `*.ssr.test.tsx` in the repository imports that barrel today - measured, `grep -rln solidaria-test-utils --include=*.ssr.test.tsx packages/` returns nothing - so importing it from a file that runs under `vitest.ssr.config.ts` is untried. Neither package's manifest needs a change: both `packages/solidaria-components/test` and `packages/viviana-ui/test` already import `@proyecto-viviana/solidaria-test-utils` from their hydrate halves",
    }
---

## Scope

Give `packages/solidaria/test-utils` one server-safe entry point that an
`*.ssr.test.tsx` can import under `vitest.ssr.config.ts`, export the strip from
it, and repoint the three copies above plus `serves()` in
`packages/viviana-ui/test/TextField.ssr.test.tsx` at it.

The entry point is the whole question: the existing barrel pulls in
`hydrate.ts` (`hydrate` from `@solidjs/web`), `axe.ts` and
`@solidjs/testing-library`. Prove the import resolves under the SSR config
before moving any assertion onto it; if it does not, a subpath that imports
nothing is the cheaper answer.

Non-goals: `packages/solid-spectrum/test/regression.test.tsx:93`, which strips
only the empty `<!---->` marker and is a different fact.

## Done when

One exported helper, four call sites, and `vp run test:ssr` green with the same
file and test counts it has today.

## Proof

`vp run test:ssr` before and after, and the vacuity check #545's receipt runs:
substituting a server-rendered `0` with `999` must fail every assertion that
reads it.

## Relationship

Child of #531. Residue of
[#545](./545-move-the-web-app-to-tanstack-solid-2.md); the measurement is in
`.agents/ssr-545-2026-09-22.children-snapshot-measurement.md` section 6.
Test-only, so no published source and no changeset.
