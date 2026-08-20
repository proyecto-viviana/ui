---
id: 78
type: task
title: "Publish the qualified version commit"
created: 2026-08-20
parent: 30
status: next
history:
  - { state: next, at: 2026-08-20, note: "migrated from legacy task release-train-unjam" }
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

## Done when

The approved PR is merged, the Release run uses the same SHA, and all five npm
versions and provenance records are verified.

## Relationship

Replaces `release-train-unjam` from `.claude/current/tech-debt.md`.
