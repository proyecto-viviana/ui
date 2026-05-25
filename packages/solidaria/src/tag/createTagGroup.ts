/**
 * TagGroup hook for Solidaria
 *
 * Provides the behavior and accessibility implementation for a tag group component.
 * A tag group is a focusable list of labels, categories, keywords, filters, or other items,
 * with support for keyboard navigation, selection, and removal.
 *
 * Based on @react-aria/tag useTagGroup
 */

import { createEffect, onCleanup } from "solid-js";
import { createLabel } from "../label/createLabel";
import { filterDOMProps } from "../utils/filterDOMProps";
import { mergeProps } from "../utils/mergeProps";
import { createId } from "../ssr";
import { access, type MaybeAccessor } from "../utils/reactivity";
import type { ListState, Key } from "@proyecto-viviana/solid-stately";

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
}

export interface TagGroupAria {
  /** Props for the tag group container element. */
  gridProps: Record<string, unknown>;
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
}

export function getTagGroupData(state: ListState): TagGroupData | undefined {
  return tagGroupData.get(state);
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
  const sharedData: TagGroupData = {
    id,
    get onRemove() {
      return getProps().onRemove;
    },
  };

  // Filter DOM props
  const domProps = () =>
    filterDOMProps(getProps() as unknown as Record<string, unknown>, { labelable: true });

  // Create label handling
  const { labelProps, fieldProps } = createLabel({
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

  // Clean up the shared state when the tag group owner is disposed.
  createEffect(() => {
    tagGroupData.set(state, sharedData);

    onCleanup(() => {
      if (tagGroupData.get(state) === sharedData) {
        tagGroupData.delete(state);
      }
    });
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

  return {
    get gridProps() {
      const p = getProps();
      const hasItems = state.collection().size > 0;

      return mergeProps(domProps(), fieldProps as Record<string, unknown>, {
        id,
        role: hasItems ? "grid" : "group",
        "aria-multiselectable": hasItems && state.selectionMode() === "multiple" ? true : undefined,
        "aria-atomic": false,
        "aria-relevant": "additions",
        "aria-describedby": getAriaDescribedBy(),
        "aria-disabled": p.isDisabled || undefined,
      });
    },
    get labelProps() {
      return labelProps as Record<string, unknown>;
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
