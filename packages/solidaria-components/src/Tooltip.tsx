/**
 * Tooltip component for solidaria-components
 *
 * A tooltip displays a description of an element on hover or focus.
 * Port of react-aria-components/src/Tooltip.tsx
 */

import {
  type JSX,
  type ParentComponent,
  createContext,
  useContext,
  createMemo,
  createSignal,
  createEffect,
  onCleanup,
  Show,
} from "solid-js";
import { isServer } from "solid-js/web";
import {
  createTooltipTriggerState,
  type TooltipTriggerState,
  type TooltipTriggerProps as StateProps,
} from "@proyecto-viviana/solid-stately";
import {
  createTooltip,
  createTooltipTrigger,
  type TooltipTriggerProps as AriaProps,
  OverlayContainer,
} from "@proyecto-viviana/solidaria";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  filterDOMProps,
} from "./utils";

export interface TooltipRenderProps {
  /** Whether the tooltip is currently entering (for animations). */
  isEntering: boolean;
  /** Whether the tooltip is currently exiting (for animations). */
  isExiting: boolean;
  /** The placement of the tooltip relative to the trigger. */
  placement: TooltipResolvedPlacement | null;
}

export type TooltipPlacement = "top" | "bottom" | "left" | "right" | "start" | "end";
export type TooltipResolvedPlacement = "top" | "bottom" | "left" | "right";

export interface TooltipTriggerComponentProps extends StateProps, AriaProps {
  /** The children of the tooltip trigger (trigger element and tooltip). */
  children: JSX.Element;
  /** The placement of the tooltip relative to the trigger. */
  placement?: TooltipPlacement;
  /** The placement padding between the tooltip and viewport edge. */
  containerPadding?: number;
  /** The additional offset along the cross axis. */
  crossOffset?: number;
  /** Whether the tooltip should flip when there is insufficient room. */
  shouldFlip?: boolean;
}

export interface TooltipProps extends SlotProps {
  /** The element id. */
  id?: string;
  /** Custom aria-label for the tooltip. */
  "aria-label"?: string;
  /** ID of an element that labels the tooltip. */
  "aria-labelledby"?: string;
  /** ID of an element that describes the tooltip. */
  "aria-describedby"?: string;
  /** ID of an element that provides details for the tooltip. */
  "aria-details"?: string;
  /** The children of the tooltip. A function may be provided to receive render props. */
  children?: RenderChildren<TooltipRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<TooltipRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<TooltipRenderProps>;
  /** Whether the tooltip is open (controlled). */
  isOpen?: boolean;
  /** Whether the tooltip is open by default (uncontrolled). */
  defaultOpen?: boolean;
  /** The placement of the tooltip relative to the trigger. */
  placement?: TooltipPlacement;
  /** The placement padding between the tooltip and viewport edge. */
  containerPadding?: number;
  /** The additional offset along the cross axis. */
  crossOffset?: number;
  /** Whether the tooltip should flip when there is insufficient room. */
  shouldFlip?: boolean;
  /** The offset between the tooltip and trigger. */
  offset?: number;
  /** The arrow size used to keep the arrow overlapping the trigger. */
  arrowSize?: number;
  /** The padding between the arrow and tooltip edge. */
  arrowBoundaryOffset?: number;
  /** Whether the tooltip should be disabled. */
  isDisabled?: boolean;
  /** The element language. */
  lang?: string;
  /** The text direction. */
  dir?: "ltr" | "rtl";
}

interface TooltipTriggerContextValue {
  state: TooltipTriggerState;
  tooltipProps: { readonly id: string };
  setTooltipId: (id: string | undefined) => void;
  triggerRef: () => HTMLElement | null | undefined;
  placement: () => TooltipPlacement | undefined;
  containerPadding: () => number | undefined;
  crossOffset: () => number | undefined;
  shouldFlip: () => boolean | undefined;
  isDisabled: () => boolean | undefined;
}

const TooltipTriggerContext = createContext<TooltipTriggerContextValue | null>(null);
export const TooltipContext = TooltipTriggerContext;
export const TooltipTriggerStateContext = createContext<TooltipTriggerState | null>(null);

