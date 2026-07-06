// @ts-nocheck
import { type JSX, splitProps, mergeProps, Show, useContext } from "solid-js";
import {
  getSlottedContextProps,
  mergeContextStyles,
  mergeContextUnsafeStyle,
} from "../button/spectrum-context";
import { SwitchContext } from ".";
import { type AriaSwitchProps, type Direction, useLocale } from "@proyecto-viviana/solidaria";
import {
  SwitchField as HeadlessSwitchField,
  SwitchButton as HeadlessSwitchButton,
  type SwitchFieldRenderProps,
  type SwitchButtonRenderProps,
  type ToggleSwitchRenderProps,
} from "@proyecto-viviana/solidaria-components";
import { Text } from "../text";
import type { StyleString } from "../style";
import { baseColor, focusRing, fontRelative, style } from "../style" with { type: "macro" };
import {
  controlFont,
  controlSize,
  getAllowedOverrides,
} from "../s2-internal/style-utils" with { type: "macro" };
import { CenterBaseline } from "../icon/center-baseline";
import AlertTriangleIcon from "../icon/s2wf-icons/AlertTriangleIcon";
import { useProviderProps } from "../provider";
import { useFormProps, useIsInForm } from "../form";

export type SwitchSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg";
type S2SwitchSize = "S" | "M" | "L" | "XL";

export interface ToggleSwitchProps extends Omit<AriaSwitchProps, "children"> {
  /**
   * A slot name, used to inject props from a parent slotted context (mirrors
   * upstream's `SlotProps`; our headless `ToggleSwitchProps` already extends it).
   */
  slot?: string | null;
  /** The size of the Switch. */
  size?: SwitchSize;
  /** Whether the Switch should be displayed with an emphasized style. */
  isEmphasized?: boolean;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Additional CSS class name. */
  class?: string;
  /** A description for the Switch. */
  description?: JSX.Element;
  /** An error message for the Switch (rendered when invalid). */
  errorMessage?: JSX.Element;
  /** Label text for the Switch. */
  children?: JSX.Element;
}

interface SwitchStyleProps {
  size?: S2SwitchSize;
  isEmphasized?: boolean;
}

type SwitchStyleState = ToggleSwitchRenderProps & SwitchStyleProps;

// The field grid — byte-faithful to upstream S2 `Switch.tsx` local `field`.
// Unlike the Checkbox field, upstream Switch passes `isInForm` to the field, so
// the `gridColumnStart:{isInForm:'field'}` branch is live here (dormant for the
// demo, which is never in a Form).
const switchFieldStyle = style<
  SwitchStyleState & { isInForm?: boolean; isNoVisibleLabel?: boolean }
>(
  {
    display: "grid",
    gridTemplateColumns: {
      default: ["max-content", "1fr"],
      isNoVisibleLabel: ["max-content"],
    },
    columnGap: "text-to-control",
    width: "fit",
    font: controlFont(),
    "--field-height": {
      type: "height",
      value: controlSize(),
    },
    rowGap: "calc(var(--field-height) - 1lh)",
    gridColumnStart: {
      isInForm: "field",
    },
  },
  getAllowedOverrides(),
);

// The subgrid wrapper (SwitchButton `<label>`) — byte-faithful to upstream
// `wrapper`. Plain style() (no getAllowedOverrides). Note: unlike the Checkbox
// wrapper, the Switch wrapper has no `position:relative` and no isInForm branch;
// upstream still calls it with `{...renderProps, isInForm, size}` (both ignored).
const wrapper = style<SwitchStyleState & { isInForm?: boolean }>({
  display: "grid",
  gridTemplateColumns: "subgrid",
  gridColumnStart: 1,
  gridColumnEnd: -1,
  alignItems: "baseline",
  transition: "colors",
  color: {
    default: baseColor("neutral"),
    isDisabled: {
      default: "disabled",
      forcedColors: "GrayText",
    },
  },
  disableTapHighlight: true,
});

