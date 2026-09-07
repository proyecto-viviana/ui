---
id: 510
type: task
title: "Type styled mergeProps after the flags split"
created: 2026-09-07
parent: 31
status: merged
history:
  - {
      state: open,
      at: 2026-09-07,
      note: "filed as follow-up to #496: flags-split keyof and solidaria mergeProps default Record<string, unknown> turned typecheck and comparison:build red",
    }
  - {
      state: in-progress,
      at: 2026-09-07,
      note: "implement fix-head-splitprops-unknown: providerProps as T & ProviderInheritedProps, mergeProps<FileProps> on the #496 calls in both styled trees",
    }
  - {
      state: merged,
      at: 2026-09-07,
      note: 'call-site types on the #496 shape. Prove: vp run typecheck — exit 0, 0 error TS; vp run comparison:build — pass, solid-spectrum tsc -p tsconfig.build.json; vp test run packages/solid-spectrum/test/Button.test.tsx — 39 passed; vp test run packages/viviana-ui/test/Button.test.tsx — 4 passed, dual-onPress ["ctx","prop"] and local once. cwd /home/emoporemilio/projects/viviana-hub/ui. Kumo out. solidaria signature unchanged.',
    }
---

#496 switched styled event-layering merges to solidaria `mergeProps` and
split provider flags so a local `onPress` is not double-fired. Call-site
types did not follow that shape. `splitProps` then sees flags keys that
are not `keyof T`, and the merge return defaults to
`Record<string, unknown>`.

Keep the #496 argument order and flags list. Do not revert chaining. Do
not change the solidaria `mergeProps` signature, `useProviderProps`
return, or public `ButtonProps`.

## Work

1. Annotate `providerProps` as `T & ProviderInheritedProps` so the six
   flags keys are `keyof T`.
2. Pass `mergeProps<FileProps>(…same args…)`. `FileProps` is the file's
   existing props / `Runtime*` type. Fold trailing `as FileProps` into
   the generic.
3. Patch changeset for `@proyecto-viviana/solid-spectrum` and
   `@proyecto-viviana/ui`.

## Done when

`vp run typecheck` exits 0 with 0 `error TS`. `vp run comparison:build`
passes solid-spectrum `tsc -p tsconfig.build.json`. #496 flags-split and
chaining behavior is unchanged. Dual-`onPress` still `["ctx","prop"]`;
local still fires once without context `onPress`.

## Relationship

Child of #31. Follow-up to #496. Does not implement #500, #503, #491, or
#493 remainder repairs. RangeSlider stays #76. Kumo out.
