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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/interactions/useFocusVisible.ts

/**
 * createInteractionModality + focus-visible tracking for solidaria
 *
 * Port of @react-aria/interactions useFocusVisible/useInteractionModality.
 * Tracks the current interaction modality (keyboard, pointer, or virtual) and
 * provides focus-visible state and listeners.
 */

import { createSignal, createTrackedEffect, untrack } from "solid-js";
import type { Accessor } from "solid-js";
import { isServer } from "@solidjs/web";
import { getEventTarget, getOwnerDocument, getOwnerWindow, openLink } from "../utils/dom";
import { isVirtualClick } from "../utils/events";
import { isMac } from "../utils/platform";

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

// react-aria keeps `currentModality` in a module `let` that the same turn can
// read (useFocusVisible.ts). Solid 2 commits a signal on the next flush, and
// an untracked read until then returns the previous value, so a render
// predicate that only read the let would stay stale. `currentModalityValue`
// is that let. The signal exists only so isFocusVisible() — the render
// predicate useOption.ts:182 re-reads — re-runs when modality changes,
// including handleClickEvent, which does not call triggerChangeHandlers
// (useFocusVisible.ts:105-111). getInteractionModality() returns the let and
// does not touch the signal: upstream's imperative query is a plain variable,
// and no effect depends on it. getPointerType() reads `currentPointerType`,
// a separate let, and never the modality signal. Same-value writes do not
// notify, so pointermove is quiet. ownedWrite: a DOM listener can run
// re-entrantly inside a computation; the write records the external event.
let currentModalityValue: Modality | null = null;
const [currentModality, setCurrentModalitySignal] = createSignal<Modality | null>(null, {
  ownedWrite: true,
});
let currentPointerType: PointerType = "keyboard";

function setCurrentModality(next: Modality): void {
  currentModalityValue = next;
  setCurrentModalitySignal(next);
}

function readCurrentModality(): Modality | null {
  currentModality();
  return currentModalityValue;
}
const changeHandlers = new Set<Handler>();

export let hasSetupGlobalListeners: Map<
  Window,
  { focus: typeof window.HTMLElement.prototype.focus }
> = new Map();
let hasEventBeforeFocus = false;
let hasBlurredWindowRecently = false;
/** @private Set by `preventFocus` so programmatic refocus is not treated as a modality change. */
export let ignoreFocusEvent = false;

/** @private */
export function setIgnoreFocusEvent(value: boolean): void {
  ignoreFocusEvent = value;
}

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
    setCurrentModality("keyboard");
    currentPointerType = "keyboard";
    triggerChangeHandlers("keyboard", e);
  }
}

function handlePointerEvent(e: PointerEvent | MouseEvent) {
  setCurrentModality("pointer");
  currentPointerType = "pointerType" in e ? (e.pointerType as PointerType) : "mouse";
  if (e.type === "mousedown" || e.type === "pointerdown") {
    hasEventBeforeFocus = true;
    triggerChangeHandlers("pointer", e);
  }
}

function handleClickEvent(e: MouseEvent) {
  // react-aria 3.52.0 useFocusVisible.ts:105-111. No isTrusted guard and no
  // listener notification: keyboards, AT, and element.click() are virtual
  // clicks (detail === 0).
  const isOpening = (openLink as { isOpening?: boolean }).isOpening;
  if (!isOpening && isVirtualClick(e)) {
    hasEventBeforeFocus = true;
    setCurrentModality("virtual");
    currentPointerType = "virtual";
  }
}

