/**
 * ListBox component for solidaria-components
 *
 * A pre-wired headless listbox that combines state + aria hooks.
 * Port of react-aria-components/src/ListBox.tsx
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
  createListBox,
  createOption,
  createFocusRing,
  mergeProps,
  type AriaListBoxProps,
  type AriaOptionProps,
} from "@proyecto-viviana/solidaria";
import {
  createListState,
  type ListState,
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
import {
  SelectionIndicatorContext,
  type SelectionIndicatorContextValue,
} from "./SelectionIndicator";
import { useVirtualizerContext } from "./Virtualizer";
import { type DragAndDropHooks } from "./useDragAndDrop";
import {
  getNormalizedDropTargetKey,
  mergePersistedKeysIntoVirtualRange,
  useDndPersistedKeys,
  useRenderDropIndicator,
} from "./DragAndDrop";
import {
  CollectionRendererContext,
  Section,
  Header,
  Group,
  type CollectionEntry,
  type CollectionRendererContextValue,
  type SectionProps,
  useCollectionRenderer,
  isCollectionSection,
  flattenCollectionEntries,
} from "./Collection";

export interface ListBoxRenderProps {
  /** Whether the listbox has focus. */
  isFocused: boolean;
  /** Whether the listbox has keyboard focus. */
  isFocusVisible: boolean;
  /** Whether the listbox is disabled. */
  isDisabled: boolean;
  /** Whether the listbox is empty. */
  isEmpty: boolean;
}

type RefLike<T> = ((el: T) => void) | { current?: T | null } | undefined;

function assignRef<T>(ref: RefLike<T>, el: T): void {
  if (!ref) return;
  if (typeof ref === "function") ref(el);
  else ref.current = el;
}

export interface ListBoxProps<T> extends Omit<AriaListBoxProps, "children">, SlotProps {
  /** The items to render in the listbox. */
  items: CollectionEntry<T>[];
  /** Function to get the key from an item. */
  getKey?: (item: T) => Key;
  /** Function to get the text value from an item. */
  getTextValue?: (item: T) => string;
  /** Function to check if an item is disabled. */
  getDisabled?: (item: T) => boolean;
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
  /** The children of the component. A function may be provided to render each item. */
  children: (item: T) => JSX.Element;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ListBoxRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ListBoxRenderProps>;
  /** A function to render when the listbox is empty. */
  renderEmptyState?: () => JSX.Element;
  /** Whether there are more items to load. */
  hasMore?: boolean;
  /** Whether additional items are currently loading. */
  isLoading?: boolean;
  /** Called when the load more sentinel becomes visible. */
  onLoadMore?: () => void | Promise<void>;
  /** Ref for the listbox element. */
  ref?: RefLike<HTMLUListElement>;
  /** Drag and drop hooks from `useDragAndDrop`. */
  dragAndDropHooks?: DragAndDropHooks<T>;
  /** Layout hint for styling parity. */
  layout?: "stack" | "grid";
  /** Orientation hint for styling parity. */
  orientation?: "vertical" | "horizontal";
  /** Slot definitions provided through ListBoxContext. */
  slots?: Record<string, Partial<ListBoxProps<T>>>;
}

export interface ListBoxOptionRenderProps {
  /** Whether the option is selected. */
  isSelected: boolean;
  /** Whether the option is focused. */
  isFocused: boolean;
  /** Whether the option has keyboard focus. */
  isFocusVisible: boolean;
  /** Whether the option is pressed. */
  isPressed: boolean;
  /** Whether the option is hovered. */
  isHovered: boolean;
  /** Whether the option is disabled. */
  isDisabled: boolean;
}

export interface ListBoxOptionProps<T>
  extends Omit<AriaOptionProps, "children" | "key">, SlotProps {
  /** The unique key for the option. */
  id: Key;
  /** The item value. */
  item?: T;
  /** The children of the option. A function may be provided to receive render props. */
  children?: RenderChildren<ListBoxOptionRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ListBoxOptionRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ListBoxOptionRenderProps>;
  /** The text value of the option (for typeahead). */
  textValue?: string;
  /** Ref for the option element. */
  ref?: RefLike<HTMLLIElement>;
}

