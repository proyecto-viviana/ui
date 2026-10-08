---
id: 638
type: task
title: "Dispose Image coordinator registrations safely"
created: 2026-10-08
parent: 24
priority: high
status: in-progress
history:
  - { state: open, at: 2026-10-08, note: "Owner added Visualmode D23." }
  - {
      state: next,
      at: 2026-10-08,
      note: "Prioritize Image removal safety in the next-RC consumer batch.",
    }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "Admitted a bounded Solid dev cleanup slice after #632 source acceptance at 36bf8476; native and release qualification stay open.",
    }
---

## Scope

UI owns D23. Reproduce ImageCoordinator cleanup when one row disappears in
a Solid 2 dev build, then repair the lowest actual owner in both styled
siblings. Candidate owners are `packages/solid-spectrum/src/image/index.tsx`
and `packages/viviana-ui/src/image/index.tsx`. Name exact source/test/fixture
paths before dispatch. Preserve registration keys, reveal, timeout, source
replacement and visibility. No new API, dependencies, styles or consumer edits.

The animation rejection is a separate hypothesis: current Image and Skeleton
helpers do not read finished. Capture the actual native rejection chain before
admitting its owner; do not add a promise read just to catch a hypothetical error.

## Done when

Removing a row and disposing a group cause no owned-scope write error. Survivors
still load/reveal; source and hidden-state changes unregister the correct old
key. Any reproduced owned animation rejection is repaired at its actual owner;
unreproduced claims retain their evidence limits.

## Proof

Test both styled siblings: independently keyed rows, removal before completion,
whole-group disposal, source A-to-B, hidden toggles, error and survivor reveal.
Save meaningful old-source failures. Native dev proof uses delayed completion,
actual animation, page errors and unhandled rejections without swallowing them,
plus plain-image and pinned React controls. Production silence is not dev proof.
Run owning checks and candidate gates; report published versions and installed
consumer proof. Any Skeleton repair also qualifies its other helper consumers.

## Relationship

Child of #24, prioritized by #87. Producer for Visualmode #10151/#10223.
Request: `visualmode/visualmode/.agents/ui-requests-2026-10-07/D23-image-writes-a-signal-while-it-unmounts.md`.
Pinned S2 registers/unregisters in React cleanup; adapt that lifecycle legally
to Solid. #623 is precedent, not Image proof. Browser work is serialized with
#557 and other qualification. Patch notes cover actual repaired packages;
rollback stays within registration/confirmed animation ownership. Planning
evidence: `/tmp/ui-D23-D24-triage-2026-10-08.md`.

## First unit/dev implementation admission — 2026-10-08

The preceding #632 exact generation stopped with closed=true, and its bounded
source was accepted in 36bf8476. Register `ui-638-image-codex-20261008` as the
sole OS/herdr implementer in eligible repo:ui main using
`/tmp/ui-638-dispatch-2026-10-08.md`. Record actual launch generation and base
HEAD in its result. Codex astra low handles this Solid cleanup ownership hard
slice under Decision 040 after Grok exhausted its weekly quota and AGY waited
for manual terminal approval. Retain normal workspace-write/on-request controls.
The conductor alone accepts and commits after the exact owned stop.

Exact source/test write paths:

- `packages/solid-spectrum/src/image/index.tsx`
- `packages/viviana-ui/src/image/index.tsx`
- `packages/solid-spectrum/test/Image.test.tsx`, with private twin imports.
- `.changeset/image-coordinator-safe-disposal.md`, only for an actual repair.
- This ticket and generated `.claude/current/status.md` / `roadmap.md` through
  standard tooling; `/tmp/ui-638-*` evidence.

No shared helper, Skeleton, config, fixture, style, dependency, public API,
manifest, lockfile, consumer, hash metadata or browser writes. Prove the actual
client dev runtime and meaningful old-source failure first, using captured
setters and explicit flush outside patched event dispatch. Cover both siblings'
keyed pending removal, loaded survivor reveal, whole-group disposal, source and
hidden transitions, error and timeout with plain/standalone/unchanged controls.
Preserve synchronous unregister of the captured old registration key. No
speculative animation promise handler. Save exact check receipts and digests.

This admission covers unit/dev source proof only. Native animation errors and
unhandled rejection attribution need separate actual stacks and serialized
browser admission after #557. Root typecheck, certification, installed-consumer
and release proof remain required; a partial repair does not close #638.

## Preliminary unit/dev result — 2026-10-08

