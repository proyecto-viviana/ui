# Accordion Validation Notes

## Target

- Component: Accordion
- Slug: accordion
- Family or direct subcomponents: AccordionItem, AccordionItemHeader,
  AccordionItemTitle, AccordionItemPanel; upstream S2 Disclosure/DisclosureGroup
  composition; ActionButton in the documented content example
- Pass goal: pre-pass inventory for current-gate validation, identifying the
  route, export, source, behavior, accessibility, style, and evidence blockers
  before implementation starts
- Date: 2026-05-16

## Task Status

| Task                   | Status  | Evidence                                                                                              | Blocker or next action |
| ---------------------- | ------- | ----------------------------------------------------------------------------------------------------- | ---------------------- |
| 0 Research             | done    | Live S2 Accordion page, S2 MCP page, React Aria Disclosure docs, APG Accordion pattern, sources       | None                   |
| 1 Baseline             | done    | Current comparison/export/RAC reports captured below                                                  | None                   |
| 2 Route harness        | done    | Comparison route mounts React and Solid Accordion fixtures with focused route-control spec            | None                   |
| 3 Source map/API       | done    | S2 Accordion/Disclosure, RAC Disclosure, ARIA hook, Stately, Solidaria, and Solid Spectrum mapped     | None                   |
| 4 Cross-layer audit    | partial | Branch ledger now separates covered shared, package-level S2 wrapper, and route harness work          | style-blocker          |
| 5 Transitions          | partial | Shared hook now covers panel CSS vars, animation settle, hidden delay, and `beforematch`              | style-blocker          |
| 6 State                | done    | Solid Stately item/group/over-expanded branches covered by focused tests                              | None                   |
| 7 ARIA hooks           | done    | Shared hook now matches panel role, hidden, `aria-hidden`, `beforematch`, and press timing            | None                   |
| 8 Headless             | done    | Default panel role, labelable panel props, group root ARIA drift, and trigger focus-visible covered   | None                   |
| 9 Styled S2            | partial | Package wrapper, route fixture, tokenized border, Adobe chevron geometry, and exact pixels match S2   | style-blocker          |
| 10 Runtime lifecycle   | done    | Shared panel lifecycle, route interaction semantics, and reduced-motion browser proof are covered     | None                   |
| 11 Harness integrity   | done    | `e2e/accordion-contract.spec.ts` proves live route controls and interaction semantics                 | None                   |
| 12 Comparison evidence | done    | Visual-state matrix now marks route-control, computed visual, and strict pair-diff contracts asserted | None                   |
| 13 Acceptance          | partial | Route, computed-style, strict visual, reduced-motion, RTL, focus, IDs, callbacks, and SSR are proven  | style-blocker          |

## Agent Workflow

No subagents used in this pre-pass. Coordinator owns the research, baseline, and
source audit.

| Task | Agent role  | Context pack                              | Docs/skills/tools                          | Allowed writes  | Required output                         | Status |
| ---- | ----------- | ----------------------------------------- | ------------------------------------------ | --------------- | --------------------------------------- | ------ |
| 0-1  | coordinator | Accordion docs, installed source, reports | react-spectrum-s2 skill, S2/React Aria MCP | validation note | pre-pass blockers and baseline evidence | done   |
| 3-8  | coordinator | S2/RAC/ARIA/Stately/Solid sources         | react-spectrum-s2 and react-aria skills    | validation note | source branch ledger and parity gaps    | done   |

| Agent role  | Files read                                                                                                                                                                                                                                                                                                                | Files changed | Evidence added                                | Commands run                                                                                       | Blockers                                  | Next owner     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------- | -------------- |
| coordinator | S2 Accordion docs, React Aria Disclosure docs, APG Accordion pattern, `@react-spectrum/s2/src/Accordion.tsx`, `@react-spectrum/s2/src/Disclosure.tsx`, RAC Disclosure, React Aria/Stately Disclosure, Solidaria/Solid Spectrum Disclosure and Accordion sources, current reports, component playbook and acceptance gates | this note     | research, docs parity, baseline, source audit | `vp run comparison:report:gaps`; `vp run comparison:report:exports`; `vp run guard:rac-export-gap` | route/source/style/a11y/behavior blockers | Accordion pass |

## Acceptance Gate Checklist

These gates remain partial until remaining forced-colors and multiple-instance
ID collision rows have focused evidence.

## Gate Outcome Summary

| Gate                                     | Outcome | Evidence                                                                      | Blockers/owner |
| ---------------------------------------- | ------- | ----------------------------------------------------------------------------- | -------------- |
| Official Docs And Viewer Parity          | partial | Official page, viewer controls, and route fixture semantics covered           | style-blocker  |
| External Authority And Standards         | partial | React Aria Disclosure docs and APG Accordion pattern checked                  | a11y-blocker   |
| Upstream React Source Parity             | partial | Shared layers, package S2 wrapper source, and route control proof are covered | style-blocker  |
| Solid Idiomatic Implementation           | partial | Lazy children mostly preserved; public API/style/ARIA drift                   | idiom-blocker  |
| Accessibility And I18n                   | partial | Shared RAC/ARIA deltas, SSR hidden props, focus-visible, IDs, and RTL covered | a11y-blocker   |
| Behavior State Machine                   | done    | Shared state, transitions, route callback payloads, and suppression covered   | None           |
| Style Source-To-Computed Parity          | partial | Computed, focus-ring, reduced-motion, RTL, and exact pair-diff contracts pass | style-blocker  |
| React-Vs-Solid Comparison Harness Parity | done    | Route, computed visual, and exact pair-diff contracts pass for live fixtures  | None           |
| Evidence And Handoff                     | done    | Baseline, refreshed reports, package, check, build, and route specs captured  | None           |

