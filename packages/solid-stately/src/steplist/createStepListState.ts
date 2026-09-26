/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/steplist/useStepListState.ts

/**
 * State management for step list components.
 * Tracks selected step, completion status, and selectability.
 *
 * Ported from packages/react-stately/src/steplist/useStepListState.ts.
 */

import { createEffect, createMemo } from "solid-js";
import type { Accessor } from "solid-js";
import { createInternalSignal } from "../utils";
import type { CollectionNode, Key } from "../collections/types";
import {
  createSingleSelectListState,
  type SingleSelectListState,
} from "../collections/createListState";

export interface StepListStateProps<T = unknown> {
  /** The currently selected step key (controlled). */
  selectedKey?: Key;
  /** The default selected step key (uncontrolled). */
  defaultSelectedKey?: Key;
  /** Called when the selected step changes. */
  onSelectionChange?: (key: Key) => void;
  /** The last completed step key (controlled). */
  lastCompletedStep?: Key;
  /** The default last completed step key (uncontrolled). */
  defaultLastCompletedStep?: Key;
  /** Called when last completed step changes. */
  onLastCompletedStepChange?: (key: Key | null) => void;
  /** Whether all steps are disabled. */
  isDisabled?: boolean;
  /** Whether all steps are read-only. */
  isReadOnly?: boolean;
  /** Keys of individually disabled steps. */
  disabledKeys?: Iterable<Key>;
  /** The step items. */
  items: T[];
}

export interface StepListState<T = unknown> extends SingleSelectListState<T> {
  readonly lastCompletedStep: Accessor<Key | null>;
  readonly items: Accessor<T[]>;
  setSelectedKey(key: Key): void;
  setLastCompletedStep(key: Key | null): void;
  isCompleted(key: Key): boolean;
  isSelectable(key: Key): boolean;
  isDisabled: Accessor<boolean> & ((key?: Key) => boolean);
  isReadOnly: Accessor<boolean>;
}

/**
 * Creates state for a step list component.
 */
