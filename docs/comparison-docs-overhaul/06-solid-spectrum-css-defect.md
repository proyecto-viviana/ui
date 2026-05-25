# 06 · Resolved `solid-spectrum` CSS Collection Defect

## Summary

The previous `solid-spectrum` CSS path was defective: component modules called
the vendored S2 `style()` function at runtime, pushed CSS into a local registry,
and a hand-maintained generator flushed only some imported modules to a
prebuilt stylesheet. Components omitted from that import list could ship class
names without their CSS.

That bridge has been removed. `solid-spectrum` now uses the React Spectrum S2
macro model: component style imports use `with {type: "macro"}`, package builds
run `unplugin-parcel-macros`, and CSS is emitted by the bundler traversal.

## What Was Wrong

The old bridge preserved class-name generation but lost the macro's exhaustive
CSS collection guarantee. The generator could only collect modules someone
remembered to import, so component coverage and styling coverage drifted.

It also shipped macro-era runtime costs into browsers: token/theme helpers,
style serialization, a registry nobody read at runtime, and dynamic-style code
generation that should have been build output.

## Current Contract

- Do not restore a manual component-CSS collector.
- Do not add app-local CSS to compensate for missing component CSS.
- Component style calls must compile through the S2 macro plugin.
- Missing CSS is a package build or macro wiring defect until proven otherwise.

## Verification

Use these checks when touching the style pipeline:

```bash
vp run --filter @proyecto-viviana/solid-spectrum build
rg -n "macro-[a-f0-9]+\\.css" packages/solid-spectrum/dist -g '*.{js,css,d.ts}'
```

Component-level passes still need their usual parity gates: upstream source
comparison, computed style/geometry proof for branch-sensitive styles, visual
coverage where useful, and notes in the component validation file.
