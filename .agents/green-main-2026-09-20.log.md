# Make main green — 2026-09-20

`vp run ci:release-readiness` and `vp run ci:site` must exit 0 on a clean tree.
One commit per slice, proof recorded here.

## Now

Chain `ci:release-readiness`, step `build` -> `build:web`. Four errors, all the
same: `createResource` is not exported by `solid-js@2.0.0-rc.9`. Solid 2
removed it and the four admin panels still call it. That port is a behaviour
decision, not a mechanical repair — see **Left red**. Nothing after `build` in
either chain has been reached yet.

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

Commit: `377b559c`

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

## Slice 2 — #545, the TanStack Solid 2 line

`apps/web` pinned `@tanstack/solid-router` 1.170.29, `@tanstack/solid-start`
1.168.46, `@tanstack/router-core` 1.171.26. Bumped router and start to the
owner-approved `2.0.0-rc.8`, and `router-core` down to `1.171.22`, which is the
exact version `@tanstack/solid-router@2.0.0-rc.8` and
`@tanstack/start-plugin-core@1.171.34` both depend on — pinning 1.171.26
alongside them would install two copies.

`2.0.0-rc.8` peers `solid-js: ">=2.0.0-0 <3.0.0"`, which is what the ticket
needed. `@tanstack/router-plugin@1.168.30` demotes `vite-plugin-solid` to an
*optional* peer, where 1.168.34 had it as a hard dependency.

The major broke nothing in `apps/web`'s own router usage: no route definition,
locale rewrite, head/meta or server-entry change was needed. What it uncovered
instead was app source still on Solid 1 APIs, which the old pin had been
masking (the build used to die earlier, at `"./web" is not exported`).

`Suspense` -> `Loading`, three files (`routes/__root.tsx:2,122`,
`routes/solid-spectrum/playground.tsx:2,1284,1304`,
`components/playground/advanced-sections.tsx:1,1045,1053`). Verified, not
guessed: Solid 2's `Loading` carries the docstring
`@description https://docs.solidjs.com/reference/components/suspense`
(`node_modules/solid-js/types/client/flow.d.ts:246`), and this repository
already made the same swap in `apps/comparison/integrations/solid/island.mjs:1,10`.
No `Loading` identifier collided in the three files. `__root.tsx` had already
been ported to Solid 2's `Errored`; only `Suspense` was missed.

Commit: `SLICE2HASH`

Proof — `vp run build:web`. Before, the build died on the router; after, the
router resolves and the only remaining errors are the four `createResource`
call sites, i.e. every `Suspense` site now compiles:

```
Build failed with 4 errors:
[MISSING_EXPORT] "createResource" is not exported by ".../solid-js@2.0.0-rc.9/node_modules/solid-js/dist/solid.js".
```

`vp run guard:deploy-target` and a browser pass over the three routes are still
owed; they cannot run until the build completes.

## Left red

### `createResource` in the four admin panels — a behaviour decision

`apps/web/src/app/admin/AdminPage.tsx:1,24,25`,
`DocsPanel.tsx:1,35,82,94`, `ArchitecturePanel.tsx:1,7`,
`GlossaryPanel.tsx:1,14`. Solid 2 removed `createResource`. I did not port it,
because the faithful replacement is not mechanical. Evidence, from probes run
against the installed `solid-js@2.0.0-rc.9`:

- The **read** side has a verified faithful form. A bare async
  `createMemo` is *not* one: reading it while pending throws `NotReadyError`,
  so today's `<Show when={docs()} fallback={...}>` would throw instead of
  rendering its fallback. With `{ loadingValue: undefined }` the read returns
  `undefined` while pending, which is exactly `createResource`'s contract at
  these call sites (they only call the accessor; none reads `.loading` or
  `.error`). `latest()` also throws `NotReadyError` while pending.
- The **refetch** side is unverified. `AdminPage` and `DocsPanel` rely on
  `refetch`. Solid 2's documented successor is `refresh()`
  (`@solidjs/signals/dist/types/signals.d.ts:534`, whose own example is an
  async `createMemo` behind a Reload button). In four probes I could not get
  `refresh()` to re-invoke the memo's fetcher — the call count stayed at 1
  every time, including with an explicit observer and with `flush()`. A
  version-signal dependency (`version(); return fetchDocs()`) did not re-invoke
  it either. My probes ran outside a render root and may well be the thing at
  fault rather than `refresh()`; what I can say is that I could not prove the
  port preserves behaviour, and the admin Reload buttons depend on it.

Deciding this needs the app actually rendering — a loading-boundary design for
each panel and a check that Reload still refetches. That is the behaviour work
this seat was told not to invent. It blocks `build:web`, and so blocks the rest
of both chains.

### `vp exec pnpm peers check` cannot go clean by bumping

After slices 1 and 2 one unmet `solid-js` group remains, and every member of it
is a transitive of the rc.8 line itself, not anything this repository declares:
`@solid-devtools/logger|debugger|shared` (a hard dependency of
`@tanstack/solid-router@2.0.0-rc.8`), eleven `@solid-primitives/*`, and
`vite-plugin-solid` + `babel-preset-solid` + `solid-refresh` (auto-installed
optional peers under `@tanstack/router-plugin`). All still declare Solid 1
peers upstream.

`pnpm-workspace.yaml:85` already sets `peerDependencyRules.allowedVersions`
with `solid-js: "*"`, and `pnpm peers check` reports these anyway; only names
listed under `allowAny` appear to be suppressed. Adding `solid-js` to
`allowAny` would silence the check rather than satisfy it, so I did not: it
would also hide a genuine Solid 1 dependency we introduced ourselves, which is
precisely what slice 1 found. This needs the owner's call.

### Minor drift, not repaired

`pnpm-workspace.yaml:44-55` still lists the superseded TanStack versions under
`minimumReleaseAgeExclude` (1.170.29, 1.168.46, 1.171.26 and friends). Harmless
— install and the lockfile supply-chain check both pass — but stale. Left alone
to keep this commit scoped to the bump; it is a one-line follow-up.
