/**
 * createDroppableCollection - ARIA hook for droppable collection targets.
 *
 * Provides accessibility support for dropping items into a collection
 * component like ListBox, GridList, or Table.
 */

import { createMemo, onCleanup, type Accessor } from "solid-js";
import type { JSX } from "solid-js";
import type {
  DroppableCollectionState,
  DropTarget,
  DropOperation,
  DropItem,
  DragType,
  DragTypes,
  Key,
} from "@proyecto-viviana/solid-stately";
import { DIRECTORY_DRAG_TYPE } from "@proyecto-viviana/solid-stately";
import { createDrop } from "./createDrop";
import {
  getGlobalDraggingCollectionRef,
  getGlobalDraggingKeys,
  getGlobalDraggingTypes,
} from "./createDraggableCollection";
import { getGlobalAllowedDropOperations, DROP_OPERATION } from "./utils";

// Global state for tracking the drop collection
let globalDropCollectionRef: HTMLElement | null = null;

export function setGlobalDropCollectionRef(ref: HTMLElement | null): void {
  globalDropCollectionRef = ref;
}

export function getGlobalDropCollectionRef(): HTMLElement | null {
  return globalDropCollectionRef;
}

export interface DropTargetDelegate {
  /**
   * Returns a drop target from a point within the collection.
   */
  getDropTargetFromPoint(
    x: number,
    y: number,
    isValidDropTarget: (target: DropTarget) => boolean,
  ): DropTarget | null;
  /**
   * Returns the next keyboard-navigable drop target.
   */
  getKeyboardNavigationTarget?(
    target: DropTarget | null,
    direction: "next" | "previous",
    isValidDropTarget: (target: DropTarget) => boolean,
  ): DropTarget | null;
  /**
   * Returns the next page-navigable drop target.
   */
  getKeyboardPageNavigationTarget?(
    target: DropTarget | null,
    direction: "next" | "previous",
    isValidDropTarget: (target: DropTarget) => boolean,
  ): DropTarget | null;
}

export interface KeyboardDelegateLike {
  getFirstKey?: () => string | number | null;
  getLastKey?: () => string | number | null;
  getKeyBelow?: (key: string | number) => string | number | null;
  getKeyAbove?: (key: string | number) => string | number | null;
  getKeyRightOf?: (key: string | number) => string | number | null;
  getKeyLeftOf?: (key: string | number) => string | number | null;
  getKeyPageBelow?: (key: string | number) => string | number | null;
  getKeyPageAbove?: (key: string | number) => string | number | null;
}

interface CollectionNodeLike {
  type?: string;
  key: Key;
  parentKey?: Key | null;
  childNodes?: CollectionNodeLike[];
  isExpanded?: boolean;
}

interface CollectionLike {
  getItem(key: Key): CollectionNodeLike | null;
  [Symbol.iterator](): Iterator<CollectionNodeLike>;
}

