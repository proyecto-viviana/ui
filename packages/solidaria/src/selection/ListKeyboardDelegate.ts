/**
 * ListKeyboardDelegate - keyboard navigation for a list/stack collection.
 * Based on @react-aria/selection's `ListKeyboardDelegate`.
 *
 * React → Solid adaptations (faithful to upstream behavior):
 *  - The ref is a Solid accessor (`() => HTMLElement | null`) rather than a
 *    React `RefObject`; `this.ref()` replaces `this.ref.current`.
 *  - Only the options-object constructor is kept. Upstream also retains a legacy
 *    positional overload for old `useSelectableCollection` callers; we have none.
 *  - `getKeyLeftOf` / `getKeyRightOf` are still removed for a vertical stack
 *    (so `delegate.getKeyLeftOf` is `undefined`, exactly as upstream), which the
 *    selectable-collection handler relies on to no-op Left/Right.
 *  - Disabled resolution reads our node shape: per-item disabled lives on the
 *    top-level `node.isDisabled` (and is also funneled into `disabledKeys`),
 *    while upstream reads `node.props.isDisabled`. We check both so the delegate
 *    is correct whether constructed from a manager or directly in a test.
 */

import type { Accessor } from "solid-js";
import type {
  Collection,
  CollectionNode,
  DisabledBehavior,
  Key,
} from "@proyecto-viviana/solid-stately";
import type { KeyboardDelegate } from "../grid/types";
import { isScrollable } from "../utils/dom";
import { getItemElement } from "./utils";
import { DOMLayoutDelegate, type LayoutDelegate, type Rect } from "./DOMLayoutDelegate";

/** The primary orientation of a list's items. */
export type Orientation = "horizontal" | "vertical";
/** Text direction. */
export type Direction = "ltr" | "rtl";

export interface ListKeyboardDelegateOptions<T> {
  /** The collection to navigate. */
  collection: Collection<T>;
  /** A Solid ref accessor to the collection element. */
  ref: Accessor<HTMLElement | null>;
  /** A locale-aware collator used for typeahead search. */
  collator?: Intl.Collator;
  /** The layout of the items: a 1D `stack` (default) or a 2D `grid`. */
  layout?: "stack" | "grid";
  /** The primary orientation of the items. @default 'vertical' */
  orientation?: Orientation;
  /** The text direction. */
  direction?: Direction;
  /** The item keys that are disabled. */
  disabledKeys?: Set<Key>;
  /** Whether disabled items are skipped by navigation. @default 'all' */
  disabledBehavior?: DisabledBehavior;
  /** A delegate providing layout information (defaults to a DOM-backed one). */
  layoutDelegate?: LayoutDelegate;
}

/**
 * A keyboard delegate that handles navigation within a list/stack collection.
 */
export class ListKeyboardDelegate<T> implements KeyboardDelegate {
  private collection: Collection<T>;
  private disabledKeys: Set<Key>;
  private disabledBehavior: DisabledBehavior;
  private ref: Accessor<HTMLElement | null>;
  private collator: Intl.Collator | undefined;
  private layout: "stack" | "grid";
  private orientation: Orientation;
  private direction: Direction | undefined;
  private layoutDelegate: LayoutDelegate;

  /** Present unless this is a vertical stack (mirrors upstream's method deletion). */
  getKeyLeftOf?: (key: Key, options?: { includeDisabled?: boolean }) => Key | null;
  /** Present unless this is a vertical stack (mirrors upstream's method deletion). */
  getKeyRightOf?: (key: Key, options?: { includeDisabled?: boolean }) => Key | null;

  constructor(options: ListKeyboardDelegateOptions<T>) {
    this.collection = options.collection;
    this.ref = options.ref;
    this.collator = options.collator;
    this.disabledKeys = options.disabledKeys ?? new Set();
    this.disabledBehavior = options.disabledBehavior ?? "all";
    this.orientation = options.orientation ?? "vertical";
    this.direction = options.direction;
    this.layout = options.layout ?? "stack";
    this.layoutDelegate = options.layoutDelegate ?? new DOMLayoutDelegate(options.ref);

    // For anything but a vertical stack, expose the left/right methods. Leaving
    // them undefined for a vertical stack matches upstream, which deletes them so
    // the selectable-collection handler treats Left/Right as no-ops.
    if (!(this.layout === "stack" && this.orientation === "vertical")) {
      this.getKeyLeftOf = (key, opts) => this.computeKeyLeftOf(key, opts);
      this.getKeyRightOf = (key, opts) => this.computeKeyRightOf(key, opts);
    }
  }

  private isDisabled(item: CollectionNode<T>): boolean {
    return (
      this.disabledBehavior === "all" &&
      (item.props?.isDisabled === true ||
        item.isDisabled === true ||
        this.disabledKeys.has(item.key)) &&
      item.props?.disabledBehavior !== "selection"
    );
  }

