/**
 * DOMLayoutDelegate - reads layout information for collection items directly
 * from the DOM, used by {@link ListKeyboardDelegate} for page up/down
 * navigation. Based on @react-aria/selection's `DOMLayoutDelegate`.
 *
 * React → Solid adaptation: the layout delegate captures a Solid ref accessor
 * (`() => HTMLElement | null`) instead of a React `RefObject`; everything else
 * is a faithful port.
 */

import type { Accessor } from "solid-js";
import type { Key } from "@proyecto-viviana/solid-stately";
import { getItemElement } from "./utils";

/** A rectangle in the collection's scroll coordinate space. */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The size of the collection's scrollable content. */
export interface Size {
  width: number;
  height: number;
}

/**
 * Provides layout information about the items in a collection. By default this
 * is read from the DOM (see {@link DOMLayoutDelegate}), but a virtualized
 * collection can supply its own implementation. Mirrors @react-types/shared's
 * `LayoutDelegate`, scoped to the members that selection navigation consumes.
 */
export interface LayoutDelegate {
  /** Returns the rectangle for the item with the given key, in scroll coordinates. */
  getItemRect(key: Key): Rect | null;
  /** Returns the total size of the scrollable content. */
  getContentSize(): Size;
  /** Returns the currently visible rectangle (the scroll viewport). */
  getVisibleRect(): Rect;
  /** Returns the keys between two keys (inclusive), if known without walking the collection. */
  getKeyRange?(from: Key, to: Key): Key[];
  /** Returns the key spatially to the left of the given key, if known. */
  getKeyLeftOf?(key: Key): Key | null;
  /** Returns the key spatially to the right of the given key, if known. */
  getKeyRightOf?(key: Key): Key | null;
  /** Returns the key spatially above the given key, if known. */
  getKeyAbove?(key: Key): Key | null;
  /** Returns the key spatially below the given key, if known. */
  getKeyBelow?(key: Key): Key | null;
}

/**
 * A {@link LayoutDelegate} that measures items via the DOM.
 */
export class DOMLayoutDelegate implements LayoutDelegate {
  private ref: Accessor<HTMLElement | null>;

  constructor(ref: Accessor<HTMLElement | null>) {
    this.ref = ref;
  }

  getItemRect(key: Key): Rect | null {
    const container = this.ref();
    if (!container) {
      return null;
    }
    const item = key != null ? getItemElement(this.ref, key) : null;
    if (!item) {
      return null;
    }

    const containerRect = container.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    return {
      x: itemRect.left - containerRect.left - container.clientLeft + container.scrollLeft,
      y: itemRect.top - containerRect.top - container.clientTop + container.scrollTop,
      width: itemRect.width,
      height: itemRect.height,
    };
  }

  getContentSize(): Size {
    const container = this.ref();
    return {
      width: container?.scrollWidth ?? 0,
      height: container?.scrollHeight ?? 0,
    };
  }

  getVisibleRect(): Rect {
    const container = this.ref();
    return {
      x: container?.scrollLeft ?? 0,
      y: container?.scrollTop ?? 0,
      width: container?.clientWidth ?? 0,
      height: container?.clientHeight ?? 0,
    };
  }
}
