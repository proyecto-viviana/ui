/**
 * Tabs component for solidaria-components
 *
 * A pre-wired headless tabs component that combines state + aria hooks.
 * Port of react-aria-components/src/Tabs.tsx
 */

import {
  type Accessor,
  type JSX,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  splitProps,
  useContext,
  For,
  Show,
  onCleanup,
} from "solid-js";
import {
  createTabList,
  createTab,
  createTabPanel,
  createFocusRing,
  createHover,
  type AriaTabListProps,
  type AriaTabProps,
  type AriaTabPanelProps,
} from "@proyecto-viviana/solidaria";
import {
  createTabListState,
  type TabListState,
  type Key,
  type TabOrientation,
  type KeyboardActivation,
} from "@proyecto-viviana/solid-stately";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  filterDOMProps,
} from "./utils";
import {
  SelectionIndicator,
  SelectionIndicatorContext,
  type SelectionIndicatorContextValue,
} from "./SelectionIndicator";
import { SharedElementTransition } from "./SharedElementTransition";

export {
  SelectionIndicator,
  SelectionIndicatorContext,
  type SelectionIndicatorProps,
  type SelectionIndicatorRenderProps,
} from "./SelectionIndicator";

export interface TabsRenderProps {
  /** The orientation of the tabs. */
  orientation: TabOrientation;
  /** Whether the tabs are disabled. */
  isDisabled: boolean;
}

export interface TabsProps<T> extends SlotProps {
  /** The items to render in the tab list. */
  items?: T[];
  /** Function to get the key from an item. */
  getKey?: (item: T) => Key;
  /** Function to get the text value from an item. */
  getTextValue?: (item: T) => string;
  /** Function to check if an item is disabled. */
  getDisabled?: (item: T) => boolean;
  /** Keys of disabled tabs. */
  disabledKeys?: Iterable<Key>;
  /** The currently selected tab key (controlled). */
  selectedKey?: Key | null;
  /** The default selected tab key (uncontrolled). */
  defaultSelectedKey?: Key;
  /** Handler for tab selection changes. */
  onSelectionChange?: (key: Key) => void;
  /** Whether the tabs are disabled. */
  isDisabled?: boolean;
  /** The keyboard activation mode. */
  keyboardActivation?: KeyboardActivation;
  /** The orientation of the tabs. */
  orientation?: TabOrientation;
  /** The children of the component. */
  children?: RenderChildren<TabsRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<TabsRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<TabsRenderProps>;
  /** Ref for the root tabs element. */
  ref?: RefLike<HTMLDivElement>;
}

export interface TabListRenderProps {
  /** The orientation of the tab list. */
  orientation: TabOrientation;
  /** Whether the tab list is disabled. */
  isDisabled: boolean;
  /** Whether the tab list has focus. */
  isFocused: boolean;
  /** Whether the tab list has visible focus. */
  isFocusVisible: boolean;
}

export interface TabListProps<T> extends Omit<AriaTabListProps, "children">, SlotProps {
  /** Items to render in the tab list. */
  items?: T[];
  /** The children of the tab list - static tabs or a render function for each item. */
  children?: JSX.Element | ((item: T) => JSX.Element);
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<TabListRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<TabListRenderProps>;
}

export interface TabRenderProps {
  /** Whether the tab is selected. */
  isSelected: boolean;
  /** Whether the tab is focused. */
  isFocused: boolean;
  /** Whether the tab has visible focus ring. */
  isFocusVisible: boolean;
  /** Whether the tab is pressed. */
  isPressed: boolean;
  /** Whether the tab is hovered. */
  isHovered: boolean;
  /** Whether the tab is disabled. */
  isDisabled: boolean;
}

export interface TabProps extends Omit<AriaTabProps, "key">, SlotProps {
  /** The unique key for the tab. */
  id: Key;
  /** The children of the tab. */
  children?: RenderChildren<TabRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<TabRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<TabRenderProps>;
}

export interface TabPanelRenderProps {
  /** Whether the panel is the selected one. */
  isSelected: boolean;
  /** Whether the panel is focused. */
  isFocused: boolean;
  /** Whether the panel has visible focus ring. */
  isFocusVisible: boolean;
  /** Whether the panel is non-interactive while force mounted. */
  isInert: boolean;
  /** Whether the panel is currently entering. */
  isEntering: boolean;
  /** Whether the panel is currently exiting. */
  isExiting: boolean;
  /** State of the tab list. */
  state: TabListState<unknown> | null;
}

