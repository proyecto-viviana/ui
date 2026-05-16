# Avatar Validation Notes

## Target

- Component: Avatar
- Slug: avatar
- Family or direct subcomponents: AvatarContext, S2 Image wrapper behavior,
  AvatarGroup consumers
- Pass goal: standalone Avatar styled parity, Image lifecycle parity, root prop
  boundary parity, route controls, size/over-background coverage,
  forced-colors environment coverage, and strict default visual evidence
- Date: 2026-05-15

## Task Status

| Task                   | Status | Evidence                                                                                                     | Blocker or next action |
| ---------------------- | ------ | ------------------------------------------------------------------------------------------------------------ | ---------------------- |
| 0 Research             | done   | S2 Avatar docs MCP, live S2 page opened 2026-05-15, Avatar/Image source, AvatarGroup and ActionButton source | None                   |
| 1 Baseline             | done   | `comparison:report:gaps`, `comparison:report:exports`, RAC guards                                            | None                   |
| 2 Route harness        | done   | Avatar controls, project-local docs-image fixture, React/Solid fixtures, visible control assertions          | None                   |
| 3 Source map/API       | done   | Source map and public contract below                                                                         | None                   |
| 4 Cross-layer audit    | done   | Branch ledger covers wrapper styles, Image lifecycle, default slot, context, root boundary, legacy aliases   | None                   |
| 5 Transitions          | done   | Image load/reveal, size, over-background, forced-colors, and context obligations recorded                    | None                   |
| 6 State                | n/a    | No separate state package owner; Avatar inherits Image local lifecycle state                                 | None                   |
| 7 ARIA hooks           | n/a    | Avatar has no dedicated ARIA hook                                                                            | None                   |
| 8 Headless             | done   | Native image `alt` semantics plus S2 Image root prop boundary                                                | None                   |
| 9 Styled S2            | done   | `Avatar`, `Image`, `AvatarContext`, unit tests, computed browser matrix                                      | None                   |
| 10 Runtime lifecycle   | done   | S2 Image load/reveal lifecycle inherited; no Avatar-owned timers, overlays, portals, or global listeners     | None                   |
| 11 Harness integrity   | done   | Exact default pair diff, route-control UI assertions, full size matrix, forced-colors environment check      | None                   |
| 12 Comparison evidence | done   | Avatar Playwright suite plus modeled-controls contract `35 passed`; current reports refreshed                | None                   |
| 13 Acceptance          | done   | Focused tests, builds, browser evidence, report refresh, fixture asset, full check                           | None                   |

## Agent Workflow

| Task                         | Agent role  | Context pack                                               | Docs/skills/tools                       | Allowed writes                                          | Required output                        | Status |
| ---------------------------- | ----------- | ---------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------- | -------------------------------------- | ------ |
| Current-gate normalization   | local Codex | Avatar note, current template, S2 docs/source, route/tests | `react-spectrum-s2`, Playwright, Vitest | Avatar source/tests, Avatar fixture, Avatar note/README | Gate outcomes, code fix, current tests | done   |
| Independent delegated agents | none        | Not used; the work was small enough to keep on one thread  | n/a                                     | n/a                                                     | n/a                                    | n/a    |

| Agent role  | Files read                                                                                                            | Files changed                                                                                                                                  | Evidence added                                                                  | Commands run                                                                                                       | Blockers | Next owner |
| ----------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------- | ---------- |
| local Codex | S2 Avatar docs/source, S2 Image source, Avatar/AvatarGroup tests, comparison route data, visual e2e, current template | `src/avatar/index.tsx`, `test/Avatar.test.tsx`, `public/fixtures/avatar/docs-avatar.png`, `avatar-validation-notes.md`, `components/README.md` | Image lifecycle test, root-boundary test, local default fixture, gate checklist | Focused package tests, Solid build, comparison build, Avatar/controls Playwright, regression slice, reports, check | None     | none       |

## Acceptance Gate Checklist

These gates are additive. Avatar is accepted only because every in-scope row is
closed and the source disagreement is recorded with the chosen authority.

## Gate Outcome Summary

