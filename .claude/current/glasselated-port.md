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
  the Viviana showcase.
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

## Open work

- Ticket #44 owns styled Tree and GridList production hydration.
- Ticket #102 owns server-rendered collection slot styling.
- Ticket #103 owns the remaining register-to-library decisions and mirror gaps.

Use `release-policy.md` for release state and commands.
