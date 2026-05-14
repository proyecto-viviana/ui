/**
 * createPress - Handles press interactions across mouse, touch, keyboard, and virtual clicks.
 *
 * This is a 1-1 port of React-Aria's usePress hook adapted for SolidJS.
 * All behaviors, edge cases, and platform-specific handling are preserved.
 */

import { createSignal, JSX, Accessor, onCleanup } from "solid-js";
import { PressEvent, PointerType, createPressEvent, type PressEventSource } from "./PressEvent";
import {
  nodeContains,
  getEventTarget,
  isValidKeyboardEvent,
  isHTMLAnchorLink,
  shouldPreventDefaultKeyboard,
  isVirtualClick,
  isVirtualPointerEvent,
  isPointOverTarget,
  getTouchFromEvent,
  getTouchById,
  disableTextSelection,
  restoreTextSelection,
  preventFocus,
  openLink,
  isMac,
  createGlobalListeners,
  setEventTarget,
} from "../utils";

export { PressEvent, type PointerType } from "./PressEvent";
export type { IPressEvent, PressEventType } from "./PressEvent";

export interface CreatePressProps {
  /** Whether the target is currently disabled. */
  isDisabled?: Accessor<boolean> | boolean;
  /** Handler called when the press is released over the target. */
  onPress?: (e: PressEvent) => void;
  /** Handler called when a press interaction starts. */
  onPressStart?: (e: PressEvent) => void;
  /**
   * Handler called when a press interaction ends, either
   * over the target or when the pointer leaves the target.
   */
  onPressEnd?: (e: PressEvent) => void;
  /** Handler called when a press is released over the target, regardless of whether it started on the target. */
  onPressUp?: (e: PressEvent) => void;
  /** Handler called when the press state changes. */
  onPressChange?: (isPressed: boolean) => void;
  /**
   * Handler called on native click event.
   * Some third-party libraries pass onClick instead of onPress.
   * This matches the browser's native activation behavior for certain elements.
   */
  onClick?: (e: MouseEvent) => void;
  /** Whether the press should be visual only, not triggering onPress. */
  isPressed?: Accessor<boolean> | boolean;
  /** Whether to prevent focus when pressing. */
  preventFocusOnPress?: boolean;
  /** Whether long press should cancel when pointer moves out of target. */
  shouldCancelOnPointerExit?: boolean;
  /** Whether text selection should be allowed during press. */
  allowTextSelectionOnPress?: boolean;
}

export interface PressResult {
  /** Whether the target is currently pressed. */
  isPressed: Accessor<boolean>;
  /** Props to spread on the target element. */
  pressProps: JSX.HTMLAttributes<HTMLElement>;
}

function isDisabledValue(isDisabled: Accessor<boolean> | boolean | undefined): boolean {
  if (typeof isDisabled === "function") {
    return isDisabled();
  }
  return isDisabled ?? false;
}

function isPressedValue(isPressed: Accessor<boolean> | boolean | undefined): boolean {
  if (typeof isPressed === "function") {
    return isPressed();
  }
  return isPressed ?? false;
}

// Track which links have been programmatically clicked to avoid double activation
const linkClickedSet = new WeakSet<HTMLElement>();

// CSS for preventing double-tap zoom delay
let pressableCSSInjected = false;
function injectPressableCSS(): void {
  if (pressableCSSInjected || typeof document === "undefined") return;

  const style = document.createElement("style");
  style.id = "solidaria-pressable-style";
  style.textContent = `
    [data-solidaria-pressable] {
      touch-action: pan-x pan-y pinch-zoom;
    }
  `;
  document.head.appendChild(style);
  pressableCSSInjected = true;
}

/**
 * Handles press interactions across mouse, touch, keyboard, and screen readers.
 * Provides consistent press behavior regardless of input method.
 *
 * Based on react-aria's usePress but adapted for SolidJS.
 */
