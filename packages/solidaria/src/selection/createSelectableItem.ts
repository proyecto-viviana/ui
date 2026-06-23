/**
 * createSelectableItem - handles interactions with an item in a selectable
 * collection. Port of `@react-aria/selection`'s `useSelectableItem`.
 *
 * This encapsulates the full press-path action model: the
 * selection-vs-action decision per pointer type, the press-up-vs-press timing
 * (menus select on press up, rows on press down), the keyboard Space/Enter
 * split, double-click secondary actions, and long-press-to-toggle. The
 * selection decision itself is delegated to the aria-layer {@link selectItem}
 * (Phase 0), which is also where the platform-aware modifier resolution lives.
 *
 * Documented adaptations from upstream (React → Solid / our thinner state):
 * - **Link model is prop-threaded.** Our collection nodes don't expose
 *   `manager.isLink`/`manager.getItemProps`, so link items pass `isLink` /
 *   `href` / `routerOptions` via options and navigation goes through
 *   {@link openLink} (we have no `RouterProvider` context).
 * - **Selection manager shape is structural.** ListState passes its
 *   SelectionManager; grid-like states pass an adapter with the same observable
 *   surface. `canSelectItem` is read from that surface when available so
 *   `disabledBehavior: 'selection'` keeps actions enabled while selection stays
 *   blocked.
 * - **Virtual focus** guards real DOM focus and updates the focused key on
 *   press; we have no `moveVirtualFocus`, so no AT cursor move is dispatched.
 * - **`onDragStart`** is bubble phase (upstream uses capture to beat `useDrag`);
 *   wired to capture when drag-and-drop integration lands.
 * - **`getItemProps` press-handler chaining** (collection-provided press
 *   handlers) is omitted — our nodes don't carry them.
 */

import { createEffect, createUniqueId, type Accessor, type JSX } from "solid-js";
import type {
  Collection,
  DisabledBehavior,
  FocusStrategy,
  Key,
  Selection,
  SelectionBehavior,
} from "@proyecto-viviana/solid-stately";
import { createPress, type PressEvent } from "../interactions/createPress";
import { createLongPress } from "../interactions/createLongPress";
import { mergeProps } from "../utils/mergeProps";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { focusSafely } from "../utils/focus";
import { getOwnerDocument, getEventTarget, openLink } from "../utils/dom";
import { getCollectionId, isNonContiguousSelectionModifier } from "./utils";
import { selectItem, type SelectItemState } from "./selectItem";

/**
 * DOM event dispatched when an item action is performed. Mirrors upstream's
 * `react-aria-item-action`; combobox/autocomplete listen for it to close on
 * action. Exported so emitter and listener share one constant.
 */
export const ITEM_ACTION_EVENT = "solidaria:item-action";

/** How links in the collection behave relative to selection and actions. */
export type LinkBehavior = "action" | "selection" | "override" | "none";

export interface CreateSelectableItemOptions {
  /** A unique key for the item. */
  key: Key;
  /** Optional DOM id for the item element. Defaults to a generated id. */
  id?: string;
  /**
   * By default, selection occurs on pointer down. Set to select on pointer up
   * instead — useful when selecting an item makes the UI disappear (e.g. menus).
   */
  shouldSelectOnPressUp?: boolean;
  /**
   * Whether selection may trigger on a pointer up whose pointer down occurred on
   * a different target (e.g. press down on the menu trigger, up on a menu item).
   */
  allowsDifferentPressOrigin?: boolean;
  /** Whether the item is contained in a virtual scroller. */
  isVirtualized?: boolean;
  /** Function to focus the item, overriding the default DOM focus. */
  focus?: () => void;
  /** Whether the item should use virtual focus instead of receiving DOM focus. */
  shouldUseVirtualFocus?: boolean;
  /** Whether the item is disabled. */
  isDisabled?: boolean;
  /**
   * Handler called when the user performs an action on the item. The triggering
   * event depends on the collection's `selectionBehavior` and the modality.
   */
  onAction?: (event: PressEvent | MouseEvent) => void;
  /**
   * The behavior of links in the collection.
   * - `action`: link behaves like onAction.
   * - `selection`: link follows selection interactions (e.g. URL drives selection).
   * - `override`: links override all other interactions (link items aren't selectable).
   * - `none`: links are disabled for both selection and actions.
   * @default 'action'
   */
  linkBehavior?: LinkBehavior;
  /** Whether this item is a link (prop-threaded; our nodes don't expose `isLink`). */
  isLink?: boolean;
  /** The link target URL, when `isLink`. */
  href?: string;
  /** Router options forwarded to navigation, when `isLink`. */
  routerOptions?: Record<string, unknown>;
  /**
   * Unstable upstream override that forces an item with `onAction` to treat the
   * action as primary (single click), even when it is selectable.
   */
  UNSTABLE_itemBehavior?: "selection" | "action";
}

