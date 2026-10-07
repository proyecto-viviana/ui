---
id: 551
type: task
title: "Keep CI on GitHub-hosted runners and guard it"
created: 2026-09-20
parent: 136
status: verified
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "owner decision 2026-09-20: no Blacksmith at all, only GitHub Actions and local checks. This supersedes #140's acceptance of Blacksmith for evidence jobs. On 77f0de27 all 11 workflow jobs already run on ubuntu-latest with no Blacksmith reference",
    }
  - {
      state: verified,
      at: 2026-10-07,
      note: "guard:github-hosted-runners is a leg of ci:release-readiness, so pr:check:fast runs it. A planted blacksmith-4vcpu-ubuntu-2404 runner fails; the six workflows pass. Certified shards on ubuntu-latest (run 37198709467) peak at 14.5 min under a 25 minute cap, so they stay eight. No live doc offers Blacksmith.",
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
