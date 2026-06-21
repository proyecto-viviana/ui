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

// Ports @react-aria/utils `isElementVisible`/`isFocusable`/`isTabbable` (v3.34.1,
// the version paired with our pinned RAC 1.19.0) so focusability matches upstream:
// a candidate must match the focusable selector AND not be inside an `inert`
// subtree AND be visible (unless `skipVisibilityCheck`). The previous `isFocusable`
// was a simplified tagName/tabindex check with no visibility or `inert` filtering.
// Owner-window lookups go through `getOwnerWindow`, which falls back to the global
// window, so these stay robust on detached documents (`defaultView === null`).

const supportsCheckVisibility =
  typeof Element !== "undefined" && "checkVisibility" in Element.prototype;

// Solid clones templates with the document that is global at creation time, so a
// node portaled into another document (e.g. an iframe) keeps its original realm's
// prototype even though `getOwnerWindow` now resolves to the other document's
// window. Upstream React creates portal nodes with the container's `ownerDocument`,
// so its single `instanceof getOwnerWindow(element)` check suffices; we also accept
// the global realm's constructors so cross-document focus scopes still recognize
// real elements. In the common same-realm case this is identical to upstream.
function isHTMLOrSVGElement(element: Element): element is HTMLElement | SVGElement {
  const windowObject = getOwnerWindow(element);
  return (
    element instanceof windowObject.HTMLElement ||
    element instanceof windowObject.SVGElement ||
    (typeof HTMLElement !== "undefined" && element instanceof HTMLElement) ||
    (typeof SVGElement !== "undefined" && element instanceof SVGElement)
  );
}

function isStyleVisible(element: Element): boolean {
  if (!isHTMLOrSVGElement(element)) {
    return false;
  }

  const { display, visibility } = element.style;

  let isVisible = display !== "none" && visibility !== "hidden" && visibility !== "collapse";

  if (isVisible) {
    const { getComputedStyle } = getOwnerWindow(element);
    const { display: computedDisplay, visibility: computedVisibility } = getComputedStyle(element);

    isVisible =
      computedDisplay !== "none" &&
      computedVisibility !== "hidden" &&
      computedVisibility !== "collapse";
  }

  return isVisible;
}

function isAttributeVisible(element: Element, childElement?: Element): boolean {
  return (
    !element.hasAttribute("hidden") &&
    // Ignore HiddenSelect when tree walking.
    !element.hasAttribute("data-react-aria-prevent-focus") &&
    (element.nodeName === "DETAILS" && childElement && childElement.nodeName !== "SUMMARY"
      ? element.hasAttribute("open")
      : true)
  );
}

/**
 * Whether an element is visible, and so eligible for focus. Adapted from
 * @react-aria/utils, which adapts testing-library/jest-dom and
 * vue-test-utils-next (MIT): uses `checkVisibility` when supported, otherwise
 * walks computed style and visibility-affecting attributes up the ancestor chain.
 */
export function isElementVisible(element: Element, childElement?: Element): boolean {
  if (supportsCheckVisibility) {
    return (
      element.checkVisibility({ visibilityProperty: true }) &&
      !element.closest("[data-react-aria-prevent-focus]")
    );
  }

  return (
    element.nodeName !== "#comment" &&
    isStyleVisible(element) &&
    isAttributeVisible(element, childElement) &&
    (!element.parentElement || isElementVisible(element.parentElement, element))
  );
}

const focusableElements = [
  "input:not([disabled]):not([type=hidden])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
  "a[href]",
  "area[href]",
  "summary",
  "iframe",
  "object",
  "embed",
  "audio[controls]",
  "video[controls]",
  '[contenteditable]:not([contenteditable^="false"])',
  "permission",
];

const FOCUSABLE_ELEMENT_SELECTOR =
  focusableElements.join(":not([hidden]),") + ",[tabindex]:not([disabled]):not([hidden])";

focusableElements.push('[tabindex]:not([tabindex="-1"]):not([disabled])');
const TABBABLE_ELEMENT_SELECTOR = focusableElements.join(':not([hidden]):not([tabindex="-1"]),');

