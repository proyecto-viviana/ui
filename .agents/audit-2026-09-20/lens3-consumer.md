# Lens 3 — The consumer install path (static)

Audit of `/home/emoporemilio/projects/viviana-hub/ui` for ticket #546, 2026-09-20.
Read-only. No build, install, pack, or test. Dist trees, if cited, may be stale.

## Coverage

Examined:

- Five publish candidates (real names from `packages/*/package.json`):
  - `@proyecto-viviana/solid-stately` `0.5.2` (`packages/solid-stately`)
  - `@proyecto-viviana/solidaria` `0.5.0` (`packages/solidaria`)
  - `@proyecto-viviana/solidaria-components` `0.6.0` (`packages/solidaria-components`)
  - `@proyecto-viviana/solid-spectrum` `0.7.0` (`packages/solid-spectrum`)
  - `@proyecto-viviana/ui` `0.7.0` (`packages/viviana-ui`)
- Every `exports` subpath vs on-disk `dist/` targets (may be stale)
- `vite.config.ts` pack layout (`solid` → `.jsx` preserve, `import`/`default` → Solid-compiled `.js`)
- Peer ranges `solid-js` / `@solidjs/web`; `node-semver@7.8.5` `satisfies()` matrix
- `rg "from ['\"]solid-js/"` under the five `src/` trees (no `solid-js/web` or `solid-js/store` leftovers)
- `.changeset/config.json`, every pending `.changeset/*.md` frontmatter, `@changesets/{cli,pre,assemble-release-plan,apply-release-plan}@3/7/8`
- `npm view` versions, dist-tags, last-tarball `exports` / `peerDependencies` / `dependencies`
- `scripts/consume-pack-smoke.mjs`, `scripts/pack-local-chain.mjs`, `scripts/check-publish-drift.mjs`, `scripts/check-entry-import-budget.ts`, `scripts/check-changeset-status.mjs`, `scripts/release-prerequisites.json`
- `.github/workflows/{release,changesets-check,release-readiness,certification-gates,site-gate,journeys-nightly}.yml`
- Five package READMEs vs the `solid` condition / plugin / `jsxImportSource` contract

Skipped:

- kumo / geist (not in the five-package RC; only noted where they contaminate the five’s publish path)
- `solidaria-test-utils` / `solid-spectrum-test-utils`
- Any `vp install` / build / pack / test (brief forbids)
- Live `changeset version` / `pre enter` (would dirty the tree)

---

### CRITICAL `changeset publish` from this tree ships Solid 2 onto `latest`

- where: `packages/*/package.json` versions already ahead of npm (`solid-stately` 0.5.2 vs npm 0.5.1; `solidaria` 0.5.0 vs 0.4.3; `solidaria-components` 0.6.0 vs 0.5.1; `solid-spectrum` 0.7.0 vs 0.6.4; `ui` 0.7.0 vs 0.6.3). Version train `a2e5220c` (2026-09-12). Solid 2 peers landed later in `ca1a0d82` / `163f4377` on those same unpublished versions. `.changeset/pre.json` does not exist. `package.json:138` `changeset:publish` = `vp exec changeset publish`. `.github/workflows/release.yml:79-88` never runs `changeset pre enter`.
- what: `changeset publish` publishes every local version that is not on the registry (`getPublishPlan.mjs:613-619`). With no pre-state, `getReleaseTag` returns `"latest"` (`getPublishPlan.mjs:574-578`). That would put Solid 2 peers (`>=2.0.0-rc.9 <3`) on `latest` as a **patch** for `solid-stately` (0.5.1 → 0.5.2) whose CHANGELOG 0.5.2 section never mentions Solid 2 (`packages/solid-stately/CHANGELOG.md:3-7`). Existing consumers of `latest` still peer `solid-js@^1.9.0` (npm tarball).
- proof: `npm view @proyecto-viviana/solid-stately dist-tags version --json` → `{ latest: "0.5.1" }`. `node -e` on each package.json `version` vs that. `ls .changeset/pre.json` → ENOENT. `git log -S '>=2.0.0-rc.9' -1 -- packages/solid-stately/package.json` → `ca1a0d82`.
- expected: an RC that a stranger installs with `@next` is a prerelease on the `next` dist-tag; `latest` stays the Solid 1 line until an explicit `changeset pre exit`. Changesets itself warns that pre mode is the only thing that redirects the tag (`publish.mjs:19-23`).
- blast radius: every current `latest` consumer of all five packages; Solid 1 apps fail peer resolution or dual-install Solid 2.

