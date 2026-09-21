---
id: 570
type: task
title: "Ten baselined-identical paths diverged between solid-spectrum and viviana-ui, so guard:layer-boundary is red"
created: 2026-09-20
parent: 544
status: next
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
