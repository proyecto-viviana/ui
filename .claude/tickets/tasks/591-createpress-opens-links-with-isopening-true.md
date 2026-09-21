---
id: 591
type: task
title: "createPress opens links with isOpening true, so a collection link item navigates twice on Space"
created: 2026-09-21
parent: 544
status: merged
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "opened from the 2026-09-21 round-1 audit, receipt `.agents/audit-2026-09-21/round-1-results.md`. Three findings on one call path: `solidaria-src/openlink-setopening` (high, confirmed), `555-a/openlink-onclick-reentry` (low, harm refuted), `solidaria-src/linkclicked-dedup` (low, confirmed). `createPress.ts:799` calls `openLink(target, e)` and takes `dom.ts`'s new `setOpening = true` default; upstream `usePress.mjs:320` passes `false` there for exactly one reason - `createSelectableItem.ts:499` reads `if (!openLink.isOpening) e.preventDefault()`, so with the flag set the synthetic click's default action stops being suppressed. `e6384f37` made this load-bearing: `openLink` now dispatches a click the item's own `onClick` sees, so a collection link item navigates natively and again through `onSelect`. The skeptic reproduced both sides and confirmed no commit in `f13fd341..4acbc9e4` touches `createPress.ts`",
    }
  - {
      state: merged,
      at: 2026-09-21,
      note: "all three scope items landed in one commit, `#591: ...`, receipt `.agents/591-press-link-open-2026-09-21.md`, base `43b5aabf`. Upstream read before ours, in the installed pin `apps/comparison/node_modules/react-aria` 3.52.0: `usePress.mjs:102` `const LINK_CLICKED = Symbol('linkClicked')`, `:279` `if (e && e.button === 0 && !state.isTriggeringEvent && !openLink.isOpening)`, `:316-320` the keyup branch that marks the event and then calls `openLink(state.target, e, false)`; `openLink.mjs:53` the `setOpening = true` default and `:80-86` the flag bracketed around the dispatch; `useSelectableItem.mjs:254` `if (!openLink.isOpening) e.preventDefault()`. Only `createPress` was out of step: our `openLink` already carries `setOpening` faithfully (`dom.ts:587-590,637-643`) and the item guard already reads it (`createSelectableItem.ts:499`), so both were left alone and the whole fix is three edits in `packages/solidaria/src/interactions/createPress.ts`. Scope 1, `openLink(target, e, false)` at `:810`. Scope 2, `!openLink.isOpening` added to the `onClick` left-click guard at `:835`. Scope 3, the de-duplication moved off `linkClickedSet`, a module `WeakSet` keyed on the element and cleared from a `setTimeout(…, 0)`, onto `LINK_CLICKED` marked on the keyup event itself (`:130-131,801,805`). DISAGREEMENT WITH THE BRIEF, recorded and not followed: the brief says the skeptic refuted observable harm for items 1 AND 2 and that the commit must not claim a bug. That holds for item 2 and not for item 1. Pre-fix, the new navigation-counting test is red - `vp test run packages/solidaria/test/createSelectableItem.test.tsx --maxWorkers=2` is `1 failed | 17 passed (18)` EXIT=1, `expected [ MouseEvent, MouseEvent ] to have a length of 1 but got 2`: Space on a role-overridden `<a href>` in a `linkBehavior: 'selection'` collection dispatches two clicks and NEITHER is prevented, because the item's `onSelect` opens the link with `isOpening` true and then the press path opens it again with `isOpening` true, so the guard at `createSelectableItem.ts:499` cancels neither. Post-fix, 18 passed EXIT=0: two clicks are still dispatched and exactly one survives `defaultPrevented`. So the commit says 'fixes' of item 1 and 'keeps the two halves of one upstream mechanism in step' of item 2, which is the brief's own sentence applied where the evidence puts it. Attribution by mutation, each mutation applied to the fixed tree alone and restored from a scratchpad copy: dropping ONLY the `, false` gives `1 failed | 109 passed (110)` EXIT=1 and fails only the navigation test, so item 1 owns that failure; restoring ONLY the element-plus-timeout `WeakSet` gives `1 failed | 109 passed (110)` EXIT=1 and fails only `opens the link again on a second Space activation in the same macrotask`, so item 3 owns that one; dropping ONLY the `onClick` `!openLink.isOpening` guard leaves the three files at 114 passed EXIT=0, which is the skeptic's refutation reproduced - item 2 is parity, not behaviour, and no test in this repo can tell it apart. Scope 3's own red-to-green, run against the pre-fix source: `vp test run packages/solidaria/test/createPress.test.tsx --maxWorkers=2` is `1 failed | 91 passed (92)` EXIT=1, `expected [ MouseEvent ] to have a length of 2 but got 1` - with the mark on the element and the `setTimeout` still queued, a second, legitimate Space activation of the same link opened nothing; the suite runs fake timers, which is exactly the shape in which that timeout never fires. Post-fix 92 passed EXIT=0. Two tests were added there, the second, `opens the link once per keyup when two press instances share the element`, holding the property the mark exists for (`usePress.mjs:317-318`) so the fix cannot be read as deleting the de-duplication. Exit codes, all run in this seat this session: the three touched files together 3 files / 114 passed EXIT=0; `vp test run packages/solidaria/test --maxWorkers=2` 93 files / 1783 passed EXIT=0; `packages/solidaria-components/test` 76 files / 2457 passed | 6 skipped EXIT=0; `packages/solid-stately/test packages/viviana-ui/test` 73 files / 1152 passed EXIT=0; `packages/solid-spectrum/test` 85 files / 1132 passed | 1 expected fail EXIT=0; `vp run guard:layer-boundary` EXIT=0, 524 identical / 84 diverged / 0 new forks / 0 unbaselined - `packages/solidaria` is not a dual path, so nothing had to be carried to a twin; `vp run check` EXIT=0. `@proyecto-viviana/solidaria` is the only published package whose source changed, so one changeset, `.changeset/press-link-open-parity.md`, patch. `merged` and not `verified`: this seat does not push, so no CI run backs any of these counts",
    }
  - {
      state: merged,
      at: 2026-09-21,
      note: "review round on the landed work; one problem raised and it is real, so it is fixed rather than argued. The `, false` at `createPress.ts:810` sits on the shared keyup link path, so it changes every `linkBehavior`, not only the `'selection'` one the Done-when and the changeset name. Reproduced in this seat with a probe that counts clicks surviving `defaultPrevented` on a capture-phase document listener, run against `git show 43b5aabf:packages/solidaria/src/interactions/createPress.ts` restored over the fixed file and then restored back from a scratchpad copy - pre-fix `{override+Space: 1/1, action+Space: 1/1, selection+Space: 2/2, override+Enter: 1/1, action+Enter: 1/1, selection+Enter: 1/1}` as total/opened, at HEAD `{override+Space: 1/0, action+Space: 1/0, selection+Space: 2/1}` with the Enter rows unchanged. So Space on a role-overridden `<a href>` stopped navigating entirely under `'override'` and `'action'`, and `'override'` is what `createListBox.ts:164-166` defaults to whenever `selectionBehavior` is `'toggle'`, which is the configuration most consumers get. The new behaviour is upstream's, read in the installed pin before it was pinned: `useSelectableItem.mjs:45` returns early from `onSelect` for `'override'`, `:307-311` is the only `isActionKey` gate and `:311-313` defines it as Enter alone, `:104` excludes `isLinkOverride` from `allowsSelection`, and `usePress.mjs:320` is the `false` itself - so upstream splits the two keys exactly this way and nothing here diverges. What was wrong was the disclosure and the coverage, both fixed in commit `#591: fix what its review found`: the changeset gains a paragraph naming `'override'` and `'action'` and telling a consumer to bind Enter, and `createSelectableItem.test.tsx` gains two cases that pin the split - `'override'` Space `{total: 1, opened: 0, selected: false}` against Enter `{1, 1, false}`, `'action'` Space `{1, 0, selected: true}` against Enter `{1, 1, false}`. The `selected` field is new on all three cases and tells 'the key did nothing' from 'the key selected'; it also shows the pre-fix `'action'` Space both selected and navigated. The listener plumbing moved into one `activate()` helper rather than a third copy, and `renderLinkItem` now returns its state. Red-to-green with the pre-fix `createPress.ts` and the final test file: `vp test run packages/solidaria/test/createSelectableItem.test.tsx --maxWorkers=2` is `3 failed | 17 passed (20)` EXIT=1, failing all three link-activation cases; restored, `20 passed` EXIT=0. Other exit codes this round, all run in this seat: `vp test run packages/solidaria/test --maxWorkers=2` 93 files / 1785 passed EXIT=0; `vp run guard:layer-boundary` EXIT=0, 524 identical / 84 diverged / 0 new forks / 0 unbaselined; `vp run check` EXIT=0; `vp run docs:generate` then `vp run docs:check` EXIT=0. No source changed this round, so the existing patch changeset still covers the only published package touched, `@proyecto-viviana/solidaria`. #544's S2-a bullet carried the same partial claim and is corrected in place with a dated note of its own. No residue and no new ticket: the finding is entirely inside this ticket's own call path. Still `merged` and not `verified`, this seat does not push",
    }
