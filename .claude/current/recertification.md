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

Phase 0: `0.1 ☑ 0.2 ☑ 0.3 ☑ 0.4 ☑ 0.5 ☐ 0.6 ☐`

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

Phase 1: `D1 ☐ D2 ☐ D3 ☐ D4 ☐ D5 ☐ D6 ☐ D7 ☐ D8 ☐ D9 ☐ D10 ☐ D11 ☐ D12 ☐`
Phase 2: not started — march order above is the queue; mark components here as
`✓ name (date)` when certified, `blocked: name (reason)` otherwise.
Phase 3: not started.
