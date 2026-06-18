/**
 * Menu component for solidaria-components
 *
 * A pre-wired headless menu that combines state + aria hooks.
 * Port of react-aria-components/src/Menu.tsx
 */

import {
  type JSX,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  onCleanup,
  splitProps,
  useContext,
  For,
  Show,
} from "solid-js";
import {
  createMenu,
  createMenuItem,
  createMenuTrigger,
  createFocusRing,
  createHover,
  createButton,
  createInteractOutside,
  createScrollIntoViewOnFocus,
  mergeProps,
  FocusScope,
  type AriaMenuProps,
  type AriaMenuItemProps,
  type AriaMenuTriggerProps,
} from "@proyecto-viviana/solidaria";
import {
  createSelectionState,
  createMenuState,
  createMenuTriggerState,
  type MenuState,
  type MenuStateProps,
  type OverlayTriggerState,
  type Key,
  type DropTarget,
  type SelectionMode,
  type SelectionStateProps,
} from "@proyecto-viviana/solid-stately";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  filterDOMProps,
} from "./utils";
import { SharedElementTransition } from "./SharedElementTransition";
import { type DragAndDropHooks } from "./useDragAndDrop";
import {
  CollectionRendererContext,
  Section,
  Header,
  Group,
  type CollectionEntry,
  type CollectionRendererContextValue,
  type SectionProps,
  useCollectionRenderer,
  flattenCollectionEntries,
  isCollectionSection,
} from "./Collection";
import { useVirtualizerContext } from "./Virtualizer";
import {
  getNormalizedDropTargetKey,
  mergePersistedKeysIntoVirtualRange,
  useDndPersistedKeys,
  useRenderDropIndicator,
} from "./DragAndDrop";
import { PopoverTriggerContext } from "./contexts";

export interface MenuRenderProps {
  /** Whether the menu is focused. */
  isFocused: boolean;
  /** Whether the menu is open. */
  isOpen: boolean;
  /** Whether the menu has no items. */
  isEmpty: boolean;
}

export interface MenuProps<T>
  extends
    Omit<AriaMenuProps, "children">,
    SlotProps,
    Pick<
      MenuStateProps<T>,
      | "selectionMode"
      | "selectionBehavior"
      | "disallowEmptySelection"
      | "selectedKeys"
      | "defaultSelectedKeys"
      | "onSelectionChange"
      | "allowDuplicateSelectionEvents"
    > {
  /** The items to render in the menu. */
  items?: CollectionEntry<T>[];
  /** Function to get the key from an item. */
  getKey?: (item: T) => Key;
  /** Function to get the text value from an item. */
  getTextValue?: (item: T) => string;
  /** Function to check if an item is disabled. */
  getDisabled?: (item: T) => boolean;
  /** Keys of disabled items. */
  disabledKeys?: Iterable<Key>;
  /** Handler called when an item is activated. */
  onAction?: (key: Key) => void;
  /** Handler called when the menu should close. */
  onClose?: () => void;
  /** The children of the component. A function may be provided to render each item. */
  children?: JSX.Element | ((item: T) => JSX.Element);
  /** Internal lazy static children accessor used when collection children need menu context. */
  staticChildren?: () => JSX.Element | undefined;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<MenuRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<MenuRenderProps>;
  /** Content to display when the menu has no items. */
  renderEmptyState?: () => JSX.Element;
  /** Whether the menu should close when an item is selected. */
  shouldCloseOnSelect?: boolean;
  /** Ref for the menu element. */
  ref?: RefLike<HTMLUListElement>;
  /** Custom renderer for the menu element. */
  render?: (
    props: JSX.HTMLAttributes<HTMLUListElement>,
    renderProps: MenuRenderProps,
  ) => JSX.Element;
  /** Drag and drop hooks from `useDragAndDrop`. */
  dragAndDropHooks?: DragAndDropHooks<T>;
}

export interface MenuItemRenderProps {
  /** Whether the item is selected. */
  isSelected: boolean;
  /** The parent menu selection mode. */
  selectionMode: SelectionMode;
  /** Whether the item is focused. */
  isFocused: boolean;
  /** Whether the item has keyboard focus. */
  isFocusVisible: boolean;
  /** Whether the item is pressed. */
  isPressed: boolean;
  /** Whether the item is hovered. */
  isHovered: boolean;
  /** Whether the item is disabled. */
  isDisabled: boolean;
  /** Whether the item opens a submenu. */
  hasSubmenu: boolean;
  /** Whether the submenu is currently open. */
  isOpen: boolean;
}

export interface MenuItemProps<T> extends Omit<AriaMenuItemProps, "children" | "key">, SlotProps {
  /** The unique key for the item. */
  id: Key;
  /** The item value. */
  item?: T;
  /** The children of the item. A function may be provided to receive render props. */
  children?: RenderChildren<MenuItemRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<MenuItemRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<MenuItemRenderProps>;
  /** The text value of the item (for typeahead). */
  textValue?: string;
  /** Handler called when the item is activated. */
  onAction?: () => void;
  /** A URL to link to. Turns the menu item into a link. */
  href?: string;
  /** The target window for the link. */
  target?: string;
  /** The relationship between the linked resource and the current page. */
  rel?: string;
  /** Causes the browser to download the linked URL. */
  download?: boolean | string;
  /** Handler called when hover starts. */
  onHoverStart?: () => void;
  /** Handler called when hover ends. */
  onHoverEnd?: () => void;
  /** Handler called when hover state changes. */
  onHoverChange?: (isHovered: boolean) => void;
  /** Ref for the menu item element. */
  ref?: RefLike<HTMLLIElement>;
  /** Custom renderer for the menu item element. */
  render?: (
    props: JSX.HTMLAttributes<HTMLLIElement>,
    renderProps: MenuItemRenderProps,
  ) => JSX.Element;
}

export interface MenuTriggerRenderProps {
  /** Whether the menu is open. */
  isOpen: boolean;
  /** Whether the trigger is focused. */
  isFocused: boolean;
  /** Whether the trigger has keyboard focus. */
  isFocusVisible: boolean;
  /** Whether the trigger is pressed. */
  isPressed: boolean;
  /** Whether the trigger is hovered. */
  isHovered: boolean;
  /** Whether the trigger is disabled. */
  isDisabled: boolean;
}

export interface MenuTriggerProps extends Omit<AriaMenuTriggerProps, "children">, SlotProps {
  /** The children of the trigger (typically a Button and Menu). */
  children: JSX.Element;
  /** Whether the menu trigger is disabled. */
  isDisabled?: boolean;
  /** Whether the menu is open by default. */
  defaultOpen?: boolean;
  /** Whether the menu is open (controlled). */
  isOpen?: boolean;
  /** Handler called when the open state changes. */
  onOpenChange?: (isOpen: boolean) => void;
}

