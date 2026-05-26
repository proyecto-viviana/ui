/**
 * Tests for createTableState and TableCollection.
 */

import { describe, it, expect, vi } from "vitest";
import { createRoot } from "solid-js";
import {
  createTableState,
  TableCollection,
  createTableCollection,
  type ColumnDefinition,
  type RowDefinition,
} from "../src/table";

interface Person {
  id: number;
  name: string;
  email: string;
  role: string;
}

const testColumns: ColumnDefinition<Person>[] = [
  { key: "name", name: "Name", isRowHeader: true },
  { key: "email", name: "Email" },
  { key: "role", name: "Role" },
];

const testData: Person[] = [
  { id: 1, name: "Alice", email: "alice@example.com", role: "Admin" },
  { id: 2, name: "Bob", email: "bob@example.com", role: "User" },
  { id: 3, name: "Charlie", email: "charlie@example.com", role: "User" },
];

describe("TableCollection", () => {
  describe("basic collection", () => {
    it("creates collection with columns and rows", () => {
      const collection = createTableCollection({
        columns: testColumns,
        rows: testData,
        getKey: (item) => item.id,
      });

      expect(collection.columns.length).toBe(3);
      expect(collection.size).toBe(3);
      expect(collection.rowCount).toBe(4); // 1 header + 3 data rows
      expect(collection.columnCount).toBe(3);
    });

    it("creates header rows", () => {
      const collection = createTableCollection({
        columns: testColumns,
        rows: testData,
        getKey: (item) => item.id,
      });

      expect(collection.headerRows.length).toBe(1);
      expect(collection.headerRows[0].type).toBe("headerrow");
      expect(collection.headerRows[0].childNodes.length).toBe(3);
    });

    it("creates body node with data rows", () => {
      const collection = createTableCollection({
        columns: testColumns,
        rows: testData,
        getKey: (item) => item.id,
      });

      expect(collection.body).toBeDefined();
      expect(collection.body.childNodes.length).toBe(3);
      expect(collection.body.childNodes[0].key).toBe(1);
      expect(collection.body.childNodes[1].key).toBe(2);
      expect(collection.body.childNodes[2].key).toBe(3);
    });

    it("creates cells for each row", () => {
      const collection = createTableCollection({
        columns: testColumns,
        rows: testData,
        getKey: (item) => item.id,
      });

      const firstRow = collection.body.childNodes[0];
      expect(firstRow.childNodes.length).toBe(3);
      expect(firstRow.childNodes[0].type).toBe("rowheader"); // name column is row header
      expect(firstRow.childNodes[1].type).toBe("cell");
      expect(firstRow.childNodes[2].type).toBe("cell");
    });

    it("sets default row header column", () => {
      const collection = createTableCollection({
        columns: testColumns,
        rows: testData,
        getKey: (item) => item.id,
      });

      expect(collection.rowHeaderColumnKeys.has("name")).toBe(true);
    });

    it("uses explicit row header columns even when they are not first", () => {
      const collection = createTableCollection({
        columns: [
          { key: "email", name: "Email" },
          { key: "name", name: "Name", isRowHeader: true },
          { key: "role", name: "Role" },
        ],
        rows: testData,
        getKey: (item) => item.id,
      });

      const firstRow = collection.body.childNodes[0];
      expect(collection.rowHeaderColumnKeys.has("name")).toBe(true);
      expect(firstRow.childNodes[0].type).toBe("cell");
      expect(firstRow.childNodes[1].type).toBe("rowheader");
    });

    it("preserves id aliases in getTextValue column metadata", () => {
      const getTextValue = vi.fn((item: Person, column: ColumnDefinition<Person> & { id?: Key }) =>
        column.id ? String(item[column.id as keyof Person] ?? "") : "",
      );
      const collection = createTableCollection({
        columns: [
          { id: "name", name: "Name", isRowHeader: true } as ColumnDefinition<Person> & {
            id: Key;
          },
          { id: "email", name: "Email" } as ColumnDefinition<Person> & { id: Key },
        ],
        rows: testData,
        getKey: (item) => item.id,
        getTextValue,
      });

      expect(collection.columns[0].key).toBe("name");
      expect(collection.getItem("1-name")?.type).toBe("rowheader");
      expect(collection.getItem("1-name")?.textValue).toBe("Alice");
      expect(getTextValue.mock.calls[0][1]).toMatchObject({ id: "name", key: "name" });
    });
  });

  describe("getItem", () => {
    it("returns row by key", () => {
      const collection = createTableCollection({
        columns: testColumns,
        rows: testData,
        getKey: (item) => item.id,
      });

      const row = collection.getItem(1);
      expect(row).not.toBeNull();
      expect(row?.key).toBe(1);
      expect(row?.type).toBe("item");
    });

    it("returns cell by key", () => {
      const collection = createTableCollection({
        columns: testColumns,
        rows: testData,
        getKey: (item) => item.id,
      });

      const cell = collection.getItem("1-name");
      expect(cell).not.toBeNull();
      expect(cell?.type).toBe("rowheader");
    });

    it("returns null for non-existent key", () => {
      const collection = createTableCollection({
        columns: testColumns,
        rows: testData,
        getKey: (item) => item.id,
      });

      expect(collection.getItem(999)).toBeNull();
    });
  });

  describe("getCell", () => {
    it("returns cell by row and column keys", () => {
      const collection = createTableCollection({
        columns: testColumns,
        rows: testData,
        getKey: (item) => item.id,
      });

      const cell = collection.getCell(1, "email");
      expect(cell).not.toBeNull();
      expect(cell?.textValue).toBe("alice@example.com");
    });

    it("returns null for non-existent cell", () => {
      const collection = createTableCollection({
        columns: testColumns,
        rows: testData,
        getKey: (item) => item.id,
      });

      expect(collection.getCell(999, "email")).toBeNull();
    });
  });

  describe("navigation methods", () => {
    it("getFirstKey returns first data row key", () => {
      const collection = createTableCollection({
        columns: testColumns,
        rows: testData,
        getKey: (item) => item.id,
      });

      expect(collection.getFirstKey()).toBe(1);
    });

    it("getLastKey returns last data row key", () => {
      const collection = createTableCollection({
        columns: testColumns,
        rows: testData,
        getKey: (item) => item.id,
      });

      expect(collection.getLastKey()).toBe(3);
    });

    it("getKeyBefore returns previous row key", () => {
      const collection = createTableCollection({
        columns: testColumns,
        rows: testData,
        getKey: (item) => item.id,
      });

      expect(collection.getKeyBefore(2)).toBe(1);
      expect(collection.getKeyBefore(1)).toBeNull();
    });

    it("getKeyAfter returns next row key", () => {
      const collection = createTableCollection({
        columns: testColumns,
        rows: testData,
        getKey: (item) => item.id,
      });

      expect(collection.getKeyAfter(1)).toBe(2);
      expect(collection.getKeyAfter(3)).toBeNull();
    });

    it("at returns row at index", () => {
      const collection = createTableCollection({
        columns: testColumns,
        rows: testData,
        getKey: (item) => item.id,
      });

      expect(collection.at(0)?.key).toBe(1);
      expect(collection.at(2)?.key).toBe(3);
      expect(collection.at(10)).toBeNull();
    });
  });

  describe("selection checkboxes", () => {
    it("adds selection column when showSelectionCheckboxes is true", () => {
      const collection = createTableCollection({
        columns: testColumns,
        rows: testData,
        getKey: (item) => item.id,
        showSelectionCheckboxes: true,
      });

      expect(collection.columns.length).toBe(4); // selection + 3 columns
      expect(collection.columns[0].key).toBe("__selection__");
    });
  });

  describe("iterator", () => {
    it("iterates over body rows only", () => {
      const collection = createTableCollection({
        columns: testColumns,
        rows: testData,
        getKey: (item) => item.id,
      });

      const rows = [...collection];
      expect(rows.length).toBe(3);
      expect(rows[0].key).toBe(1);
      expect(rows[1].key).toBe(2);
      expect(rows[2].key).toBe(3);
    });
  });
});

