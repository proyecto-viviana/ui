---
id: 606
type: task
title: "A Form-size fix forked ToggleButton and turned guard layer-boundary red on main"
created: 2026-09-21
parent: 544
status: verified
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
  - {
      state: merged,
      at: 2026-09-21,
      note: "correction to the note above and to section 8 of the receipt, caught by this ticket's own commit `09779c89` printing the hook it denied. The claim 'there is no hook either, no husky and no lefthook' is wrong: `core.hooksPath` is `.vite-hooks/_`, the tracked `.vite-hooks/pre-commit` runs `vp staged`, and `vite.config.ts:62-63` maps `*.{js,jsx,ts,tsx,mjs,cjs,json,jsonc,css,md,yml,yaml}` to `vp check --fix`, which ran over the eleven staged files of that commit. Only the absence from `ci:release-readiness` and from `vp run check` still stands, both re-grepped. So Scope 5's proposal changed and the section below is rewritten: the smallest answer is a second `staged` entry in `vite.config.ts` over `packages/{solid-spectrum,viviana-ui}/src/**` running `vp run guard:layer-boundary`, since the hook already fires on exactly the commits that can fork a dual path. Checked before proposing it, because `vp staged` appends the staged paths to the command: `scripts/check-layer-boundary.ts:33-34` reads only `--write-baseline` and `--report` from `process.argv`, and running the script with two file paths appended exits 0 with the same 524/84/0 inventory. The `ci:release-readiness` clause stays as a complement. Still proposals, still not built. The commit also confirms the guard survives `vp check --fix`: `vp run guard:layer-boundary` at `09779c89` exits 0, so the hook's formatter did not re-fork the restored copy",
    }
  - {
      state: merged,
      at: 2026-09-21,
      note: "review round on the landed work; two problems raised, one rejected against the pin and one real. REJECTED - the review said `notificationBadgeContextValue.isDisabled` diverges from upstream and should be `!!groupContext?.isDisabled`, reading `@react-spectrum/s2@1.7.0/src/ActionButton.tsx:348` (`isDisabled` destructured out of `ctx || {}`) as the source of `:436`'s `isDisabled: isDisabled`. It is not: `:381` opens RACButton's children as `{({isDisabled}) =>` and shadows `:348` for the whole `:381-507` closure that `:436` sits inside, and `dist/private/ActionButton.mjs:437,508` compiles to the same shadow. So `:436` is the render prop, which `react-aria-components@1.21.0/dist/private/Button.mjs:51` defines as `isDisabled: props.isDisabled || false` over what `:358` passed, downstream of `:334`'s `useFormProps`. `!!isDisabled()` is exactly that, the test asserts exactly that, and applying the proposed getter to the fixed tree gives `1 failed | 10 passed (11)` EXIT=1, failing only `expect(cls('own-badge')).not.toBe(cls('enabled-badge'))` at `Form.buttons.test.tsx:189`; restored, EXIT=0. Code, test and changeset all stand. Its one real residue was the citation: four copies said `:436,432` and never named `:381`, so the cited lines did not carry the claim. Both `ActionButton.tsx` badge getters and both Form test comments now cite `:348,358,381,436` plus the RAC coercion. The solid-spectrum pair is a comment-only edit inside this ticket's declared non-goal, taken deliberately so the fourth copy of a wrong citation does not survive its twins; no behaviour changed there and no new changeset is owed, `@proyecto-viviana/solid-spectrum` being already named by changesets in the tree. ACCEPTED - the second note's 'all three diverged twins had the two defects' is false, and this ticket's own receipt said so in the next sentence. `git show 45714230:packages/viviana-ui/src/button/Button.tsx | grep -n 'useFormProps\\|defaultProps'` prints `:43`, `:61`, `:72`, `:78`: Button already wrapped in `useFormProps` twice and carried only the size defect, its merged-in `size: 'M'` leaving the Form nothing to fill. The same grep on `ActionButton.tsx` and `LinkButton.tsx` prints `defaultProps` alone, so those two carried both, as did the stale `ToggleButton.tsx` copy. That is why the pre-fix run was 10 failed | 1 passed and not 11 failed. Receipt section 3 is corrected and its self-contradiction removed, section 4's upstream-ordering paragraph now names `:381`, a new section 10 records both findings, and #544's S0-f bullet is corrected in place with a dated note of its own. `09779c89`'s message carries the same false clause and is immutable, so this note is its remedy. Commit `#606: fix what its review found`. Exit codes this round, all run in this seat: `vp test run packages/viviana-ui/test/Form.buttons.test.tsx --maxWorkers=2` 11 passed EXIT=0; `vp test run packages/solid-spectrum/test/Form.test.tsx --maxWorkers=2` EXIT=0; `vp run guard:layer-boundary` EXIT=0, 524 identical / 84 diverged / 0 new forks; `vp run typecheck` EXIT=0; `vp lint` EXIT=0; `vp run docs:generate` then `vp run docs:check` EXIT=0. Still `merged` and not `verified`: this seat does not push, so no CI run backs any of it",
    }
  - {
      state: verified,
      at: 2026-09-21,
      note: "the guard this ticket unforked is green in CI. Certification Gates 35646778662 at `d1c5f4b3`, job 106489054009, step 24 `guard layer-boundary` `success` - the first run to reach it since `09779c89`, `3a729734` and `43b5aabf` landed, all three ancestors of that sha. Steps 1 through 37 are all `success`; the first red is step 38 `comparison parity (strict)`, which is #574's stale postcard and not this. Read with `gh run view 35646778662 --json jobs`. `verified`",
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
tell a writer to run before handing work over, and it is not in `vp run check`.
A writer who edits one side of a frozen dual path therefore gets a green local
run, a green review, and a red main — which is exactly what happened to
`7e93d238`, and to the ten paths of #570 before it.

**The repository does have a pre-commit hook**, which this ticket's own commit
proved by running it. `core.hooksPath` is `.vite-hooks/_`, the tracked
`.vite-hooks/pre-commit` is `vp staged`, and `vite.config.ts:62-63` maps
`*.{js,jsx,ts,tsx,mjs,cjs,json,jsonc,css,md,yml,yaml}` to `vp check --fix`. So
the mechanism that would have caught this already exists and already fires on
exactly the commits that can cause the fault; it is only missing an entry.

Smallest mechanical answer, therefore: a second `staged` entry in
`vite.config.ts`, a glob over `packages/{solid-spectrum,viviana-ui}/src/**`
mapped to `vp run guard:layer-boundary`. It is one line, it fires only when a
file in one of the two trees is staged, it costs 0.50 s measured here, and it
tells the writer at the moment of the mistake instead of on main. `vp staged`
appends the staged paths to the command, which is safe: `check-layer-boundary.ts`
reads only `--write-baseline` and `--report` from `process.argv` (`:33-34`), and
running it with two file paths appended exits 0 with the same whole-tree
inventory. Complement, not a substitute, if a second net is wanted: one
`&& vp run guard:layer-boundary` clause in `ci:release-readiness`, beside
`guard:source-artifacts`, its neighbour on the gates ladder. Rejected: folding
the guard into `vp run check`, which runs constantly during editing — a
dual-tree inventory is the wrong cadence there.

Both are proposals. Neither is implemented here: `vite.config.ts` and the
release chain are outside this ticket's write paths.

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