export interface ListBoxLoadMoreItemProps extends SlotProps {
  /** Called when the sentinel becomes visible. */
  onLoadMore: () => void | Promise<void>;
  /** Whether additional items are currently loading. */
  isLoading?: boolean;
  /** Scroll offset multiplier for early loading trigger (default: 1 = 100% of viewport height). */
  scrollOffset?: number;
  /** Content for the load more row. */
  children?: JSX.Element;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<{ isLoading: boolean }>;
  /** The inline style for the element. */
  style?: StyleOrFunction<{ isLoading: boolean }>;
}

export interface ListBoxSectionProps extends SectionProps {}

interface ListBoxContextValue<T> {
  state: ListState<T>;
  isDisabled: () => boolean;
  dragAndDropHooks?: DragAndDropHooks<unknown>;
  dragState?: unknown;
  dropState?: unknown;
  slots?: Record<string, Partial<ListBoxProps<T>>>;
}

export const ListBoxContext = createContext<ListBoxContextValue<unknown> | null>(null);
export const ListBoxStateContext = createContext<ListState<unknown> | null>(null);
export const ListStateContext = ListBoxStateContext;

/**
 * A listbox displays a list of options and allows a user to select one or more of them.
 */
export function ListBox<T>(props: ListBoxProps<T>): JSX.Element {
  const parentContext = useContext(ListBoxContext) as ListBoxContextValue<T> | null;
  const contextSlotProps = parentContext?.slots?.[props.slot ?? "default"];
  const mergedListBoxProps = contextSlotProps
    ? (mergeProps(contextSlotProps, props) as ListBoxProps<T>)
    : props;
  const [local, stateProps, ariaProps] = splitProps(
    mergedListBoxProps,
    [
      "children",
      "class",
      "style",
      "slot",
      "renderEmptyState",
      "hasMore",
      "isLoading",
      "onLoadMore",
      "dragAndDropHooks",
      "slots",
      "ref",
    ],
    [
      "items",
      "getKey",
      "getTextValue",
      "getDisabled",
      "disabledKeys",
      "disabledBehavior",
      "selectionMode",
      "selectionBehavior",
      "selectedKeys",
      "defaultSelectedKeys",
      "onSelectionChange",
      "layout",
      "orientation",
    ],
  );

  const flatItems = createMemo<T[]>(() => {
    return flattenCollectionEntries(stateProps.items);
  });

  const hasSections = createMemo(() => stateProps.items.some((item) => isCollectionSection(item)));

  const state = createListState<T>({
    get items() {
      return flatItems();
    },
    get getKey() {
      return stateProps.getKey;
    },
    get getTextValue() {
      return stateProps.getTextValue;
    },
    get getDisabled() {
      return stateProps.getDisabled;
    },
    get disabledKeys() {
      return stateProps.disabledKeys;
    },
    get selectionMode() {
      return stateProps.selectionMode;
    },
    get selectionBehavior() {
      return stateProps.selectionBehavior;
    },
    get disabledBehavior() {
      return stateProps.disabledBehavior;
    },
    get selectedKeys() {
      return stateProps.selectedKeys;
    },
    get defaultSelectedKeys() {
      return stateProps.defaultSelectedKeys;
    },
    get onSelectionChange() {
      return stateProps.onSelectionChange;
    },
  });

  const resolveDisabled = (): boolean => {
    const disabled = ariaProps.isDisabled;
    if (typeof disabled === "function") {
      return (disabled as () => boolean)();
    }
    return !!disabled;
  };

  const listBoxAria = createListBox(
    {
      ...ariaProps,
      get isDisabled() {
        return resolveDisabled();
      },
    },
    state,
  );

  const { isFocused, isFocusVisible, focusProps } = createFocusRing();

  const renderValues = createMemo<ListBoxRenderProps>(() => ({
    isFocused: state.isFocused() || isFocused(),
    isFocusVisible: isFocusVisible(),
    isDisabled: resolveDisabled(),
    isEmpty: state.collection().size === 0,
  }));

  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ListBox",
    },
    renderValues,
  );

  const domProps = createMemo(() => {
    const filtered = filterDOMProps(ariaProps as Record<string, unknown>, { global: true });
    return filtered;
  });

  const cleanListBoxProps = () => {
    const { ref: _ref1, ...rest } = listBoxAria.listBoxProps as Record<string, unknown>;
    return rest;
  };
  const cleanFocusProps = () => {
    const { ref: _ref2, ...rest } = focusProps as Record<string, unknown>;
    return rest;
  };
  const cleanLabelProps = () => {
    const { ref: _ref3, ...rest } = listBoxAria.labelProps as Record<string, unknown>;
    return rest;
  };
  const [listRef, setListRef] = createSignal<HTMLElement | null>(null);

  const isEmpty = () => stateProps.items.length === 0;
  const parentCollectionRenderer = useCollectionRenderer<unknown>();
  const getItemNodes = createMemo(() =>
    Array.from(state.collection()).filter((node) => node.type === "item"),
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
  const dropState = createMemo(() => {
    if (!hasDroppableDnd()) return undefined;
    return local.dragAndDropHooks?.useDroppableCollectionState?.({});
  });
  const hasDraggableDnd = createMemo(() => {
    const hooks = local.dragAndDropHooks;
    return Boolean(hooks?.useDraggableCollectionState && hooks.useDraggableCollection);
  });
  const dragState = createMemo(() => {
    if (!hasDraggableDnd()) return undefined;
    return local.dragAndDropHooks?.useDraggableCollectionState?.({
      items: flatItems(),
    });
  });
  createEffect(() => {
    if (!hasDraggableDnd()) return;
    const hooks = local.dragAndDropHooks;
    const activeDragState = dragState();
    if (!hooks?.useDraggableCollection || !activeDragState) return;
    hooks.useDraggableCollection({}, activeDragState, () => listRef());
  });
  const droppableCollection = createMemo(() => {
    if (!hasDroppableDnd()) return undefined;
    const hooks = local.dragAndDropHooks;
    const activeDropState = dropState();
    if (!hooks?.useDroppableCollection || !activeDropState) return undefined;
    const resolveDirection = (): "ltr" | "rtl" => {
      const el = listRef();
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
            () => state.collection(),
            () => listRef(),
            { layout: "stack", orientation: "vertical", direction: resolveDirection() },
          )
        : undefined);
    if (!dropTargetDelegate) return undefined;
    return hooks.useDroppableCollection(
      {
        dropTargetDelegate,
        keyboardDelegate: {
          getFirstKey: () => state.collection().getFirstKey(),
          getLastKey: () => state.collection().getLastKey(),
          getKeyBelow: (key) => state.collection().getKeyAfter(key),
          getKeyAbove: (key) => state.collection().getKeyBefore(key),
          getKeyPageBelow: (key) => state.collection().getKeyAfter(key),
          getKeyPageAbove: (key) => state.collection().getKeyBefore(key),
        },
      },
      activeDropState,
      () => listRef(),
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
  const virtualizer = useVirtualizerContext();
  const persistedKeys = useDndPersistedKeys(
    { focusedKey: state.focusedKey },
    local.dragAndDropHooks,
    dropState(),
    state.collection(),
  );
  const virtualRange = createMemo(() => {
    if (!virtualizer || !parentCollectionRenderer?.isVirtualized || hasSections()) return null;
    const baseRange = virtualizer.getVisibleRange(stateProps.items.length);
    const itemNodes = getItemNodes();
    const persistedIndexes = Array.from(persistedKeys())
      .map((key) => itemNodes.findIndex((node) => node.key === key))
      .filter((index) => index >= 0);
    const dropTarget = dropState()?.target;
    const normalizedDropKey = getNormalizedDropTargetKey(dropTarget, state.collection());
    const focusedKey = state.focusedKey();
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
    const getItemNodes = () =>
      Array.from(state.collection()).filter((node) => node.type === "item");
    virtualizer.setDropTargetItemCountResolver(() => getItemNodes().length);
    virtualizer.setDropTargetIndexResolver((key) => {
      const index = getItemNodes().findIndex((node) => node.key === key);
      return index >= 0 ? index : null;
    });
    virtualizer.setDropTargetResolver((target) => {
      const node = getItemNodes()[target.index];
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
  const sectionedRenderEntries = createMemo(() => {
    let globalIndex = 0;
    return stateProps.items.map((entry) => {
      if (isCollectionSection(entry)) {
        const sectionItems = entry.items.map((item) => ({
          item,
          index: globalIndex++,
        }));
        return {
          type: "section" as const,
          section: entry,
          items: sectionItems,
        };
      }
      const indexedItem = {
        item: entry as T,
        index: globalIndex++,
      };
      return {
        type: "item" as const,
        item: indexedItem,
      };
    });
  });
  const collectionRenderer = createMemo<CollectionRendererContextValue<unknown>>(() => ({
    ...parentCollectionRenderer,
    renderItem: (item) => local.children(item as T),
    renderDropIndicator: (index, position) =>
      dndDropIndicator(index, position) ??
      parentCollectionRenderer?.renderDropIndicator?.(index, position),
  }));

  return (
    <ListBoxContext.Provider
      value={
        {
          state,
          isDisabled: resolveDisabled,
          dragAndDropHooks: local.dragAndDropHooks as DragAndDropHooks<unknown> | undefined,
          dragState: dragState(),
          dropState: dropState(),
          slots: local.slots,
        } as ListBoxContextValue<unknown>
      }
    >
      <ListBoxStateContext.Provider value={state}>
        <CollectionRendererContext.Provider value={collectionRenderer()}>
          <>
            <Show when={ariaProps.label}>
              <span {...cleanLabelProps()}>{ariaProps.label as JSX.Element}</span>
            </Show>
            <ul
              {...mergeProps(
                domProps(),
                cleanListBoxProps(),
                cleanFocusProps(),
                (droppableCollection()?.collectionProps as Record<string, unknown> | undefined) ??
                  {},
              )}
              ref={(el) => {
                setListRef(el);
                assignRef(local.ref, el);
              }}
              class={renderProps.class()}
              style={renderProps.style()}
              data-focused={state.isFocused() || undefined}
              data-focus-visible={isFocusVisible() || undefined}
              data-disabled={resolveDisabled() || undefined}
              data-empty={isEmpty() || undefined}
              data-layout={stateProps.layout}
              data-orientation={stateProps.orientation}
              data-drop-target={isRootDropTarget() || undefined}
              slot={local.slot}
            >
              <SharedElementTransition>
                {isEmpty() && local.renderEmptyState ? (
                  <li role="option" style={{ display: "contents" }} data-empty-state>
                    {local.renderEmptyState()}
                  </li>
                ) : hasSections() ? (
                  <For each={sectionedRenderEntries()}>
                    {(entry) =>
                      entry.type === "section" ? (
                        <li role="presentation" data-section-wrapper>
                          <Section class="solidaria-ListBox-section">
                            {entry.section.title != null && (
                              <Header class="solidaria-ListBox-sectionHeader">
                                {entry.section.title}
                              </Header>
                            )}
                            <Group class="solidaria-ListBox-sectionGroup">
                              <ul role="group" aria-label={entry.section["aria-label"]}>
                                <For each={entry.items}>
                                  {(indexedItem) => (
                                    <>
                                      {collectionRenderer().renderDropIndicator?.(
                                        indexedItem.index,
                                        "before",
                                      )}
                                      {collectionRenderer().renderDropIndicator?.(
                                        indexedItem.index,
                                        "on",
                                      )}
                                      {local.children(indexedItem.item)}
                                      {collectionRenderer().renderDropIndicator?.(
                                        indexedItem.index,
                                        "after",
                                      )}
                                    </>
                                  )}
                                </For>
                              </ul>
                            </Group>
                          </Section>
                        </li>
                      ) : (
                        <>
                          {collectionRenderer().renderDropIndicator?.(entry.item.index, "before")}
                          {collectionRenderer().renderDropIndicator?.(entry.item.index, "on")}
                          {local.children(entry.item.item)}
                          {collectionRenderer().renderDropIndicator?.(entry.item.index, "after")}
                        </>
                      )
                    }
                  </For>
                ) : (
                  <>
                    {virtualRange()?.offsetTop ? (
                      <li
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
                            {local.children(item as T)}
                            {afterIndicator()}
                          </>
                        );
                      }}
                    </For>
                    {virtualRange()?.offsetBottom ? (
                      <li
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
                <ListBoxLoadMoreItem onLoadMore={local.onLoadMore} isLoading={local.isLoading} />
              )}
            </ul>
          </>
        </CollectionRendererContext.Provider>
      </ListBoxStateContext.Provider>
    </ListBoxContext.Provider>
  );
}

/**
 * An option in a listbox.
 */
export function ListBoxOption<T>(props: ListBoxOptionProps<T>): JSX.Element {
  const [local, ariaProps] = splitProps(props, [
    "class",
    "style",
    "slot",
    "id",
    "item",
    "textValue",
    "ref",
  ]);

  const context = useContext(ListBoxStateContext);
  if (!context) {
    throw new Error("ListBoxOption must be used within a ListBox");
  }
  const state = context as ListState<T>;
  const listContext = useContext(ListBoxContext) as ListBoxContextValue<T> | null;
  const [ref, setRef] = createSignal<HTMLLIElement | null>(null);

  const optionAria = createOption<T>(
    {
      key: local.id,
      get isDisabled() {
        return Boolean(ariaProps.isDisabled || listContext?.isDisabled());
      },
      get "aria-label"() {
        return ariaProps["aria-label"] ?? local.textValue;
      },
      get shouldSelectOnPressUp() {
        return ariaProps.shouldSelectOnPressUp;
      },
      get shouldFocusOnHover() {
        return ariaProps.shouldFocusOnHover;
      },
      get onHoverStart() {
        return ariaProps.onHoverStart;
      },
      get onHoverEnd() {
        return ariaProps.onHoverEnd;
      },
      get onHoverChange() {
        return ariaProps.onHoverChange;
      },
    },
    state,
  );

  const renderValues = createMemo<ListBoxOptionRenderProps>(() => ({
    isSelected: optionAria.isSelected(),
    isFocused: optionAria.isFocused(),
    isFocusVisible: optionAria.isFocusVisible(),
    isPressed: optionAria.isPressed(),
    isHovered: optionAria.isHovered(),
    isDisabled: optionAria.isDisabled(),
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ListBox-option",
    },
    renderValues,
  );
  const hasPrimitiveLabel = () => {
    return typeof props.children === "string" || typeof props.children === "number";
  };

  const selectionIndicatorContext = createMemo<SelectionIndicatorContextValue>(() => ({
    isSelected: optionAria.isSelected,
  }));
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

  const cleanOptionProps = () => {
    const {
      ref: _ref1,
      "aria-describedby": _ariaDescribedby,
      ...rest
    } = optionAria.optionProps as Record<string, unknown>;
    if (!hasPrimitiveLabel() && rest["aria-label"] == null) {
      delete rest["aria-labelledby"];
    }
    return rest;
  };
  const domProps = () => filterDOMProps(ariaProps as Record<string, unknown>, { global: true });

  return (
    <SelectionIndicatorContext.Provider value={selectionIndicatorContext()}>
      <li
        ref={(el) => {
          setRef(el);
          assignRef(local.ref, el);
        }}
        {...mergeProps(
          domProps(),
          cleanOptionProps(),
          (draggableItem()?.dragProps as Record<string, unknown> | undefined) ?? {},
          (droppableItem()?.dropProps as Record<string, unknown> | undefined) ?? {},
        )}
        class={renderProps.class()}
        style={renderProps.style()}
        data-selected={optionAria.isSelected() || undefined}
        data-focused={optionAria.isFocused() || undefined}
        data-focus-visible={optionAria.isFocusVisible() || undefined}
        data-pressed={optionAria.isPressed() || undefined}
        data-hovered={optionAria.isHovered() || undefined}
        data-disabled={optionAria.isDisabled() || undefined}
        data-dragging={draggableItem()?.isDragging || undefined}
        data-drop-target={droppableItem()?.isDropTarget || undefined}
        slot={local.slot}
      >
        {hasPrimitiveLabel() ? (
          <span {...optionAria.labelProps}>{renderProps.renderChildren()}</span>
        ) : (
          renderProps.renderChildren()
        )}
      </li>
    </SelectionIndicatorContext.Provider>
  );
}

/**
 * Load more sentinel item for listbox collections.
 */
export function ListBoxLoadMoreItem(props: ListBoxLoadMoreItemProps): JSX.Element {
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
      defaultClassName: "solidaria-ListBox-loadMore",
    },
    () => ({ isLoading: isLoading() }),
  );

  return (
    <>
      <li style={{ position: "relative", width: 0, height: 0, overflow: "hidden" }} inert>
        <div ref={sentinelRef} style={{ position: "absolute", height: "1px", width: "1px" }} />
      </li>
      <li
        role="option"
        aria-disabled={true}
        tabIndex={0}
        onFocus={() => {
          void triggerLoadMore();
        }}
        class={renderProps.class()}
        style={renderProps.style()}
        data-loading={isLoading() || undefined}
      >
        {renderProps.renderChildren()}
      </li>
    </>
  );
}

/**
 * Section primitive alias for ListBox composition parity.
 */
export function ListBoxSection(props: ListBoxSectionProps): JSX.Element {
  return <Section {...props} />;
}

ListBox.Option = ListBoxOption;
ListBox.LoadMoreItem = ListBoxLoadMoreItem;