At the first handoff the slice was incomplete. Both independently imported styled
twins reproduce the owned-scope-write error during keyed pending-row removal
with original source. The bounded cleanup change runs synchronous unregister
with no owner and retains the captured key. Client DEV and reactive effects
execute; the original failure stack reaches the installed signals dev runtime.

The preliminary candidate matrix passed 28 of 30 tests, including all nine existing tests.
Both hidden-transition cases failed: changing context hidden from false to true
leaves the native image in the DOM. The worker stopped source implementation
at this contradictory rendering proof rather than broadening the repair. The
hidden return assertions were then unqualified. A preliminary Show cleanup probe
did not throw; the actual For row-removal cases reproduce the exact diagnostic.
No runtime configuration, animation, shared helper or attribution metadata changed.

Exact-generation handoff, raw checks and path digests are under
`/tmp/ui-638-worker-result-2026-10-08.md` and
`/tmp/ui-638-evidence-2026-10-08.json`. Conductor review and owned stop precede
integration. Native, animation, installed-consumer and release proof remain open.

## Conductor continuation admission — 2026-10-08

The conductor explicitly continued the same owned generation and exact paths
after the 28/30 candidate result. Both modules used a static component-body
hidden return; pinned S2 evaluates its hidden return on React rerender. The
conductor admitted the minimal reactive hidden rendering repair in both
already admitted Image sources and the same test/note/ticket/generated views.
Preserve hooks, registration ownership, captured old-key cleanup, initially
hidden behavior, visible return registration, survivor reveal and source
semantics. Keep the hidden regressions and add initially hidden-to-visible
proof. No helper, style, API, configuration or path expansion; animation and
native qualification remain outside this slice. No worker commit or push.

## Final unit/dev source result — 2026-10-08

After the explicit continuation, both twins render their existing wrapper
through a reactive Show keyed by visibility. The captured-key ownerless
unregister remains synchronous; hooks stay at component scope. The full owning
Image suite passes all 32 tests, preserving the nine existing tests and adding
client-dev sanity plus independent twin lifecycle coverage. Exact launch-byte
controls fail four pending-row removal cases with the owned-write diagnostic
and two initially-hidden-to-visible cases with the image absent. Final source
passes both controls. No native image property override was needed.

Scoped formatting and lint and generated-view documentation checks are recorded
in the worker evidence. Root typecheck remains a separate blocker with errors
outside the admitted Image source/test paths; no unrelated repairs were made.
This completes the admitted unit/dev behavior work, not the whole ticket:
native animation/rejection attribution, certification, installed consumer and
release qualification remain open. The conductor owns acceptance, exact-generation
stop and integration.

## Conductor acceptance of unit/dev repair — 2026-10-08

Read the full worker handoff and independent source review. All 46 recorded
file/artifact/log digests matched; launch-source hashes matched the exact base
objects at 62c8f506. Owned stop of generation
`54fca66a-bb20-46dd-affd-2a14f57e5340` returned ok=true and closed=true.
The conductor accepts the two Image source repairs and 32 passing owning tests
for a bounded implementation commit. Scoped format/lint/docs pass; root
typecheck has 24 outside-scope diagnostics. Source/tests are unchanged after
these checks.

Native qualification must also exercise animation cancellation and target
rebinding across hidden wrapper removal/return: the component-owned loading
animation retains its target, and ref-null cleanup was not demonstrated by
these DOM tests. Independent review records this risk in
`/tmp/ui-638-independent-review-2026-10-08.md`; it proves no native rejection
chain and admits no Skeleton/helper repair. Native, full candidate, installed
consumer and release checks remain open, and this partial acceptance does not
close #638.

## Native Image qualification admission — 2026-10-08

After the preceding #639 generation is closed and its accepted proof committed,
register the sole native source worker in eligible repo:ui/main using
`/tmp/ui-638-native-dispatch-2026-10-08.md`. This proof-only admission qualifies
the accepted cleanup and hidden-rendering repair bc1dd87b. Codex astra low
handles the browser/Solid ownership hard slice under the recorded Decision 040
fallback; the conductor alone accepts and commits after exact-generation stop.

Exact new harness paths are
`packages/solidaria-components/test/fixtures/image-browser/index.html`,
`main.tsx`, and `vite.config.ts` in that same directory;
`apps/comparison/e2e/fixtures/image-react-control.js`;
`apps/comparison/e2e/image-lifecycle.browser.ts`; and
`apps/comparison/e2e/image-lifecycle.playwright.config.ts`. This ticket and
standard generated views are admitted, with /tmp/ui-638-native-* receipts.
All product sources, shared animation helpers, styles, dependencies, public API,
other configs, baselines, manifests, attribution and consumer files are read-only.
No Changeset is needed for this proof-only slice. A reproduced owner failure
returns with actual evidence before any separately bounded repair admission.

