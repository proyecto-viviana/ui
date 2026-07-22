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

Closed 2026-07-22 (`1d7604f6`), all three follow-up SSR/hydration bugs:
ListViewItem hydrates (regression pair `Collections.ssr/hydrate.test.tsx`,
including static `<ListViewItem>` children + post-hydration interaction);
TagGroup `isRenderedTag()` grew an `isServer` branch that duck-types Solid's
serialized SSR nodes instead of `instanceof HTMLElement`
(`TagGroup.ssr/hydrate.test.tsx`); Breadcrumbs SSR emits already-collapsed
markup so the client never self-measures over foreign DOM
(`Breadcrumbs.ssr/hydrate.test.tsx`).

Closed 2026-07-22 (`094bf484`, `b9817f3a`), the UA-button-chrome class of
paint bug: any styled component whose interactive element is a native
`<button>` the style macro can't reach ships raw UA chrome — opaque
`ButtonFace` fill, `2px outset` border, own font — which occludes z-lower
siblings or paints around the styled inner span. TabSwitch (restyled to the
island's `.glx-pop-kind` raised-pill idiom; the UA fill had been hiding the
sliding indicator entirely) and ActionGroup (headless
`ActionGroupItemWrapper` renders a bare classless `<button>`; fixed with a
`css()` `& > button` reset on the container, keeping the UA `:focus-visible`
outline because the inner span never receives `isFocusVisible`). A
15-route Playwright sweep found no further real instances.

Closed 2026-07-22: viviana-ui Tree hydration abort ("Unable to find DOM nodes
for hydration key") — root cause was the repeated `local.children` read in
`ResolvedItemContent`/`TreeItemContent`/`TreeExpandButton` (each read of a
static-JSX children getter re-instantiates the subtree; the server's discarded
first instantiation consumed a hydration tick, shifting all emitted keys by
one). Fixed with the gridlist read-once pattern; regression pair
`Tree.ssr.test.tsx` + `Tree.hydrate.test.tsx` (hydrate half resets solid's
`sharedConfig` per test — a mid-hydration throw otherwise makes the next
`hydrate()` silently client-render and false-pass).

**solid-spectrum carries both hydration bugs untouched (parity-locked — user
decision needed before editing):** the eager-framed double-construction
(`tree/index.tsx:884`, `gridlist/index.tsx:1068`) and the repeated
`local.children` read (`tree/index.tsx:997,1104,1144`,
`gridlist/index.tsx:1186`). Both only bite hydrating consumers; the S2
comparison harness client-renders, so parity certs are unaffected.

## Gaps between the register and the library

Beyond paint, the register needs vocabulary viviana-ui doesn't have yet (per
the mirror `GAP` comments): glass surface primitives (MeshCard-equivalent),
discrete/dithered progress, a pixel icon set (CSS-mask), circular badge
button, Tag tones, and scan/mesh overlay treatments.
These land as viviana-ui additions — never in solid-spectrum.

Closed 2026-07-22 (`6a45374e`): the nine-role type scale. `typeRoles`/
`TypeRole` export one precompiled class per register role at exact metrics;
Heading 1–3 are the pixel tiers verbatim (inverted 500/600/700 weight
ladder, +0.01em tracking); standalone Text/Content/Keyboard bake
meta/body/terminal gated on `contextProps == null` (composed hosts
byte-identical); theme gained `semi-bold` and `letterSpacing`. Demoed on
`/showcase/type`, probe-verified both schemes.

Closed 2026-07-22: the register's status run on Badge (Panel03 spec badges).
New `live`/`metric` BadgeVariants entering as arbitrary
`[var(--accent-live)]`/`[var(--status-metric)]` values (single per-scheme
hues — no ramps, per the token-file header pattern); subtle fill gained a
same-channel ink map mirroring the outline colors (the streak-chip recipe:
amber-600 ink on amber-100 plate); LIVE breathes via `keyframes()` +
`style()` animation longhands, reduced-motion gated with a
`"@media (prefers-reduced-motion: reduce)"` condition key — a runtime
matchMedia check can't undo an SSR'd inline animation (Solid hydration
trusts server DOM), and `css()` drops its class wrapper around a nested
@media, so the style()-native media key is the only working gate. Tokens:
violet retired → sky-blue metric (`--status-metric`, `--well-vi`,
`--violet-500` kept as legacy alias; both schemes). Demoed as the first
`/showcase/chips` row, probe-verified both schemes + reduced-motion.

Closed 2026-07-22: discrete/dithered progress (Panel05/07). ProgressCircle's
SVG arc became the register ring — 16 absolutely-positioned pixel blocks on a
module-computed circle (S 16/7/2, M 32/13/3, L 64/26/6 container/radius/block),
lit blocks in accent with staggered `ringBlink` step-end blinks (2.6s, 0.16s/i
delays), the two lead blocks dithered via `repeating-conic-gradient` of a
conditional `--pv-ring-fill` custom property (accent / static-overlay /
ButtonText — conditional custom-prop values compile fine), plus a centered
children readout slot (`3/5 FOCUS`). ProgressBar gained `pendingValue` — the
XP bar's dithered in-flight segment rendered flex-after the solid fill.
Meter gained `segments` — the wells' `[▮▮▮▯▯]` capacity form as 7×12 bordered
blocks (glyph-box sized; ink follows variant, no rim); the well row itself is
`labelPosition="side"` (`focus [▮▮▮▯▯] 3/5` inline), and segmented top-label
meters drop the label wrapper's `contain: inline-size` (it relied on the
continuous track's 208px `containIntrinsicWidth`; without it the value
overprints the label). StatusLight gained the `metric` variant
(`--status-metric`) and register ink-toning (label ink follows the channel,
800/900 per scheme). AvatarGroup gained the register's `30` stack size and
deepened overlap to 30% of the diameter (`calc(var(--size) * -0.3)`).
Landmines: a zero-condition `style()` call compiles to a static class string —
calling it as a function is an SSR crash; spacing props are scale-locked
(`columnGap: 3` rejects — bracket `"[3px]"`) while sizing props accept any
number. Demoed on `/showcase/status` (+ AvatarGroup on `/showcase/cards`),
probe-verified both schemes + reduced-motion (determinate ring freezes,
indeterminate keeps chasing); SSR 13/13, hydrate 15/15.

