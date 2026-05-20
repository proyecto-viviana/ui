import { Accessor } from "solid-js";
import { PressEvent } from "../interactions";

export interface AriaButtonProps {
  /** The element's unique identifier. */
  id?: string | number;
  /** Whether the button is disabled. */
  isDisabled?: Accessor<boolean> | boolean;
  /** Handler called when the press is released over the target. */
  onPress?: (e: PressEvent) => void;
  /** Handler called when a press interaction starts. */
  onPressStart?: (e: PressEvent) => void;
  /** Handler called when a press interaction ends. */
  onPressEnd?: (e: PressEvent) => void;
  /** Handler called when a press is released over the target. */
  onPressUp?: (e: PressEvent) => void;
  /** Handler called when the press state changes. */
  onPressChange?: (isPressed: boolean) => void;
  /**
   * A native click handler, useful for form submission.
   * Note: `onPress` is preferred for cross-device compatibility.
   */
  onClick?: (e: MouseEvent) => void;
  /** Whether the button should not receive focus on press. */
  preventFocusOnPress?: boolean;
  /**
   * Whether to allow focus on the button when it is disabled.
   * This enables showing tooltips on disabled buttons.
   * When true, the button gets `tabIndex=-1` instead of being removed from tab order.
   */
  allowFocusWhenDisabled?: boolean;
  /** Whether the element should receive focus on render. */
  autoFocus?: boolean;
  /** The HTML element type to use for the button. */
  elementType?: "button" | "a" | "div" | "input" | "span";
  /** The URL to link to (for anchor elements). */
  href?: string;
  /** The target for the link (for anchor elements). */
  target?: string;
  /** The rel attribute for the link (for anchor elements). */
  rel?: string;
  /** The type attribute for button elements. */
  type?: "button" | "submit" | "reset";
  /** Whether the button is in a pressed state (controlled). */
  "aria-pressed"?: boolean | "true" | "false" | "mixed";
  /** Whether the button has a popup. */
  "aria-haspopup"?: boolean | "menu" | "listbox" | "tree" | "grid" | "dialog" | "true" | "false";
  /** Whether the popup is expanded. */
  "aria-expanded"?: boolean | "true" | "false";
  /** The accessible label for the button. */
  "aria-label"?: string;
  /** The id of the element that labels the button. */
  "aria-labelledby"?: string;
  /** The id of the element that describes the button. */
  "aria-describedby"?: string;
  /** The id of the element that provides detailed, extended description for the button. */
  "aria-details"?: string;
  /** Identifies the element (or elements) whose contents or presence are controlled by the button. */
  "aria-controls"?: string;
  /** Indicates the current "pressed" state of toggle buttons. */
  "aria-current"?: boolean | "page" | "step" | "location" | "date" | "time" | "true" | "false";
  /** Indicates that the button is perceivable but disabled. */
  "aria-disabled"?: boolean | "true" | "false";
  /** Additional attributes for form buttons. */
  form?: string;
  formAction?: string;
  formEncType?: string;
  formMethod?: string;
  formNoValidate?: boolean;
  formTarget?: string;
  /** The name attribute for form buttons. */
  name?: string;
  /** The value attribute for form buttons. */
  value?: string;
  /** Whether to exclude the button from the tab order. */
  excludeFromTabOrder?: boolean;
}

export interface ButtonAria {
  /** Props to spread on the button element. */
  buttonProps: Record<string, unknown>;
  /** Whether the button is currently pressed. */
  isPressed: Accessor<boolean>;
}
