# Route Harness

The comparison route is the first gate. Do not audit styling or screenshots
until both stacks are mounted and driven by the same controls.

## Files

```bash
rg -n '"<slug>"' apps/comparison/src/data/comparison-manifest.ts
rg -n '"<slug>"' apps/comparison/src/data/component-controls.ts
rg -n '"<slug>"' apps/comparison/src/data/visual-state-matrix.ts
rg --files apps/comparison/src/components | rg '/<slug>\.(tsx|jsx)$'
rg --files apps/comparison/e2e | rg '<slug>.*\.spec\.ts$'
```

## Requirements

- Manifest entry uses the official S2 catalogue slug and docs URL.
- Each layer has explicit `react` and `solid` statuses.
- React fixture imports the real `@react-spectrum/s2` component.
- Solid fixture imports from `@proyecto-viviana/solid-spectrum`.
- Each fixture exposes exactly one `data-comparison-control-root`.
- Each fixture serializes current props in `data-comparison-control-props`.
- Side-panel controls use public S2 prop names.
- Side-panel controls cover every behavior/style/a11y-affecting setting from
  the official S2 interactive viewer, or record a route gap.
- Side-panel controls match the official viewer's visible option labels, option
  order, and selected/default state. Internal route sentinels used to represent
  omitted props must not be exposed as public options.
- Optional props are tested in two separate states when the official viewer does
  this: no prop selected/passed, and an explicit option such as `auto` selected.
  Do not collapse these unless current React behavior proves they are
  equivalent.
- Route examples exercise the same documented child composition as the official
  page: slots, labels, icons, descriptions, errors, images, avatars,
  collection items, and portals where applicable.
- At least one Playwright test proves both panels render and no missing fallback
  is present.
- Focused control tests prove modeled settings change mounted React and Solid
  DOM, not only serialized props.
- Focused control tests include at least one assertion over the control surface
  itself for modeled optional props: expected option values/order, selected
  default, and absence of non-official sentinel options.

## Evidence

Record before/after lines from:

```bash
vp run comparison:report:gaps
vp run comparison:report:exports
```