| Gate                                     | Outcome  | Evidence                                                                                              | Blockers/owner |
| ---------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------- | -------------- |
| Official Docs And Viewer Parity          | complete | Live S2 page opened 2026-05-15; docs image/alt/default controls represented in route and e2e          | None           |
| External Authority And Standards         | complete | No custom ARIA/APG pattern; native `img` semantics and S2 docs/source are the controlling authorities | None           |
| Upstream React Source Parity             | complete | Solid Avatar now delegates to Solid Image, matching React Avatar's delegation to S2 Image             | None           |
| Solid Idiomatic Implementation           | complete | Reactive getters preserve size/slot/context/style values; Image owns lifecycle cleanup                | None           |
| Accessibility And I18n                   | complete | Native `img` alt semantics, no generated IDs, no keyboard/form/live-region behavior, forced-colors    | None           |
| Behavior State Machine                   | complete | Load/reveal and route-control transitions mapped; no Avatar-owned interaction state                   | None           |
| Style Source-To-Computed Parity          | complete | Computed contract covers size, outline, wrapper/image geometry, forced-colors                         | None           |
| React-Vs-Solid Comparison Harness Parity | complete | React imports `@react-spectrum/s2` Avatar; Solid imports package Avatar; both receive same props      | None           |
| Evidence And Handoff                     | complete | Focused tests/builds/e2e/reports/check recorded; local fixture present                                | None           |

### 1. Official Docs And Viewer Parity

- [x] Live official S2 page opened and dated: 2026-05-15,
      <https://react-spectrum.adobe.com/Avatar>.
- [x] Primary docs example recorded: `<Avatar src="https://i.imgur.com/xIe7Wlb.png" alt="Avatar" />`.
- [x] Docs examples, slots, children, icons, images, collections, portals, and
      viewer canvas conditions inventoried: Avatar has image source, alt, size,
      over-background canvas, no children/icons/collections/portals.
- [x] Interactive viewer controls inventoried with labels, values, order,
      defaults, reset behavior, and omitted-prop behavior: `alt`, `src`, `size`,
      `isOverBackground`.
- [x] Comparison route default matches official example or deviation recorded:
      local fixture path replaces the remote docs image URL.
- [x] Side-panel controls match official viewer controls and selection
      semantics.
- [x] Route tests assert visible defaults/options and mounted DOM changes.

### 2. External Authority And Standards

- [x] React Aria/S2 docs, testing docs, blog/release/example pages checked or
      recorded as `none found`: S2 docs/source are present; no separate React
      Aria Avatar primitive applies.
- [x] W3C/WHATWG/APG/WCAG/ARIA-AT/evaluation sources checked where relevant:
      no ARIA widget pattern applies; native `img` `alt` semantics are the
      accessibility surface.
- [x] Chrome/web.dev/MDN/platform explainers used only for browser behavior,
      test strategy, or risk discovery: no custom platform behavior beyond
      native image loading was introduced.
- [x] Independent/famous blog posts used only as risk discovery unless tied to
      normative source, installed source, or reproducible behavior: none used.
- [x] Source disagreements recorded with chosen authority: docs/MCP expose
      broad DOMProps such as `id`, but installed React Avatar delegates through
      Image, whose wrapper does not mount arbitrary DOM props. Chosen authority
      for comparison parity is installed React source/runtime.
- [x] External obligations mapped to route/source/behavior/a11y/style rows or
      explicit gaps.

### 3. Upstream React Source Parity

- [x] Upstream files identified for every relevant layer:
      `Avatar.tsx`, `Image.tsx`, `AvatarGroup.tsx`, `ActionButton.tsx`.
- [x] Solid owner files identified or gaps recorded:
      `src/avatar/index.tsx`, `src/image/index.tsx`, comparison fixtures/data.
- [x] Public props/defaults/slots/contexts/refs/exports mapped.
- [x] DOM, ARIA, state, event, effect, cleanup, style, geometry, and
      cross-component branches mapped.
- [x] Source branch ledger covers every user-observable upstream branch.
- [x] Every `matched` or `ported-differently` row has direct evidence.
- [x] Remaining `gap` or `deferred-gap` rows have owners and are not counted as
      accepted: none remain for Avatar-owned behavior.

### 4. Solid Idiomatic Implementation

