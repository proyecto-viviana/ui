// @ts-nocheck
import {
  type JSX,
  createContext,
  createMemo,
  createUniqueId,
  mergeProps,
  Show,
  splitProps,
  useContext,
} from "solid-js";
import { useLocale } from "@proyecto-viviana/solidaria";
import {
  Slider as HeadlessSlider,
  SliderFill as HeadlessSliderFill,
  SliderOutput as HeadlessSliderOutput,
  SliderThumb as HeadlessSliderThumb,
  SliderTrack as HeadlessSliderTrack,
  SliderStateContext,
  type SliderProps as HeadlessSliderProps,
  type SliderRenderProps,
  type SliderThumbRenderProps,
  type SliderTrackRenderProps,
} from "@proyecto-viviana/solidaria-components";
import { type SliderOrientation } from "@proyecto-viviana/solid-stately";
import type { StyleString } from "../style";
import { focusRing, style } from "../style" with { type: "macro" };
import {
  controlFont,
  field,
  fieldInput,
  fieldLabel,
  fieldValue,
  getAllowedOverrides,
} from "../s2-internal/style-utils" with { type: "macro" };
import { useProviderProps } from "../provider";
import { useFormProps, useIsInForm } from "../form";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";

export type SliderSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg";
type S2SliderSize = "S" | "M" | "L" | "XL";
export type SliderVariant = "default" | "accent";
export type SliderTrackStyle = "thin" | "thick";
export type SliderThumbStyle = "default" | "precise";
export type SliderLabelPosition = "top" | "side";
export type SliderLabelAlign = "start" | "end";

export interface SliderProps extends Omit<
  HeadlessSliderProps,
  "class" | "style" | "children" | "label" | "slot" | "ref"
> {
  size?: SliderSize;
  /** Legacy alias. Prefer S2 `isEmphasized`. */
  variant?: SliderVariant;
  isEmphasized?: boolean;
  trackStyle?: SliderTrackStyle;
  thumbStyle?: SliderThumbStyle;
  fillOffset?: number;
  class?: string;
  label?: JSX.Element;
  contextualHelp?: JSX.Element;
  showOutput?: boolean;
  showMinMax?: boolean;
  labelPosition?: SliderLabelPosition;
  labelAlign?: SliderLabelAlign;
  styles?: StyleString;
  UNSAFE_className?: string;
  UNSAFE_style?: JSX.CSSProperties;
  slot?: string | null;
  ref?: RefLike<HTMLDivElement>;
}

type SliderStyleState = SliderRenderProps & {
  size?: S2SliderSize;
  labelPosition?: SliderLabelPosition;
  labelAlign?: SliderLabelAlign;
  isInForm?: boolean;
  direction?: "ltr" | "rtl";
};

export const SliderContext = createContext<SpectrumContextValue<SliderProps>>(null);

const sliderRoot = style<SliderStyleState>(
  {
    ...field(),
    font: controlFont(),
    alignItems: {
      // Upstream applies field() (align-items: baseline) + slider() as two
      // separate classes; slider() only overrides for side layout. We merge
      // both into one style(), so the baseline default must be restored here.
      default: "baseline",
      labelPosition: {
        side: "center",
      },
    },
    color: {
      default: "neutral-subdued",
      forcedColors: "ButtonText",
      isDisabled: "disabled",
    },
    columnGap: {
      size: {
        S: 16,
        M: 16,
        L: 20,
        XL: 24,
      },
      isInForm: 12,
    },
  },
  getAllowedOverrides(),
);

const labelContainer = style<SliderStyleState>({
  display: {
    labelPosition: {
      top: "grid",
    },
  },
  gridArea: "label",
  width: "full",
  gridTemplateAreas: {
    labelPosition: {
      top: ["label output"],
    },
  },
  gridTemplateColumns: {
    labelPosition: {
      top: ["1fr auto"],
    },
  },
  textAlign: {
    labelPosition: {
      side: {
        labelAlign: {
          start: "start",
          end: "end",
        },
      },
    },
  },
  "--field-gap": {
    type: "paddingBottom",
    value: 0,
  },
});

