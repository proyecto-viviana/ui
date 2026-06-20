---
"@proyecto-viviana/ui": minor
---

Complete the deep-subpath export surface for `@proyecto-viviana/ui`

Every Spectrum component re-exported from `@proyecto-viviana/solid-spectrum` now
has a matching `@proyecto-viviana/ui/<Component>` subpath (the package previously
shipped only a partial set alongside the root barrel), plus a
`@proyecto-viviana/ui/style/runtime` entry for the style-macro runtime helpers.
The export map now reaches full parity with `solid-spectrum` (all 39 of its
subpaths are re-exported) while keeping viviana's own product components
(`CalendarCard`, `Chip`, `Conversation`, `EventCard`, `Logo`, `PageLayout`,
`ProfileCard`, `ProjectCard`, `TimelineItem`) as additional `ui`-owned subpaths.
Top-level `main`/`module`/`types` fields are added to mirror `solid-spectrum`, so
tooling that ignores the `exports` map still resolves the root barrel.

Each subpath ships all four conditions (`types`/`solid`/`import`/`default`) and
is verified end-to-end by the out-of-workspace consume smoke, which installs the
packed tarballs, builds for DOM and SSR, and asserts every export-map file exists
on disk and every JS subpath resolves through Node's resolver.
