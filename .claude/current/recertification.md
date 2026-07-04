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
(2026-07-04)` — remaining march order above is the queue; mark components here as
`✓ name (date)` when certified, `blocked: name (reason)` otherwise.

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

Phase 3: not started.
