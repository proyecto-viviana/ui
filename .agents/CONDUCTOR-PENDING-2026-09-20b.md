# Conductor notes, part b — not yet in the repo (writer seat held by close-gates)

The next writer that ends a slice lands this file as the record, and copies the
owner decisions where they belong.

## Owner decisions, 2026-09-20 ~12:30 (asked one at a time, answered in chat)

1. `build:web`: **pnpm patch** of `@tanstack/solid-start@2.0.0-rc.8` — confirmed. Landed `1df7af51`.
2. Peers policy: **ratcheting allowlist** (`scripts/check-peers.mjs` + `scripts/expected-unmet-peers.json`, audits always run) — confirmed. No `allowAny: solid-js`.
3. **ui worktree exception — granted**, shape "one public-face writer":
   - one extra writer in `ui/.claude/worktrees/public-face`, beside the main writer;
   - it owns only `README.md`, `CONTRIBUTING.md`, `CREDITS.md`, `packages/*/README.md`, `apps/web/src/**` and `apps/comparison/src/**` page content;
   - the main writer keeps `packages/**` (except READMEs), `scripts/**`, `.github/**`, dependency manifests, the lockfile and tickets;
   - heavy builds and browser proofs stay serialized, one slot; the conductor alone integrates into `main`;
   - ends when #548, #549 and #550 close.
   To write down: a paragraph under "One editing session per git" in the hub `AGENTS.md`, beside the visualmode exception (hub git, owner voice), and a pointer in `ui/AGENTS.md` Local rules.
4. RC naming (#547): **`-rc.N` on the `rc` dist-tag** — owner chose it 12:45. `changeset pre enter rc`; install line is `npm i <pkg>@rc`; `latest` stays the Solid 1 line until `changeset pre exit`. The #548 drafts change every `@next` to `@rc`. (Why not `@next`: Changesets pre mode uses one word for the suffix and the dist-tag — lens 3 CRITICAL — and moving a second tag needs an npm token that OIDC trusted publishing does not give.)

## Runtime restart 12:33–12:40

The Claude Code session restarted and took the harness runtime (a background task of that session) and every worker with it. Tree was clean; close-gates had committed L (`cae7c0c7`) and the patch (`1df7af51`); both reviewed and pushed, origin/main = `1df7af51`.
New runtime `/tmp/vw277-9OOVLK` (rpc 18877, web 18878), started `nohup setsid` so it no longer dies with the conductor's session.
#552 item 19: a runtime owned by the conductor's session is a single point of failure for every worker; start it detached, always.

LAUNCHES.md row: | close-gates (resume) | claude | claude-opus-5 | (engine list) | d9a4cfc1-4f97-463c-ad3b-9a3f29487e3f | ed091e5d-8dbc-4d52-bdae-c684dff44fd4 | .agents/close-gates-2026-09-20.resume.task.md |

Lens 3 (Grok) and lens 4a/4b/4c (AGY headless) all completed; 4b's artifact was written after slice L and is still untracked. Conductor review of lens 3 and lens 4 findings: owed.

5. Comparison site public name (#550): **`solid-spectrum.proyectoviviana.org`** — owner chose it 12:50 (owner's direction: "comparison app should be around spectrum"; the package name was preferred over bare `spectrum` to keep the not-affiliated-with-Adobe stance plain). The answer carries the permission to deploy Worker `proyecto-viviana-comparison` to that hostname and add its DNS record. `guard:deploy-target` must learn this Worker/hostname pair before the first deploy. READMEs may link it only once it answers 200.

## Conductor decisions (the two the close-gates brief left open)

- **Changesets Check stays `pull_request`-only.** The owner commits to `main` without PRs, so on `main` the cover is `guard:publish-drift` inside Release, which slice 5 widens to the manifest. Moving the check to `push` would duplicate it. Write one sentence saying so in `.claude/current/release-policy.md` when slice 5 lands.
- **A gate never reuses a server.** New close-gates **slice 11**: every Playwright config under `apps/**` sets `reuseExistingServer: !process.env.CI`, and every `ci:*` / `guard:*` / `test:*` package script that starts Playwright runs with `CI=1` (or the config reads a `VIVIANA_GATE=1` the scripts set — pick whichever the configs already lean towards; do not invent a third switch). Planted defect: a stale server on the port serving an old build must make the gate fail, not pass. Interactive dev runs may still reuse.

## For the writer

Land this file and the still-untracked `.agents/audit-2026-09-20/lens4b-site-examples.md` with your next commit. Copy decision 3 (the worktree exception) into `ui/AGENTS.md` Local rules as a short pointer paragraph; the hub `AGENTS.md` paragraph is the conductor's to write (different git). Append the LAUNCHES row and #552 item 19.

## 12:41 — second worker death, cause found: earlyoom

`journalctl -u earlyoom`: at 12:41 memory hit the 6% SIGTERM limit; earlyoom killed two `rustc` processes (another project's build) and then the close-gates `claude` worker (360 MiB RSS), which was running a bare `vp run test:run`. Swap 4071/4096 MB used. The 12:33 loss of the conductor session and the first runtime is almost certainly the same cause.
#552 item 20: earlyoom runs with `--prefer ^(rustc|cargo|…|codex|claude|playwright|java)$`. `node` is not in the list, so when vitest's node workers eat the memory, the 360 MiB agent dies and the workers live. The agent is the one process whose death loses work. Proposal to the owner (system config, not ours to edit): move `claude|codex` from `--prefer` to `--avoid` and add `node` to `--prefer`.
Mitigation in our hands: writers cap vitest at `--maxWorkers=2`, check `free -m` before heavy steps, and commit their log before each one (added to the resume brief).

## 12:46 — third worker death; the real cause is a RAM-backed /tmp

Relaunched writer (gen `fe395dbe`, session `57a22a09`) landed `d19a8f8a` + `b09efaea`, then earlyoom killed it at 12:46:42 as it began `test:run` — while following the memory rules. So the rules are not enough. Measured:
- `/tmp` is tmpfs and holds **6.0 GB**: `/tmp/cursor-sandbox-cache` 4.4 GB (another session's, not ours to touch), dead runtime `/tmp/vw277-66a81S` 990 MB, live runtime `/tmp/vw277-9OOVLK` 581 MB. tmpfs pages live in RAM and swap; that is why swap sits at 4095/4096 MB and earlyoom's swap condition is permanently true. Any dip under 6% RAM now kills a `claude`.
- A VisualMode session runs `cargo test` in bursts (four `rustc` at once); that supplies the dips.
#552 item 21: the harness runtime puts its XDG cache and data under `/tmp` — each runtime re-downloads a 224 MB claude build, a 204 MB vite-plus runtime and pnpm/uv caches into RAM. Proposal: root the runtime under `~/.cache/` (disk); keep only sockets in `/tmp`.
Conductor tried to delete the dead runtime's download caches (no transcripts); the permission classifier refused, so it is left for the owner.
Working around it: the conductor runs the chain walk as a detached plain script (`scratchpad/chain/walk.sh`, `--maxWorkers=2`, waits for 3.5 GB available, results in `status.txt`) so no agent has to be alive during the heavy steps. Writers relaunch once the results are on disk.
