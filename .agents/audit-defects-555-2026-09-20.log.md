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

### 2b — the rest of `activeScope`'s lifetime (conductor review of `d0f095a1`)

Conductor review: upstream assigns `activeScope` at seven sites; `d0f095a1`
ported four (auto focus, the restore branch, the tracker branch, containment's
focusin) and left three. Read again in
`react-spectrum/packages/react-aria/src/focus/FocusScope.tsx`.

Item 1, the unmount cleanup (`FocusScope.tsx:182-190`). Reachable and reached.
Ours called `removeTreeNode` with no reparenting, so `activeScope` kept pointing
at the unmounted scope's accessor. The symptom here is not the predicted
"returns false for everything": our `traverse(node = this.root)` defaults to the
root when handed `getTreeNode(deadScope)` → `undefined`, so a dead `activeScope`
makes `isElementInChildScope` walk the whole tree and answer true for *every*
scope — over-permissive, not locked out. The red test is shaped around that: a
scope outside the newly active one must answer false. Red on `70a8d478`
(expected false, received true), green after. Commit `d77c494b`, changeset
`.changeset/focus-scope-active-scope-unmount.md`.

Item 2, the post-mount pass (`FocusScope.tsx:154-173`). Reachable, ported.
Upstream runs it once on mount, after the layout effect that collects the scope
nodes. Ours collects nodes in an effect plus a `MutationObserver`, so the same
callback in an `onSettled` sees `scopeElements()` empty — measured with a probe:
`scope.length === 0` on both mounts, so the `isElementInScope` guard returned
early and nothing was ever activated. Ported as a `createEffect(scopeElements,
…)` that runs once on the first non-empty collection, which is upstream's
timing, not upstream's hook. Without it, a scope holding focus at mount with
neither `autoFocus` nor a later `focusin` never becomes active.

Item 3, the mount re-parent (`FocusScope.tsx:100-113`). Reachable, ported. Our
`addTreeNode` took the context parent only; a scope mounting outside the active
scope (a DialogContainer launched from a menu) now takes `activeScope` as its
parent, guarded as upstream guards it — only when both the context parent and
the active scope are already in the tree, and the active scope is not already an
ancestor.

Red first, all three, on the `70a8d478` source: 3 failed | 34 passed. Green with
the fix: 37/37. Then `vp test run` over `FocusScope`, `FocusScopeOwnerDocument`,
`overlays`, `createDialog`, `createPopover`, `focus` → 145/145, and over
`Dialog`, `DialogTriggerDebug`, `Menu`, `Modal`, `Popover`, `Select`, `ComboBox`,
`Tooltip` in `solidaria-components` → 446/446.

### Two corrections to the standing brief (conductor, measured)

- earlyoom has killed nothing since 13:19; every kill today was 12:21-12:53,
  collateral of a Rust build that also killed rustc. It fires only when mem
  available <= 6% **and** swap free <= 25%. The handoff's "wait if swap free <
  30%" rule was gating for no reason: gate on `free -m` **mem available**.
- The detached whole-suite run is healthy (88 minutes, 101% CPU, RSS sawtoothing
  2.1-3.1 GB against a 4288 MB heap ceiling). Do not bound worker counts in any
  vitest config — #556 item 3 forbids the ceiling fix, and the premise that
  default parallelism kills workers is not currently true.

## 3a — createOverlay's lastVisibleOverlay, and the preventDefault

Upstream read: `useOverlay.ts:78-126`. `lastVisibleOverlay` is a ref holding the
overlay that was topmost when the pointer went down; pointer up hides only when
it still is the same overlay. Neither handler calls `preventDefault` — only
`stopPropagation`.

Two defects:

- We had no `lastVisibleOverlay`, so both handlers asked only "am I topmost
  now". One click that closes a menu, leaving the dialog under it topmost,
  closed the dialog too.
- Both handlers called `e.preventDefault()`, so the click that dismissed an
  overlay could not focus or activate whatever it landed on.

Red tests, `overlays.test.tsx`:

- "does not prevent the default action of an interaction outside" — a dispatched
  `pointerdown` comes back `defaultPrevented: true` on the old source.
