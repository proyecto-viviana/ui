---
kind: reference
status: current
---

# Glossary

Status: live reference.
Update when: a term with reach is added, renamed, or redefined.

Vocabulary that appears in conversations about the system. Names with reach are
owner-steered (Rule #3); do not mint one silently.

## Layers & packages

- **Viviana UI** — Proyecto Viviana's open-source UI suite and design system.
  Built on Solid, with `@proyecto-viviana/ui` as the client-facing design-system
  package and the Solidaria/Solid Spectrum port stack beneath it.
- **solid-stately** — `@proyecto-viviana/solid-stately`. State layer (signals,
  controlled/uncontrolled, collections, selection). Mirrors `@react-stately`.
- **solidaria** — `@proyecto-viviana/solidaria`. Accessibility-hook layer (ARIA,
  keyboard, focus, press/hover). Mirrors `@react-aria`.
- **solidaria-components** — `@proyecto-viviana/solidaria-components`. Headless
  component layer (pre-wired state + ARIA, render props, data attributes, slots).
  Mirrors `react-aria-components`.
- **solid-spectrum** — `@proyecto-viviana/solid-spectrum`. Spectrum 2-compatible
  styled components. Mirrors `@react-spectrum/s2`. The only home for S2 component
  styling.
- **viviana-ui** — package directory for `@proyecto-viviana/ui`, the Viviana
  design-system package.

## Port Acceptance

- **Accepted / ported** — meets every evidence dimension in `certification.md`,
  backed by regression coverage that would fail if the behavior drifted. The
  only meaning of "done" for a component.
- **Evidence** — proof tied to a real failure mode. Export presence, route
  render, green axe, and stable screenshot are _floors_, not evidence of parity.
- **Acceptance gate** — one of the ten additive gates in
  `../../apps/comparison/playbook/acceptance-gates.md`. `complete` / `partial` /
  `not-started` per gate; a component is `accepted` only when all in-scope gates
  are `complete`.
- **Pair diff** — a strict React-vs-Solid comparison of the same public state.
- **Computed contract** — an assertion on computed style, attributes, geometry,
  or CSS variables, used where a screenshot is too coarse.

## Component status

- **parity / composition / viviana-native / tracked-gap** — styled-component
  statuses; see `architecture.md`.
- **Support export** — a context, slot, hook, helper, or support value (not a
  root catalogue component). Tracked separately from catalogue export parity.
- **Catalogue** — the set of official S2 entries tracked for parity.
- **Local addition** — a Solid-specific export (alias or composition helper) with
  no upstream counterpart; allowed only when explicit and documented, never
  silent drift.

## Harness

- **Comparison harness** — `apps/comparison`; the verifier (`architecture.md`).
  Not a styling source.
- **Route / fixture** — the harness surface that mounts React and Solid under the
  same props.
- **COMPONENT_PLAYBOOK** — `apps/comparison/COMPONENT_PLAYBOOK.md`; the task
  runner for porting/re-baselining one component.
