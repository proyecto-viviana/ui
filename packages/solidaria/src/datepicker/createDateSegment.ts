/**
 * createDateSegment hook for Solidaria
 *
 * Provides the behavior and accessibility implementation for a date segment.
 * Based on @react-aria/datepicker useDateSegment
 */

import { createSignal, createMemo, onCleanup } from "solid-js";
import { access, type MaybeAccessor } from "../utils/reactivity";
import type { DateFieldState, DateSegment, DateSegmentType } from "@proyecto-viviana/solid-stately";
import { useLocale } from "../i18n";

export interface AriaDateSegmentProps {
  /** The segment data. */
  segment: DateSegment;
  /** The ID of the calendar dialog controlled by this segment (when inside a datepicker). */
  "aria-controls"?: string;
  /** The ID of an element that describes the segment. */
  "aria-describedby"?: string;
}

export interface DateSegmentAria {
  /** Props for the segment element. */
  segmentProps: Record<string, unknown>;
  /** Whether the segment is focused. */
  isFocused: boolean;
  /** Whether the segment is editable. */
  isEditable: boolean;
  /** Whether the segment is a placeholder. */
  isPlaceholder: boolean;
  /** The text to display. */
  text: string;
  /** Whether the segment is hovered. */
  isHovered: boolean;
  /** Whether the segment has keyboard focus visible. */
  isFocusVisible: boolean;
}

/**
 * Provides the behavior and accessibility implementation for a date segment.
 */
