/**
 * Tree component for solidaria-components
 *
 * A pre-wired headless tree that combines state + aria hooks.
 * Based on react-aria-components/src/Tree.tsx
 *
 * Tree displays hierarchical data with expandable/collapsible nodes,
 * supporting keyboard navigation and selection.
 */

import {
  type JSX,
  onCleanup,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  splitProps,
  useContext,
  For,
  Show,
} from "solid-js";
import {
  createTree,
  createTreeItem,
  createTreeSelectionCheckbox,
  createGridListSection,
  createFocusRing,
  createHover,
  mergeProps,
  type AriaTreeProps,
} from "@proyecto-viviana/solidaria";
import {
  createTreeState,
  createTreeCollection,
  type TreeState,
  type TreeCollection,
  type TreeNode,
  type TreeItemData,
  type Key,
  type DropTarget,
  type ItemDropTarget,
} from "@proyecto-viviana/solid-stately";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  filterDOMProps,
} from "./utils";
import { SharedElementTransition } from "./SharedElementTransition";
import { type DragAndDropHooks } from "./useDragAndDrop";
import {
  getNormalizedDropTargetKey,
  mergePersistedKeysIntoVirtualRange,
  useDndPersistedKeys,
  useRenderDropIndicator,
} from "./DragAndDrop";
import {
  CollectionRendererContext,
  flattenCollectionEntries,
  isCollectionSection,
  type CollectionEntry,
  type CollectionRendererContextValue,
  type SectionProps,
  useCollectionRenderer,
} from "./Collection";
import {
  GridListHeader,
  GridListHeaderContext,
  GridListHeaderInnerContext,
  type GridListHeaderProps,
} from "./GridList";
import { useVirtualizerContext } from "./Virtualizer";
import {
  handleLinkClick,
  type LinkDOMProps,
  type RouterOptions,
  useLinkProps,
  useRouter,
} from "./RouterProvider";

type RefLike<T> = ((el: T) => void) | { current?: T | null } | undefined;

function assignRef<T>(ref: RefLike<T>, el: T): void {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(el);
  } else {
    ref.current = el;
  }
}

export interface TreeRenderProps {
  /** Whether the tree has focus. */
  isFocused: boolean;
  /** Whether the tree has keyboard focus. */
  isFocusVisible: boolean;
  /** Whether the tree is disabled. */
  isDisabled: boolean;
  /** Whether the tree is empty. */
  isEmpty: boolean;
}

export interface TreeProps<T extends object> extends Omit<AriaTreeProps, "children">, SlotProps {
  /** The hierarchical items to render in the tree. */
  items?: CollectionEntry<TreeItemData<T>>[];
  /** The selection mode. */
  selectionMode?: "none" | "single" | "multiple";
  /** The selection behavior (toggle vs replace). */
  selectionBehavior?: "toggle" | "replace";
  /** Whether disabled items can still receive focus. */
  disabledBehavior?: "selection" | "all";
  /** Keys of disabled items. */
  disabledKeys?: Iterable<Key>;
  /** Currently selected keys (controlled). */
  selectedKeys?: "all" | Iterable<Key>;
  /** Default selected keys (uncontrolled). */
  defaultSelectedKeys?: "all" | Iterable<Key>;
  /** Handler called when selection changes. */
  onSelectionChange?: (keys: "all" | Set<Key>) => void;
  /** Currently expanded keys (controlled). */
  expandedKeys?: Iterable<Key>;
  /** Default expanded keys (uncontrolled). */
  defaultExpandedKeys?: Iterable<Key>;
  /** Handler called when expansion changes. */
  onExpandedChange?: (keys: Set<Key>) => void;
  /** The children of the component. A function provided to render each item. */
  children: (item: TreeItemData<T>, state: TreeRenderItemState) => JSX.Element;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<TreeRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<TreeRenderProps>;
  /** A function to render when the tree is empty. */
  renderEmptyState?: () => JSX.Element;
  /** Whether there are more items to load. */
  hasMore?: boolean;
  /** Whether additional items are currently loading. */
  isLoading?: boolean;
  /** Loading state for async collection parity. */
  loadingState?: "idle" | "loading" | "loadingMore" | "sorting" | "filtering" | "error";
  /** Called when the load more sentinel becomes visible. */
  onLoadMore?: () => void | Promise<void>;
  /** Renders the load-more sentinel content. */
  renderLoadMoreItem?: (state: { isLoading: boolean }) => JSX.Element;
  /** CSS className for the load-more sentinel. */
  loadMoreClass?: ClassNameOrFunction<{ isLoading: boolean }>;
  /** Inline style for the load-more sentinel. */
  loadMoreStyle?: StyleOrFunction<{ isLoading: boolean }>;
  /** Drag and drop hooks from `useDragAndDrop`. */
  dragAndDropHooks?: DragAndDropHooks<T>;
  /** Ref for the rendered tree element. */
  ref?: RefLike<HTMLDivElement>;
}

export interface TreeRenderItemState {
  /** Whether the item is expanded. */
  isExpanded: boolean;
  /** Whether the item is expandable (has children). */
  isExpandable: boolean;
  /** The nesting level (0 = root). */
  level: number;
}

export interface TreeItemRenderProps {
  /** Whether the item is selected. */
  isSelected: boolean;
  /** Whether the item is focused. */
  isFocused: boolean;
  /** Whether the item has keyboard focus. */
  isFocusVisible: boolean;
  /** Whether the item is pressed. */
  isPressed: boolean;
  /** Whether the item is hovered. */
  isHovered: boolean;
  /** Whether the item is disabled. */
  isDisabled: boolean;
  /** Whether the item is expanded. */
  isExpanded: boolean;
  /** Whether the item is expandable (has children). */
  isExpandable: boolean;
  /** The nesting level (0 = root). */
  level: number;
  /** The selection mode active on the tree. */
  selectionMode: "none" | "single" | "multiple";
  /** The selection behavior active on the tree. */
  selectionBehavior: "toggle" | "replace";
}

export interface TreeItemProps<T extends object>
  extends
    SlotProps,
    Omit<JSX.HTMLAttributes<HTMLElement>, "class" | "style" | "children" | "id" | "ref"> {
  /** The unique key for the item. */
  id: Key;
  /** The item value. */
  item?: TreeItemData<T>;
  /** The children of the item. A function may be provided to receive render props. */
  children?: RenderChildren<TreeItemRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<TreeItemRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<TreeItemRenderProps>;
  /** The text value of the item (for accessibility). */
  textValue?: string;
  /** Handler called when the item is activated. */
  onAction?: () => void;
  /** Whether this item has children that may not be loaded yet. */
  hasChildItems?: boolean;
  /** Whether this item is disabled. */
  isDisabled?: boolean;
  /** Link target metadata. */
  href?: string;
  target?: LinkDOMProps["target"];
  download?: LinkDOMProps["download"];
  rel?: LinkDOMProps["rel"];
  hrefLang?: string;
  ping?: LinkDOMProps["ping"];
  referrerPolicy?: LinkDOMProps["referrerPolicy"];
  routerOptions?: RouterOptions;
  /** Ref for the rendered row element. */
  ref?: RefLike<HTMLElement>;
}

export interface TreeExpandButtonProps {
  /** CSS class name for the button. */
  class?: string;
  /** CSS style for the button. */
  style?: JSX.CSSProperties;
  /** Children to render inside the button. */
  children?: JSX.Element | ((props: { isExpanded: boolean }) => JSX.Element);
  [key: `data-${string}`]: string | undefined;
}

export interface TreeLoadMoreItemProps extends SlotProps {
  onLoadMore: () => void | Promise<void>;
  isLoading?: boolean;
  loadingState?: "idle" | "loading" | "loadingMore" | "sorting" | "filtering" | "error";
  level?: number;
  /** Scroll offset multiplier for early loading trigger (default: 1 = 100% of viewport height). */
  scrollOffset?: number;
  children?: JSX.Element;
  class?: ClassNameOrFunction<{ isLoading: boolean }>;
  style?: StyleOrFunction<{ isLoading: boolean }>;
}

export interface TreeSectionProps extends SectionProps {}
export interface TreeHeaderProps extends GridListHeaderProps {}

