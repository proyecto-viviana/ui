---
id: 606
type: task
title: "A Form-size fix forked ToggleButton and turned guard layer-boundary red on main"
created: 2026-09-21
parent: 544
status: merged
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "main is red and this is the earliest blocking red on the gates ladder. Certification Gates run 35623988073 at `e8bacb9d` stopped at step 24, `guard layer-boundary` (`.github/workflows/certification-gates.yml:183-185`), and it reproduces at HEAD `45714230`: `vp run guard:layer-boundary` EXIT=1, `NEW forks (identical -> diverged): 1 - button/ToggleButton.tsx`. Cause: `7e93d238` (`form: the four buttons take the Form's size`) edited `packages/solid-spectrum/src/button/ToggleButton.tsx` and left the frozen byte-identical copy in `packages/viviana-ui/src/button/ToggleButton.tsx` behind, and `45714230` (#602's review fix) edited the spectrum side again. `ActionButton.tsx`, `Button.tsx` and `LinkButton.tsx` are baselined as DIVERGED forks, so the guard says nothing about them and they need reading by hand. This is the second time the same one-sided edit has gone red - #570 was the first, ten paths at once - so the ticket also owes a proposal for the mechanism that would have told the writer",
    }
  - {
      state: merged,
      at: 2026-09-21,
      note: "identity restored and all three diverged twins had the two defects, so all four were fixed in viviana-ui. Commit `#606: ...`, receipt `.agents/606-togglebutton-fork-2026-09-21.md`. Scope 1: every import the new ToggleButton code needs exists on the viviana-ui side with the same meaning, checked before the copy - `useFormProps` is exported from `packages/viviana-ui/src/form/index.tsx:86` and the only differences between the two `form/index.tsx` files are a comment and the `FieldContextualHelp` re-export, so the function is byte-identical; `MenuTriggerContext` is already imported in the viviana-ui copy and comes from the shared `@proyecto-viviana/solidaria-components`. So the copy was taken whole, `diff -q` reports the two identical, and the baseline was not touched. Scope 2, established by test and not by reading: a new `packages/viviana-ui/test/Form.buttons.test.tsx` mirrors solid-spectrum's five Form cases onto this register's twins and is 10 failed | 1 passed (11) EXIT=1 on the pre-fix source - only `disables Button through the Form and the Skeleton` passed, which is the control, because viviana-ui's Button already called `useFormProps`. The four component fixes are the same bytes solid-spectrum carries where the file is shared logic, and nothing register-specific crossed: viviana-ui's Button keeps `fontRelative(16)` and has no genai/premium gradient, which are its own baselined divergences. Button dropped `defaultProps` from the merge (it already wrapped in `useFormProps`, but a merged-in `size: 'M'` left nothing for the Form to fill); LinkButton and ActionButton gained the `useFormProps` wrapper and dropped `defaultProps`; ActionButton's `isDisabled` accessor became `headlessProps.isDisabled ?? groupContext?.isDisabled`, `isDisabled` came off `groupProps`, and `notificationBadgeContextValue.isDisabled` became `!!isDisabled()`. Read-time defaults were already present in all three (`local.size ?? 'M'`), so nothing had to be added for them. After: 11 passed EXIT=0. Two mutations of the fixed tree, each restored from a scratchpad copy, each EXIT=1 and each isolating exactly one assertion: the badge back on `!!headlessProps.isDisabled` fails only the NotificationBadge case, and the group getter back inside `groupProps` fails only the ActionButtonGroup case. Scope 3: `vp run guard:layer-boundary` EXIT=0, 524 identical + 84 diverged, 0 new forks, 0 unbaselined. Other exit codes, all 0: `vp run typecheck`; `vp lint`; `vp check` over the five changed files; `vp test run packages/viviana-ui/test/` 35 files / 226 passed; `vp run test:ssr` 30 files / 79 passed; `vp run test:hydrate` 28 files / 99 passed. Scope 4: `packages/viviana-ui` publishes as `@proyecto-viviana/ui` and its published source changed, so `.changeset/viviana-ui-button-family-form-props.md`, patch; `packages/solid-spectrum` was not touched and owes nothing new, its two changesets from `7e93d238` and #602 already stand. Disagreement with the brief, recorded rather than followed: the brief says the guard runs in CI and in `ci:release-readiness`, and it does not - the whole repo has exactly one caller, `certification-gates.yml:185`, and `ci:release-readiness` in `package.json` chains `check`, nine other guards, `build` and six test suites without it. There is no hook either, no husky and no lefthook. Scope 5's proposal is in the section below. Residue, not fixed here: viviana-ui's ActionButton carries #605's badge-size shape as well (`get size()` off the group-resolved `size()` with an `M` floor), since the two ActionButtons are the same code on that getter; #605 is written against solid-spectrum only and should fix both twins in one pass. `merged` and not `verified`: this seat does not push, so no CI run id backs any of these counts",
    }