### 1. Official Docs And Viewer Parity

- [x] Live official S2 page opened and dated: 2026-05-16,
      `https://react-spectrum.adobe.com/Accordion`.
- [x] Primary docs example recorded: two items, `styles={style({width: 220})}`,
      titles "Personal Information" and "Billing Address", panels with form
      placeholder content.
- [x] Docs examples, slots, children, icons, images, collections, portals, and
      viewer canvas conditions inventoried: primary example, controlled
      expanding example, and header-content example with ActionButton.
- [x] Interactive viewer controls inventoried: `size` options `S/M/L/XL`
      default `M`; `density` options `compact/regular/spacious` default
      `regular`; booleans `isQuiet`, `isDisabled`, and
      `allowsMultipleExpanded` unchecked by default.
- [x] Comparison route default matches official example or deviation recorded:
      route uses the official two-item example, width `220`, default first
      expanded item, and the documented header-content ActionButton example.
- [x] Side-panel controls match official viewer controls and selection
      semantics: `size`, `density`, `isQuiet`, `isDisabled`, and
      `allowsMultipleExpanded` are wired to both stacks.
- [x] Route tests assert visible defaults/options and mounted DOM changes:
      `e2e/accordion-contract.spec.ts` covers defaults, viewer controls,
      multiple expansion, disabled triggers, and header ActionButton behavior.

### 2. External Authority And Standards

- [x] React Aria/S2 docs, testing docs, blog/release/example pages checked or
      recorded as `none found`: S2 Accordion and React Aria Disclosure checked;
      React Aria Accordion page not found.
- [x] W3C/WHATWG/APG/WCAG/ARIA-AT/evaluation sources checked where relevant:
      APG Accordion pattern checked for keyboard and role obligations.
- [ ] Chrome/web.dev/MDN/platform explainers used only for browser behavior,
      test strategy, or risk discovery: not needed yet.
- [ ] Independent/famous blog posts used only as risk discovery unless tied to
      normative source, installed source, or reproducible behavior: none found.
- [x] Source disagreements recorded with chosen authority: installed S2/RAC
      source is authoritative for runtime behavior; APG is used only for
      accessibility risk discovery where it is stricter or optional.
- [x] External obligations mapped to route/source/behavior/a11y/style rows or
      explicit gaps: branch ledger below records remaining route, style,
      semantics, state, and lifecycle blockers.

### 3. Upstream React Source Parity

- [x] Upstream files identified for every relevant layer:
      `@react-spectrum/s2/src/Accordion.tsx`; S2 imports Disclosure wrappers and
      `react-aria-components/DisclosureGroup`.
- [x] Solid owner files identified or gaps recorded:
      `packages/solid-spectrum/src/accordion/index.tsx` exports the documented
      S2 Accordion names while preserving legacy aliases.
- [x] Public props/defaults/slots/contexts/refs/exports mapped: table below.
- [x] DOM, ARIA, state, event, effect, cleanup, style, geometry, and
      cross-component branches mapped for primary upstream owners.
- [x] Source branch ledger covers user-observable upstream branches discovered
      in S2/RAC/ARIA/Stately sources.
- [ ] Every `matched` or `ported-differently` row has direct evidence:
      implementation evidence pending; current `matched` rows rely on existing
      focused source/tests and still require final parity proof.
- [ ] Remaining `gap` or `deferred-gap` rows have owners and are not counted as
      accepted: blockers recorded.

### 4. Solid Idiomatic Implementation

- [x] Dynamic props, context values, and derived values remain reactive:
      Solidaria generally uses accessors/context, and route controls prove S2
      size, density, quiet, disabled, and multiple-expansion updates.
- [ ] No prop destructuring/spread snapshots live Solid accessors: source audit
      found existing split/merge patterns; final implementation must preserve
      them.
- [x] Children remain lazy across provider/context boundaries: Solidaria
      Disclosure has explicit laziness safeguards, and route/package wrappers
      exercise the public S2 structure.
- [ ] Render props/custom roots receive live state where applicable: pending.
- [ ] Refs use Solid semantics: pending.
- [x] Effects, observers, timers, listeners, and subscriptions have cleanup:
      shared Disclosure tests cover animation RAF cleanup, `beforematch`, and
      animation-finish branches, with route reduced-motion proof.
- [x] Solid-specific deviations preserve documented public behavior: documented
      S2 public subcomponent names and props are exported; legacy aliases remain
      compatibility-only.
- [x] Tests cover relevant reactive update risks: state, route controls, S2
      wrapper reactivity, and transition lifecycle branches are covered;
      reduced-motion browser proof is covered at route level.

### 5. Accessibility And I18n

- [x] Native element, role, computed accessible name, description, and value:
      route contract and computed visual contract cover title buttons, default
      expanded state, panel role, hidden state, and header action adjacency.
- [x] ARIA references, generated IDs, ordering, and removal timing for the
      documented route items: route contract proves unique generated IDs,
      `aria-controls` resolution, `aria-labelledby` linkage, and collapsed
      hidden state against React.
- [x] Keyboard model, focus order, focus-visible, focus return, and
      focus-not-obscured behavior: route contract proves keyboard focus-visible
      trigger data attrs and computed S2 focus-ring styles against React.