### CRITICAL `pre enter` tag is both the npm dist-tag and the `-X.N` identifier — `@next` and `-rc.N` cannot both be true

- where: `@changesets/cli/dist/pre.mjs:12` (`enterPre(packages.rootDir, options.tag)`); `assemble-release-plan/dist/index.mjs:67-73` (`version += \`-${preInfo.state.tag}.${preVersion}\``); `getPublishPlan.mjs:574-578` (publish `--tag` is `preState.tag`).
- what: `changeset pre enter rc` produces `0.6.0-rc.0` **and** publishes with `--tag rc`. `changeset pre enter next` produces `0.6.0-next.0` **and** `--tag next`. Stock Changesets has one `tag` field. After either choice, `npm view <pkg> dist-tags` today is **only** `{ latest }` — there is no `next` and no `rc`. `npm install <pkg>@next` in a fresh app is `ETARGET` until something is actually published to that tag.
- proof: `npm view @proyecto-viviana/ui dist-tags --json` → `{ latest: "0.6.3" }` (same shape on the other four). `ls .changeset/pre.json` → missing.
- expected: pick one. If the install story is `npm install <pkg>@next`, the command is `changeset pre enter next` and versions will be `-next.N`, not `-rc.N`. Document that. Do not tell consumers `@next` while publishing `--tag rc`.
- blast radius: the RC never resolves for a stranger who follows `npm install …@next`; or they get a `rc` tag they were not told to use.

### CRITICAL SSR consumers that miss the `solid` condition crash in `template()`

- where: `packages/solidaria-components/vite.config.ts:70-86` (DOM pass, `solidPlugin({ ssr: true })`, `entryFileNames: "[name].js"`); `packages/solidaria-components/dist/Button.js:16-27` (`import { … template } from "@solidjs/web"` then `var _tmpl$ = /* @__PURE__ */ template(\`<button>\`)` — dist may be stale, but the pack config emits this). Same split in `packages/solidaria/vite.config.ts:63-79`, `packages/solid-spectrum/vite.config.ts` / `packages/viviana-ui/vite.config.ts` (`PACK_PASS=dom` vs `jsx`). `scripts/consume-pack-smoke.mjs:157-171` and `265-270` state the failure: Vite SSR defaults skip `solid`, grab the DOM `.js`, and throw `"Client-only API called on the server side"`.
- what: the `solid` condition ships preserved JSX (`.jsx`) that the consumer’s `@solidjs/vite-plugin` must compile per environment. `import` / `default` ship a precompiled DOM bundle. A stranger’s Vite/SolidStart app that only `noExternal`s the package, or that uses the README, does not get `ssr.resolve.conditions: ["solid", …]` or `[...solid({ ssr: true })]`. `packages/viviana-ui/README.md:111-124` imports `vite-plugin-solid` (Solid 1 name), does not spread the plugin, and does not set the `solid` SSR condition. The other four READMEs say nothing. `jsxImportSource` `@solidjs/web` is required by `.changeset/solid-2-rc.md:9` and by Solid 2; no package README mentions it.
- proof: read `dist/Button.js:16,27` vs `dist/Button.jsx:16` (no `template`). Read consume-pack-smoke comment at 165-170. `rg jsxImportSource packages/{solid-stately,solidaria,solidaria-components,solid-spectrum,viviana-ui}/README.md` → no hits. `rg vite-plugin-solid packages/viviana-ui/README.md` → line 113.
- expected: documented consumer Vite config matching `consume-pack-smoke.mjs:157-171`, using `@solidjs/vite-plugin` and `jsxImportSource: "@solidjs/web"`. Upstream Solid 2 (`node_modules/solid-js/package.json` has no `./web`; JSX runtime lives in `@solidjs/web`).
- blast radius: any SSR/SolidStart consumer of `solidaria`, `solidaria-components`, `solid-spectrum`, `@proyecto-viviana/ui`. Client-only Vite with the official plugin is the path that happens to work.