Closed 2026-07-22: the Well went public. The matte terminal container already
existed in-package (`src/well/index.tsx`: `--surface-well` fill, `wellScan()`
4px dither, 1px `--well-border` hairline, 10px radius, no shadow — "matte /
opaque, NEVER glass") but was unreachable — no barrel export, no registry
home. Now exported (`Well`/`WellProps`), registered under Panel 14
(Type & Layout), and demoed twice on `/showcase/type`: the reference stat
well (terminal-role mono rows, `--well-cy/am/vi/rd` channel inks) and the
same well composed from library primitives (segmented side-label Meters +
a terminal prompt line). Probe-verified both schemes.

Closed 2026-07-22: the Card mesh axis + console strip (Panel06, both mirror
GAPs). `meshStrip()` moved into the library (`src/style/meshStrip.ts`, public
export; `apps/web/src/lib/glasselated.ts` now re-exports it) and Card grew
`mesh?: "ambient" | "signal"` + `meshSeed?` — the hex-weave data URI as
`background-image`, suppressed for tertiary/quiet (no fill to sit behind),
`data-mesh` stamped on all three render paths for the app-level mesh-field
cursor treatment. Scheme flipping is the interesting bit: the weave is a
runtime data URI with per-scheme hues, so neither the build-time style macro
nor `light-dark()` (colors only) can carry it — it rides the lightningcss
space-toggle atoms (`--lightningcss-light`/`--lightningcss-dark`, maintained
by `setColorScheme()` on every Provider root; `initial` fires a slot's
`var()` fallback, `" "` suppresses it):
`var(--lightningcss-light, url(L)) var(--lightningcss-dark, url(D))`.
CardPreview gained `background="inset"` — the register console-strip
treatment via the theme's existing `pasteboard` → `--surface-inset` mapping,
no theme addition needed. Demoed as the `/showcase/cards` opener (register
trio: media card with SHADERS badge + segmented meter footer; DUE/NEW console
cards with StatusLight prompt strips). Probe-verified both schemes — the
substituted URI carries the scheme's stroke hex both ways; SSR 13/13,
hydrate 15/15.

Closed 2026-07-22: the pixel icon set + the register's two Tabs navigation
forms (Panel04). 34 `Pixel*Icon` components generated from the frozen lane's
pixel-art SVGs into `src/icon/pixel-icons/` (createIcon-wrapped, barrel →
auto-promoted to own build entries; "Auto-generated" header keeps them out of
the idiomatic-solid guard; `nav-home.svg` skipped as byte-identical to
`home.svg`). Tabs gained `variant?: "line" | "pill"`: pill is the mobile tab
bar — full-radius glass capsule (`layer-1` + `--blur-panel` + hairline +
`edge-glass`, space-around), column-flex slots (gap `[3px]`, minWidth 52) with
micro labels (10px/bold/+0.1em), no SelectionIndicator, and it NEVER collapses
into the overflow picker (`setShowTabs` + effect force true, `updateOverflow`
early-returns). Vertical became the register rail: indicator suppressed, a
mono `">"` caret leads each row (order 0, accent ink, opacity 0 rest / 0.55
hover / 1 selected), rows flat `minHeight: 32` (density-independent), 12px
semi-bold labels, `[6px]` list gap, and the strip-to-panel `marginStart`
gutter removed. Tab now provides `NotificationBadgeContext` with
`style({ order: 2, marginStart: "auto" })` so a badge child parks flush right
(`marginStart`/`order` are in `allowedOverrides`). Style-macro structure:
mutually-exclusive `variant: { line: …, pill: … }` nesting dodges
sibling-condition cascade-order ambiguity; branches typed at only one variant
emit nothing when unmatched, so internal callers must always pass `variant`.
Landmines: `getComputedStyle` margin-* returns the USED value — `auto`
reports `0px` when the flex row has no free space (the demo Well had shrunk
to content because `max-width` alone doesn't size a flex item; fix `width`);
diagnose via CDP `CSS.getMatchedStylesForNode`, not `cssRules` walks (CSS
nesting gives every CSSStyleRule a `.cssRules`, breaking else-branches).
Well-in-Tabs composition works (headless context flows through the wrapper),
but the Well becomes a flex item of the horizontal Tabs root — give it
`width` and kill the TabList's own `marginEnd`. Demoed as the two
`/showcase/navigation` openers (Well-mounted rail with badge row; five-slot
pill bar with stacked pixel icons), probe-verified both schemes; SSR 13/13,
hydrate 15/15.

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