interface TreeContextValue<T extends object> {
  state: TreeState<T, TreeCollection<T>>;
  collection: TreeCollection<T>;
  isDisabled: boolean;
  renderItem: (item: TreeItemData<T>, state: TreeRenderItemState) => JSX.Element;
  dragAndDropHooks?: DragAndDropHooks<T>;
  dragState?: unknown;
  dropState?: unknown;
}

interface TreeDropTargetDelegate {
  getDropTargetFromPoint: (
    x: number,
    y: number,
    isValidDropTarget: (target: DropTarget) => boolean,
  ) => DropTarget | null;
  getKeyboardNavigationTarget?: (
    target: DropTarget | null,
    direction: "next" | "previous",
    isValidDropTarget: (target: DropTarget) => boolean,
  ) => DropTarget | null;
  getKeyboardPageNavigationTarget?: (
    target: DropTarget | null,
    direction: "next" | "previous",
    isValidDropTarget: (target: DropTarget) => boolean,
  ) => DropTarget | null;
}

interface PointerTrackingState {
  lastY: number;
  lastX: number;
  yDirection: "up" | "down" | null;
  xDirection: "left" | "right" | null;
  boundaryContext: {
    parentKey: Key;
    lastSwitchY: number;
    lastSwitchX: number;
    preferredTargetIndex?: number;
  } | null;
}

const X_SWITCH_THRESHOLD = 10;
const Y_SWITCH_THRESHOLD = 5;
const EXPANSION_KEYS = {
  expand: { ltr: "ArrowRight", rtl: "ArrowLeft" },
  collapse: { ltr: "ArrowLeft", rtl: "ArrowRight" },
} as const;

function resolveTreeDirection(element: HTMLElement | null): "ltr" | "rtl" {
  if (element) {
    const dir = element.closest("[dir]")?.getAttribute("dir");
    if (dir === "rtl") return "rtl";
    if (dir === "ltr") return "ltr";
    if (typeof window !== "undefined" && typeof window.getComputedStyle === "function") {
      const computedDirection = window.getComputedStyle(element).direction;
      if (computedDirection === "rtl") return "rtl";
      if (computedDirection === "ltr") return "ltr";
    }
  }
  if (typeof document !== "undefined") {
    return document.dir === "rtl" ? "rtl" : "ltr";
  }
  return "ltr";
}

