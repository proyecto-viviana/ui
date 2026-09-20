Read `/home/emoporemilio/projects/viviana-hub/ui/.agents/audit-2026-09-20/BRIEF.md` first and obey it.

# Lens 2 — Gate integrity: can a check pass while broken?

Artifact: `/home/emoporemilio/projects/viviana-hub/ui/.agents/audit-2026-09-20/lens2-gates.md`

Today a syntax error and 373 unformatted files sat on main across eleven red
pushes, and an earlier release shipped a broken package. Find every gate that
can report green on a broken tree, and every claim of "guarded" that is not.

Attack:

1. Every `guard:*`, `ci:*`, `pr:check*`, `release:*`, `a11y:*`, and
   `comparison:test*` script in the root `package.json` and the scripts they
   call under `scripts/` and `apps/comparison/scripts/`. For each: what does it
   actually assert? Can it pass vacuously (zero files matched, empty glob,
   caught exception, missing input treated as success, `|| true`, a pipe that
   masks the exit code, `process.exitCode` never set, an `async` main whose
   rejection is unhandled)? Feed it a mental or real broken input.
2. `.github/workflows/*.yml`: `continue-on-error`, `if: always()` hiding a
   failure, jobs not required by anything, shards whose failure the merge job
   ignores, `needs` gaps, the Release workflow's conditions for publishing, and
   whether a publish could run from a revision whose gates did not pass.
   Pinning of third-party actions and of npm itself in the privileged job.
3. The certified suite: waivers (`certified-waivers`), skip lists, `test.skip`,
   `test.fixme`, `.only`, retries that turn a flaky failure into a pass,
   expected-failure annotations, and whether the "2,177 cases" count is
   discovered or typed. How could a whole spec file silently not run?
4. Stale-artifact traps: checks that read `dist/` or a preview server and can
   pass against an old build.
5. Unit tests that assert nothing: `expect` inside a callback that never runs,
   tests with no assertion, snapshot files that were regenerated in the codemod
   commit (`git show 163f4377 --stat -- '*.snap'`) and so bless new behavior.

For each broken gate give the smallest planted defect that it would miss.
