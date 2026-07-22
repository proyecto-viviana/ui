---
kind: plan
status: current
---

# Glasselated → viviana-ui port + Viviana showcase (opened 2026-07-22)

Status: plan of record for the owner's 2026-07-22 pivot.
Update when: the design branch lands, a register gap closes, the showcase route
ships, or the external spec moves.

## The pivot (owner, 2026-07-22)

The Education-app integration attempt is over; the visual-system work continues
in this repository. Goals:

- Get the **full Glasselated register onto real viviana-ui components**.
- Build the **actual Viviana showcase** — not just the solid-spectrum docs.
- `packages/solid-spectrum` stays **AS IS**: parity against React Spectrum S2,
  certified by the comparison harness. No register work lands there.
- `packages/viviana-ui` keeps the whole solidaria stack and solid-spectrum's
  shape, but carries **our own design system**.

## What Glasselated is

The v2 register from the external design repo: *glass + pixelated* — frosted
translucent panels over a photographic scene, Geist Pixel for display type,
Geist for body, Geist Mono inside terminal components, and pixel-art details
(ordered dither, block states) as craft. It supersedes the "Aurora Glass"
handoff (whose layout/IA/copy remain valid inputs; its skin does not).

Identity rules that define the register (source of truth is the spec CSS, not
this list): light base + "Glasselated Night" dark under `[data-theme="dark"]`;
register palette blue / amber / violet / red, **no green**; the "+Create" CTA is
**yellow, not orange**; terminal wells are matte and opaque, **never glass**;
glass = translucent surface + backdrop blur + an inset `--edge-glass` rim; a
closed set of nine type roles (display/title/headline/label on Geist Pixel,
body/meta on Geist, micro/terminal/button on Geist Mono).

## Where the spec lives (external, frozen, not committed here)

Repo `~/projects/proyecto-viviana/visual-system-claude`, branch
`design/glasselated-v2`. **Frozen as of 2026-07-22** (owner decision): it is a
read-only reference — no further work lands there. Any asset the port still
needs from it (font files, the mesh/dither engine, scene imagery) is copied
into this repository when its slice lands, credited per `CREDITS.md` policy.

- `apps/akade/src/styles/glasselated.css` — the full token + treatment layer
  (~4.3k lines, scoped under `[data-glasselated]`), including the `--s2-*`
  bridge hooks for library seams.
- `apps/akade/src/lib/glasselated.ts` — the engine: `meshStrip()` seeded hex-
  mesh SVG, `createMeshField()` cursor-tracked mesh, `dualWipe()` Bayer-dither
  theme transition (reduced-motion aware).
- `apps/akade/src/components/design-handoff-v2/` — `TerminalGlassLab.tsx` is the
  **living spec**: nine numbered panels (buttons, inputs, chips, navigation,
  status/progress, cards, terminal wells, list rows, type roles).
  `mirror/Panel01–09.tsx` are viviana-ui twins whose itemized `GAP (…)` comments
  are the **canonical gap inventory** for the port.

## Where the port stands

**Landed on `main` 2026-07-22** — the design lane's branch
`design/visual-system-claude-v2` (23 commits; see `visual-system-lane.md` for
provenance) was squash-merged. On `main` now: solid-spectrum vendored into
viviana-ui with color ramps anchored to the handoff
(`src/style/glasselated-ramps.ts`), create-yellow button variant, Button on the
Glasselated form, warning routed to amber, per-level Heading sizes,
self-contained `styles.css`, the Tabs/GridList hydration fix (children-prop
getter must not be read twice during hydration), and `ElementTag` (compiled
string-tag rendering replacing `<Dynamic>`'s unsafe string branch across
solidaria-components + DisclosureTitle). The branch's three solid-spectrum
commits are macro-hygiene only (landmark via `style()`, invented-utility
guard) — parity-safe. All further work happens on `main`.

Known open SSR/hydration bugs to close next: ListViewItem never hydrates;
TagGroup `isRenderedTag()` does an `instanceof HTMLElement` check that breaks
on the server; Breadcrumbs self-measures on the client.

## Gaps between the register and the library

Beyond paint, the register needs vocabulary viviana-ui doesn't have yet (per
the mirror `GAP` comments): glass surface primitives (MeshCard-equivalent),
discrete/dithered progress, a pixel icon set (CSS-mask), circular badge
button, live-pulse status, Tag tones, scan/mesh overlay treatments, and the
full nine-role type scale (today's roles are collapsed and there is no mono
role). These land as viviana-ui additions — never in solid-spectrum.

## Showcase plan

Home is **`apps/web`** (TanStack Solid Start SSR on Cloudflare Workers) — it
already has routing, SSR, and the live-gallery precedent. `apps/comparison`
stays S2-parity-only (ADR 0001); it must not host the showcase. Shape: a new
route rendering **real `@proyecto-viviana/ui` components** under a
`[data-glasselated]` scope, organized on the TerminalGlassLab nine-panel
taxonomy so the showcase doubles as the register's acceptance surface.

## Release posture

Nothing publishes until the owner says so. Pushes to `main` only make the
changesets bot maintain the "Version Packages" PR; npm publish happens solely
when the owner merges that PR. Changesets keep accumulating with the work per
`release-policy.md`; publishing is revisited once viviana-ui looks right across
all components.
