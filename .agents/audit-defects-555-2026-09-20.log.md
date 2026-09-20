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

Commits: `d77c494b` (item 1, unmount cleanup, changeset
`.changeset/focus-scope-active-scope-unmount.md`) and `7fe157ed` (items 2 and 3,
mount activation and re-parent, changeset
`.changeset/focus-scope-active-scope-mount.md`). Both accepted on review as 1:1
with upstream; pushed with `a419e426..7fe157ed`.

### Two corrections to the standing brief (conductor, measured)

- earlyoom has killed nothing since 13:19; every kill today was 12:21-12:53,
  collateral of a Rust build that also killed rustc. It fires only when mem
  available <= 6% **and** swap free <= 25%. The handoff's "wait if swap free <
  30%" rule was gating for no reason: gate on `free -m` **mem available**.
- ~~Memory is not a constraint: 8335 MB available, no earlyoom activity since
  13:19. Stop gating on swap entirely.~~ **Corrected by the conductor at 16:45,
  measured.** Memory is decisively the constraint for the whole-suite run. That
  8335 MB reading was taken at rest *after* the process had already died, which
  is the wrong measurement: `free -m` at rest says nothing about a run, only the
  RSS curve during it does. earlyoom SIGTERMed the vitest **main** process twice
  today (16:35:44, VmRSS 10229 MiB; 16:37:23, VmRSS 10350 MiB, with mem
  available 5.79% and swap free 2.72%), and its `--avoid` list shields `claude`,
  so vitest is always the victim. Under `pool=vmThreads` the main process climbs
  monotonically to ~10.2 GiB in about 90 seconds. Gate heavy steps on the RSS
  curve of the run, not on swap and not on `free -m` at rest.
- The detached whole-suite run is **not** healthy; the fourth attempt died the
  same way after 101 minutes. Still do not bound worker counts in any vitest
  config — #556 item 3 forbids that ceiling. The ceiling that is allowed is on
  memory: `test.poolOptions.vmThreads.memoryLimit`, which recycles a VM worker
  without touching parallelism.

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

## 7 — createId returned the default id without generating one

Upstream read: `react-spectrum/packages/react-aria/src/utils/useId.ts` — `useId`
always calls `useSSRSafeId()` and only then chooses between it and the passed
id. Ours returned early on `defaultId` in both twins
(`packages/solid-stately/src/ssr/index.ts:49-54`,
`packages/solidaria/src/ssr/index.tsx:90-97`), so the generator was never
called.

Why it matters here and not only upstream: Solid 2's `createUniqueId` is
`sharedConfig.hydrating ? sharedConfig.getNextContextId() : \`cl-${counter++}\``
(`solid-js/dist/solid.js:1159`). Both branches are order-dependent, so a
component that takes an `id` prop silently shifts every id generated after it in
the same render or hydration pass — the classic hydration-mismatch shape.

Red test (both twins): `createId()`, `createId("given-id")`, `createId()`, then
assert the counter advanced by 2 across the three calls. Measured red,
`expected 1 to be 2`, in `packages/solidaria/test/ssr.test.tsx` and the new
`packages/solid-stately/test/ssr.test.ts` (solid-stately had no `ssr` test file;
the second test in it pins the `defaultId` return that the fix must keep).

Fix: hoist `createUniqueId()` — and in solidaria's twin the
`useContextOptional(SSRContext)` read with it, so the context read keeps the
same order too — above the `defaultId` branch. The returned value is unchanged;
only the call order is.

Green: `vp test run packages/solidaria/test/ssr.test.tsx
packages/solid-stately/test/ssr.test.ts` → 29/29;
`createDialog` + `Dialog` → 59/59; `packages/solid-spectrum/test/regression.test.tsx`
(the only suite that asserts generated id text) → 50/50. The `*.ssr`/`*.hydrate`
suites are excluded from this vitest project and were not run.
Changeset `.changeset/create-id-generate-first.md`.

## 6 — openLink navigated instead of dispatching the click

