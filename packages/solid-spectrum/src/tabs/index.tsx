import {
  createContext,
  createUniqueId,
  mergeProps,
  splitProps,
  useContext,
  type JSX,
} from "solid-js";
import {
  SelectionIndicator,
  Tab as HeadlessTab,
  TabList as HeadlessTabList,
  TabPanel as HeadlessTabPanel,
  TabPanels as HeadlessTabPanels,
  Tabs as HeadlessTabs,
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
import type { Key, KeyboardActivation, TabOrientation } from "@proyecto-viviana/solid-stately";
import type { StyleString } from "../s2-style";
import { baseColor, focusRing, fontRelative, style } from "../s2-style";
import { mergeStyles } from "../s2-style/runtime";
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
}

const InternalTabsContext = createContext<InternalTabsContextValue>({
  density: "regular",
  labelBehavior: "show",
  orientation: "horizontal",
  ariaLabel: undefined,
  ariaLabelledBy: undefined,
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
  alignItems: {
    orientation: {
      horizontal: "center",
      vertical: "stretch",
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
      vertical: 4,
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
    isLabelHidden: 24,
  },
  paddingY: 0,
  borderStyle: "none",
  borderRadius: "sm",
  color: {
    default: baseColor("neutral-subdued"),
    isSelected: baseColor("neutral"),
    isDisabled: "disabled",
  },
  cursor: {
    default: "default",
    isDisabled: "not-allowed",
  },
  userSelect: "none",
  whiteSpace: "nowrap",
  textDecoration: "none",
  flexShrink: 0,
  outlineStyle: "none",
  forcedColorAdjust: "none",
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
  },
  borderRadius: "full",
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
  left: 0,
  insetStart: {
    orientation: {
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
  color: "gray-800" as never,
  outlineStyle: "none",
  minWidth: 0,
  minHeight: 0,
  flexGrow: 1,
  display: {
    default: "block",
    isInert: "none",
  },
  marginTop: {
    orientation: {
      horizontal: 4,
      vertical: 0,
    },
  },
  marginStart: {
    orientation: {
      horizontal: 0,
      vertical: 16,
    },
  },
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
      >
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
  const [local, headlessProps] = splitProps(props, [
    "children",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "slot",
  ]);
  const className = (renderProps: TabListRenderProps) =>
    [
      "solidaria-TabList",
      local.UNSAFE_className,
      local.class,
      mergeStyles(
        tabList({
          orientation: renderProps.orientation,
          density: context.density,
          isDisabled: renderProps.isDisabled,
          isLabelHidden: context.labelBehavior === "hide",
        }),
        local.styles,
      ),
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <HeadlessTabList
      {...headlessProps}
      aria-label={headlessProps["aria-label"] ?? context.ariaLabel}
      aria-labelledby={headlessProps["aria-labelledby"] ?? context.ariaLabelledBy}
      slot={local.slot ?? undefined}
      class={className}
      style={local.UNSAFE_style}
    >
      {local.children}
    </HeadlessTabList>
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
  const [local, headlessProps] = splitProps(props, [
    "children",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "slot",
  ]);
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

  return (
    <HeadlessTabPanel
      {...headlessProps}
      slot={local.slot ?? undefined}
      class={className}
      style={local.UNSAFE_style}
    >
      {local.children}
    </HeadlessTabPanel>
  );
}

Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panels = TabPanels;
Tabs.Panel = TabPanel;

export { Collection } from "@proyecto-viviana/solidaria-components";
export { Text } from "../text";
export type { Key, KeyboardActivation, TabOrientation };
