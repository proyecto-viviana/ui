/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/table/utils.ts

/**
 * Table accessibility id helpers.
 * Port of @react-aria/table/utils (`getRowLabelledBy` / cell id derivation).
 */

import type { Key, GridNode, TableState, TableCollection } from "@proyecto-viviana/solid-stately";
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
