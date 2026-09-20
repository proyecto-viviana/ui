---
id: 551
type: task
title: "Keep CI on GitHub-hosted runners and guard it"
created: 2026-09-20
parent: 136
status: open
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "owner decision 2026-09-20: no Blacksmith at all, only GitHub Actions and local checks. This supersedes #140's acceptance of Blacksmith for evidence jobs. On 77f0de27 all 11 workflow jobs already run on ubuntu-latest with no Blacksmith reference",
    }
---

## Scope

1. Record the supersession on #140 and in any live doc that still offers
   Blacksmith as an option.
2. Add a blocking guard that fails when a workflow's `runs-on` names anything
   but a GitHub-hosted runner, or when a workflow references Blacksmith.
3. Check that the certified shards fit GitHub-hosted limits without it, and
   reshard if they do not.

## Done when

The guard runs in `pr:check:fast`, fails on a planted Blacksmith runner, and
passes on the tree. No live document offers Blacksmith.

## Proof

The guard's red run on the planted case, its green run on the tree, and a
search of the live docs.

## Relationship

Child of #136. Supersedes the runner part of #140.
