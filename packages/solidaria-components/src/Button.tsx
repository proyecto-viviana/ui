/**
 * Button component for solidaria-components
 *
 * A pre-wired headless button that combines state + aria hooks.
 * Port of react-aria-components/src/Button.tsx
 */

import {
  type JSX,
  createContext,
  createEffect,
  createMemo,
  splitProps,
  useContext,
} from "solid-js";
import {
  announce,
  createButton,
  createFocusRing,
  createHover,
  createId,
  mergeProps,
  type AriaButtonProps,
  type HoverEvent,
  type PressEvent,
} from "@proyecto-viviana/solidaria";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  filterDOMProps,
} from "./utils";
import { DialogTriggerContext, PopoverTriggerContext } from "./contexts";
import { ProgressBarContext } from "./ProgressBar";

type RefLike<T> = ((el: T) => void) | { current?: T | null } | undefined;

function assignRef<T>(ref: RefLike<T>, el: T): void {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(el);
  } else {
    ref.current = el;
  }
}

function createLiveButtonRenderProps(values: () => ButtonRenderProps): ButtonRenderProps {
  return {
    get isHovered() {
      return values().isHovered;
    },
    get isPressed() {
      return values().isPressed;
    },
    get isFocused() {
      return values().isFocused;
    },
    get isFocusVisible() {
      return values().isFocusVisible;
    },
    get isDisabled() {
      return values().isDisabled;
    },
    get isPending() {
      return values().isPending;
    },
  };
}

function createLiveCustomRootProps(
  getProps: () => JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  getChildren: () => JSX.Element,
  ref: (el: HTMLButtonElement) => void,
): JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  const props = {} as JSX.ButtonHTMLAttributes<HTMLButtonElement>;
  const keys = new Set([...Object.keys(getProps()), "children", "ref"]);

  for (const key of keys) {
    Object.defineProperty(props, key, {
      enumerable: true,
      configurable: true,
      get() {
        if (key === "children") {
          return getChildren();
        }
        if (key === "ref") {
          return ref;
        }
        return (getProps() as Record<string, unknown>)[key];
      },
    });
  }

  return props;
}

export interface ButtonRenderProps {
  /** Whether the button is currently hovered with a mouse. */
  isHovered: boolean;
  /** Whether the button is currently in a pressed state. */
  isPressed: boolean;
  /** Whether the button is focused, either via a mouse or keyboard. */
  isFocused: boolean;
  /** Whether the button is keyboard focused. */
  isFocusVisible: boolean;
  /** Whether the button is disabled. */
  isDisabled: boolean;
  /** Whether the button is currently in a pending state. */
  isPending: boolean;
}

export interface ButtonProps extends Omit<AriaButtonProps, "children">, SlotProps {
  /** The children of the component. A function may be provided to receive render props. */
  children?: RenderChildren<ButtonRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ButtonRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ButtonRenderProps>;
  /** Custom renderer for the outer button element. */
  render?: (
    props: JSX.ButtonHTMLAttributes<HTMLButtonElement>,
    renderProps: ButtonRenderProps,
  ) => JSX.Element;
  /** Ref for the underlying button element. */
  ref?: RefLike<HTMLButtonElement>;
  /** Whether the button is in a pending state. */
  isPending?: boolean;
  /** Keeps pending buttons focusable by using aria-disabled without a native disabled attribute. */
  isPendingFocusable?: boolean;
  /** Handler called when hover starts. */
  onHoverStart?: (e: HoverEvent) => void;
  /** Handler called when hover ends. */
  onHoverEnd?: (e: HoverEvent) => void;
  /** Handler called when hover state changes. */
  onHoverChange?: (isHovered: boolean) => void;
}

export interface ButtonContextValue extends ButtonProps {
  slots?: Record<string, ButtonProps>;
}

export const ButtonContext = createContext<ButtonContextValue | null>(null);

/**
 * A button allows a user to perform an action.
 *
 * This is a headless component that provides accessibility and state management.
 * Style it using the render props pattern or data attributes.
 *
 * @example
 * ```tsx
 * <Button onPress={() => alert('Pressed!')}>
 *   {({ isPressed, isHovered }) => (
 *     <span class={isPressed ? 'bg-blue-700' : isHovered ? 'bg-blue-600' : 'bg-blue-500'}>
 *       Click me
 *     </span>
 *   )}
 * </Button>
 * ```
 */