  private findNextNonDisabled(
    key: Key | null,
    getNext: (key: Key) => Key | null,
    includeDisabled = false,
  ): Key | null {
    let nextKey = key;
    while (nextKey != null) {
      const item = this.collection.getItem(nextKey);
      if (item?.type === "item" && (includeDisabled || !this.isDisabled(item))) {
        return nextKey;
      }

      nextKey = getNext(nextKey);
    }

    return null;
  }

  getNextKey(key: Key, options?: { includeDisabled?: boolean }): Key | null {
    let nextKey: Key | null = key;
    nextKey = this.collection.getKeyAfter(nextKey);
    return this.findNextNonDisabled(
      nextKey,
      (k) => this.collection.getKeyAfter(k),
      options?.includeDisabled,
    );
  }

  getPreviousKey(key: Key, options?: { includeDisabled?: boolean }): Key | null {
    let nextKey: Key | null = key;
    nextKey = this.collection.getKeyBefore(nextKey);
    return this.findNextNonDisabled(
      nextKey,
      (k) => this.collection.getKeyBefore(k),
      options?.includeDisabled,
    );
  }

  private findKey(
    key: Key,
    nextKey: (key: Key) => Key | null,
    shouldSkip: (prevRect: Rect, itemRect: Rect) => boolean,
  ): Key | null {
    let tempKey: Key | null = key;
    let itemRect = this.layoutDelegate.getItemRect(tempKey);
    if (!itemRect || tempKey == null) {
      return null;
    }

    // Find the item above or below in the same column.
    const prevRect = itemRect;
    do {
      tempKey = nextKey(tempKey);
      if (tempKey == null) {
        break;
      }
      itemRect = this.layoutDelegate.getItemRect(tempKey);
    } while (itemRect && shouldSkip(prevRect, itemRect) && tempKey != null);

    return tempKey;
  }

  private isSameRow(prevRect: Rect, itemRect: Rect): boolean {
    return prevRect.y === itemRect.y || prevRect.x !== itemRect.x;
  }

  private isSameColumn(prevRect: Rect, itemRect: Rect): boolean {
    return prevRect.x === itemRect.x || prevRect.y !== itemRect.y;
  }

  // Checks whether the next/prev key is spatially above/below the current key.
  // If not, we are in a reversed (column-reverse) layout and need to flip.
  private isReversed(key: Key): boolean {
    const nextKey = this.getNextKey(key);
    const currentEl = getItemElement(this.ref, key);
    if (nextKey != null) {
      const nextEl = getItemElement(this.ref, nextKey);
      if (!currentEl || !nextEl) {
        return false;
      }
      return currentEl.getBoundingClientRect().top > nextEl.getBoundingClientRect().top;
    }
    const prevKey = this.getPreviousKey(key);
    if (prevKey != null) {
      const prevEl = getItemElement(this.ref, prevKey);
      if (!currentEl || !prevEl) {
        return false;
      }
      return prevEl.getBoundingClientRect().top > currentEl.getBoundingClientRect().top;
    }
    return false;
  }

  getKeyBelow(key: Key, options?: { includeDisabled?: boolean }): Key | null {
    if (this.layout === "grid" && this.orientation === "vertical") {
      return this.findKey(key, (k) => this.getNextKey(k, options), this.isSameRow);
    } else if (this.orientation === "vertical") {
      return this.isReversed(key)
        ? this.getPreviousKey(key, options)
        : this.getNextKey(key, options);
    } else {
      return this.getNextKey(key, options);
    }
  }

  getKeyAbove(key: Key, options?: { includeDisabled?: boolean }): Key | null {
    if (this.layout === "grid" && this.orientation === "vertical") {
      return this.findKey(key, (k) => this.getPreviousKey(k, options), this.isSameRow);
    } else if (this.orientation === "vertical") {
      return this.isReversed(key)
        ? this.getNextKey(key, options)
        : this.getPreviousKey(key, options);
    } else {
      return this.getPreviousKey(key, options);
    }
  }

  private getNextColumn(key: Key, right: boolean, options?: { includeDisabled?: boolean }): Key | null {
    return right ? this.getPreviousKey(key, options) : this.getNextKey(key, options);
  }

  private computeKeyRightOf(key: Key, options?: { includeDisabled?: boolean }): Key | null {
    const method = this.direction === "ltr" ? "getKeyRightOf" : "getKeyLeftOf";
    const layoutMethod = this.layoutDelegate[method];
    if (layoutMethod) {
      const next = layoutMethod.call(this.layoutDelegate, key);
      return this.findNextNonDisabled(
        next,
        (k) => this.layoutDelegate[method]?.call(this.layoutDelegate, k) ?? null,
        options?.includeDisabled,
      );
    }

    if (this.layout === "grid") {
      if (this.orientation === "vertical") {
        return this.getNextColumn(key, this.direction === "rtl", options);
      } else {
        return this.findKey(
          key,
          (k) => this.getNextColumn(k, this.direction === "rtl", options),
          this.isSameColumn,
        );
      }
    } else if (this.orientation === "horizontal") {
      return this.getNextColumn(key, this.direction === "rtl", options);
    }

    return null;
  }

