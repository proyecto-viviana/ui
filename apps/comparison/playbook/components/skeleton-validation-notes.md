# Skeleton Validation Notes

## Target

- Component: Skeleton
- Slug: skeleton
- Family or direct subcomponents: SkeletonCollection
- Pass goal: standalone Skeleton context wrapper parity, child consumer parity,
  route controls, loading/loaded state evidence, and exact visual comparison
- Date: 2026-05-15

## Task Status

| Task                   | Status | Evidence                                         | Blocker or next action |
| ---------------------- | ------ | ------------------------------------------------ | ---------------------- |
| 0 Research             | done   | S2 docs/source, React Aria index                 | none                   |
| 1 Baseline             | done   | Reports and RAC guards                           | none                   |
| 2 Route harness        | done   | `/components/skeleton/`                          | none                   |
| 3 Source map/API       | done   | source map below                                 | none                   |
| 4 Cross-layer audit    | done   | audit table below                                | none                   |
| 5 Transitions          | done   | `isLoading=true/false` e2e                       | none                   |
| 6 State                | n/a    | no separate state package owner                  |                        |
| 7 ARIA hooks           | n/a    | no React Aria Skeleton page/hook                 |                        |
| 8 Headless             | n/a    | native child semantics                           |                        |
| 9 Styled S2            | done   | `e2e/skeleton-visual.spec.ts`                    | none                   |
| 10 Runtime lifecycle   | done   | animation/cleanup/reduced-motion tests and build | none                   |
| 11 Harness integrity   | done   | reduced motion, opaque fixture                   | none                   |
| 12 Comparison evidence | done   | exact loading and loaded shots                   | none                   |
| 13 Acceptance          | done   | commands in Evidence                             | none                   |

## Research

| Source                      | Files or docs                                                                                                         | Finding                                                                                                                                              |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| S2 docs MCP                 | `Skeleton` page, sections `Content`, `API`                                                                            | Public API is only `children` and `isLoading`; Skeleton wraps real content instead of rendering placeholder blocks by itself.                        |
| React Aria MCP              | page index                                                                                                            | No direct Skeleton page or hook exists; accessibility semantics remain owned by the real child components.                                           |
| React Spectrum S2 source    | `@react-spectrum/s2/src/Skeleton.tsx`                                                                                 | Provides `SkeletonContext`, `loadingStyle`, `useIsSkeleton`, text/icon helpers, inert wrapper behavior, and reduced-motion-aware Web Animations API. |
| React Spectrum S2 source    | `@react-spectrum/s2/src/SkeletonCollection.tsx`                                                                       | Collection leaf wraps item render output in loading Skeleton and caches by node.                                                                     |
| React Spectrum S2 consumers | `Image`, `Button`, `ActionButton`, `ToggleButton`, `Link`, `Content`, `Icon`, `StatusLight`, `Badge`, `Meter`, `Form` | Skeleton behavior is mostly distributed across child consumers through context; Form is now covered by its own pass.                                 |
| Solid source before pass    | `packages/solid-spectrum/src/skeleton/index.tsx`                                                                      | Implemented standalone status/shimmer blocks with `shape`, `size`, `gap`, and `count`, which is not S2 API parity.                                   |

## Official Docs And Viewer Parity

| Docs item    | Official setting/example                                         | Route/control                                            | Status  | Evidence                 |
| ------------ | ---------------------------------------------------------------- | -------------------------------------------------------- | ------- | ------------------------ |
| Content      | Wraps real content and renders affected children as placeholders | React/Solid fixture wraps Image, Text, and Icon children | matched | exact default screenshot |
| API          | `isLoading` boolean, `children` required                         | switch control defaults to `true`                        | matched | control propagation test |
| Loaded state | Same children render normally when not loading                   | `?isLoading=false` and switch control                    | matched | exact loaded screenshot  |

## Incoming Cross-Component Findings

| Discovered in      | Upstream owner                                         | Affected API/context                       | Required validation                                                                                        |
| ------------------ | ------------------------------------------------------ | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Button-family pass | `Button`, `LinkButton`, `ActionButton`, `ToggleButton` | `SkeletonContext`                          | Button-family components must reset skeleton inheritance with `SkeletonContext.Provider value={null}`.     |
| Image pass         | `Image`                                                | `useIsSkeleton`, `loadingStyle`, animation | Image wrapper must hide native image and use the shared S2 loading style while skeleton loading is active. |

## Source Map And Public Contract

| Layer               | Upstream files                           | Solid files                                         | Status  |
| ------------------- | ---------------------------------------- | --------------------------------------------------- | ------- |
| State               | none                                     | none                                                | n/a     |
| ARIA hooks          | none                                     | none                                                | n/a     |
| Headless components | native children and context consumers    | native children and context consumers               | n/a     |
| Styled S2           | `Skeleton.tsx`, `SkeletonCollection.tsx` | `src/skeleton`, `src/image`, `src/text`, `src/icon` | matched |

- Public props/defaults: `Skeleton({children, isLoading})`,
  `SkeletonCollection({children})`, and Solid-idiomatic
  `useIsSkeleton() -> Accessor<boolean>`.
