# @proyecto-viviana/ui

Viviana UI's design-system package, built on Solid.

Viviana UI and `@proyecto-viviana/solid-spectrum` are sibling styled libraries
over the same `solid-stately` → `solidaria` → `solidaria-components` foundation.
Viviana keeps an owner-ratified reskinned source fork of Spectrum's component
shape, with its own tokens and style-macro build. It does not depend on
`@proyecto-viviana/solid-spectrum` at runtime.

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

Most apps need one import — `components.css` already contains the other three:

```ts
import "@proyecto-viviana/ui/components.css";
```

Apps that manage font loading themselves can import the halves separately:

```ts
import "@proyecto-viviana/ui/theme.css";
import "@proyecto-viviana/ui/styles.css";
```

| Subpath          | Contents                                                         |
| ---------------- | ---------------------------------------------------------------- |
| `components.css` | `font-faces.css` + `theme.css` + `styles.css`. The usual import. |
| `theme.css`      | Color-scheme tokens + Viviana brand `--color-*` variables.       |
| `styles.css`     | Generated component rules, without font faces or tokens.         |
| `font-faces.css` | Font-face declarations, including the Geist register.            |

Keep these as `@import` statements at the very top of your CSS entry, or as JS
imports before any other stylesheet. `font-faces.css` begins with a remote
`@import` for the Geist family, and CSS drops an `@import` that any rule
precedes — load it after your own rules and the Geist register silently falls
back to the default sans-serif.

### Using Tailwind alongside these styles

The library ships no Tailwind and requires none. If your app uses Tailwind, the
two coexist — but only if you declare the cascade layer order yourself, **before
any import**:

```css
@layer theme, base, _, L, components, utilities;

@import "tailwindcss";
@import "@proyecto-viviana/ui/components.css";
```

`_` and `L` are the layers our generated component rules live in. Layer order is
otherwise decided by first appearance, and both possible accidents are silent:

- **No declaration.** Tailwind's sheet is seen first, so our layers sort last and
  win. A `bg-red-500` on one of our components does nothing at all — the class is
  in the DOM, the color never applies.
- **Our layers first.** Tailwind's Preflight (`@layer base`) then outranks us, and
  its `button { background-color: transparent }` strips our components back to
  bare.

The order above is the only one that gets both halves right: Preflight cannot
reach our components, and Tailwind utilities still override them.

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
    exclude: ["@proyecto-viviana/ui"],
  },
  ssr: {
    noExternal: ["@proyecto-viviana/ui"],
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
