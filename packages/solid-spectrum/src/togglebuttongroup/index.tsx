import { type JSX, mergeProps, splitProps } from "solid-js";
import {
  ToggleButtonGroup as HeadlessToggleButtonGroup,
  type ToggleButtonGroupProps as HeadlessToggleButtonGroupProps,
} from "@proyecto-viviana/solidaria-components";
import type { StyleString } from "../s2-style";
import { useProviderProps } from "../provider";
import {
  type ActionButtonDensity,
  type ActionButtonOrientation,
  type ActionButtonSize,
  ToggleButtonGroupContext,
  useToggleButtonGroupContext,
} from "../button/group-context";
import { s2ActionButtonGroup } from "../button/s2-action-button-styles";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
} from "../button/spectrum-context";
import type { StaticColor } from "../button/types";

export interface ToggleButtonGroupProps extends Omit<
  HeadlessToggleButtonGroupProps,
  "class" | "style" | "children"
> {
  /** The ToggleButtons contained within the group. */
  children?: JSX.Element;
  /** Size of the buttons. @default 'M' */
  size?: ActionButtonSize;
  /** Spacing between the buttons. @default 'regular' */
  density?: ActionButtonDensity;
  /** Whether the buttons should be displayed with a quiet style. */
  isQuiet?: boolean;
  /** Whether the selected ToggleButtons should be emphasized. */
  isEmphasized?: boolean;
  /** Whether the buttons should divide the container width equally. */
  isJustified?: boolean;
  /** The static color style to apply. Useful when the group appears over a color background. */
  staticColor?: StaticColor;
  /** The axis the group should align with. @default 'horizontal' */
  orientation?: ActionButtonOrientation;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
}

/**
 * A ToggleButtonGroup is a grouping of related ToggleButtons with single or multiple selection.
 */
export function ToggleButtonGroup(props: ToggleButtonGroupProps): JSX.Element {
  const providerProps = useProviderProps(props);
  const contextProps = getSlottedContextProps(useToggleButtonGroupContext(), props.slot);
  const defaultProps: Partial<ToggleButtonGroupProps> = {
    density: "regular",
    size: "M",
    orientation: "horizontal",
  };
  const merged = mergeProps(defaultProps, providerProps, contextProps ?? {}, props);
  const [local, headlessProps] = splitProps(merged, [
    "children",
    "size",
    "density",
    "isQuiet",
    "isEmphasized",
    "isJustified",
    "staticColor",
    "orientation",
    "isDisabled",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "ref",
  ]);

  const size = (): ActionButtonSize => local.size ?? "M";
  const density = (): ActionButtonDensity => local.density ?? "regular";
  const orientation = (): ActionButtonOrientation => local.orientation ?? "horizontal";
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
      local.class,
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
    get isEmphasized() {
      return local.isEmphasized;
    },
    get staticColor() {
      return local.staticColor;
    },
    get isDisabled() {
      return local.isDisabled;
    },
  };

  return (
    <HeadlessToggleButtonGroup
      {...headlessProps}
      orientation={orientation()}
      isDisabled={local.isDisabled}
      ref={assignGroupRefs}
      class={className()}
      style={mergedUnsafeStyle()}
      data-orientation={orientation()}
      data-density={density()}
      data-disabled={local.isDisabled || undefined}
    >
      {() => (
        <ToggleButtonGroupContext.Provider value={contextValue}>
          {local.children}
        </ToggleButtonGroupContext.Provider>
      )}
    </HeadlessToggleButtonGroup>
  );
}
