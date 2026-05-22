# 04 · Content Pipeline

How per-component pages get their content, and how the comparison/parity layer
is woven in. Covers MDX adoption, the custom MDX component set,
`ComparisonExample`, `PropTable`, and prop-metadata extraction.

## 1. Adopt the upstream MDX as the content source

Today every page is generated from one `[slug].astro` template, so all pages
share a skeleton and carry no real prose. "Full content parity" is impossible
that way. Instead:

- Astro natively supports `.mdx` pages.
- The upstream component pages exist at
  `react-spectrum/packages/dev/s2-docs/pages/s2/*.mdx` — 92 files of
  hand-authored prose + examples.
- The comparison app moves to **one `.mdx` page per component** under
  `apps/comparison/src/pages/components/`, adapted from those upstream files.

A migration script (`scripts/import-s2-docs-mdx.ts`) performs the mechanical
parts; the rest is hand-tuning. Keep the upstream MDX vendored so future
upstream edits can be diffed and re-merged.

### What the migration script rewrites

| Upstream MDX construct                                      | Becomes                                                     |
| ----------------------------------------------------------- | ----------------------------------------------------------- |
| `import {Layout} from '../../src/Layout'`                   | `import {DocsLayout} from '@comparison/layouts/DocsLayout'` |
| `import {Foo} from '@react-spectrum/s2'`                    | kept (React reference panel) + add `solid-spectrum` import  |
| `import docs from 'docs:@react-spectrum/s2'`                | `import docs from '@comparison/data/docs/...'` (see §4)     |
| `<VisualExample … />`                                       | `<ComparisonExample … />` (§3)                              |
| ` ```tsx render ` fenced block                              | `<ComparisonExample>` with a code tab (§3)                  |
| `<PropTable component={…} />`                               | comparison `<PropTable>` with a parity column (§5)          |
| prose Markdown (`## Selection`, paragraphs, …)              | **copied unchanged**                                        |
| `<StateTable>`, `<Figure>`/`<Caption>`, `<ExampleSwitcher>` | ported analogues                                            |

### Parity content appended per page

After the upstream body, each page gets the comparison-specific sections
(restyled with `solid-spectrum`, not the old `s2-` CSS):

- **Coverage** — `Meter` rows from `data/coverage.ts`.
- **Visual State Coverage** — `Table`/`Card` rows with `Badge`/`StatusLight`
  from `data/visual-state-matrix.ts`.
- **Layer tracks** (styled/components/headless/state) from `entry.layers`.

These may be grouped under one collapsible "Porting parity" `Disclosure` so the
page still reads as docs first, parity report second.

## 2. The custom MDX component set

Upstream `Layout.tsx` passes a `components` map to MDX (`h2→H2`, `p→P`,
`code→Code`, `PropTable`, `VisualExample`, …). The comparison app needs the
analogue, exported from one module and registered in `astro.config` MDX
options (or per-page).

| MDX name                                           | Implementation                                     |
| -------------------------------------------------- | -------------------------------------------------- |
| `h1`–`h4`, `p`, `li`, `strong`, `a`, `code`, `pre` | `chrome/typography.tsx` ports                      |
| `PageDescription`                                  | typography port                                    |
| `VisualExample` / `ComparisonExample`              | §3                                                 |
| `PropTable`                                        | §5                                                 |
| `StateTable`                                       | port of upstream `StateTable.tsx`                  |
| `Keyboard`                                         | `<kbd>` styled                                     |
| `Figure` / `Caption`                               | anatomy figures                                    |
| `ExampleSwitcher`                                  | tabbed vanilla/s2 — likely trimmed to a single tab |

## 3. `ComparisonExample` — the dual-panel playground

Upstream `VisualExample` renders **one** component with an interactive control
panel and a generated code block (CSS grid: `example` / `controls` / `files`).
Ours must render **two** — the React Spectrum reference and the `solid-spectrum`
port — sharing one control panel, plus a parity readout.

Design:

- **One control panel** drives both renders. Built from `solid-spectrum` form
  components (`Picker`, `Switch`, `TextField`, `RadioGroup`). Control
  definitions come from `data/component-controls.ts`
  (`getComponentControlGroup`), which already exists.
- **Two output frames** side by side, each labelled ("React Spectrum S2" /
  "solid-spectrum"), reusing the current `ReactMount` / `SolidMount` island
  wiring so both stay live and prop changes broadcast to both (the existing
  `comparison:controls-change` event bus).
- **Parity strip** — per-state `Badge`/`StatusLight` from
  `data/visual-state-matrix.ts`.
- **Code tab** — the upstream example code, import-rewritten to `solid-spectrum`.
- **Empty states** — for components not yet live in `solid-spectrum`, keep the
  current "missing / tracked" placeholders.

Reuse: the control plumbing (`[slug].astro`'s inline script — URL sync,
defaults, `comparison:controls-change`) is sound; lift it into the
`ComparisonExample` island rather than rewriting it.

Open question: upstream `VisualExample` derives controls from extracted TS
docs; ours uses hand-curated `component-controls.ts`. Keep the hand-curated
source for now; revisit once §4 lands.

## 4. Prop-metadata extraction (for `PropTable`)

Upstream `<PropTable>` is fed by `docs:@react-spectrum/s2` — a build-time
artifact produced by `react-spectrum/packages/dev/parcel-transformer-docs`,
which walks the TypeScript types and emits structured JSON (prop name, type,
default, description, required). That JSON also feeds `PageDescription` and the
`VisualExample` control types.

The comparison app has no equivalent. `component-controls.ts` carries control
definitions and a flat `apiProps` string list — **no types, defaults, or
descriptions**. Full `PropTable` parity needs structured metadata for both
libraries (the React column and the Solid column).

Options, cheapest first:

1. **Reuse react-spectrum's extractor.** It is vendored. Run
   `parcel-transformer-docs` (or its underlying logic) against
   `@react-spectrum/s2` _and_ `@proyecto-viviana/solid-spectrum` to emit JSON
   into `data/docs/`. Highest fidelity; needs the extractor to run outside
   Parcel.
2. **A lightweight TS extractor** (e.g. `ts-morph`/TypeScript API) producing
   just name/type/default/description per exported component. Less fidelity,
   fewer moving parts.
3. **Hand-author** an extended metadata file. Accurate but ~69 components of
   manual work and drift risk — not recommended beyond a stopgap.

This is the largest unscoped task in the overhaul and is **deliberately a
separate workstream** — the chrome and MDX adoption do not depend on it. Until
it lands, `PropTable` can degrade to today's tracked-`apiProps` list.

## 5. `PropTable` (parity-aware)

Upstream `PropTable.tsx`: a `Table` with grouped, collapsible rows
(`DisclosureRow` for Content / Selection / Events / Styling / Accessibility /
Advanced / …), Name / Type / Default columns, a required-`Asterisk` marker, and
a description row under each prop.

Build: `chrome/PropTable.tsx` using `solid-spectrum`'s `Table*` +
`Disclosure`-based group rows. Same grouping constants as upstream
(`PropTable.tsx` `GROUPS`). Comparison addition: a **parity column** (or
per-row badge) marking whether `solid-spectrum` implements that prop —
sourced from the §4 metadata once available, from `apiProps` until then.

## 6. The homepage

`index.astro` becomes an `.mdx` (or stays `.astro`) using the same
`DocsLayout`. The bespoke `.s2-coverage-ring` → `ProgressCircle`; the
`.s2-component-list` → a `Card` grid (`ComponentCard` analogue). Catalogue
filter controls → `solid-spectrum` `SearchField` + `Picker`s.
