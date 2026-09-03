---
id: 386
type: task
title: "Natively disable ActionGroup items when disabledKeys change after mount"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 actiongroup functional pass: URL ?disabledKeys=italic remount matches native disabled + AX [disabled] + ArrowRight Bold→Underline skip on both; live {disabledKeys:'italic'} updates React Italic.disabled and skip, and leaves Solid native disabled=false (data-disabled=true on the button) so AX omits [disabled] and ArrowRight lands on Italic. createActionGroupItem passes isDisabled: state.isDisabled(props.key) as a one-shot boolean into createButton; ActionGroupItemWrapper data-disabled already re-reads state",
    }
---

`useActionGroupItem` does not set `disabled`; the comparison React
fixture (and v3 ActionGroupItem) sets native `disabled` from
`state.disabledKeys` every render. URL remount of `disabledKeys`
already matches. A live `comparison:controls-change` updates Solid
`data-disabled` from collection state and leaves the native
`disabled` / focusability of the item button on the first-paint
value.

`packages/solidaria/src/actiongroup/createActionGroup.ts`
`createActionGroupItem` calls `createButton({ isDisabled:
state.isDisabled(props.key) })`. `createButton` accepts an
`Accessor<boolean>`, but this pass is a boolean snapshot.
`ActionGroupItemWrapper` already computes `isDisabled()` for
`data-disabled` and the S2 item span.

## Evidence

`http://127.0.0.1:4341/components/actiongroup/`, islands mounted.
Other `.s2-framework-panel` `visibility:hidden` + `inert`.

URL `?selectionMode=multiple&disabledKeys=italic` remount: both Italic
`disabled=true`, AX `checkbox "Italic" [disabled]`, Tab→Bold,
ArrowRight skips to Underline, force-click does not check. All-keys
`?disabledKeys=bold,italic,underline`: both group `aria-disabled=true`,
items native disabled, Tab Before→After.

From a fresh default route, live `{disabledKeys:"italic"}`:

| | React | Solid |
|---|---|---|
| Italic `disabled` | true | false |
| Italic `data-disabled` | omitted | `true` |
| AX Italic | `button "Italic" [disabled]` | `button "Italic"` |
| Tab, ArrowRight | Underline | Italic |

Live `{disabledKeys:"bold,italic,underline"}`: group
`aria-disabled=true` on both (the `aria-disabled` getter is live).
React items native `disabled=true` and Tab skips. Solid items stay
`disabled=false` with `data-disabled=true`; keyboard still lands on
Italic.

## Done when

Live `disabledKeys` after mount sets native `disabled` on those item
buttons like the React fixture, so AX `[disabled]`, Tab skip, and
arrow skip match without a remount. URL remount stays matched. A
comparison walk fails if Solid ArrowRight from Bold lands on a
live-disabled Italic.

## Relationship

Child of #24. Found by #260. Same one-shot `isDisabled` boolean as
#377 (Radio label), but this one leaves the native control enabled.
Group `aria-disabled` when every key is disabled is already a getter.
Do not start #254.
