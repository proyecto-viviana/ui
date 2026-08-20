/**
 * ARIA hooks for tab components.
 * Based on @react-aria/tabs.
 */

import { type Accessor, batch, createEffect, createMemo } from "solid-js";
import { createFocusRing } from "../interactions";
import { createPress } from "../interactions";
import { createHover } from "../interactions";
import { createId } from "../ssr";
import { useLocale } from "../i18n";
import type { Key, Collection, CollectionNode } from "@proyecto-viviana/solid-stately";

export type TabOrientation = "horizontal" | "vertical";
export type KeyboardActivation = "automatic" | "manual";

export interface TabListState<T = unknown> {
  collection: Accessor<Collection<T>>;
  selectedKey: Accessor<Key | null>;
  setSelectedKey(key: Key): void;
  selectedItem: Accessor<CollectionNode<T> | null>;
  isDisabled: Accessor<boolean>;
  keyboardActivation: Accessor<KeyboardActivation>;
  orientation: Accessor<TabOrientation>;
  isKeyDisabled(key: Key): boolean;
  disabledKeys: Accessor<Set<Key>>;
  isFocused: Accessor<boolean>;
  setFocused(isFocused: boolean): void;
  focusedKey: Accessor<Key | null>;
  setFocusedKey(key: Key | null): void;
}

export interface AriaTabListProps {
  /** The orientation of the tab list. */
  orientation?: TabOrientation;
  /** How tabs are activated (on focus or on click). */
  keyboardActivation?: KeyboardActivation;
  /** Whether the tab list is disabled. */
  isDisabled?: boolean;
  /** Label for the tab list. */
  "aria-label"?: string;
  /** ID of element that labels the tab list. */
  "aria-labelledby"?: string;
  /** ID of element that describes the tab list. */
  "aria-describedby"?: string;
}

export interface TabListAria {
  /** Props for the tab list container element. */
  tabListProps: {
    role: "tablist";
    "aria-orientation": TabOrientation;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    onKeyDown: (e: KeyboardEvent) => void;
    // React's bubbling onFocus/onBlur map to focusin/focusout in Solid; the
    // tab list must observe focus entering/leaving its child tabs.
    onFocusIn: (e: FocusEvent) => void;
    onFocusOut: (e: FocusEvent) => void;
  };
}

export interface AriaTabProps {
  /** The key of the tab. */
  key: Key;
  /** Whether the tab is disabled. */
  isDisabled?: boolean;
  /** Label for the tab. */
  "aria-label"?: string;
  /** ID reference for the tab label. */
  "aria-labelledby"?: string;
}

export interface TabAria {
  /** Props for the tab element. */
  tabProps: {
    id: string;
    role: "tab";
    "aria-selected": boolean;
    "aria-disabled": boolean | undefined;
    "aria-controls": string | undefined;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    tabIndex: number | undefined;
    onKeyDown: (e: KeyboardEvent) => void;
    onMouseDown: (e: MouseEvent) => void;
    onPointerDown: (e: PointerEvent) => void;
    onClick: (e: MouseEvent) => void;
    onFocus: (e: FocusEvent) => void;
    onFocusIn: (e: FocusEvent) => void;
    onBlur: (e: FocusEvent) => void;
  };
  /** Whether the tab is selected. */
  isSelected: Accessor<boolean>;
  /** Whether the tab is disabled. */
  isDisabled: Accessor<boolean>;
  /** Whether the tab is pressed. */
  isPressed: Accessor<boolean>;
  /** Whether the tab has focus. */
  isFocused: Accessor<boolean>;
  /** Whether the tab has visible focus ring. */
  isFocusVisible: Accessor<boolean>;
  /** Whether the tab is hovered. */
  isHovered: Accessor<boolean>;
}

export interface AriaTabPanelProps {
  /** The key of the associated tab. */
  id?: Key;
  /** Label for the tab panel. */
  "aria-label"?: string;
  /** ID of element that labels the tab panel. */
  "aria-labelledby"?: string;
  /** ID of element that describes the tab panel. */
  "aria-describedby"?: string;
}

