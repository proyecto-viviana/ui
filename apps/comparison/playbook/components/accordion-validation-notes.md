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

| Task                   | Status  | Evidence                                                                                             | Blocker or next action |
| ---------------------- | ------- | ---------------------------------------------------------------------------------------------------- | ---------------------- |
| 0 Research             | done    | Live S2 Accordion page, S2 MCP page, React Aria Disclosure docs, APG Accordion pattern, sources      | None                   |
| 1 Baseline             | done    | Current comparison/export/RAC reports captured below                                                 | None                   |
| 2 Route harness        | pending | Accordion remains `react=tracked solid=missing`; no focused route-control spec exists                | route-blocker          |
| 3 Source map/API       | done    | S2 Accordion/Disclosure, RAC Disclosure, ARIA hook, Stately, Solidaria, and Solid Spectrum mapped    | None                   |
| 4 Cross-layer audit    | partial | Branch ledger below identifies API, semantics, animation, state, and styled S2 gaps                  | source-blocker         |
| 5 Transitions          | partial | Shared hook now covers panel CSS vars, animation settle, hidden delay, and `beforematch`             | style-blocker          |
| 6 State                | done    | Solid Stately item/group/over-expanded branches covered by focused tests                             | None                   |
| 7 ARIA hooks           | done    | Shared hook now matches panel role, hidden, `aria-hidden`, `beforematch`, and press timing           | None                   |
| 8 Headless             | partial | Default panel role, labelable panel props, and group root ARIA drift fixed; trigger/focus proof left | source-blocker         |
| 9 Styled S2            | pending | S2 size/density/quiet styles and Accordion subcomponent names are not ported                         | style-blocker          |
| 10 Runtime lifecycle   | partial | Shared panel CSS vars, animation cleanup, and `until-found` ported; S2 reduced-motion styles remain  | style-blocker          |
| 11 Harness integrity   | pending | No focused Accordion visual/runtime harness yet                                                      | route-blocker          |
| 12 Comparison evidence | pending | Styled default is blocked in visual-state report                                                     | evidence-blocker       |
| 13 Acceptance          | pending | Current status is pre-pass only                                                                      | evidence-blocker       |

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

These gates are intentionally incomplete. Accordion is `pre-pass` until each
gate has complete rows and focused evidence.

## Gate Outcome Summary

| Gate                                     | Outcome | Evidence                                                     | Blockers/owner   |
| ---------------------------------------- | ------- | ------------------------------------------------------------ | ---------------- |
| Official Docs And Viewer Parity          | partial | Official page and viewer controls inventoried                | route-blocker    |
| External Authority And Standards         | partial | React Aria Disclosure docs and APG Accordion pattern checked | a11y-blocker     |
| Upstream React Source Parity             | partial | Source branch ledger populated; implementation still missing | source-blocker   |
| Solid Idiomatic Implementation           | partial | Lazy children mostly preserved; public API/style/ARIA drift  | idiom-blocker    |
| Accessibility And I18n                   | partial | Shared RAC/ARIA deltas ported; S2 title/i18n assertions left | a11y-blocker     |
| Behavior State Machine                   | partial | Shared state and transition branches have focused tests      | route-blocker    |
| Style Source-To-Computed Parity          | partial | S2 style axes mapped; Solid S2 style path not ported         | style-blocker    |
| React-Vs-Solid Comparison Harness Parity | partial | Report shows Accordion blocked/missing                       | route-blocker    |
| Evidence And Handoff                     | partial | Baseline reports captured                                    | evidence-blocker |

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
- [ ] Comparison route default matches official example or deviation recorded:
      route is missing.
- [ ] Side-panel controls match official viewer controls and selection
      semantics: route is missing.
- [ ] Route tests assert visible defaults/options and mounted DOM changes:
      no focused Accordion route test exists.

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
      `packages/solid-spectrum/src/accordion/index.tsx` currently re-exports
      older local Disclosure names.
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

- [ ] Dynamic props, context values, and derived values remain reactive:
      Solidaria generally uses accessors/context, but S2 styled props are not
      implemented.