- [x] Dynamic props, context values, and derived values remain reactive.
- [x] No prop destructuring/spread snapshots live Solid accessors.
- [x] Children remain lazy across provider/context boundaries: Avatar has no
      children; consumer context is validated in AvatarGroup/Button-family rows.
- [x] Render props/custom roots receive live state where applicable: n/a.
- [x] Refs use Solid semantics through shared context ref merge helpers.
- [x] Effects, observers, timers, listeners, and subscriptions have cleanup:
      Image owns load/reveal/coordinator cleanup.
- [x] Solid-specific deviations preserve documented public behavior: legacy
      local size aliases/fallback/status remain compatibility-only.
- [x] Tests cover relevant reactive update risks.

### 5. Accessibility And I18n

- [x] Native element, role, computed accessible name, description, and value:
      nested native `img`; `alt` defaults to `""`, supplied alt is preserved.
- [x] ARIA references, generated IDs, ordering, removal timing, and
      multiple-instance collision checks: no generated IDs or ARIA references.
- [x] Keyboard model, focus order, focus-visible, focus return, and
      focus-not-obscured behavior: n/a for static image wrapper.
- [x] Disabled/read-only/required/invalid/inert/hidden semantics: n/a; arbitrary
      root props are not mounted through the Image boundary.
- [x] Form labels/help/error/validation/hidden-input/reset/submit behavior: n/a.
- [x] Live regions, loading/selection/drag-drop announcements, and cleanup
      timing: n/a for Avatar.
- [x] Forced colors, reduced motion, contrast-sensitive states, target size,
      and screen-reader-only affordances: forced-colors over-background state
      covered; no motion branch owned by Avatar beyond Image reveal.
- [x] Locale, direction, formatting, calendar/hour-cycle, and messages: n/a.
- [x] Axe or similar smoke result, plus manual semantic assertions: manual
      native image assertions in package tests and computed browser assertions.

### 6. Behavior State Machine

- [x] State/input -> trigger -> expected React -> expected Solid -> evidence
      rows completed.
- [x] Pointer, keyboard, touch, virtual click, blur, Escape, cancellation,
      outside press, disabled/read-only suppression: n/a; static image.
- [x] Controlled/uncontrolled, defaults, reset, submit, async/loading/empty,
      collection navigation: route defaults and Image load/reveal covered.
- [x] Event ordering, callback payloads/counts/suppression, propagation, and
      cancellation: no Avatar callbacks.
- [x] Overlay/portal/scroll-lock/hiding/focus/timer/observer/listener cleanup:
      n/a for Avatar; Image cleanup inherited.
- [x] Before/trigger/immediate/transient/settled/cleanup transition evidence:
      native load triggers Image reveal class change in unit tests; browser
      tests wait for loaded image before pair-diff/computed assertions.

### 7. Style Source-To-Computed Parity

- [x] Upstream S2 style declarations and owner branches identified.
- [x] Solid style/token path uses S2-compatible generated classes.
- [x] Comparison app CSS does not patch component behavior/style/geometry:
      route row only supplies canvas padding/background for over-background.
- [x] Size/density/variant/staticColor/orientation/placement/field-state and
      provider/form style axes mapped: size and over-background only.
- [x] Computed-style/class/attribute/geometry/CSS-variable assertions cover
      rendering-affecting branches.
- [x] Forced-colors/reduced-motion/focus-ring/icon/image/avatar/slot/portal
      geometry branches covered: forced-colors and image/avatar geometry covered;
      other axes n/a.
- [x] Official viewer canvas/background/scale/width/direction/theme conditions
      represented or recorded as gaps.
- [x] Visual deviations classified: none accepted for Avatar-owned behavior.

### 8. React-Vs-Solid Comparison Harness Parity

- [x] React fixture imports current upstream component and official composition.
- [x] Solid fixture imports package public API.
- [x] Both fixtures receive the same props and environment settings.
- [x] Focused route tests prove controls update mounted React and Solid DOM.
- [x] Computed style, a11y, geometry, runtime, or pair-diff evidence covers
      rendering-affecting branches.
- [x] Harness stability is proven by strict default pair-diff and focused
      browser contract.

### 9. Evidence And Handoff