export interface DroppableCollectionOptions {
  /** Reference to the collection element. */
  ref: Accessor<HTMLElement | null>;
  /** A delegate that provides drop targets for pointer coordinates. */
  dropTargetDelegate: DropTargetDelegate;
  /** Handler called when items are dropped to be inserted. */
  onInsert?: (e: { items: DropItem[]; target: DropTarget; dropOperation: DropOperation }) => void;
  /** Handler called when items are dropped on the root. */
  onRootDrop?: (e: { items: DropItem[]; dropOperation: DropOperation }) => void;
  /** Handler called when items are dropped on an item. */
  onItemDrop?: (e: {
    items: DropItem[];
    target: DropTarget;
    dropOperation: DropOperation;
    isInternal: boolean;
  }) => void;
  /** Handler called when items are reordered within the collection. */
  onReorder?: (e: {
    keys: Set<string | number>;
    target: DropTarget;
    dropOperation: DropOperation;
  }) => void;
  /** Handler called when items are moved within/between collections. */
  onMove?: (e: {
    keys: Set<string | number>;
    target: DropTarget;
    dropOperation: DropOperation;
  }) => void;
  /** Handler called when a drop occurs on any collection target. */
  onDrop?: (e: {
    items: DropItem[];
    target: DropTarget;
    dropOperation: DropOperation;
    x: number;
    y: number;
  }) => void;
  /** Handler called when the drop target is activated (held over). */
  onDropActivate?: (e: { target: DropTarget; x: number; y: number }) => void;
  /** Optional keyboard delegate used as fallback when drop-target delegates do not provide keyboard navigation methods. */
  keyboardDelegate?: KeyboardDelegateLike;
  /** Optional keyboard handler composed with internal drop target navigation keys. */
  onKeyDown?: (e: KeyboardEvent) => void;
  /** Collection snapshot used to restore focus and selection after a drop mutates items. */
  collection?: CollectionLike;
  /** Current collection selection used to avoid replacing user-updated selection after a drop. */
  selectedKeys?: "all" | Iterable<Key>;
  /** Sets collection selection after a drop when new rows were inserted and selection was unchanged. */
  setSelectedKeys?: (keys: Set<Key>) => void;
  /** Sets collection focus after a drop when new rows were inserted. */
  setFocusedKey?: (key: Key | null) => void;
  /** Whether the collection is disabled for dropping. */
  isDisabled?: boolean;
  /** Accepted drag types. 'all' accepts any type. */
  acceptedDragTypes?: "all" | Array<string | symbol>;
}

export function getDropItemTypes(item: DropItem): Set<string | symbol> {
  if (item.kind === "file") {
    return new Set([item.type]);
  }
  if (item.kind === "text") {
    return new Set(item.types);
  }
  return new Set([DIRECTORY_DRAG_TYPE]);
}

export interface DroppableCollectionAria {
  /** Props to spread on the collection element. */
  collectionProps: JSX.HTMLAttributes<HTMLElement>;
}

/**
 * Creates ARIA support for a droppable collection.
 *
 * @param options - Collection options accessor
 * @param state - Droppable collection state
 * @returns Droppable collection ARIA result
 */
