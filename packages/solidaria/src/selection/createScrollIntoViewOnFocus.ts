/**
 * Reveals the virtually-focused collection item when the focused key changes via
 * keyboard navigation.
 *
 * Mirrors the focused-key scroll effect in @react-aria/selection's
 * `useSelectableCollection`. Activedescendant collections (ListBox / Menu /
 * ComboBox) keep real DOM focus on the container and point at the active item
 * with `aria-activedescendant`, so the browser never natively scrolls the
 * focused option into view the way a roving-tabindex collection would. This
 * effect restores that behavior through our `scrollIntoViewport` util.
 */

import { createEffect } from "solid-js";
import { isServer } from "solid-js/web";
import type { Key } from "@proyecto-viviana/solid-stately";
import { getInteractionModality } from "../interactions/createInteractionModality";
import { scrollIntoViewport } from "../utils";

export interface ScrollIntoViewOnFocusOptions {
  /** The currently focused collection key. */
  focusedKey: () => Key | null;
  /** The collection element, which is also the scroll container. */
  ref: () => HTMLElement | null | undefined;
  /**
   * Whether the collection is the active focus target. When this returns false
   * the scroll is suppressed so a background focused-key change can't move the
   * page. Mirrors upstream's `manager.isFocused` gate. Defaults to always active.
   */
  isActive?: () => boolean;
  /**
   * Resolves the DOM element for a focused key within `root`. Defaults to a
   * `[data-key]` lookup, which every collection item carries.
   */
  getItemElement?: (root: HTMLElement, key: Key) => HTMLElement | null;
}

export function createScrollIntoViewOnFocus(options: ScrollIntoViewOnFocusOptions): void {
  if (isServer) return;

  const getItemElement =
    options.getItemElement ??
    ((root, key) => root.querySelector<HTMLElement>(`[data-key="${key}"]`));

  createEffect(() => {
    const key = options.focusedKey();
    if (key == null) return;
    if (options.isActive && !options.isActive()) return;
    // Pointer-driven focus changes (e.g. hovering an option) shouldn't yank the
    // scroll position under the user's cursor — only reveal on keyboard nav.
    // Matches the modality gate `createTable` uses for its real-focus rows.
    if (getInteractionModality() === "pointer") return;

    const root = options.ref();
    if (!root) return;

    // Defer a microtask so a virtualizer that force-renders the focused item has
    // committed it to the DOM before we measure and scroll it into view.
    queueMicrotask(() => {
      const element = getItemElement(root, key);
      if (element) {
        scrollIntoViewport(element, { containingElement: root });
      }
    });
  });
}
