import h from "solid-js/h";
import { ActionButton, Provider } from "@proyecto-viviana/solid-spectrum";
import {
  getComponentControlGroup,
  type ComponentControl,
} from "@comparison/data/component-controls";
import { getComparisonEntry } from "@comparison/data/comparison-manifest";
import { hc } from "./solid-h";
import { createComparisonColorScheme } from "./useComparisonColorScheme";

export interface ComponentExampleControlsProps {
  slug: string;
}

export default function ComponentExampleControls(props: ComponentExampleControlsProps) {
  const { resolvedTheme } = createComparisonColorScheme();
  const entry = getComparisonEntry(props.slug);

  if (!entry) {
    return h("div", { class: "s2-empty-state" }, "Interactive controls are unavailable.")();
  }

  const controlGroup = getComponentControlGroup(entry);
  const controlDefaults = Object.fromEntries(
    controlGroup.controls.map((control) => [control.name, control.defaultValue]),
  );

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
      themeControls(),
      controlGroup.controls.length > 0
        ? h(
            "form",
            {
              class: "s2-prop-controls",
              "data-comparison-controls": entry.slug,
              "data-control-coverage": controlGroup.coverage,
              "data-control-defaults": JSON.stringify(controlDefaults),
            },
            controlGroup.controls.map((control) =>
              h("div", { class: "s2-prop-control" }, controlField(control)),
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

function themeControls() {
  return h(
    "fieldset",
    { class: "s2-radio-group s2-theme-control" },
    h("legend", {}, "Color scheme"),
    h(
      "div",
      {},
      themeOption("system", true),
      themeOption("light", false),
      themeOption("dark", false),
    ),
  );
}

function themeOption(value: string, checked: boolean) {
  return h(
    "label",
    {},
    h("input", { type: "radio", name: "comparisonTheme", value, checked }),
    h("span", {}, value),
  );
}

function controlField(control: ComponentControl) {
  if (control.kind === "text") {
    return h(
      "label",
      { class: "s2-field" },
      h("span", {}, control.label),
      h("input", { name: control.name, value: String(control.defaultValue) }),
    );
  }

  if (control.kind === "select") {
    return h(
      "label",
      { class: "s2-field" },
      h("span", {}, control.label),
      h(
        "select",
        { name: control.name },
        control.options?.map((option) =>
          h(
            "option",
            {
              value: option.value,
              selected: option.value === control.defaultValue,
            },
            option.label,
          ),
        ),
      ),
    );
  }

  if (control.kind === "radio") {
    return h(
      "fieldset",
      { class: "s2-radio-group" },
      h("legend", {}, control.label),
      h(
        "div",
        {},
        control.options?.map((option) =>
          h(
            "label",
            {},
            h("input", {
              type: "radio",
              name: control.name,
              value: option.value,
              checked: option.value === control.defaultValue,
            }),
            h("span", {}, option.label),
          ),
        ),
      ),
    );
  }

  return h(
    "label",
    { class: "s2-switch" },
    h("input", {
      name: control.name,
      type: "checkbox",
      checked: control.defaultValue === true,
    }),
    h("span", {}, control.label),
  );
}
