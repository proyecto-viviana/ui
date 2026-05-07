/**
 * createInteractionModality + focus-visible tracking for solidaria
 *
 * Port of @react-aria/interactions useFocusVisible/useInteractionModality.
 * Tracks the current interaction modality (keyboard, pointer, or virtual) and
 * provides focus-visible state and listeners.
 */

import { type Accessor, createSignal, createEffect, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";
import { getOwnerDocument, getOwnerWindow, isMac, isVirtualClick, openLink } from "../utils";

export type Modality = "keyboard" | "pointer" | "virtual";
export type PointerType = "mouse" | "pen" | "touch" | "keyboard" | "virtual";
type HandlerEvent = PointerEvent | MouseEvent | KeyboardEvent | FocusEvent | null;
type Handler = (modality: Modality, e: HandlerEvent) => void;

export type FocusVisibleHandler = (isFocusVisible: boolean) => void;

export interface FocusVisibleProps {
  /** Whether the element is a text input. */
  isTextInput?: boolean;
  /** Whether the element will be auto focused. */
  autoFocus?: boolean;
}

export interface FocusVisibleResult {
  /** Whether keyboard focus is visible globally. */
  isFocusVisible: Accessor<boolean>;
}

export interface InteractionModalityResult {
  /** The current interaction modality. */
  modality: Accessor<Modality | null>;
}

let currentModality: Modality | null = null;
let currentPointerType: PointerType = "keyboard";
const changeHandlers = new Set<Handler>();

export let hasSetupGlobalListeners: Map<
  Window,
  { focus: typeof window.HTMLElement.prototype.focus; canOverride: boolean }
> = new Map();
let hasEventBeforeFocus = false;
let hasBlurredWindowRecently = false;
let ignoreFocusEvent = false;

const FOCUS_VISIBLE_INPUT_KEYS: Record<string, boolean> = {
  Tab: true,
  Escape: true,
};

function triggerChangeHandlers(modality: Modality, e: HandlerEvent) {
  for (const handler of changeHandlers) {
    handler(modality, e);
  }
}

function isValidKey(e: KeyboardEvent) {
  return !(
    e.metaKey ||
    (!isMac() && e.altKey) ||
    e.ctrlKey ||
    e.key === "Control" ||
    e.key === "Shift" ||
    e.key === "Meta"
  );
}

function handleKeyboardEvent(e: KeyboardEvent) {
  hasEventBeforeFocus = true;
  const isOpening = (openLink as { isOpening?: boolean }).isOpening;
  if (!isOpening && isValidKey(e)) {
    currentModality = "keyboard";
    currentPointerType = "keyboard";
    triggerChangeHandlers("keyboard", e);
  }
}

function handlePointerEvent(e: PointerEvent | MouseEvent) {
  currentModality = "pointer";
  currentPointerType = "pointerType" in e ? (e.pointerType as PointerType) : "mouse";
  if (e.type === "mousedown" || e.type === "pointerdown") {
    hasEventBeforeFocus = true;
    triggerChangeHandlers("pointer", e);
  }
}

function handleClickEvent(e: MouseEvent) {
  if (!e.isTrusted) {
    return;
  }

  const isOpening = (openLink as { isOpening?: boolean }).isOpening;
  if (!isOpening && isVirtualClick(e)) {
    hasEventBeforeFocus = true;
    currentModality = "virtual";
    currentPointerType = "virtual";
  }
}

function handleFocusEvent(e: FocusEvent) {
  if (!e.isTrusted || ignoreFocusEvent) {
    return;
  }

  const target = e.target as EventTarget | null;
  const targetElement = target && (target as Element).nodeType ? (target as Element) : null;
  const ownerWindow = targetElement ? getOwnerWindow(targetElement) : window;
  const ownerDocument = targetElement ? getOwnerDocument(targetElement) : document;

  if (target === ownerWindow || target === ownerDocument) {
    return;
  }

  if (!hasEventBeforeFocus && !hasBlurredWindowRecently) {
    currentModality = "virtual";
    currentPointerType = "virtual";
    triggerChangeHandlers("virtual", e);
  }

  hasEventBeforeFocus = false;
  hasBlurredWindowRecently = false;
}

function handleWindowBlur() {
  if (ignoreFocusEvent) {
    return;
  }

  hasEventBeforeFocus = false;
  hasBlurredWindowRecently = true;
}

function setupGlobalFocusEvents(element?: HTMLElement | null) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const windowObject = getOwnerWindow(element);
  if (hasSetupGlobalListeners.get(windowObject)) {
    return;
  }

  const documentObject = getOwnerDocument(element);

  const originalFocus = windowObject.HTMLElement.prototype.focus;
  let canOverride = true;
  try {
    windowObject.HTMLElement.prototype.focus = function () {
      hasEventBeforeFocus = true;
      originalFocus.apply(this, arguments as unknown as [options?: FocusOptions | undefined]);
    };
  } catch {
    canOverride = false;
  }

  documentObject.addEventListener("keydown", handleKeyboardEvent, true);
  documentObject.addEventListener("keyup", handleKeyboardEvent, true);
  documentObject.addEventListener("click", handleClickEvent, true);

  windowObject.addEventListener("focus", handleFocusEvent, true);
  windowObject.addEventListener("blur", handleWindowBlur, false);

  if (typeof windowObject.PointerEvent !== "undefined") {
    documentObject.addEventListener("pointerdown", handlePointerEvent, true);
    documentObject.addEventListener("pointermove", handlePointerEvent, true);
    documentObject.addEventListener("pointerup", handlePointerEvent, true);
  } else {
    documentObject.addEventListener("mousedown", handlePointerEvent, true);
    documentObject.addEventListener("mousemove", handlePointerEvent, true);
    documentObject.addEventListener("mouseup", handlePointerEvent, true);
  }

  windowObject.addEventListener(
    "beforeunload",
    () => {
      tearDownWindowFocusTracking(element);
    },
    { once: true },
  );

  hasSetupGlobalListeners.set(windowObject, { focus: originalFocus, canOverride });
}

