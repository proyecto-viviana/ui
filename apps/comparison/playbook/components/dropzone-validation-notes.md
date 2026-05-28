# DropZone Validation Notes

Date: 2026-05-28
Status: accepted

## Target

- Component: DropZone
- Slug: `dropzone`
- Family or direct subcomponents: S2 `DropZone`, React Aria Components
  `DropZone`, Solidaria `DropZone`, `DropZoneContext`,
  `IllustratedMessageContext`, `FileTrigger`/hidden drop button behavior, and
  drag/drop events.
- Pass goal: accept DropZone under the current gate model using the already-live
  comparison route, modeled S2 controls, drag/drop behavior evidence, root
  source-to-computed parity, and explicit callback/a11y coverage.

## Task Status

| Task                   | Status   | Evidence                                                                                        |
| ---------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| 0 Research             | complete | S2 MCP docs, installed S2 source, Solid Spectrum source, Solidaria headless source, route spec. |
| 1 Baseline             | complete | Parity report showed only missing validation-note coverage for DropZone.                        |
| 2 Route harness        | complete | React/Solid fixtures, `dropzone-demo.ts`, component controls, and `dropzone-visual.spec.ts`.    |
| 3 Source map/API       | complete | S2 source props, Solid S2 owner file, Solidaria drag/drop owner file, and browser contract.     |
| 4 Cross-layer audit    | complete | Size, filled state, replacement banner, accessible label, drop events, context, styles.         |
| 5 Transitions          | complete | Drag enter/over/leave/drop, filled target state, and callback count transitions covered.        |
| 6 State                | complete | Drop-target state and filled replacement state covered in package and browser tests.            |
| 7 ARIA hooks           | complete | Headless drop zone root and hidden button naming behavior covered.                              |
| 8 Headless             | complete | Solidaria DropZone owns drag/drop event behavior and context merging.                           |
| 9 Styled S2            | complete | S2 generated root and banner styles compared by computed contract and strict pair diff.         |
| 10 Runtime lifecycle   | complete | Route listeners clean up; drag target state sync is bounded to render-prop changes.             |
| 11 Harness integrity   | complete | React fixture imports S2 directly; Solid fixture imports the public Solid Spectrum API.         |
| 12 Comparison evidence | complete | Focused package and Playwright tests cover root, controls, drag target, and callbacks.          |
| 13 Acceptance          | complete | No DropZone-owned blockers remain.                                                              |

## Agent Workflow

No subagents were used for this component pass.

| Agent role | Files read                                                                                                   | Files changed                                                                                  | Evidence added                                                         | Commands run                                                 | Blockers | Next owner |
| ---------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------ | -------- | ---------- |
| main       | S2 docs/source, Solid S2/Headless source, React/Solid fixtures, component controls, visual matrix, e2e spec. | `dropzone-validation-notes.md`, component notes `README`, DropZone visual spec capture helper. | Current-gate note tying existing route, package, and browser evidence. | Focused DropZone package test, Playwright, parity, vp check. | none     | none       |

## Acceptance Gate Checklist

- [x] Official Docs And Viewer Parity
- [x] External Authority And Standards
- [x] Upstream React Source Parity
- [x] Solid Idiomatic Implementation
- [x] Accessibility And I18n
- [x] Behavior State Machine
- [x] Style Source-To-Computed Parity
- [x] React-Vs-Solid Comparison Harness Parity
- [x] Known Defects And Regression Protection
- [x] Evidence And Handoff

## Gate Outcome Summary

