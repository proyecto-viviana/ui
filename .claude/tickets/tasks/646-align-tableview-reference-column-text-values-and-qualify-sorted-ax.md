---
id: 646
type: task
title: "Align TableView reference column text values and qualify sorted AX"
created: 2026-10-09
parent: 531
status: in-progress
history:
  - {
      state: open,
      at: 2026-10-09,
      note: "current 3298 terminal certification has a sorted TableView D6 skip; #260 records unequal column naming inputs but no dedicated open owner exists",
    }
  - {
      state: in-progress,
      at: 2026-10-09,
      note: "conductor admitted bounded reference-fixture equivalence and unchanged AX qualification; private one-line source proposal reviewed, owning positive tests in preparation, no source patch or runtime applied",
    }
---

## Cause

The React reference maps SpectrumColumn without explicit `textValue`. Pinned
S2 1.7.0 forwards that prop to RAC, but wraps visible children in a render
function; the collection then derives an empty accessibility text value.
Solid's data column already derives its visible name. Both table implementations
use the sorted column's text value in the grid description. The current sorted
D6 known divergence skips comparison before navigating either framework.

The proposed repair supplies `textValue: column.name` for every mapped React
column, using the existing shared data. This is a source-supported fixture
correction; complete AX parity remains a mandatory qualification obligation.

## Scope

The conductor alone writes these bounded paths:

- `apps/comparison/src/components/react/fixtures/styled/tableview.js`.
- `apps/comparison/e2e/certified/tableview.certified.spec.ts`.
- `apps/comparison/e2e/tableview-visual.spec.ts`.
- `apps/comparison/src/components/solid/solid-h.ts` under the bounded callback-owner admission below.
- `apps/comparison/test/solid-integration/hyperscript.hydrate.test.tsx` under that same admission.
- This ticket, #547 and generated `.claude/current/status.md` / `roadmap.md`.

No production package, Solid fixture, public API, dependency, style, AX driver,
snapshot, normalization or budget changes. Preserve #89's accepted structural
decision and TableCell's approved reactive-getter limitation. Fixture-only
changes require no product Changeset.

## Work

1. Retain the existing sorted D6 assertion with only its skip registration
   disabled for causal measurement. Add positive owning assertions for BOTH
   frameworks' Name/ascending and Status/descending grid descriptions and
   matching column `aria-sort`; preserve all existing tests.
2. Under one bounded runtime slot, freshly build the unchanged fixture and
   reproduce the exact missing-column-name mismatch. Apply the one-line
   reference correction, rebuild and pass the same assertions. Withdraw only
   that line for the same failure, restore and qualify the exact candidate.
3. Preserve all five D6 cases, visible-column matrices, controlled selection,
   sorting, actions, disabled/links and resize coverage. Remove the obsolete
   known divergence only after measured complete parity; reconcile its prose
   and final discovered inventory under #194 / #537.
4. Record build/source identities, exact commands, outputs and process return;
   regenerate views and pass applicable fixture checks and documentation guards.

## Done when

The two initial sorted-name controls and all five existing TableView D6 cases
pass without skips, unchanged exact AX/description assertions remain in force,
and existing TableView interaction tests pass on a fresh candidate build.
Record a reproduced old-fixture failure and restored candidate success.

## Limits and relationship

The React fixture currently includes `sortDescriptor` in its table remount key.
Upstream suppresses an initial live sort announcement, so the existing descending
marker test cannot establish live-announcement parity. Do not silently change
that key or claim emitted transcript proof from the initial grid description.
Measure retained-node, nonempty assertive transcript behavior in a separately
admitted continuation if necessary. This task owns the resting D6 fixture
equivalence and does not close #537, #194 or the full five-package release.

Private reviewed proposal:
`/tmp/ui-tableview-sorted-skip-proposal-20261009.md`, with exact fixture patch
and input hashes. Original owner fallback and cross-lane release instructions
were verified in `/tmp/ui-direct-fallback-owner-verification-20261009.json`.