- [x] Focused package tests: Avatar and AvatarGroup.
- [x] Focused Playwright/runtime tests: Avatar visual plus modeled controls.
- [x] Comparison reports refreshed when status/evidence changed.
- [x] `vp run check`: passed.
- [x] Final status is `accepted`, `partial`, or `pre-pass`: accepted.
- [x] Remaining gaps listed by gate and owner: none for Avatar-owned behavior.
- [x] Blocker labels used where applicable: none.

## Source Packet

| Source                   | Files or docs                                                                                  | Finding                                                                                                                                                                |
| ------------------------ | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S2 docs MCP              | `Avatar` page                                                                                  | Public API includes `alt`, `id`, `isOverBackground`, numeric `size`, `slot`, `src`, `styles`, unsafe class/style; MCP example remains minimal.                         |
| Live S2 docs             | <https://react-spectrum.adobe.com/Avatar>, opened 2026-05-15                                   | Current visible example uses a remote image source and `alt="Avatar"`; route default uses the same shape with a project-local fixture.                                 |
| React Spectrum S2 source | `@react-spectrum/s2/src/Avatar.tsx`                                                            | Avatar delegates to S2 `Image`, defaults `alt=""`, `size=24`, `slot="avatar"`, filters props before Image, and has no initials/status UI.                              |
| React Spectrum S2 source | `@react-spectrum/s2/src/Image.tsx`                                                             | Image owns wrapper background/overflow, nested image geometry, load -> loaded -> revealed state, error path, Skeleton loading class, and arbitrary root prop boundary. |
| React Spectrum S2 source | `@react-spectrum/s2/src/AvatarGroup.tsx`                                                       | AvatarGroup is separate and provides `AvatarContext` with size, styles, and `isOverBackground`.                                                                        |
| React Spectrum S2 source | `@react-spectrum/s2/src/ActionButton.tsx`                                                      | ActionButton provides `AvatarContext` with numeric avatar sizes and icon-grid placement styles.                                                                        |
| Solid source before pass | `packages/solid-spectrum/src/avatar/index.tsx`                                                 | Solid hand-rendered the wrapper and `img`, which missed the inherited S2 Image load/reveal lifecycle and over-preserved root DOM props.                                |
| Solid source after pass  | `packages/solid-spectrum/src/avatar/index.tsx`                                                 | Solid delegates to Solid Image, preserving Avatar sizing/outline/context while inheriting Image lifecycle and root boundary behavior.                                  |
| Comparison harness       | `comparison-manifest`, styled fixtures, component controls, visual matrix, `avatar-visual` e2e | Avatar is live on both stacks with strict default visual evidence, route-control checks, full size matrix, forced-colors evidence, and a local docs-image fixture.     |

## Official Docs And Viewer Parity

| Docs item          | Official setting/example                 | Route/control                                          | Status                            | Evidence                                      |
| ------------------ | ---------------------------------------- | ------------------------------------------------------ | --------------------------------- | --------------------------------------------- |
| `alt`              | live example `alt="Avatar"`              | text input, default `Avatar`                           | matched                           | unit and e2e tests                            |
| `src`              | live example image source                | text input, default `/fixtures/avatar/docs-avatar.png` | matched with local fixture        | local PNG fixture plus e2e route assertions   |
| `size`             | numeric size, default `24`               | radio options in documented order                      | matched                           | e2e asserts option labels/order/default       |
| `isOverBackground` | over-background outline treatment        | switch, default off                                    | matched                           | e2e asserts default and changed value         |
| `slot`             | default `avatar`, supports `null`        | component API and context merge                        | matched                           | unit tests                                    |
| `styles`           | S2 style macro without width override    | component API                                          | matched                           | source audit and computed style contract      |
| unsafe props       | `UNSAFE_className`, `UNSAFE_style`       | component API                                          | matched                           | unit tests                                    |
| DOM/root props     | documented broad DOMProps vs Image root  | component API                                          | source disagreement recorded      | unit test matches installed React root bounds |
| legacy local props | `fallback`, `online`, named size aliases | compatibility only                                     | ported-differently, non-rendering | unit tests                                    |

## Baseline

- Before the support sweep, Avatar had catalogue entries but no standalone live
  React/Solid comparison route and no Avatar-specific strict visual evidence.
