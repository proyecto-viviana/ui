---
id: 572
type: task
title: "guard:jsx-ref-dead-code asserts a setAttribute that Dialog.tsx no longer has"
created: 2026-09-20
parent: 544
status: next
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "found by the conductor walking the post-build half of the ladder on 2026-09-20 evening - the half nothing had ever run, because it needs `vp run build` first and `ci:release-readiness` does not reach it. `vp run guard:jsx-ref-dead-code` EXIT=1: `AssertionError: packages/solidaria-components/src/Dialog.tsx package transform dropped /setAttribute\\([\"']aria-labelledby[\"'],\\s*trigger\\.id\\)/`. The marker is stale, not the build: `grep -c setAttribute packages/solidaria-components/src/Dialog.tsx` is 0, and `git log -S` pins the removal to `70a8d478` '#555: resolve the dialog's title and content ids as slots'. Step 219 of certification-gates.yml. Evidence `.agents/chain-walk-2026-09-20/ladder-jsx-ref-dead-code.out.txt`",
    }
  - {
      state: next,
      at: 2026-09-20,
      note: "handed to the close-gates writer after #571 merged (`2ca4c94d`), as the earliest remaining red. The ladder now walks to step 219: 121, 160, 169, 185 and 193 are green. Three things found while handing it over. First, this is the third ratchet in two days that stopped tracking the tree, after #571's two - and unlike those, this one is the residue of a commit this seat reviewed, `70a8d478`. So the pattern is not 'old baselines rot'; it is 'a refactor moves the code and leaves the record', and it is worth one line in the log saying whether the guard could have caught its own staleness. Second, the ticket's default answer - retire the marker, because a direct test at Dialog.test.tsx:339 already asserts the outcome - is the 'never the third copy' rule and this seat endorses it; do not re-point the regex unless you can show the build dropping a declarative binding that the test survives, and if you can show that, it is a bigger finding than this ticket. Third, this gate needs `vp run build` first, so it is the heavy one: run `free -m`, one command at a time, output to a file",
    }
---

## Scope

`scripts/check-jsx-ref-dead-code.ts` builds each package and asserts that the
transform did not drop imperative DOM work that a JSX-ref rewrite could
plausibly eat. It carries a hand-written list, `REQUIRED_BEHAVIOR` at line 58,
and one of its Dialog markers no longer matches anything:

```ts
{
  file: "packages/solidaria-components/src/Dialog.tsx",
  markers: [
    /setAttribute\(["']aria-labelledby["'],\s*trigger\.id\)/,   // <- matches nothing
    /closest\([^)]*alertdialog/,                                 // <- still live, :361
  ],
}
```

The assertion at line 234 then reports `package transform dropped …`, which
names the build as the culprit. The build is innocent. `Dialog.tsx` contains
**zero** `setAttribute` calls; the labelling became declarative in `70a8d478`
(#555):

- `:295` `aria-labelledby={ariaLabelledBy()}`
- `:254-260` the fallback the removed line used to write by hand —
  `if (p["aria-labelledby"]) return …; return triggerContext?.triggerRef()?.id ?? triggerContext?.triggerId;`

So the guard is red on a behaviour that is present, expressed a better way.

## Work

Decide which of two things this marker is, and say why in the commit.

The marker was a proxy for "the trigger's id still reaches the dialog's
`aria-labelledby`". That behaviour now has a **direct** test —
`packages/solidaria-components/test/Dialog.test.tsx:339`,
`expect(dialog).toHaveAttribute("aria-labelledby", button.id)` — which asserts
the outcome rather than the mechanism, and which a JSX-ref rewrite that ate the
binding would fail. A second copy of that coverage, written as a regex over
source text, is the weaker copy and the one that just cost a red gate for no
defect. Retiring it is the default answer, and "never the third copy" is the
rule that says so.

Re-point it at the expression instead **only** if the build genuinely can drop a
declarative `aria-labelledby` binding in a way the test would not catch. If that
is the case, prove it — the proof is what justifies keeping a source-text
marker at all — and then the regex should match what the file now says, not what
it said before #555.

Do not delete the second marker. `closest\([^)]*alertdialog` still matches
`:361` and is live.

## Done when

`vp run build && vp run guard:jsx-ref-dead-code` exits 0, and the ticket records
which of the two readings was taken and on what evidence.

## Relationship

Child of #544, and stage 2 of `.agents/CONDUCTOR-RELEASE-PATH-2026-09-20.md`.
Step 219 of `.github/workflows/certification-gates.yml`, so it blocks the RC
after the reds that stop the walk earlier: #570 at 160, #571 at 169 and 185.
Sibling of #573, the other red the same post-build walk found.

Downstream of #555, which is merged: this is residue of `70a8d478`, a marker the
refactor should have moved in the same commit. Worth noting for #568, which owns
the fact that `ci:release-readiness` runs 8 of 36 blocking gates — this red sat
undiscovered because the chain never reaches step 219.
