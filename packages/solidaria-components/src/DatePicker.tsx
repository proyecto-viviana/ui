/**
 * DatePicker component for solidaria-components
 *
 * Pre-wired headless date picker component that combines a date field with a calendar popup.
 * Port of react-aria-components/src/DatePicker.tsx
 */

import {
  type JSX,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  splitProps,
  useContext,
  Show,
} from "solid-js";
import { Portal } from "solid-js/web";
import {
  createDatePicker,
  createDateRangePicker,
  createPopover,
  FocusScope,
  useUNSAFE_PortalContext,
  type AriaDatePickerProps,
  type AriaDateRangePickerProps,
  type DatePickerState as AriaDatePickerState,
} from "@proyecto-viviana/solidaria";
import {
  createDateFieldState,
  createCalendarState,
  createRangeCalendarState,
  type DateFieldState,
  type CalendarState,
  type RangeCalendarState,
  type DateFieldStateProps,
  type CalendarDate,
  type DateValue,
  type RangeCalendarStateProps,
  type RangeValue,
} from "@proyecto-viviana/solid-stately";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  dataAttr,
  useIsHydrated,
} from "./utils";
import { DateFieldContext } from "./DateField";
import { CalendarContext } from "./Calendar";
import { RangeCalendarContext } from "./RangeCalendar";

export interface DatePickerRenderProps {
  /** Whether the picker is disabled. */
  isDisabled: boolean;
  /** Whether the picker is read-only. */
  isReadOnly: boolean;
  /** Whether the picker is required. */
  isRequired: boolean;
  /** Whether the picker is invalid. */
  isInvalid: boolean;
  /** Whether the calendar is open. */
  isOpen: boolean;
}

export interface DateRangePickerRenderProps extends Omit<DatePickerRenderProps, "isInvalid"> {
  isInvalid: boolean;
}

export interface DatePickerContextValue {
  fieldState: DateFieldState<DateValue>;
  calendarState: CalendarState<DateValue>;
  overlayState: {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
  };
  triggerRef: () => HTMLElement | null;
  setTriggerRef: (element: HTMLElement | null) => void;
  pickerAria: ReturnType<typeof createDatePicker>;
}

export interface DateRangePickerContextValue {
  calendarState: RangeCalendarState<DateValue>;
  overlayState: {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
  };
  triggerRef: () => HTMLElement | null;
  setTriggerRef: (element: HTMLElement | null) => void;
  pickerAria: ReturnType<typeof createDateRangePicker>;
}

export interface DatePickerProps<T extends DateValue = DateValue>
  extends
    Omit<AriaDatePickerProps, "id" | "isDisabled" | "isReadOnly" | "isRequired">,
    Omit<DateFieldStateProps<T>, "locale">,
    SlotProps {
  /** The children of the component. */
  children?: JSX.Element;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<DatePickerRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<DatePickerRenderProps>;
  /** The locale to use for formatting. */
  locale?: string;
  /** Whether the calendar should close when a date is selected. */
  shouldCloseOnSelect?: boolean;
}

export interface DateRangePickerProps<T extends DateValue = DateValue>
  extends
    Omit<AriaDateRangePickerProps, "id" | "isDisabled" | "isReadOnly">,
    Omit<RangeCalendarStateProps<T>, "locale">,
    SlotProps {
  children?: JSX.Element;
  class?: ClassNameOrFunction<DateRangePickerRenderProps>;
  style?: StyleOrFunction<DateRangePickerRenderProps>;
  locale?: string;
  shouldCloseOnSelect?: boolean;
}

export interface DatePickerButtonRenderProps {
  /** Whether the button is disabled. */
  isDisabled: boolean;
  /** Whether the calendar is open. */
  isOpen: boolean;
}

export interface DatePickerButtonProps extends SlotProps {
  /** The children of the component. */
  children?: RenderChildren<DatePickerButtonRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<DatePickerButtonRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<DatePickerButtonRenderProps>;
  /** Whether the button is disabled. */
  isDisabled?: boolean;
}

