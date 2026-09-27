---
id: 73
type: task
title: "Localize NumberField role and stepper labels"
created: 2026-08-20
parent: 33
status: verified
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "migrated from legacy task intl-roledescription-hardcodes",
    }
  - {
      state: verified,
      at: 2026-09-25,
      note: "ported 34-locale intl catalog from @react-aria/numberfield; integrated createStringFormatter; verified RTL and non-English contracts across solidaria, solidaria-components, and solid-spectrum",
    }
---

Replace the hardcoded NumberField strings `Number field`, `Increase`, and
`Decrease` with `createStringFormatter` lookups that mirror React Aria.

The en-US output already matches. The divergence appears only under another
locale.

## Done when

NumberField uses the upstream locale dictionaries and non-English/RTL contract
coverage asserts the role description and stepper labels.

## Verification

- Added `packages/solidaria/src/numberfield/intl.ts` ported from `@react-aria/numberfield` containing all 34 upstream locales.
- Updated `createNumberField.ts` to use `createStringFormatter` for `aria-roledescription` and `increase`/`decrease` stepper labels, with support for `incrementAriaLabel` and `decrementAriaLabel`.
- Forwarded `incrementAriaLabel` and `decrementAriaLabel` in `packages/solidaria-components/src/NumberField.tsx`.
- Re-exported intl strings and dictionary in `solidaria/src/numberfield` and `solidaria/src/index.ts`.
- Verified catalog compilation and formatting in `packages/solidaria/test/intl-catalogs.test.tsx` (44/44 tests passed).
- Added multi-locale/RTL contract tests in `packages/solidaria/test/createNumberField.test.tsx` (57/57 tests passed), `packages/solidaria-components/test/NumberField.test.tsx` (52/52 tests passed), and `packages/solid-spectrum/test/NumberField.test.tsx` (6/6 tests passed).
- Quality gates passed: `vp run guard:layer-boundary` (0 new forks), `vp run check` (0 errors), `vp run test:ssr` (103/103 tests passed), `vp run test:hydrate` (108/108 tests passed).

## Relationship

Replaces `intl-roledescription-hardcodes` from
the retired tech-debt note.