function createTreeDropTargetDelegate<T extends object>(
  delegate: TreeDropTargetDelegate,
  state: TreeState<T, TreeCollection<T>>,
  direction: "ltr" | "rtl",
  baseKeyboardNav?: (
    target: DropTarget | null,
    direction: "next" | "previous",
    isValidDropTarget: (target: DropTarget) => boolean,
  ) => DropTarget | null,
): TreeDropTargetDelegate {
  const pointerTracking: PointerTrackingState = {
    lastY: 0,
    lastX: 0,
    yDirection: null,
    xDirection: null,
    boundaryContext: null,
  };

  const getPotentialTargets = (
    originalTarget: ItemDropTarget,
    isValidDropTarget: (target: DropTarget) => boolean,
  ): ItemDropTarget[] => {
    if (originalTarget.dropPosition === "on") return [originalTarget];

    const collection = state.collection;
    const getNodeNextKey = (node: TreeNode<T> | null | undefined): Key | null => {
      if (!node) return null;
      const declaredNextKey = (node as TreeNode<T> & { nextKey?: Key | null }).nextKey;
      return declaredNextKey ?? null;
    };
    const target: ItemDropTarget = { ...originalTarget };
    let currentItem = collection.getItem(target.key);
    while (currentItem && currentItem.type !== "item") {
      const nextKey = getNodeNextKey(currentItem);
      if (nextKey == null) break;
      target.key = nextKey;
      currentItem = collection.getItem(nextKey);
    }

    const potentialTargets: ItemDropTarget[] = [target];

    if (
      currentItem &&
      currentItem.hasChildNodes &&
      state.expandedKeys.has(currentItem.key) &&
      target.dropPosition === "after"
    ) {
      let firstChildItemNode: TreeNode<T> | null = null;
      for (const child of collection.getChildren(currentItem.key)) {
        if (child.type === "item") {
          firstChildItemNode = child;
          break;
        }
      }

      if (firstChildItemNode) {
        const beforeFirstChildTarget: ItemDropTarget = {
          type: "item",
          key: firstChildItemNode.key,
          dropPosition: "before",
        };

        if (isValidDropTarget(beforeFirstChildTarget)) {
          return [beforeFirstChildTarget];
        }
        return [];
      }
    }

    if (getNodeNextKey(currentItem) != null) {
      return [originalTarget];
    }

    let parentKey = currentItem?.parentKey ?? null;
    const ancestorTargets: ItemDropTarget[] = [];
    while (parentKey != null) {
      const parentItem = collection.getItem(parentKey);
      const nextKey = getNodeNextKey(parentItem);
      const nextItem = nextKey != null ? collection.getItem(nextKey) : null;
      const isLastChildAtLevel = !nextItem || nextItem.parentKey !== parentKey;

      if (isLastChildAtLevel) {
        const afterParentTarget: ItemDropTarget = {
          type: "item",
          key: parentKey,
          dropPosition: "after",
        };

        if (isValidDropTarget(afterParentTarget)) {
          ancestorTargets.push(afterParentTarget);
        }
        if (nextItem) break;
      }

      parentKey = parentItem?.parentKey ?? null;
    }

    if (ancestorTargets.length > 0) {
      potentialTargets.push(...ancestorTargets);
    }

    if (potentialTargets.length === 1) {
      const nextKey = collection.getKeyAfter(target.key);
      const nextNode = nextKey != null ? collection.getItem(nextKey) : null;
      if (
        nextKey != null &&
        nextNode &&
        currentItem &&
        nextNode.level != null &&
        currentItem.level != null &&
        nextNode.level > currentItem.level
      ) {
        const beforeTarget: ItemDropTarget = {
          type: "item",
          key: nextKey,
          dropPosition: "before",
        };
        if (isValidDropTarget(beforeTarget)) return [beforeTarget];
      }
    }

    return potentialTargets.filter((candidate) => isValidDropTarget(candidate));
  };

  const selectTarget = (
    potentialTargets: ItemDropTarget[],
    originalTarget: ItemDropTarget,
    x: number,
    y: number,
    currentYMovement: "up" | "down" | null,
    currentXMovement: "left" | "right" | null,
  ): ItemDropTarget => {
    if (potentialTargets.length < 2) return potentialTargets[0];

    const currentItem = state.collection.getItem(originalTarget.key);
    const parentKey = currentItem?.parentKey;
    if (parentKey == null) return potentialTargets[0];

    if (
      !pointerTracking.boundaryContext ||
      pointerTracking.boundaryContext.parentKey !== parentKey
    ) {
      const initialTargetIndex =
        pointerTracking.yDirection === "up" ? potentialTargets.length - 1 : 0;
      pointerTracking.boundaryContext = {
        parentKey,
        preferredTargetIndex: initialTargetIndex,
        lastSwitchY: y,
        lastSwitchX: x,
      };
    }

    const boundaryContext = pointerTracking.boundaryContext;
    const distanceFromLastXSwitch = Math.abs(x - boundaryContext.lastSwitchX);
    const distanceFromLastYSwitch = Math.abs(y - boundaryContext.lastSwitchY);

    if (distanceFromLastYSwitch > Y_SWITCH_THRESHOLD && currentYMovement) {
      const currentIndex = boundaryContext.preferredTargetIndex ?? 0;
      if (currentYMovement === "down" && currentIndex === 0) {
        boundaryContext.preferredTargetIndex = potentialTargets.length - 1;
      } else if (currentYMovement === "up" && currentIndex === potentialTargets.length - 1) {
        boundaryContext.preferredTargetIndex = 0;
      }
      pointerTracking.xDirection = null;
    }

    if (distanceFromLastXSwitch > X_SWITCH_THRESHOLD && currentXMovement) {
      const currentTargetIndex = boundaryContext.preferredTargetIndex ?? 0;

      if (currentXMovement === "left") {
        if (direction === "ltr") {
          if (currentTargetIndex < potentialTargets.length - 1) {
            boundaryContext.preferredTargetIndex = currentTargetIndex + 1;
            boundaryContext.lastSwitchX = x;
          }
        } else if (currentTargetIndex > 0) {
          boundaryContext.preferredTargetIndex = currentTargetIndex - 1;
          boundaryContext.lastSwitchX = x;
        }
      } else if (currentXMovement === "right") {
        if (direction === "ltr") {
          if (currentTargetIndex > 0) {
            boundaryContext.preferredTargetIndex = currentTargetIndex - 1;
            boundaryContext.lastSwitchX = x;
          }
        } else if (currentTargetIndex < potentialTargets.length - 1) {
          boundaryContext.preferredTargetIndex = currentTargetIndex + 1;
          boundaryContext.lastSwitchX = x;
        }
      }

      pointerTracking.yDirection = null;
    }

    const targetIndex = Math.max(
      0,
      Math.min(boundaryContext.preferredTargetIndex ?? 0, potentialTargets.length - 1),
    );
    return potentialTargets[targetIndex];
  };

  // --- Tree-aware keyboard DnD navigation (RAC parity) ---
  const getKeyboardNavigationTarget = (
    target: DropTarget | null,
    dir: "next" | "previous",
    isValidDropTarget: (target: DropTarget) => boolean,
  ): DropTarget | null => {
    const collection = state.collection;

    // If the target key is not a visible row (e.g. collapsed/hidden child node),
    // fall back to the base (non-override) index-based navigation to avoid infinite recursion.
    // The collection keyMap contains ALL nodes (even collapsed), so check visible rows instead.
    if (target && target.type === "item") {
      const node = collection.getItem(target.key);
      const isVisibleRow =
        node != null && (node as TreeNode<T> & { rowIndex?: number }).rowIndex != null;
      if (!isVisibleRow) {
        return baseKeyboardNav?.(target, dir, isValidDropTarget) ?? null;
      }
    }

    // Helpers
    const tryValid = (t: DropTarget): DropTarget | null => (isValidDropTarget(t) ? t : null);

    const getNodeNextKey = (node: TreeNode<T> | null | undefined): Key | null => {
      if (!node) return null;
      return (node as TreeNode<T> & { nextKey?: Key | null }).nextKey ?? null;
    };

    const isExpanded = (key: Key): boolean => {
      const node = collection.getItem(key);
      if (!node || !node.hasChildNodes) return false;
      return state.expandedKeys.has(key);
    };

    const getFirstChildItemKey = (key: Key): Key | null => {
      for (const child of collection.getChildren(key)) {
        if (child.type === "item") return child.key;
      }
      return null;
    };

    const getLastChildItemKey = (key: Key): Key | null => {
      let lastKey: Key | null = null;
      for (const child of collection.getChildren(key)) {
        if (child.type === "item") lastKey = child.key;
      }
      return lastKey;
    };

    // Find the deepest last expanded descendant (for "previous" from 'after')
    const getDeepestLastChild = (key: Key): Key => {
      let current = key;
      while (isExpanded(current)) {
        const lastChild = getLastChildItemKey(current);
        if (lastChild == null) break;
        current = lastChild;
      }
      return current;
    };

    if (dir === "next") {
      // From null → root
      if (!target) {
        return tryValid({ type: "root" });
      }
      // From root → first item 'before'
      if (target.type === "root") {
        const firstKey = collection.getFirstKey();
        if (firstKey != null) {
          return tryValid({ type: "item", key: firstKey, dropPosition: "before" });
        }
        return null;
      }
      if (target.type === "item") {
        switch (target.dropPosition) {
          case "before":
            return (
              tryValid({ type: "item", key: target.key, dropPosition: "on" }) ??
              tryValid({ type: "item", key: target.key, dropPosition: "after" })
            );
          case "on": {
            // If item is expanded and has children, go to first child 'before'
            if (isExpanded(target.key)) {
              const firstChild = getFirstChildItemKey(target.key);
              if (firstChild != null) {
                return (
                  tryValid({ type: "item", key: firstChild, dropPosition: "before" }) ??
                  tryValid({ type: "item", key: firstChild, dropPosition: "on" })
                );
              }
            }
            // Otherwise, next item in collection or 'after'
            const nextKey = collection.getKeyAfter(target.key);
            const targetNode = collection.getItem(target.key);
            const nextNode = nextKey != null ? collection.getItem(nextKey) : null;
            if (
              targetNode &&
              nextNode &&
              nextNode.level != null &&
              targetNode.level != null &&
              nextNode.level >= targetNode.level
            ) {
              return (
                tryValid({ type: "item", key: nextNode.key, dropPosition: "before" }) ??
                tryValid({ type: "item", key: target.key, dropPosition: "after" })
              );
            }
            return tryValid({ type: "item", key: target.key, dropPosition: "after" });
          }
          case "after": {
            // If item is expanded (and we're at 'after'), first child
            if (isExpanded(target.key)) {
              const firstChild = getFirstChildItemKey(target.key);
              if (firstChild != null) {
                return (
                  tryValid({ type: "item", key: firstChild, dropPosition: "before" }) ??
                  tryValid({ type: "item", key: firstChild, dropPosition: "on" })
                );
              }
            }
            // Check if this is the last sibling at its level
            const targetNode = collection.getItem(target.key);
            const nextSiblingKey = getNodeNextKey(targetNode);
            if (nextSiblingKey != null) {
              const nextSibling = collection.getItem(nextSiblingKey);
              if (nextSibling?.type === "item") {
                return (
                  tryValid({ type: "item", key: nextSibling.key, dropPosition: "before" }) ??
                  tryValid({ type: "item", key: nextSibling.key, dropPosition: "on" })
                );
              }
            }
            // Traverse up to parent when at last sibling
            if (targetNode?.parentKey != null) {
              const parentNode = collection.getItem(targetNode.parentKey);
              const parentNextKey = getNodeNextKey(parentNode);
              const parentNextNode =
                parentNextKey != null ? collection.getItem(parentNextKey) : null;
              if (parentNextNode?.type === "item") {
                return tryValid({ type: "item", key: parentNextNode.key, dropPosition: "before" });
              }
              if (parentNode?.type === "item") {
                return tryValid({ type: "item", key: parentNode.key, dropPosition: "after" });
              }
            }
            // Reached end — try next item in flat collection
            const nextKey = collection.getKeyAfter(target.key);
            if (nextKey != null) {
              return (
                tryValid({ type: "item", key: nextKey, dropPosition: "before" }) ??
                tryValid({ type: "item", key: nextKey, dropPosition: "on" })
              );
            }
            return tryValid({ type: "root" });
          }
        }
      }
      return null;
    }

    // From null or root → last root-level item 'after'
    if (!target || target.type === "root") {
      const lastKey = collection.getLastKey();
      if (lastKey != null) {
        // Find root-level ancestor of last key
        let rootKey = lastKey;
        let node = collection.getItem(lastKey);
        while (node?.parentKey != null) {
          rootKey = node.parentKey;
          node = collection.getItem(rootKey);
        }
        return tryValid({ type: "item", key: rootKey, dropPosition: "after" });
      }
      return null;
    }

    if (target.type === "item") {
      switch (target.dropPosition) {
        case "after": {
          // If expanded with children, go to deepest last child 'after'
          const deepest = getDeepestLastChild(target.key);
          if (deepest !== target.key) {
            return (
              tryValid({ type: "item", key: deepest, dropPosition: "after" }) ??
              tryValid({ type: "item", key: target.key, dropPosition: "on" })
            );
          }
          return tryValid({ type: "item", key: target.key, dropPosition: "on" });
        }
        case "on":
          return tryValid({ type: "item", key: target.key, dropPosition: "before" });
        case "before": {
          // Move to the previous sibling's deepest last child 'after'
          const prevKey = collection.getKeyBefore(target.key);
          if (prevKey != null) {
            const deepest = getDeepestLastChild(prevKey);
            return (
              tryValid({ type: "item", key: deepest, dropPosition: "after" }) ??
              tryValid({ type: "item", key: prevKey, dropPosition: "on" })
            );
          }
          // No previous — go to root
          return tryValid({ type: "root" });
        }
      }
    }

    return null;
  };

  return {
    getDropTargetFromPoint(x, y, isValidDropTarget) {
      const baseTarget = delegate.getDropTargetFromPoint(x, y, isValidDropTarget);
      if (!baseTarget || baseTarget.type === "root") return baseTarget;

      const deltaY = y - pointerTracking.lastY;
      const deltaX = x - pointerTracking.lastX;
      let currentYMovement: "up" | "down" | null = pointerTracking.yDirection;
      let currentXMovement: "left" | "right" | null = pointerTracking.xDirection;

      if (Math.abs(deltaY) > Y_SWITCH_THRESHOLD) {
        currentYMovement = deltaY > 0 ? "down" : "up";
        pointerTracking.yDirection = currentYMovement;
        pointerTracking.lastY = y;
      }

      if (Math.abs(deltaX) > X_SWITCH_THRESHOLD) {
        currentXMovement = deltaX > 0 ? "right" : "left";
        pointerTracking.xDirection = currentXMovement;
        pointerTracking.lastX = x;
      }

      let target: ItemDropTarget = baseTarget;
      if (target.dropPosition === "before") {
        const keyBefore = state.collection.getKeyBefore(target.key);
        if (keyBefore != null) {
          const normalized: ItemDropTarget = {
            type: "item",
            key: keyBefore,
            dropPosition: "after",
          };
          if (isValidDropTarget(normalized)) target = normalized;
        }
      }

      const potentialTargets = getPotentialTargets(target, isValidDropTarget);
      if (potentialTargets.length === 0) return { type: "root" };

      if (potentialTargets.length > 1) {
        return selectTarget(potentialTargets, target, x, y, currentYMovement, currentXMovement);
      }

      pointerTracking.boundaryContext = null;
      return potentialTargets[0];
    },
    getKeyboardNavigationTarget,
    getKeyboardPageNavigationTarget: delegate.getKeyboardPageNavigationTarget?.bind(delegate),
  };
}