describe("createTableState", () => {
  describe("basic state", () => {
    it("creates table state with collection", () => {
      createRoot((dispose) => {
        const collection = createTableCollection({
          columns: testColumns,
          rows: testData,
          getKey: (item) => item.id,
        });

        const state = createTableState(() => ({
          collection,
        }));

        expect(state.collection).toBe(collection);
        expect(state.selectionMode).toBe("none");
        expect(state.showSelectionCheckboxes).toBe(false);
        expect(state.sortDescriptor).toBeNull();

        dispose();
      });
    });
  });

  describe("selection", () => {
    it("supports single selection", () => {
      createRoot((dispose) => {
        const collection = createTableCollection({
          columns: testColumns,
          rows: testData,
          getKey: (item) => item.id,
        });

        const state = createTableState(() => ({
          collection,
          selectionMode: "single",
        }));

        expect(state.selectionMode).toBe("single");
        expect(state.isSelected(1)).toBe(false);

        state.toggleSelection(1);
        expect(state.isSelected(1)).toBe(true);

        state.toggleSelection(2);
        expect(state.isSelected(1)).toBe(false);
        expect(state.isSelected(2)).toBe(true);

        dispose();
      });
    });

    it("supports multiple selection", () => {
      createRoot((dispose) => {
        const collection = createTableCollection({
          columns: testColumns,
          rows: testData,
          getKey: (item) => item.id,
        });

        const state = createTableState(() => ({
          collection,
          selectionMode: "multiple",
        }));

        state.toggleSelection(1);
        state.toggleSelection(2);

        expect(state.isSelected(1)).toBe(true);
        expect(state.isSelected(2)).toBe(true);
        expect(state.isSelected(3)).toBe(false);

        dispose();
      });
    });

    it("supports select all", () => {
      createRoot((dispose) => {
        const collection = createTableCollection({
          columns: testColumns,
          rows: testData,
          getKey: (item) => item.id,
        });

        const state = createTableState(() => ({
          collection,
          selectionMode: "multiple",
        }));

        state.selectAll();
        expect(state.selectedKeys).toBe("all");

        dispose();
      });
    });

    it("calls onSelectionChange", () => {
      createRoot((dispose) => {
        const onSelectionChange = vi.fn();

        const collection = createTableCollection({
          columns: testColumns,
          rows: testData,
          getKey: (item) => item.id,
        });

        const state = createTableState(() => ({
          collection,
          selectionMode: "single",
          onSelectionChange,
        }));

        state.toggleSelection(1);

        expect(onSelectionChange).toHaveBeenCalledWith(new Set([1]));

        dispose();
      });
    });
  });

  describe("sorting", () => {
    it("has null sortDescriptor by default", () => {
      createRoot((dispose) => {
        const collection = createTableCollection({
          columns: testColumns,
          rows: testData,
          getKey: (item) => item.id,
        });

        const state = createTableState(() => ({
          collection,
        }));

        expect(state.sortDescriptor).toBeNull();

        dispose();
      });
    });

    it("uses provided sortDescriptor", () => {
      createRoot((dispose) => {
        const collection = createTableCollection({
          columns: testColumns,
          rows: testData,
          getKey: (item) => item.id,
        });

        const state = createTableState(() => ({
          collection,
          sortDescriptor: { column: "name", direction: "ascending" },
        }));

        expect(state.sortDescriptor).toEqual({
          column: "name",
          direction: "ascending",
        });

        dispose();
      });
    });

    it("sort() calls onSortChange with ascending for new column", () => {
      createRoot((dispose) => {
        const onSortChange = vi.fn();

        const collection = createTableCollection({
          columns: testColumns,
          rows: testData,
          getKey: (item) => item.id,
        });

        const state = createTableState(() => ({
          collection,
          onSortChange,
        }));

        state.sort("name");

        expect(onSortChange).toHaveBeenCalledWith({
          column: "name",
          direction: "ascending",
        });

        dispose();
      });
    });

    it("sort() toggles direction for same column", () => {
      createRoot((dispose) => {
        const onSortChange = vi.fn();

        const collection = createTableCollection({
          columns: testColumns,
          rows: testData,
          getKey: (item) => item.id,
        });

        const state = createTableState(() => ({
          collection,
          sortDescriptor: { column: "name", direction: "ascending" },
          onSortChange,
        }));

        state.sort("name");

        expect(onSortChange).toHaveBeenCalledWith({
          column: "name",
          direction: "descending",
        });

        dispose();
      });
    });

    it("sort() uses explicit direction when provided", () => {
      createRoot((dispose) => {
        const onSortChange = vi.fn();

        const collection = createTableCollection({
          columns: testColumns,
          rows: testData,
          getKey: (item) => item.id,
        });

        const state = createTableState(() => ({
          collection,
          onSortChange,
        }));

        state.sort("name", "descending");

        expect(onSortChange).toHaveBeenCalledWith({
          column: "name",
          direction: "descending",
        });

        dispose();
      });
    });
  });

  describe("disabled keys", () => {
    it("respects disabled keys", () => {
      createRoot((dispose) => {
        const collection = createTableCollection({
          columns: testColumns,
          rows: testData,
          getKey: (item) => item.id,
        });

        const state = createTableState(() => ({
          collection,
          selectionMode: "single",
          disabledKeys: [2],
        }));

        expect(state.isDisabled(1)).toBe(false);
        expect(state.isDisabled(2)).toBe(true);
        expect(state.isDisabled(3)).toBe(false);

        // Cannot select disabled key
        state.toggleSelection(2);
        expect(state.isSelected(2)).toBe(false);

        dispose();
      });
    });
  });

  describe("showSelectionCheckboxes", () => {
    it("tracks showSelectionCheckboxes option", () => {
      createRoot((dispose) => {
        const collection = createTableCollection({
          columns: testColumns,
          rows: testData,
          getKey: (item) => item.id,
          showSelectionCheckboxes: true,
        });

        const state = createTableState(() => ({
          collection,
          showSelectionCheckboxes: true,
        }));

        expect(state.showSelectionCheckboxes).toBe(true);

        dispose();
      });
    });
  });

  describe("focus management", () => {
    it("tracks focused key", () => {
      createRoot((dispose) => {
        const collection = createTableCollection({
          columns: testColumns,
          rows: testData,
          getKey: (item) => item.id,
        });

        const state = createTableState(() => ({
          collection,
        }));

        expect(state.focusedKey).toBeNull();

        state.setFocusedKey(1);
        expect(state.focusedKey).toBe(1);

        state.setFocusedKey(2);
        expect(state.focusedKey).toBe(2);

        dispose();
      });
    });

    it("tracks focused state", () => {
      createRoot((dispose) => {
        const collection = createTableCollection({
          columns: testColumns,
          rows: testData,
          getKey: (item) => item.id,
        });

        const state = createTableState(() => ({
          collection,
        }));

        expect(state.isFocused).toBe(false);

        state.setFocused(true);
        expect(state.isFocused).toBe(true);

        dispose();
      });
    });
  });
});
