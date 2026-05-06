// @ts-nocheck
import { type JSX, createContext, splitProps, useContext, Show } from "solid-js";
import {
  Select as HeadlessSelect,
  SelectTrigger as HeadlessSelectTrigger,
  SelectValue as HeadlessSelectValue,
  SelectListBox as HeadlessSelectListBox,
  SelectOption as HeadlessSelectOption,
  type SelectProps as HeadlessSelectProps,
  type SelectRenderProps,
  type SelectTriggerRenderProps,
  type SelectValueRenderProps,
  type SelectListBoxRenderProps,
  type SelectOptionProps as HeadlessSelectOptionProps,
  type SelectOptionRenderProps,
} from "@proyecto-viviana/solidaria-components";
import type { Key } from "@proyecto-viviana/solid-stately";
import type { StyleString } from "../s2-style";
import { baseColor, focusRing, fontRelative, style } from "../s2-style";
import {
  control,
  controlBorderRadius,
  controlFont,
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
import { useProviderProps } from "../provider";

export type PickerSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg";
type S2PickerSize = "S" | "M" | "L" | "XL";
export type PickerLabelPosition = "top" | "side";
export type PickerLabelAlign = "start" | "end";
export type PickerNecessityIndicator = "icon" | "label";

export interface PickerProps<T> extends Omit<
  HeadlessSelectProps<T>,
  "class" | "style" | "children"
> {
  size?: PickerSize;
  isQuiet?: boolean;
  styles?: StyleString;
  UNSAFE_className?: string;
  UNSAFE_style?: JSX.CSSProperties;
  class?: string;
  label?: JSX.Element;
  description?: JSX.Element;
  errorMessage?: JSX.Element;
  isInvalid?: boolean;
  labelPosition?: PickerLabelPosition;
  labelAlign?: PickerLabelAlign;
  necessityIndicator?: PickerNecessityIndicator;
  children?: JSX.Element | ((item: T) => JSX.Element);
}

export interface PickerItemProps<T> extends Omit<
  HeadlessSelectOptionProps<T>,
  "class" | "style" | "children"
> {
  children?: JSX.Element;
  styles?: StyleString;
  UNSAFE_className?: string;
  UNSAFE_style?: JSX.CSSProperties;
  class?: string;
}

interface PickerStyleProps extends SelectRenderProps {
  size?: S2PickerSize;
  labelPosition?: PickerLabelPosition;
  labelAlign?: PickerLabelAlign;
  isFocusWithin?: boolean;
  isQuiet?: boolean;
  isInvalid?: boolean;
  isInForm?: boolean;
}

interface PickerTriggerStyleProps extends SelectTriggerRenderProps {
  size?: S2PickerSize;
  isQuiet?: boolean;
  isInvalid?: boolean;
}

interface PickerValueStyleProps extends SelectValueRenderProps<unknown> {
  isQuiet?: boolean;
}

interface PickerOptionStyleProps extends SelectOptionRenderProps {
  size?: S2PickerSize;
}

const PickerSizeContext = createContext<S2PickerSize>("M");

const pickerRoot = style<PickerStyleProps>(
  {
    ...field(),
    position: "relative",
  },
  getAllowedOverrides(),
);

const pickerLabel = style<PickerStyleProps>({
  ...fieldLabel(),
  gridArea: "label",
  display: "inline-block",
  paddingBottom: {
    labelPosition: {
      top: "--field-gap",
    },
  },
});

const pickerTrigger = style<PickerTriggerStyleProps>({
  ...focusRing(),
  ...control({ shape: "default", icon: true }),
  ...fieldInput(),
  outlineStyle: {
    default: "none",
    isFocusVisible: "solid",
    isQuiet: "none",
  },
  position: "relative",
  textAlign: "start",
  borderStyle: {
    default: "none",
    forcedColors: "solid",
  },
  borderColor: {
    forcedColors: {
      default: "ButtonText",
      isDisabled: "GrayText",
    },
  },
  transition: "default",
  paddingX: {
    default: "edge-to-text",
    isQuiet: 0,
  },
  backgroundColor: {
    default: baseColor("gray-100"),
    isOpen: "gray-200",
    isDisabled: "disabled",
    isQuiet: "transparent",
  },
  color: {
    default: baseColor("neutral"),
    isDisabled: "disabled",
  },
  maxWidth: {
    isQuiet: "max",
  },
  cursor: "default",
  disableTapHighlight: true,
});

const pickerInvalidBorder = style<PickerTriggerStyleProps>({
  ...controlBorderRadius(),
  position: "absolute",
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  pointerEvents: "none",
  borderStyle: "solid",
  borderWidth: 2,
  borderColor: baseColor("negative"),
  transition: "default",
});

const quietFocusLine = style({
  width: "full",
  height: "[2px]",
  position: "absolute",
  bottom: 0,
  borderRadius: "full",
  backgroundColor: {
    default: "blue-800",
    forcedColors: "Highlight",
  },
});

const pickerValue = style<PickerValueStyleProps>({
  flexGrow: {
    default: 1,
    isQuiet: 0,
  },
  truncate: true,
  display: "flex",
  alignItems: "center",
  height: "100%",
  color: {
    default: "inherit",
    ":is([data-placeholder])": "neutral-subdued",
  },
});

const pickerChevron = style<{ size?: S2PickerSize }>({
  size: {
    size: {
      S: 10,
      M: 10,
      L: 12,
      XL: 14,
    },
  },
  flexShrink: 0,
  rotate: 90,
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
});

const pickerHelpText = style<PickerStyleProps>({
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
  contain: "inline-size",
  paddingTop: "--field-gap",
});

const pickerListBox = style<SelectListBoxRenderProps & { size?: S2PickerSize }>({
  position: "absolute",
  zIndex: 50,
  insetInlineStart: 0,
  top: "full",
  marginTop: {
    size: {
      S: "[6px]",
      M: "[6px]",
      L: "[7px]",
      XL: "[8px]",
    },
  },
  width: "full",
  minWidth: "full",
  maxHeight: 320,
  overflow: "auto",
  outlineStyle: "none",
  padding: 8,
  boxSizing: "border-box",
  backgroundColor: "gray-50",
  boxShadow: "emphasized",
  borderRadius: "lg",
  fontFamily: "sans",
  fontSize: controlFont(),
});

const pickerOption = style<PickerOptionStyleProps>({
  display: "grid",
  gridTemplateColumns: ["auto", "minmax(0, 1fr)"],
  alignItems: "center",
  columnGap: "text-to-visual",
  minHeight: {
    size: {
      S: 24,
      M: 32,
      L: 40,
      XL: 48,
    },
  },
  paddingX: "edge-to-text",
  borderRadius: "sm",
  color: {
    default: baseColor("neutral"),
    isDisabled: "disabled",
  },
  backgroundColor: {
    isFocused: "gray-200",
    isHovered: "gray-200",
    isPressed: "gray-300",
  },
  cursor: {
    default: "default",
    isDisabled: "default",
  },
  outlineStyle: "none",
});

const pickerOptionLabel = style({
  truncate: true,
});

const pickerCheckmark = style<PickerOptionStyleProps>({
  visibility: {
    default: "hidden",
    isSelected: "visible",
  },
  flexShrink: 0,
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
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

function normalizePickerSize(size: PickerSize | undefined): S2PickerSize {
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

function requiredIconStyle(size: S2PickerSize): JSX.CSSProperties {
  const pixelSize = size === "L" || size === "XL" ? 10 : 8;
  return {
    width: `${pixelSize}px`,
    height: `${pixelSize}px`,
  };
}

function PickerLabel(props: {
  label: JSX.Element;
  size: S2PickerSize;
  isDisabled: boolean;
  isRequired: boolean;
  labelPosition: PickerLabelPosition;
  labelAlign: PickerLabelAlign;
  necessityIndicator: PickerNecessityIndicator;
}) {
  return (
    <span
      class={pickerLabel({
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

export function Picker<T>(props: PickerProps<T>): JSX.Element {
  const mergedProps = useProviderProps(props);
  const [local, headlessProps] = splitProps(mergedProps, [
    "size",
    "isQuiet",
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
    "children",
  ]);

  const size = () => normalizePickerSize(local.size);
  const labelPosition = () => local.labelPosition ?? "top";
  const labelAlign = () => local.labelAlign ?? "start";
  const necessityIndicator = () => local.necessityIndicator ?? "icon";
  const isQuiet = () => local.isQuiet === true;
  const isInvalid = () => local.isInvalid === true;

  const rootClass = (renderProps: SelectRenderProps) =>
    [
      local.UNSAFE_className,
      local.class,
      pickerRoot(
        {
          ...renderProps,
          size: size(),
          labelPosition: labelPosition(),
          isQuiet: isQuiet(),
          isInvalid: isInvalid(),
          isInForm: false,
        },
        local.styles,
      ),
    ]
      .filter(Boolean)
      .join(" ");

  const labelContent = (renderProps: SelectRenderProps) =>
    local.label ? (
      <PickerLabel
        label={local.label}
        size={size()}
        isDisabled={renderProps.isDisabled}
        isRequired={renderProps.isRequired}
        labelPosition={labelPosition()}
        labelAlign={labelAlign()}
        necessityIndicator={necessityIndicator()}
      />
    ) : undefined;

  const helpClass = (renderProps: SelectRenderProps) =>
    pickerHelpText({
      isDisabled: renderProps.isDisabled,
      isRequired: renderProps.isRequired,
      isSelected: renderProps.isSelected,
      size: size(),
      isInvalid: isInvalid(),
    });
  const itemTextForKey = (key: Key | null | undefined) => {
    if (key == null) {
      return undefined;
    }
    const propsRecord = headlessProps as Record<string, unknown>;
    const items = propsRecord.items as T[] | undefined;
    const getKey = propsRecord.getKey as ((item: T) => Key) | undefined;
    const getTextValue = propsRecord.getTextValue as ((item: T) => string) | undefined;
    const item = items?.find((candidate) => {
      const itemRecord = candidate as Record<string, unknown>;
      return (getKey?.(candidate) ?? itemRecord.key ?? itemRecord.id ?? String(candidate)) === key;
    });
    if (item == null) {
      return undefined;
    }
    const itemRecord = item as Record<string, unknown>;
    return String(getTextValue?.(item) ?? itemRecord.textValue ?? itemRecord.label ?? item);
  };
  const ariaLabel = () => {
    const propsRecord = headlessProps as Record<string, unknown>;
    const explicitLabel = propsRecord["aria-label"];
    if (typeof explicitLabel === "string") {
      return explicitLabel;
    }
    if (typeof local.label !== "string") {
      return undefined;
    }
    const selectedText = itemTextForKey(propsRecord.selectedKey as Key | null | undefined);
    const requiredText = propsRecord.isRequired ? " (required)" : "";
    return selectedText ? `${selectedText} ${local.label}${requiredText}` : local.label;
  };

  const listBoxChildren = (item: T) => {
    if (typeof local.children === "function") {
      return local.children(item);
    }

    const itemRecord = item as Record<string, unknown>;
    const key = (itemRecord.key ?? itemRecord.id ?? String(item)) as Key;
    const label = (itemRecord.label ?? itemRecord.textValue ?? String(item)) as JSX.Element;
    const textValue = String(itemRecord.textValue ?? itemRecord.label ?? item);
    return (
      <PickerItem id={key} item={item} textValue={textValue}>
        {label}
      </PickerItem>
    );
  };

  return (
    <PickerSizeContext.Provider value={size()}>
      <HeadlessSelect
        {...headlessProps}
        aria-label={ariaLabel()}
        class={rootClass}
        style={local.UNSAFE_style}
        children={(renderProps) => (
          <>
            <Show when={local.label}>{labelContent(renderProps)}</Show>
            <HeadlessSelectTrigger
              class={(triggerProps) =>
                pickerTrigger({
                  ...triggerProps,
                  size: size(),
                  isQuiet: isQuiet(),
                  isInvalid: isInvalid(),
                })
              }
            >
              {(triggerProps) => (
                <>
                  <HeadlessSelectValue
                    class={(valueProps) =>
                      pickerValue({
                        ...valueProps,
                        isQuiet: isQuiet(),
                      })
                    }
                  />
                  <Show when={isInvalid() && !triggerProps.isDisabled}>
                    <CenterBaseline>
                      <AlertTriangleIcon styles={fieldErrorIcon} />
                    </CenterBaseline>
                  </Show>
                  <ChevronIcon
                    size={size()}
                    styles={pickerChevron({ size: size() })}
                    aria-hidden="true"
                    data-open={triggerProps.isOpen ? "true" : undefined}
                  />
                  <Show when={triggerProps.isFocusVisible && isQuiet()}>
                    <span class={quietFocusLine} />
                  </Show>
                  <Show when={isInvalid() && !triggerProps.isDisabled && !isQuiet()}>
                    <div
                      class={pickerInvalidBorder({
                        ...triggerProps,
                        size: size(),
                        isQuiet: isQuiet(),
                        isInvalid: isInvalid(),
                      })}
                    />
                  </Show>
                </>
              )}
            </HeadlessSelectTrigger>
            <Show when={local.description && !isInvalid()}>
              <p class={helpClass(renderProps)}>{local.description}</p>
            </Show>
            <Show when={local.errorMessage && isInvalid()}>
              <p class={helpClass(renderProps)}>{local.errorMessage}</p>
            </Show>
            <HeadlessSelectListBox
              class={(listBoxProps) => pickerListBox({ ...listBoxProps, size: size() })}
            >
              {listBoxChildren}
            </HeadlessSelectListBox>
          </>
        )}
      />
    </PickerSizeContext.Provider>
  );
}

export function PickerItem<T>(props: PickerItemProps<T>): JSX.Element {
  const [local, headlessProps] = splitProps(props, [
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "styles",
    "children",
  ]);
  const size = useContext(PickerSizeContext);

  const optionClass = (renderProps: SelectOptionRenderProps) =>
    [
      local.UNSAFE_className,
      local.class,
      pickerOption(
        {
          ...renderProps,
          size,
        },
        local.styles,
      ),
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <HeadlessSelectOption {...headlessProps} class={optionClass} style={local.UNSAFE_style}>
      {(renderProps) => (
        <>
          <CheckmarkIcon
            size={size === "S" ? "XS" : size}
            styles={pickerCheckmark({ ...renderProps, size })}
            aria-hidden="true"
          />
          <span class={pickerOptionLabel}>{local.children}</span>
        </>
      )}
    </HeadlessSelectOption>
  );
}

export const Item = PickerItem;
export type { Key };
