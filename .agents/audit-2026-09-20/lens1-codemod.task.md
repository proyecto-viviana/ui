Read `/home/emoporemilio/projects/viviana-hub/ui/.agents/audit-2026-09-20/BRIEF.md` first and obey it.

# Lens 1 — Solid 2 codemod damage

Artifact: `/home/emoporemilio/projects/viviana-hub/ui/.agents/audit-2026-09-20/lens1-codemod.md`

Commit `163f4377` ported seven packages to Solid 2.0.0-rc.9 mostly by codemod;
32 commits since then patched fallout (#534 events, #536 and #542 SSR and
hydration, #543 comparison app). Hunt what the codemod broke and nobody has
noticed yet.

Attack, in this order:

1. **The `_s2Cleanups` pattern.** The codemod injected
   `const _s2Cleanups: Array<() => void> = []; ... return () => { for (const c of _s2Cleanups) c(); }`
   about 70 times (solidaria 30 files, solidaria-components 13, viviana-ui 8,
   solid-spectrum 7). For each shape of use: does the cleanup actually run, in
   the right owner, exactly once? Is the array shared across effect re-runs so
   cleanups leak or double-fire? Are cleanups registered after an early
   `return`? Does the effect's returned function have the semantics the author
   assumed under Solid 2's split compute/effect `createEffect`? Compare with
   the pre-codemod code via `git show 163f4377^:<path>`.
2. **Solid 2 semantic changes applied mechanically.** Read the Solid 2 source
   in `node_modules/solid-js` to establish the real semantics, then look for
   code that still assumes Solid 1: effect timing and batching, reads of a
   signal right after a write, `createEffect` two-argument form misuse,
   `onMount`/`onCleanup` ownership, `splitProps`/`mergeProps` replacements,
   store and `createMemo` equality, context default handling, `children()`
   resolution, `untrack`, `on()`, `createRenderEffect`, refs, `Show`/`For`
   keyed and callback-argument changes (accessor vs value), `Dynamic`, `Portal`.
3. **Mangled syntax that still compiles.** `git show 163f4377 --stat` then
   inspect hunks where the codemod deleted a line without adding one, merged
   imports, or dropped a type-only import. Find dead imports of `solid-js/web`,
   duplicate imports, shadowed names.
4. **Twins.** `viviana-ui` and `solid-spectrum` mirror each other; a defect in
   one usually exists in the other. Count twins for every finding.

Prioritise the headless chain (`solidaria`, `solidaria-components`): every
styled package inherits its bugs.
