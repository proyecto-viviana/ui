# Card And CardView Validation Notes

Updated: 2026-05-21

## Target

- Component: Card and CardView
- Slugs: card, cardview
- Family or direct subcomponents: Card, CardPreview, CollectionCardPreview,
  AssetCard, UserCard, ProductCard, CardContext, CardView, CardViewContext,
  GridList/GridListItem selection behavior, Image/Text/Content/Footer slot
  composition
- Pass goal: move Card and CardView from a catalogue gap to live React/Solid
  comparison coverage, cover the default Card docs composition, controlled
  CardView highlight selection, S2 size/density/variant styling, package
  exports, and record remaining upstream CardView feature gaps as blockers
  rather than accepting the component family.

## Task Status

| Task                   | Status  | Evidence                                                                                                                                  | Blocker or next action                                                        |
| ---------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 0 Research             | done    | S2 MCP Card/CardView docs; React Aria MCP GridList docs; installed `@react-spectrum/s2@1.3.0` Card/CardView source/export surface.        | None.                                                                         |
| 1 Baseline             | done    | Before pass Card was in the missing/gap list; after pass reports list `48` live entries and `21` missing/gap entries.                     | None.                                                                         |
| 2 Route harness        | done    | React/Solid styled fixtures, manifest entries, visual-state rows, and `card-cardview-contract.spec.ts`.                                   | None.                                                                         |
| 3 Source map/API       | partial | Public root exports and core props mapped. Full support API/type diff remains manual.                                                     | Add automated API diff.                                                       |
| 4 Cross-layer audit    | partial | Card/CardView, GridList, generated S2 CSS, comparison fixtures, and row selection behavior audited.                                       | Finish upstream branches below.                                               |
| 5 Transitions          | partial | Pointer press re-render regression fixed through GridList pointer-up activation.                                                          | Broaden hover/focus/pressed strict state coverage.                            |
| 6 State                | partial | Controlled CardView single highlight selection covered in browser and package tests.                                                      | Waterfall, loading, drag/drop, empty, and checkbox-selection branches remain. |
| 7 ARIA hooks           | partial | Grid row roles, accessible names, selected state, and press activation covered.                                                           | Full GridList keyboard matrix remains component debt.                         |
| 8 Headless             | partial | `GridListItem` pointer activation now survives pressed re-render and de-dupes click fallback.                                             | ListView/TableView consumers still need later regression checks.              |
| 9 Styled S2            | partial | Source-backed S2 classes and generated CSS cover default Card/CardView route and visual rows.                                             | Strict pair-diff for non-default states remains.                              |
| 10 Runtime lifecycle   | partial | ResizeObserver cleanup path and controlled selection refresh checked in source/tests.                                                     | Virtualizer/loading observer paths are not fully ported.                      |
| 11 Harness integrity   | done    | React fixture imports upstream S2; Solid fixture imports public package API; route image assertion no longer hard-codes transformed size. | None.                                                                         |
| 12 Comparison evidence | done    | Focused package tests, comparison build, focused Playwright, and refreshed reports listed below.                                          | None.                                                                         |
| 13 Acceptance          | partial | Card/CardView are live and gated for the current route slice, but not accepted under the full gate model.                                 | Resolve remaining gaps before acceptance.                                     |

## Gate Outcome Summary