| Gate                                     | Outcome  | Evidence                                                                                                                                                                | Blockers/owner |
| ---------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Official Docs And Viewer Parity          | complete | S2 DropZone docs checked on 2026-05-28. Route models the visible S2 viewer/API demo axes: `size`, `isFilled`, `replaceMessage`, and accessible `aria-label`.            | none           |
| External Authority And Standards         | complete | React Aria Components DropZone behavior is the platform owner; no APG widget pattern exists beyond drag/drop target semantics and button accessible naming.             | none           |
| Upstream React Source Parity             | complete | Installed S2 `DropZone.tsx` branches for size, filled banner, drop-target classes, unsafe/style props, context, formatter, and RAC wrapper are mapped to Solid.         | none           |
| Solid Idiomatic Implementation           | complete | Solid uses accessors for route props/theme/counts, lazy children through context providers, Solid ref/context merge helpers, and listener cleanup on fixture mount.     | none           |
| Accessibility And I18n                   | complete | Hidden drop button accessible name, root ARIA runtime boundary, replacement message localization/defaulting, and context-provided IllustratedMessage state are covered. | none           |
| Behavior State Machine                   | complete | Browser tests exercise default, controlled route props, S/M/L sizing, filled drag target, drag enter/move/exit/drop, and activation/drop callback count updates.        | none           |
| Style Source-To-Computed Parity          | complete | Computed root style contract and strict pair diffs cover layout, border, radius, padding, color, drop-target background/border, banner styling, and illustration token. | none           |
| React-Vs-Solid Comparison Harness Parity | complete | React imports `@react-spectrum/s2` DropZone/IllustratedMessage; Solid imports public Solid Spectrum; both serialize and render identical route props and callbacks.     | none           |
| Known Defects And Regression Protection  | complete | Existing spec protects the S2 DOM filtering nuance, filled-state banner, callback counts, and exact visual parity for default and filled drag-target states.            | none           |
| Evidence And Handoff                     | complete | Focused package test, DropZone Playwright, parity audit, fixed-position strict screenshot capture, `vp check --fix`, `git diff --check`, and README refresh complete.   | none           |

## Research

- S2 docs: DropZone MCP page checked on 2026-05-28. Public example composes
  `DropZone`, `IllustratedMessage`, `Heading`, `Content`, `ButtonGroup`,
  `FileTrigger`, and a cloud-upload illustration.
- Installed upstream source:
  `apps/comparison/node_modules/@react-spectrum/s2/src/DropZone.tsx`.
- Solid owner files:
  `packages/solid-spectrum/src/dropzone/index.tsx`,
  `packages/solidaria-components/src/DropZone.tsx`, and
  `packages/solid-spectrum/test/DropZone.test.tsx`.
- External authority: React Aria Components DropZone is the behavior owner for
  drag/drop target state and hidden button behavior. No standalone APG pattern
  applies.
- Source disagreement: S2 docs/API list DOM/ARIA props broadly, while current
  React runtime does not expose every passed root attribute in this route. The
  browser-observed React runtime is the chosen authority, and Solid follows it.

## Official Docs And Viewer Parity

| Docs item        | Official setting/example                                  | Route/control                                                   | Status  |
| ---------------- | --------------------------------------------------------- | --------------------------------------------------------------- | ------- |
| Composition      | `DropZone` wraps `IllustratedMessage` with upload content | Route renders same child composition in both stacks             | passing |
| `size`           | `S`, `M`, `L`, default `M`                                | Side-panel radios in documented order                           | passing |
| `isFilled`       | Filled state shows replacement banner while dragging      | Side-panel switch plus filled drag-target browser test          | passing |
| `replaceMessage` | Optional string; default localized replacement text       | Side-panel text input and omitted-prop default branch           | passing |
| Accessible label | `aria-label` accepted by S2/RAC target                    | Side-panel text input drives hidden button accessible name      | passing |
| Drop callbacks   | `onDrop*` handlers                                        | Route count attributes assert activation/drop transitions       | passing |
| Viewer canvas    | Styled drop target with fixed width in docs example       | Comparison CSS only frames route row; component style owns root | passing |

| Route control    | Source surface          | Official values                        | Route values                 | Status  |
| ---------------- | ----------------------- | -------------------------------------- | ---------------------------- | ------- |
| `size`           | S2 docs/API/source      | `S`, `M`, `L`; default `M`             | `S`, `M`, `L`; default `M`   | matched |
| `isFilled`       | S2 docs/API/source      | boolean, omitted false                 | switch, default false        | matched |
| `replaceMessage` | S2 docs/API/source/i18n | string; omitted uses localized default | text, default omitted/empty  | matched |
| `ariaLabel`      | S2 API/RAC behavior     | string                                 | text, default `Upload files` | matched |

## Source Map And Public Contract

| Layer               | Upstream files                                              | Solid files                                                                                 | Status  |
| ------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------- |
| State               | RAC DropZone render props; S2 filled/banner branch          | Solidaria DropZone render props; Solid S2 drop-target signal                                | matched |
| ARIA hooks          | React Aria Components DropZone                              | `@proyecto-viviana/solidaria-components` DropZone                                           | matched |
| Headless components | `react-aria-components/DropZone`                            | `packages/solidaria-components/src/DropZone.tsx`                                            | matched |
| Styled S2           | `@react-spectrum/s2/src/DropZone.tsx`                       | `packages/solid-spectrum/src/dropzone/index.tsx`, comparison route, generated macro classes | matched |
| Comparison route    | Official S2 docs example and installed S2 component runtime | `dropzone-demo.ts`, fixtures, controls, visual matrix, and `e2e/dropzone-visual.spec.ts`    | matched |

