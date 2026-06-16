/**
 * createToast hook for Solidaria
 *
 * Provides the accessibility implementation for a Toast component.
 *
 * Port of @react-aria/toast useToast.
 */

import { type JSX, createMemo } from "solid-js";
import { type QueuedToast, type ToastState } from "@proyecto-viviana/solid-stately";
import { createId } from "../ssr";

export interface AriaToastProps<T> {
  /** The toast to display. */
  toast: QueuedToast<T>;
  /** The toast state from createToastState. */
  state: ToastState<T>;
  /** Whether the rendered toast includes a title element. */
  hasTitle?: boolean;
  /** Whether the rendered toast includes a description element. */
  hasDescription?: boolean;
}

export interface ToastAria {
  /** Props for the toast container element. */
  toastProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the toast content element (contains the message). */
  contentProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the toast title element. */
  titleProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the toast description element. */
  descriptionProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the close button. */
  closeButtonProps: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
}

/**
 * Provides the accessibility implementation for a Toast component.
 *
 * The toast uses role="alertdialog" to announce content to screen readers.
 * The content area uses role="alert" for the actual message.
 *
 * @example
 * ```tsx
 * import { createToast } from 'solidaria';
 *
 * function Toast(props) {
 *   const {
 *     toastProps,
 *     contentProps,
 *     titleProps,
 *     closeButtonProps
 *   } = createToast({ toast: props.toast, state: props.state });
 *
 *   return (
 *     <div {...toastProps}>
 *       <div {...contentProps}>
 *         <div {...titleProps}>{props.toast.content.title}</div>
 *       </div>
 *       <button {...closeButtonProps}>×</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function createToast<T>(props: AriaToastProps<T>): ToastAria {
  const titleId = createId();
  const descriptionId = createId();
  const hasTitle = props.hasTitle ?? true;
  const hasDescription = props.hasDescription ?? true;

  const close = () => {
    props.state.close(props.toast.key);
  };

  // Toast container - role="alertdialog" for screen readers
  const toastProps = createMemo<JSX.HTMLAttributes<HTMLElement>>(() => ({
    role: "alertdialog",
    "aria-modal": "false",
    "aria-labelledby": hasTitle ? titleId : undefined,
    "aria-describedby": hasDescription ? descriptionId : undefined,
    tabIndex: 0,
    "data-animation": props.toast.animation,
    "data-key": props.toast.key,
  }));

  // Content area with role="alert" for immediate announcement
  const contentProps = createMemo<JSX.HTMLAttributes<HTMLElement>>(() => ({
    role: "alert",
    "aria-atomic": "true",
    "aria-live": "assertive",
  }));

  // Title props
  const titleProps = createMemo<JSX.HTMLAttributes<HTMLElement>>(() => ({
    id: titleId,
  }));

  // Description props
  const descriptionProps = createMemo<JSX.HTMLAttributes<HTMLElement>>(() => ({
    id: descriptionId,
  }));

  // Close button
  const closeButtonProps = createMemo<JSX.ButtonHTMLAttributes<HTMLButtonElement>>(() => ({
    "aria-label": "Close",
    onClick: close,
  }));

  return {
    get toastProps() {
      return toastProps();
    },
    get contentProps() {
      return contentProps();
    },
    get titleProps() {
      return titleProps();
    },
    get descriptionProps() {
      return descriptionProps();
    },
    get closeButtonProps() {
      return closeButtonProps();
    },
  };
}