export interface TabPanelProps extends AriaTabPanelProps, SlotProps {
  /** The children of the tab panel. */
  children?: RenderChildren<TabPanelRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<TabPanelRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<TabPanelRenderProps>;
  /** Whether to keep the panel mounted when not selected. */
  shouldForceMount?: boolean;
}

export interface TabPanelsProps extends SlotProps {
  /** The grouped tab panels. */
  children?: JSX.Element;
  /** The CSS className for the element. */
  class?: string;
  /** The inline style for the element. */
  style?: JSX.CSSProperties;
}

interface TabsContextValue<T> {
  state: TabListState<T>;
  items: Accessor<T[]>;
  setTabListItems(items: T[] | undefined): void;
  registerTab(tab: RegisteredTab): void;
  unregisterTab(id: Key): void;
}

type RefLike<T> = ((el: T) => void) | { current?: T | null } | undefined;

function assignRef<T>(ref: RefLike<T>, element: T): void {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(element);
  } else if (typeof ref === "object" && "current" in ref) {
    ref.current = element;
  }
}

export const TabsContext = createContext<TabsContextValue<unknown> | null>(null);
export const TabsStateContext = createContext<TabListState<unknown> | null>(null);

interface RegisteredTab {
  id: Key;
  textValue?: string;
  isDisabled?: boolean;
}

interface CollectionItemLike {
  id?: Key;
  key?: Key;
  label?: string;
  textValue?: string;
  isDisabled?: boolean;
}

function collectionItemKey<T>(item: T): Key {
  const tab = item as CollectionItemLike;
  const key = tab.id ?? tab.key;
  if (key == null) {
    throw new Error("Tabs collection items require an id or key.");
  }
  return key;
}

function staticTabText(tab: RegisteredTab): string {
  return tab.textValue ?? String(tab.id);
}

/**
 * Tabs provide a way to organize content into multiple sections, with only one section visible at a time.
 */
export function Tabs<T>(props: TabsProps<T>): JSX.Element {
  const [local, stateProps, rest] = splitProps(
    props,
    ["class", "style", "slot", "ref"],
    [
      "items",
      "getKey",
      "getTextValue",
      "getDisabled",
      "disabledKeys",
      "selectedKey",
      "defaultSelectedKey",
      "onSelectionChange",
      "isDisabled",
      "keyboardActivation",
      "orientation",
    ],
  );

  const [tabListItems, setTabListItems] = createSignal<T[] | undefined>(undefined);
  const [registeredTabs, setRegisteredTabs] = createSignal<RegisteredTab[]>([]);
  const effectiveItems = createMemo<T[]>(() => {
    if (stateProps.items) return stateProps.items;
    if (tabListItems()) return tabListItems() ?? [];
    return registeredTabs() as T[];
  });

  // Create tab list state
  const state = createTabListState<T>({
    get items() {
      return effectiveItems();
    },
    get getKey() {
      return stateProps.getKey ?? collectionItemKey;
    },
    get getTextValue() {
      return (
        stateProps.getTextValue ??
        ((item: T) => {
          const tab = item as RegisteredTab & CollectionItemLike;
          return tab.textValue ?? tab.label ?? staticTabText(tab);
        })
      );
    },
    get getDisabled() {
      return (
        stateProps.getDisabled ??
        ((item: T) => {
          const tab = item as RegisteredTab & CollectionItemLike;
          return tab.isDisabled ?? false;
        })
      );
    },
    get disabledKeys() {
      return stateProps.disabledKeys;
    },
    get selectedKey() {
      return stateProps.selectedKey;
    },
    get defaultSelectedKey() {
      return stateProps.defaultSelectedKey;
    },
    get onSelectionChange() {
      return stateProps.onSelectionChange;
    },
    get isDisabled() {
      return stateProps.isDisabled;
    },
    get keyboardActivation() {
      return stateProps.keyboardActivation;
    },
    get orientation() {
      return stateProps.orientation;
    },
  });

  const renderValues = createMemo<TabsRenderProps>(() => ({
    orientation: state.orientation(),
    isDisabled: state.isDisabled(),
  }));

  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      children: props.children,
      defaultClassName: "solidaria-Tabs",
    },
    renderValues,
  );

  const domProps = createMemo(() =>
    filterDOMProps(rest as Record<string, unknown>, { global: true }),
  );

  const contextValue: TabsContextValue<T> = {
    state,
    items: effectiveItems,
    setTabListItems(items) {
      setTabListItems(() => items);
    },
    registerTab(tab) {
      setRegisteredTabs((current) => {
        const next = current.filter((item) => item.id !== tab.id);
        next.push(tab);
        return next;
      });
    },
    unregisterTab(id) {
      setRegisteredTabs((current) => current.filter((item) => item.id !== id));
    },
  };

  return (
    <TabsContext.Provider value={contextValue as TabsContextValue<unknown>}>
      <TabsStateContext.Provider value={state}>
        <div
          {...domProps()}
          ref={(element) => assignRef(local.ref, element)}
          class={renderProps.class()}
          style={renderProps.style()}
          data-orientation={state.orientation()}
          data-disabled={state.isDisabled() || undefined}
        >
          {props.children as JSX.Element}
        </div>
      </TabsStateContext.Provider>
    </TabsContext.Provider>
  );
}

