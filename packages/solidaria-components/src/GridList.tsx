/**
 * GridList component for solidaria-components
 *
 * A pre-wired headless grid list that combines state + aria hooks.
 * Based on react-aria-components/src/GridList.tsx
 *
 * GridList is similar to ListBox but supports interactive elements within items
 * and uses grid keyboard navigation.
 */

import {
  type JSX,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  splitProps,
  useContext,
  For,
  Show,
} from "solid-js";
import {
  createGridList,
  createGridListItem,
  createGridListSelectionCheckbox,
  createFocusRing,
  createHover,
  mergeProps,
  type AriaGridListProps,
} from "@proyecto-viviana/solidaria";
import {
  createGridState,
  type GridState,
  type GridCollection,
  type GridNode,
  type Key,
  type DropTarget,
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
  CollectionRendererContext,
  type CollectionRendererContextValue,
  Section,
  type SectionProps,
  useCollectionRenderer,
} from "./Collection";
import { useVirtualizerContext } from "./Virtualizer";
import {
  getNormalizedDropTargetKey,
  mergePersistedKeysIntoVirtualRange,
  useDndPersistedKeys,
  useRenderDropIndicator,
} from "./DragAndDrop";

type RefLike<T> = ((el: T) => void) | { current?: T | null } | undefined;

function assignRef<T>(ref: RefLike<T>, el: T): void {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(el);
  } else {
    ref.current = el;
  }
}

export interface GridListRenderProps {
  /** Whether the grid list has focus. */
  isFocused: boolean;
  /** Whether the grid list has keyboard focus. */
  isFocusVisible: boolean;
  /** Whether the grid list is disabled. */
  isDisabled: boolean;
  /** Whether the grid list is empty. */
  isEmpty: boolean;
}

export interface GridListProps<T extends object>
  extends Omit<AriaGridListProps, "children">, SlotProps {
  /** The items to render in the grid list. */
  items: T[];
  /** Function to get the key from an item. */
  getKey?: (item: T) => Key;
  /** Function to get the text value from an item. */
  getTextValue?: (item: T) => string;
  /** Function to check if an item is disabled. */
  getDisabled?: (item: T) => boolean;
  /** The selection mode. */
  selectionMode?: "none" | "single" | "multiple";
  /** How selection should behave when pressing an item. */
  selectionBehavior?: "replace" | "toggle";
  /** Keys of disabled items. */
  disabledKeys?: Iterable<Key>;
  /** Currently selected keys (controlled). */
  selectedKeys?: "all" | Iterable<Key>;
  /** Default selected keys (uncontrolled). */
  defaultSelectedKeys?: "all" | Iterable<Key>;
  /** Handler called when selection changes. */
  onSelectionChange?: (keys: "all" | Set<Key>) => void;
  /** The children of the component. A function may be provided to render each item. */
  children: (item: T) => JSX.Element;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<GridListRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<GridListRenderProps>;
  /** Ref for the grid list root element. */
  ref?: RefLike<HTMLDivElement>;
  /** A function to render when the grid list is empty. */
  renderEmptyState?: () => JSX.Element;
  /** Whether there are more items to load. */
  hasMore?: boolean;
  /** Whether additional items are currently loading. */
  isLoading?: boolean;
  /** Called when the load more sentinel becomes visible. */
  onLoadMore?: () => void | Promise<void>;
  /** Drag and drop hooks from `useDragAndDrop`. */
  dragAndDropHooks?: DragAndDropHooks<T>;
}

export interface GridListItemRenderProps {
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
  /** The grid list selection mode. */
  selectionMode: "none" | "single" | "multiple";
  /** How selection behaves when pressing an item. */
  selectionBehavior: "replace" | "toggle";
}

export interface GridListItemProps<T extends object>
  extends
    SlotProps,
    Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "style" | "children" | "id" | "ref"> {
  /** The unique key for the item. */
  id: Key;
  /** The item value. */
  item?: T;
  /** The children of the item. A function may be provided to receive render props. */
  children?: RenderChildren<GridListItemRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<GridListItemRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<GridListItemRenderProps>;
  /** The text value of the item (for accessibility). */
  textValue?: string;
  /** Handler called when the item is activated. */
  onAction?: () => void;
  /** Ref for the rendered row element. */
  ref?: RefLike<HTMLDivElement>;
}

