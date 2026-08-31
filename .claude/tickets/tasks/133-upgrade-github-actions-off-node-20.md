---
id: 133
type: task
title: "Upgrade GitHub Actions off the Node.js 20 runtime"
created: 2026-08-21
status: open
history:
  - {
      state: open,
      at: 2026-08-21,
      note: "opened from the Node.js 20 deprecation annotation on successful Release run 32489037398",
    }
---

The release succeeded, but GitHub forced three pinned actions from their
declared Node.js 20 runtime onto Node.js 24. The warning applies to every
workflow that uses these pins.

## Evidence

Release run `32489037398`, job `96792111816`, reported these actions:

- `actions/checkout@11d5960a326750d5838078e36cf38b85af677262`
- `actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020`
- `pnpm/action-setup@b906affcce14559ad1aafd4ab0e942779e9f58b1`

The same pins occur in Certification Gates, Changesets, Release Readiness,
Release, and Site Gate.

## Work

- Read the official action releases and manifests before selecting versions.
- Keep each action pinned to a full commit SHA.
- Update all five workflows together.
- Confirm that the selected actions declare a supported runtime.
- Run the required pull-request gates and inspect their annotations.
- Confirm on the next safe Release run that the warning is absent. Do not
  trigger a package publication only to test this warning.

## Done when

All affected workflows use reviewed full-SHA pins. Required checks pass, and a
Release run has no Node.js 20 action-runtime warning.

## Relationship

This is follow-up workflow maintenance. It does not reopen verified release
ticket #78 or release initiative #30.
