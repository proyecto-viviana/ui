# @proyecto-viviana/ui

The viviana brand's design system.

It **re-exports `@proyecto-viviana/solid-spectrum`** — every Spectrum component is
available from the root barrel and from a deep `@proyecto-viviana/ui/<Component>`
subpath — and adds viviana's own product components (cards, chips, conversation,
page layout, logo, timeline). This is the package the
`@proyecto-viviana/social` apps depend on, and the point from which viviana
diverges from Spectrum.

Keeping in sync with solid-spectrum (which files to check, the update plan when a
new React Spectrum release is ported) is documented in
**[UPSTREAM.md](./UPSTREAM.md)**.

## Install

```bash
npm install @proyecto-viviana/ui solid-js
```

```tsx
import { Provider, Button } from "@proyecto-viviana/ui";
// Prefer deep subpaths in app code (smaller graphs, no root-barrel pull):
import { TextField } from "@proyecto-viviana/ui/TextField";

// Load the design system's CSS once, at the app entry (see "Styling" below):
import "@proyecto-viviana/ui/theme.css";
import "@proyecto-viviana/ui/components.css";

export function App() {
  return (
    <Provider colorScheme="dark">
      <Button variant="accent">Save</Button>
    </Provider>
  );
}
```

## Styling

The design system's CSS is **not** injected by any component — `Provider`
establishes runtime context (color scheme, locale, router) and sets the matching
attributes/classes, but it imports **no** stylesheet. Apps must import the CSS
explicitly, once, at their entry. Pick one of two equivalent shapes:

- `@proyecto-viviana/ui/components.css` — the umbrella: font faces **plus** the
  atomic/macro component rules. Import this and you have everything except tokens.
- or `@proyecto-viviana/ui/font-faces.css` **and**
  `@proyecto-viviana/ui/styles.css` separately — the two halves of
  `components.css`, for apps that manage font loading themselves.

In both cases also import `@proyecto-viviana/ui/theme.css` — the theme layer:
solid-spectrum's color-scheme tokens **plus** viviana's brand token variables
(`--color-*`), which the viviana product components reference. Without it those
components render unstyled colors.

### File roles

| Subpath          | Contents                                                   |
| ---------------- | ---------------------------------------------------------- |
| `theme.css`      | Color-scheme tokens + viviana brand `--color-*` variables. |
| `components.css` | `font-faces.css` + `styles.css` (the all-in-one).          |
| `styles.css`     | Atomic/macro component rules (no font faces, no tokens).   |
| `font-faces.css` | `@font-face` declarations only.                            |

Every CSS subpath resolves to the **built** `dist/*.css` through a single export
target — there is no condition that yields the incomplete `src/*.css` build
sources. The set of built stylesheets equals the set of exported sheets, except
`viviana-tokens.css`, which is intentionally internal: it ships in `dist` only so
`theme.css`'s relative `@import "./viviana-tokens.css"` resolves, and is not a
public subpath.

## Authoring `style()` macros in an app

Consuming the pre-built components needs **no** macro plugin — their `style()`
calls are already expanded in the published build. A plugin is only required if
your app authors its own `style()` macro calls against
`@proyecto-viviana/ui/style`:

```ts
import { style } from "@proyecto-viviana/ui/style" with { type: "macro" };
```

That path needs `unplugin-parcel-macros` wired into the app's Vite config (the
macro is compiled at the app's build) and the ui + solid-spectrum packages
excluded from `optimizeDeps`. See the consume smoke
(`scripts/consume-pack-smoke.mjs`) for the minimal pre-built-consumer Vite setup.

## Status

Published build: dual `.js` (DOM-compiled) / `.jsx` (JSX-preserved, the `solid`
export condition) packs with `.d.ts` types, consumable out-of-workspace from the
packed tarballs (proven by `scripts/consume-pack-smoke.mjs`). Releasable on npm.