- [x] True server-rendered hidden props: shared ARIA hook proof matches React
      Aria's SSR branch, where collapsed server panels get boolean `hidden`,
      expanded server panels omit `hidden`, and hydrated browser panels leave
      `hidden` to the runtime lifecycle.
- [ ] Multiple-instance ID collision checks: route proves generated-ID and
      hidden linkage for the documented item set only.
- [x] Disabled/read-only/required/invalid/inert/hidden semantics: shared
      Disclosure tests cover disabled suppression, `aria-hidden`,
      `hidden="until-found"`, and panel CSS variable visibility states.
- [ ] Form labels/help/error/validation/hidden-input/reset/submit behavior:
      not applicable unless content examples include nested forms; source audit
      must confirm.
- [ ] Live regions, loading/selection/drag-drop announcements, and cleanup
      timing: likely not applicable; source audit must confirm.
- [ ] Forced colors, reduced motion, contrast-sensitive states, target size,
      and screen-reader-only affordances: reduced-motion panel transition and
      focus-ring style proof are covered; forced-colors remains pending.
- [x] Locale, direction, formatting, calendar/hour-cycle, and messages: S2 title
      chevron LTR/RTL geometry, direction, rotation, and exact route pixels are
      covered.
- [ ] Axe or similar smoke result, plus manual semantic assertions: pending.

### 6. Behavior State Machine

- [x] State/input -> trigger -> expected React -> expected Solid -> evidence
      rows completed for shared Stately/Solidaria branches; route pair evidence
      pending.
- [x] Pointer, keyboard, touch, virtual click, blur, Escape, cancellation,
      outside press, disabled/read-only suppression: shared hook now separates
      keyboard `onPressStart` from pointer `onPress` and focused tests cover
      keyboard timing plus disabled suppression.
- [x] Controlled/uncontrolled, defaults, reset, submit, async/loading/empty,
      collection navigation: state tests cover item state, group state,
      single/multiple expansion, and over-expanded cleanup.
- [x] Event ordering, callback payloads/counts/suppression, propagation, and
      cancellation: shared callback tests cover state layers; route contract
      proves `onExpandedChange` payloads/counts for single and multiple
      expansion plus header-action and disabled-trigger suppression.
- [ ] Overlay/portal/scroll-lock/hiding/focus/timer/observer/listener cleanup:
      likely not applicable except panel transition cleanup; source audit must
      confirm.
- [x] Before/trigger/immediate/transient/settled/cleanup transition evidence:
      shared hook tests cover initial hidden state, expanding/collapsing CSS
      variables, animation settle, delayed hidden, and `beforematch`.

### 7. Style Source-To-Computed Parity

- [x] Upstream S2 style declarations and owner branches identified:
      Accordion root flex-column style and S2 Disclosure subpart styles.
- [x] Solid style/token path uses S2-compatible generated classes: Solid
      Accordion/Disclosure use generated S2 style classes and tokens.
- [ ] Comparison app CSS does not patch component behavior/style/geometry:
      pending route audit.
- [x] Size/density/variant/staticColor/orientation/placement/field-state and
      provider/form style axes mapped: S2 `size`, `density`, and `isQuiet`
      are covered by computed proof and exact route screenshots.
- [x] Computed-style/class/attribute/geometry/CSS-variable assertions cover
      rendering-affecting branches: `accordion-visual.spec.ts` compares root
      flex/width, item borders/colors, title typography/spacing, chevron
      geometry/path, panel padding, disabled styling, quiet styling, and header
      ActionButton geometry across the viewer axes.
- [ ] Forced-colors/reduced-motion/focus-ring/icon/image/avatar/slot/portal
      geometry branches covered: reduced-motion, focus-ring, and RTL branches
      are covered; forced-colors remains pending.
- [x] Official viewer canvas/background/scale/width/direction/theme conditions
      represented or recorded as gaps: route fixes the example width at `220`
      and runs under pinned comparison theme; exact pair-diff uses in-place
      root captures to avoid transparent-background harness noise. RTL is
      covered through provider locale routing and exact route pixels.
- [x] Visual deviations classified: computed proof found and fixed Solid's
      hard-coded light border and non-S2 stroked chevron; strict pair-diff now
      passes for the default, compact, quiet, disabled, and multiple-expanded
      route states.

### 8. React-Vs-Solid Comparison Harness Parity

- [x] React fixture imports current upstream component and official
      composition: `@react-spectrum/s2` Accordion subcomponents are mounted in
      the styled reference fixture.
- [x] Solid fixture imports package public API: `@proyecto-viviana/solid-spectrum`
      Accordion subcomponents are mounted in the styled reference fixture.
- [x] Both fixtures receive the same props and environment settings:
      `accordion-demo.ts` normalizes and serializes the shared route props.
- [x] Focused route tests prove controls update mounted React and Solid DOM:
      `e2e/accordion-contract.spec.ts` passes for defaults, controls,
      multiple expansion, disabled state, and header action behavior.
- [x] Computed style, a11y, geometry, runtime, or pair-diff evidence covers
      rendering-affecting branches: route contract covers semantics/runtime and
      `accordion-visual.spec.ts` covers computed style, geometry, and strict
      pair-diff states.
- [x] Harness stability is proven: fresh build plus Playwright route contract
      passes on a dedicated comparison preview port.

### 9. Evidence And Handoff

- [x] Focused package tests: Stately, Solidaria, Components, and Spectrum
      Disclosure/Accordion tests cover shared state, ARIA, headless, and S2
      wrapper behavior.