export interface TabPanelAria {
  /** Props for the tab panel element. */
  tabPanelProps: {
    id: string;
    role: "tabpanel";
    "aria-labelledby"?: string;
    "aria-label"?: string;
    "aria-describedby"?: string;
    tabIndex: number;
  };
  /** Whether this panel is the selected one. */
  isSelected: Accessor<boolean>;
}

const tabListIds = new WeakMap<TabListState<unknown>, string>();

function getTabListId<T>(state: TabListState<T>): string {
  let id = tabListIds.get(state as TabListState<unknown>);
  if (!id) {
    id = createId();
    tabListIds.set(state as TabListState<unknown>, id);
  }
  return id;
}

function generateTabId<T>(state: TabListState<T>, key: Key): string {
  const baseId = getTabListId(state);
  const keyStr = String(key).replace(/\s+/g, "-");
  return `${baseId}-tab-${keyStr}`;
}

function generateTabPanelId<T>(state: TabListState<T>, key: Key): string {
  const baseId = getTabListId(state);
  const keyStr = String(key).replace(/\s+/g, "-");
  return `${baseId}-tabpanel-${keyStr}`;
}

function getNextKey<T>(state: TabListState<T>, currentKey: Key): Key | null {
  const coll = state.collection();
  const keys = [...coll].map((node) => node.key);
  const currentIndex = keys.indexOf(currentKey);

  if (currentIndex === -1) return keys[0] ?? null;

  // Find next non-disabled key, wrapping around
  for (let i = 1; i <= keys.length; i++) {
    const nextIndex = (currentIndex + i) % keys.length;
    const nextKey = keys[nextIndex];
    if (!state.isKeyDisabled(nextKey)) {
      return nextKey;
    }
  }

  return null;
}

function getPreviousKey<T>(state: TabListState<T>, currentKey: Key): Key | null {
  const coll = state.collection();
  const keys = [...coll].map((node) => node.key);
  const currentIndex = keys.indexOf(currentKey);

  if (currentIndex === -1) return keys[keys.length - 1] ?? null;

  // Find previous non-disabled key, wrapping around
  for (let i = 1; i <= keys.length; i++) {
    const prevIndex = (currentIndex - i + keys.length) % keys.length;
    const prevKey = keys[prevIndex];
    if (!state.isKeyDisabled(prevKey)) {
      return prevKey;
    }
  }

  return null;
}

function getFirstKey<T>(state: TabListState<T>): Key | null {
  const coll = state.collection();
  for (const node of coll) {
    if (!state.isKeyDisabled(node.key)) {
      return node.key;
    }
  }
  return null;
}

function getLastKey<T>(state: TabListState<T>): Key | null {
  const coll = state.collection();
  const keys = [...coll].map((node) => node.key).reverse();
  for (const key of keys) {
    if (!state.isKeyDisabled(key)) {
      return key;
    }
  }
  return null;
}

/**
 * Creates ARIA props for a tab list container.
 */
