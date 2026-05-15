# Agent Workflow

Use this when a component pass involves AI agents or parallel AI review. Agents
are a way to narrow context and evidence, not a way to lower the acceptance
bar. The coordinator remains responsible for task order, component status, and
final gate decisions.

## Operating Rules

- One coordinator owns the component validation note, task order, blocker
  labels, and final `accepted`, `partial`, or `pre-pass` status.
- Step agents own one gate, layer, or proof lane. They do not accept a
  component by themselves.
- Each agent receives a narrow context pack. Do not give every agent the whole
  repo, every checklist, and an open-ended request to "check parity".
- Agent output must be structured evidence: table rows, source links, test
  commands, changed file paths, or blocker labels. "Looks equivalent" is not
  evidence.
- Implementation workers get disjoint write scopes. They must not edit outside
  their assigned package, route, or test files unless the coordinator expands
  ownership first.
- Verification and acceptance agents should try to disprove the pass. They
  should classify failures and blockers, not soften them.
- No agent may substitute one gate for another. Source parity, docs/viewer
  parity, Solid idioms, accessibility, behavior, style, harness parity, and
  evidence remain separate.

## Context Pack

Send each agent a compact packet in this shape:

```md
Component:
Slug:
Task:
Gate or layer:
Allowed files:
Do not touch:
Required playbook docs:
Required upstream/docs sources:
Recommended skills/tools:
Known blockers:
Required output:
Commands/tests to run:
Exit condition:
```

Keep context specific. Include the current validation note and only the
checklists, source files, docs pages, and tests needed for that agent's task.

## Role Matrix

| Role                          | Phase          | Context                                                             | Docs and skills                                        | Output                                                                                      | Writes                                      |
| ----------------------------- | -------------- | ------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Coordinator                   | All tasks      | Validation note, task runner, acceptance gates, current blockers    | Playbook docs                                          | Task plan, context packs, final status                                                      | Validation note and docs/report status only |
| Research agent                | Task 0         | Component target, source index, docs/viewer checklist               | React Spectrum S2, React Aria, APG/specs when relevant | Docs/viewer inventory, external authority notes, `none found` entries, source disagreements | Validation note only                        |
| Route harness agent           | Task 2         | Docs/viewer inventory, route files, controls, fixtures, focused e2e | React Spectrum S2, Playwright                          | Route/control gaps, default/control parity evidence, focused route tests                    | Comparison route/control/test files         |
| Source audit agent: state     | Tasks 3-4      | `@react-stately` files and Solid state owners                       | Installed source                                       | Branch ledger rows and gaps for state behavior                                              | None unless promoted to worker              |
| Source audit agent: ARIA      | Tasks 3-4      | `@react-aria` files and Solid ARIA owners                           | React Aria, installed source                           | Branch ledger rows and gaps for semantics, events, keyboard, focus, announcements           | None unless promoted to worker              |
| Source audit agent: headless  | Tasks 3-4      | RAC files and Solid headless owners                                 | React Aria Components, installed source                | Branch ledger rows and gaps for slots, contexts, data attrs, refs, forms, portals           | None unless promoted to worker              |
| Source audit agent: styled S2 | Tasks 3-4      | S2 source and Solid Spectrum owners                                 | React Spectrum S2 style docs/source                    | Branch ledger rows and gaps for style, structure, icons, geometry, motion                   | None unless promoted to worker              |
| Solid idiom agent             | Tasks 4, 8-9   | Solid files and Solid idiom checklist                               | Solid idioms checklist                                 | Reactivity, provider, children, render-prop, ref, cleanup risks                             | None unless promoted to worker              |
| Behavior state-machine agent  | Task 5         | Source branch rows, docs interactions, transition checklist         | Playwright for planned proof                           | `state/input -> trigger -> React -> Solid -> evidence` rows                                 | Validation note only                        |
| Accessibility agent           | Tasks 5, 7, 10 | ARIA rows, accessibility checklist, relevant specs/APG/WCAG         | React Aria, APG/specs, Playwright/axe smoke            | Role/name/description/value, keyboard/focus, forms, announcement, i18n, forced-color rows   | Tests only when assigned                    |
| Style proof agent             | Tasks 5, 9, 12 | S2 style branches, Solid style owners, viewer canvas conditions     | React Spectrum S2 style docs, computed style checks    | Source-to-computed rows and visual blocker classification                                   | Tests only when assigned                    |
| Implementation worker         | Tasks 6-9      | Assigned gaps and owned files only                                  | Package-specific source docs                           | Focused patch, changed paths, focused tests                                                 | Assigned files only                         |
| Verification agent            | Tasks 10-12    | Changed files, proof tables, focused tests, route                   | Playwright, package test tools                         | Commands run, failures classified, remaining blockers                                       | None unless assigned test fixes             |
| Acceptance reviewer           | Task 13        | Final validation note, acceptance gates, git diff, test output      | Tests and sign-off checklist                           | `accepted`, `partial`, or `pre-pass` recommendation with blockers                           | None                                        |

