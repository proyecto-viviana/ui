---
id: 563
type: task
title: "Six copies of the build-safe `process.env` reader sit beside a helper that already does it"
created: 2026-09-20
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "found while fixing #555 item 10. `dom.ts:617` was the only bare `process.env` left in `packages/*/src`, and the six style files survive their own declaration build only because each carries its own hand-written globalThis cast. Six copies of one idiom, next to `solidaria/src/utils/env.ts`, whose stated reason for existing is that idiom",
    }
---

## Scope

`packages/solid-spectrum/src/style/{runtime,style-macro,spectrum-theme}.ts` and
their three `viviana-ui` twins each open with the same block:

```ts
// Read process.env without depending on Node global types in the dts build
// (tsconfig.build.json omits `types: ["node"]`) — mirrors the build-safe
// globalThis cast already used in image/ and statuslight/.
const env: Record<string, string | undefined> =
  (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } })
    .process?.env ?? {};
```

The comment itself says it mirrors two more sites. Meanwhile
`packages/solidaria/src/utils/env.ts` already reads the environment safely —
`import.meta.env` first, then the same `globalThis.process?.env` — and exports
`isTestEnv`, `isDevEnv` and `isProdEnv`. Its header says it exists to keep
direct `process.env` references out of source. The styled packages cannot reach
it: it is not exported from solidaria's public surface, and they are downstream
of solidaria in the chain but the helper is private to it.

So the choice is one of two, and the ticket is to make it once rather than a
seventh time:

1. Export the reader from a package both sides already depend on, and delete the
   six copies.
2. Decide the styled packages must not read the environment at all in style
   code, and remove the reads instead of the copies.

Prefer whichever keeps the declaration build Node-free without a cast written by
hand. Note that `env.ts` has a real Vite half (`import.meta.env`), which the six
copies do not — a mechanical extraction changes behaviour under Vite, so say
which reader wins before moving code.

Once there is one implementation, a guard against a bare `process` in
`packages/*/src` becomes worth writing; #555 item 10 deliberately did not add
one, because at that point there was a single example and a guard written
against one example is the next copy.

## Done when

One environment reader serves all the sites that need one, the six hand-written
casts are gone, `vp run build` still exits 0 end to end, and any behaviour
difference between the two readers is stated where the survivor lives.
