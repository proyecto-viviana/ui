---
id: 196
type: task
title: "Put consumed-prop pair assertions on the contract gate"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
---

## Cause

`comparison:test:contract` runs `styled-contract.spec.ts` plus the Button
family. The styled contract asserts `data-comparison-contract`, slug, layer,
framework, and canvas visibility (`apps/comparison/e2e/styled-contract.spec.ts:19-59`);
it reads no props, callbacks, or DOM, while `certification.md:86` calls it
"computed-style/attribute contracts". `modeled-controls-contract.spec.ts`
drives controls and `toMatchObject`s the serialized JSON on both roots — the
playbook already calls that plumbing, not consumption
(`harness-evidence-integrity.md:19-24`) — and it is not in the CI script.

The Button fixtures are not equivalent on pending: React `onPress` always
increments `data-comparison-action-count`; Solid increments only when
`!props.isPending` (`apps/comparison/src/components/solid/fixtures/styled.tsx:5619`,
`react/fixtures/styled.js:2295`). A pair that reads that attribute compares
fixture policy, not S2.

## Work

Add to the CI contract script assertions that both frameworks _consumed_
the driven props (DOM attribute / computed value / callback log per control),
align the Button fixture pending policy to one rule, and correct the
`certification.md` sentence.

## Done when

A fixture that serializes a prop but ignores it fails `comparison:test:contract`;
React and Solid Button fixtures increment on identical conditions.

## Relationship

F-HARNESS-005. Not #182 (harness repair).
