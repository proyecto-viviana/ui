# Viviana UI

Viviana UI is Proyecto Viviana's open-source UI experiment for Solid. It includes
a shared headless foundation and three styled component libraries.

The foundation is an unofficial port project for Adobe's React Stately, React
Aria, and React Aria Components. `solid-spectrum` also experiments with React
Spectrum S2 parity. The project is not affiliated with Adobe or Cloudflare.

| Package                | npm                                      | Role                                                              |
| ---------------------- | ---------------------------------------- | ----------------------------------------------------------------- |
| `viviana-ui`           | `@proyecto-viviana/ui`                   | Viviana design-system package and client-facing entry point.      |
| `solid-spectrum`       | `@proyecto-viviana/solid-spectrum`       | Styled Solid experiment based on React Spectrum S2.               |
| `kumo`                 | `@proyecto-viviana/kumo`                 | Experimental Kumo-shaped styled components for Solid.             |
| `solidaria-components` | `@proyecto-viviana/solidaria-components` | Headless Solid experiment based on React Aria Components.         |
| `solidaria`            | `@proyecto-viviana/solidaria`            | Experimental Solid ARIA, keyboard, focus, press, and hover hooks. |
| `solid-stately`        | `@proyecto-viviana/solid-stately`        | Experimental Solid state primitives based on React Stately.       |

## Install

```bash
npm install @proyecto-viviana/ui solid-js
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

Components do not inject CSS. Import `components.css` once at the app entry; it
already includes the font faces, theme tokens, and generated component rules.
See [`packages/viviana-ui/README.md`](packages/viviana-ui/README.md) for the
separate-file alternative, deep imports, and the Vite macro helper.

## Status

Treat all parity claims as unproved until the component evidence says otherwise.
This project is active, experimental, and incomplete. APIs and package boundaries
can change.

The lower packages are available directly for lower-level Solid ports and
experiments, but most apps should start with `@proyecto-viviana/ui`.

The Kumo package is a separate styled library. Its first Button slice is not a
complete Kumo port.

## Development

```bash
vp install
vp run dev              # apps/web playground
vp run comparison:dev   # apps/comparison parity harness
vp run check            # format + lint + typecheck
```

## Repo layout

```text
packages/                Shared foundations, styled libraries, and private test utilities
apps/web                 playground app
apps/comparison          React-vs-Solid parity verification harness
docs/adr/                architecture decision records (ADR 0001 = S2 styling boundary)
```

## License & attribution

- Our own work is [MIT](LICENSE).
- The Adobe port project uses code under Apache-2.0. That direct-license
  obligation is honored in [`NOTICE`](NOTICE) and
  [`LICENSE-APACHE-2.0`](LICENSE-APACHE-2.0). Derived files keep their upstream
  headers.
- [`CREDITS.md`](CREDITS.md) credits everything sourced, referenced, or
  inspired-by — add to it in the change that introduces new such material.
- Kumo-derived material keeps the Cloudflare MIT notice in
  [`packages/kumo/LICENSE-CLOUDFLARE`](packages/kumo/LICENSE-CLOUDFLARE).
