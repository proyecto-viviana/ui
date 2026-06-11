# @proyecto-viviana/solid-spectrum

## 0.5.3

### Patch Changes

- Expose button, provider, form, input, segmented control, switch, and icon component subpaths for direct Viviana UI imports.

## 0.5.2

### Patch Changes

- [`7502ee7`](https://github.com/proyecto-viviana/ui/commit/7502ee70a735d1831a2c62b581fb0ba690146327) Thanks [@EmoPorEmilio](https://github.com/EmoPorEmilio)! - Keep Button and ActionButton dynamic aria trigger props reactive, and export BellIcon from the root Spectrum/Viviana surface.

- Updated dependencies [[`7502ee7`](https://github.com/proyecto-viviana/ui/commit/7502ee70a735d1831a2c62b581fb0ba690146327)]:
  - @proyecto-viviana/solidaria-components@0.3.2

## 0.5.1

### Patch Changes

- Updated dependencies []:
  - @proyecto-viviana/solidaria-components@0.3.1

## 0.5.0

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
  - @proyecto-viviana/solidaria-components@0.3.0
  - @proyecto-viviana/solid-stately@0.3.0
  - @proyecto-viviana/solidaria@0.3.0

## 0.4.2

### Patch Changes

- [#34](https://github.com/proyecto-viviana/proyecto-viviana/pull/34) [`5b32b35`](https://github.com/proyecto-viviana/proyecto-viviana/commit/5b32b35d1ae525f81a959c4dcb0fde811c1fd611) Thanks [@EmoPorEmilio](https://github.com/EmoPorEmilio)! - Align package metadata and workspace tooling with the Bun-first npm release flow.

- Updated dependencies [[`5b32b35`](https://github.com/proyecto-viviana/proyecto-viviana/commit/5b32b35d1ae525f81a959c4dcb0fde811c1fd611)]:
  - @proyecto-viviana/solid-stately@0.2.7
  - @proyecto-viviana/solidaria@0.2.8
  - @proyecto-viviana/solidaria-components@0.2.9

## 0.4.1

### Patch Changes

- [#29](https://github.com/proyecto-viviana/proyecto-viviana/pull/29) [`e19344c`](https://github.com/proyecto-viviana/proyecto-viviana/commit/e19344ca740ae3db4d6a990caa465b5093704288) Thanks [@EmoPorEmilio](https://github.com/EmoPorEmilio)! - Normalize internal dependency ranges so automated Changesets releases can keep dependent package versions aligned.

- [#32](https://github.com/proyecto-viviana/proyecto-viviana/pull/32) [`99654ec`](https://github.com/proyecto-viviana/proyecto-viviana/commit/99654ec7b27c30729f75d6b43747d5bf42acbb76) Thanks [@EmoPorEmilio](https://github.com/EmoPorEmilio)! - Align package metadata and workspace tooling with the Bun-first npm release flow.

- Updated dependencies [[`e19344c`](https://github.com/proyecto-viviana/proyecto-viviana/commit/e19344ca740ae3db4d6a990caa465b5093704288), [`99654ec`](https://github.com/proyecto-viviana/proyecto-viviana/commit/99654ec7b27c30729f75d6b43747d5bf42acbb76)]:
  - @proyecto-viviana/solidaria-components@0.2.8
  - @proyecto-viviana/solid-stately@0.2.6
  - @proyecto-viviana/solidaria@0.2.7

## 0.4.0

### Minor Changes

- Refactor theme.css: update dark mode palette from void-black to blue-grey tinted aesthetic. Add new CSS custom properties (primary-dim, accent-dim, header-bg, glow effects, fusion-glow, semantic bg tints) with light-mode overrides. This is the canonical source of truth for colors across all apps.

### Patch Changes

- e19344c: Normalize internal dependency ranges so automated Changesets releases can keep dependent package versions aligned.
- Updated dependencies [e19344c]
  - @proyecto-viviana/solidaria-components@0.2.6