/**
 * TooltipTrigger wraps around a trigger element and a Tooltip.
 * It handles opening and closing the Tooltip when the user hovers
 * over or focuses the trigger.
 *
 * @example
 * ```tsx
 * <TooltipTrigger>
 *   <Button>Hover me</Button>
 *   <Tooltip>This is a tooltip</Tooltip>
 * </TooltipTrigger>
 * ```
 */
export const TooltipTrigger: ParentComponent<TooltipTriggerComponentProps> = (props) => {
  let triggerRef: HTMLElement | null = null;
  const [tooltipId, setTooltipId] = createSignal<string | undefined>();

  const state = createTooltipTriggerState({
    get delay() {
      return props.delay;
    },
    get closeDelay() {
      return props.closeDelay;
    },
    get isOpen() {
      return props.isOpen;
    },
    get defaultOpen() {
      return props.defaultOpen;
    },
    get onOpenChange() {
      return props.onOpenChange;
    },
  });

  const { triggerProps, tooltipProps } = createTooltipTrigger(
    {
      get isDisabled() {
        return props.isDisabled;
      },
      get trigger() {
        return props.trigger;
      },
      get shouldCloseOnPress() {
        return props.shouldCloseOnPress;
      },
      get tooltipId() {
        return tooltipId();
      },
    },
    state,
    () => triggerRef,
  );

  const context: TooltipTriggerContextValue = {
    state,
    tooltipProps,
    setTooltipId,
    triggerRef: () => triggerRef,
    placement: () => props.placement,
    containerPadding: () => props.containerPadding,
    crossOffset: () => props.crossOffset,
    shouldFlip: () => props.shouldFlip,
    isDisabled: () => props.isDisabled,
  };

  const processChildren = () => {
    const children = props.children;
    if (Array.isArray(children)) {
      const [trigger, ...rest] = children;
      return (
        <>
          <TriggerWrapper
            triggerProps={triggerProps}
            ref={(el) => {
              triggerRef = el;
            }}
          >
            {trigger}
          </TriggerWrapper>
          {rest}
        </>
      );
    }
    return children;
  };

  return (
    <TooltipTriggerStateContext.Provider value={state}>
      <TooltipTriggerContext.Provider value={context}>
        {processChildren()}
      </TooltipTriggerContext.Provider>
    </TooltipTriggerStateContext.Provider>
  );
};

/**
 * Wrapper component that spreads trigger props onto its child
 */
