/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/table/useTableColumnResizeState.ts

/**
 * Table column resize state management.
 * Based on @react-stately/table/useTableColumnResizeState.
 *
 * Provides column width state management for a table with column resizing.
 * Tracks column widths, the currently resizing column, and handles
 * width distribution and clamping.
 */

import { createMemo } from "solid-js";
import type { Accessor } from "solid-js";
import { createInternalSignal } from "../utils";

import type { Key } from "../collections/types";

/** Column size: a number (px) or a string ('100px', '50%', '1fr'). */
export type ColumnSize = number | string;

export interface ColumnResizeDefinition {
  /** The column key. */
  key: Key;
  /** The width of the column. Numbers are px, strings can be 'Xfr', 'Xpx', or 'X%'. */
  width?: ColumnSize;
  /** Minimum width in pixels. Default: 75. */
  minWidth?: number;
  /** Maximum width in pixels. Default: Infinity. */
  maxWidth?: number;
}

export interface TableColumnResizeStateProps {
  /** Current width of the table or table viewport. */
  tableWidth: number;
  /** Column definitions with width/min/max. */
  columns: ColumnResizeDefinition[];
}

export interface TableColumnResizeState {
  /** The key of the column currently being resized, or null. */
  readonly resizingColumn: Accessor<Key | null>;
  /** A reactive map of computed column widths in pixels. */
  readonly columnWidths: Accessor<Map<Key, number>>;
  /** Begin a resize operation for the given column. */
  startResize(key: Key): void;
  /** End the current resize operation. */
  endResize(): void;
  /** Update column widths during a resize drag. Returns the new widths map. */
  updateResizedColumns(key: Key, width: number): Map<Key, number>;
  /** Get the current computed width for a column. */
  getColumnWidth(key: Key): number;
  /** Get the minimum width for a column. */
  getColumnMinWidth(key: Key): number;
  /** Get the maximum width for a column. */
  getColumnMaxWidth(key: Key): number;
}

const DEFAULT_MIN_WIDTH = 75;
const DEFAULT_MAX_WIDTH = Infinity;

interface ParsedColumn {
  key: Key;
  /** Fraction units (from 'Xfr' or unspecified width). 0 if fixed. */
  fr: number;
  /** Fixed pixel width, or 0 if fractional. */
  fixedPx: number;
  minWidth: number;
  maxWidth: number;
}

function parseColumnDef(col: ColumnResizeDefinition, tableWidth: number): ParsedColumn {
  const minWidth = col.minWidth ?? DEFAULT_MIN_WIDTH;
  const maxWidth = col.maxWidth ?? DEFAULT_MAX_WIDTH;

  if (col.width == null) {
    // Default: 1fr
    return { key: col.key, fr: 1, fixedPx: 0, minWidth, maxWidth };
  }

  if (typeof col.width === "number") {
    return { key: col.key, fr: 0, fixedPx: col.width, minWidth, maxWidth };
  }

  const str = col.width.trim();

  // Fractional: '2fr', '1.5fr'
  if (str.endsWith("fr")) {
    const val = parseFloat(str);
    return { key: col.key, fr: isNaN(val) ? 1 : val, fixedPx: 0, minWidth, maxWidth };
  }

  // Percentage: '25%'
  if (str.endsWith("%")) {
    const pct = parseFloat(str);
    const px = isNaN(pct) ? 0 : (pct / 100) * tableWidth;
    return { key: col.key, fr: 0, fixedPx: px, minWidth, maxWidth };
  }

  // Pixel: '200px' or just a numeric string
  const px = parseFloat(str);
  return { key: col.key, fr: 0, fixedPx: isNaN(px) ? 0 : px, minWidth, maxWidth };
}

function applyFractionalRemainder(
  widths: Map<Key, number>,
  columns: ColumnResizeDefinition[],
  originalWidth: number,
): void {
  const flooredWidth = Math.floor(originalWidth);
  const hasFractionalWidth = originalWidth - flooredWidth > 0;
  if (!hasFractionalWidth || columns.length === 0) return;

  const lastKey = columns[columns.length - 1].key;
  if (widths.has(lastKey)) {
    const tableFractionalWidth = originalWidth.toString().split(".")[1];
    if (tableFractionalWidth) {
      const columnWidth = Math.floor(widths.get(lastKey)!).toString();
      widths.set(lastKey, Number(columnWidth + "." + tableFractionalWidth));
    }
  }
}

/**
 * Distribute `tableWidth` among columns:
 *  1. Floor tableWidth to integer before column sizing, matching upstream TableUtils.calculateColumnSizes.
 *  2. Fixed-width columns get their declared width (clamped to min/max).
 *  3. Remaining space is distributed among fractional columns proportionally with cascading rounding.
 *  4. Leftover sub-pixel width is added to the last column so widths sum exactly to tableWidth.
 */
