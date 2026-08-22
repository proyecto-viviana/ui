// @ts-nocheck

/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/RadioGroup.tsx

// Port of packages/@react-spectrum/s2/src/RadioGroup.tsx.

import {
  children as resolveChildren,
  mergeProps,
  Show,
  splitProps,
  type JSX,
  createContext,
  createUniqueId,
  useContext,
} from "solid-js";
import {
  RadioGroup as HeadlessRadioGroup,
  Radio as HeadlessRadio,
  type RadioGroupProps as HeadlessRadioGroupProps,
  type RadioProps as HeadlessRadioProps,
  type RadioGroupRenderProps,
  type RadioRenderProps,
} from "@proyecto-viviana/solidaria-components";
// Single source of truth for the group's description/error ids: the headless
// createRadioGroup mints them (via createField) and threads them onto both the
// group node and every child radio's aria-describedby; the styled help-text
// nodes below read the same ids back so the associations resolve identically.
import { radioGroupData } from "@proyecto-viviana/solidaria";
import type { StyleString } from "../style";
import { baseColor, focusRing, style } from "../style" with { type: "macro" };
import {
  controlFont,
  controlSize,
  field,
  fieldLabel,
  getAllowedOverrides,
} from "../s2-internal/style-utils" with { type: "macro" };
import { Text } from "../text";
import { CenterBaseline } from "../icon/center-baseline";
import AlertTriangleIcon from "../icon/s2wf-icons/AlertTriangleIcon";
import AsteriskIcon from "../icon/ui-icons/Asterisk";
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

export type RadioGroupOrientation = "horizontal" | "vertical";
export type RadioGroupSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg";
type S2RadioGroupSize = "S" | "M" | "L" | "XL";
export type RadioGroupLabelPosition = "top" | "side";
export type RadioGroupLabelAlign = "start" | "end";
export type RadioGroupNecessityIndicator = "icon" | "label";

interface RadioStyleContextValue {
  size?: RadioGroupSize;
  isEmphasized?: boolean;
}

const RadioStyleContext = createContext<RadioStyleContextValue>({});

export interface RadioGroupProps extends Omit<
  HeadlessRadioGroupProps,
  "class" | "children" | "style" | "slot" | "ref"
> {
  /** The size of the RadioGroup. */
  size?: RadioGroupSize;
  /** The axis the radio elements should align with. */
  orientation?: RadioGroupOrientation;
  /** The label's overall position relative to the radio items. */
  labelPosition?: RadioGroupLabelPosition;
  /** The label's horizontal alignment relative to the radio items. */
  labelAlign?: RadioGroupLabelAlign;
  /** Whether the required state should be shown as an icon or text label. */
  necessityIndicator?: RadioGroupNecessityIndicator;
  /** A contextual help element to place next to the label. */
  contextualHelp?: JSX.Element;
  /** Whether the RadioGroup should be displayed with an emphasized style. */
  isEmphasized?: boolean;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  /** Label for the group. */
  label?: JSX.Element;
  /** Description for the group. */
  description?: JSX.Element;
  /** Error message when invalid. */
  errorMessage?: JSX.Element;
  /** Children radios. */
  children?: JSX.Element;
  /** Slot name when used in a Spectrum context. */
  slot?: string | null;
  /** Ref for the radio group root element. */
  ref?: RefLike<HTMLDivElement>;
}

export interface RadioProps extends Omit<
  HeadlessRadioProps,
  "class" | "children" | "render" | "style" | "slot" | "ref" | "inputRef"
> {
  /** The size of the radio. Usually inherited from the RadioGroup or Form. */
  size?: RadioGroupSize;
  /** Whether the radio should be displayed with an emphasized style. */
  isEmphasized?: boolean;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  /** Label text for the element. */
  children?: JSX.Element;
  /** Slot name when used in a Spectrum context. */
  slot?: string | null;
  /** Ref for the underlying label element. */
  ref?: RefLike<HTMLLabelElement>;
  /** Ref for the underlying input element. */
  inputRef?: RefLike<HTMLInputElement>;
}

interface RadioStyleProps {
  size?: S2RadioGroupSize;
  isEmphasized?: boolean;
  labelPosition?: "top" | "side";
  labelAlign?: "start" | "end";
  isInForm?: boolean;
}

type RadioStyleState = RadioRenderProps & RadioStyleProps;
type RadioGroupStyleState = RadioGroupRenderProps & RadioStyleProps;

export const RadioContext = createContext<SpectrumContextValue<RadioProps>>(null);
export const RadioGroupContext = createContext<SpectrumContextValue<RadioGroupProps>>(null);

const radioGroupRoot = style<RadioGroupStyleState>(
  {
    ...field(),
    "--field-gap": {
      type: "rowGap",
      value: "calc(var(--field-height) - 1lh)",
    },
  },
  getAllowedOverrides(),
);

