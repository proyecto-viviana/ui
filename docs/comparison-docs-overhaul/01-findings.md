# 01 · Findings

Investigation of the reference site, the current comparison app, and the gap
between them. See [`README.md`](README.md) for the index.

## 1. The reference site source is already in this repo

The live docs site (`react-spectrum.adobe.com`) is the Parcel-RSC app vendored
at `react-spectrum/packages/dev/s2-docs/`:

- `src/` — the docs chrome: `Layout`, `Header`, `Nav`, `MobileHeader`,
  `SearchMenu`, `OptimisticToc`, `ScrollableToc`, `VisualExample`, `PropTable`,
  `StateTable`, `Table`, `ComponentCard`, `Code`, `typography`, plus the
  `Footer` defined inside `Layout.tsx`.
- `pages/s2/*.mdx` — **92 component MDX pages** (Checkbox, Button, DatePicker,
  …), each hand-authored prose + examples.

We do not need to reverse-engineer the docs from screenshots — both the chrome
and the per-component content exist as readable source.

## 2. How an S2 docs component page is structured

From `s2-docs/src/Layout.tsx` + `pages/s2/Checkbox.mdx` + `pages/s2/Button.mdx`.

### Chrome (every page)

- `<Provider elementType="html" background="layer-1">` wraps the document.
- Centered container, `max-width: 1440`, padding/gap `12`.
- `<Header>` — desktop sticky bar, a 3-column grid: brand link (library icon +
  label) left · `SearchMenuTrigger` center · `HeaderLink`s (Docs, Releases,
  Blog, GitHub, npm) + vertical `Divider` + `ColorSchemeToggle` right.
- `<MobileHeader>` — separate mobile chrome with a `Picker`-based on-page nav.
- `<Nav>` — left sidebar, sticky; sections are real S2 `Disclosure` /
  `DisclosureTitle` / `DisclosurePanel`; links are `react-aria-components`
  `Link` with `pressScale` and a current-page indicator bar. "Overview" renders
  flat (no disclosure).
- `<Main>` — a card surface: `backgroundColor: base`, `borderRadius: xl`,
  `boxShadow: emphasized`; flex row of article + ToC.
- `<OptimisticToc>` — right "On this page" rail; uses `SideNavLink` desktop and
  a `Picker` on mobile.
- `Footer` — `<Divider size="S">` + Adobe legal `Link`s (`isQuiet`).
- `<ToastContainer placement="bottom">`.

### Body (per component, MDX-authored)

- `# Title` → `H1` typography.
- `<PageDescription>` → component description (pulled from extracted TS docs).
- `<VisualExample>` → the interactive playground: a live component render + a
  control panel derived from prop metadata + a generated code block. CSS grid
  with `example` / `controls` / `files` areas.
- Prose sections (`## Selection`, `## Forms`, `## Events`, `## Pending`,
  `## Value`, …) — explanatory copy specific to each component.
- ` ```tsx render ` fenced blocks → additional live examples; some carry their
  own inline controls via `props={[...]}`.
- `## API` → `<PropTable>` — a grouped, collapsible table (Name / Type /
  Default) with `DisclosureRow` groups (Content, Selection, Events, Styling, …)
  and a required-`Asterisk` marker.
- Richer pages add anatomy `Figure`s, `<StateTable>`, and `<ExampleSwitcher>`
  (vanilla / tailwind / s2 tabs).

## 3. Which Spectrum components the docs chrome is built from

| Docs chrome region         | Real component used upstream                                  |
| -------------------------- | ------------------------------------------------------------- |
| Document wrapper / theming | `Provider` (S2) + `SettingsProvider` (color-scheme context)   |
| Sidebar nav sections       | `Disclosure`, `DisclosureTitle`, `DisclosurePanel` (S2)       |
| Sidebar / Toc nav links    | `Link` (react-aria-components) + `pressScale`                 |
| Header / footer dividers   | `Divider` (S2)                                                |
| Color-scheme toggle        | `Button` (RAC) + `Contrast` / `Lighten` icons (S2)            |
| Brand & header links       | `Link` (RAC/S2), `isQuiet`                                    |
| Mobile on-page nav         | `Picker` + `PickerItem` (S2)                                  |
| Prop / state tables        | docs-local `Table*` wrappers + `DisclosureRow` + `Asterisk`   |
| Toasts                     | `ToastContainer` (S2)                                         |
| VisualExample controls     | S2 form components (`Picker`, `Switch`, `TextField`, `Radio`) |
| All layout / spacing       | the `style()` styling function                                |

The chrome is _mostly_ real Spectrum components; `Table`, `Header`, `Nav`,
`VisualExample`, `Layout` are docs-local compositions of those primitives plus
`style()` layout calls.

## 4. What the comparison app does today (the ad-hoc gap)

`apps/comparison` is an Astro site:

- One generated template `src/pages/components/[slug].astro` (437 lines) and
  `src/pages/index.astro` (258 lines).