// The track — byte-faithful to upstream `track`. The prior port carried a
// self-inflicted divergence in `backgroundColor.isSelected`: a custom
// `disabledSelectedTrackBackground` light-dark value AND an `isDisabled`-first
// condition order (which, under last-match-wins, let disabled beat emphasized).
// Reverted to upstream's exact `{default, isEmphasized, forcedColors, isDisabled}`
// order + `gray-400` disabled-selected value.
const track = style<SwitchStyleState>({
  ...focusRing(),
  borderRadius: "full",
  "--trackWidth": {
    type: "width",
    value: fontRelative(26),
  },
  "--trackHeight": {
    type: "height",
    value: controlSize("sm"),
  },
  width: "--trackWidth",
  height: "--trackHeight",
  boxSizing: "border-box",
  borderWidth: 2,
  borderStyle: "solid",
  transition: "default",
  forcedColorAdjust: "none",
  borderColor: {
    default: baseColor("gray-800"),
    forcedColors: "ButtonBorder",
    isDisabled: {
      default: "gray-400",
      forcedColors: "GrayText",
    },
    isSelected: "transparent",
  },
  backgroundColor: {
    default: "gray-25",
    isSelected: {
      default: baseColor("neutral"),
      isEmphasized: baseColor("accent-900"),
      forcedColors: "Highlight",
      isDisabled: {
        default: "gray-400",
        forcedColors: "GrayText",
      },
    },
  },
});

const handle = style<SwitchStyleState>({
  height: "full",
  aspectRatio: "square",
  borderRadius: "full",
  backgroundColor: {
    default: baseColor("neutral"),
    isDisabled: {
      default: "gray-400",
      forcedColors: "GrayText",
    },
    isSelected: "gray-25",
  },
  transition: "default",
});

// Individual help text. Byte-faithful to upstream Field.tsx `helpTextStyles`,
// folding in the Switch's inline override (`gridColumnStart:1, paddingTop:0`).
// Rendered through the field's `Text` description/errorMessage slot contract.
// NOTE: the switch demo never sets description/errorMessage and is never invalid,
// so upstream's `HelpText` is `null` in every cert case — this path is faithful
// but dormant here (matches the Checkbox rebuild).
const switchHelpText = style<SwitchStyleState & { isInvalid?: boolean; isDisabled?: boolean }>({
  gridArea: "helptext",
  display: "flex",
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
  cursor: {
    default: "text",
    isDisabled: "default",
  },
  gridColumnStart: 1,
  paddingTop: 0,
});

