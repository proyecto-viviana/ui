import { type JSX, Show, splitProps, createContext, useContext, createUniqueId } from "solid-js";
import {
  Select as HeadlessSelect,
  SelectTrigger as HeadlessSelectTrigger,
  SelectValue as HeadlessSelectValue,
  SelectListBox as HeadlessSelectListBox,
  SelectOption as HeadlessSelectOption,
  type SelectProps as HeadlessSelectProps,
  type SelectTriggerProps as HeadlessSelectTriggerProps,
  type SelectValueProps as HeadlessSelectValueProps,
  type SelectListBoxProps as HeadlessSelectListBoxProps,
  type SelectOptionProps as HeadlessSelectOptionProps,
  type SelectRenderProps,
  type SelectTriggerRenderProps,
  type SelectValueRenderProps,
  type SelectListBoxRenderProps,
  type SelectOptionRenderProps,
} from "@proyecto-viviana/solidaria-components";
import type { Key } from "@proyecto-viviana/solid-stately";
import { useProviderProps } from "../provider";
import { style, focusRing } from "../style" with { type: "macro" };

export type SelectSize = "sm" | "md" | "lg";

const SelectSizeContext = createContext<SelectSize>("md");

export interface SelectProps<T> extends Omit<HeadlessSelectProps<T>, "class" | "style"> {
  /** The size of the select. */
  size?: SelectSize;
  /** Additional CSS class name. */
  class?: string;
  /** Label for the select. */
  label?: string;
  /** Description for the select. */
  description?: string;
  /** Error message when invalid. */
  errorMessage?: string;
  /** Whether the select is invalid. */
  isInvalid?: boolean;
}

export interface SelectTriggerProps extends Omit<HeadlessSelectTriggerProps, "class" | "style"> {
  /** Additional CSS class name. */
  class?: string;
}

export interface SelectValueProps<T> extends Omit<HeadlessSelectValueProps<T>, "class" | "style"> {
  /** Additional CSS class name. */
  class?: string;
}

export interface SelectListBoxProps<T> extends Omit<
  HeadlessSelectListBoxProps<T>,
  "class" | "style"
> {
  /** Additional CSS class name. */
  class?: string;
}

export interface SelectOptionProps<T> extends Omit<
  HeadlessSelectOptionProps<T>,
  "class" | "style"
> {
  /** Additional CSS class name. */
  class?: string;
}

// All styling flows through the build-time S2 style() macro so the atomic CSS
// ships in the package bundle for installed consumers, rather than relying on
// Tailwind utility strings the package ships no CSS for. Interactive state
// (hover/open/focus/selected/disabled) is driven by the collection render props.

const rootStyles = style<{ isDisabled?: boolean }>({
  position: "relative",
  display: "inline-flex",
  flexDirection: "column",
  gap: "[6px]",
  opacity: { default: 1, isDisabled: 0.5 },
});

const labelStyles = style<{ size: SelectSize }>({
  font: { size: { sm: "ui-sm", md: "ui", lg: "ui-lg" } },
  fontWeight: "medium",
  color: "neutral",
});

const descriptionStyles = style({
  font: "ui-sm",
  color: "neutral-subdued",
});

const errorStyles = style({
  font: "ui-sm",
  color: "negative",
});

const triggerStyles = style<SelectTriggerRenderProps & { size: SelectSize }>({
  ...focusRing(),
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "full",
  borderRadius: "lg",
  borderWidth: 2,
  borderStyle: "solid",
  cursor: "default",
  transition: "default",
  height: { size: { sm: 32, md: 40, lg: 48 } },
  font: { size: { sm: "ui-sm", md: "ui", lg: "ui-lg" } },
  paddingX: { size: { sm: 12, md: 16, lg: 20 } },
  gap: { size: { sm: 8, md: 8, lg: 12 } },
  borderColor: {
    default: "gray-300",
    isHovered: "gray-400",
    isOpen: "accent-900",
    isDisabled: "gray-200",
  },
  backgroundColor: {
    default: "gray-25",
    isDisabled: "gray-100",
  },
  color: {
    default: "neutral",
    isDisabled: "disabled",
  },
});

const chevronStyles = style<{ size: SelectSize; isOpen?: boolean }>({
  flexShrink: 0,
  transition: "default",
  width: { size: { sm: 16, md: 20, lg: 24 } },
  height: { size: { sm: 16, md: 20, lg: 24 } },
  rotate: { default: 0, isOpen: 180 },
});

const valueStyles = style<{ isSelected?: boolean }>({
  flexGrow: 1,
  textAlign: "start",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  color: { default: "gray-500", isSelected: "neutral" },
});

const listBoxStyles = style({
  position: "absolute",
  zIndex: 50,
  marginTop: 4,
  width: "full",
  borderRadius: "lg",
  borderWidth: 2,
  borderStyle: "solid",
  borderColor: "gray-300",
  backgroundColor: "layer-2",
  paddingY: 4,
  boxShadow: "elevated",
  maxHeight: 240,
  overflow: "auto",
});

const optionStyles = style<SelectOptionRenderProps & { size: SelectSize }>({
  ...focusRing(),
  outlineOffset: -2,
  display: "flex",
  alignItems: "center",
  gap: 8,
  cursor: "default",
  transition: "default",
  font: { size: { sm: "ui-sm", md: "ui", lg: "ui-lg" } },
  paddingX: { size: { sm: 12, md: 16, lg: 20 } },
  paddingY: { size: { sm: "[6px]", md: 8, lg: "[10px]" } },
  backgroundColor: {
    default: "transparent",
    isHovered: "gray-100",
    isFocused: "gray-100",
    isSelected: "accent-subtle",
    isDisabled: "transparent",
  },
  color: {
    default: "neutral-subdued",
    isHovered: "neutral",
    isFocused: "neutral",
    isSelected: "accent",
    isDisabled: "disabled",
  },
});