interface TreeItemContextValue<T extends object> {
  node: TreeNode<T>;
  isExpanded: boolean;
  isExpandable: boolean;
  level: number;
}

export const TreeContext = createContext<TreeContextValue<object> | null>(null);
export const TreeStateContext = createContext<TreeState<object, TreeCollection<object>> | null>(
  null,
);
export const TreeItemContext = createContext<TreeItemContextValue<object> | null>(null);
const TreeItemContentContext = createContext<TreeItemRenderProps | null>(null);

function isTreeItemRecord(value: unknown): value is Record<PropertyKey, unknown> {
  return typeof value === "object" && value !== null;
}

function treeItemDataFromNode<T extends object>(node: TreeNode<T>): TreeItemData<T> {
  const value = node.value;
  const item: Record<PropertyKey, unknown> = isTreeItemRecord(value) ? value : {};
  return {
    ...item,
    key: node.key,
    id: (item.id as Key | undefined) ?? node.key,
    value: (value ?? undefined) as T | undefined,
    textValue: node.textValue,
    isDisabled: node.isDisabled,
    hasChildItems: node.hasChildNodes,
    children:
      node.childNodes.length > 0
        ? node.childNodes.map((child) => treeItemDataFromNode(child))
        : undefined,
  };
}

/**
 * A tree displays hierarchical data with expandable/collapsible nodes,
 * supporting keyboard navigation and selection.
 */
