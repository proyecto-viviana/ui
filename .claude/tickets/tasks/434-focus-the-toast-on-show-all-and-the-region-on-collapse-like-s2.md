---
id: 434
type: task
title: "Focus the toast on Show all and the region on Collapse like S2"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 toast functional pass: S2 Show all onPress focuses toastRef then toggleExpanded (button disappears). S2 collapse focuses regionRef then toggleExpanded. Solid onPress only toggleExpanded; collapse() only startViewTransition setIsExpanded(false). After Show all: React focus=alertdialog Toast is burned!, Solid BODY. After Collapse: React region Notifications tabIndex -1, Solid BODY. After Clear all (from expanded, React still on the toast): React BODY vs Solid Show Positive Toast. Outside click while collapsed: React region vs Solid toast",
    }
---

S2 moves focus before the Show all / Collapse controls disappear.
Solid only runs the view-transition toggle, so keyboard focus falls
to `BODY`.

S2 Show all (`@react-spectrum/s2/src/Toast.tsx` ~604–608):

```tsx
onPress={() => {
  // This button disappears when clicked, so move focus to the toast.
  toastRef.current?.focus();
  ctx?.toggleExpanded();
}}
```

S2 collapse (~390–393):

```tsx
let collapse = () => {
  regionRef.current?.focus();
  ctx.toggleExpanded();
};
```

Solid Show all (`packages/solid-spectrum/src/toast/index.tsx`
~1019–1025) sets `onPress={local.onToggleExpanded}` with no focus
move. Solid `ToastContainer.collapse` (~882–886) only
`startViewTransition(() => setIsExpanded(false), "toast-collapse")`.

Clear-all restore is a consequence: React had focused the toast, so
`restoreLastFocused` lands on `BODY` when the region unmounts; Solid
never focused the toast, so lastFocused is the last trigger. Re-check
Clear all after this focus move lands; do not treat it as a separate
bug until then.

## Evidence

`http://127.0.0.1:4341/components/toast/`, islands mounted, isolated
`?activeSide=` per stack. Queue three toasts, then:

| step                            | React                                       | Solid               |
| ------------------------------- | ------------------------------------------- | ------------------- |
| after Show all                  | `alertdialog` "Toast is burned!" tabIndex 0 | **BODY**            |
| after Collapse                  | `region` "Notifications" tabIndex -1        | **BODY**            |
| after Clear all (from expanded) | BODY                                        | Show Positive Toast |
| outside click while collapsed   | region                                      | toast               |

Single-toast Dismiss Enter restores to Show Neutral Toast on both.
Escape on an open toast does not dismiss on both. Tab from an open
toast walks the four triggers, not into the toast, on both.

## Repro

1. Open `http://127.0.0.1:4341/components/toast/?activeSide=react`.
2. Wait for `data-islands-mounted="true"`.
3. Click Show Negative, Show Positive, Show Neutral.
4. Click Show all: focus is the burned-toast alertdialog.
5. Click Collapse: focus is the Notifications region.
6. Repeat with `?activeSide=solid`: both steps leave focus on `BODY`.

## Done when

Show all moves focus to the toast and Collapse moves focus to the
region on the comparison route, matching S2. A walk fails if either
step leaves `document.activeElement` as `BODY` while the toast stack
is still on screen. Re-check Clear all restore after this lands. Do
not start #254.

## Relationship

Child of #24. Found by #260. Show all missing `Text` slot is #432
(layout). List `ol`/`li` is #433. Landmark F6 is #436. Do not start
#254.
