---
id: 628
type: task
title: "Ship the declared workflow icons and DragHandle to installed consumers"
created: 2026-10-08
parent: 32
status: verified
history:
  - {
      state: open,
      at: 2026-10-08,
      note: "visualmode G15, including DragHandle. #72 generated the source icons and is merged; this is the unpublished JavaScript. Installed 0.8.0-rc.0 has 411 s2 workflow declarations and 7 JS files, and DragHandle is .d.ts only. No public icon subpath. Do not add Stop, snap, key, or easing glyphs (#629).",
    }
  - {
      state: verified,
      at: 2026-10-08,
      note: "The packed 0.8.0-rc.0 tarball has JS and JSX for all 410 declared workflow icons, their barrel, and DragHandle. Node resolves @proyecto-viviana/ui/icon/s2wf-icons/* and @proyecto-viviana/ui/icon/ui-icons/DragHandle, and the seven root re-exports still resolve. No Stop, snap, key, or easing glyphs added.",
    }
---

Installed `@proyecto-viviana/ui@0.8.0-rc.0` declares the S2 workflow icon set
and does not ship it. `dist/icon/s2wf-icons` in that tarball has 411 `.d.ts`
files and 7 `.js` files (Bell, Close, Link, Lighten, MenuHamburger, Contrast,
Search). `package.json` exports the package root plus `./ContrastIcon`,
`./LightenIcon`, and `./GitHubIcon`. There is no public `./icon` or
`./icon/s2wf-icons/*` subpath.

`DragHandle` is part of this hole. Source exists at
`packages/viviana-ui/src/icon/ui-icons/DragHandle.tsx` and is re-exported from
`src/icon/ui-icons/index.ts`. The tarball has `dist/icon/ui-icons/DragHandle.d.ts`
and its map, and no JS. The root barrel re-exports only the seven workflow
icons above, plus `PixelChartIcon`. `vite.config.ts` inlines
`src/icon/index.tsx` into that barrel and keeps individual icon files as
their own entries, which the published `exports` map does not expose.

#72 generated the icon source from the shipped paths and is merged. Do not
reopen it. This ticket is the packaging hole for an installed consumer.

## Done when

An installed tarball contains JS for the declared workflow icons and for
`DragHandle`, and a public subpath imports each of them without reaching
into `dist` or `src`. The seven icons the root already re-exports keep
working. Do not add Stop, snap, key, or easing glyphs here; that placement
is #629.

## Relationship

Child of #32. From visualmode G15. Visualmode #10154, #10155, and #10156
wait on a real icon import path. Distinct from merged #72. DragHandle is not
a new component.
