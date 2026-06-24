# @proyecto-viviana/ui

## 0.4.0

### Minor Changes

- b819612: Complete the deep-subpath export surface for `@proyecto-viviana/ui`

  Every Spectrum component re-exported from `@proyecto-viviana/solid-spectrum` now
  has a matching `@proyecto-viviana/ui/<Component>` subpath (the package previously
  shipped only a partial set alongside the root barrel), plus a
  `@proyecto-viviana/ui/style/runtime` entry for the style-macro runtime helpers.
  The export map now reaches full parity with `solid-spectrum` (all 39 of its
  subpaths are re-exported) while keeping viviana's own product components
  (`CalendarCard`, `Chip`, `Conversation`, `EventCard`, `Logo`, `PageLayout`,
  `ProfileCard`, `ProjectCard`, `TimelineItem`) as additional `ui`-owned subpaths.
  Top-level `main`/`module`/`types` fields are added to mirror `solid-spectrum`, so
  tooling that ignores the `exports` map still resolves the root barrel.

  Each subpath ships all four conditions (`types`/`solid`/`import`/`default`) and
  is verified end-to-end by the out-of-workspace consume smoke, which installs the
  packed tarballs, builds for DOM and SSR, and asserts every export-map file exists
  on disk and every JS subpath resolves through Node's resolver.

- 0285e8e: Add a supported Vite macro preset for app-authored `style()` calls

  Apps that consume the pre-built components need no macro plugin — those
  `style()` calls are already expanded in the published build. But an app that
  authors its own `style()` against `@proyecto-viviana/ui/style` (the macro seam)
  must run the macro at its own build, and until now there was no shipped way to
  do that: downstream apps hand-copied a wrapper around `unplugin-parcel-macros`
  to make the macro's emitted `import "macro-<hash>.css"` virtual modules resolve
  and load under rolldown-vite.

  A new `@proyecto-viviana/ui/vite` export ships that wrapper as a supported
  preset, `vivianaMacros()`:

  ```ts
  import { vivianaMacros } from "@proyecto-viviana/ui/vite";
  // vivianaMacros() must come before vite-plugin-solid (and framework plugins):
  plugins: [vivianaMacros(), solid({ ssr: true })],
  ```

  `vivianaMacros()` wraps `macros.rolldown()` and teaches Vite to resolve/load the
  macro-emitted CSS (caching it on transform, serving it through a `.css` virtual
  module, and stripping the JS import from the server bundle so SSR builds don't
  fail to resolve it). `unplugin-parcel-macros` is declared as an optional peer
  dependency so the app's own instance is used; it stays external in the helper's
  build. The `optimizeDeps` / `ssr.noExternal` lists stay app-owned and are
  documented in `README.md`.

  `scripts/macro-preset-smoke.mjs` is an executable reference: it builds an
  app-authored `style()` call through `vivianaMacros()` for both DOM and SSR,
  asserting the macro generates CSS (the sentinel lands in the DOM CSS asset) and
  that the `style()` runtime class expands in the SSR-rendered HTML.

### Patch Changes

- f1cb8f3: Thin the solid-spectrum `.` barrel and serve the JSX-free style modules as `.js`

  `solid-spectrum`'s `dist/index.jsx` re-exported the whole library inline (~520 KB)
  and the JSX-free `dist/style/index.jsx` weighed ~1.26 MB — both over the 500 KB
  Babel `compact` deopt threshold. Any consumer of the `@proyecto-viviana/ui` root
  barrel (which re-exports solid-spectrum) therefore tripped the Solid-compiler
  "code generator has deoptimised … exceeds 500KB" warning, even though the two
  lower packages were already split (UC-05).

  The build now promotes every barrel re-export target to its own entry, so
  `dist/index.jsx` is a thin re-export (~11 KB) and the largest emitted `.jsx` is
  ~54 KB. `src/icon/index.tsx` stays inlined on purpose so its unused 410-icon
  `s2wfIcons` namespace tree-shakes away rather than being rooted by an entry.
  `./style` and `./style/runtime` carry no Solid template code, so their `solid`
  export condition now points at the prebuilt `.js` (the `.jsx` is no longer
  emitted) — the `style()` macro still expands at the consumer build. No public
  export was removed; this is internal build shape plus a condition change, so
  existing imports keep working — a root-barrel `@proyecto-viviana/ui` import now
  builds with no deopt warning.