export interface DateRangePickerButtonProps extends DatePickerButtonProps {}

export const DatePickerContext = createContext<DatePickerContextValue | null>(null);
export const DateRangePickerContext = createContext<DateRangePickerContextValue | null>(null);
export const DatePickerStateContext = createContext<DateFieldState<DateValue> | null>(null);
export const DateRangePickerStateContext = createContext<RangeCalendarState<DateValue> | null>(
  null,
);

export function useDatePickerContext(): DatePickerContextValue {
  const context = useContext(DatePickerContext);
  if (!context) {
    throw new Error("DatePicker components must be used within a DatePicker");
  }
  return context;
}

export function useDateRangePickerContext(): DateRangePickerContextValue {
  const context = useContext(DateRangePickerContext);
  if (!context) {
    throw new Error("DateRangePicker components must be used within a DateRangePicker");
  }
  return context;
}

/**
 * A date picker combines a DateField and a Calendar popover.
 *
 * @example
 * ```tsx
 * <DatePicker label="Event date">
 *   <Label>Event date</Label>
 *   <Group>
 *     <DateInput>
 *       {(segment) => <DateSegment segment={segment} />}
 *     </DateInput>
 *     <DatePickerButton>📅</DatePickerButton>
 *   </Group>
 *   <Popover>
 *     <Dialog>
 *       <Calendar>
 *         <CalendarGrid>
 *           {(date) => <CalendarCell date={date} />}
 *         </CalendarGrid>
 *       </Calendar>
 *     </Dialog>
 *   </Popover>
 * </DatePicker>
 * ```
 */
export function DatePicker<T extends DateValue = CalendarDate>(
  props: DatePickerProps<T>,
): JSX.Element {
  // Use hydration-safe pattern for client-only rendering
  const isHydrated = useIsHydrated();

  return (
    <Show
      when={isHydrated()}
      fallback={
        <div class="solidaria-DatePicker solidaria-DatePicker--placeholder" aria-hidden="true" />
      }
    >
      <DatePickerInner {...props} />
    </Show>
  );
}

/**
 * Internal DatePicker component that renders after client mount.
 */
