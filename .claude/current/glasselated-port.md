---
kind: reference
status: current
---

# Glasselated register

Status: live design reference.
Update when: the register authority, package boundary, or primary repository
surfaces change. Track work in `.claude/tickets`.

## Boundary

The owner set this boundary on 2026-07-22:

- `solid-spectrum` remains a strict React Spectrum S2 port. Do not put
  Glasselated styles or APIs in it.
- `viviana-ui` is the Viviana design system. It uses the shared headless stack
  and owns the Glasselated register.
- `apps/comparison` verifies S2 parity. It is not a styling source or the home of
  the Viviana showcase. The former `packages/viviana-ui/archive/` tree is deleted.
- `apps/web` hosts the Viviana showcase and the frozen-register comparison.

See `architecture.md` for the complete layer model.

## Authority

The frozen source is the external repository
`proyecto-viviana/visual-system-claude`, branch `design/glasselated-v2`, as of
2026-07-22. Treat it as read-only.

Its primary sources are:

- `apps/akade/src/styles/glasselated.css` for tokens and treatments.
- `apps/akade/src/lib/glasselated.ts` for mesh, dither, and theme transitions.
- `apps/akade/src/components/design-handoff-v2/TerminalGlassLab.tsx` for the
  nine-panel register specimen.

`CREDITS.md` records the imported code, assets, provenance, and licenses.

## Identity rules

- Glass surfaces use translucency, backdrop blur, and an inset glass rim.
- Terminal wells are matte and opaque. They are never glass.
- The palette uses blue, amber, violet, and red. It does not use green.
- The create action is yellow, not orange.
- Display, title, headline, and label text use Geist Pixel.
- Body and meta text use Geist. Micro, terminal, and button text use Geist Mono.
- The source CSS is authoritative when this summary is incomplete.

## Repository surfaces

- `packages/viviana-ui/src` contains the design-system implementation.
- `apps/web/src/routes/showcase` contains the public component showcase.
- `apps/web/src/components/showcase/registry.ts` defines its panel registry.
- `apps/web/src/components/parity/spec-panels.tsx` contains the frozen specimen.
- `apps/web/src/components/parity/mirror/Panel01–09.tsx` contains the live
  `@proyecto-viviana/ui` twins.

Git history contains the completed 2026-07-22 port log. Do not copy that log
back into the live reference.

## Terminal Glass (v2) — 2026-09-09

The register was re-cut to the frozen `design/glasselated-v2` handoff and the
whole of `@proyecto-viviana/ui` was restyled onto it. `solid-spectrum` and
`apps/comparison` were not touched. The package takes a major bump
(`.changeset/terminal-glass-register.md`).

- Foundation: colour ramps blue, cyan, fuchsia, yellow, red, green, gray (amber
  and orange deleted); `viviana-tokens.css` re-cut to four channels and one rim
  (`--edge-glass`); corner ladder 4/5/8/12/999; `display-xl/lg/md` type roles;
  a single `[data-color-scheme]` attribute, with `[data-theme]` retired outside
  Kumo. Helpers `glassSurface`, `dither`, `pixelBlocks`, `hudBracket`,
  `edgeFade` live in `src/s2-internal/style-utils.ts`; the stepped keyframes
  live in `src/style/motion.ts` behind `createPrefersReducedMotion`.
- Components: every family restyled — buttons (`variant="terminal"`), badges,
  meters and progress, selection controls, fields, collections, cards, wells,
  and the float tier for popovers, menus, dialogs, tooltips and toasts.
- Four new components: `PixelMeter`, `TerminalLog`, `HudFrame`,
  `SceneBackdrop`, each with a showcase panel under `apps/web/src/routes/showcase`.
- `/examples` is the proof surface: ten screens (landing, home, explore,
  explore-empty, lesson, theater, live, profile, settings, playground) composed
  only from the library, held by `guard:examples-purity` (library-only imports,
  no `style=`, `ex-*` classes, layout-only `examples.css`) and by
  `apps/web/e2e/examples.spec.ts` (axe per slug and theme, one fuchsia fill per
  screen, target size).

### Library gaps the examples found

Open follow-ups against the package, in the examples' words:

1. `PixelMeter shape="grid"` fills from one value, so a per-cell heat map is not
   expressible (profile reads a day count instead).
2. `SceneBackdrop` has no per-scheme `src`, so profile keeps one image in both
   schemes.
3. `TerminalLog` has no wrap mode; long lines become horizontal scroll regions.
4. No ELSH type role, and no 18px lede role.
5. `ToggleButton` has no yellow/notice variant.
6. Landing's theme toggle needed a shared `ThemeToggle` component so the routes
   themselves stay off `@/utils/theme`. Done; the exception is pinned to that
   one file.

### Minted outside the veto pass

Five additions were made while building and were not on the approved list, so
they are owner-review debt: `CardPreview.tag`, `Meter variant="metric"`,
`AppShell hasAsk`, the `--scan-travel` variable read by `scanDown`, and
`HudFrame channel="live"` painting red rather than fuchsia.

## Open work

- Ticket #44 owns styled Tree and GridList production hydration.
- Ticket #102 owns server-rendered collection slot styling.
- Ticket #103 owns the remaining register-to-library decisions and mirror gaps.

Use `release-policy.md` for release state and commands.
