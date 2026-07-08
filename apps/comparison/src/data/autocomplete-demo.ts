export const autocompleteSelectionModeOptions = ["none", "single", "multiple"] as const;

export type AutocompleteDemoSelectionMode = (typeof autocompleteSelectionModeOptions)[number];

export interface AutocompleteDemoItem {
  id: string;
  label: string;
}

// A fixed fruit list chosen so a single typed character produces a stable,
// non-trivial filtered subset the D5 virtual-focus walk can navigate: typing
// "a" keeps Apple/Banana/Grape/Mango/Orange/Peach (drops Cherry/Lemon), in DOM
// order, on both stacks — the contains() filter is locale-collated identically
// (react-aria useFilter vs solidaria createFilter, both sensitivity: "base").
export const autocompleteDemoItems: AutocompleteDemoItem[] = [
  { id: "apple", label: "Apple" },
  { id: "banana", label: "Banana" },
  { id: "cherry", label: "Cherry" },
  { id: "grape", label: "Grape" },
  { id: "lemon", label: "Lemon" },
  { id: "mango", label: "Mango" },
  { id: "orange", label: "Orange" },
  { id: "peach", label: "Peach" },
];

export interface AutocompleteDemoProps {
  selectionMode: AutocompleteDemoSelectionMode;
}

export const autocompleteDemoDefaults: AutocompleteDemoProps = {
  selectionMode: "none",
};

function isOneOf<T extends readonly string[]>(
  value: string | null | undefined,
  options: T,
): value is T[number] {
  return value != null && options.includes(value);
}

export function normalizeAutocompleteDemoProps(
  props: Partial<AutocompleteDemoProps> = {},
): AutocompleteDemoProps {
  return {
    selectionMode: isOneOf(props.selectionMode, autocompleteSelectionModeOptions)
      ? props.selectionMode
      : autocompleteDemoDefaults.selectionMode,
  };
}

export function autocompleteDemoPropsFromSearch(search: string): AutocompleteDemoProps {
  const params = new URLSearchParams(search);
  const selectionMode = params.get("selectionMode");

  return normalizeAutocompleteDemoProps({
    selectionMode: isOneOf(selectionMode, autocompleteSelectionModeOptions)
      ? selectionMode
      : autocompleteDemoDefaults.selectionMode,
  });
}

export function autocompleteDemoPropsFromWindow(): AutocompleteDemoProps {
  if (typeof window === "undefined") {
    return autocompleteDemoDefaults;
  }

  return autocompleteDemoPropsFromSearch(window.location.search);
}

export function serializeAutocompleteDemoProps(props: AutocompleteDemoProps): string {
  return JSON.stringify(normalizeAutocompleteDemoProps(props));
}

export { comparisonControlsEvent } from "./button-demo";