Use an isolated source-linked DEV server on strict port4480, single Chromium
worker, no retries or server reuse, reusing the existing vivianaMacros wrapper
before solidPlugin in this new config. Prove source resolution, visible macro
styles and real loading animation before interpreting lifecycle results.
The installed React S2 control resolves existing comparison dependencies;
record its actual versions/paths/hashes separately from pinned source.

Hold and release valid native image responses, retaining real Animation
references across keyed removal, source replacement, hidden wrapper return,
reveal and whole-owner disposal in both styled siblings. Compare installed
React and plain-image controls. Observe errors and passive unhandled rejections
before navigation; never mock native animation/image properties, read/catch
finished merely for this hypothesis, or swallow native errors. Shared React
behavior is an observation requiring a separate divergence decision, not an
automatic local repair. Any actual rejection needs its causal stack. Full
candidate, installed-consumer and release qualification remain open.

## Native qualification result awaiting conductor review — 2026-10-08

The isolated source-linked Chromium matrix at admission HEAD 372f0d36 finishes
22 passing cases and two failing source A-to-B cases, one per local twin.
The final assertions require the loaded survivor to remain hidden while B is
pending. A trusted native load on the retained, detached old-A image instead
reveals pending B and the survivor in both twins. Installed React retains the
barrier under the same response timing. The local target image is replaced on
source change; its wrapper and unchanged survivor retain identity. This is
actual bounded failure evidence, not authorization to repair another owner.
No product, Skeleton, helper, style, dependency or Changeset changed.

Both source twins, source macro wrapper, actual development runtime and installed
React resolution are recorded with hashes. Initial visible pending wrappers
have real running animations and macro styling; UI loads its existing source
theme and qualifies its pseudo-element shimmer. Keyed removal, initial hidden
return, response/reveal and local whole-owner cancellation pass. Pending hidden
return leaves the retained animation running on detached W1 with no replacement
wrapper animation on W2 in both twins and installed React. This shared result
requires an owner decision, not an automatic local regression repair. Installed
React pending-owner disposal retains its animation; local disposal cancels it.

All 24 cases record zero page errors, console errors and passive unhandled
rejections. No finished promise is consumed; this does not exclude other
consumer rejection paths. The exact runner owns and terminates its exclusive
4480 server. Earlier sandbox startup and harness-sanity failures remain in raw
logs. Formatting passes; scoped lint exits zero with two warnings. Root typecheck
still reports 24 outside-scope diagnostics. Hub audit is not green in this
sandbox. The handoff and detailed receipts are
`/tmp/ui-638-native-result-2026-10-08.md` and
`/tmp/ui-638-native-evidence-2026-10-08.json`. Worker generation
`c2bef12f-2851-4b1d-8941-c97f4fcd8139` awaits conductor review and exact owned stop;
full candidate, installed-consumer and release qualification remain open.

## Conductor acceptance of failing native checkpoint — 2026-10-08

Read the full handoff, exact sources and independent final review. All 191
inventoried artifact hashes, 26 admitted/protected path hashes and 990 source
graph module hashes matched disk. Exact owned stop of generation
`c2bef12f-2851-4b1d-8941-c97f4fcd8139` returned ok=true and closed=true.
The conductor accepts the six proof files as a failing diagnostic checkpoint:
22 cases pass and the two local scalar-source cases fail three coordinator
barrier assertions each. This is no native-green or closure acceptance.

Accepted artifacts are preserved, with original-to-archive hash mapping, under
`/tmp/ui-638-native-checkpoint-2026-10-08/`. Subsequent native runs must keep
this archive intact and save separate control/final receipts. Root typecheck
still has 24 outside-scope diagnostics; full candidate, certification,
installed-consumer and release proof remain open. Shared detached hidden-wrapper
animation behavior stays observational; no divergence repair is proposed or
needed to proceed with the reproduced local source defect.

## Source replacement repair admission — 2026-10-08

The proof-only native matrix reproduced a local parity failure. Both twins
replace a pending native image on scalar source A-to-B while retaining its
wrapper. A trusted load on the detached old A image then precedes premature
reveal of the still-incomplete B image and its loaded survivor. Installed React
retains the native image and holds both behind the coordinator barrier. The
conductor reviewed actual per-case snapshots, passive retained-image event
timelines and independent source analysis; animation rejection remains
unreproduced and shared hidden-wrapper animation behavior stays observational.

