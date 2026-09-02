---
id: 233
type: task
title: "Support Select and ComboBox inside a Dialog"
created: 2026-09-02
parent: 34
status: in-progress
history:
  - { state: open, at: 2026-09-02, note: "opened from the 2026-09 upstream train source diff" }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "porting ComboBox nodeContains blur guard and Select TextContext wrap",
    }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "nodeContains blur + Select errorMessage TextContext; Dialog tests red-then-green; S2 Avatar out of lane",
    }
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

## Landed

`react-spectrum/packages/react-aria/src/combobox/useComboBox.ts:270`
→ `packages/solidaria/src/combobox/createComboBox.ts:581-582` (`nodeContains(button ?? null, relatedTarget)`)

`react-spectrum/packages/react-aria/src/select/useSelect.ts:272`
→ `packages/solidaria/src/select/createSelect.ts:460` (menu `onBlur` already used `nodeContains` upstream; local used `Node.contains` — no Select blur-into-button path exists upstream)

`react-spectrum/packages/react-aria-components/src/Select.tsx:267-274`
→ `packages/solidaria-components/src/Select.tsx:737-752` (`TextContext` slots `description` / `errorMessage`; Dialog `Text slot="errorMessage"` no longer throws)

ComboBox composition already wrapped children with errorMessage `TextContext`; no extra Select-style blur-into-button change.

Tests:

- `packages/solidaria-components/test/ComboBox.test.tsx` `should not throw when rendered inside a Dialog with a Text errorMessage slot`
- `packages/solidaria-components/test/Select.test.tsx` `should not throw when rendered inside a Dialog with a Text errorMessage slot`
- `packages/solidaria-components/test/ComboBox.test.tsx` `does not close or commit when blurring the input into a descendant of the trigger button`
- `packages/solidaria/test/createComboBox.test.tsx` `does not commit when relatedTarget is a descendant of the trigger button`

Red-then-green: Dialog `Text slot="errorMessage"` threw `Invalid slot "errorMessage"` on Select; ComboBox blur into `<span>` inside the trigger committed/closed on `===`. Restored `nodeContains` + Select `TextContext`, green.

## Out of lane — S2 Avatar `ImageContext` wrap

Upstream: `react-spectrum/packages/@react-spectrum/s2/src/Avatar.tsx:122-137`

```tsx
<ImageContext.Provider value={{}}>
  <Image ... />
</ImageContext.Provider>
```

Proposal for the styled-layer owner: port that empty `ImageContext.Provider` around `Image` in `packages/solid-spectrum/src/avatar/index.tsx` (local Avatar already wraps at `:203-223` — verify ComboBox/Picker avatars still show inside a Dialog; if they hide, remaining work is Dialog's `ImageContext` override, not this ARIA lane). Do not change `packages/solid-spectrum/**` here.