- ~2200 lines of hand-written `s2-`-prefixed CSS in `src/styles/global.css`.
- Every chrome element is raw HTML: `.s2-topbar` div, `.s2-search` `<button>`,
  `.s2-theme-toggle` `<button>`, `.s2-nav-group` `<details>/<summary>`,
  `.s2-hero` `<h1>/<p>`, `.s2-example` ad-hoc preview, `.s2-prop-controls` raw
  `<input>/<select>`, `.s2-api-table` `role="table"` divs, `.s2-pill` spans,
  `.s2-toc` link list. No footer.
- Theme handling is an ad-hoc `data-theme` attribute + `src/scripts/docs-theme`.
- React Spectrum and `solid-spectrum` render only _inside_ the comparison
  panels, mounted by `ReactMount.astro` / `SolidMount.astro` (each renders an
  empty div + a custom hydration script — not Astro island directives).

ADR 0001 (`docs/adr/0001-s2-styling-source-of-truth.md`) and
`apps/comparison/README.md` deliberately forbade the shell from using styled
components. That constraint is now lifted by decision.

### Data model already present

- `data/comparison-manifest.ts` — `ComparisonEntry { slug, title, category,
componentStatus, summary, parity, priority, gapSummary, docsUrl,
catalogueSource, layers }`; `comparisonEntries` is the catalogue.
- `data/component-controls.ts` (~4800 lines) — hand-maintained `ComponentControl
{ name, label, kind: text|select|radio|switch, defaultValue, options }` plus
  `getComponentControlGroup()` returning controls + `apiProps` + coverage.
- `data/coverage.ts`, `data/visual-state-matrix.ts` — parity/coverage data.

This metadata exists but is hand-curated; it does not carry prop _types_,
defaults, or descriptions the way the upstream extracted TS docs do — see
[`04-content-pipeline.md`](04-content-pipeline.md) §4.

## 5. `solid-spectrum` readiness

`packages/solid-spectrum` exports every component the chrome needs: `Provider`,
the `Disclosure` family, `Divider`, `Picker`, `Button`, `Link`, `Table*`,
`ToastContainer`, `pressScale`, plus `Badge`, `Meter`,
`ProgressBar`/`ProgressCircle`, `StatusLight`, `SearchField`, `Switch`,
`TextField`, `Radio`/`RadioGroup`, `Card`, `Tabs`, `Accordion`. The styling
function lives at the `./style` export (`src/s2-style/`).

Known gaps from `docs/CURRENT_STATUS.md` affect _content_ (what renders inside
the comparison panels) — Disclosure, Tabs, Popover, ProgressBar, TableView,
TagGroup and others are still missing/blocked styled S2 entries. The **chrome
itself is unblocked**: the components it needs are exported and styled.

## 6. Ad-hoc → target component mapping

| Comparison app (ad-hoc)          | S2 docs equivalent         | Build with (`solid-spectrum`)                    |
| -------------------------------- | -------------------------- | ------------------------------------------------ |
| `.s2-topbar` div                 | `Header`                   | `Link`, `Divider`, `Button` + icons              |
| `.s2-search` button              | `SearchMenuTrigger` + menu | `Button` + `SearchField` + overlay (`Popover`)   |
| `.s2-theme-toggle` button        | `ColorSchemeToggle`        | `Button` + Contrast/Lighten icons + `Provider`   |
| `.s2-nav-group` `<details>`      | `Nav` disclosures          | `Disclosure`/`DisclosureTitle`/`DisclosurePanel` |
| `.s2-nav a` links                | `SideNavLink`              | `Link` + `pressScale` + current indicator        |
| `.s2-hero` h1+p                  | `H1` + `PageDescription`   | typography components                            |
| `.s2-example` preview + controls | `VisualExample`            | new `ComparisonExample` (dual panel)             |
| `.s2-prop-controls` raw inputs   | VisualExample controls     | `Picker`, `Switch`, `TextField`, `RadioGroup`    |
| `.s2-coverage-list` meter rows   | (our addition)             | `Meter`                                          |
| `.s2-api-table` `role=table`     | `PropTable`                | `Table*` + `DisclosureRow` + required marker     |
| `.s2-state-list`                 | (our addition)             | `Table*` / `Card` + `Badge` / `StatusLight`      |
| `.s2-pill`                       | badges                     | `Badge` / `StatusLight`                          |
| `.s2-toc` link list              | `OptimisticToc`            | sticky `SideNavLink` list + `Picker` (mobile)    |
| (no footer)                      | `Footer`                   | `Divider` + `Link`                               |
| `.s2-coverage-ring` (index)      | (our addition)             | `ProgressCircle`                                 |
| `.s2-component-list` (index)     | `ComponentCard` grid       | `Card`                                           |
| `data-theme` + `docs-theme` js   | `SettingsProvider`         | `Provider` colorScheme + Solid signal context    |
