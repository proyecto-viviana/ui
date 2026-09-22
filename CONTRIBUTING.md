# Contributing

This repository ports Adobe's React Stately, React Aria, React Aria
Components, and React Spectrum S2 to Solid, and adds two experimental skins.
A port is accepted on evidence, not on a working demo. Read
[what a ported component must pass](https://github.com/proyecto-viviana/ui/blob/main/.claude/current/certification.md)
before you open a change.

## Setup

The package manager is pnpm `11.22.0`, driven through `vp` (Vite Plus).

```bash
vp install
vp config      # installs the git hooks, once per checkout
```

`vp config` writes the shims. The tracked entrypoint is
`.vite-hooks/pre-commit`, and it runs `vp staged` — format and lint over the
staged files only. Generated shims under `.vite-hooks/_` stay untracked.

## Commands

| do         | run                     |
| ---------- | ----------------------- |
| install    | `vp install`            |
| check      | `vp run check`          |
| test       | `vp run test`           |
| build      | `vp run build`          |
| lint       | `vp lint`               |
| docs site  | `vp run dev`            |
| comparison | `vp run comparison:dev` |

`vp run check` is format, type-aware lint, and typecheck. `vp run test:run`
runs the package suites once. Before you push something that touches a
published package, run the release gate:

```bash
vp run ci:release-readiness
```

Run it locally first. CI is the second opinion, not the first: the
`release-readiness` workflow runs the same command, and it can be switched off
between releases.

## How a port is certified

A component is "ported" only with regression coverage across all eight
dimensions: API, ARIA and accessibility, keyboard and focus, forms and
validation, behavior and timing, styling, visual parity, and i18n.

An export in the barrel, a route that renders, a green axe run, one passing
unit test, and a stable screenshot are **floors**. None of them accepts a
component. The ten acceptance gates in
[`apps/comparison/playbook/acceptance-gates.md`](https://github.com/proyecto-viviana/ui/blob/main/apps/comparison/playbook/acceptance-gates.md)
are additive: one gate never substitutes for another, and a component is
`accepted` only when every in-scope gate is `complete`.

The floors, run constantly:

```bash
vp run check
vp run test:run
```

The docs site's accessibility run, `vp run a11y:check`, is not green in this
candidate and carries exemption lists
(`apps/web/e2e/helpers/target-size-exemptions.ts`); run it, but do not read it
as proof.

The component-level evidence, per component:

```bash
vp run comparison:test:pair        # React-vs-Solid pair diffs
vp run comparison:test:contract    # computed-style and attribute contracts
vp run comparison:test:<component> # keyboard, focus, forms, announcements
vp run comparison:report:acceptance
```

The per-component runner is
[`apps/comparison/COMPONENT_PLAYBOOK.md`](https://github.com/proyecto-viviana/ui/blob/main/apps/comparison/COMPONENT_PLAYBOOK.md).

## Upstream pins

Parity is measured against an exact upstream revision, recorded in
[`scripts/upstream-pin.json`](https://github.com/proyecto-viviana/ui/blob/main/scripts/upstream-pin.json):
`@react-spectrum/s2@1.7.0` and `react-aria-components@1.21.0` at commit
`f56660b2`, pinned 2026-09-02.

Mirror upstream. Do not invent a size, a name, or a behavior that an upstream
answer already gives. Geist is the exception: `@vercel/geistcn` is not on
public npm, so Geist follows the public docs.

`vp run guard:upstream-oracle` verifies the pinned inputs are present. Missing
or mismatched upstream inputs are a gate failure, never a green skip.

## Changesets

Five packages are published: `@proyecto-viviana/solid-stately`,
`@proyecto-viviana/solidaria`, `@proyecto-viviana/solidaria-components`,
`@proyecto-viviana/solid-spectrum`, and `@proyecto-viviana/ui`.

Touch any of the five and the change needs a changeset that **names that
package**. A changeset releases only the packages it names, so a commit
touching two packages while carrying a changeset for one of them strands the
other at its published version with newer source.

```bash
vp run changeset
```

`vp run ci:changesets` enforces this. Release is a merge of the accumulated
"Version Packages" pull request; do not publish by hand.

## Dependencies

Never add a dependency. Check what the workspace, the framework, and the
existing packages already provide first, and ask before proposing a new one.

## License

MIT for our work. The Adobe-derived stack keeps Apache-2.0 and its notices;
Kumo-derived values keep the Cloudflare MIT notice. Credit sources in
[`CREDITS.md`](https://github.com/proyecto-viviana/ui/blob/main/CREDITS.md).