const TriggerWrapper: ParentComponent<{
  triggerProps: JSX.HTMLAttributes<HTMLElement>;
  ref: (el: HTMLElement) => void;
}> = (props) => {
  const child = () => props.children as JSX.Element;
  const [triggerElement, setTriggerElement] = createSignal<HTMLElement | null>(null);
  const [wrapperElement, setWrapperElement] = createSignal<HTMLSpanElement | null>(null);
  const getWrapperEventProps = () => {
    const triggerProps = props.triggerProps as Record<string, unknown>;
    const wrapperProps: Record<string, unknown> = {};
    const eventPropNames = [
      "onFocus",
      "onBlur",
      "onPointerEnter",
      "onPointerLeave",
      "onPointerOver",
      "onPointerOut",
      "onMouseEnter",
      "onMouseLeave",
      "onTouchStart",
      "onPointerDown",
      "onKeyDown",
    ];

    for (const propName of eventPropNames) {
      const handler = triggerProps[propName];
      if (typeof handler === "function") {
        wrapperProps[propName] = handler;
      }
    }

    if (!wrapperProps.onPointerEnter && typeof triggerProps.onMouseEnter === "function") {
      wrapperProps.onPointerEnter = triggerProps.onMouseEnter;
    }
    if (!wrapperProps.onPointerLeave && typeof triggerProps.onMouseLeave === "function") {
      wrapperProps.onPointerLeave = triggerProps.onMouseLeave;
    }

    return wrapperProps as JSX.HTMLAttributes<HTMLSpanElement>;
  };

  createEffect(() => {
    const element = triggerElement();
    if (!element) {
      return;
    }

    const triggerProps = props.triggerProps as Record<string, unknown>;
    const describedBy = triggerProps["aria-describedby"] as string | undefined;
    if (describedBy) {
      element.setAttribute("aria-describedby", describedBy);
    } else {
      element.removeAttribute("aria-describedby");
    }

    const wrapper = wrapperElement();
    const targets = Array.from(new Set([element, wrapper].filter(Boolean))) as HTMLElement[];
    const listeners: Array<[HTMLElement, string, EventListener]> = [];
    const eventProps = [
      ["onFocus", "focus"],
      ["onBlur", "blur"],
      ["onPointerEnter", "pointerenter"],
      ["onPointerLeave", "pointerleave"],
      ["onPointerOver", "pointerover"],
      ["onPointerOut", "pointerout"],
      ["onMouseEnter", "mouseenter"],
      ["onMouseLeave", "mouseleave"],
      ["onTouchStart", "touchstart"],
      ["onPointerDown", "pointerdown"],
      ["onKeyDown", "keydown"],
    ] as const;

    for (const [propName, eventName] of eventProps) {
      let handler = triggerProps[propName];
      if (!handler && propName === "onPointerEnter") {
        handler = triggerProps.onMouseEnter;
      } else if (!handler && propName === "onPointerLeave") {
        handler = triggerProps.onMouseLeave;
      }
      if (typeof handler === "function") {
        const listener = handler as EventListener;
        for (const target of targets) {
          target.addEventListener(eventName, listener);
          listeners.push([target, eventName, listener]);
        }
      }
    }

    onCleanup(() => {
      for (const [target, eventName, listener] of listeners) {
        target.removeEventListener(eventName, listener);
      }
      if (describedBy && element.getAttribute("aria-describedby") === describedBy) {
        element.removeAttribute("aria-describedby");
      }
    });
  });

  // We wrap in a span with display:contents to not affect layout.
  // However, display:contents makes getBoundingClientRect return zeros,
  // so we pass a ref callback that finds the first actual element child.
  const handleRef = (span: HTMLSpanElement) => {
    setWrapperElement(span);

    const findElementChild = (el: Element): HTMLElement | null => {
      for (const child of el.children) {
        if (child instanceof HTMLElement) {
          return child;
        }
        const found = findElementChild(child);
        if (found) return found;
      }
      return null;
    };

    // Find the first element child that has dimensions (not display:contents)
    const findVisibleChild = (el: Element): HTMLElement | null => {
      if (el instanceof HTMLElement) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          return el;
        }
        for (const child of el.children) {
          const found = findVisibleChild(child);
          if (found) return found;
        }
      }
      return null;
    };

    // Use requestAnimationFrame to ensure children are rendered and have dimensions
    // This is necessary because SolidJS may not have computed child layout yet
    const resolveRef = () => {
      const elementChild = findElementChild(span);
      const visibleChild = findVisibleChild(span);
      setTriggerElement(elementChild ?? visibleChild ?? span);
      props.ref(visibleChild ?? elementChild ?? span);
    };

    const elementChild = findElementChild(span);
    if (elementChild) {
      setTriggerElement(elementChild);
    }

    const immediateChild = findVisibleChild(span);
    if (immediateChild) {
      setTriggerElement(elementChild ?? immediateChild);
      props.ref(immediateChild);
    } else {
      requestAnimationFrame(resolveRef);
    }
  };

  return (
    <span {...getWrapperEventProps()} ref={handleRef} style={{ display: "contents" }}>
      {child()}
    </span>
  );
};

/**
 * A tooltip displays a description of an element on hover or focus.
 *
 * @example
 * ```tsx
 * <TooltipTrigger>
 *   <Button>Hover me</Button>
 *   <Tooltip>This is helpful information</Tooltip>
 * </TooltipTrigger>
 * ```
 */
