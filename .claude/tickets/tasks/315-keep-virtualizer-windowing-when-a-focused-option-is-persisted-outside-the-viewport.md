---
id: 315
type: task
title: "Keep virtualizer windowing when a focused option is persisted outside the viewport"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 virtualizer functional pass: Tab to Item 0 then scrollTop=2160 keeps React on Items 54–59 at scrollHeight 2400 with Item 0 persisted off-screen; Solid renders all 60 options, scrollHeight 4480, and the visible window is Items 2–7. Click Item 2 then scroll 1600 is the same class. Unfocused D-scroll offsets still match.",
    }
---

RAC Virtualizer persists a focused option off-screen with absolute layout
inside a 2400px content box (`itemCount × rowHeight`), so the
geometry-determined visible key-set stays correct. Solid expands the
virtual range to include that persisted index (`mergePersistedKeysIntoVirtualRange`
with `maxExtraItems` 80, span 60 ≤ 88) and lays the extra rows out in
flow inside CollectionRoot padding, so `scrollHeight` grows past the
content extent and the majority-visible rows at the same `scrollTop` are
the wrong keys.

## Evidence

`http://127.0.0.1:4341/components/virtualizer/`, islands mounted, one
panel at a time. Viewport 240px, row 40px, 60 items.

Tab from Before (focus Item 0), then set the listbox `scrollTop` to 2160:

| | React | Solid |
|---|---|---|
| visible | Item 54–59 | Item 2–7 |
| scrollHeight | 2400 | 4480 |
| rendered | 8 (Item 0 persisted) | 60 |
| focus | Item 0 | Item 0 |

Click Item 2, then `scrollTop=1600`: React visible Item 40–45 at 2400px;
Solid visible Item 4–9 at 3840px. Scrolling back to 0 restores Item 0–5
and the selection on both.

Shift+Tab from After lands on Item 59 on both (visible 54–59), but Solid
renders all 60 options at `scrollHeight` 4480. Scrolling that inflated
scroller to its max (4240) shows Item 46–51, never the last page at the
RAC offset.

Unfocused programmatic scroll at 0 / 800 / 1600 / 2160 and Home/End
keyboard windowing still match. Certified D-scroll can stay green: it
pair-diffs visible keys only when unfocused, and focus-retention only
compares the active label.

## Done when

Tab to Item 0 and scroll to 2160 keeps `scrollHeight` 2400 and the
visible key-set Item 54–59, with Item 0 still focused off-screen, matching
React. A comparison-route walk fails if Solid’s majority-visible rows at
that offset are not 54–59.

## Relationship

Child of #24. Found by #260. Distinct from #129 (PageUp target) and from
unfocused D-scroll (already matching). Do not start #254. Do not waive
D-reorder (#256).
