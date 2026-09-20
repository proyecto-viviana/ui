# Viviana UI

A family of Solid libraries: one headless foundation, ported from Adobe's
React Stately, React Aria, and React Aria Components, and four styled
libraries built on it. The foundation gives you state, ARIA, keyboard, focus,
and internationalization with no styling; each styled library adds one look.
If you know React Aria, you know the shape of this — the hooks are
`createButton` instead of `useButton`, and they return accessors instead of
values.

Not affiliated with Adobe, Cloudflare, or Vercel.

## The chain

```text
solid-stately          state: collections, selection, dates, validation
      ↓
solidaria              behavior: ARIA, press, focus, keyboard, i18n
      ↓
solidaria-components   headless components, no styling
      ↓
      ├─ solid-spectrum          Spectrum 2 look
      ├─ @proyecto-viviana/ui    the Viviana design system
      ├─ kumo                    Cloudflare Kumo look (experiment)
      └─ geist                   Vercel Geist look (experiment)
```

Each layer depends only on the ones above it. A styled library never
reimplements press, focus, or keyboard behavior — it themes and composes.

## Which package do I want

| I want | Install |
| --- | --- |
| A design system to build an app with, styled out of the box | `@proyecto-viviana/ui` |
| Adobe Spectrum 2 components in Solid | `@proyecto-viviana/solid-spectrum` |
| Unstyled accessible components I style myself | `@proyecto-viviana/solidaria-components` |
| Hooks to build my own components on | `@proyecto-viviana/solidaria` |
| State primitives only, no DOM | `@proyecto-viviana/solid-stately` |
| The Kumo or Geist look | not published yet — see Status |

Start with `@proyecto-viviana/ui`. Reach lower only when you need to.

## Install

Every package requires **Solid 2**. Both `solid-js` and `@solidjs/web` are
peer dependencies, at `>=2.0.0-rc.9 <3`.

```bash
npm install @proyecto-viviana/ui@rc solid-js@next @solidjs/web@next
```

The release candidate is on the `rc` tag, at `-rc` versions. The `latest`
tag still points at the Solid 1 line.

```tsx
import { Provider, Button } from "@proyecto-viviana/ui";
import { TextField } from "@proyecto-viviana/ui/TextField";

import "@proyecto-viviana/ui/components.css";

export function App() {
  return (
    <Provider colorScheme="dark">
      <TextField label="Name" />
      <Button variant="accent">Save</Button>
    </Provider>
  );
}
```

## Styling

Components never inject CSS. Every styled package ships its rules as a CSS
entry point you import once, at your app entry, before your own stylesheets:

```ts
import "@proyecto-viviana/ui/components.css";
```

`components.css` is `font-faces.css` + `theme.css` + `styles.css`. Import
those three separately if your app loads its own fonts. `font-faces.css`
opens with an `@import`, and CSS drops an `@import` that any rule precedes —
so load it first or the fonts silently fall back.

`solid-spectrum` delivers its styles the same way. Its rules are generated
from Adobe's tokens by the style macro, never handwritten:
[ADR 0001](docs/adr/0001-s2-styling-source-of-truth.md).

## Status

Active, experimental, and incomplete. APIs and package boundaries change.

| Package | npm | State |
| --- | --- | --- |
| `@proyecto-viviana/ui` | `next` | Published. The client-facing entry point. |
| `@proyecto-viviana/solid-spectrum` | `next` | Published. Spectrum 2 parity is in progress. |
| `@proyecto-viviana/solidaria-components` | `next` | Published. |
| `@proyecto-viviana/solidaria` | `next` | Published. |
| `@proyecto-viviana/solid-stately` | `next` | Published. |
| `@proyecto-viviana/kumo` | not published | One Button. The npm name holds a reserved `0.0.0-bootstrap.0` that is not this code. |
| `@proyecto-viviana/geist` | not published | One Button. The npm name is not registered. |

**An export is a floor, not proof.** A name in the barrel says nothing about
whether the component matches upstream. What "ported" means here, and what
evidence a component has to carry before it counts, is
[the evidence bar](.claude/current/certification.md). Treat every parity claim
as unproved until that evidence says otherwise.

## Links

- Documentation and component pages: <https://ui.proyectoviviana.org>
- The React-vs-Solid parity harness runs locally: `vp run comparison:dev`
- Repository: <https://github.com/proyecto-viviana/ui>

## Development

```bash
vp install
vp run dev              # apps/web, the docs and playground app
vp run comparison:dev   # apps/comparison, the parity harness
vp run check            # format, lint, typecheck
vp run test:run         # package suites
```

[CONTRIBUTING.md](CONTRIBUTING.md) has the rest: how a port is certified, the
changeset rule, and the upstream pins.

## Repo layout

```text
packages/        the seven public packages, plus private test utilities
apps/web         the docs and playground app
apps/comparison  the React-vs-Solid parity harness
docs/adr/        architecture decision records
```

## License & attribution

- Our own work is [MIT](LICENSE).
- The Adobe port project uses code under Apache-2.0. That direct-license
  attribution is in [`NOTICE`](NOTICE) and
  [`LICENSE-APACHE-2.0`](LICENSE-APACHE-2.0). Each Adobe-derived package ships
  copies of those files. Per-file mappings are guarded by
  `guard:attribution-headers`.
- [`CREDITS.md`](CREDITS.md) credits everything sourced, referenced, or
  inspired-by — add to it in the change that introduces new such material.
- Kumo-derived material keeps the Cloudflare MIT notice in
  [`packages/kumo/LICENSE-CLOUDFLARE`](packages/kumo/LICENSE-CLOUDFLARE).
- Geist visual rest values follow the public docs at
  https://vercel.com/geist. The package does not copy `@vercel/geistcn`.