## Initial test-only checkpoint — 2026-10-09

Applied the two positive owning tests in `tableview-visual.spec.ts`, after
independent source review and exact base/candidate hash verification. Each
framework must expose the complete English grid description and matching header
`aria-sort` for Name ascending and Status descending. Existing cases remain
unchanged. The React fixture and sorted D6 skip are still unchanged; the one-line
fixture repair and enable-only assay remain private until the bounded causal
browser run. No build, browser or test has executed for this task.

The reviewed test packet is
`/tmp/ui-tableview-sorted-owning-tests-proposal-20261009/`. The new assertions
cover initial descriptions only and do not claim emitted live announcements.

## Actual OLD checkpoint — 2026-10-09

The original complete five-owner assay closed 17 PASS / 13 FAIL of 30,
zero skips, exit 1, no timeout, empty owned closure and 14,891 conserved inputs.
Sorted D6 reported React's missing column name versus Solid's Name; both new
initial Name/ascending and Status/descending owning cases reproduced missing
React column names. The old fixture remains archived. A page crash during
unsorted D6, missing-root controlled-selection output, and the separately
reported focus-ring mismatch establish no additional textValue cause.
Breadcrumb defects are separately classified under #429.

The one-line textValue: column.name reference candidate is reviewed, alongside
#429's independent native remeasurement and visible-link helper corrections.
At the prior checkpoint, the candidate complete-five-owner return was outstanding. Only after
candidate GREEN may the existing cause chain withdraw TABLE ONLY, build and
reproduce the same sorted-D6/Name/Status missing-name failures, then restore
TABLE ONLY, rebuild and qualify all original five owners. Every AX, style,
interaction and positive description assertion stays unchanged. Unexpected
failure stops; no sorted waiver retirement or closure is claimed.

Immutable OLD receipt SHA256:
6aa166b9b2ceed66cb189e38a40180c21fd7f7159062d7d6e93f650a2cf9a9bb;
raw SHA256: 4ce117341ba8af42feb7147b27967591128f70fcac73be13294822e44193fa96.
Evidence: /tmp/ui-two-blocker-browser-causal-proof-20261009/actual-stage-02-evidence/.
The initial-description proof still does not establish emitted live-sort announcements.

## Latest native OLD checkpoint and source application — 2026-10-09

The short-TMP successor closed at 23:50:05 UTC with 20 PASS / 10 FAIL
of the same original 30 cases, zero skips, exit 1, empty owned closure and
all bound inputs conserved. Six Breadcrumb failures remained: four initial
URL tails, overflow D6 tail parity, and the computed-color comparison.
Three Table failures remained: sorted D6 and the initial Name/ascending and
Status/descending descriptions. The remaining focus case timed out looking
for Solid's Budget.xlsx rowheader after keyboard focus. Earlier page crashes
and missing React roots did not recur; this establishes no storage cause.

At 23:53 UTC the conductor applied the three reviewed independent deltas:
the React Breadcrumb font-settled native list-width pulse, the existing
visible-link measurement selector excluding data-hidden-breadcrumb, and
the React Table column textValue. The subsequent candidate build/browser
chain was not yet closed at this checkpoint. Source application establishes
no browser success. All full-five-owner candidate, TABLE-ONLY withdrawal/
restoration, and subsequent pulse-only withdrawal/restoration obligations
remain unchanged; no waiver retirement or closure is claimed.

Latest OLD receipt SHA256: f5891190b5ca357f29cbc2a4e62566045729ebb0c0e95c21195ca706acc4195a;
raw SHA256: 230b77d45dfb990e54df2d6ba1b764286f5cc7d7beebc2ce644250aea07355f7.

## Actual combined candidate checkpoint — 2026-10-09