### HIGH peer range admits 2.0.0-rc.10 / 2.0.0 / 2.1.0, but `@solidjs/web@latest` is 2.0.0-rc.0 and does not satisfy it

- where: all five `package.json` `peerDependencies`: `"solid-js": ">=2.0.0-rc.9 <3"`, `"@solidjs/web": ">=2.0.0-rc.9 <3"`. Published tarballs: `"solid-js": "^1.9.0"` and **no** `@solidjs/web` peer (`npm view <pkg>@latest peerDependencies`).
- what: `node-semver@7.8.5` `satisfies` on `>=2.0.0-rc.9 <3`:
  - `2.0.0-rc.9` YES, `2.0.0-rc.10` YES, `2.0.0` YES, `2.1.0` YES
  - `2.0.0-rc.8` no, `2.0.0-beta.1` no, `2.1.0-alpha.1` no (prerelease of a different tuple), `3.0.0` no
  Range is identical on all five. `rg "from ['\"]solid-js/"` over the five `src/` trees: **no** `solid-js/web` or `solid-js/store` leftovers; runtime JSX/`template` imports are `@solidjs/web` (Solid 2 split). `solid-js@2.0.0-rc.9` does **not** depend on `@solidjs/web` (`node_modules/solid-js/package.json:129-134`), so the `@solidjs/web` peer is a real extra install. `npm view @solidjs/web dist-tags` → `{ latest: "2.0.0-rc.0", next: "2.0.0-rc.9" }`. `2.0.0-rc.0` does not satisfy the peer. READMEs say `npm install <pkg> solid-js` — `solid-js@latest` is `1.9.15`, and `@solidjs/web` is omitted.
- proof: the semver matrix above; `npm view solid-js dist-tags` (`latest: 1.9.15`, `next: 2.0.0-rc.9`); README install blocks (`packages/viviana-ui/README.md:17-18`, `packages/solid-spectrum/README.md:12-13`, same pattern on the three headless packages).
- expected: install docs pin `solid-js@next` and `@solidjs/web@next` (or exact `2.0.0-rc.9`) until Solid 2 is `latest`. Peer range is otherwise reasonable for an RC.
- blast radius: a “fresh Solid 2 app” that installed `@solidjs/web` without `@next` cannot satisfy the peer; a README follower installs Solid 1.

### HIGH the only off-workspace consume proof is local, `--legacy-peer-deps`, and Button-only

