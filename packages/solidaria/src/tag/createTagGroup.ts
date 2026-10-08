/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/tag/useTagGroup.ts

/**
 * TagGroup hook for Solidaria
 *
 * Provides the behavior and accessibility implementation for a tag group component.
 * A tag group is a focusable list of labels, categories, keywords, filters, or other items,
 * with support for keyboard navigation, selection, and removal.
 *
 * Based on @react-aria/tag useTagGroup
 */

import { onCleanup, createSignal, createTrackedEffect } from "solid-js";
import type { JSX } from "@solidjs/web";
import { createFocusWithin } from "../interactions/createFocusWithin";
import { createLabel } from "../label/createLabel";
import { filterDOMProps } from "../utils/filterDOMProps";
import { mergeProps } from "../utils/mergeProps";
import { createId } from "../ssr";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { createGridList } from "../gridlist/createGridList";
import type {
  ListState,
  Key,
  GridCollection,
  GridState,
  SelectionBehavior,
  FocusStrategy,
} from "@proyecto-viviana/solid-stately";

export interface AriaTagGroupProps {
  /** An ID for the tag group. */
  id?: string;
  /** Whether the tag group is disabled. */
  isDisabled?: boolean;
  /** The label for the tag group. */
  label?: string;
  /** An accessible label for the tag group when no visible label is provided. */
  "aria-label"?: string;
  /** The ID of an element that labels the tag group. */
  "aria-labelledby"?: string;
  /** The ID of an element that describes the tag group. */
  "aria-describedby"?: string;
  /** A description of the tag group. */
  description?: string;
  /** An error message for the tag group. */
  errorMessage?: string;
  /** Handler that is called when a user removes a tag. */
  onRemove?: (keys: Set<Key>) => void;
  /**
   * The layout direction, threaded from `useLocale`. A TagGroup navigates on the
   * inline axis, so ArrowLeft/ArrowRight flip under RTL (mirrors the direction
   * the ListKeyboardDelegate receives from useTagGroup).
   */
  direction?: "ltr" | "rtl";
}

export interface TagGroupAria {
  /**
   * Props for the tag group container element. Focus attributes follow Solid
   * JSX, matching the merged grid and focus-within props.
   */
  gridProps: {
    onFocus?: JSX.EventHandler<HTMLElement, FocusEvent>;
    onBlur?: JSX.EventHandler<HTMLElement, FocusEvent>;
  } & Record<string, unknown>;
  /** Props for the tag group's visible label (if any). */
  labelProps: Record<string, unknown>;
  /** Props for the tag group description element, if any. */
  descriptionProps: Record<string, unknown>;
  /** Props for the tag group error message element, if any. */
  errorMessageProps: Record<string, unknown>;
}

// Shared data between tag group and tags
const tagGroupData = new WeakMap<object, TagGroupData>();

interface TagGroupData {
  id: string;
  onRemove?: (keys: Set<Key>) => void;
  /** Stable adapter. createGridList keys its WeakMap by this object. */
  gridState: GridState<unknown, GridCollection<unknown>>;
}

export function getTagGroupData(state: ListState): TagGroupData | undefined {
  return tagGroupData.get(state);
}

/**
 * ListState stores collection and focus as accessors. createGridList reads a
 * GridState snapshot. One object per group keeps the grid WeakMap stable.
 */
function toGridState<T>(state: ListState<T>): GridState<unknown, GridCollection<unknown>> {
  const gridState = {
    get collection() {
      return state.collection() as unknown as GridCollection<unknown>;
    },
    get disabledKeys() {
      return state.disabledKeys();
    },
    get disabledBehavior() {
      return state.disabledBehavior() ?? "all";
    },
    get isKeyboardNavigationDisabled() {
      return false;
    },
    get focusedKey() {
      return state.focusedKey();
    },
    get childFocusStrategy() {
      return state.childFocusStrategy();
    },
    get isFocused() {
      return state.isFocused();
    },
    get selectionMode() {
      return state.selectionMode();
    },
    get selectionBehavior(): SelectionBehavior {
      return state.selectionBehavior() ?? "toggle";
    },
    get disallowEmptySelection() {
      return state.disallowEmptySelection();
    },
    get selectedKeys() {
      return state.selectedKeys();
    },
    get isEmpty() {
      return state.isEmpty();
    },
    get isSelectAll() {
      return state.isSelectAll();
    },
    isSelected: (key: Key) => state.isSelected(key),
    isDisabled: (key: Key) => state.isDisabled(key),
    setFocusedKey: (key: Key | null, child?: FocusStrategy) => state.setFocusedKey(key, child),
    setFocused: (focused: boolean) => state.setFocused(focused),
    setSelectionBehavior: (behavior: SelectionBehavior) => state.setSelectionBehavior(behavior),
    toggleSelection: (key: Key) => state.toggleSelection(key),
    replaceSelection: (key: Key) => state.replaceSelection(key),
    setSelectedKeys: (keys: Iterable<Key>) => state.setSelectedKeys(keys),
    extendSelection: (toKey: Key) => state.extendSelection(toKey, state.collection()),
    selectAll: () => state.selectAll(),
    clearSelection: () => state.clearSelection(),
    toggleSelectAll: () => state.toggleSelectAll(),
    setKeyboardNavigationDisabled: () => {},
  };
  return gridState as unknown as GridState<unknown, GridCollection<unknown>>;
}

