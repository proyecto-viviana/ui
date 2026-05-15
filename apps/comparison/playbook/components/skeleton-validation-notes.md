# Skeleton Validation Notes

## Target

- Component: Skeleton
- Slug: skeleton
- Family or direct subcomponents: SkeletonCollection
- Pass goal: standalone Skeleton context wrapper parity, child consumer parity,
  route controls, loading/loaded state evidence, and exact visual comparison
- Date: 2026-05-14

## Task Status

| Task                   | Status | Evidence                          | Blocker or next action |
| ---------------------- | ------ | --------------------------------- | ---------------------- |
| 0 Research             | done   | S2 docs/source, React Aria index  | none                   |
| 1 Baseline             | done   | `comparison:report:gaps`          | none                   |
| 2 Route harness        | done   | `/components/skeleton/`           | none                   |
| 3 Source map/API       | done   | source map below                  | none                   |
| 4 Cross-layer audit    | done   | audit table below                 | none                   |
| 5 Transitions          | done   | `isLoading=true/false` e2e        | none                   |
| 6 State                | n/a    | no separate state package owner   |                        |
| 7 ARIA hooks           | n/a    | no React Aria Skeleton page/hook  |                        |
| 8 Headless             | n/a    | native child semantics            |                        |
| 9 Styled S2            | done   | `e2e/skeleton-visual.spec.ts`     | none                   |
| 10 Runtime lifecycle   | done   | animation/cleanup tests and build | none                   |
| 11 Harness integrity   | done   | reduced motion, opaque fixture    | none                   |
| 12 Comparison evidence | done   | exact loading and loaded shots    | none                   |
| 13 Acceptance          | done   | commands in Evidence              | none                   |

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

## Harness Integrity

- Pre-change focused-suite status: no Skeleton route, no controls, and no
  standalone Skeleton acceptance tests.
- Evidence authority: installed React Spectrum S2 source and docs page are the
  source of truth; React Aria has no dedicated Skeleton primitive.
- Font/theme/viewport/animation stabilization: e2e pins light theme, waits for
  fonts, emulates reduced motion, and captures exact React/Solid canvases.
- Failure taxonomy: initial screenshot mismatch was fixture transparency in the
  screenshot target, not component drift; the row is now opaque so exact pair
  diffs compare component pixels only.

## Evidence

```bash
vp test run packages/solid-spectrum/test/Skeleton.test.tsx packages/solid-spectrum/test/Image.test.tsx packages/solid-spectrum/test/ButtonFamilyContext.test.tsx
vp run --filter @proyecto-viviana/comparison build
vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/skeleton-visual.spec.ts --reporter=line
vp run comparison:report:gaps
```

Results:

- Focused Solid tests: `23 passed`.
- Comparison build: passed.
- Skeleton visual suite: `4 passed`.
- Gap report: official styled entries live on both sides moved to `27`;
  missing/gap entries moved to `42`; current visual evidence states moved to
  `43`; strict pair-diff states moved to `26`.

## Retro-Audit Against Playbook

| Gate                             | Status  | Finding                                                                                                                                                      |
| -------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tasks 0-1 research/baseline      | partial | Research and gap baseline were recorded; export report and guard baselines were not part of the note.                                                        |
| Task 2 route harness             | matched | Route controls cover `isLoading`, default loading, and loaded state with control propagation evidence.                                                       |
| Tasks 3-4 source branch coverage | partial | Source map and dependency map are strong, but not a full branch ledger for `Skeleton.tsx`, `SkeletonCollection.tsx`, all consumers, and animation lifecycle. |
| Task 5 transition plan           | matched | Loading and loaded states are represented with e2e evidence; broader consumer-specific skeleton rows are delegated to the owning component passes.           |
| Task 9 styled branches           | partial | Text/Image/Icon consumer branches and reduced motion are covered; forced-colors/high-contrast styling was not browser-tested.                                |
| Tasks 11-13 evidence/sign-off    | partial | Harness notes and failure taxonomy are present; full `vp run check`, export report, and guard refresh were not recorded for this component.                  |

Retro-audit gaps to backfill before release hardening:

- Add a branch ledger for root context, loading style, text/icon/image helpers,
  inert synchronization, animation setup/cleanup, SkeletonCollection caching,
  and each accepted consumer branch.
- Refresh evidence with current `comparison:report:gaps`,
  `comparison:report:exports`, and guard lines.
- Add forced-colors coverage or document why generated S2 token output is the
  accepted boundary for Skeleton placeholders.
- Keep future consumer-specific skeleton visual rows with the component that
  owns the consumer rendering.

## Handoff

- Status after this pass: Skeleton, SkeletonCollection current observable
  behavior, and Image/Text/Icon skeleton consumers are comparison-live with
  focused evidence; the note still has release-hardening backfill gaps above.
- Form skeleton interactions were validated in the Form component pass.
- Next ordered task: continue the component sweep with the next Button-family
  dependent support component only after its pre-pass note is current.
