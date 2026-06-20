/**
 * Selection state management for collections.
 * Based on @react-stately/selection.
 */

import { createSignal, createMemo, type Accessor } from "solid-js";
import { access, type MaybeAccessor } from "../utils";
import type {
  Collection,
  DisabledBehavior,
  FocusStrategy,
  Key,
  Selection,
  SelectionBehavior,
  SelectionMode,
} from "./types";

export interface SelectionStateProps {
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
  onSelectionChange?: (keys: Selection) => void;
  /** Keys of disabled items. */
  disabledKeys?: Iterable<Key>;
  /** How disabled keys behave. */
  disabledBehavior?: DisabledBehavior;
  /** Whether to allow duplicate selection events. */
  allowDuplicateSelectionEvents?: boolean;
}

export interface SelectionState {
  /** The selection mode. */
  readonly selectionMode: Accessor<SelectionMode>;
  /** The selection behavior. */
  readonly selectionBehavior: Accessor<SelectionBehavior>;
  /** Whether empty selection is disallowed. */
  readonly disallowEmptySelection: Accessor<boolean>;
  /** The currently selected keys. */
  readonly selectedKeys: Accessor<Selection>;
  /** Set of disabled keys. */
  readonly disabledKeys: Accessor<Set<Key>>;
  /** How disabled keys behave. */
  readonly disabledBehavior: Accessor<DisabledBehavior>;
  /** Whether the selection is empty. */
  readonly isEmpty: Accessor<boolean>;
  /** Whether all items are selected. */
  readonly isSelectAll: Accessor<boolean>;
  /** Check if a key is selected. */
  isSelected(key: Key): boolean;
  /** Check if a key is disabled. */
  isDisabled(key: Key): boolean;
  /** Set the selection behavior. */
  setSelectionBehavior(behavior: SelectionBehavior): void;
  /** Toggle selection for a key. */
  toggleSelection(key: Key): void;
  /** Replace selection with a single key. */
  replaceSelection(key: Key): void;
  /** Set multiple selected keys. */
  setSelectedKeys(keys: Iterable<Key>): void;
  /** Select all items. */
  selectAll(): void;
  /** Clear all selection. */
  clearSelection(): void;
  /** Toggle between select all and clear. */
  toggleSelectAll(): void;
  /** Extend selection to a key (for shift-click). */
  extendSelection(toKey: Key, collection: Collection): void;
  /** Select a key based on interaction. */
  select(key: Key, e?: SelectionPressEvent): void;
}

/**
 * The press/pointer interaction consulted by {@link SelectionState.select}.
 * Mirrors react-stately's `SelectionManager.select(e)`: only `pointerType` is
 * read here (touch / virtual force toggle, since those devices have no modifier
 * keys). Modifier keys (ctrl / meta / shift) are resolved one layer up in the
 * aria-layer `onSelect` (solidaria `selectItem`), matching upstream's split
 * between react-stately and react-aria. The modifier fields are accepted so a
 * full press/pointer event is assignable, but they are not read here.
 */
export interface SelectionPressEvent {
  pointerType?: "mouse" | "pen" | "touch" | "keyboard" | "virtual";
  shiftKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
}

/**
 * Creates selection state for a collection.
 */
