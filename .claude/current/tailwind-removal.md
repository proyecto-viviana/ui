---
kind: plan
status: current
---

# Tailwind removal — retire invented utility styling repo-wide

Plan of record for removing every invented Tailwind-vocabulary utility class from
the repo and returning each surface to its faithful styling mechanism: the **S2
style macro** for library components, real component CSS for apps. Runs alongside
the recertification march (`recertification.md`) — most invented-styled library
components are march units, so their styling conversion happens as part of their
red→green cert.

## Status (2026-07-23) — Phase 4 reopened, target decided

Phase 4 is **no longer descoped**, and its end-state is settled: `apps/web` takes
its styling from **`@proyecto-viviana/ui`** — the components, tokens, and `style()`
macro the library already ships — and `local-utilities.css` is deleted. Owner's
call, and the direct application of "check what we already have": the file was a
reimplementation of capabilities we own. No Tailwind build is added; `apps/web`
already wires the macro in `vite.config.ts`, and the library already exports
`Flex`, `Grid`, `Well`, `Divider`, `Content`, so nothing new is needed.

**The scale numbers below are wrong — they were never re-measured.** Actual counts
on 2026-07-23:

|                | claimed below | actual                    |
| -------------- | ------------- | ------------------------- |
| utility usages | ~9,863        | **2,601**                 |
| files touched  | 73            | **94**                    |
| file size      | 1878 lines    | 1912 lines (now **1317**) |

The job is ~4× smaller than documented, and heavily concentrated: **5 files carry
1,523 of the 2,601 usages (59%)** — `components/playground/advanced-sections.tsx`
(697), `routes/solid-spectrum/playground.tsx` (345),
`components/playground/advanced-data-color-sections.tsx` (224),
`routes/solid-spectrum/docs/components/color.tsx` (146),
`components/ThemeCreator.tsx` (111).

Progress: **143 of 299 class selectors (49%) were dead** and are deleted
(`bb0c5edc`, 1912 → 1317 lines), verified against dynamically-assembled class
names. Remaining work is converting the live usages, hot files first.

## Status (2026-07-18) — finalized at the library boundary

The **shipped library is done and guarded.** Every `packages/*/src` surface is off
invented Tailwind: the Phase-0/1 march units converted as part of their certs, and
the trailing thin wrappers (`landmark`, the story `ErrorBoundary`, the
`SearchAutocomplete` wrapper) are now on the S2 macro. A precise scan of
`solid-spectrum/src`, `viviana-ui/src`, and `solidaria-components/src` finds **zero**
invented Viviana semantic tokens (`bg-primary`/`text-on-color`/`bg-bg-*`/
`border-accent-*`/`bg-danger|success|warning-*`); the only remaining Tailwind-shaped
strings are standard scales (`blue-`/`red-`/`gray-`) inside **headless JSDoc
`@example` blocks**, which are legitimate consumer-styling examples. A blocking CI
gate now enforces this: **`guard:invented-utilities`** (`scripts/check-invented-utilities.ts`)
strips comments, then fails if the invented vocabulary reappears in library source.

**Phase 4 (`apps/web`) is deliberately descoped from this PR** — see the Phasing
note below. `apps/web` is the design system's **own internal docs + component
playground site** (not the published `@proyecto-viviana/ui` package, not the Viviana
Education landing #65, and not Akade — those are the customer products, in the
separate `education` repo). Its `local-utilities.css` is a self-contained, frozen,
app-local Tailwind-compat layer that the docs markup leans on **~9,863 times across
73 files**; it ships nothing, touches no cert, and currently works. Rewriting all of
it to delete one internal-tooling stylesheet is a large, high-regression job that is
orthogonal to the visual system this PR delivers and would swamp the review. It is
therefore split out as its own self-contained follow-up, not bundled here. The
library guard is scoped to `packages/*/src` for the same reason.

## The finding (what "Tailwind" actually is here)

