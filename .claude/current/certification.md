---
kind: reference
status: current
---

# Evidence Bar

Status: live reference.
Update when: the evidence dimensions, acceptance gates, or gate commands change.

This file keeps its historical name for link stability. It defines what
"ported" means in this repo and what evidence has to exist before a component
can be accepted as ported.

The per-component task runner is
`../../apps/comparison/COMPONENT_PLAYBOOK.md`; the per-component checklist is
`../../apps/comparison/playbook/acceptance-gates.md`. This page explains the
bar those documents enforce.

## What "ported" means

A component is ported only when its behavior matches the upstream contract along
**every** dimension below, with regression coverage that would fail if the
behavior drifted:

- **API** — props, defaults, slots, contexts, refs, exports, and unsupported
  branches map to upstream.
- **ARIA & accessibility** — native element, role, computed
  name/description/value, ARIA references, forced colors, target size.
- **Keyboard & focus** — key model, focus order, focus-visible, focus return,
  focus-not-obscured.
- **Forms & validation** — labels, help/error text, validation state, hidden
  inputs, reset, submit.
- **Behavior & timing** — controlled/uncontrolled, event ordering, callback
  payloads, overlay/transition/cleanup timing.
- **Styling** — S2 tokens and style branches traced from source to computed
  output (ADR 0001).
- **Visual parity** — React-vs-Solid pair diffs / computed contracts for each
  rendering-affecting branch.
- **I18n** — locale, direction (RTL), number/date/calendar formatting, hour
  cycle, message catalogs.

## Floors, not the bar

These are necessary and nowhere near sufficient. None is acceptance:

- An **export exists** → the name is in the barrel. Proves nothing about
  behavior.
- A **route renders** → the harness mounts something. Proves plumbing, not
  parity.
- **axe is green** → smoke only. It cannot see keyboard, focus, names,
  announcements, or validation.
- A **unit test passes** → necessary, but a single unit test is not the behavior
  contract.
- A **screenshot is stable** → a settled frame; it cannot see transitions,
  timing, or cleanup.

## Checks

Floors (fast, run constantly):

```bash
vp run check              # format, lint (type-aware), typecheck
vp run test:run           # package unit/integration suites (vitest)
vp run a11y:check         # axe AA + comparison a11y + smoke
```

Component-level evidence:

```bash
vp run comparison:test:pair        # React-vs-Solid pair diffs
vp run comparison:test:contract    # computed-style/attribute contracts
vp run comparison:test:a11y        # comparison axe + a11y surface
vp run comparison:test:<component> # focused keyboard/focus/forms/announcements
```

Repo-level guards and reports:

```bash
vp run comparison:report:parity:strict   # expected to pass; in-scope failure blocks
vp run comparison:report:gaps
vp run comparison:report:exports
vp run guard:rac-parity
vp run guard:rac-export-gap
vp run guard:dnd-keyboard-parity
vp run guard:virtualizer-keyboard-parity
vp run guard:upstream-test-parity   # contract-vocabulary diff vs the pinned upstream test suites
```

## The acceptance gates

`../../apps/comparison/playbook/acceptance-gates.md` defines ten additive gates —
Official Docs & Viewer Parity, External Authority & Standards, Upstream React
Source Parity, Solid Idiomatic Implementation, Accessibility & I18n, Behavior
State Machine, Style Source-to-Computed Parity, React-vs-Solid Comparison Harness
Parity, Known Defects & Regression Protection, Evidence & Handoff. They are
**additive**: one gate never substitutes for another. A component is `accepted`
only when every in-scope gate is `complete`; otherwise it is `partial` or
`not-started`. Each component's validation note
(`../../apps/comparison/playbook/components/`) carries the gate outcome table and
the evidence.

`guard:upstream-test-parity` mechanizes a first-pass triage for **Gate 3 (Upstream
React Source Parity)**: it diffs the ARIA-contract vocabulary our tests assert
against the pinned upstream React Aria Components + S2 suites and ranks where we
diverge. It is a discovery aid, not a floor. Every flag is reconciled against the
authoritative source before a test changes (see `upstream-sync.md`, which also
defines how new upstream releases are absorbed).

## Refresh

Status is refreshed from commands and reports; the snapshot lives in `status.md`.
