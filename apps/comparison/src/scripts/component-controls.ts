import {
  controlValueFromField,
  controlValueFromSearch,
  type ControlLiteral,
} from "@comparison/data/control-value";

type ControlValue = ControlLiteral;
type ControlDefaults = Record<string, ControlValue>;
type ControlValues = Record<string, ControlValue | undefined>;

const initializedForms = new WeakSet<HTMLFormElement>();
let pageLoadReady = true;

document.addEventListener("astro:before-preparation", () => {
  pageLoadReady = false;
});
document.addEventListener("astro:page-load", () => {
  pageLoadReady = true;
  initializeComparisonControls();
});

export function initializeComparisonControls(root: ParentNode = document) {
  for (const form of root.querySelectorAll<HTMLFormElement>("[data-comparison-controls]")) {
    initializeForm(form);
  }
}

function initializeForm(form: HTMLFormElement) {
  if (initializedForms.has(form)) {
    return;
  }

  initializedForms.add(form);
  const component = form.dataset.comparisonControls;
  const defaults = readDefaults(form);

  if (!component) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const initial: ControlValues = { ...defaults };

  for (const [key, defaultValue] of Object.entries(defaults)) {
    initial[key] = controlValueFromSearch(params, key, defaultValue);
  }

  writeControls(form, initial);
  dispatchControls(form, defaults, initial, false);
}

function readDefaults(form: HTMLFormElement): ControlDefaults {
  try {
    return form.dataset.controlDefaults ? JSON.parse(form.dataset.controlDefaults) : {};
  } catch {
    return {};
  }
}

function namedControls(form: HTMLFormElement, name: string) {
  return Array.from(form.elements).filter(
    (field): field is HTMLInputElement | HTMLSelectElement =>
      (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) &&
      field.name === name,
  );
}

function readControls(form: HTMLFormElement, defaults: ControlDefaults): ControlValues {
  const data = new FormData(form);
  const values: ControlValues = {};

  for (const [key, defaultValue] of Object.entries(defaults)) {
    const fields = namedControls(form, key);

    if (fields.length === 0) {
      values[key] = defaultValue;
      continue;
    }

    const submittedValue = data.get(key);
    values[key] = controlValueFromField(
      submittedValue == null ? null : String(submittedValue),
      defaultValue,
    );
  }

  return values;
}

function writeControls(form: HTMLFormElement, values: ControlValues) {
  for (const [key, value] of Object.entries(values)) {
    for (const field of namedControls(form, key)) {
      if (field instanceof HTMLInputElement && field.type === "checkbox") {
        field.checked = Boolean(value);
      } else if (field instanceof HTMLInputElement && field.type === "radio") {
        field.checked = field.value === String(value);
      } else {
        field.value = String(value ?? "");
      }
    }
  }
}

function toProps(values: ControlValues) {
  const props: ControlValues = {};

  for (const [key, value] of Object.entries(values)) {
    props[key] = key === "staticColor" && (value === "none" || value === "") ? undefined : value;
  }

  return props;
}

function dispatchControls(
  form: HTMLFormElement,
  defaults: ControlDefaults,
  values: ControlValues,
  updateUrl = true,
) {
  const component = form.dataset.comparisonControls;

  if (!component) {
    return;
  }

  if (updateUrl && pageLoadReady) {
    const url = new URL(window.location.href);

    for (const [key, value] of Object.entries(values)) {
      if (value === defaults[key] || value === "") {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, String(value));
      }
    }

    window.history.replaceState(null, "", url);
  }

  window.dispatchEvent(
    new CustomEvent("comparison:controls-change", {
      detail: { component, props: toProps(values) },
    }),
  );
}

function dispatchFormControls(form: HTMLFormElement) {
  const defaults = readDefaults(form);
  dispatchControls(form, defaults, readControls(form, defaults));
}

document.addEventListener("input", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const form = event.target.closest("[data-comparison-controls]");

  if (form instanceof HTMLFormElement) {
    dispatchFormControls(form);
  }
});

document.addEventListener("change", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const form = event.target.closest("[data-comparison-controls]");

  if (form instanceof HTMLFormElement) {
    dispatchFormControls(form);
  }
});

initializeComparisonControls();

declare global {
  interface Window {
    __comparisonSetControl?: (
      stack: "react" | "solid",
      name: string,
      value: unknown,
    ) => Promise<void>;
  }
}

window.__comparisonSetControl = async function __comparisonSetControl(
  stack: "react" | "solid",
  name: string,
  value: unknown,
): Promise<void> {
  const root = document.querySelector(
    `[data-framework="${stack}"] [data-comparison-control-root="combobox"]`,
  ) as HTMLElement | null;
  if (!root) {
    throw new Error(`__comparisonSetControl: missing root for stack ${stack}`);
  }
  let props: Record<string, unknown> = {};
  try {
    props = JSON.parse(root.getAttribute("data-comparison-control-props") || "{}");
  } catch {}
  props[name] = value;
  const detail = { component: "combobox", stack, props };
  window.dispatchEvent(new CustomEvent("comparison:controls-change", { detail }));
  await new Promise<void>((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const currentRoot = document.querySelector(
        `[data-framework="${stack}"] [data-comparison-control-root="combobox"]`,
      ) as HTMLElement | null;
      if (!currentRoot) {
        reject(new Error(`__comparisonSetControl: root disappeared for stack ${stack}`));
        return;
      }
      try {
        const current = JSON.parse(
          currentRoot.getAttribute("data-comparison-control-props") || "{}",
        );
        if (String(current[name]) === String(value)) {
          resolve();
          return;
        }
      } catch {}
      if (Date.now() - start > 2000) {
        reject(new Error(`__comparisonSetControl timeout for ${name}`));
        return;
      }
      setTimeout(check, 16);
    };
    check();
  });
};
