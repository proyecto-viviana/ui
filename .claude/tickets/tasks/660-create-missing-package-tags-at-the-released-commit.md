---
id: 660
type: task
title: "Create missing package tags at the released commit"
created: 2026-10-24
parent: 443
status: merged
history:
  - { state: open, at: 2026-10-24 }
  - { state: in-progress, at: 2026-10-24 }
  - {
      state: merged,
      at: 2026-10-24,
      note: "Missing tags are created at RELEASE_SHA; local recovery and rerun proof passed.",
    }
---

## Cause

Release run 39922440577 published rc.4 at
`d95d0fb606929fcd237128cf9c6cc7826a2128ee`, then exited 1:

```text
publish-github-releases: nothing was pushed:
  @proyecto-viviana/solid-spectrum@0.8.0-rc.4: the tag does not exist in this checkout
  @proyecto-viviana/solidaria@0.6.0-rc.4: the tag does not exist in this checkout
  @proyecto-viviana/solidaria-components@0.7.0-rc.4: the tag does not exist in this checkout
  @proyecto-viviana/ui@0.8.0-rc.4: the tag does not exist in this checkout
```

Checkout has `fetch-depth: 0`; publish passes no option disabling tags.
The locked Changesets CLI 3.0.1 calls `@changesets/git` 4.0.0's annotated
`git tag <tag> -m <tag>`. That helper returns false on failure, but
`createGitTags` ignores the boolean and reports success anyway. The workflow
sets no Git identity. An isolated repository reproduces the failed annotated
tag without identity, while a lightweight tag succeeds. Missing runner identity
is therefore the inferred underlying failure; the log hides Git's stderr and
only reports `Created git tags.`. The script's assumption that those tags must
exist turns that hidden failure into the visible failure above.

`git tag -l '@proyecto-viviana/*rc.4' -n1` shows the four names above and
`Refresh fourth release candidate certification after TreeView hydration correction`.
`git cat-file -t` identifies them as commit objects: the manual tags are
lightweight, and that text is the commit subject, not a tag annotation.

## Scope

One writer and committer: this owner-authorized Codex session on
`treeview-controlled`. Paths: this ticket, `scripts/publish-github-releases.mjs`,
its test, `scripts/fixtures/changeset-publish-rc4.txt`, `.github/workflows/release.yml`,
`.claude/current/release-policy.md`, and generated status/roadmap views.
Create missing lightweight tags explicitly at RELEASE_SHA after all validation;
retain existing tags at that SHA and existing releases. Reject conflicting tags.
No dependency, npm publication, push, remote tag, or GitHub release in this task.

## Done when

A publish-log-driven plan accepts missing tags. Apply creates them at the
released SHA before pushing and creating releases. Existing tags and releases
survive a rerun without duplication. Failed tag creation prevents any push.
The rc.4 facts produce four releases in a read-only dry run.

## Proof

Run the focused release-script tests with isolated Git repositories and fake
push/gh commands (no network); CI guard contracts; workflow pin, hosted runner,
and gate coverage guards; docs checks; changed-file format/lint checks.
Use actionlint only if already used by this repository. Record actual counts
and dry-run results before closure. Local proof does not prove provider writes.

## Relationship

Child of #443; repairs #659's unproven assumption that Changesets leaves tags.
Owner's 2026-10-24 request explicitly authorizes these paths and a commit on
this branch, extending the older TreeView-only checkout scope for this task.

Local results, 2026-10-24:

- `vp test run scripts/publish-github-releases.test.ts`: 16 tests passed.
  Both initially absent and initially present tags recover and rerun, using
  a fake publish log, real isolated Git, and intercepted push/gh commands.
  RELEASE_SHA differs from HEAD in both cases. Failed creation stops before push.
- `vp run test:ci-guard-contracts`: all contracts passed, including the
  publish-log/RELEASE_SHA/apply workflow contract.
- `guard:workflow-pins` and `guard:github-hosted-runners`: six workflows passed.
  `guard:gate-coverage`: passed (13 of 45 blocking steps run locally).
- Changed-file `vp check`: format and lint passed. `vp run docs:check`: passed.
- Read-only dry run: `RELEASE_SHA=d95d0fb606929fcd237128cf9c6cc7826a2128ee
  node scripts/publish-github-releases.mjs --publish-log
  scripts/fixtures/changeset-publish-rc4.txt` planned the four rc.4 prereleases
  at that SHA, retaining all four manual tags. The fixture is the successful
  publish block from run 39922440577, with gh's job/step columns removed.
- Actionlint is neither installed nor referenced by the repository; not run.
- No real push, npm publication, GitHub release creation, or remote tag mutation.
  Provider-write acceptance remains for the next authorized release.

The rc.4 planner also passed with `tagCommit: () => null`: four missing tags
planned at the released SHA, without mutating Git. The required hub-wide
`node vivianastack/scripts/audit/gate.mjs` reported unrelated failures in
missing VisualMode checkout paths, shared-Git eligibility declarations,
Start lists, and link inspection. These are outside this UI task's write paths.
