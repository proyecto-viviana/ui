export const actionGroupSelectionModeOptions = ["none", "single", "multiple"] as const;
export const actionGroupOrientationOptions = ["horizontal", "vertical"] as const;
// ar-AE is the D10 (RTL/i18n) driver's pinned locale (recertification.md). The
// ActionGroup fixture routes `?locale` into the S2 `Provider` so the D10 RTL
// driver can re-run D5 mirrored, certifying the RTL-flipped Left/Right nav in a
// horizontal group (v3 `useActionGroup` `flipDirection = rtl && horizontal`).
export const actionGroupDemoLocaleOptions = ["en-US", "ar-AE"] as const;

export type ActionGroupDemoSelectionMode = (typeof actionGroupSelectionModeOptions)[number];
export type ActionGroupDemoOrientation = (typeof actionGroupOrientationOptions)[number];
export type ActionGroupDemoLocale = (typeof actionGroupDemoLocaleOptions)[number];

export interface ActionGroupDemoItem {
  id: string;
  label: string;
}

export const actionGroupDemoItems: ActionGroupDemoItem[] = [
  { id: "bold", label: "Bold" },
  { id: "italic", label: "Italic" },
  { id: "underline", label: "Underline" },
];

export interface ActionGroupDemoProps {
  selectionMode: ActionGroupDemoSelectionMode;
  orientation: ActionGroupDemoOrientation;
  /** Comma-separated item ids preselected at rest (D6 aria-checked coverage). */
  defaultSelectedKeys: string;
  /** Comma-separated item ids rendered disabled. */
  disabledKeys: string;
}

export const actionGroupDemoDefaults: ActionGroupDemoProps = {
  selectionMode: "none",
  orientation: "horizontal",
  defaultSelectedKeys: "",
  disabledKeys: "",
};

function isOneOf<T extends readonly string[]>(
  value: string | null | undefined,
  options: T,
): value is T[number] {
  return value != null && options.includes(value);
}

/** Parse a comma-separated key list into the fixed item ids (order-stable). */
export function actionGroupKeysFromValue(value: string | null | undefined): string[] {
  if (!value) return [];
  const requested = new Set(
    value
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean),
  );
  return actionGroupDemoItems.map((item) => item.id).filter((id) => requested.has(id));
}

export function normalizeActionGroupDemoProps(
  props: Partial<ActionGroupDemoProps> = {},
): ActionGroupDemoProps {
  return {
    selectionMode: isOneOf(props.selectionMode, actionGroupSelectionModeOptions)
      ? props.selectionMode
      : actionGroupDemoDefaults.selectionMode,
    orientation: isOneOf(props.orientation, actionGroupOrientationOptions)
      ? props.orientation
      : actionGroupDemoDefaults.orientation,
    defaultSelectedKeys: actionGroupKeysFromValue(props.defaultSelectedKeys).join(","),
    disabledKeys: actionGroupKeysFromValue(props.disabledKeys).join(","),
  };
}

export function actionGroupDemoPropsFromSearch(search: string): ActionGroupDemoProps {
  const params = new URLSearchParams(search);
  const selectionMode = params.get("selectionMode");
  const orientation = params.get("orientation");
  return normalizeActionGroupDemoProps({
    selectionMode: isOneOf(selectionMode, actionGroupSelectionModeOptions)
      ? selectionMode
      : undefined,
    orientation: isOneOf(orientation, actionGroupOrientationOptions) ? orientation : undefined,
    defaultSelectedKeys: params.get("defaultSelectedKeys") ?? undefined,
    disabledKeys: params.get("disabledKeys") ?? undefined,
  });
}

export function actionGroupDemoPropsFromWindow(): ActionGroupDemoProps {
  if (typeof window === "undefined") {
    return actionGroupDemoDefaults;
  }
  return actionGroupDemoPropsFromSearch(window.location.search);
}

export function serializeActionGroupDemoProps(props: ActionGroupDemoProps): string {
  return JSON.stringify(normalizeActionGroupDemoProps(props));
}

// Locale is threaded separately from the demo props: the D10 (RTL/i18n) driver
// re-mounts the fixture with `?locale=ar-AE` so the S2 `Provider` computes an
// rtl direction, certifying the RTL-flipped ArrowRight/ArrowLeft nav.
export function actionGroupDemoLocaleFromSearch(search: string): ActionGroupDemoLocale | undefined {
  const locale = new URLSearchParams(search).get("locale");
  return isOneOf(locale, actionGroupDemoLocaleOptions) ? locale : undefined;
}

export function actionGroupDemoLocaleFromWindow(): ActionGroupDemoLocale | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  return actionGroupDemoLocaleFromSearch(window.location.search);
}

export { comparisonControlsEvent } from "./button-demo";
