import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const switchSizeOptions = ["S", "M", "L", "XL"] as const;

export type SwitchDemoSize = (typeof switchSizeOptions)[number];

export interface SwitchDemoProps {
  children: string;
  size: SwitchDemoSize;
  isSelected: boolean;
  isEmphasized: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
}

export const switchDemoDefaults: SwitchDemoProps = {
  children: "Wi-Fi",
  size: "M",
  isSelected: false,
  isEmphasized: false,
  isDisabled: false,
  isReadOnly: false,
};

function isOneOf<T extends readonly string[]>(
  value: string | null | undefined,
  options: T,
): value is T[number] {
  return value != null && options.includes(value);
}

function booleanParam(value: string | null | undefined) {
  return value === "true" || value === "on" || value === "1";
}

export function normalizeSwitchDemoProps(props: Partial<SwitchDemoProps>): SwitchDemoProps {
  return {
    children:
      typeof props.children === "string" && props.children
        ? props.children
        : switchDemoDefaults.children,
    size: isOneOf(props.size, switchSizeOptions) ? props.size : switchDemoDefaults.size,
    isSelected: props.isSelected === true,
    isEmphasized: props.isEmphasized === true,
    isDisabled: props.isDisabled === true,
    isReadOnly: props.isReadOnly === true,
  };
}

export function switchDemoPropsFromSearch(search: string): SwitchDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");

  return normalizeSwitchDemoProps({
    children: params.get("children") || switchDemoDefaults.children,
    size: isOneOf(size, switchSizeOptions) ? size : switchDemoDefaults.size,
    isSelected: booleanParam(params.get("isSelected")),
    isEmphasized: booleanParam(params.get("isEmphasized")),
    isDisabled: booleanParam(params.get("isDisabled")),
    isReadOnly: booleanParam(params.get("isReadOnly")),
  });
}

export function switchDemoPropsFromWindow(): SwitchDemoProps {
  if (typeof window === "undefined") {
    return switchDemoDefaults;
  }

  return switchDemoPropsFromSearch(window.location.search);
}

export function serializeSwitchDemoProps(props: SwitchDemoProps) {
  return JSON.stringify({
    children: props.children,
    size: props.size,
    isSelected: props.isSelected,
    isEmphasized: props.isEmphasized,
    isDisabled: props.isDisabled,
    isReadOnly: props.isReadOnly,
  });
}
