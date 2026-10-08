---
id: 641
type: task
title: "Qualify Visualmode component caller contracts"
created: 2026-10-08
parent: 24
priority: high
status: in-progress
history:
  - { state: open, at: 2026-10-08, note: "Owner added Visualmode D26." }
  - {
      state: next,
      at: 2026-10-08,
      note: "Prioritize bounded Card/AlertDialog parity checks and separate existing contracts, extensions and dev diagnostics.",
    }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "Card regressions reproduce standalone tabindex loss; lower Link/focus merge needs separate admission. No source repair retained.",
    }
---

## Scope

UI owns D26 through separate slices naming exact paths, oracle and negative
control before source edits:

- Card lowercase tabindex appears filtered from static/link cards despite its
  declaration. Start at both styled Card boundaries, preserving reactive getters,
  managed GridList focus and #630 child identity; shared helpers need admission.
- AlertDialog drops caller DOM/label attributes that pinned S2 forwards. Test
  both styled owners before repair, preserving authoritative role/name/state.
- Prove existing styled Picker onOpenChange and headless DropZone isDisabled.
  Investigate Button title against lower/S2 types: S2 omits GlobalDOMAttributes,
  so runtime forwarding alone does not authorize a styled declaration expansion.
- Capture exact Solid dev stacks, versions and action timing for reported
  STRICT_READ_UNTRACKED in Button/Dialog/DialogTrigger before naming its owner.
  No broad untrack or scheduler workaround.

Pinned S2 DropZone omits isDisabled and fixes padding at 24; standalone Card
id/selection and AlertDialog close-before-action also match the pin. Changing
these contracts or adding async keep-open/new props/sizes needs a distinct owner
decision. No omnibus API expansion, dependency or consumer edits.

## Done when

Every allegation has current-source regression evidence and a disposition.
Reproduced parity gaps are repaired at their lowest owner in both siblings.
Existing contracts have exact behavior proof. Extensions receive concrete owner
choices; dev claims retain stacks or explicit unreproduced limits. No subpart
disappears behind an umbrella completion claim.

## Proof

Card: static/link tabindex, same-node updates and managed precedence. AlertDialog:
supported id/data/labels, accessible naming/role, action/cancel ordering and SSR.
Picker: exact open/close counts and callback replacement. Headless DropZone:
disabled drop/paste isolation. Button: pinned type evidence before declarations.
Diagnostics: actual dev reproduction. Save old-source failures for real fixes,
final scoped checks and candidate gates. Notes cover actual changed packages;
report published versions and installed-consumer verification.

## Relationship

Child of #24, prioritized by #87. Producer for Visualmode #10151/#10153/#10154.
Request: `visualmode/visualmode/.agents/ui-requests-2026-10-07/D26-button-card-dropzone-and-alertdialog-lack-caller-props.md`.
#635 owns Picker counts, #246 broader journeys, #636 FileTrigger, #557 native
focus and #534 confirmed scheduler work. Preserve those independent boundaries.
Each slice has a bounded commit/rollback scope and actual package Changeset.
Planning evidence: `/tmp/ui-D25-D26-triage-2026-10-08.md`.

## Card caller admission — 2026-10-08

The #637 source checkpoint is accepted and committed at
`d2d0045c1dbb1abfe1589afe7209e0f6484ab301`; its worker generation
`1160f45e-bba0-484c-bb4d-dfcc199fce80` was owned-stopped with closed=true.
Normal hooks retained all accepted path hashes and main was clean. Canonical
eligibility check passes. Register one OS/herdr source worker against repo:ui
main with `/tmp/ui-641-card-dispatch-2026-10-08.md`. Decision 040 permits
Codex astra low for this getter-preservation and managed-focus boundary.

Admit existing tests `packages/solid-spectrum/test/CardView.test.tsx` and
`packages/viviana-ui/test/CardView.test.tsx`. Only after an actual final-test
failure identifies the styled owner, admit the corresponding twin source
`packages/solid-spectrum/src/card/index.tsx` and
`packages/viviana-ui/src/card/index.tsx`. An actual repair admits
`.changeset/card-caller-tabindex.md` for changed packages. This ticket,
standard generated views and `/tmp/ui-641-card-*` receipts are admitted.
All Link/GridList/shared utility owners, manifests, dependencies, styles,
public API names and consumer code remain read-only; a lower-owner failure
returns for a distinct admission.

Qualify already-declared lowercase tabindex on static and linked standalone
Cards in both siblings, same-root live updates/removal, child/ref/focused-input
identity and collection-managed precedence with actual Arrow focus/selection.
No public camelCase alias is added. Record final assertions on original source
before repair, and identical-test exact-source controls with failure-safe
restoration if repaired. Preserve id requirements and standalone nonselection.
Keep native-browser, SSR/hydration, installed candidate and umbrella closure
open. Source worker records checks and stops editing; conductor reviews, owns
the exact stop and commits. Other D26 requests are outside this slice.

