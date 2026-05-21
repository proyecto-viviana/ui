# Accordion Validation Notes

Date: 2026-05-21
Status: accepted

## Target

- Component: Accordion
- Slug: accordion
- Family or direct subcomponents: AccordionItem, AccordionItemHeader,
  AccordionItemTitle, AccordionItemPanel; upstream S2 Disclosure/DisclosureGroup
  composition; ActionButton in the documented content example
- Pass goal: accepted current-gate validation covering route, export, source,
  behavior, accessibility, style, idiom, and evidence parity
- Date: 2026-05-16

## Task Status

| Task                   | Status | Evidence                                                                                                                                           | Blocker or next action |
| ---------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 0 Research             | done   | Live S2 Accordion page, S2 MCP page, React Aria Disclosure docs, APG Accordion pattern, sources                                                    | None                   |
| 1 Baseline             | done   | Current comparison/export/RAC reports captured below                                                                                               | None                   |
| 2 Route harness        | done   | Comparison route mounts React and Solid Accordion fixtures with focused route-control spec                                                         | None                   |
| 3 Source map/API       | done   | S2 Accordion/Disclosure, RAC Disclosure, ARIA hook, Stately, Solidaria, and Solid Spectrum mapped                                                  | None                   |
| 4 Cross-layer audit    | done   | Branch ledger now separates covered shared, package-level S2 wrapper, route harness, forced-colors, and ref/a11y work                              | None                   |
| 5 Transitions          | done   | Shared hook now covers panel CSS vars, animation settle, hidden delay, `beforematch`, and reduced-motion route behavior                            | None                   |
| 6 State                | done   | Solid Stately item/group/over-expanded branches covered by focused tests                                                                           | None                   |
| 7 ARIA hooks           | done   | Shared hook now matches panel role, hidden, `aria-hidden`, `beforematch`, and press timing                                                         | None                   |
| 8 Headless             | done   | Default panel role, labelable panel props, group root ARIA drift, and trigger focus-visible covered                                                | None                   |
| 9 Styled S2            | done   | Package wrapper, route fixture, tokenized border, Adobe chevron geometry, forced-colors, and exact pixels match S2                                 | None                   |
| 10 Runtime lifecycle   | done   | Shared panel lifecycle, route interaction semantics, and reduced-motion browser proof are covered                                                  | None                   |
| 11 Harness integrity   | done   | `e2e/accordion-contract.spec.ts` proves live route controls and interaction semantics                                                              | None                   |
| 12 Comparison evidence | done   | Visual-state matrix now marks route-control, computed visual, and strict pair-diff contracts asserted                                              | None                   |
| 13 Acceptance          | done   | Route, computed-style, strict visual, reduced-motion, RTL, forced-colors, focus, IDs, callbacks, SSR, refs, axe, and multi-instance IDs are proven | None                   |

## Agent Workflow

No subagents used in this pass. Coordinator owns the research, implementation,
validation, and source audit.

| Task | Agent role  | Context pack                              | Docs/skills/tools                          | Allowed writes  | Required output                          | Status |
| ---- | ----------- | ----------------------------------------- | ------------------------------------------ | --------------- | ---------------------------------------- | ------ |
| 0-1  | coordinator | Accordion docs, installed source, reports | react-spectrum-s2 skill, S2/React Aria MCP | validation note | baseline evidence and acceptance closure | done   |
| 3-8  | coordinator | S2/RAC/ARIA/Stately/Solid sources         | react-spectrum-s2 and react-aria skills    | validation note | source branch ledger and parity gaps     | done   |

