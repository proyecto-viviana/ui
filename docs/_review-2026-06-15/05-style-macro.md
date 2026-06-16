# 05 — Style macro, pressScale, CSS (EXTRA-DEPTH styling lane, ADR 0001)

Scope: `packages/solid-spectrum/src/style/**`, `pressScale.ts`, `components.css`,
`styles.css`, `theme.css`, `font-faces.css`, and how components consume `style()`.

Cross-checked against the actual build dependency `@react-spectrum/s2@1.3.0`
(`pnpm-lock.yaml:1686`, `node_modules/.pnpm/@react-spectrum+s2@1.3.0_.../style/`).
Note the vendored reference tree `react-spectrum/packages/@react-spectrum/s2/`
is pinned at **1.1.0** (its `package.json` version), but the copied macro/theme
source matches **1.3.0** — see [Medium] version skew below. MCP
`get_style_macro_property_values` was used to confirm S2's real token names.

**Bottom line:** the macro engine, theme, tokens, and `pressScale` are faithful
1.3.0 copies with no value drift. The damage is on the consumption side: 26
solid-spectrum components (including exported public ones — ListBox, Select,
Toolbar, Well, StepList, Separator) style their S2 surface with **hand-authored,
invented-token utility-class strings that don't exist in S2 and resolve to no CSS
in the package**. The "migrate to style() macro" work only touched the 12
`viviana-ui/src/custom/` product components, not solid-spectrum's own S2 set.

---

### [Critical] 14 solid-spectrum components style their S2 surface with hand-authored, invented-token utility classes and never touch the macro

- Evidence: Pure-Tailwind, zero macro import (grep: no `with {type:"macro"}` / no
  `from "../style"` anywhere in the component dir):
  `packages/solid-spectrum/src/select/index.tsx:167,172,174,176,178,182,223`
  (`"inline-flex … rounded-lg border-2 …"`, `"border-accent-300 bg-bg-300 text-primary-100"`,
  `"ring-2 ring-accent-300 ring-offset-2 ring-offset-bg-400"`,
  `"absolute z-50 mt-1 w-full rounded-lg border-2 border-primary-600 bg-bg-400 py-1 shadow-lg max-h-60"`),
  `packages/solid-spectrum/src/listbox/index.tsx:96,107,113,137,176,184,186,189`
  (`"rounded-lg border-2 border-primary-600 bg-bg-400 …"`,
  `"ring-2 ring-accent-300 ring-offset-2 …"`, `"py-4 px-4 … text-primary-500"`).
  Same pattern in `overlays/Modal.tsx`, `overlays/Tray.tsx`, `label/index.tsx`,
  `landmark/index.tsx`, `alert/index.tsx`, `actiongroup/index.tsx`,
  `well/index.tsx`, `steplist/index.tsx`, `view/Content.tsx`,
  `separator/index.tsx`, `labeledvalue/index.tsx`, `toolbar/index.tsx`.
- Evidence the tokens are invented: S2's real scale is `gray-25..900`,
  `accent-100..1600`, `focus-ring`, `gray-25`, etc. (`spectrum-theme.ts`
  `baseColors`/`color()`, MCP `get_style_macro_property_values` "color"). The
  strings use `text-primary-200`, `bg-bg-300/400`, `border-primary-600`,
  `ring-accent-300`, `border-2`, `rounded-lg`, `shadow-lg`, `duration-200` —
  `rg -c 'primary-200|bg-300|accent-300|primary-600' <s2>/style/spectrum-theme.ts`
  returns **0**. None are S2 tokens.