export function createTabList<T>(props: AriaTabListProps, state: TabListState<T>): TabListAria {
  const locale = useLocale();
  const orientation = () => props.orientation ?? state.orientation() ?? "horizontal";
  const keyboardActivation = () =>
    props.keyboardActivation ?? state.keyboardActivation() ?? "automatic";

  const handleKeyDown = (e: KeyboardEvent) => {
    if (state.isDisabled()) return;

    const currentKey = state.focusedKey() ?? state.selectedKey();
    if (currentKey === null) return;

    let nextKey: Key | null = null;
    const isHorizontal = orientation() === "horizontal";
    const isRTL = locale().direction === "rtl";

    switch (e.key) {
      case "ArrowLeft":
        if (isHorizontal) {
          nextKey = isRTL ? getNextKey(state, currentKey) : getPreviousKey(state, currentKey);
        }
        break;
      case "ArrowRight":
        if (isHorizontal) {
          nextKey = isRTL ? getPreviousKey(state, currentKey) : getNextKey(state, currentKey);
        }
        break;
      case "ArrowUp":
        if (!isHorizontal) {
          nextKey = getPreviousKey(state, currentKey);
        }
        break;
      case "ArrowDown":
        if (!isHorizontal) {
          nextKey = getNextKey(state, currentKey);
        }
        break;
      case "Home":
        nextKey = getFirstKey(state);
        break;
      case "End":
        nextKey = getLastKey(state);
        break;
      case "Enter":
      case " ":
        // In manual mode, Enter/Space activates the focused tab
        if (keyboardActivation() === "manual" && state.focusedKey()) {
          state.setSelectedKey(state.focusedKey()!);
          e.preventDefault();
        }
        return;
      default:
        return;
    }

    if (nextKey !== null) {
      e.preventDefault();
      // Batch the focus + selection writes so their observable ordering matches
      // React. `setFocusedKey` drives a reactive effect that moves DOM focus
      // (firing native focusout/focusin); `setSelectedKey` calls
      // `onSelectionChange` synchronously. Written bare, Solid flushes the focus
      // effect the instant `setFocusedKey` runs — so focus moves *before* the
      // selection callback, inverting React's order. React batches both state
      // updates in the handler (callback fires synchronously) and defers the
      // focus move to a layout effect. `batch()` is the Solid equivalent: it
      // holds the focus effect until the batch closes, so the synchronous
      // `onSelectionChange` fires first, then focus moves — matching upstream's
      // `callback → focusout → focusin` sequence (D4 event-sequence oracle).
      //
      // `setFocused(true)` stays inside the batch. Playwright `.focus()` can
      // land DOM focus on a tab without the tablist bubbling `focusin`; the
      // item focus-move effect is gated on `isFocused` (RAC
      // `manager.isFocused`). Setting it here, together with `focusedKey`,
      // avoids the previous-tab effect stealing focus back mid-gesture.
      batch(() => {
        state.setFocused(true);
        state.setFocusedKey(nextKey);
        // Selection follows focus only for keyboard navigation in automatic mode
        // (mirrors useSelectableCollection's selectOnFocus in navigateToKey).
        if (keyboardActivation() === "automatic") {
          state.setSelectedKey(nextKey);
        }
      });
      // Move DOM focus in the keydown handler so it lands before keyup.
      // Solid `createEffect` is scheduled after paint; Playwright records
      // keyup in the same turn, and a non-reactive `let` tab ref can leave
      // the item effect with no element. Scope the query to the tablist so
      // React/Solid comparison-panel ids cannot collide.
      const tabList = e.currentTarget as Element | null;
      const nextId = generateTabId(state, nextKey);
      const nextEl = tabList?.querySelector(`#${CSS.escape(nextId)}`);
      if (nextEl instanceof HTMLElement && nextEl.ownerDocument.activeElement !== nextEl) {
        nextEl.focus();
      }
    }
  };

  const handleFocus = () => {
    state.setFocused(true);
    // If no focused key, focus the selected key
    if (state.focusedKey() === null && state.selectedKey() !== null) {
      state.setFocusedKey(state.selectedKey());
    }
  };

  const handleBlur = (e: FocusEvent) => {
    // Only blur if focus is leaving the tab list entirely
    const relatedTarget = e.relatedTarget as Element | null;
    if (relatedTarget && (e.currentTarget as Element).contains(relatedTarget)) {
      return;
    }
    state.setFocused(false);
  };

  return {
    tabListProps: {
      role: "tablist",
      "aria-orientation": orientation(),
      "aria-label": props["aria-label"],
      "aria-labelledby": props["aria-labelledby"],
      "aria-describedby": props["aria-describedby"],
      onKeyDown: handleKeyDown,
      onFocusIn: handleFocus,
      onFocusOut: handleBlur,
    },
  };
}

/**
 * Creates ARIA props for an individual tab.
 */
