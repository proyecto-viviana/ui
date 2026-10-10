---
id: 74
type: task
title: "Restore native Slider input semantics"
created: 2026-08-20
parent: 31
status: in-progress
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "migrated from legacy task slider-thumb-native-input-semantics",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: '#260 slider: rest AX omits Solid value (slider "Volume": "40" vs slider "Volume"); native input tabIndex 0 vs -1 + aria-hidden; Solid div[role=slider] tabIndex 0; group id leaked. Isolated Tab: React inner knob outline rgb(75,117,255) solid 2px (focus on input), Solid inner knob outline none + container native outline rgb(16,16,16) auto 1px (data-focused=true, data-focus-visible omitted). Tab order Before→slider→After both. Do not file a new id.',
    }
  - {
      state: open,
      at: 2026-09-03,
      note: '#260 rangeslider: two thumbs. Rest AX omits Solid values and concatenates the field label only on React (slider "Minimum Range":"30" / "Maximum Range":"60" vs slider "Minimum" / "Maximum"). React two native input[type=range] tabIndex 0 with labelledby; Solid two div[role=slider] tabIndex 0, no native range, aria-label only. Isolated Tab Before→start→end→After both. Inner-knob accent ring rgb(75,117,255) solid 2px matches; Solid container still native outline rgb(16,16,16) auto 1px. Group id leak false (Solid id=cl-258 is the output for). Do not file a new id.',
    }
  - {
      state: open,
      at: 2026-09-03,
      note: '#260 colorarea: not this inversion. Rest AX includes native range slider "Color, Color picker": "155"; two input[type=range] (x tabIndex 0, y aria-hidden tabIndex -1); no div[role=slider]. ColorArea pointer/vertical-key focus is #391. Hue valuetext digits are #392. Do not file a new id.',
    }
  - {
      state: in-progress,
      at: 2026-10-09,
      note: "Approved joint Slider/RangeSlider candidate applied; actual owning qualification remains red and native/browser qualification is pending.",
    }
---

Realign the shared Slider spine so the visually hidden native
`input[type=range]` is the focusable, value-bearing slider and the visible
thumb div has no slider role.

The port currently reverses this structure. Chromium therefore omits the value
from the port's accessibility tree, and focus and interaction targets differ.
The divergence affects Slider, RangeSlider, ColorSlider, and ColorArea. Remove
the input ID leaked onto the group during the same realignment.

## Done when

The shared implementation mirrors `useSliderThumb`; D5, D6, and D8 pass for
Slider and the dependent range/color components; and the Slider accessibility
known divergence is removed.

## Relationship

Replaces `slider-thumb-native-input-semantics` from
the retired tech-debt note. Do not patch individual widgets.

## Current release preparation — 2026-10-09

The latest recorded 3298 certification still skips scalar Slider and RangeSlider
D6. Source review confirms that the styled RangeSlider twins duplicate their own
pair state and interactions; a two-file scalar repair cannot resolve both rows.
Coordinate the native-input repair with #76's shared indexed implementation.
ColorSlider and ColorArea already have separate native-input contracts and need
affected qualification rather than an assumed identical inversion repair.

The complete private design, exact public API inventory and independent review
are `/tmp/ui-slider-range-consolidation-design-20261009.md`,
`/tmp/ui-slider-range-public-api-inventory-20261009.md` and
`/tmp/ui-slider-range-consolidation-independent-review-20261009.md`.
The owner approved the reviewed array/index extensions, required `SliderState`
members, `SliderThumb` index/name/form, and exact `createSliderThumb` public name
on 2026-10-09. Existing styled value shapes remain unchanged. Preserve scalar
numeric callback and multiplier semantics, controlled completion snapshots,
native form ownership and current supported reset/default behavior; do not infer
compatibility or runtime parity from source review. No source implementation or
runtime proof has been applied for this task.

## Approved joint implementation admission — 2026-10-09

The owner selected "Approve reviewed API" for
`/tmp/ui-slider-range-public-api-inventory-20261009.md`. This admits exactly its
scalar-default generic/array overloads, indexed state members and formatting
overload, headless thumb props and new hook at solidaria's existing root and
slider surfaces. The required structural-provider additions are intentional.
No additional public names, dependency or export subpath is admitted.

The conductor alone integrates. Medium Sol workers prepare private patches and
reviews; all runtime stays serialized. Joint source scope with #76:

- `packages/solid-stately/src/slider/createSliderState.ts`, with an internal
  slider-state helper only if required, and its existing owning state tests.
- `packages/solidaria/src/slider/createSlider.ts`, new
  `packages/solidaria/src/slider/createSliderThumb.ts`, the existing slider/root
  export lists for this hook only, and existing `createSlider` owning tests.
- `packages/solidaria-components/src/Slider.tsx` and existing owning Slider
  tests, preserving numeric scalar render/context views.
- Both styled `src/slider/index.tsx` and `src/slider/RangeSlider.tsx`, internal
  `src/slider/shared.tsx` if required, and their owning Slider/RangeSlider tests.
- These two owning tickets, conditional five-package changeset, affected
  attribution entries after exact byte review, and generated views through the
  existing generator. Public barrel changes are limited to approved names.

Preserve current supported scalar callbacks, multipliers, range default/reset,
ordered-pair normalization and controlled pending completion. Investigate any
upstream difference with an actual owning control before changing behavior.
Native input ownership and shared indexed behavior must precede styled
extraction. Freeze meaningful old-source assertions before applying production;
retain original compatibility, fresh SSR/hydration, native forms/focus/keyboard
and unchanged D5/D6/D8/style proof. Activating/removing certified skips requires
separate evidence-backed test admission; neither API approval nor a source
patch establishes parity or closure.

