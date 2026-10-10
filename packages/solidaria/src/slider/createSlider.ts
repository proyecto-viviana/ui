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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/slider/useSlider.ts

/**
 * Provides the behavior and accessibility implementation for a slider component.
 * A slider allows users to select a value from a range.
 * Based on @react-aria/slider useSlider.
 */

import {
  createSignal,
  createMemo,
  createEffect,
  getObserver,
  getOwner,
  runWithOwner,
  onCleanup,
  onSettled,
} from "solid-js";
import { isServer, type JSX } from "@solidjs/web";
import { createLabel } from "../label/createLabel";
import { focusWithoutScrolling } from "../utils/focus";
import { setInteractionModality } from "../interactions/createInteractionModality";
import { createId } from "../ssr";
import { useLocale } from "../i18n";
import { access, type MaybeAccessor } from "../utils/reactivity";
import type { SliderState, SliderOrientation } from "@proyecto-viviana/solid-stately";

export interface AriaSliderProps {
  /** An ID for the slider. */
  id?: string;
  /** Whether the slider is disabled. */
  isDisabled?: boolean;
  /** The label for the slider. */
  label?: JSX.Element;
  /** An accessible label for the slider when no visible label is provided. */
  "aria-label"?: string;
  /** The ID of an element that labels the slider. */
  "aria-labelledby"?: string;
  /** The ID of an element that describes the slider. */
  "aria-describedby"?: string;
  /** The ID of an element that provides details for the slider. */
  "aria-details"?: string;
  /** The orientation of the slider. */
  orientation?: SliderOrientation;
  /** The name for the form input. */
  name?: string;
  /** The form element this input belongs to. */
  form?: string;
}

export interface SliderAria {
  /** Props for the label element. */
  labelProps: Omit<JSX.HTMLAttributes<HTMLElement>, "ref">;
  /** Props for the root group element. */
  groupProps: Omit<JSX.HTMLAttributes<HTMLElement>, "ref"> & {
    "data-disabled"?: boolean;
    "data-orientation"?: SliderOrientation;
  };
  /** Props for the track element. */
  trackProps: Omit<JSX.HTMLAttributes<HTMLElement>, "ref"> & {
    "data-disabled"?: boolean;
    "data-orientation"?: SliderOrientation;
    "data-dragging"?: boolean;
  };
  /** Props for the thumb element. */
  thumbProps: Omit<JSX.HTMLAttributes<HTMLElement>, "ref">;
  /** Props for the hidden input element. */
  inputProps: JSX.InputHTMLAttributes<HTMLInputElement>;
  /** Props for the output element (showing current value). */
  outputProps: Omit<JSX.HTMLAttributes<HTMLElement>, "ref"> &
    Pick<JSX.OutputHTMLAttributes<HTMLOutputElement>, "for">;
}

// Package-local shared owner; deliberately absent from public barrels.
const owners = new WeakMap<SliderState, ReturnType<typeof makeOwner>>();
export function getSliderOwner(state: SliderState) {
  const owner = owners.get(state);
  if (!owner) throw new Error("createSliderThumb requires createSlider for the same state");
  return owner;
}

