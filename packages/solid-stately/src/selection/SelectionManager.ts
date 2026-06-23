/**
 * An interface for reading and updating multiple selection state.
 *
 * The upper of the two selection layers ported from upstream
 * (`@react-stately/selection`'s `SelectionManager`): the collection-aware
 * operations built on top of the raw {@link MultipleSelectionState}.
 *
 * React → Solid adaptations, all faithful to upstream's observable contract:
 *  - Upstream re-instantiates `SelectionManager` every render to capture a
 *    fresh `collection`. Here the manager is long-lived, so it captures a
 *    reactive `collection` accessor and reads it live via `get collection()`.
 *  - Upstream caches `_isSelectAll` for the lifetime of one render. A
 *    long-lived manager would let that cache go stale, so it is dropped and
 *    `isSelectAll` recomputes (it is consulted rarely — only by select-all UI).
 *  - Our `CollectionNode` has no `'cell'` type (grids/trees use a separate
 *    state engine), so the cell-selection branches are omitted.
 *
 * Based on @react-stately/selection.
 */

import { compareNodeOrder, getChildNodes, getFirstItem } from "../collections/getChildNodes";
import type { SelectionPressEvent } from "../collections/createSelectionState";
import type {
  Collection,
  CollectionNode,
  DisabledBehavior,
  FocusStrategy,
  Key,
  Selection as SelectionValue,
  SelectionBehavior,
  SelectionMode,
} from "../collections/types";
import type { MultipleSelectionState } from "./createMultipleSelectionState";
import { Selection } from "./Selection";

/** A delegate that can resolve a key range without walking the collection (e.g. a virtualized layout). */
export interface LayoutDelegate {
  getKeyRange?(from: Key, to: Key): Key[];
}

export interface SelectionManagerOptions<T = unknown> {
  layoutDelegate?: LayoutDelegate;
  /**
   * The full (unfiltered) collection, used when materializing the 'all'
   * selection so that filtered-out items (e.g. by Autocomplete) are still
   * included.
   */
  fullCollection?: Collection<T>;
}

/**
 * An interface for reading and updating multiple selection state.
 */
export class SelectionManager<T = unknown> {
  private collectionAccessor: () => Collection<T>;
  private state: MultipleSelectionState;
  private layoutDelegate: LayoutDelegate | null;
  private fullCollection: Collection<T> | null;

  constructor(
    collection: () => Collection<T>,
    state: MultipleSelectionState,
    options?: SelectionManagerOptions<T>,
  ) {
    this.collectionAccessor = collection;
    this.state = state;
    this.layoutDelegate = options?.layoutDelegate ?? null;
    this.fullCollection = options?.fullCollection ?? null;
  }

  /** The collection the manager operates over (read live so it stays reactive). */
  get collection(): Collection<T> {
    return this.collectionAccessor();
  }

  /** The type of selection that is allowed in the collection. */
  get selectionMode(): SelectionMode {
    return this.state.selectionMode;
  }

  /** Whether the collection allows empty selection. */
  get disallowEmptySelection(): boolean {
    return this.state.disallowEmptySelection;
  }

  /** The selection behavior for the collection. */
  get selectionBehavior(): SelectionBehavior {
    return this.state.selectionBehavior;
  }

  /** Sets the selection behavior for the collection. */
  setSelectionBehavior(selectionBehavior: SelectionBehavior): void {
    this.state.setSelectionBehavior(selectionBehavior);
  }

  /** Whether the collection is currently focused. */
  get isFocused(): boolean {
    return this.state.isFocused;
  }

  /** Sets whether the collection is focused. */
  setFocused(isFocused: boolean): void {
    this.state.setFocused(isFocused);
  }

  /** The current focused key in the collection. */
  get focusedKey(): Key | null {
    return this.state.focusedKey;
  }

  /** Whether the first or last child of the focused key should receive focus. */
  get childFocusStrategy(): FocusStrategy | null {
    return this.state.childFocusStrategy;
  }

  /** Sets the focused key. */
  setFocusedKey(key: Key | null, childFocusStrategy?: FocusStrategy): void {
    if (key == null || this.collection.getItem(key)) {
      this.state.setFocusedKey(key, childFocusStrategy);
    }
  }

  /** The currently selected keys in the collection (materialized — 'all' is expanded). */
  get selectedKeys(): Set<Key> {
    const keys = this.state.selectedKeys;
    return keys === "all" ? new Set(this.getSelectAllKeys()) : keys;
  }

  /** The raw selection value for the collection. Either 'all' for select all, or a set of keys. */
  get rawSelection(): SelectionValue {
    return this.state.selectedKeys;
  }

  /** Last selection payload emitted through onSelectionChange. @internal */
  get lastSelectionEvent(): SelectionValue | null {
    return this.state.lastSelectionEvent;
  }

  /** Re-emits a selection payload without recomputing selection. @internal */
  emitDuplicateSelectionEvent(keys: SelectionValue | null = this.state.lastSelectionEvent): void {
    if (keys == null || this.selectionMode === "none") {
      return;
    }

    this.state.emitDuplicateSelectionEvent(keys);
  }

