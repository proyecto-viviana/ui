import {
  children as resolveChildren,
  createContext,
  type JSX,
  mergeProps,
  onMount,
  splitProps,
  useContext,
} from "solid-js";
import {
  SelectionIndicator,
  SharedElementTransition,
  ToggleButton as HeadlessToggleButton,
  ToggleButtonGroup as HeadlessToggleButtonGroup,
  useToggleButtonGroupStateContext,
  type ToggleButtonProps as HeadlessToggleButtonProps,
  type ToggleButtonGroupProps as HeadlessToggleButtonGroupProps,
  type ToggleButtonRenderProps,
} from "@proyecto-viviana/solidaria-components";
import type { Key } from "@proyecto-viviana/solid-stately";
import type { StyleString } from "../style";
import { baseColor, fontRelative, focusRing, style } from "../style";
import { mergeStyles } from "../style/runtime";
import { control } from "../s2-internal/style-utils";
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

export interface SegmentedControlProps extends Omit<
  HeadlessToggleButtonGroupProps,
  | "children"
  | "class"
  | "style"
  | "selectionMode"
  | "selectedKeys"
  | "defaultSelectedKeys"
  | "onSelectionChange"
  | "orientation"
  | "slot"
  | "ref"
> {
  /** The content to display in the segmented control. */
  children?: JSX.Element;
  /** Whether the items should divide the container width equally. */
  isJustified?: boolean;
  /** The id of the currently selected item. */
  selectedKey?: Key | null;
  /** The id of the initially selected item. */
  defaultSelectedKey?: Key;
  /** Handler that is called when the selection changes. */
  onSelectionChange?: (id: Key) => void;
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
  /** Ref for the underlying radiogroup element. */
  ref?: RefLike<HTMLDivElement>;
}

export interface SegmentedControlItemProps extends Omit<
  HeadlessToggleButtonProps,
  "children" | "class" | "style" | "isSelected" | "defaultSelected" | "onChange"
> {
  /** The id of the item, matching the value used in SegmentedControl's selectedKey prop. */
  id: Key;
  /** The content to display in the segmented control item. */
  children?: JSX.Element;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
}

export const SegmentedControlContext =
  createContext<SpectrumContextValue<SegmentedControlProps>>(null);

interface InternalSegmentedControlContextValue {
  register?: (id: Key) => void;
  isJustified?: boolean;
}

const InternalSegmentedControlContext = createContext<InternalSegmentedControlContextValue>({});

const segmentedControl = style({
  display: "flex",
  gap: 4,
  backgroundColor: "[light-dark(rgb(233, 233, 233), rgb(44, 44, 44))]",
  borderRadius: "default",
  width: "fit",
});

const segmentedControlItem = style<ToggleButtonRenderProps & { isJustified?: boolean }>({
  ...focusRing(),
  ...control({ shape: "default", icon: true }),
  justifyContent: "center",
  position: "relative",
  borderStyle: "none",
  backgroundColor: "transparent",
  color: {
    default: baseColor("neutral-subdued"),
    isSelected: baseColor("neutral"),
    isDisabled: "disabled",
  },
  cursor: {
    default: "default",
    isDisabled: "not-allowed",
  },
  flexGrow: {
    isJustified: 1,
  },
  flexBasis: {
    isJustified: 0,
  },
  flexShrink: 0,
  whiteSpace: "nowrap",
  userSelect: "none",
  forcedColorAdjust: "none",
  zIndex: {
    default: 1,
    isSelected: 0,
  },
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
});

const selectionIndicator = style<{ isDisabled?: boolean }>({
  position: "absolute",
  top: 0,
  left: 0,
  width: "full",
  height: "full",
  contain: "strict",
  transition: "[translate,width]",
  transitionDuration: 200,
  transitionTimingFunction: "out",
  boxSizing: "border-box",
  borderStyle: "solid",
  borderWidth: 2,
  borderColor: {
    default: "[light-dark(rgb(19, 19, 19), rgb(242, 242, 242))]",
    isDisabled: "disabled",
  },
  borderRadius: "lg",
  backgroundColor: {
    default: "[light-dark(rgb(255, 255, 255), rgb(17, 17, 17))]",
    forcedColors: "Highlight",
    isDisabled: "GrayText",
  },
  pointerEvents: "none",
});

const itemContent = style({
  position: "relative",
  zIndex: 1,
  display: "flex",
  gap: "text-to-visual",
  alignItems: "center",
  minWidth: 0,
  transition: "default",
});

const itemText = style({
  order: 1,
  truncate: true,
});

/**
 * A SegmentedControl is a mutually exclusive group of buttons used for view switching.
 */