| Gate                                     | Outcome | Evidence                                                                                                                                       | Blockers/owner                                                                                                          |
| ---------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Official Docs And Viewer Parity          | partial | Docs identify Card as selectable/navigable and CardView as selectable collection with bulk actions; default route examples live.               | Interactive viewer controls and all docs examples are not fully mirrored.                                               |
| External Authority And Standards         | partial | React Aria GridList docs/source behavior drive row roles, names, selected state, and keyboard/press expectations.                              | Complete GridList keyboard and drag/drop standards mapping remains.                                                     |
| Upstream React Source Parity             | partial | Installed S2 Card/CardView source mapped for layout options, size/density/variant defaults, Card contexts, preview slots, and selection style. | Waterfall/virtualized layout, loading skeletons, drag/drop hooks, action bar, link rows, and full support props remain. |
| Solid Idiomatic Implementation           | partial | Context props remain reactive, CardView size responds to ResizeObserver, and GridList pointer activation handles Solid child re-rendering.     | Remove `@ts-nocheck` and finish typed API parity.                                                                       |
| Accessibility And I18n                   | partial | Grid role/name, row role/name, controlled `aria-selected`, visible image/content slots, and keyboard Space/Enter unit coverage are present.    | Full keyboard navigation, checkbox selection affordance parity, link navigation, and AT transcript evidence remain.     |
| Behavior State Machine                   | partial | Controlled highlight selection now updates React and Solid from `apollo` to `zephyr`; pointer-up regression is covered.                        | Loading, empty, multiple selection, checkbox selection, action bar, drag/drop, and link/action precedence remain.       |
| Style Source-To-Computed Parity          | partial | S2 macros/generation cover Card/CardView core size/density/variant branches; live visual rows pass asserted thresholds.                        | Strict pair-diff and computed geometry for hover/focus/pressed/selected/disabled/loading/waterfall remain.              |
| React-Vs-Solid Comparison Harness Parity | passing | Both fixtures use current package imports, identical data, provider/theme conditions, public Solid API, and focused route tests.               | None for the current route slice.                                                                                       |
| Known Defects And Regression Protection  | partial | Fixed known CardView row click bug caused by pressed re-render suppressing browser `click`; added focused e2e regression.                      | Remaining known gaps below block full acceptance.                                                                       |
| Evidence And Handoff                     | passing | Commands and refreshed report numbers are recorded below.                                                                                      | None for handoff.                                                                                                       |

## Acceptance Gate Checklist

### 1. Official Docs And Viewer Parity

- [x] Live official S2 docs checked through MCP on 2026-05-21.
- [x] Primary Card example recorded: Card summarizes an object that can be
      selected or navigated to, with preview/content/text slots.
- [x] Primary CardView example recorded: CardView displays related objects with
      selection and bulk-action support.
- [x] Public default props recorded: Card/CardView size `M`, density `regular`,
      variant `primary`; CardView layout `grid`; CardView selectionStyle
      `checkbox`.
- [x] Route defaults mounted on both React and Solid stacks.
- [ ] Full interactive viewer controls, order, omitted-prop behavior, and every
      docs example mirrored in the comparison side panel.
- [ ] Bulk action bar, loading, waterfall, empty, drag/drop, and navigable card
      examples mirrored.

### 2. External Authority And Standards

- [x] React Aria GridList docs checked for row collection, interaction,
      selection, and keyboard ownership.
- [x] Current installed React Spectrum S2 source treated as the implementation
      authority for Card/CardView.
- [ ] Complete APG/grid keyboard matrix and drag/drop accessibility obligations
      mapped to tests.

### 3. Upstream React Source Parity

- [x] Upstream files identified:
      `@react-spectrum/s2/src/Card.tsx`,
      `@react-spectrum/s2/src/CardView.tsx`, and S2 Card/CardView exports.
- [x] Solid owner files identified:
      `packages/solid-spectrum/src/card/index.tsx`,
      `packages/solid-spectrum/src/cardview/index.tsx`,
      `packages/solidaria-components/src/GridList.tsx`, and
      `packages/solidaria/src/gridlist/*`.
- [x] Public root/subpath exports added for Card and CardView.
- [x] Core slots/subcomponents mapped:
      `CardPreview`, `CollectionCardPreview`, `AssetCard`, `UserCard`,
      `ProductCard`, `Image`, `Content`, `Text`, `Footer`, and `ActionMenu`
      slot contexts.
- [ ] `hrefLang`, `ping`, `referrerPolicy`, `routerOptions`, navigable Card
      inside CardView, and full link/action precedence parity.
- [ ] CardView `layout="waterfall"`, Virtualizer integration,
      `loadingState`, `onLoadMore`, skeleton collection behavior,
      `renderActionBar`, `renderEmptyState`, `disabledKeys`, and
      `dragAndDropHooks` parity.