- Evidence they render nothing in the package: there is **no Tailwind/UnoCSS
  config or dependency** anywhere (`fd tailwind.config`, `fd uno.config`,
  `rg '"tailwindcss"|"unocss"' package.json …` → empty). The only place these
  class names are defined as real CSS is `apps/web/src/local-utilities.css`
  (app-only, pulled in by `apps/web/src/styles.css`; full of
  `var(--color-primary-700)`, `var(--color-accent-200)`). No `.css` in
  `packages/solid-spectrum` defines them. So `<ListBox>`/`<Select>`/`<Toolbar>`
  shipped from `@proyecto-viviana/solid-spectrum` render **unstyled**; they only
  look right inside `apps/web` because of the app fallback CSS.
- Why: Direct violation of ADR 0001 ("Do not implement S2 component styling by
  hand"; "App CSS must not implement component-internal S2 surfaces: colors,
  padding, radius, focus rings, states") and Rule #2 (invented token names with
  no upstream counterpart) and Rule #4 (S2 styling must come only from the macro).
  ADR 0001 explicitly says such components "must be marked partial or missing/gap
  until the implementation lives in the S2-compatible style system" — they are
  exported as if complete. Rule #1: an export that renders is a floor, not
  acceptance; here it does not even render styled standalone.
- Fix: Reimplement each surface through `style({...})` using real S2 tokens
  (mirror upstream `ListBox.tsx` / `Picker.tsx` / `Toolbar.tsx` style blocks and
  the `control`/`controlSize`/`focusRing`/`baseColor` helpers already present in
  `s2-internal/style-utils.ts` and used correctly by `menu/s2-menu-styles.ts`).
  Delete every `text-primary-*`/`bg-bg-*`/`ring-accent-*`/`rounded-lg` string.
  Until done, mark these components partial/gap per ADR 0001, and ensure
  `local-utilities.css` is never the source of an S2 surface.

### [Critical] 12 more components are half-migrated: real macro for the chrome, leftover invented-token strings for states

- Evidence: components that DO import the macro but still carry inert
  Tailwind-token strings —
  `packages/solid-spectrum/src/menu/index.tsx:211-212`
  (`"bg-bg-400 text-primary-200 border-primary-600 hover:bg-bg-300 hover:border-accent-300"`,
  `"bg-transparent text-primary-200 border-transparent hover:bg-bg-300"`) sitting
  next to a correct macro file `menu/s2-menu-styles.ts` (uses `style()`,
  `focusRing`, `baseColor`, `controlSize`, `edgeToText`);
  `packages/solid-spectrum/src/menu/ContextualHelpTrigger.tsx:69,77,79,99-117`
  (inline `font-weight:600`, `margin-bottom:4px`, `gap:4px` magic numbers **and** a
  20-line block of `[&_.solidaria-ContextualHelpTrigger-trigger]:py-2 …:px-4
…:text-primary-200 …:hover:bg-bg-300 …:focus-visible:ring-accent-300
…:rounded-lg …:shadow-lg …:min-w-[200px]`);
  plus leftover strings in `button/ClearButton.tsx`, `button/FieldButton.tsx`,
  `button/LogicButton.tsx`, `color/index.tsx`, `color/ColorEditor.tsx`,
  `form/Field.tsx`, `form/HelpText.tsx`, `icon/Illustration.tsx`,
  `popover/index.tsx`, `switch/index.tsx`.
- Why: Same ADR 0001 / Rule #2 / Rule #4 violation as above, and Rule #5 — this
  is the "building held together by patches" failure mode: a parallel inert
  styling system coexisting with the real macro. The migration is structurally
  half-done; the named commit `4d020ee4` only migrated `viviana-ui/src/custom/`
  (12 product components), not solid-spectrum's S2 components.
- Fix: Fold the remaining state styling into the existing macro style blocks
  (e.g. menu submenu-trigger variants belong in `s2-menu-styles.ts` as
  `style({backgroundColor, color, borderColor, …})` with real tokens). Remove the
  inline magic numbers in `ContextualHelpTrigger` (`fontRelative`/`space` exist
  for exactly this). Treat zero `text-primary-*`/`bg-bg-*` strings in
  `solid-spectrum/src/**` as the done-criterion.