export function SegmentedControl(props: SegmentedControlProps): JSX.Element {
  const providerProps = useProviderProps(props);
  const contextProps = getSlottedContextProps(useContext(SegmentedControlContext), props.slot);
  const merged = mergeProps(providerProps, contextProps ?? {}, props);
  const [local, headlessProps] = splitProps(merged, [
    "children",
    "isJustified",
    "selectedKey",
    "defaultSelectedKey",
    "onSelectionChange",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "slot",
    "ref",
  ]);

  const selectedKeys = () => (local.selectedKey != null ? [local.selectedKey] : undefined);
  const defaultSelectedKeys = () =>
    local.defaultSelectedKey != null ? [local.defaultSelectedKey] : undefined;
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const assignRef = mergeContextRefs(
    (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
    props.ref,
  );
  const className = () =>
    [
      contextProps?.UNSAFE_className,
      props.UNSAFE_className,
      props.class,
      mergeStyles(segmentedControl.toString() as StyleString, mergedStyles()),
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <HeadlessToggleButtonGroup
      {...headlessProps}
      selectionMode="single"
      disallowEmptySelection
      orientation="horizontal"
      selectedKeys={selectedKeys()}
      defaultSelectedKeys={defaultSelectedKeys()}
      onSelectionChange={(keys) => {
        const firstKey = keys.values().next().value;
        if (firstKey != null) {
          local.onSelectionChange?.(firstKey);
        }
      }}
      ref={(element) => assignRef(element)}
      slot={local.slot ?? undefined}
      class={className()}
      style={mergedUnsafeStyle()}
      data-justified={local.isJustified ? "true" : undefined}
      data-disabled={headlessProps.isDisabled ? "true" : undefined}
    >
      {() => (
        <SharedElementTransition>
          <DefaultSelectionTracker
            defaultSelectedKey={local.defaultSelectedKey}
            selectedKey={local.selectedKey}
            isJustified={local.isJustified}
          >
            {local.children}
          </DefaultSelectionTracker>
        </SharedElementTransition>
      )}
    </HeadlessToggleButtonGroup>
  );
}

function DefaultSelectionTracker(props: {
  children?: JSX.Element;
  defaultSelectedKey?: Key;
  selectedKey?: Key | null;
  isJustified?: boolean;
}): JSX.Element {
  const state = useToggleButtonGroupStateContext();
  let isRegistered = props.defaultSelectedKey != null || props.selectedKey != null;

  const contextValue: InternalSegmentedControlContextValue = {
    register(id: Key) {
      if (!state || isRegistered) {
        return;
      }
      isRegistered = true;
      state.toggleKey(id);
    },
    get isJustified() {
      return props.isJustified;
    },
  };

  return (
    <InternalSegmentedControlContext.Provider value={contextValue}>
      {props.children}
    </InternalSegmentedControlContext.Provider>
  );
}

/**
 * A SegmentedControlItem represents an option within a SegmentedControl.
 */
export function SegmentedControlItem(props: SegmentedControlItemProps): JSX.Element {
  const context = useContext(InternalSegmentedControlContext);
  const [local, headlessProps] = splitProps(props, [
    "children",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "id",
  ]);
  let buttonElement: HTMLButtonElement | undefined;

  onMount(() => context.register?.(local.id));

  const getClassName = (renderProps: ToggleButtonRenderProps): string =>
    [
      local.UNSAFE_className,
      local.class,
      mergeStyles(
        segmentedControlItem({
          ...renderProps,
          isJustified: context.isJustified,
        }),
        local.styles,
      ),
    ]
      .filter(Boolean)
      .join(" ");

  const getStyle = (renderProps: ToggleButtonRenderProps): JSX.CSSProperties => {
    const style = { ...(local.UNSAFE_style ?? {}) } as JSX.CSSProperties;
    const styleRecord = style as Record<string, string | number | undefined>;
    const willChange = styleRecord["will-change"] ?? "";
    styleRecord["will-change"] = `${willChange} transform`.trim();

    if (renderProps.isPressed && buttonElement) {
      const { width, height } = buttonElement.getBoundingClientRect();
      const perspective = Math.max(height, width / 3, 24);
      const transform = style.transform ?? "";
      style.transform = `${transform} perspective(${perspective}px) translate3d(0, 0, -2px)`.trim();
    }

    return style;
  };

  function SegmentContent(renderProps: ToggleButtonRenderProps) {
    const resolvedChildren = resolveChildren(() => local.children);
    const content = () => resolvedChildren();
    const iconContextValue = {
      slot: "icon",
      render: centerBaseline({ slot: "icon", styles: style({ order: 0, flexShrink: 0 }) }),
      styles: style({
        size: fontRelative(20),
        flexShrink: 0,
      }),
    };

    return (
      <>
        <SelectionIndicator
          isSelected={renderProps.isSelected}
          class={selectionIndicator({ isDisabled: renderProps.isDisabled })}
        />
        <IconContext.Provider value={iconContextValue}>
          <span class={itemContent}>
            {typeof content() === "string" ? (
              <span class={itemText} data-rsp-slot="text">
                {content()}
              </span>
            ) : (
              content()
            )}
          </span>
        </IconContext.Provider>
      </>
    );
  }

  return (
    <HeadlessToggleButton
      {...headlessProps}
      id={local.id}
      ref={(element: HTMLButtonElement) => {
        buttonElement = element;
      }}
      class={getClassName}
      style={getStyle}
      data-segmented-control-item=""
    >
      {(renderProps) => <SegmentContent {...renderProps} />}
    </HeadlessToggleButton>
  );
}
