// @ts-nocheck
import {
  createContext,
  createUniqueId,
  type JSX,
  splitProps,
  mergeProps,
  Show,
  useContext,
} from "solid-js";
import {
  CheckboxField as HeadlessCheckboxField,
  CheckboxButton as HeadlessCheckboxButton,
  CheckboxGroup as HeadlessCheckboxGroup,
  CheckboxGroupStateContext as HeadlessCheckboxGroupStateContext,
  type CheckboxFieldProps as HeadlessCheckboxFieldProps,
  type CheckboxGroupProps as HeadlessCheckboxGroupProps,
  type CheckboxRenderProps,
  type CheckboxGroupRenderProps,
  type CheckboxFieldRenderProps,
} from "@proyecto-viviana/solidaria-components";
// The headless group is the single source of truth for the description/error ids
// (minted by createField, threaded onto the group AND every item's
// aria-describedby via this WeakMap). We render the visible HelpText ourselves
// (renderHelpText={false}) but read the id back from here so all three — group
// node, item inputs, and our <Text> — resolve to the same element.
import { checkboxGroupData } from "@proyecto-viviana/solidaria";
import { Text } from "../text";
import type { StyleString } from "../style";
import { baseColor, focusRing, space, style } from "../style" with { type: "macro" };
import {
  controlBorderRadius,
  controlFont,
  controlSize,
  field,
  fieldLabel,
  getAllowedOverrides,
} from "../s2-internal/style-utils" with { type: "macro" };
import { CenterBaseline } from "../icon/center-baseline";
import AlertTriangleIcon from "../icon/s2wf-icons/AlertTriangleIcon";
import AsteriskIcon from "../icon/ui-icons/Asterisk";
import CheckmarkIcon from "../icon/ui-icons/Checkmark";
import DashIcon from "../icon/ui-icons/Dash";
import { useProviderProps } from "../provider";
import { FormContext, useFormProps, useIsInForm } from "../form";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";

export type CheckboxSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg";
type S2CheckboxSize = "S" | "M" | "L" | "XL";
export type CheckboxGroupOrientation = "horizontal" | "vertical";
export type CheckboxGroupLabelPosition = "top" | "side";
export type CheckboxGroupLabelAlign = "start" | "end";
export type CheckboxGroupNecessityIndicator = "icon" | "label";

interface CheckboxGroupStyleContextValue {
  size?: CheckboxSize;
  isEmphasized?: boolean;
}

const CheckboxGroupStyleContext = createContext<CheckboxGroupStyleContextValue>({});

export interface CheckboxProps extends Omit<
  HeadlessCheckboxFieldProps,
  "class" | "children" | "style" | "slot" | "ref" | "inputRef"
> {
  /** The size of the checkbox. */
  size?: CheckboxSize;
  /** Whether the checkbox should be displayed with an emphasized style. */
  isEmphasized?: boolean;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Additional CSS class name. */
  class?: string;
  /** Label text for the checkbox. */
  children?: JSX.Element;
  /** A description for the checkbox, displayed below the label. */
  description?: JSX.Element;
  /** An error message for the checkbox, displayed when invalid. */
  errorMessage?: JSX.Element;
  /** Slot name when used in a Spectrum context. */
  slot?: string | null;
  /** Ref for the underlying field (root `<div>`) element. */
  ref?: RefLike<HTMLDivElement>;
  /** Ref for the underlying input element. */
  inputRef?: RefLike<HTMLInputElement>;
}

export interface CheckboxGroupProps extends Omit<
  HeadlessCheckboxGroupProps,
  "class" | "children" | "style" | "slot" | "ref"
> {
  /** The size of the Checkboxes in the CheckboxGroup. */
  size?: CheckboxSize;
  /** The axis the checkboxes should align with. */
  orientation?: CheckboxGroupOrientation;
  /** The label's overall position relative to the checkbox items. */
  labelPosition?: CheckboxGroupLabelPosition;
  /** The label's horizontal alignment relative to the checkbox items. */
  labelAlign?: CheckboxGroupLabelAlign;
  /** Whether the required state should be shown as an icon or text label. */
  necessityIndicator?: CheckboxGroupNecessityIndicator;
  /** A contextual help element to place next to the label. */
  contextualHelp?: JSX.Element;
  /** Whether the Checkboxes should be displayed with an emphasized style. */
  isEmphasized?: boolean;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  /** Children checkboxes. */
  children?: JSX.Element;
  /** Label for the group. */
  label?: JSX.Element;
  /** Description for the group. */
  description?: JSX.Element;
  /** Error message when invalid. */
  errorMessage?: JSX.Element;
  /** Slot name when used in a Spectrum context. */
  slot?: string | null;
  /** Ref for the checkbox group root element. */
  ref?: RefLike<HTMLDivElement>;
}

