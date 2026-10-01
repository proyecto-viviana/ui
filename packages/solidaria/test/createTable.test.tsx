/**
 * Tests for createTable ARIA hook - announcement infrastructure tests.
 *
 * Note: The createTable hook integrates with createTableState which requires
 * a TableCollection built via createTableCollection. Full integration tests
 * for sort announcements are in the solid-stately package (createTableState.test.ts)
 * and E2E tests in the Table component.
 *
 * These tests verify that the announcement infrastructure is properly set up.
 */

import { describe, it, expect, beforeEach, afterEach } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@solidjs/testing-library";
import { createRoot, createSignal, Show, type Accessor } from "solid-js";
import {
  createTableCollection,
  createTableState,
  createTreeGridState,
  type ColumnDefinition,
  type RowDefinition,
  type TableCollection,
  type TableState,
} from "@proyecto-viviana/solid-stately";
import { announce, clearAnnouncer } from "../src/live-announcer";
import { createTable } from "../src/table";

describe("createTable announcement infrastructure", () => {
  beforeEach(() => {
    clearAnnouncer();
  });

  afterEach(() => {
    cleanup();
    clearAnnouncer();
  });

  describe("announce function", () => {
    it("exists and can be called with assertive mode", () => {
      expect(typeof announce).toBe("function");

      // Should not throw
      expect(() => {
        announce("Test announcement", "assertive", 500);
      }).not.toThrow();
    });

    it("can be called with polite mode", () => {
      expect(() => {
        announce("Polite announcement", "polite", 500);
      }).not.toThrow();
    });

    it("can be called with custom timeout", () => {
      expect(() => {
        announce("Timed announcement", "assertive", 1000);
      }).not.toThrow();
    });
  });

  describe("clearAnnouncer function", () => {
    it("exists and can be called", () => {
      expect(typeof clearAnnouncer).toBe("function");

      expect(() => {
        clearAnnouncer("assertive");
      }).not.toThrow();
    });

    it("can clear polite announcements", () => {
      expect(() => {
        clearAnnouncer("polite");
      }).not.toThrow();
    });

    it("can clear all announcements", () => {
      expect(() => {
        clearAnnouncer();
      }).not.toThrow();
    });
  });
});

interface Item {
  name: string;
  type: string;
}

const treeColumns: ColumnDefinition<Item>[] = [
  { key: "name", name: "Name", isRowHeader: true },
  { key: "type", name: "Type" },
];

const treeRows: RowDefinition<Item>[] = [
  {
    key: "projects",
    value: { name: "Projects", type: "folder" },
    childRows: [{ key: "file-1", value: { name: "File 1", type: "file" } }],
  },
];

describe("createTable role", () => {
  it("keeps a plain table on the grid role", () => {
    createRoot((dispose) => {
      const collection = createTableCollection<Item>({
        columns: treeColumns,
        rows: [{ key: "a", value: { name: "A", type: "file" } }],
      });
      const state = createTableState<Item>(() => ({ collection }));
      const table = createTable<Item>(
        () => ({ "aria-label": "Files" }),
        () => state,
        () => null,
      );

      expect(state.treeColumn).toBeNull();
      expect(table.gridProps.role).toBe("grid");
      dispose();
    });
  });

  it("exposes the treegrid role when rows can expand", () => {
    createRoot((dispose) => {
      const state = createTreeGridState<Item>(() => ({ columns: treeColumns, rows: treeRows }));
      const table = createTable<Item>(
        () => ({ "aria-label": "Files" }),
        (() => state) as Accessor<TableState<Item, TableCollection<Item>>>,
        () => null,
      );

      expect(state.treeColumn).not.toBeNull();
      expect(table.gridProps.role).toBe("treegrid");
      dispose();
    });
  });
});

