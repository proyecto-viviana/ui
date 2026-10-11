---
id: 645
type: task
title: "Respect active focus ownership in deferred scope restoration"
created: 2026-10-09
parent: 531
status: verified
history:
  - {
      state: open,
      at: 2026-10-09,
      note: "Opened bounded FocusScope successor from current release qualification failures; pinned upstream supports both source corrections. Runtime proof remains unexecuted.",
    }
  - {
      state: in-progress,
      at: 2026-10-09,
      note: "ROOT admits the named two-source/test paths and solidaria Changeset under the verified temporary direct-worker exception and autonomous UI release instruction; one tracked writer and all proof gates remain.",
    }
  - {
      state: verified,
      at: 2026-10-11,
      note: "Root accepted fresh final release qualification and the bounded actual controls recorded in the final appendix; published RC1 and installed consumer proof are complete.",
    }
---

## Scope

Own repo:ui's two FocusScope omissions: a queued parent containment frame must
consult current containing-child ownership before refocusing, and unmount
restoration must execute in its scheduled frame rather than synchronously
before it. Preserve exact saved-node/ancestor restoration, deliberate external
focus, active-scope/tree handoff, owner-document routing, cancellable restore
notification and synchronous focus inside the eventual restoration frame.

Exact implementation writes:

- `packages/solidaria/src/focus/FocusScope.tsx`
- `packages/solidaria/test/FocusScope.test.tsx`

The 2026-10-08 owner fallback approval and 2026-10-09 cross-lane release
instruction authorize this bounded assignment through the current RC repair.
ROOT retains the sole tracked writer/committer seat under the temporary direct
worker fallback verified in `/tmp/ui-direct-fallback-owner-verification-20261009.json`.
Private direct medium Sol work prepares/reviews only. Runtime, browser and
build work use the conductor's serialized slot after custody is released.
The owner's release instruction preserves every proof gate.

Supporting writes:

- `.changeset/focusscope-deferred-restoration-ownership.md`, a patch intent for
  `@proyecto-viviana/solidaria`; wording describes the repaired behavior without
  claiming native certification.
- `.claude/tickets/tasks/645-respect-active-focus-ownership-in-deferred-scope-restoration.md`
- `.claude/current/status.md` and `.claude/current/roadmap.md`, generated only.

Attribution must be reviewed and checked, but no attribution review JSON edit
is currently required by these two paths. FocusScope has explicit
`packages/react-aria/src/focus/FocusScope.tsx` markers and the matching full
2020 Adobe Apache header; the mapping script classifies this as an exact
upstream mapping, not reviewed-local. None of
`scripts/attribution-local-reviews.json`, `scripts/attribution-headerless-reviews.json`
or `scripts/attribution-composite-reviews.json` contains a FocusScope localPath.
Do not create an unmarked-local hash exemption or refresh unrelated entries.
If actual attribution output identifies a required additional file, name the
finding and obtain bounded scope before editing it.

The starting packet is `/tmp/ui-dialog-focus-causal-draft-20261009/`:
`focus-causal.patch`, `REVIEW.md`, `HASHES.json`, complete before/candidate
copies. At preparation, both current implementation paths match the manifest's
before hashes. Recheck at application; reject unexplained drift.

Do not remove Dialog.tsx's competing restoration fallback, change Select's
pointer/virtual-click initial-focus contract, alter global modality,
weaken existing tests, rewrite timing helpers, add dependencies/public APIs,
or change compiler/config/style/fixture/native-driver source in this task.
The four observed Dialog/Picker failures are not all attributed to this draft.

## Done when

1. Two added owning regressions decisively fail with authentic OLD FocusScope
   and pass with candidate source under the identical full owning test bytes.
   Retain all original tests and assertions; save original-suite results too.
2. A containing child mounted after its parent receives focus, blurs to body,
   and queues parent then child containment callbacks. Execute only genuinely
   queued, uncancelled callbacks. Parent callback does not focus the child;
   child callback restores the original child input exactly once. Actual OLD
   execution confirms the draft's callback count/order rather than assuming it.
