import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const actionMenuSizeOptions = ["XS", "S", "M", "L", "XL"] as const;
export const actionMenuMenuSizeOptions = ["S", "M", "L", "XL"] as const;
export const actionMenuAlignOptions = ["start", "end"] as const;
export const actionMenuDirectionOptions = [
  "bottom",
  "top",
  "left",
  "right",
  "start",
  "end",
] as const;

export type ActionMenuDemoSize = (typeof actionMenuSizeOptions)[number];
export type ActionMenuDemoMenuSize = (typeof actionMenuMenuSizeOptions)[number];
export type ActionMenuDemoAlign = (typeof actionMenuAlignOptions)[number];
export type ActionMenuDemoDirection = (typeof actionMenuDirectionOptions)[number];

export interface ActionMenuDemoProps {
  size: ActionMenuDemoSize;
  menuSize: ActionMenuDemoMenuSize;
  align: ActionMenuDemoAlign;
  direction: ActionMenuDemoDirection;
  isQuiet: boolean;
  isDisabled: boolean;
}

export const actionMenuDemoDefaults: ActionMenuDemoProps = {
  size: "M",
  menuSize: "M",
  align: "start",
  direction: "bottom",
  isQuiet: false,
  isDisabled: false,
};

export const actionMenuItems = [
  {
    id: "copy",
    label: "Copy",
    description: "Copy the selected text",
    shortcut: "Cmd+C",
  },
  {
    id: "cut",
    label: "Cut",
    description: "Cut the selected text",
    shortcut: "Cmd+X",
  },
  {
    id: "paste",
    label: "Paste",
    description: "Paste the copied text",
    shortcut: "Cmd+V",
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

export function normalizeActionMenuDemoProps(
  props: Partial<ActionMenuDemoProps> = {},
): ActionMenuDemoProps {
  const size = String(props.size ?? "");
  const menuSize = String(props.menuSize ?? "");
  const align = String(props.align ?? "");
  const direction = String(props.direction ?? "");

  return {
    size: isOneOf(size, actionMenuSizeOptions) ? size : actionMenuDemoDefaults.size,
    menuSize: isOneOf(menuSize, actionMenuMenuSizeOptions)
      ? menuSize
      : actionMenuDemoDefaults.menuSize,
    align: isOneOf(align, actionMenuAlignOptions) ? align : actionMenuDemoDefaults.align,
    direction: isOneOf(direction, actionMenuDirectionOptions)
      ? direction
      : actionMenuDemoDefaults.direction,
    isQuiet: booleanParam(props.isQuiet),
    isDisabled: booleanParam(props.isDisabled),
  };
}

export function actionMenuDemoPropsFromSearch(search: string): ActionMenuDemoProps {
  const params = new URLSearchParams(search);

  return normalizeActionMenuDemoProps({
    size: params.get("size") ?? actionMenuDemoDefaults.size,
    menuSize: params.get("menuSize") ?? actionMenuDemoDefaults.menuSize,
    align: params.get("align") ?? actionMenuDemoDefaults.align,
    direction: params.get("direction") ?? actionMenuDemoDefaults.direction,
    isQuiet: params.get("isQuiet") === "true",
    isDisabled: params.get("isDisabled") === "true",
  });
}

export function actionMenuDemoPropsFromWindow(): ActionMenuDemoProps {
  if (typeof window === "undefined") {
    return actionMenuDemoDefaults;
  }

  return actionMenuDemoPropsFromSearch(window.location.search);
}

export function serializeActionMenuDemoProps(props: ActionMenuDemoProps) {
  return JSON.stringify({
    size: props.size,
    menuSize: props.menuSize,
    align: props.align,
    direction: props.direction,
    isQuiet: props.isQuiet,
    isDisabled: props.isDisabled,
  });
}
