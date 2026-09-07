---
id: 448
type: task
title: "Merge PR #33 and publish the six packages"
created: 2026-09-03
parent: 443
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed as the merge → same-SHA gates → regenerated #32 → publish slice of the 2026-09 train",
    }
---

Push the branch, land three PR checks green, owner-gate merge #33,
same-SHA `Certification Gates` + `Release Readiness` + `Site Gate` on
main, Release workflow regenerates #32, owner-gate merge #32, verify
`npm view` for the six packages.

## Evidence

PR #33 `audit-2026-09-round-2` head `87da0f75`. Pending 83 changesets
for the six public packages. Publish and merge are owner-gated.

## Done when

The Release run is green and the versions are visible on the registry.

## Relationship

Child of #443. Depends on #444–#447 landing first where they block
gates.

## VisualMode release handoff request — 2026-09-06

Cross-repository [VisualMode #9168](../../../../visualmode/visualmode/.claude/worktrees/voxel-editor-delivery/.claude/tickets/tasks/9168-unify-editor-visuals.md)
is waiting to consume and measure the supported UI closure. Its
[registry/source research](../../../../visualmode/visualmode/.claude/worktrees/voxel-editor-delivery/.claude/vivianastack/editor-visuals/research.md)
observed official npm latest `@proyecto-viviana/ui@0.6.3`, published
2026-08-21, with no newer official artifact containing #485's Provider fix
at `fa7d78d62e8829e2fb22f37a1ff75fbdabdc4955`. The installed version
therefore cannot supply that source correction. #487 carries the consumer
request for the remaining component imports; #225 owns separate cost evidence.

When the authorized release is ready, provide immutable supported package
versions and integrity digests for the exact UI dependency closure, its
source revision, and release evidence. VisualMode will consume that closure
and measure all client JS assets against its 480,000-byte Brotli gate while
retaining the controls listed in #487. Producer source/local checks and
release evidence do not establish that consumer gate's result.

This is a linked request on the existing release task, not publication
authorization. #443's no-push/train hold and owner-gated publication remain
in force; no lifecycle or Done-when change is requested.
