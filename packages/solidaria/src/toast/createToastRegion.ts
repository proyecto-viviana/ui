/**
 * createToastRegion hook for Solidaria
 *
 * Provides the accessibility implementation for a ToastRegion component.
 * The region is a landmark that contains all visible toasts.
 *
 * Port of @react-aria/toast useToastRegion.
 */

import { type Accessor, type JSX, createEffect, createMemo, onCleanup } from "solid-js";
import { type ToastState } from "@proyecto-viviana/solid-stately";
import { createHover } from "../interactions/createHover";
import { getInteractionModality } from "../interactions/createInteractionModality";
import { createLandmark } from "../landmark/createLandmark";
import { focusWithoutScrolling } from "../utils/focus";

export interface AriaToastRegionProps<T> {
  /** The toast state from createToastState. */
  state: ToastState<T>;
  /** The toast region element. Required for landmark navigation and focus recovery. */
  ref?: Accessor<HTMLElement | undefined>;
  /** An accessible label for the region. */
  "aria-label"?: string;
}

export interface ToastRegionAria {
  /** Props for the toast region container element. */
  regionProps: JSX.HTMLAttributes<HTMLElement>;
}

/**
 * Provides the accessibility implementation for a ToastRegion component.
 *
 * The region is a landmark (role="region") that contains all visible toasts.
 * It pauses toast timers on hover or focus to give users time to read/interact.
 *
 * @example
 * ```tsx
 * import { createToastRegion } from 'solidaria';
 * import { For, Show } from 'solid-js';
 *
 * function ToastRegion(props) {
 *   let ref;
 *   const { regionProps } = createToastRegion({ state: props.state });
 *
 *   return (
 *     <Show when={props.state.visibleToasts().length > 0}>
 *       <div {...regionProps} ref={ref}>
 *         <For each={props.state.visibleToasts()}>
 *           {(toast) => <Toast toast={toast} state={props.state} />}
 *         </For>
 *       </div>
 *     </Show>
 *   );
 * }
 * ```
 */
export function createToastRegion<T>(props: AriaToastRegionProps<T>): ToastRegionAria {
  const visibleToasts = () =>
    typeof props.state.visibleToasts === "function" ? props.state.visibleToasts() : [];
  const regionRef = () => props.ref?.();
  const activeRegionRef = () => (visibleToasts().length > 0 ? regionRef() : undefined);

  const { landmarkProps } = createLandmark(
    () => ({
      role: "region",
      "aria-label": props["aria-label"] ?? "Notifications",
    }),
    activeRegionRef,
  );

  let isHovered = false;
  let isFocused = false;
  let toastElements: HTMLElement[] = [];
  let previousVisibleToasts = visibleToasts();
  let focusedToastIndex = -1;
  let lastFocused: HTMLElement | null = null;

  const updateTimers = () => {
    if (isHovered || isFocused) {
      props.state.pauseAll();
    } else {
      props.state.resumeAll();
    }
  };

  const { hoverProps } = createHover({
    onHoverStart: () => {
      isHovered = true;
      updateTimers();
    },
    onHoverEnd: () => {
      isHovered = false;
      updateTimers();
    },
  });

  const getToastElements = () => {
    const element = regionRef();
    return element ? [...element.querySelectorAll<HTMLElement>('[role="alertdialog"]')] : [];
  };

  const restoreLastFocused = () => {
    if (!lastFocused?.isConnected) {
      lastFocused = null;
      return;
    }

    if (getInteractionModality() === "pointer") {
      focusWithoutScrolling(lastFocused);
    } else {
      lastFocused.focus();
    }

    lastFocused = null;
  };

  const handleFocusIn = (e: FocusEvent) => {
    const currentTarget = e.currentTarget as HTMLElement;
    const relatedTarget = e.relatedTarget as HTMLElement | null;

    if (!isFocused) {
      isFocused = true;
      if (relatedTarget && !currentTarget.contains(relatedTarget)) {
        lastFocused = relatedTarget;
      }
      updateTimers();
    }

    toastElements = getToastElements();
    const target =
      e.target instanceof Element ? e.target.closest<HTMLElement>('[role="alertdialog"]') : null;
    focusedToastIndex = target ? toastElements.findIndex((toast) => toast === target) : -1;
  };

  const handleFocusOut = (e: FocusEvent) => {
    const target = e.relatedTarget as HTMLElement | null;
    const currentTarget = e.currentTarget as HTMLElement;
    if (!target || !currentTarget.contains(target)) {
      isFocused = false;
      focusedToastIndex = -1;
      updateTimers();
    }
  };

  createEffect(() => {
    const currentVisibleToasts = visibleToasts();
    const element = regionRef();

    if (focusedToastIndex === -1 || currentVisibleToasts.length === 0 || !element) {
      toastElements = [];
      previousVisibleToasts = currentVisibleToasts;
      return;
    }

    toastElements = getToastElements();

    const unchanged =
      previousVisibleToasts.length === currentVisibleToasts.length &&
      currentVisibleToasts.every((toast, index) => toast.key === previousVisibleToasts[index]?.key);

    if (unchanged) {
      previousVisibleToasts = currentVisibleToasts;
      return;
    }

    const allToasts = previousVisibleToasts.map((toast, index) => ({
      index,
      isRemoved: !currentVisibleToasts.some((currentToast) => currentToast.key === toast.key),
    }));
    const removedFocusedToastIndex = allToasts.findIndex(
      (toast) => toast.index === focusedToastIndex && toast.isRemoved,
    );

    if (removedFocusedToastIndex > -1) {
      if (getInteractionModality() === "pointer" && lastFocused?.isConnected) {
        focusWithoutScrolling(lastFocused);
      } else {
        let index = 0;
        let nextToast: number | undefined;
        let previousToast: number | undefined;

        while (index <= removedFocusedToastIndex) {
          if (!allToasts[index]?.isRemoved) {
            previousToast = Math.max(0, index - 1);
          }
          index++;
        }

        while (index < allToasts.length) {
          if (!allToasts[index]?.isRemoved) {
            nextToast = index - 1;
            break;
          }
          index++;
        }

        if (previousToast === undefined && nextToast === undefined) {
          previousToast = 0;
        }

        if (
          previousToast !== undefined &&
          previousToast >= 0 &&
          previousToast < toastElements.length
        ) {
          focusWithoutScrolling(toastElements[previousToast]);
        } else if (nextToast !== undefined && nextToast >= 0 && nextToast < toastElements.length) {
          focusWithoutScrolling(toastElements[nextToast]);
        }
      }
    }

    previousVisibleToasts = currentVisibleToasts;
  });

  createEffect(() => {
    if (visibleToasts().length === 0) {
      restoreLastFocused();
    }
  });

  onCleanup(() => {
    restoreLastFocused();
  });

  // Region props
  const regionProps = createMemo<JSX.HTMLAttributes<HTMLElement>>(() => ({
    ...landmarkProps,
    ...hoverProps,
    tabIndex: -1,
    "data-solidaria-top-layer": "true",
    onFocusIn: handleFocusIn,
    onFocusOut: handleFocusOut,
  }));

  return {
    get regionProps() {
      return regionProps();
    },
  };
}
