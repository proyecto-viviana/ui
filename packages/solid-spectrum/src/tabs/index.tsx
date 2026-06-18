import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  For,
  mergeProps,
  onCleanup,
  Show,
  splitProps,
  useContext,
  type JSX,
} from "solid-js";
import {
  createFocusRing,
  createTabPanel,
  type AriaTabPanelProps,
} from "@proyecto-viviana/solidaria";
import {
  SelectionIndicator,
  Tab as HeadlessTab,
  TabList as HeadlessTabList,
  TabPanels as HeadlessTabPanels,
  Tabs as HeadlessTabs,
  TabsStateContext as HeadlessTabsStateContext,
  type TabListProps as HeadlessTabListProps,
  type TabListRenderProps,
  type TabPanelProps as HeadlessTabPanelProps,
  type TabPanelRenderProps,
  type TabPanelsProps as HeadlessTabPanelsProps,
  type TabProps as HeadlessTabProps,
  type TabRenderProps,
  type TabsProps as HeadlessTabsProps,
  type TabsRenderProps,
} from "@proyecto-viviana/solidaria-components";
import type {
  CollectionNode,
  Key,
  KeyboardActivation,
  TabListState,
  TabOrientation,
} from "@proyecto-viviana/solid-stately";
import type { StyleString } from "../style";
import { baseColor, focusRing, fontRelative, style } from "../style" with { type: "macro" };
import { mergeStyles } from "../style/runtime";
import { IconContext } from "../icon/spectrum-icon";
import { centerBaseline } from "../icon/center-baseline";
import { useProviderProps } from "../provider";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";
import { TextContext } from "../text";
import { TabsPicker, type TabsPickerItem } from "./TabsPicker";

export type TabsDensity = "compact" | "regular";
export type TabsLabelBehavior = "show" | "hide";

export interface TabsProps<T> extends Omit<
  HeadlessTabsProps<T>,
  "children" | "class" | "style" | "slot" | "ref"
> {
  /** The tabs and panels to render. */
  children?: JSX.Element;
  /** Compact reduces tab height and inter-item spacing. */
  density?: TabsDensity;
  /** Whether text labels are visually shown. */
  labelBehavior?: TabsLabelBehavior;
  /** Accessible label for the tab list. Required when aria-labelledby is not provided. */
  "aria-label"?: string;
  /** Id of the element labeling the tab list. Required when aria-label is not provided. */
  "aria-labelledby"?: string;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  /** Slot name when used in a Spectrum context. */
  slot?: string | null;
  /** Ref for the root tabs element. */
  ref?: RefLike<HTMLDivElement>;
}

export interface TabListProps<T> extends Omit<
  HeadlessTabListProps<T>,
  "children" | "class" | "style" | "slot"
> {
  /** Static tabs or a render function for collection items. */
  children?: JSX.Element | ((item: T) => JSX.Element);
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  /** Slot name when used in a Spectrum context. */
  slot?: string | null;
}

export interface TabProps extends Omit<HeadlessTabProps, "children" | "class" | "style" | "slot"> {
  /** The tab contents. */
  children?: JSX.Element | ((renderProps: TabRenderProps) => JSX.Element);
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  /** Slot name when used in a Spectrum context. */
  slot?: string | null;
}

export interface TabPanelProps extends Omit<
  HeadlessTabPanelProps,
  "children" | "class" | "style" | "slot"
> {
  /** The panel contents. */
  children?: JSX.Element | ((renderProps: TabPanelRenderProps) => JSX.Element);
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  /** Slot name when used in a Spectrum context. */
  slot?: string | null;
}

export interface TabPanelsProps extends Omit<HeadlessTabPanelsProps, "class" | "style" | "slot"> {
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  /** Slot name when used in a Spectrum context. */
  slot?: string | null;
}

export const TabsContext = createContext<SpectrumContextValue<TabsProps<unknown>>>(null);

interface InternalTabsContextValue {
  readonly density: TabsDensity;
  readonly labelBehavior: TabsLabelBehavior;
  readonly orientation: TabOrientation;
  readonly ariaLabel: string | undefined;
  readonly ariaLabelledBy: string | undefined;
  readonly showTabs: () => boolean;
  readonly setShowTabs: (value: boolean) => void;
  readonly menuId: string;
  readonly menuButtonId: string;
  readonly menuValueId: string;
}