function DatePickerInner<T extends DateValue = CalendarDate>(
  props: DatePickerProps<T>,
): JSX.Element {
  const [local, stateProps, rest] = splitProps(
    props,
    ["children", "class", "style", "slot", "shouldCloseOnSelect"],
    [
      "value",
      "defaultValue",
      "onChange",
      "minValue",
      "maxValue",
      "isDisabled",
      "isReadOnly",
      "isRequired",
      "locale",
      "granularity",
      "hourCycle",
      "hideTimeZone",
      "placeholderValue",
      "validationState",
      "description",
      "errorMessage",
    ],
  );

  const [isOpen, setIsOpen] = createSignal(false);
  let triggerRef: HTMLElement | null = null;

  const overlayState = {
    get isOpen() {
      return isOpen();
    },
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };

  const fieldState = createDateFieldState({
    ...stateProps,
    onChange: (value) => {
      stateProps.onChange?.(value);
      if (local.shouldCloseOnSelect !== false && value) {
        overlayState.close();
      }
    },
  });

  // Create calendar state that syncs with field
  const calendarState = createCalendarState({
    value: () => fieldState.value(),
    onChange: (value) => {
      fieldState.setValue(value as T | null);
      if (local.shouldCloseOnSelect !== false) {
        overlayState.close();
      }
    },
    minValue: stateProps.minValue,
    maxValue: stateProps.maxValue,
    isDisabled: stateProps.isDisabled,
    isReadOnly: stateProps.isReadOnly,
    locale: stateProps.locale,
  });

  // Create date picker ARIA props
  const pickerAria = createDatePicker(
    () => ({
      ...(rest as Record<string, unknown>),
      description: stateProps.description,
      errorMessage: stateProps.errorMessage,
    }),
    fieldState as unknown as DateFieldState<DateValue>,
    overlayState as AriaDatePickerState,
    calendarState as unknown as CalendarState<DateValue>,
  );

  const contextValue: DatePickerContextValue = {
    fieldState: fieldState as unknown as DateFieldState<DateValue>,
    calendarState: calendarState as unknown as CalendarState<DateValue>,
    overlayState,
    triggerRef: () => triggerRef,
    setTriggerRef: (element) => {
      if (!element) return;
      if (!triggerRef || !triggerRef.isConnected) {
        triggerRef = element;
      }
    },
    pickerAria,
  };

  const isInvalid = createMemo(
    () => fieldState.isInvalid() || Boolean((rest as { isInvalid?: boolean }).isInvalid),
  );

  const renderValues = createMemo<DatePickerRenderProps>(() => ({
    isDisabled: fieldState.isDisabled(),
    isReadOnly: fieldState.isReadOnly(),
    isRequired: fieldState.isRequired(),
    isInvalid: isInvalid(),
    isOpen: overlayState.isOpen,
  }));

  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-DatePicker",
    },
    renderValues,
  );

  return (
    <DatePickerStateContext.Provider value={fieldState as unknown as DateFieldState<DateValue>}>
      <DatePickerContext.Provider value={contextValue}>
        {/* Also provide DateFieldContext so DateInput/DateSegment work inside DatePicker */}
        <DateFieldContext.Provider
          value={{
            state: fieldState as unknown as DateFieldState<DateValue>,
            aria: {
              labelProps: pickerAria.labelProps,
              inputProps: pickerAria.fieldProps,
              descriptionProps: pickerAria.descriptionProps,
              errorMessageProps: pickerAria.errorMessageProps,
            },
          }}
        >
          <CalendarContext.Provider value={calendarState as unknown as CalendarState<DateValue>}>
            <div
              {...pickerAria.groupProps}
              class={renderProps.class()}
              style={renderProps.style()}
              data-disabled={dataAttr(fieldState.isDisabled())}
              data-readonly={dataAttr(fieldState.isReadOnly())}
              data-required={dataAttr(fieldState.isRequired())}
              data-invalid={dataAttr(isInvalid())}
              data-open={dataAttr(overlayState.isOpen)}
            >
              {props.children}
            </div>
          </CalendarContext.Provider>
        </DateFieldContext.Provider>
      </DatePickerContext.Provider>
    </DatePickerStateContext.Provider>
  );
}

export function DateRangePicker<T extends DateValue = CalendarDate>(
  props: DateRangePickerProps<T>,
): JSX.Element {
  const isHydrated = useIsHydrated();
  return (
    <Show
      when={isHydrated()}
      fallback={
        <div
          class="solidaria-DateRangePicker solidaria-DateRangePicker--placeholder"
          aria-hidden="true"
        />
      }
    >
      <DateRangePickerInner {...props} />
    </Show>
  );
}