- where: `package.json:65-69` (`pack:local-chain`, `ui:consume-smoke`, `ui:smoke`). `scripts/consume-pack-smoke.mjs`. `.github/workflows/*` — `rg ui:smoke\|consume-pack\|pack:local-chain .github` is empty. Certification Gates builds in-tree (`certification-gates.yml:207-209`) and runs `guard:entry-import-budget` on workspace `dist/`, not packed tarballs. `ci:release-readiness` (`package.json:140`) is check/build/test, no consume smoke. `Changesets Check` is `pull_request` only (`changesets-check.yml:3-5`).
- what: `consume-pack-smoke.mjs` **does** install packed tarballs into `/tmp/viviana-ui-consume-smoke`, on Solid `2.0.0-rc.9`, and runs Vite DOM + SSR (`renderToString`). That is the only such proof. Gaps: (1) never runs in CI; (2) `npm install --legacy-peer-deps` (line 226) hides the peer-range failures above; (3) the app depends on `ui` / `kumo` / `geist` Buttons only (lines 118-124, 179-187) — export-map completeness (lines 279-286) checks those three installed packages, **not** `solid-stately`, `solidaria`, `solidaria-components`, or `solid-spectrum`; (4) pins exact `2.0.0-rc.9`, so it cannot see `rc.10` / `2.0.0` / `@solidjs/web@latest=rc.0`; (5) uses vite-plus-core aliased as `vite`, not stock Vite a stranger has. `pack:local-chain.mjs:48-80` rewrites `workspace:*` to the **current workspace version** before `npm pack` — that is the publish rewrite, but only locally. `guard:publish-drift` (`check-publish-drift.mjs:83-118`) asks “did `src/` move since CHANGELOG.md with no changeset?”, not “is `package.json` version on npm?”. `check-entry-import-budget.ts` walks in-repo `dist/` graphs.
- proof: workflow grep above; smoke lines 118-124, 226, 279-286; drift script 14-21 (admits in-repo is green while off-workspace was not — the `ui@0.6.0` / `ElementTag` incident).
- expected: CI job on the release SHA that packs the five, installs without `--legacy-peer-deps`, SSR-renders at least one subpath from each of the five, and resolves every `exports` target of all five. Failure of `@solidjs/web@latest` and missing `solid` SSR conditions must be visible.
- blast radius: every consumer failure this audit names can ship with green Certification Gates / Release Readiness / Site Gate.

### HIGH `workspace:*` survives `changeset version` and becomes an exact pin at `pnpm publish`

- where: `.changeset/config.json:11-15` (`fixed: []`, `linked: []`, `updateInternalDependencies: "patch"`, no `bumpVersionsWithWorkspaceProtocolOnly` → default `false`). Five manifests: `"@proyecto-viviana/solidaria": "workspace:*"` etc. `@changesets/apply-release-plan/dist/index.mjs:174-176`: `workspace:*` / `workspace:^` / `workspace:~` are **not** rewritten in git. Changesets detect pnpm (`getPublishPlan.mjs:553-560`) and `pnpm publish` (`getPublishPlan.mjs:335-347`) replaces `workspace:*` with the dependency’s **current exact version**.
- what: after `changeset pre enter <tag>` + `changeset version`, `solidaria-components` still says `workspace:*` in git. The published tarball depends on `@proyecto-viviana/solidaria` at **exactly** `0.6.0-<tag>.0` (from current `0.5.0` + pending **minor** in `.changeset/solid-2-rc.md`). Same for `solid-stately` → `0.6.0-<tag>.0` (from `0.5.2` + minor). `ui` / `solid-spectrum` pin all three lower packages exactly. There is no `^`. A second RC (`-rc.1`) does not satisfy `-rc.0`. If any one of the five fails to publish, `npm install @proyecto-viviana/ui@<tag>` 404s on a missing exact transitive.
- proof: apply-release-plan snippet above; `incrementVersion` (`assemble-release-plan/dist/index.mjs:67-73`) + `getPreVersion` (lines 235-239: no current prerelease → `0`). Pending changeset set: `solid-2-rc.md` names all five as `minor`; every other pending file is `patch` except ignored kumo. Highest bump wins → minor.
- expected: publish all five in one `changeset publish`; do not interleave. Tell consumers they must take the whole chain (exact pins, not a mix of `latest` lower packages).
- blast radius: any partial publish; any consumer who installs `ui@next` while npm still has `solidaria@0.4.3` as `latest` (exact pin saves them from that mix, but only if the new lower versions exist).

### MEDIUM unpublished 2026-09-12 version train already absorbed breaking API; Solid 2 is not in those changelog sections

