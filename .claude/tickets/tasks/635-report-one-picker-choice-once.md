---
id: 635
type: task
title: "Report one Picker choice once"
created: 2026-10-08
parent: 24
priority: high
status: next
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