3. With keyboard modality, a restoring scope loses focus to body and is removed
   instantly. Its trigger is untouched before timer/frame execution, restored
   once by the next scheduled frame, and not restored again on later drain.
   Preserve original trigger identity and detached-input proof.
4. Complete existing FocusScope, owner-document, Dialog and Popover suites pass
   together on final source, including #593 parent/child teardown protections,
   #274 instant Popover restore and normal Modal Escape restore. Existing
   deliberate external focus and cancellation behavior remain green.
5. Relevant scheduler compatibility, fresh full SSR followed by full hydrate,
   typecheck, attribution/layer checks, solidaria build and docs checks pass,
   or a genuinely unrelated inherited failure is isolated with actual baseline
   evidence and retained as debt. Final diff review accepts exact source and
   test bytes. No completion claim relies on old ticket counts.
6. Record current native qualification separately. Unit green does not certify
   trusted Escape keydown/keyup order, leaving-dialog bounce, exit-animation
   behavior or the Picker selected-option journey. Only an actual measured
   unchanged native run supports those claims. Preserve any remaining failures
   for their owning bounded successors; no waiver, skip or reduced inventory.

## Proof

When ROOT owns the runtime slot, first install ONLY the new owning test bytes
against manifest-bound OLD source. Run the complete existing file, without a
filter, and preserve raw output, exit status, new-test RED reason and all
original-suite outcomes:

```sh
node_modules/.bin/vp test run packages/solidaria/test/FocusScope.test.tsx --maxWorkers=1
```

Then apply the two-line product repair (frame-time shouldContainFocus guard,
removal of synchronous tryRestore call only), verify candidate identity and
run the identical complete command. No query narrowing or changed expected
ordering to conceal a product regression. If OLD is not causally red, diagnose
before asserting that this draft qualifies; new scope needs named admission.
The explicit test clock tracks cancellation IDs, restores spies in finally,
and never replaces focus with a no-op or replays cancelled callbacks.

Run the complete unchanged compatibility owners on candidate:

```sh
node_modules/.bin/vp test run packages/solidaria/test/FocusScope.test.tsx packages/solidaria/test/FocusScopeOwnerDocument.test.tsx packages/solidaria-components/test/Dialog.test.tsx packages/solidaria-components/test/DialogTriggerDebug.test.tsx packages/solidaria-components/test/Popover.test.tsx packages/solid-spectrum/test/Dialog.test.tsx packages/solid-spectrum/test/Popover.test.tsx packages/viviana-ui/test/Dialog.test.tsx --maxWorkers=1
node_modules/.bin/vp test run packages/solidaria/test/runAfterTransition.test.ts packages/solidaria/test/runAfterPaint.test.ts packages/solidaria/test/focusSafely.test.tsx packages/solidaria/test/createDialog.test.tsx --maxWorkers=1
node_modules/.bin/vp test run --config vitest.ssr.config.ts --maxWorkers=1
node_modules/.bin/vp test run --config vitest.hydrate.config.ts --maxWorkers=1
node_modules/.bin/vp run typecheck
node_modules/.bin/vp run guard:layer-boundary
node_modules/.bin/vp run guard:attribution-headers
node_modules/.bin/vp run build:solidaria
node_modules/.bin/vp run docs:generate
node_modules/.bin/vp run docs:check
```

Use fresh candidate SSR outputs immediately before hydrate; capture diagnostics,
deferred verification and cleanup. Run scoped format/lint according to current
Vite Plus tooling, then independently review the final source/test diff. Do
not include pre-existing output fixtures or unrelated edits in the commit.

Read actual pinned upstream before source acceptance:
`react-spectrum/packages/react-aria/src/focus/FocusScope.tsx`, containment
callback around 427–450 and restoration around 774–838. Current
`scripts/upstream-pin.json` records S2 1.7.0 / RAC 1.21.0 at
`f56660b234bd588751c9f35b85d6fe6e17e45ccf`; bind the actual oracle identity.
Preserve the runtime's applicable behavior rather than importing React hook
mechanics. Upstream evaluates shouldContainFocus inside rAF and schedules
restore-only cleanup. Local restoreFocusToElement must continue dispatching
its cancellable event and focusing synchronously when that frame executes;
removing that helper's synchronous action would change the intended scope.

