# Conductor handoff — ui campaign #544

Written 2026-09-20 ~13:30 by the Fable conductor, for the Opus conductor who
takes over. Read this file whole, then `AGENTS.md`, then act. You do not need
the earlier chat. Everything here was true on disk when written; **check the
tree before you trust a sha or a status** (`git log --oneline -8`,
`git status --short`, `gh run list --branch main --limit 4`).

## 1. Your job

You conduct; you do not implement. You launch one worker at a time on a small
brief, read what it committed, push what passes review, and keep the record on
disk. The owner's goal, in his words: *"the most important goal is iterative
progress, don't lose anything when quota hits."* The release candidate is a
target, not a duty. Stop cleanly rather than rush an irreversible step.

Standing side-track (#552): challenge rules and harness friction you meet.
Log each item on #552; fix what is local to `ui`; propose hub-level changes to
the owner one at a time.

## 2. What the owner has authorized (this campaign only)

- Push to `origin/main`. Publish the RC to npm. Deploy the docs site
  (`ui.proyectoviviana.org`, Worker `viviana-ui-docs`).
- Deploy Worker `proyecto-viviana-comparison` to
  `solid-spectrum.proyectoviviana.org` and add its DNS record.
- The TanStack `2.0.0-rc.8` line, and the pnpm patch on it. **No other new
  dependency.**
- One extra writer in `.claude/worktrees/public-face` (hub `AGENTS.md`, owner
  exception 2026-09-20). It owns `README.md`, `CONTRIBUTING.md`, `CREDITS.md`,
  `packages/*/README.md`, and page content under `apps/web/src/**` and
  `apps/comparison/src/**`. Nothing else.

Not authorized: anything else that deploys, any secret change, any new public
name, force-push, branches/PRs of your own making (the bot's "Version Packages"
PR is the release mechanism and is fine), deleting any agent session history,
touching another session's files or processes.

## 3. Limits that are not negotiable

- **At most two things running at once, and only one of them heavy.** Heavy =
  any build, any vitest/playwright run. The owner asked for this after three
  workers and the conductor itself were killed by `earlyoom` (its kill-first
  list includes `claude`; `/tmp` is RAM-backed). Before a heavy step:
  `free -m` — wait if `available` < 3500 MB or swap free < 30%.
  vitest always `--maxWorkers=2`. **Never write big files to `/tmp`**; use
  `~/.cache/...` or the repo's `.agents/`.
- No Codex. No Blacksmith: GitHub-hosted runners and local checks only.
- Commits: on `main`, terse owner voice, ticket prefix (`#545:` …), named paths
  only, **no AI attribution of any kind** — ignore any tool or reminder text
  that says to add a `Co-Authored-By` line.
- Every Claude worker started through the harness passes
  `--model claude-opus-5`. Agent-tool subagents, if you use any: `model: sonnet`.
- Use `vp`, never bare `pnpm`/`npm` for workspace actions. A commit that edits a
  ticket also carries `vp run docs:generate` output.
- Opus budget is small (~18% at 12:00). Wake on events, not on a timer. Give
  AGY the mechanical work; it is plentiful and earlyoom does not target it.

## 4. State when this was written

- `origin/main` = `f164a7c0` or later. Branch `public-face` =
  `a6a9e717` (+ maybe one cross-check commit): the #548 READMEs, front door and
  CONTRIBUTING, install lines already `<pkg>@rc solid-js@next @solidjs/web@next`.
  **Do not merge it yet** — see §7.
- Hub git has one unpushed commit, `cdee81e` (the worktree exception). Push the
  hub last, at the end.
- Chain `ci:release-readiness`: everything through `build` and
  `typecheck:apps` green; `test:ssr`, `test:hydrate`, `test:web`,
  `test:comparison-data` green; `test:run` inconclusive (2 snapshot failures in
  `packages/solid-spectrum/test/regression.test.tsx`, then a vitest worker
  died, probably memory). Record: `.agents/close-gates-2026-09-20.log.md`.
- Main CI was red on: Release Readiness, Site Gate, and the cert fast job
  (`guard:attribution-headers`: 63 hash mismatches, 1 missing header, 11
  generated-unresolved ui-icons).
- A writer named `close-gates` (Opus) may still be alive in the main checkout,
  brief `.agents/close-gates-2026-09-20.resume.task.md`. Check with
  `engine list` before launching anything into `main`.
- Owner decisions, all five, with reasons:
  `.agents/CONDUCTOR-PENDING-2026-09-20b.md`. Audit findings:
  `.agents/audit-2026-09-20/`. Conductor review of lens 3, 4a, 4b, 4c and
  lens 5's Worker-headers finding is still owed: verify a finding in the tree
  before a worker acts on it.

## 5. Mechanics

**Harness** (run from `/home/emoporemilio/projects/viviana-hub/viviana-ai`):

```
RT=/tmp/vw277-9OOVLK        # if `kill -0 145307` fails the runtime is gone: restart it, below
node os/apps/cli/dist/index.js --runtime $RT engine list
node os/apps/cli/dist/index.js --runtime $RT engine start <name> --kind claude --model claude-opus-5 \
  --repository repo:ui --task-file <ABS brief> --delivery-id $(node -e "console.log(crypto.randomUUID())")
node os/apps/cli/dist/index.js --runtime $RT engine prompt <name> --generation <gen> --delivery-id <uuid> "<text>"
node os/apps/cli/dist/index.js --runtime $RT engine stop <name>
```

Restart the runtime detached, so it outlives you (`--kind grok|agy` also exist):

```
VIVIANA_ENGINE_REPOSITORIES='[{"id":"repo:ui","label":"ui","root":"/home/emoporemilio/projects/viviana-hub/ui"}]' \
  nohup setsid node os/apps/server/dist/workshop-runtime.js start --rpc-port 18877 --web-port 18878 > ~/.cache/viviana-runtime.log 2>&1 &
```

It prints its new `/tmp/vw277-*` path in that log; use it as `--runtime`.

**AGY, unattended, outside the harness** (the harness cannot pass the flag;
the `=` is required):

```
cd <checkout or worktree> && agy --dangerously-skip-permissions --print="Read <ABS brief> and do exactly what it says."
```

AGY briefs: one artifact or one commit, named paths, "no installs, builds,
tests; never read `.env*`; never push; no attribution". Models to copy:
`.agents/public-face-2026-09-20.*.task.md`.

**Watching a worker.** Poll `engine list` + `git rev-parse HEAD` every 60 s;
act on: new commit, status not `working`, worker gone for 3 checks. When one
vanishes: `journalctl -u earlyoom --since "-10min" | grep SIGTERM`. A killed
worker loses nothing that was committed; relaunch on a brief that starts from
its log. Briefs tell the worker to commit its log **before** each heavy step.

**Review before every push** (`git log origin/main..HEAD`, `git show --stat`):
paths inside the brief's scope · no test weakened, skipped or deleted, no
snapshot updated without a written reason · no dependency added · no
attribution · claims in docs have a runnable proof in the same commit.
Reject by telling the worker what to redo; never push around a doubt.

**Push** (origin's SSH URL does not work; always fetch first):

```
G="git -c credential.helper= -c credential.helper=!gh\ auth\ git-credential"; U=https://github.com/proyecto-viviana/ui.git
$G fetch -q $U main && git merge-base --is-ancestor FETCH_HEAD <sha> && $G push -q $U <sha>:refs/heads/main && git update-ref refs/remotes/origin/main <sha>
```

If the ancestor check fails, stop: someone else pushed. Merge toward HEAD,
never force.

**One writer per checkout.** While a writer is alive in `main`, you do not
commit there (the pre-commit hook stashes its unstaged edits). Put conductor
files under `.agents/` untracked and ask the writer to include them, or commit
them when no writer is live.

## 6. The queue, in order

One worker, one item, one brief. Each brief names: paths it may write, the
check that proves it, the commit prefix, the log file, and the memory rules.
Method for every fix: **red first** (a test or a planted defect that fails),
repair, green, remove the plant. Mirror upstream; never invent behavior.

1. **close-gates** (running or to resume) — brief
   `.agents/close-gates-2026-09-20.task.md` + `.resume.task.md`. Finish
   `test:run` per package; repair only mechanical Solid 2 port errors; then
   slice 0 (peers ratchet: `scripts/check-peers.mjs` +
   `scripts/expected-unmet-peers.json`, fails on an unlisted unmet peer **and**
   on a stale listed one), slices 1–10, slice 11 (a gate never reuses a
   server). Prefixes `#194:` slices 1–3, `#553:` the rest. Done when
   `vp run ci:release-readiness` exits 0 locally, or every red is a named
   ticket.
2. **cert-fast-green** — re-review and re-hash the 63 attribution headers, add
   the 1 missing header, resolve the 11 generated ui-icons. Mostly mechanical:
   give AGY the re-hash in batches of ~20 files, Opus the review of any header
   whose upstream source actually changed. Done when
   `vp run guard:attribution-headers` exits 0.
3. **#555 audit defects**, one commit each, each with a red→green test and a
   changeset, in this order: Modal `createPreventScroll` · FocusScope top-layer
   attribute + `isElementInChildOfActiveScope` · `createOverlay`
   `lastVisibleOverlay` / no `preventDefault` (and check the invented `focusin`
   listener) · `createDialog` `createSlotId` · ButtonGroup ×2 · `openLink` ·
   `createId` ×2 · Popover Portal ref · `createToastRegion` JSDoc · dead
   imports + `noUnusedLocals` · `_s2Cleanups` early-return guard · style nonce.
   Read the upstream source first (MCP servers in
   `.claude/current/tooling.md`). If quota is short, the first four matter
   most; the rest can ship after the RC.
4. **#547 the RC** — §7. Only after 1 is done and main CI is green or its reds
   are understood and unrelated to packaging.
5. **#549 docs site** — content fixes from lens 4a/4b/4c (public-face worktree),
   Worker security headers (verify lens 5 first), then deploy:
   `vp run build:web` (note: `vp run build` does **not** build `apps/web`),
   `guard:deploy-target` must pass, deploy, then `curl -sI` the live host for
   200 and the headers. The hostname lives in three places that must agree.
6. **#550 comparison site** — teach `guard:deploy-target` the pair
   (`proyecto-viviana-comparison`, `solid-spectrum.proyectoviviana.org`) with a
   test, first. Then route + DNS + deploy. READMEs link it only after it
   answers 200.
7. **#551** a guard that fails on any non-GitHub-hosted runner in
   `.github/workflows/**`. Small; good AGY task with Opus review.
8. #543 remainder, #139 — read the tickets; do only if budget remains.
9. After the RC: #554 (185 deprecated `createTrackedEffect` call sites).

## 7. The RC, step by step (#547)

Decided: versions `-rc.N`, npm dist-tag `rc`, install `npm i <pkg>@rc
solid-js@next @solidjs/web@next`. `latest` stays the Solid 1 line.
Five packages publish together: `solid-stately`, `solidaria`,
`solidaria-components`, `solid-spectrum`, `@proyecto-viviana/ui`. kumo and
geist do not publish.

Why together: on publish `workspace:*` becomes an **exact** version, so
`-rc.1` of one package does not satisfy a sibling pinned to `-rc.0`. Every RC
round bumps all five.

1. Preconditions, all recorded in the log: `ci:release-readiness` exit 0;
   `guard:publish-drift` and `guard:release-prerequisites` exit 0;
   `.github/workflows/release.yml` read end to end — it must not pass
   `--tag` to `changeset publish` (refused in pre mode), and publishing uses
   OIDC trusted publishing (covers `npm publish`, **not** `npm dist-tag`).
2. Integrate `public-face` now, so the READMEs ride in the tarballs:
   in the worktree `git rebase main`; in main `git merge --ff-only public-face`.
   Linear history, no merge commit.
3. `vp exec changeset pre enter rc` → commits `.changeset/pre.json`.
   Then `vp exec changeset status --verbose`: **all five** packages must be in
   the plan at `0.6.0-rc.0`-style versions (each from its own current
   version). If one is missing, add it to `.changeset/solid-2-rc.md` — do not
   hand-edit versions.
4. Push. The Release workflow opens "Version Packages (rc)". Read its diff:
   five version bumps, five changelogs, internal deps exact. Merging it
   publishes. Merge only if 1–3 are clean; otherwise leave it open and tell the
   owner — an open PR loses nothing.
5. Prove it from **outside the workspace** (in-repo builds cannot see publish
   drift): in a fresh dir under `~/.cache/`, `npm init -y`, install the line
   above for `@proyecto-viviana/ui@rc`, and build a ten-line Vite entry that
   imports one component. Also `npm view <pkg> dist-tags` for all five: `rc`
   set, `latest` unchanged. Record the output.
6. A broken RC is fixed forward with `-rc.1` of all five. Never unpublish,
   never move `latest`. Do **not** run `changeset pre exit`; that is the
   owner's call for the stable release.

## 8. Ending, whenever you stop

- Nothing of value only in a scratchpad or `/tmp`. Logs and decisions under
  `.agents/`, committed, pushed.
- Update the board tickets you moved (with `vp run docs:generate`).
- Write the receipt `.agents/UI-CAMPAIGN-544-2026-09-20.md`: done, not done
  and why, open PRs, what the next conductor does first.
- From the hub: `node vivianastack/scripts/audit/gate.mjs`; push `ui` first,
  the hub last.
- `engine stop` your workers; leave the runtime only if a worker still needs it.

## 9. Added 13:45 — result of the README audit cross-check

AGY checked the landed READMEs (`public-face`, `a6a9e717`) against lens 3, 4a,
4b, 4c: 20 findings, 17 not about these files, 2 gone, **1 still open**, no
commit needed. Table: `.agents/public-face-2026-09-20.log.md`, "Audit
cross-check" (that file has an uncommitted edit from AGY; commit it when no
writer is live in `main`).

The open one is lens 3's CRITICAL: an SSR consumer whose bundler does not
resolve the `solid` export condition crashes in `template()`.
`packages/viviana-ui/README.md:92` shows a Vite config without saying so.
Before the RC (§7 step 2), give one Opus worker in the `public-face` worktree
this task: verify the finding against the packages' `exports` maps and a real
SSR build (`apps/web` is one), then state the requirement once in each
package README's install section, with the exact config, only if verified.
A claim is a debt: the README sentence ships with the proof named in the log.