- Earlier Avatar passes moved Avatar live and strict, but the prior playbook
  missed two current-gate obligations:
  - Avatar must inherit S2 Image load/reveal lifecycle instead of using local
    `src` presence as the reveal state.
  - Avatar must match the installed React Image root prop boundary instead of
    preserving arbitrary DOM props on the wrapper.
- Current reports list Avatar live and strict:
  - official entries in comparison app: `69`;
  - live entries: `33`;
  - missing/gap entries: `36`;
  - visual states tracked: `181`;
  - visual evidence states: `49`;
  - strict pair-diff states: `32`;
  - blocked visual states: `35`;
  - missing S2 value exports: `80`;
  - solid-spectrum public value exports: `131`;
  - extra Solid value exports: `3`.
- Improvement target: close Avatar retro-audit gaps without reintroducing the
  old local initials/status-avatar abstraction.

## Source Map And Public Contract

| Layer               | Upstream files                          | Solid files                                       | Status  |
| ------------------- | --------------------------------------- | ------------------------------------------------- | ------- |
| State               | local S2 Image reducer/load lifecycle   | `src/image/index.tsx`, consumed by Avatar         | matched |
| ARIA hooks          | native image `alt`; no Avatar ARIA hook | native `img` `alt`; no Avatar ARIA hook           | matched |
| Headless components | S2 Image root boundary and native image | Solid Image root boundary and native image        | matched |
| Styled S2           | `Avatar.tsx`, `Image.tsx`               | `src/avatar/index.tsx`, `src/image/index.tsx`     | matched |
| Comparison route    | S2 docs/viewer and React S2 fixture     | demo data, controls, fixtures, visual matrix, e2e | matched |

- Public props/defaults:
  - `alt`: defaults to empty string on the nested image.
  - `src`: optional; no source keeps the image unrevealed.
  - `size`: default `24`, supports documented numeric sizes and arbitrary
    numbers.
  - `isOverBackground`: default false.
  - `slot`: default `avatar`, supports `null` for local override.
  - `styles`, `UNSAFE_className`, `UNSAFE_style`, and `ref` apply to the Image
    wrapper through shared context helpers.
  - `id`, `data-*`, ARIA labels, `hidden`, and arbitrary events are accepted by
    broad TypeScript surfaces but are not mounted through the installed React
    Image root boundary; Solid matches that runtime behavior.
- Contexts/providers:
  - `AvatarContext` is exported and consumed through the shared S2 slotted
    context helper.
  - AvatarGroup and ActionButton provide Avatar context; standalone Avatar
    evidence stays scoped to Avatar while consumer context evidence remains in
    the owning component notes.
- Refs/imperative behavior:
  - Ref merging follows the shared S2 context/local ref helper and resolves to
    the Image wrapper.
- Unsupported or intentionally different branches:
  - Legacy named sizes map to numeric values:
    `xs -> 24`, `sm -> 32`, `md -> 40`, `lg -> 56`, and `xl -> 80`.
  - Legacy `fallback` and `online` remain no-op compatibility props and do not
    render initials or status UI.
- Comparison route defaults:
  - The route mirrors the current live docs example with `alt="Avatar"` and
    `src="/fixtures/avatar/docs-avatar.png"`.
  - The fixture exists at
    `apps/comparison/public/fixtures/avatar/docs-avatar.png` as a 256x256 PNG.
  - The live prop changer reads defaults from the same modeled controls data as
    the rendered form, so the page script no longer has a separate authoritative
    Avatar default.

## Source Branch Coverage