/**
 * A TabList contains Tab elements that represent the available tabs.
 */
export function TabList<T>(props: TabListProps<T>): JSX.Element {
  const [local, collectionProps, ariaProps] = splitProps(
    props,
    ["class", "style", "slot"],
    ["items"],
  );

  const context = useContext(TabsContext);

  return (
    <Show when={context} fallback={<div class="solidaria-TabList" role="tablist" />}>
      {(ctx) => (
        <TabListInner
          context={ctx()}
          local={local}
          items={collectionProps.items}
          ariaProps={ariaProps}
          children={props.children}
        />
      )}
    </Show>
  );
}

/** Inner TabList component that has access to context */
function TabListInner<T>(props: {
  context: TabsContextValue<unknown>;
  local: {
    class?: ClassNameOrFunction<TabListRenderProps>;
    style?: StyleOrFunction<TabListRenderProps>;
    slot?: string;
  };
  ariaProps: Omit<TabListProps<T>, "children" | "class" | "style" | "slot" | "items">;
  items?: T[];
  children?: JSX.Element | ((item: T) => JSX.Element);
}): JSX.Element {
  const state = props.context.state as TabListState<T>;
  const items = props.context.items as Accessor<T[]>;
  const renderItem = createMemo(() => {
    if (typeof props.children !== "function") {
      return undefined;
    }

    const child = props.children as (...args: unknown[]) => JSX.Element;
    if (child.length === 0 && props.items === undefined) {
      return undefined;
    }

    return props.children as (item: T) => JSX.Element;
  });
  const renderedChildren = createMemo(() => {
    if (renderItem() || typeof props.children !== "function") {
      return props.children as JSX.Element;
    }

    return (props.children as () => JSX.Element)();
  });

  createEffect(() => {
    props.context.setTabListItems(props.items as unknown[] | undefined);
  });

  onCleanup(() => {
    props.context.setTabListItems(undefined);
  });

  // Create tab list aria props
  const { tabListProps } = createTabList<T>(props.ariaProps as AriaTabListProps, state);

  const { isFocused, isFocusVisible, focusProps } = createFocusRing();

  const renderValues = createMemo<TabListRenderProps>(() => ({
    orientation: state.orientation(),
    isDisabled: state.isDisabled(),
    isFocused: state.isFocused() || isFocused(),
    isFocusVisible: isFocusVisible(),
  }));

  const renderProps = useRenderProps(
    {
      class: props.local.class,
      style: props.local.style,
      defaultClassName: "solidaria-TabList",
    },
    renderValues,
  );

  // Helper to safely call event handlers that may be bound tuples
  const callHandler = <E extends Event>(
    handler: JSX.EventHandlerUnion<HTMLElement, E> | undefined,
    event: E,
  ) => {
    if (!handler) return;
    if (Array.isArray(handler)) {
      handler[1].call(handler[0], event);
      return;
    }
    if (typeof handler === "function") {
      (handler as (evt: E) => void)(event);
      return;
    }
    if (
      typeof handler === "object" &&
      "handleEvent" in handler &&
      typeof handler.handleEvent === "function"
    ) {
      (handler.handleEvent as (evt: E) => void)(event);
    }
  };

  // Combine event handlers
  const handleKeyDown = (e: KeyboardEvent) => {
    tabListProps.onKeyDown(e);
  };

  const handleFocus = (e: FocusEvent) => {
    tabListProps.onFocus(e);
    callHandler(focusProps.onFocus, e);
  };

  const handleBlur = (e: FocusEvent) => {
    tabListProps.onBlur(e);
    callHandler(focusProps.onBlur, e);
  };

  return (
    <div
      role={tabListProps.role}
      aria-orientation={tabListProps["aria-orientation"]}
      aria-label={tabListProps["aria-label"]}
      aria-labelledby={tabListProps["aria-labelledby"]}
      aria-describedby={tabListProps["aria-describedby"]}
      class={renderProps.class()}
      style={renderProps.style()}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      data-focused={state.isFocused() || undefined}
      data-focus-visible={isFocusVisible() || undefined}
      data-orientation={state.orientation()}
      data-disabled={state.isDisabled() || undefined}
    >
      {renderItem() ? (
        <SharedElementTransition>
          <For each={(props.items ?? items()) as T[]}>{(item) => renderItem()?.(item)}</For>
        </SharedElementTransition>
      ) : (
        renderedChildren()
      )}
    </div>
  );
}

