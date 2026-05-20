import { comparisonControlsEvent } from "./button-demo";
import { buttonIconPlacementOptions, type ButtonDemoIconPlacement } from "./button-demo";

export { comparisonControlsEvent };

export const segmentedControlKeyOptions = ["list", "grid", "board"] as const;
export const segmentedControlSelectionSourceOptions = [
  "selectedKey",
  "defaultSelectedKey",
] as const;
export const segmentedControlDisabledKeyOptions = ["none", ...segmentedControlKeyOptions] as const;
export const segmentedControlIconPlacementOptions = buttonIconPlacementOptions;

export type SegmentedControlKey = (typeof segmentedControlKeyOptions)[number];
export type SegmentedControlSelectionSource =
  (typeof segmentedControlSelectionSourceOptions)[number];
export type SegmentedControlDisabledKey = (typeof segmentedControlDisabledKeyOptions)[number];
export type SegmentedControlIconPlacement = ButtonDemoIconPlacement;

export interface SegmentedControlItemDemo {
  id: SegmentedControlKey;
  label: string;
}

export interface SegmentedControlDemoProps {
  selectionSource: SegmentedControlSelectionSource;
  selectedKey: SegmentedControlKey;
  defaultSelectedKey: SegmentedControlKey;
  disabledKey: SegmentedControlDisabledKey;
  iconPlacement: SegmentedControlIconPlacement;
  isJustified: boolean;
  isDisabled: boolean;
}

export const segmentedControlItems: readonly SegmentedControlItemDemo[] = [
  { id: "list", label: "List" },
  { id: "grid", label: "Grid" },
  { id: "board", label: "Board" },
];

export const segmentedControlDemoDefaults: SegmentedControlDemoProps = {
  selectionSource: "selectedKey",
  selectedKey: "list",
  defaultSelectedKey: "grid",
  disabledKey: "none",
  iconPlacement: "none",
  isJustified: false,
  isDisabled: false,
};

function isOneOf<T extends readonly string[]>(
  value: string | null | undefined,
  options: T,
): value is T[number] {
  return value != null && options.includes(value);
}

function booleanParam(value: string | boolean | null | undefined) {
  return value === true || value === "true" || value === "on" || value === "1";
}

export function initialSegmentedControlSelectedKey(
  props: Pick<SegmentedControlDemoProps, "selectionSource" | "selectedKey" | "defaultSelectedKey">,
) {
  return props.selectionSource === "defaultSelectedKey"
    ? props.defaultSelectedKey
    : props.selectedKey;
}

export function normalizeSegmentedControlDemoProps(
  props: Partial<SegmentedControlDemoProps> = {},
): SegmentedControlDemoProps {
  return {
    selectionSource: isOneOf(props.selectionSource, segmentedControlSelectionSourceOptions)
      ? props.selectionSource
      : segmentedControlDemoDefaults.selectionSource,
    selectedKey: isOneOf(props.selectedKey, segmentedControlKeyOptions)
      ? props.selectedKey
      : segmentedControlDemoDefaults.selectedKey,
    defaultSelectedKey: isOneOf(props.defaultSelectedKey, segmentedControlKeyOptions)
      ? props.defaultSelectedKey
      : segmentedControlDemoDefaults.defaultSelectedKey,
    disabledKey: isOneOf(props.disabledKey, segmentedControlDisabledKeyOptions)
      ? props.disabledKey
      : segmentedControlDemoDefaults.disabledKey,
    iconPlacement: isOneOf(props.iconPlacement, segmentedControlIconPlacementOptions)
      ? props.iconPlacement
      : segmentedControlDemoDefaults.iconPlacement,
    isJustified: props.isJustified === true,
    isDisabled: props.isDisabled === true,
  };
}

export function segmentedControlDemoPropsFromSearch(search: string): SegmentedControlDemoProps {
  const params = new URLSearchParams(search);
  const selectionSource = params.get("selectionSource");
  const selectedKey = params.get("selectedKey");
  const defaultSelectedKey = params.get("defaultSelectedKey");
  const disabledKey = params.get("disabledKey");
  const iconPlacement = params.get("iconPlacement");

  return normalizeSegmentedControlDemoProps({
    selectionSource: isOneOf(selectionSource, segmentedControlSelectionSourceOptions)
      ? selectionSource
      : segmentedControlDemoDefaults.selectionSource,
    selectedKey: isOneOf(selectedKey, segmentedControlKeyOptions)
      ? selectedKey
      : segmentedControlDemoDefaults.selectedKey,
    defaultSelectedKey: isOneOf(defaultSelectedKey, segmentedControlKeyOptions)
      ? defaultSelectedKey
      : segmentedControlDemoDefaults.defaultSelectedKey,
    disabledKey: isOneOf(disabledKey, segmentedControlDisabledKeyOptions)
      ? disabledKey
      : segmentedControlDemoDefaults.disabledKey,
    iconPlacement: isOneOf(iconPlacement, segmentedControlIconPlacementOptions)
      ? iconPlacement
      : segmentedControlDemoDefaults.iconPlacement,
    isJustified: booleanParam(params.get("isJustified")),
    isDisabled: booleanParam(params.get("isDisabled")),
  });
}

export function segmentedControlDemoPropsFromWindow(): SegmentedControlDemoProps {
  if (typeof window === "undefined") {
    return segmentedControlDemoDefaults;
  }

  return segmentedControlDemoPropsFromSearch(window.location.search);
}

export function serializeSegmentedControlDemoProps(props: SegmentedControlDemoProps) {
  return JSON.stringify({
    selectionSource: props.selectionSource,
    selectedKey: props.selectedKey,
    defaultSelectedKey: props.defaultSelectedKey,
    disabledKey: props.disabledKey,
    iconPlacement: props.iconPlacement,
    isJustified: props.isJustified,
    isDisabled: props.isDisabled,
  });
}
