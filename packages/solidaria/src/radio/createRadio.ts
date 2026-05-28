/**
 * Radio hook for Solidaria
 *
 * Provides the behavior and accessibility implementation for an individual
 * radio button in a radio group.
 *
 * This is a 1:1 port of @react-aria/radio's useRadio hook.
 */

import { JSX, Accessor, createEffect } from "solid-js";
import { createPress } from "../interactions/createPress";
import { createFocusable } from "../interactions/createFocusable";
import { mergeProps } from "../utils/mergeProps";
import { filterDOMProps } from "../utils/filterDOMProps";
import { type MaybeAccessor, access } from "../utils/reactivity";
import { isDevEnv } from "../utils/env";
import { type RadioGroupState, radioGroupSyncVersion } from "@proyecto-viviana/solid-stately";
import { radioGroupData } from "./createRadioGroup";
import { type PressEvent } from "../interactions/PressEvent";

export interface AriaRadioProps {
  /** The value of the radio button, used when submitting an HTML form. */
  value: string;
  /** Whether the radio button is disabled. */
  isDisabled?: boolean;
  /** The label for the radio button. */
  children?: JSX.Element;
  /** Defines a string value that labels the current element. */
  "aria-label"?: string;
  /** Identifies the element (or elements) that labels the current element. */
  "aria-labelledby"?: string;
  /** Identifies the element (or elements) that describes the object. */
  "aria-describedby"?: string;
  /** Handler that is called when the press is released over the target. */
  onPress?: (e: PressEvent) => void;
  /** Handler that is called when a press interaction starts. */
  onPressStart?: (e: PressEvent) => void;
  /** Handler that is called when a press interaction ends, either over the target or when the pointer leaves the target. */
  onPressEnd?: (e: PressEvent) => void;
  /** Handler that is called when the press state changes. */
  onPressChange?: (isPressed: boolean) => void;
  /** Handler that is called when a press is released over the target, regardless of whether it started on the target or not. */
  onPressUp?: (e: PressEvent) => void;
  /** Handler that is called when the element is clicked. */
  onClick?: (e: MouseEvent) => void;
  /** Handler that is called when the element receives focus. */
  onFocus?: (e: FocusEvent) => void;
  /** Handler that is called when the element loses focus. */
  onBlur?: (e: FocusEvent) => void;
  /** Handler that is called when the element's focus status changes. */
  onFocusChange?: (isFocused: boolean) => void;
  /** Handler that is called when a key is pressed. */
  onKeyDown?: (e: KeyboardEvent) => void;
  /** Handler that is called when a key is released. */
  onKeyUp?: (e: KeyboardEvent) => void;
  /** Whether to autofocus the element. */
  autoFocus?: boolean;
}

export interface RadioAria {
  /** Props for the label wrapper element. */
  labelProps: JSX.LabelHTMLAttributes<HTMLLabelElement>;
  /** Props for the input element. */
  inputProps: JSX.InputHTMLAttributes<HTMLInputElement>;
  /** Whether the radio is disabled. */
  isDisabled: boolean;
  /** Whether the radio is currently selected. */
  isSelected: Accessor<boolean>;
  /** Whether the radio is in a pressed state. */
  isPressed: Accessor<boolean>;
}

/**
 * Provides the behavior and accessibility implementation for an individual
 * radio button in a radio group.
 */