export function Tooltip(props: TooltipProps): JSX.Element {
  const context = useContext(TooltipTriggerContext);

  createEffect(() => {
    context?.setTooltipId(props.id);
    onCleanup(() => {
      context?.setTooltipId(undefined);
    });
  });

  const localState = createTooltipTriggerState({
    get isOpen() {
      return props.isOpen;
    },
    get defaultOpen() {
      return props.defaultOpen;
    },
  });

  const state = () => context?.state ?? localState;
  const placement = () => props.placement ?? context?.placement() ?? "top";
  const containerPadding = () => props.containerPadding ?? context?.containerPadding() ?? 12;
  const crossOffset = () => props.crossOffset ?? context?.crossOffset() ?? 0;
  const shouldFlip = () => props.shouldFlip ?? context?.shouldFlip() ?? true;
  const offset = () => props.offset ?? 9;
  const arrowSize = () => props.arrowSize ?? 0;
  const arrowBoundaryOffset = () => props.arrowBoundaryOffset ?? 0;
  const isDisabled = () => props.isDisabled ?? context?.isDisabled() ?? false;

  const isOpen = () => !isDisabled() && state().isOpen();

  // Exit animation state machine: 'closed' | 'open' | 'exiting'
  // Keeps the tooltip mounted during exit animation so CSS transitions can play.
  const [exitState, setExitState] = createSignal<"closed" | "open" | "exiting">(
    isOpen() ? "open" : "closed",
  );

  createEffect(() => {
    const open = isOpen();
    const current = exitState();
    if (current === "open" && !open) {
      setExitState("exiting");
    } else if ((current === "closed" || current === "exiting") && open) {
      setExitState("open");
    }
  });

  // Signal for the tooltip ref so we can observe exit animations
  const [tooltipEl, setTooltipEl] = createSignal<HTMLDivElement | null>(null);

  // When exiting, wait for CSS animations to finish, then set state to closed
  createEffect(() => {
    if (exitState() !== "exiting") return;
    const el = tooltipEl();
    if (!el || !("getAnimations" in el)) {
      setExitState("closed");
      return;
    }
    const animations = el.getAnimations();
    if (animations.length === 0) {
      setExitState("closed");
      return;
    }
    let canceled = false;
    Promise.all(animations.map((a) => a.finished))
      .then(() => {
        if (!canceled) setExitState((s) => (s === "exiting" ? "closed" : s));
      })
      .catch(() => {
        if (!canceled) setExitState((s) => (s === "exiting" ? "closed" : s));
      });
    onCleanup(() => {
      canceled = true;
    });
  });

  const shouldRender = () => isOpen() || exitState() === "exiting";
  const isExiting = () => exitState() === "exiting";

  return (
    <Show when={shouldRender()}>
      <TooltipContent
        {...props}
        state={state()}
        contextTooltipProps={context?.tooltipProps ?? {}}
        placement={placement()}
        containerPadding={containerPadding()}
        crossOffset={crossOffset()}
        shouldFlip={shouldFlip()}
        offset={offset()}
        arrowSize={arrowSize()}
        arrowBoundaryOffset={arrowBoundaryOffset()}
        triggerRef={context?.triggerRef ?? (() => null)}
        isExiting={isExiting()}
        onTooltipRef={setTooltipEl}
      />
    </Show>
  );
}

/**
 * Internal component that renders the tooltip content
 */
