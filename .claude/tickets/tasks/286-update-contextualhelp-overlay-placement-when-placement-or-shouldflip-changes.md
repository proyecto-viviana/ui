---
id: 286
type: task
title: "Update ContextualHelp overlay placement when placement or shouldFlip changes"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 contextualhelp functional pass: URL remount placements match; live placement/shouldFlip after mount leave the Solid overlay at the first-render axis",
    }
---

On `/components/contextualhelp/`, changing `placement` or `shouldFlip` after
mount updates `data-comparison-control-props` on both stacks. React moves the
open dialog (or opens on the new axis). Solid stays on the mount-time
placement.

URL remount (`?placement=top start`, `?placement=left`, `shouldFlip=false`
near the top of the viewport) matches exactly. The Popover route's live
placement already matches. This is not #268 (MenuTrigger `direction`/`align`)
and not #69 (share `ContextualHelpPopover`).

## Evidence

`http://127.0.0.1:4341/components/contextualhelp/`, one panel at a time,
`data-islands-mounted`. Isolated click, wait until opacity 1.

| path                                                                               | React                                 | Solid                   |
| ---------------------------------------------------------------------------------- | ------------------------------------- | ----------------------- |
| `?placement=top start&shouldFlip=false` then click                                 | `data-placement=top` dy −165 gapTop 8 | same                    |
| default, dispatch `placement=top start`, then click                                | `top` dy −165                         | **`bottom` dy 28**      |
| open, then dispatch `placement=left`                                               | `left` dx −276 dy −68                 | **`bottom` dx 0 dy 28** |
| `?placement=top start&shouldFlip=false` near top, open, dispatch `shouldFlip=true` | flips to `bottom` dy 28               | **stays `top` dy −92**  |
| viewer placement Picker → `top start`, then click                                  | `top`                                 | **`bottom`**            |

Control props already show the new `placement` / `shouldFlip` on Solid.

## Done when

Changing `placement` or `shouldFlip` after mount — closed-then-open and
while open — places the Solid ContextualHelp overlay on the same axis and
offset as React. A comparison-route walk that toggles those controls fails
if Solid `data-placement` stays at the mount-time value.

## Relationship

Child of #24. Found by #260. Distinct from #268 (MenuTrigger direction/align)
and from the Popover route, whose live placement already matches. Do not
start #254.
