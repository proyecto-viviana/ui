# Checkbox parity audit seed

## Scope

- Slug: `checkbox`.
- Current read: accepted in validation index; still requires source-backed re-audit before treating as line-by-line certified in this research pass.
- Strict risk: Medium.

## Local implementation seeds

- `packages/solid-spectrum/src/checkbox/index.tsx`
- `packages/solid-spectrum/src/icon/s2wf-icons/CheckBoxIcon.tsx`
- `packages/solid-spectrum/test/Checkbox.test.tsx`
- `packages/solid-stately/src/checkbox/createCheckboxGroupState.d.ts`
- `packages/solid-stately/src/checkbox/createCheckboxGroupState.ts`
- `packages/solid-stately/src/checkbox/index.d.ts`
- `packages/solid-stately/src/checkbox/index.ts`
- `packages/solidaria/src/checkbox/createCheckbox.ts`
- `packages/solidaria/src/checkbox/createCheckboxGroup.ts`
- `packages/solidaria/src/checkbox/createCheckboxGroupItem.ts`

## Upstream S2 authority seeds

- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/exports/Checkbox.mjs`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/exports/CheckboxGroup.mjs`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/private/Checkbox.css`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/private/Checkbox.mjs`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/private/CheckboxGroup.css`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/private/CheckboxGroup.mjs`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/types/exports/Checkbox.d.ts`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/types/exports/CheckboxGroup.d.ts`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/types/src/Checkbox.d.ts`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/types/src/CheckboxGroup.d.ts`

## React Aria Components / React Aria / React Stately hints

- RAC hints: `Checkbox`, `CheckboxGroup`
- React Aria hints: `useCheckbox`, `useCheckboxGroup`
- React Stately hints: `useCheckboxGroupState`

## Comparison evidence seeds

- Route page: present.
- Validation notes: `apps/comparison/playbook/components/checkbox-validation-notes.md`.
- E2E specs: `apps/comparison/e2e/checkbox-visual.spec.ts`, `apps/comparison/e2e/checkboxgroup-visual.spec.ts`.

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

- Automated source mapping found 10 local seed path(s) and 10 upstream S2 seed path(s).
- Automated test map found 2 component-related comparison spec(s), but the exact upstream branch coverage still needs source-backed verification.
- No component-specific blocker was proven by this seed beyond validation-index status.

## Recommended future fixes / proof work

1. Open upstream S2 source first, then local Solid source, and build a branch table for every user-observable condition.
2. Classify each API/export delta as exact parity, Solid adaptation, documented local addition, unsupported, or bug.
3. Add or update tests only in a later implementation pass; this research document intentionally does not change code.
4. Close every unchecked axis above before marking this component certified from this audit.