- "closes only the overlay that was topmost when the interaction started" — a
  dialog and a menu, the menu closing between pointer down and click; on the old
  source the dialog's `onClose` is called once.

Fix: record the topmost overlay in `onInteractOutsideStart`, hide only when
`lastVisibleOverlay === ref`, clear it after the interaction, and drop both
`preventDefault` calls.

Green: `vp test run packages/solidaria/test/overlays.test.tsx packages/solidaria-components/test/Popover.test.tsx`
→ 76/76. Changeset `.changeset/overlay-last-visible.md`.

## 3b — the document-level focusin listener: invented, and kept for now

It is invented: `useOverlay` has no document listener at all; it closes on blur
from `onBlurWithin`. Ours came in with `47746917` ("Add ActionMenu focus-out
lifecycle coverage"), alongside the Popover test and the paired ActionMenu
Playwright spec that need focus leaving the overlay to close it.

Removing it turns `packages/solidaria-components/test/Popover.test.tsx` →
"should close modal popovers when focus moves outside" red (measured: 1 failed,
43 passed). The reason is not this listener but the hook under it. Probe:
`createFocusWithin` on a div, a real `.focus()` on a child button — neither
`onFocusWithin` nor `onBlurWithin` fires. `focusWithinProps` returns
`onFocus`/`onBlur`, which in Solid bind the native, non-bubbling events, while
React's synthetic pair bubbles, which is exactly what upstream relies on. So an
overlay whose focus lives in a child never blurs, and the listener is the only
thing closing it.

Fixing that is not a `createOverlay` edit: `createFocusRing`, `createMenu`,
`createListBox`, `createRadioGroup`, `createCheckboxGroup`, `createNumberField`,
`createDateField`, `createVisuallyHidden` and `createOverlay` all consume the
hook, and `Color.tsx` already carries a note describing the same defect from its
own side. Opened as #557, which owns both the port and the listener's removal.
Here the listener keeps a comment naming it as not upstream and pointing at
#557.

## 4 — createDialog's ids are slots, not unique ids

Upstream `useDialog` (`useDialog.ts:56-60`) takes both ids from `useSlotId`:
each resolves to `undefined` unless an element actually renders with it, so a
dialog with no title, or an alertdialog with no content, emits no dangling
`aria-labelledby` / `aria-describedby`. Ours used `createUniqueId`, so both
attributes always pointed somewhere — at nothing, when the slot was empty.
Measured red: `aria-labelledby="cl-38"` on a title-less dialog and
`aria-describedby="cl-43"` on a content-less alertdialog.

`createSlotId` (`packages/solidaria/src/ssr/index.tsx:115`) is already the 1:1
port of `useSlotId` and is already used by `createRadio`, `createToggle` and
`createMenuItem`; the fix is to call it here too, and to read it as an accessor
inside the two memos.

That exposed a second defect one layer up. `Dialog` labelled itself by its
trigger through a one-shot effect that mutated the DOM: read
`aria-labelledby`, and if it pointed at nothing, `setAttribute` the trigger's
id. It only ever worked because the slot id never cleared; with a real slot the
memo re-ran afterwards and wiped the attribute (measured: the dialog lost its
name, `Dialog.test.tsx` → "should get default aria label from trigger" red).
RAC does this as a derived value, not a mutation (`Dialog.tsx:148-153`: fall
back to the context's `aria-labelledby` only when neither `aria-label` nor a
title slot resolved), so `Dialog` now derives it the same way.

For the derivation to be correct the trigger element has to be readable
reactively, so `DialogTrigger`'s `triggerRef` is now a signal. Its context
already advertised `triggerRef: () => HTMLElement | null`, so no consumer
changes.

Proof: `vp test run` over `createDialog`, `createPopover`,
`solidaria-components` Dialog / DialogTriggerDebug / Modal / Popover and
`solid-spectrum` Dialog — 148 passed; then ContextualHelpTrigger, Popover,
Menu, ActionMenu, Button (`solid-spectrum`), Dialog, Button (`viviana-ui`) —
199 passed.
