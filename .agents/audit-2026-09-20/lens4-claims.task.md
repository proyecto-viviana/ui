Read `/home/emoporemilio/projects/viviana-hub/ui/.agents/audit-2026-09-20/BRIEF.md` first and obey it.

# Lens 4 — Public claims against the tree

Artifact: `/home/emoporemilio/projects/viviana-hub/ui/.agents/audit-2026-09-20/lens4-claims.md`

The READMEs and the public site are about to be rewritten (#548, #549). Build
the claim table they must be rewritten from.

1. Collect every public-facing claim: root `README.md`, `CREDITS.md`,
   `CONTRIBUTING.md`, each `packages/*/README.md`, each `packages/*/package.json`
   `description`/`keywords`/`peerDependencies`, and the user-visible copy in
   `apps/web/src/routes/**` (landing, docs index, ecosystem, status pages) and
   `apps/comparison/src/pages/index*`.
2. For each claim — a count, a version, "certified", "accessible", "WCAG",
   "SSR", "supports", "parity", "zero-dependency", "tree-shakeable", an install
   command, a code example — find the runnable proof in the tree, or mark it
   `UNBACKED`, `STALE` (proof exists but says something else now), or `FALSE`.
   Solid 1 install lines and `solid-js/web` imports in examples are `STALE`.
3. Check every code example against the current exports: does each imported
   name exist in that package's `src/index.ts`? Does each prop exist?
4. Check every internal link and every link to the docs or comparison site.
5. Note what a stranger needs and cannot find: which package to choose, the
   Solid 2 requirement, how styling is delivered, SSR setup, what is
   experimental (kumo, geist are unpublished at `0.0.0`).

Output the claim table first (claim, where, status, proof or missing proof),
then findings in the brief's format for anything `FALSE` or dangerous.
