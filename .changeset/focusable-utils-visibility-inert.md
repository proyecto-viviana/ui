---
"@proyecto-viviana/solidaria": patch
---

Port the full `isFocusable`/`isTabbable`/`isElementVisible` focusable utilities

`isFocusable` was a simplified tagName/tabindex/contenteditable check with no
visibility filtering and no `inert` handling, and there was no `isElementVisible`
or `isTabbable` at all. It now mirrors `@react-aria/utils` (v3.34.1, the version
paired with the pinned RAC 1.19.0): a candidate must match the focusable selector
AND not be inside an `inert` subtree AND be visible (`isElementVisible` —
`checkVisibility` when supported, otherwise a computed-style/attribute walk up the
ancestor chain, honoring `hidden`, `data-react-aria-prevent-focus`, and
`<details>`/`<summary>`). `isFocusable` accepts `{skipVisibilityCheck}` to bypass
that last step (used by the press-path `preventFocus` ancestor walk). `isTabbable`
and `isElementVisible` are now exported, and the duplicated local `isTabbable`
copies in `FocusScope` and `createToolbar` collapse onto the shared one. Owner-window
lookups go through `getOwnerWindow`, which falls back to the global window, so the
helpers stay robust on detached documents (`defaultView === null`).

`isStyleVisible` and `isInert` additionally accept the global realm's
`HTMLElement`/`SVGElement` constructors. Solid clones templates with the document
that is global at creation time, so a node portaled into another document (e.g. an
iframe) keeps its original realm's prototype even though its `ownerDocument` — and
therefore `getOwnerWindow` — resolves to the other document; upstream React creates
portal nodes with the container's `ownerDocument`, so its single owner-window
`instanceof` check would reject real cross-document Solid elements. In the common
same-realm case this is identical to upstream.
