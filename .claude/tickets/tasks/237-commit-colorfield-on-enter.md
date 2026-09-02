---
id: 237
type: task
title: "Commit ColorField on Enter"
created: 2026-09-02
parent: 34
status: in-progress
history:
  - { state: open, at: 2026-09-02, note: "opened from the 2026-09 upstream train source diff" }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "ported useKeyboard Enter → commit then commitValidation, shouldPreventDefault false; ColorField tests red-then-green",
    }
---

## Cause

RAC 1.21.0 commits ColorField on Enter via `useKeyboard` shortcuts, flushing
`commit()` then `commitValidation()`
(`packages/react-aria/src/color/useColorField.ts:131-145` on `f56660b`).
Tests: `packages/react-aria-components/test/ColorField.test.js:133, 149`.
Local ColorField commits on `onChange`/`onBlur` only
(`packages/solidaria/src/color/createColorField.ts:184-189`) and has no
Enter shortcut. Release note: "Commit the value when pressing Enter".

## Work

Port the Enter shortcut (commit + commitValidation, do not preventDefault).
Add the commit and unparseable-restore tests.

## Done when

Typing a valid color and pressing Enter commits without blur; an unparseable
value restores the previous committed color. Tests fail if Enter is ignored.

## Relationship

Child of #220.

## Landed

- `react-aria/src/color/useColorField.ts:131-145` → `packages/solidaria/src/color/createColorField.ts:96-108` → `should commit the typed value on Enter` / `should restore the previous value on Enter if the typed value cannot be parsed` (`packages/solidaria-components/test/Color.test.tsx`)
- Solid `ColorFieldState` has no `commitValidation`; call is optional. No `flushSync` (signals are sync). Hex casing is lowercase (`#0000ff`), unlike RAC `#0000FF`. RAC component lives in `Color.tsx`, not `ColorField.tsx`.
- Red-then-green: without the Enter shortcut, `onChange` fired 0 times and the input stayed `"ab"`; restored, green.