Upstream read: `react-spectrum/packages/react-aria/src/utils/openLink.tsx:106-144`.
`openLink` never navigates. It builds a `MouseEvent("click")` carrying the four
modifier keys with `detail: 1`, `bubbles` and `cancelable` (a `KeyboardEvent`
instead on WebKit + Mac outside iPad, and outside tests), sets its `isOpening`
latch, calls `focusWithoutScrolling(target)`, dispatches on the link, and clears
the latch. The Firefox branch forces the meta/control key when a keyboard event
opens a `target="_blank"` link, because Firefox's popup blocker otherwise eats
it.

Ours (`packages/solidaria/src/utils/dom.ts:572-593`) set `window.location.href`
or called `window.open` itself. Everything downstream of the click was lost: a
`RouterProvider` listening for clicks never saw one, `preventDefault` could not
work, and `rel`/`download`/`ping` were re-derived by hand instead of being the
link's own. `createInteractionModality` reads the `isOpening` latch, which the
old version set around a synchronous navigation that never dispatched anything.

Signature also diverged: upstream `(target, modifiers, setOpening = true)`
taking a modifiers object; ours `(target, event, allowOpener)`. Ported to
upstream's. The call sites already passed an event, which satisfies the
modifiers shape structurally, so only the two `as unknown as Event` casts in
`createSelectableItem.ts` had to go. `allowOpener` had no caller.

Red test, the new `packages/solidaria/test/openLink.test.ts`: 4 cases (a click
is dispatched with `detail: 1`, modifiers are carried, the link is focused and
`isOpening` is true during the dispatch, `setOpening: false` leaves the latch
alone). All four measured red against the old implementation — `expected [] to
have a length of 1`, `expected null to be <a …>`, `expected undefined to be
true`. Green after: 4/4.

**Two copies, one kept.** `packages/solidaria-components/src/RouterProvider.tsx`
held a second `openLink` (the faithful dispatch, minus the latch, the focus call
and the platform branches). Canonical is solidaria's: the press and selection
hooks call it, and `createInteractionModality` reads its latch — a second module
with its own latch would mean the modality code and the router disagreeing about
whether a link is opening. `RouterProvider` now imports it and re-exports the
name it already published, so nothing downstream breaks; a new test in
`RouterProvider.test.tsx` asserts the two exports are the same function and that
it dispatches. `openLink` and `LinkModifiers` are now exported from solidaria's
root for that import.

Typecheck: `vp exec tsc --noEmit -p tsconfig.typecheck.json` also surfaced two
errors in `FocusScope.tsx` from `d0f095a1` — `"focusin"` is not in TypeScript's
`ElementEventMap`, so the per-element listeners needed the `EventListener`
overload. Fixed in `083f3936`; the only errors left are the three pre-existing
`scripts/*.test.ts` ones.

Green: `openLink` 4/4, `RouterProvider` 6/6, `createComboBox` + `RouterProvider`
53/53, `createPress` + `createSelectableItem` 107/107, `FocusScope` 37/37.
Changeset `.changeset/open-link-dispatch.md`.

## Item 5 — ButtonGroup loses overflow re-measurement when its children change

Fixed in both twins, `packages/solid-spectrum/src/buttongroup/index.tsx` and
`packages/viviana-ui/src/buttongroup/index.tsx` (byte-identical before and
after), in one commit.

**Why the literal ticket wording was not followed.** The ticket says to regain
the `children` dependency in the tracked effect. The tree forbids it, and the
tree is right: line 164 already carries the comment saying `local.children` must
not be read there, because `mergeProps` children getters instantiate JSX and
that is `PRIMITIVE_IN_FORBIDDEN_SCOPE` inside a tracked effect. Upstream's
intent is what matters — S2 `ButtonGroup.tsx:157` lists `children` in
`checkForOverflow`'s dependencies and re-measures in a layout effect, and
observes only the parent (line 175). The hole in ours is that a width-
constrained group keeps its own border box when a child is added, removed or
relabelled, so neither observed box resizes and nothing re-measures. The
Solid-native way to say "children changed" is to watch the rendered DOM: a
`MutationObserver` on the group with `childList`, `subtree` and `characterData`
calling `scheduleOverflowCheck`, created beside the `ResizeObserver` in the same
`onSettled` and disconnected in the same `onCleanup`. That is the shape
`packages/solid-spectrum/src/breadcrumbs/index.tsx` already uses for overflow
measurement; no new dependency. The group and its parent are still observed for
resize, which is a superset of upstream.

