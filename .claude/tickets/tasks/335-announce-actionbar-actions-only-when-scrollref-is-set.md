---
id: 335
type: task
title: "Announce ActionBar actions only when scrollRef is set"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 actionbar functional pass: S2 ActionBarInner announces actionbar.actionsAvailable only when scrollRef is set on mount. Solid headless ActionBar announces whenever isOpen becomes true. Fresh default load (no scrollRef, both panels) leaves one assertive live region; ?useScrollRef=true leaves two. Styled layer always passes actionsAvailableMessage",
    }
---

S2 ActionBar announces `"Actions available."` only for a `scrollRef`
bar, on `ActionBarInner` mount:

```ts
if (isInitial.current && scrollRef) {
  announce(stringFormatter.format('actionbar.actionsAvailable'));
}
```

Solid headless ActionBar announces whenever `isOpen` flips true
(`packages/solidaria-components/src/ActionBar.tsx` createEffect), and
the styled layer always passes `actionsAvailableMessage`. Default
(no `scrollRef`) therefore announces on Solid and stays silent on S2.

## Evidence

`http://127.0.0.1:4341/components/actionbar/`, islands mounted.
Document-level `[aria-live=assertive]` regions (both stacks write
their own announcer):

| load | live regions |
|---|---|
| default (`selectedItemCount=3`, no scrollRef) | 1 × `"Actions available."` |
| `?selectedItemCount=0` | 0 |
| `?useScrollRef=true` | 2 × `"Actions available."` |
| live 0→3 with `useScrollRef` | 2 |

Two announcers exist (scrollRef path produces two regions), so a
single region on the default load is one stack announcing, not a
shared live node. S2 source does not announce without `scrollRef`.

## Done when

A default ActionBar (no `scrollRef`) does not announce on Solid.
A `scrollRef` bar still announces once when it appears, matching S2.
A comparison-route walk fails if the default load produces a Solid
`"Actions available."` live region that S2 does not.

## Relationship

Child of #24. Found by #260. Distinct from #180 (D6 driver coverage
for announce *triggers* in certified specs). Do not start #254.
