---
kind: research
status: current
---

Status: Current source of truth.
Update when: this research pack is revised, superseded, or relocated.

# Depth audit — Button family

## Stage

This is a first depth-first source audit slice after the breadth map. It is still research-only: no implementation code was changed and no component is newly certified by this file.

## Scope audited

Local Solid surfaces:

- `packages/solid-spectrum/src/button/Button.tsx`
- `packages/solid-spectrum/src/button/ActionButton.tsx`
- `packages/solid-spectrum/src/button/LinkButton.tsx`
- `packages/solid-spectrum/src/button/ToggleButton.tsx`
- `packages/solid-spectrum/src/buttongroup/index.tsx`
- `packages/solid-spectrum/src/actionbuttongroup/index.tsx`
- `packages/solid-spectrum/src/togglebuttongroup/index.tsx`
- `packages/solidaria-components/src/Button.tsx`
- `packages/solidaria-components/src/ToggleButton.tsx`
- `packages/solidaria-components/src/ToggleButtonGroup.tsx`
- `packages/solidaria/src/button/createButton.ts`
- `packages/solidaria/src/button/createToggleButton.ts`
- `packages/solidaria/src/button/createToggleButtonGroup.ts`
- `packages/solid-stately/src/toggle/createToggleState.ts`
- `packages/solid-stately/src/toggle/createToggleGroupState.ts`

Upstream surfaces:

- `@react-spectrum/s2/src/Button.tsx`
- `@react-spectrum/s2/src/ActionButton.tsx`
- `@react-spectrum/s2/src/ButtonGroup.tsx`
- `@react-spectrum/s2/src/ActionButtonGroup.tsx`
- `@react-spectrum/s2/src/ToggleButtonGroup.tsx`
- installed `react-aria-components@1.17.0` package surface; source-rich `.tsx` internals were not available in this package tree.

## Equivalency map

| Family member | Local Solid implementation | Primary upstream S2 equivalent | Behavior layer |
|---|---|---|---|
| `Button` | `solid-spectrum` wraps `solidaria-components/Button`. | S2 `Button` wraps RAC `Button`. | `solidaria-components/Button` + `solidaria/createButton`. |
| `LinkButton` | Separate Solid wrapper over headless `Link`. | S2 `LinkButton` in upstream `Button.tsx`. | `solidaria-components/Link` needs follow-up audit. |
| `ActionButton` | S2 wrapper over headless `Button`, with group context and action-button styles. | S2 `ActionButton`. | `solidaria-components/Button`; menu-trigger glue currently lives in S2 wrapper. |
| `ToggleButton` | S2 wrapper over headless `ToggleButton`, sharing action-button styles. | S2 action/toggle styling in `ActionButton.tsx` plus RAC `ToggleButtonGroup`. | `solidaria-components/ToggleButton`, `solidaria/createToggleButton`, `solid-stately` toggle state. |
| `ButtonGroup` | S2 group with overflow measurement and Button/LinkButton context. | S2 `ButtonGroup`. | DOM measurement and context. |
| `ActionButtonGroup` | S2 group over headless `Toolbar`. | S2 `ActionButtonGroup` over RAC `Toolbar`. | `solidaria-components/Toolbar`. |
| `ToggleButtonGroup` | S2 group over headless `ToggleButtonGroup`. | S2 `ToggleButtonGroup` over RAC `ToggleButtonGroup`. | `solidaria-components/ToggleButtonGroup`, `solidaria/createToggleButtonGroup`, `solid-stately/createToggleGroupState`. |

## Findings

### BTN-001 — pending Button behavior is structurally close but split across wrapper and headless layers

- Upstream delays visible pending progress by 1000 ms.
- Local `Button` uses `createPendingState` and visual state maps pending progress into disabled styling after the delay.
- Local headless `Button` also suppresses interactions, changes pending submit buttons to `type="button"`, and announces pending state changes for focused buttons.
- Risk: parity depends on both `solid-spectrum/Button` and `solidaria-components/Button`, not only the styled wrapper.
- Required proof: tests must separately prove immediate press suppression, delayed progress visibility, form-submit suppression, and announcements.

### BTN-002 — overlay-open hover retention is stricter than upstream

- Upstream S2 Button/LinkButton retain hover when overlay trigger state is open.
- Local Button/LinkButton require the current element to equal the DialogTrigger/PopoverTrigger ref.
- This may be a Solid-specific correctness improvement, but it is a source-shape divergence.
- Required proof: pair tests for trigger vs non-trigger buttons inside overlay context, pointer activation, keyboard activation, and gradient/press-scale state.

