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

Phase 1: `D1 ☑ D2 ☑ D3 ☑ D4 ☑ D5 ☑ D6 ☑ D7 ☑ D8 ☑ D9 ☐ D10 ☐ D11 ☐ D12 ☐`

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
    tracked home: ~~entering/exiting motion flips~~ (landed with D2 2026-07-03 —
    see the D2 entry below; overlay/modal enter+exit transitions now match);
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

- D2 done 2026-07-03: motion driver landed (`apps/comparison/e2e/drivers/motion.ts`
  + the `motion` config on `DriverScenario`). Tiers: D2a filmstrip (diagnostic,
  behind `MOTION_FILMSTRIP=1`), D2b metadata (the exact pair-oracle gate —
  per-animation count/keyframes/computed-timing diffed as JSON via the
  `snapshotAnimations` oracle), D2c side-by-side video (opt-in `MOTION_REVIEW=1`,
  config-level `video`, never committed), D2d reduced-motion (re-run D2b under
  `reducedMotion: 'reduce'`). Capture rides a page-side rAF "freezer" that pauses
  every in-scope animation each frame — started **before** the Node-side trigger,
  so a one-shot enter transition is caught + paused on its first frame;
  `stopAnimationFreezer` **resumes** the paused animations (else upstream's
  `useExitAnimation` hangs awaiting `getAnimations().map(a => a.finished)`).
  Animations are bucketed by `classify()` scope (panel/overlay/page/detached/
  outside); portal overlays (Dialog) capture `overlay` only so the trigger
  control's own press transitions never leak in. Calibration — the driver
  rediscovered a real port gap and its pilot fix went red→green:
  - Button: green (D2b + D2d) — motion-token-free positive control.
  - Dialog: red→green. **Finding (fixed 2026-07-03):** the enter transition
    never ran. Upstream RAC Modal drives `data-entering`/`data-exiting` via
    `useEnterAnimation`/`useExitAnimation`; our `Modal.tsx` accepted
    `isEntering`/`isExiting` as props but never computed them, and S2's
    `dialogOverlay`/`dialogModal` styles had dropped the motion tokens and pinned
    the class as a static string (so render-prop conditions never reached the
    macro). Faithful fix: a new shared primitive
    `packages/solidaria/src/utils/animation.ts`
    (`createEnterAnimation`/`createExitAnimation`) — a SolidJS port of
    react-aria's `animation.ts` (mirrors upstream's shared util), with
    signal-backed ref accessors so the effect re-runs when the element mounts and
    `isReady = isOpen` so the enter state doesn't resolve before the always-mounted
    Solid overlay's element exists. `Modal.tsx` now wires overlay-enter/
    overlay-exit/modal-exit on the overlay and modal-enter on the content (combined
    exit flag threaded through `InternalModalContext`), and `Dialog.tsx` restores
    the exact S2 tokens (overlay: opacity {isEntering/isExiting:0} + transition
    opacity, dur {250, exit 130}; modal: opacity + translateY {isEntering:20} +
    transition [opacity, translate], dur {250, exit 130}, delay {160, exit 0})
    applied as render-prop functions. Solid now emits the three confirmed React
    enter transitions (overlay opacity 0→1 dur 250 delay 0; modal opacity 0→1 dur
    250 delay 160; modal translate 20px→0 dur 250 delay 160) — D2b + D2d green.
    No-regression check: the exit animation now delays FocusScope unmount, so the
    full Dialog certified suite (D1/D3/D4/D5 + D2) was re-run — 12 green, and the
    only reds are the two **pre-existing** D4 event-ordering epic cases
    (escape-close, open-escape-close; same 12-pass count as the pre-D2 baseline).
    Their event-log diff is identical membership (one each of keydown/callback/
    keyup/focusout/focusin), only intra-gesture ordering + DOM-state-at-scope-
    classification differ — the documented D4 epic, not a D2 regression.
  - Tabs: two tracked findings keep the exact metadata red; registered as a
    documented `knownDivergence` (the trigger renders `test.fixme` in D2b/D2d, so
    the suite is green with the gap visible in reports, not silently passing).
    Deferred to CP9 (Tier-1 march) as SharedElement-wide changes:
    - **T-A — SelectionIndicator never FLIPs.** Upstream animates the indicator
      `translate` (-86px→none) + `width` (54px→100%), both 200ms
      `cubic-bezier(0,0,0.4,1)`; the port emits neither. Root cause: our faithful
      `SharedElement` port (`solidaria-components/src/SharedElementTransition.tsx`)
      stores its geometry snapshot in a **component-disposal** `onCleanup`, but
      per-tab indicators are never disposed on selection change — only their
      `isVisible` flips — so no snapshot is captured and the FLIP restore never
      runs. React stores the snapshot in the **return of a layout effect keyed on
      `isVisible`**, and its commit runs **all** effect destroys (snapshot stores)
      before **all** effect creates (FLIP reads) — a two-phase guarantee Solid's
      `createEffect` batch does not give (naively moving the cleanup inside the
      effect makes the FLIP direction-dependent). Faithful fix = split a
      store-phase (`createRenderEffect`/`createComputed`, runs before user
      effects) from the FLIP-read `createEffect`; affects every SharedElement
      consumer, so it needs its own verified unit.
    - **T-B — phantom color transitions from the hidden measurement list.** On
      selection change the port emits `color` transitions on **two** elements per
      changed tab (the `role=tab` div **and** an `aria-hidden role=null` div),
      upstream on one. The extra element is the always-rendered hidden
      overflow-measurement `TabList` (`hiddenTabListFrame`, `aria-hidden` + `inert`),
      whose `measurementTabClass` applies the full `tab` style including
      `transition: default`, so the measurement copies cross-fade color in lockstep
      with the real tabs. The color timing itself matches exactly (150ms,
      `cubic-bezier(0.45,0,0.4,1)`). A facet of the tracked "Tabs always renders the
      overflow picker" gate; fix = strip `transition` from measurement copies (or
      gate the hidden list) when the overflow machinery is corrected.

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

- D6 done 2026-07-03: AX-tree + announcements driver landed
  (`apps/comparison/e2e/drivers/ax.ts` + the `ax` config on `DriverScenario`,
  backed by the oracle's new `startAnnouncements`/`flushAnnouncements`
  MutationObserver transcript in `dom-oracle.ts`). Two exact pair-oracle halves:
  - **AX tree (resting structure).** Per configured root, Playwright 1.58's
    `locator.ariaSnapshot()` yields the Chromium accessibility tree as stable
    YAML (roles + accessible names + bracketed states `[checked]`/`[expanded]`/
    `[disabled]`/`[level=N]`/`[selected]`). `ariaSnapshot` drops the accessible
    *description* (spec line 81), so a second `evaluate` pass captures
    `{role, name, description}` for every element carrying
    `aria-describedby`/`aria-description`, sorted for order-stability. Both
    diffed as JSON. (Note: 1.58 removed `page.accessibility.snapshot`;
    `ariaSnapshot` is the successor, natively locator-scoped so overlays snapshot
    from their portal root.)
  - **Announcements (live transcript).** Each `announce` trigger scripts an
    interaction expected to speak; the oracle's `document.body` MutationObserver
    records the ordered live-region transcript (text + politeness + role +
    scope) on each panel, diffed text-for-text. Insertion `atMs` is stripped
    (stack-dependent — the announcer's lazy 100ms first-announce delay lands on
    different frames), the same way D2 excludes hashed keyframe names. No pilot
    exercises an announcement yet (Button/Tabs/Dialog are silent); the half is
    calibrated by ComboBox/Toast in the march.
  - Semantics are theme-independent, so D6 runs the first scenario theme only.
  - Calibration — the AX-tree half went red on Dialog with a real, newly
    discovered port a11y gap (meeting the "≥1 finding on pilots" bar):
    - Button: green (2/2) — role "button", name "Save", `[disabled]` on the
      disabled case.
    - Tabs: green (1/1) — tablist + tabs with `[selected]` on the active tab +
      the active tabpanel; the `aria-hidden`+`inert` overflow-measurement list
      is excluded from the AX tree by construction, so D6 confirms it does not
      leak a phantom node (the T-B facet stays invisible here, as intended).
    - Dialog: red → registered as a tracked `knownDivergence` (`test.fixme`,
      visible in reports, excluded from pass/fail — same mechanism as Tabs D2
      T-A/T-B). **Finding T-C (deferred to CP9, Tier-1 Icon surfaces):** the
      dialog CloseButton's Cross ui-icon is absent from the port's AX tree
      (`button "Dismiss"` exposes no child) while upstream exposes it as an
      unnamed `img` (`button "Dismiss": - img`). Two self-inflicted layers hide
      it: (1) `packages/solid-spectrum/src/dialog/Dialog.tsx` passes an explicit
      `aria-hidden="true"` to `<CrossIcon>` (upstream `CloseButton.tsx` passes no
      aria props); (2) more fundamentally, the port collapsed S2's **two** icon
      families into one factory — `createUIIcon` and `createIcon` both delegate
      to shared `createIconForBase`, which forces `role="img"` + auto
      `aria-hidden` on any **unlabeled** icon. That is correct for workflow/
      spectrum icons (upstream `Icon.tsx` `createIcon` does auto-hide unlabeled),
      but wrong for ui-icons: upstream ships ui-icons (Cross, Chevron, Checkmark)
      as **raw bare `<svg>`** pass-throughs with no role/no aria-hidden
      (confirmed against `s2/dist/private/S2_CrossSize400.mjs`), which Chromium
      surfaces as an unnamed `img`. Faithful fix = the `createUIIcon` path
      renders bare (no forced `role="img"`, no auto `aria-hidden`) for unlabeled
      ui-icons + drop Dialog's explicit `aria-hidden`. This also **avoids** an
      axe `svg-img-alt` regression (that rule targets `svg[role=img]` without an
      accessible name; a bare role-less `<svg>` is not flagged, but keeping
      `role="img"` unlabeled would be). Deferred, not fixed here, because it is a
      global factory change: the blast radius spans existing green visual specs
      that assert the port's *current* auto-hide — `accordion-visual.spec.ts:97`
      + `disclosure-visual.spec.ts:98` (`querySelector('svg[aria-hidden="true"]')`
      on the chevron ui-icon), `statuslight-visual.spec.ts:50`,
      `inline-alert-visual.spec.ts`, plus `[role="img"]` queries in
      colorswatch/colorswatchpicker specs and the `Icon.test.tsx` unit test —
      each needs per-component re-baselining against upstream, which is the
      Tier-1 "Icon/Illustration surfaces" march unit, not driver-landing work.
  - Driver mechanics: the AX config exposes `roots` (default `{panel: canvas}`;
    overlays point at their portal), `announce` triggers, `cases`, and a
    case-level `knownDivergences` map (case id → reason) that registers that
    case as `test.fixme` — the exact analogue of `MotionTrigger.knownDivergence`
    for the AX-tree half. Typecheck clean via the same standalone
    `tsc -p <scratchpad tsconfig>` line (e2e still outside `astro check`).
    Suite: 3 passed (Button ×2, Tabs ×1), 1 tracked-fixme (Dialog modal-open).

