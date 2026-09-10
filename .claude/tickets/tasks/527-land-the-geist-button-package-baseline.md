---
id: 527
type: task
title: "Land the experimental Geist Button package as a workspace sibling"
created: 2026-09-10
parent: 526
status: merged
history:
  - {
      state: in-progress,
      at: 2026-09-10,
      note: "owner named @proyecto-viviana/geist; first slice is Button only",
    }
  - {
      state: in-progress,
      at: 2026-09-10,
      note: "local proof passed at 4f1784cf; waiting on the implementation commit",
    }
  - {
      state: merged,
      at: 2026-09-10,
      note: "workspace package, guards, and smoke landed; verified waits on this commit",
    }
---

Land `@proyecto-viviana/geist` as a styled sibling of Kumo.

## Scope

- Keep Geist as a styled sibling that depends on `solidaria-components`.
- Keep the public slice to `Button` and the documented Geist-shaped API.
- Keep workspace version `0.0.0` and Changesets ignore. Do not publish.
- Do not add the `geist` font package or `@vercel/geistcn`.
- Do not reimplement press, focus, keyboard, or pending behavior.

## Done when

- Unit tests name pointer, keyboard, disabled, loading, prefix, size,
  variant, svgOnly name, ref, and attribute-forwarding failure modes.
- SSR and hydrate readers cover the Button.
- The packed package exposes the root, Button deep import, CSS, types,
  Solid condition, DOM use, and SSR use.
- Repository guards include the package without weakening an existing
  budget.
- `vp run build:geist`, the focused Geist test, `vp run ui:smoke`,
  `vp run test:ci-guard-contracts`, and `vp run ci:changesets` pass.

## Proof

Working directory: `ui`. Source revision before the uncommitted land:
`4f1784cf79a9b968b93410f78709385be463b1a3`.

| Kind | Command | Result |
| --- | --- | --- |
| local | `vp run build:geist` | passed |
| local | `vp test run packages/geist/test/Button.test.tsx` | 20 passed |
| local | `vp test run --config vitest.ssr.config.ts packages/geist/test/Button.ssr.test.tsx` | 1 passed |
| local | `vp test run --config vitest.hydrate.config.ts packages/geist/test/Button.hydrate.test.tsx` | 1 passed |
| local | `vp run typecheck` | passed |
| local | `vp run test:ci-guard-contracts` | passed |
| local | `vp run ci:changesets` | passed; Geist stays ignored at `0.0.0` |
| integration | `vp run ui:smoke` | passed; packed `@proyecto-viviana/geist@0.0.0` rendered `data-geist-component="Button"` |

`merged` is this commit. `verified` waits on the same commands against it.

## Relationship

Parent #526. Follows the Kumo baseline shape in #37. Comparison fixtures
are #528. Landing is #529. Owner review is #530.