function normalizeSwitchSize(size: SwitchSize | undefined): S2SwitchSize {
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

// Mirrors upstream's inline `transformStyle`. In the default state the handle is
// 8px smaller than the track; when selected it grows to 6px smaller. CSS cannot
// divide by a unit, so the scale is emulated with a 3d perspective transform
// (scale = perspective / (perspective - translateZ), translateZ hard-coded -4px).
function switchHandleTransform(isSelected: boolean, direction: Direction): JSX.CSSProperties {
  const placement =
    direction === "ltr"
      ? "translateX(calc(var(--trackWidth) - 100% - 4px)) perspective(calc(2 * (var(--trackHeight) - 6px))) translateZ(-4px)"
      : "translateX(calc(100% - var(--trackWidth) + 4px)) perspective(calc(2 * (var(--trackHeight) - 6px))) translateZ(-4px)";

  return {
    transform: isSelected
      ? placement
      : "perspective(calc(var(--trackHeight) - 8px)) translateZ(-4px)",
  };
}

// Faithful reimplementation of upstream `pressScale(handleRef, transformStyle)`:
// combines the base transform with a press-time perspective scale.
function switchHandlePressStyle(
  element: HTMLDivElement | undefined,
  renderProps: ToggleSwitchRenderProps,
  direction: Direction,
): JSX.CSSProperties {
  const pressStyle = {
    ...switchHandleTransform(renderProps.isSelected, direction),
  } as JSX.CSSProperties;
  const styleRecord = pressStyle as Record<string, string | number | undefined>;
  const willChange = styleRecord["will-change"] ?? "";
  styleRecord["will-change"] = `${willChange} transform`.trim();

  if (renderProps.isPressed && element) {
    const { width, height } = element.getBoundingClientRect();
    const perspective = Math.max(height, width / 3, 24);
    pressStyle.transform =
      `${pressStyle.transform ?? ""} perspective(${perspective}px) translate3d(0, 0, -2px)`.trim();
  }

  return pressStyle;
}

/**
 * A switch allows users to turn an individual option on or off.
 * It is usually used to activate or deactivate a specific setting.
 *
 * Named "ToggleSwitch" to avoid conflict with SolidJS's built-in Switch component.
 *
 * Composes the RAC-1.19 form-field split faithfully to upstream S2 `Switch`:
 * a `SwitchField` grid wrapper (owns state/validation/help text) containing a
 * `SwitchButton` subgrid control (label + track/handle indicator) + `HelpText`.
 */
export function ToggleSwitch(props: ToggleSwitchProps): JSX.Element {
  const isInForm = useIsInForm();
  const providerProps = useProviderProps(useFormProps(props));
  const contextProps = getSlottedContextProps(useContext(SwitchContext), props.slot);
  const merged = mergeProps(providerProps, contextProps ?? {}, props);

  const [local, headlessProps] = splitProps(merged, [
    "size",
    "isEmphasized",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "children",
    "description",
    "errorMessage",
    "slot",
  ]);

  const locale = useLocale();
  const size = () => normalizeSwitchSize(local.size);
  const isEmphasized = () => local.isEmphasized;
  const direction = () => locale().direction;
  // Reading `local.children` never invokes a component thunk (a function is
  // truthy as-is), so this is safe alongside the `{local.children}` render.
  const hasLabel = () => !!local.children;
  let handleElement: HTMLDivElement | undefined;

  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);

  // The field grid className. Mirrors upstream `field({...renderProps, isInForm,
  // size, isNoVisibleLabel}, styles)`.
  const getFieldClassName = (renderProps: SwitchFieldRenderProps): string =>
    [
      contextProps?.UNSAFE_className,
      props.UNSAFE_className,
      props.class,
      switchFieldStyle(
        {
          ...renderProps,
          isInForm,
          size: size(),
          isNoVisibleLabel: !hasLabel(),
        },
        mergedStyles(),
      ),
    ]
      .filter(Boolean)
      .join(" ");

  const renderHelpText = (fieldRenderProps: SwitchFieldRenderProps): JSX.Element => (
    <>
      <Show when={local.description && !fieldRenderProps.isInvalid}>
        <Text
          slot="description"
          styles={switchHelpText({ size: size(), isDisabled: fieldRenderProps.isDisabled })}
        >
          {local.description}
        </Text>
      </Show>
      <Show when={fieldRenderProps.isInvalid && local.errorMessage}>
        <Text
          slot="errorMessage"
          styles={switchHelpText({
            size: size(),
            isInvalid: true,
            isDisabled: fieldRenderProps.isDisabled,
          })}
        >
          <CenterBaseline>
            <AlertTriangleIcon aria-hidden="true" />
          </CenterBaseline>
          <span>{local.errorMessage}</span>
        </Text>
      </Show>
    </>
  );

  return (
    <HeadlessSwitchField
      {...headlessProps}
      slot={local.slot ?? undefined}
      class={getFieldClassName}
      style={mergedUnsafeStyle()}
    >
      {(fieldRenderProps: SwitchFieldRenderProps) => (
        <>
          <HeadlessSwitchButton
            class={(renderProps: SwitchButtonRenderProps) =>
              wrapper({ ...renderProps, isInForm, size: size() })
            }
          >
            {(renderProps: SwitchButtonRenderProps) => (
              <>
                <CenterBaseline>
                  <div
                    class={track({ ...renderProps, size: size(), isEmphasized: isEmphasized() })}
                  >
                    <div
                      ref={handleElement}
                      class={handle({ ...renderProps, size: size(), isEmphasized: isEmphasized() })}
                      style={switchHandlePressStyle(handleElement, renderProps, direction())}
                    />
                  </div>
                </CenterBaseline>
                {local.children}
              </>
            )}
          </HeadlessSwitchButton>
          {renderHelpText(fieldRenderProps)}
        </>
      )}
    </HeadlessSwitchField>
  );
}
