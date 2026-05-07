# Proyecto Viviana

SolidJS port of Adobe's React Aria and Spectrum 2 stack. The repo is layered as state, behavior, headless components, and styled components.

## Packages

| Package                                                   | npm                                      | Purpose                                                        |
| --------------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------- |
| [`solid-stately`](./packages/solid-stately)               | `@proyecto-viviana/solid-stately`        | State hooks — port of `@react-stately/*`                       |
| [`solidaria`](./packages/solidaria)                       | `@proyecto-viviana/solidaria`            | ARIA behavior hooks — port of `@react-aria/*`                  |
| [`solidaria-components`](./packages/solidaria-components) | `@proyecto-viviana/solidaria-components` | Headless/stylable components — port of `react-aria-components` |
| [`solid-spectrum`](./packages/solid-spectrum)             | `@proyecto-viviana/solid-spectrum`       | Spectrum 2-compatible styled Solid components                  |

```
solid-spectrum        Spectrum 2-compatible styled components
  ↑
solidaria-components  headless/stylable components
  ↑
solidaria             ARIA behavior
  ↑
solid-stately         state
```

Consumers can opt into any layer; higher layers compose lower ones without pulling extras. `solid-spectrum` is the package compared pixel-for-pixel against Adobe Spectrum 2 in the comparison app. `viviana-ui` is planned as Proyecto Viviana's own design system, separate from S2 parity.

## Quick start

```bash
vp install
vp run dev                 # docs + playground on localhost:3000
vp run comparison:dev      # side-by-side parity harness
vp test run packages         # unit suite
```

## Contributing

Tracked project docs live under [`docs/`](./docs):

1. [`docs/CURRENT_STATUS.md`](./docs/CURRENT_STATUS.md) - check this first
   before continuing S2 parity work.
2. [`docs/adr/0001-s2-styling-source-of-truth.md`](./docs/adr/0001-s2-styling-source-of-truth.md)
3. [`docs/s2-styling-and-package-plan.md`](./docs/s2-styling-and-package-plan.md)
4. [`docs/release-policy.md`](./docs/release-policy.md)
5. [`docs/tooling.md`](./docs/tooling.md)

## License

[Apache-2.0](./LICENSE).