export interface GridListLoadMoreItemProps extends SlotProps {
  onLoadMore: () => void | Promise<void>;
  isLoading?: boolean;
  /** Scroll offset multiplier for early loading trigger (default: 1 = 100% of viewport height). */
  scrollOffset?: number;
  children?: JSX.Element;
  class?: ClassNameOrFunction<{ isLoading: boolean }>;
  style?: StyleOrFunction<{ isLoading: boolean }>;
}

export interface GridListSectionProps extends SectionProps {}
export interface GridListHeaderProps extends SlotProps {
  children?: JSX.Element;
  class?: string;
  style?: JSX.CSSProperties;
}

interface GridListContextValue<T extends object> {
  state: GridState<T, GridCollection<T>>;
  collection: GridCollection<T>;
  isDisabled: boolean;
  selectionBehavior: "replace" | "toggle";
  dragAndDropHooks?: DragAndDropHooks<T>;
  dragState?: unknown;
  dropState?: unknown;
}

export const GridListContext = createContext<GridListContextValue<object> | null>(null);
export const GridListStateContext = createContext<GridState<object, GridCollection<object>> | null>(
  null,
);
export const GridListHeaderContext = createContext<null>(null);

function buildGridCollection<T extends object>(
  items: T[],
  getKey?: (item: T) => Key,
  getTextValue?: (item: T) => string,
  getDisabled?: (item: T) => boolean,
): GridCollection<T> {
  const nodes: GridNode<T>[] = items.map((item, index) => {
    const key = getKey?.(item) ?? index;
    return {
      type: "item" as const,
      key,
      value: item,
      textValue: getTextValue?.(item) ?? String(key),
      level: 0,
      index,
      hasChildNodes: false,
      childNodes: [],
      isDisabled: getDisabled?.(item),
    };
  });

  const keyMap = new Map<Key, GridNode<T>>();
  nodes.forEach((node) => keyMap.set(node.key, node));

  return {
    rows: nodes,
    columns: [],
    headerRows: [],
    get rowCount() {
      return nodes.length;
    },
    get columnCount() {
      return 1;
    },
    get size() {
      return nodes.length;
    },
    getKeys() {
      return nodes.map((n) => n.key);
    },
    getItem(key: Key) {
      return keyMap.get(key) ?? null;
    },
    at(index: number) {
      return nodes[index] ?? null;
    },
    getKeyBefore(key: Key) {
      const node = keyMap.get(key);
      if (!node) return null;
      return node.index > 0 ? nodes[node.index - 1].key : null;
    },
    getKeyAfter(key: Key) {
      const node = keyMap.get(key);
      if (!node) return null;
      return node.index < nodes.length - 1 ? nodes[node.index + 1].key : null;
    },
    getFirstKey() {
      return nodes[0]?.key ?? null;
    },
    getLastKey() {
      return nodes[nodes.length - 1]?.key ?? null;
    },
    getChildren(_key: Key) {
      return [];
    },
    getTextValue(key: Key) {
      return keyMap.get(key)?.textValue ?? "";
    },
    getCell(_rowKey: Key, _columnKey: Key) {
      return null;
    },
    [Symbol.iterator]() {
      return nodes[Symbol.iterator]();
    },
  };
}

/**
 * A grid list displays a list of interactive items, with support for
 * keyboard navigation, single or multiple selection, and row actions.
 */
