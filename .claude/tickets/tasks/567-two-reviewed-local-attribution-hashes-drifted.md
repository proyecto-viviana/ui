---
id: 567
type: task
title: "Two reviewed-local attribution hashes drifted, so guard:attribution-headers is red on main"
created: 2026-09-20
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "found by the conductor on the first Certification Gates run after the workflow was re-enabled (run 35544700944, push at e0ccb27e). The ladder got fourteen steps deep - typecheck, ts-nocheck budget, guard failure contracts, lint, test:ssr, test:hydrate all green - and stopped here. Reproduced locally at HEAD: `node scripts/report-attribution-mappings.mjs --check-headers` EXIT=1, `Reviewed local source: mismatch: 2, satisfied: 252`",
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
