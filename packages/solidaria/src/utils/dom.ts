/**
 * DOM utilities for cross-browser compatibility.
 * Based on @react-aria/utils DOM utilities.
 */

/**
 * Gets the owner document of an element, or the global document.
 */
export function getOwnerDocument(el: Element | null | undefined): Document {
  return el?.ownerDocument ?? document;
}

/**
 * Gets the owner window of an element, or the global window.
 */
export function getOwnerWindow(el: Element | null | undefined): Window & typeof globalThis {
  return getOwnerDocument(el).defaultView ?? window;
}

/**
 * Cross-browser implementation of Node.contains that works with ShadowDOM.
 * In Safari, Node.contains doesn't properly detect elements inside shadow roots.
 */
export function nodeContains(parent: Node | null, child: Node | null): boolean {
  if (!parent || !child) {
    return false;
  }

  // Standard contains check
  if (parent.contains(child)) {
    return true;
  }

  // Check if child is in a shadow root
  let node: Node | null = child;
  while (node) {
    if (node === parent) {
      return true;
    }

    // Check shadow root host
    if ((node as ShadowRoot).host) {
      node = (node as ShadowRoot).host;
    } else {
      node = node.parentNode;
    }
  }

  return false;
}

/**
 * Gets the event target, handling composed path for shadow DOM.
 */
export function getEventTarget<T extends EventTarget>(event: Event): T | null {
  // Use composedPath to get the real target when using Shadow DOM
  if (typeof event.composedPath === "function") {
    const path = event.composedPath();
    if (path.length > 0) {
      return path[0] as T;
    }
  }
  return event.target as T | null;
}

/**
 * Checks if an element is a valid focusable element.
 */
export function isFocusable(element: Element): boolean {
  // Check if element is disabled
  if ((element as HTMLInputElement).disabled) {
    return false;
  }

  // Check native focusable elements
  const tagName = element.tagName.toLowerCase();
  if (["input", "select", "textarea", "button", "a", "area"].includes(tagName)) {
    // For anchor elements, they must have href to be focusable
    if (tagName === "a" || tagName === "area") {
      return element.hasAttribute("href");
    }
    return true;
  }

  // A negative tabIndex is not tabbable, but it is still programmatically focusable.
  // React Aria's focusable selector includes all tabindex values for this reason.
  const tabIndex = element.getAttribute("tabindex");
  if (tabIndex != null) {
    return true;
  }

  // Check for contenteditable
  if (
    element.hasAttribute("contenteditable") &&
    element.getAttribute("contenteditable") !== "false"
  ) {
    return true;
  }

  return false;
}

/**
 * Checks if a keyboard event should trigger the default action (like clicking).
 */
export function isValidKeyboardEvent(event: KeyboardEvent, currentTarget: Element): boolean {
  const { key, code } = event;
  const element = currentTarget as HTMLElement;
  const tagName = element.tagName.toLowerCase();
  const role = element.getAttribute("role");

  // Only accept Enter and Space
  const isActivationKey = key === "Enter" || key === " " || key === "Spacebar" || code === "Space";
  if (!isActivationKey) {
    return false;
  }

  // Text inputs should handle their own keyboard events
  if (tagName === "textarea") {
    return false;
  }

  // Content editable elements should handle their own keyboard events
  if (element.isContentEditable) {
    return false;
  }

  // Links should only respond to Enter, not Space
  const isLink = role === "link" || (!role && isHTMLAnchorLink(element));
  if (isLink && key !== "Enter") {
    return false;
  }

  // Input elements have specific key handling
  if (tagName === "input") {
    return isValidInputKey(element as HTMLInputElement, key);
  }

  return true;
}

/**
 * Checks if a key is valid for a specific input type.
 */
export function isValidInputKey(target: HTMLInputElement, key: string): boolean {
  const type = target.type.toLowerCase();

  // Checkbox and radio only respond to Space
  if (type === "checkbox" || type === "radio") {
    return key === " " || key === "Spacebar";
  }

  // Text-like inputs handle their own keyboard events
  const textInputTypes = [
    "text",
    "search",
    "url",
    "tel",
    "email",
    "password",
    "date",
    "month",
    "week",
    "time",
    "datetime-local",
    "number",
  ];
  if (textInputTypes.includes(type)) {
    return false;
  }

  return true;
}

/**
 * Checks if an element is an HTML anchor link (has href attribute).
 */
export function isHTMLAnchorLink(target: Element): boolean {
  return target.tagName === "A" && target.hasAttribute("href");
}

/**
 * Whether to prevent default on keyboard events for this element.
 */
