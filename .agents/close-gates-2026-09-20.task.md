# Writer task — close the fail-open gates (tickets #194, #553), 2026-09-20

You hold the only writer seat in `/home/emoporemilio/projects/viviana-hub/ui`.
Read `AGENTS.md`, then `.claude/tickets/tasks/194-*.md` and
`.claude/tickets/tasks/553-*.md`, then the audit that found all of this:
`.agents/audit-2026-09-20/lens2-gates.md`. The conductor reproduced every
finding named below from source; `.agents/audit-2026-09-20/VERIFIED.md` has
the rows.

## Why

A release candidate is about to be cut from this tree. Today the gate chain
cannot tell a good tree from a bad one: a certified spec that fails to load is
green, a deleted spec is green, the last guard before `changeset publish`
inspects no shipping package. Each slice below turns one gate from
fail-open into fail-closed.

## Method, every slice

1. **Red first.** Plant the smallest defect the audit names (or build the
   fixture that stands for it) and show the gate passing on it. Keep the
   command and its last lines for the log.
2. Repair the gate.
3. **Green and red.** Show the gate now fails on the planted defect and passes
   without it. Where a unit test can hold the planted case, commit that test —
   a gate without a test of its own failure path is the next fail-open gate.
4. Remove the planted defect. One commit per slice.

Before you invent a mechanism, read what exists:
`apps/comparison/src/data/certified-suite-evidence.ts` (`expectedFixmes`,
`validateCertifiedSuiteEvidence`), `apps/comparison/scripts/certified-waivers.ts`
(the policed waiver channel and `waiverGateFails`),
`scripts/check-publish-drift.mjs:41-60` (how publish candidates are derived).
Extend those; never write the third copy of a derivation — extract it.

## Slices, in this order

L. **Land the conductor's notes first** (one commit, `#546:` prefix). The
   conductor could not commit while the last writer held the seat; everything
   is in `.agents/CONDUCTOR-PENDING-2026-09-20.md`. Do exactly this: append
   its LAUNCHES rows to `.agents/audit-2026-09-20/LAUNCHES.md` and its
   VERIFIED rows to `.agents/audit-2026-09-20/VERIFIED.md` in each file's
   existing format; append its friction items 13–18 to ticket #552 in that
   ticket's format; mint tickets #553, #554, #555 as it describes (check
   `ls .claude/tickets/tasks | tail` first — if an id is taken, use the next
   free ones and say so in the log); `vp run docs:generate`; stage those
   files, the regenerated board views, every untracked file under
   `.agents/audit-2026-09-20/`, `.agents/draft-readmes-2026-09-20.task.md`,
   this brief, and then `git rm`-free delete of the pending file is NOT
   wanted — commit it too, as the record. Do not stage `.agents/drafts-548/`.
P. **Unblock `build:web` with a pnpm patch** (one commit, `#545:`). The last
   writer left `build:web` red on an upstream rename. The conductor decided:
   do exactly what `.agents/green-main-2026-09-20.decision-solid-start-patch.md`
   says, and commit that file with the patch. Then run the steps of
   `ci:release-readiness` that come after `build` one at a time
   (`typecheck:apps`, `test:run`, `test:ssr`, `test:hydrate`, `test:web`,
   `test:comparison-data`) and record each exit code and its first failure in
   your log under `## Chain state`. Repair only what is a mechanical Solid 2
   port error in `apps/**`; anything behavioural goes to `## Left red`. Spend
   at most an hour here, then move on to slice 0.
0. **`guard:dependency-security` tells the truth about peers, and always
   audits.** Today it is `pnpm peers check && audit && audit`: the peers check
   is red, so neither audit has run on main since the Solid 2 port. The 16
   unmet `solid-js` peers are all dependencies TanStack's own `2.0.0-rc.8`
   line declares (`vp exec pnpm why -r @solid-devtools/debugger`,
   `… vite-plugin-solid`): `@solid-devtools/*` and eleven
   `@solid-primitives/*` under `@tanstack/solid-router`, and
   `vite-plugin-solid` + `babel-preset-solid` + `solid-refresh` under
   `@tanstack/router-plugin`. No bump of ours satisfies them, and
   `peerDependencyRules.allowAny: solid-js` would blind the check for our own
   packages. Do this instead: `scripts/check-peers.mjs` runs
   `pnpm peers check --json`, compares against a committed
   `scripts/expected-unmet-peers.json` (peer, wanted range, package@version,
   and the root dependency that pulls it, each entry carrying a reason), and
   fails on **any unmet peer not listed** and on **any listed entry that no
   longer occurs** (so the list can only shrink, and shrinks the day TanStack
   fixes it). The guard then runs both audits whatever the peers result, and
   exits non-zero if any of the three failed. Give the script a unit test for
   both failure paths. Planted defect: add one fake entry (must fail as
   stale), remove one real entry (must fail as unexpected).
