---
kind: reference
status: current
tasks:
  - id: pkg-build-spectrum-dts
    title: Move solid-spectrum dts to Vite Plus packaging
    state: in-progress
    roadmap: package-build-migration
    planned: { start: 2026-05-12, target: 2026-06-20 }
  - id: pkg-build-remaining
    title: Migrate remaining packages off tsup
    state: open
    depends: [pkg-build-spectrum-dts]
    roadmap: package-build-migration
  - id: support-export-audit
    title: Audit the 22 missing S2 support exports
    state: open
    roadmap: support-export-parity
---

# Tech Debt

Status: Current source of truth.
Update when: a debt is added, paid down, or its exit changes.

Known debt and temporary bridges. Each entry names its exit so it does not become
permanent.

## Certification gates exist but nothing runs them

The gate ladder (`vp run check`, `guard:*`, `comparison:report:parity:strict`,
`comparison:test:pair`/`test:contract`, `docs:check`) is defined in `package.json`
but no CI workflow invokes it, and `vp run typecheck` runs in no workflow either.
The guards and pair/contract suites only run when invoked by hand, so any drift
they would catch can merge green. This is the root enabler beneath the type-check,
axe, and visual-coverage debts below (Rule #1/#7).

**Exit:** a required CI job runs the full gate ladder (typecheck + `vp run check` +
`comparison:test:contract`/`pair` + ungated axe + `guard:*` + `docs:check`) on
every PR, so "green" means the documented bar passed.

## Shared headless spine is re-implemented per widget

Upstream's shared machinery is missing or inert and hand-rolled inside each widget,
so one bug recurs across many: `SelectionManager` is rewritten with a different
anchor/current model (`createSelectionState.ts:241-269`); there is no
`ListKeyboardDelegate`/`useSelectableCollection`, so each widget inlines arrow/Home/
End (`createMenu.ts:201-406`); `useContextProps`/`useSlottedContext`/
`composeRenderProps` are exported with zero call sites; `TextContext` is
`createContext<null>(null)` and cannot carry slots, so the description slot never
wires and `aria-describedby` is absent. Rule #4/#5.

**Exit:** the three keystones (`SelectionManager`, `ListKeyboardDelegate`/
`useSelectable*`, `useContextProps` + slot plumbing) are ported to their lowest
layer and the per-widget copies deleted; `aria-describedby` is emitted via the
shared slot path.

## Menu is not screen-reader-operable

Arrow keys update `state.setFocusedKey` (`createMenu.ts:217-400`), which flips each
item's `tabIndex` 0/-1 (`createMenuItem.ts:159`), but nothing calls
`element.focus()` and there is no `aria-activedescendant` in the menu module — so
navigation moves internal state without moving real DOM focus or the AT cursor. The
roving-tabindex pattern is only half-wired.

**Exit:** focusedKey changes move real focus (imperative `.focus()` on the active
item, or managed `aria-activedescendant`), proven by a Playwright keyboard +
computed-focus contract test.

## Styled components bypass the style macro (ship unstyled)

The macro engine is byte-identical to S2, but `14` public components (ListBox,
Select, Toolbar, Well, StepList, Separator, …) hand-author utility classes against
tokens that do not exist (`text-primary-200`, `bg-bg-400`) with no Tailwind/UnoCSS
build to resolve them (`select/index.tsx:167-223`, `listbox/index.tsx:96-189`).
They render only because `apps/web` ships a `local-utilities.css` backfill; an
installed consumer gets them unstyled, and the comparison harness masks this by
running in the same app scaffolding. Rule #4 / ADR-0001.

**Exit:** every styled component derives its classes from the `style()` macro; the
`local-utilities.css` backfill is deleted; the comparison harness renders the built
package, not in-repo source.

## Styled layer ships type-unchecked

`solid-spectrum` carries `@ts-nocheck` on `35` source files (the entire `style/`
subsystem and ~29 components; `0` such files in the three lower packages), and
`vite.config.ts:36-48` sets `13` lint rules to `"off"` (incl.
`typescript/no-floating-promises`, `eslint/no-unused-vars`). With typecheck also
absent from CI (above), prop/generic/variant drift in the styled layer is invisible.
`TableView` and `Menu` compile clean without the pragma, so it is removable, not
load-bearing. Distinct from "Lint type-checking runs separately" below, which is
about the `tsgolint` contract, not blanket suppression.

**Exit:** no `@ts-nocheck` under `packages/*/src`; the `13` disabled rules are
re-enabled or each justified inline; typecheck is green in CI.

## Tests do not enforce the certification bar

Coverage is visual-shaped, not behavior-shaped: `59` of `69` components have
visual-only e2e (no keyboard/focus/announcement contract); `5` WCAG axe scans
`test.skip` unless `RUN_AXE=1`, so `test:e2e` passes with zero axe assertions; the
sole live-region test is tautological (permits zero announcements,
`Toast.test.tsx:407-411`); and a calendar test asserts the known-wrong default
alignment (`createCalendarState.test.ts:758-769`). Extends "Visual-state coverage
debt" below from quantity (pair-diffs) to integrity (Rule #7).

**Exit:** each of the `59` gets a keyboard/focus/announcement contract spec; axe is
ungated in the blocking job; the tautological and bug-asserting tests are replaced
with ones that fail on the real defect.

## Component APIs invented beyond upstream

Upper-layer components add props upstream does not have, so they certify against
nothing: Picker invents `value`/`defaultValue`/`onChange`/`renderValue`
(`picker/index.tsx:99-104`) vs S2's `selectedKey`/`onSelectionChange`; TreeView
grafts CardView's `selectionStyle`/`renderActionBar`/`overflowMode` onto a component
whose only S2 prop is `onAction`; `viviana-ui` minted public names
(`Header`/`NavHeader`/`LateralNav`) without owner sign-off (Rule #2/#3).

**Exit:** invented props are removed or documented as explicit local additions;
public names-with-reach are owner-confirmed; `guard:rac-parity` covers the props.

## i18n strings hardcoded in the data/spectrum layers

User-facing strings are hardcoded English instead of routed through the shipped ICU
formatter: calendar cells append `" selected"` and omit "Today"
(`createCalendarCell.ts:169-171`); date/time segments drop the field label; the
calendar grid has no localized accessible name. `0` unit tests set a non-English
locale, so the regression is unprotected.

**Exit:** these strings come from `createStringFormatter`/the i18n dictionaries; a
contract test runs at least one non-English and one RTL locale.

## viviana-ui boundary skips and dead natives

`viviana-ui` reaches two layers down: `4` natives import `Button as HeadlessButton`
from `@proyecto-viviana/solidaria-components`, skipping `solid-spectrum`
(conversation/chip/nav-header/event-card) — not a behavior fork, but a layer-skip.
`19` `solid-spectrum` sub-path exports are absent from `viviana-ui`'s exports map,
so `import … from "@proyecto-viviana/ui/Tabs"` throws for an installed consumer
(distinct from the S2 support-export gap below). Three natives
(`Header`/`NavHeader`/`LateralNav`) are dead code.

**Exit:** an unstyled Button passthrough exists in `solid-spectrum` and natives
import from there; the `19` sub-paths are exported (or intentionally private); dead
natives are deleted or wired to a consumer.

## Package-build migration incomplete

Package builds are mid-migration to native Vite Plus packaging. Only
`@proyecto-viviana/solid-spectrum` has moved its JS/CSS build to `vp pack`/tsdown;
its declaration files still build through `tsc -p tsconfig.build.json`, and other
packages still use `tsup`.

**Exit:** every package builds through Vite Plus packaging (including dts);
`rg "tsup" package.json packages -g package.json` returns nothing, then `tsup` is
removed from the workspace.

## Lint type-checking runs separately

`typeCheck` is off in the Vite Plus lint block because the `tsgolint` path checks
files outside the `tsconfig.typecheck.json` contract (including mixed JSX test
files). Type errors are caught by a separate `vp run typecheck` after `vp check`,
not inside the lint pass.

**Exit:** the `tsgolint` path honors the `tsconfig.typecheck.json` contract;
re-enable `typeCheck` in the lint block and drop the separate step from `check`.

## axe color-contrast excluded from the blocking gate

`ci:a11y` (the blocking accessibility bar) temporarily excludes axe
`color-contrast`. `a11y:full` still runs contrast and stricter audits, but they do
not block PRs.

**Exit:** resolve the outstanding contrast findings, then remove the exclusion so
`color-contrast` blocks in `ci:a11y`.

## Visual-state coverage debt

The strict audit is green while visual-state coverage is partial: of `349`
tracked states, `113` have current React/Solid visual evidence and `56` have
strict pair-diff tests (`status.md`). No rows are _blocked_, but most are not yet
certified visually.

**Exit:** every rendering-affecting state row has a computed contract or strict
pair-diff test; screenshots remain review evidence only.

## Support-export gap

`22` of `208` React S2 value exports are missing from `solid-spectrum` (contexts,
slots, hooks, helpers, support values). Root catalogue export parity is complete;
support-export parity is not.

**Exit:** `comparison:report:exports` shows no missing S2 support exports, with
any Solid-only exports documented as local additions.

## License attribution incomplete (per-file headers)

The packages are SolidJS ports (derivative works) of Adobe's Apache-2.0 React
Spectrum stack, but only `12` of `989` source files retain the required per-file
copyright/license notice (Apache-2.0 §4(d)). Repo-level attribution is in place
(`LICENSE-APACHE-2.0`, `NOTICE`, `CREDITS.md`); the per-file pass is mapped in
[`docs/license-compliance-plan.md`](../../docs/license-compliance-plan.md).

**Exit:** every derivative source file retains its upstream Adobe header plus a
React→Solid change note (generated icons via the generator); genuinely original
files stay MIT without an Adobe notice.
