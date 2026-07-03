---
kind: plan
status: current
---

# Recertification Program

Status: live plan — the plan of record for parity verification.
Update when: a phase completes, a driver lands, a component certifies, or the
march order changes.

## Why this program exists

The owner found styling, animation, and behavior divergences in components
already marked `accepted`. A sampled source-level audit (2026-07) confirmed the
pattern: of 33 components diffed against the vendored pin, 31 diverged (218
verified findings, 8 blockers); of 70 behavior targets sampled, both sampled
components diverged. The conclusion is structural, not anecdotal: **the
acceptance bar exists on paper but is not mechanically enforced.** Gates were
satisfied by judgment and spot checks, and judgment drifts.

This program replaces knowledge with machinery. Nobody needs to know what is
currently wrong. The harness makes divergence surface mechanically, component
by component, and every fix lands with the test that would catch its
regression. When the march completes, "accepted" means "its suite is green,"
and it keeps meaning that on every future commit.

## Principles

1. **The oracle is live upstream, not expectations.** The comparison app mounts
   real React Spectrum S2 and our port side-by-side. Every driver runs the same
   scenario against both stacks and asserts the outputs match. No
   hand-maintained expected values; upstream updates move the bar automatically.
2. **Deterministic, not flaky.** Animations are paused and seeked, clocks are
   mocked, themes are pinned. A driver that cannot run deterministically is not
   done.
3. **Red → green per component.** A component's unit of work ends with its full
   driver suite green: divergence found → fixed to match upstream → guarded.
   Certified means correct, not inspected.
4. **Small, resumable units. No fleets.** One component (or one driver) per
   session. All state lives in this doc, the validation notes, and committed
   tests — any session can pick up the next unchecked item cold.
5. **Details don't matter up front.** Prior audit findings
   (see Calibration below) are used only to verify the drivers work — never as
   the work list.

## Phase 0 — Foundations (one-time, do first)

The oracle and the baseline must be trustworthy before anything else.

| #   | Task                                                                                                                                                                                                                                             | Exit test                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| 0.1 | Absorb S2 1.5.1 into the vendored `./react-spectrum`; bump the `guard:upstream-test-parity` pin; run the release-audit train process for the 1.5.0→1.5.1 delta                                                                                   | `vp run guard:upstream-freshness` green                                        |
| 0.2 | Upgrade `apps/comparison` installed deps to the pin (today S2 1.3.0 / RAC 1.17.0 — two trains stale). The pair oracle is invalid until this lands                                                                                                | installed versions == pin                                                      |
| 0.3 | Align `@adobe/spectrum-tokens` (installed `^14.5.0` vs vendored exact `14.0.0`); add a guard so the two cannot drift silently                                                                                                                    | new `guard:spectrum-tokens-pin` green                                          |
| 0.4 | Baseline hygiene: format the 70 drifted files; refresh the 6 stale regression snapshots; fix the real FocusManagement Escape-restore bug; fix the ActionButton label-intercepts-pointer contract failure; fix the 2 Toast playground a11y smokes | `vp run check`, `test:run`, `comparison:test:contract`, `a11y:check` all green |
| 0.5 | Close the CI-on-main hole: run `ci:release-readiness` (or a trimmed floor set) on pushes to `main`, not only PRs; include `apps/*` in typecheck scope (`tsconfig.typecheck.json` covers only packages+scripts today)                             | a main push runs build+test                                                    |
| 0.6 | Make the blocking a11y gate include axe `color-contrast` on comparison routes (currently excluded — no contrast bug can fail CI today)                                                                                                           | rule enabled, gate green                                                       |

Exit criteria: all 18 ground-truth gates green on a clean `main` (the
`certification-gates.yml` ladder — 14 steps after 0.3 added
`guard:spectrum-tokens-pin` — plus `test:run`, `a11y:check`,
`guard:upstream-test-parity`, `guard:jsx-deopt-size`), comparison app serves
the pinned upstream.

## Phase 1 — Drivers (one-time, ~one driver per session)

Shared harness modules in `apps/comparison/e2e/drivers/`, each proven on three
pilots (Button = simplest, Tabs = animation + keyboard, Dialog = overlay) before
the march starts. Each driver exposes one function a per-component spec calls
with a scenario descriptor; all assertions are pair-oracle (React output vs
Solid output).