function TooltipContent(
  props: TooltipProps & {
    state: TooltipTriggerState;
    contextTooltipProps: { readonly id?: string };
    placement: TooltipPlacement;
    containerPadding: number;
    crossOffset: number;
    shouldFlip: boolean;
    offset: number;
    arrowSize: number;
    arrowBoundaryOffset: number;
    triggerRef: () => HTMLElement | null | undefined;
    isExiting: boolean;
    onTooltipRef: (el: HTMLDivElement | null) => void;
  },
): JSX.Element {
  if (isServer) {
    return null as unknown as JSX.Element;
  }

  let tooltipRef!: HTMLDivElement;
  const { tooltipProps: ariaTooltipProps } = createTooltip({}, props.state);

  // Start visible at 0,0 and update position asynchronously
  // This ensures the tooltip is immediately accessible (for screen readers and tests)
  // while the visual position gets calculated
  const [positionStyles, setPositionStyles] = createSignal({
    top: "0px",
    left: "0px",
    visibility: "visible" as "hidden" | "visible",
  });
  const [renderedPlacement, setRenderedPlacement] = createSignal<TooltipResolvedPlacement>(
    resolvePlacement(props.placement),
  );

  // Enter animation state: starts true on mount, clears after first animation frame.
  // Uses getAnimations() to detect CSS animations/transitions - if none exist (JSDOM,
  // no CSS defined, reduced-motion), clears immediately.
  const [isEntering, setIsEntering] = createSignal(true);

  createEffect(() => {
    if (!isEntering()) return;
    if (!tooltipRef || !("getAnimations" in tooltipRef)) {
      setIsEntering(false);
      return;
    }
    // Cancel any premature CSS transitions triggered before layout
    for (const anim of tooltipRef.getAnimations()) {
      if (anim instanceof CSSTransition) {
        anim.cancel();
      }
    }
    const animations = tooltipRef.getAnimations();
    if (animations.length === 0) {
      setIsEntering(false);
      return;
    }
    let canceled = false;
    Promise.all(animations.map((a) => a.finished))
      .then(() => {
        if (!canceled) setIsEntering(false);
      })
      .catch(() => {
        if (!canceled) setIsEntering(false);
      });
    onCleanup(() => {
      canceled = true;
    });
  });

  const values = createMemo<TooltipRenderProps>(() => ({
    isEntering: isEntering(),
    isExiting: props.isExiting,
    placement: renderedPlacement(),
  }));

  const renderProps = useRenderProps(
    {
      class: props.class,
      style: props.style,
      children: props.children,
      defaultClassName: "solidaria-Tooltip",
    },
    values,
  );

  // Position the overlay in document coordinates, matching React Aria's
  // absolute overlay positioning when the portal container is the document.
  // Returns true if position was successfully updated, false if we need to retry
  const updatePosition = (): boolean => {
    const triggerEl = props.triggerRef();
    if (!triggerEl || !tooltipRef) return false;

    const triggerRect = triggerEl.getBoundingClientRect();

    // Check if the trigger has valid dimensions (not display:contents or not rendered yet)
    if (triggerRect.width === 0 || triggerRect.height === 0) {
      return false; // Need to retry
    }

    // Use offsetWidth/offsetHeight which are more reliable than getBoundingClientRect
    // when the element might be positioned off-screen initially
    const tooltipWidth = tooltipRef.offsetWidth;
    const tooltipHeight = tooltipRef.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const containerPadding = props.containerPadding;
    const crossOffset = props.crossOffset;
    const placement = maybeFlipPlacement(
      resolvePlacement(props.placement),
      triggerRect,
      tooltipWidth,
      tooltipHeight,
      viewportWidth,
      viewportHeight,
      containerPadding,
      props.offset,
      props.shouldFlip,
    );

    let top = 0;
    let left = 0;

    switch (placement) {
      case "top":
        top = triggerRect.top - tooltipHeight - props.offset;
        left = triggerRect.left + (triggerRect.width - tooltipWidth) / 2 + crossOffset;
        break;
      case "bottom":
        top = triggerRect.bottom + props.offset;
        left = triggerRect.left + (triggerRect.width - tooltipWidth) / 2 + crossOffset;
        break;
      case "left":
        top = triggerRect.top + (triggerRect.height - tooltipHeight) / 2 + crossOffset;
        left = triggerRect.left - tooltipWidth - props.offset;
        break;
      case "right":
        top = triggerRect.top + (triggerRect.height - tooltipHeight) / 2 + crossOffset;
        left = triggerRect.right + props.offset;
        break;
    }

    if (placement === "top" || placement === "bottom") {
      left = clamp(
        left,
        triggerRect.left - tooltipWidth + props.arrowSize + props.arrowBoundaryOffset,
        triggerRect.left + triggerRect.width - props.arrowSize - props.arrowBoundaryOffset,
      );
      left = clamp(left, containerPadding, viewportWidth - tooltipWidth - containerPadding);
    } else {
      top = clamp(
        top,
        triggerRect.top - tooltipHeight + props.arrowSize + props.arrowBoundaryOffset,
        triggerRect.top + triggerRect.height - props.arrowSize - props.arrowBoundaryOffset,
      );
      top = clamp(top, containerPadding, viewportHeight - tooltipHeight - containerPadding);
    }
    setRenderedPlacement(placement);
    setPositionStyles({
      top: `${Math.floor(top + window.scrollY)}px`,
      left: `${Math.floor(left + window.scrollX)}px`,
      visibility: "visible",
    });

    return true;
  };

  // Set up positioning and scroll-close effects. Positioning retries while the
  // trigger ref resolves, and pending rAF/setTimeout IDs are canceled on cleanup.
  createEffect(() => {
    // Track positioning inputs synchronously so updates from controlled route
    // props reschedule measurement even though layout reads happen in rAF.
    props.placement;
    props.containerPadding;
    props.crossOffset;
    props.shouldFlip;
    props.offset;
    props.arrowSize;
    props.arrowBoundaryOffset;

    let retryCount = 0;
    const maxRetries = 5;
    let pendingRaf = 0;
    let pendingTimeout = 0;

    const tryUpdatePosition = () => {
      pendingRaf = 0;
      pendingTimeout = 0;
      const success = updatePosition();
      if (!success && retryCount < maxRetries) {
        retryCount++;
        pendingTimeout = window.setTimeout(tryUpdatePosition, 16);
      }
    };

    pendingRaf = requestAnimationFrame(tryUpdatePosition);

    const closeOnScroll = (event: Event) => {
      const trigger = props.triggerRef();
      const target = event.target;
      if (!trigger || (target instanceof Node && !target.contains(trigger))) {
        return;
      }
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        return;
      }

      props.state.close(true);
    };

    window.addEventListener("scroll", closeOnScroll, true);
    window.addEventListener("resize", updatePosition);

    onCleanup(() => {
      if (pendingRaf) cancelAnimationFrame(pendingRaf);
      if (pendingTimeout) clearTimeout(pendingTimeout);
      window.removeEventListener("scroll", closeOnScroll, true);
      window.removeEventListener("resize", updatePosition);
    });
  });

  const domProps = filterDOMProps(props, { global: true });
  const tooltipId = () => props.contextTooltipProps.id ?? (domProps as { id?: string }).id;

  // Extract ref from ariaTooltipProps to avoid type conflicts (SolidJS ref types are element-specific)
  const { ref: _ariaRef, ...cleanAriaProps } = ariaTooltipProps as Record<string, unknown>;

  const setRef = (el: HTMLDivElement) => {
    tooltipRef = el;
    if (!props.dir) {
      el.dir = getDocumentDirection();
    }
    if (!props.lang) {
      const documentLang = document.documentElement.lang;
      const navigatorLang = typeof navigator !== "undefined" ? navigator.language : "";
      el.lang = documentLang.includes("-")
        ? documentLang
        : navigatorLang || documentLang || "en-US";
    }
    props.onTooltipRef(el);
  };

  onCleanup(() => {
    props.onTooltipRef(null);
  });

  return (
    <OverlayContainer>
      <div
        {...domProps}
        {...cleanAriaProps}
        id={tooltipId()}
        role="tooltip"
        ref={setRef}
        class={renderProps.class()}
        style={{
          position: "absolute",
          "z-index": 100000,
          ...positionStyles(),
          ...renderProps.style(),
        }}
        data-placement={renderedPlacement()}
        data-entering={isEntering() || undefined}
        data-exiting={props.isExiting || undefined}
      >
        {renderProps.renderChildren()}
      </div>
    </OverlayContainer>
  );
}

