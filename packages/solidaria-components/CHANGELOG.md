# @proyecto-viviana/solidaria-components

## 0.3.3

### Patch Changes

- 3a740bb: Fix TextField label hydration during SSR and republish the Viviana UI package chain against the fixed components.

## 0.3.2

### Patch Changes

- [`7502ee7`](https://github.com/proyecto-viviana/ui/commit/7502ee70a735d1831a2c62b581fb0ba690146327) Thanks [@EmoPorEmilio](https://github.com/EmoPorEmilio)! - Keep Button and ActionButton dynamic aria trigger props reactive, and export BellIcon from the root Spectrum/Viviana surface.

## 0.3.1

### Patch Changes

- Fix SSR hydration mismatch in overlay components (Picker, ComboBox, Menu, DatePicker, Dialog).

  The overlay primitives (`Popover`, `Modal`, `Toast`) gate their portalled content behind `useIsHydrated()` so the server emits nothing for a closed overlay. But they passed `children: props.children` to `useRenderProps`, which read the children getter eagerly at construction — instantiating the gated content's DOM template during the synchronous hydration walk that the server never emitted. SolidJS then threw `Hydration Mismatch. Unable to find DOM nodes for hydration key: …` at `_$getNextElement`.

  Fixed structurally by reading children lazily (`get children()`) so the read is deferred until `renderChildren()` runs inside the gated `<Show>`/`<Portal>`. The value is identical; only the eager template instantiation — the bug — is removed.

  Also, `useIsHydrated()` now flips on `onMount` (the effect phase, after the synchronous hydration pass) instead of `requestAnimationFrame`. This keeps the gate matching the server on the first render, mounts the content as a clean client-side update (no `getNextElement` walk), and — unlike rAF — fires synchronously under `render()`, so the gated content also renders in unit tests / pure CSR.

## 0.3.0

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

- Fix an SSR hydration mismatch in the overlay primitives. A closed overlay's
  `if (isServer)` early-return (`return null` in Popover/Toast, `return <>{children}</>`
  in Modal) made the server render a different tree than the client's `<Show>`/`<Portal>`,
  desyncing hydration. The portal is now gated on `useIsHydrated()` so the server and the
  first client render agree. Fixes Popover, Modal, and Toast — and the components built on
  them (Picker, ComboBox, Menu/ActionMenu, Tooltip/TooltipTrigger, Dialog, DatePicker/
  DateRangePicker/Calendar, ContextualHelp).
- Updated dependencies [[`d219335`](https://github.com/proyecto-viviana/ui/commit/d21933524091ef5072a48dcc00ce5da9a7f5832a)]:
  - @proyecto-viviana/solid-stately@0.3.0
  - @proyecto-viviana/solidaria@0.3.0

## 0.2.9

### Patch Changes

- [#34](https://github.com/proyecto-viviana/proyecto-viviana/pull/34) [`5b32b35`](https://github.com/proyecto-viviana/proyecto-viviana/commit/5b32b35d1ae525f81a959c4dcb0fde811c1fd611) Thanks [@EmoPorEmilio](https://github.com/EmoPorEmilio)! - Align package metadata and workspace tooling with the Bun-first npm release flow.

- Updated dependencies [[`5b32b35`](https://github.com/proyecto-viviana/proyecto-viviana/commit/5b32b35d1ae525f81a959c4dcb0fde811c1fd611)]:
  - @proyecto-viviana/solid-stately@0.2.7
  - @proyecto-viviana/solidaria@0.2.8

## 0.2.8

### Patch Changes

- [#29](https://github.com/proyecto-viviana/proyecto-viviana/pull/29) [`e19344c`](https://github.com/proyecto-viviana/proyecto-viviana/commit/e19344ca740ae3db4d6a990caa465b5093704288) Thanks [@EmoPorEmilio](https://github.com/EmoPorEmilio)! - Normalize internal dependency ranges so automated Changesets releases can keep dependent package versions aligned.

- [#32](https://github.com/proyecto-viviana/proyecto-viviana/pull/32) [`99654ec`](https://github.com/proyecto-viviana/proyecto-viviana/commit/99654ec7b27c30729f75d6b43747d5bf42acbb76) Thanks [@EmoPorEmilio](https://github.com/EmoPorEmilio)! - Align package metadata and workspace tooling with the Bun-first npm release flow.

- Updated dependencies [[`99654ec`](https://github.com/proyecto-viviana/proyecto-viviana/commit/99654ec7b27c30729f75d6b43747d5bf42acbb76)]:
  - @proyecto-viviana/solid-stately@0.2.6
  - @proyecto-viviana/solidaria@0.2.7

## 0.2.7

### Patch Changes

- Rebuild dist with all missing type declarations (ActionBar, Alert, ToggleButton, DateRangePicker, Virtualizer, DragAndDrop, and more)
- Updated dependencies
- Updated dependencies
  - @proyecto-viviana/solidaria@0.2.6
  - @proyecto-viviana/solid-stately@0.2.5

## 0.2.6

### Patch Changes

- e19344c: Normalize internal dependency ranges so automated Changesets releases can keep dependent package versions aligned.
