import {
  buttonDemoDefaults,
  buttonFillStyleOptions,
  buttonIconPlacementOptions,
  buttonSizeOptions,
  buttonStaticColorOptions,
  buttonVariantOptions,
  type ButtonDemoFillStyle,
  type ButtonDemoIconPlacement,
  type ButtonDemoSize,
  type ButtonDemoStaticColor,
  type ButtonDemoVariant,
} from "./button-demo";
import {
  actionButtonDemoDefaults,
  actionButtonIconPlacementOptions,
  actionButtonSizeOptions,
  actionButtonStaticColorOptions,
  type ActionButtonDemoIconPlacement,
  type ActionButtonDemoSize,
  type ActionButtonDemoStaticColor,
} from "./actionbutton-demo";

export const groupDensityOptions = ["regular", "compact"] as const;
export const groupOrientationOptions = ["horizontal", "vertical"] as const;
export const buttonGroupAlignOptions = ["start", "end", "center"] as const;
export const toggleButtonGroupSelectionModeOptions = ["single", "multiple"] as const;

export type GroupDensity = (typeof groupDensityOptions)[number];
export type GroupOrientation = (typeof groupOrientationOptions)[number];
export type ButtonGroupAlign = (typeof buttonGroupAlignOptions)[number];
export type ToggleButtonGroupSelectionMode = (typeof toggleButtonGroupSelectionModeOptions)[number];

export interface LinkButtonDemoProps {
  children: string;
  href: string;
  variant: ButtonDemoVariant;
  fillStyle: ButtonDemoFillStyle;
  size: ButtonDemoSize;
  staticColor?: ButtonDemoStaticColor;
  iconPlacement: ButtonDemoIconPlacement;
  isDisabled: boolean;
}

export interface ToggleButtonDemoProps {
  children: string;
  size: ActionButtonDemoSize;
  staticColor?: ActionButtonDemoStaticColor;
  iconPlacement: ButtonDemoIconPlacement;
  isQuiet: boolean;
  isEmphasized: boolean;
  isSelected: boolean;
  isDisabled: boolean;
}

export interface ActionButtonGroupDemoProps {
  size: ActionButtonDemoSize;
  density: GroupDensity;
  orientation: GroupOrientation;
  staticColor?: ActionButtonDemoStaticColor;
  iconPlacement: ActionButtonDemoIconPlacement;
  isQuiet: boolean;
  isJustified: boolean;
  isDisabled: boolean;
}

export interface ButtonGroupDemoProps {
  orientation: GroupOrientation;
  align: ButtonGroupAlign;
  size: ButtonDemoSize;
  iconPlacement: ButtonDemoIconPlacement;
  wrapWidth?: number;
  isDisabled: boolean;
}

export interface ToggleButtonGroupDemoProps {
  selectionMode: ToggleButtonGroupSelectionMode;
  selectedKeys: string;
  size: ActionButtonDemoSize;
  density: GroupDensity;
  orientation: GroupOrientation;
  staticColor?: ActionButtonDemoStaticColor;
  iconPlacement: ButtonDemoIconPlacement;
  isQuiet: boolean;
  isEmphasized: boolean;
  isJustified: boolean;
  isDisabled: boolean;
}

export const linkButtonDemoDefaults: LinkButtonDemoProps = {
  children: "Open docs",
  href: "https://example.com/docs",
  variant: buttonDemoDefaults.variant,
  fillStyle: buttonDemoDefaults.fillStyle,
  size: buttonDemoDefaults.size,
  staticColor: undefined,
  iconPlacement: buttonDemoDefaults.iconPlacement,
  isDisabled: false,
};

export const toggleButtonDemoDefaults: ToggleButtonDemoProps = {
  children: "Pin",
  size: actionButtonDemoDefaults.size,
  staticColor: undefined,
  iconPlacement: buttonDemoDefaults.iconPlacement,
  isQuiet: false,
  isEmphasized: false,
  isSelected: false,
  isDisabled: false,
};

