/**
 * Based on packages/react-aria/src/dnd/ListDropTargetDelegate.ts.
 */

import type { Accessor } from "solid-js";
import type { DropTarget } from "@proyecto-viviana/solid-stately";

type Direction = "ltr" | "rtl";
type Orientation = "horizontal" | "vertical";
type Layout = "stack" | "grid";

interface CollectionNodeLike {
  key: string | number;
  type?: string;
}

export interface ListDropTargetDelegateOptions {
  layout?: Layout;
  orientation?: Orientation;
  direction?: Direction;
}

const cssEscape = (value: string): string => {
  const css = (globalThis as { CSS?: { escape?: (input: string) => string } }).CSS;
  return css?.escape ? css.escape(value) : value.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
};

export class ListDropTargetDelegate {
  private collection: Iterable<CollectionNodeLike> | (() => Iterable<CollectionNodeLike>);
  private ref: Accessor<HTMLElement | null>;
  private layout: Layout;
  private orientation: Orientation;
  private direction: Direction;

  constructor(
    collection: Iterable<CollectionNodeLike> | (() => Iterable<CollectionNodeLike>),
    ref: Accessor<HTMLElement | null>,
    options?: ListDropTargetDelegateOptions,
  ) {
    this.collection = collection;
    this.ref = ref;
    this.layout = options?.layout ?? "stack";
    this.orientation = options?.orientation ?? "vertical";
    this.direction = options?.direction ?? "ltr";
  }

  private getCollection(): Iterable<CollectionNodeLike> {
    return typeof this.collection === "function"
      ? (this.collection as () => Iterable<CollectionNodeLike>)()
      : this.collection;
  }

  private getPrimaryStart(rect: DOMRect): number {
    return this.orientation === "horizontal" ? rect.left : rect.top;
  }

  private getPrimaryEnd(rect: DOMRect): number {
    return this.orientation === "horizontal" ? rect.right : rect.bottom;
  }

  private getSecondaryStart(rect: DOMRect): number {
    return this.orientation === "horizontal" ? rect.top : rect.left;
  }

  private getSecondaryEnd(rect: DOMRect): number {
    return this.orientation === "horizontal" ? rect.bottom : rect.right;
  }

  private getFlowStart(rect: DOMRect): number {
    return this.layout === "stack" ? this.getPrimaryStart(rect) : this.getSecondaryStart(rect);
  }

  private getFlowEnd(rect: DOMRect): number {
    return this.layout === "stack" ? this.getPrimaryEnd(rect) : this.getSecondaryEnd(rect);
  }

  private getFlowSize(rect: DOMRect): number {
    return this.getFlowEnd(rect) - this.getFlowStart(rect);
  }

  private getItemKeys(): Array<string | number> {
    return [...this.getCollection()].filter((item) => item.type === "item").map((item) => item.key);
  }

  private resolveBoundaryTarget(
    direction: "next" | "previous",
    isValidDropTarget: (target: DropTarget) => boolean,
  ): DropTarget | null {
    const keys = this.getItemKeys();
    if (keys.length === 0) return null;
    const key = direction === "next" ? keys[0] : keys[keys.length - 1];
    const order: Array<"before" | "on" | "after"> =
      direction === "next" ? ["before", "on", "after"] : ["after", "on", "before"];
    for (const dropPosition of order) {
      const target: DropTarget = { type: "item", key, dropPosition };
      if (isValidDropTarget(target)) return target;
    }
    return null;
  }

  private resolveTransitionTarget(
    target: DropTarget,
    direction: "next" | "previous",
    isValidDropTarget: (target: DropTarget) => boolean,
  ): DropTarget | null {
    if (target.type !== "item") return null;
    const tryPosition = (dropPosition: "before" | "on" | "after"): DropTarget | null => {
      if (target.dropPosition === dropPosition) return null;
      const nextTarget: DropTarget = {
        type: "item",
        key: target.key,
        dropPosition,
      };
      return isValidDropTarget(nextTarget) ? nextTarget : null;
    };

    if (direction === "next") {
      if (target.dropPosition === "before") {
        return tryPosition("on") ?? tryPosition("after");
      }
      if (target.dropPosition === "on") {
        return tryPosition("after");
      }
    } else {
      if (target.dropPosition === "after") {
        return tryPosition("on") ?? tryPosition("before");
      }
      if (target.dropPosition === "on") {
        return tryPosition("before");
      }
    }

    return null;
  }