export function shouldPreventDefaultKeyboard(target: Element, key: string): boolean {
  const tagName = target.tagName.toLowerCase();

  // Never prevent default on inputs - they handle their own behavior
  if (tagName === "input" || tagName === "textarea" || tagName === "select") {
    return false;
  }

  // Don't prevent default on links for Enter (native navigation)
  if ((tagName === "a" || target.getAttribute("role") === "link") && key === "Enter") {
    return false;
  }

  // Buttons with submit/reset type should not prevent default
  if (tagName === "button") {
    const type = (target as HTMLButtonElement).type;
    if (type === "submit" || type === "reset") {
      return false;
    }
  }

  return true;
}

/**
 * Whether to prevent default on pointer up for this element.
 */
export function shouldPreventDefaultUp(target: Element): boolean {
  const tagName = target.tagName.toLowerCase();

  // Never prevent default on form elements
  if (tagName === "input" || tagName === "textarea" || tagName === "select") {
    return false;
  }

  // Don't prevent default on links
  if (tagName === "a" || target.getAttribute("role") === "link") {
    return false;
  }

  // Buttons with submit/reset type should not prevent default
  if (tagName === "button") {
    const type = (target as HTMLButtonElement).type;
    if (type === "submit" || type === "reset") {
      return false;
    }
  }

  return true;
}

/**
 * Opens a link, supporting both same-window and new-window navigation.
 * Used for keyboard activation of links with Space key (which doesn't natively open links).
 */
export function openLink(target: HTMLAnchorElement, event: Event, allowOpener = false): void {
  const { href, target: linkTarget, rel } = target;
  (openLink as { isOpening?: boolean }).isOpening = true;

  // Handle modifier keys for open-in-new-tab behavior
  const keyEvent = event as KeyboardEvent;
  const shouldOpenInNewTab =
    linkTarget === "_blank" ||
    keyEvent?.metaKey ||
    keyEvent?.ctrlKey ||
    keyEvent?.shiftKey ||
    keyEvent?.altKey;

  if (shouldOpenInNewTab) {
    const features = !allowOpener && rel?.includes("noopener") ? "noopener" : undefined;
    window.open(href, linkTarget || "_blank", features);
  } else {
    window.location.href = href;
  }

  (openLink as { isOpening?: boolean }).isOpening = false;
}

(openLink as { isOpening?: boolean }).isOpening = false;

/**
 * Checks if an element is scrollable based on its overflow style.
 * @param node - The element to check
 * @param checkForOverflow - If true, also check if the element actually overflows
 */
export function isScrollable(node: Element | null, checkForOverflow?: boolean): boolean {
  if (!node) {
    return false;
  }

  const style = window.getComputedStyle(node);
  const scrollable = /(auto|scroll)/.test(style.overflow + style.overflowX + style.overflowY);

  if (scrollable && checkForOverflow) {
    return node.scrollHeight !== node.clientHeight || node.scrollWidth !== node.clientWidth;
  }

  return scrollable;
}

/**
 * Gets the nearest scrollable parent element.
 * @param node - The starting element
 * @param checkForOverflow - If true, only return parents that actually overflow
 */
export function getScrollParent(node: Element, checkForOverflow?: boolean): Element {
  let scrollableNode: Element | null = node;

  if (isScrollable(scrollableNode, checkForOverflow)) {
    scrollableNode = scrollableNode.parentElement;
  }

  while (scrollableNode && !isScrollable(scrollableNode, checkForOverflow)) {
    scrollableNode = scrollableNode.parentElement;
  }

  return scrollableNode || document.scrollingElement || document.documentElement;
}

/**
 * Checks if an element will open a virtual keyboard when focused.
 * Used for iOS Safari scroll handling.
 */
export function willOpenKeyboard(target: Element | null): boolean {
  if (!target) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();

  // Inputs that open keyboard (not all input types do)
  if (tagName === "input") {
    const type = (target as HTMLInputElement).type.toLowerCase();
    // These input types open the keyboard
    const keyboardTypes = [
      "text",
      "search",
      "url",
      "tel",
      "email",
      "password",
      "date",
      "month",
      "week",
      "time",
      "datetime-local",
      "number",
    ];
    return keyboardTypes.includes(type);
  }

  // Textareas always open keyboard
  if (tagName === "textarea") {
    return true;
  }

  // Contenteditable elements open keyboard
  if (
    target.hasAttribute("contenteditable") &&
    target.getAttribute("contenteditable") !== "false"
  ) {
    return true;
  }

  return false;
}