function DateRangePickerInner<T extends DateValue = CalendarDate>(
  props: DateRangePickerProps<T>,
): JSX.Element {
  const [local, stateProps, rest] = splitProps(
    props,
    ["children", "class", "style", "slot", "shouldCloseOnSelect"],
    [
      "value",
      "defaultValue",
      "onChange",
      "minValue",
      "maxValue",
      "isDisabled",
      "isReadOnly",
      "focusedValue",
      "defaultFocusedValue",
      "onFocusChange",
      "locale",
      "isDateUnavailable",
      "visibleMonths",
      "isDateDisabled",
      "validationState",
      "allowsNonContiguousRanges",
      "firstDayOfWeek",
    ],
  );

  const [isOpen, setIsOpen] = createSignal(false);
  let triggerRef: HTMLElement | null = null;
  const overlayState = {
    get isOpen() {
      return isOpen();
    },
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };

  const calendarState = createRangeCalendarState({
    ...stateProps,
    onChange: (value) => {
      stateProps.onChange?.(value);
      if (local.shouldCloseOnSelect !== false && value?.start && value?.end) {
        overlayState.close();
      }
    },
  });
  const pickerAria = createDateRangePicker(
    () => ({
      ...(rest as Record<string, unknown>),
      description: (props as { description?: string }).description,
      errorMessage: (props as { errorMessage?: string }).errorMessage,
    }),
    calendarState as unknown as RangeCalendarState<DateValue>,
    overlayState as AriaDatePickerState,
  );

  const isInvalid = createMemo(
    () =>
      Boolean((rest as { isInvalid?: boolean }).isInvalid) ||
      calendarState.validationState() === "invalid",
  );
  const isRequired = createMemo(() => Boolean((rest as { isRequired?: boolean }).isRequired));

  const contextValue: DateRangePickerContextValue = {
    calendarState: calendarState as unknown as RangeCalendarState<DateValue>,
    overlayState,
    triggerRef: () => triggerRef,
    setTriggerRef: (element) => {
      if (!element) return;
      if (!triggerRef || !triggerRef.isConnected) triggerRef = element;
    },
    pickerAria,
  };

  const renderValues = createMemo<DateRangePickerRenderProps>(() => ({
    isDisabled: calendarState.isDisabled(),
    isReadOnly: calendarState.isReadOnly(),
    isRequired: isRequired(),
    isInvalid: isInvalid(),
    isOpen: overlayState.isOpen,
  }));

  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-DateRangePicker",
    },
    renderValues,
  );

  return (
    <DateRangePickerStateContext.Provider
      value={calendarState as unknown as RangeCalendarState<DateValue>}
    >
      <DateRangePickerContext.Provider value={contextValue}>
        <RangeCalendarContext.Provider
          value={calendarState as unknown as RangeCalendarState<DateValue>}
        >
          <div
            {...pickerAria.groupProps}
            class={renderProps.class()}
            style={renderProps.style()}
            data-disabled={dataAttr(calendarState.isDisabled())}
            data-readonly={dataAttr(calendarState.isReadOnly())}
            data-required={dataAttr(isRequired())}
            data-invalid={dataAttr(isInvalid())}
            data-open={dataAttr(overlayState.isOpen)}
          >
            {props.children}
          </div>
        </RangeCalendarContext.Provider>
      </DateRangePickerContext.Provider>
    </DateRangePickerStateContext.Provider>
  );
}

/**
 * A button that opens the date picker calendar.
 */
