# Provider Validation Notes

Date: 2026-05-28
Status: tracked

## Target

- Component: Provider
- Slug: `provider`
- Family or direct subcomponents: `Provider`, `ColorSchemeContext`, I18n
  provider, router provider, `Fonts`, and nested S2 child components.
- Pass goal: keep Provider live on both comparison stacks with the official S2
  docs viewer controls, source-reviewed API inventory, nested scope evidence,
  and explicit pending work for final pixel acceptance.

## Acceptance Gate Checklist

- [x] Official Docs And Viewer Parity: S2 Provider docs and installed
      `@react-spectrum/s2/src/Provider.tsx` were checked. The Provider docs
      render exposes `colorScheme` and `background`, and the comparison controls
      now model only those docs-exposed props.
- [x] Upstream React Source Parity: source API inventory includes `children`,
      `locale`, `router`, `colorScheme`, `background`, `styles`,
      `elementType`, DOM props, `UNSAFE_className`, and `UNSAFE_style`.
- [x] React-Vs-Solid Harness Parity: React imports `@react-spectrum/s2`
      Provider/Button directly; Solid imports the public Solid Spectrum
      Provider/Button; both receive identical serialized route props.
- [x] Nested Scope Coverage: the default fixture keeps a nested light/base
      Provider to exercise local override inheritance inside the outer
      docs-modeled Provider.
- [x] Evidence And Handoff: modeled controls, React/Solid fixtures, and this
      note are refreshed. Provider remains tracked until strict pair-diff and
      source-to-computed acceptance are completed.

## Official Docs And Viewer Parity

| Docs item     | Official setting/example                        | Route/control                                  | Status  |
| ------------- | ----------------------------------------------- | ---------------------------------------------- | ------- |
| `colorScheme` | docs render exposes `colorScheme`, default dark | radio options `dark`, `light`, default `dark`  | modeled |
| `background`  | docs render exposes `background`, default base  | radio options `base`, `layer-1`, `layer-2`     | modeled |
| `locale`      | API/source prop, locale docs section            | API inventory; covered through locale routes   | tracked |
| `router`      | API/source prop                                 | API inventory; no visual Provider route yet    | tracked |
| `elementType` | API/source prop, SSR example uses `html`        | API inventory; not a docs viewer control       | tracked |
| `styles`      | S2 style macro override                         | API inventory; macro gates cover style system  | tracked |
| unsafe props  | `UNSAFE_className`, `UNSAFE_style`              | API inventory; fixture uses style escape hatch | tracked |

## Current Evidence

- `apps/comparison/src/data/provider-demo.ts` owns route defaults, docs control
  options, search-param parsing, normalization, and serialization.
- `apps/comparison/src/data/component-controls.ts` marks Provider as modeled
  with the same two props exposed by the official Provider page viewer.
- React and Solid Provider fixtures serialize the same
  `data-comparison-control-props` payload and keep the nested override fixture
  fixed so the comparison still shows inheritance and local scope.

## Pending Acceptance Work

- Add final source-to-computed Provider style assertions for root background,
  color scheme class output, `lang`/`dir`, and nested override behavior.
- Promote Provider from tracked to accepted only after strict React-vs-Solid
  pair-diff evidence passes for default and at least one alternate background
  state.
