import {
  type JSX,
  splitProps,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  onCleanup,
  useContext,
  Show,
} from "solid-js";
import { Portal } from "solid-js/web";
import { useLocale } from "@proyecto-viviana/solidaria";
import {
  ColorSlider as HeadlessColorSlider,
  ColorSliderLabel as HeadlessColorSliderLabel,
  ColorSliderOutput as HeadlessColorSliderOutput,
  ColorSliderTrack as HeadlessColorSliderTrack,
  ColorSliderThumb as HeadlessColorSliderThumb,
  ColorSliderContext as HeadlessColorSliderContext,
  ColorArea as HeadlessColorArea,
  ColorAreaThumb as HeadlessColorAreaThumb,
  ColorAreaContext as HeadlessColorAreaContext,
  ColorWheel as HeadlessColorWheel,
  ColorWheelTrack as HeadlessColorWheelTrack,
  ColorWheelThumb as HeadlessColorWheelThumb,
  ColorField as HeadlessColorField,
  ColorFieldInput as HeadlessColorFieldInput,
  ColorFieldContext as HeadlessColorFieldContext,
  ColorSwatch as HeadlessColorSwatch,
  ColorSwatchContext as HeadlessColorSwatchContext,
  type ColorSliderProps as HeadlessColorSliderProps,
  type ColorAreaProps as HeadlessColorAreaProps,
  type ColorWheelProps as HeadlessColorWheelProps,
  type ColorFieldProps as HeadlessColorFieldProps,
  type ColorSwatchProps as HeadlessColorSwatchProps,
  type ColorSliderRenderProps,
  type ColorSliderTrackRenderProps,
  type ColorSliderThumbRenderProps,
  type ColorAreaRenderProps,
  type ColorAreaThumbRenderProps,
  type ColorWheelRenderProps,
  type ColorWheelThumbRenderProps,
  type ColorFieldRenderProps,
  type ColorSwatchRenderProps,
} from "@proyecto-viviana/solidaria-components";
import type {
  Color,
  ColorAxes,
  ColorChannel,
  ColorChannelRange,
  ColorFormat,
  ColorSpace,
} from "@proyecto-viviana/solid-stately";
import { baseColor, focusRing, fontRelative, style, type StyleString } from "../s2-style";
import { keyframes } from "../s2-style/style-macro";
import { mergeStyles } from "../s2-style/runtime";
import {
  control,
  controlFont,
  field,
  fieldInput,
  fieldLabel,
  getAllowedOverrides,
  type StylesProp,
  type StylesPropWithHeight,
  type UnsafeClassName,
} from "../s2-internal/style-utils";
import { CenterBaseline } from "../icon/center-baseline";
import AlertTriangleIcon from "../icon/s2wf-icons/AlertTriangleIcon";
import AsteriskIcon from "../icon/ui-icons/Asterisk";
import { useProviderProps } from "../provider";
import { useFormProps, useIsInForm } from "../form";

export type ColorSize = "sm" | "md" | "lg";

interface ColorContextValue {
  size: ColorSize;
}

const ColorSizeContext = createContext<ColorContextValue>({ size: "md" });

const sizeStyles = {
  sm: {
    slider: {
      track: "h-4 rounded",
      thumb: "w-4 h-4",
      label: "text-sm",
    },
    area: {
      container: "w-48 h-48",
      thumb: "w-4 h-4",
    },
    wheel: {
      container: "w-48 h-48",
      track: "stroke-[16px]",
      thumb: "w-4 h-4",
    },
    field: {
      input: "h-8 text-sm px-2",
      label: "text-sm",
    },
    swatch: "w-8 h-8",
  },
  md: {
    slider: {
      track: "h-6 rounded-md",
      thumb: "w-5 h-5",
      label: "text-base",
    },
    area: {
      container: "w-64 h-64",
      thumb: "w-5 h-5",
    },
    wheel: {
      container: "w-64 h-64",
      track: "stroke-[20px]",
      thumb: "w-5 h-5",
    },
    field: {
      input: "h-10 text-base px-3",
      label: "text-base",
    },
    swatch: "w-10 h-10",
  },
  lg: {
    slider: {
      track: "h-8 rounded-lg",
      thumb: "w-6 h-6",
      label: "text-lg",
    },
    area: {
      container: "w-80 h-80",
      thumb: "w-6 h-6",
    },
    wheel: {
      container: "w-80 h-80",
      track: "stroke-[24px]",
      thumb: "w-6 h-6",
    },
    field: {
      input: "h-12 text-lg px-4",
      label: "text-lg",
    },
    swatch: "w-12 h-12",
  },
};

interface ColorSliderStyleProps extends Partial<ColorSliderRenderProps> {}

const colorSliderRoot = style<ColorSliderStyleProps>(
  {
    width: {
      orientation: {
        horizontal: 192,
      },
    },
    height: {
      orientation: {
        vertical: 192,
      },
    },
    display: {
      orientation: {
        horizontal: "grid",
        vertical: "block",
      },
    },
    gridTemplateColumns: ["1fr", "auto"],
    gridTemplateAreas: ["label output", "track track"],
    rowGap: 4,
  },
  getAllowedOverrides(),
);

const colorSliderLabelWrapper = style<ColorSliderStyleProps>({
  gridArea: "label",
  display: "inline",
  cursor: {
    default: "default",
    isDisabled: "default",
  },
});

const colorSliderLabel = style<ColorSliderStyleProps>({
  ...fieldLabel(),
});