export function createDroppableCollection(
  options: Accessor<DroppableCollectionOptions>,
  state: DroppableCollectionState,
): DroppableCollectionAria {
  const getOptions = createMemo(() => options());

  // Track the next target during drag operations
  let nextTarget: DropTarget | null = null;
  let currentDropOperation: DropOperation | null = null;

  const isInternalDropOperation = (): boolean => {
    const ref = getOptions().ref();
    const draggingRef = getGlobalDraggingCollectionRef();
    return ref !== null && draggingRef === ref;
  };

  const getDropOperationForTarget = (
    target: DropTarget,
    types: DragTypes,
    allowedOperations: DropOperation[],
  ): DropOperation => {
    return state.getDropOperation(target, types, allowedOperations);
  };

  // Create base drop behavior
  const drop = createDrop(() => ({
    isDisabled: getOptions().isDisabled,
    getDropOperationForPoint: (types, allowedOperations, x, y) => {
      const opts = getOptions();
      const isValidDropTarget = (target: DropTarget) =>
        getDropOperationForTarget(target, types, allowedOperations) !== "cancel";

      const target = opts.dropTargetDelegate.getDropTargetFromPoint(x, y, isValidDropTarget);

      if (!target) {
        currentDropOperation = "cancel";
        nextTarget = null;
        return "cancel";
      }

      currentDropOperation = getDropOperationForTarget(target, types, allowedOperations);

      // If target doesn't accept, try root
      if (currentDropOperation === "cancel") {
        const rootTarget: DropTarget = { type: "root" };
        const rootOp = getDropOperationForTarget(rootTarget, types, allowedOperations);
        if (rootOp !== "cancel") {
          nextTarget = rootTarget;
          currentDropOperation = rootOp;
          return currentDropOperation;
        }
      }

      // Update drop collection ref
      const ref = opts.ref();
      if (target && currentDropOperation !== "cancel" && ref !== globalDropCollectionRef) {
        setGlobalDropCollectionRef(ref);
      }

      nextTarget = currentDropOperation === "cancel" ? null : target;
      return currentDropOperation;
    },
    onDropEnter: () => {
      if (nextTarget) {
        state.setTarget(nextTarget);
      }
    },
    onDropMove: () => {
      if (nextTarget) {
        state.setTarget(nextTarget);
      }
    },
    onDropExit: () => {
      setGlobalDropCollectionRef(null);
      state.setTarget(null);
    },
    onDropActivate: (e) => {
      const opts = getOptions();
      if (
        state.target?.type === "item" &&
        state.target.dropPosition === "on" &&
        typeof opts.onDropActivate === "function"
      ) {
        opts.onDropActivate({
          target: state.target,
          x: e.x,
          y: e.y,
        });
      }
    },
    onDrop: (e) => {
      const opts = getOptions();
      setGlobalDropCollectionRef(opts.ref());

      if (state.target) {
        const target = state.target;
        const previousCollection = opts.collection;
        const previousSelectedKeys = normalizeSelection(opts.selectedKeys);
        opts.onDrop?.({
          items: e.items,
          target,
          dropOperation: e.dropOperation,
          x: e.x,
          y: e.y,
        });
        void Promise.resolve(handleDrop(e.items, target, e.dropOperation)).then(() => {
          queueMicrotask(() => {
            updateFocusAfterDrop(getOptions(), previousCollection, previousSelectedKeys, target);
          });
        });
      }
    },
  }));

  const handleDrop = async (
    items: DropItem[],
    target: DropTarget,
    dropOperation: DropOperation,
  ) => {
    const opts = getOptions();
    const isInternal = isInternalDropOperation();

    // Filter items by accepted types
    let filteredItems = items;
    const acceptedTypes = opts.acceptedDragTypes;
    if (acceptedTypes && acceptedTypes !== "all") {
      filteredItems = items.filter((item) => {
        const itemTypes = getDropItemTypes(item);
        return acceptedTypes.some((type) => itemTypes.has(type));
      });
    }

    if (filteredItems.length === 0) return;

    // Call appropriate handlers based on target type
    if (target.type === "root" && opts.onRootDrop) {
      await opts.onRootDrop({ items: filteredItems, dropOperation });
    }

    if (target.type === "item") {
      if (target.dropPosition === "on" && opts.onItemDrop) {
        await opts.onItemDrop({
          items: filteredItems,
          target,
          dropOperation,
          isInternal,
        });
      }

      // Handle move for internal operations
      if (opts.onMove && isInternal) {
        const draggingKeys = getGlobalDraggingKeys();
        await opts.onMove({
          keys: draggingKeys,
          target,
          dropOperation,
        });
      }

      if (target.dropPosition !== "on") {
        if (!isInternal && opts.onInsert) {
          await opts.onInsert({
            items: filteredItems,
            target,
            dropOperation,
          });
        }

        if (isInternal && opts.onReorder) {
          const draggingKeys = getGlobalDraggingKeys();
          await opts.onReorder({
            keys: draggingKeys,
            target,
            dropOperation,
          });
        }
      }
    }
  };

  // Clean up on unmount
  onCleanup(() => {
    const ref = getOptions().ref();
    if (globalDropCollectionRef === ref) {
      setGlobalDropCollectionRef(null);
    }
  });

  const collectionProps = createMemo(() => {
    const baseDropProps = drop.dropProps;
    const onKeyDownBase = baseDropProps.onKeyDown as ((e: KeyboardEvent) => void) | undefined;
    const onKeyDown = (e: KeyboardEvent): void => {
      onKeyDownBase?.(e);
      const opts = getOptions();
      if (opts.isDisabled) return;
      const resolveDirection = (): "ltr" | "rtl" => {
        const refEl = opts.ref();
        if (
          refEl &&
          typeof window !== "undefined" &&
          typeof window.getComputedStyle === "function"
        ) {
          const computedDir = window.getComputedStyle(refEl).direction;
          if (computedDir === "rtl") return "rtl";
        }
        return typeof document !== "undefined" && document.dir === "rtl" ? "rtl" : "ltr";
      };
      const isRtl = resolveDirection() === "rtl";
      const forwardHorizontalKey = isRtl ? "ArrowLeft" : "ArrowRight";
      const backwardHorizontalKey = isRtl ? "ArrowRight" : "ArrowLeft";
      const callUserOnKeyDown = () => opts.onKeyDown?.(e);
      const getKeyboardAllowedOperations = (): DropOperation[] => {
        const allowedBits = getGlobalAllowedDropOperations();
        if (!allowedBits) return ["copy", "move", "link"];
        const allowed: DropOperation[] = [];
        if (allowedBits & DROP_OPERATION.copy) allowed.push("copy");
        if (allowedBits & DROP_OPERATION.move) allowed.push("move");
        if (allowedBits & DROP_OPERATION.link) allowed.push("link");
        return allowed.length > 0 ? allowed : ["copy", "move", "link"];
      };
      const getKeyboardDragTypes = (): DragTypes => {
        const draggingTypes = getGlobalDraggingTypes();
        if (draggingTypes.size === 0) {
          return { has: () => true };
        }
        return {
          // Keyboard drag mirrors upstream's raw Set<string> delegate: no
          // wildcard expansion (that lives in the DataTransfer-backed DragTypes).
          has: (type: DragType | DragType[]) => typeof type === "string" && draggingTypes.has(type),
        };
      };
      const isValidDropTarget = (target: DropTarget) =>
        state.getDropOperation(target, getKeyboardDragTypes(), getKeyboardAllowedOperations()) !==
        "cancel";
      const targetsEqual = (a: DropTarget, b: DropTarget): boolean => {
        if (a.type !== b.type) return false;
        if (a.type === "root" && b.type === "root") return true;
        if (a.type !== "item" || b.type !== "item") return false;
        return a.key === b.key && a.dropPosition === b.dropPosition;
      };
      const findNextValidTarget = (
        start: DropTarget | null,
        getNext: (target: DropTarget | null) => DropTarget | null,
      ): DropTarget | null => {
        let current = start;
        let seenRoot = 0;
        let safety = 0;
        while (safety < 256) {
          safety += 1;
          const next = getNext(current);
          if (!next) return null;
          if (current && targetsEqual(current, next)) {
            return isValidDropTarget(next) ? next : null;
          }
          current = next;
          if (next.type === "root") {
            seenRoot += 1;
            if (seenRoot >= 2) {
              return isValidDropTarget(next) ? next : null;
            }
          }
          if (isValidDropTarget(next)) return next;
        }
        return null;
      };
      const resolveTargetForKey = (
        key: string | number | null,
        direction: "next" | "previous",
      ): DropTarget | null => {
        if (key == null) return null;
        const onTarget: DropTarget = { type: "item", key, dropPosition: "on" };
        if (isValidDropTarget(onTarget)) return onTarget;
        const insertionOrder: Array<"before" | "after"> =
          direction === "next" ? ["before", "after"] : ["after", "before"];
        for (const position of insertionOrder) {
          const insertionTarget: DropTarget = { type: "item", key, dropPosition: position };
          if (isValidDropTarget(insertionTarget)) return insertionTarget;
        }
        return null;
      };
      const resolveBoundaryTargetForDirection = (
        key: string | number | null,
        direction: "next" | "previous",
      ): DropTarget | null => {
        if (key == null) return null;
        const boundaryOrder: Array<"before" | "on" | "after"> =
          direction === "next" ? ["before", "on", "after"] : ["after", "on", "before"];
        for (const position of boundaryOrder) {
          const candidate: DropTarget = { type: "item", key, dropPosition: position };
          if (isValidDropTarget(candidate)) return candidate;
        }
        return null;
      };
      const resolveFallbackKeyboardTarget = (
        keyName: string,
        currentTarget: DropTarget | null = state.target,
      ): DropTarget | null => {
        const keyboardDelegate = opts.keyboardDelegate;
        if (!keyboardDelegate) return null;
        const currentKey = currentTarget?.type === "item" ? currentTarget.key : null;
        const keyForDirection = (
          direction: "next" | "previous",
          getter: ((key: string | number) => string | number | null) | undefined,
        ): DropTarget | null => {
          if (currentKey == null) {
            const boundaryKey =
              direction === "next"
                ? keyboardDelegate.getFirstKey?.()
                : keyboardDelegate.getLastKey?.();
            return resolveBoundaryTargetForDirection(boundaryKey ?? null, direction);
          }
          if (!getter) return null;
          let nextKey = getter(currentKey);
          let safety = 0;
          while (nextKey != null && safety < 256) {
            const resolvedTarget = resolveTargetForKey(nextKey, direction);
            if (resolvedTarget) return resolvedTarget;
            const candidate = getter(nextKey);
            if (candidate === nextKey) break;
            nextKey = candidate;
            safety += 1;
          }
          return null;
        };

        if (keyName === "ArrowDown") return keyForDirection("next", keyboardDelegate.getKeyBelow);
        if (keyName === "ArrowUp") return keyForDirection("previous", keyboardDelegate.getKeyAbove);
        if (keyName === forwardHorizontalKey) {
          return keyForDirection(
            "next",
            isRtl ? keyboardDelegate.getKeyLeftOf : keyboardDelegate.getKeyRightOf,
          );
        }
        if (keyName === backwardHorizontalKey) {
          return keyForDirection(
            "previous",
            isRtl ? keyboardDelegate.getKeyRightOf : keyboardDelegate.getKeyLeftOf,
          );
        }
        if (keyName === "Home")
          return resolveBoundaryTargetForDirection(
            keyboardDelegate.getFirstKey?.() ?? null,
            "next",
          );
        if (keyName === "End")
          return resolveBoundaryTargetForDirection(
            keyboardDelegate.getLastKey?.() ?? null,
            "previous",
          );
        if (keyName === "PageDown") {
          if (currentKey != null && keyboardDelegate.getKeyPageBelow) {
            return resolveTargetForKey(keyboardDelegate.getKeyPageBelow(currentKey), "next");
          }
          return keyForDirection("next", keyboardDelegate.getKeyBelow);
        }
        if (keyName === "PageUp") {
          if (currentKey != null && keyboardDelegate.getKeyPageAbove) {
            return resolveTargetForKey(keyboardDelegate.getKeyPageAbove(currentKey), "previous");
          }
          return keyForDirection("previous", keyboardDelegate.getKeyAbove);
        }
        return null;
      };
      const resolvePageTargetForState = (
        direction: "next" | "previous",
        currentTarget: DropTarget,
      ): DropTarget | null => {
        const keyboardDelegate = opts.keyboardDelegate;
        if (!keyboardDelegate) return null;
        if (direction === "next") {
          let targetKey = keyboardDelegate.getFirstKey?.() ?? null;
          let dropPosition: "before" | "on" | "after" = "after";
          if (currentTarget.type === "item") {
            targetKey = currentTarget.key;
            dropPosition = currentTarget.dropPosition;
          }
          let nextKey =
            targetKey != null ? (keyboardDelegate.getKeyPageBelow?.(targetKey) ?? null) : null;
          if (
            nextKey == null ||
            (currentTarget.type === "item" && currentTarget.key === keyboardDelegate.getLastKey?.())
          ) {
            nextKey = keyboardDelegate.getLastKey?.() ?? null;
            dropPosition = "after";
          }
          if (nextKey == null) return null;
          return {
            type: "item",
            key: nextKey,
            dropPosition,
          };
        }

        if (currentTarget.type === "item") {
          if (currentTarget.key === keyboardDelegate.getFirstKey?.()) {
            return { type: "root" };
          }
          let nextKey = keyboardDelegate.getKeyPageAbove?.(currentTarget.key) ?? null;
          let dropPosition: "before" | "on" | "after" = currentTarget.dropPosition;
          if (nextKey == null) {
            nextKey = keyboardDelegate.getFirstKey?.() ?? null;
            dropPosition = "before";
          }
          if (nextKey == null) return null;
          return {
            type: "item",
            key: nextKey,
            dropPosition,
          };
        }

        return currentTarget.type === "root" ? currentTarget : null;
      };
      if (e.key === "PageDown" || e.key === "PageUp") {
        if (
          (e.key === "PageDown" && !opts.keyboardDelegate?.getKeyPageBelow) ||
          (e.key === "PageUp" && !opts.keyboardDelegate?.getKeyPageAbove)
        ) {
          callUserOnKeyDown();
          return;
        }
        const direction = e.key === "PageDown" ? "next" : "previous";
        const pageNavigation = opts.dropTargetDelegate.getKeyboardPageNavigationTarget;
        const stepNavigation = opts.dropTargetDelegate.getKeyboardNavigationTarget;
        const resolveStepTarget = (
          target: DropTarget | null,
          navDirection: "next" | "previous",
        ): DropTarget | null =>
          stepNavigation?.(target, navDirection, isValidDropTarget) ??
          resolveFallbackKeyboardTarget(
            navDirection === "next" ? "ArrowDown" : "ArrowUp",
            target,
          ) ??
          resolveFallbackKeyboardTarget(navDirection === "next" ? "Home" : "End", target) ??
          null;
        let nextTarget: DropTarget | null = null;
        if (!state.target) {
          nextTarget = findNextValidTarget(null, (target) => resolveStepTarget(target, direction));
        } else {
          const pageTarget =
            pageNavigation?.(state.target, direction, isValidDropTarget) ??
            resolvePageTargetForState(direction, state.target) ??
            null;
          if (pageTarget && isValidDropTarget(pageTarget)) {
            nextTarget = pageTarget;
          } else {
            const startTarget = pageTarget ?? state.target;
            nextTarget =
              findNextValidTarget(startTarget, (target) => resolveStepTarget(target, direction)) ??
              findNextValidTarget(startTarget, (target) =>
                resolveStepTarget(target, direction === "next" ? "previous" : "next"),
              );
          }
        }
        if (nextTarget) {
          e.preventDefault();
          state.setTarget(nextTarget);
        }
        callUserOnKeyDown();
        return;
      }
      if (
        (e.key === "ArrowDown" ||
          e.key === "ArrowUp" ||
          e.key === "ArrowRight" ||
          e.key === "ArrowLeft" ||
          e.key === "Home" ||
          e.key === "End") &&
        opts.dropTargetDelegate.getKeyboardNavigationTarget
      ) {
        if (
          (e.key === "ArrowDown" && !opts.keyboardDelegate?.getKeyBelow) ||
          (e.key === "ArrowUp" && !opts.keyboardDelegate?.getKeyAbove) ||
          (e.key === "ArrowLeft" && !opts.keyboardDelegate?.getKeyLeftOf) ||
          (e.key === "ArrowRight" && !opts.keyboardDelegate?.getKeyRightOf) ||
          (e.key === "Home" && !opts.keyboardDelegate?.getFirstKey) ||
          (e.key === "End" && !opts.keyboardDelegate?.getLastKey)
        ) {
          callUserOnKeyDown();
          return;
        }
        const isForwardKey =
          e.key === "ArrowDown" || e.key === forwardHorizontalKey || e.key === "Home";
        const direction = isForwardKey ? "next" : "previous";
        const navigationStart = e.key === "Home" || e.key === "End" ? null : state.target;
        const nextTarget = findNextValidTarget(
          navigationStart,
          (target) =>
            opts.dropTargetDelegate.getKeyboardNavigationTarget?.(
              target,
              direction,
              isValidDropTarget,
            ) ?? resolveFallbackKeyboardTarget(e.key, target),
        );
        if (nextTarget) {
          e.preventDefault();
          state.setTarget(nextTarget);
        }
        callUserOnKeyDown();
        return;
      }
      if (
        e.key === "ArrowDown" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowRight" ||
        e.key === "ArrowLeft" ||
        e.key === "Home" ||
        e.key === "End"
      ) {
        if (
          (e.key === "ArrowDown" && !opts.keyboardDelegate?.getKeyBelow) ||
          (e.key === "ArrowUp" && !opts.keyboardDelegate?.getKeyAbove) ||
          (e.key === "ArrowLeft" && !opts.keyboardDelegate?.getKeyLeftOf) ||
          (e.key === "ArrowRight" && !opts.keyboardDelegate?.getKeyRightOf) ||
          (e.key === "Home" && !opts.keyboardDelegate?.getFirstKey) ||
          (e.key === "End" && !opts.keyboardDelegate?.getLastKey)
        ) {
          callUserOnKeyDown();
          return;
        }
        const navigationStart = e.key === "Home" || e.key === "End" ? null : state.target;
        const nextTarget = findNextValidTarget(navigationStart, (target) =>
          resolveFallbackKeyboardTarget(e.key, target),
        );
        if (nextTarget) {
          e.preventDefault();
          state.setTarget(nextTarget);
        }
        callUserOnKeyDown();
        return;
      }
      if (e.key === "Enter" && state.target) {
        e.preventDefault();
        state.activateTarget(0, 0);
        callUserOnKeyDown();
        return;
      }
      if (e.key === "Escape" && state.target) {
        e.preventDefault();
        state.exitTarget(0, 0);
        callUserOnKeyDown();
        return;
      }
      callUserOnKeyDown();
    };
    return {
      ...baseDropProps,
      onKeyDown,
    };
  });

  return {
    get collectionProps() {
      return collectionProps() as DroppableCollectionAria["collectionProps"];
    },
  };
}