export function createPress(props: CreatePressProps = {}): PressResult {
  // Internal pressed state (for visual feedback)
  const [internalIsPressed, setInternalIsPressed] = createSignal(false);

  // Use controlled isPressed if provided, otherwise internal state
  const isPressed = (): boolean => {
    const controlledPressed = isPressedValue(props.isPressed);
    if (controlledPressed) {
      return controlledPressed;
    }
    return internalIsPressed();
  };

  // State tracking (using plain variables - SolidJS doesn't need refs for mutable state)
  let pressState = {
    isPressed: false,
    ignoreEmulatedMouseEvents: false,
    ignoreClickAfterPress: false,
    didFirePressStart: false,
    isTriggeringEvent: false,
    activePointerId: null as number | null,
    target: null as Element | null,
    isOverTarget: false,
    pointerType: null as PointerType | null,
    userSelect: undefined as string | undefined,
    metaKeyEvents: null as Map<string, KeyboardEvent> | null,
    clickCleanup: null as (() => void) | null,
    focusCleanup: null as (() => void) | null,
  };

  // Global listeners manager
  const { addGlobalListener, removeAllGlobalListeners } = createGlobalListeners();

  // Inject CSS on first use
  injectPressableCSS();

  // --- Event Triggers ---

  const triggerPressStart = (
    originalEvent: PressEventSource,
    pointerType: PointerType,
  ): boolean => {
    if (isDisabledValue(props.isDisabled) || pressState.didFirePressStart) {
      return false;
    }

    let shouldStopPropagation = true;
    pressState.isTriggeringEvent = true;

    if (props.onPressStart) {
      const event = createPressEvent("pressstart", pointerType, originalEvent, pressState.target!);
      props.onPressStart(event);
      shouldStopPropagation = event.shouldStopPropagation;
    }

    if (props.onPressChange) {
      props.onPressChange(true);
    }

    pressState.isTriggeringEvent = false;
    pressState.didFirePressStart = true;
    setInternalIsPressed(true);

    return shouldStopPropagation;
  };

  const triggerPressEnd = (
    originalEvent: PressEventSource,
    pointerType: PointerType,
    wasPressed = true,
  ): boolean => {
    if (!pressState.didFirePressStart) {
      return false;
    }

    pressState.didFirePressStart = false;
    pressState.isTriggeringEvent = true;

    let shouldStopPropagation = true;
    if (props.onPressEnd) {
      const event = createPressEvent("pressend", pointerType, originalEvent, pressState.target!);
      props.onPressEnd(event);
      shouldStopPropagation = event.shouldStopPropagation;
    }

    if (props.onPressChange) {
      props.onPressChange(false);
    }

    setInternalIsPressed(false);

    if (wasPressed && !isDisabledValue(props.isDisabled)) {
      if (props.onPress) {
        const event = createPressEvent("press", pointerType, originalEvent, pressState.target!);
        props.onPress(event);
        shouldStopPropagation = shouldStopPropagation && event.shouldStopPropagation;
      }
    }

    pressState.isTriggeringEvent = false;

    return shouldStopPropagation;
  };

  const triggerPressUp = (originalEvent: PressEventSource, pointerType: PointerType): boolean => {
    if (isDisabledValue(props.isDisabled)) {
      return false;
    }

    if (props.onPressUp) {
      pressState.isTriggeringEvent = true;
      const event = createPressEvent("pressup", pointerType, originalEvent, pressState.target!);
      props.onPressUp(event);
      pressState.isTriggeringEvent = false;
      return event.shouldStopPropagation;
    }

    return true;
  };

  const triggerSyntheticClick = (
    originalEvent: KeyboardEvent | TouchEvent,
    target: HTMLElement,
  ): void => {
    if (isDisabledValue(props.isDisabled)) {
      return;
    }

    if (props.onClick) {
      const event = new MouseEvent("click", originalEvent as MouseEventInit);
      setEventTarget(event, target);
      props.onClick(event);
    }
  };

  const cancel = (originalEvent: PressEventSource): void => {
    if (!pressState.isPressed) {
      return;
    }

    if (pressState.target && pressState.didFirePressStart && pressState.pointerType != null) {
      triggerPressEnd(originalEvent, pressState.pointerType, false);
    }

    pressState.isPressed = false;
    pressState.isOverTarget = false;
    pressState.activePointerId = null;
    pressState.pointerType = null;

    removeAllGlobalListeners();

    // Clean up click timeout/listener if set
    if (pressState.clickCleanup) {
      pressState.clickCleanup();
      pressState.clickCleanup = null;
    }

    if (pressState.focusCleanup) {
      pressState.focusCleanup();
      pressState.focusCleanup = null;
    }

    if (!props.allowTextSelectionOnPress) {
      restoreTextSelection(pressState.target as HTMLElement);
    }
  };

  // --- Pointer Event Handlers (used when PointerEvent is available) ---

  const onPointerDown: JSX.EventHandler<HTMLElement, PointerEvent> = (e) => {
    // Only handle left clicks, and ignore events that bubbled through portals
    const button = e.button ?? 0;
    if (button !== 0 || !nodeContains(e.currentTarget, getEventTarget(e))) {
      return;
    }

    // iOS VoiceOver bug: fires pointer events with incorrect coordinates
    // Let the click handler deal with it instead
    if (isVirtualPointerEvent(e)) {
      pressState.pointerType = "virtual";
      return;
    }

    pressState.pointerType = e.pointerType as PointerType;

    if (!pressState.isPressed) {
      pressState.isPressed = true;
      pressState.isOverTarget = true;
      pressState.activePointerId = e.pointerId;
      pressState.target = e.currentTarget;

      if (!props.allowTextSelectionOnPress) {
        disableTextSelection(pressState.target as HTMLElement);
      }

      const shouldStopPropagation = triggerPressStart(e, pressState.pointerType);
      if (shouldStopPropagation) {
        e.stopPropagation();
      }

      // Set up global listeners for pointer events
      addGlobalListener("pointerup", onPointerUp);
      addGlobalListener("pointercancel", onPointerCancel);
    }
  };

  // Mouse down handler when using pointer events - only prevents focus, doesn't trigger press
  const onMouseDownPointer: JSX.EventHandler<HTMLElement, MouseEvent> = (e) => {
    if (!nodeContains(e.currentTarget, getEventTarget(e))) {
      return;
    }

    if (e.button === 0) {
      if (props.preventFocusOnPress) {
        pressState.focusCleanup?.();
        pressState.focusCleanup = preventFocus(getEventTarget(e) as Element | null) ?? null;
      }
      e.stopPropagation();
    }
  };

  const onPointerUp = (e: PointerEvent): void => {
    // Only handle events for our active pointer
    const button = e.button ?? 0;
    if (
      e.pointerId !== pressState.activePointerId ||
      !pressState.isPressed ||
      button !== 0 ||
      !pressState.target
    ) {
      return;
    }

    const isOverTarget = nodeContains(pressState.target, getEventTarget(e) as Element);
    if (isOverTarget && pressState.pointerType != null && pressState.pointerType !== "virtual") {
      // Pointer released over target - wait for onClick to complete the press sequence.
      // This matches React-Aria's behavior for compatibility with DOM mutations and third-party libraries.
      // https://github.com/adobe/react-spectrum/issues/1513
      // https://issues.chromium.org/issues/40732224
      //
      // However, if stopPropagation is called on the click event (e.g., by a child input element),
      // the onClick handler on this element won't fire. We work around this by triggering a click
      // ourselves after a timeout. This timeout is canceled during the click event in case the
      // real one fires first. The timeout must be at least 32ms, because Safari on iOS delays the
      // click event on non-form elements without certain ARIA roles (for hover emulation).
      // https://github.com/WebKit/WebKit/blob/dccfae42bb29bd4bdef052e469f604a9387241c0/Source/WebKit/WebProcess/WebPage/ios/WebPageIOS.mm#L875-L892
      let clickFired = false;
      const timeout = setTimeout(() => {
        // Guard for SSR/test environments where the element may no longer exist
        if (typeof HTMLElement === "undefined") {
          return;
        }
        if (pressState.isPressed && pressState.target instanceof HTMLElement) {
          if (clickFired) {
            // Click already happened, just cancel the press state
            cancel(e);
          } else {
            // Click didn't happen (probably due to stopPropagation), trigger it manually
            pressState.target.focus();
            pressState.target.click();
          }
        }
      }, 80);

      // Use a capturing listener to track if a click occurred.
      // If stopPropagation is called it may never reach our handler.
      const doc = pressState.target.ownerDocument ?? document;
      const clickListener = () => {
        clickFired = true;
      };
      doc.addEventListener("click", clickListener, true);

      // Store cleanup function
      pressState.clickCleanup = () => {
        clearTimeout(timeout);
        doc.removeEventListener("click", clickListener, true);
      };

      pressState.isOverTarget = false;
    } else {
      // Pointer released outside target, or virtual - cancel the press
      cancel(e);
    }
  };

  const onPointerCancel = (e: PointerEvent): void => {
    if (e.pointerId === pressState.activePointerId) {
      cancel(e);
    }
  };

  const onPointerUpTarget: JSX.EventHandler<HTMLElement, PointerEvent> = (e) => {
    if (!nodeContains(e.currentTarget, getEventTarget(e)) || pressState.pointerType === "virtual") {
      return;
    }

    if (e.button === 0 && !pressState.isPressed) {
      triggerPressUp(e, (pressState.pointerType || e.pointerType || "mouse") as PointerType);
    }
  };

  const onPointerEnter: JSX.EventHandler<HTMLElement, PointerEvent> = (e) => {
    if (
      e.pointerId === pressState.activePointerId &&
      pressState.target &&
      !pressState.isOverTarget &&
      pressState.pointerType != null
    ) {
      pressState.isOverTarget = true;
      triggerPressStart(e, pressState.pointerType);
    }
  };

  const onPointerLeave: JSX.EventHandler<HTMLElement, PointerEvent> = (e) => {
    if (
      e.pointerId === pressState.activePointerId &&
      pressState.target &&
      pressState.isOverTarget &&
      pressState.pointerType != null
    ) {
      pressState.isOverTarget = false;
      triggerPressEnd(e, pressState.pointerType, false);

      if (props.shouldCancelOnPointerExit) {
        cancel(e);
      }
    }
  };

  // --- Touch Event Helpers ---

  const createTouchEvent = (target: Element, event: TouchEvent): PressEventSource => {
    let clientX = 0;
    let clientY = 0;
    if (event.targetTouches && event.targetTouches.length === 1) {
      clientX = event.targetTouches[0].clientX;
      clientY = event.targetTouches[0].clientY;
    }
    return {
      currentTarget: target,
      shiftKey: event.shiftKey,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      altKey: event.altKey,
      clientX,
      clientY,
    };
  };

  // --- Touch Event Handlers (fallback for testing/older browsers) ---

  const onTouchStart: JSX.EventHandler<HTMLElement, TouchEvent> = (e) => {
    if (isDisabledValue(props.isDisabled)) {
      return;
    }

    // If already pressed via pointer events, ignore touch events
    if (pressState.isPressed) {
      return;
    }

    const touch = getTouchFromEvent(e);
    if (!touch) {
      return;
    }

    pressState.activePointerId = touch.identifier;
    pressState.ignoreEmulatedMouseEvents = true;
    pressState.isOverTarget = true;
    pressState.isPressed = true;
    pressState.target = e.currentTarget;
    pressState.pointerType = "touch";

    if (!props.allowTextSelectionOnPress) {
      disableTextSelection(pressState.target as HTMLElement);
    }

    const shouldStopPropagation = triggerPressStart(
      createTouchEvent(pressState.target, e),
      "touch",
    );
    if (shouldStopPropagation) {
      e.stopPropagation();
    }

    addGlobalListener("scroll", onScroll, { capture: true, isWindow: true });
  };

  const onTouchMove: JSX.EventHandler<HTMLElement, TouchEvent> = (e) => {
    if (!pressState.isPressed) {
      return;
    }

    const touch = getTouchById(e, pressState.activePointerId);
    if (!touch) {
      return;
    }

    const target = pressState.target!;
    const isOverTarget = isPointOverTarget(touch, target);

    if (isOverTarget !== pressState.isOverTarget) {
      pressState.isOverTarget = isOverTarget;
      if (isOverTarget) {
        triggerPressStart(createTouchEvent(target, e), "touch");
      } else {
        triggerPressEnd(createTouchEvent(target, e), "touch", false);

        if (props.shouldCancelOnPointerExit) {
          cancel(createTouchEvent(target, e));
        }
      }
    }
  };

  const onTouchEnd: JSX.EventHandler<HTMLElement, TouchEvent> = (e) => {
    if (!pressState.isPressed) {
      return;
    }

    const touch = getTouchById(e, pressState.activePointerId);
    if (!touch) {
      return;
    }

    const target = pressState.target!;
    const isOverTarget = isPointOverTarget(touch, target);

    if (isOverTarget) {
      triggerPressUp(createTouchEvent(target, e), "touch");
      triggerPressEnd(
        createTouchEvent(target, e),
        "touch",
        isOverTarget && pressState.isOverTarget,
      );
      if (target instanceof HTMLElement) {
        triggerSyntheticClick(e, target);
      }
    } else {
      triggerPressEnd(createTouchEvent(target, e), "touch", false);
    }

    pressState.isPressed = false;
    pressState.isOverTarget = false;
    pressState.activePointerId = null;
    pressState.pointerType = null;

    removeAllGlobalListeners();

    if (!props.allowTextSelectionOnPress) {
      restoreTextSelection(target as HTMLElement);
    }
  };

  const onTouchCancel: JSX.EventHandler<HTMLElement, TouchEvent> = (e) => {
    if (pressState.target) {
      cancel(createTouchEvent(pressState.target, e));
    } else {
      cancel(e);
    }
  };

  const onScroll = (e: Event): void => {
    if (pressState.isPressed && nodeContains(e.target as Element, pressState.target)) {
      cancel(e);
    }
  };

  // --- Mouse Event Handlers (fallback when PointerEvent is not available) ---

  const onMouseDownFallback: JSX.EventHandler<HTMLElement, MouseEvent> = (e) => {
    // Only handle left button
    if (e.button !== 0) {
      return;
    }

    // Ignore emulated mouse events from touch
    if (pressState.ignoreEmulatedMouseEvents) {
      e.stopPropagation();
      return;
    }

    pressState.isPressed = true;
    pressState.isOverTarget = true;
    pressState.target = e.currentTarget;
    pressState.pointerType = isVirtualClick(e) ? "virtual" : "mouse";

    const shouldStopPropagation = triggerPressStart(e, pressState.pointerType);
    if (shouldStopPropagation) {
      e.stopPropagation();
    }

    if (props.preventFocusOnPress) {
      pressState.focusCleanup?.();
      pressState.focusCleanup = preventFocus(getEventTarget(e) as Element | null) ?? null;
    }

    addGlobalListener("mouseup", onMouseUpFallback);
  };

  const onMouseUpFallback = (e: MouseEvent): void => {
    if (e.button !== 0) {
      return;
    }

    if (!pressState.ignoreEmulatedMouseEvents && e.button === 0 && !pressState.isPressed) {
      triggerPressUp(e, pressState.pointerType || "mouse");
    }
  };

  const onMouseEnterFallback: JSX.EventHandler<HTMLElement, MouseEvent> = (e) => {
    if (!pressState.isPressed || pressState.ignoreEmulatedMouseEvents) {
      return;
    }

    if (
      pressState.isPressed &&
      !pressState.ignoreEmulatedMouseEvents &&
      pressState.pointerType != null
    ) {
      pressState.isOverTarget = true;
      triggerPressStart(e, pressState.pointerType);
    }
  };

  const onMouseLeaveFallback: JSX.EventHandler<HTMLElement, MouseEvent> = (e) => {
    if (!pressState.isPressed || pressState.ignoreEmulatedMouseEvents) {
      return;
    }

    if (
      pressState.isPressed &&
      !pressState.ignoreEmulatedMouseEvents &&
      pressState.pointerType != null
    ) {
      pressState.isOverTarget = false;
      triggerPressEnd(e, pressState.pointerType, false);

      if (props.shouldCancelOnPointerExit) {
        cancel(e);
      }
    }
  };

  // --- Keyboard Event Handlers ---

  const onKeyDown: JSX.EventHandler<HTMLElement, KeyboardEvent> = (e) => {
    if (isDisabledValue(props.isDisabled)) {
      return;
    }

    if (!isValidKeyboardEvent(e, e.currentTarget)) {
      return;
    }

    // Prevent key repeat
    if (e.repeat) {
      e.preventDefault();
      return;
    }

    pressState.target = e.currentTarget;
    pressState.isPressed = true;
    pressState.isOverTarget = true;
    pressState.pointerType = "keyboard";

    const shouldStopPropagation = triggerPressStart(e, "keyboard");
    if (shouldStopPropagation) {
      e.stopPropagation();
    }

    // Prevent default for non-native interactive elements
    if (shouldPreventDefaultKeyboard(e.currentTarget, e.key)) {
      e.preventDefault();
    }

    // macOS bug: keyup doesn't fire while Meta key is held
    // Track keydown events while Meta is held so we can manually dispatch keyup
    if (isMac() && e.metaKey && !e.ctrlKey && !e.altKey) {
      pressState.metaKeyEvents = pressState.metaKeyEvents || new Map();
      pressState.metaKeyEvents.set(e.key, e);
    }

    // For Enter key on native buttons, the click fires on keydown
    // Set flag to ignore it
    if (e.key === "Enter") {
      pressState.ignoreClickAfterPress = true;
    }

    // Set up global keyup listener
    addGlobalListener("keyup", onKeyUp, { capture: true });
  };

  const onKeyUp = (e: KeyboardEvent): void => {
    if (!pressState.isPressed || pressState.pointerType !== "keyboard") {
      return;
    }

    if (!isValidKeyboardEvent(e, pressState.target!)) {
      return;
    }

    // Handle macOS Meta key bug
    if (isMac() && e.key === "Meta" && pressState.metaKeyEvents?.size) {
      // When Meta releases, dispatch keyup for any keys that were pressed during
      for (const [key, event] of pressState.metaKeyEvents) {
        pressState.target?.dispatchEvent(
          new KeyboardEvent("keyup", {
            key,
            code: event.code,
            bubbles: true,
            cancelable: true,
          }),
        );
      }
      pressState.metaKeyEvents.clear();
      return;
    }

    const target = pressState.target!;
    const eventTarget = getEventTarget(e) as Element;
    const wasPressed = nodeContains(target, eventTarget);
    const shouldStopPropagation = wasPressed ? triggerPressUp(e, "keyboard") : true;
    const shouldStopPropagationEnd = triggerPressEnd(e, "keyboard", wasPressed);

    pressState.isPressed = false;
    pressState.pointerType = null;

    removeAllGlobalListeners();

    // Prevent default for non-native interactive elements, but preserve native
    // input behavior such as checkbox Space toggling.
    if (shouldPreventDefaultKeyboard(getEventTarget(e) as Element, e.key)) {
      e.preventDefault();
    }

    if (wasPressed && target instanceof HTMLElement) {
      triggerSyntheticClick(e, target);
    }

    // Handle link activation with non-Enter keys. Native links only respond to
    // Enter, but role-overridden links should also work with Space.
    if (
      e.key !== "Enter" &&
      isHTMLAnchorLink(target) &&
      wasPressed &&
      !linkClickedSet.has(target as HTMLElement)
    ) {
      linkClickedSet.add(target as HTMLElement);
      openLink(target as HTMLAnchorElement, e);
      // Clean up the marker
      setTimeout(() => {
        linkClickedSet.delete(target as HTMLElement);
      }, 0);
    }

    // For Space key on non-native targets, the click fires after keyup.
    // Set flag to ignore it when we already synthesized the click.
    if (e.key === " " && wasPressed && shouldPreventDefaultKeyboard(target, e.key)) {
      pressState.ignoreClickAfterPress = true;
    } else if (e.key === "Enter") {
      pressState.ignoreClickAfterPress = false;
    }

    if (shouldStopPropagation && shouldStopPropagationEnd) {
      e.stopPropagation();
    }
  };

  // --- Click Event Handler ---

  const onClick: JSX.EventHandler<HTMLElement, MouseEvent> = (e) => {
    // Don't handle click if it's not on the target
    if (!nodeContains(e.currentTarget, e.target as Element)) {
      return;
    }

    // Only process left clicks that aren't from our own event triggers
    if (e.button === 0 && !pressState.isTriggeringEvent) {
      if (pressState.ignoreClickAfterPress) {
        pressState.ignoreClickAfterPress = false;
        return;
      }

      if (isDisabledValue(props.isDisabled)) {
        e.preventDefault();
        return;
      }

      // If triggered from a screen reader or by using element.click(),
      // trigger as if it were a keyboard/virtual click.
      let shouldStopPropagation = true;

      if (
        !pressState.ignoreEmulatedMouseEvents &&
        !pressState.isPressed &&
        (pressState.pointerType === "virtual" || isVirtualClick(e))
      ) {
        pressState.target = e.currentTarget;
        const stopPressStart = triggerPressStart(e, "virtual");
        const stopPressUp = triggerPressUp(e, "virtual");
        const stopPressEnd = triggerPressEnd(e, "virtual", true);
        props.onClick?.(e);
        shouldStopPropagation = stopPressStart && stopPressUp && stopPressEnd;
      } else if (pressState.isPressed && pressState.pointerType !== "keyboard") {
        // Complete the press sequence for pointer/touch/mouse events
        const pointerType =
          pressState.pointerType ||
          ((e as unknown as PointerEvent).pointerType as PointerType) ||
          "virtual";
        const stopPressUp = triggerPressUp(e, pointerType);
        const stopPressEnd = triggerPressEnd(e, pointerType, true);
        shouldStopPropagation = stopPressUp && stopPressEnd;
        pressState.isOverTarget = false;
        props.onClick?.(e);
        cancel(e);
      }

      pressState.ignoreEmulatedMouseEvents = false;

      if (shouldStopPropagation) {
        e.stopPropagation();
      }
    }
  };

  // --- Drag Event Handler ---

  const onDragStart: JSX.EventHandler<HTMLElement, DragEvent> = (e) => {
    // Safari doesn't fire pointercancel on drag, so we need to cancel manually
    if (pressState.isPressed) {
      cancel(e);
    }
  };

  // --- Build Props ---
  // Conditionally use pointer events or mouse events based on browser support
  // This matches React-Aria's approach exactly

  const pressProps: JSX.HTMLAttributes<HTMLElement> & { "data-solidaria-pressable": string } =
    typeof PointerEvent !== "undefined"
      ? {
          // Keyboard events
          onKeyDown,
          onKeyUp,
          onClick,
          onDragStart,
          // Pointer events (preferred when available)
          onPointerDown,
          onPointerUp: onPointerUpTarget,
          onPointerEnter,
          onPointerLeave,
          // Mouse down only for focus prevention when using pointer events
          onMouseDown: onMouseDownPointer,
          // Touch events (always included for ignoreEmulatedMouseEvents handling)
          onTouchStart,
          onTouchMove,
          onTouchEnd,
          onTouchCancel,
          // Attribute for CSS touch-action
          "data-solidaria-pressable": "",
        }
      : {
          // Keyboard events
          onKeyDown,
          onKeyUp,
          onClick,
          onDragStart,
          // Mouse events (fallback when PointerEvent not available)
          onMouseDown: onMouseDownFallback,
          onMouseUp: onMouseUpFallback,
          onMouseEnter: onMouseEnterFallback,
          onMouseLeave: onMouseLeaveFallback,
          // Touch events (always included)
          onTouchStart,
          onTouchMove,
          onTouchEnd,
          onTouchCancel,
          // Attribute for CSS touch-action
          "data-solidaria-pressable": "",
        };

  // Clean up on unmount
  onCleanup(() => {
    removeAllGlobalListeners();
    // Clean up click timeout/listener if pending
    if (pressState.clickCleanup) {
      pressState.clickCleanup();
      pressState.clickCleanup = null;
    }
    if (pressState.focusCleanup) {
      pressState.focusCleanup();
      pressState.focusCleanup = null;
    }
  });

  return {
    isPressed,
    pressProps,
  };
}
