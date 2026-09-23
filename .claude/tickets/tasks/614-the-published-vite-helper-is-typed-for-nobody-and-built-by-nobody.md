---
id: 614
type: task
title: "The published Vite helper is typed for nobody and built by nobody"
created: 2026-09-22
parent: 32
status: done
history:
  - {
      state: open,
      at: 2026-09-22,
      note: "opened from the README proof at public-face `eb7d533a` (`.agents/` receipt owed by #590's chain walk; measurement in the conductor's `measure-545.md`, section `README examples at eb7d533a`). The consumer harness type-checked every README fence against the packed tarballs; `packages/viviana-ui/README.md:122` fails with TS2769: `Type 'MacroPlugin' is not assignable to type 'PluginOption'`. `vivianaMacros()` (`packages/viviana-ui/src/vite.ts:94`) returns a local structural `MacroPlugin` whose `transform`/`resolveId`/`load` are typed `unknown`-returning with `this: unknown`, so Vite 8 rejects it inside `plugins: []` while the runtime build passes (`vite build --ssr` of the same README config exits 0). Nothing in this repository would have caught it: `grep -rln vivianaMacros apps packages --include=*.ts --include=*.mts` finds no vite config — `apps/web/vite.config.ts:5-90` and `apps/comparison/astro.config.mjs:9,144-` each carry their own copy of the same macro-CSS wrapper, so the exported one is the third copy and the only one never built. Its own doc comment (`src/vite.ts:23`, `:33`, `:92`) still tells consumers to pair it with `vite-plugin-solid`, the Solid 1 plugin that #548 removed from the READMEs at `eb7d533a`.",
    }
  - {
      state: done,
      at: 2026-09-22,
      note: "vivianaMacros() returns a structural Vite 8 plugin. vite is not a peer. The eb7d533a README block type-checks against packs-614 (exit 0; old tarballs exit 2, TS2769). apps/web builds through the helper. The in-repo README fence still imports vite-plugin-solid.",
    }
  - {
      state: done,
      at: 2026-09-22,
      note: "w-ci81. Certification Gates run 35803106919 at 81affe37 failed guard attribution-headers. Reproduced at HEAD beea4cb0, which is that commit plus #617. 22:06 vp run guard:attribution-headers exit 1. Reviewed local source mismatch 1, satisfied 253, and the only named file is packages/viviana-ui/src/vite.ts. Cause: 260c4ffe rewrote that file and left scripts/attribution-local-reviews.json contentSha256 on the previous bytes. 22:11 git show 260c4ffe^:packages/viviana-ui/src/vite.ts | sha256sum printed 48863d33e04622a1a35d241136b91dfa224ae957e6a938f6f6e1ab1a88071cfc, the stored hash. 22:11 git show 260c4ffe:packages/viviana-ui/src/vite.ts | sha256sum and sha256sum of the working tree both printed 3348180bebe9d9af94cad3a8e6c67e6b4945cb1b6a3d00a914332c1d6576583b. git log -- packages/viviana-ui/src/vite.ts shows no commit after 260c4ffe. Re-review of that diff: comments and the structural MacroPlugin hook types only. The module is still the local rolldown-vite wrapper around unplugin-parcel-macros. 22:06 rg -n -i adobe|react-aria|react-spectrum|kumo|@react-|spectrum packages/viviana-ui/src/vite.ts printed nothing. Classification stays local-module-surface. Fix: that entry's contentSha256 only, now 3348180bebe9d9af94cad3a8e6c67e6b4945cb1b6a3d00a914332c1d6576583b. w-614 ran guard:attribution (scripts/check-package-attribution.mjs), which does not hash this review. 22:06 after the hash, vp run guard:attribution-headers exit 0, reviewed local source satisfied 254. 22:06 vp run guard:attribution exit 0. 22:09 vp fmt --check on the review json and this ticket exit 0, 2 files. 22:09 vp lint on those two paths exit 1, No files found to lint, 0 files; neither path is a lint target. 22:10 vp run check exit 0, 4477 formatted, 3214 lint-clean, tsc pass. No package source changed, so no changeset. 22:12 vp run docs:generate exit 0; .claude/current/roadmap.md and .claude/current/status.md stayed unstaged. 22:12 vp run docs:check exit 0.",
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

## 2026-09-22

`vite` is not a peer of `@proyecto-viviana/ui`. `packages/viviana-ui/package.json`
`peerDependencies` names `@solidjs/web`, `solid-js`, and optional
`unplugin-parcel-macros`. No `import type { Plugin } from "vite"`. The return
is a structural `MacroPlugin`: required `name`, hook results that are subsets
of Vite 8's results, `this: unknown`, `options?: object`, and no string index
signature. `dist/vite.d.ts` imports neither vite nor rolldown.

`apps/web` does not alias `@proyecto-viviana/ui` to source (aliases are `@`
and `~` to `./src`). `exports["./vite"]` already points at `dist/vite.js` and
`dist/vite.d.ts`, so the app was left on that export. `apps/web/vite.config.ts`
calls `vivianaMacros()` in the old wrapper's plugin slot. The helper body is
unchanged. `build:web` exited 0, so the web copy's cache-first `load` and
try/catch were not folded in. The helper already strips `?tsr-split=`; the
deleted web copy did not.

The remaining twin is `apps/comparison/astro.config.mjs`. It calls
`macros.raw()` (line 303) and serves cache-first (comment at line 414) because
Astro's client and server passes share unplugin's asset map. Not edited.

On this tree `packages/viviana-ui/README.md:122` is
`noExternal: ["@proyecto-viviana/ui"]` inside the fence at lines 111-125, and
that fence still imports `vite-plugin-solid`. The block the ticket measured is
the public-face `eb7d533a` fence, already in the harness as
`src/snippets/viviana-ui-122.tsx` (`@solidjs/vite-plugin`, five package names,
`optimizeDeps.exclude`, `ssr.noExternal` of `/@proyecto-viviana\/.*/`). The
proof file is a `.ts` copy of that snippet. Pasting the in-repo fence fails
`TS2307` (`vite-plugin-solid` is not installed) against both tarball sets, so
it cannot show the assignability change. Public-face owns the README; it was
not edited. The comment in `src/vite.ts` keeps that fence's shape and names
`@solidjs/vite-plugin` (lines 23, 36, 119).

`docs:generate` was not run. It rewrites `.claude/current/status.md` and
`roadmap.md`, which are outside the write paths, so those generated views stay
stale. `scripts/macro-preset-smoke.mjs:31` still imports `vite-plugin-solid`.

Commands, from `/home/emoporemilio/projects/viviana-hub/ui` unless noted.
`SCRATCH` is `/home/emoporemilio/.cache/claude-tmp/claude-1000/-home-emoporemilio-projects-viviana-hub-ui/dcdf40fe-92b9-4723-a24c-d74b942d8751/scratchpad`.
`TSC` is `/home/emoporemilio/projects/viviana-hub/ui/node_modules/typescript/bin/tsc`.

- `vp run build` → exit 0. Proved: `dist/` was built before the pack.
- `VIVIANA_PACK_OUT=$SCRATCH/packs-614 vp run pack:local-chain` → exit 1.
  `scripts/scratch-dir.mjs` refused the path: not inside the temp directory
  `/tmp/vw277-s3zdl4/tmp`. Nothing was deleted. The script's build half had
  already rebuilt `dist/`.
- `TMPDIR=$SCRATCH VIVIANA_PACK_OUT=$SCRATCH/packs-614 vp run pack:local-chain`
  → exit 0. Tarballs in `$SCRATCH/packs-614`. Stage left at
  `$SCRATCH/viviana-ui-pack-stage-SbGYgy`.
- `cp -r $SCRATCH/readme-proof-eb7d533a $SCRATCH/readme-proof-614`, then the
  five `packs-eb7d533a` `file:` deps in that copy's `package.json` were
  rewritten to `packs-614`. `npm install --offline --no-audit --no-fund` inside
  `$SCRATCH/readme-proof-614` only → exit 0 (`changed 5 packages`). `@swc/core`
  postinstall was blocked by allowScripts.
- Before, same block, unchanged tarballs. Copied
  `viviana-ui-122.tsx` to `readme-122.ts` in `readme-proof-eb7d533a`, pointed
  `tsconfig.one.json` `files` at it, then
  `node $TSC -p $SCRATCH/readme-proof-eb7d533a/tsconfig.one.json --pretty false`
  → exit 2, `TS2769` (`resolveId` returns `unknown`, not assignable to
  `ResolveIdResult`). The harness `files` entry was restored to
  `src/snippets/root-80.tsx` and `readme-122.ts` was removed there.
- After: copied the same snippet to
  `$SCRATCH/readme-proof-614/src/snippets/readme-122.ts`, `files` is
  `["src/snippets/readme-122.ts"]`, then
  `node $TSC -p $SCRATCH/readme-proof-614/tsconfig.one.json --pretty false`
  → exit 0. Proved: that block type-checks against the packed tarball.
  Installed `dist/vite.d.ts` is the structural declaration and imports no vite
  types.
- In-repo fence, same consumer, `tsconfig.main122.json` over
  `src/snippets/readme-main-122.ts`:
  `node $TSC -p $SCRATCH/readme-proof-614/tsconfig.main122.json --pretty false`
  → exit 2, `TS2307` Cannot find module `vite-plugin-solid`.
- `vp run build:web` → exit 0. Proved: `apps/web` builds through
  `vivianaMacros()`.
- `grep -c "macros.rolldown" apps/web/vite.config.ts` printed `0`. grep's own
  exit is 1 when nothing matches. Proved: that file no longer calls
  `macros.rolldown`.
- `vp run check` → exit 0 (format, lint, `tsc -p tsconfig.typecheck.json`).
- `vp run typecheck:apps` → exit 0 (comparison reported 0 errors and 35 hints).
- `vp run guard:package-sourcemaps` → exit 0.
- `vp run guard:entry-import-budget` → exit 0.
- `vp run guard:source-artifacts` → exit 0.
- `vp run guard:attribution` → exit 0.
- There is no `check-changeset-required` script. `node scripts/check-changeset-required.mjs`
  (diff `origin/main...HEAD`) → exit 0, `No changed files detected` (the source
  change was still uncommitted). With `CHANGED_FILES` set to
  `packages/viviana-ui/src/vite.ts`, `apps/web/vite.config.ts`, and
  `.changeset/viviana-macros-vite-plugin.md` → exit 0, `Changeset covers every
changed package: @proyecto-viviana/ui.`
