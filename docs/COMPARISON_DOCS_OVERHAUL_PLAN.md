# Comparison App → S2 Docs Overhaul Plan

Goal: make `apps/comparison` pages look and read exactly like the live
`react-spectrum.adobe.com` (Spectrum 2) docs, built with `solid-spectrum`
instead of React Spectrum — while keeping our extra layer: the React-vs-Solid
side-by-side comparison and porting-parity reporting.

Status: plan only. Decisions locked with the user:

- **Supersede ADR 0001** — the app shell itself may use `solid-spectrum`.
- **Full content parity** — port the upstream prose, anatomy, prop tables, and
  multiple worked examples per component.
- **Reference target** — the unified `react-spectrum.adobe.com` site.

---

## 1. Findings

### 1.1 The reference site source is already in this repo

The live docs site is the Parcel-RSC app vendored at
`react-spectrum/packages/dev/s2-docs/`:

- `src/` — the docs chrome (`Layout`, `Header`, `Nav`, `MobileHeader`,
  `SearchMenu`, `OptimisticToc`, `VisualExample`, `PropTable`, `Table`,
  `ComponentCard`, `Code`, `typography`, `Footer`, …).
- `pages/s2/*.mdx` — **92 component MDX pages** (Checkbox, Button, DatePicker,
  …). Each is hand-authored prose + examples.

This is the single most important finding: we do not need to reverse-engineer
the docs from screenshots. We can adopt the upstream MDX as our content source
and adapt it.

### 1.2 How an S2 docs component page is structured

From `Layout.tsx` + `pages/s2/Checkbox.mdx` + `Button.mdx`:

Chrome (every page):

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
- `<OptimisticToc>` — right "On this page" rail (`<Picker>` on mobile).
- `<Footer>` — `<Divider size="S">` + Adobe legal `Link`s (`isQuiet`).
- `<ToastContainer placement="bottom">`.

Body (per component, MDX-authored):

- `# Title` → `H1` typography.
- `<PageDescription>` → component description (pulled from TS docs).
- `<VisualExample>` → **the interactive playground**: a live component render +
  a control panel derived from prop metadata + a generated code block. CSS grid
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

### 1.3 Which Spectrum components the docs chrome is actually built from

| Docs chrome region         | Real component used upstream                                  |
| -------------------------- | ------------------------------------------------------------- |
| Document wrapper / theming | `Provider` (S2) + `SettingsProvider` (color scheme context)   |
| Sidebar nav sections       | `Disclosure`, `DisclosureTitle`, `DisclosurePanel` (S2)       |
| Sidebar nav links          | `Link` (react-aria-components) + `pressScale`                 |
| Header / footer dividers   | `Divider` (S2)                                                |
| Color scheme toggle        | `Button` (RAC) + `Contrast` / `Lighten` icons (S2)            |
| Brand & header links       | `Link` (RAC/S2), `isQuiet`                                    |
| Mobile on-page nav         | `Picker` (S2)                                                 |
| Prop / state tables        | docs-local `Table*` wrappers + `DisclosureRow` + `Asterisk`   |
| Toasts                     | `ToastContainer` (S2)                                         |
| VisualExample controls     | S2 form components (`Picker`, `Switch`, `TextField`, `Radio`) |
| All layout / spacing       | the `@react-spectrum/s2/style` compile-time macro             |

So the docs chrome is _mostly_ real Spectrum components; the `Table`, `Header`,
`Nav`, `VisualExample` etc. are docs-local compositions of those primitives.

### 1.4 What the comparison app does today (the ad-hoc gap)

`apps/comparison` is an Astro site. The whole docs experience is faked:

- One generated template `src/pages/components/[slug].astro` (437 lines) +
  `src/pages/index.astro` (258 lines).
- ~2200 lines of hand-written `s2-`-prefixed CSS in `src/styles/global.css`.
- Every chrome element is raw HTML: `.s2-topbar` div, `.s2-search` `<button>`,
  `.s2-theme-toggle` `<button>`, `.s2-nav-group` `<details>/<summary>`,
  `.s2-hero` `<h1>/<p>`, `.s2-example` ad-hoc preview, `.s2-prop-controls` raw
  `<input>/<select>`, `.s2-api-table` `role="table"` divs, `.s2-pill` spans,
  `.s2-toc` link list. No footer.
- Theme handling is an ad-hoc `data-theme` attribute + `scripts/docs-theme`.
- React Spectrum and `solid-spectrum` render only _inside_ the comparison
  panels via `ReactMount` / `SolidMount` islands.

ADR 0001 + `apps/comparison/README.md` deliberately forbid the shell from using
styled components. That constraint is now lifted by decision.

### 1.5 `solid-spectrum` readiness

