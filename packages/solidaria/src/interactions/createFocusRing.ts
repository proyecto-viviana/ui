/**
 * createFocusRing hook for Solidaria
 *
 * Determines whether a focus ring should be visible for a given element.
 * Focus rings are visible when the user navigates with keyboard, but hidden
 * when using mouse/touch.
 *
 * Port of @react-aria/focus useFocusRing.
 */

import {
  type JSX,
  type Accessor,
  createSignal,
  createEffect,
  onCleanup,
  createMemo,
} from "solid-js";
import { createFocus } from "./createFocus";
import { createFocusWithin } from "./createFocusWithin";
import {
  createFocusVisibleListener,
  isFocusVisible as isGlobalFocusVisible,
} from "./createInteractionModality";

export interface FocusRingProps {
  /** Whether the element is a text input. */
  isTextInput?: boolean;
  /** Whether the element will be auto focused. */
  autoFocus?: boolean;
  /** Whether focus should be tracked within the element. */
  within?: boolean;
}

export interface FocusRingResult {
  /** Whether the element is currently focused. */
  isFocused: Accessor<boolean>;
  /** Whether the focus ring should be visible. */
  isFocusVisible: Accessor<boolean>;
  /** Props to spread on the element to track focus. */
  focusProps: JSX.HTMLAttributes<HTMLElement>;
}

/**
 * Determines whether a focus ring should be visible for a given element.
 *
 * Focus rings are visible when:
 * - The element is focused AND
 * - The user is navigating with keyboard (not mouse/touch)
 *
 * For text inputs, focus rings are always visible when focused.
 */
export function createFocusRing(props: FocusRingProps = {}): FocusRingResult {
  const { isTextInput = false, autoFocus = false, within = false } = props;

  const [isFocused, setIsFocused] = createSignal(false);
  const [focusVisibleFlag, setFocusVisibleFlag] = createSignal(autoFocus || isGlobalFocusVisible());
  const isFocusVisible = createMemo(() => isFocused() && focusVisibleFlag());

  createEffect(() => {
    const cleanup = createFocusVisibleListener(
      (visible) => {
        setFocusVisibleFlag(visible);
      },
      { isTextInput, enabled: isFocused() },
    );
    onCleanup(cleanup);
  });

  const onFocusChange = (focused: boolean) => {
    setIsFocused(focused);
    // Match RAC `useFocusRing`: re-sample global modality on every focus
    // change. `pointermove` sets currentModality to pointer without notifying
    // listeners; a FocusScope contain-restore after hover must not keep a
    // stale keyboard ring.
    setFocusVisibleFlag(isGlobalFocusVisible());
  };

  const focusResult = createFocus({
    isDisabled: within,
    onFocusChange,
  });

  const focusWithinResult = createFocusWithin({
    isDisabled: !within,
    onFocusWithinChange: onFocusChange,
  });

  return {
    isFocused,
    isFocusVisible,
    focusProps: (within
      ? focusWithinResult.focusWithinProps
      : focusResult.focusProps) as JSX.HTMLAttributes<HTMLElement>,
  };
}
