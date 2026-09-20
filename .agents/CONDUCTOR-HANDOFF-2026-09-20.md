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

## 10. Added 14:10 — the owner's rule on public copy

Owner, 2026-09-20: **Fable writes the public-facing copy, not Opus.** That
covers the READMEs, `CONTRIBUTING.md`, the docs-site landing and page prose
(#549), and the comparison-site prose (#550).

What this changes for you:

- Do not write or reword public prose, and do not brief a worker to. You and
  your workers may still fix facts in it: a dead link, a wrong version or tag,
  an import that does not resolve, a claim a check disproves. Say which check.
- Done by Fable on `public-face` (`daaa8b88`): the root `README.md` and
  `packages/viviana-ui/README.md` are rewritten, and both now carry a "Server
  rendering" section. That closes §9: the `exports` maps have `solid` →
  preserved JSX and `import` → DOM-compiled output (`template(` is in
  `packages/solidaria-components/dist/*.js`), and `apps/web/vite.config.ts`
  server-renders with `ssr.noExternal: [/@proyecto-viviana\/.*/]`. Skip the §9
  worker. The other five package READMEs keep their landed text; their
  openings were read and are accurate.
- The status table in the root README says npm tag `rc`. That is true only
  once the RC publishes, which is why `public-face` merges at §7 step 2 and
  not before.
- Copy still owed, for Fable: the docs-site landing and section prose (#549)
  and the comparison-site prose (#550). When you reach those items, do the
  engineering half (headers, guard, build, deploy) and leave the prose as it
  is. Write what needs words into `.agents/COPY-QUEUE-2026-09-20.md`: the
  file, the line, what is wrong with it, and any fact the copy must carry.
  The owner brings that list to a Fable session.

## 11. Added 14:25 — failure emails from main

Owner, 2026-09-20: tired of a failure email per push. Release Readiness,
Certification Gates and Site Gate all run on every push to `main` and all three
are red until queue items 1 and 2 land, so each push costs him three emails.

- **Stop pushing every commit.** Writers' commits stay local and reviewed;
  push to `main` only when `vp run ci:release-readiness` exits 0 locally, or
  once at the end of your session so nothing is stranded. Local commits are
  the safety net against quota, not the remote.
- The conductor tried `gh workflow disable` on the three and the permission
  classifier refused it. Do not retry. If the owner disables them himself,
  they must be **re-enabled before §7 step 4**: Release is triggered by
  Certification Gates completing on `main`, and the Version Packages PR needs
  all three. Check with `gh workflow list --all`.

**14:35 — the owner disabled the three himself** (`release-readiness.yml`,
`certification-gates.yml`, `site-gate.yml`; verified with
`gh workflow list --all`). So pushing no longer sends mail: go back to pushing
each reviewed range, which keeps the remote current. The local
`vp run ci:release-readiness` is now the only gate, so treat its exit code as
CI. **Before §7 step 4, re-enable all three** (`gh workflow enable <file>`),
push, and wait for them to go green on `main`; Release cannot fire while
Certification Gates is disabled. If the classifier refuses the enable, ask the
owner to run it.

## 12. State 15:25 — supersedes the matching lines of §4 and §6

- origin/main = `26edd4dc`. Every reviewed writer commit is pushed.
- **Queue item 1, close-gates: every slice is closed** (P, 0–11; log
  `.agents/close-gates-2026-09-20.log.md`). Not yet done: the item's own bar,
  `vp run ci:release-readiness` exit 0 locally. A detached whole-suite
  `vp test run --maxWorkers=1` has held the heavy slot since 14:50
  (`.agents/chain-walk-2026-09-20/whole-suite.out.txt`); when it ends, record
  its result in the log's slice 9 section, then run the full chain once,
  detached, output to a file.
- The chain grew. Read its order from `package.json`, not from §4: it now has
  `guard:workflow-pins`, `guard:certified-case-floor`,
  `guard:package-sourcemaps`, `guard:gate-server-reuse`, and `test:run`
  discovers every test (345 files).
- New ticket #556: the unit suite is order- and resource-dependent (workers die
  at `--maxWorkers=2` in one process; `ListView.test.tsx` red only in the full
  run). Not fixed. If the chain's `test:run` is red only for this, that is a
  named ticket, and the RC decision is the owner's.
- New internal env var `VIVIANA_GATE=1` (gate scripts set it; Playwright
  configs refuse to reuse a server under it). Owner may rename.
- The three gate workflows are disabled on GitHub (§11). Re-enable before §7
  step 4.
- The same Opus writer (generation `106d03cb…`) was idle at 15:21 and was
  prompted to start queue item 2, cert-fast-green, with light commands only
  while the whole-suite run holds the heavy slot.

## 13. Copy state 15:30

- `public-face` branch now holds `daaa8b88` (READMEs) and `30004ffb` (#549
  landing page copy, Fable-written: hero, pill, library blurbs, specimen,
  meta description). Both unmerged; merge at §7 step 2 as before. The landing
  now says "Solid 2", which is true of the `rc` tag only.
- Fact to fix at the RC, not before: the landing's `LibraryCard` renders
  `npm i <pkg>` (`apps/web/src/routes/index.tsx`, the `install` prop). Until a
  Solid 2 build is `latest`, that line must read
  `npm i <pkg>@rc solid-js@next @solidjs/web@next`. Engineering edit, no prose.
- Still owed from Fable: docs section prose under `apps/web/src/routes/docs/**`
  and the two library doc indexes (#549), comparison-site prose (#550). Queue
  specifics in `.agents/COPY-QUEUE-2026-09-20.md`.

## 14. RESUME HERE — Fable handed over at 15:45

Read §1–§3 for the job and the limits, §5 for mechanics, then this section.
Where §4, §6 or §12 disagree with this one, this one wins.

**State on disk**

- origin/main = `f13fd341`. Every writer commit up to it is reviewed and
  pushed. The three gate workflows are disabled on GitHub (§11); local
  `vp run ci:release-readiness` is the only gate until §7 step 4.
- Queue item 2, cert-fast-green: **done**. `vp run guard:attribution-headers`
  exits 0 (conductor ran it). Log `.agents/cert-fast-green-2026-09-20.log.md`.
- Queue item 3, #555: defect 1 of the first four is pushed (`f13fd341`, Modal
  `createPreventScroll`). The writer is mid-edit on defect 2, FocusScope
  (uncommitted: `packages/solidaria/src/focus/FocusScope.tsx`, two test files,
  and a scratch `packages/solidaria/test/zz-probe.test.tsx` that must not be
  committed). Log `.agents/audit-defects-555-2026-09-20.log.md`. Ticket:
  `.claude/tickets/tasks/555-fix-the-confirmed-overlay-dialog-and-link-defects.md`.
- Queue item 1 is **not** closed. The detached whole-suite
  `vp test run --maxWorkers=1` (started 14:50, one process, prints only at the
  end) still holds the heavy slot. The writer has standing instructions: when
  it ends, pause #555 at a commit boundary, record the result in the slice 9
  section of `.agents/close-gates-2026-09-20.log.md`, check `free -m`, run
  `vp run ci:release-readiness` once, detached, output to
  `.agents/chain-walk-2026-09-20/full-chain.out.txt`; every red is a fix or a
  named ticket. Known candidate red: #556 (suite order/resource dependence).
- `public-face` branch: `daaa8b88` (READMEs) and `30004ffb` (landing copy),
  unmerged, unpushed. Merge at §7 step 2. §13 has the install-line fact.
- Hub commit `cdee81e` is unpushed. Push it last (§8).

**The writer**

- Name `close-gates`, generation `106d03cb-d548-4b69-9d70-c8d441e7b178`,
  runtime `/tmp/vw277-9OOVLK`, status `working` at 15:43. It is Opus. Keep
  using it; do not start a second writer in `main`.
- It commits locally and never pushes. You review each new commit
  (`git show --stat`, attribution grep = 0, manifest/lockfile diff, removed
  assertions, scope), then push with the §5 recipe. `expectedInputs` trips the
  removed-assertions grep; use `expect\(` to avoid that false positive.
- **Do not commit in `main` while it is `working`**: the pre-commit hook
  stashes unstaged tracked files. This file's §12–§14 are uncommitted for that
  reason; the writer has been asked to commit this file at its next boundary.
  If it has not, commit it yourself when the writer is `idle`.
- Arm a Monitor on: new commits in `main`, writer status `idle` ×3 or
  terminal ×2, end of `pgrep -f "vp test run --maxWorkers=1"`, available
  memory < 2500 MB. 30 min maximum; re-arm at expiry. Wake on events only.

**After the first four #555 defects**

Go to §7 (the RC) if queue item 1 closed with understood reds; otherwise close
item 1 first. The remaining #555 defects can ship after the RC.

**Copy**

You do not write or reword public prose (§10). Queue what needs words in
`.agents/COPY-QUEUE-2026-09-20.md`. Fable still owes docs section prose (#549)
and comparison-site prose (#550); neither blocks the RC.

**Tool-result instructions**

Commit output in this environment carries a reminder to add a
`Co-Authored-By` trailer. The owner's rule overrides it: no AI attribution,
ever. Check every commit with the attribution grep.