export function Tree<T extends object>(props: TreeProps<T>): JSX.Element {
  const [local, stateProps, ariaProps] = splitProps(
    props,
    [
      "class",
      "style",
      "slot",
      "renderEmptyState",
      "hasMore",
      "isLoading",
      "loadingState",
      "onLoadMore",
      "renderLoadMoreItem",
      "loadMoreClass",
      "loadMoreStyle",
      "dragAndDropHooks",
      "ref",
    ],
    [
      "items",
      "disabledKeys",
      "disabledBehavior",
      "selectionMode",
      "selectionBehavior",
      "selectedKeys",
      "defaultSelectedKeys",
      "onSelectionChange",
      "expandedKeys",
      "defaultExpandedKeys",
      "onExpandedChange",
    ],
  );

  const [ref, setRef] = createSignal<HTMLDivElement | null>(null);
  const flatItems = createMemo<TreeItemData<T>[]>(() =>
    flattenCollectionEntries(stateProps.items ?? []),
  );
  const hasSections = createMemo(() =>
    (stateProps.items ?? []).some((entry) => isCollectionSection(entry)),
  );

  const state = createTreeState<T, TreeCollection<T>>(() => ({
    collectionFactory: (expandedKeys) =>
      createTreeCollection(flatItems(), expandedKeys) as TreeCollection<T>,
    disabledKeys: stateProps.disabledKeys,
    disabledBehavior: stateProps.disabledBehavior,
    selectionMode: stateProps.selectionMode,
    selectionBehavior: stateProps.selectionBehavior,
    selectedKeys: stateProps.selectedKeys,
    defaultSelectedKeys: stateProps.defaultSelectedKeys,
    onSelectionChange: stateProps.onSelectionChange,
    expandedKeys: stateProps.expandedKeys,
    defaultExpandedKeys: stateProps.defaultExpandedKeys,
    onExpandedChange: stateProps.onExpandedChange,
  }));

  const [lastExpandedKeys, setLastExpandedKeys] = createSignal<Set<Key>>(new Set());
  const [lastItemsLength, setLastItemsLength] = createSignal(flatItems().length);
  const [collectionVersion, setCollectionVersion] = createSignal(0);
  createEffect(() => {
    const expanded = state.expandedKeys;
    const items = flatItems();
    if (!areSetsEqual(lastExpandedKeys(), expanded) || lastItemsLength() !== items.length) {
      setLastExpandedKeys(new Set(expanded));
      setLastItemsLength(items.length);
      setCollectionVersion((v) => v + 1);
    }
  });

  // Resolve writing direction for keyboard expand/collapse parity
  const treeDirection = createMemo(() => ariaProps.direction ?? resolveTreeDirection(ref()));

  const { treeProps } = createTree<T, TreeCollection<T>>(
    () => ({
      id: ariaProps.id,
      "aria-label": ariaProps["aria-label"],
      "aria-labelledby": ariaProps["aria-labelledby"],
      "aria-describedby": ariaProps["aria-describedby"],
      isVirtualized: ariaProps.isVirtualized,
      onAction: ariaProps.onAction,
      isDisabled: ariaProps.isDisabled,
      keyboardNavigationBehavior: ariaProps.keyboardNavigationBehavior,
      direction: treeDirection(),
    }),
    () => state,
    ref,
  );

  const { isFocused, isFocusVisible, focusProps } = createFocusRing();

  const renderValues = createMemo<TreeRenderProps>(() => ({
    isFocused: state.isFocused || isFocused(),
    isFocusVisible: isFocusVisible(),
    isDisabled: ariaProps.isDisabled ?? false,
    isEmpty: flatItems().length === 0,
  }));

  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Tree",
    },
    renderValues,
  );

  const domProps = createMemo(() => {
    const filtered = filterDOMProps(ariaProps as Record<string, unknown>, { global: true });
    return filtered;
  });

  const cleanTreeProps = () => {
    const { ref: _ref1, ...rest } = treeProps as Record<string, unknown>;
    return rest;
  };
  const cleanFocusProps = () => {
    const { ref: _ref2, ...rest } = focusProps as Record<string, unknown>;
    return rest;
  };

  const isEmpty = () => flatItems().length === 0;

  const visibleRows = createMemo(() => {
    collectionVersion();
    return state.collection.rows;
  });
  const virtualizer = useVirtualizerContext();
  const parentCollectionRenderer = useCollectionRenderer<TreeItemData<T>>();
  const getDropTargetByIndex = (
    index: number,
    position: "before" | "after" | "on",
  ): DropTarget | null => {
    const node = visibleRows()[index];
    if (!node) return null;
    return { type: "item", key: node.key, dropPosition: position };
  };
  const hasDroppableDnd = createMemo(() => {
    const hooks = local.dragAndDropHooks;
    return Boolean(
      hooks?.useDroppableCollectionState &&
      hooks.useDroppableCollection &&
      (hooks.dropTargetDelegate ||
        parentCollectionRenderer?.dropTargetDelegate ||
        hooks.ListDropTargetDelegate),
    );
  });
  const hasDraggableDnd = createMemo(() => {
    const hooks = local.dragAndDropHooks;
    return Boolean(hooks?.useDraggableCollectionState && hooks.useDraggableCollection);
  });
  const dragState = createMemo(() => {
    if (!hasDraggableDnd()) return undefined;
    return local.dragAndDropHooks?.useDraggableCollectionState?.({
      items: visibleRows().map((node) => node.value as T),
    });
  });
  const dropState = createMemo(() => {
    if (!hasDroppableDnd()) return undefined;
    return local.dragAndDropHooks?.useDroppableCollectionState?.({});
  });
  createEffect(() => {
    const activeDropState = dropState();
    if (!activeDropState) return;
    const originalGetDropOperation = activeDropState.getDropOperation.bind(activeDropState);

    activeDropState.getDropOperation = (target, types, allowedOperations) => {
      const currentDraggingKeys = dragState()?.draggingKeys ?? new Set<string | number>();
      if (target.type === "item" && currentDraggingKeys.size > 0) {
        if (currentDraggingKeys.has(target.key) && target.dropPosition === "on") {
          return "cancel";
        }

        let currentKey: Key | null = target.key;
        while (currentKey != null) {
          const item = state.collection.getItem(currentKey);
          const parentKey = item?.parentKey;
          if (parentKey != null && currentDraggingKeys.has(parentKey)) {
            return "cancel";
          }
          currentKey = parentKey ?? null;
        }
      }

      return originalGetDropOperation(target, types, allowedOperations);
    };

    onCleanup(() => {
      activeDropState.getDropOperation = originalGetDropOperation;
    });
  });
  createEffect(() => {
    if (!hasDraggableDnd()) return;
    const hooks = local.dragAndDropHooks;
    const activeDragState = dragState();
    if (!hooks?.useDraggableCollection || !activeDragState) return;
    hooks.useDraggableCollection({}, activeDragState, () => ref());
  });
  const contextValue = createMemo<TreeContextValue<T>>(() => ({
    state,
    collection: state.collection,
    isDisabled: ariaProps.isDisabled ?? false,
    renderItem: props.children,
    dragAndDropHooks: local.dragAndDropHooks,
    dragState: dragState(),
    dropState: dropState(),
  }));
  const droppableCollection = createMemo(() => {
    if (!hasDroppableDnd()) return undefined;
    const hooks = local.dragAndDropHooks;
    const activeDropState = dropState();
    if (!hooks?.useDroppableCollection || !activeDropState) return undefined;
    const direction = resolveTreeDirection(ref());
    const baseDropTargetDelegate =
      hooks.dropTargetDelegate ??
      parentCollectionRenderer?.dropTargetDelegate ??
      (hooks.ListDropTargetDelegate
        ? new hooks.ListDropTargetDelegate(
            () => state.collection,
            () => ref(),
            { layout: "stack", orientation: "vertical", direction },
          )
        : undefined);
    if (!baseDropTargetDelegate) return undefined;
    const dropTargetDelegate = createTreeDropTargetDelegate(
      baseDropTargetDelegate as TreeDropTargetDelegate,
      state,
      direction,
      virtualizer?.getBaseKeyboardNavigationTarget,
    );
    return hooks.useDroppableCollection(
      {
        dropTargetDelegate,
        keyboardDelegate: {
          getFirstKey: () => state.collection.getFirstKey(),
          getLastKey: () => state.collection.getLastKey(),
          getKeyBelow: (key) => state.collection.getKeyAfter(key),
          getKeyAbove: (key) => state.collection.getKeyBefore(key),
          getKeyPageBelow: (key) => state.collection.getKeyAfter(key),
          getKeyPageAbove: (key) => state.collection.getKeyBefore(key),
        },
        get collection() {
          return state.collection;
        },
        get selectedKeys() {
          return state.selectedKeys;
        },
        setSelectedKeys: (keys: Set<Key>) => {
          if (state.selectionMode === "none") return;
          state.clearSelection();
          for (const key of keys) {
            state.toggleSelection(key);
          }
        },
        setFocusedKey: (key) => state.setFocusedKey(key),
        onDropActivate: (event) => {
          if (event.target.type !== "item") return;
          const key = event.target.key;
          const item = state.collection.getItem(key);
          const isExpanded = state.isExpanded(key);
          if (item?.hasChildNodes && (!isExpanded || hooks.isVirtualDragging?.())) {
            state.toggleKey(key);
          }
        },
        onKeyDown: (event) => {
          const target = activeDropState.target;
          if (!target || target.type !== "item" || target.dropPosition !== "on") return;
          const item = state.collection.getItem(target.key);
          if (!item?.hasChildNodes) return;
          const currentDirection = ariaProps.direction ?? resolveTreeDirection(ref());
          const expandKey = EXPANSION_KEYS.expand[currentDirection];
          const collapseKey = EXPANSION_KEYS.collapse[currentDirection];
          if (event.key === expandKey && !state.isExpanded(target.key)) {
            state.toggleKey(target.key);
          } else if (event.key === collapseKey && state.isExpanded(target.key)) {
            state.toggleKey(target.key);
          }
        },
      },
      activeDropState,
      () => ref(),
    );
  });
  const isRootDropTarget = createMemo(() => {
    return Boolean(dropState()?.target?.type === "root");
  });
  const dndRenderDropIndicator = createMemo(() =>
    useRenderDropIndicator(local.dragAndDropHooks, dropState()),
  );
  const dndDropIndicator = (index: number, position: "before" | "after" | "on") => {
    const target = getDropTargetByIndex(index, position);
    if (!target || target.type !== "item") return undefined;
    return dndRenderDropIndicator()?.(target);
  };
  const persistedKeys = useDndPersistedKeys(
    { focusedKey: () => state.focusedKey },
    local.dragAndDropHooks,
    dropState(),
    state.collection,
  );
  const virtualRange = createMemo(() => {
    if (!virtualizer || !parentCollectionRenderer?.isVirtualized) return null;
    const rows = visibleRows();
    const baseRange = virtualizer.getVisibleRange(rows.length);
    const persistedIndexes = Array.from(persistedKeys())
      .map((key) => rows.findIndex((node) => node.key === key))
      .filter((index) => index >= 0);
    const dropTarget = dropState()?.target;
    const normalizedDropKey = getNormalizedDropTargetKey(dropTarget, state.collection);
    const focusedKey = state.focusedKey;
    const focusedIndex =
      focusedKey != null ? rows.findIndex((node) => node.key === focusedKey) : -1;
    const forceIncludeIndexes = [
      dropTarget?.type === "item" ? rows.findIndex((node) => node.key === dropTarget.key) : -1,
      normalizedDropKey != null ? rows.findIndex((node) => node.key === normalizedDropKey) : -1,
      dropTarget?.type === "item" ? -1 : focusedIndex,
    ].filter((index) => index >= 0);
    return mergePersistedKeysIntoVirtualRange(
      baseRange,
      persistedIndexes,
      rows.length,
      virtualizer,
      80,
      {
        forceIncludeIndexes,
        forceIncludeMaxSpan: 320,
      },
    );
  });
  const virtualizedVisibleRows = createMemo(() => {
    const range = virtualRange();
    if (!range) return visibleRows();
    return visibleRows().slice(range.start, range.end);
  });
  createEffect(() => {
    if (!virtualizer || !parentCollectionRenderer?.isVirtualized) return;
    virtualizer.setDropTargetItemCountResolver(() => visibleRows().length);
    virtualizer.setDropTargetIndexResolver((key) => {
      const rows = visibleRows();
      const index = rows.findIndex((node) => node.key === key);
      return index >= 0 ? index : null;
    });
    virtualizer.setDropTargetResolver((target) => {
      const node = visibleRows()[target.index];
      if (!node) return target;
      return {
        ...target,
        key: typeof node.key === "string" || typeof node.key === "number" ? node.key : undefined,
        parentKey:
          typeof node.parentKey === "string" || typeof node.parentKey === "number"
            ? node.parentKey
            : node.parentKey == null
              ? null
              : undefined,
        level: typeof node.level === "number" ? node.level : undefined,
      };
    });
    onCleanup(() => {
      virtualizer.setDropTargetIndexResolver(undefined);
      virtualizer.setDropTargetItemCountResolver(undefined);
      virtualizer.setDropTargetResolver(undefined);
    });
  });
  const rowIndexByKey = createMemo(() => {
    const map = new Map<Key, number>();
    const rows = visibleRows();
    for (let i = 0; i < rows.length; i += 1) {
      map.set(rows[i].key, i);
    }
    return map;
  });
  const getAfterIndicatorIndexes = (
    absoluteIndex: number,
    renderRange?: { start: number; end: number } | null,
  ): number[] => {
    const rows = visibleRows();
    const current = rows[absoluteIndex];
    if (!current) return [];
    const next = rows[absoluteIndex + 1];
    // "after" is equivalent to next sibling's "before" when next row is at same or deeper level.
    if (next && next.level >= current.level) {
      return [];
    }

    const result: number[] = [];
    let cursorIndex: number | null = absoluteIndex;

    // Emit after indicators for current and ancestor boundary levels, matching RAC branch exit semantics.
    while (cursorIndex != null) {
      const cursor: TreeNode<T> | undefined = rows[cursorIndex];
      if (!cursor) break;
      const shouldRender =
        !next || (cursor.parentKey !== next.parentKey && next.level < cursor.level);
      if (!shouldRender) break;
      result.push(cursorIndex);
      if (cursor.parentKey == null) break;
      cursorIndex = rowIndexByKey().get(cursor.parentKey) ?? null;
    }
    if (!renderRange) return result;
    return result.filter((index) => index >= renderRange.start && index < renderRange.end);
  };
  // Install tree-aware keyboard navigation override into the Virtualizer (if present).
  // This replaces the generic index-based navigation with collection-level semantics
  // (tree branch traversal, level-aware wrapping — RAC parity item #36).
  createEffect(() => {
    if (!virtualizer) return;
    const direction = resolveTreeDirection(ref());
    const parentDelegate: TreeDropTargetDelegate = {
      getDropTargetFromPoint:
        parentCollectionRenderer?.dropTargetDelegate?.getDropTargetFromPoint ??
        ((_x, _y, _v) => null),
      getKeyboardNavigationTarget:
        parentCollectionRenderer?.dropTargetDelegate?.getKeyboardNavigationTarget,
      getKeyboardPageNavigationTarget:
        parentCollectionRenderer?.dropTargetDelegate?.getKeyboardPageNavigationTarget,
    };
    const treeDelegate = createTreeDropTargetDelegate(
      parentDelegate,
      state,
      direction,
      virtualizer.getBaseKeyboardNavigationTarget,
    );
    virtualizer.setKeyboardNavigationOverride(
      treeDelegate.getKeyboardNavigationTarget
        ? (target, dir, isValid) => treeDelegate.getKeyboardNavigationTarget!(target, dir, isValid)
        : undefined,
    );
    onCleanup(() => {
      virtualizer.setKeyboardNavigationOverride(undefined);
    });
  });
  const collectionRenderer = createMemo<CollectionRendererContextValue<unknown>>(() => ({
    ...parentCollectionRenderer,
    renderItem: (item) => item as JSX.Element,
    renderDropIndicator: (index: number, position: "before" | "after" | "on") =>
      dndDropIndicator(index, position) ??
      parentCollectionRenderer?.renderDropIndicator?.(index, position),
  }));
  const rootKeyByNodeKey = createMemo(() => {
    const rootMap = new Map<Key, Key>();
    for (const row of visibleRows()) {
      let rootKey: Key = row.key;
      let parentKey = row.parentKey;
      while (parentKey != null) {
        rootKey = parentKey;
        parentKey = state.collection.getParentKey(parentKey);
      }
      rootMap.set(row.key, rootKey);
    }
    return rootMap;
  });
  const renderRange = createMemo(() => {
    const range = virtualRange();
    if (!range) return null;
    return { start: range.start, end: range.end };
  });
  const renderableRows = createMemo(() => {
    const offset = renderRange()?.start ?? 0;
    return virtualizedVisibleRows().map((node, index) => ({
      node,
      globalIndex: offset + index,
    }));
  });
  const sectionedRenderableRows = createMemo(() => {
    if (!hasSections()) return null;
    const rootMap = rootKeyByNodeKey();
    const rows = renderableRows();
    return (stateProps.items ?? []).map((entry) => {
      if (!isCollectionSection(entry)) {
        const matching = rows.filter((row) => rootMap.get(row.node.key) === entry.key);
        return {
          type: "single" as const,
          item: entry,
          rows: matching,
        };
      }
      const sectionRootKeys = new Set(entry.items.map((item) => item.key));
      const sectionRows = rows.filter((row) => {
        const rootKey = rootMap.get(row.node.key);
        return rootKey != null && sectionRootKeys.has(rootKey);
      });
      return {
        type: "section" as const,
        section: entry,
        rows: sectionRows,
      };
    });
  });
  const renderTreeRow = (node: TreeNode<T>, itemIndex: number) => {
    const beforeIndicator = () => collectionRenderer().renderDropIndicator?.(itemIndex, "before");
    const onIndicator = () => collectionRenderer().renderDropIndicator?.(itemIndex, "on");
    const afterIndicatorIndexes = () => getAfterIndicatorIndexes(itemIndex, renderRange());
    const itemData = treeItemDataFromNode(node);
    const itemState: TreeRenderItemState = {
      isExpanded: node.isExpanded ?? false,
      isExpandable: node.isExpandable ?? false,
      level: node.level,
    };
    return (
      <>
        {beforeIndicator()}
        {onIndicator()}
        {props.children(itemData, itemState)}
        <For each={afterIndicatorIndexes()}>
          {(afterIndex) => collectionRenderer().renderDropIndicator?.(afterIndex, "after")}
        </For>
      </>
    );
  };

  return (
    <TreeContext.Provider value={contextValue() as unknown as TreeContextValue<object>}>
      <TreeStateContext.Provider
        value={state as unknown as TreeState<object, TreeCollection<object>>}
      >
        <CollectionRendererContext.Provider value={collectionRenderer()}>
          <div
            ref={(element) => {
              setRef(element);
              assignRef(local.ref, element);
            }}
            {...mergeProps(
              domProps(),
              cleanTreeProps(),
              cleanFocusProps(),
              (droppableCollection()?.collectionProps as Record<string, unknown> | undefined) ?? {},
            )}
            class={renderProps.class()}
            style={renderProps.style()}
            data-focused={state.isFocused || undefined}
            data-focus-visible={isFocusVisible() || undefined}
            data-disabled={ariaProps.isDisabled || undefined}
            data-empty={isEmpty() || undefined}
            data-drop-target={isRootDropTarget() || undefined}
            data-selection-mode={
              stateProps.selectionMode !== "none" ? stateProps.selectionMode : undefined
            }
            data-allows-dragging={hasDraggableDnd() || undefined}
          >
            <SharedElementTransition>
              {isEmpty() && local.renderEmptyState ? (
                <div role="row" aria-level={1} style={{ display: "contents" }}>
                  <div role="gridcell" style={{ display: "contents" }}>
                    {local.renderEmptyState()}
                  </div>
                </div>
              ) : (
                <>
                  {virtualRange()?.offsetTop ? (
                    <div
                      role="presentation"
                      aria-hidden="true"
                      style={{ height: `${virtualRange()!.offsetTop}px` }}
                      data-virtualizer-spacer="top"
                    />
                  ) : null}
                  <Show
                    when={hasSections()}
                    fallback={
                      <For each={renderableRows()}>
                        {(row) => renderTreeRow(row.node, row.globalIndex)}
                      </For>
                    }
                  >
                    <For each={sectionedRenderableRows() ?? []}>
                      {(entry) => (
                        <Show when={entry.rows.length > 0}>
                          <Show
                            when={entry.type === "section"}
                            fallback={
                              <For each={entry.rows}>
                                {(row) => renderTreeRow(row.node, row.globalIndex)}
                              </For>
                            }
                          >
                            <TreeSection>
                              {entry.type === "section" && entry.section.title ? (
                                <TreeHeader>{entry.section.title}</TreeHeader>
                              ) : null}
                              <For each={entry.rows}>
                                {(row) => renderTreeRow(row.node, row.globalIndex)}
                              </For>
                            </TreeSection>
                          </Show>
                        </Show>
                      )}
                    </For>
                  </Show>
                  {virtualRange()?.offsetBottom ? (
                    <div
                      role="presentation"
                      aria-hidden="true"
                      style={{ height: `${virtualRange()!.offsetBottom}px` }}
                      data-virtualizer-spacer="bottom"
                    />
                  ) : null}
                </>
              )}
            </SharedElementTransition>
            {local.hasMore && local.onLoadMore && (
              <TreeLoadMoreItem
                onLoadMore={local.onLoadMore}
                isLoading={local.isLoading}
                loadingState={local.loadingState}
                class={local.loadMoreClass}
                style={local.loadMoreStyle}
              >
                {local.renderLoadMoreItem?.({
                  isLoading:
                    !!local.isLoading ||
                    local.loadingState === "loading" ||
                    local.loadingState === "loadingMore",
                })}
              </TreeLoadMoreItem>
            )}
          </div>
        </CollectionRendererContext.Provider>
      </TreeStateContext.Provider>
    </TreeContext.Provider>
  );
}