const radioGroupLabelWrapper = style<RadioGroupStyleState>({
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
    // Upstream FieldLabel passes `isQuiet` on group labels so the label affects
    // the group's width; when quiet, containment is disabled (last-match-wins).
    isQuiet: "none",
  },
});

const radioGroupLabel = style<RadioGroupStyleState>({
  ...fieldLabel(),
});

const radioGroupItems = style<RadioGroupStyleState>({
  gridArea: "input",
  display: "flex",
  flexDirection: {
    orientation: {
      vertical: "column",
      horizontal: "row",
    },
  },
  flexWrap: {
    orientation: {
      horizontal: "wrap",
    },
  },
  columnGap: 16,
  rowGap: "--field-gap",
});

const radioGroupHelpText = style<RadioGroupStyleState>({
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

const radioGroupRequiredIcon = style({
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
});

const radioGroupNoWrap = style({
  whiteSpace: "nowrap",
});

const wrapper = style<RadioStyleState & { isInForm?: boolean }>(
  {
    display: "flex",
    position: "relative",
    columnGap: "text-to-control",
    alignItems: "baseline",
    font: controlFont(),
    transition: "colors",
    color: {
      default: baseColor("neutral"),
      isDisabled: {
        default: "disabled",
        forcedColors: "GrayText",
      },
    },
    gridColumnStart: {
      isInForm: "field",
    },
    disableTapHighlight: true,
  },
  getAllowedOverrides(),
);

const circle = style<RadioStyleState>({
  ...focusRing(),
  size: controlSize("sm"),
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "default",
  borderRadius: "full",
  borderStyle: "solid",
  boxSizing: "border-box",
  borderWidth: {
    default: 1,
    isSelected: "calc((self(height) - (4 / 16) * 1rem) / 2)",
  },
  forcedColorAdjust: "none",
  backgroundColor: "well",
  borderColor: {
    default: baseColor("gray-800"),
    forcedColors: "ButtonBorder",
    isSelected: {
      // The selected dot IS this border: `borderWidth` above swells to
      // calc((self(height) - 4px) / 2) when selected, leaving a 4px centre of
      // `backgroundColor`. Without an explicit `default` here the non-emphasized
      // selected state silently inherits the resting `default` above, so the two
      // are coupled by accident rather than by intent. Spelled out to break that.
      // Checkbox's non-emphasized selected ink is baseColor("neutral")
      // (checkbox/index.tsx:383), which is unavailable here — `neutral` is not a
      // key of the borderColor map (style/spectrum-theme.ts:948-961), unlike the
      // backgroundColor map it fills through there.
      default: baseColor("gray-800"),
      isEmphasized: baseColor("accent-900"),
      forcedColors: "Highlight",
    },
    isInvalid: {
      default: baseColor("negative"),
      forcedColors: "Mark",
    },
    isDisabled: {
      default: "gray-400",
      forcedColors: "GrayText",
    },
  },
});

function normalizeRadioSize(size: RadioGroupSize | undefined): S2RadioGroupSize {
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

function radioPressScaleStyle(
  element: HTMLDivElement | undefined,
  renderProps: RadioRenderProps,
): JSX.CSSProperties {
  const pressStyle = { "will-change": "transform" } as JSX.CSSProperties;

  if (renderProps.isPressed && element) {
    const { width, height } = element.getBoundingClientRect();
    pressStyle.transform = `perspective(${Math.max(height, width / 3, 24)}px) translate3d(0, 0, -2px)`;
  }

  return pressStyle;
}

function requiredIconStyle(size: S2RadioGroupSize): JSX.CSSProperties {
  const pixelSize = size === "L" || size === "XL" ? 10 : 8;
  return {
    width: `${pixelSize}px`,
    height: `${pixelSize}px`,
  };
}

/**
 * Radio groups allow users to select a single option from a list of mutually exclusive options.
 */
export function RadioGroup(props: RadioGroupProps): JSX.Element {
  const isInForm = useIsInForm();
  const formContext = useContext(FormContext);
  const providerProps = useProviderProps(useFormProps(props));
  const contextProps = getSlottedContextProps(useContext(RadioGroupContext), props.slot);
  const defaultProps: Partial<RadioGroupProps> = {
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
  const size = () => normalizeRadioSize(local.size);
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

  const getClassName = (renderProps: RadioGroupRenderProps): string =>
    [
      contextProps?.UNSAFE_className,
      props.UNSAFE_className,
      props.class,
      radioGroupRoot(
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
  const renderChildren = (renderProps: RadioGroupRenderProps) => (
    <>
      <Show when={local.label}>
        <div
          class={radioGroupLabelWrapper({
            ...renderProps,
            size: size(),
            labelPosition: labelPosition(),
            labelAlign: labelAlign(),
            // Upstream always renders the group label as a quiet FieldLabel.
            isQuiet: true,
          })}
        >
          <span id={labelId} class={radioGroupLabel({ ...renderProps, size: size() })}>
            {local.label}
            <Show when={headlessProps.isRequired || necessityIndicator() === "label"}>
              <span class={radioGroupNoWrap}>
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
                    class={radioGroupRequiredIcon}
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
        class={radioGroupItems({
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
          <RadioContext.Provider
            value={{
              get isEmphasized() {
                return local.isEmphasized;
              },
            }}
          >
            {local.children}
          </RadioContext.Provider>
        </FormContext.Provider>
      </div>
      {/* Byte-faithful to upstream Field.tsx HelpText: the description renders a
          RAC `<Text slot="description">` (a `<span>`), not a `<div>`. The id is
          the single-source id minted by the headless createRadioGroup (also
          threaded onto the group node and every child radio's aria-describedby). */}
      <Show when={local.description && !renderProps.isInvalid}>
        <Text
          slot="description"
          id={radioGroupData.get(renderProps.state)?.descriptionId}
          styles={radioGroupHelpText({ ...renderProps, size: size() })}
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
          id={radioGroupData.get(renderProps.state)?.errorMessageId}
          styles={radioGroupHelpText({ ...renderProps, size: size() })}
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
    <RadioStyleContext.Provider
      value={{
        get size() {
          return local.size;
        },
        get isEmphasized() {
          return local.isEmphasized;
        },
      }}
    >
      <HeadlessRadioGroup
        {...headlessProps}
        value={headlessProps.value}
        defaultValue={headlessProps.defaultValue}
        onChange={headlessProps.onChange}
        isDisabled={headlessProps.isDisabled}
        isReadOnly={headlessProps.isReadOnly}
        isRequired={headlessProps.isRequired}
        isInvalid={headlessProps.isInvalid}
        orientation={local.orientation}
        // Pass the help text down so createRadioGroup mints the description/error
        // ids (shared with every child radio via radioGroupData) and sets the
        // group's aria-describedby; renderHelpText={false} keeps the visible node
        // ours (the styled help-text divs above) to match RAC's slot model.
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
      </HeadlessRadioGroup>
    </RadioStyleContext.Provider>
  );
}

/**
 * Radio buttons allow users to select a single option from a list of mutually exclusive options.
 */
export function Radio(props: RadioProps): JSX.Element {
  const groupStyleContext = useContext(RadioStyleContext);
  const isInForm = useIsInForm();
  const providerProps = useProviderProps(useFormProps(props));
  const contextProps = getSlottedContextProps(useContext(RadioContext), props.slot);
  const mergedProps = mergeProps(providerProps, contextProps ?? {}, props);
  const [local, headlessProps] = splitProps(mergedProps, [
    "size",
    "isEmphasized",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "children",
    "slot",
    "ref",
    "inputRef",
  ]);
  const size = () => normalizeRadioSize(local.size ?? groupStyleContext.size);
  const isEmphasized = () => local.isEmphasized ?? groupStyleContext.isEmphasized;
  let circleElement: HTMLDivElement | undefined;
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const assignRootRef = mergeContextRefs(
    (contextProps as { ref?: RefLike<HTMLLabelElement> } | null)?.ref,
    props.ref,
  );
  const assignInputRef = mergeContextRefs(
    (contextProps as { inputRef?: RefLike<HTMLInputElement> } | null)?.inputRef,
    props.inputRef,
  );

  const getClassName = (renderProps: RadioRenderProps): string =>
    [
      contextProps?.UNSAFE_className,
      props.UNSAFE_className,
      props.class,
      wrapper(
        {
          ...renderProps,
          size: size(),
          isEmphasized: isEmphasized(),
          isInForm,
        },
        mergedStyles(),
      ),
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <HeadlessRadio
      {...headlessProps}
      ref={(element) => assignRootRef(element)}
      inputRef={(element) => assignInputRef(element)}
      slot={local.slot ?? undefined}
      class={getClassName}
      style={mergedUnsafeStyle()}
    >
      {(renderProps) => {
        const resolvedChildren = resolveChildren(() =>
          typeof local.children === "function" ? local.children(renderProps) : local.children,
        );
        const radioCircle = (
          <div
            ref={circleElement}
            class={circle({
              ...renderProps,
              size: size(),
              isEmphasized: isEmphasized(),
            })}
            style={radioPressScaleStyle(circleElement, renderProps)}
          />
        );

        return (
          <>
            <CenterBaseline>{radioCircle}</CenterBaseline>
            <Show when={resolvedChildren()}>{resolvedChildren()}</Show>
          </>
        );
      }}
    </HeadlessRadio>
  );
}