export function GridList<T extends object>(props: GridListProps<T>): JSX.Element {
  const [local, stateProps, ariaProps] = splitProps(
    props,
    [
      "children",
      "class",
      "style",
      "ref",
      "slot",
      "renderEmptyState",
      "hasMore",
      "isLoading",
      "onLoadMore",
      "dragAndDropHooks",
    ],
    [
      "items",
      "getKey",
      "getTextValue",
      "getDisabled",
      "disabledKeys",
      "selectionMode",
      "selectedKeys",
      "defaultSelectedKeys",
      "onSelectionChange",
      "selectionBehavior",
    ],
  );

  const [ref, setRef] = createSignal<HTMLDivElement | null>(null);

  const collection = createMemo(() =>
    buildGridCollection(
      stateProps.items,
      stateProps.getKey,
      stateProps.getTextValue,
      stateProps.getDisabled,
    ),
  );

  const allDisabledKeys = createMemo(() => {
    const keys = new Set<Key>();

    if (stateProps.disabledKeys) {
      for (const key of stateProps.disabledKeys) {
        keys.add(key);
      }
    }

    for (const node of collection().rows) {
      if (node.isDisabled) {
        keys.add(node.key);
      }
    }

    return keys;
  });

  const state = createGridState<T, GridCollection<T>>(() => ({
    collection: collection(),
    disabledKeys: allDisabledKeys(),
    selectionMode: stateProps.selectionMode,
    selectionBehavior: stateProps.selectionBehavior,
    selectedKeys: stateProps.selectedKeys,
    defaultSelectedKeys: stateProps.defaultSelectedKeys,
    onSelectionChange: stateProps.onSelectionChange,
  }));

  const { gridProps } = createGridList<T, GridCollection<T>>(
    () => ({
      id: ariaProps.id,
      "aria-label": ariaProps["aria-label"],
      "aria-labelledby": ariaProps["aria-labelledby"],
      "aria-describedby": ariaProps["aria-describedby"],
      isVirtualized: ariaProps.isVirtualized,
      onAction: ariaProps.onAction,
      isDisabled: ariaProps.isDisabled,
      selectionBehavior: stateProps.selectionBehavior,
    }),
    () => state,
    ref,
  );

  const { isFocused, isFocusVisible, focusProps } = createFocusRing();

  const renderValues = createMemo<GridListRenderProps>(() => ({
    isFocused: state.isFocused || isFocused(),
    isFocusVisible: isFocusVisible(),
    isDisabled: ariaProps.isDisabled ?? false,
    isEmpty: stateProps.items.length === 0,
  }));

  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-GridList",
    },
    renderValues,
  );

  const domProps = createMemo(() => {
    const filtered = filterDOMProps(ariaProps as Record<string, unknown>, { global: true });
    return filtered;
  });

  const cleanGridProps = () => {
    const { ref: _ref1, ...rest } = gridProps as Record<string, unknown>;
    return rest;
  };
  const cleanFocusProps = () => {
    const { ref: _ref2, ...rest } = focusProps as Record<string, unknown>;
    return rest;
  };

  const isEmpty = () => stateProps.items.length === 0;
  const virtualizer = useVirtualizerContext();
  const parentCollectionRenderer = useCollectionRenderer<T>();
  const getItemNodes = createMemo(() =>
    Array.from(state.collection).filter((node) => node.type === "item"),
  );
  const getDropTargetByIndex = (
    index: number,
    position: "before" | "after" | "on",
  ): DropTarget | null => {
    const node = getItemNodes()[index];
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
      items: stateProps.items,
    });
  });
  const dropState = createMemo(() => {
    if (!hasDroppableDnd()) return undefined;
    return local.dragAndDropHooks?.useDroppableCollectionState?.({});
  });
  createEffect(() => {
    if (!hasDraggableDnd()) return;
    const hooks = local.dragAndDropHooks;
    const activeDragState = dragState();
    if (!hooks?.useDraggableCollection || !activeDragState) return;
    hooks.useDraggableCollection({}, activeDragState, () => ref());
  });
  const droppableCollection = createMemo(() => {
    if (!hasDroppableDnd()) return undefined;
    const hooks = local.dragAndDropHooks;
    const activeDropState = dropState();
    if (!hooks?.useDroppableCollection || !activeDropState) return undefined;
    const resolveDirection = (): "ltr" | "rtl" => {
      const el = ref();
      if (el && typeof window !== "undefined" && typeof window.getComputedStyle === "function") {
        const dir = window.getComputedStyle(el).direction;
        if (dir === "rtl") return "rtl";
      }
      return typeof document !== "undefined" && document.dir === "rtl" ? "rtl" : "ltr";
    };
    const dropTargetDelegate =
      hooks.dropTargetDelegate ??
      parentCollectionRenderer?.dropTargetDelegate ??
      (hooks.ListDropTargetDelegate
        ? new hooks.ListDropTargetDelegate(
            () => state.collection,
            () => ref(),
            { layout: "grid", orientation: "vertical", direction: resolveDirection() },
          )
        : undefined);
    if (!dropTargetDelegate) return undefined;
    return hooks.useDroppableCollection(
      {
        dropTargetDelegate,
        keyboardDelegate: {
          getFirstKey: () => state.collection.getFirstKey?.() ?? null,
          getLastKey: () => state.collection.getLastKey?.() ?? null,
          getKeyBelow: (key) => state.collection.getKeyAfter?.(key) ?? null,
          getKeyAbove: (key) => state.collection.getKeyBefore?.(key) ?? null,
          getKeyLeftOf: (key) =>
            resolveDirection() === "rtl"
              ? (state.collection.getKeyAfter?.(key) ?? null)
              : (state.collection.getKeyBefore?.(key) ?? null),
          getKeyRightOf: (key) =>
            resolveDirection() === "rtl"
              ? (state.collection.getKeyBefore?.(key) ?? null)
              : (state.collection.getKeyAfter?.(key) ?? null),
          getKeyPageBelow: (key) => state.collection.getKeyAfter?.(key) ?? null,
          getKeyPageAbove: (key) => state.collection.getKeyBefore?.(key) ?? null,
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
    const baseRange = virtualizer.getVisibleRange(stateProps.items.length);
    const itemNodes = getItemNodes();
    const persistedIndexes = Array.from(persistedKeys())
      .map((key) => itemNodes.findIndex((node) => node.key === key))
      .filter((index) => index >= 0);
    const dropTarget = dropState()?.target;
    const normalizedDropKey = getNormalizedDropTargetKey(dropTarget, state.collection);
    const focusedKey = state.focusedKey;
    const focusedIndex =
      focusedKey != null ? itemNodes.findIndex((node) => node.key === focusedKey) : -1;
    const forceIncludeIndexes = [
      dropTarget?.type === "item" ? itemNodes.findIndex((node) => node.key === dropTarget.key) : -1,
      normalizedDropKey != null
        ? itemNodes.findIndex((node) => node.key === normalizedDropKey)
        : -1,
      dropTarget?.type === "item" ? -1 : focusedIndex,
    ].filter((index) => index >= 0);
    return mergePersistedKeysIntoVirtualRange(
      baseRange,
      persistedIndexes,
      stateProps.items.length,
      virtualizer,
      80,
      {
        forceIncludeIndexes,
        forceIncludeMaxSpan: 320,
      },
    );
  });
  createEffect(() => {
    if (!virtualizer || !parentCollectionRenderer?.isVirtualized) return;
    virtualizer.setDropTargetItemCountResolver(() => state.collection.size);
    virtualizer.setDropTargetIndexResolver((key) => {
      const entries = Array.from(state.collection);
      const index = entries.findIndex((node) => node.key === key);
      return index >= 0 ? index : null;
    });
    virtualizer.setDropTargetResolver((target) => {
      const node = Array.from(state.collection)[target.index];
      if (!node) return target;
      return {
        ...target,
        key: typeof node.key === "string" || typeof node.key === "number" ? node.key : undefined,
      };
    });
    onCleanup(() => {
      virtualizer.setDropTargetIndexResolver(undefined);
      virtualizer.setDropTargetItemCountResolver(undefined);
      virtualizer.setDropTargetResolver(undefined);
    });
  });
  const visibleItems = createMemo(() => {
    const range = virtualRange();
    if (!range) return stateProps.items;
    return stateProps.items.slice(range.start, range.end);
  });

  const contextValue = createMemo<GridListContextValue<T>>(() => ({
    state,
    collection: collection(),
    isDisabled: ariaProps.isDisabled ?? false,
    selectionBehavior: stateProps.selectionBehavior ?? "replace",
    dragAndDropHooks: local.dragAndDropHooks,
    dragState: dragState(),
    dropState: dropState(),
  }));
  const collectionRenderer = createMemo<CollectionRendererContextValue<unknown>>(() => ({
    ...parentCollectionRenderer,
    renderItem: (item) => props.children(item as T),
    renderDropIndicator: (index: number, position: "before" | "after" | "on") =>
      dndDropIndicator(index, position) ??
      parentCollectionRenderer?.renderDropIndicator?.(index, position),
  }));

  return (
    <GridListContext.Provider value={contextValue() as unknown as GridListContextValue<object>}>
      <GridListStateContext.Provider
        value={state as unknown as GridState<object, GridCollection<object>>}
      >
        <CollectionRendererContext.Provider value={collectionRenderer()}>
          <div
            ref={(element) => {
              setRef(element);
              assignRef(local.ref, element);
            }}
            {...mergeProps(
              domProps(),
              cleanGridProps(),
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
          >
            <SharedElementTransition>
              {isEmpty() && local.renderEmptyState ? (
                local.renderEmptyState()
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
                  <For each={visibleItems()}>
                    {(item, index) => {
                      const itemIndex = () => (virtualRange()?.start ?? 0) + index();
                      const beforeIndicator = () =>
                        collectionRenderer().renderDropIndicator?.(itemIndex(), "before");
                      const onIndicator = () =>
                        collectionRenderer().renderDropIndicator?.(itemIndex(), "on");
                      const afterIndicator = () =>
                        collectionRenderer().renderDropIndicator?.(itemIndex(), "after");
                      return (
                        <>
                          {beforeIndicator()}
                          {onIndicator()}
                          {props.children(item)}
                          {afterIndicator()}
                        </>
                      );
                    }}
                  </For>
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
              <GridListLoadMoreItem onLoadMore={local.onLoadMore} isLoading={local.isLoading} />
            )}
          </div>
        </CollectionRendererContext.Provider>
      </GridListStateContext.Provider>
    </GridListContext.Provider>
  );
}

/**
 * An item in a grid list.
 */
export function GridListItem<T extends object>(props: GridListItemProps<T>): JSX.Element {
  const [local, domProps] = splitProps(props, [
    "class",
    "style",
    "slot",
    "id",
    "item",
    "textValue",
    "onAction",
    "children",
    "ref",
  ]);

  const context = useContext(GridListStateContext);
  if (!context) {
    throw new Error("GridListItem must be used within a GridList");
  }
  const state = context as GridState<T, GridCollection<T>>;
  const listContext = useContext(GridListContext) as GridListContextValue<T> | null;

  const [ref, setRef] = createSignal<HTMLDivElement | null>(null);

  const itemNode = createMemo(() => {
    const node = state.collection.getItem(local.id);
    if (!node) {
      return {
        type: "item" as const,
        key: local.id,
        value: local.item ?? null,
        textValue: local.textValue ?? String(local.id),
        level: 0,
        index: 0,
        hasChildNodes: false,
        childNodes: [],
      } as GridNode<T>;
    }
    return node as GridNode<T>;
  });

  const itemAria = createGridListItem<T, GridCollection<T>>(
    () => ({
      node: itemNode(),
      onAction: local.onAction,
      selectionBehavior: listContext?.selectionBehavior ?? "replace",
    }),
    () => state,
    ref,
  );
  const isSelected = () => itemAria.isSelected;
  const isDisabled = () => itemAria.isDisabled;
  const isPressed = () => itemAria.isPressed;

  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return isDisabled();
    },
  });

  const { isFocusVisible, focusProps } = createFocusRing();

  const isFocused = createMemo(() => state.focusedKey === local.id);
  const draggableItem = createMemo(() => {
    if (!listContext?.dragAndDropHooks?.useDraggableItem || !listContext.dragState)
      return undefined;
    return listContext.dragAndDropHooks.useDraggableItem(
      {
        key: local.id as string | number,
      },
      listContext.dragState as Parameters<NonNullable<DragAndDropHooks<T>["useDraggableItem"]>>[1],
    );
  });
  const droppableItem = createMemo(() => {
    if (!listContext?.dragAndDropHooks?.useDroppableItem || !listContext.dropState)
      return undefined;
    return listContext.dragAndDropHooks.useDroppableItem(
      {
        key: local.id as string | number,
      },
      listContext.dropState as Parameters<NonNullable<DragAndDropHooks<T>["useDroppableItem"]>>[1],
      () => ref(),
    );
  });

  const renderValues = createMemo<GridListItemRenderProps>(() => ({
    isSelected: isSelected(),
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible() && isFocused(),
    isPressed: isPressed(),
    isHovered: isHovered(),
    isDisabled: isDisabled(),
    selectionMode: state.selectionMode,
    selectionBehavior: listContext?.selectionBehavior ?? "replace",
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-GridList-item",
    },
    renderValues,
  );

  const cleanRowProps = () => {
    const { ref: _ref1, ...rest } = itemAria.rowProps as Record<string, unknown>;
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

  return (
    <div
      ref={(element) => {
        setRef(element);
        assignRef(local.ref, element);
      }}
      {...domProps}
      {...mergeProps(
        cleanRowProps(),
        cleanHoverProps(),
        cleanFocusProps(),
        (draggableItem()?.dragProps as Record<string, unknown> | undefined) ?? {},
        (droppableItem()?.dropProps as Record<string, unknown> | undefined) ?? {},
      )}
      class={renderProps.class()}
      style={renderProps.style()}
      data-selected={isSelected() || undefined}
      data-focused={isFocused() || undefined}
      data-focus-visible={(isFocusVisible() && isFocused()) || undefined}
      data-pressed={isPressed() || undefined}
      data-hovered={isHovered() || undefined}
      data-disabled={isDisabled() || undefined}
      data-dragging={draggableItem()?.isDragging || undefined}
      data-drop-target={droppableItem()?.isDropTarget || undefined}
    >
      <div {...itemAria.gridCellProps}>{renderProps.renderChildren()}</div>
    </div>
  );
}

/**
 * A checkbox for item selection in a grid list.
 */
export function GridListSelectionCheckbox(props: {
  itemKey: Key;
  class?: string;
  style?: JSX.CSSProperties;
  excludeFromTabOrder?: boolean;
  "aria-label"?: string;
}): JSX.Element {
  const context = useContext(GridListStateContext);
  if (!context) {
    throw new Error("GridListSelectionCheckbox must be used within a GridList");
  }

  const state = context as GridState<object, GridCollection<object>>;

  const checkboxAria = createGridListSelectionCheckbox<object, GridCollection<object>>(
    () => ({ key: props.itemKey }),
    () => state,
  );

  return (
    <input
      {...checkboxAria.checkboxProps}
      class={props.class}
      style={props.style}
      tabIndex={props.excludeFromTabOrder ? -1 : undefined}
      aria-label={props["aria-label"] ?? "Select"}
    />
  );
}

export function GridListLoadMoreItem(props: GridListLoadMoreItemProps): JSX.Element {
  let sentinelRef: HTMLDivElement | undefined;
  const [isPending, setIsPending] = createSignal(false);
  const isLoading = () => !!props.isLoading || isPending();

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
      defaultClassName: "solidaria-GridList-loadMore",
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
        tabIndex={0}
        onFocus={() => {
          void triggerLoadMore();
        }}
        class={renderProps.class()}
        style={renderProps.style()}
        data-loading={isLoading() || undefined}
      >
        {renderProps.renderChildren()}
      </div>
    </>
  );
}

export function GridListHeader(props: GridListHeaderProps): JSX.Element {
  return (
    <div class={props.class ?? "solidaria-GridListHeader"} style={props.style}>
      {props.children}
    </div>
  );
}

/**
 * Section primitive alias for GridList composition parity.
 */
export function GridListSection(props: GridListSectionProps): JSX.Element {
  return <Section {...props} />;
}

GridList.Item = GridListItem;
GridList.SelectionCheckbox = GridListSelectionCheckbox;
GridList.LoadMoreItem = GridListLoadMoreItem;
