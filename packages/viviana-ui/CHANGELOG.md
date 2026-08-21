# @proyecto-viviana/ui

## 0.6.3

### Patch Changes

- 82965fe: Fix Form SSR hydration: do not reify `props.children` into FormContext.

  Solid's `props.children` is a create-on-read getter. Spreading full Form props into FormContext (safe in React Aria Components) double-created the child tree and desynced `createUniqueId` hydration keys — Form + sole Spectrum Button blanked consumer routes (effect-latam /perfil, /foros). Context now carries only `validationBehavior`. Spectrum / viviana-ui Form leave children as lazy headless props (no forced render-prop wrapper). Guarded by Form SSR + hydrate fixtures.

- a0f3cc8: Give every package the metadata npm renders.

  None of the five set `homepage` or `bugs`, so the npm page had no link to
  documentation and no way to report a problem. `homepage` now points at the docs
  site — https://ui.proyectoviviana.org — and `bugs` at the shared issue tracker.

  `@proyecto-viviana/ui` also had no keywords at all — it could not be found by
  search — and a description written for a maintainer rather than a user ("a
  reskinned fork of @proyecto-viviana/solid-spectrum: the styled top layer is
  duplicated and remapped to the Viviana v2 register"). It now says what the
  package is: the Viviana design system for SolidJS, accessible and themeable, on
  a headless ARIA foundation.

  `guard:outbound-links` checks all of it, so a new package cannot publish
  anonymously.

- 20fb616: Raise placeholder, secondary text, link, interactive-fill, and semantic bold-fill contrast across light and dark Viviana themes.

  Match React Aria's Select trigger naming when consumers provide `aria-label`, so the visible placeholder or selected value remains part of the computed accessible name.

- f028624: Let `Flex` take an inline `style`, the way `Grid` already does.

  `Grid` splits `style` out of its props and merges it into the declarations it
  generates, so a consumer can add a margin or a min-width without giving up the
  primitive. `Flex` declared no such prop: anything passed landed in `rest` and
  was then overwritten by the `style={flexStyle()}` assignment on the container,
  so it vanished with no type error and no warning. The two primitives are meant
  to be interchangeable, and the gap forced every decorated row back onto a bare
  `div`.

  `style` is now merged first and the derived flex declarations are applied after
  it — mirroring `Grid`'s ordering — so `direction`, `gap`, `wrap`, `alignItems`,
  and `justifyContent` still win over a hand-written override of the same
  property.

- Updated dependencies 82965fe:
- Updated dependencies a0f3cc8:
- Updated dependencies 20fb616:
  - @proyecto-viviana/solidaria-components@0.5.1
  - @proyecto-viviana/solid-stately@0.5.1
  - @proyecto-viviana/solidaria@0.4.3

## 0.6.2

### Patch Changes

- b4e9b9f: Load the Geist font register again by moving its `@import` to the top of
  `font-faces.css`.

  The remote `@import` for Geist / Geist Mono / Geist Pixel sat at the end of the
  file, after ~11KB of inlined S2 `@font-face` rules. CSS requires `@import` to
  precede every rule other than `@charset` and `@layer` statements, so the rule
  was invalid: browsers ignored it and bundlers stripped it from the output
  entirely. The `--font-ui` / `--font-mono` / `--font-display` tokens still named
  the Geist families, so every consumer silently rendered the whole Glasselated
  register in the fallback sans-serif, with no warning and no failed request.

  Verified against a packed consumer in a real browser: previously zero Geist
  faces registered and zero font requests; now all three families register and
  load, with Geist measuring distinctly from both the fallback and a nonexistent
  family.

## 0.6.1

### Patch Changes

- Updated dependencies eea8910:
- Updated dependencies eea8910:
  - @proyecto-viviana/solid-stately@0.5.0
  - @proyecto-viviana/solidaria-components@0.5.0
  - @proyecto-viviana/solidaria@0.4.2

## 0.6.0

### Minor Changes

- 0eea012: Badge learns the register's status run: new `live` and `metric` variants (the
  LIVE pill breathes at 0.25Hz, gated on prefers-reduced-motion; metric is the
  sky-blue that replaced the retired violet channel), and subtle fills now carry
  same-channel ink instead of flat gray. Tokens retire violet to the sky-blue
  metric hue across both schemes (`--violet-500` kept as a legacy alias).
- ab8f0a6: Card gains the Glasselated mesh axis: `mesh="ambient" | "signal"` renders the
  seeded hex-weave as a scheme-flipping background-image (riding the lightningcss
  space-toggle atoms, so it follows the Provider color scheme with no JS),
  `meshSeed` varies the weave, and `data-mesh` is stamped on the root for
  app-level mesh-field treatments. CardPreview gains `background="inset"` for the
  register's recessed console-strip fill. The `meshStrip()` generator is now a
  public export (`meshStrip`, `MeshStripOptions`).
