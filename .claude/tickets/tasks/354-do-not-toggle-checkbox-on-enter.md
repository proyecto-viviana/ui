---
id: 354
type: task
title: "Do not toggle Checkbox on Enter"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 checkbox functional pass: isolated Tab onto the input then Enter checks Solid and leaves React unchecked; Space then matches native toggle on both. RAC useToggle label onPress returns on keyboard/virtual; Solid createToggle always state.toggle()",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 switch: same Enter hole on /components/switch/. Isolated Tab then Enter, and locator.press(Enter) on the focused input: React stays unchecked, Solid checks and slides the handle 4→13. Space still matches. Did not file a second id.",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 checkboxgroup: same Enter hole on group items. Isolated Tab onto Email then Enter unchecks Solid and leaves React checked; Space then matches native toggle on both. createCheckboxGroupItem uses createToggle. No new id.",
    }
---

Native and S2 checkboxes toggle on Space, not Enter. Enter on a
focused checkbox is a no-op unless a form is submitting.

Solid `createToggle` attaches `createPress` to the wrapping
`<label>` and always `state.toggle()` in `onPress`. Enter on the
focused `<input>` is ignored by input-level press (checkbox keys are
Space-only) and bubbles to the label, which is not an input, so
`isValidKeyboardEvent` treats Enter as activation and toggles.

RAC `useToggle` label `onPress` returns when
`pointerType === 'keyboard' || pointerType === 'virtual'` and lets
the native input handle Space.

## Evidence

`http://127.0.0.1:4341/components/checkbox/`, islands mounted. Other
`.s2-framework-panel` `visibility:hidden` + `inert`. From injected
Before, Tab lands on the input, 2px focus ring, both unchecked.

|                  | React                    | Solid                    |
| ---------------- | ------------------------ | ------------------------ |
| Enter            | unchecked, still focused | checked, checkmark 10×10 |
| Space after that | checked                  | unchecked                |
| Enter again      | stays checked            | checked                  |

Pointer click on the label and keyboard Space still match. No form
on the default route, so React Enter does not submit either.

Switch, same hook, same walk on `/components/switch/`:

|                  | React                      | Solid                           |
| ---------------- | -------------------------- | ------------------------------- |
| Enter            | unchecked, handle offset 4 | checked, handle 10×10 offset 13 |
| Space after that | checked, offset 13         | unchecked, offset 4             |
| Enter again      | stays checked              | checked, offset 13              |

`locator.press("Enter")` on the focused input matches that split.
The Switch visual spec that expects both stacks to check on Enter is
stale against current S2.

`packages/solidaria/src/toggle/createToggle.ts` label `onPress`.
Installed RAC `useToggle` skips keyboard/virtual on that handler.

## Done when

Enter on a focused comparison-route Checkbox or Switch does not
toggle, matching S2. Space still toggles once. A walk fails if Solid
checks on Enter while React stays unchecked.

## Relationship

Child of #24. Found by #260. Wiring is `createToggle` (Checkbox and
Switch). Distinct from native `required` / custom validity and from
#371 (live disabled paint on Switch). Do not start #254.