/**
 * Provides the behavior and accessibility implementation for a tag group component.
 * A tag group is a focusable list of labels, categories, keywords, filters, or other items,
 * with support for keyboard navigation, selection, and removal.
 */
export function createTagGroup<T>(
  props: MaybeAccessor<AriaTagGroupProps>,
  state: ListState<T>,
  _ref?: () => HTMLElement | null,
): TagGroupAria {
  const getProps = () => access(props);
  const id = createId(getProps().id);
  const descriptionId = createId();
  const errorMessageId = createId();
  const getFallbackAriaLabel = () => {
    const p = getProps();
    return !p.label && !p["aria-label"] && !p["aria-labelledby"] ? "Tag list" : undefined;
  };
  const gridState = toGridState(state);
  const sharedData: TagGroupData = {
    id,
    get onRemove() {
      return getProps().onRemove;
    },
    gridState,
  };

  // Filter DOM props
  const domProps = () =>
    filterDOMProps(getProps() as unknown as Record<string, unknown>, { labelable: true });

  // Create label handling. Do not destructure: `fieldProps` is a getter, and
  // callers pass label props that change after this function returns (a Label
  // slot starts assumed and clears when no Label child mounts).
  const labeling = createLabel({
    id,
    get label() {
      return getProps().label;
    },
    get "aria-label"() {
      return getProps()["aria-label"] ?? getFallbackAriaLabel();
    },
    get "aria-labelledby"() {
      return getProps()["aria-labelledby"];
    },
    labelElementType: "span",
  });

  // Share data with child tags before they create their aria state.
  tagGroupData.set(state, sharedData);
  onCleanup(() => {
    if (tagGroupData.get(state) === sharedData) {
      tagGroupData.delete(state);
    }
  });

  // Build aria-describedby
  const getAriaDescribedBy = () => {
    const p = getProps();
    const ids: string[] = [];
    if (p["aria-describedby"]) {
      ids.push(p["aria-describedby"]);
    }
    if (p.description) {
      ids.push(descriptionId);
    }
    if (p.errorMessage) {
      ids.push(errorMessageId);
    }
    return ids.length > 0 ? ids.join(" ") : undefined;
  };

  const getRef = () => _ref?.() ?? null;

  // useTagGroup builds useGridList with a horizontal tab delegate and wrap.
  // Arrow, Home, End, typeahead, Escape, and Ctrl+A live there.
  const grid = createGridList(
    () => {
      const p = getProps();
      return {
        id,
        orientation: "horizontal" as const,
        keyboardNavigationBehavior: "tab" as const,
        shouldFocusWrap: true,
        direction: p.direction ?? "ltr",
        isDisabled: p.isDisabled,
        selectionBehavior: state.selectionBehavior(),
        "aria-label": p["aria-label"] ?? getFallbackAriaLabel(),
        "aria-labelledby": p["aria-labelledby"],
        "aria-describedby": getAriaDescribedBy(),
      };
    },
    () => gridState,
    getRef,
  );

  // useTagGroup.ts:137-150. aria-live is polite only while focus is within.
  // The first run records the mounted size, so an empty mount does not focus.
  const [isFocusWithin, setFocusWithin] = createSignal(false);
  const { focusWithinProps } = createFocusWithin({
    onFocusWithinChange: setFocusWithin,
  });
  let prevCount = -1;
  createTrackedEffect(() => {
    const size = state.collection().size;
    const el = getRef();
    if (el && prevCount > 0 && size === 0 && isFocusWithin()) {
      el.focus();
    }
    prevCount = size;
  });

  return {
    get gridProps() {
      const p = getProps();
      const hasItems = state.collection().size > 0;

      return mergeProps(
        grid.gridProps as Record<string, unknown>,
        domProps(),
        labeling.fieldProps as Record<string, unknown>,
        focusWithinProps,
        {
          id,
          role: hasItems ? "grid" : "group",
          "aria-multiselectable":
            hasItems && state.selectionMode() === "multiple" ? true : undefined,
          "aria-atomic": false,
          "aria-relevant": "additions",
          "aria-live": isFocusWithin() ? "polite" : "off",
          "aria-describedby": getAriaDescribedBy(),
          "aria-disabled": p.isDisabled || undefined,
        },
      );
    },
    get labelProps() {
      return labeling.labelProps as Record<string, unknown>;
    },
    get descriptionProps() {
      return {
        id: descriptionId,
      };
    },
    get errorMessageProps() {
      return {
        id: errorMessageId,
      };
    },
  };
}
