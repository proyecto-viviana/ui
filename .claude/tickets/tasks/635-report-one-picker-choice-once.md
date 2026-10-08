---
id: 635
type: task
title: "Report one Picker choice once"
created: 2026-10-08
parent: 24
priority: high
status: in-progress
history:
  - {
      state: open,
      at: 2026-10-08,
      note: "Owner added Visualmode D20 to the autonomous remaining-work program.",
    }
  - {
      state: next,
      at: 2026-10-08,
      note: "Prioritize duplicate selection callbacks in the next-RC Visualmode batch; reproduce native and listbox paths separately.",
    }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "Admit the registered Grok worker for isolated state, native, and listbox reproductions; conductor alone accepts and commits.",
    }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "Scalar callbacks share one changed-request decision in createSelectState. A controlled listbox click still notifies twice from Select option onClick queueMicrotask selectOption; that file is not admitted.",
    }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "Conductor admitted Select.tsx. Single-mode option onClick no longer queues a second setSelectedKey. Multiple recovery, native input and change, and createHiddenSelect stay. Awaiting release.",
    }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "Replacement generation ui-635-final-20261008 removes the whole SelectOption onClick fallback, including multiple mode. Refused multiple clicks and virtual clicks assert one request after the turn settles. Awaiting conductor review.",
    }
---

## Scope

UI owns Visualmode D20. A controlled Picker reportedly calls
onSelectionChange twice for one choice and reports the already selected key.
Inspect solidaria-components/src/Select.tsx, solidaria/src/select/createHiddenSelect.tsx,
and solid-stately/src/select/createSelectState.ts. Both native input/change
handlers and legacy callback deduplication need investigation. The request's
mirror-select/listbox explanation remains a hypothesis. Preserve the accepted
#125 readonly/null repair. Name exact source/test paths before dispatch; no new
API, dependency, consumer edits or blanket event suppression.

## Done when

One genuine pointer, keyboard or native-select choice reports the selected key
once. Choosing the current key reports no change. Controlled acceptance and
refusal, later distinct choices, uncontrolled use and form behavior remain
correct; no distinct user choice is lost to broad deduplication.

## Proof

Reproduce native input followed by change and listbox selection separately
against inherited code. Assert exact callback counts and keys, including
controlled refused/unflushed values and current-key selection. Cover headless
Select and styled Picker consumption, then existing full candidate gates.
Report published versions and installed-consumer proof, not predicted versions.

## Relationship

Child of #24, prioritized by #87 before next RC. Producer for Visualmode
#10162/#10163; CanvasEntryChoiceField drops duplicate reports or uses a plain
select. Related #125 value contract and #246 Picker journeys remain intact.
Source request: visualmode/visualmode/.agents/ui-requests-2026-10-07/D20-picker-reports-one-choice-twice.md.
Patch Changesets cover repaired owning layers; rollback is selection reporting.

## Admitted paths

Grok is the sole source implementer in the eligible main checkout; the
external conductor reviews and commits after the exact generation stops.
Source: `packages/solid-stately/src/select/createSelectState.ts`. Tests:
`packages/solid-stately/test/createSelectState.test.ts`,
`packages/solidaria/test/createHiddenSelect.test.tsx`,
`packages/solidaria-components/test/Select.test.tsx`,
`packages/solid-spectrum/test/Picker.test.tsx`, and
`packages/viviana-ui/test/Picker.test.tsx`. Also admitted: this ticket, generated
status and roadmap, `.changeset/picker-selection-once.md`, and `/tmp/ui-635-*`
evidence. Hook or component source repairs require explicit extension before
editing. Brief: `/tmp/ui-635-worker-2026-10-08.md`.

Conductor extension, 2026-10-08: the same registered worker generation
`6db422d7-65a8-434c-9f3d-1a1652f8435c` may also repair
`packages/solidaria-components/src/Select.tsx`. The isolated styled trace in
`/tmp/ui-635-trace.log` shows the first request through `createOption` /
`createSelectableItem` press-up and a second through the local option
`onClick` microtask fallback. Remove or narrow that redundant fallback only
after checking upstream and retaining pointer, keyboard, virtual click,
disabled, multiple-selection and controlled-refusal coverage. Restore exact
callback-count assertions in both styled tests; a payload-only assertion
does not prove D20. Extend the admitted changeset to the component package
if that source changes. No native-hook source extension is admitted.

Conductor handoff, 2026-10-08: generation
`6db422d7-65a8-434c-9f3d-1a1652f8435c` returned owned-stop `closed: true`.
Register `ui-635-final-20261008` as the sole replacement Grok source writer
in the same eligible main checkout, using
`/tmp/ui-635-final-review-pass-2026-10-08.md`. The exact admitted paths above
remain unchanged. Complete the refused multiple-selection regression and
remove the redundant option fallback if the upstream and interaction proof
hold; the earlier single-only repair and 188-pass result are preliminary.
The conductor alone accepts and commits after the replacement generation stops.

## Accepted local repair — 2026-10-08

The conductor accepted generation `35d948aa-639a-4d4a-aeb5-df4bcedf1248`
on base `0e5f6714fc9546307051cad803e155fc78ae6236`, then received its owned
stop with `closed: true`. Both scalar callbacks now share the changed-request
decision. SelectOption delegates selection to its press handling; the entire
redundant click fallback is removed, including multiple mode. Native input
and change remain supported independently.

Corrected-test old-source controls restored one product file at a time and
verified its saved digest afterward. The scalar refused-request regression
failed with the legacy callback twice (exit 1, 1 failure). The old component
failed refused single, virtual and refused multiple click regressions with
two requests each (exit 1, 3 failures). Final focused command:

```bash
vp test run packages/solid-stately/test/createSelectState.test.ts packages/solidaria/test/createHiddenSelect.test.tsx packages/solidaria-components/test/Select.test.tsx packages/solid-spectrum/test/Picker.test.tsx packages/viviana-ui/test/Picker.test.tsx --maxWorkers=1
```

Passed 190/190 across five files. Assertions cover current-key silence,
later refused retries, distinct requests, reentrancy, multiple toggles,
readonly input isolation, and native, pointer, keyboard and virtual paths.
Scoped format/lint and docs generation/check passed. Root typecheck retains
27 inherited diagnostics outside these owners; it is not a passed gate.
The conductor independently matched all 11 final receipt file digests.
Source SHA256: state `25c9f9641cf31b779c900d6cc2b496c50607af03cedcf9e4af5f48afa433d4dd`;
component `96d03314d89b47c8f53698a1481060347f48f139f011dae12f18551afe8c26ef`.

Receipt: `/tmp/ui-635-worker-result-2026-10-08.md`; old-source logs
`/tmp/ui-635-control-state.log` and `/tmp/ui-635-control-component.log`;
final tests `/tmp/ui-635-final-tests.log`. Candidate certification, native
qualification, publication and installed-consumer proof remain outstanding.