Red test, the new `ButtonGroup.test.tsx` in each package's `test/` (jsdom
reports every box as zero, so `offsetLeft`/`offsetWidth` are read from data
attributes for the file's lifetime, and each assertion waits two animation
frames so it cannot race the pending measurement): adding a child to a
width-constrained group, and relabelling a child so it no longer fits, both left
the group horizontal. Red 2/2 in each package before the fix, green 4/4 after.
Neighbours green: `Wave4Components`, `Dialog`, `ActionBar`,
`IllustratedMessage` 73/73.

Changeset `.changeset/buttongroup-children-overflow.md`.

## #556 items 1 and 2 — the whole-suite death is the pool's memory ceiling

Measured A/B, same machine, same tree, same watchdog (kill the vitest process
at 9000 MB, cap the run at 25 minutes), only `vitest.config.ts` differing.

| run | ceiling | result | peak RSS |
| --- | --- | --- | --- |
| `memlimit-vm400` | `test.vmMemoryLimit: "400MB"` | 350 files, 6689 passed, 1 expected fail, 6 skipped, 73s, EXIT=0 | 7634 MB |
| `memlimit-control` | none (Vitest default) | killed by the watchdog after about a minute | 10033 MB |

Why the default is the problem: under `pool: "vmThreads"` the workers are worker
threads, so their memory is the main process's RSS — which is why earlyoom
SIGTERMs the main process and never a worker. Vitest 4 resolves the ceiling as
`1 / maxWorkers` of total memory **per worker** (`getWorkerMemoryLimit`,
`cli-api` 2358-2361), about 1 GB each on 16 cores, so in aggregate the ceiling
is the whole box and RSS climbs monotonically until earlyoom acts.

Two corrections to the conductor's brief, both measured here:

- `test.poolOptions.vmThreads.memoryLimit` does not exist in Vitest 4. The
  runner prints `` `test.poolOptions` was removed in Vitest 4 `` and ignores it;
  the option is top-level `test.vmMemoryLimit`. My first attempt used the
  `poolOptions` spelling and climbed to 7.2 GB in 60 seconds, as expected.
- The ceiling does nothing on a single package (76 files: 6724 MB with it, 6785
  MB without). It only bites over a set long enough for a worker to accumulate.
  So a package-sized probe cannot prove or disprove it; the whole-set run can.

Item 3 is respected: this is a ceiling on memory, not on worker count. No
`maxWorkers`, no `fileParallelism`, no chain split, nothing skipped — 350 of 350
files ran, which is 2 more than the `pool=threads` run discovered.

Item 1 falls out of the same finding: `ListView.test.tsx` is 11/11 in the green
whole-suite run above, so its 9-of-11 redness travelled with the memory
exhaustion, not with file order. Receipts:
`.agents/chain-walk-2026-09-20/memlimit-vm400.{out,rss}.txt`,
`memlimit-control.{out,rss}.txt`, `memlimit-probe-*.txt`, `run-memlimit.sh`,
`run-memlimit-probe.sh`.

Also in this commit: the "memory is not a constraint" line under "Two
corrections to the standing brief" is struck and replaced with the conductor's
16:45 measurement, which this A/B confirms.

## Item 8.1 — the dead `Portal` `ref` in `Popover.tsx`

Removed, with its comment. `@solidjs/web`'s `Portal` takes `{ mount, children }`
only and `portalImpl` never reads `props.ref`; it typechecked because
`JSX.IntrinsicAttributes` declares `ref?: Ref<unknown>` on every component, so
`el.style.display = "contents"` has never run under Solid 2. The replacement
comment says only what is true: Solid 2 splices the children into the mount
between two text markers, so there is no wrapper to style, which is RAC's
`createPortal` shape.

Proof that it was dead is that removing it moves nothing:
`packages/solid-spectrum/test/regression.test.tsx` 50/50 green with **no `-u`**,
and `git status` reports `__snapshots__/` unchanged. Popover suites green too,
45/45 across `solidaria-components` and `solid-spectrum`.

