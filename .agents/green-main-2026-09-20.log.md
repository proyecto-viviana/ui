# Make main green — 2026-09-20

`vp run ci:release-readiness` and `vp run ci:site` must exit 0 on a clean tree.
One commit per slice, proof recorded here.

## Now

Chain `ci:release-readiness`, step `build` -> `build:web`. One error, and it is
upstream, not ours: `@tanstack/solid-start@2.0.0-rc.8` imports
`parseServerFunctionUrl` from `@solidjs/web/server-functions/server`, and
`@solidjs/web@2.0.0-rc.9` does not export that name. See **Left red**. Every
`apps/web` source error `build:web` reported is now fixed; this is the only one
left, and no source change can reach it. Steps after `build` are being run
individually and recorded.

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

Commit: `dd634d36`

Proof — `vp run build:web`. Before, the build died on the router; after, the
router resolves and the only remaining errors are the four `createResource`
call sites, i.e. every `Suspense` site now compiles:

```
Build failed with 4 errors:
[MISSING_EXPORT] "createResource" is not exported by ".../solid-js@2.0.0-rc.9/node_modules/solid-js/dist/solid.js".
```

`vp run guard:deploy-target` and a browser pass over the three routes are still
owed; they cannot run until the build completes.

## Slice 3 — the rest of the apps/web Solid 2 port

Four mechanical repairs, one commit each, all of them a renamed or moved API
rather than a behaviour change.

- `d7bcadf5` — finished the half-applied import codemod over 17 files:
  `JSX` moved from `solid-js` to `@solidjs/web`, `onMount` -> `onSettled`.
- `7e1bf524` — six effect callbacks braced to return `void`. Solid 2 types an
  effect callback as `void | (() => void)`, where a returned function is a
  cleanup, so `onSettled(() => setMounted(true))` was passing `true` as a
  cleanup. Sites: `components/ThemeCreator.tsx:64`,
  `components/showcase/GlasselatedShell.tsx:26`,
  `components/theme/ColorKnob.tsx:35`, `routes/admin.tsx:27`,
  `routes/solid-spectrum/docs/components/table.tsx:23`, `routes/theme.tsx:66`.
- `574dfad2` — three duplicate `class` attributes merged into Solid 2's array
  form (`gridlist.tsx:113,178`, `admin/DocsPanel.tsx:129`). A prior codemod had
  turned Solid 1's `classList` into a second `class` attribute instead of
  merging, which is `TS17001`. Solid 2 types `class` as
  `ClassValue | RemoveAttribute` and its own docstring gives the array idiom
  `["card", props.class, { active: isActive() }]`
  (`@solidjs/web/types/jsx.d.ts:896-908`).

Proof — `vp run typecheck:apps` error count, in order: 45 -> 28 -> 22 -> 11.

## Slice 4 — the four admin `createResource` panels

Ported on the conductor's written decision,
`.agents/green-main-2026-09-20.decision-createResource.md`, committed here with
its probe. The decision is right and my earlier reading was wrong: my probes had
used a three-argument `createMemo(source, fetcher, options)`, so `loadingValue`
was silently dropped and the first read threw. `createMemo` is
`(compute, options)`.

Proof — `node .agents/green-main-2026-09-20.refresh-probe.mjs`, re-run here
against the installed `@solidjs/signals@2.0.0-rc.9`:

```
initial read (pending): undefined
after settle: a:1 calls 1 seen [null,"a:1"]
after refresh: resolved a:2 read a:2 calls 2 seen [null,"a:1","a:2"]
during source change: a:2
after source change: b:3 calls 3 seen [null,"a:1","a:2","b:3"]
fire-and-forget refresh: b:4 calls 4
```

So `refresh(memo)` does re-invoke the fetcher, `await refresh(memo)` resolves
with the new value, and the first read is `undefined` rather than a throw. The
form applied, at all four sites:
`createResource(f)` -> `createMemo<T | undefined>(() => f(), { loadingValue: undefined })`,
`refetch()` -> `refresh(x)`. `DocsPanel`'s source form keeps its skip: the
compute is not `async`, it reads `props.openPath` and returns
`path ? fetchDoc(path) : undefined`. `refresh()` is the idiom in Solid 2's own
docs for exactly this (`@solidjs/signals/dist/types/signals.d.ts:525-534`,
whose example is `<button onClick={() => refresh(user)}>Reload</button>`).

Also in this commit: `DocsPanel.tsx:41` — the `createEffect` effect arm braced
to return `void`, same class as `7e1bf524`.

Proof — `vp run typecheck:apps`: 11 errors, none of them in
`src/app/admin/`. Before this commit there were 16, the five extra being the
four `createResource` imports and the effect arm. `grep -rn createResource
apps/web/src/` is empty.

Browser pass: unverified in browser. The admin route is dev-only and
`build:web` does not complete (see **Left red**), so Reload and Save were not
exercised live.

## Left red

### `build:web` — `@tanstack/solid-start@2.0.0-rc.8` against `@solidjs/web@2.0.0-rc.9`

This is the one thing between here and a green `build:web`, and it is a break
between two upstream packages. Not repairable from this repository's sources.

```
[MISSING_EXPORT] "parseServerFunctionUrl" is not exported by
  ".../@solidjs+web@2.0.0-rc.9/node_modules/@solidjs/web/server-functions/dist/server.js".
  ╭─[ .../@tanstack/solid-start/dist/esm/server-functions-handler.js:4:90 ]
```

Evidence:

- `@solidjs/web@2.0.0-rc.9`'s `server-functions/server` export list has
  `parseServerFunctionActionUrl` and `serverFunctionActionUrl`, and no
  `parseServerFunctionUrl` (`server-functions/dist/server.js:2665`). rc.9
  renamed it.
- `@tanstack/solid-start@2.0.0-rc.8` still imports the old name, while
  declaring `"@solidjs/web": ">=2.0.0-rc.6 <3.0.0"` — a range that includes the
  rc.9 it cannot load.
- `npm view @tanstack/solid-start versions` ends at `2.0.0-rc.8`. There is no
  later release to bump to.

The two repairs I can see are both out of this seat's bounds: pin
`@solidjs/web` back to an rc that still exports the name (a repo-wide framework
downgrade, and `solid-js@2.0.0-rc.9` is pinned alongside it), or patch the
upstream import. Both are owner calls. `guard:deploy-target` and the browser
pass for #545 stay owed behind it.

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
