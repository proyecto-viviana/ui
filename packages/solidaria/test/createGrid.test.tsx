import { describe, it, expect, afterEach } from "vite-plus/test";
import { render, cleanup } from "@solidjs/testing-library";
import { createGrid, getGridData } from "../src/grid/createGrid";
import { I18nProvider } from "../src/i18n";

function createMockGridState() {
  const row = { type: "item", key: "row-1" };
  const cell1 = { type: "cell", key: "cell-1", parentKey: "row-1", index: 0, column: 0 };
  const cell2 = { type: "cell", key: "cell-2", parentKey: "row-1", index: 1, column: 1 };

  const items = new Map([
    ["row-1", row],
    ["cell-1", cell1],
    ["cell-2", cell2],
  ]);

  const children = new Map([["row-1", [cell1, cell2]]]);

  const collection = {
    rows: [row],
    size: 1,
    rowCount: 1,
    columnCount: 2,
    getItem: (key: string) => items.get(key) ?? null,
    getChildren: (key: string) => children.get(key) ?? [],
  };

  return {
    collection,
    disabledKeys: new Set(),
    isKeyboardNavigationDisabled: false,
    focusedKey: null,
    setFocusedKey: () => {},
    selectionMode: "single",
    clearSelection: () => {},
    selectAll: () => {},
    toggleSelection: () => {},
    extendSelection: () => {},
    isFocused: false,
    setFocused: () => {},
  };
}

function GridInner(props: { state: ReturnType<typeof createMockGridState> }) {
  const { gridProps } = createGrid(
    () => ({
      "aria-label": "Test grid",
      focusMode: "cell",
    }),
    () => props.state as any,
    () => null,
  );

  return <div {...gridProps} />;
}

function TestGrid(props: { locale: string; state: ReturnType<typeof createMockGridState> }) {
  return (
    <I18nProvider locale={props.locale}>
      <GridInner state={props.state} />
    </I18nProvider>
  );
}

describe("createGrid", () => {
  afterEach(() => {
    cleanup();
  });

  it("uses LTR direction by default", () => {
    const state = createMockGridState();
    render(() => <TestGrid locale="en-US" state={state} />);

    const data = getGridData(state as any);
    expect(data?.keyboardDelegate.getKeyRightOf?.("cell-1")).toBe("cell-2");
    expect(data?.keyboardDelegate.getKeyLeftOf?.("cell-1")).toBeNull();
  });

  it("uses RTL direction from locale provider", () => {
    const state = createMockGridState();
    render(() => <TestGrid locale="he-IL" state={state} />);

    const data = getGridData(state as any);
    expect(data?.keyboardDelegate.getKeyLeftOf?.("cell-1")).toBe("cell-2");
    expect(data?.keyboardDelegate.getKeyRightOf?.("cell-2")).toBe("cell-1");
  });
});