export interface SubmenuTriggerProps extends SlotProps {
  /** The trigger item followed by submenu content. */
  children: JSX.Element;
  /** Delay before opening the submenu on hover. */
  delay?: number;
  /** Whether the submenu is open (controlled). */
  isOpen?: boolean;
  /** Whether the submenu is open by default. */
  defaultOpen?: boolean;
  /** Handler called when the submenu open state changes. */
  onOpenChange?: (isOpen: boolean) => void;
}

interface MenuContextValue<T> {
  state: MenuState<T>;
  isDisabled: () => boolean;
  dragAndDropHooks?: DragAndDropHooks<T>;
  dragState?: unknown;
  dropState?: unknown;
}

type MenuSelectionEvent = { shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean };

interface MenuTriggerContextValue {
  state: OverlayTriggerState;
  triggerProps: JSX.HTMLAttributes<HTMLElement>;
  menuProps: JSX.HTMLAttributes<HTMLElement>;
  isPressed?: () => boolean;
  onPressStart?: (e: { pointerType?: string }) => void;
}

interface MenuItemContextValue {
  props?: () => JSX.HTMLAttributes<HTMLElement>;
  closeOnSelect?: boolean;
  onAction?: () => void;
  setItemRef?: (el: HTMLLIElement | null) => void;
}

interface StaticMenuCollectionItem {
  id: Key;
  textValue?: string;
  isDisabled?: boolean;
}

interface StaticMenuCollectionContextValue {
  registerItem(item: StaticMenuCollectionItem): void;
  unregisterItem(id: Key): void;
}

interface MenuSectionSelectionContextValue {
  selectionMode: () => SelectionMode;
  isSelected(key: Key): boolean;
  isDisabled(key: Key): boolean;
  select(key: Key, event?: MenuSelectionEvent): void;
  shouldCloseOnSelect(): boolean | undefined;
}

interface MenuSectionSelectionRegistryContextValue {
  registerItem(key: Key, selection: MenuSectionSelectionContextValue): void;
  unregisterItem(key: Key, selection: MenuSectionSelectionContextValue): void;
  selectItem(key: Key, event?: MenuSelectionEvent): boolean;
}

interface MenuItemCloseRegistryContextValue {
  registerItem(key: Key, shouldCloseOnSelect: () => boolean | undefined): void;
  unregisterItem(key: Key, shouldCloseOnSelect: () => boolean | undefined): void;
  shouldCloseOnSelect(key: Key | null): boolean | undefined;
}

export const MenuContext = createContext<MenuContextValue<unknown> | null>(null);
export const MenuStateContext = createContext<MenuState<unknown> | null>(null);
export const MenuTriggerContext = createContext<MenuTriggerContextValue | null>(null);
export const RootMenuTriggerStateContext = createContext<OverlayTriggerState | null>(null);
const MenuItemContext = createContext<MenuItemContextValue | null>(null);
const StaticMenuCollectionContext = createContext<StaticMenuCollectionContextValue | null>(null);
const MenuSectionSelectionContext = createContext<MenuSectionSelectionContextValue | null>(null);
const MenuSectionSelectionRegistryContext =
  createContext<MenuSectionSelectionRegistryContextValue | null>(null);
const MenuItemCloseRegistryContext = createContext<MenuItemCloseRegistryContextValue | null>(null);

type RefLike<T> = ((el: T) => void) | { current?: T | null } | undefined;

function assignRef<T>(ref: RefLike<T>, el: T): void {
  if (!ref) return;
  if (typeof ref === "function") ref(el);
  else ref.current = el;
}

function resolveBoolean(value: unknown): boolean {
  return typeof value === "function" ? Boolean((value as () => unknown)()) : Boolean(value);
}

/**
 * A menu trigger wraps a button and menu, handling the open/close state.
 */
export function MenuTrigger(props: MenuTriggerProps): JSX.Element {
  const [local, stateProps] = splitProps(props, ["slot"]);

  const state = createMenuTriggerState({
    get isOpen() {
      return stateProps.isOpen;
    },
    get defaultOpen() {
      return stateProps.defaultOpen;
    },
    get onOpenChange() {
      return stateProps.onOpenChange;
    },
  });

  const [isMousePressed, setMousePressed] = createSignal(false);
  const onPressStart = (e: { pointerType?: string }) => {
    if (e.pointerType !== "mouse" || typeof document === "undefined") {
      return;
    }

    setMousePressed(true);
    document.addEventListener(
      "pointerup",
      () => {
        setMousePressed(false);
      },
      { once: true, capture: true },
    );
  };

  const menuTrigger = createMenuTrigger(
    {
      get isDisabled() {
        return stateProps.isDisabled;
      },
    },
    state,
  );

  return (
    <RootMenuTriggerStateContext.Provider value={state}>
      <MenuTriggerContext.Provider
        value={{
          state,
          get triggerProps() {
            return menuTrigger.menuTriggerProps;
          },
          get menuProps() {
            return menuTrigger.menuProps;
          },
          isPressed: isMousePressed,
          onPressStart,
        }}
      >
        {props.children}
      </MenuTriggerContext.Provider>
    </RootMenuTriggerStateContext.Provider>
  );
}

export function SubmenuTrigger(props: SubmenuTriggerProps): JSX.Element {
  const children = () =>
    (Array.isArray(props.children) ? props.children : [props.children]) as JSX.Element[];
  const trigger = () => children()[0];
  const content = () => children()[1];
  const parentMenuItemContext = useContext(MenuItemContext);
  const state = createMenuTriggerState({
    get isOpen() {
      return props.isOpen;
    },
    get defaultOpen() {
      return props.defaultOpen;
    },
    get onOpenChange() {
      return props.onOpenChange;
    },
  });

  let triggerRef: HTMLLIElement | null = null;
  const triggerId = createUniqueId();
  const menuId = createUniqueId();
  let hoverTimeout: number | undefined;
  let hasPointerHover = false;
  const delay = () => props.delay ?? 200;

  const clearHoverTimeout = () => {
    if (hoverTimeout != null) {
      window.clearTimeout(hoverTimeout);
      hoverTimeout = undefined;
    }
  };

  const openSubmenu = () => {
    clearHoverTimeout();
    state.open();
  };

  const queueOpenSubmenu = () => {
    clearHoverTimeout();
    const open = () => state.open();
    if (typeof queueMicrotask === "function") {
      queueMicrotask(open);
    } else {
      Promise.resolve().then(open);
    }
  };

  const scheduleOpen = () => {
    clearHoverTimeout();
    hoverTimeout = window.setTimeout(() => {
      hoverTimeout = undefined;
      state.open();
    }, delay());
  };

  const schedulePointerOpen = (event: PointerEvent) => {
    hasPointerHover = true;
    if (event.isTrusted === false) {
      queueOpenSubmenu();
      return;
    }

    scheduleOpen();
  };

  const openFromMouseHover = () => {
    if (state.isOpen()) {
      return;
    }

    if (hasPointerHover) {
      scheduleOpen();
    } else {
      queueOpenSubmenu();
    }
  };

  onCleanup(clearHoverTimeout);

  const menuTriggerContext = createMemo<MenuTriggerContextValue>(() => ({
    state,
    triggerProps: {},
    menuProps: {
      id: menuId,
      "aria-labelledby": triggerId,
    },
  }));

  const popoverTriggerContext = createMemo(() => ({
    state: {
      isOpen: () => state.isOpen(),
      open: () => state.open(),
      close: () => state.close(),
      toggle: () => state.toggle(),
    },
    triggerRef: () => triggerRef,
    setTriggerRef: (el: HTMLElement | null) => {
      triggerRef = el as HTMLLIElement | null;
    },
    triggerId,
    trigger: "SubmenuTrigger",
  }));

  const itemContext = createMemo<MenuItemContextValue>(() => ({
    closeOnSelect: false,
    onAction: () => openSubmenu(),
    setItemRef: (el) => {
      triggerRef = el;
    },
    props: () => ({
      id: triggerId,
      "aria-haspopup": "menu",
      get "aria-expanded"() {
        return state.isOpen() || undefined;
      },
      get "aria-controls"() {
        return state.isOpen() ? menuId : undefined;
      },
      onPointerEnter: (event: PointerEvent) => {
        if (event.pointerType === "touch") return;
        schedulePointerOpen(event);
      },
      onPointerOver: (event: PointerEvent) => {
        if (event.pointerType === "touch") return;
        schedulePointerOpen(event);
      },
      onMouseEnter: openFromMouseHover,
      onMouseOver: openFromMouseHover,
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === "ArrowRight" || event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openSubmenu();
        } else if (event.key === "ArrowLeft" && state.isOpen()) {
          event.preventDefault();
          state.close();
        }
      },
    }),
  }));

  return (
    <PopoverTriggerContext.Provider value={popoverTriggerContext()}>
      <MenuTriggerContext.Provider value={menuTriggerContext()}>
        <MenuItemContext.Provider value={{ ...parentMenuItemContext, ...itemContext() }}>
          {trigger()}
        </MenuItemContext.Provider>
        {content()}
      </MenuTriggerContext.Provider>
    </PopoverTriggerContext.Provider>
  );
}