function handleFocusEvent(e: FocusEvent) {
  if (ignoreFocusEvent) {
    return;
  }

  const target = getEventTarget(e);
  const ownerWindow = getOwnerWindow(target);
  const ownerDocument = getOwnerDocument(target);

  // When the window regains focus, the browser restores focus to the element that was focused
  // before, firing a focus event the user did not initiate. handleWindowBlur sets
  // hasBlurredWindowRecently so restored focus doesn't switch to virtual modality below, but
  // Safari fires the window/element focus pair twice when returning to a tab or app and the first
  // element focus event clears the flag, so re-arm it whenever the window itself is focused.
  // Like handleWindowBlur, this intentionally doesn't check isTrusted.
  if (target === ownerWindow) {
    hasBlurredWindowRecently = true;
    return;
  }

  // Firefox fires two extra focus events when the user first clicks into an iframe:
  // first on the window, then on the document. We ignore these events so they don't
  // cause keyboard focus rings to appear.
  if (target === ownerDocument || !e.isTrusted) {
    return;
  }

  // If a focus event occurs without a preceding keyboard or pointer event, switch to virtual modality.
  // This occurs, for example, when navigating a form with the next/previous buttons on iOS.
  if (!hasEventBeforeFocus && !hasBlurredWindowRecently) {
    setCurrentModality("virtual");
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

  // Programmatic focus() calls shouldn't affect the current input modality, so we
  // patch HTMLElement.prototype.focus to record that an event preceded the focus.
  // Use Reflect.defineProperty (not assignment) so this works even when `focus` is
  // currently a getter-only accessor — e.g. when a test library's setup() has
  // instrumented it. Plain assignment throws in that case; Reflect.defineProperty
  // returns false rather than throwing (and succeeds on the configurable prototype).
  const originalFocus = windowObject.HTMLElement.prototype.focus;
  Reflect.defineProperty(windowObject.HTMLElement.prototype, "focus", {
    configurable: true,
    writable: true,
    value: function () {
      hasEventBeforeFocus = true;
      originalFocus.apply(this, arguments as unknown as [options?: FocusOptions | undefined]);
    },
  });

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

  hasSetupGlobalListeners.set(windowObject, { focus: originalFocus });
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
  // Mirror the setup path: defineProperty (not assignment) restores the original
  // focus even if it had been replaced with a getter-only accessor.
  Reflect.defineProperty(windowObject.HTMLElement.prototype, "focus", {
    configurable: true,
    writable: true,
    value: entry.focus,
  });

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
 * If true, keyboard focus is visible. The only tracked read of modality:
 * useOption's render predicate re-reads this on every render.
 */
export function isFocusVisible(): boolean {
  return readCurrentModality() !== "pointer";
}

/**
 * Gets the current interaction modality.
 * The module let, not the signal. An effect that calls this does not re-run
 * when modality changes; upstream's query is a plain variable.
 */
export function getInteractionModality(): Modality | null {
  return currentModalityValue;
}

/**
 * Sets the current interaction modality.
 */
export function setInteractionModality(modality: Modality): void {
  setCurrentModality(modality);
  currentPointerType = modality === "pointer" ? "mouse" : modality;
  triggerChangeHandlers(modality, null);
}

/**
 * Gets the current pointer type. Separate from modality; this let is never
 * the modality signal.
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
  opts?: { isTextInput?: boolean; enabled?: boolean },
): () => void {
  setupGlobalFocusEvents();
  if (opts?.enabled === false) {
    return () => {};
  }
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
  // autoFocus seeds the initial value once; isTextInput is read inside the effect
  // so it re-subscribes reactively (a top-level destructure would freeze it — the
  // body runs once). Mirrors upstream useFocusVisible's [isTextInput] dep.
  const [isVisible, setIsVisible] = createSignal<boolean>(
    isServer ? false : props.autoFocus || untrack(isFocusVisible),
  );

  // Reserve the effect owner during SSR too; its callback runs only on client.
  createTrackedEffect(() => {
    const _s2Cleanups: Array<() => void> = [];

    const cleanup = createFocusVisibleListener(setIsVisible, { isTextInput: props.isTextInput });
    _s2Cleanups.push(cleanup);

    return () => {
      for (const c of _s2Cleanups) c();
    };
  });

  return { isFocusVisible: isVisible };
}

/**
 * Tracks the current interaction modality.
 */
export function createInteractionModality(): InteractionModalityResult {
  const [modality, setModality] = createSignal<Modality | null>(
    isServer ? null : currentModalityValue,
  );

  // Register the owner on both sides; only the browser subscribes to events.
  createTrackedEffect(() => {
    if (isServer) return;
    const _s2Cleanups: Array<() => void> = [];

    setupGlobalFocusEvents();
    const handler: Handler = (newModality: Modality) => {
      setModality(newModality);
    };
    changeHandlers.add(handler);
    _s2Cleanups.push(() => {
      changeHandlers.delete(handler);
    });

    return () => {
      for (const c of _s2Cleanups) c();
    };
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
  const { modality } = createInteractionModality();
  return () => modality() === "keyboard";
}