## Card slice evidence — 2026-10-08

Both siblings fail declared lowercase tabindex on final standalone div/anchor
roots. Managed roving focus and Arrow selection pass with conflicting caller
values. A temporary getter normalization to internal tabIndex passes static
updates, identity, focus and simulated Tab checks, but both anchors remain 0:
Link merges createLink/focusable props after caller DOM props. Lower owners are
read-only under this admission; return for a separately admitted repair.
Both styled sources were restored byte-for-byte to the launch base. No Changeset.
The retained regressions intentionally remain red pending that admission;
link identity/update assertions after the initial failure are not proven.
Native Tab, SSR, candidate/consumer proof and other D26 allegations remain open.
Worker handoff: `/tmp/ui-641-card-worker-result-2026-10-08.md` and its manifests.

## Card compatibility repair admission — 2026-10-08

The first Card worker c4c02cdf-da0b-4f0c-bd4f-ef06f9ab0718 returned four
actual standalone failures and was owned-stopped with closed=true. All 15
repository and 59 evidence manifest records match; immutable checkpoint
`/tmp/ui-641-card-diagnosis-checkpoint-2026-10-08/archive-map.json` preserves
the red regressions and restored source hashes. These five uncommitted test,
ticket and generated-view paths intentionally pass to the next serial worker;
no red checkpoint was committed. Canonical eligibility passes.

Admit one Card-only compatibility repair through
`/tmp/ui-641-card-repair-dispatch-2026-10-08.md`: existing twin Card tests and
source owners from the previous admission, owning ticket/generated views,
`.changeset/card-caller-tabindex.md` for both changed styled packages and new
private `packages/solidaria-components/test-utils/d26-caller-props.typecheck.ts`
for dual Card lowercase tabindex compiler assertions only. Shared Link,
createLink, createFocusable, GridList and filters remain read-only.

The pinned Link also places focus props after caller DOM props. Honor the
already-declared Solid Card property through existing focus context composition
in the standalone link branch, keeping outer managed context precedence and
refs/events live. Static cards forward their lowercase value. Do not change
shared Link semantics, add a public alias or widen disability behavior. This is
a local declared-property compatibility repair, not identical upstream Card
API parity. Undefined restores an enabled anchor's existing tabIndex 0 and Tab
inclusion; static cards remove the attribute. Final corrected assertions must
run against unchanged source before repair and each exact styled owner after
repair with failure-safe restoration. No interactive children in linked Cards.

Add actual outer-context precedence/live removal/ref/event and default Link
controls while retaining managed CardView Arrow/selection checks. Compiler
fixture participates in the canonical typecheck config; keep inherited
diagnostics separate. Native, installed consumer, remaining D26 allegations
and release qualification stay open. Conductor reviews and stops the exact
generation before integrating this completed repair.

## Card compatibility repair evidence — 2026-10-08

Generation `578a0b9b-c08a-4fd5-84bc-92616a41715f` repairs both styled owners
against `d2d0045c1dbb1abfe1589afe7209e0f6484ab301`. Static roots forward
lowercase tabindex; standalone links compose a live fallback before the outer
FocusableContext. Managed GridList remains unchanged. Viviana already forwards
isDisabled, so its fallback is suppressed while disabled; Spectrum retains its
existing standalone behavior. This honors a local declaration, not pinned S2
API equivalence. Both actual packages have a patch Changeset.

Corrected unchanged-source baseline: 6 failed, 25 passed. Each independently
restored exact-base Card owner fails both final standalone forwarding cases;
finally-restoration hashes match the repaired files and tests stay fixed.
Final Card suites: 31 passed, including outer context removal/ref/live events,
identity, simulated Tab and managed Arrow selection. Read-only Link and
createLink suites pass separately (31 and 16), and together (47). The required four-file serial
command exits 1: 63 passed, 15 duplicate-DOM failures in shared suites; this
combined-run cleanup limitation was subsequently repaired under the extension below.

The private dual CardProps compiler fixture is in canonical typecheck scope;
typecheck exits 2 with exactly the inherited 24 diagnostics and no new ones.
No shared source, config, public alias, dependency or consumer changes. Native,
SSR, build, candidate, installed-consumer and release qualification remain open,
as do the other D26 allegations and umbrella #641. Worker evidence and handoff:
`/tmp/ui-641-card-repair-worker-result-2026-10-08.md` and repair manifests.
Independent review and exact-generation owned stop precede conductor integration.

## Conductor cleanup scope extension — 2026-10-08