function tearDownWindowFocusTracking(element?: HTMLElement | null, loadListener?: () => void) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const windowObject = getOwnerWindow(element);
  const documentObject = getOwnerDocument(element);

  if (loadListener) {
    documentObject.removeEventListener("DOMContentLoaded", loadListener);
  }

  if (!hasSetupGlobalListeners.has(windowObject)) {
    return;
  }

  const entry = hasSetupGlobalListeners.get(windowObject)!;
  if (entry.canOverride) {
    windowObject.HTMLElement.prototype.focus = entry.focus;
  }

  documentObject.removeEventListener("keydown", handleKeyboardEvent, true);
  documentObject.removeEventListener("keyup", handleKeyboardEvent, true);
  documentObject.removeEventListener("click", handleClickEvent, true);

  windowObject.removeEventListener("focus", handleFocusEvent, true);
  windowObject.removeEventListener("blur", handleWindowBlur, false);

  if (typeof windowObject.PointerEvent !== "undefined") {
    documentObject.removeEventListener("pointerdown", handlePointerEvent, true);
    documentObject.removeEventListener("pointermove", handlePointerEvent, true);
    documentObject.removeEventListener("pointerup", handlePointerEvent, true);
  } else {
    documentObject.removeEventListener("mousedown", handlePointerEvent, true);
    documentObject.removeEventListener("mousemove", handlePointerEvent, true);
    documentObject.removeEventListener("mouseup", handlePointerEvent, true);
  }

  hasSetupGlobalListeners.delete(windowObject);
}

/**
 * Adds a window (i.e. iframe) to the list of windows that are being tracked for focus visible.
 */
export function addWindowFocusTracking(element?: HTMLElement | null): () => void {
  const documentObject = getOwnerDocument(element);
  let loadListener: (() => void) | undefined;

  if (documentObject.readyState !== "loading") {
    setupGlobalFocusEvents(element);
  } else {
    loadListener = () => {
      setupGlobalFocusEvents(element);
    };
    documentObject.addEventListener("DOMContentLoaded", loadListener);
  }

  return () => tearDownWindowFocusTracking(element, loadListener);
}

export function setupGlobalFocusListeners(): void {
  addWindowFocusTracking();
}

if (typeof document !== "undefined") {
  addWindowFocusTracking();
}

/**
 * If true, keyboard focus is visible.
 */
