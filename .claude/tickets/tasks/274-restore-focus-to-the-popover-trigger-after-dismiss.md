---
id: 274
type: task
title: "Restore focus to the Popover trigger after dismiss"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 popover functional pass: Escape, outside click, and trigger re-press close the Solid overlay but leave document.activeElement on body; React restores the Feedback trigger",
    }
---

On `/components/popover/`, dismiss an open DialogTrigger popover. React
restores `document.activeElement` to the Feedback trigger (keyboard dismiss
also sets `:focus-visible`). Solid closes the overlay and leaves focus on
`document.body` through 1500ms.

This is not #251 timing. Picker/Menu/ActionMenu on this preview restore the
trigger after settle even when Solid unmounts immediately. Popover never
does. #235 is the nested null first-in-scope walk, not this trigger restore.

Headless Popover already mounts `<FocusScope restoreFocus contain>`. Restore
on unmount schedules an rAF that no-ops unless `activeElement === body`
(`packages/solidaria/src/focus/FocusScope.tsx`). DialogTrigger auto-focuses
the `role="dialog"` root; instant unmount (no exit animation, #251) can
race that guard so the trigger is never refocused.

## Evidence

`http://127.0.0.1:4341/components/popover/` and
`?showForm=false`, one panel at a time, `data-islands-mounted`.

Pointer click Feedback, wait until opacity 1, then Escape / click (8,8) /
force-click the trigger. Keyboard: focus trigger, Enter, Escape.

- React: overlay gone, `aria-expanded=false`, focus on button "Feedback"
  (`:focus-visible` after keyboard).
- Solid: overlay gone, `aria-expanded=false`, focus on `body` at 0 / 50 /
  200 / 400 / 800 / 1500ms.

Open AX, geometry, Tab trap, and form values already match.

## Done when

Dismiss (Escape, outside press, trigger re-press) restores the comparison
Popover trigger on both stacks, matching React. A Playwright walk on
`/components/popover/` fails if Solid focus is `body` while the overlay is
gone.

## Relationship

Child of #24. Found by #260. Distinct from #251 (enter/exit animation; Picker
already restores after settle) and #235 (null first-in-scope). Do not start
#254.
