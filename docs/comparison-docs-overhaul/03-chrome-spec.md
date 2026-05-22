# 03 · Chrome Component Build Spec

Per-region spec for rebuilding the docs chrome with `solid-spectrum`. Source of
truth is `react-spectrum/packages/dev/s2-docs/src/`. Each section gives: what
the region is, the upstream implementation, what to build, and notes.

Target location: `apps/comparison/src/components/solid/chrome/` (inside the
`@astrojs/solid-js` include — see [`02-style-and-build.md`](02-style-and-build.md) §4).

## 1. `DocsLayout` (the page frame)

Upstream: `Layout.tsx`. Renders `<Provider elementType="html">`, `<head>`, then
a centered flex column (`max-width: 1440`, padding/gap `12`) containing
`Header`, `MobileHeader`, then a row of `Nav` + `Main`, where `Main` is the
card surface (`backgroundColor: base`, `borderRadius: xl`,
`boxShadow: emphasized`) holding the article + `Footer` + `OptimisticToc`.

Build: an Astro layout `src/layouts/DocsLayout.astro` that emits `<head>` and
delegates the body shell to a Solid `<PageShell>` component. `PageShell` owns
the `Provider`, the flex scaffolding `style()` calls, and slots: `header`,
`nav`, `main`, `toc`. The MDX page content is passed into the `main` slot.

Notes:

- The article max-width / `isWide` / `isLongForm` logic exists upstream
  (`articleStyles`) — port the `default 768 / isWide none` variant; `isLongForm`
  (blog) is out of scope.
- `ToastContainer placement="bottom"` is mounted once at shell level.

## 2. `Header` (desktop top bar)

Upstream: `Header.tsx`. A 3-column CSS grid (`1fr auto 1fr`):

- **Left** — brand: a RAC `Link` containing the library icon + a
  `heading-sm`/`extra-bold` label, with `pressScale(ref)`.
- **Center** — `SearchMenuTrigger` (see §6).
- **Right** — `HeaderLink`s (Docs, Releases, Blog, GitHub, npm icons), a
  vertical `<Divider orientation="vertical">`, and `ColorSchemeToggle` (§5).

Build: `chrome/Header.tsx` (Solid). Map the comparison app's existing topbar
links: "Docs" → `/`, the React Spectrum link → `entry.docsUrl`, npm → the
`solid-spectrum` package. Brand label "Solid Spectrum".

Notes:

- Upstream uses `react-aria-components` `Button`/`Link`; use `solid-spectrum`'s
  `Link` and `Button` (both exported).
- Upstream has a view-transition animation tying the brand/search/label into
  the search overlay. Treat as **polish, defer** — ship a static header first.

## 3. `Nav` (left sidebar)

Upstream: `Nav.tsx`. A sticky `<nav>` (`top: 40`, `max-height: calc(100vh -
72px)`, scroll mask). Pages are grouped into sections; each section renders as:

```
<Disclosure isQuiet density="spacious" defaultExpanded={isComponents}>
  <DisclosureTitle>{sectionName}</DisclosureTitle>
  <DisclosurePanel><SideNav>…</SideNav></DisclosurePanel>
</Disclosure>
```

`SideNav` is a `<ul>`; `SideNavLink` is a RAC `Link` with `pressScale`, a
`focusRing`, `aria-current="page"` on the active route, bold text when current,
and a 2px rounded indicator bar that animates on hover/current. The "Overview"
section renders flat (no `Disclosure`).

Build: `chrome/Nav.tsx`, `chrome/SideNav.tsx`, `chrome/SideNavLink.tsx`
(Solid). Feed it from `data/component-groups.ts` (`groupComparisonEntries`) —
the comparison app already groups entries; map each group to one `Disclosure`.

Notes:

- This is the single most important visual swap: `<details>/<summary>` →
  `Disclosure`. It also makes `Disclosure` a _dogfooded_ component.
- `Disclosure` CSS must be added to the chrome CSS generation
  ([`02-style-and-build.md`](02-style-and-build.md) §2).
