# 08 · Visual Audit (Fresh)

Fresh visual audit of `apps/comparison` against the unified Spectrum 2 docs at
`react-spectrum.adobe.com`. Captures and findings recorded at **2026-05-28**.

This supersedes the prior "Visual Audit Checkpoint" with first-hand evidence
from playwright captures rather than narrative status. Several of the
checkpoint's "Landed" / "Verified" bullets do not match what the dev server is
actually serving on `localhost:4321`; see [§3](#3-dev-environment-health)
before treating any visual finding here as a styling problem.

No code was changed for this audit.

## 1. Methodology

- **Tool**: `playwright-cli` (Chrome, headed=false, viewport `1440 × 900`,
  matches the upstream `Layout.tsx` `max-width: 1440` card).
- **Local target**: `http://localhost:4321` (dev server, Astro + Vite).
- **Upstream target**: `https://react-spectrum.adobe.com` root (the unified
  docs — `/s2/` redirects here; component pages live at `/<Component>`).
- **Pairs captured**: Landing (`/` vs `/`), Button
  (`/components/button` vs `/Button`), ComboBox
  (`/components/combobox` vs `/ComboBox`), TableView
  (`/components/tableview` vs `/TableView`).
- **Capture form**: per page, a viewport screenshot at the page's natural
  layout, then a second screenshot after relaxing the inner-pane scroll lock
  (`main { overflow: visible; height: auto }` plus `html`/`body`) so
  `--full-page` reaches the full article. Both upstream and local use
  inner-pane scrolling, so a naive `--full-page` returns only the visible
  viewport.
- **Assets**: `docs/comparison-docs-overhaul/assets/visual-audit/*.png`
  (eight `*-viewport.png` and eight `*-fullpage.png`). These were deleted
  twice during the prior session; if they are gone again, rerun the
  capture commands at the bottom of this file.
- **Theming**: default theme on both targets (light). Dark-mode comparison
  is **out of scope for this pass** and called out as Gap G10.

## 2. TL;DR

The two sites still diverge on every axis except the macro page-skeleton
(top bar + left sidebar + main + right ToC + footer). The headline issues:

1. **The React Spectrum S2 panel renders empty on every component page.**
   This is a dev-environment failure, not a styling gap — see
   [§3](#3-dev-environment-health). The checkpoint doc claims this is fixed.
   It is not, on the current `localhost:4321` build.
2. **The landing page is not a landing page**. Local renders the parity
   coverage dashboard inside the docs chrome; upstream renders a separate
   marketing surface (gradient hero, illustrated demo, no sidebar).
3. **The "example card" is shaped wrong**. Local stacks two stack-labelled
   sub-panels (`React React Spectrum S2 live` / `Solid solid-spectrum live`)
   inside one card, plus a separate "Generated source" panel and a
   "Porting note" disclosure. Upstream is one preview + one
   syntax-highlighted code block with copy/open actions.
4. **Body sections are parity-shaped, not docs-shaped**. Local pages carry
   `Coverage` / `Visual State Coverage` / `API` (flat list) / `Component
Layer` / `Headless Layer` / `State Layer`. Upstream pages carry per-feature
   `H2` prose sections (`Events`, `Pending`, `Content`, `Selection`, …) plus
   a real `API` prop table with `Name / Type / Default / Description`
   columns and grouped tabs (`Events / Forms / Accessibility / Advanced`).
5. **Right-rail ToC is flat and parity-shaped**. Local: `<Component> /
Example / Coverage / Visual State Coverage / API / Component Layer /
Headless Layer / State Layer / S2 source`. Upstream: nested per-feature
   tree derived from MDX headings, plus a "Copy for LLM" affordance and a
   `Related pages` tail.
6. **Top bar and sidebar are close in geometry but not in detail**. Brand
   wordmark, top-link set, and the `Components` disclosure title on the
   sidebar are off; upstream's sidebar is a single flat alphabetical list
   under no disclosure header (with `Guides` / `Reference` disclosures
   appended at the bottom).

Everything above is fixable inside the existing phasing
([`05-phasing.md`](05-phasing.md)) and chrome spec
([`03-chrome-spec.md`](03-chrome-spec.md)). The §3 dev-environment failures
need to land first or no subsequent visual gate will be trustworthy.

## 3. Dev environment health

While capturing, the browser surfaced **64 console errors on the Button
page**. They cluster into three root causes that together explain a large
fraction of what looks visually broken:

| Symptom (from `.playwright-cli/console-*.log`)                                                                                                                                                                                                                                                              | Likely cause                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `[plugin:react] @vitejs/plugin-react can't detect preamble. Something is wrong.` on `src/components/react/fixtures/styled.jsx`                                                                                                                                                                              | React fast-refresh preamble not injected — the React fixture module fails before mount, so the **React Spectrum S2 panel never renders** on any component page. |
| `404` on `@fs/.../packages/solidaria/dist/index.js` and `@fs/.../packages/solidaria-components/dist/index.js`                                                                                                                                                                                               | Sibling packages either not built (`vp pack`) or aliased to a `dist` that no longer exists.                                                                     |
| `500` on `src/styles/global.css` (repeated) and cascading `[vite] Failed to reload …` for every Solid chrome file (`DocsTopBar`, `DocsSidebar`, `DocsFooter`, `DocsToc`, `ComparisonIsland`, `ComponentExampleSection`, `ComponentExampleControls`, `ComponentDetailHero`, `ComponentDetailMeta`, fixtures) | A concurrent process is rewriting these files while Vite tries to hot-reload them; HMR keeps failing through transient inconsistent module graphs.              |

**Implication**: until these resolve, any visual claim against
`localhost:4321` is suspect. A second pair of clean captures should be taken
after **(a)** rebuilding sibling packages, **(b)** stopping concurrent edits
during the capture window, and **(c)** confirming `global.css` compiles
without a 500. The findings in §4–§5 below are written conservatively
against the parts of the page that _did_ render — chrome, layout, prose
shape, controls column, ToC — and avoid claiming "X is broken" when the more
likely cause is "X did not get a chance to mount".

## 4. Pair-by-pair findings

### 4.1 Landing (`/` vs `/`)

The two pages aren't trying to be the same surface. Upstream `/` is the
marketing landing for React Spectrum (no sidebar, gradient hero, illustrated
demo, "Built for modern development", CTA strip). Local `/` is the
parity-coverage dashboard inside the docs chrome.

| Region | Local                                                                                                                                                                          | Upstream                                                                                                                                                                          | Verdict                                                                                                                                                                                                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chrome | Docs chrome (top bar + sidebar + ToC + footer).                                                                                                                                | Marketing chrome (top bar only, no sidebar, no ToC).                                                                                                                              | **Architectural mismatch.** The local landing should pick a lane: keep it as `Components` overview page under the docs chrome, or split into a marketing landing + a separate `Components` index. See Fix F1.                                  |
| Hero   | `H1 "Solid Spectrum"` + parity descriptor + four status pills (`69 official S2 components`, `69 live routes`, `0 gaps`, `57% coverage`) + a `React Spectrum catalogue` button. | `H1 "Build apps with ease"` + lede paragraph + `Get started` / `Explore components` buttons over a purple-pink gradient bleed, with an animated rotating word in the H1 upstream. | Intentional content divergence — the parity hero must stay. The shape (size, padding, button styling) should still match upstream typography.                                                                                                  |
| Body   | `Overall coverage` card (progress bar) + filter column (Search / Parity / Status / Sort) + five stat cards + a 69-row component table.                                         | "Build Once. Adapt Everywhere." section + tools grid + "Everything you need…" icon grid + "Style Macros" section + "Responsive design" section + "Ready to get started?" CTA.     | Intentional content divergence. The local body is the project's reason to exist; do not port the marketing sections. The component table on the local landing should still feel like docs content, not a spreadsheet (current rendering does). |
| ToC    | `On this page`: `Solid Spectrum / Catalogue controls / Components / S2 source`.                                                                                                | None — there is no right rail on the upstream landing.                                                                                                                            | Local can keep the ToC if the landing stays inside docs chrome.                                                                                                                                                                                |

### 4.2 Button (`/components/button` vs `/Button`)

| Region                | Local                                                                                                                                                                                                                                                                                                                                                                                                                                              | Upstream                                                                                                                                                                                                                                                                                                                          | Verdict                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Top bar               | Black square placeholder + `Solid Spectrum` wordmark / centered `Search Solid Spectrum` / right links `Docs · React Spectrum · npm` + theme toggle.                                                                                                                                                                                                                                                                                                | Red Adobe icon + `React Spectrum` wordmark / centered `Search React Spectrum` / right links `Docs · Releases · Blog · GitHub icon · npm icon` + theme toggle.                                                                                                                                                                     | Geometry matches (3-column grid, centered search, divider before theme). Local placeholder logo and link set diverge. See Fix F2.                                                                                                                                                                                                                                                                                                                                                                                             |
| Sidebar               | `▾ Components` disclosure header above a flat alphabetical link list.                                                                                                                                                                                                                                                                                                                                                                              | No section header — single flat link list starting at the top, with `Guides` and `Reference` disclosures appended at the bottom.                                                                                                                                                                                                  | The `Components` disclosure wrapper is the comparison app's deliberate addition (per checkpoint). Verify it stays _quiet_, not visually heavy: upstream's `Components` section in `Nav.tsx` is the **flat default**, no disclosure. If the local design intent is to expose parity-taxonomy groups, the disclosure title should match upstream `DisclosureTitle` typography, density, and indent. See Fix F3.                                                                                                                 |
| H1 + page description | Same size and weight. Local description is parity-specific copy (`Baseline parity probe across styled, component, and headless layers …`).                                                                                                                                                                                                                                                                                                         | Upstream description is real component prose (`Buttons allow users to perform an action. …`).                                                                                                                                                                                                                                     | Intentional divergence per ADR. Both lines must use the **same `PageDescription` typography** (`solid-spectrum` `typography.PageDescription`). Currently visually close but not yet ported through the chrome typography helper.                                                                                                                                                                                                                                                                                              |
| Example card          | Two stack sub-panels stacked vertically inside one card: top = `React React Spectrum S2 live` (empty), bottom = `Solid solid-spectrum live` (renders the `Save` button). Below: a `Generated source` titled panel with the import + JSX, then a `▶ Porting note` collapsed disclosure. Controls column on the right has `children / variant / staticColor / fillStyle / size / isDisabled / isPending` plus extra harness-only knobs further down. | Single live preview (one `Save` button centered), one syntax-highlighted code snippet with copy + open-in-new-tab icons, no "Generated source" header, no porting note. Controls column on the right has `children / variant / staticColor / fillStyle / size / isDisabled / isPending` — only the official docs viewer controls. | Three real gaps. (a) React panel does not mount — see §3. (b) The dual `live` sub-panels are a parity-app intentional shape; they should not appear unless `staticColor`/`fillStyle`/route asks for them — see Fix F4. (c) The "Generated source" labeled box should be the upstream-style highlighted code block, not a labeled panel, and the porting note should sit _outside_ the example card or under a collapsed `Disclosure` (the checkpoint says this landed; on disk it still appears inside the card). See Fix F5. |
| Body sections         | `Coverage` (parity bars) → `Visual State Coverage` (9 parity rows with `React visual / Solid visual / pixel` badges) → `API` (flat alphabetical prop list with green `ported` badge, no types/defaults/descriptions) → `Component Layer` / `Headless Layer` / `State Layer` parity narratives.                                                                                                                                                     | `Events` (prose + code) → `Pending` (prose + code) → `API` (composition snippet + a real prop table with `Name / Type / Default / Description` columns + tabs `Events / Forms / Accessibility / Advanced`).                                                                                                                       | Two parallel layers need to coexist: docs prose + examples from upstream MDX (currently absent) and parity sections (currently present). See Fix F6 (port MDX), Fix F7 (proper prop table), Fix F8 (parity sections collapsed under one disclosure or moved below upstream body).                                                                                                                                                                                                                                             |
| ToC                   | `Button / Example / Coverage / Visual State Coverage / API / Component Layer / Headless Layer / State Layer / S2 source`.                                                                                                                                                                                                                                                                                                                          | `Events / Pending / API / Button` plus a `Copy for LLM` action and a `…` menu.                                                                                                                                                                                                                                                    | Local ToC follows the local body; it will resolve naturally once F6/F8 land if the ToC is source-backed from MDX headings (already a checkpoint claim). The `Copy for LLM` and `…` menu are upstream-only affordances — track as **deferred** unless requested. See Fix F9.                                                                                                                                                                                                                                                   |
| Footer                | Right-aligned `body-2xs` link row: `Solid Spectrum · React Spectrum · GitHub · License · npm`.                                                                                                                                                                                                                                                                                                                                                     | Right-aligned `body-2xs` link row: `Terms of Use · Privacy · Cookies · Do not sell my personal information` + Adobe copyright.                                                                                                                                                                                                    | Footer geometry matches (Divider + right-aligned small type, per `Footer` spec). Local content is correctly project-appropriate. ✓                                                                                                                                                                                                                                                                                                                                                                                            |

### 4.3 ComboBox (`/components/combobox` vs `/ComboBox`)

Same chrome verdict as Button. Component-specific gaps:

- **Live widget**: upstream renders a real `ComboBox` (`Ice cream flavor`
  label, `Select a flavor` placeholder, working dropdown). Local renders
  only the `React Spectrum S2` stack header (empty) — Solid panel is not
  visible above the fold; either the harness fails before mounting (see
  §3) or the example card is taller than 900px before Solid renders.
- **Controls column** diverges significantly. Upstream's official viewer
  controls: `label / placeholder / size / labelPosition / description /
contextualHelp / isDisabled`. Local shows: `label / selectedKey
(multi-choice pill set with values `starter`/`pro`/`enterprise`) /
selectionSource / inputValue / inputSource / placeholder / …` — many
  harness-only states are mixed into the **official-looking** control
  column. The checkpoint flags this as a remaining gate; it is still open
  on ComboBox. See Fix F10.
- **ToC** is the same parity-shape as Button (`Coverage / Visual State
Coverage / API / Component Layer / Headless Layer / State Layer`).
  Upstream's ComboBox ToC is rich and nested (`Content { Slots, Sections,
Asynchronous loading, Actions, Links } / Selection { Input value, Fully
controlled } / Forms / Popover options / API { ComboBox, ComboBoxItem,
ComboBoxSection } / Related pages`). See Fix F6/F9.

### 4.4 TableView (`/components/tableview` vs `/TableView`)

Same chrome verdict. Component-specific gaps:

- **Example card** is stacked panels (`React React Spectrum S2 live` over
  empty space, then `Solid solid-spectrum live` with the rendered Files
  table below). The Solid table renders correctly (`Project brief…` row
  selected, `Quarterly r… / Document / Noah / Review`, `Budget.xlsx /
Spreadsheet / Iris / Draft`). Upstream renders a single live `TableView`
  above a single code block — no stacked sub-panels. The checkpoint
  describes the stacked layout as an intentional width-preservation choice
  for collection components; that decision should be visible from the
  example card itself (clearly _not_ an empty React panel above a working
  Solid one). See Fix F11.
- **Controls column** matches upstream's viewer at the top
  (`selectionMode / overflowMode / density / isQuiet`) per the checkpoint —
  ✓. Confirm the hidden harness-only controls don't visually bleed into
  the visible control list below the fold (not validated in this pass).
- **Sidebar tail**: upstream sidebar exposes `Guides` and `Reference`
  disclosures at the bottom of the link list. Local sidebar does not. If
  the local docs grow guide-shaped or reference-shaped pages, the chrome
  must support sibling disclosures. See Fix F12 (low priority).

## 5. Gap catalogue

Ten gap categories, keyed to the chrome regions in
[`03-chrome-spec.md`](03-chrome-spec.md) and the phases in
[`05-phasing.md`](05-phasing.md).

| ID  | Region                          | Gap                                                                                                                                                                                                                                    | Spec ref               | Phase                 |
| --- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | --------------------- |
| G1  | Top bar                         | Brand wordmark uses a placeholder square icon; link set is `Docs · React Spectrum · npm` (3 links) vs upstream's `Docs · Releases · Blog · GitHub · npm` (5, with icons for GitHub/npm).                                               | `03 §2`                | Phase 1               |
| G2  | Sidebar                         | Wrapped in a single `Components` disclosure (with caret + heading) above a flat list; upstream sidebar is just the flat list with `Guides` / `Reference` disclosures appended.                                                         | `03 §3`                | Phase 1               |
| G3  | Landing                         | No marketing surface; local landing is the parity dashboard inside docs chrome. Upstream is a separate marketing page (gradient hero, illustrated demo, tools/style-macros/responsive sections, CTA strip).                            | n/a (new)              | Phase 1.5 or separate |
| G4  | Example card                    | Two `live` sub-panels stacked inside one card with the React one empty; "Generated source" rendered as a labeled box instead of an upstream-style highlighted code block with copy/open icons; porting note inside the card.           | `04 ComparisonExample` | Phase 3               |
| G5  | Body                            | Page body is parity-shaped (`Coverage` / `Visual State Coverage` / `Component Layer` / `Headless Layer` / `State Layer`) instead of upstream-shaped (per-feature `H2` sections + repeated example surfaces, e.g. `Events`, `Pending`). | `04 content pipeline`  | Phase 2 + 5           |
| G6  | Prop table                      | `API` is a flat alphabetical prop list with binary `ported` badges and no types/defaults/descriptions. Upstream renders a `Name / Type / Default / Description` table with grouped tabs (`Events / Forms / Accessibility / Advanced`). | `04 PropTable`         | Phase 3 + 4           |
| G7  | ToC                             | Right rail is flat and parity-shaped; upstream's is a nested per-feature tree derived from MDX headings, with `Copy for LLM` and a `…` action.                                                                                         | `03 §4`                | Phase 2 / 6           |
| G8  | Controls column                 | Some component pages mix harness-only controls into the **official-looking** viewer control column (ComboBox is the clearest case; Button has extras below the official set).                                                          | `04 ComparisonExample` | Phase 3               |
| G9  | Anchors / heading link-on-hover | Upstream headings show an anchor icon on hover (per `typography.tsx`); local headings do not (or the hover state is not yet wired through chrome typography).                                                                          | `03 §8`                | Phase 1               |
| G10 | Dark mode                       | Not validated in this pass. The checkpoint lists "Re-run light and dark visual captures" as a remaining gate.                                                                                                                          | `03 §5`                | Phase 1 (re-gate)     |

## 6. Fix plan

Severity-ordered. Each fix lists the smallest reasonable scope, the chrome
spec or pipeline doc it lives under, and the phase from `05-phasing.md`.

### Tier 0 — Blocking environment fixes

These must land before any further visual claim is trustworthy. They are
not in the porting plan because they are dev-server hygiene, not docs work.

- **F0a — Restore the React fixture mount.** Resolve the
  `@vitejs/plugin-react can't detect preamble` error on
  `src/components/react/fixtures/styled.jsx`. Without this the React panel
  is structurally invisible. Verify by checking the Button page console
  is clean and `R̲e̲a̲c̲t̲ ̲R̲e̲a̲c̲t̲ ̲S̲p̲e̲c̲t̲r̲u̲m̲ ̲S̲2̲` sub-panel renders a real `Save`
  button.
- **F0b — Rebuild sibling packages.** Resolve 404s on
  `packages/solidaria/dist/index.js` and
  `packages/solidaria-components/dist/index.js`. Either rebuild
  (`vp pack` / `vp build`) or fix the `@fs` alias to point at the current
  build output.
- **F0c — Stop `global.css` 500.** Diagnose the 500 returned for
  `src/styles/global.css`; the cascading "Failed to reload" entries point
  at HMR being unable to recover. May resolve once F0a/F0b unblock the
  graph.
- **F0d — Avoid concurrent edits during capture.** The audit window saw
  another process rewriting Solid chrome files in real time, which kept
  HMR in a failure loop. For repeatable captures, pause concurrent edits
  or capture against a `pnpm preview` build.

### Tier 1 — Chrome-level visual gaps (Phase 1)

- **F1 — Decide the landing surface** (G3). Either keep the parity
  dashboard _as_ the landing under docs chrome (with the upstream hero
  geometry), or split into `/` (marketing) and `/components` (catalogue).
  If you split, the marketing landing can stay deliberately lightweight
  (hero + 4 stat pills + CTA) without porting the full Adobe marketing
  illustrations.
- **F2 — Brand + top-bar link set** (G1). Real `solid-spectrum` wordmark
  - workflow icon in place of the black square; align the right-hand link
    set with the comparison-app information architecture documented in the
    checkpoint (`Docs / React Spectrum / npm`) and confirm GitHub/npm icon
    rendering matches `chrome/Header.tsx` (`03 §2`). The geometry already
    matches.
- **F3 — Sidebar shape** (G2). Confirm the `Components` disclosure title
  is intentional and tone it down to upstream `DisclosureTitle` density
  (`isQuiet`, `density="spacious"`), or remove the disclosure wrapper so
  the section behaves like upstream's flat default. Either is defensible;
  pick one and document it in `03 §3`.
- **F9 — Anchor hover** (G9). Wire `typography.H2`–`H4` from
  `chrome/typography.tsx` so headings show the anchor icon on hover (per
  upstream `typography.tsx`).

### Tier 2 — Example surface (Phase 3)

- **F4 — Default to single-preview example** (G4). The dual stack-labelled
  sub-panels are the parity app's special mode and should not be the
  default. Default to one preview surface; opt into the dual-stack panel
  only on routes that explicitly need React + Solid side-by-side parity
  (typically: width-sensitive collection components, controlled state
  parity validations).
- **F5 — Upstream-style code block** (G4). Replace the "Generated source"
  labeled box with a syntax-highlighted code block carrying copy and
  open-in-new-tab actions, matching `VisualExample.tsx`. Move the
  "Porting note" outside the example card, into a quiet collapsed
  `Disclosure` below the API table.
- **F8 — Separate harness controls from viewer controls** (G8). Audit
  every component page's control column. The visible column must contain
  only the official upstream docs viewer controls. Harness-only controls
  (route-testable state, hidden coverage knobs) belong in a separate
  `Disclosure` ("Advanced controls" / "Test harness") below the official
  set, or hidden behind a query string.

### Tier 3 — Page framework (Phase 2 + 5)

- **F6 — MDX content pipeline** (G5). Stand up the MDX page framework
  per `04-content-pipeline.md` §2 and the migration script
  (`scripts/import-s2-docs-mdx.ts`). Hand-port Button / ComboBox /
  TableView first so the `Events`/`Pending`/`Content`/`Selection`/…
  section pattern is visible. Append parity sections under a single
  collapsed `Disclosure` (per `05` Phase 0 question #4).
- **F8b — Source-backed ToC** (G7). Drive the right rail from
  `getHeadings()` on the MDX module (per `03 §4`) so the ToC tree mirrors
  upstream automatically once F6 lands. Keep the scroll-spy.

### Tier 4 — Prop tables (Phase 3 + 4)

- **F7 — Real prop table** (G6). Build the upstream-style `PropTable`
  with `Name / Type / Default / Description` columns and the
  `Events / Forms / Accessibility / Advanced` tab grouping (per
  `04-content-pipeline.md` §4). Wire to the chosen prop-metadata
  extractor (Phase 4); degrade to a `parity` column derived from the
  existing `apiProps` until the extractor lands.

### Tier 5 — Dark + re-gate

- **F10 — Re-capture light + dark.** Once F0–F8 land, rerun the eight
  captures (script below) plus a `colorScheme=dark` pass. Use the
  resulting pairs as the visual gate for declaring chrome parity.

## 7. Capture commands (for re-running this audit)

```sh
# in repo root
mkdir -p docs/comparison-docs-overhaul/assets/visual-audit
cd docs/comparison-docs-overhaul/assets/visual-audit

playwright-cli close 2>/dev/null
playwright-cli open about:blank
playwright-cli resize 1440 900

capture_pair() {
  local label=$1 url=$2
  playwright-cli goto "$url" > /dev/null
  playwright-cli resize 1440 900 > /dev/null
  sleep 3
  playwright-cli screenshot --filename "${label}-viewport.png" > /dev/null
  playwright-cli eval "() => { const m=document.querySelector('main'); if(m){m.style.overflow='visible';m.style.height='auto';m.style.maxHeight='none';} document.documentElement.style.height='auto'; document.body.style.height='auto'; document.body.style.overflow='visible'; return document.documentElement.scrollHeight; }" > /dev/null
  sleep 1
  playwright-cli screenshot --full-page --filename "${label}-fullpage.png" > /dev/null
}

capture_pair local-landing   http://localhost:4321/
capture_pair upstream-landing https://react-spectrum.adobe.com/
capture_pair local-button    http://localhost:4321/components/button
capture_pair upstream-button https://react-spectrum.adobe.com/Button
capture_pair local-combobox  http://localhost:4321/components/combobox
capture_pair upstream-combobox https://react-spectrum.adobe.com/ComboBox
capture_pair local-tableview http://localhost:4321/components/tableview
capture_pair upstream-tableview https://react-spectrum.adobe.com/TableView

playwright-cli close
```

If the React panel still shows empty after F0a lands, also dump
`.playwright-cli/console-*.log` for the affected page — that is where the
`@vitejs/plugin-react can't detect preamble` and the sibling-package 404s
will surface again.