Independent review identified all 15 combined failures as duplicate-role Link
fixtures. Admit only imports of afterEach/cleanup and afterEach(cleanup) in
`packages/solidaria/test/createLink.test.tsx`; no assertions, shared product
source or config changes. The original required combined run against repaired
Cards remains the unchanged-test control in
`/tmp/ui-641-card-repair-final-tests.log`. Card assertions and exact-source
controls remain fixed. Final identical combined rerun passes all 78 tests (exit 0), qualifying this test-only repair.

## Viviana initial-disability blocker — 2026-10-08

Further conductor-requested cycles expose a shared-owner boundary: an initially
enabled Viviana href Card keeps caller tabindex=-1 across disable/enable cycles,
but an initially disabled Card gets tabindex=0 on first enable instead of -1.
The focused final-root test records 1 passed, 1 failed, 15 skipped; disabled
roots are nonfocusable. Root identity across Link anchor/span changes is not
required. The first single-cycle probe incorrectly retained the old root and
is superseded by these effective-root cases.

`createFocusable` selects interactionProps from initial disability at setup,
so initially disabled links never acquire the new context fallback on enable.
No shared-source repair is admitted or made. Keep the failing regression and
return for separately admitted lower-owner work; the Card repair is incomplete.
Spectrum disability semantics remain unchanged. Earlier exact-source controls
remain archived; any subsequent repair needs controls with the final tests.
Raw failure: `/tmp/ui-641-card-repair-disability-cycles-actual.log`.

## Reactive focus owner admission — 2026-10-08

The incomplete Card repair generation 578a0b9b-c08a-4fd5-84bc-92616a41715f
is owned-stopped with ok=true and closed=true. All 22 repository and 113
evidence records match; 137 archived records preserve the red checkpoint at
`/tmp/ui-641-card-repair-checkpoint-2026-10-08/archive-map.json`. Final four-suite
run is 79 passed, 1 failed: initially disabled Viviana linked Card becomes
enabled with index 0 instead of caller -1. No red commit integrated. Canonical
eligibility passes; ten known uncommitted paths pass to the next serial worker
at unchanged HEAD d2d0045c.

Admit one lower-owner repair through `/tmp/ui-641-focusable-dispatch-2026-10-08.md`:
`packages/solidaria/src/interactions/createFocusable.ts`, new private direct
`packages/solidaria/test/createFocusable.test.tsx`, and
`.changeset/focusable-reactive-context.md` for solidaria. Preserve inherited
Card source/tests/compiler fixture/Changeset and createLink cleanup. This
ticket, generated views and /tmp receipts are admitted. Shared Link, createLink,
createKeyboard, createFocus, mergeProps, filters, configs and dependencies remain
read-only.

Match pinned context suppression at current disability rather than setup;
preserve live context values, event chaining, ref synchronization and default
or excluded tab order. Prove both initial states on a fixed native element and
actual Card roots. No Spectrum disability expansion, public names or native/
installed/release claims. Decision 040 permits Codex astra low for this shared
reactive merge boundary. Conductor reviews and stops the exact generation before
commit. Other #641 allegations remain open.

## Reactive focus owner evidence — 2026-10-08

Generation `649d2889-9fea-4000-97ca-3e5475b14720` changes only
`createFocusable` product source: existing context keys read current disability
and values; stable event wrappers preserve own/context chaining through eager
merges. Ref synchronization and autofocus remain unchanged. Inherited Card
sources, assertions, compiler fixture, styled Changeset and createLink cleanup
remain byte-identical to the admitted checkpoint.

Ten fixed-element direct cases cover both initial disability states, cycles,
context index/default/exclusion, live data/ARIA, callback replacement/absence,
ref/node identity and own/context event order/arguments. Initial test setup
mistakes (Solid context syntax and callback signal initialization) are retained
in separate logs; the exact-base final-test control is authoritative: 10 direct
failures, plus 1 initially-disabled Card failure (1 pass, 15 filtered skips).
Finally restoration matches source/test hashes. Prior twin forwarding controls
remain applicable to unchanged inherited Card assertions and source premise.

The final five-suite serial command passes 90 tests; createButton passes 71.
These are DOM simulation results, not browser or release qualification.
Handoff and sealed manifests: `/tmp/ui-641-focusable-worker-result-2026-10-08.md`.
Conductor review, exact-generation stop and normal-hook integration remain
pending. Umbrella #641 and other D26 allegations remain open.

## Focus repair acceptance and AlertDialog admission — 2026-10-08

The final focus r3 handoff supersedes the earlier 90-test checkpoint above.
Independent review accepted current-disability getters and native handler
receiver preservation; all 92 final focus/Card/Link tests pass. Exact-base
controls fail ten direct reactive cases and one initially-disabled Card case,
while two receiver preservation controls pass. All 19 final repository and 24
evidence records match; the 45-record immutable checkpoint is
`/tmp/ui-641-focusable-r3-checkpoint-2026-10-08/archive-map.json`.
Generation 649d2889-9fea-4000-97ca-3e5475b14720 is owned-stopped with
closed=true. Normal hooks retained accepted hashes in commit
48af500b6755f6e6a0d55670e6c96fa9c825d8c9; main is clean. Canonical
eligibility passes. Root's authenticated CI read remains available: the
worker's unauthenticated gh limit is local to that worker, not the conductor.
The 24 inherited compiler errors, native/installed and release proof remain open.

