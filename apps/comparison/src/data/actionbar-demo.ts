import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const actionBarSelectedItemCountOptions = ["0", "1", "3", "all"] as const;

export type ActionBarSelectedItemCountOption = (typeof actionBarSelectedItemCountOptions)[number];
export type ActionBarSelectedItemCount = number | "all";

export interface ActionBarDemoProps {
  selectedItemCount: ActionBarSelectedItemCount;
  isEmphasized: boolean;
  useScrollRef: boolean;
  useCollection: boolean;
}

export const actionBarDemoDefaults: ActionBarDemoProps = {
  selectedItemCount: 3,
  isEmphasized: false,
  useScrollRef: false,
  useCollection: false,
};

export const actionBarCollectionItems = [
  { id: "reports", label: "Q4 reports", description: "Financial and planning exports" },
  { id: "roadmap", label: "Roadmap", description: "Prioritized product milestones" },
  { id: "research", label: "Research notes", description: "Interview synthesis and sources" },
] as const;

export function actionBarSelectedKeysFromCount(count: ActionBarSelectedItemCount): Set<string> {
  if (count === "all") {
    return new Set(actionBarCollectionItems.map((item) => item.id));
  }

  return new Set(actionBarCollectionItems.slice(0, count).map((item) => item.id));
}

export function serializeActionBarSelectedKeys(keys: Iterable<unknown>): string {
  return Array.from(keys, String).join(",");
}

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
    useCollection: props.useCollection === true,
  };
}

export function actionBarDemoPropsFromSearch(search: string): ActionBarDemoProps {
  const params = new URLSearchParams(search);
  return normalizeActionBarDemoProps({
    selectedItemCount: normalizeSelectedItemCount(
      params.get("selectedItemCount") ?? actionBarDemoDefaults.selectedItemCount,
    ),
    isEmphasized: params.get("isEmphasized") === "true",
    useScrollRef: params.get("useScrollRef") === "true",
    useCollection: params.get("useCollection") === "true",
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
    useCollection: props.useCollection,
  });
}