- where: `a2e5220c` “release: version 2026-09 release train holding @proyecto-viviana/ui at 0.7.0” wrote CHANGELOG `0.5.2` / `0.5.0` / `0.6.0` / `0.7.0` / `0.7.0` and never published. `packages/solidaria-components/CHANGELOG.md:7-16` (MenuButton removed; ListBoxItem/ComboBoxItem rename) lives under unpublished `0.6.0`. Solid 2 peers are not in those sections; they sit in still-pending `.changeset/solid-2-rc.md`.
- what: `changeset version` now will skip those numbers and emit `0.6.0-<tag>.0` / `0.7.0-<tag>.0` / `0.8.0-<tag>.0`. The MenuButton removal and the Solid 2 peer break therefore land in different changelog headings than the versions npm will receive, unless the version PR is edited. `guard:publish-drift` is green because pending changesets name all five (`check-publish-drift.mjs:113-118`).
- proof: `npm view` vs `package.json` version; `git show -s a2e5220c`; CHANGELOG headings vs `solid-2-rc.md`.
- expected: the RC changelog that npm shows must name Solid 2, `@solidjs/web`, `jsxImportSource`, and the SSR `solid` condition. Do not publish the unpublished 0.5.2 line as-is.
- blast radius: release notes consumers actually read; anyone bisecting “which version dropped MenuButton / Solid 1”.

### MEDIUM published `solid-spectrum` CSS `default` still points at `src/`; tree is fixed, not named in a pending changeset as a consumer fix

- where: `npm view @proyecto-viviana/solid-spectrum@0.6.4 exports` → `"./components.css": { "import": "./dist/components.css", "default": "./src/components.css" }` (same for `font-faces.css`). Tree `packages/solid-spectrum/package.json:227-239` points both conditions at `./dist/…`. `packages/viviana-ui` already published dist-only CSS strings. `files` on all five still include `src` (`package.json` `files: ["dist","src",…]`).
- what: a bundler that hits `default` on today’s `0.6.4` gets `src/components.css`, which is the same `@import "./font-faces.css"; @import "./styles.css";` as dist (52 bytes) — but `scripts/consume-pack-smoke.mjs:363-368` records the older footgun (`default` → incomplete `src` sheet). Tree is the fix. `packages/solid-spectrum/dist/theme.css` is a 64-byte comment stub (`/* Component CSS is emitted by S2 style macros during build. */`); README correctly tells people to import `components.css` (`packages/solid-spectrum/README.md:16-32`, CHANGELOG 0.6.x `71371d6`). Exporting a stub `theme.css` is still a lying subpath.
- proof: npm view vs tree exports; `wc`/read of `packages/solid-spectrum/dist/theme.css`. Dist may be stale; `vite.config.ts:166-170` copies `src/theme.css` as-is, and `src/theme.css` is that stub.
- expected: keep dist-only CSS in the RC (already true in tree). Either put tokens in `theme.css` or stop exporting it. Pending changesets do not mention the `default`→`src` repair.
- blast radius: webpack/esbuild consumers of `solid-spectrum@latest` CSS; anyone importing `./theme.css` from spectrum.

### LOW ignored kumo changeset is leftover, not a mixed-file bomb

- where: `.changeset/experimental-kumo-button.md` names only `@proyecto-viviana/kumo`. `.changeset/config.json:16-23` ignores kumo. Mixed-file throw is only skipped+not-skipped (`assemble-release-plan/dist/index.mjs:326`; `check-changeset-status.mjs:40-57`).
- what: `changeset version` will not throw. The file is dead weight. kumo/geist stay `0.0.0` and unpublished. None of the five would publish with no bump: `solid-2-rc.md` names all five, and every five-package also has patch files.
- proof: frontmatter grep of `.changeset/*.md`; ignore list.
- expected: delete the kumo-only file before version so it is not silently consumed or left forever.
- blast radius: none for the five, unless someone later un-ignores kumo with this file still present.

### LOW no `engines`, SPDX license string change, `sideEffects` CSS glob

