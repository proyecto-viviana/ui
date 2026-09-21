---
id: 602
type: task
title: "ActionButton bypasses the Form proxy it just adopted, so a disabled Form does not disable it"
created: 2026-09-21
parent: 544
status: merged
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "opened from the 2026-09-21 round-2 audit, receipt `.agents/audit-2026-09-21/round-2-results.md`, finding `r2-certified-a/r2a-1`, high, confirmed by its skeptic. `7e93d238` wrapped ActionButton's merge in `useFormProps` and its changeset claims Form's props now reach it, but `isDisabled` is still read by an accessor that walks `runtimeProps` -> group -> context -> provider (`packages/solid-spectrum/src/button/ActionButton.tsx:187-191`) and is passed explicitly at `:480`, AFTER `{...headlessProps}` at `:478`, so the later source owns the key and the proxy is bypassed. Inside `<Form isDisabled>` upstream's ActionButton is disabled and ours is not. Form publishes the flag at `packages/solid-spectrum/src/form/index.tsx:222-224`; upstream ends the chain on the proxy, `@react-spectrum/s2@1.7.0/src/ActionButton.tsx:334` then `:357 isDisabled={props.isDisabled ?? isDisabled}`, which is what our own `Button.tsx:120-121` and `LinkButton.tsx:125` already do. The commit's new `it.each` covers size only (`packages/solid-spectrum/test/Form.test.tsx:208-232`), so nothing caught it. The commit is unticketed, which is why this is a new ticket rather than a note",
    }
  - {
      state: merged,
      at: 2026-09-21,
      note: "fixed, proved red first, and the sweep run rather than read. Receipt `.agents/602-actionbutton-form-disabled-2026-09-21.md`. Upstream was read from the installed pin before anything was written: `@react-spectrum/s2@1.7.0/src/ActionButton.tsx:334` is `props = useFormProps(props)`, `:339` picks up `ActionButtonGroupContext`, `:345-347` let the group win `staticColor`, `isQuiet` and `size` as destructuring defaults, and `:358` is `isDisabled={props.isDisabled ?? isDisabled}` - two opposite orders in one component, and only the second one is this ticket's. So ActionButton's accessor is now `headlessProps.isDisabled ?? groupContext?.isDisabled` and `isDisabled` came off `groupProps` entirely. Partial disagreement with Scope 1, recorded because the tree beats the brief: Scope 1 says to keep `runtimeProps` ahead of the group, which reads as keeping the raw prop at the head of the chain, and that ordering re-breaks the Skeleton - `useFormProps` forces `isDisabled: true` over any local value (`packages/solid-spectrum/src/form/index.tsx`), so a chain starting at `runtimeProps` lets `isDisabled={false}` beat a loading Skeleton, which upstream does not. The proxy is the head; reading it first still lets an explicit prop win over the Form, because the proxy fills only keys the props leave `undefined`. Reordering alone was not enough either: solidaria's `mergeProps` resolves at read time and a later getter returning `undefined` does not shadow an earlier defined value, so while the group sat inside the merge its `undefined` could not be distinguished from an absent key - the getter had to leave the merge. Counts, `vp test run packages/solid-spectrum/test/Form.test.tsx --maxWorkers=2` each time: 17 passed exit 0 before the new cases; 2 failed | 20 passed (22) exit 1 on the pre-fix source, both of them ActionButton's; 22 passed exit 0 after. The two new cases are an `it.each` over Button, ActionButton, ToggleButton and LinkButton (inherits `<Form isDisabled>`, still opts out with `isDisabled={false}`, and a Skeleton beats that opt-out) and one for the group (`ActionButtonGroup isDisabled` loses to the button's own prop, and a group inside a disabled Form still disables). Each assertion was proved to bind its own branch by mutating the fixed file in the tree and restoring it from a scratchpad copy: group-first (ToggleButton's order) fails exactly the group opt-out assertion, exit 1; `runtimeProps` ahead of the proxy fails exactly the Skeleton assertion, exit 1. Scope 3, measured not read: Button, ToggleButton and LinkButton pass every case of the new `it.each` on the pre-fix source, so no twin needed a fix. Button (`:121,247`) and LinkButton (`:87,205`) spread the proxy and pass no `isDisabled` after it, mirroring `Button.tsx:426` and `:548`; ToggleButton (`:154-155`) resolves group-then-props, which is what its own upstream does at `ToggleButton.tsx:90` - the same shape as the bug fixed here, and correct there. The rest of the `useFormProps` consumers were grepped for a flag passed after the spread: `radio/index.tsx:535,537` and `checkbox/index.tsx:900,902` pass `headlessProps.*`, the proxy, so they are right by construction; `color/index.tsx` forwards `props.isDisabled` into the fields `ColorPicker` composes but is not a `useFormProps` consumer and has no S2 1.7.0 file to mirror. Other exit codes, all 0: `vp run typecheck`; `vp check` over the two changed files; `vp test run` on ActionButton.test.tsx (3), ButtonFamilyContext.test.tsx (14), Wave4Components.test.tsx (31), ActionBar.test.tsx (26). `packages/solid-spectrum` is published, so the change carries `.changeset/actionbutton-form-disabled.md`, patch. `merged` and not `verified`: this seat does not push, so no CI run id backs any of these counts",
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