const checkmarkStyles = style<{ size: SelectSize }>({
  flexShrink: 0,
  color: "accent",
  width: { size: { sm: 16, md: 20, lg: 24 } },
  height: { size: { sm: 16, md: 20, lg: 24 } },
});

// The label indents past the checkmark column when unselected; selected rows
// show the checkmark and drop the indent.
const optionLabelStyles = style<{ size: SelectSize; isSelected?: boolean }>({
  flexGrow: 1,
  paddingStart: {
    default: { size: { sm: 24, md: 28, lg: 36 } },
    isSelected: 0,
  },
});

/**
 * A select displays a collapsible list of options and allows a user to select one of them.
 */
export function Select<T>(props: SelectProps<T>): JSX.Element {
  const mergedProps = useProviderProps(props);
  const descriptionId = createUniqueId();
  const errorId = createUniqueId();

  const [local, headlessProps] = splitProps(mergedProps, [
    "size",
    "class",
    "label",
    "description",
    "errorMessage",
    "isInvalid",
  ]);

  const size = local.size ?? "md";
  const customClass = local.class ?? "";

  const getClassName = (renderProps: SelectRenderProps): string =>
    [rootStyles({ isDisabled: renderProps.isDisabled }), customClass].filter(Boolean).join(" ");

  const mergedAriaLabel = (headlessProps as { "aria-label"?: string })["aria-label"];

  const styledLabel = () =>
    local.label ? <span class={labelStyles({ size })}>{local.label}</span> : undefined;

  const describedByIds =
    [
      (headlessProps as { "aria-describedby"?: string })["aria-describedby"],
      local.description && !local.isInvalid ? descriptionId : undefined,
      local.errorMessage && local.isInvalid ? errorId : undefined,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <SelectSizeContext.Provider value={size}>
      <HeadlessSelect
        {...headlessProps}
        label={styledLabel()}
        aria-label={mergedAriaLabel}
        aria-describedby={describedByIds}
        class={getClassName}
      >
        {props.children as JSX.Element}
        <Show when={local.description && !local.isInvalid}>
          <span id={descriptionId} class={descriptionStyles}>
            {local.description}
          </span>
        </Show>
        <Show when={local.errorMessage && local.isInvalid}>
          <span id={errorId} class={errorStyles}>
            {local.errorMessage}
          </span>
        </Show>
      </HeadlessSelect>
    </SelectSizeContext.Provider>
  );
}

/**
 * The trigger button for a select.
 */
export function SelectTrigger(props: SelectTriggerProps): JSX.Element {
  const mergedProps = useProviderProps(props);
  const [local, headlessProps] = splitProps(mergedProps, ["class"]);
  const size = useContext(SelectSizeContext);
  const customClass = local.class ?? "";

  const getClassName = (renderProps: SelectTriggerRenderProps): string =>
    [triggerStyles({ ...renderProps, size }), customClass].filter(Boolean).join(" ");

  return (
    <HeadlessSelectTrigger {...headlessProps} class={getClassName}>
      {(renderProps) => (
        <>
          {props.children as JSX.Element}
          <ChevronIcon class={chevronStyles({ size, isOpen: renderProps.isOpen })} />
        </>
      )}
    </HeadlessSelectTrigger>
  );
}

/**
 * Displays the selected value in a select.
 */
export function SelectValue<T>(props: SelectValueProps<T>): JSX.Element {
  const [local, headlessProps] = splitProps(props, ["class"]);
  const customClass = local.class ?? "";

  const getClassName = (renderProps: SelectValueRenderProps<T>): string =>
    [valueStyles({ isSelected: renderProps.isSelected }), customClass].filter(Boolean).join(" ");

  return <HeadlessSelectValue {...headlessProps} class={getClassName} children={props.children} />;
}

/**
 * The listbox popup for a select.
 */
export function SelectListBox<T>(props: SelectListBoxProps<T>): JSX.Element {
  const [local, headlessProps] = splitProps(props, ["class"]);
  const customClass = local.class ?? "";

  const getClassName = (_renderProps: SelectListBoxRenderProps): string =>
    [listBoxStyles, customClass].filter(Boolean).join(" ");

  return (
    <HeadlessSelectListBox {...headlessProps} class={getClassName} children={props.children} />
  );
}

/**
 * An option in a select listbox.
 */
export function SelectOption<T>(props: SelectOptionProps<T>): JSX.Element {
  const [local, headlessProps] = splitProps(props, ["class"]);
  const size = useContext(SelectSizeContext);
  const customClass = local.class ?? "";

  const getClassName = (renderProps: SelectOptionRenderProps): string =>
    [optionStyles({ ...renderProps, size }), customClass].filter(Boolean).join(" ");

  return (
    <HeadlessSelectOption {...headlessProps} class={getClassName}>
      {(renderProps) => (
        <>
          <Show when={renderProps.isSelected}>
            <CheckIcon class={checkmarkStyles({ size })} />
          </Show>
          <span class={optionLabelStyles({ size, isSelected: renderProps.isSelected })}>
            {props.children as JSX.Element}
          </span>
        </>
      )}
    </HeadlessSelectOption>
  );
}

function ChevronIcon(props: { class?: string }): JSX.Element {
  return (
    <svg class={props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function CheckIcon(props: { class?: string }): JSX.Element {
  return (
    <svg class={props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

Select.Trigger = SelectTrigger;
Select.Value = SelectValue;
Select.ListBox = SelectListBox;
Select.Option = SelectOption;

export type { Key };