`packages/solid-spectrum` already exports every component the chrome needs:
`Provider`, `Disclosure` family, `Divider`, `Picker`, `Button`, `Link`,
`Table*`, `ToastContainer`, `pressScale`, plus `Badge`, `Meter`,
`ProgressBar`/`ProgressCircle`, `StatusLight`, `SearchField`, `Switch`,
`TextField`, `Radio`/`RadioGroup`, `Card`, `Tabs`, `Accordion`. It also exposes
a style system at `./style` and `./style/runtime` (`s2-style/` with
`style-macro.ts` + `runtime.ts`).

Known gaps from `docs/CURRENT_STATUS.md` that affect _content_ (the comparison
panels), not the chrome: Disclosure, Tabs, Popover, ProgressBar, TableView,
TagGroup, and others are still missing/blocked styled S2 entries. The chrome
itself is unblocked.

---

## 2. Ad-hoc → target component mapping

| Comparison app (ad-hoc)            | S2 docs equivalent         | Build with (`solid-spectrum`)                    |
| ---------------------------------- | -------------------------- | ------------------------------------------------ |
| `.s2-topbar` div                   | `Header`                   | `Link`, `Divider`, `Button` + icons              |
| `.s2-search` button                | `SearchMenuTrigger` + menu | `Button` + `SearchField` + overlay (`Popover`)   |
| `.s2-theme-toggle` button          | `ColorSchemeToggle`        | `Button` + Contrast/Lighten icons + `Provider`   |
| `.s2-nav-group` `<details>`        | `Nav` disclosures          | `Disclosure`/`DisclosureTitle`/`DisclosurePanel` |
| `.s2-nav a` links                  | `SideNavLink`              | `Link` + `pressScale` + current indicator        |
| `.s2-hero` h1+p                    | `H1` + `PageDescription`   | typography components                            |
| `.s2-example` preview + controls   | `VisualExample`            | new `ComparisonExample` (dual panel, see §4)     |
| `.s2-prop-controls` raw inputs     | VisualExample controls     | `Picker`, `Switch`, `TextField`, `RadioGroup`    |
| `.s2-coverage-list` meter rows     | (our addition)             | `Meter`                                          |
| `.s2-api-table` `role=table`       | `PropTable`                | `Table*` + `DisclosureRow` + required marker     |
| `.s2-state-list`                   | (our addition)             | `Table*` / `Card` + `Badge` / `StatusLight`      |
| `.s2-pill`                         | badges                     | `Badge` / `StatusLight`                          |
| `.s2-toc` link list                | `OptimisticToc`            | sticky list + `Picker` (mobile)                  |
| (no footer)                        | `Footer`                   | `Divider` + `Link`                               |
| `.s2-coverage-ring` (index)        | (our addition)             | `ProgressCircle`                                 |
| `.s2-component-list` (index)       | `ComponentCard` grid       | `Card`                                           |
| `data-theme` + `docs-theme` script | `SettingsProvider`         | `Provider` colorScheme + Solid signal context    |

---

## 3. Architecture decision: adopt upstream MDX

The current single generated `[slug].astro` template cannot deliver "full
content parity" — the upstream prose is unique per component. Recommended
restructure:

1. Astro supports MDX. Replace `src/pages/components/[slug].astro` with one MDX
   page per component under `src/pages/components/`, **derived from the vendored
   `react-spectrum/packages/dev/s2-docs/pages/s2/*.mdx`**.