Native proof belongs to the serialized comparison lane on an exact final
candidate. Its unchanged Dialog D4 event/focus tests must measure key order,
callback counts and original-trigger restoration and reject a transient
trigger→leaving-dialog→trigger bounce. Do not treat the Popover surface spec as
trigger restoration proof: its authored scope expressly excludes D4/D5 trigger
behavior. Reuse the actual current trigger journey/harness and record its
exact command after locating it; any new native test/fixture path needs a
named test-only extension. #537's full `vp run comparison:test:certified` and
required accessibility checks remain the release qualification, with live
inventory rediscovery and #194 evidence integrity. No browser execution or
native result is claimed by this prepared ticket.

Save actual HEAD, before/candidate/source/test/patch hashes, commands, raw
RED/GREEN logs, elapsed times, diagnostics, cleanup and unresolved gates in
`/tmp/ui-focusscope-successor-result-20261009.md`. ROOT records only observed
results in the owning ticket and integrates one bounded implementation commit.

## Relationship

Child of initiative #531; source prerequisite for #537 recertification and
#194 current-revision evidence, not a child of either task (the general scheme
permits task→initiative→milestone hierarchy). Successor to #593's already
verified active-scope repair; do not rewrite its historical proof. Retain
#18 scheduling and #274 instant Popover restoration, and #555's distinction
between bounded overlay fixes and unmeasured full native verification.

Picker selected-option semantics and Dialog fallback diagnosis remain separate
owners. #542 honest hydration verification, all other foundation/build and
packaging gates, and the full-release checks remain required. Rollback is the
two implementation paths plus this changeset; retain RED evidence and the
new owning tests when diagnosing a rollback rather than deleting safeguards.
This task neither closes #531/#537/#194 nor authorizes a new writer seat.

## Actual local continuation returns — 2026-10-09

Actual whole owning OLD withdrawal control returned40PASS/2FAIL, exit1, with two named causal regressions: a parent containment frame refocusing an active containing child, and restoring lost-to-body focus in the scheduled frame after instant removal. Candidate tests and harness stayed conserved; exact candidate production was restored and owned processes closed. Receipt: /tmp/ui-focusscope-old-owning-baseline-v4-runtime-return-20261009.json; named raw output: /tmp/ui-focusscope-old-owning-baseline-v4-proof-20261009/whole-focusscope-old-baseline.raw.log. The restored candidate subsequently passed all 42 owning cases. The complete 12-file direct-consumer invocation returned 202PASS/9FAIL (211 cases), exit1: five requestAnimationFrame-await timeouts and four Popover restoration/unmount failures. It completed without invocation timeout; all 2140 bound inputs were conserved and owned processes were empty. Receipt: /tmp/ui-focus-candidate-direct-proof-20261009/01-focus-candidate-and-direct-consumers.return.json (SHA256 27e6ea6ffd6ce551ca22a21f20c91a8b9c9145476626e42883328b880cc9fdd8). The owning causal repair is supported, but full consumer compatibility remains RED and native browser certification remains pending.

## Direct-consumer failure diagnosis and proposed teardown repair — 2026-10-09

Independent installed-source review found that Vitest4.1.11 retains individually restored spy callbacks until restoreAllMocks. In the shared vmThreads window, file-end restoration therefore replays the new rAF spies after useRealTimers uninstalls their fake clock, leaving consumers queued on an abandoned clock. This matches the actual five frame-await timeouts and four frame-dependent Popover failures following the owning Focus file; it does not require a production scheduler change.