/**
 * A button that opens a menu.
 */
export interface MenuButtonProps
  extends SlotProps, Omit<JSX.HTMLAttributes<HTMLButtonElement>, "class" | "style" | "children"> {
  /** The children of the button. A function may be provided to receive render props. */
  children?: RenderChildren<MenuTriggerRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<MenuTriggerRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<MenuTriggerRenderProps>;
  /** Whether the button is disabled. */
  isDisabled?: boolean;
}

export interface MenuSectionProps
  extends
    SectionProps,
    Pick<
      SelectionStateProps,
      | "selectionMode"
      | "selectionBehavior"
      | "disallowEmptySelection"
      | "selectedKeys"
      | "defaultSelectedKeys"
      | "onSelectionChange"
      | "disabledKeys"
      | "disabledBehavior"
      | "allowDuplicateSelectionEvents"
    > {
  /** Whether menu items in this section should close the menu when selected. */
  shouldCloseOnSelect?: boolean;
}

export function MenuButton(props: MenuButtonProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["class", "style", "slot", "isDisabled", "children"]);

  const context = useContext(MenuTriggerContext);
  if (!context) {
    throw new Error("MenuButton must be used within a MenuTrigger");
  }
  const { state } = context;

  const buttonAria = createButton({
    get isDisabled() {
      return local.isDisabled;
    },
    onPressStart(e) {
      context.onPressStart?.(e);
    },
    onPress() {
      state.toggle();
    },
  });

  const { isFocused, isFocusVisible, focusProps } = createFocusRing();

  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return local.isDisabled;
    },
  });

  const renderValues = createMemo<MenuTriggerRenderProps>(() => ({
    isOpen: state.isOpen(),
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible(),
    isPressed: context.isPressed?.() || buttonAria.isPressed(),
    isHovered: isHovered(),
    isDisabled: !!local.isDisabled,
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-MenuButton",
    },
    renderValues,
  );

  const resolvedTriggerProps = () => context.triggerProps as Record<string, unknown>;
  const cleanTriggerProps = () => {
    const {
      ref: _ref1,
      "aria-haspopup": _ariaHasPopup,
      "aria-expanded": _ariaExpanded,
      "aria-controls": _ariaControls,
      "aria-disabled": _ariaDisabled,
      ...rest
    } = resolvedTriggerProps();
    return rest;
  };
  const cleanButtonProps = () => {
    const { ref: _ref2, ...rest } = buttonAria.buttonProps as Record<string, unknown>;
    return rest;
  };
  const cleanFocusProps = () => {
    const { ref: _ref3, ...rest } = focusProps as Record<string, unknown>;
    return rest;
  };
  const cleanHoverProps = () => {
    const { ref: _ref4, ...rest } = hoverProps as Record<string, unknown>;
    return rest;
  };

  return (
    <button
      {...domProps}
      {...cleanTriggerProps()}
      {...cleanButtonProps()}
      {...cleanFocusProps()}
      {...cleanHoverProps()}
      type="button"
      class={renderProps.class()}
      style={renderProps.style()}
      aria-haspopup={resolvedTriggerProps()["aria-haspopup"] as "menu" | "listbox" | undefined}
      aria-expanded={resolvedTriggerProps()["aria-expanded"] as boolean | undefined}
      aria-controls={resolvedTriggerProps()["aria-controls"] as string | undefined}
      aria-disabled={resolvedTriggerProps()["aria-disabled"] as boolean | undefined}
      data-open={state.isOpen() || undefined}
      data-focused={isFocused() || undefined}
      data-focus-visible={isFocusVisible() || undefined}
      data-pressed={context.isPressed?.() || buttonAria.isPressed() || undefined}
      data-hovered={isHovered() || undefined}
      data-disabled={local.isDisabled || undefined}
    >
      {renderProps.renderChildren()}
    </button>
  );
}

/**
 * A menu displays a list of actions or options for the user to choose from.
 */
