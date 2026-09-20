# Conductor notes not yet in the repo (writer seat held by green-main)

Write these into the repo in ONE commit as soon as the writer seat is free.

## LAUNCHES.md rows to add

| worker | kind | model | pane | generation | delivery | brief |
| --- | --- | --- | --- | --- | --- | --- |
| green-main | claude | claude-opus-5 | w5:p1 | cccef482-f3f8-4ac7-803e-8af037e9fd8a | a16bb98a-6578-49e4-93dd-dc99cb048940 | .agents/green-main-2026-09-20.task.md |
| draft-readmes | claude | claude-opus-5 | w6:p1 | ddfcb80a-fabc-41b2-869a-9909f2bdcc4e | 10b9f190-0732-4511-b171-0944f428e043 | .agents/draft-readmes-2026-09-20.task.md (untracked until committed) |

State: audit-gates finished 11:53 and was stopped ~12:40 (artifact complete, 514 lines).

## VERIFIED.md rows to add (all reproduced from source by the conductor, 2026-09-20)

Lens 2:
- certified spec load error passes gate — CONFIRMED (no onError; continue-on-error; merge only waiverGateFails)
- no case-count floor — CONFIRMED
- knownDivergences unpoliced — CONFIRMED (certified-waivers.json is [])
- CI retries hide flaky — CONFIRMED
- guard:release-prerequisites checks nothing — CONFIRMED by running it: "SKIP kumo … PASS", exit 0; config lists only kumo
- guard:publish-drift diffs src only — CONFIRMED (check-publish-drift.mjs:94-99)
- npm unpinned in release job — CONFIRMED (release.yml:58 `npm@^11.5.1`)
- Changesets Check pull_request-only — CONFIRMED
- comparison:test:* scripts never called by a workflow except certified-waivers + journeys-driver — CONFIRMED

Lens 5 (all five CONFIRMED against upstream source):
- FocusScope.tsx:395 `[data-react-aria-top-layer]` vs toast region `data-solidaria-top-layer`
- Modal.tsx:490-507 one-off overflow:hidden instead of createPreventScroll (upstream useModalOverlay.ts:65-67)
- createOverlay onBlurWithin lacks isElementInChildOfActiveScope (upstream useOverlay.ts:148-161)
- createOverlay lacks lastVisibleOverlay tracking and preventDefaults on start (upstream useOverlay.ts:100-126)
- createPreventScroll.ts:160-167 style tag without nonce (upstream usePreventScroll.ts:139-150)
- EXTRA seen while verifying: createOverlay has a document-level `focusin` close listener that upstream useOverlay does not have — check whether invented.

Lens 1 (not yet verified by conductor): ButtonGroup children dependency dropped (2 twins); createToastRegion header squashed; 12 dead imports.

## Certification Gates fast job red — cause found

`guard:attribution-headers` exit 1: "Reviewed local source: mismatch 63" + "Exact-source header: mismatch 1" + 11 generated-unresolved ui-icons.
`scripts/attribution-local-reviews.json` pins 254 local files by contentSha256; the Solid 2 codemod + format pass changed bytes.
Fix = re-review each of the 63 (diff since the commit where the hash last matched must be codemod/format only), then re-hash. Writer-seat task.

## #552 friction items to log

13. A ticket edit makes two generated board views stale; `docs:generate` must ride in the same commit (pure mechanical coupling — generate in the pre-commit hook instead?).
14. `vp run check` on a dirty tree does not prove HEAD (two dirty files hid a format failure). CI-parity check needs a clean tree or `git stash`-free worktree.
15. The one-writer rule's real cause is the shared index + the pre-commit hook stashing unstaged tracked changes. Untracked files under `.agents/` are safe (formatter ignores `.agents/**`, lint-staged leaves untracked alone) — so read-only lenses and out-of-tree drafters can run beside a writer. Worktrees with disjoint paths are the sanctioned escape (visualmode exception); propose the same for ui docs work.
16. Claude Code "bashEditDiff" credits a concurrent session's file change to whichever Bash call was running — a read-only auditor's pane showed "Updated apps/web/package.json". Cosmetic, but it looks like a rule breach; verify via transcript tool_use, not the pane.
17. Attribution local-review contract hashes raw bytes of 254 files, so any formatter or codemod run turns the gate red with zero licence signal. Proposal: hash a normalised form (strip whitespace + import lines) or key the review on "no Adobe header + no upstream counterpart" instead of bytes.
18. AGY: CLI has `--sandbox` and `--dangerously-skip-permissions`; harness exposes neither. Grok is launched always-approve, Codex has sandbox/approval flags, AGY has nothing → unusable unattended. Proposal: public `sandbox` start flag for agy, auto-approve only under sandbox.

## Writer queue (serial)