The original complete five-owner candidate closed at 23:57:54.099368 UTC
with 24 PASS / 6 FAIL of 30, zero skips, exit 1, empty owned closure and
14,891 conserved inputs. The certified subset was 7 PASS / 1 FAIL of 8.
Both positive initial Table descriptions and sorted Table D6 now pass;
the Breadcrumb computed-style comparison also passes with the corrected
visible-link selector. Four initial Breadcrumb URL tails and overflow D6
still fail, and Solid's Budget.xlsx rowheader remains unavailable to the
original focus case. The candidate list-width pulse has not cleared the
tail failures. These results identify remaining defects, not their native
ResizeObserver chronology or component remount cause. No task/waiver closure
or aggregate readiness is established.

Receipt SHA256: de1228f09b2f29f7780b1b191cb6ae83dc1669da3c44d593dae20a9a12ad751b;
raw SHA256: 35aebfdc7301bad3bf01435644012666c85b683a602b836b8e26b8436252eb29.
Actual return: output/qualification-evidence/ui-reviewed-combined-browser-causal-successor-proof-20261009/04-table-candidate-breadcrumbs-table-full-owners.return.json.

All candidate and cause-chain obligations remain: whole-five-owner GREEN
before TABLE-ONLY withdrawal/restoration, followed by pulse-only withdrawal/
restoration keeping the corrected visible selector. Unexpected failures stop
for review. Neither passing descriptions nor a diagnostic substitutes for
the original whole owners, matched SSR/hydration and final mandatory gates.

## Bounded comparison callback-owner admission — #547 / #646

This local qualification continuation admits ONLY the existing comparison
helper apps/comparison/src/components/solid/solid-h.ts and its existing whole
owner apps/comparison/test/solid-integration/hyperscript.hydrate.test.tsx,
besides the already admitted fixtures and original browser oracles. Preserve
every existing assertion and append two meaningful callback-return-array
identity regressions covering zero-argument accessor and one-argument callback
semantics, sibling native node identity and live reactive values. The resulting
whole owner is twelve cases; no filter, skip, threshold or budget changes.

The source-supported proposal materializes existing HC_THUNK component slots
inside the marked callback owner before downstream shared reactive insertion,
preserving the existing zero/one-argument distinction and leaving ordinary
reactive accessors live. TableRow's append-only cell registry explains a
possible missing rowheader after rematerialization; no native remount timeline
has been observed. The helper repair remains pending, with no application or
GREEN claim. No production package, public name, export, dependency, styling,
normalization or original browser assertion is changed by this admission.

Qualification requires actual OLD, candidate, helper-ONLY withdrawal and exact
restoration runs of the complete twelve-case owner, with candidate/restored
GREEN and matching actual OLD/withdrawn regression failures. Full comparison
SSR/hydration and the same native whole-five-owner browser assay remain
mandatory, preserving their original enclosing budgets and assertions. Any
unexpected failure stops for root review. The conductor alone integrates and
freshly admits each run after owned predecessor closure. No focused pass
closes #646, #547 or local release readiness; no push/version/publication or
deployment is admitted.

## Native row-pulse and callback-owner checkpoint — 2026-10-10 UTC

The fresh original complete five-owner browser run closed at
00:14:18.965879 UTC with 29 PASS / 1 FAIL of 30, zero skips, actual exit 1,
no timeout, empty owned-process closure and all bound inputs conserved.
All Breadcrumb cases, Table descriptions/sorted AX, and the native Budget.xlsx
rowheader focus action now pass. The sole remaining failure is the unchanged
Table cell focus-ring geometry comparison: Solid `ringBottomDelta` is -1,
React is 0 (`tableview-visual.spec.ts:487`). The certified subset is 8 PASS /
0 FAIL, zero skipped/waived/flaky; its enclosing run status remains failed.
This is not whole-five-owner GREEN or final eight-shard certification.