const InternalTabsContext = createContext<InternalTabsContextValue>({
  density: "regular",
  labelBehavior: "show",
  orientation: "horizontal",
  ariaLabel: undefined,
  ariaLabelledBy: undefined,
  showTabs: () => true,
  setShowTabs: () => undefined,
  menuId: "",
  menuButtonId: "",
  menuValueId: "",
});

interface TabsStyleState {
  orientation: TabOrientation;
  density: TabsDensity;
  isDisabled?: boolean;
  isLabelHidden?: boolean;
  isSelected?: boolean;
  isInert?: boolean;
  isHovered?: boolean;
  isPressed?: boolean;
  isFocusVisible?: boolean;
}

interface TabCollectionItem {
  key: Key;
  textValue: string;
  isDisabled?: boolean;
}

const tabsRoot = style<TabsStyleState>({
  position: "relative",
  display: "flex",
  flexShrink: 0,
  flexDirection: {
    orientation: {
      horizontal: "column",
      vertical: "row",
    },
  },
  font: "ui",
  color: baseColor("neutral"),
  minWidth: 0,
  minHeight: 0,
  opacity: {
    isDisabled: 0.6,
  },
});

const tabList = style<TabsStyleState>({
  display: "flex",
  flexDirection: {
    orientation: {
      horizontal: "row",
      vertical: "column",
    },
  },
  flexShrink: 0,
  gap: {
    orientation: {
      horizontal: {
        isLabelHidden: {
          density: {
            compact: 16,
            regular: 24,
          },
        },
        density: {
          compact: 24,
          regular: 32,
        },
      },
    },
  },
  marginEnd: {
    orientation: {
      vertical: 20,
    },
  },
  marginStart: {
    orientation: {
      vertical: 12,
    },
  },
  minWidth: "min",
});

const tabListWrapper = style({
  position: "relative",
  minWidth: 0,
  flexShrink: 0,
  flexGrow: 0,
});

const hiddenTabListFrame = style({
  position: "absolute",
  top: 0,
  insetStart: 0,
  width: "max",
  visibility: "hidden",
  overflow: "visible",
  opacity: 0,
  pointerEvents: "none",
});

const hiddenTabList = style({
  visibility: "hidden",
  overflow: "visible",
  opacity: 0,
});

const tabsOverflowGateStyles = (scopeId: string) => `
.solidaria-Tabs[data-tabs-overflow-scope="${scopeId}"][data-tabs-overflow-state="menu"]
  [data-tabs-overflow-owner="${scopeId}"] > .solidaria-Tabs-overflowTabList {
  display: none !important;
}

.solidaria-Tabs[data-tabs-overflow-scope="${scopeId}"][data-tabs-overflow-state="tabs"]
  [data-tabs-overflow-owner="${scopeId}"] > .solidaria-Tabs-overflowMenu {
  display: none !important;
}
`;

const tabsOverflowTabListClass = "solidaria-Tabs-overflowTabList";
const tabsOverflowMenuClass = "solidaria-Tabs-overflowMenu";

const tabsMenuWrapper = style<TabsStyleState>({
  display: "flex",
  flexShrink: 0,
  alignItems: "center",
  height: {
    density: {
      compact: 32,
      regular: 48,
    },
  },
});

const tab = style<TabsStyleState>({
  ...focusRing(),
  position: "relative",
  display: "flex",
  alignItems: "center",
  minWidth: 0,
  height: {
    orientation: {
      horizontal: {
        density: {
          compact: 32,
          regular: 48,
        },
      },
    },
  },
  minHeight: {
    orientation: {
      vertical: {
        density: {
          compact: 32,
          regular: 48,
        },
      },
    },
  },
  paddingX: {
    isLabelHidden: "[6px]",
  },
  paddingY: 0,
  borderStyle: "none",
  borderRadius: "sm",
  color: {
    default: baseColor("neutral-subdued"),
    isSelected: baseColor("neutral"),
    isDisabled: "disabled",
    forcedColors: {
      isSelected: "Highlight",
      isDisabled: "GrayText",
    },
  },
  cursor: "default",
  userSelect: "none",
  whiteSpace: "nowrap",
  textDecoration: "none",
  flexShrink: 0,
  transition: "default",
  outlineStyle: "none",
  forcedColorAdjust: "none",
  disableTapHighlight: true,
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
});

const tabContent = style<TabsStyleState>({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 0,
  gap: {
    isLabelHidden: 0,
    default: "text-to-visual",
  },
});