- [ ] No prop destructuring/spread snapshots live Solid accessors: source audit
      found existing split/merge patterns; final implementation must preserve
      them.
- [ ] Children remain lazy across provider/context boundaries: Solidaria
      Disclosure has explicit laziness safeguards; route/S2 wrapper proof still
      missing.
- [ ] Render props/custom roots receive live state where applicable: pending.
- [ ] Refs use Solid semantics: pending.
- [ ] Effects, observers, timers, listeners, and subscriptions have cleanup:
      Solid ARIA hook lacks React Aria's animation, RAF, `beforematch`, and
      animation-finish cleanup branches.
- [ ] Solid-specific deviations preserve documented public behavior: current
      deviation does not preserve S2 public subcomponent names and props.
- [ ] Tests cover relevant reactive update risks: state basics exist; S2 wrapper
      reactivity and transition lifecycle parity tests are missing.

### 5. Accessibility And I18n

- [ ] Native element, role, computed accessible name, description, and value:
      pending.
- [ ] ARIA references, generated IDs, ordering, removal timing, and
      multiple-instance collision checks: pending.
- [ ] Keyboard model, focus order, focus-visible, focus return, and
      focus-not-obscured behavior: APG obligations recorded, proof pending.
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
      forced-colors style proof pending.
- [ ] Locale, direction, formatting, calendar/hour-cycle, and messages: S2 title
      chevron has RTL rotation logic; Solid Spectrum wrapper has no matching
      branch.
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
- [ ] Event ordering, callback payloads/counts/suppression, propagation, and
      cancellation: shared callback tests exist; Accordion route-level callback
      payload assertions still pending.
- [ ] Overlay/portal/scroll-lock/hiding/focus/timer/observer/listener cleanup:
      likely not applicable except panel transition cleanup; source audit must
      confirm.
- [x] Before/trigger/immediate/transient/settled/cleanup transition evidence:
      shared hook tests cover initial hidden state, expanding/collapsing CSS
      variables, animation settle, delayed hidden, and `beforematch`.

### 7. Style Source-To-Computed Parity

- [x] Upstream S2 style declarations and owner branches identified:
      Accordion root flex-column style and S2 Disclosure subpart styles.
- [ ] Solid style/token path uses S2-compatible generated classes: current
      Solid implementation uses older Tailwind-style Disclosure classes.
- [ ] Comparison app CSS does not patch component behavior/style/geometry:
      pending route audit.
- [ ] Size/density/variant/staticColor/orientation/placement/field-state and
      provider/form style axes mapped: S2 `size`, `density`, and `isQuiet`
      mapped; computed proof pending after implementation.
- [ ] Computed-style/class/attribute/geometry/CSS-variable assertions cover
      rendering-affecting branches: pending.
- [ ] Forced-colors/reduced-motion/focus-ring/icon/image/avatar/slot/portal
      geometry branches covered: reduced-motion and focus-ring branches mapped;
      proof pending.
- [ ] Official viewer canvas/background/scale/width/direction/theme conditions
      represented or recorded as gaps: route missing.
- [ ] Visual deviations classified: pending.

### 8. React-Vs-Solid Comparison Harness Parity

- [ ] React fixture imports current upstream component and official composition:
      route missing.
- [ ] Solid fixture imports package public API: route missing.
- [ ] Both fixtures receive the same props and environment settings: route
      missing.
- [ ] Focused route tests prove controls update mounted React and Solid DOM:
      missing.
- [ ] Computed style, a11y, geometry, runtime, or pair-diff evidence covers
      rendering-affecting branches: missing.
- [ ] Harness stability is proven: missing.

### 9. Evidence And Handoff

- [ ] Focused package tests: existing regression snapshot only; not sufficient.
- [ ] Focused Playwright/runtime tests: none.
- [x] Comparison reports refreshed when status/evidence changed: baseline
      captured.
- [x] `vp run check`: passed after formatting the pre-pass note.
- [x] Final status is `accepted`, `partial`, or `pre-pass`: pre-pass.
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

