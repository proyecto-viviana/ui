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

## The tag, decided by the conductor on 2026-09-20

Steps 1 and 5 above cannot both be run as written, and the audit found it before
this seat did (`.agents/audit-2026-09-20/lens3-consumer.md`). Stock Changesets
has **one** `tag` field and it drives both halves:

- `@changesets/assemble-release-plan/dist/index.mjs:72` —
  `version += \`-${preInfo.state.tag}.${preVersion}\``. The pre-mode tag is the
  version suffix.
- `@changesets/cli/dist/getPublishPlan.mjs:574-576` —
  `getReleaseTag(publishedState, preState, tag)` returns `preState.tag`. The
  same string is the npm dist-tag.
- `@changesets/cli/dist/publish.mjs:61-63` — passing `--tag` while in pre mode
  is a hard error, `Releasing under custom tag is not allowed in pre mode!`

So `pre enter rc` gives `0.7.0-rc.0` on dist-tag **`rc`**, and `pre enter next`
gives `0.7.0-next.0` on dist-tag **`next`**. Step 1 asks for the first, the Done
when asks for the second, and neither command produces both.

**Decision: `pre enter rc`, then point `next` at the published versions as a
separate step.** That is the only reading under which this ticket's own Done
when is satisfiable, and it keeps both halves of the owner's words — `-rc.N`
prereleases, installed with `@next` — instead of trading one away. The flow:

1. `changeset pre enter rc`, commit `.changeset/pre.json`.
2. `release:prepare`, `changeset publish` — lands each package on `rc`.
3. `npm dist-tag add <pkg>@<version> next`, once per in-scope package.

`latest` cannot move by accident here: `getPublishPlan.mjs:599` only forces
`latest` when `publishedState === "only-pre"`, which requires every published
version to be a prerelease of this tag, and all five already have a non-pre
`latest` (0.5.2 / 0.5.0 / 0.6.0 / 0.7.0 / 0.7.0).

### The debt this creates, and it must not be paid by hand

Step 3 is outside Changesets, so `changeset publish` moves `rc` on every
subsequent RC and leaves `next` pointing at `-rc.0` forever. A dist-tag that
silently stops tracking is the same failure as #571, #572 and #573, one release
further out and visible to strangers rather than to us. So step 3 belongs in
`release:npm` or behind a guard that reads `npm view <pkg> dist-tags` and fails
when `next` and `rc` disagree — not in a runbook sentence. Whoever takes this
ticket owns that, and "we remembered to run it" is not an acceptable answer.

### Rejected

- **`pre enter next`.** One command, nothing to forget, `@next` works — but the
  published version reads `0.7.0-next.0`, and both this ticket and initiative
  #544 say `-rc.N`. A version string is a public name and is owner-steered; this
  seat will not mint a different one to save a step.
- **`pre enter rc` alone.** Honest and simple, and it fails this ticket's Done
  when: `npm install @proyecto-viviana/ui@next` stays `ETARGET`.

## Relationship

Child of #544. Sibling of #443, which still owns `latest` and keeps #537's
zero-failure bar. Leaving prerelease mode is #443's work.
