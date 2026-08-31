export const gridListSelectionModeOptions = ["single", "multiple", "none"] as const;
export const gridListOrientationOptions = ["vertical", "horizontal"] as const;
// How arrow keys behave across a row's focusable children. Under "arrow" (the
// default) the ROW owns the inline axis (Left/Right = intra-row focus movement,
// a no-op for text-only rows); only under "tab" does the container step between
// ROWS on the inline axis, so the horizontal D5/D10 walks that certify
// orientation-aware Left/Right nav must run in "tab" mode. Mirrors RAC's
// `keyboardNavigationBehavior` (GridList → useSelectableCollection).
export const gridListKeyboardNavigationOptions = ["arrow", "tab"] as const;
// ar-AE is the D10 (RTL/i18n) driver's pinned locale (see certification.md). The
// GridList fixture routes `?locale` into the S2 `Provider` so the D10 RTL driver
// can re-run D5 mirrored, certifying the RTL-flipped Left/Right nav in a
// horizontal grid (createGridList.ts ArrowRight/ArrowLeft direction branch).
export const gridListDemoLocaleOptions = ["en-US", "ar-AE"] as const;

export type GridListDemoSelectionMode = (typeof gridListSelectionModeOptions)[number];
export type GridListDemoOrientation = (typeof gridListOrientationOptions)[number];
export type GridListDemoKeyboardNavigation = (typeof gridListKeyboardNavigationOptions)[number];

export interface GridListDemoItem {
  id: string;
  label: string;
}

export const gridListDemoItems: GridListDemoItem[] = [
  { id: "read", label: "Read" },
  { id: "write", label: "Write" },
  { id: "admin", label: "Admin" },
];

export interface GridListDemoProps {
  selectionMode: GridListDemoSelectionMode;
  orientation: GridListDemoOrientation;
  keyboardNavigationBehavior: GridListDemoKeyboardNavigation;
}

export const gridListDemoDefaults: GridListDemoProps = {
  selectionMode: "single",
  orientation: "vertical",
  keyboardNavigationBehavior: "arrow",
};

function isOneOf<T extends readonly string[]>(
  value: string | null | undefined,
  options: T,
): value is T[number] {
  return value != null && options.includes(value);
}

export function normalizeGridListDemoProps(
  props: Partial<GridListDemoProps> = {},
): GridListDemoProps {
  return {
    selectionMode: isOneOf(props.selectionMode, gridListSelectionModeOptions)
      ? props.selectionMode
      : gridListDemoDefaults.selectionMode,
    orientation: isOneOf(props.orientation, gridListOrientationOptions)
      ? props.orientation
      : gridListDemoDefaults.orientation,
    keyboardNavigationBehavior: isOneOf(
      props.keyboardNavigationBehavior,
      gridListKeyboardNavigationOptions,
    )
      ? props.keyboardNavigationBehavior
      : gridListDemoDefaults.keyboardNavigationBehavior,
  };
}

export function gridListDemoPropsFromSearch(search: string): GridListDemoProps {
  const params = new URLSearchParams(search);
  const selectionMode = params.get("selectionMode");
  const orientation = params.get("orientation");
  const keyboardNavigationBehavior = params.get("keyboardNavigationBehavior");

  return normalizeGridListDemoProps({
    selectionMode: isOneOf(selectionMode, gridListSelectionModeOptions)
      ? selectionMode
      : gridListDemoDefaults.selectionMode,
    orientation: isOneOf(orientation, gridListOrientationOptions)
      ? orientation
      : gridListDemoDefaults.orientation,
    keyboardNavigationBehavior: isOneOf(
      keyboardNavigationBehavior,
      gridListKeyboardNavigationOptions,
    )
      ? keyboardNavigationBehavior
      : gridListDemoDefaults.keyboardNavigationBehavior,
  });
}

export function gridListDemoPropsFromWindow(): GridListDemoProps {
  if (typeof window === "undefined") {
    return gridListDemoDefaults;
  }

  return gridListDemoPropsFromSearch(window.location.search);
}

export function serializeGridListDemoProps(props: GridListDemoProps): string {
  return JSON.stringify(normalizeGridListDemoProps(props));
}

// Locale is threaded separately from the demo props: the D10 (RTL/i18n) driver
// re-mounts the fixture with `?locale=ar-AE` so the S2 `Provider` computes
// `dir="rtl"`, and the GridList fixture passes it straight into that Provider.
export function gridListDemoLocaleFromSearch(search: string) {
  const locale = new URLSearchParams(search).get("locale");
  return isOneOf(locale, gridListDemoLocaleOptions) ? locale : undefined;
}

export function gridListDemoLocaleFromWindow() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return gridListDemoLocaleFromSearch(window.location.search);
}

export { comparisonControlsEvent } from "./button-demo";
