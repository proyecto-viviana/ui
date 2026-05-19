/**
 * createDateField hook for Solidaria
 *
 * Provides the behavior and accessibility implementation for a date field component.
 * Based on @react-aria/datepicker useDateField
 */

import { createMemo } from "solid-js";
import { createId } from "../ssr";
import { createLabel } from "../label/createLabel";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { mergeProps } from "../utils/mergeProps";
import { useLocale } from "../i18n";
import type { DateFieldState, DateSegment } from "@proyecto-viviana/solid-stately";

export interface AriaDateFieldProps {
  /** An ID for the date field. */
  id?: string;
  /** A visible label for the date field. */
  label?: string;
  /** An accessible label for the date field. */
  "aria-label"?: string;
  /** The ID of an element that labels the date field. */
  "aria-labelledby"?: string;
  /** The ID of an element that describes the date field. */
  "aria-describedby"?: string;
  /** Whether the date field is disabled. */
  isDisabled?: boolean;
  /** Whether the date field is read-only. */
  isReadOnly?: boolean;
  /** Whether the date field is required. */
  isRequired?: boolean;
  /** Whether the date field is invalid. */
  isInvalid?: boolean;
  /** Description text. */
  description?: string;
  /** Error message. */
  errorMessage?: string;
  /** Whether the element should receive focus on mount. */
  autoFocus?: boolean;
}

export interface DatePickerOverlayState {
  /** Whether the calendar overlay is open. */
  isOpen: boolean;
  /** Open the calendar overlay. */
  open: () => void;
  /** Close the calendar overlay. */
  close: () => void;
  /** Toggle the calendar overlay. */
  toggle: () => void;
}

export interface DateFieldAria {
  /** Props for the label element. */
  labelProps: Record<string, unknown>;
  /** Props for the field container element. */
  fieldProps: Record<string, unknown>;
  /** Props for the input container (holds segments). */
  inputProps: Record<string, unknown>;
  /** Props for the description element. */
  descriptionProps: Record<string, unknown>;
  /** Props for the error message element. */
  errorMessageProps: Record<string, unknown>;
  /** The segments to render. */
  segments: DateSegment[];
}

/**
 * Provides the behavior and accessibility implementation for a date field component.
 */