| ID  | Driver                  | Signal compared across stacks                                                                                                                                                                                                                                   |
| --- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | State-matrix style diff | `getComputedStyle` allowlist (color, background, border, radius, outline, shadow, `font-*`, spacing, `transition-*`) per state (default/hover/focus-visible/pressed/disabled/selected/invalid/pending) × theme (light+dark) × size, states driven by real input |
| D2  | Motion                  | See breakdown below — the animation/video tier                                                                                                                                                                                                                  |
| D3  | Strict pixel diff       | `exactPairDiff` (0-mismatch) screenshots per D1 state; every loose threshold becomes a tracked waiver with a burn-down list in this doc                                                                                                                         |
| D4  | Event-sequence oracle   | Ordered log of pointerdown/up/click/focus/keydown(+defaultPrevented)/`onPress*`(+pointerType) for scripted mouse, keyboard, and touch gestures                                                                                                                  |
| D5  | Focus & keyboard trails | `document.activeElement` trail + roving tabindex + `aria-activedescendant` through Tab/Shift+Tab/arrows/Home/End/typeahead walks                                                                                                                                |
| D6  | AX tree & announcements | CDP accessibility snapshot (role/name/description/state) + MutationObserver transcript of live-region text and timing                                                                                                                                           |
| D7  | Contrast                | Computed fg/bg ratio per text node per D1 state and theme; AA asserts, AAA reported                                                                                                                                                                             |
| D8  | Target size             | Bounding box of every interactive element ≥ 24px (WCAG 2.5.8 assert), 44px (2.5.5 report), across sizes                                                                                                                                                         |
| D9  | Forced colors           | D1 re-run under `forcedColors: 'active'`, comparing resolved system-color keywords                                                                                                                                                                              |
| D10 | RTL / i18n              | D1 + D5 re-run under `dir="rtl"` + `ar-AE` locale; icon mirroring, arrow inversion, date/number formatting equality                                                                                                                                             |
| D11 | Timing                  | Tooltip warmup/cooldown, toast auto-dismiss/pause, long-press thresholds under Playwright's mocked clock                                                                                                                                                        |
| D12 | SSR / hydration         | Astro island server HTML vs hydrated DOM; stable ids, no mismatch                                                                                                                                                                                               |

### D2 Motion — the animation/video tier

Raw video cannot be asserted on (encoder jitter makes frame-exact comparison of
two `.webm` files flaky), so D2 separates assertion from review:

- **D2a Filmstrip diff (the assertion).** Trigger the transition/animation on
  both stacks, then freeze and seek it deterministically:
  `document.getAnimations({subtree:true})` → `anim.pause()` →
  `anim.currentTime = f × duration` for f ∈ {0, ¼, ½, ¾, 1} → screenshot both
  stacks at each f → strict pixel pair-diff per frame. Works for CSS
  animations, CSS transitions (trigger the state change first), and WAAPI.
  Catches trajectory divergence, not just endpoints. Frames live in
  `test-results/` (ephemeral), kilobytes each.
- **D2b Metadata diff.** For every animation found: count,
  `effect.getKeyframes()`, `getComputedTiming()` (duration, easing, delay,
  iterations) — diffed as data across stacks. Near-free; catches token-level
  motion drift (wrong duration/easing) even when frames happen to look close.
- **D2c Side-by-side video (the review medium).** Playwright `recordVideo` of
  the pair viewport during the scripted interaction. Retained **on failure
  only** (plus an opt-in `MOTION_REVIEW=1` mode that records everything for a
  human pass). Videos are CI artifacts / local `test-results/` — never
  committed to git. Storage stays ~MBs and only when something is wrong.
- **D2d Reduced-motion equivalence.** Re-run D2b under
  `reducedMotion: 'reduce'`: both stacks must drop/keep the same animations.
- Prerequisite: D2 specs run **without** `animations: 'disabled'` (every
  existing screenshot spec passes it, which is why animation parity is
  invisible to the current suite).

Exit criteria: 12 drivers landed, documented in `COMPONENT_PLAYBOOK.md`, three
pilot components fully green through all applicable drivers, and each driver
has rediscovered at least one known audit finding on its pilots (see
Calibration).

## Phase 2 — The march (per component, strict order)

One unit = one component through every applicable driver, red → green:

1. Write/extend the component's driver spec (scenario descriptors: states,
   gestures, animations, locales).
2. Run. Every red is a divergence: fix our source to match upstream (parity is
   the rule; upstream impossibility in Solid is the only exemption, documented
   in the validation note).
3. Re-run to green. Update the component's validation note gate table and the
   queue below. Commit — one commit per component, tests + fixes together.
