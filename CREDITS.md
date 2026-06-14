# Credits & attribution

Proyecto Viviana stands on a great deal of prior work. This document credits
every material we **sourced from**, **referenced**, or were **inspired by**.

Our own work is licensed under the [MIT License](LICENSE) — kept deliberately
permissive. Direct upstream-license compliance is required for one stack only:
**Adobe's React Spectrum** (Apache-2.0), which our packages are ported from. The
legal attribution for that lives in [`NOTICE`](NOTICE) and
[`LICENSE-APACHE-2.0`](LICENSE-APACHE-2.0); this document is the readable
companion.

## Sourced — Adobe React Spectrum (Apache-2.0)

The five-layer package chain is a SolidJS **port** of Adobe's React Spectrum
stack. This is direct, derivative-work use: the code structure, behavior, and
tests are translated from the originals.

| Our package                              | Ported from             | Upstream license |
| ---------------------------------------- | ----------------------- | ---------------- |
| `@proyecto-viviana/solid-stately`        | `@react-stately/*`      | Apache-2.0       |
| `@proyecto-viviana/solidaria`            | `@react-aria/*`         | Apache-2.0       |
| `@proyecto-viviana/solidaria-components` | `react-aria-components` | Apache-2.0       |
| `@proyecto-viviana/solid-spectrum`       | `@react-spectrum/s2`    | Apache-2.0       |

- Source: <https://github.com/adobe/react-spectrum> — Copyright 2019 Adobe.
- Ported files retain Adobe's original copyright header and a `Ported from` /
  `Based on` link to the exact upstream module they descend from.
- Significant changes (React → SolidJS) are summarized in [`NOTICE`](NOTICE).

We also use, as runtime/peer dependencies or vendored reference, further
Apache-2.0 material from Adobe:

- `@react-spectrum/s2`, `@adobe/spectrum-tokens`,
  `@internationalized/date`, `@internationalized/number`,
  `@internationalized/string`.
- A vendored copy of the React Spectrum S2 documentation site under
  `apps/comparison/vendor/s2-docs/` (comparison reference; carries its own
  upstream `NOTICE`).

## Inspired by — peer libraries

Influence at the idea/pattern level, not derived code. No license obligation;
credited here because it shaped a decision.

- **[Kobalte](https://github.com/kobaltedev/kobalte)** (MIT) — the technique of
  forcing a radio `<input>`'s `checked` DOM property back in sync with reactive
  state after a change event is a pattern common to SolidJS component libraries,
  Kobalte among them. See `packages/solidaria/src/radio/createRadio.ts`.

## Built with

The wider toolchain and ecosystem this project is built on (each under its own
license):

- **[SolidJS](https://www.solidjs.com/)** — the reactive runtime everything
  targets.
- **[TanStack](https://tanstack.com/)** Start & Router + **Cloudflare Workers** —
  the `apps/web` application.
- **[Astro](https://astro.build/)** — the `apps/comparison` documentation /
  comparison site.
- **[Vite](https://vite.dev/)** + **Vite Plus (`vp`)**, **[Vitest](https://vitest.dev/)**,
  **[Playwright](https://playwright.dev/)**, and **oxlint / oxfmt** — build,
  test, and lint/format.

## Conformance references

The accessibility and behavior parity work is checked against authoritative
specifications and guidance (reference material, not code):

- W3C / WHATWG technical specifications.
- WAI-ARIA Authoring Practices Guide (APG) and ARIA-AT.
- WCAG and related evaluation guidance.
- MDN, web.dev, and browser-vendor platform documentation.

When sources disagree, installed upstream source for the pinned version is the
first authority, followed by official Adobe docs, then formal specs.

## How attribution is kept current

- Ported source files keep their upstream copyright header and a
  `Ported from` / `Based on` reference inline.
- Project-level Apache-2.0 obligations are in [`NOTICE`](NOTICE) and
  [`LICENSE-APACHE-2.0`](LICENSE-APACHE-2.0).
- New sourced/referenced/inspired material should be added to this file in the
  same change that introduces it.