- [x] Focused Playwright/runtime tests:
      `e2e/accordion-contract.spec.ts` covers live route semantics and
      `e2e/accordion-visual.spec.ts` covers computed style plus exact
      pair-diff states.
- [x] Comparison reports refreshed when status/evidence changed: baseline
      captured.
- [x] `vp run check`: passed after formatting the pre-pass note.
- [x] Final status is `accepted`, `partial`, or `pre-pass`: partial.
- [x] Remaining gaps listed by gate and owner: see blockers above.
- [x] Blocker labels used where applicable.

## Research

- React Aria docs: no Accordion page found; Disclosure page used because S2
  Accordion delegates to S2 Disclosure and RAC DisclosureGroup.
- React Aria blog/release/example/testing pages: none found in this pre-pass.
- S2 docs: Accordion page, sections `Expanding`, `Content`, `API`.
- APG patterns/examples: W3C APG Accordion pattern checked for keyboard and
  role/property obligations.
- W3C/WHATWG/WCAG/ARIA-AT/evaluation sources: APG only so far; full pass should
  consult WAI-ARIA/HTML-ARIA/accname if source semantics disagree.
- Chrome/web.dev/MDN platform explainers: none needed yet.
- Independent blog posts or articles: none found.
- Other standards from Source Index: none used.
- Source disagreements and chosen authority: installed S2/RAC/React
  Aria/Stately source is authority for component API and behavior; APG informs
  accessibility risk rows where it describes expected accordion semantics.
- Missing related docs recorded as `none found`: React Aria Accordion page.

## Official Docs And Viewer Parity

| Docs item         | Official setting/example                                                               | Route/control   | Status  | Evidence                       |
| ----------------- | -------------------------------------------------------------------------------------- | --------------- | ------- | ------------------------------ |
| Primary example   | Two AccordionItems; width `220`; titles "Personal Information" and "Billing Address"   | route fixture   | covered | `accordion-contract.spec.ts`   |
| Viewer `size`     | `S`, `M`, `L`, `XL`; default `M`                                                       | route controls  | covered | `accordion-contract.spec.ts`   |
| Viewer `density`  | `compact`, `regular`, `spacious`; default `regular`                                    | route controls  | covered | `accordion-contract.spec.ts`   |
| Viewer booleans   | `isQuiet`, `isDisabled`, `allowsMultipleExpanded`; unchecked by default                | route controls  | covered | `accordion-contract.spec.ts`   |
| Expanding example | Controlled `expandedKeys` initialized by the fixture; `onExpandedChange` updates state | route fixture   | partial | `accordion-contract.spec.ts`   |
| Content example   | `AccordionItemHeader` with `AccordionItemTitle` plus nested `ActionButton`             | route fixture   | covered | `accordion-contract.spec.ts`   |
| API subcomponents | `AccordionItem`, `AccordionItemHeader`, `AccordionItemTitle`, `AccordionItemPanel`     | package exports | covered | `Accordion.test.tsx`           |
| Panel role        | `AccordionItemPanel` role default `group`, supports `region` and ARIA labeling props   | package exports | covered | Components and Accordion tests |

## Incoming Cross-Component Findings

| Discovered in      | Upstream owner             | Affected API/context                                             | Required later validation                                                                                                        |
| ------------------ | -------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Accordion pre-pass | S2 Accordion -> Disclosure | DisclosureContext, DisclosureGroup, DisclosureTitle/Header/Panel | Disclosure validation must cover the S2 styled implementation because Accordion delegates item structure and interaction to it.  |
| Accordion pre-pass | Content example            | ActionButton inside AccordionItemHeader                          | Accordion route should include the documented non-trigger header action and verify it does not become part of the title trigger. |
| Source audit       | RAC Disclosure             | ButtonContext trigger slot, panel props, focus-visible-within    | Solidaria component tests must cover trigger slot semantics, focus-visible data attrs, and default panel role `group`.           |
| Source audit       | React Aria hook            | hidden state, `aria-hidden`, CSS panel size vars, `beforematch`  | Solid ARIA hook must port the runtime lifecycle, not only static `aria-expanded`/`aria-controls` props.                          |
| Source audit       | Stately DisclosureGroup    | single vs multiple expansion, controlled key sets                | State tests must cover over-expanded cleanup and callback timing in addition to click behavior.                                  |

## Baseline

- `comparison:report:gaps` lines:
  - official entries in comparison app: `69`;
  - official styled entries live on both sides: `33`;
  - missing/gap entries: `36`;
  - Accordion is `react=tracked solid=missing`;
  - Accordion styled default visual state is `blocked`;
  - official visual states tracked: `181`;
  - current visual evidence states: `49`;
  - strict pair-diff states: `32`;
  - blocked visual states: `35`.
- `comparison:report:exports` lines:
  - React Spectrum S2 package: `@react-spectrum/s2@1.3.0`;
  - baseline missing React S2 value exports: `80`.
- `guard:rac-export-gap` result:
  - missing Solidaria Components RAC exports: `0`.
- Improvement target:
  - move Accordion from tracked gap to live route evidence only after the
    package exports, S2-compatible structure/styles, behavior semantics, and
    route controls are implemented and proven.