export const actionButtonGroupDemoDefaults: ActionButtonGroupDemoProps = {
  size: actionButtonDemoDefaults.size,
  density: "regular",
  orientation: "horizontal",
  staticColor: undefined,
  iconPlacement: actionButtonDemoDefaults.iconPlacement,
  isQuiet: false,
  isJustified: false,
  isDisabled: false,
};

export const buttonGroupDemoDefaults: ButtonGroupDemoProps = {
  orientation: "horizontal",
  align: "start",
  size: buttonDemoDefaults.size,
  iconPlacement: buttonDemoDefaults.iconPlacement,
  wrapWidth: undefined,
  isDisabled: false,
};

export const toggleButtonGroupDemoDefaults: ToggleButtonGroupDemoProps = {
  selectionMode: "single",
  selectedKeys: "left",
  size: actionButtonDemoDefaults.size,
  density: "regular",
  orientation: "horizontal",
  staticColor: undefined,
  iconPlacement: buttonDemoDefaults.iconPlacement,
  isQuiet: false,
  isEmphasized: false,
  isJustified: false,
  isDisabled: false,
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

function optionalNumber(value: string | number | null | undefined) {
  if (value == null || value === "") {
    return undefined;
  }

  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number > 0 ? number : undefined;
}

function selectedKeysText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

export function selectedKeysSetFromText(
  value: string | undefined,
  fallback: string[],
  selectionMode: ToggleButtonGroupSelectionMode,
) {
  const keys = String(value || fallback.join(","))
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
  return new Set(selectionMode === "single" ? keys.slice(0, 1) : keys);
}

export function linkButtonDemoPropsFromSearch(search: string): LinkButtonDemoProps {
  const params = new URLSearchParams(search);
  const variant = params.get("variant");
  const fillStyle = params.get("fillStyle");
  const size = params.get("size");
  const staticColor = params.get("staticColor");
  const iconPlacement = params.get("iconPlacement");

  return normalizeLinkButtonDemoProps({
    children: params.get("children") || linkButtonDemoDefaults.children,
    href: params.get("href") || linkButtonDemoDefaults.href,
    variant: isOneOf(variant, buttonVariantOptions) ? variant : linkButtonDemoDefaults.variant,
    fillStyle: isOneOf(fillStyle, buttonFillStyleOptions)
      ? fillStyle
      : linkButtonDemoDefaults.fillStyle,
    size: isOneOf(size, buttonSizeOptions) ? size : linkButtonDemoDefaults.size,
    staticColor: isOneOf(staticColor, buttonStaticColorOptions) ? staticColor : undefined,
    iconPlacement: isOneOf(iconPlacement, buttonIconPlacementOptions)
      ? iconPlacement
      : linkButtonDemoDefaults.iconPlacement,
    isDisabled: booleanParam(params.get("isDisabled")),
  });
}

export function toggleButtonDemoPropsFromSearch(search: string): ToggleButtonDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");
  const staticColor = params.get("staticColor");
  const iconPlacement = params.get("iconPlacement");

  return normalizeToggleButtonDemoProps({
    children: params.get("children") || toggleButtonDemoDefaults.children,
    size: isOneOf(size, actionButtonSizeOptions) ? size : toggleButtonDemoDefaults.size,
    staticColor: isOneOf(staticColor, actionButtonStaticColorOptions) ? staticColor : undefined,
    iconPlacement: isOneOf(iconPlacement, buttonIconPlacementOptions)
      ? iconPlacement
      : toggleButtonDemoDefaults.iconPlacement,
    isQuiet: booleanParam(params.get("isQuiet")),
    isEmphasized: booleanParam(params.get("isEmphasized")),
    isSelected: booleanParam(params.get("isSelected")),
    isDisabled: booleanParam(params.get("isDisabled")),
  });
}

