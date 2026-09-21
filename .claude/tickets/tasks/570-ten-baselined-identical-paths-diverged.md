---
id: 570
type: task
title: "Ten baselined-identical paths diverged between solid-spectrum and viviana-ui, so guard:layer-boundary is red"
created: 2026-09-20
parent: 544
status: merged
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "found by the conductor's local ladder walk of 2026-09-20 evening. `vp run guard:layer-boundary` EXIT=1 in 1s: `FAIL: 10 baselined-identical path(s) now diverge - new Spectrum forks into viviana-ui`. Step 160 of certification-gates.yml. Three of the ten were sampled here and are deliberate viviana-ui extensions, not drift, so this is a classification job and not a re-sync job. Evidence `.agents/chain-walk-2026-09-20/ladder-layer-boundary.out.txt`",
    }
  - {
      state: next,
      at: 2026-09-20,
      note: "handed to the close-gates writer after #569 merged, as the earliest remaining red: step 160, where the ladder now stops. No brief file - the ticket already names the ten, the three sampled classifications and the third-category rule. Two things it does not say, both found while handing it over. First, `--write-baseline` (line 33) re-blesses the whole inventory at once and the entries are bare strings - `identical` is a list of 533 path strings, `diverged` a list of 76 - so there is nowhere in the file to record *why* a path moved, and the ticket's instruction to `say in the baseline entry what diverged` cannot be followed as written. Moving the ten from `identical` to `diverged` is the mechanical answer; where the reason lives is the judgement, and #573 filed the same day is what happens when a ratchet moves with no recorded reason - prefer a durable home over the ticket alone, and do not reach for `--write-baseline` as the fix, since it would also silently absorb the two unrelated notes and anything else that has moved since 2026-08-07. Second, the baseline is not attribution-reviewed, so no re-pin is owed; but re-syncing a path edits published source and does owe a changeset, the way #569 did. Ten diffs is a real read - `notificationbadge` at 52 lines, `skeleton` and `ContextualHelpTrigger` at 37 - and the answer per path is worth more than speed",
    }
  - {
      state: in-progress,
      at: 2026-09-20,
      note: "all ten diffs read, and the history of both copies with them, which is what told them apart. Nine have a viviana-ui-only commit and no spectrum counterpart - `c7cc7bad`, `8a527ddf`, `866a47fe`, `358f3232`, `c2832595`, `f9116a92`, `fa98aadf`, `c66f938a`, `a01c40dd` - and none touches behaviour: two are additive re-exports, five are style-macro or `css()` values, breadcrumbs swaps a presentational glyph, `style/index.ts` narrows a union. None is the third category. The tenth is the reverse and the read is what found it: `color/ColorSwatchPicker.tsx` carries the *spectrum-only* `95ce8ad3`, so viviana-ui still passes `size: size(), rounding: rounding()` where spectrum passes getters - the live reactivity fix never crossed, a one-sided edit and a real bug in a published package. Re-synced byte-for-byte with a `@proyecto-viviana/ui` patch changeset. Notes absorbed: `switch/index.tsx` back to identical, `test-utils/index.ts` dropped. Counts restated by hand to 608/524/84; `--write-baseline` never run as the fix. The reason lives in the baseline as a `reasons` map keyed by path, and the tool now refuses to move the ratchet without one: `--write-baseline` exits 1 on an unexplained identical\u2192diverged move (proved on `Button.ts`), and the guard exits 1 on a reason whose path is not diverged (proved on `switch/index.tsx`). EXIT=0, `tsc --noEmit` EXIT=0, `guard:publish-drift` EXIT=0. Evidence `.agents/close-gates-2026-09-20.log.md`",
    }
  - {
      state: merged,
      at: 2026-09-20,
      note: "reviewed by re-running and by testing the new refusal rather than reading it. `vp run guard:layer-boundary` EXIT=0: 0 new forks, 0 lifted, 0 unbaselined, frozen backlog 524 identical + 84 diverged. The one behaviour change checks out and is the find of the ticket - `git show --stat 95ce8ad3` touched `packages/solid-spectrum/src/color/ColorSwatchPicker.tsx` and its test and nothing else, so the live size and rounding fix never reached the viviana-ui copy, which went on freezing both at creation; `diff -q` on the two copies now reports them identical, and the re-sync carries a changeset. The refusal was proved, not accepted: appending one comment line to `packages/viviana-ui/src/ActionButton.ts` and running `--write-baseline` exits 1 with `Refusing to re-bless 1 path(s) that moved identical -> diverged with no recorded reason`, and the probe was reverted. That mechanism is more than the ticket asked for - it was left open as a judgement and came back as a rule the tool enforces, with #573 cited in the comment that explains why. Step 160 is green and the walk moves to step 169, #571",
    }
