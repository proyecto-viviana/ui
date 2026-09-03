---
id: 337
type: task
title: "Do not disable a standalone href Card (match S2)"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 card functional pass: URL ?href=#card-target&isDisabled=true leaves S2 an enabled <a tabindex=0> that Tab focuses with a 2px ring; Solid renders span[role=link][aria-disabled=true] tabindex=-1 and Tab skips to After. S2 Card Link path spreads filterDOMProps and drops isDisabled; Solid HeadlessLink gets isDisabled={local.isDisabled}",
    }
---

S2 standalone Cards with `href` ignore `isDisabled`. Solid honors it.

S2 `Card` on the Link path spreads
`filterDOMProps(otherProps, {isLink: true})` and never passes
`isDisabled` into RAC `Link`, so
`?href=#card-target&isDisabled=true` stays an enabled `<a>`. Solid
explicitly sets `isDisabled={local.isDisabled}` on `HeadlessLink`, so
the same props become a disabled `span[role=link]`.

S2 is the oracle. Extra disable is a port bug, not missing upstream
behavior. Standalone without `href` is a non-interactive `div` on both
(isDisabled is a no-op there).

## Evidence

`http://127.0.0.1:4341/components/card/?href=%23card-target&isDisabled=true`,
islands mounted, one panel at a time. Tab from an injected Before:

|      | React                                | Solid                                                 |
| ---- | ------------------------------------ | ----------------------------------------------------- |
| host | `<a href="#card-target" tabindex=0>` | `<span role="link" aria-disabled="true" tabindex=-1>` |
| AX   | `link "Apollo Active"`               | `link "Apollo Active" [disabled]`                     |
| Tab  | lands on the card, 2px focus ring    | skips to After                                        |

Force-click still fires a click on both hosts; only React remains a
navigable `<a>`.

## Done when

`?href=#card-target&isDisabled=true` matches S2: enabled `<a>`, Tab
lands on the card, AX is not `[disabled]`. A comparison-route keyboard
walk fails if Solid skips the card.

## Relationship

Child of #24. Found by #260. Wiring is
`packages/solid-spectrum/src/card/index.tsx` (standalone Link branch).
Do not start #254.