export interface SelectableItemAria {
  /** Props to spread on the item root element. */
  itemProps: JSX.HTMLAttributes<HTMLElement>;
  /** Whether the item is currently pressed. */
  isPressed: Accessor<boolean>;
  /** Whether the item is currently selected. */
  isSelected: Accessor<boolean>;
  /** Whether the item is currently focused. */
  isFocused: Accessor<boolean>;
  /** Whether the item is non-interactive (selection and actions both disabled). */
  isDisabled: Accessor<boolean>;
  /** Whether the item may be selected. */
  allowsSelection: Accessor<boolean>;
  /** Whether the item has an action (primary or secondary). */
  hasAction: Accessor<boolean>;
}

export interface SelectableItemState<T> extends SelectItemState {
  /** The collection the item belongs to. */
  readonly collection: Accessor<Collection<T>>;
  /** Whether the collection is currently focused. */
  readonly isFocused: Accessor<boolean>;
  /** Sets whether the collection is focused. */
  setFocused(isFocused: boolean): void;
  /** The currently focused key in the collection. */
  readonly focusedKey: Accessor<Key | null>;
  /** The strategy for child focus, when applicable. */
  readonly childFocusStrategy?: Accessor<FocusStrategy | null>;
  /** Sets the focused key. */
  setFocusedKey(key: Key | null, childFocusStrategy?: FocusStrategy): void;
  /** The currently selected keys. */
  readonly selectedKeys: Accessor<Selection>;
  /** Disabled keys for the collection. */
  readonly disabledKeys: Accessor<Set<Key>>;
  /** How disabled keys behave. */
  readonly disabledBehavior: Accessor<DisabledBehavior>;
  /** Whether selection is empty. */
  readonly isEmpty: Accessor<boolean>;
  /** Whether all selectable items are selected. */
  readonly isSelectAll?: Accessor<boolean>;
  /** Whether the key is fully disabled for interaction. */
  isDisabled(key: Key): boolean;
  /** Whether the key may be selected. Defaults to SelectionManager when present. */
  canSelectItem?(key: Key): boolean;
  /** Set the selection behavior for the collection. */
  setSelectionBehavior(behavior: SelectionBehavior): void;
  /** Set multiple selected keys. */
  setSelectedKeys(keys: Iterable<Key>): void;
  /** Select all selectable keys. */
  selectAll(): void;
  /** Clear selection. */
  clearSelection(): void;
  /** Toggle select all. */
  toggleSelectAll(): void;
  /** Optional stable object used by selectable collections for DOM scoping. */
  readonly selectionManager?: {
    canSelectItem?(key: Key): boolean;
  } & object;
}

const isActionKey = (key: string | undefined) => key === "Enter";
const isSelectionKey = (key: string | undefined) => key === " ";

/**
 * Provides the behavior and accessibility implementation for an item in a
 * selectable collection.
 */
