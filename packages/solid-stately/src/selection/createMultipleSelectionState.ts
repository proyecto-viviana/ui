/**
 * Raw multiple-selection + focus state for a collection.
 *
 * The lower of the two selection layers ported from upstream
 * (`@react-stately/selection`'s `useMultipleSelectionState`): it owns the
 * selected keys, focus, selection behavior, and disabled keys, but is NOT
 * collection-aware. The collection-aware operations (toggle, extend, select
 * all, range, etc.) live in {@link SelectionManager}, which is built on top of
 * this state.
 *
 * Based on @react-stately/selection.
 */

import { createSignal, createMemo, createComputed, untrack, type Accessor } from "solid-js";
import { access, type MaybeAccessor } from "../utils";
import type { SelectionStateProps } from "../collections/createSelectionState";
import type {
  DisabledBehavior,
  FocusStrategy,
  Key,
  Selection,
  SelectionBehavior,
  SelectionMode,
} from "../collections/types";
import { Selection as SelectionClass } from "./Selection";

/**
 * The raw state consumed by {@link SelectionManager}. Mirrors upstream's
 * `MultipleSelectionState`: property reads (not Solid accessors) so the manager
 * can read `state.selectionMode` etc. exactly as upstream does — the getters
 * read the underlying signals, so reads inside reactive scopes still track.
 */
export interface MultipleSelectionState {
  /** The type of selection that is allowed in the collection. */
  readonly selectionMode: SelectionMode;
  /** The selection behavior for the collection. */
  readonly selectionBehavior: SelectionBehavior;
  /** Sets the selection behavior for the collection. */
  setSelectionBehavior(selectionBehavior: SelectionBehavior): void;
  /** Whether the collection allows empty selection. */
  readonly disallowEmptySelection: boolean;
  /** Whether the collection is currently focused. */
  readonly isFocused: boolean;
  /** Sets whether the collection is focused. */
  setFocused(isFocused: boolean): void;
  /** The current focused key in the collection. */
  readonly focusedKey: Key | null;
  /** Whether the first or last child of the focused key should receive focus. */
  readonly childFocusStrategy: FocusStrategy | null;
  /** Sets the focused key, and optionally, whether the first or last child of that key should receive focus. */
  setFocusedKey(key: Key | null, childFocusStrategy?: FocusStrategy): void;
  /** The currently selected keys in the collection. */
  readonly selectedKeys: Selection;
  /** The last selection payload emitted through onSelectionChange. @internal */
  readonly lastSelectionEvent: Selection | null;
  /** Sets the selected keys in the collection. */
  setSelectedKeys(keys: Selection): void;
  /** Re-emits a selection payload without recomputing or mutating selection. @internal */
  emitDuplicateSelectionEvent(keys?: Selection): void;
  /** The currently disabled keys in the collection. */
  readonly disabledKeys: Set<Key>;
  /** Whether `disabledKeys` applies to all interactions, or only selection. */
  readonly disabledBehavior: DisabledBehavior;
}

function equalSets(setA: Set<Key>, setB: Set<Key>): boolean {
  if (setA.size !== setB.size) {
    return false;
  }

  for (const item of setA) {
    if (!setB.has(item)) {
      return false;
    }
  }

  return true;
}

function convertSelection(
  selection: "all" | Iterable<Key> | null | undefined,
  defaultValue: Selection,
): Selection;
function convertSelection(selection: "all" | Iterable<Key> | null | undefined): Selection | undefined;
function convertSelection(
  selection: "all" | Iterable<Key> | null | undefined,
  defaultValue?: Selection,
): Selection | undefined {
  if (!selection) {
    return defaultValue;
  }

  return selection === "all" ? "all" : new SelectionClass(selection);
}

/**
 * Manages raw state for multiple selection and focus in a collection.
 */
