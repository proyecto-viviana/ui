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
  /** True while this rect still uses `estimatedRowHeight` / `estimatedRowSize`. */
  estimatedSize?: boolean;
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
  /**
   * Fixed row size along the primary axis. Alias of RAC `rowSize` / `rowHeight`.
   * Takes precedence over `estimatedRowHeight`.
   */
  rowSize?: number;
  /** @deprecated Use `rowSize`. */
  rowHeight?: number;
  /**
   * Estimated row size when heights are variable. RAC `estimatedRowSize` /
   * `estimatedRowHeight` — ComboBox/Picker pass `estimatedRowHeight: 32`.
   */
  estimatedRowSize?: number;
  /** @deprecated Use `estimatedRowSize`. */
  estimatedRowHeight?: number;
  /**
   * Padding around the list along both axes. RAC `ListLayoutOptions.padding`.
   * ComboBox/Picker pass `padding: 8`; the listbox element itself is `padding: 0`.
   */
  padding?: number;
  /** Gap between items along the primary axis. */
  gap?: number;
  estimatedHeadingSize?: number;
  estimatedHeadingHeight?: number;
  loaderSize?: number;
  loaderHeight?: number;
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
    // Layout padding lives in layoutInfo / contentSize, not in these spacers.
    // RAC CollectionRoot has no CSS padding; items are absolutely inset.
    offsetTop: safeStart * itemSize,
    offsetBottom: Math.max(0, (itemCount - safeEnd) * itemSize),
  };
}

/**
 * Resolve the primary-axis row size. Fixed `rowSize` / `rowHeight` / `itemSize`
 * win over `estimatedRowHeight`. Default 40 matches the existing Solid fallback
 * (RAC ListLayout defaults to 48 only when neither fixed nor estimated is set).
 */
export function resolveListRowSizeInfo(options?: DefaultVirtualizerLayoutOptions): {
  size: number;
  estimated: boolean;
} {
  const fixed = options?.rowSize ?? options?.rowHeight ?? options?.itemSize;
  if (fixed != null && Number.isFinite(fixed)) {
    return { size: Math.max(1, fixed), estimated: false };
  }
  const estimated = options?.estimatedRowSize ?? options?.estimatedRowHeight;
  if (estimated != null && Number.isFinite(estimated)) {
    return { size: Math.max(1, estimated), estimated: true };
  }
  return { size: 40, estimated: false };
}

export function resolveListRowSize(options?: DefaultVirtualizerLayoutOptions): number {
  return resolveListRowSizeInfo(options).size;
}

export function calculateLinearVisibleRange(
  itemCount: number,
  scrollOffset: number,
  viewportSize: number,
  itemSize: number,
  overscan: number,
  padding = 0,
): VirtualizerVisibleRange {
  if (itemCount <= 0) return { start: 0, end: 0, offsetTop: 0, offsetBottom: 0 };
  const safeItemSize = Math.max(1, itemSize);
  const safeViewport = Math.max(1, viewportSize);
  const safeOverscan = Math.max(0, overscan);
  const safePadding = Math.max(0, padding);
  const start = Math.floor((scrollOffset - safePadding) / safeItemSize) - safeOverscan;
  const visibleCount = Math.ceil(safeViewport / safeItemSize) + safeOverscan * 2;
  return clampRange(itemCount, start, start + visibleCount, safeItemSize);
}

export class ListLayout {
  /** Measured primary-axis size per index, filled by VirtualizerItem. */
  private measuredMain = new Map<number, number>();

  getVisibleRange(
    ctx: VirtualizerRangeContext,
    options?: DefaultVirtualizerLayoutOptions,
  ): VirtualizerVisibleRange {
    return calculateLinearVisibleRange(
      ctx.itemCount,
      ctx.scrollOffset,
      ctx.viewportSize,
      resolveListRowSize(options),
      options?.overscan ?? ctx.overscan,
      Math.max(0, options?.padding ?? 0),
    );
  }

  updateItemSize(index: number, mainSize: number): boolean {
    if (!(mainSize > 0)) return false;
    if (this.measuredMain.get(index) === mainSize) return false;
    this.measuredMain.set(index, mainSize);
    return true;
  }

