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

| File | March status | Note |
| --- | --- | --- |
| `actiongroup/index.tsx` | **next unit (CP9.51)** | S2 removed ActionGroup → style off S2 `ToggleButtonGroup`/`ActionButtonGroup`/`SegmentedControl` macro values |
| `select/index.tsx` | certified (CP9.40) | recheck: invented strings on visual vs wrapper nodes; re-verify + re-baseline paint if needed |
| `menu/index.tsx` | certified (CP9.39) | same |
| `listbox/index.tsx` | certified (CP9.41) | same |
| `steplist/index.tsx` | not yet | Tier-4 unit |
| `landmark/index.tsx` | n/a | thin wrapper |
| `button/LogicButton.tsx` | n/a | recheck |
| `switch/index.tsx` | certified | one wrapper string (`relative bg-bg-400 rounded-full w-[250px]`) — likely a demo/track wrapper |

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
- **Phase 4 — apps/web.** Re-style the site off `local-utilities.css` onto the
  S2-styled library + real CSS; delete `local-utilities.css`. Confirm sequencing
  before starting (largest surface; changes the site's look).
- **Phase 5 — sweep + guard.** `apps/comparison` chrome; delete any remaining
  emitted utility strings; rebuild so `dist/` is clean; add a static gate
  (grep-based) that fails CI if an invented utility token reappears in library
  source.

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
ActionGroup *component* — only these hooks, which our `createActionGroup` is a
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