Browser return:
`output/qualification-evidence/ui-row-pulse-and-callback-browser-causal-successor-proof-20261009/04-table-candidate-breadcrumbs-table-full-owners.return.json`,
SHA256 `872d75d1207064f2567ef211d1ab0d751bd4311cc1822f54c0949db9b4ee1d23`;
raw SHA256 `d381738b1ec1e0bfd5ab190c6d2fd6a4afcb6b7635cbebc69ecfcf92a6a9ecda`.
Earlier actual RED receipts remain historical evidence. TABLE-only and pulse-only
withdrawal/restoration browser obligations remain outstanding; no matched
full comparison SSR/hydration, final mandatory gates, task closure or remote
success is established by this focused run.

The complete twelve-case hyperscript hydrate owner established the reviewed
helper's local regression cause through OLD -> candidate -> helper-only
withdrawal -> exact restoration: 10 PASS / 2 FAIL -> 12 PASS -> 10 PASS /
2 FAIL -> 12 PASS. All original ten cases remain passing; the two appended
zero/one-arity sibling identity/focus/local-state cases fail on OLD/withdrawn
and pass on candidate/restored. Every phase closed without timeout, with no
remaining owned processes and conserved bound inputs. This proves the owning
regression's dependency on the helper delta; it does not independently prove
an observed native Table remount chronology or complete browser parity.

Returns under
`output/qualification-evidence/ui-render-prop-sibling-causal-regression-proof-20261009/`:
OLD `8821b591c953da7e8826791b82ebe2fd6f0f44040b7d1affef4c412b54d58239`;
candidate `a1f765582486601eb7deae81e8b3f7bf73434d9ed87ba6a0e9f56f47bf0fd2b2`;
withdrawn `40646146aea1d5ab767ca36ef4e61b5c91330ff18232a8b1b6c23450b90d034d`;
restored `8fde628498faaf7d08c9e5941f6b362ca4219dba6c100bc1c32b87f9e9685c19`.

### Remaining bounded production investigation

Read-only source investigation may inspect the existing styled Table owners
`packages/solid-spectrum/src/table/index.tsx` and
`packages/viviana-ui/src/table/index.tsx` for the measured focus-ring difference.
This checkpoint authorizes no production application. Any proposed repair
requires root's exact source/preimage approval, a meaningful owning regression
and Changeset, plus unchanged complete owners and native qualification before
acceptance. No new public API/dependency, timer/budget change, assertion
relaxation, waiver or task closure is admitted. The conductor remains the sole
source writer; no push, version, publication or deployment is in scope.

## Conditional bounded Table divider continuation — 2026-10-10 UTC

Read-only investigation targets the remaining measured native cell focus-ring
difference. The exact successor is
`/tmp/ui-table-cell-divider-row-shadow-forced-colors-proposal-20261009/`,
source patch SHA256
`0452335db931870733f732274989469edfb4a3c7778fb492803129310b6d8f1d`.
Before application, the actual source-bound native diagnostic must confirm
the one-pixel cell bottom border / focus-ring containing-box cause, matching
pinned S2's zero cell bottom border and one-pixel row divider. A loader failure
before collection proves no product cause. This checkpoint reports neither
application nor native success.

After that actual diagnosis and root's exact source/preimage acceptance,
the conductor may apply only the successor's two existing Table paths,
`packages/solid-spectrum/src/table/index.tsx` and
`packages/viviana-ui/src/table/index.tsx`, plus its existing exact two-package
patch Changeset. The ordinary cell bottom border becomes zero; the existing
row divider shadow gains the checkbox branch. Both styled rows ALREADY have
`forcedColorAdjust: none` and system-color gray/highlight variables; preserve
those protections. The successor's explicit forced-colors checkbox shadow
uses `ButtonBorder`, including selected checkbox rows, matching pinned S2.
No new forced-color opt-out or pseudo-overlay is admitted.

