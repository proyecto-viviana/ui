import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const actionBarSelectedItemCountOptions = ["0", "1", "3", "all"] as const;

export type ActionBarSelectedItemCountOption = (typeof actionBarSelectedItemCountOptions)[number];
export type ActionBarSelectedItemCount = number | "all";

export interface ActionBarDemoProps {
  selectedItemCount: ActionBarSelectedItemCount;
  isEmphasized: boolean;
  useScrollRef: boolean;
}

export const actionBarDemoDefaults: ActionBarDemoProps = {
  selectedItemCount: 3,
  isEmphasized: false,
  useScrollRef: false,
};

function normalizeSelectedItemCount(value: unknown): ActionBarSelectedItemCount {
  if (value === "all") {
    return "all";
  }

  const text = String(value ?? actionBarDemoDefaults.selectedItemCount);
  if (actionBarSelectedItemCountOptions.includes(text as ActionBarSelectedItemCountOption)) {
    return Number(text);
  }

  return actionBarDemoDefaults.selectedItemCount;
}

export function normalizeActionBarDemoProps(
  props: Partial<ActionBarDemoProps> = {},
): ActionBarDemoProps {
  return {
    selectedItemCount: normalizeSelectedItemCount(props.selectedItemCount),
    isEmphasized: props.isEmphasized === true,
    useScrollRef: props.useScrollRef === true,
  };
}

export function actionBarDemoPropsFromSearch(search: string): ActionBarDemoProps {
  const params = new URLSearchParams(search);
  return normalizeActionBarDemoProps({
    selectedItemCount: params.get("selectedItemCount") ?? actionBarDemoDefaults.selectedItemCount,
    isEmphasized: params.get("isEmphasized") === "true",
    useScrollRef: params.get("useScrollRef") === "true",
  });
}

export function actionBarDemoPropsFromWindow(): ActionBarDemoProps {
  if (typeof window === "undefined") {
    return actionBarDemoDefaults;
  }

  return actionBarDemoPropsFromSearch(window.location.search);
}

export function serializeActionBarDemoProps(props: ActionBarDemoProps) {
  return JSON.stringify({
    selectedItemCount: props.selectedItemCount,
    isEmphasized: props.isEmphasized,
    useScrollRef: props.useScrollRef,
  });
}
