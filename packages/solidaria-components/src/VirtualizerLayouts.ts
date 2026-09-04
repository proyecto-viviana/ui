/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/layout/GridLayout.ts
// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/layout/ListLayout.ts
// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/layout/TableLayout.ts
// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/layout/WaterfallLayout.ts

/**
 * Layout primitives for solidaria-components Virtualizer.
 *
 * These layout contracts are based on:
 * - packages/react-stately/src/layout/ListLayout.ts
 * - packages/react-stately/src/layout/GridLayout.ts
 * - packages/react-stately/src/layout/TableLayout.ts
 * - packages/react-stately/src/layout/WaterfallLayout.ts
 */

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Size {
  width: number;
  height: number;
}

/**
 * The primary orientation of a linear layout — the axis items stack along, which
 * is usually the direction the collection scrolls. Mirrors React Spectrum's
 * `Orientation` and `ListLayout`'s `orientation` option.
 */
export type Orientation = "horizontal" | "vertical";

export interface LayoutInfo {
  key: string | number;
  index: number;
  rect: Rect;
}

export interface VirtualizerVisibleRange {
  start: number;
  end: number;
  offsetTop: number;
  offsetBottom: number;
}

export interface VirtualizerRangeContext {
  itemCount: number;
  scrollOffset: number;
  viewportSize: number;
  overscan: number;
  viewportWidth?: number;
}

export interface DefaultVirtualizerLayoutOptions {
  itemSize?: number;
  overscan?: number;
  viewportSize?: number;
  /**
   * The primary orientation of the items. Items offset along `x`/`width` when
   * `horizontal`, and along `y`/`height` when `vertical`.
   *
   * @default 'vertical'
   */
  orientation?: Orientation;
}

export interface GridLayoutOptions extends DefaultVirtualizerLayoutOptions {
  rowHeight?: number;
  columnCount?: number;
  viewportWidth?: number;
  /** Minimum card/item width used to derive `columnCount` when it is omitted. */
  minItemSize?: number;
  /** Maximum card/item width. Consumed by CardView packing. */
  maxItemSize?: number;
  /** Gutter between items. */
  minSpace?: number;
}

export interface WaterfallLayoutOptions extends GridLayoutOptions {
  minColumnWidth?: number;
  viewportWidth?: number;
  gap?: number;
}

export interface VirtualizerLayoutInfoContext {
  viewportWidth: number;
  /**
   * The viewport height, used as the cross-axis size for a `horizontal` layout
   * (the analogue of `viewportWidth` for the `vertical` default).
   */
  viewportHeight?: number;
}

export interface VirtualizerDropTarget {
  type: "item" | "root";
  index: number;
  position: "before" | "on" | "after";
  key?: string | number;
  parentKey?: string | number | null;
  level?: number;
}

function clampRange(
  itemCount: number,
  start: number,
  end: number,
  itemSize: number,
): VirtualizerVisibleRange {
  const safeStart = Math.max(0, Math.min(start, itemCount));
  const safeEnd = Math.max(safeStart, Math.min(end, itemCount));
  return {
    start: safeStart,
    end: safeEnd,
    offsetTop: safeStart * itemSize,
    offsetBottom: Math.max(0, (itemCount - safeEnd) * itemSize),
  };
}

export function calculateLinearVisibleRange(
  itemCount: number,
  scrollOffset: number,
  viewportSize: number,
  itemSize: number,
  overscan: number,
): VirtualizerVisibleRange {
  if (itemCount <= 0) return { start: 0, end: 0, offsetTop: 0, offsetBottom: 0 };
  const safeItemSize = Math.max(1, itemSize);
  const safeViewport = Math.max(1, viewportSize);
  const safeOverscan = Math.max(0, overscan);
  const start = Math.floor(scrollOffset / safeItemSize) - safeOverscan;
  const visibleCount = Math.ceil(safeViewport / safeItemSize) + safeOverscan * 2;
  return clampRange(itemCount, start, start + visibleCount, safeItemSize);
}