export function createTab<T>(
  props: AriaTabProps,
  state: TabListState<T>,
  ref?: Accessor<HTMLElement | null>,
): TabAria {
  const key = () => props.key;

  const isSelected = createMemo(() => state.selectedKey() === key());
  const isDisabled = createMemo(() => {
    if (props.isDisabled) return true;
    return state.isKeyDisabled(key());
  });

  // Whether this tab is the roving-focus target (state layer), used for the
  // roving tabIndex and DOM focus alignment. The returned isFocused is the
  // DOM-focus-based ring state, matching upstream's useFocusRing semantics.
  const isKeyFocused = createMemo(() => state.focusedKey() === key());

  // Focus ring
  const { isFocused, isFocusVisible, focusProps } = createFocusRing();

  // Press handling. Selection timing mirrors useSelectableItem's default
  // (non-shouldSelectOnPressUp) path: mouse selects on press start and
  // keyboard on key down, while touch, pen, and virtual pointers select on
  // press up.
  const selectTab = () => {
    // Press handlers select only — they do NOT set the focused key. Upstream's
    // useSelectableItem does the same: its press/onSelect path calls
    // replaceSelection, while `focusedKey` is driven exclusively by the DOM
    // `onFocus` handler (see handleFocus below). Setting the focused key here too
    // flipped the roving tabIndex synchronously at pointer-up — *before* the
    // browser's native focus reached the tab — so a touch tap logged the tapped
    // tab with tabIndex 0 at its own `focusin`, where React (which updates
    // tabIndex only on the post-event commit) still shows -1. Letting native
    // focus alone advance `focusedKey` defers the tabIndex flip past the focus
    // event, matching React's D4 event sequence.
    state.setSelectedKey(key());
  };
  const { isPressed, pressProps } = createPress({
    get isDisabled() {
      return isDisabled();
    },
    onPressStart: (e) => {
      if (e.pointerType === "mouse" || e.pointerType === "keyboard") {
        selectTab();
      }
    },
    onPress: (e) => {
      if (e.pointerType === "touch" || e.pointerType === "pen" || e.pointerType === "virtual") {
        selectTab();
      }
    },
  });

  // Hover handling
  const { isHovered } = createHover({
    get isDisabled() {
      return isDisabled();
    },
  });

  // Generate IDs
  const tabId = generateTabId(state, key());
  const tabPanelId = generateTabPanelId(state, key());

  // Helper to safely call event handlers that may be bound tuples
  const callHandler = <E extends Event>(handler: unknown, event: E) => {
    if (typeof handler === "function") {
      (handler as (e: E) => void)(event);
      return;
    }
    if (Array.isArray(handler) && handler.length >= 2 && typeof handler[1] === "function") {
      (handler[1] as (this: unknown, e: E) => void).call(handler[0], event);
    }
  };

  // Focus management. The focus ring reacts to the native `focus` event, but the
  // roving-tabindex commit is deliberately bound to `focusin` (see
  // handleFocusIn) so its DOM reflection lands one event later — matching React,
  // whose `onFocus` is a `focusin`-delegated listener at the app root.
  const handleFocus = (e: FocusEvent) => {
    callHandler(focusProps.onFocus, e);
  };

  // Roving-tabindex commit (D4 event-ordering). React's `onFocus` is delegated
  // to a single `focusin` listener at the app root, so the roving tabIndex it
  // drives reflects one event *after* the native `focus`. Binding the
  // focusedKey write here (to `focusin`) mirrors that timing: the D4 oracle
  // records event targets from a document-level capture-phase listener, which
  // runs before this at-target handler, so a touch tap — whose selection lands
  // on press-up, after focus — is still observed with tabIndex=-1 at `focusin`,
  // exactly as React. A mouse press selects on press-start and syncs focusedKey
  // before focus (createTabListState's selection→focus effect), so its tab
  // already reads tabIndex=0 at `focusin`, again matching React. Setting it on
  // the earlier `focus` event flipped the tab a whole event too soon, so touch
  // taps diverged at `focusin`. The D4 event driver holds this ordering.
  const handleFocusIn = () => {
    // Batch collection-focused + roving key. Native `focus` is too early:
    // setting isFocused there flushes the previous tab's focus-move effect
    // and steals a touch tap back to Overview (D4 touch-tap).
    batch(() => {
      state.setFocused(true);
      state.setFocusedKey(key());
    });
  };

  const handleBlur = (e: FocusEvent) => {
    callHandler(focusProps.onBlur, e);
  };

  // Combine all handlers
  const handleKeyDown = (e: KeyboardEvent) => {
    callHandler(pressProps.onKeyDown, e);
  };

  const handleMouseDown = (e: MouseEvent) => {
    callHandler(pressProps.onMouseDown, e);
  };

  const handlePointerDown = (e: PointerEvent) => {
    callHandler(pressProps.onPointerDown, e);
  };

  const handleClick = (e: MouseEvent) => {
    callHandler(pressProps.onClick, e);
  };

  // Keep DOM focus aligned with focusedKey updates from keyboard navigation.
  // Only while the tab list itself is focused (mirrors useSelectableItem's
  // manager.isFocused guard), so programmatic selection changes don't steal
  // focus from elsewhere in the document.
  createEffect(() => {
    const element = ref?.();
    if (!state.isFocused() || !isKeyFocused() || !element) return;

    const activeElement = element.ownerDocument?.activeElement;
    if (activeElement !== element) {
      element.focus();
    }
  });

  return {
    tabProps: {
      id: tabId,
      role: "tab",
      get "aria-selected"() {
        return isSelected();
      },
      get "aria-disabled"() {
        return isDisabled() || undefined;
      },
      get "aria-controls"() {
        return isSelected() ? tabPanelId : undefined;
      },
      "aria-label": props["aria-label"],
      "aria-labelledby": props["aria-labelledby"],
      get tabIndex() {
        // Roving tabIndex follows the focused key (mirrors useSelectableItem);
        // disabled tabs get no tabIndex at all (mirrors useTab).
        if (isDisabled()) return undefined;
        return isKeyFocused() ? 0 : -1;
      },
      onKeyDown: handleKeyDown,
      onMouseDown: handleMouseDown,
      onPointerDown: handlePointerDown,
      onClick: handleClick,
      onFocus: handleFocus,
      onFocusIn: handleFocusIn,
      onBlur: handleBlur,
    },
    isSelected,
    isDisabled,
    isPressed,
    isFocused,
    isFocusVisible,
    isHovered,
  };
}

