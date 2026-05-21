# Text Validation Notes

Date: 2026-05-20
Status: accepted

Text has now been normalized against the current support-component gates. The
original pre-pass note is superseded by this closeout, which covers the S2
`Content.tsx` source model rather than a catalogue route: `Text`, `Heading`,
`Header`, `Content`, `Footer`, `Keyboard`, their contexts, public root exports,
Menu subpath exports, and consumers that provide text slot context.

## Current-Gate Closeout

- Scope: support primitives from React Spectrum S2 `Content.tsx`, root package
  exports, Menu subpath content exports, Menu/ActionMenu section slot
  contexts, Button/Badge/StatusLight/Skeleton text composition consumers, and
  focused unit/browser evidence.
- Sources rechecked: React Spectrum S2 package root exports, S2 `Content.tsx`,
  S2 `Menu.tsx` heading context usage, Solid Text/Heading/Keyboard/Menu
  sources, Button-family pre-pass evidence, and existing Skeleton/ActionMenu
  tests.
- Result: accepted for Text support primitives. Solid now exposes the S2
  support surface: `Text`, `Heading`, `Header`, `Content`, `Footer`,
  `Keyboard`, their contexts, `children`, `level` for Heading, `isHidden`,
  `id`, microdata props, `role` where S2 context injects it, `slot`, `styles`,
  `UNSAFE_className`, `UNSAFE_style`, `data-*` harness attributes, and refs.
  The prior Text compatibility aliases `variant`, `size`, legacy `class`, raw
  `style`, arbitrary event props, root `StyledKeyboard`, and root
  `HeadingLevel`/`StyledKeyboardProps` exports are no longer part of the styled
  S2 API.

## Acceptance Gate Checklist

- [x] Public API: root exports match S2 support values for `Text`, `Heading`,
      `Header`, `Content`, `Footer`, `Keyboard`, and their contexts.
- [x] Styled public type: support props follow S2 `ContentProps`/`HeadingProps`
      semantics and remove local Text variant/size/class aliases and the
      root `StyledKeyboard` compatibility export.
- [x] DOM/accessibility contract: primitives render `span`, heading tag,
      `header`, `div`, `footer`, and `kbd` shapes; `Text` always marks
      `data-rsp-slot="text"`; `Keyboard` sets `dir="ltr"`; hidden primitives
      unmount.
- [x] Style source-to-computed: style comes from S2 context `styles` and unsafe
      escape hatches rather than standalone default typography classes.
- [x] Harness contract: no standalone official Text catalogue route exists;
      behavior is validated through support-unit tests and Menu/ActionMenu,
      Badge, Button-family, and Skeleton consumers.
- [x] Evidence handoff: focused tests, Solid package build, export/gap
      reports, README status, and this note are refreshed for the current gate.

## Agent Workflow

| Step                    | Status | Evidence                                                                |
| ----------------------- | ------ | ----------------------------------------------------------------------- |
| Research                | done   | S2 `Content.tsx`, root exports, Menu heading context source             |
| Baseline and source map | done   | Text pre-pass note plus current Solid source/tests                      |
| Implementation          | done   | Text/Heading/Header/Content/Footer/Keyboard support primitive rewrite   |
| Harness                 | done   | Focused Text test plus impacted ActionMenu/Menu/Badge/Skeleton coverage |
| Verification            | done   | Focused unit slice, package build, gap/export reports                   |
| Handoff                 | done   | README normalization status, current-gate closeout note, commit         |

## Behavior State Machine

- Stable states: visible primitive; `isHidden` unmounted primitive; default
  Heading level `3`; explicit Heading level; named `slot`; `slot={null}` opt
  out through the shared context helper.
- Context states: each context can provide S2 support props; local unsafe class
  merges with context unsafe class; local unsafe style overrides matching
  context style keys; refs from context and local props are both assigned.
- Composition states: Menu and ActionMenu section headings receive
  `role="presentation"` from S2 heading context and S2 section heading styles;
  Menu item labels/descriptions receive Text slot styles; Badge/Button-family
  consumers still use `TextContext`; Skeleton wraps Text children and applies
  inert loading state.
- Interaction states: support primitives own no direct interaction. Raw DOM
  event compatibility props are not part of the styled S2 prop boundary and are
  filtered from the root primitives.
- Cleanup contract: Text support primitives own no timers, portals, observers,
  subscriptions, generated IDs, or async lifecycle.

## Accessibility And I18n

- `Text` renders a native `span` with S2 `data-rsp-slot="text"`.
- `Heading` renders `h{level}` and preserves the S2 Menu context
  `role="presentation"` branch used for section headings.
- `Header`, `Content`, `Footer`, and `Keyboard` render semantic/native
  elements directly; `Keyboard` keeps `dir="ltr"` like React Aria Keyboard.