export function Button(props: ButtonProps): JSX.Element {
  const contextProps = useContext(ButtonContext);
  const contextSlotProps = contextProps?.slots?.[props.slot ?? "default"];
  const contextBaseProps = createMemo<ButtonProps>(() => {
    if (!contextProps) return {};
    const { slots: _slots, ...rest } = contextProps;
    return rest;
  });
  const mergedProps = (
    contextProps ? mergeProps(contextBaseProps(), contextSlotProps ?? {}, props) : props
  ) as ButtonProps;

  const [local, ariaProps] = splitProps(mergedProps, [
    "children",
    "class",
    "style",
    "render",
    "ref",
    "slot",
    "isPending",
    "isPendingFocusable",
    "onHoverStart",
    "onHoverEnd",
    "onHoverChange",
  ]);

  // Check if inside a DialogTrigger or PopoverTrigger - if so, toggle on press
  // NOTE: Context is captured at component creation time. For Buttons inside a Modal,
  // the Modal provides OverlayTriggerStateContext, but due to SolidJS's eager JSX evaluation,
  // components inside Modal children are created before the Modal's Show renders.
  // So we can't reliably use context here to determine if we're inside a Modal.
  const dialogTriggerContext = useContext(DialogTriggerContext);
  const popoverTriggerContext = useContext(PopoverTriggerContext);

  // Helper to resolve isDisabled (handles both boolean and Accessor<boolean>)
  const resolveDisabled = (): boolean => {
    const disabled = ariaProps.isDisabled;
    if (typeof disabled === "function") {
      return disabled();
    }
    return !!disabled;
  };

  const resolvePending = (): boolean => !!local.isPending;
  const isPendingFocusable = () => local.isPendingFocusable !== false;

  let buttonEl: HTMLButtonElement | undefined;
  const buttonId = createId((ariaProps as Record<string, unknown>).id as string | undefined);
  const progressId = createId();

  // Explicit trigger ownership: a button toggles overlays only when it is the
  // registered trigger element for the surrounding trigger context.
  const isDialogTrigger = () =>
    !!dialogTriggerContext && !!buttonEl && dialogTriggerContext.triggerRef() === buttonEl;
  const isPopoverTrigger = () =>
    !!popoverTriggerContext && !!buttonEl && popoverTriggerContext.triggerRef() === buttonEl;

  const handlePress = (e: PressEvent) => {
    if (resolvePending()) {
      return;
    }
    if (typeof ariaProps.onPress === "function") {
      ariaProps.onPress(e);
    }
    // Toggle only when this exact button is the registered trigger element.
    if (isDialogTrigger()) {
      dialogTriggerContext!.state.toggle();
    }
    if (isPopoverTrigger()) {
      popoverTriggerContext!.state.toggle();
    }
  };

  const buttonAria = createButton({
    ...ariaProps,
    onPress: handlePress,
    get onPressStart() {
      return resolvePending() ? undefined : ariaProps.onPressStart;
    },
    get onPressEnd() {
      return resolvePending() ? undefined : ariaProps.onPressEnd;
    },
    get onPressUp() {
      return resolvePending() ? undefined : ariaProps.onPressUp;
    },
    get onPressChange() {
      return resolvePending() ? undefined : ariaProps.onPressChange;
    },
    get onClick() {
      return resolvePending() ? undefined : ariaProps.onClick;
    },
    get isDisabled() {
      return resolveDisabled() || resolvePending();
    },
  });

  const { isFocused, isFocusVisible, focusProps } = createFocusRing();

  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return resolveDisabled() || resolvePending();
    },
    onHoverStart: local.onHoverStart,
    onHoverEnd: local.onHoverEnd,
    onHoverChange: local.onHoverChange,
  });

  const renderValues = createMemo<ButtonRenderProps>(() => ({
    isHovered: isHovered(),
    isPressed: buttonAria.isPressed() && !resolvePending(),
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible(),
    isDisabled: resolveDisabled(),
    isPending: resolvePending(),
  }));

  const renderProps = useRenderProps(
    {
      // Use merged children so ButtonContext can supply slot/default content.
      get children() {
        return local.children;
      },
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Button",
    },
    renderValues,
  );

  // Remove onClick from DOM props - it's already handled by createPress
  // This matches React Aria Components behavior (Button.tsx line 144: delete DOMProps.onClick)
  const domProps = createMemo(() => {
    const filtered = filterDOMProps(ariaProps, { global: true });
    // onClick is handled by createPress, not passed directly to DOM
    delete (filtered as Record<string, unknown>).onClick;
    return filtered;
  });

  const buttonPropsRef = (buttonAria.buttonProps as Record<string, unknown>).ref as
    | ((el: HTMLElement) => void)
    | undefined;
  const focusPropsRef = (focusProps as Record<string, unknown>).ref as
    | ((el: HTMLElement) => void)
    | undefined;
  const hoverPropsRef = (hoverProps as Record<string, unknown>).ref as
    | ((el: HTMLElement) => void)
    | undefined;

  const cleanButtonProps = () => {
    const { ref: _ref1, ...rest } = buttonAria.buttonProps as Record<string, unknown>;
    return rest;
  };
  const cleanFocusProps = () => {
    const { ref: _ref2, ...rest } = focusProps as Record<string, unknown>;
    return rest;
  };
  const cleanHoverProps = () => {
    const { ref: _ref3, ...rest } = hoverProps as Record<string, unknown>;
    return rest;
  };
  const ariaLabelledBy = createMemo(() => {
    const labelledBy = cleanButtonProps()["aria-labelledby"] as string | undefined;
    if (!resolvePending()) {
      return labelledBy;
    }

    if (labelledBy) {
      return `${labelledBy} ${progressId}`;
    }

    if (cleanButtonProps()["aria-label"]) {
      return `${buttonId} ${progressId}`;
    }

    return labelledBy;
  });

  const handleRef = (el: HTMLButtonElement) => {
    buttonEl = el;
    assignRef(local.ref, el);

    buttonPropsRef?.(el);
    focusPropsRef?.(el);
    hoverPropsRef?.(el);

    // Register trigger ownership for surrounding trigger contexts.
    if (dialogTriggerContext?.setTriggerRef) {
      if (!el.id) {
        el.id = dialogTriggerContext.triggerId;
      }
      dialogTriggerContext.setTriggerRef(el);
    }
    if (popoverTriggerContext?.setTriggerRef) {
      popoverTriggerContext.setTriggerRef(el);
    }
  };
  const buttonType = () =>
    (buttonAria.buttonProps as Record<string, unknown>).type === "submit" && resolvePending()
      ? "button"
      : ((buttonAria.buttonProps as Record<string, unknown>).type as
          | "button"
          | "submit"
          | "reset"
          | undefined);
  const disablePendingInteractions = (props: Record<string, unknown>) => {
    if (!resolvePending()) {
      return props;
    }

    const next = { ...props };
    for (const key of Object.keys(next)) {
      if (key.startsWith("on") && !key.includes("Focus") && !key.includes("Blur")) {
        next[key] = undefined;
      }
    }
    next.href = undefined;
    next.target = undefined;
    return next;
  };
  const dataState = (value: boolean) => (value ? "true" : undefined);
  const buttonChildren = () => renderProps.renderChildren();
  const buttonContent = () => (
    <ProgressBarContext.Provider value={{ id: progressId }}>
      {buttonChildren()}
    </ProgressBarContext.Provider>
  );
  let wasPending = resolvePending();
  createEffect(() => {
    const pending = resolvePending();
    const message = { "aria-labelledby": ariaLabelledBy() || buttonId };

    if (!wasPending && isFocused() && pending) {
      announce(message, "assertive");
    } else if (wasPending && isFocused() && !pending) {
      announce(message, "assertive");
    }

    wasPending = pending;
  });
  const rootProps = () =>
    ({
      ...domProps(),
      ...disablePendingInteractions(cleanButtonProps()),
      ...cleanFocusProps(),
      ...cleanHoverProps(),
      type: buttonType(),
      id: buttonId,
      class: renderProps.class(),
      style: renderProps.style(),
      slot: local.slot,
      disabled: resolvePending() && isPendingFocusable() ? undefined : cleanButtonProps().disabled,
      "aria-labelledby": ariaLabelledBy(),
      "aria-disabled": resolvePending()
        ? "true"
        : (cleanButtonProps()["aria-disabled"] ?? ariaProps["aria-disabled"]),
      "data-pressed": dataState(buttonAria.isPressed() && !resolvePending()),
      "data-hovered": dataState(isHovered()),
      "data-focused": dataState(isFocused()),
      "data-focus-visible": dataState(isFocusVisible()),
      "data-disabled": dataState(resolveDisabled()),
      "data-pending": dataState(resolvePending()),
    }) as JSX.ButtonHTMLAttributes<HTMLButtonElement>;
  const customRootProps = createLiveCustomRootProps(rootProps, buttonContent, handleRef);
  const customRenderValues = createLiveButtonRenderProps(renderValues);

  return local.render ? (
    local.render(customRootProps, customRenderValues)
  ) : (
    <button
      ref={handleRef}
      {...rootProps()}
      class={renderProps.class()}
      style={renderProps.style()}
      attr:data-pressed={(rootProps() as Record<string, unknown>)["data-pressed"] as string}
      attr:data-hovered={(rootProps() as Record<string, unknown>)["data-hovered"] as string}
      attr:data-focused={(rootProps() as Record<string, unknown>)["data-focused"] as string}
      attr:data-focus-visible={
        (rootProps() as Record<string, unknown>)["data-focus-visible"] as string
      }
      attr:data-disabled={(rootProps() as Record<string, unknown>)["data-disabled"] as string}
      attr:data-pending={(rootProps() as Record<string, unknown>)["data-pending"] as string}
    >
      {buttonContent()}
    </button>
  );
}