Changeset `.changeset/popover-portal-dead-ref.md`.

## Item 8.2 — the squashed `createToastRegion` header

`createToastRegion.ts:42` was a closing brace plus a whole JSDoc block, its
paragraphs and its fenced `@example`, on one 348-character line (401 with the
brace). Re-expanded; the fragments were printed before and after the split, so
the content is 1:1 with what was there. A scan for the same shape across
`packages/*/src` found no twin: the only other 200-plus-character doc lines are
`s2-internal/style-utils.ts` in solid-spectrum and viviana-ui, and those are
ordinary single-line member docs, not squashed blocks.

**The brief's proof does not exist, and the reason is worth recording.** The
generated reference covers two registers only — `REGISTERS` in
`scripts/extract-api-reference.ts` is viviana-ui and solid-spectrum — so this
solidaria hook has no emitted page, and `grep createToastRegion apps/web/src`
finds nothing. The squash was hurting editor hovers and any future extraction,
not a shipped page. Proof offered instead: fragments preserved, solidaria
typecheck green, `createToastRegion` 10/10.

**A red found on the way, not mine and not this item.** `vp run
guard:api-reference` reports 81 of 84 pages drifted. It is not my toast edit
(solidaria is not extracted) and not the ButtonGroup commit. Regenerating makes
it worse, not better: the checker now renders `JSX.Element` as
`import("../../node_modules/solid-js/types/types").RenderedElement | ...`, i.e.
a machine-specific relative path baked into shipped docs data, where the
committed pages say `Node | JSX.ArrayElement`. I ran `api:extract` once to see
the diff and reverted all of it, including the three
`apps/web/src/routes/docs/components/*.tsx` SEO lines it rewrites (prop counts)
— those belong to the `public-face` worktree. Needs its own ticket: a blocking
release gate is red, and the fix is in how the extractor renders types, not in
re-blessing the output.

Changeset `.changeset/toast-region-doc-block.md`.

## Item 8.3 — the 73 unused bindings, and the flip that did not land

The conductor's count reproduced exactly:
`node_modules/.bin/tsc --noEmit -p packages/solidaria/tsconfig.json
--noUnusedLocals` → 73 lines, 65 TS6133 + 8 TS6196, no other error class. 65 in
solidaria, 8 in solid-stately. After this commit the same command prints
nothing.

Sixty-nine were import specifiers — the codemod residue, `createEffect` and
`onCleanup` left beside `createTrackedEffect` across ~35 files, plus eight
type-only imports in solid-stately. Those were cut mechanically from the tsc
coordinates, not by hand-editing lines by eye.

**Four were not imports, and the brief was right that they need reading.** Each
was read against upstream before it was touched:

- `createColorSlider.ts:315` `const p = getProps()` — the memo's aria-label and
  aria-labelledby come from their own accessors, and upstream's `trackProps`
  merges `groupProps` for the same job. A leftover binding. Deleted.
- `createSlider.ts:108` `isFocusVisible` — upstream `useSlider` has no
  `useFocusRing` at all; ours adds one and uses only `focusProps`. Leftover
  destructure. Narrowed to `const { focusProps }`.
- `createTableRow.ts:57` `isTreeRow` — the same predicate, `s.treeColumn !=
  null`, is written inline at lines 63, 171, 227 and 237, which are the four
  places tree-grid actually branches. A duplicate that was never wired.
  Deleted.
- `createComboBoxState.ts:556` `valueOnFocus` — **this one was a dropped
  write.** Upstream `react-stately/src/combobox/useComboBoxState.ts:578-593`
  keeps `valueOnFocus = useRef([inputValue, displayValue])` and, on blur, calls
  `validation.commitValidation()` when either moved while focused. Our hook has
  no validation object at all: `rg commitValidation packages/solid-stately/src`
  names select, radio group, checkbox group, number field and date field, never
  combobox. So the unused local was the visible end of a missing feature. The
  dead write is gone, with a comment citing the upstream lines, and the wiring
  is **#560**.

