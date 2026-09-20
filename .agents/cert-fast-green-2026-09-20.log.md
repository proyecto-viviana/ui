# cert-fast-green — log

Brief: `.agents/cert-fast-green-2026-09-20.task.md` (conductor, 2026-09-20
15:30). Goal: `vp run guard:attribution-headers` exits 0. Third writer, main
checkout, local commits only.

## Measured first

`node scripts/report-attribution-mappings.mjs --check-headers` → exit 1.

```
Scanned 1742 TS/TSX files; 103 independent mappings still require review.
Exact-source header contracts: mismatch 1, satisfied 471
Reviewed exact mappings without Adobe source headers: satisfied 12
Reviewed composite source sets: satisfied 75
Reviewed local source: mismatch 63, satisfied 191
[generated-unresolved] × 11 ui-icons
```

64 `[mismatch]` lines: 63 reviewed-local hashes plus one exact-source header,
`packages/solid-stately/src/data/createTreeData.ts`. The handoff's counts hold.

## Slice 1 — 63 reviewed-local hashes

The contract (`localReviewContract`) is satisfied only when the file's status is
`unmarked` and `sha256(content)` equals the recorded `contentSha256`. A mismatch
says the file moved since a human read it; it is not by itself an upstream
claim.

Every one of the 63 was checked against the revision whose blob hashes to the
recorded `contentSha256` — all 63 revisions were found in history, so none was
re-hashed blind; each diff was read from that revision to HEAD. What the drift
actually is:

- **36 files — one import line.** The 35 `packages/viviana-ui/src/icon/pixel-icons/Pixel*Icon.tsx`
  and `packages/solid-spectrum/src/icon/icons/GitHubIcon.tsx` move
  `import { type JSX } from "solid-js"` to `import type { JSX } from "@solidjs/web"`.
- **Solid 2 API migration in our own code.** `splitProps` moving to
  `@proyecto-viviana/solidaria/utils`; `<Ctx.Provider>` → `<Ctx>`;
  `ErrorBoundary` → `Errored` with an `Accessor<unknown>` fallback
  (`story-utils/ErrorBoundary.tsx` in both styled packages);
  `Dynamic` from `@solidjs/web`; `data-*` through `dataAttr`;
  `JSX.RemoveAttribute` widening the slot type in
  `solid-spectrum/src/button/spectrum-context.ts`.
- **Owned-write reactivity.** `solid-stately/src/utils/reactivity.ts` gains
  `createInternalSignal` (`ownedWrite: true`) plus a live mirror and `readNow`;
  `solidaria/src/focus/createAutoFocus.ts`, `createFocusRestore.ts`,
  `createVirtualFocus.ts` and `solidaria/src/disclosure/createDisclosureGroup.ts`
  move onto `onSettled` / `onOwnedCleanup` and that mirror pattern.
- **Module surface.** `solid-stately/src/utils/index.ts`,
  `solidaria/src/index.ts`, `solidaria/src/utils/index.ts` add re-exports
  (`splitProps`, `bindCapture`/`captureRef`, `onOwnedCleanup`, the `domAttrs`
  helpers).

None of the 63 drifts carries upstream-derived content: every hunk is Solid 2
migration or a re-export of our own modules, so no port and no ticket is owed
and the classification (`local-module-surface` / `local-solid-helper`) is
unchanged. One entry, `packages/viviana-ui/src/switch/index.tsx`, is a `mirror`
of our own `packages/solid-spectrum/src/switch/index.tsx` — the same single
import line on both sides.

Re-hashed all 63 in `scripts/attribution-local-reviews.json`; nothing else in
the file changed (63 insertions, 63 deletions). After the slice: reviewed local
source satisfied 254, mismatch 0.

## Slice 2 — the one exact-source header

`packages/solid-stately/src/data/createTreeData.ts`. The header was not missing:
the Solid 2 spike (`ca1a0d82`, #532) inserted
`import { createInternalSignal } from "../utils";` as line 1, above the Adobe
block, and `attributionHeaderContract` requires the block plus the port line to
prefix the file body (after an optional `// @ts-nocheck`). Moved that one import
below the header and its docblock; an ES import hoists, so the module behaves
identically. Header text and port line untouched.

After the slice: exact-source header contracts satisfied 472, mismatch 0.

## Green

`vp run guard:attribution-headers` → exit 0.

```
PASS: 472 exact-source headers match their upstream blocks and port lines.
PASS: 12 reviewed exact mappings remain headerless and match their recorded source evidence.
PASS: 75 reviewed composite mappings match their recorded upstream source sets.
PASS: 75 composite headers preserve every distinct upstream block and exact source path.
PASS: 254 reviewed local files match their recorded content.
```

The 11 `generated-unresolved` ui-icons print under "files that need special
attention" but are not one of this guard's five contracts — they never held the
exit code. Step 4 of the brief is taken up next on its own terms.

## Now

The guard is green. Remaining: the 11 `generated-unresolved` ui-icons
(brief step 4), which the attribution guard reports but does not gate.
