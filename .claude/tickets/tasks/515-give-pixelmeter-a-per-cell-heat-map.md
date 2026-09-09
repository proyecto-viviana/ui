---
id: 515
type: task
title: "Give PixelMeter a per-cell heat map"
created: 2026-09-09
status: open
history:
  - { state: open, at: 2026-09-09, note: "filed from the Terminal Glass port handoff on 117a2886" }
---

`PixelMeter shape="grid"` draws 26 × 7 = 182 cells but fills them from **one**
`value`: `litCount()` quantizes the percentage to a lit-cell count and `inkFor()`
picks the strength by how far back a cell sits from that boundary
(`packages/viviana-ui/src/meter/PixelMeter.tsx:349-362`). Every cell before the
boundary is lit, the last `levels - 1` of them fade, the rest are on the hairline.
That is a streak, not a map.

The handoff's profile activity map shades each day on its own — the four-level
ramp the component already paints (`rest / 28% / 62% / full`,
`PixelMeter.tsx:205-211`) is meant to be indexed per cell, not by depth.

The profile screen already carries the real per-day data and has to throw it away:
`HEAT` is 182 levels in `0…3` (`apps/web/src/components/examples/data.ts:456-463`),
and `profile.tsx:42-43` collapses it to `HEAT_ACTIVE` — the count of days with any
activity at all — before handing it to the meter
(`apps/web/src/routes/examples/profile.tsx:96-102`). The route comment says so in
as many words (`profile.tsx:38-41`). The numbers: 147 of 182 days are active, and
the discarded distribution is 77 low / 56 mid / 14 full. The screen paints 147
lit cells in reading order instead of the handoff's scatter.

## Scope

`packages/viviana-ui/src/meter/PixelMeter.tsx` — the cell loop and the props, plus
the showcase panel (`apps/web/src/routes/showcase/status.tsx`) and the profile
screen once the prop exists.

The API question the owner decides: how a caller hands the meter one level per
cell. **Recommended default:** a new `values?: readonly number[]` prop — one
integer per cell, `0` = rest and `1…levels - 1` indexing the ink ramp — which
overrides `value` for painting only. The root stays a `role="meter"` reporting
`value` / `maxValue` for assistive technology (the cells are already
`aria-hidden`, `PixelMeter.tsx:387`); when `values` is given and `value` is not,
`value` defaults to the count of non-zero entries and `maxValue` to
`values.length`, which is exactly what profile computes by hand today. Extra
entries are ignored, missing ones are rest, so a short array cannot break the
grid geometry. Veto it if the owner would rather the prop replace `value`
outright or be named for the map rather than the cells.

No new lead-edge behaviour: with `values` there is no boundary, so `isLead`
(`PixelMeter.tsx:362`) is off. Channel ink is unchanged — a metric map stays
cyan; the map is a readout, never the ask, so it never takes fuchsia.

## Done when

- `PixelMeter shape="grid"` renders 182 distinct per-cell levels from the
  profile's `HEAT` array, and `profile.tsx` no longer derives `HEAT_ACTIVE` /
  `HEAT_CELLS` for the fill.
- The root still exposes `role="meter"` with `aria-valuenow` / `aria-valuemax`
  and its accessible name, verified in a test, not by eye.
- `row` and `ring` are byte-identical to today when `values` is absent; the
  existing `value`-driven grid still works.
- A regression test names the failure: a `values` array with a rest cell between
  two lit ones must paint the gap as rest (the old depth rule cannot).
- The showcase panel shows the map form; `.claude/current/glasselated-port.md`
  drops this from its gap list.

## Proof

```
vp run build:viviana-ui
vp run build:web
vp run guard:examples-purity
vp exec --filter @proyecto-viviana/web -- playwright test e2e/examples.spec.ts
vp run a11y:axe:aa
vp run api:extract && vp run guard:api-reference
```

Plus a minor Changeset on `@proyecto-viviana/ui` (additive prop).

## Relationship

One of the five library gaps the Terminal Glass port surfaced: #516, #517, #518,
#519. Sibling concern to #103 (Glasselated mirror gaps) — same class of "the app
composed around a missing library capability", different register cut. Example
route: `/examples/profile`.