export function Menu<T>(props: MenuProps<T>): JSX.Element {
  const [local, stateProps, ariaProps] = splitProps(
    props,
    ["children", "class", "style", "render", "slot", "renderEmptyState", "ref", "staticChildren"],
    [
      "items",
      "getKey",
      "getTextValue",
      "getDisabled",
      "disabledKeys",
      "selectionMode",
      "selectionBehavior",
      "disallowEmptySelection",
      "selectedKeys",
      "defaultSelectedKeys",
      "onSelectionChange",
      "allowDuplicateSelectionEvents",
      "onAction",
      "onClose",
      "shouldCloseOnSelect",
      "dragAndDropHooks",
    ],
  );

  const triggerContext = useContext(MenuTriggerContext);

  const [menuRef, setMenuRef] = createSignal<HTMLUListElement | null>(null);
  const [staticItems, setStaticItems] = createSignal<StaticMenuCollectionItem[]>([]);
  const staticItemMap = new Map<Key, StaticMenuCollectionItem>();
  const sectionSelectionMap = new Map<Key, MenuSectionSelectionContextValue>();
  const itemCloseMap = new Map<Key, () => boolean | undefined>();
  const usesStaticChildren = () => local.staticChildren != null || stateProps.items == null;

  const syncStaticItems = () => {
    setStaticItems(Array.from(staticItemMap.values()));
  };

  const staticCollectionContext: StaticMenuCollectionContextValue = {
    registerItem(item) {
      const previous = staticItemMap.get(item.id);
      if (
        previous &&
        previous.textValue === item.textValue &&
        previous.isDisabled === item.isDisabled
      ) {
        return;
      }

      staticItemMap.set(item.id, item);
      syncStaticItems();
    },
    unregisterItem(id) {
      if (staticItemMap.delete(id)) {
        syncStaticItems();
      }
    },
  };
  const sectionSelectionRegistry: MenuSectionSelectionRegistryContextValue = {
    registerItem(key, selection) {
      sectionSelectionMap.set(key, selection);
    },
    unregisterItem(key, selection) {
      if (sectionSelectionMap.get(key) === selection) {
        sectionSelectionMap.delete(key);
      }
    },
    selectItem(key, event) {
      const selection = sectionSelectionMap.get(key);
      if (!selection || selection.selectionMode() === "none") {
        return false;
      }

      selection.select(key, event);
      return true;
    },
  };
  const itemCloseRegistry: MenuItemCloseRegistryContextValue = {
    registerItem(key, shouldCloseOnSelect) {
      itemCloseMap.set(key, shouldCloseOnSelect);
    },
    unregisterItem(key, shouldCloseOnSelect) {
      if (itemCloseMap.get(key) === shouldCloseOnSelect) {
        itemCloseMap.delete(key);
      }
    },
    shouldCloseOnSelect(key) {
      return key == null ? undefined : itemCloseMap.get(key)?.();
    },
  };
  const handleAction = (key: Key) => {
    sectionSelectionRegistry.selectItem(key);
    stateProps.onAction?.(key);
  };

  const flatItems = createMemo<T[]>(() => {
    return flattenCollectionEntries(stateProps.items ?? []);
  });

  const hasSections = createMemo(() =>
    (stateProps.items ?? []).some((item) => isCollectionSection(item)),
  );

  const state = createMenuState<T>({
    get items() {
      return usesStaticChildren() ? (staticItems() as T[]) : flatItems();
    },
    get getKey() {
      return usesStaticChildren()
        ? (item: T) => (item as StaticMenuCollectionItem).id
        : stateProps.getKey;
    },
    get getTextValue() {
      return usesStaticChildren()
        ? (item: T) =>
            (item as StaticMenuCollectionItem).textValue ??
            String((item as StaticMenuCollectionItem).id)
        : stateProps.getTextValue;
    },
    get getDisabled() {
      return usesStaticChildren()
        ? (item: T) => Boolean((item as StaticMenuCollectionItem).isDisabled)
        : stateProps.getDisabled;
    },
    get disabledKeys() {
      return stateProps.disabledKeys;
    },
    get selectionMode() {
      return stateProps.selectionMode;
    },
    get selectionBehavior() {
      return stateProps.selectionBehavior;
    },
    get disallowEmptySelection() {
      return stateProps.disallowEmptySelection;
    },
    get selectedKeys() {
      return stateProps.selectedKeys;
    },
    get defaultSelectedKeys() {
      return stateProps.defaultSelectedKeys;
    },
    get onSelectionChange() {
      return stateProps.onSelectionChange;
    },
    get allowDuplicateSelectionEvents() {
      return stateProps.allowDuplicateSelectionEvents;
    },
    get onAction() {
      return handleAction;
    },
    get onClose() {
      return stateProps.onClose ?? (() => triggerContext?.state.close());
    },
  });

  const resolveDisabled = (): boolean => {
    const disabled = ariaProps.isDisabled;
    if (typeof disabled === "function") {
      return (disabled as () => boolean)();
    }
    return !!disabled;
  };

  const { menuProps, labelProps } = createMenu(
    {
      get isDisabled() {
        return resolveDisabled();
      },
      get label() {
        return ariaProps.label;
      },
      get onAction() {
        return handleAction;
      },
      get onClose() {
        return stateProps.onClose ?? (() => triggerContext?.state.close());
      },
      get shouldCloseOnSelect() {
        return (
          itemCloseRegistry.shouldCloseOnSelect(state.focusedKey()) ??
          stateProps.shouldCloseOnSelect
        );
      },
      get "aria-label"() {
        return ariaProps["aria-label"];
      },
      get "aria-labelledby"() {
        return ariaProps["aria-labelledby"];
      },
      get "aria-describedby"() {
        return ariaProps["aria-describedby"];
      },
    },
    state,
  );

  // Reveal the activedescendant-focused item on keyboard navigation. The menu
  // keeps real DOM focus on itself, so the browser won't natively scroll an
  // off-screen focused item into view the way roving tabindex would.
  createScrollIntoViewOnFocus({
    focusedKey: () => state.focusedKey(),
    isActive: () => state.isFocused(),
    ref: () => menuRef(),
  });

  const { isFocused, focusProps } = createFocusRing();

  createInteractOutside({
    ref: () => menuRef(),
    onInteractOutside: () => {
      if (triggerContext?.state.isOpen()) {
        triggerContext.state.close();
      }
    },
    get isDisabled() {
      return !triggerContext?.state.isOpen();
    },
  });

  const renderValues = createMemo<MenuRenderProps>(() => ({
    isFocused: state.isFocused() || isFocused(),
    isOpen: triggerContext?.state.isOpen() ?? true,
    isEmpty: state.collection().size === 0,
  }));

  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Menu",
    },
    renderValues,
  );

  const cleanMenuProps = () => {
    const { ref: _ref1, ...rest } = menuProps as Record<string, unknown>;
    return rest;
  };
  const cleanTriggerMenuProps = () => {
    if (!triggerContext) return {};
    const { ref: _ref2, ...rest } = triggerContext.menuProps as Record<string, unknown>;
    return rest;
  };
  const cleanFocusProps = () => {
    const { ref: _ref3, ...rest } = focusProps as Record<string, unknown>;
    return rest;
  };
  const domProps = createMemo(() =>
    filterDOMProps(ariaProps as Record<string, unknown>, { global: true }),
  );
  const cleanLabelProps = () => {
    const { ref: _ref4, ...rest } = labelProps as Record<string, unknown>;
    return rest;
  };
  const setResolvedMenuRef = (el: HTMLUListElement): void => {
    setMenuRef(el);
    assignRef(local.ref, el);
  };

  // If inside a MenuTrigger, only render when open
  // If standalone (no trigger context), always render
  const shouldRender = () => (triggerContext ? triggerContext.state.isOpen() : true);
  const parentCollectionRenderer = useCollectionRenderer<unknown>();
  const virtualizer = useVirtualizerContext();
  const getItemNodes = createMemo(() =>
    Array.from(state.collection()).filter((node) => node.type === "item"),
  );
  const getDropTargetByIndex = (
    index: number,
    position: "before" | "after" | "on",
  ): DropTarget | null => {
    const node = getItemNodes()[index];
    if (!node) return null;
    return { type: "item", key: node.key, dropPosition: position };
  };
  const hasDroppableDnd = createMemo(() => {
    const hooks = stateProps.dragAndDropHooks;
    return Boolean(
      hooks?.useDroppableCollectionState &&
      hooks.useDroppableCollection &&
      (hooks.dropTargetDelegate ||
        parentCollectionRenderer?.dropTargetDelegate ||
        hooks.ListDropTargetDelegate),
    );
  });
  const hasDraggableDnd = createMemo(() => {
    const hooks = stateProps.dragAndDropHooks;
    return Boolean(hooks?.useDraggableCollectionState && hooks.useDraggableCollection);
  });
  const dragState = createMemo(() => {
    if (!hasDraggableDnd()) return undefined;
    return stateProps.dragAndDropHooks?.useDraggableCollectionState?.({
      items: flatItems(),
    });
  });
  const dropState = createMemo(() => {
    if (!hasDroppableDnd()) return undefined;
    return stateProps.dragAndDropHooks?.useDroppableCollectionState?.({});
  });
  const persistedKeys = useDndPersistedKeys(
    { focusedKey: state.focusedKey },
    stateProps.dragAndDropHooks,
    dropState(),
    state.collection(),
  );
  const virtualRange = createMemo(() => {
    if (!virtualizer || !parentCollectionRenderer?.isVirtualized || hasSections()) return null;
    const dynamicItems = stateProps.items ?? [];
    const baseRange = virtualizer.getVisibleRange(dynamicItems.length);
    const itemNodes = getItemNodes();
    const persistedIndexes = Array.from(persistedKeys())
      .map((key) => itemNodes.findIndex((node) => node.key === key))
      .filter((index) => index >= 0);
    const dropTarget = dropState()?.target;
    const normalizedDropKey = getNormalizedDropTargetKey(dropTarget, state.collection());
    const focusedKey = state.focusedKey();
    const focusedIndex =
      focusedKey != null ? itemNodes.findIndex((node) => node.key === focusedKey) : -1;
    const forceIncludeIndexes = [
      dropTarget?.type === "item" ? itemNodes.findIndex((node) => node.key === dropTarget.key) : -1,
      normalizedDropKey != null
        ? itemNodes.findIndex((node) => node.key === normalizedDropKey)
        : -1,
      dropTarget?.type === "item" ? -1 : focusedIndex,
    ].filter((index) => index >= 0);
    return mergePersistedKeysIntoVirtualRange(
      baseRange,
      persistedIndexes,
      dynamicItems.length,
      virtualizer,
      80,
      {
        forceIncludeIndexes,
        forceIncludeMaxSpan: 320,
      },
    );
  });
  const visibleItems = createMemo(() => {
    const range = virtualRange();
    const items = stateProps.items ?? [];
    if (!range) return items;
    return items.slice(range.start, range.end);
  });
  createEffect(() => {
    if (!hasDraggableDnd()) return;
    const hooks = stateProps.dragAndDropHooks;
    const activeDragState = dragState();
    if (!hooks?.useDraggableCollection || !activeDragState) return;
    hooks.useDraggableCollection({}, activeDragState, () => menuRef());
  });
  const droppableCollection = createMemo(() => {
    if (!hasDroppableDnd()) return undefined;
    const hooks = stateProps.dragAndDropHooks;
    const activeDropState = dropState();
    if (!hooks?.useDroppableCollection || !activeDropState) return undefined;
    const resolveDirection = (): "ltr" | "rtl" => {
      const menuEl = menuRef();
      if (
        menuEl &&
        typeof window !== "undefined" &&
        typeof window.getComputedStyle === "function"
      ) {
        const dir = window.getComputedStyle(menuEl).direction;
        if (dir === "rtl") return "rtl";
      }
      return typeof document !== "undefined" && document.dir === "rtl" ? "rtl" : "ltr";
    };
    const dropTargetDelegate =
      hooks.dropTargetDelegate ??
      parentCollectionRenderer?.dropTargetDelegate ??
      (hooks.ListDropTargetDelegate
        ? new hooks.ListDropTargetDelegate(
            () => state.collection(),
            () => menuRef(),
            { layout: "stack", orientation: "vertical", direction: resolveDirection() },
          )
        : undefined);
    if (!dropTargetDelegate) return undefined;
    return hooks.useDroppableCollection(
      {
        dropTargetDelegate,
        keyboardDelegate: {
          getFirstKey: () => state.collection().getFirstKey(),
          getLastKey: () => state.collection().getLastKey(),
          getKeyBelow: (key) => state.collection().getKeyAfter(key),
          getKeyAbove: (key) => state.collection().getKeyBefore(key),
          getKeyPageBelow: (key) => state.collection().getKeyAfter(key),
          getKeyPageAbove: (key) => state.collection().getKeyBefore(key),
        },
      },
      activeDropState,
      () => menuRef(),
    );
  });
  const isRootDropTarget = createMemo(() => {
    return Boolean(dropState()?.target?.type === "root");
  });
  const dndRenderDropIndicator = createMemo(() =>
    useRenderDropIndicator(stateProps.dragAndDropHooks, dropState()),
  );
  const dndDropIndicator = (index: number, position: "before" | "after" | "on") => {
    const target = getDropTargetByIndex(index, position);
    if (!target || target.type !== "item") return undefined;
    return dndRenderDropIndicator()?.(target);
  };
  const sectionedRenderEntries = createMemo(() => {
    let globalIndex = 0;
    return (stateProps.items ?? []).map((entry) => {
      if (isCollectionSection(entry)) {
        const sectionItems = entry.items.map((item) => ({
          item,
          index: globalIndex++,
        }));
        return {
          type: "section" as const,
          section: entry,
          items: sectionItems,
        };
      }
      const indexedItem = {
        item: entry as T,
        index: globalIndex++,
      };
      return {
        type: "item" as const,
        item: indexedItem,
      };
    });
  });
  const renderDynamicItem = (item: T) =>
    typeof local.children === "function" ? local.children(item) : undefined;
  const resolveStaticChild = (child: unknown): JSX.Element | undefined => {
    return typeof child === "function"
      ? (child as () => JSX.Element | undefined)()
      : (child as JSX.Element | undefined);
  };
  const renderStaticChildren = () => {
    const staticChildren = (local.staticChildren?.() ?? local.children) as unknown;
    if (Array.isArray(staticChildren)) {
      return staticChildren.map(resolveStaticChild);
    }
    return resolveStaticChild(staticChildren);
  };
  const collectionRenderer = createMemo<CollectionRendererContextValue<unknown>>(() => ({
    ...parentCollectionRenderer,
    renderItem: (item) => renderDynamicItem(item as T),
    renderDropIndicator: (index, position) =>
      dndDropIndicator(index, position) ??
      parentCollectionRenderer?.renderDropIndicator?.(index, position),
  }));
  const menuItemContextValue = createMemo<MenuItemContextValue>(() =>
    stateProps.shouldCloseOnSelect !== undefined
      ? { closeOnSelect: stateProps.shouldCloseOnSelect }
      : {},
  );
  const menuListChildren = () => (
    <SharedElementTransition>
      {state.collection().size === 0 && !usesStaticChildren() && local.renderEmptyState ? (
        <li role="presentation" data-empty-state>
          <div role="menuitem" style={{ display: "contents" }}>
            {local.renderEmptyState()}
          </div>
        </li>
      ) : usesStaticChildren() ? (
        renderStaticChildren()
      ) : hasSections() ? (
        <For each={sectionedRenderEntries()}>
          {(entry) =>
            entry.type === "section" ? (
              <li role="presentation" data-section-wrapper>
                <Section class="solidaria-Menu-section">
                  {entry.section.title != null && (
                    <Header class="solidaria-Menu-sectionHeader">{entry.section.title}</Header>
                  )}
                  <Group class="solidaria-Menu-sectionGroup">
                    <ul role="group" aria-label={entry.section["aria-label"]}>
                      <For each={entry.items}>
                        {(indexedItem) => (
                          <>
                            {collectionRenderer().renderDropIndicator?.(
                              indexedItem.index,
                              "before",
                            )}
                            {collectionRenderer().renderDropIndicator?.(indexedItem.index, "on")}
                            {renderDynamicItem(indexedItem.item)}
                            {collectionRenderer().renderDropIndicator?.(indexedItem.index, "after")}
                          </>
                        )}
                      </For>
                    </ul>
                  </Group>
                </Section>
              </li>
            ) : (
              <>
                {collectionRenderer().renderDropIndicator?.(entry.item.index, "before")}
                {collectionRenderer().renderDropIndicator?.(entry.item.index, "on")}
                {renderDynamicItem(entry.item.item)}
                {collectionRenderer().renderDropIndicator?.(entry.item.index, "after")}
              </>
            )
          }
        </For>
      ) : (
        <>
          {virtualRange()?.offsetTop ? (
            <li
              role="presentation"
              aria-hidden="true"
              style={{ height: `${virtualRange()!.offsetTop}px` }}
              data-virtualizer-spacer="top"
            />
          ) : null}
          <For each={visibleItems()}>
            {(item, index) => {
              const itemIndex = () => (virtualRange()?.start ?? 0) + index();
              const beforeIndicator = () =>
                collectionRenderer().renderDropIndicator?.(itemIndex(), "before");
              const onIndicator = () =>
                collectionRenderer().renderDropIndicator?.(itemIndex(), "on");
              const afterIndicator = () =>
                collectionRenderer().renderDropIndicator?.(itemIndex(), "after");
              return (
                <>
                  {beforeIndicator()}
                  {onIndicator()}
                  {renderDynamicItem(item as T)}
                  {afterIndicator()}
                </>
              );
            }}
          </For>
          {virtualRange()?.offsetBottom ? (
            <li
              role="presentation"
              aria-hidden="true"
              style={{ height: `${virtualRange()!.offsetBottom}px` }}
              data-virtualizer-spacer="bottom"
            />
          ) : null}
        </>
      )}
    </SharedElementTransition>
  );
  const menuListProps = () =>
    ({
      ref: setResolvedMenuRef,
      ...mergeProps(
        domProps(),
        cleanMenuProps(),
        cleanTriggerMenuProps(),
        cleanFocusProps(),
        (droppableCollection()?.collectionProps as Record<string, unknown> | undefined) ?? {},
      ),
      class: renderProps.class(),
      style: renderProps.style(),
      slot: local.slot,
      "data-focused": state.isFocused() || undefined,
      "data-disabled": resolveDisabled() || undefined,
      "data-empty": state.collection().size === 0 || undefined,
      "data-drop-target": isRootDropTarget() || undefined,
      children: menuListChildren(),
    }) as JSX.HTMLAttributes<HTMLUListElement>;

  // Only use FocusScope when inside a MenuTrigger (for popover behavior)
  // Standalone menus don't need focus restoration
  const menuContent = () => (
    <MenuContext.Provider
      value={
        {
          state,
          isDisabled: resolveDisabled,
          dragAndDropHooks: stateProps.dragAndDropHooks,
          dragState: dragState(),
          dropState: dropState(),
        } as MenuContextValue<unknown>
      }
    >
      <MenuStateContext.Provider value={state}>
        <MenuSectionSelectionRegistryContext.Provider value={sectionSelectionRegistry}>
          <MenuItemCloseRegistryContext.Provider value={itemCloseRegistry}>
            <StaticMenuCollectionContext.Provider
              value={usesStaticChildren() ? staticCollectionContext : null}
            >
              <MenuItemContext.Provider value={menuItemContextValue()}>
                <CollectionRendererContext.Provider value={collectionRenderer()}>
                  <>
                    <Show when={ariaProps.label}>
                      <span {...cleanLabelProps()}>{ariaProps.label as JSX.Element}</span>
                    </Show>
                    {local.render ? (
                      local.render(menuListProps(), renderValues())
                    ) : (
                      <ul
                        ref={setResolvedMenuRef}
                        {...mergeProps(
                          domProps(),
                          cleanMenuProps(),
                          cleanTriggerMenuProps(),
                          cleanFocusProps(),
                          (droppableCollection()?.collectionProps as
                            | Record<string, unknown>
                            | undefined) ?? {},
                        )}
                        class={renderProps.class()}
                        style={renderProps.style()}
                        slot={local.slot}
                        data-focused={state.isFocused() || undefined}
                        data-disabled={resolveDisabled() || undefined}
                        data-empty={state.collection().size === 0 || undefined}
                        data-drop-target={isRootDropTarget() || undefined}
                      >
                        {menuListChildren()}
                      </ul>
                    )}
                  </>
                </CollectionRendererContext.Provider>
              </MenuItemContext.Provider>
            </StaticMenuCollectionContext.Provider>
          </MenuItemCloseRegistryContext.Provider>
        </MenuSectionSelectionRegistryContext.Provider>
      </MenuStateContext.Provider>
    </MenuContext.Provider>
  );

  return (
    <Show when={shouldRender()}>
      <Show when={triggerContext} fallback={menuContent()}>
        <FocusScope restoreFocus autoFocus>
          {menuContent()}
        </FocusScope>
      </Show>
    </Show>
  );
}