const colorSliderOutput = style<ColorSliderStyleProps>({
  gridArea: "output",
  font: controlFont(),
  cursor: "default",
  color: {
    default: "neutral-subdued",
    isDisabled: "disabled",
  },
});

const colorSliderTrack = style<ColorSliderTrackRenderProps>({
  gridArea: "track",
  width: {
    orientation: {
      horizontal: "full",
      vertical: 24,
    },
  },
  height: {
    orientation: {
      horizontal: 24,
      vertical: "full",
    },
  },
  borderRadius: "default",
  outlineColor: {
    default: "gray-1000/10" as never,
    forcedColors: "ButtonBorder",
  },
  outlineWidth: 1,
  outlineOffset: -1,
  outlineStyle: {
    default: "solid",
    isDisabled: "none",
  },
  backgroundColor: {
    isDisabled: "disabled",
  },
});

const colorSliderThumb = style<ColorSliderThumbRenderProps>({
  transition: "[width, height]",
  size: {
    default: 16,
    isFocusVisible: 32,
  },
  backgroundColor: {
    isDisabled: "disabled",
  },
  borderRadius: "full",
  boxSizing: "border-box",
  borderStyle: "solid",
  borderWidth: 2,
  borderColor: {
    default: "white",
    isDisabled: "disabled",
  },
  outlineStyle: "solid",
  outlineWidth: 1,
  outlineColor: {
    default: "black/42" as never,
    forcedColors: "ButtonBorder",
  },
});

export interface ColorSliderProps extends Omit<
  HeadlessColorSliderProps,
  "class" | "style" | "children"
> {
  /** Spectrum-defined generated classes. */
  styles?: StylesProp;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  /** Deprecated legacy size prop. ColorSlider uses the Spectrum 2 fixed track size. */
  size?: ColorSize;
  /** Deprecated legacy value visibility prop. Spectrum 2 shows horizontal output. */
  showValue?: boolean;
  /** Contextual help shown next to the visible label. */
  contextualHelp?: JSX.Element;
}

/**
 * A color slider allows users to adjust a single color channel.
 *
 * @example
 * ```tsx
 * const [color, setColor] = createSignal(parseColor('hsl(0, 100%, 50%)'))
 *
 * <ColorSlider
 *   channel="hue"
 *   value={color()}
 *   onChange={setColor}
 *   label="Hue"
 * />
 * ```
 */
export function ColorSlider(props: ColorSliderProps): JSX.Element {
  const mergedProps = useProviderProps(useFormProps(props));
  const [local, headlessProps] = splitProps(mergedProps, [
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "size",
    "showValue",
    "label",
    "contextualHelp",
  ]);
  const locale = useLocale();

  const orientation = () => headlessProps.orientation ?? "horizontal";
  const hasExplicitAriaLabel = () =>
    Boolean(headlessProps["aria-label"] || headlessProps["aria-labelledby"]);
  const hasVisibleLabel = () =>
    orientation() === "horizontal" &&
    (Boolean(local.label) || (local.label === undefined && !hasExplicitAriaLabel()));
  const labelForAria = () => (hasVisibleLabel() ? (local.label ?? " ") : undefined);
  const ariaLabel = () =>
    headlessProps["aria-label"] ??
    (orientation() === "vertical" && typeof local.label === "string" ? local.label : undefined);

  return (
    <HeadlessColorSlider
      {...headlessProps}
      label={labelForAria()}
      aria-label={ariaLabel()}
      class={(renderProps: ColorSliderRenderProps) =>
        [
          local.UNSAFE_className,
          local.class,
          colorSliderRoot(renderProps, mergeStyles(local.styles)),
        ]
          .filter(Boolean)
          .join(" ")
      }
      style={() => ({
        "grid-template-areas": '"label output" "track track"',
        ...local.UNSAFE_style,
      })}
    >
      {(renderProps: ColorSliderRenderProps) => (
        <>
          <Show when={hasVisibleLabel()}>
            <div class={colorSliderLabelWrapper(renderProps)} style={{ "grid-area": "label" }}>
              <HeadlessColorSliderLabel class={colorSliderLabel(renderProps)}>
                {local.label ??
                  renderProps.color.getChannelName(renderProps.channel, locale().locale)}
                <Show when={local.contextualHelp}>
                  <span data-slot="contextualHelp">{local.contextualHelp}</span>
                </Show>
              </HeadlessColorSliderLabel>
            </div>
          </Show>
          <Show when={renderProps.orientation === "horizontal"}>
            <HeadlessColorSliderOutput
              class={colorSliderOutput(renderProps)}
              style={{ "grid-area": "output" }}
            />
          </Show>
          <ColorSliderTrack>{() => <ColorSliderThumb />}</ColorSliderTrack>
        </>
      )}
    </HeadlessColorSlider>
  );
}

interface ColorSliderTrackProps {
  /** The children of the track. */
  children?: JSX.Element | ((renderProps: ColorSliderTrackRenderProps) => JSX.Element);
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
}

/**
 * The track component for a color slider.
 */
