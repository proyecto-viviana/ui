/**
 * createDateRangePicker hook for Solidaria
 *
 * Provides behavior and accessibility wiring for range date pickers. Faithful
 * port of @react-aria/datepicker `useDateRangePicker`.
 *
 * Mirrors the composed `createDatePicker`: the range picker does NOT re-implement
 * the two segmented fields. It hands each field its own field props (stamped
 * `[roleSymbol]="presentation"` + a SHARED `[focusManagerSymbol]` so arrow keys
 * and auto-advance walk across BOTH fields) to `createDateField`, which is what
 * names the segments ("month, Start Date" / "month, End Date") and publishes them
 * through the shared `hookData` WeakMap. Here we only provide:
 *  - `groupProps`: the labelled `role="group"` shell carrying the OUTER
 *    arrow-navigation (`createDatePickerGroup` with arrow-nav ENABLED — each inner
 *    presentation field disables its own and lets the key event bubble up here).
 *    The styled S2 layer overrides this to `role="presentation"`; the roleless
 *    root stays bare.
 *  - `startFieldProps` / `endFieldProps`: the presentation markers + shared focus
 *    manager + start/end labels, handed to `createDateField`.
 *  - `buttonProps` / `dialogProps` / `calendarProps` for the trigger + popover.
 */

import { createMemo } from "solid-js";
import { createId } from "../ssr";
import { createField } from "../label/createField";
import { createDescription } from "../utils/createDescription";
import { createFocusManager } from "../focus/FocusScope";
import { createStringFormatter } from "../i18n";
import { useLocale } from "../i18n";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { mergeProps } from "../utils/mergeProps";
import { createPress } from "../interactions/createPress";
import { datePickerStrings } from "./intl";
import { createDatePickerGroup } from "./createDatePickerGroup";
import { roleSymbol, focusManagerSymbol } from "./createDateField";
import type { RangeCalendarState } from "@proyecto-viviana/solid-stately";
import type { DatePickerState } from "./createDatePicker";

export interface AriaDateRangePickerProps {
  id?: string;
  label?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
  description?: string;
  errorMessage?: string;
  /** Accessible label for the calendar trigger button. */
  buttonAriaLabel?: string;
  /** Accessible label for the calendar dialog. */
  dialogAriaLabel?: string;
  /** Accessible label for the calendar grid region. */
  calendarAriaLabel?: string;
  /** The `name` attribute for the start date's hidden form input. */
  startName?: string;
  /** The `name` attribute for the end date's hidden form input. */
  endName?: string;
  /** The `<form>` the hidden inputs are associated with. */
  form?: string;
  /** Whether HTML form validation is used. */
  validationBehavior?: "aria" | "native";
  /** Auto focus the start field. */
  autoFocus?: boolean;
  /** Callback for key down (forwarded when the popover is closed). */
  onKeyDown?: (e: KeyboardEvent) => void;
  /** Callback for key up (forwarded when the popover is closed). */
  onKeyUp?: (e: KeyboardEvent) => void;
}

export interface DateRangePickerAria {
  /** Props for the labelled group shell (S2 overrides to role="presentation"). */
  groupProps: Record<string, unknown>;
  /** Props for the label element. */
  labelProps: Record<string, unknown>;
  /** Field props for the start date field — handed to createDateField. */
  startFieldProps: Record<string, unknown>;
  /** Field props for the end date field — handed to createDateField. */
  endFieldProps: Record<string, unknown>;
  /** Props for the button that opens the calendar. */
  buttonProps: Record<string, unknown>;
  /** Whether the trigger button is currently pressed. */
  isButtonPressed: () => boolean;
  /** Whether the trigger button is disabled (picker disabled OR read-only). */
  isButtonDisabled: () => boolean;
  /** Props for the calendar dialog. */
  dialogProps: Record<string, unknown>;
  /** Props for the calendar. */
  calendarProps: Record<string, unknown>;
  /** Props for the description element. */
  descriptionProps: Record<string, unknown>;
  /** Props for the error message element. */
  errorMessageProps: Record<string, unknown>;
  /** Whether the picker is invalid. */
  isInvalid: boolean;
  /** Focus manager for programmatic segment focus (shared across both fields). */
  focusManager: {
    focusFirst: () => void;
    focusLast: () => void;
  };
}

