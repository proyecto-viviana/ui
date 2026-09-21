---
id: 139
type: task
title: "Refuse pack-script rmSync outside a temp directory prefix"
created: 2026-09-01
parent: 136
status: merged
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
  - {
      state: open,
      at: 2026-09-20,
      note: "re-verified at `1d7551cb` by the conductor, pulled into #544 because stage 4 of the release path runs `pack:local-chain` and this is that script. Still live, and wider than this ticket says: three env-driven paths, not one - `VIVIANA_PACK_OUT` (pack-local-chain.mjs:9, consume-pack-smoke.mjs:19), `VIVIANA_PACK_STAGE` (:11) and `VIVIANA_CONSUMER_DIR` (consume-pack-smoke.mjs:20) - feeding three `rmSync(..., { recursive: true, force: true })` at pack-local-chain.mjs:119-120 and consume-pack-smoke.mjs:108. `force: true` means a wrong path does not even error on the way out. Checked for an existing containment helper before proposing one: `grep -rnE 'startsWith\\((repoRoot|tmpRoot|allowed)|relative\\(.*\\)\\.startsWith' scripts/` returns nothing, so there is none to reuse, but `mkdtempSync(join(tmpdir(), \"prefix-\"))` is already the idiom at six sites in this same directory and is the answer. Also: the defaults are the literal string `/tmp`, which the hub standing rule tells agents not to write big files to, and five package tarballs are big",
    }
  - {
      state: merged,
      at: 2026-09-21,
      note: "new `scripts/scratch-dir.mjs`, used by both scripts for all three variables: resolve, follow symlinks on the existing part, then refuse unless strictly under the real `tmpdir()` and neither holding nor inside the repository. Unset, the stage is `mkdtempSync(join(tmpdir(), 'viviana-ui-pack-stage-'))` and the other two default under `tmpdir()`, no literal `/tmp`. `scripts/scratch-dir.test.ts` 8 passed: five on the helper (repo root, its parent, `/`, `tmpdir()` itself, a `..` walk, a repo under tmp, a symlink to the repo) and one per variable that copies the script into a throwaway repository inside a throwaway TMPDIR, points the variable at that root, and asserts the refusal message and a surviving sentinel. Mutation: both scripts put back, exactly the three per-variable tests fail. `node scripts/pack-local-chain.mjs` with defaults packs all seven into `tmpdir()`, exit 0",
    }
  - {
      state: merged,
      at: 2026-09-21,
      note: "2026-09-21 round-2 audit, receipt `.agents/audit-2026-09-21/round-2-results.md`. The guard held up under three checks - it is wired at every deleting call site (the only recursive deletes left are `pack-local-chain.mjs:130-131` and `consume-pack-smoke.mjs:109`, all three variables through `scratchDir`, and no literal /tmp survives in `scripts/` or `apps/comparison/scripts/`), its tests feed genuinely violating fixtures to the real scripts rather than to a mock, and its symlink defence is real because `realPath()` resolves the deepest existing prefix. Two residues, both low, both owned by **#601** items 9 and 10 because this ticket is merged. `r2-guards/r2-guards-5`, partly: containment is anchored on `realPath(tmpdir())`, and Node reads `tmpdir()` from TMPDIR/TMP/TEMP - the same environment the override comes from, which is exactly how `scratch-dir.test.ts` relocates the temp root through child env. With TMPDIR pointed at a home directory and `VIVIANA_CONSUMER_DIR` at a directory under it, the path is inside the temp root, neither holds nor sits inside the repo, and is accepted and force-deleted. It needs two misconfigured variables where one sufficed before, so the guard is strictly stronger than what it replaced; the fix is to constrain the victim as well as the location, requiring the last segment to be one of the names these scripts own. `r2-guards/r2-guards-6`, not challenged: with `VIVIANA_PACK_STAGE` unset the stage is `mkdtempSync`'d per run (`pack-local-chain.mjs:21-23`), so the `rmSync`/`mkdirSync` pair at `:130-133` clears a brand-new directory and nothing ever removes it - the script only prints it at `:168`. The old pid-named path was at least reused; the new one leaks one full copy of the seven packed packages per invocation",
    }
---

## Cause

`pack-local-chain.mjs` and `consume-pack-smoke.mjs` take output dirs from the
environment and `rmSync(..., { recursive: true })` with no prefix check.
Defaults are under `/tmp`.

## Work

Refuse resolved paths outside an allowed temp prefix.

The prefix check is the ticket's own framing and it is the weaker of two
answers. Prefer the one the repository already uses: a directory the script
**creates itself** with `mkdtempSync(join(tmpdir(), "viviana-ui-packs-"))` is a
directory it is entitled to delete, and the question "is this path mine?"
stops needing to be asked. That idiom is live at six sites in `scripts/`
(`test-ci-guard-contracts.mjs:21`, `extract-api-reference.test.ts:22`,
`check-entry-import-budget.test.ts:56`, `check-publish-drift.test.ts:32`,
`release-candidates.test.ts:15`, `generate-solid-spectrum-icons.mjs:458`).

The env overrides still have to work — stage 4 of the release path needs to
point a clean off-workspace consumer at a known directory — so an override that
is supplied must be checked rather than trusted. Refuse when the resolved path
is not under `tmpdir()`, is `tmpdir()` itself, or contains the repo root. Do
not check the string: resolve, then compare, or a `..` walks straight through.

Drop the literal `/tmp` defaults for `tmpdir()` while here. The hub rule says
agents do not write big files to `/tmp`, and a packed chain of five packages is
big.

## Done when

Setting `VIVIANA_PACK_OUT` to the repo root cannot delete the tree — and the
same holds for `VIVIANA_PACK_STAGE` and `VIVIANA_CONSUMER_DIR`, which this
ticket originally missed and which reach the same `rmSync`. A test per variable,
asserting the refusal rather than the absence of damage.

## Relationship

F-SEC-005. Local tooling, not a deployed surface.

Pulled into #544's stage 3 on 2026-09-20: stage 4 runs `pack:local-chain` into a
clean consumer, so this is the script the release is about to depend on and it
is ordered before that step, not after it. Parent #136 still owns the audit it
came from.
