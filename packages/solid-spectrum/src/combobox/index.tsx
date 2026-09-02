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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/ComboBox.tsx

// Port of packages/@react-spectrum/s2/src/ComboBox.tsx.

import {
  type JSX,
  createContext,
  createSignal,
  createUniqueId,
  mergeProps,
  onCleanup,
  Show,
  splitProps,
  useContext,
} from "solid-js";
import { createHover } from "@proyecto-viviana/solidaria";
import {
  ComboBox as HeadlessComboBox,
  ComboBoxButton as HeadlessComboBoxButton,
  ComboBoxContext as HeadlessComboBoxContext,
  ComboBoxInput as HeadlessComboBoxInput,
  ComboBoxLabel as HeadlessComboBoxLabel,
  ComboBoxListBox as HeadlessComboBoxListBox,
  ComboBoxOption as HeadlessComboBoxOption,
  ComboBoxTag as HeadlessComboBoxTag,
  ComboBoxTagGroup as HeadlessComboBoxTagGroup,
  ListBoxSection as HeadlessListBoxSection,
  ListLayout,
  Virtualizer,
  defaultContainsFilter,
  type ListBoxSectionProps as HeadlessListBoxSectionProps,
  type ComboBoxButtonProps as HeadlessComboBoxButtonProps,
  type ComboBoxButtonRenderProps,
  type ComboBoxInputProps as HeadlessComboBoxInputProps,
  type ComboBoxInputRenderProps,
  type ComboBoxListBoxProps as HeadlessComboBoxListBoxProps,
  type ComboBoxListBoxRenderProps,
  type ComboBoxOptionProps as HeadlessComboBoxOptionProps,
  type ComboBoxOptionRenderProps,
  type ComboBoxProps as HeadlessComboBoxProps,
  type ComboBoxRenderProps,
  type ComboBoxTagGroupProps as HeadlessComboBoxTagGroupProps,
  type ComboBoxTagProps as HeadlessComboBoxTagProps,
} from "@proyecto-viviana/solidaria-components";
import type { FilterFn, Key, MenuTriggerAction } from "@proyecto-viviana/solid-stately";
import type { StyleString } from "../style";
import { baseColor, focusRing, fontRelative, space, style } from "../style" with { type: "macro" };
import { edgeToText } from "../style/spectrum-theme" with { type: "macro" };
import {
  control,
  controlBorderRadius,
  controlFont,
  controlSize,
  field,
  fieldInput,
  fieldLabel,
  getAllowedOverrides,
} from "../s2-internal/style-utils" with { type: "macro" };
import { CenterBaseline } from "../icon/center-baseline";
import { FieldPrefix, PrefixInputProvider } from "../field/prefix";
import AlertTriangleIcon from "../icon/s2wf-icons/AlertTriangleIcon";
import AsteriskIcon from "../icon/ui-icons/Asterisk";
import { createStringFormatter } from "@proyecto-viviana/solidaria";
import { s2IntlStrings } from "../intl";
import CheckmarkIcon from "../icon/ui-icons/Checkmark";
import ChevronIcon from "../icon/ui-icons/Chevron";
import { pressScale } from "../pressScale";
import { useProviderProps } from "../provider";
import { Popover } from "../popover";
import { createMediaQuery } from "../utils/createMediaQuery";
import { Divider } from "../divider";
import { FormContext, useFormProps, useIsInForm } from "../form";
import {
  assignRef,
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";
import { HelpText } from "../form/HelpText";

export type ComboBoxSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg";
type S2ComboBoxSize = "S" | "M" | "L" | "XL";
export type ComboBoxLabelPosition = "top" | "side";
export type ComboBoxLabelAlign = "start" | "end";
export type ComboBoxNecessityIndicator = "icon" | "label";

export interface ComboBoxProps<T> extends Omit<
  HeadlessComboBoxProps<T>,
  "class" | "style" | "children" | "slot" | "ref" | "rootRef"
> {
  size?: ComboBoxSize;
  styles?: StyleString;
  UNSAFE_className?: string;
  UNSAFE_style?: JSX.CSSProperties;
  class?: string;
  label?: JSX.Element;
  description?: JSX.Element;
  errorMessage?: JSX.Element;
  isInvalid?: boolean;
  labelPosition?: ComboBoxLabelPosition;
  labelAlign?: ComboBoxLabelAlign;
  necessityIndicator?: ComboBoxNecessityIndicator;
  contextualHelp?: JSX.Element;
  /** An icon or text rendered before the input. */
  prefix?: JSX.Element;
  direction?: "bottom" | "top";
  align?: "start" | "end";
  menuWidth?: number;
  shouldFlip?: boolean;
  children?: JSX.Element | ((item: T) => JSX.Element);
  slot?: string | null;
  ref?: RefLike<HTMLDivElement>;
}

export interface ComboBoxInputProps extends Omit<HeadlessComboBoxInputProps, "class" | "style"> {
  class?: string;
}

export interface ComboBoxButtonProps extends Omit<HeadlessComboBoxButtonProps, "class" | "style"> {
  class?: string;
}

export interface ComboBoxListBoxProps<T> extends Omit<
  HeadlessComboBoxListBoxProps<T>,
  "class" | "style"
> {
  class?: string;
}

export interface ComboBoxOptionProps<T> extends Omit<
  HeadlessComboBoxOptionProps<T>,
  "class" | "style"
> {
  class?: string;
}

interface ComboBoxStyleProps extends ComboBoxRenderProps {
  size?: S2ComboBoxSize;
  labelPosition?: ComboBoxLabelPosition;
  labelAlign?: ComboBoxLabelAlign;
  isFocusWithin?: boolean;
  isStaticColor?: boolean;
  isInForm?: boolean;
}

interface ComboBoxButtonStyleProps extends ComboBoxButtonRenderProps {
  size?: S2ComboBoxSize;
  isOpen?: boolean;
}

interface ComboBoxOptionStyleProps extends ComboBoxOptionRenderProps {
  size?: S2ComboBoxSize;
  isLink?: boolean;
}

const ComboBoxSizeContext = createContext<S2ComboBoxSize>("M");
export const ComboBoxContext = createContext<SpectrumContextValue<ComboBoxProps<any>>>(null);

const comboBoxRoot = style<ComboBoxStyleProps>(
  {
    ...field(),
  },
  getAllowedOverrides(),
);

const comboBoxLabelWrapper = style<ComboBoxStyleProps>({
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

const comboBoxLabel = style<ComboBoxStyleProps>({
  ...fieldLabel(),
});

const comboBoxFieldGroup = style<ComboBoxStyleProps>({
  ...focusRing(),
  ...control({ shape: "default" }),
  ...fieldInput(),
  paddingStart: "edge-to-text",
  paddingEnd: "calc(self(height, self(minHeight)) * 3 / 16 - self(borderEndWidth, 2px))",
  borderWidth: 2,
  borderStyle: "solid",
  transition: "default",
  borderColor: {
    default: baseColor("gray-300"),
    forcedColors: "ButtonBorder",
    isInvalid: {
      default: baseColor("negative"),
      forcedColors: "Mark",
    },
    isFocusWithin: {
      default: "gray-900",
      isInvalid: "negative-1000",
      forcedColors: "Highlight",
    },
    isDisabled: {
      default: "disabled",
      forcedColors: "GrayText",
    },
  },
  backgroundColor: {
    default: "gray-25",
    forcedColors: "Field",
  },
  color: {
    default: baseColor("neutral"),
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
});

const comboBoxInput = style({
  padding: 0,
  backgroundColor: "transparent",
  color: {
    default: "inherit",
    "::placeholder": {
      default: "gray-600",
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
});

const inputButton = style<ComboBoxButtonStyleProps>({
  ...controlBorderRadius("sm"),
  display: "flex",
  outlineStyle: "none",
  textAlign: "center",
  borderStyle: "none",
  alignItems: "center",
  justifyContent: "center",
  size: {
    size: {
      S: 16,
      M: 20,
      L: 24,
      XL: 32,
    },
  },
  marginStart: "text-to-control",
  aspectRatio: "square",
  flexShrink: 0,
  transition: {
    default: "default",
    forcedColors: "none",
  },
  backgroundColor: {
    default: baseColor("gray-100"),
    isOpen: "gray-200",
    isDisabled: "disabled",
    forcedColors: {
      default: "ButtonText",
      isHovered: "Highlight",
      isOpen: "Highlight",
      isDisabled: "GrayText",
    },
  },
  color: {
    default: baseColor("neutral"),
    isDisabled: "disabled",
    forcedColors: "ButtonFace",
  },
});

const comboBoxChevron = style({
  flexShrink: 0,
  rotate: 90,
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
});

const comboBoxListBox = style<ComboBoxListBoxRenderProps & { size?: S2ComboBoxSize }>({
  width: "full",
  boxSizing: "border-box",
  maxHeight: "[inherit]",
  overflowY: "auto",
  overflowX: "hidden",
  fontFamily: "sans",
  fontSize: controlFont(),
  outlineStyle: "none",
  margin: 0,
  padding: 8,
  listStyleType: "none",
});

// S2 ComboBox.tsx:765-768 — width additions on the composed Popover `styles` prop.
const comboBoxMenuWidth = style({
  minWidth: "--trigger-width",
  width: "--trigger-width",
});

const comboBoxListBoxFrame = style({
  display: "flex",
  width: "full",
  height: "full",
});

const comboBoxEmptyStateText = style<{ size?: S2ComboBoxSize }>({
  height: {
    size: {
      S: 24,
      M: 32,
      L: 40,
      XL: 48,
    },
  },
  font: {
    size: {
      S: "ui-sm",
      M: "ui",
      L: "ui-lg",
      XL: "ui-xl",
    },
  },
  display: "flex",
  alignItems: "center",
  paddingStart: "edge-to-text",
});

// Not from any design, just following the sizing of the existing rows
export const LOADER_ROW_HEIGHTS = {
  S: {
    medium: 24,
    large: 30,
  },
  M: {
    medium: 32,
    large: 40,
  },
  L: {
    medium: 40,
    large: 50,
  },
  XL: {
    medium: 48,
    large: 60,
  },
};

const comboBoxOption = style<ComboBoxOptionStyleProps>({
  ...focusRing(),
  ...control({ shape: "default", wrap: true, icon: true }),
  columnGap: 0,
  paddingX: 0,
  paddingBottom: "--labelPadding",
  backgroundColor: {
    default: "transparent",
    isFocused: baseColor("gray-100").isFocusVisible,
  },
  color: {
    default: baseColor("neutral"),
    isDisabled: {
      default: "disabled",
      forcedColors: "GrayText",
    },
  },
  position: "relative",
  gridColumnStart: 1,
  gridColumnEnd: -1,
  display: "grid",
  gridTemplateAreas: [". checkmark icon label .", ". . . description ."],
  gridTemplateColumns: {
    size: {
      S: [edgeToText(24), "auto", "auto", "minmax(0, 1fr)", edgeToText(24)],
      M: [edgeToText(32), "auto", "auto", "minmax(0, 1fr)", edgeToText(32)],
      L: [edgeToText(40), "auto", "auto", "minmax(0, 1fr)", edgeToText(40)],
      XL: [edgeToText(48), "auto", "auto", "minmax(0, 1fr)", edgeToText(48)],
    },
  },
  gridTemplateRows: {
    default: "auto minmax(0, min-content)",
    ":has([slot=description])": "auto auto",
  },
  rowGap: {
    ":has([slot=description])": space(1),
  },
  alignItems: "baseline",
  minHeight: controlSize(),
  height: "min",
  textDecoration: "none",
  cursor: {
    default: "default",
    isLink: "pointer",
    isDisabled: "default",
  },
  transition: "transform",
});

const comboBoxOptionLabel = style<{ size?: S2ComboBoxSize }>({
  gridArea: "label",
  display: "block",
  flexGrow: 1,
  font: controlFont(),
  color: "inherit",
  fontWeight: "medium",
  marginTop: "--labelPadding",
  truncate: true,
});

const comboBoxCheckmark = style<ComboBoxOptionStyleProps>({
  gridArea: "checkmark",
  visibility: {
    default: "hidden",
    isSelected: "visible",
  },
  color: baseColor("accent"),
  marginEnd: "text-to-control",
  aspectRatio: "square",
  flexShrink: 0,
  "--iconPrimary": {
    type: "fill",
    value: {
      default: "currentColor",
      forcedColors: {
        default: "Highlight",
        isFocused: "HighlightText",
      },
    },
  },
});

const fieldErrorIcon = style({
  size: "1lh",
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
});

const requiredIcon = style({
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
});

const noWrap = style({
  whiteSpace: "nowrap",
});

function isPrimitiveText(value: unknown): value is string | number {
  return typeof value === "string" || typeof value === "number";
}

function isTextOnlyChildren(value: unknown): boolean {
  return isPrimitiveText(value) || (Array.isArray(value) && value.every(isPrimitiveText));
}

function normalizeComboBoxSize(size: ComboBoxSize | undefined): S2ComboBoxSize {
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

function requiredIconStyle(size: S2ComboBoxSize): JSX.CSSProperties {
  const pixelSize = size === "L" || size === "XL" ? 10 : 8;
  return {
    width: `${pixelSize}px`,
    height: `${pixelSize}px`,
  };
}

function comboBoxCheckmarkIconStyle(size: S2ComboBoxSize): JSX.CSSProperties {
  const pixelSize = size === "XL" ? 14 : size === "L" ? 12 : 10;
  return {
    width: `${pixelSize}px`,
    height: `${pixelSize}px`,
  };
}

function comboBoxChevronIconStyle(size: S2ComboBoxSize): JSX.CSSProperties {
  const pixelSize = size === "XL" ? 14 : size === "L" ? 12 : 10;
  return {
    width: `${pixelSize}px`,
    height: `${pixelSize}px`,
  };
}

function comboBoxMenuOffset(size: S2ComboBoxSize): number {
  switch (size) {
    case "S":
    case "M":
      return 6;
    case "L":
      return 7;
    case "XL":
      return 8;
  }
}

function focusFieldInput(event: Event & { currentTarget: HTMLDivElement }) {
  const target = event.target as Element | null;

  if (target?.closest("button,input,textarea,[role='button']")) {
    return;
  }

  event.preventDefault();
  event.currentTarget.querySelector<HTMLElement>("input, textarea")?.focus();
}

function ComboBoxFieldGroup(props: {
  renderProps: ComboBoxRenderProps;
  size: () => S2ComboBoxSize;
  children: JSX.Element;
}) {
  const context = useContext(HeadlessComboBoxContext) as {
    isFocused?: () => boolean;
    isFocusVisible?: () => boolean;
    setTriggerRef?: (el: HTMLElement | null) => void;
  } | null;
  const isFocused = () => context?.isFocused?.() ?? props.renderProps.isFocused;
  const isFocusVisible = () => context?.isFocusVisible?.() ?? props.renderProps.isFocusVisible;

  // Upstream FieldGroup renders a RAC `<Group>`, whose own `useHover` drives the
  // `isHovered` render prop that `fieldGroupStyles` reads to brighten the text to
  // `neutral:hovered` (Field.tsx:229-230 `baseColor('neutral')`, Group.tsx:111).
  // RAC's ComboBox root exposes no `isHovered` (ComboBoxRenderProps has none), so
  // the hover state must come from the group element itself — mirror it here.
  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return props.renderProps.isDisabled;
    },
  });

  onCleanup(() => context?.setTriggerRef?.(null));

  return (
    <div
      {...hoverProps}
      ref={(el) => context?.setTriggerRef?.(el)}
      role="presentation"
      class={comboBoxFieldGroup({
        ...props.renderProps,
        size: props.size(),
        isFocusWithin: isFocused(),
        isFocusVisible: isFocusVisible(),
        isHovered: isHovered(),
      })}
      onPointerDown={(event) => {
        if (event.pointerType === "mouse") {
          focusFieldInput(event);
        }
      }}
      onTouchEnd={focusFieldInput}
      data-hovered={isHovered() ? "true" : undefined}
      data-focus-within={isFocused() ? "true" : undefined}
      data-focus-visible={isFocusVisible() ? "true" : undefined}
      data-disabled={props.renderProps.isDisabled ? "true" : undefined}
      data-invalid={props.renderProps.isInvalid ? "true" : undefined}
    >
      {props.children}
    </div>
  );
}

function ComboBoxListBoxPopover(props: {
  size: () => S2ComboBoxSize;
  direction: () => "bottom" | "top";
  align: () => "start" | "end";
  menuWidth: () => number | undefined;
  shouldFlip: () => boolean;
  children: JSX.Element;
}) {
  const comboBoxContext = useContext(HeadlessComboBoxContext) as {
    state?: { close?: () => void };
    isOpen?: () => boolean;
    triggerRef?: () => HTMLElement | null;
    inputRef?: () => HTMLElement | null;
    buttonRef?: () => HTMLElement | null;
  } | null;

  const triggerRef = () =>
    comboBoxContext?.triggerRef?.() ??
    comboBoxContext?.inputRef?.()?.parentElement ??
    comboBoxContext?.inputRef?.() ??
    comboBoxContext?.buttonRef?.() ??
    null;

  return (
    <Popover
      hideArrow
      padding="none"
      trigger="ComboBox"
      triggerRef={triggerRef}
      isOpen={comboBoxContext?.isOpen?.() ?? false}
      onOpenChange={(open) => {
        if (!open) {
          comboBoxContext?.state?.close?.();
        }
      }}
      isNonModal
      placement={`${props.direction()} ${props.align()}`}
      offset={comboBoxMenuOffset(props.size())}
      shouldFlip={props.shouldFlip()}
      autoFocus={false}
      UNSAFE_style={{
        "--trigger-width": props.menuWidth() != null ? `${props.menuWidth()}px` : undefined,
      }}
      styles={comboBoxMenuWidth}
    >
      <div class={comboBoxListBoxFrame}>{props.children}</div>
    </Popover>
  );
}

function ComboBoxFieldLabel(props: {
  label: JSX.Element;
  size: S2ComboBoxSize;
  isRequired: boolean;
  necessityIndicator: ComboBoxNecessityIndicator;
}) {
  // Renders the label text + necessity indicator as the direct children of the
  // `<label>` (the class lives on `HeadlessComboBoxLabel`), so the label text's
  // nearest element is the `<label>` — matching upstream FieldLabel.
  const stringFormatter = createStringFormatter(s2IntlStrings, "@react-spectrum/s2");
  return (
    <>
      {props.label}
      <Show when={props.isRequired || props.necessityIndicator === "label"}>
        <span class={noWrap}>
          &nbsp;
          <Show
            when={props.necessityIndicator === "icon"}
            fallback={
              <span aria-hidden={props.isRequired ? true : undefined}>
                {stringFormatter().format(
                  props.isRequired ? "label.(required)" : "label.(optional)",
                )}
              </span>
            }
          >
            <AsteriskIcon
              size={props.size === "S" ? "M" : props.size}
              styles={requiredIcon}
              style={requiredIconStyle(props.size)}
              aria-hidden="true"
            />
          </Show>
        </span>
      </Show>
    </>
  );
}

export function ComboBox<T>(props: ComboBoxProps<T>): JSX.Element {
  const isInForm = useIsInForm();
  const formContext = useContext(FormContext);
  const providerProps = useProviderProps(useFormProps(props));
  const contextProps = getSlottedContextProps(useContext(ComboBoxContext), props.slot);
  const defaultProps: Partial<ComboBoxProps<T>> = {
    labelPosition: "top",
    labelAlign: "start",
    necessityIndicator: "icon",
    direction: "bottom",
    align: "start",
    shouldFlip: true,
  };
  const mergedProps = mergeProps(defaultProps, providerProps, contextProps ?? {}, props);
  const [local, headlessProps] = splitProps(mergedProps, [
    "size",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "label",
    "description",
    "errorMessage",
    "isInvalid",
    "labelPosition",
    "labelAlign",
    "necessityIndicator",
    "contextualHelp",
    "prefix",
    "direction",
    "align",
    "menuWidth",
    "shouldFlip",
    "defaultItems",
    "children",
    "slot",
    "ref",
  ]);

  const prefixId = createUniqueId();
  const size = () => normalizeComboBoxSize(local.size);
  // S2 `useScale()` (`packages/@react-spectrum/s2/src/utils.ts`): coarse pointer → large.
  const matchesCoarsePointer = createMediaQuery("not ((hover: hover) and (pointer: fine))");
  const scale = (): "medium" | "large" => (matchesCoarsePointer() ? "large" : "medium");
  const labelPosition = () => local.labelPosition ?? "top";
  const labelAlign = () => local.labelAlign ?? "start";
  const necessityIndicator = () => local.necessityIndicator ?? "icon";
  const stringFormatter = createStringFormatter(s2IntlStrings, "@react-spectrum/s2");
  const direction = () => local.direction ?? "bottom";
  const align = () => local.align ?? "start";
  const shouldFlip = () => local.shouldFlip ?? true;
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const assignRootRef = mergeContextRefs(
    (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
    props.ref,
  );
  // Faithful to upstream S2 `ComboBox` (`style={pressScale(buttonRef)}` on the
  // chevron Button): the trigger carries the Spectrum press-scale effect, which
  // also emits the resting `will-change: transform` hint.
  const [chevronEl, setChevronEl] = createSignal<HTMLButtonElement | null>(null);

  const rootClassName = (renderProps: ComboBoxRenderProps) =>
    [
      contextProps?.UNSAFE_className,
      local.UNSAFE_className,
      local.class,
      comboBoxRoot(
        {
          ...renderProps,
          size: size(),
          labelPosition: labelPosition(),
          isInForm,
        },
        mergedStyles(),
      ),
    ]
      .filter(Boolean)
      .join(" ");

  const labelWrapperClass = () =>
    comboBoxLabelWrapper({
      size: size(),
      labelPosition: labelPosition(),
      labelAlign: labelAlign(),
    });

  const buttonClass = (renderProps: ComboBoxButtonRenderProps) =>
    inputButton({
      ...renderProps,
      size: size(),
      isOpen: renderProps.isOpen,
    });

  const listBoxChildren = typeof local.children === "function" ? local.children : undefined;

  return (
    <ComboBoxSizeContext.Provider value={size()}>
      <HeadlessComboBox
        {...headlessProps}
        items={headlessProps.items ?? props.defaultItems}
        defaultItems={props.defaultItems}
        allowsEmptyCollection
        label={local.label}
        isInvalid={local.isInvalid}
        slot={local.slot ?? undefined}
        rootRef={(element) => assignRootRef(element)}
        class={rootClassName}
        style={mergedUnsafeStyle()}
        children={(renderProps: ComboBoxRenderProps) => (
          <>
            <Show when={local.label}>
              <div class={labelWrapperClass()}>
                {/* Upstream FieldLabel puts the label class + text directly on the
                    `<Label>` (`<label>`) element (Field.tsx:118) — the text node's
                    nearest element is the `<label>` itself. Match that: class on
                    `HeadlessComboBoxLabel`, content inline (no wrapper `<span>`). */}
                <HeadlessComboBoxLabel
                  class={comboBoxLabel({
                    size: size(),
                    isDisabled: renderProps.isDisabled,
                    isRequired: renderProps.isRequired,
                    labelPosition: labelPosition(),
                    labelAlign: labelAlign(),
                    isStaticColor: false,
                  })}
                >
                  <ComboBoxFieldLabel
                    label={local.label}
                    size={size()}
                    isRequired={renderProps.isRequired}
                    necessityIndicator={necessityIndicator()}
                  />
                </HeadlessComboBoxLabel>
                <Show when={local.contextualHelp}>
                  <span data-slot="contextualHelp">{local.contextualHelp}</span>
                </Show>
              </div>
            </Show>

            <ComboBoxFieldGroup renderProps={renderProps} size={size}>
              <Show when={local.prefix} fallback={<HeadlessComboBoxInput class={comboBoxInput} />}>
                <FieldPrefix id={prefixId}>{local.prefix}</FieldPrefix>
                <PrefixInputProvider
                  context={HeadlessComboBoxContext}
                  prefixId={prefixId}
                  inputPropsIsFunction
                >
                  <HeadlessComboBoxInput class={comboBoxInput} />
                </PrefixInputProvider>
              </Show>
              <Show when={renderProps.isInvalid && !renderProps.isDisabled}>
                <CenterBaseline>
                  <AlertTriangleIcon styles={fieldErrorIcon} />
                </CenterBaseline>
              </Show>
              <HeadlessComboBoxButton
                ref={setChevronEl}
                class={buttonClass}
                style={(buttonProps) => pressScale(() => chevronEl())(buttonProps)}
              >
                <ChevronIcon
                  size={size()}
                  styles={comboBoxChevron}
                  style={comboBoxChevronIconStyle(size())}
                />
              </HeadlessComboBoxButton>
            </ComboBoxFieldGroup>

            <HelpText
              size={size()}
              isDisabled={renderProps.isDisabled}
              isInvalid={renderProps.isInvalid || local.isInvalid}
              description={local.description}
            >
              {local.errorMessage}
            </HelpText>

            <ComboBoxListBoxPopover
              size={size}
              direction={direction}
              align={align}
              menuWidth={() => local.menuWidth}
              shouldFlip={shouldFlip}
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
                <Virtualizer
                  layout={ListLayout}
                  layoutOptions={{
                    estimatedRowHeight: 32,
                    padding: 8,
                    estimatedHeadingHeight: 50,
                    loaderHeight: LOADER_ROW_HEIGHTS[size()][scale()],
                  }}
                >
                  <HeadlessComboBoxListBox
                    class={(listBoxProps) => comboBoxListBox({ ...listBoxProps, size: size() })}
                  >
                    {listBoxChildren}
                  </HeadlessComboBoxListBox>
                  <Show
                    when={(() => {
                      const items = headlessProps.items ?? props.defaultItems;
                      return Array.isArray(items) && items.length === 0;
                    })()}
                  >
                    <span class={comboBoxEmptyStateText({ size: size() })}>
                      {stringFormatter().format("combobox.noResults")}
                    </span>
                  </Show>
                </Virtualizer>
              </FormContext.Provider>
            </ComboBoxListBoxPopover>
          </>
        )}
      />
    </ComboBoxSizeContext.Provider>
  );
}

export function ComboBoxInputGroup(props: { children: JSX.Element; class?: string }): JSX.Element {
  const context = useContext(HeadlessComboBoxContext) as {
    setTriggerRef?: (el: HTMLElement | null) => void;
  } | null;

  onCleanup(() => context?.setTriggerRef?.(null));

  return (
    <div ref={(el) => context?.setTriggerRef?.(el)} class={props.class}>
      {props.children}
    </div>
  );
}

export function ComboBoxInput(props: ComboBoxInputProps): JSX.Element {
  const [local, headlessProps] = splitProps(props, ["class"]);
  return (
    <HeadlessComboBoxInput
      {...headlessProps}
      class={[comboBoxInput, local.class].filter(Boolean).join(" ")}
    />
  );
}

export function ComboBoxButton(props: ComboBoxButtonProps): JSX.Element {
  const [local, headlessProps] = splitProps(props, ["class", "ref"]);
  const size = useContext(ComboBoxSizeContext);
  const [buttonEl, setButtonEl] = createSignal<HTMLButtonElement | null>(null);
  const buttonClass = (renderProps: ComboBoxButtonRenderProps) =>
    [
      inputButton({
        ...renderProps,
        size,
        isOpen: renderProps.isOpen,
      }),
      local.class,
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <HeadlessComboBoxButton
      {...headlessProps}
      ref={(el) => {
        setButtonEl(el);
        assignRef(local.ref, el);
      }}
      class={buttonClass}
      // Faithful to upstream S2 `ComboBox` chevron `style={pressScale(buttonRef)}`.
      style={(buttonProps) => pressScale(() => buttonEl())(buttonProps)}
    >
      {props.children || (
        <ChevronIcon size={size} styles={comboBoxChevron} style={comboBoxChevronIconStyle(size)} />
      )}
    </HeadlessComboBoxButton>
  );
}

export function ComboBoxListBox<T>(props: ComboBoxListBoxProps<T>): JSX.Element {
  const [local, headlessProps] = splitProps(props, ["class"]);
  const size = useContext(ComboBoxSizeContext);
  const listClass = (renderProps: ComboBoxListBoxRenderProps) =>
    [comboBoxListBox({ ...renderProps, size }), local.class].filter(Boolean).join(" ");

  return <HeadlessComboBoxListBox {...headlessProps} class={listClass} children={props.children} />;
}

export function ComboBoxOption<T>(props: ComboBoxOptionProps<T>): JSX.Element {
  const [local, headlessProps] = splitProps(props, ["class", "children", "ref", "UNSAFE_style"]);
  const size = useContext(ComboBoxSizeContext);
  const [optionEl, setOptionEl] = createSignal<HTMLElement | null>(null);
  const isLink = () => (props as Record<string, unknown>).href != null;
  const rawChildren = local.children;
  const textLabel = () =>
    isTextOnlyChildren(rawChildren)
      ? Array.isArray(rawChildren)
        ? rawChildren.join("")
        : String(rawChildren)
      : undefined;
  const optionClass = (renderProps: ComboBoxOptionRenderProps) =>
    [
      comboBoxOption({
        ...renderProps,
        size,
        isLink: isLink(),
      }),
      local.class,
    ]
      .filter(Boolean)
      .join(" ");
  const checkClass = (renderProps: ComboBoxOptionRenderProps) =>
    comboBoxCheckmark({ ...renderProps, size });

  return (
    <HeadlessComboBoxOption
      {...headlessProps}
      ref={(el) => {
        setOptionEl(el);
        assignRef(local.ref, el);
      }}
      aria-label={headlessProps["aria-label"]}
      class={optionClass}
      // Faithful to upstream S2 `ComboBoxItem` `style={pressScale(ref, UNSAFE_style)}`.
      style={pressScale(() => optionEl(), local.UNSAFE_style)}
    >
      {(renderProps: ComboBoxOptionRenderProps) => (
        <>
          <CheckmarkIcon
            size={size === "S" ? "XS" : size}
            // Apply via `class` (raw), not `styles`: the icon `styles` path
            // filters through `iconAllowedOverrides`, which omits `visibility`
            // and would strip the checkmark's `visibility` toggle, leaving it
            // visible on every option. Mirrors upstream S2 ComboBox `className`.
            class={checkClass(renderProps)}
            style={comboBoxCheckmarkIconStyle(size)}
          />
          {isTextOnlyChildren(rawChildren) ? (
            <span slot="label" class={comboBoxOptionLabel({ size })} data-rsp-slot="text">
              {rawChildren}
            </span>
          ) : (
            rawChildren
          )}
        </>
      )}
    </HeadlessComboBoxOption>
  );
}

export interface ComboBoxTagGroupProps extends Omit<
  HeadlessComboBoxTagGroupProps,
  "class" | "style"
> {
  class?: string;
}

export function ComboBoxTagGroup(props: ComboBoxTagGroupProps): JSX.Element {
  return <HeadlessComboBoxTagGroup {...props} />;
}

export interface ComboBoxTagProps extends Omit<HeadlessComboBoxTagProps, "class" | "style"> {
  class?: string;
}

export function ComboBoxTag(props: ComboBoxTagProps): JSX.Element {
  return <HeadlessComboBoxTag {...props} />;
}

export interface ComboBoxSectionProps<T> extends Omit<
  HeadlessListBoxSectionProps,
  "style" | "class" | "render"
> {}

/**
 * A section within a `<ComboBox>`, mirroring React S2's `ComboBoxSection`. Renders
 * a headless list-box section followed by a size-matched `<Divider>`; the size is
 * read from the internal combobox context.
 */
export function ComboBoxSection<T>(props: ComboBoxSectionProps<T>): JSX.Element {
  const size = useContext(ComboBoxSizeContext);
  return (
    <>
      <HeadlessListBoxSection {...props}>{props.children}</HeadlessListBoxSection>
      <Divider size={size} />
    </>
  );
}

ComboBox.InputGroup = ComboBoxInputGroup;
ComboBox.Input = ComboBoxInput;
ComboBox.Button = ComboBoxButton;
ComboBox.ListBox = ComboBoxListBox;
ComboBox.Option = ComboBoxOption;
ComboBox.Section = ComboBoxSection;
ComboBox.TagGroup = ComboBoxTagGroup;
ComboBox.Tag = ComboBoxTag;

export const Item = ComboBoxOption;

export type { FilterFn, Key, MenuTriggerAction };
export { defaultContainsFilter };