| Docs item         | Official setting/example                                                                | Route/control      | Status    | Evidence                       |
| ----------------- | --------------------------------------------------------------------------------------- | ------------------ | --------- | ------------------------------ |
| Primary example   | Two AccordionItems; width `220`; titles "Personal Information" and "Billing Address"    | missing            | route-gap | S2 docs and live page          |
| Viewer `size`     | `S`, `M`, `L`, `XL`; default `M`                                                        | missing            | route-gap | Live page viewer               |
| Viewer `density`  | `compact`, `regular`, `spacious`; default `regular`                                     | missing            | route-gap | Live page viewer               |
| Viewer booleans   | `isQuiet`, `isDisabled`, `allowsMultipleExpanded`; unchecked by default                 | missing            | route-gap | Live page viewer               |
| Expanding example | Controlled `expandedKeys` initialized to `settings`; `onExpandedChange` updates the set | missing            | route-gap | S2 docs                        |
| Content example   | `AccordionItemHeader` with `AccordionItemTitle` plus nested `ActionButton`              | missing            | route-gap | S2 docs                        |
| API subcomponents | `AccordionItem`, `AccordionItemHeader`, `AccordionItemTitle`, `AccordionItemPanel`      | missing/mismatched | port-gap  | export report and Solid source |
| Panel role        | `AccordionItemPanel` role default `group`, supports `region` and ARIA labeling props    | missing            | port-gap  | S2 docs/source                 |

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
  - missing React S2 value exports: `80`;
  - missing Accordion-related support exports include `AccordionContext`,
    `AccordionItem`, `AccordionItemHeader`, `AccordionItemPanel`, and
    `AccordionItemTitle`.
- `guard:rac-export-gap` result:
  - missing Solidaria Components RAC exports: `0`.
- Improvement target:
  - move Accordion from tracked gap to live route evidence only after the
    package exports, S2-compatible structure/styles, behavior semantics, and
    route controls are implemented and proven.

## Source Map And Public Contract

| Layer              | Upstream files                                                                      | Solid files                                                                                                | Status  |
| ------------------ | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------- |
| State              | `@react-stately/disclosure/src/useDisclosureState.ts`, `useDisclosureGroupState.ts` | `solid-stately/src/disclosure/createDisclosureState.ts`                                                    | covered |
| ARIA hooks         | `@react-aria/disclosure/src/useDisclosure.ts`                                       | `solidaria/src/disclosure/createDisclosure.ts`                                                             | covered |
| RAC/headless       | `react-aria-components/src/Disclosure.tsx`                                          | `solidaria-components/src/Disclosure.tsx`, `solidaria/src/disclosure/createDisclosureGroup.ts`             | partial |
| Styled S2          | `@react-spectrum/s2/src/Accordion.tsx`, `@react-spectrum/s2/src/Disclosure.tsx`     | `packages/solid-spectrum/src/accordion/index.tsx`, `packages/solid-spectrum/src/disclosure/index.tsx`      | gap     |
| Public package API | `@react-spectrum/s2/src/Accordion.tsx`, S2 package root/subpath exports             | `packages/solid-spectrum/src/index.ts`, `packages/solid-spectrum/src/accordion/index.tsx`, package exports | gap     |

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
  - Solid root exports map some aliases to documented S2 names, but the
    `src/accordion` owner still exposes older `AccordionHeader`,
    `AccordionPanel`, `DisclosureTitle`, `AccordionSize`, and
    `AccordionVariant` concepts. The export report still flags missing support
    exports, and the package has no S2-style `./Accordion` subpath.
- Contexts/providers:
  - S2 exports `AccordionContext` and provides `DisclosureContext` with
    `size`, `isQuiet`, and `density`.
  - Current Solid Spectrum Accordion does not expose an `AccordionContext` and
    does not provide the S2 Disclosure context contract for size/density/quiet
    to item subparts.
- Refs/imperative methods:
  - S2 uses DOM refs through `useDOMRef` on Accordion, Disclosure, title,
    header, and panel wrappers. Solid ref parity must be proven through the
    public wrappers after S2 names are ported.