export function createRadio(
  props: MaybeAccessor<AriaRadioProps>,
  state: RadioGroupState,
  ref: () => HTMLInputElement | null,
): RadioAria {
  const getProps = () => access(props);

  const isDisabled = () => getProps().isDisabled || state.isDisabled;
  const value = () => getProps().value;
  const isSelected: Accessor<boolean> = () => {
    const selected = state.selectedValue();
    const v = value();
    return selected === v;
  };

  createEffect(() => {
    const p = getProps();
    const hasChildren = p.children != null;
    const hasAriaLabel = p["aria-label"] != null || p["aria-labelledby"] != null;
    if (!hasChildren && !hasAriaLabel && isDevEnv()) {
      console.warn(
        "If you do not provide children, you must specify an aria-label for accessibility",
      );
    }
  });

  // SolidJS-specific: Sync DOM checked state whenever selection changes
  // This handles:
  // 1. Initial render with controlled value
  // 2. Controlled mode where parent doesn't update value after click
  // 3. Native radio group behavior (clicking one unchecks others)
  //
  // Unlike React's VDOM reconciliation that re-applies all props on every render,
  // SolidJS only updates when signals change. Native radio behavior can change
  // the DOM checked state without our knowledge, so we need to actively sync.
  //
  // We track `syncVersion` to ensure this effect runs on EVERY selection attempt,
  // even in controlled mode where isSelected() may not change.
  createEffect(() => {
    // The WeakMap accessor is outside the public API to maintain React Aria parity.
    const syncVersion = radioGroupSyncVersion.get(state);
    syncVersion?.();

    const shouldBeChecked = isSelected();
    const inputEl = ref();
    if (!inputEl) return;

    if (inputEl.checked !== shouldBeChecked) {
      inputEl.checked = shouldBeChecked;
    }
  });

  // SolidJS-specific: Unlike React, the input's `checked` state can get out of sync
  // with our reactive state. This happens because:
  // 1. A readonly `<input type="radio" />` is always "checkable" in the browser
  // 2. Even controlled inputs (`<input checked={isChecked} />`) will change their
  //    internal `checked` state when clicked, regardless of what the signal says
  //
  // To prevent this, we force the input's `checked` DOM property to match our state
  // after processing the change. This is the pattern used by Kobalte and other
  // SolidJS component libraries.
  const onChange: JSX.EventHandler<HTMLInputElement, Event> = (e) => {
    e.stopPropagation();

    const target = e.target as HTMLInputElement;

    // Guard against disabled state - JSDOM's fireEvent may bypass disabled check
    if (isDisabled()) {
      target.checked = isSelected();
      return;
    }

    state.setSelectedValue(value());

    // Focus the input when clicked
    // In real browsers this happens automatically, but JSDOM/fireEvent doesn't trigger it
    target.focus();

    // Force the DOM checked state to match our reactive state
    // This handles controlled mode where the parent might not update the value
    target.checked = isSelected();
  };

  // Handle press state for keyboard interactions and cases where labelProps is not used.
  const { pressProps, isPressed } = createPress({
    get onPressStart() {
      return getProps().onPressStart;
    },
    get onPressEnd() {
      return getProps().onPressEnd;
    },
    get onPressChange() {
      return getProps().onPressChange;
    },
    get onPress() {
      return getProps().onPress;
    },
    get onPressUp() {
      return getProps().onPressUp;
    },
    get onClick() {
      return getProps().onClick;
    },
    get isDisabled() {
      return isDisabled();
    },
  });

  const { pressProps: labelPressProps, isPressed: isLabelPressed } = createPress({
    get onPressStart() {
      return getProps().onPressStart;
    },
    get onPressEnd() {
      return getProps().onPressEnd;
    },
    get onPressChange() {
      return getProps().onPressChange;
    },
    get onPressUp() {
      return getProps().onPressUp;
    },
    get onClick() {
      return getProps().onClick;
    },
    onPress(e: PressEvent) {
      getProps().onPress?.(e);
      state.setSelectedValue(value());
      ref()?.focus();
    },
    get isDisabled() {
      return isDisabled();
    },
  });

  const { focusableProps } = createFocusable(
    {
      get isDisabled() {
        return isDisabled();
      },
      get autoFocus() {
        return getProps().autoFocus;
      },
      onFocus(e: FocusEvent) {
        getProps().onFocus?.(e);
        state.setLastFocusedValue(value());
      },
      get onBlur() {
        return getProps().onBlur;
      },
      get onFocusChange() {
        return getProps().onFocusChange;
      },
      get onKeyDown() {
        return getProps().onKeyDown;
      },
      get onKeyUp() {
        return getProps().onKeyUp;
      },
    },
    ref as unknown as (el: HTMLElement) => void,
  );

  const interactions = mergeProps(pressProps, focusableProps);

  const domProps = () =>
    filterDOMProps(getProps() as unknown as Record<string, unknown>, { labelable: true });

  const getTabIndex = (): number | undefined => {
    if (isDisabled()) {
      return undefined;
    }

    const selected = state.selectedValue();
    const lastFocused = state.lastFocusedValue();
    const currentValue = value();

    if (selected != null) {
      if (selected === currentValue) {
        return 0;
      }
      return -1;
    } else {
      if (lastFocused === currentValue || lastFocused == null) {
        return 0;
      }
      return -1;
    }
  };

  const getGroupData = () => radioGroupData.get(state);

  const combinedIsPressed: Accessor<boolean> = () => isPressed() || isLabelPressed();

  return {
    labelProps: mergeProps(labelPressProps, {
      onClick: (e: MouseEvent) => e.preventDefault(),
      onMouseDown: (e: MouseEvent) => e.preventDefault(),
    }),
    get inputProps() {
      const p = getProps();
      const groupData = getGroupData();

      const describedByIds: string[] = [];
      if (p["aria-describedby"]) {
        describedByIds.push(p["aria-describedby"]);
      }
      if (state.isInvalid && groupData?.errorMessageId) {
        describedByIds.push(groupData.errorMessageId);
      }
      if (groupData?.descriptionId) {
        describedByIds.push(groupData.descriptionId);
      }
      const ariaDescribedBy = describedByIds.length > 0 ? describedByIds.join(" ") : undefined;
      const validationBehavior = groupData?.validationBehavior ?? "native";

      return mergeProps(domProps(), interactions, {
        type: "radio" as const,
        name: groupData?.name,
        form: groupData?.form,
        tabIndex: getTabIndex(),
        disabled: isDisabled(),
        required: validationBehavior === "native" ? state.isRequired : undefined,
        checked: isSelected(),
        value: value(),
        onChange,
        "aria-describedby": ariaDescribedBy,
      }) as JSX.InputHTMLAttributes<HTMLInputElement>;
    },
    isDisabled: isDisabled(),
    isSelected,
    isPressed: combinedIsPressed,
  };
}
