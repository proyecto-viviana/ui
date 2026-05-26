# Comparison App → S2 Docs Overhaul

Planning workspace for rebuilding `apps/comparison` so its pages look and read
exactly like the live `react-spectrum.adobe.com` (Spectrum 2) docs — built with
`solid-spectrum` instead of React Spectrum — while keeping our extra layer: the
React-vs-Solid side-by-side comparison and porting-parity reporting.

> Status: **planning only for the comparison app chrome/content overhaul**. The
> `solid-spectrum` package macro/build checkpoint has started separately, but
> the comparison app still needs its own source-condition and CSS emission proof
> before the docs shell is rebuilt.

## Locked decisions

| Decision            | Choice                                                                                                                                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ADR 0001 shell rule | **Superseded** — the app shell itself may use `solid-spectrum`.                                                                                                                                                                 |
| Content depth       | **Full content parity** — port upstream prose, anatomy, prop tables, multiple examples per component.                                                                                                                           |
| Visual reference    | The unified **`react-spectrum.adobe.com`** site.                                                                                                                                                                                |
| Host framework      | **Stay on Astro.** The React Spectrum reference panel stays an in-page **island** (not iframe-isolated). Accepts two framework runtimes in one bundle + the existing event-bus bridge; keeps Astro's static-by-default SSG/MDX. |

## Document index

| Doc                                                                  | Contents                                                                                                                                                                 |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`01-findings.md`](01-findings.md)                                   | What the reference site is, how its pages are built, what `apps/comparison` does today, the ad-hoc→target mapping.                                                       |
| [`02-style-and-build.md`](02-style-and-build.md)                     | The style-system spike (resolved), Astro/Solid SSR model, CSS collection pipeline.                                                                                       |
| [`03-chrome-spec.md`](03-chrome-spec.md)                             | Per-component build spec for the docs chrome (Header, Nav, Toc, Footer, theming).                                                                                        |
| [`04-content-pipeline.md`](04-content-pipeline.md)                   | MDX adoption, the custom MDX component set, `ComparisonExample`, `PropTable`, prop-metadata extraction.                                                                  |
| [`05-phasing.md`](05-phasing.md)                                     | Phased delivery, risk register, acceptance criteria, open questions.                                                                                                     |
| [`06-solid-spectrum-css-defect.md`](06-solid-spectrum-css-defect.md) | **General `solid-spectrum` bug** (not overhaul-specific): components ship with missing CSS because the macro-era style system was de-macro'd. Root-cause analysis + fix. |
| [`07-build-time-css-strategy.md`](07-build-time-css-strategy.md)     | Research: the CSS-tooling landscape, why this isn't Tailwind, and the recommended build-time path — `unplugin-parcel-macros` on Vite/tsdown. Performance analysis.       |

## One-paragraph summary

The live docs site's source is already vendored in this repo at
`react-spectrum/packages/dev/s2-docs/` — both the chrome (`src/`) and 92
hand-authored component pages (`pages/s2/*.mdx`). The overhaul replaces the
comparison app's faked docs shell (~2200 lines of `s2-` CSS over raw HTML) with
real `solid-spectrum` chrome, and replaces its single generated `[slug].astro`
template with per-component MDX adapted from the upstream pages. The style path
is the upstream macro model: package output now uses the Vite Plus/tsdown macro
route, and the remaining app-side proof is source-condition wiring plus CSS
chunk emission in Astro. See [`02-style-and-build.md`](02-style-and-build.md).
