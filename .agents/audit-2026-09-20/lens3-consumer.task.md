Read `/home/emoporemilio/projects/viviana-hub/ui/.agents/audit-2026-09-20/BRIEF.md` first and obey it.

# Lens 3 — The consumer install path (static)

Artifact: `/home/emoporemilio/projects/viviana-hub/ui/.agents/audit-2026-09-20/lens3-consumer.md`

A release candidate of five packages is about to go to npm under the `next`
tag, versions `-rc.N`: `@proyecto-viviana/solid-stately`, `solidaria`,
`solidaria-components`, `solid-spectrum`, `@proyecto-viviana/ui` (read the real
names from each `packages/*/package.json`). Every consumer moves to it at once.
Find what breaks for a stranger who runs `npm install <pkg>@next` in a fresh
Solid 2 app. A writer worker is building in this checkout: you run **no**
build, install, pack, or test. Read files, `rg`, `node -e`, `git log`/`git show`,
and public `npm view` only. If `dist/` exists, you may read it, but say it may
be stale.

Attack, in this order:

1. **Manifests.** For each of the five: `exports` (every subpath, condition
   order — `types` first, `solid` vs `import` vs `default`, what each target
   is), `main`/`module`/`types`, `files`, `sideEffects` (does it keep the CSS
   entry points alive?), `peerDependencies` and `peerDependenciesMeta`,
   `dependencies`, `publishConfig`, `license`, `repository`, `engines`. Does
   every `exports` target correspond to a build output the package's
   `vite.config.ts`/`tsdown`/build script actually emits? Does a `solid`
   condition ship source JSX, and if so does the consumer need
   `@solidjs/vite-plugin` — and does any README or manifest tell them?
2. **Peer ranges across the chain.** How is `solid-js` / `@solidjs/web`
   ranged in each package? Work out semver prerelease semantics exactly: does
   the range admit `2.0.0-rc.10`, `2.0.0`, `2.1.0`? Is it the same in all
   five? Does any package still peer on or import `solid-js/web`, `solid-js/store`
   subpaths that Solid 2 moved? `rg "from ['\"]solid-js/" packages/*/src`.
3. **Internal dependencies under changesets pre mode.** Read
   `.changeset/config.json` (`updateInternalDependencies`, `fixed`, `linked`,
   `ignore`, `bumpVersionsWithWorkspaceProtocolOnly`) and how `workspace:*`
   is rewritten at publish. After `changeset pre enter rc` + `changeset version`,
   what exact version does `solidaria-components` depend on `solidaria` at?
   Is there a pending changeset for each of the five (`ls .changeset/*.md`,
   read their frontmatter)? Which package would publish with **no** bump and
   so not get an `-rc` version while its dependents require one?
4. **What is on npm today.** `npm view <pkg> versions dist-tags --json` for
   the five. Compare the last published tarball's `exports`/`peerDependencies`
   (`npm view <pkg>@<latest> exports peerDependencies dependencies --json`)
   with the tree: what changes for an existing consumer, and is each breaking
   change named in a changeset?
5. **The proof that exists.** Read `scripts/consume-pack-smoke.mjs`,
   `pack:local-chain`, `guard:publish-drift`, `scripts/check-entry-import-budget.ts`
   and the workflows under `.github/workflows/`. Which of them actually
   installs the packed tarballs into an off-workspace app, under Solid 2, with
   SSR? Which run in CI, on which trigger? What consumer failure would none of
   them catch?
6. **`release.yml`.** Provenance / trusted publishing, the dist-tag it would
   publish under in pre mode, and whether anything could move `latest` by
   accident.

Output findings in the brief's format. End with the exact ordered checklist
you would require before `changeset publish` runs.
