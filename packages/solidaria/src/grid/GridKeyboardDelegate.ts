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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/grid/GridKeyboardDelegate.ts

/**
 * GridKeyboardDelegate - Handles keyboard navigation in a grid.
 * Based on @react-aria/grid/GridKeyboardDelegate.
 */

import type { GridCollection, GridNode, Key } from "@proyecto-viviana/solid-stately";
import type { KeyboardDelegate } from "./types";
import type { Accessor } from "solid-js";

export interface GridKeyboardDelegateOptions<T> {
  /** The grid collection. */
  collection: GridCollection<T>;
  /** Set of disabled keys. */
  disabledKeys: Set<Key>;
  /** Ref to the grid element. */
  ref: Accessor<HTMLElement | null>;
  /** Focus mode: row or cell. */
  focusMode: "row" | "cell";
  /** Text direction (ltr or rtl). */
  direction: "ltr" | "rtl";
}

/**
 * A keyboard delegate that handles navigation in a grid.
 */
export class GridKeyboardDelegate<T> implements KeyboardDelegate {
  private collection: GridCollection<T>;
  private disabledKeys: Set<Key>;
  private ref: Accessor<HTMLElement | null>;
  private focusMode: "row" | "cell";
  private direction: "ltr" | "rtl";

  constructor(options: GridKeyboardDelegateOptions<T>) {
    this.collection = options.collection;
    this.disabledKeys = options.disabledKeys;
    this.ref = options.ref;
    this.focusMode = options.focusMode;
    this.direction = options.direction;
  }

  /**
   * Check if a key is disabled.
   */
  private isDisabled(key: Key): boolean {
    return this.disabledKeys.has(key);
  }

  /**
   * Get the parent row key for a cell.
   */
  private getRowKey(key: Key): Key | null {
    const item = this.collection.getItem(key);
    if (!item) return null;

    if (item.type === "item") {
      return key;
    }

    if (item.type === "cell" && item.parentKey != null) {
      return item.parentKey;
    }

    return null;
  }

  /**
   * Get all body rows (excluding header rows).
   */
  private getBodyRows(): GridNode<T>[] {
    return this.collection.rows.filter((row) => row.type === "item");
  }

  /**
   * Get the first non-disabled key.
   */
  getFirstKey(fromKey?: Key, global?: boolean): Key | null {
    const rows = this.getBodyRows();

    if (this.focusMode === "row" || global) {
      // Find first non-disabled row
      for (const row of rows) {
        if (!this.isDisabled(row.key)) {
          return row.key;
        }
      }
      return null;
    }

    // Cell focus mode - get first cell of current row or first row
    if (fromKey != null) {
      const rowKey = this.getRowKey(fromKey);
      if (rowKey != null) {
        const children = [...this.collection.getChildren(rowKey)];
        if (children.length > 0) {
          return children[0].key;
        }
      }
    }

    // Fall back to first cell of first row
    if (rows.length > 0) {
      const children = [...this.collection.getChildren(rows[0].key)];
      if (children.length > 0) {
        return children[0].key;
      }
    }

    return null;
  }

  /**
   * Get the last non-disabled key.
   */
  getLastKey(fromKey?: Key, global?: boolean): Key | null {
    const rows = this.getBodyRows();

    if (this.focusMode === "row" || global) {
      // Find last non-disabled row
      for (let i = rows.length - 1; i >= 0; i--) {
        if (!this.isDisabled(rows[i].key)) {
          return rows[i].key;
        }
      }
      return null;
    }

    // Cell focus mode - get last cell of current row or last row
    if (fromKey != null) {
      const rowKey = this.getRowKey(fromKey);
      if (rowKey != null) {
        const children = [...this.collection.getChildren(rowKey)];
        if (children.length > 0) {
          return children[children.length - 1].key;
        }
      }
    }

    // Fall back to last cell of last row
    if (rows.length > 0) {
      const children = [...this.collection.getChildren(rows[rows.length - 1].key)];
      if (children.length > 0) {
        return children[children.length - 1].key;
      }
    }

    return null;
  }