export function DatePickerButton(props: DatePickerButtonProps): JSX.Element {
  const context = useDatePickerContext();
  let buttonRef: HTMLButtonElement | undefined;

  const renderValues = createMemo<DatePickerButtonRenderProps>(() => ({
    isDisabled: context.fieldState.isDisabled() || (props.isDisabled ?? false),
    isOpen: context.overlayState.isOpen,
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: props.class,
      style: props.style,
      defaultClassName: "solidaria-DatePickerButton",
    },
    renderValues,
  );

  // Determine children content - avoid Show for SSR hydration compatibility
  const getChildren = () => {
    if (typeof props.children === "function") {
      return renderProps.renderChildren();
    }
    return props.children ?? "📅";
  };

  return (
    <button
      ref={(el) => {
        buttonRef = el;
        context.setTriggerRef(el);
      }}
      {...context.pickerAria.buttonProps}
      class={renderProps.class()}
      style={renderProps.style()}
      disabled={context.fieldState.isDisabled() || props.isDisabled}
      data-disabled={dataAttr(context.fieldState.isDisabled() || props.isDisabled)}
      data-open={dataAttr(context.overlayState.isOpen)}
    >
      {getChildren()}
    </button>
  );
}

export function DateRangePickerButton(props: DateRangePickerButtonProps): JSX.Element {
  const context = useDateRangePickerContext();

  const renderValues = createMemo<DatePickerButtonRenderProps>(() => ({
    isDisabled: context.calendarState.isDisabled() || (props.isDisabled ?? false),
    isOpen: context.overlayState.isOpen,
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: props.class,
      style: props.style,
      defaultClassName: "solidaria-DateRangePickerButton",
    },
    renderValues,
  );

  const getChildren = () => {
    if (typeof props.children === "function") {
      return renderProps.renderChildren();
    }
    return props.children ?? "📅";
  };

  return (
    <button
      ref={(el) => context.setTriggerRef(el)}
      {...context.pickerAria.buttonProps}
      class={renderProps.class()}
      style={renderProps.style()}
      disabled={context.calendarState.isDisabled() || props.isDisabled}
      data-disabled={dataAttr(context.calendarState.isDisabled() || props.isDisabled)}
      data-open={dataAttr(context.overlayState.isOpen)}
    >
      {getChildren()}
    </button>
  );
}

export interface DatePickerContentProps extends SlotProps {
  /** The children of the component. */
  children?: JSX.Element;
  /** The CSS className for the element. */
  class?: string;
  /** The inline style for the element. */
  style?: JSX.CSSProperties;
}

export interface DateRangePickerContentProps extends DatePickerContentProps {}

export interface DatePickerLabelProps {
  children?: JSX.Element;
  class?: string;
}

export function DatePickerLabel(props: DatePickerLabelProps): JSX.Element {
  const context = useDatePickerContext();
  return (
    <span {...context.pickerAria.labelProps} class={props.class}>
      {props.children}
    </span>
  );
}

export interface DatePickerDescriptionProps {
  children?: JSX.Element;
  class?: string;
}

export function DatePickerDescription(props: DatePickerDescriptionProps): JSX.Element {
  const context = useDatePickerContext();
  return (
    <p {...context.pickerAria.descriptionProps} class={props.class}>
      {props.children}
    </p>
  );
}

export interface DatePickerErrorMessageProps {
  children?: JSX.Element;
  class?: string;
}

export function DatePickerErrorMessage(props: DatePickerErrorMessageProps): JSX.Element {
  const context = useDatePickerContext();
  return (
    <p {...context.pickerAria.errorMessageProps} class={props.class}>
      {props.children}
    </p>
  );
}

export interface DateRangePickerLabelProps {
  children?: JSX.Element;
  class?: string;
}

export function DateRangePickerLabel(props: DateRangePickerLabelProps): JSX.Element {
  const context = useDateRangePickerContext();
  return (
    <span {...context.pickerAria.labelProps} class={props.class}>
      {props.children}
    </span>
  );
}

export interface DateRangePickerDescriptionProps {
  children?: JSX.Element;
  class?: string;
}

export function DateRangePickerDescription(props: DateRangePickerDescriptionProps): JSX.Element {
  const context = useDateRangePickerContext();
  return (
    <p {...context.pickerAria.descriptionProps} class={props.class}>
      {props.children}
    </p>
  );
}

export interface DateRangePickerErrorMessageProps {
  children?: JSX.Element;
  class?: string;
}

export function DateRangePickerErrorMessage(props: DateRangePickerErrorMessageProps): JSX.Element {
  const context = useDateRangePickerContext();
  return (
    <p {...context.pickerAria.errorMessageProps} class={props.class}>
      {props.children}
    </p>
  );
}

/**
 * The content area of the date picker (typically contains a Calendar).
 */
export function DatePickerContent(props: DatePickerContentProps): JSX.Element {
  const context = useDatePickerContext();
  const portalContext = useUNSAFE_PortalContext();
  let contentRef: HTMLDivElement | undefined;
  const portalContainer = () => portalContext.getContainer?.() ?? undefined;

  const popoverAria = createPopover(
    {
      triggerRef: () => context.triggerRef()?.parentElement ?? context.triggerRef(),
      popoverRef: () => contentRef ?? null,
      placement: "bottom start",
      offset: 8,
      isNonModal: false,
      isKeyboardDismissDisabled: false,
    },
    {
      isOpen: () => context.overlayState.isOpen,
      open: context.overlayState.open,
      close: context.overlayState.close,
      toggle: context.overlayState.toggle,
    },
  );

  const cleanPopoverProps = () => {
    const {
      style: _style,
      ref: _ref,
      ...rest
    } = popoverAria.popoverProps as Record<string, unknown>;
    return rest;
  };

  const mergedStyle = (): JSX.CSSProperties => {
    const popoverStyle = (popoverAria.popoverProps as Record<string, unknown>).style as
      | JSX.CSSProperties
      | undefined;
    return {
      ...popoverStyle,
      ...props.style,
    };
  };

  createEffect(() => {
    if (!context.overlayState.isOpen || !contentRef) return;
    if (document.activeElement !== contentRef) {
      contentRef.focus({ preventScroll: true });
    }
  });

  return (
    <Show when={context.overlayState.isOpen}>
      <Portal mount={portalContainer()}>
        <FocusScope contain restoreFocus>
          <div
            ref={contentRef}
            {...cleanPopoverProps()}
            {...context.pickerAria.dialogProps}
            tabIndex={-1}
            class={props.class ?? "solidaria-DatePickerContent"}
            style={mergedStyle()}
            data-placement={popoverAria.placement() ?? undefined}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                context.overlayState.close();
                requestAnimationFrame(() => context.triggerRef()?.focus());
              }
            }}
          >
            {props.children}
          </div>
        </FocusScope>
      </Portal>
    </Show>
  );
}

