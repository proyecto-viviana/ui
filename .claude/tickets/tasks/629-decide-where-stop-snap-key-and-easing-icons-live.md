---
id: 629
type: task
title: "Decide where Stop, snap, key, and easing icons live"
created: 2026-10-08
parent: 33
status: verified
history:
  - {
      state: open,
      at: 2026-10-08,
      note: "visualmode G16. Owner question only. Stop, snap, key, and easing shapes are not in the S2 workflow set. They stay visualmode createIcon unless the owner places them here. DragHandle is #628. Do not add glyphs on this ticket. Waiting visualmode #10155, #10157, and #10158.",
    }
  - {
      state: open,
      at: 2026-10-08,
      note: "Owner placed the glyphs in packages/viviana-ui/src/icon/extra-icons/. Names: StopIcon, SnapIcon, KeyframeIcon, EasingHoldIcon, EasingLinearIcon, EasingInIcon, EasingOutIcon, EasingInOutIcon. Not s2wf-icons, not pixel-icons, and not solid-spectrum. Public import follows the #628 icon subpath. DragHandle stays #628.",
    }
  - {
      state: verified,
      at: 2026-10-08,
      note: "StopIcon, SnapIcon, KeyframeIcon, EasingHoldIcon, EasingLinearIcon, EasingInIcon, EasingOutIcon, and EasingInOutIcon resolve from ./icon/extra-icons/*. The S2 workflow set, pixel-icons, solid-spectrum, and DragHandle stay unchanged.",
    }
---

Visualmode asked where four editor icons belong: Stop, snap, the key
diamond, and the easing shapes (hold, linear, in, out, in-out). They are
not in the shipped S2 workflow set.

The owner placed them in a new viviana-ui module,
`packages/viviana-ui/src/icon/extra-icons/`. The components are `StopIcon`,
`SnapIcon`, `KeyframeIcon`, `EasingHoldIcon`, `EasingLinearIcon`,
`EasingInIcon`, `EasingOutIcon`, and `EasingInOutIcon`. They do not join
`s2wf-icons`, `pixel-icons`, or solid-spectrum. The public import follows the
icon subpath #628 opened. `DragHandle` stays the #628 path.

## Done when

Those eight glyphs resolve from the extra-icons subpath, and the S2 workflow
set, pixel-icons, and solid-spectrum are unchanged. DragHandle is not reopened.

## Relationship

Child of #33. From visualmode G16. Visualmode #10155, #10157, and #10158
wait on the placement, not on a new glyph. DragHandle belongs to #628.
Do not reopen #72.
