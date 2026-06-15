# Breadcrumbs parity audit seed

## Scope

- Slug: `breadcrumbs`.
- Current read: current-gate normalized, not full-gate accepted in validation index.
- Strict risk: High.

## Local implementation seeds

- `packages/solid-spectrum/src/Breadcrumbs.ts`
- `packages/solid-spectrum/src/breadcrumbs/index.tsx`
- `packages/solid-spectrum/src/breadcrumbs/s2-breadcrumbs-styles.ts`
- `packages/solid-spectrum/test/Breadcrumbs.test.tsx`
- `packages/solidaria/src/breadcrumbs/createBreadcrumbs.ts`
- `packages/solidaria/src/breadcrumbs/index.ts`
- `packages/solidaria-components/src/Breadcrumbs.tsx`
- `packages/solidaria-components/test/Breadcrumbs.test.tsx`

## Upstream S2 authority seeds

- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/exports/Breadcrumbs.mjs`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/private/Breadcrumbs.css`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/private/Breadcrumbs.mjs`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/types/exports/Breadcrumbs.d.ts`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/types/src/Breadcrumbs.d.ts`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/exports/Breadcrumbs.ts`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/src/Breadcrumbs.tsx`

## React Aria Components / React Aria / React Stately hints

- RAC hints: `Breadcrumbs`
- React Aria hints: `useBreadcrumbs`
- React Stately hints: none found by automated name map; inspect state hooks used by local source.

## Comparison evidence seeds

- Route page: present.
- Validation notes: `apps/comparison/playbook/components/breadcrumbs-validation-notes.md`.
- E2E specs: `apps/comparison/e2e/breadcrumbs-contract.spec.ts`, `apps/comparison/e2e/breadcrumbs-visual.spec.ts`.

## Required line-by-line audit axes

- [ ] API / exports / props / defaults
- [ ] ARIA and accessibility
- [ ] Keyboard and focus
- [ ] Forms and validation
- [ ] Behavior and timing
- [ ] HTML and DOM structure
- [ ] S2 styling and tokens
- [ ] Visual parity evidence
- [ ] I18n / RTL / locale
- [ ] External library and API usage
- [ ] Internal architecture / layer boundaries
- [ ] Tests that can fail for the branch

## Initial findings

- Automated source mapping found 8 local seed path(s) and 7 upstream S2 seed path(s).
- Automated test map found 2 component-related comparison spec(s), but the exact upstream branch coverage still needs source-backed verification.
- Initial depth follow-up found that local current breadcrumb items rendered as disabled anchors with `aria-current`, while upstream S2 renders current breadcrumb content as a non-link current element. Solid Spectrum now switches current breadcrumbs to `elementType="div"` and package tests assert the current item is no longer a link.

## Recommended future fixes / proof work

1. Open upstream S2 source first, then local Solid source, and build a branch table for every user-observable condition.
2. Classify each API/export delta as exact parity, Solid adaptation, documented local addition, unsupported, or bug.
3. Add or update tests only in a later implementation pass; this research document intentionally does not change code.
4. Close every unchecked axis above before marking this component certified from this audit.
