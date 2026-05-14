import { Accessor } from "solid-js";
import { createPress } from "../interactions";
import { createFocusable } from "../interactions";
import { mergeProps, filterDOMProps } from "../utils";
import type { AriaButtonProps, ButtonAria } from "./types";

function isDisabledValue(isDisabled: Accessor<boolean> | boolean | undefined): boolean {
  if (typeof isDisabled === "function") {
    return isDisabled();
  }
  return isDisabled ?? false;
}

/**
 * Provides the behavior and accessibility implementation for a button component.
 * Handles press interactions across mouse, touch, keyboard and screen readers.
 *
 * Based on react-aria's useButton but adapted for SolidJS.
 *
 * @example
 * ```tsx
 * import { createButton } from 'solidaria';
 *
 * function Button(props) {
 *   let ref;
 *   const { buttonProps, isPressed } = createButton(props);
 *
 *   return (
 *     <button
 *       {...buttonProps}
 *       ref={ref}
 *       class={isPressed() ? 'pressed' : ''}
 *     >
 *       {props.children}
 *     </button>
 *   );
 * }
 * ```
 */
export function createButton(props: AriaButtonProps = {}): ButtonAria {
  const elementType = props.elementType ?? "button";
  const isDisabled = () => isDisabledValue(props.isDisabled);

  const { pressProps, isPressed } = createPress({
    isDisabled,
    onPress: (event) => props.onPress?.(event),
    onPressStart: (event) => props.onPressStart?.(event),
    onPressEnd: (event) => props.onPressEnd?.(event),
    onPressUp: (event) => props.onPressUp?.(event),
    onPressChange: (pressed) => props.onPressChange?.(pressed),
    onClick: (event) => props.onClick?.(event),
    get preventFocusOnPress() {
      return props.preventFocusOnPress;
    },
  });

  const { focusableProps } = createFocusable({
    isDisabled,
    autoFocus: props.autoFocus,
    excludeFromTabOrder: props.excludeFromTabOrder,
  });

  const isNativeButton = elementType === "button";
  const isLink = elementType === "a";

  // Handle allowFocusWhenDisabled - set tabIndex to -1 when disabled but focusable
  // This allows tooltips to be shown on disabled buttons
  if (props.allowFocusWhenDisabled) {
    Object.defineProperty(focusableProps, "tabIndex", {
      enumerable: true,
      configurable: true,
      get() {
        return isDisabled() ? -1 : props.excludeFromTabOrder ? -1 : 0;
      },
    });
  }

  let additionalProps: Record<string, unknown> = {};

  if (isNativeButton) {
    additionalProps = {
      get type() {
        return props.type ?? "button";
      },
      get disabled() {
        return isDisabled();
      },
      get form() {
        return props.form;
      },
      get formAction() {
        return props.formAction;
      },
      get formEncType() {
        return props.formEncType;
      },
      get formMethod() {
        return props.formMethod;
      },
      get formNoValidate() {
        return props.formNoValidate;
      },
      get formTarget() {
        return props.formTarget;
      },
      get name() {
        return props.name;
      },
      get value() {
        return props.value;
      },
    };
  } else {
    // Non-native buttons need role; focusableProps supplies tabIndex.
    additionalProps = {
      role: "button",
      get href() {
        return isLink && !isDisabled() ? props.href : undefined;
      },
      get target() {
        return isLink ? props.target : undefined;
      },
      get type() {
        return elementType === "input" ? (props.type ?? "button") : undefined;
      },
      get disabled() {
        return elementType === "input" ? isDisabled() : undefined;
      },
      get "aria-disabled"() {
        return isDisabled() && elementType !== "input" ? true : undefined;
      },
      get rel() {
        return isLink ? props.rel : undefined;
      },
    };
  }

  const ariaProps: Record<string, unknown> = {
    get "aria-haspopup"() {
      return props["aria-haspopup"];
    },
    get "aria-expanded"() {
      return props["aria-expanded"];
    },
    get "aria-controls"() {
      return props["aria-controls"];
    },
    get "aria-pressed"() {
      return props["aria-pressed"];
    },
    get "aria-current"() {
      return props["aria-current"];
    },
    get "aria-disabled"() {
      return props["aria-disabled"];
    },
  };

  const buttonProps = mergeProps(
    additionalProps,
    focusableProps as Record<string, unknown>,
    pressProps as Record<string, unknown>,
    filterDOMProps(props as Record<string, unknown>, { labelable: true }),
    ariaProps,
  );

  return {
    buttonProps,
    isPressed,
  };
}