  /** Returns whether a key is selected. */
  isSelected(key: Key): boolean {
    if (this.state.selectionMode === "none") {
      return false;
    }

    const mappedKey = this.getKey(key);
    if (mappedKey == null) {
      return false;
    }
    const selectedKeys = this.state.selectedKeys;
    return selectedKeys === "all"
      ? this.canSelectItem(mappedKey)
      : selectedKeys.has(mappedKey);
  }

  /** Whether the selection is empty. */
  get isEmpty(): boolean {
    return this.state.selectedKeys !== "all" && this.state.selectedKeys.size === 0;
  }

  /** Whether all items in the collection are selected. */
  get isSelectAll(): boolean {
    if (this.isEmpty) {
      return false;
    }

    const selectedKeys = this.state.selectedKeys;
    if (selectedKeys === "all") {
      return true;
    }

    const allKeys = this.getSelectAllKeys();
    return allKeys.every((k) => selectedKeys.has(k));
  }

  get firstSelectedKey(): Key | null {
    let first: CollectionNode<T> | null = null;
    for (const key of this.state.selectedKeys) {
      const item = this.collection.getItem(key);
      if (!first || (item && compareNodeOrder(this.collection, item, first) < 0)) {
        first = item;
      }
    }

    return first?.key ?? null;
  }

  get lastSelectedKey(): Key | null {
    let last: CollectionNode<T> | null = null;
    for (const key of this.state.selectedKeys) {
      const item = this.collection.getItem(key);
      if (!last || (item && compareNodeOrder(this.collection, item, last) > 0)) {
        last = item;
      }
    }

    return last?.key ?? null;
  }

  get disabledKeys(): Set<Key> {
    return this.state.disabledKeys;
  }

  get disabledBehavior(): DisabledBehavior {
    return this.state.disabledBehavior;
  }

  /** Extends the selection to the given key. */
  extendSelection(toKey: Key): void {
    if (this.selectionMode === "none") {
      return;
    }

    if (this.selectionMode === "single") {
      this.replaceSelection(toKey);
      return;
    }

    const mappedToKey = this.getKey(toKey);
    if (mappedToKey == null) {
      return;
    }

    let selection: Selection;

    // Only select the one key if coming from a select all.
    const currentSelection = this.state.selectedKeys;
    if (currentSelection === "all") {
      selection = new Selection([mappedToKey], mappedToKey, mappedToKey);
    } else {
      const selectedKeys = currentSelection as Selection;
      const anchorKey = selectedKeys.anchorKey ?? mappedToKey;
      selection = new Selection(selectedKeys, anchorKey, mappedToKey);
      for (const key of this.getKeyRange(anchorKey, selectedKeys.currentKey ?? mappedToKey)) {
        selection.delete(key);
      }

      for (const key of this.getKeyRange(mappedToKey, anchorKey)) {
        if (this.canSelectItem(key)) {
          selection.add(key);
        }
      }
    }

    this.state.setSelectedKeys(selection);
  }

  private getKeyRange(from: Key, to: Key): Key[] {
    const fromItem = this.collection.getItem(from);
    const toItem = this.collection.getItem(to);
    if (fromItem && toItem) {
      if (compareNodeOrder(this.collection, fromItem, toItem) <= 0) {
        return this.getKeyRangeInternal(from, to);
      }

      return this.getKeyRangeInternal(to, from);
    }

    return [];
  }

  private getKeyRangeInternal(from: Key, to: Key): Key[] {
    if (this.layoutDelegate?.getKeyRange) {
      return this.layoutDelegate.getKeyRange(from, to);
    }

    const keys: Key[] = [];
    let key: Key | null = from;
    while (key != null) {
      const item = this.collection.getItem(key);
      if (item && item.type === "item") {
        keys.push(key);
      }

      if (key === to) {
        return keys;
      }

      key = this.collection.getKeyAfter(key);
    }

    return [];
  }

  private getKey(key: Key): Key | null {
    let item = this.collection.getItem(key);
    if (!item) {
      // ¯\_(ツ)_/¯
      return key;
    }

    // Find a parent item to select.
    while (item && item.type !== "item" && item.parentKey != null) {
      item = this.collection.getItem(item.parentKey);
    }

    if (!item || item.type !== "item") {
      return null;
    }

    return item.key;
  }

  /** Toggles whether the given key is selected. */
  toggleSelection(key: Key): void {
    if (this.selectionMode === "none") {
      return;
    }

    if (this.selectionMode === "single" && !this.isSelected(key)) {
      this.replaceSelection(key);
      return;
    }

    const mappedKey = this.getKey(key);
    if (mappedKey == null) {
      return;
    }

    const keys = new Selection(
      this.state.selectedKeys === "all" ? this.getSelectAllKeys() : this.state.selectedKeys,
    );
    if (keys.has(mappedKey)) {
      keys.delete(mappedKey);
      // TODO: move anchor to last selected key...
    } else if (this.canSelectItem(mappedKey)) {
      keys.add(mappedKey);
      keys.anchorKey = mappedKey;
      keys.currentKey = mappedKey;
    }

    if (this.disallowEmptySelection && keys.size === 0) {
      return;
    }

    this.state.setSelectedKeys(keys);
  }