- Unsupported or intentionally different branches:
  - None accepted. Current Solid aliasing and Tailwind-style Disclosure styling
    remain gaps, not accepted deviations. The prior default panel role and
    panel lifecycle gaps are now ported in the shared layers.

## Cross-Layer Audit

| Layer               | Matched                                                            | Ported differently                                 | Not applicable | Gaps                                                        |
| ------------------- | ------------------------------------------------------------------ | -------------------------------------------------- | -------------- | ----------------------------------------------------------- |
| State               | controlled/uncontrolled item and group tests, over-expanded trim   | Solid uses `queueMicrotask` for over-expanded trim |                | route-level callback pair evidence pending                  |
| ARIA hooks          | ids, `aria-expanded`, `aria-controls`, disabled, hidden lifecycle  |                                                    |                | SSR hidden prop and route-level pair evidence pending       |
| Headless components | lazy children, primitives, data attrs, panel role, labelable props | native Solid context/accessor implementation       |                | trigger slot/focus assertions pending                       |
| Styled S2           |                                                                    |                                                    |                | S2 size/density/quiet/header/title/panel style path missing |

- Solid idioms checked:
  - child/provider laziness: Solidaria Disclosure keeps children lazy through
    providers; S2 wrapper proof still pending.
  - dynamic prop/context getters: Solidaria and Solid Stately mostly use
    accessors; S2 styled context is not implemented.
  - render-prop/custom root liveness: Solidaria `useRenderProps` exists, but
    Accordion route and S2 wrapper evidence are missing.
  - refs and cleanup ownership: refs exist in Solidaria; shared Disclosure now
    cleans up RAF state and handles animation/`beforematch` lifecycle.

## Interaction Dependency Map

| Subpart        | Upstream input                                                    | Observable output                                                | Parity proof                                                                        | Status          | Evidence                          |
| -------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------- | --------------------------------- |
| Root group     | `styles`, `UNSAFE_style`, `UNSAFE_className`, ref                 | flex column root, style override support, DOM ref                | package test plus computed route style/class assertion                              | planned         | S2 Accordion source               |
| Root context   | `size`, `density`, `isQuiet`                                      | Disclosure title/header/panel style changes                      | pair route control test for all viewer values and source-level style assertions     | planned         | S2 Accordion/Disclosure           |
| Group state    | `allowsMultipleExpanded`, `expandedKeys`, `defaultExpandedKeys`   | one vs multiple expanded items, controlled key set callbacks     | state tests plus route interaction comparing React/Solid callback payloads          | package-covered | Stately tests                     |
| Item state     | `id`, `isExpanded`, `defaultExpanded`, `onExpandedChange`         | `data-expanded`, trigger `aria-expanded`, panel visibility       | behavior state-machine tests for controlled/uncontrolled item and group-owned item  | planned         | RAC/ARIA source                   |
| Disabled       | group `isDisabled`, item `isDisabled`                             | disabled data attrs, disabled trigger, suppressed toggles        | pointer and keyboard tests proving callback suppression                             | planned         | RAC/ARIA/Stately source           |
| Trigger        | pointer vs keyboard activation                                    | pointer toggles on press, keyboard toggles on press-start branch | event-order tests for Space/Enter/click and disabled suppression                    | package-covered | Solidaria tests                   |
| Header content | `AccordionItemHeader` with `AccordionItemTitle` plus ActionButton | action is adjacent to title trigger, not inside trigger          | route DOM and interaction assertion                                                 | planned         | S2 docs/source                    |
| Panel role     | omitted `role`, `role="region"`, labeling props                   | default role `group`, optional `region`, labelable ARIA props    | semantic assertions at package and route level                                      | package-covered | Solidaria Components tests        |
| Panel hidden   | expanded/collapsed, SSR, browser find-in-page `beforematch`       | `aria-hidden`, `hidden="until-found"`, CSS size vars             | lifecycle test for collapsed, expanding, expanded, collapsing, beforematch, cleanup | package-covered | Solidaria tests                   |
| Motion         | reduced motion media, animation completion                        | transition disabled under reduced motion; CSS vars settle `auto` | browser/runtime test with reduced motion and animation-finish behavior              | partial         | Solidaria tests; S2 style pending |
| Direction      | RTL locale                                                        | chevron base rotation and expanded rotation                      | route test under RTL provider or equivalent computed transform                      | planned         | S2 Disclosure source              |

