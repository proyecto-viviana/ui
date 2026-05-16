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

| Task                   | Status  | Evidence                                                                                        | Blocker or next action |
| ---------------------- | ------- | ----------------------------------------------------------------------------------------------- | ---------------------- |
| 0 Research             | done    | Live S2 Accordion page, S2 MCP page, React Aria Disclosure docs, APG Accordion pattern, sources | None                   |
| 1 Baseline             | done    | Current comparison/export/RAC reports captured below                                            | None                   |
| 2 Route harness        | pending | Accordion remains `react=tracked solid=missing`; no focused route-control spec exists           | route-blocker          |
| 3 Source map/API       | partial | Primary upstream and Solid files identified; full branch ledger still pending                   | source-blocker         |
| 4 Cross-layer audit    | pending | S2 uses Disclosure plus DisclosureGroup; Solid currently aliases older Disclosure API           | source-blocker         |
| 5 Transitions          | pending | Expand/collapse, controlled/uncontrolled, single/multiple expansion, and panel hiding need rows | behavior-blocker       |
| 6 State                | pending | DisclosureGroup expansion state needs source mapping                                            | behavior-blocker       |
| 7 ARIA hooks           | pending | Button, heading, aria-expanded, aria-controls, panel role, focus, and keyboard proof needed     | a11y-blocker           |
| 8 Headless             | pending | Solidaria DisclosureGroup exists but must be audited against RAC DisclosureGroup                | source-blocker         |
| 9 Styled S2            | pending | S2 size/density/quiet styles and Accordion subcomponent names are not ported                    | style-blocker          |
| 10 Runtime lifecycle   | pending | Runtime semantics, IDs, reduced motion, disabled suppression, and cleanup unproven              | a11y-blocker           |
| 11 Harness integrity   | pending | No focused Accordion visual/runtime harness yet                                                 | route-blocker          |
| 12 Comparison evidence | pending | Styled default is blocked in visual-state report                                                | evidence-blocker       |
| 13 Acceptance          | pending | Current status is pre-pass only                                                                 | evidence-blocker       |

## Agent Workflow

No subagents used in this pre-pass. Coordinator owned Task 0/1 research and
baseline capture.

| Task | Agent role  | Context pack                              | Docs/skills/tools                          | Allowed writes  | Required output                         | Status |
| ---- | ----------- | ----------------------------------------- | ------------------------------------------ | --------------- | --------------------------------------- | ------ |
| 0-1  | coordinator | Accordion docs, installed source, reports | react-spectrum-s2 skill, S2/React Aria MCP | validation note | pre-pass blockers and baseline evidence | done   |

| Agent role  | Files read                                                                                                                                                                                                                | Files changed | Evidence added                  | Commands run                                                                                       | Blockers                         | Next owner     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------- | -------------- |
| coordinator | S2 Accordion docs, React Aria Disclosure docs, APG Accordion pattern, `@react-spectrum/s2/src/Accordion.tsx`, `packages/solid-spectrum/src/accordion/index.tsx`, current reports, component playbook and acceptance gates | this note     | research, docs parity, baseline | `vp run comparison:report:gaps`; `vp run comparison:report:exports`; `vp run guard:rac-export-gap` | route/source/style/a11y blockers | Accordion pass |

## Acceptance Gate Checklist

These gates are intentionally incomplete. Accordion is `pre-pass` until each
gate has complete rows and focused evidence.

## Gate Outcome Summary