  /** Replaces the selection with only the given key. */
  replaceSelection(key: Key): void {
    if (this.selectionMode === "none") {
      return;
    }

    const mappedKey = this.getKey(key);
    if (mappedKey == null) {
      return;
    }

    const selection = this.canSelectItem(mappedKey)
      ? new Selection([mappedKey], mappedKey, mappedKey)
      : new Selection();

    this.state.setSelectedKeys(selection);
  }

  /** Replaces the selection with the given keys. */
  setSelectedKeys(keys: Iterable<Key>): void {
    if (this.selectionMode === "none") {
      return;
    }

    const selection = new Selection();
    for (const key of keys) {
      const mappedKey = this.getKey(key);
      if (mappedKey != null) {
        selection.add(mappedKey);
        if (this.selectionMode === "single") {
          break;
        }
      }
    }

    this.state.setSelectedKeys(selection);
  }

  private getSelectAllKeys(): Key[] {
    // Use the full (unfiltered) collection when available so that materializing
    // the 'all' selection includes items that are currently filtered out.
    const collection = this.fullCollection ?? this.collection;
    const keys: Key[] = [];
    const addKeys = (key: Key | null) => {
      while (key != null) {
        if (this.canSelectItemIn(key, collection)) {
          const item = collection.getItem(key);
          if (item?.type === "item") {
            keys.push(key);
          }

          // Add child keys for sections.
          if (item?.hasChildNodes && item.type !== "item") {
            addKeys(getFirstItem(getChildNodes(item, collection))?.key ?? null);
          }
        }

        key = collection.getKeyAfter(key);
      }
    };

    addKeys(collection.getFirstKey());
    return keys;
  }

  /** Selects all items in the collection. */
  selectAll(): void {
    if (!this.isSelectAll && this.selectionMode === "multiple") {
      this.state.setSelectedKeys("all");
    }
  }

  /** Removes all keys from the selection. */
  clearSelection(): void {
    if (
      !this.disallowEmptySelection &&
      (this.state.selectedKeys === "all" || this.state.selectedKeys.size > 0)
    ) {
      this.state.setSelectedKeys(new Selection());
    }
  }

  /** Toggles between select all and an empty selection. */
  toggleSelectAll(): void {
    if (this.isSelectAll) {
      this.clearSelection();
    } else {
      this.selectAll();
    }
  }

  select(key: Key, e?: SelectionPressEvent): void {
    if (this.selectionMode === "none") {
      return;
    }

    if (this.selectionMode === "single") {
      if (this.isSelected(key) && !this.disallowEmptySelection) {
        this.toggleSelection(key);
      } else {
        this.replaceSelection(key);
      }
    } else if (
      this.selectionBehavior === "toggle" ||
      (e && (e.pointerType === "touch" || e.pointerType === "virtual"))
    ) {
      // touch / virtual (VoiceOver) have no modifier keys, so multi-select is
      // only reachable by toggling.
      this.toggleSelection(key);
    } else {
      this.replaceSelection(key);
    }
  }

  /** Returns whether the current selection is equal to the given selection. */
  isSelectionEqual(selection: Set<Key>): boolean {
    if (selection === this.state.selectedKeys) {
      return true;
    }

    // Check if the set of keys match.
    const selectedKeys = this.selectedKeys;
    if (selection.size !== selectedKeys.size) {
      return false;
    }

    for (const key of selection) {
      if (!selectedKeys.has(key)) {
        return false;
      }
    }

    for (const key of selectedKeys) {
      if (!selection.has(key)) {
        return false;
      }
    }

    return true;
  }

  canSelectItem(key: Key): boolean {
    return this.canSelectItemIn(key, this.collection);
  }

  private canSelectItemIn(key: Key, collection: Collection<T>): boolean {
    if (this.state.selectionMode === "none" || this.state.disabledKeys.has(key)) {
      return false;
    }

    const item = collection.getItem(key);
    if (!item || item.isDisabled || item.props?.isDisabled) {
      return false;
    }

    return true;
  }

  isDisabled(key: Key): boolean {
    const item = this.collection.getItem(key);
    return (
      this.state.disabledBehavior === "all" &&
      (this.state.disabledKeys.has(key) || !!item?.props?.isDisabled) &&
      item?.props?.disabledBehavior !== "selection"
    );
  }

  isLink(key: Key): boolean {
    return !!this.collection.getItem(key)?.props?.href;
  }

  getItemProps(key: Key): Record<string, unknown> | undefined {
    return this.collection.getItem(key)?.props;
  }

  withCollection(collection: Collection<T>): SelectionManager<T> {
    return new SelectionManager<T>(() => collection, this.state, {
      layoutDelegate: this.layoutDelegate ?? undefined,
      fullCollection: this.fullCollection ?? this.collection,
    });
  }
}
