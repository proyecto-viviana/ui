/**
 * createColorWheel hook.
 *
 * Provides ARIA attributes and keyboard/pointer handling for a circular hue selector.
 */

import { createMemo, onCleanup, type Accessor } from "solid-js";
import type { ColorWheelState } from "@proyecto-viviana/solid-stately";
import { useLocale } from "../i18n";
import { createId } from "../ssr";
import { focusWithoutScrolling } from "../utils/focus";
import type { AriaColorWheelOptions, ColorWheelAria } from "./types";

/**
 * Creates ARIA props for a color wheel.
 */
export function createColorWheel(
  props: Accessor<AriaColorWheelOptions>,
  state: Accessor<ColorWheelState>,
  wheelRef: Accessor<HTMLDivElement | null>,
): ColorWheelAria {
  const getProps = () => props();
  const getState = () => state();
  const locale = useLocale();

  // Generate IDs
  const inputId = createId();
  let cleanupPointerDrag: (() => void) | undefined;
  let cleanupMouseDrag: (() => void) | undefined;
  let dragElement: HTMLElement | null = null;

  const outerRadius = () => getProps().outerRadius ?? 100;
  const innerRadius = () => getProps().innerRadius ?? 74;
  const thumbRadius = () => (innerRadius() + outerRadius()) / 2;

  const getInput = () => wheelRef()?.querySelector<HTMLInputElement>('input[type="range"]') ?? null;
  const focusInput = () => {
    focusWithoutScrolling(getInput());
    queueMicrotask(() => focusWithoutScrolling(getInput()));
  };

  const getPointFromEvent = (clientX: number, clientY: number, element?: HTMLElement | null) => {
    const wheel = element ?? dragElement ?? wheelRef();
    if (!wheel) return null;

    const rect = wheel.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    return {
      x: clientX - centerX,
      y: clientY - centerY,
    };
  };

  const updateFromPoint = (
    clientX: number,
    clientY: number,
    requireTrackHit = false,
    element?: HTMLElement | null,
  ) => {
    if (getProps().isDisabled || getState().isDisabled) return false;

    const point = getPointFromEvent(clientX, clientY, element);
    if (!point) return false;

    const distance = Math.sqrt(point.x ** 2 + point.y ** 2);
    if (requireTrackHit && (distance <= innerRadius() || distance >= outerRadius())) {
      return false;
    }

    getState().setHueFromPoint(point.x, point.y, thumbRadius());
    return true;
  };

  const endDrag = () => {
    if (!getState().isDragging) return;
    getState().setDragging(false);
    dragElement = null;
    focusInput();
  };

  const installPointerDragListeners = () => {
    if (typeof window === "undefined") return;
    cleanupPointerDrag?.();

    const onPointerMove = (e: PointerEvent) => {
      if (!getState().isDragging) return;
      updateFromPoint(e.clientX, e.clientY);
    };
    const onPointerEnd = () => {
      cleanupPointerDrag?.();
      cleanupPointerDrag = undefined;
      endDrag();
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
      updateFromPoint(e.clientX, e.clientY);
    };
    const onMouseEnd = () => {
      cleanupMouseDrag?.();
      cleanupMouseDrag = undefined;
      endDrag();
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

  const onTrackPointerDown = (e: PointerEvent) => {
    dragElement = e.currentTarget as HTMLElement;
    if (!updateFromPoint(e.clientX, e.clientY, true, dragElement)) {
      dragElement = null;
      return;
    }
    focusInput();
    getState().setDragging(true);
    installPointerDragListeners();
    e.preventDefault();
  };

  const onTrackMouseDown = (e: MouseEvent) => {
    dragElement = e.currentTarget as HTMLElement;
    if (!updateFromPoint(e.clientX, e.clientY, true, dragElement)) {
      dragElement = null;
      return;
    }
    focusInput();
    getState().setDragging(true);
    installMouseDragListeners();
    e.preventDefault();
  };

  const onThumbPointerDown = (e: PointerEvent) => {
    if (getProps().isDisabled || getState().isDisabled) return;
    focusInput();
    getState().setDragging(true);
    installPointerDragListeners();
    e.preventDefault();
    e.stopPropagation();
  };

  const onThumbMouseDown = (e: MouseEvent) => {
    if (getProps().isDisabled || getState().isDisabled) return;
    focusInput();
    getState().setDragging(true);
    installMouseDragListeners();
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle keyboard
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.defaultPrevented) return;
    if (getProps().isDisabled || getState().isDisabled) return;

    const s = getState();
    let handled = true;

    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        s.increment();
        break;
      case "ArrowLeft":
      case "ArrowDown":
        s.decrement();
        break;
      case "PageUp":
        s.increment(s.pageStep);
        break;
      case "PageDown":
        s.decrement(s.pageStep);
        break;
      case "Home":
        s.setHue(0);
        break;
      case "End":
        s.setHue(359);
        break;
      default:
        handled = false;
    }

    if (handled) {
      s.setDragging(true);
      s.setDragging(false);
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Hue spectrum conic gradient
  const conicGradient = `conic-gradient(from 90deg, hsl(0, 100%, 50%), hsl(30, 100%, 50%), hsl(60, 100%, 50%), hsl(90, 100%, 50%), hsl(120, 100%, 50%), hsl(150, 100%, 50%), hsl(180, 100%, 50%), hsl(210, 100%, 50%), hsl(240, 100%, 50%), hsl(270, 100%, 50%), hsl(300, 100%, 50%), hsl(330, 100%, 50%), hsl(360, 100%, 50%))`;

  const ringPath = () => {
    const outer = outerRadius();
    const inner = innerRadius();
    const circlePath = (radius: number) =>
      [
        `M ${outer}, ${outer} m ${-radius}, 0`,
        `a ${radius}, ${radius}, 0, 1, 0, ${radius * 2}, 0`,
        `a ${radius}, ${radius}, 0, 1, 0 ${-radius * 2}, 0`,
      ].join(" ");
    return `path(evenodd, "${circlePath(outer)} ${circlePath(inner)}")`;
  };

  // Track props (the wheel container)
  const trackProps = createMemo(() => {
    const s = getState();
    const p = getProps();

    return {
      onPointerDown: onTrackPointerDown,
      onMouseDown: onTrackMouseDown,
      style: {
        position: "relative" as const,
        "touch-action": "none",
        width: `${outerRadius() * 2}px`,
        height: `${outerRadius() * 2}px`,
        background: conicGradient,
        "clip-path": ringPath(),
        "forced-color-adjust": "none" as const,
      },
      "data-disabled": s.isDisabled || p.isDisabled || undefined,
    };
  });

  // Thumb props
  const thumbProps = createMemo(() => {
    const s = getState();
    const p = getProps();
    const position = s.getThumbPosition(thumbRadius());

    return {
      onPointerDown: onThumbPointerDown,
      onMouseDown: onThumbMouseDown,
      onKeyDown,
      style: {
        position: "absolute" as const,
        left: `${outerRadius() + position.x}px`,
        top: `${outerRadius() + position.y}px`,
        transform: "translate(-50%, -50%)",
        "touch-action": "none",
        "forced-color-adjust": "none" as const,
      },
      "data-dragging": s.isDragging || undefined,
      "data-disabled": s.isDisabled || p.isDisabled || undefined,
    };
  });

  // Input props (hidden, for accessibility)
  const inputProps = createMemo(() => {
    const s = getState();
    const p = getProps();

    return {
      type: "range",
      id: p.id ?? inputId,
      min: 0,
      max: 360,
      step: s.step,
      value: s.getHue(),
      name: p.name,
      form: p.form,
      disabled: s.isDisabled || p.isDisabled,
      tabIndex: s.isDisabled || p.isDisabled ? undefined : 0,
      "aria-label":
        p["aria-label"] ??
        (p["aria-labelledby"] ? undefined : s.value.getChannelName("hue", locale().locale)),
      "aria-labelledby": p["aria-labelledby"],
      "aria-describedby": p["aria-describedby"],
      "aria-details": p["aria-details"],
      "aria-errormessage": p["aria-errormessage"],
      "aria-valuetext": `${s.value.formatChannelValue("hue", locale().locale)}, ${s.value.getHueName(locale().locale)}`,
      onKeyDown,
      onInput: (e: Event) => {
        const target = e.target as HTMLInputElement;
        s.setHue(parseFloat(target.value));
      },
      onChange: (e: Event) => {
        const target = e.target as HTMLInputElement;
        s.setHue(parseFloat(target.value));
      },
      onBlur: () => {
        if (s.isDragging) {
          s.setDragging(false);
        }
      },
      style: {
        position: "absolute" as const,
        width: "100%",
        height: "100%",
        opacity: "0.0001",
        padding: "0",
        margin: "0",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        "white-space": "nowrap",
        border: "0",
        "pointer-events": "none" as const,
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
  };
}