const sliderLabel = style<SliderStyleState>({
  ...fieldLabel(),
});

// The FieldLabel outer wrapper `<div>` (upstream `Field.tsx` FieldLabel): an inline
// box in the `label` grid cell that owns the label-align text-align + the top
// paddingBottom(--field-gap) + contain(inline-size). Slider never sets `isQuiet`, so
// upstream's `contain.isQuiet:'none'` branch is a dead condition here and is omitted.
const fieldLabelWrapper = style<SliderStyleState>({
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
  },
});

const outputStyle = style<SliderStyleState>({
  /* The readout had no type role of its own — with no font key here it inherited
   * `field()`'s `fontSize: controlFont()` and came out byte-identical to the label
   * naming it. `fieldValue()` is the shared readout role (see its doc comment); it
   * is spread first so any sibling key below would deliberately win. */
  ...fieldValue(),
  gridArea: "output",
  textAlign: {
    labelPosition: {
      top: {
        direction: {
          ltr: "end",
          rtl: "start",
        },
      },
      side: {
        direction: {
          ltr: "start",
          rtl: "end",
        },
        isInForm: "end",
      },
    },
  },
});

const inputRow = style<SliderStyleState>({
  ...fieldInput(),
  display: "inline-flex",
  alignItems: "center",
  gap: {
    default: 16,
    size: {
      L: 20,
      XL: 24,
    },
  },
});

const track = style<SliderStyleState>({
  gridArea: "track",
  position: "relative",
  width: "full",
  height: {
    size: {
      S: 24,
      M: 32,
      L: 40,
      XL: 48,
    },
  },
});

const verticalTrack = style<SliderStyleState>({
  gridArea: "track",
  position: "relative",
  width: {
    size: {
      S: 24,
      M: 32,
      L: 40,
      XL: 48,
    },
  },
  height: 160,
});

const thumbContainer = style<SliderStyleState>({
  size: {
    size: {
      S: 18,
      M: 20,
      L: 22,
      XL: 24,
    },
  },
  display: "inline-block",
  position: "absolute",
  top: "50%",
});

const thumbHitArea = style<{ size?: S2SliderSize; thumbStyle?: SliderThumbStyle }>({
  size: {
    thumbStyle: {
      default: {
        size: {
          S: 18,
          M: 20,
          L: 22,
          XL: 24,
        },
      },
      precise: {
        size: {
          S: 20,
          M: 22,
          L: 24,
          XL: 26,
        },
      },
    },
  },
});

const thumb = style<
  SliderThumbRenderProps & { size?: S2SliderSize; thumbStyle?: SliderThumbStyle }
>({
  ...focusRing(),
  display: "inline-block",
  boxSizing: "border-box",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translateY(-50%) translateX(-50%)",
  width: {
    thumbStyle: {
      default: {
        size: {
          S: 18,
          M: 20,
          L: 22,
          XL: 24,
        },
      },
      precise: 6,
    },
  },
  height: {
    thumbStyle: {
      default: {
        size: {
          S: 18,
          M: 20,
          L: 22,
          XL: 24,
        },
      },
      precise: {
        size: {
          S: 20,
          M: 22,
          L: 24,
          XL: 26,
        },
      },
    },
  },
  borderRadius: "full",
  borderStyle: "solid",
  borderWidth: 1,
  /* The rim marks raised, filled chrome across the register. This thumb is filled
   * (`backgroundColor: gray-25` below) and sits proud of its track, so it belongs to
   * that family. It missed the rim because Slider never spreads `control()` — the
   * only spread in this object is `focusRing()`, which emits outlineStyle/
   * outlineColor/outlineWidth/outlineOffset and no boxShadow, so this key adds
   * rather than clobbers. Reuses the existing `edge-glass` entry; invents no shadow.
   * Note it will read in the dark scheme and barely at all in light, where the
   * gray-25 fill is near-white and the rim's highlight is white. */
  boxShadow: "edge-glass",
  borderColor: {
    default: "gray-800",
    isHovered: "gray-900",
    isDragging: "gray-900",
    isDisabled: "disabled",
    forcedColors: {
      default: "ButtonBorder",
      isDisabled: "GrayText",
    },
  },
  backgroundColor: {
    default: "gray-25",
    forcedColors: "ButtonFace",
  },
});

