# Playbook Checklists

The task order lives in
[`../COMPONENT_PLAYBOOK.md`](../COMPONENT_PLAYBOOK.md). Start there. Open only
the current task and its linked checklist so research, implementation, and
validation do not blur together.

Use [Component Validation Notes Template](./component-validation-notes-template.md)
as the working artifact for a component pass. Component notes live in
[`components/`](./components/).

Every pass also uses [Acceptance Gates](./acceptance-gates.md). The gates are
blocking and additive. Documentation/viewer parity, external authority,
upstream source, Solid idioms, accessibility/i18n, behavior, style,
React-vs-Solid harness parity, known-defect/regression protection, and
evidence/handoff must all be proven. Passing one gate never substitutes for
another.
Each gate must also have an explicit outcome summary in the component notes, so
the final status is visible without inferring it from scattered checklist rows.

## Parity Commit Closeout

Parity commits should end with a short closeout line or body paragraph that
records:

- gate/status changed;
- source/docs checked;
- tests/reports run;
- remaining blockers, or `none`.

Keep the closeout evidence-focused. Do not claim acceptance unless the
validation notes show every gate complete.

When a pass uses AI agents or parallel AI review, use
[Agent Workflow](./agent-workflow.md). Agents get narrow context packs and
produce structured evidence; the coordinator owns final status.

## Reading Order

Keep the process narrow:

1. Start with `COMPONENT_PLAYBOOK.md`.
2. Open the component notes.
3. Open only the checklist linked by the current task.

The playbook is the order of work, the component notes are the evidence, and the
checklists are prompts. Do not open every checklist up front.

## Scope Labels

- `Always`: use for every component pass.
- `Conditional`: use when the target has that layer or feature.
- `Source-driven`: use only when Task 0 or the source audit finds the behavior.
- `Reference`: consult only when a current task needs outside authority.

## Workflow Map

| Phase      | Scope         | Checklists                                                                                                                                                                                                                                         |
| ---------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Starting   | Reference     | [Source Index](./source-index.md), [Agent Workflow](./agent-workflow.md), [Comparison Process Backlog](./process-backlog.md)                                                                                                                       |
| Starting   | Always        | [Component Research](./component-research.md), [Official Docs And Viewer Parity](./official-docs-viewer-parity.md), [Acceptance Gates](./acceptance-gates.md), [Component Validation Notes Template](./component-validation-notes-template.md)     |
| Baseline   | Always        | [Route Harness](./route-harness.md)                                                                                                                                                                                                                |
| Audit      | Always        | [Upstream Source Map](./upstream-source-map.md), [Public API](./public-api.md), [Cross-Layer Source Audit](./cross-layer-source-audit.md), [Source Branch Coverage](./source-branch-coverage.md), [Solid Idioms And Reactivity](./solid-idioms.md) |
| Layer      | Conditional   | [State](./state.md), [ARIA](./aria.md), [Slots And Context](./slots-context.md), [Styling](./styling.md), [Solid Idioms And Reactivity](./solid-idioms.md)                                                                                         |
| Layer      | Source-driven | [Keyboard](./keyboard.md), [Focus](./focus.md), [Overlay](./overlay.md), [Forms And Validation](./forms-validation.md)                                                                                                                             |
| Layer      | Source-driven | [Collections, Async, And Virtualization](./collections-async-virtualization.md)                                                                                                                                                                    |
| Runtime    | Always        | [State Transitions And Timelines](./state-transitions.md), [Runtime Semantics And Lifecycle](./runtime-semantics-lifecycle.md), [Accessibility And I18n](./accessibility-i18n.md)                                                                  |
| Runtime    | Conditional   | [Interactions And Motion](./interactions-motion.md), [Geometry](./geometry.md)                                                                                                                                                                     |
| Evidence   | Always        | [Harness And Evidence Integrity](./harness-evidence-integrity.md), [Visual Regression](./visual-regression.md)                                                                                                                                     |
| Acceptance | Always        | [Known Defects And Regression Protection](./known-defects-regression.md), [Tests And Sign-Off](./tests-signoff.md)                                                                                                                                 |

## Depth Rule

Do the `Always` checks for every pass. Add `Conditional` and `Source-driven`
checks only when the component, docs, or upstream source requires them. Record
`not applicable` in validation notes instead of opening every detail doc.

`Source Branch Coverage` is not optional depth. It is the required proof that
the pass did not skip upstream behavior, style, or accessibility branches while
moving between files.

`Official Docs And Viewer Parity` is also required. The official S2 docs page
and interactive viewer must be inventoried so route controls, examples, and
documentation claims are checked against the public surface users see.

`External Authority And Standards` is required when docs, specs, accessibility
guidance, platform explainers, or articles can change the validation
obligations. These sources discover and constrain risk; installed source and
formal specs resolve authority.

`Solid Idioms And Reactivity` is a required gate, not a style preference. A
Solid implementation can match upstream behavior only when the port preserves
Solid's reactive props, lazy children, context owner tree, refs, and cleanup
semantics.

`Accessibility And I18n`, `Behavior State Machine`, and
`Style Source-To-Computed Parity` are required proof lanes. Keep their sections
present in every component note and mark individual rows `not applicable` when
the source proves they do not apply. They are not subsections that can be
satisfied by a source-summary paragraph or a screenshot.

The comparison harness is the final parity surface, not the only parity surface.
React-vs-Solid parity in our route is accepted only after the route itself
matches the live official docs/viewer and the Solid code has source and idiom
evidence.

`Known Defects And Regression Protection` is required before signoff. Search
existing notes, blockers, skipped tests, TODO/FIXME comments, focused failures,
comparison reports, and observed UI bugs. Known port bugs and unresolved harness
bugs keep the component partial, and fixed user-visible bugs need durable
regression assertions.

`Agent Workflow` is the required coordination model for multi-agent passes.
Do not let an agent's general confidence replace validation-note rows. Agent
handoffs must be copied into the notes as evidence, blockers, or changed file
paths.

`Interaction Dependency Map` is required when source shows that a prop, state,
context, environment value, or child composition affects a nested subpart. It is
how we avoid endless regression matrices: prove the React-vs-Solid delta for
the dependency instead of testing every possible prop combination.

## Examples

- [Button Validation Notes](./components/button-validation-notes.md)

## Known Misses

ComboBox and DatePicker showed the old process missed:

- async loading, filtering, loading-more, and empty states;
- virtualized list layout and loader row geometry;
- localized live-region announcements;
- hidden form value modes and reset behavior;
- provider/form/portal context inheritance;
- Solid-specific eager child reads, context boundary mistakes, getter
  snapshots, and stale render props;
- imperative refs and consumer handler composition;
- transient interaction and cleanup states.

These are covered by the task order. They are not permission to broaden every
component beyond its source-backed behavior.

Button also showed that a strong source audit can still be too implicit. Future
passes must keep a branch ledger so every upstream branch is either tested,
ported differently with evidence, not applicable with a reason, or recorded as
a gap before acceptance.

Button pending spinner also showed that standalone prop screenshots are not
enough. `pending` and `staticColor` were tested separately, but upstream wired
`staticColor` into the nested `ProgressCircle`. Future passes must record that
kind of coupling in the interaction dependency map and cover it with a minimal
subpart contract.

Calendar also showed that layout bugs can hide inside otherwise green visual
evidence. Extra grid columns, clipped content, overlay placement, focus-ring
geometry, and responsive math need explicit geometry assertions when upstream
layout depends on them.