**The flip did not land, under the brief's own stop rule.** With the 73 gone I
made the change and measured it: extending `../../tsconfig.json` instead of
`../../tsconfig.typecheck.json` costs six more errors, none of them in the 73.
Five are `noUnusedParameters` — which the root config also turns on and which
the typecheck config also disables — and three of those five are unused *type*
parameters on exported interfaces (`TimeFieldState<T>`,
`DraggableCollectionStateOptions<T>`), where dropping the parameter is a
breaking change to every consumer that writes it. The sixth is not an unused
binding at all: `utils/dom.ts:617` reads `process.env.NODE_ENV`, and the root
config does not carry the typecheck config's `"types": ["node"]`. That is a
question about whether a test-only branch belongs in library source, which is
not this item. Reverted the flip, filed **#561** with the six named.

Checks: `tsc --noEmit -p packages/solidaria/tsconfig.json` clean, `tsc --noEmit
-p tsconfig.typecheck.json` clean, solidaria + solid-stately 131 files / 2703
green, and — since #556 is merged and the ceiling holds — the whole discovered
set, 350 files / 6689 passed / 1 expected fail / 6 skipped in 70s.

Tooling and dead code only; no published behaviour changes, so no changeset.

## Item 8.4 — the `_s2Cleanups` guard

The brief was right that the fix has landed and the guard has not: `rg
_s2Cleanups scripts` was empty, and `Virtualizer.tsx:1055` already returns the
runner.

`scripts/check-s2-cleanups-strand.ts`, wired as `guard:s2-cleanups` next to
`guard:jsx-ref-dead-code` in `package.json` and in
`.github/workflows/certification-gates.yml` (step, outcome env, summary row).

**The rule is a state machine, not a span.** The brief's wording — a `return`
between the first `.push` and the runner — reads as one span per body, and the
real Virtualizer body would fail it: that effect fills and runs the array
*twice*, once in the `info != null` branch (push 1042/1051, runner 1056) and
once after it (push 1075, runner 1078), so the first runner sits inside the
"span" of the second branch's pushes. So the guard walks each body's statements
in source order: a `_s2Cleanups.push(...)` arms it, a `return` whose expression
mentions `_s2Cleanups` is the runner and disarms it, and any other `return`
taken while armed is a stranded cleanup. Returns inside nested functions are
skipped — they are other calls, not a path out of the effect. AST, not braces,
so a `return` inside a string or a comment cannot trip it.

Proof, both directions:

- Green on the tree: `guard:s2-cleanups — PASS: 58 _s2Cleanups bodies, no
  stranded cleanup.` EXIT=0. That is the zero the brief predicted.
- Red on the shape: re-introduced the bare return at `Virtualizer.tsx:1055`,
  ran the guard, EXIT=1 with `Virtualizer.tsx:1055 returns without running
  _s2Cleanups, stranding the cleanup pushed at line 1042`, then reverted and
  re-ran green.
- `scripts/check-s2-cleanups-strand.test.ts`, 5 cases: the stranded shape is
  flagged at the right line, the `if (!node) return` that precedes every push is
  not, a body with one runner per branch is clean, returns in nested functions
  are ignored, and the real `Virtualizer.tsx` reads clean.

Tooling only; no changeset.

### Follow-on to 8.3: one attribution re-attestation, and two reds that are not mine

`node scripts/report-attribution-mappings.mjs --check-headers` records a
content hash per reviewed-local file, so dropping the unused
`getOwnerDocument` import moved `packages/solidaria/src/focus/createFocusRestore.ts`
off its recorded hash. The file is still what the record says it is — a local
Solid helper, no upstream counterpart — so the hash is re-attested, not the
classification.

Two further mismatches are **pre-existing and not mine**:
`packages/solidaria/src/index.ts` and `packages/solidaria/src/utils/index.ts`.
Proved by hashing each at `8db7c298~1`: both match their current content
exactly and neither matches the recorded hash, so they were already red on
`origin/main` before this ticket. `guard:attribution-headers` is therefore red
on main for a reason this ticket did not cause; conductor's to route.

## Item 8.5 — the CSP nonce

