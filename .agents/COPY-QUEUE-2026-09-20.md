# Copy queue — 2026-09-20

Owner rule, 2026-09-20: public-facing words are Fable's. Workers and the
conductor may fix a **fact** — a dead link, a wrong version or tag, an import
that does not resolve, a claim a check disproves — and nothing else. Everything
that needs a sentence written or rewritten is queued here for Fable.

Covers: root `README.md`, `CONTRIBUTING.md`, `CREDITS.md`, `packages/*/README.md`
(#548), the docs-site landing and page prose (#549), the comparison-site prose
(#550).

Intake: one `##` entry per item. Name the file, what is wrong, and the proof.
Do not write the replacement sentence.

## 1 — #548 drafts are worker prose, and are not shippable as words

`.agents/drafts-548/` (untracked, nothing committed) holds full draft prose
written by the #548 worker before the owner's rule landed:

- `README.md` — a complete root README draft.
- `CONTRIBUTING.md` — a complete CONTRIBUTING draft.
- `packages/` — per-package README drafts.
- `shape.md` — the proposed ten-line shared README shape.

These are **prose**, so they are Fable's to write. Do not commit them as they
stand. They are useful to Fable as raw material and as evidence of what the
current files claim.

The other three files in that directory are **fact work**, not copy, and are
usable as they are:

- `claims.md` — every public claim in the root README, CREDITS, the seven
  package READMEs and the seven manifests, each marked `PROVEN` / `STALE` /
  `UNBACKED` against the tree.
- `examples.md` — one row per runnable code example with its module specifiers
  and exported names, for the #548 type-check harness.
- `CREDITS-corrections.md` — two silences and one house-style slip; each is an
  insertion, not a rewrite.

Action for Fable: write the root README, CONTRIBUTING and the seven package
READMEs, using `claims.md` as the fact base and `shape.md` as a proposal to
accept or replace. The `STALE` and `UNBACKED` rows are the ones that must not
survive into the published words.