export function createDateSegment<T extends DateFieldState>(
  props: MaybeAccessor<AriaDateSegmentProps>,
  state: T,
  ref?: () => HTMLElement | null,
): DateSegmentAria {
  const getProps = () => access(props);
  const [isFocused, setIsFocused] = createSignal(false);
  const [isFocusVisible, setIsFocusVisible] = createSignal(false);
  const [isHovered, setIsHovered] = createSignal(false);
  const [enteredKeys, setEnteredKeys] = createSignal("");
  const [isComposing, setIsComposing] = createSignal(false);
  const locale = useLocale();

  // Get the segment from props
  const segment = createMemo(() => getProps().segment);

  // Check if editable
  const isEditable = createMemo(() => {
    const seg = segment();
    return seg.isEditable && !state.isDisabled() && !state.isReadOnly();
  });

  // Long press state for ArrowUp / ArrowDown
  let longPressTimeout: ReturnType<typeof setTimeout> | null = null;
  let longPressInterval: ReturnType<typeof setInterval> | null = null;
  let hadPointerDown = false;

  const clearLongPress = () => {
    if (longPressTimeout) {
      clearTimeout(longPressTimeout);
      longPressTimeout = null;
    }
    if (longPressInterval) {
      clearInterval(longPressInterval);
      longPressInterval = null;
    }
  };

  const startLongPress = (action: () => void) => {
    clearLongPress();
    longPressTimeout = setTimeout(() => {
      action();
      longPressInterval = setInterval(() => {
        action();
      }, 100);
    }, 300);
  };

  onCleanup(() => {
    clearLongPress();
  });

  const focusSegment = (target: "first" | "last" | "prev" | "next") => {
    const el = ref?.();
    if (!el) return;

    const container = el.parentElement;
    if (!container) return;

    const segments = Array.from(container.querySelectorAll<HTMLElement>('[role="spinbutton"]'));

    if (segments.length === 0) return;

    if (target === "first") {
      segments[0]?.focus();
      return;
    }

    if (target === "last") {
      segments[segments.length - 1]?.focus();
      return;
    }

    const currentIndex = segments.indexOf(el);
    if (currentIndex < 0) return;

    const nextIndex = target === "next" ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= 0 && nextIndex < segments.length) {
      segments[nextIndex]?.focus();
    }
  };

  const clearCurrentSegment = (type: DateSegmentType) => {
    state.clearSegment(type);
    setEnteredKeys("");
  };

  // Handle keyboard input
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isEditable()) return;
    if (isComposing()) return;

    const seg = segment();
    const type = seg.type;

    if (type === "literal") return;

    // Keyboard interaction means focus is visible
    setIsFocusVisible(true);

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        focusSegment(locale().direction === "rtl" ? "prev" : "next");
        break;
      case "ArrowLeft":
        e.preventDefault();
        focusSegment(locale().direction === "rtl" ? "next" : "prev");
        break;
      case "ArrowUp":
        e.preventDefault();
        state.incrementSegment(type);
        if (!e.repeat) {
          startLongPress(() => state.incrementSegment(type));
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        state.decrementSegment(type);
        if (!e.repeat) {
          startLongPress(() => state.decrementSegment(type));
        }
        break;
      case "Home":
        e.preventDefault();
        focusSegment("first");
        break;
      case "End":
        e.preventDefault();
        focusSegment("last");
        break;
      case "Backspace":
        e.preventDefault();
        // Match common date-field UX: backspace on an empty placeholder moves to previous segment.
        if (seg.isPlaceholder) {
          focusSegment("prev");
        } else {
          clearCurrentSegment(type);
        }
        break;
      case "Delete":
        e.preventDefault();
        clearCurrentSegment(type);
        break;
      default:
        // Handle numeric input
        const normalizedDigit = normalizeDigit(e.key);
        if (normalizedDigit) {
          e.preventDefault();
          handleNumericInput(normalizedDigit, type, seg);
        }
        break;
    }
  };

  const handleKeyUp = () => {
    clearLongPress();
  };

  // Handle numeric input
  const handleNumericInput = (key: string, type: DateSegmentType, seg: DateSegment) => {
    const newKeys = enteredKeys() + key;
    const numValue = parseInt(newKeys, 10);
    const maxValue = seg.maxValue ?? 99;
    const minValue = seg.minValue ?? 0;
    const maxDigits = String(maxValue).length;

    // Check if we should accept more digits
    if (numValue <= maxValue) {
      state.setSegment(type, numValue);

      // If entering more digits wouldn't make sense, clear entered keys
      const potentialNextValue = parseInt(newKeys + "0", 10);
      if (potentialNextValue > maxValue || newKeys.length >= maxDigits) {
        setEnteredKeys("");
        focusSegment("next");
      } else {
        setEnteredKeys(newKeys);
      }
    } else {
      // Start fresh with just this key
      const singleValue = parseInt(key, 10);
      if (singleValue >= minValue && singleValue <= maxValue) {
        state.setSegment(type, singleValue);
        const potentialNextValue = parseInt(key + "0", 10);
        if (potentialNextValue > maxValue || key.length >= maxDigits) {
          setEnteredKeys("");
          focusSegment("next");
        } else {
          setEnteredKeys(key);
        }
      } else {
        setEnteredKeys("");
      }
    }
  };

  const handleBeforeInput = (e: InputEvent) => {
    if (!isEditable()) return;
    if (isComposing()) return;

    const seg = segment();
    if (seg.type === "literal") return;

    if (e.inputType === "deleteContentBackward" || e.inputType === "deleteContentForward") {
      e.preventDefault();
      clearCurrentSegment(seg.type);
      return;
    }

    if (e.inputType === "insertText" && e.data) {
      const normalizedDigit = normalizeDigit(e.data);
      if (!normalizedDigit) return;
      e.preventDefault();
      handleNumericInput(normalizedDigit, seg.type, seg);
    }
  };

  const handleCompositionStart = () => {
    if (!isEditable()) return;
    setIsComposing(true);
    setEnteredKeys("");
  };

  const handleCompositionEnd = (e: CompositionEvent) => {
    if (!isEditable()) return;
    setIsComposing(false);

    const seg = segment();
    if (seg.type === "literal") return;

    const digits = extractNormalizedDigits(e.data ?? "");
    if (digits.length === 0) return;

    for (const digit of digits) {
      handleNumericInput(digit, seg.type, seg);
    }
  };

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    setEnteredKeys("");

    if (!hadPointerDown) {
      setIsFocusVisible(true);
    }
    hadPointerDown = false;

    // Select all text in the segment
    const el = ref?.();
    if (el && typeof window !== "undefined") {
      const selection = window.getSelection();
      if (selection) {
        const range = new Range();
        range.selectNodeContents(el);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    setIsFocusVisible(false);
    setEnteredKeys("");
    clearLongPress();
    state.confirmPlaceholder();
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Segment props
  const segmentProps = createMemo(() => {
    const seg = segment();
    const type = seg.type;
    const p = getProps();

    // Literal segments don't need interaction props
    if (type === "literal") {
      return {
        "aria-hidden": true,
      };
    }

    return {
      role: "spinbutton",
      tabIndex: isEditable() ? 0 : -1,
      "aria-label": getSegmentLabel(type, locale().locale),
      "aria-valuenow": seg.value,
      "aria-valuemin": seg.minValue,
      "aria-valuemax": seg.maxValue,
      "aria-valuetext": seg.isPlaceholder ? "" : seg.text,
      "aria-readonly": state.isReadOnly() || undefined,
      "aria-disabled": state.isDisabled() || undefined,
      "aria-invalid": state.isInvalid() || undefined,
      "aria-controls": p["aria-controls"] || undefined,
      "aria-describedby": p["aria-describedby"] || undefined,
      contentEditable: isEditable(),
      suppressContentEditableWarning: true,
      inputMode: "numeric" as const,
      autoCorrect: "off",
      enterKeyHint: "next" as const,
      spellCheck: false,
      "data-placeholder": seg.isPlaceholder ? "true" : undefined,
      "data-readonly": state.isReadOnly() || undefined,
      "data-disabled": state.isDisabled() || undefined,
      "data-invalid": state.isInvalid() || undefined,
      "data-type": seg.type,
      "data-hovered": isHovered() || undefined,
      "data-focused": isFocused() || undefined,
      "data-focus-visible": isFocusVisible() || undefined,
      onKeyDown: handleKeyDown,
      onKeyUp: handleKeyUp,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onBeforeInput: handleBeforeInput,
      onCompositionStart: handleCompositionStart,
      onCompositionEnd: handleCompositionEnd,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onPointerDown: (e: PointerEvent) => {
        // Prevent cursor positioning in the middle of the segment
        e.preventDefault();
        hadPointerDown = true;
        setIsFocusVisible(false);
      },
      onPointerUp: () => {
        clearLongPress();
      },
    };
  });

  // Text to display
  const text = createMemo(() => {
    const seg = segment();
    return seg.isPlaceholder ? seg.placeholder : seg.text;
  });

  return {
    get segmentProps() {
      return segmentProps();
    },
    get isFocused() {
      return isFocused();
    },
    get isEditable() {
      return isEditable();
    },
    get isPlaceholder() {
      return segment().isPlaceholder;
    },
    get text() {
      return text();
    },
    get isHovered() {
      return isHovered();
    },
    get isFocusVisible() {
      return isFocusVisible();
    },
  };
}

const SEGMENT_LABELS: Record<string, Record<Exclude<DateSegmentType, "literal">, string>> = {
  en: {
    year: "Year",
    month: "Month",
    day: "Day",
    hour: "Hour",
    minute: "Minute",
    second: "Second",
    dayPeriod: "AM/PM",
    era: "Era",
    timeZoneName: "Time zone",
  },
  es: {
    year: "Año",
    month: "Mes",
    day: "Día",
    hour: "Hora",
    minute: "Minuto",
    second: "Segundo",
    dayPeriod: "AM/PM",
    era: "Era",
    timeZoneName: "Zona horaria",
  },
};

function getSegmentLabel(type: DateSegmentType, locale: string): string {
  if (type === "literal") return "";

  const language = locale.toLowerCase().split("-")[0] ?? "en";
  const labels = SEGMENT_LABELS[language] ?? SEGMENT_LABELS.en;
  return labels[type];
}

function normalizeDigit(input: string): string | null {
  if (/^[0-9]$/.test(input)) {
    return input;
  }

  const codePoint = input.codePointAt(0);
  if (codePoint == null) return null;

  // Full-width digits ０-９
  if (codePoint >= 0xff10 && codePoint <= 0xff19) {
    return String(codePoint - 0xff10);
  }

  return null;
}

function extractNormalizedDigits(value: string): string[] {
  const digits: string[] = [];
  for (const char of value) {
    const normalized = normalizeDigit(char);
    if (normalized) {
      digits.push(normalized);
    }
  }
  return digits;
}