function ColorSliderTrack(props: ColorSliderTrackProps): JSX.Element {
  const [local, headlessProps] = splitProps(props, [
    "children",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
  ]);

  return (
    <HeadlessColorSliderTrack
      {...headlessProps}
      class={(renderProps: ColorSliderTrackRenderProps) =>
        [
          local.UNSAFE_className,
          local.class,
          mergeStyles(colorSliderTrack(renderProps), local.styles),
        ]
          .filter(Boolean)
          .join(" ")
      }
      style={(renderProps: ColorSliderTrackRenderProps) => {
        const background = renderProps.defaultStyle.background;
        return {
          "grid-area": "track",
          background:
            renderProps.isDisabled || !background
              ? undefined
              : `${background}, repeating-conic-gradient(#E1E1E1 0% 25%, white 0% 50%) 50% / 16px 16px`,
          ...local.UNSAFE_style,
        };
      }}
    >
      {local.children}
    </HeadlessColorSliderTrack>
  );
}

interface ColorSliderThumbProps {
  /** Custom thumb children. Defaults to the Spectrum 2 inner ring and drag loupe. */
  children?: JSX.Element | ((renderProps: ColorSliderThumbRenderProps) => JSX.Element);
  /** Ref callback for the thumb element. */
  ref?: (element: HTMLDivElement) => void;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
}

/**
 * The thumb component for a color slider.
 */
function ColorSliderThumb(props: ColorSliderThumbProps = {}): JSX.Element {
  const [local, headlessProps] = splitProps(props, [
    "children",
    "ref",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
  ]);
  let thumbElement: HTMLDivElement | undefined;

  return (
    <HeadlessColorSliderThumb
      {...headlessProps}
      ref={(element: HTMLDivElement) => {
        thumbElement = element;
        local.ref?.(element);
      }}
      class={(renderProps: ColorSliderThumbRenderProps) =>
        [
          local.UNSAFE_className,
          local.class,
          mergeStyles(colorSliderThumb(renderProps), local.styles),
        ]
          .filter(Boolean)
          .join(" ")
      }
      style={(renderProps: ColorSliderThumbRenderProps) => ({
        background: renderProps.isDisabled
          ? undefined
          : `linear-gradient(${renderProps.color.toString("css")}, ${renderProps.color.toString("css")}), repeating-conic-gradient(#E1E1E1 0% 25%, white 0% 50%) 50% / 16px 16px`,
        "background-color": undefined,
        ...local.UNSAFE_style,
      })}
    >
      {(renderProps: ColorSliderThumbRenderProps) =>
        typeof local.children === "function" ? (
          local.children(renderProps)
        ) : (
          <>
            {local.children ?? <div class={colorAreaThumbRing} />}
            <ColorAreaLoupe
              isOpen={renderProps.isDragging}
              color={renderProps.color}
              anchor={() => thumbElement}
            />
          </>
        )
      }
    </HeadlessColorSliderThumb>
  );
}

export interface ColorAreaProps extends Omit<
  HeadlessColorAreaProps,
  "class" | "style" | "children"
> {
  /** Spectrum-defined generated classes. */
  styles?: StylesPropWithHeight;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
}

const legacyColorAreaSizes: Record<ColorSize, string> = {
  sm: "12rem",
  md: "16rem",
  lg: "20rem",
};

const colorAreaRoot = style<ColorAreaRenderProps>(
  {
    position: "relative",
    size: 192,
    minSize: 64,
    borderRadius: "default",
    outlineColor: {
      default: "gray-1000/10" as never,
      forcedColors: "ButtonBorder",
    },
    outlineWidth: 1,
    outlineOffset: -1,
    outlineStyle: {
      default: "solid",
      isDisabled: "none",
    },
    backgroundColor: {
      isDisabled: "disabled",
    },
  },
  getAllowedOverrides({ height: true }),
);

const colorAreaThumb = style<ColorAreaThumbRenderProps>({
  transition: "[width, height]",
  size: {
    default: 16,
    isFocusVisible: 32,
  },
  backgroundColor: {
    isDisabled: "disabled",
  },
  borderRadius: "full",
  boxSizing: "border-box",
  borderStyle: "solid",
  borderWidth: 2,
  borderColor: {
    default: "white",
    isDisabled: "disabled",
  },
  outlineStyle: "solid",
  outlineWidth: 1,
  outlineColor: {
    default: "black/42" as never,
    forcedColors: "ButtonBorder",
  },
});

const colorAreaThumbRing = style({
  size: "full",
  borderRadius: "full",
  boxSizing: "border-box",
  borderStyle: "solid",
  borderWidth: 1,
  borderColor: {
    default: "black/42" as never,
    forcedColors: "ButtonBorder",
  },
});

const colorAreaLoupe = style({
  filter: "elevated",
  pointerEvents: "none",
  animationDuration: 125,
  animationFillMode: "forwards",
  animationTimingFunction: "in-out",
  isolation: "isolate",
});

const colorAreaLoupeEnterAnimation = keyframes(`
  from {
    transform: translateY(8px);
    opacity: 0;
  }
`);

const colorAreaLoupeExitAnimation = keyframes(`
  to {
    transform: translateY(8px);
    opacity: 0;
  }
`);

/**
 * A color area allows users to select a color by dragging in a 2D gradient.
 *
 * @example
 * ```tsx
 * const [color, setColor] = createSignal(parseColor('hsl(0, 100%, 50%)'))
 *
 * <ColorArea
 *   value={color()}
 *   onChange={setColor}
 *   xChannel="saturation"
 *   yChannel="lightness"
 * />
 * ```
 */