4. Calibration check (below). If a known finding wasn't rediscovered, the
   driver has a hole — fix the driver before certifying the component.

A component that needs a structural rewrite to pass (e.g. its styling layer is
not real `style()` macro output) gets state `blocked(reason)` here plus a
tech-debt entry, and the march continues — deadlock is the only failure mode
this plan does not accept.

March order (dependency/leverage; within a tier, top to bottom):

- **Tier 1 — primitives:** Button, ToggleButton, ActionButton,
  ToggleButtonGroup, Link, Avatar, Badge, Divider, StatusLight, Meter,
  ProgressBar, ProgressCircle, Skeleton, Icon/Illustration surfaces
- **Tier 2 — form fields:** Checkbox, CheckboxGroup, RadioGroup, Switch,
  TextField, TextArea, SearchField, NumberField, Slider, RangeSlider, Form,
  FieldError/HelpText, LabeledValue
- **Tier 3 — overlays:** Tooltip, Popover, Dialog, Modal, AlertDialog, Menu,
  ActionMenu, ContextualHelp, Toast, DropZone/FileTrigger
- **Tier 4 — collections:** ListBox, GridList, TagGroup, Picker/Select,
  ComboBox, Autocomplete, Tabs, Breadcrumbs, Disclosure/Accordion, ActionBar,
  ActionGroup, Toolbar, TableView, TreeView, StepList, Virtualizer (via its
  hosts), DnD (via its hosts)
- **Tier 5 — date/time/color:** Calendar, RangeCalendar, DateField, TimeField,
  DatePicker, DateRangePicker, ColorArea/Slider/Wheel/Field/Swatch(Picker),
  ColorEditor
- **Tier 6 — custom Viviana layer:** EventCard, Chip, NavHeader, and every
  `viviana-ui/src/custom/*` surface (no upstream pair → D1/D3 pair drivers are
  out of scope; D5–D11 still apply, contrast/target-size assert against WCAG
  directly)

Interaction-hook families (press/hover, focus, keyboard/typeahead, selection,
overlay dismiss, announcer, form validation) are certified **through their host
components' D4–D6 runs**, not as separate units — a hook divergence shows up in
every host; the first host that certifies pins it.

CI integration: each certified component's suite joins a `comparison:test:certified`
job that runs on every `main` push. The certified set only grows; a certified
component can never silently regress.

## Phase 3 — Cross-cutting closers (after or interleaved late in the march)

- Full generated-CSS/tokens diff vs upstream (`style()` macro output corpus),
  as a guard.
- Idiomatic-Solid and idiomatic-Web-API lint sweep (destructured-props
  reactivity, manual DOM where Solid primitives exist, event-listener hygiene)
  — codify the findable classes as lint rules where possible.
- AAA report published from D7/D8 data (informative, not blocking).
- Burn down every D3 threshold waiver to strict.
- Retire the audit scaffolding (`audit-durable/`, session memory) once every
  finding is either fixed-and-guarded or a tracked waiver.

## Calibration — using the 2026-07 audit without depending on it

`audit-durable/` (session storage) holds ~264 adversarially verified findings
from the sampled audit (style A-batch-1 full JSON, behavior, cross-cutting).
They are **not** the work list. Their one job: when a component certifies, its
known findings must have been rediscovered by the drivers. Rediscovered →
delete from the ledger. Missed → the driver has a gap; fix the driver first.
When the ledger is empty, the machinery has provably subsumed the audit.

## Session protocol (strict)

- One unit per session (one driver in Phase 1, one component in Phase 2).
- No agent fleets. At most single sonnet helpers for mechanical generation.
- A session ends with: suite green (or `blocked(reason)` recorded), validation
  note updated, this doc's queue updated, one commit. Nothing lives only in
  chat.
- Pick order: topmost unchecked item of the lowest incomplete phase. No
  skipping except a `blocked` entry.

## Queue

Phase 0: `0.1 ☑ 0.2 ☑ 0.3 ☑ 0.4 ☑ 0.5 ☑ 0.6 ☑` — **Phase 0 complete**

- 0.1 done 2026-07-03: oracle at s2 1.5.1 (Train 7 = T-60, closed on arrival —
  see `upstream-release-audit.md`); `guard:upstream-freshness` green.
