import { type JSX, createContext, mergeProps, Show, splitProps, useContext } from "solid-js";
import {
  ColorSwatch as HeadlessColorSwatch,
  ColorSwatchPicker as HeadlessColorSwatchPicker,
  ColorSwatchPickerItem as HeadlessColorSwatchPickerItem,
  type ColorSwatchRenderProps,
  type ColorSwatchPickerItemProps as HeadlessColorSwatchPickerItemProps,
  type ColorSwatchPickerItemRenderProps,
  type ColorSwatchPickerProps as HeadlessColorSwatchPickerProps,
  type ColorSwatchPickerRenderProps,
} from "@proyecto-viviana/solidaria-components";
import type { Color } from "@proyecto-viviana/solid-stately";
import { focusRing, space, style } from "../style" with { type: "macro" };
import type { StylesProp, UnsafeClassName } from "../s2-internal/style-utils";
import { getAllowedOverrides } from "../s2-internal/style-utils" with { type: "macro" };
import { useProviderProps } from "../provider";
import {
  getSlottedContextProps,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type SpectrumContextValue,
} from "../button/spectrum-context";
import {
  InternalColorSwatchContext,
  type InternalColorSwatchRounding,
  type InternalColorSwatchSize,
} from "./color-swatch-internal";

export type ColorSwatchPickerSize = InternalColorSwatchSize;
export type ColorSwatchPickerDensity = "compact" | "regular" | "spacious";
export type ColorSwatchPickerRounding = "none" | "default" | "full";

export type SwatchPickerSize = ColorSwatchPickerSize;
export type SwatchPickerDensity = ColorSwatchPickerDensity;
export type SwatchPickerRounding = ColorSwatchPickerRounding;

export interface ColorSwatchPickerProps extends Omit<
  HeadlessColorSwatchPickerProps,
  "class" | "style" | "layout" | "slot"
> {
  /** The ColorSwatches within the ColorSwatchPicker. */
  children: JSX.Element;
  /**
   * The amount of padding between the swatches.
   * @default 'regular'
   */
  density?: ColorSwatchPickerDensity;
  /**
   * The size of the color swatches.
   * @default 'M'
   */
  size?: ColorSwatchPickerSize;
  /**
   * The corner rounding of the color swatches.
   * @default 'none'
   */
  rounding?: ColorSwatchPickerRounding;
  /** Spectrum-defined generated classes. */
  styles?: StylesProp;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  /** A slot name for the component. */
  slot?: string | null;
}

export interface ColorSwatchPickerItemProps extends Omit<
  HeadlessColorSwatchPickerItemProps,
  "class" | "style"
> {
  /** Additional CSS class name. */
  class?: string;
}

interface ColorSwatchPickerStyleProps extends Partial<ColorSwatchPickerRenderProps> {
  density?: ColorSwatchPickerDensity;
}

interface ColorSwatchPickerItemStyleProps extends Partial<ColorSwatchPickerItemRenderProps> {
  rounding?: ColorSwatchPickerRounding;
}

interface PickerColorSwatchStyleProps extends Partial<ColorSwatchRenderProps> {
  size?: ColorSwatchPickerSize;
  rounding?: ColorSwatchPickerRounding;
}

const colorSwatchPickerRoot = style<ColorSwatchPickerStyleProps>(
  {
    display: "flex",
    flexWrap: "wrap",
    gap: {
      density: {
        compact: space(2),
        regular: 4,
        spacious: space(6),
      },
    },
  },
  getAllowedOverrides(),
);

const colorSwatchPickerItemRoot = style<ColorSwatchPickerItemStyleProps>({
  ...focusRing(),
  position: "relative",
  borderRadius: {
    rounding: {
      none: "none",
      default: "sm",
      full: "full",
    },
  },
  disableTapHighlight: true,
});

const colorSwatchPickerSelectedOverlay = style({
  position: "absolute",
  pointerEvents: "none",
  inset: 0,
  boxSizing: "border-box",
  borderColor: "gray-900",
  borderStyle: "solid",
  borderWidth: 2,
  outlineColor: "gray-25",
  outlineStyle: "solid",
  outlineWidth: 2,
  outlineOffset: -4,
  forcedColorAdjust: "none",
  borderRadius: "inherit",
});

const pickerColorSwatchRoot = style<PickerColorSwatchStyleProps>(
  {
    width: {
      size: {
        XS: 16,
        S: 24,
        M: 32,
        L: 40,
      },
    },
    height: {
      size: {
        XS: 16,
        S: 24,
        M: 32,
        L: 40,
      },
    },
    borderRadius: {
      rounding: {
        default: "sm",
        none: "none",
        full: "full",
      },
    },
    borderColor: "gray-1000/42",
    borderWidth: 1,
    borderStyle: "solid",
    boxSizing: "border-box",
    forcedColorAdjust: "none",
    "--slash-color": {
      type: "color",
      value: "red-900",
    },
  },
  getAllowedOverrides({ height: true }),
);

