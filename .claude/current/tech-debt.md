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
  - id: ci-gates-report-only
    title: Run the full gate ladder in CI as a non-blocking report
    state: done
    finished: 2026-06-16
    roadmap: certification-enforcement
    note: Landed as ticket/audit-scaffolding (certification-gates.yml)
  - id: ts-nocheck-style
    title: Remove @ts-nocheck from the 6 style/ files and fix surfaced errors
    state: open
    roadmap: certification-enforcement
  - id: ts-nocheck-components
    title: Remove @ts-nocheck from the ~29 component files (batched)
    state: open
    roadmap: certification-enforcement
  - id: lint-rules-reenable
    title: Re-enable the 13 disabled lint rules (or justify each inline)
    state: open
    roadmap: certification-enforcement
  - id: replace-tautological-tests
    title: Replace the tautological live-region and private-component tests
    state: done
    finished: 2026-06-15
    roadmap: certification-enforcement
    note: Landed in proof-batch PR #4
  - id: ci-gates-required
    title: Flip the gate ladder from report-only to required
    state: open
    depends:
      [
        ci-gates-report-only,
        ts-nocheck-style,
        ts-nocheck-components,
        lint-rules-reenable,
      ]
    roadmap: certification-enforcement
  - id: contract-spec-burndown
    title: Keyboard/focus/announcement contract specs for the 59 visual-only components
    state: open
    depends: [port-selection-manager, port-list-keyboard-delegate, port-context-slots]
    roadmap: certification-enforcement
  - id: port-selection-manager
    title: Port SelectionManager/Selection to the upstream anchor+current model
    state: open
    roadmap: headless-spine-port
  - id: port-list-keyboard-delegate
    title: Port ListKeyboardDelegate + useSelectableCollection/List/Item (with RTL)
    state: open
    roadmap: headless-spine-port
  - id: port-context-slots
    title: Make useContextProps/useSlottedContext/composeRenderProps live and slot-capable
    state: open
    roadmap: headless-spine-port
  - id: port-submenu-state
    title: Add submenu state to createMenuState
    state: open
    roadmap: headless-spine-port
  - id: menu-focus-roving
    title: Move real focus on focusedKey change in Menu
    state: done
    finished: 2026-06-15
    roadmap: headless-spine-port
    note: Landed in proof-batch PR #6
  - id: migrate-menu-spine
    title: Re-route Menu onto the ported manager+delegate; delete per-widget copy
    state: open
    depends: [port-selection-manager, port-list-keyboard-delegate]
    roadmap: headless-spine-port
  - id: migrate-listbox-spine
    title: Re-route ListBox onto the ported spine; switch ul/li to div[role]
    state: open
    depends: [port-selection-manager, port-list-keyboard-delegate]
    roadmap: headless-spine-port
  - id: migrate-combobox-nav
    title: Fix ComboBox filtered-list nav onto the ported delegate
    state: open
    depends: [port-list-keyboard-delegate]
    roadmap: headless-spine-port
  - id: migrate-describedby-slots
    title: Wire aria-describedby across components onto the ported slot path
    state: open
    depends: [port-context-slots]
    roadmap: headless-spine-port
  - id: macro-route-styled
    title: Route the 14 hand-authored components through style(); delete local-utilities.css
    state: open
    roadmap: consumer-delivery
  - id: viviana-ui-subpath-exports
    title: Add the 19 missing solid-spectrum sub-path exports to viviana-ui
    state: open
    roadmap: consumer-delivery
  - id: viviana-ui-button-passthrough
    title: Add an unstyled Button passthrough in solid-spectrum; re-route the 4 natives
    state: open
    roadmap: consumer-delivery
  - id: dead-natives
    title: Delete or wire Header/NavHeader/LateralNav
    state: open
    roadmap: consumer-delivery
  - id: picker-api-upstream
    title: Drop invented Picker props; expose selectedKey/onSelectionChange
    state: open
    roadmap: upstream-api-parity
  - id: treeview-api-upstream
    title: Drop grafted TreeView CardView props; expose only onAction
    state: open
    roadmap: upstream-api-parity
  - id: calendar-default-alignment
    title: Fix calendar start-vs-center default and rewrite the bug-asserting test
    state: done
    finished: 2026-06-15
    roadmap: upstream-api-parity
    note: Landed in proof-batch PR #3
  - id: calendar-i18n-strings
    title: Route calendar cell/grid/segment strings through createStringFormatter
    state: open
    roadmap: upstream-api-parity
---

# Tech Debt

Status: Current source of truth.
Update when: a debt is added, paid down, or its exit changes.

Known debt and temporary bridges. Each entry names its exit so it does not become
permanent.

## Certification gates exist but nothing runs them

The gate ladder (`vp run check`, `guard:*`, `comparison:report:parity:strict`,
`comparison:test:pair`/`test:contract`, `docs:check`) is defined in `package.json`
but no CI workflow invokes it, so any drift these guards and the pair/contract
suites would catch can merge green. `vp run typecheck` _does_ run in CI (via
`build` in `release-readiness`), but it passes only because 35 `solid-spectrum`
files carry `@ts-nocheck` and `tsc` skips them — the styled layer is unchecked
either way. This is the root enabler beneath the type-check, axe, and
visual-coverage debts below (Rule #1/#7). A non-blocking `certification-gates.yml`
workflow now projects the full ladder's status on every PR as the first step
toward enforcement.

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

A live instance of "one bug recurs across many": both the collection hook and the
item hook handle the selection key, so a focused-row Space toggles selection twice
and nets no change. Now fixed per-widget in both Table (grid-level Space/Enter
block removed, selection left to `createTableRow.ts`, 2026-06-19) and GridList
(same removal from `createGridList.ts`, selection/activation left to
`createGridListItem.ts`, plus a Table-style focus-following effect that carries
browser focus onto the focused row by a stable `data-key` so the row's own
handlers receive the keypress, 2026-06-21). Upstream `useSelectableCollection` has
no Space/Enter case; the item owns selection. These remain stopgaps — the spine
port should delete the duplication at its source instead of fixing it widget by
widget.

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