/**
 * An item in a tree.
 */
export function TreeItem<T extends object>(props: TreeItemProps<T>): JSX.Element {
  const [local, domProps] = splitProps(props, [
    "class",
    "style",
    "slot",
    "id",
    "item",
    "textValue",
    "onAction",
    "hasChildItems",
    "isDisabled",
    "href",
    "target",
    "download",
    "rel",
    "hrefLang",
    "ping",
    "referrerPolicy",
    "routerOptions",
    "ref",
    "children",
  ]);

  const context = useContext(TreeStateContext);
  if (!context) {
    throw new Error("TreeItem must be used within a Tree");
  }
  const state = context as TreeState<T, TreeCollection<T>>;
  const treeContext = useContext(TreeContext) as TreeContextValue<T> | null;
  const router = useRouter();
  const linkProps = createMemo(() =>
    useLinkProps({
      href: local.href,
      target: local.target,
      rel: local.rel,
      download: local.download,
      ping: local.ping,
      referrerPolicy: local.referrerPolicy,
    }),
  );

  const [ref, setRef] = createSignal<HTMLElement | null>(null);
  const setItemRef = (element: HTMLElement) => {
    setRef(element);
    assignRef(local.ref, element);
  };

  const itemNode = createMemo(() => {
    const node = state.collection.getItem(local.id);
    if (!node) {
      return {
        type: "item" as const,
        key: local.id,
        value: local.item?.value ?? null,
        textValue: local.textValue ?? String(local.id),
        level: 0,
        index: 0,
        hasChildNodes: !!local.hasChildItems,
        childNodes: [],
        isDisabled: local.isDisabled,
        isExpandable: !!local.hasChildItems,
        isExpanded: false,
      } as TreeNode<T>;
    }
    return node;
  });

  const treeItemAria = createTreeItem<T, TreeCollection<T>>(
    () => ({
      node: itemNode(),
      selectionBehavior: state.selectionBehavior,
      onAction: local.onAction,
      isDisabled: local.isDisabled,
      textValue: local.textValue,
    }),
    () => state,
    ref,
  );
  const isSelected = () => treeItemAria.isSelected;
  const isDisabled = () => treeItemAria.isDisabled;
  const isPressed = () => treeItemAria.isPressed;
  const isExpanded = () => treeItemAria.isExpanded;
  const isExpandable = () => treeItemAria.isExpandable;
  const level = () => treeItemAria.level;

  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return isDisabled();
    },
  });

  const { isFocusVisible, focusProps } = createFocusRing();

  const isFocused = createMemo(() => state.focusedKey === local.id);
  const draggableItem = createMemo(() => {
    if (!treeContext?.dragAndDropHooks?.useDraggableItem || !treeContext.dragState)
      return undefined;
    return treeContext.dragAndDropHooks.useDraggableItem(
      {
        key: local.id as string | number,
      },
      treeContext.dragState as Parameters<NonNullable<DragAndDropHooks<T>["useDraggableItem"]>>[1],
    );
  });
  const droppableItem = createMemo(() => {
    if (!treeContext?.dragAndDropHooks?.useDroppableItem || !treeContext.dropState)
      return undefined;
    return treeContext.dragAndDropHooks.useDroppableItem(
      {
        key: local.id as string | number,
      },
      treeContext.dropState as Parameters<NonNullable<DragAndDropHooks<T>["useDroppableItem"]>>[1],
      () => ref(),
    );
  });

  const renderValues = createMemo<TreeItemRenderProps>(() => ({
    isSelected: isSelected(),
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible() && isFocused(),
    isPressed: isPressed(),
    isHovered: isHovered(),
    isDisabled: isDisabled(),
    isExpanded: isExpanded(),
    isExpandable: isExpandable(),
    level: level(),
    selectionMode: state.selectionMode,
    selectionBehavior: state.selectionBehavior,
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Tree-item",
    },
    renderValues,
  );

  const cleanRowProps = () => {
    const { ref: _ref1, ...rest } = treeItemAria.rowProps as Record<string, unknown>;
    return rest;
  };
  const cleanHoverProps = () => {
    const { ref: _ref2, ...rest } = hoverProps as Record<string, unknown>;
    return rest;
  };
  const cleanFocusProps = () => {
    const { ref: _ref3, ...rest } = focusProps as Record<string, unknown>;
    return rest;
  };

  const itemContextValue = createMemo<TreeItemContextValue<T>>(() => ({
    node: itemNode(),
    isExpanded: isExpanded(),
    isExpandable: isExpandable(),
    level: level(),
  }));

  const rowStyle = () => ({
    "--tree-item-level": String(level()),
    ...((typeof renderProps.style() === "object" ? renderProps.style() : {}) as Record<
      string,
      string
    >),
  });

  const rowContent = () => (
    <TreeItemContentContext.Provider value={renderValues()}>
      <div {...treeItemAria.gridCellProps} class="solidaria-Tree-item-content">
        {renderProps.renderChildren()}
      </div>
    </TreeItemContentContext.Provider>
  );

  const mergedRowProps = () =>
    mergeProps(
      cleanRowProps(),
      cleanHoverProps(),
      cleanFocusProps(),
      (draggableItem()?.dragProps as Record<string, unknown> | undefined) ?? {},
      (droppableItem()?.dropProps as Record<string, unknown> | undefined) ?? {},
    );

  const onLinkedRowClick = (event: MouseEvent) => {
    const onClick = (mergedRowProps() as { onClick?: (event: MouseEvent) => void }).onClick;
    onClick?.(event);
    handleLinkClick(event, router, local.href, local.routerOptions);
  };

  const downloadAttr = () => {
    const download = linkProps().download;
    return typeof download === "boolean" ? (download ? "" : undefined) : download;
  };

  const referrerPolicyAttr = () => linkProps().referrerPolicy || undefined;
  const linkedRowDomProps = () =>
    local.href
      ? {
          onClick: onLinkedRowClick,
          "data-href": linkProps().href,
          "data-target": linkProps().target,
          "data-download": downloadAttr(),
          "data-rel": linkProps().rel,
          "data-hreflang": local.hrefLang,
          "data-ping": linkProps().ping,
          "data-referrer-policy": referrerPolicyAttr(),
        }
      : {};

  return (
    <TreeItemContext.Provider value={itemContextValue() as unknown as TreeItemContextValue<object>}>
      <div
        ref={setItemRef}
        {...domProps}
        {...mergedRowProps()}
        {...linkedRowDomProps()}
        class={renderProps.class()}
        style={rowStyle()}
        data-selected={isSelected() || undefined}
        data-focused={isFocused() || undefined}
        data-focus-visible={(isFocusVisible() && isFocused()) || undefined}
        data-pressed={isPressed() || undefined}
        data-hovered={isHovered() || undefined}
        data-disabled={isDisabled() || undefined}
        data-expanded={isExpanded() || undefined}
        data-expandable={isExpandable() || undefined}
        data-has-child-items={isExpandable() || undefined}
        data-level={level()}
        data-selection-mode={
          treeContext?.state.selectionMode !== "none" ? treeContext?.state.selectionMode : undefined
        }
        data-dragging={draggableItem()?.isDragging || undefined}
        data-drop-target={droppableItem()?.isDropTarget || undefined}
      >
        {rowContent()}
      </div>
    </TreeItemContext.Provider>
  );
}