export function ColorArea(props: ColorAreaProps): JSX.Element {
  const [local, headlessProps] = splitProps(props, ["styles", "UNSAFE_className", "UNSAFE_style"]);

  return (
    <HeadlessColorArea
      {...headlessProps}
      class={(renderProps: ColorAreaRenderProps) =>
        [local.UNSAFE_className, colorAreaRoot(renderProps, mergeStyles(local.styles))]
          .filter(Boolean)
          .join(" ")
      }
      style={(renderProps: ColorAreaRenderProps) => ({
        ...renderProps.defaultStyle,
        background: renderProps.isDisabled ? undefined : renderProps.defaultStyle.background,
        position: undefined,
        ...local.UNSAFE_style,
      })}
    >
      {() => <ColorAreaThumb />}
    </HeadlessColorArea>
  );
}

/**
 * The thumb component for a color area.
 */
interface ColorAreaThumbProps {
  /** Custom thumb children. Defaults to the Spectrum 2 inner ring and drag loupe. */
  children?: JSX.Element | ((renderProps: ColorAreaThumbRenderProps) => JSX.Element);
  /** Ref callback for the thumb element. */
  ref?: (element: HTMLDivElement) => void;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
}

function ColorAreaThumb(props: ColorAreaThumbProps = {}): JSX.Element {
  const [local, headlessProps] = splitProps(props, [
    "children",
    "ref",
    "class",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
  ]);
  let thumbElement: HTMLDivElement | undefined;

  return (
    <HeadlessColorAreaThumb
      {...headlessProps}
      ref={(element: HTMLDivElement) => {
        thumbElement = element;
        local.ref?.(element);
      }}
      class={(renderProps: ColorAreaThumbRenderProps) =>
        [
          local.UNSAFE_className,
          local.class,
          mergeStyles(colorAreaThumb(renderProps), local.styles),
        ]
          .filter(Boolean)
          .join(" ")
      }
      style={(renderProps: ColorAreaThumbRenderProps) => ({
        background: renderProps.isDisabled
          ? undefined
          : `linear-gradient(${renderProps.color.toString("css")}, ${renderProps.color.toString("css")}), repeating-conic-gradient(#E1E1E1 0% 25%, white 0% 50%) 50% / 16px 16px`,
        "background-color": undefined,
        ...local.UNSAFE_style,
      })}
    >
      {(renderProps: ColorAreaThumbRenderProps) =>
        typeof local.children === "function" ? (
          local.children(renderProps)
        ) : (
          <>
            {local.children ?? <div class={colorAreaThumbRing} />}
            <ColorAreaLoupe
              isOpen={renderProps.isDragging}
              color={renderProps.color}
              anchor={() => thumbElement}
            />
          </>
        )
      }
    </HeadlessColorAreaThumb>
  );
}

function ColorAreaLoupe(props: {
  isOpen: boolean;
  color: Color;
  anchor: () => HTMLElement | undefined;
}): JSX.Element {
  const patternId = createUniqueId();
  const [phase, setPhase] = createSignal<"open" | "exiting" | "closed">(
    props.isOpen ? "open" : "closed",
  );
  const [rect, setRect] = createSignal<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  createEffect(() => {
    if (props.isOpen) {
      setPhase("open");
    } else if (phase() === "open") {
      setPhase("exiting");
    }
  });

  createEffect(() => {
    props.color.toString("css");

    if ((phase() === "closed" && !props.isOpen) || typeof window === "undefined") {
      setRect(null);
      return;
    }

    const update = () => {
      const element = props.anchor();
      if (!element) {
        setRect(null);
        return;
      }

      const next = element.getBoundingClientRect();
      setRect({
        top: next.top,
        left: next.left,
        width: next.width,
        height: next.height,
      });
    };

    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    onCleanup(() => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    });
  });

  return (
    <Show when={phase() !== "closed" && typeof document !== "undefined" && rect()}>
      {(currentRect) => {
        const loupeWidth = 48;
        const loupeHeight = 64;
        const borderWidth = 1;
        const handleSize = 16;
        const offset = 12;
        const r = currentRect();

        return (
          <Portal mount={document.body}>
            <svg
              aria-hidden="true"
              class={colorAreaLoupe}
              width={loupeWidth + borderWidth * 2}
              height={loupeHeight + borderWidth * 2}
              style={{
                position: "fixed",
                top: `${r.top + r.height / 2}px`,
                left: `${r.left + r.width / 2}px`,
                "margin-top": `${-loupeHeight - borderWidth * 2 - handleSize / 2 - offset}px`,
                "margin-left": `${-loupeWidth / 2 - borderWidth}px`,
                "animation-name":
                  phase() === "exiting"
                    ? colorAreaLoupeExitAnimation
                    : colorAreaLoupeEnterAnimation,
              }}
              onAnimationEnd={(event) => {
                if (phase() === "exiting" && event.animationName === colorAreaLoupeExitAnimation) {
                  setPhase("closed");
                }
              }}
            >
              <pattern
                id={patternId}
                x="0"
                y="0"
                width="16"
                height="16"
                patternUnits="userSpaceOnUse"
              >
                <rect fill="white" x="0" y="0" width="16" height="16" />
                <rect fill="#E1E1E1" x="0" y="0" width="8" height="8" />
                <rect fill="#E1E1E1" x="8" y="8" width="8" height="8" />
              </pattern>
              <path
                d="M25 1a24 24 0 0124 24c0 16.255-24 40-24 40S1 41.255 1 25A24 24 0 0125 1z"
                fill={`url(#${patternId})`}
              />
              <path
                d="M25 1a24 24 0 0124 24c0 16.255-24 40-24 40S1 41.255 1 25A24 24 0 0125 1z"
                fill={props.color.toString("css")}
              />
              <path
                d="M25 3A21.98 21.98 0 003 25c0 6.2 4 14.794 11.568 24.853A144.233 144.233 0 0025 62.132a144.085 144.085 0 0010.4-12.239C42.99 39.816 47 31.209 47 25A21.98 21.98 0 0025 3m0-2a24 24 0 0124 24c0 16.255-24 40-24 40S1 41.255 1 25A24 24 0 0125 1z"
                fill="white"
                stroke="rgba(0, 0, 0, 0.42)"
                stroke-width="1"
              />
            </svg>
          </Portal>
        );
      }}
    </Show>
  );
}

