import { describe, expect, it } from "vite-plus/test";
import { createRoot } from "solid-js";
import { createTableCell } from "../src/table/createTableCell";

function readCell(options: { index: number; column?: number; isVirtualized?: boolean }) {
  let ariaColIndex: unknown;
  const dispose = createRoot((dispose) => {
    const node = {
      type: "cell" as const,
      key: "row-name",
      value: null,
      textValue: "",
      level: 1,
      index: options.index,
      column: options.column,
      parentKey: "row",
      hasChildNodes: false,
      childNodes: [],
    };
    const state = {
      focusedKey: null,
      isDisabled: () => false,
    };
    const cell = createTableCell(
      () => ({ node: node as never, isVirtualized: options.isVirtualized }),
      () => state as never,
      () => null,
    );
    ariaColIndex = cell.gridCellProps["aria-colindex"];
    return dispose;
  });
  dispose();
  return ariaColIndex;
}

describe("createTableCell", () => {
  it("uses the column index when a virtualized cell has one", () => {
    expect(readCell({ index: 4, column: 0, isVirtualized: true })).toBe(1);
  });

  it("falls back to the node index when a virtualized cell has no column index", () => {
    expect(readCell({ index: 2, isVirtualized: true })).toBe(3);
  });

  it("omits the column index when the cell is not virtualized", () => {
    expect(readCell({ index: 4, column: 1 })).toBeUndefined();
  });

  it("omits the column index when a non-virtualized cell has none", () => {
    expect(readCell({ index: 2 })).toBeUndefined();
  });
});
