# 02 · Style System & Build Model

The original plan flagged the upstream compile-time `style` macro as the top
risk. Investigation **resolves it**: `solid-spectrum` does not use a macro at
all. This document records how its styling actually works and how the chrome's
CSS gets onto the page.

## 1. `solid-spectrum`'s `style()` is a runtime function

Upstream React Spectrum imports the style macro with
`import {style} from '@react-spectrum/s2/style' with {type: 'macro'}` — a
Parcel/Babel compile-time transform. `solid-spectrum` did **not** port the
macro. Instead (`packages/solid-spectrum/src/s2-style/`):

- `spectrum-theme.ts:715` — `export const style = createTheme(...)`. `style()`
  is an ordinary runtime function: call it with a style object, get back a
  class-name string.
- `style-macro.ts` — when `style()` (or `css()`) runs, it appends the generated
  CSS text to an in-memory `Set`, `assetRegistry`, via `addS2CssAsset()`.
- `s2-style/index.ts` re-exports the registry accessors:
  `getS2CssAssets()` → `string[]` of all collected CSS, and
  `clearS2CssAssets()` → reset.

So there is **no build-time macro to reproduce**. Authoring chrome layout with
`style({...})` (the analogues of upstream `libraryStyles`, `articleStyles`,
`colorSchemeToggleStyles`) works at runtime — the only question is collecting
and shipping the CSS it registers.

## 2. How `solid-spectrum` ships CSS today

`packages/solid-spectrum/src/s2-generated.css` is a **prebuilt, committed**
stylesheet (~23.7k lines). It is produced by
`scripts/generate-solid-spectrum-s2-css.ts`, run as the first step of the
package `build` script:

```
clearS2CssAssets();
generatePageStyles();
await import('.../src/provider');
await import('.../src/divider');
await import('.../src/picker');
await import('.../src/link');
await import('.../src/button/s2-button-styles');
// …≈18 component modules…
writeFile('s2-generated.css', getS2CssAssets().join('\n\n'));
```

Importing a component module evaluates its top-level `style()` calls, which
populate the registry; the script then flushes the registry to disk. The
comparison app consumes this CSS by importing `solid-spectrum`'s built
`dist/*.css` artifacts.

### 2a. Defect found: missing component CSS in the shipped package

While confirming the runtime model above, the investigation found a
**pre-existing bug in `solid-spectrum` itself** — unrelated to this overhaul,
affecting every consumer. In short: `style()` is a vendored copy of React
Spectrum's build-time **macro** run as a plain runtime function, and the
prebuilt `s2-generated.css` is collected via a **hand-maintained list of ~18
modules** that omits `disclosure`, `accordion`, `table`, `card`, and `tabs`.
Their CSS never ships, so those components render unstyled.

The chrome dogfoods `Disclosure` (nav) and `Table` (prop tables), so the fix is
a Phase 0 prerequisite ([`05-phasing.md`](05-phasing.md)).

**Full root-cause analysis, the macro connection, and recommended fixes are in
[`06-solid-spectrum-css-defect.md`](06-solid-spectrum-css-defect.md).**

## 3. Recommended CSS pipeline for the chrome

The chrome introduces _new_ `style()` calls that no existing generation step
covers. Two viable approaches; **(A) is recommended**.

### (A) Build-time generation — deterministic _(recommended)_

Add a comparison-app build step modelled exactly on
`generate-solid-spectrum-s2-css.ts`:

1. Author all chrome `style()` calls in plain modules under
   `apps/comparison/src/chrome/` (or similar).
2. A `scripts/generate-comparison-chrome-css.ts` does `clearS2CssAssets()`,
   imports every chrome module **and** the missing component modules
   (`disclosure`, `table`, `card`), then writes `comparison-chrome.css`.
3. The Astro pages import that CSS file statically.

Pros: deterministic output, no SSR ordering concerns, cacheable, diffable.
Cons: a generation step to keep in sync (mitigated — it just imports modules).

### (B) SSR-time flush

Astro server-renders the Solid chrome. Wrap the render: `clearS2CssAssets()` →
render → `getS2CssAssets()` → inject a `<style>` into `<head>`. Hydration reuses
the same classes.

Pros: no separate build artifact. Cons: must guarantee every `style()` call has
run before the flush (lazy/client-only branches can miss); registry is process
-global, so concurrent SSR renders can interleave — needs care.

### Decision input needed

Approach A unless the team wants zero build artifacts. Either way, the existing
`s2-generated.css` (component CSS) is still imported for the components rendered
_inside_ comparison panels.

## 4. Astro + Solid SSR model

From `apps/comparison/astro.config.mjs`:

- Integrations: `@astrojs/react` scoped to `src/components/react/**`,
  `@astrojs/solid-js` scoped to `src/components/solid/**`. The two are kept
  strictly partitioned by directory.
- `@proyecto-viviana/*` packages are aliased to their built `dist/index.js`.
- Today the chrome is `.astro` + raw HTML; React/Solid only appear inside
  panels, hydrated by hand-written scripts (`src/scripts/solid-mount.tsx`),
  not Astro `client:*` directives. `ComparisonIsland.tsx` even uses
  `solid-js/h` hyperscript rather than JSX.

### What the overhaul needs

The chrome becomes Solid components built from `solid-spectrum`. Required
changes:

- Place chrome components under `src/components/solid/**` so the existing
  `@astrojs/solid-js` `include` picks them up (or widen the `include`).
- Decide hydration per region:
  - **Static** (footer, brand, most nav links) — server-rendered, no JS.
  - **Interactive** (nav `Disclosure` expand/collapse, `ColorSchemeToggle`,
    search trigger, mobile `Picker` ToC) — hydrated, `client:load` or
    `client:idle`/`client:visible`.
- A Solid `Provider` wraps each page for color scheme; see
  [`03-chrome-spec.md`](03-chrome-spec.md) §5.

### Open question — JSX vs hyperscript

`ComparisonIsland` uses `solid-js/h`. Confirm whether the chrome may use normal
Solid JSX (preferred for readability) under `@astrojs/solid-js`, or whether the
hyperscript pattern exists for a reason (e.g. mixing with React tooling). This
is a Phase 0 spike — see [`05-phasing.md`](05-phasing.md).

## 5. Summary of resolved vs open

| Item                                                            | Status                                                                                   |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Compile-time `style` macro needed?                              | **Resolved — no.** `style()` is runtime.                                                 |
| Chrome CSS collection                                           | **Resolved — approach A** (extend the generation-script pattern).                        |
| `Disclosure`/`Table`/`Card` CSS missing from `s2-generated.css` | **Identified** — extend the import list.                                                 |
| Solid SSR in Astro for the chrome                               | Low risk — integration already present; needs directory placement + hydration decisions. |
| JSX vs `solid-js/h` for chrome                                  | **Open** — Phase 0 spike.                                                                |
