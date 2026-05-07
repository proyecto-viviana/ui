/**
 * Popover component for solidaria-components
 *
 * A headless popover component that positions relative to a trigger element.
 * Port of react-aria-components Popover.
 */

import {
  type JSX,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  onCleanup,
  splitProps,
  useContext,
  Show,
} from "solid-js";
import { Portal, isServer } from "solid-js/web";
import {
  createOverlayTrigger,
  createPopover,
  FocusScope,
  useUNSAFE_PortalContext,
  type Placement,
  type PlacementAxis,
} from "@proyecto-viviana/solidaria";
import { createOverlayTriggerState } from "@proyecto-viviana/solid-stately";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  filterDOMProps,
  dataAttr,
} from "./utils";
import { PopoverTriggerContext } from "./contexts";

export interface PopoverRenderProps {
  /**
   * The name of the component that triggered the popover.
   */
  trigger: string | null;
  /**
   * The placement of the popover relative to the trigger.
   */
  placement: PlacementAxis | null;
  /**
   * Whether the popover is currently entering (for animations).
   */
  isEntering: boolean;
  /**
   * Whether the popover is currently exiting (for animations).
   */
  isExiting: boolean;
}

export interface PopoverProps extends SlotProps {
  /** The children of the component - can be JSX or render function. */
  children?: RenderChildren<PopoverRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<PopoverRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<PopoverRenderProps>;
  /**
   * The name of the component that triggered the popover.
   */
  trigger?: string;
  /**
   * The ref for the element which the popover positions itself with respect to.
   * Required when used standalone (not within a trigger component).
   */
  triggerRef?: () => Element | null;
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
   * @default 8
   */
  offset?: number;
  /**
   * The additional offset applied along the cross axis between the element and its
   * anchor element.
   * @default 0
   */
  crossOffset?: number;
  /**
   * Whether the element should flip its orientation when there is insufficient room.
   * @default true
   */
  shouldFlip?: boolean;
  /**
   * Whether the popover is non-modal (allows interaction outside).
   */
  isNonModal?: boolean;
  /**
   * Whether pressing Escape to close should be disabled.
   */
  isKeyboardDismissDisabled?: boolean;
  /**
   * Filter for which outside interactions should close the popover.
   */
  shouldCloseOnInteractOutside?: (element: Element) => boolean;
  /** Whether the popover is open (controlled). */
  isOpen?: boolean;
  /** Whether the popover opens by default (uncontrolled). */
  defaultOpen?: boolean;
  /** Handler called when the popover's open state changes. */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Whether focus should move to the popover container on open.
   * @default true
   */
  autoFocus?: boolean;
  /** Whether the popover is entering (for animations). */
  isEntering?: boolean;
  /** Whether the popover is exiting (for animations). */
  isExiting?: boolean;
}

export interface PopoverTriggerProps {
  /** The children - should include a trigger and popover content. */
  children: JSX.Element;
  /** Whether the popover is open (controlled). */
  isOpen?: boolean;
  /** Whether the popover is open by default (uncontrolled). */
  defaultOpen?: boolean;
  /** Callback when open state changes. */
  onOpenChange?: (isOpen: boolean) => void;
}

export {
  PopoverTriggerContext,
  usePopoverTrigger,
  type PopoverTriggerContextValue,
} from "./contexts";

interface PopoverContextValue {
  placement: () => PlacementAxis | null;
  arrowProps: () => JSX.HTMLAttributes<HTMLElement>;
}

export const PopoverContext = createContext<PopoverContextValue | null>(null);
const PopoverGroupContext = createContext<(() => HTMLElement | null) | null>(null);

/**
 * A PopoverTrigger opens a popover when a trigger element is pressed.
 * Children should include a trigger element (e.g. Button) and the Popover.
 */
export function PopoverTrigger(props: PopoverTriggerProps): JSX.Element {
  const [local] = splitProps(props, ["isOpen", "defaultOpen", "onOpenChange"]);

  const state = createOverlayTriggerState({
    get isOpen() {
      return local.isOpen;
    },
    get defaultOpen() {
      return local.defaultOpen;
    },
    onOpenChange: local.onOpenChange,
  });

  let triggerRef: HTMLElement | null = null;
  const triggerId = createUniqueId();

  createOverlayTrigger({ type: "dialog" }, state, () => triggerRef);

  const contextValue = createMemo(() => ({
    state: {
      isOpen: () => state.isOpen(),
      open: () => state.open(),
      close: () => state.close(),
      toggle: () => state.toggle(),
    },
    triggerRef: () => triggerRef,
    setTriggerRef: (el: HTMLElement | null) => {
      if (!el) return;
      if (!triggerRef || !triggerRef.isConnected) {
        triggerRef = el;
      }
    },
    triggerId,
    trigger: "PopoverTrigger",
  }));

  return (
    <PopoverTriggerContext.Provider value={contextValue()}>
      {props.children}
    </PopoverTriggerContext.Provider>
  );
}

