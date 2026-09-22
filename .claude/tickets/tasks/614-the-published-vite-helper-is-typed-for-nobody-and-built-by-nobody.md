---
id: 614
type: task
title: "The published Vite helper is typed for nobody and built by nobody"
created: 2026-09-22
parent: 32
status: open
history:
  - {
      state: open,
      at: 2026-09-22,
      note: "opened from the README proof at public-face `eb7d533a` (`.agents/` receipt owed by #590's chain walk; measurement in the conductor's `measure-545.md`, section `README examples at eb7d533a`). The consumer harness type-checked every README fence against the packed tarballs; `packages/viviana-ui/README.md:122` fails with TS2769: `Type 'MacroPlugin' is not assignable to type 'PluginOption'`. `vivianaMacros()` (`packages/viviana-ui/src/vite.ts:94`) returns a local structural `MacroPlugin` whose `transform`/`resolveId`/`load` are typed `unknown`-returning with `this: unknown`, so Vite 8 rejects it inside `plugins: []` while the runtime build passes (`vite build --ssr` of the same README config exits 0). Nothing in this repository would have caught it: `grep -rln vivianaMacros apps packages --include=*.ts --include=*.mts` finds no vite config — `apps/web/vite.config.ts:5-90` and `apps/comparison/astro.config.mjs:9,144-` each carry their own copy of the same macro-CSS wrapper, so the exported one is the third copy and the only one never built. Its own doc comment (`src/vite.ts:23`, `:33`, `:92`) still tells consumers to pair it with `vite-plugin-solid`, the Solid 1 plugin that #548 removed from the READMEs at `eb7d533a`.",
    }
---

## Scope

`packages/viviana-ui` only. Make `@proyecto-viviana/ui/vite` usable from a
consumer's `vite.config.ts` as documented: `plugins: [vivianaMacros(), solid({ ssr: true })]`
must type-check against the tarball's `dist/vite.d.ts` under `strict`,
`moduleResolution: bundler`, `skipLibCheck`. Three items, nothing else:

1. Type the return so Vite accepts it. The comment at `src/vite.ts:47-55` chose
   a self-contained shape so `dist/vite.d.ts` needs no rolldown types; keep that
   goal but make the shape assignable to Vite's `Plugin` (Vite is already a
   peer of every consumer that calls this helper; a type-only import of `Plugin`
   from `vite` is not a new dependency). If a type-only import is the answer,
   say so in the comment and drop the "no vite type imports" sentence.
2. Make `apps/web/vite.config.ts` consume the helper instead of its own copy,
   so an in-repo build exercises the exported code path. The Astro copy in
   `apps/comparison/astro.config.mjs` runs two build passes with shared macro
   state (its comment at `:418`); leave it and name it in the note as the
   remaining twin, or fold it if the same helper serves it unchanged.
3. Fix the doc comment: `@solidjs/vite-plugin` (Solid 2), not
   `vite-plugin-solid`, at `src/vite.ts:23`, `:33`, `:92`.

Non-goals: no new public name, no change to what the macro wrapper does at
runtime, no README edits (public-face owns them; the README block is right
once the type is).

## Done when

A consumer `vite.config.ts` that pastes `packages/viviana-ui/README.md:122`'s
block verbatim type-checks against the packed tarball with exit 0, `apps/web`
builds through the exported helper, and the comment names the Solid 2 plugin.

## Proof

- `VIVIANA_PACK_OUT=<dir> vp run pack:local-chain`, then in an off-workspace
  consumer with the five `file:` tarballs installed: `tsc --noEmit` over the
  README block → exit 0 (was 2, TS2769).
- `vp run build:web` → exit 0 with `apps/web/vite.config.ts` importing
  `vivianaMacros` from `@proyecto-viviana/ui/vite`; `grep -c "macros.rolldown" apps/web/vite.config.ts` → 0.
- `vp run check`, `vp run typecheck:apps`, `guard:package-sourcemaps`,
  `guard:entry-import-budget`, `guard:source-artifacts`.
- A changeset (patch, `@proyecto-viviana/ui`): `check-changeset-required` will
  demand one because `packages/viviana-ui/src` changes.

## Relationship

Parent #32 (ship correctly to installed consumers). Sibling of #548 and #549,
which fixed the same Solid 1 plugin name in the READMEs and installation pages
on `public-face` but could not touch package source. Blocks nothing on the
#547 rc path formally; the conductor's plan runs it as a main-writer lane
before the version commit because a consumer following the README hits it on
day one. Rollback boundary: one commit in `packages/viviana-ui` and
`apps/web/vite.config.ts`.
