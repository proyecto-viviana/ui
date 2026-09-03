---
id: 365
type: task
title: "Clear TimeField when the controlled value is emptied after mount"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 timefield functional pass: URL ?value= remounts placeholders on both; live value 14:00:00 matches 2:00 PM; live value empty then leaves React on 9:30 AM hidden 09:30:00 and Solid on ––/––/AM hidden empty. Fixtures pass value ?? undefined so null becomes uncontrolled",
    }
---

The TimeField comparison value control is a controlled `Time | null`.
Emptying it after mount must show the localized placeholders on both
stacks, matching URL `?value=`.

Live `comparison:controls-change` `{value:""}` goes through
`timeFieldValueFromDemo` → `null`, then both fixtures pass
`value ?? undefined`. S2 then keeps a filled 9:30 AM field (hidden
`09:30:00`). Solid clears to `–– –– AM` (hidden `""`).
`data-comparison-value` is empty on both.

URL remount of `?value=` already matches placeholders. Live
`value="14:00:00"` already matches `2:00 PM`.

## Evidence

`http://127.0.0.1:4341/components/timefield/`, islands mounted.

Live `{value:"14:00:00"}` then `{value:""}`:

|             | React                                          | Solid                                     |
| ----------- | ---------------------------------------------- | ----------------------------------------- |
| after 14:00 | `2:00 PM`, cmp `14:00:00`                      | same                                      |
| after empty | hour `9` / minute `30` / AM, hidden `09:30:00` | hour `––` / minute `––` / AM, hidden `""` |
| cmp         | `""`                                           | `""`                                      |

URL `?value=`: both `–– –– AM`, hidden `""`, AX equal.

Fixtures: `apps/comparison/src/components/{react,solid}/fixtures/styled/timefield.*`
`value: value ?? undefined`.

## Done when

Emptying the live value control shows placeholders and an empty
hidden input on both stacks, matching S2 `value={null}` and the URL
empty remount. A comparison-route walk fails if React stays on 9:30
while Solid is empty.

## Relationship

Child of #24. Found by #260. Distinct from URL empty (already
matches) and from live hourCycle valuetext (#364). The fixture
`?? undefined` is the trigger; S2 and Solid then disagree on
controlled-to-undefined. Do not start #254.