export function createDateField<T extends DateFieldState>(
  props: MaybeAccessor<AriaDateFieldProps>,
  state: T,
  _ref?: () => HTMLElement | null,
  overlayState?: DatePickerOverlayState,
): DateFieldAria {
  const getProps = () => access(props);
  const id = createId(getProps().id);
  const descriptionId = createId();
  const errorMessageId = createId();
  const locale = useLocale();

  // Create label handling
  const { labelProps, fieldProps: labelFieldProps } = createLabel({
    get label() {
      return getProps().label;
    },
    get "aria-label"() {
      return getProps()["aria-label"];
    },
    get "aria-labelledby"() {
      return getProps()["aria-labelledby"];
    },
    labelElementType: "span",
  });

  // Build aria-describedby
  const getAriaDescribedBy = () => {
    const p = getProps();
    const ids: string[] = [];
    if (p["aria-describedby"]) {
      ids.push(p["aria-describedby"]);
    }
    if (p.description) {
      ids.push(descriptionId);
    }
    if ((p.isInvalid || state.isInvalid()) && p.errorMessage) {
      ids.push(errorMessageId);
    }
    return ids.length > 0 ? ids.join(" ") : undefined;
  };

  // Segments from state
  const segments = createMemo(() => state.segments());

  // Label ID for linking input to label
  const getLabelId = () => (labelProps as Record<string, string | undefined>).id;

  // Localized role description
  const getRoleDescription = () => {
    const language = locale().locale.toLowerCase().split("-")[0] ?? "en";
    return language === "es" ? "Campo de fecha" : "Date field";
  };

  // Focus management helpers for segment navigation
  const focusSegment = (target: "first" | "last" | "prev" | "next", container: HTMLElement) => {
    const spinbuttons = Array.from(container.querySelectorAll<HTMLElement>('[role="spinbutton"]'));
    if (spinbuttons.length === 0) return;

    const active = document.activeElement as HTMLElement | null;
    const currentIndex = active ? spinbuttons.indexOf(active) : -1;

    if (target === "first") {
      spinbuttons[0]?.focus();
      return;
    }

    if (target === "last") {
      spinbuttons[spinbuttons.length - 1]?.focus();
      return;
    }

    let nextIndex: number;
    if (currentIndex < 0) {
      nextIndex = target === "next" ? 0 : spinbuttons.length - 1;
    } else {
      nextIndex = target === "next" ? currentIndex + 1 : currentIndex - 1;
    }

    if (nextIndex >= 0 && nextIndex < spinbuttons.length) {
      spinbuttons[nextIndex]?.focus();
    }
  };

  // Field container props
  const fieldProps = createMemo(() => {
    const p = getProps();

    const baseProps: Record<string, unknown> = mergeProps(
      labelFieldProps as Record<string, unknown>,
      {
        id,
        role: "group",
        "aria-disabled": p.isDisabled || state.isDisabled() || undefined,
        "aria-readonly": p.isReadOnly || state.isReadOnly() || undefined,
        "aria-required": p.isRequired || state.isRequired() || undefined,
        "aria-invalid": p.isInvalid || state.isInvalid() || undefined,
        "aria-describedby": getAriaDescribedBy(),
      },
    );

    // Integrate with date picker overlay when available
    if (overlayState) {
      const existingOnKeyDown = baseProps.onKeyDown as ((e: KeyboardEvent) => void) | undefined;

      baseProps.onKeyDown = (e: KeyboardEvent) => {
        existingOnKeyDown?.(e);
        if (e.altKey && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
          e.preventDefault();
          e.stopPropagation();
          overlayState.open();
        }
      };
    }

    return baseProps;
  });

  // Input container props
  const inputProps = createMemo(() => {
    const p = getProps();
    const labelId = getLabelId();
    const ariaLabelledBy = labelId
      ? p["aria-labelledby"]
        ? `${labelId} ${p["aria-labelledby"]}`
        : labelId
      : p["aria-labelledby"];

    const isDisabled = p.isDisabled || state.isDisabled();
    const isReadOnly = p.isReadOnly || state.isReadOnly();
    const isRequired = p.isRequired || state.isRequired();
    const isInvalid = p.isInvalid || state.isInvalid();
    const hasValue = state.value() != null;

    return {
      role: "presentation",
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": getAriaDescribedBy(),
      "aria-disabled": isDisabled || undefined,
      "aria-readonly": isReadOnly || undefined,
      "aria-required": isRequired || undefined,
      "aria-invalid": isInvalid || undefined,
      "aria-roledescription": getRoleDescription(),
      autoFocus: p.autoFocus,
      contentEditable: true,
      suppressContentEditableWarning: true,
      spellCheck: false,
      autoCorrect: "off",
      enterKeyHint: "next",
      inputMode: "numeric" as const,
      style: { caretColor: "transparent" },
      "data-placeholder": !hasValue ? "true" : undefined,
      onKeyDown: (e: KeyboardEvent) => {
        const target = e.target as HTMLElement;
        const currentTarget = e.currentTarget as HTMLElement;

        // Only handle at the container level, not when a segment is focused
        if (target !== currentTarget) return;

        const dir = locale().direction;
        const rtl = dir === "rtl";

        switch (e.key) {
          case "ArrowRight":
            e.preventDefault();
            focusSegment(rtl ? "prev" : "next", currentTarget);
            break;
          case "ArrowLeft":
            e.preventDefault();
            focusSegment(rtl ? "next" : "prev", currentTarget);
            break;
          case "Home":
            e.preventDefault();
            focusSegment("first", currentTarget);
            break;
          case "End":
            e.preventDefault();
            focusSegment("last", currentTarget);
            break;
        }
      },
      onFocus: () => {
        // Focus state is tracked by the component layer
      },
      onBlur: () => {
        state.confirmPlaceholder();
      },
      onClick: (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const currentTarget = e.currentTarget as HTMLElement;

        // Only handle when clicking the container itself (empty area between segments)
        if (target !== currentTarget) return;

        const spinbuttons = Array.from(
          currentTarget.querySelectorAll<HTMLElement>('[role="spinbutton"]'),
        );
        if (spinbuttons.length > 0) {
          spinbuttons[0].focus();
        }
      },
    };
  });

  // Description props
  const descriptionProps = createMemo(() => ({
    id: descriptionId,
  }));

  // Error message props
  const errorMessageProps = createMemo(() => ({
    id: errorMessageId,
    role: "alert",
  }));

  return {
    get labelProps() {
      return labelProps as Record<string, unknown>;
    },
    get fieldProps() {
      return fieldProps();
    },
    get inputProps() {
      return inputProps();
    },
    get descriptionProps() {
      return descriptionProps();
    },
    get errorMessageProps() {
      return errorMessageProps();
    },
    get segments() {
      return segments();
    },
  };
}
