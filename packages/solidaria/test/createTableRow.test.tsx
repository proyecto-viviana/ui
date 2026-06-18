/**
 * Tests for createTableRow's tree-grid (expandable rows) behaviour.
 *
 * Drives the headless aria hook against a real {@link createTreeGridState} so the
 * expansion state, aria attributes and expand-button props mirror `@react-aria/table`'s
 * `useTableRow` for the `UNSTABLE_` tree-grid feature.
 */

import { describe, it, expect, vi } from "vitest";
import { createRoot, type Accessor } from "solid-js";
import {
  createTreeGridState,
  createTableState,
  createTableCollection,
  type Key,
  type GridNode,
  type TableState,
  type TableCollection,
  type ColumnDefinition,
  type RowDefinition,
} from "@proyecto-viviana/solid-stately";
import { createTableRow } from "../src/table";
import type { AriaTableRowProps } from "../src/table/types";

interface Item {
  name: string;
  type: string;
}

const treeColumns: ColumnDefinition<Item>[] = [
  { key: "name", name: "Name", isRowHeader: true },
  { key: "type", name: "Type" },
];

// projects > project-1 > (file-1, file-2), project-2 ; documents > doc-1
const treeRows: RowDefinition<Item>[] = [
  {
    key: "projects",
    value: { name: "Projects", type: "folder" },
    childRows: [
      {
        key: "project-1",
        value: { name: "Project 1", type: "folder" },
        childRows: [
          { key: "file-1", value: { name: "File 1", type: "file" } },
          { key: "file-2", value: { name: "File 2", type: "file" } },
        ],
      },
      { key: "project-2", value: { name: "Project 2", type: "file" } },
    ],
  },
  {
    key: "documents",
    value: { name: "Documents", type: "folder" },
    childRows: [{ key: "doc-1", value: { name: "Doc 1", type: "file" } }],
  },
];

/** Builds the row aria hook for a node, re-reading from the (reactive) collection. */
function rowFor<T extends object>(
  state: TableState<T, TableCollection<T>>,
  key: Key,
  extra?: Partial<AriaTableRowProps>,
) {
  return createTableRow<T>(
    () => ({ node: state.collection.getItem(key) as GridNode<unknown>, ...extra }),
    (() => state) as Accessor<TableState<T, TableCollection<T>>>,
    () => null,
  );
}