/**
 * A Tab represents an individual tab in a TabList.
 */
export function Tab(props: TabProps): JSX.Element {
  const [local, ariaProps] = splitProps(props, ["class", "style", "slot", "id"]);

  const context = useContext(TabsStateContext);
  const tabsContext = useContext(TabsContext);

  return (
    <Show when={context} fallback={<div class="solidaria-Tab" role="tab" />}>
      {(state) => (
        <TabInner
          state={state()}
          tabsContext={tabsContext}
          local={local}
          ariaProps={ariaProps}
          children={props.children}
        />
      )}
    </Show>
  );
}

/** Inner Tab component that has access to context */
function TabInner(props: {
  state: TabListState<unknown>;
  tabsContext: TabsContextValue<unknown> | null;
  local: {
    class?: ClassNameOrFunction<TabRenderProps>;
    style?: StyleOrFunction<TabRenderProps>;
    slot?: string;
    id: Key;
  };
  ariaProps: Omit<TabProps, "children" | "class" | "style" | "slot" | "id">;
  children?: RenderChildren<TabRenderProps>;
}): JSX.Element {
  let tabRef: HTMLDivElement | undefined;
  const textValue = () => {
    if (props.ariaProps["aria-label"]) return props.ariaProps["aria-label"];
    return typeof props.children === "string" ? props.children : undefined;
  };

  createEffect(() => {
    props.tabsContext?.registerTab({
      id: props.local.id,
      textValue: textValue(),
      isDisabled: props.ariaProps.isDisabled,
    });
  });

  onCleanup(() => {
    props.tabsContext?.unregisterTab(props.local.id);
  });

  // Create tab aria props
  const tabAria = createTab<unknown>(
    {
      key: props.local.id,
      get isDisabled() {
        return props.ariaProps.isDisabled;
      },
      get "aria-label"() {
        return props.ariaProps["aria-label"];
      },
      get "aria-labelledby"() {
        return props.ariaProps["aria-labelledby"];
      },
    },
    props.state,
    () => tabRef ?? null,
  );

  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return tabAria.isDisabled();
    },
  });

  const renderValues = createMemo<TabRenderProps>(() => ({
    isSelected: tabAria.isSelected(),
    isFocused: tabAria.isFocused(),
    isFocusVisible: tabAria.isFocusVisible(),
    isPressed: tabAria.isPressed(),
    isHovered: isHovered(),
    isDisabled: tabAria.isDisabled(),
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: props.local.class,
      style: props.local.style,
      defaultClassName: "solidaria-Tab",
    },
    renderValues,
  );

  const selectionIndicatorContext = createMemo<SelectionIndicatorContextValue>(() => ({
    isSelected: tabAria.isSelected,
  }));

  return (
    <SelectionIndicatorContext.Provider value={selectionIndicatorContext()}>
      <div
        ref={tabRef}
        id={tabAria.tabProps.id}
        role={tabAria.tabProps.role}
        aria-selected={tabAria.isSelected()}
        aria-disabled={tabAria.isDisabled() || undefined}
        aria-controls={tabAria.isSelected() ? tabAria.tabProps["aria-controls"] : undefined}
        aria-label={tabAria.tabProps["aria-label"]}
        aria-labelledby={tabAria.tabProps["aria-labelledby"]}
        tabIndex={tabAria.isSelected() && !tabAria.isDisabled() ? 0 : -1}
        class={renderProps.class()}
        style={renderProps.style()}
        onKeyDown={tabAria.tabProps.onKeyDown}
        onMouseDown={tabAria.tabProps.onMouseDown}
        onPointerDown={tabAria.tabProps.onPointerDown}
        onClick={tabAria.tabProps.onClick}
        onFocus={tabAria.tabProps.onFocus}
        {...hoverProps}
        data-selected={tabAria.isSelected() || undefined}
        data-focused={tabAria.isFocused() || undefined}
        data-focus-visible={tabAria.isFocusVisible() || undefined}
        data-pressed={tabAria.isPressed() || undefined}
        data-hovered={isHovered() || undefined}
        data-disabled={tabAria.isDisabled() || undefined}
      >
        {renderProps.renderChildren()}
      </div>
    </SelectionIndicatorContext.Provider>
  );
}

