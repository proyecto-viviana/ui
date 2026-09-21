# #591 — the two halves of `openLink`, and the mark that outlived its event

Written 2026-09-21 from base `43b5aabf` in `ui` on `main`. Every count and exit
code below came from a command run in this seat this session; nothing is quoted
from a prior session, a log, or memory. This seat does not push, so no CI run
backs any of it.

## 1. Upstream, read before ours

The installed pin, `apps/comparison/node_modules/react-aria` 3.52.0, not the
docs and not memory. Three files carry one mechanism.

- `dist/private/utils/openLink.mjs:53` — `openLink(target, modifiers, setOpening = true)`.
- `:80-86` — the flag is bracketed around the dispatch and reset after it:
  `openLink.isOpening = setOpening` … `target.dispatchEvent(event)` …
  `openLink.isOpening = false`, with `false` as the module-level initial value.
- `dist/private/selection/useSelectableItem.mjs:254` — the item's own click
  handler, installed only for link items:
  `if (!openLink.isOpening) e.preventDefault()`.
- `dist/private/interactions/usePress.mjs:316-320` — the keyup link branch:

```js
if (e.key !== 'Enter' && isHTMLAnchorLink(state.target) && … && !e[LINK_CLICKED]) {
    // Store a hidden property on the event so we only trigger link click once,
    // even if there are multiple usePress instances attached to the element.
    e[LINK_CLICKED] = true;
    openLink(state.target, e, false);
}
```

- `:102` — `const LINK_CLICKED = Symbol('linkClicked')`, the key of that mark.
- `:279` — the click handler's own re-entry guard:
  `if (e && e.button === 0 && !state.isTriggeringEvent && !openLink.isOpening)`.

The `false` at `:320` and the guard at `useSelectableItem.mjs:254` are one
mechanism with two halves. The press path's synthetic click is not the one the
consumer asked for, so it leaves `isOpening` down and the item cancels it; the
item's own `openLink` call takes the `true` default, so the item does not cancel
itself. Either half alone is wrong in a different direction.

## 2. Ours, before the fix

Only `createPress` was out of step. `packages/solidaria/src/utils/dom.ts:587-590`
already declares `setOpening = true` and `:637-643` already brackets the flag
exactly as upstream does, and `packages/solidaria/src/selection/createSelectableItem.ts:499`
already reads `if (!(openLink as {isOpening?: boolean}).isOpening)`. Both were
left untouched. Three edits in `packages/solidaria/src/interactions/createPress.ts`
are the whole fix.

Pre-fix, `createPress` called `openLink(target, e)` on the keyup link path and
took the `true` default. So on Space over a role-overridden `<a href>` inside a
`linkBehavior: "selection"` collection:

1. press start → the item's `onSelect` → `openLink(el, e)`, `isOpening` true,
   the item's guard does not prevent — navigation one;
2. keyup → `createPress`'s link branch → `openLink(target, e)`, `isOpening`
   true again, the guard does not prevent that one either — navigation two.

## 3. The test that counts navigations, not handlers

`packages/solidaria/test/createSelectableItem.test.tsx` gains `renderLinkItem`
(a real `<a href>` with `role="option"` and the item props) and one case,
`navigates exactly once when Space activates a role-overridden link`.

It counts with a capture-phase `click` listener on `document` — capture runs
before the element's own handlers, so it sees every click even though
`createPress.onClick` later calls `stopPropagation` — and filters on
`defaultPrevented` after the synchronous sequence completes. That is a count of
navigations and not of handler calls: a click the item's guard cancels is one
the browser never follows. `triggerSyntheticClick` cannot pollute it, because
it invokes `props.onClick` with a constructed event and dispatches nothing, so
every DOM click on the anchor came from `openLink`.

```
pre-fix   vp test run packages/solidaria/test/createSelectableItem.test.tsx --maxWorkers=2
          1 failed | 17 passed (18)   EXIT=1
          expected [ MouseEvent, MouseEvent ] to have a length of 1 but got 2
post-fix  18 passed (18)              EXIT=0
```

Two clicks are dispatched both ways. The fix is not that one disappears; it is
that exactly one survives `defaultPrevented`.

