// @ts-nocheck
import {
  type JSX,
  createContext,
  createEffect,
  createSignal,
  createUniqueId,
  mergeProps,
  onCleanup,
  Show,
  splitProps,
  useContext,
} from "solid-js";
import {
  Select as HeadlessSelect,
  SelectContext as HeadlessSelectContext,
  SelectTrigger as HeadlessSelectTrigger,
  SelectValue as HeadlessSelectValue,
  SelectListBox as HeadlessSelectListBox,
  SelectOption as HeadlessSelectOption,
  FieldError as HeadlessFieldError,
  Popover as HeadlessPopover,
  type SelectProps as HeadlessSelectProps,
  type SelectRenderProps,
  type SelectTriggerRenderProps,
  type SelectValueRenderProps,
  type SelectListBoxRenderProps,
  type SelectOptionProps as HeadlessSelectOptionProps,
  type SelectOptionRenderProps,
} from "@proyecto-viviana/solidaria-components";
import type { Key } from "@proyecto-viviana/solid-stately";
import type { StyleString } from "../style";
import {
  baseColor,
  focusRing,
  fontRelative,
  lightDark,
  setColorScheme,
  space,
  style,
} from "../style" with { type: "macro" };
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
import AlertTriangleIcon from "../icon/s2wf-icons/AlertTriangleIcon";
import AsteriskIcon from "../icon/ui-icons/Asterisk";
import CheckmarkIcon from "../icon/ui-icons/Checkmark";
import ChevronIcon from "../icon/ui-icons/Chevron";
import { ProgressCircle } from "../progress/ProgressCircle";
import { useProviderProps, useTheme } from "../provider";

export type PickerSize = "S" | "M" | "L" | "XL";
type S2PickerSize = "S" | "M" | "L" | "XL";
export type PickerLabelPosition = "top" | "side";
export type PickerLabelAlign = "start" | "end";
export type PickerNecessityIndicator = "icon" | "label";
export type PickerDirection = "bottom" | "top";
export type PickerAlign = "start" | "end";
export type PickerLoadingState =
  | "idle"
  | "loading"
  | "loadingMore"
  | "sorting"
  | "filtering"
  | "error";

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
  contextualHelp?: JSX.Element;
  direction?: PickerDirection;
  align?: PickerAlign;
  menuWidth?: number;
  shouldFlip?: boolean;
  value?: Key | null;
  defaultValue?: Key | null;
  onChange?: (value: Key | null) => void;
  loadingState?: PickerLoadingState;
  onLoadMore?: () => void | Promise<void>;
  renderValue?: (selectedItems: T[]) => JSX.Element;
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

