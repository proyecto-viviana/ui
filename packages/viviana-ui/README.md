# @proyecto-viviana/ui

Styled, accessible components for Solid 2: the Viviana design system.

Buttons, text fields, pickers, menus, tabs, calendars, color controls, and list
and tree views. The keyboard, screen-reader, and internationalization behavior
is ported from Adobe's React Aria. The tokens and the type are Viviana's own.

This is the package to start with. Reach for a lower one only when you need to
build behavior yourself.

## Install

Requires **Solid 2**. `solid-js` and `@solidjs/web` are peer dependencies, at
`>=2.0.0-rc.9 <3`.

```bash
npm install @proyecto-viviana/ui@rc solid-js@next @solidjs/web@next
```

The release candidate is on the `rc` tag. The `latest` tag is the Solid 1
line.

## Example

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

Deep imports such as `@proyecto-viviana/ui/TextField` are preferred in app
code. The root barrel is for examples and shared entry points.

## Styling

Components never inject CSS. Import it once, at your app entry, before your
own stylesheets.

| Subpath | Contents |
| --- | --- |
| `components.css` | `font-faces.css` + `theme.css` + `styles.css`. The usual import. |
| `theme.css` | The token layer alone: it imports `viviana-tokens.css`. |
| `styles.css` | Generated component rules, without fonts or tokens. |
| `font-faces.css` | The Geist register: Geist Pixel, Geist, Geist Mono. |
| `viviana-tokens.css` | The tokens themselves, to theme against directly. |

`font-faces.css` opens with a remote `@import`, and CSS drops an `@import` that
any rule precedes. Load it after your own rules and the fonts silently fall
back to the default sans-serif.

### Alongside Tailwind

This package ships no Tailwind and needs none. To use both, declare the layer
order yourself, before any import:

```css
@layer theme, base, _, L, components, utilities;

@import "tailwindcss";
@import "@proyecto-viviana/ui/components.css";
```

`_` and `L` are the two layers the generated component rules live in. Layer
order is otherwise decided by first appearance, and both accidents are silent:
declare nothing and our layers sort last, so a `bg-red-500` on one of our
components does nothing; put our layers first and Tailwind's Preflight strips
our components back to bare.

## Server rendering

The package ships compiled DOM output for a plain `import`, and preserved JSX
under the `solid` export condition, which your bundler compiles for the server.
A server that loads the DOM build cannot render it. With Vite, keep the family
inside the bundle:

```ts
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid({ ssr: true })],
  ssr: { noExternal: [/@proyecto-viviana\/.*/] },
});
```

The project's own docs site server-renders with the same `noExternal` line.

## Authoring `style()`

Using the published components needs no macro plugin. Their styles are
generated when the package is built. You need the macro only if your app
writes its own `style()` calls:

```ts
import { style } from "@proyecto-viviana/ui/style" with { type: "macro" };
```

For Vite, use the package helper:

```ts
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { vivianaMacros } from "@proyecto-viviana/ui/vite";

export default defineConfig({
  plugins: [vivianaMacros(), solid({ ssr: true })],
  optimizeDeps: { exclude: ["@proyecto-viviana/ui"] },
  ssr: { noExternal: ["@proyecto-viviana/ui"] },
});
```

`vivianaMacros()` uses `unplugin-parcel-macros`, an optional peer. Add it as a
dev dependency when you use the helper:

```bash
npm install -D unplugin-parcel-macros
```

## In the chain

```text
solid-stately
      ↓
solidaria
      ↓
solidaria-components
      ↓
      ├─ solid-spectrum
      ├─ @proyecto-viviana/ui    ← you are here
      ├─ kumo
      └─ geist
```

It depends on the three headless packages. It does not depend on
`@proyecto-viviana/solid-spectrum` at run time; the two are siblings over the
same foundation.

## Status

Published, and changing. APIs, package boundaries, and component behavior
are still tightening. An export is a floor, not proof that a component matches
upstream.

The package ships ESM, preserved-JSX `solid` exports, and TypeScript
declarations. `sideEffects` is `false`.

## Evidence

```bash
vp run --filter @proyecto-viviana/ui build
vp run test:run
vp run a11y:check        # WCAG 2.2 AA, every route, both themes
```

What "ported" means here, and what evidence a component carries before it
counts, is [the evidence bar](https://github.com/proyecto-viviana/ui/blob/main/.claude/current/certification.md).

## Links

- Documentation: <https://ui.proyectoviviana.org>
- Repository: <https://github.com/proyecto-viviana/ui>

## License

MIT AND Apache-2.0. Our work is MIT; the part derived from Adobe's React
Spectrum S2 keeps Apache-2.0. Both licenses and the project `NOTICE` ship in
this package.
