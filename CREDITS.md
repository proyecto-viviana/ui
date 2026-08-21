# Credits & attribution

Proyecto Viviana stands on a great deal of prior work. This document credits
every material we **sourced from**, **referenced**, or were **inspired by**.

Our original work uses the [MIT License](LICENSE). Derived work keeps its
upstream terms. The Adobe port stack uses Apache-2.0; its project attribution
is in [`NOTICE`](NOTICE) and [`LICENSE-APACHE-2.0`](LICENSE-APACHE-2.0).
The Kumo section identifies its upstream MIT notice. This document is the
readable companion.

## Sourced — Adobe React Spectrum (Apache-2.0)

The shared foundation, `solid-spectrum`, and the Spectrum-derived part of
`@proyecto-viviana/ui` are a SolidJS **port project** for Adobe's stack.

| Our package                              | Ported from             | Upstream license |
| ---------------------------------------- | ----------------------- | ---------------- |
| `@proyecto-viviana/solid-stately`        | `@react-stately/*`      | Apache-2.0       |
| `@proyecto-viviana/solidaria`            | `@react-aria/*`         | Apache-2.0       |
| `@proyecto-viviana/solidaria-components` | `react-aria-components` | Apache-2.0       |
| `@proyecto-viviana/solid-spectrum`       | `@react-spectrum/s2`    | Apache-2.0       |
| `@proyecto-viviana/ui`                   | `@react-spectrum/s2`    | Apache-2.0       |

- Source: <https://github.com/adobe/react-spectrum> — Copyright 2019 Adobe.
- Files with verified mappings identify the applicable upstream source. The
  exact per-file mapping audit is not complete.
- Significant changes (React → SolidJS) are summarized in [`NOTICE`](NOTICE).
- Each Adobe-derived package archive includes the MIT license, Apache-2.0
  license, and project NOTICE.

We also use, as runtime/peer dependencies or vendored reference, further
Apache-2.0 material from Adobe:

- `@react-spectrum/s2`, `@adobe/spectrum-tokens`,
  `@internationalized/date`, `@internationalized/number`,
  `@internationalized/string`.
- A vendored copy of the React Spectrum S2 documentation site under
  `apps/comparison/vendor/s2-docs/` (comparison reference; carries its own
  upstream `NOTICE`).

## Sourced — Cloudflare Kumo (MIT)

`@proyecto-viviana/kumo` translates selected Cloudflare Kumo components to
Solid. The API, visual values, component structure, and tests use Kumo as the
source.

- Source: <https://github.com/cloudflare/kumo> — Copyright 2026 Cloudflare, Inc.
- Initial source version: `@cloudflare/kumo@2.10.0`.
- License notice: [`packages/kumo/LICENSE-CLOUDFLARE`](packages/kumo/LICENSE-CLOUDFLARE).
- Current status: experiment with incomplete parity evidence.

## Inspired by — peer libraries

Influence at the idea/pattern level, not derived code. No license obligation;
credited here because it shaped a decision.

- **[Kobalte](https://github.com/kobaltedev/kobalte)** (MIT) — the technique of
  forcing a radio `<input>`'s `checked` DOM property back in sync with reactive
  state after a change event is a pattern common to SolidJS component libraries,
  Kobalte among them. See `packages/solidaria/src/radio/createRadio.ts`.

## Sourced — Glasselated design lane (our own work, ported)

The Glasselated visual system (the register on `packages/viviana-ui` and the
`apps/web/src/routes/showcase` surface) was designed in an owner-directed Claude
design lane. The lane landed on 2026-07-22 from
`design/visual-system-claude-v2`. Assets came from the external, now-frozen
design repository
(`proyecto-viviana/visual-system-claude`, branch `design/glasselated-v2`):

- `apps/web/public/glasselated/` — scene photographs (`bg-scene.png`,
  `bg-scene-night.png`), demo avatars/thumbnails, the `streak-flame.png`
  sprite, and the pixel-art `icons/` set, all generated during that design
  lane; owner-owned, MIT with the rest of our work.
- `apps/web/src/lib/glasselated.ts` — the mesh/dither/theme-wipe runtime,
  ported from the lane's framework-neutral `glasselated.js`.
- `apps/web/src/components/parity/` and the `.mesh-card` / `.tgl-*` /
  `.glx-caret` signature-treatment CSS in `apps/web/src/styles/glasselated.css`
  — the hand-built "Terminal Glass Lab" spec panels and their supporting paint,
  ported from the lane's `Terminal Glass Lab.dc.html` / `glasselated.css` to sit
  beside their `@proyecto-viviana/ui` twins on the showcase's Parity tab.
- `packages/viviana-ui/src/icon/pixel-icons/` — the `Pixel*Icon` components,
  generated from the lane's pixel-art SVG set
  (`apps/akade/public/glasselated/icons`); owner-owned, MIT with the rest of
  our work.
- **[Geist, Geist Mono & Geist Pixel](https://vercel.com/font)** (SIL OFL 1.1) —
  the register's three type faces, loaded from Google Fonts; not vendored.

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

- Root `LICENSE`, `LICENSE-APACHE-2.0`, and `NOTICE` are the sources for
  package archive copies.
- A release guard checks package metadata and exact file contents.
- Source-specific notices are added only after the upstream mapping is
  verified.
- New sourced/referenced/inspired material should be added to this file in the
  same change that introduces it.
