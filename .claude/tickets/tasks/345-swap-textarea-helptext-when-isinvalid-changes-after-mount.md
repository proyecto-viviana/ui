---
id: 345
type: task
title: "Swap TextArea HelpText when isInvalid changes after mount"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 textarea functional pass: URL ?isInvalid=true paints error on both; live isInvalid after mount updates icon/border/aria-invalid on both and leaves Solid HelpText on the mount-time description or error slot. HelpText branches on isInvalid once; HeadlessTextField children are untracked",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 numberfield: same HelpText one-shot. URL ?isInvalid=true&isRequired=true error slot matches; live isInvalid from default leaves Solid description 'Enter a quantity.' (React error); live off from URL invalid leaves Solid error (React description). Icon/aria-invalid update. NumberField children are tracked; HelpText if() is enough",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 textfield: same HelpText one-shot. URL ?isInvalid=true swaps to error on both; live isInvalid after mount updates icon/border/aria-invalid and leaves Solid on slot=description (React errorMessage Name is required.). Shared HelpText + untracked TextField children. No new id.",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 searchfield: same HelpText one-shot. URL ?isInvalid=true error slot Enter a search term. matches; live isInvalid from default leaves Solid description Search by name, status, or owner. (React error). Icon/aria-invalid/red border update. No new id.",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 colorfield: same HelpText one-shot. URL ?isInvalid=true error slot Enter a valid color. matches; live isInvalid from default leaves Solid description Enter a hex color (React error). Live off from URL invalid leaves Solid error (React description). Icon/aria-invalid/red border update. ColorField children are untracked; HelpText if() is enough. No new id.",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 radiogroup: HelpText slot does swap on live isInvalid (error text and red circle border match; reactive Show). Do not treat RadioGroup as this ticket. Live describedby drop after the swap is #258. Native custom validity is #376.",
    }
---

TextArea `isInvalid` updates on URL remount. A live
`comparison:controls-change` after mount updates the invalid icon,
group border, and `aria-invalid` on both stacks and leaves Solid
HelpText on the first-paint slot.

`packages/solid-spectrum/src/form/HelpText.tsx` branches on
`local.isInvalid` with one-shot `if` returns (Solid components run
once). `packages/solidaria-components/src/TextField.tsx` resolves
render-prop children with `untrack`, so HelpText is not recreated.
The invalid icon uses `<Show when={renderProps.isInvalid}>` and does
update. URL remount of the same props already matches.

## Evidence

`http://127.0.0.1:4341/components/textarea/`, islands mounted.

URL `?isInvalid=true`: both stacks `aria-invalid=true`, red group
border `rgb(215, 50, 32)`, AlertTriangle icon 18×18,
`<span slot="errorMessage">Notes are required.</span>`, describedby
that error. AX `textbox "Notes" [invalid]` plus error text.

Live from the default route,
`comparison:controls-change` `{isInvalid:true}`:

|                              | React               | Solid                               |
| ---------------------------- | ------------------- | ----------------------------------- |
| icon / border / aria-invalid | on / red / true     | on / red / true                     |
| HelpText slot                | errorMessage        | description                         |
| describedby                  | Notes are required. | Use a short multiline project note. |

Live from `?isInvalid=true` with `{isInvalid:false}`:

|                              | React                | Solid                |
| ---------------------------- | -------------------- | -------------------- |
| icon / border / aria-invalid | off / gray / omitted | off / gray / omitted |
| HelpText slot                | description          | errorMessage         |

## Done when

A live `isInvalid` switch swaps Solid HelpText to the error slot
(and back to description), matching S2, including `aria-describedby`.
A comparison-route walk fails if that live switch leaves Solid on
the mount-time slot.

## Relationship

Child of #24. Found by #260. Wiring is shared `HelpText`
(`packages/solid-spectrum/src/form/HelpText.tsx`) composed by
TextArea, NumberField, SearchField, TextField, and ColorField
(`packages/solid-spectrum/src/{textfield/TextArea.tsx,textfield/index.tsx,numberfield/index.tsx,searchfield/index.tsx,color/index.tsx}`).
Distinct from #70 (shared FieldLabel/HelpText extraction; URL
invalid already matches). Do not start #254.
