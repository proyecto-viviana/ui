/**
 * State management for list-like components.
 * Combines collection and selection state.
 * Based on @react-stately/list.
 */

import { createMemo, createEffect, untrack, type Accessor } from "solid-js";
import { access, type MaybeAccessor } from "../utils";
import { ListCollection } from "./ListCollection";
import type { SelectionState, SelectionPressEvent } from "./createSelectionState";
import { createMultipleSelectionState } from "../selection/createMultipleSelectionState";
import { SelectionManager } from "../selection/SelectionManager";
import type {
  Collection,
  CollectionItemLike,
  CollectionNode,
  DisabledBehavior,
  FocusStrategy,
  Key,
  SelectionBehavior,
  SelectionMode,
} from "./types";

export interface ListStateProps<T = unknown> {
  /** The items in the list (for dynamic rendering). */
  items?: T[];
  /** Function to get a key from an item. */
  getKey?: (item: T) => Key;
  /** Function to get text value from an item. */
  getTextValue?: (item: T) => string;
  /** Function to check if an item is disabled. */
  getDisabled?: (item: T) => boolean;
  /** Keys of disabled items. */
  disabledKeys?: Iterable<Key>;
  /** How disabled keys behave. */
  disabledBehavior?: DisabledBehavior;
  /** The selection mode. */
  selectionMode?: SelectionMode;
  /** How selection behaves on interaction. */
  selectionBehavior?: SelectionBehavior;
  /** Whether empty selection is disallowed. */
  disallowEmptySelection?: boolean;
  /** Currently selected keys (controlled). */
  selectedKeys?: "all" | Iterable<Key>;
  /** Default selected keys (uncontrolled). */
  defaultSelectedKeys?: "all" | Iterable<Key>;
  /** Handler for selection changes. */
  onSelectionChange?: (keys: "all" | Set<Key>) => void;
  /** Whether to allow duplicate selection events. */
  allowDuplicateSelectionEvents?: boolean;
}

export interface ListState<T = unknown> extends SelectionState {
  /** The collection of items. */
  readonly collection: Accessor<Collection<T>>;
  /** The collection-aware selection manager (single source of truth for selection). */
  readonly selectionManager: SelectionManager<T>;
  /** Whether the collection is focused. */
  readonly isFocused: Accessor<boolean>;
  /** Set the focused state. */
  setFocused(isFocused: boolean): void;
  /** The currently focused key. */
  readonly focusedKey: Accessor<Key | null>;
  /** Set the focused key. */
  setFocusedKey(key: Key | null, childStrategy?: FocusStrategy): void;
  /** The child focus strategy. */
  readonly childFocusStrategy: Accessor<FocusStrategy | null>;
}

/**
 * Creates state for a list component with selection.
 */