- Current refresh after SSR hidden prop proof:
  - official styled entries live on both sides: `34`;
  - missing/gap entries: `35`;
  - official visual states tracked: `187`;
  - current visual evidence states: `50`;
  - strict pair-diff states: `34`;
  - blocked visual states: `34`;
  - Accordion no longer appears in the missing/gap official entries.
  - export report now has `0` missing catalogue root exports and `76` missing
    non-root/support S2 exports; the Accordion support exports are no longer in
    the missing support list.

## Source Map And Public Contract

| Layer              | Upstream files                                                                      | Solid files                                                                                                | Status  |
| ------------------ | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------- |
| State              | `@react-stately/disclosure/src/useDisclosureState.ts`, `useDisclosureGroupState.ts` | `solid-stately/src/disclosure/createDisclosureState.ts`                                                    | covered |
| ARIA hooks         | `@react-aria/disclosure/src/useDisclosure.ts`                                       | `solidaria/src/disclosure/createDisclosure.ts`                                                             | covered |
| RAC/headless       | `react-aria-components/src/Disclosure.tsx`                                          | `solidaria-components/src/Disclosure.tsx`, `solidaria/src/disclosure/createDisclosureGroup.ts`             | partial |
| Styled S2          | `@react-spectrum/s2/src/Accordion.tsx`, `@react-spectrum/s2/src/Disclosure.tsx`     | `packages/solid-spectrum/src/accordion/index.tsx`, `packages/solid-spectrum/src/disclosure/index.tsx`      | partial |
| Public package API | `@react-spectrum/s2/src/Accordion.tsx`, S2 package root/subpath exports             | `packages/solid-spectrum/src/index.ts`, `packages/solid-spectrum/src/accordion/index.tsx`, package exports | covered |

- Public props/defaults:
  - Accordion: `children`, `styles`, `size='M'`, `density='regular'`,
    `isQuiet`, `allowsMultipleExpanded`, `isDisabled`, `expandedKeys`,
    `defaultExpandedKeys`, `onExpandedChange`, `id`, `slot`,
    `UNSAFE_className`, `UNSAFE_style`.
  - AccordionItem: `children`, `size='M'`, `density='regular'`, `isQuiet`,
    `id`, `isDisabled`, `isExpanded`, `defaultExpanded`, `onExpandedChange`,
    `styles`, slot and unsafe style props.
  - AccordionItemTitle: `children`, `level=3`, id and unsafe style props.
  - AccordionItemHeader: `children`, id and unsafe style props.
  - AccordionItemPanel: `children`, `role='group'`, ARIA labeling props, id
    and unsafe style props.
- Slots/subcomponents:
  - S2 exports explicit Accordion subcomponents: `AccordionItem`,
    `AccordionItemHeader`, `AccordionItemTitle`, `AccordionItemPanel`, and
    `AccordionContext`.
  - Solid root and `src/accordion` now export documented S2 names:
    `AccordionContext`, `AccordionItem`, `AccordionItemHeader`,
    `AccordionItemTitle`, and `AccordionItemPanel`. Legacy owner aliases remain
    for compatibility but are no longer the root public mapping.
- Contexts/providers:
  - S2 exports `AccordionContext` and provides `DisclosureContext` with
    `size`, `isQuiet`, and `density`.
  - Solid Spectrum Accordion now exposes `AccordionContext` and provides the S2
    Disclosure context contract for `size`, `density`, and `isQuiet` to item
    subparts.
- Refs/imperative methods:
  - S2 uses DOM refs through `useDOMRef` on Accordion, Disclosure, title,
    header, and panel wrappers. Solid ref parity must be proven through the
    public wrappers after S2 names are ported.
- Unsupported or intentionally different branches:
  - None accepted. Legacy owner aliases remain only as compatibility exports;
    the public S2 Accordion names and generated Disclosure styling are now the
    route/package parity path. The prior default panel role and panel lifecycle
    gaps are ported in the shared layers.

## Cross-Layer Audit

| Layer               | Matched                                                                                                                                           | Ported differently                                       | Not applicable | Gaps                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | -------------- | -------------------------------------------- |
| State               | controlled/uncontrolled item and group tests, over-expanded trim, route callback payloads and suppression                                         | Solid uses `queueMicrotask` for over-expanded trim       |                | None                                         |
| ARIA hooks          | ids, `aria-expanded`, `aria-controls`, disabled, hidden lifecycle, SSR hidden prop, hydrated route linkage                                        |                                                          |                | multiple-instance ID collision proof pending |
| Headless components | lazy children, primitives, data attrs, panel role, labelable props, trigger focus-visible attrs                                                   | native Solid context/accessor implementation             |                | custom-root/ref proof pending                |
| Styled S2           | S2 size/density/quiet/header/title/panel source, route semantics, focus-ring, computed visual contract, reduced-motion, RTL, and strict pair-diff | Solid uses generated S2 style classes and local wrappers |                | forced-colors route proof pending            |

- Solid idioms checked:
  - child/provider laziness: Solidaria Disclosure keeps children lazy through
    providers; route and package wrappers now exercise the public S2 structure.
  - dynamic prop/context getters: Solidaria and Solid Stately mostly use
    accessors; route controls now prove S2 styled prop reactivity for the
    viewer axes.
  - render-prop/custom root liveness: Solidaria `useRenderProps` exists; route
    evidence covers mounted wrapper updates, while custom-root liveness remains
    package-level source coverage.
  - refs and cleanup ownership: refs exist in Solidaria; shared Disclosure now
    cleans up RAF state and handles animation/`beforematch` lifecycle.

## Interaction Dependency Map

