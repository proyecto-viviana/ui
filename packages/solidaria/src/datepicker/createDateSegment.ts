/**
 * createDateSegment hook for Solidaria
 *
 * Provides the behavior and accessibility implementation for a single editable
 * date segment. Faithful port of @react-aria/datepicker `useDateSegment` — the
 * spinbutton wiring (value stepping + live announcements) is delegated to
 * `createSpinButton`, numeric text entry flows through native `beforeinput`
 * events, and segment focus recovery on unmount mirrors upstream's layout effect.
 */

import { createMemo, createEffect, onCleanup } from "solid-js";
import { toCalendar, CalendarDate } from "@internationalized/date";
import { NumberParser } from "@internationalized/number";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { mergeProps } from "../utils/mergeProps";
import { isMac, isIOS, scrollIntoViewport, getScrollParent, nodeContains } from "../utils";
import { createId } from "../ssr";
import { createLabels } from "../label/createLabels";
import { useLocale, createDateFormatter, createFilter } from "../i18n";
import { createSpinButton } from "../spinbutton";
import { createDisplayNames } from "./createDisplayNames";
import { hookData } from "./createDateField";
import type { DateFieldState, DateSegment, DateSegmentType } from "@proyecto-viviana/solid-stately";

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
}

function commonPrefixLength(strings: string[]): number {
  strings.sort();
  const first = strings[0];
  const last = strings[strings.length - 1];
  for (let i = 0; i < first.length; i++) {
    if (first[i] !== last[i]) {
      return i;
    }
  }
  return 0;
}

/**
 * Provides the behavior and accessibility implementation for a date segment.
 */
