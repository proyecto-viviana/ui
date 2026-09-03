---
id: 338
type: task
title: "Switch a standalone Card to a link when href is set after mount"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 card functional pass: URL ?href=#card-target paints both as <a tabindex=0> named Apollo Active; live comparison:controls-change {href:'#card-target'} updates React to a tabbable link and leaves Solid a DIV with cursor auto. Card if (local.href) return <Link> is a one-shot Solid body branch",
    }
---

Standalone Card `href` updates on URL remount. A live
`comparison:controls-change` after mount turns React into a link and
leaves Solid a static `div`.

S2 `Card` re-renders the Link branch when `href` appears. Solid
`Card` chooses `HeadlessLink` vs `div` with `if (local.href)` in the
component body, which runs once, so a first-paint empty `href` never
becomes a link.

The comparison fixture already exposes `href` as a getter off
`demoProps()`
(`apps/comparison/src/components/solid/fixtures/styled/card.tsx`).
The live listener calls `setDemoProps`. React still paints the link;
Solid does not.

## Evidence

`http://127.0.0.1:4341/components/card/`, islands mounted.

URL `?href=%23card-target` already matches: both `<a href="#card-target"
target="_blank" rel="noreferrer" tabindex=0>`, AX `link "Apollo Active"`,
Tab from Before lands on the card with a 2px ring, hover `data-hovered`,
pointer press-scale, quiet focus ring on the preview.

Live from the default route,
`comparison:controls-change` `{href:"#card-target"}`:

|      | React                                               | Solid                         |
| ---- | --------------------------------------------------- | ----------------------------- |
| host | `<a href="#card-target" tabindex=0>` cursor pointer | `DIV` tabindex -1 cursor auto |
| AX   | `link "Zephyr Queued"` / `link "Apollo Active"`     | `text: …` (not a link)        |
| Tab  | lands on the card, 2px ring                         | skips to After                |

## Done when

A live `href` after mount renders a tabbable link on Solid matching
React/S2, without a URL remount. A comparison-route Tab walk fails if
Solid stays a `div`.

## Relationship

Child of #24. Found by #260. Branch is
`packages/solid-spectrum/src/card/index.tsx`. Live size slot styles are
#339. Do not start #254.
