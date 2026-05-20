import { type JSX, mergeProps, splitProps } from "solid-js";
import { Toolbar as HeadlessToolbar } from "@proyecto-viviana/solidaria-components";
import type { StyleString } from "../s2-style";
import {
  ActionButtonGroupContext,
  type ActionButtonDensity,
  type ActionButtonOrientation,
  type ActionButtonSize,
  useActionButtonGroupContext,
} from "../button/group-context";
import { s2ActionButtonGroup } from "../button/s2-action-button-styles";
import { useProviderProps } from "../provider";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
} from "../button/spectrum-context";
import type { StaticColor } from "../button/types";

export interface ActionButtonGroupProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "style" | "children"
> {
  /** The children of the group. */
  children?: JSX.Element;
  /** Size of the buttons. @default 'M' */
  size?: ActionButtonSize;
  /** Spacing between the buttons. @default 'regular' */
  density?: ActionButtonDensity;
  /** Whether the buttons should be displayed with a quiet style. */
  isQuiet?: boolean;
  /** Whether the buttons should divide the container width equally. */
  isJustified?: boolean;
  /** The static color style to apply. Useful when the group appears over a color background. */
  staticColor?: StaticColor;
  /** The axis the group should align with. @default 'horizontal' */
  orientation?: ActionButtonOrientation;
  /** Whether the group is disabled. */
  isDisabled?: boolean;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
}

/**
 * An ActionButtonGroup is a grouping of related ActionButtons.
 */
export function ActionButtonGroup(props: ActionButtonGroupProps): JSX.Element {
  const providerProps = useProviderProps(props);
  const contextProps = getSlottedContextProps(useActionButtonGroupContext(), props.slot);
  const merged = mergeProps(providerProps, contextProps ?? {}, props);
  const [local, domProps] = splitProps(merged, [
    "children",
    "size",
    "density",
    "isQuiet",
    "isJustified",
    "staticColor",
    "orientation",
    "isDisabled",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "ref",
  ]);
  const size = () => local.size ?? "M";
  const density = () => local.density ?? "regular";
  const orientation = () => local.orientation ?? "horizontal";
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const assignGroupRefs = mergeContextRefs(
    (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
    props.ref as RefLike<HTMLDivElement>,
  );
  const className = () =>
    [
      local.UNSAFE_className,
      s2ActionButtonGroup(
        {
          size: size(),
          density: density(),
          orientation: orientation(),
          isJustified: local.isJustified,
        },
        mergedStyles(),
      ),
    ]
      .filter(Boolean)
      .join(" ");

  const contextValue = {
    get size() {
      return size();
    },
    get density() {
      return density();
    },
    get orientation() {
      return orientation();
    },
    get isQuiet() {
      return local.isQuiet;
    },
    get isJustified() {
      return local.isJustified;
    },
    get staticColor() {
      return local.staticColor;
    },
    get isDisabled() {
      return local.isDisabled;
    },
  };

  return (
    <HeadlessToolbar
      {...domProps}
      orientation={orientation()}
      ref={assignGroupRefs}
      class={className()}
      style={mergedUnsafeStyle()}
      data-orientation={orientation()}
    >
      <ActionButtonGroupContext.Provider value={contextValue}>
        {local.children}
      </ActionButtonGroupContext.Provider>
    </HeadlessToolbar>
  );
}