export function createListState<T = unknown>(
  props: MaybeAccessor<ListStateProps<T>>,
): ListState<T> {
  const getProps = () => access(props);

  // Build collection from items (memoized to avoid rebuilding on every access)
  const collection: Accessor<Collection<T>> = createMemo(() => {
    const p = getProps();
    const items = p.items ?? [];

    const nodes: CollectionNode<T>[] = items.map((item, index) => {
      const o = item as CollectionItemLike;
      const key = p.getKey?.(item) ?? o.key ?? o.id ?? index;
      const textValue = p.getTextValue?.(item) ?? o.textValue ?? o.label ?? String(item);
      const isDisabled = p.getDisabled?.(item) ?? o.isDisabled ?? false;

      return {
        type: "item" as const,
        key,
        value: item,
        textValue,
        rendered: null!,
        level: 0,
        index,
        parentKey: null,
        hasChildNodes: false,
        childNodes: [],
        isDisabled,
      };
    });

    return new ListCollection(nodes);
  });

  // Combine disabled keys from props and items (memoized)
  const combinedDisabledKeys = createMemo((): Iterable<Key> => {
    const p = getProps();
    const propsDisabled = p.disabledKeys ? [...p.disabledKeys] : [];
    const itemDisabled: Key[] = [];

    const coll = collection();
    for (const node of coll) {
      if (node.isDisabled) {
        itemDisabled.push(node.key);
      }
    }

    return [...new Set([...propsDisabled, ...itemDisabled])];
  });

  // Raw selection + focus state (the lower layer). This owns the selected keys,
  // focus, selection behavior, and disabled keys, but is not collection-aware.
  const state = createMultipleSelectionState({
    get selectionMode() {
      return getProps().selectionMode;
    },
    get selectionBehavior() {
      return getProps().selectionBehavior;
    },
    get disallowEmptySelection() {
      return getProps().disallowEmptySelection;
    },
    get selectedKeys() {
      return getProps().selectedKeys;
    },
    get defaultSelectedKeys() {
      return getProps().defaultSelectedKeys;
    },
    get onSelectionChange() {
      return getProps().onSelectionChange;
    },
    get disabledKeys() {
      return combinedDisabledKeys();
    },
    get disabledBehavior() {
      return getProps().disabledBehavior;
    },
    get allowDuplicateSelectionEvents() {
      return getProps().allowDuplicateSelectionEvents;
    },
  });

  // The collection-aware selection manager (the upper layer): the single source
  // of truth for every selection operation. It reads the collection live so it
  // stays reactive as the collection memo recomputes.
  const selectionManager = new SelectionManager<T>(() => collection(), state);

  return {
    collection,
    selectionManager,

    // Focus — delegate to the raw state (the single source of truth). The
    // setter routes through the manager so it inherits the existence guard and
    // the upstream 'first' child-focus default.
    isFocused: () => state.isFocused,
    setFocused: (isFocused: boolean) => state.setFocused(isFocused),
    focusedKey: () => state.focusedKey,
    setFocusedKey: (key: Key | null, childStrategy?: FocusStrategy) =>
      selectionManager.setFocusedKey(key, childStrategy),
    childFocusStrategy: () => state.childFocusStrategy,

    // Flattened selection surface — delegates to the manager so the list path
    // shares one faithful engine. extendSelection keeps its legacy second
    // argument for back-compat, but ignores it (the manager reads the
    // collection itself).
    selectionMode: () => selectionManager.selectionMode,
    selectionBehavior: () => selectionManager.selectionBehavior,
    disallowEmptySelection: () => selectionManager.disallowEmptySelection,
    selectedKeys: () => state.selectedKeys,
    disabledKeys: () => selectionManager.disabledKeys,
    disabledBehavior: () => selectionManager.disabledBehavior,
    isEmpty: () => selectionManager.isEmpty,
    isSelectAll: () => selectionManager.isSelectAll,
    isSelected: (key: Key) => selectionManager.isSelected(key),
    isDisabled: (key: Key) => selectionManager.isDisabled(key),
    setSelectionBehavior: (behavior: SelectionBehavior) =>
      selectionManager.setSelectionBehavior(behavior),
    toggleSelection: (key: Key) => selectionManager.toggleSelection(key),
    replaceSelection: (key: Key) => selectionManager.replaceSelection(key),
    setSelectedKeys: (keys: Iterable<Key>) => selectionManager.setSelectedKeys(keys),
    selectAll: () => selectionManager.selectAll(),
    clearSelection: () => selectionManager.clearSelection(),
    toggleSelectAll: () => selectionManager.toggleSelectAll(),
    extendSelection: (toKey: Key, _collection?: Collection) =>
      selectionManager.extendSelection(toKey),
    select: (key: Key, e?: SelectionPressEvent) => selectionManager.select(key, e),
  };
}

/** A collection filter predicate: `(nodeTextValue, node) => keep`. */
export type ListFilterFn<T = unknown> = (nodeValue: string, node: CollectionNode<T>) => boolean;

/**
 * Wraps a {@link ListState} so its collection is filtered by `filterFn`, returning
 * a new (reactive) ListState. Mirrors @react-stately's `UNSTABLE_useFilteredListState`
 * (used by Autocomplete): the filter re-runs as the predicate — which typically
 * closes over the current input value — or the base collection changes; a single
 * stable, collection-aware manager reads the narrowed collection live and shares
 * the base selection/focus state; and the focused key is reset to the nearest
 * surviving item when the current one is filtered out.
 */
