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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/selection/useSelectableCollection.ts

/**
 * createSelectableCollection - keyboard, focus, and selection interactions for a
 * selectable collection. Based on @react-aria/selection's
 * `useSelectableCollection`.
 *
 * React → Solid adaptations (faithful to upstream behavior):
 *  - `ref` / `scrollRef` are Solid accessors; `keyboardDelegate` may be an
 *    accessor so a recreated delegate stays current.
 *  - Per-render React effects become `createEffect`s that read the manager's
 *    reactive getters: the autofocus and scroll-into-view effects track
 *    `isFocused` / `focusedKey` / `collection.size` and run when those change.
 *    `useUpdateLayoutEffect` (skip-first) maps to `on(..., { defer: true })`.
 *  - Plain closure variables replace `useRef` (a Solid component body runs once).
 *  - React's bubbling `onFocus` / `onBlur` are `onFocusIn` / `onFocusOut`
 *    (the native bubbling focus events) here.
 *  - The link branch opens the anchor directly (we have no router abstraction)
 *    and needs no `flushSync` — `setFocusedKey` is synchronous and the keyed
 *    item element already exists in the DOM.
 *  - Ticket #100 tracks the missing virtual-focus cursor movement through
 *    `moveVirtualFocus` and `dispatchVirtualFocus`. The focused-key bookkeeping
 *    around it is preserved.
 */

import { createEffect, on, onCleanup, type JSX } from "solid-js";
import type { FocusStrategy, Key, SelectionManager } from "@proyecto-viviana/solid-stately";
import type { KeyboardDelegate } from "../grid/types";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { mergeProps } from "../utils/mergeProps";
import {
  getActiveElement,
  getEventTarget,
  getFocusableTreeWalker,
  isFocusWithin,
  isTabbable,
  nodeContains,
  openLink,
} from "../utils/dom";
import { focusSafely, focusWithoutScrolling } from "../utils/focus";
import { scrollIntoView, scrollIntoViewport } from "../utils/scrollIntoView";
import { getInteractionModality } from "../interactions/createInteractionModality";
import {
  createKeyboard,
  type KeyboardEvent as AriaKeyboardEvent,
  type KeyboardShortcutBindings,
} from "../interactions/createKeyboard";
import { isCtrlKeyPressed } from "../utils/keyboard";
import { isMac } from "../utils/platform";
import { useLocale } from "../i18n";
import { createTypeSelect } from "./createTypeSelect";
import { getItemElement, isNonContiguousSelectionModifier, registerCollectionId } from "./utils";
import { CLEAR_FOCUS_EVENT, FOCUS_EVENT } from "./constants";
import { isVirtualDragging } from "../dnd/DragManager";

export interface CreateSelectableCollectionOptions<T = unknown> {
  /** An interface for reading and updating multiple selection state. */
  selectionManager: SelectionManager<T>;
  /** A delegate object that implements behavior for keyboard focus movement. */
  keyboardDelegate: MaybeAccessor<KeyboardDelegate>;
  /** The ref accessor attached to the element representing the collection. */
  ref: () => HTMLElement | null;
  /** Whether the collection or one of its items should be auto-focused. @default false */
  autoFocus?: boolean | FocusStrategy;
  /** Whether focus should wrap around when the end/start is reached. @default false */
  shouldFocusWrap?: boolean;
  /** Whether the collection allows empty selection. @default false */
  disallowEmptySelection?: boolean;
  /** Whether the user can select all items via keyboard shortcut. @default false */
  disallowSelectAll?: boolean;
  /** Whether Escape clears selection. @default 'clearSelection' */
  escapeKeyBehavior?: "clearSelection" | "none";
  /** Whether selection should occur automatically on focus. @default selectionBehavior === 'replace' */
  selectOnFocus?: boolean;
  /** Whether typeahead is disabled. @default false */
  disallowTypeAhead?: boolean;
  /** Whether the collection items use virtual focus instead of being focused directly. */
  shouldUseVirtualFocus?: boolean;
  /** Whether navigation through the Tab key is enabled. */
  allowsTabNavigation?: boolean;
  /** Whether the collection items are contained in a virtual scroller. */
  isVirtualized?: boolean;
  /** The ref accessor attached to the scrollable body. Defaults to the collection ref. */
  scrollRef?: () => HTMLElement | null;
  /** The behavior of links in the collection. @default 'action' */
  linkBehavior?: "action" | "selection" | "override";
  /** Which item to focus when tabbing into the collection. @private */
  UNSTABLE_focusOnEntry?: "first" | "last";
}