| Subpart        | Upstream input                                                    | Observable output                                                             | Parity proof                                                                             | Status          | Evidence                                                  |
| -------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------- | --------------------------------------------------------- |
| Root group     | `styles`, `UNSAFE_style`, `UNSAFE_className`, ref                 | flex column root, style override support, DOM ref                             | package test plus computed route style/class assertion                                   | partial         | `Accordion.test.tsx`; route semantics/visual specs        |
| Root context   | `size`, `density`, `isQuiet`                                      | Disclosure title/header/panel style changes                                   | pair route control test for all viewer values and source-level style assertions          | route-covered   | `Accordion.test.tsx`; route semantics spec                |
| Group state    | `allowsMultipleExpanded`, `expandedKeys`, `defaultExpandedKeys`   | one vs multiple expanded items, controlled key set callbacks                  | state tests plus route interaction comparing React/Solid callback payloads               | route-covered   | Stately tests; route contract spec                        |
| Item state     | `id`, `isExpanded`, `defaultExpanded`, `onExpandedChange`         | `data-expanded`, trigger `aria-expanded`, panel visibility                    | behavior state-machine tests for controlled/uncontrolled item and group-owned item       | package-covered | `Accordion.test.tsx`; Stately tests                       |
| Disabled       | group `isDisabled`, item `isDisabled`                             | disabled data attrs, disabled trigger, suppressed toggles                     | pointer and keyboard tests proving callback suppression                                  | route-covered   | route semantics spec; RAC/ARIA/Stately source             |
| Trigger        | pointer vs keyboard activation                                    | pointer toggles on press, keyboard toggles on press-start branch              | event-order tests for Space/Enter/click and disabled suppression                         | package-covered | Solidaria tests                                           |
| Header content | `AccordionItemHeader` with `AccordionItemTitle` plus ActionButton | action is adjacent to title trigger, not inside trigger                       | route DOM and interaction assertion                                                      | route-covered   | `Accordion.test.tsx`; route semantics spec                |
| Panel role     | omitted `role`, `role="region"`, labeling props                   | default role `group`, optional `region`, labelable ARIA props                 | semantic assertions at package and route level                                           | route-covered   | Components tests; route semantics spec                    |
| Panel hidden   | expanded/collapsed, SSR, browser find-in-page `beforematch`       | `aria-hidden`, server boolean `hidden`, hydrated `until-found`, CSS size vars | lifecycle test for SSR, collapsed, expanding, expanded, collapsing, beforematch, cleanup | package-covered | Solidaria tests                                           |
| Motion         | reduced motion media, animation completion                        | transition disabled under reduced motion; CSS vars settle `auto`              | browser/runtime test with reduced motion and animation-finish behavior                   | route-covered   | Solidaria tests; route visual spec; S2 panel style source |
| Direction      | RTL locale                                                        | chevron base rotation and expanded rotation                                   | route test under RTL provider with computed transform and exact pixels                   | route-covered   | route visual spec; S2 Disclosure source                   |
| Focus          | keyboard focus-visible modality                                   | trigger `data-focused`, `data-focus-visible`, and S2 outline                  | route test comparing data attrs and computed focus-ring styles                           | route-covered   | route contract spec; Solidaria test; S2 Disclosure source |
| IDs            | generated trigger/panel IDs                                       | unique IDs, `aria-controls`, `aria-labelledby`, collapsed hidden              | route test comparing hydrated ID/linkage contract without depending on ID strings        | route-covered   | route contract spec                                       |

## Source Branch Coverage

