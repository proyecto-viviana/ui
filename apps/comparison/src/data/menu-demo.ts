import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const menuTriggerSizeOptions = ["XS", "S", "M", "L", "XL"] as const;
export const menuSizeOptions = ["S", "M", "L", "XL"] as const;
export const menuAlignOptions = ["start", "end"] as const;
export const menuDirectionOptions = ["bottom", "top", "left", "right", "start", "end"] as const;
export const menuSelectionModeOptions = ["none", "single", "multiple"] as const;

export type MenuDemoTriggerSize = (typeof menuTriggerSizeOptions)[number];
export type MenuDemoSize = (typeof menuSizeOptions)[number];
export type MenuDemoAlign = (typeof menuAlignOptions)[number];
export type MenuDemoDirection = (typeof menuDirectionOptions)[number];
export type MenuDemoSelectionMode = (typeof menuSelectionModeOptions)[number];

export interface MenuDemoProps {
  triggerSize: MenuDemoTriggerSize;
  size: MenuDemoSize;
  align: MenuDemoAlign;
  direction: MenuDemoDirection;
  shouldFlip: boolean;
  selectionMode: MenuDemoSelectionMode;
  isDisabled: boolean;
}

export const menuDemoDefaults: MenuDemoProps = {
  triggerSize: "M",
  size: "M",
  align: "start",
  direction: "bottom",
  shouldFlip: true,
  selectionMode: "none",
  isDisabled: false,
};

export const menuItems = [
  {
    id: "copy",
    label: "Copy",
    description: "Copy the selected layer",
    shortcut: "Cmd+C",
  },
  {
    id: "duplicate",
    label: "Duplicate",
    description: "Create a matching layer",
    shortcut: "Cmd+D",
  },
  {
    id: "delete",
    label: "Delete",
    description: "Remove the selected layer",
    shortcut: "Del",
  },
] as const;

function isOneOf<T extends readonly string[]>(
  value: string | null | undefined,
  options: T,
): value is T[number] {
  return value != null && options.includes(value);
}

function booleanParam(value: unknown) {
  return value === true || value === "true" || value === "on" || value === "1";
}

export function normalizeMenuDemoProps(props: Partial<MenuDemoProps> = {}): MenuDemoProps {
  const triggerSize = String(props.triggerSize ?? "");
  const size = String(props.size ?? "");
  const align = String(props.align ?? "");
  const direction = String(props.direction ?? "");
  const selectionMode = String(props.selectionMode ?? "");

  return {
    triggerSize: isOneOf(triggerSize, menuTriggerSizeOptions)
      ? triggerSize
      : menuDemoDefaults.triggerSize,
    size: isOneOf(size, menuSizeOptions) ? size : menuDemoDefaults.size,
    align: isOneOf(align, menuAlignOptions) ? align : menuDemoDefaults.align,
    direction: isOneOf(direction, menuDirectionOptions) ? direction : menuDemoDefaults.direction,
    shouldFlip:
      props.shouldFlip == null ? menuDemoDefaults.shouldFlip : booleanParam(props.shouldFlip),
    selectionMode: isOneOf(selectionMode, menuSelectionModeOptions)
      ? selectionMode
      : menuDemoDefaults.selectionMode,
    isDisabled: booleanParam(props.isDisabled),
  };
}

export function menuDemoPropsFromSearch(search: string): MenuDemoProps {
  const params = new URLSearchParams(search);

  return normalizeMenuDemoProps({
    triggerSize: params.get("triggerSize") ?? menuDemoDefaults.triggerSize,
    size: params.get("size") ?? menuDemoDefaults.size,
    align: params.get("align") ?? menuDemoDefaults.align,
    direction: params.get("direction") ?? menuDemoDefaults.direction,
    shouldFlip: params.get("shouldFlip") ?? menuDemoDefaults.shouldFlip,
    selectionMode: params.get("selectionMode") ?? menuDemoDefaults.selectionMode,
    isDisabled: params.get("isDisabled") === "true",
  });
}

export function menuDemoPropsFromWindow(): MenuDemoProps {
  if (typeof window === "undefined") {
    return menuDemoDefaults;
  }

  return menuDemoPropsFromSearch(window.location.search);
}

export function serializeMenuDemoProps(props: MenuDemoProps) {
  return JSON.stringify({
    triggerSize: props.triggerSize,
    size: props.size,
    align: props.align,
    direction: props.direction,
    shouldFlip: props.shouldFlip,
    selectionMode: props.selectionMode,
    isDisabled: props.isDisabled,
  });
}

export function defaultMenuSelectedKeys(selectionMode: MenuDemoSelectionMode): Set<string> {
  if (selectionMode === "multiple") {
    return new Set(["copy", "duplicate"]);
  }
  if (selectionMode === "single") {
    return new Set(["copy"]);
  }
  return new Set();
}

export function serializeMenuSelectedKeys(keys: Iterable<string>): string {
  return Array.from(keys).sort().join(",");
}
