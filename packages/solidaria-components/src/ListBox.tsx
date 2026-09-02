/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria-components/src/ListBox.tsx

/**
 * ListBox component for solidaria-components
 *
 * A pre-wired headless listbox that combines state + aria hooks.
 * Solid adaptation of the pinned ListBox component.
 */

import {
  type JSX,
  createContext,
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
  on,
  onCleanup,
  splitProps,
  untrack,
  useContext,
  For,
  Show,
  type Context,
  type Accessor,
} from "solid-js";
import {
  createListBox,
  createOption,
  createFocusRing,
  createScrollIntoViewOnFocus,
  createStringFormatter,
  dndIntlStrings,
  mergeProps,
  moveVirtualFocus,
  useLocale,
  FOCUS_EVENT,
  CLEAR_FOCUS_EVENT,
  type AriaListBoxProps,
  type AriaOptionProps,
} from "@proyecto-viviana/solidaria";
import {
  createListState,
  createFilteredListState,
  type ListState,
  type ListFilterFn,
  type Key,
  type DropTarget,
  type DroppableCollectionState,
  type Collection,
} from "@proyecto-viviana/solid-stately";
import { useAutocompleteCollection } from "./Autocomplete";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  DEFAULT_SLOT,
  OptionContent,
  Provider,
  useRenderProps,
  filterDOMProps,
} from "./utils";
import { TextContext } from "./Text";
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
  DropIndicatorContext,
  type DropIndicatorProps,
} from "./DragAndDrop";
import type { ItemDropTarget } from "@proyecto-viviana/solid-stately";
import {
  CollectionRendererContext,
  Section,
  Header,
  Group,
  type CollectionEntry,
  type CollectionRendererContextValue,
  type SectionProps,
  useCollectionRenderer,
  useCollectionRoot,
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
  ref?: RefLike<HTMLDivElement>;
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
  ref?: RefLike<HTMLDivElement>;
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

function dropIndicatorLabel(
  target: ItemDropTarget,
  collection: Collection<unknown>,
  format: (
    key: "dropOnItem" | "insertBetween" | "insertAfter" | "insertBefore",
    args?: Record<string, string>,
  ) => string,
): string {
  const getText = (key: Key | null): string => {
    if (key == null) return "";
    return collection.getTextValue(key) ?? collection.getItem(key)?.textValue ?? "";
  };
  if (target.dropPosition === "on") {
    return format("dropOnItem", { itemText: getText(target.key) });
  }
  let before: Key | null;
  let after: Key | null;
  if (target.dropPosition === "before") {
    const prevKey = collection.getKeyBefore(target.key);
    const prevNode = prevKey != null ? collection.getItem(prevKey) : null;
    before = prevNode?.type === "item" ? prevNode.key : null;
  } else {
    before = target.key;
  }
  if (target.dropPosition === "after") {
    const nextKey = collection.getKeyAfter(target.key);
    const nextNode = nextKey != null ? collection.getItem(nextKey) : null;
    after = nextNode?.type === "item" ? nextNode.key : null;
  } else {
    after = target.key;
  }
  if (before != null && after != null) {
    return format("insertBetween", {
      beforeItemText: getText(before),
      afterItemText: getText(after),
    });
  }
  if (before != null) {
    return format("insertAfter", { itemText: getText(before) });
  }
  if (after != null) {
    return format("insertBefore", { itemText: getText(after) });
  }
  return "";
}

/**
 * RAC `ListBox.tsx:662-717` `ListBoxDropIndicatorWrapper` — a stable module-level
 * component so Solid does not remount (and unregister) the indicator on every
 * parent ListBox re-render. `useDropIndicator` owns register + focus
 * (`useDroppableItem.ts:49-88`).
 */
function ListBoxDropIndicatorWrapper(props: DropIndicatorProps): JSX.Element {
  const listContext = useContext(ListBoxContext);
  const listState = useContext(ListBoxStateContext);
  const [el, setEl] = createSignal<HTMLDivElement | null>(null);
  const dndFormatter = createStringFormatter(dndIntlStrings);
  const dropState = listContext?.dropState as DroppableCollectionState | undefined;
  const indicator = listContext?.dragAndDropHooks?.useDropIndicator?.(
    { target: props.target },
    dropState as DroppableCollectionState,
    el,
  );

  return (
    <Show when={indicator && !indicator.isHidden}>
      <div
        {...indicator?.dropIndicatorProps}
        ref={setEl}
        role="option"
        class="solidaria-DropIndicator"
        aria-label={
          listState
            ? dropIndicatorLabel(props.target, listState.collection(), (key, args) =>
                dndFormatter().format(key, args),
              )
            : undefined
        }
        data-drop-target={indicator?.isDropTarget || undefined}
      />
    </Show>
  );
}

/**
 * Owns only the collection item. Drop-indicator siblings live in their own
 * components so their tracking cannot remount this node.
 *
 * Comparison hyperscript children (`hc` thunks) are one-shot: if the fragment
 * insert that owns the option also tracks indicator `Show`, the effect
 * re-runs, disposes the option, and Chromium maps focus to
 * `listbox:Permissions`. RAC `ListBoxItem` stays mounted while Collection
 * inserts indicator siblings (`react-aria-components/src/ListBox.tsx`).
 */
function ListBoxRenderedItem<T>(props: {
  item: T;
  renderItem: (item: T) => JSX.Element;
}): JSX.Element {
  // Comparison `hc` returns a one-shot thunk. Solid's insert treats a function
  // child as an accessor and will call it again when a sibling indicator
  // invalidates. Instantiate once under this owner so the option node stays.
  const child = untrack(() => {
    const rendered = props.renderItem(props.item);
    return typeof rendered === "function" ? (rendered as () => JSX.Element)() : rendered;
  });
  return child as JSX.Element;
}

function ListBoxDropIndicatorSlot(props: {
  itemIndex: number | Accessor<number>;
  position: "before" | "after" | "on";
  renderDropIndicator?: (
    index: number,
    position: "before" | "after" | "on",
  ) => JSX.Element | undefined;
}): JSX.Element {
  const itemIndex = () =>
    typeof props.itemIndex === "function" ? props.itemIndex() : props.itemIndex;
  return <>{props.renderDropIndicator?.(itemIndex(), props.position)}</>;
}

/**
 * Stable per-item row so drop-indicator mount does not remount the option.
 */
function ListBoxItemWithDropIndicators<T>(props: {
  item: T;
  itemIndex: number | Accessor<number>;
  renderItem: (item: T) => JSX.Element;
  renderDropIndicator?: (
    index: number,
    position: "before" | "after" | "on",
  ) => JSX.Element | undefined;
}): JSX.Element {
  return (
    <>
      <ListBoxDropIndicatorSlot
        itemIndex={props.itemIndex}
        position="before"
        renderDropIndicator={props.renderDropIndicator}
      />
      <ListBoxDropIndicatorSlot
        itemIndex={props.itemIndex}
        position="on"
        renderDropIndicator={props.renderDropIndicator}
      />
      <ListBoxRenderedItem item={props.item} renderItem={props.renderItem} />
      <ListBoxDropIndicatorSlot
        itemIndex={props.itemIndex}
        position="after"
        renderDropIndicator={props.renderDropIndicator}
      />
    </>
  );
}

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

  const baseState = createListState<T>({
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

  // When this ListBox is the collection of an Autocomplete, the input and the
  // collection are separate components bridged by context. The collection's
  // state is filtered by the input's predicate (mirrors RAC's
  // UNSTABLE_useFilteredListState), and virtual focus is driven across the
  // component boundary by synthetic DOM events (see the bridge effects below).
  // ComboBox/Picker never provide this context, so their createListBox path is
  // untouched.
  const autocompleteCtx = useAutocompleteCollection();
  const state = autocompleteCtx
    ? createFilteredListState<T>(
        baseState,
        () => autocompleteCtx.filter as ListFilterFn<T> | undefined,
      )
    : baseState;

  const resolveDisabled = (): boolean => {
    const disabled = ariaProps.isDisabled;
    if (typeof disabled === "function") {
      return (disabled as () => boolean)();
    }
    return !!disabled;
  };

  const locale = useLocale();
  // A parent Virtualizer publishes `isVirtualized` through the collection
  // renderer context; the base ListBox forwards it into createListBox so each
  // option emits aria-posinset/aria-setsize for the windowed (incomplete) DOM.
  const parentCollectionRenderer = useCollectionRenderer<unknown>();
  const listBoxAria = createListBox(
    {
      ...ariaProps,
      get isVirtualized() {
        return parentCollectionRenderer?.isVirtualized ?? ariaProps.isVirtualized;
      },
      // Under Autocomplete, the input owns the collection's id (its
      // aria-controls target), accessible name, and virtual-focus/type-ahead
      // config; prefer the bridged values over any locally-passed props.
      get id() {
        return autocompleteCtx?.collectionProps.id ?? (ariaProps as { id?: string }).id;
      },
      get "aria-label"() {
        return autocompleteCtx?.collectionProps["aria-label"] ?? ariaProps["aria-label"];
      },
      get shouldUseVirtualFocus() {
        return (
          autocompleteCtx?.collectionProps.shouldUseVirtualFocus ?? ariaProps.shouldUseVirtualFocus
        );
      },
      get disallowTypeAhead() {
        return autocompleteCtx?.collectionProps.disallowTypeAhead ?? ariaProps.disallowTypeAhead;
      },
      get isDisabled() {
        return resolveDisabled();
      },
      get orientation() {
        return stateProps.orientation ?? "vertical";
      },
      get direction() {
        return locale().direction;
      },
    },
    state,
    () => listRef(),
  );

  const { isFocused, isFocusVisible, focusProps } = createFocusRing();

  const renderValues = createMemo<ListBoxRenderProps>(() => ({
    // RAC ListBox.tsx:366-414: `data-focused` / render-prop `isFocused` come from
    // `useFocusRing` on the listbox element, not collection focus. Virtual focus
    // (ComboBox) leaves the listbox itself unfocused.
    isFocused: isFocused(),
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

  // Reveal the activedescendant-focused option on keyboard navigation. The
  // listbox keeps real DOM focus on itself, so the browser won't natively scroll
  // an off-screen focused option into view the way roving tabindex would.
  createScrollIntoViewOnFocus({
    focusedKey: () => state.focusedKey(),
    isActive: () => state.isFocused(),
    ref: () => listRef(),
  });

  // Autocomplete bridge. The shared selectable collection owns keyboard
  // navigation and collection focus. This component keeps the Solid DOM handoff
  // that mirrors the focused key to the input's active descendant. Ticket #100
  // tracks moving the remaining virtual-focus work into the shared item layer.
  if (autocompleteCtx) {
    // Forward path: the input dispatches FOCUS_EVENT/CLEAR_FOCUS_EVENT onto the
    // collection element. FOCUS_EVENT marks the collection focused (and, when the
    // user types forward, requests the first item). The shared collection handles
    // the re-dispatched keyboard event.
    let shouldVirtualFocusFirst = false;
    createEffect(() => {
      const list = listRef();
      if (!list) return;
      const onFocusEvent = (e: Event) => {
        const detail = (e as CustomEvent).detail;
        e.stopPropagation();
        state.setFocused(true);
        if (detail?.focusStrategy === "first") {
          shouldVirtualFocusFirst = true;
        }
      };
      const onClearFocusEvent = (e: Event) => {
        e.stopPropagation();
        state.setFocused(false);
        if ((e as CustomEvent).detail?.clearFocusKey) {
          state.setFocusedKey(null);
        }
      };
      list.addEventListener(FOCUS_EVENT, onFocusEvent);
      list.addEventListener(CLEAR_FOCUS_EVENT, onClearFocusEvent);
      onCleanup(() => {
        list.removeEventListener(FOCUS_EVENT, onFocusEvent);
        list.removeEventListener(CLEAR_FOCUS_EVENT, onClearFocusEvent);
      });
    });

    // Focus the first item once the (filtered) collection settles after the user
    // types forward. If nothing survives the filter, clear the input's active
    // descendant by moving virtual focus onto the collection itself (its focusin
    // reaches the input's clear branch). Mirrors useSelectableCollection.
    createEffect(
      on(
        () => [state.collection().getFirstKey?.() ?? null, state.collection().size] as const,
        ([firstKey, size]) => {
          if (!shouldVirtualFocusFirst) return;
          if (firstKey == null) {
            const list = listRef();
            if (list) moveVirtualFocus(list);
            if (size > 0) shouldVirtualFocusFirst = false;
          } else {
            state.setFocusedKey(firstKey);
            shouldVirtualFocusFirst = false;
          }
        },
        { defer: true },
      ),
    );

    // Reverse path: mirror the focused key onto the option's DOM element via a
    // synthetic, bubbling focusin (moveVirtualFocus). The input's focusin listener
    // reads target.id into its aria-activedescendant. Option ids are String(key)
    // in this path (createOption). Real DOM focus stays on the input.
    createEffect(() => {
      const key = state.focusedKey();
      const list = listRef();
      if (!list || !state.isFocused()) return;
      if (key == null) return;
      const el = list.ownerDocument.getElementById(String(key));
      if (el) moveVirtualFocus(el);
    });
  }

  const isEmpty = () => stateProps.items.length === 0;
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
    const resolveDirection = (): "ltr" | "rtl" => locale().direction;
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
        // The real collection drives keyboard drop-target navigation
        // (`navigate()` walks getKeyAfter/getKeyBefore) and post-drop focus
        // restoration. Reading it here re-registers the drop target when the
        // collection changes (mirrors upstream keying its effect on the state).
        get collection() {
          return state.collection();
        },
        get selectedKeys() {
          return state.selectionManager.selectedKeys;
        },
        setSelectedKeys: (keys) => state.selectionManager.setSelectedKeys(keys),
        setFocusedKey: (key) => state.setFocusedKey(key),
        setFocused: (isFocused) => state.setFocused(isFocused),
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
  // Stable callback so `For` item templates do not track drop-indicator
  // reactivity (that remounts the option). The row component reads this.
  const renderItemDropIndicator = (index: number, position: "before" | "after" | "on") =>
    dndDropIndicator(index, position) ??
    parentCollectionRenderer?.renderDropIndicator?.(index, position);

  const dropIndicatorContextValue = {
    render: (p: DropIndicatorProps) => <ListBoxDropIndicatorWrapper {...p} />,
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
  const CollectionRoot = useCollectionRoot();

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
          <DropIndicatorContext.Provider value={dropIndicatorContextValue}>
            <>
              <Show when={ariaProps.label}>
                <span {...cleanLabelProps()}>{ariaProps.label as JSX.Element}</span>
              </Show>
              <div
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
                  autocompleteCtx?.collectionRef(el);
                }}
                class={renderProps.class()}
                style={renderProps.style()}
                data-focused={isFocused() || undefined}
                data-focus-visible={isFocusVisible() || undefined}
                data-disabled={resolveDisabled() || undefined}
                data-empty={isEmpty() || undefined}
                data-layout={stateProps.layout || "stack"}
                data-orientation={stateProps.orientation || "vertical"}
                data-drop-target={isRootDropTarget() || undefined}
                slot={local.slot}
              >
                <SharedElementTransition>
                  {parentCollectionRenderer?.isVirtualized ? (
                    <>
                      <CollectionRoot
                        collection={virtualRange() ? stateProps.items : []}
                        scrollRef={() => listRef()}
                        persistedKeys={persistedKeys()}
                      >
                        {isEmpty() && local.renderEmptyState ? null : hasSections() ? (
                          <For each={sectionedRenderEntries()}>
                            {(entry) =>
                              entry.type === "section" ? (
                                <div role="presentation" data-section-wrapper>
                                  <Section class="solidaria-ListBox-section">
                                    {entry.section.title != null && (
                                      <Header class="solidaria-ListBox-sectionHeader">
                                        {entry.section.title}
                                      </Header>
                                    )}
                                    <Group class="solidaria-ListBox-sectionGroup">
                                      <div role="group" aria-label={entry.section["aria-label"]}>
                                        <For each={entry.items}>
                                          {(indexedItem) => (
                                            <ListBoxItemWithDropIndicators
                                              item={indexedItem.item}
                                              itemIndex={indexedItem.index}
                                              renderItem={local.children}
                                              renderDropIndicator={renderItemDropIndicator}
                                            />
                                          )}
                                        </For>
                                      </div>
                                    </Group>
                                  </Section>
                                </div>
                              ) : (
                                <ListBoxItemWithDropIndicators
                                  item={entry.item.item}
                                  itemIndex={entry.item.index}
                                  renderItem={local.children}
                                  renderDropIndicator={renderItemDropIndicator}
                                />
                              )
                            }
                          </For>
                        ) : (
                          <For each={visibleItems()}>
                            {(item, index) => (
                              <ListBoxItemWithDropIndicators
                                item={item as T}
                                itemIndex={() => (virtualRange()?.start ?? 0) + index()}
                                renderItem={local.children}
                                renderDropIndicator={renderItemDropIndicator}
                              />
                            )}
                          </For>
                        )}
                      </CollectionRoot>
                      {isEmpty() && local.renderEmptyState ? (
                        <div role="option" style={{ display: "contents" }} data-empty-state>
                          {local.renderEmptyState()}
                        </div>
                      ) : null}
                    </>
                  ) : isEmpty() && local.renderEmptyState ? (
                    <div role="option" style={{ display: "contents" }} data-empty-state>
                      {local.renderEmptyState()}
                    </div>
                  ) : hasSections() ? (
                    <For each={sectionedRenderEntries()}>
                      {(entry) =>
                        entry.type === "section" ? (
                          <div role="presentation" data-section-wrapper>
                            <Section class="solidaria-ListBox-section">
                              {entry.section.title != null && (
                                <Header class="solidaria-ListBox-sectionHeader">
                                  {entry.section.title}
                                </Header>
                              )}
                              <Group class="solidaria-ListBox-sectionGroup">
                                <div role="group" aria-label={entry.section["aria-label"]}>
                                  <For each={entry.items}>
                                    {(indexedItem) => (
                                      <ListBoxItemWithDropIndicators
                                        item={indexedItem.item}
                                        itemIndex={indexedItem.index}
                                        renderItem={local.children}
                                        renderDropIndicator={renderItemDropIndicator}
                                      />
                                    )}
                                  </For>
                                </div>
                              </Group>
                            </Section>
                          </div>
                        ) : (
                          <ListBoxItemWithDropIndicators
                            item={entry.item.item}
                            itemIndex={entry.item.index}
                            renderItem={local.children}
                            renderDropIndicator={renderItemDropIndicator}
                          />
                        )
                      }
                    </For>
                  ) : (
                    <>
                      <For each={visibleItems()}>
                        {(item, index) => (
                          <ListBoxItemWithDropIndicators
                            item={item as T}
                            itemIndex={() => (virtualRange()?.start ?? 0) + index()}
                            renderItem={local.children}
                            renderDropIndicator={renderItemDropIndicator}
                          />
                        )}
                      </For>
                    </>
                  )}
                </SharedElementTransition>
                {local.hasMore && local.onLoadMore && (
                  <ListBoxLoadMoreItem onLoadMore={local.onLoadMore} isLoading={local.isLoading} />
                )}
              </div>
            </>
          </DropIndicatorContext.Provider>
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
  const [ref, setRef] = createSignal<HTMLDivElement | null>(null);

  const optionAria = createOption<T>(
    {
      key: local.id,
      get isDisabled() {
        return Boolean(ariaProps.isDisabled || listContext?.isDisabled());
      },
      get "aria-label"() {
        return ariaProps["aria-label"];
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
    ref,
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
      get children() {
        return props.children;
      },
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ListBox-option",
    },
    renderValues,
  );

  const selectionIndicatorContext = createMemo<SelectionIndicatorContextValue>(() => ({
    isSelected: optionAria.isSelected,
  }));
  const draggableItem = createMemo(() => {
    if (!listContext?.dragAndDropHooks?.useDraggableItem || !listContext.dragState)
      return undefined;
    return listContext.dragAndDropHooks.useDraggableItem(
      {
        key: local.id as string | number,
        // Surfaces the drag-affordance description (aria-describedby) only for
        // selectable collections, mirroring upstream useDraggableItem.
        selectionMode: state.selectionManager.selectionMode,
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
    const { ref: _ref1, ...rest } = optionAria.optionProps as Record<string, unknown>;
    return rest;
  };

  const optionTextSlots = {
    slots: {
      get [DEFAULT_SLOT]() {
        return optionAria.labelProps;
      },
      get label() {
        return optionAria.labelProps;
      },
      get description() {
        return optionAria.descriptionProps;
      },
    },
  };

  // Styled hosts (S2 ComboBoxItem / PickerItem) emit `<span slot="label">` rather
  // than `<Text>`. Stamp the slot id onto that node before `createSlotId` probes
  // the DOM, matching RAC TextContext + useSlotId.
  createRenderEffect(() => {
    const el = ref();
    const labelId = optionAria.labelProps.id;
    const descriptionId = optionAria.descriptionProps.id;
    if (!el) return;
    if (labelId) {
      const label = el.querySelector("[slot='label']");
      if (label && !label.id) label.id = labelId;
    }
    if (descriptionId) {
      const description = el.querySelector("[slot='description']");
      if (description && !description.id) description.id = descriptionId;
    }
  });
  const domProps = () => filterDOMProps(ariaProps as Record<string, unknown>, { global: true });

  const selectionMode = () => state.selectionMode();

  return (
    <SelectionIndicatorContext.Provider value={selectionIndicatorContext()}>
      <div
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
        data-selection-mode={selectionMode() === "none" ? undefined : selectionMode()}
        slot={local.slot}
      >
        <Provider values={[[TextContext, optionTextSlots] as [Context<unknown>, unknown]]}>
          <OptionContent render={renderProps.renderChildren} labelProps={optionAria.labelProps} />
        </Provider>
      </div>
    </SelectionIndicatorContext.Provider>
  );
}

/**
 * Load more sentinel item for listbox collections.
 */
export function ListBoxLoadMoreItem(props: ListBoxLoadMoreItemProps): JSX.Element {
  let sentinelRef: HTMLDivElement | undefined;
  const setSentinelRef = (element: HTMLDivElement) => {
    sentinelRef = element;
  };
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
      get children() {
        return props.children ?? (() => (isLoading() ? "Loading more..." : "Load more"));
      },
      class: props.class,
      style: props.style,
      defaultClassName: "solidaria-ListBox-loadMore",
    },
    () => ({ isLoading: isLoading() }),
  );

  return (
    <>
      <div style={{ position: "relative", width: 0, height: 0, overflow: "hidden" }} inert>
        <div ref={setSentinelRef} style={{ position: "absolute", height: "1px", width: "1px" }} />
      </div>
      <div
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
      </div>
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
