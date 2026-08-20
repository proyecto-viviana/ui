---
kind: reference
status: current
---

# Architecture

Status: live reference.
Update when: layer boundaries, package roles, the styling boundary, or the
harness role change.

## The shared foundation and styled layers

Viviana UI has a shared Solid foundation. Three standalone styled packages use
that foundation.

The lower three packages are the unofficial React Aria port stack. Each package
adds one concern and depends only on lower packages.

```
@proyecto-viviana/solidaria-components  headless components: pre-wired state + ARIA,
  ↑                                     render props, data attributes, slots
@proyecto-viviana/solidaria             accessibility hooks: ARIA props, keyboard,
  ↑                                     focus, press/hover
@proyecto-viviana/solid-stately         state: signals, controlled/uncontrolled,
                                        collections, selection

@proyecto-viviana/solidaria-components
  ├─ @proyecto-viviana/solid-spectrum   Spectrum 2 styled components
  ├─ @proyecto-viviana/ui               Viviana design system
  └─ @proyecto-viviana/kumo             experimental Kumo styled components
```

Upstream mapping:

| Upstream / role         | Viviana layer          | npm name                                 |
| ----------------------- | ---------------------- | ---------------------------------------- |
| `@react-stately/*`      | `solid-stately`        | `@proyecto-viviana/solid-stately`        |
| `@react-aria/*`         | `solidaria`            | `@proyecto-viviana/solidaria`            |
| `react-aria-components` | `solidaria-components` | `@proyecto-viviana/solidaria-components` |
| `@react-spectrum/s2`    | `solid-spectrum`       | `@proyecto-viviana/solid-spectrum`       |
| Viviana design system   | `viviana-ui`           | `@proyecto-viviana/ui`                   |
| Cloudflare Kumo         | `kumo`                 | `@proyecto-viviana/kumo`                 |

All six public packages are releasable. The Kumo package is still experimental
and has an initial-publish blocker (`release-policy.md`). `solidaria-test-utils`
and `solid-spectrum-test-utils` are private.

## Where behavior goes

**Put behavior in the lowest applicable layer** (Rule #4). State belongs in
`solid-stately`. ARIA, keyboard, and focus belong in `solidaria`. Composition,
slots, render props, and data attributes belong in `solidaria-components`.
The three styled packages must not reimplement low-level behavior. They can
wrap or compose headless components and apply design-system APIs and styles.

## Where styling goes

S2 component styling lives **only** in `solid-spectrum`, generated from S2 tokens
through the style macro — never hand-authored, never tuned to make a screenshot
pass (ADR 0001, `../../docs/adr/0001-s2-styling-source-of-truth.md`). Generated
atomic classes are build output, not architecture. The comparison app _verifies_
styling. Its hand-written CSS is limited to harness layout, controls, panels,
and screenshot frames. It must not define component colors, padding, radius,
focus rings, or visual states.

Kumo styling lives in `packages/kumo`. Copy Kumo values from the pinned
Cloudflare source. Do not use S2 styles for Kumo.

## Styled-component status

Track each styled export as one of:

- `parity` — intended to match an upstream S2 component exactly.
- `composition` — an S2-like productized API assembled from multiple headless
  primitives.
- `viviana-native` — a first-class Viviana component with no upstream S2
  counterpart.
- `tracked-gap` — a known missing parity component or comparison route.

The Kumo package uses the same evidence rule. Its first Button slice is an
experiment, not a parity component.

React Aria Components does not expose every Spectrum component 1:1. Spectrum
adds productized wrappers above RAC, and the styled layers may do the same. A
`composition` or `viviana-native` component is not an upstream gap.

## Build order

Packages build the shared foundation first. The three styled packages then
build as siblings:

```
solid-stately → solidaria → solidaria-components
                                     ├─ solid-spectrum
                                     ├─ viviana-ui
                                     └─ kumo
```

Source manifests use `workspace:*`. The release process writes registry versions.

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

Porting React to Solid has recurring traps. Examples include `splitProps`
dropping DOM attributes, early JSX child evaluation, and controlled props
without getters. Read `../reference/patterns.md` before you port compound or
context-driven components.