- 0.2 done 2026-07-03: `apps/comparison` pins exact s2 1.5.1 / RAC 1.19.0 /
  react-aria 3.50.0 / react-stately 3.48.0 (react-aria 3.50 is upstream's
  consolidated single package — no separate `@react-aria/*` installs). The
  fresh oracle immediately exposed one real divergence — ActionButton /
  ToggleButton static-color text color — fixed to upstream's
  `transparent-overlay-1000`. Build + contract suite green except 0.4's known
  ActionButton pointer red; `source-index.md` authority paths repointed at the
  vendored pin.

- 0.3 done 2026-07-03: `@adobe/spectrum-tokens` pinned exact `14.0.0` in
  solid-spectrum — the version the pinned S2 builds against. The old `^14.5.0`
  range had drifted five minors ahead of the oracle (357 used token values
  differed; all 158 token names we consume exist in 14.0.0, so no code
  changes). New `guard:spectrum-tokens-pin` (script + `certification-gates.yml`
  row) fails on any declared/installed/oracle version mismatch or a non-exact
  spec. Suite green except 0.4's known six snapshots.

- 0.4 done 2026-07-03: baseline green — `vp run check`, `test:run` (5504
  passed), `comparison:test:contract` (84/84), `a11y:check` (smoke 44/44).
  Format sweep + 6 snapshot refreshes, plus four real fixes:
  - FocusManagement Escape-restore: `createSelectState` shared the selection
    manager's focus signal with the trigger, so trigger focus re-armed the
    item roving-focus effect and stole focus back. Upstream keeps them apart —
    trigger focus is now its own signal; listbox/option focus routes through
    `selectionManager`; `createSelect` gains upstream's focus/blur ordering,
    the isOpen blur guard, and menu-level onBlur.
  - ActionButton contract red was the spec, not the component: Playwright has
    no label-association allowance in its hit-target check, so `.check()` on a
    label-wrapped visually-hidden input can never pass — even against upstream
    RAC's own DOM (ours is byte-faithful). New `checkControl` helper clicks
    the wrapping label like a user. Remaining `input.check()` call sites live
    in visual specs outside the contract gate; sweep them as Phase 2 reaches
    those components.
  - Toast smokes: the playground passed `placement="bottom-end"` — S2's
    `ToastPlacement` is space-separated only, and the unmatched macro variant
    left the fixed region at its static position below the page (unreachable).
    App fixed to `"bottom end"`; component verified faithful (the headless
    layer's hyphen normalization is intentional and separate). Second smoke
    expected a "Close" button — upstream labels it "Dismiss"
    (`dialog.dismiss`); spec fixed.
  - Surfaced for 0.5: `apps/*` are never typechecked
    (`tsconfig.typecheck.json` includes only `packages/*/src`,
    `packages/*/test-utils`, `scripts`), which is why the invalid placement
    literal — a genuine TS error against `ToastPlacement` — never failed a
    gate.

- 0.6 done 2026-07-03: axe `color-contrast` now always on in the blocking
  comparison gate (`comparison-axe.spec.ts` no longer gates it behind
  `AXE_INCLUDE_CONTRAST`; the env knob is gone there and `a11y:full` dropped
  the now-meaningless prefix). A full 69-route sweep with contrast enabled
  found ZERO panel-scoped violations — both component stacks were already
  contrast-clean — and exactly two app-chrome bugs, both fixed:
  - Chrome styles wrote `color:` before the `font:` shorthand. The S2 macro
    expands `font` to include an implied `color` ('body' for ui fonts) and
    later object keys win, so every such explicit color was dead. The brand
    mark's dead `white` rendered as body gray-800 (#dbdbdb) on informative
    blue = 3.25:1. Reordered all 16 blocks in
    `apps/comparison/.../chrome/styles.ts` (font first, color after —
    upstream S2's own convention). Same latent pattern exists at 4 sites in
    the port (table/gridlist/tag-group/tree empty states) — dead code, zero
    render change; left for those components' Phase 2 march since the
    faithful fix needs a per-site upstream diff (upstream TableView styles no
    color/font on its wrapper at all; TagGroup uses `font: 'ui'` only).
  - Shiki `github-dark` comment gray #6A737D on #24292E = 3.04:1 in docs code
    blocks; overridden in `global.css` to GitHub's current dark comment gray
    #8b949e (4.76:1).
    Exit test met: rule enabled, gate green (71/71 routes, full-page + both
    panels).

- 0.5 done 2026-07-03: CI-on-main hole closed. `release-readiness.yml` now
  triggers on pushes to `main` as well as PRs (concurrency-cancelled per ref),
  and `ci:release-readiness` runs the new root `typecheck:apps` (apps/web
  `tsc --noEmit` + apps/comparison `astro check`) between build and tests;
  stale `typecheck:web` removed, `typecheck:all` = build + apps. Making
  apps/web typecheck was the bulk: 54 errors → 0, almost all app-side invented
  API fixed to real S2 API (stale Button props, invented Tabs
  `variant`/`size` → `density`/`orientation`, invented SearchField
  `hideSearchIcon`, DropZone `class`/`isDisabled` misuse →
  `UNSAFE_className`/headless DropZone, 0.4's `"bottom-end"` literal also in
  docs pages) plus `TreeItemData` optional-field strictness (non-null
  assertions where the page builds complete items). `apps/comparison` needed
  `@types/react`/`@types/react-dom` declared as devDependencies — already in
  the store via `@astrojs/react`, resolution-only. Root `check` stays
  packages-fast; apps coverage rides CI.

Phase 1: `D1 ☑ D2 ☐ D3 ☑ D4 ☑ D5 ☑ D6 ☐ D7 ☐ D8 ☐ D9 ☐ D10 ☐ D11 ☐ D12 ☐`

- D1 done 2026-07-03: state-matrix computed-style pair diff landed as the
  shared walk harness (`apps/comparison/e2e/drivers/scenario.ts` + `walk.ts` +
  `state-matrix.ts`) plus per-pilot specs in `apps/comparison/e2e/certified/`
  (`test:certified` in the app, `comparison:test:certified` at the root — an
  on-demand march gate, intentionally allowed red while findings burn down).
  The walk is panel-major with a fresh load per panel (input modality resets,
  so focus-visible drives identically), states run in canonical order
  (focus-visible before any pointer event), and each state awaits a readiness
  data-attribute before capture. Calibration met — the driver rediscovered
  known findings and caught new ones:
  - Button: 10/10 green (all states × themes).
  - Tabs: red at `default` on every case — tab items miss upstream's
    icon/text `gap` (React computes 5.99999px, ours `normal`). Sole surviving
    red; the driver's focus-visible states went green after the tabs parity
    fix below.
  - Dialog: red twice — (a) modal surface styling diverges at the surface
    element, (b) our `CloseButton` is a raw `<button onClick>` while upstream
    S2's is a full RAC Button (focus ring, hover/pressed styling, pressScale,
    localized label); it renders no interaction data-attributes so the walk
    can't even drive focus-visible on it.
  - Driving the pilots also exposed a real Tabs behavior divergence fixed in
    the same unit (jsdom-confirmed, then browser-verified): the state layer
    invented selection-follows-focus in `setFocusedKey` (upstream's automatic
    activation lives only in the keyboard-nav path of the aria layer), tabs
    never chained `onBlur` so the DOM-focus ring stuck, roving tabIndex
    followed selectedKey instead of focusedKey, and the tab list wired React's
    bubbling focus semantics onto Solid's non-bubbling `onFocus` (now
    `onFocusIn`/`onFocusOut` per the spine convention). The invented tablist
    `data-focused`/`data-focus-visible` + focus ring were removed — upstream
    RAC TabList renders neither (its render props are only
    `{orientation, state}`; root-level `useFocusRing({within: true})` +
    `data-focused` live on upstream's Tabs root, which ours still lacks —
    Phase 2 Tabs item).
    Pilot findings queue (burn down before D3, which pixel-diffs the same
    states): ~~Tabs gap~~ (resolved 2026-07-03, certified tabs 6/6 green),
    ~~Dialog surface~~, ~~Dialog CloseButton~~ (both resolved 2026-07-03,
    certified dialog green — queue empty, D3 unblocked).
  - Dialog surface resolution (2026-07-03): the modal chain now mirrors
    upstream Modal.tsx — overlay (`isolation`, `transparent-black-500`) →
    full-viewport wrapper div (`container-type: size`, alignItems flips to
    `start` for fullscreenTakeover, pointerEvents none so outside-click
    dismissal still reaches the overlay) → the RAC modal carrying upstream's
    RACModal styles (size-keyed width/height, `--s2-container-bg: layer-2`,
    transparent WHCM outline); the invented `dialogSurface`/host div pair is
    gone, and dialogInner/customDialog/dialogContent were realigned to
    upstream Dialog.tsx (borderRadius inherit, `font: body` on content,
    responsive customDialog padding). Known residuals, each deferred with a
    tracked home: entering/exiting motion flips land with D2 (CP7);
    FullscreenDialog still uses the shared `dialogInner` rather than
    upstream's fullscreen variant; `dialogFooterWrapper`'s invented borderTop
    stays pending a design read; upstream's content `flexShrink` @container
    rules were dropped (our wrapper is the size container, needs a follow-up
    read); `data-size` attributes wait for D6.
  - Dialog CloseButton resolution (2026-07-03): rebuilt as a real RAC Button
    (upstream CloseButton.tsx) — HeadlessButton + focusRing/staticColor/
    controlSize macros, hover/pressed/focus-visible backgrounds, pressScale,
    disabled + forcedColors icon colors, and the localized "Dismiss" label via
    `createStringFormatter(s2IntlStrings)`; Dialog provides it through a
    ButtonContext `close` slot like upstream, so the walk can drive its
    focus-visible/hover/pressed states.
  - Sweep fallout worth recording (2026-07-03): the D1 burn-down exposed that
    73 `useRenderProps` call sites across 37 solidaria-components files read
    `children:` eagerly in the opts literal — instantiating static JSX
    children during the component body, before the component's own context
    providers mount (SearchField crashed on plain static children; TabSwitch's
    single-select ToggleButtonGroup silently lost its radiogroup/radio
    semantics). All 73 sites now forward a lazy `get children()`, and shared
    `renderChildren` classifies render props by arity (`length > 0`) — a
    zero-arg function child is an accessor (compiled `{expression}` child,
    solid-refresh dev wrapper, one-shot `solid-js/h` element thunk) and is
    returned raw for the insert machinery to unwrap in its own nested effect,
    keeping child ownership out of the shared insertion effect (the h zombie
    class documented above). Regression coverage: SearchField static-children
    test, Switch radiogroup tests, Select h-composition tests.
  - Tabs gap resolution (2026-07-03) bundled four fixes in one unit: the
    icon/text `gap` moved onto the tab style itself (invented `tabContent`
    wrapper span + its style deleted, stray `outlineStyle` keys removed);
    selection now fires on press start for mouse/keyboard like upstream
    `useTabs`; and the comparison app's `hc()` wrapper was rewritten to fix a
    zombie-DOM freeze inherent to bare `solid-js/h`: h's one-shot component
    thunks are unwrapped inside a shared array insert effect, so the scope
    that creates sibling components also tracks their returned accessors —
    TabPanel's root `Show` flip re-ran the effect, disposed the TabList
    subtree, and the one-shot thunks handed back the same dead nodes
    (attributes frozen while still connected). `hc` now mirrors compiled-JSX
    semantics (`createComponent` + lazy children getter; hc component
    children instantiate eagerly, plain function children memo-wrap), keeping
    creation one owner level above the accessor-reading effect. Permanent
    regression coverage in `packages/solid-spectrum/test/TabsFixtureRepro.test.tsx`
    (bare-h wiring kept as `it.fails` documenting the upstream limitation).