- 2b79f59: Register prompt wells: field `suffix` slot, SearchField `prefix`, and the tutor surface.
  - New shared `FieldSuffix` slot — trailing adornment inside the field group
    (key hints, units), styled as the mirror of the prefix slot. Its id joins
    the input's `aria-labelledby` alongside the prefix id, and the labelledby
    wiring now resolves ids lazily so adornments can mount/unmount live.
  - `TextField` and `SearchField` accept `prefix` and `suffix`. SearchField's
    `prefix` renders in place of the built-in magnifier icon; its `suffix`
    sits between the input and the clear button.
  - `TextField` gains `surface?: "well" | "tutor"` — the tutor surface is the
    register's AI-lane fill (`--surface-well-tutor` / `--well-tutor-ink`),
    one step deeper than the search well in dark and identical to it in light.

- 0cf5b0c: The Glasselated pixel icon set and the register's two Tabs navigation forms. 34 new `Pixel*Icon` components (pixel-art SVGs from the design lane, createIcon-wrapped, each with its own build entry). Tabs gains `variant?: "line" | "pill"`: pill is the mobile tab bar — a full-radius glass capsule spreading column-flex slots (pixel icon stacked over a 10px micro label) space-around, with no selection indicator and no overflow collapse. Vertical tabs become the register rail: the indicator gives way to a mono ">" caret that ghosts in on hover and pins on the active row, rows sit on a flat 32px floor with 12px semi-bold labels, and a `NotificationBadge` child now parks flush right via a badge slot (`order: 2`, `marginStart: auto`).
- baf4768: Discrete/dithered progress lands across the status family. ProgressCircle draws the register ring — 16 quantized pixel blocks on a circle, lit blocks blinking in with staggered step-end delays, a two-block dithered lead, and a centered children readout slot. ProgressBar gains `pendingValue`, the XP bar's dithered in-flight segment after the solid fill. Meter gains `segments`, the wells' `[▮▮▮▯▯]` capacity form as variant-inked blocks. StatusLight gains the sky-blue `metric` variant and register ink-toning on labels. AvatarGroup accepts the register's `30` stack size and overlaps stacked avatars by 30% of their diameter.
- e32603d: Semantic status trio (negative / warning / success) across every status surface.
  - New cohesive `green` ramp backs `positive`/`success` and by-name `green`, so
    success stops aliasing blue and reads as a real state next to accent. Every
    stop is contrast-matched to its amber sibling, so red/amber/green sit at one
    weight wherever the three appear together. `warning` stays on amber, distinct
    from the create-yellow wash.
  - `Button`/`LinkButton` drop the inherited `premium` and `genai` variants and
    gain `warning` and `success` — negative's semantic counterparts, saturated
    fill with white ink on the amber and green channels. (Removing `premium`/
    `genai` is a breaking change for consumers that referenced them.)
  - `StatusLight`, `InlineAlert`, and `Meter` accept a public `success`/`warning`
    variant that folds onto the canonical `positive`/`notice` channels.
  - `Toast` gains the `notice` channel (its warning slot) with the diamond icon
    and a `ToastQueue.notice` method; `success` rides `positive`.
  - Fixes a latent bug: portaled toasts inherited no color-scheme, so
    lightningcss's downlevelled `light-dark()` left the bold fills transparent on
    every variant. The region now carries the scheme atoms via `setColorScheme()`,
    restoring the solid fills (negative red, positive green, notice amber, info
    blue) with white ink.

- 6a45374: Ship the register's nine-role type ladder as a public API. New `typeRoles` export (with the `TypeRole` type) exposes one precompiled class per role — display, title, headline, label, body, meta, micro, terminal, button — at the register's exact metrics, usable through any `styles` prop or as a plain class. Heading levels 1–3 now render the display/title/headline tiers verbatim (28/20/15px with the inverted 500/600/700 weight ladder and +0.01em pixel-face tracking); h4+ share the headline rung. Standalone `Text`, `Content`, and `Keyboard` bake the meta, body, and terminal roles respectively — only when no slotted context claims them, so composed hosts (Button, MenuItem, Card…) are byte-identical to before. The style theme gains a `semi-bold` (600) font weight and a `letterSpacing` property (0/0.01em/0.1em) to make the ladder expressible.
- 1d8d174: Well is now a public export. The matte terminal container — opaque well surface, 4px scan dither, 1px hairline border, 10px radius, never glass — was already in the package; it now ships from the barrel with its props type.

### Patch Changes