Mirrored upstream into `packages/solidaria/src/utils/`, names unchanged:
`getMetaValue.ts` (`meta[name=…], meta[property=…]`, `meta.nonce` over
`meta.content` for `csp-nonce`, then `__webpack_nonce__`) and `getNonce.ts`
(the `WeakMap<Document, string>` cache plus `resetNonceCache()`, exported for
testing only). Both reuse `getOwnerDocument` / `getOwnerWindow` from
`utils/dom.ts`; no new dependency. Neither is re-exported from
`packages/solidaria/src/utils/index.ts` — a mirror is not a public name, and
minting one is owner-steered.

Call site is `createPreventScroll.ts`, inside `preventScrollMobileSafari()`,
before `style.textContent`, exactly as RAC `usePreventScroll.ts:139-142`.

Proof, `packages/solidaria/test/createPreventScroll.test.tsx`, new describe
`createPreventScroll csp nonce`. The branch is gated on `isIOS() && isWebKit()`,
so the three cases fake `navigator.platform` and `navigator.userAgent` the way
`createMove.test.tsx:228-258` does, and take the injected `<style>` by diffing
`document.head`'s styles across the render rather than by position.

- with `<meta name="csp-nonce" content="nonce-from-meta">`: the style carries
  the nonce, and unmount removes it.
- without the meta: `style.nonce` is empty and there is no `nonce` attribute.
- the cache: `getNonce()` still answers after the meta is removed, and answers
  `undefined` once `resetNonceCache()` runs. Asserted on the returned string,
  not on the element — `instanceof ownerWindow.HTMLMetaElement` is
  cross-realm-sensitive and our two pools differ there.

Ran red before green: with the four `getNonce()` lines removed the first case
fails `expected '' to be 'nonce-from-meta'`; restored, 6 passed. jsdom reflects
the `nonce` IDL attribute, which is why the empty case asserts both the
property and the attribute.

Verified: `vp run test packages/solidaria` 169 files, 4232 passed, 6 skipped;
`vp run typecheck` exit 0. Changeset `prevent-scroll-csp-nonce.md`, patch on
`@proyecto-viviana/solidaria`.

## 9 — createId crashed the hydration pass (regression from item 7)

Reproduced first, one file at a time:
`vp test run --config vitest.hydrate.config.ts packages/solid-spectrum/test/TextField.hydrate.test.tsx`
→ `getNextContextId cannot be used under non-hydrating context`, thrown from
`createId` (`ssr/index.tsx:95`) via `createLabels` via `get fieldProps`.

The guard is an owner check (`solid.dev.js:69-74`), and the value it would
return is `getNextChildId(getOwner())` — an id derived from the owner's position
in the tree. So a `createId` reached from a lazy prop getter is wrong twice
over: it can run with no owner at all (the crash), and when an owner does exist
it consumes a child id of whatever owner happened to be current when a consumer
read the prop. Upstream has neither problem because `useLabels` *is* a hook and
its `useId(props.id)` runs once, in the component body.

Took candidate 1 from the brief, hoisting rather than reverting item 7.
`createLabels.ts:50` now reads `props.id ?? createId()`: the id comes from the
caller's hook body, which is where upstream consumes one. Every caller in the
repository already generates it there and passes it — `createLabel.ts:107`
(`id()`), `createDateSegment.ts:446` (`segmentId`), `createGridListSection.ts:40`
(`rowGroupId`, whose comment already relied on the short-circuit item 7
removed), `createComboBox.ts:824` and `:853` (`buttonId`, `listBoxId`). The
fallback is kept for a caller with no id, and the comment says such a caller
must call `createLabels` from a hook body. `createId` itself is untouched, so
item 7 stands and its ordering guarantee now holds where it is meaningful.

Evidence for the choice, not just the crash: with the fix applied but the SSR
artifact still the one item 7's code wrote, the two tests failed with
`Hydration key miss … 60000020002A18000002062` against a server node keyed
`…2063` — one id apart. The lazy call was consuming a hydration id on both
sides; the server's and the client's simply stopped agreeing about when.

