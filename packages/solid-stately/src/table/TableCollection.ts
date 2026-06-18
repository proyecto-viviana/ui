/**
 * TableCollection - A collection class for table data.
 * Based on @react-stately/table/TableCollection.
 *
 * Supports a plain (flat) table and, when an `expandedKeys` option is supplied, a
 * tree grid: `childRows` are walked recursively, each parent row keeps its full
 * structure (cells followed by every child row), and only rows whose ancestors are
 * all expanded are flattened into the navigable body. Mirrors the structure produced
 * by `@react-stately/table`'s `generateTreeGridCollection`.
 */

import type { Key } from "../collections/types";
import type { GridNode, GridNodeType } from "../grid/types";
import type {
  TableCollection as ITableCollection,
  TableCollectionOptions,
  ColumnDefinition,
  RowDefinition,
} from "./types";

/**
 * Creates a table collection from column and row definitions.
 */
export class TableCollection<T = unknown> implements ITableCollection<T> {
  private _columns: GridNode<T>[] = [];
  private _rows: GridNode<T>[] = [];
  private _headerRows: GridNode<T>[] = [];
  private _body: GridNode<T>;
  private _head: GridNode<T> | undefined;
  private _keyMap: Map<Key, GridNode<T>> = new Map();
  private _rowHeaderColumnKeys: Set<Key>;
  private _size: number = 0;
  /** Visible rows in DFS order. Drives size, navigation, iteration and the `rows` list. */
  private _flattenedRows: GridNode<T>[] = [];
  private _treeColumn: Key | null = null;
  private _userColumnCount: number = 0;

  constructor(options: TableCollectionOptions<T>) {
    const {
      columns,
      rows,
      getKey,
      getTextValue,
      showSelectionCheckboxes = false,
      rowHeaderColumnKeys,
      expandedKeys,
    } = options;

    // Passing `expandedKeys` (even an empty set) selects tree-grid mode.
    const isTreeGrid = expandedKeys !== undefined;

    this._columns = this.buildColumns(columns, showSelectionCheckboxes);

    this._rowHeaderColumnKeys = rowHeaderColumnKeys ?? this.getDefaultRowHeaderColumnKeys();

    this._headerRows = this.buildHeaderRows();

    if (this._headerRows.length > 0) {
      this._head = {
        type: "headerrow" as GridNodeType,
        key: "header",
        index: 0,
        level: 0,
        hasChildNodes: true,
        childNodes: this._headerRows,
        value: null,
        textValue: "",
      };
      this._keyMap.set("header", this._head);
    }

    let bodyChildren: GridNode<T>[];
    if (isTreeGrid) {
      const built = this.buildTreeRows(rows, expandedKeys, getKey, getTextValue);
      bodyChildren = built.topLevelRows;
      this._flattenedRows = built.flattenedRows;
      this._userColumnCount = this.countLeafColumns();
      this._treeColumn =
        options.treeColumn !== undefined
          ? options.treeColumn
          : (this._rowHeaderColumnKeys.values().next().value ?? null);
    } else {
      const bodyRows = this.buildRows(rows, getKey, getTextValue);
      bodyChildren = bodyRows;
      this._flattenedRows = bodyRows;
      this._userColumnCount = this.countLeafColumns();
      this._treeColumn = null;
    }

    this._size = this._flattenedRows.length;

    this._body = {
      type: "item" as GridNodeType,
      key: "body",
      index: this._headerRows.length,
      level: 0,
      hasChildNodes: true,
      // The body's children retain the full tree structure (top-level rows with their
      // child rows nested inside) so sibling-based aria-posinset/aria-setsize work; the
      // flattened visible list lives in `_flattenedRows`. For a flat table these are the
      // same array.
      childNodes: bodyChildren,
      value: null,
      textValue: "",
    };
    this._keyMap.set("body", this._body);

    this._rows = [...this._headerRows, ...this._flattenedRows];
  }