Admit the next serial OS/herdr source task through
`/tmp/ui-641-dialog-dispatch-2026-10-08.md`. Decision 040 permits Codex astra
low for reactive label forwarding and compiler/SSR boundaries. Admit existing
`packages/solid-spectrum/test/Dialog.test.tsx` and
`packages/solid-spectrum/test/Dialog.ssr.test.tsx`, new focused
`packages/viviana-ui/test/Dialog.test.tsx` and
`packages/viviana-ui/test/Dialog.ssr.test.tsx`. Only after actual caller-contract
failures admit `packages/solid-spectrum/src/dialog/AlertDialog.tsx` and
`packages/viviana-ui/src/dialog/AlertDialog.tsx`. Extend only dual AlertDialog
assertions in existing private
`packages/solidaria-components/test-utils/d26-caller-props.typecheck.ts`,
preserving all Card assertions. An actual repair admits
`.changeset/alertdialog-caller-attributes.md` for changed styled packages.
This ticket, generated views and `/tmp/ui-641-dialog-*` evidence are admitted.

Match pinned S2 DOMProps/AriaLabelingProps using the actual existing exported
label types. Preserve live filtered id/data/label/reference values across
removal and reintroduction, accessible naming precedence, generated title/content
fallbacks, child/focus identity and fixed alertdialog role. aria-details is
metadata, not accessible description text. Keep action ordering and dedicated
SSR behavior. Lower Dialog/createDialog/filter/config, inherited Card owners,
shared helpers, styles, manifests, dependencies, public names and consumers
remain read-only. Focused exact-owner controls retain final tests and restore
sources in finally. Record canonical compiler debt honestly; no hydration,
native or release claim from this slice and no umbrella closure.

## AlertDialog caller forwarding r2 — 2026-10-08

Generation `7e823f83-b124-4251-be1d-7ba5732e05eb`, exact base
`48af500b6755f6e6a0d55670e6c96fa9c825d8c9`. Twin AlertDialog sources now
extend exported DOMProps/AriaLabelingProps and forward labelable DOM props
through the existing accessor boundary before fixed role. Lower Dialog,
createDialog, Heading, filters, merges and SSR primitives remain unchanged;
revoked lower admission required no restoration because no edits were made.

Final twin unit suites pass 25 tests; dedicated SSR suites pass 7. Caller
id/data and four ARIA values traverse undefined/A/B/removal/reintroduction on
the same root, child and focused input. Real external references prove naming,
description and separate aria-details metadata. Explicit external naming wins;
removal exposes the still-present live explicit label. Initially-undefined
labels restore valid generated title/content associations. Existing action
assertions plus close-before-action and disabled controls pass, without action
wiring changes. SSR honestly characterizes modal deferral with retained triggers
and external nodes; original five Spectrum assertions remain. No inline or
hydration claim.

The failed checkpoint is frozen at
`/tmp/ui-641-dialog-worker-result-2026-10-08.md` with original logs/manifests.
Its initial-label removal recovery requirement exceeded installed upstream:
React/ReactDOM 19.2.8 and React Aria Components 1.21.0 reproduce missing generated
title recovery. This is an upstream limitation, not a second established
Solid-only defect. Exact isolated harness snapshot SHA256
`fcb9a35bc11a17af773009d48c4d49fbcf56576d746c2b3567b29171e27ff7fb`;
raw log SHA256
`de6da5dae19525dd0c4d0bae79e390d3ace51d46be09d76565e00f244490ce5e`.
Snapshots: `/tmp/ui-641-dialog-r2-upstream-probe.cjs` and
`/tmp/ui-641-dialog-r2-upstream-probe.log`. This standalone RAC control does not
certify installed S2 AlertDialog. Invalid inline SSR reds are likewise preserved
as failed test-design evidence, not product defects.

Revised exact-base twin source controls isolate actual caller forwarding failures
and restore in finally with source/test hashes. Canonical typecheck already
reports exactly 24 inherited diagnostics, no new ones; relevant sources and
included private type fixture are unchanged since that run, so no redundant
compiler rerun. Existing Card assertions remain byte-identical. Scoped r2
format/lint/docs/diff receipts and final manifests bind the reviewable result.
The two styled packages have a patch Changeset. No lower changeset, commit,
push, native/build/browser, release or full-reactivity certification. #641 stays
open; conductor owns acceptance and exact-generation stop. Final r2 handoff:
`/tmp/ui-641-dialog-r2-worker-result-2026-10-08.md`.