| Gate                                     | Outcome | Evidence                                                      | Blockers/owner   |
| ---------------------------------------- | ------- | ------------------------------------------------------------- | ---------------- |
| Official Docs And Viewer Parity          | partial | Official page and viewer controls inventoried                 | route-blocker    |
| External Authority And Standards         | partial | React Aria Disclosure docs and APG Accordion pattern checked  | a11y-blocker     |
| Upstream React Source Parity             | partial | S2 source and Solid owner file identified                     | source-blocker   |
| Solid Idiomatic Implementation           | partial | Current Solid export aliases older Disclosure names and props | idiom-blocker    |
| Accessibility And I18n                   | partial | APG/RAC obligations recorded; no focused assertions yet       | a11y-blocker     |
| Behavior State Machine                   | partial | Expand/collapse and group expansion obligations recorded      | behavior-blocker |
| Style Source-To-Computed Parity          | partial | S2 style axes identified; Solid S2 style path not ported      | style-blocker    |
| React-Vs-Solid Comparison Harness Parity | partial | Report shows Accordion blocked/missing                        | route-blocker    |
| Evidence And Handoff                     | partial | Baseline reports captured                                     | evidence-blocker |

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
- [ ] Source disagreements recorded with chosen authority: pending full source
      audit.
- [ ] External obligations mapped to route/source/behavior/a11y/style rows or
      explicit gaps: started below, incomplete until Task 4/5.

### 3. Upstream React Source Parity

- [x] Upstream files identified for every relevant layer:
      `@react-spectrum/s2/src/Accordion.tsx`; S2 imports Disclosure wrappers and
      `react-aria-components/DisclosureGroup`.
- [x] Solid owner files identified or gaps recorded:
      `packages/solid-spectrum/src/accordion/index.tsx` currently re-exports
      older local Disclosure names.
- [ ] Public props/defaults/slots/contexts/refs/exports mapped: partial table
      below.
- [ ] DOM, ARIA, state, event, effect, cleanup, style, geometry, and
      cross-component branches mapped: pending.
- [ ] Source branch ledger covers every user-observable upstream branch:
      pending.
- [ ] Every `matched` or `ported-differently` row has direct evidence: pending.
- [ ] Remaining `gap` or `deferred-gap` rows have owners and are not counted as
      accepted: blockers recorded.

### 4. Solid Idiomatic Implementation

- [ ] Dynamic props, context values, and derived values remain reactive:
      pending.
- [ ] No prop destructuring/spread snapshots live Solid accessors: pending.
- [ ] Children remain lazy across provider/context boundaries: pending.
- [ ] Render props/custom roots receive live state where applicable: pending.
- [ ] Refs use Solid semantics: pending.
- [ ] Effects, observers, timers, listeners, and subscriptions have cleanup:
      pending.
- [x] Solid-specific deviations preserve documented public behavior: current
      deviation does not preserve S2 public subcomponent names and props.
- [ ] Tests cover relevant reactive update risks: pending.

### 5. Accessibility And I18n

- [ ] Native element, role, computed accessible name, description, and value:
      pending.
- [ ] ARIA references, generated IDs, ordering, removal timing, and
      multiple-instance collision checks: pending.
- [ ] Keyboard model, focus order, focus-visible, focus return, and
      focus-not-obscured behavior: APG obligations recorded, proof pending.
- [ ] Disabled/read-only/required/invalid/inert/hidden semantics: disabled and
      hidden panel behavior pending.
- [ ] Form labels/help/error/validation/hidden-input/reset/submit behavior:
      not applicable unless content examples include nested forms; source audit
      must confirm.
- [ ] Live regions, loading/selection/drag-drop announcements, and cleanup
      timing: likely not applicable; source audit must confirm.
- [ ] Forced colors, reduced motion, contrast-sensitive states, target size,
      and screen-reader-only affordances: reduced-motion panel transition and
      forced-colors style proof pending.
- [ ] Locale, direction, formatting, calendar/hour-cycle, and messages:
      direction/style inheritance pending.
- [ ] Axe or similar smoke result, plus manual semantic assertions: pending.

### 6. Behavior State Machine

- [ ] State/input -> trigger -> expected React -> expected Solid -> evidence
      rows completed: pending.
- [ ] Pointer, keyboard, touch, virtual click, blur, Escape, cancellation,
      outside press, disabled/read-only suppression: pending.
- [ ] Controlled/uncontrolled, defaults, reset, submit, async/loading/empty,
      collection navigation: expansion state pending.
- [ ] Event ordering, callback payloads/counts/suppression, propagation, and
      cancellation: `onExpandedChange` pending.
