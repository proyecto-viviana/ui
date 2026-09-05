import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  driverCases,
  scenarioThemes,
  type DriverScenario,
  type PanelFramework,
  type TargetResolver,
  type ValidityConfig,
} from "./scenario";
import { forEachScenarioPanel } from "./walk";

/**
 * Driver D14 — native constraint-validation oracle (see
 * `.claude/current/certification.md`, "Forms & validation").
 *
 * WHY THIS DRIVER EXISTS. The pair-oracle catalogue used to model the `isInvalid`
 * branch of every S2 field as a PAINT concern: D1 computed styles, D3 pixels, D6 AX
 * tree, D7 contrast. Each field unit that deferred `isInvalid` said so explicitly —
 * "D4/D2/D8 are unchanged by the invalid flag" — and the error row, the
 * `FieldErrorIcon`, `aria-invalid`, and the negative group border all matched, so
 * every registered driver was green. They were green while the port did not
 * participate in HTML constraint validation at all: S2's default
 * `validationBehavior` is `native`, RAC's field hooks call `useFormValidation` →
 * `setCustomValidity`, and a filled-but-invalid React field therefore fails
 * `checkValidity()`, matches `:invalid`, and BLOCKS form submit. Solid painted the
 * same red field and submitted the form. That whole class of defect
 * (#351 TextField/SearchField, #355 Checkbox, #362 DateField/TimeField,
 * #368 ColorField, #376 RadioGroup, #383 native Form submit, plus NumberField and
 * ComboBox with no ticket) was found by a manual functional walk, not by the harness
 * — no comparison spec referenced `checkValidity`, `customError`,
 * `validationMessage`, or `requestSubmit`.
 *
 * Painting an invalid field is not being invalid. This driver compares the part
 * the browser owns. Product gaps FAIL the test. `knownDivergences` / `test.fixme`
 * is reserved for harness artifacts, not for "Solid still submits". A green D14
 * row with a wrong submit is a test bug.
 *
 * WHAT IS COMPARED. Per case, per framework panel, every constraint-validation
 * candidate (`input`/`select`/`textarea`) inside the probed root is reduced to a
 * stack-agnostic descriptor: the native validity verdict (`validity.valid`, the
 * set of true `ValidityState` flags, `validationMessage`, `:invalid`), the native
 * barring attributes (`disabled`/`readOnly`/`required`/`willValidate`), and the
 * field's committed invalid UI (`aria-invalid`, `[data-invalid]`, and which
 * annotation row — `description` or `errorMessage` — the field grid renders).
 * `<button>` and `<fieldset>` are excluded: they are barred from constraint
 * validation, so they carry no validity signal.
 *
 * The probe is deliberately PASSIVE. It reads `element.validity.valid`, never
 * `element.checkValidity()`, because `checkValidity()` fires an `invalid` event and
 * RAC's `useFormValidation` listens for exactly that event to commit
 * `displayValidation`. A probe that called it would make the React panel repaint
 * itself into the state the driver is trying to measure — and would do so on only
 * one stack. Same reason the submit walk (D14b) runs in its OWN test: Playwright
 * gives it a fresh page load per panel, so nothing has touched validity before the
 * user's first click (the isolation #383 needed to reproduce).
 *
 * SUBMIT. Two ways, same snapshot:
 *   - a real fixture submit button (the Form route)
 *   - `HTMLFormElement.requestSubmit()` after associating every candidate with an
 *     injected form via the `form` attribute (Radio / NumberField / ComboBox and
 *     every other field route that does not wrap a `<form>`). Moving the field
 *     into a new form would break React/Solid refs; the `form` attribute does not.
 *
 * NORMALIZATION follows the house rule in `dom-oracle.ts`: never compare ids or
 * generated `name` attributes. React Aria and Solidaria both auto-generate the
 * `name` of an unnamed field (`radio:starter` vs `solidaria-cl-228`), and that
 * id-generation difference is not a validity finding. Hidden vs visible controls
 * are sorted so ComboBox hidden-select vs visible-input DOM order is not a finding.
 * `[data-invalid]` is a boolean presence bit, not a descendant count — wrapping
 * depth is not a validity signal.
 *
 * Theme-independent, so D14 runs the first scenario theme only.
 *
 * `VALIDITY_RAW=1` suppresses the `knownDivergences` `test.fixme` marks so a tracked
 * HARNESS artifact prints its actual pair diff instead of registering as skipped.
 * Product bugs do not get a `knownDivergences` entry.
 */

