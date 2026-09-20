# Brief — #555 item 10: `build` cannot emit solidaria's declarations

Conductor, 2026-09-20. Item 9 (`ef21edf4`) is reviewed, verified and pushed —
`test:hydrate` terminates in 12.4s, 28 files, 99 tests, and the two named tests
pass by name. Good work, and the reverted-plus-regenerated-artifact proof was
better than what I asked for.

With the writer idle I took the three legs that were still unwalked. The first
one is red, and like item 9 it belongs to this ticket.

## What the leg does

`vp run build` fails 36 seconds in, at the second package:

```
~/packages/solidaria$ tsc -p tsconfig.build.json
src/utils/dom.ts(617,43): error TS2591: Cannot find name 'process'.
```

Full log: `.agents/chain-walk-2026-09-20/leg-build.out.txt`.

## Why it is item 6's

`dom.ts:617` came in with `e6384f37` (item 6, `openLink`):

```ts
isWebKit() && isMac() && !isIPad() && process.env.NODE_ENV !== "test"
```

That is a faithful copy of upstream's `openLink.tsx` — the copy is not the
mistake. The mistake is that it is the **only** bare `process.env` in
solidaria's source, and this package already has a helper whose stated reason
for existing is to prevent exactly it. `src/utils/env.ts:1-3`:

> These avoid direct references to `process.env` which can cause TypeScript
> issues in browser environments.

And the helper you want is already written, four lines above the one we do use,
and has **no callers anywhere in `packages/*/src`**:

```ts
export function isTestEnv(): boolean {
  return getEnvVar("NODE_ENV") === "test";
}
```

`env.ts` imports nothing, so pulling it into `dom.ts` cannot widen the
`dom.ts` ↔ `focus.ts` cycle that #558 records.

## Why typecheck was green and build was red

Worth reading before you treat this as a flake, because both of us reported a
green typecheck in good faith and both were right:

- `tsconfig.typecheck.json:7` sets `"types": ["node"]`, and
  `packages/solidaria/tsconfig.json` extends it. So `vp run typecheck` sees
  `process`.
- `packages/solidaria/tsconfig.build.json` extends the **root** `tsconfig.json`
  instead, with no node types — correctly, because the published declarations
  must not assume Node.

So the two configs disagree on purpose, and `build` is the only leg that reads
the strict one. `build` was never walked this shift, which is how item 6 landed
and was pushed red. I reviewed and pushed it, so that is mine.

## What to do

1. Use the helper: `!isTestEnv()` in place of `process.env.NODE_ENV !== "test"`.
   Keep the upstream comment and the WebKit link above it as they are.
2. **Then run `vp run build` all the way through.** It stops at the first
   package, so everything after solidaria — components, kumo, geist,
   solid-spectrum, viviana-ui, `guard:package-artifacts` — is unproven, not
   proven green. If more reds are behind this one, log each and fix only the
   ones of the same kind; anything larger, tell me and leave it.
3. One question to answer with evidence rather than a guess: `process.env`
   also appears in `solid-spectrum/src/style/{runtime,style-macro,spectrum-theme}.ts`
   and the `viviana-ui` twins. Do those survive their own `tsconfig.build.json`?
   If they do, say why in the log (different config, or excluded from emit). If
   they do not, they are part of this item. Do not add a guard until step 2 has
   told us how many sites there really are — a guard written against one example
   is the third copy waiting to happen.

## Done when

- `vp run build` exits 0 end to end, `guard:package-artifacts` included.
- The red-then-green proof this ticket asks for is the build itself: record the
  failing `tsc -p tsconfig.build.json` line on the old source and the green run
  on the fix. If a unit test can carry it instead, better — but do not invent a
  test that only re-asserts what the compiler already decides.
- A changeset, and the `.agents/audit-defects-555-2026-09-20.log.md` section in
  the shape you have been writing.

Commit on its own. I will review and push, then take `typecheck:apps` — which
reads the `dist/*.d.ts` your build writes, so it is blocked behind this — and
the journeys driver. Those three are the last of the nineteen legs, and item 1
of the queue closes when they are green or each red owns a named ticket.
