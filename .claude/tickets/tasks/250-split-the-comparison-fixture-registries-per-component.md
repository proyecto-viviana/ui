---
id: 250
type: task
title: "Split the comparison fixture registries per component"
created: 2026-09-02
parent: 136
status: open
history:
  - {
      state: open,
      at: 2026-09-02,
      note: "owner report: the comparison app is laggy; every page fetches every component",
    }
---

## Cause

`apps/comparison/src/scripts/component-example-section-mount.tsx` lazy-loads
`react-mount` and `solid-mount`, but each of those imports one monolithic
registry: `src/components/react/fixtures/styled.js` (6 944 lines, 97 static
imports — every S2 component) and `src/components/solid/fixtures/styled.tsx`
(11 206 lines, 86 imports — every solid-spectrum / viviana-ui component), plus
all 73 `src/data/*-demo.ts` modules. There is no `import()` below that point.
Built output on every component page: `react-mount` 1.4 MB + `solid-mount`
944 KB of JS, re-parsed on each navigation because Astro pages are full
reloads. Under `astro dev` Vite serves the graph unbundled, so a page requests
the module graph of both design systems — hundreds of files.

## Work

Per-slug code splitting, structure not patch:

- Each fixture becomes its own module: `src/components/react/fixtures/styled/<slug>.js`
  and `src/components/solid/fixtures/styled/<slug>.tsx`, importing only the
  components and the demo-data module that slug needs. The registries become
  `Record<ComparisonSlug, () => Promise<{ default: Fixture }>>` built from
  explicit entries (not a glob — the manifest is the authority; a slug with no
  fixture must stay an explicit empty state).
- `ComparisonIsland` (both stacks) awaits the current slug's module and
  renders a stable placeholder until then; `component-example-section-mount`
  sets `data-islands-mounted="true"` only after both fixtures have mounted, so
  `waitForComparisonRouteReady` and every driver keep their contract.
- Shared framework runtimes (react, react-dom, `react-aria-components` core,
  `solid-js`, the styled packages' shared chunks) land in shared chunks via
  Vite's default splitting; verify with the build output that a component
  page loads only its own fixture chunk plus shared runtime.
- `comparison-manifest` stays a single small module.

## Done when

- `vp run comparison:build`: no chunk above 300 KB except the two framework
  runtime chunks; the picker page's network waterfall (Playwright
  `page.on('request')`) lists exactly one fixture chunk per stack.
- A guard in `apps/comparison/scripts/` fails when a fixture module imports a
  component whose slug is not its own or when a registry entry imports
  statically (`rg` for `^import .* from "\.\./styled/`).
- `comparison:test:pair`, `:contract`, and the full `:certified` suite pass
  with unchanged counts; the D13 journeys (#244) still see
  `data-islands-mounted` after fixtures mount.
- `astro dev` picker page: request count and total transferred bytes recorded
  before/after in this ticket.

## Relationship

Child of #136 (harness integrity axis). Blocks nothing in certification but
blocks day-to-day use of the harness. Must not run concurrently with
Playwright lanes against the built app (#194–#196, #244); sequence after them.