/**
 * A popover is an overlay element positioned relative to a trigger.
 */
export function Popover(props: PopoverProps): JSX.Element {
  if (isServer) {
    // On the server, return null - popovers should not render during SSR
    return null as unknown as JSX.Element;
  }

  const [local, rest] = splitProps(props, [
    "class",
    "style",
    "trigger",
    "triggerRef",
    "placement",
    "containerPadding",
    "offset",
    "crossOffset",
    "shouldFlip",
    "isNonModal",
    "isKeyboardDismissDisabled",
    "shouldCloseOnInteractOutside",
    "isOpen",
    "defaultOpen",
    "onOpenChange",
    "autoFocus",
    "isEntering",
    "isExiting",
  ]);

  let popoverRef!: HTMLDivElement;
  const [groupRef, setGroupRef] = createSignal<HTMLDivElement | null>(null);

  const triggerContext = useContext(PopoverTriggerContext);
  const popoverGroupContext = useContext(PopoverGroupContext);
  const resolvedTrigger = () => local.trigger ?? triggerContext?.trigger;
  const isSubPopover = () => resolvedTrigger() === "SubmenuTrigger" && popoverGroupContext != null;

  const [internalOpen, setInternalOpen] = createSignal(local.defaultOpen ?? false);

  const isOpen = (): boolean => {
    if (local.isOpen !== undefined) return local.isOpen;
    if (triggerContext) {
      return triggerContext.state.isOpen();
    }
    return internalOpen();
  };

  const close = () => {
    if (local.isOpen !== undefined) {
      local.onOpenChange?.(false);
    } else if (triggerContext) {
      triggerContext.state.close();
      local.onOpenChange?.(false);
    } else {
      setInternalOpen(false);
      local.onOpenChange?.(false);
    }
  };

  const getTriggerRef = () => {
    if (local.triggerRef) return local.triggerRef();
    if (triggerContext) return triggerContext.triggerRef();
    return null;
  };

  const popoverAria = createPopover(
    {
      triggerRef: getTriggerRef,
      popoverRef: () => popoverRef ?? null,
      groupRef: () => (isSubPopover() ? (popoverGroupContext?.() ?? null) : groupRef()),
      get placement() {
        return local.placement;
      },
      get containerPadding() {
        return local.containerPadding;
      },
      get offset() {
        return local.offset ?? 8;
      },
      get crossOffset() {
        return local.crossOffset;
      },
      get shouldFlip() {
        return local.shouldFlip;
      },
      get isNonModal() {
        return local.isNonModal;
      },
      get isKeyboardDismissDisabled() {
        return local.isKeyboardDismissDisabled;
      },
      get shouldCloseOnInteractOutside() {
        return local.shouldCloseOnInteractOutside;
      },
      get trigger() {
        return resolvedTrigger();
      },
    },
    {
      isOpen,
      open: () => {
        if (local.isOpen !== undefined) {
          local.onOpenChange?.(true);
        } else if (triggerContext) {
          triggerContext.state.open();
          local.onOpenChange?.(true);
        } else {
          setInternalOpen(true);
          local.onOpenChange?.(true);
        }
      },
      close,
      toggle: () => {
        if (isOpen()) close();
        else if (local.isOpen !== undefined) {
          local.onOpenChange?.(true);
        } else if (triggerContext) {
          triggerContext.state.toggle();
        } else {
          setInternalOpen(true);
          local.onOpenChange?.(true);
        }
      },
    },
  );

  const renderValues = createMemo<PopoverRenderProps>(() => ({
    trigger: resolvedTrigger() ?? null,
    placement: popoverAria.placement(),
    isEntering: local.isEntering ?? false,
    isExiting: local.isExiting ?? false,
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Popover",
    },
    renderValues,
  );

  const [triggerWidth, setTriggerWidth] = createSignal<string | undefined>();
  const hasExplicitTriggerWidth = () => {
    const style = renderProps.style() as (JSX.CSSProperties & Record<string, unknown>) | undefined;
    return style?.["--trigger-width"] != null;
  };
  const updateTriggerWidth = () => {
    const trigger = getTriggerRef();
    if (!trigger || hasExplicitTriggerWidth()) return;
    setTriggerWidth(`${trigger.getBoundingClientRect().width}px`);
  };
  createEffect(() => {
    if (!isOpen()) return;
    updateTriggerWidth();

    const trigger = getTriggerRef();
    if (!trigger || hasExplicitTriggerWidth() || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(updateTriggerWidth);
    observer.observe(trigger);
    onCleanup(() => observer.disconnect());
  });

  const domProps = createMemo(() =>
    filterDOMProps(rest as Record<string, unknown>, { global: true }),
  );

  const cleanPopoverProps = () => {
    const {
      style: _style,
      ref: _ref,
      ...remaining
    } = popoverAria.popoverProps as Record<string, unknown>;
    return remaining;
  };

  const mergedStyle = (): JSX.CSSProperties => {
    const ariaStyle = (popoverAria.popoverProps as Record<string, unknown>).style as
      | JSX.CSSProperties
      | undefined;
    const renderStyle = (renderProps.style() || {}) as JSX.CSSProperties & Record<string, unknown>;
    return {
      ...ariaStyle,
      ...renderStyle,
      "--trigger-width": renderStyle["--trigger-width"] ?? triggerWidth(),
    };
  };

  const shouldBeDialog = () => !local.isNonModal || resolvedTrigger() === "SubmenuTrigger";
  const portalContext = useUNSAFE_PortalContext();
  const portalContainer = () => {
    if (isSubPopover()) {
      return popoverGroupContext?.() ?? portalContext.getContainer?.() ?? undefined;
    }
    return portalContext.getContainer?.() ?? undefined;
  };

  // Ensure Escape handling works even when popover content has no focusable children.
  createEffect(() => {
    if (!isOpen() || !shouldBeDialog()) return;
    if ((local.autoFocus ?? true) === false) return;
    if (!popoverRef) return;
    if (resolvedTrigger() === "SubmenuTrigger") return;
    if (document.activeElement !== popoverRef) {
      popoverRef.focus();
    }
  });

  // Fallback Escape handling for environments where focus is not moved into the popover.
  createEffect(() => {
    if (!isOpen()) return;
    if (local.isKeyboardDismissDisabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (event.defaultPrevented) return;
      close();
    };

    document.addEventListener("keydown", onKeyDown);
    onCleanup(() => document.removeEventListener("keydown", onKeyDown));
  });

  const overlay = () => (
    <PopoverContext.Provider
      value={{ placement: popoverAria.placement, arrowProps: () => popoverAria.arrowProps }}
    >
      <FocusScope contain={shouldBeDialog()} restoreFocus autoFocus={local.autoFocus ?? true}>
        <div
          {...domProps()}
          {...cleanPopoverProps()}
          ref={popoverRef}
          role={shouldBeDialog() ? "dialog" : undefined}
          tabIndex={shouldBeDialog() ? -1 : undefined}
          class={renderProps.class()}
          style={mergedStyle()}
          data-trigger={resolvedTrigger()}
          data-placement={popoverAria.placement()}
          data-entering={dataAttr(local.isEntering)}
          data-exiting={dataAttr(local.isExiting)}
        >
          {renderProps.renderChildren()}
        </div>
      </FocusScope>
    </PopoverContext.Provider>
  );

  return (
    <Show when={isOpen() || local.isExiting}>
      <Portal mount={portalContainer()}>
        <Show
          when={isSubPopover()}
          fallback={
            <div ref={setGroupRef} style={{ display: "contents" }}>
              <PopoverGroupContext.Provider value={() => groupRef()}>
                {overlay()}
              </PopoverGroupContext.Provider>
            </div>
          }
        >
          {overlay()}
        </Show>
      </Portal>
    </Show>
  );
}

export interface OverlayArrowProps {
  /** The children - should be an SVG or element for the arrow. */
  children?: JSX.Element | ((placement: PlacementAxis | null) => JSX.Element);
  /** The CSS className. */
  class?: string;
  /** The inline style. */
  style?: JSX.CSSProperties;
}

/**
 * An arrow element that points towards the trigger.
 */
export function OverlayArrow(props: OverlayArrowProps): JSX.Element {
  const popoverContext = useContext(PopoverContext);
  const placement = () => popoverContext?.placement() ?? null;

  const cleanArrowProps = () => {
    const contextArrowProps = popoverContext?.arrowProps() as Record<string, unknown> | undefined;
    if (!contextArrowProps) return {};
    const { style: _style, ref: _ref, ...rest } = contextArrowProps;
    return rest;
  };

  const mergedStyle = () => {
    const contextStyle = (popoverContext?.arrowProps() as Record<string, unknown> | undefined)
      ?.style as JSX.CSSProperties | undefined;
    return {
      ...contextStyle,
      ...props.style,
    };
  };

  const resolveChildren = () => {
    const children = props.children;
    if (typeof children === "function") {
      return children(placement());
    }
    return children;
  };

  return (
    <div
      {...cleanArrowProps()}
      class={props.class}
      style={mergedStyle()}
      data-placement={placement()}
      aria-hidden="true"
      role="presentation"
    >
      {resolveChildren()}
    </div>
  );
}

export default Popover;