- Public props/defaults: `children`, `size='M'`, `isFilled=false`,
  `replaceMessage` defaulting through localized S2 strings, `getDropOperation`,
  `onDropActivate`, `onDrop`, `onDropEnter`, `onDropExit`, `onDropMove`,
  documented ARIA label props, `slot`, `styles`, `UNSAFE_className`, and
  `UNSAFE_style`.
- Contexts/providers: `DropZoneContext` merges S2 props; DropZone provides
  `IllustratedMessageContext` with `isInDropZone`, `isDropTarget`, and `size`.
- Unsupported or intentionally outside S2 wrapper: React Aria render-prop
  children/class/style, `isDisabled`, hover handlers, and global DOM event props
  are intentionally outside the S2 public wrapper boundary.

## Behavior State Machine

| State/input              | Trigger                     | Expected React                                           | Expected Solid | Status  | Evidence                             |
| ------------------------ | --------------------------- | -------------------------------------------------------- | -------------- | ------- | ------------------------------------ |
| Docs default             | Route mount                 | M dashed drop target with upload IllustratedMessage.     | Same.          | matched | Strict default pair diff.            |
| Size branch              | Control/query S/M/L         | Root min-height/geometry and child context size update.  | Same.          | matched | Root contract loop across sizes.     |
| Filled idle              | `isFilled=true` before drag | Original child content remains visible.                  | Same.          | matched | Route controls and root contract.    |
| Filled drag target       | Drag enter/over             | Solid border/background, banner, data-drop-target true.  | Same.          | matched | Strict filled drag-target pair diff. |
| Drag exit                | Drag leave after valid drag | Exit count increments and target state settles.          | Same.          | matched | Callback browser test.               |
| Drop                     | Valid drop                  | Drop count increments once.                              | Same.          | matched | Callback browser test.               |
| Activation               | Hidden button click         | Activation count can update from the drop target button. | Same.          | matched | Callback browser test.               |
| Replacement message      | Custom or omitted prop      | Custom text or localized default appears while dragging. | Same.          | matched | Filled route and package tests.      |
| Invalid/global DOM props | S2 wrapper source boundary  | React Aria wrapper omits unsupported wrapper branches.   | Same.          | matched | API inventory and root contract.     |

## Accessibility And I18n

| Surface                                              | Upstream/current React                                           | Solid | Status  | Evidence                                     |
| ---------------------------------------------------- | ---------------------------------------------------------------- | ----- | ------- | -------------------------------------------- |
| Role/name/description/value                          | RAC target owns hidden button; route `aria-label` names button.  | Same. | matched | Browser contract and package query by role.  |
| ARIA references and generated IDs                    | Runtime root attribute forwarding follows current RAC/S2 output. | Same. | matched | Browser root contract.                       |
| Keyboard and focus                                   | Hidden button supplies activation affordance.                    | Same. | matched | Callback test clicks the hidden button.      |
| Disabled/read-only/required/invalid/hidden semantics | S2 wrapper omits `isDisabled`; no form-field states.             | Same. | n/a     | Source map.                                  |
| Form labels/help/error/reset/submit                  | Not a form field; file selection is delegated to FileTrigger.    | Same. | n/a     | S2 docs/source map.                          |
| Live announcements and cleanup                       | No route live region; drag/drop callbacks settle on target.      | Same. | matched | Browser transition test.                     |
| Forced colors/reduced motion/contrast/target size    | Static S2 target; focus/drop target styles are token driven.     | Same. | matched | Computed style contract.                     |
| Locale/direction/formatting/messages                 | Default replacement banner comes from S2 localized strings.      | Same. | matched | Solid package string formatter path and e2e. |
| Multiple instances                                   | Consumer-owned ids and route count attrs stay instance-local.    | Same. | matched | Route-local selectors and package tests.     |

## Style Source-To-Computed

