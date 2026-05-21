# Skeleton Validation Notes

Date: 2026-05-20
Status: accepted

Skeleton has now been normalized against the current acceptance gates.
Historical evidence from the original 2026-05-15 pass is superseded by this
closeout, which records the corrected loaded-wrapper DOM behavior, current
comparison harness coverage, and refreshed report/guard evidence.

## Current-Gate Closeout

- Scope: styled S2 `Skeleton`, `SkeletonCollection`, root exports,
  `useIsSkeleton`, shared loading/text/icon/wrapper helpers, affected child
  consumers, comparison route controls, visual-state matrix coverage, and
  focused Skeleton/browser evidence.
- Sources rechecked: React Spectrum S2 Skeleton docs, S2 Skeleton source, S2
  SkeletonCollection source, S2 package root exports, Solid Skeleton/Text/Icon/
  Image/Badge/Meter/Form/Link/StatusLight sources, comparison route controls,
  Skeleton visual spec, and existing Skeleton unit tests.
- Result: accepted for Skeleton. Solid exposes the documented S2 root surface:
  `Skeleton`, `useIsSkeleton`, `SkeletonCollection`, `SkeletonProps`, and
  `SkeletonCollectionProps`. The visible component API remains only `children`
  and `isLoading`; loading state is expressed through context consumers rather
  than standalone placeholder blocks. `SkeletonWrapper` now matches S2's loaded
  branch by resetting skeleton context without adding an extra wrapper element.

## Acceptance Gate Checklist

- [x] Public API: comparison controls and docs notes match the S2 surface for
      `children` and `isLoading`; root exports match S2 for `Skeleton`,
      `useIsSkeleton`, `SkeletonCollection`, and their public prop types.
- [x] Styled public type: no legacy standalone placeholder props such as
      `shape`, `size`, `gap`, or `count` remain on the current styled API.
- [x] Headless/ARIA parity: React Aria has no dedicated Skeleton primitive;
      accessibility semantics stay owned by real child components, and Skeleton
      itself does not add `role="status"` or `aria-busy`.
- [x] DOM/accessibility contract: loading children receive inert/loading
      treatment through Text, Image, Icon, Badge, Meter, StatusLight, Link, and
      Form consumers; loaded `SkeletonWrapper` children are no longer wrapped in
      an extra span.
- [x] Style source-to-computed: shared loading gradient, text transparency,
      icon radius, image hidden/reveal behavior, Web Animations shimmer,
      reduced-motion handling, and forced-colors contracts are covered.
- [x] Harness contract: route controls match the docs-style option surface, the
      visual-state matrix includes Skeleton root DOM contract coverage, and
      browser computed contracts compare loaded/loading child treatment against
      React Spectrum.
- [x] Evidence handoff: focused unit tests, package builds, comparison build,
      Skeleton Playwright, reports, guards, README status, and this note are
      refreshed for the current gate.

## Agent Workflow

| Step                    | Status | Evidence                                                                |
| ----------------------- | ------ | ----------------------------------------------------------------------- |
| Research                | done   | S2 Skeleton API/source, SkeletonCollection source, package root exports |
| Baseline and source map | done   | Existing note plus current source/API/export recheck                    |
| Implementation          | done   | Loaded `SkeletonWrapper` branch aligned with S2 DOM behavior            |
| Harness                 | done   | Root DOM matrix row and visual contract expansion                       |
| Verification            | done   | Focused consumer tests, package builds, comparison build, Skeleton e2e  |
| Handoff                 | done   | README normalization status, current-gate closeout note, commit         |

## Behavior State Machine

- Stable states: loading Skeleton context; loaded Skeleton context; no Skeleton
  context; nested consumers under a `SkeletonWrapper`; collection placeholder
  children cached by collection node identity.
- Visual states: Text placeholder spans, transparent text fill, Image loading
  gradient/hidden native image, Icon loading gradient and radius, Badge/Meter
  wrapper loading, StatusLight skeleton light, Link/Text inert content, and
  Form descendant disabling.
- Interaction states: no direct user interaction belongs to Skeleton; child
  components keep their own interaction semantics when not loading and are inert
  or disabled while loading where S2 requires it.
- Environment states: reduced motion disables Web Animations shimmer, and
  forced-colors active remains React-equivalent for the loading context
  contract.
- Cleanup contract: loading animations start when needed, stop when loading is
  disabled, respect reduced motion, and cancel on unmount.

## Accessibility And I18n

- Skeleton is a context wrapper around real content, not a status region or live
  announcement primitive.
- Text, Link, Icon, Image, Badge, Meter, and StatusLight consumers apply inert
  or hidden treatment while loading, preserving child-owned semantics for loaded
  content.
- Form-aware descendants are disabled while Skeleton loading is active, matching
  S2 Form/Skeleton precedence.
- Skeleton owns no generated labels, descriptions, live regions, locale-specific
  formatting, or bidirectional text transforms.
- `useIsSkeleton` is Solid-idiomatic and returns an accessor, while matching the
  observable S2 boolean context result.

## Style Source-To-Computed

