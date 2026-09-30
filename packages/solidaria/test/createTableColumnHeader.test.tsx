import { describe, it, expect, afterEach } from "vite-plus/test";
import { cleanup, render } from "@solidjs/testing-library";
import { createMemo, createSignal, flush, type Accessor } from "solid-js";
import {
  createTableCollection,
  createTableState,
  type ColumnDefinition,
  type RowDefinition,
  type TableCollection,
  type TableState,
} from "@proyecto-viviana/solid-stately";
import { createTableColumnHeader, type TableColumnHeaderAria } from "../src/table";

interface Item {
  name: string;
  type: string;
}

const columns: ColumnDefinition<Item>[] = [
  { key: "name", name: "Name", isRowHeader: true },
  { key: "type", name: "Type" },
];

describe("createTableColumnHeader", () => {
  afterEach(() => {
    cleanup();
  });

  it("keeps column headers out of the tab order while the body is empty", async () => {
    let setRows!: (rows: RowDefinition<Item>[]) => void;
    let api!: {
      state: TableState<Item, TableCollection<Item>>;
      header: TableColumnHeaderAria;
      columnKey: Accessor<string>;
    };

    render(() => {
      const [rows, updateRows] = createSignal<RowDefinition<Item>[]>([
        { key: "a", value: { name: "A", type: "file" } },
      ]);
      setRows = updateRows;
      const collection = createMemo(() => createTableCollection<Item>({ columns, rows: rows() }));
      const state = createTableState<Item>(() => ({ collection: collection() }));
      const header = createTableColumnHeader(
        () => ({
          node: collection().columns[0]!,
          allowsSorting: true,
        }),
        () => state,
        () => null,
      );
      api = {
        state,
        header,
        columnKey: () => String(collection().columns[0]!.key),
      };
      return (
        <table>
          <thead>
            <tr>
              <th {...header.columnHeaderProps}>Name</th>
            </tr>
          </thead>
        </table>
      );
    });

    api.state.setFocusedKey(api.columnKey());
    flush();
    expect(api.state.focusedKey).toBe("name");
    expect(api.header.columnHeaderProps.tabIndex).toBe(0);

    setRows([]);
    flush();

    expect(api.header.columnHeaderProps.tabIndex).toBe(-1);
    expect(api.state.focusedKey).toBeNull();
  });
});