export function createDateSegment<T extends DateFieldState>(
  props: MaybeAccessor<AriaDateSegmentProps>,
  state: T,
  ref: () => HTMLElement | null,
): DateSegmentAria {
  const getProps = () => access(props);
  const segment = () => getProps().segment;
  let enteredKeys = "";
  const localeInfo = useLocale();
  const locale = () => localeInfo().locale;
  const direction = () => localeInfo().direction;
  const displayNames = createDisplayNames();
  const hd = hookData.get(state as unknown as object) as
    | {
        ariaLabel?: string;
        ariaLabelledBy?: string;
        ariaDescribedBy?: () => string | undefined;
        focusManager: {
          focusNext: () => HTMLElement | null;
          focusPrevious: () => HTMLElement | null;
        };
      }
    | undefined;
  const focusManager = hd?.focusManager;
  const segmentId = createId();

  const resolvedOptions = state.dateFormatter.resolvedOptions();
  const monthDateFormatter = createDateFormatter({
    month: "long",
    timeZone: resolvedOptions.timeZone,
  });
  const hourDateFormatter = createDateFormatter({
    hour: "numeric",
    hour12: resolvedOptions.hour12,
    timeZone: resolvedOptions.timeZone,
  });

  const textValue = createMemo(() => {
    const seg = segment();
    let value = seg.isPlaceholder ? "" : seg.text;
    if (seg.type === "month" && !seg.isPlaceholder) {
      const monthTextValue = monthDateFormatter().format(state.dateValue());
      value = monthTextValue !== value ? `${value} \u{2013} ${monthTextValue}` : monthTextValue;
    } else if (seg.type === "hour" && !seg.isPlaceholder) {
      value = hourDateFormatter().format(state.dateValue());
    }
    return value;
  });

  const spinButton = createSpinButton(() => {
    const seg = segment();
    return {
      // The ARIA spec says aria-valuenow is optional if there's no value, but aXe requires it.
      value: seg.value ?? undefined,
      textValue: textValue(),
      minValue: seg.minValue,
      maxValue: seg.maxValue,
      isDisabled: state.isDisabled(),
      isReadOnly: state.isReadOnly() || !seg.isEditable,
      isRequired: state.isRequired(),
      onIncrement: () => {
        enteredKeys = "";
        state.increment(seg.type);
      },
      onDecrement: () => {
        enteredKeys = "";
        state.decrement(seg.type);
      },
      onIncrementPage: () => {
        enteredKeys = "";
        state.incrementPage(seg.type);
      },
      onDecrementPage: () => {
        enteredKeys = "";
        state.decrementPage(seg.type);
      },
      onIncrementToMax: () => {
        enteredKeys = "";
        state.incrementToMax(seg.type);
      },
      onDecrementToMin: () => {
        enteredKeys = "";
        state.decrementToMin(seg.type);
      },
    };
  });

  const parser = createMemo(() => new NumberParser(locale(), { maximumFractionDigits: 0 }));

  const backspace = () => {
    const seg = segment();
    if (seg.text === seg.placeholder) {
      focusManager?.focusPrevious();
    }
    if (parser().isValidPartialNumber(seg.text) && !state.isReadOnly() && !seg.isPlaceholder) {
      let newValue = seg.text.slice(0, -1);
      const parsed = parser().parse(newValue);
      newValue = parsed === 0 ? "" : newValue;
      if (newValue.length === 0 || parsed === 0) {
        state.clearSegment(seg.type);
      } else {
        state.setSegment(seg.type, parsed);
      }
      enteredKeys = newValue;
    } else if (seg.type === "dayPeriod" || seg.type === "era") {
      state.clearSegment(seg.type);
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    // Firefox does not fire selectstart for Ctrl/Cmd + A
    if (e.key === "a" && (isMac() ? e.metaKey : e.ctrlKey)) {
      e.preventDefault();
    }
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
      return;
    }
    switch (e.key) {
      case "Backspace":
      case "Delete":
        // Safari on iOS does not fire beforeinput for the backspace key because the cursor is at the start.
        e.preventDefault();
        e.stopPropagation();
        backspace();
        break;
    }
  };

  const { startsWith } = createFilter({ sensitivity: "base" })();
  const amPmFormatter = createDateFormatter({ hour: "numeric", hour12: true });
  const am = createMemo(() => {
    const date = new Date();
    date.setHours(0);
    return (
      amPmFormatter()
        .formatToParts(date)
        .find((part) => part.type === "dayPeriod")?.value ?? ""
    );
  });
  const pm = createMemo(() => {
    const date = new Date();
    date.setHours(12);
    return (
      amPmFormatter()
        .formatToParts(date)
        .find((part) => part.type === "dayPeriod")?.value ?? ""
    );
  });

  // Get a list of formatted era names so users can type the first character to choose one.
  const eraFormatter = createDateFormatter({ year: "numeric", era: "narrow", timeZone: "UTC" });
  const eras = createMemo(() => {
    if (segment().type !== "era") {
      return [] as Array<{ era: string; formatted: string }>;
    }
    const date = toCalendar(new CalendarDate(1, 1, 1), state.calendar);
    const list = state.calendar.getEras().map((era) => {
      const eraDate = date.set({ year: 1, month: 1, day: 1, era }).toDate("UTC");
      const parts = eraFormatter().formatToParts(eraDate);
      const formatted = parts.find((p) => p.type === "era")?.value ?? "";
      return { era, formatted };
    });
    const prefixLength = commonPrefixLength(list.map((era) => era.formatted));
    if (prefixLength) {
      for (const era of list) {
        era.formatted = era.formatted.slice(prefixLength);
      }
    }
    return list;
  });

  const onInput = (key: string) => {
    const seg = segment();
    if (state.isDisabled() || state.isReadOnly()) {
      return;
    }
    const newValue = enteredKeys + key;
    switch (seg.type) {
      case "dayPeriod":
        if (startsWith(am(), key)) {
          state.setSegment("dayPeriod", 0);
        } else if (startsWith(pm(), key)) {
          state.setSegment("dayPeriod", 1);
        } else {
          break;
        }
        focusManager?.focusNext();
        break;
      case "era": {
        const matched = eras().find((e) => startsWith(e.formatted, key));
        if (matched) {
          state.setSegment("era", matched.era as unknown as number);
          focusManager?.focusNext();
        }
        break;
      }
      case "day":
      case "hour":
      case "minute":
      case "second":
      case "month":
      case "year": {
        if (!parser().isValidPartialNumber(newValue)) {
          return;
        }
        const numberValue = parser().parse(newValue);
        let segmentValue = numberValue;
        if (seg.maxValue !== undefined && numberValue > seg.maxValue) {
          segmentValue = parser().parse(key);
        }
        if (isNaN(numberValue)) {
          return;
        }
        state.setSegment(seg.type, segmentValue);
        if (
          seg.maxValue !== undefined &&
          (Number(numberValue + "0") > seg.maxValue ||
            newValue.length >= String(seg.maxValue).length)
        ) {
          enteredKeys = "";
          focusManager?.focusNext();
        } else {
          enteredKeys = newValue;
        }
        break;
      }
    }
  };

  const onFocus = () => {
    enteredKeys = "";
    const el = ref();
    if (el) {
      scrollIntoViewport(el, { containingElement: getScrollParent(el) });
      // Collapse selection to start or Chrome won't fire input events.
      const selection = window.getSelection();
      selection?.collapse(el);
    }
  };

  // Enforce that the selection is collapsed when inside a date segment. Otherwise, when tapping on a
  // segment in Android Chrome and then entering text, composition events break the DOM structure.
  createEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const handler = () => {
      const selection = window.getSelection();
      if (selection?.anchorNode && nodeContains(ref(), selection.anchorNode)) {
        selection.collapse(ref());
      }
    };
    document.addEventListener("selectionchange", handler);
    onCleanup(() => document.removeEventListener("selectionchange", handler));
  });

  let compositionValue = "";
  createEffect(() => {
    const el = ref();
    if (!el) {
      return;
    }
    const onBeforeInput = (e: InputEvent) => {
      if (!ref()) {
        return;
      }
      e.preventDefault();
      switch (e.inputType) {
        case "deleteContentBackward":
        case "deleteContentForward":
          if (parser().isValidPartialNumber(segment().text) && !state.isReadOnly()) {
            backspace();
          }
          break;
        case "insertCompositionText":
          // insertCompositionText cannot be canceled. Record current state to restore in `input`.
          compositionValue = el.textContent ?? "";
          // Safari gets stuck in a composition state unless we also assign to the value here.
          // eslint-disable-next-line no-self-assign
          el.textContent = el.textContent;
          break;
        default:
          if (e.data != null) {
            onInput(e.data);
          }
          break;
      }
    };
    const onInputEvent = (e: InputEvent) => {
      const { inputType, data } = e;
      switch (inputType) {
        case "insertCompositionText":
          if (ref()) {
            el.textContent = compositionValue;
          }
          if (data != null && (startsWith(am(), data) || startsWith(pm(), data))) {
            onInput(data);
          }
          break;
      }
    };
    el.addEventListener("beforeinput", onBeforeInput as EventListener);
    el.addEventListener("input", onInputEvent as EventListener);
    onCleanup(() => {
      el.removeEventListener("beforeinput", onBeforeInput as EventListener);
      el.removeEventListener("input", onInputEvent as EventListener);
    });
  });

  // If the focused segment is removed, focus the previous one, or the next one if there was no previous one.
  let focusedElement: HTMLElement | null = null;
  createEffect(() => {
    focusedElement = ref();
  });
  onCleanup(() => {
    if (typeof document !== "undefined" && document.activeElement === focusedElement) {
      const prev = focusManager?.focusPrevious();
      if (!prev) {
        focusManager?.focusNext();
      }
    }
  });

  const segmentProps = createMemo<Record<string, unknown>>(() => {
    const seg = segment();
    const p = getProps();

    // spinbuttons cannot be focused with VoiceOver on iOS.
    const touchPropOverrides =
      isIOS() || seg.type === "timeZoneName"
        ? {
            role: "textbox",
            "aria-valuemax": null,
            "aria-valuemin": null,
            "aria-valuetext": null,
            "aria-valuenow": null,
          }
        : {};

    // Only apply aria-describedby to the first segment, unless the field is invalid.
    let ariaDescribedBy = hd?.ariaDescribedBy?.();
    const firstEditable = state.segments().find((s) => s.isEditable);
    if (firstEditable && firstEditable.type !== seg.type && !state.isInvalid()) {
      ariaDescribedBy = undefined;
    }
    // Allow an explicitly passed describedby (e.g. from a datepicker) to compose.
    ariaDescribedBy =
      [p["aria-describedby"], ariaDescribedBy].filter(Boolean).join(" ") || undefined;

    const isEditable = !state.isDisabled() && !state.isReadOnly() && seg.isEditable;
    // Prepend the label passed from the field to each segment name.
    const name = seg.type === "literal" ? "" : displayNames().of(seg.type);
    const ariaLabel = hd?.ariaLabel;
    const ariaLabelledBy = hd?.ariaLabelledBy;
    // Upstream generates a separate id inside useLabels and lets react-aria's
    // mergeProps collapse it with the segment's own id via mergeIds' SSR ref
    // registry. Solid has no such registry, so we thread the segment id straight
    // into createLabels: the self-reference token then IS the element id, which
    // is the exact observable result mergeIds produces ("month, <field label>").
    const labelProps = createLabels({
      id: segmentId,
      "aria-label": `${name}${ariaLabel ? `, ${ariaLabel}` : ""}${ariaLabelledBy ? ", " : ""}`,
      "aria-labelledby": ariaLabelledBy,
    });

    // Literal segments should not be visible to screen readers.
    if (seg.type === "literal") {
      return { "aria-hidden": true };
    }

    // Kebab-case CSS property names: this style object is merged via mergeProps
    // and applied by Solid's runtime `style()` spread helper, which calls
    // `el.style.setProperty(key, value)` with the raw key. setProperty ignores
    // camelCase names (`unicodeBidi`, `caretColor`) but honors real CSS property
    // names, so upstream's React CSSProperties must be written kebab here to
    // actually take effect (React auto-kebabs camelCase; a Solid spread does
    // not). `direction` matched already precisely because it is single-word.
    const segmentStyle: Record<string, string> = { "caret-color": "transparent" };
    if (direction() === "rtl") {
      segmentStyle["unicode-bidi"] = "embed";
      const format = (resolvedOptions as unknown as Record<string, unknown>)[seg.type];
      if (format === "numeric" || format === "2-digit") {
        segmentStyle.direction = "ltr";
      }
    }

    return mergeProps(
      spinButton.spinButtonProps as Record<string, unknown>,
      labelProps as Record<string, unknown>,
      {
        id: segmentId,
        ...touchPropOverrides,
        "aria-invalid": state.isInvalid() ? "true" : undefined,
        "aria-describedby": ariaDescribedBy,
        "aria-readonly": state.isReadOnly() || !seg.isEditable ? "true" : undefined,
        "aria-controls": (p["aria-controls"] as string | undefined) || undefined,
        "data-placeholder": seg.isPlaceholder || undefined,
        contentEditable: isEditable,
        suppressContentEditableWarning: isEditable,
        spellCheck: isEditable ? "false" : undefined,
        autoCorrect: isEditable ? "off" : undefined,
        enterKeyHint: isEditable ? "next" : undefined,
        inputMode:
          state.isDisabled() || seg.type === "dayPeriod" || seg.type === "era" || !isEditable
            ? undefined
            : "numeric",
        tabIndex: state.isDisabled() ? undefined : 0,
        onKeyDown,
        onFocus,
        style: segmentStyle,
        // Prevent pointer events from reaching the group's press handler, and allow native focus.
        onPointerDown(e: PointerEvent) {
          e.stopPropagation();
        },
        onMouseDown(e: MouseEvent) {
          e.stopPropagation();
        },
      },
    );
  });

  return {
    get segmentProps() {
      return segmentProps();
    },
  };
}