## Source Branch Coverage

| Layer    | Upstream branch                                                    | Solid owner                                                | Class          | Observable                                                              | Status  | Evidence                 |
| -------- | ------------------------------------------------------------------ | ---------------------------------------------------------- | -------------- | ----------------------------------------------------------------------- | ------- | ------------------------ |
| API      | `AccordionContext` exported and usable                             | `solid-spectrum/src/accordion`                             | public API     | documented context export resolves                                      | gap     | export report, S2 source |
| API      | `AccordionItem/Header/Title/Panel` documented exports              | `solid-spectrum/src/index`, `solid-spectrum/src/accordion` | public API     | root and owner exports use S2 names and types                           | gap     | export report, source    |
| API      | S2 prop surface `size='M'`, `density='regular'`, `isQuiet`, styles | `solid-spectrum/src/accordion`                             | public API     | props accepted with S2 defaults and passed to item context              | gap     | S2 source                |
| Styled   | Accordion root style macro                                         | `solid-spectrum/src/accordion`                             | visual/layout  | flex column root and S2 override-compatible height/style handling       | gap     | S2 source                |
| Styled   | Disclosure quiet/group border branches                             | `solid-spectrum/src/disclosure`                            | visual/layout  | top/bottom borders, last-child behavior, quiet border removal           | gap     | S2 Disclosure source     |
| Styled   | Title `size` plus `density` min-height/font/padding matrix         | `solid-spectrum/src/disclosure`                            | visual/layout  | trigger height, spacing, font size, hover/pressed/focus backgrounds     | gap     | S2 Disclosure source     |
| Styled   | Header ActionButton context size shifts                            | `solid-spectrum/src/disclosure`                            | visual/context | nested ActionButton size is shifted by title size/density               | gap     | S2 Disclosure source     |
| Styled   | Panel transition and inner padding                                 | `solid-spectrum/src/disclosure`                            | visual/runtime | `--disclosure-panel-height`, overflow clip, reduced-motion transition   | gap     | S2/ARIA source           |
| State    | item `isExpanded`/`defaultExpanded` controlled state               | `solid-stately/src/disclosure`                             | state          | item expanded state, callbacks, controlled/uncontrolled updates         | covered | Stately tests            |
| State    | group `allowsMultipleExpanded=false` single-key behavior           | `solid-stately/src/disclosure`                             | state          | toggling one key collapses previous key                                 | covered | Stately tests            |
| State    | over-expanded controlled/default set cleanup                       | `solid-stately/src/disclosure`                             | state          | multiple keys are trimmed to first key with React-equivalent timing     | covered | Stately tests            |
| Headless | RAC DisclosureGroup root props                                     | `solidaria-components/src/Disclosure`                      | semantics      | global DOM props, `data-disabled`, no extra ARIA role on root           | covered | Solidaria tests          |
| Headless | ButtonContext trigger slot                                         | `solidaria-components/src/Disclosure`                      | semantics      | trigger receives merged button props and data attrs without stale props | partial | source                   |
| A11y     | title heading wraps trigger                                        | `solid-spectrum/src/disclosure`                            | semantics      | heading level default `3`, button name from title, title auto-wrap      | gap     | S2 Disclosure source     |
| A11y     | panel default role and labelable props                             | `solidaria-components/src/Disclosure`                      | semantics      | default role `group`, optional `region`, `aria-label*` passed through   | covered | Components tests         |
| A11y     | panel hidden props                                                 | `solidaria/src/disclosure`                                 | semantics      | `aria-hidden` and `hidden` semantics match React Aria                   | covered | Solidaria tests          |
| Behavior | React Aria panel lifecycle                                         | `solidaria/src/disclosure`                                 | runtime        | width/height CSS vars, animation settle, RAF cleanup                    | covered | Solidaria tests          |
| Behavior | `beforematch` find-in-page expansion                               | `solidaria/src/disclosure`                                 | runtime        | collapsed panel can be revealed by browser find-in-page                 | covered | Solidaria tests          |
| Behavior | keyboard vs pointer press timing                                   | `solidaria/src/disclosure`                                 | event order    | Space/Enter and pointer callback ordering match React Aria              | covered | Solidaria tests          |
| I18n     | RTL chevron rotation                                               | `solid-spectrum/src/disclosure`                            | visual/i18n    | chevron base rotation flips in RTL and expands to 90 degrees            | gap     | S2 Disclosure source     |

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
    multiple-instance collision and hydration proof pending.