interface CheckboxStyleProps {
  size?: S2CheckboxSize;
  isEmphasized?: boolean;
  orientation?: CheckboxGroupOrientation;
  labelPosition?: "top" | "side";
  labelAlign?: "start" | "end";
  isInForm?: boolean;
}

type CheckboxStyleState = CheckboxRenderProps & CheckboxStyleProps;
type CheckboxGroupStyleState = CheckboxGroupRenderProps & CheckboxStyleProps;

export const CheckboxContext = createContext<SpectrumContextValue<CheckboxProps>>(null);
export const CheckboxGroupContext = createContext<SpectrumContextValue<CheckboxGroupProps>>(null);

const checkboxGroupRoot = style<CheckboxGroupStyleState>(
  {
    ...field(),
    "--field-gap": {
      type: "rowGap",
      value: "calc(var(--field-height) - 1lh)",
    },
  },
  getAllowedOverrides(),
);

const checkboxGroupLabelWrapper = style<CheckboxGroupStyleState>({
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
  // Byte-faithful to upstream Field.tsx FieldLabel outer `<div>` contain: the
  // `isQuiet:'none'` branch is declared last, so when CheckboxGroup passes
  // `isQuiet` (which it always does — see renderChildren) it wins under
  // last-match-wins and the label wrapper computes `contain:none` on the default
  // `labelPosition:top` (previously mis-computed `contain:inline-size`).
  contain: {
    labelPosition: {
      top: "inline-size",
    },
    isQuiet: "none",
  },
});

const checkboxGroupLabel = style<CheckboxGroupStyleState>({
  ...fieldLabel(),
});

const checkboxGroupItems = style<CheckboxGroupStyleState>({
  gridArea: "input",
  display: "flex",
  flexDirection: {
    orientation: {
      vertical: "column",
      horizontal: "row",
    },
  },
  lineHeight: "ui",
  rowGap: "--field-gap",
  columnGap: 16,
  // Byte-faithful to upstream CheckboxGroup.tsx: only a horizontal group wraps.
  // The previous unconditional `"wrap"` was a self-inflicted divergence — for a
  // vertical group (the demo default) upstream computes `flex-wrap:nowrap`.
  flexWrap: {
    orientation: {
      horizontal: "wrap",
    },
  },
});

const checkboxGroupHelpText = style<CheckboxGroupStyleState>({
  gridArea: "helptext",
  display: "flex",
  alignItems: "baseline",
  gap: "text-to-visual",
  font: controlFont(),
  contain: "inline-size",
  paddingTop: "--field-gap",
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
  color: {
    default: "neutral-subdued",
    isInvalid: {
      default: "negative-1000",
      forcedColors: "Mark",
    },
    isDisabled: {
      default: "disabled",
      forcedColors: "GrayText",
    },
  },
  cursor: {
    default: "text",
    isDisabled: "default",
  },
});

const checkboxGroupRequiredIcon = style({
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
});

const checkboxGroupNoWrap = style({
  whiteSpace: "nowrap",
});

// The field grid — byte-faithful to upstream S2 `Checkbox.tsx` local `field`.
// `gridColumnStart:{isInForm:'field'}` is deliberately dormant: upstream calls
// field() with {size, isInCheckboxGroup, isNoVisibleLabel} and never passes
// isInForm, so this branch never fires (isInForm is applied to the subgrid
// wrapper below instead). Kept for byte-parity with the upstream style object.
const checkboxFieldStyle = style<
  CheckboxStyleState & { isInCheckboxGroup?: boolean; isNoVisibleLabel?: boolean }
>(
  {
    display: "grid",
    gridTemplateColumns: {
      default: ["max-content", "1fr"],
      isNoVisibleLabel: ["max-content"],
    },
    columnGap: "text-to-control",
    alignContent: "start",
    width: {
      default: "fit",
      isInCheckboxGroup: "auto",
    },
    font: controlFont(),
    "--field-height": {
      type: "height",
      value: controlSize(),
    },
    rowGap: {
      default: "calc(var(--field-height) - 1lh)",
      isInCheckboxGroup: {
        size: {
          S: space(1),
          M: space(1),
          L: 2,
          XL: 2,
        },
      },
    },
    gridColumnStart: {
      isInForm: "field",
    },
  },
  getAllowedOverrides(),
);