describe("createTableRow (tree grid)", () => {
  it("omits tree aria attributes for a plain (non-tree) table", () => {
    createRoot((dispose) => {
      const collection = createTableCollection<Item>({
        columns: treeColumns,
        rows: [
          { key: "a", value: { name: "A", type: "file" } },
          { key: "b", value: { name: "B", type: "file" } },
        ],
      });
      const state = createTableState<Item>(() => ({ collection }));
      const row = rowFor(state, "a");

      expect(state.treeColumn).toBeNull();
      expect(row.rowProps["aria-expanded"]).toBeUndefined();
      expect(row.rowProps["aria-level"]).toBeUndefined();
      expect(row.rowProps["aria-posinset"]).toBeUndefined();
      expect(row.rowProps["aria-setsize"]).toBeUndefined();
      expect(row.isExpanded).toBe(false);
      expect(row.hasChildRows).toBe(false);

      dispose();
    });
  });

  it("exposes nesting, position and expansion for a collapsed top-level row", () => {
    createRoot((dispose) => {
      const state = createTreeGridState<Item>(() => ({ columns: treeColumns, rows: treeRows }));
      const row = rowFor(state, "projects");

      expect(row.rowProps["aria-expanded"]).toBe(false);
      expect(row.rowProps["aria-level"]).toBe(1);
      expect(row.rowProps["aria-posinset"]).toBe(1);
      expect(row.rowProps["aria-setsize"]).toBe(2); // projects, documents
      expect(row.isExpanded).toBe(false);
      expect(row.hasChildRows).toBe(true);

      dispose();
    });
  });

  it("reports aria-expanded=true and the second root position once expanded", () => {
    createRoot((dispose) => {
      const state = createTreeGridState<Item>(() => ({
        columns: treeColumns,
        rows: treeRows,
        UNSTABLE_defaultExpandedKeys: ["projects"],
      }));
      const projects = rowFor(state, "projects");
      const documents = rowFor(state, "documents");

      expect(projects.rowProps["aria-expanded"]).toBe(true);
      expect(documents.rowProps["aria-posinset"]).toBe(2);
      expect(documents.rowProps["aria-setsize"]).toBe(2);

      dispose();
    });
  });

  it("computes nested level/posinset/setsize among visible siblings", () => {
    createRoot((dispose) => {
      const state = createTreeGridState<Item>(() => ({
        columns: treeColumns,
        rows: treeRows,
        UNSTABLE_defaultExpandedKeys: ["projects", "project-1"],
      }));

      const project2 = rowFor(state, "project-2");
      expect(project2.rowProps["aria-level"]).toBe(2);
      expect(project2.rowProps["aria-posinset"]).toBe(2); // project-1, project-2
      expect(project2.rowProps["aria-setsize"]).toBe(2);
      // Leaf row: no aria-expanded.
      expect(project2.rowProps["aria-expanded"]).toBeUndefined();
      expect(project2.hasChildRows).toBe(false);

      const file1 = rowFor(state, "file-1");
      expect(file1.rowProps["aria-level"]).toBe(3);
      expect(file1.rowProps["aria-posinset"]).toBe(1); // file-1, file-2
      expect(file1.rowProps["aria-setsize"]).toBe(2);

      dispose();
    });
  });

  it("omits aria-rowindex for a virtualized tree grid (matches upstream)", () => {
    createRoot((dispose) => {
      const state = createTreeGridState<Item>(() => ({ columns: treeColumns, rows: treeRows }));
      const row = rowFor(state, "projects", { isVirtualized: true });

      expect(row.rowProps["aria-rowindex"]).toBeUndefined();

      dispose();
    });
  });

  describe("expandButtonProps", () => {
    it("labels the chevron Expand/Collapse and excludes it from the tab order", () => {
      createRoot((dispose) => {
        const state = createTreeGridState<Item>(() => ({
          columns: treeColumns,
          rows: treeRows,
        }));
        const row = rowFor(state, "projects");

        expect(row.expandButtonProps["aria-label"]).toBe("Expand");
        expect(row.expandButtonProps.excludeFromTabOrder).toBe(true);
        expect(row.expandButtonProps.preventFocusOnPress).toBe(true);
        expect(row.expandButtonProps["data-react-aria-prevent-focus"]).toBe(true);

        dispose();
      });
    });

    it("disables the chevron when the row is disabled", () => {
      createRoot((dispose) => {
        const state = createTreeGridState<Item>(() => ({
          columns: treeColumns,
          rows: treeRows,
          disabledKeys: ["projects"],
        }));
        const row = rowFor(state, "projects");

        expect(row.expandButtonProps.isDisabled).toBe(true);

        dispose();
      });
    });

    it("toggles expansion (and re-labels) when pressed, moving focus to the row", () => {
      createRoot((dispose) => {
        const onExpandedChange = vi.fn();
        const state = createTreeGridState<Item>(() => ({
          columns: treeColumns,
          rows: treeRows,
          UNSTABLE_onExpandedChange: onExpandedChange,
        }));
        const row = rowFor(state, "projects");

        expect(row.expandButtonProps["aria-label"]).toBe("Expand");

        row.expandButtonProps.onPress?.({ type: "press" } as unknown as never);

        expect(onExpandedChange).toHaveBeenLastCalledWith(new Set(["projects"]));
        expect(state.expandedKeys).toEqual(new Set(["projects"]));
        expect(state.focusedKey).toBe("projects");
        // Re-reading reflects the new expanded state.
        expect(row.expandButtonProps["aria-label"]).toBe("Collapse");
        expect(row.rowProps["aria-expanded"]).toBe(true);

        dispose();
      });
    });

    it("does not toggle when the row is disabled", () => {
      createRoot((dispose) => {
        const onExpandedChange = vi.fn();
        const state = createTreeGridState<Item>(() => ({
          columns: treeColumns,
          rows: treeRows,
          disabledKeys: ["projects"],
          UNSTABLE_onExpandedChange: onExpandedChange,
        }));
        const row = rowFor(state, "projects");

        row.expandButtonProps.onPress?.({ type: "press" } as unknown as never);

        expect(onExpandedChange).not.toHaveBeenCalled();
        expect(state.expandedKeys).toEqual(new Set());

        dispose();
      });
    });
  });

  describe("keyboard expand/collapse", () => {
    const press = (handler: ((e: KeyboardEvent) => void) | undefined, key: string) => {
      const e = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
      handler?.(e);
    };

    it("expands a focused collapsed row with ArrowRight (LTR)", () => {
      createRoot((dispose) => {
        const state = createTreeGridState<Item>(() => ({ columns: treeColumns, rows: treeRows }));
        const row = rowFor(state, "projects");

        state.setFocusedKey("projects");
        press(row.rowProps.onKeyDown as (e: KeyboardEvent) => void, "ArrowRight");

        expect(state.expandedKeys).toEqual(new Set(["projects"]));

        dispose();
      });
    });

    it("collapses a focused expanded row with ArrowLeft (LTR)", () => {
      createRoot((dispose) => {
        const state = createTreeGridState<Item>(() => ({
          columns: treeColumns,
          rows: treeRows,
          UNSTABLE_defaultExpandedKeys: ["projects"],
        }));
        const row = rowFor(state, "projects");

        state.setFocusedKey("projects");
        press(row.rowProps.onKeyDown as (e: KeyboardEvent) => void, "ArrowLeft");

        expect(state.expandedKeys).toEqual(new Set());

        dispose();
      });
    });

    it("moves focus to the parent when collapsing a leaf row with ArrowLeft", () => {
      createRoot((dispose) => {
        const state = createTreeGridState<Item>(() => ({
          columns: treeColumns,
          rows: treeRows,
          UNSTABLE_defaultExpandedKeys: ["projects"],
        }));
        const row = rowFor(state, "project-2");

        state.setFocusedKey("project-2");
        press(row.rowProps.onKeyDown as (e: KeyboardEvent) => void, "ArrowLeft");

        expect(state.focusedKey).toBe("projects");
        expect(state.expandedKeys).toEqual(new Set(["projects"])); // unchanged

        dispose();
      });
    });

    it("does not expand a row that is not focused", () => {
      createRoot((dispose) => {
        const state = createTreeGridState<Item>(() => ({ columns: treeColumns, rows: treeRows }));
        const row = rowFor(state, "projects");

        state.setFocusedKey("documents");
        press(row.rowProps.onKeyDown as (e: KeyboardEvent) => void, "ArrowRight");

        expect(state.expandedKeys).toEqual(new Set());

        dispose();
      });
    });
  });
});