### 4. Solid Idiomatic Implementation

- [x] CardView context and Card size/density/variant remain accessor-backed.
- [x] ResizeObserver setup has cleanup and drives responsive size reduction.
- [x] Children are passed lazily through Card providers.
- [x] GridList pointer activation now uses pointer-up plus click de-duplication
      so Solid pressed-state rerenders do not suppress selection.
- [ ] Remove `@ts-nocheck` from Card/CardView after API typing is complete.

### 5. Accessibility And I18n

- [x] CardView root exposes grid role and accessible name.
- [x] Card rows expose row role, accessible text value, and `aria-selected`.
- [x] Controlled selection regression covers pointer activation from the card
      body.
- [x] Card image/content/text slots are visible in both stacks.
- [ ] Full arrow-key navigation, focus ring, focus restoration, target size,
      disabled/read-only suppression, checkbox selection affordance, link row
      navigation, drag/drop announcements, and AT transcript evidence.
- [ ] Locale/direction/forced-colors state coverage beyond inherited S2 tokens.

### 6. Behavior State Machine

- [x] Card route default preview image and text slots mount on both stacks.
- [x] CardView controlled selected keys initialize to `apollo`.
- [x] Pointer selection changes CardView selected keys to `zephyr` and updates
      row `aria-selected`.
- [x] Pointer press state no longer loses activation when Card children re-render.
- [x] Space toggles selection in package coverage.
- [ ] Multiple selection, checkbox selection, disabled keys, empty state,
      loading state, load more, action bar, Card action, link navigation, and
      drag/drop state machines.

### 7. Style Source-To-Computed Parity

- [x] Card/CardView S2 macro source and generated CSS are owned in
      `packages/solid-spectrum`.
- [x] Size/density/variant default route styling is source-backed.
- [x] CardView grid template uses the S2 layout option ranges for responsive
      card sizing.
- [x] Current default visual rows pass asserted React/Solid live visual checks.
- [ ] Strict pair-diff and computed geometry coverage for hover,
      focus-visible, pressed, selected, disabled, quiet/tertiary, checkbox
      selection, loading, waterfall, and responsive size transitions.

### 8. React-Vs-Solid Comparison Harness Parity

- [x] React fixture imports current upstream `@react-spectrum/s2`.
- [x] Solid fixture imports public `@proyecto-viviana/solid-spectrum`.
- [x] Both fixtures use identical card data and provider/theme conditions.
- [x] Focused e2e proves route-mounted React and Solid DOM update for default
      Card and controlled CardView selection.
- [x] Image contract checks loaded dimensions/aspect instead of hard-coding a
      transformed upstream natural size.

### 9. Known Defects And Regression Protection

- [x] Known defect search covered focused failures, report output, source TODO
      risks, and observed browser behavior during this pass.
- [x] Fixed bug: CardView center click did not select the Solid row because
      pressed-state rerendering suppressed browser `click`; `GridListItem`
      now activates on pointer-up and ignores the follow-up click.
- [x] Regression evidence: `card-cardview-contract.spec.ts` clicks the CardView
      row and asserts controlled selected keys and `aria-selected`.
- [ ] Known upstream parity gaps above block acceptance.

### 10. Evidence And Handoff

- [x] Focused package tests:
      `vp test run packages/solid-spectrum/test/CardView.test.tsx packages/solid-spectrum/test/Wave4Components.test.tsx`.
- [x] Focused browser tests:
      `vp exec --filter @proyecto-viviana/comparison playwright test e2e/card-cardview-contract.spec.ts e2e/live-styled-visual.spec.ts -g "Card|CardView" --reporter=line`.
- [x] Comparison build:
      `vp run comparison:build`.
- [x] Reports refreshed:
      `vp run comparison:report:gaps`,
      `vp run comparison:report:exports`,
      `vp run guard:rac-export-gap`.
- [x] `vp run check`.
- [x] Final status is partial.

## Source Map And Public Contract

