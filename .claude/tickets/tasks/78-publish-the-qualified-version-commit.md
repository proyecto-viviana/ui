---
id: 78
type: task
title: "Publish the qualified version commit"
created: 2026-08-20
parent: 30
status: verified
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
  - {
      state: in-progress,
      at: 2026-08-21,
      note: "PR #20 merged as 0f1e1198; exact-SHA gates and Release passed; four npm records verified while solid-spectrum propagation remains pending",
    }
  - {
      state: merged,
      at: 2026-08-21,
      note: "PR #20 merged as 0f1e1198 and Release run 32489037398 published the five qualified versions",
    }
  - {
      state: verified,
      at: 2026-08-21,
      note: "all five npm integrity values and SLSA provenance records resolve to 0f1e1198 and Release run 32489037398",
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

All four PR checks passed on `ea4d535322c35452425254069e1aba04208630a9`.
Certification Gates run `32437933270` finished in 40 minutes 52 seconds and
included the certified comparison suite and the full axe audit. PR #20 merged
as `0f1e1198963c46eb3294744475e269a7c0041eb6` on 2026-08-21.

The three required `main` workflows passed on that exact merge SHA:

- Certification Gates run `32485238975` passed in 43 minutes 33 seconds,
  including the certified comparison suite and the full axe audit.
- Release Readiness run `32485238838` passed.
- Site Gate run `32485238779` passed.

Exact-SHA Release run `32489037398` passed in 2 minutes 34 seconds. Its
same-SHA evidence guard and publish-drift guard passed before Changesets
reported all five packages as published. The five annotated release tags exist
and all resolve to `0f1e1198963c46eb3294744475e269a7c0041eb6`.

The npm registry now exposes the expected version, integrity hash, tarball, and
SLSA provenance record for all five packages. A consolidated registry check
decoded each integrity value and compared it with the provenance subject. All
five values match:

- `solid-spectrum@0.6.4`:
  `8c89184ec4e8468942c312f691dcac82a92b3cad8ed0fa96ea0aba929e30f535d81652960a60dd257c9e3596332169bdcb4ab4bf903ab9eda9e35d04f0ee95ac`
- `solid-stately@0.5.1`:
  `f0056d0076c133ad20e40bae175df8e118189cd4bccee961749413bb8b0eb48e2f6edaf06cfa85c22d53c067d044949c9bd0ab020bd605e2074b309565b173c9`
- `solidaria@0.4.3`:
  `52a329ac53cf67c35f339df84742ecbe2fc7b2a52177bcb72f025cc9c9bbf84435ad2d7d61d89170255cdcbb26c35646e08d5f5f438ba5aacc6ce030a82a49ad`
- `solidaria-components@0.5.1`:
  `b0ef91661025e49835774b6bd885ab177b1f2dfeef2af60d2979ddd7f3531f4bcb3d69d535905415dd03485f02aebdfa23024923344eb488f678fb18a2792f3e`
- `@proyecto-viviana/ui@0.6.3`:
  `c5b7e752bbac2443310388aee92a757fe65f2745c1103bdd0559ee5203e020ba1b20625b00f38f412e4740f2b1fa9893fec2708ecdea6b9fc6ec7adbcce94d42`

Each provenance record names `.github/workflows/release.yml`, GitHub's hosted
runner, Release run `32489037398`, and source commit
`0f1e1198963c46eb3294744475e269a7c0041eb6`.

## Done when

The approved PR is merged, the Release run uses the same SHA, and all five npm
versions and provenance records are verified.

## Relationship

Replaces `release-train-unjam` from `.claude/current/tech-debt.md`.
