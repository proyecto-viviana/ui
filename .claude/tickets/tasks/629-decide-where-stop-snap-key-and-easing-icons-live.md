---
id: 629
type: task
title: "Decide where Stop, snap, key, and easing icons live"
created: 2026-10-08
parent: 33
status: open
history:
  - {
      state: open,
      at: 2026-10-08,
      note: "visualmode G16. Owner question only. Stop, snap, key, and easing shapes are not in the S2 workflow set. They stay visualmode createIcon unless the owner places them here. DragHandle is #628. Do not add glyphs on this ticket. Waiting visualmode #10155, #10157, and #10158.",
    }
---

Visualmode asked where four editor icons belong: Stop, snap, the key
diamond, and the easing shapes (hold, linear, in, out, in-out). They are
not in the shipped S2 workflow set. They stay visualmode `createIcon` unless
the owner says they belong in this package.

This ticket does not add glyphs, export names, or a new icon component.
Stop and record until the owner places them. A "no, they stay in visualmode"
answer closes the question without a package change.

`DragHandle` is a different fact. It is declared and its JS is not in the
`0.8.0-rc.0` tarball. That packaging hole is #628, not this ticket.

## Done when

The owner has said whether Stop, snap, key, and easing are package icons or
visualmode icons. If they stay in visualmode, this ticket closes with no
glyph added. If they move here, the name and the set are the ones the owner
wrote down, and only then does an implementation ticket exist.

## Relationship

Child of #33. From visualmode G16. Visualmode #10155, #10157, and #10158
wait on the placement, not on a new glyph. DragHandle belongs to #628.
Do not reopen #72.