---

## Scope

1. Pass `false` as the third argument at
   `packages/solidaria/src/interactions/createPress.ts:799`, as
   `react-aria` 3.52.0 does.
2. Carry upstream's `!openLink.isOpening` guard into `createPress.onClick`, and
   the `false` third argument on the key path. The skeptic refuted the harm —
   net observable behaviour matches today — so this is not a defect fix; it is
   keeping the two halves of one upstream mechanism in step, so the next reader
   does not have to re-derive why one half is missing. Say that in the commit
   rather than claiming a bug.
3. Key the link-open de-duplication on the event rather than on the element
   plus a timeout (`solidaria-src/linkclicked-dedup`). An element-and-timeout
   key drops a legitimate second activation of the same link inside the window
   and keeps a stale one across two different events.

## Done when

Space on a role-overridden `<a href>` inside a `linkBehavior: "selection"`
collection navigates exactly once, proved by a test that counts navigations
rather than asserting a handler ran. `createPress`'s link path and
`useSelectableItem`'s guard read the same way as upstream at the pin.

Added by the review round, because the fix is on the shared keyup path and so
reaches every `linkBehavior`: under `"override"` and `"action"` the same Space
navigates zero times and Enter navigates once, as upstream does. Each of those
is pinned by its own case, and the changeset says so.

## Proof

The failing-then-passing test, run with the defect reintroduced and again with
it removed, counts both ways in the commit.

## Relationship

Child of #544, stage S2-a, the first of the source defects because it is the
only confirmed one that changes what a user gets. Residue of #555 item 8 and of
`e6384f37`. #592 is the same four call sites seen from the router's side and is
deliberately separate, because that one is a pre-existing parity gap and this
one is not.