The reviewed private repair adds only vi.restoreAllMocks() after fake-timer draining and before vi.useRealTimers() in the Focus owning teardown. Every131 current expectation line, case and callback remains unchanged; production Focus source is unchanged. Proposal: /tmp/ui-focus-owning-timer-teardown-repair-20261009/source.patch, SHA256eb99889fa06d0c5b90ab43256f4b576fd08e456b549a6ee51d7ddb1949d4e0d5. The same complete12-file211-case assay and180-second bound must actually pass before consumer green is claimed. At this checkpoint the teardown repair remains unapplied and unrun.

### Focus direct-consumer qualification — 2026-10-09

The one-line teardown repair now restores all spies before switching fake timers
back to real timers. The unchanged twelve full owning/direct-consumer files passed
211 cases, including all 42 FocusScope cases, with exit 0 and no timeout. The
previous nine direct-consumer failures no longer reproduce in this assay.
Assertions, production Focus code, pool and runtime bounds were retained. Solid's
flush-in-effect warnings remain recorded; this result does not close native
Dialog D4 or Picker D13 certification.

Actual return: `/tmp/ui-focus-teardown-direct-proof-20261009/01-focus-teardown-and-direct-consumers.return.json`,
SHA256 `dbbd4a1328aedd86b787faf8671d8556804611686bda46be0e9bece189156954`.
The tool session completed with exit 0; owned closure is established, no owned
process remains and all 3,477 bound post-application inputs are conserved.

### Final actual qualification appendix — 2026-10-11

Fresh authentic controls at published E `a2ccaf10885edadfd41ffc2d10c2e65fdad2ca58` satisfy Done clauses 1–3: identical full owning tests returned OLD 40PASS/2 causal FAIL and restored current 42PASS/0FAIL. The failures are the parent containment callback taking active child ownership and instantaneous removal restoring before the scheduled frame. Original trigger/input identity, real queued callback ordering, cancellation and later-drain assertions remain. Fresh witnesses: `output/qualification-evidence/ui-645-authentic-old-current-owning-control-proof-20261011/01-authentic-old-whole-focus-scope.return.json` and `02-restored-current-whole-focus-scope.return.json`, with corresponding complete raw logs and `ROOT-CLOSED-STAGE-01-REVIEW.json` / `ROOT-CLOSED-STAGE-02-REVIEW.json`. The latter SHA256 is `488b8bd339241245b0fb418a7317f1191ee86ffe2b80f6de6cc91a1b4e0114e5`; it records exact source and natural-state restoration, physical closure and conserved bindings. This replaces no historical witness.

Clauses 4–5 are supported by accepted original full27/full22 qualification at C′ `d8b57f49d2ee93453f4ac4120e1543a4245a55c1`: `output/qualification-evidence/ui-rangeslider-viewport-repaired-full-qualification-proof-20261011/ROOT-FULL-QUALIFICATION-REVIEW.json`, the actual seal, and `26-full-root-release-readiness.raw.log`. The whole unit invocation includes existing FocusScope, owner-document, Dialog/Popover and scheduler compatibility suites together (8276PASS plus one expected failure). Fresh full SSR is 141PASS, root hydrate 141PASS, comparison SSR 9PASS and comparison hydrate 178PASS. Typecheck, attribution/layers, solidaria build and docs retain their original accepted gates. These are aggregate outcomes, not invented per-file counts; the independent O7/S15 accepted successors remain separate actual witnesses. Production focus source is unchanged between qualified C′ and E.

Clause 6 has separate unchanged native evidence: the same Q proof's `09-click-locator-whole-native-input.return.json` / raw log (3PASS) and `10-focus-picker-owning-certification-native-input.return.json` / raw log (80PASS; zero failed/skipped/waived/flaky), plus accepted fresh B8 `output/qualification-evidence/ui-rangeslider-viewport-repaired-eight-certified-runtime-proof-20261011/complete-merge-archive/certified-summary.json`. Dialog D4 records the ordered real-key open/Escape/restore cycle (`apps/comparison/e2e/certified/dialog.certified.spec.ts`, trigger scenario); Picker records selected-option roving and both D13 journeys. Dialog/Picker D2 measures normal/reduced-motion entry and actual dismissal cleanup: it is not a separate exhaustive exit-animation freeze assay. Do not expand these bounded results into all-component port certification.
