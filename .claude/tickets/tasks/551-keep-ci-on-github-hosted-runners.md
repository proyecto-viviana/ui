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

## Bounded typing qualification, 2026-10-08

Admitted source implementer generation `9d80a8a7-47d3-429f-b862-1c21a6856d23`
at base `1b11206553eaba49624f92adf2b1012d797b7250`; prior owned generation
closed in `/tmp/ui-633-resume-owned-stop-2026-10-08.json`. Owner-authorized
Codex astra fallback applies while the saved Grok and AGY quotas persist.
Admission permits only this ticket, the runner test, and conditional generated
status/roadmap views. Existing verified behavior and broader limits remain.
Conductor alone reviews, stops this generation, and commits.

The actual old-source compiler control reported 15 diagnostics, including four
TS7006 callbacks at test lines 15, 16, 17, and 30. Each now says
`problem: string`, matching the guard's returned string messages. All assertions
and the adjacent line 6 expect-error / line 7 import are preserved. The existing
12-test owning suite passes; the local guard accepts all six workflows.
The intermediate compiler run removes all four owned errors and retains 11
inherited diagnostics (eight dependency-ceilings, one upstream-test-parity,
two test-discovery). Final post-format compiler proof and exact inherited
locations are in the sealed handoff `/tmp/ui-551-worker-result-2026-10-08.md`.
Raw commands, exits, logs, source hashes, and the old-source control are bound
by `/tmp/ui-551-evidence-manifest.json` and `/tmp/ui-551-seal.json`.
This qualifies only the bounded test typing; it does not establish candidate
or release readiness, alter runner policy, or reopen prior accepted behavior.