export function actionButtonGroupDemoPropsFromSearch(search: string): ActionButtonGroupDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");
  const density = params.get("density");
  const orientation = params.get("orientation");
  const staticColor = params.get("staticColor");
  const iconPlacement = params.get("iconPlacement");

  return normalizeActionButtonGroupDemoProps({
    size: isOneOf(size, actionButtonSizeOptions) ? size : actionButtonGroupDemoDefaults.size,
    density: isOneOf(density, groupDensityOptions)
      ? density
      : actionButtonGroupDemoDefaults.density,
    orientation: isOneOf(orientation, groupOrientationOptions)
      ? orientation
      : actionButtonGroupDemoDefaults.orientation,
    staticColor: isOneOf(staticColor, actionButtonStaticColorOptions) ? staticColor : undefined,
    iconPlacement: isOneOf(iconPlacement, actionButtonIconPlacementOptions)
      ? iconPlacement
      : actionButtonGroupDemoDefaults.iconPlacement,
    isQuiet: booleanParam(params.get("isQuiet")),
    isJustified: booleanParam(params.get("isJustified")),
    isDisabled: booleanParam(params.get("isDisabled")),
  });
}

export function buttonGroupDemoPropsFromSearch(search: string): ButtonGroupDemoProps {
  const params = new URLSearchParams(search);
  const orientation = params.get("orientation");
  const align = params.get("align");
  const size = params.get("size");
  const iconPlacement = params.get("iconPlacement");

  return normalizeButtonGroupDemoProps({
    orientation: isOneOf(orientation, groupOrientationOptions)
      ? orientation
      : buttonGroupDemoDefaults.orientation,
    align: isOneOf(align, buttonGroupAlignOptions) ? align : buttonGroupDemoDefaults.align,
    size: isOneOf(size, buttonSizeOptions) ? size : buttonGroupDemoDefaults.size,
    iconPlacement: isOneOf(iconPlacement, buttonIconPlacementOptions)
      ? iconPlacement
      : buttonGroupDemoDefaults.iconPlacement,
    wrapWidth: optionalNumber(params.get("wrapWidth")),
    isDisabled: booleanParam(params.get("isDisabled")),
  });
}

export function toggleButtonGroupDemoPropsFromSearch(search: string): ToggleButtonGroupDemoProps {
  const params = new URLSearchParams(search);
  const selectionMode = params.get("selectionMode");
  const size = params.get("size");
  const density = params.get("density");
  const orientation = params.get("orientation");
  const staticColor = params.get("staticColor");
  const iconPlacement = params.get("iconPlacement");

  return normalizeToggleButtonGroupDemoProps({
    selectionMode: isOneOf(selectionMode, toggleButtonGroupSelectionModeOptions)
      ? selectionMode
      : toggleButtonGroupDemoDefaults.selectionMode,
    selectedKeys: selectedKeysText(
      params.get("selectedKeys"),
      toggleButtonGroupDemoDefaults.selectedKeys,
    ),
    size: isOneOf(size, actionButtonSizeOptions) ? size : toggleButtonGroupDemoDefaults.size,
    density: isOneOf(density, groupDensityOptions)
      ? density
      : toggleButtonGroupDemoDefaults.density,
    orientation: isOneOf(orientation, groupOrientationOptions)
      ? orientation
      : toggleButtonGroupDemoDefaults.orientation,
    staticColor: isOneOf(staticColor, actionButtonStaticColorOptions) ? staticColor : undefined,
    iconPlacement: isOneOf(iconPlacement, buttonIconPlacementOptions)
      ? iconPlacement
      : toggleButtonGroupDemoDefaults.iconPlacement,
    isQuiet: booleanParam(params.get("isQuiet")),
    isEmphasized: booleanParam(params.get("isEmphasized")),
    isJustified: booleanParam(params.get("isJustified")),
    isDisabled: booleanParam(params.get("isDisabled")),
  });
}

export function linkButtonDemoPropsFromWindow(): LinkButtonDemoProps {
  return typeof window === "undefined"
    ? linkButtonDemoDefaults
    : linkButtonDemoPropsFromSearch(window.location.search);
}

export function toggleButtonDemoPropsFromWindow(): ToggleButtonDemoProps {
  return typeof window === "undefined"
    ? toggleButtonDemoDefaults
    : toggleButtonDemoPropsFromSearch(window.location.search);
}

