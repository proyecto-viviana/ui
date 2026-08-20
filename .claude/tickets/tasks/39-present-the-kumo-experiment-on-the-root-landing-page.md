---
id: 39
type: task
title: "Present all three styled libraries and the Kumo experiment on the root landing page"
created: 2026-08-20
parent: 29
status: in-progress
history:
  - { state: in-progress, at: 2026-08-20, note: "migrated from legacy task kumo-landing-story" }
---

Present `solid-spectrum`, `@proyecto-viviana/ui`, and Kumo with accurate product boundaries.

## Scope

- Present one shared Solid foundation and three standalone styled libraries.
- Label Kumo as an unpublished, one-Button experiment with incomplete evidence
  and rough edges.
- Remove or qualify claims such as “faithfully ported,” “pixel-faithful,” and
  “certified” when the page cannot link them to current component evidence.
- Show the real Solid Kumo Button and link to source, limitations, and evidence.
- Do not show an npm install action until the package exists on npm.
- Keep Kumo tokens and `data-mode` inside the specimen.
- Keep the page usable at narrow and wide viewports.

## Done when

A landing-page browser test checks all three library names, Kumo status and
limitations, Button activation, evidence links, and the absence of a false npm
install action. The route, SEO, sitemap, keyboard, axe, contrast, theme, and
web-build gates pass.

## Relationship

Depends on #37. Replaces the legacy landing-story task specification.
