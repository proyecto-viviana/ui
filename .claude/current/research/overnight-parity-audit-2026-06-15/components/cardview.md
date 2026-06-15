# CardView parity audit seed

## Scope

- Slug: `cardview`.
- Current read: partial: Card/CardView note lists release-hardening gaps.
- Strict risk: Blocker.

## Local implementation seeds

- `packages/solid-spectrum/src/CardView.ts`
- `packages/solid-spectrum/src/cardview/index.tsx`
- `packages/solid-spectrum/test/CardView.test.tsx`

## Upstream S2 authority seeds

- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/exports/CardView.mjs`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/private/CardView.css`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/private/CardView.mjs`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/types/exports/CardView.d.ts`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/types/src/CardView.d.ts`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/exports/CardView.ts`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/src/CardView.tsx`

## React Aria Components / React Aria / React Stately hints

- RAC hints: none found by automated name map; inspect compound dependencies manually.
- React Aria hints: none found by automated name map; inspect hooks used by local source.
- React Stately hints: none found by automated name map; inspect state hooks used by local source.

## Comparison evidence seeds

- Route page: present.
- Validation notes: none found.
- E2E specs: `apps/comparison/e2e/card-cardview-contract.spec.ts`.

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

- Automated source mapping found 3 local seed path(s) and 7 upstream S2 seed path(s).
- Automated test map found 1 component-related comparison spec(s), but the exact upstream branch coverage still needs source-backed verification.
- Known blocker: partial: Card/CardView note lists release-hardening gaps.

## Recommended future fixes / proof work

1. Open upstream S2 source first, then local Solid source, and build a branch table for every user-observable condition.
2. Classify each API/export delta as exact parity, Solid adaptation, documented local addition, unsupported, or bug.
3. Add or update tests only in a later implementation pass; this research document intentionally does not change code.
4. Close every unchecked axis above before marking this component certified from this audit.