| Layer    | Upstream branch                                                    | Solid owner                                                | Class          | Observable                                                                            | Status           | Evidence                                                       |
| -------- | ------------------------------------------------------------------ | ---------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------- | ---------------- | -------------------------------------------------------------- |
| API      | `AccordionContext` exported and usable                             | `solid-spectrum/src/accordion`                             | public API     | documented context export resolves                                                    | covered          | `Accordion.test.tsx`                                           |
| API      | `AccordionItem/Header/Title/Panel` documented exports              | `solid-spectrum/src/index`, `solid-spectrum/src/accordion` | public API     | root and owner exports use S2 names and types                                         | covered          | `Accordion.test.tsx`                                           |
| API      | S2 prop surface `size='M'`, `density='regular'`, `isQuiet`, styles | `solid-spectrum/src/accordion`                             | public API     | props accepted with S2 defaults and passed to item context                            | covered          | `Accordion.test.tsx`; `Disclosure.test.tsx`                    |
| Styled   | Accordion root style macro                                         | `solid-spectrum/src/accordion`                             | visual/layout  | flex column root and S2 override-compatible height/style handling                     | partial          | source; route visual spec                                      |
| Styled   | Disclosure quiet/group border branches                             | `solid-spectrum/src/disclosure`                            | visual/layout  | top/bottom borders, last-child behavior, quiet border removal                         | computed-covered | route visual spec; source                                      |
| Styled   | Title `size` plus `density` min-height/font/padding matrix         | `solid-spectrum/src/disclosure`                            | visual/layout  | trigger height, spacing, font size, hover/pressed/focus backgrounds                   | computed-covered | route visual spec; package axis tests                          |
| Styled   | Header ActionButton context size shifts                            | `solid-spectrum/src/disclosure`                            | visual/context | nested ActionButton size is shifted by title size/density                             | computed-covered | route visual spec; `Accordion.test.tsx`; `Disclosure.test.tsx` |
| Styled   | Panel transition and inner padding                                 | `solid-spectrum/src/disclosure`                            | visual/runtime | `--disclosure-panel-height`, overflow clip, reduced-motion transition                 | computed-covered | route visual spec; reduced-motion route proof                  |
| State    | item `isExpanded`/`defaultExpanded` controlled state               | `solid-stately/src/disclosure`                             | state          | item expanded state, callbacks, controlled/uncontrolled updates                       | covered          | Stately tests                                                  |
| State    | group `allowsMultipleExpanded=false` single-key behavior           | `solid-stately/src/disclosure`                             | state          | toggling one key collapses previous key                                               | covered          | Stately tests                                                  |
| State    | over-expanded controlled/default set cleanup                       | `solid-stately/src/disclosure`                             | state          | multiple keys are trimmed to first key with React-equivalent timing                   | covered          | Stately tests                                                  |
| Headless | RAC DisclosureGroup root props                                     | `solidaria-components/src/Disclosure`                      | semantics      | global DOM props, `data-disabled`, no extra ARIA role on root                         | covered          | Solidaria tests                                                |
| Headless | ButtonContext trigger slot                                         | `solidaria-components/src/Disclosure`                      | semantics      | trigger receives merged button props and focus-visible data attrs without stale props | covered          | Components tests; route contract spec                          |
| A11y     | title heading wraps trigger                                        | `solid-spectrum/src/disclosure`                            | semantics      | heading level default `3`, button name from title, title auto-wrap                    | covered          | `Disclosure.test.tsx`                                          |
| A11y     | panel default role and labelable props                             | `solidaria-components/src/Disclosure`                      | semantics      | default role `group`, optional `region`, `aria-label*` passed through                 | covered          | Components tests                                               |
| A11y     | panel hidden props                                                 | `solidaria/src/disclosure`                                 | semantics      | `aria-hidden` and `hidden` semantics match React Aria                                 | covered          | Solidaria tests                                                |
| A11y     | panel SSR hidden branch                                            | `solidaria/src/disclosure`                                 | semantics      | collapsed server panels get boolean `hidden`; expanded panels omit `hidden`           | covered          | Solidaria SSR tests; React Aria source                         |
| Behavior | React Aria panel lifecycle                                         | `solidaria/src/disclosure`                                 | runtime        | width/height CSS vars, animation settle, RAF cleanup                                  | covered          | Solidaria tests                                                |
| Behavior | `beforematch` find-in-page expansion                               | `solidaria/src/disclosure`                                 | runtime        | collapsed panel can be revealed by browser find-in-page                               | covered          | Solidaria tests                                                |
| Behavior | keyboard vs pointer press timing                                   | `solidaria/src/disclosure`                                 | event order    | Space/Enter and pointer callback ordering match React Aria                            | covered          | Solidaria tests                                                |
| I18n     | RTL chevron rotation                                               | `solid-spectrum/src/disclosure`                            | visual/i18n    | chevron base rotation flips in RTL and expands to 90 degrees                          | route-covered    | route visual spec; exact RTL pair-diff                         |

## Transition Plan

- Static states:
  - primary docs example;
  - size `S/M/L/XL`;
  - density `compact/regular/spacious`;
  - quiet and disabled;
  - single-expanded and multiple-expanded group;
  - content header with adjacent ActionButton;
  - panel role `group` and `region`.
- Interaction timelines:
  - pointer click and keyboard Space/Enter toggle title trigger;
  - single-expansion mode collapses previous item;
  - disabled group and disabled item suppress expansion and callbacks;
  - controlled `expandedKeys` emits set updates without internal drift;
  - collapsed panel uses React Aria's `hidden="until-found"` lifecycle and
    opens from `beforematch`;
  - panel transition CSS variables move through collapsed, animating, expanded,
    and cleanup states.
- Overlay timelines:
  - not applicable; installed Accordion/Disclosure sources do not use overlays
    or portals.

## Runtime Semantics

- Native element/role decision:
  - APG expects title trigger as a button wrapped by a heading; S2 source uses
    DisclosureTitle/Header wrappers. Current Solid Spectrum trigger is not the
    S2 title/header split and Solidaria panel currently defaults to `region`
    instead of S2/RAC default `group`.
- Accessible name/description assertions:
  - trigger name from title text; panel role and labeling props must cover
    omitted `role`, `role="region"`, `aria-label`, and `aria-labelledby`.
- ID stability and collision checks:
  - button/panel `aria-controls` and `aria-labelledby` IDs exist in Solidaria;
    route proof now verifies generated trigger/panel IDs are present, unique,
    and linked after hydration. Multiple-instance collision proof remains
    pending.
- Modality rows:
  - pointer and keyboard toggles must follow installed React Aria source:
    pointer toggles on press, keyboard toggles on press start; optional
    arrow/Home/End behavior is not assumed unless installed source adds it.
- Event pipeline and consumer handler assertions:
  - Accordion-level `onExpandedChange` receives key sets; item-level
    `onExpandedChange` receives booleans. Route proof now covers controlled
    group-level key payloads/counts for single and multiple expansion plus
    disabled-trigger and header-action suppression; item-level boolean payloads
    remain package-covered.
- Solid idiom regression assertions:
  - context values and child laziness have source-level support in Solidaria;
    S2 wrapper context and route evidence are covered, while custom-root and
    ref-specific proof remain pending.
- Announcements:
  - none identified beyond button expanded state and optional panel role/name.
- Portal/provider/global cleanup:
  - portals not used; transition cleanup, RAF cancellation, and `beforematch`
    listener cleanup are the relevant lifecycle branches.