const pickerLabelWrapper = style<PickerStyleProps>({
  gridArea: "label",
  display: "inline-flex",
  alignItems: "baseline",
  gap: "text-to-visual",
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

const pickerLabel = style<PickerStyleProps>({
  ...fieldLabel(),
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

const pickerChevron = style<{ size?: S2PickerSize; isLoading?: boolean }>({
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
  color: {
    isLoading: "disabled",
  },
});

const pickerLoadingWrapper = style({
  gridColumnStart: 1,
  gridColumnEnd: -1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginY: 8,
});

const pickerProgressCircle = style<{ size?: S2PickerSize }>({
  size: {
    size: {
      S: 16,
      M: 20,
      L: 22,
      XL: 26,
    },
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
  width: "full",
  boxSizing: "border-box",
  maxHeight: "[inherit]",
  overflowY: "auto",
  overflowX: "hidden",
  fontFamily: "sans",
  fontSize: controlFont(),
  outlineStyle: "none",
  margin: 0,
  listStyleType: "none",
  padding: 8,
});

const pickerPopover = style({
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

const pickerListBoxFrame = style({
  display: "flex",
  width: "full",
  height: "full",
});

const pickerOption = style<PickerOptionStyleProps>({
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
    isDisabled: "default",
  },
  transition: "default",
});

const pickerOptionLabel = style<{ size?: S2PickerSize }>({
  gridArea: "label",
  display: "block",
  flexGrow: 1,
  font: controlFont(),
  color: "inherit",
  fontWeight: "medium",
  marginTop: "--labelPadding",
  truncate: true,
});

const pickerCheckmark = style<PickerOptionStyleProps>({
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

function normalizePickerSize(size: PickerSize | undefined): S2PickerSize {
  switch (size) {
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

function pickerCheckmarkIconStyle(size: S2PickerSize): JSX.CSSProperties {
  const pixelSize = size === "XL" ? 14 : size === "L" ? 12 : 10;
  return {
    width: `${pixelSize}px`,
    height: `${pixelSize}px`,
  };
}

function pickerMenuOffset(size: S2PickerSize): number {
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

function PickerListBoxPopover(props: {
  size: () => S2PickerSize;
  isQuiet: () => boolean;
  direction: () => PickerDirection;
  align: () => PickerAlign;
  menuWidth: () => number | undefined;
  shouldFlip: () => boolean;
  children: JSX.Element;
}) {
  const theme = useTheme();
  const selectContext = useContext(HeadlessSelectContext) as {
    state?: { close?: () => void };
    isOpen?: () => boolean;
    triggerRef?: () => HTMLElement | null;
    rootRef?: () => HTMLElement | null;
  } | null;
  const triggerRef = () =>
    selectContext?.triggerRef?.() ??
    selectContext?.rootRef?.()?.querySelector<HTMLElement>("button[aria-haspopup='listbox']") ??
    null;
  const [triggerWidth, setTriggerWidth] = createSignal<string | undefined>();

  const updateTriggerWidth = () => {
    const trigger = triggerRef();
    if (trigger) {
      setTriggerWidth(`${trigger.getBoundingClientRect().width}px`);
    }
  };

  createEffect(() => {
    const trigger = triggerRef();
    if (!trigger) {
      setTriggerWidth(undefined);
      return;
    }

    updateTriggerWidth();
    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const resizeObserver = new ResizeObserver(updateTriggerWidth);
    resizeObserver.observe(trigger);
    onCleanup(() => resizeObserver.disconnect());
  });

  const resolvedTriggerWidth = () => {
    const explicitMenuWidth = props.menuWidth();
    if (explicitMenuWidth != null) {
      return `${explicitMenuWidth}px`;
    }

    const measuredWidth = triggerWidth();
    if (measuredWidth) {
      return measuredWidth;
    }

    const trigger = triggerRef();
    return trigger ? `${trigger.getBoundingClientRect().width}px` : undefined;
  };

  return (
    <HeadlessPopover
      trigger="Select"
      triggerRef={triggerRef}
      isOpen={selectContext?.isOpen?.() ?? false}
      onOpenChange={(open) => {
        if (!open) {
          selectContext?.state?.close?.();
        }
      }}
      placement={`${props.direction()} ${props.align()}`}
      offset={pickerMenuOffset(props.size())}
      crossOffset={props.isQuiet() ? -12 : undefined}
      shouldFlip={props.shouldFlip()}
      autoFocus={false}
      class={(renderProps) =>
        pickerPopover({
          ...renderProps,
          colorScheme: theme.colorScheme,
          isArrowShown: false,
          isSubmenu: false,
        })
      }
      style={() => ({
        "--trigger-width": resolvedTriggerWidth(),
        minWidth: props.isQuiet() ? "192px" : "var(--trigger-width)",
        width: props.isQuiet() ? "calc(var(--trigger-width) - 24px)" : "var(--trigger-width)",
      })}
    >
      <div class={pickerListBoxFrame}>{props.children}</div>
    </HeadlessPopover>
  );
}

function PickerLabel(props: {
  label: JSX.Element;
  size: S2PickerSize;
  isDisabled: boolean;
  isRequired: boolean;
  labelPosition: PickerLabelPosition;
  labelAlign: PickerLabelAlign;
  necessityIndicator: PickerNecessityIndicator;
  contextualHelp?: JSX.Element;
}) {
  return (
    <span
      class={pickerLabelWrapper({
        size: props.size,
        isDisabled: props.isDisabled,
        isRequired: props.isRequired,
        labelPosition: props.labelPosition,
        labelAlign: props.labelAlign,
        isStaticColor: false,
      })}
    >
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
      <Show when={props.contextualHelp}>
        <span data-slot="contextualHelp">{props.contextualHelp}</span>
      </Show>
    </span>
  );
}

function selectedValues<T>(valueProps: SelectValueRenderProps<T>): T[] {
  return valueProps.selectedItems
    .map((item) => item.value ?? (item as unknown as T))
    .filter((item): item is T => item != null);
}

function pickerValueContent<T>(
  valueProps: SelectValueRenderProps<T>,
  renderValue: ((selectedItems: T[]) => JSX.Element) | undefined,
) {
  if (valueProps.selectedItems.length > 0 && renderValue) {
    return renderValue(selectedValues(valueProps));
  }

  if (valueProps.selectedItems.length > 1) {
    return `${valueProps.selectedItems.length} selected`;
  }

  return valueProps.selectedText ?? valueProps.placeholder ?? "";
}

function loadingSpinnerLabel(loadingState: PickerLoadingState | undefined) {
  return loadingState === "loadingMore" ? "Loading more" : "Loading";
}

function PickerProgressCircle(props: {
  size: S2PickerSize;
  loadingState: PickerLoadingState | undefined;
}) {
  return (
    <ProgressCircle
      aria-label={loadingSpinnerLabel(props.loadingState)}
      isIndeterminate
      size="S"
      styles={pickerProgressCircle({ size: props.size })}
    />
  );
}

export function Picker<T>(props: PickerProps<T>): JSX.Element {
  const defaultProps: Partial<PickerProps<T>> = {
    labelPosition: "top",
    labelAlign: "start",
    necessityIndicator: "icon",
    direction: "bottom",
    align: "start",
    shouldFlip: true,
  };
  const mergedProps = mergeProps(defaultProps, useProviderProps(props), props);
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
    "contextualHelp",
    "direction",
    "align",
    "menuWidth",
    "shouldFlip",
    "value",
    "defaultValue",
    "onChange",
    "loadingState",
    "onLoadMore",
    "renderValue",
    "children",
  ]);

  const size = () => normalizePickerSize(local.size);
  const labelPosition = () => local.labelPosition ?? "top";
  const labelAlign = () => local.labelAlign ?? "start";
  const necessityIndicator = () => local.necessityIndicator ?? "icon";
  const direction = () => local.direction ?? "bottom";
  const align = () => local.align ?? "start";
  const shouldFlip = () => local.shouldFlip ?? true;
  const isQuiet = () => local.isQuiet === true;
  const isInvalid = () => local.isInvalid === true;
  const isTriggerLoading = () => local.loadingState === "loading";
  const isLoadingMore = () => local.loadingState === "loadingMore";
  const selectedKey = () =>
    local.value !== undefined
      ? local.value
      : ((headlessProps as Record<string, unknown>).selectedKey as Key | null | undefined);
  const defaultSelectedKey = () =>
    local.defaultValue !== undefined
      ? local.defaultValue
      : ((headlessProps as Record<string, unknown>).defaultSelectedKey as Key | null | undefined);
  const onSelectionChange = (key: Key | null) => {
    (
      (headlessProps as Record<string, unknown>).onSelectionChange as
        | ((key: Key | null) => void)
        | undefined
    )?.(key);
    local.onChange?.(key);
  };
  const selectProps = mergeProps(headlessProps, {
    get selectedKey() {
      return selectedKey();
    },
    get defaultSelectedKey() {
      return defaultSelectedKey();
    },
    get onSelectionChange() {
      const hasHandler =
        typeof (headlessProps as Record<string, unknown>).onSelectionChange === "function" ||
        typeof local.onChange === "function";
      return hasHandler ? onSelectionChange : undefined;
    },
  });
  const descriptionId = createUniqueId();
  const selectDescribedBy = () => {
    const explicitDescribedBy = (headlessProps as Record<string, unknown>)["aria-describedby"] as
      | string
      | undefined;
    const ids = [explicitDescribedBy, local.description && !isInvalid() ? descriptionId : undefined]
      .filter(Boolean)
      .join(" ")
      .split(" ")
      .filter(Boolean);
    return ids.length ? Array.from(new Set(ids)).join(" ") : undefined;
  };

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
        contextualHelp={local.contextualHelp}
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
    const selectedText = itemTextForKey(selectedKey() ?? defaultSelectedKey());
    const requiredText = propsRecord.isRequired ? " (required)" : "";
    return selectedText ? `${selectedText} ${local.label}${requiredText}` : local.label;
  };

  const listBoxChildren = (item: T) => {
    if (typeof local.children === "function") {
      return local.children(item);
    }

    const propsRecord = headlessProps as Record<string, unknown>;
    const getKey = propsRecord.getKey as ((item: T) => Key) | undefined;
    const getTextValue = propsRecord.getTextValue as ((item: T) => string) | undefined;
    const itemRecord = item as Record<string, unknown>;
    const key = (getKey?.(item) ?? itemRecord.key ?? itemRecord.id ?? String(item)) as Key;
    const textValue = String(
      getTextValue?.(item) ?? itemRecord.textValue ?? itemRecord.label ?? item,
    );
    const label = (itemRecord.label ?? textValue) as JSX.Element;
    return (
      <PickerItem id={key} item={item} textValue={textValue}>
        {label}
      </PickerItem>
    );
  };

  return (
    <PickerSizeContext.Provider value={size()}>
      <HeadlessSelect
        {...selectProps}
        aria-label={ariaLabel()}
        aria-describedby={selectDescribedBy()}
        isInvalid={isInvalid()}
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
                  >
                    {(valueProps) => pickerValueContent(valueProps, local.renderValue)}
                  </HeadlessSelectValue>
                  <Show when={isInvalid() && !triggerProps.isDisabled}>
                    <CenterBaseline>
                      <AlertTriangleIcon styles={fieldErrorIcon} />
                    </CenterBaseline>
                  </Show>
                  <Show when={isTriggerLoading() && !triggerProps.isOpen}>
                    <CenterBaseline>
                      <PickerProgressCircle size={size()} loadingState={local.loadingState} />
                    </CenterBaseline>
                  </Show>
                  <ChevronIcon
                    size={size()}
                    styles={pickerChevron({ size: size(), isLoading: isTriggerLoading() })}
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
              <p id={descriptionId} class={helpClass(renderProps)}>
                {local.description}
              </p>
            </Show>
            <Show when={local.errorMessage && isInvalid()}>
              <HeadlessFieldError class={helpClass(renderProps)}>
                {local.errorMessage}
              </HeadlessFieldError>
            </Show>
            <PickerListBoxPopover
              size={size}
              isQuiet={isQuiet}
              direction={direction}
              align={align}
              menuWidth={() => local.menuWidth}
              shouldFlip={shouldFlip}
            >
              <HeadlessSelectListBox
                isInPopover
                class={(listBoxProps) => pickerListBox({ ...listBoxProps, size: size() })}
                onLoadMore={local.onLoadMore}
                isLoading={isLoadingMore()}
                loadMoreClass={pickerLoadingWrapper}
                renderLoadMore={() =>
                  isLoadingMore() ? (
                    <PickerProgressCircle size={size()} loadingState={local.loadingState} />
                  ) : undefined
                }
              >
                {listBoxChildren}
              </HeadlessSelectListBox>
            </PickerListBoxPopover>
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
            style={pickerCheckmarkIconStyle(size)}
            aria-hidden="true"
          />
          {isTextOnlyChildren(local.children) ? (
            <span slot="label" class={pickerOptionLabel({ size })} data-rsp-slot="text">
              {local.children}
            </span>
          ) : (
            local.children
          )}
        </>
      )}
    </HeadlessSelectOption>
  );
}

export const Item = PickerItem;
export type { Key };
