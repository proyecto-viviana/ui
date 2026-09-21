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
they are correct by construction. ~~Nothing else hand-resolves a Form flag.~~
`color/index.tsx:1669-1692` passes `props.isDisabled` down to the fields
`ColorPicker` composes, but `ColorPicker` is not a `useFormProps` consumer and
S2 1.7.0 ships no `ColorPicker.tsx` to mirror, so it is out of this sweep.

**Corrected 2026-09-21 by §8.** That struck sentence was false, and so was the
`Button`/`ToggleButton`/`LinkButton` row of §3's table as a verdict on the
whole component: the instrument was the new `it.each`, which never pairs a
button with a `MenuTrigger`. ToggleButton hand-resolves the flag inside
`menuTriggerButtonProps()` and spreads it after `headlessProps`, which is the
same defect, and the grep missed it because the flag is a getter inside a
merged object rather than a JSX attribute. The sweep was redone over the JSX
spreads themselves; §8 has it.

## 7. Other exit codes

    vp run typecheck                                                   exit 0
    vp check packages/solid-spectrum/src/button/ActionButton.tsx \
             packages/solid-spectrum/test/Form.test.tsx                exit 0 — 2 formatted, 2 lint-clean
    vp test run packages/solid-spectrum/test/ActionButton.test.tsx     exit 0 — 3 passed
    vp test run packages/solid-spectrum/test/ButtonFamilyContext.test.tsx  exit 0 — 14 passed
    vp test run packages/solid-spectrum/test/Wave4Components.test.tsx  exit 0 — 31 passed
    vp test run packages/solid-spectrum/test/ActionBar.test.tsx        exit 0 — 26 passed

## 8. What the review found, measured (second commit)

A review of `1a036710` raised two problems. Both were reproduced before
anything was written, with a scratch test file deleted afterwards.

### 8a. ToggleButton has the same defect — confirmed, partly

`ToggleButton.tsx:259-273` builds `menuTriggerButtonProps()` with a
`get isDisabled()` that reads `menuTriggerContext.isDisabled?.()`, and
`:393-395` spreads it after `{...headlessProps}`. `MenuTrigger` publishes the
flag as a concrete boolean (`solidaria-components/src/Menu.tsx:417`,
`isDisabled: () => Boolean(stateProps.isDisabled)`), so outside an explicitly
disabled trigger it is a present `false` that shadows the proxy. Measured on
`1a036710`, with `MenuTrigger`/`Menu` around the button:

| case | before | after |
| --- | --- | --- |
| `<Form isDisabled>` + `MenuTrigger` + `ToggleButton` | not disabled | disabled |
| `<Skeleton isLoading>` + `MenuTrigger` + `ToggleButton isDisabled={false}` | not disabled | disabled |
| `<MenuTrigger isDisabled>` + `ToggleButton` | disabled | disabled |
| `<MenuTrigger>` + `ToggleButton` | not disabled | not disabled |

**The review's `<ToggleButtonGroup isDisabled>` case is wrong and was left
alone.** A `MenuTrigger`'d `ToggleButton` inside a disabled
`ToggleButtonGroup` renders `disabled` and `data-disabled="true"` on
`1a036710` — the headless group disables its items through the group's own
state, not through this prop — so that row is green before and after.