function makeOwner(
  props: MaybeAccessor<AriaSliderProps>,
  state: SliderState,
  trackRef?: () => HTMLElement | null,
) {
  const getProps = () => access(props);
  const id = createId(getProps().id);
  const locale = useLocale();
  const rootLabel = createLabel(() => ({ ...getProps(), id, labelElementType: "span" }));
  const [revision, setRevision] = createSignal(0, { ownedWrite: true });
  const thumbs = new Set<{
    props: () => Pick<
      AriaSliderProps,
      | "id"
      | "isDisabled"
      | "aria-label"
      | "aria-labelledby"
      | "aria-describedby"
      | "aria-details"
      | "name"
      | "form"
    > & { index?: number };
    input: () => HTMLInputElement | null;
    index: () => number;
    binding?: Pick<SliderAria, "thumbProps" | "inputProps" | "labelProps">;
  }>();
  // Derive one coherent registry view from live indices. A two-thumb index swap
  // must not temporarily overwrite another registration in a mutable keyed map.
  const indexedThumbs = () => {
    if (getObserver()) revision();
    return new Map([...thumbs].map((thumb) => [thumb.index(), thumb]));
  };
  const inputId = (index: number) =>
    indexedThumbs().get(index)?.props().id ?? `${id}-input-${index}`;
  const disabled = (index: number) =>
    state.isDisabled || !!indexedThumbs().get(index)?.props().isDisabled;
  const [dragIndex, setDragIndex] = createSignal<number | undefined>(undefined, {
    ownedWrite: true,
  });
  let drag:
    | { index: number; pointer: number; origin: number; percent: number; capture: HTMLElement }
    | undefined;
  const position = (event: PointerEvent) => {
    const rect = trackRef?.()?.getBoundingClientRect();
    if (!rect) return 0;
    if (state.orientation === "vertical")
      return rect.height ? (rect.bottom - event.clientY) / rect.height : 0;
    const value = rect.width ? (event.clientX - rect.left) / rect.width : 0;
    return locale().direction === "rtl" ? 1 - value : value;
  };
  const focus = (index: number) =>
    focusWithoutScrolling(indexedThumbs().get(index)?.input() ?? null);
  const finish = () => {
    if (!drag) return;
    const previous = drag;
    drag = undefined;
    setDragIndex(undefined);
    try {
      previous.capture.releasePointerCapture(previous.pointer);
    } catch {
      /* capture may already be lost */
    }
    state.setThumbDragging(previous.index, false);
  };
  const begin = (event: PointerEvent, index: number, jump: boolean) => {
    if (
      disabled(index) ||
      event.button !== 0 ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      drag
    )
      return;
    const capture = trackRef?.();
    if (!capture) return;
    event.preventDefault();
    event.stopPropagation();
    state.setThumbDragging(index, true);
    if (jump) state.setThumbPercent(index, Math.max(0, Math.min(1, position(event))));
    drag = {
      index,
      pointer: event.pointerId,
      origin: position(event),
      percent: jump ? Math.max(0, Math.min(1, position(event))) : state.getThumbPercent(index),
      capture,
    };
    setDragIndex(index);
    try {
      capture.setPointerCapture(event.pointerId);
    } catch {
      /* global listeners retain ownership */
    }
    focus(index);
  };
  createEffect(
    () => {
      const index = dragIndex();
      return index !== undefined && disabled(index);
    },
    (shouldFinish) => {
      if (shouldFinish) finish();
    },
  );
  const trackDown = (event: PointerEvent) => {
    if (state.isDisabled || event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey)
      return;
    const values = state.values();
    const raw =
      state.minValue +
      Math.max(0, Math.min(1, position(event))) * (state.maxValue - state.minValue);
    const value = Math.max(
      state.minValue,
      Math.min(
        state.maxValue,
        state.minValue + Math.round((raw - state.minValue) / state.step) * state.step,
      ),
    );
    const split = values.findIndex((v) => v > value);
    const index =
      split === 0
        ? 0
        : split === -1
          ? values.length - 1
          : value - values[split - 1] < values[split] - value
            ? split - 1
            : split;
    // Upstream chooses nearest/tie/end first, then rejects disabled selection.
    begin(event, index, true);
  };
  const move = (event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.pointer) return;
    if (disabled(drag.index)) {
      finish();
      return;
    }
    state.setThumbPercent(
      drag.index,
      Math.max(0, Math.min(1, drag.percent + position(event) - drag.origin)),
    );
  };
  const up = (event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.pointer) return;
    const index = drag.index;
    finish();
    focus(index);
  };
  onSettled(() => {
    const document = trackRef?.()?.ownerDocument;
    if (!document) return;
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
    document.addEventListener("pointercancel", up);
    return () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      document.removeEventListener("pointercancel", up);
      finish();
    };
  });
  onCleanup(() => {
    finish();
    owners.delete(state);
  });
  const resetEvents = new WeakSet<Event>();
  let disposed = false;
  onCleanup(() => {
    disposed = true;
  });
  const resetForm = (event: Event) => {
    if (event.defaultPrevented || resetEvents.has(event)) return;
    resetEvents.add(event);
    // Shadow-root dispatch clears event.target afterward; retain the reset owner.
    const resetOwner = event.target;
    // Finish dispatch before deciding: a later target/bubble listener can prevent reset.
    // Native defaultValue mirrors rendered state, so the default action cannot adopt
    // an unechoed proposal. Apply the state reset after that action, without a drag.
    queueMicrotask(() => {
      if (disposed || event.defaultPrevented) return;
      const rendered = [...state.values()];
      const defaults = [...state.defaultValues()];
      const indices = [...indexedThumbs()]
        .filter(([index, thumb]) => {
          const element = thumb.input();
          return (
            element?.form === resetOwner &&
            !element.disabled &&
            !disabled(index) &&
            index < rendered.length &&
            index < defaults.length
          );
        })
        .map(([index]) => index)
        .sort((a, b) => a - b);
      // Ordered targets move safely against pending neighbors for any fixed count.
      const decreasing = indices.filter((index) => defaults[index] <= rendered[index]);
      const increasing = indices.filter((index) => defaults[index] > rendered[index]).reverse();
      for (const index of [...decreasing, ...increasing])
        state.setThumbValue(index, defaults[index]);
      // Solid may defer JSX application until settle. Keep the native default action
      // and actual successful controls coherent with the final rendered state now.
      for (const [index, thumb] of indexedThumbs()) {
        const element = thumb.input();
        if (!element || element.form !== resetOwner) continue;
        element.min = String(state.getThumbMinValue(index));
        element.max = String(state.getThumbMaxValue(index));
        element.step = String(state.step);
        element.defaultValue = String(state.getThumbValue(index));
        element.value = String(state.getThumbValue(index));
      }
    });
  };
  const join = (...values: (string | undefined)[]) =>
    [...new Set(values.filter(Boolean))].join(" ") || undefined;
  const bind = (
    props: () => Pick<
      AriaSliderProps,
      | "id"
      | "isDisabled"
      | "aria-label"
      | "aria-labelledby"
      | "aria-describedby"
      | "aria-details"
      | "name"
      | "form"
    > & { index?: number },
    input: () => HTMLInputElement | null,
  ): Pick<SliderAria, "thumbProps" | "inputProps" | "labelProps"> => {
    const index = createMemo(() => props().index ?? 0);
    const registration = {
      props,
      input,
      index,
      binding: undefined as
        | Pick<SliderAria, "thumbProps" | "inputProps" | "labelProps">
        | undefined,
    };
    let registeredIndex = props().index ?? 0;
    let hasNativeFocus = false;
    const label = createLabel(() => {
      const thumb = props();
      const root = rootLabel.fieldProps;
      const labelledBy = root["aria-labelledby"];
      return {
        ...thumb,
        id: inputId(index()),
        "aria-labelledby": join(labelledBy, thumb["aria-labelledby"]),
        "aria-label": join(thumb["aria-label"], labelledBy ? undefined : root["aria-label"]),
      };
    });
    const keyboard = (event: KeyboardEvent) => {
      const currentIndex = index();
      if (disabled(currentIndex) || event.altKey || event.ctrlKey || event.metaKey) return;
      const rtl = state.orientation === "horizontal" && locale().direction === "rtl";
      const amount = event.shiftKey ? state.pageStep : state.step;
      let update: (() => void) | undefined;
      switch (event.key) {
        case "ArrowRight":
          update = () =>
            rtl
              ? state.decrementThumb(currentIndex, amount)
              : state.incrementThumb(currentIndex, amount);
          break;
        case "ArrowLeft":
          update = () =>
            rtl
              ? state.incrementThumb(currentIndex, amount)
              : state.decrementThumb(currentIndex, amount);
          break;
        case "ArrowUp":
          update = () => state.incrementThumb(currentIndex, amount);
          break;
        case "ArrowDown":
          update = () => state.decrementThumb(currentIndex, amount);
          break;
        case "PageUp":
          update = () => state.incrementThumb(currentIndex, state.pageStep);
          break;
        case "PageDown":
          update = () => state.decrementThumb(currentIndex, state.pageStep);
          break;
        case "Home":
          update = () => state.setThumbValue(currentIndex, state.getThumbMinValue(currentIndex));
          break;
        case "End":
          update = () => state.setThumbValue(currentIndex, state.getThumbMaxValue(currentIndex));
          break;
      }
      if (!update) return;
      event.preventDefault();
      state.setThumbDragging(currentIndex, true);
      try {
        update();
      } finally {
        state.setThumbDragging(currentIndex, false);
      }
    };
    // Track focus requests and the native element, not index changes: a live
    // index swap must migrate the focused registration before another thumb
    // can interpret its former index as a new focus request.
    createEffect(
      () => ({ focused: state.focusedThumb(), element: input() }),
      ({ focused, element }) => {
        if (focused === index()) focusWithoutScrolling(element);
      },
    );
    let inputValue: string | undefined;
    const nativeInput = (event: Event) => {
      if (disabled(index())) return;
      const value = (event.currentTarget as HTMLInputElement).value;
      inputValue = value;
      state.setThumbValue(index(), Number(value));
      // Withheld controlled echoes must not leave a native DOM-only value behind.
      (event.currentTarget as HTMLInputElement).value = String(state.getThumbValue(index()));
    };
    const nativeChange = (event: Event) => {
      if (inputValue === undefined) nativeInput(event);
      inputValue = undefined;
    };
    createEffect(
      () => ({ element: input(), form: props().form ?? getProps().form }),
      ({ element }) => {
        if (!element) return;
        let form: HTMLFormElement | null = null;
        let root: Node | undefined;
        let stopped = false;
        const document = element.ownerDocument;
        const Observer = document.defaultView?.MutationObserver;
        const reset = (event: Event) => {
          // Also recheck live association: a synchronous form/id mutation can
          // precede MutationObserver delivery. Root capture is only a fallback;
          // the actual form owns the noncomposed reset listener.
          syncAssociation();
          if (element.form && event.target === element.form) resetForm(event);
        };
        const observer = Observer ? new Observer(() => syncAssociation()) : undefined;
        const syncAssociation = () => {
          if (stopped) return;
          const nextForm = element.form;
          if (nextForm !== form) {
            form?.removeEventListener("reset", reset);
            form = nextForm;
            form?.addEventListener("reset", reset);
          }
          const nextRoot = element.getRootNode();
          if (nextRoot !== root) {
            root?.removeEventListener("reset", reset, true);
            root = nextRoot;
            root.addEventListener("reset", reset, true);
            observer?.disconnect();
            observer?.observe(document, {
              subtree: true,
              childList: true,
              attributes: true,
              attributeFilter: ["form", "id"],
            });
            if (root !== document)
              observer?.observe(root, {
                subtree: true,
                childList: true,
                attributes: true,
                attributeFilter: ["form", "id"],
              });
          }
        };
        syncAssociation();
        // Initial ref/effect setup can precede insertion into a shadow root.
        // Rebind to the actual form/root after DOM placement has settled.
        onSettled(syncAssociation);
        return () => {
          stopped = true;
          observer?.disconnect();
          form?.removeEventListener("reset", reset);
          root?.removeEventListener("reset", reset, true);
        };
      },
    );
    const binding: Pick<SliderAria, "thumbProps" | "inputProps" | "labelProps"> = {
      get labelProps() {
        return label.labelProps as SliderAria["labelProps"];
      },
      get thumbProps(): SliderAria["thumbProps"] {
        const percent = state.getThumbPercent(index()),
          vertical = state.orientation === "vertical";
        const offset = !vertical && locale().direction === "rtl" ? 1 - percent : percent;
        return {
          onPointerDown: (event: PointerEvent) => begin(event, index(), false),
          style: {
            position: "absolute",
            [vertical ? "bottom" : "left"]: `${offset * 100}%`,
            transform: vertical ? "translateY(50%)" : "translateX(-50%)",
            "touch-action": "none",
          },
        };
      },
      get inputProps(): SliderAria["inputProps"] {
        const p = props(),
          root = getProps();
        return {
          ...label.fieldProps,
          id: inputId(index()),
          type: "range",
          tabindex: disabled(index()) ? undefined : 0,
          min: state.getThumbMinValue(index()),
          max: state.getThumbMaxValue(index()),
          step: state.step,
          value: state.getThumbValue(index()),
          defaultValue: state.getThumbValue(index()),
          name: p.name ?? root.name,
          form: p.form ?? root.form,
          disabled: disabled(index()),
          "aria-disabled": disabled(index()) ? "true" : undefined,
          "aria-valuemin": state.getThumbMinValue(index()),
          "aria-valuemax": state.getThumbMaxValue(index()),
          "aria-valuenow": state.getThumbValue(index()),
          "aria-orientation": state.orientation,
          "aria-valuetext": state.getThumbValueLabel(index()),
          "aria-describedby": join(root["aria-describedby"], p["aria-describedby"]),
          "aria-details": join(root["aria-details"], p["aria-details"]),
          onKeyDown: keyboard,
          onInput: nativeInput,
          onChange: nativeChange,
          onFocus: () => {
            hasNativeFocus = true;
            state.setFocusedThumb(index());
          },
          onBlur: () => {
            hasNativeFocus = false;
            if (state.focusedThumb() === index()) state.setFocusedThumb(undefined);
          },
        };
      },
    };
    registration.binding = binding;
    thumbs.add(registration);
    if (!isServer) setRevision((v) => v + 1);
    createEffect(
      () => index(),
      (nextIndex) => {
        if (registeredIndex === nextIndex) return;
        if (drag?.index === registeredIndex) finish();
        if (hasNativeFocus) state.setFocusedThumb(nextIndex);
        registeredIndex = nextIndex;
      },
    );
    onCleanup(() => {
      thumbs.delete(registration);
      if (!isServer) setRevision((v) => v + 1);
      if (drag?.index === registeredIndex) finish();
      if (hasNativeFocus && state.focusedThumb() === registeredIndex)
        state.setFocusedThumb(undefined);
    });
    return binding;
  };
  return {
    bind,
    getThumb: (index: number) => indexedThumbs().get(index)?.binding,
    get labelProps(): SliderAria["labelProps"] {
      // createLabel returns only id here: this owner fixes labelElementType to span.
      return {
        id: rootLabel.labelProps.id,
        onClick: () => {
          if (!state.isDisabled) {
            setInteractionModality("keyboard");
            focus(0);
          }
        },
      };
    },
    get groupProps(): SliderAria["groupProps"] {
      return {
        ...rootLabel.fieldProps,
        id,
        role: "group",
        "data-disabled": state.isDisabled || undefined,
        "data-orientation": state.orientation,
      };
    },
    get trackProps(): SliderAria["trackProps"] {
      return {
        onPointerDown: trackDown,
        style: { position: "relative", "touch-action": "none" },
        "data-disabled": state.isDisabled || undefined,
        "data-orientation": state.orientation,
        "data-dragging": state.isDragging() || undefined,
      };
    },
    get outputProps(): SliderAria["outputProps"] {
      revision();
      return {
        id: `${id}-output`,
        for: [...indexedThumbs().keys()]
          .sort((a, b) => a - b)
          .map(inputId)
          .join(" "),
        "aria-live": "off",
      };
    },
  };
}

export function createSlider(
  props: MaybeAccessor<AriaSliderProps>,
  state: SliderState,
  trackRef?: () => HTMLElement | null,
  inputRef?: () => HTMLInputElement | null,
): SliderAria {
  const solidOwner = getOwner();
  const owner = owners.get(state) ?? makeOwner(props, state, trackRef);
  owners.set(state, owner);
  let compatibility: Pick<SliderAria, "thumbProps" | "inputProps" | "labelProps"> | undefined;
  const scalar = () =>
    owner.getThumb(0) ??
    (compatibility ??= runWithOwner(solidOwner, () =>
      owner.bind(
        () => ({
          ...access(props),
          id: undefined,
          index: 0,
          "aria-label": undefined,
          "aria-labelledby": undefined,
        }),
        inputRef ?? (() => null),
      ),
    ));
  return {
    get labelProps() {
      return owner.labelProps;
    },
    get groupProps() {
      return owner.groupProps;
    },
    get trackProps() {
      return owner.trackProps;
    },
    get outputProps() {
      return owner.outputProps;
    },
    get thumbProps() {
      return scalar().thumbProps;
    },
    get inputProps() {
      return scalar().inputProps;
    },
  };
}
