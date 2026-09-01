---
id: 177
type: task
title: "Decide note obligations for FileTrigger ColorEditor Landmark Alert and ColorPicker"
created: 2026-09-01
parent: 136
status: in-progress
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
  - {
      state: in-progress,
      at: 2026-09-01,
      note: "owner 2026-09-01: recorded classification; FileTrigger, Landmark, and Alert are exceptions; ColorEditor and ColorPicker still need notes",
    }
---

## Cause

These names are on public barrels and have no validation note. They are
outside #85's nine. TabSwitch stays on #9. TokenField / PreviewTrigger stay
on #118 / #117.

## Decision

Owner 2026-09-01:

| Export      | Classification            | Note obligation                                                                                                                                   |
| ----------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| ColorEditor | S2 `parity`               | Needs a validation note. May share a color-family note with ColorArea / ColorField / ColorWheel.                                                  |
| ColorPicker | RAC `composition`         | Needs a composition note, or the same color-family note.                                                                                          |
| FileTrigger | support export            | Exception. Evidence lives on DropZone and #109. No separate 10-gate catalogue page.                                                               |
| Landmark    | documented local addition | Exception. RAC has no counterpart. A short note that says "local addition, no S2 oracle" is enough if written; it is not a catalogue march.       |
| Alert       | documented local addition | Exception. Distinct RAC-layer primitive with no RAC counterpart. Do not mint a second Alert product or fold it into S2 InlineAlert / AlertDialog. |

Do not send FileTrigger, Landmark, or Alert through the Button-style
certification march.

## Work remaining

Write the ColorEditor parity note and the ColorPicker composition note
(one color-family file is allowed). FileTrigger, Landmark, and Alert already
have recorded exceptions.

## Done when

Each name has a note or a recorded support-export exception.

## Relationship

F-A11Y-002. Owner decision (Rule #3). Architecture records the support-export
bucket.