export function createMultipleSelectionState(
  props: MaybeAccessor<SelectionStateProps> = {},
): MultipleSelectionState {
  const getProps = () => access(props);

  // Focus is a plain signal in Solid; upstream needs a ref + state pair only
  // because React requires both a synchronous read and a re-render trigger.
  const [isFocused, setIsFocused] = createSignal(false);
  const [focusedKey, setFocusedKeySignal] = createSignal<Key | null>(null);
  const [childFocusStrategy, setChildFocusStrategy] = createSignal<FocusStrategy | null>(null);

  const defaultSelectedKeys = convertSelection(
    getProps().defaultSelectedKeys,
    new SelectionClass(),
  );
  const [uncontrolledSelectedKeys, setUncontrolledSelectedKeys] =
    createSignal<Selection>(defaultSelectedKeys);

  const selectedKeys = createMemo<Selection>(() => {
    const p = getProps();
    if (p.selectedKeys !== undefined) {
      return convertSelection(p.selectedKeys, new SelectionClass());
    }
    return uncontrolledSelectedKeys();
  });

  // Selection behavior is seeded from the prop but kept in internal state so
  // that `setSelectionBehavior` (e.g. the long-press-to-select touch flow) can
  // override it. Two reactive rules mirror upstream's render-time logic.
  const selectionBehaviorProp = (): SelectionBehavior =>
    getProps().selectionBehavior ?? "toggle";

  const [selectionBehavior, setSelectionBehaviorState] = createSignal<SelectionBehavior>(
    selectionBehaviorProp(),
  );

  // If the selectionBehavior prop is 'replace' but the current state is 'toggle'
  // (e.g. due to a long press to enter selection mode on touch) and the
  // selection becomes empty, reset the behavior back to 'replace'.
  createComputed(() => {
    const keys = selectedKeys();
    if (
      selectionBehaviorProp() === "replace" &&
      untrack(selectionBehavior) === "toggle" &&
      typeof keys === "object" &&
      keys.size === 0
    ) {
      setSelectionBehaviorState("replace");
    }
  });

  // If the selectionBehavior prop changes, sync it into state.
  let lastSelectionBehavior = selectionBehaviorProp();
  createComputed(() => {
    const prop = selectionBehaviorProp();
    if (prop !== lastSelectionBehavior) {
      setSelectionBehaviorState(prop);
      lastSelectionBehavior = prop;
    }
  });

  const disabledKeys = createMemo<Set<Key>>(() => {
    const keys = getProps().disabledKeys;
    return keys ? new Set<Key>(keys) : new Set<Key>();
  });

  let lastSelectionEvent: Selection | null = null;

  const emitSelectionEvent = (keys: Selection) => {
    lastSelectionEvent = keys;
    getProps().onSelectionChange?.(keys);
  };

  const setSelectedKeys = (keys: Selection) => {
    const p = getProps();
    const current = selectedKeys();
    const shouldUpdate =
      p.allowDuplicateSelectionEvents ||
      keys === "all" ||
      current === "all" ||
      !equalSets(keys, current);

    if (!shouldUpdate) {
      return;
    }

    // Uncontrolled: store internally. Controlled: only notify.
    if (p.selectedKeys === undefined) {
      setUncontrolledSelectedKeys(keys);
    }
    emitSelectionEvent(keys);
  };

  const emitDuplicateSelectionEvent = (keys?: Selection) => {
    const eventKeys = keys ?? lastSelectionEvent;
    if (eventKeys == null) {
      return;
    }
    emitSelectionEvent(eventKeys);
  };

  return {
    get selectionMode() {
      return getProps().selectionMode ?? "none";
    },
    get selectionBehavior() {
      return selectionBehavior();
    },
    setSelectionBehavior(behavior: SelectionBehavior) {
      setSelectionBehaviorState(behavior);
    },
    get disallowEmptySelection() {
      return getProps().disallowEmptySelection ?? false;
    },
    get isFocused() {
      return isFocused();
    },
    setFocused(f: boolean) {
      setIsFocused(f);
    },
    get focusedKey() {
      return focusedKey();
    },
    get childFocusStrategy() {
      return childFocusStrategy();
    },
    setFocusedKey(key: Key | null, strategy: FocusStrategy = "first") {
      setFocusedKeySignal(key);
      setChildFocusStrategy(strategy);
    },
    get selectedKeys() {
      return selectedKeys();
    },
    get lastSelectionEvent() {
      return lastSelectionEvent;
    },
    setSelectedKeys,
    emitDuplicateSelectionEvent,
    get disabledKeys() {
      return disabledKeys();
    },
    get disabledBehavior() {
      return getProps().disabledBehavior ?? "all";
    },
  };
}

// Re-export the accessor type for convenience where a reactive read is wanted.
export type { Accessor };
