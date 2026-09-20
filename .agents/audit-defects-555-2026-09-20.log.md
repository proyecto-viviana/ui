# #555 audit defects — log

Brief: conductor, 2026-09-20, queue item 3 (handoff §6). Ticket
`.claude/tickets/tasks/555-fix-the-confirmed-overlay-dialog-and-link-defects.md`,
rows in `.agents/audit-2026-09-20/VERIFIED.md`. First four defects, in the
ticket's order, one commit each: red test → fix → green → changeset. Only the
touched test files are run; the detached whole-suite run holds the heavy slot.

## 1 — Modal uses createPreventScroll

Upstream read first: `react-spectrum/packages/react-aria/src/overlays/useModalOverlay.ts:65-67`
calls `usePreventScroll({isDisabled: !state.isOpen})`. `usePreventScroll` keeps
a module-level `preventScrollCount` and one `restore`, so every open overlay is
a holder of a single document lock; it also handles the scrollbar gutter
(`scrollbar-gutter: stable`, else `padding-right`) and the mobile-Safari path.

Ours (`packages/solidaria-components/src/Modal.tsx:489-507`) set
`document.documentElement.style.overflow = "hidden"` directly and restored the
value it captured on open. We already ship the faithful port,
`createPreventScroll` in `@proyecto-viviana/solidaria` — the one-off simply did
not use it.

Red test, `Modal.test.tsx` → "should keep the page locked while open when
another scroll lock releases": an independent `createPreventScroll` holder takes
the lock, a Modal opens, the independent holder disposes. On the old source the
count drops to 0 and `restore()` gives the page back to the user while the modal
is still open — `expected '' to be 'hidden'`. With the fix the Modal is itself a
holder, the count stays at 1, and the lock holds.

Fix: `createPreventScroll({ get isDisabled() { return !isOpen(); } })`, the
getter keeping the option reactive the way upstream's dependency array does. No
other behavior touched; the two `TextArea.tsx` twins that also write
`style.overflow` are auto-resize, not scroll locks.

Green: `vp test run packages/solidaria-components/test/Modal.test.tsx` → 24/24.
`vp test run packages/solidaria/test/createPreventScroll.test.tsx packages/solidaria-components/test/Dialog.test.tsx`
→ 36/36.
Changeset `.changeset/modal-prevent-scroll.md`.

## 2 — FocusScope top-layer attribute and isElementInChildOfActiveScope

Upstream read: `react-spectrum/packages/react-aria/src/overlays/useOverlay.ts`
imports `isElementInChildOfActiveScope` straight from `../focus/FocusScope` and
asks it before closing on blur (lines 148-161); `FocusScope.tsx` keeps a
module-level `activeScope`, set from three places — `useAutoFocus`,
`useFocusContainment`'s focusin, and the `useRestoreFocus` /
`useActiveScopeTracker` pair — and gated by `isAncestorScope`, so focus moving
into a child scope makes the child active while moving out to an ancestor does
not.

Two defects, one cause each:

- `isElementInChildScope` queried `[data-react-aria-top-layer]`. Nothing in this
  repo sets that name: `createToastRegion` sets `data-solidaria-top-layer`, and
  `createInteractOutside`, `ariaHideOutside` and the Toast tests all agree on it.
  FocusScope was the lone outlier, so a contained scope dragged focus back out of
  a toast.
- We had no `activeScope` at all, so `isElementInChildOfActiveScope` could not be
  exported — it had to be ported with its three assignment sites. Kept private,
  as upstream does (`/** @private */`, absent from the barrel); `createOverlay`
  imports it directly.

Red tests:

- `FocusScope.test.tsx` → "should let focus move into a top-layer element
  outside the scope": a contained scope, a `data-solidaria-top-layer` div in the
  body. On the old source containment pulls focus back to the scope's input —
  `expected <input> to be <button>`.
- `overlays.test.tsx` → "does not close on blur when focus moves into a child
  focus scope": a dialog scope holding the overlay plus a sibling child scope
  standing in for a portaled menu. On the old source `onClose` is called once;
  with the fix the blur handler returns early. The handlers are driven directly,
  the way the escape tests drive `onKeyDown`, because a real focus move would
  also run the document-level `focusin` listener that item 3 removes.

Fix: module-level `activeScope` + `isAncestorScope` + `isElementInAnyScope` in
`FocusScope.tsx`, assigned in the auto-focus callback, in containment's focusin,
and in a new tracker effect covering the two non-contained cases; the top-layer
selector renamed to the attribute the repo sets; `createOverlay`'s
`onBlurWithin` now returns early on `isElementInChildOfActiveScope`.

Green: `vp test run` over `FocusScope`, `FocusScopeOwnerDocument`, `overlays`,
`createFocusWithin`, `createDialog`, `createPopover`, `createMenu`,
`createToast`, `focus` and `focusSafely` → 228/228.
Changeset `.changeset/focus-scope-active-scope.md`.
