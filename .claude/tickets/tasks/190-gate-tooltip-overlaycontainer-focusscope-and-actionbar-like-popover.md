---
id: 190
type: task
title: "Gate Tooltip OverlayContainer FocusScope and ActionBar like Popover"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
---

## Cause

Popover's own comment states the rule: emit the same structure on server and
client and gate the portal on `useIsHydrated()`, never `return null` on the
server (`packages/solidaria-components/src/Popover.tsx:264-271`). ModalOverlay
and ToastRegion follow it. Three paths do not:

- `TooltipContent` returns `null` on the server, then wraps in
  `OverlayContainer` on the client; `OverlayContainer` itself
  `if (isServer) return null` (`Tooltip.tsx:487-529, 759-780`,
  `packages/solidaria/src/overlays/createModal.tsx:179-183`). `defaultOpen`
  puts a tooltip in the tree as nothing on the server and a portal subtree on
  the client.
- `ModalContent` still `if (isServer) return <>{props.children}</>` before
  hooks (`Modal.tsx:131-132, 303-304, 382-385`); currently shielded by
  ModalOverlay's gate, a landmine if invoked without it.
- `FocusScope` returns a bare fragment on the server and injects
  `data-focus-scope-start/end` sentinels on the client
  (`packages/solidaria/src/focus/FocusScope.tsx:397-399, 734-739`). Styled
  `ActionBar` mounts `<FocusScope restoreFocus>` inside
  `<Show when={isRendered()}>` seeded from `selectedItemCount !== 0`
  (`packages/solid-spectrum/src/actionbar/index.tsx:426-440, 547-548`), so a
  collection that SSRs with a selection emits a different child list than
  the client hydrates. No Tooltip or ActionBar SSR/hydrate suite exists.

## Work

Apply the Popover gate to Tooltip and OverlayContainer; remove the
`ModalContent` server early return; make FocusScope's sentinel structure
hydration-stable (or gate ActionBar's FocusScope the same way). Add
SSR + hydrate suites for a `defaultOpen` Tooltip and an ActionBar with a
non-zero initial selection.

## Done when

`renderToString` and `hydrate` produce the same tree shape for those paths
with no mismatch, and the suites fail if an `isServer` early return comes
back.

## Relationship

F-SSR-004. Same class as the Popover fix already in the tree.