export function createSelectionState(
  props: MaybeAccessor<SelectionStateProps> = {},
): SelectionState {
  const getProps = () => access(props);

  // Selection behavior state
  const [internalBehavior, setInternalBehavior] = createSignal<SelectionBehavior>("toggle");

  // Internal selection state
  const [internalSelectedKeys, setInternalSelectedKeys] = createSignal<Selection>(
    getInitialSelection(getProps().defaultSelectedKeys),
  );

  // Track anchor for range selection
  const [anchorKey, setAnchorKey] = createSignal<Key | null>(null);

  // Computed values
  const selectionMode: Accessor<SelectionMode> = () => getProps().selectionMode ?? "none";

  const selectionBehavior: Accessor<SelectionBehavior> = () => {
    return getProps().selectionBehavior ?? internalBehavior();
  };

  const disallowEmptySelection: Accessor<boolean> = () => {
    return getProps().disallowEmptySelection ?? false;
  };

  const selectedKeys: Accessor<Selection> = createMemo(() => {
    const p = getProps();
    if (p.selectedKeys !== undefined) {
      return normalizeSelection(p.selectedKeys);
    }
    return internalSelectedKeys();
  });

  const disabledKeys: Accessor<Set<Key>> = createMemo(() => {
    const keys = getProps().disabledKeys;
    return keys ? new Set<Key>(keys) : new Set<Key>();
  });

  const disabledBehavior: Accessor<DisabledBehavior> = () => {
    return getProps().disabledBehavior ?? "all";
  };

  const isEmpty: Accessor<boolean> = () => {
    const keys = selectedKeys();
    return keys !== "all" && keys.size === 0;
  };

  const isSelectAll: Accessor<boolean> = () => {
    return selectedKeys() === "all";
  };

  // Methods
  const isSelected = (key: Key): boolean => {
    const keys = selectedKeys();
    if (keys === "all") return true;
    return keys.has(key);
  };

  const isDisabled = (key: Key): boolean => {
    return disabledKeys().has(key);
  };

  const updateSelection = (newSelection: Selection) => {
    const p = getProps();

    // Controlled mode
    if (p.selectedKeys !== undefined) {
      p.onSelectionChange?.(newSelection);
      return;
    }

    // Uncontrolled mode
    const current = internalSelectedKeys();
    const isDifferent =
      current === "all" ||
      newSelection === "all" ||
      current.size !== (newSelection as Set<Key>).size ||
      ![...current].every((k) => (newSelection as Set<Key>).has(k));

    if (isDifferent || p.allowDuplicateSelectionEvents) {
      setInternalSelectedKeys(newSelection);
      p.onSelectionChange?.(newSelection);
    }
  };

  const toggleSelection = (key: Key) => {
    if (isDisabled(key)) return;
    if (selectionMode() === "none") return;

    const current = selectedKeys();

    if (selectionMode() === "single") {
      if (isSelected(key) && !disallowEmptySelection()) {
        updateSelection(new Set());
      } else {
        updateSelection(new Set([key]));
      }
      return;
    }

    // Multiple selection
    if (current === "all") {
      // Can't toggle when all selected without collection
      return;
    }

    const newSelection = new Set(current);
    if (newSelection.has(key)) {
      if (newSelection.size > 1 || !disallowEmptySelection()) {
        newSelection.delete(key);
      }
    } else {
      newSelection.add(key);
    }

    updateSelection(newSelection);
    setAnchorKey(key);
  };

  const replaceSelection = (key: Key) => {
    if (isDisabled(key)) return;
    if (selectionMode() === "none") return;

    updateSelection(new Set([key]));
    setAnchorKey(key);
  };

  const setSelectedKeys = (keys: Iterable<Key>) => {
    const filtered = [...keys].filter((k) => !isDisabled(k));
    updateSelection(new Set(filtered));
  };

  const selectAll = () => {
    if (selectionMode() !== "multiple") return;
    updateSelection("all");
  };

  const clearSelection = () => {
    if (disallowEmptySelection()) return;
    updateSelection(new Set());
  };

  const toggleSelectAll = () => {
    if (selectionMode() !== "multiple") return;

    if (isSelectAll()) {
      clearSelection();
    } else {
      selectAll();
    }
  };

  const extendSelection = (toKey: Key, collection: Collection) => {
    if (isDisabled(toKey)) return;
    if (selectionMode() !== "multiple") {
      replaceSelection(toKey);
      return;
    }

    const anchor = anchorKey();
    if (!anchor) {
      replaceSelection(toKey);
      return;
    }

    // Get keys between anchor and toKey
    const keys = [...collection.getKeys()];
    const anchorIndex = keys.indexOf(anchor);
    const toIndex = keys.indexOf(toKey);

    if (anchorIndex === -1 || toIndex === -1) {
      replaceSelection(toKey);
      return;
    }

    const start = Math.min(anchorIndex, toIndex);
    const end = Math.max(anchorIndex, toIndex);
    const rangeKeys = keys.slice(start, end + 1).filter((k) => !isDisabled(k));

    updateSelection(new Set(rangeKeys));
  };

  const select = (key: Key, e?: SelectionPressEvent) => {
    // Mirrors react-stately's SelectionManager.select: only pointerType +
    // selectionBehavior are consulted here. Modifier-key handling (ctrl / meta
    // ⇒ toggle, shift ⇒ extend) lives one layer up in solidaria's aria-layer
    // `selectItem`, which is where the platform-aware isCtrlKeyPressed is
    // available. The primitives self-guard disabled keys, so no guard is
    // needed here (matching upstream).
    if (selectionMode() === "none") return;

    if (selectionMode() === "single") {
      // Single mode ignores selectionBehavior. Re-selecting the current item
      // deselects it when empty selection is allowed; otherwise it stays
      // selected (replace).
      if (isSelected(key) && !disallowEmptySelection()) {
        toggleSelection(key);
      } else {
        replaceSelection(key);
      }
    } else if (
      selectionBehavior() === "toggle" ||
      (e != null && (e.pointerType === "touch" || e.pointerType === "virtual"))
    ) {
      // touch / virtual (VoiceOver) have no modifier keys, so multi-select is
      // only reachable by toggling.
      toggleSelection(key);
    } else {
      replaceSelection(key);
    }
  };

  const setSelectionBehavior = (behavior: SelectionBehavior) => {
    setInternalBehavior(behavior);
  };

  return {
    selectionMode,
    selectionBehavior,
    disallowEmptySelection,
    selectedKeys,
    disabledKeys,
    disabledBehavior,
    isEmpty,
    isSelectAll,
    isSelected,
    isDisabled,
    setSelectionBehavior,
    toggleSelection,
    replaceSelection,
    setSelectedKeys,
    selectAll,
    clearSelection,
    toggleSelectAll,
    extendSelection,
    select,
  };
}

// Helper functions
function getInitialSelection(defaultKeys?: "all" | Iterable<Key>): Selection {
  if (defaultKeys === undefined) return new Set();
  return normalizeSelection(defaultKeys);
}

function normalizeSelection(keys: "all" | Iterable<Key>): Selection {
  if (keys === "all") return "all";
  return new Set(keys);
}
