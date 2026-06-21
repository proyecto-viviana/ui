---
kind: reference
status: current
---

# Architecture

Status: live reference.
Update when: layer boundaries, package roles, the styling boundary, or the
harness role change.

## The five-layer chain

Viviana UI is built on a layered Solid stack. The lower four packages are the
unofficial port stack; `@proyecto-viviana/ui` is the Viviana design-system
package on top. Each layer adds exactly one concern and depends only on the
layers below it:

```
@proyecto-viviana/ui                    product design system (package dir: viviana-ui)
  ↑
@proyecto-viviana/solid-spectrum        Spectrum 2-compatible styled components
  ↑
@proyecto-viviana/solidaria-components  headless components: pre-wired state + ARIA,
  ↑                                     render props, data attributes, slots
@proyecto-viviana/solidaria             accessibility hooks: ARIA props, keyboard,
  ↑                                     focus, press/hover
@proyecto-viviana/solid-stately         state: signals, controlled/uncontrolled,
                                        collections, selection
```

Upstream mapping:

| Upstream / role         | Viviana layer          | npm name                                 |
| ----------------------- | ---------------------- | ---------------------------------------- |
| `@react-stately/*`      | `solid-stately`        | `@proyecto-viviana/solid-stately`        |
| `@react-aria/*`         | `solidaria`            | `@proyecto-viviana/solidaria`            |
| `react-aria-components` | `solidaria-components` | `@proyecto-viviana/solidaria-components` |
| `@react-spectrum/s2`    | `solid-spectrum`       | `@proyecto-viviana/solid-spectrum`       |
| Viviana design system   | `viviana-ui`           | `@proyecto-viviana/ui`                   |

All five public packages are releasable: `solid-stately`, `solidaria`,
`solidaria-components`, `solid-spectrum`, and `@proyecto-viviana/ui`
(`release-policy.md`). `solidaria-test-utils` and `solid-spectrum-test-utils`
are private.

## Where behavior goes

**Put behavior in the lowest applicable layer** (Rule #4). State belongs in
`solid-stately`; ARIA/keyboard/focus in `solidaria`; composition, slots, render
props, and data attributes in `solidaria-components`. The upper layers must not
reimplement low-level behavior — `solid-spectrum` and `viviana-ui` may wrap a
headless component with a design-system API, compose several headless pieces into
an S2-like component, add Viviana-native components, and apply
themes/tokens/skins, but never fork ARIA or state logic.

## Where styling goes

S2 component styling lives **only** in `solid-spectrum`, generated from S2 tokens
through the style macro — never hand-authored, never tuned to make a screenshot
pass (ADR 0001, `../../docs/adr/0001-s2-styling-source-of-truth.md`). Generated
atomic classes are build output, not architecture. The comparison app _verifies_
styling; its hand-written CSS is limited to harness layout, controls, panels, and
screenshot frames — never component-internal colors, padding, radius, focus
rings, or visual states.

## Styled-component status

Track each styled export as one of:

- `parity` — intended to match an upstream S2 component exactly.
- `composition` — an S2-like productized API assembled from multiple headless
  primitives.
- `viviana-native` — a first-class Viviana component with no upstream S2
  counterpart.
- `tracked-gap` — a known missing parity component or comparison route.

React Aria Components does not expose every Spectrum component 1:1; Spectrum adds
productized wrappers above RAC, and the styled layers may do the same. A
`composition` or `viviana-native` component is not an upstream gap.

## Build order

Packages build bottom-up; this is wired into the root `build` script:

```
solid-stately → solidaria → solidaria-components → solid-spectrum → viviana-ui
```

Inter-package dependencies use explicit caret ranges; Changesets updates them on
bump.

## Why ship source via the `solid` export condition

Each package exposes a `solid` export condition pointing at `src` so Solid
bundlers compile JSX for the consumer's target (client vs SSR), with an `import`
fallback of pre-compiled output for non-Solid bundlers. Pre-compiling only would
lock consumers to one target. This is the approach official Solid libraries use.

## The comparison harness

`apps/comparison` is the verification harness, not a styling source. It mounts
the real upstream React component and the ported Solid component side by side
under the same route props, and proves parity through pair diffs, computed
contracts, and focused interaction tests. It is governed by
`apps/comparison/COMPONENT_PLAYBOOK.md` and may dogfood `solid-spectrum`, but
component-internal styling belongs in the package, never the app.

## Solid idioms

Porting React to Solid has recurring traps — `splitProps` dropping DOM
attributes, JSX children evaluating before parent context is set, getters for
controlled props. These are documented in `../reference/patterns.md`; consult it
before porting compound or context-driven components.
