---
id: 78
type: task
title: "Publish the qualified version commit"
created: 2026-08-20
parent: 30
status: in-progress
history:
  - { state: next, at: 2026-08-20, note: "migrated from legacy task release-train-unjam" }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "owner approved the release workflow; requalifying the rebased version PR head before merge",
    }
  - {
      state: in-progress,
      at: 2026-08-21,
      note: "workflow budget fix merged as 08eb8413; waiting for exact-SHA main qualification and a refreshed release head",
    }
---

Merge version PR #20 after explicit owner approval, then verify the same-SHA
release and package provenance.

## Qualified evidence

The 2026-08-09 checkpoint says PR #20 is open and mergeable. Commit
`c457fca96a671c6a75e4a944b424c20b948d195f` passed certification gates,
Changesets checks, release readiness, and the site gate. It would publish:

- `solid-spectrum@0.6.4`
- `solid-stately@0.5.1`
- `solidaria@0.4.3`
- `solidaria-components@0.5.1`
- `@proyecto-viviana/ui@0.6.3`

Merging triggers npm publication. Do not merge without explicit publish
approval. Recheck the PR head and all gates before acting because this evidence
is dated.

## Current verification

Owner approval was given on 2026-08-20. PR #20 is open and mergeable. Changesets
rebased its release commit from `c457fca96a671c6a75e4a944b424c20b948d195f`
to `d5e2bcce3b68cb0b0bb8310d41dc747df5fa674d` after `main` advanced to
`395f015eb0f154024e97e73342def2d437e814fd`. The package versions and release
file set are unchanged, but the four required checks on the new head needed
fresh approval and execution. The old green runs are not evidence for the new
head.

Fresh checks on the new head passed Changesets Check, Release Readiness, and
Site Gate. Certification Gates reached its 45-minute job limit twice. In both
runs, every earlier gate passed. The certified comparison suite passed, then
GitHub cancelled the blocking full axe audit. The retry ended after 45 minutes
19 seconds. This is a CI budget failure, not qualifying evidence and not a test
failure. Ticket #132 increases the budget without removing evidence. Do not
merge PR #20 until that fix lands and all four checks pass on the resulting
release head.

PR #30 proved the 60-minute budget on
`2a13127e1a669817770069ea75a483bc01c90e57`. All four required checks passed.
Certification Gates finished in 43 minutes 31 seconds, including the certified
comparison suite and the full axe audit. PR #30 merged as
`08eb84135b1814b656454893c2fb4bc4f0d185f0` on 2026-08-21. Qualification is now
running on that exact `main` SHA. Release PR #20 still points to the old
`d5e2bcce3b68cb0b0bb8310d41dc747df5fa674d` head. Wait for release automation
to refresh the PR, then require all four checks on the new head before merge.

Exact-SHA Release run `32437902817` passed on
`08eb84135b1814b656454893c2fb4bc4f0d185f0`. It passed the same-SHA evidence
guard and the publish-drift guard, then refreshed PR #20 to
`ea4d535322c35452425254069e1aba04208630a9`. The new PR changes only six
consumed changesets, five changelogs, and five package manifests. The manifest
versions are unchanged:

- `@proyecto-viviana/solid-spectrum@0.6.4`
- `@proyecto-viviana/solid-stately@0.5.1`
- `@proyecto-viviana/solidaria@0.4.3`
- `@proyecto-viviana/solidaria-components@0.5.1`
- `@proyecto-viviana/ui@0.6.3`

GitHub required manual approval for runs `32437933270`, `32437933271`,
`32437933249`, and `32437933251`. They were approved and are running on the
exact new head. Do not merge until all four pass.

## Done when

The approved PR is merged, the Release run uses the same SHA, and all five npm
versions and provenance records are verified.

## Relationship

Replaces `release-train-unjam` from `.claude/current/tech-debt.md`.