  private buildColumns(
    columns: ColumnDefinition<T>[],
    showSelectionCheckboxes: boolean,
  ): GridNode<T>[] {
    const result: GridNode<T>[] = [];
    let colIndex = 0;

    if (showSelectionCheckboxes) {
      const selectionColumn: GridNode<T> = {
        type: "column" as GridNodeType,
        key: "__selection__",
        index: colIndex,
        column: 0,
        level: 0,
        hasChildNodes: false,
        childNodes: [],
        value: null,
        textValue: "Selection",
      };
      result.push(selectionColumn);
      this._keyMap.set(selectionColumn.key, selectionColumn);
      colIndex++;
    }

    for (const col of columns) {
      const node = this.buildColumnNode(col, colIndex);
      result.push(node);
      colIndex++;
    }

    return result;
  }

  private buildColumnNode(col: ColumnDefinition<T>, index: number): GridNode<T> {
    const key = col.key ?? (col as ColumnDefinition<T> & { id?: Key }).id ?? index;
    const node: GridNode<T> = {
      type: "column" as GridNodeType,
      key,
      index,
      column: index,
      level: 0,
      hasChildNodes: (col.children?.length ?? 0) > 0,
      childNodes: [],
      value: null,
      props: { columnDefinition: { ...col, key } },
      textValue: col.textValue ?? col.name ?? String(key),
    };

    if (col.children && col.children.length > 0) {
      let childIndex = 0;
      for (const child of col.children) {
        const childNode = this.buildColumnNode(child, childIndex);
        childNode.parentKey = key;
        childNode.level = 1;
        node.childNodes.push(childNode);
        childIndex++;
      }
    }

    this._keyMap.set(node.key, node);
    return node;
  }

  private getDefaultRowHeaderColumnKeys(): Set<Key> {
    const explicitRowHeaderKeys = this._columns
      .filter((col) => col.key !== "__selection__")
      .filter((col) => {
        const definition = col.props?.columnDefinition as ColumnDefinition<T> | undefined;
        return !!definition?.isRowHeader;
      })
      .map((col) => col.key);

    if (explicitRowHeaderKeys.length > 0) {
      return new Set(explicitRowHeaderKeys);
    }

    // Default to first non-selection column as row header.
    for (const col of this._columns) {
      if (col.key !== "__selection__") {
        return new Set([col.key]);
      }
    }
    return new Set();
  }

  /** Counts the leaf columns supplied by the user (excludes the selection column). */
  private countLeafColumns(): number {
    let count = 0;
    const visit = (col: GridNode<T>) => {
      if (col.key === "__selection__") {
        return;
      }
      if (col.childNodes.length > 0) {
        col.childNodes.forEach(visit);
      } else {
        count++;
      }
    };
    this._columns.forEach(visit);
    return count;
  }

  private buildHeaderRows(): GridNode<T>[] {
    if (this._columns.length === 0) {
      return [];
    }

    const headerCells: GridNode<T>[] = this._columns.map((col, index) => ({
      type: "column" as GridNodeType,
      key: `header-${col.key}`,
      index,
      column: index,
      level: 1,
      hasChildNodes: false,
      childNodes: [],
      value: null,
      textValue: col.textValue,
      parentKey: "headerrow-0",
    }));

    const headerRow: GridNode<T> = {
      type: "headerrow" as GridNodeType,
      key: "headerrow-0",
      index: 0,
      rowIndex: 0,
      level: 0,
      hasChildNodes: true,
      childNodes: headerCells,
      value: null,
      textValue: "",
    };

    this._keyMap.set(headerRow.key, headerRow);
    headerCells.forEach((cell) => this._keyMap.set(cell.key, cell));

    return [headerRow];
  }

  /**
   * Builds the cell nodes for one row. Does not register the cells in the key map;
   * the caller registers cells once the owning row is known to be present.
   */
  private buildCells(
    rowKey: Key,
    value: T,
    rowLevel: number,
    getTextValue?: (item: T, column: ColumnDefinition<T>) => string,
  ): GridNode<T>[] {
    return this._columns.map((col, colIndex) => {
      const cellKey = `${rowKey}-${col.key}`;
      const columnDefinition =
        (col.props?.columnDefinition as ColumnDefinition<T> | undefined) ??
        ({ key: col.key } as ColumnDefinition<T>);
      const cellTextValue =
        col.key === "__selection__"
          ? "Selection"
          : getTextValue
            ? getTextValue(value, columnDefinition)
            : String((value as Record<string, unknown>)?.[String(col.key)] ?? "");

      const cell: GridNode<T> = {
        type: this._rowHeaderColumnKeys.has(col.key)
          ? ("rowheader" as GridNodeType)
          : ("cell" as GridNodeType),
        key: cellKey,
        index: colIndex,
        column: colIndex,
        level: rowLevel + 1,
        hasChildNodes: false,
        childNodes: [],
        value,
        textValue: cellTextValue,
        parentKey: rowKey,
      };

      return cell;
    });
  }