function EmptyTableProbe(props: { rows: RowDefinition<Item>[]; hasButton: Accessor<boolean> }) {
  const [tableRef, setTableRef] = createSignal<HTMLTableElement>();
  const collection = createTableCollection<Item>({ columns: treeColumns, rows: props.rows });
  const state = createTableState<Item>(() => ({ collection }));
  const aria = createTable<Item>(
    () => ({ "aria-label": "Files" }),
    () => state,
    tableRef,
  );

  return (
    <table {...aria.gridProps} ref={setTableRef}>
      <tbody>
        <tr>
          <td>
            <Show when={props.hasButton()}>
              <button type="button">Continue</button>
            </Show>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

describe("createTable empty tab stop", () => {
  afterEach(() => {
    cleanup();
  });

  it("yields the tab stop when an empty table contains a tabbable control", async () => {
    let setHasButton!: (value: boolean) => void;

    render(() => {
      const [hasButton, updateHasButton] = createSignal(false);
      setHasButton = updateHasButton;
      return <EmptyTableProbe rows={[]} hasButton={hasButton} />;
    });

    const grid = screen.getByRole("grid");
    expect(grid).toHaveAttribute("tabindex", "0");

    setHasButton(true);
    await waitFor(() => expect(grid).toHaveAttribute("tabindex", "-1"));

    setHasButton(false);
    await waitFor(() => expect(grid).toHaveAttribute("tabindex", "0"));
  });

  it("keeps a populated table tabbable while no row is focused", async () => {
    render(() => {
      const [hasButton] = createSignal(true);
      return (
        <EmptyTableProbe
          rows={[{ key: "a", value: { name: "A", type: "file" } }]}
          hasButton={hasButton}
        />
      );
    });

    const grid = screen.getByRole("grid");
    expect(grid).toHaveAttribute("tabindex", "0");
    await waitFor(() => expect(grid).toHaveAttribute("tabindex", "0"));
  });
});

const LONG_PRESS = "Long press to enter selection mode.";
const ASCENDING_NAME = "sorted by column Name in ascending order";

function LongPressTableProbe(props: { describedBy?: string; sorted?: boolean }) {
  const [tableRef, setTableRef] = createSignal<HTMLTableElement>();
  const collection = createTableCollection<Item>({
    columns: treeColumns,
    rows: [{ key: "a", value: { name: "A", type: "file" } }],
  });
  const state = createTableState<Item>(() => ({
    collection,
    selectionMode: "multiple",
    selectionBehavior: "replace",
    sortDescriptor: props.sorted ? { column: "name", direction: "ascending" } : undefined,
  }));
  const aria = createTable<Item>(
    () => ({
      "aria-label": "Files",
      "aria-describedby": props.describedBy,
      onRowAction: () => {},
    }),
    () => state,
    tableRef,
  );

  return <table {...aria.gridProps} ref={setTableRef} />;
}

function withTouch<T>(run: () => Promise<T> | T): Promise<T> {
  const touchDescriptor = Object.getOwnPropertyDescriptor(window, "ontouchstart");
  window.ontouchstart = null;
  const restore = () => {
    if (touchDescriptor) {
      Object.defineProperty(window, "ontouchstart", touchDescriptor);
    } else {
      delete window.ontouchstart;
    }
  };
  return Promise.resolve().then(run).finally(restore);
}

describe("createTable long press description", () => {
  afterEach(() => {
    cleanup();
  });

  it("puts the long-press hint after the sort description and drops an external id", async () => {
    await withTouch(async () => {
      render(() => <LongPressTableProbe describedBy="ext-desc" sorted />);
      const grid = screen.getByRole("grid");

      await waitFor(() => {
        const ids = (grid.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean);
        const texts = ids.map((id) => document.getElementById(id)?.textContent);
        expect(texts).toContain(LONG_PRESS);
      });

      const ids = (grid.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean);
      const texts = ids.map((id) => document.getElementById(id)?.textContent);
      expect(texts[0]).toBe(ASCENDING_NAME);
      expect(texts[1]).toBe(LONG_PRESS);
      expect(ids).not.toContain("ext-desc");
    });
  });

  it("keeps an external aria-describedby when the long-press hint is absent", () => {
    const touchDescriptor = Object.getOwnPropertyDescriptor(window, "ontouchstart");
    delete window.ontouchstart;
    try {
      render(() => <LongPressTableProbe describedBy="ext-desc" />);
      expect(screen.getByRole("grid")).toHaveAttribute("aria-describedby", "ext-desc");
    } finally {
      if (touchDescriptor) {
        Object.defineProperty(window, "ontouchstart", touchDescriptor);
      }
    }
  });
});
