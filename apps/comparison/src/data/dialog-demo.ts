import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const dialogSizeOptions = ["S", "M", "L", "XL"] as const;
export const dialogRoleOptions = ["dialog", "alertdialog"] as const;

export type DialogDemoSize = (typeof dialogSizeOptions)[number];
export type DialogDemoRole = (typeof dialogRoleOptions)[number];

export interface DialogDemoProps {
  triggerLabel: string;
  title: string;
  body: string;
  size: DialogDemoSize;
  role: DialogDemoRole;
  isOpen: boolean;
  isDismissible: boolean;
  isKeyboardDismissDisabled: boolean;
}

export const dialogDemoDefaults: DialogDemoProps = {
  triggerLabel: "Open Dialog",
  title: "Review Changes",
  body: "Dialog focus and dismissal are compared from this island.",
  size: "M",
  role: "dialog",
  isOpen: false,
  isDismissible: true,
  isKeyboardDismissDisabled: false,
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

export function normalizeDialogDemoProps(props: Partial<DialogDemoProps> = {}): DialogDemoProps {
  return {
    triggerLabel:
      typeof props.triggerLabel === "string" && props.triggerLabel
        ? props.triggerLabel
        : dialogDemoDefaults.triggerLabel,
    title: typeof props.title === "string" && props.title ? props.title : dialogDemoDefaults.title,
    body: typeof props.body === "string" && props.body ? props.body : dialogDemoDefaults.body,
    size: isOneOf(props.size, dialogSizeOptions) ? props.size : dialogDemoDefaults.size,
    role: isOneOf(props.role, dialogRoleOptions) ? props.role : dialogDemoDefaults.role,
    isOpen: props.isOpen === true,
    isDismissible: props.isDismissible !== false,
    isKeyboardDismissDisabled: props.isKeyboardDismissDisabled === true,
  };
}

export function dialogDemoPropsFromSearch(search: string): DialogDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");
  const role = params.get("role");

  return normalizeDialogDemoProps({
    triggerLabel: params.get("triggerLabel") || dialogDemoDefaults.triggerLabel,
    title: params.get("title") || dialogDemoDefaults.title,
    body: params.get("body") || dialogDemoDefaults.body,
    size: isOneOf(size, dialogSizeOptions) ? size : dialogDemoDefaults.size,
    role: isOneOf(role, dialogRoleOptions) ? role : dialogDemoDefaults.role,
    isOpen: booleanParam(params.get("isOpen")),
    isDismissible: params.has("isDismissible")
      ? booleanParam(params.get("isDismissible"))
      : dialogDemoDefaults.isDismissible,
    isKeyboardDismissDisabled: booleanParam(params.get("isKeyboardDismissDisabled")),
  });
}

export function dialogDemoPropsFromWindow(): DialogDemoProps {
  if (typeof window === "undefined") {
    return dialogDemoDefaults;
  }

  return dialogDemoPropsFromSearch(window.location.search);
}

export function serializeDialogDemoProps(props: DialogDemoProps) {
  return JSON.stringify(normalizeDialogDemoProps(props));
}