## Iteration By Task

| Task                   | Coordinator action                                                       | Preferred agents                                   |
| ---------------------- | ------------------------------------------------------------------------ | -------------------------------------------------- |
| 0 Research             | Create validation note, copy gates, assign context packs                 | Research agent                                     |
| 1 Baseline             | Capture reports and existing failures                                    | Coordinator                                        |
| 2 Route harness        | Ensure route can express docs/viewer surface before parity claims        | Route harness agent, route worker                  |
| 3 Source map/API       | Assign upstream/Solid owners                                             | Source audit agents                                |
| 4 Cross-layer audit    | Fill branch ledger and idiom risks                                       | Source audit agents, Solid idiom agent             |
| 5 Transitions          | Convert source/docs findings into behavior, a11y, and style proof tables | Behavior, accessibility, style proof agents        |
| 6 State                | Close state-owned gaps only                                              | State implementation worker                        |
| 7 ARIA hooks           | Close ARIA-owned gaps only                                               | ARIA implementation worker, accessibility agent    |
| 8 Headless             | Close composition-owned gaps only                                        | Headless implementation worker, Solid idiom agent  |
| 9 Styled S2            | Close styled-owned gaps only                                             | Styled S2 implementation worker, style proof agent |
| 10 Runtime lifecycle   | Prove browser-observable semantics and cleanup                           | Accessibility agent, verification agent            |
| 11 Harness integrity   | Prove evidence is stable and classify failures                           | Verification agent                                 |
| 12 Comparison evidence | Attach pair diffs, computed proof, timelines                             | Verification agent, style proof agent              |
| 13 Acceptance          | Check gates, blockers, reports, tests, and handoff                       | Acceptance reviewer, coordinator                   |

## Parallelism

Parallelize only when outputs do not block each other and write scopes are
disjoint.

- Good parallelism: state/ARIA/headless/styled source audits after Task 3
  owners are known.
- Good parallelism: accessibility and style proof planning after the source
  ledger identifies their branches.
- Good parallelism: verification of one layer while a different worker closes a
  disjoint gap.
- Bad parallelism: route implementation before docs/viewer inventory is known.
- Bad parallelism: multiple workers editing the same package files.
- Bad parallelism: an acceptance reviewer running before the validation note and
  proof tables are updated.

## Handoff Format

Every agent handoff should be short and structured:

```md
Role:
Task:
Files read:
Files changed:
Evidence added:
Commands run:
Blockers:
Next owner:
```

The coordinator copies material facts into the component validation note. Do not
leave evidence only in an agent transcript.

## Anti-Patterns

- One agent receives the whole repo and reports general confidence.
- An implementation worker edits docs, route, package code, and tests without
  declared ownership.
- A route screenshot is used to skip source, accessibility, behavior, or style
  proof.
- A blog post, platform explainer, or APG example overrides installed source
  without a recorded authority decision.
- A component is marked accepted with "future audit" gaps.
- The validation note says a gate is complete while the detailed table still
  has unchecked or unowned rows.
