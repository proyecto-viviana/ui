import h from "solid-js/h";
import { createSignal, type Accessor } from "solid-js";
import {
  ActionButton,
  Picker,
  Provider,
  Radio,
  RadioGroup,
  Switch,
  TextField,
} from "@proyecto-viviana/solid-spectrum";
import {
  getComponentControlGroup,
  type ComponentControl,
  type ComponentControlOption,
} from "@comparison/data/component-controls";
import { getComparisonEntry } from "@comparison/data/comparison-manifest";
import { comparisonThemeRequestEvent, type ComparisonThemeChoice } from "@comparison/data/theme";
import { hc } from "./solid-h";
import { createComparisonColorScheme } from "./useComparisonColorScheme";

export interface ComponentExampleControlsProps {
  slug: string;
}

type ControlValue = ComponentControl["defaultValue"];
type ControlValues = Record<string, ControlValue | undefined>;

export default function ComponentExampleControls(props: ComponentExampleControlsProps) {
  const { resolvedTheme, themeChoice } = createComparisonColorScheme();
  const entry = getComparisonEntry(props.slug);

  if (!entry) {
    return h("div", { class: "s2-empty-state" }, "Interactive controls are unavailable.")();
  }

  const controlGroup = getComponentControlGroup(entry);
  const controlDefaults = Object.fromEntries(
    controlGroup.controls.map((control) => [control.name, control.defaultValue]),
  ) as Record<string, ControlValue>;
  const [controlValues, setControlValues] = createSignal<ControlValues>(
    initialControlValues(controlDefaults),
  );
  let formElement: HTMLFormElement | undefined;
  const currentValue = (control: ComponentControl) =>
    controlValues()[control.name] ?? control.defaultValue;
  const updateControlValue = (name: string, value: ControlValue, notifyForm = false) => {
    setControlValues((current) => ({
      ...current,
      [name]: value,
    }));

    if (notifyForm) {
      queueMicrotask(() => {
        formElement?.dispatchEvent(new Event("change", { bubbles: true }));
      });
    }
  };
  const resetControlValues = () => {
    setControlValues({ ...controlDefaults });
  };

  return hc(
    Provider,
    {
      class: "s2-component-example-controls",
      get colorScheme() {
        return resolvedTheme();
      },
      background: "base",
    },
    [
      h("h2", { id: "example-title" }, "Example"),
      themeControls(themeChoice),
      controlGroup.controls.length > 0
        ? h(
            "form",
            {
              class: "s2-prop-controls",
              ref: (node: HTMLFormElement) => {
                formElement = node;
              },
              "data-comparison-controls": entry.slug,
              "data-control-coverage": controlGroup.coverage,
              "data-control-defaults": JSON.stringify(controlDefaults),
              onClick: (event: MouseEvent) => {
                if (
                  event.target instanceof Element &&
                  event.target.closest("[data-reset-controls]")
                ) {
                  resetControlValues();
                }
              },
            },
            controlGroup.controls.map((control) =>
              h(
                "div",
                {
                  class: "s2-prop-control",
                  "data-control-kind": control.kind,
                  "data-control-name": control.name,
                },
                controlField(control, currentValue, updateControlValue),
              ),
            ),
            hc(
              ActionButton,
              {
                type: "button",
                size: "M",
                variant: "secondary",
                fillStyle: "outline",
                "data-reset-controls": "",
              },
              ["Reset"],
            ),
          )
        : h(
            "div",
            { class: "s2-empty-state" },
            "Interactive S2 prop controls are missing for this component.",
          ),
    ],
  )();
}

function initialControlValues(defaults: Record<string, ControlValue>): ControlValues {
  const params =
    typeof window === "undefined" ? undefined : new URLSearchParams(window.location.search);
  const values: ControlValues = {};

  for (const [name, defaultValue] of Object.entries(defaults)) {
    const hasParam = params?.has(name) ?? false;
    values[name] =
      typeof defaultValue === "boolean"
        ? hasParam
          ? params?.get(name) === "true"
          : defaultValue
        : (params?.get(name) ?? "") || defaultValue;
  }

  return values;
}

function requestComparisonThemeChange(theme: ComparisonThemeChoice) {
  window.dispatchEvent(
    new CustomEvent(comparisonThemeRequestEvent, {
      detail: { theme },
    }),
  );
}

function themeControls(themeChoice: Accessor<ComparisonThemeChoice>) {
  return hc(
    RadioGroup,
    {
      label: "Color scheme",
      name: "comparisonTheme",
      orientation: "horizontal",
      size: "M",
      get value() {
        return themeChoice();
      },
      onChange: (value: string) => {
        requestComparisonThemeChange(value as ComparisonThemeChoice);
      },
    },
    [themeOption("system"), themeOption("light"), themeOption("dark")],
  );
}

function themeOption(value: ComparisonThemeChoice) {
  return hc(Radio, { value }, [value]);
}

function controlField(
  control: ComponentControl,
  currentValue: (control: ComponentControl) => ControlValue | undefined,
  updateControlValue: (name: string, value: ControlValue, notifyForm?: boolean) => void,
) {
  if (control.kind === "text") {
    return hc(TextField, {
      label: control.label,
      name: control.name,
      size: "M",
      get value() {
        return String(currentValue(control) ?? "");
      },
      onInput: (event: InputEvent & { currentTarget: HTMLInputElement }) =>
        updateControlValue(control.name, event.currentTarget.value, true),
      onChange: (value: string) => updateControlValue(control.name, value, true),
    });
  }

  if (control.kind === "select") {
    return h(
      "div",
      {},
      selectBridge(control, currentValue, updateControlValue),
      hc(Picker, {
        label: control.label,
        size: "M",
        get items() {
          return control.options ?? [];
        },
        getKey: (item: ComponentControlOption) => item.value,
        getTextValue: (item: ComponentControlOption) => item.label,
        get selectedKey() {
          return String(currentValue(control) ?? "");
        },
        onSelectionChange: (key: unknown) => {
          updateControlValue(control.name, String(key ?? ""), true);
        },
      }),
    );
  }

  if (control.kind === "radio") {
    return hc(
      RadioGroup,
      {
        label: control.label,
        name: control.name,
        orientation: "horizontal",
        size: "M",
        get value() {
          return String(currentValue(control) ?? "");
        },
        onChange: (value: string) => updateControlValue(control.name, value, true),
      },
      (control.options ?? []).map((option) => hc(Radio, { value: option.value }, [option.label])),
    );
  }

  return hc(
    Switch,
    {
      name: control.name,
      size: "M",
      get isSelected() {
        return currentValue(control) === true;
      },
      onChange: (isSelected: boolean) => updateControlValue(control.name, isSelected, true),
    },
    [control.label],
  );
}

function selectBridge(
  control: ComponentControl,
  currentValue: (control: ComponentControl) => ControlValue | undefined,
  updateControlValue: (name: string, value: ControlValue, notifyForm?: boolean) => void,
) {
  return h(
    "select",
    {
      class: "s2-form-bridge",
      name: control.name,
      "aria-hidden": "true",
      tabindex: "-1",
      get value() {
        return String(currentValue(control) ?? "");
      },
      onInput: (event: InputEvent & { currentTarget: HTMLSelectElement }) =>
        updateControlValue(control.name, event.currentTarget.value),
      onChange: (event: Event & { currentTarget: HTMLSelectElement }) =>
        updateControlValue(control.name, event.currentTarget.value),
    },
    (control.options ?? []).map((option) =>
      h(
        "option",
        {
          value: option.value,
        },
        option.label,
      ),
    ),
  );
}