### [Medium] Vendored reference tree (1.1.0) does not match the build dependency / copied source (1.3.0)

- Evidence: `react-spectrum/packages/@react-spectrum/s2/package.json` →
  `"version": "1.1.0"`; but `pnpm-lock.yaml:1686` resolves
  `@react-spectrum/s2@1.3.0`, `packages/solid-spectrum/src/style/UPSTREAM.md:3`
  states the copied files came from **1.3.0**, and `properties.json` is
  byte-identical to the 1.3.0 file (`diff` empty).
- Why: Rule #2/#6 — the on-disk parity oracle (vendored tree) is two minor
  versions behind what the package actually builds against and what the macro was
  copied from. Anyone "reading upstream first" from the vendored tree is reading
  the wrong version; token/theme deltas between 1.1.0 and 1.3.0 would be invisible
  to that check. Not a value-drift bug today, but a stale source of truth.
- Fix: Re-vendor the reference tree at 1.3.0 (or pin the dependency to 1.1.0 to
  match the reference), and make `UPSTREAM.md` state a single version. Add a CI
  check that the copied `style/*.ts` matches the installed S2 version modulo
  formatting.

### [Medium] `POSTFIX` is hard-coded to `"13"` instead of derived from the S2 version — silent class-name drift on upgrade

- Evidence: `packages/solid-spectrum/src/style/style-macro.ts:35`
  `const POSTFIX = "13";` Upstream derives it at load:
  `<s2>/style/style-macro.ts:18-19`
  `POSTFIX = json.version.replace(/[0.]/g, '')` (for `1.3.0` →`"13"`, so the value
  is correct _for 1.3.0_; `1.1.0` would be `"11"`).
- Why: The `fs.readFileSync(__dirname + '/../package.json')` approach can't run in
  the unplugin-parcel-macros/Rolldown setup, so a constant is a reasonable
  adaptation — but it is undocumented and decoupled from the version. If S2 is
  bumped (e.g. to 1.4.0) and this constant isn't updated, every generated atomic
  class keeps the `13` suffix while upstream emits `14`; merging/override behavior
  that keys on the suffix and any cross-package class assumptions silently drift.
  Cosmetic to rendered pixels, but a real maintenance landmine and a Rule #2 "copy
  the real value" gap (the value is now a literal, not sourced).
- Fix: Derive POSTFIX from the pinned S2 version at build time (read it from the
  resolved `@react-spectrum/s2/package.json`, or inject via the macro/Vite define)
  and add a comment tying it to the version. At minimum, add a test asserting
  `POSTFIX` equals the installed S2 version stripped of `0`/`.`.

### [Low] `pressScale` Solid port is faithful but drops upstream's `getBoundingClientRect() ?? {}` guard and uses `?? ""` for `transform`

- Evidence: `packages/solid-spectrum/src/pressScale.ts:42-45` vs upstream
  `<s2>/src/pressScale.ts:18-31`. Formula is identical:
  `Math.max(height, width / 3, 24)px`, `translate3d(0, 0, -2px)`, `willChange`
  set in both branches. Differences: upstream destructures
  `{width = 0, height = 0} = ref.current.getBoundingClientRect() ?? {}`; the port
  does `const {width, height} = element.getBoundingClientRect()` with no `?? {}`.
- Why: `getBoundingClientRect()` never returns null on a live element, so behavior
  matches in practice. Flagging only because it diverges textually from the
  upstream "copy exactly" baseline and would NaN if `element` were ever a
  non-Element. Not a styling/token issue.
- Fix: Mirror the upstream defaults (`{width = 0, height = 0} = …getBoundingClientRect() ?? {}`)
  to keep it a literal copy.

### [Low] `styles.css` / `theme.css` are empty stubs — correct, but `theme.css` is referenced as a token chain point that no longer exists here