export interface SelectableCollectionAria {
  /** Props for the collection element. */
  collectionProps: JSX.HTMLAttributes<HTMLElement>;
}

/**
 * Handles interactions with selectable collections.
 */
export function createSelectableCollection<T = unknown>(
  options: CreateSelectableCollectionOptions<T>,
): SelectableCollectionAria {
  const manager = options.selectionManager;
  const delegate = (): KeyboardDelegate => access(options.keyboardDelegate);
  const ref = options.ref;
  const scrollRef = options.scrollRef ?? ref;
  const autoFocus = options.autoFocus ?? false;
  const shouldFocusWrap = options.shouldFocusWrap ?? false;
  const disallowEmptySelection = options.disallowEmptySelection ?? false;
  const disallowSelectAll = options.disallowSelectAll ?? false;
  const escapeKeyBehavior = options.escapeKeyBehavior ?? "clearSelection";
  const disallowTypeAhead = options.disallowTypeAhead ?? false;
  const shouldUseVirtualFocus = options.shouldUseVirtualFocus ?? false;
  const allowsTabNavigation = options.allowsTabNavigation ?? false;
  const linkBehavior = options.linkBehavior ?? "action";
  const focusOnEntry = options.UNSTABLE_focusOnEntry;

  // Read at call time so a long-press toggling selectionBehavior is reflected.
  const selectOnFocus = (): boolean =>
    options.selectOnFocus ?? manager.selectionBehavior === "replace";

  const locale = useLocale();
  const direction = (): "ltr" | "rtl" => locale().direction;

  const navigateToKey = (
    e: AriaKeyboardEvent,
    key: Key | undefined | null,
    childFocus?: FocusStrategy,
  ): boolean | void => {
    if (key != null) {
      if (
        manager.isLink(key) &&
        linkBehavior === "selection" &&
        selectOnFocus() &&
        !isNonContiguousSelectionModifier(e)
      ) {
        manager.setFocusedKey(key, childFocus);
        const item = getItemElement(ref, key);
        if (item instanceof HTMLAnchorElement) {
          openLink(item, e);
          return;
        }

        return false;
      }

      manager.setFocusedKey(key, childFocus);

      if (manager.isLink(key) && linkBehavior === "override") {
        return false;
      }

      if (e.shiftKey && manager.selectionMode === "multiple") {
        manager.extendSelection(key);
        return;
      } else if (selectOnFocus() && !isNonContiguousSelectionModifier(e)) {
        manager.replaceSelection(key);
        return;
      }
    }

    return false;
  };

  const arrowDown = (e: AriaKeyboardEvent): boolean | void => {
    const d = delegate();
    if (d.getKeyBelow) {
      let nextKey =
        manager.focusedKey != null ? d.getKeyBelow(manager.focusedKey) : d.getFirstKey?.();
      if (nextKey == null && shouldFocusWrap) {
        nextKey = d.getFirstKey?.(manager.focusedKey ?? undefined);
      }
      if (nextKey != null) {
        navigateToKey(e, nextKey);
        return;
      }
    }
    return false;
  };

  const arrowUp = (e: AriaKeyboardEvent): boolean | void => {
    const d = delegate();
    if (d.getKeyAbove) {
      let nextKey =
        manager.focusedKey != null ? d.getKeyAbove(manager.focusedKey) : d.getLastKey?.();
      if (nextKey == null && shouldFocusWrap) {
        nextKey = d.getLastKey?.(manager.focusedKey ?? undefined);
      }
      if (nextKey != null) {
        navigateToKey(e, nextKey);
        return;
      }
    }
    return false;
  };

  const home = (e: AriaKeyboardEvent): boolean | void => {
    const d = delegate();
    if (d.getFirstKey) {
      if (manager.focusedKey == null && e.shiftKey) {
        return false;
      }
      const firstKey = d.getFirstKey(manager.focusedKey ?? undefined, isCtrlKeyPressed(e));
      manager.setFocusedKey(firstKey);
      if (firstKey != null) {
        if (isCtrlKeyPressed(e) && e.shiftKey && manager.selectionMode === "multiple") {
          manager.extendSelection(firstKey);
          return;
        } else if (selectOnFocus()) {
          manager.replaceSelection(firstKey);
          return;
        }
      }
    }
    return false;
  };

  const arrowLeft = (e: AriaKeyboardEvent): boolean | void => {
    const d = delegate();
    if (d.getKeyLeftOf) {
      let nextKey =
        manager.focusedKey != null ? d.getKeyLeftOf(manager.focusedKey) : d.getFirstKey?.();
      if (nextKey == null && shouldFocusWrap) {
        nextKey =
          direction() === "rtl"
            ? d.getFirstKey?.(manager.focusedKey ?? undefined)
            : d.getLastKey?.(manager.focusedKey ?? undefined);
      }
      if (nextKey != null) {
        navigateToKey(e, nextKey, direction() === "rtl" ? "first" : "last");
        return;
      }
    }
    return false;
  };

  const arrowRight = (e: AriaKeyboardEvent): boolean | void => {
    const d = delegate();
    if (d.getKeyRightOf) {
      let nextKey =
        manager.focusedKey != null ? d.getKeyRightOf(manager.focusedKey) : d.getFirstKey?.();
      if (nextKey == null && shouldFocusWrap) {
        nextKey =
          direction() === "rtl"
            ? d.getLastKey?.(manager.focusedKey ?? undefined)
            : d.getFirstKey?.(manager.focusedKey ?? undefined);
      }
      if (nextKey != null) {
        navigateToKey(e, nextKey, direction() === "rtl" ? "last" : "first");
        return;
      }
    }
    return false;
  };

  const end = (e: AriaKeyboardEvent): boolean | void => {
    const d = delegate();
    if (d.getLastKey) {
      if (manager.focusedKey == null && e.shiftKey) {
        return false;
      }
      const lastKey = d.getLastKey(manager.focusedKey ?? undefined, isCtrlKeyPressed(e));
      manager.setFocusedKey(lastKey);
      if (lastKey != null) {
        if (isCtrlKeyPressed(e) && e.shiftKey && manager.selectionMode === "multiple") {
          manager.extendSelection(lastKey);
          return;
        } else if (selectOnFocus()) {
          manager.replaceSelection(lastKey);
          return;
        }
      }
    }
    return false;
  };

  const pageDown = (e: AriaKeyboardEvent): boolean | void => {
    const d = delegate();
    if (d.getKeyPageBelow && manager.focusedKey != null) {
      const nextKey = d.getKeyPageBelow(manager.focusedKey);
      if (nextKey != null) {
        return navigateToKey(e, nextKey);
      }
    }
    return false;
  };

  const pageUp = (e: AriaKeyboardEvent): boolean | void => {
    const d = delegate();
    if (d.getKeyPageAbove && manager.focusedKey != null) {
      const nextKey = d.getKeyPageAbove(manager.focusedKey);
      if (nextKey != null) {
        return navigateToKey(e, nextKey);
      }
    }
    return false;
  };

  const selectAll = (): boolean | void => {
    if (manager.selectionMode === "multiple" && disallowSelectAll !== true) {
      manager.selectAll();
      return;
    }
    return false;
  };

  const escape = (): boolean | void => {
    if (
      escapeKeyBehavior === "clearSelection" &&
      !disallowEmptySelection &&
      manager.selectedKeys.size !== 0
    ) {
      manager.clearSelection();
      return;
    }
    return false;
  };

  const tab = () => {
    const root = ref();
    if (!allowsTabNavigation && root) {
      const walker = getFocusableTreeWalker(root, { tabbable: true });
      let next: HTMLElement | undefined;
      let last: Node | null;
      do {
        last = walker.lastChild();
        if (last) {
          next = last as HTMLElement;
        }
      } while (last);

      const activeElement = getActiveElement();
      if (next && (!isFocusWithin(next) || (activeElement && !isTabbable(activeElement)))) {
        focusWithoutScrolling(next);
      }
    }
    return { shouldContinuePropagation: true, shouldPreventDefault: false };
  };

  const shiftTab = () => {
    const root = ref();
    if (!allowsTabNavigation && root) {
      root.focus();
    }
    return { shouldContinuePropagation: true, shouldPreventDefault: false };
  };

  type ShortcutAction = KeyboardShortcutBindings[string];
  const withShiftSelection = (key: string, callback: ShortcutAction): KeyboardShortcutBindings => ({
    [isMac() ? `${key}+Shift+Alt` : `${key}+Shift+Control`]: callback,
    [`${key}+Shift`]: callback,
    [isMac() ? `${key}+Alt` : `${key}+Control`]: callback,
    [key]: callback,
  });

  const { keyboardProps: repeatKeyboardProps } = createKeyboard({
    shortcuts: {
      ...withShiftSelection("ArrowDown", arrowDown),
      ...withShiftSelection("ArrowUp", arrowUp),
      ...withShiftSelection("ArrowLeft", arrowLeft),
      ...withShiftSelection("ArrowRight", arrowRight),
      ...withShiftSelection("PageDown", pageDown),
      ...withShiftSelection("PageUp", pageUp),
    },
    allowRepeats: true,
  });

  const { keyboardProps } = createKeyboard({
    shortcuts: {
      ...withShiftSelection("Home", home),
      ...withShiftSelection("End", end),
      "Mod+A": selectAll,
      Escape: escape,
      Tab: tab,
      "Tab+Shift": shiftTab,
    },
  });

  // Store the scroll position so we can restore it later.
  const scrollPos = { top: 0, left: 0 };
  addRefListener(scrollRef, "scroll", () => {
    const sr = scrollRef();
    scrollPos.top = sr?.scrollTop ?? 0;
    scrollPos.left = sr?.scrollLeft ?? 0;
  });

  const onFocusIn = (e: FocusEvent) => {
    const currentTarget = e.currentTarget as Element;
    if (manager.isFocused) {
      // If a focus event bubbled through a portal, reset focus state.
      if (!nodeContains(currentTarget, getEventTarget(e) as Node)) {
        manager.setFocused(false);
      }
      return;
    }

    // Focus events can bubble through portals. Ignore these events.
    if (!nodeContains(currentTarget, getEventTarget(e) as Node)) {
      return;
    }

    const modality = getInteractionModality();
    manager.setFocused(true);
    const navigate = (key: Key | undefined | null) => {
      if (key != null) {
        manager.setFocusedKey(key);
        if (selectOnFocus() && !manager.isSelected(key)) {
          manager.replaceSelection(key);
        }
      }
    };

    if (focusOnEntry && (modality === "keyboard" || modality === "virtual")) {
      navigate(focusOnEntry === "first" ? delegate().getFirstKey?.() : delegate().getLastKey?.());
    } else if (manager.focusedKey == null) {
      // If the user hasn't yet interacted with the collection there will be no
      // focusedKey set. Detect whether the user is tabbing forward or backward
      // and focus the first or last item accordingly.
      const relatedTarget = e.relatedTarget as Element | null;
      if (
        relatedTarget &&
        currentTarget.compareDocumentPosition(relatedTarget) & Node.DOCUMENT_POSITION_FOLLOWING
      ) {
        navigate(manager.lastSelectedKey ?? delegate().getLastKey?.());
      } else {
        navigate(manager.firstSelectedKey ?? delegate().getFirstKey?.());
      }
    } else if (scrollRef()) {
      // Restore the scroll position to what it was before.
      const sr = scrollRef()!;
      sr.scrollTop = scrollPos.top;
      sr.scrollLeft = scrollPos.left;
    }

    if (manager.focusedKey != null && scrollRef()) {
      // Refocus and scroll the focused item into view if it exists within the
      // scrollable region.
      const element = getItemElement(ref, manager.focusedKey);
      if (element instanceof HTMLElement) {
        // Prevents a flash of focus on the first/last element, or the collection.
        if (!isFocusWithin(element) && !shouldUseVirtualFocus) {
          focusWithoutScrolling(element);
        }

        if (modality === "keyboard" || (focusOnEntry && modality === "virtual")) {
          scrollIntoViewport(element, { containingElement: ref()! });
        }
      }
    }
  };

  const onFocusOut = (e: FocusEvent) => {
    const currentTarget = e.currentTarget as Element;
    // Don't set blurred and then focused again if moving focus within the collection.
    if (nodeContains(currentTarget, e.relatedTarget as Node)) {
      return;
    }

    // Windowed collections remount the focused option when the slice/spacers
    // change. Removing that node fires focusout with a null relatedTarget and
    // would otherwise clear isFocused, so the remounted option never restores
    // DOM focus (RAC keeps the persisted node, so this path does not run).
    const focusedKey = manager.focusedKey;
    if (e.relatedTarget == null && focusedKey != null) {
      // During a keyboard/virtual drag, DOM focus belongs to the drop indicator
      // (`useDroppableItem.ts:84-88`). Restoring the focused option here — and
      // especially restoring an `inert` option, which Chromium then maps to the
      // collection — bounces `document.activeElement` onto `listbox:Permissions`.
      if (isVirtualDragging()) {
        return;
      }
      const lostTarget = e.target as Node;
      requestAnimationFrame(() => {
        if (manager.focusedKey !== focusedKey) {
          return;
        }
        const item = getItemElement(ref, focusedKey);
        if (item instanceof HTMLElement && item !== lostTarget) {
          manager.setFocused(true);
          if (!shouldUseVirtualFocus) {
            focusWithoutScrolling(item);
          }
          return;
        }
        if (lostTarget.isConnected) {
          manager.setFocused(false);
        }
      });
      return;
    }

    manager.setFocused(false);
  };

  // Whether to auto-focus the first item once the collection updates (used by
  // virtual focus / autocomplete as the user types).
  let shouldVirtualFocusFirst = false;

  if (shouldUseVirtualFocus) {
    addRefListener(ref, FOCUS_EVENT, (e: Event) => {
      const detail = (e as CustomEvent).detail;
      e.stopPropagation();
      manager.setFocused(true);
      // If the user is typing forwards, autofocus the first option in the list.
      if (detail?.focusStrategy === "first") {
        shouldVirtualFocusFirst = true;
      }
    });

    addRefListener(ref, CLEAR_FOCUS_EVENT, (e: Event) => {
      e.stopPropagation();
      manager.setFocused(false);
      if ((e as CustomEvent).detail?.clearFocusKey) {
        manager.setFocusedKey(null);
      }
    });
  }

  // Update active descendant (skip-first; runs on [firstKey, collection.size]).
  createEffect(
    on(
      () => [delegate().getFirstKey?.() ?? null, manager.collection.size] as const,
      ([firstKey]) => {
        if (!shouldVirtualFocusFirst) {
          return;
        }
        if (firstKey == null) {
          // No focusable items: clear the virtual-focus intent once the
          // collection is settled. Ticket #100 tracks the missing AT cursor
          // reset for this branch.
          if (manager.collection.size > 0) {
            shouldVirtualFocusFirst = false;
          }
        } else {
          manager.setFocusedKey(firstKey);
          shouldVirtualFocusFirst = false;
        }
      },
      { defer: true },
    ),
  );

  // Reset the focus-first flag if the focused key changed by any other means.
  createEffect(
    on(
      () => manager.focusedKey,
      () => {
        if (manager.collection.size > 0) {
          shouldVirtualFocusFirst = false;
        }
      },
      { defer: true },
    ),
  );

  // Auto-focus the collection (or its first/last/selected item) on mount, once
  // the collection has items. Re-runs as the collection size changes.
  let autoFocusActive = autoFocus !== false;
  let didAutoFocus = false;
  createEffect(() => {
    const size = manager.collection.size;
    const selectedKeys = manager.selectedKeys;
    if (!autoFocusActive) {
      return;
    }

    let focusedKey: Key | null = null;
    if (autoFocus === "first") {
      focusedKey = delegate().getFirstKey?.() ?? null;
    }
    if (autoFocus === "last") {
      focusedKey = delegate().getLastKey?.() ?? null;
    }

    // If there are any selected keys, make the first selectable one the focus target.
    if (selectedKeys.size) {
      for (const key of selectedKeys) {
        if (manager.canSelectItem(key)) {
          focusedKey = key;
          break;
        }
      }
    }

    manager.setFocused(true);
    manager.setFocusedKey(focusedKey);

    if (
      focusedKey != null &&
      selectOnFocus() &&
      !selectedKeys.size &&
      manager.canSelectItem(focusedKey)
    ) {
      manager.replaceSelection(focusedKey);
    }

    // If no default focus key is selected, focus the collection itself.
    const root = ref();
    if (focusedKey == null && !shouldUseVirtualFocus && root) {
      focusSafely(root);
    }

    // Wait until the collection has items to finish auto-focusing.
    if (size > 0) {
      autoFocusActive = false;
      didAutoFocus = true;
    }
  });

  // Scroll the focused element into view when the focusedKey changes.
  let lastFocusedKey = manager.focusedKey;
  let raf: number | null = null;
  createEffect(() => {
    const isFocused = manager.isFocused;
    const focusedKey = manager.focusedKey;
    const root = ref();
    const sr = scrollRef();
    if (
      isFocused &&
      focusedKey != null &&
      (focusedKey !== lastFocusedKey || didAutoFocus) &&
      sr &&
      root
    ) {
      const modality = getInteractionModality();
      const element = getItemElement(ref, focusedKey);
      if (!(element instanceof HTMLElement)) {
        // The element wasn't found yet (e.g. a virtualizer hasn't rendered it).
        // Return without updating bookkeeping so we retry on the next change.
        return;
      }

      if (modality === "keyboard" || didAutoFocus) {
        if (raf != null) {
          cancelAnimationFrame(raf);
        }

        raf = requestAnimationFrame(() => {
          const scrollEl = scrollRef();
          if (scrollEl) {
            scrollIntoView(scrollEl, element);
            // Avoid scroll in iOS VO, since it may cause an overlay to close.
            if (modality !== "virtual") {
              scrollIntoViewport(element, { containingElement: ref()! });
            }
          }
        });
      }
    }

    // If the focused key became null (e.g. the last item was deleted), focus the
    // whole collection.
    if (
      !shouldUseVirtualFocus &&
      isFocused &&
      focusedKey == null &&
      lastFocusedKey != null &&
      root
    ) {
      focusSafely(root);
    }

    lastFocusedKey = focusedKey;
    didAutoFocus = false;
  });

  onCleanup(() => {
    if (raf != null) {
      cancelAnimationFrame(raf);
    }
  });

  // Intercept FocusScope restoration since virtualized collections can reuse DOM nodes.
  addRefListener(ref, "react-aria-focus-scope-restore", (e: Event) => {
    e.preventDefault();
    manager.setFocused(true);
  });

  const onMouseDown = (e: MouseEvent) => {
    // Ignore events that bubbled through portals.
    if (scrollRef() === getEventTarget(e)) {
      // Prevent focus going to the collection when clicking on the scrollbar.
      e.preventDefault();
    }
  };

  const { typeSelectProps } = createTypeSelect<T>({
    collection: () => manager.collection,
    focusedKey: () => manager.focusedKey,
    onFocusedKeyChange: (key) => manager.setFocusedKey(key),
    isKeyDisabled: (key) => manager.isDisabled(key),
  });

  // A stable id shared with this collection's items (keyed by the manager) so
  // getItemElement can scope a query by `data-collection`.
  const collectionId = registerCollectionId(manager);

  return {
    get collectionProps(): JSX.HTMLAttributes<HTMLElement> {
      let tabIndex: number | undefined;
      if (!shouldUseVirtualFocus) {
        tabIndex = manager.focusedKey == null ? 0 : -1;
      }

      let handlers: Record<string, unknown> = mergeProps(
        keyboardProps as Record<string, unknown>,
        repeatKeyboardProps as Record<string, unknown>,
        {
          onFocusIn,
          onFocusOut,
          onMouseDown,
        },
      );

      if (!disallowTypeAhead) {
        handlers = mergeProps(typeSelectProps as Record<string, unknown>, handlers);
      }

      return mergeProps(handlers, {
        tabIndex,
        "data-collection": collectionId,
      }) as JSX.HTMLAttributes<HTMLElement>;
    },
  };
}

/** Attaches `type` to the element from `ref`, re-binding when the element changes. */
function addRefListener(
  ref: () => HTMLElement | null,
  type: string,
  handler: (e: Event) => void,
): void {
  createEffect(() => {
    const el = ref();
    if (!el) {
      return;
    }
    el.addEventListener(type, handler);
    onCleanup(() => el.removeEventListener(type, handler));
  });
}