/** One constraint-validation candidate reduced to stack-agnostic validity facts. */
export interface ValidityControlSnapshot {
  tag: string;
  type: string | null;
  /** The submitted value; explicit in the fixtures, so comparable. */
  value: string;
  /** The associated `<label>` text, when the control has one. */
  label: string | null;
  /** Rendered vs. RAC/S2 hidden-input plumbing — a form-contract signal. */
  hidden: boolean;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  /** Whether the control is a candidate for constraint validation at all. */
  willValidate: boolean;
  /** `validity.valid` — read passively; `checkValidity()` would fire `invalid`. */
  valid: boolean;
  /** True `ValidityState` flags, sorted (e.g. `["customError"]`, `["valueMissing"]`). */
  flags: string[];
  /** The browser's message — `""` when valid, `Invalid value.` for a custom error. */
  message: string;
  /** Whether the UA's `:invalid` pseudo-class matches. */
  invalidPseudo: boolean;
  /** The ARIA half of the same state, which paint drivers already cover. */
  ariaInvalid: string | null;
}

/**
 * The field's committed invalid UI. S2 `Field.tsx` `HelpText()` renders exactly one
 * annotation row per field — `description` when valid, `errorMessage` when invalid —
 * so the rendered slot name IS the "did the port commit the invalid state" signal
 * that #383 turns on.
 */
export interface ValidityAnnotationSnapshot {
  /** `"description" | "errorMessage" | null` — which row the field grid rendered. */
  slot: string | null;
  text: string | null;
  /** Whether any descendant carries `[data-invalid]` (FieldGroup border branch). */
  hasDataInvalid: boolean;
  /** Group-level `aria-invalid` (RadioGroup / FieldGroup), when present. */
  groupAriaInvalid: string | null;
}

export interface ValiditySnapshot {
  controls: ValidityControlSnapshot[];
  annotation: ValidityAnnotationSnapshot;
}

/** Recorded after a submit attempt; adds what the attempt itself did. */
export interface SubmitSnapshot extends ValiditySnapshot {
  /** `submit` events seen at the document root — 0 means the browser blocked it. */
  submits: number;
  /** Native `invalid` events dispatched by the failed validity check. */
  invalids: number;
  /** Where the browser parked focus, as a stack-agnostic descriptor. */
  active: string;
}

const defaultSettleMs = 250;
const defaultSubmitSettleMs = 400;
const probeFormId = "comparison-d14-probe";

/**
 * Serialized into the page. Must stay self-contained (no imports, no closures).
 * Returns the passive validity descriptor for one probed root.
 */