- React S2 Skeleton source provides `SkeletonContext`, `Skeleton`,
  `useIsSkeleton`, `loadingStyle`, `useSkeletonText`, `SkeletonText`,
  `SkeletonWrapper`, `useSkeletonIcon`, and reduced-motion-aware
  `useLoadingAnimation`.
- Solid follows the same observable contract with accessors and DOM attribute
  synchronization where Solid needs explicit inert handling.
- The loaded `SkeletonWrapper` branch now mirrors S2: it resets the skeleton
  context to `null` and returns the original child without an extra wrapper.
- Browser contracts compare root harness attributes, absence of standalone
  status placeholders, text inert state, nested skeleton text spans, image
  opacity/visibility, icon inert state, loading target counts, loaded cleanup,
  and forced-colors output against React Spectrum.

## Source Packet

| Source                   | Files or docs                                               | Finding                                                                                                                                        |
| ------------------------ | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| S2 docs MCP              | `Skeleton` page                                             | Public component API is `children` and `isLoading`; affected content includes Image, Text, Link, Icon, StatusLight, Badge, Meter, and forms.   |
| React Aria docs          | component index                                             | No direct Skeleton primitive exists; accessibility remains owned by child components.                                                          |
| React Spectrum S2 source | `@react-spectrum/s2/src/Skeleton.tsx`                       | S2 provides context, loading style, text/icon helpers, wrapper behavior, inert handling, and reduced-motion-aware Web Animations.              |
| React Spectrum S2 source | `@react-spectrum/s2/src/SkeletonCollection.tsx`             | Collection leaf wraps item render output in loading Skeleton and caches by collection node.                                                    |
| Solid source after pass  | `packages/solid-spectrum/src/skeleton/index.tsx`            | Solid matches S2 context/loading behavior and loaded wrapper cleanup while preserving Solid accessor idioms.                                   |
| Solid consumer sources   | Image, Text, Icon, Badge, Meter, Form, Link, StatusLight    | Consumers apply S2-equivalent loading, inert, hidden, or disabled behavior.                                                                    |
| Comparison harness       | manifest, controls, fixtures, visual matrix, `skeleton` e2e | Skeleton is live on both stacks with strict loading/loaded evidence, route-control checks, child context contract, and forced-colors coverage. |

## Official Docs And Viewer Parity

| Docs item            | Official setting/example                                          | Route/control                                            | Status  | Evidence                              |
| -------------------- | ----------------------------------------------------------------- | -------------------------------------------------------- | ------- | ------------------------------------- |
| `children`           | real content is wrapped and affected children become placeholders | React/Solid fixture wraps Image, Text, and Icon children | matched | strict loading and loaded screenshots |
| `isLoading`          | boolean loading context                                           | switch control defaults to `true`                        | matched | e2e control propagation test          |
| Loaded state         | same children render normally when not loading                    | `?isLoading=false` and switch control                    | matched | strict loaded screenshot and contract |
| Text consumer        | placeholder text spans                                            | fixture Text children                                    | matched | unit and e2e tests                    |
| Image consumer       | loading gradient and hidden image                                 | fixture Image child                                      | matched | unit and e2e tests                    |
| Icon consumer        | loading gradient/radius and inert icon                            | fixture Icon child                                       | matched | unit and e2e tests                    |
| Form disabling       | form components disabled under loading Skeleton                   | component API/consumer tests                             | matched | Form/Skeleton unit tests              |
| `SkeletonCollection` | cached placeholder leaf for collections                           | component API                                            | matched | unit test                             |
| Reduced motion       | no shimmer animation when reduced motion is requested             | media emulation/unit matchMedia                          | matched | unit and e2e tests                    |
| Forced colors        | loading context remains equivalent                                | forced-colors media emulation                            | matched | e2e test                              |

## Baseline

- Before the support sweep, Skeleton had been implemented as standalone
  placeholder blocks with non-S2 props.
- The initial Skeleton pass moved it to S2-style context/consumer behavior, but
  it predated the current gate checklist and retained a subtle DOM drift:
  `SkeletonWrapper` still rendered an extra wrapper span when `isLoading` was
  false.
- Current reports after current-gate normalization list:
  - official entries in comparison app: `69`;
  - live entries: `47`;
  - missing/gap entries: `22`;
  - visual states tracked: `265`;
  - visual evidence states: `76`;
  - strict pair-diff states: `46`;
  - blocked visual states: `22`;
  - `solid-spectrum` public value exports: `155`;
  - missing S2 value exports: `57`;
  - extra Solid value exports: `4`.

## Source Map And Public Contract

| Layer               | Upstream files                           | Solid files                                                    | Status  |
| ------------------- | ---------------------------------------- | -------------------------------------------------------------- | ------- |
| State               | none                                     | none                                                           | n/a     |
| ARIA hooks          | none                                     | none                                                           | n/a     |
| Headless components | native children and context consumers    | native children and context consumers                          | n/a     |
| Styled S2           | `Skeleton.tsx`, `SkeletonCollection.tsx` | `src/skeleton`, `src/image`, `src/text`, `src/icon`, consumers | matched |
| Comparison route    | S2 docs/viewer and React S2 fixture      | demo data, controls, fixtures, visual matrix, e2e              | matched |

