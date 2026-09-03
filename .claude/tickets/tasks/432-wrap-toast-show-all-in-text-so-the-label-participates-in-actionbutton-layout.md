---
id: 432
type: task
title: "Wrap Toast Show all in Text so the label participates in ActionButton layout"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: 'filed from the #260 toast functional pass: collapsed stack of 3, S2 Show all is 94×32 with span slot=text "Show all" 48×18 + icon 16×18; Solid is 48×32 with childCount 1 (icon slot only, svg 18×18). The "Show all" string is a raw text node, so ActionButton grid does not size the label. Collapsed toast 228×84 vs 189×84, x 606 vs 625.5. Accessible name is still Show all. S2 wraps <Text>{toast.showAll}</Text><Chevron/>',
    }
---

S2 Toast "Show all" wraps the intl string in `Text` so ActionButton's
text slot participates in the grid. Solid Spectrum Toast concatenates
the formatted string with `ChevronDownIcon` as a raw text node, so
only the icon slot is a grid child. The button shrinks to 48×32
(icon-only width) and the collapsed toast is 39px narrower.

The accessible name is still "Show all" (the text node counts). The
user-visible miss is the missing label plus the stacked-toast width
and the stacked variant-icon x-offset (same 39px delta).

## Evidence

`http://127.0.0.1:4341/components/toast/?activeSide=react` (then
solid), islands mounted. Queue three toasts (Negative, Positive,
Neutral). Collapsed stack:

|                   | React                               | Solid                           |
| ----------------- | ----------------------------------- | ------------------------------- |
| toast             | 228×84 @ x 606                      | **189×84 @ x 625.5**            |
| Show all          | **94×32**, gridArea expand          | **48×32**, gridArea expand      |
| Show all children | span `slot=text` 48×18 + icon 16×18 | **icon only** 48×18 (svg 18×18) |
| childCount        | 2                                   | **1**                           |
| AX button name    | Show all                            | Show all                        |

S2 (`@react-spectrum/s2/src/Toast.tsx` ~604–612):

```tsx
onPress={() => {
  toastRef.current?.focus();
  ctx?.toggleExpanded();
}}>
  <Text>{stringFormatter.format('toast.showAll')}</Text>
  <Chevron … />
```

Solid (`packages/solid-spectrum/src/toast/index.tsx` ~1019–1034):

```tsx
<ActionButton … onPress={local.onToggleExpanded}>
  {stringFormatter().format("toast.showAll")}
  <ChevronDownIcon aria-hidden="true" … />
</ActionButton>
```

## Repro

1. Open `http://127.0.0.1:4341/components/toast/?activeSide=solid`.
2. Wait for `data-islands-mounted="true"`.
3. Click Show Negative Toast, Show Positive Toast, Show Neutral Toast.
4. Measure the visible "Show all" button: 48×32, no text slot, toast
   189×84. Repeat with `?activeSide=react`: 94×32 with a 48×18 "Show
   all" span, toast 228×84.

## Done when

Collapsed-stack Show all on the comparison route matches S2: `Text`
slot + chevron, 94×32, toast 228×84, accessible name still "Show all".
A walk fails if the button has no text slot while the string is in
the intl catalog. Do not start #254. Do not patch S2 styling in the
comparison app (ADR 0001).

## Relationship

Child of #24. Found by #260. Not #11 (title `span slot=title` vs
unslotted span; not user-visible). Not #105 (glyph subpixel). Not
#200 (the `toast.showAll` string is present). Stack expand/collapse
focus is #434. Do not start #254.
