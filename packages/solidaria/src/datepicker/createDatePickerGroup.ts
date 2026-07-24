/**
 * createDatePickerGroup hook for Solidaria
 *
 * Provides keyboard (arrow navigation between segments) and pointer (focus the
 * last non-placeholder segment on press) behavior for the date field group.
 * Faithful port of @react-aria/datepicker `useDatePickerGroup`: LTR arrow
 * navigation goes through the focus manager, RTL uses geometric segment lookup,
 * and alt+ArrowDown/Up opens the popover only when the state exposes `setOpen`
 * (i.e. a date picker, never a standalone field).
 */

import { createMemo, type Accessor } from "solid-js";
import { mergeProps } from "../utils/mergeProps";
import { useLocale } from "../i18n";
import { createPress } from "../interactions/createPress";
import { createFocusManager } from "../focus/FocusScope";
import { getFocusableTreeWalker } from "../utils/dom";
import { nodeContains, getEventTarget } from "../utils";

export interface DatePickerGroupState {
  setOpen?: (isOpen: boolean) => void;
}

/**
 * Provides keyboard and pointer behavior for the date field/picker segment group.
 */
export function createDatePickerGroup(
  state: DatePickerGroupState,
  ref: () => HTMLElement | null,
  disableArrowNavigation?: boolean,
): Accessor<Record<string, unknown>> {
  const localeInfo = useLocale();
  const focusManager = createFocusManager(ref);

  // Geometric segment lookup for RTL, where DOM order does not match visual order.
  const findNextSegment = (
    group: HTMLElement,
    fromX: number,
    direction: number,
  ): HTMLElement | null => {
    const walker = getFocusableTreeWalker(group, { tabbable: true });
    let node = walker.nextNode() as HTMLElement | null;
    let closest: HTMLElement | null = null;
    let closestDistance = Infinity;
    while (node) {
      const x = node.getBoundingClientRect().left;
      const distance = x - fromX;
      const absoluteDistance = Math.abs(distance);
      if (Math.sign(distance) === direction && absoluteDistance < closestDistance) {
        closest = node;
        closestDistance = absoluteDistance;
      }
      node = walker.nextNode() as HTMLElement | null;
    }
    return closest;
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!nodeContains(e.currentTarget as Node | null, getEventTarget(e) as Node | null)) {
      return;
    }
    // Open the popover on alt + arrow down (date pickers only).
    if (e.altKey && (e.key === "ArrowDown" || e.key === "ArrowUp") && "setOpen" in state) {
      e.preventDefault();
      e.stopPropagation();
      state.setOpen?.(true);
    }
    if (disableArrowNavigation) {
      return;
    }
    const direction = localeInfo().direction;
    switch (e.key) {
      case "ArrowLeft": {
        e.preventDefault();
        e.stopPropagation();
        const root = ref();
        if (direction === "rtl") {
          if (root) {
            const target = getEventTarget(e) as HTMLElement;
            const prev = findNextSegment(root, target.getBoundingClientRect().left, -1);
            prev?.focus();
          }
        } else {
          focusManager.focusPrevious();
        }
        break;
      }
      case "ArrowRight": {
        e.preventDefault();
        e.stopPropagation();
        const root = ref();
        if (direction === "rtl") {
          if (root) {
            const target = getEventTarget(e) as HTMLElement;
            const next = findNextSegment(root, target.getBoundingClientRect().left, 1);
            next?.focus();
          }
        } else {
          focusManager.focusNext();
        }
        break;
      }
    }
  };

  // Focus the last non-placeholder segment on press within the field.
  const focusLast = () => {
    const root = ref();
    if (!root) {
      return;
    }
    // Try to find the segment prior to the element that was clicked on.
    let target = (
      typeof window !== "undefined" ? (window.event as Event | undefined)?.target : null
    ) as HTMLElement | null;
    const walker = getFocusableTreeWalker(root, { tabbable: true });
    if (target) {
      walker.currentNode = target;
      target = walker.previousNode() as HTMLElement | null;
    }
    // If no target found, find the last element from the end.
    if (!target) {
      let last: Node | null;
      do {
        last = walker.lastChild();
        if (last) {
          target = last as HTMLElement;
        }
      } while (last);
    }
    // Now go backwards until we find an element that is not a placeholder.
    while (target?.hasAttribute("data-placeholder")) {
      const prev = walker.previousNode() as HTMLElement | null;
      if (prev && prev.hasAttribute("data-placeholder")) {
        target = prev;
      } else {
        break;
      }
    }
    target?.focus();
  };

  const { pressProps } = createPress({
    preventFocusOnPress: true,
    allowTextSelectionOnPress: true,
    onPressStart(e) {
      if (e.pointerType === "mouse") {
        focusLast();
      }
    },
    onPress(e) {
      if (e.pointerType === "touch" || e.pointerType === "pen") {
        focusLast();
      }
    },
  });

  return createMemo(() => mergeProps(pressProps, { onKeyDown }));
}