- b9817f3: ActionGroup items now paint correctly: the headless layer renders each item as a bare button with no class hook, so the UA button chrome (opaque ButtonFace fill, 2px outset border) painted around the styled span — burying the transparent resting state under grey lozenges and clipping the selected accent pill. The container now ships a css() reset for its direct-child buttons.
- 094bf48: Restyle TabSwitch to the Glasselated raised-pill idiom and make it actually paint: the native button chrome (opaque ButtonFace fill, 2px outset border) was covering the sliding indicator, leaving the selected label as white text on a bare UA lozenge — illegible in light. Buttons now reset UA chrome; the track is the inset glass surface with a subtle border; the indicator is the raised surface with the edge-glass rim; inks are secondary/primary instead of white-on-accent, matching the island's segmented pill.
- ea16b07: Resolve every CSS subpath export to `dist`, so a consumer can never be handed a
  build source instead of the built sheet.

  The five CSS entries were conditional — `{ "import": "./dist/X.css", "default":
"./src/X.css" }` — and `src/styles.css` is no longer a real sheet: since the
  macro started emitting one flat atomic file, it is a 64-byte comment, against
  73KB of shipped CSS in `dist/styles.css`. Any resolver that fell through to
  `default` (a CSS-level `@import` of the package, a `require`-conditioned
  bundler) therefore got no component styling at all, and `components.css` — the
  single-file convenience entry — inherited the same hole through its relative
  `@import`. The subpaths are now plain strings pointing at `dist`, which resolves
  identically under every condition.

  The out-of-workspace consume smoke also stops fingerprinting the retired
  `inline-macro-css.mjs` mechanism (a marker comment plus a nested
  `@proyecto-viviana/solid-spectrum` `@import`, neither of which the current build
  emits) and asserts the actual contract instead: the shipped sheet carries no
  unresolvable bare `@import`, and every class the SSR render emits has a matching
  rule in it.

- 9be6690: Split the Glasselated edge-glass rim into a control rim and a surface rim, and
  brighten both on dark.

  The night `--edge-glass` top highlight was `rgba(255,255,255,0.14)` — all but
  invisible — while daylight sat at `0.9`. Controls (buttons, chips, badges, tags,
  nav pills, switches, meters) now match daylight exactly at `0.9 / 0.35`: they are
  opaque, so their own fill contains the rim and it reads as the same lit edge in
  either scheme.

  Translucent containers cannot carry that value. Over a dark blurred backdrop the
  full-strength ring outlines the whole container instead of catching its edge, so
  they take a new `--edge-glass-surface` at `0.45 / 0.09` — cards, panels, popovers,
  modals, trays, menus, the pill tab bar, and anything built on the `glassSurface()`
  helper. The `boxShadow` theme keys follow suit: `emphasized` and `elevated` resolve
  to the surface rim, `edge-glass` stays the control rim, and `edge-glass-surface` is
  available for components that spell it directly. Daylight declares both aliases at
  the same value — white-on-light barely separates from its ground, so one rim lifts
  a button and a panel alike.

  The `edgeGlassShadow` / `edgeGlassSurfaceShadow` fallbacks in
  `style/spectrum-theme.ts` (used when a consumer never loads the token file) track
  the same night values.

- b31606d: Fix the Tree hydration abort ("Unable to find DOM nodes for hydration key"): a repeated `children`-prop read re-instantiated item content on the server, shifting every hydration key past the first item and killing the whole route. Standalone components now hug their content instead of stretching in grid or column-flex parents (ActionGroup, Toolbar, Card — `height: 100%` is now CardView-only). ColorEditor sizes its headless ColorArea/ColorSlider parts, which ship gradients but no dimensions. AssetCard previews give icons the square illustration treatment, scoped to the preview slot. Bespoke StepList Step children keep the flex-row list layout.

## 0.5.0

### Minor Changes

- 95be403: Retune the Viviana UI token layer to the blue + amber frosted-glass visual system. The accent family moves from pink to amber (the single warm, one-per-screen action color); blue continues to carry wayfinding and selection. New **surface**, **blur**, **edge-glass**, and **shadow/glow** token families express the frosted-glass surface ladder. Semantic success/warning/danger tokens are unchanged, and every consumed `--color-*` name is preserved. Dark stays the default scheme with a light override under `data-color-scheme="light"`.

### Patch Changes

- Updated dependencies 95be403:
  - @proyecto-viviana/solid-spectrum@0.6.2

## 0.4.1

### Patch Changes

- 515ed20: Fix overlay positioning so Popover-based components (Picker, ComboBox, DatePicker, Menu) anchor to their trigger instead of rendering at the viewport origin. The popover ref is now a reactive signal, so the position effect re-runs once the overlay's portal node mounts — matching React Aria's layout-effect timing.
- 0997a0a: Expand app-authored style macros in TanStack split-route modules while preserving Vite semantic query imports.
- 8060dff: Keep TextField and TextArea public `onChange` callbacks string-only by preventing
  field-wrapper event leakage, with controlled and uncontrolled hydration coverage.
- 63dddb3: Bring DateField, TimeField, DatePicker, and DateRangePicker into upstream parity across state, ARIA, headless composition, and Spectrum styling. This release restores the segmented spinbutton and internationalized date-field behavior, composes the picker surfaces from their upstream component units, and adds strict React-versus-Solid regression coverage for observable behavior and appearance.
- Updated dependencies 515ed20:
- Updated dependencies 8060dff:
- Updated dependencies 63dddb3:
  - @proyecto-viviana/solidaria-components@0.4.1
  - @proyecto-viviana/solid-spectrum@0.6.1

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
- Updated dependencies e847071:
- Updated dependencies c3041bf:
- Updated dependencies 9a7c865:
- Updated dependencies 247990a:
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
- Updated dependencies 0a99e94:
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
- Updated dependencies 6a10baa:
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