---

## Scope

1. Restore identity: `packages/viviana-ui/src/button/ToggleButton.tsx` takes
   the `packages/solid-spectrum/src/button/ToggleButton.tsx` bytes, after
   confirming everything the new code imports exists on the viviana-ui side
   with the same meaning. If it does not, stop and say what is missing — the
   baseline is never loosened to go green.
2. The three diverged twins in viviana-ui — `ActionButton.tsx`, `Button.tsx`,
   `LinkButton.tsx` — get tested for the two defects solid-spectrum just fixed:
   `7e93d238`, ignores the Form's size; #602, a disabled `Form` or a `Skeleton`
   does not disable it. Port the fix where the defect is real; say why where it
   cannot apply.
3. `vp run guard:layer-boundary` exits 0.
4. A changeset for every published package whose source changed.
5. Say how a one-sided edit to a dual path gets past a writer, and propose —
   do not build — the smallest mechanical answer.

Non-goals: the 84 baselined forks and the 524 frozen identical copies (ticket
#1), #605's badge size, and anything in `packages/solid-spectrum`.

## Done when

`vp run guard:layer-boundary` exits 0 with 0 new forks, and a viviana-ui test
file proves the Form's size and the Form/Skeleton disabled contract on all four
buttons — failing on the pre-fix source first.

## Proof

The guard's two exit codes, the test counts either side of the fix, and the
mutations that bind each new assertion to its own branch, in the commit message
and in a dated `.agents/` receipt.

## How the fork got past the writer, and the smallest answer

Measured, not read. `guard:layer-boundary` has exactly one automated caller in
the repository: `.github/workflows/certification-gates.yml:185`. It is not in
`ci:release-readiness`, which is the one chain `AGENTS.md` and the release notes
tell a writer to run before handing work over; it is not in `vp run check`; and
there is no `.husky/` or `lefthook` config, so no hook runs it either. A writer
who edits one side of a frozen dual path therefore gets a green local run, a
green review, and a red main — which is exactly what happened to `7e93d238`,
and to the ten paths of #570 before it.

The smallest mechanical answer is one `&&` clause: add
`vp run guard:layer-boundary` to the `ci:release-readiness` chain in
`package.json`, next to `guard:source-artifacts`, which is its neighbour in the
gates ladder too. It costs 0.50 s measured here, it needs no new script and no
new infrastructure, and it puts the guard in the chain a writer already runs.
Rejected alternatives: a pre-commit hook (the repo has no hook infrastructure,
so this is a new mechanism rather than the smallest one), and folding the guard
into `vp run check` (a formatter/typechecker chain run constantly during
editing; a dual-tree inventory is the wrong category and the wrong cadence).

This is a proposal. It is not implemented here, because editing the release
chain is not in this ticket's write paths.

## Relationship

Child of #544. Blocks the S0 stage of
[#544's path](../initiatives/544-cut-the-solid-2-release-candidate-and-its-public-face.md):
`guard layer-boundary` is step 24 of the `gates` ladder at
`certification-gates.yml:183`, ahead of `docs:check` at `:257`, so it is the
earliest blocking red and stops the ladder before S0-b #588's step.

Residue of `7e93d238` (unticketed) and of `45714230` (#602), both of which
edited the spectrum side of a frozen dual path only. Second occurrence of the
class #570 fixed; #570 added the `reasons` map and the `--write-baseline`
refusal, which is why this went red loudly instead of being re-blessed.

`packages/viviana-ui` publishes as `@proyecto-viviana/ui`, so this is a
published behaviour change and owes a changeset.