- D3 done 2026-07-03: strict pixel pair diff landed
  (`apps/comparison/e2e/drivers/pixel.ts`), riding `walkScenario` so every
  D1 case × theme × gesture state is also pixel-compared. Policy: exact
  match (zero tolerance); the only escape is an explicit `PixelWaiver`
  citing a tracked burn-down entry here. Suite is 20/20 green (Button 10,
  Dialog 4, Tabs 6) with **zero waivers**.
  - Capture technique: `clonedElementScreenshot` clones the pixel target
    into a `popover="manual"` frame and shows it via `showPopover()` — the
    top layer paints above every z-index/stacking context (the comparison
    frame's `isolation: isolate` and the topbar's `z-index: 50` polluted
    naive element screenshots), is viewport-anchored for stable clipping,
    and has no focus/inert side effects, so gesture states survive capture.
  - Calibration caught two real classes of divergence:
    1. ui-icons rendered from the wrong ground truth. First, every ui-icon
       went through `createIcon`'s `size: 20` base (Dialog close cross drew
       20×20; 180px diff) — split into `createUIIcon`, which carries no
       size: the per-variant width/height attributes are the faithful size
       source. The residual 18px was **SVGO dist-vs-source divergence**:
       upstream's Parcel build runs SVGO over the ui-icon assets, so the
       shipped paths (3-decimal precision, elliptical-arc corner rounding)
       rasterize differently from the raw vendored `.svg` sources
       (full-precision cubic beziers) at glyph tips. Pixel parity requires
       regenerating from the shipped dist
       (`@react-spectrum/s2/dist/private/S2_*.mjs`) — 44/47 variants
       regenerated (a4af8519); Arrow ×2 + Gripper ×1 are tree-shaken out of
       the dist and stay on the vendored sources. Rule for future icon
       work: **the shipped dist, not the vendored source, is the pixel
       oracle** whenever upstream's build pipeline transforms assets.
    2. Invented Tabs styles. Root `tabsRoot` carried invented
       `color`/`minWidth`/`minHeight`/`opacity isDisabled: 0.6` (the
       opacity double-dimmed disabled-all: 3071px diff); the tab style
       carried invented `minWidth`/`paddingY`/`borderStyle`/`userSelect`/
       `whiteSpace`/`forcedColorAdjust`/root `--iconPrimary`; and the label
       span carried an invented `truncate` whose `overflow: hidden` clipped
       the final glyph's antialiased column on every tab label (the last
       11–13px). All removed to match upstream S2 Tabs.tsx (fddc1407,
       af925990); per-tab disabled color threading was verified already
       faithful (`createTabListState.isKeyDisabled` disables all keys when
       the root is disabled, exactly like upstream TabList's
       `allKeysDisabled`).
  - Deferred with a tracked home: upstream `tabs`/`tab` take
    `getAllowedOverrides()` (ours still funnels `styles` through
    `mergeStyles`) — Phase 2 Tabs item alongside the root
    `useFocusRing({within: true})` gap noted under D1.

