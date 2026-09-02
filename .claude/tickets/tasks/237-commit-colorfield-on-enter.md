---
id: 237
type: task
title: "Commit ColorField on Enter"
created: 2026-09-02
parent: 34
status: open
history:
  - { state: open, at: 2026-09-02, note: "opened from the 2026-09 upstream train source diff" }
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