export function DateRangePickerContent(props: DateRangePickerContentProps): JSX.Element {
  const context = useDateRangePickerContext();
  const portalContext = useUNSAFE_PortalContext();
  let contentRef: HTMLDivElement | undefined;
  const portalContainer = () => portalContext.getContainer?.() ?? undefined;

  const popoverAria = createPopover(
    {
      triggerRef: () => context.triggerRef()?.parentElement ?? context.triggerRef(),
      popoverRef: () => contentRef ?? null,
      placement: "bottom start",
      offset: 8,
      isNonModal: false,
      isKeyboardDismissDisabled: false,
    },
    {
      isOpen: () => context.overlayState.isOpen,
      open: context.overlayState.open,
      close: context.overlayState.close,
      toggle: context.overlayState.toggle,
    },
  );

  const cleanPopoverProps = () => {
    const {
      style: _style,
      ref: _ref,
      ...rest
    } = popoverAria.popoverProps as Record<string, unknown>;
    return rest;
  };

  const mergedStyle = (): JSX.CSSProperties => {
    const popoverStyle = (popoverAria.popoverProps as Record<string, unknown>).style as
      | JSX.CSSProperties
      | undefined;
    return {
      ...popoverStyle,
      ...props.style,
    };
  };

  createEffect(() => {
    if (!context.overlayState.isOpen || !contentRef) return;
    if (document.activeElement !== contentRef) {
      contentRef.focus({ preventScroll: true });
    }
  });

  return (
    <Show when={context.overlayState.isOpen}>
      <Portal mount={portalContainer()}>
        <FocusScope contain restoreFocus>
          <div
            ref={contentRef}
            {...cleanPopoverProps()}
            {...context.pickerAria.dialogProps}
            tabIndex={-1}
            class={props.class ?? "solidaria-DateRangePickerContent"}
            style={mergedStyle()}
            data-placement={popoverAria.placement() ?? undefined}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                context.overlayState.close();
                requestAnimationFrame(() => context.triggerRef()?.focus());
              }
            }}
          >
            {props.children}
          </div>
        </FocusScope>
      </Portal>
    </Show>
  );
}

// DatePickerContextValue is already exported at declaration