/**
 * A button to expand/collapse a tree item.
 */
export function TreeExpandButton(props: TreeExpandButtonProps): JSX.Element {
  const itemContext = useContext(TreeItemContext);
  if (!itemContext) {
    throw new Error("TreeExpandButton must be used within a Tree");
  }

  const stateContext = useContext(TreeStateContext);
  if (!stateContext) {
    throw new Error("TreeExpandButton must be used within a Tree");
  }

  const state = stateContext as TreeState<object, TreeCollection<object>>;

  const treeItemAria = createTreeItem(
    () => ({ node: itemContext.node }),
    () => state,
    () => null,
  );

  const cleanExpandProps = () => {
    const { ref: _ref, ...rest } = treeItemAria.expandButtonProps as Record<string, unknown>;
    return rest;
  };
  const dataProps = () => {
    const result: Record<string, string | undefined> = {};
    for (const key in props) {
      if (key.startsWith("data-")) {
        result[key] = props[key as `data-${string}`];
      }
    }
    return result;
  };

  const isExpanded = createMemo(() => state.isExpanded(itemContext.node.key));

  const renderChildren = () => {
    if (typeof props.children === "function") {
      return props.children({ isExpanded: isExpanded() });
    }
    return props.children;
  };

  return (
    <Show when={itemContext.isExpandable}>
      <button
        {...cleanExpandProps()}
        {...dataProps()}
        class={props.class ?? "solidaria-Tree-expand-button"}
        style={props.style}
        data-expanded={isExpanded() || undefined}
      >
        {renderChildren()}
      </button>
    </Show>
  );
}