- SSR/hydration note:
  - Route proof now covers hydrated generated-ID stability and collapsed hidden
    linkage against React. Shared ARIA proof now covers React Aria's SSR hidden
    branch: collapsed server panels receive boolean `hidden`, expanded server
    panels omit `hidden`, and hydrated browser panels leave `hidden` to the
    runtime lifecycle.

## Evidence

```bash
vp run comparison:report:gaps
vp run comparison:report:exports
vp run guard:rac-export-gap
vp run check
vp test run packages/solid-stately/test/createDisclosureState.test.ts packages/solidaria/test/createDisclosure.test.tsx packages/solidaria-components/test/Disclosure.test.tsx packages/solid-spectrum/test/Disclosure.test.tsx packages/solid-spectrum/test/regression.test.tsx
vp test run packages/solidaria-components/test/Disclosure.test.tsx packages/solid-spectrum/test/Disclosure.test.tsx packages/solid-spectrum/test/Accordion.test.tsx packages/solid-spectrum/test/regression.test.tsx
vp run comparison:build
COMPARISON_PORT=4324 vp exec --filter @proyecto-viviana/comparison playwright test e2e/accordion-contract.spec.ts --reporter=line
vp test run packages/solid-spectrum/test/Disclosure.test.tsx packages/solid-spectrum/test/Accordion.test.tsx
COMPARISON_PORT=4324 vp exec --filter @proyecto-viviana/comparison playwright test e2e/accordion-visual.spec.ts --reporter=line
COMPARISON_PORT=4324 vp exec --filter @proyecto-viviana/comparison playwright test e2e/accordion-contract.spec.ts e2e/accordion-visual.spec.ts --reporter=line
vp test run packages/solidaria/test/createDisclosure.ssr.test.tsx
```

Results:

- Gap report refresh: official styled entries live on both sides is now `34`;
  missing/gap entries is `35`; official visual states tracked is `187`;
  current React/Solid visual evidence states is `50`; strict pair-diff states
  is `34`; blocked visual states is `34`; Accordion no longer appears in the
  missing/gap list.
- Export report refresh: package source now exports `AccordionContext`,
  `AccordionItem`, `AccordionItemHeader`, `AccordionItemTitle`, and
  `AccordionItemPanel`; there are `0` missing catalogue root exports and
  Accordion support exports are absent from the missing support list.
- RAC export-gap guard: no missing Solidaria Components RAC exports.
- Full check: passed.
- Source implementation: Solid Spectrum Accordion now delegates to the local S2
  Disclosure wrapper, exposes the documented subcomponents/context, and ports
  size/density/quiet context, title/header/panel structure, ActionButton header
  size shifting, and panel transition/inner padding styles.
- Shared parity implementation: 127 focused Stately/Solidaria/Components/Solid
  Spectrum tests pass for item/group state, over-expanded cleanup, group root
  semantics, panel default role, labelable props, `aria-hidden`,
  server boolean `hidden`, `hidden="until-found"`, CSS panel size variables,
  animation settle, `beforematch`, and keyboard/pointer press timing.
- Package-level S2 wrapper coverage: 86 focused Components/Spectrum tests pass
  for headless trigger DOM prop forwarding, S2 Disclosure title/header/panel
  structure, size/density/quiet axes, header ActionButton adjacency and shifted
  size, Accordion public exports, multiple expansion, and callback payloads.
- Comparison route coverage: fresh comparison build plus
  `e2e/accordion-contract.spec.ts` passes 6 focused Playwright tests for live
  React/Solid route mounts, official viewer controls, controlled expanded key
  updates, disabled triggers, header ActionButton behavior, trigger
  focus-visible data attrs and focus-ring styles, and generated trigger/panel
  ID linkage. The route also proves `onExpandedChange` callback counts and
  serialized key payloads for single/multiple expansion, header-action
  suppression, and disabled-trigger suppression.
- Computed and strict visual coverage: `e2e/accordion-visual.spec.ts` passes 5
  focused Playwright tests across default, compact small, quiet spacious large,
  disabled, multiple expansion, panel geometry, chevron asset geometry/path,
  header ActionButton geometry, reduced-motion transition removal, RTL
  provider direction/chevron rotation, and exact in-place root screenshot pairs
  with zero pixel tolerance. The source fix replaced the Solid hard-coded light
  disclosure border with the S2 `gray-200` token and replaced the generic
  stroked chevron with S2 size-specific filled chevron paths.

## Handoff

- Status: SSR-hidden partial. Package behavior, route behavior, route callback
  payloads/suppression, computed visual parity, strict pair-diff,
  reduced-motion, RTL, focus-visible, generated-ID linkage, hydrated hidden
  linkage, SSR hidden props, and refreshed report evidence are covered;
  forced-colors and multiple-instance ID collision proof remain.
- Next task: add multiple-instance ID collision proof, then forced-colors visual
  proof.
- Primary blockers:
  - `style-blocker`: package S2 style source, route semantics, computed visual
    parity, strict pair-diff, reduced-motion, and RTL are covered; focus-ring
    is covered; forced-colors visual branch remains.
  - `a11y-blocker`: shared and route semantics are covered; S2 title/header
    focus-visible, SSR hidden props, and hydrated ID linkage are covered;
    multi-instance semantics remain unproven at comparison level.
  - `behavior-blocker`: resolved for Accordion; shared state, package
    callbacks, route callback payloads, suppression, and transition behavior
    are covered.
