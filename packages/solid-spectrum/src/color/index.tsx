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
import {
  ColorSlider as HeadlessColorSlider,
  ColorSliderTrack as HeadlessColorSliderTrack,
  ColorSliderThumb as HeadlessColorSliderThumb,
  ColorArea as HeadlessColorArea,
  ColorAreaThumb as HeadlessColorAreaThumb,
  ColorAreaContext as HeadlessColorAreaContext,
  ColorWheel as HeadlessColorWheel,
  ColorWheelTrack as HeadlessColorWheelTrack,
  ColorWheelThumb as HeadlessColorWheelThumb,
  ColorField as HeadlessColorField,
  ColorFieldInput as HeadlessColorFieldInput,
  ColorSwatch as HeadlessColorSwatch,
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
import { style, type StyleString } from "../s2-style";
import { keyframes } from "../s2-style/style-macro";
import { mergeStyles } from "../s2-style/runtime";
import {
  getAllowedOverrides,
  type StylesPropWithHeight,
  type UnsafeClassName,
} from "../s2-internal/style-utils";

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

export interface ColorSliderProps extends Omit<
  HeadlessColorSliderProps,
  "class" | "style" | "children"
> {
  /** The size of the color slider. */
  size?: ColorSize;
  /** Additional CSS class name. */
  class?: string;
  /** Show the current value. */
  showValue?: boolean;
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
  const [local, headlessProps] = splitProps(props, ["size", "class", "showValue"]);

  const size = () => local.size ?? "md";
  const styles = () => sizeStyles[size()];
  const customClass = local.class ?? "";

  const getClassName = (renderProps: ColorSliderRenderProps): string => {
    const base = "flex flex-col gap-1.5";
    let stateClass = "";
    if (renderProps.isDisabled) {
      stateClass = "opacity-50";
    }
    return [base, stateClass, customClass].filter(Boolean).join(" ");
  };

  const contextValue = createMemo(() => ({ size: size() }));

  return (
    <ColorSizeContext.Provider value={contextValue()}>
      <HeadlessColorSlider {...headlessProps} class={getClassName}>
        {(renderProps: ColorSliderRenderProps) => (
          <>
            <div class="flex items-center justify-between">
              <Show when={headlessProps.label}>
                <span class={`text-primary-200 font-medium ${styles().slider.label}`}>
                  {headlessProps.label}
                </span>
              </Show>
              <Show when={local.showValue}>
                <span class={`text-primary-400 ${styles().slider.label}`}>
                  {Math.round(renderProps.value)}
                </span>
              </Show>
            </div>
            <ColorSliderTrack>{() => <ColorSliderThumb />}</ColorSliderTrack>
          </>
        )}
      </HeadlessColorSlider>
    </ColorSizeContext.Provider>
  );
}

/**
 * The track component for a color slider.
 */
export function ColorSliderTrack(props: {
  children?: JSX.Element | (() => JSX.Element);
  class?: string;
}): JSX.Element {
  const context = useContext(ColorSizeContext);
  const styles = sizeStyles[context.size];
  const customClass = props.class ?? "";

  const getClassName = (renderProps: ColorSliderTrackRenderProps): string => {
    const base = `relative ${styles.slider.track} shadow-inner border border-bg-300`;
    const dragClass = renderProps.isDragging ? "cursor-grabbing" : "cursor-pointer";
    return [base, dragClass, customClass].filter(Boolean).join(" ");
  };

  return <HeadlessColorSliderTrack class={getClassName}>{props.children}</HeadlessColorSliderTrack>;
}

/**
 * The thumb component for a color slider.
 */
export function ColorSliderThumb(props: { class?: string }): JSX.Element {
  const context = useContext(ColorSizeContext);
  const styles = sizeStyles[context.size];
  const customClass = props.class ?? "";

  const getClassName = (renderProps: ColorSliderThumbRenderProps): string => {
    const base = `${styles.slider.thumb} rounded-full border-2 border-on-color shadow-md cursor-grab`;
    const dragClass = renderProps.isDragging ? "cursor-grabbing scale-110" : "";
    const focusClass = renderProps.isFocusVisible ? "ring-2 ring-accent-300 ring-offset-2" : "";
    const disabledClass = renderProps.isDisabled ? "cursor-not-allowed" : "";
    return [base, dragClass, focusClass, disabledClass, customClass].filter(Boolean).join(" ");
  };

  return <HeadlessColorSliderThumb class={getClassName} />;
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

export interface ColorFieldProps extends Omit<
  HeadlessColorFieldProps,
  "class" | "style" | "children"
> {
  /** The size of the color field. */
  size?: ColorSize;
  /** Additional CSS class name. */
  class?: string;
  /** Description text below the input. */
  description?: string;
  /** Error message to display. */
  errorMessage?: string;
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
  const [local, headlessProps] = splitProps(props, [
    "size",
    "class",
    "description",
    "errorMessage",
  ]);

  const size = () => local.size ?? "md";
  const styles = () => sizeStyles[size()];
  const customClass = local.class ?? "";

  const getClassName = (renderProps: ColorFieldRenderProps): string => {
    const base = "flex flex-col gap-1.5";
    let stateClass = "";
    if (renderProps.isDisabled) {
      stateClass = "opacity-50";
    }
    return [base, stateClass, customClass].filter(Boolean).join(" ");
  };

  const contextValue = createMemo(() => ({ size: size() }));

  return (
    <ColorSizeContext.Provider value={contextValue()}>
      <HeadlessColorField {...headlessProps} class={getClassName}>
        {() => (
          <>
            <Show when={headlessProps.label}>
              <span class={`text-primary-200 font-medium ${styles().field.label}`}>
                {headlessProps.label}
              </span>
            </Show>
            <ColorFieldInput isInvalid={!!local.errorMessage} />
            <Show when={local.description && !local.errorMessage}>
              <span class="text-primary-400 text-sm">{local.description}</span>
            </Show>
            <Show when={local.errorMessage}>
              <span class="text-danger-400 text-sm">{local.errorMessage}</span>
            </Show>
          </>
        )}
      </HeadlessColorField>
    </ColorSizeContext.Provider>
  );
}

/**
 * The input component for a color field.
 */
export function ColorFieldInput(props: { class?: string; isInvalid?: boolean }): JSX.Element {
  const context = useContext(ColorSizeContext);
  const styles = sizeStyles[context.size];
  const customClass = props.class ?? "";

  const base = `${styles.field.input} w-full rounded-md border bg-bg-400 text-primary-200 placeholder:text-primary-500 focus:outline-none focus:ring-2 focus:ring-accent-300`;
  const borderClass = props.isInvalid
    ? "border-danger-400"
    : "border-bg-300 focus:border-accent-300";
  const className = [base, borderClass, customClass].filter(Boolean).join(" ");

  return <HeadlessColorFieldInput class={className} />;
}

export interface ColorSwatchProps extends Omit<HeadlessColorSwatchProps, "class" | "style"> {
  /** The size of the color swatch. */
  size?: ColorSize;
  /** Additional CSS class name. */
  class?: string;
  /** Whether the swatch is selectable. */
  isSelectable?: boolean;
  /** Whether the swatch is selected. */
  isSelected?: boolean;
  /** Handler called when the swatch is clicked. */
  onClick?: () => void;
}

/**
 * A color swatch displays a color sample.
 *
 * @example
 * ```tsx
 * <ColorSwatch color={parseColor('#ff0000')} />
 *
 * // Selectable swatch
 * <ColorSwatch
 *   color={parseColor('#00ff00')}
 *   isSelectable
 *   isSelected={selectedColor === '#00ff00'}
 *   onClick={() => setSelectedColor('#00ff00')}
 * />
 * ```
 */
export function ColorSwatch(props: ColorSwatchProps): JSX.Element {
  const [local, headlessProps] = splitProps(props, [
    "size",
    "class",
    "isSelectable",
    "isSelected",
    "onClick",
    "aria-label",
  ]);

  const size = () => local.size ?? "md";
  const styles = () => sizeStyles[size()];
  const customClass = local.class ?? "";

  const getClassName = (_renderProps: ColorSwatchRenderProps): string => {
    const base = `${styles().swatch} rounded-md border border-bg-300 shadow-sm`;
    const selectableClass = local.isSelectable
      ? "cursor-pointer hover:scale-105 transition-transform"
      : "";
    const selectedClass = local.isSelected
      ? "ring-2 ring-accent-300 ring-offset-2 ring-offset-bg-400"
      : "";
    return [base, selectableClass, selectedClass, customClass].filter(Boolean).join(" ");
  };

  const handleClick = () => {
    if (local.isSelectable && local.onClick) {
      local.onClick();
    }
  };

  if (local.isSelectable && local.onClick) {
    return (
      <button
        type="button"
        class="inline-flex bg-transparent border-0 p-0 cursor-pointer"
        onClick={handleClick}
        aria-pressed={local.isSelected}
        aria-label={local["aria-label"]}
      >
        <HeadlessColorSwatch
          {...headlessProps}
          aria-label={local["aria-label"]}
          class={getClassName}
        />
      </button>
    );
  }

  return (
    <HeadlessColorSwatch {...headlessProps} aria-label={local["aria-label"]} class={getClassName} />
  );
}

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

ColorSlider.Track = ColorSliderTrack;
ColorSlider.Thumb = ColorSliderThumb;
ColorWheel.Track = ColorWheelTrack;
ColorWheel.Thumb = ColorWheelThumb;
ColorField.Input = ColorFieldInput;

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
