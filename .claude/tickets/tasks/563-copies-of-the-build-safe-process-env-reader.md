---
id: 563
type: task
title: "Eleven copies of the build-safe `process.env` reader sit beside a helper that already does it"
created: 2026-09-20
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "found while fixing #555 item 10. `dom.ts:617` was the only bare `process.env` left in `packages/*/src`, and the style files survive their own declaration build only because each carries its own hand-written globalThis cast. Copies of one idiom, next to `solidaria/src/utils/env.ts`, whose stated reason for existing is that idiom",
    }
  - {
      state: open,
      at: 2026-09-20,
      note: "conductor: count corrected from six to eleven before the ticket was worked. The six style files are the copies the fix found; `image/` and `statuslight/` in both styled twins, and `solidaria-components/src/Collection.tsx`, carry the same cast in its NODE_ENV-only shape — the ticket's own quoted comment names two of them. Counted with `grep -rl 'globalThis as.*process?:' packages/*/src`: twelve files, eleven casts plus the helper. Renamed off `563-six-copies-…` at the same time: the scheme fixes only the `id` prefix, so a slug that carries a measured number goes stale the first time the measurement is refined. This one carries none",
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

The comment itself says it mirrors two more sites, and it is right: five further
files carry the same cast in its `NODE_ENV`-only shape, so the count is eleven,
not six.

```ts
const nodeEnv = (globalThis as typeof globalThis & { process?: { env?: { NODE_ENV?: string } } })
  .process?.env?.NODE_ENV;
```

- `solid-spectrum/src/{image,statuslight}/index.tsx` and both `viviana-ui` twins
  — four files, each gating a dev-only `console.warn`.
- `solidaria-components/src/Collection.tsx:321` — the same, gating the
  deprecation warning for `<Section>`, and written without even the
  `typeof globalThis &` half.

Counted with `grep -rl "globalThis as.*process?:" packages/*/src`: twelve files,
eleven hand-written casts plus the helper. Meanwhile
`packages/solidaria/src/utils/env.ts` already reads the environment safely —
`import.meta.env` first, then the same `globalThis.process?.env` — and exports
`isTestEnv`, `isDevEnv` and `isProdEnv`. Its header says it exists to keep
direct `process.env` references out of source. The styled packages cannot reach
it: it is not exported from solidaria's public surface, and they are downstream
of solidaria in the chain but the helper is private to it.

So the choice is one of two, and the ticket is to make it once rather than a
twelfth time:

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

One environment reader serves all the sites that need one, all **eleven**
hand-written casts are gone — `grep -rl "globalThis as.*process?:" packages/*/src`
returns only the file the survivor lives in — `vp run build` still exits 0 end
to end, and any behaviour difference between the two readers is stated where the
survivor lives.

The two shapes differ in what they read, so check both when you pick a winner:
the style files take the whole `env` record, the five others take `NODE_ENV`
alone and compare it against `"production"`. `isDevEnv()` already answers the
second question, and answers it differently — it consults `import.meta.env.DEV`
first, so under Vite it can return `true` where a bare `NODE_ENV !== "production"`
would also return `true` but for a different reason. Say which is intended
rather than assuming they agree.
