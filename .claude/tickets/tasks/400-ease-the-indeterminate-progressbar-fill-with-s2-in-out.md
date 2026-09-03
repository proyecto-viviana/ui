---
id: 400
type: task
title: "Ease the indeterminate ProgressBar fill with S2 in-out"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 progressbar functional pass: isIndeterminate fill is 1s infinite both, but computed animation-timing-function is S2 cubic-bezier(0.45, 0, 0.4, 1) (style-macro in-out) vs Solid cubic-bezier(0.37, 0, 0.63, 1) (hand-authored shorthand). Same S2 indeterminateAnimation also sets will-change:transform and position:relative; Solid fill stays will-change auto / position static. AX, fill origin left, duration, and keyframe translateX/scaleX match. D2 is not registered (hashed animation-name). Certified source-read claimed .37,0,.63,1 identity; computed S2 is the in-out token. Not a settle-to-same timing gap — the sweep is infinite.",
    }
---

S2 `ProgressBar` attaches the indeterminate fill motion through the
style-macro `indeterminateAnimation` object (`animationTimingFunction:
'in-out'`, `animationDuration: 1000`, `animationIterationCount:
'infinite'`, `willChange: 'transform'`, `position: 'relative'`). The
`in-out` token is `cubic-bezier(0.45, 0, 0.4, 1)`.

Solid Spectrum inlines a shorthand on the fill:

```ts
return `${keyframe} 1000ms cubic-bezier(.37, 0, .63, 1) infinite`;
```

Duration and iteration match. The easing does not. The same
hand-authored string omits `will-change` and `position`. This is the
ADR 0001 failure mode: S2 motion styling was copied as a CSS string
instead of going through the style macro.

The certified ProgressBar note claimed the timing was
byte-identical `1000ms cubic-bezier(.37,0,.63,1) infinite` by source
read. Computed S2 is the `in-out` token, not that bezier. D2 is not
registered because the `keyframes()` name is hashed, so this never
fails certification.

## Evidence

`http://127.0.0.1:4341/components/progressbar/?isIndeterminate=true`,
islands mounted. Fill is the track child (`> div:has(> div) > div`).
Live `isIndeterminate` and URL remount match each other.

|                             | React                                                | Solid                                |
| --------------------------- | ---------------------------------------------------- | ------------------------------------ |
| AX                          | `progressbar "Loading…"` (no valuetext / value span) | same                                 |
| duration / iteration        | `1s` / `infinite`                                    | same                                 |
| fill origin                 | `0px 3px` (left)                                     | same                                 |
| `animation-timing-function` | **`cubic-bezier(0.45, 0, 0.4, 1)`**                  | **`cubic-bezier(0.37, 0, 0.63, 1)`** |
| `will-change`               | `transform`                                          | `auto`                               |
| `position`                  | `relative`                                           | `static`                             |

Repeats on `?isIndeterminate=true&size=XL`,
`?isIndeterminate=true&labelPosition=side`, and live
`isIndeterminate`. Determinate rest has no animation on either stack.

## Done when

An indeterminate ProgressBar fill on the comparison route computes
`animation-timing-function` equal to S2 `in-out`
(`cubic-bezier(0.45, 0, 0.4, 1)`). Duration stays 1000ms infinite.
A walk fails if Solid still uses `cubic-bezier(0.37, 0, 0.63, 1)`.
Prefer the style-macro `indeterminateAnimation` object (including
`will-change` / `position`) over a hand-authored shorthand. Do not
start #254.

## Relationship

Child of #24. Found by #260. Wiring is
`packages/solid-spectrum/src/progress-bar/index.tsx`
`indeterminateAnimation()`. Distinct from hashed `animation-name`
(accepted D2 exclusion) and from overlay enter/exit (#251 / #64).
`@proyecto-viviana/ui` ProgressBar copies the same shorthand. Do not
start #254.
