import type { DriverScenario, TargetResolver } from "../drivers/scenario";
import { registerValidityDriver } from "../drivers/validity";

/**
 * Recertification march unit (family-level, cross-cutting dimension): NATIVE
 * CONSTRAINT VALIDATION for the S2 field family — the `validationBehavior="native"`
 * contract that no paint driver can observe.
 *
 * WHY A FAMILY UNIT. Every field unit in this directory certifies `isInvalid` as a
 * paint branch (D1 computed styles, D3 pixels, D6 AX tree, D7 contrast) and several
 * say so in as many words: "D8/D4/D2 are likewise unchanged by the invalid flag."
 * That claim is false. S2's default `validationBehavior` is `native`, so RAC's field
 * hooks call `useFormValidation`, which calls `setCustomValidity` whenever the field
 * is invalid. A filled-but-invalid React field therefore fails HTML constraint
 * validation (`validity.customError`, `validationMessage` "Invalid value.",
 * `:invalid`) and BLOCKS a form submit; the Solid port painted the identical red
 * field, passed every registered driver, and submitted the form.
 *
 * The defect class was found by a manual functional walk (#260), not by this
 * harness: before this unit, no comparison spec referenced `checkValidity`,
 * `customError`, `validationMessage`, `willValidate`, `:invalid`, or `requestSubmit`
 * anywhere in `e2e/`. Filed as #351 (TextField/SearchField), #355 (Checkbox),
 * #362 (DateField/TimeField), #368 (ColorField), #376 (RadioGroup) and #383 (native
 * Form submit). NumberField and ComboBox have the same hole and no ticket. This
 * unit is the durable regression protection those tickets' "Done when" clauses
 * ask for ("a comparison-route form walk fails if Solid submits an `isInvalid`
 * field"), and the pair oracle that would have caught all of them.
 *
 * HONESTY. Product gaps FAIL. This spec does not register `knownDivergences` /
 * `test.fixme` for remaining holes. The 2026-09-05 D14 rerun pair-matched
 * TextField, SearchField, Checkbox, NumberField (#460), ComboBox, Form #383 /
 * #465, and Radio #376 native custom validity + blocked submit. Radio
 * `invalid · submit attempt` stays red because React focuses `starter` and Solid
 * focuses `enterprise`. Wrapping that as skipped would keep Certification Gates
 * green the same way ListView `it.fails` keeps `test:hydrate` green. Resting
 * `isInvalid` + `customError` is a floor. The user-observable machine is native
 * submit + `displayValidation` / HelpText / `aria-invalid`. Both are asserted. A
 * green row with a successful Solid `requestSubmit` is a test bug.
 *
 * It lives as ONE unit rather than a config on each component's spec because the
 * dimension is shared: the hole is a missing `createFormValidation` call in whichever
 * `solidaria` hook a field happens to use (`createTextField`, `createToggle`,
 * `createRadio`, `createNumberField`, `createComboBox`), so the family is the honest
 * scope. Adding a field means adding a scenario here. The precedent is
 * `fielderror.certified.spec.ts`, which likewise drives another component's route to
 * certify one cross-cutting composite.
 *
 * WHAT D14 COMPARES is documented in `../drivers/validity.ts`. Two shapes:
 *   - `constraint validity` — the resting native verdict of every candidate control
 *     in the field root, plus the committed invalid UI (`aria-invalid`,
 *     `[data-invalid]`, which annotation row rendered).
 *   - `submit attempt` — a real `requestSubmit` (or a real click on the Form
 *     route's submit button) on a fresh page load, diffing whether the browser
 *     blocked the submit, where focus landed, and the error UI the blocked
 *     attempt committed.
 *
 * THE `disabled` EDGE is asserted on purpose, not as filler: `useFormValidation`
 * guards `setCustomValidity` on `!input.disabled`, and a disabled control is barred
 * from constraint validation entirely, so `invalid-disabled` must stay `valid: true`
 * / `willValidate: false` on BOTH stacks. A port that "fixed" invalid validity by
 * unconditionally calling `setCustomValidity` would pass the `invalid` case and fail
 * this one.
 *
 * NATIVE-ONLY BASELINES (`required-empty`) are the control group: `valueMissing`
 * comes from the browser, not from either port, so those rows were already matched
 * before any fix and must stay matched after. They prove the driver is measuring the
 * port's contribution and not just re-reporting UA behavior.
 */

const controlRoot = (slug: string) => `[data-comparison-control-root="${slug}"]`;

const rootTarget =
  (slug: string): TargetResolver =>
  ({ canvas }) =>
    canvas.locator(controlRoot(slug));

const requestSubmit = { cases: ["invalid"] as const };

/**
 * TextField — `createTextField` grew `createFormValidationState` +
 * `createFormValidation` in #351 (merged). This scenario is that fix's regression
 * lock, including the form walk the ticket's "Done when" asked for.
 */
const textFieldValidity: DriverScenario = {
  slug: "textfield",
  title: "TextField native validity",
  target: rootTarget("textfield"),
  states: ["default"],
  cases: [
    { id: "invalid", params: { isInvalid: "true" } },
    { id: "invalid-required", params: { isInvalid: "true", isRequired: "true" } },
    { id: "invalid-disabled", params: { isInvalid: "true", isDisabled: "true" } },
    { id: "invalid-read-only", params: { isInvalid: "true", isReadOnly: "true" } },
    { id: "required-empty", params: { isRequired: "true", value: "" } },
  ],
  validity: {
    cases: [
      "invalid",
      "invalid-required",
      "invalid-disabled",
      "invalid-read-only",
      "required-empty",
    ],
    submit: requestSubmit,
  },
};

