/**
 * Disclosure state management for SolidJS
 * Based on @react-stately/disclosure useDisclosureState and useDisclosureGroupState
 */

import { createSignal, createEffect, createMemo, type Accessor } from "solid-js";
import { access, type MaybeAccessor } from "../utils";

export interface DisclosureStateProps {
  /** Whether the disclosure is expanded (controlled). */
  isExpanded?: boolean;
  /** Whether the disclosure is expanded by default (uncontrolled). */
  defaultExpanded?: boolean;
  /** Handler that is called when the disclosure expanded state changes. */
  onExpandedChange?: (isExpanded: boolean) => void;
}

export interface DisclosureState {
  /** Whether the disclosure is currently expanded. */
  readonly isExpanded: Accessor<boolean>;
  /** Sets whether the disclosure is expanded. */
  setExpanded(isExpanded: boolean): void;
  /** Expand the disclosure. */
  expand(): void;
  /** Collapse the disclosure. */
  collapse(): void;
  /** Toggles the disclosure's visibility. */
  toggle(): void;
}

/**
 * Manages state for a disclosure widget. Tracks whether the disclosure is expanded,
 * and provides methods to toggle this state.
 */
export function createDisclosureState(
  props: MaybeAccessor<DisclosureStateProps> = {},
): DisclosureState {
  const propsAccessor = () => access(props);

  const [internalExpanded, setInternalExpanded] = createSignal(
    propsAccessor().defaultExpanded ?? false,
  );

  const isExpanded: Accessor<boolean> = () => {
    const p = propsAccessor();
    return p.isExpanded !== undefined ? p.isExpanded : internalExpanded();
  };

  const setExpanded = (expanded: boolean) => {
    const p = propsAccessor();
    if (p.isExpanded === undefined) {
      setInternalExpanded(expanded);
    }
    p.onExpandedChange?.(expanded);
  };

  const expand = () => setExpanded(true);
  const collapse = () => setExpanded(false);
  const toggle = () => setExpanded(!isExpanded());

  return {
    isExpanded,
    setExpanded,
    expand,
    collapse,
    toggle,
  };
}

export type Key = string | number;

export interface DisclosureGroupStateProps {
  /** Whether multiple items can be expanded at the same time. */
  allowsMultipleExpanded?: boolean;
  /** Whether all items are disabled. */
  isDisabled?: boolean;
  /** The currently expanded keys in the group (controlled). */
  expandedKeys?: Iterable<Key>;
  /** The initial expanded keys in the group (uncontrolled). */
  defaultExpandedKeys?: Iterable<Key>;
  /** Handler that is called when items are expanded or collapsed. */
  onExpandedChange?: (keys: Set<Key>) => void;
}

export interface DisclosureGroupState {
  /** Whether multiple items can be expanded at the same time. */
  readonly allowsMultipleExpanded: boolean;
  /** Whether all items are disabled. */
  readonly isDisabled: boolean;
  /** A set of keys for items that are expanded. */
  readonly expandedKeys: Accessor<Set<Key>>;
  /** Toggles the expanded state for an item by its key. */
  toggleKey(key: Key): void;
  /** Replaces the set of expanded keys. */
  setExpandedKeys(keys: Set<Key>): void;
  /** Check if a specific key is expanded. */
  isExpanded(key: Key): boolean;
}

/**
 * Manages state for a group of disclosures, e.g. an accordion.
 * It supports both single and multiple expanded items.
 */
export function createDisclosureGroupState(
  props: MaybeAccessor<DisclosureGroupStateProps> = {},
): DisclosureGroupState {
  const propsAccessor = () => access(props);

  const [internalKeys, setInternalKeys] = createSignal<Set<Key>>(
    new Set(propsAccessor().defaultExpandedKeys ?? []),
  );

  const expandedKeys: Accessor<Set<Key>> = createMemo(() => {
    const p = propsAccessor();
    return p.expandedKeys !== undefined ? new Set(p.expandedKeys) : internalKeys();
  });

  const setExpandedKeys = (keys: Set<Key>) => {
    const p = propsAccessor();
    if (p.expandedKeys === undefined) {
      setInternalKeys(keys);
    }
    p.onExpandedChange?.(keys);
  };

  // Ensure only one item is expanded if allowsMultipleExpanded is false.
  createEffect(() => {
    const p = propsAccessor();
    const allowsMultiple = p.allowsMultipleExpanded ?? false;
    const keys = expandedKeys();

    if (!allowsMultiple && keys.size > 1) {
      // Use queueMicrotask to defer the update and avoid infinite effect loop
      const firstKey = keys.values().next().value;
      if (firstKey != null) {
        queueMicrotask(() => {
          setExpandedKeys(new Set([firstKey]));
        });
      }
    }
  });

  const toggleKey = (key: Key) => {
    const p = propsAccessor();
    const allowsMultiple = p.allowsMultipleExpanded ?? false;
    const currentKeys = expandedKeys();

    let newKeys: Set<Key>;
    if (allowsMultiple) {
      newKeys = new Set(currentKeys);
      if (newKeys.has(key)) {
        newKeys.delete(key);
      } else {
        newKeys.add(key);
      }
    } else {
      newKeys = new Set(currentKeys.has(key) ? [] : [key]);
    }

    setExpandedKeys(newKeys);
  };

  const isExpanded = (key: Key): boolean => {
    return expandedKeys().has(key);
  };

  return {
    get allowsMultipleExpanded() {
      return propsAccessor().allowsMultipleExpanded ?? false;
    },
    get isDisabled() {
      return propsAccessor().isDisabled ?? false;
    },
    expandedKeys,
    toggleKey,
    setExpandedKeys,
    isExpanded,
  };
}