| Style branch        | Upstream declaration                           | Solid owner                                     | Observable proof                                      | Status  |
| ------------------- | ---------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------- | ------- |
| Root flex layout    | `display:flex`, centered alignment, relative   | `dropzone` style macro                          | Browser computed style contract.                      | matched |
| Border/default      | dashed gray border, 2px width, large radius    | `dropzone` style macro                          | Default strict pair diff and computed contract.       | matched |
| Drop target         | solid blue border and blue background          | `dropzone` render-prop style branch             | Filled drag-target pair diff and computed contract.   | matched |
| Padding/box sizing  | 24px padding, border-box                       | `dropzone` style macro                          | Browser computed style contract.                      | matched |
| Banner              | absolute centered accent pill, white bold text | `banner` style macro                            | Filled drag-target pair diff and banner style fields. | matched |
| Illustration accent | DropZone context changes illustration token    | `IllustratedMessageContext` provider            | Browser contract reads `--iconPrimary`.               | matched |
| Unsafe/style props  | `UNSAFE_className`, `UNSAFE_style`, `styles`   | context/local merge and allowed style overrides | Package context/override test.                        | matched |

## Known Defects And Regression Protection

| Finding source       | Defect or risk                                                               | Class       | Blocking? | Regression evidence or owner                                                 |
| -------------------- | ---------------------------------------------------------------------------- | ----------- | --------- | ---------------------------------------------------------------------------- |
| Current audit        | DropZone was fully modeled but lacked a current-gate note.                   | docs gap    | no        | This note and README snapshot close validation-note coverage.                |
| Existing route pass  | S2 DOM/ARIA runtime forwarding differs from the broad API table.             | parity risk | no        | Root contract compares Solid to observed React runtime for all route states. |
| Existing route pass  | Filled drop-target state can regress visually without obvious DOM error.     | style risk  | no        | Strict filled drag-target pair diff covers banner and root visual changes.   |
| Current audit        | In-place interaction screenshots can produce a one-pixel clip-edge artifact. | harness     | no        | Strict screenshots now use fixed-position prepared capture for DropZone.     |
| Existing route pass  | Drag/drop callbacks are browser-event sensitive.                             | behavior    | no        | Callback test dispatches enter, move, leave, drop, and activation paths.     |
| Cross-component pass | IllustratedMessage must receive DropZone target context.                     | context     | no        | DropZone and IllustratedMessage package/browser evidence both cover it.      |

Canonical scenario smoke:

| Scenario           | React result                                 | Solid result | Status  | Evidence                      |
| ------------------ | -------------------------------------------- | ------------ | ------- | ----------------------------- |
| Empty drop target  | Upload illustration, heading, content.       | Same.        | matched | Default pair diff.            |
| Filled replacement | Banner appears only while target is active.  | Same.        | matched | Filled drag-target pair diff. |
| Route controls     | Controls update mounted props in both panes. | Same.        | matched | Prop-control browser test.    |
| Drop callback path | Callback counters update from drag/drop.     | Same.        | matched | Callback browser test.        |

Composition smoke:

| Composition context      | Upstream expectation                                 | Solid result | Status  | Evidence                         |
| ------------------------ | ---------------------------------------------------- | ------------ | ------- | -------------------------------- |
| IllustratedMessage child | Receives `isInDropZone`, `isDropTarget`, and `size`. | Same.        | matched | Package and browser contracts.   |
| DropZoneContext          | Context props merge and local props override.        | Same.        | matched | Solid package context test.      |
| Hidden button            | Accessible button name follows route label.          | Same.        | matched | Browser and package role checks. |

## Evidence

- `vp test run packages/solid-spectrum/test/DropZone.test.tsx`
  - focused DropZone package tests passed.
- `vp exec --filter @proyecto-viviana/comparison playwright test e2e/dropzone-visual.spec.ts --reporter=line`
  - DropZone browser tests passed.
- `vp exec --filter @proyecto-viviana/comparison tsx scripts/report-component-parity.ts`
  - DropZone no longer appears in missing validation-note coverage.
- `vp check --fix`
  - repo check passed after the documentation update.
- `git diff --check`
  - no whitespace errors.

## Blockers

| Label | Gate | Blocker | Owner/next action |
| ----- | ---- | ------- | ----------------- |
| none  | none | none    | none              |

## Handoff

- Status after this pass: accepted as of 2026-05-28.
- Remaining gaps: none owned by DropZone.
- Next ordered task: continue the validation-note backfill with NumberField.
