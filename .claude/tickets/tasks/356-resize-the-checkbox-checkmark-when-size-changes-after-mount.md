---
id: 356
type: task
title: "Resize the Checkbox checkmark when size changes after mount"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 checkbox functional pass: URL ?size=XL&isSelected=true and live size+selected together paint a 12×12 checkmark on both; live size XL after the M checkmark already mounted leaves Solid at 10×10 inside a 20×20 box (React 12×12). Show keeps the first CheckmarkIcon; checkboxIconSizeStyle(size()) is one-shot",
    }
---

S2 Checkbox sizes the Checkmark / Dash glyph from the current `size`
prop. Live `comparison:controls-change` to XL after the control is
already selected must grow that glyph with the box.

Solid Spectrum `Checkbox` mounts `<CheckmarkIcon>` (and Dash) inside
`<Show when={isSelected && !isIndeterminate}>` with
`style={checkboxIconSizeStyle(checkmarkIconPixelSize[size()])}`.
`Show` keeps that first instance while selected stays true, so a later
size change updates the box class (20×20) and leaves the glyph at the
mount-time px (M = 10).

URL remount of the same XL selected props already matches. Live
`{size:"XL", isSelected:true}` from the default unchecked route also
matches, because the icon first mounts at XL.

## Evidence

`http://127.0.0.1:4341/components/checkbox/`, islands mounted.

`?size=XL&isSelected=true&selectionSource=isSelected`: both box
20×20, checkmark 12×12, field 127.8×22.

From the default route, live `{isSelected:true}` then live
`{isSelected:true, size:"XL"}`:

| | React | Solid |
|---|---|---|
| box | 20×20 | 20×20 |
| checkmark | 12×12 | 10×10 |
| field | 127.8×22 | 127.8×22 |

Live `{size:"XL", isSelected:true}` in one event from default: both
12×12. `packages/solid-spectrum/src/checkbox/index.tsx`
`checkboxIconSizeStyle` / `Show` around CheckmarkIcon and DashIcon.

## Done when

A live size change on an already-selected comparison Checkbox resizes
the checkmark (and dash) to the XL/S/L px, matching S2. A walk fails
if Solid keeps the mount-time 10×10 glyph inside a 20×20 box.

## Relationship

Child of #24. Found by #260. Distinct from #70 (invalid HelpText row)
and from URL size remount, which already matches. Do not start #254.
