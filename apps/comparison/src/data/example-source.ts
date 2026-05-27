import type { ComponentControl, ComponentControlGroup } from "./component-controls";

export type ExampleSourceValue = ComponentControl["defaultValue"] | undefined;
export type ExampleSourceValues = Record<string, ExampleSourceValue>;

const componentNameOverrides: Record<string, string> = {
  icons: "Icon",
  illustrations: "Illustration",
};

export function defaultExampleSourceValues(group: ComponentControlGroup): ExampleSourceValues {
  return Object.fromEntries(
    group.controls.map((control) => [control.name, control.defaultValue]),
  ) as ExampleSourceValues;
}

export function exampleSourceValuesFromSearch(
  group: ComponentControlGroup,
  search: string,
): ExampleSourceValues {
  const params = new URLSearchParams(search);
  const values: ExampleSourceValues = {};

  for (const control of group.controls) {
    const hasParam = params.has(control.name);

    values[control.name] =
      typeof control.defaultValue === "boolean"
        ? hasParam
          ? params.get(control.name) === "true"
          : control.defaultValue
        : (params.get(control.name) ?? "") || control.defaultValue;
  }

  return values;
}

export function mergeExampleSourceValues(
  group: ComponentControlGroup,
  props: ExampleSourceValues,
): ExampleSourceValues {
  return {
    ...defaultExampleSourceValues(group),
    ...props,
  };
}

export function generateSolidExampleSource(
  group: ComponentControlGroup,
  values: ExampleSourceValues = defaultExampleSourceValues(group),
): string {
  const componentName = componentNameForGroup(group);
  const defaults = defaultExampleSourceValues(group);
  const children = values.children;
  const props = group.controls
    .filter((control) => control.name !== "children")
    .map((control) => propSource(control, values[control.name], defaults[control.name]))
    .filter((prop): prop is string => Boolean(prop));
  const importLine = `import {${componentName}} from '@proyecto-viviana/solid-spectrum';`;
  const componentSource = elementSource(componentName, props, children);

  return `${importLine}\n\n${componentSource}`;
}

function componentNameForGroup(group: ComponentControlGroup) {
  return componentNameOverrides[group.slug] ?? group.title.replace(/[^A-Za-z0-9]+/g, "");
}

function propSource(
  control: ComponentControl,
  value: ExampleSourceValue,
  defaultValue: ExampleSourceValue,
) {
  if (value === undefined || value === "") {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value ? control.name : undefined;
  }

  if (value === defaultValue && control.kind !== "text") {
    return undefined;
  }

  if (control.name === "staticColor" && value === "none") {
    return undefined;
  }

  if (typeof value === "number") {
    return `${control.name}={${value}}`;
  }

  return `${control.name}="${escapeAttributeValue(String(value))}"`;
}

function elementSource(
  componentName: string,
  props: readonly string[],
  children: ExampleSourceValue,
) {
  const childText = typeof children === "string" ? children : "";

  if (props.length === 0) {
    return childText
      ? `<${componentName}>${escapeText(childText)}</${componentName}>`
      : `<${componentName} />`;
  }

  const propLines = props.map((prop) => `  ${prop}`).join("\n");

  if (!childText) {
    return `<${componentName}\n${propLines}\n/>`;
  }

  return `<${componentName}\n${propLines}\n>\n  ${escapeText(childText)}\n</${componentName}>`;
}

function escapeAttributeValue(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function escapeText(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
