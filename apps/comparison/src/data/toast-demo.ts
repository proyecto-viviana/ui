import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const toastVariantOptions = ["neutral", "positive", "negative", "info"] as const;
export const toastPlacementOptions = ["top", "top end", "bottom", "bottom end"] as const;

export type ToastDemoVariant = (typeof toastVariantOptions)[number];
export type ToastDemoPlacement = (typeof toastPlacementOptions)[number];

export interface ToastDemoProps {
  children: string;
  variant: ToastDemoVariant;
  placement: ToastDemoPlacement;
  count: number;
  actionLabel: string;
  showAction: boolean;
  shouldCloseOnAction: boolean;
  autoDismiss: boolean;
  timeout: number;
  "aria-label": string;
}

export const toastDemoDefaults: ToastDemoProps = {
  children: "Toast available",
  variant: "neutral",
  placement: "bottom",
  count: 1,
  actionLabel: "Undo",
  showAction: false,
  shouldCloseOnAction: true,
  autoDismiss: false,
  timeout: 5000,
  "aria-label": "Notifications",
};

function isOneOf<T extends readonly string[]>(
  value: string | null | undefined,
  options: T,
): value is T[number] {
  return value != null && options.includes(value);
}

function booleanParam(value: string | boolean | number | null | undefined) {
  return value === true || value === "true" || value === "on" || value === "1" || value === 1;
}

function numberParam(value: string | number | null | undefined, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeToastDemoProps(
  props: Partial<Record<keyof ToastDemoProps, unknown>>,
): ToastDemoProps {
  const variant = String(props.variant ?? "");
  const placement = String(props.placement ?? "");
  const children = typeof props.children === "string" ? props.children.trim() : "";
  const actionLabel = typeof props.actionLabel === "string" ? props.actionLabel.trim() : "";
  const ariaLabel = typeof props["aria-label"] === "string" ? props["aria-label"].trim() : "";

  return {
    children: children || toastDemoDefaults.children,
    variant: isOneOf(variant, toastVariantOptions) ? variant : toastDemoDefaults.variant,
    placement: isOneOf(placement, toastPlacementOptions) ? placement : toastDemoDefaults.placement,
    count: Math.min(
      Math.max(
        Math.trunc(
          numberParam(props.count as string | number | null | undefined, toastDemoDefaults.count),
        ),
        1,
      ),
      4,
    ),
    actionLabel: actionLabel || toastDemoDefaults.actionLabel,
    showAction: booleanParam(props.showAction as string | boolean | number | null | undefined),
    shouldCloseOnAction:
      props.shouldCloseOnAction == null
        ? toastDemoDefaults.shouldCloseOnAction
        : booleanParam(props.shouldCloseOnAction as string | boolean | number | null | undefined),
    autoDismiss: booleanParam(props.autoDismiss as string | boolean | number | null | undefined),
    timeout: numberParam(
      props.timeout as string | number | null | undefined,
      toastDemoDefaults.timeout,
    ),
    "aria-label": ariaLabel || toastDemoDefaults["aria-label"],
  };
}

export function toastDemoPropsFromSearch(search: string): ToastDemoProps {
  const params = new URLSearchParams(search);

  return normalizeToastDemoProps({
    children: params.get("children") ?? undefined,
    variant: params.get("variant") ?? undefined,
    placement: params.get("placement") ?? undefined,
    count: params.get("count") ?? undefined,
    actionLabel: params.get("actionLabel") ?? undefined,
    showAction: params.get("showAction") ?? undefined,
    shouldCloseOnAction: params.has("shouldCloseOnAction")
      ? params.get("shouldCloseOnAction")
      : toastDemoDefaults.shouldCloseOnAction,
    autoDismiss: params.get("autoDismiss") ?? undefined,
    timeout: params.get("timeout") ?? undefined,
    "aria-label": params.get("aria-label") ?? undefined,
  });
}

export function toastDemoPropsFromDocument(): ToastDemoProps | null {
  if (typeof document === "undefined") {
    return null;
  }

  const form = document.querySelector<HTMLFormElement>('[data-comparison-controls="toast"]');
  if (!form) {
    return null;
  }

  const data = new FormData(form);
  return normalizeToastDemoProps({
    children: data.get("children") ?? toastDemoDefaults.children,
    variant: data.get("variant") ?? toastDemoDefaults.variant,
    placement: data.get("placement") ?? toastDemoDefaults.placement,
    count: data.get("count") ?? toastDemoDefaults.count,
    actionLabel: data.get("actionLabel") ?? toastDemoDefaults.actionLabel,
    showAction: data.get("showAction") === "on",
    shouldCloseOnAction: data.get("shouldCloseOnAction") === "on",
    autoDismiss: data.get("autoDismiss") === "on",
    timeout: data.get("timeout") ?? toastDemoDefaults.timeout,
    "aria-label": data.get("aria-label") ?? toastDemoDefaults["aria-label"],
  });
}

export function toastDemoPropsFromWindow(): ToastDemoProps {
  if (typeof window === "undefined") {
    return toastDemoDefaults;
  }

  const formProps = toastDemoPropsFromDocument();
  if (formProps) {
    return formProps;
  }

  return toastDemoPropsFromSearch(window.location.search);
}

export function serializeToastDemoProps(props: ToastDemoProps) {
  return JSON.stringify({
    children: props.children,
    variant: props.variant,
    placement: props.placement,
    count: props.count,
    actionLabel: props.actionLabel,
    showAction: props.showAction,
    shouldCloseOnAction: props.shouldCloseOnAction,
    autoDismiss: props.autoDismiss,
    timeout: props.timeout,
    "aria-label": props["aria-label"],
  });
}
