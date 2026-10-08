---
id: 630
type: task
title: "Stop Card and TableCell from rebuilding their content on hover, press, and focus"
created: 2026-10-08
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-10-08,
      note: "D16: a Card in a CardView and a TableCell rebuild their content on hover, press and focus, which drops state held inside (an open menu, typed text). Found in a real browser on 0.8.0-rc.0; happy-dom does not show it.",
    }
---

A `Card` in a `CardView` and a `TableCell` call their content again each time
the row is hovered, pressed, or focused. State held in that content is lost.
In visualmode an `ActionMenu` in a card closed under the mouse press that
opened it, and a `TextField` in a table cell lost its text and its focus when
the pointer reached the next cell. happy-dom does not show it; a real browser
does.

`packages/solid-spectrum/src/card/index.tsx` and
`packages/viviana-ui/src/card/index.tsx` call the card content from inside the
`CardView` item render, which receives hover, press, and focus.
`packages/solidaria-components/src/Table.tsx` `TableCell` calls its children
with `renderValues()`, and those values include `isHovered`, `isPressed`, and
`isFocused`.

Build the content once per item, and pass hover, press, and focus as reactive
reads. No public name. No upstream equivalent; this is a port defect of
render props that re-run.

## Done when

In a browser, typing in a `TextField` inside a `TableCell` and moving the
pointer across the row leaves the text and the focus unchanged. An open menu
inside a `Card` in a `CardView` stays open across hover, press, and focus.
happy-dom is not the proof. Do not close this as unreproduced.

## Relationship

Child of #24. Visualmode works around it at `src/app/admin/AdminTable.tsx`
(02bda79e9) and `src/app/app/FileBrowserSections.tsx` (05b086669). Both go
when this lands. Visualmode tickets #10147 and #10150 wait on it.
