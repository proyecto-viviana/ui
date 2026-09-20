# Make main green — 2026-09-20

`vp run ci:release-readiness` and `vp run ci:site` must exit 0 on a clean tree.
One commit per slice, proof recorded here.

## Now

Chain `ci:release-readiness`, step `guard:dependency-security`
(`vp exec pnpm peers check`). One group left, and it is #545's: the pinned
TanStack line peers on `solid-js ^1.9.10` while the workspace runs
`2.0.0-rc.9`. Next: slice 2, bump router and start to `2.0.0-rc.8`.

## Slice 1 — vestigial Solid 1 toolchain

Three root/app dependencies declared a Solid 1 toolchain nothing resolves.
Everything in this repository compiles Solid through `@solidjs/vite-plugin`.

- `unplugin-solid` (root `package.json`). No import anywhere:
  `rg "from ['\"]unplugin-solid|require\(['\"]unplugin-solid"` over the tree
  minus `node_modules` returns nothing. Its only two mentions were comments in
  `packages/solidaria/vite.config.ts:39` and
  `packages/solidaria-components/vite.config.ts:46`, and both were wrong: they
  named `unplugin-solid` as the compiler of the pre-compiled `default`
  fallback, while both files import and use `@solidjs/vite-plugin`
  (`packages/solidaria/vite.config.ts:4,78`). Comments corrected in the same
  commit. Pulled `babel-preset-solid@1.9.15` and `solid-refresh@0.7.8`.
- `@astrojs/solid-js` (`apps/comparison/package.json`). `astro.config.mjs:7`
  imports the local `./integrations/solid/index.mjs`, which is a private
  adapter over `@solidjs/vite-plugin` and merely reuses the string
  `"@astrojs/solid-js"` as Astro's renderer identity
  (`integrations/solid/index.mjs:11,14`). No file imports the package. Pulled
  `vite-plugin-solid@2.11.14` and `solid-refresh@0.6.3`.
- `esbuild-plugin-solid` (root `package.json`), found while tracing what still
  held `babel-preset-solid` after the first two removals:
  `vp exec pnpm why babel-preset-solid`. `rg "esbuild-plugin-solid"` over the
  tree minus `node_modules` and the lockfile matched only its own declaration.

Commit: `6fff43c2`

Proof — `vp exec pnpm peers check`, before and after. Before, three groups
(root, comparison, web). After, one, and it is #545's:

```
✕ unmet peer solid-js
  Installed: 2.0.0-rc.9
  Wanted:
    ^1.9.10:
      @tanstack/solid-router@1.170.29
    ^1.6.12:
      @solid-primitives/refs@1.1.4
      @solid-primitives/utils@6.4.1
    ^1.0.0:
      @tanstack/solid-start-server@1.167.35
    ^1.7.2:
      vite-plugin-solid@2.11.14
    ^1.9.15:
      babel-preset-solid@1.9.15
    ^1.3:
      solid-refresh@0.6.3
```

Proof — the packages and the app whose manifests changed still build.

```
$ vp run build:solidaria
write-package-declaration-attribution — wrote 0 runtime and 8 declaration attribution banner(s) in .
$ vp run build:components
write-package-declaration-attribution — wrote 0 runtime and 0 declaration attribution banner(s) in .
$ vp run --filter @proyecto-viviana/comparison build
11:54:18 [build] ✓ Completed in 19.19s.
11:54:18 [build] 91 page(s) built in 19.70s
11:54:18 [build] Complete!
```

## Left red

Nothing yet.