- Support primitives do not generate labels, format locale-sensitive data, or
  transform bidirectional text. They inherit locale and accessibility semantics
  from the parent component that composes them.

## Style Source-To-Computed

- React S2 `Content.tsx` sets `className={UNSAFE_className + styles}` and
  `style={UNSAFE_style}` for all support primitives. It does not attach
  standalone typography defaults to Text, Heading, or Keyboard.
- Solid now follows the same observable contract. S2 style macro classes are
  supplied by parent contexts such as Menu/ActionMenu, Badge, Button family,
  StatusLight, and Skeleton consumers.
- The old standalone classes (`text-primary-100`, `text-base`, heading size
  classes, and keyboard pill styling) are no longer emitted by the support
  primitives themselves.

## Source Packet

| Source                   | Files or docs                                    | Finding                                                                                                           |
| ------------------------ | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| S2 docs MCP              | `Text` docs lookup                               | There is no standalone S2 Text docs page; source and exports are the contract.                                    |
| React Spectrum S2 source | `@react-spectrum/s2/src/Content.tsx`             | S2 exports Heading/Header/Content/Footer/Text/Keyboard primitives and contexts from one support source.           |
| React Spectrum S2 source | `@react-spectrum/s2/src/Menu.tsx`                | Menu injects Heading `role="presentation"` and section/text slot styles through support contexts.                 |
| Solid source after pass  | `packages/solid-spectrum/src/text/*`             | Solid matches the S2 support prop boundary, element shapes, contexts, skeleton text branch, and root export set.  |
| Solid consumers          | Menu, ActionMenu, Badge, Button family, Skeleton | Consumers compose Text support primitives through context rather than relying on Text standalone visual defaults. |
| Comparison reports       | gap/export scripts                               | Root value exports moved to `158`, missing S2 value exports to `53`, and extra Solid value exports to `3`.        |

## Official Docs And Viewer Parity

| Contract item           | Official source expectation                                             | Solid route/control                               | Status  | Evidence                               |
| ----------------------- | ----------------------------------------------------------------------- | ------------------------------------------------- | ------- | -------------------------------------- |
| Standalone docs         | no official S2 Text catalogue/docs page                                 | no standalone comparison route                    | matched | S2 docs lookup and catalogue report    |
| Root exports            | support primitives and contexts exported from package                   | root exports include S2 support values/contexts   | matched | export report and build                |
| Menu subpath            | Menu exports support `Content`, `Header`, `Heading`, `Keyboard`, `Text` | Solid Menu subpath exports the same support set   | matched | source audit and build                 |
| `Text`                  | unstyled text slot primitive with `data-rsp-slot`                       | unit test root DOM contract                       | matched | `Text.test.tsx`                        |
| `Heading`               | default level, explicit level, context role/styles                      | unit and ActionMenu tests                         | matched | `Text.test.tsx`, `ActionMenu.test.tsx` |
| `Header/Content/Footer` | native content elements with S2 style props                             | unit test root DOM contract                       | matched | `Text.test.tsx`                        |
| `Keyboard`              | native keyboard shortcut primitive, `dir="ltr"`                         | unit test root DOM contract and Menu shortcut use | matched | `Text.test.tsx`, ActionMenu slice      |
| Skeleton text           | inert skeleton text wrapper                                             | existing Skeleton Text tests                      | matched | `Skeleton.test.tsx`                    |

## Baseline

- Before this pass, Text was explicitly pre-pass only. Button-family evidence
  covered only nested button text context, not standalone support primitive
  acceptance.
- Solid Text exposed legacy local aliases: `variant`, `size`, legacy `class`,
  raw style/event pass-through, default typography classes, and a root
  `StyledKeyboard` compatibility export.
- Solid root exports were missing S2 `Content`, `ContentContext`, `Footer`, and
  `FooterContext`, and still exposed `StyledKeyboard`.
- Current reports after current-gate normalization list:
  - official entries in comparison app: `69`;
  - live entries: `47`;
  - missing/gap entries: `22`;
  - visual states tracked: `266`;
  - visual evidence states: `76`;
  - strict pair-diff states: `46`;
  - blocked visual states: `22`;
  - `solid-spectrum` public value exports: `158`;
  - missing S2 value exports: `53`;
  - extra Solid value exports: `3`.

## Source Map And Public Contract

| Layer               | Upstream files                        | Solid files                                           | Status  |
| ------------------- | ------------------------------------- | ----------------------------------------------------- | ------- |
| State               | none                                  | none                                                  | n/a     |
| ARIA hooks          | React Aria support primitives         | native elements plus Solid context helpers            | matched |
| Headless components | RAC Heading/Header/Text/Keyboard      | native support elements and Skeleton helper           | matched |
| Styled S2           | `@react-spectrum/s2/src/Content.tsx`  | `packages/solid-spectrum/src/text/*`                  | matched |
| Consumer routes     | Menu, ActionMenu, Badge, Button slots | Solid Menu/ActionMenu/Badge/Button/Skeleton consumers | matched |