There is **no Tailwind build** anywhere in the repo — no `tailwindcss` dependency,
no `tailwind.config.*`, no `@tailwind`/`@apply` directives (the only tailwind
configs on disk are inside the vendored `./react-spectrum/` reference checkout,
which is Adobe's own examples and not ours). What we have instead is:

- **`apps/web/src/local-utilities.css`** — a hand-rolled **1878-line** stylesheet
  that re-implements Tailwind's utility vocabulary as plain CSS classes
  (`.bg-accent`, `.bg-bg-100..400`, `.text-primary-100..700`, `.inline-flex`,
  `.items-center`, `.gap-1..6`, `.rounded-lg`, …). Imported via
  `apps/web/src/styles.css`.
- **Components that emit those class strings** in `class=`/`className=`
  (e.g. `getContainerClassName()` → `"vui-action-group inline-flex items-center
gap-1 rounded-lg border border-primary-600 bg-bg-300 p-1"`).

### Why this violates repo direction

- **"Mirror react-spectrum, don't invent."** The utility classes are made-up
  design tokens, not S2 values. A styled component built from them cannot be
  pixel-faithful to any S2 oracle.
- **"Check what we already have."** The S2 **style macro** already exists and is
  the faithful mechanism — **59 `solid-spectrum/src` files already use it**
  (`import … from "../style" with { type: "macro" }`), producing self-contained,
  S2-accurate CSS-in-JS.
- **Leaked styling dependency.** A library component that emits utility strings is
  styled **only when rendered inside `apps/web`** (the app that imports
  `local-utilities.css`). Rendered anywhere else — the comparison app, an external
  consumer (`viviana-social`, the `ui-client-contract.md` goal) — it appears
  **unstyled**. Self-inflicted divergence, not a real constraint → revert.

## Source census (excludes `dist/` build output and `node_modules`; `dist` regenerates on build)

### Library — parity-critical (convert to S2 style macro)

`solid-spectrum/src` files emitting **invented design tokens** (`bg-bg-*`,
`text-primary-*`, `border-primary-*`, `bg-accent`, `text-bg-*`):

| File                     | March status           | Note                                                                                                          |
| ------------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| `actiongroup/index.tsx`  | **next unit (CP9.51)** | S2 removed ActionGroup → style off S2 `ToggleButtonGroup`/`ActionButtonGroup`/`SegmentedControl` macro values |
| `select/index.tsx`       | certified (CP9.40)     | recheck: invented strings on visual vs wrapper nodes; re-verify + re-baseline paint if needed                 |
| `menu/index.tsx`         | certified (CP9.39)     | same                                                                                                          |
| `listbox/index.tsx`      | certified (CP9.41)     | same                                                                                                          |
| `steplist/index.tsx`     | not yet                | Tier-4 unit                                                                                                   |
| `landmark/index.tsx`     | n/a                    | thin wrapper                                                                                                  |
| `button/LogicButton.tsx` | n/a                    | recheck                                                                                                       |
| `switch/index.tsx`       | certified              | one wrapper string (`relative bg-bg-400 rounded-full w-[250px]`) — likely a demo/track wrapper                |

Plus ~36 `solid-spectrum/src` files carrying **generic** utility strings
(`inline-flex`, `items-center`, `gap-N`, …). Many overlap the 59 S2-macro files
(false positives where the string is inert or already-migrated); each is triaged
during its unit's conversion — a genuine emitted `class=` string → migrate; an
S2-macro call → leave.

### Library — custom layer (Tier 6)

`viviana-ui/src/custom`: `chip/index.tsx`, `logo/index.tsx`,
`timeline-item/index.tsx`. No S2 pair (custom surfaces) → style with the S2 macro
against WCAG/design intent, or dedicated component CSS. `solidaria-components/src`:
`Breadcrumbs.tsx` — the **base** layer should be unstyled/minimal; strip the
utility strings (styling belongs to the styled layer).

### Apps

- **`apps/web`** — 35 source files + **`local-utilities.css` itself**. This is the
  docs/marketing site and the biggest, app-level phase: re-style off the utility
  CSS onto the library's S2-styled components + real site CSS, then **delete
  `local-utilities.css`**. Downstream of the library fix.
- **`apps/comparison`** — `src/components/solid/chrome/styles.ts` (viewer chrome
  only, not a certified component surface).

### Tests

Unit/regression suites that assert on utility class strings
(`solid-spectrum/test/*` — regression, Menu, ListView, Toolbar, Separator, Tree,
DropZone, ActionMenu, Wave5_6_LayoutStory) update to the S2-macro contract as each
component converts (the CP9.49/CP9.50 wrong-oracle pattern: the test codified the
invented contract).

## Phasing (march-priority ordered)

- **Phase 0 — ActionGroup (CP9.51), now.** Convert `actiongroup/index.tsx` off
  invented Tailwind to the S2 macro **as part of its cert**. Kills two birds: the
  next march unit and the first Tailwind removal. (Cert oracle for behavior = v3
  `useActionGroup` hooks; see the CP9.51 plan below.)
- **Phase 1 — remaining invented-token library components.** select, menu,
  listbox, steplist, landmark, LogicButton, switch-wrapper. Convert to S2 macro,
  re-run each component's cert (behavior + paint), re-baseline paint snapshots
  where the faithful S2 values differ from the invented ones. Order by march
  priority; already-certified ones first (they regress-guard the conversion).
- **Phase 2 — viviana-ui custom (Tier 6).** chip, logo, timeline-item.
- **Phase 3 — solidaria-components base.** Strip Breadcrumbs (and any other base)
  utility strings; base layers render unstyled.
- **Phase 4 — apps/web. [ACTIVE as of 2026-07-23]** Re-style the internal
  docs/playground site off `local-utilities.css` and onto `@proyecto-viviana/ui`
  (components + tokens + `style()` macro), then delete the file. 2,601 usages
  across 94 files, 59% of them in 5 files — convert hot files first, each one its
  own verifiable commit. Dead rules already pruned. See the 2026-07-23 Status
  block for the corrected numbers; the ~9,863/73 figures previously here were
  never re-measured and overstated the job ~4×.
- **Phase 5 — sweep + guard.** Static gate **done**: `guard:invented-utilities`
  (`scripts/check-invented-utilities.ts`) blocks CI if an invented utility token
  reappears in library source (comments stripped; standard Tailwind scales in
  headless JSDoc examples intentionally allowed). The `apps/comparison` chrome
  sweep is descoped alongside Phase 4 — same internal-tooling category, not a
  shipped surface. `dist/` rebuilt clean as part of the library conversion.

## Verification per phase

- Component certs green (behavior D5/D6 + paint D1/D3/D7/D8 where applicable); no
  visual regression vs the S2 oracle; paint snapshots re-baselined intentionally,
  never silently relaxed.
- No source reference to a removed utility class remains in the converted surface.
- `local-utilities.css` line count trends to zero; deleted at the end of Phase 4.
- Full `packages` unit suites + typecheck green; full `e2e/certified` suite no
  regression.

---

## CP9.51 — ActionGroup cert (approved approach)

**Oracle = the pinned v3 `react-aria` hooks `useActionGroup` / `useActionGroupItem`
(react-aria 3.50.0).** S2 1.5.1 ships **no ActionGroup** (replaced by
`ActionButtonGroup` / `ToggleButtonGroup` / `SegmentedControl`), and RAC ships no
ActionGroup _component_ — only these hooks, which our `createActionGroup` is a
faithful port of. Those hooks are still pinned upstream, so parity applies and the
oracle is unambiguous ("no S2 component" ≠ "no oracle"). Same "no-S2-oracle → bare
upstream, D5+D6 only" precedent as ListBox.

**Contract already matches v3** (verified by source diff): group roles
`{none: toolbar, single: radiogroup, multiple: toolbar}`, item roles
`{none: —, single: radio, multiple: checkbox}`, nested-toolbar→`group` downgrade,
RTL arrow-flip, `aria-orientation`/`aria-disabled`.

**Suspected divergence to let the driver catch (don't pre-fix):** the port's item
`tabIndex` invents a single default tab-stop (`getDefaultTabStopKey`), while v3's
`useActionGroupItem` makes **all** enabled items tabbable until focus engages
(`isFocused || focusedKey == null ? 0 : -1`). Revert to v3 once D5 confirms red
(self-inflicted divergence).

**Plan:**

1. Build a React reference hand-wired from the two v3 hooks (they're comparison
   deps) — mirrors what the vendored `@adobe/react-spectrum` ActionGroup does —
   plus the comparison surface (demo codec / page / both fixtures / manifest /
   catalogue), mirroring the ListBox/GridList recipe.
2. Register **D5** (focus trail: roving tabIndex, arrow nav, RTL flip, Home/End) +
   **D6** (AX tree: dynamic group role, item role, `aria-checked`,
   `aria-orientation`, `aria-disabled`). Cases: `none` (toolbar), `single`
   (radiogroup), `multiple` (toolbar), plus a `vertical` orientation case; D10 RTL
   on the horizontal case.
3. Red → diagnose → faithful fix (the tabIndex revert + anything else the driver
   surfaces) → green.
4. **Styling:** restyle the styled layer off invented Tailwind onto the S2 macro
   (Phase 0 above), modeled on S2's `ToggleButtonGroup`/`SegmentedControl` values.
   Paint is not S2-pair-certifiable (no S2 ActionGroup), so paint drivers are
   scoped out; the styled layer is verified for self-containment (no
   `local-utilities.css` dependency) rather than pixel-diffed.
5. Ledger + memory + commit; advance march NEXT to **Toolbar**.