| Agent role  | Files read                                                                                                                                                                                                                                                                                                                | Files changed | Evidence added                                | Commands run                                                                                       | Blockers | Next owner     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------- | -------------- |
| coordinator | S2 Accordion docs, React Aria Disclosure docs, APG Accordion pattern, `@react-spectrum/s2/src/Accordion.tsx`, `@react-spectrum/s2/src/Disclosure.tsx`, RAC Disclosure, React Aria/Stately Disclosure, Solidaria/Solid Spectrum Disclosure and Accordion sources, current reports, component playbook and acceptance gates | this note     | research, docs parity, baseline, source audit | `vp run comparison:report:gaps`; `vp run comparison:report:exports`; `vp run guard:rac-export-gap` | resolved | Accordion pass |

## Acceptance Gate Checklist

All Accordion gates for this pass are accepted. Remaining rows outside
Accordion are catalogue-wide support gaps tracked in the global reports.

## Gate Outcome Summary

| Gate                                     | Outcome | Evidence                                                                                                         | Blockers/owner |
| ---------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------- | -------------- |
| Official Docs And Viewer Parity          | done    | Official page, viewer controls, and route fixture semantics covered                                              | None           |
| External Authority And Standards         | done    | React Aria Disclosure docs and APG Accordion pattern checked                                                     | None           |
| Upstream React Source Parity             | done    | Shared layers, package S2 wrapper source, route control proof, refs, and render props are covered                | None           |
| Solid Idiomatic Implementation           | done    | Lazy children, reactive props/context, refs, render props, and public API/style/ARIA parity are covered          | None           |
| Accessibility And I18n                   | done    | Shared RAC/ARIA deltas, SSR hidden props, focus-visible, multi-instance IDs, forced-colors, axe, and RTL covered | None           |
| Behavior State Machine                   | done    | Shared state, transitions, route callback payloads, and suppression covered                                      | None           |
| Style Source-To-Computed Parity          | done    | Computed, focus-ring, reduced-motion, forced-colors, RTL, and exact pair-diff contracts pass                     | None           |
| React-Vs-Solid Comparison Harness Parity | done    | Route, computed visual, and exact pair-diff contracts pass for live fixtures                                     | None           |
| Evidence And Handoff                     | done    | Baseline, refreshed reports, package, check, build, and route specs captured                                     | None           |

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
- [x] Chrome/web.dev/MDN/platform explainers used only for browser behavior,
      test strategy, or risk discovery: not needed beyond installed source,
      Playwright media emulation, and APG/React Aria obligations.
- [x] Independent/famous blog posts used only as risk discovery unless tied to
      normative source, installed source, or reproducible behavior: none found
      and none needed.
- [x] Source disagreements recorded with chosen authority: installed S2/RAC
      source is authoritative for runtime behavior; APG is used only for
      accessibility risk discovery where it is stricter or optional.
- [x] External obligations mapped to route/source/behavior/a11y/style rows or
      explicit gaps: branch ledger below records the closed route, style,
      semantics, state, lifecycle, ref, and a11y rows.

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
- [x] Every `matched` or `ported-differently` row has direct evidence:
      package, route, visual, axe, SSR, and report proof listed below.
- [x] Remaining `gap` or `deferred-gap` rows have owners and are not counted as
      accepted: Accordion-specific gaps are closed; catalogue-wide missing
      support exports remain in the global export report.

### 4. Solid Idiomatic Implementation

- [x] Dynamic props, context values, and derived values remain reactive:
      Solidaria generally uses accessors/context, and route controls prove S2
      size, density, quiet, disabled, and multiple-expansion updates.
- [x] No prop destructuring/spread snapshots live Solid accessors: source audit
      and route control tests cover reactive size, density, quiet, disabled,
      multiple-expansion, and callback state.
- [x] Children remain lazy across provider/context boundaries: Solidaria
      Disclosure has explicit laziness safeguards, and route/package wrappers
      exercise the public S2 structure.
- [x] Render props/custom roots receive live state where applicable: headless
      Disclosure render-prop class/style/children update from live state;
      custom roots are not part of the S2 Accordion/Disclosure API.
