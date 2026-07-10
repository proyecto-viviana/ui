// Keyboard drag-and-drop surface, hosted on a reorderable ListBox. The oracle is
// the react-aria-components `useDragAndDrop` + `useListData` reorderable-ListBox
// story (RAC 1.19.0); the port is the Solid `useDragAndDrop`/`createListData`
// pair driving `solidaria-components` ListBox. selectionMode is fixed `multiple`
// to mirror the canonical RAC `ListBoxDnd` example — the reorder itself only
// needs a draggable source + `onReorder`, so the single prop here is the
// selection mode the drag source lives under.
export const dndListBoxSelectionModeOptions = ["multiple", "single"] as const;

export type DndListBoxDemoSelectionMode = (typeof dndListBoxSelectionModeOptions)[number];

export interface DndListBoxDemoItem {
  id: string;
  label: string;
}

export const dndListBoxDemoItems: DndListBoxDemoItem[] = [
  { id: "read", label: "Read" },
  { id: "write", label: "Write" },
  { id: "admin", label: "Admin" },
];

export interface DndListBoxDemoProps {
  selectionMode: DndListBoxDemoSelectionMode;
}

export const dndListBoxDemoDefaults: DndListBoxDemoProps = {
  selectionMode: "multiple",
};

function isOneOf<T extends readonly string[]>(
  value: string | null | undefined,
  options: T,
): value is T[number] {
  return value != null && options.includes(value);
}

export function normalizeDndListBoxDemoProps(
  props: Partial<DndListBoxDemoProps> = {},
): DndListBoxDemoProps {
  return {
    selectionMode: isOneOf(props.selectionMode, dndListBoxSelectionModeOptions)
      ? props.selectionMode
      : dndListBoxDemoDefaults.selectionMode,
  };
}

export function dndListBoxDemoPropsFromSearch(search: string): DndListBoxDemoProps {
  const params = new URLSearchParams(search);
  const selectionMode = params.get("selectionMode");

  return normalizeDndListBoxDemoProps({
    selectionMode: isOneOf(selectionMode, dndListBoxSelectionModeOptions)
      ? selectionMode
      : dndListBoxDemoDefaults.selectionMode,
  });
}

export function dndListBoxDemoPropsFromWindow(): DndListBoxDemoProps {
  if (typeof window === "undefined") {
    return dndListBoxDemoDefaults;
  }

  return dndListBoxDemoPropsFromSearch(window.location.search);
}

export function serializeDndListBoxDemoProps(props: DndListBoxDemoProps): string {
  return JSON.stringify(normalizeDndListBoxDemoProps(props));
}

/** Serialize the live item order (ids) — the observable a reorder cert diffs. */
export function serializeDndListBoxOrder(items: readonly DndListBoxDemoItem[]): string {
  return JSON.stringify(items.map((item) => item.id));
}

export { comparisonControlsEvent } from "./button-demo";
