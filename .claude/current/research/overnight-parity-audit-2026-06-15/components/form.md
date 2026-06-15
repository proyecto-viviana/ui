# Form parity audit seed

## Scope

- Slug: `form`.
- Current read: current-gate normalized, not full-gate accepted in validation index.
- Strict risk: High.

## Local implementation seeds

- `packages/solid-spectrum/src/form/Field.tsx`
- `packages/solid-spectrum/src/form/HelpText.tsx`
- `packages/solid-spectrum/src/form/index.tsx`
- `packages/solid-spectrum/test/Form.test.tsx`
- `packages/solid-spectrum/test/FormFieldError.test.tsx`
- `packages/solid-stately/src/form/createFormValidationState.d.ts`
- `packages/solid-stately/src/form/createFormValidationState.ts`
- `packages/solid-stately/src/form/index.d.ts`
- `packages/solid-stately/src/form/index.ts`
- `packages/solidaria/src/form/createFormReset.ts`

## Upstream S2 authority seeds

- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/exports/Form.mjs`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/private/Form.css`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/private/Form.mjs`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/types/exports/Form.d.ts`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/types/src/Form.d.ts`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/exports/Form.ts`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/src/Form.tsx`

## React Aria Components / React Aria / React Stately hints

- RAC hints: `Form`
- React Aria hints: `useDateFormatter`, `useListFormatter`, `useLocalizedStringFormatter`, `useNumberFormatter`
- React Stately hints: none found by automated name map; inspect state hooks used by local source.

## Comparison evidence seeds

- Route page: present.
- Validation notes: `apps/comparison/playbook/components/form-validation-notes.md`.
- E2E specs: `apps/comparison/e2e/form-visual.spec.ts`.

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
