import { describe, it, expect, afterEach } from "vite-plus/test";
import { render, cleanup, screen, waitFor } from "@solidjs/testing-library";
import { createSignal, Show, type Accessor } from "solid-js";
import { createGrid, getGridData } from "../src/grid/createGrid";
import { I18nProvider } from "../src/i18n";

function createMockGridState(options?: { empty?: boolean }) {
  const row = { type: "item", key: "row-1" };
  const cell1 = { type: "cell", key: "cell-1", parentKey: "row-1", index: 0, column: 0 };
  const cell2 = { type: "cell", key: "cell-2", parentKey: "row-1", index: 1, column: 1 };

  const items = new Map([
    ["row-1", row],
    ["cell-1", cell1],
    ["cell-2", cell2],
  ]);

  const children = new Map([["row-1", [cell1, cell2]]]);

  const collection = options?.empty
    ? {
        rows: [] as (typeof row)[],
        size: 0,
        rowCount: 0,
        columnCount: 0,
        getItem: (_key: string) => null,
        getChildren: (_key: string) => [],
      }
    : {
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
    selectedKeys: new Set<string>(),
    selectionBehavior: "toggle" as const,
  };
}

function EmptyGridProbe(props: {
  empty: boolean;
  hasButton: Accessor<boolean>;
  buttonDisabled: Accessor<boolean>;
}) {
  const [gridRef, setGridRef] = createSignal<HTMLDivElement>();
  const state = createMockGridState({ empty: props.empty });
  const aria = createGrid(
    () => ({
      "aria-label": "Test grid",
      focusMode: "cell",
    }),
    () => state as any,
    gridRef,
  );

  return (
    <div {...aria.gridProps} ref={setGridRef}>
      <Show when={props.hasButton()}>
        <button type="button" disabled={props.buttonDisabled()}>
          Continue
        </button>
      </Show>
    </div>
  );
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

  it("yields the tab stop when an empty grid contains a tabbable control", async () => {
    let setHasButton!: (value: boolean) => void;
    let setButtonDisabled!: (value: boolean) => void;

    render(() => {
      const [hasButton, updateHasButton] = createSignal(false);
      const [buttonDisabled, updateButtonDisabled] = createSignal(false);
      setHasButton = updateHasButton;
      setButtonDisabled = updateButtonDisabled;

      return (
        <I18nProvider locale="en-US">
          <EmptyGridProbe empty hasButton={hasButton} buttonDisabled={buttonDisabled} />
        </I18nProvider>
      );
    });

    const grid = screen.getByRole("grid");
    expect(grid).toHaveAttribute("tabindex", "0");

    setHasButton(true);
    await waitFor(() => expect(grid).toHaveAttribute("tabindex", "-1"));

    setButtonDisabled(true);
    await waitFor(() => expect(grid).toHaveAttribute("tabindex", "0"));

    setButtonDisabled(false);
    await waitFor(() => expect(grid).toHaveAttribute("tabindex", "-1"));

    setHasButton(false);
    await waitFor(() => expect(grid).toHaveAttribute("tabindex", "0"));
  });

  it("keeps a non-empty grid out of the tab order even when it contains a control", async () => {
    render(() => {
      const [hasButton] = createSignal(true);
      const [buttonDisabled] = createSignal(false);

      return (
        <I18nProvider locale="en-US">
          <EmptyGridProbe empty={false} hasButton={hasButton} buttonDisabled={buttonDisabled} />
        </I18nProvider>
      );
    });

    const grid = screen.getByRole("grid");
    expect(grid).toHaveAttribute("tabindex", "-1");
    await waitFor(() => expect(grid).toHaveAttribute("tabindex", "-1"));
  });
});
