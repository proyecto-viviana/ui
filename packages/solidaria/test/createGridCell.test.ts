import { describe, expect, it } from "vite-plus/test";
import { createRoot } from "solid-js";
import { createGridCell } from "../src/grid/createGridCell";

function readCell(options: { index: number; column?: number; isVirtualized?: boolean }) {
  let ariaColIndex: unknown;
  const dispose = createRoot((dispose) => {
    const node = {
      type: "cell" as const,
      key: "cell",
      value: null,
      textValue: "",
      level: 0,
      index: options.index,
      column: options.column,
      hasChildNodes: false,
      childNodes: [],
    };
    const state = {
      collection: {
        getItem: () => node,
      },
      selectionMode: "none" as const,
      focusedKey: null,
      isSelected: () => false,
      isDisabled: () => false,
      setFocusedKey: () => {},
    };
    const cell = createGridCell(
      () => ({ key: "cell", parentKey: "row", isVirtualized: options.isVirtualized }),
      () => state as never,
      () => null,
    );
    ariaColIndex = cell.cellProps["aria-colindex"];
    return dispose;
  });
  dispose();
  return ariaColIndex;
}

describe("createGridCell", () => {
  it("uses the column index when a virtualized cell has one", () => {
    expect(readCell({ index: 4, column: 0, isVirtualized: true })).toBe(1);
  });

  it("falls back to the node index when a virtualized cell has no column index", () => {
    expect(readCell({ index: 2, isVirtualized: true })).toBe(3);
  });

  it("exposes the column index when the cell is not virtualized", () => {
    expect(readCell({ index: 4, column: 1 })).toBe(2);
  });

  it("omits the column index when a non-virtualized cell has none", () => {
    expect(readCell({ index: 2 })).toBeUndefined();
  });
});
