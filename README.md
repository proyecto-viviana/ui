# Viviana UI

Viviana UI is Proyecto Viviana's open-source UI suite and design system, built
on Solid. Its foundation is an unofficial open-source port of Adobe's React
Stately, React Aria, React Aria Components, and React Spectrum S2 through the
Solidaria and Solid Spectrum packages. It is not affiliated with Adobe.

The suite is built in layers: `solid-stately`, `solidaria`,
`solidaria-components`, and `solid-spectrum` are the port stack;
`@proyecto-viviana/ui` is the Viviana design-system package built on top of that
stack.

| Package                | npm                                      | Role                                                                 |
| ---------------------- | ---------------------------------------- | -------------------------------------------------------------------- |
| `viviana-ui`           | `@proyecto-viviana/ui`                   | Viviana design-system package and client-facing entry point.         |
| `solid-spectrum`       | `@proyecto-viviana/solid-spectrum`       | Solid port of React Spectrum S2 styled components.                   |
| `solidaria-components` | `@proyecto-viviana/solidaria-components` | Solid port of React Aria Components.                                 |
| `solidaria`            | `@proyecto-viviana/solidaria`            | Solid port of React Aria hooks: ARIA, keyboard, focus, press, hover. |
| `solid-stately`        | `@proyecto-viviana/solid-stately`        | Solid port of React Stately state primitives.                        |

## Install

```bash
npm install @proyecto-viviana/ui solid-js
```

```tsx
import { Provider, Button } from "@proyecto-viviana/ui";
import { TextField } from "@proyecto-viviana/ui/TextField";

import "@proyecto-viviana/ui/theme.css";
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

Components do not inject CSS. Import the theme and component styles once at the
app entry. See [`packages/viviana-ui/README.md`](packages/viviana-ui/README.md)
for styling details, deep imports, and the Vite macro helper.

## Status

Viviana UI is published and in active development. Use it with the expectation
that APIs, package boundaries, and component behavior are still being tightened.

The lower packages are available directly for lower-level Solid ports and
experiments, but most apps should start with `@proyecto-viviana/ui`.

## Development

```bash
vp install
vp run dev              # apps/web playground
vp run comparison:dev   # apps/comparison parity harness
vp run check            # format + lint + typecheck
```

## Repo layout

```text
packages/                Viviana UI, the port stack, and private test-utils
apps/web                 playground app
apps/comparison          React-vs-Solid parity verification harness
docs/adr/                architecture decision records (ADR 0001 = S2 styling boundary)
```

## License & attribution

- Our own work is [MIT](LICENSE).
- The port stack is an unofficial Solid port of Adobe's React Spectrum stack
  (Apache-2.0). That direct-license obligation is honored in [`NOTICE`](NOTICE) and
  [`LICENSE-APACHE-2.0`](LICENSE-APACHE-2.0); ported files keep their upstream
  headers.
- [`CREDITS.md`](CREDITS.md) credits everything sourced, referenced, or
  inspired-by — add to it in the change that introduces new such material.
