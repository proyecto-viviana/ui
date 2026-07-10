/**
 * Drag and drop compatibility hook for collection components.
 *
 * Mirrors RAC's `useDragAndDrop` shape while delegating to Solid
 * state and aria primitives.
 */

import type { Accessor, JSX } from "solid-js";
import { DragPreview } from "./DragPreview";
import { ListDropTargetDelegate } from "./ListDropTargetDelegate";
import {
  createDraggableCollection,
  createDraggableItem,
  createDroppableCollection,
  createDroppableItem,
  getGlobalDraggingCollectionRef,
  getGlobalDraggingKeys,
  type DraggableCollectionOptions,
  type DraggableCollectionAria,
  type DraggableItemOptions,
  type DraggableItemAria,
  type DroppableCollectionOptions,
  type DroppableCollectionAria,
  type DroppableItemOptions,
  type DroppableItemAria,
  type DropTargetDelegate as AriaDropTargetDelegate,
} from "@proyecto-viviana/solidaria";
import {
  createDraggableCollectionState,
  createDroppableCollectionState,
  type DragItem,
  type DragPreviewRenderer,
  type DraggableCollectionProps,
  type DraggableCollectionState,
  type DraggableCollectionStateOptions,
  type DropTarget,
  type DroppableCollectionProps,
  type DroppableCollectionState,
  type DroppableCollectionStateOptions,
} from "@proyecto-viviana/solid-stately";

interface DraggableCollectionStateOpts<T = object> extends Omit<
  DraggableCollectionStateOptions<T>,
  "getItems"
> {
  items?: T[];
}

interface DragHooks<T = object> {
  useDraggableCollectionState?: (
    props: DraggableCollectionStateOpts<T>,
  ) => DraggableCollectionState;
  useDraggableCollection?: (
    props: Omit<DraggableCollectionOptions, "ref">,
    state: DraggableCollectionState,
    ref: Accessor<HTMLElement | null>,
  ) => DraggableCollectionAria;
  useDraggableItem?: (
    props: DraggableItemOptions,
    state: DraggableCollectionState,
  ) => DraggableItemAria;
  DragPreview?: typeof DragPreview;
  renderDragPreview?: DragAndDropOptions<T>["renderDragPreview"];
  isVirtualDragging?: () => boolean;
}

interface DropHooks {
  useDroppableCollectionState?: (
    props: DroppableCollectionStateOptions,
  ) => DroppableCollectionState;
  useDroppableCollection?: (
    props: Omit<DroppableCollectionOptions, "ref">,
    state: DroppableCollectionState,
    ref: Accessor<HTMLElement | null>,
  ) => DroppableCollectionAria;
  useDroppableItem?: (
    options: Omit<DroppableItemOptions, "ref">,
    state: DroppableCollectionState,
    ref: Accessor<HTMLElement | null>,
  ) => DroppableItemAria;
  useDropIndicator?: (
    props: { target: DropTarget },
    state: DroppableCollectionState,
    ref: Accessor<HTMLElement | null>,
  ) => {
    dropIndicatorProps: JSX.HTMLAttributes<HTMLElement>;
    isDropTarget: boolean;
    isHidden: boolean;
  };
  renderDropIndicator?: (target: DropTarget) => JSX.Element;
  dropTargetDelegate?: AriaDropTargetDelegate;
  ListDropTargetDelegate?: typeof ListDropTargetDelegate;
}

export type DragAndDropHooks<T = object> = DragHooks<T> & DropHooks;

export interface DragAndDrop<T = object> {
  /** Drag and drop hooks for the collection element. */
  dragAndDropHooks: DragAndDropHooks<T>;
}

export interface DragAndDropOptions<T = object>
  extends Partial<Omit<DraggableCollectionProps<T>, "preview">>, Partial<DroppableCollectionProps> {
  /**
   * Optional keyboard delegate forwarded to the collection droppable hook.
   */
  keyboardDelegate?: DroppableCollectionOptions["keyboardDelegate"];
  /**
   * Optional keydown handler composed with collection droppable keyboard behavior.
   */
  onKeyDown?: DroppableCollectionOptions["onKeyDown"];
  /**
   * A function that returns the items being dragged.
   * If omitted, draggable hooks are not added.
   */
  getItems?: (keys: Set<string | number>, items: T[]) => DragItem[];
  /**
   * Optional custom drag preview renderer.
   */
  renderDragPreview?: (
    items: DragItem[],
  ) => JSX.Element | { element: JSX.Element; x: number; y: number };
  /**
   * Optional drop indicator renderer for collection components.
   */
  renderDropIndicator?: (target: DropTarget) => JSX.Element;
  /**
   * Optional custom drop target delegate.
   */
  dropTargetDelegate?: AriaDropTargetDelegate;
  /**
   * Optional drag preview ref.
   */
  preview?: { current: DragPreviewRenderer | null };
  /**
   * Optional item snapshot used by draggable state `getItems`.
   */
  items?: T[];
  /**
   * Disable both drag and drop behavior.
   */
  isDisabled?: boolean;
}

