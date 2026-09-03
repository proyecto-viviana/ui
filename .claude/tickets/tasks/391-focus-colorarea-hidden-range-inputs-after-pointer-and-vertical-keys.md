---
id: 391
type: task
title: "Focus ColorArea's hidden range inputs after pointer and vertical keys"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 colorarea functional pass: pointer click/drag does not focus the x input so ArrowRight is a no-op; ArrowUp/PageUp set y tabIndex 0 but leave DOM focus on x (now tabIndex -1), so Tab hits y instead of exiting. Thumb off-center press jumps 155→153 because there is no onThumbDown. Off-thumb drag values and loupe 50×66 match. Not #74 (native inputs already back the AX value).",
    }
---

Solid ColorArea never calls `focus()` on the hidden `input[type=range]`
elements. S2 `useColorArea` does, on pointer down/up and on every
vertical-axis key.

Upstream `useColorArea` (`react-aria/dist/private/color/useColorArea.js`):

- `focusInput(ref)` via `focusWithoutScrolling` (defaults to `inputXRef`).
- `onColorAreaDown` / `onThumbDown` / `onColorAreaUp` / `onMoveEnd` call it.
- `keyboardUpdate` for PageUp/PageDown/Home/End/arrows focuses `inputYRef`
  when the Y axis moved, then `setFocusedInput('y')`.
- `onThumbDown` does **not** `setColorFromPoint`; `onMove` deltas from
  `getThumbPosition()`.

Solid `packages/solidaria/src/color/createColorArea.ts` has
`setFocusedInput` and tabIndex/aria-hidden swaps, but no input refs and
no `focus()`. Pointer handling is always absolute `setColorFromPoint` on
the area.

## Evidence

`http://127.0.0.1:4341/components/colorarea/`, islands mounted, other
`.s2-framework-panel` `visibility:hidden` + `inert`. Default `#9B80FF`
(x=155, y=128).

Pointer click 10%/10% then ArrowRight:

|             | React                                    | Solid                                                |
| ----------- | ---------------------------------------- | ---------------------------------------------------- |
| after click | x focused, 26 / 229, `data-focused=true` | island DIV focused, 26 / 229, `data-focused` omitted |
| ArrowRight  | 27 / 229                                 | 26 / 229 (no-op)                                     |

ArrowUp from a focused x input, then Tab:

|                              | React                           | Solid                     |
| ---------------------------- | ------------------------------- | ------------------------- |
| `document.activeElement`     | y input (tabIndex 0)            | x input (tabIndex **-1**) |
| y `tabIndex` / `aria-hidden` | 0 / omitted                     | 0 / omitted               |
| AX                           | two sliders `"155"` and `"129"` | same two sliders          |
| Tab                          | After                           | **y input** (extra stop)  |

Thumb-center press keeps 155 both. Press at 60%/50% (inside the 16px
thumb, off-center): React stays 155 and then deltas; Solid jumps to
153 on pointerdown.

Off-thumb drag 10%/10% → 80%/80%: both 26/229 then 204/51, loupe 50×66
opacity 0.67 → 1, gone on pointerup. Values match; only focus differs.

## Done when

Pointer down/up on the area or thumb focuses the x (or last-axis) hidden
range input so Arrow keys work immediately. Vertical keys move DOM focus
to the y input. Tab after ArrowUp exits the control. Thumb press does
not jump the value. A comparison-route click-then-ArrowRight walk fails
if Solid's red channel stays put.

## Relationship

Child of #24. Found by #260. Wiring is
`packages/solidaria/src/color/createColorArea.ts` (no `focusInput`, no
thumb vs area pointer split). Distinct from #74 (ColorArea already uses
native range inputs; rest AX includes `"155"`). Distinct from #392 (hue
valuetext). Do not start #254.
