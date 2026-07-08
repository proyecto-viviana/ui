export const listBoxSelectionModeOptions = ["single", "multiple", "none"] as const;

export type ListBoxDemoSelectionMode = (typeof listBoxSelectionModeOptions)[number];

export interface ListBoxDemoItem {
  id: string;
  label: string;
}

export const listBoxDemoItems: ListBoxDemoItem[] = [
  { id: "read", label: "Read" },
  { id: "write", label: "Write" },
  { id: "admin", label: "Admin" },
];

export interface ListBoxDemoProps {
  selectionMode: ListBoxDemoSelectionMode;
}

export const listBoxDemoDefaults: ListBoxDemoProps = {
  selectionMode: "single",
};

function isOneOf<T extends readonly string[]>(
  value: string | null | undefined,
  options: T,
): value is T[number] {
  return value != null && options.includes(value);
}

export function normalizeListBoxDemoProps(props: Partial<ListBoxDemoProps> = {}): ListBoxDemoProps {
  return {
    selectionMode: isOneOf(props.selectionMode, listBoxSelectionModeOptions)
      ? props.selectionMode
      : listBoxDemoDefaults.selectionMode,
  };
}

export function listBoxDemoPropsFromSearch(search: string): ListBoxDemoProps {
  const params = new URLSearchParams(search);
  const selectionMode = params.get("selectionMode");

  return normalizeListBoxDemoProps({
    selectionMode: isOneOf(selectionMode, listBoxSelectionModeOptions)
      ? selectionMode
      : listBoxDemoDefaults.selectionMode,
  });
}

export function listBoxDemoPropsFromWindow(): ListBoxDemoProps {
  if (typeof window === "undefined") {
    return listBoxDemoDefaults;
  }

  return listBoxDemoPropsFromSearch(window.location.search);
}

export function serializeListBoxDemoProps(props: ListBoxDemoProps): string {
  return JSON.stringify(normalizeListBoxDemoProps(props));
}

export { comparisonControlsEvent } from "./button-demo";
