---
id: 76
type: task
title: "Collapse RangeSlider onto the Slider spine"
created: 2026-08-20
parent: 31
status: verified
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "migrated from legacy task rangeslider-duplicates-slider-spine",
    }
  - {
      state: in-progress,
      at: 2026-10-09,
      note: "Approved shared lower Slider candidate and styled composition applied with #74; complete owning and native/browser qualification remains required.",
    }
  - {
      state: verified,
      at: 2026-10-11,
      note: "Root accepted original full qualification, fresh zero-debt certification, exact-E hosted gates and actual RC1 registry consumer evidence; bounded closure is recorded in the final continuation.",
    }
---

Make RangeSlider a thin wrapper over the shared Slider layout, geometry, and
style atoms, with only the second thumb added.

The current `RangeSlider.tsx` duplicates the Slider styles and pointer/keyboard
math. Certification had to repair the same divergences in both copies. During
the consolidation, replace hardcoded `Minimum` and `Maximum` labels with the
upstream localized strings.

## Done when

RangeSlider shares the Slider source, remains certification-green, and future
Slider fixes propagate without duplicate edits.

## Relationship

Replaces `rangeslider-duplicates-slider-spine` from
the retired tech-debt note. Coordinate with #74.

## Current release preparation — 2026-10-09

Prepared and independently reviewed a shared state → Aria → components → styled
composition design with #74. Existing lower Slider contracts are scalar-only;
the two styled RangeSlider implementations cannot honestly become thin shared
wrappers through those unchanged contracts. The exact proposed array/index
extensions and `createSliderThumb` public name were approved by the owner on
2026-10-09. See the private API inventory and independent review recorded
in #74. No dependency, new package/subpath or styled public value-shape change
is proposed. Required added `SliderState` members also affect custom structural
providers and belong in that explicit choice.

After admission, preserve scalar compatibility and current supported pair
behavior in the shared lower core; prove state and native input ownership before
extracting unchanged local style atoms. Helpers must stay out of public styled
barrels. Style extraction alone does not meet this task's acceptance, and source
review does not remove either D6 skip or establish certification parity.

The exact joint source/test and supporting scope is admitted in #74. Medium Sol
workers prepare private implementation patches under that approved API; the
conductor alone applies them after unchanged-source proof. RangeSlider keeps
its existing object value/callback shape and maps to the canonical lower array
state. No pair state, normalization or pointer/keyboard math belongs in either
styled wrapper. Shared styling helpers stay package-local. No production
candidate or runtime acceptance has been applied yet.

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

## Actual published-E qualification continuation — 2026-10-11

The final Q26 whole build, units and fresh SSR followed by hydration, together with fresh B8 Slider/RangeSlider certification, supply the remaining local qualification. Both styled twins retain SliderBase over the shared state/Aria spine, so this continuation retains the original shared-source requirement. Earlier type-repair failures remain historical; no new OLD controls are claimed.

Accepted source qualification remains C′ `d8b57f49d2ee93453f4ac4120e1543a4245a55c1`; E `a2ccaf10885edadfd41ffc2d10c2e65fdad2ca58` records its original eight-shard result (2297 passed, zero failed/skipped/waived/flaky), followed by accepted exact-E strict parity. The same E now has all three required hosted workflows green and automatic Release run `38146924038` successful, independently accepted in `output/qualification-evidence/ui-exact-e-hosted-release-proof-20261011/ROOT-ACTUAL-PUBLICATION-AND-THREE-GATES-REVIEW-20261011.json`. Actual registry capture, crypto consumer and separate installed-native proof are accepted under `output/qualification-evidence/ui-registry-and-native-final-stage-rc1-e-a2ccaf10-proof-20261011/ROOT-CLOSED-STAGE-01-REVIEW.json`, `ROOT-CLOSED-STAGE-02-REVIEW.json` and `ROOT-CLOSED-STAGE-04-REVIEW.json`; the consumer verified 96 signatures and 55 attestations, and registry native passed all 12 original cases. Independently accepted LOCAL12 remains bound to C′ at `output/qualification-evidence/ui-registry-and-native-final-stage-local-rangeslider-viewport-20261011/ROOT-CLOSED-STAGE-02-REVIEW.json`. Physical refs/hashes are cataloged in `.agents/UI-EXECUTION-547-rc1-published-2026-10-11.json`; these later proofs do not recreate missing historical controls or claim complete API parity.

Root accepts this bounded ticket closure against its original Done when. Earlier historical limits and separate exclusions remain.
