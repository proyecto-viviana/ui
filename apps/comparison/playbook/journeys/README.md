# Interaction journeys (D13)

A journey is a multi-step interaction (mouse, keyboard, touch, viewport, clock)
run against the React and Solid panels of one comparison route, with the ten
D13 observations collected after every step and diffed step by step. The
driver is `apps/comparison/e2e/drivers/journeys.ts` (#244). The certification
row is D13 in `.claude/current/certification.md`.

This directory is the **inventory**: for each component, every user-observable
upstream behavior, expressed as journey steps with the expectation after each
step, cited to the upstream source at the pin in `scripts/upstream-pin.json`.
A behavior that is not in the inventory is not certified; a journey that is in
the inventory and not implemented is an open gap, never an implied pass.

## Files

| file                | component                                                                                        | route                                                                                                                          | ticket           |
| ------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| `combobox.md`       | S2 ComboBox / `solid-spectrum` ComboBox                                                          | `/components/combobox`                                                                                                         | #245             |
| `picker.md`         | S2 Picker (RAC Select) / `solid-spectrum` Picker                                                 | `/components/picker`                                                                                                           | #246             |
| `shared-overlay.md` | Popover / positioning / dismissal / aria-hiding / animation / selection machinery shared by both | — (steps are folded into the component files; this file is the ledger of shared facts and which component journeys prove them) | #245, #246, #249 |

## How to read a journey

```
J-ID  title                                   fixture: <route params / presets>
  1. <step in driver vocabulary>            → <expected observation after the step>
  2. ...
  facts: <upstream fact ids proved by this journey>
  class: <default | motion | timing | ua:apple | unit-only>
```

- Step verbs are the driver's: `click(target)`, `dblclick`, `hover`, `hoverOut`,
  `mouseDown/mouseUp(x,y)`, `wheel(dx,dy,target?)`, `drag`, `press(key)`,
  `type(text)`, `tap(target)`, `resize(w,h)`, `scrollPage(y)`, `clock(ms)`,
  `settle(ms)`, `clickOutside`. Verbs marked ★ are **driver extensions** the
  component tickets must add to `journeys-steps.ts` before using them:
  ★`focus(target)`, ★`keyDown/keyUp(key)` (hold-repeat), ★`touchDown/touchUp`
  (press-start vs press-up on touch, via CDP `Input.dispatchTouchEvent`),
  ★`dispatch(target, eventType)` (synthetic `scroll` on an ancestor),
  ★`control(name, value)` (change a fixture control mid-journey; the fixture
  re-renders with the new prop), ★`submit` / ★`reset` (click the fixture form's
  buttons).
- Targets: `trigger` (the chevron button), `input` (ComboBox text input),
  `field` (the RAC wrapper), `label`, `option(n)` / `option("text")`,
  `listbox`, `overlay` (the popover root), `section(n)`, `outside`,
  `before` / `after` (tabbable sentinels the fixture renders around the
  component), `dialogBackdrop`, `helpButton`.
- Expectations name the observation class they read: `dom` (normalized panel
  - overlay tree), `input` (value / selection), `focus` (active element,
    active descendant, focus-visible), `form` (FormData), `overlay` (dx/dy to
    trigger, placement, widthDelta, insideViewport, opacity, visibility,
    transform, pointerEvents), `list` (scrollTop, optionCount,
    focusedOptionInView), `events` (DOM events with `defaultPrevented`), `ax`
    (accessibility tree and live regions), `document` (overflow, padding,
    aria-hidden/inert sibling count), `pixel`. Callback arguments
    (`onOpenChange`, `onSelectionChange`, `onInputChange`, `onFocus`/`onBlur`
    order) are read from the fixture's `data-comparison-events` attribute, which
    the fixture tickets must expose on both stacks.
- Every step is diffed React vs Solid. The **expected** column is what React
  does at the pin, written down so a divergence is attributable to a specific
  upstream branch — the driver never asserts the expectation text directly, it
  asserts React == Solid, and the text tells the author what "React" means.

## Classes

- `default` — strict step diff.
- `motion` — the step is observed while a CSS transition may be running.
  Both stacks must be in the same **phase** (`entering` / `settled` / `exiting`)
  and the phase is derived from `data-entering` / `data-exiting` + opacity;
  exact opacity is compared only after a `settle(300)`.
- `timing` — depends on a mocked clock (`clock(ms)`), e.g. the 500 ms S2
  spinner delay, the 1000 ms typeahead buffer, the 500 ms VoiceOver double
  touch-end debounce.
- `ua:apple` — needs `navigator.platform` = `MacIntel` via `addInitScript`
  so `isAppleDevice()` is true (VoiceOver announcements go through the live
  announcer and are read from `ax.live`).
- `unit-only` — the branch is real upstream behavior but is not reachable
  through the S2 component the harness mounts (RAC-only prop, hook-only
  branch, JSDOM-only observation). It is listed so it is not silently dropped;
  it is proved in the headless package tests (`solidaria` /
  `solidaria-components`), and the fact id is cited from there.

## Fixture prerequisites

Each component file opens with the fixture matrix its journeys need. Controls
that do not exist today are marked **(add)** and must be added to **both** the
React and Solid fixtures in the same change, with a `data-comparison-*`
attribute for anything the driver has to read (callback log, submit count,
FormData snapshot, `onLoadMore` count).

## Source of the facts

The rows were extracted read-only from the upstream test suites, test-utils
protocols, and source at the pin (RAC `ComboBox` / `Select` / `Popover` /
`ListBox` tests, `useComboBox` / `useSelect` / `HiddenSelect` hook tests, S2
`Combobox` / `Picker` tests, `@react-aria/test-utils` protocols,
`useOverlayPosition` / `calculatePosition` / `useOverlay` / `useInteractOutside`
/ `ariaHideOutside` / `usePreventScroll` / `useFocusVisible` /
`useSelectableCollection` tests, and the `animation.ts` / `useCloseOnScroll` /
`useTypeSelect` sources). Every fact carries its `file:line`. Verification
status is per fact: rows sampled by the orchestrator are marked in the ledger;
every other row is verified by the journey author opening the cited line
before writing the step (Rule #6 — the code is the authority, the ledger is a
map to it).