- Public props/defaults:
  - Shared support props: `children`, `styles`, `UNSAFE_className`,
    `UNSAFE_style`, `isHidden`, `id`, microdata props, `role`, `slot`,
    `data-*`, and `ref`.
  - `Heading` adds `level?: number` with default level `3`.
  - `Text` always emits `data-rsp-slot="text"` and preserves Skeleton text
    inert styling.
  - `Keyboard` emits `dir="ltr"`.
  - The styled S2 surface intentionally omits Text `variant`, Text `size`,
    legacy `class`, raw style, arbitrary events, `StyledKeyboard`, and extra
    root type aliases.
- Contexts/providers:
  - `TextContext`, `HeadingContext`, `HeaderContext`, `ContentContext`,
    `FooterContext`, and `KeyboardContext` are exported and consumed through
    the shared S2 slotted context helper.
  - Menu and ActionMenu section providers supply heading/header/text styles and
    the S2 presentation role branch.
- Refs/imperative behavior:
  - Ref merging includes context/local refs. Text also merges the Skeleton
    inert ref.

## Source Branch Coverage

| Layer   | Upstream branch                | Solid owner                 | Class           | Observable                                          | Status  | Evidence                        |
| ------- | ------------------------------ | --------------------------- | --------------- | --------------------------------------------------- | ------- | ------------------------------- |
| Support | S2 root support exports        | root barrel                 | API             | Content/Footer values and contexts added            | matched | build/export report             |
| Support | no legacy Text aliases         | Text props                  | API             | variant/size/class/style/event props filtered       | matched | unit test                       |
| Support | Text skeleton branch           | Text + Skeleton             | loading/a11y    | inert text wrapper and style branch                 | matched | Skeleton tests                  |
| Support | Heading level                  | Heading                     | DOM             | `h3` default and explicit heading tag               | matched | unit test                       |
| Support | Menu heading context role      | Heading + Menu contexts     | a11y/context    | `role="presentation"` preserved                     | matched | ActionMenu test                 |
| Support | Header/Content/Footer elements | native elements             | DOM             | `header`, `div`, `footer`                           | matched | unit test                       |
| Support | Keyboard element               | native `kbd`                | DOM/a11y        | `kbd[dir=ltr]`                                      | matched | unit test                       |
| Support | S2 style source                | context styles/unsafe props | visual/style    | no standalone default typography/pill classes       | matched | unit tests and ActionMenu slice |
| Harness | no catalogue route             | comparison catalogue        | route integrity | no standalone Text visual state required            | matched | gap report                      |
| Harness | consumer coverage              | focused impacted tests      | integration     | Button/Badge/ActionMenu/Skeleton still compose Text | matched | focused test slice              |

## Evidence

```bash
vp test run packages/solid-spectrum/test/Text.test.tsx packages/solid-spectrum/test/Skeleton.test.tsx packages/solid-spectrum/test/ButtonFamilyContext.test.tsx packages/solid-spectrum/test/ActionMenu.test.tsx packages/solid-spectrum/test/Badge.test.tsx packages/solid-spectrum/test/Wave4Components.test.tsx
vp run --filter @proyecto-viviana/solid-spectrum build
vp run --filter @proyecto-viviana/comparison build
vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/actionmenu-contract.spec.ts e2e/actionmenu-visual.spec.ts e2e/menu-contract.spec.ts e2e/menu-visual.spec.ts e2e/badge-visual.spec.ts e2e/skeleton-visual.spec.ts --reporter=line
vp run comparison:report:exports
vp run comparison:report:gaps
vp run guard:rac-parity
vp run guard:rac-export-gap
vp run check
git diff --check
```

Results:

- Focused Text/support and impacted unit slice: `94 passed`.
- Solid Spectrum build: passed.
- Comparison build: passed.
- Impacted ActionMenu/Menu/Badge/Skeleton browser suites: `42 passed`.
- Current gap report lists official styled entries live on both sides at `47`,
  missing/gap entries at `22`, visual states tracked at `266`, visual evidence
  states at `76`, strict pair-diff states at `46`, and blocked visual states at
  `22`.
- Current export report lists `solid-spectrum` public value exports at `158`,
  missing React S2 value exports at `53` of `208`, and extra Solid value
  exports at `3`.
- RAC export and tracked-symbol guards report no missing Solid names.
- Full repo check and whitespace diff check: passed.

## Handoff

- Current-gate status: Text support primitives are accepted as of 2026-05-20.
- Text has no standalone comparison route because S2 exposes it as support
  primitives, not a catalogue page.
- Next component should be selected from `components/README.md` after this
  commit.
