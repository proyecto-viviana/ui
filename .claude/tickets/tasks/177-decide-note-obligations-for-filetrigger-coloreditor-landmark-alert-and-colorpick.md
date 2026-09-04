---
id: 177
type: task
title: "Decide note obligations for FileTrigger ColorEditor Landmark Alert and ColorPicker"
created: 2026-09-01
parent: 136
status: verified
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
  - {
      state: in-progress,
      at: 2026-09-01,
      note: "owner 2026-09-01: recorded classification; FileTrigger, Landmark, and Alert are exceptions; ColorEditor and ColorPicker still need notes",
    }
  - {
      state: merged,
      at: 2026-09-04,
      note: "color-family-validation-notes.md names ColorEditor and ColorPicker as composition; ten gates not-started; FileTrigger, Landmark, and Alert stay ticket exceptions. Did not bump 69/69.",
    }
  - {
      state: verified,
      at: 2026-09-04,
      note: "independent review APPROVE at 4f527857; color-family note only; ten gates not-started; 69/69 not bumped.",
    }
---

## Cause

These names are on public barrels and have no validation note. They are
outside #85's nine. TabSwitch stays on #9. TokenField / PreviewTrigger stay
on #118 / #117.

## Decision

Owner 2026-09-01:

| Export      | Classification                                       | Note obligation                                                                                                                                   |
| ----------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| ColorEditor | `composition` (corrected 2026-09-01; no S2 upstream) | Needs a composition note naming the S2 primitives it composes (ColorArea, ColorSlider, ColorField, ColorSwatch). May share the color-family note. |
| ColorPicker | RAC `composition`                                    | Needs a composition note, or the same color-family note.                                                                                          |
| FileTrigger | support export                                       | Exception. Evidence lives on DropZone and #109. No separate 10-gate catalogue page.                                                               |
| Landmark    | documented local addition                            | Exception. RAC has no counterpart. A short note that says "local addition, no S2 oracle" is enough if written; it is not a catalogue march.       |
| Alert       | documented local addition                            | Exception. Distinct RAC-layer primitive with no RAC counterpart. Do not mint a second Alert product or fold it into S2 InlineAlert / AlertDialog. |

Do not send FileTrigger, Landmark, or Alert through the Button-style
certification march.

## Work remaining

Color-family note written. FileTrigger, Landmark, and Alert stay recorded
exceptions. Ten gates on that note stay `not-started`.

## Done when

Each name has a note or a recorded support-export exception.

## Evidence

cwd: `/home/emoporemilio/projects/viviana-hub/ui`

- Source: passed.
  `apps/comparison/playbook/components/color-family-validation-notes.md`
  names ColorEditor (local composition of ColorPicker + ColorArea +
  ColorSlider hue/alpha + native format `<select>` + ColorField; ColorSwatch
  context-only, not default DOM) and ColorPicker (RAC composition via
  `ColorPickerContext`). README Files links the note. Catalogue 69/69 lines
  unchanged. FileTrigger, Landmark, and Alert have no notes files.
- Local: not required. Notes-only. `git diff --check` on named paths.
- Product tests: not run.

## Relationship

F-A11Y-002. Owner decision (Rule #3). Architecture records the support-export
bucket.

## Round-2 note (2026-09-01)

Round 2 challenge: the owner table calls ColorEditor S2 `parity`; `packages/solid-spectrum/src/color/ColorEditor.tsx:13-21` says there is no S2 upstream for ColorEditor and vendored S2 `src/` has none (it is a v3 composition). Owner: correct the label to composition before the note is written. The exceptions for FileTrigger/Landmark/Alert stand.

## Decision (owner, 2026-09-01)

ColorEditor is relabeled a composition: an explicit, documented local addition (Rule #2), not S2 parity. Its note names the S2 primitives it composes — ColorArea, ColorSlider, ColorField, ColorSwatch — and inherits their certification rather than claiming parity with an upstream that does not exist. The FileTrigger / Landmark / Alert exceptions stand.