export const ColorSwatchPickerContext =
  createContext<SpectrumContextValue<ColorSwatchPickerProps>>(null);

function getColorSwatchStyle(renderProps: ColorSwatchRenderProps): JSX.CSSProperties {
  const swatchColor = renderProps.color;
  const colorValue = swatchColor.toString("css");
  const background =
    swatchColor.getChannelValue("alpha") > 0
      ? `linear-gradient(${colorValue}, ${colorValue}), repeating-conic-gradient(#e6e6e6 0% 25%, white 0% 50%) 0% 50% / 16px 16px`
      : "linear-gradient(to bottom right, transparent calc(50% - 2px), var(--slash-color) calc(50% - 2px) calc(50% + 2px), transparent calc(50% + 2px)) no-repeat";

  return { background };
}

/**
 * A ColorSwatchPicker displays a list of color swatches and allows a user to select one of them.
 */
export function ColorSwatchPicker(props: ColorSwatchPickerProps): JSX.Element {
  const providerProps = useProviderProps(props);
  const contextProps = getSlottedContextProps(useContext(ColorSwatchPickerContext), props.slot);
  const mergedProps = mergeProps(providerProps, contextProps ?? {}, props);
  const [local, headlessProps] = splitProps(mergedProps, [
    "density",
    "size",
    "rounding",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "children",
    "slot",
  ]);

  const density = () => local.density ?? "regular";
  const size = () => local.size ?? "M";
  const rounding = () => local.rounding ?? "none";
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const unsafeClassName = () =>
    [contextProps?.UNSAFE_className, local.UNSAFE_className, local.class].filter(Boolean).join(" ");

  const useWrapper = (
    swatch: JSX.Element,
    color: () => Color,
    swatchRounding: () => InternalColorSwatchRounding,
  ) => (
    <HeadlessColorSwatchPickerItem
      color={color()}
      class={(renderProps) =>
        colorSwatchPickerItemRoot({
          ...renderProps,
          rounding: swatchRounding(),
        })
      }
    >
      {(renderProps) => (
        <>
          {swatch}
          <Show when={renderProps.isSelected}>
            <div aria-hidden="true" class={colorSwatchPickerSelectedOverlay} />
          </Show>
        </>
      )}
    </HeadlessColorSwatchPickerItem>
  );

  return (
    <HeadlessColorSwatchPicker
      {...headlessProps}
      class={(renderProps) =>
        [
          unsafeClassName(),
          colorSwatchPickerRoot(
            {
              ...renderProps,
              density: density(),
            },
            mergedStyles(),
          ),
        ]
          .filter(Boolean)
          .join(" ")
      }
      style={mergedUnsafeStyle()}
    >
      <InternalColorSwatchContext.Provider
        value={{
          useWrapper,
          size: size(),
          rounding: rounding(),
        }}
      >
        {local.children}
      </InternalColorSwatchContext.Provider>
    </HeadlessColorSwatchPicker>
  );
}

/**
 * Compatibility helper for callers that still compose picker items manually.
 * The public S2 API composes ColorSwatchPicker with ColorSwatch children.
 */
export function ColorSwatchPickerItem(props: ColorSwatchPickerItemProps): JSX.Element {
  const pickerContext = useContext(InternalColorSwatchContext);
  const [local, headlessProps] = splitProps(props, ["class", "children", "color"]);
  const size = () => pickerContext?.size ?? "M";
  const rounding = () => pickerContext?.rounding ?? "none";

  const renderChildren = (renderProps: ColorSwatchPickerItemRenderProps) => {
    const children = local.children;

    if (typeof children === "function") {
      return children(renderProps);
    }

    return (
      children ?? (
        <HeadlessColorSwatch
          color={local.color}
          class={(swatchRenderProps) =>
            pickerColorSwatchRoot({
              ...swatchRenderProps,
              size: size(),
              rounding: rounding(),
            })
          }
          style={getColorSwatchStyle}
        />
      )
    );
  };

  return (
    <HeadlessColorSwatchPickerItem
      {...headlessProps}
      color={local.color}
      class={(renderProps) =>
        [
          local.class,
          colorSwatchPickerItemRoot({
            ...renderProps,
            rounding: rounding(),
          }),
        ]
          .filter(Boolean)
          .join(" ")
      }
    >
      {(renderProps) => (
        <>
          <InternalColorSwatchContext.Provider value={null}>
            {renderChildren(renderProps)}
          </InternalColorSwatchContext.Provider>
          <Show when={renderProps.isSelected}>
            <div aria-hidden="true" class={colorSwatchPickerSelectedOverlay} />
          </Show>
        </>
      )}
    </HeadlessColorSwatchPickerItem>
  );
}