export function createStepListState<T = unknown>(props: StepListStateProps<T>): StepListState<T> {
  const isListDisabled: Accessor<boolean> = () => props.isDisabled ?? false;
  const isReadOnly: Accessor<boolean> = () => props.isReadOnly ?? false;
  const items: Accessor<T[]> = () => props.items ?? [];

  // Last completed step signal (uncontrolled / controlled sync)
  const [lastCompletedStepInternal, setLastCompletedStepInternal] =
    createInternalSignal<Key | null>(props.defaultLastCompletedStep ?? null);

  const lastCompletedStep: Accessor<Key | null> = () => {
    if (props.lastCompletedStep !== undefined) {
      return props.lastCompletedStep;
    }
    return lastCompletedStepInternal();
  };

  const isCompleted = (step: Key): boolean => {
    if (step == null) return false;
    const completed = lastCompletedStep();
    if (completed == null) return false;
    const { indexMap } = keyMaps();
    const stepIdx = indexMap.get(step);
    const completedIdx = indexMap.get(completed);
    if (stepIdx === undefined || completedIdx === undefined) return false;
    return stepIdx <= completedIdx;
  };

  const isSelectable = (step: Key): boolean => {
    if (isListDisabled() || singleSelectListState.disabledKeys().has(step) || isReadOnly()) {
      return false;
    }
    if (isCompleted(step)) return true;
    const { keysLinkedList } = keyMaps();
    const prevStep = keysLinkedList.get(step);
    return (
      (prevStep !== undefined && isCompleted(prevStep)) ||
      step === singleSelectListState.collection().getFirstKey()
    );
  };

  const findInitialSelectedKey = (): Key | undefined => {
    if (props.defaultSelectedKey !== undefined) {
      return props.defaultSelectedKey;
    }
    const currentItems = (props.items ?? []) as Array<{ key: Key; [key: string]: any }>;
    const disabled = new Set<Key>(props.disabledKeys ?? []);
    for (const item of currentItems) {
      if (!disabled.has(item.key)) {
        return item.key;
      }
    }
    return currentItems[0]?.key;
  };

  // Route through the shared SingleSelectListState collection spine
  const singleSelectListState = createSingleSelectListState<T>({
    get items() {
      return (props.items ?? []) as T[];
    },
    getKey(item: any) {
      return item.key;
    },
    getTextValue(item: any) {
      return item.label ?? item.textValue ?? (item.key != null ? String(item.key) : "");
    },
    get disabledKeys() {
      return props.disabledKeys;
    },
    get selectedKey() {
      return props.selectedKey;
    },
    get defaultSelectedKey() {
      return findInitialSelectedKey();
    },
    onSelectionChange(key) {
      if (key != null) {
        props.onSelectionChange?.(key);
      }
    },
  });

  // Build indexMap and keysLinkedList from the collection
  const keyMaps = createMemo(() => {
    const coll = singleSelectListState.collection();
    const indexMap = new Map<Key, number>();
    const keysLinkedList = new Map<Key, Key | undefined>();
    let i = 0;
    let prev: CollectionNode<T> | undefined;
    for (const item of coll) {
      indexMap.set(item.key, i);
      keysLinkedList.set(item.key, prev?.key);
      prev = item;
      i++;
    }
    return { indexMap, keysLinkedList };
  });

  const setLastCompletedStep = (key: Key | null) => {
    if (key == null) {
      if (props.lastCompletedStep === undefined) {
        setLastCompletedStepInternal(null);
      }
      props.onLastCompletedStepChange?.(null);
      return;
    }
    const { indexMap } = keyMaps();
    const currentIndex = indexMap.get(key);
    const completed = lastCompletedStep();
    const prevIndex = completed !== null ? indexMap.get(completed) : -1;

    // Only advance completion, never go back
    if (
      currentIndex !== undefined &&
      (prevIndex === undefined || currentIndex > (prevIndex ?? -1))
    ) {
      if (props.lastCompletedStep === undefined) {
        setLastCompletedStepInternal(key);
      }
      props.onLastCompletedStepChange?.(key);
    }
  };

  // Mirror react-stately useStepListState's effect: whenever the selected step
  // sits more than one past the last completed step (e.g. mounted with a
  // defaultSelectedKey ahead of progress), auto-complete its immediate predecessor.
  createEffect(
    () => {
      const selKey = singleSelectListState.selectedKey();
      if (selKey === null) return null;
      const { indexMap, keysLinkedList } = keyMaps();
      const selIdx = indexMap.get(selKey);
      if (selIdx === undefined || selIdx <= 0) return null;
      const completed = lastCompletedStep();
      const lcs = completed !== null ? (indexMap.get(completed) ?? -1) : -1;
      if (selIdx <= lcs + 1) return null;
      return keysLinkedList.get(selKey) ?? null;
    },
    (prevKey) => {
      if (prevKey != null) {
        setLastCompletedStep(prevKey);
      }
    },
  );

  // Sync initial focus to selectedKey if focusedKey is unset
  createEffect(
    () => singleSelectListState.selectedKey(),
    (selKey) => {
      if (singleSelectListState.focusedKey() == null && selKey != null) {
        singleSelectListState.setFocusedKey(selKey);
      }
    },
  );

  const setSelectedKey = (key: Key) => {
    if (isListDisabled() || isReadOnly()) return;
    if (!isSelectable(key)) return;
    const { keysLinkedList } = keyMaps();
    const prevKey = keysLinkedList.get(key);
    if (prevKey && !isCompleted(prevKey)) {
      setLastCompletedStep(prevKey);
    }
    singleSelectListState.setSelectedKey(key);
  };

  // Bridge selectionManager with step list selectability
  singleSelectListState.selectionManager.canSelectItem = (key: Key) => isSelectable(key);
  const origReplaceSelection = singleSelectListState.selectionManager.replaceSelection.bind(
    singleSelectListState.selectionManager,
  );
  singleSelectListState.selectionManager.replaceSelection = (key: Key) => {
    if (isListDisabled() || isReadOnly()) return;
    if (!isSelectable(key)) return;
    const { keysLinkedList } = keyMaps();
    const prevKey = keysLinkedList.get(key);
    if (prevKey && !isCompleted(prevKey)) {
      setLastCompletedStep(prevKey);
    }
    origReplaceSelection(key);
  };

  const isDisabledFn = ((key?: Key): boolean => {
    if (key === undefined) {
      return isListDisabled();
    }
    return !isSelectable(key);
  }) as Accessor<boolean> & ((key?: Key) => boolean);

  return {
    ...singleSelectListState,
    selectedKey: singleSelectListState.selectedKey,
    lastCompletedStep,
    items,
    setSelectedKey,
    setLastCompletedStep,
    isCompleted,
    isSelectable,
    isDisabled: isDisabledFn,
    isReadOnly,
  };
}