- ff6d98f: Fix the CSS export contract and drop a redundant built stylesheet

  Each CSS subpath (`styles.css`, `components.css`, `theme.css`, `font-faces.css`)
  previously exported `{ import: ./dist/X.css, default: ./src/X.css }`. The
  `src/*.css` are build _sources_ — `src/styles.css` is only the unresolved
  `@import "@proyecto-viviana/solid-spectrum/styles.css"` and is missing the macro
  CSS that the build inlines — so any consumer or tool resolving via the `default`
  condition silently got an incomplete sheet. Each CSS subpath now resolves to its
  single built `dist/*.css` target, so every resolution path yields the complete
  stylesheet.

  The build also dropped the redundant `dist/style.css` sidecar that `vp pack`
  emits for the `style` entry: its atomic rules are already inlined into
  `styles.css` and nothing imports it. The built CSS inventory now equals the
  exported set (plus `viviana-tokens.css`, which is intentionally internal and
  reachable only through `theme.css`'s relative `@import`).

  `README.md` documents the styling contract: apps import the UI CSS explicitly
  (`theme.css` + `components.css`), and `Provider` establishes runtime context but
  injects no CSS.

- 7fcb1d6: Virtualizer: virtualize collections that scroll with the page (port of react-aria-components 1.18 window scrolling)

  React Aria's `ScrollView` does not assume a virtualized collection has its own
  scroll container. It computes the visible rect as the intersection of the scroll
  view's content size with the browser window viewport, tracking how far the scroll
  view has been pushed above the viewport by page (or ancestor) scrolling. React
  Aria Components enables this by default — `CollectionRoot` hard-codes
  `allowsWindowScrolling: true` — so a `ListBox`, `Table`, `Tree`, etc. rendered at
  its natural height inside a normally scrolling page still only mounts the rows
  that are actually on screen.

  Previously our `Virtualizer` measured only its own element: the visible window
  was the element's `clientHeight` and the offset was the element's `scrollTop`. A
  collection that grew to its full height and scrolled with the page therefore
  rendered every row, defeating virtualization.

  The `Virtualizer` now mirrors upstream:
  - The effective viewport height is the scroll view's height intersected with the
    window viewport (`max(0, min(elementHeight - viewportOffset, window.innerHeight))`).
  - The visible-range offset is the element's own scroll position plus
    `viewportOffset` — how far the scroll view's top edge sits above the window
    viewport, derived from `getBoundingClientRect()`.
  - A single document-level capturing `scroll` listener updates the local scroll
    position when the scroll view itself scrolls, and the window offset when an
    ancestor or the page scrolls, matching `ScrollView`'s capturing listener.

  A new `allowsWindowScrolling` prop (default `true`) opts out: set it to `false`
  to restrict virtualization to the element's own scroll container, which is the
  previous behavior. An explicit `viewportSize` layout option still takes
  precedence over the measured window viewport.

  For a fixed-height collection that sits entirely within the viewport this is
  behavior-preserving — the `window ∩ element` math reduces to the element's own
  scroll — so existing collections are unaffected unless they actually scroll with
  the page.

  Two parts of upstream `ScrollView` are intentionally left as follow-ups and do
  not affect window-scroll correctness: the `isScrolling` state (which toggles
  `pointer-events: none` on the content while scrolling) and the imperative
  `scrollToItem`/`scrollToRect` API.

- 987a43b: Fix custom components that passed boolean render conditions to the S2 `style()`
  macro without the `is`/`allows` prefix it requires. The macro only treats
  `default`, CSS conditions, and `is*`/`allows*` keys as runtime conditions, so
  `withHeader`, `user`, `inactive`, `active`, and `transparent` were silently
  dropped — and where a boolean was the only runtime condition (`PageLayout`,
  `ConversationBubble`) the style collapsed to a static class string that threw
  `"<name> is not a function"` when called. Renamed the internal conditions to the
  `is`-prefixed form (`isWithHeader`, `isUser`, `isInactive`, `isActive`,
  `isTransparent`) with the public props unchanged, so `PageLayout`,
  `Conversation`, `ProjectCard`, and `LateralNav` render and apply their
  conditional styling correctly.
- Updated dependencies c3041bf:
- Updated dependencies 9a7c865:
- Updated dependencies 1fb52f6:
- Updated dependencies c0a8ec9:
- Updated dependencies 237ed4a:
- Updated dependencies 83c9a6f:
- Updated dependencies 5bc7d29:
- Updated dependencies 4439c99:
- Updated dependencies d99d486:
- Updated dependencies 69d7ee4:
- Updated dependencies 6aaca3e:
- Updated dependencies 065427a:
- Updated dependencies 3514b40:
- Updated dependencies 58a62d5:
- Updated dependencies 7de4ea8:
- Updated dependencies a6aa0af:
- Updated dependencies d03dac4:
- Updated dependencies 18ec24f:
- Updated dependencies 5a741e0:
- Updated dependencies 220ba68:
- Updated dependencies 5db5585:
- Updated dependencies 7e7fe8c:
- Updated dependencies 92c0cc2:
- Updated dependencies 14aec15:
- Updated dependencies aee055a:
- Updated dependencies 229dbed:
- Updated dependencies f7df649:
- Updated dependencies 1896fe4:
- Updated dependencies 7e0fcaa:
- Updated dependencies cc47204:
- Updated dependencies 5f77a00:
- Updated dependencies 58904aa:
- Updated dependencies 2a24e59:
- Updated dependencies ddd697d:
- Updated dependencies f1cb8f3:
- Updated dependencies e820a54:
- Updated dependencies b113196:
- Updated dependencies af687ed:
- Updated dependencies 608a401:
- Updated dependencies c6fbde7:
- Updated dependencies b0a822c:
- Updated dependencies c2b8c5e:
- Updated dependencies edd9453:
- Updated dependencies 7fcc93e:
- Updated dependencies 649371e:
- Updated dependencies b0a822c:
- Updated dependencies 4b2e5e1:
- Updated dependencies 187b74b:
- Updated dependencies 394f4da:
- Updated dependencies f7c038d:
- Updated dependencies 228f14a:
- Updated dependencies 736ad7d:
- Updated dependencies 6381499:
- Updated dependencies 75a40f6:
- Updated dependencies cfc0432:
- Updated dependencies e63d870:
- Updated dependencies 6588833:
- Updated dependencies 727b16b:
- Updated dependencies 430a55f:
- Updated dependencies 2fc94b6:
- Updated dependencies 7fcb1d6:
- Updated dependencies d0ae46e:
  - @proyecto-viviana/solid-spectrum@0.6.0
  - @proyecto-viviana/solidaria-components@0.4.0

## 0.3.6

### Patch Changes

- 3a740bb: Fix TextField label hydration during SSR and republish the Viviana UI package chain against the fixed components.
- Updated dependencies 3a740bb:
  - @proyecto-viviana/solid-spectrum@0.5.4

## 0.1.4

### Patch Changes

- Expose button, provider, form, input, segmented control, switch, and icon component subpaths for direct Viviana UI imports.
- Updated dependencies:
  - @proyecto-viviana/solid-spectrum@0.5.3

## 0.1.3

### Patch Changes

- 0588d1e: Expose CSS entrypoints that mirror solid-spectrum so apps can import component styles through viviana-ui.

## 0.1.2

### Patch Changes

- [`7502ee7`](https://github.com/proyecto-viviana/ui/commit/7502ee70a735d1831a2c62b581fb0ba690146327) Thanks [@EmoPorEmilio](https://github.com/EmoPorEmilio)! - Keep Button and ActionButton dynamic aria trigger props reactive, and export BellIcon from the root Spectrum/Viviana surface.

- Updated dependencies [[`7502ee7`](https://github.com/proyecto-viviana/ui/commit/7502ee70a735d1831a2c62b581fb0ba690146327)]:
  - @proyecto-viviana/solid-spectrum@0.5.2

## 0.1.1

### Patch Changes

- Updated dependencies []:
  - @proyecto-viviana/solid-spectrum@0.5.1

## 0.1.0

### Minor Changes

- [`d219335`](https://github.com/proyecto-viviana/ui/commit/d21933524091ef5072a48dcc00ce5da9a7f5832a) Thanks [@EmoPorEmilio](https://github.com/EmoPorEmilio)! - Build with tsdown (Rolldown/Oxc) and adopt the standard Solid-library
  JSX-preserve layout.

  The `solid` export condition now resolves to a built, JSX-preserved `dist/*.jsx`
  entry that the consumer compiles per-environment, alongside a compiled
  `dist/*.js` `default` fallback — replacing the dual DOM+SSR bundle (whose SSR
  half was never wired into `exports`). SSR consumers can now resolve the packages
  from `node_modules` without recompiling first-party source. solid-spectrum's
  `style()` macro still runs at build time (emitting `styles.css`), so consumers
  don't need the macro plugin. viviana-ui ships its first real dist (a thin
  re-export of solid-spectrum).

### Patch Changes

- Updated dependencies [[`d219335`](https://github.com/proyecto-viviana/ui/commit/d21933524091ef5072a48dcc00ce5da9a7f5832a)]:
  - @proyecto-viviana/solid-spectrum@0.5.0