  private buildRows(
    rows: RowDefinition<T>[] | T[],
    getKey?: (item: T) => Key,
    getTextValue?: (item: T, column: ColumnDefinition<T>) => string,
  ): GridNode<T>[] {
    const result: GridNode<T>[] = [];
    const rowIndexOffset = this._headerRows.length;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const isRowDef = this.isRowDefinition(row);

      const key = isRowDef ? row.key : (getKey?.(row as T) ?? i);
      const value = isRowDef ? row.value : (row as T);
      const textValue = isRowDef
        ? row.textValue
        : typeof (row as Record<string, unknown>)?.textValue === "string"
          ? ((row as Record<string, unknown>).textValue as string)
          : undefined;

      const cells = this.buildCells(key, value as T, 0, getTextValue);
      cells.forEach((cell) => this._keyMap.set(cell.key, cell));

      const rowNode: GridNode<T> = {
        type: "item" as GridNodeType,
        key,
        index: i,
        rowIndex: rowIndexOffset + i,
        level: 0,
        hasChildNodes: true,
        childNodes: cells,
        value,
        textValue: textValue ?? cells.map((c) => c.textValue).join(" "),
      };

      this._keyMap.set(key, rowNode);
      result.push(rowNode);
    }

    return result;
  }

  /**
   * Builds the tree-grid rows: every row keeps its full structure (cells then all child
   * rows, expanded or not) while only the rows whose ancestors are all expanded are
   * registered in the key map and pushed into the flattened body. Mirrors
   * `generateTreeGridCollection` upstream.
   */
  private buildTreeRows(
    rows: RowDefinition<T>[] | T[],
    expandedKeys: "all" | Set<Key>,
    getKey?: (item: T) => Key,
    getTextValue?: (item: T, column: ColumnDefinition<T>) => string,
  ): { topLevelRows: GridNode<T>[]; flattenedRows: GridNode<T>[] } {
    const isExpanded = (key: Key): boolean =>
      expandedKeys === "all" || expandedKeys.has(key);

    // Build the full tree structure without touching the key map. `index` is the row's
    // position among its same-level siblings, so aria-posinset/aria-setsize read directly.
    const buildRowNode = (
      row: RowDefinition<T> | T,
      level: number,
      parentKey: Key | null,
      indexAmongSiblings: number,
    ): GridNode<T> => {
      const isRowDef = this.isRowDefinition(row);
      const key = isRowDef ? row.key : (getKey?.(row as T) ?? indexAmongSiblings);
      const value = (isRowDef ? row.value : (row as T)) as T;
      const textValue = isRowDef
        ? row.textValue
        : typeof (row as Record<string, unknown>)?.textValue === "string"
          ? ((row as Record<string, unknown>).textValue as string)
          : undefined;

      const cells = this.buildCells(key, value, level, getTextValue);

      const childRowDefs = isRowDef ? (row.childRows ?? []) : [];
      const hasChildRows = childRowDefs.length > 0 || (isRowDef && !!row.hasChildRows);

      const childRowNodes = childRowDefs.map((child, childIdx) =>
        buildRowNode(child, level + 1, key, childIdx),
      );

      const childNodes = [...cells, ...childRowNodes];
      const rowNode: GridNode<T> = {
        type: "item" as GridNodeType,
        key,
        index: indexAmongSiblings,
        level,
        parentKey,
        hasChildNodes: true,
        childNodes,
        value,
        textValue: textValue ?? cells.map((c) => c.textValue).join(" "),
        isExpandable: hasChildRows,
        isExpanded: hasChildRows && isExpanded(key),
        firstChildKey: childNodes[0]?.key ?? null,
        lastChildKey: childNodes[childNodes.length - 1]?.key ?? null,
      };

      return rowNode;
    };

    const topLevelRows = rows.map((row, i) => buildRowNode(row, 0, "body", i));

    // Flatten the visible rows (DFS). A row is visited iff every ancestor is expanded;
    // visiting a row registers it and its cells, then descends into its child rows only
    // when the row itself is expanded.
    const flattenedRows: GridNode<T>[] = [];
    const rowIndexOffset = this._headerRows.length;
    const visit = (node: GridNode<T>) => {
      node.rowIndex = rowIndexOffset + flattenedRows.length;
      flattenedRows.push(node);
      this._keyMap.set(node.key, node);
      for (const child of node.childNodes) {
        if (child.type !== "item") {
          this._keyMap.set(child.key, child);
        }
      }
      if (isExpanded(node.key)) {
        for (const child of node.childNodes) {
          if (child.type === "item") {
            visit(child);
          }
        }
      }
    };
    for (const node of topLevelRows) {
      visit(node);
    }

    return { topLevelRows, flattenedRows };
  }

  private isRowDefinition(row: unknown): row is RowDefinition<T> {
    return typeof row === "object" && row !== null && "key" in row && "value" in row;
  }

  get size(): number {
    return this._size;
  }

  get rows(): GridNode<T>[] {
    return this._rows;
  }

  get columns(): GridNode<T>[] {
    return this._columns;
  }

  get headerRows(): GridNode<T>[] {
    return this._headerRows;
  }

  get head(): GridNode<T> | undefined {
    return this._head;
  }

  get body(): GridNode<T> {
    return this._body;
  }

  get rowCount(): number {
    return this._rows.length;
  }

  get columnCount(): number {
    return this._columns.length;
  }

  get rowHeaderColumnKeys(): Set<Key> {
    return this._rowHeaderColumnKeys;
  }

  /** The key of the column that renders the tree-grid affordance, or `null` for a flat table. */
  get treeColumn(): Key | null {
    return this._treeColumn;
  }

  /** The number of leaf columns provided by the user (excludes the selection column). */
  get userColumnCount(): number {
    return this._userColumnCount;
  }

  /** The key map of all present nodes (visible rows, their cells, columns and the body). */
  get keyMap(): Map<Key, GridNode<T>> {
    return this._keyMap;
  }

  getKeys(): Iterable<Key> {
    return this._keyMap.keys();
  }

  getItem(key: Key): GridNode<T> | null {
    return this._keyMap.get(key) ?? null;
  }

  at(index: number): GridNode<T> | null {
    if (index < 0 || index >= this._flattenedRows.length) {
      return null;
    }
    return this._flattenedRows[index];
  }

  getChildren(key: Key): Iterable<GridNode<T>> {
    const node = this._keyMap.get(key);
    return node?.childNodes ?? [];
  }

  getTextValue(key: Key): string {
    const node = this._keyMap.get(key);
    return node?.textValue ?? "";
  }

  getCell(rowKey: Key, columnKey: Key): GridNode<T> | null {
    const cellKey = `${rowKey}-${columnKey}`;
    return this._keyMap.get(cellKey) ?? null;
  }

  getFirstKey(): Key | null {
    const bodyRows = this._flattenedRows;
    return bodyRows.length > 0 ? bodyRows[0].key : null;
  }

  getLastKey(): Key | null {
    const bodyRows = this._flattenedRows;
    return bodyRows.length > 0 ? bodyRows[bodyRows.length - 1].key : null;
  }

  getKeyBefore(key: Key): Key | null {
    const node = this._keyMap.get(key);
    if (!node) return null;

    const bodyRows = this._flattenedRows;
    const index = bodyRows.findIndex((r) => r.key === key);
    if (index > 0) {
      return bodyRows[index - 1].key;
    }
    return null;
  }

  getKeyAfter(key: Key): Key | null {
    const node = this._keyMap.get(key);
    if (!node) return null;

    const bodyRows = this._flattenedRows;
    const index = bodyRows.findIndex((r) => r.key === key);
    if (index >= 0 && index < bodyRows.length - 1) {
      return bodyRows[index + 1].key;
    }
    return null;
  }

  *[Symbol.iterator](): Iterator<GridNode<T>> {
    // Only iterate visible body rows, not header rows.
    for (const row of this._flattenedRows) {
      yield row;
    }
  }
}

/**
 * Creates a table collection from options.
 */
export function createTableCollection<T>(options: TableCollectionOptions<T>): TableCollection<T> {
  return new TableCollection(options);
}