- Modality rows:
  - pointer and keyboard toggles must follow installed React Aria source:
    pointer toggles on press, keyboard toggles on press start; optional
    arrow/Home/End behavior is not assumed unless installed source adds it.
- Event pipeline and consumer handler assertions:
  - Accordion-level `onExpandedChange` receives key sets; item-level
    `onExpandedChange` receives booleans. Controlled, uncontrolled, disabled,
    and no-op repeated-state paths need callback-count proof.
- Solid idiom regression assertions:
  - context values and child laziness have source-level support in Solidaria;
    S2 wrapper context and route evidence pending.
- Announcements:
  - none identified beyond button expanded state and optional panel role/name.
- Portal/provider/global cleanup:
  - portals not used; transition cleanup, RAF cancellation, and `beforematch`
    listener cleanup are the relevant lifecycle branches.
- SSR/hydration note:
  - React Aria sets SSR `hidden` based on expansion; Solid must prove matching
    initial hidden semantics and generated ID stability.

## Evidence

```bash
vp run comparison:report:gaps
vp run comparison:report:exports
vp run guard:rac-export-gap
vp run check
vp test run packages/solid-stately/test/createDisclosureState.test.ts packages/solidaria/test/createDisclosure.test.tsx packages/solidaria-components/test/Disclosure.test.tsx packages/solid-spectrum/test/Disclosure.test.tsx packages/solid-spectrum/test/regression.test.tsx
```

Results:

- Gap report: Accordion remains a missing/gap official entry,
  `react=tracked solid=missing`; styled default visual state is blocked.
- Export report: no missing catalogue root export, but Accordion support exports
  are missing from Solid's S2 public value exports.
- RAC export-gap guard: no missing Solidaria Components RAC exports.
- Full check: passed.
- Source audit: S2 Accordion delegates to S2 Disclosure and RAC
  DisclosureGroup; current Solid Spectrum Accordion aliases the older local
  Disclosure implementation and still does not port S2 public API, title/header
  structure, or Spectrum style branches.
- Shared parity implementation: 124 focused Stately/Solidaria/Components/Solid
  Spectrum tests pass for item/group state, over-expanded cleanup, group root
  semantics, panel default role, labelable props, `aria-hidden`,
  `hidden="until-found"`, CSS panel size variables, animation settle,
  `beforematch`, and keyboard/pointer press timing.

## Handoff

- Status: pre-pass only.
- Next task: implement from the bottom up before route acceptance:
  1. expose S2-compatible Accordion/Disclosure wrappers and public exports;
  2. add styled S2 package-level parity tests for size/density/quiet/title/header
     branches;
  3. add the comparison route, controls, and React-vs-Solid evidence.
- Primary blockers:
  - `route-blocker`: no Accordion comparison route or focused route-control
    spec.
  - `source-blocker`: shared Solidaria/Solid Stately owners now match the
    mapped S2/RAC contract; Solid Spectrum public wrappers still diverge.
  - `style-blocker`: current Solid Accordion is not an S2-compatible styled
    port.
  - `a11y-blocker`: shared semantics are covered; S2 title/header/i18n and
    route semantics remain unproven.
  - `behavior-blocker`: shared state and transition behavior are covered;
    Accordion route callback payloads remain unproven.
