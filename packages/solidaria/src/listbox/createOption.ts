/**
 * Provides the behavior and accessibility implementation for an option in a listbox.
 * Based on @react-aria/listbox useOption.
 */

import { type JSX, type Accessor } from "solid-js";
import { createHover, type HoverEvents } from "../interactions/createHover";
import { createFocusRing } from "../interactions/createFocusRing";
import { mergeProps } from "../utils/mergeProps";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { getListBoxData } from "./createListBox";
import type { ListState, Key } from "@proyecto-viviana/solid-stately";
import {
  createSelectableItem,
  type SelectableItemState,
} from "../selection/createSelectableItem";

export interface AriaOptionProps {
  /** The unique key for the option. */
  key: Key;
  /** Optional DOM id for the option element. Defaults to the key. */
  optionId?: string;
  /** Whether the option is disabled. */
  isDisabled?: boolean;
  /** An accessible label for the option. */
  "aria-label"?: string;
  /** Whether selection should occur on press up. */
  shouldSelectOnPressUp?: boolean;
  /** Whether to focus the option on hover. */
  shouldFocusOnHover?: boolean;
  /** Whether the option should use virtual focus instead of receiving DOM focus. */
  shouldUseVirtualFocus?: boolean;
  /** Whether the option is contained in a virtual scrolling listbox. */
  isVirtualized?: boolean;
  /** Whether press-up may occur without the press starting on this option. */
  allowsDifferentPressOrigin?: boolean;
  /** Handler called when hover starts. */
  onHoverStart?: HoverEvents["onHoverStart"];
  /** Handler called when hover ends. */
  onHoverEnd?: HoverEvents["onHoverEnd"];
  /** Handler called when hover state changes. */
  onHoverChange?: HoverEvents["onHoverChange"];
  /** Handler called when the option is activated. */
  onAction?: () => void;
}

export interface OptionAria {
  /** Props for the option element. */
  optionProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the label text inside the option. */
  labelProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the description text inside the option. */
  descriptionProps: JSX.HTMLAttributes<HTMLElement>;
  /** Whether the option is currently selected. */
  isSelected: Accessor<boolean>;
  /** Whether the option is currently focused. */
  isFocused: Accessor<boolean>;
  /** Whether the option is keyboard focused. */
  isFocusVisible: Accessor<boolean>;
  /** Whether the option is currently pressed. */
  isPressed: Accessor<boolean>;
  /** Whether the option is currently hovered. */
  isHovered: Accessor<boolean>;
  /** Whether the option is disabled. */
  isDisabled: Accessor<boolean>;
  /** Whether the option may be selected. */
  allowsSelection: Accessor<boolean>;
  /** Whether the option has an action. */
  hasAction: Accessor<boolean>;
}

/**
 * Provides the behavior and accessibility implementation for an option in a listbox.
 */
export function createOption<T>(
  props: MaybeAccessor<AriaOptionProps>,
  state: ListState<T>,
  _ref?: () => HTMLElement | null,
): OptionAria {
  const getProps = () => access(props);

  const getData = () => getListBoxData(state);

  const shouldSelectOnPressUp = () => {
    return getProps().shouldSelectOnPressUp ?? getData()?.shouldSelectOnPressUp;
  };

  const shouldFocusOnHover = () => {
    return getProps().shouldFocusOnHover ?? getData()?.shouldFocusOnHover ?? false;
  };

  const shouldUseVirtualFocus = () => {
    return getProps().shouldUseVirtualFocus ?? getData()?.shouldUseVirtualFocus ?? false;
  };

  const isVirtualized = () => {
    return getProps().isVirtualized ?? getData()?.isVirtualized ?? false;
  };

  const allowsDifferentPressOrigin = () => {
    return (
      getProps().allowsDifferentPressOrigin ??
      Boolean(shouldSelectOnPressUp() && shouldFocusOnHover())
    );
  };

  const isDisabledProp = () => {
    return Boolean(getData()?.isDisabled || getProps().isDisabled);
  };

  const optionId = () => getProps().optionId ?? String(getProps().key);

  const selectableItem = createSelectableItem<T>(
    () => {
      const key = getProps().key;
      const hasAction = getProps().onAction != null || getData()?.onAction != null;

      return {
        key,
        id: optionId(),
        isDisabled: isDisabledProp(),
        shouldSelectOnPressUp: shouldSelectOnPressUp(),
        allowsDifferentPressOrigin: allowsDifferentPressOrigin(),
        isVirtualized: isVirtualized(),
        shouldUseVirtualFocus: shouldUseVirtualFocus(),
        onAction: hasAction
          ? () => {
              getProps().onAction?.();
              getData()?.onAction?.(key);
            }
          : undefined,
        linkBehavior: getData()?.linkBehavior,
        UNSTABLE_itemBehavior: getData()?.UNSTABLE_itemBehavior,
      };
    },
    state as SelectableItemState<T>,
    () => _ref?.() ?? null,
  );

  const { hoverProps, isHovered } = createHover({
    get isDisabled() {
      return selectableItem.isDisabled();
    },
    onHoverStart(e) {
      if (shouldFocusOnHover() && !isFocusVisible()) {
        state.setFocused(true);
        state.setFocusedKey(getProps().key);
      }
      getProps().onHoverStart?.(e);
    },
    onHoverEnd(e) {
      getProps().onHoverEnd?.(e);
    },
    onHoverChange(isHovering) {
      getProps().onHoverChange?.(isHovering);
    },
  });

  const { isFocusVisible, focusProps } = createFocusRing();

  const labelId = `${getProps().key}-label`;
  const descriptionId = `${getProps().key}-desc`;

  return {
    get optionProps() {
      const key = getProps().key;
      const selectionMode = state.selectionMode();
      const ariaLabel = getProps()["aria-label"];

      return mergeProps(
        selectableItem.itemProps as Record<string, unknown>,
        hoverProps as Record<string, unknown>,
        focusProps as Record<string, unknown>,
        {
          role: "option",
          id: optionId(),
          "aria-selected": selectionMode !== "none" ? selectableItem.isSelected() : undefined,
          "aria-disabled": selectableItem.isDisabled() || undefined,
          "aria-label": ariaLabel,
          "aria-labelledby": !ariaLabel ? labelId : undefined,
          "aria-describedby": descriptionId,
          "data-selected": selectableItem.isSelected() || undefined,
          "data-focused": selectableItem.isFocused() || undefined,
          "data-focus-visible": (selectableItem.isFocused() && isFocusVisible()) || undefined,
          "data-pressed": selectableItem.isPressed() || undefined,
          "data-disabled": selectableItem.isDisabled() || undefined,
          "data-hovered": isHovered() || undefined,
        } as Record<string, unknown>,
      ) as JSX.HTMLAttributes<HTMLElement>;
    },
    labelProps: {
      id: labelId,
    },
    descriptionProps: {
      id: descriptionId,
    },
    isSelected: selectableItem.isSelected,
    isFocused: selectableItem.isFocused,
    isFocusVisible: () => selectableItem.isFocused() && isFocusVisible(),
    isPressed: selectableItem.isPressed,
    isHovered,
    isDisabled: selectableItem.isDisabled,
    allowsSelection: selectableItem.allowsSelection,
    hasAction: selectableItem.hasAction,
  };
}