The fix mirrors ActionButton's: the flag leaves `menuTriggerButtonProps()` and
is resolved once, after the spreads, as
`headlessProps.isDisabled ?? menuTriggerContext?.isDisabled?.()`.
`headlessProps` already carries ToggleButton's own group-first order
(`ToggleButton.tsx:154-155`, which is upstream's `ToggleButton.tsx:90`). The
MenuTrigger flag is demoted from "always wins" to "last resort", which is
strictly toward upstream: RAC's `MenuTrigger` (`react-aria-components@1.21.0`)
spreads only `menuTriggerProps` through a `PressResponder` and never sets
`isDisabled` on the trigger at all. The one behaviour this changes beyond the
table is `<MenuTrigger isDisabled><ToggleButton isDisabled={false}>`, which now
opts out — upstream's does too.

### 8b. NotificationBadge lost the group — confirmed, a regression of `1a036710`

`ActionButton.tsx:374-380` feeds `NotificationBadgeContext` with
`!!headlessProps.isDisabled`. That was right until `1a036710` took `isDisabled`
off `groupProps`; after it, the proxy no longer sees `ActionButtonGroup`, so
`<ActionButtonGroup isDisabled><ActionButton><NotificationBadge/>` rendered a
disabled button with an enabled badge (different `notificationBadge()` atom,
measured). Upstream reads the RACButton render prop here — the resolved
`props.isDisabled ?? ctx.isDisabled` — at
`@react-spectrum/s2@1.7.0/src/ActionButton.tsx:436` (`{({isDisabled}) => (`,
shadowing the ctx destructuring at `:347`) and `:432`. So the getter now reads
`!!isDisabled()`, the same accessor the element gets.

### 8c. Red first, then green

    vp test run packages/solid-spectrum/test/Form.test.tsx --maxWorkers=2

| run | result |
| --- | --- |
| the two new cases on `1a036710`'s source | exit 1 — **2 failed** \| 22 passed (24) |
| after both fixes | exit 0 — 24 passed (24) |

### 8d. Each new assertion binds its own branch

Mutated in the tree one at a time, restored from a scratchpad copy of the
fixed file. Same command each time; every run exit 1.

| mutation | the one assertion that fails |
| --- | --- |
| ToggleButton reverted to `1a036710` (flag inside `menuTriggerButtonProps()`, no explicit prop) | `trigger("in a form")` |
| `menuTriggerContext?.isDisabled?.() ?? headlessProps.isDisabled` (trigger first) | `trigger("in a form")` |
| `runtimeProps.isDisabled ?? headlessProps.isDisabled ?? menuTriggerContext?.…` | `trigger("in a skeleton")` (plus ToggleButton's row of the existing Skeleton `it.each`) |
| `headlessProps.isDisabled` alone (no trigger fallback) | `trigger("under a disabled trigger")` |
| badge reverted to `!!headlessProps.isDisabled` | `cls("grouped-badge")` |
| badge on `!!groupContext?.isDisabled` | `cls("own-badge")` vs `cls("enabled-badge")` |
| badge on `!!(groupContext?.isDisabled ?? runtimeProps.isDisabled)` | `cls("form-badge")` |

`trigger("under a plain trigger")` is a control, not a bound branch: no
mutation of this chain isolates it. It exists so a future "just default it to
the trigger" fix cannot pass.

### 8e. The sweep, redone over the spreads

Every `useFormProps` consumer in `packages/solid-spectrum/src` (17 files) was
listed and each JSX spread in it counted. Only `ActionButton.tsx:477-478` and
`ToggleButton.tsx:394-395` put two spreads on one element; every other
consumer spreads the proxy once per element and can shadow nothing. That is
the measurement §6 claimed and did not take.

### 8f. Exit codes for the second commit

    vp run typecheck                                                        exit 0
    vp check ToggleButton.tsx ActionButton.tsx Form.test.tsx                exit 0 — 3 formatted, 3 lint-clean
    vp test run packages/solid-spectrum/test/ToggleButton.test.tsx          exit 0 — 2 passed
    vp test run packages/solid-spectrum/test/ToggleButtonGroup.test.tsx     exit 0 — 5 passed
    vp test run packages/solid-spectrum/test/ActionMenu.test.tsx            exit 0 — 34 passed
    vp test run packages/solid-spectrum/test/Menu.test.tsx                  exit 0 — 32 passed
    vp test run packages/solid-spectrum/test/NotificationBadge.test.tsx     exit 0 — 6 passed
    vp test run packages/solid-spectrum/test/ButtonFamilyContext.test.tsx   exit 0 — 14 passed
    vp test run packages/solid-spectrum/test/ActionButton.test.tsx          exit 0 — 3 passed
    vp test run packages/solid-spectrum/test/ActionBar.test.tsx             exit 0 — 26 passed

## What this receipt does not prove

No push and no CI run, so the certified comparison suite has not seen this; the
counts above are local. `packages/solid-spectrum` is published, so the change
carries `.changeset/actionbutton-form-disabled.md`.

Residue found while reading §8b's line and filed as #605: the same
`NotificationBadgeContext` object feeds the badge `size()`, the group-resolved
size defaulted to `"M"`, while upstream feeds the raw `props.size`
(`@react-spectrum/s2@1.7.0/src/ActionButton.tsx:431`), which the group never
touches (`ActionButtonGroup.tsx:130` provides only
`ActionButtonGroupContext`). Read from source, **not measured**: a badge inside
an ActionButton also carries the context's positioning `styles`, so its atom
string differs from a bare badge's whatever the size, and the class comparison
that settled §8b cannot settle this. Pre-existing, unrelated to this ticket's
chain, and not touched here.
