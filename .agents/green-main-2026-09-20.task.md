# Writer task — make main green (tickets #545, #531), 2026-09-20

You hold the only writer seat in `/home/emoporemilio/projects/viviana-hub/ui`.
Four read-only audit workers are running; they edit nothing but
`.agents/audit-2026-09-20/lens*.md`. Do not touch that directory.

Read `AGENTS.md`, then `.claude/tickets/tasks/545-move-the-web-app-to-tanstack-solid-2.md`.

## Goal

`vp run ci:release-readiness` and `vp run ci:site` both exit 0 on a clean tree.
They are what the two red workflows on main run. Today the first passes
`check`, `guard:attribution`, `guard:generated-icons`, `guard:theme-base`, then
fails at `guard:dependency-security` (`pnpm peers check`). Nothing after that
step has been run since the Solid 2 port, so expect more.

## Slices, in order. One commit each, as soon as its proof passes.

1. **Vestigial Solid 1 toolchain.** Root `package.json` declares
   `unplugin-solid`, which only two comments mention. `apps/comparison`
   declares `@astrojs/solid-js`, but `astro.config.*` imports the local
   `./integrations/solid/index.mjs`. For each: prove nothing resolves it
   (`rg`, then the build of that app or package), remove it, `vp install`,
   and show `vp exec pnpm peers check` no longer lists its group. If one is
   in fact used, stop that slice and write down what uses it.
2. **#545.** Bump `@tanstack/solid-router` and `@tanstack/solid-start` to
   `2.0.0-rc.8` (owner-approved), align `@tanstack/router-core` and any
   TanStack plugin to what that line requires, fix what the major breaks in
   `apps/web`. Proof: `vp run build:web`, `vp run guard:deploy-target`,
   `vp exec pnpm peers check` clean.
3. **The rest of each chain**, one failing step at a time. A mechanical
   repair (an import, a renamed API, a stale generated file whose generator
   you fix) gets its own commit. Anything that needs a judgement about
   behaviour: do not repair it. Write it down and go on to the next step.

## Rules

- Add no dependency other than the TanStack `2.0.0-rc.8` line. Removing is fine.
- Never invent behaviour. Upstream React Spectrum is vendored in
  `react-spectrum/`; Solid 2 source is in `node_modules/solid-js` and
  `node_modules/@solidjs/web`.
- Never weaken, skip, or delete a test or a guard to get green. If a check is
  wrong, say why in the log and leave it red.
- One heavy command at a time; this box has little memory. Pass
  `--maxWorkers=1` to a direct vitest run.
- Commit on `main` with `git add <named paths>` only. Terse owner voice, the
  ticket number first where one applies, e.g. `#545: ...`. No AI attribution,
  no `Co-Authored-By`, no "Generated with". **Never push.** Never force.
  Never `--no-verify`; if the pre-commit hook fails, fix the cause.
- A ticket you edit needs `vp run docs:generate` and the two regenerated files
  in the same commit.
- No deploy, no publish, no secret reads, no `.env*`.

## Log — append as you go, you may be stopped at any moment

`/home/emoporemilio/projects/viviana-hub/ui/.agents/green-main-2026-09-20.log.md`

Per slice: what you found, the commit hash, the exact proof command and its
last lines. Keep a `## Now` section at the top that always says which step of
which chain is currently failing and why. End with `## Left red` — everything
you chose not to repair, with the evidence. Commit the log with each slice.