## Joint Slider actual owning returns — 2026-10-09

The unchanged-source control ran all six owning files: 160 passed and 23 failed
out of 183 cases. Actual exit 1, no timeout, owned processes closed and inputs
conserved. The failures establish missing indexed APIs and native input,
keyboard and external-form reset defects. Receipt:
`/tmp/ui-slider-old-direct-proof-20261009/01-slider-old-full-owners.return.json`,
SHA256 `54f669fda3efb55c175d18632f2f54b835354bc23489e02203be465c6626792e`.

The reviewed candidate is now applied. Its first complete six-file invocation
returned exit 1 with 117 passes and two assertion failures among 119 collected
cases; four files could not collect because exported Slider overloads conflict
with the installed component transform. The assertions fail on disabled drag
value retention and shadow-root form reset. Receipt:
`/tmp/ui-slider-candidate-direct-proof-20261009/01-slider-candidate-full-owners.return.json`,
SHA256 `6520cf0436cc275624c79c6813d335d8bb4e0d86d59072f88e8e1e1311c96e58`.
No timeout, owned processes closed and all candidate inputs conserved.
Flush-in-effect warnings remain. These are actual red returns; no owning,
SSR/hydration or native browser acceptance is inferred from applied source.
Focused corrections must retain the existing regression assertions.

## Joint Slider follow-up returns — 2026-10-09

The completed diagnostic assay collected all six files: 207 passed and eight
failed out of 215 cases. Actual exit 1, no timeout, empty owned process set and
conserved inputs. Receipt
`/tmp/ui-slider-diagnostic-direct-proof-20261009/01-slider-candidate-full-owners.return.json`,
SHA256 `315548ade74212f370c7b0d9e2317b63e19a836ba7bf77631be66ada9cda5bbf`.
This identified label ownership, shadow reset target lifetime, new styled reset
regression scheduling, surviving thumb identity and a reactive primitive crash.

The reviewed follow-up restored the original Aria test, corrected production
label references and captured the actual reset form before shadow dispatch
clears event.target. Two newly authored styled reset tests now invoke native
form.reset and await its deliberate cancellation-aware microtask; every
assertion remains unchanged. Setup-time styled thumb memos remove the observed
primitive creation crash. The actual complete return is 214 passed and one
failed out of 215, exit 1 with no timeout, empty owned process set and conserved
inputs. Receipt
`/tmp/ui-slider-final-repair-direct-proof-20261009/01-slider-candidate-full-owners.return.json`,
SHA256 `6e3e30eb6f87c65da9dd764848dad46bc9b9dbd2c2fb65d0e1f89ccb78f4a501`.
The remaining failure disconnects the existing index1 native input when index0
unmounts. All other owners pass, including shadow reset. Flush-in-effect
warnings remain; the two outside-provider error tests emit expected halted
reactivity warnings, with no observed primitive-in-forbidden-scope or unhandled
error. Whole owning acceptance is still red; native SSR/hydration, affected
browser owners and complete certification remain outstanding.

## Joint Slider owning pass and type follow-up — 2026-10-09

The latest full six-owner run passes all 215 cases. Unchanged normal production
typecheck and strict owning types also pass, including the four native
SSR/hydration files as type inputs. Actual exit 0, no timeout, owned processes
closed and bound inputs conserved in each return:

- Owning: `/tmp/ui-slider-owning-types-repair-direct-proof-20261009/01-slider-candidate-full-owners.return.json`, SHA256 `f369a18eb30a0b9d988a2c7ad53b6992362c1fd7c6bdf56033068b5a9dd36a57`.
- Production types: `/tmp/ui-slider-owning-types-repair-direct-proof-20261009/02-slider-source-strict-types.return.json`, SHA256 `fc67600517835eec6113fa81b944f382166f0d4e6771061f09b7a9d05378019e`.
- Owning types: `/tmp/ui-slider-owning-types-repair-direct-proof-20261009/03-slider-owning-strict-types.return.json`, SHA256 `9936c66c2e6a079214fc7ff9c96f169a4f39ea5d5e99bbbd13ff8d2e11a1cb88`.

The formatter changed 23 of 29 scoped files. Independent static review found
only formatting and JSX whitespace changes; it did not establish active
compiler equivalence. All 29 then pass original format and lint checks with
exit 0, owned closure and conserved inputs:
`/tmp/ui-slider-formatted-direct-proof-20261009/01-slider-scoped-format.return.json`,
SHA256 `a63c47783263cfa0ac7c6eb8f7d641668f16f51b7d86a4996168700ee473d53b`;
`/tmp/ui-slider-formatted-direct-proof-20261009/02-slider-scoped-lint.return.json`,
SHA256 `acc89006e8c8fd648cad522ef34728150014d9fefe574cbc4781f184541b3763`.
Whole final units and native SSR/hydration must still verify the formatted bytes.
Flush-in-effect and expected outside-provider halted warnings remain recorded.

The earlier type-repair returns remain historical evidence: owning 215 passes
at `/tmp/ui-slider-type-repair-direct-proof-20261009/01-slider-candidate-full-owners.return.json`,
SHA256 `5a765a45dfb45c5fe0094cd432ba32e0157b8382532eeb3526c1afc226def109`;
production types exit 2 with three diagnostics at
`/tmp/ui-slider-type-repair-direct-proof-20261009/02-slider-source-strict-types.return.json`,
SHA256 `ef9ab1925814f90f1ea8c0ca08dcf83cf6d4771d231489e38e2deb400d1c52c5`.
Those diagnostics are superseded by the successful unchanged type commands.

The full seven-package build, fresh native SSR/hydration, affected whole browser
owners and complete local RC gates remain pending. No ticket closure or browser
acceptance follows from these owning, type or format results.