- D4 + D5 done 2026-07-03: both drivers landed, proven on Button, and
  calibrated. Pilot status: **17 D4+D5 cases → 13 green, 4 red.** D5 fully
  green (Button + Tabs + Dialog). D4 green except 4 cases that all fail on one
  characterized, deferred root cause (the event-ordering epic below). Every
  real port defect the drivers surfaced this session is fixed; the 4 reds are
  a scheduling-model difference, not a driver bug. Detail:
  - Landed infrastructure (all committed):
    - Fixture side: `apps/comparison/src/data/event-log.ts` re-emits component
      callbacks (`onPress*`, `onSelectionChange`, `onOpenChange`) as bubbling
      `comparison:callback` CustomEvents so they interleave exactly with
      native events in the recorded log; wired into Button/Tabs/Dialog demos
      in both `react/fixtures/styled.js` and `solid/fixtures/styled.tsx`.
    - `e2e/drivers/dom-oracle.ts`: in-page `window.__comparisonOracle`
      (installed per panel via `page.evaluate`, not `addInitScript`) —
      document-level capture recorder + focus snapshots. Descriptors are
      stack-agnostic (tag/role/name, never ids or `data-*`); targets classify
      as panel/overlay/page/detached/outside with outside collapsed to a
      sentinel. Entries serialize at dispatch time; only `defaultPrevented`
      is re-read at flush (bubble-phase preventDefault). The `detached` scope
      is deliberate signal: a stack that recreates DOM mid-gesture shows up
      there.
    - `e2e/drivers/events.ts` (D4): `registerEventSequenceDriver` +
      `standardPressGestures` (mouse-click / keyboard-enter / keyboard-space /
      touch-tap). Gestures use raw coordinates + protocol focus so disabled
      targets can be driven; describe-level `test.use({hasTouch: true})`.
    - `e2e/drivers/focus.ts` (D5): `registerFocusTrailDriver` — focus start,
      press key sequence, snapshot activeElement descriptor + resolved
      `aria-activedescendant` + full roving `[tabindex]` layout after each key.
    - `walk.ts` gained `forEachScenarioPanel` (shared panel loop);
      `scenario.ts` gained `events:`/`focus:` config + `driverCases`.
    - Specs wired: Button (D4 accent-fill+disabled × 4 gestures, D5
      tab-cycle), Tabs (D4 mouse/touch/arrow, D5 arrow-roving), Dialog (D4
      close-button mouse+escape, D4-only trigger scenario recording the full
      open→escape→close cycle, D5 trap-cycle).
  - Findings the pilots surfaced, and their resolution:
    1. **Dialog element** — DONE. Upstream RAC renders `<section
       role="dialog">`; ours rendered `<div>`. Fixed in
       `solidaria-components/src/Dialog.tsx`, e2e-confirmed after rebuild.
    2. **Tab DOM recreation → synthetic untrusted click** — DONE (commit
       `aab498f6`). Selecting a tab in Solid re-invoked the render-prop child
       on the `isPressed` flip, recreating the Tab label span mid-press;
       Chrome suppresses the native `click` when the `mousedown` target is
       detached, so `createPress`'s fallback synthesised an untrusted click
       and a late `focusin`. Fix = additive `renderChildrenStable()` in
       `solidaria-components/src/utils.tsx` (call the render-prop child ONCE
       over a reactive getter-view instead of re-invoking it on every state
       flip) + `Tabs.tsx` TabInner uses it. Resolves the old findings 3 and 4
       (press-start focus ordering) together; Tabs mouse-click D4 now green.
    3. **createPress 80 ms fallback is FAITHFUL, not an invention** —
       CORRECTED. Earlier notes framed `createPress.ts` 379–395 as an
       invented synthetic-click path; it is a line-for-line port of upstream
       `react-aria@3.50 usePress.ts` (`onPointerUp` → 80 ms `setTimeout` →
       `clicked ? cancel : focusWithoutScrolling+click`, same issue links,
       same capturing click listener). It only *fired* here because finding 2
       detached the target; with 2 fixed it no longer fires. One genuine
       fidelity gap fixed while confirming this: the fallback used plain
       `.focus()`; upstream uses `focusWithoutScrolling` — now matched.
    4. **Modal background not `inert`** — DONE. `Modal.tsx:460` called
       `ariaHideOutside([modalRef])`; upstream `react-aria@3.50
       useModalOverlay` passes `{ shouldUseInert: true }` (our
       `ariaHideOutside` already supported it, and `createPopover` already
       passed it). Without it the modal only set `aria-hidden` on the
       background, leaving it in the tab order; D5's focus-trail snapshot saw
       Tab escape to the page-nav `<a>` links. Fixed → Solid now marks the
       same 7 background containers `inert` as React, D5 trap-cycle green.
       (ComboBox intentionally omits `shouldUseInert`, matching upstream — it
       is non-modal.)
    5. **D5 oracle over-counted hidden `[tabindex]`** — DONE (driver
       calibration). `dom-oracle.ts snapshotFocus()` queried raw
       `[tabindex]`, so it counted elements a keyboard user can never reach
       (e.g. the Tabs overflow picker `<select>`/`<button>` that stays
       CSS-hidden until collapse). Now filtered by `Element.checkVisibility`
       + inert-ancestor check, so the roving snapshot reflects the real tab
       order. Fixed the false Tabs D5 divergence.
  - Open items handed forward:
    - **D4 event-ordering epic (deferred — the 4 remaining reds).** All four
      (Tabs touch-tap, Tabs arrow-next-from-selected, Dialog escape-close,
      Dialog open-escape-close) fail on ONE root cause: React Aria fires
      state-change callbacks (`onSelectionChange`, `onOpenChange`) and moves
      focus through React's batched render + post-commit effects, which run
      *after* the triggering native event finishes dispatching; our Solid
      port runs those synchronously inside the event handler (Solid reactive
      updates are synchronous). So the callback and the focus `focusout`/
      `focusin` interleave differently with `keydown`/`keyup` — e.g. Solid's
      `onOpenChange(false)` + `focusout` land before `keyup`, React's after.
      End state is identical; only the intra-gesture ordering differs. Two
      candidate resolutions, both non-trivial and NOT to be rushed into the
      selection/overlay machinery (it is green on units + D1 + D3): (a) defer
      Solid callback dispatch + focus movement to a post-event microtask to
      match React's timing, or (b) decide bit-exact native/callback ordering
      is over-strict and normalise batching-artifact ordering in the D4
      oracle. Pick during the Tabs/Dialog Phase-2 march.
    - **Tabs always renders the overflow picker (Phase 2, Tabs).** Upstream
      S2 `Tabs` renders the collapse `Picker` only when collapsed (`if
      (showItems) <RACTabs> else <picker>`); overflow is measured via an
      `inert`+`visibility:hidden` `HiddenTabs` container of plain divs. Ours
      always renders `TabsMenu` (`<select>` + `<button>Project tabs</button>`)
      and CSS-hides it (`solid-spectrum/src/tabs/index.tsx:813`). Not a
      runtime a11y bug (hidden → not focusable, and D5 now filters it), but a
      real DOM divergence — gate `TabsMenu` behind `<Show when={!showTabs()}>`
      when the Tabs component is certified.
  - Driver gotchas already burned in: `error-context.md` in test-results is
    just a page snapshot — rerun the single test to capture the JSON diff;
    e2e is NOT covered by `astro check` (tsconfig includes src only) — use
    the standalone tsc line in the session log or add an e2e tsconfig later.

Phase 2: not started — march order above is the queue; mark components here as
`✓ name (date)` when certified, `blocked: name (reason)` otherwise.
Phase 3: not started.
