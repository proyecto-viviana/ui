---
id: 339
type: task
title: "Apply live Card size to title and description styles"
created: 2026-09-03
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 card functional pass: URL ?size=XL is 18px/16px title/description and 240×262 on both; live comparison:controls-change {size:'XL'} updates React to the same fonts/height and leaves Solid at first-paint 14px/12px and 240×250. Card host padding does update (24px both). Text slot styles come from CardProviders TextContext and stay snapped",
    }
  - {
      state: merged,
      at: 2026-09-03,
      note: "CardProviders title/description styles and Text context reads track live size.",
    }
---

Card `size` updates title/description fonts on URL remount. A live
`comparison:controls-change` after mount updates React and leaves Solid
on the first-paint type styles.

The Card host already tracks `size` (padding `16px` → `24px` on both).
Title and description classes come from `CardProviders` `TextContext`
(`title({ size })` / `description({ size })`). Solid `Text` reads that
context once in the component body, so live `size` does not restyle
the slots. Title _text_ does update (`Zephyr`).

## Evidence

`http://127.0.0.1:4341/components/card/`, islands mounted.

URL `?size=XL` already matches: padding 24px, title 18px / description
16px, card 240×262 on both.

Live from the default route, `comparison:controls-change` `{size:"XL"}`:

|                     | React       | Solid           |
| ------------------- | ----------- | --------------- |
| padding             | 24px        | 24px            |
| title / description | 18px / 16px | 14px / 12px (M) |
| card                | 240×262     | 240×250         |

The 12px height gap follows the stale fonts through later live
density/variant/preview/footer changes. URL remount of the same size
closes it.

## Done when

A live `size` after mount restyles title and description to the S2
size tokens (XL `18px`/`16px`, height 262) without a remount. A
comparison-route live size walk fails if Solid stays on M type styles.

## Relationship

Child of #24. Found by #260. `CardProviders` /
`packages/solid-spectrum/src/text/index.tsx` `getSlottedContextProps`.
Live `href` element switch is #338. Not #168 (title text is already
reactive) or #169 (SelectBox). Do not start #254.
