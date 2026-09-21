---
id: 602
type: task
title: "ActionButton bypasses the Form proxy it just adopted, so a disabled Form does not disable it"
created: 2026-09-21
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "opened from the 2026-09-21 round-2 audit, receipt `.agents/audit-2026-09-21/round-2-results.md`, finding `r2-certified-a/r2a-1`, high, confirmed by its skeptic. `7e93d238` wrapped ActionButton's merge in `useFormProps` and its changeset claims Form's props now reach it, but `isDisabled` is still read by an accessor that walks `runtimeProps` -> group -> context -> provider (`packages/solid-spectrum/src/button/ActionButton.tsx:187-191`) and is passed explicitly at `:480`, AFTER `{...headlessProps}` at `:478`, so the later source owns the key and the proxy is bypassed. Inside `<Form isDisabled>` upstream's ActionButton is disabled and ours is not. Form publishes the flag at `packages/solid-spectrum/src/form/index.tsx:222-224`; upstream ends the chain on the proxy, `@react-spectrum/s2@1.7.0/src/ActionButton.tsx:334` then `:357 isDisabled={props.isDisabled ?? isDisabled}`, which is what our own `Button.tsx:120-121` and `LinkButton.tsx:125` already do. The commit's new `it.each` covers size only (`packages/solid-spectrum/test/Form.test.tsx:208-232`), so nothing caught it. The commit is unticketed, which is why this is a new ticket rather than a note",
    }
---

## Scope

1. End ActionButton's `isDisabled` chain on the proxy — `?? headlessProps.isDisabled`
   as `Button.tsx:120-121` does — keeping `runtimeProps` ahead of the group so
   an explicit prop still wins. Same read for any other flag the widened
   `useFormProps` now publishes and ActionButton still resolves by hand.
2. Add a `<Form isDisabled>` case to the `it.each` in
   `packages/solid-spectrum/test/Form.test.tsx`, and check it fails on
   `7e93d238`'s source before the fix.
3. Check the three siblings the same way — `LinkButton`, `ToggleButton` and any
   other consumer of `useFormProps` — for a hand-resolved prop passed after the
   spread. The audit found only ActionButton, by reading; this is the sweep that
   makes that a measurement.

## Done when

`vp run test:run packages/solid-spectrum/test/Form.test.tsx` is green with a
case that disables an ActionButton through `<Form isDisabled>`, and that case
fails on the pre-fix source.

## Proof

The test run's counts and the mutation — pre-fix source restored, the new case
red — in the commit message and in a dated `.agents/` receipt.

## Relationship

Child of #544, stage S2-g on [#544's path](../initiatives/544-cut-the-solid-2-release-candidate-and-its-public-face.md).
Residue of `7e93d238`, which adopted the proxy across the four button files and
was never ticketed. `packages/solid-spectrum` is published, so this is a
published behaviour change and owes a changeset.