---

## Scope

`scripts/layer-boundary-baseline.json` records which duplicated paths are
byte-identical between `packages/solid-spectrum/src` and
`packages/viviana-ui/src`. Identical is the tolerable state: it means viviana-ui
has not forked S2 behaviour. Ten are no longer identical:

| path                              | changed lines | whitespace-only |
| --------------------------------- | ------------: | --------------- |
| `breadcrumbs/index.tsx`           |             6 | no              |
| `color/ColorSwatchPicker.tsx`     |             8 | no              |
| `image/index.tsx`                 |            33 | no              |
| `menu/ContextualHelpTrigger.tsx`  |            37 | no              |
| `notificationbadge/index.tsx`     |            52 | no              |
| `provider/index.tsx`              |             2 | no              |
| `skeleton/index.tsx`              |            37 | no              |
| `style/index.ts`                  |             1 | no              |
| `textfield/s2-textarea-styles.ts` |             3 | no              |
| `view/index.tsx`                  |             2 | no              |

The same run reports two baseline facts that are not failures and should be
absorbed in the same pass: `switch/index.tsx` re-synced to identical, and
`test-utils/index.ts` is no longer shared at all (progress against ticket #1).

## What the sample says about the cause

Three were read in full before this was filed, and none is drift:

- `provider/index.tsx`, +3: viviana-ui also exports `createThemeTransition`.
- `view/index.tsx`, +3: viviana-ui also exports `SceneBackdrop`.
- `style/index.ts`, −1: viviana-ui dropped `"orange"` from a status union.

Those are the Glasselated register being itself. So the headline — "new Spectrum
forks into viviana-ui" — is right about the shape and can be wrong about the
intent, and the guard cannot tell the difference. Do not assume the other seven
are the same; `notificationbadge` at 52 lines and `skeleton` and
`ContextualHelpTrigger` at 37 are large enough to hide a one-sided port edit,
and `163f4377`, `acb75aa4` and `92ddc52b` all touched both copies.

## Work

Classify each of the ten, reading the diff, not the filename:

- **Deliberate viviana-ui extension or re-skin** — the register composing or
  theming, which is what `AGENTS.md` says styled packages may do. Re-baseline
  the path as no longer shared and say in the baseline entry what diverged.
- **One-sided edit** — the same change landed on one copy only. Re-sync it, and
  say which commit left it behind.

Then absorb the two notes above so the baseline states the tree.

If a path turns out to be a third thing — viviana-ui reimplementing S2 behaviour
rather than wrapping it — that is ticket #1's rule and a finding, not a
re-baseline. Leave it red and say so.

## Done when

`vp run guard:layer-boundary` exits 0, and every one of the ten has a recorded
classification with the diff that justifies it.

## Relationship

Child of #544, and stage 2 of `.agents/CONDUCTOR-RELEASE-PATH-2026-09-20.md`.
Bears on ticket #1, which owns the wrap-compose-theme rule. Sibling of #559,
#569 and #571.

## The classification

Nine deliberate, one one-sided. Each reason is recorded in
`scripts/layer-boundary-baseline.json` under `reasons`, with the commit that
moved it; the table with the read is in `.agents/close-gates-2026-09-20.log.md`
and the diffs in `.agents/layer-boundary-570/diffs.txt`.

`color/ColorSwatchPicker.tsx` was not a fork at all. `95ce8ad3` landed the live
size/rounding fix on solid-spectrum only, so viviana-ui froze both values at
creation. Re-synced, with a changeset. Its test is still solid-spectrum's alone —
porting it is ticket #1's dual-copy problem, not this ticket's.

## Where the reason lives

In the baseline, keyed by path, because that is where a reader who just failed
the guard already is. Not the commit message: #573 is that experiment's result.
Not the ticket: tickets close. And recording is backed by refusal —
`--write-baseline` will not re-bless an unexplained identical→diverged move, and
a reason naming a path that is no longer diverged fails the guard, so a reason
cannot outlive its fork. Paths frozen before 2026-09-20 are grandfathered and
carry none.