export function actionButtonGroupDemoPropsFromWindow(): ActionButtonGroupDemoProps {
  return typeof window === "undefined"
    ? actionButtonGroupDemoDefaults
    : actionButtonGroupDemoPropsFromSearch(window.location.search);
}

export function buttonGroupDemoPropsFromWindow(): ButtonGroupDemoProps {
  return typeof window === "undefined"
    ? buttonGroupDemoDefaults
    : buttonGroupDemoPropsFromSearch(window.location.search);
}

export function toggleButtonGroupDemoPropsFromWindow(): ToggleButtonGroupDemoProps {
  return typeof window === "undefined"
    ? toggleButtonGroupDemoDefaults
    : toggleButtonGroupDemoPropsFromSearch(window.location.search);
}

export function normalizeLinkButtonDemoProps(
  props: Partial<LinkButtonDemoProps>,
): LinkButtonDemoProps {
  return {
    children:
      typeof props.children === "string" && props.children
        ? props.children
        : linkButtonDemoDefaults.children,
    href: typeof props.href === "string" && props.href ? props.href : linkButtonDemoDefaults.href,
    variant: isOneOf(props.variant, buttonVariantOptions)
      ? props.variant
      : linkButtonDemoDefaults.variant,
    fillStyle: isOneOf(props.fillStyle, buttonFillStyleOptions)
      ? props.fillStyle
      : linkButtonDemoDefaults.fillStyle,
    size: isOneOf(props.size, buttonSizeOptions) ? props.size : linkButtonDemoDefaults.size,
    staticColor: isOneOf(props.staticColor, buttonStaticColorOptions)
      ? props.staticColor
      : undefined,
    iconPlacement: isOneOf(props.iconPlacement, buttonIconPlacementOptions)
      ? props.iconPlacement
      : linkButtonDemoDefaults.iconPlacement,
    isDisabled: props.isDisabled === true,
  };
}

export function normalizeToggleButtonDemoProps(
  props: Partial<ToggleButtonDemoProps>,
): ToggleButtonDemoProps {
  return {
    children:
      typeof props.children === "string" && props.children
        ? props.children
        : toggleButtonDemoDefaults.children,
    size: isOneOf(props.size, actionButtonSizeOptions) ? props.size : toggleButtonDemoDefaults.size,
    staticColor: isOneOf(props.staticColor, actionButtonStaticColorOptions)
      ? props.staticColor
      : undefined,
    iconPlacement: isOneOf(props.iconPlacement, buttonIconPlacementOptions)
      ? props.iconPlacement
      : toggleButtonDemoDefaults.iconPlacement,
    isQuiet: props.isQuiet === true,
    isEmphasized: props.isEmphasized === true,
    isSelected: props.isSelected === true,
    isDisabled: props.isDisabled === true,
  };
}

export function normalizeActionButtonGroupDemoProps(
  props: Partial<ActionButtonGroupDemoProps>,
): ActionButtonGroupDemoProps {
  return {
    size: isOneOf(props.size, actionButtonSizeOptions)
      ? props.size
      : actionButtonGroupDemoDefaults.size,
    density: isOneOf(props.density, groupDensityOptions)
      ? props.density
      : actionButtonGroupDemoDefaults.density,
    orientation: isOneOf(props.orientation, groupOrientationOptions)
      ? props.orientation
      : actionButtonGroupDemoDefaults.orientation,
    staticColor: isOneOf(props.staticColor, actionButtonStaticColorOptions)
      ? props.staticColor
      : undefined,
    iconPlacement: isOneOf(props.iconPlacement, actionButtonIconPlacementOptions)
      ? props.iconPlacement
      : actionButtonGroupDemoDefaults.iconPlacement,
    isQuiet: props.isQuiet === true,
    isJustified: props.isJustified === true,
    isDisabled: props.isDisabled === true,
  };
}

