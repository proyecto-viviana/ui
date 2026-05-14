import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const actionButtonSizeOptions = ["XS", "S", "M", "L", "XL"] as const;
export const actionButtonStaticColorOptions = ["white", "black", "auto"] as const;
export const actionButtonIconPlacementOptions = ["none", "start", "only"] as const;

export type ActionButtonDemoSize = (typeof actionButtonSizeOptions)[number];
export type ActionButtonDemoStaticColor = (typeof actionButtonStaticColorOptions)[number];
export type ActionButtonDemoIconPlacement = (typeof actionButtonIconPlacementOptions)[number];

export interface ActionButtonDemoProps {
  children: string;
  size: ActionButtonDemoSize;
  staticColor?: ActionButtonDemoStaticColor;
  iconPlacement: ActionButtonDemoIconPlacement;
  isQuiet: boolean;
  isDisabled: boolean;
  isPending: boolean;
}

export const actionButtonDemoDefaults: ActionButtonDemoProps = {
  children: "Inspect",
  size: "M",
  staticColor: undefined,
  iconPlacement: "none",
  isQuiet: false,
  isDisabled: false,
  isPending: false,
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

export function actionButtonDemoPropsFromSearch(search: string): ActionButtonDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");
  const staticColor = params.get("staticColor");
  const iconPlacement = params.get("iconPlacement");

  return {
    children: params.get("children") || actionButtonDemoDefaults.children,
    size: isOneOf(size, actionButtonSizeOptions) ? size : actionButtonDemoDefaults.size,
    staticColor: isOneOf(staticColor, actionButtonStaticColorOptions) ? staticColor : undefined,
    iconPlacement: isOneOf(iconPlacement, actionButtonIconPlacementOptions)
      ? iconPlacement
      : actionButtonDemoDefaults.iconPlacement,
    isQuiet: booleanParam(params.get("isQuiet")),
    isDisabled: booleanParam(params.get("isDisabled")),
    isPending: booleanParam(params.get("isPending")),
  };
}

export function actionButtonDemoPropsFromWindow(): ActionButtonDemoProps {
  if (typeof window === "undefined") {
    return actionButtonDemoDefaults;
  }

  return actionButtonDemoPropsFromSearch(window.location.search);
}

export function serializeActionButtonDemoProps(props: ActionButtonDemoProps) {
  return JSON.stringify({
    children: props.children,
    size: props.size,
    staticColor: props.staticColor,
    iconPlacement: props.iconPlacement,
    isQuiet: props.isQuiet,
    isDisabled: props.isDisabled,
    isPending: props.isPending,
  });
}
