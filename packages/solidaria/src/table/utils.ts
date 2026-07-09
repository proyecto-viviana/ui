/**
 * Table accessibility id helpers.
 * Port of @react-aria/table/utils (`getRowLabelledBy` / cell id derivation).
 */

import type {
  Key,
  GridNode,
  TableState,
  TableCollection,
} from "@proyecto-viviana/solid-stately";
import { getTableData } from "./createTable";

/**
 * A row is labelled by its row-header cells. Mirrors `@react-aria/table`'s
 * `getRowLabelledBy`, which joins `getCellId(state, rowKey, columnKey)` across
 * `collection.rowHeaderColumnKeys`. We resolve the actual rowheader cell node
 * and rebuild the exact id string `createTableCell` puts on the element
 * (`${tableId}-${parentKey}-${cellKey}`) so the reference always matches a real
 * element, regardless of the cell-key scheme.
 */
export function getRowLabelledBy<T extends object>(
  state: TableState<T, TableCollection<T>>,
  rowKey: Key,
): string {
  const tableData = getTableData(state);
  const tableId = tableData?.tableId ?? "table";
  const collection = state.collection as TableCollection<T> & {
    getCell?: (rowKey: Key, columnKey: Key) => GridNode<T> | null;
  };

  return [...collection.rowHeaderColumnKeys]
    .map((columnKey) => {
      const cell = collection.getCell?.(rowKey, columnKey);
      return cell?.parentKey != null
        ? `${tableId}-${String(cell.parentKey)}-${String(cell.key)}`
        : null;
    })
    .filter((id): id is string => id != null)
    .join(" ");
}