- Public props/defaults:
  - `Skeleton`: `children` and `isLoading`.
  - `SkeletonCollection`: `children`.
  - `useIsSkeleton`: returns the current loading context; Solid returns an
    accessor for reactivity.
- Root exports:
  - values `Skeleton`, `SkeletonCollection`, and `useIsSkeleton`;
  - types `SkeletonProps` and `SkeletonCollectionProps`.
- Internal helpers:
  - `SkeletonContext`, `loadingStyle`, `useLoadingAnimation`,
    `useSkeletonText`, `SkeletonText`, `SkeletonWrapper`, and
    `useSkeletonIcon` remain internal support for S2 consumers.

## Source Branch Coverage

| Layer      | Upstream branch                    | Solid owner            | Class              | Observable                                        | Status  | Evidence                  |
| ---------- | ---------------------------------- | ---------------------- | ------------------ | ------------------------------------------------- | ------- | ------------------------- |
| API        | `Skeleton` props                   | S2 wrapper             | API                | `children`, `isLoading` only                      | matched | controls and source audit |
| API        | root exports                       | package root           | API                | Skeleton/useIsSkeleton/SkeletonCollection exports | matched | export report             |
| Context    | `SkeletonContext=true`             | `Skeleton`             | context            | descendants read loading context                  | matched | unit and e2e tests        |
| Context    | `SkeletonContext=false`            | `Skeleton`             | context            | descendants render loaded content                 | matched | unit and e2e tests        |
| Context    | `SkeletonWrapper` loaded reset     | `SkeletonWrapper`      | DOM/context        | no extra wrapper span when loading is false       | matched | unit and e2e tests        |
| Text       | `useSkeletonText`                  | Text/Link consumers    | visual/a11y        | inert text root, nested placeholder span          | matched | unit and e2e tests        |
| Image      | `useIsSkeleton` + loading style    | Image consumer         | visual             | image hidden with loading wrapper style           | matched | unit and e2e tests        |
| Icon       | `useSkeletonIcon`                  | icon factory           | visual/a11y        | rounded loading icon and inert state              | matched | unit and e2e tests        |
| Form       | Skeleton disables form descendants | Form context helper    | composition/a11y   | loading wins over local disabled opt-out          | matched | Form unit test            |
| Collection | node identity cache                | `SkeletonCollection`   | collection/runtime | placeholder child function renders once per node  | matched | unit test                 |
| Runtime    | Web Animation API shimmer          | `useLoadingAnimation`  | lifecycle          | starts, stops, restarts, and cancels on cleanup   | matched | unit test                 |
| Runtime    | prefers-reduced-motion             | `useLoadingAnimation`  | lifecycle/a11y     | no animation when reduced motion is requested     | matched | unit and e2e tests        |
| Harness    | route control surface              | comparison route       | route integrity    | switch default/change drives both stacks          | matched | e2e route-control test    |
| Harness    | root DOM contract                  | comparison visual spec | route integrity    | root data attrs, status absence, loading targets  | matched | e2e computed contract     |

## Evidence

```bash
vp test run packages/solid-spectrum/test/Skeleton.test.tsx packages/solid-spectrum/test/Image.test.tsx packages/solid-spectrum/test/ButtonFamilyContext.test.tsx packages/solid-spectrum/test/Badge.test.tsx packages/solid-spectrum/test/Meter.test.tsx packages/solid-spectrum/test/Form.test.tsx packages/solid-spectrum/test/Link.test.tsx packages/solid-spectrum/test/StatusLight.test.tsx
vp run --filter @proyecto-viviana/solid-spectrum build
vp run --filter @proyecto-viviana/comparison build
vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/skeleton-visual.spec.ts --reporter=line
vp run comparison:report:gaps
vp run comparison:report:exports
vp run guard:rac-parity
vp run guard:rac-export-gap
vp run check
```

Results:

- Focused Skeleton and consumer tests: `80 passed`.
- Solid Spectrum build: passed.
- Comparison build: passed and generated `/components/skeleton/`.
- Skeleton Playwright suite: `5 passed`.
- Regression snapshot slice has no dedicated Skeleton entry yet:
  `50 skipped`.
- Current gap report lists official styled entries live on both sides at `47`,
  missing/gap entries at `22`, visual states tracked at `265`, visual evidence
  states at `76`, strict pair-diff states at `46`, and blocked visual states at
  `22`.
- Current export report lists `solid-spectrum` public value exports at `155`,
  missing React S2 value exports at `57` of `208`, and extra Solid value exports
  at `4`.
- RAC export and tracked-symbol guards report no missing Solid names.
- Full repo check: passed.

## Handoff

- Current-gate status: Skeleton is accepted as of 2026-05-20.
- Future consumer-specific skeleton visual rows should stay with the component
  that owns the consumer rendering.
- Next legacy normalization candidate in `components/README.md`: StatusLight.
