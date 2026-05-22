# Comparison App → S2 Docs Overhaul

Planning workspace for rebuilding `apps/comparison` so its pages look and read
exactly like the live `react-spectrum.adobe.com` (Spectrum 2) docs — built with
`solid-spectrum` instead of React Spectrum — while keeping our extra layer: the
React-vs-Solid side-by-side comparison and porting-parity reporting.

> Status: **planning only**. No changes to `apps/comparison` yet. These
> documents capture investigation and design so implementation can start from a
> settled plan.

## Locked decisions

| Decision            | Choice                                                                                                |
| ------------------- | ----------------------------------------------------------------------------------------------------- |
| ADR 0001 shell rule | **Superseded** — the app shell itself may use `solid-spectrum`.                                       |
| Content depth       | **Full content parity** — port upstream prose, anatomy, prop tables, multiple examples per component. |
| Visual reference    | The unified **`react-spectrum.adobe.com`** site.                                                      |

## Document index

| Doc                                                | Contents                                                                                                           |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| [`01-findings.md`](01-findings.md)                 | What the reference site is, how its pages are built, what `apps/comparison` does today, the ad-hoc→target mapping. |
| [`02-style-and-build.md`](02-style-and-build.md)   | The style-system spike (resolved), Astro/Solid SSR model, CSS collection pipeline.                                 |
| [`03-chrome-spec.md`](03-chrome-spec.md)           | Per-component build spec for the docs chrome (Header, Nav, Toc, Footer, theming).                                  |
| [`04-content-pipeline.md`](04-content-pipeline.md) | MDX adoption, the custom MDX component set, `ComparisonExample`, `PropTable`, prop-metadata extraction.            |
| [`05-phasing.md`](05-phasing.md)                   | Phased delivery, risk register, acceptance criteria, open questions.                                               |

## One-paragraph summary

The live docs site's source is already vendored in this repo at
`react-spectrum/packages/dev/s2-docs/` — both the chrome (`src/`) and 92
hand-authored component pages (`pages/s2/*.mdx`). The overhaul replaces the
comparison app's faked docs shell (~2200 lines of `s2-` CSS over raw HTML) with
real `solid-spectrum` chrome, and replaces its single generated `[slug].astro`
template with per-component MDX adapted from the upstream pages. The previously
feared blocker — the compile-time `style` macro — does not exist for us:
`solid-spectrum`'s `style()` is a runtime function with a build-time CSS
collection step we can extend. See [`02-style-and-build.md`](02-style-and-build.md).
