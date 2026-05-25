# Comparison Process Backlog

These tasks come from process reviews and are not component acceptance evidence
by themselves. Keep component status tied to validation-note gate outcomes.

## Pending

| Task                                                                                                                                                                                                                                                                  | Owner area                   | Blocks                     |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | -------------------------- |
| Replace or remove the comparison coverage `api` and `behavior` metrics. `api` should come from an upstream-vs-Solid prop/type diff, and `behavior` should come from focused evidence that actually ran for the slug.                                                  | comparison reports           | honest page/status metrics |
| Derive manifest/page status from the component validation note gate outcome table, or enforce a single status source with validation.                                                                                                                                 | comparison manifest          | manifest/note agreement    |
| Close the strict component parity audit gaps from `vp run comparison:report:parity`: every official S2 catalogue entry needs route/sidebar coverage, live fixtures when marked live, modeled viewer controls, validation notes, and current visual/asserted evidence. | comparison app/playbook      | 100% component parity      |
| Render real public API evidence on component pages: prop name, type, requiredness/default, description when available, and status from the API diff. Until then, label `apiProps` as tracked inventory only.                                                          | comparison pages/API tooling | API parity claims          |
| Add an `apiProps` drift script that compares hand-maintained `apiProps` arrays against installed upstream S2 prop interfaces and Solid public prop interfaces.                                                                                                        | comparison scripts           | public API gate automation |
| Remove or demote tautological `data-comparison-control-props` equality assertions from parity summaries. Keep them only as route-plumbing checks and pair them with DOM/style/a11y/interaction assertions.                                                            | comparison e2e               | harness evidence integrity |
| Finish the app-side S2 macro source-condition proof after the Vite Plus package-build checkpoint: prove comparison-app CSS chunking with `macros.vite()`, then remove any remaining legacy runtime CSS path only after package and app CSS emission are exhaustive.   | solid-spectrum build system  | complete S2 CSS parity     |
| Audit Button-family ref typing and provider/form prop inheritance against upstream `FocusableRef`, `DOMRef`, `useSpectrumContextProps`, and `useFormProps` behavior.                                                                                                  | Button-family component pass | public API/runtime parity  |
| Revalidate Divider public type surface against upstream, including `DOMRefValue`, `StyleProps`, `UNSAFE_className`, `slot`, `render`, and inherited global DOM omissions.                                                                                             | Divider component pass       | public API parity          |
| Add a commit-message closeout rule for parity commits: gate changed, source/docs checked, tests run, and remaining blockers.                                                                                                                                          | contributor process          | audit trail                |

## Done

| Task                                                                                                        | Evidence                                                                                                |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Add a known-defect/regression gate so accepted components cannot hide known user-visible bugs.              | `acceptance-gates.md`, `known-defects-regression.md`, validation-note template                          |
| State that serialized route props are route-plumbing evidence, not implementation parity.                   | `harness-evidence-integrity.md`, `route-harness.md`, validation-note template                           |
| State that hand-maintained `apiProps` are inventory until an upstream type/source diff proves the contract. | `public-api.md`                                                                                         |
| Mark components accepted before the known-defect/regression gate as prior-gate status until revalidated.    | `components/README.md`                                                                                  |
| Reject tsup as the package macro-CSS path and move `solid-spectrum` JS/CSS bundling to Vite Plus `vp pack`. | `packages/solid-spectrum/vite.config.ts`, `docs/comparison-docs-overhaul/07-build-time-css-strategy.md` |
| Restore the full `packages/solid-spectrum/test` package-wide regression gate after the Vite Plus migration. | `vp test run packages/solid-spectrum/test` passed 76 files / 918 tests.                                 |