- [ ] Overlay/portal/scroll-lock/hiding/focus/timer/observer/listener cleanup:
      likely not applicable except panel transition cleanup; source audit must
      confirm.
- [ ] Before/trigger/immediate/transient/settled/cleanup transition evidence:
      pending.

### 7. Style Source-To-Computed Parity

- [x] Upstream S2 style declarations and owner branches identified:
      Accordion root flex-column style and S2 Disclosure subpart styles.
- [ ] Solid style/token path uses S2-compatible generated classes: current
      Solid implementation uses older Tailwind-style Disclosure classes.
- [ ] Comparison app CSS does not patch component behavior/style/geometry:
      pending route audit.
- [ ] Size/density/variant/staticColor/orientation/placement/field-state and
      provider/form style axes mapped: S2 `size`, `density`, and `isQuiet`
      pending computed proof.
- [ ] Computed-style/class/attribute/geometry/CSS-variable assertions cover
      rendering-affecting branches: pending.
- [ ] Forced-colors/reduced-motion/focus-ring/icon/image/avatar/slot/portal
      geometry branches covered: pending.
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
- Source disagreements and chosen authority: installed S2 source is authority
  for component API and behavior; APG informs accessibility risk rows.
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

| Layer               | Upstream files                                                                  | Solid files                                                                                           | Status  |
| ------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------- |
| State               | `react-aria-components/DisclosureGroup` plus RAC Disclosure state               | `solidaria-components/src/Disclosure.tsx`, `solidaria/src/disclosure/createDisclosureGroup.ts`        | pending |
| ARIA hooks          | RAC Disclosure/DisclosureGroup semantics through S2 Disclosure                  | `solidaria/src/disclosure`, `solidaria-components/src/Disclosure.tsx`                                 | pending |
| Headless components | S2 Disclosure wrappers and RAC DisclosureGroup                                  | `solidaria-components/src/Disclosure.tsx`                                                             | pending |
| Styled S2           | `@react-spectrum/s2/src/Accordion.tsx`, `@react-spectrum/s2/src/Disclosure.tsx` | `packages/solid-spectrum/src/accordion/index.tsx`, `packages/solid-spectrum/src/disclosure/index.tsx` | gap     |

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
  - S2 exports explicit Accordion subcomponents. Current Solid public file
    exports `AccordionHeader`, `AccordionPanel`, and `DisclosureTitle` aliases,
    which does not match the documented S2 names.
- Contexts/providers:
  - S2 exports `AccordionContext` and provides `DisclosureContext` with
    `size`, `isQuiet`, and `density`.
- Refs/imperative methods:
  - S2 uses DOM refs through `useDOMRef`; Solid ref parity pending.
- Unsupported or intentionally different branches:
  - None accepted. Current Solid aliasing is a gap, not an accepted deviation.

## Cross-Layer Audit

| Layer               | Matched | Ported differently | Not applicable | Gaps                                        |
| ------------------- | ------- | ------------------ | -------------- | ------------------------------------------- |
| State               | pending |                    |                | group expansion source audit                |
| ARIA hooks          | pending |                    |                | heading/button/panel semantics proof        |
| Headless components | pending |                    |                | subcomponent naming and slot/context parity |
| Styled S2           |         |                    |                | S2 size/density/quiet/style path missing    |

- Solid idioms checked:
  - child/provider laziness: pending.
  - dynamic prop/context getters: pending.
  - render-prop/custom root liveness: pending.
  - refs and cleanup ownership: pending.

## Interaction Dependency Map

| Subpart        | Upstream input                                    | Observable output                                       | Minimal proof                                         | Status  | Evidence               |
| -------------- | ------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------- | ------- | ---------------------- |
| Root group     | `size`, `density`, `isQuiet`                      | DisclosureContext subpart styles change                 | computed style/class contract for title/panel spacing | planned | S2 source              |
| Group state    | `allowsMultipleExpanded`                          | one vs multiple expanded items                          | click/key behavior test comparing React/Solid         | planned | S2 docs/source         |
| Item state     | `expandedKeys`/`defaultExpandedKeys`/`isExpanded` | `aria-expanded`, panel visibility, callback payloads    | behavior state-machine test                           | planned | S2 docs/source         |
| Header content | `AccordionItemHeader` with `ActionButton`         | action is adjacent to title trigger, not inside trigger | route DOM and interaction assertion                   | planned | S2 docs                |
| Panel role     | `role` prop                                       | panel role `group` or `region` plus labeling            | semantic assertion                                    | planned | S2 docs/source and APG |

