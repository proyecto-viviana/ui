/**
 * Handles positioning overlays like popovers and menus relative to a trigger
 * element, and updating the position when the window resizes.
 *
 * Ported from @react-aria/overlays useOverlayPosition.
 */

import { createEffect, createSignal, onCleanup, type JSX } from "solid-js";
import { useLocale } from "../i18n";
import {
  calculatePosition,
  getRect,
  type Placement,
  type PlacementAxis,
  type PositionResult,
} from "./calculatePosition";

export interface PositionProps {
  /**
   * The placement of the element with respect to its anchor element.
   * @default 'bottom'
   */
  placement?: Placement;
  /**
   * The placement padding that should be applied between the element and its
   * surrounding container.
   * @default 12
   */
  containerPadding?: number;
  /**
   * The additional offset applied along the main axis between the element and its
   * anchor element.
   * @default 0
   */
  offset?: number;
  /**
   * The additional offset applied along the cross axis between the element and its
   * anchor element.
   * @default 0
   */
  crossOffset?: number;
  /**
   * Whether the element should flip its orientation (e.g. top to bottom or left to right) when
   * there is insufficient room for it to render completely.
   * @default true
   */
  shouldFlip?: boolean;
  /** Whether the overlay is currently open. */
  isOpen?: boolean;
}

export interface AriaPositionProps extends PositionProps {
  /**
   * Cross size of the overlay arrow in pixels.
   * @default 0
   */
  arrowSize?: number;
  /**
   * Element that that serves as the positioning boundary.
   * @default document.body
   */
  boundaryElement?: Element;
  /**
   * The ref for the element which the overlay positions itself with respect to.
   */
  targetRef: () => Element | null;
  /**
   * The ref for the overlay element.
   */
  overlayRef: () => Element | null;
  /**
   * The ref for the arrow element.
   */
  arrowRef?: () => Element | null;
  /**
   * A ref for the scrollable region within the overlay.
   * @default overlayRef
   */
  scrollRef?: () => Element | null;
  /**
   * Whether the overlay should update its position automatically.
   * @default true
   */
  shouldUpdatePosition?: boolean;
  /** Handler that is called when the overlay should close. */
  onClose?: (() => void) | null;
  /**
   * The maxHeight specified for the overlay element.
   * By default, it will take all space up to the current viewport height.
   */
  maxHeight?: number;
  /**
   * The minimum distance the arrow's edge should be from the edge of the overlay element.
   * @default 0
   */
  arrowBoundaryOffset?: number;
  /**
   * Overrides the target element's bounding rectangle. Useful for positioning relative to
   * a specific point such as the mouse cursor (e.g. context menus) or text selection.
   *
   * @default target.getBoundingClientRect()
   * @param target - The target element.
   */
  getTargetRect?: (target: Element) => DOMRect | null | undefined;
}

export interface PositionAria {
  /** Props for the overlay container element. */
  overlayProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the overlay tip arrow if any. */
  arrowProps: JSX.HTMLAttributes<HTMLElement>;
  /** Placement of the overlay with respect to the overlay trigger. */
  placement: () => PlacementAxis | null;
  /** The origin of the target in the overlay's coordinate system. Useful for animations. */
  triggerAnchorPoint: () => { x: number; y: number } | null;
  /** Updates the position of the overlay. */
  updatePosition: () => void;
}

const visualViewport = typeof document !== "undefined" ? window.visualViewport : null;

function translateRTL(position: string, direction: string): string {
  if (direction === "rtl") {
    return position.replace("start", "right").replace("end", "left");
  }
  return position.replace("start", "left").replace("end", "right");
}

/**
 * Handles positioning overlays like popovers and menus relative to a trigger
 * element, and updating the position when the window resizes.
 */