- where: none of the five declare `engines`. Solid 2 requires `node: ">=22.12.0"` (`node_modules/solid-js/package.json:20-22`, `@solidjs/web` the same). Tree `license` is `MIT AND Apache-2.0`; npm tarballs say `MIT`. `sideEffects` is `false` on the three headless packages (no CSS entries) and `["*.css"]` on spectrum/ui.
- what: a Node 20 app can install the RC and then fail inside `solid-js`. License field tightening is accurate (each package ships `LICENSE` + `LICENSE-APACHE-2.0`) but is a registry-metadata change. `*.css` may not match `dist/*.css` for webpack’s sideEffects glob (existing on npm; not a new RC break).
- proof: `node -e` “no engines” on all five; `npm view … license`; Solid 2 `engines`.
- expected: set `engines.node` to `>=22.12.0` to match the peer. Optional.
- blast radius: Node < 22.12 consumers; license scanners.

### Manifest notes (not defects)

- Export condition order in tree is `types`, `solid`, `import`, `default` (correct). Published `solid-spectrum@0.6.4` had `solid` before `types` on several subpaths; tree fixed that.
- Every current `exports` target exists on disk in this checkout (stately 8, solidaria 213, components 273, spectrum 369, ui 149). Dist may be stale; vite/pack configs emit the matching names (`solidaria-components` barrel-derived entries; spectrum `subpathEntries` + barrel targets; style entries `.js` only).
- `solid-stately` `./private/flags/flags`: types `./dist/flags/flags.d.ts`, JS `./dist/private/flags/flags.js` — both exist; `vite.config.ts:8-9` entry is `private/flags/flags`. New vs npm (npm only exported `.`).
- New vs npm (additive, not removals): stately `./private/flags/flags` + `./package.json`; solidaria `./tokenfield`, `./virtualizer`; components `./PreviewTrigger`, `./TokenField`; spectrum +56 PascalCase subpaths; ui none. `npm view` vs tree key diff: `removed []` on all five.
- `publishConfig` is `{ access: "public" }` only — no `tag`. Tag comes solely from Changesets pre-state / `--tag`.
- `repository` / homepage / bugs look coherent.
- Internal `dependencies` stay `workspace:*` in git; runtime third-party deps (`@internationalized/*`, `@adobe/spectrum-tokens@14.15.0`, `@parcel/macros`, `csstype`) are real ranges. Published `ui` still pins `spectrum-tokens@14.0.0`; tree is `14.15.0` (baked into CSS at pack time).
- `ui` optional peer `unplugin-parcel-macros` is only needed for `style()` authoring (`README.md:127-132`); consuming prebuilt components does not need it. Spectrum has no `./vite` helper.

### `release.yml` (provenance / latest)

- where: `.github/workflows/release.yml`.
- OIDC trusted publishing: `permissions.id-token: write` (line 14), `npm install -g npm@^11.5.1` (lines 57-58), `runs-on: ubuntu-latest` (line 28, required for provenance). No `NPM_TOKEN` in the file. Matches `release-policy.md:110-118`.
- Trigger: successful `Certification Gates` on `main`, or `workflow_dispatch`. Same-SHA evidence gate (`scripts/check-release-evidence.mjs`) then `guard:publish-drift` then `changesets/action@v1.9.0` (`version: pnpm run changeset:version`, `publish: pnpm run changeset:publish`).
- Dist-tag: **whatever Changesets decides**. Not in pre mode → `latest`. In pre mode → `pre.json`’s `tag`, except `publishedState === "only-pre"` (first-ever non-pre) which is forced to `latest` (`getPublishPlan.mjs:599, 623`). All five already have non-pre `latest`, so they would stay off `latest` **only after** `pre enter`.
- Accidental `latest`: (1) run `changeset:publish` / this workflow without `pre.json` — **yes**, and the unpublished 0.5.2/0.7.0 line is sitting there waiting; (2) `changesets/action` with pending changesets first opens a version PR (does not publish); merging that PR without pre mode then publishes **stable** 0.6.0/0.8.0 to `latest`; (3) first-time packages (kumo/geist) are ignored, so they are not the `only-pre` → `latest` trap this time.

