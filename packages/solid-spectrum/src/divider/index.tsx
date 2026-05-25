import { type JSX, createContext, mergeProps, splitProps, useContext } from "solid-js";
import {
  Separator as HeadlessSeparator,
  type SeparatorProps as HeadlessSeparatorProps,
} from "@proyecto-viviana/solidaria-components";
import type { StyleString } from "../style";
import { style } from "../style" with { type: "macro" };
import type { UnsafeClassName } from "../s2-internal/style-utils";
import {
  getAllowedOverrides,
  staticColor,
} from "../s2-internal/style-utils" with { type: "macro" };
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";

export type DividerSize = "S" | "M" | "L";
export type DividerOrientation = "horizontal" | "vertical";
export type DividerStaticColor = "white" | "black" | "auto";

export interface DividerProps extends Omit<
  HeadlessSeparatorProps,
  "class" | "style" | "elementType" | "slot" | "ref"
> {
  /**
   * How thick the Divider should be.
   * @default 'M'
   */
  size?: DividerSize;
  /**
   * The orientation of the Divider.
   * @default 'horizontal'
   */
  orientation?: DividerOrientation;
  /** The static color style to apply when the Divider appears over a color background. */
  staticColor?: DividerStaticColor;
  /** Spectrum-defined generated classes. */
  styles?: StyleString | (() => StyleString | undefined);
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  slot?: string | null;
  ref?: RefLike<HTMLElement>;
}

export const DividerContext = createContext<SpectrumContextValue<DividerProps>>(null);

const dividerStyles = style<{
  size: DividerSize;
  orientation: DividerOrientation;
  staticColor?: DividerStaticColor;
  isStaticColor: boolean;
}>(
  {
    ...staticColor(),
    alignSelf: "stretch",
    backgroundColor: {
      default: "gray-200",
      size: {
        L: "gray-800",
      },
      isStaticColor: {
        default: "transparent-overlay-200",
        size: {
          L: "transparent-overlay-800",
        },
      },
      forcedColors: "ButtonBorder",
    },
    borderStyle: "none",
    borderRadius: "full",
    margin: 0,
    flexGrow: 0,
    flexShrink: 0,
    height: {
      orientation: {
        horizontal: {
          default: "[2px]",
          size: {
            S: "[1px]",
            L: "[4px]",
          },
        },
      },
    },
    width: {
      orientation: {
        vertical: {
          default: "[2px]",
          size: {
            S: "[1px]",
            L: "[4px]",
          },
        },
      },
    },
  },
  getAllowedOverrides(),
);

/**
 * Dividers bring clarity to a layout by grouping and dividing content in close proximity.
 */
export function Divider(props: DividerProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(DividerContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props);
  const [local, separatorProps] = splitProps(merged, [
    "size",
    "orientation",
    "staticColor",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "slot",
    "ref",
  ]);
  const size = () => local.size ?? "M";
  const orientation = () => local.orientation ?? "horizontal";
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);

  return (
    <HeadlessSeparator
      {...separatorProps}
      ref={mergeContextRefs(
        (contextProps as { ref?: RefLike<HTMLElement> } | null)?.ref,
        props.ref,
      )}
      orientation={orientation()}
      class={[
        contextProps?.UNSAFE_className,
        local.UNSAFE_className,
        dividerStyles(
          {
            size: size(),
            orientation: orientation(),
            staticColor: local.staticColor,
            isStaticColor: !!local.staticColor,
          },
          mergedStyles(),
        ),
      ]
        .filter(Boolean)
        .join(" ")}
      style={mergedUnsafeStyle()}
      slot={local.slot ?? undefined}
    />
  );
}
