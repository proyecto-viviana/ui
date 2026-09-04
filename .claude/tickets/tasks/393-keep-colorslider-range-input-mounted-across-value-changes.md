---
id: 393
type: task
title: "Keep ColorSlider's range input mounted across value changes"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 colorslider functional pass: first ArrowRight 50→51 then the hidden range input is a new node (same id, __fpMarker gone), focus BODY, thumb 32→16, second ArrowRight no-op. Track click 80% sets 288 both but Solid leaves data-dragging and the 50×66 loupe at opacity 1 through 500ms and never fires onChangeEnd. Full drag 20% values match (72) and pointerup does end drag. Not #74 (native input already backs the AX value). Not #391 (ColorArea never focuses; this input is focused then replaced).",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "colorwheel functional pass, same remount: ArrowRight 0→1 disconnects the hue input (sameNode false), focus BODY, thumb 32→16, later keys no-op. Playwright ring click 270° leaves data-dragging true, loupe 50×66 stuck, onChangeEnd at 0. mouse.down/wait/up and a full thumb drag commit. ColorWheel already focusInput on pointer; the node is replaced. End mapping is #396, not this.",
    }
---

S2 ColorSlider keeps the same hidden `input[type=range]` across
channel updates, so Arrow keys repeat and a track click can
pointerup on the original listeners. Solid replaces the input (and
the thumb that hosts it) on the first value change.

After ArrowRight the new node is still `id=solidaria-cl-181` but it
is not `document.activeElement`, `data-focus-visible` is gone, and
further keys hit `BODY`. `onChangeEnd` is not called on that key
(`data-comparison-final-value` stays at the start color). A
Playwright track click at 80% updates the value to 288 and focuses
the input, then leaves `data-dragging=true` and the drag loupe at
50×66 opacity 1 through 500 ms — S2 has already ended the drag
(loupe exiting at 80 ms, gone by 500 ms) and fired `onChangeEnd`.

Likely cause: S2 `ColorSlider` re-invokes
`<ColorSliderTrack>{() => <ColorSliderThumb />}</ColorSliderTrack>`
from a render prop when `color` / `isDragging` change. React
reconciles the same component type; Solid destroys and recreates
the thumb, the input, and in-flight pointer listeners.

## Evidence

`http://127.0.0.1:4341/components/colorslider/`, islands mounted.
Other `.s2-framework-panel` `visibility:hidden` + `inert`. Focus
the hue range input at 50.

ArrowRight ×2:

|            | React                                           | Solid                                                    |
| ---------- | ----------------------------------------------- | -------------------------------------------------------- |
| 1st key    | 51°, focus input, thumb 32×32, `onChangeEnd` 51 | 51°, focus **BODY**, thumb 16×16, `onChangeEnd` still 50 |
| 2nd key    | 52°, focus input                                | 51°, still BODY                                          |
| input node | same (`__fpMarker` kept)                        | **replaced** (marker gone, same id)                      |

Track click at 80% of the 192px track:

|                | React                                                                  | Solid                                                               |
| -------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------- |
| value / output | 288 / `288°`                                                           | same                                                                |
| 80 ms          | `data-dragging` omitted, loupe opacity 0.14 exiting, `onChangeEnd` 288 | `data-dragging=true`, loupe opacity 0.86 entering, `onChangeEnd` 50 |
| 500 ms         | loupe gone                                                             | loupe still 50×66 opacity 1, `data-dragging=true`                   |

Held drag to 20% (down / move / up) reaches 72 on both and Solid
does fire `onChangeEnd` on pointerup. Loupe enter 50×66 opacity
0.67→1 matches; Solid unmounts it immediately on pointerup (no
125 ms exit) because the loupe remounts with `isOpen=false`.

Same remount on ColorWheel (`http://127.0.0.1:4341/components/colorwheel/`):
first ArrowRight 0→1 disconnects the hue input, focus BODY, later
keys no-op. Ring click 270° leaves `data-dragging=true`, loupe
50×66, `onChangeEnd` at 0. Thumb drag to 270° values and loupe
match; Solid focus is BODY mid-drag and restores on up.

Tab Before→input→After and Shift+Tab return match; settled
focus-visible thumb is 32×32 both. Named form `{hue:50}`→`{hue:51}`
after the first ArrowRight matches (the first key still writes the
input). Disabled URL skips Tab and ignores click both.

## Done when

A focused comparison-route ColorSlider keeps the same range input
node across ArrowRight. The second ArrowRight reaches 52° with
focus still on the input and the thumb remaining 32×32. A track
click at 80% dismisses the loupe by 500 ms, clears `data-dragging`,
and fires `onChangeEnd`. ColorWheel second ArrowRight reaches 2
with focus held, and a ring click commits `onChangeEnd` and
dismisses the loupe. A walk fails if Solid's second ArrowRight
is a no-op or the click loupe is still open.

## Relationship

Child of #24. Found by #260. Wiring is the S2 ColorSlider render
prop that recreates `ColorSliderThumb` /
`packages/solidaria-components/src/Color.tsx` `<input {...mergedInputProps()} />`.
Distinct from #74 (native input already backs the value in the AX
tree). Distinct from #391 (ColorArea never focuses the hidden
inputs). Distinct from #394 (ColorSlider hue 360 wraps even if the
node stays). Distinct from #396 (ColorWheel End 359 vs 0). ColorWheel
and ColorSlider share the Color.tsx thumb remount. Do not start #254.