---

## Verdict

I would **not** ship an RC from this tree.

Three things to fix first:

1. **Enter pre mode with the tag consumers will type**, then version, then publish. Today there is no `pre.json`, no `next` dist-tag, and unpublished Solid 2 package.json versions. `changeset publish` as written would move `latest`.
2. **Write the consumer contract into the five READMEs** (and stop naming `vite-plugin-solid`): `@solidjs/web` + `solid-js` at `>=2.0.0-rc.9`, `jsxImportSource: "@solidjs/web"`, `[...solid({ ssr: true })]`, `ssr.resolve.conditions` including `solid`. The DOM `.js` fallback is not SSR-safe.
3. **Put `ui:smoke` (without `--legacy-peer-deps`, covering all five export maps) on the release SHA.** Nothing in CI currently installs packed tarballs off-workspace.

## Ordered checklist before `changeset publish`

1. Confirm npm `latest` on all five still equals `0.5.1` / `0.4.3` / `0.5.1` / `0.6.4` / `0.6.3`. If any unpublished tree version has already been published, stop.
2. Choose the public install tag. If the story is `npm install <pkg>@next`, run `changeset pre enter next` (versions will be `-next.0`, not `-rc.0`). Commit `.changeset/pre.json`.
3. Delete `.changeset/experimental-kumo-button.md` (ignored-only). Keep `.changeset/solid-2-rc.md` (it is the Solid 2 note that must land in the RC changelog).
4. Run `vp run changeset:version`. Expected new versions with tag `T`:
   - `@proyecto-viviana/solid-stately` `0.6.0-T.0`
   - `@proyecto-viviana/solidaria` `0.6.0-T.0`
   - `@proyecto-viviana/solidaria-components` `0.7.0-T.0`
   - `@proyecto-viviana/solid-spectrum` `0.8.0-T.0`
   - `@proyecto-viviana/ui` `0.8.0-T.0`
   Git still shows `workspace:*`. Changelog for those versions must mention Solid 2 / `@solidjs/web` / the SSR `solid` condition.
5. Patch the five READMEs: install line includes `solid-js@T` and `@solidjs/web@T`; Vite snippet uses `@solidjs/vite-plugin`, spreads `[...solid({ ssr: true })]`, sets `ssr.resolve.conditions` including `solid`, `jsxImportSource` `@solidjs/web`. Do not send people to `vite-plugin-solid` or unversioned `solid-js@latest`.
6. `vp run pack:local-chain` then a consume smoke **without** `--legacy-peer-deps`, depending on all five tarballs, SSR-rendering a subpath from each, asserting every `exports` target exists. Also probe `npm install @solidjs/web@latest` (rc.0) and confirm the failure is documented, not silent.
7. Inspect one staged tarball (`pnpm pack` in `packages/solidaria-components`): `dependencies["@proyecto-viviana/solidaria"]` must be the exact `0.6.0-T.0`, not `workspace:*` and not a caret range that could resolve `latest` 0.4.3.
8. `vp run ci:changesets` and `guard:release-prerequisites` on the versioned tree. `pre.json` still in `pre` mode.
9. Dry-run tag: `vp exec changeset publish-plan` (or the CLI equivalent) and read that every one of the five lists tag `T`, **not** `latest`.
10. Only then `changeset publish` (via `release.yml` on github-hosted, npm ≥11.5.1, OIDC). After it: `npm view <pkg> dist-tags versions --json` shows `T` → the new versions, `latest` unchanged. `npm install <pkg>@T` in a fresh Solid 2 app (`solid-js@2.0.0-rc.9`, `@solidjs/web@2.0.0-rc.9`, `@solidjs/vite-plugin`) SSR-renders a Button.