  /**
   * Get the key above the current key.
   */
  getKeyAbove(key: Key): Key | null {
    const item = this.collection.getItem(key);
    if (!item) return null;

    const rows = this.getBodyRows();

    if (this.focusMode === "row" || item.type === "item") {
      // Find the row and get the previous one
      const rowKey = item.type === "item" ? key : item.parentKey;
      const rowIndex = rows.findIndex((r) => r.key === rowKey);

      if (rowIndex > 0) {
        // Find previous non-disabled row
        for (let i = rowIndex - 1; i >= 0; i--) {
          if (!this.isDisabled(rows[i].key)) {
            return rows[i].key;
          }
        }
      }
      return null;
    }

    // Cell focus mode - get cell in same column of previous row
    if (item.type === "cell" && item.parentKey != null) {
      const rowIndex = rows.findIndex((r) => r.key === item.parentKey);
      const colIndex = item.column ?? item.index;

      if (rowIndex > 0) {
        for (let i = rowIndex - 1; i >= 0; i--) {
          if (!this.isDisabled(rows[i].key)) {
            const children = [...this.collection.getChildren(rows[i].key)];
            const targetCol = Math.min(colIndex, children.length - 1);
            if (targetCol >= 0) {
              return children[targetCol].key;
            }
          }
        }
      }
    }

    return null;
  }

  /**
   * Get the key below the current key.
   */
  getKeyBelow(key: Key): Key | null {
    const item = this.collection.getItem(key);
    if (!item) return null;

    const rows = this.getBodyRows();

    if (this.focusMode === "row" || item.type === "item") {
      // Find the row and get the next one
      const rowKey = item.type === "item" ? key : item.parentKey;
      const rowIndex = rows.findIndex((r) => r.key === rowKey);

      if (rowIndex >= 0 && rowIndex < rows.length - 1) {
        // Find next non-disabled row
        for (let i = rowIndex + 1; i < rows.length; i++) {
          if (!this.isDisabled(rows[i].key)) {
            return rows[i].key;
          }
        }
      }
      return null;
    }

    // Cell focus mode - get cell in same column of next row
    if (item.type === "cell" && item.parentKey != null) {
      const rowIndex = rows.findIndex((r) => r.key === item.parentKey);
      const colIndex = item.column ?? item.index;

      if (rowIndex >= 0 && rowIndex < rows.length - 1) {
        for (let i = rowIndex + 1; i < rows.length; i++) {
          if (!this.isDisabled(rows[i].key)) {
            const children = [...this.collection.getChildren(rows[i].key)];
            const targetCol = Math.min(colIndex, children.length - 1);
            if (targetCol >= 0) {
              return children[targetCol].key;
            }
          }
        }
      }
    }

    return null;
  }

  /**
   * Get the key to the left of the current key.
   */
  getKeyLeftOf(key: Key): Key | null {
    const item = this.collection.getItem(key);
    if (!item) return null;

    // In row focus mode, left/right might not be meaningful
    if (this.focusMode === "row") {
      return null;
    }

    if (item.type === "cell" && item.parentKey != null) {
      const children = [...this.collection.getChildren(item.parentKey)];
      const colIndex = children.findIndex((c) => c.key === key);

      if (this.direction === "rtl") {
        // RTL: left moves to higher index
        if (colIndex < children.length - 1) {
          return children[colIndex + 1].key;
        }
      } else {
        // LTR: left moves to lower index
        if (colIndex > 0) {
          return children[colIndex - 1].key;
        }
      }
    }

    return null;
  }

  /**
   * Get the key to the right of the current key.
   */
  getKeyRightOf(key: Key): Key | null {
    const item = this.collection.getItem(key);
    if (!item) return null;

    // In row focus mode, left/right might not be meaningful
    if (this.focusMode === "row") {
      return null;
    }

    if (item.type === "cell" && item.parentKey != null) {
      const children = [...this.collection.getChildren(item.parentKey)];
      const colIndex = children.findIndex((c) => c.key === key);

      if (this.direction === "rtl") {
        // RTL: right moves to lower index
        if (colIndex > 0) {
          return children[colIndex - 1].key;
        }
      } else {
        // LTR: right moves to higher index
        if (colIndex < children.length - 1) {
          return children[colIndex + 1].key;
        }
      }
    }

    return null;
  }