function normalizeSelection(selection: "all" | Iterable<Key> | undefined): "all" | Set<Key> | null {
  if (selection == null) return null;
  if (selection === "all") return "all";
  return new Set(selection);
}

function selectionEquals(a: "all" | Set<Key> | null, b: "all" | Set<Key> | null): boolean {
  if (a === b) return true;
  if (!a || !b || a === "all" || b === "all") return false;
  if (a.size !== b.size) return false;
  for (const key of a) {
    if (!b.has(key)) return false;
  }
  return true;
}

function getNewItemKeys(collection: CollectionLike, previousCollection: CollectionLike): Set<Key> {
  const keys = new Set<Key>();
  const visit = (node: CollectionNodeLike) => {
    if (node.type === "item" && !previousCollection.getItem(node.key)) {
      keys.add(node.key);
    }
    for (const child of node.childNodes ?? []) {
      visit(child);
    }
  };

  for (const node of collection) {
    visit(node);
  }
  return keys;
}

function updateFocusAfterDrop(
  opts: DroppableCollectionOptions,
  previousCollection: CollectionLike | undefined,
  previousSelectedKeys: "all" | Set<Key> | null,
  target: DropTarget,
): void {
  const collection = opts.collection;
  if (!collection || !previousCollection) return;

  const newKeys = getNewItemKeys(collection, previousCollection);
  if (newKeys.size === 0) return;

  const currentSelectedKeys = normalizeSelection(opts.selectedKeys);
  if (
    opts.setSelectedKeys &&
    previousSelectedKeys &&
    selectionEquals(previousSelectedKeys, currentSelectedKeys)
  ) {
    opts.setSelectedKeys(newKeys);
  }

  const first = newKeys.values().next().value;
  if (first == null) return;

  let focusKey: Key | null = first;
  const item = collection.getItem(first);
  const parent = item?.parentKey != null ? collection.getItem(item.parentKey) : null;
  const isDroppedOnCollapsedParent =
    target.type === "item" &&
    target.dropPosition === "on" &&
    item?.parentKey != null &&
    parent?.isExpanded !== true;

  if (item && (item.type === "cell" || item.type === "rowheader" || isDroppedOnCollapsedParent)) {
    focusKey = item.parentKey ?? first;
  }

  opts.setFocusedKey?.(focusKey);

  queueMicrotask(() => {
    const row = opts.ref()?.querySelector<HTMLElement>('[role="row"][tabindex="0"]');
    row?.focus();
  });
}