// The subgrid wrapper (CheckboxButton `<label>`) — byte-faithful to upstream
// `wrapper`. No getAllowedOverrides (upstream's wrapper is a plain style()).
const wrapper = style<CheckboxStyleState & { isInForm?: boolean }>({
  display: "grid",
  gridTemplateColumns: "subgrid",
  gridColumnStart: 1,
  gridColumnEnd: -1,
  position: "relative",
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

// The visible label span sits in the second grid column — upstream renders
// `<span className={style({gridColumnStart: 2})}>{children}</span>`.
const labelSpan = style({ gridColumnStart: 2 });

// Individual-field help text. Byte-faithful to upstream Field.tsx
// `helpTextStyles`, folding in the checkbox's inline override
// (`gridColumnStart:{default:1,isInCheckboxGroup:2}, paddingTop:0`). Rendered
// via the field's `Text` description/errorMessage slot contract. NOTE: the
// checkbox demo never sets description/errorMessage, so upstream's `HelpText`
// is `null` in every cert case — this path is faithful but dormant here.
const checkboxHelpText = style<
  CheckboxStyleState & { isInvalid?: boolean; isDisabled?: boolean; isInCheckboxGroup?: boolean }
>({
  gridArea: "helptext",
  display: "flex",
  alignItems: "baseline",
  gap: "text-to-visual",
  font: controlFont(),
  color: {
    default: "neutral-subdued",
    isInvalid: {
      default: "negative-1000",
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
  gridColumnStart: {
    default: 1,
    isInCheckboxGroup: 2,
  },
  paddingTop: 0,
});

const checkboxBox = style<CheckboxStyleState>({
  ...focusRing(),
  ...controlBorderRadius("sm"),
  size: controlSize("sm"),
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  // The register draws control chrome edges at 1px, which is what the matte
  // register bakes in (`result.borderWidth = 1` in s2-internal/style-utils.ts,
  // both the `chip` and `matte` branches). This box cannot spread control()
  // itself — control() unconditionally emits display/paddingX/minWidth/font,
  // all of which would break a square choice box — so it carries the literal.
  // The identical hand-rolled block in menu/s2-menu-styles.ts must move with it.
  borderWidth: 1,
  boxSizing: "border-box",
  borderStyle: "solid",
  transition: "default",
  forcedColorAdjust: "none",
  backgroundColor: {
    // The matte well, not paper. `gray-25` is #ffffff in light
    // (style/glasselated-ramps.ts:87), so the unselected box read as a hole
    // punched through the panel rather than a recess. `well` resolves to
    // var(--surface-well) (style/spectrum-theme.ts:927), the register's inset
    // control surface. NOTE: in light --surface-well sits very close to the app
    // surface, so the `borderColor.default` below is what carries the box's
    // shape — it is deliberately NOT softened to `well-border`.
    default: "well",
    forcedColors: "Background",
    isSelected: {
      // Accent-on-selection is the register's selection idiom, not an emphasis
      // variant, so the accent fill moves to `default` — previously a
      // non-emphasized selected checkbox filled with the text ramp and rendered
      // no accent at all. `isEmphasized` is preserved as a real, visible step
      // rather than deleted: it goes one stop deeper in the same accent channel
      // (accent-1000), so the public prop keeps changing what it renders.
      // Both stops are held flat rather than moved to the
      // lightDark("accent-900","accent-700") idiom used by Button/Tag, because
      // the checkmark ink here is `gray-25`, which flips to near-black in dark
      // (style/glasselated-ramps.ts:87) — near-black ink on dark accent-700
      // would not clear AA.
      default: baseColor("accent-900"),
      isEmphasized: baseColor("accent-1000"),
      forcedColors: "Highlight",
      isInvalid: {
        default: baseColor("negative-900"),
        forcedColors: "Mark",
      },
      isDisabled: {
        default: "gray-400",
        forcedColors: "GrayText",
      },
    },
  },
  borderColor: {
    default: baseColor("gray-800"),
    forcedColors: "ButtonBorder",
    isInvalid: {
      default: baseColor("negative"),
      forcedColors: "Mark",
    },
    isDisabled: {
      default: "gray-400",
      forcedColors: "GrayText",
    },
    isSelected: "transparent",
  },
});

const checkboxIcon = style({
  pointerEvents: "none",
  "--iconPrimary": {
    type: "fill",
    value: {
      default: "gray-25",
      forcedColors: "HighlightText",
    },
  },
});

const iconSize = {
  S: "XS",
  M: "S",
  L: "M",
  XL: "L",
} as const;

const checkmarkIconPixelSize = {
  S: 10,
  M: 10,
  L: 10,
  XL: 12,
} as const;

const dashIconPixelSize = {
  S: 8,
  M: 8,
  L: 10,
  XL: 12,
} as const;

function normalizeCheckboxSize(size: CheckboxSize | undefined): S2CheckboxSize {
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

function checkboxPressScaleStyle(
  element: HTMLDivElement | undefined,
  renderProps: CheckboxRenderProps,
): JSX.CSSProperties {
  const pressStyle = { "will-change": "transform" } as JSX.CSSProperties;

  if (renderProps.isPressed && element) {
    const { width, height } = element.getBoundingClientRect();
    pressStyle.transform = `perspective(${Math.max(height, width / 3, 24)}px) translate3d(0, 0, -2px)`;
  }

  return pressStyle;
}

function checkboxIconSizeStyle(size: number): JSX.CSSProperties {
  return {
    width: `${size}px`,
    height: `${size}px`,
  };
}

function requiredIconStyle(size: S2CheckboxSize): JSX.CSSProperties {
  const pixelSize = size === "L" || size === "XL" ? 10 : 8;
  return {
    width: `${pixelSize}px`,
    height: `${pixelSize}px`,
  };
}

/**
 * A checkbox allows users to select one or more items from a set.
 *
 */
export function Checkbox(props: CheckboxProps): JSX.Element {
  const groupStyleContext = useContext(CheckboxGroupStyleContext);
  const isInForm = useIsInForm();
  const isInCheckboxGroup = !!useContext(HeadlessCheckboxGroupStateContext);
  const providerProps = useProviderProps(useFormProps(props));
  const contextProps = getSlottedContextProps(useContext(CheckboxContext), props.slot);
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
    "ref",
    "inputRef",
  ]);

  const size = () => normalizeCheckboxSize(local.size ?? groupStyleContext.size);
  const isEmphasized = () => local.isEmphasized ?? groupStyleContext.isEmphasized;
  // Upstream checks `!children` for the truthiness — reading `local.children`
  // never invokes a component thunk (a function is truthy as-is), so this is
  // safe to read alongside the `<span>{local.children}</span>` render below.
  const hasLabel = () => !!local.children;
  // Upstream: `size={isInCheckboxGroup ? smallerSize[size] : size}` — `iconSize`
  // is the port's `smallerSize` map.
  const helpTextSize = () => (isInCheckboxGroup ? iconSize[size()] : size());
  let boxElement: HTMLDivElement | undefined;
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const assignRootRef = mergeContextRefs(
    (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
    props.ref,
  );
  const assignInputRef = mergeContextRefs(
    (contextProps as { inputRef?: RefLike<HTMLInputElement> } | null)?.inputRef,
    props.inputRef,
  );

  // The field grid className. Mirrors upstream `field({size, isInCheckboxGroup,
  // isNoVisibleLabel}, styles)` — and deliberately does NOT pass `isInForm`, so
  // the field's dormant `gridColumnStart:{isInForm:'field'}` stays inert
  // (upstream passes isInForm to the wrapper subgrid instead).
  const getFieldClassName = (_renderProps?: CheckboxFieldRenderProps): string =>
    [
      contextProps?.UNSAFE_className,
      props.UNSAFE_className,
      props.class,
      checkboxFieldStyle(
        {
          size: size(),
          isInCheckboxGroup,
          isNoVisibleLabel: !hasLabel(),
        },
        mergedStyles(),
      ),
    ]
      .filter(Boolean)
      .join(" ");

  // Upstream: `isInvalid={isInCheckboxGroup ? false : isInvalid}` on the HelpText
  // (in a group, validation is surfaced at the group level, not per-checkbox).
  const invalidFor = (fieldRenderProps: CheckboxFieldRenderProps): boolean =>
    isInCheckboxGroup ? false : fieldRenderProps.isInvalid;

  const renderHelpText = (fieldRenderProps: CheckboxFieldRenderProps): JSX.Element => (
    <>
      <Show when={local.description && !invalidFor(fieldRenderProps)}>
        <Text
          slot="description"
          styles={checkboxHelpText({
            size: helpTextSize(),
            isDisabled: fieldRenderProps.isDisabled,
            isInCheckboxGroup,
          })}
        >
          {local.description}
        </Text>
      </Show>
      <Show when={invalidFor(fieldRenderProps) && local.errorMessage}>
        <Text
          slot="errorMessage"
          styles={checkboxHelpText({
            size: helpTextSize(),
            isInvalid: true,
            isDisabled: fieldRenderProps.isDisabled,
            isInCheckboxGroup,
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
    <HeadlessCheckboxField
      {...headlessProps}
      ref={(element) => assignRootRef(element)}
      inputRef={(element) => assignInputRef(element)}
      slot={local.slot ?? undefined}
      class={getFieldClassName}
      style={mergedUnsafeStyle()}
    >
      {(fieldRenderProps: CheckboxFieldRenderProps) => (
        <>
          <HeadlessCheckboxButton
            class={(renderProps: CheckboxRenderProps) =>
              wrapper({ ...renderProps, isInForm, size: size() })
            }
          >
            {(renderProps: CheckboxRenderProps) => {
              const checkbox = (
                <div
                  ref={boxElement}
                  class={checkboxBox({
                    ...renderProps,
                    isSelected: renderProps.isSelected || renderProps.isIndeterminate,
                    size: size(),
                    isEmphasized: isEmphasized(),
                  })}
                  style={checkboxPressScaleStyle(boxElement, renderProps)}
                >
                  <Show when={renderProps.isIndeterminate}>
                    <DashIcon
                      size={iconSize[size()]}
                      class={checkboxIcon}
                      style={checkboxIconSizeStyle(dashIconPixelSize[size()])}
                    />
                  </Show>
                  <Show when={renderProps.isSelected && !renderProps.isIndeterminate}>
                    <CheckmarkIcon
                      size={iconSize[size()]}
                      class={checkboxIcon}
                      style={checkboxIconSizeStyle(checkmarkIconPixelSize[size()])}
                    />
                  </Show>
                </div>
              );

              // Only render checkbox without center baseline if no label.
              // This avoids expanding the checkbox height to the font's line height.
              if (!hasLabel()) {
                return checkbox;
              }

              return (
                <>
                  <CenterBaseline>{checkbox}</CenterBaseline>
                  <span class={labelSpan}>{local.children}</span>
                </>
              );
            }}
          </HeadlessCheckboxButton>
          {renderHelpText(fieldRenderProps)}
        </>
      )}
    </HeadlessCheckboxField>
  );
}

/**
 * A checkbox group allows users to select multiple items from a list.
 *
 */
export function CheckboxGroup(props: CheckboxGroupProps): JSX.Element {
  const isInForm = useIsInForm();
  const formContext = useContext(FormContext);
  const providerProps = useProviderProps(useFormProps(props));
  const contextProps = getSlottedContextProps(useContext(CheckboxGroupContext), props.slot);
  const defaultProps: Partial<CheckboxGroupProps> = {
    orientation: "vertical",
    labelPosition: "top",
    labelAlign: "start",
    necessityIndicator: "icon",
  };
  const mergedProps = mergeProps(defaultProps, providerProps, contextProps ?? {}, props);
  const [local, headlessProps] = splitProps(mergedProps, [
    "size",
    "orientation",
    "labelPosition",
    "labelAlign",
    "necessityIndicator",
    "contextualHelp",
    "isEmphasized",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "label",
    "description",
    "errorMessage",
    "children",
    "slot",
    "ref",
  ]);
  const size = () => normalizeCheckboxSize(local.size);
  const labelPosition = () => local.labelPosition ?? "top";
  const labelAlign = () => local.labelAlign ?? "start";
  const necessityIndicator = () => local.necessityIndicator ?? "icon";
  const idBase = createUniqueId();
  const labelId = `${idBase}-label`;
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const assignRootRef = mergeContextRefs(
    (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
    props.ref,
  );

  const getClassName = (renderProps: CheckboxGroupRenderProps): string =>
    [
      contextProps?.UNSAFE_className,
      props.UNSAFE_className,
      props.class,
      checkboxGroupRoot(
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

  const renderChildren = (renderProps: CheckboxGroupRenderProps) => (
    <>
      <Show when={local.label}>
        <div
          class={checkboxGroupLabelWrapper({
            ...renderProps,
            size: size(),
            labelPosition: labelPosition(),
            labelAlign: labelAlign(),
            // Upstream FieldLabel is rendered by CheckboxGroup with `isQuiet`
            // ("Make the label affect the width of the group"), so the wrapper's
            // `contain` resolves to `none` (label width feeds the group), not the
            // `inline-size` a bare labelPosition:top would give.
            isQuiet: true,
          })}
        >
          {/* Upstream renders the group label via RAC <Label>, but a group is not
              a labelable element: RAC CheckboxGroup supplies LabelContext with
              `elementType: 'span'`, so the group label is a <span> (associated to
              the group by `aria-labelledby`, not `for`). The hand-roll matches that
              output with a <span id>. */}
          <span id={labelId} class={checkboxGroupLabel({ ...renderProps, size: size() })}>
            {local.label}
            <Show when={headlessProps.isRequired || necessityIndicator() === "label"}>
              <span class={checkboxGroupNoWrap}>
                &nbsp;
                <Show
                  when={necessityIndicator() === "icon"}
                  fallback={
                    <span aria-hidden={headlessProps.isRequired ? true : undefined}>
                      {headlessProps.isRequired ? "(required)" : "(optional)"}
                    </span>
                  }
                >
                  <AsteriskIcon
                    size={size() === "S" ? "M" : size()}
                    class={checkboxGroupRequiredIcon}
                    style={requiredIconStyle(size())}
                    aria-hidden="true"
                  />
                </Show>
              </span>
            </Show>
          </span>
          <Show when={local.contextualHelp}>
            <span data-slot="contextualHelp">{local.contextualHelp}</span>
          </Show>
        </div>
      </Show>
      <div
        class={checkboxGroupItems({
          ...renderProps,
          size: size(),
          orientation: local.orientation,
        })}
      >
        <FormContext.Provider
          value={{
            ...(formContext ?? {}),
            get size() {
              return size();
            },
            isRequired: undefined,
          }}
        >
          <CheckboxContext.Provider
            value={{
              get isEmphasized() {
                return local.isEmphasized;
              },
            }}
          >
            {local.children}
          </CheckboxContext.Provider>
        </FormContext.Provider>
      </div>
      {/* Byte-faithful to upstream Field.tsx HelpText: the description renders a
          RAC `<Text slot="description">` (a `<span>`), not a `<div>`. */}
      <Show when={local.description && !renderProps.isInvalid}>
        <Text
          slot="description"
          id={checkboxGroupData.get(renderProps.state)?.descriptionId}
          styles={checkboxGroupHelpText({ ...renderProps, size: size() })}
        >
          {local.description}
        </Text>
      </Show>
      {/* Upstream renders the invalid message through a RAC `<FieldError>`, which
          is a `<Text slot="errorMessage">` (a `<span>`) with NO `role="alert"`
          (RAC FieldError carries no alert role; the group's `aria-describedby`
          points here for the association). */}
      <Show when={local.errorMessage && renderProps.isInvalid}>
        <Text
          slot="errorMessage"
          id={checkboxGroupData.get(renderProps.state)?.errorMessageId}
          styles={checkboxGroupHelpText({ ...renderProps, size: size() })}
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
    <CheckboxGroupStyleContext.Provider
      value={{
        get size() {
          return local.size;
        },
        get isEmphasized() {
          return local.isEmphasized;
        },
      }}
    >
      <HeadlessCheckboxGroup
        {...headlessProps}
        value={headlessProps.value}
        defaultValue={headlessProps.defaultValue}
        onChange={headlessProps.onChange}
        isDisabled={headlessProps.isDisabled}
        isReadOnly={headlessProps.isReadOnly}
        isRequired={headlessProps.isRequired}
        isInvalid={headlessProps.isInvalid}
        // Pass the field content down so the headless mints the description/error
        // ids and threads them onto the group and every item's aria-describedby —
        // the single source of truth. renderHelpText={false} suppresses the
        // headless's own plain div; we render the styled <Text> above.
        description={local.description}
        errorMessage={local.errorMessage}
        renderHelpText={false}
        aria-labelledby={headlessProps["aria-labelledby"] ?? (local.label ? labelId : undefined)}
        ref={(element) => assignRootRef(element)}
        slot={local.slot ?? undefined}
        class={getClassName}
        style={mergedUnsafeStyle()}
        data-size={size()}
      >
        {renderChildren}
      </HeadlessCheckboxGroup>
    </CheckboxGroupStyleContext.Provider>
  );
}