Acceptance still requires measured forced-colors computed/paint evidence
on fresh candidate output: retained row opt-out, checkbox divider and system
color for both selected/unselected states, with highlight suppression
unchanged. A source-supported branch or default-mode pass alone is not that
proof. Preserve ring CSS and every original assertion. Both complete Table
unit owners, fresh production/comparison artifacts and the original complete
thirty-case browser owner assay remain mandatory with their original budgets;
the existing native focus-geometry regression is meaningful style coverage.
Do not add class/style-object mirror tests as a substitute. Existing fixture
and helper cause controls, matched SSR/hydration and final gates remain.

This is a bounded repair within the current temporary native Table architecture,
not local ratification or closure of #89's upstream convergence under #490.
No public API/dependency, threshold, worker, timeout, normalization, skip or
waiver change is admitted. The conductor alone writes after owned closure;
this goal stops locally before push, version, publication or deployment.

## Native divider measurement and source application — 2026-10-10 UTC

The source-bound native diagnostic completed all four phases with `errors: []`,
actual exit 0, 14,972 conserved inputs and no remaining owned processes.
React's cell bottom border measured 0px with ring bottom delta 0px; Solid's
native TD measured a 1px bottom border with ring bottom delta -1px. Both retained
the original `bottom: 0` ring rule. This records the measured containing-box
difference; it is not acceptance of the repaired output or whole browser suite.

Evidence under
`output/qualification-evidence/ui-table-native-cell-focus-playwright-esm-proof-20261010/`:
`01-table-native-cell-focus-geometry.return.json` SHA256
`7a36f8922d6821515870e763387aa5afe48e98248680e7f593202eca2e7bc872`;
raw SHA256 `3c4cb134b1510cb50a1ba7b20070edf7eecd211420fc267ecb21bb80a070f9c6`;
`native-cell-focus-geometry.json` SHA256
`6326886e3982af273782304605f27d32ef21cbfa52d8a11d02dbd2aee088ffda`.

Root applied the exact forced-colors-safe successor to both existing styled
Table owners and its two-package patch Changeset. Application record:
`/tmp/ui-table-divider-fc-safe-root-application-20261010.json`, SHA256
`3106f4b255dfcf3a06e7698f233e047e3ff2c87ee0992d053c72a8e7315af728`.
The source delta removes the ordinary cell bottom border and supplies the
checkbox row divider through the row shadow, explicitly using `ButtonBorder`
in forced colors. Existing row `forcedColorAdjust: none`, highlight branches
and ring rules remain unchanged.

Both unchanged complete Table unit owners passed: Spectrum 29 and Viviana UI 8,
37 PASS across two files, actual exit 0, no timeout, no remaining owned processes
and 7,144 conserved inputs; returned 2026-10-10 00:38:44.355700 UTC.
`output/qualification-evidence/ui-table-divider-two-whole-unit-owners-proof-20261010/01-table-two-whole-unit-owners.return.json`
SHA256 `5273868c8dbb327533c694a87422366867624c4a7f35287599082ff693d15767`;
raw SHA256 `28899c34af60c4fbe890cbbf5afb2add8a15b8f09c0c8d692bc31dd93c2585fe`.
This unit result establishes neither native CSS nor forced-colors acceptance.
The original whole five-owner browser assay now passes all thirty cases with
zero failed/skipped; its certified subset passes all eight cases with zero
failed/skipped/waived/flaky and `errors: []`. Actual exit 0, no timeout, no
remaining owned processes, 14,893 conserved inputs; returned
2026-10-10 00:43:47.980094 UTC. Return:
`output/qualification-evidence/ui-table-divider-whole-browser-causal-successor-proof-20261010/04-table-candidate-breadcrumbs-table-full-owners.return.json`,
SHA256 `c46b7e7259dcfa181d210d437958f0cedcf71c0d4ddde001f4dacf87d0494286`;
raw SHA256 `c66ade31673aced8265003135a22dea8f340bc75a41c3e5a9b7c4a2354a8b635`.
Its retained `actual-stage-04-evidence/MANIFEST.json` SHA256 is
`58dee3436b7bd47dc138a5cb4887439130d0c5144e6b42ebb74c98377b662312`;
root independently verified all thirteen archived files against their sources.
This is the complete owning browser result, not final eight-shard qualification.

