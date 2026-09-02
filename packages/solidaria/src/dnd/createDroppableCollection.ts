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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/dnd/useDroppableCollection.ts

/**
 * createDroppableCollection - ARIA hook for droppable collection targets.
 *
 * Provides accessibility support for dropping items into a collection
 * component like ListBox, GridList, or Table.
 *
 * Ported from packages/react-aria/src/dnd/useDroppableCollection.ts.
 */

import { createEffect, createMemo, onCleanup, untrack, type Accessor } from "solid-js";
import type { JSX } from "solid-js";
import type {
  Collection,
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
import { getGlobalDraggingCollectionRef, getGlobalDraggingKeys } from "./createDraggableCollection";
import { getTypes } from "./utils";
import { registerDropTarget } from "./DragManager";
import { navigate, type DropNavigationKeyboardDelegate } from "./DropTargetKeyboardNavigation";
import { useLocale } from "../i18n/locale";

// Global state for tracking the drop collection
let globalDropCollectionRef: HTMLElement | null = null;

export function setGlobalDropCollectionRef(ref: HTMLElement | null): void {
  globalDropCollectionRef = ref;
}

export function getGlobalDropCollectionRef(): HTMLElement | null {
  return globalDropCollectionRef;
}

// RAC `utils.ts:28-54` `droppableCollectionMap` — keyed by droppable state so
// `useDroppableItem` can pass THIS collection's ref into `isInternalDropOperation`
// even before `onDropEnter` writes the global drop-collection ref.
const droppableCollectionMap = new WeakMap<
  DroppableCollectionState,
  Accessor<HTMLElement | null>
>();

/** RAC `utils.ts:46-54` `getDroppableCollectionRef`. */
export function getDroppableCollectionRef(
  state: DroppableCollectionState,
): Accessor<HTMLElement | null> | undefined {
  return droppableCollectionMap.get(state);
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
  /**
   * The collection backing the droppable. Used both to restore focus/selection
   * after a drop mutates items and to drive keyboard drop-target navigation
   * (`navigate()` walks `getKeyAfter`/`getKeyBefore`).
   */
  collection?: Collection;
  /** Current collection selection used to avoid replacing user-updated selection after a drop. */
  selectedKeys?: "all" | Iterable<Key>;
  /** Sets collection selection after a drop when new rows were inserted and selection was unchanged. */
  setSelectedKeys?: (keys: Set<Key>) => void;
  /** Sets collection focus after a drop when new rows were inserted. */
  setFocusedKey?: (key: Key | null) => void;
  /** Restores the collection's focused state after a drop. */
  setFocused?: (isFocused: boolean) => void;
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
  droppableCollectionMap.set(state, () => getOptions().ref());

  // Layout direction drives keyboard drop-target navigation (Left/Right flip in
  // RTL). Read at the reactive owner so the registration effect re-runs on change.
  const locale = useLocale();

  // Track the next target during drag operations
  let nextTarget: DropTarget | null = null;
  let currentDropOperation: DropOperation | null = null;
  let focusAfterDropTimeout: ReturnType<typeof setTimeout> | undefined;

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
    return state.getDropOperation(
      target,
      types,
      allowedOperations,
      isInternalDropOperation(),
      getGlobalDraggingKeys(),
    );
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
      setGlobalDropCollectionRef(getOptions().ref());
      if (state.target) {
        runDrop(e, state.target);
      }
    },
  }));

  // Shared drop handler for both the native-pointer path (createDrop, above) and
  // the keyboard path (the DragManager-registered drop target, below). Mirrors
  // upstream's `defaultOnDrop`, which `useDrop` and `DragManager` both invoke.
  const runDrop = (
    e: { items: DropItem[]; dropOperation: DropOperation; x: number; y: number },
    target: DropTarget,
  ) => {
    const opts = getOptions();
    const previousCollection = opts.collection;
    const previousSelectedKeys = normalizeSelection(opts.selectedKeys);
    opts.onDrop?.({
      items: e.items,
      target,
      dropOperation: e.dropOperation,
      x: e.x,
      y: e.y,
    });
    void handleDrop(e.items, target, e.dropOperation);

    // Match upstream's fallback delay. Drag teardown can move focus out of the
    // collection after the drop handler returns, so a microtask is too early.
    // The delay also gives asynchronous collection updates time to render.
    clearTimeout(focusAfterDropTimeout);
    focusAfterDropTimeout = setTimeout(() => {
      updateFocusAfterDrop(getOptions(), previousCollection, previousSelectedKeys, target);
      focusAfterDropTimeout = undefined;
    }, 50);
  };

  const handleDrop = async (
    items: DropItem[],
    target: DropTarget,
    dropOperation: DropOperation,
  ) => {
    const opts = getOptions();
    const isInternal = isInternalDropOperation();
    // Capture the dragging keys ONCE up front, mirroring upstream's
    // `let {draggingKeys} = globalDndState` at the top of `defaultOnDrop`. In
    // Solid the global keys live in a signal whose drag-teardown effect flushes
    // synchronously during this same drop flow (React batches, so upstream never
    // observes the clear mid-handler). Re-reading the global in the onMove/onReorder
    // branches would therefore see an already-emptied set; the snapshot preserves it.
    const draggingKeys = getGlobalDraggingKeys();

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
    clearTimeout(focusAfterDropTimeout);
    const ref = getOptions().ref();
    if (globalDropCollectionRef === ref) {
      setGlobalDropCollectionRef(null);
    }
  });

  // Wrap the raw `Set<string>` the DragManager hands keyboard drop targets into
  // the `DragTypes` delegate the port state expects. Mirrors upstream, which
  // passes the raw Set to `state.getDropOperation` (no wildcard expansion — that
  // lives in the DataTransfer-backed DragTypes used by the native-pointer path).
  const wrapTypes = (types: Set<string>): DragTypes => ({
    has: (type: DragType | DragType[]) => {
      if (typeof type === "string") return types.has(type);
      if (Array.isArray(type)) return type.some((t) => typeof t === "string" && types.has(t));
      return false;
    },
  });

  const targetsEqual = (
    a: DropTarget | null | undefined,
    b: DropTarget | null | undefined,
  ): boolean => {
    if (!a || !b) return false;
    if (a.type !== b.type) return false;
    if (a.type === "root") return true;
    if (a.type !== "item" || b.type !== "item") return false;
    return a.key === b.key && a.dropPosition === b.dropPosition;
  };

  // Port substitute for upstream's `state.isDropTarget(target)` (the port state
  // exposes `isDropTarget` only as a "drag is over this collection" boolean, not
  // a per-target predicate): whether `target` equals the current drop target.
  const isCurrentTarget = (target: DropTarget | null | undefined): boolean =>
    targetsEqual(state.target, target);

  // Register the collection element as a keyboard/virtual drop target on the
  // DragManager singleton. This is the faithful port of upstream
  // `useDroppableCollection`'s `useEffect` (react-aria 3.50) that installs the
  // DragManager DropTarget — replacing the port's former self-contained
  // `collectionProps.onKeyDown` engine. Re-runs when the element or locale
  // direction changes (upstream keys the effect on `[localState, ref, onDrop, direction]`).
  createEffect(() => {
    // Track only the scroller element and writing direction. Calling
    // `getOptions()` here would also subscribe to `collection` / `selectedKeys`
    // (ListBox getters), re-register a *new* DropTarget object mid-drag, and
    // `validDropTargets.includes(currentDropTarget)` would fail — focusing the
    // collection (`listbox:Permissions`) instead of the drop indicator.
    // RAC `useDroppableCollection.ts` effect deps: `[localState, ref, onDrop, direction]`.
    const refFn = untrack(() => getOptions().ref);
    const refEl = refFn();
    if (!refEl) return;
    const rtl = locale().direction === "rtl";

    const getNextTarget = (
      target: DropTarget | null | undefined,
      wrap = true,
      key: "left" | "right" | "up" | "down" = "down",
    ): DropTarget | null => {
      const opts = getOptions();
      const collection = opts.collection;
      const keyboardDelegate = opts.keyboardDelegate;
      if (!collection || !keyboardDelegate) return null;
      return navigate(
        keyboardDelegate as DropNavigationKeyboardDelegate,
        collection,
        target,
        key,
        rtl,
        wrap,
      );
    };

    const getPreviousTarget = (target: DropTarget | null | undefined, wrap = true) =>
      getNextTarget(target, wrap, "up");

    const nextValidTarget = (
      target: DropTarget | null | undefined,
      types: Set<string>,
      allowedDropOperations: DropOperation[],
      getNext: (target: DropTarget | null | undefined, wrap: boolean) => DropTarget | null,
      wrap = true,
    ): DropTarget | null => {
      let seenRoot = 0;
      let operation: DropOperation;
      do {
        const next = getNext(target, wrap);
        if (!next) return null;
        target = next;
        operation = getDropOperationForTarget(next, wrapTypes(types), allowedDropOperations);
        if (target.type === "root") {
          seenRoot++;
        }
      } while (operation === "cancel" && !isCurrentTarget(target) && seenRoot < 2);

      if (operation === "cancel") {
        return null;
      }

      return target;
    };

    const unregister = registerDropTarget({
      element: refEl,
      preventFocusOnDrop: true,
      getDropOperation(types, allowedOperations) {
        if (state.target) {
          return getDropOperationForTarget(state.target, wrapTypes(types), allowedOperations);
        }

        // Check if any of the targets accept the drop.
        const target = nextValidTarget(null, types, allowedOperations, (t, wrap) =>
          getNextTarget(t, wrap),
        );
        return target ? "move" : "cancel";
      },
      onDropEnter(_e, drag) {
        const types = getTypes(drag.items);
        // Update the drop collection ref tracker for createDroppableItem's isInternal check.
        setGlobalDropCollectionRef(getOptions().ref());

        // When entering the droppable collection for the first time, upstream's
        // default drop target is AFTER the focused key
        // (useDroppableCollection.ts:505-559). The port's DroppableCollectionState
        // carries no selectionManager, but at keyboard pickup the dragged item IS
        // the collection's focused item, so we recover the focused key from the
        // drag target element's `data-key` (createSelectableItem stamps it).
        const opts = getOptions();
        let key = keyFromDragElement(drag.element, opts.collection);
        let dropPosition: "before" | "on" | "after" = "after";

        // Mirror upstream's reorder heuristic: if the focused item is also
        // selected, drop after the last selected item; but if it is the first of
        // a multi-selection, drop before the first (select-down → move down,
        // select-up → move up). Single-key keyboard drags never hit this branch.
        const selected = normalizeSelection(opts.selectedKeys);
        if (key != null && opts.collection && selectionHas(selected, key)) {
          const ordered = orderedSelectedKeys(selected, opts.collection);
          if (ordered.length > 1 && ordered[0] === key) {
            dropPosition = "before";
          } else if (ordered.length > 0) {
            key = ordered[ordered.length - 1];
          }
        }

        let target: DropTarget | null = null;
        if (key != null) {
          target = { type: "item", key, dropPosition };
          // If the default target is not valid, find the next one that is, then
          // fall back to the previous. Mirrors useDroppableCollection.ts:538-551.
          if (
            getDropOperationForTarget(target, wrapTypes(types), drag.allowedDropOperations) ===
            "cancel"
          ) {
            target =
              nextValidTarget(
                target,
                types,
                drag.allowedDropOperations,
                (t, wrap) => getNextTarget(t, wrap),
                false,
              ) ??
              nextValidTarget(target, types, drag.allowedDropOperations, getPreviousTarget, false);
          }
        }

        // If no focused key, start from the root (upstream's fallback).
        if (!target) {
          target = nextValidTarget(null, types, drag.allowedDropOperations, (t, wrap) =>
            getNextTarget(t, wrap),
          );
        }

        state.setTarget(target);
      },
      onDropExit() {
        setGlobalDropCollectionRef(null);
        state.setTarget(null);
      },
      onDropTargetEnter(target) {
        state.setTarget(target);
      },
      onDropActivate(e, target) {
        const opts = getOptions();
        if (
          target?.type === "item" &&
          target?.dropPosition === "on" &&
          typeof opts.onDropActivate === "function"
        ) {
          opts.onDropActivate({ target, x: e.x, y: e.y });
        }
      },
      onDrop(e, target) {
        setGlobalDropCollectionRef(getOptions().ref());
        if (state.target) {
          runDrop(e, target || state.target);
        }
      },
      onKeyDown(e, drag) {
        const opts = getOptions();
        const keyboardDelegate = opts.keyboardDelegate;
        if (!keyboardDelegate) {
          opts.onKeyDown?.(e);
          return;
        }
        const types = getTypes(drag.items);
        switch (e.key) {
          case "ArrowDown": {
            if (keyboardDelegate.getKeyBelow) {
              const target = nextValidTarget(
                state.target,
                types,
                drag.allowedDropOperations,
                (t, wrap) => getNextTarget(t, wrap, "down"),
              );
              state.setTarget(target);
            }
            break;
          }
          case "ArrowUp": {
            if (keyboardDelegate.getKeyAbove) {
              const target = nextValidTarget(
                state.target,
                types,
                drag.allowedDropOperations,
                (t, wrap) => getNextTarget(t, wrap, "up"),
              );
              state.setTarget(target);
            }
            break;
          }
          case "ArrowLeft": {
            if (keyboardDelegate.getKeyLeftOf) {
              const target = nextValidTarget(
                state.target,
                types,
                drag.allowedDropOperations,
                (t, wrap) => getNextTarget(t, wrap, "left"),
              );
              state.setTarget(target);
            }
            break;
          }
          case "ArrowRight": {
            if (keyboardDelegate.getKeyRightOf) {
              const target = nextValidTarget(
                state.target,
                types,
                drag.allowedDropOperations,
                (t, wrap) => getNextTarget(t, wrap, "right"),
              );
              state.setTarget(target);
            }
            break;
          }
          case "Home": {
            if (keyboardDelegate.getFirstKey) {
              const target = nextValidTarget(null, types, drag.allowedDropOperations, (t, wrap) =>
                getNextTarget(t, wrap),
              );
              state.setTarget(target);
            }
            break;
          }
          case "End": {
            if (keyboardDelegate.getLastKey) {
              const target = nextValidTarget(
                null,
                types,
                drag.allowedDropOperations,
                getPreviousTarget,
              );
              state.setTarget(target);
            }
            break;
          }
          case "PageDown": {
            if (keyboardDelegate.getKeyPageBelow) {
              let target = state.target;
              if (!target) {
                target = nextValidTarget(null, types, drag.allowedDropOperations, (t, wrap) =>
                  getNextTarget(t, wrap),
                );
              } else {
                // If on the root, go to the item a page below the top. Otherwise a page below the current item.
                let targetKey = keyboardDelegate.getFirstKey?.();
                if (target.type === "item") {
                  targetKey = target.key;
                }
                let nextKey: Key | null = null;
                if (targetKey != null) {
                  nextKey = keyboardDelegate.getKeyPageBelow(targetKey);
                }
                let dropPosition: "before" | "on" | "after" =
                  target.type === "item" ? target.dropPosition : "after";

                // If there is no next key, or we are starting on the last key, jump to the last possible position.
                if (
                  nextKey == null ||
                  (target.type === "item" && target.key === keyboardDelegate.getLastKey?.())
                ) {
                  nextKey = keyboardDelegate.getLastKey?.() ?? null;
                  dropPosition = "after";
                }

                if (nextKey == null) {
                  break;
                }
                target = {
                  type: "item",
                  key: nextKey,
                  dropPosition,
                };

                // If the target does not accept the drop, find the next valid target.
                // If no next valid target, find the previous valid target.
                const operation = getDropOperationForTarget(
                  target,
                  wrapTypes(types),
                  drag.allowedDropOperations,
                );
                if (operation === "cancel") {
                  target =
                    nextValidTarget(
                      target,
                      types,
                      drag.allowedDropOperations,
                      (t, wrap) => getNextTarget(t, wrap),
                      false,
                    ) ??
                    nextValidTarget(
                      target,
                      types,
                      drag.allowedDropOperations,
                      getPreviousTarget,
                      false,
                    );
                }
              }

              state.setTarget(target ?? state.target);
            }
            break;
          }
          case "PageUp": {
            if (!keyboardDelegate.getKeyPageAbove) {
              break;
            }

            let target = state.target;
            if (!target) {
              target = nextValidTarget(null, types, drag.allowedDropOperations, getPreviousTarget);
            } else if (target.type === "item") {
              // If at the top already, switch to the root. Otherwise navigate a page up.
              if (target.key === keyboardDelegate.getFirstKey?.()) {
                target = {
                  type: "root",
                };
              } else {
                let nextKey: Key | null | undefined = keyboardDelegate.getKeyPageAbove(target.key);
                let dropPosition: "before" | "on" | "after" = target.dropPosition;
                if (nextKey == null) {
                  nextKey = keyboardDelegate.getFirstKey?.();
                  dropPosition = "before";
                }

                if (nextKey == null) {
                  break;
                }
                target = {
                  type: "item",
                  key: nextKey,
                  dropPosition,
                };
              }

              // If the target does not accept the drop, find the previous valid target.
              // If no next valid target, find the next valid target.
              const operation = getDropOperationForTarget(
                target,
                wrapTypes(types),
                drag.allowedDropOperations,
              );
              if (operation === "cancel") {
                target =
                  nextValidTarget(
                    target,
                    types,
                    drag.allowedDropOperations,
                    getPreviousTarget,
                    false,
                  ) ??
                  nextValidTarget(
                    target,
                    types,
                    drag.allowedDropOperations,
                    (t, wrap) => getNextTarget(t, wrap),
                    false,
                  );
              }
            }

            state.setTarget(target ?? state.target);
            break;
          }
        }
        opts.onKeyDown?.(e);
      },
    });

    onCleanup(unregister);
  });

  const collectionProps = createMemo<Record<string, unknown>>(() => ({
    ...drop.dropProps,
    // Remove description from the collection element. If dropping on the entire
    // collection, there should be a drop indicator that carries this
    // description, so no need to double-announce.
    "aria-describedby": null,
  }));

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