  getContentSize(
    itemCount: number,
    context: VirtualizerLayoutInfoContext,
    options?: DefaultVirtualizerLayoutOptions,
  ): Size {
    const { size: rowSize } = resolveListRowSizeInfo(options);
    const padding = Math.max(0, options?.padding ?? 0);
    const gap = Math.max(0, options?.gap ?? 0);
    const horizontal = (options?.orientation ?? "vertical") === "horizontal";
    let main = 0;
    if (itemCount > 0) {
      main = padding;
      for (let i = 0; i < itemCount; i++) {
        main += this.measuredMain.get(i) ?? rowSize;
        if (i < itemCount - 1) main += gap;
      }
      main += padding;
    }
    if (horizontal) {
      return { width: main, height: Math.max(0, context.viewportHeight ?? 0) };
    }
    return { width: Math.max(0, context.viewportWidth), height: main };
  }

  getLayoutInfo(
    index: number,
    context: VirtualizerLayoutInfoContext,
    options?: DefaultVirtualizerLayoutOptions,
  ): LayoutInfo {
    const { size: rowSize, estimated } = resolveListRowSizeInfo(options);
    const padding = Math.max(0, options?.padding ?? 0);
    const gap = Math.max(0, options?.gap ?? 0);
    const measured = this.measuredMain.get(index);
    const main = measured ?? rowSize;
    const estimatedSize = measured == null && estimated;
    const origin = this.offsetForIndex(index, rowSize, padding, gap);
    if ((options?.orientation ?? "vertical") === "horizontal") {
      return {
        key: String(index),
        index,
        estimatedSize,
        rect: {
          x: origin,
          y: padding,
          width: main,
          height: Math.max(0, (context.viewportHeight ?? 0) - padding * 2),
        },
      };
    }
    return {
      key: String(index),
      index,
      estimatedSize,
      rect: {
        x: padding,
        y: origin,
        width: Math.max(0, context.viewportWidth - padding * 2),
        height: main,
      },
    };
  }

  getDropTargetFromPoint(
    point: Point,
    itemCount: number,
    options?: DefaultVirtualizerLayoutOptions,
  ): VirtualizerDropTarget | null {
    if (itemCount <= 0) return { type: "root", index: -1, position: "on" };
    const itemSize = resolveListRowSize(options);
    const padding = Math.max(0, options?.padding ?? 0);
    const gap = Math.max(0, options?.gap ?? 0);
    const stride = itemSize + gap;
    const offset =
      ((options?.orientation ?? "vertical") === "horizontal" ? point.x : point.y) - padding;
    if (offset < 0) {
      return { type: "item", index: 0, position: "before" };
    }
    const totalSize = itemCount * stride - (itemCount > 0 ? gap : 0);
    if (offset >= totalSize) {
      return { type: "item", index: itemCount - 1, position: "after" };
    }
    const rawIndex = Math.floor(offset / stride);
    const index = Math.max(0, Math.min(rawIndex, itemCount - 1));
    const offsetWithinItem = Math.max(0, offset - index * stride);
    const threshold = itemSize / 3;
    const position: VirtualizerDropTarget["position"] =
      offsetWithinItem < threshold ? "before" : offsetWithinItem > threshold * 2 ? "after" : "on";
    return { type: "item", index, position };
  }

  private offsetForIndex(index: number, rowSize: number, padding: number, gap: number): number {
    if (this.measuredMain.size === 0) {
      return padding + index * (rowSize + gap);
    }
    let offset = padding;
    for (let i = 0; i < index; i++) {
      offset += (this.measuredMain.get(i) ?? rowSize) + gap;
    }
    return offset;
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

  getContentSize(
    itemCount: number,
    context: VirtualizerLayoutInfoContext,
    options?: GridLayoutOptions,
  ): Size {
    const rowHeight = Math.max(
      1,
      options?.rowHeight ?? options?.itemSize ?? options?.minItemSize ?? 40,
    );
    const columns = resolveGridColumnCount(context.viewportWidth, options);
    const totalRows = itemCount <= 0 ? 0 : Math.ceil(itemCount / columns);
    return {
      width: Math.max(0, context.viewportWidth),
      height: totalRows * rowHeight,
    };
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