function readValidity(root: Element): ValiditySnapshot {
  const flagNames = [
    "badInput",
    "customError",
    "patternMismatch",
    "rangeOverflow",
    "rangeUnderflow",
    "stepMismatch",
    "tooLong",
    "tooShort",
    "typeMismatch",
    "valueMissing",
  ] as const;

  const candidates = Array.from(
    root.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "input, select, textarea",
    ),
  );

  const controls = candidates
    .map((control) => {
      const validity = control.validity;
      const flags = flagNames.filter((flag) => validity[flag]);
      const label = control.labels?.[0]?.textContent;
      // `offsetParent === null` also catches `position: fixed`, so measure the box:
      // RAC/S2 hidden inputs are clipped to zero size or `display:none`.
      const box = control.getBoundingClientRect();
      return {
        tag: control.tagName.toLowerCase(),
        type: control.getAttribute("type"),
        value: control.value,
        label: label == null ? null : label.trim(),
        hidden: box.width === 0 && box.height === 0,
        disabled: control.disabled,
        readOnly: "readOnly" in control ? control.readOnly : false,
        required: control.required,
        willValidate: control.willValidate,
        valid: validity.valid,
        flags: [...flags].sort(),
        message: control.validationMessage,
        invalidPseudo: control.matches(":invalid"),
        ariaInvalid: control.getAttribute("aria-invalid"),
      };
    })
    .sort((left, right) => {
      // ComboBox hidden-select vs visible input DOM order is not comparable.
      const hidden = Number(left.hidden) - Number(right.hidden);
      if (hidden !== 0) {
        return hidden;
      }
      return `${left.type ?? ""}\0${left.value}\0${left.label ?? ""}`.localeCompare(
        `${right.type ?? ""}\0${right.value}\0${right.label ?? ""}`,
      );
    });

  const annotationRow = root.querySelector('[slot="errorMessage"], [slot="description"]');
  const annotationText =
    annotationRow?.textContent == null ? null : annotationRow.textContent.trim();
  const group = root.querySelector('[role="radiogroup"]') ?? root.querySelector("[aria-invalid]");
  const annotation = {
    slot: annotationText ? (annotationRow?.getAttribute("slot") ?? null) : null,
    text: annotationText || null,
    hasDataInvalid: root.querySelector("[data-invalid]") != null,
    groupAriaInvalid: group?.getAttribute("aria-invalid") ?? null,
  };

  return { controls, annotation };
}

/**
 * Serialized into the page. Installs capture-phase counters for `submit` and
 * `invalid` on the document, so a blocked submit is observable even though both
 * fixtures call `preventDefault` in their own `onSubmit`. Capture phase at the
 * document root runs before the fixture handler, and a submit the browser BLOCKS
 * never dispatches the event at all — which is the signal.
 */
function installSubmitCounters(): void {
  const counts = { submits: 0, invalids: 0 };
  (window as unknown as { __comparisonSubmitCounts: typeof counts }).__comparisonSubmitCounts =
    counts;
  document.addEventListener("submit", () => (counts.submits += 1), true);
  document.addEventListener("invalid", () => (counts.invalids += 1), true);
}

function readSubmitCounts(): { submits: number; invalids: number } {
  return (window as unknown as { __comparisonSubmitCounts: { submits: number; invalids: number } })
    .__comparisonSubmitCounts;
}

/** Serialized into the page. Stack-agnostic descriptor of the focused element. */
function readActiveDescriptor(): string {
  const active = document.activeElement;
  if (!active || active === document.body) {
    return "BODY";
  }
  const tag = active.tagName.toLowerCase();
  const role = active.getAttribute("role");
  const type = active.getAttribute("type");
  const value = "value" in active ? String((active as HTMLInputElement).value) : "";
  return [tag, type && `type=${type}`, role && `role=${role}`, value && `value=${value}`]
    .filter(Boolean)
    .join(" ");
}

/**
 * Serialized into the page. Associates every candidate in `root` with an injected
 * form via the HTML `form` attribute (does not move nodes — React/Solid refs stay
 * attached) and calls `requestSubmit()`. Controls already inside a fixture `<form>`
 * are left alone so the Form-route button walk stays the owner of that form.
 */
function requestSubmitAssociated(root: Element, formId: string): void {
  let form = document.getElementById(formId) as HTMLFormElement | null;
  if (!form) {
    form = document.createElement("form");
    form.id = formId;
    form.setAttribute("data-comparison-d14-form", "true");
    form.addEventListener("submit", (event) => event.preventDefault());
    document.body.appendChild(form);
  }
  for (const control of root.querySelectorAll<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >("input, select, textarea")) {
    if (control.closest("form:not([data-comparison-d14-form])")) {
      continue;
    }
    control.setAttribute("form", formId);
  }
  form.requestSubmit();
}

async function probe(root: Locator, settleMs: number): Promise<ValiditySnapshot> {
  // RAC commits `setCustomValidity` from an effect, so let the mount settle before
  // reading. The wait is on the page, not the locator, so both panels wait alike.
  await root.page().waitForTimeout(settleMs);
  return root.evaluate(readValidity);
}