- D7 + D8 done 2026-07-03 (CP8): the two cheap derived drivers landed together
  (`apps/comparison/e2e/drivers/contrast.ts`, `target-size.ts`, + `contrast`/
  `targetSize` configs on `DriverScenario`). Both ride the existing walk engine
  and are pair-oracle first: the hard gate is byte-identical JSON of the port vs
  upstream capture; the WCAG floors are **reported** (via `testInfo.annotations`),
  not hard-failed, for paired components — a shared floor miss is an upstream
  note, and a port-only regression is already caught by the pair diff. An
  absolute WCAG assert is reserved for Tier-6 custom surfaces with no upstream
  pair, gated behind the opt-in `assertAA` (D7) / `assert24` (D8) flags.
  - **D7 contrast.** `captureContrast(root)` walks every text-bearing element,
    composites the effective background up the ancestor chain via the alpha
    `over` operator (bailing to `ratio: null` if any layer paints a
    `background-image`, which a numeric ratio can't model), computes the WCAG
    contrast ratio of the composited fg over bg, and classifies large text
    (≥24px, or ≥18.66px & weight ≥700) for the 3.0 vs 4.5 AA floor. Rides
    `walkScenario` per case × theme × gesture-state; asserts ≥1 text node
    measured (guards a bad root resolver) and diffs the full entry list per
    state. Pilots: Button (accent-fill/primary-outline/disabled — white-on-accent
    is the opaque positive control), Tabs (selected vs unselected label tokens +
    panel body), Dialog (heading/body/action labels on `layer-2`). All green,
    both themes: the port and upstream share color tokens, so every ratio matches
    to 2dp — the positive control D7 is meant to be. No pilot text dropped below
    AA (disabled labels clear it), so the sub-AA annotation path stays quiet here;
    it is exercised for real in the march (low-emphasis/quiet surfaces).
  - **D8 target size.** `captureTargetSizes(root)` measures the border-box of
    every interactive element (`button`, `a[href]`, form controls, and the
    ARIA widget roles) that passes `checkVisibility`, rounds to 2dp, and sorts by
    descriptor. Uses `forEachScenarioPanel` (default state, first theme — hit
    boxes are state/theme-invariant). Reports the 24px (2.5.8) and 44px (2.5.5)
    floors. Pilots: Button (M/S/disabled), Tabs (regular/compact density —
    confirms the CSS-hidden overflow picker contributes no phantom target), Dialog
    (CloseButton + the injected dismiss sentinel + footer actions). All green.
  - Calibration — **D8 rediscovered a real port defect on the Dialog pilot and
    it was fixed here** (meeting the "≥1 finding on pilots" bar; unlike the D2/D6
    findings this one's blast radius was small enough to fix in-checkpoint rather
    than defer). RAC's `Modal` injects a screen-reader **dismiss sentinel**
    (`tabindex=-1`, `aria-label="Dismiss"`, no visible content) so VoiceOver users
    can dismiss. Upstream renders it faithfully to `react-aria`'s `DismissButton`:
    a `<VisuallyHidden>` **`div` wrapper** (carrying the full clip/offscreen
    reset) around a *bare* `<button style={{width:1,height:1}}>` — the button
    keeps its intrinsic UA border-box (~16×6) but is clipped invisible by the
    wrapper. The port instead **inlined** the whole visually-hidden reset
    (`position:absolute; padding:0; border:0; overflow:hidden; clip:…`) directly
    onto the button, collapsing it to a strict **1×1** box. Both are invisible to
    sighted users, but D8 measured the divergence (React 16×6 vs Solid 1×1) as a
    pair-oracle red. Fix (`packages/solidaria-components/src/Modal.tsx`): wrap the
    sentinel in the port's existing `<VisuallyHidden elementType="div">` and give
    the button only `width/height:1px`, mirroring upstream exactly → sentinel now
    measures identically in both stacks → green. All 268 unit-test files stay
    green; the change is structure-only (no behavior/handler touched), so D1/D3/D6
    for the dialog surface are unaffected.
  - **Finding T-D (open, CP9 overlay march):** `Popover.tsx`'s `PopoverDismissButton`
    (both the leading and trailing sentinels of the two-sentinel popover pattern)
    has the *same* self-inflicted divergence — it applies `style={visuallyHiddenStyles}`
    directly on the button instead of upstream's `<VisuallyHidden>`-wrapper +
    bare-button structure. Not fixed here (no D8 pilot exercises Popover yet, and
    the fix should land in the Popover march unit with its own re-baseline). Same
    one-line-structure fix as Modal when reached. (A broader latent note: the
    port's shared `VisuallyHidden` defaults `elementType` to `span` where upstream
    defaults to `div` — harmless for the sentinels since we pass `elementType="div"`
    explicitly, but worth auditing when the `VisuallyHidden` primitive itself is
    certified.)
  - Suite after CP8: full certified pilot run = **76 passed, 3 skipped, 4 red** —
    the 4 reds are exactly the pre-existing **deferred D4 event-ordering epic**
    (Tabs touch-tap, Tabs arrow-next-from-selected, Dialog escape-close, Dialog
    open-escape-close), unchanged by this work. D7 (10 cases) + D8 (6 cases) all
    green. Typecheck clean via the standalone e2e `tsc -p` line (contrast.ts +
    target-size.ts added to the scratchpad tsconfig include list).

Phase 2 (Tier 1): `✓ Button (pilot) · ✓ ToggleButton (2026-07-03) · ✓ ActionButton
(2026-07-04) · ✓ ToggleButtonGroup (2026-07-04) · ✓ Link (2026-07-04) · ✓ Avatar
(2026-07-04) · ✓ Badge (2026-07-04) · ✓ ProgressBar (2026-07-04) · ✓ Divider
(2026-07-04) · ✓ StatusLight (2026-07-04) · ✓ Meter (2026-07-04) · ✓ ProgressCircle
(2026-07-04) · ✓ Icon (2026-07-04) · ✓ Illustration (2026-07-04)` — remaining
march order above is the queue; mark components here as `✓ name (date)` when
certified, `blocked: name (reason)` otherwise.

- ✓ **ToggleButton done 2026-07-03 (CP9.1):** first new Tier-1 unit certified
  through all 8 landed drivers. Spec `togglebutton.certified.spec.ts` — 9 prop
  cases (default, selected, emphasized-selected, quiet, quiet-selected, size-s,
  size-xl, disabled, disabled-selected) × the applicable driver set = **60
  tests, all green**. D6 confirms `[pressed]` appears only on the selected node
  and `[disabled]` on the disabled node; D2 hover-transition is a matching
  positive control (shared `s2-action-button-styles` `transition: 'default'`);
  D7 (6 cases) + D8 (4 sizes) green to the strict floors.
  - **D4 rediscovered a real focus-loss divergence — root-caused to the
    comparison *fixture*, not the port.** On the `default` case all four press
    gestures (mouse-click, keyboard-enter, keyboard-space, touch-tap) showed
    Solid firing an extra trailing native `focusout` the React oracle did not.
    A throwaway focus probe pinned it: after a toggle the Solid `<button>` node
    was *gone from the DOM* (`document.activeElement` fell back to `<body>`),
    while React kept the same node focused. Cause: `SolidSpectrumToggleButtonDemo`
    instantiated `hc(SolidSpectrumToggleButton, …)` **inside a `createMemo` that
    read `selected()`** — so every toggle retracked the signal, recomputed the
    memo, and rebuilt the whole element, unmounting the live button and dropping
    keyboard focus. This is an idiomatic-Solid violation (component instantiation
    keyed on a hot signal), *not* a port defect: real compiled JSX
    `isSelected={selected()}` reconciles the same node the way React does.
  - **Fix (fixture only):** pass `isSelected: selected` — the raw accessor,
    which `hc`'s `unwrapAccessorProps` turns into a reactive getter — instead of
    reading `selected()` in the memo, and make `data-comparison-control-props` a
    getter for the same reason. The memo no longer tracks the toggle signal, so
    the button instance is kept and `aria-pressed` flips in place, matching
    React's controlled reconcile. Verified: probe now reports
    `probeStillInDom: true`, `activeTag: BUTTON`, `probePressed: "true"` after
    the toggle. The port's `ToggleButton.tsx` / headless `ToggleButton.tsx` were
    already faithful (single `<button>`, reactive spreads, no node recreation).
  - **Watch-list for later stateful units:** the memo-rebuild anti-pattern can
    recur in any fixture that instantiates a controlled component inside a memo
    keyed on its own state signal — ToggleButtonGroup, Switch, Checkbox,
    RadioGroup, Picker, ComboBox demos. D4 catches it every time; fix the same
    way (pass the accessor, don't read it in the creation scope).
  - Regression guard: full package suite green (5522 passed / 1 expected xfail),
    Button certified still 42/42 (shared `styled.tsx` unaffected). No net change
    to the 4 pre-existing deferred D4 event-ordering reds (Tabs ×2, Dialog ×2).

- ✓ **ActionButton done 2026-07-04 (CP9.2):** second new Tier-1 unit certified
  through all 8 landed drivers. Spec `actionbutton.certified.spec.ts` — 6 prop
  cases (default, quiet `isQuiet`, size-s, size-xl, disabled `isDisabled`,
  pending `isPending`) × the applicable driver set = **48 tests, all green**.
  The march surfaced two divergences — one real port bug, one fixture
  asymmetry — both root-caused against RAC/S2 source, plus a small driver
  enhancement to model the deliberately non-deterministic pending case.
  - **New driver capability — `steadyState` case flag.** ActionButton's pending
    state is the first case whose steady output is non-deterministic in
    wall-clock time: `isPending` mounts a ProgressCircle only after a **1s**
    delay (`createPendingState`), so the React and Solid panels' D1/D3 captures
    could straddle the 1s boundary and disagree for reasons unrelated to parity.
    Added `steadyState?: boolean` to `DriverCase` (default true) and
    `steadyStateCases(scenario)` — a `caseDef.steadyState !== false` filter now
    wrapping the D1 (`state-matrix.ts`) and D3 (`pixel.ts`) case loops. The
    pending case sets `steadyState: false`, so the *capture* drivers skip it
    while the *interaction* drivers that reference it at a deterministic moment
    (D4 press-suppression at t≈0, D6 pre-spinner aria state at t≈120ms) still
    exercise it. Additive; every existing case defaults to captured.
  - **D4 found a real port bug — pending button dropped its `tabindex`.** On the
    `pending` case all four press gestures showed the React oracle's button as
    `{ "disabled": true, "tabindex": "0" }` (S2/RAC keep a pending button
    *focusable* — `aria-disabled` semantics, not a native `disabled`), while the
    Solid button had only `"disabled": true` and **no `tabindex`**, so it fell
    out of the tab order. Root cause: `packages/solidaria-components/Button.tsx`
    folded `resolvePending()` into the `createButton` `isDisabled` getter
    (`resolveDisabled() || resolvePending()`), so the focusable layer saw the
    button as disabled and `useFocusable` dropped its always-on `tabIndex={0}`
    (the Safari native-button focus workaround, `useFocusable.mjs:64`).
  - **Fix (real, port):** mirror RAC `Button` exactly — `useButton`/`createButton`
    is called with the base `isDisabled` **without** `isPending`, so the pending
    button stays a non-disabled native `<button>` (keeps `tabIndex=0`, no native
    `disabled` attr). Pending "disabled" is layered on top as it is upstream:
    `aria-disabled="true"` + `disablePendingInteractions` stripping the press
    handlers. Also aligned that stripper to RAC's `PRESERVED_EVENT_PATTERN`
    (`/Focus|Blur|Hover|Pointer(Enter|Leave|Over|Out)|Mouse(Enter|Leave|Over|Out)/`)
    instead of the looser `!includes("Focus")/!includes("Blur")`, so hover/pointer
    handlers survive for tooltips exactly as upstream keeps them. This only
    changes the pending path (`resolveDisabled()` is identical when not pending),
    so Button (no pending case) and ToggleButton (no pending) certs are
    unaffected; verified below.
  - **D6 found a fixture asymmetry — pending button lost its accessible name.**
    Before the fix above landed, the pending AX capture showed React as
    `button "Inspect" [disabled]` but Solid as an **unnamed** disabled button:
    the fixture hand-built a `<span>` with `s2ActionButtonText({ isProgressVisible:
    props.isPending })`, hiding the label *immediately* on pending rather than on
    the component's own 1s delay. Because `getSingleTextChild` doesn't unwrap a
    hand-built span, the port never got to own the delayed visibility, so the
    label was `visibility:hidden` at the t≈120ms AX capture — before the spinner
    mounts, i.e. exactly when the visible text should still be naming the button.
  - **Fix (fixture only):** new `solidActionButtonFamilyChildren` helper mirrors
    the React fixture's `renderSingleButtonFamilyChildren` shape — a **bare
    string** for the text case and `SpectrumText` for the icon-start case —
    instead of a pre-classed span. The port's `getSingleTextChild` re-wraps the
    bare string in the component's own delayed `s2ActionButtonText({
    isProgressVisible })` span (and `Text` reads the component's `TextContext`),
    so the 1s delay is owned by the component the way S2's `Text`/`TextContext`
    owns it under React. The port's `button/ActionButton.tsx` was already
    faithful (delayed `TextContext.Provider`, `pendingAccessibleLabel`,
    `isPendingFocusable`); only the shared `solidSingleButtonFamilyChildren`
    caller was wrong, and Button/ToggleButton/ActionButtonGroup keep using it
    untouched. All 3 D6 AX cases (default, disabled, pending) now match.
  - Regression guard: `actionbutton.certified.spec.ts` **48/48**; neighbouring
    `button` + `togglebutton` certs **102/102** (proves the Button.tsx pending
    fix left the non-pending paths byte-identical); `vp test run button` unit
    suite **214/214**; full package suite **5526 passed / 1 expected xfail / 8
    skipped**. No net change to the 4 pre-existing deferred D4 event-ordering
    reds (Tabs ×2, Dialog ×2). Standalone e2e `tsc -p` clean. (Pre-existing,
    unrelated: `apps/comparison` `astro check` reports one long-standing error at
    `solid-h.ts:71` — a generic `createComponent` cast in a file this unit never
    touched; confirmed identical WITH and WITHOUT this unit's `styled.tsx`, so
    it is not a regression from this work.)
  - **Watch-list for later stateful units:** the immediate-vs-delayed fixture
    asymmetry recurs wherever a fixture pre-computes a visibility/label class the
    component is supposed to own on a timer (any `isPending`/announcement-delayed
    surface — Button pending, ProgressCircle, toasts). Pass the plain child and
    let the port's slot machinery own the delay; D6 catches it. The
    `steadyState: false` flag is the tool for any case whose steady render is
    time-dependent.

- ✓ **ToggleButtonGroup done 2026-07-04 (CP9.3):** third new Tier-1 unit certified
  through all 8 landed drivers. Spec `togglebuttongroup.certified.spec.ts` — 10
  prop cases (default, multiple, vertical, compact, quiet, emphasized, justified,
  size-s, size-xl, disabled) × the applicable driver set = **70 tests, all green**.
  The march surfaced two real port divergences (both D5), both in the shared
  `createToolbar` primitive, both self-inflicted and reverted per parity Rule #1.
  - **Role polymorphism confirmed by D6.** Single `selectionMode` → group
    `role="radiogroup"` with items `role="radio"` + `aria-checked`; `multiple` →
    group `role="toolbar"` with items `role="button"` + `aria-pressed`. Both AX
    cases match the React oracle exactly. This mirrors upstream
    `useToggleButtonGroup` (single-select overrides the toolbar role to
    `radiogroup`; `useToggleButtonGroupItem` overrides item role to `radio`).
  - **Fixture memo-rebuild fix (the watch-listed anti-pattern, D4).** The
    `SolidSpectrumToggleButtonGroupDemo` `renderedGroup` memo read the raw
    `selectedKeys` state inside the creation scope, so every toggle rebuilt the
    whole group and unmounted the focused item — the exact ToggleButton failure
    the CP9.1 watch-list predicted. Fixed the same way: thread `selectedKeys` as
    the raw accessor + expose the control-props data-attrs as getters, so the memo
    stops tracking the selection signal and items reconcile in place. D4 went
    12/12 green after this. Port components (`button/ToggleButtonGroup.tsx`,
    headless) were already faithful — fixture-only change.
  - **D5 found two real `createToolbar` divergences — no roving tabindex.** First
    established via source read (react-aria 3.50.0, vendored + pinned
    node_modules) that upstream `useToggleButtonGroupItem` sets **no `tabIndex`**
    — every item is a natively-tabbable `<button>`, and `useToolbar` keeps Tab
    from stepping into the next item purely via a Tab handler that jumps focus to
    the first/last child and lets the browser's own Tab then carry focus *out* of
    the toolbar. The port's `createToolbar` had drifted from that contract in two
    self-inflicted ways, both caught by the D5 focus-trail driver:
    - **tab-cycle red:** after Tab from the center item, React left the group
      (`(outside)`) but Solid landed on the next in-panel item. Cause: the port's
      Tab case only stored state (no exit dance) **and** an invented modifier
      early-return (`if (e.altKey||e.ctrlKey||e.metaKey||e.shiftKey) return`)
      blocked Shift+Tab entirely.
    - **arrow-roving red:** after Home/End, React stayed put (upstream binds
      neither) but Solid moved. Cause: the port invented `Home`/`End` cases.
  - **Fix (real, port — `packages/solidaria/src/toolbar/createToolbar.ts`).** Made
    `createToolbar` a faithful mirror of upstream `useToolbar`: (1) removed the
    invented modifier early-return; (2) removed the invented `Home`/`End` cases;
    (3) replaced the inert `Tab` case with upstream's exit dance —
    `lastFocusedElement = getActiveElement(doc); e.shiftKey ? focusFirst() :
    focusLast(); return` (no `preventDefault`, so the browser's default Tab then
    exits the whole toolbar); (4) added the faithful `onBlur`/`onFocus` capture
    pair (record last-focused child on leave, restore it on re-entry, both gated
    on `!isInToolbar`) + the matching `blur` capture listener. Arrow branches were
    already faithful and left untouched. D5 went green (2/2 → full 70/70).
  - **Consumer test fallout (fixed).** Removing the invented `Home`/`End` broke
    four `createToolbar`-consumer suites that codified the invented navigation —
    `solidaria-components` Toolbar + ActionBar, `solid-spectrum` Toolbar +
    ActionBar. Each was updated to the faithful contract (Home/End are no-ops;
    arrow navigation + Tab exit dance retained), and `createToolbar`'s own unit
    test now asserts the no-op Home/End plus the Tab / Shift+Tab exit dance.
    `createActionGroup` and other components with their *own* Home/End handling
    (Menu, ListBox, Slider, Table, Calendar, TagGroup, Tabs, NumberField, Select)
    were confirmed unrelated and left untouched.
  - **Tracked divergence (deferred) — text-input arrow guard.** `createToolbar`
    keeps a guard that lets a text input inside a toolbar retain the arrow keys
    for caret/value movement; upstream `useToolbar` has no such guard. It was
    *narrowed* to arrows only (Home/End dropped) but not removed, because
    ToggleButtonGroup never exercises it and removing it unverified risks a
    regression in a real ActionBar/Toolbar text-input surface. Flagged for a
    dedicated ActionBar/Toolbar cert — see tech-debt `toolbar-text-input-guard`.
  - Regression guard: `togglebuttongroup.certified.spec.ts` **70/70**; full
    `createToolbar` blast radius (solidaria + solidaria-components + solid-spectrum)
    **231 files / 4633 passed / 1 expected xfail / 8 skipped**; the 5 toolbar/
    actionbar consumer suites **89/89**; `createToggleButtonGroup` +
    `createActionGroup` units **15/15**. No net change to the 4 pre-existing
    deferred D4 event-ordering reds (Tabs ×2, Dialog ×2). Pre-existing unrelated
    `solid-h.ts:71` astro-check error unchanged.

- ✓ **Link done 2026-07-04 (CP9.4):** fourth new Tier-1 unit certified through all
  8 landed drivers, and the first **navigational** primitive — a native
  `<a role="link">`, not a `<button>`. Spec `link.certified.spec.ts` — 6 prop
  cases (default primary, secondary, standalone, standalone-quiet, static-white,
  static-black) × the applicable driver set = **41 tests, all green on the first
  run, no port change required.** Link has no `size` and — matching S2 — no
  `isDisabled` (the port's `LinkProps` `Omit`s `isDisabled`), so those axes are
  intentionally absent; there is no interactive state signal, so the fixture's
  `renderedLink` memo has nothing to over-track and the ToggleButton/TBG
  memo-rebuild anti-pattern cannot occur here.
  - **Why it certified clean.** The port `Link` (`solid-spectrum/src/link/index.tsx`
    → headless `solidaria-components/src/Link.tsx`) already mirrors S2 `Link`
    exactly: the `linkStyles` macro carries the same variant colors
    (`baseColor("accent")` / `baseColor("neutral")`), the standalone `ui`
    font + `medium` weight, the standalone-quiet "no underline until
    hover/focus" decoration table, `transition: "default"`, and the two
    `staticColor` overlays — all confirmed byte-identical by D1/D3 across every
    gesture state and both themes, and by D2's hover-transition positive control.
  - **New technique — anchor navigation neutralized for D4.** Link is the first
    unit whose press *navigates*: a real click on an `<a href>` unloads the page
    and destroys the event-log capture. Every case pins `href="#"` (threaded via
    the case `params`, which the fixture reads through `linkDemoPropsFromSearch`),
    so the four D4 gestures activate the anchor as a **same-document fragment
    navigation** — no unload, log intact — and `href` affects no captured style,
    AX node, or geometry. This is the reusable pattern for every later
    navigational unit (LinkButton, breadcrumb links, menu-item links).
  - **D4 parity point — Space must not activate a link.** `standardPressGestures`
    includes keyboard-Space; a link (unlike a button) does **not** activate on
    Space (Space scrolls). Both stacks correctly fire no press/click for Space and
    the identical press+click log for mouse-click / keyboard-Enter / touch-tap —
    proof the port threads RAC `useLink` (which, with no `RouterProvider`, does
    not `preventDefault`, so native navigation proceeds) exactly as upstream.
  - **D8 note — inline links are legitimately sub-24px.** An inline text link is
    exempt from the S2 pointer-target floor (it is inline content), so its border
    box is below 24px tall; the driver *reports* this (no `assert24`) and the hard
    gate is the pair diff — both stacks render the identical anchor box for the
    inline (default) and standalone treatments.
  - Regression guard: `link.certified.spec.ts` **41/41**; no source changed, so
    neighbouring certs are untouched by construction; standalone e2e `tsc -p`
    clean (added `link.certified.spec.ts` to the scratchpad include list). No net
    change to the 4 pre-existing deferred D4 event-ordering reds (Tabs ×2,
    Dialog ×2). Pre-existing unrelated `solid-h.ts:71` astro-check error unchanged.

- ✓ **Avatar done 2026-07-04 (CP9.5):** fifth new Tier-1 unit certified, and the
  first **non-interactive display** primitive — a static image, not a control.
  Spec `avatar.certified.spec.ts` — 5 prop cases (default, size-16, size-96,
  over-background, over-background-large) × the applicable driver set = **22
  tests, all green on the first run, no port change required.** Avatar has no
  `variant`/`isDisabled`/interactive state, so the case matrix is purely the
  `size` scale (16 → 96) and the `isOverBackground` outline.
  - **Applicable driver set is deliberately narrowed to D1/D3/D6** — this is the
    honest set for a static image, and the omission is documented in the spec
    header, not silent. **D2** is skipped: `avatarRoot` carries no `transition`;
    the `<img>` opacity reveal (0 → 1 on load) is a one-shot load artifact
    identical on both stacks, not an interaction-driven animation. **D4/D5** are
    skipped: an avatar is neither pressable nor focusable (the wrapper is a plain
    `<div>` — no tabindex, role, or press handling), so the memo-rebuild
    focus-loss anti-pattern that D4 caught on ToggleButton/TBG cannot even arise.
    **D7** is skipped: an image has no text nodes to measure contrast on. **D8**
    is skipped: an avatar is not an interactive target (no button/link/role match),
    so there is no hit box to floor-check.
  - **Structure parity — why the port certified clean.** Upstream S2 `Avatar`
    (`react-spectrum/…/s2/src/Avatar.tsx`) and the port
    (`solid-spectrum/src/avatar/index.tsx`) both render `<Image>` with the *same*
    style macro (`borderRadius: full`, the `size: 20` box overridden by the inline
    `width/height = size/16 rem`, `outlineStyle` none→solid on `isOverBackground`,
    `outlineWidth` 1→2 on `isLarge = size >= 64`, `centerBaselineBefore`). Both
    `<Image>`s emit the byte-identical `<div slot="avatar" class=wrapper>…<img
    role="img"></div>` — verified against upstream `s2/src/Image.tsx`. So the
    wrapper div (which carries the avatar's own macro) is the D1 `target` and the
    inner `<img>` is a diffed `part`; D1/D3 confirm the circle, size box, and both
    outline widths match across every case and both themes.
  - **Targeting note (reusable for wrapped-render primitives).** When a component's
    style macro lands on a *wrapper* element and the semantic node is a *child*
    (here: styles on the `<div slot="avatar">`, AX on the inner `<img>`), split the
    scenario locators — `target` = `[slot="avatar"]` (the styled box), `parts.image`
    = `getByRole("img", …)` (the AX/reveal node). Do not target the img for D1: it
    only carries `imageStyles` (opacity/object-fit), not the avatar treatment.
  - **D3 reveal-timing handling.** The `<img>` starts at opacity 0 and reveals on
    load, with a 500ms opacity transition *only* when `loadTime > 200ms`. For the
    cached ~2.5KB local fixture PNG the load is well under 200ms, so opacity snaps
    to 1 with no transition; a `settleMs: 500` still guards a cold first load so
    both panels capture fully revealed. No pixel waiver was needed.
  - **D6 confirms `isOverBackground` is purely visual.** The AX tree for both the
    default and over-background cases is the identical single `img "Avatar"` node —
    the outline path leaks no role or accessible-name change.
  - Regression guard: `avatar.certified.spec.ts` **22/22**; no source changed, so
    neighbouring certs are untouched by construction; standalone e2e `tsc -p` clean
    (added `avatar.certified.spec.ts` to the scratchpad include list). No net change
    to the 4 pre-existing deferred D4 event-ordering reds (Tabs ×2, Dialog ×2).
    Pre-existing unrelated `solid-h.ts:71` astro-check error unchanged.

- ✓ **Badge done 2026-07-04 (CP9.6):** sixth new Tier-1 unit certified, and the
  first display primitive that carries **text** — so the D7 contrast driver
  re-enters the set that Avatar had narrowed away. Spec `badge.certified.spec.ts`
  — 8 prop cases (default, bold-negative, bold-yellow, subtle-accent,
  outline-positive, size-xl, truncate, icon-start) × the applicable driver set =
  **44 tests, all green on the first run, no port change required.**
  - **Applicable driver set is D1/D3/D6/D7.** Badge renders
    `<span role="presentation" class=badge><Text>…</Text></span>` identically in
    both stacks (verified against upstream `s2/src/Badge.tsx`, incl. the whole
    `badge` macro), so the badge span is the D1 `target` and the inner `<Text>`
    span is a diffed `part`. The interaction/derived drivers are skipped, with the
    reason recorded in the spec header: **D2** (no interaction-triggered
    transition on a static label), **D4/D5** (`role="presentation"`, not
    focusable/pressable), **D8** (not an interactive target — no hit box).
  - **D7 is the point of this unit.** The bold fill uses white text on every
    variant *except* notice/orange/yellow/chartreuse/celery, which flip to black
    (light backgrounds); the subtle/outline fills use `gray-1000`. The contrast
    pair diff confirms the port reproduces upstream's exact fg/bg token choice to
    2dp across both themes — `bold-yellow` exercises the black-text exception and
    `outline-positive` the per-variant coloured border. All five contrast cases
    matched.
  - **`overflowMode` lives on the text child, not the badge span, and is
    invisible to the pixel side for a non-overflowing label** (wrap vs truncate
    render identically until the text actually overflows). To certify it, the
    `<Text>` span is diffed as a `part` and the D1 allowlist is extended
    (`styleProps.add`) with `white-space`, `text-overflow`, `overflow-x/y`, and
    `order` — none of which are in the default allowlist — so the pair diff sees
    `white-space: normal` (wrap) vs `nowrap` (truncate) and the icon/text flex
    order. Reusable whenever a treatment sits on a styled descendant.
  - **DOM-prop passthrough is symmetric.** The fixture threads `hidden` + four
    `aria-*` props + `id` onto the Badge on *both* stacks; each Badge calls
    `filterDOMProps` with no opts, so `global`/`labelable` are false and only `id`
    + `data-*` survive (`hidden`/`aria-*` stripped) — the badge stays visible and
    `[data-comparison-control-root="badge"]` resolves it on both panels. D6
    confirms the resulting AX is the identical single `text` node (default and
    `icon-start`, where the leading icon is correctly `aria-hidden`).
  - Regression guard: `badge.certified.spec.ts` **44/44**; no source changed, so
    neighbouring certs are untouched by construction; standalone e2e `tsc -p`
    clean (added `badge.certified.spec.ts` to the scratchpad include list). No net
    change to the 4 pre-existing deferred D4 event-ordering reds (Tabs ×2,
    Dialog ×2). Pre-existing unrelated `solid-h.ts:71` astro-check error unchanged.

- ✓ **ProgressBar done 2026-07-04 (CP9.7):** seventh new Tier-1 unit certified,
  and the first primitive whose **headline parity surface is ARIA value
  semantics** (D6) rather than press/focus/text-contrast. Spec
  `progressbar.certified.spec.ts` — 10 prop cases (default, value-25,
  custom-range, value-label, size-s, size-xl, label-side, format-currency,
  static-white, indeterminate) × the applicable driver set = **47 tests, all
  green** after two source-read faithfulness fixes to the port.
  - **Structure is byte-identical to upstream.** Upstream S2 `ProgressBar` (over
    RAC `useProgressBar`) and the port both render
    `<div role="progressbar" aria-value* aria-labelledby class=wrapper(grid)>` with
    an optional `<div class=labelWrapper><span id class=fieldLabel>{label}</span></div>`,
    an optional determinate value `<span class=fieldLabel+value>{valueText}</span>`,
    and `<div class=track><div class=fill style="width:N%"/></div>`. Verified the
    label renders a **`<span>` on both stacks** because RAC's `ProgressBar` pins
    `LabelContext` `elementType: 'span'` (so the S2 `FieldLabel` `Label` is a span),
    and the port hand-rolls the same `<div><span>`. The `bar()`/`track()`/
    `fieldLabel()` macros the port inlines match `s2/src/bar-utils.ts` +
    `Field.tsx`. So the `role="progressbar"` div is the D1 `target` and the grid
    children (`label`, `value`, `track`, `fill`) are diffed `parts`.
  - **Applicable driver set is D1/D3/D6/D7** with the rest recorded N/A in the spec
    header: **D2** (the only animation is the *indeterminate* fill keyframe — runs
    infinitely from load with no gesture trigger to freeze, and its `keyframes()`
    identifier is build-time-hashed differently per stack by construction, so a raw
    `animation-name` pair-diff would be a false positive; the keyframe *content* +
    timing `1000ms cubic-bezier(.37,0,.63,1) infinite` are verified byte-identical
    by source read instead), **D4/D5** (`role="progressbar"`, no tabindex/press —
    not interactive), **D8** (not an interactive target — no hit box).
  - **D6 is the point of this unit.** Five AX cases pin the value contract:
    `default` + `custom-range` prove `aria-valuenow/min/max/valuetext` (custom-range
    is the `(30-10)/(50-10)=50%` triple — same valuetext as default but a distinct
    now/min/max, proving the percentage math is independent of the raw value);
    `value-label` proves the `valueLabel` override wins in both the value span and
    `aria-valuetext`; `format-currency` proves the non-percent formatter path
    (RAC/port both branch `style === 'percent' ? percentage : clampedValue`, so a
    currency formatter formats the clamped **value** 50 → `$50`, not the fraction);
    and `indeterminate` proves `aria-valuenow`/`aria-valuetext` are **dropped**
    (and the value span omitted) while `aria-labelledby` stays wired — identically
    on both stacks.
  - **Two self-inflicted divergences found by source read and fixed** (parity
    rule — diverge only when React→Solid forces it):
    1. **`fill` `transformOrigin` was unconditional `'left'`** where upstream's S2
       `fill` applies `transformOrigin: {isIndeterminate: 'left'}`. On the
       untransformed determinate bar this is visually inert (no transform to
       anchor), but it shifts the computed `transform-origin` off centre — a real
       computed-style divergence. **Surfaced as a genuine red→green in the harness:**
       adding `transform-origin` to the D1 allowlist and diffing the `fill` part
       flagged all 18 determinate cases (port `0px …` vs upstream centre e.g.
       `84px 3px`) before the fix; making it `{isIndeterminate: 'left'}` turned them
       green. The `transform-origin` allowlist entry stays as a **permanent guard**.
    2. **The RTL indeterminate keyframe did not mirror the LTR one** (port
       `progressBarIndeterminateRtl` was `70% → -100%`; upstream `indeterminateRTL`
       is `100% → -70%`, the mirror of LTR `-70% → 100%`). Not reachable by the
       LTR-only harness (the comparison app has no RTL ProgressBar variant), so it
       is a **source-verified** fix, corrected to match upstream exactly.
  - **Port fix touched only the determinate `fill` computed style**, so the
    regression snapshot delta is scoped exactly to the ProgressBar determinate fill
    div dropping the `_0e13` (`transform-origin: left`) atomic (+ its
    `-macro-dynamic-*` hash recompute); verified via `git diff --word-diff` that no
    other component snapshot and no other progressbar node changed. Guards:
    `progressbar.certified.spec.ts` **47/47**; `vp test run ProgressBar` 45 passed;
    `vp test run regression -u` 51 passed (1 snapshot updated, scoped as above);
    standalone e2e `tsc -p` clean (added `progressbar.certified.spec.ts` to the
    scratchpad include list). No net change to the 4 pre-existing deferred D4
    event-ordering reds (Tabs ×2, Dialog ×2). Pre-existing unrelated
    `solid-h.ts:71` astro-check error unchanged.

- ✓ **Divider done 2026-07-04 (CP9.8):** eighth new Tier-1 unit certified, a
  non-interactive **text-less separator** — so it takes the same narrowed set as
  Avatar (D1/D3/D6, no D7). Spec `divider.certified.spec.ts` — 7 prop cases
  (default, size-s, size-l, vertical, vertical-l, static-white, static-white-l) ×
  the applicable driver set = **30 tests, all green on the first run, no port
  change required.** Like Badge, the port is already byte-identical; the value is
  the permanent guard + the documented driver-set rationale.
  - **The `divider`/`dividerStyles` `style()` macro is byte-identical between the
    two source files** (`s2/src/Divider.tsx` vs the port) — same colour table
    (`gray-200`, size-L `gray-800`, `transparent-overlay-200`/`-800` for
    staticColor, `ButtonBorder` forced-colors), same emulated-border geometry
    (horizontal `height` 2/1/4px, vertical `width` 2/1/4px), same allowed
    overrides. So the parity surface reduces to computed box (D1/D3) + separator
    semantics (D6). The seven cases sweep the **full colour table** (default
    gray-200, size-l gray-800, static-white overlay-200, static-white-l
    overlay-800) across **both orientations** and **all three sizes**.
  - **Element/AX structure verified against RAC `Separator` + `useSeparator`**,
    which the port's headless `Separator` + `createSeparator` mirror line-for-line.
    S2 `Divider` never passes `elementType`, so both stacks default it to
    `undefined`; `Separator` renders `<hr>` for that default and switches to
    `<div>` only for `orientation:'vertical'`. Because the aria hook branches on
    the *raw* `elementType` (`undefined !== 'hr'`), **both stacks add an explicit
    `role="separator"`** in every case, plus `aria-orientation="vertical"` on the
    vertical `<div>` (horizontal omits it — `separator`'s default orientation is
    already horizontal). So horizontal ⇒ `<hr role="separator">`, vertical ⇒
    `<div role="separator" aria-orientation="vertical">`, identical on both.
  - **D1 allowlist extended for the flex-child longhands.** A divider's defining
    box is `alignSelf:'stretch'` + `flexGrow:0` + `flexShrink:0`, none of which
    are in the default allowlist, so `styleProps.add` pulls in `align-self`,
    `flex-grow`, `flex-shrink` (width/height/background-color/border-radius/margin
    are already covered) — the stretch/grow/shrink behaviour is now part of the
    pair diff.
  - **D6 has teeth, verified empirically.** An inline probe confirmed
    `ariaSnapshot()` yields `- separator` for **both** the horizontal `<hr>` (its
    implicit role) and the vertical `<div>` (its explicit `role="separator"`), so
    the `vertical` case genuinely guards the port's explicit role attribute — if
    the port dropped it, the `<div>` would fall to a generic node and the solid
    snapshot would diverge from react. `ariaSnapshot()` does not render
    `aria-orientation`, so that attribute is asserted faithful by the shared,
    unit-tested `createSeparator` ↔ `useSeparator` port instead (both emit
    `aria-orientation="vertical"` only for vertical). The rest of the driver set
    is N/A with the reason recorded in the spec header: **D2** (no
    transition/animation), **D4/D5** (`role="separator"`, not focusable/pressable),
    **D7** (no text — its non-text graphical contrast is the same shared token
    already asserted by D1's `background-color`), **D8** (not an interactive
    target).
  - Regression guard: `divider.certified.spec.ts` **30/30**; no source changed, so
    neighbouring certs are untouched by construction; standalone e2e `tsc -p`
    clean (added `divider.certified.spec.ts` to the scratchpad include list). No
    net change to the 4 pre-existing deferred D4 event-ordering reds (Tabs ×2,
    Dialog ×2). Pre-existing unrelated `solid-h.ts:71` astro-check error unchanged.

- ✓ **StatusLight done 2026-07-04 (CP9.9):** ninth new Tier-1 unit certified — a
  coloured **dot + label** display primitive, so (like Badge) it carries text and
  D7 re-enters. Spec `statuslight.certified.spec.ts` — 9 prop cases (default,
  informative, positive, notice, negative, seafoam, size-s, size-xl, status-role)
  × the applicable driver set = **44 tests, all green on the first run, no port
  change required.** Third byte-identical unit in a row (Badge, Divider,
  StatusLight); the value is the permanent guard + driver-set rationale.
  - **Structure + macros verified byte-identical to upstream** (`s2/src/
    StatusLight.tsx`): the `wrapper` macro (`controlFont`, `gap: 'text-to-visual'`,
    `width: 'fit'`, `alignItems: 'baseline'`, the neutral-only `gray-600`
    text-colour branch, `disableTapHighlight`) and the `light` macro (the 8/10/12/
    14 `size` scale + the full 19-variant `fill` colour table + `overflow: visible`)
    match the two source files line-for-line. `CenterBaseline` is a `<div>` on both
    and S2 `Text` is a `<span data-rsp-slot="text">` on both, so the wrapper is the
    D1 `target` and the two children are diffed `parts`: `dot` (the `<svg>`) and
    `text` (the label `<span>`). (The port adds an outer `<TextContext.Provider
    value={{}}>` upstream lacks, but a provider emits no DOM and resolves to the
    same "no slotted props", so the rendered tree is identical — confirmed green.)
  - **The dot colour is an SVG `fill`, not `background-color`**, so it is not in
    the default D1 allowlist. `styleProps.add` pulls in `fill` (+ the svg's
    `overflow`) and the `dot` part is diffed — that is where the per-variant colour
    table is actually asserted. The **label** colour is set on the wrapper
    (`neutral` default; `gray-600` only for the neutral variant) and inherited by
    the `text` span, so `color` (already allowlisted) captures it on both.
  - **D6 is the semantic headline and is probe-verified to have teeth.** With no
    role the wrapper is generic and only the label text is exposed; with
    `role="status"` an inline probe confirmed `ariaSnapshot()` yields
    `- status "StatusLight route label": Sync complete` — the wrapper becomes a
    `status` live region whose accessible name is the fixture's `aria-label`. That
    same probe confirmed the **`filterDOMProps` labelable gate**: with no role the
    `aria-label` is *stripped* (`role=null aria-label=null`), so a labelled
    StatusLight only keeps its label when `role` is set — identical on both stacks.
  - D7: the label text contrast — `default` exercises the neutral variant's
    `gray-600` branch; `positive`/`negative` prove the *label* stays the
    high-contrast `neutral` token even as the dot takes the semantic colour. All
    matched to 2dp in both themes. The rest of the set is N/A with the reason in
    the spec header: **D2** (no transition/animation), **D4/D5** (not
    focusable/pressable; `role="status"` is a live region, not a widget), **D8**
    (not an interactive target).
  - Regression guard: `statuslight.certified.spec.ts` **44/44**; no source changed,
    so neighbouring certs are untouched by construction; standalone e2e `tsc -p`
    clean (added `statuslight.certified.spec.ts` to the scratchpad include list).
    No net change to the 4 pre-existing deferred D4 event-ordering reds (Tabs ×2,
    Dialog ×2). Pre-existing unrelated `solid-h.ts:71` astro-check error unchanged.

- ✓ **Meter done 2026-07-04 (CP9.10):** tenth new Tier-1 unit certified — a
  **labelled value-bar** display primitive, the static-value sibling of
  ProgressBar (shares upstream's `useProgressBar` spine via `useMeter`/
  `createMeter`). Spec `meter.certified.spec.ts` — 10 prop cases (default,
  positive, notice, negative, size-s, size-xl, label-side, value-label,
  custom-range, static-white) × the applicable driver set = **49 tests, all green
  on the first run, no port change required.** Fourth byte-identical unit in a row.
  - **Structure + macros verified byte-identical to upstream** (`s2/src/Meter.tsx`
    + `bar-utils.ts`): the port's `wrapperStyles` reproduces the shared `bar()`
    macro line-for-line — including the **deliberate 2-column / 3-area `side`
    grid** (`gridTemplateColumns.side: ['auto','1fr']` against
    `gridTemplateAreas.side: ['label bar value']`, so the third "value" column is
    implicit — the port matches this exactly, not a bug); `trackStyles` = `track()`
    + the `{S:4,M:6,L:8,XL:10}` height scale; `fillStyles` = the `lightDark`
    variant colour table; `valueStyles`/`labelStyles` = `fieldLabel()`. The label
    region is `<div class=labelWrapper><span>` on both — upstream's `FieldLabel`
    renders through RAC `Label` whose `LabelContext` (set by RAC `Meter`) forces
    `elementType: 'span'`, so it is a `<span>` not a `<label>`, matching the port.
    `Text` → `<span data-rsp-slot="text">` on both, and `SkeletonWrapper` emits no
    wrapper outside a `<Skeleton>` provider on both, so the track is a direct
    child. So the wrapper is the D1 `target` and the four grid children are diffed
    `parts`: `label`, `value`, `track`, `fill`.
  - **D1** captured the grid layout via `styleProps.add` (the ProgressBar longhand
    set minus `transform-origin` — a Meter fill never animates): grid-template-
    columns/areas, grid-area, overflow, min/max-width, position, isolation,
    z-index. The variant `fill` `background-color` (already allowlisted) is the
    colour headline; `label-side` exercises the alternate grid template. D3 pixel
    clean across all 10 cases in both themes.
  - **D6** pins role=meter + the `aria-labelledby` name wiring (the label span
    text "Storage" becomes the meter's accessible name) + `aria-valuenow`/
    `aria-valuetext`; `custom-range` proves the (30/10/50) min/max triple + 50%
    math, `value-label` proves the override wins in `aria-valuetext` — all
    identical on both stacks. D7 measured the label + value text (a shared
    `fieldLabel()` token — the variant recolours only the fill, not the text) plus
    the staticColor overlay ramp, to 2dp in both themes. D2/D4/D5/D8 N/A (no
    animation, not focusable/pressable, no hit box) — rationale in the spec header.
  - **KNOWN, TRACKED DIVERGENCE — role token (`meter-role-fallback-token`, filed
    in tech-debt.md).** Upstream `useMeter` deliberately emits the ARIA fallback
    token list `role="meter progressbar"` (documented browser-fallback safety net);
    the port emits single-token `role="meter"` (hardcoded on the wrapper *and* in
    `createMeter`), and the comparison's React fixture patches upstream's native
    `"meter progressbar"` DOM attribute *down* to `"meter"` so the panels match.
    That normalization **masks** a self-inflicted divergence (Rule #1) — both token
    lists resolve to the same `meter` role, so D6 is green either way and cannot see
    it. Deferred (not force-fixed here) because the faithful fix touches solidaria's
    `createMeter` (a dist rebuild) + must be re-validated against the web a11y/axe
    gate, both outside this e2e-only unit. Everything else certified is honest
    byte-identical parity; the mask is documented, not accepted silently.
  - Regression guard: `meter.certified.spec.ts` **49/49**; no source changed, so
    neighbouring certs are untouched by construction; standalone e2e `tsc -p` clean
    (added `meter.certified.spec.ts` to the scratchpad include list). No net change
    to the 4 pre-existing deferred D4 event-ordering reds (Tabs ×2, Dialog ×2).
    Pre-existing unrelated `solid-h.ts:71` astro-check error unchanged.

- ✓ **ProgressCircle done 2026-07-04 (CP9.11):** eleventh new Tier-1 unit
  certified — the **circular sibling of ProgressBar**: a pure-SVG determinate/
  indeterminate spinner with **no text node** (shares upstream's `useProgressBar`
  spine via `createProgressBar`). Spec `progresscircle.certified.spec.ts` — 7 prop
  cases (default, value-25, custom-range, size-s, size-l, static-white,
  indeterminate) × the applicable driver set = **27 tests green, with one
  source-read faithfulness fix landed** (see below). Ends the four-unit
  byte-identical streak with a real, harness-caught divergence.
  - **Structure + macros verified byte-identical to upstream** (`s2/src/
    ProgressCircle.tsx`): `<div role=progressbar>` → `<svg fill=none 100%×100%>` →
    three concentric `<circle>` (hcm-stroke / track / fill). The port's `wrapper`/
    `track`/`fill`/`hcmStroke` `style()` macros reproduce upstream line-for-line —
    the `staticColor()` + `size {default:32,S:16,L:64}` + `aspectRatio:square`
    wrapper, the `gray-300`/`transparent-overlay-300`/`Background` track stroke
    table, the `blue-900`/`transparent-overlay-900`/`ButtonText` fill stroke with
    `rotate:-90` + `transformOrigin:center`, and the `pxToRem`-driven stroke-width
    scale (`0.1875`/`0.125`/`0.25`rem). `radiusForSize` matches upstream's
    `calc(50% - {strokeWidth/2}rem)` table (S `0.0625` / M `0.09375` / L `0.125`rem).
    The fill arc's dash geometry is identical: `pathLength=100`,
    `stroke-dasharray="100 200"`, `stroke-dashoffset={100 - percentage}`,
    `stroke-linecap=round`. So the `role=progressbar` div is the D1 `target` and
    the `<svg>` + three circles are diffed `parts` (`svg`/`hcm`/`track`/`fill`).
  - **SOURCE-READ FAITHFULNESS FIX (Rule #1 self-inflicted divergence).** The port's
    `<svg>` omitted upstream's `style={{display: 'block'}}`. An inline SVG sits on
    the text baseline and reserves line-box descender space, so `display:inline` vs
    upstream's `block` is a genuine computed-style divergence — **caught red by D1**
    (12 cases: `"display": "inline"` on the `svg` part vs upstream `"block"`).
    Notably D3 pixel stayed green through the red (the `100%×100%` svg inside the
    fixed aspect-ratio-square wrapper doesn't shift enough pixels to trip the
    threshold), which is exactly why the computed-style driver earns its keep — it
    pins the faithful value even where the rasteriser papers over it. One-line fix
    (`packages/solid-spectrum/src/progress/ProgressCircle.tsx`: add
    `style={{ display: "block" }}` to the `<svg>`) → **27/27 green**, port unit
    tests still 5/5.
  - **D1** captured the SVG longhands the default allowlist omits via `styleProps
    .add`: `fill`, `stroke`, `stroke-width`, the fill arc's `stroke-dasharray`/
    `stroke-dashoffset`/`stroke-linecap`, the `r`/`cx`/`cy` geometry attributes, the
    fill's `rotate`/`transform-origin`, the wrapper's `aspect-ratio`, and (the fix
    guard) `display`. D3 pixel clean across all 6 steady cases in both themes.
  - **D6** pins role=progressbar + `aria-valuenow`/`min`/`max`/`valuetext` (the
    accessible name is the fixture's `aria-label` "Loading…", since ProgressCircle
    has no visible label); `custom-range` proves the (30/10/50) min/max triple +
    50% math, and `indeterminate` proves `aria-valuenow`/`valuetext` are **dropped**
    (name still wired) — identically on both stacks.
  - **D2/D7 N/A, rationale in the spec header.** D2: the only animation is the
    *indeterminate* spin (an infinite `rotationAnimation`+`dashoffsetAnimation`
    pair under build-hashed `keyframes()` names that differ by construction, so a
    metadata diff would be a false positive — same call the ProgressBar unit made);
    the keyframe content + timing are verified byte-identical by source read
    instead (rotation `0→360deg`, dash-offset `75→20` peak-at-30%, composed
    `1s cubic-bezier(.6,.1,.3,.9)` + `1s cubic-bezier(.25,.1,.25,1.3)` infinite —
    the port's `s2ProgressCircleIndeterminateAnimation` mirrors upstream's inline
    literal exactly). The animated `indeterminate` case is `steadyState:false` so
    it is excluded from the D1/D3 sweep and used only by D6. D7: no text node → no
    fg/bg text pair to measure; the arc-vs-track colour is a shared-token `stroke`
    already asserted byte-for-byte by D1. D4/D5/D8 N/A (not focusable/pressable, no
    hit box).
  - Regression guard: `progresscircle.certified.spec.ts` **27/27**; the one-line
    src fix is additive-faithful and its only cert exposure is this unit (neighbour
    certs don't import ProgressCircle); standalone e2e `tsc -p` clean (added the
    spec to the scratchpad include list). No net change to the 4 pre-existing
    deferred D4 event-ordering reds (Tabs ×2, Dialog ×2). Pre-existing unrelated
    `solid-h.ts:71` astro-check error unchanged.

- ✓ **Icon done 2026-07-04 (CP9.12):** twelfth new Tier-1 unit certified — the
  `createIcon` HOC that wraps a raw workflow-icon `<svg>` and stamps the S2 icon
  contract onto it. Spec `icons.certified.spec.ts` — 2 prop cases (default,
  hidden) × the applicable driver set = **10 tests green on the first run, a
  confirmatory green** (no divergence existed; the wrapper/glyph/Button-IconContext
  were already faithful). The cert now pins that parity against future drift.
  - **Wrapper + glyph + Button coupling verified byte-identical to upstream**
    (`s2/src/Icon.tsx` vs `icon/spectrum-icon.tsx`): both render the passed
    `<Component>` svg with `role="img"`, `focusable={false}`, `data-slot`, the
    same `aria-hidden` gate (`aria-label ? aria-hidden || undefined : true` —
    labelled icons expose their name, unlabelled icons are `aria-hidden`), and the
    same `iconStyles`/`iconBaseStyles` `style()` macro (`{size: 20, flexShrink: 0}`
    over the same `allowedOverrides` list — deliberately **excluding** width/height/
    flex so an icon never grows past its 20px square). The skeleton path is
    DOM-equivalent: upstream wraps in `<SkeletonWrapper>` (renders **no** element
    outside a `<Skeleton>` provider); the port applies the same `loadingStyle` +
    `inert` + WAAPI ref directly on the svg — identical DOM when not loading. The
    demo's two `createIcon((props) => <svg …>)` glyphs (React vs Solid) are
    byte-identical (same `viewBox="0 0 20 20"`, same two `<path d=…>`, same
    `fill: var(--iconPrimary, #222)`). The two Button `iconContextValue`s also
    match byte-for-byte (`render: centerBaseline({slot:'icon', styles: order:0})`,
    `styles: {size: fontRelative(20), marginStart: '--iconMargin', flexShrink: 0}`).
  - **D1** diffed the pure-`createIcon` output as `target` (labelled icon) plus two
    `parts`: `decorative` (the unlabelled `aria-hidden:true` branch, same box) and
    `buttonIcon` (the svg inside an accent Button — proving the port's icon
    **consumes** the Button's IconContext: the `fontRelative(20)` resize +
    `--iconMargin` inline-start). `styleProps.add: ["flex-shrink"]` (size = width/
    height and the Button-context margin are already in the default allowlist). Non-
    vacuous: `Locator.evaluate()` throws on a 0-/multi-match, so every part resolved
    to exactly one element and matched. D3 pixel clean on the non-animating labelled
    target in both themes (so the page's skeleton shimmer never touched the capture).
  - **D6** pins `img "Create item"` for the labelled icon in the `default` case and
    its **absence** from the AX tree in the `hidden` case (`ariaHidden:"true"` flips
    the gate); the decorative + skeleton icons are always absent (aria-hidden /
    inert) and the accent Button composes as `button "Create"` — identically on both
    stacks.
  - **D2/D7 N/A, rationale in the spec header.** D2: the core icon has no animation;
    the only motion on the page is the *skeleton* icon's shimmer, a WAAPI
    `element.animate()` sweep of `background-position` (not a CSS keyframe, `startTime
    = 0`, `2000ms ease-in-out infinite`, `100% → 0%`) that belongs to the Skeleton
    unit and is verified byte-identical by source read — the skeleton icon is
    deliberately **not** a D1/D3 part so its animated `background-position` never
    destabilises the capture. D7: an icon has no text node (the accent Button's label
    is the Button's surface, not the icon's). D4/D5/D8 N/A (`focusable={false}`, not
    pressable, no hit box).
  - Regression guard: `icons.certified.spec.ts` **10/10**; e2e-only addition (no
    src change, no rebuild — ran against the current build); standalone e2e `tsc -p`
    clean (added the spec to the scratchpad include list; caught + fixed a
    self-inflicted `margin*/gridArea*/` glob in the header comment that closed the
    JSDoc block early). No net change to the 4 pre-existing deferred D4
    event-ordering reds (Tabs ×2, Dialog ×2). Pre-existing unrelated `solid-h.ts:71`
    astro-check error unchanged.

- ✓ **Illustration done 2026-07-04 (CP9.13):** thirteenth new Tier-1 unit
  certified — the `createIllustration` HOC, sibling of `createIcon`, differing only
  in the base macro: a three-step **size scale (S 48 / M 96 / L 160)** instead of
  the icon's fixed 20. Spec `illustrations.certified.spec.ts` — 3 prop cases
  (default, size-l, hidden) × the applicable driver set = **14 tests green on the
  first run, a confirmatory green** (no divergence existed).
  - **Wrapper + size macro + glyph verified byte-identical to upstream**
    (`s2/src/Icon.tsx` vs `icon/spectrum-icon.tsx`): both render the passed
    `<Component>` svg with `role="img"`, `focusable={false}`, `data-slot`, the
    `size` passthrough, the `render` passthrough (`IllustrationContext.render`), and
    the same `aria-hidden` gate (`aria-label ? aria-hidden || undefined : true`).
    The port's `illustrationBaseStyles` is the same `style()` macro as upstream
    `illustrationStyles` — `{size: {S: 48, M: 96, L: 160}, flexShrink: 0}` over the
    same `allowedOverrides` list, default `M` via `size ?? ctx.size ?? "M"`. The
    demo's three glyphs (Plan / DropZone / IllustratedMessage) are byte-identical
    across stacks (same `viewBox`, `<rect>`/`<path>`/`<circle>` geometry, `fill:
    var(--iconPrimary, #222)`). Skeleton path DOM-equivalent (upstream
    `<SkeletonWrapper>` = no element outside a provider; port applies `loadingStyle`
    + `inert` + WAAPI ref directly).
  - **One driver-invisible DOM difference knowingly tolerated:** upstream's demo
    glyph spreads `{...props}` so the `size` prop leaks onto the svg as an invalid
    `size="S"` attribute; the port's glyph destructures `size` out. An unknown
    `size` attribute on `<svg>` has no computed-style/pixel/AX effect (svg sizes
    from width/height), so no driver observes it — and it is a demo-fixture artifact,
    not a library divergence (the library `createIllustration` is byte-identical).
  - **D1** diffed the labelled Plan illustration as `target` (S 48 in `default`, L
    160 in `size-l`) plus the `decorative` DropZone part (M 96) — so the sweep
    exercises the **whole size scale** across one default capture + the size-l case.
    `styleProps.add: ["flex-shrink"]` (size = width/height already in the default
    allowlist). Non-vacuous (part resolved to exactly one element). D3 pixel clean
    on the byte-identical Plan glyph at S and L in both themes (the page's WAAPI
    skeleton shimmer never touches the non-animating target). The `hidden` case
    re-confirms the S box is invariant under the aria-hidden gate flip.
  - **D6** pins `img "Planning illustration"` for the labelled illustration in
    `default` and its **absence** from the AX tree in `hidden` (`ariaHidden:"true"`
    flips the gate); the decorative + skeleton illustrations are always absent
    (aria-hidden / inert) — identically on both stacks.
  - **D2/D7 N/A, rationale in the spec header.** D2: the core illustration has no
    animation; the only motion is the *skeleton* shimmer (WAAPI `background-position`
    sweep, `2000ms ease-in-out infinite`, `100% → 0%` — Skeleton unit's, verified
    byte-identical by source read; the skeleton illustration is not a D1/D3 part so
    its animated `background-position` never destabilises the capture). D7: no text
    node. D4/D5/D8 N/A (`focusable={false}`, not pressable, no hit box).
  - Regression guard: `illustrations.certified.spec.ts` **14/14**; e2e-only addition
    (no src change, no rebuild — ran against the current build); standalone e2e
    `tsc -p` clean. No net change to the 4 pre-existing deferred D4 event-ordering
    reds (Tabs ×2, Dialog ×2). Pre-existing unrelated `solid-h.ts:71` astro-check
    error unchanged.

Phase 3: not started.