/**
 * A checkbox for item selection in a tree.
 */
export function TreeSelectionCheckbox(props: {
  itemKey: Key;
  class?: string;
  style?: JSX.CSSProperties;
  excludeFromTabOrder?: boolean;
  "aria-label"?: string;
}): JSX.Element {
  const context = useContext(TreeStateContext);
  if (!context) {
    throw new Error("TreeSelectionCheckbox must be used within a Tree");
  }

  const state = context as TreeState<object, TreeCollection<object>>;

  const treeSelectionCheckboxAria = createTreeSelectionCheckbox<object, TreeCollection<object>>(
    () => ({ key: props.itemKey }),
    () => state,
  );

  return (
    <input
      {...treeSelectionCheckboxAria.checkboxProps}
      class={props.class ?? "solidaria-Tree-checkbox"}
      style={props.style}
      tabIndex={props.excludeFromTabOrder ? -1 : undefined}
      aria-label={props["aria-label"] ?? treeSelectionCheckboxAria.checkboxProps["aria-label"]}
    />
  );
}

export function TreeLoadMoreItem(props: TreeLoadMoreItemProps): JSX.Element {
  let sentinelRef: HTMLDivElement | undefined;
  const [isPending, setIsPending] = createSignal(false);
  const isLoading = () =>
    !!props.isLoading ||
    props.loadingState === "loading" ||
    props.loadingState === "loadingMore" ||
    isPending();

  const triggerLoadMore = async () => {
    if (isLoading()) return;
    setIsPending(true);
    try {
      await props.onLoadMore();
    } finally {
      setIsPending(false);
    }
  };

  createEffect(() => {
    if (!sentinelRef || typeof IntersectionObserver !== "function") return;
    const offset = props.scrollOffset ?? 1;
    const margin = `0px 0px ${100 * offset}% 0px`;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void triggerLoadMore();
        }
      },
      { rootMargin: margin },
    );
    observer.observe(sentinelRef);
    return () => observer.disconnect();
  });

  const renderProps = useRenderProps(
    {
      children: props.children ?? (() => (isLoading() ? "Loading more..." : "Load more")),
      class: props.class,
      style: props.style,
      defaultClassName: "solidaria-Tree-loadMore",
    },
    () => ({ isLoading: isLoading() }),
  );

  return (
    <>
      <div style={{ position: "relative", width: 0, height: 0, overflow: "hidden" }} inert>
        <div ref={sentinelRef} style={{ position: "absolute", height: "1px", width: "1px" }} />
      </div>
      <div
        role="row"
        aria-level={props.level ?? 1}
        onFocus={() => {
          void triggerLoadMore();
        }}
        onFocusIn={() => {
          void triggerLoadMore();
        }}
        class={renderProps.class()}
        style={renderProps.style()}
        data-loading={isLoading() || undefined}
        data-level={props.level ?? 1}
      >
        <div
          role="gridcell"
          onFocus={() => {
            void triggerLoadMore();
          }}
        >
          {renderProps.renderChildren()}
        </div>
      </div>
    </>
  );
}

export interface TreeItemContentProps {
  children?: RenderChildren<TreeItemContentRenderProps>;
}
export type TreeItemContentRenderProps = TreeItemRenderProps;

export function TreeItemContent(props: TreeItemContentProps): JSX.Element {
  const context = useContext(TreeItemContentContext);
  if (!context) {
    throw new Error("TreeItemContent must be used within a TreeItem");
  }

  const renderProps = useRenderProps(
    {
      children: props.children,
    },
    () => context,
  );

  return <>{renderProps.renderChildren()}</>;
}

/**
 * A section within a Tree. Renders as `role="rowgroup"` and supplies its
 * optional {@link TreeHeader} with the row/rowheader props that wire up the
 * section's `aria-labelledby` (mirrors upstream `TreeSection`, which reuses
 * `useGridListSection`).
 */
export function TreeSection(props: TreeSectionProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["children", "class", "style", "slot", "ref"]);

  const section = createGridListSection({
    get "aria-label"() {
      return (domProps as { "aria-label"?: string })["aria-label"];
    },
  });

  // Mirror upstream: resolve class/style via renderProps but keep children out
  // of it. The real children must only be evaluated inside the header providers
  // below, otherwise a child <TreeHeader> would be instantiated in this
  // component's owner and read the header contexts as null. The values callback
  // runs during setup, so it must not read `local.children` either; mirror
  // upstream's `values: undefined` with a constant.
  const renderProps = useRenderProps(
    {
      children: undefined,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-TreeSection",
    },
    () => ({ hasChildren: true }),
  );

  const filteredDomProps = createMemo(() => filterDOMProps(domProps, { global: true }));

  return (
    <div
      ref={(el) => assignRef(local.ref, el)}
      {...filteredDomProps()}
      {...section.rowGroupProps}
      class={renderProps.class()}
      style={renderProps.style()}
      slot={local.slot}
      data-section
    >
      <GridListHeaderContext.Provider value={section.rowProps}>
        <GridListHeaderInnerContext.Provider value={section.rowHeaderProps}>
          {local.children}
        </GridListHeaderInnerContext.Provider>
      </GridListHeaderContext.Provider>
    </div>
  );
}

/**
 * The header of a {@link TreeSection}. Mirrors upstream `TreeHeader`, which is a
 * thin wrapper over `GridListHeader` with a Tree-specific class. The row and
 * rowheader semantics come from the enclosing section through context.
 */
export function TreeHeader(props: TreeHeaderProps): JSX.Element {
  return (
    <GridListHeader class="solidaria-TreeHeader" {...props}>
      {props.children}
    </GridListHeader>
  );
}

Tree.Item = TreeItem;
Tree.ExpandButton = TreeExpandButton;
Tree.SelectionCheckbox = TreeSelectionCheckbox;
Tree.LoadMoreItem = TreeLoadMoreItem;
Tree.Section = TreeSection;
Tree.Header = TreeHeader;

function areSetsEqual<T>(a: Set<T>, b: Set<T>): boolean {
  if (a.size !== b.size) return false;
  for (const entry of a) {
    if (!b.has(entry)) return false;
  }
  return true;
}
