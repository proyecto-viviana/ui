/**
 * Alert component for solidaria-components
 *
 * Minimal headless Alert that owns ARIA semantics (role="alert")
 * and provides render props for styling. The UI layer consumes this
 * for styling/composition only.
 *
 * This is a local Solid component. The pinned React Aria Components source
 * has no Alert counterpart.
 */

import { type JSX, createContext, createMemo, splitProps, useContext } from "solid-js";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  filterDOMProps,
} from "./utils";
import { Button, type ButtonProps } from "./Button";

export type AlertVariant = "info" | "success" | "warning" | "error";

export interface AlertRenderProps {
  /** The variant of the alert. */
  variant: AlertVariant;
  /** Whether the alert can be dismissed. */
  isDismissible: boolean;
}

export interface AlertProps extends SlotProps {
  /** The variant of the alert. */
  variant?: AlertVariant;
  /** Whether the alert can be dismissed. */
  isDismissible?: boolean;
  /** Handler called when the alert is dismissed. */
  onDismiss?: () => void;
  /** The children of the component. A function may be provided to receive render props. */
  children?: RenderChildren<AlertRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<AlertRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<AlertRenderProps>;
  /** The id of the element. */
  id?: string;
}

export interface AlertContextValue {
  variant: () => AlertVariant;
  isDismissible: () => boolean;
  onDismiss?: () => void;
}

export const AlertContext = createContext<AlertContextValue | null>(null);

/**
 * An alert displays a brief, important message in a way that
 * attracts the user's attention without interrupting their task.
 *
 * This is a headless component that provides the ARIA `role="alert"`
 * semantics and render props for styling.
 *
 * @example
 * ```tsx
 * <Alert variant="error" isDismissible onDismiss={() => setVisible(false)}>
 *   {({ variant }) => <span>Something went wrong ({variant})</span>}
 * </Alert>
 * ```
 */
export function Alert(props: AlertProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    "children",
    "class",
    "style",
    "slot",
    "variant",
    "isDismissible",
    "onDismiss",
  ]);

  const variant = () => local.variant ?? "info";
  const isDismissible = () => !!local.isDismissible;

  const renderValues = createMemo<AlertRenderProps>(() => ({
    variant: variant(),
    isDismissible: isDismissible(),
  }));

  // Resolve class and style manually. We intentionally avoid useRenderProps()
  // because it destructures children eagerly, which would create child
  // components (e.g. AlertDismissButton) BEFORE the AlertContext.Provider
  // is in scope, breaking context for sub-components.
  const computedClass = createMemo(() => {
    const cls = local.class;
    return typeof cls === "function" ? cls(renderValues()) : (cls ?? "solidaria-Alert");
  });

  const computedStyle = createMemo(() => {
    const s = local.style;
    return typeof s === "function" ? s(renderValues()) : s;
  });

  const domProps = createMemo(() => filterDOMProps(rest, { global: true }));

  const contextValue: AlertContextValue = {
    variant,
    isDismissible,
    onDismiss: local.onDismiss,
  };

  // Children are accessed lazily inside the Provider scope (via local.children
  // in JSX) so sub-components like AlertDismissButton can read AlertContext.
  return (
    <AlertContext.Provider value={contextValue}>
      <div
        {...domProps()}
        role="alert"
        class={computedClass()}
        style={computedStyle()}
        data-variant={variant()}
        data-dismissible={isDismissible() || undefined}
      >
        {typeof local.children === "function"
          ? (local.children as (props: AlertRenderProps) => JSX.Element)(renderValues())
          : local.children}
      </div>
    </AlertContext.Provider>
  );
}

export interface AlertDismissButtonProps extends Omit<ButtonProps, "onPress"> {}

/**
 * A dismiss button for use inside an Alert.
 * Uses the headless Button for full keyboard/a11y support.
 *
 * @example
 * ```tsx
 * <Alert isDismissible onDismiss={handleDismiss}>
 *   <span>Alert content</span>
 *   <AlertDismissButton aria-label="Dismiss">X</AlertDismissButton>
 * </Alert>
 * ```
 */
export function AlertDismissButton(props: AlertDismissButtonProps): JSX.Element {
  const context = useContext(AlertContext);

  return (
    <Button
      {...props}
      aria-label={props["aria-label"] ?? "Dismiss"}
      onPress={() => context?.onDismiss?.()}
    />
  );
}