  private computeKeyLeftOf(key: Key, options?: { includeDisabled?: boolean }): Key | null {
    const method = this.direction === "ltr" ? "getKeyLeftOf" : "getKeyRightOf";
    const layoutMethod = this.layoutDelegate[method];
    if (layoutMethod) {
      const next = layoutMethod.call(this.layoutDelegate, key);
      return this.findNextNonDisabled(
        next,
        (k) => this.layoutDelegate[method]?.call(this.layoutDelegate, k) ?? null,
        options?.includeDisabled,
      );
    }

    if (this.layout === "grid") {
      if (this.orientation === "vertical") {
        return this.getNextColumn(key, this.direction === "ltr", options);
      } else {
        return this.findKey(
          key,
          (k) => this.getNextColumn(k, this.direction === "ltr", options),
          this.isSameColumn,
        );
      }
    } else if (this.orientation === "horizontal") {
      return this.getNextColumn(key, this.direction === "ltr", options);
    }

    return null;
  }

  getFirstKey(): Key | null {
    const key = this.collection.getFirstKey();
    return this.findNextNonDisabled(key, (k) => this.collection.getKeyAfter(k));
  }

  getLastKey(): Key | null {
    const key = this.collection.getLastKey();
    return this.findNextNonDisabled(key, (k) => this.collection.getKeyBefore(k));
  }

  getKeyPageAbove(key: Key): Key | null {
    const menu = this.ref();
    let itemRect = this.layoutDelegate.getItemRect(key);
    if (!itemRect) {
      return null;
    }

    const reversed = this.isReversed(key);
    if (menu && !isScrollable(menu)) {
      return this.getFirstKey();
    }

    let nextKey: Key | null = key;
    if (this.orientation === "horizontal") {
      const pageX = Math.max(
        0,
        itemRect.x + itemRect.width - this.layoutDelegate.getVisibleRect().width,
      );

      while (itemRect && itemRect.x > pageX && nextKey != null) {
        nextKey = this.getKeyAbove(nextKey);
        itemRect = nextKey == null ? null : this.layoutDelegate.getItemRect(nextKey);
      }
    } else {
      const visibleRect = this.layoutDelegate.getVisibleRect();
      // Column-reverse makes y negative for items, so use current pos - height instead.
      const pageY = reversed
        ? itemRect.y - visibleRect.height
        : Math.max(0, itemRect.y + itemRect.height - visibleRect.height);

      while (itemRect && itemRect.y > pageY && nextKey != null) {
        nextKey = this.getKeyAbove(nextKey);
        itemRect = nextKey == null ? null : this.layoutDelegate.getItemRect(nextKey);
      }
    }

    return nextKey ?? (reversed ? this.getLastKey() : this.getFirstKey());
  }

  getKeyPageBelow(key: Key): Key | null {
    const menu = this.ref();
    let itemRect = this.layoutDelegate.getItemRect(key);
    if (!itemRect) {
      return null;
    }

    const reversed = this.isReversed(key);
    if (menu && !isScrollable(menu)) {
      return this.getLastKey();
    }

    let nextKey: Key | null = key;
    if (this.orientation === "horizontal") {
      const pageX = Math.min(
        this.layoutDelegate.getContentSize().width,
        itemRect.x - itemRect.width + this.layoutDelegate.getVisibleRect().width,
      );

      while (itemRect && itemRect.x < pageX && nextKey != null) {
        nextKey = this.getKeyBelow(nextKey);
        itemRect = nextKey == null ? null : this.layoutDelegate.getItemRect(nextKey);
      }
    } else {
      const pageY = Math.min(
        this.layoutDelegate.getContentSize().height,
        itemRect.y - itemRect.height + this.layoutDelegate.getVisibleRect().height,
      );

      while (itemRect && itemRect.y < pageY && nextKey != null) {
        nextKey = this.getKeyBelow(nextKey);
        itemRect = nextKey == null ? null : this.layoutDelegate.getItemRect(nextKey);
      }
    }

    return nextKey ?? (reversed ? this.getFirstKey() : this.getLastKey());
  }

  getKeyForSearch(search: string, fromKey?: Key): Key | null {
    if (!this.collator) {
      return null;
    }

    const collection = this.collection;
    let key = fromKey ?? this.getFirstKey();
    while (key != null) {
      const item = collection.getItem(key);
      if (!item) {
        return null;
      }
      const substring = item.textValue.slice(0, search.length);
      if (item.textValue && this.collator.compare(substring, search) === 0) {
        return key;
      }

      key = this.getNextKey(key);
    }

    return null;
  }
}
