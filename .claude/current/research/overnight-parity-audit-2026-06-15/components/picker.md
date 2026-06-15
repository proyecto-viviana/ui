# Picker parity audit seed

## Scope

- Slug: `picker`.
- Current read: partial: validation note names component-owned blockers around hierarchical sections, link semantics, rich slots, group labeling, multi-select transitions, and geometry.
- Strict risk: Blocker.

## Local implementation seeds

- `packages/solid-spectrum/src/Picker.ts`
- `packages/solid-spectrum/src/picker/index.tsx`
- `packages/solid-spectrum/test/Picker.hydrate.test.tsx`
- `packages/solid-spectrum/test/Picker.ssr.test.tsx`
- `packages/solid-spectrum/test/Picker.test.tsx`
- `packages/viviana-ui/src/Picker.ts`

## Upstream S2 authority seeds

- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/exports/Picker.mjs`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/private/Picker.css`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/private/Picker.mjs`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/types/exports/Picker.d.ts`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/dist/types/src/Picker.d.ts`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/exports/Picker.ts`
- `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/src/Picker.tsx`

## React Aria Components / React Aria / React Stately hints

- RAC hints: `ColorPicker`, `ColorSwatchPicker`, `DatePicker`, `DateRangePicker`
- React Aria hints: `useDatePicker`, `useDateRangePicker`
- React Stately hints: `useColorPickerState`, `useDatePickerState`, `useDateRangePickerState`

## Comparison evidence seeds

- Route page: present.
- Validation notes: `apps/comparison/playbook/components/picker-validation-notes.md`.
- E2E specs: `apps/comparison/e2e/colorswatchpicker-visual.spec.ts`, `apps/comparison/e2e/datepicker-visual.spec.ts`, `apps/comparison/e2e/daterangepicker-visual.spec.ts`, `apps/comparison/e2e/picker-visual.spec.ts`.

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

- Automated source mapping found 6 local seed path(s) and 7 upstream S2 seed path(s).
- Automated test map found 4 component-related comparison spec(s), but the exact upstream branch coverage still needs source-backed verification.
- Known blocker: partial: validation note names component-owned blockers around hierarchical sections, link semantics, rich slots, group labeling, multi-select transitions, and geometry.

## Recommended future fixes / proof work

1. Open upstream S2 source first, then local Solid source, and build a branch table for every user-observable condition.
2. Classify each API/export delta as exact parity, Solid adaptation, documented local addition, unsupported, or bug.
3. Add or update tests only in a later implementation pass; this research document intentionally does not change code.
4. Close every unchecked axis above before marking this component certified from this audit.