Regression coverage, the part item 7 owed — `createId` under a real hydration
pass, not a bare `createRoot`:
`packages/solidaria/test/fixtures/createIdLabels.tsx` renders two `createLabel`
fields in a row, `createIdLabels.ssr.test.tsx` writes
`output/create-id-labels-ssr.html`, and `createIdLabels.hydrate.test.tsx`
hydrates it and asserts both inputs are the same nodes the server sent, with the
same ids and `aria-labelledby`, and the labels still `for` them. Ran red with
the fix reverted **and the SSR artifact regenerated from the same reverted
source**, so the red is the defect and not a stale artifact:
`Hydration key miss for "8"`, server node `<p _hk="6">`, second field unclaimed.

The hang is the crash's: `vp run test:hydrate` now terminates in 13s, 28 files,
99 tests, all passing. Reverted, the same command still hangs — I stopped it at
5m00s with 8 files reporting failures and no exit. So there is no second defect
to ticket, but the shape is worth knowing: a throw inside the hydration walk
wedges the run rather than failing it, which is why 25 files had no verdict.

Verified: `vp run test:ssr` 30 files / 79 tests; `vp run test:hydrate` 28 / 99;
`vp run test:run` 351 files, 6697 passed, 1 expected fail, 6 skipped;
`vp run test:comparison-ssr` 1 / 8; `vp run test:comparison-hydrate` 4 / 175;
`vp run typecheck` exit 0. Changeset
`create-labels-id-from-hook-body.md`, patch on `@proyecto-viviana/solidaria`.

## 10 — build could not emit solidaria's declarations

Reproduced on the old source, in the package the leg stopped at:

```
~/packages/solidaria$ tsc -p tsconfig.build.json
src/utils/dom.ts(617,43): error TS2591: Cannot find name 'process'.
```

`dom.ts:617` now calls `isTestEnv()` from `src/utils/env.ts` — the helper whose
header says it exists to keep `process.env` out of source that browsers and the
declaration build compile, and which had no callers anywhere in `packages/*/src`
until now. The upstream comment and the WebKit source link above the expression
are unchanged; only the fourth conjunct moved. `env.ts` imports nothing, so the
`dom.ts` ↔ `focus.ts` cycle #558 records is not widened.

Green, same command: `tsc -p tsconfig.build.json` exit 0. Then the whole leg,
which had never been walked past its second package: `vp run build` EXIT=0,
1m18s, 39 tasks, ending with `guard:package-artifacts — PASS: 1053 manifest
target(s) exist across 7 public packages; 974 mapped attribution header
reference(s) cover 537 attributed source file(s); all vp pack packages use
vite.config.ts.` No second red of this kind or any other; the only non-error
diagnostic is the pre-existing `[CONFIGURATION_FIELD_CONFLICT] compilerOptions.jsx
… overridden by jsx from transform`. Log: `.agents/chain-walk-2026-09-20/leg-build.out.txt`.

The brief's question — do the `process.env` sites in
`solid-spectrum/src/style/{runtime,style-macro,spectrum-theme}.ts` and their
`viviana-ui` twins survive their own build config? They do, and **not** because
the config differs. All three `tsconfig.build.json` files extend the root
`../../tsconfig.json` and none adds `types: ["node"]`, so all three emit under
the same Node-free lib as solidaria. Those six files survive because not one of
them names `process` bare: each reads it through the same build-safe cast,

```ts
const env: Record<string, string | undefined> =
  (globalThis as typeof globalThis & { process?: … }).process?.env ?? {};
```

and the full green build above compiled all six. So `dom.ts:617` was the only
site of its kind, which is what the brief wanted known before anyone writes a
guard — one example is not a pattern, and no guard is added here.

Left as #563 rather than fixed in this item: those six casts are six copies of
what `env.ts` already does once, and `env.ts` is solidaria-private. That is the
"never the third copy" rule with five extra copies, and it is the shape a guard
should be written against once the helper is shared.

Verified: `vp run build` exit 0 end to end; `vp run test:run` 351 files, 6697
passed, 1 expected fail, 6 skipped; `vp run typecheck` exit 0. Changeset
`open-link-is-test-env.md`, patch on `@proyecto-viviana/solidaria`.