/**
 * Checks if an element is a valid focusable element: it matches the focusable
 * selector, is not inside an `inert` subtree, and is visible. A negative tabindex
 * is programmatically focusable (matched here) but not tabbable. `skipVisibilityCheck`
 * lets callers (e.g. the press-path `preventFocus` ancestor walk) skip the
 * `isElementVisible` step, which also avoids touching layout on detached documents.
 */
export function isFocusable(
  element: Element,
  options?: { skipVisibilityCheck?: boolean },
): boolean {
  return (
    element.matches(FOCUSABLE_ELEMENT_SELECTOR) &&
    !isInert(element) &&
    (options?.skipVisibilityCheck || isElementVisible(element))
  );
}

/**
 * Checks if an element is tabbable (reachable via the Tab key): focusable,
 * visible, not inert, and not `tabindex="-1"`.
 */
export function isTabbable(element: Element): boolean {
  return (
    element.matches(TABBABLE_ELEMENT_SELECTOR) && isElementVisible(element) && !isInert(element)
  );
}

function isInert(element: Element): boolean {
  let node: Element | null = element;
  while (node != null) {
    // Realm-tolerant HTMLElement check (see isHTMLOrSVGElement): Solid-portaled
    // nodes keep their creating realm's prototype, so also accept the global one.
    const isHTMLElement =
      node instanceof getOwnerWindow(node).HTMLElement ||
      (typeof HTMLElement !== "undefined" && node instanceof HTMLElement);
    if (isHTMLElement && (node as HTMLElement).inert) {
      return true;
    }

    node = node.parentElement;
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
  if (target instanceof HTMLInputElement) {
    return !isValidInputKey(target, key);
  }

  return shouldPreventDefaultUp(target);
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
 * Gets every scrollable ancestor of an element, from the nearest up to (and
 * including) the document scrolling element.
 * @param node - The starting element
 * @param checkForOverflow - If true, only include parents that actually overflow
 */
export function getScrollParents(node: Element, checkForOverflow?: boolean): Element[] {
  const parentElements: Element[] = [];
  const root = document.scrollingElement || document.documentElement;
  let current: Element | null = node;

  while (current) {
    if (isScrollable(current, checkForOverflow)) {
      parentElements.push(current);
    }
    if (current === root) {
      break;
    }
    current = current.parentElement;
  }

  return parentElements;
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

/**
 * Returns the deepest active element, descending through open shadow roots.
 * Mirrors @react-aria/utils' `getActiveElement`.
 */
export function getActiveElement(doc: Document = document): Element | null {
  let activeElement = doc.activeElement;
  while (activeElement?.shadowRoot?.activeElement) {
    activeElement = activeElement.shadowRoot.activeElement;
  }
  return activeElement;
}

/**
 * Whether the (deepest) active element is `element` or is contained within it.
 * Mirrors @react-aria/utils' `isFocusWithin`.
 */
export function isFocusWithin(element: Element): boolean {
  const activeElement = getActiveElement(getOwnerDocument(element));
  return !!activeElement && nodeContains(element, activeElement);
}

/**
 * Creates a `TreeWalker` that visits the focusable (or, when `tabbable`, the
 * tabbable) descendants of `root`, skipping invisible and inert elements.
 * Mirrors @react-aria/focus's `getFocusableTreeWalker`, minus the focus-scope
 * containment filter (we don't model nested scopes here). Used to treat a
 * selectable collection as a single tab stop.
 */
export function getFocusableTreeWalker(
  root: Element,
  opts?: { tabbable?: boolean; from?: Node },
): TreeWalker {
  const accept = (node: Element) => (opts?.tabbable ? isTabbable(node) : isFocusable(node));
  const walker = getOwnerDocument(root).createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode(node) {
      // Skip nodes inside the optional starting node.
      if (opts?.from?.contains(node)) {
        return NodeFilter.FILTER_REJECT;
      }
      if (accept(node as Element)) {
        return NodeFilter.FILTER_ACCEPT;
      }
      return NodeFilter.FILTER_SKIP;
    },
  });
  if (opts?.from) {
    walker.currentNode = opts.from;
  }
  return walker;
}