export interface ColorWheelProps extends Omit<
  HeadlessColorWheelProps,
  "class" | "style" | "children"
> {
  /** The size of the color wheel. */
  size?: ColorSize;
  /** Additional CSS class name. */
  class?: string;
}

/**
 * A color wheel allows users to select a hue by dragging around a circular track.
 *
 * @example
 * ```tsx
 * const [color, setColor] = createSignal(parseColor('hsl(0, 100%, 50%)'))
 *
 * <ColorWheel
 *   value={color()}
 *   onChange={setColor}
 * />
 * ```
 */
export function ColorWheel(props: ColorWheelProps): JSX.Element {
  const [local, headlessProps] = splitProps(props, ["size", "class"]);

  const size = () => local.size ?? "md";
  const styles = () => sizeStyles[size()];
  const customClass = local.class ?? "";

  const getClassName = (renderProps: ColorWheelRenderProps): string => {
    const base = `relative ${styles().wheel.container}`;
    let stateClass = "";
    if (renderProps.isDisabled) {
      stateClass = "opacity-50 cursor-not-allowed";
    }
    return [base, stateClass, customClass].filter(Boolean).join(" ");
  };

  const contextValue = createMemo(() => ({ size: size() }));

  return (
    <ColorSizeContext.Provider value={contextValue()}>
      <HeadlessColorWheel {...headlessProps} class={getClassName}>
        {() => (
          <>
            <ColorWheelTrack />
            <ColorWheelThumb />
          </>
        )}
      </HeadlessColorWheel>
    </ColorSizeContext.Provider>
  );
}

/**
 * The circular track for a color wheel.
 */
export function ColorWheelTrack(props: { class?: string }): JSX.Element {
  const context = useContext(ColorSizeContext);
  const styles = sizeStyles[context.size];
  const customClass = props.class ?? "";

  const className = `${styles.wheel.track} ${customClass}`;

  return <HeadlessColorWheelTrack class={className} />;
}

/**
 * The thumb component for a color wheel.
 */
export function ColorWheelThumb(props: { class?: string }): JSX.Element {
  const context = useContext(ColorSizeContext);
  const styles = sizeStyles[context.size];
  const customClass = props.class ?? "";

  const getClassName = (renderProps: ColorWheelThumbRenderProps): string => {
    const base = `${styles.wheel.thumb} rounded-full border-2 border-on-color shadow-md cursor-grab`;
    const dragClass = renderProps.isDragging ? "cursor-grabbing scale-110" : "";
    const focusClass = renderProps.isFocusVisible ? "ring-2 ring-accent-300 ring-offset-2" : "";
    const disabledClass = renderProps.isDisabled ? "cursor-not-allowed" : "";
    return [base, dragClass, focusClass, disabledClass, customClass].filter(Boolean).join(" ");
  };

  return <HeadlessColorWheelThumb class={getClassName} />;
}

export type ColorFieldSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg";
type S2ColorFieldSize = "S" | "M" | "L" | "XL";
export type ColorFieldLabelPosition = "top" | "side";
export type ColorFieldLabelAlign = "start" | "end";
export type ColorFieldNecessityIndicator = "icon" | "label";

interface ColorFieldStyleProps extends Partial<Omit<ColorFieldRenderProps, "color">> {
  size?: S2ColorFieldSize;
  labelPosition?: ColorFieldLabelPosition;
  labelAlign?: ColorFieldLabelAlign;
  isFocusWithin?: boolean;
  isStaticColor?: boolean;
  isInForm?: boolean;
  isQuiet?: boolean;
}

