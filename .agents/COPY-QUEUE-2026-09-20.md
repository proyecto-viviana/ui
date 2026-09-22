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

## 2 — #549 the reference-page lede still claims completeness

`apps/web/src/components/docs/ApiReference.tsx:49` renders, above every one of
the 84 generated prop tables: "The complete prop surface of `<C>`, generated
from the types `<pkg>` ships."

It is not complete, and the page says so 30 lines later: its closing paragraph
(`:78-81`) tells the reader that a component wrapping a DOM element also accepts
that element's standard attributes, "which are left out here on purpose". The
two sentences contradict each other on the same page.

Proof: `apps/web/src/data/api-reference/pages/icon.json` lists three props for
`SpectrumIconProps` — `styles`, `aria-hidden`, `UNSAFE_suppressDataSlot` — while
`packages/viviana-ui/src/icon/spectrum-icon.tsx:42` declares
`SpectrumIconProps extends Omit<JSX.SvgSVGAttributes<SVGSVGElement>, "aria-hidden">`,
so `class`, `style`, `id`, `slot`, `aria-label` and the event handlers are all
accepted and none are shown. The generated `<meta name="description">` on those
pages was corrected at its generator (`scripts/extract-api-reference.ts:446`,
this commit); the lede a visitor actually reads was not, because it needs a
sentence written. Round-1 finding `apps-web/icon-page-claims-every-prop` stays
open until it lands.

## 3 — #549 the docs index counts prop rows and calls them props

`apps/web/src/routes/docs/index.tsx:46` reads "{84} components and {3493} props
from `@proyecto-viviana/ui`".

3,493 is every row the 84 pages render, measured over the committed data:
187 interfaces, 3,493 rows, 433 distinct prop names, and the 84 pages' own
components account for 2,130 of the rows. An interface pair that documents the
same props twice is counted twice — `TableProps` and `TableViewProps` are 54
each, `ProviderInheritedProps` repeats six of `ProviderProps`' 13. The sentence
is not false about rows, but "props" reads as distinct props of those 84
components, which is a different number. Fable's call which number the sentence
should name; the data file can supply either.
