---
id: 638
type: task
title: "Dispose Image coordinator registrations safely"
created: 2026-10-08
parent: 24
priority: high
status: next
history:
  - { state: open, at: 2026-10-08, note: "Owner added Visualmode D23." }
  - {
      state: next,
      at: 2026-10-08,
      note: "Prioritize Image removal safety in the next-RC consumer batch.",
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
