/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/color/useColorArea.ts

/**
 * createColorArea hook.
 *
 * Provides ARIA attributes and keyboard/pointer handling for a 2D color area.
 *
 * Ported from packages/react-aria/src/color/useColorArea.ts.
 */

import { onOwnedCleanup } from "../utils/owner";
import { createMemo, createSignal } from "solid-js";
import type { Accessor } from "solid-js";
import type { Color, ColorAreaState, ColorChannel } from "@proyecto-viviana/solid-stately";
import { parseColor } from "@proyecto-viviana/solid-stately";
import { useLocale } from "../i18n";
import { createId } from "../ssr";
import { focusWithoutScrolling } from "../utils/focus";
import { createColorStringFormatter } from "./intl";
import type { AriaColorAreaOptions, ColorAreaAria } from "./types";

/**
 * Creates ARIA props for a color area.
 */
export function createColorArea(
  props: Accessor<AriaColorAreaOptions>,
  state: Accessor<ColorAreaState>,
  areaRef: Accessor<HTMLDivElement | null>,
  inputXRef?: Accessor<HTMLInputElement | null | undefined>,
  inputYRef?: Accessor<HTMLInputElement | null | undefined>,
): ColorAreaAria {
  const getProps = () => props();
  const getState = () => state();
  const locale = useLocale();
  const stringFormatter = createColorStringFormatter();
  const isRTL = () => locale().direction === "rtl";
  const [focusedInput, setFocusedInput] = createSignal<"x" | "y" | null>(null);
  const [valueChangedViaKeyboard, setValueChangedViaKeyboard] = createSignal(false);
  const [valueChangedViaInputChangeEvent, setValueChangedViaInputChangeEvent] = createSignal(false);

  // Generate IDs
  const colorAreaId = createId();
  const xInputId = createId();
  const yInputId = createId();

  const colorPickerLabel = () => stringFormatter().format("colorPicker");
  const colorInputLabel = () => {
    const ariaLabel = getProps()["aria-label"];
    return ariaLabel
      ? stringFormatter().format("colorInputLabel", {
          label: ariaLabel,
          channelLabel: colorPickerLabel(),
        })
      : colorPickerLabel();
  };
  // Upstream joins the group label with a literal ", " (useColorArea.ts:488),
  // NOT the colorInputLabel message.
  const colorAreaLabel = () => {
    const ariaLabel = getProps()["aria-label"];
    return ariaLabel ? `${ariaLabel}, ${colorPickerLabel()}` : undefined;
  };
  const formatChannelValueText = (channel: ColorChannel) => {
    const value = getState().getDisplayColor();
    const loc = locale().locale;
    return stringFormatter().format("colorNameAndValue", {
      name: value.getChannelName(channel, loc),
      value: value.formatChannelValue(channel, loc),
    });
  };
  const getAriaValueTextForChannel = (channel: ColorChannel) => {
    const s = getState();
    const value = s.getDisplayColor();
    const loc = locale().locale;
    if (valueChangedViaInputChangeEvent() || valueChangedViaKeyboard()) {
      return `${formatChannelValueText(channel)}, ${value.getColorName(loc)}`;
    }

    const otherChannel = channel === s.yChannel ? s.xChannel : s.yChannel;
    return (
      [
        formatChannelValueText(channel),
        formatChannelValueText(otherChannel),
        formatChannelValueText(s.zChannel),
      ].join(", ") + `, ${value.getColorName(loc)}`
    );
  };

  const getXInput = () => {
    const fromRef = inputXRef?.() ?? getProps().inputXRef?.();
    if (fromRef) return fromRef;
    const resolvedId = getProps().id ? `${getProps().id}-x` : xInputId;
    const byId =
      typeof document !== "undefined"
        ? (document.getElementById(resolvedId) as HTMLInputElement | null)
        : null;
    if (byId) return byId;
    const area = areaRef();
    if (!area) return null;
    return (
      area.querySelector<HTMLInputElement>('input[type="range"][aria-orientation="horizontal"]') ??
      area.querySelectorAll<HTMLInputElement>('input[type="range"]')[0] ??
      null
    );
  };

  const getYInput = () => {
    const fromRef = inputYRef?.() ?? getProps().inputYRef?.();
    if (fromRef) return fromRef;
    const resolvedId = getProps().id ? `${getProps().id}-y` : yInputId;
    const byId =
      typeof document !== "undefined"
        ? (document.getElementById(resolvedId) as HTMLInputElement | null)
        : null;
    if (byId) return byId;
    const area = areaRef();
    if (!area) return null;
    return (
      area.querySelector<HTMLInputElement>('input[type="range"][aria-orientation="vertical"]') ??
      area.querySelectorAll<HTMLInputElement>('input[type="range"]')[1] ??
      null
    );
  };

  const focusInput = (axis: "x" | "y" = "x") => {
    const el = axis === "y" ? getYInput() : getXInput();
    if (el) {
      focusWithoutScrolling(el);
      queueMicrotask(() => {
        const current = axis === "y" ? getYInput() : getXInput();
        if (current) {
          focusWithoutScrolling(current);
        }
      });
    }
  };

  const updateFromInput = (e: Event, axis: "x" | "y") => {
    const target = e.target as HTMLInputElement;
    const nextValue = parseFloat(target.value);

    setValueChangedViaInputChangeEvent(true);
    if (axis === "x") {
      getState().setXValue(nextValue);
    } else {
      getState().setYValue(nextValue);
    }
  };

  let startPointerPos = { x: 0, y: 0 };
  let startThumbPos = { x: 0, y: 0 };
  let lastMovePos: { x: number; y: number } | null = null;
  let cleanupDragListeners: (() => void) | undefined;

  const installDragListeners = () => {
    if (typeof window === "undefined") return;
    cleanupDragListeners?.();

    const onPointerMove = (e: PointerEvent) => {
      if (!getState().isDragging) return;
      handleMove(e.clientX, e.clientY);
    };

    const onPointerEnd = (e: PointerEvent) => {
      endDragging(e.currentTarget, e.pointerId);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerEnd);
    window.addEventListener("pointercancel", onPointerEnd);

    cleanupDragListeners = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerEnd);
      window.removeEventListener("pointercancel", onPointerEnd);
    };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (lastMovePos && lastMovePos.x === clientX && lastMovePos.y === clientY) return;
    lastMovePos = { x: clientX, y: clientY };

    const area = areaRef();
    if (!area) return;

    const rect = area.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const deltaX = clientX - startPointerPos.x;
    const deltaY = clientY - startPointerPos.y;

    const normalizedDeltaX = (isRTL() ? -deltaX : deltaX) / rect.width;
    const normalizedDeltaY = deltaY / rect.height;

    const newX = Math.max(0, Math.min(1, startThumbPos.x + normalizedDeltaX));
    const newY = Math.max(0, Math.min(1, startThumbPos.y + normalizedDeltaY));

    getState().setColorFromPoint(newX, newY);
  };

  const endDragging = (target?: EventTarget | null, pointerId?: number) => {
    cleanupDragListeners?.();
    cleanupDragListeners = undefined;
    lastMovePos = null;

    if (getState().isDragging) {
      getState().setDragging(false);
      if (pointerId !== undefined && target && (target as HTMLElement).releasePointerCapture) {
        try {
          (target as HTMLElement).releasePointerCapture(pointerId);
        } catch {}
      }
      focusInput(focusedInput() ?? "x");
    }
  };

  const startDragging = (
    clientX: number,
    clientY: number,
    fromThumb: boolean,
    target?: HTMLElement | null,
    pointerId?: number,
  ) => {
    if (getProps().isDisabled || getState().isDisabled) return;
    if (getState().isDragging) return;

    setValueChangedViaKeyboard(false);
    setValueChangedViaInputChangeEvent(false);

    const s = getState();
    if (fromThumb) {
      startThumbPos = s.getThumbPosition();
    } else {
      const area = areaRef();
      if (!area) return;
      const rect = area.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const physicalX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const x = isRTL() ? 1 - physicalX : physicalX;
      const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

      s.setColorFromPoint(x, y);
      startThumbPos = { x, y };
    }

    startPointerPos = { x: clientX, y: clientY };
    lastMovePos = { x: clientX, y: clientY };
    focusInput(focusedInput() ?? "x");
    s.setDragging(true);

    if (pointerId !== undefined && target?.setPointerCapture) {
      try {
        target.setPointerCapture(pointerId);
      } catch {}
    }

    installDragListeners();
  };

  const onThumbPointerDown = (e: PointerEvent) => {
    if (getProps().isDisabled || getState().isDisabled) return;
    if (e.pointerType === "mouse" && (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey)) return;

    e.stopPropagation();
    e.preventDefault();

    startDragging(e.clientX, e.clientY, true, e.currentTarget as HTMLElement, e.pointerId);
  };

  const onThumbMouseDown = (e: MouseEvent) => {
    if (getProps().isDisabled || getState().isDisabled) return;
    if (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey) return;

    e.stopPropagation();
    e.preventDefault();

    startDragging(e.clientX, e.clientY, true);
  };

  const onAreaPointerDown = (e: PointerEvent) => {
    if (getProps().isDisabled || getState().isDisabled) return;
    if (e.pointerType === "mouse" && (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey)) return;

    e.preventDefault();

    startDragging(e.clientX, e.clientY, false, e.currentTarget as HTMLElement, e.pointerId);
  };

  const onAreaMouseDown = (e: MouseEvent) => {
    if (getProps().isDisabled || getState().isDisabled) return;
    if (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey) return;

    e.preventDefault();

    startDragging(e.clientX, e.clientY, false);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!getState().isDragging) return;
    handleMove(e.clientX, e.clientY);
  };

  const onPointerUp = (e: PointerEvent) => {
    if (getState().isDragging) {
      endDragging(e.currentTarget, e.pointerId);
    }
  };

  onOwnedCleanup(() => {
    cleanupDragListeners?.();
  });

  const onKeyDown = (e: KeyboardEvent) => {
    if (getProps().isDisabled || getState().isDisabled) return;

    const s = getState();
    const xStep =
      e.shiftKey && s.xChannelPageStep > s.xChannelStep ? s.xChannelPageStep : s.xChannelStep;
    const yStep =
      e.shiftKey && s.yChannelPageStep > s.yChannelStep ? s.yChannelPageStep : s.yChannelStep;
    let focusedAxis: "x" | "y" = "x";
    let handled = true;

    switch (e.key) {
      case "ArrowRight":
        if (isRTL()) {
          s.decrementX(xStep);
        } else {
          s.incrementX(xStep);
        }
        focusedAxis = "x";
        break;
      case "ArrowLeft":
        if (isRTL()) {
          s.incrementX(xStep);
        } else {
          s.decrementX(xStep);
        }
        focusedAxis = "x";
        break;
      case "ArrowUp":
        s.incrementY(yStep);
        focusedAxis = "y";
        break;
      case "ArrowDown":
        s.decrementY(yStep);
        focusedAxis = "y";
        break;
      case "PageUp":
        s.incrementY(s.yChannelPageStep);
        focusedAxis = "y";
        break;
      case "PageDown":
        s.decrementY(s.yChannelPageStep);
        focusedAxis = "y";
        break;
      case "Home":
        if (isRTL()) {
          s.incrementX(s.xChannelPageStep);
        } else {
          s.decrementX(s.xChannelPageStep);
        }
        focusedAxis = "x";
        break;
      case "End":
        if (isRTL()) {
          s.decrementX(s.xChannelPageStep);
        } else {
          s.incrementX(s.xChannelPageStep);
        }
        focusedAxis = "x";
        break;
      default:
        handled = false;
    }

    if (handled) {
      setFocusedInput(focusedAxis);
      setValueChangedViaKeyboard(true);
      s.setDragging(true);
      s.setDragging(false);
      focusInput(focusedAxis);
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const onFocusOut = (e: FocusEvent) => {
    const currentTarget = e.currentTarget as HTMLElement;
    const relatedTarget = e.relatedTarget as Node | null;
    if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
      setValueChangedViaKeyboard(false);
      setValueChangedViaInputChangeEvent(false);
    }
  };

  // Color area props
  const colorAreaProps = createMemo(() => {
    const s = getState();
    const p = getProps();

    return {
      id: p.id ?? colorAreaId,
      role: "group" as const,
      "aria-label": colorAreaLabel(),
      "aria-labelledby": p["aria-labelledby"],
      onPointerDown: onAreaPointerDown,
      onPointerMove,
      onPointerUp,
      onMouseDown: onAreaMouseDown,
      style: {
        position: "relative" as const,
        "touch-action": "none",
        "forced-color-adjust": "none" as const,
        ...generateGradient(),
      },
      "data-disabled": s.isDisabled || p.isDisabled || undefined,
    };
  });

  // Generate gradient background for the color area
  function generateGradient(): Record<string, string> {
    const s = getState();
    const value = s.value;
    const xCh = s.xChannel;
    const yCh = s.yChannel;
    const zCh = s.zChannel;
    const zValue = value.getChannelValue(zCh);
    const end = isRTL() ? "left" : "right";

    const hue = (color: Color) =>
      [0, 60, 120, 180, 240, 300, 360]
        .map((h) => color.withChannelValue("hue", h).toString("css"))
        .join(", ");

    const hslChannels: Record<string, (c: Color) => string> = {
      hue,
      saturation: (color) =>
        `${color.withChannelValue("saturation", 0).toString("css")}, transparent`,
      lightness: () => "black, transparent, white",
    };

    const hsbChannels: Record<string, (c: Color) => string> = {
      hue,
      saturation: (color) =>
        `${color.withChannelValue("saturation", 0).toString("css")}, transparent`,
      brightness: () => "black, transparent",
    };

    switch (value.getColorSpace()) {
      case "rgb": {
        const rgb = parseColor("rgb(0, 0, 0)");
        return {
          background: [
            `linear-gradient(to ${end}, ${rgb.withChannelValue(xCh, 0).toString("css")}, ${rgb.withChannelValue(xCh, 255).toString("css")})`,
            `linear-gradient(to top, ${rgb.withChannelValue(yCh, 0).toString("css")}, ${rgb.withChannelValue(yCh, 255).toString("css")})`,
            rgb.withChannelValue(zCh, zValue).toString("css"),
          ].join(","),
          "background-blend-mode": "screen",
        };
      }
      case "hsl": {
        const channels = value.getColorChannels();
        const base = parseColor("hsl(0, 100%, 50%)").withChannelValue(zCh, zValue);
        const bg = channels
          .filter((c: ColorChannel) => c !== zCh)
          .map(
            (c: ColorChannel) =>
              `linear-gradient(to ${c === xCh ? end : "top"}, ${hslChannels[c]?.(base) ?? ""})`,
          )
          .reverse();
        if (zCh === "hue") {
          bg.push(base.toString("css"));
        }

        return {
          background: bg.join(", "),
        };
      }
      case "hsb": {
        const channels = value.getColorChannels();
        const base = parseColor("hsb(0, 100%, 100%)").withChannelValue(zCh, zValue);
        const bg = channels
          .filter((c: ColorChannel) => c !== zCh)
          .map(
            (c: ColorChannel) =>
              `linear-gradient(to ${c === xCh ? end : "top"}, ${hsbChannels[c]?.(base) ?? ""})`,
          )
          .reverse();
        if (zCh === "hue") {
          bg.push(base.toString("css"));
        }

        return {
          background: bg.join(", "),
        };
      }
      default:
        return {};
    }
  }

  // Gradient props (the visual area)
  const gradientProps = createMemo(() => {
    const gradientStyles = generateGradient();
    return {
      role: "presentation" as const,
      style: {
        width: "100%",
        height: "100%",
        "forced-color-adjust": "none" as const,
        ...gradientStyles,
      },
    };
  });

  // Thumb props
  const thumbProps = createMemo(() => {
    const s = getState();
    const p = getProps();
    const pos = s.getThumbPosition();
    const x = isRTL() ? 1 - pos.x : pos.x;

    return {
      role: "presentation" as const,
      style: {
        position: "absolute" as const,
        left: `${x * 100}%`,
        top: `${pos.y * 100}%`,
        transform: "translate(-50%, -50%)",
        "touch-action": "none",
        "forced-color-adjust": "none" as const,
      },
      onPointerDown: onThumbPointerDown,
      onPointerMove,
      onPointerUp,
      onMouseDown: onThumbMouseDown,
      onKeyDown,
      onFocusOut,
      "data-dragging": s.isDragging || undefined,
      "data-disabled": s.isDisabled || p.isDisabled || undefined,
    };
  });

  // X input props (hidden, for accessibility)
  const xInputProps = createMemo(() => {
    const s = getState();
    const p = getProps();
    const xRange = s.value.getChannelRange(s.xChannel);

    return {
      type: "range",
      id: p.id ? `${p.id}-x` : xInputId,
      "aria-label": colorInputLabel(),
      "aria-roledescription": stringFormatter().format("twoDimensionalSlider"),
      "aria-valuetext": getAriaValueTextForChannel(s.xChannel),
      "aria-orientation": "horizontal" as const,
      "aria-describedby": p["aria-describedby"],
      "aria-details": p["aria-details"],
      min: xRange.minValue,
      max: xRange.maxValue,
      step: xRange.step,
      value: s.getXValue(),
      name: p.xName,
      form: p.form,
      disabled: s.isDisabled || p.isDisabled,
      "aria-hidden":
        !focusedInput() || focusedInput() === "x" || valueChangedViaKeyboard()
          ? undefined
          : ("true" as const),
      onFocus: () => setFocusedInput("x"),
      onKeyDown,
      onInput: (e: Event) => updateFromInput(e, "x"),
      onChange: (e: Event) => updateFromInput(e, "x"),
      tabIndex: !focusedInput() || focusedInput() === "x" ? undefined : -1,
      style: {
        position: "absolute" as const,
        width: "1px",
        height: "1px",
        padding: "0",
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        "white-space": "nowrap",
        border: "0",
      },
    };
  });

  // Y input props (hidden, for accessibility)
  const yInputProps = createMemo(() => {
    const s = getState();
    const p = getProps();
    const yRange = s.value.getChannelRange(s.yChannel);

    return {
      type: "range",
      id: p.id ? `${p.id}-y` : yInputId,
      "aria-label": colorInputLabel(),
      "aria-roledescription": stringFormatter().format("twoDimensionalSlider"),
      "aria-valuetext": getAriaValueTextForChannel(s.yChannel),
      "aria-orientation": "vertical" as const,
      "aria-describedby": p["aria-describedby"],
      "aria-details": p["aria-details"],
      min: yRange.minValue,
      max: yRange.maxValue,
      step: yRange.step,
      value: s.getYValue(),
      name: p.yName,
      form: p.form,
      disabled: s.isDisabled || p.isDisabled,
      "aria-hidden":
        focusedInput() === "y" || valueChangedViaKeyboard() ? undefined : ("true" as const),
      onFocus: () => setFocusedInput("y"),
      onKeyDown,
      onInput: (e: Event) => updateFromInput(e, "y"),
      onChange: (e: Event) => updateFromInput(e, "y"),
      tabIndex: focusedInput() === "y" ? undefined : -1,
      style: {
        position: "absolute" as const,
        width: "1px",
        height: "1px",
        padding: "0",
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        "white-space": "nowrap",
        border: "0",
      },
    };
  });

  return {
    get colorAreaProps() {
      return colorAreaProps();
    },
    get gradientProps() {
      return gradientProps();
    },
    get thumbProps() {
      return thumbProps();
    },
    get xInputProps() {
      return xInputProps();
    },
    get yInputProps() {
      return yInputProps();
    },
  };
}
