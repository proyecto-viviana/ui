# NumberField parity audit seed

## Scope

- Slug: `numberfield`.
- Current read: accepted in validation index; still requires source-backed re-audit before treating as line-by-line certified in this research pass.
- Strict risk: Medium.

## Local implementation seeds

- `packages/solid-spectrum/src/numberfield/index.tsx`
- `packages/solid-spectrum/test/NumberField.test.tsx`
- `packages/solid-stately/src/numberfield/createNumberFieldState.d.ts`
- `packages/solid-stately/src/numberfield/createNumberFieldState.ts`
- `packages/solid-stately/src/numberfield/index.d.ts`
- `packages/solid-stately/src/numberfield/index.ts`
- `packages/solidaria/src/numberfield/createNumberField.ts`
- `packages/solidaria/src/numberfield/index.ts`
- `packages/solidaria-components/src/NumberField.tsx`
- `packages/solidaria-components/test/NumberField.test.tsx`

## Upstream S2 authority seeds

- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/exports/NumberField.mjs`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/private/NumberField.css`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/private/NumberField.mjs`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/types/exports/NumberField.d.ts`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/types/src/NumberField.d.ts`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/exports/NumberField.ts`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/src/NumberField.tsx`

## React Aria Components / React Aria / React Stately hints

- RAC hints: `NumberField`
- React Aria hints: `useField`, `useNumberField`
- React Stately hints: `useNumberFieldState`

## Comparison evidence seeds

- Route page: present.
- Validation notes: `apps/comparison/playbook/components/numberfield-validation-notes.md`.
- E2E specs: `apps/comparison/e2e/numberfield-visual.spec.ts`.

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

- Automated source mapping found 10 local seed path(s) and 7 upstream S2 seed path(s).
- Automated test map found 1 component-related comparison spec(s), but the exact upstream branch coverage still needs source-backed verification.
- No component-specific blocker was proven by this seed beyond validation-index status.

## Recommended future fixes / proof work

1. Open upstream S2 source first, then local Solid source, and build a branch table for every user-observable condition.
2. Classify each API/export delta as exact parity, Solid adaptation, documented local addition, unsupported, or bug.
3. Add or update tests only in a later implementation pass; this research document intentionally does not change code.
4. Close every unchecked axis above before marking this component certified from this audit.
