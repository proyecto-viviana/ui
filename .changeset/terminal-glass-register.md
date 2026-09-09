---
"@proyecto-viviana/ui": major
---

Re-cut the Glasselated register onto Terminal Glass v2.

Breaking:

- The warm and violet channels are gone with no aliases. `amber` and `violet` are
  removed from `ColorScale`, Badge drops its `"orange"` variant, `IconStyle.color`
  drops `"orange"`, and `notice` now resolves onto the `yellow` ramp.
- The colour scheme is read from `[data-color-scheme]` only; the `[data-theme]`
  mirror is retired.

Added:

- `createThemeTransition` — a pixel dissolve that snapshots the old frame, swaps the
  scheme under it and dissolves the copy through a checker + grain ring.
- New `cyan`, `fuchsia` and `yellow` ramps, the `display-xl` / `display-lg` /
  `display-md` type roles, and one shared motion vocabulary (`src/style/motion.ts`).
- Card's mesh variants now carry the cursor field: a weave spotlight, a grain mask
  and a ring that spreads from the pointer. Skeleton shimmers through a Bayer dither
  and the indeterminate ProgressCircle steps instead of sliding.