function createColorFieldStyles() {
  return {
    root: style<ColorFieldStyleProps>(
      {
        ...field(),
      },
      getAllowedOverrides(),
    ),
    labelWrapper: style<ColorFieldStyleProps>({
      gridArea: "label",
      display: "inline",
      textAlign: {
        labelAlign: {
          start: "start",
          end: "end",
        },
      },
      paddingBottom: {
        labelPosition: {
          top: "--field-gap",
        },
      },
      contain: {
        labelPosition: {
          top: "inline-size",
        },
        isQuiet: "none",
      },
    }),
    label: style<ColorFieldStyleProps>({
      ...fieldLabel(),
    }),
    group: style<ColorFieldStyleProps>({
      ...focusRing(),
      ...control({ shape: "default" }),
      ...fieldInput(),
      borderWidth: 2,
      borderStyle: "solid",
      transition: "default",
      borderColor: {
        default: baseColor("gray-300" as never),
        forcedColors: "ButtonBorder",
        isInvalid: {
          default: baseColor("negative" as never),
          forcedColors: "Mark",
        },
        isFocusWithin: {
          default: "gray-900" as never,
          isInvalid: "negative-1000" as never,
          forcedColors: "Highlight",
        },
        isDisabled: {
          default: "disabled",
          forcedColors: "GrayText",
        },
      },
      backgroundColor: {
        default: "gray-25" as never,
        forcedColors: "Field",
      },
      color: {
        default: baseColor("neutral" as never),
        forcedColors: "ButtonText",
        isDisabled: {
          default: "disabled",
          forcedColors: "GrayText",
        },
      },
      cursor: {
        default: "text",
        isDisabled: "default",
      },
    }),
    input: style({
      padding: 0,
      backgroundColor: "transparent",
      color: {
        default: "inherit",
        "::placeholder": {
          default: "gray-600" as never,
          forcedColors: "GrayText",
        },
      },
      fontFamily: "inherit",
      fontSize: "inherit",
      fontWeight: "inherit",
      flexGrow: 1,
      flexShrink: 1,
      minWidth: 0,
      width: "full",
      outlineStyle: "none",
      borderStyle: "none",
      truncate: true,
    }),
    helpText: style<ColorFieldStyleProps>({
      gridArea: "helptext",
      display: "flex",
      margin: 0,
      alignItems: "baseline",
      gap: "text-to-visual",
      font: controlFont(),
      color: {
        default: "neutral-subdued",
        isInvalid: {
          default: "negative",
          forcedColors: "Mark",
        },
        isDisabled: {
          default: "disabled",
          forcedColors: "GrayText",
        },
      },
      "--iconPrimary": {
        type: "fill",
        value: "currentColor",
      },
      contain: "inline-size",
      paddingTop: "--field-gap",
      cursor: {
        default: "text",
        isDisabled: "default",
      },
    }),
    errorIcon: style({
      size: fontRelative(20),
      marginStart: "text-to-visual",
      marginEnd: fontRelative(-2),
      flexShrink: 0,
      "--iconPrimary": {
        type: "fill",
        value: {
          default: "negative",
          forcedColors: "Mark",
        },
      },
    }),
    requiredIcon: style({
      "--iconPrimary": {
        type: "fill",
        value: "currentColor",
      },
    }),
    noWrap: style({
      whiteSpace: "nowrap",
    }),
  };
}

let colorFieldStyles: ReturnType<typeof createColorFieldStyles> | undefined;

function getColorFieldStyles(): ReturnType<typeof createColorFieldStyles> {
  colorFieldStyles ??= createColorFieldStyles();
  return colorFieldStyles;
}

export interface ColorFieldProps extends Omit<
  HeadlessColorFieldProps,
  "class" | "style" | "children"
> {
  /** The size of the color field. */
  size?: ColorFieldSize;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  /** Description text below the input. */
  description?: JSX.Element;
  /** Error message to display. */
  errorMessage?: JSX.Element;
  /** Position of the label relative to the input. */
  labelPosition?: ColorFieldLabelPosition;
  /** Text alignment for side labels. */
  labelAlign?: ColorFieldLabelAlign;
  /** Whether required fields show an icon or text label. */
  necessityIndicator?: ColorFieldNecessityIndicator;
}

/**
 * A color field allows users to enter a color value as text.
 *
 * @example
 * ```tsx
 * const [color, setColor] = createSignal(parseColor('#ff0000'))
 *
 * <ColorField
 *   value={color()}
 *   onChange={setColor}
 *   label="Color"
 * />
 * ```
 */
export function ColorField(props: ColorFieldProps): JSX.Element {
  const isInForm = useIsInForm();
  const mergedProps = useProviderProps(useFormProps(props));
  const [local, headlessProps] = splitProps(mergedProps, [
    "size",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "label",
    "description",
    "errorMessage",
    "labelPosition",
    "labelAlign",
    "necessityIndicator",
  ]);

  const [isFocusWithin, setIsFocusWithin] = createSignal(false);

  const size = () => normalizeColorFieldSize(local.size);
  const labelPosition = () => local.labelPosition ?? "top";
  const labelAlign = () => local.labelAlign ?? "start";
  const necessityIndicator = () => local.necessityIndicator ?? "icon";
  const fieldStyles = () => getColorFieldStyles();

  const rootClassName = (renderProps: ColorFieldRenderProps) =>
    [
      local.UNSAFE_className,
      local.class,
      fieldStyles().root(
        {
          ...renderProps,
          size: size(),
          labelPosition: labelPosition(),
          isInForm,
        },
        local.styles,
      ),
    ]
      .filter(Boolean)
      .join(" ");

  const labelWrapperClass = () =>
    fieldStyles().labelWrapper({
      size: size(),
      labelPosition: labelPosition(),
      labelAlign: labelAlign(),
    });

  const labelClass = (renderProps: ColorFieldRenderProps) =>
    fieldStyles().label({
      ...renderProps,
      size: size(),
      labelPosition: labelPosition(),
      isStaticColor: false,
    });

  const groupClass = (renderProps: ColorFieldRenderProps) =>
    fieldStyles().group({
      ...renderProps,
      size: size(),
      isFocusWithin: isFocusWithin(),
    });

  const helpClass = (renderProps: ColorFieldRenderProps, isInvalid: boolean) =>
    fieldStyles().helpText({
      ...renderProps,
      size: size(),
      isInvalid,
    });

  return (
    <HeadlessColorField
      {...headlessProps}
      description={local.description}
      errorMessage={local.errorMessage}
      class={rootClassName}
      style={local.UNSAFE_style}
      children={(renderProps) => (
        <>
          <Show when={local.label}>
            <div class={labelWrapperClass()}>
              <ColorFieldLabel class={labelClass(renderProps)}>
                {local.label}
                <Show when={renderProps.isRequired || necessityIndicator() === "label"}>
                  <span class={fieldStyles().noWrap}>
                    &nbsp;
                    <Show
                      when={necessityIndicator() === "icon"}
                      fallback={
                        <span aria-hidden={renderProps.isRequired ? true : undefined}>
                          {renderProps.isRequired ? "(required)" : "(optional)"}
                        </span>
                      }
                    >
                      <AsteriskIcon
                        size={colorFieldIconSize(size())}
                        class={fieldStyles().requiredIcon}
                        style={colorFieldRequiredIconStyle(size())}
                        aria-hidden="true"
                      />
                    </Show>
                  </span>
                </Show>
              </ColorFieldLabel>
            </div>
          </Show>

          <div
            role="presentation"
            class={groupClass(renderProps)}
            onPointerDown={(event) => {
              if (event.pointerType === "mouse") {
                focusColorFieldInput(event);
              }
            }}
            onTouchEnd={focusColorFieldInput}
            onFocusIn={() => setIsFocusWithin(true)}
            onFocusOut={() => setIsFocusWithin(false)}
            data-focused={isFocusWithin() ? "true" : undefined}
            data-disabled={renderProps.isDisabled ? "true" : undefined}
            data-invalid={renderProps.isInvalid ? "true" : undefined}
          >
            <HeadlessColorFieldInput class={fieldStyles().input} />
            <Show when={renderProps.isInvalid && !renderProps.isDisabled}>
              <CenterBaseline>
                <AlertTriangleIcon styles={fieldStyles().errorIcon} />
              </CenterBaseline>
            </Show>
          </div>

          <Show when={local.description && !renderProps.isInvalid}>
            <ColorFieldDescription class={helpClass(renderProps, false)}>
              {local.description}
            </ColorFieldDescription>
          </Show>

          <Show when={local.errorMessage && renderProps.isInvalid}>
            <ColorFieldError class={helpClass(renderProps, true)}>
              {local.errorMessage}
            </ColorFieldError>
          </Show>
        </>
      )}
    />
  );
}