  private resolveNeighborTarget(
    target: DropTarget,
    direction: "next" | "previous",
    isValidDropTarget: (target: DropTarget) => boolean,
  ): DropTarget | null {
    if (target.type !== "item") return null;
    const keys = this.getItemKeys();
    const index = keys.findIndex((key) => key === target.key);
    if (index < 0) return this.resolveBoundaryTarget(direction, isValidDropTarget);
    const nextIndex = direction === "next" ? index + 1 : index - 1;
    if (nextIndex < 0 || nextIndex >= keys.length) {
      const rootTarget: DropTarget = { type: "root" };
      return isValidDropTarget(rootTarget) ? rootTarget : null;
    }
    const key = keys[nextIndex];
    const order: Array<"on" | "before" | "after"> =
      direction === "next" ? ["on", "before", "after"] : ["on", "after", "before"];
    for (const dropPosition of order) {
      const nextTarget: DropTarget = { type: "item", key, dropPosition };
      if (isValidDropTarget(nextTarget)) return nextTarget;
    }
    return null;
  }

  getKeyboardNavigationTarget(
    target: DropTarget | null,
    direction: "next" | "previous",
    isValidDropTarget: (target: DropTarget) => boolean,
  ): DropTarget | null {
    if (!target || target.type === "root") {
      return this.resolveBoundaryTarget(direction, isValidDropTarget);
    }
    const transition = this.resolveTransitionTarget(target, direction, isValidDropTarget);
    if (transition) return transition;
    return this.resolveNeighborTarget(target, direction, isValidDropTarget);
  }

  getDropTargetFromPoint(
    x: number,
    y: number,
    isValidDropTarget: (target: DropTarget) => boolean,
  ): DropTarget {
    const root = this.ref();
    if (!root) {
      return { type: "root" };
    }

    const allItems = [...this.getCollection()].filter((item) => item.type === "item");
    if (allItems.length === 0) {
      return { type: "root" };
    }

    const collectionId = root.dataset.collection;
    const selector = collectionId ? `[data-collection="${cssEscape(collectionId)}"]` : "[data-key]";
    const elements = root.querySelectorAll(selector);
    const elementMap = new Map<string, HTMLElement>();
    for (const node of elements) {
      if (node instanceof HTMLElement && node.dataset.key != null) {
        elementMap.set(node.dataset.key, node);
      }
    }

    let low = 0;
    let high = allItems.length;
    const rootRect = root.getBoundingClientRect();
    let primary = this.orientation === "horizontal" ? x : y;
    let secondary = this.orientation === "horizontal" ? y : x;
    primary += this.getPrimaryStart(rootRect);
    secondary += this.getSecondaryStart(rootRect);

    const flow = this.layout === "stack" ? primary : secondary;
    const isPrimaryRtl = this.orientation === "horizontal" && this.direction === "rtl";
    const isSecondaryRtl =
      this.layout === "grid" && this.orientation === "vertical" && this.direction === "rtl";
    const isFlowRtl = this.layout === "stack" ? isPrimaryRtl : isSecondaryRtl;

    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      const item = allItems[mid];
      const element = elementMap.get(String(item.key));
      if (!element) break;
      const rect = element.getBoundingClientRect();
      const update = (isGreater: boolean) => {
        if (isGreater) {
          low = mid + 1;
        } else {
          high = mid;
        }
      };

      if (primary < this.getPrimaryStart(rect)) {
        update(isPrimaryRtl);
      } else if (primary > this.getPrimaryEnd(rect)) {
        update(!isPrimaryRtl);
      } else if (secondary < this.getSecondaryStart(rect)) {
        update(isSecondaryRtl);
      } else if (secondary > this.getSecondaryEnd(rect)) {
        update(!isSecondaryRtl);
      } else {
        const target: DropTarget = {
          type: "item",
          key: item.key,
          dropPosition: "on",
        };

        if (isValidDropTarget(target)) {
          if (
            flow <= this.getFlowStart(rect) + 5 &&
            isValidDropTarget({ ...target, dropPosition: "before" })
          ) {
            target.dropPosition = isFlowRtl ? "after" : "before";
          } else if (
            flow >= this.getFlowEnd(rect) - 5 &&
            isValidDropTarget({ ...target, dropPosition: "after" })
          ) {
            target.dropPosition = isFlowRtl ? "before" : "after";
          }
        } else {
          const midpoint = this.getFlowStart(rect) + this.getFlowSize(rect) / 2;
          if (flow <= midpoint && isValidDropTarget({ ...target, dropPosition: "before" })) {
            target.dropPosition = isFlowRtl ? "after" : "before";
          } else if (flow >= midpoint && isValidDropTarget({ ...target, dropPosition: "after" })) {
            target.dropPosition = isFlowRtl ? "before" : "after";
          }
        }

        return target;
      }
    }

    const item = allItems[Math.min(low, allItems.length - 1)];
    const element = elementMap.get(String(item.key));
    const rect = element?.getBoundingClientRect();
    if (
      rect &&
      (primary < this.getPrimaryStart(rect) ||
        Math.abs(flow - this.getFlowStart(rect)) < Math.abs(flow - this.getFlowEnd(rect)))
    ) {
      return {
        type: "item",
        key: item.key,
        dropPosition: isFlowRtl ? "after" : "before",
      };
    }

    return {
      type: "item",
      key: item.key,
      dropPosition: isFlowRtl ? "before" : "after",
    };
  }
}