function resolvePlacement(placement: TooltipPlacement): TooltipResolvedPlacement {
  if (placement === "start") {
    return getDocumentDirection() === "rtl" ? "right" : "left";
  }
  if (placement === "end") {
    return getDocumentDirection() === "rtl" ? "left" : "right";
  }
  return placement;
}

function getDocumentDirection(): "ltr" | "rtl" {
  if (typeof document === "undefined") {
    return "ltr";
  }

  return document.documentElement.dir === "rtl" ? "rtl" : "ltr";
}

function maybeFlipPlacement(
  placement: TooltipResolvedPlacement,
  triggerRect: DOMRect,
  tooltipWidth: number,
  tooltipHeight: number,
  viewportWidth: number,
  viewportHeight: number,
  containerPadding: number,
  offset: number,
  shouldFlip: boolean,
): TooltipResolvedPlacement {
  if (!shouldFlip) {
    return placement;
  }

  switch (placement) {
    case "top":
      return triggerRect.top - tooltipHeight - offset < containerPadding ? "bottom" : placement;
    case "bottom":
      return triggerRect.bottom + tooltipHeight + offset > viewportHeight - containerPadding
        ? "top"
        : placement;
    case "left":
      return triggerRect.left - tooltipWidth - offset < containerPadding ? "right" : placement;
    case "right":
      return triggerRect.right + tooltipWidth + offset > viewportWidth - containerPadding
        ? "left"
        : placement;
  }
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

export type { TooltipTriggerState };
