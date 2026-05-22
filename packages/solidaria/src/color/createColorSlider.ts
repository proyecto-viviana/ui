/**
 * createColorSlider hook.
 *
 * Provides ARIA attributes and keyboard handling for a color slider.
 */

import { createMemo, onCleanup, type Accessor } from "solid-js";
import type { ColorSliderState } from "@proyecto-viviana/solid-stately";
import { useLocale } from "../i18n";
import { createId } from "../ssr";
import { focusWithoutScrolling } from "../utils/focus";
import type { AriaColorSliderOptions, ColorSliderAria } from "./types";

/**
 * Creates ARIA props for a color slider.
 */
export function createColorSlider(
  props: Accessor<AriaColorSliderOptions>,
  state: Accessor<ColorSliderState>,
  trackRef: Accessor<HTMLDivElement | null>,
  inputRef?: Accessor<HTMLInputElement | null>,
): ColorSliderAria {
  const getProps = () => props();
  const getState = () => state();
  const locale = useLocale();
  const isRTL = () => locale().direction === "rtl";

  // Generate IDs
  const trackId = createId();
  const inputId = createId();
  const labelId = createId();
  let cleanupPointerDrag: (() => void) | undefined;
  let cleanupMouseDrag: (() => void) | undefined;

  const getInput = () =>
    inputRef?.() ?? trackRef()?.querySelector<HTMLInputElement>('input[type="range"]') ?? null;
  const focusInput = () => {
    focusWithoutScrolling(getInput());
    queueMicrotask(() => focusWithoutScrolling(getInput()));
  };

  // Get channel name for ARIA label
  const channelName = createMemo(() => {
    const p = getProps();
    if (p.channelName) return p.channelName;
    const s = getState();
    return s.value.getChannelName(s.channel, "en-US");
  });

  const orientation = () => getProps().orientation ?? "horizontal";
  const hasVisibleLabel = () => getProps().label != null;
  const trackElementId = () => getProps().id ?? trackId;
  const trackLabelledBy = () => {
    const p = getProps();
    return p["aria-labelledby"] ?? (hasVisibleLabel() ? labelId : undefined);
  };
  const inputLabelledBy = () => (hasVisibleLabel() ? labelId : trackElementId());
  const trackAriaLabel = () => {
    const p = getProps();
    if (p["aria-label"]) return p["aria-label"];
    if (p["aria-labelledby"] || hasVisibleLabel()) return undefined;
    return channelName();
  };

  const updateFromPointer = (clientX: number, clientY: number) => {
    if (getProps().isDisabled || getState().isDisabled) return;

    const track = trackRef();
    if (!track) return;

    const rect = track.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    let percent: number;
    if (orientation() === "vertical") {
      percent = 1 - (clientY - rect.top) / rect.height;
    } else {
      const physicalPercent = (clientX - rect.left) / rect.width;
      percent = isRTL() ? 1 - physicalPercent : physicalPercent;
    }

    getState().setThumbPercent(Math.max(0, Math.min(1, percent)));
  };

  const endDrag = (target: EventTarget | null, pointerId?: number) => {
    const s = getState();
    if (!s.isDragging) return;
    s.setDragging(false);
    focusInput();
    if (pointerId == null) return;
    try {
      (target as HTMLElement | null)?.releasePointerCapture?.(pointerId);
    } catch {
      // Some synthetic pointer sequences do not have active capture by the time
      // drag end runs. React Aria treats capture as best-effort as well.
    }
  };

  const installPointerDragListeners = () => {
    if (typeof window === "undefined") return;
    cleanupPointerDrag?.();

    const onPointerMove = (e: PointerEvent) => {
      if (!getState().isDragging) return;
      updateFromPointer(e.clientX, e.clientY);
    };
    const onPointerEnd = (e: PointerEvent) => {
      cleanupPointerDrag?.();
      cleanupPointerDrag = undefined;
      endDrag(trackRef(), e.pointerId);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerEnd);
    window.addEventListener("pointercancel", onPointerEnd);

    cleanupPointerDrag = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerEnd);
      window.removeEventListener("pointercancel", onPointerEnd);
    };
  };

  const installMouseDragListeners = () => {
    if (typeof window === "undefined") return;
    cleanupMouseDrag?.();

    const onMouseMove = (e: MouseEvent) => {
      if (!getState().isDragging) return;
      updateFromPointer(e.clientX, e.clientY);
    };
    const onMouseEnd = () => {
      cleanupMouseDrag?.();
      cleanupMouseDrag = undefined;
      endDrag(trackRef());
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseEnd);

    cleanupMouseDrag = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseEnd);
    };
  };

  onCleanup(() => {
    cleanupPointerDrag?.();
    cleanupMouseDrag?.();
  });

  // Handle pointer interaction on the track
  const onTrackPointerDown = (e: PointerEvent) => {
    if (getProps().isDisabled || getState().isDisabled) return;
    updateFromPointer(e.clientX, e.clientY);
    focusInput();
    getState().setDragging(true);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      // Keep drag behavior working in environments where pointer capture is not
      // active for this event, including Playwright's synthetic mouse pointer.
    }
    installPointerDragListeners();
    e.preventDefault();
  };

  const onTrackPointerMove = (e: PointerEvent) => {
    if (!getState().isDragging) return;
    updateFromPointer(e.clientX, e.clientY);
  };

  const onTrackPointerUp = (e: PointerEvent) => {
    cleanupPointerDrag?.();
    cleanupPointerDrag = undefined;
    endDrag(e.currentTarget, e.pointerId);
  };

  const onTrackPointerCancel = (e: PointerEvent) => {
    cleanupPointerDrag?.();
    cleanupPointerDrag = undefined;
    endDrag(e.currentTarget, e.pointerId);
  };

  const onTrackMouseDown = (e: MouseEvent) => {
    if (getProps().isDisabled || getState().isDisabled) return;
    updateFromPointer(e.clientX, e.clientY);
    getState().setDragging(true);
    installMouseDragListeners();
    e.preventDefault();
  };

  const onTrackMouseMove = (e: MouseEvent) => {
    if (!getState().isDragging) return;
    updateFromPointer(e.clientX, e.clientY);
  };

  const onTrackMouseUp = (e: MouseEvent) => {
    cleanupMouseDrag?.();
    cleanupMouseDrag = undefined;
    endDrag(e.currentTarget);
  };

  // Handle keyboard
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.defaultPrevented) return;
    if (getProps().isDisabled || getState().isDisabled) return;

    const s = getState();
    let handled = true;

    switch (e.key) {
      case "ArrowUp":
        s.incrementThumb();
        break;
      case "ArrowDown":
        s.decrementThumb();
        break;
      case "ArrowRight":
        if (orientation() === "horizontal" && isRTL()) {
          s.decrementThumb();
        } else {
          s.incrementThumb();
        }
        break;
      case "ArrowLeft":
        if (orientation() === "horizontal" && isRTL()) {
          s.incrementThumb();
        } else {
          s.decrementThumb();
        }
        break;
      case "PageUp":
        s.incrementThumb(s.pageSize);
        break;
      case "PageDown":
        s.decrementThumb(s.pageSize);
        break;
      case "Home":
        s.setThumbValue(s.minValue);
        break;
      case "End":
        s.setThumbValue(s.maxValue);
        break;
      default:
        handled = false;
    }

    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Generate gradient background for the slider track
  const generateBackground = () => {
    const s = getState();
    const value = s.getDisplayColor();
    const channel = s.channel;
    const to = orientation() === "vertical" ? "top" : isRTL() ? "left" : "right";

    switch (channel) {
      case "hue": {
        const stops = [0, 60, 120, 180, 240, 300, 360]
          .map((hue) => value.withChannelValue("hue", hue).toString("css"))
          .join(", ");
        return `linear-gradient(to ${to}, ${stops})`;
      }
      case "lightness": {
        const min = s.minValue;
        const max = s.maxValue;
        const start = value.withChannelValue(channel, min).toString("css");
        const middle = value.withChannelValue(channel, (max - min) / 2).toString("css");
        const end = value.withChannelValue(channel, max).toString("css");
        return `linear-gradient(to ${to}, ${start}, ${middle}, ${end})`;
      }
      case "saturation":
      case "brightness":
      case "red":
      case "green":
      case "blue":
      case "alpha": {
        const start = value.withChannelValue(channel, s.minValue).toString("css");
        const end = value.withChannelValue(channel, s.maxValue).toString("css");
        return `linear-gradient(to ${to}, ${start}, ${end})`;
      }
      default:
        return undefined;
    }
  };

  // Track props
  const trackProps = createMemo(() => {
    const s = getState();
    const p = getProps();
    const bg = generateBackground();
    return {
      id: trackElementId(),
      role: "group" as const,
      "aria-label": trackAriaLabel(),
      "aria-labelledby": trackLabelledBy(),
      onPointerDown: onTrackPointerDown,
      onPointerMove: onTrackPointerMove,
      onPointerUp: onTrackPointerUp,
      onPointerCancel: onTrackPointerCancel,
      onMouseDown: onTrackMouseDown,
      onMouseMove: onTrackMouseMove,
      onMouseUp: onTrackMouseUp,
      style: {
        position: "relative" as const,
        "touch-action": "none",
        "forced-color-adjust": "none" as const,
        ...(bg ? { background: bg } : {}),
      },
      "data-disabled": s.isDisabled || undefined,
    };
  });

  // Thumb props
  const thumbProps = createMemo(() => {
    const s = getState();
    const p = getProps();
    const percent = s.getThumbPercent();
    const x = orientation() === "horizontal" ? (isRTL() ? 1 - percent : percent) : 0.5;
    const y = orientation() === "horizontal" ? 0.5 : 1 - percent;

    return {
      role: "presentation" as const,
      onKeyDown,
      style: {
        position: "absolute" as const,
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        transform: "translate(-50%, -50%)",
        "touch-action": "none",
        "forced-color-adjust": "none" as const,
      },
      "data-dragging": s.isDragging || undefined,
      "data-disabled": s.isDisabled || p.isDisabled || undefined,
    };
  });

  const ariaValueText = () => {
    const s = getState();
    const loc = locale().locale;
    const displayColor = s.getDisplayColor();
    let valueText = s.getThumbValueLabel();

    if (s.channel === "hue") {
      valueText += `, ${displayColor.getHueName(loc)}`;
    } else if (s.channel !== "alpha") {
      valueText += `, ${displayColor.getColorName(loc)}`;
    }

    return valueText;
  };

  // Input props (hidden, for accessibility)
  const inputProps = createMemo(() => {
    const s = getState();
    const p = getProps();

    return {
      type: "range",
      id: inputId,
      min: s.minValue,
      max: s.maxValue,
      step: s.step,
      value: s.getThumbValue(),
      name: p.name,
      form: p.form,
      disabled: s.isDisabled || p.isDisabled,
      tabIndex: s.isDisabled || p.isDisabled ? undefined : 0,
      "aria-orientation": orientation(),
      "aria-labelledby": inputLabelledBy(),
      "aria-describedby": p["aria-describedby"] ?? "",
      "aria-details": p["aria-details"] ?? "",
      "aria-valuetext": ariaValueText(),
      onKeyDown,
      onInput: (e: Event) => {
        const target = e.target as HTMLInputElement;
        s.setThumbValue(parseFloat(target.value));
      },
      onChange: (e: Event) => {
        const target = e.target as HTMLInputElement;
        s.setThumbValue(parseFloat(target.value));
      },
      onFocus: () => {
        // Focus handling
      },
      style: {
        position: "absolute" as const,
        opacity: "0.0001",
        width: "100%",
        height: "100%",
        padding: "0",
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        "white-space": "nowrap",
        border: "0",
        "pointer-events": "none" as const,
      },
    };
  });

  // Output props
  const outputProps = createMemo(() => {
    return {
      "aria-live": "off" as const,
      for: inputId,
    };
  });

  // Label props
  const labelProps = createMemo(() => {
    return {
      id: labelId,
      onClick: () => {
        if (typeof document !== "undefined") {
          document.getElementById(inputId)?.focus();
        }
      },
    };
  });

  return {
    get trackProps() {
      return trackProps();
    },
    get thumbProps() {
      return thumbProps();
    },
    get inputProps() {
      return inputProps();
    },
    get outputProps() {
      return outputProps();
    },
    get labelProps() {
      return labelProps();
    },
  };
}