// Recover the collection key of a dragged/dropped DOM element. createSelectableItem
// stamps `data-key={String(key)}`, so the attribute is the stringified key; map it
// back to the real (possibly numeric) collection key by matching against the
// collection's nodes.
function keyFromDragElement(
  element: HTMLElement | null,
  collection: Collection | undefined,
): Key | null {
  if (!element) return null;
  const raw =
    element.getAttribute("data-key") ?? element.closest("[data-key]")?.getAttribute("data-key");
  if (raw == null) return null;
  if (!collection) return raw;
  // Fast path: the raw string is already a valid key.
  if ((collection as unknown as CollectionLike).getItem(raw) != null) return raw;
  for (const node of collection as unknown as CollectionLike) {
    if (String(node.key) === raw) return node.key;
  }
  return raw;
}

function selectionHas(selection: "all" | Set<Key> | null, key: Key): boolean {
  if (selection === "all") return true;
  return selection != null && selection.has(key);
}

// The selected keys in collection (DOM) order, so [0] is the first selected item
// and [length-1] the last — mirroring upstream's firstSelectedKey/lastSelectedKey.
function orderedSelectedKeys(selection: "all" | Set<Key> | null, collection: Collection): Key[] {
  const out: Key[] = [];
  for (const node of collection as unknown as CollectionLike) {
    if (node.type === "item" && selectionHas(selection, node.key)) {
      out.push(node.key);
    }
  }
  return out;
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
  previousCollectionRaw: Collection | undefined,
  previousSelectedKeys: "all" | Set<Key> | null,
  target: DropTarget,
): void {
  // Read the (real) collection through the structural `CollectionLike` view: it
  // exposes the optional cell/rowheader/isExpanded fields upstream inspects, which
  // are simply absent (undefined) for flat collections like ListBox.
  const collection = opts.collection as CollectionLike | undefined;
  const previousCollection = previousCollectionRaw as unknown as CollectionLike | undefined;
  if (!collection || !previousCollection) {
    opts.setFocused?.(true);
    return;
  }

  const newKeys = getNewItemKeys(collection, previousCollection);
  if (newKeys.size > 0) {
    const currentSelectedKeys = normalizeSelection(opts.selectedKeys);
    if (
      opts.setSelectedKeys &&
      previousSelectedKeys &&
      selectionEquals(previousSelectedKeys, currentSelectedKeys)
    ) {
      opts.setSelectedKeys(newKeys);
    }

    const first = newKeys.values().next().value;
    if (first != null) {
      let focusKey: Key | null = first;
      const item = collection.getItem(first);
      const parent = item?.parentKey != null ? collection.getItem(item.parentKey) : null;
      const isDroppedOnCollapsedParent =
        target.type === "item" &&
        target.dropPosition === "on" &&
        item?.parentKey != null &&
        parent?.isExpanded !== true;

      if (
        item &&
        (item.type === "cell" || item.type === "rowheader" || isDroppedOnCollapsedParent)
      ) {
        focusKey = item.parentKey ?? first;
      }

      opts.setFocusedKey?.(focusKey);

      queueMicrotask(() => {
        const row = opts.ref()?.querySelector<HTMLElement>('[role="row"][tabindex="0"]');
        row?.focus();
      });
    }
  }

  // Upstream always marks the collection focused after a drop. This lets the
  // existing focused key restore real DOM focus after an internal reorder.
  opts.setFocused?.(true);
}
