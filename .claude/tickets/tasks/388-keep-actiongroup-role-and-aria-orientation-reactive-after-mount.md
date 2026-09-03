---
id: 388
type: task
title: "Keep ActionGroup role and aria-orientation reactive after mount"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 actiongroup functional pass: URL remount of selectionMode/orientation already matches (none→toolbar+aria-orientation, single→radiogroup with aria-orientation omitted, multiple→toolbar, vertical toolbar aria-orientation=vertical). Live {selectionMode:'single'} updates React to radiogroup and leaves Solid role=toolbar aria-orientation=horizontal while item roles already become radio. Live {orientation:'vertical'} updates React aria-orientation=vertical and leaves Solid aria-orientation=horizontal (data-orientation and flex-direction already vertical). createActionGroup applyRoleAttributes only runs from the group ref / queueMicrotask",
    }
---

`useActionGroup` recomputes the host `role` and `aria-orientation`
every render from `selectionManager.selectionMode` and `orientation`
(`none`/`multiple` → `toolbar` with `aria-orientation`; `single` →
`radiogroup` with orientation omitted). URL remount of those props
already matches. A live `comparison:controls-change` updates Solid
*item* `role` / `aria-checked` through the button getters and leaves
the group host on the first-paint attributes.

`packages/solidaria/src/actiongroup/createActionGroup.ts`
`applyRoleAttributes()` writes `role` and `aria-orientation` only
from the group `ref` callback and a follow-up `queueMicrotask`. The
`aria-disabled` getter on `actionGroupProps` is already live.

## Evidence

`http://127.0.0.1:4341/components/actiongroup/`, islands mounted.
Other `.s2-framework-panel` `visibility:hidden` + `inert`.

URL `?selectionMode=single&orientation=vertical&defaultSelectedKeys=italic`
remount: both `role=radiogroup`, no `aria-orientation`, Italic
`aria-checked=true`. AX equal.

From a fresh default route, live `{selectionMode:"single"}`:

| | React | Solid |
|---|---|---|
| group `role` | `radiogroup` | `toolbar` |
| `aria-orientation` | omitted | `horizontal` |
| item `role` | `radio` | `radio` |
| AX | `radiogroup "Text style"` + radios | `toolbar "Text style"` + radios |

Live `{selectionMode:"none", orientation:"vertical"}`:

| | React | Solid |
|---|---|---|
| group `role` | `toolbar` | `toolbar` |
| `aria-orientation` | `vertical` | `horizontal` |
| `flex-direction` / `data-orientation` | row / omitted | column / `vertical` |

Live `{selectionMode:"multiple"}` after single: both `toolbar` +
checkbox items (Solid group role was already toolbar).

## Done when

Live `selectionMode` / `orientation` after mount restyle the
ActionGroup host the way `useActionGroup` does (`toolbar` /
`radiogroup`, `aria-orientation` only on toolbar), without a remount.
Item roles already follow. URL remount stays matched. A comparison
walk fails if Solid stays `role=toolbar` after live single or keeps
`aria-orientation=horizontal` after live vertical.

## Relationship

Child of #24. Found by #260. Same one-shot host-attribute pattern as
#384 (Form grid class) and #375 (Slider fill), but this is ActionGroup
ARIA. `data-orientation` extra on Solid is structural. Do not start
#254.
