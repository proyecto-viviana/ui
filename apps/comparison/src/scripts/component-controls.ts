type ControlValue = string | boolean | number;
type ControlDefaults = Record<string, ControlValue>;
type ControlValues = Record<string, ControlValue | undefined>;

const initializedForms = new WeakSet<HTMLFormElement>();

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
    const hasParam = params.has(key);
    initial[key] =
      typeof defaultValue === "boolean"
        ? hasParam
          ? params.get(key) === "true"
          : defaultValue
        : params.get(key) || defaultValue;
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

    values[key] =
      typeof defaultValue === "boolean"
        ? data.get(key) === "on"
        : String(data.get(key) || defaultValue);
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

  if (updateUrl) {
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

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const resetButton = event.target.closest("[data-reset-controls]");

  if (!resetButton) {
    return;
  }

  const form = resetButton.closest("[data-comparison-controls]");

  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  const defaults = readDefaults(form);
  writeControls(form, defaults);
  dispatchControls(form, defaults, defaults);
});

initializeComparisonControls();
