# Button parity audit seed

## Scope

- Slug: `button`.
- Current read: current-gate normalized, not full-gate accepted in validation index.
- Strict risk: High.

## Local implementation seeds

- `packages/solid-spectrum/src/Button.ts`
- `packages/solid-spectrum/src/button/ActionButton.tsx`
- `packages/solid-spectrum/src/button/Button.tsx`
- `packages/solid-spectrum/src/button/ClearButton.tsx`
- `packages/solid-spectrum/src/button/FieldButton.tsx`
- `packages/solid-spectrum/src/button/LinkButton.tsx`
- `packages/solid-spectrum/src/button/LogicButton.tsx`
- `packages/solid-spectrum/src/button/S2PendingProgressCircle.tsx`
- `packages/solid-spectrum/src/button/ToggleButton.tsx`
- `packages/solid-spectrum/src/button/context.ts`

## Upstream S2 authority seeds

- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/exports/Button.mjs`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/exports/ButtonGroup.mjs`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/private/Button.css`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/private/Button.mjs`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/private/ButtonGroup.css`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/private/ButtonGroup.mjs`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/types/exports/Button.d.ts`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/types/exports/ButtonGroup.d.ts`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/types/src/Button.d.ts`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/types/src/ButtonGroup.d.ts`

## React Aria Components / React Aria / React Stately hints

- RAC hints: `Button`, `ToggleButton`, `ToggleButtonGroup`
- React Aria hints: `useButton`, `useToggleButton`, `useToggleButtonGroup`
- React Stately hints: none found by automated name map; inspect state hooks used by local source.

## Comparison evidence seeds

- Route page: present.
- Validation notes: `apps/comparison/playbook/components/button-family-validation-notes.md`, `apps/comparison/playbook/components/button-validation-notes.md`, `apps/comparison/playbook/components/togglebutton-validation-notes.md`, `apps/comparison/playbook/components/togglebuttongroup-validation-notes.md`.
- E2E specs: `apps/comparison/e2e/actionbutton-visual.spec.ts`, `apps/comparison/e2e/button-family-contract.spec.ts`, `apps/comparison/e2e/button-visual.spec.ts`, `apps/comparison/e2e/collection-button-controls-visual.spec.ts`, `apps/comparison/e2e/grouped-button-controls-visual.spec.ts`, `apps/comparison/e2e/single-button-controls-visual.spec.ts`.

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
- Automated test map found 6 component-related comparison spec(s), but the exact upstream branch coverage still needs source-backed verification.
- No component-specific blocker was proven by this seed beyond validation-index status.

## Recommended future fixes / proof work

1. Open upstream S2 source first, then local Solid source, and build a branch table for every user-observable condition.
2. Classify each API/export delta as exact parity, Solid adaptation, documented local addition, unsupported, or bug.
3. Add or update tests only in a later implementation pass; this research document intentionally does not change code.
4. Close every unchecked axis above before marking this component certified from this audit.