/**
 * SearchField — same hook as TextField (`createSearchField` delegates). #351's
 * SearchField note. A shared TextField pass does not prove this route.
 */
const searchFieldValidity: DriverScenario = {
  slug: "searchfield",
  title: "SearchField native validity",
  target: rootTarget("searchfield"),
  states: ["default"],
  cases: [
    { id: "invalid", params: { isInvalid: "true" } },
    { id: "invalid-disabled", params: { isInvalid: "true", isDisabled: "true" } },
    { id: "required-empty", params: { isRequired: "true", value: "" } },
  ],
  validity: {
    cases: ["invalid", "invalid-disabled", "required-empty"],
    submit: requestSubmit,
  },
};

/**
 * Checkbox — the same hole in a different hook (`createToggle`), fixed by #355
 * (merged). Kept separate from TextField because a shared fix in one hook proves
 * nothing about the other; that is exactly how #355 came to be filed as its own
 * ticket after #351.
 */
const checkboxValidity: DriverScenario = {
  slug: "checkbox",
  title: "Checkbox native validity",
  target: rootTarget("checkbox"),
  states: ["default"],
  cases: [
    { id: "invalid", params: { isInvalid: "true" } },
    { id: "invalid-selected", params: { isInvalid: "true", isSelected: "true" } },
    { id: "invalid-disabled", params: { isInvalid: "true", isDisabled: "true" } },
    { id: "required-unchecked", params: { isRequired: "true" } },
  ],
  validity: {
    cases: ["invalid", "invalid-selected", "invalid-disabled", "required-unchecked"],
    submit: requestSubmit,
  },
};

/**
 * RadioGroup — #376 (merged) sets custom validity on every radio. Constraint
 * validity and blocked `requestSubmit` match. `invalid · submit attempt` stays
 * red because React focuses `starter` (the selected radio) and Solid focuses
 * `enterprise` (last radio). That is a focus-target gap, not a submit-succeeds
 * hole. Do not wrap it in `knownDivergences`.
 */
const radioGroupValidity: DriverScenario = {
  slug: "radiogroup",
  title: "RadioGroup native validity",
  target: rootTarget("radiogroup"),
  states: ["default"],
  cases: [
    { id: "invalid", params: { isInvalid: "true" } },
    { id: "invalid-required", params: { isInvalid: "true", isRequired: "true" } },
    { id: "invalid-disabled", params: { isInvalid: "true", isDisabled: "true" } },
    { id: "required-empty", params: { isRequired: "true", selectedValue: "none" } },
  ],
  validity: {
    cases: ["invalid", "invalid-required", "invalid-disabled", "required-empty"],
    submit: requestSubmit,
  },
};

/**
 * NumberField — #460 (merged) wired `createFormValidation` and native min/max/step.
 * D14 `invalid` / `invalid-disabled` / submit pair-match. min/max/step constraint
 * cases are not in this unit.
 */
const numberFieldValidity: DriverScenario = {
  slug: "numberfield",
  title: "NumberField native validity",
  target: rootTarget("numberfield"),
  states: ["default"],
  cases: [
    { id: "invalid", params: { isInvalid: "true" } },
    { id: "invalid-disabled", params: { isInvalid: "true", isDisabled: "true" } },
  ],
  validity: {
    cases: ["invalid", "invalid-disabled"],
    submit: requestSubmit,
  },
};

/**
 * ComboBox — `createComboBox` now calls `createFormValidation`. D14 `invalid`
 * constraint + submit pair-match. Distinct from #273 (native `required`).
 */
const comboBoxValidity: DriverScenario = {
  slug: "combobox",
  title: "ComboBox native validity",
  target: rootTarget("combobox"),
  states: ["default"],
  cases: [
    { id: "invalid", params: { isInvalid: "true" } },
    { id: "invalid-disabled", params: { isInvalid: "true", isDisabled: "true" } },
  ],
  validity: {
    cases: ["invalid", "invalid-disabled"],
    submit: requestSubmit,
  },
};

/**
 * Form — the only route that wraps a field in a real `<form>` with a real submit
 * button, so it is the only place the user-observable end of this dimension can be
 * driven with a click: does the browser block the submit, and does the port commit
 * the native error UI afterwards.
 *
 * `required-empty` is #383 (merged): both stacks block via `valueMissing`, then
 * both commit the native `validationMessage` into error HelpText with
 * `aria-invalid` / `[data-invalid]`. `aria-required-empty` is #465 (merged): Form
 * `validationBehavior="aria"` drops native `required`, so neither stack reports
 * `valueMissing`. `default` submit is the control group — both stacks submit.
 */
const formValidity: DriverScenario = {
  slug: "form",
  title: "Form native validity",
  target: rootTarget("form"),
  states: ["default"],
  cases: [
    { id: "default" },
    { id: "required-empty", params: { isRequired: "true", value: "" } },
    {
      id: "aria-required-empty",
      params: { isRequired: "true", value: "", validationBehavior: "aria" },
    },
  ],
  validity: {
    cases: ["default", "required-empty", "aria-required-empty"],
    submit: {
      cases: ["default", "required-empty", "aria-required-empty"],
      button: ({ canvas }) =>
        canvas.locator(`${controlRoot("form")} [data-comparison-form-submit="true"]`),
    },
  },
};

registerValidityDriver(textFieldValidity);
registerValidityDriver(searchFieldValidity);
registerValidityDriver(checkboxValidity);
registerValidityDriver(radioGroupValidity);
registerValidityDriver(numberFieldValidity);
registerValidityDriver(comboBoxValidity);
registerValidityDriver(formValidity);
