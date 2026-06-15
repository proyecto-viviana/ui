# Switch parity audit seed

## Scope

- Slug: `switch`.
- Current read: accepted in validation index; still requires source-backed re-audit before treating as line-by-line certified in this research pass.
- Strict risk: Medium.

## Local implementation seeds

- `packages/solid-spectrum/src/Switch.ts`
- `packages/solid-spectrum/src/icon/s2wf-icons/SwitchIcon.tsx`
- `packages/solid-spectrum/src/icon/s2wf-icons/SwitchVerticalIcon.tsx`
- `packages/solid-spectrum/src/switch/ToggleSwitch.tsx`
- `packages/solid-spectrum/src/switch/index.tsx`
- `packages/solid-spectrum/test/Switch.test.tsx`
- `packages/solidaria/src/switch/createSwitch.ts`
- `packages/solidaria/src/switch/index.ts`
- `packages/solidaria-components/src/Switch.tsx`
- `packages/solidaria-components/test/Switch.test.tsx`

## Upstream S2 authority seeds

- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/exports/Switch.mjs`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/private/Switch.css`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/private/Switch.mjs`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/types/exports/Switch.d.ts`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/types/src/Switch.d.ts`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/exports/Switch.ts`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/icons/Switch.d.ts`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/icons/Switch.mjs`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/icons/SwitchVertical.d.ts`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/icons/SwitchVertical.mjs`

## React Aria Components / React Aria / React Stately hints

- RAC hints: `Switch`
- React Aria hints: `useSwitch`
- React Stately hints: none found by automated name map; inspect state hooks used by local source.

## Comparison evidence seeds

- Route page: present.
- Validation notes: `apps/comparison/playbook/components/switch-validation-notes.md`.
- E2E specs: `apps/comparison/e2e/switch-visual.spec.ts`.

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
- Automated test map found 1 component-related comparison spec(s), but the exact upstream branch coverage still needs source-backed verification.
- No component-specific blocker was proven by this seed beyond validation-index status.

## Recommended future fixes / proof work

1. Open upstream S2 source first, then local Solid source, and build a branch table for every user-observable condition.
2. Classify each API/export delta as exact parity, Solid adaptation, documented local addition, unsupported, or bug.
3. Add or update tests only in a later implementation pass; this research document intentionally does not change code.
4. Close every unchecked axis above before marking this component certified from this audit.
