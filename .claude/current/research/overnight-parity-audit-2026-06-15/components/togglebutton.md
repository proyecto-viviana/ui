---
kind: research
status: current
---

Status: Current source of truth.
Update when: this research pack is revised, superseded, or relocated.

# ToggleButton parity audit seed

## Scope

- Slug: `togglebutton`.
- Current read: accepted in validation index; still requires source-backed re-audit before treating as line-by-line certified in this research pass.
- Strict risk: High.

## Local implementation seeds

- `packages/solid-spectrum/src/button/ToggleButton.tsx`
- `packages/solid-spectrum/src/togglebuttongroup/index.tsx`
- `packages/solid-spectrum/test/ToggleButton.test.tsx`
- `packages/solid-spectrum/test/ToggleButtonGroup.test.tsx`
- `packages/solidaria-components/src/ToggleButton.tsx`
- `packages/solidaria-components/src/ToggleButtonGroup.tsx`
- `packages/solidaria-components/test/ToggleButton.test.tsx`
- `packages/solidaria-components/test/ToggleButtonGroup.test.tsx`

## Upstream S2 authority seeds

- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/exports/ToggleButton.mjs`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/exports/ToggleButtonGroup.mjs`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/private/ToggleButton.css`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/private/ToggleButton.mjs`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/private/ToggleButtonGroup.mjs`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/types/exports/ToggleButton.d.ts`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/types/exports/ToggleButtonGroup.d.ts`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/types/src/ToggleButton.d.ts`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/types/src/ToggleButtonGroup.d.ts`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/exports/ToggleButton.ts`

## React Aria Components / React Aria / React Stately hints

- RAC hints: `Button`, `ToggleButton`, `ToggleButtonGroup`
- React Aria hints: `useButton`, `useToggleButton`, `useToggleButtonGroup`
- React Stately hints: none found by automated name map; inspect state hooks used by local source.

## Comparison evidence seeds

- Route page: present.
- Validation notes: `apps/comparison/playbook/components/button-family-validation-notes.md`, `apps/comparison/playbook/components/button-validation-notes.md`, `apps/comparison/playbook/components/togglebutton-validation-notes.md`, `apps/comparison/playbook/components/togglebuttongroup-validation-notes.md`.
- E2E specs: none found by automated map.

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

- Automated source mapping found 8 local seed path(s) and 10 upstream S2 seed path(s).
- No component-specific e2e spec was found by automated slug matching; this is a high-risk evidence gap until manually disproved.
- No component-specific blocker was proven by this seed beyond validation-index status.

## Recommended future fixes / proof work

1. Open upstream S2 source first, then local Solid source, and build a branch table for every user-observable condition.
2. Classify each API/export delta as exact parity, Solid adaptation, documented local addition, unsupported, or bug.
3. Add or update tests only in a later implementation pass; this research document intentionally does not change code.
4. Close every unchecked axis above before marking this component certified from this audit.
