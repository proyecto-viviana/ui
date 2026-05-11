/**
 * createDatePickerGroup hook for Solidaria
 *
 * Provides keyboard and pointer behavior for the date picker field group.
 * Based on @react-aria/datepicker useDatePickerGroup
 */

import { createMemo } from "solid-js";
import { type MaybeAccessor, access } from "../utils/reactivity";
import { mergeProps } from "../utils/mergeProps";
import { useLocale } from "../i18n";
import { createPress } from "../interactions/createPress";
import { nodeContains, getEventTarget } from "../utils";
import { focusSafely } from "../utils/focus";

export interface AriaDatePickerGroupProps {
  isDisabled?: boolean;
}

export interface DatePickerGroupAria {
  groupProps: Record<string, unknown>;
}

export function createDatePickerGroup(
  props: MaybeAccessor<AriaDatePickerGroupProps>,
  state: { setOpen: (isOpen: boolean) => void; isOpen: boolean; isDisabled: () => boolean },
  ref: () => HTMLElement | null,
  disableArrowNavigation?: boolean,
): DatePickerGroupAria {
  const locale = useLocale();
  const resolvedProps = createMemo(() => access(props));

  const onKeyDown = (e: KeyboardEvent) => {
    if (!nodeContains(e.currentTarget as Node | null, getEventTarget(e) as Node | null)) {
      return;
    }

    // Open the popover on alt + arrow down/up
    if (e.altKey && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      e.stopPropagation();
      state.setOpen(true);
      return;
    }

    if (disableArrowNavigation) return;

    const root = ref();
    if (!root) return;

    const segments = Array.from(root.querySelectorAll('[role="spinbutton"]')) as HTMLElement[];
    if (segments.length === 0) return;

    const activeElement = root.ownerDocument.activeElement;
    let currentIndex = -1;
    if (activeElement) {
      currentIndex = segments.indexOf(activeElement as HTMLElement);
    }

    const direction = locale().direction;

    switch (e.key) {
      case "ArrowLeft": {
        e.preventDefault();
        e.stopPropagation();
        if (direction === "rtl") {
          // geometric fallback: in RTL, left arrow moves toward the end (next)
          const nextIndex = currentIndex >= 0 ? currentIndex + 1 : 0;
          if (nextIndex < segments.length) {
            focusSafely(segments[nextIndex]);
          }
        } else {
          const prevIndex = currentIndex >= 0 ? currentIndex - 1 : segments.length - 1;
          if (prevIndex >= 0) {
            focusSafely(segments[prevIndex]);
          }
        }
        break;
      }
      case "ArrowRight": {
        e.preventDefault();
        e.stopPropagation();
        if (direction === "rtl") {
          // geometric fallback: in RTL, right arrow moves toward the start (previous)
          const prevIndex = currentIndex >= 0 ? currentIndex - 1 : segments.length - 1;
          if (prevIndex >= 0) {
            focusSafely(segments[prevIndex]);
          }
        } else {
          const nextIndex = currentIndex >= 0 ? currentIndex + 1 : 0;
          if (nextIndex < segments.length) {
            focusSafely(segments[nextIndex]);
          }
        }
        break;
      }
    }
  };

  const focusLast = (event?: Event) => {
    const root = ref();
    if (!root) return;

    const target = event ? getEventTarget(event) : null;

    const segments = Array.from(root.querySelectorAll('[role="spinbutton"]')) as HTMLElement[];
    if (segments.length === 0) return;

    let startIndex = segments.length - 1;
    if (target) {
      const targetIndex = segments.indexOf(target as HTMLElement);
      if (targetIndex >= 0) {
        startIndex = targetIndex;
      }
    }

    for (let i = startIndex; i >= 0; i--) {
      const segment = segments[i];
      if (segment.getAttribute("data-placeholder") !== "true") {
        focusSafely(segment);
        return;
      }
    }
  };

  const { pressProps } = createPress({
    isDisabled: () => resolvedProps().isDisabled || state.isDisabled(),
    preventFocusOnPress: true,
    allowTextSelectionOnPress: true,
    onPressStart(e) {
      if (e.pointerType === "mouse") {
        focusLast(e as unknown as Event);
      }
    },
    onPress(e) {
      if (e.pointerType === "touch" || e.pointerType === "pen") {
        focusLast(e as unknown as Event);
      }
    },
  });

  return {
    get groupProps() {
      return mergeProps(pressProps, {
        onKeyDown,
      });
    },
  };
}
