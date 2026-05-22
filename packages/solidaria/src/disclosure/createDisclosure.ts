/**
 * createDisclosure hook for Solidaria
 *
 * Provides the behavior and accessibility implementation for a disclosure component.
 *
 * Port of @react-aria/disclosure useDisclosure.
 */

import { type JSX, createEffect, onCleanup } from "solid-js";
import { type DisclosureState } from "@proyecto-viviana/solid-stately";
import { createId, canUseDOM } from "../ssr";
import { createPress } from "../interactions/createPress";
import { mergeProps } from "../utils/mergeProps";

export interface AriaDisclosureProps {
  /** Whether the disclosure is disabled. */
  isDisabled?: boolean;
}

export interface DisclosureAria {
  /** Props for the disclosure trigger button. */
  buttonProps: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
  /** Props for the disclosure panel. */
  panelProps: JSX.HTMLAttributes<HTMLElement>;
  /** Whether the disclosure trigger is currently pressed. */
  isPressed: () => boolean;
}

export function getDisclosurePanelHiddenAttribute(
  isExpanded: boolean,
  hasDOM = canUseDOM,
): true | undefined {
  return hasDOM ? undefined : !isExpanded || undefined;
}

/**
 * Provides the behavior and accessibility implementation for a disclosure component.
 *
 * A disclosure is a widget that can be toggled to show or hide content.
 * It consists of a trigger button and a panel.
 *
 * @example
 * ```tsx
 * import { createDisclosure } from 'solidaria';
 * import { createDisclosureState } from 'solid-stately';
 *
 * function Disclosure(props) {
 *   const state = createDisclosureState(props);
 *   let panelRef;
 *   const { buttonProps, panelProps } = createDisclosure(
 *     { get isDisabled() { return props.isDisabled; } },
 *     state,
 *     () => panelRef
 *   );
 *
 *   return (
 *     <div>
 *       <button {...buttonProps}>Toggle</button>
 *       <div {...panelProps} ref={panelRef}>
 *         {props.children}
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */
export function createDisclosure(
  props: AriaDisclosureProps | (() => AriaDisclosureProps),
  state: DisclosureState,
  panelRef: () => HTMLElement | null,
): DisclosureAria {
  // Handle both plain object and accessor function patterns
  const getProps = typeof props === "function" ? props : () => props;

  const triggerId = createId();
  const panelId = createId();

  let raf: number | null = null;
  let isExpandedRef: boolean | null = null;

  const requestFrame = (callback: FrameRequestCallback): number => {
    if (typeof requestAnimationFrame === "function") {
      return requestAnimationFrame(callback);
    }

    return window.setTimeout(() => callback(performance.now()), 16);
  };

  const cancelFrame = (id: number) => {
    if (typeof cancelAnimationFrame === "function") {
      cancelAnimationFrame(id);
    } else {
      window.clearTimeout(id);
    }
  };

  const cancelPendingRaf = () => {
    if (raf != null && canUseDOM) {
      cancelFrame(raf);
      raf = null;
    }
  };

  const setPanelSize = (panel: HTMLElement, width: string, height: string) => {
    panel.style.setProperty("--disclosure-panel-width", width);
    panel.style.setProperty("--disclosure-panel-height", height);
  };

  const getPanelAnimations = (panel: HTMLElement): Animation[] => {
    return typeof panel.getAnimations === "function" ? panel.getAnimations() : [];
  };

  // Handle browser find-in-page reveal for collapsed panels.
  createEffect(() => {
    if (!canUseDOM) return;

    const panel = panelRef();
    if (!panel) return;

    const handleBeforeMatch = () => {
      cancelPendingRaf();
      raf = requestFrame(() => {
        if (panelRef() === panel) {
          panel.setAttribute("hidden", "until-found");
        }
        raf = null;
      });

      state.toggle();
    };

    panel.addEventListener("beforematch", handleBeforeMatch);
    onCleanup(() => {
      panel.removeEventListener("beforematch", handleBeforeMatch);
    });
  });

  // Handle panel visibility and animation sizing.
  createEffect(() => {
    if (!canUseDOM) return;

    const panel = panelRef();
    if (!panel) return;

    const isExpanded = state.isExpanded();
    cancelPendingRaf();

    if (isExpandedRef === null || typeof panel.getAnimations !== "function") {
      if (isExpanded) {
        panel.removeAttribute("hidden");
        setPanelSize(panel, "auto", "auto");
      } else {
        panel.setAttribute("hidden", "until-found");
        setPanelSize(panel, "0px", "0px");
      }
    } else if (isExpanded !== isExpandedRef) {
      if (isExpanded) {
        panel.removeAttribute("hidden");
        setPanelSize(panel, `${panel.scrollWidth}px`, `${panel.scrollHeight}px`);

        Promise.all(getPanelAnimations(panel).map((animation) => animation.finished))
          .then(() => {
            if (panelRef() === panel && state.isExpanded()) {
              setPanelSize(panel, "auto", "auto");
            }
          })
          .catch(() => {});
      } else {
        setPanelSize(panel, `${panel.scrollWidth}px`, `${panel.scrollHeight}px`);

        // Force style recalculation before animating to zero.
        window.getComputedStyle(panel).height;

        setPanelSize(panel, "0px", "0px");

        Promise.all(getPanelAnimations(panel).map((animation) => animation.finished))
          .then(() => {
            if (panelRef() === panel && !state.isExpanded()) {
              panel.setAttribute("hidden", "until-found");
            }
          })
          .catch(() => {});
      }
    }

    isExpandedRef = isExpanded;
  });

  onCleanup(cancelPendingRaf);

  // Use createPress for proper interaction handling (matches Select/Menu pattern)
  const { pressProps, isPressed } = createPress({
    get isDisabled() {
      return getProps().isDisabled;
    },
    onPressStart(event) {
      if (event.pointerType === "keyboard") {
        state.toggle();
      }
    },
    onPress(event) {
      if (event.pointerType !== "keyboard") {
        state.toggle();
      }
    },
  });

  return {
    isPressed,
    // Button props - merge with pressProps for consistent interaction handling
    // Using getter (not createMemo) to match createSelect pattern
    get buttonProps(): JSX.ButtonHTMLAttributes<HTMLButtonElement> {
      const p = getProps();
      return mergeProps(
        pressProps as Record<string, unknown>,
        {
          id: triggerId,
          type: "button",
          "aria-expanded": state.isExpanded(),
          "aria-controls": panelId,
          disabled: p.isDisabled,
        } as Record<string, unknown>,
      ) as JSX.ButtonHTMLAttributes<HTMLButtonElement>;
    },
    // Panel props
    get panelProps(): JSX.HTMLAttributes<HTMLElement> {
      return {
        id: panelId,
        role: "group",
        "aria-labelledby": triggerId,
        "aria-hidden": !state.isExpanded(),
        hidden: getDisclosurePanelHiddenAttribute(state.isExpanded()),
      };
    },
  };
}