## Source Branch Coverage

| Layer    | Upstream branch                               | Solid owner                         | Class          | Observable                                                      | Status  | Evidence       |
| -------- | --------------------------------------------- | ----------------------------------- | -------------- | --------------------------------------------------------------- | ------- | -------------- |
| Styled   | Accordion root style                          | `src/accordion`, `src/disclosure`   | visual/layout  | flex column root and S2 override-compatible styles              | gap     | S2 source      |
| Styled   | Context provides `size`, `density`, `isQuiet` | `src/accordion`, `src/disclosure`   | visual/context | title/panel spacing and quiet styles                            | gap     | S2 source      |
| API      | Accordion subcomponent exports                | `src/accordion/index.tsx`           | public API     | documented import names resolve                                 | gap     | export report  |
| Behavior | Group controlled/uncontrolled expansion       | `solidaria-components`, `solidaria` | state          | expanded key set and callbacks match React                      | pending | S2 docs        |
| A11y     | title heading and trigger button              | `solidaria-components`, `solidaria` | semantics      | heading level, button name, `aria-expanded`, `aria-controls`    | pending | APG/S2 source  |
| A11y     | panel role and hidden state                   | `solidaria-components`, `solidaria` | semantics      | hidden collapsed panel, role default `group`, optional `region` | pending | S2 docs/source |

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
  - controlled `expandedKeys` emits set updates without internal drift.
- Overlay timelines:
  - not applicable unless full source audit finds popover/portal use.

## Runtime Semantics

- Native element/role decision:
  - APG expects title trigger as a button wrapped by a heading; S2 source uses
    DisclosureTitle/Header wrappers. Exact DOM pending source audit.
- Accessible name/description assertions:
  - trigger name from title text; panel role and labeling props pending.
- ID stability and collision checks:
  - button/panel `aria-controls` and `aria-labelledby` IDs pending.
- Modality rows:
  - pointer and keyboard toggles pending; optional arrow/Home/End behavior must
    follow installed source rather than APG assumption.
- Event pipeline and consumer handler assertions:
  - Accordion-level `onExpandedChange` and item-level `onExpandedChange`
    payloads pending.
- Solid idiom regression assertions:
  - context values and child laziness pending.
- Announcements:
  - none identified beyond button expanded state; source audit must confirm.
- Portal/provider/global cleanup:
  - likely not applicable; transition cleanup pending.
- SSR/hydration note:
  - generated ID behavior pending.

## Evidence

```bash
vp run comparison:report:gaps
vp run comparison:report:exports
vp run guard:rac-export-gap
vp run check
```

Results:

- Gap report: Accordion remains a missing/gap official entry,
  `react=tracked solid=missing`; styled default visual state is blocked.
- Export report: no missing catalogue root export, but Accordion support exports
  are missing from Solid's S2 public value exports.
- RAC export-gap guard: no missing Solidaria Components RAC exports.
- Full check: passed.

## Handoff

- Status: pre-pass only.
- Next task: Task 2 Route Harness after source owners are confirmed enough to
  decide whether to implement package exports first or route fallback first.
- Primary blockers:
  - `route-blocker`: no Accordion comparison route or focused route-control
    spec.
  - `source-blocker`: full Disclosure/DisclosureGroup source ledger pending.
  - `style-blocker`: current Solid Accordion is not an S2-compatible styled
    port.
  - `a11y-blocker`: APG/RAC/S2 semantic behavior unproven.
  - `behavior-blocker`: controlled/uncontrolled expansion and callback behavior
    unproven.