/**
 * Provides hooks to enable drag-and-drop behavior for collection components.
 */
export function useDragAndDrop<T = object>(options: DragAndDropOptions<T> = {}): DragAndDrop<T> {
  const {
    getItems,
    onDrop,
    onInsert,
    onItemDrop,
    onReorder,
    onMove,
    onRootDrop,
    renderDragPreview,
    renderDropIndicator,
    dropTargetDelegate,
  } = options;

  const isDraggable = typeof getItems === "function";
  const isDroppable = Boolean(
    onDrop || onInsert || onItemDrop || onReorder || onMove || onRootDrop,
  );

  const hooks: DragAndDropHooks<T> = {};
  const hasDom = typeof HTMLElement !== "undefined";
  const isElementNode = (value: unknown): value is HTMLElement => {
    if (!value) return false;
    if (hasDom && value instanceof HTMLElement) return true;
    return typeof value === "object" && (value as { nodeType?: number }).nodeType === 1;
  };
  const resolvedPreview =
    options.preview ??
    (renderDragPreview
      ? {
          current: (
            items: DragItem[],
            callback: (node: HTMLElement | null, x?: number, y?: number) => void,
          ) => {
            const rendered = renderDragPreview(items);
            if (!rendered) {
              callback(null);
              return;
            }
            if (typeof rendered === "object" && rendered !== null && "element" in rendered) {
              const previewValue = rendered as { element: unknown; x?: number; y?: number };
              callback(
                isElementNode(previewValue.element) ? previewValue.element : null,
                previewValue.x,
                previewValue.y,
              );
              return;
            }
            callback(isElementNode(rendered) ? rendered : null);
          },
        }
      : undefined);

  if (isDraggable && getItems) {
    hooks.useDraggableCollectionState = (props: DraggableCollectionStateOpts<T>) => {
      return createDraggableCollectionState<T>(() => ({
        onDragStart: options.onDragStart ?? props.onDragStart,
        onDragMove: options.onDragMove ?? props.onDragMove,
        onDragEnd: options.onDragEnd ?? props.onDragEnd,
        getAllowedDropOperations:
          options.getAllowedDropOperations ?? props.getAllowedDropOperations,
        isDisabled: options.isDisabled ?? props.isDisabled,
        preview: resolvedPreview ?? props.preview,
        getItems: (keys) => {
          const sourceItems = props.items ?? options.items ?? [];
          return getItems(keys, sourceItems);
        },
      }));
    };
    hooks.useDraggableCollection = (
      props: Omit<DraggableCollectionOptions, "ref">,
      state: DraggableCollectionState,
      ref: Accessor<HTMLElement | null>,
    ) => createDraggableCollection({ ...props, ref }, state);
    hooks.useDraggableItem = (props, state) => createDraggableItem(() => props, state);
    hooks.DragPreview = DragPreview;
    hooks.renderDragPreview = renderDragPreview;
    hooks.isVirtualDragging = () =>
      getGlobalDraggingCollectionRef() != null || getGlobalDraggingKeys().size > 0;
  }

  if (isDroppable) {
    hooks.useDroppableCollectionState = (props: DroppableCollectionStateOptions) => {
      return createDroppableCollectionState(() => ({
        acceptedDragTypes: options.acceptedDragTypes ?? props.acceptedDragTypes,
        getDropOperation: options.getDropOperation ?? props.getDropOperation,
        onDropEnter: options.onDropEnter ?? props.onDropEnter,
        onDropActivate: options.onDropActivate ?? props.onDropActivate,
        onDropExit: options.onDropExit ?? props.onDropExit,
        onDrop: options.onDrop ?? props.onDrop,
        onInsert: options.onInsert ?? props.onInsert,
        onRootDrop: options.onRootDrop ?? props.onRootDrop,
        onItemDrop: options.onItemDrop ?? props.onItemDrop,
        onReorder: options.onReorder ?? props.onReorder,
        onMove: options.onMove ?? props.onMove,
        shouldAcceptItemDrop: options.shouldAcceptItemDrop ?? props.shouldAcceptItemDrop,
        isDisabled: options.isDisabled ?? props.isDisabled,
      }));
    };
    hooks.useDroppableCollection = (
      props: Omit<DroppableCollectionOptions, "ref">,
      state: DroppableCollectionState,
      ref: Accessor<HTMLElement | null>,
    ) => {
      const acceptedDragTypes = options.acceptedDragTypes ?? props.acceptedDragTypes;
      const normalizedAcceptedDragTypes =
        acceptedDragTypes === "all"
          ? "all"
          : acceptedDragTypes?.filter(
              (type): type is string | symbol =>
                typeof type === "string" || typeof type === "symbol",
            );
      return createDroppableCollection(
        () => ({
          ref,
          dropTargetDelegate: options.dropTargetDelegate ?? props.dropTargetDelegate,
          keyboardDelegate: options.keyboardDelegate ?? props.keyboardDelegate,
          // Host collection + selection/focus setters, forwarded so keyboard
          // drop-target navigation and post-drop focus restoration work.
          collection: props.collection,
          selectedKeys: props.selectedKeys,
          setSelectedKeys: props.setSelectedKeys,
          setFocusedKey: props.setFocusedKey,
          onKeyDown: options.onKeyDown ?? props.onKeyDown,
          acceptedDragTypes: normalizedAcceptedDragTypes,
          isDisabled: options.isDisabled ?? props.isDisabled,
          onDropActivate: (e) => {
            (options.onDropActivate ?? props.onDropActivate)?.({
              type: "dropactivate",
              target: e.target,
              x: e.x,
              y: e.y,
            });
          },
          onDrop: (e) => {
            (options.onDrop ?? props.onDrop)?.({
              type: "drop",
              target: e.target,
              x: e.x,
              y: e.y,
              items: e.items,
              dropOperation: e.dropOperation,
            });
          },
          onRootDrop: options.onRootDrop ?? props.onRootDrop,
          onItemDrop: (e) => {
            if (e.target.type === "item") {
              (options.onItemDrop ?? props.onItemDrop)?.({
                items: e.items,
                target: e.target,
                dropOperation: e.dropOperation,
                isInternal: e.isInternal,
              });
            }
          },
          onInsert: (e) => {
            if (e.target.type === "item") {
              (options.onInsert ?? props.onInsert)?.({
                items: e.items,
                target: e.target,
                dropOperation: e.dropOperation,
              });
            }
          },
          onReorder: (e) => {
            if (e.target.type === "item") {
              (options.onReorder ?? props.onReorder)?.({
                keys: e.keys,
                target: e.target,
                dropOperation: e.dropOperation,
              });
            }
          },
          onMove: (e) => {
            if (e.target.type === "item") {
              (options.onMove ?? props.onMove)?.({
                keys: e.keys,
                target: e.target,
                dropOperation: e.dropOperation,
              });
            }
          },
        }),
        state,
      );
    };
    hooks.useDroppableItem = (
      props: Omit<DroppableItemOptions, "ref">,
      state: DroppableCollectionState,
      ref: Accessor<HTMLElement | null>,
    ) => createDroppableItem(() => ({ ...props, ref }), state);
    hooks.useDropIndicator = (
      props: { target: DropTarget },
      state: DroppableCollectionState,
      _ref: Accessor<HTMLElement | null>,
    ) => {
      const target = props.target;
      const activeTarget = state.target;
      const isDropTarget =
        activeTarget?.type === target.type &&
        (target.type === "root" ||
          (activeTarget.type === "item" &&
            target.type === "item" &&
            activeTarget.key === target.key &&
            activeTarget.dropPosition === target.dropPosition));
      return {
        dropIndicatorProps: {
          role: "option",
          "aria-disabled": true,
          "aria-hidden": isDropTarget ? undefined : "true",
          tabIndex: -1,
          "data-drop-target": isDropTarget ? "" : undefined,
        },
        isDropTarget,
        isHidden: !isDropTarget,
      };
    };
    hooks.renderDropIndicator = renderDropIndicator;
    hooks.dropTargetDelegate = dropTargetDelegate;
    hooks.ListDropTargetDelegate = ListDropTargetDelegate;
  }

  return {
    dragAndDropHooks: hooks,
  };
}