2. Provide a custom MDX component set (the comparison analogues of the upstream
   `components` map in `Layout.tsx`):
   - `import {Checkbox} from '@react-spectrum/s2'` stays for the React panel; we
     additionally import the `solid-spectrum` counterpart.
   - `<VisualExample>` → `<ComparisonExample>` (dual render, §4).
   - ` ```tsx render ` blocks → `<ComparisonExample>` with a code tab.
   - `<PropTable>` → comparison `PropTable` with an extra parity column.
   - `H1`/`H2`/`P`/`Code`/`Link`/`Figure` → `solid-spectrum`-styled typography.
3. A shared `DocsLayout.astro` renders the chrome (`Header`, `Nav`,
   `MobileHeader`, `Toc`, `Footer`) around the MDX body — the analogue of
   upstream `Layout.tsx`.
4. A migration script converts each upstream MDX: rewrite imports, swap
   `<VisualExample>`/`render` fences to `<ComparisonExample>`, and append the
   parity sections. Run once, then hand-tune. Keep upstream MDX as the rebase
   source so future upstream edits can be diffed in.

This converts the chrome from CSS mimicry into the real thing and gives genuine
content parity, while `global.css` shrinks to near nothing.

---

## 4. The comparison twist: `ComparisonExample`

Upstream `VisualExample` shows one rendered component. Ours must show two
(React Spectrum reference + `solid-spectrum`) sharing one control panel, plus a
parity readout. Design:

- One control panel (built from `solid-spectrum` form components) drives both
  panels — reuse the existing `data/component-controls.ts` metadata.
- Two output frames side by side, each labelled, reusing today's
  `ReactMount` / `SolidMount` island wiring.
- A parity strip: per-state `Badge`/`StatusLight` sourced from
  `data/visual-state-matrix.ts` and `data/coverage.ts`.
- A code tab showing the `solid-spectrum` usage (the upstream code block,
  import-rewritten).
- Graceful "missing/tracked" empty states for components not yet live in
  `solid-spectrum` (preserve current behaviour).

The existing parity sections — Coverage, Visual State Coverage, API coverage —
are kept but restyled with `Meter` / `Table` / `Badge`, appended after the
ported upstream content (or folded into a collapsible "Parity report" panel so
the page still reads like the real docs first).

---

## 5. Key technical risks to resolve first (spike phase)

1. **Style system.** Upstream uses the `@react-spectrum/s2/style` _compile-time_
   macro (`with {type: 'macro'}`). Astro/Vite cannot run that macro the same
   way. Confirm `solid-spectrum`'s `./style` is usable at runtime (the
   `s2-style/runtime.ts` suggests yes); if not, add a Vite plugin or precompile.
   This gates everything — do it first.
2. **Solid SSR in Astro.** Chrome components must server-render and then
   hydrate the interactive bits (Disclosure, theme toggle, search). Confirm
   `@astrojs/solid` SSR works for `solid-spectrum` and decide `client:*`
   directives per region (static nav vs. interactive disclosure).
3. **Color-scheme context.** Need a Solid `SettingsProvider` equivalent
   (signal + `localStorage` + system `matchMedia`) feeding `Provider`'s
   `colorScheme`. Replaces `scripts/docs-theme`.
4. **Prop-table data.** Upstream `PropTable` is fed by `docs:@react-spectrum/s2`
   — a build-time TypeScript-docs extraction. For full prop tables (types,
   defaults, descriptions, grouping) we need an equivalent extracted from
   `solid-spectrum` (and react-spectrum for the reference column). Decide:
   reuse upstream's `docs` extractor against our packages, or extend
   `data/component-controls.ts` with the missing metadata.
5. **Search.** `SearchMenuTrigger` upstream is a large feature. Decide MVP: a
   simple `SearchField` + filtered overlay over `comparison-manifest`, deferring
   the full command-palette experience.

---

## 6. Phased delivery

**Phase 0 — Spikes & decisions** (resolve §5.1–5.5). Update ADR 0001 to record
that the comparison app shell may use `solid-spectrum`; loosen the
`README.md` / `CURRENT_STATUS.md` CSS-boundary rules to "comparison panels and
parity overlays only". Add the technical findings.

**Phase 1 — Chrome shell.** Build `DocsLayout.astro` + Solid chrome:
`Header`, `Nav` (Disclosure-based), `MobileHeader`, `Toc`, `Footer`,
`ColorSchemeToggle`, theme context. Port `index.astro` to use it
(`ProgressCircle` ring, `Card` grid). Keep the existing `[slug].astro` body
temporarily so nothing breaks. Visually diff the shell against
`react-spectrum.adobe.com`.

**Phase 2 — Page framework.** Stand up MDX pages + the custom MDX component set

- the upstream-MDX migration script. Convert ~3 representative components by
  hand first (Checkbox = simple, Button = multi-example, DatePicker = complex) to
  validate the pipeline.

**Phase 3 — `ComparisonExample` + `PropTable`.** Build the dual-panel example
and the grouped parity-aware prop table. Wire the control metadata and the
parity data sources.

**Phase 4 — Bulk content port.** Run the migration script across all 69 tracked
catalogue entries; hand-tune prose, examples, anatomy, and `StateTable`s. Track
with the existing `comparison:report:gaps` reporting.

**Phase 5 — Parity overlays.** Re-home Coverage / Visual State / API parity into
the new styling; add the per-prop parity column; finalize empty states for
not-yet-ported components.

**Phase 6 — Cleanup.** Delete dead `s2-*` CSS from `global.css` (keep only
screenshot-frame / harness CSS). Update `COMPONENT_PLAYBOOK.md`,
`CURRENT_STATUS.md`, the `playbook/` notes, and the e2e/visual specs that assert
on old `.s2-*` selectors.

---

## 7. Acceptance criteria

- A component page placed next to the live `react-spectrum.adobe.com` page is
  visually indistinguishable in chrome, typography, spacing, and the example /
  prop-table layout (light and dark).
- The chrome is built from `solid-spectrum` components, not bespoke CSS.
- Each page carries the upstream prose and examples (full content parity) **plus**
  the React-vs-Solid comparison and porting-parity reporting.
- `global.css` no longer styles S2 surfaces; only harness chrome remains.
- Existing parity reports (`comparison:report:gaps`, `:exports`) and e2e/visual
  suites pass against the new selectors.
