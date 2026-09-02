---
id: 233
type: task
title: "Support Select and ComboBox inside a Dialog"
created: 2026-09-02
parent: 34
status: open
history:
  - { state: open, at: 2026-09-02, note: "opened from the 2026-09 upstream train source diff" }
---

## Cause

RAC 1.21.0 supports Select and ComboBox inside a Dialog. ComboBox blur now
uses `nodeContains(buttonRef.current, relatedTarget)` so an icon child of
the button does not commit/close
(`packages/react-aria/src/combobox/useComboBox.ts:270` on `f56660b`). Tests:
`packages/react-aria-components/test/ComboBox.test.js:1067` and
`Select.test.js:919` ("should not throw when rendered inside a Dialog with a
Text errorMessage slot"). S2 Avatar wraps Image in an empty
`ImageContext.Provider` so ComboBox/Picker avatars still show inside a Dialog
(`packages/@react-spectrum/s2/src/Avatar.tsx`). Local ComboBox still uses
`button === relatedTarget`
(`packages/solidaria/src/combobox/createComboBox.ts:581`). Release note:
"Support Select and Combobox inside a Dialog".

## Work

Port the `nodeContains` blur guard in ComboBox (and the matching Select
path). Prove a Dialog with a Text errorMessage slot can host Select and
ComboBox without throwing. Port the S2 Avatar ImageContext wrap if the
styled ComboBox/Picker still hide avatars in a Dialog.

## Done when

The two RAC Dialog-host tests pass on Solid; ComboBox blur into a button
descendant does not close the popover.

## Relationship

Child of #220. Adjacent to #208 and #115.