/**
 * An item in a menu.
 */
export function MenuItem<T>(props: MenuItemProps<T>): JSX.Element {
  const [local, ariaProps] = splitProps(props, [
    "class",
    "style",
    "render",
    "slot",
    "id",
    "item",
    "textValue",
    "onAction",
    "href",
    "target",
    "rel",
    "download",
    "onHoverStart",
    "onHoverEnd",
    "onHoverChange",
    "ref",
  ]);

  const context = useContext(MenuStateContext);
  if (!context) {
    throw new Error("MenuItem must be used within a Menu");
  }
  const state = context as MenuState<T>;
  const menuContext = useContext(MenuContext) as MenuContextValue<T> | null;
  const itemContext = useContext(MenuItemContext);
  const staticCollection = useContext(StaticMenuCollectionContext);
  const sectionSelection = useContext(MenuSectionSelectionContext);
  const sectionSelectionRegistry = useContext(MenuSectionSelectionRegistryContext);
  const itemCloseRegistry = useContext(MenuItemCloseRegistryContext);
  // Tracks the focusable menuitem element (the <li>, or the inner <a> for link
  // items) so roving focus can be moved onto it imperatively.
  const [ref, setRef] = createSignal<HTMLElement | null>(null);
  const contextProps = () => itemContext?.props?.() ?? {};
  const combinedOnAction = () => {
    local.onAction?.();
    itemContext?.onAction?.();
  };
  const itemCloseOnSelect = () =>
    ariaProps.closeOnSelect ??
    sectionSelection?.shouldCloseOnSelect() ??
    itemContext?.closeOnSelect;
  const activeSectionSelection = () =>
    sectionSelection && sectionSelection.selectionMode() !== "none" ? sectionSelection : null;
  let registeredStaticKey: Key | null = null;
  let registeredSectionSelectionKey: Key | null = null;
  let registeredSectionSelection: MenuSectionSelectionContextValue | null = null;
  let registeredCloseKey: Key | null = null;
  let registeredCloseAccessor: (() => boolean | undefined) | null = null;

  const unregisterSectionSelection = () => {
    if (registeredSectionSelectionKey != null && registeredSectionSelection) {
      sectionSelectionRegistry?.unregisterItem(
        registeredSectionSelectionKey,
        registeredSectionSelection,
      );
      registeredSectionSelectionKey = null;
      registeredSectionSelection = null;
    }
  };

  createEffect(() => {
    if (!staticCollection) return;

    if (registeredStaticKey != null && registeredStaticKey !== local.id) {
      staticCollection.unregisterItem(registeredStaticKey);
    }

    registeredStaticKey = local.id;
    staticCollection.registerItem({
      id: local.id,
      textValue: local.textValue ?? ariaProps["aria-label"],
      isDisabled:
        resolveBoolean(ariaProps.isDisabled) || (sectionSelection?.isDisabled(local.id) ?? false),
    });
  });

  onCleanup(() => {
    if (registeredStaticKey != null) {
      staticCollection?.unregisterItem(registeredStaticKey);
    }
  });

  createEffect(() => {
    const selection = activeSectionSelection();
    if (!sectionSelectionRegistry || !selection) {
      unregisterSectionSelection();
      return;
    }

    if (registeredSectionSelectionKey === local.id && registeredSectionSelection === selection) {
      return;
    }

    unregisterSectionSelection();
    registeredSectionSelectionKey = local.id;
    registeredSectionSelection = selection;
    sectionSelectionRegistry.registerItem(local.id, selection);
  });

  onCleanup(unregisterSectionSelection);

  const unregisterItemClose = () => {
    if (registeredCloseKey != null && registeredCloseAccessor) {
      itemCloseRegistry?.unregisterItem(registeredCloseKey, registeredCloseAccessor);
      registeredCloseKey = null;
      registeredCloseAccessor = null;
    }
  };

  createEffect(() => {
    if (!itemCloseRegistry) {
      unregisterItemClose();
      return;
    }

    if (registeredCloseKey === local.id && registeredCloseAccessor === itemCloseOnSelect) {
      return;
    }

    unregisterItemClose();
    registeredCloseKey = local.id;
    registeredCloseAccessor = itemCloseOnSelect;
    itemCloseRegistry.registerItem(local.id, itemCloseOnSelect);
  });

  onCleanup(unregisterItemClose);

  const itemAria = createMenuItem<T>(
    {
      key: local.id,
      get isDisabled() {
        return Boolean(
          ariaProps.isDisabled ||
          sectionSelection?.isDisabled(local.id) ||
          menuContext?.isDisabled(),
        );
      },
      get "aria-label"() {
        return ariaProps["aria-label"] ?? local.textValue;
      },
      get onAction() {
        return combinedOnAction;
      },
      get closeOnSelect() {
        return itemCloseOnSelect();
      },
      get href() {
        return local.href;
      },
      get target() {
        return local.target;
      },
      get rel() {
        return local.rel;
      },
      get download() {
        return local.download;
      },
    },
    state,
    () => ref(),
  );

  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return itemAria.isDisabled();
    },
    onHoverStart: local.onHoverStart,
    onHoverEnd: local.onHoverEnd,
    onHoverChange: local.onHoverChange,
  });

  const renderValues = createMemo<MenuItemRenderProps>(() => {
    const selection = activeSectionSelection();
    return {
      isSelected: selection?.isSelected(local.id) ?? itemAria.isSelected(),
      selectionMode: selection?.selectionMode() ?? itemAria.selectionMode(),
      isFocused: itemAria.isFocused(),
      isFocusVisible: itemAria.isFocusVisible(),
      isPressed: itemAria.isPressed(),
      isHovered: isHovered(),
      isDisabled: itemAria.isDisabled(),
      hasSubmenu: Boolean(contextProps()["aria-haspopup"]),
      isOpen: contextProps()["aria-expanded"] === true,
    };
  });

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Menu-item",
    },
    renderValues,
  );
  const hasPrimitiveLabel = () => {
    return typeof props.children === "string" || typeof props.children === "number";
  };

  const cleanItemProps = () => {
    const {
      ref: _ref1,
      "aria-describedby": _ariaDescribedby,
      ...rest
    } = itemAria.menuItemProps as Record<string, unknown>;
    if (!hasPrimitiveLabel() && rest["aria-label"] == null) {
      delete rest["aria-labelledby"];
    }
    const selection = activeSectionSelection();
    const selectionMode = selection?.selectionMode();
    if (selectionMode) {
      rest.role =
        selectionMode === "single"
          ? "menuitemradio"
          : selectionMode === "multiple"
            ? "menuitemcheckbox"
            : "menuitem";
      if (selectionMode !== "none") {
        rest["aria-checked"] = selection?.isSelected(local.id) ?? false;
      } else {
        delete rest["aria-checked"];
      }
      rest["data-selected"] = selection?.isSelected(local.id) || undefined;
    }
    return rest;
  };
  const cleanHoverProps = () => {
    const { ref: _ref2, ...rest } = hoverProps as Record<string, unknown>;
    return rest;
  };
  const domProps = createMemo(() =>
    filterDOMProps(ariaProps as Record<string, unknown>, { global: true }),
  );
  const draggableItem = createMemo(() => {
    if (!menuContext?.dragAndDropHooks?.useDraggableItem || !menuContext.dragState)
      return undefined;
    return menuContext.dragAndDropHooks.useDraggableItem(
      {
        key: local.id as string | number,
      },
      menuContext.dragState as Parameters<NonNullable<DragAndDropHooks<T>["useDraggableItem"]>>[1],
    );
  });
  const droppableItem = createMemo(() => {
    if (!menuContext?.dragAndDropHooks?.useDroppableItem || !menuContext.dropState)
      return undefined;
    return menuContext.dragAndDropHooks.useDroppableItem(
      {
        key: local.id as string | number,
      },
      menuContext.dropState as Parameters<NonNullable<DragAndDropHooks<T>["useDroppableItem"]>>[1],
      () => ref(),
    );
  });

  const isLink = () => !!local.href;

  const cleanItemPropsForLink = () => {
    const all = cleanItemProps();
    const { href: _href, target: _target, rel: _rel, download: _download, ...rest } = all;
    return rest;
  };

  const linkDomProps = () => {
    const all = cleanItemProps();
    const result: Record<string, unknown> = {};
    if (all.href !== undefined) result.href = all.href;
    if (all.target !== undefined) result.target = all.target;
    if (all.rel !== undefined) result.rel = all.rel;
    if (all.download !== undefined) result.download = all.download;
    return result;
  };

  const dataAttrs = () => {
    const selection = activeSectionSelection();
    return {
      "data-focused": itemAria.isFocused() || undefined,
      "data-focus-visible": itemAria.isFocusVisible() || undefined,
      "data-pressed": itemAria.isPressed() || undefined,
      "data-hovered": isHovered() || undefined,
      "data-disabled": itemAria.isDisabled() || undefined,
      "data-selected": (selection?.isSelected(local.id) ?? itemAria.isSelected()) || undefined,
      "data-has-submenu": Boolean(contextProps()["aria-haspopup"]) || undefined,
      "data-open": contextProps()["aria-expanded"] === true || undefined,
      "data-dragging": draggableItem()?.isDragging || undefined,
      "data-drop-target": droppableItem()?.isDropTarget || undefined,
    };
  };

  const childContent = () =>
    hasPrimitiveLabel() ? (
      <span {...itemAria.labelProps}>{renderProps.renderChildren()}</span>
    ) : (
      renderProps.renderChildren()
    );
  const setResolvedItemRef = (el: HTMLLIElement | null) => {
    setRef(el);
    itemContext?.setItemRef?.(el);
    if (el) assignRef(local.ref, el);
  };
  const menuItemProps = () =>
    ({
      ref: setResolvedItemRef,
      ...mergeProps(
        cleanItemProps(),
        contextProps() as Record<string, unknown>,
        domProps(),
        cleanHoverProps(),
        (draggableItem()?.dragProps as Record<string, unknown> | undefined) ?? {},
        (droppableItem()?.dropProps as Record<string, unknown> | undefined) ?? {},
      ),
      class: renderProps.class(),
      style: renderProps.style(),
      ...dataAttrs(),
      children: childContent(),
    }) as JSX.HTMLAttributes<HTMLLIElement>;
  const linkMenuItemProps = () =>
    ({
      ...mergeProps(
        cleanItemPropsForLink(),
        contextProps() as Record<string, unknown>,
        domProps(),
        cleanHoverProps(),
        linkDomProps(),
        (draggableItem()?.dragProps as Record<string, unknown> | undefined) ?? {},
        (droppableItem()?.dropProps as Record<string, unknown> | undefined) ?? {},
      ),
      class: renderProps.class(),
      style: renderProps.style(),
      ...dataAttrs(),
      children: childContent(),
    }) as JSX.HTMLAttributes<HTMLLIElement>;

  if (local.render && !isLink()) {
    return local.render(menuItemProps(), renderValues());
  }

  return (
    <Show
      when={isLink()}
      fallback={
        <li
          ref={(el) => {
            setRef(el);
            itemContext?.setItemRef?.(el);
            assignRef(local.ref, el);
          }}
          {...mergeProps(
            cleanItemProps(),
            contextProps() as Record<string, unknown>,
            domProps(),
            cleanHoverProps(),
            (draggableItem()?.dragProps as Record<string, unknown> | undefined) ?? {},
            (droppableItem()?.dropProps as Record<string, unknown> | undefined) ?? {},
          )}
          class={renderProps.class()}
          style={renderProps.style()}
          {...dataAttrs()}
        >
          {childContent()}
        </li>
      }
    >
      <li
        ref={(el) => {
          setRef(el);
          itemContext?.setItemRef?.(el);
          assignRef(local.ref, el);
        }}
        role="presentation"
      >
        {local.render ? (
          local.render(linkMenuItemProps(), renderValues())
        ) : (
          <a
            // Point the focus ref at the actual focusable menuitem (the <a>),
            // not the presentation <li> wrapper, so roving focus lands correctly.
            ref={(el) => setRef(el)}
            {...mergeProps(
              cleanItemPropsForLink(),
              contextProps() as Record<string, unknown>,
              domProps(),
              cleanHoverProps(),
              linkDomProps(),
              (draggableItem()?.dragProps as Record<string, unknown> | undefined) ?? {},
              (droppableItem()?.dropProps as Record<string, unknown> | undefined) ?? {},
            )}
            class={renderProps.class()}
            style={renderProps.style()}
            {...dataAttrs()}
          >
            {childContent()}
          </a>
        )}
      </li>
    </Show>
  );
}