export const ColorFieldContext = HeadlessColorFieldContext as ReturnType<
  typeof createContext<unknown>
>;

function normalizeColorFieldSize(size: ColorFieldSize | undefined): S2ColorFieldSize {
  switch (size) {
    case "sm":
      return "S";
    case "md":
      return "M";
    case "lg":
      return "L";
    case "S":
    case "M":
    case "L":
    case "XL":
      return size;
    default:
      return "M";
  }
}

function colorFieldIconSize(size: S2ColorFieldSize): "M" | "L" | "XL" {
  return size === "S" ? "M" : size;
}

function focusColorFieldInput(event: Event & { currentTarget: HTMLDivElement }) {
  const target = event.target as Element | null;

  if (target?.closest("button,input,textarea,[role='button']")) {
    return;
  }

  event.preventDefault();
  event.currentTarget.querySelector<HTMLElement>("input")?.focus();
}

function colorFieldRequiredIconStyle(size: S2ColorFieldSize): JSX.CSSProperties {
  const pixelSize = size === "L" || size === "XL" ? 10 : 8;
  return {
    width: `${pixelSize}px`,
    height: `${pixelSize}px`,
  };
}

function ColorFieldLabel(props: { class?: string; children?: JSX.Element }): JSX.Element | null {
  const context = useContext(HeadlessColorFieldContext);
  if (!context) return null;
  context.setLabelElement(true);
  onCleanup(() => context.setLabelElement(false));
  const labelProps = () => {
    const { ref: _ref, ...rest } = context.labelProps as Record<string, unknown>;
    return rest;
  };
  return (
    <label {...labelProps()} class={props.class}>
      {props.children}
    </label>
  );
}

function ColorFieldDescription(props: {
  class?: string;
  children?: JSX.Element;
}): JSX.Element | null {
  const context = useContext(HeadlessColorFieldContext);
  if (!context) return null;
  const descriptionProps = () => {
    const { ref: _ref, ...rest } = context.descriptionProps as Record<string, unknown>;
    return rest;
  };
  return (
    <p {...descriptionProps()} class={props.class}>
      {props.children}
    </p>
  );
}

function ColorFieldError(props: { class?: string; children?: JSX.Element }): JSX.Element | null {
  const context = useContext(HeadlessColorFieldContext);
  if (!context) return null;
  const errorMessageProps = () => {
    const { ref: _ref, ...rest } = context.errorMessageProps as Record<string, unknown>;
    return rest;
  };
  return (
    <p {...errorMessageProps()} class={props.class}>
      {props.children}
    </p>
  );
}

export type ColorSwatchSize = "XS" | "S" | "M" | "L";
export type ColorSwatchRounding = "default" | "none" | "full";

interface ColorSwatchStyleProps extends Partial<ColorSwatchRenderProps> {
  size?: ColorSwatchSize;
  rounding?: ColorSwatchRounding;
}

const colorSwatchRoot = style<ColorSwatchStyleProps>(
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
    borderColor: "gray-1000/42" as never,
    borderWidth: 1,
    borderStyle: "solid",
    boxSizing: "border-box",
    forcedColorAdjust: "none",
    "--slash-color": {
      type: "color",
      value: "red-900" as never,
    },
  },
  getAllowedOverrides({ height: true }),
);

export interface ColorSwatchProps extends Omit<
  HeadlessColorSwatchProps,
  "class" | "style" | "children"