const tabText = style<TabsStyleState>({
  order: 1,
  truncate: true,
  display: {
    default: "inline",
    isLabelHidden: "none",
  },
});

const tabIndicator = style<TabsStyleState>({
  position: "absolute",
  pointerEvents: "none",
  backgroundColor: {
    default: "neutral",
    isDisabled: "disabled",
    forcedColors: {
      default: "Highlight",
      isDisabled: "GrayText",
    },
  },
  borderRadius: "full",
  contain: "strict",
  transition: {
    default: "[translate,width,height]",
    "@media (prefers-reduced-motion: reduce)": "none",
  },
  transitionDuration: 200,
  transitionTimingFunction: "out",
  bottom: {
    orientation: {
      horizontal: 0,
      vertical: "auto",
    },
  },
  top: {
    orientation: {
      horizontal: "auto",
      vertical: 0,
    },
  },
  left: {
    orientation: {
      horizontal: 0,
      vertical: -12,
    },
  },
  right: {
    orientation: {
      horizontal: 0,
      vertical: "auto",
    },
  },
  width: {
    orientation: {
      horizontal: "full",
      vertical: 2,
    },
  },
  height: {
    orientation: {
      horizontal: 2,
      vertical: "full",
    },
  },
});

const tabPanels = style({
  minWidth: 0,
  minHeight: 0,
});

const tabPanel = style<TabsStyleState>({
  ...focusRing(),
  color: "gray-800",
  outlineStyle: "none",
  minWidth: 0,
  minHeight: 0,
  flexGrow: 1,
  display: {
    default: "block",
    isInert: "none",
  },
  marginTop: 4,
});

const iconStyles = style({
  size: fontRelative(20),
  flexShrink: 0,
});

const iconRenderStyles = style({
  order: 0,
  flexShrink: 0,
});

function requireTabsLabel(props: { "aria-label"?: string; "aria-labelledby"?: string }): void {
  if (!props["aria-label"] && !props["aria-labelledby"]) {
    throw new Error("Tabs requires either an aria-label or aria-labelledby prop.");
  }
}

function resolveChildAccessor(value: unknown): JSX.Element {
  let next = value;
  while (typeof next === "function" && (next as (...args: unknown[]) => unknown).length === 0) {
    next = (next as () => unknown)();
  }

  return Array.isArray(next)
    ? (next.map((child) => resolveChildAccessor(child)) as unknown as JSX.Element)
    : (next as JSX.Element);
}

/**
 * Tabs organize related content into sections where one panel is visible at a time.
 */