/**
 * Section primitive alias for Menu composition parity.
 */
export function MenuSection(props: MenuSectionProps): JSX.Element {
  const [selectionProps, sectionProps] = splitProps(props, [
    "selectionMode",
    "selectionBehavior",
    "disallowEmptySelection",
    "selectedKeys",
    "defaultSelectedKeys",
    "onSelectionChange",
    "disabledKeys",
    "disabledBehavior",
    "allowDuplicateSelectionEvents",
    "shouldCloseOnSelect",
  ]);

  const selectionState = createSelectionState({
    get selectionMode() {
      return selectionProps.selectionMode ?? "none";
    },
    get selectionBehavior() {
      return selectionProps.selectionBehavior;
    },
    get disallowEmptySelection() {
      return selectionProps.disallowEmptySelection;
    },
    get selectedKeys() {
      return selectionProps.selectionMode ? selectionProps.selectedKeys : undefined;
    },
    get defaultSelectedKeys() {
      return selectionProps.selectionMode ? selectionProps.defaultSelectedKeys : undefined;
    },
    get onSelectionChange() {
      return selectionProps.selectionMode ? selectionProps.onSelectionChange : undefined;
    },
    get disabledKeys() {
      return selectionProps.disabledKeys;
    },
    get disabledBehavior() {
      return selectionProps.disabledBehavior;
    },
    get allowDuplicateSelectionEvents() {
      return selectionProps.allowDuplicateSelectionEvents;
    },
  });

  const sectionSelection: MenuSectionSelectionContextValue = {
    selectionMode: selectionState.selectionMode,
    isSelected: selectionState.isSelected,
    isDisabled: selectionState.isDisabled,
    select(key, event) {
      selectionState.select(key, event);
    },
    shouldCloseOnSelect() {
      return selectionProps.shouldCloseOnSelect;
    },
  };

  return (
    <MenuSectionSelectionContext.Provider value={sectionSelection}>
      <Section {...sectionProps} />
    </MenuSectionSelectionContext.Provider>
  );
}

Menu.Item = MenuItem;
