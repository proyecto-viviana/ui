# @proyecto-viviana/ui

Viviana UI's design-system package, built on Solid.

It builds on `@proyecto-viviana/solid-spectrum`, so Spectrum components are
available from the root package and from deep component subpaths. It also ships
Viviana components, tokens, and product patterns such as cards, chips,
conversation, layout, logo, and timeline pieces.

This package is part of Viviana UI, an unofficial open-source Solid port and
design-system suite built from Adobe's React Stately, React Aria, React Aria
Components, and React Spectrum S2. It is not affiliated with Adobe.

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

Deep imports such as `@proyecto-viviana/ui/TextField` are preferred in app code.
The root barrel is convenient for examples and shared entry points.

## Styling

Components do not inject CSS. Import the design-system CSS once at your app
entry.

Most apps should import:

```ts
import "@proyecto-viviana/ui/theme.css";
import "@proyecto-viviana/ui/components.css";
```

`theme.css` contains the color-scheme tokens and Viviana brand variables.
`components.css` contains font faces plus the generated component styles.

Apps that manage font loading themselves can import the two component-style
halves separately:

```ts
import "@proyecto-viviana/ui/theme.css";
import "@proyecto-viviana/ui/font-faces.css";
import "@proyecto-viviana/ui/styles.css";
```

| Subpath          | Contents                                                   |
| ---------------- | ---------------------------------------------------------- |
| `theme.css`      | Color-scheme tokens + Viviana brand `--color-*` variables. |
| `components.css` | `font-faces.css` + `styles.css`.                           |
| `styles.css`     | Generated component rules, without font faces or tokens.   |
| `font-faces.css` | Font-face declarations only.                               |

## Authoring `style()`

Using the published components does not require a macro plugin. Their styles are
already generated in the package build.

You only need the macro setup if your app writes its own `style()` calls from
`@proyecto-viviana/ui/style`:

```ts
import { style } from "@proyecto-viviana/ui/style" with { type: "macro" };
```

For Vite apps, use the package helper:

```ts
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { vivianaMacros } from "@proyecto-viviana/ui/vite";

export default defineConfig({
  plugins: [vivianaMacros(), solid({ ssr: true })],
  optimizeDeps: {
    exclude: ["@proyecto-viviana/ui", "@proyecto-viviana/solid-spectrum"],
  },
  ssr: {
    noExternal: ["@proyecto-viviana/ui", "@proyecto-viviana/solid-spectrum"],
  },
});
```

`vivianaMacros()` uses `unplugin-parcel-macros`, which is an optional peer. Add it
as a dev dependency when you use the helper:

```bash
npm install -D unplugin-parcel-macros
```

## Status

`@proyecto-viviana/ui` is published and in active development. Expect APIs,
package boundaries, and component behavior to keep tightening while the suite
settles.

The package ships ESM, preserved-JSX `solid` exports, and TypeScript
declarations.