- Active-route detection: Astro knows the current path at render time — pass it
  down rather than the upstream client-side router.

## 4. `OptimisticToc` + `MobileHeader`

Upstream: `OptimisticToc.tsx`, `MobileHeader.tsx`.

- Desktop ToC — sticky right rail (`width: 180`), `OnPageNav` + `SideNav` +
  `SideNavLink` (reused from `Nav`), with an `IntersectionObserver` highlighting
  the current section.
- Mobile ToC — a `Picker` of `PickerItem`s (one per heading), shown inside
  `MobileHeader`.

Build: `chrome/Toc.tsx` + `chrome/MobileHeader.tsx`. The ToC needs the page's
heading tree. Astro's MDX exposes headings via the `getHeadings()` export of an
MDX module — use that instead of upstream's `tableOfContents`.

Notes:

- Reuse `SideNavLink` from §3.
- The `IntersectionObserver` scroll-spy is client-only — hydrate the ToC.
- Mobile chrome can land in a later phase; desktop ToC first.

## 5. Theming — `Provider` + color-scheme context

Upstream: `SettingsProvider` + `useSettings()` give `colorScheme`,
`systemColorScheme`, `toggleColorScheme`; `ColorSchemeToggle` is a `Button`
cross-fading `Contrast`/`Lighten` icons; `Provider` consumes `colorScheme`.

Build:

- `chrome/SettingsContext.tsx` — a Solid context: a `colorScheme` signal
  (`light` | `dark` | system), persisted to `localStorage`, seeded from
  `matchMedia('(prefers-color-scheme: dark)')`. Replaces `scripts/docs-theme`.
- `chrome/ColorSchemeToggle.tsx` — `Button` + the two S2 icons.
- Wrap pages in `solid-spectrum`'s `Provider` with `colorScheme` bound to the
  signal.

Notes:

- The comparison app's current `data-theme` / `data-resolved-theme` body
  attributes and the example-level "Color scheme" radio group must be
  reconciled with this context — one source of truth.
- An inline pre-hydration script should set the initial scheme to avoid a
  flash (upstream does the equivalent).

## 6. `SearchMenuTrigger` + search

Upstream: `SearchMenuTrigger.tsx` + `SearchMenu.tsx` — a large feature
(command-palette, recent items, view transitions, fuzzy search).

Build (MVP): `chrome/SearchTrigger.tsx` — a `Button` styled as the search box
(label + `/` `kbd`). On open, a `Popover`/overlay with a `SearchField` and a
filtered list over `comparisonEntries` (title + summary). Keyboard `/` focuses
it.

Notes: full command-palette parity is **explicitly deferred**. The MVP must
look like the upstream trigger and do basic component search.

## 7. `Footer`

Upstream: `Footer()` inside `Layout.tsx` — `<Divider size="S">` + a right
-aligned `body-2xs` list of Adobe legal `Link`s (`isQuiet`, `variant="secondary"`).

Build: `chrome/Footer.tsx`. Swap Adobe legal links for project-appropriate
links (repo, license, `solid-spectrum` npm, the React Spectrum reference). Keep
the `Divider` + small-type layout.

## 8. Typography

Upstream: `typography.tsx` — `H1`–`H4`, `P`, `LI`, `PageDescription`, `Code`,
anchor-link-on-hover headings, `clamp()`-based responsive `H1`.

Build: `chrome/typography.tsx`. Port `H1`–`H4`, `P`, `LI`, `PageDescription`
with the same `style()` calls. These become the MDX component overrides — see
[`04-content-pipeline.md`](04-content-pipeline.md) §2.

## Build order within the chrome

1. `SettingsContext` + `Provider` wrap (nothing renders correctly themed
   without it).
2. `DocsLayout` / `PageShell` scaffolding.
3. `typography` (needed by every page body).
4. `Nav` + `SideNav` (+ `Disclosure` CSS wiring).
5. `Header` + `ColorSchemeToggle` + `Footer`.
6. `Toc` (desktop).
7. `SearchTrigger` (MVP) and `MobileHeader` — last, deferrable.