export class ListLayout {
  getVisibleRange(
    ctx: VirtualizerRangeContext,
    options?: DefaultVirtualizerLayoutOptions,
  ): VirtualizerVisibleRange {
    return calculateLinearVisibleRange(
      ctx.itemCount,
      ctx.scrollOffset,
      ctx.viewportSize,
      options?.itemSize ?? 40,
      options?.overscan ?? ctx.overscan,
    );
  }

  getLayoutInfo(
    index: number,
    context: VirtualizerLayoutInfoContext,
    options?: DefaultVirtualizerLayoutOptions,
  ): LayoutInfo {
    const itemSize = Math.max(1, options?.itemSize ?? 40);
    if ((options?.orientation ?? "vertical") === "horizontal") {
      // Items stack along the x axis; the cross axis (height) fills the viewport.
      return {
        key: String(index),
        index,
        rect: {
          x: index * itemSize,
          y: 0,
          width: itemSize,
          height: Math.max(0, context.viewportHeight ?? 0),
        },
      };
    }
    // Items stack along the y axis; the cross axis (width) fills the viewport.
    return {
      key: String(index),
      index,
      rect: {
        x: 0,
        y: index * itemSize,
        width: Math.max(0, context.viewportWidth),
        height: itemSize,
      },
    };
  }

  getDropTargetFromPoint(
    point: Point,
    itemCount: number,
    options?: DefaultVirtualizerLayoutOptions,
  ): VirtualizerDropTarget | null {
    if (itemCount <= 0) return { type: "root", index: -1, position: "on" };
    const itemSize = Math.max(1, options?.itemSize ?? 40);
    // Measure the drop point along the primary (scroll) axis.
    const offset = (options?.orientation ?? "vertical") === "horizontal" ? point.x : point.y;
    if (offset < 0) {
      return { type: "item", index: 0, position: "before" };
    }
    const totalSize = itemCount * itemSize;
    if (offset >= totalSize) {
      return { type: "item", index: itemCount - 1, position: "after" };
    }
    const rawIndex = Math.floor(offset / itemSize);
    const index = Math.max(0, Math.min(rawIndex, itemCount - 1));
    const offsetWithinItem = Math.max(0, offset - index * itemSize);
    const threshold = itemSize / 3;
    const position: VirtualizerDropTarget["position"] =
      offsetWithinItem < threshold ? "before" : offsetWithinItem > threshold * 2 ? "after" : "on";
    return { type: "item", index, position };
  }
}

export class TableLayout extends ListLayout {}

function resolveGridColumnCount(ctxWidth: number | undefined, options?: GridLayoutOptions): number {
  if (options?.columnCount != null && options.columnCount > 0) {
    return Math.max(1, options.columnCount);
  }
  const width = Math.max(1, options?.viewportWidth ?? ctxWidth ?? 320);
  const minItem = Math.max(1, options?.minItemSize ?? options?.itemSize ?? 150);
  const minSpace = Math.max(0, options?.minSpace ?? 0);
  return Math.max(1, Math.floor((width + minSpace) / (minItem + minSpace)));
}

export class GridLayout {
  getVisibleRange(
    ctx: VirtualizerRangeContext,
    options?: GridLayoutOptions,
  ): VirtualizerVisibleRange {
    if (ctx.itemCount <= 0) return { start: 0, end: 0, offsetTop: 0, offsetBottom: 0 };
    const rowHeight = Math.max(
      1,
      options?.rowHeight ?? options?.itemSize ?? options?.minItemSize ?? 40,
    );
    const columns = resolveGridColumnCount(ctx.viewportWidth, options);
    const safeViewport = Math.max(1, ctx.viewportSize);
    const safeOverscan = Math.max(0, options?.overscan ?? ctx.overscan);

    const startRow = Math.max(0, Math.floor(ctx.scrollOffset / rowHeight) - safeOverscan);
    const visibleRows = Math.ceil(safeViewport / rowHeight) + safeOverscan * 2;
    const endRow = startRow + visibleRows;

    const start = startRow * columns;
    const end = Math.min(ctx.itemCount, endRow * columns);

    const totalRows = Math.ceil(ctx.itemCount / columns);
    const clampedStartRow = Math.floor(start / columns);
    const renderedRows = Math.ceil((end - start) / columns);
    const offsetTop = clampedStartRow * rowHeight;
    const offsetBottom = Math.max(0, (totalRows - clampedStartRow - renderedRows) * rowHeight);

    return { start, end, offsetTop, offsetBottom };
  }

