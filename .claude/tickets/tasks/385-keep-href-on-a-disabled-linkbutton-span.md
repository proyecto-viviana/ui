---
id: 385
type: task
title: "Keep href on a disabled LinkButton span"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 linkbutton functional pass: ?isDisabled=true and live isDisabled both stacks become span[role=link][aria-disabled=true] tabindex=-1 with the same paint and Tab skip; React keeps href=https://example.com/docs so Chromium AX includes /url, Solid drops href so AX has no destination. RAC useLink always merges useLinkProps href onto the host; Solid createLink filterDOMProps isLink only when elementType is a",
    }
---

S2 `LinkButton` is RAC `Link` with button styles. Disabled with
`href` is a `span[role=link][aria-disabled=true]` on both stacks.
RAC still copies `href` onto that span. Solid drops it.

RAC 1.21 `Link` uses `elementType = props.href && !props.isDisabled
? 'a' : 'span'`. `useLink` then merges `useLinkProps(props)`, which
always returns `href` / `target` / `rel` / `download` / `ping` /
`referrerPolicy` regardless of `elementType`. Chromium AX therefore
keeps `/url` on the disabled link.

Solidaria `Link` uses the same elementType rule, then `createLink`
calls `filterDOMProps(..., { isLink: elType === "a" })`. A disabled
span is not a link for that filter, so `href` never reaches the
host. `useLinkProps` exists in
`packages/solidaria-components/src/RouterProvider.tsx` and is used
by Tree/Table, but headless `Link` does not call it.

Tab skip, force-click (no navigation), hover (no `data-hovered`),
and disabled paint already match. The fork is the destination on
the accessibility tree and the `href` attribute. Screen readers
announce the URL on React only.

## Evidence

`http://127.0.0.1:4341/components/linkbutton/?isDisabled=true`,
islands mounted. Same fork on live
`comparison:controls-change` `{isDisabled:true}`.

| | React | Solid |
|---|---|---|
| host | `SPAN` role=link | same |
| `aria-disabled` | `true` | same |
| `tabIndex` | `-1` | same |
| `data-disabled` | `true` | same |
| `href` | `https://example.com/docs` | omitted |
| AX | `link "Open docs" [disabled]: /url: https://example.com/docs` | `link "Open docs" [disabled]` |
| Tab from Before | After (skip) | same |
| force-click | no navigation | same |
| paint | 99×32, bg `rgb(233, 233, 233)`, color `rgb(198, 198, 198)`, cursor auto | same |

Live re-enable restores `<a href="https://example.com/docs">`
tabIndex 0 on both.

`packages/solidaria/src/link/createLink.ts` (`isLink: elType ===
"a"`). RAC `@react-aria/link` 3.52 `useLink` + `useLinkProps`.

## Done when

A disabled LinkButton that still has `href` keeps that `href` on
the span host, and Chromium AX includes `/url` with the same
destination as S2. A walk on
`/components/linkbutton/?isDisabled=true` fails if Solid omits
`href` while React keeps it. Re-enable must still swap back to
`<a>`.

## Relationship

Child of #24. Found by #260. Distinct from #337 (S2 standalone
href Card ignores `isDisabled` and stays an enabled `<a>`; this
ticket is href-on-the-disabled-span). Headless `Link` is the same
code path, so the later `link` slug will likely show it too. Do
not start #254.