1. green-main (running) — .agents/green-main-2026-09-20.task.md
2. close-gates — plan/close-gates-2026-09-20.task.md (needs ticket #553 minted first)
3. cert-fast-green — attribution re-review (above)
4. audit-fixes — lens1 HIGH ButtonGroup ×2, toast JSDoc, dead imports + noUnusedLocals, lens5 ×5, Popover Portal ref
5. land #548 drafts from .agents/drafts-548/

## Added 12:10 — state and verifications

Pushed: `dd634d36` + `d7bcadf5` (origin/main = `d7bcadf5`). audit-codemod and audit-a11ysec finished and were stopped.
Writer got the createResource decision (`.agents/green-main-2026-09-20.decision-createResource.md` + `refresh-probe.mjs`, untracked; writer commits them).
Cause of writer's failed probe: Solid 2 `createMemo(compute, options)` — a third argument is ignored, so `loadingValue` never applied.

VERIFIED.md rows (conductor reproduced from source 12:05):
- lens1 HIGH ButtonGroup children dependency dropped ×2 twins — CONFIRMED (pre `local.children` at :161; upstream ButtonGroup.tsx:157 deps include children). Comment's justification is wrong for a two-arg createEffect compute? — check when fixing: reading children in compute instantiates JSX; upstream observes parent only.
- lens5 HIGH createDialog uses createUniqueId not createSlotId — CONFIRMED (upstream useDialog.ts:56-60 useSlotId)
- lens5 MEDIUM createId skips createUniqueId when defaultId given — CONFIRMED (ssr/index.tsx:90-93); twin solid-stately/src/ssr/index.ts:49-54
- lens5 MEDIUM openLink assigns window.location instead of dispatching on the anchor — CONFIRMED (dom.ts:572-590 vs upstream openLink.tsx:106-144; RouterProvider.tsx:112-123 already has the faithful copy)
Not yet verified: lens5 web Worker security headers, style-macro new Function (informational), Modal ariaHideOutside non-reactive ref (UNPROVEN by the lens itself), lens1 MEDIUM createTrackedEffect debt (185 sites, informational → ticket).

audit-fixes queue, final order: Modal createPreventScroll → FocusScope top-layer attr + isElementInChildOfActiveScope → createOverlay lastVisibleOverlay/no preventDefault (+ check invented focusin listener) → createDialog createSlotId → ButtonGroup ×2 → openLink → createId ×2 → Popover Portal ref → createToastRegion JSDoc → dead imports + noUnusedLocals → _s2Cleanups early-return guard → style nonce. apps/web Worker headers ride with #549.
New ticket to mint with #553: "#554 retire createTrackedEffect residue" (185 sites, post-RC, not a blocker).

## Added 12:20 — lens 3 launched, budget change

LAUNCHES.md row: | audit-consumer | grok | default | (see engine list) | 44ec8683-dbe7-40a0-91a6-c38f0c8c9174 | 539809fa-f9bb-4122-bb00-44cacb885e7f | .agents/audit-2026-09-20/lens3-consumer.task.md |

Owner 12:18: usage 92% Fable / 82% Opus used, 13.5 h left. Fable is the scarce one → the next writer lands these notes itself (close-gates slice "L"), conductor wakes only on worker completion.

Peers policy (conductor default, owner may veto): no `allowAny solid-js`; ratcheting allowlist guard `scripts/check-peers.mjs` + `scripts/expected-unmet-peers.json`; audits always run. It is close-gates slice 0.

Tickets to mint (mirror the frontmatter of `.claude/tickets/tasks/551-*.md`, parent initiative #544):
- #553 "Close the fail-open release gates the audit found" — done when every slice of `.agents/close-gates-2026-09-20.task.md` is committed or named under Left red with evidence; source `.agents/audit-2026-09-20/lens2-gates.md`.
- #554 "Retire the createTrackedEffect residue of the Solid 2 codemod" — 185 calls in 101 files under packages/*/src use a primitive Solid 2 deprecates; convert to `createEffect(compute, effect)` / `onSettled` per site with its test; post-RC, not a release blocker; source lens1-codemod.md.
- #555 "Fix the overlay, dialog and link defects the audit confirmed" — the audit-fixes queue above; each fix mirrors upstream with a red→green test and a changeset; RC blocker for the three overlay HIGHs + createDialog + ButtonGroup.

## Added 12:35 — green-main ended, AGY runs headless, build:web decision

green-main exited clean at 12:24 (tree clean). Commits through `9e0167cb` reviewed and pushed (origin/main = `9e0167cb`). draft-readmes finished (all six deliverables on disk under `.agents/drafts-548/`) and was stopped.

`build:web` blocker verified from tarballs: `@solidjs/web` rc.9 (2026-09-18) renamed `parseServerFunctionUrl`/`serverFunctionUrl(id)` to `parseServerFunctionActionUrl`/`serverFunctionActionUrl(id)`; `@tanstack/solid-start@2.0.0-rc.8` uses the old names in one file. Decision: `pnpm patch` keyed to the exact version (`.agents/green-main-2026-09-20.decision-solid-start-patch.md`), close-gates slice P.

Owner 12:20: AGY runs with `--dangerously-skip-permissions`, on clear, simple, small tasks only. The harness cannot pass the flag (`os/packages/providers/src/engine/driver.ts` agentArgs has no agy option for it), and adding it needs a runtime restart that would kill live workers. So the harness `audit-claims` pane was stopped and lens 4 was split into three small read-only tasks run headless from the ui root:
`agy --dangerously-skip-permissions --print="Read <abs task file> and do exactly what it says."` (the prompt must be attached to `--print=`; a bare `--print` eats the next flag as its prompt).

LAUNCHES.md rows (outside the harness, no pane, no generation):
| lens4a-site-claims | agy | default | headless | — | — | .agents/audit-2026-09-20/lens4a-site-claims.task.md |
| lens4b-site-examples | agy | default | headless | — | — | .agents/audit-2026-09-20/lens4b-site-examples.task.md |
| lens4c-links | agy | default | headless | — | — | .agents/audit-2026-09-20/lens4c-links.task.md |
The superseded `lens4-claims.task.md` produced nothing.

#552 item 18, amended: harness proposal is one public start flag for agy, `--unattended`, mapping to `--dangerously-skip-permissions`, refused unless the task file is under 60 lines — the owner's "small tasks" rule made mechanical. Do it when no worker is live.

LAUNCHES.md row: | close-gates | claude | claude-opus-5 | (see engine list) | 3f8f63dc-d92b-451b-adc5-1d1c93c70794 | 0cda25f0-1fcc-482a-8cca-64e41df9e378 | .agents/close-gates-2026-09-20.task.md |