  getLayoutInfo(
    index: number,
    context: VirtualizerLayoutInfoContext,
    options?: GridLayoutOptions,
  ): LayoutInfo {
    const rowHeight = Math.max(
      1,
      options?.rowHeight ?? options?.itemSize ?? options?.minItemSize ?? 40,
    );
    const columns = resolveGridColumnCount(context.viewportWidth, options);
    const row = Math.floor(index / columns);
    const col = index % columns;
    const width = Math.max(1, context.viewportWidth);
    const cellWidth = Math.floor(width / columns);
    return {
      key: String(index),
      index,
      rect: {
        x: col * cellWidth,
        y: row * rowHeight,
        width: cellWidth,
        height: rowHeight,
      },
    };
  }

  getDropTargetFromPoint(
    point: Point,
    itemCount: number,
    options?: GridLayoutOptions,
  ): VirtualizerDropTarget | null {
    if (itemCount <= 0) return { type: "root", index: -1, position: "on" };
    const rowHeight = Math.max(
      1,
      options?.rowHeight ?? options?.itemSize ?? options?.minItemSize ?? 40,
    );
    const columns = resolveGridColumnCount(options?.viewportWidth, options);
    const totalRows = Math.ceil(itemCount / columns);
    const totalHeight = totalRows * rowHeight;
    if (point.y < 0) {
      return { type: "item", index: 0, position: "before" };
    }
    if (point.y >= totalHeight) {
      return { type: "item", index: itemCount - 1, position: "after" };
    }
    const width = Math.max(1, options?.viewportWidth ?? 320);
    const cellWidth = width / columns;
    const row = Math.max(0, Math.floor(point.y / rowHeight));
    const col = Math.max(0, Math.min(columns - 1, Math.floor(Math.max(0, point.x) / cellWidth)));
    const index = Math.max(0, Math.min(itemCount - 1, row * columns + col));
    const withinRow = Math.max(0, point.y - row * rowHeight);
    const threshold = rowHeight / 3;
    const position: VirtualizerDropTarget["position"] =
      withinRow < threshold ? "before" : withinRow > threshold * 2 ? "after" : "on";
    return { type: "item", index, position };
  }
}

export class WaterfallLayout extends GridLayout {
  override getVisibleRange(
    ctx: VirtualizerRangeContext,
    options?: WaterfallLayoutOptions,
  ): VirtualizerVisibleRange {
    const width = Math.max(1, options?.viewportWidth ?? 320);
    const minColumnWidth = Math.max(1, options?.minColumnWidth ?? 200);
    const gap = Math.max(0, options?.gap ?? 0);
    const columnCount = Math.max(1, Math.floor((width + gap) / (minColumnWidth + gap)));
    return super.getVisibleRange(ctx, { ...options, columnCount });
  }

  override getLayoutInfo(
    index: number,
    context: VirtualizerLayoutInfoContext,
    options?: WaterfallLayoutOptions,
  ): LayoutInfo {
    const width = Math.max(1, options?.viewportWidth ?? context.viewportWidth);
    const minColumnWidth = Math.max(1, options?.minColumnWidth ?? 200);
    const gap = Math.max(0, options?.gap ?? 0);
    const columnCount = Math.max(1, Math.floor((width + gap) / (minColumnWidth + gap)));
    return super.getLayoutInfo(index, context, { ...options, columnCount });
  }

  override getDropTargetFromPoint(
    point: Point,
    itemCount: number,
    options?: WaterfallLayoutOptions,
  ): VirtualizerDropTarget | null {
    const width = Math.max(1, options?.viewportWidth ?? 320);
    const minColumnWidth = Math.max(1, options?.minColumnWidth ?? 200);
    const gap = Math.max(0, options?.gap ?? 0);
    const columnCount = Math.max(1, Math.floor((width + gap) / (minColumnWidth + gap)));
    return super.getDropTargetFromPoint(point, itemCount, { ...options, columnCount });
  }
}