> {
  /** The size of the color swatch. */
  size?: ColorSwatchSize;
  /** Corner rounding for the color swatch. */
  rounding?: ColorSwatchRounding;
  /** Spectrum-defined generated classes. */
  styles?: StylesPropWithHeight;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Additional CSS class name. */
  class?: string;
}

/**
 * A color swatch displays a color sample.
 *
 * @example
 * ```tsx
 * <ColorSwatch color={parseColor('#ff0000')} aria-label="Selected color" />
 * ```
 */
export function ColorSwatch(props: ColorSwatchProps): JSX.Element {
  const [local, headlessProps] = splitProps(props, [
    "size",
    "rounding",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
  ]);

  const size = () => local.size ?? "M";
  const rounding = () => local.rounding ?? "default";

  const getClassName = (renderProps: ColorSwatchRenderProps): string => {
    return [
      local.UNSAFE_className,
      local.class,
      colorSwatchRoot(
        {
          ...renderProps,
          size: size(),
          rounding: rounding(),
        },
        mergeStyles(local.styles),
      ),
    ]
      .filter(Boolean)
      .join(" ");
  };

  const getStyle = (renderProps: ColorSwatchRenderProps): JSX.CSSProperties => {
    const swatchColor = renderProps.color;
    const colorValue = swatchColor.toString("css");
    const background =
      swatchColor.getChannelValue("alpha") > 0
        ? `linear-gradient(${colorValue}, ${colorValue}), repeating-conic-gradient(#e6e6e6 0% 25%, white 0% 50%) 0% 50% / 16px 16px`
        : "linear-gradient(to bottom right, transparent calc(50% - 2px), var(--slash-color) calc(50% - 2px) calc(50% + 2px), transparent calc(50% + 2px)) no-repeat";

    return {
      background,
      ...local.UNSAFE_style,
    };
  };

  return <HeadlessColorSwatch {...headlessProps} class={getClassName} style={getStyle} />;
}

export const ColorSwatchContext = HeadlessColorSwatchContext;

export interface ColorPickerProps {
  /** The current color value (controlled). */
  value?: Color | string;
  /** The default color value (uncontrolled). */
  defaultValue?: Color | string;
  /** Handler called when the color changes. */
  onChange?: (color: Color) => void;
  /** The size of the picker. */
  size?: ColorSize;
  /** Additional CSS class name. */
  class?: string;
  /** Whether the picker is disabled. */
  isDisabled?: boolean;
  /** A label for the picker. */
  label?: string;
  /** Whether to show the hex input field. */
  showInput?: boolean;
  /** Whether to show channel sliders. */
  showSliders?: boolean;
}

/**
 * A complete color picker component with area, sliders, and input.
 *
 * @example
 * ```tsx
 * const [color, setColor] = createSignal(parseColor('hsl(0, 100%, 50%)'))
 *
 * <ColorPicker
 *   value={color()}
 *   onChange={setColor}
 *   label="Pick a color"
 *   showInput
 *   showSliders
 * />
 * ```
 */
export function ColorPicker(props: ColorPickerProps): JSX.Element {
  const size = () => props.size ?? "md";
  const styles = () => sizeStyles[size()];

  return (
    <div class={`flex flex-col gap-4 ${props.class ?? ""}`}>
      <Show when={props.label}>
        <span class={`text-primary-200 font-medium ${styles().field.label}`}>{props.label}</span>
      </Show>

      <ColorArea
        value={props.value}
        defaultValue={props.defaultValue}
        onChange={props.onChange}
        xChannel="saturation"
        yChannel="lightness"
        UNSAFE_style={{
          width: legacyColorAreaSizes[size()],
          height: legacyColorAreaSizes[size()],
        }}
        isDisabled={props.isDisabled}
      />

      <Show when={props.showSliders !== false}>
        <ColorSlider
          value={props.value}
          defaultValue={props.defaultValue}
          onChange={props.onChange}
          channel="hue"
          label="Hue"
          size={size()}
          showValue
          isDisabled={props.isDisabled}
        />

        <ColorSlider
          value={props.value}
          defaultValue={props.defaultValue}
          onChange={props.onChange}
          channel="alpha"
          label="Alpha"
          size={size()}
          showValue
          isDisabled={props.isDisabled}
        />
      </Show>

      <Show when={props.showInput}>
        <ColorField
          value={props.value}
          defaultValue={props.defaultValue}
          onChange={(color) => {
            if (color && props.onChange) {
              props.onChange(color);
            }
          }}
          label="Hex"
          size={size()}
          isDisabled={props.isDisabled}
        />
      </Show>
    </div>
  );
}

ColorWheel.Track = ColorWheelTrack;
ColorWheel.Thumb = ColorWheelThumb;

export const ColorSliderContext = HeadlessColorSliderContext as ReturnType<
  typeof createContext<unknown>
>;

export const ColorAreaContext = HeadlessColorAreaContext as ReturnType<
  typeof createContext<unknown>
>;

export type { Color, ColorAxes, ColorChannel, ColorChannelRange, ColorFormat, ColorSpace };

export { parseColor, getColorChannels } from "@proyecto-viviana/solid-stately";

export { ColorEditor } from "./ColorEditor";
export type { ColorEditorProps } from "./ColorEditor";

export { ColorSwatchPicker, ColorSwatchPickerItem } from "./ColorSwatchPicker";
export type {
  ColorSwatchPickerProps,
  ColorSwatchPickerItemProps,
  SwatchPickerSize,
  SwatchPickerDensity,
  SwatchPickerRounding,
} from "./ColorSwatchPicker";