After the native worker's verified exact owned stop and accepted diagnostic checkpoint,
register a sole OS/herdr implementer in eligible repo:ui/main using
`/tmp/ui-638-source-replacement-dispatch-2026-10-08.md`. Codex astra low handles
this native image lifecycle hard slice under the recorded Decision 040 fallback.
The conductor alone reviews, stops the exact generation, accepts and commits.

Admit only both `packages/solid-spectrum/src/image/index.tsx` and
`packages/viviana-ui/src/image/index.tsx`; the existing twin owning
`packages/solid-spectrum/test/Image.test.tsx`; the existing
`apps/comparison/e2e/image-lifecycle.browser.ts` for strengthened scalar-source
identity assertions; `.changeset/image-coordinator-safe-disposal.md`; this
ticket and standard generated views. Other harness files and all Skeleton,
shared animation helpers, styles, API, dependencies, consumers, configuration,
baselines and attribution metadata remain read-only.

Preserve scalar image identity while updating its live source, supported
scalar/picture structural switching, source/theme rendering, existing captured
key ownerless cleanup, hidden lifecycle, error and timeout behavior. Reproduce
any obsolete-event or cached-microtask guard with focused tests before adding
it; validate the current image/request/lifecycle rather than a broad document
connection assumption. No global diagnostic suppression or speculative helper
repair. Preserve corrected native coordinator-barrier assertions and compare
the same real-response timing against React/plain controls.

Run meaningful exact-base source controls against final corrected assertions
with failure-safe restoration and candidate hash verification, then all owning
Image tests and the serialized native matrix. Save actual raw commands, errors,
event timelines and digests. Root typecheck debt and full candidate, certified,
installed-consumer and release qualification remain separately open.

## Source replacement result awaiting conductor review — 2026-10-08

Both Image twins now select scalar/picture structure through a boolean memo,
retaining the native scalar image while its src attribute updates. Native
completion checks the current image, visibility and owner lifetime. Cached
completion captures its image/key and is cancelled by effect cleanup across
source, loading and visibility changes, including A-to-B-to-A. Focused tests
reproduce detached load/error writes and obsolete queued completion before
these guards; no shared helper, style, API or configuration changed.

The owning suite passes 50 tests, retaining all 32 prior cases. Final assertions
against exact launch source fail 16 cases and pass 34; candidate restoration is
verified by SHA256 in finally. The bounded old-source native control fails both
local source cases (identity and barrier), with React/plain passing. Final
serialized native proof passes all 24 cases with real responses and animation;
all page-error, console-error and passive rejection arrays are empty. Both
local scalar images/wrappers retain identity and B/survivor remain hidden until
B loads. Shared detached hidden-wrapper animation remains observational and
unchanged. Synthetic unit events are distinct from native network proof.

Generation `e469530a-e29a-41d2-960f-fbc9be9854f6`, delivery
`4042a128-d56a-4257-bb7a-0a3b3bbadb1d`, base `0e5f42ac`.
Raw checks, controls, restoration and path/artifact hashes accompany
`/tmp/ui-638-source-result-2026-10-08.md`. The accepted native archive remains
unchanged (196 hashes verified). Root typecheck retains 24 outside-scope
errors; the hub audit fails in the sandbox. Full candidate, certification,
installed-consumer and release qualification remain open. The conductor alone
reviews, stops this exact generation, accepts and commits.

## Conductor acceptance of source replacement repair — 2026-10-08

Read the full handoff, bounded source diff and independent review. All 155
inventoried paths/receipts, 990 final source-graph file hashes and 196 preserved
native-checkpoint archive hashes match disk. All 24 final native case records
complete with empty assertion, page-error, console-error and rejection arrays.
Exact owned stop of generation `e469530a-e29a-41d2-960f-fbc9be9854f6`
returned ok=true and closed=true. Accept the bounded six-path implementation
for conductor integration: 50 owning tests pass, exact old source fails 16 of
those assertions, and the bounded native old-source control fails both local
source cases while React/plain pass. Candidate restoration hashes match.

Scoped formatting, lint and generated-view checks pass. Root typecheck retains
24 outside-scope errors; the sandbox hub audit is not green. Cached successful
bitmap completion has no separate deterministic unit regression; native current
load/reveal is covered. Shared detached hidden-wrapper animation remains an
observation, with no helper repair or rejection suppression. Full candidate,
certification, installed-consumer and release proof remain open; #638 stays
in-progress. Acceptance receipts are under `/tmp/ui-638-source-evidence/` and
`/tmp/ui-638-source-conductor-verification-2026-10-08.json`.
