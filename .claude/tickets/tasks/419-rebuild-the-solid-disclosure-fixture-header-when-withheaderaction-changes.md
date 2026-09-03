---
id: 419
type: task
title: "Rebuild the Solid Disclosure fixture header when withHeaderAction changes"
created: 2026-09-03
parent: 26
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 disclosure functional pass: URL ?withHeaderAction=false drops Edit on both (trigger 250×32); live {withHeaderAction:false} updates the fixture JSON on both and React drops the action while Solid keeps Edit (trigger 222×32). Reverse from ?withHeaderAction=false then live true adds Edit on React and leaves Solid without it. Solid fixture calls disclosureHeader() once as a static hc() child. Switch fixture already uses get children(). Not a Disclosure prop — withHeaderAction is harness composition.",
    }
---

The comparison Disclosure Solid fixture builds header children once:

```ts
hc(SolidSpectrumDisclosure, { /* live size/density/quiet/disabled/expanded */ }, [
  disclosureHeader(), // evaluated once
  hc(SolidSpectrumDisclosurePanel, …),
]);
```

`disclosureHeader()` branches on `demoProps().withHeaderAction` at that
call. Live `comparison:controls-change` updates
`data-comparison-control-props` and the live size/disabled/expanded
getters, but the already-mounted header/title/action tree stays at
the mount-time composition. React re-renders the header from
`demoProps.withHeaderAction` every time.

URL remount (`?withHeaderAction=false`) matches because both islands
build children from the search params.

The Switch comparison fixture already uses `get children()`. This is
that same harness gap, not a Disclosure `withHeaderAction` prop
(there isn't one).

## Evidence

`http://127.0.0.1:4341/components/disclosure/`, islands mounted.
`comparison:controls-change` `{withHeaderAction:false}` (other demo
defaults). Other `.s2-framework-panel` not required.

| | React | Solid |
|---|---|---|
| fixture JSON | `withHeaderAction:false` | same |
| AX | heading + group only | heading + **Edit system requirements** + group |
| trigger width | **250** | **222** |
| action button | absent | 24×24, not nested |

From `?withHeaderAction=false` then live `{withHeaderAction:true}`:
React adds Edit (trigger 222); Solid stays title-only (trigger 250).

`?withHeaderAction=false` rest: both title-only, trigger 250×32, AX
equal. Live size/density/quiet/disabled/expanded/titleLevel/panelRole
already match.

## Done when

Live `withHeaderAction` on the comparison route adds and removes the
header ActionButton on Solid the way S2 does, including trigger width
222 vs 250. A walk fails if Solid keeps or omits Edit while React
swaps. Prefer a live `children` getter (as Switch) over a one-shot
`hc()` array. Do not start #254.

## Relationship

Child of #26. Found by #260. Wiring is
`apps/comparison/src/components/solid/fixtures/styled/disclosure.tsx`
`disclosureHeader()`. Same class as ColorSwatchPicker live
`defaultValue` (#414) and ColorWheel (#395): URL remount matches,
live composition does not. Distinct from #188 (SSR `hidden`). Do not
start #254.
