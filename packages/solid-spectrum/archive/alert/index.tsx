import type { JSX } from "solid-js";
import { Show } from "solid-js";
import {
  Alert as HeadlessAlert,
  AlertDismissButton,
  type AlertRenderProps,
  type AlertVariant,
} from "@proyecto-viviana/solidaria-components";

export type { AlertVariant };

export interface AlertProps {
  children: JSX.Element;
  variant?: AlertVariant;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  class?: string;
}

const variantStyles: Record<AlertVariant, string> = {
  info: "bg-primary-700 text-primary-200 border border-primary-500",
  success: "bg-success-600 text-on-color border border-success-400",
  warning: "bg-warning-600 text-warning-100 border border-warning-400",
  error: "bg-danger-600 text-on-color border border-danger-400",
};

export function Alert(props: AlertProps) {
  const variant = () => props.variant ?? "info";

  const getClassName = (_renderProps: AlertRenderProps): string => {
    return `flex items-center min-h-[50px] font-normal rounded-lg px-4 py-2 ${variantStyles[variant()]} ${props.class ?? ""}`;
  };

  return (
    <HeadlessAlert
      variant={variant()}
      isDismissible={props.dismissible}
      onDismiss={props.onDismiss}
      class={getClassName}
    >
      <div class="flex items-center gap-3 flex-1">
        <Show when={props.title}>
          <span class="font-semibold font-jost">{props.title}</span>
          <span class="opacity-50">|</span>
        </Show>
        <div class="flex-1">{props.children}</div>
        <Show when={props.dismissible}>
          <AlertDismissButton class="hover:opacity-70 transition-opacity ml-2" aria-label="Dismiss">
            ✕
          </AlertDismissButton>
        </Show>
      </div>
    </HeadlessAlert>
  );
}