export function isFocusVisible(): boolean {
  return currentModality !== "pointer";
}

/**
 * Gets the current interaction modality.
 */
export function getInteractionModality(): Modality | null {
  return currentModality;
}

/**
 * Sets the current interaction modality.
 */
export function setInteractionModality(modality: Modality): void {
  currentModality = modality;
  currentPointerType = modality === "pointer" ? "mouse" : modality;
  triggerChangeHandlers(modality, null);
}

/**
 * Gets the current pointer type.
 */
export function getPointerType(): PointerType {
  return currentPointerType;
}

function isKeyboardFocusEvent(isTextInput: boolean, modality: Modality, e: HandlerEvent): boolean {
  if (!e) {
    return true;
  }

  const target = "target" in e ? (e.target as Element | null) : null;
  const ownerDocument = target ? getOwnerDocument(target) : document;
  const ownerWindow = target ? getOwnerWindow(target) : window;

  const IHTMLInputElement = ownerWindow.HTMLInputElement;
  const IHTMLTextAreaElement = ownerWindow.HTMLTextAreaElement;
  const IHTMLElement = ownerWindow.HTMLElement;
  const IKeyboardEvent = ownerWindow.KeyboardEvent;

  const nonTextInputTypes = new Set([
    "checkbox",
    "radio",
    "range",
    "color",
    "file",
    "image",
    "button",
    "submit",
    "reset",
  ]);

  isTextInput =
    isTextInput ||
    (ownerDocument.activeElement instanceof IHTMLInputElement &&
      !nonTextInputTypes.has(ownerDocument.activeElement.type)) ||
    ownerDocument.activeElement instanceof IHTMLTextAreaElement ||
    (ownerDocument.activeElement instanceof IHTMLElement &&
      ownerDocument.activeElement.isContentEditable);

  return !(
    isTextInput &&
    modality === "keyboard" &&
    e instanceof IKeyboardEvent &&
    !FOCUS_VISIBLE_INPUT_KEYS[e.key]
  );
}

/**
 * Listens for trigger change and reports if focus is visible.
 */
export function createFocusVisibleListener(
  handler: FocusVisibleHandler,
  opts?: { isTextInput?: boolean },
): () => void {
  setupGlobalFocusEvents();
  const listener: Handler = (modality: Modality, e: HandlerEvent) => {
    if (!isKeyboardFocusEvent(!!opts?.isTextInput, modality, e)) {
      return;
    }
    handler(isFocusVisible());
  };
  changeHandlers.add(listener);
  return () => {
    changeHandlers.delete(listener);
  };
}

/**
 * Manages focus visible state for the page.
 */
export function createFocusVisible(props: FocusVisibleProps = {}): FocusVisibleResult {
  if (isServer) {
    return { isFocusVisible: () => false };
  }

  const { isTextInput, autoFocus } = props;
  const [isVisible, setIsVisible] = createSignal<boolean>(autoFocus || isFocusVisible());

  createEffect(() => {
    const cleanup = createFocusVisibleListener(setIsVisible, { isTextInput });
    onCleanup(cleanup);
  });

  return { isFocusVisible: isVisible };
}

/**
 * Tracks the current interaction modality.
 */
export function createInteractionModality(): InteractionModalityResult {
  if (isServer) {
    return {
      modality: () => null,
    };
  }

  const [modality, setModality] = createSignal<Modality | null>(currentModality);

  createEffect(() => {
    setupGlobalFocusEvents();
    const handler: Handler = (newModality: Modality) => {
      setModality(newModality);
    };
    changeHandlers.add(handler);
    onCleanup(() => {
      changeHandlers.delete(handler);
    });
  });

  return {
    modality,
  };
}

/**
 * Adds a listener for modality changes.
 */
export function addModalityListener(handler: (modality: Modality) => void): () => void {
  const wrapped: Handler = (modality) => {
    handler(modality);
  };
  changeHandlers.add(wrapped);
  return () => {
    changeHandlers.delete(wrapped);
  };
}

/**
 * Hook to track whether the user is currently interacting with the keyboard.
 */
export function useIsKeyboardFocused(): Accessor<boolean> {
  if (isServer) {
    return () => false;
  }

  const { modality } = createInteractionModality();
  return () => modality() === "keyboard";
}