- Evidence: `packages/solid-spectrum/src/styles.css:1` and
  `packages/solid-spectrum/src/theme.css:1` are both just
  `/* Component CSS is emitted by S2 style macros during build. */`;
  `components.css` only `@import`s `font-faces.css` + `styles.css`. The
  viviana-ui migration commit chains its tokens "from theme.css", implying a
  populated theme layer; here it's empty.
- Why: Not a bug (the macro emits CSS at build into `dist/`, and `font-faces.css`
  is a faithful copy of `@react-spectrum/s2/src/font-faces.css`). Noted so a reader
  doesn't assume `theme.css` carries token values — it doesn't; tokens come from
  `@adobe/spectrum-tokens/dist/json/variables.json` via `tokens.ts`.
- Fix: None required; optionally add a one-line comment in `theme.css` pointing to
  `tokens.ts`/`spectrum-theme.ts` as the actual token source to avoid confusion.

---

## What is faithful (verified, no action)

- `style/spectrum-theme.ts`: normalized diff vs 1.3.0 shows **every** numeric/
  token-bearing line is value-identical — spacing scale, font sizes, line-heights,
  radii (`pill: calc(self(height,…)/2)`, `full: 100%`), breakpoints
  (480/640/768/1024/1280/1536 ÷16rem), easing (`cubic-bezier(0.45,0,0.4,1)`),
  font weights (`500/700/900`, `:lang(ja,ko,zh):500`), i18n font stacks. The only
  changes are formatting, `process.env`→`env` indirection, added explicit TS types
  for Solid, and an added `compareColorStopNames` sort helper. No invented values.
- `style/tokens.ts`: token values sourced from
  `@adobe/spectrum-tokens/dist/json/variables.json`; diff vs 1.3.0 is formatting +
  the JSON-default normalization for Vite. No hand-authored colors.
- `style/style-macro.ts`, `style/runtime.ts`, `style/types.ts`,
  `style/properties.json`: structural copies of 1.3.0; `properties.json` byte-
  identical. Macro engine (layers, conditions, `self()`, arbitrary values,
  pseudo/at-rules, allowedOverrides) preserved.
- Macro wiring: `unplugin-parcel-macros` via `macros.rolldown()`
  (`vite.config.ts:3,31`); `s2-internal/style-utils.ts` provides real
  `control`/`controlSize`/`controlFont`/`controlBorderRadius`/`centerPadding`/
  `edgeToText` macro helpers. `menu/s2-menu-styles.ts` and
  `textfield/s2-textarea-styles.ts` are correct examples of macro-driven styling.
- Dynamic inline `style={{}}` in table/toast/progress-bar/meter/slider
  (`table/index.tsx:1101` sort-icon rotation, `toast/index.tsx:645` z-index stack,
  `progress-bar/index.tsx:388` width %, `meter/index.tsx:357` width %) are
  legitimate runtime values that upstream also sets inline — NOT hand-authored S2
  surface.
- `font-faces.css`: faithful copy of upstream typekit `@font-face` blocks
  (weights, families, RTL Arabic/Hebrew, source-code-pro).

## Suspected (unconfirmed)

- Pixel parity of the half-migrated state styling (menu submenu-trigger variants,
  ContextualHelpTrigger) cannot be confirmed against upstream values because the
  intended tokens are invented and inert; once reimplemented through the macro the
  comparison harness should diff them. Severity of the _visual_ gap is unverified
  (could be large for ListBox/Select which are entirely inert standalone).
- Whether any of the 26 affected components are covered by a comparison-app test
  that runs _inside_ `apps/web` (where `local-utilities.css` makes them appear
  styled) was not checked; if so, those tests give a false-green and mask the
  Critical findings — Rule #7 risk. Needs confirmation against
  `apps/comparison`/`apps/web` test mounts.
- The exact 1.1.0↔1.3.0 token deltas (if any S2 token values changed between
  those minors) were not enumerated; the copied source is 1.3.0 so current values
  are correct, but the stale vendored 1.1.0 reference could hide a future drift.
