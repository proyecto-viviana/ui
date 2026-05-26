/**
 * TableCollection - A collection class for table data.
 * Based on @react-stately/table/TableCollection.
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

  constructor(options: TableCollectionOptions<T>) {
    const {
      columns,
      rows,
      getKey,
      getTextValue,
      showSelectionCheckboxes = false,
      rowHeaderColumnKeys,
    } = options;

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

    const bodyRows = this.buildRows(rows, getKey, getTextValue);
    this._size = bodyRows.length;

    this._body = {
      type: "item" as GridNodeType,
      key: "body",
      index: this._headerRows.length,
      level: 0,
      hasChildNodes: true,
      childNodes: bodyRows,
      value: null,
      textValue: "",
    };
    this._keyMap.set("body", this._body);

    this._rows = [...this._headerRows, ...bodyRows];
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

      const cells: GridNode<T>[] = this._columns.map((col, colIndex) => {
        const cellKey = `${key}-${col.key}`;
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
          level: 1,
          hasChildNodes: false,
          childNodes: [],
          value,
          textValue: cellTextValue,
          parentKey: key,
        };

        this._keyMap.set(cellKey, cell);
        return cell;
      });

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

  getKeys(): Iterable<Key> {
    return this._keyMap.keys();
  }

  getItem(key: Key): GridNode<T> | null {
    return this._keyMap.get(key) ?? null;
  }

  at(index: number): GridNode<T> | null {
    const bodyRows = this._body.childNodes;
    if (index < 0 || index >= bodyRows.length) {
      return null;
    }
    return bodyRows[index];
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
    const bodyRows = this._body.childNodes;
    return bodyRows.length > 0 ? bodyRows[0].key : null;
  }

  getLastKey(): Key | null {
    const bodyRows = this._body.childNodes;
    return bodyRows.length > 0 ? bodyRows[bodyRows.length - 1].key : null;
  }

  getKeyBefore(key: Key): Key | null {
    const node = this._keyMap.get(key);
    if (!node) return null;

    const bodyRows = this._body.childNodes;
    const index = bodyRows.findIndex((r) => r.key === key);
    if (index > 0) {
      return bodyRows[index - 1].key;
    }
    return null;
  }

  getKeyAfter(key: Key): Key | null {
    const node = this._keyMap.get(key);
    if (!node) return null;

    const bodyRows = this._body.childNodes;
    const index = bodyRows.findIndex((r) => r.key === key);
    if (index >= 0 && index < bodyRows.length - 1) {
      return bodyRows[index + 1].key;
    }
    return null;
  }

  *[Symbol.iterator](): Iterator<GridNode<T>> {
    // Only iterate body rows, not header rows
    for (const row of this._body.childNodes) {
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
