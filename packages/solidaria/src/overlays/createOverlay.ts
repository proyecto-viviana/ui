/**
 * Provides the behavior for overlays such as dialogs, popovers, and menus.
 * Based on @react-aria/overlays useOverlay.
 */

import { createEffect, onCleanup, type JSX } from "solid-js";
import { createInteractOutside } from "./createInteractOutside";
import { createFocusWithin } from "../interactions/createFocusWithin";
import { getOwnerDocument, nodeContains } from "../utils";

export interface AriaOverlayProps {
  /** Whether the overlay is currently open. */
  isOpen?: boolean;
  /** Handler that is called when the overlay should close. */
  onClose?: () => void;
  /**
   * Whether to close the overlay when the user interacts outside it.
   * @default false
   */
  isDismissable?: boolean;
  /** Whether the overlay should close when focus is lost or moves outside it. */
  shouldCloseOnBlur?: boolean;
  /**
   * Whether pressing the escape key to close the overlay should be disabled.
   * @default false
   */
  isKeyboardDismissDisabled?: boolean;
  /**
   * When user interacts with the argument element outside of the overlay ref,
   * return true if onClose should be called. This gives you a chance to filter
   * out interaction with elements that should not dismiss the overlay.
   * By default, onClose will always be called on interaction outside the overlay ref.
   */
  shouldCloseOnInteractOutside?: (element: Element) => boolean;
}

export interface OverlayAria {
  /** Props to apply to the overlay container element. */
  overlayProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props to apply to the underlay element, if any. */
  underlayProps: JSX.HTMLAttributes<HTMLElement>;
}

// Stack of visible overlays, used to ensure only topmost overlay closes
const visibleOverlays: Array<() => Element | null> = [];

/**
 * Provides the behavior for overlays such as dialogs, popovers, and menus.
 * Hides the overlay when the user interacts outside it, when the Escape key is pressed,
 * or optionally, on blur. Only the top-most overlay will close at once.
 */
export function createOverlay(props: AriaOverlayProps, ref: () => Element | null): OverlayAria {
  const onClose = () => props.onClose;
  const shouldCloseOnBlur = () => props.shouldCloseOnBlur;
  const isOpen = () => props.isOpen ?? false;
  const isDismissable = () => props.isDismissable ?? false;
  const isKeyboardDismissDisabled = () => props.isKeyboardDismissDisabled ?? false;
  const shouldCloseOnInteractOutside = () => props.shouldCloseOnInteractOutside;

  // Add the overlay ref to the stack of visible overlays on mount, and remove on unmount.
  createEffect(() => {
    if (isOpen() && !visibleOverlays.includes(ref)) {
      visibleOverlays.push(ref);
    }

    onCleanup(() => {
      const index = visibleOverlays.indexOf(ref);
      if (index >= 0) {
        visibleOverlays.splice(index, 1);
      }
    });
  });

  // Only hide the overlay when it is the topmost visible overlay in the stack
  const onHide = () => {
    const close = onClose();
    if (visibleOverlays[visibleOverlays.length - 1] === ref && close) {
      close();
    }
  };

  const onInteractOutsideStart = (e: PointerEvent) => {
    const shouldClose = shouldCloseOnInteractOutside();
    if (!shouldClose || shouldClose(e.target as Element)) {
      if (visibleOverlays[visibleOverlays.length - 1] === ref) {
        e.stopPropagation();
        e.preventDefault();
      }
    }
  };

  const onInteractOutside = (e: PointerEvent) => {
    const shouldClose = shouldCloseOnInteractOutside();
    if (!shouldClose || shouldClose(e.target as Element)) {
      if (visibleOverlays[visibleOverlays.length - 1] === ref) {
        e.stopPropagation();
        e.preventDefault();
      }
      onHide();
    }
  };

  // Handle clicking outside the overlay to close it.
  createEffect(() => {
    if (!isDismissable() || !isOpen()) {
      return;
    }

    createInteractOutside({
      ref,
      onInteractOutside,
      onInteractOutsideStart,
      isDisabled: false,
    });
  });

  createEffect(() => {
    if (!isOpen() || !shouldCloseOnBlur()) {
      return;
    }

    const overlay = ref();
    if (!overlay) {
      return;
    }

    const ownerDocument = getOwnerDocument(overlay);
    const onFocusIn = (event: FocusEvent) => {
      if (!isOpen()) {
        return;
      }

      const currentOverlay = ref();
      const target = event.target as Element | null;
      if (!currentOverlay || !target || nodeContains(currentOverlay, target)) {
        return;
      }

      const shouldClose = shouldCloseOnInteractOutside();
      if (!shouldClose || shouldClose(target)) {
        onHide();
      }
    };

    ownerDocument.addEventListener("focusin", onFocusIn, true);
    onCleanup(() => ownerDocument.removeEventListener("focusin", onFocusIn, true));
  });

  // Handle focus within for blur detection
  const { focusWithinProps } = createFocusWithin({
    get isDisabled() {
      return !shouldCloseOnBlur();
    },
    onBlurWithin: (e) => {
      // Do not close if relatedTarget is null, which means focus is lost to the body.
      // That can happen when switching tabs, or due to a browser bug.
      // Clicking on the body to close the overlay should already be handled by createInteractOutside.
      if (!e.relatedTarget) {
        return;
      }

      const shouldClose = shouldCloseOnInteractOutside();
      if (!shouldClose || shouldClose(e.relatedTarget as Element)) {
        onClose()?.();
      }
    },
  });

  // Handle the escape key
  const onKeyDown: JSX.EventHandler<HTMLElement, KeyboardEvent> = (e) => {
    if (e.key === "Escape" && !isKeyboardDismissDisabled() && !e.isComposing) {
      e.stopPropagation();
      e.preventDefault();
      onHide();
    }
  };

  const onPointerDownUnderlay: JSX.EventHandler<HTMLElement, PointerEvent> = (e) => {
    // Fixes a Firefox issue that starts text selection
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1675846
    if (e.target === e.currentTarget) {
      e.preventDefault();
    }
  };

  return {
    overlayProps: {
      onKeyDown,
      ...focusWithinProps,
    },
    underlayProps: {
      onPointerDown: onPointerDownUnderlay,
    },
  };
}
