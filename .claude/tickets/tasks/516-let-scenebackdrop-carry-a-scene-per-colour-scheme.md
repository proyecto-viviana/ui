---
id: 516
type: task
title: "Let SceneBackdrop carry a scene per colour scheme"
created: 2026-09-09
status: open
history:
  - { state: open, at: 2026-09-09, note: "filed from the Terminal Glass port handoff on 117a2886" }
---

`SceneBackdrop` takes one `src` (`packages/viviana-ui/src/view/SceneBackdrop.tsx:10-11`)
and paints it under the register's grade and veil. The handoff ships two
photographs — `apps/web/public/examples/bg-scene.png` and `bg-scene-night.png` —
one per colour scheme.

The app already works around it. `ExamplesShell` reads the site's theme signal
and swaps the string itself
(`apps/web/src/components/examples/ExamplesShell.tsx:27-35`), which is only
possible because `check-examples-purity.ts:50-56` pins a narrow `@/utils/theme`
exception to that one file and to `ThemeToggle.tsx`. A screen route cannot do the
same: `profile.tsx:49` hard-codes `/examples/bg-city.png` and keeps the daylight
city behind the night register, and `landing.tsx:66` hard-codes `thumb-2.png`.
Widening the purity allowlist so routes may read the theme is the wrong fix — the
scene is paint, and paint is the library's job.

A runtime scheme read is also the wrong mechanism inside the component: Solid
hydration trusts the server DOM, which is why the register's other scheme-dependent
paint is a CSS condition and never a `matchMedia` read (see the gate comments on
`PixelMeter.tsx:234` and `TerminalLog.tsx:107-109`).

## Scope

`packages/viviana-ui/src/view/SceneBackdrop.tsx` — the props and the scene layer;
then `profile.tsx` and `ExamplesShell.tsx` drop their own swap.

The API question the owner decides: how a caller names the second scene.
**Recommended default:** add `srcDark?: string` beside `src`, and render two
stacked scene layers whose visibility is decided by the register's own
`[data-color-scheme]` selector through the style macro — no JS scheme read, no
hydration mismatch, both images in the markup. `src` alone keeps today's
behaviour exactly. Veto it if the owner would rather `src` accept
`string | { light: string; dark: string }`, which reads better at the call site
but changes an existing public prop's type.

Both layers keep the one `--scene-filter` grade and `image-rendering: pixelated`
(`SceneBackdrop.tsx:53-59`); the veil, skyline, grid and sweep are untouched. The
second image is a second network fetch — say so in the JSDoc, and let a caller
that only has one scene keep passing one.

## Done when

- `SceneBackdrop src={…} srcDark={…}` shows the night scene under
  `[data-color-scheme="dark"]` and the day scene under light, with no runtime
  scheme read in the component.
- `ExamplesShell` no longer computes a scene string, and `/examples/profile`
  swaps `bg-city.png` for the night scene without importing `@/utils/theme`.
- The `@/utils/theme` exception in `check-examples-purity.ts` shrinks to
  `ThemeToggle.tsx` alone, or the ticket says why it cannot.
- SSR and hydrate tests stay green — the served markup must not depend on a
  scheme guess.
- The `scene` showcase panel shows the pair; the gap drops off
  `.claude/current/glasselated-port.md`.

## Proof

```
vp run build:viviana-ui
vp run build:web
vp run guard:examples-purity
vp run test:ssr && vp run test:hydrate
vp exec --filter @proyecto-viviana/web -- playwright test e2e/examples.spec.ts
vp run a11y:axe:aa
vp run api:extract && vp run guard:api-reference
```

Plus a minor Changeset on `@proyecto-viviana/ui` (additive prop).

## Relationship

One of the five library gaps the Terminal Glass port surfaced: #515, #517, #518,
#519. Sibling concern to #103 (Glasselated mirror gaps). Example routes:
`/examples/profile`, `/examples/landing`, and every screen through
`ExamplesShell`.