| Layer               | Upstream files                                        | Solid files                                                                  | Status  |
| ------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------- | ------- |
| State               | React Stately/GridList owners via S2 CardView         | `packages/solid-stately/src/gridlist/*`                                      | partial |
| ARIA hooks          | React Aria GridList and RAC GridListItem behavior     | `packages/solidaria/src/gridlist/createGridList.ts`, `createGridListItem.ts` | partial |
| Headless components | RAC GridList, GridListItem, Link paths                | `packages/solidaria-components/src/GridList.tsx`, `Link.tsx`                 | partial |
| Styled S2           | `@react-spectrum/s2/src/Card.tsx`, `src/CardView.tsx` | `packages/solid-spectrum/src/card/index.tsx`, `src/cardview/index.tsx`       | partial |

## Baseline And After

- Before this pass:
  - Card was in the missing/gap official entry list.
  - `solid-spectrum` did not expose Card/CardView root/subpath entries for this
    live route slice.
- After this pass:
  - `comparison:report:gaps`: `69` official entries tracked, `48` live on both
    sides, `21` missing/gap, `272` visual states tracked, `77` with current
    React/Solid evidence, and `46` strict pair-diff states.
  - `comparison:report:exports`: `208` React S2 value exports, `174`
    `solid-spectrum` value exports, `39` missing non-root/support exports, `5`
    extra Solid exports, and `0` missing catalogue root exports.
  - `guard:rac-export-gap`: `0` missing `solidaria-components` named exports,
    `166` extra exports.

## Known Remaining Gaps

| Gap                                                                                                            | Owner area                                                    | Blocks                        |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------- |
| Full official viewer control parity for Card/CardView examples.                                                | comparison route                                              | full docs/viewer gate         |
| Automated upstream-vs-Solid Card/CardView prop/type diff.                                                      | comparison API tooling                                        | full public API gate          |
| Card link support inside CardView plus `hrefLang`, `ping`, `referrerPolicy`, and `routerOptions`.              | `solid-spectrum` Card/GridList integration                    | navigable Card parity         |
| CardView `waterfall` layout and Virtualizer integration.                                                       | `solid-spectrum` CardView, `solidaria-components` Virtualizer | layout parity                 |
| CardView loading, load-more, skeleton collection, empty state, action bar, disabled keys, and drag/drop hooks. | `solid-spectrum` CardView/GridList                            | behavior/accessibility parity |
| Strict visual pair-diff and computed-style coverage for non-default Card/CardView states.                      | comparison e2e                                                | style parity acceptance       |
| Full GridList keyboard/focus/AT coverage for CardView selection modes.                                         | `solidaria`/`solidaria-components`                            | accessibility acceptance      |
| Remove `@ts-nocheck` once public API types are complete.                                                       | `solid-spectrum` Card/CardView                                | typed implementation quality  |

## Commands

- `vp test run packages/solid-spectrum/test/CardView.test.tsx packages/solid-spectrum/test/Wave4Components.test.tsx`
  - `2` files, `37` tests passed.
- `vp run comparison:build`
  - comparison build produced `70` pages including `/components/card` and
    `/components/cardview`.
- `vp exec --filter @proyecto-viviana/comparison playwright test e2e/card-cardview-contract.spec.ts e2e/live-styled-visual.spec.ts -g "Card|CardView" --reporter=line`
  - `4` browser tests passed.
- `vp run comparison:report:gaps`
  - `69` official entries tracked, `48` live on both sides, `21` missing/gap,
    `77` visual-evidence states, `46` strict pair-diff states.
- `vp run comparison:report:exports`
  - `39` missing non-root/support S2 exports, `5` extra Solid exports, `0`
    missing catalogue root exports.
- `vp run guard:rac-export-gap`
  - `0` missing, `166` extra.
- `vp run check`
  - formatting, lint, and typecheck passed after `vp run check:fix` formatted
    regenerated CSS and Markdown.

## Final Status

Partial. Card and CardView are now live in the comparison app with focused
default Card, controlled CardView selection, export, build, report, and browser
evidence. They are not accepted under the full gate model until the remaining
upstream CardView behavior, API, accessibility, and strict style gaps above are
closed.
