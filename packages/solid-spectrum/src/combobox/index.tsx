// @ts-nocheck
import { type JSX, createContext, onCleanup, Show, splitProps, useContext } from "solid-js";
import {
  ComboBox as HeadlessComboBox,
  ComboBoxButton as HeadlessComboBoxButton,
  ComboBoxContext as HeadlessComboBoxContext,
  ComboBoxDescription as HeadlessComboBoxDescription,
  ComboBoxErrorMessage as HeadlessComboBoxErrorMessage,
  ComboBoxInput as HeadlessComboBoxInput,
  ComboBoxLabel as HeadlessComboBoxLabel,
  ComboBoxListBox as HeadlessComboBoxListBox,
  ComboBoxOption as HeadlessComboBoxOption,
  ComboBoxTag as HeadlessComboBoxTag,
  ComboBoxTagGroup as HeadlessComboBoxTagGroup,
  Popover as HeadlessPopover,
  defaultContainsFilter,
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
import type { StyleString } from "../s2-style";
import {
  baseColor,
  focusRing,
  fontRelative,
  lightDark,
  setColorScheme,
  space,
  style,
} from "../s2-style";
import { edgeToText } from "../s2-style/spectrum-theme";
import {
  control,
  controlBorderRadius,
  controlFont,
  controlSize,
  field,
  fieldInput,
  fieldLabel,
  getAllowedOverrides,
} from "../s2-internal/style-utils";
import { CenterBaseline } from "../icon/center-baseline";
import AlertTriangleIcon from "../icon/s2wf-icons/AlertTriangleIcon";
import AsteriskIcon from "../icon/ui-icons/Asterisk";
import CheckmarkIcon from "../icon/ui-icons/Checkmark";
import ChevronIcon from "../icon/ui-icons/Chevron";
import { useProviderProps, useTheme } from "../provider";

export type ComboBoxSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg";
type S2ComboBoxSize = "S" | "M" | "L" | "XL";
export type ComboBoxLabelPosition = "top" | "side";
export type ComboBoxLabelAlign = "start" | "end";
export type ComboBoxNecessityIndicator = "icon" | "label";

export interface ComboBoxProps<T> extends Omit<
  HeadlessComboBoxProps<T>,
  "class" | "style" | "children"
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
  direction?: "bottom" | "top";
  align?: "start" | "end";
  menuWidth?: number;
  shouldFlip?: boolean;
  children?: JSX.Element | ((item: T) => JSX.Element);
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
  paddingEnd: "calc(self(height, self(minHeight)) * 3 / 16)",
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

const comboBoxPopover = style({
  ...setColorScheme(),
  "--s2-container-bg": {
    type: "backgroundColor",
    value: {
      default: "layer-2",
      forcedColors: "Background",
    },
  },
  backgroundColor: "--s2-container-bg",
  boxShadow: "elevated",
  borderRadius: "lg",
  display: "flex",
  padding: 0,
  minHeight: 0,
  overflow: "visible",
  boxSizing: "border-box",
  isolation: "isolate",
  outlineStyle: "solid",
  outlineWidth: 1,
  outlineColor: {
    default: lightDark("transparent-white-25", "gray-200"),
    forcedColors: "ButtonBorder",
  },
});

const comboBoxListBoxFrame = style({
  display: "flex",
  width: "full",
  height: "full",
});

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
  transition: "default",
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

const helpTextStyles = style<ComboBoxStyleProps>({
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
});

const fieldErrorIcon = style({
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
    setTriggerRef?: (el: HTMLElement | null) => void;
  } | null;

  onCleanup(() => context?.setTriggerRef?.(null));

  return (
    <div
      ref={(el) => context?.setTriggerRef?.(el)}
      role="presentation"
      class={comboBoxFieldGroup({
        ...props.renderProps,
        size: props.size(),
        isFocusWithin: props.renderProps.isFocused,
      })}
      onPointerDown={(event) => {
        if (event.pointerType === "mouse") {
          focusFieldInput(event);
        }
      }}
      onTouchEnd={focusFieldInput}
      data-focused={props.renderProps.isFocused ? "true" : undefined}
      data-focus-visible={props.renderProps.isFocusVisible ? "true" : undefined}
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
  const theme = useTheme();
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
    <HeadlessPopover
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
      class={(renderProps) =>
        comboBoxPopover({
          ...renderProps,
          colorScheme: theme.colorScheme,
          isArrowShown: false,
          isSubmenu: false,
        })
      }
      style={() => ({
        "--trigger-width": props.menuWidth() == null ? undefined : `${props.menuWidth()}px`,
        minWidth: "var(--trigger-width)",
        width: "var(--trigger-width)",
      })}
    >
      <div class={comboBoxListBoxFrame}>{props.children}</div>
    </HeadlessPopover>
  );
}

function ComboBoxFieldLabel(props: {
  label: JSX.Element;
  size: S2ComboBoxSize;
  isDisabled: boolean;
  isRequired: boolean;
  labelPosition: ComboBoxLabelPosition;
  labelAlign: ComboBoxLabelAlign;
  necessityIndicator: ComboBoxNecessityIndicator;
}) {
  return (
    <span
      class={comboBoxLabel({
        size: props.size,
        isDisabled: props.isDisabled,
        isRequired: props.isRequired,
        labelPosition: props.labelPosition,
        labelAlign: props.labelAlign,
        isStaticColor: false,
      })}
    >
      {props.label}
      <Show when={props.isRequired || props.necessityIndicator === "label"}>
        <span class={noWrap}>
          &nbsp;
          <Show
            when={props.necessityIndicator === "icon"}
            fallback={
              <span aria-hidden={props.isRequired ? true : undefined}>
                {props.isRequired ? "(required)" : "(optional)"}
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
    </span>
  );
}

export function ComboBox<T>(props: ComboBoxProps<T>): JSX.Element {
  const mergedProps = useProviderProps(props);
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
    "direction",
    "align",
    "menuWidth",
    "shouldFlip",
    "children",
  ]);

  const size = () => normalizeComboBoxSize(local.size);
  const labelPosition = () => local.labelPosition ?? "top";
  const labelAlign = () => local.labelAlign ?? "start";
  const necessityIndicator = () => local.necessityIndicator ?? "icon";
  const direction = () => local.direction ?? "bottom";
  const align = () => local.align ?? "start";
  const shouldFlip = () => local.shouldFlip ?? true;

  const rootClassName = (renderProps: ComboBoxRenderProps) =>
    [
      local.UNSAFE_className,
      local.class,
      comboBoxRoot(
        {
          ...renderProps,
          size: size(),
          labelPosition: labelPosition(),
          isInForm: false,
        },
        local.styles,
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

  const helpClass = (renderProps: ComboBoxRenderProps, isInvalid: boolean) =>
    helpTextStyles({
      ...renderProps,
      size: size(),
      isInvalid,
    });

  const listBoxChildren = typeof local.children === "function" ? local.children : undefined;

  return (
    <ComboBoxSizeContext.Provider value={size()}>
      <HeadlessComboBox
        {...headlessProps}
        allowsEmptyCollection
        label={local.label}
        description={local.description}
        errorMessage={local.errorMessage}
        isInvalid={local.isInvalid}
        class={rootClassName}
        style={local.UNSAFE_style}
        children={(renderProps: ComboBoxRenderProps) => (
          <>
            <Show when={local.label}>
              <div class={labelWrapperClass()}>
                <HeadlessComboBoxLabel>
                  <ComboBoxFieldLabel
                    label={local.label}
                    size={size()}
                    isDisabled={renderProps.isDisabled}
                    isRequired={renderProps.isRequired}
                    labelPosition={labelPosition()}
                    labelAlign={labelAlign()}
                    necessityIndicator={necessityIndicator()}
                  />
                </HeadlessComboBoxLabel>
              </div>
            </Show>

            <ComboBoxFieldGroup renderProps={renderProps} size={size}>
              <HeadlessComboBoxInput class={comboBoxInput} />
              <Show when={renderProps.isInvalid && !renderProps.isDisabled}>
                <CenterBaseline>
                  <AlertTriangleIcon styles={fieldErrorIcon} />
                </CenterBaseline>
              </Show>
              <HeadlessComboBoxButton class={buttonClass}>
                <ChevronIcon
                  size={size()}
                  styles={comboBoxChevron}
                  style={comboBoxChevronIconStyle(size())}
                />
              </HeadlessComboBoxButton>
            </ComboBoxFieldGroup>

            <Show when={local.description && !renderProps.isInvalid}>
              <HeadlessComboBoxDescription class={helpClass(renderProps, false)}>
                {local.description}
              </HeadlessComboBoxDescription>
            </Show>

            <Show when={local.errorMessage && renderProps.isInvalid}>
              <HeadlessComboBoxErrorMessage class={helpClass(renderProps, true)}>
                {local.errorMessage}
              </HeadlessComboBoxErrorMessage>
            </Show>

            <ComboBoxListBoxPopover
              size={size}
              direction={direction}
              align={align}
              menuWidth={() => local.menuWidth}
              shouldFlip={shouldFlip}
            >
              <HeadlessComboBoxListBox
                class={(listBoxProps) => comboBoxListBox({ ...listBoxProps, size: size() })}
              >
                {listBoxChildren}
              </HeadlessComboBoxListBox>
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
  const [local, headlessProps] = splitProps(props, ["class"]);
  const size = useContext(ComboBoxSizeContext);
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
    <HeadlessComboBoxButton {...headlessProps} class={buttonClass}>
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
  const [local, headlessProps] = splitProps(props, ["class", "children"]);
  const size = useContext(ComboBoxSizeContext);
  const isLink = () => (props as Record<string, unknown>).href != null;
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
    <HeadlessComboBoxOption {...headlessProps} class={optionClass}>
      {(renderProps: ComboBoxOptionRenderProps) => (
        <>
          <CheckmarkIcon
            size={size === "S" ? "XS" : size}
            styles={checkClass(renderProps)}
            style={comboBoxCheckmarkIconStyle(size)}
            aria-hidden="true"
          />
          {isTextOnlyChildren(local.children) ? (
            <span slot="label" class={comboBoxOptionLabel({ size })} data-rsp-slot="text">
              {local.children}
            </span>
          ) : (
            local.children
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

ComboBox.InputGroup = ComboBoxInputGroup;
ComboBox.Input = ComboBoxInput;
ComboBox.Button = ComboBoxButton;
ComboBox.ListBox = ComboBoxListBox;
ComboBox.Option = ComboBoxOption;
ComboBox.TagGroup = ComboBoxTagGroup;
ComboBox.Tag = ComboBoxTag;

export const Item = ComboBoxOption;

export type { FilterFn, Key, MenuTriggerAction };
export { defaultContainsFilter };