const upperTrack = style<{ isDisabled?: boolean; trackStyle?: SliderTrackStyle }>({
  height: {
    trackStyle: {
      thin: 4,
      thick: 16,
    },
  },
  top: "50%",
  /* Flat square, both track styles — the register draws its one trough-plus-fill bar
   * with no radius at all. The conditional was wrong at both ends: `thin` took `lg`
   * (10px, the terminal-well corner — spectrum-theme.ts radius map) on a 4px bar,
   * which is just a pill, and `thick` took `sm` (4px), a value that appears nowhere
   * on the register's drawn ladder. `filledTrack` below must stay identical to this
   * or the fill's leading edge rounds inside a square trough. */
  borderRadius: "none",
  position: "absolute",
  /* The trough is INSET, not a grey plate. The handoff draws exactly one of these — the
   * XP bar at TerminalGlassLab.tsx:686-695 — as `--surface-inset` with the filled part in
   * `--accent-primary` over it, which is the `pasteboard` token here. `gray-300` painted
   * it #c4d0de / #67717d: a light-grey bar in dark, brighter than the card it sits on,
   * so the trough read as raised rather than recessed. The fill above is already
   * accent-900, so this is the last half of that pair. RangeSlider.tsx:366 carries the
   * same value for the same reason. */
  backgroundColor: {
    default: "pasteboard",
    forcedColors: "ButtonFace",
    isDisabled: "disabled",
  },
  translateY: "-50%",
  width: "full",
  boxSizing: "border-box",
  outlineStyle: "solid",
  outlineWidth: "[.5px]",
  outlineOffset: -0.5,
  outlineColor: {
    default: "transparent",
    forcedColors: {
      default: "ButtonText",
      isDisabled: "GrayText",
    },
  },
});

const filledTrack = style<{
  isDisabled?: boolean;
  isEmphasized?: boolean;
  trackStyle?: SliderTrackStyle;
}>({
  height: {
    trackStyle: {
      thin: 4,
      thick: 16,
    },
  },
  top: "50%",
  /* Square, matching `upperTrack` exactly — see the note there. */
  borderRadius: "none",
  position: "absolute",
  backgroundColor: {
    /* Blue is the register's fill channel: it never draws a filled progress segment
       in neutral. `gray-700` is the TEXT ramp, so the bar was painted in exactly the
       colour of its own label and read as inert. `isEmphasized` now resolves to the
       same value rather than being the only route to the accent; it is left declared
       so the condition stays referenced, but note it is now a visual no-op — the
       `variant="accent"` alias no longer changes the fill. */
    default: "accent-900",
    isEmphasized: "accent-900",
    isDisabled: "disabled",
    forcedColors: {
      default: "Highlight",
      isDisabled: "GrayText",
    },
  },
  boxSizing: "border-box",
  borderStyle: "solid",
  borderWidth: "[.5px]",
  borderColor: {
    default: "transparent",
    forcedColors: {
      default: "ButtonText",
      isDisabled: "GrayText",
    },
  },
  translateY: "-50%",
});

