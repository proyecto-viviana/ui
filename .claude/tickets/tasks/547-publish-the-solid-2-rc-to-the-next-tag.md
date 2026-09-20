---
id: 547
type: task
title: "Publish the Solid 2 release candidate to the next dist-tag"
created: 2026-09-20
parent: 544
status: open
blocked: true
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "opened under #544, blocked on #545, #139, the #194 merger and evidence slices, and #546's critical findings. Owner decision 2026-09-20: -rc.N prereleases on next, as Solid does; consumers adopt at once; certified debt may ship if named. Standing publish authority applies only after the gates below are green on one revision",
    }
---

## Scope

1. Enter Changesets prerelease mode with the `rc` tag for the five packages
   off `0.0.0`: `solid-stately`, `solidaria`, `solidaria-components`,
   `solid-spectrum`, and `@proyecto-viviana/ui`. Kumo and Geist stay at
   `0.0.0` and ignored, as [release policy](../../current/release-policy.md)
   says.
2. Write one changeset per package that states the Solid 2 requirement and the
   `@solidjs/web` peer, in the consumer's words.
3. Run the release flow on one exact revision: `vp run pr:check`,
   `vp run release:prepare`, then a certified run whose result is recorded, not
   waived. Failures that remain go to `certification-debt.md` by name.
4. Pack the chain and install it in a clean off-workspace Solid 2 consumer
   before publishing (`guard:publish-drift`, `pack:local-chain`).
5. Publish with `--tag next`. Never move `latest`.

## Done when

`npm view <pkg> dist-tags` shows `next` at the rc for each in-scope package,
`latest` is unchanged, and the clean consumer builds and renders a component
with SSR from the registry copy.

## Proof

The revision, the gate outputs, the certified summary, the dist-tag listing,
and the consumer proof, all in the session receipt and linked here.

## Relationship

Child of #544. Sibling of #443, which still owns `latest` and keeps #537's
zero-failure bar. Leaving prerelease mode is #443's work.