export function createOverlayPosition(props: AriaPositionProps): PositionAria {
  const locale = useLocale();
  const direction = () => locale().direction;

  const arrowSize = () => props.arrowSize ?? 0;
  const targetRef = () => props.targetRef();
  const overlayRef = () => props.overlayRef();
  const arrowRef = () => props.arrowRef?.() ?? null;
  const scrollRef = () => props.scrollRef?.() ?? overlayRef();
  const placement = () => (props.placement ?? "bottom") as Placement;
  const containerPadding = () => props.containerPadding ?? 12;
  const shouldFlip = () => props.shouldFlip ?? true;
  const boundaryElement = () =>
    props.boundaryElement ?? (typeof document !== "undefined" ? document.body : null);
  const offset = () => props.offset ?? 0;
  const crossOffset = () => props.crossOffset ?? 0;
  const shouldUpdatePosition = () => props.shouldUpdatePosition ?? true;
  const isOpen = () => props.isOpen ?? true;
  const onClose = () => props.onClose;
  const maxHeight = () => props.maxHeight;
  const arrowBoundaryOffset = () => props.arrowBoundaryOffset ?? 0;

  const [position, setPosition] = createSignal<PositionResult | null>(null);

  // Track the last scale to freeze overlay during pinch zoom
  let lastScale = visualViewport?.scale;

  createEffect(() => {
    if (isOpen()) {
      lastScale = visualViewport?.scale;
    }
  });

  const updatePosition = () => {
    const overlayNode = overlayRef();
    const targetNode = targetRef();
    const boundary = boundaryElement();

    if (!shouldUpdatePosition() || !isOpen() || !overlayNode || !targetNode || !boundary) {
      return;
    }

    if (visualViewport?.scale !== lastScale) {
      return;
    }

    const scrollNode = scrollRef();
    const arrowNode = arrowRef();

    // Reset overlay's previous max height
    const overlay = overlayNode as HTMLElement;
    if (!maxHeight() && overlayNode) {
      overlay.style.top = "0px";
      overlay.style.bottom = "";
      overlay.style.maxHeight = (window.visualViewport?.height ?? window.innerHeight) + "px";
    }

    const result = calculatePosition({
      placement: translateRTL(placement(), direction()) as Placement,
      overlayNode,
      targetNode,
      scrollNode: scrollNode || overlayNode,
      padding: containerPadding(),
      shouldFlip: shouldFlip(),
      boundaryElement: boundary,
      offset: offset(),
      crossOffset: crossOffset(),
      maxHeight: maxHeight(),
      arrowSize: arrowSize() ?? (arrowNode ? getRect(arrowNode, true).width : 0),
      arrowBoundaryOffset: arrowBoundaryOffset(),
      targetRect: props.getTargetRect?.(targetNode),
    });

    if (!result.position) {
      return;
    }

    // Apply styles directly for immediate positioning
    overlay.style.top = "";
    overlay.style.bottom = "";
    overlay.style.left = "";
    overlay.style.right = "";

    const pos = result.position as Record<string, number | undefined>;
    Object.keys(pos).forEach((key) => {
      overlay.style.setProperty(key, pos[key] + "px");
    });
    overlay.style.maxHeight = result.maxHeight != null ? result.maxHeight + "px" : "";

    setPosition(result);
  };

  // Update position when dependencies change
  createEffect(() => {
    // Track all dependencies
    shouldUpdatePosition();
    placement();
    overlayRef();
    targetRef();
    arrowRef();
    scrollRef();
    containerPadding();
    shouldFlip();
    boundaryElement();
    offset();
    crossOffset();
    isOpen();
    maxHeight();
    arrowBoundaryOffset();
    arrowSize();

    updatePosition();
  });

  // Update position on window resize
  createEffect(() => {
    if (!isOpen()) return;

    const handleResize = () => updatePosition();
    window.addEventListener("resize", handleResize, false);

    onCleanup(() => {
      window.removeEventListener("resize", handleResize, false);
    });
  });

  // Update position when overlay changes size using ResizeObserver
  createEffect(() => {
    const overlayNode = overlayRef();
    if (!overlayNode || !isOpen()) return;

    const resizeObserver = new ResizeObserver(() => updatePosition());
    resizeObserver.observe(overlayNode);

    onCleanup(() => {
      resizeObserver.disconnect();
    });
  });

  // Update position when target changes size
  createEffect(() => {
    const targetNode = targetRef();
    if (!targetNode || !isOpen()) return;

    const resizeObserver = new ResizeObserver(() => updatePosition());
    resizeObserver.observe(targetNode);

    onCleanup(() => {
      resizeObserver.disconnect();
    });
  });

  // Handle visual viewport resize (for iOS virtual keyboard)
  createEffect(() => {
    if (!isOpen()) return;

    let timeout: ReturnType<typeof setTimeout>;
    let isResizing = false;

    const onResize = () => {
      isResizing = true;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        isResizing = false;
      }, 500);
      updatePosition();
    };

    const onScroll = () => {
      if (isResizing) {
        onResize();
      }
    };

    visualViewport?.addEventListener("resize", onResize);
    visualViewport?.addEventListener("scroll", onScroll);

    onCleanup(() => {
      visualViewport?.removeEventListener("resize", onResize);
      visualViewport?.removeEventListener("scroll", onScroll);
      clearTimeout(timeout);
    });
  });

  // Close on scroll (when scrolling a parent of the trigger)
  createEffect(() => {
    const targetNode = targetRef();
    const closeHandler = onClose();
    if (!targetNode || !isOpen() || !closeHandler) return;

    const handleScroll = (e: Event) => {
      const target = e.target as Element;
      // Don't close if scrolling within the overlay
      if (overlayRef()?.contains(target)) return;
      // Close if scrolling a parent of the target (but not body/html)
      if (
        target !== document.body &&
        target !== document.documentElement &&
        target.contains(targetNode)
      ) {
        closeHandler();
      }
    };

    document.addEventListener("scroll", handleScroll, true);

    onCleanup(() => {
      document.removeEventListener("scroll", handleScroll, true);
    });
  });

  return {
    overlayProps: {
      get style(): JSX.CSSProperties {
        const current = position();
        return {
          position: current ? "absolute" : "fixed",
          top: !current ? 0 : undefined,
          left: !current ? 0 : undefined,
          "z-index": 100000,
          "max-height": current?.maxHeight ?? "100vh",
        } as JSX.CSSProperties;
      },
    },
    placement: () => position()?.placement ?? null,
    triggerAnchorPoint: () => position()?.triggerAnchorPoint ?? null,
    arrowProps: {
      "aria-hidden": "true",
      role: "presentation",
      get style(): JSX.CSSProperties {
        const current = position();
        return {
          left: current?.arrowOffsetLeft != null ? `${current.arrowOffsetLeft}px` : undefined,
          top: current?.arrowOffsetTop != null ? `${current.arrowOffsetTop}px` : undefined,
        };
      },
    },
    updatePosition,
  };
}

export { type Placement, type PlacementAxis } from "./calculatePosition";