export function normalizeButtonGroupDemoProps(
  props: Partial<ButtonGroupDemoProps> & { wrapWidth?: string | number },
): ButtonGroupDemoProps {
  return {
    orientation: isOneOf(props.orientation, groupOrientationOptions)
      ? props.orientation
      : buttonGroupDemoDefaults.orientation,
    align: isOneOf(props.align, buttonGroupAlignOptions)
      ? props.align
      : buttonGroupDemoDefaults.align,
    size: isOneOf(props.size, buttonSizeOptions) ? props.size : buttonGroupDemoDefaults.size,
    iconPlacement: isOneOf(props.iconPlacement, buttonIconPlacementOptions)
      ? props.iconPlacement
      : buttonGroupDemoDefaults.iconPlacement,
    wrapWidth: optionalNumber(props.wrapWidth),
    isDisabled: props.isDisabled === true,
  };
}

export function normalizeToggleButtonGroupDemoProps(
  props: Partial<ToggleButtonGroupDemoProps>,
): ToggleButtonGroupDemoProps {
  const selectionMode = isOneOf(props.selectionMode, toggleButtonGroupSelectionModeOptions)
    ? props.selectionMode
    : toggleButtonGroupDemoDefaults.selectionMode;
  return {
    selectionMode,
    selectedKeys: selectedKeysText(
      props.selectedKeys,
      selectionMode === "multiple" ? "left,center" : toggleButtonGroupDemoDefaults.selectedKeys,
    ),
    size: isOneOf(props.size, actionButtonSizeOptions)
      ? props.size
      : toggleButtonGroupDemoDefaults.size,
    density: isOneOf(props.density, groupDensityOptions)
      ? props.density
      : toggleButtonGroupDemoDefaults.density,
    orientation: isOneOf(props.orientation, groupOrientationOptions)
      ? props.orientation
      : toggleButtonGroupDemoDefaults.orientation,
    staticColor: isOneOf(props.staticColor, actionButtonStaticColorOptions)
      ? props.staticColor
      : undefined,
    iconPlacement: isOneOf(props.iconPlacement, buttonIconPlacementOptions)
      ? props.iconPlacement
      : toggleButtonGroupDemoDefaults.iconPlacement,
    isQuiet: props.isQuiet === true,
    isEmphasized: props.isEmphasized === true,
    isJustified: props.isJustified === true,
    isDisabled: props.isDisabled === true,
  };
}

export function serializeLinkButtonDemoProps(props: LinkButtonDemoProps) {
  return JSON.stringify({
    children: props.children,
    href: props.href,
    variant: props.variant,
    fillStyle: props.fillStyle,
    size: props.size,
    staticColor: props.staticColor,
    iconPlacement: props.iconPlacement,
    isDisabled: props.isDisabled,
  });
}

export function serializeToggleButtonDemoProps(props: ToggleButtonDemoProps) {
  return JSON.stringify({
    children: props.children,
    size: props.size,
    staticColor: props.staticColor,
    iconPlacement: props.iconPlacement,
    isQuiet: props.isQuiet,
    isEmphasized: props.isEmphasized,
    isSelected: props.isSelected,
    isDisabled: props.isDisabled,
  });
}

export function serializeActionButtonGroupDemoProps(props: ActionButtonGroupDemoProps) {
  return JSON.stringify({
    size: props.size,
    density: props.density,
    orientation: props.orientation,
    staticColor: props.staticColor,
    iconPlacement: props.iconPlacement,
    isQuiet: props.isQuiet,
    isJustified: props.isJustified,
    isDisabled: props.isDisabled,
  });
}

export function serializeButtonGroupDemoProps(props: ButtonGroupDemoProps) {
  return JSON.stringify({
    orientation: props.orientation,
    align: props.align,
    size: props.size,
    iconPlacement: props.iconPlacement,
    wrapWidth: props.wrapWidth,
    isDisabled: props.isDisabled,
  });
}

export function serializeToggleButtonGroupDemoProps(props: ToggleButtonGroupDemoProps) {
  return JSON.stringify({
    selectionMode: props.selectionMode,
    selectedKeys: props.selectedKeys,
    size: props.size,
    density: props.density,
    orientation: props.orientation,
    staticColor: props.staticColor,
    iconPlacement: props.iconPlacement,
    isQuiet: props.isQuiet,
    isEmphasized: props.isEmphasized,
    isJustified: props.isJustified,
    isDisabled: props.isDisabled,
  });
}