/**
 * Creates ARIA props for a tab panel.
 */
export function createTabPanel<T>(
  props: AriaTabPanelProps,
  state: TabListState<T> | null,
): TabPanelAria {
  const fallbackId = createId();

  // Shared panel pattern: if no explicit id is provided, associate the panel
  // with the currently selected tab.
  const associatedKey = createMemo<Key | null>(() => {
    if (state === null) return null;
    return props.id ?? state.selectedKey();
  });

  // If state is null, the panel is always visible (SSR fallback).
  const isSelected = createMemo(() => {
    if (state === null) return true;
    if (props.id === undefined) {
      return state.selectedKey() !== null;
    }
    return state.selectedKey() === props.id;
  });

  return {
    tabPanelProps: {
      get id() {
        const key = associatedKey();
        if (state && key !== null) {
          return generateTabPanelId(state, key);
        }
        return fallbackId;
      },
      role: "tabpanel",
      get "aria-labelledby"() {
        if (props["aria-labelledby"]) return props["aria-labelledby"];
        const key = associatedKey();
        if (state && key !== null) {
          return generateTabId(state, key);
        }
        return undefined;
      },
      "aria-label": props["aria-label"],
      "aria-describedby": props["aria-describedby"],
      // Make panel focusable if no tabbable children
      tabIndex: 0,
    },
    isSelected,
  };
}
