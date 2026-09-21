# #602 — ActionButton's isDisabled, the Form proxy, and the sweep over its three twins

Every command below was run on 2026-09-21 in `/home/emoporemilio/projects/viviana-hub/ui`
at `135c062a` plus this ticket's edits. Exit codes are as printed. Nothing was
pushed, so no CI run backs any of it.

## 1. What upstream does, read from the installed pin

`@react-spectrum/s2@1.7.0/src/ActionButton.tsx`:

    :333  [props, ref] = useSpectrumContextProps(props, ref, ActionButtonContext);
    :334  props = useFormProps(props as any);
    :339  let ctx = useSlottedContext(ActionButtonGroupContext);
    :345  staticColor = props.staticColor, isQuiet = props.isQuiet,
    :347  size = props.size || 'M', isDisabled} = ctx || {};
    :358  <RACButton {...props} isDisabled={props.isDisabled ?? isDisabled}

Two orders in one component, and they are opposite. For `size`, `staticColor`
and `isQuiet` the group context wins (the destructuring default falls back to
`props` only when the group leaves the key unset). For `isDisabled` the group
loses: `props.isDisabled ?? isDisabled` (`:358`) puts the button's own prop — and, since
`:334`, whatever `useFormProps` filled in — ahead of it. `Form.tsx:43-69` is that
proxy: it fills only keys the props leave `undefined`, and forces
`isDisabled = true` under a Skeleton over any local value.

Button and LinkButton have no second read at all: `Button.tsx:415` and `:540`
are the `useFormProps` call, `:426` and `:548` the spread that carries it.

## 2. The defect

`7e93d238` wrapped our merge in `useFormProps`, but the accessor that feeds the
element never looked at it:

    ActionButton.tsx:187-191  runtimeProps.isDisabled ?? groupContext?.isDisabled
                              ?? contextProps?.isDisabled ?? flags.isDisabled
    ActionButton.tsx:478-480  {...headlessProps} … isDisabled={isDisabled()}

Neither the Form nor the Skeleton is in that chain, and the explicit prop sits
after the spread, so it owns the key on the element and the proxy value the
spread carried is discarded.

## 3. Red first, on the pre-fix source

    vp test run packages/solid-spectrum/test/Form.test.tsx --maxWorkers=2

| run | result |
| --- | --- |
| before the new cases | exit 0 — 17 passed (17) |
| new cases, pre-fix source | exit 1 — **2 failed** \| 20 passed (22) |
| after the fix | exit 0 — 22 passed (22) |

The two failures are both ActionButton's, and the other three buttons pass the
same sweep unchanged — which is the measurement scope item 3 asks for:

- `disables ActionButton through the Form and the Skeleton` —
  `expected false to be true` at the `<Form isDisabled>` assertion.
- `keeps ActionButtonGroup's isDisabled below the button's own prop` —
  `element is not disabled` for the grouped button inside `<Form isDisabled>`.

`Button`, `ToggleButton` and `LinkButton` pass every case of the new `it.each`
on the pre-fix source, so the defect is ActionButton's alone. Why each twin is
already right, read rather than assumed:

| twin | how it resolves `isDisabled` | upstream |
| --- | --- | --- |
| `Button.tsx:121,247` | spread only; `:121` reads `headlessProps.isDisabled` for styling | `Button.tsx:415,426`, spread only |
| `LinkButton.tsx:87,205` | `:87` is the `useFormProps` merge, `:205` the only spread; `:125` reads the proxy for the gradient | `Button.tsx:540,548`, spread only |
| `ToggleButton.tsx:154-155` | `groupContext?.isDisabled ?? standaloneProps.isDisabled`, and `standaloneProps` is the proxy | `ToggleButton.tsx:90` `isDisabled = props.isDisabled` as the ctx destructuring default — group first, then props: the same order |

ToggleButton's group-first order looks like the bug fixed here and is not: its
upstream puts the group ahead of the props for this key, ActionButton's puts it
behind. Both are mirrored as written.

## 4. The fix

`groupProps` no longer carries `isDisabled` (the group must not sit inside the
merge for this one key), and the accessor ends on the proxy:

    const isDisabled = () => headlessProps.isDisabled ?? groupContext?.isDisabled;

`headlessProps` is `useFormProps(mergeProps(flags, contextProps, runtimeProps, groupProps))`
minus the split keys — own prop, then slotted context, then provider, then the
Form, with a Skeleton over all of them — so this is `props.isDisabled ?? ctx.isDisabled`
in Solid spelling.

The ticket's Scope 1 asks for the proxy to be added while `runtimeProps` stays
at the head of the chain. That ordering is not upstream's and does not hold:
`useFormProps` forces `isDisabled: true` under a Skeleton over any local value,
so a chain that reads the raw prop first lets `isDisabled={false}` beat a
loading Skeleton. Reading the proxy first still lets an explicit prop win over a
Form, because the proxy fills only keys the props leave `undefined`. Reordering
inside the merge was not an option either: solidaria's `mergeProps` resolves at
read time and a later getter returning `undefined` does not shadow an earlier
value, so the group getter had to leave the merge rather than move within it.
The disagreement is recorded on the ticket.

## 5. Each new assertion binds its own branch

The fixed file was copied to the scratchpad, mutated in the tree one branch at a
time, and restored from that copy. Same command as above each time:

| mutation | result |
| --- | --- |
| `groupContext?.isDisabled ?? headlessProps.isDisabled` (group first, ToggleButton's order) | exit 1 — 1 failed, and it is `.not.toBeDisabled()` on the button that opts out of a disabled group |
| `runtimeProps.isDisabled ?? headlessProps.isDisabled ?? groupContext?.isDisabled` (own prop ahead of the Skeleton) | exit 1 — 1 failed, and it is the Skeleton assertion |
| pre-fix source (§3) | exit 1 — the `<Form isDisabled>` assertion and the grouped-in-a-form assertion |

So all four new assertions fail on a source that gets that one order wrong, and
the restored file is 22 passed, exit 0.

## 6. The rest of the sweep

Other `useFormProps` consumers were grepped for a flag passed to the element
after the spread: `radio/index.tsx:535,537` and `checkbox/index.tsx:900,902`
pass `headlessProps.isDisabled` / `headlessProps.isRequired` — the proxy, so
they are correct by construction. Nothing else hand-resolves a Form flag.
`color/index.tsx:1669-1692` passes `props.isDisabled` down to the fields
`ColorPicker` composes, but `ColorPicker` is not a `useFormProps` consumer and
S2 1.7.0 ships no `ColorPicker.tsx` to mirror, so it is out of this sweep.

## 7. Other exit codes

    vp run typecheck                                                   exit 0
    vp check packages/solid-spectrum/src/button/ActionButton.tsx \
             packages/solid-spectrum/test/Form.test.tsx                exit 0 — 2 formatted, 2 lint-clean
    vp test run packages/solid-spectrum/test/ActionButton.test.tsx     exit 0 — 3 passed
    vp test run packages/solid-spectrum/test/ButtonFamilyContext.test.tsx  exit 0 — 14 passed
    vp test run packages/solid-spectrum/test/Wave4Components.test.tsx  exit 0 — 31 passed
    vp test run packages/solid-spectrum/test/ActionBar.test.tsx        exit 0 — 26 passed

## What this receipt does not prove

No push and no CI run, so the certified comparison suite has not seen this; the
counts above are local. `packages/solid-spectrum` is published, so the change
carries `.changeset/actionbutton-form-disabled.md`.