- [x] Refs use Solid semantics: headless group/root/trigger/panel refs and S2
      Accordion/Header/Title/Panel public wrapper refs are covered.
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
- [x] Multiple-instance ID collision checks: package proof renders multiple
      Accordion instances with colliding item keys and verifies unique
      trigger/panel IDs plus intact `aria-controls`/`aria-labelledby` linkage.
- [x] Disabled/read-only/required/invalid/inert/hidden semantics: shared
      Disclosure tests cover disabled suppression, `aria-hidden`,
      `hidden="until-found"`, and panel CSS variable visibility states.
- [x] Form labels/help/error/validation/hidden-input/reset/submit behavior:
      not applicable to Accordion/Disclosure itself; nested form fields are
      consumer content and not owned by the component source.
- [x] Live regions, loading/selection/drag-drop announcements, and cleanup
      timing: not applicable; installed Accordion/Disclosure sources do not
      create announcements, loading state, selection collections, or drag/drop.
- [x] Forced colors, reduced motion, contrast-sensitive states, target size,
      and screen-reader-only affordances: reduced-motion panel transition,
      focus-ring style proof, and forced-colors default/disabled computed
      contracts plus strict pair-diff screenshots are covered.
- [x] Locale, direction, formatting, calendar/hour-cycle, and messages: S2 title
      chevron LTR/RTL geometry, direction, rotation, and exact route pixels are
      covered.
- [x] Axe or similar smoke result, plus manual semantic assertions: headless
      DisclosureGroup and S2 Accordion axe smoke pass, with manual route and
      package semantic assertions listed below.

### 6. Behavior State Machine

- [x] State/input -> trigger -> expected React -> expected Solid -> evidence
      rows completed for shared Stately/Solidaria branches and route pair
      evidence.
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
- [x] Overlay/portal/scroll-lock/hiding/focus/timer/observer/listener cleanup:
      overlays, portals, and scroll lock are not used; panel transition cleanup,
      RAF cancellation, and `beforematch` listener cleanup are covered.
- [x] Before/trigger/immediate/transient/settled/cleanup transition evidence:
      shared hook tests cover initial hidden state, expanding/collapsing CSS
      variables, animation settle, delayed hidden, and `beforematch`.

### 7. Style Source-To-Computed Parity

- [x] Upstream S2 style declarations and owner branches identified:
      Accordion root flex-column style and S2 Disclosure subpart styles.
- [x] Solid style/token path uses S2-compatible generated classes: Solid
      Accordion/Disclosure use generated S2 style classes and tokens.
- [x] Comparison app CSS does not patch component behavior/style/geometry:
      route CSS only lays out the comparison row and example panel copy;
      component root styles are proven by computed contracts and exact pair
      diffs.
- [x] Size/density/variant/staticColor/orientation/placement/field-state and
      provider/form style axes mapped: S2 `size`, `density`, and `isQuiet`
      are covered by computed proof and exact route screenshots.
- [x] Computed-style/class/attribute/geometry/CSS-variable assertions cover
      rendering-affecting branches: `accordion-visual.spec.ts` compares root
      flex/width, item borders/colors, title typography/spacing, chevron
      geometry/path, panel padding, disabled styling, quiet styling, and header
      ActionButton geometry across the viewer axes.
- [x] Forced-colors/reduced-motion/focus-ring/icon/image/avatar/slot/portal
      geometry branches covered: reduced-motion, focus-ring, forced-colors,
      and RTL branches are covered; icon/image/avatar/portal branches are not
      additional Accordion obligations beyond the chevron and header action
      coverage already asserted.
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
- [x] `vp run check`: passed after final Accordion acceptance updates.
- [x] Final status is `accepted`, `partial`, or `pre-pass`: accepted.
- [x] Remaining gaps listed by gate and owner: no Accordion-specific blockers
      remain.
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
| Expanding example | Controlled `expandedKeys` initialized by the fixture; `onExpandedChange` updates state | route fixture   | covered | `accordion-contract.spec.ts`   |
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
- Current refresh after final checklist proof:
  - official styled entries live on both sides: `34`;
  - missing/gap entries: `35`;
  - official visual states tracked: `190`;
  - current visual evidence states: `51`;
  - strict pair-diff states: `35`;
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
| RAC/headless       | `react-aria-components/src/Disclosure.tsx`                                          | `solidaria-components/src/Disclosure.tsx`, `solidaria/src/disclosure/createDisclosureGroup.ts`             | covered |
| Styled S2          | `@react-spectrum/s2/src/Accordion.tsx`, `@react-spectrum/s2/src/Disclosure.tsx`     | `packages/solid-spectrum/src/accordion/index.tsx`, `packages/solid-spectrum/src/disclosure/index.tsx`      | covered |
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

