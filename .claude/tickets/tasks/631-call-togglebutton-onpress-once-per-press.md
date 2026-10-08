---
id: 631
type: task
title: "Call ToggleButton onPress once per press"
created: 2026-10-08
parent: 24
priority: high
status: in-progress
history:
  - {
      state: open,
      at: 2026-10-08,
      note: "Owner requested reproduction, tested repair, and release reporting for Visualmode's October requests.",
    }
  - {
      state: next,
      at: 2026-10-08,
      note: "Queued with the top Visualmode consumer work before the next RC, following active source work and qualification blockers.",
    }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "Admit registered worker: packages/solidaria/src/button/createToggleButton.ts; packages/solidaria/test/createButton.test.tsx; packages/solidaria-components/test/ToggleButton.test.tsx; packages/solid-spectrum/test/ToggleButton.test.tsx; one solidaria patch changeset and generated status/roadmap. Reproduce exact callback count before repair; verify pointer, modifiers, keyboard, controlled and disabled behavior. No Viviana UI ToggleButton test file currently exists; use existing owning layers without inventing a source fix in a skin.",
    }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "Local proof only. createToggleButton replaces onPress instead of chaining it. Focused tests 90/90. vp run typecheck exits 2 with 27 inherited errors and none in this hook. Release gates, publish, and Visualmode install were not run.",
    }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "Recovery after the owned runtime and earlier proof logs were lost. The worktree hook was still the inherited DOM mergeProps chain. Focused vp test run of the three owning test files failed 7 and passed 83 (90) against that hook, then passed 90/90 after Solid merge last-wins onPress. Root typecheck still exits 2 with 27 inherited errors and none in this hook. Awaiting release. Full candidate, SSR, browser, publish, and Visualmode install were not run. No commit.",
    }
---

## Scope

UI owns Visualmode D17. A ToggleButton on UI 0.8.0-rc.0 calls onPress twice,
undoing Shift selection. Current createToggleButton wraps the original handler
then merges it with that handler again. Match the pinned useToggleButton
ordering while preserving reactive props. Inspect the owning hook and the
headless/styled consumers; name exact source/test paths before dispatch.
No new API, dependency, or consumer-repository edits.

## Done when

One pointer, Shift-click, Enter, or Space press calls onPress once and
onChange once in upstream order. Controlled, uncontrolled, and disabled
behavior remains correct. Meaningful regressions fail against inherited code.

## Proof

Strengthen the exact-count hook assertion in solidaria/test/createButton.test.tsx;
cover modifier preservation and both headless/styled ToggleButton consumption.
Record pre-fix failure and post-fix commands/revision. Qualify the actual release
candidate through existing full gates; report published fixing versions and
installed-consumer verification, rather than a predicted release.

## Relationship

Child of #24, prioritized by #87 alongside #632 and existing Visualmode fixes.
Producer for Visualmode #10156. Source request in the hub:
visualmode/visualmode/.agents/ui-requests-2026-10-07/D17-togglebutton-calls-onpress-twice.md.
The Layers dock temporarily uses ActionButton with aria-pressed (b7c5fd0e4).
Patch Changeset in the owning package; rollback stays within button behavior.