export function Tabs<T>(props: TabsProps<T>): JSX.Element {
  const providerProps = useProviderProps(props);
  const contextProps = getSlottedContextProps(useContext(TabsContext), props.slot);
  const merged = mergeProps(providerProps, contextProps ?? {}, props) as TabsProps<T>;
  const [local, labelProps, headlessProps] = splitProps(
    merged,
    [
      "children",
      "density",
      "labelBehavior",
      "styles",
      "UNSAFE_className",
      "UNSAFE_style",
      "class",
      "slot",
      "ref",
    ],
    ["aria-label", "aria-labelledby"],
  );
  const density = () => local.density ?? "regular";
  const labelBehavior = () => local.labelBehavior ?? "show";
  const orientation = () => headlessProps.orientation ?? "horizontal";
  const [showTabs, setShowTabsSignal] = createSignal(true);
  const menuId = createUniqueId();
  const menuButtonId = `${menuId}-button`;
  const menuValueId = `${menuId}-value`;
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const assignRef = mergeContextRefs(
    (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
    props.ref,
  );
  const internalContext: InternalTabsContextValue = {
    get density() {
      return density();
    },
    get labelBehavior() {
      return labelBehavior();
    },
    get orientation() {
      return orientation();
    },
    get ariaLabel() {
      return labelProps["aria-label"];
    },
    get ariaLabelledBy() {
      return labelProps["aria-labelledby"];
    },
    showTabs,
    setShowTabs(value) {
      setShowTabsSignal(orientation() === "vertical" ? true : value);
    },
    menuId,
    menuButtonId,
    menuValueId,
  };
  const className = (renderProps: TabsRenderProps) =>
    [
      "solidaria-Tabs",
      contextProps?.UNSAFE_className,
      props.UNSAFE_className,
      props.class,
      mergeStyles(
        tabsRoot({
          orientation: renderProps.orientation,
          density: density(),
          isDisabled: renderProps.isDisabled,
        }),
        mergedStyles(),
      ),
    ]
      .filter(Boolean)
      .join(" ");

  requireTabsLabel(labelProps);
  createEffect(() => {
    if (orientation() === "vertical") {
      setShowTabsSignal(true);
    }
  });

  return (
    <InternalTabsContext.Provider value={internalContext}>
      <HeadlessTabs
        {...headlessProps}
        ref={(element) => assignRef(element)}
        slot={local.slot ?? undefined}
        class={className}
        style={mergedUnsafeStyle()}
        data-density={density()}
        data-label-behavior={labelBehavior()}
        data-tabs-overflow-scope={menuId}
        data-tabs-overflow-state={showTabs() ? "tabs" : "menu"}
      >
        <style>{tabsOverflowGateStyles(menuId)}</style>
        {local.children}
      </HeadlessTabs>
    </InternalTabsContext.Provider>
  );
}

/**
 * A TabList contains the tabs for a Tabs group.
 */
export function TabList<T>(props: TabListProps<T>): JSX.Element {
  const context = useContext(InternalTabsContext);
  const state = useContext(HeadlessTabsStateContext) as TabListState<unknown> | null;
  let wrapperElement: HTMLDivElement | undefined;
  const [wrapperRef, setWrapperRef] = createSignal<HTMLDivElement>();
  const [local, headlessProps] = splitProps(props, [
    "children",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "slot",
  ]);
  const className =
    (isHidden = false) =>
    (renderProps: TabListRenderProps) =>
      [
        "solidaria-TabList",
        isHidden ? undefined : tabsOverflowTabListClass,
        local.UNSAFE_className,
        local.class,
        mergeStyles(
          tabList({
            orientation: renderProps.orientation,
            density: context.density,
            isDisabled: renderProps.isDisabled,
            isLabelHidden: context.labelBehavior === "hide",
          }),
          isHidden ? hiddenTabList : undefined,
          local.styles,
        ),
      ]
        .filter(Boolean)
        .join(" ");
  const collectionItems = createMemo<TabCollectionItem[]>(() => {
    const collection = state?.collection();
    if (!collection) {
      return [];
    }

    return Array.from(collection as Iterable<CollectionNode<unknown>>)
      .filter((item) => item.type === "item")
      .map((item) => ({
        key: item.key,
        textValue: item.textValue ?? String(item.key),
        isDisabled: item.isDisabled,
      }));
  });
  const [cachedItems, setCachedItems] = createSignal<TabCollectionItem[]>([]);
  const measuringItems = createMemo<TabCollectionItem[]>(() => {
    const items = collectionItems();
    return items.length > 0 ? items : cachedItems();
  });
  const pickerItems = createMemo<TabsPickerItem[]>(() =>
    measuringItems().map((item) => ({
      id: item.key,
      textValue: item.textValue,
      label: item.textValue,
      isDisabled: Boolean(item.isDisabled || state?.isKeyDisabled(item.key)),
    })),
  );
  const disabledKeys = createMemo(() => {
    const result = new Set<Key>(state?.disabledKeys() ?? []);
    for (const item of pickerItems()) {
      if (item.isDisabled) {
        result.add(item.id);
      }
    }

    return result;
  });
  const measurementListClass = () =>
    [
      "solidaria-TabList",
      local.UNSAFE_className,
      local.class,
      mergeStyles(
        tabList({
          orientation: context.orientation,
          density: context.density,
          isDisabled: state?.isDisabled() ?? false,
          isLabelHidden: context.labelBehavior === "hide",
        }),
        hiddenTabList,
        local.styles,
      ),
    ]
      .filter(Boolean)
      .join(" ");
  const measurementTabClass = (item: TabCollectionItem) =>
    [
      "solidaria-Tab",
      tab({
        orientation: context.orientation,
        density: context.density,
        isDisabled: Boolean(item.isDisabled || state?.isKeyDisabled(item.key)),
        isSelected: state?.selectedKey() === item.key,
        isLabelHidden: context.labelBehavior === "hide",
      }),
    ]
      .filter(Boolean)
      .join(" ");
  const tabListElement = () => {
    const wrapper = wrapperElement;
    if (!wrapper) {
      return null;
    }

    return context.showTabs()
      ? wrapper.querySelector<HTMLElement>('[role="tablist"]')
      : wrapper.querySelector<HTMLElement>("[data-tabs-measure-list]");
  };
  const measurementListElement = () =>
    wrapperElement?.querySelector<HTMLElement>("[data-tabs-measure-list]") ?? null;
  const updateOverflow = () => {
    if (context.orientation === "vertical") {
      context.setShowTabs(true);
      return;
    }

    const wrapper = wrapperElement;
    const list = tabListElement();
    if (!wrapper || !list) {
      return;
    }

    const tabs = list.querySelectorAll<HTMLElement>('[role="tab"], [data-tabs-measure-tab]');
    const lastTab = tabs[tabs.length - 1];
    if (!lastTab) {
      if (context.showTabs()) {
        context.setShowTabs(true);
      }
      return;
    }

    const wrapperRect = wrapper.getBoundingClientRect();
    const lastTabRect = lastTab.getBoundingClientRect();
    const direction =
      typeof window === "undefined" ? "ltr" : window.getComputedStyle(wrapper).direction;
    const fits =
      direction === "rtl"
        ? lastTabRect.left >= wrapperRect.left
        : lastTabRect.right <= wrapperRect.right;
    context.setShowTabs(fits);
  };
  const queueOverflowUpdate = () => {
    if (typeof window === "undefined") {
      return;
    }

    queueMicrotask(updateOverflow);
    window.requestAnimationFrame(updateOverflow);
  };

  createEffect(() => {
    context.orientation;
    context.density;
    context.labelBehavior;
    queueOverflowUpdate();
  });

  createEffect(() => {
    context.showTabs();
    queueOverflowUpdate();
  });

  createEffect(() => {
    const items = collectionItems();
    if (items.length > 0) {
      setCachedItems(items);
    }
  });

  createEffect(() => {
    measuringItems();
    queueOverflowUpdate();
  });

  createEffect(() => {
    const wrapper = wrapperRef();
    queueOverflowUpdate();
    if (!wrapper || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(queueOverflowUpdate);
    observer.observe(wrapper);
    if (wrapper.parentElement) {
      observer.observe(wrapper.parentElement);
    }
    const list = measurementListElement();
    if (list) {
      observer.observe(list);
    }
    window.addEventListener("resize", queueOverflowUpdate);
    onCleanup(() => observer.disconnect());
    onCleanup(() => window.removeEventListener("resize", queueOverflowUpdate));
  });

  createEffect(() => {
    const fonts = typeof document === "undefined" ? undefined : document.fonts;
    fonts?.ready.then(queueOverflowUpdate);
  });

  return (
    <div
      ref={(element) => {
        wrapperElement = element;
        setWrapperRef(element);
      }}
      class={tabListWrapper}
      data-tabs-overflow-owner={context.menuId}
    >
      <div class={hiddenTabListFrame} aria-hidden="true" inert>
        <div class={measurementListClass()} style={local.UNSAFE_style} data-tabs-measure-list>
          <For each={measuringItems()}>
            {(item) => (
              <div class={measurementTabClass(item)} data-tabs-measure-tab>
                <span
                  class={tabContent({
                    orientation: context.orientation,
                    density: context.density,
                    isLabelHidden: context.labelBehavior === "hide",
                  })}
                >
                  <span
                    class={tabText({
                      orientation: context.orientation,
                      density: context.density,
                      isLabelHidden: context.labelBehavior === "hide",
                    })}
                    data-rsp-slot="text"
                  >
                    {item.textValue}
                  </span>
                </span>
              </div>
            )}
          </For>
        </div>
      </div>
      <HeadlessTabList
        {...headlessProps}
        aria-label={headlessProps["aria-label"] ?? context.ariaLabel}
        aria-labelledby={headlessProps["aria-labelledby"] ?? context.ariaLabelledBy}
        slot={local.slot ?? undefined}
        class={className(false)}
        style={local.UNSAFE_style}
      >
        {local.children}
      </HeadlessTabList>
      <TabsMenu items={pickerItems()} disabledKeys={disabledKeys()} />
    </div>
  );
}

function TabsMenu(props: { items: TabsPickerItem[]; disabledKeys: Set<Key> }): JSX.Element {
  const context = useContext(InternalTabsContext);
  const state = useContext(HeadlessTabsStateContext) as TabListState<unknown> | null;
  const allKeysDisabled = () =>
    props.items.length > 0 && props.items.every((item) => props.disabledKeys.has(item.id));
  const isDisabled = () => Boolean(state?.isDisabled() || allKeysDisabled());

  return (
    <div
      class={[
        tabsOverflowMenuClass,
        tabsMenuWrapper({
          orientation: context.orientation,
          density: context.density,
        }),
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <TabsPicker
        id={context.menuId}
        valueId={context.menuValueId}
        aria-label={context.ariaLabel}
        aria-labelledby={context.ariaLabelledBy}
        density={context.density}
        labelBehavior={context.labelBehavior}
        items={props.items}
        disabledKeys={props.disabledKeys}
        selectedKey={state?.selectedKey() ?? null}
        isDisabled={isDisabled()}
        onSelectionChange={(key) => {
          if (key != null) {
            state?.setSelectedKey(key);
          }
        }}
      />
    </div>
  );
}

/**
 * A Tab represents a selectable section in a Tabs group.
 */
export function Tab(props: TabProps): JSX.Element {
  const context = useContext(InternalTabsContext);
  const contentId = createUniqueId();
  const [local, headlessProps] = splitProps(props, [
    "children",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "slot",
  ]);
  const labelHidden = () => context.labelBehavior === "hide";
  const textStyleState = () => ({
    orientation: context.orientation,
    density: context.density,
    isLabelHidden: labelHidden(),
  });
  const className = (renderProps: TabRenderProps) =>
    [
      "solidaria-Tab",
      local.UNSAFE_className,
      local.class,
      mergeStyles(
        tab({
          ...renderProps,
          orientation: context.orientation,
          density: context.density,
          isLabelHidden: labelHidden(),
        }),
        local.styles,
      ),
    ]
      .filter(Boolean)
      .join(" ");
  const textContextValue = {
    id: contentId,
    get styles() {
      return tabText(textStyleState()) as StyleString;
    },
    "data-rsp-slot": "text",
  };
  const hasRenderChildren = () =>
    typeof local.children === "function" &&
    (local.children as (...args: unknown[]) => JSX.Element).length > 0;
  const iconContextValue = {
    slot: "icon",
    render: centerBaseline({ slot: "icon", styles: iconRenderStyles }),
    styles: iconStyles,
  };

  function TabContent(renderProps: TabRenderProps): JSX.Element {
    function ResolvedTabContent(): JSX.Element {
      const contentValue = hasRenderChildren()
        ? (local.children as (renderProps: TabRenderProps) => JSX.Element)(renderProps)
        : local.children;
      const value = resolveChildAccessor(contentValue);

      return typeof value === "string" ? (
        <span id={contentId} class={tabText(textStyleState())} data-rsp-slot="text">
          {value}
        </span>
      ) : (
        value
      );
    }

    return (
      <>
        <SelectionIndicator
          class={tabIndicator({
            orientation: context.orientation,
            density: context.density,
            isDisabled: renderProps.isDisabled,
          })}
          data-rsp-slot="selection-indicator"
        />
        <IconContext.Provider value={iconContextValue}>
          <TextContext.Provider value={textContextValue}>
            <span
              class={tabContent({
                orientation: context.orientation,
                density: context.density,
                isLabelHidden: labelHidden(),
              })}
            >
              <ResolvedTabContent />
            </span>
          </TextContext.Provider>
        </IconContext.Provider>
      </>
    );
  }

  return (
    <HeadlessTab
      {...headlessProps}
      aria-labelledby={
        [labelHidden() ? contentId : undefined, headlessProps["aria-labelledby"]]
          .filter(Boolean)
          .join(" ") || undefined
      }
      slot={local.slot ?? undefined}
      class={className}
      style={local.UNSAFE_style}
    >
      {(renderProps) => <TabContent {...renderProps} />}
    </HeadlessTab>
  );
}

/**
 * A TabPanels groups TabPanel elements for compatibility with older composition.
 */
export function TabPanels(props: TabPanelsProps): JSX.Element {
  const [local, headlessProps] = splitProps(props, [
    "children",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "slot",
  ]);
  const className = () =>
    [
      "solidaria-TabPanels",
      local.UNSAFE_className,
      local.class,
      mergeStyles(tabPanels, local.styles),
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <HeadlessTabPanels
      {...headlessProps}
      slot={local.slot ?? undefined}
      class={className()}
      style={local.UNSAFE_style}
    >
      {local.children}
    </HeadlessTabPanels>
  );
}

/**
 * A TabPanel contains the content associated with a Tab.
 */
export function TabPanel(props: TabPanelProps): JSX.Element {
  const context = useContext(InternalTabsContext);
  const state = useContext(HeadlessTabsStateContext);
  const [local, headlessProps] = splitProps(props, [
    "children",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "slot",
    "shouldForceMount",
  ]);
  const ariaProps = headlessProps as AriaTabPanelProps;
  const { tabPanelProps, isSelected } = createTabPanel<unknown>(ariaProps, state);
  const { isFocused, isFocusVisible, focusProps } = createFocusRing();
  const isInert = () =>
    Boolean(local.shouldForceMount && ariaProps.id !== undefined && !isSelected());
  const isEntering = () => false;
  const isExiting = () => false;
  const className = (renderProps: TabPanelRenderProps) =>
    [
      "solidaria-TabPanel",
      local.UNSAFE_className,
      local.class,
      mergeStyles(
        tabPanel({
          ...renderProps,
          orientation: context.orientation,
          density: context.density,
        }),
        local.styles,
      ),
    ]
      .filter(Boolean)
      .join(" ");
  const renderValues = createMemo<TabPanelRenderProps>(() => ({
    isSelected: isSelected(),
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible(),
    isInert: isInert(),
    isEntering: isEntering(),
    isExiting: isExiting(),
    state,
  }));
  const collapsedRenderProps = createMemo<TabPanelRenderProps>(() => ({
    isSelected: true,
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible(),
    isInert: false,
    isEntering: false,
    isExiting: false,
    state,
  }));
  const activeRenderProps = () => (context.showTabs() ? renderValues() : collapsedRenderProps());
  const shouldRenderCollapsedPanel = () => {
    if (ariaProps.id === undefined) {
      return state ? state.selectedKey() !== null : true;
    }

    return state?.selectedKey() === ariaProps.id;
  };
  const shouldRender = () => {
    if (!context.showTabs()) {
      return shouldRenderCollapsedPanel();
    }
    if (local.shouldForceMount) {
      return true;
    }
    if (ariaProps.id === undefined) {
      return state ? state.selectedKey() !== null : true;
    }

    return isSelected();
  };
  const renderedChildren = () =>
    typeof local.children === "function"
      ? (local.children as (renderProps: TabPanelRenderProps) => JSX.Element)(activeRenderProps())
      : local.children;
  const menuLabelledBy = () =>
    [context.menuButtonId, context.menuValueId].filter(Boolean).join(" ") || undefined;
  const hasTabPanelSemantics = () => context.showTabs() && !isInert();

  return (
    <Show when={shouldRender()}>
      <div
        id={hasTabPanelSemantics() ? tabPanelProps.id : undefined}
        role={context.showTabs() ? (isInert() ? undefined : tabPanelProps.role) : "group"}
        aria-labelledby={
          context.showTabs()
            ? hasTabPanelSemantics()
              ? tabPanelProps["aria-labelledby"]
              : undefined
            : menuLabelledBy()
        }
        aria-label={hasTabPanelSemantics() ? tabPanelProps["aria-label"] : undefined}
        aria-describedby={hasTabPanelSemantics() ? tabPanelProps["aria-describedby"] : undefined}
        tabIndex={context.showTabs() && isInert() ? undefined : tabPanelProps.tabIndex}
        slot={local.slot ?? undefined}
        class={className(activeRenderProps())}
        style={local.UNSAFE_style}
        onFocus={focusProps.onFocus}
        onBlur={focusProps.onBlur}
        data-focused={isFocused() || undefined}
        data-focus-visible={isFocusVisible() || undefined}
        inert={context.showTabs() && isInert() ? true : undefined}
        data-inert={context.showTabs() && isInert() ? true : undefined}
        data-entering={context.showTabs() && isEntering() ? true : undefined}
        data-exiting={context.showTabs() && isExiting() ? true : undefined}
        hidden={
          context.showTabs() &&
          ariaProps.id !== undefined &&
          !isSelected() &&
          !local.shouldForceMount
            ? true
            : undefined
        }
      >
        {renderedChildren()}
      </div>
    </Show>
  );
}

Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panels = TabPanels;
Tabs.Panel = TabPanel;

export { Collection } from "@proyecto-viviana/solidaria-components";
export { Text } from "../text";
export type { Key, KeyboardActivation, TabOrientation };
