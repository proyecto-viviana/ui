---
kind: research
status: current
---

Status: Current source of truth.
Update when: this research pack is revised, superseded, or relocated.

# ActionButtonGroup parity audit seed

## Scope

- Slug: `actionbuttongroup`.
- Current read: current-gate normalized, not full-gate accepted in validation index.
- Strict risk: High.

## Local implementation seeds

- `packages/solid-spectrum/src/actionbuttongroup/index.tsx`

## Upstream S2 authority seeds

- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/exports/ActionButtonGroup.mjs`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/private/ActionButtonGroup.css`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/private/ActionButtonGroup.mjs`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/types/exports/ActionButtonGroup.d.ts`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/types/src/ActionButtonGroup.d.ts`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/exports/ActionButtonGroup.ts`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/src/ActionButtonGroup.tsx`

## React Aria Components / React Aria / React Stately hints

- RAC hints: `Button`, `Group`
- React Aria hints: `useButton`
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

- Automated source mapping found 1 local seed path(s) and 7 upstream S2 seed path(s).
- No component-specific e2e spec was found by automated slug matching; this is a high-risk evidence gap until manually disproved.
- No component-specific blocker was proven by this seed beyond validation-index status.

## Recommended future fixes / proof work

1. Open upstream S2 source first, then local Solid source, and build a branch table for every user-observable condition.
2. Classify each API/export delta as exact parity, Solid adaptation, documented local addition, unsupported, or bug.
3. Add or update tests only in a later implementation pass; this research document intentionally does not change code.
4. Close every unchecked axis above before marking this component certified from this audit.