export function createDateRangePicker<T extends RangeCalendarState>(
  props: MaybeAccessor<AriaDateRangePickerProps>,
  state: T,
  overlayState: DatePickerState,
  ref: () => HTMLElement | null = () => null,
): DateRangePickerAria {
  const getProps = () => access(props);
  const buttonId = createId();
  const dialogId = createId();
  const startFieldId = createId();
  const endFieldId = createId();

  const stringFormatter = createStringFormatter(datePickerStrings, "@react-aria/datepicker");
  const locale = useLocale();

  // Label + description/error-message ids, mirroring upstream `useField`.
  const field = createField(() => {
    const p = getProps();
    return {
      id: p.id,
      label: p.label,
      "aria-label": p["aria-label"],
      "aria-labelledby": p["aria-labelledby"],
      "aria-describedby": p["aria-describedby"],
      description: p.description,
      labelElementType: "span",
      isInvalid: p.isInvalid,
      errorMessage: p.errorMessage,
    };
  });

  // labelledBy = the field label id (or the field id when there is no label),
  // reused by the fields, button and dialog. Mirrors useDateRangePicker.
  const labelledBy = (): string | undefined => {
    const fp = field.fieldProps as Record<string, string | undefined>;
    return fp["aria-labelledby"] || fp.id;
  };

  // Selected-range description for screen readers:
  // "Selected Range: February 3 to 14, 2025". Mirrors useDateRangePicker, which
  // formats the range with `{month: 'long'}` and folds the hidden description id
  // ahead of the visible describedby.
  const valueDescription = createMemo(() => {
    const range = state.formatValue(locale().locale, { month: "long" });
    return range
      ? stringFormatter().format("selectedRangeDescription", {
          startDate: range.start,
          endDate: range.end,
        })
      : "";
  });
  const descProps = createDescription(valueDescription);

  // The picker's own describedby = value description + the field's describedby
  // (visible description / error message ids folded in by createField).
  const ariaDescribedBy = (): string | undefined => {
    const fp = field.fieldProps as Record<string, string | undefined>;
    return (
      [descProps["aria-describedby"], fp["aria-describedby"]].filter(Boolean).join(" ") || undefined
    );
  };

  // Shared focus manager scoped to the whole group element, handed to BOTH fields
  // via focusManagerSymbol so auto-advance and programmatic focus (label click,
  // autoFocus) walk across the start/end field boundary.
  const sharedFocusManager = createFocusManager(ref);

  // FieldGroup shell. Faithful to useDateRangePicker `groupProps.role === 'group'`;
  // the label association, describedby, `aria-disabled` and the arrow-navigation /
  // press layer live here. The styled S2 layer OVERRIDES this to role="presentation".
  const outerGroup = createDatePickerGroup(
    {
      setOpen: (isOpen: boolean) => (isOpen ? overlayState.open() : overlayState.close()),
    },
    ref,
    false,
  );

  const groupProps = createMemo(() =>
    mergeProps(outerGroup(), {
      role: "group" as const,
      "aria-disabled": getProps().isDisabled || undefined,
      "aria-labelledby": labelledBy(),
      "aria-describedby": ariaDescribedBy(),
      onKeyDown(e: KeyboardEvent) {
        if (!overlayState.isOpen) {
          getProps().onKeyDown?.(e);
        }
      },
      onKeyUp(e: KeyboardEvent) {
        if (!overlayState.isOpen) {
          getProps().onKeyUp?.(e);
        }
      },
    }),
  );

  // Props shared by both fields: presentation marker + the shared focus manager +
  // validation flags. Display options (granularity/hourCycle/…) live on the field
  // STATE (createDateFieldState), so they are not repeated here.
  const commonFieldProps = () => {
    const p = getProps();
    return {
      [roleSymbol]: "presentation",
      [focusManagerSymbol]: sharedFocusManager,
      "aria-labelledby": labelledBy(),
      "aria-describedby": ariaDescribedBy(),
      isDisabled: p.isDisabled || state.isDisabled(),
      isReadOnly: p.isReadOnly || state.isReadOnly(),
      isRequired: p.isRequired,
      validationBehavior: p.validationBehavior,
      form: p.form,
    };
  };

  const startFieldProps = createMemo(() => {
    const p = getProps();
    return mergeProps(commonFieldProps() as Record<string, unknown>, {
      id: startFieldId,
      "aria-label": stringFormatter().format("startDate"),
      autoFocus: p.autoFocus,
      name: p.startName,
    });
  });

  const endFieldProps = createMemo(() => {
    const p = getProps();
    return mergeProps(commonFieldProps() as Record<string, unknown>, {
      id: endFieldId,
      "aria-label": stringFormatter().format("endDate"),
      name: p.endName,
    });
  });

  // Trigger button. Disabled when the picker is disabled OR read-only.
  const isButtonDisabled = () => {
    const p = getProps();
    return p.isDisabled || state.isDisabled() || p.isReadOnly || state.isReadOnly();
  };

  const buttonPress = createPress({
    get isDisabled() {
      return isButtonDisabled();
    },
    onPress: () => {
      overlayState.open();
    },
  });

  const buttonProps = createMemo(() => {
    const p = getProps();
    return mergeProps(buttonPress.pressProps as Record<string, unknown>, {
      id: buttonId,
      type: "button" as const,
      "aria-haspopup": "dialog" as const,
      "aria-label": p.buttonAriaLabel ?? stringFormatter().format("calendar"),
      "aria-labelledby": `${buttonId} ${labelledBy()}`,
      "aria-describedby": ariaDescribedBy(),
      "aria-expanded": overlayState.isOpen,
      "aria-disabled": isButtonDisabled() || undefined,
      tabIndex: 0,
    });
  });

  // Dialog props. Upstream is only `{id, 'aria-labelledby'}`; the port keeps
  // `role="dialog"` because DateRangePickerContent spreads these onto the popover
  // container and this is the only role source there (RAC's Dialog would add it).
  const dialogProps = createMemo(() => ({
    id: dialogId,
    role: "dialog" as const,
    "aria-labelledby": `${buttonId} ${labelledBy()}`,
  }));

  // Calendar props. Faithful to useDateRangePicker (NO aria-label upstream); a
  // provided calendar/dialog aria-label is threaded through for parity with the
  // styled escape hatches. Largely vestigial in the port — the popover
  // RangeCalendar reads its state through RangeCalendarContext directly.
  const calendarProps = createMemo(() => {
    const p = getProps();
    const label = p.calendarAriaLabel ?? p.dialogAriaLabel;
    return {
      autoFocus: true,
      value: state.value(),
      minValue: undefined,
      maxValue: undefined,
      isDisabled: p.isDisabled || state.isDisabled(),
      isReadOnly: p.isReadOnly || state.isReadOnly(),
      isInvalid: p.isInvalid,
      ...(label ? { "aria-label": label } : {}),
    };
  });

  // Label click focuses the first segment (of the start field).
  const enhancedLabelProps = createMemo(() => ({
    ...(field.labelProps as Record<string, unknown>),
    onClick: () => {
      sharedFocusManager.focusFirst();
    },
  }));

  const isInvalid = createMemo(() => Boolean(getProps().isInvalid));

  return {
    get groupProps() {
      return groupProps();
    },
    get labelProps() {
      return enhancedLabelProps() as Record<string, unknown>;
    },
    get startFieldProps() {
      return startFieldProps();
    },
    get endFieldProps() {
      return endFieldProps();
    },
    get buttonProps() {
      return buttonProps();
    },
    isButtonPressed: () => buttonPress.isPressed(),
    isButtonDisabled: () => isButtonDisabled(),
    get dialogProps() {
      return dialogProps();
    },
    get calendarProps() {
      return calendarProps();
    },
    get descriptionProps() {
      return field.descriptionProps as Record<string, unknown>;
    },
    get errorMessageProps() {
      return field.errorMessageProps as Record<string, unknown>;
    },
    get isInvalid() {
      return isInvalid();
    },
    focusManager: {
      focusFirst: () => sharedFocusManager.focusFirst(),
      focusLast: () => sharedFocusManager.focusLast(),
    },
  };
}