| Layer               | Matched                                                                                                                                                          | Ported differently                                       | Not applicable | Gaps |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | -------------- | ---- |
| State               | controlled/uncontrolled item and group tests, over-expanded trim, route callback payloads and suppression                                                        | Solid uses `queueMicrotask` for over-expanded trim       |                | None |
| ARIA hooks          | ids, `aria-expanded`, `aria-controls`, disabled, hidden lifecycle, SSR hidden prop, hydrated route linkage, multi-instance ID uniqueness                         |                                                          |                | None |
| Headless components | lazy children, primitives, data attrs, panel role, labelable props, trigger focus-visible attrs, render props, refs, axe smoke                                   | native Solid context/accessor implementation             | custom roots   | None |
| Styled S2           | S2 size/density/quiet/header/title/panel source, route semantics, focus-ring, computed visual contract, reduced-motion, forced-colors, RTL, and strict pair-diff | Solid uses generated S2 style classes and local wrappers |                | None |

- Solid idioms checked:
  - child/provider laziness: Solidaria Disclosure keeps children lazy through
    providers; route and package wrappers now exercise the public S2 structure.
  - dynamic prop/context getters: Solidaria and Solid Stately mostly use
    accessors; route controls now prove S2 styled prop reactivity for the
    viewer axes.
  - render-prop/custom root liveness: Solidaria `useRenderProps` is covered by
    live root/panel render-prop tests; custom roots are not part of the S2
    Accordion/Disclosure API.
  - refs and cleanup ownership: headless and S2 wrapper refs are covered;
    shared Disclosure cleans up RAF state and handles animation/`beforematch`
    lifecycle.

## Interaction Dependency Map