  /**
   * Get the key for page up.
   */
  getKeyPageAbove(key: Key): Key | null {
    const el = this.ref();
    if (!el) return null;

    const item = this.collection.getItem(key);
    if (!item) return null;

    const rows = this.getBodyRows();
    const rowKey = this.getRowKey(key);
    const rowIndex = rows.findIndex((r) => r.key === rowKey);

    if (rowIndex < 0) return null;

    // Calculate how many rows fit in a page (rough estimate)
    const rowHeight = el.scrollHeight / rows.length;
    const pageSize = Math.max(1, Math.floor(el.clientHeight / rowHeight));

    const targetIndex = Math.max(0, rowIndex - pageSize);

    // Find first non-disabled row at or before target
    for (let i = targetIndex; i >= 0; i--) {
      if (!this.isDisabled(rows[i].key)) {
        if (this.focusMode === "row" || item.type === "item") {
          return rows[i].key;
        }

        // Cell focus mode - return cell at same column
        const colIndex = item.type === "cell" ? (item.column ?? item.index) : 0;
        const children = [...this.collection.getChildren(rows[i].key)];
        const targetCol = Math.min(colIndex, children.length - 1);
        if (targetCol >= 0) {
          return children[targetCol].key;
        }
      }
    }

    return null;
  }

  /**
   * Get the key for page down.
   */
  getKeyPageBelow(key: Key): Key | null {
    const el = this.ref();
    if (!el) return null;

    const item = this.collection.getItem(key);
    if (!item) return null;

    const rows = this.getBodyRows();
    const rowKey = this.getRowKey(key);
    const rowIndex = rows.findIndex((r) => r.key === rowKey);

    if (rowIndex < 0) return null;

    // Calculate how many rows fit in a page (rough estimate)
    const rowHeight = el.scrollHeight / rows.length;
    const pageSize = Math.max(1, Math.floor(el.clientHeight / rowHeight));

    const targetIndex = Math.min(rows.length - 1, rowIndex + pageSize);

    // Find first non-disabled row at or after target
    for (let i = targetIndex; i < rows.length; i++) {
      if (!this.isDisabled(rows[i].key)) {
        if (this.focusMode === "row" || item.type === "item") {
          return rows[i].key;
        }

        // Cell focus mode - return cell at same column
        const colIndex = item.type === "cell" ? (item.column ?? item.index) : 0;
        const children = [...this.collection.getChildren(rows[i].key)];
        const targetCol = Math.min(colIndex, children.length - 1);
        if (targetCol >= 0) {
          return children[targetCol].key;
        }
      }
    }

    return null;
  }

  /**
   * Get the key that matches the search string.
   */
  getKeyForSearch(search: string, fromKey?: Key): Key | null {
    const searchLower = search.toLowerCase();
    const rows = this.getBodyRows();

    let startIndex = 0;
    if (fromKey != null) {
      const rowKey = this.getRowKey(fromKey);
      const idx = rows.findIndex((r) => r.key === rowKey);
      if (idx >= 0) {
        startIndex = idx + 1;
      }
    }

    // Search from startIndex to end
    for (let i = startIndex; i < rows.length; i++) {
      const row = rows[i];
      if (!this.isDisabled(row.key)) {
        const textValue = row.textValue?.toLowerCase() ?? "";
        if (textValue.startsWith(searchLower)) {
          return row.key;
        }
      }
    }

    // Wrap around and search from beginning
    for (let i = 0; i < startIndex; i++) {
      const row = rows[i];
      if (!this.isDisabled(row.key)) {
        const textValue = row.textValue?.toLowerCase() ?? "";
        if (textValue.startsWith(searchLower)) {
          return row.key;
        }
      }
    }

    return null;
  }
}
