/**
 * Table ids are single aria-labelledby tokens. A key that contains whitespace
 * is stripped the way @react-aria/table's normalizeKey strips it, on every
 * builder that interpolates that key into an id.
 */

import { describe, it, expect } from "vite-plus/test";
import { createRoot } from "solid-js";
import {
  createTableCollection,
  createTableColumnResizeState,
  createTableState,
  type GridNode,
} from "@proyecto-viviana/solid-stately";
import {
  createTable,
  createTableCell,
  createTableColumnHeader,
  createTableColumnResize,
  createTableRow,
} from "../src/table";

interface FileRow {
  "File name": string;
  size: string;
}

describe("createTable ids", () => {
  it("strips whitespace so a row label points at one header cell id", () => {
    createRoot((dispose) => {
      const collection = createTableCollection<FileRow>({
        columns: [
          { key: "File name", name: "File name", isRowHeader: true },
          { key: "size", name: "Size" },
        ],
        rows: [{ key: "My row", value: { "File name": "Notes", size: "1 KB" } }],
      });
      const state = createTableState<FileRow>(() => ({ collection }));
      createTable(
        () => ({ id: "grid", "aria-label": "Files" }),
        () => state,
        () => null,
      );

      const cellNode = collection.getCell("My row", "File name");
      expect(cellNode).not.toBeNull();
      const cell = createTableCell<FileRow>(
        () => ({ node: cellNode as GridNode<unknown> }),
        () => state,
        () => null,
      );
      const row = createTableRow<FileRow>(
        () => ({ node: collection.getItem("My row") as GridNode<unknown> }),
        () => state,
        () => null,
      );
      const header = createTableColumnHeader<FileRow>(
        () => ({ node: { key: "File name" } as GridNode<unknown> }),
        () => state,
        () => null,
      );
      const resizeState = createTableColumnResizeState(() => ({
        tableWidth: 400,
        columns: [{ key: "File name", width: 200 }],
      }));
      const resizer = createTableColumnResize(
        () => ({ column: { key: "File name" }, "aria-label": "Resize File name" }),
        () => Object.assign(resizeState, { tableState: state }),
      );

      const cellId = String(cell.gridCellProps.id);
      const headerId = String(header.columnHeaderProps.id);
      const labelledBy = String(resizer.inputProps["aria-labelledby"]);

      expect(cellId).toBe("grid-Myrow-Myrow-Filename");
      expect(cellId).not.toMatch(/\s/);
      expect(row.rowProps["aria-labelledby"]).toBe(cellId);
      expect(String(row.rowProps.id)).toBe("grid-row-Myrow");
      expect(headerId).toBe("grid-Filename");
      expect(headerId).not.toMatch(/\s/);
      expect(labelledBy).toBe(`${resizer.inputProps.id} ${headerId}`);
      expect(labelledBy.split(" ")).toContain(headerId);

      dispose();
    });
  });

  it("keeps an id unchanged when the key has no whitespace", () => {
    createRoot((dispose) => {
      const collection = createTableCollection<FileRow>({
        columns: [
          { key: "name", name: "Name", isRowHeader: true },
          { key: "size", name: "Size" },
        ],
        rows: [{ key: "a", value: { "File name": "Notes", size: "1 KB" } }],
      });
      const state = createTableState<FileRow>(() => ({ collection }));
      createTable(
        () => ({ id: "grid", "aria-label": "Files" }),
        () => state,
        () => null,
      );

      const cellNode = collection.getCell("a", "name");
      const cell = createTableCell<FileRow>(
        () => ({ node: cellNode as GridNode<unknown> }),
        () => state,
        () => null,
      );
      const row = createTableRow<FileRow>(
        () => ({ node: collection.getItem("a") as GridNode<unknown> }),
        () => state,
        () => null,
      );

      expect(cell.gridCellProps.id).toBe("grid-a-a-name");
      expect(row.rowProps["aria-labelledby"]).toBe("grid-a-a-name");
      expect(row.rowProps.id).toBe("grid-row-a");

      dispose();
    });
  });
});
