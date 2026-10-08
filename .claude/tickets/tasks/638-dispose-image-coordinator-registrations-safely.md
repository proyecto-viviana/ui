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