async function readSubmitSnapshot(
  root: Locator,
  page: Page,
  settleMs: number,
): Promise<SubmitSnapshot> {
  await page.waitForTimeout(settleMs);
  const rest = await root.evaluate(readValidity);
  const counts = await page.evaluate(readSubmitCounts);
  return {
    ...rest,
    submits: counts.submits,
    invalids: counts.invalids,
    active: await page.evaluate(readActiveDescriptor),
  };
}

export function registerValidityDriver(scenario: DriverScenario) {
  const config: ValidityConfig | undefined = scenario.validity;
  if (!config) {
    throw new Error(`Scenario "${scenario.slug}" has no validity (D14) config`);
  }
  const rootResolver: TargetResolver = config.root ?? scenario.target;

  test.describe(`D14 native validity — ${scenario.title}`, () => {
    for (const caseDef of driverCases(scenario, config.cases)) {
      const caseTitle = `${caseDef.id} · constraint validity`;
      test(caseTitle, async ({ page }) => {
        const divergence = config.knownDivergences?.[caseTitle];
        if (divergence && !process.env.VALIDITY_RAW) {
          test.fixme(true, divergence);
        }
        test.setTimeout(45_000);
        const theme = scenarioThemes(scenario, caseDef)[0];
        const snapshots: Partial<Record<PanelFramework, ValiditySnapshot>> = {};

        // Native validity is not a paint signal. Skipping fonts/rAF avoids a
        // 120s evaluate hang on WSL Chromium that never issues a compositor frame.
        await forEachScenarioPanel(
          page,
          scenario,
          caseDef,
          theme,
          async (ctx) => {
            const root = rootResolver(ctx);
            await expect(root).toBeVisible();
            snapshots[ctx.framework] = await probe(root, config.settleMs ?? defaultSettleMs);
          },
          { paintBudgetMs: 0 },
        );

        expect(JSON.stringify(snapshots.solid, null, 2)).toBe(
          JSON.stringify(snapshots.react, null, 2),
        );
      });
    }

    const submit = config.submit;
    if (!submit) {
      return;
    }

    for (const caseDef of driverCases(scenario, submit.cases ?? config.cases)) {
      const caseTitle = `${caseDef.id} · submit attempt`;
      test(caseTitle, async ({ page }) => {
        const divergence = config.knownDivergences?.[caseTitle];
        if (divergence && !process.env.VALIDITY_RAW) {
          test.fixme(true, divergence);
        }
        test.setTimeout(45_000);
        const theme = scenarioThemes(scenario, caseDef)[0];
        const snapshots: Partial<Record<PanelFramework, SubmitSnapshot>> = {};

        await forEachScenarioPanel(
          page,
          scenario,
          caseDef,
          theme,
          async (ctx) => {
            const root = rootResolver(ctx);
            await expect(root).toBeVisible();
            // Nothing has read validity on this page yet: the counters go in before
            // the first user gesture, and the passive probe runs only afterwards.
            await ctx.page.evaluate(installSubmitCounters);
            if (submit.button) {
              const button = submit.button(ctx);
              await expect(button).toBeVisible();
              // Playwright's click waits for two compositor-stable frames.
              // WSL Chromium 151 never issues those, so a real fixture submit
              // would take the test timeout. Native `HTMLButtonElement.click()`
              // still fires the submit/invalid path D14 compares.
              await button.evaluate((element) => (element as HTMLButtonElement).click());
            } else {
              await root.evaluate(requestSubmitAssociated, probeFormId);
            }
            snapshots[ctx.framework] = await readSubmitSnapshot(
              root,
              ctx.page,
              submit.settleMs ?? defaultSubmitSettleMs,
            );
          },
          { paintBudgetMs: 0 },
        );

        expect(JSON.stringify(snapshots.solid, null, 2)).toBe(
          JSON.stringify(snapshots.react, null, 2),
        );
      });
    }
  });
}