## 4. Scope 3 — the mark that outlived its event

Pre-fix the de-duplication was a module `WeakSet` keyed on the **element** and
cleared from a `setTimeout(…, 0)`. That is time-scoped where upstream is
event-scoped, and it fails in both directions: a legitimate second activation
of the same link inside the window opens nothing, and the mark can survive into
a different event. The `createPress` suite runs fake timers
(`createPress.test.tsx:92-95`), which is exactly the shape in which that
timeout never fires at all.

Two cases were added to `describe("keyboard edge cases")`:

- `opens the link again on a second Space activation in the same macrotask` —
  the red one. Pre-fix
  `vp test run packages/solidaria/test/createPress.test.tsx --maxWorkers=2` is
  `1 failed | 91 passed (92)` EXIT=1,
  `expected [ MouseEvent ] to have a length of 2 but got 1`. Post-fix 92 passed
  EXIT=0.
- `opens the link once per keyup when two press instances share the element` —
  the property the mark exists for (`usePress.mjs:317-318`), two `createPress`
  instances merged onto one anchor with solidaria's `mergeProps`, one click.
  Without it the fix reads as deleting the de-duplication.

The mark is now `LINK_CLICKED` on the keyup event
(`createPress.ts:130-131,801,805`), so it dies with the event.

## 5. Attribution by mutation

Three mutations, each applied to the fixed tree alone and each restored from a
scratchpad copy before the next.

| mutation | result | isolates |
| --- | --- | --- |
| drop only the `, false` third argument | `1 failed \| 109 passed (110)` EXIT=1 | only the navigation test |
| restore only the element-plus-timeout `WeakSet` | `1 failed \| 109 passed (110)` EXIT=1 | only the second-activation test |
| drop only the `onClick` `!openLink.isOpening` guard | 3 files / 114 passed EXIT=0 | nothing |

## 6. Disagreement with the brief, recorded and not followed

The brief says the skeptic refuted observable harm for scope items 1 **and** 2,
and that the commit must therefore say "keeps the two halves of one upstream
mechanism in step" rather than claiming a bug.

That holds for item 2 and not for item 1. Item 2's mutation leaves every test
green, so the click re-entry guard is parity with no test in this repo that can
tell it apart — the skeptic reproduced. Item 1's mutation is red on its own
test, at two navigations where the fix gives one, which is the user-visible
defect the ticket's own `## Done when` names. So the commit says "fixes" of
item 1 and the brief's sentence of item 2, which is that sentence applied where
the evidence puts it. The ticket's Scope was followed as written either way;
only the framing moved.

## 7. Exit codes

All run in this seat, this session, one heavy command at a time.

| command | result |
| --- | --- |
| `vp test run` over the three touched files `--maxWorkers=2` | 3 files / 114 passed, EXIT=0 |
| `vp test run packages/solidaria/test --maxWorkers=2` | 93 files / 1783 passed, EXIT=0 |
| `vp test run packages/solidaria-components/test --maxWorkers=2` | 76 files / 2457 passed, 6 skipped, EXIT=0 |
| `vp test run packages/solid-stately/test packages/viviana-ui/test --maxWorkers=2` | 73 files / 1152 passed, EXIT=0 |
| `vp test run packages/solid-spectrum/test --maxWorkers=2` | 85 files / 1132 passed, 1 expected fail, EXIT=0 |
| `vp run guard:layer-boundary` | 524 identical / 84 diverged / 0 new forks / 0 unbaselined, EXIT=0 |
| `vp run check` | 4436 formatted, 3192 lint-clean, `tsc --noEmit` clean, EXIT=0 |

`packages/solidaria` is not a dual path, so no bytes had to be carried to a
twin; the guard was run anyway because the rule is per commit, not per package.

## 8. Changeset and residue

`@proyecto-viviana/solidaria` is the only published package whose source
changed, so one changeset, `.changeset/press-link-open-parity.md`, patch.

Not fixed here, and not this ticket's: `createSelectableItem.ts:286,312` call
`openLink` directly instead of going through a router, which is #592 — a
pre-existing parity gap seen from the router's side, deliberately separate.
Nothing in this commit makes it better or worse.
