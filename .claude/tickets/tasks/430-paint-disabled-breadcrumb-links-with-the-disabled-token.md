---
id: 430
type: task
title: "Paint disabled breadcrumb links with the disabled token"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 breadcrumbs functional pass: URL ?isDisabled=true and live isDisabled both AX-disable Home (aria-disabled, data-disabled, tabIndex -1, Tab skip, force-click no-op), but the [role=link] color stays rgb(80,80,80) on Solid against S2 disabled rgb(198,198,198). S2 linkStyles isDisabled: 'disabled'; Solid breadcrumbStyles isDisabled: baseColor('neutral-subdued') same as default",
    }
---

S2 Breadcrumbs paints a disabled crumb with the `disabled` color
token (`rgb(198, 198, 198)` on this route). Solid Spectrum keeps
the enabled `neutral-subdued` ink (`rgb(80, 80, 80)`).

S2 splits styles: `breadcrumbStyles` on the `li` uses
`isDisabled: "disabled"`, and `linkStyles` on the link uses
`isDisabled: "disabled"`. Solid collapsed those into one
`breadcrumbStyles` object applied to `HeadlessBreadcrumbItem`
with `isDisabled: baseColor("neutral-subdued")` — the same branch
as the default (enabled) color.

AX, `aria-disabled`, `data-disabled`, `tabIndex=-1`, Tab skip, and
force-click no-op already match on URL remount and live
`isDisabled`. The fork is ink, including overflow Reports when
that crumb is visible.

This is not live-stale `isDisabled` (#371 / #377): URL
`?isDisabled=true` already shows the wrong color.

## Evidence

`http://127.0.0.1:4341/components/breadcrumbs/?isDisabled=true`,
islands mounted. Same color split on live `isDisabled` and on
`?itemSet=overflow&isDisabled=true` for Home (and Solid's visible
Reports).

| | React | Solid |
|---|---|---|
| Home `[role=link]` color | `rgb(198, 198, 198)` | `rgb(80, 80, 80)` |
| AX | `link "Home" [disabled]` | same |
| `aria-disabled` / `data-disabled` | `true` | `true` |
| tabIndex | -1 | -1 |
| Tab from Before | After | After |
| force-click Home | path unchanged, count 0 | same |

Enabled rest still matches: Home `rgb(80, 80, 80)` weight 400;
hover `data-hovered=true` and `rgb(41, 41, 41)` both.

`packages/solid-spectrum/src/breadcrumbs/s2-breadcrumbs-styles.ts`
`breadcrumbStyles.color.isDisabled`. S2
`react-spectrum/packages/@react-spectrum/s2/src/Breadcrumbs.tsx`
`linkStyles.color.isDisabled: "disabled"`. `@proyecto-viviana/ui`
copies the same Solid style object.

## Repro

1. Open `http://127.0.0.1:4341/components/breadcrumbs/?isDisabled=true`.
2. Wait for `data-islands-mounted="true"`.
3. Diff `getComputedStyle` color on each panel's visible
   `[role=link]` named Home.

## Done when

A disabled Breadcrumbs Home (and any other non-current crumb) paints
with the S2 `disabled` token (`rgb(198, 198, 198)` on this route),
not `neutral-subdued`. A walk of `?isDisabled=true` fails if Solid
Home stays `rgb(80, 80, 80)` while React is gray-400. Tab skip and
the disabled AX name must keep matching.

## Relationship

Child of #24. Found by #260. Style-macro token miss in
`s2-breadcrumbs-styles.ts`, not a headless `isDisabled` one-shot
(#371 Switch, #377 Radio). Distinct from #385 (disabled LinkButton
href). Do not start #254.
