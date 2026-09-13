---
id: 528
type: task
title: "Mount a Solid Geist Button fixture in the comparison app"
created: 2026-09-10
parent: 526
status: merged
history:
  - { state: open, at: 2026-09-10, note: "Solid-only until a legal React oracle exists" }
  - {
      state: merged,
      at: 2026-09-12,
      note: "Solid Geist Button fixture mounted at /experiments/geist-button/ and integrated into comparison catalog under Button. Verified with comparison:build, Button.ssr.test.tsx, Button.hydrate.test.tsx, Button.test.tsx, and astro check.",
    }
---

Mount a Solid Geist Button fixture in the comparison harness.

## Scope

- Cover variant, size, shape, svgOnly, prefix, loading, disabled, light,
  and dark cases.
- Keep Geist paint out of `apps/comparison`.
- Do not mount `@vercel/geistcn`. It is not on public npm.

## Done when

The Solid fixture renders in development and production builds. Shared
controls update the public API. No comparison-local CSS changes Geist
paint.

## Relationship

Depends on #527. There is no React pair until an owner-approved oracle
exists.

## Proof

Working directory: `ui`.

| Kind  | Command                                                                                     | Result                                                                               |
| ----- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| local | `vp run comparison:build`                                                                   | passed; 91 pages generated including `/experiments/geist-button/` and `solid/` frame |
| local | `vp test run --config vitest.ssr.config.ts packages/geist/test/Button.ssr.test.tsx`         | 1 passed                                                                             |
| local | `vp test run --config vitest.hydrate.config.ts packages/geist/test/Button.hydrate.test.tsx` | 1 passed                                                                             |
| local | `vp test run packages/geist/test/Button.test.tsx`                                           | 20 passed                                                                            |
| local | `npx astro check` (in apps/comparison)                                                      | passed; 0 errors, 0 warnings across 433 files                                        |
| local | `npm --prefix apps/comparison run guard:fixture-registry-split`                             | passed; ok                                                                           |
| local | `npm --prefix apps/comparison run report:gaps`                                              | passed; 0 missing/gap entries                                                        |