- Contexts/providers: internal `SkeletonContext` accepts boolean/accessor/null;
  root export intentionally exposes only the public S2 surface.
- Unsupported or intentionally different branches:
  `SkeletonCollection` is ported as a Solidaria leaf component and preserves the
  same observable cached loading wrapper behavior for current collection usage.

## Cross-Layer Audit

| Layer               | Matched                                                             | Ported differently                          | Not applicable            | Gaps                                   |
| ------------------- | ------------------------------------------------------------------- | ------------------------------------------- | ------------------------- | -------------------------------------- |
| State               |                                                                     |                                             | no separate state package | none                                   |
| ARIA hooks          |                                                                     |                                             | no direct ARIA hook/page  | none                                   |
| Headless components | native child semantics                                              |                                             |                           | none                                   |
| Styled S2           | context, text/icon/image consumers, loading style, inert, animation | Solid accessors replace React context reads |                           | Form covered in its own component pass |

Solid idioms checked:

- child/provider laziness: `Skeleton` passes an accessor and `useIsSkeleton`
  returns an accessor so `isLoading` updates live without render-prop syntax.
- dynamic prop/context getters: Image/Text/Icon consume `createIsSkeleton()`
  instead of snapshotting `useIsSkeleton()`.
- refs and cleanup ownership: loading animations cancel on cleanup; inert is
  synchronized as a DOM attribute because Solid does not type `inert` as a JSX
  boolean attribute consistently across elements.

## Interaction Dependency Map

| Subpart        | Upstream input         | Observable output                                           | Minimal proof                      | Status  | Evidence                      |
| -------------- | ---------------------- | ----------------------------------------------------------- | ---------------------------------- | ------- | ----------------------------- |
| Text           | `SkeletonContext=true` | nested placeholder span, transparent text fill, inert root  | DOM contract + exact screenshot    | matched | `e2e/skeleton-visual.spec.ts` |
| Image          | `SkeletonContext=true` | wrapper gradient, native image hidden/opacity 0             | DOM contract + exact screenshot    | matched | `e2e/skeleton-visual.spec.ts` |
| Icon           | `SkeletonContext=true` | icon gradient, rounded corners, inert                       | DOM contract + exact screenshot    | matched | `e2e/skeleton-visual.spec.ts` |
| Loading state  | `isLoading=false`      | same children render normally and no loading targets remain | loaded state screenshot + contract | matched | `e2e/skeleton-visual.spec.ts` |
| Reduced motion | media query reduce     | no running background animation required for capture        | e2e media emulation                | matched | `e2e/skeleton-visual.spec.ts` |
| Animation      | `useLoadingAnimation`  | Web Animation starts, stops, respects reduced motion        | unit lifecycle tests               | matched | `Skeleton.test.tsx`           |
| Collection     | collection node input  | cached placeholder render under collection metadata         | unit test                          | matched | `Skeleton.test.tsx`           |
| Forced colors  | forced-colors active   | loading context contract remains React-equivalent           | e2e media emulation                | matched | `e2e/skeleton-visual.spec.ts` |

## Harness Integrity

- Initial pre-pass focused-suite status: no Skeleton route, no controls, and no
  standalone Skeleton acceptance tests.
- Evidence authority: installed React Spectrum S2 source and docs page are the
  source of truth; React Aria has no dedicated Skeleton primitive.
- Font/theme/viewport/animation stabilization: e2e pins light theme, waits for
  fonts, emulates reduced motion, covers forced-colors media, and captures exact
  React/Solid canvases.
- Failure taxonomy: initial screenshot mismatch was fixture transparency in the
  screenshot target, not component drift; the row is now opaque so exact pair
  diffs compare component pixels only.

## Evidence

```bash
vp test run packages/solid-spectrum/test/Skeleton.test.tsx packages/solid-spectrum/test/Image.test.tsx packages/solid-spectrum/test/ButtonFamilyContext.test.tsx
vp run --filter @proyecto-viviana/comparison build
vp exec --filter @proyecto-viviana/comparison playwright test e2e/skeleton-visual.spec.ts --reporter=line
vp run comparison:report:gaps
vp run comparison:report:exports
vp run guard:rac-parity
vp run guard:rac-export-gap
vp run check
```

Results:

- Focused Solid tests: `25 passed`.
- Comparison build: passed.
- Skeleton visual suite: `5 passed`.
- Current gap report lists official styled entries live on both sides at `33`,
  missing/gap entries at `36`, visual states tracked at `179`, visual evidence
  states at `49`, strict pair-diff states at `32`, and blocked visual states at
  `35`.
- Current export report lists missing React S2 value exports at `80` of `208`
  and extra Solid value exports at `3`.
- RAC export and tracked-symbol guards report no missing Solid names.
- Full repo check: passed.

## Handoff

- Skeleton is playbook-accepted for owned behavior.
- SkeletonCollection current observable behavior and Image/Text/Icon skeleton
  consumers are covered by focused evidence.
- Form skeleton interactions were validated in the Form component pass.
- Future consumer-specific skeleton visual rows should stay with the component
  that owns the consumer rendering.