function normalizeSliderSize(size: SliderSize | undefined): S2SliderSize {
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

function pressScaleStyle(
  element: HTMLDivElement | undefined,
  renderProps: SliderThumbRenderProps,
): JSX.CSSProperties {
  const transform = "translate(-50%, -50%)";

  if (!renderProps.isDragging || !element) {
    return { transform };
  }

  const { width, height } = element.getBoundingClientRect();
  return {
    transform: `perspective(${Math.max(height, width / 3, 24)}px) ${transform} translate3d(0, 0, -2px)`,
  };
}

/**
 * A slider allows users to select a value from a range.
 */
export function Slider(props: SliderProps): JSX.Element {
  const isInForm = useIsInForm();
  const providerProps = useProviderProps(useFormProps(props));
  const contextProps = getSlottedContextProps(useContext(SliderContext), props.slot);
  const mergedProps = mergeProps(providerProps, contextProps ?? {}, props);
  const [local, headlessProps] = splitProps(mergedProps, [
    "size",
    "variant",
    "isEmphasized",
    "trackStyle",
    "thumbStyle",
    "fillOffset",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "label",
    "contextualHelp",
    "showOutput",
    "showMinMax",
    "labelPosition",
    "labelAlign",
    "slot",
    "ref",
  ]);

  const locale = useLocale();
  const size = () => normalizeSliderSize(local.size);
  const labelPosition = () => local.labelPosition ?? "top";
  const labelAlign = () => local.labelAlign ?? "start";
  const trackStyle = () => local.trackStyle ?? "thin";
  const thumbStyle = () => local.thumbStyle ?? "default";
  const isEmphasized = () => local.isEmphasized ?? local.variant === "accent";
  const showOutput = () => local.showOutput ?? true;
  const minValue = () => headlessProps.minValue ?? 0;
  const maxValue = () => headlessProps.maxValue ?? 100;
  const orientation = (): SliderOrientation => headlessProps.orientation ?? "horizontal";
  const labelId = createUniqueId();
  let thumbElement: HTMLDivElement | undefined;
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const assignRootRef = mergeContextRefs(
    (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
    props.ref,
  );
  const formatter = createMemo(
    () => new Intl.NumberFormat(locale().locale, headlessProps.formatOptions),
  );
  const maxLabelLength = createMemo(() => {
    const minLabelLength = [...formatter().format(minValue())].length;
    const maxLabelLength = [...formatter().format(maxValue())].length;
    return Math.max(minLabelLength, maxLabelLength);
  });

  const rootClass = (renderProps: SliderRenderProps) =>
    [
      contextProps?.UNSAFE_className,
      props.UNSAFE_className,
      props.class,
      sliderRoot(
        {
          ...renderProps,
          size: size(),
          labelPosition: labelPosition(),
          labelAlign: labelAlign(),
          isInForm,
        },
        mergedStyles(),
      ),
    ]
      .filter(Boolean)
      .join(" ");

  const labelStyleState = (renderProps: SliderRenderProps) => ({
    ...renderProps,
    size: size(),
    labelPosition: labelPosition(),
    labelAlign: labelAlign(),
    isInForm,
    direction: locale().direction,
  });

  const SliderTrackContent = (props: { rootRenderProps: SliderRenderProps }) => {
    const sliderContext = useContext(SliderStateContext);
    const state = () => sliderContext?.state;
    const trackRenderProps = (): SliderTrackRenderProps => ({
      isDisabled: state()?.isDisabled ?? false,
      isDragging: state()?.isDragging() ?? false,
      valuePercent: state()?.getValuePercent() ?? 0,
      orientation: state()?.orientation ?? orientation(),
    });

    const upperTrackStyle = (): JSX.CSSProperties | undefined =>
      trackRenderProps().orientation === "vertical"
        ? {
            height: "100%",
            width: trackStyle() === "thin" ? "4px" : "16px",
            left: "50%",
            transform: "translateX(-50%)",
          }
        : undefined;

    return (
      <>
        <div
          class={upperTrack({
            isDisabled: trackRenderProps().isDisabled,
            trackStyle: trackStyle(),
          })}
          style={upperTrackStyle()}
        >
          <HeadlessSliderFill
            offset={local.fillOffset}
            class={filledTrack({
              isDisabled: trackRenderProps().isDisabled,
              isEmphasized: isEmphasized(),
              trackStyle: trackStyle(),
            })}
          />
        </div>
        <HeadlessSliderThumb
          class={(thumbRenderProps: SliderThumbRenderProps) =>
            thumbContainer({ ...labelStyleState(props.rootRenderProps), ...thumbRenderProps })
          }
          ref={thumbElement}
          style={(thumbRenderProps: SliderThumbRenderProps) =>
            pressScaleStyle(thumbElement, thumbRenderProps)
          }
        >
          {(thumbRenderProps: SliderThumbRenderProps) => (
            <div class={thumbHitArea({ size: size(), thumbStyle: thumbStyle() })}>
              <div
                class={thumb({
                  ...thumbRenderProps,
                  size: size(),
                  thumbStyle: thumbStyle(),
                })}
              />
            </div>
          )}
        </HeadlessSliderThumb>
      </>
    );
  };

  return (
    <HeadlessSlider
      {...headlessProps}
      aria-labelledby={
        headlessProps["aria-labelledby"] ??
        (!headlessProps["aria-label"] && local.label ? labelId : undefined)
      }
      aria-label={headlessProps["aria-label"]}
      ref={(element) => assignRootRef(element)}
      slot={local.slot ?? undefined}
      class={rootClass}
      style={mergedUnsafeStyle()}
    >
      {(renderProps: SliderRenderProps) => (
        <>
          <div class={labelContainer(labelStyleState(renderProps))}>
            <Show when={local.label}>
              <div class={fieldLabelWrapper(labelStyleState(renderProps))}>
                <label id={labelId} class={sliderLabel(labelStyleState(renderProps))}>
                  {local.label}
                </label>
                <Show when={local.contextualHelp}>
                  <span data-slot="contextualHelp">{local.contextualHelp}</span>
                </Show>
              </div>
            </Show>
            <Show when={labelPosition() === "top" && showOutput()}>
              <HeadlessSliderOutput
                class={outputStyle(labelStyleState(renderProps))}
                style={{
                  width: `${maxLabelLength()}ch`,
                  "min-width": `${maxLabelLength()}ch`,
                  "font-variant-numeric": "tabular-nums",
                }}
              />
            </Show>
          </div>

          <div class={inputRow(labelStyleState(renderProps))}>
            <HeadlessSliderTrack
              class={(trackRenderProps: SliderTrackRenderProps) =>
                orientation() === "vertical"
                  ? verticalTrack({ ...labelStyleState(renderProps), ...trackRenderProps })
                  : track({ ...labelStyleState(renderProps), ...trackRenderProps })
              }
            >
              <SliderTrackContent rootRenderProps={renderProps} />
            </HeadlessSliderTrack>

            <Show when={labelPosition() === "side" && showOutput()}>
              <HeadlessSliderOutput
                class={outputStyle(labelStyleState(renderProps))}
                style={{
                  width: `${maxLabelLength()}ch`,
                  "min-width": `${maxLabelLength()}ch`,
                  "font-variant-numeric": "tabular-nums",
                }}
              />
            </Show>
          </div>

          <Show when={local.showMinMax}>
            <div
              style={{ display: "flex", "justify-content": "space-between", "margin-top": "4px" }}
            >
              <span>{minValue()}</span>
              <span>{maxValue()}</span>
            </div>
          </Show>
        </>
      )}
    </HeadlessSlider>
  );
}

export type { SliderState, SliderOrientation } from "@proyecto-viviana/solid-stately";

export { RangeSlider, RangeSliderContext } from "./RangeSlider";
export type {
  RangeSliderLabelAlign,
  RangeSliderLabelPosition,
  RangeSliderProps,
  RangeSliderSize,
  RangeSliderThumbStyle,
  RangeSliderTrackStyle,
  RangeSliderVariant,
} from "./RangeSlider";
