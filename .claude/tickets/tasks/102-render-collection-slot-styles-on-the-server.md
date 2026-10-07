---
id: 102
type: task
title: "Render collection slot styles on the server"
created: 2026-08-20
parent: 32
status: verified
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "recovered from the Glasselated ListView mirror during the live-document audit",
    }
  - {
      state: verified,
      at: 2026-10-07,
      note: "Slot classes for label, description, icon, and actions are already applied during render in solid-spectrum and viviana-ui ListView and Tree. SSR markup carries those classes, and a JavaScript-disabled browser check shows the row as a grid with those four areas on the first painted frame. Slotted ListView rows hydrate and toggle selection in both packages; the slotted viviana-ui Tree does too. Existing Tree and collection hydration tests stay green. solid-spectrum Tree still builds the unused framed branch, so that document's hydration key miss stays with #44.",
    }
---

Styled Tree and GridList items assign label, description, icon, and action
classes with `querySelectorAll` inside `createEffect`. The server output has the
slot attributes but not the generated layout classes. The first browser paint
can therefore use the wrong grid placement before the effect runs.

The current hydration tests prove node stability. They do not prove the
server-rendered classes or the first painted layout.

## Scope

- Reproduce the server markup and first-paint behavior in `solid-spectrum` and
  `viviana-ui` Tree and GridList.
- Compare the upstream composition model before changing ownership.
- Put slot and data-attribute behavior in the lowest applicable layer.
- Remove the post-render DOM walk if the shared composition layer can provide
  the required information during render.
- Preserve all public APIs, ARIA, item semantics, and generated S2 styles.
- Add SSR assertions and browser evidence that can fail before the first effect.

## Done when

The initial server output contains the required slot styling, and a browser test
proves that labels, descriptions, icons, and actions have their final layout on
the first painted frame. Hydration and post-hydration interaction remain green.

## Relationship

Ticket #44 owns collection node-shape and children-evaluation hydration bugs.
Ticket #103 owns register-specific ListView design decisions.

## Round-2 note (2026-09-01)

Runtime delta (F-PERF-008): every mounted GridListItem/TreeItem runs five `querySelectorAll` walks per render-props change in `createEffect`; without windowing (#65/#66) the tax is O(n) per selection/hover update. The fix is still slot classes at render.