1. **Certified shard failures must be explained.** `certified-summary.ts`
   reporter gains `onError` (record each load-time error with its file) and
   records Playwright's `FullResult.status` in `onEnd`. The merge
   (`merge-certified-reports.ts`) fails when any shard carries a load error,
   and when a shard's run status is not `passed` while its summary records no
   failed case and no error — every non-pass exit must be explained by
   something the summary names. Planted defect: `throw new Error("x")` at the
   top of one certified spec, one shard run locally with `--shard`.
2. **Case floor.** A committed baseline of discovered cases per certified spec
   file, produced by `playwright test --list --reporter=json` (no browser, a
   few seconds). A fast guard fails when a file's count drops or a baselined
   file disappears; growth passes and prints the line to ratchet. Give it a
   `--write` mode. Wire it into the fast `certification-gates` job and into
   `ci:release-readiness`. Planted defect: move one certified spec aside.
3. **Skipped and flaky ceilings in the merge.** The merged summary fails when
   `totals.skipped` exceeds the committed count, and when `totals.flaky` is
   above a committed budget (start at `0`; keep the number in the same
   baseline file so the owner changes one line). For the skipped count use
   the existing `expectedFixmes` inventory if it is sound; #194 says it misses
   driver-level `test.fixme` sites — make the inventory count every site, as
   #194's "Done when" demands.
4. **`guard:release-prerequisites` enumerates from the tree.** Publish
   candidates = non-private `packages/*` minus `.changeset/config.json`
   `ignore`, shared with `check-publish-drift.mjs` through one extracted
   helper. A candidate with no entry fails. For the five shipping packages
   record only evidence anyone can re-run (`npm view <pkg> name version
   dist-tags --json`, and `npm view <pkg>@<version> dist.attestations` for
   trusted publishing). If a prerequisite can only be attested by the owner,
   leave it `satisfied: false`, let the guard fail, and say so under
   `## Left red`. Do not write an evidence string you did not produce.
5. **`guard:publish-drift` sees the manifest.** Diff `src` and the package's
   `package.json`. Planted defect: a new `exports` subpath with no changeset.
6. **Pin npm in `release.yml`.** Replace `npm@^11.5.1` with the exact version
   `npm view npm@11 version` returns today, with the same "bump deliberately"
   comment the pinned actions carry.
7. **`guard:entry-import-budget` fails on an unbuilt budgeted entry** instead
   of skipping it.
8. **`guard:package-sourcemaps`**: run it after a build. If it passes, wire it
   into `ci:release-readiness` after `build`. If it fails, do not wire it;
   write the output under `## Left red` and correct the claim in
   `.claude/current/tooling.md:172` to say it is unwired.
9. **`ci:release-readiness` discovers the apps' unit tests.** 15 test files
   under `apps/comparison` (148 cases, 91 of them the SSR/hydrate
   solid-integration suite) are reachable from no workflow. Make the chain run
   them by discovery, not by naming files. Expect failures from the Solid 2
   port: a mechanical one you repair in its own commit; a behavioural one goes
   to `## Left red` with its output and the gate stays red — that is the
   honest state.
10. **Four tests that assert nothing** (`createFormValidation.test.tsx:122,229`,
    `createFocusRing.test.tsx:346`, `Toast.test.tsx:340`). Give each the
    assertion its title promises; upstream's equivalent tests are in
    `react-spectrum/packages/`. If the behaviour is absent, the test stays,
    fails, and goes to `## Left red`. Never delete or soften it.

Not yours: the `Changesets Check` trigger and `reuseExistingServer` findings —
the conductor is deciding those.

## Rules

- No new dependency. Never invent behaviour.
- Never weaken, skip, or delete a test or a guard. A gate that goes red
  because it now tells the truth is the point of this task; record it, do not
  paper over it.
- One heavy command at a time; little memory here. `--maxWorkers=1` on a
  direct vitest run, from the repo root with full paths. Do not run the whole
  certified suite; single shards and `--list` only.
- Commit on `main` with `git add <named paths>` only. Terse owner voice,
  ticket number first (`#194:` for slices 1–3, `#553:` for slice 0 and the rest). No AI
  attribution, no `Co-Authored-By`, no "Generated with". **Never push.** Never
  force. Never `--no-verify`.
- A ticket you edit needs `vp run docs:generate` and both regenerated files in
  the same commit. A change to a published package's `src` or manifest needs a
  `.changeset/*.md`; scripts, workflows and app tests do not.
- No deploy, no publish, no secret reads, no `.env*`, no `gh secret`.

## Log — append as you go, you may be stopped at any moment

`/home/emoporemilio/projects/viviana-hub/ui/.agents/close-gates-2026-09-20.log.md`

`## Now` at the top: the slice in hand and its state. Per slice: the planted
defect, the before and after command lines, the commit hash. `## Left red` at
the end. Commit the log with each slice.