### BTN-003 — ActionButton carries menu-trigger ARIA/key forwarding in the S2 layer

- Local `ActionButton` includes explicit menu trigger context wiring: dynamic `aria-haspopup`, `aria-expanded`, `aria-controls`, `aria-disabled`, manual DOM attribute syncing, and ArrowUp/ArrowDown forwarding.
- Upstream S2 `ActionButton` delegates behavior through RAC Button and menu trigger composition elsewhere.
- Risk: ARIA/focus behavior appears in `solid-spectrum`, which may violate the intended layer boundary unless proven S2-specific.
- Required proof: menu-trigger tests for initial attributes, open/close updates, `aria-controls`, ArrowUp/ArrowDown open/focus, disabled/pending stale attributes.

### BTN-004 — LinkButton appears to miss upstream form-context propagation

- Upstream S2 `LinkButton` applies `useFormProps`.
- Local `LinkButton` applies provider/context props, but the audited file did not show `useFormProps`.
- Risk: form-level disabled/validation/read-only propagation may differ for LinkButton while normal Button uses `useFormProps`.
- Required proof/fix: verify whether `useProviderProps` subsumes form props; otherwise add `useFormProps` and tests.

### BTN-005 — standalone ToggleButton state is owned in `solidaria`, not `solid-stately`

- `solid-stately/createToggleState` exists and includes read-only semantics.
- `solidaria/createToggleButton` keeps its own signal and does not expose or honor `isReadOnly` in the audited flow.
- Risk: state ownership violates repo layering and may diverge from React Stately edge cases.
- Required proof/fix: consume `createToggleState` or equivalent state object; test controlled/uncontrolled state, call order, read-only behavior, and `aria-pressed` reactivity.

### BTN-006 — ToggleButtonGroup single-selection ARIA may diverge from RAC

- Local `createToggleButtonGroup` emits `radiogroup` for single selection and item `radio` / `aria-checked` instead of toggle-button semantics.
- Upstream S2 wraps RAC `ToggleButtonGroup`, not RadioGroup.
- Risk: screen reader roles, role queries, and keyboard model may be wrong.
- Required proof: inspect RAC source for the matching version and run React-vs-Solid accessibility tests for roles, `aria-pressed` vs `aria-checked`, names, and keyboard.

### BTN-007 — ToggleGroupState edge cases are unverified

- Local state supports selected keys, disallow-empty, and single/multiple modes.
- Upstream React Stately `useToggleGroupState` source was not located in the installed tree during this slice.
- Risk: disabled-key handling, item collection awareness, and selection-manager semantics may differ.
- Required proof: upstream source retrieval plus state-only transition tests.

### BTN-008 — ButtonGroup overflow is close but timing-sensitive

- Local and upstream both measure children with `offsetLeft`/`offsetWidth` and observe parent resize.
- Upstream uses `useValueEffect` to force horizontal measurement before deciding overflow; local approximates with `setHasOverflow(false)` plus `requestAnimationFrame`.
- Risk: timing differences under SSR, no-RAF, fake timers, and child content changes without parent resize.
- Required proof: tests for initial layout, overflow switching, `align="end"`, child content mutation, parent resize, and explicit vertical orientation.

## Highest-risk blockers from this slice

1. `ToggleButtonGroup` single-selection ARIA semantics.
2. `createToggleButton` state living outside `solid-stately` and missing read-only parity.
3. LinkButton form-context parity.
4. ActionButton trigger behavior living in S2 wrapper.
5. Pending Button behavior needing real timing/form/announcement tests.

## Commands used by the depth-audit agent

- `pwd && find .. -name AGENTS.md -print && git status --short --branch`
- `cat AGENTS.md && rg -n "Button|ActionButton|ToggleButton|ButtonGroup|LinkButton" packages apps -g '*.{ts,tsx,css,md}'`
- `find packages/solid-spectrum/src/button packages/solid-spectrum/src/buttongroup packages/solid-spectrum/src/actionbuttongroup packages/solid-spectrum/src/togglebuttongroup packages/solidaria-components/src packages/solidaria/src/button packages/solid-stately/src/toggle -maxdepth 2 -type f -print`
- `nl -ba <audited files> | sed -n <ranges>`
- `rg -n "export const|function|usePendingState|LinkButton|ToggleButton|MenuTrigger|aria-haspopup|isPending|Provider|ProgressCircle" <upstream S2 files>`
- `git status --short --branch`