| Subpart        | Upstream input                                                    | Observable output                                                             | Parity proof                                                                             | Status          | Evidence                                                  |
| -------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------- | --------------------------------------------------------- |
| Root group     | `styles`, `UNSAFE_style`, `UNSAFE_className`, ref                 | flex column root, style override support, DOM ref                             | package test plus computed route style/class assertion                                   | covered         | `Accordion.test.tsx`; route semantics/visual specs        |
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
| Styled   | Accordion root style macro                                         | `solid-spectrum/src/accordion`                             | visual/layout  | flex column root and S2 override-compatible height/style handling                     | covered          | source; route visual spec; ref test                            |
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
| A11y     | generated IDs across multiple instances                            | `solid-spectrum/src/accordion`, `solidaria/src/disclosure` | semantics      | duplicate item keys do not collide trigger/panel IDs across Accordion instances       | covered          | `Accordion.test.tsx`                                           |
| Behavior | React Aria panel lifecycle                                         | `solidaria/src/disclosure`                                 | runtime        | width/height CSS vars, animation settle, RAF cleanup                                  | covered          | Solidaria tests                                                |
| Behavior | `beforematch` find-in-page expansion                               | `solidaria/src/disclosure`                                 | runtime        | collapsed panel can be revealed by browser find-in-page                               | covered          | Solidaria tests                                                |
| Behavior | keyboard vs pointer press timing                                   | `solidaria/src/disclosure`                                 | event order    | Space/Enter and pointer callback ordering match React Aria                            | covered          | Solidaria tests                                                |
| I18n     | RTL chevron rotation                                               | `solid-spectrum/src/disclosure`                            | visual/i18n    | chevron base rotation flips in RTL and expands to 90 degrees                          | route-covered    | route visual spec; exact RTL pair-diff                         |
| Styled   | forced-colors media branch                                         | `solid-spectrum/src/disclosure`                            | visual/a11y    | default and disabled title colors, item borders, and header action colors match S2    | route-covered    | route visual spec; exact forced-colors pair-diff               |

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
    and linked after hydration. Package proof now verifies duplicate item keys
    do not collide trigger/panel IDs across multiple Accordion instances.
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
    S2 wrapper context, render-prop liveness, public refs, and route evidence
    are covered. Custom roots are not part of the S2 Accordion/Disclosure API.
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
vp test run packages/solid-stately/test/createDisclosureState.test.ts packages/solidaria/test/createDisclosure.test.tsx packages/solidaria/test/createDisclosure.ssr.test.tsx packages/solidaria-components/test/Disclosure.test.tsx packages/solid-spectrum/test/Disclosure.test.tsx packages/solid-spectrum/test/Accordion.test.tsx packages/solid-spectrum/test/regression.test.tsx
vp run comparison:build
COMPARISON_PORT=4324 vp exec --filter @proyecto-viviana/comparison playwright test e2e/accordion-contract.spec.ts --reporter=line
vp test run packages/solid-spectrum/test/Disclosure.test.tsx packages/solid-spectrum/test/Accordion.test.tsx
vp test run packages/solidaria-components/test/Disclosure.test.tsx packages/solid-spectrum/test/Accordion.test.tsx packages/solid-spectrum/test/Disclosure.test.tsx
COMPARISON_PORT=4324 vp exec --filter @proyecto-viviana/comparison playwright test e2e/accordion-visual.spec.ts --reporter=line
COMPARISON_PORT=4324 vp exec --filter @proyecto-viviana/comparison playwright test e2e/accordion-contract.spec.ts e2e/accordion-visual.spec.ts --reporter=line
vp test run packages/solidaria/test/createDisclosure.ssr.test.tsx
```

Results:

- Gap report refresh: official styled entries live on both sides is now `34`;
  missing/gap entries is `35`; official visual states tracked is `190`;
  current React/Solid visual evidence states is `51`; strict pair-diff states
  is `35`; blocked visual states is `34`; Accordion no longer appears in the
  missing/gap list.
- Export report refresh: package source now exports `AccordionContext`,
  `AccordionItem`, `AccordionItemHeader`, `AccordionItemTitle`, and
  `AccordionItemPanel`; there are `0` missing catalogue root exports and
  Accordion support exports are absent from the missing support list.
- RAC export-gap guard: no missing Solidaria Components RAC exports.
- Full check: passed.
- Final focused package suite: 7 files and 138 tests pass, including updated
  Accordion/Disclosure regression snapshots for the S2 chevron and focus-ring
  DOM.
- Source implementation: Solid Spectrum Accordion now delegates to the local S2
  Disclosure wrapper, exposes the documented subcomponents/context, and ports
  size/density/quiet context, title/header/panel structure, ActionButton header
  size shifting, and panel transition/inner padding styles.
- Shared parity implementation: the focused Stately/Solidaria/Components/Solid
  Spectrum tests pass for item/group state, over-expanded cleanup, group root
  semantics, panel default role, labelable props, `aria-hidden`,
  server boolean `hidden`, `hidden="until-found"`, CSS panel size variables,
  animation settle, `beforematch`, keyboard/pointer press timing, live render
  props, refs, and axe smoke.
- Package-level S2 wrapper coverage: the focused Components/Spectrum tests pass
  for headless trigger DOM prop forwarding, S2 Disclosure title/header/panel
  structure, size/density/quiet axes, header ActionButton adjacency and shifted
  size, Accordion public exports, multiple expansion, callback payloads, public
  wrapper refs, axe smoke, and multi-instance generated-ID uniqueness.
- Comparison route coverage: fresh comparison build plus
  `e2e/accordion-contract.spec.ts` passes 6 focused Playwright tests for live
  React/Solid route mounts, official viewer controls, controlled expanded key
  updates, disabled triggers, header ActionButton behavior, trigger
  focus-visible data attrs and focus-ring styles, and generated trigger/panel
  ID linkage. The route also proves `onExpandedChange` callback counts and
  serialized key payloads for single/multiple expansion, header-action
  suppression, and disabled-trigger suppression.
- Computed and strict visual coverage: `e2e/accordion-visual.spec.ts` passes 6
  focused Playwright tests across default, compact small, quiet spacious large,
  disabled, multiple expansion, panel geometry, chevron asset geometry/path,
  header ActionButton geometry, reduced-motion transition removal, RTL
  provider direction/chevron rotation, forced-colors default/disabled computed
  styles, forced-colors disabled color separation, and exact in-place root
  screenshot pairs with zero pixel tolerance. The source fix replaced the Solid
  hard-coded light disclosure border with the S2 `gray-200` token and replaced
  the generic stroked chevron with S2 size-specific filled chevron paths.

## Handoff

- Status: accepted for this Accordion pass. Package behavior, route behavior,
  route callback payloads/suppression, computed visual parity, strict
  pair-diff, reduced-motion, forced-colors, RTL, focus-visible, generated-ID
  linkage, multi-instance ID uniqueness, hydrated hidden linkage, SSR hidden
  props, refs, render props, axe smoke, and refreshed report evidence are
  covered.
- Next task: move to the next component checklist.
- Remaining blocker status:
  - `idiom-blocker`: resolved for Accordion; public wrapper refs and headless
    render props are covered, and custom roots are not an S2 Accordion API.
  - `a11y-blocker`: resolved for Accordion; semantic assertions,
    forced-colors, RTL, focus-visible, ID linkage, SSR hidden props, and axe
    smoke are covered.
  - `style-blocker`: resolved for Accordion; package S2 style source, route
    semantics, computed visual parity, strict pair-diff, reduced-motion,
    forced-colors, RTL, and focus-ring are covered.
  - `behavior-blocker`: resolved for Accordion; shared state, package
    callbacks, route callback payloads, suppression, and transition behavior
    are covered.

## Current-Gate Normalization Refresh (2026-05-21)

- README normalization: Accordion is listed with the current-gate normalized
  components, and this note has explicit `Status: accepted`.
- S2 docs refresh: MCP Accordion page still exposes the same primary example,
  expanding example, content example, and API surface recorded above.
- Focused package proof:
  `vp test run packages/solid-stately/test/createDisclosureState.test.ts packages/solidaria/test/createDisclosure.test.tsx packages/solidaria/test/createDisclosure.ssr.test.tsx packages/solidaria-components/test/Disclosure.test.tsx packages/solid-spectrum/test/Disclosure.test.tsx packages/solid-spectrum/test/Accordion.test.tsx`
  passed 6 files and 88 tests.
- Focused browser proof:
  `vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/accordion-contract.spec.ts e2e/accordion-visual.spec.ts --reporter=line`
  passed 12 tests.
- Catalogue and guard proof: `vp run comparison:report:gaps`,
  `vp run comparison:report:exports`, `vp run guard:rac-parity`, and
  `vp run guard:rac-export-gap` passed with no Accordion-specific gap and no
  RAC export gap.
- Static proof: `vp run check` and `git diff --check` passed.
- Non-Accordion caveat: the broader
  `packages/solid-spectrum/test/regression.test.tsx` snapshot suite currently
  fails in unrelated Slider, Menu, ActionMenu, Tooltip, Breadcrumbs,
  DateField, and Meter cases, so it is not counted as Accordion evidence in
  this normalization-only pass.