The native forced-colors diagnostic completed all three phases with
`errors: []`, actual exit 0, 14,973 conserved inputs, no remaining owned
processes and seven fresh artifacts. Root independently parsed the full
receipt/raw/JSON and inspected all six PNGs. Ordinary checkbox rows retain
horizontal dividers in the natural initial, Budget-selected and
adjacent-selected states; the computed `ButtonBorder` inset shadow matches
the existing `forcedColorAdjust: none` protection. This is measured preservation
of that divider branch. Existing broader checkbox/color/vertical-divider
differences remain; no general forced-colors parity or native highlight
qualification is claimed.

Return:
`output/qualification-evidence/ui-table-native-checkbox-forced-colors-esm-proof-20261010/01-table-native-checkbox-forced-colors.return.json`,
SHA256 `38c45ab7ce16a3e5e0c0b6f2cb6c5aa8cd5725c5717d4c49fe30aca5c01de8ac`.
The full `native-checkbox-forced-colors.json` and the six initial,
Budget-selected and adjacent-selected React/Solid PNGs remain beside it.
Fixture/pulse cause controls, matched SSR/hydration and all final gates remain
pending at this checkpoint.
The temporary architecture and #490 remain open; no ticket closure, complete
qualification, remote success, push, version, publication or deployment is claimed.

## Table text-value withdrawal/restoration checkpoint — 2026-10-10 UTC

The completed TABLE-ONLY controls changed only the React fixture column
`textValue`: withdrawal used fixture SHA256
`33066ce90fc8d5f1e714f1b8e22a93a3f788ed64cbd1437cb768662c8d9a0886`,
and restoration used
`cce1772ede6b9347533830203df5208dd591921e2fc5f2a44fb5a8c92ec0a86e`.
The Breadcrumb containing-row pulse, corrected visible-link selector, callback
owner repair and styled Table divider repair remained in those bound phases.
This controls the column-name defect; it does not withdraw the divider repair.

Stages 5 and 7 each completed the original full comparison build with exit 0.
Stage 6 ran the same five complete browser owners and all original 30 cases:
27 PASS / 3 FAIL, zero skips, actual exit 1. The failures were precisely sorted
Table D6 and the initial Name/ascending and Status/descending descriptions;
the withdrawn React descriptions omitted the column names. The certified
subset was 7 PASS / 1 FAIL, zero skipped/waived/flaky. All Breadcrumb cases and
the original Table focus-ring geometry case passed during this withdrawal.

After restoring the exact fixture, stage 8 returned at
2026-10-10 00:59:23.387348 UTC with 30 PASS / 0 FAIL / 0 SKIP, exit 0.
The certified subset was 8 PASS with zero failed/skipped/waived/flaky. Both
browser phases conserved 14,893 bound inputs; both builds conserved 6,492.
All four stages had no timeout, empty remaining ownership and established
owned closure. Original assertions, owners and budgets were unchanged.

Evidence under
`output/qualification-evidence/ui-table-divider-whole-browser-causal-successor-proof-20261010/`:

| Stage / return                                                    | Receipt SHA256                                                     | Raw SHA256                                                         |
| ----------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| 05 `05-table-withdrawn-comparison-production-build.return.json`   | `1d5bf6d453b944571ef7e92cb91b861168ed0c76fcdbcfa310f9e20e7d1ef142` | `94a7a7d186bb80f5f4aac834bbf3dc9c20a138ad31e35876cae6dd147ef6402a` |
| 06 `06-table-withdrawn-breadcrumbs-table-full-owners.return.json` | `b6706be9708848f0489cd102ab315f614adcbd41060ff4787bd580b580110e27` | `35775daa82135b7efff6a93f476c23c518cb5d137c3edf6c228dc92c9426c495` |
| 07 `07-table-restored-comparison-production-build.return.json`    | `dd9c06a942e7c6e6c572ba7eddb5ab1bdc621506212928dfc610ee9af9eff15e` | `af1bc641965b72a626ac3aa997b3c5f41fba2623ecdb430e1737d54b6e6a3c4c` |
| 08 `08-table-restored-breadcrumbs-table-full-owners.return.json`  | `2aab6b4ec19142aedb062c9ade1181e0d62840b1dacd3aa34666f74b2a334229` | `c66ade31673aced8265003135a22dea8f340bc75a41c3e5a9b7c4a2354a8b635` |

