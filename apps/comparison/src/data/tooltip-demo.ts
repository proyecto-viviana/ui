import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const tooltipPlacementOptions = ["top", "bottom", "left", "right", "start", "end"] as const;
export const tooltipTriggerOptions = ["hover", "focus"] as const;

export type TooltipDemoPlacement = (typeof tooltipPlacementOptions)[number];
export type TooltipDemoTrigger = (typeof tooltipTriggerOptions)[number];

export interface TooltipDemoProps {
  actionLabel: string;
  children: string;
  placement: TooltipDemoPlacement;
  trigger: TooltipDemoTrigger;
  delay: number;
  isOpen: boolean;
  isDisabled: boolean;
  shouldFlip: boolean;
  shouldCloseOnPress: boolean;
}

export const tooltipDemoDefaults: TooltipDemoProps = {
  actionLabel: "Inspect",
  children: "Tooltip content",
  placement: "top",
  trigger: "hover",
  delay: 0,
  isOpen: false,
  isDisabled: false,
  shouldFlip: true,
  shouldCloseOnPress: true,
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

export function normalizeTooltipDemoProps(
  props: Partial<Record<keyof TooltipDemoProps, unknown>>,
): TooltipDemoProps {
  const placement = String(props.placement ?? "");
  const trigger = String(props.trigger ?? "");

  return {
    actionLabel:
      typeof props.actionLabel === "string" && props.actionLabel.trim()
        ? props.actionLabel
        : tooltipDemoDefaults.actionLabel,
    children:
      typeof props.children === "string" && props.children.trim()
        ? props.children
        : tooltipDemoDefaults.children,
    placement: isOneOf(placement, tooltipPlacementOptions)
      ? placement
      : tooltipDemoDefaults.placement,
    trigger: isOneOf(trigger, tooltipTriggerOptions) ? trigger : tooltipDemoDefaults.trigger,
    delay: numberParam(
      props.delay as string | number | null | undefined,
      tooltipDemoDefaults.delay,
    ),
    isOpen: booleanParam(props.isOpen as string | boolean | number | null | undefined),
    isDisabled: booleanParam(props.isDisabled as string | boolean | number | null | undefined),
    shouldFlip:
      props.shouldFlip == null
        ? tooltipDemoDefaults.shouldFlip
        : booleanParam(props.shouldFlip as string | boolean | number | null | undefined),
    shouldCloseOnPress:
      props.shouldCloseOnPress == null
        ? tooltipDemoDefaults.shouldCloseOnPress
        : booleanParam(props.shouldCloseOnPress as string | boolean | number | null | undefined),
  };
}

export function tooltipDemoPropsFromSearch(search: string): TooltipDemoProps {
  const params = new URLSearchParams(search);

  return normalizeTooltipDemoProps({
    actionLabel: params.get("actionLabel") ?? undefined,
    children: params.get("children") ?? undefined,
    placement: params.get("placement") ?? undefined,
    trigger: params.get("trigger") ?? undefined,
    delay: params.get("delay") ?? undefined,
    isOpen: params.get("isOpen") ?? undefined,
    isDisabled: params.get("isDisabled") ?? undefined,
    shouldFlip: params.has("shouldFlip")
      ? params.get("shouldFlip")
      : tooltipDemoDefaults.shouldFlip,
    shouldCloseOnPress: params.has("shouldCloseOnPress")
      ? params.get("shouldCloseOnPress")
      : tooltipDemoDefaults.shouldCloseOnPress,
  });
}

export function tooltipDemoPropsFromDocument(): TooltipDemoProps | null {
  if (typeof document === "undefined") {
    return null;
  }

  const form = document.querySelector<HTMLFormElement>('[data-comparison-controls="tooltip"]');
  if (!form) {
    return null;
  }

  const data = new FormData(form);
  return normalizeTooltipDemoProps({
    actionLabel: data.get("actionLabel") ?? tooltipDemoDefaults.actionLabel,
    children: data.get("children") ?? tooltipDemoDefaults.children,
    placement: data.get("placement") ?? tooltipDemoDefaults.placement,
    trigger: data.get("trigger") ?? tooltipDemoDefaults.trigger,
    delay: data.get("delay") ?? tooltipDemoDefaults.delay,
    isOpen: data.get("isOpen") === "on",
    isDisabled: data.get("isDisabled") === "on",
    shouldFlip: data.get("shouldFlip") === "on",
    shouldCloseOnPress: data.get("shouldCloseOnPress") === "on",
  });
}

export function isTooltipOpenControlChecked() {
  if (typeof document === "undefined") {
    return false;
  }

  return (
    document.querySelector<HTMLInputElement>(
      '[data-comparison-controls="tooltip"] input[name="isOpen"]',
    )?.checked === true
  );
}

export function tooltipDemoPropsFromWindow(): TooltipDemoProps {
  if (typeof window === "undefined") {
    return tooltipDemoDefaults;
  }

  const formProps = tooltipDemoPropsFromDocument();
  if (formProps) {
    return formProps;
  }

  return tooltipDemoPropsFromSearch(window.location.search);
}

export function serializeTooltipDemoProps(props: TooltipDemoProps) {
  return JSON.stringify({
    actionLabel: props.actionLabel,
    children: props.children,
    placement: props.placement,
    trigger: props.trigger,
    delay: props.delay,
    isOpen: props.isOpen,
    isDisabled: props.isDisabled,
    shouldFlip: props.shouldFlip,
    shouldCloseOnPress: props.shouldCloseOnPress,
  });
}
