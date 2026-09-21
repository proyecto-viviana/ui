---
id: 579
type: task
title: "The upstream-test-parity oracle attributes every fact by filename, so one component's vocabulary is filed under another's name"
created: 2026-09-20
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "found by the close-gates writer while classifying #573's thirty added facts, and filed here rather than widened inside #573 or folded into #577 - it is a defect in what the guard *measures*, not a record that stopped describing the tree, so it is a different family. The conductor verified the load-bearing case rather than reading it: `packages/viviana-ui/test/Switch.test.tsx` imports only `TabSwitch` and `SegmentedControl` and renders `<Switch` zero times (`grep -c '<Switch[ />]'` → 0), yet every `getByRole` in it is filed under `switch` and paired against upstream's `Switch` tests. Nine of #573's twelve added ROLE rows are this shape. Not blocking the RC: #573 closes its gate through `--allow-growth 573`, which records the thirty facts against a ticket that explains them",
    }
  - {
      state: open,
      at: 2026-09-21,
      note: "2026-09-21 round-1 audit, receipt `.agents/audit-2026-09-21/round-1-results.md`. This ticket is now #597's blocker in fact rather than in spirit. #597 owns `ratchets/parity-rebless-outruns-receipt`: `2b444a89` grew the baseline by 30 facts claiming all thirty were classified, and its own receipt `34064bae` had concluded the opposite - 14 were classified, 7 literally and 7 by the `role|form` group, and 16 were never examined. Nine of the thirty are the mis-pairing this ticket names, so fixing the attribution rule here is what makes #597's re-measurement mean anything; absorbing them instead widened the allowlist around a known-bogus pair. The `wrong-shape bug` line in `2b444a89`'s message is about roles only, `check-upstream-test-parity.ts:25`.",
    }
  - {
      state: open,
      at: 2026-09-21,
      note: "placed at stage S3-a of #544's path, with #597 as S3-b. The path had named #597 alone and called this ticket its prerequisite in fact without scheduling it, so a reader working the stages in order met an unscheduled blocker at S3. No new measurement; the ordering is the one both tickets already argue for.",
    }
---

## Scope

`scripts/check-upstream-test-parity.ts` builds each component's ARIA vocabulary
by regex over a whole test file (`RX.role`, `:336-339`) and decides which
component that file is about from its **basename alone**:

```ts
/** Strip ext + .test/.spec/.browser/.ssr/.hydrate qualifiers + Aria* prefix, then alias. */
function canon(basename: string): string {           // :409-418
  ...
  return ALIASES[n] ?? n;
}
```

Nothing reads the imports, the `describe` title, or what is rendered. So a test
file's vocabulary is everything it touches, attributed to whatever its name
says — fixtures, wrappers, composed children and all.

The maintainers already knew this is lossy and patched one instance by hand.
The comment above `ALIASES` (`:118-120`) folds ToggleButtonGroup into
ToggleButton because "Without (2) the oracle false-flags correct behavior as a
we-only role". That is this defect, solved once, for one pair, by a list.

## The case that proves it

`packages/viviana-ui/test/Switch.test.tsx`:

```
import { TabSwitch } from "../src/switch";
import { SegmentedControl } from "../src/segmentedcontrol";
```

It renders no `Switch`. It is a segmented control, and segmented controls
render radios. The oracle files its whole vocabulary under `switch` — which is
where `switch|aria|aria-checked` came from — and then pairs that against
upstream's `Switch` tests, which are about something else entirely.

Nine of the twelve ROLE rows #573 classified are the same shape: a role
belonging to a fixture element or a composed child. `tabs|aria|aria-hidden`
traces to `<span aria-hidden="true">icon</span>` scaffolding at
`solid-spectrum/test/Tabs.test.tsx:495`.

## Why it is worth fixing rather than tolerating

The guard's headline numbers are all computed on this attribution: 145 of ours
with no upstream pair, 16 upstream with no pair of ours, 37 ranked suspects, 18
of them ROLE. An unknown fraction of each is artifact. #573 had to spend a shift
establishing, fact by fact, that none of thirty was a real mis-assertion — work
the guard could have made unnecessary.

And it fails in the direction that costs most: it manufactures suspects, so the
signal it exists to carry arrives inside noise nobody can grade without reading
every test file by hand.

## Work

The writer's own sentence is the cheap half and should be done first:

> it knows which file each fact came from and does not carry it into the fact,
> so `switch|aria|aria-checked` cannot say that its source file never renders a
> Switch. A fact that carried its file would make a mis-pairing visible in the
> output instead of in a reader's head.

1. **Carry the source file into the fact.** Reporting only; the baseline keys
   need not change if that is disruptive, but the printed suspect must name the
   file it came from. This alone turns a shift of classification into a glance.
2. **Then attribute by what the test renders, not by its name.** The imports are
   already parseable and are the honest answer — the file above declares its two
   subjects on lines 3 and 4. Expect the counts to move; that is the point, and
   whatever they move to goes through `--allow-growth 579`, not
   `--write-baseline`.
3. Say what happens to `ALIASES` once attribution is real. Some of it is
   genuine cross-suite folding and should stay; some of it is this bug with a
   manual workaround and should go. Name which is which rather than deleting the
   list.

## Done when

A suspect names the file it came from, `switch|aria|aria-checked` no longer
appears under `switch` (or appears with a note saying which file produced it),
and the baseline moved through `--allow-growth 579` with a commit message that
says how many facts the re-attribution removed and how many it kept.

## Relationship

Child of #544. Comes out of #573, which is the evidence and should be read
first — its Work section's bucket 3 is nine instances of this defect, already
classified one by one.

Not the same family as #577, deliberately. #577 is about records that stop
describing the tree; this is a record that describes the wrong thing from the
start and always did. Both were found the same week and both cost a red gate for
no defect, which is the only thing they share.

Bears on #568: this guard is one of the 28 blocking gates with no leg in
`ci:release-readiness`, so it runs only inside `certification-gates.yml`, and
had longer to accumulate artifact than anyone was watching.
