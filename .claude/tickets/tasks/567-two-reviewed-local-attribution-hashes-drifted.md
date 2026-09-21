---
id: 567
type: task
title: "Two reviewed-local attribution hashes drifted, so guard:attribution-headers is red on main"
created: 2026-09-20
parent: 544
status: in-progress
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "found by the conductor on the first Certification Gates run after the workflow was re-enabled (run 35544700944, push at e0ccb27e). The ladder got fourteen steps deep - typecheck, ts-nocheck budget, guard failure contracts, lint, test:ssr, test:hydrate all green - and stopped here. Reproduced locally at HEAD: `node scripts/report-attribution-mappings.mjs --check-headers` EXIT=1, `Reviewed local source: mismatch: 2, satisfied: 252`",
    }
  - {
      state: next,
      at: 2026-09-20,
      note: "handed to the close-gates writer after #566 merged. No brief file: this ticket is the brief, and the one rule that matters is under `## Work` - read the diff against the reviewed content before re-pinning, and say in the ticket that you did. The gate is red on main at `4d882ff1`, so this is the first thing between here and a green ladder",
    }
  - {
      state: in-progress,
      at: 2026-09-20,
      note: "re-attested, and the diff was read against the content the hashes were pinned to rather than against today's file. Both pinned hashes reproduce the two files exactly at `e6384f37^` (915f4ecb\u2026 and 692e2517\u2026), which is what makes `git diff e6384f37^ HEAD` on those paths the whole delta since the review and not one commit's worth of it - and that delta is the four lines under `## The diff, in full`, verbatim. Both files are barrels listing this repository's own module names; the addition re-exports `openLink`, already declared in `utils/dom.ts`, and the type alias beside it. No upstream-derived text entered either file, so the recorded classification `local-module-surface` still holds and this is the same review re-pinned, not a new one. Hashes replaced by hand to f6faae18\u2026 and 9e644b51\u2026, the shape of `d1de1207`. `vp run guard:attribution-headers` EXIT=0: `254 reviewed local files match their recorded content`, mismatch 0, and the other four contracts unchanged at 474/12/75/75. `guard:publish-drift` EXIT=0, no changeset owed. Evidence `.agents/close-gates-2026-09-20.log.md`",
    }
---

## Scope

`scripts/attribution-local-reviews.json` pins a SHA-256 of each file reviewed as
independently authored. Two entries no longer match their file:

```
report:attribution-mappings — attribution contracts are incomplete:
Reviewed local source:
- [mismatch] packages/solidaria/src/index.ts
- [mismatch] packages/solidaria/src/utils/index.ts
```

Both drifted in one commit, `e6384f37` ("#555: open links by dispatching a
click, and keep one openLink") — the same commit whose root-barrel import
became #565, and one this seat reviewed and pushed. Ours, not a found
condition.

## The diff, in full

Four added lines, both files barrels:

```diff
 packages/solidaria/src/index.ts
+// `solidaria-components`' `RouterProvider` re-exports this rather than keeping a
+// second copy of it.
+export { openLink, type LinkModifiers } from "./utils";

 packages/solidaria/src/utils/index.ts
   openLink,
+  type LinkModifiers,
```

## Work

Re-attest both hashes, the way `d1de1207` re-attested `createFocusRestore`
under #555 item 8.3. The judgement the re-attestation carries, stated so the
next reader does not have to redo it: a barrel's content is a list of this
repository's own module names, the delta is one comment, one re-export and one
type re-export, and nothing upstream-derived entered either file. The
`reviewed-local` classification still holds.

Do not re-hash by running the tool blind. Read the diff against the reviewed
content first and say in the ticket that you did — a hash re-pinned without
reading it is an attribution claim made on no evidence, and attribution is the
one contract in this repository that is a legal matter and not a taste one.

## Done when

`vp run guard:attribution-headers` exits 0, and the ticket records the diff that
was reviewed.

## Relationship

Child of #544. Caused by `e6384f37` under #555, like #565. Sibling of #568,
which is why this sat unseen: `guard:attribution-headers` is one of the 28
blocking gates absent from `ci:release-readiness`.

## What was read

The hash is evidence only if what it was pinned to is known, so the check ran
against that content and not against the current file alone:

| file                                    | pinned      | = sha256 at `e6384f37^` | re-pinned to |
| --------------------------------------- | ----------- | ----------------------- | ------------ |
| `packages/solidaria/src/index.ts`       | `915f4ecb…` | yes                     | `f6faae18…`  |
| `packages/solidaria/src/utils/index.ts` | `692e2517…` | yes                     | `9e644b51…`  |

Because both pinned hashes reproduce the parent of `e6384f37` exactly,
`git diff e6384f37^ HEAD` on those two paths is the entire delta since the
review, and it is the four lines quoted under `## The diff, in full`, verbatim.
Both files are barrels: their content is a list of this repository's own module
names. The added lines re-export `openLink`, declared in `utils/dom.ts`, and the
type alias beside it. No upstream-derived text entered either file. The
`local-module-surface` classification still holds, so this is the same review
re-pinned — the shape `d1de1207` used — and not a new attestation.

## Noticed, not done

#565 narrowed `RouterProvider.tsx` onto `@proyecto-viviana/solidaria/utils`, so
the root-barrel re-export this commit added at `src/index.ts:713` may now have no
consumer. Removing it moves a hash again, and it is not this ticket.
