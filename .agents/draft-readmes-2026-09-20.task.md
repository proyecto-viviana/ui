# Drafting task — npm READMEs and the GitHub front door (ticket #548), 2026-09-20

You do **not** hold the writer seat. Another worker is editing this checkout.
You write only under
`/home/emoporemilio/projects/viviana-hub/ui/.agents/drafts-548/`. You run no
build, no install, no test suite, no `git add`, no `git commit`. Reading,
`rg`, `node -e`, `npm view` (public reads) and `git log`/`git show` are fine.

Read `AGENTS.md`, `.claude/tickets/tasks/548-*.md`,
`.claude/current/release-policy.md`, `.claude/current/certification.md`, and
the ecosystem writing rules at `../vivianastack/docs/procedures/writing.md`
(rules 1–13 bind your prose; the length table does not cover READMEs).

## The reader

A Solid developer who has never heard of this project lands on npm or GitHub.
In one screen they must learn: what this is, whether it fits them, which
package to install, how to install it on **Solid 2**, and what is proven
versus experimental. They know React Aria exists; they do not know our words.

## The facts you may state

The release candidate ships five packages on the npm `next` tag, versions
`-rc.N`, all requiring Solid 2 (`solid-js` and `@solidjs/web` `2.0.0-rc.9` or
later): `solid-stately`, `solidaria`, `solidaria-components`,
`solid-spectrum`, `@proyecto-viviana/ui`. `kumo` and `geist` are unpublished
at `0.0.0`; say so plainly. Everything else you state, you prove first.

**A claim is a debt.** Before a sentence claims a count, a version, a peer
range, "accessible", "WCAG", "SSR", "certified", "parity", "tree-shakeable",
an import path, a prop, or a CSS entry point, find the proof in the tree and
record it. No proof, no sentence. Do not soften an unproven claim into a
hedge; cut it.

## Deliverables, in this order (write each file as soon as it is done)

1. `claims.md` — the claim table. Every public-facing claim in today's root
   `README.md`, `CREDITS.md`, each `packages/*/README.md`, and each
   `packages/*/package.json` `description`/`keywords`/`peerDependencies`:
   claim, where, status (`PROVEN` / `STALE` / `UNBACKED` / `FALSE`), proof or
   missing proof. Solid 1 install lines and `solid-js/web` imports are `STALE`.
   For every code example: does each imported name exist in that package's
   `src/index.ts` or `package.json` `exports`? Does each prop exist?
2. `shape.md` — the one shared README shape for the seven packages (#548
   item 2), ten lines, and the voice in three rules. Decide it once, then
   follow it.
3. `README.md` — the root front door: what the family is in one paragraph,
   the chain as a small diagram (text, not an image), a "which package do I
   want" table that lets a stranger choose in ten seconds, install for Solid 2
   with the `next` tag, one working example, how styling is delivered, an
   honest status table, links to the docs site (`ui.proyectoviviana.org`) and
   the comparison site, development commands, license and attribution (keep
   the legal content of the current section intact).
4. `packages/<dir>/README.md` for all seven, in the shared shape: purpose in
   two sentences, install and peers, the smallest example that really works,
   where it sits in the chain, what is proven (link the evidence), license.
5. `CONTRIBUTING.md` — the `vp` commands, the pre-commit hook, how a port is
   certified, the changeset rule, upstream pins. `CREDITS.md` — only a list of
   corrections if `claims.md` found any; do not rewrite it.
6. `examples.md` — every code example you wrote, each with the file it lives
   in and the exports it depends on, so the conductor can build the
   type-check harness #548's proof asks for.

## Rules

- Mirror upstream's vocabulary (React Aria, React Stately, Spectrum 2). Never
  invent a capability, a size, or a name. Names with public reach are
  owner-steered: reuse the names already in the tree.
- Not affiliated with Adobe, Cloudflare, or Vercel — keep that statement.
- No marketing adjectives ("blazing", "powerful", "seamless", "robust"). No
  emoji. No badges that point at a workflow that is red today.
- Short over complete. A README that answers the five questions above in one
  screen beats one that lists every hook.
- No secrets, no `.env*`, no deploy, no publish.

## Log

Keep `## Now` at the top of `.agents/drafts-548/LOG.md`: what is done, what is
in hand, what you could not prove. You may be stopped at any moment; a
finished file on disk is the only progress that counts.