function distributeWidths(columns: ColumnResizeDefinition[], tableWidth: number): Map<Key, number> {
  const originalWidth = tableWidth;
  const flooredWidth = Math.floor(tableWidth);
  const availableWidth = Math.max(0, flooredWidth);

  const parsed = columns.map((c) => parseColumnDef(c, availableWidth));

  // Pass 1 — allocate fixed columns
  let usedSpace = 0;
  let totalFr = 0;
  for (const p of parsed) {
    if (p.fr > 0) {
      totalFr += p.fr;
    } else {
      const w = Math.max(p.minWidth, Math.min(p.maxWidth, p.fixedPx));
      usedSpace += w;
    }
  }

  const remainingSpace = Math.max(0, availableWidth - usedSpace);
  const perFr = totalFr > 0 ? remainingSpace / totalFr : 0;

  // Pass 2 — build map with cascading rounding
  const widths = new Map<Key, number>();
  let fpTotal = 0;
  let intTotal = 0;

  for (const p of parsed) {
    let targetSize: number;
    if (p.fr > 0) {
      targetSize = p.fr * perFr;
    } else {
      targetSize = p.fixedPx;
    }
    // Clamp
    targetSize = Math.max(p.minWidth, Math.min(p.maxWidth, targetSize));

    // Cascade rounding to ensure sum of integers matches availableWidth
    const rounded = Math.round(targetSize + fpTotal) - intTotal;
    fpTotal += targetSize;
    intTotal += rounded;

    widths.set(p.key, rounded);
  }

  // Give the leftover sub-pixel width to the last column so the columns sum
  // exactly to the (possibly fractional) available width.
  applyFractionalRemainder(widths, columns, originalWidth);

  return widths;
}

/**
 * Creates column resize state for a table component.
 *
 * Builds an initial column width map from column definitions + table width,
 * then tracks resize operations that clamp to min/max and redistribute
 * remaining space among flex columns.
 */
export function createTableColumnResizeState(
  props: Accessor<TableColumnResizeStateProps>,
): TableColumnResizeState {
  const getProps = () => props();

  // Memoize initial width distribution (re-distributes when table width or columns change)
  const initialWidths = createMemo(() =>
    distributeWidths(getProps().columns, getProps().tableWidth),
  );

  // User-overridden widths (set during/after resize)
  const [overrides, setOverrides] = createInternalSignal<Map<Key, number>>(new Map());
  const [resizingColumn, setResizingColumn] = createInternalSignal<Key | null>(null);

  // Computed widths: initial merged with overrides
  const columnWidths = createMemo(() => {
    const base = initialWidths();
    const over = overrides();
    if (over.size === 0) return base;

    const merged = new Map(base);
    for (const [key, width] of over) {
      if (merged.has(key)) {
        merged.set(key, width);
      }
    }
    applyFractionalRemainder(merged, getProps().columns, getProps().tableWidth);
    return merged;
  });

  // Build min/max lookup
  const minWidthMap = createMemo(() => {
    const map = new Map<Key, number>();
    for (const col of getProps().columns) {
      map.set(col.key, col.minWidth ?? DEFAULT_MIN_WIDTH);
    }
    return map;
  });

  const maxWidthMap = createMemo(() => {
    const map = new Map<Key, number>();
    for (const col of getProps().columns) {
      map.set(col.key, col.maxWidth ?? DEFAULT_MAX_WIDTH);
    }
    return map;
  });

  const getColumnWidth = (key: Key): number => {
    return columnWidths().get(key) ?? 0;
  };

  const getColumnMinWidth = (key: Key): number => {
    return minWidthMap().get(key) ?? DEFAULT_MIN_WIDTH;
  };

  const getColumnMaxWidth = (key: Key): number => {
    return maxWidthMap().get(key) ?? DEFAULT_MAX_WIDTH;
  };

  const startResize = (key: Key) => {
    setResizingColumn(key);
  };

  const endResize = () => {
    setResizingColumn(null);
  };

  const updateResizedColumns = (key: Key, width: number): Map<Key, number> => {
    const minW = getColumnMinWidth(key);
    const maxW = getColumnMaxWidth(key);
    const clampedWidth = Math.max(minW, Math.min(maxW, Math.floor(width)));

    const newOverrides = new Map(overrides());
    newOverrides.set(key, clampedWidth);
    setOverrides(newOverrides);

    // Return the resulting widths
    const base = initialWidths();
    const merged = new Map(base);
    for (const [k, w] of newOverrides) {
      if (merged.has(k)) {
        merged.set(k, w);
      }
    }
    applyFractionalRemainder(merged, getProps().columns, getProps().tableWidth);
    return merged;
  };

  return {
    resizingColumn,
    columnWidths,
    startResize,
    endResize,
    updateResizedColumns,
    getColumnWidth,
    getColumnMinWidth,
    getColumnMaxWidth,
  };
}