export function createSelectableItem<T>(
  options: MaybeAccessor<CreateSelectableItemOptions>,
  manager: SelectableItemState<T>,
  ref: () => HTMLElement | null,
): SelectableItemAria {
  const getOptions = () => access(options);
  const generatedId = createUniqueId();

  const key = () => getOptions().key;
  const id = () => getOptions().id ?? generatedId;
  const linkBehavior = (): LinkBehavior => getOptions().linkBehavior ?? "action";
  const shouldUseVirtualFocus = () => getOptions().shouldUseVirtualFocus ?? false;
  const allowsDifferentPressOrigin = () => getOptions().allowsDifferentPressOrigin ?? false;
  const shouldSelectOnPressUp = () => getOptions().shouldSelectOnPressUp ?? false;
  const isLink = () => getOptions().isLink ?? !!getOptions().href;

  const collection = (): Collection<T> => manager.collection();

  // Final disabled state: explicitly disabled, or disabled by the collection.
  const isDisabled = () => getOptions().isDisabled === true || manager.isDisabled(key());

  // Mirrors SelectionManager.canSelectItem, while allowing grid/table/tree
  // adapters to expose the raw selection-disabled check separately from
  // interaction disabled.
  const canSelectItem = () => {
    const k = key();
    return (
      manager.canSelectItem?.(k) ??
      manager.selectionManager?.canSelectItem?.(k) ??
      (manager.selectionMode() !== "none" && !manager.isDisabled(k))
    );
  };

  const isLinkOverride = () => isLink() && linkBehavior() === "override";
  const isActionOverride = () =>
    getOptions().onAction != null && getOptions().UNSTABLE_itemBehavior === "action";
  const hasLinkAction = () =>
    isLink() && linkBehavior() !== "selection" && linkBehavior() !== "none";

  const allowsSelection = () =>
    !isDisabled() && canSelectItem() && !isLinkOverride() && !isActionOverride();
  const allowsActions = () => (getOptions().onAction != null || hasLinkAction()) && !isDisabled();

  // With checkbox selection (behavior 'toggle'), onAction is primary and occurs
  // on a single click. With highlight selection (behavior 'replace'), onAction
  // is secondary and occurs on double click; single click selects.
  const hasPrimaryAction = () =>
    allowsActions() &&
    (manager.selectionBehavior() === "replace"
      ? !allowsSelection()
      : !allowsSelection() || manager.isEmpty());
  const hasSecondaryAction = () =>
    allowsActions() && allowsSelection() && manager.selectionBehavior() === "replace";
  const hasAction = () => hasPrimaryAction() || hasSecondaryAction();

  const longPressEnabled = () => hasAction() && allowsSelection();

  // Plain mutable state (no reactivity needed): the modality of the active press
  // and snapshots captured at press start.
  let modality: PressEvent["pointerType"] | null = null;
  let longPressEnabledOnPressStart = false;
  let hadPrimaryActionOnPressStart = false;

  const isSelected = () => manager.selectionMode() !== "none" && manager.isSelected(key());
  const isFocused = () => manager.isFocused() && manager.focusedKey() === key();

  // The aria-layer selection decision, with the link branch (deferred from
  // selectItem) layered in. Mirrors useSelectableItem.onSelect.
  const onSelect = (e: PressEvent) => {
    const k = key();
    if (e.pointerType === "keyboard" && isNonContiguousSelectionModifier(e)) {
      manager.toggleSelection(k);
      return;
    }

    if (manager.selectionMode() === "none") {
      return;
    }

    if (isLink()) {
      if (linkBehavior() === "selection") {
        const el = ref();
        if (el instanceof HTMLAnchorElement) {
          openLink(el, e as unknown as Event);
        }
        // Restore the prior selection so select/combobox close cleanly.
        const sel = manager.selectedKeys();
        if (sel !== "all") {
          manager.setSelectedKeys(sel);
        }
        return;
      } else if (linkBehavior() === "override" || linkBehavior() === "none") {
        return;
      }
    }

    selectItem(manager, k, e, collection());
  };

  const performAction = (e: PressEvent | MouseEvent) => {
    const o = getOptions();
    if (o.onAction) {
      o.onAction(e);
      ref()?.dispatchEvent(new CustomEvent(ITEM_ACTION_EVENT, { bubbles: true }));
    }

    if (hasLinkAction()) {
      const el = ref();
      if (el instanceof HTMLAnchorElement) {
        openLink(el, e as unknown as Event);
      }
    }
  };

  // Focus the associated DOM node when this item becomes the focused key. This
  // is the imperative half of roving tabindex — the tabIndex 0/-1 swap below is
  // only declarative.
  createEffect(() => {
    if (key() !== manager.focusedKey() || !manager.isFocused()) {
      return;
    }

    const o = getOptions();
    if (!shouldUseVirtualFocus()) {
      if (o.focus) {
        o.focus();
      } else {
        const el = ref();
        if (el && getOwnerDocument(el).activeElement !== el) {
          focusSafely(el);
        }
      }
    }
    // Virtual focus: no moveVirtualFocus equivalent in our port (documented gap).
  });

  const { pressProps, isPressed } = createPress({
    get isDisabled() {
      // Press is only wired when the item is interactive (see the merge below),
      // but guard here too so disabled items never fire press handlers.
      return !(
        allowsSelection() ||
        hasPrimaryAction() ||
        (shouldUseVirtualFocus() && !isDisabled())
      );
    },
    get preventFocusOnPress() {
      return shouldUseVirtualFocus();
    },
    onPressStart(e) {
      modality = e.pointerType;
      longPressEnabledOnPressStart = longPressEnabled();

      if (shouldSelectOnPressUp()) {
        // Selection still happens on key down for the keyboard.
        if (e.pointerType === "keyboard" && (!hasAction() || isSelectionKey(e.key))) {
          onSelect(e);
        }
      } else {
        hadPrimaryActionOnPressStart = hasPrimaryAction();
        // Select on mouse down unless a primary action will occur on mouse up.
        // For keyboard, select on key down; with an action, Space selects on key
        // down and Enter performs the action on key up.
        if (
          allowsSelection() &&
          ((e.pointerType === "mouse" && !hasPrimaryAction()) ||
            (e.pointerType === "keyboard" && (!allowsActions() || isSelectionKey(e.key))))
        ) {
          onSelect(e);
        }
      }

      // When using virtual focus, update the focused key on (non-touch) press.
      if (shouldUseVirtualFocus() && e.pointerType !== "touch") {
        manager.setFocused(true);
        manager.setFocusedKey(key());
      }
    },
    onPressUp(e) {
      // Only relevant for press-up selection with a different press origin and
      // no primary action: select on the mouse up itself.
      if (
        shouldSelectOnPressUp() &&
        allowsDifferentPressOrigin() &&
        !hasPrimaryAction() &&
        e.pointerType === "mouse" &&
        allowsSelection()
      ) {
        onSelect(e);
      }
    },
    onPress(e) {
      if (shouldSelectOnPressUp()) {
        if (!allowsDifferentPressOrigin()) {
          if (hasPrimaryAction() || (hasSecondaryAction() && e.pointerType !== "mouse")) {
            if (e.pointerType === "keyboard" && !isActionKey(e.key)) {
              return;
            }
            performAction(e);
          } else if (e.pointerType !== "keyboard" && allowsSelection()) {
            onSelect(e);
          }
        } else if (hasPrimaryAction()) {
          performAction(e);
        } else if (e.pointerType !== "keyboard" && e.pointerType !== "mouse" && allowsSelection()) {
          onSelect(e);
        }
      } else if (
        // Selection on touch up; primary actions on pointer up. Both primary and
        // secondary actions on Enter key up. Secondary mouse actions go through
        // double click (below), not here.
        e.pointerType === "touch" ||
        e.pointerType === "pen" ||
        e.pointerType === "virtual" ||
        (e.pointerType === "keyboard" && hasAction() && isActionKey(e.key)) ||
        (e.pointerType === "mouse" && hadPrimaryActionOnPressStart)
      ) {
        if (hasAction()) {
          performAction(e);
        } else if (allowsSelection()) {
          onSelect(e);
        }
      }

      // When using virtual focus, update the focused key on a touch press.
      if (shouldUseVirtualFocus() && e.pointerType === "touch") {
        manager.setFocused(true);
        manager.setFocusedKey(key());
      }
    },
  });

  // Long pressing an item with touch when selectionBehavior = 'replace' switches
  // to 'toggle': single tap now selects (and toggles checkbox affordances)
  // instead of performing the action.
  const { longPressProps } = createLongPress({
    get isDisabled() {
      return !longPressEnabled();
    },
    onLongPress(e) {
      if (e.pointerType === "touch") {
        onSelect(e as unknown as PressEvent);
        manager.setSelectionBehavior("toggle");
      }
    },
  });

  // Double clicking with a mouse with selectionBehavior = 'replace' performs the
  // secondary action.
  const onDblClick = (e: MouseEvent) => {
    if (!hasSecondaryAction()) return;
    if (modality === "mouse") {
      e.stopPropagation();
      e.preventDefault();
      performAction(e as unknown as PressEvent);
    }
  };

  // Prevent native drag and drop on long press when we also select on long
  // press. Upstream uses a capturing listener to beat useDrag; we use bubble
  // until drag-and-drop integration lands (documented adaptation).
  const onDragStart = (e: DragEvent) => {
    if (modality === "touch" && longPressEnabledOnPressStart) {
      e.preventDefault();
    }
  };

  // Prevent native link clicks so we control exactly when they open (matching
  // selection behavior).
  const onClick = (e: MouseEvent) => {
    if (linkBehavior() !== "none" && isLink()) {
      if (!(openLink as { isOpening?: boolean }).isOpening) {
        e.preventDefault();
      }
    }
  };

  return {
    get itemProps(): JSX.HTMLAttributes<HTMLElement> {
      const k = key();
      const disabled = isDisabled();

      const baseProps: Record<string, unknown> = {
        "data-key": String(k),
        // Scopes this item to its collection for getItemElement. Resolves to a
        // value only once a createSelectableCollection container has registered
        // the manager; otherwise undefined (Solid omits the attribute).
        "data-collection": getCollectionId(manager.selectionManager ?? manager),
      };

      // Roving tabindex: only the focused item is tabbable. With virtual focus,
      // omit tabIndex entirely (so iOS VoiceOver doesn't pull real focus).
      if (!shouldUseVirtualFocus() && !disabled) {
        baseProps.tabIndex = k === manager.focusedKey() ? 0 : -1;
        baseProps.onFocus = (e: FocusEvent) => {
          if (getEventTarget(e) === ref()) {
            manager.setFocusedKey(k);
          }
        };
      } else if (disabled) {
        // Prevent focus going to the body when clicking a disabled item.
        baseProps.onMouseDown = (e: MouseEvent) => e.preventDefault();
      }

      const interactive =
        allowsSelection() || hasPrimaryAction() || (shouldUseVirtualFocus() && !disabled);

      return mergeProps(
        baseProps,
        interactive ? (pressProps as Record<string, unknown>) : {},
        longPressEnabled() ? (longPressProps as Record<string, unknown>) : {},
        { onDblClick, onDragStart, onClick, id: id() },
        // Prevent DOM focus from moving on mouse down when using virtual focus.
        shouldUseVirtualFocus() ? { onMouseDown: (e: MouseEvent) => e.preventDefault() } : {},
      ) as JSX.HTMLAttributes<HTMLElement>;
    },
    isPressed,
    isSelected,
    isFocused,
    isDisabled,
    allowsSelection,
    hasAction,
  };
}