| Layer    | Upstream branch                   | Solid owner                | Class           | Observable                                       | Status             | Evidence                           |
| -------- | --------------------------------- | -------------------------- | --------------- | ------------------------------------------------ | ------------------ | ---------------------------------- |
| Headless | image `alt` default               | Solid Image nested `img`   | semantics       | default empty `alt`, supplied alt preserved      | matched            | unit and e2e tests                 |
| Headless | Image root prop boundary          | Solid Image wrapper        | semantics/API   | `id`/`data-*`/ARIA/hidden/events not mounted     | matched            | unit test                          |
| Styled   | default slot                      | Avatar -> Image wrapper    | composition     | `slot="avatar"` by default, `slot={null}` unset  | matched            | unit and e2e tests                 |
| Styled   | root image wrapper                | S2 Avatar and Image styles | visual/layout   | flex, center alignment, radius, overflow, bg     | matched            | e2e computed contract              |
| Styled   | numeric size                      | inline Image wrapper size  | visual/layout   | width/height from `size / 16rem`                 | matched            | unit and e2e full size matrix      |
| Styled   | large-size outline width          | S2 Avatar style macro      | visual          | large avatars use the large outline-width branch | matched            | e2e over-background large state    |
| Styled   | over-background outline           | S2 Avatar style macro      | visual          | outline style/color/width                        | matched            | e2e computed contract              |
| Styled   | nested Image geometry             | Solid Image nested `img`   | visual          | display, full width/height, object fit/position  | matched            | e2e computed contract              |
| Runtime  | Image load/reveal state           | Solid Image lifecycle      | lifecycle       | native load changes wrapper class/revealed image | matched            | unit test and route wait           |
| Styled   | forced-colors environment         | generated S2 CSS           | visual/a11y     | computed contract matches React                  | matched            | e2e forced-colors environment test |
| Styled   | `AvatarContext` merge             | S2 `Avatar`                | context         | context props apply, local props/classes merge   | matched            | unit test                          |
| Compat   | legacy size/fallback/status props | S2 `Avatar` compatibility  | compatibility   | size aliases map; fallback/status do not render  | ported-differently | unit tests                         |
| Harness  | route control surface             | comparison route           | route integrity | visible labels/order/defaults and changed props  | matched            | e2e route-control test             |

## Behavior State Machine

| Input/state             | Trigger                            | React expected                                                         | Solid expected | Evidence              |
| ----------------------- | ---------------------------------- | ---------------------------------------------------------------------- | -------------- | --------------------- |
| no `src`                | mount                              | wrapper renders nested `img` no `src`; image remains unrevealed        | same           | unit test             |
| `src` supplied          | native load event                  | S2 Image moves loading -> loaded -> revealed and wrapper class changes | same           | unit test             |
| `alt` omitted           | mount                              | Avatar supplies `alt=""`; no Image missing-alt warning                 | same           | unit/source audit     |
| `size` changes          | route control/query update         | wrapper width/height update from numeric rem size                      | same           | e2e size matrix       |
| `isOverBackground` true | route control/query update         | outline branch applies; large size uses larger outline                 | same           | e2e computed contract |
| `slot={null}`           | render                             | wrapper has no slot                                                    | same           | unit test             |
| context size/style      | provider value then local override | context applies, local props win                                       | same           | unit test             |
| arbitrary root props    | render                             | Image root boundary does not mount them                                | same           | unit test             |

## Accessibility And I18n

- Native element/role:
  - Avatar renders an Image wrapper with a nested native `img`.
  - No custom role is added.
- Accessible name/description:
  - Native image `alt` carries the avatar description.
  - Default `alt=""` preserves decorative semantics when no text is supplied.
- ARIA/IDs:
  - No generated IDs.
  - No ARIA references, live regions, or hidden inputs.
  - Root ARIA labels and `hidden` are not mounted through the Image root
    boundary, matching installed React runtime.
- Keyboard/focus:
  - No focusable Avatar-owned surface, keyboard model, focus return, or
    focus-visible state.
- Form/i18n:
  - No form semantics, locale formatting, calendar/hour-cycle, direction, or
    message catalog.
- Contrast/environment:
  - Forced-colors over-background state is compared against React computed
    styles.

## Style Source-To-Computed

| Style branch                    | Upstream owner          | Solid owner              | Computed assertion                                                         |
| ------------------------------- | ----------------------- | ------------------------ | -------------------------------------------------------------------------- |
| wrapper background/overflow     | S2 `Image` wrapper      | Solid Image wrapper      | e2e contract compares background, overflow, radius, display                |
| Avatar alignment/radius/outline | S2 `Avatar` styles      | Solid Avatar style macro | e2e contract compares display, align-items, radius, outline                |
| numeric sizing                  | Avatar inline style     | Avatar inline style      | full size matrix compares width/height                                     |
| nested image geometry           | S2 `Image` image styles | Solid Image image styles | e2e contract compares display, width, height, object fit/position, opacity |
| over-background                 | S2 Avatar state         | Solid Avatar state       | small and large over-background states compare outline                     |
| forced colors                   | generated S2 CSS        | generated S2 CSS         | forced-colors emulation compares React/Solid computed contracts            |
| comparison canvas               | comparison route CSS    | same route CSS           | only supplies padding/background; it does not patch Avatar geometry        |