Retained archive manifests: `actual-stage-06-evidence/MANIFEST.json` SHA256
`506ca5b771d1b155d29760e8cc4a2044463622dadbf6f21c765725da6f204a75`,
and `actual-stage-08-evidence/MANIFEST.json` SHA256
`72751b5d081a22d3bf85a2f02ee427e494770df94dbe60ae0b19e7e9b5c45ee6`.
The archived file bytes and hashes were independently checked against each
manifest; live report paths may subsequently belong to a later phase.

The separate Breadcrumb pulse-only withdrawal has since returned exactly
25 PASS / 5 FAIL of 30: four initial URL tails and overflow D6 tail parity;
all fourteen Table cases passed, with zero skipped/flaky. Its actual receipt
SHA256 is `78ed098eb3281bd383279ff929ce43aa3deb805ec53bfac76537dedbe65eb347`,
raw `a2a746bb04793a68708783d0a027e15661021ebcaba0bce6ff4eccaefd46e079`,
and archive manifest `ae077912bb63ff441760d0373e3c628d290690beed4755710a9b25ac32a12dc2`;
#429 records the full paths and restoration application. The restored full
comparison build then closed exit 0 (52.6169 seconds, 6,492 conserved inputs),
receipt SHA256 `cdbba8adc84f6c62b88971f9900ca67df9b5bea0efa033362b5c1430d728e4bb`.
The restored whole-five-owner browser stage closed at
2026-10-10 01:11:32.849061 UTC, exit 0 (83.4467 seconds, 14,893 conserved
inputs): 30 PASS, certified 8 PASS, zero failed/skipped/waived/flaky and
`errors: []`, no timeout or remaining ownership. Receipt SHA256
`8f75b001030b3af68b82dcb53070cf3e6cdbd9ae90c2a0079ba667c8b6ff1173`;
raw SHA256 `847f0959eb698b736e47388fa8dc9eb89adda546ae5bf238b525a66081304ea9`;
archive manifest `94711e33302ccfde6f0e7d74bbf0bf38b73c5d8d8ae9da91e59d8ba6dc3b37f7`
(all thirteen files / 4,575,278 bytes independently verified). Thus both the
Table text-value and Breadcrumb pulse original whole-owner controls are now
complete. This establishes no ticket closure, native-13 qualification,
aggregate readiness, final eight-shard qualification or publication.
Matched SSR/hydration and final mandatory gates remain outstanding. The
temporary Table architecture and #490 remain open.

## Accepted Table focus-ring containing-block continuation — 2026-10-10

The accepted continuation extends the original fixture-only scope to the matching styled Table sources and the table-cell containing-block patch note. Both twins move the checkbox row divider from the cell's bottom border to an inset row shadow, preserving the full cell box used by its focus ring. Existing highlight-mode selection suppression and forced-color behavior remain aligned with pinned S2.

The recorded original whole-five-owner browser controls support this delta: Table withdrawal exposed the unchanged focus-ring geometry failure; exact restoration passed all 30 cases, including eight certified cases, without skipped, waived or flaky results. The later restored Breadcrumb/Table whole-owner return also passed 30/30. These are scoped causal/browser returns already recorded above, not aggregate readiness, fresh eight-shard qualification, installed native630, publication or ticket closure. The separate temporary Table architecture and #490 remain open.