export function createFilteredListState<T = unknown>(
  state: ListState<T>,
  filterFn: Accessor<ListFilterFn<T> | null | undefined>,
): ListState<T> {
  const collection: Accessor<Collection<T>> = createMemo(() => {
    const fn = filterFn();
    const base = state.collection();
    return fn && base.filter ? base.filter(fn) : base;
  });

  // One stable manager reading the filtered collection live; shares the base
  // manager's underlying selection/focus state and retains the unfiltered
  // collection as `fullCollection` (so select-all still covers filtered-out keys).
  const selectionManager = state.selectionManager.withCollectionAccessor(() => collection());

  // Reset the focused key if the item it points at was filtered out, walking
  // forward (then backward) through the previous collection to the nearest
  // surviving, enabled item. Mirrors @react-stately's useFocusedKeyReset.
  let cachedCollection: Collection<T> | null = null;
  createEffect(() => {
    const coll = collection();
    const focusedKey = untrack(() => state.focusedKey());
    if (focusedKey != null && !coll.getItem(focusedKey) && cachedCollection) {
      let key = cachedCollection.getKeyAfter(focusedKey);
      let nextFocusedKey: Key | null = null;
      while (key != null) {
        const node = coll.getItem(key);
        if (node && node.type === "item" && !selectionManager.isDisabled(key)) {
          nextFocusedKey = key;
          break;
        }
        key = cachedCollection.getKeyAfter(key);
      }
      if (nextFocusedKey == null) {
        key = cachedCollection.getKeyBefore(focusedKey);
        while (key != null) {
          const node = coll.getItem(key);
          if (node && node.type === "item" && !selectionManager.isDisabled(key)) {
            nextFocusedKey = key;
            break;
          }
          key = cachedCollection.getKeyBefore(key);
        }
      }
      untrack(() => state.setFocusedKey(nextFocusedKey));
    }
    cachedCollection = coll;
  });

  // Spread the base state for type completeness + shared focus fields, then
  // override the collection and every collection-aware operation so navigation,
  // selection, and disabled checks all see the narrowed collection.
  return {
    ...state,
    collection,
    selectionManager,
    setFocusedKey: (key: Key | null, childStrategy?: FocusStrategy) =>
      selectionManager.setFocusedKey(key, childStrategy),
    selectionMode: () => selectionManager.selectionMode,
    selectionBehavior: () => selectionManager.selectionBehavior,
    disallowEmptySelection: () => selectionManager.disallowEmptySelection,
    disabledKeys: () => selectionManager.disabledKeys,
    isEmpty: () => selectionManager.isEmpty,
    isSelectAll: () => selectionManager.isSelectAll,
    isSelected: (key: Key) => selectionManager.isSelected(key),
    isDisabled: (key: Key) => selectionManager.isDisabled(key),
    setSelectionBehavior: (behavior: SelectionBehavior) =>
      selectionManager.setSelectionBehavior(behavior),
    toggleSelection: (key: Key) => selectionManager.toggleSelection(key),
    replaceSelection: (key: Key) => selectionManager.replaceSelection(key),
    setSelectedKeys: (keys: Iterable<Key>) => selectionManager.setSelectedKeys(keys),
    selectAll: () => selectionManager.selectAll(),
    clearSelection: () => selectionManager.clearSelection(),
    toggleSelectAll: () => selectionManager.toggleSelectAll(),
    extendSelection: (toKey: Key) => selectionManager.extendSelection(toKey),
    select: (key: Key, e?: SelectionPressEvent) => selectionManager.select(key, e),
  };
}

/**
 * Props for single selection list state.
 */
export interface SingleSelectListStateProps<T = unknown> extends Omit<
  ListStateProps<T>,
  "selectionMode" | "selectedKeys" | "defaultSelectedKeys" | "onSelectionChange"
> {
  /** The currently selected key (controlled). */
  selectedKey?: Key | null;
  /** The default selected key (uncontrolled). */
  defaultSelectedKey?: Key;
  /** Handler for selection changes. */
  onSelectionChange?: (key: Key | null) => void;
}

export interface SingleSelectListState<T = unknown> extends ListState<T> {
  /** The currently selected key. */
  readonly selectedKey: Accessor<Key | null>;
  /** Set the selected key. */
  setSelectedKey(key: Key | null): void;
  /** The currently selected item. */
  readonly selectedItem: Accessor<CollectionNode<T> | null>;
}

/**
 * Creates state for a single-select list component.
 */
export function createSingleSelectListState<T = unknown>(
  props: MaybeAccessor<SingleSelectListStateProps<T>>,
): SingleSelectListState<T> {
  const getProps = () => access(props);

  // Convert single selection props to multiple selection props
  const listState = createListState<T>({
    get items() {
      return getProps().items;
    },
    get getKey() {
      return getProps().getKey;
    },
    get getTextValue() {
      return getProps().getTextValue;
    },
    get getDisabled() {
      return getProps().getDisabled;
    },
    get disabledKeys() {
      return getProps().disabledKeys;
    },
    get disabledBehavior() {
      return getProps().disabledBehavior;
    },
    selectionMode: "single",
    disallowEmptySelection: true,
    allowDuplicateSelectionEvents: true,
    get selectedKeys() {
      const key = getProps().selectedKey;
      return key != null ? [key] : [];
    },
    get defaultSelectedKeys() {
      const key = getProps().defaultSelectedKey;
      return key != null ? [key] : undefined;
    },
    onSelectionChange(keys) {
      if (keys === "all") return;
      const key = keys.values().next().value ?? null;
      getProps().onSelectionChange?.(key);
    },
  });

  const selectedKey: Accessor<Key | null> = () => {
    const keys = listState.selectedKeys();
    if (keys === "all") return null;
    return keys.values().next().value ?? null;
  };

  const setSelectedKey = (key: Key | null) => {
    if (key === null) {
      listState.clearSelection();
    } else {
      listState.replaceSelection(key);
    }
  };

  const selectedItem: Accessor<CollectionNode<T> | null> = () => {
    const key = selectedKey();
    if (key === null) return null;
    return listState.collection().getItem(key);
  };

  return {
    ...listState,
    selectedKey,
    setSelectedKey,
    selectedItem,
  };
}
