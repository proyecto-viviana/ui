# Viviana UI

Accessible UI components for [Solid](https://solidjs.com) 2.

The behavior is a port of Adobe's React Aria family: the state, ARIA, keyboard,
focus, and internationalization work those libraries are known for, rebuilt on
Solid's signals. Styled libraries sit on top. Take one of them, or take the
headless layers and bring your own look.

If you know React Aria, you already know the shape. `useButton` is
`createButton`, and hooks return accessors where React's return values.

Not affiliated with Adobe, Cloudflare, or Vercel.

## Quick start

```bash
npm install @proyecto-viviana/ui@rc solid-js@next @solidjs/web@next
```

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

Every package needs **Solid 2**: `solid-js` and `@solidjs/web` are peer
dependencies at `>=2.0.0-rc.9 <3`, and Solid publishes those on its `next` tag.
Our release candidate is on the `rc` tag. `latest` still points at the Solid 1
line.

## Pick a package

| You want | Install |
| --- | --- |
| Components that look finished out of the box | `@proyecto-viviana/ui` |
| Adobe Spectrum 2, in Solid | `@proyecto-viviana/solid-spectrum` |
| Accessible components with no styling at all | `@proyecto-viviana/solidaria-components` |
| Hooks, to build your own components | `@proyecto-viviana/solidaria` |
| State only, no DOM | `@proyecto-viviana/solid-stately` |
| The Kumo or Geist look | not published yet, see [Status](#status) |

Start at the top of the table. Go lower only when you need to.

## How it fits together

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
reimplements press, focus, or keyboard behavior. It themes and composes.

## Styling

Components never inject CSS. Every styled package ships its rules as a CSS
entry point you import once, at your app entry, before your own stylesheets:

```ts
import "@proyecto-viviana/ui/components.css";
```

`components.css` is `font-faces.css` + `theme.css` + `styles.css`. Import
those three separately if your app loads its own fonts. `font-faces.css`
opens with an `@import`, and CSS drops an `@import` that any rule precedes.
Load it first, or the fonts silently fall back.

`solid-spectrum` delivers its styles the same way. Its rules are generated
from Adobe's tokens by the style macro, never handwritten:
[ADR 0001](docs/adr/0001-s2-styling-source-of-truth.md).

## Server rendering

Each package ships two builds: compiled DOM output for a plain `import`, and
preserved JSX under the `solid` export condition, which your bundler compiles
for the server. A server that loads the DOM build cannot render it. With Vite,
keep the family inside the bundle:

```ts
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid({ ssr: true })],
  ssr: { noExternal: [/@proyecto-viviana\/.*/] },
});
```

This repository's docs site server-renders with the same `noExternal` line.

## Status

Active, experimental, and incomplete. APIs and package boundaries change.

| Package | npm | State |
| --- | --- | --- |
| `@proyecto-viviana/ui` | `rc` | Published. The client-facing entry point. |
| `@proyecto-viviana/solid-spectrum` | `rc` | Published. Spectrum 2 parity is in progress. |
| `@proyecto-viviana/solidaria-components` | `rc` | Published. |
| `@proyecto-viviana/solidaria` | `rc` | Published. |
| `@proyecto-viviana/solid-stately` | `rc` | Published. |
| `@proyecto-viviana/kumo` | not published | One Button. The npm name holds a reserved `0.0.0-bootstrap.0` that is not this code. |
| `@proyecto-viviana/geist` | not published | One Button. The npm name is not registered. |

**An export is a floor, not proof.** A name in the barrel says nothing about
whether a component matches upstream. [The evidence bar](.claude/current/certification.md)
says what "ported" means here and what a component must carry before it
counts. Until a component carries it, treat its parity as unproved.

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
  inspired-by. Add to it in the change that introduces new such material.
- Kumo-derived material keeps the Cloudflare MIT notice in
  [`packages/kumo/LICENSE-CLOUDFLARE`](packages/kumo/LICENSE-CLOUDFLARE).
- Geist visual rest values follow the public docs at
  https://vercel.com/geist. The package does not copy `@vercel/geistcn`.