## Transition Plan

- Static states:
  - docs-example image surface;
  - all documented sizes;
  - small and large over-background outlines;
  - empty `src` image-unrevealed state;
  - supplied `src` image loaded/revealed state;
  - forced-colors active;
  - context-provided size/style/class.
- Interaction timelines:
  - not applicable. Avatar has no press, hover, focus, keyboard, or value
    transition semantics.
- Image lifecycle:
  - Avatar delegates to Image; native image load drives the reveal transition.
  - Avatar does not expose Image `renderError`, conditional sources, or custom
    coordinator props. Those remain Image-owned and are covered in Image notes.
- Cleanup assertions:
  - Avatar owns no timers, portals, observers, subscriptions, or global event
    listeners. Image owns coordinator registration cleanup.
- Visual-state rows changed:
  - Avatar has strict default evidence plus asserted route-control, full
    size/over-background, and forced-colors rows.

## Runtime Semantics

- Native element/role decision:
  - renders an Image wrapper with a nested native `img`.
- Accessible name/description assertions:
  - native image `alt` carries the avatar description; root ARIA labels are not
    part of the mounted S2 Avatar runtime boundary.
- ID stability and collision checks:
  - no generated IDs.
- Modality rows:
  - not applicable.
- Event pipeline and consumer handler assertions:
  - Avatar is static; arbitrary root events are not mounted through Image.
- Solid idiom regression assertions:
  - context values merge through `mergeProps`; local props override context
    values where supplied.
  - size, slot, styles, and class inputs stay as accessors.
  - Image lifecycle remains in the shared Image component rather than a local
    Avatar clone.
- Announcements:
  - not applicable.
- Portal/provider/global cleanup:
  - not applicable to Avatar; Image cleanup remains Image-owned.
- SSR/hydration note:
  - no Avatar-generated IDs; static wrapper plus Image lifecycle on the client.

## Evidence

```bash
vp test run packages/solid-spectrum/test/Avatar.test.tsx packages/solid-spectrum/test/AvatarGroup.test.tsx
vp run --filter @proyecto-viviana/solid-spectrum build
vp exec --filter @proyecto-viviana/comparison astro build
vp exec --filter @proyecto-viviana/comparison playwright test e2e/avatar-visual.spec.ts e2e/modeled-controls-contract.spec.ts --reporter=line
vp test run packages/solid-spectrum/test/regression.test.tsx -t "Regression: Avatar" -u
vp run comparison:report:gaps
vp run comparison:report:exports
vp run guard:rac-export-gap
vp run guard:rac-parity
vp run check
```

Results:

- Focused Solid Avatar/AvatarGroup tests: `11 passed`.
- Solid Spectrum build: passed.
- Comparison build: passed and generated `/components/avatar/`.
- Avatar plus modeled-controls browser contract: `35 passed`.
- Avatar regression snapshot slice: `2 passed`, `48 skipped`.
- Current gap report lists official styled entries live on both sides at `33`,
  missing/gap entries at `36`, visual states tracked at `181`, visual evidence
  states at `49`, strict pair-diff states at `32`, and blocked visual states at
  `35`.
- Current export report lists `solid-spectrum` public value exports at `131`,
  missing React S2 value exports at `80` of `208`, and extra Solid value
  exports at `3`.
- RAC export and tracked-symbol guards report no missing Solid names.
- Full repo check: passed.

## Handoff

- Current status: accepted under the current gate model.
- The route now has a project-local 256x256 PNG at
  `apps/comparison/public/fixtures/avatar/docs-avatar.png`, so the live page
  shows an image without depending on Playwright mocks.
- AvatarGroup, Button-family Avatar consumers, and Image retain their own
  independent notes; this Avatar pass only accepts standalone Avatar behavior
  plus the inherited Image branches used by Avatar.