/**
 * Groups multiple TabPanel elements.
 */
export function TabPanels(props: TabPanelsProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "style", "slot", "children"]);
  const domProps = createMemo(() =>
    filterDOMProps(rest as Record<string, unknown>, { global: true }),
  );
  const state = useContext(TabsStateContext);
  let ref: HTMLDivElement | undefined;
  let previousSelectedKey: Key | null | undefined = undefined;
  const [panelSize, setPanelSize] = createSignal<{ width?: string; height?: string }>({});

  createEffect(() => {
    const selectedKey = state?.selectedKey() ?? null;
    if (!ref) {
      previousSelectedKey = selectedKey;
      return;
    }

    if (previousSelectedKey === undefined) {
      previousSelectedKey = selectedKey;
      return;
    }

    if (previousSelectedKey === selectedKey) return;
    previousSelectedKey = selectedKey;

    const transition = window.getComputedStyle(ref).transition;
    const shouldMeasureWidth = /width|inline-size|all/.test(transition);
    const shouldMeasureHeight = /height|block-size|all/.test(transition);
    if (!shouldMeasureWidth && !shouldMeasureHeight) return;

    const selectedPanel = ref.querySelector<HTMLElement>('[role="tabpanel"]:not([hidden])');
    if (!selectedPanel) return;

    setPanelSize({
      width: shouldMeasureWidth ? `${selectedPanel.offsetWidth}px` : undefined,
      height: shouldMeasureHeight ? `${selectedPanel.offsetHeight}px` : undefined,
    });
  });

  const mergedStyle = (): JSX.CSSProperties =>
    ({
      ...local.style,
      ...(panelSize().width ? { "--tab-panel-width": panelSize().width } : {}),
      ...(panelSize().height ? { "--tab-panel-height": panelSize().height } : {}),
    }) as JSX.CSSProperties;

  return (
    <div
      {...domProps()}
      ref={(el) => {
        ref = el;
      }}
      class={local.class ?? "solidaria-TabPanels"}
      style={mergedStyle()}
    >
      {local.children}
    </div>
  );
}

/**
 * A TabPanel displays the content for a selected Tab.
 */
export function TabPanel(props: TabPanelProps): JSX.Element {
  const [local, ariaProps] = splitProps(props, ["class", "style", "slot", "shouldForceMount"]);

  // Get state from context (may be null for SSR scenarios)
  const state = useContext(TabsStateContext);

  // Create tab panel aria props
  const { tabPanelProps, isSelected } = createTabPanel<unknown>(ariaProps, state);

  // Create focus ring for the panel
  const { isFocused, isFocusVisible, focusProps } = createFocusRing();
  const isInert = () =>
    Boolean(local.shouldForceMount && ariaProps.id !== undefined && !isSelected());
  const isEntering = () => false;
  const isExiting = () => false;

  const renderValues = createMemo<TabPanelRenderProps>(() => ({
    isSelected: isSelected(),
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible(),
    isInert: isInert(),
    isEntering: isEntering(),
    isExiting: isExiting(),
    state,
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-TabPanel",
    },
    renderValues,
  );

  // Determine if we should render the panel
  // If no id is provided, render when any tab is selected (shared panel pattern)
  // If id is provided, render when that specific tab is selected
  const shouldRender = () => {
    if (local.shouldForceMount) return true;
    if (ariaProps.id === undefined) {
      return state ? state.selectedKey() !== null : true;
    }
    return isSelected();
  };

  return (
    <Show when={shouldRender()}>
      <div
        id={tabPanelProps.id}
        role={tabPanelProps.role}
        aria-labelledby={tabPanelProps["aria-labelledby"]}
        aria-label={tabPanelProps["aria-label"]}
        aria-describedby={tabPanelProps["aria-describedby"]}
        tabIndex={tabPanelProps.tabIndex}
        class={renderProps.class()}
        style={renderProps.style()}
        onFocus={focusProps.onFocus}
        onBlur={focusProps.onBlur}
        data-selected={isSelected() || undefined}
        data-focused={isFocused() || undefined}
        data-focus-visible={isFocusVisible() || undefined}
        inert={isInert() ? true : undefined}
        data-inert={isInert() || undefined}
        data-entering={isEntering() || undefined}
        data-exiting={isExiting() || undefined}
        hidden={
          ariaProps.id !== undefined && !isSelected() && !local.shouldForceMount ? true : undefined
        }
      >
        {renderProps.renderChildren()}
      </div>
    </Show>
  );
}

Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panels = TabPanels;
Tabs.Panel = TabPanel;
Tabs.SelectionIndicator = SelectionIndicator;
